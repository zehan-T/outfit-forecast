import { assertFixtureShape, demoForecast } from "./data/fixtures.js";
import { normalizeForecastResponse, recommendForRecord } from "./recommendation.js";
import { conditionLabelForWmo, fetchSevenDayForecast, getDeviceCoordinates, ProviderError, searchUsPlaces } from "./provider.js";
import { getOutfitOverride, readSavedState, saveNewestLocation, saveOutfitOverride } from "./storage.js";
import { accessoryPathsFor, nextOutfitIndex, selectChangesLaterWording, selectOutfit, selectReminderWording } from "./variation.js";

const ui = {
  dateStrip: document.querySelector("#date-strip"),
  selectedDateLabel: document.querySelector("#selected-date-label"),
  placeName: document.querySelector("#place-name"),
  forecastStatus: document.querySelector("#forecast-status"),
  weatherDate: document.querySelector("#weather-date"),
  weatherIcon: document.querySelector("#weather-icon"),
  temperature: document.querySelector("#temperature"),
  condition: document.querySelector("#condition"),
  feelsLike: document.querySelector("#feels-like"),
  highLow: document.querySelector("#high-low"),
  precipitation: document.querySelector("#precipitation"),
  updatedTime: document.querySelector("#updated-time"),
  characterImage: document.querySelector("#character-image"),
  wearableLayers: document.querySelector("#wearable-layers"),
  outfitHeading: document.querySelector("#outfit-heading"),
  outfitSummary: document.querySelector("#outfit-summary"),
  locationForm: document.querySelector("#location-form"),
  locationInput: document.querySelector("#location-query"),
  locationMessage: document.querySelector("#location-message"),
  locationResults: document.querySelector("#location-results"),
  locationResultList: document.querySelector("#location-result-list"),
  retryWeather: document.querySelector("#retry-weather"),
  useLocation: document.querySelector("#use-location"),
  affirmation: document.querySelector("#affirmation"),
  affirmationFeedback: document.querySelector("#affirmation-feedback"),
  celebrationLayer: document.querySelector("#celebration-layer"),
  fashionShowButtons: [...document.querySelectorAll("[data-fashion-show]")],
  reminderCard: document.querySelector(".reminder-card"),
  reminderList: document.querySelector("#reminder-list"),
  changesCopy: document.querySelector("#changes-copy"),
  recommendationHeading: document.querySelector("#recommendation-heading"),
  recommendationCopy: document.querySelector("#recommendation-copy"),
  appStatus: document.querySelector("#app-status")
};

if (!assertFixtureShape()) throw new Error("The development forecast fixture is incomplete.");

let activePlace = { ...demoForecast.place, kind: "manual" };
let activeDays = demoForecast.days;
let activeUpdatedTime = demoForecast.updatedTime;
let lastRequestedPlace;
let locationChoices = [];
let selectedDayIndex = 0;
let selectedOutfitIndex = 0;
let celebrationTimeout;
let busy = false;

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  weekday: "long",
  month: "long",
  day: "numeric",
  timeZone: "UTC"
});

const shortDateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  timeZone: "UTC"
});

function formatDate(isoDate) {
  return dateFormatter.format(new Date(`${isoDate}T12:00:00Z`));
}

function formatShortDate(isoDate) {
  return shortDateFormatter.format(new Date(`${isoDate}T12:00:00Z`));
}

function iconPath(icon) {
  return `assets/icons/weather/final/${icon}.svg`;
}

function average(values = []) {
  const numbers = values.filter(Number.isFinite);
  return numbers.length ? Math.round(numbers.reduce((sum, value) => sum + value, 0) / numbers.length) : undefined;
}

function maximum(values = []) {
  const numbers = values.filter(Number.isFinite);
  return numbers.length ? Math.round(Math.max(...numbers)) : undefined;
}

function formatUpdateTime(localIsoTime) {
  const time = localIsoTime?.slice(11, 16);
  if (!time) return "Unavailable";
  const [hour, minute] = time.split(":").map(Number);
  const suffix = hour >= 12 ? "PM" : "AM";
  return `${hour % 12 || 12}:${String(minute).padStart(2, "0")} ${suffix}`;
}

function shortDayLabel(index, date) {
  if (index === 0) return "Today";
  if (index === 1) return "Tomorrow";
  return new Intl.DateTimeFormat("en-US", { weekday: "short", timeZone: "UTC" }).format(new Date(`${date}T12:00:00Z`));
}

function liveDayFromRecord(record, index) {
  const recommendation = recommendForRecord(record);
  if (recommendation.kind === "error") throw new ProviderError(recommendation.message, recommendation.code);
  return {
    date: record.date,
    shortLabel: shortDayLabel(index, record.date),
    weekday: new Intl.DateTimeFormat("en-US", { weekday: "short", timeZone: "UTC" }).format(new Date(`${record.date}T12:00:00Z`)),
    status: record.status,
    condition: conditionLabelForWmo(record.wmoCode),
    icon: recommendation.weatherIcon,
    temperatureF: Number.isFinite(record.currentTemperatureF)
      ? Math.round(record.currentTemperatureF)
      : average(record.campusTemperatureF) ?? Math.round((record.dailyHighF + record.dailyLowF) / 2),
    apparentF: recommendation.representativeApparentF,
    highF: Math.round(record.dailyHighF),
    lowF: Math.round(record.dailyLowF),
    precipitationPercent: Number.isFinite(record.dailyPrecipitationProbability)
      ? Math.round(record.dailyPrecipitationProbability)
      : maximum(record.campusPrecipitationPercentages) ?? 0,
    category: recommendation.category,
    record,
    recommendation
  };
}

function reminderEvidence(id, record) {
  if (id === "umbrella") return { probability: maximum(record.campusPrecipitationPercentages) };
  if (id === "sun-protection") return { uv: record.dailyUvMax };
  if (id === "hydration") return { apparentMax: maximum(record.campusApparentF) };
  if (id === "wind-layer") return { gustMax: maximum(record.campusGustMph) };
  return {};
}

function renderRecommendationDetails(day) {
  const headings = {
    hot: "Light pieces for the heat",
    warm: "Breathable polish for a warm day",
    mild: "Easy layers, refined finish",
    cool: "Warm layers for cooler air",
    cold: "Insulated layers for the cold"
  };
  ui.recommendationHeading.textContent = headings[day.category];
  ui.recommendationCopy.textContent = `The campus-day feels-like average is ${day.apparentF}°F. This ${day.category}-weather look keeps the outfit aligned with the forecast.`;
  if (!day.recommendation || !day.record) return;

  const iconNames = { hydration: "water" };
  const reminderItems = day.recommendation.reminders.map((reminder) => {
    const wording = selectReminderWording(reminder.id, reminderEvidence(reminder.id, day.record), activePlace.id, day.date);
    const item = document.createElement("li");
    const icon = iconNames[reminder.id] ?? reminder.id;
    item.innerHTML = `<img src="assets/icons/reminders/final/${icon}.svg" alt=""><span>${wording.text}</span>`;
    return item;
  });
  const remindersAreEmpty = reminderItems.length === 0;
  ui.reminderCard.classList.toggle("is-empty", remindersAreEmpty);
  if (!reminderItems.length) {
    const item = document.createElement("li");
    item.className = "reminder-empty";
    item.textContent = "No extra weather reminder is needed for this campus day.";
    reminderItems.push(item);
  }
  ui.reminderList.replaceChildren(...reminderItems);

  const changes = day.recommendation.changesLater.map((change) =>
    selectChangesLaterWording(change.id, change.evidence, activePlace.id, day.date).text
  );
  ui.changesCopy.textContent = changes.length ? changes.join(" ") : "No major campus-day temperature or precipitation shift is expected.";
}

function renderAccessories(day) {
  if (!day.recommendation || !day.record) {
    ui.wearableLayers.replaceChildren();
    return;
  }
  const reminderIds = day.recommendation.reminders.map(({ id }) => id);
  const paths = accessoryPathsFor(reminderIds, day.category, day.record.dailyUvMax);
  ui.wearableLayers.replaceChildren(...paths.map((filename) => {
    const image = document.createElement("img");
    image.src = `assets/accessories/final/${filename}`;
    image.className = `accessory-layer accessory-${filename.replace(".png", "")}`;
    image.alt = "";
    return image;
  }));
}

function renderDateStrip(selectedIndex) {
  ui.dateStrip.replaceChildren(...activeDays.map((day, index) => {
    const button = document.createElement("button");
    button.className = "date-button";
    button.type = "button";
    button.setAttribute("aria-pressed", String(index === selectedIndex));
    button.dataset.dayIndex = String(index);
    button.innerHTML = `<strong>${day.shortLabel}</strong><span class="date-calendar">${formatShortDate(day.date)}</span><span>${day.highF}° / ${day.lowF}°</span><span>${day.condition}</span>`;
    return button;
  }));
}

function renderSelectedDay(index) {
  const day = activeDays[index];
  const overrideIndex = getOutfitOverride(activePlace.id, day.date, day.category);
  const outfit = selectOutfit({ placeId: activePlace.id, date: day.date, category: day.category, overrideIndex });
  selectedDayIndex = index;
  selectedOutfitIndex = outfit.index;
  renderDateStrip(index);
  ui.selectedDateLabel.textContent = day.shortLabel;
  ui.placeName.textContent = activePlace.label;
  ui.forecastStatus.textContent = day.status;
  ui.weatherDate.textContent = formatDate(day.date);
  ui.weatherIcon.src = iconPath(day.icon);
  ui.weatherIcon.alt = day.condition;
  ui.temperature.textContent = String(day.temperatureF);
  ui.condition.textContent = day.condition;
  ui.feelsLike.textContent = `${day.apparentF}°F`;
  ui.highLow.textContent = `${day.highF}° / ${day.lowF}°`;
  ui.precipitation.textContent = `${day.precipitationPercent}%`;
  ui.updatedTime.textContent = activeUpdatedTime;
  ui.characterImage.src = outfit.image;
  ui.characterImage.alt = outfit.alt;
  ui.outfitHeading.textContent = outfit.heading;
  ui.outfitSummary.textContent = outfit.summary;
  renderRecommendationDetails(day);
  renderAccessories(day);
  ui.appStatus.textContent = `${day.shortLabel}: ${day.condition}, ${day.temperatureF} degrees.`;
}

ui.dateStrip.addEventListener("click", (event) => {
  const button = event.target.closest("[data-day-index]");
  if (button) renderSelectedDay(Number(button.dataset.dayIndex));
});

function setBusy(isBusy) {
  busy = isBusy;
  ui.locationForm.setAttribute("aria-busy", String(isBusy));
  ui.locationInput.readOnly = isBusy;
  for (const button of [ui.locationForm.querySelector('button[type="submit"]'), ui.useLocation, ui.retryWeather]) {
    button.setAttribute("aria-disabled", String(isBusy));
  }
}

function showLocationMessage(message, state = "status") {
  ui.locationMessage.textContent = message;
  ui.locationMessage.dataset.state = state;
  ui.appStatus.textContent = message;
}

function showLocationChoices(places) {
  locationChoices = places;
  ui.locationResultList.replaceChildren(...places.map((place, index) => {
    const button = document.createElement("button");
    button.className = "location-result-button";
    button.type = "button";
    button.dataset.placeIndex = String(index);
    button.innerHTML = `<strong>${place.label}</strong><span>${place.detail || "United States"}</span>`;
    return button;
  }));
  ui.locationResults.hidden = false;
  showLocationMessage(`${places.length} matching US locations found. Select one to load its forecast.`);
}

async function loadForecast(place) {
  lastRequestedPlace = place;
  ui.locationResults.hidden = true;
  ui.retryWeather.hidden = true;
  setBusy(true);
  showLocationMessage(`Loading weather for ${place.label}…`);
  try {
    const payload = await fetchSevenDayForecast(place);
    const records = normalizeForecastResponse(payload, place, payload.current?.time ?? new Date());
    const days = records.map(liveDayFromRecord);
    const saved = saveNewestLocation(place);
    activePlace = { ...place, id: saved.location.id };
    activeDays = days;
    activeUpdatedTime = formatUpdateTime(payload.current?.time);
    selectedDayIndex = 0;
    renderSelectedDay(0);
    showLocationMessage(`Showing the seven-day forecast for ${activePlace.label}.`);
  } catch (error) {
    const message = error instanceof ProviderError
      ? error.message
      : "Weather data could not be loaded. Your place is still selected; try again.";
    showLocationMessage(message, "error");
    ui.retryWeather.hidden = false;
  } finally {
    setBusy(false);
  }
}

ui.locationForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (busy) return;
  ui.locationResults.hidden = true;
  ui.retryWeather.hidden = true;
  setBusy(true);
  showLocationMessage("Searching US places…");
  searchUsPlaces(ui.locationInput.value)
    .then((places) => places.length === 1 ? loadForecast(places[0]) : showLocationChoices(places))
    .catch((error) => showLocationMessage(error.message, "error"))
    .finally(() => setBusy(false));
});

ui.locationResultList.addEventListener("click", (event) => {
  if (busy) return;
  const button = event.target.closest("[data-place-index]");
  if (button) loadForecast(locationChoices[Number(button.dataset.placeIndex)]);
});

ui.useLocation.addEventListener("click", async () => {
  if (busy) return;
  ui.locationResults.hidden = true;
  ui.retryWeather.hidden = true;
  setBusy(true);
  showLocationMessage("Waiting for location permission…");
  try {
    const place = await getDeviceCoordinates(navigator.geolocation);
    await loadForecast(place);
  } catch (error) {
    showLocationMessage(error.message, "error");
    setBusy(false);
  }
});

ui.retryWeather.addEventListener("click", () => {
  if (busy) return;
  if (lastRequestedPlace) loadForecast(lastRequestedPlace);
});

ui.affirmation.addEventListener("click", () => {
  ui.affirmationFeedback.hidden = false;
  ui.celebrationLayer.classList.remove("is-celebrating");
  void ui.celebrationLayer.offsetWidth;
  ui.celebrationLayer.classList.add("is-celebrating");
  ui.appStatus.textContent = "Stunning confirmed.";
  window.clearTimeout(celebrationTimeout);
  celebrationTimeout = window.setTimeout(() => {
    ui.affirmationFeedback.hidden = true;
    ui.celebrationLayer.classList.remove("is-celebrating");
  }, 3200);
});

function showNextOutfit() {
  const day = activeDays[selectedDayIndex];
  const saved = saveNewestLocation(activePlace);
  activePlace.id = saved.location.id;
  const nextIndex = nextOutfitIndex(selectedOutfitIndex, day.category);
  saveOutfitOverride(activePlace.id, day.date, day.category, nextIndex);
  renderSelectedDay(selectedDayIndex);
  ui.appStatus.textContent = `Outfit ${nextIndex + 1} of 3 selected and saved for ${day.shortLabel}.`;
}

ui.fashionShowButtons.forEach((button) => button.addEventListener("click", showNextOutfit));

renderSelectedDay(0);
document.documentElement.dataset.appReady = "true";

const savedLocation = readSavedState().location;
if (!new URLSearchParams(window.location.search).has("fixture")) {
  loadForecast(savedLocation ?? activePlace);
}
