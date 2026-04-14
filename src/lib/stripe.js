// src/lib/stripe.js — Client-side Stripe helpers

var isLocal = window.location.hostname === "localhost";
var BASE = isLocal ? "https://sermoncraft-pro.vercel.app" : "";
var STRIPE_PK = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || "pk_live_51..."; // set in Vercel env

// Load Stripe.js lazily
var stripePromise = null;
export function getStripe() {
  if (!stripePromise) {
    stripePromise = window.Stripe ? Promise.resolve(window.Stripe(STRIPE_PK)) : new Promise(function(resolve) {
      var script = document.createElement("script");
      script.src = "https://js.stripe.com/v3/";
      script.onload = function() { resolve(window.Stripe(STRIPE_PK)); };
      document.head.appendChild(script);
    });
  }
  return stripePromise;
}

// Create embedded checkout session — returns clientSecret
export async function createEmbeddedCheckout(planKey, userId, email, options) {
  var body = { planKey, userId, email, embedded: true };
  if (options?.trialDays) body.trialDays = options.trialDays;

  var response = await fetch(BASE + "/api/create-checkout-session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  var data = await response.json();
  if (!response.ok || data.error) throw new Error(data.error || "Failed to create checkout");
  return data.clientSecret;
}

// Create redirect checkout session — returns url (fallback)
export async function createCheckoutSession(planKey, userId, email, options) {
  var body = { planKey, userId, email, embedded: false };
  if (options?.trialDays) body.trialDays = options.trialDays;

  var response = await fetch(BASE + "/api/create-checkout-session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  var data = await response.json();
  if (!response.ok || data.error) throw new Error(data.error || "Failed to create checkout");
  return { url: data.url };
}

// Open Stripe billing portal
export async function openCustomerPortal(userId, email) {
  var response = await fetch(BASE + "/api/customer-portal", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, email }),
  });
  var data = await response.json();
  if (!response.ok || data.error) throw new Error(data.error || "Failed to open portal");
  window.location.href = data.url;
}
