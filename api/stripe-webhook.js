// /api/stripe-webhook.js — Handle Stripe events including referral rewards

import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const config = { api: { bodyParser: false } };

// Plan key from Stripe price ID
const PRICE_TO_PLAN = {
  // New plan IDs
  "price_1THx2eB0WpRalfPpcei2tGcy": "student",
  "price_1THx39B0WpRalfPpnEXguRNv": "student",
  "price_1THx3YB0WpRalfPp3AHawEsh": "solo",
  "price_1THx3uB0WpRalfPp7x9oVCwR": "solo",
  "price_1THx4EB0WpRalfPpPZ354rYw": "pastor",
  "price_1THx4fB0WpRalfPpJVlJB7eg": "pastor",
  "price_1THx5DB0WpRalfPpU2yjcvJW": "church",
  "price_1THx5fB0WpRalfPpSwLgJgIw": "church",
  "price_1THx61B0WpRalfPp3I5dtAg8": "bible_college",
  "price_1THx6MB0WpRalfPpgNpNWVda": "bible_college",
  // Legacy plan IDs — kept so existing subscribers don't break
  "price_1TGAHiB0WpRalfPp7UXaWyFk": "solo",
  "price_1TGAIkB0WpRalfPpfMajPdA3": "solo",
  "price_1TGAJSB0WpRalfPpClP4DzF2": "pastor",
  "price_1TGAJoB0WpRalfPpZDJyIfVF": "pastor",
  "price_1TGAKKB0WpRalfPpthJ7QuYi": "church",
  "price_1TGALvB0WpRalfPpE1fBkbc1": "church",
  "price_1TGAKoB0WpRalfPpG2MZz6AX": "bible_college",
  "price_1TGALDB0WpRalfPpz72j94jd": "bible_college",
  "price_1TGAMgB0WpRalfPpEV72WVFt": "bible_college",
};

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const sig = req.headers["stripe-signature"];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  const chunks = [];
  await new Promise(function(resolve, reject) {
    req.on("data", function(c) { chunks.push(c); });
    req.on("end", resolve);
    req.on("error", reject);
  });
  const rawBody = Buffer.concat(chunks);

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err) {
    console.error("Webhook signature error:", err.message);
    return res.status(400).json({ error: "Invalid signature" });
  }

  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );

  try {
    // ── CHECKOUT COMPLETED ─────────────────────────────────────────────────
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const userId = session.metadata?.userId;
      const planKey = session.metadata?.planKey;

      if (!userId) return res.status(200).json({ received: true });

      // Determine plan from planKey or from line items
      let plan = planKey ? planKey.replace("_monthly", "").replace("_annual", "") : null;

      // Update user plan in Supabase
      if (plan) {
        await supabase.from("users").update({ plan, stripe_customer_id: session.customer }).eq("id", userId);
      }

      // ── REFERRAL REWARD ──────────────────────────────────────────────────
      // Check if this user was referred
      const { data: referral } = await supabase
        .from("referrals")
        .select("*")
        .eq("referred_user_id", userId)
        .eq("status", "pending")
        .single();

      if (referral) {
        // Mark referral as rewarded
        await supabase.from("referrals").update({ status: "rewarded", rewarded_at: new Date().toISOString() }).eq("id", referral.id);

        // Grant the referrer a free month — extend their next_billing_date by 30 days
        // Get referrer's Stripe customer ID
        const { data: referrer } = await supabase.from("users").select("stripe_customer_id, plan").eq("id", referral.referrer_user_id).single();

        if (referrer?.stripe_customer_id) {
          try {
            // Get active subscription
            const subs = await stripe.subscriptions.list({ customer: referrer.stripe_customer_id, status: "active", limit: 1 });
            if (subs.data.length > 0) {
              const sub = subs.data[0];
              // Add a 30-day trial extension by creating a credit
              await stripe.subscriptions.update(sub.id, {
                trial_end: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60),
              });
              console.log("Referral reward granted to:", referral.referrer_user_id);
            }
          } catch (rewardErr) {
            console.error("Could not grant referral reward:", rewardErr.message);
          }
        }

        // Send notification email to referrer via Resend
        try {
          const { data: referrerUser } = await supabase.from("users").select("email, name").eq("id", referral.referrer_user_id).single();
          if (referrerUser?.email) {
            await fetch("https://api.resend.com/emails", {
              method: "POST",
              headers: { "Authorization": "Bearer " + process.env.RESEND_API_KEY, "Content-Type": "application/json" },
              body: JSON.stringify({
                from: "SermonCraft Pro <noreply@sermoncraftpro.com>",
                to: [referrerUser.email],
                subject: "🎉 You earned a free month on SermonCraft Pro!",
                html: `<div style="font-family:Georgia,serif;max-width:480px;margin:40px auto;padding:32px;background:#fff;border:1px solid #E8DCC8;border-radius:12px">
                  <div style="font-size:24px;color:#B8860B;margin-bottom:12px">✝</div>
                  <h2 style="color:#2C2416;margin:0 0 12px">You earned a free month!</h2>
                  <p style="color:#8B7355;line-height:1.7">A pastor you referred just subscribed to SermonCraft Pro. As promised, we've added a free month to your account.</p>
                  <p style="color:#8B7355;line-height:1.7">Thank you for spreading the word. Keep sharing your referral link — every subscription you generate earns you another free month.</p>
                  <p style="color:#8B7355;margin-top:24px">Grace and peace,<br/><strong style="color:#2C2416">SermonCraft Pro</strong></p>
                </div>`,
              }),
            });
          }
        } catch (emailErr) {
          console.error("Referral notification email failed:", emailErr.message);
        }
      }
    }

    // ── SUBSCRIPTION UPDATED ───────────────────────────────────────────────
    if (event.type === "customer.subscription.updated" || event.type === "customer.subscription.deleted") {
      const subscription = event.data.object;
      const customerId = subscription.customer;

      const { data: user } = await supabase.from("users").select("id").eq("stripe_customer_id", customerId).single();
      if (!user) return res.status(200).json({ received: true });

      if (event.type === "customer.subscription.deleted") {
        await supabase.from("users").update({ plan: "free" }).eq("id", user.id);
      } else {
        const priceId = subscription.items?.data?.[0]?.price?.id;
        const plan = PRICE_TO_PLAN[priceId];
        if (plan) {
          await supabase.from("users").update({ plan }).eq("id", user.id);
        }
      }
    }

    // ── TRIAL WILL END REMINDER (3 days before) ────────────────────────────
    if (event.type === "customer.subscription.trial_will_end") {
      const subscription = event.data.object;
      const customerId = subscription.customer;
      const trialEnd = new Date(subscription.trial_end * 1000).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

      const { data: user } = await supabase.from("users").select("id, email, name, plan").eq("stripe_customer_id", customerId).single();
      if (user?.email) {
        try {
          await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: { "Authorization": "Bearer " + process.env.RESEND_API_KEY, "Content-Type": "application/json" },
            body: JSON.stringify({
              from: "SermonCraft Pro <noreply@sermoncraftpro.com>",
              to: [user.email],
              subject: "Your SermonCraft Pro trial ends in 3 days",
              html: `<div style="font-family:Georgia,serif;max-width:480px;margin:40px auto;padding:32px;background:#fff;border:1px solid #E8DCC8;border-radius:12px">
                <div style="font-size:24px;color:#B8860B;margin-bottom:12px">✝</div>
                <h2 style="color:#2C2416;margin:0 0 12px">Your trial ends on ${trialEnd}</h2>
                <p style="color:#8B7355;line-height:1.7">Your SermonCraft Pro trial is ending soon. After ${trialEnd}, you'll be charged for your selected plan and keep full access.</p>
                <p style="color:#8B7355;line-height:1.7">If you'd like to cancel before being charged, you can do so from <strong>Settings → Billing</strong> inside the app.</p>
                <a href="https://app.sermoncraftpro.com" style="display:inline-block;margin-top:20px;padding:12px 24px;background:#B8860B;color:#fff;border-radius:8px;text-decoration:none;font-weight:bold;">Open SermonCraft Pro</a>
                <p style="color:#8B7355;margin-top:24px">Grace and peace,<br/><strong style="color:#2C2416">SermonCraft Pro</strong></p>
              </div>`,
            }),
          });
        } catch (emailErr) {
          console.error("Trial reminder email failed:", emailErr.message);
        }
      }
    }

    // ── TRIAL ENDED WITHOUT PAYMENT / INVOICE FAILED ───────────────────────
    if (event.type === "invoice.payment_failed") {
      const invoice = event.data.object;
      const customerId = invoice.customer;

      const { data: user } = await supabase.from("users").select("id, email, full_name").eq("stripe_customer_id", customerId).single();
      if (!user) return res.status(200).json({ received: true });

      // Downgrade to free
      await supabase.from("users").update({ plan: "free" }).eq("id", user.id);
      console.log("Downgraded to free after payment failure:", user.id);

      // Send downgrade email
      if (user.email) {
        try {
          await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: { "Authorization": "Bearer " + process.env.RESEND_API_KEY, "Content-Type": "application/json" },
            body: JSON.stringify({
              from: "SermonCraft Pro <noreply@sermoncraftpro.com>",
              to: [user.email],
              subject: "Your SermonCraft Pro account has been downgraded",
              html: `<div style="font-family:Georgia,serif;max-width:480px;margin:40px auto;padding:32px;background:#fff;border:1px solid #E8DCC8;border-radius:12px">
                <div style="font-size:24px;color:#B8860B;margin-bottom:12px">✝</div>
                <h2 style="color:#2C2416;margin:0 0 12px">Payment unsuccessful</h2>
                <p style="color:#8B7355;line-height:1.7">We weren't able to process your payment, so your account has been moved to the free plan. Your sermons and data are safe.</p>
                <p style="color:#8B7355;line-height:1.7">To restore full access, update your payment method in <strong>Settings → Billing</strong>.</p>
                <a href="https://app.sermoncraftpro.com" style="display:inline-block;margin-top:20px;padding:12px 24px;background:#B8860B;color:#fff;border-radius:8px;text-decoration:none;font-weight:bold;">Update Payment Method</a>
                <p style="color:#8B7355;margin-top:24px">Grace and peace,<br/><strong style="color:#2C2416">SermonCraft Pro</strong></p>
              </div>`,
            }),
          });
        } catch (emailErr) {
          console.error("Downgrade email failed:", emailErr.message);
        }
      }
    }

    // ── INVOICE PAID ───────────────────────────────────────────────────────
    if (event.type === "invoice.payment_succeeded") {
      const invoice = event.data.object;
      const customerId = invoice.customer;
      const priceId = invoice.lines?.data?.[0]?.price?.id;
      const plan = PRICE_TO_PLAN[priceId];

      if (plan && customerId) {
        await supabase.from("users").update({ plan, stripe_customer_id: customerId }).eq("stripe_customer_id", customerId);
      }
    }

  } catch (err) {
    console.error("Webhook processing error:", err);
  }

  return res.status(200).json({ received: true });
}
