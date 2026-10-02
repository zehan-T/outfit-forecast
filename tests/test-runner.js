import { assertFixtureShape, demoForecast } from "../src/data/fixtures.js";
import { changesLaterWording, outfitsByCategory, reminderWording, validateContentInventory } from "../src/content.js";
import {
  changesLater,
  normalizeForecastResponse,
  recommendForRecord,
  reminderRules,
  representativeApparentF,
  thermalCategory,
  weatherIconForWmo
} from "../src/recommendation.js";
import {
  APP_STORAGE_KEY,
  clearSavedData,
  getOutfitOverride,
  readSavedState,
  saveNewestLocation,
  saveOutfitOverride
} from "../src/storage.js";
import {
  accessoryPathsFor,
  deterministicOutfitIndex,
  nextOutfitIndex,
  selectChangesLaterWording,
  selectOutfit,
  selectReminderWording,
  stableIndex
} from "../src/variation.js";
import {
  buildForecastUrl,
  buildGeocodingUrl,
  fetchSevenDayForecast,
  getDeviceCoordinates,
  normalizePlaceResults,
  ProviderError,
  searchUsPlaces,
  validateForecastPayload,
  validateLocationQuery
} from "../src/provider.js";

const tests = [];
const addTest = (name, run) => tests.push({ name, run });
const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

class MemoryStorage {
  constructor() { this.values = new Map(); }
  get length() { return this.values.size; }
  getItem(key) { return this.values.has(key) ? this.values.get(key) : null; }
  setItem(key, value) { this.values.set(String(key), String(value)); }
  removeItem(key) { this.values.delete(key); }
  key(index) { return [...this.values.keys()][index] ?? null; }
}

async function fetchDocument(path) {
  const response = await fetch(path);
  assert(response.ok, `${path} returned ${response.status}`);
  return new DOMParser().parseFromString(await response.text(), "text/html");
}

async function loadPageFrame(path, width) {
  const frame = document.createElement("iframe");
  frame.title = `Layout test at ${width}px`;
  frame.style.cssText = `position:absolute;left:-10000px;top:0;width:${width}px;height:1400px;border:0;`;
  frame.src = `${path}${path.includes("?") ? "&" : "?"}width=${width}`;
  document.body.append(frame);
  await new Promise((resolve, reject) => {
    const timeout = window.setTimeout(() => reject(new Error(`layout frame ${width}px timed out`)), 5000);
    frame.addEventListener("load", () => {
      const check = () => {
        if (frame.contentDocument?.documentElement.dataset.appReady === "true") {
          window.clearTimeout(timeout);
          resolve();
        } else {
          window.setTimeout(check, 20);
        }
      };
      check();
    });
  });
  return frame;
}

function loadForecastFrame(width) {
  return loadPageFrame("../index.html?fixture=1", width);
}

function hasPageOverflow(document) {
  const root = document.scrollingElement;
  const initial = root.scrollLeft;
  root.scrollLeft = initial + 100;
  const canScrollPage = root.scrollLeft !== initial;
  root.scrollLeft = initial;
  return canScrollPage;
}

function overflowDiagnostic(document) {
  const viewport = document.documentElement.clientWidth;
  const widest = [...document.body.querySelectorAll("*")]
    .map((element) => ({ element, rect: element.getBoundingClientRect() }))
    .filter(({ rect }) => rect.right > viewport + 1 || rect.left < -1)
    .sort((left, right) => (right.rect.right - right.rect.left) - (left.rect.right - left.rect.left))[0];
  if (!widest) return `page scroll width ${document.scrollingElement.scrollWidth}px for ${viewport}px viewport`;
  const name = widest.element.id ? `#${widest.element.id}` : widest.element.className ? `.${String(widest.element.className).split(" ")[0]}` : widest.element.tagName;
  return `${name} spans ${Math.round(widest.rect.left)}px to ${Math.round(widest.rect.right)}px in a ${viewport}px viewport`;
}

addTest("fixture contains one place and seven complete days", () => {
  assert(assertFixtureShape(demoForecast), "fixture shape is incomplete");
  assert(new Set(demoForecast.days.map((day) => day.date)).size === 7, "dates must be unique");
});

addTest("fixture categories use the five approved thermal names", () => {
  const categories = new Set(["hot", "warm", "mild", "cool", "cold"]);
  assert(demoForecast.days.every((day) => categories.has(day.category)), "unexpected category");
});

addTest("forecast page has semantic navigation, main content, and exact affirmation label", async () => {
  const document = await fetchDocument("../index.html");
  assert(document.querySelector("header nav"), "primary navigation missing");
  assert(document.querySelector("main#main-content"), "main landmark missing");
  assert(document.querySelector("footer"), "footer missing");
  assert(document.querySelector("#affirmation")?.textContent.trim() === "i feel so stunning today", "affirmation label changed");
  assert(document.querySelector('a[href="about.html"]'), "About link missing");
});

addTest("about page has required foundation sections and return navigation", async () => {
  const document = await fetchDocument("../about.html");
  const headings = [...document.querySelectorAll("h2")].map((heading) => heading.textContent.trim());
  for (const required of ["Weather data", "How recommendations work", "Guidance sources", "Privacy", "Art credits", "Limitations"]) {
    assert(headings.includes(required), `${required} section missing`);
  }
  assert(document.querySelector('a[href="index.html"]'), "forecast return link missing");
  assert(document.querySelector("#clear-data"), "clear saved data control missing");
});

addTest("production asset manifest declares 36 complete assets", async () => {
  const response = await fetch("../assets/manifest.json");
  assert(response.ok, "manifest failed to load");
  const manifest = await response.json();
  const declared = 1 + manifest.outfits.length + manifest.wearableAccessories.length + manifest.weatherIcons.length + manifest.reminderIcons.length;
  assert(manifest.expectedAssetCount === 36, "expected count should be 36");
  assert(declared === manifest.expectedAssetCount, `manifest declares ${declared} assets`);
});

addTest("thermal categories honor every exact boundary", () => {
  const examples = [[39, "cold"], [40, "cool"], [54, "cool"], [55, "mild"], [69, "mild"], [70, "warm"], [79, "warm"], [80, "hot"]];
  for (const [temperature, expected] of examples) {
    assert(thermalCategory(temperature) === expected, `${temperature}°F should be ${expected}`);
  }
});

addTest("representative apparent temperature requires six observations and includes current conditions", () => {
  assert(representativeApparentF([50, 51, 52, 53, 54, 55]) === 53, "six-value mean is incorrect");
  assert(representativeApparentF([60, 60, 60, 60, 60, 60], 67) === 61, "current apparent temperature was not included");
  let threw = false;
  try { representativeApparentF([50, 51, 52, 53, 54]); } catch { threw = true; }
  assert(threw, "fewer than six observations should fail");
});

addTest("WMO codes map to all ten approved weather icons", () => {
  const examples = [[0, "clear"], [2, "partly-cloudy"], [3, "cloudy"], [45, "fog"], [53, "drizzle"], [63, "rain"], [66, "freezing-rain"], [73, "snow"], [81, "showers"], [95, "thunder"]];
  for (const [code, expected] of examples) assert(weatherIconForWmo(code) === expected, `${code} should map to ${expected}`);
});

addTest("combined reminders use the approved safety-first priority", () => {
  const reminders = reminderRules({
    campusWmoCodes: [95, 71],
    campusPrecipitationPercentages: [45],
    campusApparentF: [92],
    dailyUvMax: 8,
    campusGustMph: [28]
  }, "cold");
  assert(reminders.map(({ id }) => id).join(",") === "thunder-safety,waterproof-footwear,umbrella,hydration,sun-protection,wind-layer", "reminder priority is incorrect");
});

addTest("optional UV data can be absent without fabricating a sun reminder", () => {
  const reminders = reminderRules({ campusWmoCodes: [0], campusPrecipitationPercentages: [0], campusApparentF: [65], campusGustMph: [5] }, "mild");
  assert(!reminders.some(({ id }) => id === "sun-protection"), "sun reminder should be omitted");
});

addTest("Changes later triggers at a 12°F span but not 11°F", () => {
  assert(changesLater({ campusApparentF: [50, 62] }).some(({ id }) => id === "temperature"), "12°F should trigger");
  assert(!changesLater({ campusApparentF: [50, 61] }).some(({ id }) => id === "temperature"), "11°F should not trigger");
});

addTest("Changes later identifies precipitation beginning after morning", () => {
  const changes = changesLater({ campusApparentF: [60, 61], morningPrecipitationPercentages: [10, 20], afternoonPrecipitationPercentages: [20, 40] });
  assert(changes.some(({ id }) => id === "precipitation"), "afternoon precipitation change missing");
  assert(changes.find(({ id }) => id === "precipitation").text.includes("40%"), "change text lacks concrete evidence");
});

addTest("critical daily or apparent-temperature gaps return a blocking result", () => {
  const base = { date: "2026-10-01", dailyHighF: 70, dailyLowF: 50, wmoCode: 0, campusApparentF: [50, 51, 52, 53, 54] };
  assert(recommendForRecord(base).kind === "error", "missing apparent values should block");
  assert(recommendForRecord({ ...base, dailyHighF: undefined, campusApparentF: [50, 51, 52, 53, 54, 55] }).kind === "error", "missing daily record should block");
});

addTest("normalization selects 8 AM–6 PM hours and today’s current apparent temperature", () => {
  const times = Array.from({ length: 24 }, (_, hour) => `2026-10-01T${String(hour).padStart(2, "0")}:00`);
  const provider = {
    current: { time: "2026-10-01T10:00", temperature_2m: 64, apparent_temperature: 70 },
    hourly: {
      time: times,
      apparent_temperature: times.map(() => 60),
      precipitation_probability: times.map((_, index) => index >= 12 ? 40 : 10),
      weather_code: times.map(() => 2),
      wind_gusts_10m: times.map(() => 12)
    },
    daily: {
      time: ["2026-10-01"], weather_code: [2], temperature_2m_max: [72], temperature_2m_min: [55], uv_index_max: [4], sunrise: ["2026-10-01T07:20"], sunset: ["2026-10-01T19:10"]
    }
  };
  const [record] = normalizeForecastResponse(provider, { id: "demo", label: "Austin, TX" }, new Date("2026-10-01T15:00:00Z"));
  assert(record.campusApparentF.length === 11, "campus window should include 11 hourly values");
  assert(record.morningPrecipitationPercentages.length === 4, "morning window should include four values");
  assert(record.afternoonPrecipitationPercentages.length === 7, "afternoon window should include seven values");
  const recommendation = recommendForRecord(record);
  assert(recommendation.representativeApparentF === 61, "today's current apparent temperature was not included");
});

addTest("content inventory has three outfits per category and three wordings per content type", () => {
  assert(validateContentInventory(), "content inventory is incomplete");
  assert(Object.keys(outfitsByCategory).join(",") === "hot,warm,mild,cool,cold", "thermal category set changed");
  assert(Object.values(outfitsByCategory).every((choices) => choices.length === 3), "each category needs exactly three outfits");
  assert(Object.values(reminderWording).every((choices) => choices.length >= 3), "each reminder needs three wordings");
  assert(Object.values(changesLaterWording).every((choices) => choices.length >= 3), "each change needs three wordings");
});

addTest("seeded defaults are stable and content types vary independently", () => {
  const first = deterministicOutfitIndex("austin-tx", "2026-10-01", "mild");
  assert(first === deterministicOutfitIndex("austin-tx", "2026-10-01", "mild"), "same seed should return the same outfit");
  const pairs = new Set();
  for (let day = 1; day <= 20; day += 1) {
    const date = `2026-10-${String(day).padStart(2, "0")}`;
    pairs.add(`${deterministicOutfitIndex("austin-tx", date, "mild")}:${stableIndex(3, "austin-tx", date, "reminder:umbrella")}`);
  }
  assert(pairs.size > 3, "outfit and reminder choices appear locked into fixed pairs");
});

addTest("Fashion show visits all three outfits without an immediate repeat", () => {
  const initial = selectOutfit({ placeId: "demo", date: "2026-10-01", category: "warm" }).index;
  const second = nextOutfitIndex(initial, "warm");
  const third = nextOutfitIndex(second, "warm");
  const returned = nextOutfitIndex(third, "warm");
  assert(new Set([initial, second, third]).size === 3, "three activations should visit all variations");
  assert(returned === initial, "the fourth shown state should return to the initial outfit");
});

addTest("reminder and Changes later wording preserve concrete evidence and safety", () => {
  for (let day = 1; day <= 12; day += 1) {
    const date = `2026-11-${String(day).padStart(2, "0")}`;
    const thunder = selectReminderWording("thunder-safety", {}, "demo", date).text.toLowerCase();
    assert(thunder.includes("indoors"), "every thunder variant must direct the user indoors");
  }
  assert(selectReminderWording("umbrella", { probability: 45 }, "demo", "2026-11-01").text.includes("45%"), "umbrella copy lacks evidence");
  const temperature = selectChangesLaterWording("temperature", { minimum: 48, maximum: 63, difference: 15 }, "demo", "2026-11-01").text;
  assert(temperature.includes("15") || temperature.includes("48"), "temperature change lacks evidence");
});

addTest("explicit outfit overrides survive return and reload", () => {
  const storage = new MemoryStorage();
  saveNewestLocation({ id: "Austin TX", label: "Austin, TX", kind: "manual", latitude: 30.2672, longitude: -97.7431 }, storage);
  saveOutfitOverride("austin-tx", "2026-10-02", "warm", 2, storage);
  assert(getOutfitOverride("austin-tx", "2026-10-02", "warm", storage) === 2, "saved override was not returned");
  const reloaded = new MemoryStorage();
  reloaded.setItem(APP_STORAGE_KEY, storage.getItem(APP_STORAGE_KEY));
  assert(getOutfitOverride("austin-tx", "2026-10-02", "warm", reloaded) === 2, "override did not survive reload");
});

addTest("a weather category change disregards an old-category override", () => {
  const storage = new MemoryStorage();
  saveNewestLocation({ id: "demo", label: "Demo", latitude: 40, longitude: -75 }, storage);
  saveOutfitOverride("demo", "2026-10-03", "mild", 1, storage);
  assert(getOutfitOverride("demo", "2026-10-03", "cool", storage) === undefined, "old category override should not apply");
});

addTest("selecting a new location replaces the old location and its overrides", () => {
  const storage = new MemoryStorage();
  saveNewestLocation({ id: "austin", label: "Austin, TX", latitude: 30.27, longitude: -97.74 }, storage);
  saveOutfitOverride("austin", "2026-10-03", "mild", 1, storage);
  saveNewestLocation({ id: "chicago", label: "Chicago, IL", latitude: 41.88, longitude: -87.63 }, storage);
  const state = readSavedState(storage);
  assert(state.location.id === "chicago", "newest location was not stored");
  assert(Object.keys(state.outfitOverrides).length === 0, "old-location overrides were retained");
  assert(storage.length === 1, "app should use one current-state record");
});

addTest("device coordinates are rounded before storage and exact values never persist", () => {
  const storage = new MemoryStorage();
  saveNewestLocation({ label: "Current location", kind: "device", latitude: 30.267153, longitude: -97.743061 }, storage);
  const serialized = storage.getItem(APP_STORAGE_KEY);
  const state = readSavedState(storage);
  assert(state.location.latitude === 30.27 && state.location.longitude === -97.74, "device coordinates were not rounded to two decimals");
  assert(!serialized.includes("30.267153") && !serialized.includes("-97.743061"), "exact device coordinates leaked into storage");
});

addTest("Clear saved data removes app-owned keys and leaves unrelated data", () => {
  const storage = new MemoryStorage();
  storage.setItem(APP_STORAGE_KEY, "saved");
  storage.setItem("outfit-weather:legacy", "saved");
  storage.setItem("another-app", "keep");
  clearSavedData(storage);
  assert(storage.getItem(APP_STORAGE_KEY) === null && storage.getItem("outfit-weather:legacy") === null, "app-owned data remains");
  assert(storage.getItem("another-app") === "keep", "unrelated browser data was removed");
});

addTest("location queries reject empty and malformed ZIP input", () => {
  for (const value of ["", "   ", "787", "787011"]) {
    let error;
    try { validateLocationQuery(value); } catch (caught) { error = caught; }
    assert(error instanceof ProviderError, `query should fail: ${value}`);
  }
  assert(validateLocationQuery("Austin, TX") === "Austin, TX", "valid city was rejected");
  assert(validateLocationQuery("78701") === "78701", "valid ZIP was rejected");
});

addTest("geocoding requests are US-filtered and normalize explicit choices", () => {
  const url = buildGeocodingUrl("Springfield");
  assert(url.hostname === "geocoding-api.open-meteo.com", "wrong geocoding host");
  assert(url.searchParams.get("countryCode") === "US", "US country filter missing");
  const places = normalizePlaceResults({ results: [
    { id: 1, name: "Springfield", admin1: "Illinois", admin2: "Sangamon", country: "United States", country_code: "US", latitude: 39.8, longitude: -89.6, timezone: "America/Chicago" },
    { id: 2, name: "Springfield", admin1: "Queensland", country_code: "AU", latitude: -27.6, longitude: 152.9 }
  ] });
  assert(places.length === 1 && places[0].label === "Springfield, Illinois", "US place normalization failed");
});

addTest("place search reports no results and service failures in plain language", async () => {
  let noResults;
  try { await searchUsPlaces("Nowhere", async () => ({ ok: true, json: async () => ({ results: [] }) })); } catch (error) { noResults = error; }
  assert(noResults?.code === "no-results" && noResults.message.includes("No matching US place"), "no-result state is unclear");
  let unavailable;
  try { await searchUsPlaces("Austin", async () => { throw new Error("offline"); }); } catch (error) { unavailable = error; }
  assert(unavailable?.code === "geocoding-service-error" && unavailable.message.includes("try again"), "search failure lacks recovery guidance");
});

addTest("forecast requests use automatic local time, imperial units, and seven days", () => {
  const url = buildForecastUrl({ latitude: 30.27, longitude: -97.74 });
  assert(url.hostname === "api.open-meteo.com", "wrong forecast host");
  assert(url.searchParams.get("timezone") === "auto", "automatic local timezone missing");
  assert(url.searchParams.get("temperature_unit") === "fahrenheit", "Fahrenheit units missing");
  assert(url.searchParams.get("wind_speed_unit") === "mph", "mph units missing");
  assert(url.searchParams.get("precipitation_unit") === "inch", "inch units missing");
  assert(url.searchParams.get("forecast_days") === "7", "seven-day limit missing");
});

addTest("incomplete forecasts and weather-service failures produce recoverable errors", async () => {
  let incomplete;
  try { validateForecastPayload({ daily: { time: ["2026-10-01"] }, hourly: { time: [] } }); } catch (error) { incomplete = error; }
  assert(incomplete?.code === "critical-missing-data", "incomplete forecast should be critical");
  let unavailable;
  try { await fetchSevenDayForecast({ latitude: 30, longitude: -97 }, async () => ({ ok: false })); } catch (error) { unavailable = error; }
  assert(unavailable?.code === "weather-service-error" && unavailable.message.includes("still selected"), "weather failure should preserve-place guidance");
});

addTest("geolocation is requested only when invoked and maps success, denial, and absence", async () => {
  let calls = 0;
  const allowed = { getCurrentPosition(success) { calls += 1; success({ coords: { latitude: 30.267153, longitude: -97.743061 } }); } };
  assert(calls === 0, "geolocation ran before activation");
  const place = await getDeviceCoordinates(allowed);
  assert(calls === 1 && place.kind === "device" && place.label === "Current location", "allowed location was not normalized");
  let denied;
  try { await getDeviceCoordinates({ getCurrentPosition(_success, failure) { failure({ code: 1 }); } }); } catch (error) { denied = error; }
  assert(denied?.code === "location-denied" && denied.message.includes("still search"), "denial message is not recoverable");
  let absent;
  try { await getDeviceCoordinates(undefined); } catch (error) { absent = error; }
  assert(absent?.code === "location-unavailable" && absent.message.includes("Search"), "missing geolocation guidance is unclear");
});

addTest("weather accessories follow reminder triggers and keep sun selection stable", () => {
  const first = accessoryPathsFor(["sun-protection", "umbrella", "wind-layer"], "austin", "2026-10-01");
  const returned = accessoryPathsFor(["sun-protection", "umbrella", "wind-layer"], "austin", "2026-10-01");
  assert(first.join(",") === returned.join(","), "sun accessory changed for the same location and date");
  assert(first.some((path) => ["sun-visor.png", "sunglasses.png"].includes(path)), "sun accessory missing");
  assert(first.includes("umbrella.png") && first.includes("cold-wind-scarf-gloves.png"), "weather accessory missing");
  assert(accessoryPathsFor([], "austin", "2026-10-01").length === 0, "accessory appeared without a trigger");
});

addTest("phone forecast markup includes layered accessories and visible affirmation feedback", async () => {
  const document = await fetchDocument("../index.html");
  assert(document.querySelector("#wearable-layers[aria-hidden='true']"), "decorative accessory layer is missing");
  assert(document.querySelector("#affirmation-feedback[hidden]"), "affirmation feedback region is missing");
  assert(document.querySelector("#reminder-list") && document.querySelector("#changes-copy"), "dependent recommendation outputs are missing");
});

addTest("phone and intermediate widths reflow without horizontal page overflow", async () => {
  for (const width of [320, 375, 767]) {
    const frame = await loadForecastFrame(width);
    try {
      const document = frame.contentDocument;
      assert(!hasPageOverflow(document), `${width}px layout has horizontal page overflow: ${overflowDiagnostic(document)}`);
      const character = document.querySelector(".character-panel").getBoundingClientRect();
      const details = document.querySelector(".forecast-details").getBoundingClientRect();
      assert(details.top >= character.bottom, `${width}px layout should keep character before details`);
    } finally { frame.remove(); }
  }
});

addTest("frequent phone controls meet the 44 by 44 CSS pixel target", async () => {
  const frame = await loadForecastFrame(320);
  try {
    const document = frame.contentDocument;
    const selectors = ["#location-query", "#location-form button[type='submit']", "#use-location", "#affirmation", "#fashion-show", ".date-button"];
    for (const selector of selectors) {
      const rect = document.querySelector(selector).getBoundingClientRect();
      assert(rect.height >= 44 && rect.width >= 44, `${selector} is smaller than 44 by 44 CSS pixels`);
    }
  } finally { frame.remove(); }
});

addTest("laptop widths use aligned two-column compositions without overflow", async () => {
  for (const width of [1024, 1365, 1440]) {
    const frame = await loadForecastFrame(width);
    try {
      const document = frame.contentDocument;
      assert(!hasPageOverflow(document), `${width}px layout has horizontal page overflow`);
      const character = document.querySelector(".character-panel").getBoundingClientRect();
      const details = document.querySelector(".forecast-details").getBoundingClientRect();
      assert(details.left > character.left && Math.abs(details.top - character.top) < 2, `${width}px layout is not an aligned two-column composition`);
    } finally { frame.remove(); }
  }
});

addTest("320px reflow retains every primary action and content region", async () => {
  const frame = await loadForecastFrame(320);
  try {
    const document = frame.contentDocument;
    for (const selector of ["#location-form", "#date-strip", ".character-panel", ".weather-card", ".recommendation-card", "#reminder-list", "#changes-copy", "footer"]) {
      const element = document.querySelector(selector);
      assert(element && element.getBoundingClientRect().width > 0, `${selector} disappeared at 320px reflow`);
    }
  } finally { frame.remove(); }
});

addTest("About includes every approved source, privacy, credit, and limitation", async () => {
  const document = await fetchDocument("../about.html");
  const text = document.body.textContent.replace(/\s+/g, " ");
  for (const phrase of [
    "Created by",
    "Zehan",
    "Open-Meteo",
    "rounded to two decimal places",
    "no accounts, analytics, or cross-device tracking",
    "AI-assisted character artwork generated with OpenAI",
    "general clothing guidance"
  ]) assert(text.toLowerCase().includes(phrase.toLowerCase()), `About copy is missing: ${phrase}`);
  const externalUrls = [...document.querySelectorAll('a[rel="external"]')].map((link) => link.href);
  assert(externalUrls.some((url) => url.includes("open-meteo.com")), "Open-Meteo link missing");
  assert(externalUrls.filter((url) => url.includes("weather.gov")).length >= 5, "NWS guidance links incomplete");
  assert(externalUrls.some((url) => url.includes("epa.gov")), "EPA UV guidance link missing");
});

addTest("About reflows as one phone column and a laptop composition without page overflow", async () => {
  for (const width of [320, 1024]) {
    const frame = await loadPageFrame("../about.html", width);
    try {
      const document = frame.contentDocument;
      assert(!hasPageOverflow(document), `About page scrolls horizontally at ${width}px`);
      const hero = document.querySelector(".about-hero");
      const children = [...hero.children].map((element) => element.getBoundingClientRect());
      if (width === 320) assert(children[1].top >= children[0].bottom, "phone About hero is not one column");
      if (width === 1024) assert(children[1].left > children[0].left && Math.abs(children[1].top - children[0].top) < 2, "laptop About hero is not two columns");
    } finally { frame.remove(); }
  }
});

addTest("both screens expose landmarks, one H1, named controls, and image alternatives", async () => {
  for (const path of ["../index.html", "../about.html"]) {
    const document = await fetchDocument(path);
    assert(document.querySelector("header nav") && document.querySelector("main") && document.querySelector("footer"), `${path} landmark missing`);
    assert(document.querySelectorAll("h1").length === 1, `${path} needs exactly one H1`);
    assert(!document.querySelector("img:not([alt])"), `${path} has an image without alt`);
    const ids = [...document.querySelectorAll("[id]")].map(({ id }) => id);
    assert(new Set(ids).size === ids.length, `${path} has duplicate IDs`);
    for (const button of document.querySelectorAll("button")) {
      assert(button.textContent.trim() || button.getAttribute("aria-label"), `${path} has an unnamed button`);
      assert(!button.hasAttribute("role"), `${path} overrides a native button role`);
    }
  }
});

addTest("focus styling, reduced motion, and live status regions are present", async () => {
  const stylesheet = await (await fetch("../styles.css")).text();
  assert(stylesheet.includes(":focus-visible") && stylesheet.includes("outline:"), "visible focus rule missing");
  assert(stylesheet.includes("prefers-reduced-motion: reduce") && stylesheet.includes("animation: none"), "reduced-motion override missing");
  const forecast = await fetchDocument("../index.html");
  const about = await fetchDocument("../about.html");
  assert(forecast.querySelector('[role="status"][aria-live="polite"]'), "forecast live status missing");
  assert(about.querySelector('[role="status"][aria-live="polite"]'), "About clear-data live status missing");
  assert(!forecast.querySelector('[tabindex]:not([tabindex="0"])') && !about.querySelector('[tabindex]:not([tabindex="0"])'), "custom tab order detected");
});

function relativeLuminance(hex) {
  const channels = [1, 3, 5].map((index) => Number.parseInt(hex.slice(index, index + 2), 16) / 255)
    .map((channel) => channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4);
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

function contrastRatio(foreground, background) {
  const values = [relativeLuminance(foreground), relativeLuminance(background)].sort((left, right) => right - left);
  return (values[0] + 0.05) / (values[1] + 0.05);
}

addTest("approved normal-text color pairs meet WCAG AA contrast", () => {
  const pairs = [
    ["#26324a", "#f5eee2"],
    ["#556178", "#f5eee2"],
    ["#8c641d", "#f5eee2"],
    ["#315b59", "#fffaf2"],
    ["#ffffff", "#26324a"],
    ["#26324a", "#d6a23f"]
  ];
  for (const [foreground, background] of pairs) {
    assert(contrastRatio(foreground, background) >= 4.5, `${foreground} on ${background} is below 4.5:1`);
  }
});

addTest("loading preserves focus and the affirmation stores no response", async () => {
  const frame = await loadForecastFrame(375);
  try {
    const { document, localStorage } = frame.contentWindow;
    const submit = document.querySelector('#location-form button[type="submit"]');
    submit.focus();
    document.querySelector("#location-form").requestSubmit();
    await new Promise((resolve) => window.setTimeout(resolve, 30));
    assert(document.activeElement === submit, "search loading moved keyboard focus");
    const before = JSON.stringify(Object.fromEntries(Array.from({ length: localStorage.length }, (_, index) => {
      const key = localStorage.key(index);
      return [key, localStorage.getItem(key)];
    })));
    document.querySelector("#affirmation").click();
    assert(!document.querySelector("#affirmation-feedback").hidden, "affirmation feedback did not become visible");
    assert(document.querySelector("#app-status").textContent.includes("Stunning confirmed"), "affirmation was not announced");
    const after = JSON.stringify(Object.fromEntries(Array.from({ length: localStorage.length }, (_, index) => {
      const key = localStorage.key(index);
      return [key, localStorage.getItem(key)];
    })));
    assert(before === after, "affirmation stored a personal response");
  } finally { frame.remove(); }
});

addTest("sun protection and sunglasses require UV Index 3 or higher", () => {
  const base = { campusWmoCodes: [0], campusPrecipitationPercentages: [0], campusApparentF: [65], campusGustMph: [5] };
  const belowThreshold = reminderRules({ ...base, dailyUvMax: 2 }, "mild");
  const atThreshold = reminderRules({ ...base, dailyUvMax: 3 }, "mild");
  assert(!belowThreshold.some(({ id }) => id === "sun-protection"), "UV Index 2 should not trigger sun protection");
  assert(atThreshold.some(({ id }) => id === "sun-protection"), "UV Index 3 should trigger sun protection");
  assert(accessoryPathsFor(belowThreshold.map(({ id }) => id), "austin", "2026-10-01").length === 0, "a sun accessory appeared below the threshold");
  assert(accessoryPathsFor(atThreshold.map(({ id }) => id), "austin", "2026-10-01").some((path) => ["sun-visor.png", "sunglasses.png"].includes(path)), "UV Index 3 did not produce a sun accessory");
});

addTest("reviewed forecast removes the week overview and scales wearable accessories", async () => {
  const document = await fetchDocument("../index.html");
  const text = document.body.textContent.replace(/\s+/g, " ");
  const stylesheet = await (await fetch("../styles.css")).text();
  assert(!document.querySelector(".week-overview") && !text.includes("At a glance") && !text.includes("This week"), "removed week overview is still present");
  assert(stylesheet.includes(".accessory-sunglasses") && stylesheet.includes("scale(0.42)"), "sunglasses scale adjustment is missing");
  assert(stylesheet.includes(".accessory-sun-visor") && stylesheet.includes("scale(0.46)"), "sun visor alignment adjustment is missing");
  assert(stylesheet.includes(".accessory-umbrella") && stylesheet.includes("scale(0.54)"), "umbrella scale adjustment is missing");
});

addTest("Search and Use my location align on laptops and stack evenly on phones", async () => {
  for (const width of [320, 1440]) {
    const frame = await loadForecastFrame(width);
    try {
      const document = frame.contentDocument;
      const search = document.querySelector("#location-form button[type='submit']").getBoundingClientRect();
      const location = document.querySelector("#use-location").getBoundingClientRect();
      if (width === 1440) {
        assert(Math.abs(search.top - location.top) < 2 && Math.abs(search.height - location.height) < 2, "desktop location actions are not aligned");
      } else {
        assert(location.top >= search.bottom && Math.abs(search.width - location.width) < 2, "phone location actions do not stack at equal width");
      }
    } finally { frame.remove(); }
  }
});

async function run() {
  const results = document.querySelector("#results");
  let failures = 0;
  for (const test of tests) {
    const item = document.createElement("li");
    try {
      await test.run();
      item.className = "pass";
      item.textContent = `PASS — ${test.name}`;
    } catch (error) {
      failures += 1;
      item.className = "fail";
      item.textContent = `FAIL — ${test.name}: ${error.message}`;
    }
    results.append(item);
  }

  const passed = tests.length - failures;
  document.querySelector("#summary").textContent = `${passed}/${tests.length} tests passed.`;
  document.body.dataset.status = failures ? "failed" : "passed";
  document.querySelector('meta[name="test-status"]').content = failures ? "failed" : "passed";
}

run();
