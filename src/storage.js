export const APP_STORAGE_KEY = "outfit-weather:v1";

function emptyState() {
  return { version: 1, location: null, outfitOverrides: {} };
}

export function normalizePlaceId(value) {
  return String(value ?? "").trim().toLowerCase().replace(/[^a-z0-9.-]+/g, "-").replace(/^-|-$/g, "");
}

export function roundDeviceCoordinate(value) {
  if (!Number.isFinite(value)) throw new Error("A finite coordinate is required.");
  return Math.round(value * 100) / 100;
}

function parseState(storage) {
  try {
    const value = JSON.parse(storage.getItem(APP_STORAGE_KEY));
    if (value?.version === 1 && value.outfitOverrides && typeof value.outfitOverrides === "object") return value;
  } catch {
    // Invalid app-owned state is ignored and safely replaced on the next write.
  }
  return emptyState();
}

function prepareLocation(location) {
  const kind = location?.kind === "device" ? "device" : "manual";
  const latitude = kind === "device" ? roundDeviceCoordinate(location.latitude) : location.latitude;
  const longitude = kind === "device" ? roundDeviceCoordinate(location.longitude) : location.longitude;
  const sourceId = kind === "device" ? `device-${latitude}-${longitude}` : location.id;
  const id = normalizePlaceId(sourceId);
  if (!id || !location?.label || !Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    throw new Error("A complete location record is required.");
  }
  return { id, label: String(location.label), kind, latitude, longitude, timezone: location.timezone || undefined };
}

export function readSavedState(storage = localStorage) {
  return parseState(storage);
}

export function saveNewestLocation(location, storage = localStorage) {
  const nextLocation = prepareLocation(location);
  const current = parseState(storage);
  const changed = current.location?.id !== nextLocation.id;
  const next = { version: 1, location: nextLocation, outfitOverrides: changed ? {} : current.outfitOverrides };
  storage.setItem(APP_STORAGE_KEY, JSON.stringify(next));
  return next;
}

function overrideKey(placeId, date, category) {
  return `${normalizePlaceId(placeId)}|${date}|${category}`;
}

export function getOutfitOverride(placeId, date, category, storage = localStorage) {
  const state = parseState(storage);
  if (state.location?.id !== normalizePlaceId(placeId)) return undefined;
  const value = state.outfitOverrides[overrideKey(placeId, date, category)];
  return Number.isInteger(value) ? value : undefined;
}

export function saveOutfitOverride(placeId, date, category, index, storage = localStorage) {
  const state = parseState(storage);
  if (state.location?.id !== normalizePlaceId(placeId)) throw new Error("Outfit overrides may only be saved for the current location.");
  if (!Number.isInteger(index) || index < 0 || index > 2) throw new Error("Outfit variation index must be 0, 1, or 2.");
  state.outfitOverrides[overrideKey(placeId, date, category)] = index;
  storage.setItem(APP_STORAGE_KEY, JSON.stringify(state));
  return state;
}

export function clearSavedData(storage = localStorage) {
  for (let index = storage.length - 1; index >= 0; index -= 1) {
    const key = storage.key(index);
    if (key?.startsWith("outfit-weather:")) storage.removeItem(key);
  }
}
