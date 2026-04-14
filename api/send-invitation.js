import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { email, churchName, invitedByName } = req.body;

    if (!email) return res.status(400).json({ error: "Email is required." });

    const { data, error } = await resend.emails.send({
      from: "SermonCraft Pro <noreply@sermoncraftpro.com>",
      to: email,
      subject: "You've been invited to join " + churchName + " on SermonCraft Pro",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin:0;padding:0;background-color:#FDFAF5;font-family:'Georgia','Times New Roman',serif;">
          <div style="max-width:560px;margin:40px auto;background:#fff;border:1px solid #E8DCC8;border-radius:16px;overflow:hidden;">

            <div style="background:#1c1608;padding:32px;text-align:center;">
              <div style="font-size:36px;margin-bottom:8px;">✝</div>
              <div style="color:#D4A017;font-size:20px;font-weight:700;letter-spacing:0.04em;">SermonCraft Pro</div>
            </div>

            <div style="padding:36px 40px;">
              <div style="font-size:22px;font-weight:700;color:#2C2416;margin-bottom:12px;">
                You've been invited!
              </div>

              <div style="font-size:15px;color:#8B7355;line-height:1.7;margin-bottom:24px;">
                <strong style="color:#2C2416;">${invitedByName || "A church admin"}</strong> has invited you to join
                <strong style="color:#2C2416;">${churchName}</strong> on SermonCraft Pro —
                the AI-powered ministry platform for sermon generation, biblical word studies, and more.
              </div>

              <div style="background:#F7F1E8;border-radius:12px;padding:20px 24px;margin-bottom:28px;">
                <div style="font-size:13px;font-weight:700;color:#8B7355;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:8px;">
                  To accept your invitation:
                </div>
                <ol style="margin:0;padding-left:20px;color:#2C2416;font-size:14px;line-height:1.8;">
                  <li>Go to <strong>sermoncraftpro.com</strong></li>
                  <li>Create an account using <strong>${email}</strong></li>
                  <li>You'll see a prompt to join <strong>${churchName}</strong></li>
                  <li>Click <strong>Join Church</strong> to accept</li>
                </ol>
              </div>

              <div style="text-align:center;">
                <a href="https://sermoncraftpro.com"
                   style="display:inline-block;background:#B8860B;color:#fff;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:15px;font-weight:700;letter-spacing:0.02em;">
                  Accept Invitation
                </a>
              </div>

              <div style="margin-top:32px;padding-top:24px;border-top:1px solid #E8DCC8;font-size:12px;color:#A89070;text-align:center;line-height:1.6;">
                This invitation was sent to ${email}.<br>
                If you did not expect this invitation, you can safely ignore this email.<br><br>
                <strong style="color:#8B7355;">SermonCraft Pro</strong> · sermoncraftpro.com
              </div>
            </div>

          </div>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error("Resend error:", error);
      return res.status(500).json({ error: error.message, detail: error });
    }

    console.log("Email sent successfully:", data);
    return res.status(200).json({ success: true, id: data?.id });

  } catch (err) {
    console.error("Send invitation error:", err);
    return res.status(500).json({ error: err.message });
  }
}