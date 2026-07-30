// Shared helper — Google Calendar access via refresh token.
// No googleapis package needed; plain fetch calls keep this light
// and avoids bloating the Vercel function bundle.

async function getAccessToken() {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
      grant_type: 'refresh_token',
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to refresh Google access token: ${errText}`);
  }

  const data = await res.json();
  return data.access_token;
}

// Returns array of { start, end } busy blocks (ISO strings) between timeMin/timeMax
async function getFreeBusy(timeMin, timeMax) {
  const accessToken = await getAccessToken();
  const calendarId = process.env.GOOGLE_CALENDAR_ID || 'primary';

  const res = await fetch('https://www.googleapis.com/calendar/v3/freeBusy', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      timeMin,
      timeMax,
      items: [{ id: calendarId }],
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`freeBusy query failed: ${errText}`);
  }

  const data = await res.json();
  return data.calendars[calendarId]?.busy || [];
}

// Creates a calendar event with a Google Meet link and invites the attendee.
// Returns { eventId, meetLink }
async function createEventWithMeet({ summary, description, startISO, endISO, attendeeEmail }) {
  const accessToken = await getAccessToken();
  const calendarId = process.env.GOOGLE_CALENDAR_ID || 'primary';

  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(
      calendarId
    )}/events?conferenceDataVersion=1&sendUpdates=all`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        summary,
        description,
        start: { dateTime: startISO },
        end: { dateTime: endISO },
        attendees: [{ email: attendeeEmail }],
        conferenceData: {
          createRequest: {
            requestId: `scp-${Date.now()}`,
            conferenceSolutionKey: { type: 'hangoutsMeet' },
          },
        },
      }),
    }
  );

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Calendar event creation failed: ${errText}`);
  }

  const data = await res.json();
  const meetLink =
    data.hangoutLink ||
    data.conferenceData?.entryPoints?.find((e) => e.entryPointType === 'video')?.uri ||
    null;

  return { eventId: data.id, meetLink };
}

module.exports = { getAccessToken, getFreeBusy, createEventWithMeet };
