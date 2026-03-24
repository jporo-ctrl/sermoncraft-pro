import { useState, useCallback, useRef, useMemo, useEffect } from "react";
import { PLAN_LIMITS, getPlanLimits } from "./lib/plans";
import { canUseTool } from "./lib/usage";

// ─── CONSTANTS ───────────────────────────────────────────────────────────────

const GOLD = "#B8860B";
const GOLD_LIGHT = "#D4A017";
const GOLD_PALE = "#F5E6C8";
const IVORY = "#FDFAF5";
const CREAM = "#F7F1E8";
const WARM_WHITE = "#FFFEF9";
const STONE = "#8B7355";
const STONE_LIGHT = "#A89070";
const CHARCOAL = "#2C2416";
const BORDER = "#E8DCC8";
const SHADOW = "0 2px 12px rgba(44,36,22,0.08)";

const PASTOR_NAV = [
  { id: "dashboard", label: "Dashboard", icon: "\u26EA" },
  { id: "ai-pastor", label: "AI Pastor", icon: "\u271D" },
  { id: "topic-engine", label: "Topic Engine", icon: "\uD83D\uDCA1" },
  { id: "sermon-forge", label: "Sermon Forge", icon: "\uD83D\uDCDC" },
  { id: "word-study", label: "Word Study", icon: "\uD83D\uDCDA" },
  { id: "illustrations", label: "Illustrations", icon: "\uD83D\uDDBC" },
  { id: "library", label: "My Sermons", icon: "\uD83D\uDDC2" },
  { id: "series-planner", label: "Series Planner", icon: "\uD83D\uDCC5" },
];

const ADMIN_NAV = [
  { id: "church-overview", label: "Church Overview", icon: "\uD83C\uDFDB" },
  { id: "branches", label: "Branches", icon: "\uD83C\uDF3F" },
  { id: "pastor-accounts", label: "Pastor Accounts", icon: "\uD83D\uDC64" },
  { id: "activity", label: "Activity & Stats", icon: "\uD83D\uDCCA" },
  { id: "all-sermons", label: "All Sermons", icon: "\uD83D\uDCCB" },
  { id: "church-settings", label: "Church Settings", icon: "\u2699" },
];

const SEED_CHURCH = {
  name: "Kingdom Insights Ministries",
  denomination: "Non-Denominational",
  city: "Hurst, TX",
  founded: 2016,
  members: 1000,
  branches: 3,
};

const SEED_BRANCHES = [
  { id: 1, name: "Main Campus", city: "Nashville, TN", members: 2800, pastor: "Rev. Daniel Brooks", active: true },
  { id: 2, name: "East Side Campus", city: "Hermitage, TN", members: 900, pastor: "Pastor Sarah Kim", active: true },
  { id: 3, name: "Westview Campus", city: "Bellevue, TN", members: 500, pastor: "Pastor Marcus Webb", active: true },
];

const SEED_USERS = [
  { id: 1, name: "Ap. Josh Poro", role: "Senior Pastor", branch: "Main Campus", email: "jporo@kim.church", active: true, sermons: 48 },
  { id: 2, name: "Pastor Sarah Kim", role: "Campus Pastor", branch: "East Side", email: "s.kim@cornerstone.org", active: true, sermons: 31 },
  { id: 3, name: "Pastor Marcus Webb", role: "Campus Pastor", branch: "Westview", email: "m.webb@cornerstone.org", active: true, sermons: 22 },
  { id: 4, name: "Elder Thomas Grace", role: "Associate Pastor", branch: "Main Campus", email: "t.grace@cornerstone.org", active: true, sermons: 14 },
];

const SEED_SERMONS = [
  { id: 1, title: "Walking in the Light", series: "Life in the Spirit", date: "2025-06-01", pastor: "Rev. Daniel Brooks", scripture: "John 8:12", status: "published" },
  { id: 2, title: "The Anchor of Hope", series: "Unshakeable Faith", date: "2025-05-25", pastor: "Pastor Sarah Kim", scripture: "Hebrews 6:19", status: "published" },
  { id: 3, title: "Renewed by Grace", series: "Life in the Spirit", date: "2025-05-18", pastor: "Rev. Daniel Brooks", scripture: "Romans 12:2", status: "published" },
  { id: 4, title: "The Shepherd's Voice", series: null, date: "2025-05-11", pastor: "Pastor Marcus Webb", scripture: "John 10:27", status: "draft" },
  { id: 5, title: "Rivers of Living Water", series: "Unshakeable Faith", date: "2025-05-04", pastor: "Rev. Daniel Brooks", scripture: "John 7:38", status: "published" },
];

const CURRENT_USER = {
  id: 1,
  name: "Ap. Josh Poro",
  role: "Senior Pastor",
  church: SEED_CHURCH.name,
  branch: "Main Campus",
  isAdmin: true,
  plan: "free",
};

// ─── API HELPERS ──────────────────────────────────────────────────────────────

async function callSermonAPI({ prompt, sys, mode = "fast", onChunk }) {
  const response = await fetch("/api/sermon", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, sys, mode }),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "Unknown error");
    throw new Error("API error " + response.status + ": " + errorText);
  }

  if (!response.body) {
    throw new Error("Response body is missing — streaming not supported.");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let accumulated = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value, { stream: true });
    accumulated += chunk;
    if (onChunk) onChunk(accumulated);
  }

  return accumulated;
}

async function callJSONAPI({ prompt, sys, mode = "fast" }) {
  const response = await fetch("/api/forge-json", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, sys, mode }),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "Unknown error");
    throw new Error("API error " + response.status + ": " + errorText);
  }

  const data = await response.json();

  if (!data || data.result === undefined) {
    throw new Error("Invalid API response: missing result field.");
  }

  return data.result;
}

// ─── STYLE CONSTANTS ─────────────────────────────────────────────────────────

const styles = {
  page: {
    display: "flex",
    height: "100vh",
    fontFamily: "'Georgia', 'Times New Roman', serif",
    backgroundColor: IVORY,
    color: CHARCOAL,
    overflow: "hidden",
  },
  sidebar: {
    width: 260,
    backgroundColor: WARM_WHITE,
    borderRight: "1px solid " + BORDER,
    display: "flex",
    flexDirection: "column",
    boxShadow: "2px 0 8px rgba(44,36,22,0.06)",
    overflowY: "auto",
    flexShrink: 0,
  },
  sidebarHeader: {
    padding: "24px 20px 20px",
    borderBottom: "1px solid " + BORDER,
  },
  logoMark: {
    fontSize: 28,
    marginBottom: 8,
  },
  churchName: {
    fontSize: 13,
    fontWeight: 700,
    color: CHARCOAL,
    letterSpacing: "0.04em",
    textTransform: "uppercase",
    lineHeight: 1.3,
  },
  navSection: {
    padding: "16px 12px 8px",
  },
  navLabel: {
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: "0.1em",
    color: STONE_LIGHT,
    textTransform: "uppercase",
    padding: "0 8px 8px",
  },
  navItemBase: function(active) {
    return {
      display: "flex",
      alignItems: "center",
      gap: 10,
      padding: "9px 12px",
      borderRadius: 8,
      cursor: "pointer",
      fontSize: 14,
      fontFamily: "'Georgia', serif",
      fontWeight: active ? 600 : 400,
      color: active ? GOLD : STONE,
      backgroundColor: active ? GOLD_PALE : "transparent",
      border: "1px solid " + (active ? GOLD_PALE : "transparent"),
      transition: "all 0.15s ease",
      marginBottom: 2,
    };
  },
  navIcon: {
    fontSize: 16,
    width: 22,
    textAlign: "center",
  },
  mainContent: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
  topBar: {
    backgroundColor: WARM_WHITE,
    borderBottom: "1px solid " + BORDER,
    padding: "14px 32px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    boxShadow: "0 1px 4px rgba(44,36,22,0.05)",
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: 700,
    color: CHARCOAL,
    letterSpacing: "0.01em",
  },
  userBadge: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "6px 14px",
    backgroundColor: CREAM,
    border: "1px solid " + BORDER,
    borderRadius: 24,
    fontSize: 13,
    color: STONE,
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: "50%",
    backgroundColor: GOLD,
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 12,
    fontWeight: 700,
    flexShrink: 0,
  },
  scrollArea: {
    flex: 1,
    overflowY: "auto",
    padding: "28px 32px",
  },
  card: {
    backgroundColor: WARM_WHITE,
    border: "1px solid " + BORDER,
    borderRadius: 12,
    padding: "20px 24px",
    boxShadow: SHADOW,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 700,
    color: CHARCOAL,
    marginBottom: 4,
  },
  cardMeta: {
    fontSize: 12,
    color: STONE_LIGHT,
    marginBottom: 16,
  },
  grid2: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 20,
    marginBottom: 24,
  },
  statCard: {
    backgroundColor: WARM_WHITE,
    border: "1px solid " + BORDER,
    borderRadius: 12,
    padding: "18px 20px",
    boxShadow: SHADOW,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 700,
    color: GOLD,
    lineHeight: 1,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: STONE,
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    fontWeight: 600,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    display: "block",
    fontSize: 12,
    fontWeight: 700,
    color: STONE,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    marginBottom: 6,
  },
  input: {
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
    transition: "border-color 0.15s",
  },
  textarea: {
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
    resize: "vertical",
    minHeight: 100,
    transition: "border-color 0.15s",
  },
  select: {
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
    cursor: "pointer",
  },
  btn: {
    padding: "10px 20px",
    borderRadius: 8,
    border: "none",
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 700,
    fontFamily: "'Georgia', serif",
    letterSpacing: "0.04em",
    transition: "all 0.15s ease",
  },
  btnGold: {
    backgroundColor: GOLD,
    color: "#fff",
    boxShadow: "0 2px 8px rgba(184,134,11,0.3)",
  },
  btnOutline: {
    backgroundColor: "transparent",
    color: GOLD,
    border: "1.5px solid " + GOLD,
  },
  btnGhost: {
    backgroundColor: CREAM,
    color: STONE,
    border: "1px solid " + BORDER,
  },
  outputPanel: {
    backgroundColor: CREAM,
    border: "1px solid " + BORDER,
    borderRadius: 10,
    padding: "18px 20px",
    fontSize: 15,
    lineHeight: 1.8,
    color: CHARCOAL,
    whiteSpace: "pre-wrap",
    fontFamily: "'Georgia', serif",
    minHeight: 120,
    marginTop: 16,
  },
  errorPanel: {
    backgroundColor: "#FFF5F5",
    border: "1px solid #FFC5C5",
    borderRadius: 10,
    padding: "14px 18px",
    fontSize: 13,
    color: "#C0392B",
    marginTop: 16,
  },
  tag: {
    display: "inline-block",
    padding: "2px 10px",
    borderRadius: 12,
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "0.04em",
    textTransform: "uppercase",
  },
  tagGold: { backgroundColor: GOLD_PALE, color: GOLD },
  tagGreen: { backgroundColor: "#EAFAF1", color: "#27AE60" },
  tagGray: { backgroundColor: CREAM, color: STONE },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: 14,
  },
  th: {
    padding: "10px 14px",
    textAlign: "left",
    fontSize: 11,
    fontWeight: 700,
    color: STONE_LIGHT,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    borderBottom: "2px solid " + BORDER,
  },
  td: {
    padding: "12px 14px",
    borderBottom: "1px solid " + BORDER,
    verticalAlign: "top",
  },
  sectionHeader: {
    fontSize: 22,
    fontWeight: 700,
    color: CHARCOAL,
    marginBottom: 6,
    letterSpacing: "0.01em",
  },
  sectionSub: {
    fontSize: 14,
    color: STONE,
    marginBottom: 24,
  },
  goldAccent: {
    display: "inline-block",
    width: 32,
    height: 3,
    backgroundColor: GOLD,
    borderRadius: 2,
    marginBottom: 16,
  },
};

// ─── SHARED UI COMPONENTS ─────────────────────────────────────────────────────

function NavItem({ item, active, onClick }) {
  const [hovered, setHovered] = useState(false);
  const computedStyle = Object.assign(
    {},
    styles.navItemBase(active),
    hovered && !active ? { backgroundColor: CREAM, color: CHARCOAL, border: "1px solid " + BORDER } : {}
  );
  return (
    <div
      style={computedStyle}
      onClick={function() { onClick(item.id); }}
      onMouseEnter={function() { setHovered(true); }}
      onMouseLeave={function() { setHovered(false); }}
    >
      <span style={styles.navIcon}>{item.icon}</span>
      <span>{item.label}</span>
    </div>
  );
}

function Button({ children, onClick, variant, disabled, style: extraStyle }) {
  variant = variant || "gold";
  disabled = disabled || false;
  const [hovered, setHovered] = useState(false);
  const variantStyle =
    variant === "gold" ? styles.btnGold
    : variant === "outline" ? styles.btnOutline
    : styles.btnGhost;

  const computedStyle = Object.assign(
    {},
    styles.btn,
    variantStyle,
    { opacity: disabled ? 0.55 : 1, cursor: disabled ? "not-allowed" : "pointer" },
    hovered && !disabled && variant === "gold" ? { backgroundColor: GOLD_LIGHT } : {},
    extraStyle || {}
  );

  return (
    <button
      style={computedStyle}
      onClick={disabled ? undefined : onClick}
      onMouseEnter={function() { setHovered(true); }}
      onMouseLeave={function() { setHovered(false); }}
    >
      {children}
    </button>
  );
}

function StatCard({ value, label, icon }) {
  return (
    <div style={styles.statCard}>
      <div style={{ fontSize: 22, marginBottom: 8 }}>{icon}</div>
      <div style={styles.statValue}>{value}</div>
      <div style={styles.statLabel}>{label}</div>
    </div>
  );
}

function OutputPanel({ text, loading, error, onCopy, onSave }) {
  if (error) {
    return <div style={styles.errorPanel}>{"\u26A0 "}{error}</div>;
  }
  if (!text && !loading) return null;
  return (
    <div>
      <div style={styles.outputPanel}>
        {loading && !text
          ? <span style={{ color: STONE_LIGHT, fontStyle: "italic" }}>Generating...</span>
          : text
        }
      </div>
      {text && (
        <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
          <Button variant="ghost" onClick={onCopy}>Copy</Button>
          {onSave && <Button variant="outline" onClick={onSave}>Save to Library</Button>}
        </div>
      )}
    </div>
  );
}

function safeParseJSON(raw) {
  if (!raw) return null;
  if (typeof raw === "object") return raw;
  try {
    return JSON.parse(raw);
  } catch (_e) {
    return null;
  }
}
function DashboardScreen({ user, library, setCurrentScreen }) {
  var recentSermons = library.slice(0, 3);
  var nameParts = user.name.split(" ");
  var firstName = nameParts.length > 1 ? nameParts[0] : nameParts[0];
  const limits = getPlanLimits(CURRENT_USER.plan || "free");
  const currentPlan = CURRENT_USER.plan || "free";
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  return (
    <div style={styles.container}>
      <div
        style={{
          background: "#fffaf2",
          border: "1px solid #e8dcc8",
          borderRadius: 12,
          padding: 16,
          marginBottom: 20,
          boxShadow: "0 2px 12px rgba(44,36,22,0.08)"
        }}
      >
        <div style={{ fontWeight: "bold", marginBottom: 10 }}>Plan Usage</div>
        <div style={{ marginBottom: 10 }}><strong>Current Plan:</strong> {currentPlan}</div>
        <div><strong>Plan Name:</strong> {limits.name}</div>
        <div style={{ fontWeight: "bold", marginBottom: 10 }}>Plan Usage</div>
<div style={{ marginBottom: 10 }}><strong>Current Plan:</strong> {currentPlan}</div>
<div><strong>Plan Name:</strong> {limits.name}</div>

<div style={{ marginTop: 12 }}>
  <strong>Switch Plan (dev):</strong>
  <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
    {["free", "starter", "growth", "pro"].map(function(p) {
      return (
        <button
          key={p}
          onClick={function() {
            CURRENT_USER.plan = p;
            window.location.reload();
          }}
          style={{
            padding: "6px 10px",
            borderRadius: 6,
            border: "1px solid #ccc",
            background: currentPlan === p ? "#b8860b" : "#fff",
            color: currentPlan === p ? "#fff" : "#333",
            cursor: "pointer",
            fontSize: 12
          }}
        >
          {p}
        </button>
      );
    })}
  </div>
</div>
        <div><strong>Fast Generations:</strong> {limits.fast}</div>
        <div><strong>Deep Generations:</strong> {limits.deep}</div>
        <div><strong>Library Save:</strong> {limits.saveLibrary ? "Yes" : "No"}</div>
        <div><strong>Series Planner:</strong> {limits.seriesPlanner ? "Yes" : "No"}</div>
        <div><strong>Team Seats:</strong> {limits.teamSeats}</div>

        <button
          style={{
            marginTop: 14,
            background: "#b8860b",
            color: "white",
            border: "none",
            borderRadius: 8,
            padding: "10px 14px",
            cursor: "pointer",
            fontWeight: "bold"
          }}
          onClick={() => setShowUpgradeModal(true)}
        >
          Upgrade Now
        </button>
      </div>

      <div style={styles.goldAccent} />
      <div style={styles.sectionHeader}>Good morning, {firstName}.</div>
      <div style={styles.sectionSub}>Your ministry tools are ready. What will you build today?</div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 20, marginBottom: 28 }}>
        <StatCard value={library.length} label="Saved Sermons" icon={"📜"} />
        <StatCard value="48" label="Total This Year" icon={"📅"} />
        <StatCard value="3" label="Active Series" icon={"🎯"} />
        <StatCard value="4,200" label="Congregation" icon={"🙏"} />
      </div>

      <div style={styles.grid2}>
        <div style={styles.card}>
          <div style={styles.cardTitle}>Quick Tools</div>
          <div style={styles.cardMeta}>Launch a ministry tool instantly</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              { id: "sermon-forge", label: "Start a New Sermon", icon: "📜" },
              { id: "topic-engine", label: "Generate Topics", icon: "💡" },
              { id: "word-study", label: "Explore a Scripture", icon: "📚" },
              { id: "series-planner", label: "Plan a Series", icon: "📅" },
            ].map(function(tool) {
              return (
                <button
                  key={tool.id}
                  onClick={function() { setCurrentScreen(tool.id); }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "10px 14px",
                    border: "1px solid " + BORDER,
                    borderRadius: 8,
                    backgroundColor: IVORY,
                    cursor: "pointer",
                    fontSize: 14,
                    color: CHARCOAL,
                    fontFamily: "'Georgia', serif",
                    textAlign: "left",
                  }}
                >
                  <span style={{ fontSize: 18 }}>{tool.icon}</span>
                  <span>{tool.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div style={styles.card}>
          <div style={styles.cardTitle}>Recent Sermons</div>
          <div style={styles.cardMeta}>From your library</div>

          {recentSermons.length === 0 && (
            <div style={{ color: STONE_LIGHT, fontSize: 14, fontStyle: "italic" }}>
              No sermons saved yet.
            </div>
          )}

          {recentSermons.map(function(s) {
            return (
              <div key={s.id} style={{ padding: "10px 0", borderBottom: "1px solid " + BORDER }}>
                <div style={{ fontWeight: 600, fontSize: 14, color: CHARCOAL }}>{s.title}</div>
                <div style={{ fontSize: 12, color: STONE_LIGHT, marginTop: 2 }}>
                  {s.scripture ? s.scripture + " · " : ""}{s.savedAt}
                </div>
              </div>
            );
          })}

          {recentSermons.length > 0 && (
            <Button
              variant="ghost"
              style={{ marginTop: 12, fontSize: 12 }}
              onClick={function() { setCurrentScreen("library"); }}
            >
              View All Sermons
            </Button>
          )}
        </div>
      </div>

      {showUpgradeModal && (
        <UpgradeModal onClose={() => setShowUpgradeModal(false)} />
      )}
    </div>
  );
}
function AIPastorScreen() {
  const [topic, setTopic] = useState("");
  const [context, setContext] = useState("");
  const [mode, setMode] = useState("fast");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showUpgradeMessage, setShowUpgradeMessage] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const currentUsage = { fast_used: 0, deep_used: 0 };

  const handleGenerate = useCallback(async function () {
  setError("");
  setShowUpgradeMessage(false);

  const usageCheck = canUseTool(CURRENT_USER.plan || "free", currentUsage, mode);

  if (!usageCheck.ok) {
    setError(usageCheck.message);
    setShowUpgradeMessage(true);
    return;
  }

  setLoading(true);
  setOutput("");
    try {
      var sys = "You are a deeply knowledgeable, pastoral AI ministry advisor. Speak with wisdom, biblical grounding, warmth, and clarity. Provide thoughtful, substantive pastoral guidance.";
      var prompt = "Pastoral Question / Topic: " + topic + (context.trim() ? "\n\nAdditional Context: " + context : "");
      await callSermonAPI({
  prompt: prompt,
  sys: sys,
  mode: mode,
  onChunk: function(acc) {
    setOutput(
      acc.replace(/^###\s*/gm, "").replace(/^##\s*/gm, "").replace(/^#\s*/gm, "")
    );
  }
});
    } catch (e) {
      setError(e.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  }, [topic, context, mode]);

  return (
    <div>
      <div style={styles.goldAccent} />
      <div style={styles.sectionHeader}>AI Pastor</div>
      <div style={styles.sectionSub}>Ask a pastoral question and receive biblically-grounded guidance.</div>
      <div style={styles.card}>
        <div style={styles.inputGroup}>
          <label style={styles.label}>Your Question or Topic</label>
          <input
            style={styles.input}
            value={topic}
            onChange={function(e) { setTopic(e.target.value); }}
            placeholder="e.g. How do I counsel someone grieving a loss?"
          />
        </div>
        <div style={styles.inputGroup}>
          <label style={styles.label}>Additional Context (optional)</label>
          <textarea
            style={styles.textarea}
            value={context}
            onChange={function(e) { setContext(e.target.value); }}
            placeholder="Describe the situation in more detail..."
            rows={3}
          />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <select
            style={Object.assign({}, styles.select, { width: 140 })}
            value={mode}
            onChange={function(e) { setMode(e.target.value); }}
          >
            <option value="fast">Fast Mode</option>
            <option value="deep">Deep Mode</option>
          </select>
          <Button onClick={handleGenerate} disabled={loading}>
            {loading ? "Generating..." : "Ask AI Pastor"}
          </Button>
        </div>
      </div>
                  {error && (
        <div style={styles.errorPanel}>
          {"\u26A0 "}{error}
        </div>
      )}

      {showUpgradeMessage && (
        <div
          style={{
            background: "#fff3e0",
            border: "1px solid #e0c48f",
            borderRadius: 10,
            padding: 14,
            marginTop: 12,
            marginBottom: 12,
            color: "#6b4b16",
          }}
        >
          <div style={{ fontWeight: "bold", marginBottom: 6 }}>
            Deep mode is not available on the free plan.
          </div>

          <div style={{ fontSize: 14, lineHeight: 1.6, marginBottom: 12 }}>
            Upgrade your plan to unlock Deep Mode in AI Pastor.
          </div>

          <button
            onClick={function () { setShowUpgradeModal(true); }}
            style={{
              background: "#b8860b",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "10px 14px",
              cursor: "pointer",
              fontWeight: "bold"
            }}
          >
            Upgrade Now
          </button>
        </div>
      )}

      <OutputPanel
        text={output}
        loading={loading}
        error={""}
        onCopy={function() { if (navigator.clipboard) navigator.clipboard.writeText(output); }}
      />

      {showUpgradeModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 12,
              padding: 24,
              width: "90%",
              maxWidth: 420,
              boxShadow: "0 8px 30px rgba(0,0,0,0.25)",
            }}
          >
            <div style={{ fontWeight: "bold", fontSize: 18, marginBottom: 10 }}>
              Upgrade your plan
            </div>

            <div style={{ fontSize: 14, lineHeight: 1.6, color: "#444", marginBottom: 20 }}>
              Deep mode is available on paid plans. Upgrade to unlock richer sermon generation and advanced tools.
            </div>

            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button
                style={{
                  background: "#b8860b",
                  color: "#fff",
                  border: "none",
                  borderRadius: 8,
                  padding: "10px 14px",
                  cursor: "pointer",
                  fontWeight: "bold"
                }}
              >
                Stripe checkout will be connected next
              </button>

                                                     <button
                onClick={function () { setShowUpgradeModal(false); }}
                style={{
                  background: "#eee",
                  color: "#333",
                  border: "none",
                  borderRadius: 8,
                  padding: "10px 14px",
                  cursor: "pointer",
                  fontWeight: "bold"
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TopicEngineScreen() {
  const [theme, setTheme] = useState("");
  const [season, setSeason] = useState("General");
  const [count, setCount] = useState("5");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGenerate = useCallback(async function() {
    if (!theme.trim()) {
      setError("Please enter a theme or keyword.");
      return;
    }
    setLoading(true);
    setError("");
    setResult(null);
    try {
      var sys = "You are an expert sermon topic generator for Christian ministry. Return ONLY a valid JSON object with a 'topics' array, each item having: title, scripture, summary, angle.";
      var prompt = "Generate " + count + " sermon topic ideas.\nTheme: " + theme + "\nSeason/Context: " + season + "\n\nReturn JSON only.";
      var raw = await callJSONAPI({ prompt: prompt, sys: sys, mode: "fast" });
      setResult(raw);
    } catch (e) {
      setError(e.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  }, [theme, season, count]);

  var topics = useMemo(function() {
    var parsed = safeParseJSON(result);
    if (!parsed) return [];
    return Array.isArray(parsed.topics) ? parsed.topics : [];
  }, [result]);

  var showRawFallback = result !== null && topics.length === 0 && !loading;

  return (
    <div>
      <div style={styles.goldAccent} />
      <div style={styles.sectionHeader}>Topic Engine</div>
      <div style={styles.sectionSub}>Generate compelling sermon topic ideas with Scripture anchors.</div>
      <div style={styles.card}>
        <div style={styles.grid2}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Theme or Keyword</label>
            <input
              style={styles.input}
              value={theme}
              onChange={function(e) { setTheme(e.target.value); }}
              placeholder="e.g. Forgiveness, Identity, Family"
            />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Season / Context</label>
            <select style={styles.select} value={season} onChange={function(e) { setSeason(e.target.value); }}>
              {["General", "Advent", "Easter", "Pentecost", "New Year", "Summer", "Missions"].map(function(s) {
                return <option key={s} value={s}>{s}</option>;
              })}
            </select>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <select
            style={Object.assign({}, styles.select, { width: 130 })}
            value={count}
            onChange={function(e) { setCount(e.target.value); }}
          >
            {["3", "5", "7", "10"].map(function(n) {
              return <option key={n} value={n}>{n} Topics</option>;
            })}
          </select>
          <Button onClick={handleGenerate} disabled={loading}>
            {loading ? "Generating..." : "Generate Topics"}
          </Button>
        </div>
      </div>
      {error && <div style={styles.errorPanel}>{"\u26A0 "}{error}</div>}
        {showUpgradeMessage && (
  <div
    style={{
      background: "#fff3e0",
      border: "1px solid #e0c48f",
      borderRadius: 10,
      padding: 14,
      marginTop: 12,
      color: "#6b4b16",
    }}
  >
    <div style={{ fontWeight: "bold", marginBottom: 6 }}>
      Upgrade required
    </div>

    <div style={{ marginBottom: 10 }}>
      Deep mode is available on a paid plan.
    </div>

    <button
      onClick={() => setShowUpgradeModal(true)}
      style={{
        background: "#b8860b",
        color: "#fff",
        border: "none",
        borderRadius: 8,
        padding: "10px 14px",
        cursor: "pointer",
        fontWeight: "bold"
      }}
    >
      Upgrade Now
    </button>
  </div>
)}
      {loading && !result && (
        <div style={styles.outputPanel}>
          <span style={{ color: STONE_LIGHT, fontStyle: "italic" }}>Generating topics...</span>
        </div>
      )}
      {topics.length > 0 && (
        <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 14 }}>
          {topics.map(function(t, i) {
            return (
              <div key={i} style={styles.card}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 16, color: CHARCOAL, marginBottom: 4 }}>
                      {t.title || ("Topic " + (i + 1))}
                    </div>
                    {t.scripture && (
                      <div style={{ fontSize: 13, color: GOLD, marginBottom: 6 }}>{"\uD83D\uDCDA "}{t.scripture}</div>
                    )}
                    {t.summary && (
                      <div style={{ fontSize: 14, color: STONE, lineHeight: 1.6 }}>{t.summary}</div>
                    )}
                    {t.angle && (
                      <div style={{ fontSize: 13, color: STONE_LIGHT, marginTop: 6, fontStyle: "italic" }}>Angle: {t.angle}</div>
                    )}
                  </div>
                  <span style={Object.assign({}, styles.tag, styles.tagGold, { flexShrink: 0 })}>{"#" + (i + 1)}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {showRawFallback && (
        <div style={styles.outputPanel}>
          {typeof result === "string" ? result : JSON.stringify(result, null, 2)}
        </div>
      )}
    </div>
  );
}

function SermonForgeScreen({ onSave }) {
  const [title, setTitle] = useState("");
  const [scripture, setScripture] = useState("");
  const [angle, setAngle] = useState("");
  const [audience, setAudience] = useState("General Congregation");
  const [mode, setMode] = useState("deep");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showUpgradeMessage, setShowUpgradeMessage] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const currentUsage = { fast_used: 0, deep_used: 0 };

  const handleForge = useCallback(async function() {
    if (!title.trim() && !scripture.trim()) {
      setError("Please provide a title or scripture reference.");
      return;
    }

        setError("");
    setShowUpgradeMessage(false);

    const usageCheck = canUseTool(CURRENT_USER.plan || "free", currentUsage, mode);

    if (!usageCheck.ok) {
      setError(usageCheck.message);
      setShowUpgradeMessage(true);
      return;
    }

    setLoading(true);
    setOutput("");
    try {
      var sys = "You are an expert sermon writer with deep theological training. Write complete, structured, compelling sermons with introduction, body points, illustrations, and a powerful conclusion. Use vivid language and pastoral warmth.";
      var prompt = "Write a full sermon.\nTitle: " + (title || "(untitled)") + "\nScripture: " + (scripture || "(none specified)") + "\nAngle/Focus: " + (angle || "general") + "\nAudience: " + audience;
      await callSermonAPI({
  prompt: prompt,
  sys: sys,
  mode: mode,
  onChunk: function(acc) {
    setOutput(
      acc.replace(/^###\s*/gm, "").replace(/^##\s*/gm, "").replace(/^#\s*/gm, "")
    );
  }
});
    } catch (e) {
      setError(e.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  }, [title, scripture, angle, audience, mode]);

  const handleSave = useCallback(function() {
    if (!output) return;
    onSave({
      title: title.trim() || "Untitled Sermon",
      scripture: scripture.trim(),
      content: output,
      savedAt: new Date().toLocaleDateString(),
    });
  }, [output, title, scripture, onSave]);

  return (
    <div>
      <div style={styles.goldAccent} />
      <div style={styles.sectionHeader}>Sermon Forge</div>
      <div style={styles.sectionSub}>Craft complete, polished sermons powered by deep theological AI.</div>
      <div style={styles.card}>
        <div style={styles.grid2}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Sermon Title</label>
            <input
              style={styles.input}
              value={title}
              onChange={function(e) { setTitle(e.target.value); }}
              placeholder="e.g. Walking in the Light"
            />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Scripture Reference</label>
            <input
              style={styles.input}
              value={scripture}
              onChange={function(e) { setScripture(e.target.value); }}
              placeholder="e.g. John 8:12"
            />
          </div>
        </div>
        <div style={styles.inputGroup}>
          <label style={styles.label}>Sermon Angle / Focus</label>
          <textarea
            style={styles.textarea}
            value={angle}
            onChange={function(e) { setAngle(e.target.value); }}
            placeholder="What specific message or takeaway should this sermon deliver?"
            rows={2}
          />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <select
            style={Object.assign({}, styles.select, { width: 200 })}
            value={audience}
            onChange={function(e) { setAudience(e.target.value); }}
          >
            {[
              "General Congregation",
              "Youth Ministry",
              "New Believers",
              "Men's Ministry",
              "Women's Ministry",
              "Leadership/Elders",
              "Outreach/Evangelism",
            ].map(function(a) {
              return <option key={a} value={a}>{a}</option>;
            })}
          </select>
          <select
            style={Object.assign({}, styles.select, { width: 140 })}
            value={mode}
            onChange={function(e) { setMode(e.target.value); }}
          >
            <option value="fast">Fast Mode</option>
            <option value="deep">Deep Mode</option>
          </select>
          <Button onClick={handleForge} disabled={loading}>
            {loading ? "Forging..." : "Forge Sermon"}
          </Button>
        </div>
      </div>
                  {error && (
        <div style={styles.errorPanel}>
          {"\u26A0 "}{error}
        </div>
      )}

      {showUpgradeMessage && (
        <div
          style={{
            background: "#fff3e0",
            border: "1px solid #e0c48f",
            borderRadius: 10,
            padding: 14,
            marginTop: 12,
            marginBottom: 12,
            color: "#6b4b16",
          }}
        >
          <div style={{ fontWeight: "bold", marginBottom: 6 }}>
            Deep mode is not available on the free plan.
          </div>

          <div style={{ fontSize: 14, lineHeight: 1.6, marginBottom: 12 }}>
            Upgrade your plan to unlock Deep Mode in Sermon Forge.
          </div>

          <button
            onClick={function () { setShowUpgradeModal(true); }}
            style={{
              background: "#b8860b",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "10px 14px",
              cursor: "pointer",
              fontWeight: "bold"
            }}
          >
            Upgrade Now
          </button>
        </div>
      )}

      <OutputPanel
        text={output}
        loading={loading}
        error={""}
        onCopy={function() { if (navigator.clipboard) navigator.clipboard.writeText(output); }}
        onSave={handleSave}
      />

      {showUpgradeModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 12,
              padding: 24,
              width: "90%",
              maxWidth: 420,
              boxShadow: "0 8px 30px rgba(0,0,0,0.25)",
            }}
          >
            <div style={{ fontWeight: "bold", fontSize: 18, marginBottom: 10 }}>
              Upgrade your plan
            </div>

            <div style={{ fontSize: 14, lineHeight: 1.6, color: "#444", marginBottom: 20 }}>
              Deep mode is available on paid plans. Upgrade to unlock richer sermon generation and advanced tools.
            </div>

            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button
                style={{
                  background: "#b8860b",
                  color: "#fff",
                  border: "none",
                  borderRadius: 8,
                  padding: "10px 14px",
                  cursor: "pointer",
                  fontWeight: "bold"
                }}
              >
                Stripe checkout will be connected next
              </button>

              <button
                onClick={function () { setShowUpgradeModal(false); }}
                style={{
                  background: "#eee",
                  color: "#333",
                  border: "none",
                  borderRadius: 8,
                  padding: "10px 14px",
                  cursor: "pointer",
                  fontWeight: "bold"
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function WordStudyScreen() {
  const [word, setWord] = useState("");
  const [verse, setVerse] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleStudy = useCallback(async function() {
    if (!word.trim() && !verse.trim()) {
      setError("Please enter a word or verse to study.");
      return;
    }
    setLoading(true);
    setError("");
    setResult(null);
    try {
      var sys = "You are a biblical scholar. Return ONLY a valid JSON object with: word, original (Hebrew/Greek), transliteration, definition, uses (array of {reference, context}), themes (array of strings), commentary (string).";
      var prompt = "Biblical word study.\nWord or Concept: " + (word || "(from verse)") + "\nVerse Reference: " + (verse || "(none)") + "\n\nReturn JSON only.";
      var raw = await callJSONAPI({ prompt: prompt, sys: sys, mode: "fast" });
      setResult(raw);
    } catch (e) {
      setError(e.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  }, [word, verse]);

  var study = useMemo(function() {
    return safeParseJSON(result);
  }, [result]);

  return (
    <div>
      <div style={styles.goldAccent} />
      <div style={styles.sectionHeader}>Word Study</div>
      <div style={styles.sectionSub}>Explore the original Hebrew and Greek meanings of Scripture.</div>
      <div style={styles.card}>
        <div style={styles.grid2}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Word or Concept</label>
            <input
              style={styles.input}
              value={word}
              onChange={function(e) { setWord(e.target.value); }}
              placeholder="e.g. Grace, Shalom, Logos"
            />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Verse Reference (optional)</label>
            <input
              style={styles.input}
              value={verse}
              onChange={function(e) { setVerse(e.target.value); }}
              placeholder="e.g. John 1:1"
            />
          </div>
        </div>
        <Button onClick={handleStudy} disabled={loading}>
          {loading ? "Studying..." : "Study Word"}
        </Button>
      </div>
      {error && <div style={styles.errorPanel}>{"\u26A0 "}{error}</div>}
        {showUpgradeMessage && (
  <div
    style={{
      background: "#fff3e0",
      border: "1px solid #e0c48f",
      borderRadius: 10,
      padding: 14,
      marginTop: 12,
      color: "#6b4b16",
    }}
  >
    <div style={{ fontWeight: "bold", marginBottom: 6 }}>
      Upgrade Required
    </div>

    <div style={{ fontSize: 14, lineHeight: 1.6, marginBottom: 12 }}>
      Deep sermon generation is available on paid plans. Upgrade your account to unlock deeper sermon creation.
    </div>

    <button
      style={{
        background: "#b8860b",
        color: "white",
        border: "none",
        borderRadius: 8,
        padding: "10px 14px",
        cursor: "pointer",
        fontWeight: "bold"
      }}
      onClick={function () {
        setShowUpgradeModal(true);
      }}
    >
      Upgrade Now
    </button>
  </div>
)}
      {loading && !result && (
        <div style={styles.outputPanel}>
          <span style={{ color: STONE_LIGHT, fontStyle: "italic" }}>Analyzing scripture...</span>
        </div>
      )}
      {study && (
        <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={styles.card}>
            <div style={{ fontSize: 22, fontWeight: 700, color: CHARCOAL, marginBottom: 4 }}>
              {study.word || word}
            </div>
            {study.original && (
              <div style={{ fontSize: 18, color: GOLD, marginBottom: 4 }}>
                {study.original}
                {study.transliteration && (
                  <span style={{ fontSize: 14, color: STONE_LIGHT }}>{" (" + study.transliteration + ")"}</span>
                )}
              </div>
            )}
            {study.definition && (
              <div style={{ fontSize: 15, color: STONE, lineHeight: 1.7, marginBottom: 12 }}>{study.definition}</div>
            )}
            {study.commentary && (
              <div>
                <div style={styles.label}>Commentary</div>
                <div style={{ fontSize: 14, color: CHARCOAL, lineHeight: 1.7 }}>{study.commentary}</div>
              </div>
            )}
          </div>
          {Array.isArray(study.uses) && study.uses.length > 0 && (
            <div style={styles.card}>
              <div style={styles.cardTitle}>Key Uses in Scripture</div>
              <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 10 }}>
                {study.uses.map(function(u, i) {
                  return (
                    <div
                      key={i}
                      style={{ padding: "10px 14px", backgroundColor: CREAM, borderRadius: 8, borderLeft: "3px solid " + GOLD }}
                    >
                      <div style={{ fontWeight: 600, color: GOLD, fontSize: 13 }}>{u.reference}</div>
                      <div style={{ fontSize: 14, color: STONE, marginTop: 2 }}>{u.context}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          {Array.isArray(study.themes) && study.themes.length > 0 && (
            <div style={styles.card}>
              <div style={styles.cardTitle}>Themes</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
                {study.themes.map(function(t, i) {
                  return (
                    <span key={i} style={Object.assign({}, styles.tag, styles.tagGold)}>{t}</span>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
      {result && !study && (
        <div style={styles.outputPanel}>
          {typeof result === "string" ? result : JSON.stringify(result, null, 2)}
        </div>
      )}
    </div>
  );
}

function IllustrationsScreen() {
  const [topic, setTopic] = useState("");
  const [illType, setIllType] = useState("Story");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGenerate = useCallback(async function() {
    if (!topic.trim()) {
      setError("Please enter a sermon topic or theme.");
      return;
    }

    const usageCheck = canUseTool(CURRENT_USER.plan || "free", currentUsage, mode);

if (!usageCheck.ok) {
  setError(usageCheck.message);
  return;
}
    setLoading(true);
    setError("");
    setResult(null);
    try {
      var sys = "You are a masterful sermon illustrator. Return ONLY a valid JSON object with an 'illustrations' array, each having: title, type, content, application, scripture (optional).";
      var prompt = "Generate 3 sermon illustrations.\nType: " + illType + "\nTopic/Theme: " + topic + "\n\nReturn JSON only.";
      var raw = await callJSONAPI({ prompt: prompt, sys: sys, mode: "fast" });
      setResult(raw);
    } catch (e) {
      setError(e.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  }, [topic, illType]);

  var illustrations = useMemo(function() {
    var parsed = safeParseJSON(result);
    if (!parsed) return [];
    return Array.isArray(parsed.illustrations) ? parsed.illustrations : [];
  }, [result]);

  var showRawFallback = result !== null && illustrations.length === 0 && !loading;

  return (
    <div>
      <div style={styles.goldAccent} />
      <div style={styles.sectionHeader}>Illustrations</div>
      <div style={styles.sectionSub}>Generate vivid sermon illustrations, stories, and object lessons.</div>
      <div style={styles.card}>
        <div style={styles.grid2}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Sermon Topic or Theme</label>
            <input
              style={styles.input}
              value={topic}
              onChange={function(e) { setTopic(e.target.value); }}
              placeholder="e.g. Redemption, Service, Courage"
            />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Illustration Type</label>
            <select style={styles.select} value={illType} onChange={function(e) { setIllType(e.target.value); }}>
              {["Story", "Object Lesson", "Historical", "Contemporary", "Parable", "Metaphor"].map(function(t) {
                return <option key={t} value={t}>{t}</option>;
              })}
            </select>
          </div>
        </div>
        <Button onClick={handleGenerate} disabled={loading}>
          {loading ? "Generating..." : "Generate Illustrations"}
        </Button>
      </div>
      {error && <div style={styles.errorPanel}>{"\u26A0 "}{error}</div>}
      {loading && !result && (
        <div style={styles.outputPanel}>
          <span style={{ color: STONE_LIGHT, fontStyle: "italic" }}>Crafting illustrations...</span>
        </div>
      )}
      {illustrations.length > 0 && (
        <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 16 }}>
          {illustrations.map(function(ill, i) {
            return (
              <div key={i} style={styles.card}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10 }}>
                  <div style={{ fontWeight: 700, fontSize: 16, color: CHARCOAL }}>
                    {ill.title || ("Illustration " + (i + 1))}
                  </div>
                  <span style={Object.assign({}, styles.tag, styles.tagGold)}>{ill.type || illType}</span>
                </div>
                {ill.content && (
                  <div style={{ fontSize: 14, color: STONE, lineHeight: 1.7, marginBottom: 12 }}>{ill.content}</div>
                )}
                {ill.application && (
                  <div style={{ padding: "10px 14px", backgroundColor: GOLD_PALE, borderRadius: 8 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: GOLD, marginBottom: 4, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                      Application
                    </div>
                    <div style={{ fontSize: 13, color: CHARCOAL }}>{ill.application}</div>
                  </div>
                )}
                {ill.scripture && (
                  <div style={{ fontSize: 13, color: GOLD, marginTop: 10 }}>{"\uD83D\uDCDA "}{ill.scripture}</div>
                )}
              </div>
            );
          })}
        </div>
      )}
      {showRawFallback && (
        <div style={styles.outputPanel}>
          {typeof result === "string" ? result : JSON.stringify(result, null, 2)}
        </div>
      )}
    </div>
  );
}

function LibraryScreen({ library: sermons, onDelete }) {
  const [search, setSearch] = useState("");

  var filtered = useMemo(function() {
    var q = search.trim().toLowerCase();
    if (!q) return sermons;
    return sermons.filter(function(s) {
      return (s.title && s.title.toLowerCase().indexOf(q) !== -1) ||
        (s.scripture && s.scripture.toLowerCase().indexOf(q) !== -1);
    });
  }, [sermons, search]);

  return (
    <div>
      <div style={styles.goldAccent} />
      <div style={styles.sectionHeader}>My Sermons</div>
      <div style={styles.sectionSub}>Your personal sermon library — saved directly from Sermon Forge.</div>
      <div style={{ marginBottom: 20 }}>
        <input
          style={styles.input}
          value={search}
          onChange={function(e) { setSearch(e.target.value); }}
          placeholder="Search by title or scripture..."
        />
      </div>
      {filtered.length === 0 && (
        <div style={Object.assign({}, styles.card, { color: STONE_LIGHT, fontStyle: "italic", fontSize: 14, textAlign: "center", padding: "40px 20px" })}>
          {sermons.length === 0
            ? "No sermons saved yet. Use Sermon Forge and save your first sermon."
            : "No sermons match your search."}
        </div>
      )}
      {filtered.map(function(s) {
        return (
          <div key={s.id} style={Object.assign({}, styles.card, { marginBottom: 14 })}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 16, color: CHARCOAL, marginBottom: 4 }}>{s.title}</div>
                {s.scripture && (
                  <div style={{ fontSize: 13, color: GOLD, marginBottom: 6 }}>{"\uD83D\uDCDA "}{s.scripture}</div>
                )}
                <div style={{ fontSize: 12, color: STONE_LIGHT }}>Saved {s.savedAt}</div>
              </div>
              <Button variant="ghost" style={{ fontSize: 12 }} onClick={function() { onDelete(s.id); }}>Remove</Button>
            </div>
            {s.content && (
              <div style={{ marginTop: 12, padding: "12px 14px", backgroundColor: CREAM, borderRadius: 8, fontSize: 14, color: STONE, lineHeight: 1.7, maxHeight: 120, overflow: "hidden" }}>
                {s.content.length > 300 ? s.content.slice(0, 300) + "..." : s.content}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function SeriesPlannerScreen() {
  const [seriesTitle, setSeriesTitle] = useState("");
  const [theme, setTheme] = useState("");
  const [weeks, setWeeks] = useState("4");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handlePlan = useCallback(async function() {
    if (!seriesTitle.trim() && !theme.trim()) {
      setError("Please enter a series title or theme.");
      return;
    }
    setLoading(true);
    setError("");
    setResult(null);
    try {
      var sys = "You are an expert sermon series strategist. Return ONLY a valid JSON object with: series_title, overview, sermons (array of {week, title, scripture, summary, key_point}).";
      var prompt = "Plan a " + weeks + "-week sermon series.\nTitle: " + (seriesTitle || theme) + "\nTheme/Focus: " + (theme || seriesTitle) + "\n\nReturn JSON only.";
      var raw = await callJSONAPI({ prompt: prompt, sys: sys, mode: "fast" });
      setResult(raw);
    } catch (e) {
      setError(e.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  }, [seriesTitle, theme, weeks]);

  var plan = useMemo(function() {
    return safeParseJSON(result);
  }, [result]);

  return (
    <div>
      <div style={styles.goldAccent} />
      <div style={styles.sectionHeader}>Series Planner</div>
      <div style={styles.sectionSub}>Architect a complete multi-week sermon series with scripture and key points.</div>
      <div style={styles.card}>
        <div style={styles.grid2}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Series Title</label>
            <input
              style={styles.input}
              value={seriesTitle}
              onChange={function(e) { setSeriesTitle(e.target.value); }}
              placeholder="e.g. Unshakeable Faith"
            />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Central Theme</label>
            <input
              style={styles.input}
              value={theme}
              onChange={function(e) { setTheme(e.target.value); }}
              placeholder="e.g. Perseverance through trials"
            />
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <select
            style={Object.assign({}, styles.select, { width: 140 })}
            value={weeks}
            onChange={function(e) { setWeeks(e.target.value); }}
          >
            {["3", "4", "5", "6", "8", "10", "12"].map(function(n) {
              return <option key={n} value={n}>{n} Weeks</option>;
            })}
          </select>
          <Button onClick={handlePlan} disabled={loading}>
            {loading ? "Planning..." : "Plan Series"}
          </Button>
        </div>
      </div>
      {error && <div style={styles.errorPanel}>{"\u26A0 "}{error}</div>}
      {loading && !result && (
        <div style={styles.outputPanel}>
          <span style={{ color: STONE_LIGHT, fontStyle: "italic" }}>Architecting your series...</span>
        </div>
      )}
      {plan && (
        <div style={{ marginTop: 20 }}>
          <div style={Object.assign({}, styles.card, { marginBottom: 16 })}>
            <div style={{ fontWeight: 700, fontSize: 20, color: CHARCOAL, marginBottom: 6 }}>
              {plan.series_title || seriesTitle}
            </div>
            {plan.overview && (
              <div style={{ fontSize: 14, color: STONE, lineHeight: 1.7 }}>{plan.overview}</div>
            )}
          </div>
          {Array.isArray(plan.sermons) && plan.sermons.map(function(s, i) {
            return (
              <div key={i} style={Object.assign({}, styles.card, { marginBottom: 12 })}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                  <div style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    backgroundColor: GOLD_PALE,
                    border: "2px solid " + GOLD,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700,
                    color: GOLD,
                    fontSize: 16,
                    flexShrink: 0,
                  }}>
                    {s.week || (i + 1)}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 16, color: CHARCOAL, marginBottom: 2 }}>{s.title}</div>
                    {s.scripture && (
                      <div style={{ fontSize: 13, color: GOLD, marginBottom: 6 }}>{"\uD83D\uDCDA "}{s.scripture}</div>
                    )}
                    {s.summary && (
                      <div style={{ fontSize: 14, color: STONE, lineHeight: 1.6, marginBottom: 6 }}>{s.summary}</div>
                    )}
                    {s.key_point && (
                      <div style={{ fontSize: 13, color: CHARCOAL, padding: "6px 12px", backgroundColor: GOLD_PALE, borderRadius: 6, display: "inline-block" }}>
                        <strong>Key Point:</strong>{" "}{s.key_point}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {result && !plan && (
        <div style={styles.outputPanel}>
          {typeof result === "string" ? result : JSON.stringify(result, null, 2)}
        </div>
      )}
    </div>
  );
}

// ─── ADMIN SCREENS ────────────────────────────────────────────────────────────

function ChurchOverviewScreen() {
  return (
    <div>
      <div style={styles.goldAccent} />
      <div style={styles.sectionHeader}>{SEED_CHURCH.name}</div>
      <div style={styles.sectionSub}>
        {SEED_CHURCH.denomination + " \u00B7 " + SEED_CHURCH.city + " \u00B7 Est. " + SEED_CHURCH.founded}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 20, marginBottom: 28 }}>
        <StatCard value={SEED_CHURCH.members.toLocaleString()} label="Total Members" icon={"\uD83D\uDE4F"} />
        <StatCard value={SEED_CHURCH.branches} label="Campuses" icon={"\uD83C\uDF3F"} />
        <StatCard value={SEED_USERS.length} label="Pastors / Users" icon={"\uD83D\uDC64"} />
        <StatCard value={SEED_SERMONS.length} label="Total Sermons" icon={"\uD83D\uDCDC"} />
      </div>
      <div style={styles.grid2}>
        <div style={styles.card}>
          <div style={styles.cardTitle}>Campus Breakdown</div>
          <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 10 }}>
            {SEED_BRANCHES.map(function(b) {
              return (
                <div
                  key={b.id}
                  style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid " + BORDER }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{b.name}</div>
                    <div style={{ fontSize: 12, color: STONE_LIGHT }}>{b.city + " \u00B7 " + b.pastor}</div>
                  </div>
                  <span style={{ fontWeight: 700, color: GOLD }}>{b.members.toLocaleString()}</span>
                </div>
              );
            })}
          </div>
        </div>
        <div style={styles.card}>
          <div style={styles.cardTitle}>Recent Sermons</div>
          <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 8 }}>
            {SEED_SERMONS.slice(0, 4).map(function(s) {
              return (
                <div key={s.id} style={{ padding: "8px 0", borderBottom: "1px solid " + BORDER }}>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{s.title}</div>
                  <div style={{ fontSize: 12, color: STONE_LIGHT }}>{s.pastor + " \u00B7 " + s.date}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function BranchesScreen() {
  return (
    <div>
      <div style={styles.goldAccent} />
      <div style={styles.sectionHeader}>Branches &amp; Campuses</div>
      <div style={styles.sectionSub}>Manage all church campuses and branch locations.</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {SEED_BRANCHES.map(function(b) {
          return (
            <div key={b.id} style={styles.card}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 17, color: CHARCOAL, marginBottom: 4 }}>{b.name}</div>
                  <div style={{ fontSize: 13, color: STONE, marginBottom: 2 }}>{"\uD83D\uDCCD " + b.city}</div>
                  <div style={{ fontSize: 13, color: STONE }}>Lead Pastor: <strong>{b.pastor}</strong></div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontWeight: 700, fontSize: 22, color: GOLD }}>{b.members.toLocaleString()}</div>
                  <div style={{ fontSize: 11, color: STONE_LIGHT, textTransform: "uppercase", letterSpacing: "0.06em" }}>Members</div>
                  <span style={Object.assign({}, styles.tag, styles.tagGreen, { marginTop: 8, display: "inline-block" })}>Active</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PastorAccountsScreen() {
  return (
    <div>
      <div style={styles.goldAccent} />
      <div style={styles.sectionHeader}>Pastor Accounts</div>
      <div style={styles.sectionSub}>Manage ministry staff and user access.</div>
      <div style={styles.card}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Name</th>
              <th style={styles.th}>Role</th>
              <th style={styles.th}>Branch</th>
              <th style={styles.th}>Email</th>
              <th style={styles.th}>Sermons</th>
              <th style={styles.th}>Status</th>
            </tr>
          </thead>
          <tbody>
            {SEED_USERS.map(function(u) {
              return (
                <tr key={u.id}>
                  <td style={Object.assign({}, styles.td, { fontWeight: 600 })}>{u.name}</td>
                  <td style={styles.td}>
                    <span style={Object.assign({}, styles.tag, styles.tagGold)}>{u.role}</span>
                  </td>
                  <td style={styles.td}>{u.branch}</td>
                  <td style={Object.assign({}, styles.td, { color: STONE_LIGHT, fontSize: 13 })}>{u.email}</td>
                  <td style={Object.assign({}, styles.td, { fontWeight: 600, color: GOLD })}>{u.sermons}</td>
                  <td style={styles.td}>
                    <span style={Object.assign({}, styles.tag, styles.tagGreen)}>Active</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ActivityScreen() {
  var activityData = [
    { label: "Sermons Generated", value: 156, icon: "\uD83D\uDCDC" },
    { label: "Topics Created", value: 412, icon: "\uD83D\uDCA1" },
    { label: "Word Studies", value: 89, icon: "\uD83D\uDCDA" },
    { label: "Illustrations", value: 234, icon: "\uD83D\uDDBC" },
    { label: "Series Plans", value: 27, icon: "\uD83D\uDCC5" },
    { label: "AI Pastor Queries", value: 531, icon: "\u271D" },
  ];

  var recentActivity = [
    { user: "Rev. Daniel Brooks", action: "Generated sermon: Walking in the Light", time: "2 hours ago" },
    { user: "Pastor Sarah Kim", action: "Created a 6-week series plan: Unshakeable Faith", time: "5 hours ago" },
    { user: "Pastor Marcus Webb", action: "Completed word study: Shalom", time: "Yesterday" },
    { user: "Elder Thomas Grace", action: "Generated 5 sermon topics on Humility", time: "Yesterday" },
    { user: "Rev. Daniel Brooks", action: "Saved sermon to library: The Shepherd's Voice", time: "2 days ago" },
  ];

  return (
    <div>
      <div style={styles.goldAccent} />
      <div style={styles.sectionHeader}>Activity &amp; Stats</div>
      <div style={styles.sectionSub}>Platform-wide usage and ministry activity overview.</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20, marginBottom: 28 }}>
        {activityData.map(function(a) {
          return <StatCard key={a.label} value={a.value} label={a.label} icon={a.icon} />;
        })}
      </div>
      <div style={styles.card}>
        <div style={styles.cardTitle}>Recent Activity Log</div>
        <div style={{ marginTop: 14 }}>
          {recentActivity.map(function(item, i) {
            return (
              <div
                key={i}
                style={{ display: "flex", justifyContent: "space-between", padding: "11px 0", borderBottom: "1px solid " + BORDER }}
              >
                <div>
                  <span style={{ fontWeight: 600, fontSize: 13 }}>{item.user}</span>
                  <span style={{ fontSize: 13, color: STONE, marginLeft: 8 }}>{item.action}</span>
                </div>
                <span style={{ fontSize: 12, color: STONE_LIGHT, flexShrink: 0, marginLeft: 16 }}>{item.time}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function AllSermonsScreen() {
  return (
    <div>
      <div style={styles.goldAccent} />
      <div style={styles.sectionHeader}>All Sermons</div>
      <div style={styles.sectionSub}>Browse all sermons across every campus and pastor.</div>
      <div style={styles.card}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Title</th>
              <th style={styles.th}>Scripture</th>
              <th style={styles.th}>Pastor</th>
              <th style={styles.th}>Series</th>
              <th style={styles.th}>Date</th>
              <th style={styles.th}>Status</th>
            </tr>
          </thead>
          <tbody>
            {SEED_SERMONS.map(function(s) {
              return (
                <tr key={s.id}>
                  <td style={Object.assign({}, styles.td, { fontWeight: 600 })}>{s.title}</td>
                  <td style={Object.assign({}, styles.td, { color: GOLD, fontSize: 13 })}>{s.scripture}</td>
                  <td style={styles.td}>{s.pastor}</td>
                  <td style={Object.assign({}, styles.td, { color: STONE_LIGHT, fontSize: 13 })}>{s.series || "\u2014"}</td>
                  <td style={Object.assign({}, styles.td, { fontSize: 13, color: STONE_LIGHT })}>{s.date}</td>
                  <td style={styles.td}>
                    <span style={Object.assign({}, styles.tag, s.status === "published" ? styles.tagGreen : styles.tagGray)}>
                      {s.status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ChurchSettingsScreen() {
  const [name, setName] = useState(SEED_CHURCH.name);
  const [denom, setDenom] = useState(SEED_CHURCH.denomination);
  const [city, setCity] = useState(SEED_CHURCH.city);
  const [saved, setSaved] = useState(false);
  const timerRef = useRef(null);

  useEffect(function() {
    return function() {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleSave = useCallback(function() {
    if (timerRef.current) clearTimeout(timerRef.current);
    setSaved(true);
    timerRef.current = setTimeout(function() { setSaved(false); }, 2500);
  }, []);

  return (
    <div>
      <div style={styles.goldAccent} />
      <div style={styles.sectionHeader}>Church Settings</div>
      <div style={styles.sectionSub}>Update your church profile and configuration.</div>
      <div style={Object.assign({}, styles.card, { maxWidth: 600 })}>
        <div style={styles.inputGroup}>
          <label style={styles.label}>Church Name</label>
          <input style={styles.input} value={name} onChange={function(e) { setName(e.target.value); }} />
        </div>
        <div style={styles.inputGroup}>
          <label style={styles.label}>Denomination</label>
          <input style={styles.input} value={denom} onChange={function(e) { setDenom(e.target.value); }} />
        </div>
        <div style={styles.inputGroup}>
          <label style={styles.label}>Primary Location</label>
          <input style={styles.input} value={city} onChange={function(e) { setCity(e.target.value); }} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 8 }}>
          <Button onClick={handleSave}>Save Changes</Button>
          {saved && (
            <span style={{ fontSize: 13, color: "#27AE60", fontWeight: 600 }}>{"\u2713 Saved successfully"}</span>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export default function SermonCraftPro() {
  const [currentScreen, setCurrentScreen] = useState("dashboard");
  const [viewMode, setViewMode] = useState("pastor");
  const [library, setLibrary] = useState([]);
  const libCounter = useRef(100);

  const handleSaveToLibrary = useCallback(function(sermon) {
    libCounter.current += 1;
    var newId = libCounter.current;
    setLibrary(function(prev) { return [Object.assign({}, sermon, { id: newId }), ...prev]; });
  }, []);

  const handleDeleteFromLibrary = useCallback(function(id) {
    setLibrary(function(prev) { return prev.filter(function(s) { return s.id !== id; }); });
  }, []);

  const handleModeSwitch = useCallback(function(mode) {
    setViewMode(mode);
    setCurrentScreen(mode === "pastor" ? "dashboard" : "church-overview");
  }, []);

  var pageTitle = useMemo(function() {
    var allNav = PASTOR_NAV.concat(ADMIN_NAV);
    var found = allNav.find(function(n) { return n.id === currentScreen; });
    return found ? found.label : "Dashboard";
  }, [currentScreen]);

  var initials = CURRENT_USER.name
    .split(" ")
    .map(function(n) { return n[0]; })
    .join("")
    .slice(0, 2)
    .toUpperCase();

  function renderScreen() {
    switch (currentScreen) {
      case "dashboard":
        return <DashboardScreen user={CURRENT_USER} library={library} setCurrentScreen={setCurrentScreen} />;
      case "ai-pastor":
        return <AIPastorScreen />;
      case "topic-engine":
        return <TopicEngineScreen />;
      case "sermon-forge":
        return <SermonForgeScreen onSave={handleSaveToLibrary} />;
      case "word-study":
        return <WordStudyScreen />;
      case "illustrations":
        return <IllustrationsScreen />;
      case "library":
        return <LibraryScreen library={library} onDelete={handleDeleteFromLibrary} />;
      case "series-planner":
        return <SeriesPlannerScreen />;
      case "church-overview":
        return <ChurchOverviewScreen />;
      case "branches":
        return <BranchesScreen />;
      case "pastor-accounts":
        return <PastorAccountsScreen />;
      case "activity":
        return <ActivityScreen />;
      case "all-sermons":
        return <AllSermonsScreen />;
      case "church-settings":
        return <ChurchSettingsScreen />;
      default:
        return <DashboardScreen user={CURRENT_USER} library={library} setCurrentScreen={setCurrentScreen} />;
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.sidebar}>
        <div style={styles.sidebarHeader}>
          <div style={styles.logoMark}>{"\u271D"}</div>
          <div style={styles.churchName}>SermonCraft Pro</div>
          <div style={{ fontSize: 11, color: STONE_LIGHT, marginTop: 4 }}>{SEED_CHURCH.name}</div>
        </div>

        <div style={{ padding: "12px 12px 0" }}>
          <div style={{
            display: "flex",
            gap: 4,
            backgroundColor: CREAM,
            borderRadius: 8,
            padding: 4,
            border: "1px solid " + BORDER,
          }}>
            {["pastor", "admin"].map(function(mode) {
              return (
                <button
                  key={mode}
                  onClick={function() { handleModeSwitch(mode); }}
                  style={{
                    flex: 1,
                    padding: "6px 0",
                    border: "none",
                    borderRadius: 6,
                    cursor: "pointer",
                    fontSize: 12,
                    fontWeight: 700,
                    letterSpacing: "0.04em",
                    textTransform: "uppercase",
                    fontFamily: "'Georgia', serif",
                    backgroundColor: viewMode === mode ? GOLD : "transparent",
                    color: viewMode === mode ? "#fff" : STONE,
                    transition: "all 0.15s",
                  }}
                >
                  {mode === "pastor" ? "Pastor" : "Admin"}
                </button>
              );
            })}
          </div>
        </div>

        <div style={styles.navSection}>
          <div style={styles.navLabel}>
            {viewMode === "pastor" ? "Ministry Tools" : "Church Admin"}
          </div>
          {(viewMode === "pastor" ? PASTOR_NAV : ADMIN_NAV).map(function(item) {
            return (
              <NavItem
                key={item.id}
                item={item}
                active={currentScreen === item.id}
                onClick={setCurrentScreen}
              />
            );
          })}
        </div>

        <div style={{ marginTop: "auto", padding: "16px", borderTop: "1px solid " + BORDER }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={styles.avatar}>{initials}</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: CHARCOAL }}>{CURRENT_USER.name}</div>
              <div style={{ fontSize: 11, color: STONE_LIGHT }}>{CURRENT_USER.role}</div>
            </div>
          </div>
        </div>
      </div>

      <div style={styles.mainContent}>
        <div style={styles.topBar}>
          <div style={styles.pageTitle}>{pageTitle}</div>
          <div style={styles.userBadge}>
            <div style={styles.avatar}>{initials}</div>
            <span>{CURRENT_USER.church}</span>
            {CURRENT_USER.isAdmin && (
              <span style={Object.assign({}, styles.tag, styles.tagGold)}>Admin</span>
            )}
          </div>
        </div>

        <div style={styles.scrollArea}>
          {renderScreen()}
        </div>
      </div>
    </div>
  );
}
