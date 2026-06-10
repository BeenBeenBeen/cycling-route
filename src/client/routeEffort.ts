const DEFAULT_RIDER_WEIGHT_KG = 70;
const MODERATE_CYCLING_MET = 8;

export const formatRideDuration = (durationMin?: number) => {
  if (!durationMin || durationMin <= 0) {
    return "--";
  }

  const roundedMinutes = Math.round(durationMin);
  const hours = Math.floor(roundedMinutes / 60);
  const minutes = roundedMinutes % 60;
  if (hours === 0) {
    return `${minutes} 分钟`;
  }

  return minutes === 0 ? `${hours} 小时` : `${hours} 小时 ${minutes} 分钟`;
};

export const estimateCyclingCalories = (durationMin?: number) => {
  if (!durationMin || durationMin <= 0) {
    return null;
  }

  const calories = MODERATE_CYCLING_MET * 3.5 * DEFAULT_RIDER_WEIGHT_KG / 200 * durationMin;
  return Math.round(calories / 10) * 10;
};
