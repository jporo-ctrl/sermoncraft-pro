// EmbeddedCheckout.jsx
// Drop-in replacement for your current Stripe redirect flow.
// Requires: npm install @stripe/react-stripe-js @stripe/stripe-js
//
// USAGE — replace your current upgrade button handler with:
//   <EmbeddedCheckoutModal planKey="starter_monthly" email={user.email} userId={user.id} trialDays={14} />

import { useState, useCallback, useEffect } from "react";
import {
  loadStripe,
  EmbeddedCheckoutProvider,
  EmbeddedCheckout,
} from "@stripe/react-stripe-js";

// ── Your publishable key ──────────────────────────────────────────────────────
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

// ── Plan display metadata ─────────────────────────────────────────────────────
const PLAN_META = {
  starter_monthly:         { name: "Starter",      price: "$14.99/mo",   trial: 14 },
  starter_annual:          { name: "Starter",      price: "$143/yr",     trial: 14 },
  growth_monthly:          { name: "Growth",        price: "$29.99/mo",   trial: 14 },
  growth_annual:           { name: "Growth",        price: "$287/yr",     trial: 14 },
  pro_monthly:             { name: "Pro",           price: "$49.99/mo",   trial: 7  },
  pro_annual:              { name: "Pro",           price: "$479/yr",     trial: 7  },
  enterprise_monthly:      { name: "Enterprise",    price: "$99.99/mo",   trial: 7  },
  enterprise_annual:       { name: "Enterprise",    price: "$959/yr",     trial: 7  },
  enterprise_plus_monthly: { name: "Enterprise+",   price: "$199.99/mo",  trial: 7  },
  enterprise_plus_annual:  { name: "Enterprise+",   price: "$1,919/yr",   trial: 7  },
};

// ── Inline styles (no Tailwind dependency) ────────────────────────────────────
const S = {
  overlay: {
    position: "fixed", inset: 0, zIndex: 9999,
    background: "rgba(26, 21, 8, 0.82)",
    backdropFilter: "blur(6px)",
    display: "flex", alignItems: "center", justifyContent: "center",
    padding: "24px",
    animation: "scpFadeIn 0.2s ease",
  },
  modal: {
    background: "#2C2416",
    border: "1px solid rgba(184,134,11,0.35)",
    borderRadius: "16px",
    width: "100%",
    maxWidth: "540px",
    maxHeight: "90vh",
    overflowY: "auto",
    boxShadow: "0 32px 80px rgba(0,0,0,0.7)",
    animation: "scpSlideUp 0.28s cubic-bezier(0.22,1,0.36,1)",
    position: "relative",
  },
  header: {
    padding: "28px 28px 0",
    borderBottom: "1px solid rgba(184,134,11,0.18)",
    paddingBottom: "20px",
    marginBottom: "0",
  },
  closeBtn: {
    position: "absolute", top: "16px", right: "16px",
    background: "rgba(255,255,255,0.06)", border: "none",
    color: "#C4A882", width: "32px", height: "32px",
    borderRadius: "50%", cursor: "pointer", fontSize: "16px",
    display: "flex", alignItems: "center", justifyContent: "center",
    transition: "background 0.15s",
  },
  planBadge: {
    display: "inline-flex", alignItems: "center", gap: "6px",
    background: "rgba(184,134,11,0.15)", border: "1px solid rgba(184,134,11,0.4)",
    borderRadius: "20px", padding: "4px 12px",
    color: "#B8860B", fontSize: "12px", fontWeight: "700",
    letterSpacing: "0.04em", marginBottom: "10px",
    fontFamily: "Georgia, serif",
  },
  title: {
    color: "#FDFAF5", fontSize: "20px", fontWeight: "700",
    fontFamily: "Georgia, serif", margin: "0 0 4px",
  },
  subtitle: {
    color: "#8B7355", fontSize: "13px", margin: "0",
    fontFamily: "'Helvetica Neue', sans-serif",
  },
  price: {
    color: "#B8860B", fontSize: "22px", fontWeight: "700",
    fontFamily: "Georgia, serif", marginLeft: "8px",
  },
  trialNote: {
    display: "inline-block", marginTop: "8px",
    background: "rgba(27,94,32,0.25)", border: "1px solid rgba(46,125,50,0.4)",
    borderRadius: "6px", padding: "4px 10px",
    color: "#81C784", fontSize: "11.5px", fontWeight: "600",
    fontFamily: "'Helvetica Neue', sans-serif",
  },
  checkoutWrap: {
    padding: "24px 20px 28px",
  },
  loadingWrap: {
    padding: "48px 28px",
    display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center", gap: "16px",
  },
  spinner: {
    width: "36px", height: "36px",
    border: "3px solid rgba(184,134,11,0.2)",
    borderTop: "3px solid #B8860B",
    borderRadius: "50%",
    animation: "scpSpin 0.75s linear infinite",
  },
  loadingText: {
    color: "#8B7355", fontSize: "13px",
    fontFamily: "'Helvetica Neue', sans-serif",
  },
  errorWrap: {
    padding: "32px 28px", textAlign: "center",
  },
  errorText: {
    color: "#EF9A9A", fontSize: "13px", marginBottom: "16px",
    fontFamily: "'Helvetica Neue', sans-serif",
  },
  retryBtn: {
    background: "#B8860B", color: "#2C2416",
    border: "none", borderRadius: "8px",
    padding: "10px 24px", fontSize: "13px", fontWeight: "700",
    cursor: "pointer", fontFamily: "Georgia, serif",
  },
  // Trigger button — use this on your upgrade/plan cards
  triggerBtn: {
    background: "linear-gradient(135deg, #B8860B 0%, #D4A017 100%)",
    color: "#2C2416", border: "none", borderRadius: "10px",
    padding: "13px 28px", fontSize: "14px", fontWeight: "700",
    cursor: "pointer", fontFamily: "Georgia, serif",
    letterSpacing: "0.02em", width: "100%",
    transition: "opacity 0.15s, transform 0.15s",
    boxShadow: "0 4px 16px rgba(184,134,11,0.35)",
  },
};

const keyframes = `
  @keyframes scpFadeIn   { from { opacity: 0 } to { opacity: 1 } }
  @keyframes scpSlideUp  { from { opacity: 0; transform: translateY(24px) } to { opacity: 1; transform: translateY(0) } }
  @keyframes scpSpin     { to { transform: rotate(360deg) } }
`;

// ── Core modal that holds the embedded Stripe checkout ────────────────────────
function CheckoutModal({ planKey, email, userId, onClose, onSuccess }) {
  const [clientSecret, setClientSecret] = useState(null);
  const [error, setError] = useState(null);
  const plan = PLAN_META[planKey] || {};

  const fetchClientSecret = useCallback(async () => {
    setError(null);
    setClientSecret(null);
    try {
      const res = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planKey,
          email,
          userId,
          trialDays: plan.trial || 7,
          embedded: true,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to initialize checkout.");
      setClientSecret(data.clientSecret);
    } catch (err) {
      setError(err.message);
    }
  }, [planKey, email, userId]);

  useEffect(() => {
    fetchClientSecret();
    // Lock body scroll while modal is open
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, [fetchClientSecret]);

  // Close on backdrop click
  const handleBackdrop = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  // Close on Escape key
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <>
      <style>{keyframes}</style>
      <div style={S.overlay} onClick={handleBackdrop}>
        <div style={S.modal}>

          {/* Header */}
          <div style={S.header}>
            <button style={S.closeBtn} onClick={onClose} aria-label="Close">✕</button>
            <div style={S.planBadge}>✝ SermonCraft Pro</div>
            <h2 style={S.title}>
              Upgrade to {plan.name}
              <span style={S.price}>{plan.price}</span>
            </h2>
            <p style={S.subtitle}>
              Billed securely via Stripe. Cancel any time.
            </p>
            {plan.trial && (
              <span style={S.trialNote}>
                ✓ {plan.trial}-day free trial included — no charge until it ends
              </span>
            )}
          </div>

          {/* Checkout body */}
          {error ? (
            <div style={S.errorWrap}>
              <p style={S.errorText}>{error}</p>
              <button style={S.retryBtn} onClick={fetchClientSecret}>Try Again</button>
            </div>
          ) : !clientSecret ? (
            <div style={S.loadingWrap}>
              <div style={S.spinner} />
              <p style={S.loadingText}>Preparing secure checkout…</p>
            </div>
          ) : (
            <div style={S.checkoutWrap}>
              <EmbeddedCheckoutProvider
                stripe={stripePromise}
                options={{
                  clientSecret,
                  onComplete: () => {
                    onClose();
                    if (onSuccess) onSuccess(planKey);
                  },
                }}
              >
                <EmbeddedCheckout />
              </EmbeddedCheckoutProvider>
            </div>
          )}

        </div>
      </div>
    </>
  );
}

// ── Public component — drop this wherever your upgrade buttons are ─────────────
export default function EmbeddedCheckoutModal({
  planKey,
  email,
  userId,
  children,
  onSuccess,
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Trigger — pass your own button as children, or use the default */}
      <span onClick={() => setOpen(true)} style={{ display: "inline-block", width: "100%" }}>
        {children ?? (
          <button
            style={S.triggerBtn}
            onMouseEnter={e => { e.currentTarget.style.opacity = "0.88"; e.currentTarget.style.transform = "translateY(-1px)"; }}
            onMouseLeave={e => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.transform = "translateY(0)"; }}
          >
            Upgrade to {PLAN_META[planKey]?.name ?? "Pro"}
          </button>
        )}
      </span>

      {open && (
        <CheckoutModal
          planKey={planKey}
          email={email}
          userId={userId}
          onClose={() => setOpen(false)}
          onSuccess={onSuccess}
        />
      )}
    </>
  );
}
