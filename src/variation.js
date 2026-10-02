import { changesLaterWording, outfitsByCategory, reminderWording } from "./content.js";

export function stableHash(value) {
  let hash = 2166136261;
  for (const character of String(value)) {
    hash ^= character.codePointAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function stableIndex(length, ...seedParts) {
  if (!Number.isInteger(length) || length < 1) throw new Error("A non-empty choice set is required.");
  return stableHash(seedParts.join("|")) % length;
}

export function deterministicOutfitIndex(placeId, date, category) {
  return stableIndex(outfitsByCategory[category].length, placeId, date, `outfit:${category}`);
}

export function selectOutfit({ placeId, date, category, overrideIndex }) {
  const outfits = outfitsByCategory[category];
  if (!outfits) throw new Error(`Unknown outfit category: ${category}`);
  const index = Number.isInteger(overrideIndex) && overrideIndex >= 0 && overrideIndex < outfits.length
    ? overrideIndex
    : deterministicOutfitIndex(placeId, date, category);
  return { ...outfits[index], index };
}

export function nextOutfitIndex(currentIndex, category) {
  const count = outfitsByCategory[category]?.length;
  if (!count) throw new Error(`Unknown outfit category: ${category}`);
  return (currentIndex + 1) % count;
}

export function selectReminderWording(id, evidence, placeId, date) {
  const choices = reminderWording[id];
  if (!choices) throw new Error(`Unknown reminder content type: ${id}`);
  const index = stableIndex(choices.length, placeId, date, `reminder:${id}`);
  return { index, text: choices[index](evidence) };
}

export function selectChangesLaterWording(id, evidence, placeId, date) {
  const choices = changesLaterWording[id];
  if (!choices) throw new Error(`Unknown Changes later content type: ${id}`);
  const index = stableIndex(choices.length, placeId, date, `changes:${id}`);
  return { index, text: choices[index](evidence) };
}

export function accessoryPathsFor(reminderIds, placeId, date) {
  const ids = new Set(reminderIds);
  const paths = [];
  if (ids.has("sun-protection")) paths.push("sun-visor.png");
  if (ids.has("umbrella")) paths.push("umbrella.png");
  if (ids.has("wind-layer")) paths.push("cold-wind-scarf.png");
  return paths;
}
