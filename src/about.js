import { clearSavedData } from "./storage.js";

const clearButton = document.querySelector("#clear-data");
const clearStatus = document.querySelector("#clear-status");

clearButton?.addEventListener("click", () => {
  clearSavedData();
  clearStatus.textContent = "Saved Outfit Forecast data has been cleared from this browser.";
});

document.documentElement.dataset.appReady = "true";
