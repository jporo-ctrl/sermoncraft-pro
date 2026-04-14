// src/lib/plans.js — SermonCraft Pro plan limits

export const PLAN_LIMITS = {
  free: {
    fast:                     2,
    deep:                     0,
    deepMode:                 false,
    topicEngine:              0,
    wordStudy:                0,
    bibleCommentary:          0,
    illustrations:            0,
    seriesPlanner:            0,
    contentMultiplier:        0,
    serviceOrder:             0,
    serviceOrderBuilder:      false,
    emailDevotional:          false,
    sermonAnalytics:          false,
    attendanceTracking:       false,
    shareSermon:              false,
    congregationIntelligence: false,
    teamSeats:                1,
    teamScheduler:            false,
    aiPastor:                 false,
    deliveryCoach:            false,
    planningCenter:           false,
    planningCenterIntegration:false,
    sermonDrop:               false,
    library:                  false,
    exports:                  false,
    calendarOnly:             true,
  },

  student: {
    fast:                     15,
    deep:                     5,
    deepMode:                 true,
    topicEngine:              10,
    wordStudy:                10,
    bibleCommentary:          5,
    illustrations:            0,
    seriesPlanner:            0,
    contentMultiplier:        0,
    serviceOrder:             0,
    serviceOrderBuilder:      false,
    emailDevotional:          false,
    sermonAnalytics:          false,
    attendanceTracking:       false,
    shareSermon:              true,
    congregationIntelligence: false,
    teamSeats:                1,
    teamScheduler:            false,
    aiPastor:                 true,
    deliveryCoach:            false,
    planningCenter:           false,
    planningCenterIntegration:false,
    sermonDrop:               true,
    library:                  true,
    exports:                  true,
    calendarOnly:             false,
  },

  solo: {
    fast:                     30,
    deep:                     10,
    deepMode:                 true,
    topicEngine:              20,
    wordStudy:                15,
    bibleCommentary:          10,
    illustrations:            0,
    seriesPlanner:            0,
    contentMultiplier:        0,
    serviceOrder:             0,
    serviceOrderBuilder:      false,
    emailDevotional:          false,
    sermonAnalytics:          false,
    attendanceTracking:       false,
    shareSermon:              true,
    congregationIntelligence: false,
    teamSeats:                1,
    teamScheduler:            false,
    aiPastor:                 true,
    deliveryCoach:            false,
    planningCenter:           false,
    planningCenterIntegration:false,
    sermonDrop:               true,
    library:                  true,
    exports:                  true,
    calendarOnly:             false,
  },

  pastor: {
    fast:                     100,
    deep:                     40,
    deepMode:                 true,
    topicEngine:              60,
    wordStudy:                40,
    bibleCommentary:          30,
    illustrations:            30,
    seriesPlanner:            10,
    contentMultiplier:        5,
    serviceOrder:             3,
    serviceOrderBuilder:      true,
    emailDevotional:          true,
    sermonAnalytics:          true,
    attendanceTracking:       false,
    shareSermon:              true,
    congregationIntelligence: true,
    teamSeats:                3,
    teamScheduler:            true,
    aiPastor:                 true,
    deliveryCoach:            false,
    planningCenter:           false,
    planningCenterIntegration:false,
    sermonDrop:               true,
    library:                  true,
    exports:                  true,
    calendarOnly:             false,
  },

  church: {
    fast:                     300,
    deep:                     100,
    deepMode:                 true,
    topicEngine:              150,
    wordStudy:                100,
    bibleCommentary:          80,
    illustrations:            80,
    seriesPlanner:            20,
    contentMultiplier:        999999,
    serviceOrder:             10,
    serviceOrderBuilder:      true,
    emailDevotional:          true,
    sermonAnalytics:          true,
    attendanceTracking:       true,
    shareSermon:              true,
    congregationIntelligence: true,
    teamSeats:                5,
    teamScheduler:            true,
    aiPastor:                 true,
    deliveryCoach:            true,
    planningCenter:           true,
    planningCenterIntegration:true,
    sermonDrop:               true,
    library:                  true,
    exports:                  true,
    calendarOnly:             false,
  },

  bible_college: {
    fast:                     999999,
    deep:                     999999,
    deepMode:                 true,
    topicEngine:              999999,
    wordStudy:                999999,
    bibleCommentary:          999999,
    illustrations:            999999,
    seriesPlanner:            999999,
    contentMultiplier:        999999,
    serviceOrder:             999999,
    serviceOrderBuilder:      true,
    emailDevotional:          true,
    sermonAnalytics:          true,
    attendanceTracking:       true,
    shareSermon:              true,
    congregationIntelligence: true,
    teamSeats:                999999,
    teamScheduler:            true,
    aiPastor:                 true,
    deliveryCoach:            true,
    planningCenter:           true,
    planningCenterIntegration:true,
    sermonDrop:               true,
    library:                  true,
    exports:                  true,
    calendarOnly:             false,
    multiCampus:              true,
    dedicatedManager:         true,
  },
};

// Legacy aliases — keeps old plan keys in DB working during migration
PLAN_LIMITS.starter         = PLAN_LIMITS.solo;
PLAN_LIMITS.growth          = PLAN_LIMITS.pastor;
PLAN_LIMITS.pro             = PLAN_LIMITS.church;
PLAN_LIMITS.enterprise      = PLAN_LIMITS.bible_college;
PLAN_LIMITS.enterprise_plus = PLAN_LIMITS.bible_college;

export function getPlanLimits(plan) {
  return PLAN_LIMITS[plan] || PLAN_LIMITS["free"];
}

export function canAccess(plan, feature) {
  const limits = getPlanLimits(plan);
  const val = limits[feature];
  if (val === undefined) return false;
  if (typeof val === "boolean") return val;
  return val > 0;
}

export function getRemainingUsage(plan, feature, used) {
  const limits = getPlanLimits(plan);
  const limit = limits[feature];
  if (!limit || limit >= 999999) return Infinity;
  return Math.max(0, limit - (used || 0));
}

export function isUnlimited(plan, feature) {
  return getPlanLimits(plan)[feature] >= 999999;
}

export function checkToolLimit(plan, feature, used) {
  const limits = getPlanLimits(plan);
  const limit = limits[feature];
  if (limit === undefined || limit === 0 || limit === false) {
    return { ok: false, remaining: 0, unlimited: false, message: "This feature is not available on your current plan. Upgrade to unlock it." };
  }
  if (limit === true) return { ok: true, remaining: 999999, unlimited: true, message: "" };
  if (limit >= 999999) return { ok: true, remaining: 999999, unlimited: true, message: "" };
  const remaining = Math.max(0, limit - (used || 0));
  return {
    ok: remaining > 0,
    remaining,
    unlimited: false,
    message: remaining > 0 ? "" : "You've used all " + limit + " " + feature + " generations this month. Upgrade for more.",
  };
}
