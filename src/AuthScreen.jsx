import { useState } from "react";
import { signIn, signUp, signInWithGoogle, signInWithApple } from "./lib/auth";

const GOLD = "#B8860B";
const CHARCOAL = "#2C2416";
const BORDER = "#E8DCC8";
const IVORY = "#FDFAF5";
const STONE = "#8B7355";
const STONE_LIGHT = "#A89070";

const TITLES = [
  "Pastor",
  "Bishop",
  "Reverend",
  "Apostle",
  "Prophet",
  "Evangelist",
  "Priest",
  "Deacon",
  "Brother",
  "Sister",
  "Elder",
  "Minister",
  "Other",
];

const INPUT_STYLE = {
  width: "100%",
  padding: "10px 14px",
  border: "1px solid " + BORDER,
  borderRadius: 8,
  backgroundColor: IVORY,
  fontSize: 14,
  color: CHARCOAL,
  fontFamily: "'Georgia', serif",
  outline: "none",
  boxSizing: "border-box",
};

const LABEL_STYLE = {
  display: "block",
  fontSize: 11,
  fontWeight: 700,
  color: STONE,
  letterSpacing: "0.06em",
  textTransform: "uppercase",
  marginBottom: 6,
};

export default function AuthScreen({ onAuth }) {
  const [mode, setMode] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [title, setTitle] = useState("Pastor");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function handleSubmit() {
    setError("");
    setMessage("");

    if (!email.trim() || !password.trim()) {
      setError("Please enter your email and password.");
      return;
    }

    if (mode === "signup" && !fullName.trim()) {
      setError("Please enter your full name.");
      return;
    }

    setLoading(true);

    try {
      if (mode === "signup") {
        await signUp(email, password, title + " " + fullName, title);
        setMessage("Account created! You can now sign in.");
        setMode("signin");
      } else {
        const data = await signIn(email, password);
        onAuth(data.user, data.session);
      }
    } catch (e) {
      setError(e.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setError("");
    try {
      await signInWithGoogle();
    } catch (e) {
      setError(e.message || "Google sign-in failed.");
    }
  }

  async function handleApple() {
    setError("");
    try {
      await signInWithApple();
    } catch (e) {
      setError(e.message || "Apple sign-in failed.");
    }
  }

  function switchMode(newMode) {
    setMode(newMode);
    setError("");
    setMessage("");
  }

  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: IVORY,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'Georgia', 'Times New Roman', serif",
    }}>
      <div style={{
        backgroundColor: "#fff",
        border: "1px solid " + BORDER,
        borderRadius: 16,
        padding: "40px 48px",
        width: "100%",
        maxWidth: 440,
        boxShadow: "0 4px 24px rgba(44,36,22,0.10)",
      }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>✝</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: CHARCOAL, letterSpacing: "0.02em" }}>
            SermonCraft Pro
          </div>
          <div style={{ fontSize: 13, color: STONE_LIGHT, marginTop: 4 }}>
            {mode === "signin" ? "Sign in to your account" : "Create your account"}
          </div>
        </div>

        {mode === "signup" && (
          <>
            <div style={{ marginBottom: 16 }}>
              <label style={LABEL_STYLE}>Title</label>
              <select
                style={INPUT_STYLE}
                value={title}
                onChange={function(e) { setTitle(e.target.value); }}
              >
                {TITLES.map(function(t) {
                  return <option key={t} value={t}>{t}</option>;
                })}
              </select>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={LABEL_STYLE}>Full Name</label>
              <input
                style={INPUT_STYLE}
                value={fullName}
                onChange={function(e) { setFullName(e.target.value); }}
                placeholder="e.g. John Smith"
              />
            </div>

            <div style={{ marginBottom: 8, padding: "8px 12px", backgroundColor: "#fdfaf4", border: "1px solid " + BORDER, borderRadius: 8, fontSize: 12, color: STONE }}>
              Your display name will be: <strong style={{ color: CHARCOAL }}>{title} {fullName || "John Smith"}</strong>
            </div>
          </>
        )}

        <div style={{ marginBottom: 16, marginTop: mode === "signup" ? 16 : 0 }}>
          <label style={LABEL_STYLE}>Email</label>
          <input
            type="email"
            style={INPUT_STYLE}
            value={email}
            onChange={function(e) { setEmail(e.target.value); }}
            placeholder="you@church.com"
          />
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={LABEL_STYLE}>Password</label>
          <input
            type="password"
            style={INPUT_STYLE}
            value={password}
            onChange={function(e) { setPassword(e.target.value); }}
            placeholder="••••••••"
          />
        </div>

        {error && (
          <div style={{ backgroundColor: "#FFF5F5", border: "1px solid #FFC5C5", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#C0392B", marginBottom: 16 }}>
            {error}
          </div>
        )}

        {message && (
          <div style={{ backgroundColor: "#F0FFF4", border: "1px solid #9AE6B4", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#276749", marginBottom: 16 }}>
            {message}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            width: "100%",
            padding: "12px",
            backgroundColor: GOLD,
            color: "#fff",
            border: "none",
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 700,
            fontFamily: "'Georgia', serif",
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.7 : 1,
            marginBottom: 12,
          }}
        >
          {loading ? "Please wait..." : mode === "signin" ? "Sign In" : "Create Account"}
        </button>

        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          <button
            onClick={handleGoogle}
            style={{ flex: 1, padding: "10px", backgroundColor: "#fff", color: CHARCOAL, border: "1px solid " + BORDER, borderRadius: 8, fontSize: 13, fontWeight: 700, fontFamily: "'Georgia', serif", cursor: "pointer" }}
          >
            G  Google
          </button>
          <button
            onClick={handleApple}
            style={{ flex: 1, padding: "10px", backgroundColor: "#000", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, fontFamily: "'Georgia', serif", cursor: "pointer" }}
          >
            Apple
          </button>
        </div>

        <div style={{ textAlign: "center", fontSize: 13, color: STONE }}>
          {mode === "signin" ? (
            <span>
              Don't have an account?{" "}
              <span
                onClick={function() { switchMode("signup"); }}
                style={{ color: GOLD, cursor: "pointer", fontWeight: 700 }}
              >
                Sign Up
              </span>
            </span>
          ) : (
            <span>
              Already have an account?{" "}
              <span
                onClick={function() { switchMode("signin"); }}
                style={{ color: GOLD, cursor: "pointer", fontWeight: 700 }}
              >
                Sign In
              </span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}