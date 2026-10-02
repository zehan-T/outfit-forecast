export const demoForecast = {
  place: {
    id: "austin-tx-demo",
    label: "Austin, TX",
    latitude: 30.27,
    longitude: -97.74,
    timezone: "America/Chicago"
  },
  updatedTime: "8:10 AM",
  days: [
    { date: "2026-10-01", shortLabel: "Today", weekday: "Thu", status: "Current", condition: "Partly cloudy", icon: "partly-cloudy", temperatureF: 64, apparentF: 63, highF: 72, lowF: 55, precipitationPercent: 20, category: "mild" },
    { date: "2026-10-02", shortLabel: "Tomorrow", weekday: "Fri", status: "Forecast", condition: "Clear", icon: "clear", temperatureF: 76, apparentF: 76, highF: 80, lowF: 61, precipitationPercent: 5, category: "warm" },
    { date: "2026-10-03", shortLabel: "Sat", weekday: "Sat", status: "Forecast", condition: "Rain showers", icon: "showers", temperatureF: 69, apparentF: 68, highF: 73, lowF: 58, precipitationPercent: 45, category: "mild" },
    { date: "2026-10-04", shortLabel: "Sun", weekday: "Sun", status: "Forecast", condition: "Cloudy", icon: "cloudy", temperatureF: 58, apparentF: 55, highF: 64, lowF: 48, precipitationPercent: 20, category: "cool" },
    { date: "2026-10-05", shortLabel: "Mon", weekday: "Mon", status: "Forecast", condition: "Clear", icon: "clear", temperatureF: 47, apparentF: 43, highF: 55, lowF: 39, precipitationPercent: 5, category: "cool" },
    { date: "2026-10-06", shortLabel: "Tue", weekday: "Tue", status: "Forecast", condition: "Drizzle", icon: "drizzle", temperatureF: 42, apparentF: 37, highF: 48, lowF: 34, precipitationPercent: 35, category: "cold" },
    { date: "2026-10-07", shortLabel: "Wed", weekday: "Wed", status: "Forecast", condition: "Partly cloudy", icon: "partly-cloudy", temperatureF: 61, apparentF: 60, highF: 67, lowF: 49, precipitationPercent: 10, category: "mild" }
  ]
};

export function assertFixtureShape(fixture = demoForecast) {
  if (!fixture?.place?.label || !Array.isArray(fixture.days) || fixture.days.length !== 7) return false;
  const required = ["date", "status", "condition", "icon", "temperatureF", "apparentF", "highF", "lowF", "precipitationPercent", "category"];
  return fixture.days.every((day) => required.every((key) => Object.hasOwn(day, key)));
}
