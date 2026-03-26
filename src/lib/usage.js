import { getPlanLimits } from "./plans";

const STORAGE_KEY = "sermoncraft_usage";

function getMonthKey() {
  var now = new Date();
  return now.getFullYear() + "-" + (now.getMonth() + 1);
}

export function loadUsage() {
  try {
    var raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { fast_used: 0, deep_used: 0, month: getMonthKey() };
    var parsed = JSON.parse(raw);
    if (parsed.month !== getMonthKey()) {
      return { fast_used: 0, deep_used: 0, month: getMonthKey() };
    }
    return parsed;
  } catch (e) {
    return { fast_used: 0, deep_used: 0, month: getMonthKey() };
  }
}

export function saveUsage(usage) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Object.assign({}, usage, { month: getMonthKey() })));
  } catch (e) {}
}

export function incrementUsage(mode) {
  var usage = loadUsage();
  if (mode === "deep") {
    usage.deep_used = (usage.deep_used || 0) + 1;
  } else {
    usage.fast_used = (usage.fast_used || 0) + 1;
  }
  saveUsage(usage);
  return usage;
}

export function canUseTool(planName, usage, mode) {
  const limits = getPlanLimits(planName);
  const safeUsage = {
    fast_used: usage?.fast_used || 0,
    deep_used: usage?.deep_used || 0,
  };

  if (mode === "deep") {
    if (limits.deep <= 0) {
      return {
        ok: false,
        reason: "upgrade_required",
        message: "Your current plan does not include deep mode.",
      };
    }
    if (safeUsage.deep_used >= limits.deep) {
      return {
        ok: false,
        reason: "limit_reached",
        message: "You have reached your monthly deep usage limit.",
      };
    }
  }

  if (mode === "fast") {
    if (safeUsage.fast_used >= limits.fast) {
      return {
        ok: false,
        reason: "limit_reached",
        message: "You have reached your monthly fast usage limit.",
      };
    }
  }

  return {
    ok: true,
    reason: null,
    message: "",
  };
}