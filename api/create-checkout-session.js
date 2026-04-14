import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const PRICE_IDS = {
  student_monthly:       "price_1THx2eB0WpRalfPpcei2tGcy",
  student_annual:        "price_1THx39B0WpRalfPpnEXguRNv",
  solo_monthly:          "price_1THx3YB0WpRalfPp3AHawEsh",
  solo_annual:           "price_1THx3uB0WpRalfPp7x9oVCwR",
  pastor_monthly:        "price_1THx4EB0WpRalfPpPZ354rYw",
  pastor_annual:         "price_1THx4fB0WpRalfPpJVlJB7eg",
  church_monthly:        "price_1THx5DB0WpRalfPpU2yjcvJW",
  church_annual:         "price_1THx5fB0WpRalfPpSwLgJgIw",
  bible_college_monthly: "price_1THx61B0WpRalfPp3I5dtAg8",
  bible_college_annual:  "price_1THx6MB0WpRalfPpgNpNWVda",
  // Legacy keys — kept so existing subscribers don't break
  starter_monthly:         "price_1THx3YB0WpRalfPp3AHawEsh",
  starter_annual:          "price_1THx3uB0WpRalfPp7x9oVCwR",
  growth_monthly:          "price_1THx4EB0WpRalfPpPZ354rYw",
  growth_annual:           "price_1THx4fB0WpRalfPpJVlJB7eg",
  pro_monthly:             "price_1THx5DB0WpRalfPpU2yjcvJW",
  pro_annual:              "price_1THx5fB0WpRalfPpSwLgJgIw",
  enterprise_monthly:      "price_1THx61B0WpRalfPp3I5dtAg8",
  enterprise_annual:       "price_1THx6MB0WpRalfPpgNpNWVda",
  enterprise_plus_monthly: "price_1THx61B0WpRalfPp3I5dtAg8",
  enterprise_plus_annual:  "price_1THx6MB0WpRalfPpgNpNWVda",
};

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { planKey, priceId, userId, email, trialDays, embedded } = req.body;

    const resolvedPriceId = PRICE_IDS[planKey] || priceId || "";

    if (!resolvedPriceId) {
      return res.status(400).json({ error: "This plan is not yet available. Please contact jporo@sermoncraftpro.com." });
    }

    if (!email) {
      return res.status(400).json({ error: "Email is required." });
    }

    var sessionParams = {
      mode: "subscription",
      customer_email: email,
      line_items: [{ price: resolvedPriceId, quantity: 1 }],
      metadata: { userId: userId || "", planKey: planKey },
    };

    // Trial period
    if (trialDays && (trialDays === 7 || trialDays === 14)) {
      sessionParams.subscription_data = {
        trial_period_days: trialDays,
        metadata: { userId: userId || "", planKey: planKey, trialDays: String(trialDays) },
      };
    }

    if (embedded) {
      // Embedded checkout — returns client secret, no redirect
      sessionParams.ui_mode = "embedded_page";
      sessionParams.return_url = "https://app.sermoncraftpro.com?payment=success&plan=" + planKey;
    } else {
      // Standard redirect checkout
      sessionParams.success_url = "https://app.sermoncraftpro.com?session_id={CHECKOUT_SESSION_ID}&plan=" + planKey;
      sessionParams.cancel_url = "https://app.sermoncraftpro.com";
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    if (embedded) {
      return res.status(200).json({ clientSecret: session.client_secret });
    } else {
      return res.status(200).json({ url: session.url });
    }

  } catch (err) {
    console.error("Checkout session error:", err);
    return res.status(500).json({ error: err.message });
  }
}
