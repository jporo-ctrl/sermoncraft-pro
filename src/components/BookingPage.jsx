import { useState, useEffect } from 'react';

const ROLES = ['Lead Pastor', 'Youth Pastor', 'Student Pastor', 'Worship Pastor', 'Executive Pastor', 'Other'];
const CHURCH_SIZES = ['Under 100', '100-300', '300-750', '750-2000', '2000+'];

function nextNDays(n) {
  const days = [];
  const d = new Date();
  for (let i = 0; days.length < n; i++) {
    const cand = new Date(d);
    cand.setDate(d.getDate() + i);
    days.push(cand);
  }
  return days;
}

function toDateStr(d) {
  return d.toISOString().slice(0, 10);
}

export default function BookingPage() {
  const [step, setStep] = useState(1); // 1 = pick date/time, 2 = details, 3 = confirmed
  const [selectedDate, setSelectedDate] = useState(null);
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [confirmation, setConfirmation] = useState(null);

  const [form, setForm] = useState({
    name: '', email: '', phone: '', churchName: '', role: '', churchSize: '', challenge: '',
  });

  const days = nextNDays(14);

  useEffect(() => {
    if (!selectedDate) return;
    setLoadingSlots(true);
    setSelectedSlot(null);
    fetch(`/api/booking?date=${toDateStr(selectedDate)}`)
      .then((r) => r.json())
      .then((data) => setSlots(data.slots || []))
      .catch(() => setSlots([]))
      .finally(() => setLoadingSlots(false));
  }, [selectedDate]);

  function updateForm(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function submitBooking(e) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, startISO: selectedSlot.startISO }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Something went wrong. Please try again.');
        if (res.status === 409) {
          setStep(1);
          setSelectedSlot(null);
        }
        return;
      }
      setConfirmation(data);
      setStep(3);
    } catch {
      setError('Network error — please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-2">Book a SermonCraft Pro Demo</h1>
      <p className="text-gray-600 mb-8">30 minutes — see how SCP can save your team hours every week.</p>

      {step === 1 && (
        <div>
          <h2 className="font-semibold mb-3">Pick a date</h2>
          <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 mb-8">
            {days.map((d) => {
              const isWeekend = d.getDay() === 0 || d.getDay() === 6;
              const active = selectedDate && toDateStr(selectedDate) === toDateStr(d);
              return (
                <button
                  key={toDateStr(d)}
                  disabled={isWeekend}
                  onClick={() => setSelectedDate(d)}
                  className={`rounded-lg border px-2 py-3 text-sm text-center transition
                    ${isWeekend ? 'opacity-30 cursor-not-allowed' : 'hover:border-black'}
                    ${active ? 'bg-black text-white border-black' : 'border-gray-300'}`}
                >
                  <div className="text-xs">{d.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                  <div className="font-semibold">{d.getDate()}</div>
                </button>
              );
            })}
          </div>

          {selectedDate && (
            <div>
              <h2 className="font-semibold mb-3">Pick a time (Central)</h2>
              {loadingSlots && <p className="text-gray-500">Loading available times…</p>}
              {!loadingSlots && slots.length === 0 && (
                <p className="text-gray-500">No open slots that day — try another date.</p>
              )}
              <div className="grid grid-cols-3 gap-2">
                {slots.map((s) => (
                  <button
                    key={s.startISO}
                    onClick={() => setSelectedSlot(s)}
                    className={`rounded-lg border px-3 py-2 text-sm
                      ${selectedSlot?.startISO === s.startISO ? 'bg-black text-white border-black' : 'border-gray-300 hover:border-black'}`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>

              {selectedSlot && (
                <button
                  onClick={() => setStep(2)}
                  className="mt-8 w-full rounded-lg bg-black text-white py-3 font-semibold"
                >
                  Continue
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {step === 2 && (
        <form onSubmit={submitBooking} className="space-y-4">
          <p className="text-sm text-gray-600 mb-4">
            {selectedDate?.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} at {selectedSlot?.label} CT
            {' '}
            <button type="button" className="underline" onClick={() => setStep(1)}>change</button>
          </p>

          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input required className="w-full border rounded-lg px-3 py-2" value={form.name}
              onChange={(e) => updateForm('name', e.target.value)} />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Church</label>
            <input required className="w-full border rounded-lg px-3 py-2" value={form.churchName}
              onChange={(e) => updateForm('churchName', e.target.value)} />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Role</label>
            <select required className="w-full border rounded-lg px-3 py-2" value={form.role}
              onChange={(e) => updateForm('role', e.target.value)}>
              <option value="">Select…</option>
              {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input required type="email" className="w-full border rounded-lg px-3 py-2" value={form.email}
              onChange={(e) => updateForm('email', e.target.value)} />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Phone</label>
            <input className="w-full border rounded-lg px-3 py-2" value={form.phone}
              onChange={(e) => updateForm('phone', e.target.value)} />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Church size</label>
            <select className="w-full border rounded-lg px-3 py-2" value={form.churchSize}
              onChange={(e) => updateForm('churchSize', e.target.value)}>
              <option value="">Select…</option>
              {CHURCH_SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Biggest ministry challenge (optional)</label>
            <textarea className="w-full border rounded-lg px-3 py-2" rows={3} value={form.challenge}
              onChange={(e) => updateForm('challenge', e.target.value)} />
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <button disabled={submitting} type="submit"
            className="w-full rounded-lg bg-black text-white py-3 font-semibold disabled:opacity-50">
            {submitting ? 'Booking…' : 'Book Demo'}
          </button>
        </form>
      )}

      {step === 3 && confirmation && (
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-2">You're booked!</h2>
          <p className="text-gray-600 mb-4">
            {selectedDate?.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} at {selectedSlot?.label} CT
          </p>
          {confirmation.meetLink && (
            <a href={confirmation.meetLink} className="inline-block mt-2 underline text-blue-600">
              {confirmation.meetLink}
            </a>
          )}
          <p className="text-sm text-gray-500 mt-6">A confirmation email is on its way to {form.email}.</p>
        </div>
      )}
    </div>
  );
}
