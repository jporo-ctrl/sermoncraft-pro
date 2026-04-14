// /api/customer-portal.js — Create Stripe customer portal session

import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { email, returnUrl } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required." });
    }

    // Find customer by email
    const customers = await stripe.customers.list({ email: email, limit: 1 });

    if (customers.data.length === 0) {
      return res.status(404).json({ error: "No subscription found for this account." });
    }

    const customer = customers.data[0];

    const session = await stripe.billingPortal.sessions.create({
      customer: customer.id,
      return_url: returnUrl || "https://app.sermoncraftpro.com",
    });

    return res.status(200).json({ url: session.url });

  } catch (err) {
    console.error("Portal error:", err);
    return res.status(500).json({ error: err.message });
  }
}
