# Implementation Plan

> EDITING DIRECTIVE: DEVELOPER AND AGENT EDIT THIS FILE COLLABORATIVELY. THE DEVELOPER MUST REVIEW AND APPROVE ITS CONTENT.

Purpose of this file: Turn the approved specification into an ordered, trackable build and verification plan.

## Instructions for the Developer

Set priorities, review the checklist, verify results rather than relying only on the Agent's report, and keep the project documents current as the work changes. Expect the build to take many rounds of testing and fixing; record material changes under Revisions.

To begin planning, open the project repository in a fresh chat and enter:

`Read ./plan.md and help me create the Project 3 implementation plan.`

After approving the plan, open the project repository in a fresh chat and enter:

`Read ./plan.md and help me implement the approved Project 3 plan in working checkpoints.`

## Instructions for the Agent

Read `AGENTS.md`, `brief.md`, `research.md`, `spec.md`, and this file, then inspect the relevant project files. Propose concrete tasks and checks without expanding the approved scope.

During implementation, follow the approved plan in working checkpoints and keep it current. Never mark approvals or items requiring Developer verification complete on the Developer's behalf.

## Approach

Build a framework-free static app with semantic HTML, responsive CSS, and small
JavaScript modules for provider requests, normalized forecast records,
recommendation rules, deterministic content variation, persistence, and screen
rendering. Open-Meteo geocoding or device coordinates lead to one seven-day
forecast response; one pure recommendation function converts the selected
location/date record into every character, icon, sentence, reminder, and
Changes later output. Browser controls render that shared state on the Outfit
Forecast screen, while a separate About screen documents the method, sources,
privacy, limitations, and credits.

Work in the ordered checkpoints below. Start the production artwork and asset
manifest first because the 15 aligned outfit images are the largest schedule
risk. In parallel with approved assets, establish automated tests around the
pure data and recommendation logic before connecting the live provider or UI.
Each checkpoint must run locally and pass its named checks before the next
begins, then be committed without including unrelated repository changes.

Main risks are inconsistent character alignment across generated images,
provider fields that are absent or shaped differently than fixtures, timezone
and today/future-date mistakes, content variation that is not independently
stable, a dense phone layout, and inaccessible custom interactions. Mitigate
them with a fixed transparent character canvas, a checked asset manifest,
provider-response fixtures, pure boundary-tested functions, native controls,
and viewport/keyboard/accessibility checks at every UI checkpoint.

## Checklist

### Approvals

- [x] Research approved (recorded in `research.md`, September 28, 2026)
- [x] Specification approved (recorded in `spec.md`, September 28, 2026)
- [x] Plan approved by the Developer on September 28, 2026

### Build

- [x] **Checkpoint 1 — production assets and manifest:** create, select, and
  optimize the 15 consistently aligned transparent outfit PNGs; prepare the 10
  original weather icons, 6 original reminder icons as accessible SVG, and 4
  aligned transparent weather-responsive wearable layers;
  record filenames, categories, triggers, alternative text, and credits;
  verify transparent canvases, consistent character scale/pose, complete sets,
  and reasonable file sizes (R6, R14, R17)
- [x] **Checkpoint 2 — app and test foundation:** create the semantic two-screen
  static app, responsive style foundation, JavaScript module structure, local
  development commands, automated test runner, and provider fixtures; verify
  both screens load without console errors and tests run from a clean checkout
  (R1, R11–R13, R17)
- [x] **Checkpoint 3 — recommendation engine:** implement forecast
  normalization, the 8 a.m.–6 p.m. representative apparent-temperature rule,
  five category boundaries, reminder priority/triggers, concrete Changes later
  output, WMO icon mapping, and optional-versus-critical missing-data handling;
  unit-test boundaries and isolated/combined rules before rendering them (R5,
  R6, R9, R10, R16)
- [x] **Checkpoint 4 — deterministic variation and privacy:** add three outfit
  choices per category, at least three independent wording choices per reminder
  and Changes later, seeded defaults, Fashion show overrides, newest-location
  replacement, rounded device-coordinate storage, and Clear saved data;
  unit-test independence, stability on return/reload, category changes, location
  replacement, and storage contents (R8, R18)
- [x] **Checkpoint 5 — provider and location flows:** connect US-filtered
  Open-Meteo place/ZIP geocoding and seven-day forecast requests, explicit
  ambiguous-result selection, current-location permission on activation only,
  retry with place preservation, and all specified loading/failure states;
  verify against fixtures and at least two live US locations (R3, R4, R15, R19)
- [x] **Checkpoint 6 — Outfit Forecast phone UI:** implement the approved phone
  drawing with compact location controls, horizontal seven-date controls,
  dominant character, evidence, recommendation, reminders, Changes later,
  attribution, affirmation response, and Fashion show; confirm one shared
  recommendation state drives every dependent output (R2, R5–R11)
- [x] **Checkpoint 7 — laptop and fluid layouts:** implement the approved
  laptop two-column composition and weather evidence, then tune intermediate
  widths without changing the phone information order; verify at 320, 375, 767,
  1024, 1365, and 1440 CSS px plus 200% zoom (R11–R13)
- [x] **Checkpoint 8 — About screen:** implement every approved content group,
  links, creator/source/method/privacy/credit/limitation copy, navigation, and
  Clear saved data in the approved phone and laptop layouts (R1, R14, R18)
- [x] **Checkpoint 9 — accessibility and interaction hardening:** verify
  landmarks, headings, names, alternatives, 44 × 44 frequent controls, logical
  keyboard order, focus visibility, live announcements, contrast, reduced
  motion, reflow, and screen-reader smoke behavior; fix all known critical
  failures (R7, R11–R13, R15, R17)
- [x] **Checkpoint 10 — local release candidate:** run the complete automated
  suite and the specification trace below, inspect the repository for secrets,
  validate the production asset manifest and attribution, and test a production
  build locally with no console or network errors (R1–R19)
- [x] Use the approved screen drawings to guide layout and interaction work
- [x] Keep one recommendation state driving every visual and written output
- [x] Test and fix each checkpoint against the specification before starting the next
- [ ] Commit each meaningful working checkpoint using only Project 3 files
- [ ] **Checkpoint 11 — public prototype:** deploy the release candidate to
  GitHub Pages with HTTPS, then test direct loads, refreshes, provider requests,
  and both screens independently of the local version (R20)

### Verify and revise

- [x] Trace R1–R21 to an automated test, manual check, or usability record and
  record the result; do not close a requirement on code inspection alone
- [x] Test multiple locations, current and forecast dates, recommendation categories, outfit and reminder variations, and failure states
- [x] Verify that eligible outfit and reminder variations are selected independently rather than as fixed pairs
- [x] Verify that returning to a previously selected date shows the same variations
- [ ] Test the deployed app, independently of the local version, on a real phone and a laptop, including both screens, accessibility, and one-handed controls
- [ ] Prepare the usability test below using the purpose, tasks, prompts, and note format in this file
- [ ] Test with three peers and record each session
- [ ] Add the chosen improvement to this checklist, and update `spec.md` if the intended result changes
- [ ] Implement, verify, and redeploy at least one meaningful revision

### Deliver

- [ ] Confirm all brief deliverables, sources, privacy information, and asset credits
- [ ] Save all chat transcripts
- [ ] Complete the debrief

## Usability testing

**Purpose:** Evaluate whether a college student can quickly choose a location and
date, understand the outfit and essential reminders, change the outfit, and
find the app's method and privacy information on a phone without coaching.

**Consistent tasks:**

1. Imagine you are leaving for campus today. Find a recommendation for your
   current location, or use a US place you know if you prefer not to share it.
2. Check a later day and explain what you would wear or carry and why.
3. Try another suggested outfit for that day, leave the day, return to it, and
   describe anything you notice.
4. Find who made the app, where its weather comes from, and what it saves.

**Non-leading prompts:** “What would you do next?”, “What are you looking for?”,
“What does this mean to you?”, and “Is there anything you expected but did not
find?” Do not identify the target control or explain the interface during a
task.

**Session note format:** Use a non-identifying label (`P1`, `P2`, or `P3`) and
record device/viewport, task, observable actions and exact comments, task
success, barriers/questions, and possible change. Keep a separate
interpretation/findings section after the observations. Do not record names,
precise locations, or other unnecessary personal information.

After all three sessions, summarize recurring successes and barriers, select
one meaningful improvement supported by the observations, add its build and
repeat-verification steps to the checklist, and update `spec.md` only if the
approved intended result changes.

### Session records

- [ ] `P1` recorded
- [ ] `P2` recorded
- [ ] `P3` recorded
- [ ] Findings summarized and improvement selected

## Revisions

Record material plan changes and why they were made.

- September 28, 2026: Replaced the template build item with eleven ordered
  checkpoints derived from the approved specification. Put the high-risk asset
  set first, placed pure logic and persistence tests before provider/UI
  integration, added requirement traceability, and prepared a consistent
  privacy-conscious usability protocol. Awaiting Developer review and approval.
- September 28, 2026: The Developer approved the implementation plan and its
  checkpoint order. Checkpoint 1 may begin.
- September 30, 2026: The Developer approved layered character production and
  requested review batches of five. Checkpoint 1 now includes four aligned
  weather-responsive wearable layers, increasing the visual inventory to 37.
- September 30, 2026: The Developer approved the first five production assets:
  all three hot-category outfits, the sun visor, and the sunglasses. Promoted
  them to the final asset folders and recorded them in `assets/manifest.json`.
- September 30, 2026: The Developer rejected the initial warm outfit batch as
  insufficiently fashionable, then approved quiet-luxury warm candidates 1 and
  2 without changes. Promoted them as warm variations A and B; variation C is
  still awaiting selection.
- September 30, 2026: The Developer approved a redesigned sage-green
  square-neck fit-and-flare dress as warm variation C. The warm category is now
  complete in the production manifest.
- September 30, 2026: The Developer liked mild-weather candidates 1, 3, 4, and
  5, then approved the recommended final set of 1, 3, and 4. Promoted those as
  mild variations A, B, and C; retained candidate 5 as an alternate without
  deleting it. The mild category is now complete in the production manifest.
- September 30, 2026: The Developer approved cool-weather candidate 1, the
  revised candidate 3 with ankle boots, and the revised asymmetric plum dress
  candidate 4 with knee-high boots. Promoted them as cool variations A, B, and
  C; retained the revised candidate 5 as an alternate. The cool category is now
  complete in the production manifest.
- September 30, 2026: The Developer approved cold-weather candidates 2 and 4,
  plus candidate 5 after changing its skirt to a warm ivory tone matching the
  sweater family. Promoted them as cold variations A, B, and C. All fifteen
  required outfit renders are now complete in the production manifest.
- September 30, 2026: The Developer approved the navy umbrella and forest-green
  scarf-and-gloves cold/wind layer. Promoted both to the final accessory folder.
  All four wearable accessory layers are now complete in the production manifest.
- September 30, 2026: The Developer approved the first five original SVG weather
  icons: clear, partly cloudy, cloudy, fog, and drizzle. Promoted them to the
  final weather-icon folder and recorded them in the production manifest.
- October 1, 2026: The Developer approved the remaining five original SVG weather
  icons: rain, freezing rain, snow, showers, and thunder. Promoted them to the
  final weather-icon folder. All ten weather icons are now complete in the
  production manifest.
- October 1, 2026: The Developer approved the first five original SVG reminder
  icons: umbrella, sun protection, water, wind/layer, and waterproof footwear.
  Promoted them to the final reminder-icon folder and recorded them in the
  production manifest.
- October 1, 2026: The Developer approved the thunder-safety reminder icon and
  rejected the optional music/weather decorative motif without replacement.
  Promoted the thunder icon, left the rejected motif only in candidates, and
  reduced the approved production inventory from 37 to 36 assets.
- October 1, 2026: Completed Checkpoint 1 verification: the manifest declares
  36 unique assets and all 36 exist; all 20 PNGs share a 1024 × 1536 canvas and
  transparent corners; all 16 SVGs parse successfully; the largest PNG is
  1.64 MiB. Developer visual review covered every promoted production asset.
- October 1, 2026: Completed Checkpoint 2 with a dependency-free static
  foundation: two semantic screens, responsive phone/laptop styling, native ES
  modules, a seven-day provider fixture, a PowerShell local server, and a
  browser-native automated suite. The suite returned 5/5 passes; Chrome
  screenshots verified both laptop screens and the phone forecast reflow. The
  optional PowerShell/Chrome headless wrapper remains environment-sensitive
  when Chrome already has a shared session, so the browser test page is the
  documented authoritative runner.
- October 1, 2026: Completed Checkpoint 3 with one pure recommendation module
  covering provider normalization, the 8 a.m.–6 p.m. representative apparent
  temperature, all five category boundaries, ten WMO icon groups, six reminder
  rules in safety-first order, concrete temperature/precipitation changes, and
  optional-versus-critical missing data. The browser suite passed 14/14 tests,
  including exact 12°F/11°F and category boundary checks.
- October 1, 2026: Implemented the Checkpoint 4 content, variation, persistence,
  and page integration: three outfits per category, independently seeded copy,
  working Fashion show overrides, newest-location replacement, rounded device
  coordinates, and shared Clear saved data behavior. Added nine browser tests
  for R8 and R18. The local server returned all modules successfully, but the
  checkpoint remains open until the 23-test browser suite is visibly verified;
  installed Chrome and Edge sessions did not produce a headless result image.
- October 1, 2026: Completed Checkpoint 4 verification after allowing the
  browser-native suite a full virtual-time budget. All 23/23 tests passed,
  including independently seeded content, three-step Fashion show cycling,
  return/reload persistence, category invalidation, newest-location replacement,
  two-decimal device-coordinate storage, and scoped clearing of app-owned data.
- October 1, 2026: Completed Checkpoint 5 with US-filtered Open-Meteo place/ZIP
  search, explicit selection for ambiguous results, activation-only browser
  geolocation, seven-day imperial forecasts in each place's local timezone,
  preserved-place retry, and plain-language loading/failure states. The full
  suite passed 29/29 tests. Live checks returned complete seven-day forecasts
  for Austin and Chicago, and a rendered Austin page showed current live values
  driving its date strip, weather summary, thermal outfit, and recommendation.
- October 1, 2026: Completed Checkpoint 6 with a live, one-column Outfit
  Forecast experience: compact location controls, horizontal seven-date strip,
  dominant character, deterministic layered weather accessories, forecast
  evidence, shared-state recommendation/reminders/Changes later, Fashion show,
  attribution, and a visible/announced affirmation response. The suite passed
  31/31 tests. A 500 CSS px phone-layout screenshot showed no clipped primary
  content; 375 px headless captures remain affected by Edge's approximately
  500 px minimum internal layout viewport and are retained only as a limitation
  record for the later real-device reflow check.
- October 1, 2026: Checkpoint 7 remains open at 34/35 tests. Automated iframe
  checks passed at the required phone, intermediate, and laptop widths for
  content order, 44 px controls, retained regions, and aligned laptop columns.
  At 320 px, Chromium still includes the intentionally horizontally scrollable
  seven-date strip's off-screen buttons in the root `scrollWidth`. Explicit
  inline-size containment and parent overflow clipping did not change that
  measurement, so work stopped after two approaches as required. The next pass
  must distinguish actual page scrolling from the date strip's intended nested
  scrolling before Checkpoint 7 can close.
- October 2, 2026: Completed Checkpoint 7 at 35/35 tests after replacing the
  misleading aggregate `scrollWidth` assertion with a direct root-page scroll
  behavior check. At 320 px the root page cannot move horizontally; only the
  intended seven-date control scrolls. Required phone/intermediate reflow,
  44 px targets, and aligned 1024/1365/1440 px laptop columns all passed.
- October 2, 2026: Completed Checkpoint 8 at 37/37 tests. The About screen now
  verifies every approved content group, Zehan and AI-assisted art credits,
  Open-Meteo/NWS/EPA links, privacy and model limitations, Clear saved data,
  return navigation, one-column 320 px reflow, and two-column laptop layout
  without root-page horizontal scrolling.
- October 2, 2026: Completed Checkpoint 9 at 41/41 tests with semantic landmark,
  heading, control-name, alternative-text, duplicate-ID, native-control, focus,
  live-region, reduced-motion, contrast, target-size, and reflow checks. Removed
  role overrides from dynamic native buttons and replaced loading-time disabling
  with `aria-busy`/read-only behavior so focused controls remain stable. A
  semantic screen-reader smoke audit found no known critical structure failure;
  real-device assistive-technology confirmation remains part of final testing.
- October 2, 2026: Completed Checkpoint 10 local release-candidate verification.
  The browser-native suite passed 41/41; every core local route returned HTTP
  200; the production manifest reported 36 declared, 36 unique, and zero
  missing assets; live Austin and Chicago requests succeeded; and the repository
  scan found no credential-like values. Added `verification.md` tracing R1–R21
  and excluded local headless-browser profiles from version control. R20 public
  deployment and R21 peer usability/revision remain intentionally pending.
- October 2, 2026: During final Developer review, aligned Use my location with
  Search inside the same control row, reduced the sunglasses and umbrella layer
  scale, retained the UV Index 3+ sunglasses eligibility rule, and removed the
  redundant “At a glance / This week” section. Updated R12 to match the approved
  information hierarchy. Repeat verification passed 44/44 browser-native tests,
  including explicit checks for the UV threshold, accessory scale, removed week
  overview, and desktop/phone location-control alignment.
- October 2, 2026: Follow-up visual review moved the umbrella beside the
  character, centered and slightly reduced the sunglasses over the eyes, and
  added a separate head anchor and scale for the sun visor. The browser-native
  regression suite remained at 44/44 passing tests.
- October 2, 2026: A second accessory review moved the sunglasses from the eyes
  to the top of the hair with a slight left/up adjustment and reduced the
  umbrella to 75% of its previous displayed scale. Repeat verification remained
  at 44/44 passing tests.

## Saving transcripts

At the end of planning, ask the Developer to enter `save transcript`. When directed, save the complete conversation as `transcripts/plan-YYYY-MM-DD_HHMMSS.md`, label chat messages `Developer` and `Agent`, and confirm the saved path.

At the end of every implementation chat, ask the Developer to enter `save transcript`. When directed, save the complete conversation as `transcripts/build-YYYY-MM-DD_HHMMSS.md` using the same formatting.
