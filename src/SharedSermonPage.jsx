import { useState, useEffect } from "react";
import { fetchSharedSermon } from "./lib/db";

const GOLD = "#B8860B";
const GOLD_PALE = "#F5E6C8";
const IVORY = "#FDFAF5";
const CREAM = "#F7F1E8";
const CHARCOAL = "#2C2416";
const STONE = "#8B7355";
const STONE_LIGHT = "#A89070";
const BORDER = "#E8DCC8";

export default function SharedSermonPage({ slug }) {
  const [sermon, setSermon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [copyStatus, setCopyStatus] = useState("");

  useEffect(function() {
    if (!slug) { setNotFound(true); setLoading(false); return; }
    fetchSharedSermon(slug).then(function(data) {
      if (!data) { setNotFound(true); } else { setSermon(data); }
      setLoading(false);
    }).catch(function() {
      setNotFound(true);
      setLoading(false);
    });
  }, [slug]);

  function handlePrint() {
    window.print();
  }

  function handleCopyLink() {
    navigator.clipboard.writeText(window.location.href).then(function() {
      setCopyStatus("Copied!");
      setTimeout(function() { setCopyStatus(""); }, 2000);
    });
  }

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: IVORY, fontFamily: "'Georgia', serif", color: STONE }}>
        Loading sermon...
      </div>
    );
  }

  if (notFound) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", backgroundColor: IVORY, fontFamily: "'Georgia', serif", color: CHARCOAL, textAlign: "center", padding: 40 }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>✝</div>
        <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Sermon not found</div>
        <div style={{ fontSize: 14, color: STONE, marginBottom: 24 }}>This link may have expired or been removed.</div>
        <a href="https://sermoncraftpro.com" style={{ color: GOLD, fontSize: 14, fontWeight: 700 }}>Visit SermonCraft Pro</a>
      </div>
    );
  }

  return (
    <>
      {/* Print styles */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .print-page { box-shadow: none !important; margin: 0 !important; padding: 40px !important; max-width: 100% !important; }
          body { background: #fff !important; }
        }
        @media screen {
          body { background: #F7F1E8; }
        }
      `}</style>

      {/* Top nav bar */}
      <div className="no-print" style={{ backgroundColor: CHARCOAL, borderBottom: "1px solid rgba(184,134,11,0.3)", padding: "14px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <a href="https://sermoncraftpro.com" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <span style={{ fontSize: 20, color: GOLD }}>✝</span>
          <span style={{ fontFamily: "'Georgia', serif", fontSize: 15, fontWeight: 700, color: "#FDFAF5", letterSpacing: "0.02em" }}>SermonCraft Pro</span>
        </a>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={handleCopyLink}
            style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid rgba(184,134,11,0.4)", background: "transparent", color: GOLD, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "'Georgia', serif", letterSpacing: "0.04em" }}
          >
            {copyStatus || "Copy Link"}
          </button>
          <button
            onClick={handlePrint}
            style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: GOLD, color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "'Georgia', serif", letterSpacing: "0.04em" }}
          >
            Download PDF
          </button>
          <a
            href="https://app.sermoncraftpro.com"
            style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid rgba(253,250,245,0.15)", background: "transparent", color: "#FDFAF5", fontSize: 12, fontWeight: 700, textDecoration: "none", fontFamily: "'Georgia', serif", letterSpacing: "0.04em", display: "inline-flex", alignItems: "center" }}
          >
            Try SermonCraft Pro
          </a>
        </div>
      </div>

      {/* Sermon content */}
      <div style={{ minHeight: "100vh", padding: "48px 24px 80px", display: "flex", justifyContent: "center" }}>
        <div
          className="print-page"
          style={{ width: "100%", maxWidth: 740, backgroundColor: "#fff", borderRadius: 16, boxShadow: "0 4px 32px rgba(44,36,22,0.10)", padding: "56px 64px", fontFamily: "'Georgia', serif" }}
        >
          {/* Header branding */}
          <div style={{ borderBottom: "2px solid " + GOLD_PALE, paddingBottom: 28, marginBottom: 36 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
              <span style={{ fontSize: 16, color: GOLD }}>✝</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: STONE_LIGHT, letterSpacing: "0.1em", textTransform: "uppercase" }}>SermonCraft Pro</span>
            </div>

            <h1 style={{ fontSize: "clamp(26px, 4vw, 36px)", fontWeight: 700, color: CHARCOAL, lineHeight: 1.2, marginBottom: 16, letterSpacing: "-0.01em" }}>
              {sermon.title}
            </h1>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 20 }}>
              {sermon.scripture && (
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 13, color: GOLD }}>📖</span>
                  <span style={{ fontSize: 14, color: STONE, fontWeight: 600 }}>{sermon.scripture}</span>
                </div>
              )}
              {sermon.pastor_name && (
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 13 }}>✝</span>
                  <span style={{ fontSize: 14, color: STONE }}>{sermon.pastor_name}</span>
                </div>
              )}
              {sermon.church_name && (
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 13 }}>🏛</span>
                  <span style={{ fontSize: 14, color: STONE }}>{sermon.church_name}</span>
                </div>
              )}
              {sermon.sermon_date && (
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 13 }}>📅</span>
                  <span style={{ fontSize: 14, color: STONE }}>{sermon.sermon_date}</span>
                </div>
              )}
            </div>
          </div>

          {/* Sermon body */}
          <div style={{ fontSize: 16, lineHeight: 1.85, color: CHARCOAL, whiteSpace: "pre-wrap", letterSpacing: "0.01em" }}>
            {sermon.content}
          </div>

          {/* Footer branding */}
          <div style={{ marginTop: 56, paddingTop: 24, borderTop: "1px solid " + BORDER, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ color: GOLD, fontSize: 14 }}>✝</span>
              <span style={{ fontSize: 12, color: STONE_LIGHT, fontWeight: 700, letterSpacing: "0.04em" }}>Created with SermonCraft Pro</span>
            </div>
            <a href="https://sermoncraftpro.com" style={{ fontSize: 12, color: GOLD, fontWeight: 700, textDecoration: "none", letterSpacing: "0.04em" }}>sermoncraftpro.com</a>
          </div>
        </div>
      </div>
    </>
  );
}
