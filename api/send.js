// /api/send.js — Consolidated email sending (devotional + referral)

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "Email service not configured" });

  const { type } = req.body;

  // ── DEVOTIONAL EMAIL ───────────────────────────────────────────────────────
  if (type === "devotional") {
    const { emails, devotional, sermonTitle, pastorName, churchName } = req.body;

    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return res.status(400).json({ error: "No email addresses provided" });
    }
    if (!devotional) return res.status(400).json({ error: "No devotional content" });

    var devotionalHtml = devotional
      .split("\n")
      .map(function(line) {
        var trimmed = line.trim();
        if (!trimmed) return "<br/>";
        if (trimmed.match(/^Day \d/i)) return "<h3 style='color:#B8860B;margin-top:24px'>" + trimmed + "</h3>";
        return "<p style='margin:8px 0;line-height:1.7'>" + trimmed + "</p>";
      })
      .join("");

    var htmlBody = `<!DOCTYPE html><html><head><meta charset="UTF-8"/></head><body style="font-family:Georgia,serif;background:#FDFAF5;margin:0;padding:0">
      <div style="max-width:560px;margin:40px auto;background:#fff;border:1px solid #E8DCC8;border-radius:12px;overflow:hidden">
        <div style="background:#2C2416;padding:28px 32px">
          <div style="font-size:22px;color:#B8860B;margin-bottom:6px">✝</div>
          <div style="font-size:20px;font-weight:700;color:#fff">${sermonTitle || "This Week's Devotional"}</div>
          <div style="font-size:13px;color:#A89070;margin-top:4px">${churchName || ""}</div>
        </div>
        <div style="padding:28px 32px">
          <p style="font-size:15px;color:#2C2416;margin:0 0 20px">Dear friend,</p>
          ${devotionalHtml}
          <p style="font-size:14px;color:#8B7355;margin-top:24px">Grace and peace,<br/><strong>${pastorName || "Your Pastor"}</strong></p>
        </div>
        <div style="padding:16px 32px;border-top:1px solid #E8DCC8;text-align:center">
          <p style="font-size:11px;color:#A89070;margin:0">Sent via SermonCraft Pro · sermoncraftpro.com</p>
        </div>
      </div>
    </body></html>`;

    var failures = [];
    for (var email of emails.slice(0, 50)) {
      try {
        var resp = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: { "Authorization": "Bearer " + apiKey, "Content-Type": "application/json" },
          body: JSON.stringify({
            from: "SermonCraft Pro <noreply@sermoncraftpro.com>",
            to: [email.trim()],
            subject: (sermonTitle ? sermonTitle + " — " : "") + "Your " + (devotional.match(/Day 7/i) ? "7" : "3") + "-Day Devotional",
            html: htmlBody,
          }),
        });
        if (!resp.ok) failures.push(email);
      } catch (e) {
        failures.push(email);
      }
    }

    return res.status(200).json({
      success: true,
      sent: emails.length - failures.length,
      failed: failures.length,
    });
  }

  // ── REFERRAL EMAIL ─────────────────────────────────────────────────────────
  if (type === "referral") {
    const { to, senderName, referralLink } = req.body;
    if (!to || !referralLink) return res.status(400).json({ error: "Missing required fields" });

    var html = `<!DOCTYPE html><html><head><meta charset="UTF-8"/><style>
      body{font-family:Georgia,serif;background:#FDFAF5;margin:0;padding:0}
      .wrap{max-width:560px;margin:40px auto;background:#fff;border:1px solid #E8DCC8;border-radius:12px;overflow:hidden}
      .header{background:#2C2416;padding:32px;text-align:center}
      .header h1{font-size:22px;color:#fff;margin:10px 0 0}
      .body{padding:32px}
      .body p{font-size:15px;line-height:1.7;color:#2C2416;margin:0 0 16px}
      .features{background:#FAF7F2;border-radius:8px;padding:20px;margin:20px 0}
      .features li{font-size:14px;color:#2C2416;margin-bottom:8px;line-height:1.5}
      .cta{display:block;background:#B8860B;color:#fff;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:15px;font-weight:700;text-align:center;margin:24px 0}
      .discount{background:#F5E6C8;border:1px solid #E8C87A;border-radius:8px;padding:16px;text-align:center;margin:16px 0}
      .footer{padding:20px 32px;border-top:1px solid #E8DCC8;text-align:center}
      .footer p{font-size:12px;color:#A89070;margin:0}
    </style></head><body><div class="wrap">
      <div class="header"><div style="font-size:28px;color:#B8860B">✝</div><h1>SermonCraft Pro</h1></div>
      <div class="body">
        <p>Hi,</p>
        <p>${senderName} thought you'd love SermonCraft Pro — the AI-powered ministry platform built specifically for pastors.</p>
        <div class="features"><ul>
          <li>✝ Generate complete sermon manuscripts in minutes</li>
          <li>✝ AI Pastor Poro — real-time voice theological advisor</li>
          <li>✝ Sermon Delivery Coach — scored feedback on your preaching</li>
          <li>✝ Series Planner, Word Study, Bible Commentary</li>
          <li>✝ Content Multiplier — one sermon into a week of content</li>
          <li>✝ Supports 11 languages</li>
        </ul></div>
        <div class="discount"><p>You've been invited with a referral link</p><strong style="font-size:18px;color:#B8860B;display:block;margin-top:4px">20% off your first month</strong></div>
        <a href="${referralLink}" class="cta">Start Free — No Credit Card Required</a>
        <p style="font-size:13px;color:#8B7355">Or copy: <a href="${referralLink}" style="color:#B8860B">${referralLink}</a></p>
      </div>
      <div class="footer"><p>SermonCraft Pro · sermoncraftpro.com</p></div>
    </div></body></html>`;

    try {
      var r = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { "Authorization": "Bearer " + apiKey, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: "SermonCraft Pro <noreply@sermoncraftpro.com>",
          to: [to],
          subject: senderName + " invited you to SermonCraft Pro — 20% off your first month",
          html: html,
        }),
      });
      var data = await r.json();
      if (!r.ok) return res.status(r.status).json({ error: data.message || "Failed to send" });
      return res.status(200).json({ success: true });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  // ── TICKET REPLY EMAIL ─────────────────────────────────────────────────────
  if (type === "ticket_reply") {
    const { to, ticketSubject, message } = req.body;
    if (!to || !message) return res.status(400).json({ error: "Missing required fields" });

    var html = `<!DOCTYPE html><html><head><meta charset="UTF-8"/></head><body style="font-family:Georgia,serif;background:#FDFAF5;margin:0;padding:0">
      <div style="max-width:540px;margin:40px auto;background:#fff;border:1px solid #E8DCC8;border-radius:12px;overflow:hidden">
        <div style="background:#2C2416;padding:28px 32px">
          <div style="font-size:22px;color:#B8860B">✝</div>
          <div style="font-size:20px;font-weight:700;color:#fff;margin-top:6px">SermonCraft Pro</div>
          <div style="font-size:13px;color:#A89070;margin-top:4px">Support Team</div>
        </div>
        <div style="padding:28px 32px">
          <h2 style="color:#2C2416;font-size:16px;margin:0 0 8px">New reply to your support ticket</h2>
          <p style="color:#8B7355;font-size:13px;margin:0 0 20px">Ticket: <strong>${ticketSubject}</strong></p>
          <div style="background:#FAF7F2;border-left:4px solid #B8860B;padding:16px;border-radius:8px;margin-bottom:24px">
            <p style="color:#2C2416;font-size:14px;line-height:1.6;margin:0;white-space:pre-wrap">${message}</p>
          </div>
          <a href="https://app.sermoncraftpro.com" style="display:inline-block;background:#B8860B;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:700;font-size:14px">Open SermonCraft Pro</a>
        </div>
        <div style="padding:16px 32px;border-top:1px solid #E8DCC8;text-align:center">
          <p style="font-size:11px;color:#A89070;margin:0">SermonCraft Pro · sermoncraftpro.com</p>
        </div>
      </div>
    </body></html>`;

    try {
      var tr = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { "Authorization": "Bearer " + apiKey, "Content-Type": "application/json" },
        body: JSON.stringify({ from: "SermonCraft Pro <noreply@sermoncraftpro.com>", to: [to], subject: "SermonCraft Pro Support: New reply to your ticket", html }),
      });
      if (!tr.ok) return res.status(tr.status).json({ error: "Failed to send" });
      return res.status(200).json({ success: true });
    } catch(e) { return res.status(500).json({ error: e.message }); }
  }

  // ── NEW TICKET NOTIFICATION ─────────────────────────────────────────────────
  if (type === "new_ticket") {
    const { subject, message, userName, userEmail, priority } = req.body;
    var html2 = `<!DOCTYPE html><html><head><meta charset="UTF-8"/></head><body style="font-family:Georgia,serif;background:#FDFAF5;margin:0;padding:0">
      <div style="max-width:540px;margin:40px auto;background:#fff;border:1px solid #E8DCC8;border-radius:12px;overflow:hidden">
        <div style="background:#2C2416;padding:28px 32px">
          <div style="font-size:20px;font-weight:700;color:#fff">New Support Ticket</div>
          <div style="font-size:13px;color:#A89070;margin-top:4px">SermonCraft Pro</div>
        </div>
        <div style="padding:28px 32px">
          <p style="color:#2C2416;font-size:14px;margin:0 0 8px"><strong>From:</strong> ${userName} (${userEmail})</p>
          <p style="color:#2C2416;font-size:14px;margin:0 0 8px"><strong>Subject:</strong> ${subject}</p>
          <p style="color:#2C2416;font-size:14px;margin:0 0 20px"><strong>Priority:</strong> ${priority}</p>
          <div style="background:#FAF7F2;border-left:4px solid #B8860B;padding:16px;border-radius:8px;margin-bottom:24px">
            <p style="color:#2C2416;font-size:14px;line-height:1.6;margin:0;white-space:pre-wrap">${message}</p>
          </div>
          <a href="https://app.sermoncraftpro.com" style="display:inline-block;background:#B8860B;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:700;font-size:14px;font-family:Georgia,serif">Open SermonCraft Pro</a>
        </div>
        <div style="padding:16px 32px;border-top:1px solid #E8DCC8;text-align:center">
          <p style="font-size:11px;color:#A89070;margin:0">SermonCraft Pro · sermoncraftpro.com</p>
        </div>
      </div>
    </body></html>`;

    try {
      var nt = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { "Authorization": "Bearer " + apiKey, "Content-Type": "application/json" },
        body: JSON.stringify({ from: "SermonCraft Pro <noreply@sermoncraftpro.com>", to: ["joshuaporo@gmail.com"], subject: "New SCP Support Ticket: " + subject, html: html2 }),
      });
      if (!nt.ok) return res.status(nt.status).json({ error: "Failed to send" });
      return res.status(200).json({ success: true });
    } catch(e) { return res.status(500).json({ error: e.message }); }
  }

  return res.status(400).json({ error: "Unknown email type: " + type });
}
