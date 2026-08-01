const { getSupabaseAdmin } = require('./_supabase-admin');
const { getFreeBusy, createEventWithMeet } = require('./_google-calendar');

const SLOT_MINUTES = 30;
const TIMEZONE = 'America/Chicago';
const NOTIFY_EMAIL = process.env.NOTIFY_EMAIL || 'joshuaporo@gmail.com';
const FROM_EMAIL = process.env.BOOKING_FROM_EMAIL || 'SermonCraft Pro <demos@sermoncraftpro.com>';

// ============================================================
// Shared helpers
// ============================================================

function zonedTimeToUtc(dateStr, timeStr, timeZone) {
  const [year, month, day] = dateStr.split('-').map(Number);
  const [hour, minute] = timeStr.split(':').map(Number);

  const naiveUtc = new Date(Date.UTC(year, month - 1, day, hour, minute));

  const dtf = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour12: false,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });
  const parts = dtf.formatToParts(naiveUtc).reduce((acc, p) => {
    acc[p.type] = p.value;
    return acc;
  }, {});
  const asUtc = Date.UTC(
    Number(parts.year), Number(parts.month) - 1, Number(parts.day),
    Number(parts.hour), Number(parts.minute), Number(parts.second)
  );
  const offset = asUtc - naiveUtc.getTime();
  return new Date(naiveUtc.getTime() - offset);
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function sendEmail({ to, subject, html }) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from: FROM_EMAIL, to, subject, html }),
  });
  if (!res.ok) {
    console.error('Resend error:', await res.text());
  }
}

// ============================================================
// GET /api/booking?date=YYYY-MM-DD  → available slots
// ============================================================
async function handleAvailability(req, res) {
  const { date } = req.query;
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return res.status(400).json({ error: 'Invalid or missing date (expected YYYY-MM-DD)' });
  }

  try {
    const supabase = getSupabaseAdmin();
    const dow = new Date(`${date}T12:00:00Z`).getUTCDay();

    const { data: windows, error } = await supabase
      .from('booking_availability')
      .select('start_time, end_time')
      .eq('day_of_week', dow)
      .eq('is_active', true);

    if (error) throw error;
    if (!windows || windows.length === 0) {
      return res.status(200).json({ slots: [] });
    }

    const candidates = [];
    for (const w of windows) {
      let cursor = zonedTimeToUtc(date, w.start_time.slice(0, 5), TIMEZONE);
      const end = zonedTimeToUtc(date, w.end_time.slice(0, 5), TIMEZONE);
      while (cursor.getTime() + SLOT_MINUTES * 60000 <= end.getTime()) {
        candidates.push(new Date(cursor));
        cursor = new Date(cursor.getTime() + SLOT_MINUTES * 60000);
      }
    }
    if (candidates.length === 0) {
      return res.status(200).json({ slots: [] });
    }

    const now = new Date();
    const futureCandidates = candidates.filter((c) => c.getTime() > now.getTime());
    if (futureCandidates.length === 0) {
      return res.status(200).json({ slots: [] });
    }

    const dayStart = futureCandidates[0];
    const dayEnd = new Date(candidates[candidates.length - 1].getTime() + SLOT_MINUTES * 60000);
    const busy = await getFreeBusy(dayStart.toISOString(), dayEnd.toISOString());

    const isFree = (slotStart, slotEnd) =>
      !busy.some((b) => {
        const busyStart = new Date(b.start).getTime();
        const busyEnd = new Date(b.end).getTime();
        return slotStart.getTime() < busyEnd && slotEnd.getTime() > busyStart;
      });

    const { data: existing } = await supabase
      .from('demo_bookings')
      .select('scheduled_at, duration_minutes')
      .in('status', ['upcoming', 'rescheduled'])
      .gte('scheduled_at', dayStart.toISOString())
      .lte('scheduled_at', dayEnd.toISOString());

    const slots = futureCandidates
      .filter((slotStart) => {
        const slotEnd = new Date(slotStart.getTime() + SLOT_MINUTES * 60000);
        if (!isFree(slotStart, slotEnd)) return false;
        const clashes = (existing || []).some((b) => {
          const bStart = new Date(b.scheduled_at).getTime();
          const bEnd = bStart + (b.duration_minutes || SLOT_MINUTES) * 60000;
          return slotStart.getTime() < bEnd && slotEnd.getTime() > bStart;
        });
        return !clashes;
      })
      .map((slotStart) => ({
        startISO: slotStart.toISOString(),
        label: slotStart.toLocaleTimeString('en-US', {
          hour: 'numeric', minute: '2-digit', timeZone: TIMEZONE,
        }),
      }));

    return res.status(200).json({ slots, timezone: TIMEZONE });
  } catch (err) {
    console.error('availability error:', err);
    return res.status(500).json({ error: 'Failed to load availability' });
  }
}

// ============================================================
// POST /api/booking  → create a demo booking
// ============================================================
async function handleBookDemo(req, res) {
  const {
    name, email, phone, churchName, role, churchSize, challenge, startISO,
  } = req.body || {};

  if (!name || !email || !churchName || !role || !startISO) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  if (!isValidEmail(email)) {
    return res.status(400).json({ error: 'Invalid email address' });
  }

  const slotStart = new Date(startISO);
  if (isNaN(slotStart.getTime()) || slotStart.getTime() < Date.now()) {
    return res.status(400).json({ error: 'Invalid or past time slot' });
  }
  const slotEnd = new Date(slotStart.getTime() + SLOT_MINUTES * 60000);

  const supabase = getSupabaseAdmin();

  try {
    const { data: clash } = await supabase
      .from('demo_bookings')
      .select('id')
      .in('status', ['upcoming', 'rescheduled'])
      .eq('scheduled_at', slotStart.toISOString())
      .maybeSingle();

    if (clash) {
      return res.status(409).json({ error: 'That slot was just booked. Please pick another time.' });
    }

    let meetLink = null;
    let eventId = null;
    try {
      const event = await createEventWithMeet({
        summary: `SCP Demo: ${churchName} (${name})`,
        description: `Role: ${role}\nChurch size: ${churchSize || 'n/a'}\nBiggest challenge: ${challenge || 'n/a'}\nPhone: ${phone || 'n/a'}`,
        startISO: slotStart.toISOString(),
        endISO: slotEnd.toISOString(),
        attendeeEmail: email,
      });
      meetLink = event.meetLink;
      eventId = event.eventId;
    } catch (calErr) {
      console.error('Calendar event creation failed, continuing without meet link:', calErr);
    }

    const { data: booking, error: insertError } = await supabase
      .from('demo_bookings')
      .insert({
        name,
        email,
        phone: phone || null,
        church_name: churchName,
        role,
        church_size: churchSize || null,
        challenge: challenge || null,
        scheduled_at: slotStart.toISOString(),
        duration_minutes: SLOT_MINUTES,
        meeting_link: meetLink,
        google_calendar_event_id: eventId,
        status: 'upcoming',
      })
      .select()
      .single();

    if (insertError) throw insertError;

    const displayTime = slotStart.toLocaleString('en-US', {
      weekday: 'long', month: 'long', day: 'numeric',
      hour: 'numeric', minute: '2-digit', timeZone: 'America/Chicago',
      timeZoneName: 'short',
    });

    await sendEmail({
      to: email,
      subject: `Demo confirmed: SermonCraft Pro x ${churchName}`,
      html: `
        <p>Hi ${name},</p>
        <p>Your SermonCraft Pro demo is confirmed for <strong>${displayTime}</strong>.</p>
        ${meetLink ? `<p>Join here: <a href="${meetLink}">${meetLink}</a></p>` : '<p>A meeting link will follow shortly.</p>'}
        <p>Looking forward to showing you around.</p>
        <p>— SermonCraft Pro</p>
      `,
    });

    await sendEmail({
      to: NOTIFY_EMAIL,
      subject: `New demo booked: ${churchName} (${name})`,
      html: `
        <p><strong>${name}</strong> (${role}) at <strong>${churchName}</strong> booked a demo.</p>
        <ul>
          <li>Time: ${displayTime}</li>
          <li>Email: ${email}</li>
          <li>Phone: ${phone || 'n/a'}</li>
          <li>Church size: ${churchSize || 'n/a'}</li>
          <li>Biggest challenge: ${challenge || 'n/a'}</li>
          ${meetLink ? `<li>Meet link: <a href="${meetLink}">${meetLink}</a></li>` : ''}
        </ul>
      `,
    });

    return res.status(200).json({ booking, meetLink });
  } catch (err) {
    console.error('book-demo error:', err);
    return res.status(500).json({ error: 'Failed to create booking' });
  }
}

// ============================================================
// CORS — allow the marketing site (different subdomain) to call this API
// ============================================================
const ALLOWED_ORIGINS = [
  'https://sermoncraftpro.com',
  'https://www.sermoncraftpro.com',
];

function applyCors(req, res) {
  const origin = req.headers.origin;
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

// ============================================================
// Router
// ============================================================
module.exports = async (req, res) => {
  applyCors(req, res);

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  if (req.method === 'GET') return handleAvailability(req, res);
  if (req.method === 'POST') return handleBookDemo(req, res);
  return res.status(405).json({ error: 'Method not allowed' });
};
