import { useState, useEffect, useRef } from "react";

// ─────────────────────────────────────────────
// GLOBAL STYLES
// ─────────────────────────────────────────────
const G = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,400;1,600&family=Cinzel:wght@400;500;600;700;900&family=Crimson+Pro:ital,wght@0,300;0,400;0,600;1,400&display=swap');
    :root{
      --gold:#C9A84C;--gold-light:#E8C97A;--gold-dim:#7a6230;
      --ink:#0B0A0F;--deep:#100E1A;--panel:rgba(16,13,26,0.94);
      --border:rgba(201,168,76,0.2);--border-hi:rgba(201,168,76,0.55);
      --text:#EDE4CC;--text-dim:#9A8F72;--text-faint:#5A5040;
      --teal:#3A8CA8;--green:#5a9e72;--red:#c24b3a;--purple:#8b6db0;
      --r:13px;
    }
    *{box-sizing:border-box;margin:0;padding:0;}
    body{background:var(--ink);color:var(--text);font-family:'Crimson Pro',Georgia,serif;min-height:100vh;overflow-x:hidden;}
    .cin{font-family:'Cinzel',serif;}
    .cor{font-family:'Cormorant Garamond',serif;}
    ::-webkit-scrollbar{width:5px;}
    ::-webkit-scrollbar-thumb{background:var(--gold-dim);border-radius:3px;}
    @keyframes fadeUp{from{opacity:0;transform:translateY(14px);}to{opacity:1;transform:translateY(0);}}
    @keyframes spin{to{transform:rotate(360deg);}}
    @keyframes shimmer{0%{background-position:-200% 0;}100%{background-position:200% 0;}}
    @keyframes glow{0%,100%{box-shadow:0 0 12px rgba(201,168,76,0.2);}50%{box-shadow:0 0 28px rgba(201,168,76,0.5);}}
    @keyframes pulseGold{0%,100%{box-shadow:0 0 0 0 rgba(201,168,76,0);}50%{box-shadow:0 0 16px 3px rgba(201,168,76,0.16);}}
    @keyframes slideRight{from{transform:translateX(-100%);}to{transform:translateX(0);}}
    .fu{animation:fadeUp 0.4s ease forwards;}
    input,textarea,select{background:rgba(255,255,255,0.045);border:1px solid var(--border);border-radius:9px;color:var(--text);font-family:'Crimson Pro',serif;font-size:14px;outline:none;transition:border-color .2s,box-shadow .2s;}
    input:focus,textarea:focus,select:focus{border-color:var(--border-hi);box-shadow:0 0 0 3px rgba(201,168,76,0.07);}
    select option{background:#1a1628;color:var(--text);}
    .bg{background:var(--panel);border:1px solid var(--border);border-radius:var(--r);backdrop-filter:blur(12px);}
    .div{border:none;border-top:1px solid var(--border);margin:16px 0;}
    .prog{height:3px;background:linear-gradient(90deg,var(--gold-dim),var(--gold),var(--gold-light),var(--gold));background-size:200% 100%;animation:shimmer 1.5s infinite;border-radius:2px;}
    .hov{transition:all .22s;cursor:pointer;}
    .hov:hover{transform:translateY(-2px);border-color:var(--border-hi)!important;box-shadow:0 10px 30px rgba(0,0,0,0.4);}
    .tag{display:inline-flex;align-items:center;padding:2px 9px;border-radius:20px;font-size:10px;font-family:'Cinzel',serif;letter-spacing:.07em;}
    .prose{line-height:1.9;font-size:15px;color:var(--text);white-space:pre-wrap;font-family:'Crimson Pro',serif;}
    .nav-i{display:flex;align-items:center;gap:9px;padding:9px 13px;border-radius:9px;cursor:pointer;font-family:'Cinzel',serif;font-size:10px;letter-spacing:.12em;color:var(--text-dim);transition:all .2s;border:1px solid transparent;text-transform:uppercase;margin-bottom:2px;}
    .nav-i:hover{color:var(--gold-light);background:rgba(201,168,76,0.07);}
    .nav-i.on{color:var(--gold);background:rgba(201,168,76,0.12);border-color:var(--border);animation:pulseGold 3s infinite;}
    .btn{background:linear-gradient(135deg,#C9A84C 0%,#8a6820 50%,#C9A84C 100%);background-size:200% 100%;color:#0B0A0F;border:none;border-radius:9px;cursor:pointer;font-family:'Cinzel',serif;font-weight:600;letter-spacing:.07em;transition:background-position .4s,transform .15s,box-shadow .2s;}
    .btn:hover{background-position:100% 0;transform:translateY(-2px);box-shadow:0 8px 24px rgba(201,168,76,0.35);}
    .btn:disabled{opacity:.5;cursor:not-allowed;transform:none;}
    .ghost{background:rgba(201,168,76,0.06);border:1px solid var(--border);border-radius:9px;color:var(--gold);cursor:pointer;font-family:'Cinzel',serif;font-size:11px;letter-spacing:.08em;transition:all .2s;}
    .ghost:hover{background:rgba(201,168,76,0.13);border-color:var(--border-hi);}
    .ghost:disabled{opacity:.4;cursor:not-allowed;}
    .modal-bg{position:fixed;inset:0;background:rgba(0,0,0,0.72);backdrop-filter:blur(6px);z-index:200;display:flex;align-items:center;justify-content:center;}
    .spin-el{width:14px;height:14px;border:2px solid rgba(0,0,0,0.2);border-top:2px solid #0B0A0F;border-radius:50%;animation:spin .8s linear infinite;display:inline-block;}
    .spin-gold{width:14px;height:14px;border:2px solid var(--gold-dim);border-top:2px solid var(--gold);border-radius:50%;animation:spin .8s linear infinite;display:inline-block;}
  `}</style>
);

// ─────────────────────────────────────────────
// MOCK DATA STORE (simulates backend)
// ─────────────────────────────────────────────
const PLAN_LIMITS = { starter: 3, growth: 7, enterprise: 15 };

const PLANS = [
  { id:"starter",   name:"Starter",    price:"$2,000", monthly:"$500",  branches:1, pastors:3,  color:"var(--teal)" },
  { id:"growth",    name:"Growth",     price:"$3,500", monthly:"$750",  branches:3, pastors:7,  color:"var(--gold)" },
  { id:"enterprise",name:"Enterprise", price:"$5,000", monthly:"$1,000",branches:10,pastors:15, color:"var(--purple)" },
];

const ROLES = { superadmin:"Super Admin", branchadmin:"Branch Admin", pastor:"Pastor", associate:"Associate Pastor" };
const DENOMINATIONS = ["Non-denominational","Baptist","Methodist","Pentecostal","Presbyterian","Anglican/Episcopal","Lutheran","Catholic","Reformed","Charismatic","AME","Church of God","Assemblies of God","Other"];
const SERMON_STYLES = ["Expository","Topical","Narrative","Evangelistic","Prophetic","Teaching","Pastoral Care","Doctrinal"];
const SEASONS = ["Ordinary Time","Advent","Christmas","Epiphany","Lent","Holy Week","Easter","Pentecost","Missions","Revival","Special Event"];
const AUDIENCE = ["General Congregation","Youth","Young Adults","Men's Ministry","Women's Ministry","Seniors","New Believers","Leadership","Outreach","Family Service"];
const LENGTHS = ["15 min","25 min","35 min","45 min","60 min"];
const BIBLE_VERSIONS = ["ESV","NIV","KJV","NKJV","NLT","NASB","CSB","MSG","AMP"];

// Seed data
const SEED_CHURCH = {
  id: "church_001",
  name: "Calvary International Church",
  denomination: "Non-denominational",
  city: "Atlanta, GA",
  logo: "✝",
  vision: "Transforming lives through the Word and Spirit — from our city to the nations.",
  plan: "enterprise",
  bibleVersion: "ESV",
  preferredStyle: "Expository",
  season: "Ordinary Time",
  sermonLength: "35 min",
  defaultAudience: "General Congregation",
  seriesName: "",
  foundedYear: "2008",
  website: "www.calvaryintl.org",
};

const SEED_BRANCHES = [
  { id:"br1", churchId:"church_001", name:"Calvary Midtown",    city:"Atlanta, GA (Midtown)",  pastor:"Pastor James Osei",    members:420, status:"active" },
  { id:"br2", churchId:"church_001", name:"Calvary Eastside",   city:"Atlanta, GA (East)",     pastor:"Pastor Ruth Adeyemi",  members:310, status:"active" },
  { id:"br3", churchId:"church_001", name:"Calvary Decatur",    city:"Decatur, GA",            pastor:"Pastor Mike Thompson", members:285, status:"active" },
  { id:"br4", churchId:"church_001", name:"Calvary Marietta",   city:"Marietta, GA",           pastor:"Pastor Sarah Chen",    members:198, status:"active" },
  { id:"br5", churchId:"church_001", name:"Calvary Savannah",   city:"Savannah, GA",           pastor:"Pastor David King",    members:154, status:"active" },
];

const SEED_USERS = [
  { id:"u1", churchId:"church_001", name:"Bishop Emmanuel Asante", email:"bishop@calvaryintl.org", role:"superadmin", branchId:null,  avatar:"👑", sermons:0, lastActive:"Today", status:"active", bibleVersion:"ESV", preferredStyle:"Expository", defaultAudience:"General Congregation" },
  { id:"u2", churchId:"church_001", name:"Pastor James Osei",      email:"james@calvaryintl.org",  role:"pastor",      branchId:"br1", avatar:"✝", sermons:0, lastActive:"Today", status:"active", bibleVersion:"NIV", preferredStyle:"Expository", defaultAudience:"General Congregation" },
  { id:"u3", churchId:"church_001", name:"Pastor Ruth Adeyemi",    email:"ruth@calvaryintl.org",   role:"pastor",      branchId:"br2", avatar:"✝", sermons:0, lastActive:"2 days ago", status:"active", bibleVersion:"ESV", preferredStyle:"Topical", defaultAudience:"General Congregation" },
  { id:"u4", churchId:"church_001", name:"Pastor Mike Thompson",   email:"mike@calvaryintl.org",   role:"pastor",      branchId:"br3", avatar:"✝", sermons:0, lastActive:"Today", status:"active", bibleVersion:"KJV", preferredStyle:"Narrative", defaultAudience:"General Congregation" },
  { id:"u5", churchId:"church_001", name:"Pastor Sarah Chen",      email:"sarah@calvaryintl.org",  role:"pastor",      branchId:"br4", avatar:"✝", sermons:0, lastActive:"1 week ago", status:"active", bibleVersion:"NLT", preferredStyle:"Expository", defaultAudience:"Young Adults" },
  { id:"u6", churchId:"church_001", name:"Pastor David King",      email:"david@calvaryintl.org",  role:"pastor",      branchId:"br5", avatar:"✝", sermons:0, lastActive:"3 days ago", status:"active", bibleVersion:"ESV", preferredStyle:"Evangelistic", defaultAudience:"Outreach" },
  { id:"u7", churchId:"church_001", name:"Sis. Grace Mensah",      email:"grace@calvaryintl.org",  role:"associate",   branchId:"br1", avatar:"📖", sermons:0, lastActive:"Yesterday", status:"active", bibleVersion:"NIV", preferredStyle:"Teaching", defaultAudience:"Women's Ministry" },
];

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────
async function callClaude(prompt, sys, web = false) {
  const body = {
    model: "claude-sonnet-4-20250514", max_tokens: 1000, system: sys,
    messages: [{ role: "user", content: prompt }],
    ...(web && { tools: [{ type: "web_search_20250305", name: "web_search" }] }),
  };
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
  });
  const d = await res.json();
  return d.content?.filter(b => b.type === "text").map(b => b.text).join("") || "No response.";
}

function safeJSON(raw, fb = []) {
  try {
    const c = raw.replace(/```json|```/g, "").trim();
    const s = c.indexOf(c.includes("[") ? "[" : "{");
    const e = c.lastIndexOf(c.includes("[") ? "]" : "}") + 1;
    return JSON.parse(c.slice(s, e));
  } catch { return fb; }
}

function Avatar({ user, size = 36 }) {
  const colors = { superadmin: "linear-gradient(135deg,#C9A84C,#6a4e1a)", pastor: "linear-gradient(135deg,#3A8CA8,#1a4e6a)", branchadmin: "linear-gradient(135deg,#8b6db0,#4a2e70)", associate: "linear-gradient(135deg,#5a9e72,#2a5e42)" };
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: colors[user.role] || colors.pastor, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.42, border: "1px solid var(--border)", flexShrink: 0 }}>
      {user.avatar}
    </div>
  );
}

function RoleBadge({ role }) {
  const cfg = {
    superadmin: { bg: "rgba(201,168,76,0.15)", border: "rgba(201,168,76,0.4)", color: "var(--gold)", label: "Super Admin" },
    pastor:     { bg: "rgba(58,140,168,0.12)", border: "rgba(58,140,168,0.35)", color: "var(--teal)", label: "Pastor" },
    branchadmin:{ bg: "rgba(139,109,176,0.12)", border: "rgba(139,109,176,0.35)", color: "var(--purple)", label: "Branch Admin" },
    associate:  { bg: "rgba(90,158,114,0.12)", border: "rgba(90,158,114,0.35)", color: "var(--green)", label: "Associate" },
  };
  const c = cfg[role] || cfg.pastor;
  return <span className="tag" style={{ background: c.bg, border: `1px solid ${c.border}`, color: c.color }}>{c.label}</span>;
}

// ─────────────────────────────────────────────
// LOGIN SCREEN
// ─────────────────────────────────────────────
function LoginScreen({ onLogin }) {
  const [tab, setTab] = useState("login"); // login | register
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  // Quick-login presets
  const PRESETS = [
    { label: "Bishop / Super Admin", user: SEED_USERS[0] },
    { label: "Pastor James (Midtown)", user: SEED_USERS[1] },
    { label: "Pastor Ruth (Eastside)", user: SEED_USERS[2] },
    { label: "Pastor Sarah (Marietta)", user: SEED_USERS[3] },
  ];

  const doLogin = () => {
    setErr("");
    const found = SEED_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!found) { setErr("Account not found. Try a demo preset below."); return; }
    onLogin(found, SEED_CHURCH, SEED_BRANCHES, SEED_USERS);
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, position: "relative" }}>
      {/* BG */}
      <div style={{ position: "fixed", inset: 0, background: "radial-gradient(ellipse 80% 60% at 20% 20%,rgba(201,168,76,0.08) 0%,transparent 60%),radial-gradient(ellipse 60% 80% at 80% 80%,rgba(58,140,168,0.06) 0%,transparent 60%),linear-gradient(160deg,#0B0A0F,#100E1A)" }} />
      <div style={{ position: "fixed", right: 60, top: "50%", transform: "translateY(-50%)", fontSize: 500, color: "rgba(201,168,76,0.018)", fontFamily: "Georgia", userSelect: "none", pointerEvents: "none" }}>✝</div>

      <div style={{ position: "relative", width: "100%", maxWidth: 460 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: "linear-gradient(135deg,#C9A84C,#6a4e1a)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, margin: "0 auto 16px", boxShadow: "0 0 30px rgba(201,168,76,0.3)", animation: "glow 3s infinite" }}>✝</div>
          <div className="cin" style={{ fontSize: 22, color: "var(--gold)", letterSpacing: ".18em", fontWeight: 700 }}>SERMONCRAFT PRO</div>
          <div style={{ fontSize: 11, color: "var(--text-faint)", letterSpacing: ".2em", marginTop: 4, textTransform: "uppercase" }}>Enterprise · Multi-Church Platform</div>
        </div>

        <div className="bg" style={{ padding: "32px 36px" }}>
          {/* Tabs */}
          <div style={{ display: "flex", gap: 0, marginBottom: 28, borderBottom: "1px solid var(--border)" }}>
            {["login", "register"].map(t => (
              <button key={t} onClick={() => setTab(t)} style={{ flex: 1, padding: "10px", background: "none", border: "none", cursor: "pointer", fontFamily: "Cinzel,serif", fontSize: 11, letterSpacing: ".12em", color: tab === t ? "var(--gold)" : "var(--text-faint)", borderBottom: tab === t ? "2px solid var(--gold)" : "2px solid transparent", transition: "all .2s", textTransform: "uppercase" }}>
                {t === "login" ? "Sign In" : "Register Church"}
              </button>
            ))}
          </div>

          {tab === "login" ? (
            <>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontSize: 10, color: "var(--text-faint)", letterSpacing: ".15em", marginBottom: 5 }}>EMAIL ADDRESS</label>
                <input value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === "Enter" && doLogin()} placeholder="your@church.org" style={{ width: "100%", padding: "11px 13px" }} />
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", fontSize: 10, color: "var(--text-faint)", letterSpacing: ".15em", marginBottom: 5 }}>PASSWORD</label>
                <input type="password" value={pass} onChange={e => setPass(e.target.value)} onKeyDown={e => e.key === "Enter" && doLogin()} placeholder="••••••••" style={{ width: "100%", padding: "11px 13px" }} />
              </div>
              {err && <div style={{ color: "#e07a5f", fontSize: 13, marginBottom: 14, padding: "8px 11px", background: "rgba(200,80,60,0.1)", borderRadius: 8, border: "1px solid rgba(200,80,60,0.2)" }}>{err}</div>}
              <button className="btn" onClick={doLogin} disabled={!email} style={{ width: "100%", padding: "13px", fontSize: 13 }}>Sign In to SermonCraft</button>

              {/* Demo presets */}
              <div style={{ marginTop: 24 }}>
                <div className="cin" style={{ fontSize: 9, color: "var(--text-faint)", letterSpacing: ".2em", textAlign: "center", marginBottom: 12 }}>─ DEMO ACCOUNTS ─</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {PRESETS.map(p => (
                    <button key={p.user.id} onClick={() => onLogin(p.user, SEED_CHURCH, SEED_BRANCHES, SEED_USERS)} className="ghost" style={{ padding: "9px 10px", fontSize: 10, textAlign: "center", lineHeight: 1.4 }}>
                      <div style={{ fontSize: 16, marginBottom: 3 }}>{p.user.avatar}</div>
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <RegisterFlow onLogin={onLogin} />
          )}
        </div>

        <div className="cor" style={{ textAlign: "center", marginTop: 20, fontSize: 13, color: "var(--text-faint)", fontStyle: "italic" }}>
          "Study to show thyself approved unto God…" — 2 Timothy 2:15
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// REGISTER FLOW (church onboarding)
// ─────────────────────────────────────────────
function RegisterFlow({ onLogin }) {
  const [step, setStep] = useState(1);
  const [plan, setPlan] = useState("enterprise");
  const [form, setForm] = useState({ churchName: "", denomination: "Non-denominational", city: "", adminName: "", adminEmail: "", adminTitle: "Bishop", vision: "" });
  const upd = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const complete = () => {
    const church = { ...SEED_CHURCH, id: "new_" + Date.now(), name: form.churchName || "My Church", denomination: form.denomination, city: form.city, vision: form.vision, plan };
    const user = { id: "u_new", churchId: church.id, name: form.adminName || "Church Admin", email: form.adminEmail, role: "superadmin", branchId: null, avatar: "👑", sermons: 0, lastActive: "Today", status: "active", bibleVersion: "ESV", preferredStyle: "Expository", defaultAudience: "General Congregation" };
    onLogin(user, church, [], [user]);
  };

  return (
    <div>
      {/* Steps */}
      <div style={{ display: "flex", gap: 6, marginBottom: 24, alignItems: "center" }}>
        {[1, 2, 3].map(s => (
          <div key={s} style={{ display: "flex", alignItems: "center", gap: 6, flex: s < 3 ? 1 : "auto" }}>
            <div style={{ width: 26, height: 26, borderRadius: "50%", background: step >= s ? "var(--gold)" : "rgba(255,255,255,0.07)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontFamily: "Cinzel,serif", color: step >= s ? "#0B0A0F" : "var(--text-faint)", transition: "all .3s", flexShrink: 0 }}>{s}</div>
            {s < 3 && <div style={{ flex: 1, height: 1, background: step > s ? "var(--gold)" : "var(--border)" }} />}
          </div>
        ))}
      </div>

      {step === 1 && (
        <div>
          <div className="cin" style={{ fontSize: 12, color: "var(--gold)", letterSpacing: ".15em", marginBottom: 16 }}>CHOOSE YOUR PLAN</div>
          {PLANS.map(p => (
            <div key={p.id} onClick={() => setPlan(p.id)} className="bg hov" style={{ padding: "14px 16px", marginBottom: 10, cursor: "pointer", borderColor: plan === p.id ? p.color : "var(--border)", background: plan === p.id ? "rgba(201,168,76,0.07)" : "var(--panel)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div className="cin" style={{ fontSize: 13, color: plan === p.id ? p.color : "var(--text)", marginBottom: 2 }}>{p.name}</div>
                  <div style={{ fontSize: 12, color: "var(--text-faint)" }}>{p.branches} branch{p.branches > 1 ? "es" : ""} · {p.pastors} pastor accounts</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div className="cin" style={{ fontSize: 14, color: p.color }}>{p.monthly}<span style={{ fontSize: 10 }}>/mo</span></div>
                  <div style={{ fontSize: 10, color: "var(--text-faint)" }}>Setup: {p.price}</div>
                </div>
              </div>
            </div>
          ))}
          <button className="btn" onClick={() => setStep(2)} style={{ width: "100%", padding: "12px", fontSize: 13, marginTop: 8 }}>Continue →</button>
        </div>
      )}

      {step === 2 && (
        <div>
          <div className="cin" style={{ fontSize: 12, color: "var(--gold)", letterSpacing: ".15em", marginBottom: 16 }}>CHURCH DETAILS</div>
          {[{ k: "churchName", l: "CHURCH NAME", ph: "Grace Community Church" }, { k: "city", l: "CITY & STATE", ph: "Atlanta, GA" }].map(f => (
            <div key={f.k} style={{ marginBottom: 12 }}>
              <label style={{ display: "block", fontSize: 10, color: "var(--text-faint)", letterSpacing: ".15em", marginBottom: 5 }}>{f.l}</label>
              <input value={form[f.k]} onChange={e => upd(f.k, e.target.value)} placeholder={f.ph} style={{ width: "100%", padding: "10px 12px" }} />
            </div>
          ))}
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: "block", fontSize: 10, color: "var(--text-faint)", letterSpacing: ".15em", marginBottom: 5 }}>DENOMINATION</label>
            <select value={form.denomination} onChange={e => upd("denomination", e.target.value)} style={{ width: "100%", padding: "9px 12px" }}>
              {DENOMINATIONS.map(d => <option key={d}>{d}</option>)}
            </select>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 10, color: "var(--text-faint)", letterSpacing: ".15em", marginBottom: 5 }}>VISION STATEMENT</label>
            <textarea value={form.vision} onChange={e => upd("vision", e.target.value)} placeholder="Our vision is…" rows={2} style={{ width: "100%", padding: "9px 12px", resize: "none" }} />
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="ghost" onClick={() => setStep(1)} style={{ padding: "11px 18px", fontSize: 11 }}>← Back</button>
            <button className="btn" onClick={() => setStep(3)} style={{ flex: 1, padding: "12px", fontSize: 13 }}>Continue →</button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div>
          <div className="cin" style={{ fontSize: 12, color: "var(--gold)", letterSpacing: ".15em", marginBottom: 16 }}>SUPER ADMIN ACCOUNT</div>
          {[{ k: "adminName", l: "YOUR FULL NAME", ph: "Bishop John Smith" }, { k: "adminEmail", l: "EMAIL", ph: "admin@yourchurch.org" }, { k: "adminTitle", l: "TITLE", ph: "Bishop / Senior Pastor" }].map(f => (
            <div key={f.k} style={{ marginBottom: 12 }}>
              <label style={{ display: "block", fontSize: 10, color: "var(--text-faint)", letterSpacing: ".15em", marginBottom: 5 }}>{f.l}</label>
              <input value={form[f.k]} onChange={e => upd(f.k, e.target.value)} placeholder={f.ph} style={{ width: "100%", padding: "10px 12px" }} />
            </div>
          ))}
          <div style={{ padding: "12px 14px", background: "rgba(201,168,76,0.07)", borderRadius: 9, border: "1px solid var(--border)", marginBottom: 16, fontSize: 13, color: "var(--text-dim)" }}>
            ✦ You will be the <span style={{ color: "var(--gold)" }}>Super Admin</span> for your entire church network. You can add branches and pastor accounts from the admin dashboard.
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="ghost" onClick={() => setStep(2)} style={{ padding: "11px 18px", fontSize: 11 }}>← Back</button>
            <button className="btn" onClick={complete} style={{ flex: 1, padding: "12px", fontSize: 13 }}>🚀 Launch My Church Account</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// MAIN APP SHELL
// ─────────────────────────────────────────────
const NAV_PASTOR = [
  { id: "dashboard", icon: "⛪", label: "Dashboard" },
  { id: "ai-pastor", icon: "✝", label: "AI Pastor" },
  { id: "topic-gen", icon: "💡", label: "Topic Engine" },
  { id: "sermon-forge", icon: "🔥", label: "Sermon Forge" },
  { id: "word-study", icon: "📜", label: "Word Study" },
  { id: "illustrations", icon: "🖼", label: "Illustrations" },
  { id: "library", icon: "📚", label: "My Sermons" },
  { id: "calendar", icon: "📅", label: "Series Planner" },
];

const NAV_ADMIN = [
  { id: "admin-overview", icon: "🏛", label: "Church Overview" },
  { id: "admin-branches", icon: "🌿", label: "Branches" },
  { id: "admin-users", icon: "👥", label: "Pastor Accounts" },
  { id: "admin-activity", icon: "📊", label: "Activity & Stats" },
  { id: "admin-sermons", icon: "📚", label: "All Sermons" },
  { id: "admin-settings", icon: "⚙", label: "Church Settings" },
  ...NAV_PASTOR.slice(1), // super admin also has pastor tools
];

export default function App() {
  const [session, setSession] = useState(null); // { user, church, branches, users }
  const [nav, setNav] = useState("dashboard");
  const [sermons, setSermons] = useState([]); // all sermons across church

  const login = (user, church, branches, users) => {
    setSession({ user, church, branches, users });
    setNav(user.role === "superadmin" ? "admin-overview" : "dashboard");
  };

  const logout = () => { setSession(null); setNav("dashboard"); };

  const saveSermon = (s) => {
    const e = { ...s, id: Date.now(), savedAt: new Date().toLocaleDateString(), authorId: session.user.id, authorName: session.user.name, branchId: session.user.branchId };
    setSermons(p => [e, ...p]);
  };

  const updateBranches = (b) => setSession(p => ({ ...p, branches: b }));
  const updateUsers = (u) => setSession(p => ({ ...p, users: u }));
  const updateChurch = (c) => setSession(p => ({ ...p, church: c }));

  if (!session) return <><G /><LoginScreen onLogin={login} /></>;

  const { user, church, branches, users } = session;
  const isSuperAdmin = user.role === "superadmin";
  const NAV = isSuperAdmin ? NAV_ADMIN : NAV_PASTOR;
  const myBranch = branches.find(b => b.id === user.branchId);
  const mySermons = sermons.filter(s => s.authorId === user.id);
  const planInfo = PLANS.find(p => p.id === church.plan) || PLANS[2];

  return (
    <>
      <G />
      <div style={{ position: "fixed", inset: 0, zIndex: 0, background: "radial-gradient(ellipse 80% 60% at 10% 10%,rgba(201,168,76,0.07) 0%,transparent 60%),linear-gradient(160deg,#0B0A0F,#100E1A)" }} />
      <div style={{ position: "fixed", right: 30, top: "50%", transform: "translateY(-50%)", fontSize: 600, color: "rgba(201,168,76,0.015)", fontFamily: "Georgia", userSelect: "none", zIndex: 0, pointerEvents: "none" }}>✝</div>

      <div style={{ position: "relative", zIndex: 1, display: "flex", minHeight: "100vh" }}>
        {/* SIDEBAR */}
        <div style={{ width: 220, background: "rgba(8,6,16,0.97)", borderRight: "1px solid var(--border)", display: "flex", flexDirection: "column", padding: "0 10px", flexShrink: 0 }}>
          {/* Church brand */}
          <div style={{ padding: "18px 8px 14px", borderBottom: "1px solid var(--border)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 4 }}>
              <div style={{ width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(135deg,#C9A84C,#6a4e1a)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, boxShadow: "0 0 16px rgba(201,168,76,0.28)" }}>{church.logo}</div>
              <div>
                <div className="cin" style={{ fontSize: 9, color: "var(--gold)", letterSpacing: ".14em", fontWeight: 700 }}>SERMONCRAFT</div>
                <div style={{ fontSize: 8, color: "var(--text-faint)", letterSpacing: ".18em" }}>PRO ENTERPRISE</div>
              </div>
            </div>
            <div style={{ marginTop: 9, padding: "8px 10px", borderRadius: 8, background: "rgba(201,168,76,0.07)", border: "1px solid var(--border)" }}>
              <div className="cin" style={{ fontSize: 10, color: "var(--gold-light)", lineHeight: 1.4 }}>{church.name}</div>
              <div style={{ fontSize: 9, color: "var(--text-faint)", marginTop: 2 }}>{church.denomination}</div>
              <div style={{ marginTop: 5, display: "flex", alignItems: "center", gap: 5 }}>
                <span className="tag" style={{ background: "rgba(201,168,76,0.1)", border: "1px solid var(--border)", color: "var(--gold-dim)", fontSize: 9 }}>⭐ {planInfo.name}</span>
                <span style={{ fontSize: 9, color: "var(--text-faint)" }}>{branches.length} branches</span>
              </div>
            </div>
          </div>

          {/* User pill */}
          <div style={{ padding: "10px 8px", borderBottom: "1px solid var(--border)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", borderRadius: 8, background: "rgba(255,255,255,0.03)" }}>
              <Avatar user={user} size={28} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 11, color: "var(--text)", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user.name.split(" ").slice(0, 2).join(" ")}</div>
                <div><RoleBadge role={user.role} /></div>
              </div>
            </div>
          </div>

          {/* Nav */}
          <div style={{ flex: 1, padding: "10px 0", overflowY: "auto" }}>
            {isSuperAdmin && <div className="cin" style={{ fontSize: 8, color: "var(--text-faint)", letterSpacing: ".2em", padding: "4px 14px 6px", textTransform: "uppercase" }}>Administration</div>}
            {NAV_ADMIN.slice(0, 6).map(item => isSuperAdmin && (
              <div key={item.id} className={`nav-i ${nav === item.id ? "on" : ""}`} onClick={() => setNav(item.id)}>
                <span style={{ fontSize: 13 }}>{item.icon}</span><span>{item.label}</span>
                {nav === item.id && <div style={{ marginLeft: "auto", width: 4, height: 4, borderRadius: "50%", background: "var(--gold)" }} />}
              </div>
            ))}
            {isSuperAdmin && <div className="cin" style={{ fontSize: 8, color: "var(--text-faint)", letterSpacing: ".2em", padding: "10px 14px 6px", textTransform: "uppercase" }}>Sermon Tools</div>}
            {NAV_PASTOR.map(item => (
              <div key={item.id} className={`nav-i ${nav === item.id ? "on" : ""}`} onClick={() => setNav(item.id)}>
                <span style={{ fontSize: 13 }}>{item.icon}</span><span>{item.label}</span>
                {nav === item.id && <div style={{ marginLeft: "auto", width: 4, height: 4, borderRadius: "50%", background: "var(--gold)" }} />}
              </div>
            ))}
          </div>

          {/* Logout */}
          <div style={{ padding: "10px 8px", borderTop: "1px solid var(--border)" }}>
            <button onClick={logout} className="ghost" style={{ width: "100%", padding: "8px", fontSize: 10 }}>⟵ Sign Out</button>
          </div>
        </div>

        {/* MAIN */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {/* TOP BAR */}
          <div style={{ height: 58, background: "rgba(8,6,16,0.9)", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 28px", backdropFilter: "blur(12px)", flexShrink: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              {myBranch && (
                <div style={{ padding: "4px 12px", borderRadius: 20, background: "rgba(58,140,168,0.1)", border: "1px solid rgba(58,140,168,0.25)", fontSize: 11, color: "var(--teal)" }}>
                  🌿 {myBranch.name}
                </div>
              )}
              {isSuperAdmin && (
                <div style={{ padding: "4px 12px", borderRadius: 20, background: "rgba(201,168,76,0.1)", border: "1px solid var(--border)", fontSize: 11, color: "var(--gold)" }}>
                  👑 Church-Wide Access
                </div>
              )}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 12, color: "var(--text-dim)" }}>{user.name}</div>
                <div style={{ fontSize: 10, color: "var(--text-faint)" }}>{new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</div>
              </div>
              <Avatar user={user} size={32} />
            </div>
          </div>

          {/* CONTENT */}
          <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px" }}>
            {/* ADMIN VIEWS */}
            {nav === "admin-overview"  && <AdminOverview church={church} branches={branches} users={users} sermons={sermons} planInfo={planInfo} setNav={setNav} />}
            {nav === "admin-branches"  && <AdminBranches church={church} branches={branches} users={users} updateBranches={updateBranches} planInfo={planInfo} />}
            {nav === "admin-users"     && <AdminUsers church={church} users={users} branches={branches} updateUsers={updateUsers} planInfo={planInfo} currentUser={user} />}
            {nav === "admin-activity"  && <AdminActivity church={church} branches={branches} users={users} sermons={sermons} />}
            {nav === "admin-sermons"   && <AdminSermons sermons={sermons} branches={branches} users={users} />}
            {nav === "admin-settings"  && <AdminSettings church={church} updateChurch={updateChurch} />}
            {/* PASTOR VIEWS */}
            {nav === "dashboard"       && <PastorDashboard user={user} church={church} myBranch={myBranch} mySermons={mySermons} setNav={setNav} />}
            {nav === "ai-pastor"       && <AIPastor user={user} church={church} myBranch={myBranch} />}
            {nav === "topic-gen"       && <TopicEngine user={user} church={church} />}
            {nav === "sermon-forge"    && <SermonForge user={user} church={church} saveSermon={saveSermon} />}
            {nav === "word-study"      && <WordStudy user={user} church={church} />}
            {nav === "illustrations"   && <Illustrations user={user} church={church} />}
            {nav === "library"         && <Library sermons={mySermons} />}
            {nav === "calendar"        && <SeriesPlanner user={user} church={church} />}
          </div>
        </div>
      </div>
    </>
  );
}

// ═══════════════════════════════════════════
// ADMIN: CHURCH OVERVIEW
// ═══════════════════════════════════════════
function AdminOverview({ church, branches, users, sermons, planInfo, setNav }) {
  const pastors = users.filter(u => u.role !== "superadmin");
  const planUsed = branches.length;
  const planMax = planInfo.branches;
  const usersUsed = users.length;
  const usersMax = planInfo.pastors;

  return (
    <div className="fu">
      {/* Hero */}
      <div className="bg" style={{ padding: "30px 36px", marginBottom: 20, background: "linear-gradient(135deg,rgba(201,168,76,0.1) 0%,rgba(10,8,18,0.95) 65%)", borderColor: "rgba(201,168,76,0.38)", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", right: 24, top: "50%", transform: "translateY(-50%)", fontSize: 180, opacity: 0.04, fontFamily: "Georgia", pointerEvents: "none" }}>✝</div>
        <div className="cin" style={{ fontSize: 9, color: "var(--gold)", letterSpacing: ".28em", marginBottom: 8 }}>CHURCH COMMAND CENTER</div>
        <div className="cor" style={{ fontSize: 32, fontWeight: 600, color: "#F5EDD8", lineHeight: 1.2, marginBottom: 6 }}>{church.name}</div>
        <div style={{ fontSize: 13, color: "var(--text-dim)", marginBottom: 14 }}>{church.denomination} · {church.city}</div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <span className="tag" style={{ background: "rgba(201,168,76,0.12)", border: "1px solid rgba(201,168,76,0.35)", color: "var(--gold)" }}>⭐ {planInfo.name} Plan</span>
          <span className="tag" style={{ background: "rgba(58,140,168,0.1)", border: "1px solid rgba(58,140,168,0.3)", color: "var(--teal)" }}>🌿 {branches.length} Branches</span>
          <span className="tag" style={{ background: "rgba(90,158,114,0.1)", border: "1px solid rgba(90,158,114,0.3)", color: "var(--green)" }}>👥 {users.length} Accounts</span>
          <span className="tag" style={{ background: "rgba(139,109,176,0.1)", border: "1px solid rgba(139,109,176,0.3)", color: "var(--purple)" }}>📜 {sermons.length} Sermons</span>
        </div>
      </div>

      {/* Plan usage */}
      <div className="bg" style={{ padding: "20px 24px", marginBottom: 18 }}>
        <div className="cin" style={{ fontSize: 10, color: "var(--gold)", letterSpacing: ".18em", marginBottom: 16 }}>PLAN USAGE · {planInfo.name.toUpperCase()}</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          {[
            { label: "Branches", used: planUsed, max: planMax, color: "var(--teal)" },
            { label: "Pastor Accounts", used: usersUsed, max: usersMax, color: "var(--gold)" },
          ].map(m => (
            <div key={m.label}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 12, color: "var(--text-dim)" }}>{m.label}</span>
                <span className="cin" style={{ fontSize: 11, color: m.color }}>{m.used} / {m.max}</span>
              </div>
              <div style={{ height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 3, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${Math.min(100, (m.used / m.max) * 100)}%`, background: m.color, borderRadius: 3, transition: "width .5s" }} />
              </div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 14, display: "flex", gap: 8 }}>
          <button className="btn" onClick={() => setNav("admin-branches")} style={{ padding: "9px 18px", fontSize: 11 }}>+ Add Branch</button>
          <button className="btn" onClick={() => setNav("admin-users")} style={{ padding: "9px 18px", fontSize: 11 }}>+ Add Pastor</button>
          <button className="ghost" style={{ padding: "9px 18px", fontSize: 11, marginLeft: "auto" }}>⬆ Upgrade Plan</button>
        </div>
      </div>

      {/* Branch grid */}
      <div className="cin" style={{ fontSize: 9, color: "var(--text-faint)", letterSpacing: ".2em", marginBottom: 12 }}>BRANCH NETWORK</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 22 }}>
        {branches.map(b => {
          const branchPastors = users.filter(u => u.branchId === b.id);
          return (
            <div key={b.id} className="bg hov" style={{ padding: "16px 18px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <div className="cin" style={{ fontSize: 11, color: "var(--gold-light)" }}>{b.name}</div>
                <span className="tag" style={{ background: "rgba(90,158,114,0.1)", border: "1px solid rgba(90,158,114,0.3)", color: "var(--green)" }}>● Active</span>
              </div>
              <div style={{ fontSize: 12, color: "var(--text-faint)", marginBottom: 8 }}>📍 {b.city}</div>
              <div style={{ fontSize: 12, color: "var(--text-dim)", marginBottom: 6 }}>👥 {b.members?.toLocaleString() || 0} members</div>
              <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                {branchPastors.map(p => <Avatar key={p.id} user={p} size={22} />)}
                <div style={{ fontSize: 11, color: "var(--text-faint)", display: "flex", alignItems: "center", marginLeft: 4 }}>{branchPastors.length} account{branchPastors.length !== 1 ? "s" : ""}</div>
              </div>
            </div>
          );
        })}
        {branches.length === 0 && (
          <div className="bg" style={{ padding: 30, textAlign: "center", gridColumn: "1/-1" }}>
            <div style={{ fontSize: 36, opacity: 0.15, marginBottom: 8 }}>🌿</div>
            <div style={{ fontSize: 14, color: "var(--text-faint)", fontStyle: "italic" }}>No branches yet. Add your first branch to get started.</div>
          </div>
        )}
      </div>

      {/* Team */}
      <div className="cin" style={{ fontSize: 9, color: "var(--text-faint)", letterSpacing: ".2em", marginBottom: 12 }}>PASTORAL TEAM</div>
      <div className="bg" style={{ padding: "6px 0" }}>
        {users.map((u, i) => {
          const br = branches.find(b => b.id === u.branchId);
          return (
            <div key={u.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 18px", borderBottom: i < users.length - 1 ? "1px solid var(--border)" : "none" }}>
              <Avatar user={u} size={34} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, color: "var(--text)", fontWeight: 600 }}>{u.name}</div>
                <div style={{ fontSize: 11, color: "var(--text-faint)" }}>{u.email}</div>
              </div>
              <RoleBadge role={u.role} />
              {br && <div style={{ fontSize: 11, color: "var(--teal)" }}>🌿 {br.name}</div>}
              <div style={{ fontSize: 11, color: "var(--text-faint)" }}>{u.lastActive}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// ADMIN: BRANCHES
// ═══════════════════════════════════════════
function AdminBranches({ church, branches, users, updateBranches, planInfo }) {
  const [showModal, setShowModal] = useState(false);
  const [editBranch, setEditBranch] = useState(null);
  const [form, setForm] = useState({ name: "", city: "", members: "" });
  const upd = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const canAdd = branches.length < planInfo.branches;

  const save = () => {
    if (editBranch) {
      updateBranches(branches.map(b => b.id === editBranch.id ? { ...b, ...form } : b));
    } else {
      const nb = { id: "br" + Date.now(), churchId: church.id, ...form, members: parseInt(form.members) || 0, status: "active" };
      updateBranches([...branches, nb]);
    }
    setShowModal(false); setEditBranch(null); setForm({ name: "", city: "", members: "" });
  };

  const remove = (id) => updateBranches(branches.filter(b => b.id !== id));

  return (
    <div className="fu">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <div className="cin" style={{ fontSize: 14, color: "var(--gold)", marginBottom: 4 }}>BRANCH MANAGEMENT</div>
          <div style={{ fontSize: 13, color: "var(--text-faint)" }}>{branches.length} of {planInfo.branches} branches used · {planInfo.name} Plan</div>
        </div>
        <button className="btn" onClick={() => { if (!canAdd) return alert(`Your ${planInfo.name} plan supports up to ${planInfo.branches} branches. Upgrade to add more.`); setEditBranch(null); setForm({ name: "", city: "", members: "" }); setShowModal(true); }} style={{ padding: "11px 22px", fontSize: 12 }}>
          + Add Branch
        </button>
      </div>

      {/* Plan bar */}
      <div className="bg" style={{ padding: "14px 20px", marginBottom: 18 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
          <span style={{ fontSize: 12, color: "var(--text-dim)" }}>Branch Capacity</span>
          <span className="cin" style={{ fontSize: 11, color: "var(--gold)" }}>{branches.length} / {planInfo.branches}</span>
        </div>
        <div style={{ height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 3 }}>
          <div style={{ height: "100%", width: `${(branches.length / planInfo.branches) * 100}%`, background: branches.length >= planInfo.branches ? "var(--red)" : "var(--gold)", borderRadius: 3, transition: "width .5s" }} />
        </div>
        {!canAdd && <div style={{ marginTop: 8, fontSize: 12, color: "var(--red)" }}>Branch limit reached. <span style={{ color: "var(--gold)", cursor: "pointer", textDecoration: "underline" }}>Upgrade your plan</span> to add more.</div>}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 14 }}>
        {branches.map(b => {
          const bPastors = users.filter(u => u.branchId === b.id);
          return (
            <div key={b.id} className="bg" style={{ padding: "20px 22px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <div>
                  <div className="cin" style={{ fontSize: 13, color: "var(--gold-light)", marginBottom: 3 }}>{b.name}</div>
                  <div style={{ fontSize: 12, color: "var(--text-faint)" }}>📍 {b.city}</div>
                </div>
                <span className="tag" style={{ background: "rgba(90,158,114,0.1)", border: "1px solid rgba(90,158,114,0.3)", color: "var(--green)" }}>● Active</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
                <div className="bg" style={{ padding: "10px 12px", borderRadius: 8 }}>
                  <div className="cin" style={{ fontSize: 18, color: "var(--gold)" }}>{b.members?.toLocaleString() || 0}</div>
                  <div style={{ fontSize: 10, color: "var(--text-faint)" }}>Members</div>
                </div>
                <div className="bg" style={{ padding: "10px 12px", borderRadius: 8 }}>
                  <div className="cin" style={{ fontSize: 18, color: "var(--teal)" }}>{bPastors.length}</div>
                  <div style={{ fontSize: 10, color: "var(--text-faint)" }}>Accounts</div>
                </div>
              </div>
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 10, color: "var(--text-faint)", marginBottom: 6 }}>PASTORAL TEAM</div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {bPastors.map(p => (
                    <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 9px", background: "rgba(255,255,255,0.04)", borderRadius: 20, border: "1px solid var(--border)" }}>
                      <Avatar user={p} size={18} />
                      <span style={{ fontSize: 11, color: "var(--text-dim)" }}>{p.name.split(" ")[0]}</span>
                    </div>
                  ))}
                  {bPastors.length === 0 && <span style={{ fontSize: 12, color: "var(--text-faint)", fontStyle: "italic" }}>No accounts assigned</span>}
                </div>
              </div>
              <div style={{ display: "flex", gap: 7 }}>
                <button className="ghost" style={{ flex: 1, padding: "7px", fontSize: 10 }} onClick={() => { setEditBranch(b); setForm({ name: b.name, city: b.city, members: String(b.members || 0) }); setShowModal(true); }}>✏ Edit</button>
                <button className="ghost" style={{ padding: "7px 12px", fontSize: 10, color: "var(--red)", borderColor: "rgba(194,75,58,0.3)" }} onClick={() => remove(b.id)}>🗑</button>
              </div>
            </div>
          );
        })}
      </div>

      {showModal && (
        <div className="modal-bg" onClick={() => setShowModal(false)}>
          <div className="bg" style={{ width: 420, padding: "28px 30px" }} onClick={e => e.stopPropagation()}>
            <div className="cin" style={{ fontSize: 13, color: "var(--gold)", marginBottom: 20 }}>{editBranch ? "EDIT BRANCH" : "ADD NEW BRANCH"}</div>
            {[{ k: "name", l: "BRANCH NAME", ph: "Calvary Westside" }, { k: "city", l: "CITY & STATE", ph: "Birmingham, AL" }, { k: "members", l: "ESTIMATED MEMBERS", ph: "250" }].map(f => (
              <div key={f.k} style={{ marginBottom: 13 }}>
                <label style={{ display: "block", fontSize: 10, color: "var(--text-faint)", letterSpacing: ".15em", marginBottom: 5 }}>{f.l}</label>
                <input value={form[f.k]} onChange={e => upd(f.k, e.target.value)} placeholder={f.ph} style={{ width: "100%", padding: "10px 12px" }} />
              </div>
            ))}
            <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
              <button className="ghost" onClick={() => setShowModal(false)} style={{ flex: 1, padding: "10px", fontSize: 11 }}>Cancel</button>
              <button className="btn" onClick={save} style={{ flex: 2, padding: "10px", fontSize: 12 }}>{editBranch ? "Save Changes" : "Add Branch"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════
// ADMIN: USERS (Pastor Accounts)
// ═══════════════════════════════════════════
function AdminUsers({ church, users, branches, updateUsers, planInfo, currentUser }) {
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", role: "pastor", branchId: "", bibleVersion: "ESV", preferredStyle: "Expository", defaultAudience: "General Congregation" });
  const upd = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const canAdd = users.length < planInfo.pastors;

  const save = () => {
    const avatar = form.role === "superadmin" ? "👑" : form.role === "associate" ? "📖" : "✝";
    if (editUser) {
      updateUsers(users.map(u => u.id === editUser.id ? { ...u, ...form, avatar } : u));
    } else {
      const nu = { id: "u" + Date.now(), churchId: church.id, ...form, avatar, sermons: 0, lastActive: "Just now", status: "active" };
      updateUsers([...users, nu]);
    }
    setShowModal(false); setEditUser(null); setForm({ name: "", email: "", role: "pastor", branchId: "", bibleVersion: "ESV", preferredStyle: "Expository", defaultAudience: "General Congregation" });
  };

  const remove = (id) => { if (id === currentUser.id) return alert("You cannot remove your own account."); updateUsers(users.filter(u => u.id !== id)); };
  const toggle = (id) => updateUsers(users.map(u => u.id === id ? { ...u, status: u.status === "active" ? "suspended" : "active" } : u));

  return (
    <div className="fu">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <div className="cin" style={{ fontSize: 14, color: "var(--gold)", marginBottom: 4 }}>PASTOR ACCOUNTS</div>
          <div style={{ fontSize: 13, color: "var(--text-faint)" }}>{users.length} of {planInfo.pastors} accounts used · {planInfo.name} Plan</div>
        </div>
        <button className="btn" onClick={() => { if (!canAdd) return alert(`Account limit reached. Upgrade to add more.`); setEditUser(null); setForm({ name: "", email: "", role: "pastor", branchId: "", bibleVersion: "ESV", preferredStyle: "Expository", defaultAudience: "General Congregation" }); setShowModal(true); }} style={{ padding: "11px 22px", fontSize: 12 }}>
          + Add Pastor Account
        </button>
      </div>

      {/* Plan bar */}
      <div className="bg" style={{ padding: "14px 20px", marginBottom: 18 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
          <span style={{ fontSize: 12, color: "var(--text-dim)" }}>Account Capacity</span>
          <span className="cin" style={{ fontSize: 11, color: "var(--gold)" }}>{users.length} / {planInfo.pastors}</span>
        </div>
        <div style={{ height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 3 }}>
          <div style={{ height: "100%", width: `${(users.length / planInfo.pastors) * 100}%`, background: users.length >= planInfo.pastors ? "var(--red)" : "var(--gold)", borderRadius: 3, transition: "width .5s" }} />
        </div>
      </div>

      {/* Users table */}
      <div className="bg">
        <div style={{ padding: "12px 18px", borderBottom: "1px solid var(--border)", display: "grid", gridTemplateColumns: "1fr 160px 120px 100px 80px 90px", gap: 12 }}>
          {["PASTOR", "BRANCH", "ROLE", "BIBLE", "STATUS", "ACTIONS"].map(h => (
            <div key={h} className="cin" style={{ fontSize: 9, color: "var(--text-faint)", letterSpacing: ".15em" }}>{h}</div>
          ))}
        </div>
        {users.map((u, i) => {
          const br = branches.find(b => b.id === u.branchId);
          return (
            <div key={u.id} style={{ padding: "12px 18px", borderBottom: i < users.length - 1 ? "1px solid var(--border)" : "none", display: "grid", gridTemplateColumns: "1fr 160px 120px 100px 80px 90px", gap: 12, alignItems: "center", opacity: u.status === "suspended" ? 0.55 : 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                <Avatar user={u} size={30} />
                <div>
                  <div style={{ fontSize: 12, color: "var(--text)", fontWeight: 600 }}>{u.name}</div>
                  <div style={{ fontSize: 10, color: "var(--text-faint)" }}>{u.email}</div>
                </div>
              </div>
              <div style={{ fontSize: 11, color: br ? "var(--teal)" : "var(--text-faint)" }}>{br ? `🌿 ${br.name}` : "—"}</div>
              <div><RoleBadge role={u.role} /></div>
              <div style={{ fontSize: 11, color: "var(--text-dim)" }}>{u.bibleVersion}</div>
              <div>
                <span className="tag" style={{ background: u.status === "active" ? "rgba(90,158,114,0.1)" : "rgba(194,75,58,0.1)", border: `1px solid ${u.status === "active" ? "rgba(90,158,114,0.3)" : "rgba(194,75,58,0.3)"}`, color: u.status === "active" ? "var(--green)" : "var(--red)" }}>
                  {u.status === "active" ? "● Active" : "✕ Susp."}
                </span>
              </div>
              <div style={{ display: "flex", gap: 5 }}>
                <button className="ghost" style={{ padding: "4px 8px", fontSize: 9 }} onClick={() => { setEditUser(u); setForm({ name: u.name, email: u.email, role: u.role, branchId: u.branchId || "", bibleVersion: u.bibleVersion, preferredStyle: u.preferredStyle, defaultAudience: u.defaultAudience }); setShowModal(true); }}>✏</button>
                {u.id !== currentUser.id && <>
                  <button className="ghost" style={{ padding: "4px 8px", fontSize: 9, color: u.status === "active" ? "var(--red)" : "var(--green)" }} onClick={() => toggle(u.id)}>{u.status === "active" ? "⊘" : "✓"}</button>
                  <button className="ghost" style={{ padding: "4px 8px", fontSize: 9, color: "var(--red)" }} onClick={() => remove(u.id)}>🗑</button>
                </>}
              </div>
            </div>
          );
        })}
      </div>

      {showModal && (
        <div className="modal-bg" onClick={() => setShowModal(false)}>
          <div className="bg" style={{ width: 480, padding: "28px 30px", maxHeight: "80vh", overflowY: "auto" }} onClick={e => e.stopPropagation()}>
            <div className="cin" style={{ fontSize: 13, color: "var(--gold)", marginBottom: 20 }}>{editUser ? "EDIT PASTOR ACCOUNT" : "ADD PASTOR ACCOUNT"}</div>
            {[{ k: "name", l: "FULL NAME", ph: "Pastor John Smith" }, { k: "email", l: "EMAIL ADDRESS", ph: "john@church.org" }].map(f => (
              <div key={f.k} style={{ marginBottom: 12 }}>
                <label style={{ display: "block", fontSize: 10, color: "var(--text-faint)", letterSpacing: ".15em", marginBottom: 5 }}>{f.l}</label>
                <input value={form[f.k]} onChange={e => upd(f.k, e.target.value)} placeholder={f.ph} style={{ width: "100%", padding: "10px 12px" }} />
              </div>
            ))}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
              <div>
                <label style={{ display: "block", fontSize: 10, color: "var(--text-faint)", letterSpacing: ".15em", marginBottom: 5 }}>ROLE</label>
                <select value={form.role} onChange={e => upd("role", e.target.value)} style={{ width: "100%", padding: "9px 12px" }}>
                  <option value="pastor">Pastor</option>
                  <option value="associate">Associate Pastor</option>
                  <option value="branchadmin">Branch Admin</option>
                  <option value="superadmin">Super Admin</option>
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontSize: 10, color: "var(--text-faint)", letterSpacing: ".15em", marginBottom: 5 }}>ASSIGNED BRANCH</label>
                <select value={form.branchId} onChange={e => upd("branchId", e.target.value)} style={{ width: "100%", padding: "9px 12px" }}>
                  <option value="">— No Branch —</option>
                  {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 16 }}>
              {[
                { k: "bibleVersion", l: "BIBLE VERSION", o: BIBLE_VERSIONS },
                { k: "preferredStyle", l: "PREACHING STYLE", o: SERMON_STYLES },
                { k: "defaultAudience", l: "AUDIENCE", o: AUDIENCE },
              ].map(f => (
                <div key={f.k}>
                  <label style={{ display: "block", fontSize: 10, color: "var(--text-faint)", letterSpacing: ".15em", marginBottom: 5 }}>{f.l}</label>
                  <select value={form[f.k]} onChange={e => upd(f.k, e.target.value)} style={{ width: "100%", padding: "9px 12px" }}>
                    {f.o.map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
              ))}
            </div>
            <div style={{ padding: "10px 13px", background: "rgba(201,168,76,0.07)", borderRadius: 8, border: "1px solid var(--border)", marginBottom: 16, fontSize: 12, color: "var(--text-dim)" }}>
              ✦ An invitation email would be sent to this pastor. They will set their own password on first login. <span style={{ color: "var(--text-faint)" }}>(Simulated in this demo)</span>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="ghost" onClick={() => setShowModal(false)} style={{ flex: 1, padding: "10px", fontSize: 11 }}>Cancel</button>
              <button className="btn" onClick={save} style={{ flex: 2, padding: "10px", fontSize: 12 }}>{editUser ? "Save Changes" : "Send Invitation"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════
// ADMIN: ACTIVITY & STATS
// ═══════════════════════════════════════════
function AdminActivity({ church, branches, users, sermons }) {
  const stats = [
    { l: "Total Members", v: branches.reduce((a, b) => a + (b.members || 0), 0).toLocaleString(), i: "👥", c: "var(--gold)" },
    { l: "Active Branches", v: branches.filter(b => b.status === "active").length, i: "🌿", c: "var(--teal)" },
    { l: "Pastor Accounts", v: users.length, i: "✝", c: "var(--purple)" },
    { l: "Sermons Prepared", v: sermons.length, i: "📜", c: "var(--green)" },
    { l: "Hours Saved", v: Math.round(sermons.length * 4.5), i: "⏱", c: "var(--gold-light)" },
    { l: "Active Today", v: users.filter(u => u.lastActive === "Today").length, i: "🟢", c: "var(--green)" },
  ];
  return (
    <div className="fu">
      <div className="cin" style={{ fontSize: 14, color: "var(--gold)", marginBottom: 20 }}>CHURCH ACTIVITY & ANALYTICS</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 22 }}>
        {stats.map(s => (
          <div key={s.l} className="bg" style={{ padding: "18px 22px" }}>
            <div style={{ fontSize: 26, marginBottom: 6 }}>{s.i}</div>
            <div className="cin" style={{ fontSize: 28, color: s.c, fontWeight: 700 }}>{s.v}</div>
            <div style={{ fontSize: 12, color: "var(--text-faint)", marginTop: 3 }}>{s.l}</div>
          </div>
        ))}
      </div>
      <div className="cin" style={{ fontSize: 9, color: "var(--text-faint)", letterSpacing: ".2em", marginBottom: 12 }}>BRANCH BREAKDOWN</div>
      <div className="bg" style={{ marginBottom: 18 }}>
        {branches.map((b, i) => {
          const bUsers = users.filter(u => u.branchId === b.id);
          const bSermons = sermons.filter(s => s.branchId === b.id);
          const pct = branches.length ? Math.round((b.members || 0) / Math.max(1, branches.reduce((a, x) => a + (x.members || 0), 0)) * 100) : 0;
          return (
            <div key={b.id} style={{ padding: "14px 20px", borderBottom: i < branches.length - 1 ? "1px solid var(--border)" : "none" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div className="cin" style={{ fontSize: 12, color: "var(--gold-light)" }}>{b.name}</div>
                  <span style={{ fontSize: 11, color: "var(--text-faint)" }}>📍 {b.city}</span>
                </div>
                <div style={{ display: "flex", gap: 16 }}>
                  <span style={{ fontSize: 11, color: "var(--text-dim)" }}>👥 {b.members?.toLocaleString()}</span>
                  <span style={{ fontSize: 11, color: "var(--teal)" }}>✝ {bUsers.length} accounts</span>
                  <span style={{ fontSize: 11, color: "var(--gold)" }}>📜 {bSermons.length} sermons</span>
                </div>
              </div>
              <div style={{ height: 4, background: "rgba(255,255,255,0.05)", borderRadius: 2 }}>
                <div style={{ height: "100%", width: `${pct}%`, background: "linear-gradient(90deg,var(--gold-dim),var(--gold))", borderRadius: 2 }} />
              </div>
            </div>
          );
        })}
        {branches.length === 0 && <div style={{ padding: 30, textAlign: "center", fontSize: 13, color: "var(--text-faint)", fontStyle: "italic" }}>No branches yet.</div>}
      </div>
      <div className="cin" style={{ fontSize: 9, color: "var(--text-faint)", letterSpacing: ".2em", marginBottom: 12 }}>TEAM ACTIVITY</div>
      <div className="bg">
        {users.map((u, i) => (
          <div key={u.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 18px", borderBottom: i < users.length - 1 ? "1px solid var(--border)" : "none" }}>
            <Avatar user={u} size={30} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, color: "var(--text)" }}>{u.name}</div>
              <RoleBadge role={u.role} />
            </div>
            <div style={{ fontSize: 11, color: "var(--text-faint)" }}>Last active: <span style={{ color: u.lastActive === "Today" ? "var(--green)" : "var(--text-dim)" }}>{u.lastActive}</span></div>
            <div style={{ fontSize: 11, color: "var(--gold)" }}>{sermons.filter(s => s.authorId === u.id).length} sermons</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// ADMIN: ALL SERMONS
// ═══════════════════════════════════════════
function AdminSermons({ sermons, branches, users }) {
  const [sel, setSel] = useState(null);
  if (sel) return (
    <div className="fu">
      <button onClick={() => setSel(null)} className="ghost" style={{ marginBottom: 16, padding: "7px 15px", fontSize: 10 }}>← All Sermons</button>
      <div className="bg" style={{ padding: "28px 32px" }}>
        <div className="cin" style={{ fontSize: 16, color: "var(--gold)", marginBottom: 4 }}>{sel.title || sel.passage}</div>
        <div style={{ fontSize: 12, color: "var(--text-faint)", marginBottom: 6 }}>by {sel.authorName} · {sel.savedAt}</div>
        <div className="div" />
        {Object.entries(sel.results || {}).map(([k, v]) => (
          <div key={k} style={{ marginBottom: 24 }}>
            <div className="cin" style={{ fontSize: 10, color: "var(--gold)", letterSpacing: ".15em", marginBottom: 8, textTransform: "uppercase" }}>{k}</div>
            <div className="prose" style={{ fontSize: 14 }}>{v}</div>
            <div className="div" />
          </div>
        ))}
      </div>
    </div>
  );
  return (
    <div className="fu">
      <div className="cin" style={{ fontSize: 14, color: "var(--gold)", marginBottom: 18 }}>ALL CHURCH SERMONS</div>
      {sermons.length === 0 ? (
        <div className="bg" style={{ padding: 60, textAlign: "center" }}>
          <div style={{ fontSize: 50, opacity: 0.08, marginBottom: 12 }}>📚</div>
          <div className="cor" style={{ fontSize: 18, color: "var(--text-faint)", fontStyle: "italic" }}>No sermons have been prepared yet.</div>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 13 }}>
          {sermons.map(s => {
            const br = branches.find(b => b.id === s.branchId);
            const author = users.find(u => u.id === s.authorId);
            return (
              <div key={s.id} className="bg hov" onClick={() => setSel(s)} style={{ padding: "16px 18px" }}>
                <div style={{ fontSize: 10, color: "var(--gold-dim)", marginBottom: 5 }}>{s.savedAt}</div>
                <div className="cin" style={{ fontSize: 12, color: "var(--gold-light)", marginBottom: 4, lineHeight: 1.3 }}>{s.title || s.passage || s.topic}</div>
                <div style={{ fontSize: 11, color: "var(--text-faint)", marginBottom: 8 }}>{s.passage}</div>
                {author && (
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                    <Avatar user={author} size={18} />
                    <span style={{ fontSize: 11, color: "var(--text-dim)" }}>{author.name}</span>
                  </div>
                )}
                {br && <div style={{ fontSize: 10, color: "var(--teal)" }}>🌿 {br.name}</div>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════
// ADMIN: SETTINGS
// ═══════════════════════════════════════════
function AdminSettings({ church, updateChurch }) {
  const [local, setLocal] = useState({ ...church });
  const [saved, setSaved] = useState(false);
  const upd = (k, v) => setLocal(p => ({ ...p, [k]: v }));
  const save = () => { updateChurch(local); setSaved(true); setTimeout(() => setSaved(false), 3000); };
  return (
    <div className="fu">
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
        <div className="bg" style={{ padding: "22px 24px" }}>
          <div className="cin" style={{ fontSize: 11, color: "var(--gold)", letterSpacing: ".18em", marginBottom: 16 }}>⛪ CHURCH IDENTITY</div>
          {[{ k: "name", l: "CHURCH NAME", ph: "Grace Community Church" }, { k: "city", l: "CITY & STATE", ph: "Atlanta, GA" }, { k: "website", l: "WEBSITE", ph: "www.church.org" }, { k: "foundedYear", l: "FOUNDED", ph: "2005" }].map(f => (
            <div key={f.k} style={{ marginBottom: 11 }}>
              <label style={{ display: "block", fontSize: 10, color: "var(--text-faint)", letterSpacing: ".15em", marginBottom: 4 }}>{f.l}</label>
              <input value={local[f.k] || ""} onChange={e => upd(f.k, e.target.value)} placeholder={f.ph} style={{ width: "100%", padding: "9px 12px" }} />
            </div>
          ))}
          <div style={{ marginBottom: 11 }}>
            <label style={{ display: "block", fontSize: 10, color: "var(--text-faint)", letterSpacing: ".15em", marginBottom: 4 }}>DENOMINATION</label>
            <select value={local.denomination} onChange={e => upd("denomination", e.target.value)} style={{ width: "100%", padding: "8px 12px" }}>
              {DENOMINATIONS.map(d => <option key={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: "block", fontSize: 10, color: "var(--text-faint)", letterSpacing: ".15em", marginBottom: 4 }}>VISION STATEMENT</label>
            <textarea value={local.vision || ""} onChange={e => upd("vision", e.target.value)} rows={3} style={{ width: "100%", padding: "8px 12px", resize: "vertical" }} />
          </div>
        </div>
        <div className="bg" style={{ padding: "22px 24px" }}>
          <div className="cin" style={{ fontSize: 11, color: "var(--gold)", letterSpacing: ".18em", marginBottom: 16 }}>📖 PREACHING DEFAULTS</div>
          {[
            { k: "bibleVersion", l: "BIBLE VERSION", o: BIBLE_VERSIONS },
            { k: "preferredStyle", l: "PREACHING STYLE", o: SERMON_STYLES },
            { k: "defaultAudience", l: "PRIMARY AUDIENCE", o: AUDIENCE },
            { k: "sermonLength", l: "SERMON LENGTH", o: LENGTHS },
            { k: "season", l: "CHURCH SEASON", o: SEASONS },
          ].map(f => (
            <div key={f.k} style={{ marginBottom: 11 }}>
              <label style={{ display: "block", fontSize: 10, color: "var(--text-faint)", letterSpacing: ".15em", marginBottom: 4 }}>{f.l}</label>
              <select value={local[f.k] || ""} onChange={e => upd(f.k, e.target.value)} style={{ width: "100%", padding: "8px 12px" }}>
                {f.o.map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
          ))}
          <div style={{ marginTop: 8, padding: "12px 14px", background: "rgba(201,168,76,0.07)", borderRadius: 9, border: "1px solid var(--border)", fontSize: 12, color: "var(--text-dim)" }}>
            <div className="cin" style={{ fontSize: 9, color: "var(--gold)", letterSpacing: ".15em", marginBottom: 4 }}>CURRENT PLAN</div>
            <div style={{ fontSize: 14, color: "var(--gold-light)" }}>{PLANS.find(p => p.id === church.plan)?.name} Plan</div>
            <div style={{ fontSize: 11, color: "var(--text-faint)", marginTop: 2 }}>{PLANS.find(p => p.id === church.plan)?.monthly}/month · {PLANS.find(p => p.id === church.plan)?.branches} branches · {PLANS.find(p => p.id === church.plan)?.pastors} accounts</div>
            <button className="ghost" style={{ marginTop: 10, width: "100%", padding: "8px", fontSize: 10 }}>⬆ Upgrade Plan</button>
          </div>
        </div>
      </div>
      <div style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 12 }}>
        <button className="btn" onClick={save} style={{ padding: "12px 36px", fontSize: 13 }}>{saved ? "✓ Saved" : "💾 Save Settings"}</button>
        {saved && <div className="cor" style={{ fontSize: 15, color: "var(--green)", fontStyle: "italic" }}>Church settings updated.</div>}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// PASTOR DASHBOARD
// ═══════════════════════════════════════════
function PastorDashboard({ user, church, myBranch, mySermons, setNav }) {
  const h = new Date().getHours();
  const g = h < 12 ? "Morning" : h < 17 ? "Afternoon" : "Evening";
  const actions = [
    { i: "✝", l: "AI Pastor", s: "Biblical & world insight", n: "ai-pastor", c: "var(--gold)" },
    { i: "💡", l: "Topic Engine", s: "Spirit-inspired ideas", n: "topic-gen", c: "var(--teal)" },
    { i: "🔥", l: "Sermon Forge", s: "Full manuscript + web research", n: "sermon-forge", c: "#e07a5f" },
    { i: "📜", l: "Word Study", s: "Greek & Hebrew deep dive", n: "word-study", c: "var(--green)" },
    { i: "🖼", l: "Illustrations", s: "Stories & cultural bridges", n: "illustrations", c: "var(--purple)" },
    { i: "📅", l: "Series Planner", s: "Plan your calendar", n: "calendar", c: "#f4d35e" },
  ];
  return (
    <div className="fu">
      <div className="bg" style={{ padding: "26px 32px", marginBottom: 18, background: "linear-gradient(135deg,rgba(201,168,76,0.1) 0%,rgba(10,8,18,0.95) 65%)", borderColor: "rgba(201,168,76,0.38)", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", right: 20, top: "50%", transform: "translateY(-50%)", fontSize: 160, opacity: 0.04, fontFamily: "Georgia", pointerEvents: "none" }}>✝</div>
        <div className="cin" style={{ fontSize: 9, color: "var(--gold)", letterSpacing: ".28em", marginBottom: 8 }}>SERMON PREPARATION SUITE</div>
        <div className="cor" style={{ fontSize: 30, fontWeight: 600, color: "#F5EDD8", lineHeight: 1.2, marginBottom: 5 }}>Good {g}, {user.name.split(" ")[0]}</div>
        <div style={{ fontSize: 13, color: "var(--text-dim)", marginBottom: 12 }}>
          {myBranch ? `${myBranch.name} · ` : ""}{church.name} · {user.bibleVersion}
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <RoleBadge role={user.role} />
          {myBranch && <span className="tag" style={{ background: "rgba(58,140,168,0.1)", border: "1px solid rgba(58,140,168,0.3)", color: "var(--teal)" }}>🌿 {myBranch.name}</span>}
          <span className="tag" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid var(--border)", color: "var(--text-dim)" }}>{user.preferredStyle}</span>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 20 }}>
        {[
          { l: "My Sermons", v: mySermons.length, i: "📜", c: "var(--gold)" },
          { l: "Hours Saved", v: Math.round(mySermons.length * 4.5), i: "⏱", c: "var(--teal)" },
          { l: "Bible Version", v: user.bibleVersion, i: "📖", c: "var(--gold-light)" },
          { l: "Style", v: user.preferredStyle?.split("/")[0], i: "🎤", c: "var(--green)" },
        ].map(s => (
          <div key={s.l} className="bg" style={{ padding: "16px 18px" }}>
            <div style={{ fontSize: 22, marginBottom: 5 }}>{s.i}</div>
            <div className="cin" style={{ fontSize: 22, color: s.c, fontWeight: 700 }}>{s.v}</div>
            <div style={{ fontSize: 11, color: "var(--text-faint)", marginTop: 2 }}>{s.l}</div>
          </div>
        ))}
      </div>
      <div className="cin" style={{ fontSize: 9, color: "var(--text-faint)", letterSpacing: ".2em", marginBottom: 11 }}>LAUNCH A TOOL</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 22 }}>
        {actions.map(a => (
          <div key={a.n} className="bg hov" onClick={() => setNav(a.n)} style={{ padding: "18px 20px", display: "flex", alignItems: "center", gap: 13 }}>
            <div style={{ width: 44, height: 44, borderRadius: 10, background: "rgba(255,255,255,0.04)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>{a.i}</div>
            <div>
              <div className="cin" style={{ fontSize: 11, color: a.c, marginBottom: 2 }}>{a.l}</div>
              <div style={{ fontSize: 11, color: "var(--text-faint)", lineHeight: 1.35 }}>{a.s}</div>
            </div>
          </div>
        ))}
      </div>
      {mySermons.length > 0 && <>
        <div className="cin" style={{ fontSize: 9, color: "var(--text-faint)", letterSpacing: ".2em", marginBottom: 11 }}>MY RECENT SERMONS</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
          {mySermons.slice(0, 3).map(s => (
            <div key={s.id} className="bg" style={{ padding: "14px 16px" }}>
              <div style={{ fontSize: 10, color: "var(--gold-dim)", marginBottom: 5 }}>{s.savedAt}</div>
              <div className="cin" style={{ fontSize: 11, color: "var(--gold-light)", marginBottom: 3, lineHeight: 1.3 }}>{s.title || s.passage || s.topic}</div>
              <div style={{ fontSize: 10, color: "var(--text-faint)" }}>{s.style} · {s.audience}</div>
            </div>
          ))}
        </div>
      </>}
    </div>
  );
}

// ═══════════════════════════════════════════
// AI PASTOR
// ═══════════════════════════════════════════
function AIPastor({ user, church, myBranch }) {
  const [msgs, setMsgs] = useState([{ role: "assistant", text: `Peace be with you, ${user.name.split(" ")[0]}.\n\nI am your AI Pastoral Companion — theologian, exegete, and prophetic cultural analyst. I draw from the full counsel of God's Word and examine world events so you can preach with relevance and authority.\n\nAsk me anything: theological questions, pastoral dilemmas, current events through a biblical lens, sermon direction, or cultural commentary.\n\nWith Live Web Research enabled, I search the internet in real time and bring those insights through Scripture.\n\nHow may I serve you today?` }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [web, setWeb] = useState(true);
  const ref = useRef(null);
  useEffect(() => { ref.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs, loading]);

  const SYS = `You are an AI Pastoral Companion for ${user.name}, a ${user.role} at ${church.name}${myBranch ? `, specifically serving ${myBranch.name}` : ""}. Church: ${church.denomination} in ${church.city}. Bible: ${user.bibleVersion}. Style: ${user.preferredStyle}.
You are a Spirit-sensitive pastoral theologian — depth of a seminary professor, heart of a shepherd. You exegete Scripture precisely, reference church history and systematic theology, search the web and examine world events through a prophetic biblical lens, and provide pastoral counsel with warmth and authority. Never compromise on biblical truth. Always cite Scripture. Respond in rich pastoral prose.`;

  const send = async () => {
    if (!input.trim() || loading) return;
    const u = input.trim(); setInput("");
    setMsgs(p => [...p, { role: "user", text: u }]);
    setLoading(true);
    try {
      const hist = msgs.slice(-8).map(m => `${m.role === "user" ? user.name : "AI Companion"}: ${m.text}`).join("\n\n");
      const r = await callClaude(`${hist}\n\n${user.name}: ${u}`, SYS, web);
      setMsgs(p => [...p, { role: "assistant", text: r }]);
    } catch { setMsgs(p => [...p, { role: "assistant", text: "Error. Please try again." }]); }
    setLoading(false);
  };

  const suggestions = ["What does Scripture say about anxiety and our current mental health crisis?", "Give me 3 sermon angles on the resurrection for a post-modern audience", "Search the web: what world events should I address from the pulpit this week?", "How do I preach the doctrine of election pastorally?"];

  return (
    <div className="fu" style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 145px)" }}>
      <div className="bg" style={{ padding: "13px 20px", marginBottom: 11, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: "50%", background: "linear-gradient(135deg,var(--gold-dim),#1a1020)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, border: "1px solid var(--border-hi)", animation: "glow 4s infinite" }}>✝</div>
          <div>
            <div className="cin" style={{ fontSize: 12, color: "var(--gold)" }}>AI PASTORAL COMPANION</div>
            <div style={{ fontSize: 11, color: "var(--text-faint)" }}>Biblical depth · World insight · Prophetic counsel</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 11, color: "var(--text-dim)" }}>Live Web</span>
          <div onClick={() => setWeb(v => !v)} style={{ width: 38, height: 20, borderRadius: 10, cursor: "pointer", background: web ? "var(--gold)" : "rgba(255,255,255,0.1)", position: "relative", transition: "background .3s" }}>
            <div style={{ position: "absolute", top: 3, left: web ? 18 : 3, width: 13, height: 13, borderRadius: "50%", background: web ? "#0B0A0F" : "var(--text-faint)", transition: "left .3s" }} />
          </div>
          <span className="tag" style={{ background: web ? "rgba(201,168,76,0.1)" : "rgba(255,255,255,0.05)", color: web ? "var(--gold)" : "var(--text-faint)", border: "1px solid var(--border)" }}>{web ? "🌐 LIVE" : "📖 OFFLINE"}</span>
        </div>
      </div>
      <div className="bg" style={{ flex: 1, overflowY: "auto", padding: "20px 24px", marginBottom: 11 }}>
        {msgs.map((m, i) => (
          <div key={i} style={{ marginBottom: 22, display: "flex", gap: 12, alignItems: "flex-start" }}>
            <div style={{ width: 34, height: 34, borderRadius: "50%", flexShrink: 0, background: m.role === "assistant" ? "linear-gradient(135deg,var(--gold-dim),#1a1020)" : "rgba(201,168,76,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, border: "1px solid var(--border)" }}>
              {m.role === "assistant" ? "✝" : user.avatar}
            </div>
            <div style={{ flex: 1 }}>
              <div className="cin" style={{ fontSize: 9, color: m.role === "assistant" ? "var(--gold)" : "var(--text-dim)", letterSpacing: ".15em", marginBottom: 5 }}>{m.role === "assistant" ? "AI PASTORAL COMPANION" : user.name.toUpperCase()}</div>
              <div className="prose" style={{ fontSize: 14 }}>{m.text}</div>
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(135deg,var(--gold-dim),#1a1020)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, border: "1px solid var(--border)", flexShrink: 0 }}>✝</div>
            <div style={{ paddingTop: 4 }}>
              <div className="cin" style={{ fontSize: 9, color: "var(--gold)", letterSpacing: ".15em", marginBottom: 7 }}>AI PASTORAL COMPANION</div>
              <div className="prog" style={{ width: 180 }} />
              <div style={{ fontSize: 11, color: "var(--text-faint)", marginTop: 6, fontStyle: "italic" }}>{web ? "Searching Scripture and the world…" : "Searching the Scriptures…"}</div>
            </div>
          </div>
        )}
        <div ref={ref} />
      </div>
      {msgs.length <= 1 && (
        <div style={{ display: "flex", gap: 7, marginBottom: 9, flexWrap: "wrap", flexShrink: 0 }}>
          {suggestions.map(s => <button key={s} onClick={() => setInput(s)} className="ghost" style={{ padding: "6px 11px", fontSize: 10 }}>{s.length > 52 ? s.slice(0, 49) + "…" : s}</button>)}
        </div>
      )}
      <div className="bg" style={{ padding: "11px 13px", display: "flex", gap: 9, alignItems: "flex-end", flexShrink: 0 }}>
        <textarea value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }} placeholder="Ask about theology, current events, pastoral challenges… (Enter to send)" rows={2} style={{ flex: 1, padding: "9px 11px", resize: "none", fontSize: 14, lineHeight: 1.6 }} />
        <button className="btn" onClick={send} disabled={loading || !input.trim()} style={{ padding: "11px 20px", fontSize: 12 }}>Send ↑</button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// TOPIC ENGINE
// ═══════════════════════════════════════════
function TopicEngine({ user, church }) {
  const [mode, setMode] = useState("random");
  const [theme, setTheme] = useState("");
  const [audience, setAudience] = useState(user.defaultAudience);
  const [season, setSeason] = useState(church.season);
  const [count, setCount] = useState(6);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sel, setSel] = useState(null);
  const [err, setErr] = useState("");

  const gen = async () => {
    setLoading(true); setTopics([]); setSel(null); setErr("");
    const SYS = "You are an expert homiletics consultant. Generate powerful, culturally incisive sermon topics. Return ONLY a raw JSON array, no markdown, no backticks, no extra text.";
    const p = mode === "random"
      ? `Generate ${count} sermon topics for a ${church.denomination} church. Season:${season}. Audience:${audience}. Style:${user.preferredStyle}. Search web for current world events the church should address.\n\nReturn ONLY raw JSON array. Each: title,passage,bigIdea,hook,relevance,culturalMoment,keywords`
      : `Generate ${count} sermon topics on "${theme}" for a ${church.denomination} church. Season:${season}. Audience:${audience}.\n\nReturn ONLY raw JSON array. Each: title,passage,bigIdea,hook,relevance,culturalMoment,keywords`;
    try {
      const r = await callClaude(p, SYS, true);
      const t = safeJSON(r, []);
      if (t.length) setTopics(t); else setErr("Could not parse. Please try again.");
    } catch { setErr("Error. Please try again."); }
    setLoading(false);
  };

  return (
    <div className="fu">
      <div className="bg" style={{ padding: "22px 26px", marginBottom: 18 }}>
        <div className="cin" style={{ fontSize: 11, color: "var(--gold)", letterSpacing: ".2em", marginBottom: 14 }}>⚡ SERMON TOPIC ENGINE</div>
        <div style={{ display: "flex", gap: 9, marginBottom: 16 }}>
          {[{ v: "random", l: "🎲 Spirit-Inspired" }, { v: "custom", l: "🎯 Custom Theme" }].map(m => <button key={m.v} onClick={() => setMode(m.v)} className={mode === m.v ? "btn" : "ghost"} style={{ padding: "9px 18px", fontSize: 11 }}>{m.l}</button>)}
        </div>
        {mode === "custom" && (
          <div style={{ marginBottom: 13 }}>
            <label style={{ display: "block", fontSize: 10, color: "var(--text-faint)", letterSpacing: ".15em", marginBottom: 4 }}>YOUR THEME</label>
            <input value={theme} onChange={e => setTheme(e.target.value)} placeholder="e.g. Healing, Kingdom Economics, Spiritual Warfare…" style={{ width: "100%", padding: "9px 12px" }} />
          </div>
        )}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 11, marginBottom: 14 }}>
          <div>
            <label style={{ display: "block", fontSize: 10, color: "var(--text-faint)", letterSpacing: ".15em", marginBottom: 4 }}>AUDIENCE</label>
            <select value={audience} onChange={e => setAudience(e.target.value)} style={{ width: "100%", padding: "8px 11px" }}>
              {AUDIENCE.map(a => <option key={a}>{a}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: "block", fontSize: 10, color: "var(--text-faint)", letterSpacing: ".15em", marginBottom: 4 }}>SEASON</label>
            <select value={season} onChange={e => setSeason(e.target.value)} style={{ width: "100%", padding: "8px 11px" }}>
              {SEASONS.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: "block", fontSize: 10, color: "var(--text-faint)", letterSpacing: ".15em", marginBottom: 4 }}>COUNT</label>
            <select value={count} onChange={e => setCount(Number(e.target.value))} style={{ width: "100%", padding: "8px 11px" }}>
              {[4, 6, 8, 10, 12].map(n => <option key={n}>{n}</option>)}
            </select>
          </div>
        </div>
        <button className="btn" onClick={gen} disabled={loading} style={{ width: "100%", padding: "12px", fontSize: 13 }}>
          {loading ? "⟳  Searching Scripture & World Events…" : "✦  Generate Topics"}
        </button>
        {loading && <div className="prog" style={{ marginTop: 9 }} />}
        {err && <div style={{ marginTop: 9, color: "#e07a5f", fontSize: 12 }}>{err}</div>}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 12 }}>
        {topics.map((t, i) => (
          <div key={i} className="bg hov" onClick={() => setSel(sel === i ? null : i)} style={{ padding: "18px 20px", borderColor: sel === i ? "var(--border-hi)" : "var(--border)", background: sel === i ? "rgba(201,168,76,0.07)" : "var(--panel)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 7 }}>
              <div style={{ flex: 1 }}>
                <div className="cin" style={{ fontSize: 12, color: "var(--gold-light)", marginBottom: 3, lineHeight: 1.3 }}>{t.title}</div>
                <div style={{ fontSize: 11, color: "var(--teal)" }}>{t.passage}</div>
              </div>
              <div style={{ width: 24, height: 24, borderRadius: "50%", background: "rgba(201,168,76,0.09)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, color: "var(--gold-dim)", border: "1px solid var(--border)", flexShrink: 0, marginLeft: 7 }}>{i + 1}</div>
            </div>
            <div className="cor" style={{ fontSize: 14, color: "var(--text-dim)", fontStyle: "italic", marginBottom: 6, lineHeight: 1.5 }}>"{t.bigIdea}"</div>
            {sel === i && (
              <div>
                <div className="div" />
                <div style={{ marginBottom: 9 }}>
                  <div className="cin" style={{ fontSize: 8, color: "var(--text-faint)", letterSpacing: ".15em", marginBottom: 3 }}>HOOK</div>
                  <div style={{ fontSize: 13, color: "var(--text)", lineHeight: 1.7 }}>{t.hook}</div>
                </div>
                <div style={{ marginBottom: 9 }}>
                  <div className="cin" style={{ fontSize: 8, color: "var(--text-faint)", letterSpacing: ".15em", marginBottom: 3 }}>WHY NOW</div>
                  <div style={{ fontSize: 13, color: "var(--text)", lineHeight: 1.7 }}>{t.relevance}</div>
                </div>
                {t.culturalMoment && (
                  <div style={{ padding: "7px 11px", background: "rgba(58,140,168,0.08)", borderRadius: 7, borderLeft: "2px solid var(--teal)", marginBottom: 9 }}>
                    <div className="cin" style={{ fontSize: 8, color: "var(--teal)", letterSpacing: ".15em", marginBottom: 2 }}>🌐 CULTURAL MOMENT</div>
                    <div style={{ fontSize: 12, color: "var(--text)" }}>{t.culturalMoment}</div>
                  </div>
                )}
                <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                  {(t.keywords || []).map(k => <span key={k} className="tag" style={{ background: "rgba(201,168,76,0.07)", border: "1px solid var(--border)", color: "var(--gold-dim)" }}>#{k}</span>)}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// SERMON FORGE
// ═══════════════════════════════════════════
function SermonForge({ user, church, saveSermon }) {
  const [form, setForm] = useState({ passage: "", topic: "", style: user.preferredStyle, audience: user.defaultAudience, length: church.sermonLength || "35 min", season: church.season, emphasis: "", web: true });
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(null);
  const [saved, setSaved] = useState(false);

  const SECS = [
    { id: "outline", icon: "📋", label: "Full Outline" },
    { id: "introduction", icon: "🎤", label: "Introduction" },
    { id: "exposition", icon: "📖", label: "Exposition" },
    { id: "illustration", icon: "💡", label: "Illustrations" },
    { id: "application", icon: "✅", label: "Application" },
    { id: "conclusion", icon: "🎯", label: "Conclusion & Altar" },
    { id: "fullsermon", icon: "🔥", label: "Full Manuscript" },
  ];

  const SYS = `You are a master homiletician serving ${user.name} at ${church.name}, a ${church.denomination} church. Bible: ${user.bibleVersion}. Write sermons with deep exegetical precision, cultural relevance from web research, pastoral warmth, and prophetic boldness. Write in rich, fully developed prose — never bullet points.`;

  const CTX = `Passage:${form.passage || "Not specified"}. Topic:${form.topic || "Not specified"}. Style:${form.style}. Audience:${form.audience}. Length:${form.length}. Season:${form.season}. Emphasis:${form.emphasis || "None"}.`;

  const PROMPTS = {
    outline: `${CTX}\n\nCreate a comprehensive sermon outline: title, subtitle, central proposition, sermon aim, introduction with cultural hook, three main points each with exegetical anchor and sub-points, transitions, conclusion with altar call, worship song suggestions. Write as developed prose outline.`,
    introduction: `${CTX}\n\nWrite a complete sermon introduction (4-6 minutes). Include: culturally compelling opening from current news (search web), the existential problem, bridge to Scripture, big idea statement, message preview. Make it unforgettable.`,
    exposition: `${CTX}\n\nProvide thorough expository treatment: verse-by-verse exegesis, original language insights, historical background, 8 cross-references, canonical connections, 3 scholar insights. Search web for recent discoveries or cultural parallels.`,
    illustration: `${CTX}\n\n5 fully developed illustrations (180-220 words each): 1) Current news story (search web now), 2) Church history story, 3) Science/nature, 4) Relatable everyday scenario, 5) Powerful closing image. Write in full preaching prose.`,
    application: `${CTX}\n\nDevelop rich practical application: personal action steps, relational transformation, vocational implications, community engagement, connection to current cultural issue (search web), 7-day challenge, 5 small group questions. Write pastorally.`,
    conclusion: `${CTX}\n\nWrite complete conclusion and altar call (6-8 min): climactic story landing the central truth, pastoral application, full altar call for salvation/recommitment/healing/breakthrough, complete prayer, commissioning, Scripture benediction.`,
    fullsermon: `${CTX}\n\nWrite a COMPLETE sermon manuscript — every word, ready to preach. All sections seamlessly woven: title, proposition, full introduction with cultural hook from web search, main points with exposition and illustrations integrated, transitions, application throughout, complete conclusion with altar call and benediction. Length: ${form.length}. Write in a powerful, pastoral, preachable voice.`,
  };

  const forge = async (id) => {
    setLoading(id);
    try { const r = await callClaude(PROMPTS[id], SYS, form.web); setResults(p => ({ ...p, [id]: r })); }
    catch { setResults(p => ({ ...p, [id]: "Error. Please try again." })); }
    setLoading(null);
  };

  return (
    <div className="fu" style={{ display: "grid", gridTemplateColumns: "272px 1fr", gap: 16, alignItems: "start" }}>
      <div style={{ position: "sticky", top: 0 }}>
        <div className="bg" style={{ padding: "18px 16px" }}>
          <div className="cin" style={{ fontSize: 11, color: "var(--gold)", letterSpacing: ".18em", marginBottom: 14 }}>🔥 SERMON FORGE</div>
          {[{ k: "passage", l: "SCRIPTURE", ph: "e.g. Romans 8:28-39" }, { k: "topic", l: "TOPIC / TITLE", ph: "e.g. Unbreakable Love" }, { k: "emphasis", l: "EMPHASIS", ph: "e.g. anxiety, grief" }].map(f => (
            <div key={f.k} style={{ marginBottom: 10 }}>
              <label style={{ display: "block", fontSize: 9, color: "var(--text-faint)", letterSpacing: ".15em", marginBottom: 4 }}>{f.l}</label>
              <input value={form[f.k]} onChange={e => setForm(p => ({ ...p, [f.k]: e.target.value }))} placeholder={f.ph} style={{ width: "100%", padding: "8px 11px" }} />
            </div>
          ))}
          {[{ k: "style", l: "STYLE", o: SERMON_STYLES }, { k: "audience", l: "AUDIENCE", o: AUDIENCE }, { k: "length", l: "LENGTH", o: LENGTHS }, { k: "season", l: "SEASON", o: SEASONS }].map(f => (
            <div key={f.k} style={{ marginBottom: 10 }}>
              <label style={{ display: "block", fontSize: 9, color: "var(--text-faint)", letterSpacing: ".15em", marginBottom: 4 }}>{f.l}</label>
              <select value={form[f.k]} onChange={e => setForm(p => ({ ...p, [f.k]: e.target.value }))} style={{ width: "100%", padding: "7px 11px" }}>
                {f.o.map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
          ))}
          <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "8px 0", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)", margin: "9px 0 12px" }}>
            <div onClick={() => setForm(p => ({ ...p, web: !p.web }))} style={{ width: 32, height: 17, borderRadius: 9, cursor: "pointer", background: form.web ? "var(--gold)" : "rgba(255,255,255,0.1)", position: "relative", transition: "background .3s", flexShrink: 0 }}>
              <div style={{ position: "absolute", top: 2, left: form.web ? 15 : 2, width: 12, height: 12, borderRadius: "50%", background: form.web ? "#0B0A0F" : "var(--text-faint)", transition: "left .3s" }} />
            </div>
            <span style={{ fontSize: 10, color: "var(--text-dim)" }}>🌐 Live Web Research</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 8 }}>
            {SECS.slice(0, 6).map(s => (
              <button key={s.id} onClick={() => forge(s.id)} disabled={!!loading} className="ghost" style={{ padding: "7px 5px", fontSize: 9, display: "flex", alignItems: "center", justifyContent: "center", gap: 4, borderColor: results[s.id] ? "var(--border-hi)" : "var(--border)" }}>
                {loading === s.id ? <span className="spin-gold" /> : s.icon} {s.label}
              </button>
            ))}
          </div>
          <button onClick={() => forge("fullsermon")} disabled={!!loading} className="btn" style={{ width: "100%", padding: "11px", fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
            {loading === "fullsermon" ? <><span className="spin-el" /> Forging…</> : "🔥 Full Manuscript"}
          </button>
          {Object.keys(results).length > 0 && (
            <button onClick={() => { saveSermon({ ...form, title: form.topic || form.passage || "Untitled", results }); setSaved(true); setTimeout(() => setSaved(false), 3000); }} style={{ width: "100%", padding: "8px", fontSize: 10, marginTop: 7, borderRadius: 9, border: "none", cursor: "pointer", background: saved ? "rgba(90,158,114,0.15)" : "rgba(255,255,255,0.05)", color: saved ? "var(--green)" : "var(--text-dim)", transition: "all .3s" }}>
              {saved ? "✓ Saved" : "💾 Save to Library"}
            </button>
          )}
        </div>
      </div>
      <div>
        {loading && (
          <div className="bg" style={{ padding: 44, textAlign: "center", marginBottom: 13 }}>
            <div style={{ fontSize: 48, marginBottom: 12, animation: "glow 2s infinite" }}>✝</div>
            <div className="cin" style={{ fontSize: 12, color: "var(--gold)", marginBottom: 9 }}>FORGING YOUR SERMON</div>
            <div className="prog" style={{ maxWidth: 240, margin: "0 auto 9px" }} />
            <div style={{ fontSize: 11, color: "var(--text-faint)", fontStyle: "italic" }}>{form.web ? "Searching Scripture and the web…" : "Searching the Scriptures…"}</div>
          </div>
        )}
        {SECS.map(s => results[s.id] && (
          <div key={s.id} className="bg fu" style={{ padding: "24px 28px", marginBottom: 13 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                <span style={{ fontSize: 18 }}>{s.icon}</span>
                <div className="cin" style={{ fontSize: 11, color: "var(--gold)", letterSpacing: ".1em" }}>{s.label.toUpperCase()}</div>
              </div>
              <button onClick={() => navigator.clipboard.writeText(results[s.id])} className="ghost" style={{ padding: "4px 10px", fontSize: 9 }}>⎘ Copy</button>
            </div>
            <div className="div" />
            <div className="prose">{results[s.id]}</div>
          </div>
        ))}
        {!loading && Object.keys(results).length === 0 && (
          <div className="bg" style={{ padding: 70, textAlign: "center" }}>
            <div style={{ fontSize: 60, opacity: 0.05, marginBottom: 12 }}>📜</div>
            <div className="cor" style={{ fontSize: 20, color: "var(--text-faint)", fontStyle: "italic" }}>Enter your passage or topic, then select a section</div>
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// WORD STUDY
// ═══════════════════════════════════════════
function WordStudy({ user, church }) {
  const [word, setWord] = useState("");
  const [lang, setLang] = useState("auto");
  const [passage, setPassage] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const study = async () => {
    if (!word.trim()) return;
    setLoading(true); setResult("");
    const SYS = "You are a world-class biblical linguist with mastery of Koine Greek, Biblical Hebrew, and Aramaic. Provide thorough, academically rigorous word studies that are pastorally rich and immediately useful for preaching.";
    const p = `Comprehensive word study on "${word}"${lang !== "auto" ? ` (${lang})` : ""}${passage ? ` in ${passage}` : ""} for a ${church.denomination} pastor using ${user.bibleVersion}.\n\nCover: original word, transliteration, pronunciation, Strong's number, root/etymology, full lexical range, key occurrences across Scripture, theological significance, grammatical analysis${passage ? ` in ${passage}` : ""}, how leading translations render it, insights from Calvin/Luther/Chrysostom/Wright, and how this word study transforms the sermon. Write in full academic-pastoral prose.`;
    try { const r = await callClaude(p, SYS); setResult(r); }
    catch { setResult("Error. Please try again."); }
    setLoading(false);
  };

  return (
    <div className="fu">
      <div className="bg" style={{ padding: "22px 26px", marginBottom: 16 }}>
        <div className="cin" style={{ fontSize: 11, color: "var(--gold)", letterSpacing: ".2em", marginBottom: 14 }}>📜 GREEK & HEBREW WORD STUDY</div>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 2fr", gap: 11, marginBottom: 13 }}>
          <div>
            <label style={{ display: "block", fontSize: 9, color: "var(--text-faint)", letterSpacing: ".15em", marginBottom: 4 }}>WORD OR CONCEPT</label>
            <input value={word} onChange={e => setWord(e.target.value)} onKeyDown={e => e.key === "Enter" && study()} placeholder="e.g. agape, shalom, hesed, logos, kairos" style={{ width: "100%", padding: "9px 12px" }} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 9, color: "var(--text-faint)", letterSpacing: ".15em", marginBottom: 4 }}>LANGUAGE</label>
            <select value={lang} onChange={e => setLang(e.target.value)} style={{ width: "100%", padding: "8px 11px" }}>
              <option value="auto">Auto</option>
              <option value="Greek">Greek (NT)</option>
              <option value="Hebrew">Hebrew (OT)</option>
              <option value="Aramaic">Aramaic</option>
            </select>
          </div>
          <div>
            <label style={{ display: "block", fontSize: 9, color: "var(--text-faint)", letterSpacing: ".15em", marginBottom: 4 }}>PASSAGE (OPTIONAL)</label>
            <input value={passage} onChange={e => setPassage(e.target.value)} placeholder="e.g. John 3:16, Psalm 23:1" style={{ width: "100%", padding: "9px 12px" }} />
          </div>
        </div>
        <button className="btn" onClick={study} disabled={loading || !word.trim()} style={{ padding: "11px 30px", fontSize: 13 }}>
          {loading ? "⟳  Studying the Text…" : "🔍  Conduct Word Study"}
        </button>
        {loading && <div className="prog" style={{ marginTop: 9 }} />}
      </div>
      {result && (
        <div className="bg fu" style={{ padding: "28px 32px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div className="cin" style={{ fontSize: 16, color: "var(--gold)" }}>"{word}"</div>
            <button onClick={() => navigator.clipboard.writeText(result)} className="ghost" style={{ padding: "4px 11px", fontSize: 9 }}>⎘ Copy</button>
          </div>
          <div className="div" />
          <div className="prose">{result}</div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════
// ILLUSTRATIONS
// ═══════════════════════════════════════════
function Illustrations({ user, church }) {
  const [topic, setTopic] = useState("");
  const [type, setType] = useState("All Types");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const TYPES = ["All Types", "Contemporary News", "Church History", "Science & Nature", "Sports", "Business & Leadership", "Personal/Relational", "Biographical", "Parable-style", "Object Lesson"];

  const gen = async () => {
    if (!topic.trim()) return;
    setLoading(true); setResults([]); setErr("");
    const SYS = "You are a master storyteller and homiletician. Generate vivid, preachable illustrations. Return ONLY a raw JSON array, no markdown, no backticks.";
    const p = `Generate 6 sermon illustrations for theme:"${topic}". ${type !== "All Types" ? `Type:${type}.` : ""} Church:${church.denomination}. Search web for a current news story for at least one.\n\nReturn ONLY raw JSON array. Each: type, title, content(200-250 words preaching prose), bridge(one sentence to biblical truth), source`;
    try {
      const r = await callClaude(p, SYS, true);
      const t = safeJSON(r, []);
      if (t.length) setResults(t); else setErr("Could not generate. Try again.");
    } catch { setErr("Error. Try again."); }
    setLoading(false);
  };

  return (
    <div className="fu">
      <div className="bg" style={{ padding: "22px 26px", marginBottom: 16 }}>
        <div className="cin" style={{ fontSize: 11, color: "var(--gold)", letterSpacing: ".2em", marginBottom: 14 }}>🖼 ILLUSTRATION ENGINE</div>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 11, marginBottom: 13 }}>
          <div>
            <label style={{ display: "block", fontSize: 9, color: "var(--text-faint)", letterSpacing: ".15em", marginBottom: 4 }}>SERMON THEME OR TOPIC</label>
            <input value={topic} onChange={e => setTopic(e.target.value)} placeholder="e.g. Perseverance, Grace, Faith in uncertainty" style={{ width: "100%", padding: "9px 12px" }} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 9, color: "var(--text-faint)", letterSpacing: ".15em", marginBottom: 4 }}>TYPE</label>
            <select value={type} onChange={e => setType(e.target.value)} style={{ width: "100%", padding: "8px 11px" }}>
              {TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
        </div>
        <button className="btn" onClick={gen} disabled={loading || !topic.trim()} style={{ padding: "11px 30px", fontSize: 13 }}>
          {loading ? "⟳  Searching World & Scripture…" : "✦  Generate Illustrations"}
        </button>
        {loading && <div className="prog" style={{ marginTop: 9 }} />}
        {err && <div style={{ marginTop: 9, color: "#e07a5f", fontSize: 12 }}>{err}</div>}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 13 }}>
        {results.map((r, i) => (
          <div key={i} className="bg fu" style={{ padding: "20px 22px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
              <span className="tag" style={{ background: "rgba(58,140,168,0.1)", border: "1px solid rgba(58,140,168,0.3)", color: "var(--teal)" }}>{r.type}</span>
              <button onClick={() => navigator.clipboard.writeText(`${r.title}\n\n${r.content}\n\nBridge: ${r.bridge}`)} className="ghost" style={{ padding: "3px 9px", fontSize: 8 }}>⎘</button>
            </div>
            <div className="cin" style={{ fontSize: 12, color: "var(--gold-light)", marginBottom: 9, lineHeight: 1.3 }}>{r.title}</div>
            <div style={{ fontSize: 13, color: "var(--text)", lineHeight: 1.85, marginBottom: 11 }}>{r.content}</div>
            <div style={{ padding: "8px 11px", background: "rgba(201,168,76,0.07)", borderRadius: 7, borderLeft: "3px solid var(--gold-dim)" }}>
              <div className="cin" style={{ fontSize: 8, color: "var(--gold-dim)", letterSpacing: ".13em", marginBottom: 3 }}>BRIDGE TO TRUTH</div>
              <div className="cor" style={{ fontSize: 14, color: "var(--gold-light)", fontStyle: "italic" }}>{r.bridge}</div>
            </div>
            {r.source && <div style={{ marginTop: 6, fontSize: 10, color: "var(--text-faint)" }}>Source: {r.source}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// LIBRARY
// ═══════════════════════════════════════════
function Library({ sermons }) {
  const [sel, setSel] = useState(null);
  const [search, setSearch] = useState("");
  const filtered = sermons.filter(s => (s.title || s.passage || s.topic || "").toLowerCase().includes(search.toLowerCase()));

  if (sel) return (
    <div className="fu">
      <button onClick={() => setSel(null)} className="ghost" style={{ marginBottom: 14, padding: "7px 14px", fontSize: 10 }}>← Library</button>
      <div className="bg" style={{ padding: "28px 32px" }}>
        <div className="cin" style={{ fontSize: 16, color: "var(--gold)", marginBottom: 4 }}>{sel.title || sel.passage}</div>
        <div style={{ fontSize: 12, color: "var(--text-faint)", marginBottom: 18 }}>{sel.savedAt} · {sel.style} · {sel.audience}</div>
        <div className="div" />
        {Object.entries(sel.results || {}).map(([k, v]) => (
          <div key={k} style={{ marginBottom: 22 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 9 }}>
              <div className="cin" style={{ fontSize: 10, color: "var(--gold)", letterSpacing: ".13em", textTransform: "uppercase" }}>{k}</div>
              <button onClick={() => navigator.clipboard.writeText(v)} className="ghost" style={{ padding: "3px 9px", fontSize: 8 }}>⎘</button>
            </div>
            <div className="prose" style={{ fontSize: 14 }}>{v}</div>
            <div className="div" />
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="fu">
      <div className="bg" style={{ padding: "16px 22px", marginBottom: 16 }}>
        <div className="cin" style={{ fontSize: 11, color: "var(--gold)", letterSpacing: ".2em", marginBottom: 11 }}>📚 MY SERMON LIBRARY</div>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search…" style={{ width: "100%", padding: "9px 12px" }} />
      </div>
      {filtered.length === 0 ? (
        <div className="bg" style={{ padding: 70, textAlign: "center" }}>
          <div style={{ fontSize: 52, opacity: 0.06, marginBottom: 11 }}>📚</div>
          <div className="cor" style={{ fontSize: 18, color: "var(--text-faint)", fontStyle: "italic" }}>{sermons.length === 0 ? "Your library is empty. Forge your first sermon!" : "No results."}</div>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
          {filtered.map(s => (
            <div key={s.id} className="bg hov" onClick={() => setSel(s)} style={{ padding: "15px 17px" }}>
              <div style={{ fontSize: 10, color: "var(--gold-dim)", marginBottom: 5 }}>{s.savedAt}</div>
              <div className="cin" style={{ fontSize: 11, color: "var(--gold-light)", marginBottom: 3, lineHeight: 1.3 }}>{s.title || s.passage || s.topic}</div>
              <div style={{ fontSize: 10, color: "var(--text-faint)", marginBottom: 8 }}>{s.passage}</div>
              <div style={{ display: "flex", gap: 5 }}>
                <span className="tag" style={{ background: "rgba(201,168,76,0.08)", border: "1px solid var(--border)", color: "var(--gold-dim)" }}>{s.style}</span>
                <span className="tag" style={{ background: "rgba(58,140,168,0.07)", border: "1px solid rgba(58,140,168,0.2)", color: "var(--teal)" }}>{s.audience}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════
// SERIES PLANNER
// ═══════════════════════════════════════════
function SeriesPlanner({ user, church }) {
  const [name, setName] = useState("");
  const [weeks, setWeeks] = useState(4);
  const [startDate, setStartDate] = useState("");
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);

  const gen = async () => {
    setLoading(true); setPlan(null);
    const SYS = "You are a church programming strategist. Create detailed preaching series plans. Return ONLY valid raw JSON, no markdown.";
    const p = `${weeks}-week series${name ? ` titled "${name}"` : ""} for ${church.denomination} church. Season:${church.season}. Style:${user.preferredStyle}. Start:${startDate || "next Sunday"}. Search web for cultural conversations to speak into.\n\nReturn ONLY raw JSON: {seriesTitle,seriesTagline,overview,weeks:[{weekNumber,date,title,passage,bigIdea,keyTheme,culturalConnection,worshipSuggestion}]}`;
    try {
      const r = await callClaude(p, SYS, true);
      const t = safeJSON(r, {});
      if (t.seriesTitle) setPlan(t); else setPlan({ seriesTitle: "Parse error", seriesTagline: "Try again", overview: "", weeks: [] });
    } catch { setPlan({ seriesTitle: "Error", seriesTagline: "Try again", overview: "", weeks: [] }); }
    setLoading(false);
  };

  return (
    <div className="fu">
      <div className="bg" style={{ padding: "22px 26px", marginBottom: 18 }}>
        <div className="cin" style={{ fontSize: 11, color: "var(--gold)", letterSpacing: ".2em", marginBottom: 14 }}>📅 PREACHING SERIES PLANNER</div>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 11, marginBottom: 13 }}>
          <div>
            <label style={{ display: "block", fontSize: 9, color: "var(--text-faint)", letterSpacing: ".15em", marginBottom: 4 }}>SERIES NAME (OPTIONAL)</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Anchored, Rooted, The Beatitudes…" style={{ width: "100%", padding: "9px 12px" }} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 9, color: "var(--text-faint)", letterSpacing: ".15em", marginBottom: 4 }}>WEEKS</label>
            <select value={weeks} onChange={e => setWeeks(Number(e.target.value))} style={{ width: "100%", padding: "8px 11px" }}>
              {[2, 3, 4, 5, 6, 8, 10, 12].map(n => <option key={n}>{n}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: "block", fontSize: 9, color: "var(--text-faint)", letterSpacing: ".15em", marginBottom: 4 }}>START DATE</label>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={{ width: "100%", padding: "8px 11px" }} />
          </div>
        </div>
        <button className="btn" onClick={gen} disabled={loading} style={{ padding: "11px 30px", fontSize: 13 }}>
          {loading ? "⟳  Planning…" : "📅  Generate Series Plan"}
        </button>
        {loading && <div className="prog" style={{ marginTop: 9 }} />}
      </div>
      {plan && (
        <div className="fu">
          <div className="bg" style={{ padding: "22px 28px", marginBottom: 14, background: "linear-gradient(135deg,rgba(201,168,76,0.09) 0%,rgba(10,8,18,0.95) 70%)", borderColor: "rgba(201,168,76,0.38)" }}>
            <div className="cin" style={{ fontSize: 17, color: "var(--gold)", marginBottom: 4 }}>{plan.seriesTitle}</div>
            <div className="cor" style={{ fontSize: 16, color: "var(--text-dim)", fontStyle: "italic", marginBottom: 10 }}>{plan.seriesTagline}</div>
            <div className="prose" style={{ fontSize: 13 }}>{plan.overview}</div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 12 }}>
            {(plan.weeks || []).map((w, i) => (
              <div key={i} className="bg" style={{ padding: "16px 20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 7 }}>
                  <div>
                    <div className="cin" style={{ fontSize: 9, color: "var(--gold-dim)", letterSpacing: ".13em", marginBottom: 2 }}>WEEK {w.weekNumber}{w.date ? ` · ${w.date}` : ""}</div>
                    <div className="cin" style={{ fontSize: 12, color: "var(--gold-light)", lineHeight: 1.3 }}>{w.title}</div>
                  </div>
                  <div style={{ fontSize: 10, color: "var(--teal)", flexShrink: 0, marginLeft: 7 }}>{w.passage}</div>
                </div>
                <div className="cor" style={{ fontSize: 14, color: "var(--text-dim)", fontStyle: "italic", marginBottom: 8 }}>"{w.bigIdea}"</div>
                {w.culturalConnection && <div style={{ fontSize: 11, color: "var(--text-faint)", padding: "6px 9px", background: "rgba(58,140,168,0.07)", borderRadius: 6, borderLeft: "2px solid var(--teal)", marginBottom: 6 }}>🌐 {w.culturalConnection}</div>}
                {w.worshipSuggestion && <div style={{ fontSize: 10, color: "var(--text-faint)" }}>🎵 {w.worshipSuggestion}</div>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
