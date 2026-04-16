import React, { useState, useCallback, useRef, useMemo, useEffect } from "react";
import { PLAN_LIMITS, getPlanLimits, canAccess } from "./lib/plans";
import { loadUsage, incrementUsage, canUseTool, canUseToolFeature } from "./lib/usage";
import { LANGUAGES, getLanguageName, getPreferredBibleVersion } from "./lib/translations";
import { shareSermon } from "./lib/db";

const TRANSLATIONS = {
  en: {
    common: {
      save: "Save",
      cancel: "Cancel",
      close: "Close",
      delete: "Delete",
      edit: "Edit",
      duplicate: "Duplicate",
      search: "Search",
      copy: "Copy",
      downloadPdf: "Download PDF",
      copied: "Copied",
      loading: "Loading...",
      generate: "Generate",
      upgradeNow: "Upgrade Now",
      language: "Language",
      english: "English",
      spanish: "Español",
      french: "Français",
      swahili: "Swahili",
      luganda: "Luganda"
    },
    forge: {
      title: "Sermon Forge",
      subtitle: "Craft complete, polished sermons powered by deep theological AI.",
      sermonTitle: "Sermon Title",
      scriptureReference: "Scripture Reference",
      angleFocus: "Sermon Angle / Focus",
      audience: "Audience",
      forgeSermon: "Forge Sermon",
      forging: "Forging...",
      copySermon: "Copy Sermon",
      provideTitleOrScripture: "Please provide a title or scripture reference.",
      incompleteSermon: "Sermon is not complete yet. Please wait until generation finishes.",
      generatedLabel: "Generated Sermon"
    },
    audience: {
      general: "General Congregation",
      youth: "Youth Ministry",
      newBelievers: "New Believers",
      men: "Men's Ministry",
      women: "Women's Ministry",
      leadership: "Leadership/Elders",
      outreach: "Outreach/Evangelism"
    },
    mode: {
      fast: "Fast Mode",
      deep: "Deep Mode"
    },
    upgrade: {
      title: "Upgrade your plan",
      subtitle: "Deep mode is not available on the free plan.",
      message: "Upgrade your plan to unlock Deep Mode in Sermon Forge.",
      modalMessage: "Deep mode is available on paid plans. Upgrade to unlock richer sermon generation and advanced tools.",
      checkoutPlaceholder: "Stripe checkout will be connected next"
    },
    library: {
      title: "My Sermons",
      empty: "No sermons saved yet."
    },
    errors: {
      generic: "An error occurred.",
      failedToFetch: "Failed to fetch",
      popupBlocked: "Popup was blocked. Please allow popups and try again.",
      copyNotSupported: "Copy not supported in this browser",
      copyFailed: "Copy failed"
    }
  },

  es: {
    common: {
      save: "Guardar",
      cancel: "Cancelar",
      close: "Cerrar",
      delete: "Eliminar",
      edit: "Editar",
      duplicate: "Duplicar",
      search: "Buscar",
      copy: "Copiar",
      downloadPdf: "Descargar PDF",
      copied: "Copiado",
      loading: "Cargando...",
      generate: "Generar",
      upgradeNow: "Actualizar ahora",
      language: "Idioma",
      english: "English",
      spanish: "Español",
      french: "Français",
      swahili: "Swahili",
      luganda: "Luganda"
    },
    forge: {
      title: "Sermon Forge",
      subtitle: "Crea sermones completos y pulidos con IA teológica avanzada.",
      sermonTitle: "Título del sermón",
      scriptureReference: "Referencia bíblica",
      angleFocus: "Ángulo / enfoque del sermón",
      audience: "Audiencia",
      forgeSermon: "Crear sermón",
      forging: "Creando...",
      copySermon: "Copiar sermón",
      provideTitleOrScripture: "Por favor proporcione un título o una referencia bíblica.",
      incompleteSermon: "El sermón aún no está completo. Espere a que termine la generación.",
      generatedLabel: "Sermón generado"
    },
    audience: {
      general: "Congregación general",
      youth: "Ministerio juvenil",
      newBelievers: "Nuevos creyentes",
      men: "Ministerio de hombres",
      women: "Ministerio de mujeres",
      leadership: "Liderazgo / Ancianos",
      outreach: "Alcance / Evangelismo"
    },
    mode: {
      fast: "Modo rápido",
      deep: "Modo profundo"
    },
    upgrade: {
      title: "Actualiza tu plan",
      subtitle: "El modo profundo no está disponible en el plan gratuito.",
      message: "Actualiza tu plan para desbloquear el Modo Profundo en Sermon Forge.",
      modalMessage: "El modo profundo está disponible en los planes pagos. Actualiza para desbloquear una generación de sermones más rica y herramientas avanzadas.",
      checkoutPlaceholder: "Stripe checkout se conectará después"
    },
    library: {
      title: "Mis sermones",
      empty: "Aún no hay sermones guardados."
    },
    errors: {
      generic: "Ocurrió un error.",
      failedToFetch: "No se pudo conectar",
      popupBlocked: "La ventana emergente fue bloqueada. Permita ventanas emergentes e inténtelo de nuevo.",
      copyNotSupported: "La copia no es compatible con este navegador",
      copyFailed: "La copia falló"
    }
  },

  fr: {
    common: {
      save: "Enregistrer",
      cancel: "Annuler",
      close: "Fermer",
      delete: "Supprimer",
      edit: "Modifier",
      duplicate: "Dupliquer",
      search: "Rechercher",
      copy: "Copier",
      downloadPdf: "Télécharger le PDF",
      copied: "Copié",
      loading: "Chargement...",
      generate: "Générer",
      upgradeNow: "Mettre à niveau",
      language: "Langue",
      english: "English",
      spanish: "Español",
      french: "Français",
      swahili: "Swahili",
      luganda: "Luganda"
    },
    forge: {
      title: "Sermon Forge",
      subtitle: "Créez des sermons complets et soignés grâce à une IA théologique avancée.",
      sermonTitle: "Titre du sermon",
      scriptureReference: "Référence biblique",
      angleFocus: "Angle / orientation du sermon",
      audience: "Audience",
      forgeSermon: "Créer le sermon",
      forging: "Création...",
      copySermon: "Copier le sermon",
      provideTitleOrScripture: "Veuillez fournir un titre ou une référence biblique.",
      incompleteSermon: "Le sermon n'est pas encore complet. Veuillez attendre la fin de la génération.",
      generatedLabel: "Sermon généré"
    },
    audience: {
      general: "Assemblée générale",
      youth: "Ministère des jeunes",
      newBelievers: "Nouveaux croyants",
      men: "Ministère des hommes",
      women: "Ministère des femmes",
      leadership: "Leadership / Anciens",
      outreach: "Évangélisation"
    },
    mode: {
      fast: "Mode rapide",
      deep: "Mode approfondi"
    },
    upgrade: {
      title: "Mettez à niveau votre plan",
      subtitle: "Le mode approfondi n'est pas disponible sur le plan gratuit.",
      message: "Mettez à niveau votre plan pour débloquer le mode approfondi dans Sermon Forge.",
      modalMessage: "Le mode approfondi est disponible sur les plans payants. Mettez à niveau pour débloquer une génération de sermons plus riche et des outils avancés.",
      checkoutPlaceholder: "Le paiement Stripe sera connecté ensuite"
    },
    library: {
      title: "Mes sermons",
      empty: "Aucun sermon enregistré pour le moment."
    },
    errors: {
      generic: "Une erreur s'est produite.",
      failedToFetch: "Échec de récupération",
      popupBlocked: "La fenêtre contextuelle a été bloquée. Autorisez les fenêtres contextuelles et réessayez.",
      copyNotSupported: "La copie n'est pas prise en charge dans ce navigateur",
      copyFailed: "La copie a échoué"
    }
  }
};

function getNestedTranslation(obj, path) {
  return path.split(".").reduce(function(acc, key) {
    return acc && acc[key] !== undefined ? acc[key] : undefined;
  }, obj);
}

function createTranslator(language) {
  return function t(path) {
    var selected = TRANSLATIONS[language] || TRANSLATIONS.en;
    var value = getNestedTranslation(selected, path);
    if (value !== undefined) return value;
    var fallback = getNestedTranslation(TRANSLATIONS.en, path);
    if (fallback !== undefined) return fallback;
    return path;
  };
}

function useEnterKey(handler, deps) {
  useEffect(function() {
    function onKey(e) {
      if (e.key === "Enter" && !e.shiftKey) {
        handler();
      }
    }
    window.addEventListener("keydown", onKey);
    return function() { window.removeEventListener("keydown", onKey); };
  }, deps);
}

function pingAPIs() {
  var isLocal =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1" ||
    window.location.hostname === "0.0.0.0";

  var base = isLocal
    ? "https://sermoncraft-pro.vercel.app"
    : "";

  fetch(base + "/api/ping").catch(function() {});
  fetch(base + "/api/forge-json", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt: "ping", sys: "ping", mode: "fast" })
  }).catch(function() {});
}

function cleanAIText(text) {
  if (!text) return "";
  return text
    .replace(/^#{1,6}\s*/gm, "")
    .replace(/\*\*\*([^*]+)\*\*\*/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/\*/g, "")
    .replace(/\s*(\d+)\s*\.\s*/g, "$1. ")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

// ─── CONSTANTS ───────────────────────────────────────────────────────────────

// Inject Google Fonts + global mobile CSS
(function() {
  if (!document.getElementById("scp-fonts")) {
    var link = document.createElement("link");
    link.id = "scp-fonts";
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;0,900;1,400;1,700&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap";
    document.head.appendChild(link);
  }
  if (!document.getElementById("scp-mobile-css")) {
    var style = document.createElement("style");
    style.id = "scp-mobile-css";
    style.textContent = [
      "* { box-sizing: border-box; }",
      "input, textarea, select { font-size: 16px !important; }", // prevent iOS zoom
      "@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }",
      ".scp-grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }",
      ".scp-grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }",
      "@media (max-width: 600px) {",
      "  .scp-grid-4 { grid-template-columns: repeat(2, 1fr) !important; }",
      "  .scp-grid-3 { grid-template-columns: 1fr 1fr !important; }",
      "  .scp-hide-mobile { display: none !important; }",
      "  .scp-stack { flex-direction: column !important; }",
      "  .scp-full { width: 100% !important; }",
      "}",
    ].join("\n");
    document.head.appendChild(style);
  }
})();

const FONT_DISPLAY = "'Playfair Display', Georgia, serif";
const FONT_BODY = "'DM Sans', system-ui, sans-serif";

// Light theme — warm cream palette
const GOLD = "#B8860B";
const GOLD_LIGHT = "#D4A017";
const GOLD_PALE = "#F5E6C8";
const GOLD_BORDER = "#E8C87A";
const IVORY = "#FDFAF5";
const CREAM = "#F7F1E8";
const WARM_WHITE = "#FFFEF9";
const STONE = "#8B7355";
const STONE_LIGHT = "#A89070";

const SIDEBAR_BG = "#FAF7F2";
const SIDEBAR_BORDER = "#E8DCC8";
const CHARCOAL = "#2C2416";
const MAIN_BG = "#FDFAF5";
const CARD_BG = "#FFFFFF";
const CARD_BORDER = "#E8DCC8";
const TOPBAR_BG = "#FFFEF9";
const BORDER = "#E8DCC8";
const TEXT_PRIMARY = "#2C2416";
const TEXT_SECONDARY = "#8B7355";
const SHADOW = "0 2px 12px rgba(44,36,22,0.08)";

const PASTOR_NAV = [
  { id: "dashboard", label: "Dashboard", icon: "" },
  { id: "sermon-forge", label: "Sermon Forge", icon: "" },
  { id: "sermon-drop", label: "Sermon Drop", icon: "📥" },
  { id: "ai-pastor", label: "AI Pastor", icon: "" },
  { id: "topic-engine", label: "Topic Engine", icon: "" },
  { id: "word-study", label: "Word Study", icon: "" },
  { id: "illustrations", label: "Illustrations", icon: "" },
  { id: "series-planner", label: "Series Planner", icon: "" },
  { id: "content-multiplier", label: "Content Multiplier", icon: "" },
  { id: "email-devotional", label: "Email Devotional", icon: "" },
  { id: "bible-commentary", label: "Bible Commentary", icon: "" },
  { id: "sermon-calendar", label: "Sermon Calendar", icon: "" },
  { id: "service-order", label: "Service Order", icon: "" },
  { id: "delivery-coach", label: "Delivery Coach", icon: "" },
  { id: "sermon-analytics", label: "Analytics", icon: "" },
  { id: "library", label: "Sermon Archive", icon: "" },
  { id: "congregation", label: "My Congregation", icon: "" },
  { id: "planning-center", label: "Planning Center", icon: "🔗" },
  { id: "team-scheduler", label: "Team Scheduler", icon: "👥" },
  { id: "referrals", label: "Referrals", icon: "" },
  { id: "support", label: "Support", icon: "🎧" },
  { id: "command-center", label: "Command Center", icon: "⚡" },
];

const ADMIN_NAV = [
  { id: "church-overview", label: "Church Overview", icon: "" },
  { id: "pastor-accounts", label: "Pastor Accounts", icon: "" },
  { id: "pastor-performance", label: "Pastor Performance", icon: "" },
  { id: "prayer-requests", label: "Prayer Requests", icon: "" },
  { id: "attendance", label: "Attendance", icon: "" },
  { id: "activity", label: "Activity & Stats", icon: "" },
  { id: "all-sermons", label: "All Sermons", icon: "" },
  { id: "church-settings", label: "Church Settings", icon: "" },
];

const MOBILE_TABS = [
  { id: "dashboard", label: "Home", icon: "⊞" },
  { id: "sermon-forge", label: "Forge", icon: "✍" },
  { id: "sermon-drop", label: "Drop", icon: "📥" },
  { id: "ai-pastor", label: "Poro", icon: "✝" },
  { id: "more", label: "More", icon: "⋯" },
];

const PASTOR_NAV_GROUPS = [
  {
    id: "prepare", label: "Prepare",
    items: ["sermon-forge", "sermon-drop", "topic-engine", "series-planner", "sermon-calendar", "service-order"],
  },
  {
    id: "study", label: "Study",
    items: ["word-study", "bible-commentary", "illustrations"],
  },
  {
    id: "grow", label: "Grow",
    items: ["ai-pastor", "delivery-coach", "sermon-analytics"],
  },
  {
    id: "publish", label: "Publish",
    items: ["content-multiplier", "email-devotional"],
  },
  {
    id: "library", label: "Library",
    items: ["library"],
  },
  {
    id: "church", label: "Church",
    items: ["congregation", "planning-center", "team-scheduler", "referrals"],
  },
  {
    id: "support", label: "Support",
    items: ["support"],
  },
  {
    id: "command-center", label: "Command Center",
    items: ["command-center"],
  },
];

const ADMIN_NAV_GROUPS = [
  {
    id: "overview", label: "Overview",
    items: ["church-overview", "pastor-accounts", "pastor-performance"],
  },
  {
    id: "congregation", label: "Congregation",
    items: ["prayer-requests", "attendance"],
  },
  {
    id: "reports", label: "Reports",
    items: ["activity", "all-sermons"],
  },
  {
    id: "settings", label: "Settings",
    items: ["church-settings"],
  },
];

function GroupedNav({ groups, nav, activeScreen, onNavigate }) {
  // Auto-open the group containing the active screen
  var defaultOpen = {};
  groups.forEach(function(g) {
    if (g.items.includes(activeScreen)) defaultOpen[g.id] = true;
    else defaultOpen[g.id] = false;
  });

  const [openGroups, setOpenGroups] = useState(defaultOpen);

  useEffect(function() {
    groups.forEach(function(g) {
      if (g.items.includes(activeScreen)) {
        setOpenGroups(function(prev) {
          if (prev[g.id]) return prev;
          return Object.assign({}, prev, { [g.id]: true });
        });
      }
    });
  }, [activeScreen]);

  function toggleGroup(id) {
    setOpenGroups(function(prev) { return Object.assign({}, prev, { [id]: !prev[id] }); });
  }

  return (
    <div style={{ padding: "8px 0" }}>
      {groups.map(function(group) {
        var groupItems = group.items.map(function(id) { return nav.find(function(n) { return n.id === id; }); }).filter(Boolean);
        var isOpen = openGroups[group.id];
        var hasActive = group.items.includes(activeScreen);
        return (
          <div key={group.id}>
            {/* Group header */}
            <div
              onClick={function() { toggleGroup(group.id); }}
              style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "6px 16px", cursor: "pointer",
                userSelect: "none",
              }}
            >
              <span style={{
                fontSize: 11, fontWeight: 700, color: hasActive ? GOLD : STONE_LIGHT,
                textTransform: "uppercase", letterSpacing: "0.1em",
              }}>
                {group.label}
              </span>
              <span style={{ fontSize: 10, color: hasActive ? GOLD : STONE_LIGHT, transition: "transform 0.2s", display: "inline-block", transform: isOpen ? "rotate(90deg)" : "rotate(0deg)" }}>›</span>
            </div>

            {/* Group items */}
            {isOpen && (
              <div style={{ marginBottom: 4 }}>
                {groupItems.map(function(item) {
                  return <NavItem key={item.id} item={item} active={activeScreen === item.id} onClick={onNavigate} />;
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(function() {
    function handleResize() { setIsMobile(window.innerWidth < 768); }
    window.addEventListener("resize", handleResize);
    return function() { window.removeEventListener("resize", handleResize); };
  }, []);
  return isMobile;
}

// ─── SUNDAY COUNTDOWN HOOK ────────────────────────────────────────────────────

function getNextSunday() {
  var now = new Date();
  var day = now.getDay(); // 0 = Sunday
  var daysUntil = day === 0 ? 7 : 7 - day;
  var next = new Date(now);
  next.setDate(now.getDate() + daysUntil);
  next.setHours(0, 0, 0, 0);
  return next;
}

function useSundayCountdown() {
  var stored = localStorage.getItem("scp_sermon_date");
  var storedTitle = localStorage.getItem("scp_sermon_title") || "";
  var storedScripture = localStorage.getItem("scp_sermon_scripture") || "";

  var defaultDate = stored ? new Date(stored) : getNextSunday();

  const [sermonDate, setSermonDateRaw] = useState(defaultDate);
  const [sermonTitle, setSermonTitleRaw] = useState(storedTitle);
  const [sermonScripture, setSermonScriptureRaw] = useState(storedScripture);
  const [now, setNow] = useState(new Date());

  useEffect(function() {
    var interval = setInterval(function() { setNow(new Date()); }, 60000);
    return function() { clearInterval(interval); };
  }, []);

  function setSermonDate(date) {
    localStorage.setItem("scp_sermon_date", date.toISOString());
    setSermonDateRaw(date);
  }

  function setSermonTitle(title) {
    localStorage.setItem("scp_sermon_title", title);
    setSermonTitleRaw(title);
  }

  function setSermonScripture(scripture) {
    localStorage.setItem("scp_sermon_scripture", scripture);
    setSermonScriptureRaw(scripture);
  }

  function resetToNextSunday() {
    var next = getNextSunday();
    localStorage.setItem("scp_sermon_date", next.toISOString());
    setSermonDateRaw(next);
  }

  var today = new Date(now);
  today.setHours(0, 0, 0, 0);
  var target = new Date(sermonDate);
  target.setHours(0, 0, 0, 0);
  var msLeft = target - today;
  var daysLeft = Math.max(0, Math.ceil(msLeft / (1000 * 60 * 60 * 24)));

  // Week progress: Monday = 0%, Sunday = 100%
  var weekDay = now.getDay(); // 0=Sun, 1=Mon...6=Sat
  var daysSinceMonday = weekDay === 0 ? 6 : weekDay - 1;
  var weekProgress = Math.round((daysSinceMonday / 6) * 100);

  var urgencyColor = daysLeft <= 1 ? "#C0392B" : daysLeft <= 3 ? "#E67E22" : GOLD;

  return {
    sermonDate, setSermonDate, resetToNextSunday,
    sermonTitle, setSermonTitle,
    sermonScripture, setSermonScripture,
    daysLeft, weekProgress, urgencyColor,
  };
}

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

var CURRENT_USER = {
  id: "",
  name: "Pastor",
  email: "",
  role: "Senior Pastor",
  church: SEED_CHURCH.name,
  branch: "Main Campus",
  isAdmin: true,
  plan: "free",
};

// ─── API HELPERS ──────────────────────────────────────────────────────────────

async function callSermonAPI(prompt, systemPrompt = "", useDeep = false, onChunk = null, signal = null) {
  const currentUrl = window.location.href;
  const isLocal =
    currentUrl.includes("localhost") ||
    currentUrl.includes("127.0.0.1") ||
    currentUrl.includes("0.0.0.0");

  const url = isLocal
    ? "https://sermoncraft-pro.vercel.app/api/sermon"
    : "/api/sermon";

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      prompt: prompt,
      sys: systemPrompt,
      deep: useDeep,
    }),
    signal: signal || undefined,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error("API error " + response.status + ": " + errorText.slice(0, 200));
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let accumulated = "";
  let buffer = "";

  while (true) {
    if (signal && signal.aborted) break;
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop(); // keep incomplete line in buffer

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed === "data: [DONE]") continue;
      if (trimmed.startsWith("data: ")) {
        try {
          const parsed = JSON.parse(trimmed.slice(6));
          if (parsed.text) {
            accumulated += parsed.text;
            if (onChunk) onChunk(accumulated);
          }
        } catch (e) {
          // not JSON — skip
        }
      }
    }
  }

  return accumulated;
}

async function callJSONAPI({ prompt, sys, mode = "fast" }) {
  const url =
    window.location.hostname === "localhost"
      ? "https://sermoncraft-pro.vercel.app/api/forge-json"
      : "/api/forge-json";

  let response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, sys, mode }),
    });
  } catch (err) {
    console.error("callJSONAPI network failure:", err);
    throw new Error("Failed to fetch");
  }

  const rawText = await response.text().catch(function() { return ""; });

  if (!response.ok) {
    throw new Error("API error " + response.status + ": " + rawText);
  }

  let data;
  try {
    data = rawText ? JSON.parse(rawText) : null;
  } catch (err) {
    console.error("callJSONAPI invalid JSON:", rawText);
    throw new Error("Invalid JSON response from /api/forge-json");
  }

  if (!data || data.result === undefined) {
    console.error("callJSONAPI missing result field:", data);
    throw new Error("Invalid API response: missing result field.");
  }

  return data.result;
}

// ─── STYLE CONSTANTS ─────────────────────────────────────────────────────────

const styles = {
  page: {
    display: "flex",
    height: "100vh",
    fontFamily: FONT_BODY,
    backgroundColor: MAIN_BG,
    color: TEXT_PRIMARY,
    overflow: "hidden",
  },
  sidebar: {
    width: 280,
    backgroundColor: SIDEBAR_BG,
    borderRight: "1px solid " + SIDEBAR_BORDER,
    display: "flex",
    flexDirection: "column",
    overflowY: "auto",
    flexShrink: 0,
  },
  sidebarHeader: {
    padding: "24px 20px 20px",
    borderBottom: "1px solid " + SIDEBAR_BORDER,
  },
  logoMark: { fontSize: 24, marginBottom: 10, color: GOLD },
  churchName: {
    fontSize: 12,
    fontWeight: 600,
    color: TEXT_PRIMARY,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    lineHeight: 1.3,
    fontFamily: FONT_BODY,
  },
  navSection: { padding: "12px 10px 8px" },
  navLabel: {
    fontSize: 10,
    fontWeight: 600,
    letterSpacing: "0.1em",
    color: STONE_LIGHT,
    textTransform: "uppercase",
    padding: "0 8px 8px",
    fontFamily: FONT_BODY,
  },
  navItemBase: function(active) {
    return {
      display: "flex",
      alignItems: "center",
      gap: 10,
      padding: "9px 14px",
      borderRadius: 6,
      cursor: "pointer",
      fontSize: 13,
      fontFamily: FONT_BODY,
      fontWeight: active ? 600 : 400,
      color: active ? GOLD : TEXT_PRIMARY,
      backgroundColor: active ? GOLD_PALE : "transparent",
      borderLeft: "2px solid " + (active ? GOLD : "transparent"),
      transition: "all 0.15s ease",
      marginBottom: 1,
    };
  },
  navIcon: { fontSize: 14, width: 20, textAlign: "center" },
  mainContent: { flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", backgroundColor: MAIN_BG },
  topBar: {
    backgroundColor: TOPBAR_BG,
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
    color: TEXT_PRIMARY,
    letterSpacing: "0.01em",
    fontFamily: FONT_DISPLAY,
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
    fontFamily: FONT_BODY,
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: "50%",
    backgroundColor: GOLD,
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 12,
    fontWeight: 700,
    flexShrink: 0,
    fontFamily: FONT_BODY,
  },
  scrollArea: { flex: 1, overflowY: "auto", padding: "24px 28px" },
  card: {
    backgroundColor: CARD_BG,
    border: "1px solid " + CARD_BORDER,
    borderRadius: 12,
    padding: "22px 26px",
    boxShadow: SHADOW,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: 700,
    color: TEXT_PRIMARY,
    marginBottom: 4,
    fontFamily: FONT_DISPLAY,
  },
  cardMeta: { fontSize: 12, color: TEXT_SECONDARY, marginBottom: 16, fontFamily: FONT_BODY },
  grid2: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20, marginBottom: 24 },
  statCard: {
    backgroundColor: CARD_BG,
    border: "1px solid " + CARD_BORDER,
    borderRadius: 12,
    padding: "18px 20px",
    boxShadow: SHADOW,
  },
  statValue: { fontSize: 28, fontWeight: 700, color: GOLD, lineHeight: 1, marginBottom: 4, fontFamily: FONT_DISPLAY },
  statLabel: { fontSize: 11, color: TEXT_SECONDARY, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 500, fontFamily: FONT_BODY },
  inputGroup: { marginBottom: 16 },
  label: {
    display: "block",
    fontSize: 11,
    fontWeight: 600,
    color: TEXT_SECONDARY,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    marginBottom: 6,
    fontFamily: FONT_BODY,
  },
  input: {
    width: "100%",
    padding: "10px 14px",
    border: "1px solid " + BORDER,
    borderRadius: 8,
    backgroundColor: IVORY,
    fontSize: 14,
    color: TEXT_PRIMARY,
    fontFamily: FONT_BODY,
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
    color: TEXT_PRIMARY,
    fontFamily: FONT_BODY,
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
    color: TEXT_PRIMARY,
    fontFamily: FONT_BODY,
    outline: "none",
    boxSizing: "border-box",
    cursor: "pointer",
  },
  btn: {
    padding: "10px 22px",
    borderRadius: 8,
    border: "none",
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 600,
    fontFamily: FONT_BODY,
    letterSpacing: "0.04em",
    transition: "all 0.15s ease",
  },
  btnGold: { backgroundColor: GOLD, color: "#fff", boxShadow: "0 2px 8px rgba(184,134,11,0.25)" },
  btnOutline: { backgroundColor: "transparent", color: GOLD, border: "1.5px solid " + GOLD },
  btnGhost: { backgroundColor: CREAM, color: STONE, border: "1px solid " + BORDER },
  outputPanel: {
    backgroundColor: CREAM,
    border: "1px solid " + BORDER,
    borderRadius: 10,
    padding: "20px 22px",
    fontSize: 15,
    lineHeight: 1.85,
    color: TEXT_PRIMARY,
    whiteSpace: "pre-wrap",
    fontFamily: FONT_BODY,
    minHeight: 120,
    boxShadow: SHADOW,
  },
  errorPanel: {
    backgroundColor: "#FFF5F5",
    border: "1px solid #FFC5C5",
    borderRadius: 10,
    padding: "14px 18px",
    fontSize: 13,
    color: "#C0392B",
    marginTop: 16,
    fontFamily: FONT_BODY,
  },
  tag: {
    display: "inline-block",
    padding: "2px 10px",
    borderRadius: 12,
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: "0.04em",
    textTransform: "uppercase",
    fontFamily: FONT_BODY,
  },
  tagGold: { backgroundColor: GOLD_PALE, color: GOLD },
  tagGreen: { backgroundColor: "#EAFAF1", color: "#27AE60" },
  tagGray: { backgroundColor: CREAM, color: STONE, border: "1px solid " + BORDER },
  table: { width: "100%", borderCollapse: "collapse", fontSize: 14, fontFamily: FONT_BODY },
  th: {
    padding: "10px 14px",
    textAlign: "left",
    fontSize: 11,
    fontWeight: 600,
    color: TEXT_SECONDARY,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    borderBottom: "2px solid " + BORDER,
    fontFamily: FONT_BODY,
  },
  td: { padding: "12px 14px", borderBottom: "1px solid " + BORDER, verticalAlign: "top", color: TEXT_PRIMARY, fontFamily: FONT_BODY },
  sectionHeader: { fontSize: 22, fontWeight: 700, color: TEXT_PRIMARY, marginBottom: 6, letterSpacing: "0.01em", fontFamily: FONT_DISPLAY },
  sectionSub: { fontSize: 14, color: TEXT_SECONDARY, marginBottom: 24, fontFamily: FONT_BODY },
  goldAccent: { display: "inline-block", width: 32, height: 3, backgroundColor: GOLD, borderRadius: 2, marginBottom: 16 },
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


// Compact usage counter shown below generate buttons
function ToolUsageBadge({ toolKey, usedKey }) {
  var plan = CURRENT_USER.plan || "free";
  var limits = getPlanLimits(plan);
  var limit = limits[toolKey];
  if (!limit || limit >= 999999) return null;
  var usage = loadUsage();
  var used = usage[usedKey] || 0;
  var remaining = Math.max(0, limit - used);
  var pct = Math.min(100, Math.round((used / limit) * 100));
  var color = pct >= 90 ? "#C0392B" : pct >= 70 ? "#E67E22" : "#8B7355";
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginLeft: 12 }}>
      <div style={{ width: 60, height: 4, background: "#E8DCC8", borderRadius: 2, overflow: "hidden" }}>
        <div style={{ height: "100%", width: pct + "%", background: color, borderRadius: 2 }} />
      </div>
      <span style={{ fontSize: 11, color: color, fontFamily: "DM Sans, sans-serif", fontWeight: 600, whiteSpace: "nowrap" }}>
        {remaining} left
      </span>
    </div>
  );
}

function PlanGate({ feature, children, onUpgrade }) {
  var plan = CURRENT_USER.plan || "free";
  var allowed = canAccess(plan, feature);
  if (allowed) return children;
  var featureLabels = {
    wordStudy: "Word Study", illustrations: "Illustrations", seriesPlanner: "Series Planner",
    contentMultiplier: "Content Multiplier", emailDevotional: "Email Devotional",
    bibleCommentary: "Bible Commentary", serviceOrderBuilder: "Service Order Builder",
    aiPastor: "AI Pastor Poro", deliveryCoach: "Delivery Coach",
    congregationIntelligence: "Congregation Intelligence", planningCenterIntegration: "Planning Center",
    teamScheduler: "Team Scheduler", saveLibrary: "Sermon Library",
    shareSermon: "Sermon Sharing", sermonAnalytics: "Analytics",
  };
  var planRequired = {
    wordStudy: "Student", illustrations: "Solo", bibleCommentary: "Student", aiPastor: "Student", voiceProfile: "Student",
    seriesPlanner: "Pastor", contentMultiplier: "Pastor", emailDevotional: "Pastor", serviceOrderBuilder: "Pastor", congregationIntelligence: "Pastor", teamScheduler: "Pastor",
    deliveryCoach: "Church", planningCenterIntegration: "Church", attendanceTracking: "Church", sermonAnalytics: "Pastor",
    multiCampus: "Bible College", customBranding: "Bible College",
  };
  return (
    <div style={{ textAlign: "center", padding: "48px 24px", background: IVORY, border: "1px solid " + BORDER, borderRadius: 12 }}>
      <div style={{ fontSize: 32, marginBottom: 12 }}>🔒</div>
      <div style={{ fontSize: 16, fontWeight: 700, color: CHARCOAL, fontFamily: FONT_DISPLAY, marginBottom: 8 }}>{featureLabels[feature] || feature} requires {planRequired[feature] || "a paid plan"}</div>
      <div style={{ fontSize: 13, color: STONE_LIGHT, marginBottom: 20, fontFamily: FONT_BODY }}>Upgrade your plan to unlock this feature.</div>
      <button onClick={onUpgrade} style={{ padding: "10px 24px", background: GOLD, color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: FONT_BODY }}>Upgrade Now</button>
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

  var hoverStyle = {};
  if (hovered && !disabled) {
    if (variant === "gold") hoverStyle = { backgroundColor: GOLD_LIGHT };
    if (variant === "outline") hoverStyle = { backgroundColor: GOLD_PALE };
    if (variant === "ghost") hoverStyle = { borderColor: GOLD, color: CHARCOAL };
  }

  const computedStyle = Object.assign(
    {},
    styles.btn,
    variantStyle,
    { opacity: disabled ? 0.45 : 1, cursor: disabled ? "not-allowed" : "pointer" },
    hoverStyle,
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

function StatCard({ value, label }) {
  return (
    <div style={{
      backgroundColor: CARD_BG,
      border: "1px solid " + CARD_BORDER,
      borderRadius: 10,
      padding: "16px 20px",
      boxShadow: SHADOW,
    }}>
      <div style={{ fontSize: 26, fontWeight: 700, color: GOLD, lineHeight: 1, marginBottom: 4, fontFamily: FONT_DISPLAY }}>{value}</div>
      <div style={{ fontSize: 11, color: TEXT_SECONDARY, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 500, fontFamily: FONT_BODY }}>{label}</div>
    </div>
  );
}

function OutputPanel({ text, loading, error, onCopy, onSave }) {
  const [copyStatus, setCopyStatus] = useState("");
  const [availabilityModal, setAvailabilityModal] = useState(null);
  const [blockDate, setBlockDate] = useState("");
  const [saveStatus, setSaveStatus] = useState("");

  const cleanedText = String(text || "")
    .replace(/\*\*\*/g, "")
    .replace(/\*\*/g, "")
    .replace(/\*/g, "");

  if (error) {
    return <div style={styles.errorPanel}>{"\u26A0 "}{error}</div>;
  }

  if (!cleanedText && !loading) return null;

  function handleCopy() {
    if (onCopy) { onCopy(); } else if (navigator.clipboard) { navigator.clipboard.writeText(cleanedText); }
    setCopyStatus("Copied ✓");
    setTimeout(function() { setCopyStatus(""); }, 2000);
  }

  function handleSave() {
    if (onSave) {
      onSave();
      setSaveStatus("Saved ✓");
      setTimeout(function() { setSaveStatus(""); }, 2000);
    }
  }

  return (
    <div>
      <div style={styles.outputPanel}>
        {loading && !cleanedText
          ? <span style={{ color: STONE_LIGHT, fontStyle: "italic" }}>Generating...</span>
          : cleanedText
        }
      </div>
      {cleanedText && (
        <div style={{ display: "inline-flex", gap: 4, backgroundColor: CARD_BG, borderRadius: 8, padding: 4, border: "1px solid " + CARD_BORDER, marginTop: 10 }}>
          <button onClick={handleCopy} style={{ padding: "6px 16px", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 600, letterSpacing: "0.04em", fontFamily: FONT_BODY, backgroundColor: copyStatus ? GOLD : "transparent", color: copyStatus ? "#0E0B07" : TEXT_SECONDARY, transition: "all 0.15s" }}>
            {copyStatus || "Copy"}
          </button>
          {onSave && (
            <button onClick={handleSave} style={{ padding: "6px 16px", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 600, letterSpacing: "0.04em", fontFamily: FONT_BODY, backgroundColor: saveStatus ? GOLD : "transparent", color: saveStatus ? "#0E0B07" : TEXT_SECONDARY, transition: "all 0.15s" }}>
              {saveStatus || "Save to Library"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function safeParseJSON(raw) {
  if (!raw) return null;
  if (typeof raw === "object") return raw;
  try { return JSON.parse(raw); } catch (_e) { return null; }
}

// ─── VOICE PROFILE ────────────────────────────────────────────────────────────

const DOCTRINE_FRAMING = {
  "Pentecostal / Charismatic": "You operate within a Pentecostal/Charismatic theological framework. Emphasize the work of the Holy Spirit, spiritual gifts, revival, prophetic ministry, and the power of God moving today.",
  "Non-denominational": "You operate within a non-denominational evangelical framework. Emphasize practical Bible application, cultural relevance, and accessibility for all backgrounds.",
  "Baptist": "You operate within a Baptist theological framework. Emphasize the authority of Scripture, salvation by grace through faith, the local church, and expository preaching.",
  "Reformed / Calvinist": "You operate within a Reformed/Calvinist theological framework. Emphasize the sovereignty of God, total grace, covenant theology, and deep biblical exposition.",
  "Arminian / Wesleyan": "You operate within an Arminian/Wesleyan theological framework. Emphasize free will, the possibility of sanctification, God's universal love, and holiness of heart and life.",
  "Catholic": "You operate within a Catholic theological framework. Emphasize Sacred Scripture and Tradition, the Magisterium, sacramental life, and the communion of the Church.",
};

const DOCTRINE_OPTIONS = [
  "Pentecostal / Charismatic",
  "Non-denominational",
  "Baptist",
  "Reformed / Calvinist",
  "Arminian / Wesleyan",
  "Catholic",
];

const PREACHING_STYLES = ["Expository", "Topical", "Narrative", "Evangelistic"];
const TONES = ["Passionate / Spirit-led", "Scholarly / Academic", "Conversational / Warm", "Prophetic / Bold"];
const CONGREGATION_TYPES = ["Urban multicultural", "Suburban family", "Rural / small town", "Youth-heavy", "International / diverse"];
const LENGTH_PREFS = ["Short & punchy (20–30 min)", "Standard (40–50 min)", "Long & deep (60+ min)"];

function buildVoiceContext(profile) {
  if (!profile || !profile.confirmed) return "";
  var lines = ["PASTOR VOICE & DOCTRINE CONTEXT — apply this to all generated content:"];
  if (profile.doctrine && DOCTRINE_FRAMING[profile.doctrine]) {
    lines.push(DOCTRINE_FRAMING[profile.doctrine]);
  }
  if (profile.style) lines.push("Preaching style: " + profile.style + ".");
  if (profile.tone) lines.push("Tone: " + profile.tone + ".");
  if (profile.congregation) lines.push("Congregation: " + profile.congregation + ".");
  if (profile.length) lines.push("Sermon length preference: " + profile.length + ".");
  if (profile.phrases && profile.phrases.trim()) lines.push("Signature phrases or notes: " + profile.phrases.trim() + ".");
  return lines.join(" ");
}

function VoiceProfileModal({ onConfirm, onSkip, existing }) {
  const [doctrine, setDoctrine] = useState(existing?.doctrine || "");
  const [style, setStyle] = useState(existing?.style || "");
  const [tone, setTone] = useState(existing?.tone || "");
  const [congregation, setCongregation] = useState(existing?.congregation || "");
  const [length, setLength] = useState(existing?.length || "");
  const [phrases, setPhrases] = useState(existing?.phrases || "");

  function handleConfirm() {
    if (!doctrine) return;
    onConfirm({ doctrine, style, tone, congregation, length, phrases, confirmed: true });
  }

  function ChipGroup({ label, options, value, onChange }) {
    return (
      <div style={styles.inputGroup}>
        <label style={styles.label}>{label}</label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {options.map(function(opt) {
            var active = value === opt;
            return (
              <button
                key={opt}
                onClick={function() { onChange(active ? "" : opt); }}
                style={{
                  padding: "6px 14px", borderRadius: 20, border: "1.5px solid",
                  borderColor: active ? GOLD : BORDER,
                  background: active ? GOLD_PALE : IVORY,
                  color: active ? GOLD : STONE,
                  fontWeight: active ? 700 : 400,
                  fontSize: 13, cursor: "pointer", fontFamily: "'Georgia', serif",
                  transition: "all 0.15s",
                }}
              >
                {opt}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: 16,
    }}>
      <div style={{
        background: WARM_WHITE, borderRadius: 16, padding: "32px 28px",
        width: "100%", maxWidth: 580, boxShadow: "0 8px 40px rgba(0,0,0,0.25)",
        maxHeight: "90vh", overflowY: "auto", fontFamily: "'Georgia', serif",
      }}>
        <div style={{ fontWeight: 700, fontSize: 20, color: CHARCOAL, marginBottom: 4 }}>
          Pastor Voice Profile
        </div>
        <div style={{ fontSize: 13, color: STONE, marginBottom: 24, lineHeight: 1.6 }}>
          Tell us about your preaching style so every generation sounds like you.
        </div>

        <ChipGroup
          label={"Doctrine Mode *"}
          options={DOCTRINE_OPTIONS}
          value={doctrine}
          onChange={setDoctrine}
        />

        <ChipGroup label="Preaching Style" options={PREACHING_STYLES} value={style} onChange={setStyle} />
        <ChipGroup label="Tone" options={TONES} value={tone} onChange={setTone} />
        <ChipGroup label="Congregation Type" options={CONGREGATION_TYPES} value={congregation} onChange={setCongregation} />
        <ChipGroup label="Sermon Length" options={LENGTH_PREFS} value={length} onChange={setLength} />

        <div style={styles.inputGroup}>
          <label style={styles.label}>Signature Phrases or Things to Avoid (optional)</label>
          <textarea
            style={styles.textarea}
            value={phrases}
            onChange={function(e) { setPhrases(e.target.value); }}
            placeholder='e.g. "I always say the Word works" or "avoid academic jargon"'
            rows={2}
          />
        </div>

        {!doctrine && (
          <div style={{ fontSize: 12, color: "#C0392B", marginBottom: 12 }}>
            Please select a doctrine mode to continue.
          </div>
        )}

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
          <button
            onClick={onSkip}
            style={{
              padding: "10px 18px", borderRadius: 8, border: "1px solid " + BORDER,
              background: "transparent", color: STONE, cursor: "pointer",
              fontSize: 13, fontFamily: "'Georgia', serif", fontWeight: 700,
            }}
          >
            Skip for now
          </button>
          <button
            onClick={handleConfirm}
            disabled={!doctrine}
            style={{
              padding: "10px 20px", borderRadius: 8, border: "none",
              background: doctrine ? GOLD : BORDER,
              color: "#fff", cursor: doctrine ? "pointer" : "not-allowed",
              fontSize: 13, fontFamily: "'Georgia', serif", fontWeight: 700,
            }}
          >
            Apply Voice Profile
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── UPGRADE MODAL ────────────────────────────────────────────────────────────

function StripeEmbeddedCheckout({ clientSecret, planName, billing, onClose, onSuccess }) {
  var containerRef = useRef(null);
  var [ready, setReady] = useState(false);
  var [loadError, setLoadError] = useState("");

  useEffect(function() {
    if (!clientSecret || !containerRef.current) return;
    var checkout = null;
    var script = document.createElement("script");
    script.src = "https://js.stripe.com/v3/";
    script.onload = function() {
      var stripe = window.Stripe("pk_test_51TF9IDBj8tFLJYUndl4BKsAb42s5JEQfJ7JHUvxxCqU1ckubQ7tzPPCK8SkL9o80u03lX63jUwy6YOrHn6quk00a00ZSjqy4VW");
      stripe.initEmbeddedCheckout({ clientSecret: clientSecret }).then(function(c) {
        checkout = c;
        if (containerRef.current) {
          c.mount(containerRef.current);
          setReady(true);
        }
      }).catch(function(e) {
        setLoadError("Could not load checkout. Please try again.");
      });
    };
    script.onerror = function() { setLoadError("Could not load Stripe. Please check your connection."); };
    document.head.appendChild(script);
    return function() { if (checkout) checkout.destroy(); };
  }, [clientSecret]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: 14, borderBottom: "1px solid " + BORDER }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700, color: CHARCOAL, fontFamily: FONT_DISPLAY }}>{planName}</div>
          <div style={{ fontSize: 13, color: STONE_LIGHT, fontFamily: FONT_BODY, marginTop: 2 }}>{billing === "annual" ? "Billed annually (20% off)" : "Billed monthly"}</div>
        </div>
        <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: STONE, lineHeight: 1 }}>×</button>
      </div>
      {loadError && <div style={{ color: "#DC2626", fontSize: 13, textAlign: "center", padding: "12px", background: "#FEF2F2", borderRadius: 8 }}>{loadError}</div>}
      {!ready && !loadError && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 0", gap: 12 }}>
          <div style={{ width: 20, height: 20, border: "2px solid " + BORDER, borderTopColor: GOLD, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
          <span style={{ fontSize: 13, color: STONE_LIGHT, fontFamily: FONT_BODY }}>Loading secure checkout...</span>
        </div>
      )}
      <div ref={containerRef} style={{ minHeight: ready ? "auto" : 0 }} />
      <div style={{ textAlign: "center", fontSize: 11, color: STONE_LIGHT, fontFamily: FONT_BODY }}>
        🔒 Payments are processed securely by Stripe. Your card details never touch our servers.
      </div>
    </div>
  );
}


function UpgradeModal({ onClose, user, profile }) {
  const [billing, setBilling] = useState("monthly");
  const [trialDays, setTrialDays] = useState(7);
  const [showTrial, setShowTrial] = useState(false);
  const [trialPlan, setTrialPlan] = useState("pro");
  const [loading, setLoading] = useState(null);
  const [error, setError] = useState("");
  const [embeddedSecret, setEmbeddedSecret] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);

  const PLANS = [
    {
      key: "student",
      name: "Student",
      monthlyPrice: "$9",
      annualMonthly: "$7.20",
      annualPrice: "$86.40",
      description: "For Bible college students learning to preach.",
      features: [
        "15 Sermon Forge/mo (5 deep)",
        "10 Topic Engine ideas/mo",
        "10 Word Study lookups/mo",
        "5 Bible Commentary/mo",
        "Sermon Drop",
        "AI Pastor Poro",
        "Library, PDF & DOCX export",
      ],
      color: "#0F172A",
    },
    {
      key: "solo",
      name: "Solo",
      monthlyPrice: "$19",
      annualMonthly: "$15.20",
      annualPrice: "$182.40",
      description: "For bivocational pastors and church planters.",
      features: [
        "30 Sermon Forge/mo (10 deep)",
        "20 Topic Engine ideas/mo",
        "15 Word Study lookups/mo",
        "10 Bible Commentary/mo",
        "Sermon Drop",
        "AI Pastor Poro",
        "11 languages",
      ],
      color: GOLD,
    },
    {
      key: "pastor",
      name: "Pastor",
      monthlyPrice: "$49",
      annualMonthly: "$39.20",
      annualPrice: "$470.40",
      description: "For small-to-mid church senior pastors.",
      features: [
        "100 Sermon Forge/mo (40 deep)",
        "60 Topic Engine ideas/mo",
        "40 Word Study + 30 Illustrations/mo",
        "Series Planner (10/mo)",
        "Content Multiplier + Email Devotional",
        "Service Order Builder",
        "3 team seats",
      ],
      color: "#7C3AED",
      popular: true,
    },
    {
      key: "church",
      name: "Church",
      monthlyPrice: "$149",
      annualMonthly: "$119.20",
      annualPrice: "$1,430.40",
      description: "For multi-staff churches with Planning Center.",
      features: [
        "300 Sermon Forge/mo (100 deep)",
        "150 Topic Engine ideas/mo",
        "100 Word Study + 80 Illustrations/mo",
        "Planning Center integration",
        "Sermon Delivery Coach",
        "Attendance tracking",
        "5 team seats",
      ],
      color: "#0F172A",
    },
    {
      key: "bible_college",
      name: "Bible College",
      monthlyPrice: "$199",
      annualMonthly: "$159.20",
      annualPrice: "$1,910.40",
      description: "For Bible colleges — bulk seats for students and faculty.",
      features: [
        "Unlimited generations",
        "Unlimited student + faculty seats",
        "Full access to all tools",
        "Priority support + onboarding",
        "Dedicated account manager",
      ],
      color: "#B8860B",
    },
  ];

  const PRICE_IDS = {
    student_monthly:      "price_1THx2eB0WpRalfPpcei2tGcy",
    student_annual:       "price_1THx39B0WpRalfPpnEXguRNv",
    solo_monthly:         "price_1THx3YB0WpRalfPp3AHawEsh",
    solo_annual:          "price_1THx3uB0WpRalfPp7x9oVCwR",
    pastor_monthly:       "price_1THx4EB0WpRalfPpPZ354rYw",
    pastor_annual:        "price_1THx4fB0WpRalfPpJVlJB7eg",
    church_monthly:       "price_1TLySWB0WpRalfPp8Fmal2ss",
    church_annual:        "price_1TMKz6B0WpRalfPp7Ahwogjr",
    bible_college_monthly:"price_1THx61B0WpRalfPp3I5dtAg8",
    bible_college_annual: "price_1THx6MB0WpRalfPpgNpNWVda",
  };

  async function handleSelectPlan(planKey, planName) {
    setError(""); setLoading(planKey);
    try {
      var isLocal = window.location.hostname === "localhost";
      var base = isLocal ? "https://sermoncraft-pro.vercel.app" : "";
      var userId = user?.id || CURRENT_USER.id || "";
      var email = user?.email || CURRENT_USER.email || "";
      var planFullKey = planKey + "_monthly";
      var priceId = PRICE_IDS[planFullKey] || "";
      var response = await fetch(base + "/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planKey: planFullKey, priceId, userId, email, embedded: true }),
      });
      var data = await response.json();
      if (!response.ok || data.error) throw new Error(data.error || "Failed to start checkout");
      setSelectedPlan({ key: planKey, name: planName, fullKey: planFullKey });
      setEmbeddedSecret(data.clientSecret);
    } catch (e) {
      setError(e.message || "Failed to start checkout.");
    } finally { setLoading(null); }
  }

  async function handleStartTrial() {
    setLoading("trial"); setError("");
    try {
      var isLocal = window.location.hostname === "localhost";
      var base = isLocal ? "https://sermoncraft-pro.vercel.app" : "";
      var userId = user?.id || CURRENT_USER.id || "";
      var email = user?.email || CURRENT_USER.email || "";
      var planFullKey = trialPlan + "_monthly";
      var priceId = PRICE_IDS[planFullKey] || "";
      var response = await fetch(base + "/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planKey: planFullKey, priceId, userId, email, embedded: true, trialDays }),
      });
      var data = await response.json();
      if (!response.ok || data.error) throw new Error(data.error || "Failed to start trial");
      var trialPlanObj = PLANS.find(function(p) { return p.key === trialPlan; });
      setSelectedPlan({ key: trialPlan, name: (trialPlanObj?.name || trialPlan) + " (" + trialDays + "-day trial)", fullKey: planFullKey });
      setEmbeddedSecret(data.clientSecret);
    } catch (e) {
      setError(e.message || "Failed to start trial.");
    } finally { setLoading(null); }
  }


  // ── EMBEDDED CHECKOUT VIEW ──────────────────────────────────────────────────
  if (embeddedSecret) {
    return (
      <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: 16 }}>
        <div style={{ background: "#fff", borderRadius: 16, padding: "28px", width: "100%", maxWidth: 540, boxShadow: "0 8px 40px rgba(0,0,0,0.3)", maxHeight: "92vh", overflowY: "auto" }}>
          <StripeEmbeddedCheckout
            clientSecret={embeddedSecret}
            planName={selectedPlan?.name || ""}
            billing={billing}
            onClose={onClose}
            onSuccess={function() {
              onClose();
              window.location.reload();
            }}
          />
        </div>
      </div>
    );
  }

  if (showTrial) {
    return (
      <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: 16 }}>
        <div style={{ background: "#fff", borderRadius: 16, padding: "36px 32px", width: "100%", maxWidth: 480, boxShadow: "0 8px 40px rgba(0,0,0,0.25)" }}>
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>✝</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: CHARCOAL, fontFamily: FONT_DISPLAY, marginBottom: 8 }}>Start Your Free Trial</div>
            <div style={{ fontSize: 14, color: STONE, lineHeight: 1.6, fontFamily: FONT_BODY }}>Get full access to SermonCraft Pro. A card is required — you won't be charged until your trial ends. If you cancel, you keep access until the end of your billing period.</div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={styles.label}>Trial Length</label>
            <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
              {[7, 14].map(function(d) {
                return (
                  <button key={d} onClick={function() { setTrialDays(d); }} style={{ flex: 1, padding: "12px", border: "2px solid " + (trialDays === d ? GOLD : BORDER), borderRadius: 8, background: trialDays === d ? GOLD_PALE : "#fff", color: trialDays === d ? GOLD : STONE, fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: FONT_BODY, transition: "all 0.15s" }}>
                    {d} Days Free
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={styles.label}>Trial Plan</label>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 6 }}>
              {[
                { key: "solo", label: "Solo — $19/mo after trial", desc: "Great for bivocational pastors" },
                { key: "pastor", label: "Pastor — $49/mo after trial", desc: "Best for small-mid church pastors" },
                { key: "church", label: "Church — $99/mo after trial", desc: "Full access with Planning Center" },
              ].map(function(p) {
                return (
                  <div key={p.key} onClick={function() { setTrialPlan(p.key); }} style={{ padding: "12px 16px", border: "2px solid " + (trialPlan === p.key ? GOLD : BORDER), borderRadius: 8, cursor: "pointer", background: trialPlan === p.key ? GOLD_PALE : "#fff", transition: "all 0.15s" }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: CHARCOAL, fontFamily: FONT_BODY }}>{p.label}</div>
                    <div style={{ fontSize: 12, color: STONE_LIGHT, fontFamily: FONT_BODY }}>{p.desc}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {error && <div style={styles.errorPanel}>{error}</div>}

          <button onClick={handleStartTrial} disabled={trialLoading} style={{ width: "100%", padding: "14px", border: "none", borderRadius: 10, background: GOLD, color: "#fff", fontWeight: 700, fontSize: 15, cursor: trialLoading ? "not-allowed" : "pointer", fontFamily: FONT_BODY, marginBottom: 10, opacity: trialLoading ? 0.7 : 1 }}>
            {trialLoading ? "Starting trial..." : "Start " + trialDays + "-Day Free Trial"}
          </button>
          <div style={{ fontSize: 11, color: STONE_LIGHT, textAlign: "center", marginBottom: 16, fontFamily: FONT_BODY }}>A card is required. No charge until day {trialDays + 1}. If you cancel, access continues until end of billing period.</div>
          <button onClick={function() { setShowTrial(false); }} style={{ width: "100%", padding: "10px", border: "1px solid " + BORDER, borderRadius: 8, background: "transparent", color: STONE, fontWeight: 600, fontSize: 13, cursor: "pointer", fontFamily: FONT_BODY }}>← Back to plans</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: 16 }}>
      <div style={{ background: "#fff", borderRadius: 16, padding: "28px 24px", width: "100%", maxWidth: 1100, boxShadow: "0 8px 40px rgba(0,0,0,0.25)", maxHeight: "92vh", overflowY: "auto", overflowX: "hidden" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <div style={{ fontWeight: 700, fontSize: 22, color: CHARCOAL, fontFamily: FONT_DISPLAY }}>Upgrade Your Plan</div>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 24, cursor: "pointer", color: STONE }}>×</button>
        </div>
        <div style={{ fontSize: 14, color: STONE, marginBottom: 20, fontFamily: FONT_BODY }}>Unlock deeper sermon generation, more credits, and advanced ministry tools.</div>

        {/* Trial banner */}
        <div style={{ background: "linear-gradient(135deg, #B8860B 0%, #8B6309 100%)", borderRadius: 10, padding: "16px 20px", marginBottom: 24, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#fff", fontFamily: FONT_DISPLAY, marginBottom: 2 }}>Not sure yet? Start with a free trial.</div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.85)", fontFamily: FONT_BODY }}>7 or 14 days free. Card required — no charge until trial ends. Cancel before renewal to avoid being charged.</div>
          </div>
          <button onClick={function() { setShowTrial(true); }} style={{ padding: "10px 24px", border: "2px solid #fff", borderRadius: 8, background: "transparent", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: FONT_BODY, whiteSpace: "nowrap" }}>Start Free Trial</button>
        </div>



        {error && <div style={{ background: "#FFF5F5", border: "1px solid #FFC5C5", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#C0392B", marginBottom: 16, fontFamily: FONT_BODY }}>{error}</div>}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
          {PLANS.map(function(plan) {
            return (
              <div key={plan.key} style={{ border: plan.popular ? "2px solid " + GOLD : "1px solid " + BORDER, borderRadius: 12, padding: "22px 16px", position: "relative", background: plan.popular ? "#fffaf2" : "#fff" }}>
                {plan.popular && (
                  <div style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", background: GOLD, color: "#fff", fontSize: 10, fontWeight: 700, padding: "3px 12px", borderRadius: 20, letterSpacing: "0.06em", textTransform: "uppercase", whiteSpace: "nowrap", fontFamily: FONT_BODY }}>Most Popular</div>
                )}
                <div style={{ fontWeight: 700, fontSize: 16, color: CHARCOAL, marginBottom: 2, fontFamily: FONT_DISPLAY }}>{plan.name}</div>
                <div style={{ fontSize: 12, color: STONE, marginBottom: 14, lineHeight: 1.5, fontFamily: FONT_BODY }}>{plan.description}</div>
                <div style={{ marginBottom: 16 }}>
                  <span style={{ fontSize: 26, fontWeight: 700, color: CHARCOAL, fontFamily: FONT_BODY }}>{plan.monthlyPrice}</span>
                  <span style={{ fontSize: 12, color: STONE_LIGHT, fontFamily: FONT_BODY }}>/mo</span>

                </div>
                <div style={{ marginBottom: 16 }}>
                  {plan.features.map(function(f, i) {
                    return <div key={i} style={{ fontSize: 12, color: STONE, padding: "3px 0", display: "flex", alignItems: "flex-start", gap: 6, fontFamily: FONT_BODY }}><span style={{ color: GOLD, fontWeight: 700, flexShrink: 0 }}>✓</span>{f}</div>;
                  })}
                </div>
                <button onClick={function() { handleSelectPlan(plan.key, plan.name); }} disabled={loading === plan.key} style={{ width: "100%", padding: "10px", border: "none", borderRadius: 8, background: plan.popular ? GOLD : CHARCOAL, color: "#fff", fontWeight: 700, fontSize: 12, fontFamily: FONT_BODY, cursor: loading === plan.key ? "not-allowed" : "pointer", opacity: loading === plan.key ? 0.7 : 1 }}>
                  {loading === plan.key ? "Loading..." : "Get " + plan.name}
                </button>
              </div>
            );
          })}
        </div>
        <div style={{ textAlign: "center", fontSize: 12, color: STONE_LIGHT, marginTop: 20, fontFamily: FONT_BODY }}>Secure payment powered by Stripe. Cancel anytime. No hidden fees.</div>
      </div>
    </div>
  );
}

function PastorAccountsScreen({ church, user }) {
  const [members, setMembers] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteBillingType, setInviteBillingType] = useState("self_pay");
  const [inviteAssignedPlan, setInviteAssignedPlan] = useState("starter");
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteError, setInviteError] = useState("");
  const [inviteSuccess, setInviteSuccess] = useState("");
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showSetupPrompt, setShowSetupPrompt] = useState(false);
  const [churchName, setChurchName] = useState("");
  const [churchCity, setChurchCity] = useState("");
  const [churchDenom, setChurchDenom] = useState("");
  const [setupLoading, setSetupLoading] = useState(false);
  const [setupError, setSetupError] = useState("");

  const adminPlan = CURRENT_USER.plan || "free";
  const limits = getPlanLimits(adminPlan);
  const maxSeats = limits.teamSeats || 1;

  useEffect(function() {
    if (!church) { setLoading(false); setShowSetupPrompt(true); return; }
    loadData();
  }, [church]);

  async function loadData() {
    setLoading(true);
    try {
      const { fetchChurchMembers, fetchInvitations } = await import("./lib/db");
      const [m, i] = await Promise.all([fetchChurchMembers(church.id), fetchInvitations(church.id)]);
      setMembers(m);
      setInvitations(i);
    } catch (e) {} finally { setLoading(false); }
  }

  async function handleCreateChurch() {
    if (!churchName.trim()) { setSetupError("Please enter a church name."); return; }
    setSetupLoading(true);
    setSetupError("");
    try {
      const { createChurch } = await import("./lib/db");
      await createChurch(user.id, { name: churchName, city: churchCity, denomination: churchDenom });
      window.location.reload();
    } catch (e) {
      setSetupError(e.message || "Failed to create church.");
    } finally { setSetupLoading(false); }
  }

  async function handleInvite() {
    if (!inviteEmail.trim()) { setInviteError("Please enter an email address."); return; }
    const usedSeats = members.length + invitations.filter(function(i) { return i.status === "pending"; }).length;
    if (usedSeats >= maxSeats) {
      setInviteError("You've reached your seat limit (" + maxSeats + " seats on " + adminPlan + " plan). Upgrade to add more pastors.");
      setShowUpgradeModal(true);
      return;
    }
    setInviteError(""); setInviteSuccess(""); setInviteLoading(true);
    try {
      const { sendInvitation } = await import("./lib/db");
      await sendInvitation(church.id, user.id, inviteEmail.trim(), church.name, user.name, inviteBillingType, inviteAssignedPlan);
      setInviteSuccess("Invitation sent to " + inviteEmail.trim());
      setInviteEmail("");
      loadData();
    } catch (e) {
      setInviteError(e.message || "Failed to send invitation.");
    } finally { setInviteLoading(false); }
  }

  async function handleRemoveMember(memberId) {
    try {
      const { removeMemberFromChurch } = await import("./lib/db");
      await removeMemberFromChurch(memberId);
      setMembers(function(prev) { return prev.filter(function(m) { return m.id !== memberId; }); });
    } catch (e) {}
  }

  if (showSetupPrompt) {
    return (
      <div>
        <div style={styles.sectionSub}>Set up your church to start inviting pastors.</div>
        <div style={Object.assign({}, styles.card, { maxWidth: 500 })}>
          <div style={styles.cardTitle}>Create Your Church</div>
          <div style={{ marginTop: 16 }}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Church Name</label>
              <input style={styles.input} value={churchName} onChange={function(e) { setChurchName(e.target.value); }} placeholder="e.g. Kingdom Insights Ministries" />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Denomination</label>
              <input style={styles.input} value={churchDenom} onChange={function(e) { setChurchDenom(e.target.value); }} placeholder="e.g. Non-Denominational" />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>City</label>
              <input style={styles.input} value={churchCity} onChange={function(e) { setChurchCity(e.target.value); }} placeholder="e.g. Dallas, TX" />
            </div>
            {setupError && <div style={styles.errorPanel}>{setupError}</div>}
            <Button onClick={handleCreateChurch} disabled={setupLoading}>{setupLoading ? "Creating..." : "Create Church"}</Button>
          </div>
        </div>
      </div>
    );
  }

  const usedSeats = members.length + invitations.filter(function(i) { return i.status === "pending"; }).length;
  const seatsRemaining = Math.max(0, maxSeats - usedSeats);

  return (
    <div>
      <div style={styles.sectionSub}>Manage ministry staff and user access.</div>
      <div style={{ background: "#fffaf2", border: "1px solid #e8dcc8", borderRadius: 10, padding: "12px 18px", marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", gap: 24 }}>
          <div><div style={{ fontSize: 11, fontWeight: 700, color: STONE_LIGHT, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 2 }}>Plan</div><div style={{ fontSize: 15, fontWeight: 700, color: CHARCOAL }}>{adminPlan}</div></div>
          <div><div style={{ fontSize: 11, fontWeight: 700, color: STONE_LIGHT, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 2 }}>Seats Used</div><div style={{ fontSize: 15, fontWeight: 700, color: CHARCOAL }}>{usedSeats} / {maxSeats}</div></div>
          <div><div style={{ fontSize: 11, fontWeight: 700, color: STONE_LIGHT, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 2 }}>Remaining</div><div style={{ fontSize: 15, fontWeight: 700, color: seatsRemaining === 0 ? "#C0392B" : GOLD }}>{seatsRemaining} seats</div></div>
        </div>
        {seatsRemaining === 0 && (
          <button onClick={function() { setShowUpgradeModal(true); }} style={{ background: GOLD, color: "#fff", border: "none", borderRadius: 8, padding: "8px 16px", fontWeight: 700, fontSize: 13, fontFamily: "'Georgia', serif", cursor: "pointer" }}>Upgrade for More Seats</button>
        )}
      </div>
      <div style={Object.assign({}, styles.card, { marginBottom: 20 })}>
        <div style={styles.cardTitle}>Invite a Pastor</div>
        <div style={{ marginTop: 12 }}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email Address</label>
            <input style={styles.input} value={inviteEmail} onChange={function(e) { setInviteEmail(e.target.value); }} placeholder="pastor@church.com" />
          </div>
          <div style={styles.grid2}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Billing Type</label>
              <select style={styles.select} value={inviteBillingType} onChange={function(e) { setInviteBillingType(e.target.value); }}>
                <option value="self_pay">Self Pay — Pastor pays their own plan</option>
                <option value="church_covered">Church Covered — Church pays for this seat</option>
              </select>
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Assign Plan</label>
              <select style={styles.select} value={inviteAssignedPlan} onChange={function(e) { setInviteAssignedPlan(e.target.value); }}>
                <option value="free">Free</option>
                <option value="starter">Starter</option>
                <option value="growth">Growth</option>
                <option value="pro">Pro</option>
              </select>
            </div>
          </div>
          {inviteBillingType === "church_covered" && (
            <div style={{ background: GOLD_PALE, border: "1px solid " + GOLD, borderRadius: 8, padding: "10px 14px", fontSize: 13, color: STONE, marginBottom: 12 }}>
              This pastor's plan will be covered by your church account. Their usage will count against your church's limits.
            </div>
          )}
          <Button onClick={handleInvite} disabled={inviteLoading}>{inviteLoading ? "Sending..." : "Send Invite"}</Button>
        </div>
        {inviteError && <div style={styles.errorPanel}>{inviteError}</div>}
        {inviteSuccess && <div style={{ backgroundColor: "#F0FFF4", border: "1px solid #9AE6B4", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#276749", marginTop: 10 }}>{inviteSuccess}</div>}
      </div>
      {invitations.filter(function(i) { return i.status === "pending"; }).length > 0 && (
        <div style={Object.assign({}, styles.card, { marginBottom: 20 })}>
          <div style={styles.cardTitle}>Pending Invitations</div>
          <div style={{ marginTop: 12 }}>
            {invitations.filter(function(i) { return i.status === "pending"; }).map(function(inv) {
              return (
                <div key={inv.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid " + BORDER }}>
                  <div>
                    <div style={{ fontSize: 14, color: CHARCOAL }}>{inv.email}</div>
                    <div style={{ fontSize: 12, color: STONE_LIGHT, marginTop: 2 }}>{inv.billing_type === "church_covered" ? "Church Covered" : "Self Pay"}{" · "}{inv.assigned_plan || "free"} plan</div>
                  </div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <span style={Object.assign({}, styles.tag, styles.tagGray)}>Pending</span>
                    <button onClick={function() { setInviteEmail(inv.email); setInviteError(""); setInviteSuccess(""); }} style={{ background: "none", border: "1px solid " + BORDER, color: STONE, borderRadius: 6, padding: "4px 10px", fontSize: 11, cursor: "pointer", fontFamily: "'Georgia', serif" }}>Resend</button>
                    <button onClick={async function() { try { const { declineInvitation } = await import("./lib/db"); await declineInvitation(inv.id); setInvitations(function(prev) { return prev.filter(function(i) { return i.id !== inv.id; }); }); } catch (e) {} }} style={{ background: "none", border: "1px solid #FFC5C5", color: "#C0392B", borderRadius: 6, padding: "4px 10px", fontSize: 11, cursor: "pointer", fontFamily: "'Georgia', serif" }}>Cancel</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      <div style={styles.card}>
        <div style={styles.cardTitle}>Pastor Accounts</div>
        {loading && <div style={{ color: STONE_LIGHT, fontStyle: "italic", fontSize: 13, marginTop: 12 }}>Loading...</div>}
        {!loading && members.length === 0 && <div style={{ color: STONE_LIGHT, fontStyle: "italic", fontSize: 13, marginTop: 12 }}>No pastors added yet. Send an invite above.</div>}
        {members.length > 0 && (
          <table style={Object.assign({}, styles.table, { marginTop: 12 })}>
            <thead>
              <tr>
                <th style={styles.th}>Name</th><th style={styles.th}>Title</th><th style={styles.th}>Email</th><th style={styles.th}>Plan</th><th style={styles.th}>Billing</th><th style={styles.th}>Action</th>
              </tr>
            </thead>
            <tbody>
              {members.map(function(m) {
                return (
                  <tr key={m.id}>
                    <td style={Object.assign({}, styles.td, { fontWeight: 600 })}>{m.full_name || "—"}</td>
                    <td style={styles.td}><span style={Object.assign({}, styles.tag, styles.tagGold)}>{m.title || "Pastor"}</span></td>
                    <td style={Object.assign({}, styles.td, { color: STONE_LIGHT, fontSize: 13 })}>{m.email}</td>
                    <td style={styles.td}><span style={Object.assign({}, styles.tag, styles.tagGray)}>{m.plan || "free"}</span></td>
                    <td style={styles.td}><span style={Object.assign({}, styles.tag, m.billing_type === "church_covered" ? styles.tagGold : styles.tagGray)}>{m.billing_type === "church_covered" ? "Church" : "Self"}</span></td>
                    <td style={styles.td}>{m.id !== user.id && <button onClick={function() { handleRemoveMember(m.id); }} style={{ background: "none", border: "1px solid #FFC5C5", color: "#C0392B", borderRadius: 6, padding: "4px 10px", fontSize: 11, cursor: "pointer", fontFamily: "'Georgia', serif" }}>Remove</button>}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
      {showUpgradeModal && <UpgradeModal onClose={function() { setShowUpgradeModal(false); }} />}
    </div>
  );
}

function StripeCheckoutEmbed({ clientSecret, onClose }) {
  const containerRef = useRef(null);
  useEffect(function() {
    if (!clientSecret || !containerRef.current) return;
    import("@stripe/stripe-js").then(function({ loadStripe }) {
      loadStripe("pk_test_51TF9IDBj8tFLJYUndl4BKsAb42s5JEQfJ7JHUvxxCqU1ckubQ7tzPPCK8SkL9o80u03lX63jUwy6YOrHn6quk00a00ZSjqy4VW").then(function(stripe) {
        if (!stripe) return;
        const checkout = stripe.initEmbeddedCheckout({ clientSecret });
        checkout.then(function(c) { c.mount(containerRef.current); });
      });
    });
  }, [clientSecret]);
  return <div ref={containerRef} style={{ minHeight: 300 }} />;
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────

function DashboardScreen({ user, library, setCurrentScreen, language, onLanguageChange, onUpdateStatus, setForgePrefill }) {
  var recentSermons = library.slice(0, 3);
  const limits = getPlanLimits(CURRENT_USER.plan || "free");
  const currentPlan = CURRENT_USER.plan || "free";
  const currentUsage = loadUsage();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [editingDate, setEditingDate] = useState(false);
  const [editingInfo, setEditingInfo] = useState(false);
  const [tempTitle, setTempTitle] = useState("");
  const [tempScripture, setTempScripture] = useState("");

  const {
    sermonDate, setSermonDate, resetToNextSunday,
    sermonTitle, setSermonTitle,
    sermonScripture, setSermonScripture,
    daysLeft, weekProgress, urgencyColor,
  } = useSundayCountdown();

  var totalThisYear = useMemo(function() {
    var year = new Date().getFullYear().toString();
    return library.filter(function(s) { return s.savedAt && s.savedAt.includes(year); }).length;
  }, [library]);

  var activeSeries = useMemo(function() {
    var titles = library.map(function(s) { return s.seriesTitle; }).filter(Boolean);
    return new Set(titles).size;
  }, [library]);

  var inProgressSermons = useMemo(function() {
    return library.filter(function(s) { return s.status === "idea" || s.status === "draft" || s.status === "review"; }).slice(0, 3);
  }, [library]);

  var thisWeekSermon = useMemo(function() {
    var now = new Date();
    var weekStart = new Date(now);
    // Start of this week (Monday)
    var day = now.getDay();
    var diff = day === 0 ? -6 : 1 - day;
    weekStart.setDate(now.getDate() + diff);
    weekStart.setHours(0, 0, 0, 0);

    // Find a sermon saved this week
    var thisWeek = library.find(function(s) {
      if (!s.savedAt) return false;
      var saved = new Date(s.savedAt);
      return saved >= weekStart;
    });

    return thisWeek || inProgressSermons[0] || null;
  }, [library, inProgressSermons]);

  var activeSeries2 = useMemo(function() {
    var seriesMap = {};
    library.forEach(function(s) {
      if (s.seriesTitle && s.seriesId) {
        if (!seriesMap[s.seriesId]) seriesMap[s.seriesId] = { title: s.seriesTitle, sermons: [], id: s.seriesId };
        seriesMap[s.seriesId].sermons.push(s);
      }
    });
    return Object.values(seriesMap).slice(0, 2);
  }, [library]);

  var stats = [
    { value: library.length, label: "Saved Sermons" },
    { value: totalThisYear, label: "This Year" },
    { value: activeSeries, label: "Active Series" },
    { value: currentUsage.fast_used || 0, label: "Fast Used" },
  ];

  var STATUS_COLORS = {
    idea: { bg: CREAM, color: STONE },
    draft: { bg: "#FFF8E1", color: "#B8860B" },
    review: { bg: "#E8F4FD", color: "#2980B9" },
    final: { bg: "#EAFAF1", color: "#27AE60" },
  };

  function StatusBadge({ status }) {
    var s = STATUS_COLORS[status] || STATUS_COLORS.draft;
    var labels = { idea: "Idea", draft: "Draft", review: "Review", final: "Final" };
    return <span style={{ display: "inline-block", padding: "2px 10px", borderRadius: 12, fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", backgroundColor: s.bg, color: s.color }}>{labels[status] || "Draft"}</span>;
  }

  function StatusSelector({ sermon }) {
    return (
      <select value={sermon.status || "draft"} onChange={function(e) { onUpdateStatus(sermon.id, { status: e.target.value }); }} style={{ padding: "2px 8px", border: "1px solid " + BORDER, borderRadius: 6, fontSize: 11, fontFamily: "'Georgia', serif", color: CHARCOAL, backgroundColor: IVORY, cursor: "pointer", outline: "none" }} onClick={function(e) { e.stopPropagation(); }}>
        <option value="idea">Idea</option>
        <option value="draft">Draft</option>
        <option value="review">Review</option>
        <option value="final">Final</option>
      </select>
    );
  }

  return (
    <div>
      {/* ── PLAN BAR ── */}
      <div style={{ background: WARM_WHITE, border: "1px solid " + BORDER, borderRadius: 10, padding: "12px 20px", marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", gap: 20, flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: STONE_LIGHT, textTransform: "uppercase", letterSpacing: "0.06em", fontFamily: FONT_BODY }}>Plan</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: CHARCOAL, background: GOLD_PALE, padding: "2px 10px", borderRadius: 12, border: "1px solid " + GOLD_BORDER, fontFamily: FONT_BODY }}>{limits.name}</span>
          </div>
          {[
            { label: "Sermons", used: currentUsage.fast_used, limit: limits.fast },
            { label: "Topics", used: currentUsage.topicEngine_used || 0, limit: limits.topicEngine },
            { label: "Word Study", used: currentUsage.wordStudy_used || 0, limit: limits.wordStudy },
            { label: "Commentary", used: currentUsage.bibleCommentary_used || 0, limit: limits.bibleCommentary },
          ].filter(function(item) { return item.limit > 0 && item.limit < 999999; }).map(function(item) {
            var pct = Math.min(100, Math.round((item.used / item.limit) * 100));
            var color = pct >= 90 ? "#C0392B" : pct >= 70 ? "#E67E22" : GOLD;
            return (
              <div key={item.label} style={{ minWidth: 80 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                  <span style={{ fontSize: 10, color: STONE_LIGHT, fontFamily: FONT_BODY }}>{item.label}</span>
                  <span style={{ fontSize: 10, fontWeight: 700, color: pct >= 90 ? "#C0392B" : STONE, fontFamily: FONT_BODY }}>{item.used}/{item.limit}</span>
                </div>
                <div style={{ height: 4, background: BORDER, borderRadius: 2, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: pct + "%", background: color, borderRadius: 2, transition: "width 0.3s" }} />
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {currentPlan === "free" || currentPlan === "starter" ? (
            <button style={{ background: GOLD, color: "#fff", border: "none", borderRadius: 8, padding: "7px 16px", cursor: "pointer", fontWeight: 700, fontSize: 12, fontFamily: FONT_BODY }} onClick={function() { setShowUpgradeModal(true); }}>Upgrade Plan</button>
          ) : (
            <span style={{ fontSize: 12, color: "#27AE60", fontWeight: 600, fontFamily: FONT_BODY }}>✓ {limits.name}</span>
          )}
        </div>
      </div>

      {/* ── SUNDAY COUNTDOWN ── */}
      <div style={{ background: WARM_WHITE, border: "1px solid " + BORDER, borderRadius: 14, padding: "20px 24px", marginBottom: 20, position: "relative", overflow: "hidden", boxShadow: SHADOW }}>
        {/* Background cross watermark */}
        <div style={{ position: "absolute", right: 20, top: -10, fontSize: 120, opacity: 0.04, color: GOLD, fontFamily: "serif", pointerEvents: "none" }}>✝</div>

        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: STONE_LIGHT, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>
              Next Service
            </div>

            {/* Days countdown */}
            <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 12 }}>
              <span style={{ fontSize: 52, fontWeight: 900, color: urgencyColor, lineHeight: 1, fontFamily: FONT_DISPLAY }}>{daysLeft}</span>
              <span style={{ fontSize: 16, color: STONE, fontWeight: 400, fontFamily: FONT_BODY }}>{daysLeft === 1 ? "day" : "days"} away</span>
            </div>

            {/* Progress bar */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: STONE_LIGHT, marginBottom: 4, fontFamily: FONT_BODY }}>
                <span>MON</span><span>TUE</span><span>WED</span><span>THU</span><span>FRI</span><span>SAT</span><span style={{ color: urgencyColor, fontWeight: 700 }}>SUN</span>
              </div>
              <div style={{ height: 6, background: CREAM, borderRadius: 3, overflow: "hidden", border: "1px solid " + BORDER }}>
                <div style={{ height: "100%", width: weekProgress + "%", background: urgencyColor, borderRadius: 3, transition: "width 0.3s ease" }} />
              </div>
            </div>

            {/* Sermon info */}
            {editingInfo ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <input
                  value={tempTitle}
                  onChange={function(e) { setTempTitle(e.target.value); }}
                  placeholder="Sermon title..."
                  style={Object.assign({}, styles.input, { fontSize: 13 })}
                />
                <input
                  value={tempScripture}
                  onChange={function(e) { setTempScripture(e.target.value); }}
                  placeholder="Scripture reference..."
                  style={Object.assign({}, styles.input, { fontSize: 13 })}
                />
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={function() { setSermonTitle(tempTitle); setSermonScripture(tempScripture); setEditingInfo(false); }} style={{ padding: "5px 14px", borderRadius: 6, border: "none", background: GOLD, color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: FONT_BODY }}>Save</button>
                  <button onClick={function() { setEditingInfo(false); }} style={{ padding: "5px 14px", borderRadius: 6, border: "1px solid " + BORDER, background: "transparent", color: STONE, fontSize: 12, cursor: "pointer", fontFamily: FONT_BODY }}>Cancel</button>
                </div>
              </div>
            ) : (
              <div onClick={function() { setTempTitle(sermonTitle); setTempScripture(sermonScripture); setEditingInfo(true); }} style={{ cursor: "pointer" }}>
                {sermonTitle ? (
                  <div style={{ fontSize: 15, fontWeight: 700, color: CHARCOAL, marginBottom: 2, fontFamily: FONT_DISPLAY }}>{sermonTitle}</div>
                ) : (
                  <div style={{ fontSize: 14, color: STONE_LIGHT, fontStyle: "italic", fontFamily: FONT_BODY }}>Tap to add sermon title...</div>
                )}
                {sermonScripture ? (
                  <div style={{ fontSize: 13, color: GOLD, fontFamily: FONT_BODY }}>📖 {sermonScripture}</div>
                ) : sermonTitle ? (
                  <div style={{ fontSize: 12, color: STONE_LIGHT, fontStyle: "italic", fontFamily: FONT_BODY }}>Tap to add scripture...</div>
                ) : null}
              </div>
            )}
          </div>

          {/* Right side — date + actions */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 10, flexShrink: 0 }}>
            {editingDate ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
                <input
                  type="date"
                  defaultValue={sermonDate.toISOString().slice(0, 10)}
                  onChange={function(e) {
                    if (e.target.value) setSermonDate(new Date(e.target.value + "T00:00:00"));
                  }}
                  style={Object.assign({}, styles.input, { fontSize: 13, width: "auto" })}
                />
                <div style={{ display: "flex", gap: 6 }}>
                  <button onClick={function() { setEditingDate(false); }} style={{ padding: "4px 12px", borderRadius: 6, border: "none", background: GOLD, color: "#fff", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: FONT_BODY }}>Done</button>
                  <button onClick={function() { resetToNextSunday(); setEditingDate(false); }} style={{ padding: "4px 12px", borderRadius: 6, border: "1px solid " + BORDER, background: "transparent", color: STONE, fontSize: 11, cursor: "pointer", fontFamily: FONT_BODY }}>Reset</button>
                </div>
              </div>
            ) : (
              <button onClick={function() { setEditingDate(true); }} style={{ padding: "5px 12px", borderRadius: 6, border: "1px solid " + BORDER, background: WARM_WHITE, color: STONE, fontSize: 11, cursor: "pointer", fontFamily: FONT_BODY }}>
                {sermonDate.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })} ✎
              </button>
            )}
            <button
              onClick={function() {
                if (sermonTitle) setForgePrefill({ title: sermonTitle, scripture: sermonScripture, angle: "" });
                setCurrentScreen("sermon-forge");
              }}
              style={{ padding: "9px 18px", borderRadius: 8, border: "none", background: GOLD, color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: FONT_BODY, whiteSpace: "nowrap" }}
            >
              Prepare Now
            </button>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="scp-grid-4" style={{ marginBottom: 20 }}>
        {stats.map(function(stat) {
          return (
            <div key={stat.label} style={{ backgroundColor: WARM_WHITE, border: "1px solid " + BORDER, borderRadius: 10, padding: "16px 20px", boxShadow: SHADOW }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: GOLD, lineHeight: 1, marginBottom: 4, fontFamily: FONT_DISPLAY }}>{stat.value}</div>
              <div style={{ fontSize: 10, color: TEXT_SECONDARY, textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600, fontFamily: FONT_BODY }}>{stat.label}</div>
            </div>
          );
        })}
      </div>

      {thisWeekSermon ? (
        <div style={{ background: GOLD_PALE, border: "1px solid " + GOLD_BORDER, borderRadius: 12, padding: "18px 22px", marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: GOLD, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4, fontFamily: FONT_BODY }}>This Week</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: CHARCOAL, marginBottom: 4, fontFamily: FONT_DISPLAY }}>{thisWeekSermon.title || "Untitled Sermon"}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <StatusBadge status={thisWeekSermon.status || "draft"} />
              {thisWeekSermon.scripture && <span style={{ fontSize: 12, color: STONE, fontFamily: FONT_BODY }}>{thisWeekSermon.scripture}</span>}
            </div>
          </div>
          <button onClick={function() { if (setForgePrefill) setForgePrefill({ title: thisWeekSermon.title || "", scripture: thisWeekSermon.scripture || "", angle: thisWeekSermon.sourceTopic || "" }); setCurrentScreen("sermon-forge"); }} style={{ background: GOLD, color: "#fff", border: "none", borderRadius: 8, padding: "10px 18px", fontWeight: 700, cursor: "pointer", fontSize: 13, fontFamily: FONT_BODY }}>Continue Sermon</button>
        </div>
      ) : (
        <div style={{ background: WARM_WHITE, border: "2px dashed " + BORDER, borderRadius: 12, padding: "18px 22px", marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: CHARCOAL, marginBottom: 2 }}>No sermon started this week</div>
            <div style={{ fontSize: 12, color: STONE_LIGHT }}>Start your message for Sunday</div>
          </div>
          <button onClick={function() { setCurrentScreen("sermon-forge"); }} style={{ background: GOLD, color: "#fff", border: "none", borderRadius: 8, padding: "10px 18px", fontWeight: 700, cursor: "pointer", fontSize: 13, fontFamily: "'Georgia', serif" }}>Start This Week's Sermon</button>
        </div>
      )}

      {activeSeries2.length > 0 && (
        <div style={Object.assign({}, styles.card, { marginBottom: 16 })}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={styles.cardTitle}>Active Series</div>
            <button onClick={function() { setCurrentScreen("series-planner"); }} style={{ background: "none", border: "none", color: GOLD, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "'Georgia', serif" }}>New Series</button>
          </div>
          {activeSeries2.map(function(series) {
            var lastWeek = Math.max.apply(null, series.sermons.map(function(s) { return s.seriesWeek || 0; }));
            var nextWeek = lastWeek + 1;
            return (
              <div key={series.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid " + BORDER }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14, color: CHARCOAL }}>{series.title}</div>
                  <div style={{ fontSize: 12, color: STONE_LIGHT, marginTop: 2 }}>{series.sermons.length} sermon{series.sermons.length !== 1 ? "s" : ""} · Last: Week {lastWeek}</div>
                </div>
                <button onClick={function() { if (setForgePrefill) setForgePrefill({ title: series.title + " — Week " + nextWeek, scripture: "", angle: "Week " + nextWeek + " of " + series.title }); setCurrentScreen("sermon-forge"); }} style={{ background: GOLD_PALE, color: GOLD, border: "1px solid " + GOLD, borderRadius: 6, padding: "5px 12px", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "'Georgia', serif" }}>Continue Week {nextWeek}</button>
              </div>
            );
          })}
        </div>
      )}

      <div style={styles.grid2}>
        <div style={styles.card}>
          <div style={styles.cardTitle}>Quick Tools</div>
          <div style={styles.cardMeta}>Launch a ministry tool instantly</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              { id: "sermon-forge", label: "Start a New Sermon" },
              { id: "topic-engine", label: "Generate Topics" },
              { id: "word-study", label: "Explore a Scripture" },
              { id: "series-planner", label: "Plan a Series" },
              { id: "content-multiplier", label: "Multiply Content" },
            ].map(function(tool) {
              return <button key={tool.id} onClick={function() { setCurrentScreen(tool.id); }} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", border: "1px solid " + BORDER, borderRadius: 8, backgroundColor: IVORY, cursor: "pointer", fontSize: 13, color: CHARCOAL, fontFamily: FONT_BODY, textAlign: "left", transition: "all 0.15s", fontWeight: 500 }}>{tool.label}</button>;
            })}
          </div>
        </div>
        <div style={styles.card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
            <div style={styles.cardTitle}>In Progress</div>
            <button onClick={function() { setCurrentScreen("library"); }} style={{ background: "none", border: "none", color: GOLD, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "'Georgia', serif" }}>View All</button>
          </div>
          <div style={styles.cardMeta}>Sermons not yet finalized</div>
          {inProgressSermons.length === 0 && <div style={{ color: STONE_LIGHT, fontSize: 14, fontStyle: "italic" }}>No sermons in progress.</div>}
          {inProgressSermons.map(function(s) {
            return (
              <div key={s.id} style={{ padding: "10px 0", borderBottom: "1px solid " + BORDER }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, color: CHARCOAL, marginBottom: 4 }}>{s.title}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <StatusSelector sermon={s} />
                      {s.scripture && <span style={{ fontSize: 12, color: STONE_LIGHT }}>{s.scripture}</span>}
                    </div>
                  </div>
                  <button onClick={function() { if (setForgePrefill) setForgePrefill({ title: s.title || "", scripture: s.scripture || "", angle: s.sourceTopic || "" }); setCurrentScreen("sermon-forge"); }} style={{ background: "none", border: "1px solid " + BORDER, color: STONE, borderRadius: 6, padding: "4px 10px", fontSize: 11, cursor: "pointer", fontFamily: "'Georgia', serif", flexShrink: 0 }}>Continue</button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {showUpgradeModal && <UpgradeModal onClose={function() { setShowUpgradeModal(false); }} />}
    </div>
  );
}

// ─── AI PASTOR ────────────────────────────────────────────────────────────────

const PORO_GREETING = "Hi, I'm Poro, your AI Pastor. How may I help you today?";

// Unlock audio on Safari — must be called from a direct user gesture
function unlockAudio() {
  try {
    var AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    var ctx = new AudioContext();
    var buf = ctx.createBuffer(1, 1, 22050);
    var src = ctx.createBufferSource();
    src.buffer = buf;
    src.connect(ctx.destination);
    src.start(0);
    setTimeout(function() { ctx.close(); }, 100);
  } catch (e) {}
}

function AIPastorScreen({ language, voiceProfile, onRequestVoiceProfile, congregationProfile, congregationEnabled, onToggleCongregation }) {
  const [mode, setMode] = useState("fast");
  const [messages, setMessages] = useState([{ role: "assistant", text: PORO_GREETING }]);
  const [followUp, setFollowUp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showUpgradeMessage, setShowUpgradeMessage] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [voiceMode, setVoiceMode] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioMuted, setAudioMuted] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [continuousMode, setContinuousMode] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [conversationStarted, setConversationStarted] = useState(false);
  const bottomRef = useRef(null);
  const recognitionRef = useRef(null);
  const audioRef = useRef(null);
  const continuousRef = useRef(false);
  const loadingRef = useRef(false);
  const messagesRef = useRef(messages);

  useEffect(function() { messagesRef.current = messages; }, [messages]);
  useEffect(function() { loadingRef.current = loading; }, [loading]);

  useEffect(function() {
    var hasSpeech = "SpeechRecognition" in window || "webkitSpeechRecognition" in window;
    setVoiceSupported(hasSpeech);
  }, []);

  useEffect(function() {
    if (bottomRef.current) { bottomRef.current.scrollIntoView({ behavior: "smooth" }); }
  }, [messages, loading]);

  useEffect(function() {
    return function() {
      continuousRef.current = false;
      if (recognitionRef.current) { try { recognitionRef.current.stop(); } catch (e) {} }
      if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    };
  }, []);

  const languageName = getLanguageName(language || "en");

  function speakText(text, onFinished) {
    if (audioMuted || !text) { if (onFinished) onFinished(); return; }
    var isLocal = window.location.hostname === "localhost";
    var ttsUrl = isLocal ? "https://sermoncraft-pro.vercel.app/api/tts" : "/api/tts";
    setIsSpeaking(true);

    fetch(ttsUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: text }),
    })
      .then(function(res) {
        if (!res.ok) throw new Error("TTS error");
        return res.arrayBuffer();
      })
      .then(function(buffer) {
        var blob = new Blob([buffer], { type: "audio/mpeg" });
        var url = URL.createObjectURL(blob);
        var audio = new Audio(url);
        audioRef.current = audio;

        function cleanup() {
          setIsSpeaking(false);
          URL.revokeObjectURL(url);
          audioRef.current = null;
          if (onFinished) onFinished();
        }

        audio.onended = cleanup;
        audio.onerror = cleanup;

        var playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch(function(err) {
            console.warn("Audio play blocked:", err);
            // Try with user interaction workaround
            var btn = document.createElement("button");
            btn.style.display = "none";
            document.body.appendChild(btn);
            btn.addEventListener("click", function() {
              audio.play().catch(cleanup);
              document.body.removeChild(btn);
            });
            btn.click();
          });
        }
      })
      .catch(function(err) {
        console.warn("TTS fetch failed, using browser fallback:", err);
        setIsSpeaking(false);
        // Browser TTS fallback
        if (!window.speechSynthesis) { if (onFinished) onFinished(); return; }
        window.speechSynthesis.cancel();
        var utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.9;
        var voices = window.speechSynthesis.getVoices();
        var preferred = voices.find(function(v) { return v.name.includes("Daniel") || v.name.includes("Samantha") || v.lang.startsWith("en"); });
        if (preferred) utterance.voice = preferred;
        utterance.onend = function() { setIsSpeaking(false); if (onFinished) onFinished(); };
        utterance.onerror = function() { setIsSpeaking(false); if (onFinished) onFinished(); };
        window.speechSynthesis.speak(utterance);
        setIsSpeaking(true);
      });
  }

  function startListeningOnce(onResult) {
    var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    var recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = language === "es" ? "es-ES" : language === "fr" ? "fr-FR" : "en-US";
    recognitionRef.current = recognition;

    var finalText = "";
    recognition.onstart = function() { setIsListening(true); setTranscript(""); };
    recognition.onend = function() {
      setIsListening(false);
      if (finalText.trim()) {
        onResult(finalText.trim());
      } else if (continuousRef.current) {
        // No speech — restart listening
        setTimeout(function() {
          if (continuousRef.current && !loadingRef.current) startListeningOnce(onResult);
        }, 500);
      }
    };
    recognition.onerror = function(e) {
      setIsListening(false);
      if (e.error !== "aborted" && e.error !== "no-speech") {
        setError("Mic error: " + e.error);
      }
      if (continuousRef.current && !loadingRef.current) {
        setTimeout(function() { if (continuousRef.current) startListeningOnce(onResult); }, 800);
      }
    };
    recognition.onresult = function(event) {
      var interim = "";
      var final = "";
      for (var i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) { final += event.results[i][0].transcript; }
        else { interim += event.results[i][0].transcript; }
      }
      finalText = final || interim;
      setTranscript(finalText);
    };
    recognition.start();
  }

  async function sendMessage(userText, afterSpeak) {
    if (!userText.trim()) return;
    const currentUsage = loadUsage();
    const usageCheck = canUseTool(CURRENT_USER.plan || "free", currentUsage, mode);
    if (!usageCheck.ok) { setError(usageCheck.message); setShowUpgradeMessage(true); return; }
    setError(""); setShowUpgradeMessage(false); setLoading(true); setTranscript("");
    setConversationStarted(true);
    var currentMessages = messagesRef.current;
    var newMessages = currentMessages.concat([{ role: "user", text: userText }]);
    setMessages(newMessages);

    var voiceContext = buildVoiceContext(voiceProfile);
    var congregationContext = buildCongregationContext(congregationProfile);
    var systemPrompt =
      (voiceContext ? voiceContext + "\n\n" : "") +
      (congregationContext ? congregationContext + "\n\n" : "") +
      "Your name is Poro. You are a deeply knowledgeable, pastoral AI ministry advisor named Poro. " +
      "Keep responses conversational and under 3 paragraphs when in voice mode. " +
      "Respond entirely in " + languageName + ". " +
      "Speak with wisdom, biblical grounding, warmth, and clarity.";

    var conversationPrompt =
      "Respond in " + languageName + ".\n\n" +
      newMessages.filter(function(m) { return m.text !== PORO_GREETING; })
        .map(function(m) { return (m.role === "user" ? "Pastor: " : "Poro: ") + m.text; }).join("\n\n");

    try {
      var reply = "";
      await callSermonAPI(conversationPrompt, systemPrompt, mode === "deep", function(acc) { reply = acc; });
      var cleaned = cleanAIText(reply).replace(/\*\*/g, "").replace(/\*/g, "");
      var updatedMessages = newMessages.concat([{ role: "assistant", text: cleaned }]);
      setMessages(updatedMessages);
      incrementUsage(mode);
      if (voiceMode || continuousRef.current) {
        speakText(cleaned, function() {
          if (afterSpeak) afterSpeak();
        });
      }
    } catch (e) {
      setError(e.message || "An error occurred.");
      if (afterSpeak) afterSpeak();
    } finally { setLoading(false); }
  }

  function startContinuous() {
    unlockAudio(); // Unlock Safari audio on user gesture
    continuousRef.current = true;
    setContinuousMode(true);
    setConversationStarted(true);
    setError("");
    speakText(PORO_GREETING, function() {
      if (!continuousRef.current) return;
      listenThenRespond();
    });
  }

  function listenThenRespond() {
    if (!continuousRef.current) return;
    startListeningOnce(function(text) {
      if (!continuousRef.current) return;
      sendMessage(text, function() {
        // After Poro speaks, listen again
        if (continuousRef.current) {
          setTimeout(function() {
            if (continuousRef.current) listenThenRespond();
          }, 400);
        }
      });
    });
  }

  function stopContinuous() {
    continuousRef.current = false;
    setContinuousMode(false);
    setIsListening(false);
    setIsSpeaking(false);
    if (recognitionRef.current) { try { recognitionRef.current.stop(); } catch (e) {} }
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
  }

  function toggleManualListening() {
    if (isListening) {
      if (recognitionRef.current) { try { recognitionRef.current.stop(); } catch (e) {} }
      setIsListening(false);
    } else {
      startListeningOnce(function(text) {
        if (text) sendMessage(text);
      });
    }
  }

  const handleFollowUp = useCallback(async function() {
    if (!followUp.trim() || loading) return;
    var text = followUp.trim();
    setFollowUp("");
    await sendMessage(text);
  }, [followUp, loading, mode, language, messages, voiceProfile]);

  function handleReset() {
    stopContinuous();
    setMessages([{ role: "assistant", text: PORO_GREETING }]);
    setFollowUp(""); setError(""); setShowUpgradeMessage(false);
    setIsListening(false); setIsSpeaking(false); setConversationStarted(false);
    setTranscript("");
  }

  var isActive = continuousMode || voiceMode;

  return (
    <div>
      {/* Top bar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 12 }}>
        <div style={{ fontSize: 14, color: STONE }}>Your personal AI pastoral advisor, available anytime.</div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {voiceSupported && (
            <div style={{ display: "flex", gap: 4, background: CREAM, borderRadius: 8, padding: 4, border: "1px solid " + BORDER }}>
              <button onClick={function() { stopContinuous(); setVoiceMode(false); }} style={{ padding: "6px 14px", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 700, fontFamily: "'Georgia', serif", background: !voiceMode && !continuousMode ? GOLD : "transparent", color: !voiceMode && !continuousMode ? "#fff" : STONE, transition: "all 0.15s" }}>Text</button>
              <button onClick={function() { setContinuousMode(false); continuousRef.current = false; setVoiceMode(true); }} style={{ padding: "6px 14px", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 700, fontFamily: "'Georgia', serif", background: voiceMode && !continuousMode ? GOLD : "transparent", color: voiceMode && !continuousMode ? "#fff" : STONE, transition: "all 0.15s" }}>🎙 Voice</button>
            </div>
          )}
          {isActive && (
            <button onClick={function() { setAudioMuted(function(m) { if (!m && audioRef.current) { audioRef.current.pause(); } return !m; }); }} style={{ padding: "6px 12px", border: "1px solid " + BORDER, borderRadius: 8, background: "transparent", color: audioMuted ? STONE_LIGHT : STONE, fontSize: 12, cursor: "pointer", fontFamily: "'Georgia', serif" }}>
              {audioMuted ? "🔇" : "🔊"}
            </button>
          )}
          <select style={Object.assign({}, styles.select, { width: 130 })} value={mode} onChange={function(e) { setMode(e.target.value); }}>
            <option value="fast">Fast Mode</option>
            <option value="deep">Deep Mode</option>
          </select>
        </div>
      </div>

      {/* Poro identity card */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20, padding: "14px 20px", background: CHARCOAL, borderRadius: 12 }}>
        <div style={{ width: 46, height: 46, borderRadius: "50%", background: GOLD, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0, color: "#fff", fontWeight: 700, fontFamily: "'Georgia', serif", position: "relative" }}>
          ✝
          {isSpeaking && <div style={{ position: "absolute", inset: -4, borderRadius: "50%", border: "2px solid " + GOLD, animation: "pulse 1.2s infinite", opacity: 0.6 }} />}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#fff", fontFamily: "'Georgia', serif" }}>Poro</div>
          <div style={{ fontSize: 12, color: STONE_LIGHT }}>
            {continuousMode
              ? (isSpeaking ? "Speaking..." : isListening ? "Listening..." : loading ? "Thinking..." : "Ready...")
              : "AI Pastoral Advisor · Biblically grounded"}
          </div>
        </div>
        {messages.length > 1 && (
          <button onClick={handleReset} style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.15)", color: STONE_LIGHT, borderRadius: 6, padding: "5px 12px", fontSize: 11, cursor: "pointer", fontFamily: "'Georgia', serif" }}>New</button>
        )}
      </div>

      {/* Conversation */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 16 }}>
        {messages.map(function(msg, i) {
          var isUser = msg.role === "user";
          return (
            <div key={i} style={{ display: "flex", justifyContent: isUser ? "flex-end" : "flex-start" }}>
              <div style={{ maxWidth: "82%", padding: "12px 16px", borderRadius: isUser ? "12px 12px 4px 12px" : "12px 12px 12px 4px", backgroundColor: isUser ? GOLD : WARM_WHITE, border: isUser ? "none" : "1px solid " + BORDER, color: isUser ? "#fff" : CHARCOAL, fontSize: 14, lineHeight: 1.75, fontFamily: "'Georgia', serif", whiteSpace: "pre-wrap" }}>
                {!isUser && <div style={{ fontSize: 10, fontWeight: 700, color: GOLD, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Poro</div>}
                {msg.text}
              </div>
            </div>
          );
        })}
        {loading && (
          <div style={{ display: "flex", justifyContent: "flex-start" }}>
            <div style={{ padding: "12px 16px", borderRadius: "12px 12px 12px 4px", backgroundColor: WARM_WHITE, border: "1px solid " + BORDER, fontSize: 14, color: STONE_LIGHT, fontStyle: "italic", fontFamily: "'Georgia', serif" }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: GOLD, textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 4 }}>Poro</span>
              Poro is reflecting...
            </div>
          </div>
        )}
        {transcript && (
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <div style={{ maxWidth: "82%", padding: "10px 14px", borderRadius: "12px 12px 4px 12px", backgroundColor: GOLD_PALE, border: "1px solid " + GOLD, color: STONE, fontSize: 13, fontFamily: "'Georgia', serif", fontStyle: "italic" }}>
              {transcript}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {error && <div style={styles.errorPanel}>{"\u26A0 "}{error}</div>}
      {showUpgradeMessage && (
        <div style={{ background: "#fff3e0", border: "1px solid #e0c48f", borderRadius: 10, padding: 14, marginBottom: 12, color: "#6b4b16" }}>
          <div style={{ fontWeight: "bold", marginBottom: 6 }}>Deep mode is not available on the free plan.</div>
          <div style={{ fontSize: 14, lineHeight: 1.6, marginBottom: 12 }}>Upgrade your plan to unlock Deep Mode.</div>
          <button onClick={function() { setShowUpgradeModal(true); }} style={{ background: "#b8860b", color: "#fff", border: "none", borderRadius: 8, padding: "10px 14px", cursor: "pointer", fontWeight: "bold" }}>Upgrade Now</button>
        </div>
      )}

      {/* Input area */}
      {!loading && (
        continuousMode ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, padding: "20px 0" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ width: 80, height: 80, borderRadius: "50%", background: isListening ? "#C0392B" : isSpeaking ? GOLD : GOLD, border: "none", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, boxShadow: isListening ? "0 0 0 8px rgba(192,57,43,0.2)" : "0 4px 16px rgba(184,134,11,0.3)" }}>
                {isListening ? "👂" : isSpeaking ? "🔊" : "✝"}
              </div>
            </div>
            <div style={{ fontSize: 13, color: STONE, fontFamily: "'Georgia', serif", textAlign: "center" }}>
              {isListening ? "Listening — speak now" : isSpeaking ? "Poro is speaking..." : loading ? "Poro is thinking..." : "Waiting..."}
            </div>
            <button onClick={stopContinuous} style={{ padding: "10px 24px", borderRadius: 8, border: "1.5px solid #C0392B", background: "transparent", color: "#C0392B", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Georgia', serif" }}>
              End Conversation
            </button>
          </div>
        ) : voiceMode ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, padding: "16px 0" }}>
            {voiceSupported && (
              <button onClick={startContinuous} style={{ padding: "14px 32px", borderRadius: 30, border: "none", background: GOLD, color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'Georgia', serif", boxShadow: "0 4px 16px rgba(184,134,11,0.35)", marginBottom: 8 }}>
                🎙 Start Hands-Free Conversation
              </button>
            )}
            <div style={{ fontSize: 12, color: STONE_LIGHT, textAlign: "center" }}>Or tap the mic to speak one message at a time</div>
            <button onClick={toggleManualListening} style={{ width: 60, height: 60, borderRadius: "50%", background: isListening ? "#C0392B" : CREAM, border: "1.5px solid " + (isListening ? "#C0392B" : BORDER), cursor: "pointer", fontSize: 22, display: "flex", alignItems: "center", justifyContent: "center" }}>
              {isListening ? "⏹" : "🎙"}
            </button>
            {transcript && (
              <div style={{ width: "100%", maxWidth: 480 }}>
                <div style={{ background: CREAM, border: "1px solid " + BORDER, borderRadius: 10, padding: "12px 16px", fontSize: 14, color: CHARCOAL, fontFamily: "'Georgia', serif", marginBottom: 8 }}>{transcript}</div>
                <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
                  <button onClick={function() { setTranscript(""); }} style={{ padding: "7px 14px", border: "1px solid " + BORDER, borderRadius: 8, background: "transparent", color: STONE, fontSize: 12, cursor: "pointer", fontFamily: "'Georgia', serif" }}>Clear</button>
                  <button onClick={function() { var t = transcript; setTranscript(""); sendMessage(t); }} style={{ padding: "7px 18px", border: "none", borderRadius: 8, background: GOLD, color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "'Georgia', serif" }}>Send to Poro</button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div style={{ display: "flex", gap: 10 }}>
            <input style={Object.assign({}, styles.input, { flex: 1 })} value={followUp} onChange={function(e) { setFollowUp(e.target.value); }} onKeyDown={function(e) { if (e.key === "Enter") handleFollowUp(); }} placeholder="Ask Poro anything..." />
            <Button onClick={handleFollowUp} disabled={!followUp.trim()}>Send</Button>
          </div>
        )
      )}

      {showUpgradeModal && <UpgradeModal onClose={function() { setShowUpgradeModal(false); }} />}
    </div>
  );
}

// ─── TOPIC ENGINE ─────────────────────────────────────────────────────────────

function TopicEngineScreen({ setForgePrefill, setCurrentScreen, language, voiceProfile, onRequestVoiceProfile, congregationProfile, congregationEnabled, onToggleCongregation }) {
  const [theme, setTheme] = useState("");
  const [season, setSeason] = useState("General");
  const [count, setCount] = useState("5");
  const [topics, setTopics] = useState([]);
  const [rawResult, setRawResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showUpgradeMessage, setShowUpgradeMessage] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const handleGenerate = useCallback(async function() {
    setError(""); setShowUpgradeMessage(false); setTopics([]); setRawResult(null);
    if (!theme.trim()) { setError("Please enter a theme or keyword."); return; }
    const currentUsage = loadUsage();
    const usageCheck = canUseTool(CURRENT_USER.plan || "free", currentUsage, "fast");
    if (!usageCheck.ok) { setError(usageCheck.message); setShowUpgradeMessage(true); return; }
    const toolCheck = canUseToolFeature(CURRENT_USER.plan || "free", "topicEngine", currentUsage.topicEngine_used || 0);
    if (!toolCheck.ok) { setError(toolCheck.message); setShowUpgradeMessage(true); return; }
    setLoading(true);
    const languageName = getLanguageName(language || "en");
    var voiceContext = buildVoiceContext(voiceProfile);
    var congregationContext = buildCongregationContext(congregationProfile);
    try {
      var sys =
        (voiceContext ? voiceContext + "\n\n" : "") +
        (congregationContext ? congregationContext + "\n\n" : "") +
        "You are an expert sermon topic generator. Write all output in " + languageName + ". Return ONLY pipe-separated lines, one topic per line, nothing else. Format: TITLE|SCRIPTURE|SUMMARY|ANGLE";
      var prompt =
        "Generate " + count + " sermon topic ideas.\n" +
        "Theme: " + theme + "\n" +
        "Season: " + season + "\n" +
        "Language: " + languageName + "\n\n" +
        "Return ONLY " + count + " lines in this exact format (no numbering, no markdown):\n" +
        "TITLE|SCRIPTURE REFERENCE|ONE SENTENCE SUMMARY|PREACHING ANGLE";
      var raw = "";
      await callSermonAPI(prompt, sys, false, function(acc) { raw = acc; });
      var lines = raw.split("\n").map(function(l) { return l.trim(); }).filter(function(l) { return l && l.includes("|"); });
      var parsedTopics = lines.map(function(line) {
        var parts = line.split("|");
        return { title: (parts[0] || "").trim(), scripture: (parts[1] || "").trim(), summary: (parts[2] || "").trim(), angle: (parts[3] || "").trim() };
      }).filter(function(t) { return t.title; });
      setTopics(parsedTopics);
      setRawResult(raw);
      if (!parsedTopics.length) { setError("No topics were returned. Please try again."); }
      incrementUsage("fast");
      incrementUsage("topicEngine");
    } catch (e) {
      setError(e.message || "An error occurred.");
    } finally { setLoading(false); }
  }, [theme, season, count, language, voiceProfile]);

  var showRawFallback = rawResult !== null && topics.length === 0 && !loading;

  return (
    <div>
      <div style={styles.sectionSub}>Generate compelling sermon topic ideas with Scripture anchors.</div>
      <CongregationToggle enabled={congregationEnabled} onToggle={onToggleCongregation} hasProfile={!!congregationProfile} />
      <div style={styles.card}>
        <div style={styles.grid2}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Theme or Keyword</label>
            <input style={styles.input} value={theme} onChange={function(e) { setTheme(e.target.value); }} onKeyDown={function(e) { if (e.key === "Enter") onRequestVoiceProfile(handleGenerate); }} placeholder="e.g. Forgiveness, Identity, Family" />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Season / Context</label>
            <select style={styles.select} value={season} onChange={function(e) { setSeason(e.target.value); }}>
              {["General", "Advent", "Easter", "Pentecost", "New Year", "Summer", "Missions"].map(function(s) { return <option key={s} value={s}>{s}</option>; })}
            </select>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <select style={Object.assign({}, styles.select, { width: 130 })} value={count} onChange={function(e) { setCount(e.target.value); }}>
            {["3", "5", "7", "10"].map(function(n) { return <option key={n} value={n}>{n} Topics</option>; })}
          </select>
          <Button onClick={function() { onRequestVoiceProfile(handleGenerate); }} disabled={loading}>{loading ? "Generating..." : "Generate Topics"}</Button>
          <ToolUsageBadge toolKey="topicEngine" usedKey="topicEngine_used" />
        </div>
      </div>
      {error && <div style={styles.errorPanel}>{"\u26A0 "}{error}</div>}
      {showUpgradeMessage && (
        <div style={{ background: "#fff3e0", border: "1px solid #e0c48f", borderRadius: 10, padding: 14, marginTop: 12, color: "#6b4b16" }}>
          <div style={{ fontWeight: "bold", marginBottom: 6 }}>Upgrade required</div>
          <div style={{ marginBottom: 10 }}>Deep mode is available on a paid plan.</div>
          <button onClick={function() { setShowUpgradeModal(true); }} style={{ background: "#b8860b", color: "#fff", border: "none", borderRadius: 8, padding: "10px 14px", cursor: "pointer", fontWeight: "bold" }}>Upgrade Now</button>
        </div>
      )}
      {loading && <div style={styles.outputPanel}><span style={{ color: STONE_LIGHT, fontStyle: "italic" }}>Generating topics...</span></div>}
      {topics.length > 0 && (
        <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 14 }}>
          {topics.map(function(t, i) {
            return (
              <div key={i} style={styles.card}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 16, color: CHARCOAL, marginBottom: 4 }}>{t.title || ("Topic " + (i + 1))}</div>
                    {t.scripture && <div style={{ fontSize: 13, color: GOLD, marginBottom: 6 }}>{"\uD83D\uDCDA "}{t.scripture}</div>}
                    {t.summary && <div style={{ fontSize: 14, color: STONE, lineHeight: 1.6 }}>{t.summary}</div>}
                    {t.angle && <div style={{ fontSize: 13, color: STONE_LIGHT, marginTop: 6, fontStyle: "italic" }}>Angle: {t.angle}</div>}
                    <div style={{ marginTop: 10 }}>
                      <button type="button" onClick={function() { setForgePrefill({ title: t.title || "", scripture: t.scripture || "", angle: t.angle || "" }); setCurrentScreen("sermon-forge"); }} style={{ background: GOLD, color: "#fff", border: "none", borderRadius: 8, padding: "8px 12px", fontWeight: 700, cursor: "pointer" }}>Generate Sermon</button>
                    </div>
                  </div>
                  <span style={Object.assign({}, styles.tag, styles.tagGold, { flexShrink: 0 })}>{"#" + (i + 1)}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {showRawFallback && <div style={styles.outputPanel}>{typeof rawResult === "string" ? rawResult : JSON.stringify(rawResult, null, 2)}</div>}
      {showUpgradeModal && <UpgradeModal onClose={function() { setShowUpgradeModal(false); }} />}
    </div>
  );
}

// ─── SHARE MODAL ─────────────────────────────────────────────────────────────

function ShareModal({ url, onClose }) {
  const [copyStatus, setCopyStatus] = useState("");
  const [availabilityModal, setAvailabilityModal] = useState(null);
  const [blockDate, setBlockDate] = useState("");

  function handleCopy() {
    navigator.clipboard.writeText(url).then(function() {
      setCopyStatus("Copied!");
      setTimeout(function() { setCopyStatus(""); }, 2000);
    });
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: 16 }}>
      <div style={{ background: WARM_WHITE, borderRadius: 16, padding: "32px 28px", width: "100%", maxWidth: 480, boxShadow: "0 8px 40px rgba(0,0,0,0.25)", fontFamily: "'Georgia', serif" }}>
        <div style={{ fontWeight: 700, fontSize: 18, color: CHARCOAL, marginBottom: 6 }}>Sermon Shared ✓</div>
        <div style={{ fontSize: 13, color: STONE, marginBottom: 20, lineHeight: 1.6 }}>
          Anyone with this link can read your sermon. No login required.
        </div>
        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          <input
            readOnly
            value={url}
            style={{ flex: 1, padding: "10px 14px", border: "1px solid " + BORDER, borderRadius: 8, backgroundColor: IVORY, fontSize: 13, color: CHARCOAL, fontFamily: "'Georgia', serif", outline: "none" }}
            onFocus={function(e) { e.target.select(); }}
          />
          <button
            onClick={handleCopy}
            style={{ padding: "10px 18px", borderRadius: 8, border: "none", background: copyStatus ? "#27AE60" : GOLD, color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "'Georgia', serif", whiteSpace: "nowrap", transition: "background 0.15s" }}
          >
            {copyStatus || "Copy Link"}
          </button>
        </div>
        <div style={{ fontSize: 12, color: STONE_LIGHT, marginBottom: 20 }}>
          The shared page includes your sermon, scripture, name, church, and date — with SermonCraft Pro branding.
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <a href={url} target="_blank" rel="noopener noreferrer" style={{ padding: "9px 18px", borderRadius: 8, border: "1px solid " + BORDER, background: "transparent", color: STONE, fontWeight: 700, fontSize: 13, textDecoration: "none", fontFamily: "'Georgia', serif" }}>
            Preview
          </a>
          <button onClick={onClose} style={{ padding: "9px 18px", borderRadius: 8, border: "none", background: CHARCOAL, color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "'Georgia', serif" }}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── SERMON FORGE ─────────────────────────────────────────────────────────────

function SermonForgeScreen({ onSave, prefill, language, onMultiply, voiceProfile, onRequestVoiceProfile, currentUser, congregationProfile, congregationEnabled, onToggleCongregation }) {
  const { daysLeft, urgencyColor, sermonDate } = useSundayCountdown();
  const [title, setTitle] = useState(prefill?.title || "");
  const [scripture, setScripture] = useState(prefill?.scripture || "");
  const [angle, setAngle] = useState(prefill?.angle || "");
  const [audience, setAudience] = useState("General Congregation");
  const [bibleVersion, setBibleVersion] = useState("NIV");
  const [mode, setMode] = useState("deep");
  const [duration, setDuration] = useState("30");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showUpgradeMessage, setShowUpgradeMessage] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [copyStatus, setCopyStatus] = useState("");
  const [availabilityModal, setAvailabilityModal] = useState(null);
  const [blockDate, setBlockDate] = useState("");
  const [shareLoading, setShareLoading] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [showShareModal, setShowShareModal] = useState(false);
  const abortControllerRef = useRef(null);

  const [illLoading, setIllLoading] = useState(false);
  const [illToInsert, setIllToInsert] = useState(prefill?.illustrationToInsert || "");

  useEffect(function() {
    if (prefill) {
      setTitle(prefill.title || "");
      setScripture(prefill.scripture || "");
      setAngle(prefill.angle || "");
      setIllToInsert(prefill.illustrationToInsert || "");
      setOutput(""); setError(""); setShowUpgradeMessage(false); setCopyStatus("");
    }
  }, [prefill]);

  // Cleanup abort controller on unmount
  useEffect(function() {
    return function() {
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, []);

  const cleanedOutput = cleanAIText(output).replace(/\*\*/g, "").replace(/\*/g, "").replace(/END OF SERMON/g, "").trim();

  function handleCancel() {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setLoading(false);
  }

  const handleForge = useCallback(async function() {
    if (!title.trim() && !scripture.trim()) { setError("Please provide a title or scripture reference."); return; }
    setError(""); setShowUpgradeMessage(false); setLoading(true); setOutput("");
    const currentUsage = loadUsage();
    const usageCheck = canUseTool(CURRENT_USER.plan || "free", currentUsage, mode);
    if (!usageCheck.ok) { setLoading(false); setError(usageCheck.message); setShowUpgradeMessage(true); return; }
    const languageName = getLanguageName(language || "en");
    const preferredBibleVersion = bibleVersion !== "NIV" ? bibleVersion : getPreferredBibleVersion(language || "en");
    var voiceContext = buildVoiceContext(voiceProfile);
    // Remove length preference from voice context — sermon forge controls sermon length directly
    voiceContext = voiceContext.replace(/Sermon length preference:[^.]+\./g, "").trim();

    abortControllerRef.current = new AbortController();

    try {
      var sys =
        (voiceContext ? voiceContext + "\n\n" : "") +
        "You are an expert sermon writer with deep theological training and 30 years of preaching experience. " +
        "Write the ENTIRE sermon in " + languageName + ". Do not use any other language. " +
        "Write a well-developed sermon appropriate for the requested duration. " +
        "Each sermon must be detailed, rich with biblical exposition, illustrations, stories, application points, and pastoral warmth. " +
        "When quoting or referencing scripture, always use the " + preferredBibleVersion + " translation. " +
        "Do not summarize or abbreviate any section. Write every point in full. " +
        "Do not stop mid-sermon under any circumstances. End with the exact words: END OF SERMON.";
      var prompt =
        "Write a complete, manuscript-length sermon suitable for a 60-minute Sunday service.\n" +
        "Output Language: " + languageName + " — write everything in " + languageName + ".\n" +
        "Title: " + (title || "(untitled)") + "\n" +
        "Scripture: " + (scripture || "(none specified)") + "\n" +
        "Bible Version: " + preferredBibleVersion + "\n" +
        "Angle/Focus: " + (angle || "general") + "\n" +
        "Audience: " + audience + "\n\n" +
        "Requirements:\n" +
        "1. Write the ENTIRE sermon in " + languageName + ".\n" +
        "2. Write a full introduction (at least 3-4 paragraphs).\n" +
        "3. Write exactly 3 main body points each with exposition, illustration, and application.\n" +
        "4. Write a full conclusion with call to action and closing prayer.\n" +
        "5. Finish with the exact words: END OF SERMON";

      var result = await callSermonAPI(prompt, sys, mode === "deep", function(accumulated) { setOutput(accumulated); }, abortControllerRef.current.signal);
      incrementUsage(mode);

      // Auto-save as draft when generation completes
      if (result && result.length > 500) {
        var cleanedContent = cleanAIText(result).replace(/\*\*/g, "").replace(/\*/g, "").replace(/END OF SERMON/g, "").trim();
        onSave({
          title: title.trim() || "Untitled Sermon",
          scripture: scripture.trim(),
          content: cleanedContent,
          savedAt: new Date().toLocaleDateString(),
          tags: [],
          sourceTool: "sermon-forge",
          sourceTopic: angle.trim() || title.trim() || "",
          seriesId: null,
          seriesTitle: null,
          seriesWeek: null,
          status: "draft",
        });
      }
    } catch (e) {
      if (e.name === "AbortError") {
        // User cancelled — don't show error
      } else {
        setError(e.message || "Failed to fetch");
      }
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
      // Auto-save whatever was generated if long enough
      var currentOutput = output;
      if (currentOutput && currentOutput.length > 500) {
        var cleanedContent = cleanAIText(currentOutput).replace(/\*\*/g, "").replace(/\*/g, "").replace(/END OF SERMON/g, "").trim();
        onSave({ title: title.trim() || "Untitled Sermon", scripture: scripture.trim(), content: cleanedContent, savedAt: new Date().toLocaleDateString(), tags: [], sourceTool: "sermon-forge", sourceTopic: angle.trim() || title.trim() || "", seriesId: null, seriesTitle: null, seriesWeek: null, status: "draft" });
      }
    }
  }, [title, scripture, angle, audience, bibleVersion, mode, duration, language, voiceProfile, onSave, output]);

  const handleSave = useCallback(function() {
    if (!output || loading) return;
    if (!output || output.length < 100) { setError("Sermon is not complete yet. Please wait until generation finishes."); return; }
    var cleanedContent = cleanAIText(output).replace(/\*\*/g, "").replace(/\*/g, "").replace(/END OF SERMON/g, "").trim();
    onSave({ title: title.trim() || "Untitled Sermon", scripture: scripture.trim(), content: cleanedContent, savedAt: new Date().toLocaleDateString(), tags: [], sourceTool: "sermon-forge", sourceTopic: angle.trim() || title.trim() || "", seriesId: null, seriesTitle: null, seriesWeek: null });
  }, [output, loading, title, scripture, angle, onSave]);

  const handleCopySermon = useCallback(async function() {
    if (!cleanedOutput) return;
    const isPaid = CURRENT_USER.plan && CURRENT_USER.plan !== "free";
    const branding = isPaid ? "" : "\n\n— Created with SermonCraft Pro (sermoncraftpro.com)";
    try {
      await navigator.clipboard.writeText(cleanedOutput + branding);
      setCopyStatus("Copied");
      setTimeout(function() { setCopyStatus(""); }, 2000);
    } catch (e) { setCopyStatus("Copy failed"); setTimeout(function() { setCopyStatus(""); }, 2500); }
  }, [cleanedOutput]);

  const handleDownloadPDF = useCallback(function() {
    if (!cleanedOutput) return;
    var printWindow = window.open("", "_blank", "width=900,height=700");
    if (!printWindow) { setError("Popup was blocked. Please allow popups and try again."); return; }
    var sermonTitle = (title || "Untitled Sermon").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    var sermonScripture = (scripture || "").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    var sermonBody = cleanedOutput.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br/>");
    var html = "<!DOCTYPE html><html><head><title>" + sermonTitle + "</title><style>body{font-family:Arial,sans-serif;padding:40px;color:#111;line-height:1.6;}h1{font-size:28px;margin-bottom:8px;}.meta{margin-bottom:24px;color:#444;font-size:14px;}.content{white-space:normal;font-size:16px;}@media print{body{padding:24px;}}</style></head><body><h1>" + sermonTitle + "</h1><div class='meta'>" + (sermonScripture ? "<div><strong>Scripture:</strong> " + sermonScripture + "</div>" : "") + "<div><strong>Bible Version:</strong> " + bibleVersion + "</div><div><strong>Audience:</strong> " + audience + "</div><div><strong>Generated:</strong> " + new Date().toLocaleString() + "</div></div><div class='content'>" + sermonBody + "</div><script>window.onload=function(){window.print();}<\/script></body></html>";
    printWindow.document.open(); printWindow.document.write(html); printWindow.document.close();
  }, [cleanedOutput, title, scripture, audience, bibleVersion]);

  const handleDownloadDOCX = useCallback(async function() {
    if (!cleanedOutput) return;
    try {
      const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } = await import("docx");
      const { saveAs } = await import("file-saver");
      var sermonTitle = title || "Untitled Sermon";
      var paragraphs = [
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text: sermonTitle, bold: true, size: 36, font: "Georgia" })], spacing: { after: 200 } }),
        ...(scripture ? [new Paragraph({ children: [new TextRun({ text: "Scripture: ", bold: true, size: 24, font: "Georgia" }), new TextRun({ text: scripture + " (" + bibleVersion + ")", size: 24, font: "Georgia" })], spacing: { after: 100 } })] : []),
        new Paragraph({ children: [new TextRun({ text: "Generated: ", bold: true, size: 24, font: "Georgia" }), new TextRun({ text: new Date().toLocaleString(), size: 24, font: "Georgia" })], spacing: { after: 400 } }),
        ...cleanedOutput.split("\n").map(function(line) {
          var trimmed = line.trim();
          return new Paragraph({ children: [new TextRun({ text: trimmed || "", size: 24, font: "Georgia" })], spacing: { after: trimmed ? 160 : 100 }, alignment: AlignmentType.LEFT });
        }),
      ];
      var doc = new Document({ styles: { default: { document: { run: { font: "Georgia", size: 24 } } } }, sections: [{ properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } }, children: paragraphs }] });
      var buffer = await Packer.toBlob(doc);
      saveAs(buffer, (sermonTitle + ".docx").replace(/[^a-z0-9.\s]/gi, "_"));
    } catch (e) { setError("Failed to generate Word document: " + e.message); }
  }, [cleanedOutput, title, scripture, audience, bibleVersion]);

  const handleShare = useCallback(async function() {
    if (!cleanedOutput) return;
    setShareLoading(true);
    setError("");
    try {
      var slug = await shareSermon({
        title: title || "Untitled Sermon",
        scripture: scripture || "",
        content: cleanedOutput,
        pastorName: currentUser?.name || "",
        churchName: currentUser?.church || "",
        sermonDate: new Date().toLocaleDateString(),
      });
      var base = window.location.hostname === "localhost" ? "https://app.sermoncraftpro.com" : (window.location.origin);
      setShareUrl(base + "/share/" + slug);
      setShowShareModal(true);
    } catch (e) {
      setError("Failed to create share link: " + (e.message || "Unknown error"));
    } finally {
      setShareLoading(false);
    }
  }, [cleanedOutput, title, scripture, currentUser]);

  var isPaid = CURRENT_USER.plan && CURRENT_USER.plan !== "free";

  return (
    <div>
      <div style={styles.sectionSub}>Craft complete, polished sermons powered by deep theological AI.</div>
      <CongregationToggle enabled={congregationEnabled} onToggle={onToggleCongregation} hasProfile={!!congregationProfile} />
      {daysLeft <= 6 && (
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 14px", borderRadius: 20, background: daysLeft <= 1 ? "#FFF5F5" : daysLeft <= 3 ? "#FFF8F0" : GOLD_PALE, border: "1px solid " + urgencyColor, marginBottom: 16 }}>
          <span style={{ fontSize: 18, fontWeight: 900, color: urgencyColor, fontFamily: "'Georgia', serif" }}>{daysLeft}</span>
          <span style={{ fontSize: 12, color: urgencyColor, fontWeight: 700 }}>
            {daysLeft === 0 ? "Today is Sunday!" : daysLeft === 1 ? "day until service" : "days until service"}
          </span>
          <span style={{ fontSize: 11, color: STONE_LIGHT }}>
            · {sermonDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </span>
        </div>
      )}
      <div style={styles.card}>
        <div style={styles.grid2}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Sermon Title</label>
            <input style={styles.input} value={title} onChange={function(e) { setTitle(e.target.value); }} placeholder="e.g. Walking in the Light" />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Scripture Reference</label>
            <input style={styles.input} value={scripture} onChange={function(e) { setScripture(e.target.value); }} placeholder="e.g. John 8:12" />
          </div>
        </div>
        <div style={styles.inputGroup}>
          <label style={styles.label}>Sermon Angle / Focus</label>
          <textarea style={styles.textarea} value={angle} onChange={function(e) { setAngle(e.target.value); }} placeholder="What specific message or takeaway should this sermon deliver?" rows={2} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <select style={Object.assign({}, styles.select, { width: 200 })} value={audience} onChange={function(e) { setAudience(e.target.value); }}>
            {["General Congregation", "Youth Ministry", "New Believers", "Men's Ministry", "Women's Ministry", "Leadership/Elders", "Outreach/Evangelism"].map(function(a) { return <option key={a} value={a}>{a}</option>; })}
          </select>
          <select style={Object.assign({}, styles.select, { width: 160 })} value={bibleVersion} onChange={function(e) { setBibleVersion(e.target.value); }}>
            {["KJV", "NIV", "ESV", "NKJV", "NLT", "NASB", "AMP", "MSG"].map(function(v) { return <option key={v} value={v}>{v}</option>; })}
          </select>
          <select style={Object.assign({}, styles.select, { width: 120 })} value={duration} onChange={function(e) { setDuration(e.target.value); }}>
            {["20","30","40","50","60"].map(function(d) { return <option key={d} value={d}>{d} min</option>; })}
          </select>
          <select style={Object.assign({}, styles.select, { width: 140 })} value={mode} onChange={function(e) { setMode(e.target.value); }}>
            <option value="fast">Fast Mode</option>
            <option value="deep">Deep Mode</option>
          </select>
          <Button onClick={function() { onRequestVoiceProfile(handleForge); }} disabled={loading}>{loading ? "Forging..." : "Forge Sermon"}</Button>
          {loading && (
            <button
              onClick={handleCancel}
              style={{ padding: "10px 18px", borderRadius: 8, border: "1.5px solid #C0392B", background: "transparent", color: "#C0392B", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "'Georgia', serif" }}
            >
              Stop
            </button>
          )}
        </div>
      </div>
      {error && <div style={styles.errorPanel}>{"\u26A0 "}{error}</div>}
      {showUpgradeMessage && (
        <div style={{ background: "#fff3e0", border: "1px solid #e0c48f", borderRadius: 10, padding: 14, marginTop: 12, marginBottom: 12, color: "#6b4b16" }}>
          <div style={{ fontWeight: "bold", marginBottom: 6 }}>Deep mode is not available on the free plan.</div>
          <div style={{ fontSize: 14, lineHeight: 1.6, marginBottom: 12 }}>Upgrade your plan to unlock Deep Mode in Sermon Forge.</div>
          <button onClick={function() { setShowUpgradeModal(true); }} style={{ background: "#b8860b", color: "#fff", border: "none", borderRadius: 8, padding: "10px 14px", cursor: "pointer", fontWeight: "bold" }}>Upgrade Now</button>
        </div>
      )}
      <OutputPanel text={cleanedOutput} loading={loading} error={""} />
      {illToInsert && !loading && (
        <div style={{ marginTop: 12, padding: "14px 18px", background: GOLD_PALE, border: "1px solid " + GOLD_BORDER, borderRadius: 10 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: GOLD, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>Illustration Ready to Insert</div>
          <div style={{ fontSize: 13, color: STONE, marginBottom: 10, lineHeight: 1.5 }}>{illToInsert.slice(0, 200)}{illToInsert.length > 200 ? "..." : ""}</div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={function() {
              if (cleanedOutput) {
                setOutput(function(prev) { return cleanAIText(prev) + "\n\n--- ILLUSTRATION ---\n\n" + illToInsert; });
              }
              setIllToInsert("");
            }} style={{ padding: "6px 14px", border: "none", borderRadius: 6, background: GOLD, color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: FONT_BODY }}>
              Insert into Sermon
            </button>
            <button onClick={function() { setIllToInsert(""); }} style={{ padding: "6px 14px", border: "1px solid " + BORDER, borderRadius: 6, background: "transparent", color: STONE, fontSize: 12, cursor: "pointer", fontFamily: FONT_BODY }}>
              Dismiss
            </button>
          </div>
        </div>
      )}
      {!!cleanedOutput && (
        <div style={{ marginTop: 14, marginBottom: 4 }}>
          <div style={{ display: "inline-flex", gap: 4, backgroundColor: CREAM, borderRadius: 8, padding: 4, border: "1px solid " + BORDER, marginBottom: 10 }}>
            {[
              { label: copyStatus === "Copied" ? "Copied ✓" : "Copy", action: handleCopySermon },
              { label: "Download PDF", action: handleDownloadPDF },
              { label: "Download DOCX", action: handleDownloadDOCX },
            ].map(function(btn) {
              return <button key={btn.label} onClick={btn.action} style={{ padding: "6px 16px", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 700, letterSpacing: "0.04em", fontFamily: FONT_BODY, backgroundColor: copyStatus === "Copied" && btn.label.includes("Copy") ? GOLD : "transparent", color: copyStatus === "Copied" && btn.label.includes("Copy") ? "#fff" : STONE, transition: "all 0.15s" }}>{btn.label}</button>;
            })}
            {isPaid && (
              <button
                onClick={handleShare}
                disabled={shareLoading}
                style={{ padding: "6px 16px", border: "none", borderRadius: 6, cursor: shareLoading ? "not-allowed" : "pointer", fontSize: 12, fontWeight: 700, letterSpacing: "0.04em", fontFamily: FONT_BODY, backgroundColor: GOLD_PALE, color: GOLD, opacity: shareLoading ? 0.6 : 1, transition: "all 0.15s" }}
              >
                {shareLoading ? "Sharing..." : "Share Sermon"}
              </button>
            )}
            <button
              onClick={async function() {
                if (!title.trim()) { setError("Please enter a sermon title first."); return; }
                setIllLoading(true);
                try {
                  var sys = "You are a masterful sermon illustrator. Generate 1 compelling illustration for this sermon topic. Write in plain text, no markdown, no asterisks. Format: ILLUSTRATION: [title]\n[story in 2-3 paragraphs]\nApplication: [how it connects]\nScripture: [relevant verse]";
                  var prompt = "Generate 1 illustration for a sermon on: " + title + (scripture ? " (" + scripture + ")" : "");
                  var ill = "";
                  await callSermonAPI(prompt, sys, false, function(acc) { ill = acc; });
                  setOutput(function(prev) {
                    var base = cleanAIText(prev || "");
                    return base + (base ? "\n\n--- ILLUSTRATION ---\n\n" : "") + ill;
                  });
                } catch (e) { setError("Could not generate illustration."); }
                finally { setIllLoading(false); }
              }}
              disabled={illLoading || loading}
              style={{ padding: "6px 16px", border: "none", borderRadius: 6, cursor: illLoading ? "not-allowed" : "pointer", fontSize: 12, fontWeight: 700, fontFamily: FONT_BODY, backgroundColor: "transparent", color: illLoading ? STONE_LIGHT : STONE, transition: "all 0.15s" }}
            >
              {illLoading ? "Generating..." : "＋ Illustration"}
            </button>
          </div>
          {!isPaid && (
            <div style={{ fontSize: 11, color: STONE_LIGHT, marginBottom: 8 }}>
              <span style={{ cursor: "pointer", color: GOLD, fontWeight: 700 }} onClick={function() { setShowUpgradeModal(true); }}>Upgrade to a paid plan</span> to share sermons publicly.
            </div>
          )}
          {onMultiply && (
            <div style={{ marginTop: 4 }}>
              <button onClick={function() { onMultiply({ title: title || "Untitled Sermon", scripture: scripture || "", content: cleanedOutput }); }} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 20px", background: CHARCOAL, color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 700, fontFamily: FONT_BODY }}>Multiply Content</button>
              <div style={{ fontSize: 11, color: STONE_LIGHT, marginTop: 4 }}>Turn this sermon into social hooks, devotionals, small group guides and more</div>
            </div>
          )}
        </div>
      )}
      {showUpgradeModal && <UpgradeModal onClose={function() { setShowUpgradeModal(false); }} />}
      {showShareModal && <ShareModal url={shareUrl} onClose={function() { setShowShareModal(false); }} />}
    </div>
  );
}

// ─── WORD STUDY ───────────────────────────────────────────────────────────────

function WordStudyScreen({ setForgePrefill, setCurrentScreen, language, voiceProfile, onRequestVoiceProfile, congregationProfile, congregationEnabled, onToggleCongregation }) {
  const [word, setWord] = useState("");
  const [verse, setVerse] = useState("");
  const [mode, setMode] = useState("fast");
  const [study, setStudy] = useState(null);
  const [rawResult, setRawResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showUpgradeMessage, setShowUpgradeMessage] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const handleStudy = useCallback(async function() {
    setError(""); setShowUpgradeMessage(false); setStudy(null); setRawResult(null);
    if (!word.trim() && !verse.trim()) { setError("Please enter a word or verse to study."); return; }
    const currentUsage = loadUsage();
    const usageCheck = canUseTool(CURRENT_USER.plan || "free", currentUsage, mode);
    if (!usageCheck.ok) { setError(usageCheck.message); setShowUpgradeMessage(true); return; }
    const toolCheck = canUseToolFeature(CURRENT_USER.plan || "free", "wordStudy", currentUsage.wordStudy_used || 0);
    if (!toolCheck.ok) { setError(toolCheck.message); setShowUpgradeMessage(true); return; }
    setLoading(true);
    const languageName = getLanguageName(language || "en");
    var voiceContext = buildVoiceContext(voiceProfile);
    var congregationContext = buildCongregationContext(congregationProfile);
    try {
      var sys =
        (voiceContext ? voiceContext + "\n\n" : "") +
        (congregationContext ? congregationContext + "\n\n" : "") +
        "You are a biblical scholar. Write all content in " + languageName + ". " +
        "Return ONLY a valid compact JSON object on a single line with these exact keys: word, original, transliteration, definition, uses (array of objects with ref and context, max 3), themes (array of strings, max 4), commentary. Keep commentary under 200 words. No markdown, no code blocks.";
      var prompt =
        "Biblical word study for: " + (word || "word from verse") + "\n" +
        "Verse: " + (verse || "none") + "\n" +
        "Language: " + languageName + "\n" +
        "Return compact single-line JSON only. No line breaks inside the JSON.";
      var raw = await callJSONAPI({ prompt: prompt, sys: sys, mode: mode });
      setRawResult(raw);
      var text = typeof raw === "string" ? raw : JSON.stringify(raw);
      text = text.trim().replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/i, "").trim();
      // Try to extract JSON object if wrapped in other text
      var jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) text = jsonMatch[0];
      var parsed = JSON.parse(text);
      setStudy(parsed);
      incrementUsage(mode);
      incrementUsage("wordStudy");
    } catch (e) {
      setError(e.message || "An error occurred.");
    } finally { setLoading(false); }
  }, [word, verse, mode, language, voiceProfile]);

  var showRawFallback = rawResult !== null && !study && !loading;

  return (
    <div>
      <div style={styles.sectionSub}>Explore the original Hebrew and Greek meanings of Scripture.</div>
      <CongregationToggle enabled={congregationEnabled} onToggle={onToggleCongregation} hasProfile={!!congregationProfile} />
      <div style={styles.card}>
        <div style={styles.grid2}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Word or Concept</label>
            <input style={styles.input} value={word} onChange={function(e) { setWord(e.target.value); }} onKeyDown={function(e) { if (e.key === "Enter") onRequestVoiceProfile(handleStudy); }} placeholder="e.g. Grace, Shalom, Logos" />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Verse Reference (optional)</label>
            <input style={styles.input} value={verse} onChange={function(e) { setVerse(e.target.value); }} placeholder="e.g. John 1:1" />
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <select style={Object.assign({}, styles.select, { width: 120 })} value={duration} onChange={function(e) { setDuration(e.target.value); }}>
            {["20","30","40","50","60"].map(function(d) { return <option key={d} value={d}>{d} min</option>; })}
          </select>
          <select style={Object.assign({}, styles.select, { width: 140 })} value={mode} onChange={function(e) { setMode(e.target.value); }}>
            <option value="fast">Fast Mode</option>
            <option value="deep">Deep Mode</option>
          </select>
          <Button onClick={function() { onRequestVoiceProfile(handleStudy); }} disabled={loading}>{loading ? "Studying..." : "Study Word"}</Button>
          <ToolUsageBadge toolKey="wordStudy" usedKey="wordStudy_used" />
        </div>
      </div>
      {error && <div style={styles.errorPanel}>{"\u26A0 "}{error}</div>}
      {showUpgradeMessage && (
        <div style={{ background: "#fff3e0", border: "1px solid #e0c48f", borderRadius: 10, padding: 14, marginTop: 12, marginBottom: 12, color: "#6b4b16" }}>
          <div style={{ fontWeight: "bold", marginBottom: 6 }}>Upgrade Required</div>
          <div style={{ fontSize: 14, lineHeight: 1.6, marginBottom: 12 }}>Advanced word study is available on paid plans.</div>
          <button onClick={function() { setShowUpgradeModal(true); }} style={{ background: "#b8860b", color: "white", border: "none", borderRadius: 8, padding: "10px 14px", cursor: "pointer", fontWeight: "bold" }}>Upgrade Now</button>
        </div>
      )}
      {loading && <div style={styles.outputPanel}><span style={{ color: STONE_LIGHT, fontStyle: "italic" }}>Analyzing scripture...</span></div>}
      {study && (
        <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={styles.card}>
            <div style={{ fontSize: 22, fontWeight: 700, color: CHARCOAL, marginBottom: 4 }}>{study.word || word}</div>
            {study.original && <div style={{ fontSize: 18, color: GOLD, marginBottom: 4 }}>{study.original}{study.transliteration && <span style={{ fontSize: 14, color: STONE_LIGHT }}>{" (" + study.transliteration + ")"}</span>}</div>}
            {study.definition && <div style={{ fontSize: 15, color: STONE, lineHeight: 1.7, marginBottom: 12 }}>{study.definition}</div>}
            {study.commentary && <div><div style={styles.label}>Commentary</div><div style={{ fontSize: 14, color: CHARCOAL, lineHeight: 1.7 }}>{study.commentary}</div></div>}
          </div>
          {Array.isArray(study.uses) && study.uses.length > 0 && (
            <div style={styles.card}>
              <div style={styles.cardTitle}>Key Uses in Scripture</div>
              <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 10 }}>
                {study.uses.map(function(u, i) {
                  return <div key={i} style={{ padding: "10px 14px", backgroundColor: CREAM, borderRadius: 8, borderLeft: "3px solid " + GOLD }}><div style={{ fontWeight: 600, color: GOLD, fontSize: 13 }}>{u.reference}</div><div style={{ fontSize: 14, color: STONE, marginTop: 2 }}>{u.context}</div></div>;
                })}
              </div>
            </div>
          )}
          {Array.isArray(study.themes) && study.themes.length > 0 && (
            <div style={styles.card}>
              <div style={styles.cardTitle}>Themes</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
                {study.themes.map(function(themeItem, i) {
                  return <span key={i} onClick={function() { setForgePrefill({ title: themeItem, scripture: verse || "", angle: "Study focus: " + themeItem }); setCurrentScreen("sermon-forge"); }} style={Object.assign({}, styles.tag, styles.tagGold, { cursor: "pointer" })}>{themeItem}</span>;
                })}
              </div>
            </div>
          )}
        </div>
      )}
      {showRawFallback && <div style={styles.outputPanel}>{typeof rawResult === "string" ? rawResult : JSON.stringify(rawResult, null, 2)}</div>}
      {showUpgradeModal && <UpgradeModal onClose={function() { setShowUpgradeModal(false); }} />}
    </div>
  );
}

// ─── ILLUSTRATIONS ────────────────────────────────────────────────────────────

function IllustrationsScreen({ language, voiceProfile, onRequestVoiceProfile, congregationProfile, congregationEnabled, onToggleCongregation, setForgePrefill, setCurrentScreen }) {
  const [topic, setTopic] = useState("");
  const [illType, setIllType] = useState("Story");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mode, setMode] = useState("fast");
  const [showUpgradeMessage, setShowUpgradeMessage] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const handleGenerate = useCallback(async function() {
    setError(""); setShowUpgradeMessage(false); setShowUpgradeModal(false);
    if (!topic.trim()) { setError("Please enter a sermon topic or theme."); return; }
    const currentUsage = loadUsage();
    const usageCheck = canUseTool(CURRENT_USER.plan || "free", currentUsage, mode);
    if (!usageCheck.ok) { setError(usageCheck.message); setShowUpgradeMessage(true); return; }
    const toolCheck = canUseToolFeature(CURRENT_USER.plan || "free", "illustrations", currentUsage.illustrations_used || 0);
    if (!toolCheck.ok) { setError(toolCheck.message); setShowUpgradeMessage(true); return; }
    setLoading(true); setResult(null);
    const languageName = getLanguageName(language || "en");
    var voiceContext = buildVoiceContext(voiceProfile);
    var congregationContext = buildCongregationContext(congregationProfile);
    try {
      var sys =
        (voiceContext ? voiceContext + "\n\n" : "") +
        (congregationContext ? congregationContext + "\n\n" : "") +
        "You are a masterful sermon illustrator. Write all illustrations in " + languageName + ". Use plain text with no markdown, no asterisks, no hashtags, no bullet symbols.";
      var prompt =
        "Generate 3 sermon illustrations.\n" +
        "Type: " + illType + "\n" +
        "Topic: " + topic + "\n" +
        "Language: " + languageName + "\n\n" +
        "For each illustration write:\n" +
        "ILLUSTRATION [number]: [Title]\n" +
        "Type: " + illType + "\n" +
        "Story: [the full illustration in 2-4 paragraphs]\n" +
        "Application: [how it connects to the topic]\n" +
        "Scripture Connection: [relevant verse]\n\n" +
        "Write in plain text only. No markdown.";
      var streaming = "";
      await callSermonAPI(prompt, sys, mode === "deep", function(acc) { streaming = acc; setResult(acc); });
      setResult(streaming);
      incrementUsage(mode);
      incrementUsage("illustrations");
    } catch (e) {
      setError(e.message || "An error occurred.");
    } finally { setLoading(false); }
  }, [topic, illType, mode, language, voiceProfile]);

  const [illCopyStatus, setIllCopyStatus] = useState("");

  return (
    <div>
      <div style={styles.sectionSub}>Generate vivid sermon illustrations, stories, and object lessons.</div>
      <CongregationToggle enabled={congregationEnabled} onToggle={onToggleCongregation} hasProfile={!!congregationProfile} />
      <div style={styles.card}>
        <div style={styles.grid2}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Sermon Topic or Theme</label>
            <input style={styles.input} value={topic} onChange={function(e) { setTopic(e.target.value); }} onKeyDown={function(e) { if (e.key === "Enter") onRequestVoiceProfile(handleGenerate); }} placeholder="e.g. Redemption, Service, Courage" />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Illustration Type</label>
            <select style={styles.select} value={illType} onChange={function(e) { setIllType(e.target.value); }}>
              {["Story", "Object Lesson", "Historical", "Contemporary", "Parable", "Metaphor"].map(function(t) { return <option key={t} value={t}>{t}</option>; })}
            </select>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap", marginTop: 16 }}>
          <select style={Object.assign({}, styles.select, { width: 120 })} value={duration} onChange={function(e) { setDuration(e.target.value); }}>
            {["20","30","40","50","60"].map(function(d) { return <option key={d} value={d}>{d} min</option>; })}
          </select>
          <select style={Object.assign({}, styles.select, { width: 140 })} value={mode} onChange={function(e) { setMode(e.target.value); }}>
            <option value="fast">Fast Mode</option>
            <option value="deep">Deep Mode</option>
          </select>
          <Button onClick={function() { onRequestVoiceProfile(handleGenerate); }} disabled={loading}>{loading ? "Generating..." : "Generate Illustrations"}</Button>
          <ToolUsageBadge toolKey="illustrations" usedKey="illustrations_used" />
        </div>
      </div>
      {error && <div style={styles.errorPanel}>{"\u26A0 "}{error}</div>}
      {showUpgradeMessage && (
        <div style={{ background: "#fff3e0", border: "1px solid #e0c48f", borderRadius: 10, padding: 14, marginTop: 12, color: "#6b4b16" }}>
          <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>Deep mode is not available on the free plan.</div>
          <div style={{ marginBottom: 12, fontSize: 14 }}>Upgrade to unlock Deep Mode.</div>
          <button type="button" onClick={function() { setShowUpgradeModal(true); }} style={{ background: GOLD, color: "#fff", border: "none", borderRadius: 8, padding: "10px 14px", cursor: "pointer", fontWeight: "bold", fontFamily: FONT_BODY }}>Upgrade Now</button>
        </div>
      )}
      {(loading || result) && (
        <div style={{ marginTop: 20 }}>
          <div style={styles.outputPanel}>
            {loading && !result
              ? <span style={{ color: STONE_LIGHT, fontStyle: "italic" }}>Generating illustrations...</span>
              : typeof result === "string" ? result : ""
            }
          </div>
          {result && !loading && (
            <div style={{ display: "inline-flex", gap: 4, backgroundColor: CREAM, borderRadius: 8, padding: 4, border: "1px solid " + BORDER, marginTop: 10 }}>
              <button
                onClick={function() {
                  navigator.clipboard.writeText(typeof result === "string" ? result : "");
                  setIllCopyStatus("Copied \u2713");
                  setTimeout(function() { setIllCopyStatus(""); }, 2000);
                }}
                style={{ padding: "6px 16px", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 600, fontFamily: FONT_BODY, backgroundColor: illCopyStatus ? GOLD : "transparent", color: illCopyStatus ? "#fff" : STONE, transition: "all 0.15s" }}
              >
                {illCopyStatus || "Copy All"}
              </button>
              {setForgePrefill && setCurrentScreen && (
                <button
                  onClick={function() {
                    var illText = typeof result === "string" ? result : "";
                    setForgePrefill(function(prev) { return Object.assign({}, prev || {}, { illustrationToInsert: illText }); });
                    setCurrentScreen("sermon-forge");
                  }}
                  style={{ padding: "6px 16px", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 600, fontFamily: FONT_BODY, backgroundColor: "transparent", color: STONE, transition: "all 0.15s" }}
                >
                  + Add to Sermon
                </button>
              )}
            </div>
          )}
        </div>
      )}
      {showUpgradeModal && <UpgradeModal onClose={function() { setShowUpgradeModal(false); }} />}
    </div>
  );
}

// ─── LIBRARY ──────────────────────────────────────────────────────────────────

function LibraryScreen({ library: sermons, onDelete, onUpdate, onDuplicate, currentUser }) {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");
  const [filterTool, setFilterTool] = useState("all");
  const [filterSeries, setFilterSeries] = useState("all");
  const [selected, setSelected] = useState(null);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editScripture, setEditScripture] = useState("");
  const [editContent, setEditContent] = useState("");
  const [shareLoading, setShareLoading] = useState(null);
  const [shareUrl, setShareUrl] = useState("");
  const [showShareModal, setShowShareModal] = useState(false);

  var isPaid = CURRENT_USER.plan && CURRENT_USER.plan !== "free";

  var seriesList = useMemo(function() {
    var titles = sermons.map(function(s) { return s.seriesTitle; }).filter(function(t) { return !!t; });
    return Array.from(new Set(titles));
  }, [sermons]);

  var filtered = useMemo(function() {
    var q = search.trim().toLowerCase();
    var list = sermons.filter(function(s) {
      var matchesSearch = !q || (s.title && s.title.toLowerCase().includes(q)) || (s.scripture && s.scripture.toLowerCase().includes(q)) || (s.content && s.content.toLowerCase().includes(q));
      var matchesTool = filterTool === "all" || s.sourceTool === filterTool;
      var matchesSeries = filterSeries === "all" || s.seriesTitle === filterSeries;
      return matchesSearch && matchesTool && matchesSeries;
    });
    return list.slice().sort(function(a, b) {
      if (sort === "newest") return new Date(b.savedAt) - new Date(a.savedAt);
      if (sort === "oldest") return new Date(a.savedAt) - new Date(b.savedAt);
      return (a.title || "").localeCompare(b.title || "");
    });
  }, [sermons, search, sort, filterTool, filterSeries]);

  function openEditModal(sermon) { setEditing(sermon); setEditTitle(sermon.title || ""); setEditScripture(sermon.scripture || ""); setEditContent(sermon.content || ""); }

  function handleSaveEdit() {
    if (!editing) return;
    onUpdate(editing.id, { title: editTitle.trim() || "Untitled Sermon", scripture: editScripture.trim(), content: editContent });
    setEditing(null); setEditTitle(""); setEditScripture(""); setEditContent("");
  }

  function handleConfirmDelete() {
    if (!deleteTarget) return;
    onDelete(deleteTarget.id);
    if (selected && selected.id === deleteTarget.id) setSelected(null);
    setDeleteTarget(null);
  }

  async function handleShare(s) {
    setShareLoading(s.id);
    try {
      var slug = await shareSermon({
        title: s.title || "Untitled Sermon",
        scripture: s.scripture || "",
        content: s.content || "",
        pastorName: currentUser?.name || "",
        churchName: currentUser?.church || "",
        sermonDate: s.savedAt || new Date().toLocaleDateString(),
      });
      var base = window.location.hostname === "localhost" ? "https://app.sermoncraftpro.com" : window.location.origin;
      setShareUrl(base + "/share/" + slug);
      setShowShareModal(true);
    } catch (e) {
      alert("Failed to create share link: " + (e.message || "Unknown error"));
    } finally {
      setShareLoading(null);
    }
  }

  const modalOverlayStyle = { position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: 16 };
  const modalStyle = { background: "#fff", borderRadius: 16, padding: "28px 32px", width: "100%", maxWidth: 560, maxHeight: "85vh", overflowY: "auto", boxShadow: "0 8px 40px rgba(0,0,0,0.25)", fontFamily: "'Georgia', serif" };

  return (
    <div>
      <div style={styles.sectionSub}>Your personal sermon library — saved from Sermon Forge.</div>
      <div style={{ display: "flex", gap: 12, marginBottom: 12, flexWrap: "wrap" }}>
        <input style={{ ...styles.input, flex: 1, minWidth: 200 }} value={search} onChange={function(e) { setSearch(e.target.value); }} placeholder="Search by title, scripture, or content..." />
        <select style={{ ...styles.select, width: 160 }} value={sort} onChange={function(e) { setSort(e.target.value); }}>
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="az">A–Z</option>
        </select>
      </div>
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <select style={{ ...styles.select, width: 200 }} value={filterTool} onChange={function(e) { setFilterTool(e.target.value); }}>
          <option value="all">All Tools</option>
          <option value="sermon-forge">Sermon Forge</option>
          <option value="series-planner">Series Planner</option>
          <option value="topic-engine">Topic Engine</option>
          <option value="word-study">Word Study</option>
        </select>
        <select style={{ ...styles.select, width: 220 }} value={filterSeries} onChange={function(e) { setFilterSeries(e.target.value); }}>
          <option value="all">All Series</option>
          {seriesList.map(function(t) { return <option key={t} value={t}>{t}</option>; })}
        </select>
      </div>
      {filtered.length === 0 && <div style={{ ...styles.card, textAlign: "center", padding: 40, color: STONE_LIGHT }}>{sermons.length === 0 ? "No sermons saved yet." : "No sermons match your search."}</div>}
      {filtered.map(function(s) {
        return (
          <div key={s.id} style={{ ...styles.card, marginBottom: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 16 }}>{s.title}</div>
                {s.scripture && <div style={{ fontSize: 13, color: GOLD }}>{"\uD83D\uDCDA "} {s.scripture}</div>}
                <div style={{ fontSize: 12, color: STONE_LIGHT, marginTop: 2 }}>
                  Saved {s.savedAt}
                  {s.sourceTool && <span style={{ marginLeft: 8, ...styles.tag, ...styles.tagGold }}>{s.sourceTool.replace("-", " ")}</span>}
                  {s.seriesTitle && <span style={{ marginLeft: 6, ...styles.tag, ...styles.tagGray }}>{s.seriesTitle}{s.seriesWeek ? " · Week " + s.seriesWeek : ""}</span>}
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
                <Button variant="ghost" onClick={function() { setSelected(s); }}>View</Button>
                <Button variant="ghost" onClick={function() { openEditModal(s); }}>Edit</Button>
                <Button variant="ghost" onClick={function() { onDuplicate(s); }}>Duplicate</Button>
                {isPaid && (
                  <Button variant="ghost" disabled={shareLoading === s.id} onClick={function() { handleShare(s); }}>
                    {shareLoading === s.id ? "Sharing..." : "Share"}
                  </Button>
                )}
                <Button variant="ghost" onClick={function() { setDeleteTarget(s); }}>Remove</Button>
              </div>
            </div>
            {s.content && <div style={{ marginTop: 10, background: CREAM, padding: 12, borderRadius: 8, fontSize: 14, maxHeight: 120, overflow: "hidden" }}>{s.content.slice(0, 250)}{s.content.length > 250 ? "..." : ""}</div>}
          </div>
        );
      })}
      {selected && (
        <div style={modalOverlayStyle}><div style={modalStyle}>
          <div style={{ fontWeight: 700, fontSize: 18, color: CHARCOAL, marginBottom: 8 }}>{selected.title}</div>
          {selected.scripture && <div style={{ margin: "8px 0", color: GOLD, fontSize: 14 }}>{"\uD83D\uDCDA "}{selected.scripture}</div>}
          <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.7, marginBottom: 20, fontSize: 14, color: CHARCOAL }}>{selected.content}</div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}><Button onClick={function() { setSelected(null); }}>Close</Button></div>
        </div></div>
      )}
      {editing && (
        <div style={modalOverlayStyle}><div style={modalStyle}>
          <div style={{ fontWeight: 700, fontSize: 18, color: CHARCOAL, marginBottom: 14 }}>Edit Sermon</div>
          <div style={styles.inputGroup}><label style={styles.label}>Title</label><input style={styles.input} value={editTitle} onChange={function(e) { setEditTitle(e.target.value); }} /></div>
          <div style={styles.inputGroup}><label style={styles.label}>Scripture</label><input style={styles.input} value={editScripture} onChange={function(e) { setEditScripture(e.target.value); }} /></div>
          <div style={styles.inputGroup}><label style={styles.label}>Content</label><textarea style={{ ...styles.textarea, minHeight: 240 }} value={editContent} onChange={function(e) { setEditContent(e.target.value); }} /></div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}><Button variant="ghost" onClick={function() { setEditing(null); }}>Cancel</Button><Button onClick={handleSaveEdit}>Save Changes</Button></div>
        </div></div>
      )}
      {deleteTarget && (
        <div style={modalOverlayStyle}><div style={modalStyle}>
          <div style={{ fontWeight: 700, fontSize: 18, color: CHARCOAL, marginBottom: 10 }}>Delete Sermon</div>
          <div style={{ color: STONE, lineHeight: 1.6, marginBottom: 18 }}>Are you sure you want to delete <strong>{deleteTarget.title}</strong>?</div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}><Button variant="ghost" onClick={function() { setDeleteTarget(null); }}>Cancel</Button><Button onClick={handleConfirmDelete}>Delete</Button></div>
        </div></div>
      )}
      {showShareModal && <ShareModal url={shareUrl} onClose={function() { setShowShareModal(false); }} />}
    </div>
  );
}

// ─── SERIES PLANNER ───────────────────────────────────────────────────────────

function SeriesPlannerScreen({ onSaveSeries, setForgePrefill, setCurrentScreen, language, voiceProfile, onRequestVoiceProfile, congregationProfile, congregationEnabled, onToggleCongregation }) {
  const [seriesTitle, setSeriesTitle] = useState("");
  const [theme, setTheme] = useState("");
  const [weeks, setWeeks] = useState("4");
  const [mode, setMode] = useState("fast");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showUpgradeMessage, setShowUpgradeMessage] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const handlePlan = useCallback(async function() {
    setError(""); setShowUpgradeMessage(false); setShowUpgradeModal(false); setResult(null);
    if (!seriesTitle.trim() && !theme.trim()) { setError("Please enter a series title or theme."); return; }
    const currentUsage = loadUsage();
    const usageCheck = canUseTool(CURRENT_USER.plan || "free", currentUsage, mode);
    if (!usageCheck.ok) { setError(usageCheck.message); setShowUpgradeMessage(true); return; }
    const toolCheck = canUseToolFeature(CURRENT_USER.plan || "free", "seriesPlanner", currentUsage.seriesPlanner_used || 0);
    if (!toolCheck.ok) { setError(toolCheck.message); setShowUpgradeMessage(true); return; }
    setLoading(true);
    const languageName = getLanguageName(language || "en");
    var voiceContext = buildVoiceContext(voiceProfile);
    var congregationContext = buildCongregationContext(congregationProfile);
    try {
      var sys =
        (voiceContext ? voiceContext + "\n\n" : "") +
        (congregationContext ? congregationContext + "\n\n" : "") +
        "You are an expert sermon series strategist. Write all content in " + languageName + ". Use plain text formatting only — no markdown, no asterisks, no hashtags.";
      var prompt =
        "Create a complete " + weeks + "-week sermon series.\n" +
        "Series Title: " + (seriesTitle || theme) + "\n" +
        "Central Theme: " + (theme || seriesTitle) + "\n" +
        "Language: " + languageName + "\n\n" +
        "Write the series overview first, then each week using this exact format:\n\n" +
        "SERIES: [series title]\n" +
        "OVERVIEW: [2-3 sentence series overview]\n\n" +
        "WEEK 1\n" +
        "Title: [sermon title]\n" +
        "Scripture: [main scripture reference]\n" +
        "Summary: [2-3 sentence summary]\n" +
        "Key Point: [one key takeaway]\n" +
        "Progression: [how this week builds toward the series arc]\n\n" +
        "Repeat for all " + weeks + " weeks. Plain text only, no markdown.";
      var streamedResult = "";
      await callSermonAPI(prompt, sys, mode === "deep", function(acc) { streamedResult = acc; setResult(acc); });
      setResult(streamedResult);
      incrementUsage(mode);
      incrementUsage("seriesPlanner");
    } catch (e) {
      setError(e.message || "An error occurred.");
    } finally { setLoading(false); }
  }, [seriesTitle, theme, weeks, mode, language, voiceProfile]);

  // Parse plain text result into structured series
  var parsedSeries = useMemo(function() {
    if (!result || typeof result !== "string") return null;
    var lines = result.split("\n");
    var seriesName = "";
    var overview = "";
    var sermons = [];
    var current = null;

    lines.forEach(function(line) {
      var trimmed = line.trim();
      if (!trimmed) return;
      if (trimmed.startsWith("SERIES:")) { seriesName = trimmed.replace("SERIES:", "").trim(); return; }
      if (trimmed.startsWith("OVERVIEW:")) { overview = trimmed.replace("OVERVIEW:", "").trim(); return; }
      if (trimmed.match(/^WEEK\s+\d+/i)) {
        if (current) sermons.push(current);
        current = { week: sermons.length + 1, title: "", scripture: "", summary: "", keyPoint: "", progression: "" };
        return;
      }
      if (!current) return;
      if (trimmed.startsWith("Title:")) current.title = trimmed.replace("Title:", "").trim();
      else if (trimmed.startsWith("Scripture:")) current.scripture = trimmed.replace("Scripture:", "").trim();
      else if (trimmed.startsWith("Summary:")) current.summary = trimmed.replace("Summary:", "").trim();
      else if (trimmed.startsWith("Key Point:")) current.keyPoint = trimmed.replace("Key Point:", "").trim();
      else if (trimmed.startsWith("Progression:")) current.progression = trimmed.replace("Progression:", "").trim();
      else if (current.summary && !current.keyPoint) current.summary += " " + trimmed;
    });
    if (current) sermons.push(current);
    return sermons.length > 0 ? { series_title: seriesName || seriesTitle || theme, overview, sermons } : null;
  }, [result]);

  function handleSaveSeries() {
    if (!parsedSeries || !Array.isArray(parsedSeries.sermons)) return;
    var seriesId = Date.now();
    var seriesTitleValue = parsedSeries.series_title || seriesTitle || theme;
    parsedSeries.sermons.forEach(function(s, i) {
      onSaveSeries({ title: s.title || ("Week " + (s.week || i + 1)), scripture: s.scripture || "", content: (s.summary || "") + (s.keyPoint ? "\n\nKey Point: " + s.keyPoint : ""), savedAt: new Date().toLocaleDateString(), tags: [], sourceTool: "series-planner", sourceTopic: seriesTitleValue, seriesId: seriesId, seriesTitle: seriesTitleValue, seriesWeek: s.week || (i + 1) });
    });
  }

  return (
    <div>
      <div style={styles.sectionSub}>Architect a complete multi-week sermon series with scripture and progression.</div>
      <CongregationToggle enabled={congregationEnabled} onToggle={onToggleCongregation} hasProfile={!!congregationProfile} />
      <div style={styles.card}>
        <div style={styles.grid2}>
          <div style={styles.inputGroup}><label style={styles.label}>Series Title</label><input style={styles.input} value={seriesTitle} onChange={function(e) { setSeriesTitle(e.target.value); }} placeholder="e.g. The God Who Heals" /></div>
          <div style={styles.inputGroup}><label style={styles.label}>Central Theme</label><input style={styles.input} value={theme} onChange={function(e) { setTheme(e.target.value); }} placeholder="e.g. Jesus' healing ministry" /></div>
        </div>
        <div style={{ display: "flex", gap: 12, marginTop: 16, alignItems: "center" }}>
          <select style={Object.assign({}, styles.select, { width: 140 })} value={weeks} onChange={function(e) { setWeeks(e.target.value); }}>
            {["3", "4", "5", "6", "8", "10", "12"].map(function(n) { return <option key={n} value={n}>{n} Weeks</option>; })}
          </select>
          <select style={Object.assign({}, styles.select, { width: 120 })} value={duration} onChange={function(e) { setDuration(e.target.value); }}>
            {["20","30","40","50","60"].map(function(d) { return <option key={d} value={d}>{d} min</option>; })}
          </select>
          <select style={Object.assign({}, styles.select, { width: 140 })} value={mode} onChange={function(e) { setMode(e.target.value); }}>
            <option value="fast">Fast Mode</option>
            <option value="deep">Deep Mode</option>
          </select>
          <Button onClick={function() { onRequestVoiceProfile(handlePlan); }} disabled={loading}>{loading ? "Planning..." : "Plan Series"}</Button>
          <ToolUsageBadge toolKey="seriesPlanner" usedKey="seriesPlanner_used" />
        </div>
      </div>
      {error && <div style={styles.errorPanel}>{"\u26A0 "}{error}</div>}
      {showUpgradeMessage && (
        <div style={{ background: "#fff3e0", border: "1px solid #e0c48f", borderRadius: 10, padding: 16, marginTop: 12, color: "#6b4b16" }}>
          <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>Deep mode is not available on the free plan.</div>
          <div style={{ marginBottom: 12, fontSize: 14 }}>Upgrade your plan to unlock Deep Mode in Series Planner.</div>
          <button type="button" onClick={function() { setShowUpgradeModal(true); }} style={{ background: GOLD, color: "#ffffff", border: "none", borderRadius: 10, padding: "10px 16px", fontWeight: 700, cursor: "pointer" }}>Upgrade Now</button>
        </div>
      )}
      {loading && <div style={styles.outputPanel}><span style={{ color: STONE_LIGHT, fontStyle: "italic" }}>{result || "Architecting your series..."}</span></div>}
      {!loading && parsedSeries && Array.isArray(parsedSeries.sermons) && (
        <div style={{ marginTop: 20 }}>
          <div style={Object.assign({}, styles.card, { marginBottom: 16 })}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontWeight: 700, fontSize: 20, color: CHARCOAL, fontFamily: FONT_DISPLAY }}>{parsedSeries.series_title || seriesTitle || theme}</div>
              <button onClick={handleSaveSeries} style={{ background: GOLD, color: "#fff", border: "none", borderRadius: 8, padding: "8px 14px", fontWeight: 700, cursor: "pointer", fontFamily: FONT_BODY }}>Save Series</button>
            </div>
            {parsedSeries.overview && <div style={{ fontSize: 14, color: STONE, lineHeight: 1.7, marginTop: 8, fontFamily: FONT_BODY }}>{parsedSeries.overview}</div>}
          </div>
          {parsedSeries.sermons.map(function(s, i) {
            return (
              <div key={i} style={Object.assign({}, styles.card, { marginBottom: 12 })}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                  <div style={{ width: 40, height: 40, borderRadius: "50%", backgroundColor: GOLD_PALE, border: "2px solid " + GOLD, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: GOLD, fontSize: 16, flexShrink: 0 }}>{s.week || (i + 1)}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 16, color: CHARCOAL, marginBottom: 2, fontFamily: FONT_DISPLAY }}>{s.title}</div>
                    {s.scripture && <div style={{ fontSize: 13, color: GOLD, marginBottom: 6, fontFamily: FONT_BODY }}>{"\uD83D\uDCDA "}{s.scripture}</div>}
                    {s.summary && <div style={{ fontSize: 14, color: STONE, lineHeight: 1.6, marginBottom: 6, fontFamily: FONT_BODY }}>{s.summary}</div>}
                    {s.keyPoint && <div style={{ fontSize: 13, color: CHARCOAL, padding: "6px 12px", backgroundColor: GOLD_PALE, borderRadius: 6, display: "inline-block", marginBottom: 6, fontFamily: FONT_BODY }}><strong>Key Point:</strong>{" "}{s.keyPoint}</div>}
                    {s.progression && <div style={{ fontSize: 12, color: STONE_LIGHT, marginTop: 4, fontFamily: FONT_BODY }}><strong>Progression:</strong>{" "}{s.progression}</div>}
                    <div style={{ marginTop: 10 }}>
                      <button onClick={function() { setForgePrefill({ title: s.title, scripture: s.scripture, angle: s.keyPoint }); setCurrentScreen("sermon-forge"); }} style={{ background: GOLD, color: "#fff", border: "none", borderRadius: 8, padding: "8px 12px", fontWeight: 700, cursor: "pointer", fontFamily: FONT_BODY }}>Generate Sermon</button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {!loading && result && !parsedSeries && <div style={styles.outputPanel}>{result}</div>}
      {showUpgradeModal && <UpgradeModal onClose={function() { setShowUpgradeModal(false); }} />}
    </div>
  );
}

// ─── CONTENT MULTIPLIER ───────────────────────────────────────────────────────

function ContentMultiplierScreen({ language, prefill, voiceProfile, onRequestVoiceProfile, congregationProfile, congregationEnabled, onToggleCongregation }) {
  const [sermonTitle, setSermonTitle] = useState(prefill?.title || "");
  const [sermonScripture, setSermonScripture] = useState(prefill?.scripture || "");
  const [sermonContent, setSermonContent] = useState(prefill?.content || "");
  const [activeType, setActiveType] = useState(null);
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(null);
  const [error, setError] = useState("");
  const [copyStatus, setCopyStatus] = useState({});
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  useEffect(function() {
    if (prefill) { setSermonTitle(prefill.title || ""); setSermonScripture(prefill.scripture || ""); setSermonContent(prefill.content || ""); setResults({}); setActiveType(null); }
  }, [prefill]);

  const languageName = getLanguageName(language || "en");
  const isPaid = CURRENT_USER.plan && CURRENT_USER.plan !== "free";

  const CONTENT_TYPES = [
    {
      id: "hooks",
      label: "5 Social Media Hooks",
      description: "Attention-grabbing openers for Facebook, Instagram, Twitter",
      prompt: function(title, scripture, content) {
        return "Write 5 compelling social media hooks for a sermon.\nTitle: " + title + "\nScripture: " + scripture + "\nSermon summary: " + content.slice(0, 500) + "\n\nRules:\n- Each hook must be 1-2 sentences max\n- Create curiosity or conviction\n- Suitable for Facebook or Instagram\n- Write in " + languageName + "\n- DO NOT use markdown, hashtags, asterisks, or bullet symbols\n- Number each hook: 1. 2. 3. 4. 5.";
      }
    },
    {
      id: "devotional",
      label: "7-Day Devotional",
      description: "A 7-day devotional based on this sermon for your congregation",
      prompt: function(title, scripture, content) {
        return "Write a 7-day devotional based on this sermon.\nTitle: " + title + "\nScripture: " + scripture + "\nSermon summary: " + content.slice(0, 600) + "\n\nFor each day write:\nDAY [number]: [Title]\nScripture: [verse]\nReflection: [2-3 paragraphs]\nPrayer: [1 paragraph]\nToday's Question: [1 question]\n\nDO NOT use markdown, asterisks, hashtags, or bullet symbols. Use plain text only. Write in " + languageName + ".";
      }
    },
    {
      id: "smallgroup",
      label: "Small Group Guide",
      description: "Discussion questions and activities for small groups",
      prompt: function(title, scripture, content) {
        return "Create a small group discussion guide for this sermon.\nTitle: " + title + "\nScripture: " + scripture + "\nSermon summary: " + content.slice(0, 600) + "\n\nInclude these sections as plain text headings (no markdown, no asterisks, no bullets):\nOpening Question:\nKey Scripture:\nDiscussion Questions: (number them 1-7)\nApplication Activity:\nClosing Prayer Points:\n\nWrite in " + languageName + ". Use plain text only, no markdown formatting.";
      }
    },
    {
      id: "youtube",
      label: "YouTube Description + Title",
      description: "SEO-optimized title and description for your YouTube upload",
      prompt: function(title, scripture, content) {
        return "Write YouTube content for this sermon.\nTitle: " + title + "\nScripture: " + scripture + "\nSermon summary: " + content.slice(0, 500) + "\n\nProvide in plain text (NO markdown, NO asterisks, NO hashtag symbols):\n\nTITLE OPTIONS:\n1. [title]\n2. [title]\n3. [title]\n\nDESCRIPTION:\n[Hook first sentence]\n[Sermon overview - 2 paragraphs]\n[Key takeaways - write as: Key Points: then list them numbered]\n[Subscribe call to action]\n\nWrite in " + languageName + ".";
      }
    },
    {
      id: "captions",
      label: "Short-form Captions",
      description: "Instagram Reels, TikTok and YouTube Shorts captions",
      prompt: function(title, scripture, content) {
        return "Write 5 short-form video captions for Instagram Reels, TikTok and YouTube Shorts based on this sermon.\nTitle: " + title + "\nScripture: " + scripture + "\nSermon summary: " + content.slice(0, 500) + "\n\nFor each caption:\n- Under 150 characters\n- 1 key insight from the sermon\n- End with a question or call to action\n- Add 3-5 hashtags on a new line\n- Number them: 1. 2. 3. 4. 5.\n- DO NOT use asterisks or markdown\n\nWrite in " + languageName + ".";
      }
    },
  ];

  async function handleGenerate(contentType) {
    if (!sermonTitle.trim() && !sermonContent.trim()) { setError("Please enter a sermon title or paste sermon content."); return; }
    const currentUsage = loadUsage();
    const usageCheck = canUseTool(CURRENT_USER.plan || "free", currentUsage, "fast");
    if (!usageCheck.ok) { setError(usageCheck.message); setShowUpgradeModal(true); return; }
    setError(""); setLoading(contentType.id); setActiveType(contentType.id);
    var voiceContext = buildVoiceContext(voiceProfile);
    var congregationContext = buildCongregationContext(congregationProfile);
    try {
      var sys = (voiceContext ? voiceContext + "\n\n" : "") + (congregationContext ? congregationContext + "\n\n" : "") + "You are an expert church content creator and ministry communications specialist. Write all content in " + languageName + ". Be practical, engaging, and biblically grounded. Write in plain text only — no markdown, no hashtags, no asterisks.";
      var prompt = contentType.prompt(sermonTitle, sermonScripture, sermonContent);
      var text = "";
      await callSermonAPI(prompt, sys, false, function(acc) {
        text = acc;
        setResults(function(prev) { return Object.assign({}, prev, { [contentType.id]: text }); });
      });
      text = text.replace(/#{1,6}\s*/g, "").replace(/\*\*\*([^*]+)\*\*\*/g, "$1").replace(/\*\*([^*]+)\*\*/g, "$1").replace(/\*([^*]+)\*/g, "$1").replace(/^\s*[-*]\s+/gm, "").trim();
      setResults(function(prev) { return Object.assign({}, prev, { [contentType.id]: text }); });
      incrementUsage("fast");
    } catch (e) {
      setError(e.message || "An error occurred.");
    } finally { setLoading(null); }
  }

  function handleCopy(id, text) {
    const branding = isPaid ? "" : "\n\n— Created with SermonCraft Pro (sermoncraftpro.com)";
    navigator.clipboard.writeText(text + branding).then(function() {
      setCopyStatus(function(prev) { return Object.assign({}, prev, { [id]: "Copied ✓" }); });
      setTimeout(function() { setCopyStatus(function(prev) { return Object.assign({}, prev, { [id]: "" }); }); }, 2000);
    });
  }

  return (
    <div>
      <div style={styles.sectionSub}>Turn one sermon into multiple pieces of ministry content.</div>
      <CongregationToggle enabled={congregationEnabled} onToggle={onToggleCongregation} hasProfile={!!congregationProfile} />
      <div style={styles.card}>
        <div style={styles.grid2}>
          <div style={styles.inputGroup}><label style={styles.label}>Sermon Title</label><input style={styles.input} value={sermonTitle} onChange={function(e) { setSermonTitle(e.target.value); }} placeholder="e.g. Walking in the Light" /></div>
          <div style={styles.inputGroup}><label style={styles.label}>Scripture Reference</label><input style={styles.input} value={sermonScripture} onChange={function(e) { setSermonScripture(e.target.value); }} placeholder="e.g. John 8:12" /></div>
        </div>
        <div style={styles.inputGroup}>
          <label style={styles.label}>Sermon Content (paste or summarize)</label>
          <textarea style={Object.assign({}, styles.textarea, { minHeight: 120 })} value={sermonContent} onChange={function(e) { setSermonContent(e.target.value); }} placeholder="Paste your sermon content here, or summarize the key points..." />
        </div>
        {!isPaid && <div style={{ fontSize: 12, color: STONE_LIGHT, marginTop: 4 }}>Free plan: copied content includes "Created with SermonCraft Pro" footer.{" "}<span onClick={function() { setShowUpgradeModal(true); }} style={{ color: GOLD, cursor: "pointer", fontWeight: 700 }}>Upgrade to remove</span></div>}
      </div>
      {error && <div style={styles.errorPanel}>{"\u26A0 "}{error}</div>}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16, marginTop: 20 }}>
        {CONTENT_TYPES.map(function(ct) {
          var result = results[ct.id];
          var isLoading = loading === ct.id;
          var isActive = activeType === ct.id;
          return (
            <div key={ct.id} style={Object.assign({}, styles.card, { border: isActive ? "1px solid " + GOLD : "1px solid " + BORDER })}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: CHARCOAL, marginBottom: 2 }}>{ct.label}</div>
                  <div style={{ fontSize: 12, color: STONE_LIGHT }}>{ct.description}</div>
                </div>
                <button onClick={function() { onRequestVoiceProfile(function() { handleGenerate(ct); }); }} disabled={isLoading} style={{ background: result ? CREAM : GOLD, color: result ? STONE : "#fff", border: result ? "1px solid " + BORDER : "none", borderRadius: 6, padding: "6px 12px", fontSize: 11, fontWeight: 700, cursor: isLoading ? "not-allowed" : "pointer", fontFamily: "'Georgia', serif", flexShrink: 0, marginLeft: 8, opacity: isLoading ? 0.6 : 1 }}>
                  {isLoading ? "Generating..." : result ? "Regenerate" : "Generate"}
                </button>
              </div>
              {isLoading && <div style={{ color: STONE_LIGHT, fontStyle: "italic", fontSize: 13, padding: "8px 0" }}>Generating {ct.label.toLowerCase()}...</div>}
              {result && !isLoading && (
                <div>
                  <div style={{ background: IVORY, border: "1px solid " + BORDER, borderRadius: 8, padding: "12px 14px", fontSize: 13, color: CHARCOAL, lineHeight: 1.7, whiteSpace: "pre-wrap", maxHeight: 280, overflowY: "auto", marginTop: 10, fontFamily: "'Georgia', serif" }}>{result}</div>
                  <button onClick={function() { handleCopy(ct.id, result); }} style={{ marginTop: 8, padding: "6px 14px", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 11, fontWeight: 700, fontFamily: "'Georgia', serif", backgroundColor: copyStatus[ct.id] ? GOLD : CREAM, color: copyStatus[ct.id] ? "#fff" : STONE, transition: "all 0.15s" }}>{copyStatus[ct.id] || "Copy"}</button>
                </div>
              )}
            </div>
          );
        })}
      </div>
      {showUpgradeModal && <UpgradeModal onClose={function() { setShowUpgradeModal(false); }} />}
    </div>
  );
}

// ─── SERMON DELIVERY COACH ───────────────────────────────────────────────────

function SermonDeliveryCoachScreen({ currentUser }) {
  const [stage, setStage] = useState("input"); // input | recording | transcribing | analyzing | results
  const [sermonTitle, setSermonTitle] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState("");
  const [transcript, setTranscript] = useState("");
  const [results, setResults] = useState(null);
  const [error, setError] = useState("");
  const [uploadMode, setUploadMode] = useState(false);

  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const durationRef = useRef(0);
  const fileInputRef = useRef(null);

  useEffect(function() {
    return function() {
      if (timerRef.current) clearInterval(timerRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  async function startRecording() {
    setError("");
    try {
      var stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      var mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = function(e) {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = function() {
        var blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach(function(t) { t.stop(); });
      };

      mediaRecorder.start(1000);
      setIsRecording(true);
      setRecordingTime(0);
      durationRef.current = 0;
      timerRef.current = setInterval(function() {
        durationRef.current += 1;
        setRecordingTime(function(t) { return t + 1; });
      }, 1000);
    } catch (e) {
      setError("Microphone access denied. Please allow microphone access and try again.");
    }
  }

  function stopRecording() {
    if (timerRef.current) clearInterval(timerRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    setStage("input");
  }

  function handleFileUpload(e) {
    var file = e.target.files[0];
    if (!file) return;
    setAudioBlob(file);
    setAudioUrl(URL.createObjectURL(file));
    setError("");
  }

  async function handleTranscribe() {
    if (!audioBlob) { setError("Please record or upload audio first."); return; }

    // Check file size — Vercel limit is ~4.5MB for most plans
    var sizeInMB = audioBlob.size / (1024 * 1024);
    if (sizeInMB > 24) {
      setError("File is too large (" + sizeInMB.toFixed(1) + "MB). Please keep recordings under 20 minutes or use a compressed audio format like MP3.");
      return;
    }

    setStage("transcribing");
    setError("");
    try {
      var formData = new FormData();
      formData.append("file", audioBlob, audioBlob.name || "sermon.webm");
      formData.append("model", "whisper-1");
      formData.append("language", "en");

      var isLocal = window.location.hostname === "localhost";
      var base = isLocal ? "https://sermoncraft-pro.vercel.app" : "";

      var response = await fetch(base + "/api/transcribe", {
        method: "POST",
        body: formData,
      });

      var responseText = await response.text();
      var data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        throw new Error("Server error: " + responseText.slice(0, 100));
      }

      if (!response.ok || data.error) throw new Error(data.error || "Transcription failed");
      setTranscript(data.transcript);
      setStage("analyzing");
      await handleAnalyze(data.transcript);
    } catch (e) {
      setError(e.message || "Transcription failed. Please try again.");
      setStage("input");
    }
  }

  async function handleAnalyze(transcriptText) {
    try {
      var isLocal = window.location.hostname === "localhost";
      var base = isLocal ? "https://sermoncraft-pro.vercel.app" : "";

      var response = await fetch(base + "/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcript: transcriptText || transcript,
          sermonTitle: sermonTitle,
          duration: durationRef.current || null,
        }),
      });

      var data = await response.json();
      if (!response.ok || data.error) throw new Error(data.error || "Analysis failed");
      setResults(data);
      setStage("results");
    } catch (e) {
      setError(e.message || "Analysis failed. Please try again.");
      setStage("input");
    }
  }

  function handleReset() {
    setStage("input");
    setAudioBlob(null);
    setAudioUrl("");
    setTranscript("");
    setResults(null);
    setError("");
    setRecordingTime(0);
    setIsRecording(false);
    durationRef.current = 0;
  }

  function formatTime(secs) {
    var m = Math.floor(secs / 60);
    var s = secs % 60;
    return m + ":" + String(s).padStart(2, "0");
  }

  function ScoreRing({ score, label, size }) {
    var s = size || 80;
    var r = s / 2 - 8;
    var circ = 2 * Math.PI * r;
    var dash = (score / 100) * circ;
    var color = score >= 80 ? "#27AE60" : score >= 60 ? GOLD : "#E67E22";
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
        <svg width={s} height={s} style={{ transform: "rotate(-90deg)" }}>
          <circle cx={s/2} cy={s/2} r={r} fill="none" stroke={CREAM} strokeWidth={7} />
          <circle cx={s/2} cy={s/2} r={r} fill="none" stroke={color} strokeWidth={7} strokeDasharray={dash + " " + circ} strokeLinecap="round" style={{ transition: "stroke-dasharray 0.6s ease" }} />
        </svg>
        <div style={{ textAlign: "center", marginTop: -s - 4, height: s, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <div style={{ fontSize: size === 100 ? 22 : 16, fontWeight: 700, color: color, fontFamily: "'Georgia', serif", lineHeight: 1 }}>{score}</div>
        </div>
        {label && <div style={{ fontSize: 10, color: STONE_LIGHT, textTransform: "uppercase", letterSpacing: "0.06em", textAlign: "center", fontWeight: 600, marginTop: size ? -size : 0 }}>{label}</div>}
      </div>
    );
  }

  function GradeBar({ label, score }) {
    var color = score >= 80 ? "#27AE60" : score >= 60 ? GOLD : "#E67E22";
    return (
      <div style={{ marginBottom: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
          <span style={{ fontSize: 13, color: CHARCOAL, fontWeight: 600 }}>{label}</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: color }}>{score}/100</span>
        </div>
        <div style={{ height: 8, background: CREAM, borderRadius: 4, overflow: "hidden" }}>
          <div style={{ height: "100%", width: score + "%", background: color, borderRadius: 4, transition: "width 0.6s ease" }} />
        </div>
      </div>
    );
  }

  // ── INPUT STAGE ─────────────────────────────────────────────────────────────
  if (stage === "input") return (
    <div>
      <div style={styles.sectionSub}>Record your sermon delivery and receive AI coaching on pacing, filler words, structure, clarity, and engagement.</div>

      <div style={styles.card}>
        <div style={styles.inputGroup}>
          <label style={styles.label}>Sermon Title (optional)</label>
          <input style={styles.input} value={sermonTitle} onChange={function(e) { setSermonTitle(e.target.value); }} placeholder="e.g. Walking in the Light" />
        </div>

        {/* Mode selector */}
        <div style={{ display: "flex", gap: 4, background: CREAM, borderRadius: 8, padding: 4, border: "1px solid " + BORDER, marginBottom: 20, width: "fit-content" }}>
          <button onClick={function() { setUploadMode(false); }} style={{ padding: "7px 20px", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 13, fontWeight: 700, fontFamily: "'Georgia', serif", background: !uploadMode ? GOLD : "transparent", color: !uploadMode ? "#fff" : STONE, transition: "all 0.15s" }}>Record Live</button>
          <button onClick={function() { setUploadMode(true); }} style={{ padding: "7px 20px", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 13, fontWeight: 700, fontFamily: "'Georgia', serif", background: uploadMode ? GOLD : "transparent", color: uploadMode ? "#fff" : STONE, transition: "all 0.15s" }}>Upload File</button>
        </div>

        {!uploadMode ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, padding: "24px 0" }}>
            {/* Record button */}
            <button
              onClick={isRecording ? stopRecording : startRecording}
              style={{
                width: 90, height: 90, borderRadius: "50%",
                background: isRecording ? "#C0392B" : GOLD,
                border: "none", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 32, color: "#fff",
                boxShadow: isRecording ? "0 0 0 10px rgba(192,57,43,0.15)" : "0 4px 20px rgba(184,134,11,0.4)",
                transition: "all 0.2s",
              }}
            >
              {isRecording ? "⏹" : "🎙"}
            </button>

            {isRecording && (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <div style={{ fontSize: 24, fontWeight: 700, color: "#C0392B", fontFamily: "'Georgia', serif" }}>{formatTime(recordingTime)}</div>
                <div style={{ fontSize: 13, color: STONE_LIGHT }}>Recording... tap to stop</div>
                <div style={{ display: "flex", gap: 3, marginTop: 4 }}>
                  {[1,2,3,4,5].map(function(i) {
                    return <div key={i} style={{ width: 4, borderRadius: 2, background: "#C0392B", height: 8 + Math.random() * 16, animation: "none", opacity: 0.7 }} />;
                  })}
                </div>
              </div>
            )}

            {!isRecording && <div style={{ fontSize: 13, color: STONE_LIGHT, textAlign: "center" }}>Tap the mic to start recording your sermon</div>}
          </div>
        ) : (
          <div style={{ padding: "20px 0" }}>
            <input ref={fileInputRef} type="file" accept="audio/*,video/*" style={{ display: "none" }} onChange={handleFileUpload} />
            <button onClick={function() { fileInputRef.current.click(); }} style={{ padding: "14px 28px", borderRadius: 10, border: "2px dashed " + BORDER, background: CREAM, color: STONE, fontSize: 14, cursor: "pointer", fontFamily: "'Georgia', serif", fontWeight: 600 }}>
              Click to upload audio or video file
            </button>
            <div style={{ fontSize: 12, color: STONE_LIGHT, marginTop: 8 }}>Supported: MP3, MP4, WAV, M4A, WebM · Max 24MB · For best results keep under 20 minutes</div>
          </div>
        )}

        {audioUrl && (
          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: STONE, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>Preview Recording</div>
            <audio controls src={audioUrl} style={{ width: "100%", borderRadius: 8 }} />
            <div style={{ marginTop: 16 }}>
              <Button onClick={handleTranscribe}>Analyze My Delivery</Button>
            </div>
          </div>
        )}
      </div>

      {error && <div style={Object.assign({}, styles.errorPanel, { marginTop: 16 })}>{"\u26A0 "}{error}</div>}
    </div>
  );

  // ── TRANSCRIBING STAGE ───────────────────────────────────────────────────────
  if (stage === "transcribing") return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 0", gap: 20 }}>
      <div style={{ width: 64, height: 64, borderRadius: "50%", background: GOLD_PALE, border: "2px solid " + GOLD, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>🎙</div>
      <div style={{ fontSize: 18, fontWeight: 700, color: CHARCOAL, fontFamily: "'Georgia', serif" }}>Transcribing your sermon...</div>
      <div style={{ fontSize: 14, color: STONE_LIGHT, textAlign: "center", maxWidth: 360 }}>OpenAI Whisper is converting your audio to text. This takes about 30 seconds.</div>
      <div style={{ width: 200, height: 4, background: CREAM, borderRadius: 2, overflow: "hidden" }}>
        <div style={{ height: "100%", width: "60%", background: GOLD, borderRadius: 2, animation: "none" }} />
      </div>
    </div>
  );

  // ── ANALYZING STAGE ──────────────────────────────────────────────────────────
  if (stage === "analyzing") return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 0", gap: 20 }}>
      <div style={{ width: 64, height: 64, borderRadius: "50%", background: GOLD_PALE, border: "2px solid " + GOLD, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>✝</div>
      <div style={{ fontSize: 18, fontWeight: 700, color: CHARCOAL, fontFamily: "'Georgia', serif" }}>Analyzing your delivery...</div>
      <div style={{ fontSize: 14, color: STONE_LIGHT, textAlign: "center", maxWidth: 360 }}>Our AI coach is reviewing your structure, clarity, engagement, scripture usage, and application.</div>
    </div>
  );

  // ── RESULTS STAGE ────────────────────────────────────────────────────────────
  if (stage === "results" && results) {
    var gradeLabels = { structure: "Structure", clarity: "Clarity", engagement: "Engagement", scriptureUsage: "Scripture", application: "Application" };

    return (
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ fontSize: 14, color: STONE_LIGHT }}>Delivery Analysis{sermonTitle ? " — " + sermonTitle : ""}</div>
          </div>
          <button onClick={handleReset} style={{ padding: "7px 16px", border: "1px solid " + BORDER, borderRadius: 8, background: "transparent", color: STONE, fontSize: 12, cursor: "pointer", fontFamily: "'Georgia', serif", fontWeight: 700 }}>New Analysis</button>
        </div>

        {/* Overall score */}
        <div style={{ background: CHARCOAL, borderRadius: 14, padding: "24px 28px", marginBottom: 20, display: "flex", alignItems: "center", gap: 28, flexWrap: "wrap" }}>
          <div style={{ position: "relative" }}>
            <ScoreRing score={results.overallScore} size={100} />
            <div style={{ position: "absolute", top: 0, left: 0, width: 100, height: 100, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <div style={{ fontSize: 26, fontWeight: 700, color: results.overallScore >= 80 ? "#27AE60" : results.overallScore >= 60 ? GOLD : "#E67E22", fontFamily: "'Georgia', serif", lineHeight: 1 }}>{results.overallScore}</div>
              <div style={{ fontSize: 10, color: STONE_LIGHT, textTransform: "uppercase", letterSpacing: "0.06em" }}>Overall</div>
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#fff", fontFamily: "'Georgia', serif", marginBottom: 8 }}>
              {results.overallScore >= 85 ? "Excellent Delivery" : results.overallScore >= 70 ? "Strong Delivery" : results.overallScore >= 55 ? "Good Foundation" : "Room to Grow"}
            </div>
            <div style={{ fontSize: 14, color: STONE_LIGHT, lineHeight: 1.6 }}>{results.encouragement}</div>
            {/* Stats row */}
            <div style={{ display: "flex", gap: 20, marginTop: 12, flexWrap: "wrap" }}>
              {results.wordCount && <div style={{ fontSize: 12, color: STONE_LIGHT }}><span style={{ color: GOLD, fontWeight: 700 }}>{results.wordCount}</span> words</div>}
              {results.wordsPerMinute && <div style={{ fontSize: 12, color: STONE_LIGHT }}><span style={{ color: GOLD, fontWeight: 700 }}>{results.wordsPerMinute}</span> wpm</div>}
              {results.totalFillers > 0 && <div style={{ fontSize: 12, color: STONE_LIGHT }}><span style={{ color: results.totalFillers > 20 ? "#E67E22" : GOLD, fontWeight: 700 }}>{results.totalFillers}</span> filler words</div>}
              {results.duration && <div style={{ fontSize: 12, color: STONE_LIGHT }}><span style={{ color: GOLD, fontWeight: 700 }}>{results.duration}</span> min</div>}
            </div>
          </div>
        </div>

        {/* Grade bars */}
        <div style={Object.assign({}, styles.card, { marginBottom: 20 })}>
          <div style={styles.cardTitle}>Performance Breakdown</div>
          <div style={{ marginTop: 16 }}>
            {Object.entries(results.grades || {}).map(function(entry) {
              return <GradeBar key={entry[0]} label={gradeLabels[entry[0]] || entry[0]} score={entry[1]} />;
            })}
          </div>
        </div>

        {/* Filler words */}
        {results.totalFillers > 0 && (
          <div style={Object.assign({}, styles.card, { marginBottom: 20 })}>
            <div style={styles.cardTitle}>Filler Words Detected</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
              {Object.entries(results.fillerCounts || {}).map(function(f) {
                return (
                  <span key={f[0]} style={{ padding: "4px 12px", borderRadius: 16, background: f[1] > 5 ? "#FFF8F0" : CREAM, color: f[1] > 5 ? "#E67E22" : STONE, fontSize: 12, fontWeight: 700, border: "1px solid " + (f[1] > 5 ? "#E67E22" : BORDER) }}>
                    "{f[0]}" × {f[1]}
                  </span>
                );
              })}
            </div>
            <div style={{ fontSize: 12, color: STONE_LIGHT, marginTop: 10 }}>Tip: Record yourself speaking and consciously pause instead of using filler words.</div>
          </div>
        )}

        {/* Top coaching tip */}
        <div style={{ background: GOLD_PALE, border: "1px solid " + GOLD, borderRadius: 12, padding: "16px 20px", marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: GOLD, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Top Coaching Tip</div>
          <div style={{ fontSize: 14, color: CHARCOAL, lineHeight: 1.6 }}>{results.topCoachingTip}</div>
        </div>

        {/* Strengths & Improvements */}
        <div style={styles.grid2}>
          <div style={styles.card}>
            <div style={styles.cardTitle}>Strengths</div>
            <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 10 }}>
              {(results.strengths || []).map(function(s, i) {
                return (
                  <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <span style={{ color: "#27AE60", fontWeight: 700, flexShrink: 0, marginTop: 1 }}>✓</span>
                    <span style={{ fontSize: 13, color: STONE, lineHeight: 1.5 }}>{s}</span>
                  </div>
                );
              })}
            </div>
          </div>
          <div style={styles.card}>
            <div style={styles.cardTitle}>Areas to Improve</div>
            <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 10 }}>
              {(results.improvements || []).map(function(s, i) {
                return (
                  <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <span style={{ color: GOLD, fontWeight: 700, flexShrink: 0, marginTop: 1 }}>→</span>
                    <span style={{ fontSize: 13, color: STONE, lineHeight: 1.5 }}>{s}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Detailed analysis */}
        <div style={Object.assign({}, styles.card, { marginTop: 20 })}>
          <div style={styles.cardTitle}>Detailed Analysis</div>
          <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 16 }}>
            {[
              { key: "structureAnalysis", label: "Structure" },
              { key: "clarityAnalysis", label: "Clarity" },
              { key: "engagementAnalysis", label: "Engagement" },
              { key: "scriptureAnalysis", label: "Scripture Usage" },
              { key: "applicationAnalysis", label: "Application" },
            ].map(function(item) {
              return results[item.key] ? (
                <div key={item.key} style={{ paddingBottom: 16, borderBottom: "1px solid " + BORDER }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: GOLD, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>{item.label}</div>
                  <div style={{ fontSize: 14, color: STONE, lineHeight: 1.7 }}>{results[item.key]}</div>
                </div>
              ) : null;
            })}
          </div>
        </div>

        {/* Transcript */}
        {transcript && (
          <div style={Object.assign({}, styles.card, { marginTop: 20 })}>
            <div style={styles.cardTitle}>Sermon Transcript</div>
            <div style={{ marginTop: 12, fontSize: 13, color: STONE, lineHeight: 1.8, maxHeight: 300, overflowY: "auto", padding: "4px 0" }}>{transcript}</div>
          </div>
        )}
      </div>
    );
  }

  return null;
}

// ─── CONGREGATION INTELLIGENCE ───────────────────────────────────────────────

function buildCongregationContext(profile) {
  if (!profile) return "";
  var parts = [];
  parts.push("CONGREGATION INTELLIGENCE — tailor all content specifically for this church:");
  if (profile.size) parts.push("Church size: " + profile.size + ".");
  if (profile.demographics) parts.push("Demographics: " + profile.demographics + ".");
  if (profile.community) parts.push("Community context: " + profile.community + ".");
  if (profile.struggles) parts.push("Current congregation struggles and prayer needs: " + profile.struggles + ".");
  if (profile.series) parts.push("Current sermon series/season: " + profile.series + ".");
  if (profile.events) parts.push("Recent church events: " + profile.events + ".");
  if (profile.values) parts.push("Church values and vision: " + profile.values + ".");
  if (parts.length === 1) return "";
  return parts.join(" ");
}

function CongregationToggle({ enabled, onToggle, hasProfile }) {
  if (!hasProfile) return null;
  return (
    <button
      onClick={onToggle}
      style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        padding: "5px 12px", borderRadius: 16,
        border: "1.5px solid " + (enabled ? "#7C3AED" : BORDER),
        background: enabled ? "#F5F3FF" : IVORY,
        color: enabled ? "#7C3AED" : STONE_LIGHT,
        fontSize: 11, fontWeight: 700, cursor: "pointer",
        fontFamily: "'Georgia', serif", transition: "all 0.15s",
        marginBottom: 12,
      }}
    >
      <span>🏛</span>
      <span>{enabled ? "Congregation: On" : "Congregation: Off"}</span>
    </button>
  );
}

function CongregationProfileScreen({ user, profile, onProfileSaved }) {
  const [size, setSize] = useState(profile?.size || "");
  const [demographics, setDemographics] = useState(profile?.demographics || "");
  const [community, setCommunity] = useState(profile?.community || "");
  const [struggles, setStruggles] = useState(profile?.struggles || "");
  const [series, setSeries] = useState(profile?.series || "");
  const [events, setEvents] = useState(profile?.events || "");
  const [values, setValues] = useState(profile?.values || "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const timerRef = useRef(null);

  useEffect(function() {
    return function() { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  async function handleSave() {
    setSaving(true);
    var newProfile = { size, demographics, community, struggles, series, events, values };
    try {
      const { supabase } = await import("./lib/supabase");
      await supabase.from("users").update({ congregation_profile: newProfile }).eq("id", user.id);
      if (onProfileSaved) onProfileSaved(newProfile);
      setSaved(true);
      timerRef.current = setTimeout(function() { setSaved(false); }, 2500);
    } catch (e) {
      console.error("Failed to save congregation profile:", e);
    } finally {
      setSaving(false);
    }
  }

  const fields = [
    { label: "Church Size & Demographics", value: size, set: setSize, placeholder: "e.g. 300 members, mixed ages, mostly families with young children" },
    { label: "Community Context", value: community, set: setCommunity, placeholder: "e.g. Urban multicultural neighborhood, high poverty area, college town" },
    { label: "Current Sermon Series / Season", value: series, set: setSeries, placeholder: "e.g. Currently in a series on faith, approaching Easter season" },
    { label: "Congregation Struggles & Prayer Needs", value: struggles, set: setStruggles, placeholder: "e.g. Many members facing job loss, anxiety about the future, marriage challenges" },
    { label: "Recent Church Events", value: events, set: setEvents, placeholder: "e.g. Just returned from a missions trip, celebrated 10th anniversary last month" },
    { label: "Key Values & Vision of the Church", value: values, set: setValues, placeholder: "e.g. Evangelism-focused, strong on discipleship, vision to plant 3 churches" },
  ];

  return (
    <div>
      <div style={styles.sectionSub}>
        Help every AI generation speak directly to your congregation. This profile is injected into sermon generation, topics, illustrations and more.
      </div>

      <div style={{ background: "#F5F3FF", border: "1px solid #7C3AED", borderRadius: 10, padding: "12px 16px", marginBottom: 24, fontSize: 13, color: "#5B21B6" }}>
        🏛 When active, every generation will be tailored specifically for your church — not a generic congregation.
      </div>

      <div style={styles.card}>
        {fields.map(function(f) {
          return (
            <div key={f.label} style={styles.inputGroup}>
              <label style={styles.label}>{f.label}</label>
              <textarea
                style={Object.assign({}, styles.textarea, { minHeight: 72 })}
                value={f.value}
                onChange={function(e) { f.set(e.target.value); }}
                placeholder={f.placeholder}
                rows={2}
              />
            </div>
          );
        })}

        <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 8 }}>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Congregation Profile"}
          </Button>
          {saved && <span style={{ fontSize: 13, color: "#27AE60", fontWeight: 600 }}>✓ Saved</span>}
        </div>
      </div>
    </div>
  );
}

// ─── REFERRALS ────────────────────────────────────────────────────────────────

function ReferralsScreen({ user, currentUser }) {
  const [referralCode, setReferralCode] = useState("");
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copyStatus, setCopyStatus] = useState("");
  const [availabilityModal, setAvailabilityModal] = useState(null);
  const [blockDate, setBlockDate] = useState("");
  const [emailTo, setEmailTo] = useState("");
  const [emailSending, setEmailSending] = useState(false);
  const [emailStatus, setEmailStatus] = useState("");
  const [emailError, setEmailError] = useState("");

  useEffect(function() {
    if (!user?.id) return;
    import("./lib/db").then(function({ ensureReferralCode, fetchReferrals }) {
      Promise.all([
        ensureReferralCode(user.id),
        fetchReferrals(user.id),
      ]).then(function(results) {
        setReferralCode(results[0] || "");
        setReferrals(Array.isArray(results[1]) ? results[1] : []);
      }).catch(function(e) {
        setError("Could not load referral data. Please refresh.");
      }).finally(function() { setLoading(false); });
    });
  }, [user]);

  var referralLink = "https://app.sermoncraftpro.com?ref=" + referralCode;
  var pending = referrals.filter(function(r) { return r.status === "pending"; }).length;
  var rewarded = referrals.filter(function(r) { return r.status === "rewarded"; }).length;

  function handleCopy() {
    navigator.clipboard.writeText(referralLink).then(function() {
      setCopyStatus("Copied!");
      setTimeout(function() { setCopyStatus(""); }, 2000);
    });
  }

  function handleShare() {
    if (navigator.share) {
      navigator.share({
        title: "SermonCraft Pro",
        text: "I've been using SermonCraft Pro to prepare my sermons — it's incredible. Sign up with my link and get 20% off your first month.",
        url: referralLink,
      }).catch(function() {});
    } else {
      handleCopy();
    }
  }

  async function handleSendEmail() {
    if (!emailTo.trim()) { setEmailError("Please enter an email address."); return; }
    if (!emailTo.includes("@")) { setEmailError("Please enter a valid email address."); return; }
    setEmailError(""); setEmailSending(true); setEmailStatus("");
    try {
      var isLocal = window.location.hostname === "localhost";
      var base = isLocal ? "https://sermoncraft-pro.vercel.app" : "";
      var senderName = currentUser?.name || user?.email?.split("@")[0] || "A fellow pastor";
      var res = await fetch(base + "/api/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "referral",
          to: emailTo.trim(),
          senderName: senderName,
          referralLink: referralLink,
        }),
      });
      var data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || "Failed to send.");
      setEmailStatus("Email sent successfully!");
      setEmailTo("");
      setTimeout(function() { setEmailStatus(""); }, 3000);
    } catch (e) {
      setEmailError(e.message || "Could not send email. Please try again.");
    } finally {
      setEmailSending(false);
    }
  }

  return (
    <div>
      <div style={styles.sectionSub}>Invite fellow pastors and earn free months when they subscribe.</div>

      {/* How it works */}
      <div style={Object.assign({}, styles.card, { marginBottom: 20 })}>
        <div style={styles.cardTitle}>How It Works</div>
        <div className="scp-grid-3" style={{ marginTop: 16 }}>
          {[
            { step: "1", title: "Share Your Link", desc: "Send your unique referral link to other pastors." },
            { step: "2", title: "They Get 20% Off", desc: "New signups get 20% off their first month when using your link." },
            { step: "3", title: "You Get a Free Month", desc: "When they subscribe, you get one free month of your current plan." },
          ].map(function(item) {
            return (
              <div key={item.step} style={{ textAlign: "center", padding: "16px 12px" }}>
                <div style={{ width: 40, height: 40, borderRadius: "50%", background: GOLD_PALE, border: "2px solid " + GOLD, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: GOLD, fontSize: 16, margin: "0 auto 12px" }}>{item.step}</div>
                <div style={{ fontWeight: 700, fontSize: 14, color: CHARCOAL, marginBottom: 4 }}>{item.title}</div>
                <div style={{ fontSize: 13, color: STONE, lineHeight: 1.5 }}>{item.desc}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Referral link */}
      <div style={Object.assign({}, styles.card, { marginBottom: 20 })}>
        <div style={styles.cardTitle}>Your Referral Link</div>
        <div style={{ marginTop: 12 }}>
          {loading ? (
            <div style={{ color: STONE_LIGHT, fontStyle: "italic", fontSize: 13 }}>Loading your referral link...</div>
          ) : (
            <>
              <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                <input
                  readOnly
                  value={referralLink}
                  style={Object.assign({}, styles.input, { flex: 1, color: STONE })}
                  onFocus={function(e) { e.target.select(); }}
                />
                <button onClick={handleCopy} style={{ padding: "10px 18px", borderRadius: 8, border: "none", background: copyStatus ? "#27AE60" : GOLD, color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: FONT_BODY, whiteSpace: "nowrap", transition: "background 0.15s" }}>
                  {copyStatus || "Copy Link"}
                </button>
              </div>
              <button onClick={handleShare} style={{ padding: "9px 18px", borderRadius: 8, border: "1px solid " + BORDER, background: "transparent", color: STONE, fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: FONT_BODY, marginBottom: 20 }}>
                Share
              </button>

              {/* In-app email sender */}
              <div style={{ borderTop: "1px solid " + BORDER, paddingTop: 16 }}>
                <label style={styles.label}>Send Referral Email to a Pastor</label>
                <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
                  <input
                    type="email"
                    value={emailTo}
                    onChange={function(e) { setEmailTo(e.target.value); setEmailError(""); }}
                    placeholder="pastor@church.com"
                    style={Object.assign({}, styles.input, { flex: 1 })}
                    onKeyDown={function(e) { if (e.key === "Enter") handleSendEmail(); }}
                  />
                  <button onClick={handleSendEmail} disabled={emailSending} style={{ padding: "10px 18px", borderRadius: 8, border: "none", background: emailSending ? STONE_LIGHT : GOLD, color: "#fff", fontWeight: 700, fontSize: 13, cursor: emailSending ? "not-allowed" : "pointer", fontFamily: FONT_BODY, whiteSpace: "nowrap" }}>
                    {emailSending ? "Sending..." : "Send Email"}
                  </button>
                </div>
                {emailError && <div style={{ fontSize: 12, color: "#C0392B", marginTop: 6 }}>{emailError}</div>}
                {emailStatus && <div style={{ fontSize: 12, color: "#27AE60", marginTop: 6, fontWeight: 600 }}>✓ {emailStatus}</div>}
                <div style={{ fontSize: 11, color: STONE_LIGHT, marginTop: 6 }}>We'll send them a personal invitation with your referral link from noreply@sermoncraftpro.com.</div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 20 }}>
        <div style={styles.statCard}>
          <div style={styles.statValue}>{referrals.length}</div>
          <div style={styles.statLabel}>Total Referrals</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statValue}>{pending}</div>
          <div style={styles.statLabel}>Pending</div>
        </div>
        <div style={styles.statCard}>
          <div style={Object.assign({}, styles.statValue, { color: "#27AE60" })}>{rewarded}</div>
          <div style={styles.statLabel}>Free Months Earned</div>
        </div>
      </div>

      {/* Referral list */}
      <div style={styles.card}>
        <div style={styles.cardTitle}>Referral History</div>
        {loading && <div style={{ color: STONE_LIGHT, fontStyle: "italic", fontSize: 13, marginTop: 12 }}>Loading...</div>}
        {!loading && referrals.length === 0 && (
          <div style={{ color: STONE_LIGHT, fontStyle: "italic", fontSize: 13, marginTop: 12 }}>No referrals yet. Share your link to get started.</div>
        )}
        {referrals.length > 0 && (
          <table style={Object.assign({}, styles.table, { marginTop: 12 })}>
            <thead>
              <tr>
                <th style={styles.th}>Email</th>
                <th style={styles.th}>Date</th>
                <th style={styles.th}>Status</th>
              </tr>
            </thead>
            <tbody>
              {referrals.map(function(r) {
                var statusStyle = r.status === "rewarded"
                  ? { backgroundColor: "#EAFAF1", color: "#27AE60" }
                  : { backgroundColor: CREAM, color: STONE };
                return (
                  <tr key={r.id}>
                    <td style={styles.td}>{r.referred_email || "—"}</td>
                    <td style={Object.assign({}, styles.td, { fontSize: 13, color: STONE_LIGHT })}>
                      {r.created_at ? new Date(r.created_at).toLocaleDateString() : "—"}
                    </td>
                    <td style={styles.td}>
                      <span style={Object.assign({}, styles.tag, statusStyle)}>
                        {r.status === "rewarded" ? "✓ Rewarded" : "Pending"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ─── BIBLE COMMENTARY ────────────────────────────────────────────────────────

function BibleCommentaryScreen({ language, voiceProfile, congregationProfile }) {
  const [passage, setPassage] = useState("");
  const [commentaryType, setCommentaryType] = useState("expository");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copyStatus, setCopyStatus] = useState("");
  const [availabilityModal, setAvailabilityModal] = useState(null);
  const [blockDate, setBlockDate] = useState("");

  const handleGenerate = useCallback(async function() {
    if (!passage.trim()) { setError("Please enter a scripture passage."); return; }
    const currentUsage = loadUsage();
    const usageCheck = canUseTool(CURRENT_USER.plan || "free", currentUsage, "deep");
    if (!usageCheck.ok) { setError(usageCheck.message); return; }
    const toolCheck = canUseToolFeature(CURRENT_USER.plan || "free", "bibleCommentary", currentUsage.bibleCommentary_used || 0);
    if (!toolCheck.ok) { setError(toolCheck.message); return; }
    setError(""); setLoading(true); setResult("");
    const languageName = getLanguageName(language || "en");
    var voiceContext = buildVoiceContext(voiceProfile);
    var congregationContext = buildCongregationContext(congregationProfile);
    try {
      var commentaryTypes = {
        expository: "Provide a deep expository commentary examining the original language (Hebrew/Greek), historical context, theological themes, and practical application.",
        devotional: "Provide a devotional commentary focused on spiritual application, personal transformation, and pastoral warmth.",
        scholarly: "Provide a scholarly commentary with original language analysis, cross-references, theological debates, and citation of respected theologians.",
        homiletical: "Provide a homiletical commentary specifically designed to help a preacher develop a sermon, with suggested outlines, illustrations, and application points.",
      };
      var sys =
        (voiceContext ? voiceContext + "\n\n" : "") +
        (congregationContext ? congregationContext + "\n\n" : "") +
        "You are a biblical scholar with expertise in hermeneutics, original languages, and theology. " +
        "Write all commentary in " + languageName + ". " +
        commentaryTypes[commentaryType];
      var prompt =
        "Write a comprehensive biblical commentary on: " + passage + "\n\n" +
        "Structure your commentary with these sections:\n" +
        "1. PASSAGE OVERVIEW — brief summary\n" +
        "2. ORIGINAL LANGUAGE — key Hebrew/Greek words with meanings\n" +
        "3. HISTORICAL CONTEXT — cultural and historical background\n" +
        "4. THEOLOGICAL THEMES — major theological insights\n" +
        "5. CROSS-REFERENCES — 3-5 related passages\n" +
        "6. PRACTICAL APPLICATION — how this applies today\n" +
        "7. SERMON INSIGHT — one key homiletical takeaway\n\n" +
        "Write in " + languageName + ". Be thorough and academically grounded.";
      await callSermonAPI(prompt, sys, true, function(acc) { setResult(acc); });
      incrementUsage("deep");
      incrementUsage("bibleCommentary");
    } catch (e) {
      setError(e.message || "An error occurred.");
    } finally { setLoading(false); }
  }, [passage, commentaryType, language, voiceProfile, congregationProfile]);

  var cleanedResult = cleanAIText(result).replace(/\*\*/g, "").replace(/\*/g, "");

  return (
    <div>
      <div style={styles.sectionSub}>AI-powered biblical commentary with original language insights, historical context, and theological analysis.</div>
      <div style={styles.card}>
        <div style={styles.grid2}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Scripture Passage</label>
            <input style={styles.input} value={passage} onChange={function(e) { setPassage(e.target.value); }} placeholder="e.g. John 3:16, Romans 8:1-11, Psalm 23" onKeyDown={function(e) { if (e.key === "Enter") handleGenerate(); }} />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Commentary Type</label>
            <select style={styles.select} value={commentaryType} onChange={function(e) { setCommentaryType(e.target.value); }}>
              <option value="expository">Expository — Deep textual analysis</option>
              <option value="devotional">Devotional — Spiritual application</option>
              <option value="scholarly">Scholarly — Academic depth</option>
              <option value="homiletical">Homiletical — Sermon preparation</option>
            </select>
          </div>
        </div>
        <Button onClick={handleGenerate} disabled={loading}>{loading ? "Generating..." : "Generate Commentary"}</Button>
        <ToolUsageBadge toolKey="bibleCommentary" usedKey="bibleCommentary_used" />
      </div>
      {error && <div style={styles.errorPanel}>{"\u26A0 "}{error}</div>}
      {(result || loading) && (
        <div style={{ marginTop: 16 }}>
          <div style={styles.outputPanel}>
            {loading && !cleanedResult ? <span style={{ color: STONE_LIGHT, fontStyle: "italic" }}>Generating commentary...</span> : cleanedResult}
          </div>
          {cleanedResult && (
            <div style={{ display: "inline-flex", gap: 4, backgroundColor: CREAM, borderRadius: 8, padding: 4, border: "1px solid " + BORDER, marginTop: 10 }}>
              <button onClick={function() { navigator.clipboard.writeText(cleanedResult).then(function() { setCopyStatus("Copied!"); setTimeout(function() { setCopyStatus(""); }, 2000); }); }} style={{ padding: "6px 16px", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 700, fontFamily: "'Georgia', serif", backgroundColor: copyStatus ? GOLD : "transparent", color: copyStatus ? "#fff" : STONE, transition: "all 0.15s" }}>
                {copyStatus || "Copy"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── SERMON CALENDAR ─────────────────────────────────────────────────────────

function SermonCalendarScreen({ user, library, setForgePrefill, setCurrentScreen }) {
  const STORAGE_KEY = "scp_calendar_" + (user?.id || "local");

  function loadEntries() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch(e) { return []; }
  }
  function saveEntries(entries) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  }

  const [entries, setEntries] = useState(function() { return loadEntries(); });
  const [showAddModal, setShowAddModal] = useState(false);
  const [editEntry, setEditEntry] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [newTitle, setNewTitle] = useState("");
  const [newScripture, setNewScripture] = useState("");
  const [newSeries, setNewSeries] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newStatus, setNewStatus] = useState("planned");
  const [newNotes, setNewNotes] = useState("");
  const [saveError, setSaveError] = useState("");

  var months = ["January","February","March","April","May","June","July","August","September","October","November","December"];

  var filteredEntries = useMemo(function() {
    return entries.filter(function(e) {
      if (!e.service_date) return false;
      var d = new Date(e.service_date + "T00:00:00");
      return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
    });
  }, [entries, selectedMonth, selectedYear]);

  var daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
  var firstDay = new Date(selectedYear, selectedMonth, 1).getDay();
  var calendarDays = [];
  for (var i = 0; i < firstDay; i++) calendarDays.push(null);
  for (var d = 1; d <= daysInMonth; d++) calendarDays.push(d);

  function getEntriesForDay(day) {
    if (!day) return [];
    var dateStr = selectedYear + "-" + String(selectedMonth + 1).padStart(2, "0") + "-" + String(day).padStart(2, "0");
    return entries.filter(function(e) { return e.service_date === dateStr; });
  }

  function handleSave() {
    if (!newDate) { setSaveError("Please select a date."); return; }
    if (!newTitle.trim()) { setSaveError("Please enter a sermon title."); return; }
    setSaveError("");
    var updated;
    if (editEntry) {
      updated = entries.map(function(e) {
        return e.id === editEntry.id
          ? Object.assign({}, e, { title: newTitle, scripture: newScripture, series_title: newSeries, status: newStatus, notes: newNotes })
          : e;
      });
    } else {
      var newEntry = {
        id: Date.now().toString(),
        user_id: user?.id || "local",
        title: newTitle,
        scripture: newScripture,
        series_title: newSeries,
        service_date: newDate,
        status: newStatus,
        notes: newNotes,
        created_at: new Date().toISOString(),
      };
      updated = [...entries, newEntry];
    }
    saveEntries(updated);
    setEntries(updated);
    setShowAddModal(false); setEditEntry(null);
    setNewTitle(""); setNewScripture(""); setNewSeries(""); setNewDate(""); setNewStatus("planned"); setNewNotes("");
  }

  function handleDelete(id) {
    var updated = entries.filter(function(e) { return e.id !== id; });
    saveEntries(updated);
    setEntries(updated);
  }

  function openEdit(entry) {
    setEditEntry(entry);
    setNewTitle(entry.title || ""); setNewScripture(entry.scripture || ""); setNewSeries(entry.series_title || "");
    setNewDate(entry.service_date || ""); setNewStatus(entry.status || "planned"); setNewNotes(entry.notes || "");
    setShowAddModal(true);
  }

  var statusColors = {
    planned: { bg: CREAM, color: STONE },
    ready: { bg: "#E8F4FD", color: "#2980B9" },
    preached: { bg: "#EAFAF1", color: "#27AE60" },
    cancelled: { bg: "#FFF5F5", color: "#C0392B" }
  };

  return (
    <div>
      <div style={styles.sectionSub}>Plan your entire preaching year. Track sermon preparation and delivery.</div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={function() { if (selectedMonth === 0) { setSelectedMonth(11); setSelectedYear(function(y) { return y - 1; }); } else setSelectedMonth(function(m) { return m - 1; }); }} style={{ padding: "6px 12px", border: "1px solid " + BORDER, borderRadius: 6, background: "transparent", cursor: "pointer", fontSize: 16 }}>‹</button>
          <div style={{ fontSize: 18, fontWeight: 700, color: CHARCOAL, fontFamily: FONT_DISPLAY, minWidth: 160, textAlign: "center" }}>{months[selectedMonth]} {selectedYear}</div>
          <button onClick={function() { if (selectedMonth === 11) { setSelectedMonth(0); setSelectedYear(function(y) { return y + 1; }); } else setSelectedMonth(function(m) { return m + 1; }); }} style={{ padding: "6px 12px", border: "1px solid " + BORDER, borderRadius: 6, background: "transparent", cursor: "pointer", fontSize: 16 }}>›</button>
        </div>
        <Button onClick={function() { setEditEntry(null); setNewTitle(""); setNewScripture(""); setNewSeries(""); setNewDate(""); setNewStatus("planned"); setNewNotes(""); setSaveError(""); setShowAddModal(true); }}>+ Add Service</Button>
      </div>

      {/* Calendar grid */}
      <div style={Object.assign({}, styles.card, { marginBottom: 20 })}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 1, marginBottom: 4 }}>
          {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(function(d) {
            return <div key={d} style={{ padding: "6px 4px", textAlign: "center", fontSize: 11, fontWeight: 700, color: STONE_LIGHT, letterSpacing: "0.06em" }}>{d}</div>;
          })}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2 }}>
          {calendarDays.map(function(day, idx) {
            var dayEntries = getEntriesForDay(day);
            var today = new Date();
            var isToday = day && today.getDate() === day && today.getMonth() === selectedMonth && today.getFullYear() === selectedYear;
            var isSunday = day && (new Date(selectedYear, selectedMonth, day).getDay() === 0);
            return (
              <div key={idx} style={{ minHeight: 70, padding: 4, borderRadius: 6, background: !day ? "transparent" : isSunday ? "rgba(184,134,11,0.04)" : IVORY, border: isToday ? "2px solid " + GOLD : "1px solid " + (day ? BORDER : "transparent") }}>
                {day && (
                  <>
                    <div style={{ fontSize: 12, fontWeight: isToday ? 700 : 400, color: isToday ? GOLD : isSunday ? GOLD : STONE, marginBottom: 4 }}>{day}</div>
                    {dayEntries.map(function(entry) {
                      var sc = statusColors[entry.status] || statusColors.planned;
                      return (
                        <div key={entry.id} onClick={function() { openEdit(entry); }} style={{ fontSize: 10, background: sc.bg, color: sc.color, borderRadius: 4, padding: "2px 4px", marginBottom: 2, cursor: "pointer", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {entry.title}
                        </div>
                      );
                    })}
                    {isSunday && dayEntries.length === 0 && (
                      <div onClick={function() {
                        setEditEntry(null);
                        setNewDate(selectedYear + "-" + String(selectedMonth + 1).padStart(2, "0") + "-" + String(day).padStart(2, "0"));
                        setNewTitle(""); setNewScripture(""); setNewSeries(""); setNewStatus("planned"); setNewNotes(""); setSaveError("");
                        setShowAddModal(true);
                      }} style={{ fontSize: 9, color: STONE_LIGHT, cursor: "pointer", fontStyle: "italic" }}>+ add</div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* List of entries this month */}
      {filteredEntries.length > 0 && (
        <div style={styles.card}>
          <div style={styles.cardTitle}>{months[selectedMonth]} {selectedYear} — {filteredEntries.length} service{filteredEntries.length !== 1 ? "s" : ""}</div>
          <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 10 }}>
            {filteredEntries.sort(function(a, b) { return a.service_date > b.service_date ? 1 : -1; }).map(function(entry) {
              var sc = statusColors[entry.status] || statusColors.planned;
              return (
                <div key={entry.id} style={{ padding: "14px 16px", border: "1px solid " + BORDER, borderRadius: 8, backgroundColor: IVORY, display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: CHARCOAL, fontFamily: FONT_DISPLAY, marginBottom: 2 }}>{entry.title || "Untitled"}</div>
                    <div style={{ fontSize: 12, color: STONE_LIGHT, fontFamily: FONT_BODY }}>
                      {new Date(entry.service_date + "T00:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                      {entry.scripture && " · " + entry.scripture}
                      {entry.series_title && " · " + entry.series_title}
                    </div>
                    {entry.notes && <div style={{ fontSize: 12, color: STONE, marginTop: 4, fontFamily: FONT_BODY }}>{entry.notes}</div>}
                  </div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                    <span style={Object.assign({}, styles.tag, { backgroundColor: sc.bg, color: sc.color })}>{entry.status}</span>
                    <button onClick={function() { if (setForgePrefill) setForgePrefill({ title: entry.title || "", scripture: entry.scripture || "", angle: "" }); setCurrentScreen("sermon-forge"); }} style={{ padding: "5px 12px", border: "none", borderRadius: 6, background: GOLD, color: "#fff", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: FONT_BODY }}>✍ Generate Sermon</button>
                    <button onClick={function() { openEdit(entry); }} style={{ padding: "4px 10px", border: "1px solid " + BORDER, borderRadius: 6, background: "transparent", color: STONE, fontSize: 11, cursor: "pointer", fontFamily: FONT_BODY }}>Edit</button>
                    <button onClick={function() { handleDelete(entry.id); }} style={{ padding: "4px 10px", border: "1px solid #FFC5C5", borderRadius: 6, background: "transparent", color: "#C0392B", fontSize: 11, cursor: "pointer", fontFamily: FONT_BODY }}>Remove</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {filteredEntries.length === 0 && (
        <div style={Object.assign({}, styles.card, { textAlign: "center", padding: "40px 24px" })}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>📅</div>
          <div style={{ fontSize: 15, fontWeight: 600, color: CHARCOAL, fontFamily: FONT_DISPLAY, marginBottom: 6 }}>No services planned for {months[selectedMonth]}</div>
          <div style={{ fontSize: 13, color: STONE_LIGHT, marginBottom: 20, fontFamily: FONT_BODY }}>Click a Sunday on the calendar or use the button to add a service.</div>
          <Button onClick={function() { setEditEntry(null); setNewTitle(""); setNewScripture(""); setNewSeries(""); setNewDate(""); setNewStatus("planned"); setNewNotes(""); setSaveError(""); setShowAddModal(true); }}>+ Add Service</Button>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: 16 }}>
          <div style={{ background: WARM_WHITE, borderRadius: 16, padding: "28px 28px", width: "100%", maxWidth: 500, boxShadow: "0 8px 40px rgba(0,0,0,0.25)" }}>
            <div style={{ fontWeight: 700, fontSize: 18, color: CHARCOAL, marginBottom: 16, fontFamily: FONT_DISPLAY }}>{editEntry ? "Edit Service" : "Add Service"}</div>
            <div style={styles.inputGroup}><label style={styles.label}>Sermon Title *</label><input style={styles.input} value={newTitle} onChange={function(e) { setNewTitle(e.target.value); }} placeholder="e.g. He Touched the Untouchable" /></div>
            <div style={styles.inputGroup}><label style={styles.label}>Scripture</label><input style={styles.input} value={newScripture} onChange={function(e) { setNewScripture(e.target.value); }} placeholder="e.g. Mark 1:40-45" /></div>
            <div style={styles.inputGroup}><label style={styles.label}>Series</label><input style={styles.input} value={newSeries} onChange={function(e) { setNewSeries(e.target.value); }} placeholder="e.g. Encounters with Jesus" /></div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
              <div><label style={styles.label}>Date *</label><input type="date" style={styles.input} value={newDate} onChange={function(e) { setNewDate(e.target.value); }} /></div>
              <div><label style={styles.label}>Status</label>
                <select style={styles.select} value={newStatus} onChange={function(e) { setNewStatus(e.target.value); }}>
                  <option value="planned">Planned</option>
                  <option value="ready">Ready</option>
                  <option value="preached">Preached</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
            <div style={styles.inputGroup}><label style={styles.label}>Notes</label><textarea style={styles.textarea} value={newNotes} onChange={function(e) { setNewNotes(e.target.value); }} rows={2} placeholder="Any preparation notes..." /></div>
            {saveError && <div style={styles.errorPanel}>{saveError}</div>}
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button onClick={function() { setShowAddModal(false); setEditEntry(null); setSaveError(""); }} style={{ padding: "9px 18px", borderRadius: 8, border: "1px solid " + BORDER, background: "transparent", color: STONE, fontSize: 13, cursor: "pointer", fontFamily: FONT_BODY }}>Cancel</button>
              <Button onClick={handleSave}>{"Save Service"}</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── SERVICE ORDER BUILDER ────────────────────────────────────────────────────

function ServiceOrderScreen({ user, library, setForgePrefill, setCurrentScreen, language, voiceProfile, congregationProfile, congregationEnabled }) {
  const [topic, setTopic] = useState("");
  const [scripture, setScripture] = useState("");
  const [serviceType, setServiceType] = useState("sunday-morning");
  const [duration, setDuration] = useState("90");
  const [includeWorship, setIncludeWorship] = useState(true);
  const [includeAltarCall, setIncludeAltarCall] = useState(true);
  const [includeOffering, setIncludeOffering] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [serviceOrder, setServiceOrder] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [editText, setEditText] = useState("");
  const [copyStatus, setCopyStatus] = useState("");
  const [availabilityModal, setAvailabilityModal] = useState(null);
  const [blockDate, setBlockDate] = useState("");

  const SERVICE_TYPES = [
    { value: "sunday-morning", label: "Sunday Morning" },
    { value: "sunday-evening", label: "Sunday Evening" },
    { value: "midweek", label: "Midweek Service" },
    { value: "youth", label: "Youth Service" },
    { value: "special", label: "Special Event" },
    { value: "communion", label: "Communion Service" },
  ];

  // Accept prefill from Planning Center or calendar
  useEffect(function() {
    // topic/scripture may be passed via forgePrefill — handled by parent
  }, []);

  async function handleGenerate() {
    if (!topic.trim()) { setError("Please enter a sermon topic or title."); return; }
    setError(""); setLoading(true); setServiceOrder(null);

    var congregationContext = congregationEnabled && congregationProfile ? buildCongregationContext(congregationProfile) : "";
    var doctrineContext = voiceProfile?.confirmed ? "Doctrine: " + voiceProfile.doctrine + ". Style: " + voiceProfile.style + "." : "";
    var serviceLabel = SERVICE_TYPES.find(function(s) { return s.value === serviceType; }).label;

    var prompt = [
      "Generate a complete service order for a " + duration + "-minute " + serviceLabel + ".",
      "Sermon topic: " + topic.trim(),
      scripture ? "Scripture: " + scripture.trim() : "",
      doctrineContext,
      congregationContext,
      "Include these elements: Welcome, Call to Worship" + (includeWorship ? ", Worship with 3 song suggestions" : "") + ", Scripture Reading, Sermon Introduction" + (includeOffering ? ", Offering" : "") + ", Main Sermon" + (includeAltarCall ? ", Altar Call" : "") + ", Closing Prayer, Benediction.",
      "",
      "For each element write one line in this exact format (no markdown, no bullets):",
      "ORDER|ELEMENT NAME|LEADER|DURATION|NOTES",
      "Example: 1|Welcome & Announcements|Pastor|5 min|Welcome congregation warmly, share upcoming events",
      "Return ONLY the pipe-separated lines, one per element, nothing else.",
    ].filter(Boolean).join("\n");

    try {
      var raw = "";
      await callSermonAPI(prompt, "You are an expert worship pastor. Return ONLY pipe-separated lines in the format: ORDER|ELEMENT|LEADER|DURATION|NOTES. No markdown, no explanation.", false, function(acc) { raw = acc; });

      var lines = raw.split("\n").map(function(l) { return l.trim(); }).filter(function(l) { return l && l.includes("|"); });
      if (lines.length === 0) throw new Error("No service items returned");

      var parsed = lines.map(function(line) {
        var parts = line.split("|");
        return {
          order: parseInt(parts[0]) || 1,
          element: (parts[1] || "").trim(),
          leader: (parts[2] || "Pastor").trim(),
          duration: (parts[3] || "5 min").trim(),
          notes: (parts[4] || "").trim(),
        };
      }).filter(function(item) { return item.element; });

      if (parsed.length === 0) throw new Error("Could not parse service order");
      setServiceOrder({ items: parsed, topic: topic.trim(), scripture: scripture.trim(), serviceType, duration });
    } catch (e) {
      setError(e.message || "Could not generate service order. Please try again.");
    } finally { setLoading(false); }
  }

  function handleEditItem(idx) { setEditingItem(idx); setEditText(serviceOrder.items[idx].notes); }
  function handleSaveEdit(idx) {
    var updated = serviceOrder.items.map(function(item, i) { return i === idx ? Object.assign({}, item, { notes: editText }) : item; });
    setServiceOrder(Object.assign({}, serviceOrder, { items: updated }));
    setEditingItem(null);
  }
  function handleMoveItem(idx, dir) {
    var items = serviceOrder.items.slice();
    var swap = idx + dir;
    if (swap < 0 || swap >= items.length) return;
    var t = items[idx]; items[idx] = items[swap]; items[swap] = t;
    items = items.map(function(item, i) { return Object.assign({}, item, { order: i + 1 }); });
    setServiceOrder(Object.assign({}, serviceOrder, { items }));
  }
  function handleDeleteItem(idx) {
    var items = serviceOrder.items.filter(function(_, i) { return i !== idx; }).map(function(item, i) { return Object.assign({}, item, { order: i + 1 }); });
    setServiceOrder(Object.assign({}, serviceOrder, { items }));
  }
  function handleCopyOrder() {
    var text = serviceOrder.items.map(function(item) { return item.order + ". " + item.element + " [" + item.duration + "] — " + item.leader + "\n   " + item.notes; }).join("\n\n");
    navigator.clipboard.writeText(text);
    setCopyStatus("Copied ✓"); setTimeout(function() { setCopyStatus(""); }, 2000);
  }
  function handleSendToForge() {
    var sermonItem = serviceOrder.items.find(function(i) { return i.element && i.element.toLowerCase().includes("sermon"); });
    setForgePrefill({ title: serviceOrder.topic, scripture: serviceOrder.scripture, angle: sermonItem ? sermonItem.notes : "" });
    setCurrentScreen("sermon-forge");
  }

  var totalMinutes = serviceOrder ? serviceOrder.items.reduce(function(sum, item) { return sum + (parseInt((item.duration || "").replace(/\D/g,"")) || 0); }, 0) : 0;

  return (
    <div>
      <div style={styles.goldAccent} />
      <div style={styles.sectionHeader}>Service Order Builder</div>
      <div style={styles.sectionSub}>Generate a complete AI-powered Sunday service order from your sermon topic. Edit, reorder, and send to Sermon Forge.</div>
      <div className="scp-grid-auto" style={{ gap: 24 }}>
        <div style={styles.card}>
          <div style={styles.cardTitle}>Service Details</div>
          <div style={styles.cardMeta}>Tell us about your service</div>
          <div style={styles.inputGroup}><label style={styles.label}>Sermon Topic *</label><input style={styles.input} value={topic} onChange={function(e) { setTopic(e.target.value); }} placeholder="e.g. The Prodigal Son — Coming Home" /></div>
          <div style={styles.inputGroup}><label style={styles.label}>Key Scripture</label><input style={styles.input} value={scripture} onChange={function(e) { setScripture(e.target.value); }} placeholder="e.g. Luke 15:11-32" /></div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
            <div><label style={styles.label}>Service Type</label><select style={styles.select} value={serviceType} onChange={function(e) { setServiceType(e.target.value); }}>{SERVICE_TYPES.map(function(s) { return <option key={s.value} value={s.value}>{s.label}</option>; })}</select></div>
            <div><label style={styles.label}>Duration</label><select style={styles.select} value={duration} onChange={function(e) { setDuration(e.target.value); }}><option value="60">60 min</option><option value="75">75 min</option><option value="90">90 min</option><option value="105">105 min</option><option value="120">120 min</option></select></div>
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={styles.label}>Include</label>
            {[{ key: "worship", label: "Worship & Songs", state: includeWorship, set: setIncludeWorship }, { key: "offering", label: "Offering", state: includeOffering, set: setIncludeOffering }, { key: "altar", label: "Altar Call", state: includeAltarCall, set: setIncludeAltarCall }].map(function(opt) {
              return (
                <label key={opt.key} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", fontSize: 14, color: CHARCOAL, fontFamily: FONT_BODY, fontWeight: 500, marginTop: 8 }}>
                  <div onClick={function() { opt.set(!opt.state); }} style={{ width: 20, height: 20, borderRadius: 4, border: "2px solid " + (opt.state ? GOLD : BORDER), backgroundColor: opt.state ? GOLD : "transparent", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0, transition: "all 0.15s" }}>
                    {opt.state && <span style={{ color: "#fff", fontSize: 12, fontWeight: 700 }}>✓</span>}
                  </div>
                  {opt.label}
                </label>
              );
            })}
          </div>
          {error && <div style={styles.errorPanel}>{error}</div>}
          <Button onClick={handleGenerate} disabled={loading}>{loading ? "Building..." : "Generate Service Order"}</Button>
        </div>

        <div>
          {!serviceOrder && !loading && (
            <div style={Object.assign({}, styles.card, { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 300, textAlign: "center" })}>
              <div style={{ fontSize: 36, marginBottom: 16 }}>📋</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: CHARCOAL, fontFamily: FONT_DISPLAY, marginBottom: 8 }}>Your service order will appear here</div>
              <div style={{ fontSize: 13, color: STONE_LIGHT }}>Fill in the details and click Generate</div>
            </div>
          )}
          {loading && <div style={Object.assign({}, styles.card, { display: "flex", alignItems: "center", justifyContent: "center", minHeight: 300 })}><span style={{ fontSize: 13, color: STONE, fontStyle: "italic" }}>Building your service order...</span></div>}
          {serviceOrder && (
            <div style={styles.card}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: CHARCOAL, fontFamily: FONT_DISPLAY, marginBottom: 2 }}>{serviceOrder.topic}</div>
                  {serviceOrder.scripture && <div style={{ fontSize: 12, color: STONE_LIGHT }}>{serviceOrder.scripture}</div>}
                  <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
                    <span style={Object.assign({}, styles.tag, styles.tagGold)}>{SERVICE_TYPES.find(function(s) { return s.value === serviceOrder.serviceType; }).label}</span>
                    <span style={Object.assign({}, styles.tag, styles.tagGray)}>{totalMinutes} min</span>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <button onClick={handleCopyOrder} style={{ padding: "6px 12px", border: "1px solid " + BORDER, borderRadius: 6, background: copyStatus ? GOLD : WARM_WHITE, color: copyStatus ? "#fff" : STONE, fontSize: 12, cursor: "pointer", fontFamily: FONT_BODY, fontWeight: 600 }}>{copyStatus || "Copy"}</button>
                  <button onClick={handleSendToForge} style={{ padding: "6px 12px", border: "none", borderRadius: 6, background: GOLD, color: "#fff", fontSize: 12, cursor: "pointer", fontFamily: FONT_BODY, fontWeight: 700 }}>→ Sermon Forge</button>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {serviceOrder.items.map(function(item, idx) {
                  return (
                    <div key={idx} style={{ border: "1px solid " + BORDER, borderRadius: 8, padding: "12px 14px", backgroundColor: IVORY }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                        <div style={{ display: "flex", gap: 10, alignItems: "flex-start", flex: 1 }}>
                          <div style={{ width: 22, height: 22, borderRadius: "50%", backgroundColor: GOLD_PALE, border: "1px solid " + GOLD_BORDER, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: GOLD, flexShrink: 0, marginTop: 1 }}>{item.order}</div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 13, fontWeight: 700, color: CHARCOAL, fontFamily: FONT_BODY, marginBottom: 2 }}>{item.element}</div>
                            <div style={{ display: "flex", gap: 8, marginBottom: 4 }}>
                              <span style={{ fontSize: 11, color: STONE_LIGHT }}>👤 {item.leader}</span>
                              <span style={{ fontSize: 11, color: STONE_LIGHT }}>⏱ {item.duration}</span>
                            </div>
                            {editingItem === idx ? (
                              <div>
                                <textarea value={editText} onChange={function(e) { setEditText(e.target.value); }} style={Object.assign({}, styles.textarea, { minHeight: 60, fontSize: 13, marginBottom: 6 })} />
                                <div style={{ display: "flex", gap: 6 }}>
                                  <button onClick={function() { handleSaveEdit(idx); }} style={{ padding: "4px 10px", border: "none", borderRadius: 5, background: GOLD, color: "#fff", fontSize: 11, cursor: "pointer", fontFamily: FONT_BODY, fontWeight: 700 }}>Save</button>
                                  <button onClick={function() { setEditingItem(null); }} style={{ padding: "4px 10px", border: "1px solid " + BORDER, borderRadius: 5, background: "transparent", color: STONE, fontSize: 11, cursor: "pointer", fontFamily: FONT_BODY }}>Cancel</button>
                                </div>
                              </div>
                            ) : (
                              <div style={{ fontSize: 12, color: STONE, lineHeight: 1.6 }}>{item.notes}</div>
                            )}
                          </div>
                        </div>
                        {editingItem !== idx && (
                          <div style={{ display: "flex", flexDirection: "column", gap: 3, flexShrink: 0 }}>
                            <button onClick={function() { handleMoveItem(idx, -1); }} style={{ padding: "2px 6px", border: "1px solid " + BORDER, borderRadius: 4, background: "transparent", color: STONE, fontSize: 11, cursor: "pointer" }}>↑</button>
                            <button onClick={function() { handleMoveItem(idx, 1); }} style={{ padding: "2px 6px", border: "1px solid " + BORDER, borderRadius: 4, background: "transparent", color: STONE, fontSize: 11, cursor: "pointer" }}>↓</button>
                            <button onClick={function() { handleEditItem(idx); }} style={{ padding: "2px 6px", border: "1px solid " + BORDER, borderRadius: 4, background: "transparent", color: STONE, fontSize: 11, cursor: "pointer" }}>✎</button>
                            <button onClick={function() { handleDeleteItem(idx); }} style={{ padding: "2px 6px", border: "1px solid #FFC5C5", borderRadius: 4, background: "transparent", color: "#C0392B", fontSize: 11, cursor: "pointer" }}>✕</button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── SERMON ANALYTICS ────────────────────────────────────────────────────────

function SermonAnalyticsScreen({ library, user }) {
  var totalSermons = library.length;
  var thisYear = new Date().getFullYear().toString();
  var thisYearSermons = library.filter(function(s) { return s.savedAt && s.savedAt.includes(thisYear); }).length;

  var toolCounts = useMemo(function() {
    var counts = {};
    library.forEach(function(s) {
      var tool = s.sourceTool || "other";
      counts[tool] = (counts[tool] || 0) + 1;
    });
    return counts;
  }, [library]);

  var topTools = Object.entries(toolCounts).sort(function(a, b) { return b[1] - a[1]; }).slice(0, 6);

  var topicCounts = useMemo(function() {
    var counts = {};
    library.forEach(function(s) {
      if (s.sourceTopic) {
        var words = s.sourceTopic.toLowerCase().split(/\s+/).filter(function(w) { return w.length > 3; });
        words.forEach(function(w) { counts[w] = (counts[w] || 0) + 1; });
      }
    });
    return Object.entries(counts).sort(function(a, b) { return b[1] - a[1]; }).slice(0, 12);
  }, [library]);

  var statusCounts = useMemo(function() {
    var counts = { draft: 0, idea: 0, review: 0, final: 0 };
    library.forEach(function(s) { if (s.status && counts[s.status] !== undefined) counts[s.status]++; });
    return counts;
  }, [library]);

  var monthlyData = useMemo(function() {
    var months = {};
    library.forEach(function(s) {
      if (!s.savedAt) return;
      var parts = s.savedAt.split("/");
      if (parts.length >= 2) {
        var key = parts[0] + "/" + (parts[2] || thisYear);
        months[key] = (months[key] || 0) + 1;
      }
    });
    return Object.entries(months).slice(-6).reverse();
  }, [library]);

  var seriesCount = useMemo(function() {
    return new Set(library.map(function(s) { return s.seriesTitle; }).filter(Boolean)).size;
  }, [library]);

  var avgPerMonth = totalSermons > 0 ? (thisYearSermons / Math.max(new Date().getMonth() + 1, 1)).toFixed(1) : 0;

  function StatBox({ value, label, color }) {
    return (
      <div style={{ backgroundColor: WARM_WHITE, border: "1px solid " + BORDER, borderRadius: 10, padding: "16px 18px", boxShadow: "0 1px 6px rgba(44,36,22,0.06)" }}>
        <div style={{ fontSize: 28, fontWeight: 700, color: color || GOLD, lineHeight: 1, marginBottom: 4, fontFamily: "'Georgia', serif" }}>{value}</div>
        <div style={{ fontSize: 11, color: STONE, textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>{label}</div>
      </div>
    );
  }

  function BarRow({ label, value, max, color }) {
    var pct = max > 0 ? Math.round((value / max) * 100) : 0;
    return (
      <div style={{ marginBottom: 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
          <span style={{ fontSize: 13, color: CHARCOAL }}>{label}</span>
          <span style={{ fontSize: 12, color: STONE_LIGHT, fontWeight: 700 }}>{value}</span>
        </div>
        <div style={{ height: 8, background: CREAM, borderRadius: 4, overflow: "hidden" }}>
          <div style={{ height: "100%", width: pct + "%", background: color || GOLD, borderRadius: 4, transition: "width 0.3s ease" }} />
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={styles.sectionSub}>Track your preaching patterns, tool usage, and sermon library growth.</div>

      {/* Key stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 24 }}>
        <StatBox value={totalSermons} label="Total Sermons" />
        <StatBox value={thisYearSermons} label={"Sermons " + thisYear} />
        <StatBox value={seriesCount} label="Active Series" />
        <StatBox value={avgPerMonth} label="Avg / Month" color="#7C3AED" />
      </div>

      <div style={styles.grid2}>
        {/* Tool usage */}
        <div style={styles.card}>
          <div style={styles.cardTitle}>Tool Usage</div>
          <div style={{ marginTop: 16 }}>
            {topTools.length === 0
              ? <div style={{ color: STONE_LIGHT, fontStyle: "italic", fontSize: 13 }}>No data yet.</div>
              : topTools.map(function(t) {
                  var toolNames = { "sermon-forge": "Sermon Forge", "series-planner": "Series Planner", "topic-engine": "Topic Engine", "word-study": "Word Study", "illustrations": "Illustrations", "content-multiplier": "Content Multiplier", "other": "Other" };
                  return <BarRow key={t[0]} label={toolNames[t[0]] || t[0]} value={t[1]} max={topTools[0][1]} />;
                })
            }
          </div>
        </div>

        {/* Status breakdown */}
        <div style={styles.card}>
          <div style={styles.cardTitle}>Sermon Status</div>
          <div style={{ marginTop: 16 }}>
            {[
              { key: "final", label: "Final", color: "#27AE60" },
              { key: "review", label: "In Review", color: "#2980B9" },
              { key: "draft", label: "Draft", color: GOLD },
              { key: "idea", label: "Idea", color: STONE },
            ].map(function(s) {
              return <BarRow key={s.key} label={s.label} value={statusCounts[s.key] || 0} max={totalSermons || 1} color={s.color} />;
            })}
          </div>
        </div>
      </div>

      {/* Top topics */}
      {topicCounts.length > 0 && (
        <div style={Object.assign({}, styles.card, { marginTop: 20 })}>
          <div style={styles.cardTitle}>Top Sermon Topics</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
            {topicCounts.map(function(t) {
              return (
                <span key={t[0]} style={{ padding: "4px 12px", borderRadius: 16, background: GOLD_PALE, color: GOLD, fontSize: 12, fontWeight: 700, border: "1px solid " + GOLD }}>
                  {t[0]} <span style={{ opacity: 0.7 }}>({t[1]})</span>
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Monthly breakdown */}
      {monthlyData.length > 0 && (
        <div style={Object.assign({}, styles.card, { marginTop: 20 })}>
          <div style={styles.cardTitle}>Recent Monthly Activity</div>
          <div style={{ marginTop: 16 }}>
            {monthlyData.map(function(m) {
              return <BarRow key={m[0]} label={m[0]} value={m[1]} max={Math.max.apply(null, monthlyData.map(function(x) { return x[1]; }))} />;
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── EMAIL DEVOTIONAL ─────────────────────────────────────────────────────────

function EmailDevotionalScreen({ currentUser, library }) {
  const [sermonId, setSermonId] = useState("");
  const [devotionalContent, setDevotionalContent] = useState("");
  const [emailList, setEmailList] = useState("");
  const [generating, setGenerating] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [generatedFor, setGeneratedFor] = useState("");

  var selectedSermon = library.find(function(s) { return s.id == sermonId; });

  async function handleGenerateDevotional() {
    if (!selectedSermon) { setError("Please select a sermon."); return; }
    setError(""); setGenerating(true); setDevotionalContent("");
    try {
      var sys = "You are a devotional writer. Write a 3-day devotional based on the provided sermon. Each day must include a Day title, Scripture verse, 2-3 paragraph Reflection, a Prayer, and an Application question. Write in a warm, personal, pastoral tone.";
      var prompt = "Write a 3-day devotional based on this sermon.\nTitle: " + selectedSermon.title + "\nScripture: " + (selectedSermon.scripture || "") + "\nSermon content: " + (selectedSermon.content || "").slice(0, 800);
      var result = "";
      await callSermonAPI(prompt, sys, false, function(acc) { result = acc; setDevotionalContent(acc); });
      setGeneratedFor(selectedSermon.title);
      incrementUsage("fast");
    } catch (e) {
      setError(e.message || "Generation failed.");
    } finally { setGenerating(false); }
  }

  async function handleSend() {
    var emails = emailList.split(/[\n,;]+/).map(function(e) { return e.trim(); }).filter(function(e) { return e.includes("@"); });
    if (emails.length === 0) { setError("Please enter at least one valid email address."); return; }
    if (!devotionalContent.trim()) { setError("Please generate or paste devotional content first."); return; }
    setSending(true); setError(""); setSuccess("");
    try {
      var isLocal = window.location.hostname === "localhost";
      var base = isLocal ? "https://sermoncraft-pro.vercel.app" : "";
      var response = await fetch(base + "/api/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "devotional",
          emails: emails,
          devotional: cleanAIText(devotionalContent).replace(/\*\*/g, "").replace(/\*/g, ""),
          sermonTitle: selectedSermon?.title || generatedFor || "",
          pastorName: currentUser?.name || "",
          churchName: currentUser?.church || "",
        }),
      });
      var data = await response.json();
      if (data.sent > 0) {
        setSuccess("Devotional sent to " + data.sent + " recipient" + (data.sent !== 1 ? "s" : "") + " successfully!");
      } else {
        setError("Send failed: " + (data.errors?.[0] || "Unknown error"));
      }
    } catch (e) {
      setError(e.message || "Send failed.");
    } finally { setSending(false); }
  }

  return (
    <div>
      <div style={styles.sectionSub}>Generate a 3-day devotional from any sermon and send it directly to your congregation.</div>

      <div style={styles.card}>
        <div style={styles.cardTitle}>1. Select a Sermon</div>
        <div style={{ marginTop: 12 }}>
          <select style={styles.select} value={sermonId} onChange={function(e) { setSermonId(e.target.value); setDevotionalContent(""); setGeneratedFor(""); }}>
            <option value="">Select a sermon from your library...</option>
            {library.map(function(s) { return <option key={s.id} value={s.id}>{s.title}{s.scripture ? " — " + s.scripture : ""}</option>; })}
          </select>
        </div>
        <div style={{ marginTop: 12 }}>
          <Button onClick={handleGenerateDevotional} disabled={generating || !sermonId}>
            {generating ? "Generating..." : "Generate 3-Day Devotional"}
          </Button>
        </div>
      </div>

      {(devotionalContent || generating) && (
        <div style={Object.assign({}, styles.card, { marginTop: 16 })}>
          <div style={styles.cardTitle}>2. Devotional Content</div>
          <div style={{ fontSize: 11, color: STONE_LIGHT, marginBottom: 8, marginTop: 4 }}>You can edit before sending</div>
          <textarea
            style={Object.assign({}, styles.textarea, { minHeight: 300 })}
            value={cleanAIText(devotionalContent).replace(/\*\*/g, "").replace(/\*/g, "")}
            onChange={function(e) { setDevotionalContent(e.target.value); }}
            placeholder={generating ? "Generating devotional..." : ""}
          />
        </div>
      )}

      {devotionalContent && (
        <div style={Object.assign({}, styles.card, { marginTop: 16 })}>
          <div style={styles.cardTitle}>3. Send to Congregation</div>
          <div style={{ marginTop: 12 }}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Email Addresses</label>
              <textarea
                style={Object.assign({}, styles.textarea, { minHeight: 100 })}
                value={emailList}
                onChange={function(e) { setEmailList(e.target.value); }}
                placeholder={"pastor@church.com, member@church.com\nOne per line or comma-separated. Up to 50 recipients."}
              />
            </div>
            <div style={{ fontSize: 12, color: STONE_LIGHT, marginBottom: 12 }}>
              Emails will be sent from <strong>noreply@sermoncraftpro.com</strong>
            </div>
            <Button onClick={handleSend} disabled={sending || !emailList.trim()}>
              {sending ? "Sending..." : "Send Devotional"}
            </Button>
          </div>
        </div>
      )}

      {error && <div style={Object.assign({}, styles.errorPanel, { marginTop: 16 })}>{"\u26A0 "}{error}</div>}
      {success && <div style={{ backgroundColor: "#F0FFF4", border: "1px solid #9AE6B4", borderRadius: 10, padding: "14px 18px", fontSize: 13, color: "#276749", marginTop: 16 }}>✓ {success}</div>}
    </div>
  );
}

// ─── PRAYER REQUESTS ─────────────────────────────────────────────────────────

function PrayerRequestsScreen({ church, user }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [newRequest, setNewRequest] = useState("");
  const [isAnon, setIsAnon] = useState(false);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState("active");

  useEffect(function() {
    if (!church?.id) { setLoading(false); return; }
    import("./lib/db").then(function({ fetchPrayerRequests }) {
      fetchPrayerRequests(church.id).then(function(data) { setRequests(data); }).finally(function() { setLoading(false); });
    });
  }, [church]);

  async function handleAdd() {
    if (!newRequest.trim()) return;
    setSaving(true);
    try {
      const { insertPrayerRequest } = await import("./lib/db");
      var saved = await insertPrayerRequest(church.id, user.id, { name: isAnon ? "Anonymous" : newName || "Anonymous", request: newRequest, isAnonymous: isAnon });
      setRequests(function(prev) { return [saved, ...prev]; });
      setNewName(""); setNewRequest(""); setIsAnon(false); setShowAdd(false);
    } catch (e) {} finally { setSaving(false); }
  }

  async function handleUpdateStatus(id, status) {
    try {
      const { updatePrayerStatus } = await import("./lib/db");
      await updatePrayerStatus(id, status);
      setRequests(function(prev) { return prev.map(function(r) { return r.id === id ? Object.assign({}, r, { status }) : r; }); });
    } catch (e) {}
  }

  var filtered = requests.filter(function(r) { return filter === "all" || r.status === filter; });
  var statusColors = { active: { bg: GOLD_PALE, color: GOLD }, answered: { bg: "#EAFAF1", color: "#27AE60" }, archived: { bg: CREAM, color: STONE } };

  if (!church) return <div><div style={styles.sectionSub}>Set up your church first to manage prayer requests.</div></div>;

  return (
    <div>
      <div style={styles.sectionSub}>Collect, track, and celebrate answered prayers in your congregation.</div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", gap: 4, background: CREAM, borderRadius: 8, padding: 4, border: "1px solid " + BORDER }}>
          {["active", "answered", "archived", "all"].map(function(f) {
            return <button key={f} onClick={function() { setFilter(f); }} style={{ padding: "5px 12px", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 700, fontFamily: "'Georgia', serif", background: filter === f ? GOLD : "transparent", color: filter === f ? "#fff" : STONE, textTransform: "capitalize" }}>{f}</button>;
          })}
        </div>
        <Button onClick={function() { setShowAdd(true); }}>+ Add Request</Button>
      </div>

      {showAdd && (
        <div style={Object.assign({}, styles.card, { marginBottom: 16, border: "1px solid " + GOLD })}>
          <div style={styles.cardTitle}>New Prayer Request</div>
          <div style={{ marginTop: 12 }}>
            {!isAnon && <div style={styles.inputGroup}><label style={styles.label}>Name</label><input style={styles.input} value={newName} onChange={function(e) { setNewName(e.target.value); }} placeholder="Congregation member's name" /></div>}
            <div style={styles.inputGroup}><label style={styles.label}>Prayer Request</label><textarea style={styles.textarea} value={newRequest} onChange={function(e) { setNewRequest(e.target.value); }} rows={3} placeholder="Describe the prayer need..." /></div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <input type="checkbox" id="anon" checked={isAnon} onChange={function(e) { setIsAnon(e.target.checked); }} />
              <label htmlFor="anon" style={{ fontSize: 13, color: STONE, cursor: "pointer" }}>Submit anonymously</label>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <Button onClick={handleAdd} disabled={saving || !newRequest.trim()}>{saving ? "Saving..." : "Add Request"}</Button>
              <Button variant="ghost" onClick={function() { setShowAdd(false); }}>Cancel</Button>
            </div>
          </div>
        </div>
      )}

      {loading && <div style={{ color: STONE_LIGHT, fontStyle: "italic", fontSize: 13 }}>Loading...</div>}
      {!loading && filtered.length === 0 && <div style={Object.assign({}, styles.card, { textAlign: "center", padding: 32, color: STONE_LIGHT })}>No {filter === "all" ? "" : filter} prayer requests.</div>}

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {filtered.map(function(r) {
          var sc = statusColors[r.status] || statusColors.active;
          return (
            <div key={r.id} style={styles.card}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <span style={{ fontWeight: 700, fontSize: 14, color: CHARCOAL }}>{r.is_anonymous ? "Anonymous" : (r.name || "Anonymous")}</span>
                    <span style={Object.assign({}, styles.tag, { backgroundColor: sc.bg, color: sc.color })}>{r.status}</span>
                    <span style={{ fontSize: 11, color: STONE_LIGHT }}>{r.created_at ? new Date(r.created_at).toLocaleDateString() : ""}</span>
                  </div>
                  <div style={{ fontSize: 14, color: STONE, lineHeight: 1.6 }}>{r.request}</div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4, flexShrink: 0 }}>
                  {r.status === "active" && <button onClick={function() { handleUpdateStatus(r.id, "answered"); }} style={{ padding: "4px 10px", border: "none", borderRadius: 6, background: "#EAFAF1", color: "#27AE60", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "'Georgia', serif" }}>✓ Answered</button>}
                  {r.status !== "archived" && <button onClick={function() { handleUpdateStatus(r.id, "archived"); }} style={{ padding: "4px 10px", border: "1px solid " + BORDER, borderRadius: 6, background: "transparent", color: STONE, fontSize: 11, cursor: "pointer", fontFamily: "'Georgia', serif" }}>Archive</button>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── ATTENDANCE TRACKER ───────────────────────────────────────────────────────

function AttendanceScreen({ church }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newDate, setNewDate] = useState("");
  const [newCount, setNewCount] = useState("");
  const [newNotes, setNewNotes] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(function() {
    if (!church?.id) { setLoading(false); return; }
    import("./lib/db").then(function({ fetchAttendance }) {
      fetchAttendance(church.id).then(function(data) { setRecords(data); }).finally(function() { setLoading(false); });
    });
  }, [church]);

  async function handleAdd() {
    if (!newDate || !newCount) return;
    setSaving(true);
    try {
      const { insertAttendance } = await import("./lib/db");
      var saved = await insertAttendance(church.id, { serviceDate: newDate, count: parseInt(newCount), notes: newNotes });
      setRecords(function(prev) { return [saved, ...prev]; });
      setNewDate(""); setNewCount(""); setNewNotes(""); setShowAdd(false);
    } catch (e) {} finally { setSaving(false); }
  }

  var avgAttendance = records.length > 0 ? Math.round(records.reduce(function(sum, r) { return sum + (r.count || 0); }, 0) / records.length) : 0;
  var maxAttendance = records.length > 0 ? Math.max.apply(null, records.map(function(r) { return r.count || 0; })) : 0;
  var trend = records.length >= 2 ? (records[0].count > records[1].count ? "↑" : records[0].count < records[1].count ? "↓" : "→") : "—";

  if (!church) return <div><div style={styles.sectionSub}>Set up your church first to track attendance.</div></div>;

  return (
    <div>
      <div style={styles.sectionSub}>Track Sunday service attendance over time.</div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 20 }}>
        <div style={styles.statCard}><div style={styles.statValue}>{avgAttendance}</div><div style={styles.statLabel}>Avg Attendance</div></div>
        <div style={styles.statCard}><div style={styles.statValue}>{maxAttendance}</div><div style={styles.statLabel}>Highest Service</div></div>
        <div style={styles.statCard}><div style={Object.assign({}, styles.statValue, { color: trend === "↑" ? "#27AE60" : trend === "↓" ? "#C0392B" : GOLD })}>{trend}</div><div style={styles.statLabel}>Recent Trend</div></div>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
        <Button onClick={function() { setShowAdd(true); }}>+ Record Attendance</Button>
      </div>

      {showAdd && (
        <div style={Object.assign({}, styles.card, { marginBottom: 16, border: "1px solid " + GOLD })}>
          <div style={styles.cardTitle}>Record Service Attendance</div>
          <div style={{ marginTop: 12, display: "flex", gap: 12, flexWrap: "wrap" }}>
            <div style={Object.assign({}, styles.inputGroup, { flex: 1 })}><label style={styles.label}>Service Date</label><input type="date" style={styles.input} value={newDate} onChange={function(e) { setNewDate(e.target.value); }} /></div>
            <div style={Object.assign({}, styles.inputGroup, { flex: 1 })}><label style={styles.label}>Attendance Count</label><input type="number" style={styles.input} value={newCount} onChange={function(e) { setNewCount(e.target.value); }} placeholder="e.g. 250" /></div>
          </div>
          <div style={styles.inputGroup}><label style={styles.label}>Notes (optional)</label><input style={styles.input} value={newNotes} onChange={function(e) { setNewNotes(e.target.value); }} placeholder="e.g. Easter Sunday, Guest speaker" /></div>
          <div style={{ display: "flex", gap: 8 }}>
            <Button onClick={handleAdd} disabled={saving || !newDate || !newCount}>{saving ? "Saving..." : "Save"}</Button>
            <Button variant="ghost" onClick={function() { setShowAdd(false); }}>Cancel</Button>
          </div>
        </div>
      )}

      <div style={styles.card}>
        <div style={styles.cardTitle}>Attendance History</div>
        {loading && <div style={{ color: STONE_LIGHT, fontStyle: "italic", fontSize: 13, marginTop: 12 }}>Loading...</div>}
        {!loading && records.length === 0 && <div style={{ color: STONE_LIGHT, fontStyle: "italic", fontSize: 13, marginTop: 12 }}>No records yet. Add your first attendance entry above.</div>}
        {records.length > 0 && (
          <div style={{ marginTop: 12 }}>
            {records.map(function(r, i) {
              var pct = maxAttendance > 0 ? Math.round((r.count / maxAttendance) * 100) : 0;
              return (
                <div key={r.id || i} style={{ padding: "12px 0", borderBottom: "1px solid " + BORDER }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <div>
                      <span style={{ fontWeight: 700, fontSize: 14, color: CHARCOAL }}>{r.service_date ? new Date(r.service_date + "T12:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" }) : ""}</span>
                      {r.notes && <span style={{ fontSize: 12, color: STONE_LIGHT, marginLeft: 8 }}>{r.notes}</span>}
                    </div>
                    <span style={{ fontWeight: 700, fontSize: 18, color: GOLD }}>{r.count}</span>
                  </div>
                  <div style={{ height: 6, background: CREAM, borderRadius: 3 }}>
                    <div style={{ height: "100%", width: pct + "%", background: GOLD, borderRadius: 3 }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── PASTOR PERFORMANCE ───────────────────────────────────────────────────────

function PastorPerformanceScreen({ church }) {
  const [members, setMembers] = useState([]);
  const [sermons, setSermons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPastor, setSelectedPastor] = useState(null);

  useEffect(function() {
    if (!church?.id) { setLoading(false); return; }
    Promise.all([
      import("./lib/db").then(function({ fetchChurchMembers }) { return fetchChurchMembers(church.id); }),
      import("./lib/db").then(function({ fetchChurchSermons }) { return fetchChurchSermons(church.id); }),
    ]).then(function(results) {
      setMembers(results[0]);
      setSermons(results[1]);
    }).catch(function() {}).finally(function() { setLoading(false); });
  }, [church]);

  var pastorStats = useMemo(function() {
    return members.map(function(m) {
      var ps = sermons.filter(function(s) { return s.user_id === m.id; });
      var tools = {};
      ps.forEach(function(s) { if (s.sourceTool) tools[s.sourceTool] = (tools[s.sourceTool] || 0) + 1; });
      var topTool = Object.entries(tools).sort(function(a, b) { return b[1] - a[1]; })[0];
      var thisYear = new Date().getFullYear().toString();
      var thisYearCount = ps.filter(function(s) { return s.savedAt && s.savedAt.includes(thisYear); }).length;
      var seriesCount = new Set(ps.map(function(s) { return s.seriesTitle; }).filter(Boolean)).size;

      // Scripture book coverage
      var books = {};
      ps.forEach(function(s) {
        if (s.scripture) {
          var book = s.scripture.replace(/\s*\d+.*$/, "").trim();
          if (book) books[book] = (books[book] || 0) + 1;
        }
      });
      var topBooks = Object.entries(books).sort(function(a, b) { return b[1] - a[1]; }).slice(0, 5);

      // Monthly frequency last 6 months
      var monthly = {};
      ps.forEach(function(s) {
        if (!s.savedAt) return;
        var parts = s.savedAt.split("/");
        if (parts.length >= 2) {
          var key = parts[0] + "/" + (parts[2] || thisYear);
          monthly[key] = (monthly[key] || 0) + 1;
        }
      });

      // Last active check
      var lastSermon = ps[0];
      var daysSinceActive = 999;
      if (lastSermon?.savedAt) {
        var parts = lastSermon.savedAt.split("/");
        if (parts.length === 3) {
          var lastDate = new Date(parts[2], parts[0] - 1, parts[1]);
          daysSinceActive = Math.floor((new Date() - lastDate) / (1000 * 60 * 60 * 24));
        }
      }

      var toolNames = { "sermon-forge": "Sermon Forge", "series-planner": "Series Planner", "topic-engine": "Topic Engine", "word-study": "Word Study", "illustrations": "Illustrations", "content-multiplier": "Content Multiplier" };

      return {
        id: m.id,
        name: m.full_name || m.email,
        title: m.title || "Pastor",
        email: m.email,
        totalSermons: ps.length,
        thisYear: thisYearCount,
        seriesCount: seriesCount,
        topTool: topTool ? (toolNames[topTool[0]] || topTool[0]) : "—",
        topBooks: topBooks,
        monthly: monthly,
        daysSinceActive: daysSinceActive,
        lastActive: lastSermon?.savedAt || "—",
        needsAttention: daysSinceActive > 30 && ps.length > 0,
        tools: Object.entries(tools).map(function(t) { return { name: toolNames[t[0]] || t[0], count: t[1] }; }).sort(function(a, b) { return b.count - a.count; }),
      };
    });
  }, [members, sermons]);

  if (!church) return <div><div style={styles.sectionSub}>Set up your church first to view pastor performance.</div></div>;

  var maxSermons = pastorStats.length > 0 ? Math.max.apply(null, pastorStats.map(function(p) { return p.totalSermons; })) : 1;

  return (
    <div>
      <div style={styles.sectionSub}>Track output, scripture coverage, tool usage, and activity across your pastoral team.</div>

      {loading && <div style={{ color: STONE_LIGHT, fontStyle: "italic", fontSize: 13 }}>Loading...</div>}
      {!loading && pastorStats.length === 0 && (
        <div style={Object.assign({}, styles.card, { textAlign: "center", padding: 40, color: STONE_LIGHT })}>No pastors found. Invite team members in Pastor Accounts.</div>
      )}

      {/* Needs attention banner */}
      {pastorStats.filter(function(p) { return p.needsAttention; }).length > 0 && (
        <div style={{ background: "#FFF8F0", border: "1px solid #E67E22", borderRadius: 10, padding: "12px 16px", marginBottom: 20, fontSize: 13, color: "#8B4513" }}>
          <strong>Needs Attention:</strong> {pastorStats.filter(function(p) { return p.needsAttention; }).map(function(p) { return p.name; }).join(", ")} {pastorStats.filter(function(p) { return p.needsAttention; }).length === 1 ? "hasn't" : "haven't"} generated a sermon in over 30 days.
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {pastorStats.map(function(p) {
          var isSelected = selectedPastor === p.id;
          return (
            <div key={p.id} style={Object.assign({}, styles.card, p.needsAttention ? { borderLeft: "3px solid #E67E22" } : {})}>
              {/* Header row */}
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 46, height: 46, borderRadius: "50%", background: p.needsAttention ? "#E67E22" : GOLD, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 16, fontFamily: "'Georgia', serif", flexShrink: 0 }}>
                    {(p.name || "P").split(" ").map(function(n) { return n[0]; }).join("").slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ fontWeight: 700, fontSize: 15, color: CHARCOAL }}>{p.name}</div>
                      {p.needsAttention && <span style={Object.assign({}, styles.tag, { background: "#FFF8F0", color: "#E67E22", border: "1px solid #E67E22" })}>Inactive 30+ days</span>}
                    </div>
                    <div style={{ fontSize: 12, color: STONE_LIGHT }}>{p.title} · {p.email}</div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 20, flexWrap: "wrap", alignItems: "center" }}>
                  {[
                    { label: "Total", value: p.totalSermons },
                    { label: "This Year", value: p.thisYear },
                    { label: "Series", value: p.seriesCount },
                  ].map(function(stat) {
                    return (
                      <div key={stat.label} style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 22, fontWeight: 700, color: GOLD, fontFamily: "'Georgia', serif" }}>{stat.value}</div>
                        <div style={{ fontSize: 10, color: STONE_LIGHT, textTransform: "uppercase", letterSpacing: "0.06em" }}>{stat.label}</div>
                      </div>
                    );
                  })}
                  <button onClick={function() { setSelectedPastor(isSelected ? null : p.id); }} style={{ padding: "5px 12px", border: "1px solid " + BORDER, borderRadius: 6, background: isSelected ? GOLD : "transparent", color: isSelected ? "#fff" : STONE, fontSize: 11, cursor: "pointer", fontFamily: "'Georgia', serif" }}>
                    {isSelected ? "Less" : "Details"}
                  </button>
                </div>
              </div>

              {/* Sermon output bar */}
              <div style={{ marginTop: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: STONE_LIGHT, marginBottom: 4 }}>
                  <span>Sermon Output</span>
                  <span>{p.totalSermons} total · Last: {p.lastActive}</span>
                </div>
                <div style={{ height: 8, background: CREAM, borderRadius: 4 }}>
                  <div style={{ height: "100%", width: (maxSermons > 0 ? Math.round((p.totalSermons / maxSermons) * 100) : 0) + "%", background: p.needsAttention ? "#E67E22" : GOLD, borderRadius: 4 }} />
                </div>
              </div>

              {/* Expanded detail */}
              {isSelected && (
                <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid " + BORDER }}>
                  <div style={styles.grid2}>
                    {/* Tool usage */}
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: CHARCOAL, marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.06em" }}>Tool Usage</div>
                      {p.tools.length === 0 ? <div style={{ fontSize: 13, color: STONE_LIGHT, fontStyle: "italic" }}>No data</div> : p.tools.map(function(t) {
                        var maxTool = p.tools[0].count;
                        return (
                          <div key={t.name} style={{ marginBottom: 8 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 3 }}>
                              <span style={{ color: CHARCOAL }}>{t.name}</span>
                              <span style={{ color: STONE_LIGHT, fontWeight: 700 }}>{t.count}</span>
                            </div>
                            <div style={{ height: 6, background: CREAM, borderRadius: 3 }}>
                              <div style={{ height: "100%", width: Math.round((t.count / maxTool) * 100) + "%", background: GOLD, borderRadius: 3 }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Scripture coverage */}
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: CHARCOAL, marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.06em" }}>Top Scripture Books</div>
                      {p.topBooks.length === 0 ? <div style={{ fontSize: 13, color: STONE_LIGHT, fontStyle: "italic" }}>No data</div> : (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                          {p.topBooks.map(function(b) {
                            return (
                              <span key={b[0]} style={{ padding: "4px 10px", borderRadius: 16, background: GOLD_PALE, color: GOLD, fontSize: 12, fontWeight: 700, border: "1px solid " + GOLD }}>
                                {b[0]} <span style={{ opacity: 0.7 }}>({b[1]})</span>
                              </span>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── ADMIN SCREENS ────────────────────────────────────────────────────────────

function ChurchOverviewScreen({ church, user }) {
  const [members, setMembers] = useState([]);
  const [sermons, setSermons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [campuses, setCampuses] = useState([]);
  const [showAddCampus, setShowAddCampus] = useState(false);
  const [editCampus, setEditCampus] = useState(null);
  const [campusName, setCampusName] = useState("");
  const [campusCity, setCampusCity] = useState("");
  const [campusPastor, setCampusPastor] = useState("");
  const [campusMembers, setCampusMembers] = useState("");
  const [campusStatus, setCampusStatus] = useState("active");
  const [savingCampus, setSavingCampus] = useState(false);

  useEffect(function() {
    if (!church) { setLoading(false); return; }
    Promise.all([
      import("./lib/db").then(function({ fetchChurchMembers }) { return fetchChurchMembers(church.id); }),
      import("./lib/db").then(function({ fetchChurchSermons }) { return fetchChurchSermons(church.id); }),
    ]).then(function(results) {
      setMembers(results[0]);
      setSermons(results[1]);
      // Load campuses from localStorage (Supabase branches table optional)
      var stored = localStorage.getItem("scp_campuses_" + church.id);
      if (stored) { try { setCampuses(JSON.parse(stored)); } catch (e) {} }
    }).catch(function() {}).finally(function() { setLoading(false); });
  }, [church]);

  function saveCampuses(list) {
    setCampuses(list);
    localStorage.setItem("scp_campuses_" + church.id, JSON.stringify(list));
  }

  function handleSaveCampus() {
    if (!campusName.trim()) return;
    setSavingCampus(true);
    var newCampus = {
      id: editCampus ? editCampus.id : Date.now().toString(),
      name: campusName, city: campusCity, pastor: campusPastor,
      membersCount: campusMembers ? parseInt(campusMembers) : 0,
      status: campusStatus,
    };
    var updated = editCampus
      ? campuses.map(function(c) { return c.id === editCampus.id ? newCampus : c; })
      : [...campuses, newCampus];
    saveCampuses(updated);
    setCampusName(""); setCampusCity(""); setCampusPastor(""); setCampusMembers(""); setCampusStatus("active");
    setShowAddCampus(false); setEditCampus(null); setSavingCampus(false);
  }

  function openEditCampus(campus) {
    setEditCampus(campus);
    setCampusName(campus.name || ""); setCampusCity(campus.city || "");
    setCampusPastor(campus.pastor || ""); setCampusMembers(campus.membersCount ? String(campus.membersCount) : "");
    setCampusStatus(campus.status || "active");
    setShowAddCampus(true);
  }

  function handleDeleteCampus(id) {
    saveCampuses(campuses.filter(function(c) { return c.id !== id; }));
  }

  var totalCampusMembers = campuses.reduce(function(sum, c) { return sum + (c.membersCount || 0); }, 0);
  var activeCampuses = campuses.filter(function(c) { return c.status === "active"; }).length;

  if (!church) return <div><div style={styles.sectionSub}>No church set up yet. Go to Church Settings to create your church.</div></div>;

  return (
    <div>
      <div style={styles.sectionSub}>{(church.denomination || "") + (church.denomination && church.city ? " · " : "") + (church.city || "") + (church.founded ? " · Est. " + church.founded : "")}</div>

      {/* Key stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 24 }}>
        <StatCard value={activeCampuses || 1} label="Campuses" />
        <StatCard value={members.length} label="Pastors" />
        <StatCard value={sermons.length} label="Total Sermons" />
        <StatCard value={totalCampusMembers || church.members || "—"} label="Members" />
      </div>

      {/* Campus Management */}
      <div style={Object.assign({}, styles.card, { marginBottom: 20 })}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={styles.cardTitle}>Campus Locations</div>
          <Button onClick={function() { setEditCampus(null); setCampusName(""); setCampusCity(""); setCampusPastor(""); setCampusMembers(""); setCampusStatus("active"); setShowAddCampus(true); }}>+ Add Campus</Button>
        </div>

        {campuses.length === 0 && (
          <div style={{ color: STONE_LIGHT, fontStyle: "italic", fontSize: 13, padding: "8px 0" }}>
            No campuses added yet. Add your main campus and any additional locations.
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
          {/* Main church card */}
          <div style={{ background: CHARCOAL, borderRadius: 12, padding: "18px 20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: GOLD, textTransform: "uppercase", letterSpacing: "0.08em" }}>Main Church</div>
              <span style={Object.assign({}, styles.tag, { backgroundColor: "rgba(184,134,11,0.2)", color: GOLD })}>Active</span>
            </div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 4 }}>{church.name}</div>
            <div style={{ fontSize: 13, color: STONE_LIGHT }}>{church.city || "—"}</div>
            {members.length > 0 && <div style={{ fontSize: 12, color: STONE_LIGHT, marginTop: 4 }}>{members.length} pastor{members.length !== 1 ? "s" : ""}</div>}
          </div>

          {campuses.map(function(campus) {
            var isActive = campus.status === "active";
            return (
              <div key={campus.id} style={{ background: WARM_WHITE, border: "1px solid " + BORDER, borderRadius: 12, padding: "18px 20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: STONE_LIGHT, textTransform: "uppercase", letterSpacing: "0.08em" }}>Campus</div>
                  <span style={Object.assign({}, styles.tag, isActive ? styles.tagGreen : styles.tagGray)}>{campus.status}</span>
                </div>
                <div style={{ fontSize: 15, fontWeight: 700, color: CHARCOAL, marginBottom: 4 }}>{campus.name}</div>
                {campus.city && <div style={{ fontSize: 13, color: STONE }}>{campus.city}</div>}
                {campus.pastor && <div style={{ fontSize: 12, color: STONE_LIGHT, marginTop: 4 }}>Pastor: {campus.pastor}</div>}
                {campus.membersCount > 0 && <div style={{ fontSize: 12, color: STONE_LIGHT }}>{campus.membersCount} members</div>}
                <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                  <button onClick={function() { openEditCampus(campus); }} style={{ padding: "4px 10px", border: "1px solid " + BORDER, borderRadius: 6, background: "transparent", color: STONE, fontSize: 11, cursor: "pointer", fontFamily: "'Georgia', serif" }}>Edit</button>
                  <button onClick={function() { handleDeleteCampus(campus.id); }} style={{ padding: "4px 10px", border: "1px solid #FFC5C5", borderRadius: 6, background: "transparent", color: "#C0392B", fontSize: 11, cursor: "pointer", fontFamily: "'Georgia', serif" }}>Remove</button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={styles.grid2}>
        <div style={styles.card}>
          <div style={styles.cardTitle}>Pastoral Team</div>
          <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 10 }}>
            {loading && <div style={{ color: STONE_LIGHT, fontStyle: "italic", fontSize: 13 }}>Loading...</div>}
            {!loading && members.length === 0 && <div style={{ color: STONE_LIGHT, fontStyle: "italic", fontSize: 13 }}>No pastors added yet.</div>}
            {members.map(function(m) {
              var pastorSermons = sermons.filter(function(s) { return s.user_id === m.id; }).length;
              return (
                <div key={m.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid " + BORDER }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{m.full_name || m.email}</div>
                    <div style={{ fontSize: 12, color: STONE_LIGHT }}>{m.title || "Pastor"} · {m.email}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: GOLD }}>{pastorSermons}</div>
                    <div style={{ fontSize: 10, color: STONE_LIGHT, textTransform: "uppercase" }}>Sermons</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div style={styles.card}>
          <div style={styles.cardTitle}>Recent Sermons</div>
          <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 8 }}>
            {loading && <div style={{ color: STONE_LIGHT, fontStyle: "italic", fontSize: 13 }}>Loading...</div>}
            {!loading && sermons.length === 0 && <div style={{ color: STONE_LIGHT, fontStyle: "italic", fontSize: 13 }}>No sermons yet.</div>}
            {sermons.slice(0, 6).map(function(s) {
              return (
                <div key={s.id} style={{ padding: "8px 0", borderBottom: "1px solid " + BORDER }}>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{s.title}</div>
                  <div style={{ fontSize: 12, color: STONE_LIGHT }}>{(s.pastorName || "") + " · " + s.savedAt}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Add/Edit Campus Modal */}
      {showAddCampus && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: 16 }}>
          <div style={{ background: WARM_WHITE, borderRadius: 16, padding: "28px 28px", width: "100%", maxWidth: 480, boxShadow: "0 8px 40px rgba(0,0,0,0.25)", fontFamily: "'Georgia', serif" }}>
            <div style={{ fontWeight: 700, fontSize: 18, color: CHARCOAL, marginBottom: 16 }}>{editCampus ? "Edit Campus" : "Add Campus"}</div>
            <div style={styles.inputGroup}><label style={styles.label}>Campus Name</label><input style={styles.input} value={campusName} onChange={function(e) { setCampusName(e.target.value); }} placeholder="e.g. East Side Campus" /></div>
            <div style={styles.inputGroup}><label style={styles.label}>City / Location</label><input style={styles.input} value={campusCity} onChange={function(e) { setCampusCity(e.target.value); }} placeholder="e.g. Hurst, TX" /></div>
            <div style={styles.inputGroup}><label style={styles.label}>Campus Pastor</label><input style={styles.input} value={campusPastor} onChange={function(e) { setCampusPastor(e.target.value); }} placeholder="e.g. Pastor John Smith" /></div>
            <div style={styles.grid2}>
              <div style={styles.inputGroup}><label style={styles.label}>Member Count</label><input type="number" style={styles.input} value={campusMembers} onChange={function(e) { setCampusMembers(e.target.value); }} placeholder="e.g. 250" /></div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Status</label>
                <select style={styles.select} value={campusStatus} onChange={function(e) { setCampusStatus(e.target.value); }}>
                  <option value="active">Active</option>
                  <option value="planting">Church Plant</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button onClick={function() { setShowAddCampus(false); setEditCampus(null); }} style={{ padding: "9px 18px", borderRadius: 8, border: "1px solid " + BORDER, background: "transparent", color: STONE, fontSize: 13, cursor: "pointer", fontFamily: "'Georgia', serif" }}>Cancel</button>
              <Button onClick={handleSaveCampus} disabled={savingCampus || !campusName.trim()}>Save Campus</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function BranchesScreen({ church }) {
  if (!church) return <div><div style={styles.sectionSub}>No church set up yet. Go to Church Settings to create your church.</div></div>;
  return <div><div style={styles.sectionSub}>Manage all church campuses and branch locations.</div><div style={styles.card}><div style={{ color: STONE_LIGHT, fontStyle: "italic", fontSize: 14, padding: "12px 0" }}>Branch management coming soon. Your church: <strong style={{ color: CHARCOAL }}>{church.name}</strong>{church.city ? " · " + church.city : ""}</div></div></div>;
}

function ActivityScreen({ church }) {
  const [sermons, setSermons] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(function() {
    if (!church) { setLoading(false); return; }
    Promise.all([
      import("./lib/db").then(function({ fetchChurchSermons }) { return fetchChurchSermons(church.id); }),
      import("./lib/db").then(function({ fetchChurchMembers }) { return fetchChurchMembers(church.id); }),
    ]).then(function(results) { setSermons(results[0]); setMembers(results[1]); }).catch(function() {}).finally(function() { setLoading(false); });
  }, [church]);

  var sermonsByTool = useMemo(function() {
    var counts = { "sermon-forge": 0, "topic-engine": 0, "word-study": 0, "illustrations": 0, "series-planner": 0, "ai-pastor": 0 };
    sermons.forEach(function(s) { if (s.sourceTool && counts[s.sourceTool] !== undefined) counts[s.sourceTool]++; });
    return counts;
  }, [sermons]);

  var activityData = [
    { label: "Total Sermons", value: sermons.length },
    { label: "Sermon Forge", value: sermonsByTool["sermon-forge"] },
    { label: "Topic Engine", value: sermonsByTool["topic-engine"] },
    { label: "Word Studies", value: sermonsByTool["word-study"] },
    { label: "Series Plans", value: sermonsByTool["series-planner"] },
    { label: "Pastors", value: members.length },
  ];

  if (!church) return <div><div style={styles.sectionSub}>No church set up yet. Go to Church Settings to create your church.</div></div>;

  return (
    <div>
      <div style={styles.sectionSub}>Platform-wide usage and ministry activity overview.</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20, marginBottom: 28 }}>
        {activityData.map(function(a) { return <StatCard key={a.label} value={loading ? "..." : a.value} label={a.label} />; })}
      </div>
      <div style={styles.card}>
        <div style={styles.cardTitle}>Recent Sermons</div>
        <div style={{ marginTop: 14 }}>
          {loading && <div style={{ color: STONE_LIGHT, fontStyle: "italic", fontSize: 13 }}>Loading...</div>}
          {!loading && sermons.length === 0 && <div style={{ color: STONE_LIGHT, fontStyle: "italic", fontSize: 13 }}>No sermons yet.</div>}
          {sermons.slice(0, 8).map(function(s, i) {
            return <div key={s.id || i} style={{ display: "flex", justifyContent: "space-between", padding: "11px 0", borderBottom: "1px solid " + BORDER }}><div><span style={{ fontWeight: 600, fontSize: 13, color: CHARCOAL }}>{s.pastorName || "Pastor"}</span><span style={{ fontSize: 13, color: STONE, marginLeft: 8 }}>{s.sourceTool ? "Generated " + s.sourceTool.replace("-", " ") + ": " : "Saved sermon: "}{s.title}</span></div><span style={{ fontSize: 12, color: STONE_LIGHT, flexShrink: 0, marginLeft: 16 }}>{s.savedAt}</span></div>;
          })}
        </div>
      </div>
    </div>
  );
}

function AllSermonsScreen({ church }) {
  const [sermons, setSermons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(function() {
    if (!church) { setLoading(false); return; }
    import("./lib/db").then(function({ fetchChurchSermons }) {
      fetchChurchSermons(church.id).then(function(data) { setSermons(data); }).catch(function() {}).finally(function() { setLoading(false); });
    });
  }, [church]);

  var filtered = useMemo(function() {
    var q = search.trim().toLowerCase();
    if (!q) return sermons;
    return sermons.filter(function(s) { return (s.title && s.title.toLowerCase().includes(q)) || (s.scripture && s.scripture.toLowerCase().includes(q)) || (s.pastorName && s.pastorName.toLowerCase().includes(q)); });
  }, [sermons, search]);

  if (!church) return <div><div style={styles.sectionSub}>No church set up yet. Go to Church Settings to create your church.</div></div>;

  return (
    <div>
      <div style={styles.sectionSub}>Browse all sermons across every pastor in your church.</div>
      <div style={{ marginBottom: 16 }}><input style={styles.input} value={search} onChange={function(e) { setSearch(e.target.value); }} placeholder="Search by title, scripture, or pastor..." /></div>
      <div style={styles.card}>
        {loading && <div style={{ color: STONE_LIGHT, fontStyle: "italic", fontSize: 13, padding: "12px 0" }}>Loading sermons...</div>}
        {!loading && filtered.length === 0 && <div style={{ color: STONE_LIGHT, fontStyle: "italic", fontSize: 13, padding: "12px 0" }}>{sermons.length === 0 ? "No sermons yet." : "No sermons match your search."}</div>}
        {filtered.length > 0 && (
          <table style={styles.table}>
            <thead><tr><th style={styles.th}>Title</th><th style={styles.th}>Scripture</th><th style={styles.th}>Pastor</th><th style={styles.th}>Series</th><th style={styles.th}>Date</th></tr></thead>
            <tbody>
              {filtered.map(function(s) {
                return <tr key={s.id}><td style={Object.assign({}, styles.td, { fontWeight: 600 })}>{s.title}</td><td style={Object.assign({}, styles.td, { color: GOLD, fontSize: 13 })}>{s.scripture || "—"}</td><td style={styles.td}>{s.pastorName || "—"}</td><td style={Object.assign({}, styles.td, { color: STONE_LIGHT, fontSize: 13 })}>{s.seriesTitle || "—"}</td><td style={Object.assign({}, styles.td, { fontSize: 13, color: STONE_LIGHT })}>{s.savedAt}</td></tr>;
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function ChurchSettingsScreen({ church, user, onChurchUpdate }) {
  const [activeTab, setActiveTab] = useState("profile");
  const [name, setName] = useState(church?.name || "");
  const [denom, setDenom] = useState(church?.denomination || "");
  const [city, setCity] = useState(church?.city || "");
  const [founded, setFounded] = useState(church?.founded || "");
  const [website, setWebsite] = useState(church?.website || "");
  const [phone, setPhone] = useState(church?.phone || "");
  const [email, setEmail] = useState(church?.email || "");
  const [vision, setVision] = useState(church?.vision || "");
  const [serviceTimes, setServiceTimes] = useState(church?.service_times || "");
  const [instagram, setInstagram] = useState(church?.instagram || "");
  const [facebook, setFacebook] = useState(church?.facebook || "");
  const [youtube, setYoutube] = useState(church?.youtube || "");
  const [membersCount, setMembersCount] = useState(church?.members_count || "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(!church);
  const timerRef = useRef(null);

  useEffect(function() { return function() { if (timerRef.current) clearTimeout(timerRef.current); }; }, []);
  useEffect(function() {
    if (church) {
      setName(church.name || ""); setDenom(church.denomination || ""); setCity(church.city || "");
      setFounded(church.founded || ""); setWebsite(church.website || ""); setPhone(church.phone || "");
      setEmail(church.email || ""); setVision(church.vision || ""); setServiceTimes(church.service_times || "");
      setInstagram(church.instagram || ""); setFacebook(church.facebook || ""); setYoutube(church.youtube || "");
      setMembersCount(church.members_count || ""); setCreating(false);
    }
  }, [church]);

  const handleSave = useCallback(async function() {
    if (!name.trim()) { setError("Church name is required."); return; }
    setError(""); setSaving(true);
    var updates = {
      name: name.trim(), denomination: denom.trim(), city: city.trim(),
      founded: founded ? parseInt(founded) : null, website: website.trim(),
      phone: phone.trim(), email: email.trim(), vision: vision.trim(),
      service_times: serviceTimes.trim(), instagram: instagram.trim(),
      facebook: facebook.trim(), youtube: youtube.trim(),
      members_count: membersCount ? parseInt(membersCount) : null,
    };
    try {
      if (creating) {
        const { createChurch } = await import("./lib/db");
        const newChurch = await createChurch(user.id, updates);
        if (onChurchUpdate) onChurchUpdate(newChurch);
        setCreating(false);
      } else {
        const { supabase } = await import("./lib/supabase");
        await supabase.from("churches").update(updates).eq("id", church.id);
        if (onChurchUpdate) onChurchUpdate(Object.assign({}, church, updates));
      }
      if (timerRef.current) clearTimeout(timerRef.current);
      setSaved(true);
      timerRef.current = setTimeout(function() { setSaved(false); }, 2500);
    } catch (e) { setError(e.message || "Failed to save church settings."); } finally { setSaving(false); }
  }, [name, denom, city, founded, website, phone, email, vision, serviceTimes, instagram, facebook, youtube, membersCount, church, creating, user, onChurchUpdate]);

  var tabs = ["profile", "contact", "social", "vision"];

  return (
    <div>
      <div style={styles.sectionSub}>{creating ? "Set up your church profile to get started." : "Manage your church profile, contact details, and social presence."}</div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, background: CREAM, borderRadius: 8, padding: 4, border: "1px solid " + BORDER, marginBottom: 20, flexWrap: "wrap" }}>
        {[
          { id: "profile", label: "Church Profile" },
          { id: "contact", label: "Contact & Hours" },
          { id: "social", label: "Social Media" },
          { id: "vision", label: "Vision & Identity" },
        ].map(function(tab) {
          return (
            <button key={tab.id} onClick={function() { setActiveTab(tab.id); }} style={{ flex: 1, padding: "7px 14px", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 700, fontFamily: "'Georgia', serif", background: activeTab === tab.id ? GOLD : "transparent", color: activeTab === tab.id ? "#fff" : STONE, transition: "all 0.15s", whiteSpace: "nowrap" }}>
              {tab.label}
            </button>
          );
        })}
      </div>

      <div style={Object.assign({}, styles.card, { maxWidth: 640 })}>
        {creating && <div style={{ background: GOLD_PALE, border: "1px solid " + GOLD, borderRadius: 8, padding: "10px 14px", fontSize: 13, color: STONE, marginBottom: 16 }}>Set up your church profile to unlock all admin features.</div>}

        {activeTab === "profile" && (
          <>
            <div style={styles.inputGroup}><label style={styles.label}>Church Name *</label><input style={styles.input} value={name} onChange={function(e) { setName(e.target.value); }} placeholder="e.g. Kingdom Insights Ministries" /></div>
            <div style={styles.grid2}>
              <div style={styles.inputGroup}><label style={styles.label}>Denomination</label><input style={styles.input} value={denom} onChange={function(e) { setDenom(e.target.value); }} placeholder="e.g. Non-Denominational" /></div>
              <div style={styles.inputGroup}><label style={styles.label}>Year Founded</label><input type="number" style={styles.input} value={founded} onChange={function(e) { setFounded(e.target.value); }} placeholder="e.g. 2010" /></div>
            </div>
            <div style={styles.grid2}>
              <div style={styles.inputGroup}><label style={styles.label}>City / Location</label><input style={styles.input} value={city} onChange={function(e) { setCity(e.target.value); }} placeholder="e.g. Dallas, TX" /></div>
              <div style={styles.inputGroup}><label style={styles.label}>Congregation Size</label><input type="number" style={styles.input} value={membersCount} onChange={function(e) { setMembersCount(e.target.value); }} placeholder="e.g. 500" /></div>
            </div>
          </>
        )}

        {activeTab === "contact" && (
          <>
            <div style={styles.inputGroup}><label style={styles.label}>Website</label><input style={styles.input} value={website} onChange={function(e) { setWebsite(e.target.value); }} placeholder="e.g. https://mychurch.com" /></div>
            <div style={styles.grid2}>
              <div style={styles.inputGroup}><label style={styles.label}>Phone</label><input style={styles.input} value={phone} onChange={function(e) { setPhone(e.target.value); }} placeholder="e.g. (817) 555-0100" /></div>
              <div style={styles.inputGroup}><label style={styles.label}>Church Email</label><input type="email" style={styles.input} value={email} onChange={function(e) { setEmail(e.target.value); }} placeholder="e.g. info@mychurch.com" /></div>
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Service Times</label>
              <textarea style={styles.textarea} value={serviceTimes} onChange={function(e) { setServiceTimes(e.target.value); }} rows={3} placeholder={"e.g.\nSunday 8:00 AM — Early Service\nSunday 10:30 AM — Main Service\nWednesday 7:00 PM — Bible Study"} />
            </div>
          </>
        )}

        {activeTab === "social" && (
          <>
            <div style={{ fontSize: 13, color: STONE, marginBottom: 16 }}>Connect your social media profiles so your congregation can find you online.</div>
            <div style={styles.inputGroup}><label style={styles.label}>Instagram</label><input style={styles.input} value={instagram} onChange={function(e) { setInstagram(e.target.value); }} placeholder="e.g. @mychurch or full URL" /></div>
            <div style={styles.inputGroup}><label style={styles.label}>Facebook</label><input style={styles.input} value={facebook} onChange={function(e) { setFacebook(e.target.value); }} placeholder="e.g. facebook.com/mychurch" /></div>
            <div style={styles.inputGroup}><label style={styles.label}>YouTube</label><input style={styles.input} value={youtube} onChange={function(e) { setYoutube(e.target.value); }} placeholder="e.g. youtube.com/@mychurch" /></div>
          </>
        )}

        {activeTab === "vision" && (
          <>
            <div style={{ fontSize: 13, color: STONE, marginBottom: 16 }}>Your vision statement is used by Poro and other AI tools to align content with your church's identity.</div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Vision Statement</label>
              <textarea style={styles.textarea} value={vision} onChange={function(e) { setVision(e.target.value); }} rows={4} placeholder="e.g. To reach the lost, disciple believers, and send out leaders who transform their communities for the Kingdom of God." />
            </div>
          </>
        )}

        {error && <div style={styles.errorPanel}>{error}</div>}
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 16 }}>
          <Button onClick={handleSave} disabled={saving}>{saving ? "Saving..." : creating ? "Create Church" : "Save Changes"}</Button>
          {saved && <span style={{ fontSize: 13, color: "#27AE60", fontWeight: 600 }}>✓ Saved successfully</span>}
        </div>
      </div>
    </div>
  );
}

// ─── TEAM SCHEDULER ───────────────────────────────────────────────────────────

function TeamSchedulerScreen({ user }) {
  const STORAGE_KEY = "scp_team_" + (user?.id || "local");

  function load() { try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"); } catch(e) { return {}; } }
  function save(data) { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }

  var defaultData = {
    members: [],
    roles: ["Preaching", "Worship Leader", "Vocalist", "Drummer", "Guitarist", "Bassist", "Keys", "Sound", "Projection", "Usher", "Greeter", "Children's Ministry", "Prayer Team", "Elder/Deacon"],
    services: [],
  };

  const [data, setData] = useState(function() { return Object.assign({}, defaultData, load()); });
  const [activeTab, setActiveTab] = useState("services");
  const [showAddMember, setShowAddMember] = useState(false);
  const [showAddService, setShowAddService] = useState(false);
  const [memberName, setMemberName] = useState("");
  const [memberRole, setMemberRole] = useState("");
  const [memberEmail, setMemberEmail] = useState("");
  const [memberPhone, setMemberPhone] = useState("");
  const [serviceDate, setServiceDate] = useState("");
  const [serviceTitle, setServiceTitle] = useState("");
  const [serviceType, setServiceType] = useState("Sunday Morning");
  const [editingService, setEditingService] = useState(null);
  const [assignModal, setAssignModal] = useState(null); // { serviceId, role }
  const [customRole, setCustomRole] = useState("");
  const [showAddRole, setShowAddRole] = useState(false);
  const [copyStatus, setCopyStatus] = useState("");
  const [availabilityModal, setAvailabilityModal] = useState(null);
  const [blockDate, setBlockDate] = useState("");

  function updateData(newData) {
    save(newData);
    setData(newData);
  }

  function addMember() {
    if (!memberName.trim()) return;
    var member = { id: Date.now().toString(), name: memberName.trim(), role: memberRole, email: memberEmail.trim(), phone: memberPhone.trim(), available: true, blockedDates: [] };
    var updated = Object.assign({}, data, { members: [...data.members, member] });
    updateData(updated);
    setMemberName(""); setMemberRole(""); setMemberEmail(""); setMemberPhone("");
    setShowAddMember(false);
  }

  function removeMember(id) {
    var updated = Object.assign({}, data, { members: data.members.filter(function(m) { return m.id !== id; }) });
    updateData(updated);
  }

  function addService() {
    if (!serviceDate) return;
    var service = {
      id: Date.now().toString(),
      date: serviceDate,
      title: serviceTitle.trim() || "Sunday Service",
      type: serviceType,
      assignments: {}, // { role: memberId }
      notes: "",
    };
    var updated = Object.assign({}, data, { services: [...data.services, service].sort(function(a,b) { return a.date > b.date ? 1 : -1; }) });
    updateData(updated);
    setServiceDate(""); setServiceTitle(""); setServiceType("Sunday Morning");
    setShowAddService(false);
  }

  function removeService(id) {
    updateData(Object.assign({}, data, { services: data.services.filter(function(s) { return s.id !== id; }) }));
  }

  function assignMember(serviceId, role, memberId) {
    var services = data.services.map(function(s) {
      if (s.id !== serviceId) return s;
      var assignments = Object.assign({}, s.assignments);
      if (memberId) assignments[role] = memberId;
      else delete assignments[role];
      return Object.assign({}, s, { assignments });
    });
    updateData(Object.assign({}, data, { services }));
    setAssignModal(null);
  }

  function addCustomRole() {
    if (!customRole.trim() || data.roles.includes(customRole.trim())) { setCustomRole(""); setShowAddRole(false); return; }
    updateData(Object.assign({}, data, { roles: [...data.roles, customRole.trim()] }));
    setCustomRole(""); setShowAddRole(false);
  }

  function addBlockedDate(memberId, date) {
    if (!date) return;
    var members = data.members.map(function(m) {
      if (m.id !== memberId) return m;
      var existing = m.blockedDates || [];
      if (existing.includes(date)) return m;
      return Object.assign({}, m, { blockedDates: [...existing, date].sort() });
    });
    updateData(Object.assign({}, data, { members }));
    setBlockDate("");
  }

  function removeBlockedDate(memberId, date) {
    var members = data.members.map(function(m) {
      if (m.id !== memberId) return m;
      return Object.assign({}, m, { blockedDates: (m.blockedDates || []).filter(function(d) { return d !== date; }) });
    });
    updateData(Object.assign({}, data, { members }));
  }

  function isMemberBlocked(member, serviceDate) {
    return (member.blockedDates || []).includes(serviceDate);
  }

  function copySchedule(service) {
    var lines = ["SERVICE: " + service.title, "Date: " + new Date(service.date + "T00:00:00").toLocaleDateString("en-US", { weekday:"long", month:"long", day:"numeric", year:"numeric" }), "Type: " + service.type, ""];
    data.roles.forEach(function(role) {
      var memberId = service.assignments[role];
      var member = memberId ? data.members.find(function(m) { return m.id === memberId; }) : null;
      if (member) lines.push(role + ": " + member.name + (member.phone ? " (" + member.phone + ")" : ""));
    });
    var unassigned = data.roles.filter(function(r) { return !service.assignments[r]; });
    if (unassigned.length) { lines.push(""); lines.push("UNASSIGNED: " + unassigned.join(", ")); }
    navigator.clipboard.writeText(lines.join("\n"));
    setCopyStatus(service.id);
    setTimeout(function() { setCopyStatus(""); }, 2000);
  }

  var upcomingServices = data.services.filter(function(s) { return s.date >= new Date().toISOString().slice(0,10); });
  var pastServices = data.services.filter(function(s) { return s.date < new Date().toISOString().slice(0,10); });

  var statusColors = { "Sunday Morning": { bg: GOLD_PALE, color: GOLD }, "Sunday Evening": { bg: "#E8F4FD", color: "#2980B9" }, "Midweek": { bg: "#EAFAF1", color: "#27AE60" }, "Youth": { bg: "#F5E6FF", color: "#8E44AD" }, "Special": { bg: "#FFF5E6", color: "#E67E22" } };

  return (
    <div>
      <div style={styles.goldAccent} />
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6, flexWrap: "wrap", gap: 12 }}>
        <div style={styles.sectionHeader}>Team Scheduler</div>
        <div style={{ display: "flex", gap: 8 }}>
          <Button variant="ghost" onClick={function() { setShowAddMember(true); }}>+ Add Member</Button>
          <Button onClick={function() { setShowAddService(true); }}>+ Schedule Service</Button>
        </div>
      </div>
      <div style={styles.sectionSub}>Schedule your worship team, volunteers, and ministry staff for each service. Copy the schedule to share with your team.</div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, backgroundColor: CREAM, borderRadius: 8, padding: 4, border: "1px solid " + BORDER, marginBottom: 24, width: "fit-content" }}>
        {[["services","📅 Services"], ["team","👥 Team"], ["roles","🏷 Roles"]].map(function(t) {
          return <button key={t[0]} onClick={function() { setActiveTab(t[0]); }} style={{ padding: "7px 18px", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 13, fontWeight: activeTab === t[0] ? 700 : 500, fontFamily: FONT_BODY, backgroundColor: activeTab === t[0] ? GOLD : "transparent", color: activeTab === t[0] ? "#fff" : STONE, transition: "all 0.15s" }}>{t[1]}</button>;
        })}
      </div>

      {/* ── SERVICES TAB ── */}
      {activeTab === "services" && (
        <div>
          {data.services.length === 0 && (
            <div style={Object.assign({}, styles.card, { textAlign: "center", padding: "48px 24px" })}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>📅</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: CHARCOAL, fontFamily: FONT_DISPLAY, marginBottom: 8 }}>No services scheduled yet</div>
              <div style={{ fontSize: 13, color: STONE_LIGHT, marginBottom: 20 }}>Add a service to start scheduling your team.</div>
              <Button onClick={function() { setShowAddService(true); }}>+ Schedule Service</Button>
            </div>
          )}

          {upcomingServices.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: STONE_LIGHT, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12, fontFamily: FONT_BODY }}>Upcoming</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {upcomingServices.map(function(service) {
                  var sc = statusColors[service.type] || { bg: CREAM, color: STONE };
                  var assignedCount = Object.keys(service.assignments).length;
                  var totalRoles = data.roles.length;
                  return (
                    <div key={service.id} style={Object.assign({}, styles.card, { padding: "20px 24px" })}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                            <span style={Object.assign({}, styles.tag, { backgroundColor: sc.bg, color: sc.color })}>{service.type}</span>
                            <span style={{ fontSize: 12, color: STONE_LIGHT, fontFamily: FONT_BODY }}>{new Date(service.date + "T00:00:00").toLocaleDateString("en-US", { weekday:"long", month:"long", day:"numeric" })}</span>
                          </div>
                          <div style={{ fontSize: 17, fontWeight: 700, color: CHARCOAL, fontFamily: FONT_DISPLAY }}>{service.title}</div>
                          <div style={{ fontSize: 12, color: assignedCount === totalRoles ? "#27AE60" : STONE_LIGHT, marginTop: 4, fontFamily: FONT_BODY, fontWeight: 500 }}>
                            {assignedCount}/{totalRoles} roles filled
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: 8 }}>
                          <button onClick={function() { copySchedule(service); }} style={{ padding: "6px 14px", border: "1px solid " + BORDER, borderRadius: 6, background: copyStatus === service.id ? GOLD : "transparent", color: copyStatus === service.id ? "#fff" : STONE, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: FONT_BODY }}>
                            {copyStatus === service.id ? "Copied ✓" : "Copy Schedule"}
                          </button>
                          <button onClick={function() { removeService(service.id); }} style={{ padding: "6px 10px", border: "1px solid #FFC5C5", borderRadius: 6, background: "transparent", color: "#C0392B", fontSize: 12, cursor: "pointer" }}>✕</button>
                        </div>
                      </div>

                      {/* Role assignments grid */}
                      <div className="scp-grid-3" style={{ gap: 8 }}>
                        {data.roles.map(function(role) {
                          var assignedId = service.assignments[role];
                          var assignedMember = assignedId ? data.members.find(function(m) { return m.id === assignedId; }) : null;
                          return (
                            <div key={role} onClick={function() { setAssignModal({ serviceId: service.id, role: role }); }} style={{ padding: "10px 12px", border: "1px solid " + (assignedMember ? GOLD_BORDER : BORDER), borderRadius: 8, background: assignedMember ? GOLD_PALE : IVORY, cursor: "pointer", transition: "all 0.15s" }}>
                              <div style={{ fontSize: 10, fontWeight: 700, color: STONE_LIGHT, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 3, fontFamily: FONT_BODY }}>{role}</div>
                              <div style={{ fontSize: 13, fontWeight: 600, color: assignedMember && isMemberBlocked(assignedMember, service.date) ? "#C0392B" : assignedMember ? CHARCOAL : STONE_LIGHT, fontFamily: FONT_BODY }}>
                                {assignedMember ? assignedMember.name : "Tap to assign"}
                                {assignedMember && isMemberBlocked(assignedMember, service.date) && <span style={{ fontSize: 10, marginLeft: 4, color: "#C0392B" }}>⚠ unavailable</span>}
                              </div>
                              {assignedMember?.phone && <div style={{ fontSize: 11, color: STONE_LIGHT, marginTop: 2, fontFamily: FONT_BODY }}>{assignedMember.phone}</div>}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {pastServices.length > 0 && (
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: STONE_LIGHT, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12, fontFamily: FONT_BODY }}>Past Services</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {pastServices.slice().reverse().map(function(service) {
                  var sc = statusColors[service.type] || { bg: CREAM, color: STONE };
                  var assignedCount = Object.keys(service.assignments).length;
                  return (
                    <div key={service.id} style={{ padding: "12px 16px", border: "1px solid " + BORDER, borderRadius: 8, background: IVORY, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8, opacity: 0.7 }}>
                      <div>
                        <span style={Object.assign({}, styles.tag, { backgroundColor: sc.bg, color: sc.color, marginRight: 8 })}>{service.type}</span>
                        <span style={{ fontSize: 14, fontWeight: 600, color: CHARCOAL, fontFamily: FONT_BODY }}>{service.title}</span>
                        <span style={{ fontSize: 12, color: STONE_LIGHT, marginLeft: 8, fontFamily: FONT_BODY }}>{new Date(service.date + "T00:00:00").toLocaleDateString("en-US", { month:"short", day:"numeric", year:"numeric" })}</span>
                        <span style={{ fontSize: 12, color: STONE_LIGHT, marginLeft: 8, fontFamily: FONT_BODY }}>{assignedCount} assigned</span>
                      </div>
                      <button onClick={function() { removeService(service.id); }} style={{ padding: "4px 8px", border: "1px solid #FFC5C5", borderRadius: 5, background: "transparent", color: "#C0392B", fontSize: 11, cursor: "pointer" }}>Remove</button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── TEAM TAB ── */}
      {activeTab === "team" && (
        <div>
          {data.members.length === 0 && (
            <div style={Object.assign({}, styles.card, { textAlign: "center", padding: "48px 24px" })}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>👥</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: CHARCOAL, fontFamily: FONT_DISPLAY, marginBottom: 8 }}>No team members yet</div>
              <div style={{ fontSize: 13, color: STONE_LIGHT, marginBottom: 20 }}>Add your worship team, volunteers, and ministry staff.</div>
              <Button onClick={function() { setShowAddMember(true); }}>+ Add Member</Button>
            </div>
          )}
          {data.members.length > 0 && (
            <div className="scp-grid-auto">
              {data.members.map(function(member) {
                var servicesServed = data.services.filter(function(s) { return Object.values(s.assignments).includes(member.id); }).length;
                return (
                  <div key={member.id} style={Object.assign({}, styles.card, { padding: "18px 20px" })}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{ width: 40, height: 40, borderRadius: "50%", background: GOLD, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 16, fontFamily: FONT_BODY, flexShrink: 0 }}>{member.name.charAt(0).toUpperCase()}</div>
                        <div>
                          <div style={{ fontSize: 15, fontWeight: 700, color: CHARCOAL, fontFamily: FONT_BODY }}>{member.name}</div>
                          {member.role && <span style={Object.assign({}, styles.tag, styles.tagGold, { marginTop: 2 })}>{member.role}</span>}
                        </div>
                      </div>
                      <button onClick={function() { removeMember(member.id); }} style={{ padding: "4px 8px", border: "1px solid #FFC5C5", borderRadius: 5, background: "transparent", color: "#C0392B", fontSize: 11, cursor: "pointer" }}>✕</button>
                    </div>
                    <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 4 }}>
                      {member.email && <div style={{ fontSize: 12, color: STONE, fontFamily: FONT_BODY }}>✉ {member.email}</div>}
                      {member.phone && <div style={{ fontSize: 12, color: STONE, fontFamily: FONT_BODY }}>📞 {member.phone}</div>}
                      <div style={{ fontSize: 12, color: STONE_LIGHT, fontFamily: FONT_BODY, marginTop: 4 }}>Served {servicesServed} service{servicesServed !== 1 ? "s" : ""}</div>
                      {(member.blockedDates || []).length > 0 && (
                        <div style={{ fontSize: 11, color: "#C0392B", fontFamily: FONT_BODY, marginTop: 2 }}>⚠ {member.blockedDates.length} blocked date{member.blockedDates.length !== 1 ? "s" : ""}</div>
                      )}
                    </div>
                    <button onClick={function() { setAvailabilityModal(member.id); }} style={{ marginTop: 12, width: "100%", padding: "7px", border: "1px solid " + BORDER, borderRadius: 7, background: "transparent", color: STONE, fontSize: 12, cursor: "pointer", fontFamily: FONT_BODY }}>
                      📅 Manage Availability
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── ROLES TAB ── */}
      {activeTab === "roles" && (
        <div style={styles.card}>
          <div style={styles.cardTitle}>Ministry Roles</div>
          <div style={styles.cardMeta}>Customize the roles you schedule for each service</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
            {data.roles.map(function(role) {
              return (
                <div key={role} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", border: "1px solid " + BORDER, borderRadius: 20, background: IVORY }}>
                  <span style={{ fontSize: 13, color: CHARCOAL, fontFamily: FONT_BODY }}>{role}</span>
                  <button onClick={function() {
                    updateData(Object.assign({}, data, { roles: data.roles.filter(function(r) { return r !== role; }) }));
                  }} style={{ border: "none", background: "transparent", color: STONE_LIGHT, cursor: "pointer", fontSize: 14, lineHeight: 1, padding: 0 }}>×</button>
                </div>
              );
            })}
          </div>
          {showAddRole ? (
            <div style={{ display: "flex", gap: 8 }}>
              <input style={Object.assign({}, styles.input, { flex: 1 })} value={customRole} onChange={function(e) { setCustomRole(e.target.value); }} placeholder="e.g. Sign Language Interpreter" onKeyDown={function(e) { if (e.key === "Enter") addCustomRole(); }} autoFocus />
              <Button onClick={addCustomRole}>Add</Button>
              <Button variant="ghost" onClick={function() { setShowAddRole(false); setCustomRole(""); }}>Cancel</Button>
            </div>
          ) : (
            <Button variant="ghost" onClick={function() { setShowAddRole(true); }}>+ Add Custom Role</Button>
          )}
        </div>
      )}

      {/* ── ADD MEMBER MODAL ── */}
      {showAddMember && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: 16 }}>
          <div style={{ background: WARM_WHITE, borderRadius: 16, padding: "28px", width: "100%", maxWidth: 460, boxShadow: "0 8px 40px rgba(0,0,0,0.2)" }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: CHARCOAL, fontFamily: FONT_DISPLAY, marginBottom: 20 }}>Add Team Member</div>
            <div style={styles.inputGroup}><label style={styles.label}>Name *</label><input style={styles.input} value={memberName} onChange={function(e) { setMemberName(e.target.value); }} placeholder="e.g. Sarah Johnson" autoFocus /></div>
            <div style={styles.inputGroup}><label style={styles.label}>Primary Role</label>
              <select style={styles.select} value={memberRole} onChange={function(e) { setMemberRole(e.target.value); }}>
                <option value="">Select a role...</option>
                {data.roles.map(function(r) { return <option key={r} value={r}>{r}</option>; })}
              </select>
            </div>
            <div style={styles.grid2}>
              <div style={styles.inputGroup}><label style={styles.label}>Email</label><input style={styles.input} value={memberEmail} onChange={function(e) { setMemberEmail(e.target.value); }} placeholder="sarah@church.com" /></div>
              <div style={styles.inputGroup}><label style={styles.label}>Phone</label><input style={styles.input} value={memberPhone} onChange={function(e) { setMemberPhone(e.target.value); }} placeholder="+1 555 0100" /></div>
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
              <button onClick={function() { setShowAddMember(false); }} style={{ padding: "9px 18px", borderRadius: 8, border: "1px solid " + BORDER, background: "transparent", color: STONE, fontSize: 13, cursor: "pointer", fontFamily: FONT_BODY }}>Cancel</button>
              <Button onClick={addMember}>Add Member</Button>
            </div>
          </div>
        </div>
      )}

      {/* ── ADD SERVICE MODAL ── */}
      {showAddService && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: 16 }}>
          <div style={{ background: WARM_WHITE, borderRadius: 16, padding: "28px", width: "100%", maxWidth: 460, boxShadow: "0 8px 40px rgba(0,0,0,0.2)" }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: CHARCOAL, fontFamily: FONT_DISPLAY, marginBottom: 20 }}>Schedule Service</div>
            <div style={styles.inputGroup}><label style={styles.label}>Service Title</label><input style={styles.input} value={serviceTitle} onChange={function(e) { setServiceTitle(e.target.value); }} placeholder="e.g. Sunday Morning Service" /></div>
            <div style={styles.grid2}>
              <div style={styles.inputGroup}><label style={styles.label}>Date *</label><input type="date" style={styles.input} value={serviceDate} onChange={function(e) { setServiceDate(e.target.value); }} /></div>
              <div style={styles.inputGroup}><label style={styles.label}>Type</label>
                <select style={styles.select} value={serviceType} onChange={function(e) { setServiceType(e.target.value); }}>
                  {["Sunday Morning","Sunday Evening","Midweek","Youth","Special"].map(function(t) { return <option key={t} value={t}>{t}</option>; })}
                </select>
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
              <button onClick={function() { setShowAddService(false); }} style={{ padding: "9px 18px", borderRadius: 8, border: "1px solid " + BORDER, background: "transparent", color: STONE, fontSize: 13, cursor: "pointer", fontFamily: FONT_BODY }}>Cancel</button>
              <Button onClick={addService}>Schedule</Button>
            </div>
          </div>
        </div>
      )}

      {/* ── ASSIGN MODAL ── */}
      {assignModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: 16 }}>
          <div style={{ background: WARM_WHITE, borderRadius: 16, padding: "28px", width: "100%", maxWidth: 400, boxShadow: "0 8px 40px rgba(0,0,0,0.2)" }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: CHARCOAL, fontFamily: FONT_DISPLAY, marginBottom: 6 }}>Assign {assignModal.role}</div>
            <div style={{ fontSize: 13, color: STONE_LIGHT, marginBottom: 20, fontFamily: FONT_BODY }}>Select a team member for this role</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 300, overflowY: "auto" }}>
              <div onClick={function() { assignMember(assignModal.serviceId, assignModal.role, null); }} style={{ padding: "12px 16px", border: "1px solid " + BORDER, borderRadius: 8, cursor: "pointer", fontSize: 13, color: STONE, fontFamily: FONT_BODY, background: IVORY }}>
                — Unassign
              </div>
              {data.members.map(function(member) {
                var service = data.services.find(function(s) { return s.id === assignModal.serviceId; });
                var currentAssignee = service && service.assignments[assignModal.role];
                var isSelected = currentAssignee === member.id;
                return (
                  <div key={member.id} onClick={function() { assignMember(assignModal.serviceId, assignModal.role, member.id); }} style={{ padding: "12px 16px", border: "1px solid " + (isSelected ? GOLD : isMemberBlocked(member, (data.services.find(function(s){return s.id===assignModal.serviceId;})||{}).date||"") ? "#FFC5C5" : BORDER), borderRadius: 8, cursor: "pointer", background: isSelected ? GOLD_PALE : isMemberBlocked(member, (data.services.find(function(s){return s.id===assignModal.serviceId;})||{}).date||"") ? "#FFF5F5" : IVORY, display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 32, height: 32, borderRadius: "50%", background: isMemberBlocked(member, (data.services.find(function(s){return s.id===assignModal.serviceId;})||{}).date||"") ? "#E0E0E0" : GOLD, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14, flexShrink: 0 }}>{member.name.charAt(0)}</div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: isMemberBlocked(member, (data.services.find(function(s){return s.id===assignModal.serviceId;})||{}).date||"") ? "#C0392B" : CHARCOAL, fontFamily: FONT_BODY }}>{member.name}</div>
                      {member.role && <div style={{ fontSize: 11, color: STONE_LIGHT, fontFamily: FONT_BODY }}>{member.role}</div>}
                      {isMemberBlocked(member, (data.services.find(function(s){return s.id===assignModal.serviceId;})||{}).date||"") && <div style={{ fontSize: 11, color: "#C0392B", fontFamily: FONT_BODY }}>⚠ Marked unavailable</div>}
                    </div>
                    {isSelected && <span style={{ marginLeft: "auto", color: GOLD, fontWeight: 700 }}>✓</span>}
                  </div>
                );
              })}
              {data.members.length === 0 && <div style={{ fontSize: 13, color: STONE_LIGHT, textAlign: "center", padding: "20px 0", fontFamily: FONT_BODY }}>No team members yet. Add members in the Team tab.</div>}
            </div>
            <div style={{ marginTop: 16, textAlign: "right" }}>
              <button onClick={function() { setAssignModal(null); }} style={{ padding: "9px 18px", borderRadius: 8, border: "1px solid " + BORDER, background: "transparent", color: STONE, fontSize: 13, cursor: "pointer", fontFamily: FONT_BODY }}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* ── AVAILABILITY MODAL ── */}
      {availabilityModal && (function() {
        var member = data.members.find(function(m) { return m.id === availabilityModal; });
        if (!member) return null;
        return (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: 16 }}>
            <div style={{ background: WARM_WHITE, borderRadius: 16, padding: "28px", width: "100%", maxWidth: 420, boxShadow: "0 8px 40px rgba(0,0,0,0.2)" }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: CHARCOAL, fontFamily: FONT_DISPLAY, marginBottom: 4 }}>{member.name}</div>
              <div style={{ fontSize: 13, color: STONE_LIGHT, marginBottom: 20, fontFamily: FONT_BODY }}>Manage blocked / unavailable dates</div>

              {/* Blocked dates list */}
              {(member.blockedDates || []).length === 0 && (
                <div style={{ fontSize: 13, color: STONE_LIGHT, fontFamily: FONT_BODY, marginBottom: 16, textAlign: "center", padding: "16px 0" }}>No blocked dates — fully available</div>
              )}
              {(member.blockedDates || []).length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 16, maxHeight: 200, overflowY: "auto" }}>
                  {member.blockedDates.map(function(d) {
                    return (
                      <div key={d} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", background: "#FFF5F5", border: "1px solid #FFC5C5", borderRadius: 8 }}>
                        <span style={{ fontSize: 13, color: "#C0392B", fontFamily: FONT_BODY, fontWeight: 500 }}>
                          {new Date(d + "T00:00:00").toLocaleDateString("en-US", { weekday: "short", month: "long", day: "numeric", year: "numeric" })}
                        </span>
                        <button onClick={function() { removeBlockedDate(member.id, d); }} style={{ border: "none", background: "transparent", color: "#C0392B", fontSize: 16, cursor: "pointer", lineHeight: 1, padding: "0 4px" }}>×</button>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Add date */}
              <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
                <input
                  type="date"
                  style={Object.assign({}, styles.input, { flex: 1 })}
                  value={blockDate}
                  onChange={function(e) { setBlockDate(e.target.value); }}
                />
                <Button onClick={function() { addBlockedDate(member.id, blockDate); }}>Block Date</Button>
              </div>

              <div style={{ textAlign: "right" }}>
                <button onClick={function() { setAvailabilityModal(null); setBlockDate(""); }} style={{ padding: "9px 20px", borderRadius: 8, border: "1px solid " + BORDER, background: "transparent", color: STONE, fontSize: 13, cursor: "pointer", fontFamily: FONT_BODY }}>Done</button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

// ─── PLANNING CENTER INTEGRATION ─────────────────────────────────────────────

function PlanningCenterScreen({ user, setForgePrefill, setCurrentScreen, setCongregationProfile }) {
  const TOKEN_KEY = "scp_pco_token_" + (user?.id || "");
  const [accessToken, setAccessToken] = useState(function() { return localStorage.getItem(TOKEN_KEY) || ""; });
  const [plans, setPlans] = useState([]);
  const [serviceTypes, setServiceTypes] = useState([]);
  const [congregationData, setCongregationData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingCongregation, setLoadingCongregation] = useState(false);
  const [error, setError] = useState("");
  const [importStatus, setImportStatus] = useState("");
  const [activeTab, setActiveTab] = useState("plans");
  const isConnected = !!accessToken;

  var isLocal = window.location.hostname === "localhost";
  var base = isLocal ? "https://sermoncraft-pro.vercel.app" : "";

  function handleConnect() {
    var authUrl = base + "/api/pco?action=auth&userId=" + (user?.id || "");
    window.location.href = authUrl;
  }

  function handleDisconnect() {
    localStorage.removeItem(TOKEN_KEY);
    setAccessToken("");
    setPlans([]);
    setCongregationData(null);
    setError("");
  }

  async function fetchPlans() {
    if (!accessToken) return;
    setLoading(true); setError(""); setPlans([]);
    try {
      var resp = await fetch(base + "/api/pco?action=services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessToken: accessToken }),
      });
      var data = await resp.json();
      if (!resp.ok) throw new Error(data.error || "Failed to fetch service plans");
      setServiceTypes(data.serviceTypes || []);
      setPlans(data.plans || []);
    } catch (e) {
      setError(e.message);
      if (e.message.includes("401") || e.message.includes("unauthorized")) {
        localStorage.removeItem(TOKEN_KEY);
        setAccessToken("");
      }
    } finally { setLoading(false); }
  }

  async function fetchCongregation() {
    if (!accessToken) return;
    setLoadingCongregation(true); setError("");
    try {
      var resp = await fetch(base + "/api/pco?action=people", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessToken: accessToken }),
      });
      var data = await resp.json();
      if (!resp.ok) throw new Error(data.error || "Failed to fetch congregation data");
      setCongregationData(data);
    } catch (e) {
      setError(e.message);
    } finally { setLoadingCongregation(false); }
  }

  useEffect(function() {
    if (isConnected) {
      fetchPlans();
    }
  }, [accessToken]);

  function handleImportPlan(plan) {
    setForgePrefill({
      title: plan.title || plan.seriesTitle || "",
      scripture: plan.scripture || "",
      angle: plan.seriesTitle ? "Part of series: " + plan.seriesTitle : "",
    });
    setCurrentScreen("sermon-forge");
    setImportStatus("Imported! Opening Sermon Forge...");
  }

  function handleImportCongregation() {
    if (!congregationData) return;
    var groupNames = (congregationData.groups || []).slice(0, 5).map(function(g) { return g.name; }).join(", ");
    var profile = {
      size: congregationData.totalMembers > 500 ? "large" : congregationData.totalMembers > 100 ? "medium" : "small",
      sizeNumber: String(congregationData.totalMembers || ""),
      demographics: "Congregation with " + congregationData.totalMembers + " members across " + congregationData.totalHouseholds + " households.",
      groups: groupNames ? "Active groups: " + groupNames : "",
      source: "Planning Center",
    };
    setCongregationProfile(profile);
    setImportStatus("Congregation data imported into Congregation Intelligence!");
    setTimeout(function() { setImportStatus(""); }, 3000);
  }

  return (
    <div>
      <div style={styles.goldAccent} />
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6, flexWrap: "wrap", gap: 12 }}>
        <div style={styles.sectionHeader}>Planning Center</div>
        {isConnected && (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 12, color: "#27AE60", fontWeight: 600, fontFamily: FONT_BODY }}>✓ Connected</span>
            <button onClick={handleDisconnect} style={{ padding: "5px 12px", border: "1px solid " + BORDER, borderRadius: 6, background: "transparent", color: STONE, fontSize: 12, cursor: "pointer", fontFamily: FONT_BODY }}>Disconnect</button>
          </div>
        )}
      </div>
      <div style={styles.sectionSub}>Import your Planning Center service plans directly into Sermon Forge. Pull your congregation data into Congregation Intelligence.</div>

      {importStatus && (
        <div style={{ background: "#EAFAF1", border: "1px solid #A9DFBF", borderRadius: 8, padding: "10px 16px", marginBottom: 16, fontSize: 13, color: "#27AE60", fontWeight: 600, fontFamily: FONT_BODY }}>✓ {importStatus}</div>
      )}
      {error && <div style={styles.errorPanel}>⚠ {error}</div>}

      {!isConnected ? (
        /* ── NOT CONNECTED ── */
        <div style={Object.assign({}, styles.card, { textAlign: "center", padding: "48px 32px" })}>
          <div style={{ fontSize: 40, marginBottom: 20 }}>🔗</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: CHARCOAL, fontFamily: FONT_DISPLAY, marginBottom: 12 }}>Connect Planning Center</div>
          <div style={{ fontSize: 14, color: STONE, lineHeight: 1.7, maxWidth: 480, margin: "0 auto 32px", fontFamily: FONT_BODY }}>
            Import your upcoming service plans straight into Sermon Forge. Pull your congregation database into Congregation Intelligence. Your Planning Center investment just got smarter.
          </div>
          <div className="scp-grid-3" style={{ maxWidth: 540, margin: "0 auto 36px", textAlign: "left" }}>
            {[
              { icon: "📋", title: "Service Plans", desc: "Import upcoming service dates, sermon titles, and scripture references" },
              { icon: "👥", title: "Congregation Data", desc: "Sync member count, groups, and household data into Congregation Intelligence" },
              { icon: "✍", title: "One-Click Forge", desc: "Send any PCO service plan directly into Sermon Forge with title and scripture pre-filled" },
            ].map(function(f) {
              return (
                <div key={f.title} style={{ padding: "16px", border: "1px solid " + BORDER, borderRadius: 10, background: IVORY }}>
                  <div style={{ fontSize: 22, marginBottom: 8 }}>{f.icon}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: CHARCOAL, marginBottom: 4, fontFamily: FONT_BODY }}>{f.title}</div>
                  <div style={{ fontSize: 12, color: STONE_LIGHT, lineHeight: 1.5, fontFamily: FONT_BODY }}>{f.desc}</div>
                </div>
              );
            })}
          </div>
          <Button onClick={handleConnect}>Connect to Planning Center</Button>
          <div style={{ fontSize: 11, color: STONE_LIGHT, marginTop: 12, fontFamily: FONT_BODY }}>You'll be redirected to Planning Center to authorize access. We never store your PCO password.</div>
        </div>
      ) : (
        /* ── CONNECTED ── */
        <div>
          {/* Tabs */}
          <div style={{ display: "flex", gap: 4, backgroundColor: CREAM, borderRadius: 8, padding: 4, border: "1px solid " + BORDER, marginBottom: 24, width: "fit-content" }}>
            {["plans", "congregation"].map(function(tab) {
              return (
                <button key={tab} onClick={function() { setActiveTab(tab); if (tab === "congregation" && !congregationData) fetchCongregation(); }} style={{ padding: "7px 18px", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 13, fontWeight: activeTab === tab ? 700 : 500, fontFamily: FONT_BODY, backgroundColor: activeTab === tab ? GOLD : "transparent", color: activeTab === tab ? "#fff" : STONE, transition: "all 0.15s" }}>
                  {tab === "plans" ? "📋 Service Plans" : "👥 Congregation"}
                </button>
              );
            })}
          </div>

          {activeTab === "plans" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <div style={{ fontSize: 14, color: STONE, fontFamily: FONT_BODY }}>{plans.length > 0 ? plans.length + " upcoming services found" : "No plans loaded yet"}</div>
                <Button onClick={fetchPlans} disabled={loading} variant="ghost">{loading ? "Loading..." : "↻ Refresh"}</Button>
              </div>

              {loading && (
                <div style={Object.assign({}, styles.card, { textAlign: "center", padding: 32 })}>
                  <div style={{ fontSize: 13, color: STONE_LIGHT, fontStyle: "italic", fontFamily: FONT_BODY }}>Fetching your service plans from Planning Center...</div>
                </div>
              )}

              {!loading && plans.length === 0 && (
                <div style={Object.assign({}, styles.card, { textAlign: "center", padding: 32 })}>
                  <div style={{ fontSize: 14, color: STONE_LIGHT, fontFamily: FONT_BODY }}>No upcoming service plans found in Planning Center.</div>
                </div>
              )}

              {!loading && plans.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {plans.map(function(plan) {
                    return (
                      <div key={plan.id} style={{ border: "1px solid " + BORDER, borderRadius: 10, padding: "16px 20px", backgroundColor: CARD_BG, display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                            <span style={Object.assign({}, styles.tag, styles.tagGold)}>{plan.serviceType}</span>
                            <span style={{ fontSize: 12, color: STONE_LIGHT, fontFamily: FONT_BODY }}>{plan.dates}</span>
                          </div>
                          <div style={{ fontSize: 15, fontWeight: 700, color: CHARCOAL, fontFamily: FONT_DISPLAY, marginBottom: 2 }}>
                            {plan.title || plan.seriesTitle || "Untitled Service"}
                          </div>
                          {plan.seriesTitle && plan.title && (
                            <div style={{ fontSize: 12, color: STONE, fontFamily: FONT_BODY }}>Series: {plan.seriesTitle}</div>
                          )}
                          {plan.scripture && (
                            <div style={{ fontSize: 12, color: GOLD, marginTop: 2, fontFamily: FONT_BODY }}>📖 {plan.scripture}</div>
                          )}
                          {plan.items && plan.items.length > 0 && (
                            <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 4 }}>
                              {plan.items.slice(0, 6).map(function(item, i) {
                                return item.title ? (
                                  <span key={i} style={{ fontSize: 11, padding: "2px 8px", background: CREAM, border: "1px solid " + BORDER, borderRadius: 4, color: STONE, fontFamily: FONT_BODY }}>{item.title}</span>
                                ) : null;
                              })}
                            </div>
                          )}
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 6, flexShrink: 0 }}>
                          <button
                            onClick={function() { handleImportPlan(plan); }}
                            style={{ padding: "8px 16px", border: "none", borderRadius: 8, background: GOLD, color: "#fff", fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: FONT_BODY, whiteSpace: "nowrap" }}
                          >
                            ✍ Send to Sermon Forge
                          </button>
                          <button
                            onClick={function() {
                              setForgePrefill(function(prev) { return Object.assign({}, prev || {}, { title: plan.title || plan.seriesTitle || "", scripture: plan.scripture || "", angle: "" }); });
                              setCurrentScreen("service-order");
                            }}
                            style={{ padding: "7px 16px", border: "1px solid " + BORDER, borderRadius: 8, background: "transparent", color: STONE, fontWeight: 600, fontSize: 12, cursor: "pointer", fontFamily: FONT_BODY, whiteSpace: "nowrap" }}
                          >
                            📋 Build Service Order
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === "congregation" && (
            <div>
              {loadingCongregation && (
                <div style={Object.assign({}, styles.card, { textAlign: "center", padding: 32 })}>
                  <div style={{ fontSize: 13, color: STONE_LIGHT, fontStyle: "italic", fontFamily: FONT_BODY }}>Fetching congregation data from Planning Center...</div>
                </div>
              )}
              {!loadingCongregation && !congregationData && (
                <div style={Object.assign({}, styles.card, { textAlign: "center", padding: 32 })}>
                  <div style={{ fontSize: 14, color: STONE_LIGHT, fontFamily: FONT_BODY, marginBottom: 16 }}>Load your congregation data from Planning Center People.</div>
                  <Button onClick={fetchCongregation}>Load Congregation Data</Button>
                </div>
              )}
              {congregationData && (
                <div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 20 }}>
                    <div style={styles.statCard}>
                      <div style={styles.statValue}>{congregationData.totalMembers?.toLocaleString() || "—"}</div>
                      <div style={styles.statLabel}>Total Members</div>
                    </div>
                    <div style={styles.statCard}>
                      <div style={styles.statValue}>{congregationData.totalHouseholds?.toLocaleString() || "—"}</div>
                      <div style={styles.statLabel}>Households</div>
                    </div>
                    <div style={styles.statCard}>
                      <div style={styles.statValue}>{congregationData.groupCount || "—"}</div>
                      <div style={styles.statLabel}>Groups</div>
                    </div>
                  </div>

                  {congregationData.groups && congregationData.groups.length > 0 && (
                    <div style={Object.assign({}, styles.card, { marginBottom: 20 })}>
                      <div style={styles.cardTitle}>Groups</div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
                        {congregationData.groups.map(function(g, i) {
                          return (
                            <div key={i} style={{ padding: "6px 12px", background: IVORY, border: "1px solid " + BORDER, borderRadius: 8 }}>
                              <div style={{ fontSize: 13, fontWeight: 600, color: CHARCOAL, fontFamily: FONT_BODY }}>{g.name}</div>
                              {g.membersCount > 0 && <div style={{ fontSize: 11, color: STONE_LIGHT, fontFamily: FONT_BODY }}>{g.membersCount} members</div>}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div style={styles.card}>
                    <div style={styles.cardTitle}>Import into Congregation Intelligence</div>
                    <div style={{ fontSize: 13, color: STONE, marginBottom: 16, fontFamily: FONT_BODY, lineHeight: 1.6 }}>
                      This will sync your Planning Center congregation data — member count, households, and groups — directly into your Congregation Intelligence profile. Every AI generation will then be tailored to your actual church.
                    </div>
                    <Button onClick={handleImportCongregation}>Import Congregation Data</Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

// ─── ONBOARDING WIZARD ───────────────────────────────────────────────────────

function OnboardingWizard({ user, profile, onComplete }) {
  const [step, setStep] = useState(1);
  const [pastorName, setPastorName] = useState(profile?.name || user?.email?.split("@")[0] || "");
  const [churchName, setChurchName] = useState(profile?.church || "");
  const [city, setCity] = useState("");
  const [doctrine, setDoctrine] = useState("");
  const [style, setStyle] = useState("");
  const [tone, setTone] = useState("");
  const [sermonTopic, setSermonTopic] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleComplete() {
    setSaving(true);
    try {
      var { supabase } = await import("./lib/supabase");
      // Save voice profile to localStorage
      var voiceProfile = { doctrine, style, tone, confirmed: !!(doctrine && style) };
      localStorage.setItem("scp_voice_" + user.id, JSON.stringify(voiceProfile));
      // Mark onboarding complete in Supabase
      await supabase.from("users").update({ onboarding_complete: true }).eq("id", user.id);
    } catch(e) {}
    setSaving(false);
    onComplete({ sermonTopic, doctrine, style, tone });
  }

  var totalSteps = 3;
  var progress = (step / totalSteps) * 100;

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(26,21,8,0.96)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 99999, padding: 16 }}>
      <div style={{ background: "#fff", borderRadius: 20, width: "100%", maxWidth: 560, boxShadow: "0 20px 80px rgba(0,0,0,0.4)", overflow: "hidden" }}>

        {/* Progress bar */}
        <div style={{ height: 4, background: "#F0EDE6", width: "100%" }}>
          <div style={{ height: "100%", background: GOLD, width: progress + "%", transition: "width 0.4s ease" }} />
        </div>

        {/* Header */}
        <div style={{ padding: "28px 32px 0", textAlign: "center" }}>
          <div style={{ fontSize: 28, fontWeight: 900, color: GOLD, marginBottom: 6 }}>✝</div>
          <div style={{ fontSize: 11, color: STONE_LIGHT, fontFamily: FONT_BODY, letterSpacing: "0.1em", textTransform: "uppercase" }}>Step {step} of {totalSteps}</div>
        </div>

        {/* ── STEP 1: Who are you? ── */}
        {step === 1 && (
          <div style={{ padding: "20px 32px 32px" }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: CHARCOAL, fontFamily: FONT_DISPLAY, marginBottom: 8, textAlign: "center" }}>Welcome to SermonCraft Pro</div>
            <div style={{ fontSize: 14, color: STONE_LIGHT, fontFamily: FONT_BODY, textAlign: "center", marginBottom: 28, lineHeight: 1.6 }}>
              Let's set up your profile so Poro can personalize every sermon, study, and tool for your ministry.
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={styles.label}>Your Name *</label>
                <input style={styles.input} value={pastorName} onChange={function(e) { setPastorName(e.target.value); }} placeholder="e.g. Pastor David Johnson" autoFocus />
              </div>
              <div>
                <label style={styles.label}>Church Name *</label>
                <input style={styles.input} value={churchName} onChange={function(e) { setChurchName(e.target.value); }} placeholder="e.g. Grace Community Church" />
              </div>
              <div>
                <label style={styles.label}>City</label>
                <input style={styles.input} value={city} onChange={function(e) { setCity(e.target.value); }} placeholder="e.g. Atlanta, GA" />
              </div>
            </div>
            <button
              onClick={function() { if (pastorName.trim() && churchName.trim()) setStep(2); }}
              disabled={!pastorName.trim() || !churchName.trim()}
              style={{ width: "100%", marginTop: 24, padding: "14px", background: GOLD, border: "none", borderRadius: 10, fontSize: 15, fontWeight: 700, color: "#fff", cursor: pastorName.trim() && churchName.trim() ? "pointer" : "not-allowed", fontFamily: FONT_BODY, opacity: pastorName.trim() && churchName.trim() ? 1 : 0.5 }}
            >
              Continue →
            </button>
          </div>
        )}

        {/* ── STEP 2: Your doctrine & style ── */}
        {step === 2 && (
          <div style={{ padding: "20px 32px 32px" }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: CHARCOAL, fontFamily: FONT_DISPLAY, marginBottom: 8, textAlign: "center" }}>Your Preaching Profile</div>
            <div style={{ fontSize: 14, color: STONE_LIGHT, fontFamily: FONT_BODY, textAlign: "center", marginBottom: 24, lineHeight: 1.6 }}>
              This helps Poro align every AI generation to your theological tradition and preaching voice.
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div>
                <label style={styles.label}>Theological Tradition *</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
                  {DOCTRINE_OPTIONS.map(function(d) {
                    return (
                      <button key={d} onClick={function() { setDoctrine(d); }} style={{ padding: "8px 14px", border: "2px solid " + (doctrine === d ? GOLD : BORDER), borderRadius: 20, background: doctrine === d ? GOLD_PALE : "#fff", color: doctrine === d ? GOLD : STONE, fontSize: 12, fontWeight: doctrine === d ? 700 : 500, cursor: "pointer", fontFamily: FONT_BODY, transition: "all 0.15s" }}>
                        {d}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <label style={styles.label}>Preaching Style</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
                  {PREACHING_STYLES.map(function(s) {
                    return (
                      <button key={s} onClick={function() { setStyle(s); }} style={{ padding: "8px 14px", border: "2px solid " + (style === s ? GOLD : BORDER), borderRadius: 20, background: style === s ? GOLD_PALE : "#fff", color: style === s ? GOLD : STONE, fontSize: 12, fontWeight: style === s ? 700 : 500, cursor: "pointer", fontFamily: FONT_BODY, transition: "all 0.15s" }}>
                        {s}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <label style={styles.label}>Tone</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
                  {TONES.map(function(t) {
                    return (
                      <button key={t} onClick={function() { setTone(t); }} style={{ padding: "8px 14px", border: "2px solid " + (tone === t ? GOLD : BORDER), borderRadius: 20, background: tone === t ? GOLD_PALE : "#fff", color: tone === t ? GOLD : STONE, fontSize: 12, fontWeight: tone === t ? 700 : 500, cursor: "pointer", fontFamily: FONT_BODY, transition: "all 0.15s" }}>
                        {t}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
              <button onClick={function() { setStep(1); }} style={{ padding: "14px 20px", border: "1px solid " + BORDER, borderRadius: 10, background: "transparent", color: STONE, fontSize: 14, cursor: "pointer", fontFamily: FONT_BODY }}>← Back</button>
              <button
                onClick={function() { if (doctrine) setStep(3); }}
                disabled={!doctrine}
                style={{ flex: 1, padding: "14px", background: GOLD, border: "none", borderRadius: 10, fontSize: 15, fontWeight: 700, color: "#fff", cursor: doctrine ? "pointer" : "not-allowed", fontFamily: FONT_BODY, opacity: doctrine ? 1 : 0.5 }}
              >
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3: First sermon ── */}
        {step === 3 && (
          <div style={{ padding: "20px 32px 32px" }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: CHARCOAL, fontFamily: FONT_DISPLAY, marginBottom: 8, textAlign: "center" }}>You're Ready to Preach</div>
            <div style={{ fontSize: 14, color: STONE_LIGHT, fontFamily: FONT_BODY, textAlign: "center", marginBottom: 24, lineHeight: 1.6 }}>
              What are you preaching on this Sunday? Start your first sermon now or explore the platform.
            </div>

            <div style={{ padding: "20px 24px", background: GOLD_PALE, border: "1px solid " + GOLD_BORDER, borderRadius: 12, marginBottom: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: GOLD, fontFamily: FONT_BODY, marginBottom: 12 }}>Start your first sermon</div>
              <input
                style={styles.input}
                value={sermonTopic}
                onChange={function(e) { setSermonTopic(e.target.value); }}
                placeholder="e.g. The Grace of God — Romans 5:1-5"
              />
              <button
                onClick={handleComplete}
                disabled={!sermonTopic.trim() || saving}
                style={{ width: "100%", marginTop: 12, padding: "12px", background: GOLD, border: "none", borderRadius: 8, fontSize: 14, fontWeight: 700, color: "#fff", cursor: sermonTopic.trim() ? "pointer" : "not-allowed", fontFamily: FONT_BODY, opacity: sermonTopic.trim() ? 1 : 0.5 }}
              >
                {saving ? "Setting up..." : "Start Preaching →"}
              </button>
            </div>

            <div style={{ textAlign: "center" }}>
              <button onClick={function() { setSermonTopic(""); handleComplete(); }} style={{ background: "none", border: "none", color: STONE_LIGHT, fontSize: 13, cursor: "pointer", fontFamily: FONT_BODY, textDecoration: "underline" }}>
                Skip — I'll explore on my own
              </button>
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
              <button onClick={function() { setStep(2); }} style={{ padding: "10px 16px", border: "1px solid " + BORDER, borderRadius: 8, background: "transparent", color: STONE, fontSize: 13, cursor: "pointer", fontFamily: FONT_BODY }}>← Back</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── SERMON DROP SCREEN ──────────────────────────────────────────────────────
function SermonDropScreen({ currentUser, language }) {
  var [sermon, setSermon] = useState("");
  var [instruction, setInstruction] = useState("");
  var [result, setResult] = useState("");
  var [loading, setLoading] = useState(false);
  var [error, setError] = useState("");
  var [copied, setCopied] = useState(false);

  var QUICK_ACTIONS = [
    "Edit and refine this sermon",
    "Add illustrations and real-life examples",
    "Advise me what to add or remove",
    "Strengthen the introduction and conclusion",
    "Add more scripture references",
    "Simplify the language for a general audience",
    "Make it more expository",
    "Shorten to a 20-minute sermon",
  ];

  async function handleDrop() {
    if (!sermon.trim()) { setError("Please paste your sermon first."); return; }
    if (!instruction.trim()) { setError("Please add an instruction so I know what to do with it."); return; }
    setError(""); setResult(""); setLoading(true);

    var isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
    var base = isLocal ? "https://sermoncraft-pro.vercel.app" : "";
    var sys = "You are an expert sermon editor and ministry coach. A pastor has submitted their sermon for your feedback and editing. Follow the instruction precisely. Return only the result — no preamble, no meta-commentary. Write in a pastoral, clear, and compelling voice.";
    var prompt = "INSTRUCTION: " + instruction + "\n\nSERMON:\n" + sermon;

    try {
      var raw = "";
      await callSermonAPI(prompt, sys, false, function(chunk) { raw = chunk; setResult(raw); });
    } catch(e) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleCopy() {
    if (!result) return;
    navigator.clipboard.writeText(result).then(function() {
      setCopied(true);
      setTimeout(function() { setCopied(false); }, 2000);
    });
  }

  return (
    <div style={{ maxWidth: 820, margin: "0 auto", padding: "8px 0 40px" }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontFamily: "'Georgia', serif", fontSize: 22, fontWeight: 700, color: "#2C2416", marginBottom: 4 }}>Sermon Drop</div>
        <div style={{ fontSize: 13, color: "#8B7355", fontFamily: FONT_BODY }}>Paste an existing sermon, choose what you want done, and let AI improve it for you.</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>

        {/* Left col — input */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Sermon paste area */}
          <div>
            <label style={Object.assign({}, styles.label, { marginBottom: 6, display: "block" })}>Your Sermon</label>
            <textarea
              value={sermon}
              onChange={function(e) { setSermon(e.target.value); setError(""); }}
              placeholder={"Paste your full sermon here — draft, notes, or manuscript…"}
              style={{ width: "100%", minHeight: 280, border: "1.5px solid " + BORDER, borderRadius: 10, padding: "12px 14px", fontSize: 13.5, fontFamily: FONT_BODY, color: "#2C2416", background: "#FDFAF5", lineHeight: 1.6, resize: "vertical", outline: "none", boxSizing: "border-box" }}
            />
            <div style={{ fontSize: 11, color: "#8B7355", marginTop: 4, fontFamily: FONT_BODY }}>
              {sermon.trim().split(/\s+/).filter(Boolean).length} words
            </div>
          </div>

          {/* Instruction */}
          <div>
            <label style={Object.assign({}, styles.label, { marginBottom: 6, display: "block" })}>Instruction</label>
            <textarea
              value={instruction}
              onChange={function(e) { setInstruction(e.target.value); setError(""); }}
              placeholder={"Tell me what to do — e.g. 'Add more illustrations' or 'Strengthen the conclusion'…"}
              rows={3}
              style={{ width: "100%", border: "1.5px solid " + BORDER, borderRadius: 10, padding: "12px 14px", fontSize: 13.5, fontFamily: FONT_BODY, color: "#2C2416", background: "#FDFAF5", lineHeight: 1.6, resize: "vertical", outline: "none", boxSizing: "border-box" }}
            />
          </div>

          {/* Quick action chips */}
          <div>
            <div style={{ fontSize: 11, color: "#8B7355", fontFamily: FONT_BODY, marginBottom: 7, textTransform: "uppercase", letterSpacing: "0.06em" }}>Quick actions</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {QUICK_ACTIONS.map(function(q) {
                return (
                  <button key={q} onClick={function() { setInstruction(q); }}
                    style={{ background: instruction === q ? "#F5E6B3" : "white", border: "1px solid " + (instruction === q ? GOLD : BORDER), borderRadius: 20, padding: "5px 12px", fontSize: 12, color: instruction === q ? GOLD : "#2C2416", cursor: "pointer", fontFamily: FONT_BODY, fontWeight: instruction === q ? 700 : 400, transition: "all 0.15s" }}>
                    {q}
                  </button>
                );
              })}
            </div>
          </div>

          {error && <div style={{ color: "#DC2626", fontSize: 12, fontFamily: FONT_BODY, padding: "8px 12px", background: "#FEF2F2", borderRadius: 8, border: "1px solid #FECACA" }}>{error}</div>}

          <button
            onClick={handleDrop}
            disabled={loading || !sermon.trim() || !instruction.trim()}
            style={{ background: loading || !sermon.trim() || !instruction.trim() ? "#C4A882" : GOLD, color: "white", border: "none", borderRadius: 10, padding: "13px 0", fontSize: 14, fontWeight: 700, fontFamily: "'Georgia', serif", cursor: loading || !sermon.trim() || !instruction.trim() ? "not-allowed" : "pointer", letterSpacing: "0.02em", transition: "background 0.2s" }}>
            {loading ? "Working on it…" : "✦ Drop & Improve"}
          </button>
        </div>

        {/* Right col — result */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <label style={styles.label}>Result</label>
            {result && (
              <button onClick={handleCopy} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, color: copied ? "#16A34A" : GOLD, fontFamily: FONT_BODY, fontWeight: 600 }}>
                {copied ? "✓ Copied" : "Copy"}
              </button>
            )}
          </div>
          <div style={{ flex: 1, minHeight: 480, border: "1.5px solid " + BORDER, borderRadius: 10, padding: "14px 16px", background: result ? "#FDFAF5" : "#F8F4EE", fontSize: 13.5, fontFamily: FONT_BODY, color: "#2C2416", lineHeight: 1.75, whiteSpace: "pre-wrap", overflowY: "auto", position: "relative" }}>
            {loading && !result && (
              <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#8B7355", fontSize: 13 }}>
                <div style={{ width: 16, height: 16, border: "2px solid " + GOLD, borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                Reading your sermon…
              </div>
            )}
            {!loading && !result && (
              <div style={{ color: "#C4A882", fontSize: 13, fontStyle: "italic" }}>
                Your improved sermon will appear here.
              </div>
            )}
            {result}
          </div>
        </div>
      </div>
    </div>
  );
}
// ─────────────────────────────────────────────────────────────────────────────

// ── PORO AI SUPPORT WIDGET ──────────────────────────────────────────────────
function UsageTab() {
  const [events, setEvents] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("byFeature");
  const [selectedScreen, setSelectedScreen] = useState(null);

  useEffect(function() {
    (async function() {
      const { supabase } = await import("./lib/supabase");
      const [{ data: eventsData }, { data: usersData }] = await Promise.all([
        supabase.from("events").select("screen, user_id, created_at").order("created_at", { ascending: false }).limit(2000),
        supabase.from("users").select("id, full_name, email, plan"),
      ]);
      if (eventsData) setEvents(eventsData);
      if (usersData) setUsers(usersData);
      setLoading(false);
    })();
  }, []);

  if (loading) return <div style={{ textAlign: "center", padding: 40, color: "#A89070" }}>Loading...</div>;

  const userMap = {};
  users.forEach(function(u) { userMap[u.id] = u; });

  const screenCounts = {};
  events.forEach(function(e) { screenCounts[e.screen] = (screenCounts[e.screen] || 0) + 1; });
  const sortedScreens = Object.entries(screenCounts).sort(function(a, b) { return b[1] - a[1]; });
  const total = events.length;

  const userActivity = {};
  events.forEach(function(e) {
    if (!userActivity[e.user_id]) userActivity[e.user_id] = {};
    userActivity[e.user_id][e.screen] = (userActivity[e.user_id][e.screen] || 0) + 1;
  });

  var screenVisitors = [];
  if (selectedScreen) {
    var seen = {};
    events.filter(function(e) { return e.screen === selectedScreen; }).forEach(function(e) {
    });
  }

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {["byFeature", "byUser"].map(function(v) {
          return <button key={v} onClick={function() { setView(v); setSelectedScreen(null); }}
            style={{ padding: "6px 16px", border: "1px solid #E8DCC8", borderRadius: 20, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
              background: view === v ? "#B8860B" : "transparent", color: view === v ? "#fff" : "#A89070" }}>
            {v === "byFeature" ? "By Feature" : "By User"}
          </button>;
        })}
      </div>

      {view === "byFeature" && !selectedScreen && (
        <div>
          <div style={{ fontSize: 13, color: "#A89070", marginBottom: 16 }}>{total} total screen visits — click a feature to see who visited</div>
          {sortedScreens.map(function([screen, count]) {
            var pct = Math.round((count / total) * 100);
            return (
              <div key={screen} onClick={function() { setSelectedScreen(screen); }} style={{ background: "#fff", border: "1px solid #E8DCC8", borderRadius: 10, padding: "12px 18px", marginBottom: 8, cursor: "pointer" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#2C2416" }}>{screen}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#B8860B" }}>{count} visits ({pct}%)</span>
                </div>
                <div style={{ height: 6, background: "#F5F0E8", borderRadius: 3, overflow: "hidden" }}>
                  <div style={{ width: pct + "%", height: "100%", background: "#B8860B", borderRadius: 3 }} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {view === "byFeature" && selectedScreen && (
        <div>
          <button onClick={function() { setSelectedScreen(null); }} style={{ background: "none", border: "1px solid #E8DCC8", borderRadius: 8, padding: "6px 14px", fontSize: 13, cursor: "pointer", color: "#8B7355", fontFamily: "inherit", marginBottom: 16 }}>← Back</button>
          <div style={{ fontSize: 15, fontWeight: 800, color: "#2C2416", marginBottom: 12 }}>{selectedScreen} — {screenVisitors.length} unique visitors</div>
          {screenVisitors.length === 0 ? <div style={{ color: "#A89070", fontSize: 13 }}>No visitors yet.</div> :
            screenVisitors.map(function(uid) {
              var u = userMap[uid];
              var visitCount = userActivity[uid]?.[selectedScreen] || 0;
              return (
                <div key={uid} style={{ background: "#fff", border: "1px solid #E8DCC8", borderRadius: 10, padding: "12px 18px", marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#2C2416" }}>{u ? (u.full_name || u.email) : "Unknown"}</div>
                    <div style={{ fontSize: 11, color: "#A89070" }}>{u?.email} · {u?.plan || "free"}</div>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#B8860B" }}>{visitCount} visits</span>
                </div>
              );
            })
          }
        </div>
      )}

      {view === "byUser" && (
        <div>
          <div style={{ fontSize: 13, color: "#A89070", marginBottom: 16 }}>Activity breakdown per user</div>
          {Object.entries(userActivity).filter(function([uid]) { return uid && uid !== "null" && uid !== "undefined"; }).map(function([uid, screens]) {
            var u = userMap[uid];
            var topScreens = Object.entries(screens).sort(function(a, b) { return b[1] - a[1]; }).slice(0, 5);
            var totalVisits = Object.values(screens).reduce(function(s, n) { return s + n; }, 0);
            return (
              <div key={uid} style={{ background: "#fff", border: "1px solid #E8DCC8", borderRadius: 10, padding: "14px 18px", marginBottom: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#2C2416" }}>{u ? (u.full_name || u.email) : "Unknown"}</div>
                    <div style={{ fontSize: 11, color: "#A89070" }}>{u?.email} · {u?.plan || "free"}</div>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#B8860B" }}>{totalVisits} total visits</span>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {topScreens.map(function([screen, count]) {
                    return <span key={screen} style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, background: "#F5F0E8", color: "#8B7355", fontWeight: 600 }}>{screen} ({count})</span>;
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function CommandCenterScreen({ user }) {
  const JOSHUA_EMAIL = "joshuaporo@gmail.com";
  const [activeTab, setActiveTab] = useState("users");
  const [users, setUsers] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [ticketReplies, setTicketReplies] = useState([]);
  const [adminReply, setAdminReply] = useState("");
  const [loading, setLoading] = useState(true);
  const [msgTarget, setMsgTarget] = useState(null);
  const [msgSubject, setMsgSubject] = useState("");
  const [msgBody, setMsgBody] = useState("");
  const [sending, setSending] = useState(false);
  const [msgSent, setMsgSent] = useState(false);

  if (user.email !== JOSHUA_EMAIL) {
    return (
      <div style={{ maxWidth: 500, margin: "80px auto", textAlign: "center", fontFamily: FONT_BODY }}>
        <div style={{ fontSize: 32, marginBottom: 16 }}>🔒</div>
        <div style={{ fontSize: 18, fontWeight: 700, color: CHARCOAL }}>Access Restricted</div>
        <div style={{ fontSize: 14, color: STONE_LIGHT, marginTop: 8 }}>Command Center is only accessible to SermonCraft Pro administrators.</div>
      </div>
    );
  }

  useEffect(function() { loadAll(); }, []);

  async function loadAll() {
    const { supabase } = await import("./lib/supabase");
    const [{ data: usersData }, { data: ticketsData }] = await Promise.all([
      supabase.from("users").select("*").order("created_at", { ascending: false }),
      supabase.from("support_tickets").select("*, users(full_name, email)").order("created_at", { ascending: false }),
    ]);
    if (usersData) setUsers(usersData);
    if (ticketsData) setTickets(ticketsData);
    setLoading(false);
  }

  async function loadReplies(ticketId) {
    const { supabase } = await import("./lib/supabase");
    const { data } = await supabase.from("ticket_replies").select("*").eq("ticket_id", ticketId).order("created_at", { ascending: true });
    if (data) setTicketReplies(data);
  }

  async function sendReply() {
    if (!adminReply || !selectedTicket) return;
    const { supabase } = await import("./lib/supabase");
    const { data } = await supabase.from("ticket_replies").insert({
      ticket_id: selectedTicket.id, message: adminReply, sender: "admin", sender_name: "Poro"
    }).select().single();
    if (data) { setTicketReplies(function(prev) { return [...prev, data]; }); setAdminReply(""); }
    await supabase.from("support_tickets").update({ status: "in_progress", updated_at: new Date().toISOString() }).eq("id", selectedTicket.id);
    const userEmail = selectedTicket.users?.email;
    if (userEmail) {
      await fetch("/api/send", { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "ticket_reply", to: userEmail, ticketSubject: selectedTicket.subject, message: adminReply }) });
    }
  }

  async function sendMessage() {
    if (!msgSubject || !msgBody || !msgTarget) return;
    setSending(true);
    await fetch("/api/send", { method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "ticket_reply", to: msgTarget.email, ticketSubject: msgSubject, message: msgBody }) });
    setSending(false); setMsgSent(true);
    setTimeout(function() { setMsgSent(false); setMsgTarget(null); setMsgSubject(""); setMsgBody(""); }, 2000);
  }

  function fmt(d) { if (!d) return "—"; return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }); }
  function statusColor(s) { return s === "resolved" ? "#059669" : s === "in_progress" ? "#2F80ED" : "#D97706"; }
  function statusBg(s) { return s === "resolved" ? "#ECFDF5" : s === "in_progress" ? "#EEF5FF" : "#FEF3C7"; }
  function planColor(p) { return p === "church" || p === "bible_college" ? GOLD : p === "pastor" ? "#7C3AED" : p === "solo" || p === "student" ? "#2F80ED" : STONE_LIGHT; }

  const PLAN_PRICES = { student: 9, solo: 19, pastor: 49, church: 149, bible_college: 199 };
  const activePaid = users.filter(function(u) { return u.plan && u.plan !== "free" && u.plan !== "trial"; });
  const mrr = activePaid.reduce(function(sum, u) { return sum + (PLAN_PRICES[u.plan] || 0); }, 0);

  const TABS = [
    { id: "users", label: "Users" },
    { id: "tickets", label: "Support Tickets" },
    { id: "revenue", label: "Revenue" },
    { id: "messages", label: "Messages" },
    { id: "usage", label: "Usage" },
  ];

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px 16px", fontFamily: FONT_BODY }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: FONT_DISPLAY, fontSize: 22, fontWeight: 800, color: CHARCOAL, margin: 0 }}>⚡ Command Center</h1>
        <p style={{ color: STONE_LIGHT, fontSize: 13, margin: "4px 0 0" }}>SermonCraft Pro admin dashboard</p>
      </div>

      <div style={{ display: "flex", gap: 4, marginBottom: 24, background: "#F5F0E8", borderRadius: 10, padding: 4 }}>
        {TABS.map(function(tab) {
          return <button key={tab.id} onClick={function() { setSelectedTicket(null); setActiveTab(tab.id); }}
            style={{ flex: 1, padding: "8px 0", border: "none", borderRadius: 7, cursor: "pointer", fontSize: 13, fontWeight: activeTab === tab.id ? 700 : 500,
              background: activeTab === tab.id ? GOLD : "transparent", color: activeTab === tab.id ? "#fff" : STONE, fontFamily: FONT_BODY }}>{tab.label}</button>;
        })}
      </div>

      {loading ? <div style={{ textAlign: "center", padding: 40, color: STONE_LIGHT }}>Loading...</div> : (
        <>
          {/* USERS TAB */}
          {activeTab === "users" && (
            <div>
              <div style={{ fontSize: 13, color: STONE_LIGHT, marginBottom: 12 }}>{users.length} total users</div>
              {users.map(function(u) {
                return (
                  <div key={u.id} style={{ background: "#fff", border: "1px solid " + BORDER, borderRadius: 10, padding: "14px 18px", marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: CHARCOAL }}>{u.full_name || "—"}</div>
                      <div style={{ fontSize: 12, color: STONE_LIGHT }}>{u.email} · Joined {fmt(u.created_at)}</div>
                    </div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <select defaultValue={u.plan || "free"} onChange={async function(e) {
                        var newPlan = e.target.value;
                        const { supabase } = await import("./lib/supabase");
                        await supabase.from("users").update({ plan: newPlan }).eq("id", u.id);
                        setUsers(function(prev) { return prev.map(function(x) { return x.id === u.id ? Object.assign({}, x, { plan: newPlan }) : x; }); });
                      }} style={{ fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 20, background: "#F5F0E8", border: "1px solid " + BORDER, color: planColor(u.plan), fontFamily: FONT_BODY, cursor: "pointer" }}>
                        {["free","student","solo","pastor","church","bible_college"].map(function(p) { return <option key={p} value={p}>{p}</option>; })}
                      </select>
                      <button onClick={function() { setMsgTarget(u); setActiveTab("messages"); }}
                        style={{ background: "none", border: "1px solid " + BORDER, borderRadius: 6, padding: "4px 10px", fontSize: 11, cursor: "pointer", color: STONE, fontFamily: FONT_BODY }}>Message</button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TICKETS TAB */}
          {activeTab === "tickets" && !selectedTicket && (
            <div>
              <div style={{ fontSize: 13, color: STONE_LIGHT, marginBottom: 12 }}>{tickets.length} total tickets</div>
              {tickets.length === 0 ? <div style={{ textAlign: "center", padding: 40, color: STONE_LIGHT }}>No tickets yet.</div> :
                tickets.map(function(t) {
                  return (
                    <div key={t.id} onClick={async function() { setSelectedTicket(t); await loadReplies(t.id); }}
                      style={{ background: "#fff", border: "1px solid " + BORDER, borderRadius: 10, padding: "14px 18px", marginBottom: 8, cursor: "pointer" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: CHARCOAL, marginBottom: 2 }}>{t.subject}</div>
                          <div style={{ fontSize: 12, color: STONE_LIGHT }}>{t.users?.full_name || "Unknown"} · {fmt(t.created_at)}</div>
                        </div>
                        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                          {t.priority === "urgent" && <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: "#FEE2E2", color: "#DC2626" }}>URGENT</span>}
                          <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: statusBg(t.status), color: statusColor(t.status) }}>{t.status.replace("_", " ")}</span>
                          <span style={{ fontSize: 12, color: GOLD, fontWeight: 600 }}>View →</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              }
            </div>
          )}

          {activeTab === "tickets" && selectedTicket && (
            <div>
              <button onClick={function() { setSelectedTicket(null); setTicketReplies([]); }}
                style={{ background: "none", border: "1px solid " + BORDER, borderRadius: 8, padding: "6px 14px", fontSize: 13, cursor: "pointer", color: STONE, fontFamily: FONT_BODY, marginBottom: 16 }}>← Back to tickets</button>
              <div style={{ background: "#fff", border: "1px solid " + BORDER, borderRadius: 12, padding: 24 }}>
                <h2 style={{ fontFamily: FONT_DISPLAY, fontSize: 17, fontWeight: 800, color: CHARCOAL, margin: "0 0 8px" }}>{selectedTicket.subject}</h2>
                <div style={{ fontSize: 12, color: STONE_LIGHT, marginBottom: 16 }}>From: {selectedTicket.users?.full_name || "Unknown"} · {fmt(selectedTicket.created_at)}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12, maxHeight: 400, overflowY: "auto", marginBottom: 20 }}>
                  {ticketReplies.map(function(r) {
                    var isAdmin = r.sender === "admin";
                    return (
                      <div key={r.id} style={{ display: "flex", justifyContent: isAdmin ? "flex-end" : "flex-start" }}>
                        <div style={{ maxWidth: "75%", padding: "12px 16px", borderRadius: 12, background: isAdmin ? CHARCOAL : GOLD_PALE, color: isAdmin ? "#fff" : CHARCOAL }}>
                          <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 6, opacity: 0.7 }}>{r.sender_name} · {fmt(r.created_at?.split("T")[0])}</div>
                          <div style={{ fontSize: 14, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{r.message}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <textarea value={adminReply} onChange={function(e) { setAdminReply(e.target.value); }}
                  onKeyDown={function(e) { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendReply(); } }}
                  placeholder="Reply as SermonCraft Pro Support... (Enter to send)" rows={4}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid " + BORDER, fontSize: 14, color: CHARCOAL, fontFamily: FONT_BODY, outline: "none", resize: "vertical", boxSizing: "border-box", marginBottom: 10 }} />
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <button onClick={sendReply} disabled={!adminReply}
                    style={{ background: GOLD, color: "#fff", border: "none", borderRadius: 8, padding: "10px 20px", fontWeight: 700, fontSize: 13, cursor: adminReply ? "pointer" : "not-allowed", opacity: adminReply ? 1 : 0.5, fontFamily: FONT_BODY }}>Send Reply</button>
                </div>
              </div>
            </div>
          )}

          {/* REVENUE TAB */}
          {activeTab === "revenue" && (
            <div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24 }}>
                {[
                  { label: "MRR", value: "$" + mrr.toLocaleString() },
                  { label: "ARR", value: "$" + (mrr * 12).toLocaleString() },
                  { label: "Paid Users", value: activePaid.length },
                ].map(function(stat) {
                  return (
                    <div key={stat.label} style={{ background: "#fff", border: "1px solid " + BORDER, borderRadius: 12, padding: 20, textAlign: "center" }}>
                      <div style={{ fontSize: 28, fontWeight: 800, color: CHARCOAL, fontFamily: FONT_DISPLAY }}>{stat.value}</div>
                      <div style={{ fontSize: 12, color: STONE_LIGHT, marginTop: 4 }}>{stat.label}</div>
                    </div>
                  );
                })}
              </div>
              {["student", "solo", "pastor", "church", "bible_college"].map(function(plan) {
                var count = users.filter(function(u) { return u.plan === plan; }).length;
                var revenue = count * (PLAN_PRICES[plan] || 0);
                return (
                  <div key={plan} style={{ background: "#fff", border: "1px solid " + BORDER, borderRadius: 10, padding: "14px 18px", marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: "#F5F0E8", color: planColor(plan) }}>{plan}</span>
                      <span style={{ fontSize: 14, color: CHARCOAL }}>{count} users</span>
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 700, color: CHARCOAL }}>${revenue}/mo</span>
                  </div>
                );
              })}
            </div>
          )}

          {/* USAGE TAB */}
          {activeTab === "usage" && (
            <UsageTab />
          )}

          {/* MESSAGES TAB */}
          {activeTab === "messages" && (
            <div>
              <h3 style={{ fontFamily: FONT_DISPLAY, fontSize: 15, fontWeight: 800, color: CHARCOAL, marginBottom: 16 }}>Send Message to User</h3>
              {msgSent && <div style={{ background: "#ECFDF5", border: "1px solid #6EE7B7", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#059669", marginBottom: 16 }}>Message sent successfully.</div>}
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: STONE, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 6 }}>Recipient</label>
                <select value={msgTarget?.id || ""} onChange={function(e) { setMsgTarget(users.find(function(u) { return u.id === e.target.value; }) || null); }}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid " + BORDER, fontSize: 14, color: CHARCOAL, fontFamily: FONT_BODY, outline: "none", background: "#fff" }}>
                  <option value="">Select a user...</option>
                  {users.map(function(u) { return <option key={u.id} value={u.id}>{u.full_name || u.email} — {u.email}</option>; })}
                </select>
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: STONE, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 6 }}>Subject</label>
                <input value={msgSubject} onChange={function(e) { setMsgSubject(e.target.value); }} placeholder="Message subject"
                  style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid " + BORDER, fontSize: 14, color: CHARCOAL, fontFamily: FONT_BODY, outline: "none", boxSizing: "border-box" }} />
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: STONE, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 6 }}>Message</label>
                <textarea value={msgBody} onChange={function(e) { setMsgBody(e.target.value); }} placeholder="Type your message..." rows={6}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid " + BORDER, fontSize: 14, color: CHARCOAL, fontFamily: FONT_BODY, outline: "none", resize: "vertical", boxSizing: "border-box" }} />
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button onClick={sendMessage} disabled={sending || !msgTarget || !msgSubject || !msgBody}
                  style={{ background: GOLD, color: "#fff", border: "none", borderRadius: 8, padding: "10px 20px", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: FONT_BODY, opacity: sending ? 0.7 : 1 }}>{sending ? "Sending..." : "Send Message"}</button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function SupportScreen({ user }) {
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replies, setReplies] = useState([]);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [reply, setReply] = useState("");
  const [priority, setPriority] = useState("normal");
  const [showNewModal, setShowNewModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(function() {
    loadTickets();
  }, []);

  async function loadTickets() {
    const { supabase } = await import("./lib/supabase");
    const { data } = await supabase.from("support_tickets").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
    if (data) setTickets(data);
    setLoading(false);
  }

  async function loadReplies(ticketId) {
    const { supabase } = await import("./lib/supabase");
    const { data } = await supabase.from("ticket_replies").select("*").eq("ticket_id", ticketId).order("created_at", { ascending: true });
    if (data) setReplies(data);
  }

  async function submitTicket() {
    if (!subject || !message) return;
    setSubmitting(true);
    const { supabase } = await import("./lib/supabase");
    const { data } = await supabase.from("support_tickets").insert({
      user_id: user.id, subject, message, status: "open", priority
    }).select().single();
    if (data) {
      await supabase.from("ticket_replies").insert({ ticket_id: data.id, message, sender: "user", sender_name: user.name || "Pastor" });
      setTickets(function(prev) { return [data, ...prev]; });
      setSubject(""); setMessage(""); setPriority("normal"); setShowNewModal(false);
      await fetch("/api/send", { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "new_ticket", subject, message, priority, userName: user.name || "Pastor", userEmail: user.email }) });
    }
    setSubmitting(false);
  }

  async function sendReply() {
    if (!reply || !selectedTicket) return;
    const { supabase } = await import("./lib/supabase");
    const { data } = await supabase.from("ticket_replies").insert({
      ticket_id: selectedTicket.id, message: reply, sender: "user", sender_name: user.name || "Pastor"
    }).select().single();
    if (data) { setReplies(function(prev) { return [...prev, data]; }); setReply(""); }
    await supabase.from("support_tickets").update({ updated_at: new Date().toISOString() }).eq("id", selectedTicket.id);
  }

  function fmt(d) { if (!d) return ""; return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }); }
  function statusColor(s) { return s === "resolved" ? "#059669" : s === "in_progress" ? "#2F80ED" : "#D97706"; }
  function statusBg(s) { return s === "resolved" ? "#ECFDF5" : s === "in_progress" ? "#EEF5FF" : "#FEF3C7"; }

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "24px 16px", fontFamily: FONT_BODY }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: FONT_DISPLAY, fontSize: 22, fontWeight: 800, color: CHARCOAL, margin: 0 }}>Support</h1>
          <p style={{ color: STONE_LIGHT, fontSize: 13, margin: "4px 0 0" }}>Get help from the SermonCraft Pro team</p>
        </div>
        {!selectedTicket && <button onClick={function() { setShowNewModal(true); }} style={{ background: GOLD, color: "#fff", border: "none", borderRadius: 8, padding: "10px 18px", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: FONT_BODY }}>+ New Ticket</button>}
      </div>

      {selectedTicket ? (
        <div>
          <button onClick={function() { setSelectedTicket(null); setReplies([]); }} style={{ background: "none", border: "1px solid " + BORDER, borderRadius: 8, padding: "6px 14px", fontSize: 13, cursor: "pointer", color: STONE, fontFamily: FONT_BODY, marginBottom: 16 }}>← Back to tickets</button>
          <div style={{ background: "#fff", border: "1px solid " + BORDER, borderRadius: 12, padding: 24, marginBottom: 16 }}>
            <h2 style={{ fontFamily: FONT_DISPLAY, fontSize: 17, fontWeight: 800, color: CHARCOAL, margin: "0 0 8px" }}>{selectedTicket.subject}</h2>
            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
              <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: statusBg(selectedTicket.status), color: statusColor(selectedTicket.status) }}>{selectedTicket.status.replace("_", " ")}</span>
              <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: selectedTicket.priority === "urgent" ? "#FEE2E2" : "#F3F4F6", color: selectedTicket.priority === "urgent" ? "#DC2626" : STONE }}>{selectedTicket.priority}</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, maxHeight: 400, overflowY: "auto", marginBottom: 20 }}>
              {replies.map(function(r) {
                var isAdmin = r.sender === "admin";
                return (
                  <div key={r.id} style={{ display: "flex", justifyContent: isAdmin ? "flex-start" : "flex-end" }}>
                    <div style={{ maxWidth: "75%", padding: "12px 16px", borderRadius: 12, background: isAdmin ? CHARCOAL : GOLD_PALE, color: isAdmin ? "#fff" : CHARCOAL }}>
                      <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 6, opacity: 0.7 }}>{r.sender_name} · {fmt(r.created_at?.split("T")[0])}</div>
                      <div style={{ fontSize: 14, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{r.message}</div>
                    </div>
                  </div>
                );
              })}
              {replies.length === 0 && <div style={{ color: STONE_LIGHT, fontSize: 13, textAlign: "center", padding: 20 }}>No replies yet. Our team will respond within 24 hours.</div>}
            </div>
            {selectedTicket.status !== "resolved" && (
              <div>
                <textarea value={reply} onChange={function(e) { setReply(e.target.value); }}
                  onKeyDown={function(e) { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendReply(); } }}
                  placeholder="Type your message... (Enter to send, Shift+Enter for new line)" rows={3}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid " + BORDER, fontSize: 14, color: CHARCOAL, fontFamily: FONT_BODY, outline: "none", resize: "vertical", boxSizing: "border-box", marginBottom: 10 }} />
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <button onClick={sendReply} disabled={!reply} style={{ background: GOLD, color: "#fff", border: "none", borderRadius: 8, padding: "10px 20px", fontWeight: 700, fontSize: 13, cursor: reply ? "pointer" : "not-allowed", opacity: reply ? 1 : 0.5, fontFamily: FONT_BODY }}>Send Reply</button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div>
          {loading ? <div style={{ color: STONE_LIGHT, textAlign: "center", padding: 40 }}>Loading...</div> :
            tickets.length === 0 ? (
              <div style={{ background: "#fff", border: "1px solid " + BORDER, borderRadius: 12, padding: 40, textAlign: "center" }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>🎧</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: CHARCOAL, marginBottom: 8 }}>No support tickets yet</div>
                <div style={{ fontSize: 13, color: STONE_LIGHT, marginBottom: 20 }}>Submit a ticket and our team will respond within 24 hours.</div>
                <button onClick={function() { setShowNewModal(true); }} style={{ background: GOLD, color: "#fff", border: "none", borderRadius: 8, padding: "10px 20px", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: FONT_BODY }}>Submit Your First Ticket</button>
              </div>
            ) : tickets.map(function(t) {
              return (
                <div key={t.id} onClick={async function() { setSelectedTicket(t); await loadReplies(t.id); }}
                  style={{ background: "#fff", border: "1px solid " + BORDER, borderRadius: 12, padding: "16px 20px", marginBottom: 10, cursor: "pointer" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: CHARCOAL, marginBottom: 4 }}>{t.subject}</div>
                      <div style={{ fontSize: 12, color: STONE_LIGHT }}>{fmt(t.created_at?.split("T")[0])}</div>
                    </div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      {t.priority === "urgent" && <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: "#FEE2E2", color: "#DC2626" }}>URGENT</span>}
                      <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: statusBg(t.status), color: statusColor(t.status) }}>{t.status.replace("_", " ")}</span>
                      <span style={{ fontSize: 12, color: GOLD, fontWeight: 600 }}>View →</span>
                    </div>
                  </div>
                </div>
              );
            })
          }
        </div>
      )}

      {showNewModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(44,36,22,0.45)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div style={{ background: "#fff", borderRadius: 16, padding: 32, width: "100%", maxWidth: 500, boxShadow: "0 4px 24px rgba(44,36,22,0.15)" }}>
            <h2 style={{ fontFamily: FONT_DISPLAY, fontSize: 18, fontWeight: 800, color: CHARCOAL, margin: "0 0 20px" }}>New Support Ticket</h2>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: STONE, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 6 }}>Subject</label>
              <input value={subject} onChange={function(e) { setSubject(e.target.value); }} placeholder="Brief description of your issue"
                style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid " + BORDER, fontSize: 14, color: CHARCOAL, fontFamily: FONT_BODY, outline: "none", boxSizing: "border-box" }} />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: STONE, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 6 }}>Priority</label>
              <select value={priority} onChange={function(e) { setPriority(e.target.value); }}
                style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid " + BORDER, fontSize: 14, color: CHARCOAL, fontFamily: FONT_BODY, outline: "none", background: "#fff" }}>
                <option value="normal">Normal — General question or minor issue</option>
                <option value="high">High — Affecting daily workflow</option>
                <option value="urgent">Urgent — Critical issue</option>
              </select>
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: STONE, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 6 }}>Describe your issue</label>
              <textarea value={message} onChange={function(e) { setMessage(e.target.value); }} placeholder="Please provide as much detail as possible..." rows={5}
                style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid " + BORDER, fontSize: 14, color: CHARCOAL, fontFamily: FONT_BODY, outline: "none", resize: "vertical", boxSizing: "border-box" }} />
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button onClick={function() { setShowNewModal(false); }} style={{ background: "none", border: "1px solid " + BORDER, borderRadius: 8, padding: "10px 18px", fontSize: 13, cursor: "pointer", color: STONE, fontFamily: FONT_BODY }}>Cancel</button>
              <button onClick={submitTicket} disabled={submitting || !subject || !message} style={{ background: GOLD, color: "#fff", border: "none", borderRadius: 8, padding: "10px 18px", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: FONT_BODY, opacity: submitting ? 0.7 : 1 }}>{submitting ? "Submitting..." : "Submit Ticket"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

var PORO_SYSTEM_PROMPT = "You are Poro \u2014 the friendly, knowledgeable support assistant for SermonCraft Pro, an AI-powered ministry SaaS platform built for pastors and church leaders.\n\nYour personality: warm, pastoral, encouraging, and concise. You speak like someone who understands ministry deeply. You never sound robotic or corporate.\n\n## About SermonCraft Pro\nSermonCraft Pro helps pastors: draft and refine sermons, study the Bible with AI commentary and word studies, manage their team with Team Scheduler and Worship Set Builder, track congregation health, multiply content (devotionals, social posts, emails), connect with Planning Center, preach in 11 languages, and preview sermons with TTS audio.\n\n## Pricing Plans\n- Free \u2014 limited trial\n- Student \u2014 $9/month (Bible college students)\n- Solo \u2014 $19/month (bivocational pastors)\n- Pastor \u2014 $49/month (full-time pastors)\n- Church \u2014 $149/month (churches with teams)\n- Bible College \u2014 $199/month (institutions, multiple seats)\n\n## How to Handle Issues\nAlways try to SOLVE the problem before escalating:\n1. Understand \u2014 ask a clarifying question if vague\n2. Diagnose \u2014 identify the likely cause\n3. Guide \u2014 give clear step-by-step instructions\n4. Confirm \u2014 ask if resolved before offering escalation\n5. Escalate only if it's a confirmed bug, billing problem, or you've exhausted options\n\nCommon fixes:\n- Feature not showing \u2014 check plan tier, explain what plan unlocks it\n- Planning Center not connecting \u2014 Settings \u2192 Integrations \u2192 Connect PCO \u2192 authorize \u2192 return to app\n- Sermon not generating \u2014 refresh, clear cache, try different browser\n- Can't log in \u2014 password reset on login screen, check email for magic link, try incognito\n- Billing question \u2014 Settings \u2192 Billing in app\n- Language not working \u2014 Settings \u2192 Profile \u2192 Language\n- TTS not playing \u2014 check volume, try different browser, disable extensions\n- Team invite not received \u2014 check spam, confirm email, pastor can resend from Team Scheduler\n\n## Escalation (last resort only)\nAfter genuinely attempting to solve: 'I wasn't able to fully resolve this on my end. Our team will personally look into it \u2014 you can reach us at jporo@sermoncraftpro.com and we typically respond within 1\u20134 hours.'\n\nNever make up features or pricing. Keep responses clear and practical.\n\n## Formatting Rules\nThis chat widget renders plain text only. Never use markdown. No asterisks, no bold, no bullet dashes, no emojis, no --- dividers, no # headers. Write in plain conversational sentences. For lists, use simple numbered lines like: 1. First item\n2. Second item. No symbols of any kind.";

function PoroAIWidget() {
  var GOLD = "#B8860B"; var CHARCOAL = "#2C2416"; var CREAM = "#FDFAF5"; var STONE = "#8B7355"; var STONE_L = "#C4A882"; var DARK = "#1A1508";
  var _s = useState([]); var msgs = _s[0]; var setMsgs = _s[1];
  var _o = useState(false); var open = _o[0]; var setOpen = _o[1];
  var _i = useState(""); var inp = _i[0]; var setInp = _i[1];
  var _l = useState(false); var loading = _l[0]; var setLoading = _l[1];
  var _sg = useState(true); var showSug = _sg[0]; var setShowSug = _sg[1];
  var endRef = useRef(null); var inpRef = useRef(null);

  useEffect(function() {
    if (open && msgs.length === 0) {
      setMsgs([{ role: "assistant", content: "Hello! I\u2019m Poro \u2014 your SermonCraft Pro guide. I\u2019m here to help with features, troubleshooting, pricing, or anything else. What\u2019s on your mind?" }]);
    }
    if (open) setTimeout(function() { inpRef.current && inpRef.current.focus(); }, 300);
  }, [open]);

  useEffect(function() { endRef.current && endRef.current.scrollIntoView({ behavior: "smooth" }); }, [msgs, loading]);

  var SUGS = ["What\u2019s included in Pastor plan?", "I have a problem with a feature", "How do I connect Planning Center?", "How do I get started?"];

  function send(text) {
    var t = text || inp.trim(); if (!t || loading) return;
    setInp(""); setShowSug(false);
    var next = msgs.concat([{ role: "user", content: t }]);
    setMsgs(next); setLoading(true);
    // Route through /api/forge-json to keep API key server-side
    var isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
    var apiBase = isLocal ? "https://sermoncraft-pro.vercel.app" : "";
    // Build conversation history as formatted prompt for forge-json
    var history = next.slice(0, -1).map(function(m) {
      return (m.role === "user" ? "User: " : "Poro: ") + m.content;
    }).join("\n");
    var prompt = history ? history + "\nUser: " + t : t;
    fetch(apiBase + "/api/forge-json", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: prompt, sys: PORO_SYSTEM_PROMPT, mode: "fast" })
    }).then(function(r) { return r.json(); }).then(function(d) {
      var reply = (d && d.result) || "Sorry, I had trouble responding. Please email jporo@sermoncraftpro.com";
      setMsgs(next.concat([{ role: "assistant", content: reply }]));
    }).catch(function() {
      setMsgs(next.concat([{ role: "assistant", content: "I ran into a connection issue. Reach us at jporo@sermoncraftpro.com \u2014 we respond within 1\u20134 hours!" }]));
    }).finally(function() { setLoading(false); });
  }

  var panelStyle = { position:"fixed", bottom:102, right:28, width:340, height:500, borderRadius:20, background:CREAM, boxShadow:"0 24px 64px rgba(44,36,22,0.2)", display:"flex", flexDirection:"column", overflow:"hidden", zIndex:9998, border:"1px solid rgba(196,168,130,0.3)" };
  var headerStyle = { background:"linear-gradient(135deg,"+DARK+" 0%,"+CHARCOAL+" 100%)", padding:"14px 16px", display:"flex", alignItems:"center", gap:10 };
  var avatarStyle = { width:36, height:36, borderRadius:"50%", background:"linear-gradient(135deg,"+GOLD+",#8B6914)", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"Georgia,serif", color:CREAM, fontWeight:"bold", fontSize:16, flexShrink:0 };

  return React.createElement(React.Fragment, null,
    React.createElement("style", null, "@keyframes poroBounce{0%,60%,100%{transform:translateY(0);opacity:.5}30%{transform:translateY(-5px);opacity:1}}@keyframes poroFade{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}@keyframes poroOpen{from{opacity:0;transform:scale(.93) translateY(14px)}to{opacity:1;transform:scale(1) translateY(0)}}"),
    open && React.createElement("div", { style: panelStyle },
      React.createElement("div", { style: headerStyle },
        React.createElement("div", { style: avatarStyle }, "P"),
        React.createElement("div", { style:{flex:1} },
          React.createElement("div", { style:{fontFamily:"Georgia,serif",color:CREAM,fontSize:14,fontWeight:"bold"} }, "Poro"),
          React.createElement("div", { style:{color:STONE_L,fontSize:11,fontFamily:"DM Sans,sans-serif",display:"flex",alignItems:"center",gap:4} },
            React.createElement("div", { style:{width:6,height:6,borderRadius:"50%",background:"#4ADE80"} }), "Poro"
          )
        ),
        React.createElement("button", { onClick:function(){setOpen(false);}, style:{background:"transparent",border:"none",cursor:"pointer",padding:6,borderRadius:8,display:"flex",alignItems:"center"} },
          React.createElement("svg", { width:16, height:16, viewBox:"0 0 24 24", fill:"none", stroke:STONE_L, strokeWidth:2, strokeLinecap:"round" },
            React.createElement("line", { x1:18, y1:6, x2:6, y2:18 }), React.createElement("line", { x1:6, y1:6, x2:18, y2:18 })
          )
        )
      ),
      React.createElement("div", { style:{height:2,background:"linear-gradient(90deg,"+GOLD+","+STONE_L+",transparent)"} }),
      React.createElement("div", { style:{flex:1,overflowY:"auto",padding:"14px 12px 8px",background:"linear-gradient(180deg,#F8F4EE 0%,"+CREAM+" 100%)"} },
        msgs.map(function(m, i) {
          var isU = m.role === "user";
          return React.createElement("div", { key:i, style:{display:"flex",justifyContent:isU?"flex-end":"flex-start",marginBottom:10,animation:"poroFade .25s ease"} },
            !isU && React.createElement("div", { style:Object.assign({},avatarStyle,{width:28,height:28,fontSize:12,marginRight:6}) }, "P"),
            React.createElement("div", { style:{maxWidth:"75%",padding:"9px 13px",borderRadius:isU?"16px 16px 4px 16px":"16px 16px 16px 4px",background:isU?"linear-gradient(135deg,"+GOLD+",#D4A017)":"white",color:isU?"white":CHARCOAL,fontSize:13,lineHeight:1.55,fontFamily:"DM Sans,Calibri,sans-serif",boxShadow:isU?"0 2px 10px rgba(184,134,11,.25)":"0 2px 8px rgba(44,36,22,.08)",border:isU?"none":"1px solid rgba(196,168,130,.25)",whiteSpace:"pre-wrap"} }, m.content)
          );
        }),
        loading && React.createElement("div", { style:{display:"flex",alignItems:"center"} },
          React.createElement("div", { style:Object.assign({},avatarStyle,{width:28,height:28,fontSize:12,marginRight:6}) }, "P"),
          React.createElement("div", { style:{background:"white",borderRadius:"16px 16px 16px 4px",border:"1px solid rgba(196,168,130,.25)",padding:"10px 13px",display:"flex",gap:4} },
            [0,1,2].map(function(i){ return React.createElement("div",{key:i,style:{width:6,height:6,borderRadius:"50%",background:STONE,animation:"poroBounce 1.2s infinite",animationDelay:(i*0.2)+"s"}}); })
          )
        ),
        showSug && msgs.length <= 1 && !loading && React.createElement("div", { style:{marginTop:10} },
          React.createElement("div", { style:{fontSize:10.5,color:STONE,fontFamily:"DM Sans,sans-serif",marginBottom:7,textTransform:"uppercase",letterSpacing:".08em"} }, "Suggested"),
          React.createElement("div", { style:{display:"flex",flexWrap:"wrap",gap:5} },
            SUGS.map(function(q){ return React.createElement("button",{key:q,onClick:function(){send(q);},style:{background:"white",border:"1px solid rgba(196,168,130,.4)",borderRadius:20,padding:"4px 11px",fontSize:11.5,color:CHARCOAL,cursor:"pointer",fontFamily:"DM Sans,sans-serif"}},q); })
          )
        ),
        React.createElement("div", { ref: endRef })
      ),
      React.createElement("div", { style:{padding:"10px 12px",background:"white",borderTop:"1px solid rgba(196,168,130,.2)",display:"flex",gap:7,alignItems:"flex-end"} },
        React.createElement("textarea", { ref:inpRef, value:inp, onChange:function(e){setInp(e.target.value);}, onKeyDown:function(e){if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send();}}, placeholder:"Ask about features, pricing, or get help\u2026", rows:1, style:{flex:1,resize:"none",border:"1.5px solid rgba(196,168,130,.4)",borderRadius:10,padding:"8px 11px",fontSize:13,fontFamily:"DM Sans,Calibri,sans-serif",color:CHARCOAL,background:CREAM,lineHeight:1.4,maxHeight:90,overflow:"auto"} }),
        React.createElement("button", { onClick:function(){send();}, disabled:!inp.trim()||loading, style:{width:36,height:36,borderRadius:9,background:inp.trim()&&!loading?GOLD:"#C4A882",border:"none",cursor:inp.trim()&&!loading?"pointer":"not-allowed",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0} },
          React.createElement("svg", { width:15, height:15, viewBox:"0 0 24 24", fill:"none", stroke:"white", strokeWidth:2.5, strokeLinecap:"round", strokeLinejoin:"round" },
            React.createElement("line",{x1:22,y1:2,x2:11,y2:13}), React.createElement("polygon",{points:"22 2 15 22 11 13 2 9 22 2"})
          )
        )
      ),
      React.createElement("div", { style:{textAlign:"center",padding:"5px 0 7px",fontSize:10,color:STONE_L,fontFamily:"DM Sans,sans-serif",background:"white"} },
        "Powered by ", React.createElement("span", { style:{color:GOLD,fontWeight:600} }, "SermonCraft Pro")
      )
    ),
    React.createElement("div", { style:{position:"fixed",bottom:28,right:28,zIndex:9999} },
      React.createElement("button", { onClick:function(){setOpen(!open);}, style:{width:56,height:56,borderRadius:"50%",background:"linear-gradient(135deg,"+GOLD+","+CHARCOAL+")",border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 4px 20px rgba(184,134,11,.4)",position:"relative"} },
        open
          ? React.createElement("svg",{width:20,height:20,viewBox:"0 0 24 24",fill:"none",stroke:"white",strokeWidth:2.5,strokeLinecap:"round"}, React.createElement("line",{x1:18,y1:6,x2:6,y2:18}), React.createElement("line",{x1:6,y1:6,x2:18,y2:18}))
          : React.createElement("svg",{width:22,height:22,viewBox:"0 0 24 24",fill:"none",stroke:"white",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"}, React.createElement("path",{d:"M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"})),
        !open && React.createElement("div", { style:{position:"absolute",top:3,right:3,width:11,height:11,borderRadius:"50%",background:"#EF4444",border:"2px solid white"} })
      )
    )
  );
}
// ─────────────────────────────────────────────────────────────────────────────

export default function SermonCraftPro({ user, profile, church, pendingInvitation, onSignOut, onChurchUpdate, onInvitationHandled }) {

  const [showOnboarding, setShowOnboarding] = useState(function() {
    var done = localStorage.getItem("scp_onboarding_" + (user?.id || "")) === "done";
    var hasVoice = !!localStorage.getItem("scp_voice_" + (user?.id || ""));
    return !done && !hasVoice && !profile?.onboarding_complete && !profile?.church;
  });

  const [currentScreen, setCurrentScreenRaw] = useState(function() {
    return sessionStorage.getItem("scp_screen") || "dashboard";
  });
  const [viewMode, setViewMode] = useState(function() {
    return sessionStorage.getItem("scp_viewmode") || "pastor";
  });

  function setCurrentScreen(screen) {
    sessionStorage.setItem("scp_screen", screen);
    setCurrentScreenRaw(screen);
    (async function() {
      try {
        const { supabase } = await import("./lib/supabase");
        await supabase.from("events").insert({ user_id: currentUser?.id, screen });
      } catch(e) {}
    })();
  }

  function handleOnboardingComplete(result) {
    localStorage.setItem("scp_onboarding_" + (user?.id || ""), "done");
    setShowOnboarding(false);
    if (result && result.sermonTopic) {
      setTimeout(function() {
        setForgePrefill({ title: result.sermonTopic, scripture: "", angle: "" });
        setCurrentScreen("sermon-forge");
      }, 100);
    }
    // Save voice profile if doctrine was selected
    if (result && result.doctrine) {
      var vp = { doctrine: result.doctrine, style: result.style || "", tone: result.tone || "", confirmed: true };
      localStorage.setItem("scp_voice_" + (user?.id || ""), JSON.stringify(vp));
    }
  }

  const [library, setLibrary] = useState([]);
  const [libraryLoading, setLibraryLoading] = useState(true);
  const [showMigrationPrompt, setShowMigrationPrompt] = useState(false);
  const [showGlobalUpgradeModal, setShowGlobalUpgradeModal] = useState(false);
  const [localSermons, setLocalSermons] = useState([]);
  const [migrating, setMigrating] = useState(false);
  const [showInvitationPrompt, setShowInvitationPrompt] = useState(!!pendingInvitation);
  const [invitationLoading, setInvitationLoading] = useState(false);
  const [language, setLanguage] = useState(profile?.language || "en");
  const libCounter = useRef(100);
  const [forgePrefill, setForgePrefill] = useState(null);
  const [multiplyPrefill, setMultiplyPrefill] = useState(null);
  const [pcoConnected, setPcoConnected] = useState(function() {
    return !!localStorage.getItem("scp_pco_token_" + (user?.id || ""));
  });
  const [pcoConnectStatus, setPcoConnectStatus] = useState("");

  // Handle PCO OAuth callback redirect
  useEffect(function() {
    var params = new URLSearchParams(window.location.search);
    var pco = params.get("pco");
    var pcoToken = params.get("pco_token");
    var pcoUser = params.get("pco_user");
    if (pco === "connected" && pcoToken) {
      var tokenKey = "scp_pco_token_" + (user?.id || pcoUser || "");
      localStorage.setItem(tokenKey, decodeURIComponent(pcoToken));
      setPcoConnected(true);
      setPcoConnectStatus("Planning Center connected successfully!");
      setCurrentScreen("planning-center");
      window.history.replaceState({}, "", window.location.pathname);
    } else if (pco === "denied" || pco === "error") {
      setPcoConnectStatus("Could not connect to Planning Center. Please try again.");
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  // ── Voice Profile State ──────────────────────────────────────────────────
  const [voiceProfile, setVoiceProfile] = useState(function() { try { var stored = localStorage.getItem("scp_voice_" + (user?.id || "")); return stored ? JSON.parse(stored) : null; } catch(e) { return null; } });
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const pendingGenerateRef = useRef(null);

  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const installPromptRef = useRef(null);

  useEffect(function() {
    function handleBeforeInstall(e) {
      e.preventDefault();
      installPromptRef.current = e;
      setShowInstallPrompt(true);
    }
    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    return function() { window.removeEventListener("beforeinstallprompt", handleBeforeInstall); };
  }, []);

  async function handleInstallApp() {
    if (!installPromptRef.current) return;
    installPromptRef.current.prompt();
    var result = await installPromptRef.current.userChoice;
    if (result.outcome === "accepted") setShowInstallPrompt(false);
    installPromptRef.current = null;
  }

  // ── Congregation Intelligence State ─────────────────────────────────────
  const [congregationProfile, setCongregationProfile] = useState(
    profile?.congregation_profile || null
  );
  const [congregationEnabled, setCongregationEnabled] = useState(true);

  useEffect(function() {
    if (profile?.congregation_profile) {
      setCongregationProfile(profile.congregation_profile);
    }
  }, [profile]);

  function handleVoiceConfirm(profile) {
    setVoiceProfile(profile);
    setShowVoiceModal(false);
    if (pendingGenerateRef.current) {
      pendingGenerateRef.current();
      pendingGenerateRef.current = null;
    }
  }

  function handleVoiceSkip() {
    setShowVoiceModal(false);
    if (pendingGenerateRef.current) {
      pendingGenerateRef.current();
      pendingGenerateRef.current = null;
    }
  }

  function requestVoiceProfile(afterCallback) {
    if (voiceProfile && voiceProfile.confirmed) {
      afterCallback();
    } else {
      pendingGenerateRef.current = afterCallback;
      setShowVoiceModal(true);
    }
  }
  // ─────────────────────────────────────────────────────────────────────────

  const isAdmin = profile?.role === "admin" || !profile?.church_id;

  // Trial enforcement — if trial_ends_at exists and has passed, downgrade to free
  var effectivePlan = profile?.plan || "free";
  if (profile?.trial_ends_at) {
    var trialEnd = new Date(profile.trial_ends_at);
    if (new Date() > trialEnd && effectivePlan === "trial") {
      effectivePlan = "free";
    }
  }

  // Trial banner state — show if on trial with days remaining
  var trialDaysLeft = null;
  if (profile?.trial_ends_at && effectivePlan !== "free") {
    var daysLeft = Math.ceil((new Date(profile.trial_ends_at) - new Date()) / (1000 * 60 * 60 * 24));
    if (daysLeft > 0 && daysLeft <= 14) trialDaysLeft = daysLeft;
  }

  const currentUser = {
    id: user?.id || "",
    name: profile?.full_name || user?.user_metadata?.full_name || user?.email || "Pastor",
    role: profile?.title ? profile.title : "Pastor",
    email: user?.email || "",
    church: church?.name || SEED_CHURCH.name,
    branch: "Main Campus",
    isAdmin: isAdmin,
    plan: effectivePlan,
    trialDaysLeft: trialDaysLeft,
    churchId: profile?.church_id || null,
    language: profile?.language || "en",
  };

  CURRENT_USER.id = currentUser.id;
  CURRENT_USER.email = currentUser.email;
  CURRENT_USER.name = currentUser.name;
  CURRENT_USER.plan = currentUser.plan;

  const handleLanguageChange = useCallback(async function(newLang) {
    setLanguage(newLang);
    try {
      const { supabase } = await import("./lib/supabase");
      await supabase.from("users").update({ language: newLang }).eq("id", user.id);
    } catch (e) {}
  }, [user]);

  var initials = currentUser.name.split(" ").map(function(n) { return n[0]; }).join("").slice(0, 2).toUpperCase();

  useEffect(function() { pingAPIs(); }, []);

  useEffect(function() {
    if (pendingInvitation) { setShowInvitationPrompt(true); }
  }, [pendingInvitation]);

  useEffect(function() {
    if (!user) return;
    import("./lib/db").then(function({ fetchSermons }) {
      fetchSermons(user.id)
        .then(function(data) {
          setLibrary(data);
          if (data.length > 0) {
            var maxId = Math.max.apply(null, data.map(function(s) { return s.id || 0; }));
            libCounter.current = maxId;
          }
          var stored = localStorage.getItem("sermon_library");
          if (stored) {
            try {
              var local = JSON.parse(stored);
              if (local && local.length > 0) { setLocalSermons(local); setShowMigrationPrompt(true); }
            } catch (e) {}
          }
        })
        .catch(function() {
          var stored = localStorage.getItem("sermon_library");
          if (stored) { try { setLibrary(JSON.parse(stored)); } catch (e) {} }
        })
        .finally(function() { setLibraryLoading(false); });
    });
  }, [user]);

  async function handleAcceptInvitation() {
    if (!pendingInvitation) return;
    setInvitationLoading(true);
    try {
      const { acceptInvitation } = await import("./lib/db");
      await acceptInvitation(pendingInvitation.id, user.id, pendingInvitation.church_id);
      setShowInvitationPrompt(false);
      onInvitationHandled();
    } catch (e) { setShowInvitationPrompt(false); } finally { setInvitationLoading(false); }
  }

  async function handleDeclineInvitation() {
    if (!pendingInvitation) return;
    setInvitationLoading(true);
    try {
      const { declineInvitation } = await import("./lib/db");
      await declineInvitation(pendingInvitation.id);
      setShowInvitationPrompt(false);
      onInvitationHandled();
    } catch (e) { setShowInvitationPrompt(false); } finally { setInvitationLoading(false); }
  }

  async function handleMigrateSermons() {
    setMigrating(true);
    try {
      const { insertSermon } = await import("./lib/db");
      var migrated = [];
      for (var i = 0; i < localSermons.length; i++) {
        try {
          var saved = await insertSermon(user.id, localSermons[i]);
          migrated.push(Object.assign({}, localSermons[i], { id: saved.id, savedAt: new Date(saved.saved_at).toLocaleDateString() }));
        } catch (e) {}
      }
      setLibrary(function(prev) { return [...migrated, ...prev]; });
      localStorage.removeItem("sermon_library");
      setShowMigrationPrompt(false);
      setLocalSermons([]);
    } catch (e) { setShowMigrationPrompt(false); } finally { setMigrating(false); }
  }

  function handleSkipMigration() { localStorage.removeItem("sermon_library"); setShowMigrationPrompt(false); setLocalSermons([]); }

  const handleSaveToLibrary = useCallback(function(sermon) {
    var sermonWithStatus = Object.assign({ status: "draft" }, sermon);
    import("./lib/db").then(function({ insertSermon }) {
      insertSermon(user.id, sermonWithStatus)
        .then(function(saved) {
          var newItem = Object.assign({}, sermonWithStatus, { id: saved.id, savedAt: new Date(saved.saved_at).toLocaleDateString() });
          setLibrary(function(prev) { return [newItem, ...prev]; });
        })
        .catch(function() {
          libCounter.current += 1;
          var newItem = Object.assign({}, { tags: [], sourceTool: "", sourceTopic: "", seriesId: null, seriesTitle: null, seriesWeek: null, status: "draft" }, sermonWithStatus, { id: libCounter.current, savedAt: sermon.savedAt || new Date().toLocaleDateString() });
          setLibrary(function(prev) { return [newItem, ...prev]; });
        });
    });
  }, [user]);

  const handleDeleteFromLibrary = useCallback(function(id) {
    import("./lib/db").then(function({ deleteSermon }) { deleteSermon(id).catch(function() {}); });
    setLibrary(function(prev) { return prev.filter(function(s) { return s.id !== id; }); });
  }, []);

  const handleUpdateLibraryItem = useCallback(function(id, updates) {
    import("./lib/db").then(function({ updateSermon }) { updateSermon(id, updates).catch(function() {}); });
    setLibrary(function(prev) { return prev.map(function(item) { if (item.id !== id) return item; return Object.assign({}, item, updates); }); });
  }, []);

  const handleDuplicateLibraryItem = useCallback(function(sermon) {
    var duplicate = Object.assign({}, sermon, { id: null, title: (sermon.title || "Untitled Sermon") + " (Copy)", savedAt: new Date().toLocaleDateString() });
    handleSaveToLibrary(duplicate);
  }, [handleSaveToLibrary]);

  const handleModeSwitch = useCallback(function(mode) {
    sessionStorage.setItem("scp_viewmode", mode);
    setViewMode(mode);
    setCurrentScreen(mode === "pastor" ? "dashboard" : "church-overview");
  }, []);

  const handleSignOut = useCallback(function() {
    sessionStorage.removeItem("scp_screen");
    sessionStorage.removeItem("scp_viewmode");
    import("./lib/auth").then(function({ signOut }) {
      signOut().then(function() { onSignOut(); }).catch(function() { onSignOut(); });
    });
  }, [onSignOut]);

  var pageTitle = useMemo(function() {
    var allNav = PASTOR_NAV.concat(ADMIN_NAV);
    var found = allNav.find(function(n) { return n.id === currentScreen; });
    return found ? found.label : "Dashboard";
  }, [currentScreen]);

  const isMobile = useIsMobile();
  const [showMoreDrawer, setShowMoreDrawer] = useState(false);

  function handleMobileTab(id) {
    if (id === "more") {
      setShowMoreDrawer(function(v) { return !v; });
    } else {
      setShowMoreDrawer(false);
      setCurrentScreen(id);
    }
  }

  function renderScreen() {
    switch (currentScreen) {
      case "dashboard":
        return <DashboardScreen user={currentUser} library={library} setCurrentScreen={setCurrentScreen} language={language} onLanguageChange={handleLanguageChange} onUpdateStatus={handleUpdateLibraryItem} setForgePrefill={setForgePrefill} />;
      case "ai-pastor":
        return canAccess(currentUser.plan || "free", "aiPastor")
          ? <AIPastorScreen language={language} voiceProfile={voiceProfile} onRequestVoiceProfile={requestVoiceProfile} congregationProfile={congregationEnabled ? congregationProfile : null} congregationEnabled={congregationEnabled} onToggleCongregation={function() { setCongregationEnabled(function(v) { return !v; }); }} />
          : <PlanGate feature="aiPastor" onUpgrade={function() { setShowGlobalUpgradeModal(true); }} />;
      case "topic-engine":
        return <TopicEngineScreen setForgePrefill={setForgePrefill} setCurrentScreen={setCurrentScreen} language={language} voiceProfile={voiceProfile} onRequestVoiceProfile={requestVoiceProfile} congregationProfile={congregationEnabled ? congregationProfile : null} congregationEnabled={congregationEnabled} onToggleCongregation={function() { setCongregationEnabled(function(v) { return !v; }); }} />;
      case "sermon-forge":
        return <SermonForgeScreen onSave={handleSaveToLibrary} prefill={forgePrefill} language={language} voiceProfile={voiceProfile} onRequestVoiceProfile={requestVoiceProfile} currentUser={currentUser} congregationProfile={congregationEnabled ? congregationProfile : null} congregationEnabled={congregationEnabled} onToggleCongregation={function() { setCongregationEnabled(function(v) { return !v; }); }} onMultiply={function(data) { setMultiplyPrefill(data); setCurrentScreen("content-multiplier"); }} />;
      case "sermon-drop":
        return <SermonDropScreen currentUser={currentUser} language={language} />;
      case "content-multiplier":
        return canAccess(currentUser.plan || "free", "contentMultiplier")
          ? <ContentMultiplierScreen language={language} prefill={multiplyPrefill} voiceProfile={voiceProfile} onRequestVoiceProfile={requestVoiceProfile} congregationProfile={congregationEnabled ? congregationProfile : null} congregationEnabled={congregationEnabled} onToggleCongregation={function() { setCongregationEnabled(function(v) { return !v; }); }} />
          : <PlanGate feature="contentMultiplier" onUpgrade={function() { setShowGlobalUpgradeModal(true); }} />;
      case "word-study":
        return canAccess(currentUser.plan || "free", "wordStudy")
          ? <WordStudyScreen setForgePrefill={setForgePrefill} setCurrentScreen={setCurrentScreen} language={language} voiceProfile={voiceProfile} onRequestVoiceProfile={requestVoiceProfile} congregationProfile={congregationEnabled ? congregationProfile : null} congregationEnabled={congregationEnabled} onToggleCongregation={function() { setCongregationEnabled(function(v) { return !v; }); }} />
          : <PlanGate feature="wordStudy" onUpgrade={function() { setShowGlobalUpgradeModal(true); }} />;
      case "illustrations":
        return canAccess(currentUser.plan || "free", "illustrations")
          ? <IllustrationsScreen language={language} voiceProfile={voiceProfile} onRequestVoiceProfile={requestVoiceProfile} congregationProfile={congregationEnabled ? congregationProfile : null} congregationEnabled={congregationEnabled} onToggleCongregation={function() { setCongregationEnabled(function(v) { return !v; }); }} setForgePrefill={setForgePrefill} setCurrentScreen={setCurrentScreen} />
          : <PlanGate feature="illustrations" onUpgrade={function() { setShowGlobalUpgradeModal(true); }} />;
      case "library":
        return <LibraryScreen library={library} onDelete={handleDeleteFromLibrary} onUpdate={handleUpdateLibraryItem} onDuplicate={handleDuplicateLibraryItem} currentUser={currentUser} />;
      case "congregation":
        return <CongregationProfileScreen user={user} profile={congregationProfile} onProfileSaved={function(p) { setCongregationProfile(p); }} />;
      case "planning-center":
        return canAccess(currentUser.plan || "free", "planningCenterIntegration")
          ? <PlanningCenterScreen user={user} setForgePrefill={setForgePrefill} setCurrentScreen={setCurrentScreen} setCongregationProfile={setCongregationProfile} />
          : <PlanGate feature="planningCenterIntegration" onUpgrade={function() { setShowGlobalUpgradeModal(true); }} />;
      case "team-scheduler":
        return canAccess(currentUser.plan || "free", "teamScheduler")
          ? <TeamSchedulerScreen user={user} />
          : <PlanGate feature="teamScheduler" onUpgrade={function() { setShowGlobalUpgradeModal(true); }} />;
      case "referrals":
        return <ReferralsScreen user={user} currentUser={currentUser} />;
      case "series-planner":
        return canAccess(currentUser.plan || "free", "seriesPlanner")
          ? <SeriesPlannerScreen onSaveSeries={handleSaveToLibrary} setForgePrefill={setForgePrefill} setCurrentScreen={setCurrentScreen} language={language} voiceProfile={voiceProfile} onRequestVoiceProfile={requestVoiceProfile} congregationProfile={congregationEnabled ? congregationProfile : null} congregationEnabled={congregationEnabled} onToggleCongregation={function() { setCongregationEnabled(function(v) { return !v; }); }} />
          : <PlanGate feature="seriesPlanner" onUpgrade={function() { setShowGlobalUpgradeModal(true); }} />;
      case "delivery-coach":
        return canAccess(currentUser.plan || "free", "deliveryCoach")
          ? <SermonDeliveryCoachScreen currentUser={currentUser} />
          : <PlanGate feature="deliveryCoach" onUpgrade={function() { setShowGlobalUpgradeModal(true); }} />;
      case "bible-commentary":
        return canAccess(currentUser.plan || "free", "bibleCommentary")
          ? <BibleCommentaryScreen language={language} voiceProfile={voiceProfile} congregationProfile={congregationEnabled ? congregationProfile : null} />
          : <PlanGate feature="bibleCommentary" onUpgrade={function() { setShowGlobalUpgradeModal(true); }} />;
      case "sermon-calendar":
        return <SermonCalendarScreen user={user} library={library} setForgePrefill={setForgePrefill} setCurrentScreen={setCurrentScreen} />;
      case "service-order":
        return canAccess(currentUser.plan || "free", "serviceOrderBuilder")
          ? <ServiceOrderScreen user={user} library={library} setForgePrefill={setForgePrefill} setCurrentScreen={setCurrentScreen} language={language} voiceProfile={voiceProfile} congregationProfile={congregationProfile} congregationEnabled={congregationEnabled} />
          : <PlanGate feature="serviceOrderBuilder" onUpgrade={function() { setShowGlobalUpgradeModal(true); }} />;
      case "sermon-analytics":
        return canAccess(currentUser.plan || "free", "sermonAnalytics")
          ? <SermonAnalyticsScreen library={library} user={user} />
          : <PlanGate feature="sermonAnalytics" onUpgrade={function() { setShowGlobalUpgradeModal(true); }} />;
      case "email-devotional":
        return canAccess(currentUser.plan || "free", "emailDevotional")
          ? <EmailDevotionalScreen currentUser={currentUser} library={library} />
          : <PlanGate feature="emailDevotional" onUpgrade={function() { setShowGlobalUpgradeModal(true); }} />;
      case "support":
        return <SupportScreen user={currentUser} />;
      case "command-center":
        return <CommandCenterScreen user={currentUser} />;
      case "prayer-requests":
        return <PrayerRequestsScreen church={church} user={currentUser} />;
      case "attendance":
        return <AttendanceScreen church={church} />;
      case "pastor-performance":
        return <PastorPerformanceScreen church={church} />;
      case "church-overview":
        return <ChurchOverviewScreen church={church} user={currentUser} />;
      case "branches":
        return <BranchesScreen church={church} />;
      case "pastor-accounts":
        return <PastorAccountsScreen church={church} user={currentUser} />;
      case "activity":
        return <ActivityScreen church={church} />;
      case "all-sermons":
        return <AllSermonsScreen church={church} />;
      case "church-settings":
        return <ChurchSettingsScreen church={church} user={currentUser} onChurchUpdate={onChurchUpdate} />;
      default:
        return <DashboardScreen user={currentUser} library={library} setCurrentScreen={setCurrentScreen} />;
    }
  }

  return (
    <div style={Object.assign({}, styles.page, isMobile ? { flexDirection: "column", height: "100dvh" } : {})}>

      {/* Onboarding Wizard */}
      {showOnboarding && (
        <OnboardingWizard user={user} profile={profile} onComplete={handleOnboardingComplete} />
      )}

      {/* Modals */}
      {showInvitationPrompt && pendingInvitation && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }}>
          <div style={{ background: "#fff", borderRadius: 16, padding: "32px 36px", width: "90%", maxWidth: 460, boxShadow: "0 8px 40px rgba(0,0,0,0.25)", fontFamily: "'Georgia', serif" }}>
            <div style={{ fontWeight: 700, fontSize: 18, color: CHARCOAL, marginBottom: 10 }}>You've been invited to join a church</div>
            <div style={{ fontSize: 14, color: STONE, lineHeight: 1.7, marginBottom: 8 }}><strong style={{ color: CHARCOAL }}>{pendingInvitation.churches?.name || "A church"}</strong>{pendingInvitation.churches?.denomination ? " · " + pendingInvitation.churches.denomination : ""}{pendingInvitation.churches?.city ? " · " + pendingInvitation.churches.city : ""}</div>
            <div style={{ fontSize: 14, color: STONE, lineHeight: 1.7, marginBottom: 24 }}>Would you like to join this church and connect your account?</div>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button onClick={handleDeclineInvitation} disabled={invitationLoading} style={{ padding: "10px 18px", borderRadius: 8, border: "1px solid " + BORDER, background: "#fff", color: STONE, cursor: "pointer", fontSize: 13, fontFamily: "'Georgia', serif", fontWeight: 700 }}>Decline</button>
              <button onClick={handleAcceptInvitation} disabled={invitationLoading} style={{ padding: "10px 18px", borderRadius: 8, border: "none", background: GOLD, color: "#fff", cursor: invitationLoading ? "not-allowed" : "pointer", fontSize: 13, fontFamily: "'Georgia', serif", fontWeight: 700, opacity: invitationLoading ? 0.7 : 1 }}>{invitationLoading ? "Joining..." : "Join Church"}</button>
            </div>
          </div>
        </div>
      )}

      {showMigrationPrompt && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9998 }}>
          <div style={{ background: "#fff", borderRadius: 16, padding: "32px 36px", width: "90%", maxWidth: 460, boxShadow: "0 8px 40px rgba(0,0,0,0.25)", fontFamily: "'Georgia', serif" }}>
            <div style={{ fontWeight: 700, fontSize: 18, color: CHARCOAL, marginBottom: 10 }}>You have {localSermons.length} sermon{localSermons.length !== 1 ? "s" : ""} saved locally</div>
            <div style={{ fontSize: 14, color: STONE, lineHeight: 1.7, marginBottom: 24 }}>Would you like to migrate your locally saved sermons to the cloud?</div>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button onClick={handleSkipMigration} disabled={migrating} style={{ padding: "10px 18px", borderRadius: 8, border: "1px solid " + BORDER, background: "#fff", color: STONE, cursor: "pointer", fontSize: 13, fontFamily: "'Georgia', serif", fontWeight: 700 }}>No thanks</button>
              <button onClick={handleMigrateSermons} disabled={migrating} style={{ padding: "10px 18px", borderRadius: 8, border: "none", background: GOLD, color: "#fff", cursor: migrating ? "not-allowed" : "pointer", fontSize: 13, fontFamily: "'Georgia', serif", fontWeight: 700, opacity: migrating ? 0.7 : 1 }}>{migrating ? "Migrating..." : "Yes, migrate to cloud"}</button>
            </div>
          </div>
        </div>
      )}

      {showVoiceModal && (
        <VoiceProfileModal existing={voiceProfile} onConfirm={handleVoiceConfirm} onSkip={handleVoiceSkip} />
      )}

      {showGlobalUpgradeModal && (
        <UpgradeModal user={user} profile={profile} onClose={function() { setShowGlobalUpgradeModal(false); }} />
      )}

      {/* More drawer on mobile */}
      {isMobile && showMoreDrawer && (
        <div style={{ position: "fixed", inset: 0, zIndex: 500 }} onClick={function() { setShowMoreDrawer(false); }}>
          <div style={{ position: "absolute", bottom: 64, left: 0, right: 0, background: WARM_WHITE, borderTop: "1px solid " + BORDER, padding: "12px 0", boxShadow: "0 -4px 20px rgba(44,36,22,0.12)" }} onClick={function(e) { e.stopPropagation(); }}>
            {PASTOR_NAV.filter(function(n) { return !MOBILE_TABS.find(function(t) { return t.id === n.id; }); }).map(function(item) {
              return (
                <div key={item.id} onClick={function() { setCurrentScreen(item.id); setShowMoreDrawer(false); }} style={{ padding: "14px 24px", fontSize: 15, color: currentScreen === item.id ? GOLD : CHARCOAL, fontWeight: currentScreen === item.id ? 700 : 400, fontFamily: "'Georgia', serif", cursor: "pointer", borderBottom: "1px solid " + BORDER }}>
                  {item.icon} {item.label}
                </div>
              );
            })}
            <div onClick={handleSignOut} style={{ padding: "14px 24px", fontSize: 15, color: STONE, fontFamily: "'Georgia', serif", cursor: "pointer" }}>Sign Out</div>
          </div>
        </div>
      )}

      {/* ── DESKTOP SIDEBAR ── */}
      {!isMobile && (
        <div style={styles.sidebar}>
          <div style={styles.sidebarHeader}>
            <a href="https://sermoncraftpro.com" style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10, textDecoration: "none", cursor: "pointer" }}>
              <div style={{ fontSize: 22, fontWeight: 900, color: GOLD }}>✝</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: CHARCOAL, letterSpacing: "0.04em", fontFamily: FONT_BODY, whiteSpace: "nowrap" }}>
                <span style={{ fontWeight: 900 }}>S</span>ermon<span style={{ fontWeight: 900 }}>C</span>raft <span style={{ fontWeight: 900 }}>P</span>ro
              </div>
            </a>
            <div style={{ fontSize: 11, color: STONE_LIGHT, fontFamily: FONT_BODY }}>{currentUser.church}</div>
          </div>
          <div style={{ padding: "12px 12px 0" }}>
            <div style={{ display: "flex", gap: 3, backgroundColor: CREAM, borderRadius: 8, padding: 3, border: "1px solid " + BORDER }}>
              {["pastor", "admin"].map(function(mode) {
                return (
                  <button key={mode} onClick={function() { handleModeSwitch(mode); }} style={{ flex: 1, padding: "7px 0", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", fontFamily: FONT_BODY, backgroundColor: viewMode === mode ? GOLD : "transparent", color: viewMode === mode ? "#fff" : STONE, transition: "all 0.15s" }}>
                    {mode === "pastor" ? "Pastor" : "Admin"}
                  </button>
                );
              })}
            </div>
          </div>
          <div style={styles.navSection}>
            {/* Dashboard pinned at top */}
            <NavItem
              item={{ id: "dashboard", label: "Dashboard", icon: "" }}
              active={currentScreen === "dashboard"}
              onClick={setCurrentScreen}
            />
            <div style={{ height: 1, background: BORDER, margin: "6px 12px" }} />
            {viewMode === "pastor"
              ? <GroupedNav groups={PASTOR_NAV_GROUPS} nav={PASTOR_NAV} activeScreen={currentScreen} onNavigate={setCurrentScreen} />
              : <GroupedNav groups={ADMIN_NAV_GROUPS} nav={ADMIN_NAV} activeScreen={currentScreen} onNavigate={setCurrentScreen} />
            }
          </div>
          <div style={{ marginTop: "auto", padding: "16px", borderTop: "1px solid " + BORDER }}>
            {currentUser.plan !== "bible_college" && (
              <button
                onClick={function() { setShowGlobalUpgradeModal(true); }}
                style={{ width: "100%", padding: "10px", background: GOLD, border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, color: "#fff", cursor: "pointer", fontFamily: FONT_BODY, marginBottom: 8 }}
              >
                {currentUser.plan === "free" ? "Upgrade to Student" : currentUser.plan === "church" ? "Upgrade to Bible College" : "Upgrade Plan"}
              </button>
            )}
            {currentUser.plan !== "free" && (
              <button
                onClick={function() { setShowGlobalUpgradeModal(true); }}
                style={{ width: "100%", padding: "8px", background: "transparent", border: "1px solid " + BORDER, borderRadius: 8, fontSize: 12, color: STONE, cursor: "pointer", fontFamily: FONT_BODY, marginBottom: 8 }}
              >
                Manage Subscription
              </button>
            )}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <div style={styles.avatar}>{initials}</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: CHARCOAL, fontFamily: FONT_BODY }}>{currentUser.name}</div>
                <div style={{ fontSize: 11, color: STONE_LIGHT, fontFamily: FONT_BODY }}>{currentUser.role}</div>
              </div>
            </div>
            <button onClick={handleSignOut} style={{ width: "100%", padding: "8px", background: "transparent", border: "1px solid " + BORDER, borderRadius: 6, fontSize: 12, color: STONE, cursor: "pointer", fontFamily: FONT_BODY }}>Sign Out</button>
          </div>
        </div>
      )}

      {/* ── MAIN CONTENT ── */}
      <div style={Object.assign({}, styles.mainContent, isMobile ? { paddingBottom: 64 } : {})}>

        {/* Trial countdown banner */}
        {currentUser.trialDaysLeft !== null && (
          <div style={{ background: currentUser.trialDaysLeft <= 3 ? "#C0392B" : CHARCOAL, padding: "8px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <div style={{ fontSize: 13, color: "#fff", fontFamily: FONT_BODY }}>
              <strong>⏱ {currentUser.trialDaysLeft} day{currentUser.trialDaysLeft !== 1 ? "s" : ""} left on your free trial.</strong>
              {" "}Subscribe now to keep access to all your sermons and tools.
            </div>
            <button onClick={function() { setShowGlobalUpgradeModal(true); }} style={{ padding: "5px 16px", borderRadius: 6, border: "none", background: GOLD, color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: FONT_BODY, whiteSpace: "nowrap", flexShrink: 0 }}>
              Subscribe Now
            </button>
          </div>
        )}

        {/* PWA Install Banner */}
        {showInstallPrompt && isMobile && (
          <div style={{ background: GOLD, padding: "10px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#fff", fontFamily: FONT_BODY }}>✝ Add SermonCraft Pro to your home screen</div>
            <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
              <button onClick={handleInstallApp} style={{ padding: "5px 12px", borderRadius: 6, border: "none", background: "#fff", color: GOLD, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: FONT_BODY }}>Install</button>
              <button onClick={function() { setShowInstallPrompt(false); }} style={{ padding: "5px 10px", borderRadius: 6, border: "none", background: "rgba(255,255,255,0.2)", color: "#fff", fontSize: 12, cursor: "pointer", fontFamily: FONT_BODY }}>✕</button>
            </div>
          </div>
        )}

        {/* Top bar */}
        <div style={Object.assign({}, styles.topBar, isMobile ? { padding: "10px 16px" } : {})}>
          {isMobile ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 18, color: GOLD }}>✝</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: CHARCOAL, fontFamily: "'Georgia', serif" }}>{pageTitle}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <button onClick={function() { setShowVoiceModal(true); }} style={{ padding: "5px 10px", border: "1.5px solid " + (voiceProfile?.confirmed ? GOLD : BORDER), borderRadius: 16, background: voiceProfile?.confirmed ? GOLD_PALE : IVORY, color: voiceProfile?.confirmed ? GOLD : STONE, fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "'Georgia', serif" }}>
                  {voiceProfile?.confirmed ? "✓ " + voiceProfile.doctrine.split(" /")[0] : "Voice"}
                </button>
                <div style={Object.assign({}, styles.avatar, { width: 32, height: 32, fontSize: 13 })}>{initials}</div>
              </div>
            </div>
          ) : (
            <>
              <div style={styles.pageTitle}>{pageTitle}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <button onClick={function() { setShowVoiceModal(true); }} style={{ padding: "6px 14px", border: "1.5px solid " + (voiceProfile?.confirmed ? GOLD : BORDER), borderRadius: 20, background: voiceProfile?.confirmed ? GOLD_PALE : IVORY, color: voiceProfile?.confirmed ? GOLD : STONE, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: FONT_BODY, transition: "all 0.15s", whiteSpace: "nowrap" }}>
                  {voiceProfile?.confirmed ? "✓ " + voiceProfile.doctrine.split(" /")[0] : "Set Voice Profile"}
                </button>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: STONE_LIGHT, textTransform: "uppercase", letterSpacing: "0.06em", fontFamily: FONT_BODY }}>Lang</span>
                  <select value={language} onChange={function(e) { handleLanguageChange(e.target.value); }} style={{ padding: "4px 8px", border: "1px solid " + BORDER, borderRadius: 6, backgroundColor: IVORY, fontSize: 12, color: CHARCOAL, fontFamily: FONT_BODY, outline: "none", cursor: "pointer" }}>
                    {LANGUAGES.map(function(lang) { return <option key={lang.code} value={lang.code}>{lang.nativeLabel}</option>; })}
                  </select>
                </div>
                <div style={styles.userBadge}>
                  <div style={styles.avatar}>{initials}</div>
                  <span style={{ fontFamily: FONT_BODY }}>{currentUser.church}</span>
                  {currentUser.isAdmin && <span style={Object.assign({}, styles.tag, styles.tagGold)}>Admin</span>}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Screen content */}
        <div style={Object.assign({}, styles.scrollArea, isMobile ? { padding: "16px 16px 80px" } : {})}>
          {libraryLoading
            ? <div style={{ padding: 40, textAlign: "center", color: STONE_LIGHT, fontStyle: "italic" }}>Loading your sermons...</div>
            : renderScreen()
          }
        </div>
      </div>

      {/* ── MOBILE BOTTOM TABS ── */}
      {isMobile && (
        <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, height: 64, backgroundColor: WARM_WHITE, borderTop: "1px solid " + BORDER, display: "flex", alignItems: "stretch", zIndex: 400, boxShadow: "0 -2px 12px rgba(44,36,22,0.08)" }}>
          {MOBILE_TABS.map(function(tab) {
            var isActive = tab.id === "more" ? showMoreDrawer : currentScreen === tab.id;
            return (
              <button
                key={tab.id}
                onClick={function() { handleMobileTab(tab.id); }}
                style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 3, border: "none", background: "transparent", cursor: "pointer", padding: "6px 0", borderTop: isActive ? "2px solid " + GOLD : "2px solid transparent" }}
              >
                <span style={{ fontSize: tab.id === "ai-pastor" ? 18 : 16, color: isActive ? GOLD : STONE_LIGHT }}>{tab.icon}</span>
                <span style={{ fontSize: 10, fontWeight: isActive ? 700 : 400, color: isActive ? GOLD : STONE_LIGHT, fontFamily: "'Georgia', serif", letterSpacing: "0.02em" }}>{tab.label}</span>
              </button>
            );
          })}
        </div>
      )}

      <PoroAIWidget />
    </div>
  );
}
