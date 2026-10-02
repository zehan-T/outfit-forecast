const GEOCODING_ENDPOINT = "https://geocoding-api.open-meteo.com/v1/search";
const FORECAST_ENDPOINT = "https://api.open-meteo.com/v1/forecast";

export class ProviderError extends Error {
  constructor(message, code, cause) {
    super(message, { cause });
    this.name = "ProviderError";
    this.code = code;
  }
}

export function validateLocationQuery(value) {
  const query = String(value ?? "").trim();
  if (!query) throw new ProviderError("Enter a US city or five-digit ZIP code.", "empty-query");
  if (/^\d+$/.test(query) && !/^\d{5}$/.test(query)) {
    throw new ProviderError("Enter a five-digit US ZIP code.", "invalid-query");
  }
  if (query.length < 2) throw new ProviderError("Enter at least two characters for a US place.", "invalid-query");
  return query;
}

export function buildGeocodingUrl(query) {
  const url = new URL(GEOCODING_ENDPOINT);
  url.search = new URLSearchParams({
    name: validateLocationQuery(query),
    count: "10",
    language: "en",
    format: "json",
    countryCode: "US"
  });
  return url;
}

function placeLabel(result) {
  const parts = [result.name, result.admin1].filter(Boolean);
  return [...new Set(parts)].join(", ");
}

export function normalizePlaceResults(payload) {
  const results = Array.isArray(payload?.results) ? payload.results : [];
  return results
    .filter((result) => result.country_code === "US" && Number.isFinite(result.latitude) && Number.isFinite(result.longitude))
    .map((result) => ({
      id: String(result.id),
      label: placeLabel(result),
      detail: [result.admin2, result.country].filter(Boolean).join(", "),
      latitude: result.latitude,
      longitude: result.longitude,
      timezone: result.timezone,
      kind: "manual"
    }));
}

async function fetchJson(url, fetchImpl, errorCode, errorMessage) {
  let response;
  try {
    response = await fetchImpl(url);
  } catch (error) {
    throw new ProviderError(errorMessage, errorCode, error);
  }
  if (!response.ok) throw new ProviderError(errorMessage, errorCode);
  try {
    return await response.json();
  } catch (error) {
    throw new ProviderError("The weather service returned unreadable data. Try again.", "invalid-response", error);
  }
}

export async function searchUsPlaces(query, fetchImpl = fetch) {
  const payload = await fetchJson(
    buildGeocodingUrl(query),
    fetchImpl,
    "geocoding-service-error",
    "Place search is unavailable right now. Check your connection and try again."
  );
  const places = normalizePlaceResults(payload);
  if (!places.length) throw new ProviderError("No matching US place was found. Check the spelling or ZIP code.", "no-results");
  return places;
}

export function buildForecastUrl(place) {
  if (!Number.isFinite(place?.latitude) || !Number.isFinite(place?.longitude)) {
    throw new ProviderError("This location is missing coordinates.", "invalid-place");
  }
  const url = new URL(FORECAST_ENDPOINT);
  url.search = new URLSearchParams({
    latitude: String(place.latitude),
    longitude: String(place.longitude),
    current: "temperature_2m,apparent_temperature,weather_code",
    hourly: "temperature_2m,apparent_temperature,precipitation_probability,weather_code,wind_gusts_10m",
    daily: "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,uv_index_max,sunrise,sunset",
    temperature_unit: "fahrenheit",
    wind_speed_unit: "mph",
    precipitation_unit: "inch",
    timezone: "auto",
    forecast_days: "7"
  });
  return url;
}

export function validateForecastPayload(payload) {
  if (!Array.isArray(payload?.daily?.time) || payload.daily.time.length !== 7 || !Array.isArray(payload?.hourly?.time)) {
    throw new ProviderError("The forecast is incomplete. Try again in a moment.", "critical-missing-data");
  }
  return payload;
}

export async function fetchSevenDayForecast(place, fetchImpl = fetch) {
  const payload = await fetchJson(
    buildForecastUrl(place),
    fetchImpl,
    "weather-service-error",
    "Weather data is unavailable right now. Your place is still selected; try again."
  );
  return validateForecastPayload(payload);
}

export function getDeviceCoordinates(geolocation) {
  if (!geolocation?.getCurrentPosition) {
    return Promise.reject(new ProviderError("Location is unavailable in this browser. Search for a US place instead.", "location-unavailable"));
  }
  return new Promise((resolve, reject) => {
    geolocation.getCurrentPosition(
      ({ coords }) => resolve({
        id: `device-${coords.latitude}-${coords.longitude}`,
        label: "Current location",
        latitude: coords.latitude,
        longitude: coords.longitude,
        kind: "device"
      }),
      (error) => {
        const denied = error?.code === 1;
        reject(new ProviderError(
          denied
            ? "Location access was not allowed. You can still search for a US place."
            : "Your location could not be found. Search for a US place or try again.",
          denied ? "location-denied" : "location-unavailable",
          error
        ));
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
    );
  });
}

export function conditionLabelForWmo(code) {
  if (code === 0) return "Clear";
  if ([1, 2].includes(code)) return "Partly cloudy";
  if (code === 3) return "Cloudy";
  if ([45, 48].includes(code)) return "Fog";
  if ([51, 53, 55].includes(code)) return "Drizzle";
  if ([56, 57, 66, 67].includes(code)) return "Freezing rain";
  if ([61, 63, 65].includes(code)) return "Rain";
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "Snow";
  if ([80, 81, 82].includes(code)) return "Rain showers";
  if ([95, 96, 99].includes(code)) return "Thunderstorms";
  return "Conditions unavailable";
}
