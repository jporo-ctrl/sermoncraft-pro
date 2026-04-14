import { useState, useEffect } from "react";
const _scpResetTs = localStorage.getItem("scpReset");
const _scpResetActive = !!((_scpResetTs) && (Date.now() - parseInt(_scpResetTs)) < 600000);
import SermonCraftPro from "./SermonCraftPro";
import AuthScreen from "./AuthScreen";
import SharedSermonPage from "./SharedSermonPage";
import { supabase } from "./lib/supabase";
import { getUserProfile } from "./lib/auth";
import { fetchChurch, fetchChurchByMember, checkPendingInvitation } from "./lib/db";

function ResetPasswordScreen({ onDone }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleReset() {
    if (!password || !confirm) return setError("Both fields are required.");
    if (password !== confirm) return setError("Passwords do not match.");
    if (password.length < 8) return setError("Password must be at least 8 characters.");
    setLoading(true); setError("");
    const { error: err } = await supabase.auth.updateUser({ password });
    if (err) setError(err.message);
    else { setSuccess(true); localStorage.removeItem("scpReset"); }
    setLoading(false);
  }

  const GOLD = "#B8860B";
  const CHARCOAL = "#2C2416";
  const BORDER = "#E8DCC8";
  const IVORY = "#FDFAF5";
  const STONE_LIGHT = "#A89070";

  return (
    <div style={{ minHeight: "100vh", backgroundColor: IVORY, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Georgia', serif" }}>
      <div style={{ backgroundColor: "#fff", border: "1px solid " + BORDER, borderRadius: 16, padding: "40px 48px", width: "100%", maxWidth: 440, boxShadow: "0 4px 24px rgba(44,36,22,0.10)" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>✝</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: CHARCOAL }}>SermonCraft Pro</div>
          <div style={{ fontSize: 13, color: STONE_LIGHT, marginTop: 4 }}>Set a new password</div>
        </div>
        {success ? (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>✓</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: CHARCOAL, marginBottom: 8 }}>Password updated!</div>
            <div style={{ fontSize: 13, color: STONE_LIGHT, marginBottom: 20 }}>You can now sign in with your new password.</div>
            <button onClick={onDone} style={{ width: "100%", padding: 12, backgroundColor: GOLD, color: "#fff", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Go to Sign In</button>
          </div>
        ) : (
          <>
            {error && <div style={{ backgroundColor: "#FFF5F5", border: "1px solid #FFC5C5", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#C0392B", marginBottom: 16 }}>{error}</div>}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#8B7355", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 6 }}>New Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="At least 8 characters"
                style={{ width: "100%", padding: "10px 14px", border: "1px solid " + BORDER, borderRadius: 8, backgroundColor: IVORY, fontSize: 14, color: CHARCOAL, fontFamily: "'Georgia', serif", outline: "none", boxSizing: "border-box" }} />
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#8B7355", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 6 }}>Confirm Password</label>
              <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Repeat password"
                style={{ width: "100%", padding: "10px 14px", border: "1px solid " + BORDER, borderRadius: 8, backgroundColor: IVORY, fontSize: 14, color: CHARCOAL, fontFamily: "'Georgia', serif", outline: "none", boxSizing: "border-box" }} />
            </div>
            <button onClick={handleReset} disabled={loading} style={{ width: "100%", padding: 12, backgroundColor: GOLD, color: "#fff", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1 }}>
              {loading ? "Updating..." : "Update Password"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function App() {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [church, setChurch] = useState(null);
  const [pendingInvitation, setPendingInvitation] = useState(null);
  const [loading, setLoading] = useState(true);

  var referralCode = new URLSearchParams(window.location.search).get("ref") || "";

  // ── Shared sermon route — check before anything else ─────────────────────
  var pathname = window.location.pathname;
  var shareMatch = pathname.match(/^\/share\/([a-z0-9]+)$/i);
  if (shareMatch) {
    return <SharedSermonPage slug={shareMatch[1]} />;
  }
  // ─────────────────────────────────────────────────────────────────────────

  async function loadUserData(user) {
    try {
      const p = await getUserProfile(user.id);
      setProfile(p);
      if (p?.role === "admin" || !p?.church_id) {
        const c = await fetchChurch(user.id);
        setChurch(c);
      } else if (p?.church_id) {
        const c = await fetchChurchByMember(p.church_id);
        setChurch(c);
      }
      if (user.email) {
        const inv = await checkPendingInvitation(user.email);
        setPendingInvitation(inv);
      }
    } catch (e) {
      setProfile(null);
      setChurch(null);
    }
  }

  useEffect(function() {
    supabase.auth.getSession().then(function({ data }) {
      setSession(data.session);
      if (data.session) {
        loadUserData(data.session.user).finally(function() {
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange(function(event, newSession) {
      setSession(newSession);
      if (newSession) {
        loadUserData(newSession.user);
      } else {
        setProfile(null);
        setChurch(null);
        setPendingInvitation(null);
      }
    });

    return function() {
      listener.subscription.unsubscribe();
    };
  }, []);

  function handleAuth(user, newSession) {
    setSession(newSession);
    loadUserData(user);
  }

  function handleSignOut() {
    setSession(null);
    setProfile(null);
    setChurch(null);
    setPendingInvitation(null);
  }

  function handleChurchUpdate(updatedChurch) {
    setChurch(updatedChurch);
  }

  function handleInvitationHandled() {
    setPendingInvitation(null);
    if (session) loadUserData(session.user);
  }

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Georgia', serif",
        fontSize: 16,
        color: "#8B7355",
        backgroundColor: "#FDFAF5",
      }}>
        Loading...
      </div>
    );
  }

  if (_scpResetActive) {
    localStorage.removeItem("scpReset");
    return <ResetPasswordScreen onDone={() => { window.location.href = "/"; }} />;
  }

  if (!session) {
    return <AuthScreen onAuth={handleAuth} referralCode={referralCode} />;
  }

  return (
    <SermonCraftPro
      user={session.user}
      profile={profile}
      church={church}
      pendingInvitation={pendingInvitation}
      onSignOut={handleSignOut}
      onChurchUpdate={handleChurchUpdate}
      onInvitationHandled={handleInvitationHandled}
    />
  );
}

export default App;
