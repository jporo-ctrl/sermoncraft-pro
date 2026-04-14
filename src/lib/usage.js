// src/lib/usage.js — Per-tool usage tracking with monthly reset
// All usage stored in localStorage, keyed by month so it resets automatically

import { getPlanLimits, checkToolLimit } from "./plans";

const STORAGE_KEY = "scp_usage_v2";

// Tool name → plans.js limit key mapping
const TOOL_LIMIT_KEYS = {
  fast: "fast",
  deep: "deep",
  topicEngine: "topicEngine",
  wordStudy: "wordStudy",
  illustrations: "illustrations",
  bibleCommentary: "bibleCommentary",
  seriesPlanner: "seriesPlanner",
};

function getMonthKey() {
  var now = new Date();
  return now.getFullYear() + "-" + String(now.getMonth() + 1).padStart(2, "0");
}

export function loadUsage() {
  try {
    var raw = localStorage.getItem(STORAGE_KEY);
    var data = raw ? JSON.parse(raw) : {};
    var currentMonth = getMonthKey();

    // Auto-reset if month has changed
    if (data.month !== currentMonth) {
      data = { month: currentMonth };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }

    return {
      month: data.month,
      fast_used: data.fast || 0,
      deep_used: data.deep || 0,
      topicEngine_used: data.topicEngine || 0,
      wordStudy_used: data.wordStudy || 0,
      illustrations_used: data.illustrations || 0,
      bibleCommentary_used: data.bibleCommentary || 0,
      seriesPlanner_used: data.seriesPlanner || 0,
    };
  } catch (e) {
    return { month: getMonthKey(), fast_used: 0, deep_used: 0 };
  }
}

export function incrementUsage(tool) {
  try {
    var raw = localStorage.getItem(STORAGE_KEY);
    var data = raw ? JSON.parse(raw) : {};
    var currentMonth = getMonthKey();

    if (data.month !== currentMonth) {
      data = { month: currentMonth };
    }

    var key = TOOL_LIMIT_KEYS[tool] || tool;
    data[key] = (data[key] || 0) + 1;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn("Could not increment usage:", e);
  }
}

// Check if a generation is allowed — fast/deep mode check
export function canUseTool(plan, usage, mode) {
  var limits = getPlanLimits(plan);

  if (mode === "deep") {
    if (!limits.deepMode) {
      return { ok: false, message: "Deep mode requires a paid plan. Upgrade to unlock deep generation." };
    }
    if (limits.deep < 999999 && (usage.deep_used || 0) >= limits.deep) {
      return { ok: false, message: "You've used all " + limits.deep + " deep generations this month. Upgrade for more." };
    }
  } else {
    if (limits.fast < 999999 && (usage.fast_used || 0) >= limits.fast) {
      return { ok: false, message: "You've used all " + limits.fast + " fast generations this month. Upgrade your plan for more." };
    }
  }

  return { ok: true };
}

// Check a specific per-tool limit
export function canUseToolFeature(plan, toolKey, usedCount) {
  var result = checkToolLimit(plan, toolKey, usedCount);
  return result;
}

// Get remaining for a tool
export function getRemaining(plan, toolKey, usedCount) {
  var limits = getPlanLimits(plan);
  var limit = limits[toolKey];
  if (!limit || limit >= 999999) return Infinity;
  return Math.max(0, limit - usedCount);
}
