import { getPlanLimits } from "./plans";

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