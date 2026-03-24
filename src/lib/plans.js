export const PLAN_LIMITS = {
  free: {
    name: "Free",
    fast: 25,
    deep: 0,
    saveLibrary: false,
    seriesPlanner: false,
    teamSeats: 1,
  },
  starter: {
    name: "Starter",
    fast: 200,
    deep: 40,
    saveLibrary: true,
    seriesPlanner: false,
    teamSeats: 1,
  },
  growth: {
    name: "Growth",
    fast: 600,
    deep: 150,
    saveLibrary: true,
    seriesPlanner: true,
    teamSeats: 3,
  },
  pro: {
    name: "Pro",
    fast: 1500,
    deep: 400,
    saveLibrary: true,
    seriesPlanner: true,
    teamSeats: 5,
  },
};

export function getPlanLimits(planName) {
  return PLAN_LIMITS[planName] || PLAN_LIMITS.free;
}