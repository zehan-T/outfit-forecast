const CAMPUS_START_HOUR = 8;
const CAMPUS_END_HOUR = 18;
const MINIMUM_APPARENT_OBSERVATIONS = 6;

const reminderPriority = [
  "thunder-safety",
  "waterproof-footwear",
  "umbrella",
  "hydration",
  "sun-protection",
  "wind-layer"
];

export class RecommendationDataError extends Error {
  constructor(message, code = "critical-missing-data") {
    super(message);
    this.name = "RecommendationDataError";
    this.code = code;
  }
}

function finiteNumbers(values = []) {
  return values.filter((value) => Number.isFinite(value));
}

function maxOrUndefined(values) {
  const numbers = finiteNumbers(values);
  return numbers.length ? Math.max(...numbers) : undefined;
}

function localHour(isoLocalTime) {
  const hour = Number(isoLocalTime?.slice(11, 13));
  return Number.isInteger(hour) ? hour : undefined;
}

function localDate(isoLocalTime) {
  return typeof isoLocalTime === "string" ? isoLocalTime.slice(0, 10) : undefined;
}

export function representativeApparentF(hourlyValues, currentApparentF) {
  const observations = finiteNumbers(hourlyValues);
  if (observations.length < MINIMUM_APPARENT_OBSERVATIONS) {
    throw new RecommendationDataError("At least six campus-day apparent-temperature values are required.");
  }
  if (Number.isFinite(currentApparentF)) observations.push(currentApparentF);
  return Math.round(observations.reduce((sum, value) => sum + value, 0) / observations.length);
}

export function thermalCategory(representativeF) {
  if (!Number.isFinite(representativeF)) throw new RecommendationDataError("Representative apparent temperature is missing.");
  if (representativeF >= 80) return "hot";
  if (representativeF >= 70) return "warm";
  if (representativeF >= 55) return "mild";
  if (representativeF >= 40) return "cool";
  return "cold";
}

export function weatherIconForWmo(code) {
  if (code === 0) return "clear";
  if ([1, 2].includes(code)) return "partly-cloudy";
  if (code === 3) return "cloudy";
  if ([45, 48].includes(code)) return "fog";
  if ([51, 53, 55].includes(code)) return "drizzle";
  if ([56, 57, 66, 67].includes(code)) return "freezing-rain";
  if ([61, 63, 65].includes(code)) return "rain";
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "snow";
  if ([80, 81, 82].includes(code)) return "showers";
  if ([95, 96, 99].includes(code)) return "thunder";
  return "cloudy";
}

export function isWinterPrecipitation(code) {
  return [56, 57, 66, 67, 71, 73, 75, 77, 85, 86].includes(code);
}

function reminder(id, evidence) {
  return { id, evidence, priority: reminderPriority.indexOf(id) };
}

export function reminderRules(record, category) {
  const codes = record.campusWmoCodes ?? [];
  const precipitationMax = maxOrUndefined(record.campusPrecipitationPercentages);
  const apparentMax = maxOrUndefined(record.campusApparentF);
  const gustMax = maxOrUndefined(record.campusGustMph);
  const reminders = [];

  if (codes.some((code) => [95, 96, 99].includes(code))) {
    reminders.push(reminder("thunder-safety", "Thunder is possible during the campus day."));
  }
  if (codes.some(isWinterPrecipitation)) {
    reminders.push(reminder("waterproof-footwear", "Snow or freezing precipitation is possible."));
  }
  if (Number.isFinite(precipitationMax) && precipitationMax >= 30) {
    reminders.push(reminder("umbrella", `${Math.round(precipitationMax)}% chance of precipitation.`));
  }
  if (Number.isFinite(apparentMax) && apparentMax >= 80) {
    const strength = apparentMax >= 90 ? "Strong heat caution" : "Hydration reminder";
    reminders.push(reminder("hydration", `${strength}: feels like up to ${Math.round(apparentMax)}°F.`));
  }
  if (Number.isFinite(record.dailyUvMax) && record.dailyUvMax >= 3) {
    const strength = record.dailyUvMax >= 8 ? "Very high UV" : "UV protection recommended";
    reminders.push(reminder("sun-protection", `${strength}: UV Index ${record.dailyUvMax}.`));
  }
  if (["cool", "cold"].includes(category) && Number.isFinite(gustMax) && gustMax >= 25) {
    reminders.push(reminder("wind-layer", `Gusts up to ${Math.round(gustMax)} mph.`));
  }

  return reminders.sort((left, right) => left.priority - right.priority);
}

export function changesLater(record) {
  const apparent = finiteNumbers(record.campusApparentF);
  const morningRain = finiteNumbers(record.morningPrecipitationPercentages);
  const afternoonRain = finiteNumbers(record.afternoonPrecipitationPercentages);
  const changes = [];

  if (apparent.length) {
    const minimum = Math.min(...apparent);
    const maximum = Math.max(...apparent);
    const difference = maximum - minimum;
    if (difference >= 12) {
      changes.push({
        id: "temperature",
        evidence: { minimum, maximum, difference },
        text: `Campus-day feels-like temperatures span ${Math.round(minimum)}°F to ${Math.round(maximum)}°F, a ${Math.round(difference)}° change. Keep a removable layer nearby.`
      });
    }
  }

  const morningMaximum = maxOrUndefined(morningRain);
  const afternoonMaximum = maxOrUndefined(afternoonRain);
  if (Number.isFinite(morningMaximum) && Number.isFinite(afternoonMaximum) && morningMaximum < 30 && afternoonMaximum >= 30) {
    changes.push({
      id: "precipitation",
      evidence: { morningMaximum, afternoonMaximum },
      text: `The chance of precipitation rises from ${Math.round(morningMaximum)}% this morning to ${Math.round(afternoonMaximum)}% after noon.`
    });
  }

  return changes;
}

export function recommendForRecord(record) {
  try {
    if (!record || !record.date || !Number.isFinite(record.dailyHighF) || !Number.isFinite(record.dailyLowF)) {
      throw new RecommendationDataError("The selected date is missing its required daily record.");
    }
    const representativeF = representativeApparentF(record.campusApparentF, record.currentApparentF);
    const category = thermalCategory(representativeF);
    return {
      kind: "recommendation",
      date: record.date,
      category,
      representativeApparentF: representativeF,
      weatherIcon: weatherIconForWmo(record.wmoCode),
      reminders: reminderRules(record, category),
      changesLater: changesLater(record)
    };
  } catch (error) {
    if (!(error instanceof RecommendationDataError)) throw error;
    return { kind: "error", code: error.code, message: error.message, date: record?.date };
  }
}

function valueAt(values, index) {
  return Array.isArray(values) ? values[index] : undefined;
}

export function normalizeForecastResponse(provider, place, selectedNow = new Date()) {
  const dailyDates = provider?.daily?.time;
  const hourlyTimes = provider?.hourly?.time;
  if (!Array.isArray(dailyDates) || !Array.isArray(hourlyTimes)) {
    throw new RecommendationDataError("The weather service response is missing daily or hourly records.");
  }

  const currentDate = localDate(provider?.current?.time);
  const currentHour = localHour(provider?.current?.time);
  const nowDate = selectedNow instanceof Date ? selectedNow.toISOString().slice(0, 10) : String(selectedNow).slice(0, 10);

  return dailyDates.map((date, dailyIndex) => {
    const campusIndexes = [];
    const morningIndexes = [];
    const afternoonIndexes = [];
    hourlyTimes.forEach((time, index) => {
      if (localDate(time) !== date) return;
      const hour = localHour(time);
      if (hour >= CAMPUS_START_HOUR && hour <= CAMPUS_END_HOUR) campusIndexes.push(index);
      if (hour >= 8 && hour <= 11) morningIndexes.push(index);
      if (hour >= 12 && hour <= 18) afternoonIndexes.push(index);
    });

    const pick = (field, indexes) => indexes.map((index) => valueAt(provider.hourly[field], index));
    const useCurrent = date === currentDate && date === nowDate && currentHour >= CAMPUS_START_HOUR;
    return {
      place,
      date,
      status: date === nowDate ? "Current" : "Forecast",
      updateTime: provider?.current?.time,
      wmoCode: date === currentDate && Number.isFinite(provider?.current?.weather_code)
        ? provider.current.weather_code
        : valueAt(provider.daily.weather_code, dailyIndex),
      currentTemperatureF: date === currentDate ? provider?.current?.temperature_2m : undefined,
      currentApparentF: useCurrent ? provider?.current?.apparent_temperature : undefined,
      campusApparentF: pick("apparent_temperature", campusIndexes),
      campusTemperatureF: pick("temperature_2m", campusIndexes),
      campusPrecipitationPercentages: pick("precipitation_probability", campusIndexes),
      morningPrecipitationPercentages: pick("precipitation_probability", morningIndexes),
      afternoonPrecipitationPercentages: pick("precipitation_probability", afternoonIndexes),
      campusWmoCodes: pick("weather_code", campusIndexes),
      campusGustMph: pick("wind_gusts_10m", campusIndexes),
      dailyHighF: valueAt(provider.daily.temperature_2m_max, dailyIndex),
      dailyLowF: valueAt(provider.daily.temperature_2m_min, dailyIndex),
      dailyPrecipitationProbability: valueAt(provider.daily.precipitation_probability_max, dailyIndex),
      dailyUvMax: valueAt(provider.daily.uv_index_max, dailyIndex),
      sunrise: valueAt(provider.daily.sunrise, dailyIndex),
      sunset: valueAt(provider.daily.sunset, dailyIndex)
    };
  });
}

export const ruleConstants = Object.freeze({
  campusStartHour: CAMPUS_START_HOUR,
  campusEndHour: CAMPUS_END_HOUR,
  minimumApparentObservations: MINIMUM_APPARENT_OBSERVATIONS,
  reminderPriority: [...reminderPriority]
});
