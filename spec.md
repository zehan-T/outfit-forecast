# Technical Specification

> EDITING DIRECTIVE: DEVELOPER AND AGENT EDIT THIS FILE COLLABORATIVELY. THE DEVELOPER MUST REVIEW AND APPROVE ITS CONTENT.

Specification date: September 28, 2026  
Status: Approved by the Developer on September 28, 2026

Purpose of this file: Turn the approved research, project brief, and hand-drawn screen designs into testable requirements.

## Instructions for the Developer

Make and approve the product decisions, draw every proposed screen, provide the drawings to the Agent, and keep this file current as the intended result changes.

To begin, open the project repository in a fresh chat and enter:

`Read ./spec.md and help me begin the Project 3 specification.`

## Instructions for the Agent

Read `AGENTS.md`, `brief.md`, `research.md`, and this file. Review the screen drawings the Developer provides. Ask one focused question at a time, surface gaps and trade-offs without inventing requirements, and keep the specification concise and testable.

## Goal

Build a playful, responsive weather-and-outfit prototype for US college students. It should let a User choose a US location and one of the next seven dates, then understand what to wear and what to carry without interpreting a dense forecast.

> As a college student leaving home for a day on campus, I want a quick, weather-based clothing recommendation and only the reminders that matter, so that I can dress comfortably without interpreting a detailed forecast.

> As a student planning several days ahead, I want to compare upcoming dates and notice meaningful weather changes, so that I can plan outfits and items to carry before a busy day.

## Screen designs

The Developer supplied hand-drawn phone and laptop layouts for both proposed screens. The drawings establish layout and hierarchy; this specification controls exact wording, behavior, data, and accessibility where a drawing is abbreviated.

| Screen | Phone drawing | Laptop drawing |
| --- | --- | --- |
| Outfit Forecast | [sketch-phone-forecast.jpg.png](reference/sketch-phone-forecast.jpg.png) | [sketch-laptop-forecast-final.jpg.png](reference/sketch-laptop-forecast-final.jpg.png) |
| About This Recommendation | [sketch-phone-about-final.jpg.png](reference/sketch-phone-about-final.jpg.png) | [sketch-laptop-about-final.jpg.png](reference/sketch-laptop-about-final.jpg.png) |

The AI-generated concept images in `reference/` are visual-direction references, not substitutes for the Developer's drawings. The closest implementation references are [concept-phone-forecast-solid-v2.png](reference/concept-phone-forecast-solid-v2.png), [concept-laptop-forecast-v3.png](reference/concept-laptop-forecast-v3.png), [concept-phone-about-v1.png](reference/concept-phone-about-v1.png), and [concept-laptop-about-v1.png](reference/concept-laptop-about-v1.png).

## Requirements

| ID | Requirement | Acceptance check |
| --- | --- | --- |
| R1 | The app has exactly two primary screens: **Outfit Forecast** and **About This Recommendation**. Each provides a visible way to reach the other without browser Back. | Starting on either screen at phone and laptop widths, activate one clearly named navigation control and arrive at the other; keyboard focus remains visible. |
| R2 | The Outfit Forecast screen makes the character the dominant visual and shows the selected US place, selected date, current or forecast status, condition, temperature and feels-like temperature in °F, daily high/low in °F, precipitation probability, last update time, and Open-Meteo attribution. | Select today and a future date and verify every field is visible, labelled, and changes from “Current” to “Forecast” as appropriate. |
| R3 | A User can search by US city/place name or five-digit ZIP code. Results are restricted to the United States and require explicit selection when more than one match exists. Empty, invalid, and no-result searches receive plain-language inline feedback. | Search a valid city, valid ZIP, ambiguous name, empty value, and nonexistent value; confirm the correct result or message. |
| R4 | **Use my location** requests browser geolocation only after activation. Success loads weather under the label **Current location**. Denial or unavailability explains the problem without blame and leaves manual search usable. | Mock allowed, denied, unavailable, and timed-out geolocation; confirm no prompt occurs before activation and search remains available. |
| R5 | The date selector covers today plus the next six local calendar dates. Changing it updates the single shared recommendation state and all dependent content. | Select each date and verify date, forecast status, character, wearable accessories, icon, recommendation, reminders, and Changes later content all refer to it. |
| R6 | The character uses one of five thermal categories—hot, warm, mild, cool, or cold—and one of three outfit variations in that category. Weather-responsive hats, sunglasses, umbrellas, and cold/wind accessories render as separate transparent layers. Identity, front-facing standing pose, scale, and transparent-canvas alignment remain consistent. | Test immediately below, at, and above every boundary; verify the category and alignment of all three category images, then trigger and remove every accessory layer without shifting the character. |
| R7 | The exact affirmation label is **“i feel so stunning today”**. Activation plays a short celebratory response, respects reduced motion, announces a concise confirmation, and stores no personal response. | Activate by pointer and keyboard with normal and reduced-motion settings; verify visible/announced feedback and no new personal-data storage. |
| R8 | **Fashion show** cycles through the three outfits in the current category without an immediate repeat. The manually chosen outfit becomes that location/date/category's stable selection. | From the initial outfit, activate twice to see the other two variations and a third time to return to the first; leave, return, and reload to verify the last choice remains. |
| R9 | Only applicable reminders appear. Thunder safety is first and direct; other reminders may cover umbrella, sun protection, hydration, wind/layers, and snow/ice footwear. Each reminder includes useful triggering evidence, such as “40% chance of rain.” | Feed fixtures that trigger each rule alone and in combination; verify inclusion, exclusion, priority, and evidence. |
| R10 | **Changes later** appears when the campus-day apparent-temperature range is at least 12°F or precipitation begins after morning. It states what changes rather than giving a generic warning. | Test no change, exactly 12°F, 11°F, and precipitation beginning after morning; verify boundary behavior and copy. |
| R11 | Phone layout (up to 767 CSS px) is one column: compact header/location controls, horizontal seven-date selector, character and main recommendation before evidence, then reminders and attribution. No essential action requires hover or swipe. | At 320, 375, and 767 CSS px, verify no horizontal page scroll or clipping, frequent controls of at least 44 × 44 CSS px, and full tap/keyboard operation. |
| R12 | Laptop layout (1024 CSS px and above) uses a true two-column composition: top navigation/location/date; character at left; larger weather summary, recommendation, affirmation, Fashion show, reminders, and Changes later at right. Primary columns align and do not overlap. | At 1024, 1365, and 1440 CSS px, verify two columns, enlarged weather summary, aligned heights, no overlap, and no narrow phone clone. |
| R13 | Intermediate widths reflow fluidly. Text remains usable at 200% browser zoom and a 320 CSS px reflow width. | Resize continuously from 320 to 1440 CSS px and test 200% zoom; verify no overlap, two-dimensional scrolling, or hidden controls. |
| R14 | About identifies **Zehan** and explains the method and limitation, linked NWS/EPA guidance, Open-Meteo source and model limitation, privacy, and complete art credits. | Compare the rendered screen with the About-screen content list below and verify every item and external link. |
| R15 | Loading, denied-location, location-unavailable, no-result, critical missing-data, and weather-service-error states use plain language and an appropriate next action. Retry preserves the selected place. Loading/errors are programmatically announced without moving focus unexpectedly. | Simulate each state; verify message, recovery action, preserved place, `aria-live` announcement, and stable focus. |
| R16 | If a noncritical field such as UV is unavailable, the recommendation renders without fabricating it and rules depending on it are omitted. Missing apparent temperature or a daily record produces the critical missing-data state. | Remove optional and critical fixture values separately and verify partial rendering versus blocking error. |
| R17 | The UI targets WCAG 2.2 AA: semantic landmarks/headings, labelled native controls, logical keyboard order, visible focus, meaningful alternatives, decorative art hidden, 4.5:1 normal-text contrast, and no color-only meaning. | Run automated checks plus keyboard, screen-reader smoke, contrast, zoom, and reduced-motion checks with no known critical failure. |
| R18 | Store only the most recent location record and its non-personal variation selections. A manually selected place may retain its provider place ID and city-centroid coordinates; device coordinates are used exactly only in memory and rounded to two decimal places before storage. Do not create accounts, add analytics, or track across devices. About includes **Clear saved data**. | Inspect storage after manual/device location use, switching locations, reload, and clear; verify only the newest location and its variation keys remain, stored device coordinates have at most two decimal places, and clearing removes all app-owned keys. |
| R19 | Use live Open-Meteo forecast and geocoding endpoints with `countryCode=US`, `timezone=auto`, imperial units, and seven days. Commit or expose no secret/API key. | Inspect network requests/repository and compare at least one response value to the UI; verify visible attribution. |
| R20 | Deploy at a public HTTPS URL that works after direct loading and refresh. | Open both screens on phone and laptop browsers, refresh, and complete location/date/recommendation flows without routing or mixed-content errors. |
| R21 | Three peers test the working version. Record tasks, observations, findings, and at least one implemented evidence-supported change in `plan.md` and Revisions. | Confirm three anonymized records, one tied implementation change, and repeat verification of the affected acceptance check. |

Current approved R6 override: active weather-responsive wearables are the sun
visor, umbrella, and cold/wind layer. Sunglasses are retired and must never
render; their source PNG is retained only as an archived asset.

Current approved R11 narrow-screen order: location search, current weather,
outfit, seven-day outlook, recommendation, Remember, then Changes later. The
character and active accessories share one fixed 2:3 stage so they scale and
move together at every responsive width.

Current approved R5 date-card detail: every seven-day outlook card shows both
its relative/day label and an explicit abbreviated month/day calendar date.

## Recommendation state and data flow

### Provider requests

1. Manual search sends a place or ZIP to Open-Meteo Geocoding with US filtering. Device location supplies exact coordinates in memory only after permission and uses the display label **Current location**; before persistence, round device coordinates to two decimal places (approximately city-level rather than precise position).
2. After place selection, request Open-Meteo current, hourly, and daily data with automatic local timezone, Fahrenheit, mph, inches, and seven forecast days. A later reload may use the stored manual place centroid or rounded device location.
3. Normalize the response into one record per local date containing the location label, date, current/forecast status, update time, WMO code, applicable current temperature/apparent temperature, hourly apparent temperature, precipitation probability/type, gusts, daily high/low, daily UV maximum, sunrise, and sunset.
4. Pass the selected record through one pure recommendation function. Its single output drives the character, wearable accessory layers, weather icon, sentence, evidence, reminders, and Changes later content. UI components must not calculate competing categories.

`representativeApparentF` is the rounded arithmetic mean of available hourly apparent-temperature values from 8:00 a.m. through 6:00 p.m. local time, inclusive. For today, include current apparent temperature as an additional observation when the day is underway. Missing hourly observations are ignored only when at least six campus-day values remain.

| Category | Rule |
| --- | --- |
| hot | `representativeApparentF >= 80°F` |
| warm | `70°F <= representativeApparentF < 80°F` |
| mild | `55°F <= representativeApparentF < 70°F` |
| cool | `40°F <= representativeApparentF < 55°F` |
| cold | `representativeApparentF < 40°F` |

These are general comfort heuristics, not medical advice.

| Output | Trigger |
| --- | --- |
| Umbrella | Maximum 8 a.m.–6 p.m. precipitation probability is at least 30%, except that thunder safety takes wording priority. |
| Sun protection | Daily maximum UV Index is at least 3; use stronger wording at 8 or above. |
| Hydration | Maximum campus-day apparent temperature is at least 80°F; use stronger caution at 90°F or above. |
| Wind/layer | Category is cool or cold and maximum campus-day gust is at least 25 mph. |
| Waterproof footwear | Any campus-day WMO code indicates snow, snow showers, freezing drizzle, or freezing rain. |
| Thunder safety | Any campus-day WMO code indicates thunder; tell the User to enter a substantial building or hard-topped vehicle when thunder is nearby. |
| Changes later: temperature | Maximum minus minimum campus-day apparent temperature is at least 12°F. |
| Changes later: precipitation | Maximum probability is below 30% from 8–11 a.m. and reaches at least 30% from noon–6 p.m. |

When several reminders apply, order them: thunder safety, snow/ice footwear, umbrella, heat/hydration, sun protection, then wind/layer. The selected date's WMO group determines the weather icon but does not override the thermal category.

## Content variation

Each category has exactly three complete transparent PNG character/outfit variations on the same canvas:

| Category | Variation A | Variation B | Variation C |
| --- | --- | --- | --- |
| hot | breathable short-sleeve top + shorts | light sleeveless or short-sleeve outfit | loose light top + lightweight skirt or trousers |
| warm | short-sleeve top + light trousers | light dress or coordinated set | breathable top + lightweight overshirt |
| mild | long-sleeve top + jeans | cardigan + light base layer | light jacket + trousers |
| cool | sweater + jacket | hoodie + wind-resistant layer | layered knit + warm trousers |
| cold | insulated coat + knit layers | puffer coat + hat/gloves | long winter coat + scarf/gloves |

All remain campus-appropriate and preserve the approved character identity and neutral front-facing standing pose.

Wearable accessories are separate aligned transparent PNG layers rather than
baked into outfit images. At UV 3+, the sun visor may appear; precipitation at
30%+ may show the umbrella; and a cool/cold
category with gusts at 25 mph+ may show the cold/wind layer. The selected
record and the same reminder triggers control these layers. Missing optional
data must omit its accessory rather than fabricate a condition.

The implementation content file contains at least three concise wording variants for each of: umbrella, sun protection, hydration, wind/layer, waterproof footwear, thunder safety, and Changes later. Thunder variants must all retain the instruction to move indoors; variation may not weaken safety guidance.

- On first viewing a location/date, choose outfit and each reminder wording independently using deterministic seeded selection derived from normalized place identifier + local date + content type. Similar conditions can vary without changing on reload.
- Never reuse one random index for both outfit and wording.
- Store only explicit Fashion show overrides for the current saved location, keyed by normalized place identifier + date + category. Overrides persist on reload and when returning to the date.
- When the selected location changes, replace the saved location and delete all variation overrides associated with the previous location.
- If later weather changes the category, disregard an override from the old category.
- Clearing saved data removes overrides and restores deterministic defaults.

## Assets

The expected production set is 36 visual assets. Reference screenshots and hand sketches are documentation and do not ship as product art.

| Quantity | Asset | Use and format | Origin and required credit |
| ---: | --- | --- | --- |
| 1 | Character master | Identity/alignment reference and optional About art; transparent PNG | AI-assisted artwork generated with OpenAI; creatively directed, selected, and edited by Zehan. |
| 15 | Outfit characters | Three full-character transparent PNGs for each of five categories | AI-assisted artwork generated with OpenAI; creatively directed, selected, and edited by Zehan. |
| 4 | Wearable accessory files | Active sun visor, umbrella, and cold/wind layers, plus one retained but retired sunglasses PNG | AI-assisted artwork generated with OpenAI; creatively directed, selected, and edited by Zehan. |
| 10 | Weather icons | Clear, partly cloudy, cloudy, fog, drizzle, rain, freezing rain, snow, showers, and thunder; original inline SVG | Created for this prototype by Zehan with Agent assistance; no copied brand icon set. |
| 6 | Reminder icons | Umbrella, sun protection, water, wind/layer, waterproof footwear/ice, and thunder safety; original inline SVG | Created for this prototype by Zehan with Agent assistance; no copied brand icon set. |

About must show this exact or meaning-equivalent character credit: **“AI-assisted character artwork generated with OpenAI, creatively directed, selected, and edited by Zehan for this prototype.”** It must not call the AI-generated character fully hand drawn or wholly original. The direction may be called a warm premium 3D animated storybook style, but copy and metadata must not claim Disney affiliation or copy Disney characters, logos, or a specific protected design.

Existing concepts may guide production, but only final selected/edited files belong in the shipped manifest. Meaningful character images receive outfit-specific alternative text; decorative SVG uses `aria-hidden="true"`.

## About-screen content

The phone uses this order; laptop may arrange the same groups in two columns:

1. **About This Recommendation** — brief outfit-first purpose.
2. **Created by Zehan**.
3. **Weather data** — Open-Meteo name/link, seven-day forecast, model-based limitation, and update explanation.
4. **How recommendations work** — five bands, independent reminder rules, and Changes later heuristic.
5. **Guidance sources** — linked NWS heat, cold/wind, precipitation, lightning, and winter guidance plus EPA UV guidance.
6. **Privacy** — location permission timing; exact device coordinates are used only for the immediate request and rounded to two decimal places before local storage; only the most recent location and its non-personal visual choices remain; no account, analytics, or cross-device tracking; Clear saved data.
7. **Art credits** — the AI-assisted character credit and original interface-icon credit.
8. **Limitations** — general guidance only; comfort varies; forecasts change; use official alerts and appropriate medical/safety advice.

## Out of scope

- Accounts, profiles, cloud sync, saved wardrobes, shopping, affiliate links, checkout, advertising, analytics, or social posting.
- Locations outside the United States, multiple saved places, maps, radar, news, air quality, pollen, or official alert ingestion.
- Hour-by-hour browsing beyond concise evidence and Changes later.
- Personalized medical, disability, cultural, religious, or occupational clothing advice.
- Commercial brand launch using the free Open-Meteo endpoint; that requires provider rights and a protected server-side arrangement.
- Copying Disney or another studio's characters, logos, names, or protected character design.
- Native mobile apps or a backend for this prototype.

## Revisions

- September 28, 2026: Accepted four Developer hand drawings covering both screens at phone and laptop sizes. Separate state drawings were skipped; R15–R16 define them textually.
- September 28, 2026: Replaced the research-stage layered-SVG character proposal with AI-assisted transparent PNG character/outfit art after Developer approval. Original SVG remains for simple interface icons.
- September 28, 2026: Established the exact affirmation wording, Fashion show persistence, and Zehan/OpenAI credit to match the approved direction.
- September 30, 2026: The Developer approved a refined music-major arts-campus
  wardrobe direction using varied premium summer palettes across skirts,
  shorts, and trousers. Added four independently rendered weather-responsive
  wearable layers and increased the production inventory from 33 to 37 assets.
- September 30, 2026: The Developer approved navy/ivory, muted
  coral/champagne, and pistachio/pearl-white palettes for the first three outfit
  candidates, with a champagne-straw/navy visor and deep amber tortoiseshell
  sunglasses.
- October 1, 2026: The Developer rejected the optional decorative motif without
  replacement. The production inventory is now 36 assets, all with a direct
  character, weather, or reminder function.
- October 2, 2026: The Developer removed the redundant “At a glance / This
  week” section because the seven-date selector already provides the weekly
  overview. R12 now ends with reminders and Changes later. The Developer also
  confirmed that sunglasses remain conditional on the existing UV Index 3+
  sun-protection rule and requested smaller sunglasses and umbrella layers.

- October 2, 2026: The Developer later retired sunglasses from the rendered
  experience. UV Index 3+ now uses only the sun visor; the sunglasses source
  file remains archived in the manifest with no active trigger.

## Approval

**Approved by the Developer on September 28, 2026.** The approval covers the goal and user stories, four linked screen drawings, 21 testable requirements, recommendation rules and shared data flow, content variation and persistence, the original 33-asset inventory and AI-assisted art credit, About-screen content, privacy, accessibility, error handling, deployment, and out-of-scope decisions. The Developer approved the layered-art direction on September 30, 2026, and the final 36-asset inventory without a decorative motif on October 1, 2026.

## Saving the transcript

After approval, enter `save transcript`; the Agent will save the complete specification conversation as `transcripts/spec-YYYY-MM-DD_HHMMSS.md`, labelled Developer and Agent.
