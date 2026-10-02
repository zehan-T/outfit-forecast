# Research

> EDITING DIRECTIVE: DEVELOPER AND AGENT EDIT THIS FILE COLLABORATIVELY. THE DEVELOPER MUST REVIEW AND APPROVE ITS CONTENT.

Research date: September 28, 2026  
Status: Approved by the Developer on September 28, 2026

## Context of use

I would mainly use this app on my phone in the morning, shortly before leaving home for classes. I need to decide quickly what to wear for walking across campus and commuting between buildings without studying a full weather report. Because I may be away from home for most of the day, later temperature changes, rain, strong wind, snow, and high UV exposure matter even if conditions are comfortable when I leave.

I would occasionally use the app on a laptop to look several days ahead and plan laundry, outfits, or what to carry. The phone should support a quick, one-handed check; the laptop can show the week and supporting details together.

Important circumstances and limitations:

- The primary setting is a US college campus, with short outdoor walks separated by indoor classes.
- The first useful answer is an outfit and essential reminders, not a dense weather dashboard.
- Comfort varies by person, activity, health, mobility, cultural or religious dress, and time outdoors. Recommendations are general guidance and should be adjusted after peer testing.
- Forecasts are uncertain. The app is not a replacement for official warnings or medical advice.
- Location permission may be denied, so manual US place or ZIP-code search must remain equally usable.
- Only the most recent selected place should be stored on the device. Precise device coordinates should not be retained.

## User story

> As a college student leaving home for a day on campus, I want a quick, weather-based clothing recommendation and only the reminders that matter, so that I can dress comfortably without interpreting a detailed forecast.

> As a student planning several days ahead, I want to compare upcoming dates and notice meaningful weather changes, so that I can plan outfits and items to carry before a busy day.

## References

The screenshots were captured at a consistent 1365 × 900 laptop viewport on September 28, 2026. They are research references only and will not be copied into or distributed with the finished app.

| Saved reference | Source | Observation and relevance |
| --- | --- | --- |
| [01-nws-home.png](reference/01-nws-home.png) | [National Weather Service](https://www.weather.gov/) | Alerts and local search are prominent, supporting urgent guidance ahead of playful content. The crowded navigation, map, legend, and small links are too slow for a morning glance. |
| [02-weather-channel-today.png](reference/02-weather-channel-today.png) | [The Weather Channel](https://weather.com/weather/today/l/Chicago+IL) | The captured error state uses a plain-language heading and alternate destinations. This confirms that failures need designed states, but “try again” should be an actual button and preserve the selected location. |
| [04-weather-underground.png](reference/04-weather-underground.png) | [Weather Underground](https://www.wunderground.com/weather/us/il/chicago) | The large temperature, condition icon, “feels like,” update time, and location create useful hierarchy. Advertising and multiple navigation bands compete with the forecast and should be avoided. |
| [05-windy-map.png](reference/05-windy-map.png) | [Windy](https://www.windy.com/41.878/-87.630?41.878,-87.630,8) | Its aligned multi-day/hourly timeline makes change visible. The map and grid are too dense for an outfit-first experience; a compact date strip and one “later today” signal are more appropriate. |
| [06-open-meteo-docs.png](reference/06-open-meteo-docs.png) | [Open-Meteo Forecast API](https://open-meteo.com/en/docs) | Grouped controls, visible defaults, units, and explanations make technical choices understandable. The large hero also shows why the app should put the character and recommendation—not branding—above the fold. |
| [07-carrot-weather.png](reference/07-carrot-weather.png) | [CARROT Weather](https://www.meetcarrot.com/weather/) | Bold color, a large condition/temperature pair, concise copy, and personality make weather approachable. This supports playful original art and varied wording, while safety copy should remain direct rather than sarcastic. |

Conclusions: lead with location, date, character, outfit, and one short recommendation. Show “feels like,” high/low, precipitation, update time, and source as supporting evidence. Use a short date strip on phones. Design loading, denied-location, no-result, missing-data, and service-error states. Exclude ads, maps, news, and dense tables.

## Weather and technical evidence

### Weather guidance and approved rules

The provider supplies weather evidence, but the clothing bands below are product heuristics because authorities do not prescribe a universal everyday outfit at each temperature. The bands must be described as general guidance and evaluated in peer testing.

| Evidence | What it supports | Limitation or proposed use |
| --- | --- | --- |
| [NWS heat index](https://www.weather.gov/ama/heatindex) | Heat risk begins in the 80–90°F “caution” band during prolonged exposure or activity. | Use apparent temperature rather than air temperature alone. Trigger hydration at a daytime apparent maximum of 80°F+, with stronger caution at 90°F+. Individual risk varies. |
| [NWS heat safety](https://www.weather.gov/wrn/heat-sm) | Lightweight, loose-fitting, light-colored clothing, water, shade, and sun protection are appropriate in heat. | Supports hot-weather outfit copy and reminders but does not define everyday comfort bands. |
| [EPA UV Index](https://www.epa.gov/sunsafety/uv-index-scale-0) | UV 3–7 needs protection; UV 8+ needs extra protection. | Trigger sunscreen/hat/sunglasses at daily UV 3+, with stronger wording at 8+. Daily maximum UV is not constant exposure. |
| [NWS wind chill](https://www.weather.gov/safety/cold-wind-chill-chart) and [cold safety](https://www.weather.gov/safety/cold-during) | Wind increases heat loss; cold guidance emphasizes loose layers, hats, mittens, dry clothing, and covered skin. | Use apparent temperature for the outfit category. Add wind/layer wording when gusty. Local advisory thresholds are not universal. |
| [NWS precipitation terminology](https://forecast.weather.gov/glossary.php?word=chance) | “Chance” describes a 30%, 40%, or 50% probability of measurable precipitation. | A carry-an-umbrella reminder at 30%+ is a convenience heuristic, not a safety threshold; display the probability. |
| [NWS lightning safety](https://www.weather.gov/safety/lightning-safety) | No outdoor location is safe when thunderstorms are nearby; go into a safe building or vehicle. | Thunderstorm codes should create a high-priority “go indoors” message, not only an umbrella reminder. The app does not replace alerts. |
| [NWS winter guidance](https://www.weather.gov/media/mhx/Winter2020.pdf) | Winter guidance includes layers, wind/wet protection, and waterproof boots. | Snow or freezing-rain codes should add waterproof-footwear and traction-aware wording without claiming footwear removes ice risk. |

Approved logic for the specification:

- Calculate a representative campus-day apparent temperature from hourly values between 8:00 a.m. and 6:00 p.m. local time. For today, include the current value if the day is underway.
- Assign one outfit category: **hot** (80°F+), **warm** (70–79°F), **mild** (55–69°F), **cool** (40–54°F), or **cold** (below 40°F). These are testable comfort heuristics, not medical thresholds.
- Add reminders independently: umbrella at 30%+ daytime precipitation probability; sunscreen at UV 3+; hydration at apparent maximum 80°F+; warm/wind layer when cool/cold and gusts reach 25 mph; waterproof footwear for snow/freezing precipitation; indoor-safety wording for thunderstorms.
- Add “weather changes later” when the campus-day apparent-temperature range reaches 12°F or precipitation begins after morning. This is also a heuristic to test.
- Derive outfit, weather icon, recommendation sentence, and reminders from the same location/date weather record and recommendation state.

Required variables: hourly apparent temperature, precipitation probability and amount/type or WMO code, gusts, daily UV maximum, daily high/low, sunrise/sunset, and current conditions.

### Weather-provider comparison

| Provider | Advantages | Constraints | Fit |
| --- | --- | --- | --- |
| [Open-Meteo forecast](https://open-meteo.com/en/docs), [geocoding](https://open-meteo.com/en/docs/geocoding-api), and [terms](https://open-meteo.com/en/terms) | No key for its non-commercial API; US-filtered place/ZIP search; current, hourly, and daily apparent temperature, precipitation, WMO codes, gusts, and UV; 7 days by default and up to 16. | Attribution is required. The free endpoint is non-commercial and usage-limited; a clothing-brand campaign requires a commercial subscription. Data is model output and not guaranteed. | Best functional fit for a non-commercial prototype because all inputs and geocoding are available without exposing a key. |
| [National Weather Service API](https://www.weather.gov/documentation/services-web-api) | Authoritative US government forecasts, observations, and alerts; no fee or API key. | Coordinate/grid use needs multiple requests, there is no place geocoder, and core forecast responses do not provide the needed direct UV value. | Strong source for US safety guidance, but a weaker single-provider fit for manual search and UV reminders. |
| [WeatherAPI](https://www.weatherapi.com/docs/) and [pricing](https://www.weatherapi.com/pricing.aspx) | Integrated search, current/hourly/daily data, alerts, UV, and air quality. | Requires a key; the free plan currently gives only a 3-day forecast. A static GitHub Pages app exposes the key. | Convenient, but the free range and client-side secret conflict with a seven-day static prototype. |
| [Visual Crossing](https://www.visualcrossing.com/resources/documentation/weather-api/timeline-weather-api/) and [pricing](https://www2.visualcrossing.com/weather-data-editions/) | Single timeline query, broad variables, 15-day forecast, and commercial plans. | Requires a key; free use is limited and a static app exposes the key. | Viable with a protected backend, which adds complexity beyond this prototype. |

**Selected provider:** Open-Meteo for the non-commercial prototype, with `countryCode=US`, `timezone=auto`, US units, and seven forecast days. The information screen must credit Open-Meteo, link to it, and explain that forecasts are model-based. Before a real brand campaign or other commercial use, the client must obtain commercial rights and put the key behind a server-side proxy; the free endpoint must not be assumed to cover launch.

### Accessibility, privacy, and implementation evidence

- Target **WCAG 2.2 AA**. [WCAG 2.2](https://www.w3.org/TR/wcag/) supports 4.5:1 normal-text contrast, keyboard access, visible focus, reflow, text alternatives, and programmatic status messages. Use semantic HTML and announce loading/errors without unexpectedly moving focus.
- Make frequent phone controls at least 44 × 44 CSS pixels, following [W3C target-size guidance](https://www.w3.org/WAI/WCAG21/Understanding/target-size). Keep location, date, retry, and navigation controls within comfortable thumb reach; do not require swipe-only gestures.
- The [Geolocation API](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API) requires HTTPS and permission. Ask only after “Use my location,” explain the benefit, handle denial without blame, and retain the selected display place rather than precise coordinates.
- [`localStorage`](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage) persists across sessions. Store only the most recent place and deterministic variation keys. Provide a way to replace or clear it; add no accounts, analytics, or cross-device tracking.
- Build a small static HTML/CSS/JavaScript app using `fetch`, native controls, and layered SVG. Avoid a framework unless implementation reveals a concrete need.
- Deploy through GitHub Pages with HTTPS enforced. [GitHub Pages supports HTTPS](https://docs.github.com/en/pages/getting-started-with-github-pages/securing-your-github-pages-site-with-https), which device location also requires.

## Decisions

The Developer approved the following decisions on September 28, 2026.

| Decision | Proposal and trade-off |
| --- | --- |
| Weather provider | Open-Meteo for this non-commercial prototype. It covers the needed variables without a browser-visible secret, but requires attribution; commercial campaign use requires a paid arrangement and protected key. |
| Forecast range | Today plus six following days. Seven days supports weekly planning without the interface weight and greater uncertainty of 16 days. |
| Categories and rules | Hot, warm, mild, cool, and cold outfits, with rain, snow/ice, wind, UV, hydration, thunder, and later-change reminders calculated independently by the rules above. |
| Screen structure | Two screens: **Outfit forecast** and **About this recommendation**. Phone: one column with compact top controls and character first. Laptop: character at left and week/evidence/reminders at right. |
| Visual direction | Warm, friendly, premium 3D animated storybook style with a large original character, solid warm backgrounds, concise conversational copy, and weather-dependent accents. Safety language stays plain and serious. The work must not claim Disney affiliation or copy protected characters, logos, or a specific protected design. |
| Artwork | AI-assisted transparent PNG character/outfit art generated with OpenAI, creatively directed, selected, and edited by Zehan. Simple weather/reminder icons remain original SVG. The AI-generated art must be credited and must not be described as fully hand drawn or wholly original. Reference screenshots are not assets. |
| Deployment | Static GitHub Pages with enforced HTTPS for the prototype. Commercial keys would require a later serverless/backend deployment and must never be committed or sent to the browser. |
| Additional feature | **Changes later**: flag a 12°F+ campus-day swing or precipitation beginning after morning. This directly serves an all-day campus user without another source or permission. |

Artwork estimate:

- 1 base character;
- 15 outfits (3 for each of 5 thermal categories);
- 4 weather-responsive wearable accessory layers (sun hat, sunglasses,
  umbrella, and cold/wind accessories);
- about 10 weather icons (clear, partly cloudy, cloudy, fog, drizzle, rain, freezing rain, snow, showers, thunderstorm);
- 6 reminder icons (umbrella, sun protection, water, wind/layer, waterproof footwear/ice, thunder safety);

Estimated total: **36 visual assets**: 1 character master, 15 complete
transparent PNG outfit characters, 4 transparent weather-responsive wearable
accessory layers, 10 original SVG weather icons, and 6 original SVG reminder
icons. Meaningful character/outfit images need
concise alternative text; decorative layers should be hidden from assistive
technology.

## Revisions

- September 28, 2026: Established morning phone use and secondary laptop weekly planning from the Developer-confirmed context.
- September 28, 2026: Added six interface references because `reference/` initially contained no images.
- September 28, 2026: Proposed Open-Meteo while explicitly separating permitted non-commercial prototype use from commercial client use.
- September 28, 2026: The Developer approved the context of use, two user stories, six reference analyses, research sources, provider comparison, recommendation rules, accessibility/privacy/technical approach, 33-asset estimate, and “Changes later” feature.
- September 28, 2026: Revised the art direction from a fully layered-SVG character to AI-assisted transparent PNG character/outfit art, with original SVG interface icons. Added the OpenAI/Zehan credit and the restriction against copying or claiming affiliation with Disney or another protected property.
- September 30, 2026: The Developer selected a refined arts-campus direction
  with varied premium summer palettes across skirts, shorts, and trousers, and
  approved separate transparent wearable layers so hats, sunglasses, umbrellas,
  and cold/wind accessories can respond to weather without multiplying outfit
  combinations. The estimate increased from 33 to 37 visual assets.
- September 30, 2026: The Developer approved navy and ivory for the skirt,
  muted coral and champagne for the shorts, pistachio and pearl white for the
  trousers, champagne straw and navy for the visor, and deep amber tortoiseshell
  for the sunglasses.
- October 1, 2026: The Developer rejected the optional decorative motif without
  replacement after clarifying that it was not weather-driven. The approved
  production inventory is now 36 visual assets.

## Approval

**Approved by the Developer on September 28, 2026.** The approval covers the context of use, two user stories, six reference analyses, authoritative guidance, provider comparison, recommendation rules, accessibility/privacy/technical approach, the original 33-asset estimate, and “Changes later” feature. The Developer approved the layered-art direction on September 30, 2026, and the final 36-asset inventory without a decorative motif on October 1, 2026. The Open-Meteo commercial-use limitation remains a deployment constraint.

After approval, enter `save transcript` so this research conversation can be saved in `transcripts/`.
