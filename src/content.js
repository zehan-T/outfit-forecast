export const outfitsByCategory = Object.freeze({
  hot: [
    { id: "hot-a", image: "assets/characters/final/character-hot-a.png", alt: "Character wearing a midnight-navy blouse and ivory pleated skirt", heading: "A crisp look for the heat", summary: "A breathable blouse and airy pleats keep the silhouette polished without adding weight." },
    { id: "hot-b", image: "assets/characters/final/character-hot-b.png", alt: "Character wearing a muted-coral sleeveless blouse and champagne tailored shorts", heading: "Tailored, light, and ready to move", summary: "A sleeveless top and tailored shorts make a light campus look for the warmest hours." },
    { id: "hot-c", image: "assets/characters/final/character-hot-c.png", alt: "Character wearing a pearl-white top and pistachio wide-leg trousers", heading: "Soft color for a sunny day", summary: "A light top and fluid trousers balance sun coverage with an easy summer feel." }
  ],
  warm: [
    { id: "warm-a", image: "assets/characters/final/character-warm-a.png", alt: "Character wearing an ivory tailored waistcoat and caramel wide-leg trousers", heading: "Light tailoring for a warm day", summary: "A fitted waistcoat and flowing trousers feel refined while keeping the layers minimal." },
    { id: "warm-b", image: "assets/characters/final/character-warm-b.png", alt: "Character wearing a midnight-navy top and champagne satin midi skirt", heading: "A graceful warm-weather pairing", summary: "A simple top and satin midi skirt give the day an elevated but comfortable rhythm." },
    { id: "warm-c", image: "assets/characters/final/character-warm-c.png", alt: "Character wearing a sage-green square-neck fit-and-flare midi dress", heading: "An easy dress for gentle warmth", summary: "The breathable fit-and-flare shape stays comfortable from the walk to class through rehearsal." }
  ],
  mild: [
    { id: "mild-a", image: "assets/characters/final/character-mild-a.png", alt: "Character wearing an ivory long-sleeve blouse and indigo wide-leg jeans", heading: "A clean layer for a mild day", summary: "A long sleeve and relaxed denim offer comfortable coverage without feeling heavy." },
    { id: "mild-b", image: "assets/characters/final/character-mild-b.png", alt: "Character wearing a cropped camel trench, navy top, and cream trousers", heading: "Polished layers for a full day", summary: "A light jacket and tailored trousers handle a mild morning without feeling heavy later." },
    { id: "mild-c", image: "assets/characters/final/character-mild-c.png", alt: "Character wearing a forest-green cropped jacket, champagne shell, and espresso midi skirt", heading: "Rich tones, light layers", summary: "A cropped jacket over a light base layer is easy to adjust between outdoor walks and indoor rooms." }
  ],
  cool: [
    { id: "cool-a", image: "assets/characters/final/character-cool-a.png", alt: "Character wearing a camel cropped jacket, navy turtleneck, and burgundy wide-leg trousers", heading: "Warm layers with room to move", summary: "A fine knit and short jacket add warmth while wide-leg trousers keep the look relaxed." },
    { id: "cool-b", image: "assets/characters/final/character-cool-b.png", alt: "Character wearing a forest-green wool jacket, ivory cable-knit sweater, brown corduroy trousers, and ankle boots", heading: "Texture for a cooler campus day", summary: "Wool, cable knit, and corduroy build practical warmth in a coordinated palette." },
    { id: "cool-c", image: "assets/characters/final/character-cool-c.png", alt: "Character wearing a charcoal cropped coat, asymmetric plum knit dress, dark tights, and knee-high boots", heading: "A dramatic knit with warm coverage", summary: "The knit dress, tights, coat, and tall boots make a composed cooler-weather ensemble." }
  ],
  cold: [
    { id: "cold-a", image: "assets/characters/final/character-cold-a.png", alt: "Character wearing a burgundy double-breasted coat, blush sweater, charcoal pleated skirt, and knee-high boots", heading: "A confident cold-weather layer", summary: "A structured coat, knit base, tights, and tall boots provide coverage for a cold walk to campus." },
    { id: "cold-b", image: "assets/characters/final/character-cold-b.png", alt: "Character wearing a camel cape coat, navy mock-neck sweater, chocolate trousers, and oxblood ankle boots", heading: "Classic layers for colder air", summary: "A cape coat over a close knit leaves room to move while the full-length trousers hold warmth." },
    { id: "cold-c", image: "assets/characters/final/character-cold-c.png", alt: "Character wearing a muted-teal shearling jacket, tonal ivory sweater and midi skirt, and charcoal knee-high boots", heading: "Soft winter color, serious warmth", summary: "Shearling, a warm knit, and tall boots create a tonal outfit suited to a cold day." }
  ]
});

export const reminderWording = Object.freeze({
  umbrella: [
    ({ probability }) => `Bring an umbrella — precipitation reaches ${probability}%.`,
    ({ probability }) => `Keep an umbrella close for a ${probability}% precipitation chance.`,
    ({ probability }) => `${probability}% precipitation is possible, so pack an umbrella.`
  ],
  "sun-protection": [
    ({ uv }) => `UV Index ${uv}: use sunscreen and protect exposed skin.`,
    ({ uv }) => `Plan for sun protection today; the UV Index reaches ${uv}.`,
    ({ uv }) => `With UV at ${uv}, bring shade for your face and protect exposed skin.`
  ],
  hydration: [
    ({ apparentMax }) => `It may feel like ${apparentMax}°F — carry water and take hydration breaks.`,
    ({ apparentMax }) => `Hydration matters when it feels as warm as ${apparentMax}°F.`,
    ({ apparentMax }) => `Pack water for a campus-day high near ${apparentMax}°F feels-like.`
  ],
  "wind-layer": [
    ({ gustMax }) => `Gusts may reach ${gustMax} mph; choose a secure outer layer.`,
    ({ gustMax }) => `Add a wind-resistant layer for gusts up to ${gustMax} mph.`,
    ({ gustMax }) => `${gustMax} mph gusts favor a close-fitting jacket or scarf.`
  ],
  "waterproof-footwear": [
    () => "Snow or freezing precipitation is possible; wear waterproof shoes with traction.",
    () => "Choose waterproof, grippy footwear for possible snow or ice.",
    () => "Protect your feet from wintry precipitation with waterproof traction soles."
  ],
  "thunder-safety": [
    () => "Thunder is possible. Move indoors to a substantial building or hard-topped vehicle when it is nearby.",
    () => "If thunder is nearby, go indoors to a substantial building or hard-topped vehicle.",
    () => "Plan to move indoors — use a substantial building or hard-topped vehicle when thunder approaches."
  ]
});

export const changesLaterWording = Object.freeze({
  temperature: [
    ({ minimum, maximum }) => `Feels-like temperatures shift from ${minimum}°F to ${maximum}°F; keep a removable layer nearby.`,
    ({ minimum, maximum }) => `The day spans ${minimum}°F–${maximum}°F feels-like, so dress in layers you can adjust.`,
    ({ difference }) => `A ${difference}° feels-like swing favors one light layer you can add or remove.`
  ],
  precipitation: [
    ({ morningMaximum, afternoonMaximum }) => `Precipitation rises from ${morningMaximum}% this morning to ${afternoonMaximum}% after noon.`,
    ({ afternoonMaximum }) => `The morning starts drier, but precipitation reaches ${afternoonMaximum}% later today.`,
    ({ morningMaximum, afternoonMaximum }) => `Plan for a wetter afternoon: the chance climbs from ${morningMaximum}% to ${afternoonMaximum}%.`
  ]
});

export function validateContentInventory() {
  const categoriesComplete = Object.values(outfitsByCategory).every((outfits) => outfits.length === 3);
  const remindersComplete = Object.values(reminderWording).every((choices) => choices.length >= 3);
  const changesComplete = Object.values(changesLaterWording).every((choices) => choices.length >= 3);
  return categoriesComplete && remindersComplete && changesComplete;
}
