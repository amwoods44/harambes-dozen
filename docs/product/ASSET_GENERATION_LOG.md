# Harambe's Dozen V2 Asset Generation Log

This log records generated or materially edited visual assets so their source,
intent, and approval state remain auditable. A generated asset is not an approved
baseline until Aaron explicitly approves the capture in which it appears.

## ASSET-TROPHY-001 — Real trophy studio treatment

- Status: candidate used by the G1 specimen; awaiting approval.
- Method: OpenAI built-in image generation, precise object-edit workflow.
- Authoritative source: Aaron's photograph of the real Harambe's Dozen trophy at
  `/var/folders/bl/7lqm4xt17lq24dwql9fcgtv00000gn/T/codex-clipboard-2203bb9e-ee5a-48ec-8249-2dba06e7b9e0.jpg`.
- Visual-context sources: the approved light and dark Home references supplied in
  the product interview.
- Generated source:
  `/Users/aaronwoods/.codex/generated_images/019fe467-453e-73e0-9819-adc74316652b/exec-af49a379-86e9-4da9-9a33-dea12ad6d02f.png`.
- Project asset: `v2/public/assets/real-trophy-studio-v1.png`.
- Intended use: Records Vault, champion/award surfaces, and other places where the
  real league trophy is represented.

### Prompt

> Use case: precise-object-edit
>
> Asset type: reusable championship trophy image for a premium fantasy-football
> league companion website.
>
> Input images: The real-world smartphone photo showing a hand holding a gold
> two-handled fantasy football trophy is the edit target and the authoritative
> object reference. The two Harambe's Dozen interface mockups are visual-context
> references only.
>
> Primary request: Create a faithful, professionally photographed studio
> presentation of the exact real trophy from the smartphone photo. Preserve its
> recognizable proportions: a fairly large but not enormous polished gold cup,
> ornate two handles, narrow central stem, flared gold lower body, wide black
> stepped base, and black-and-gold plaque. Reconstruct only the cropped-off top
> naturally; remove the hand, kitchen, reflections of the photographer, and all
> room clutter.
>
> Scene/backdrop: deep matte navy sports-trophy archive, softly vignetted, with
> enough clean separation that CSS can crop it on light or dark cards.
>
> Style/medium: realistic editorial product photography, not illustration, not a
> fantasy prop, not a generic championship cup.
>
> Composition/framing: complete trophy centered, full base visible, generous
> breathing room, straight-on eye-level view.
>
> Lighting/mood: restrained museum-case lighting, soft gold highlights, accurate
> reflective metal, grounded and believable.
>
> Text: preserve the plaque layout and legible wording as closely as possible:
> "FANTASY FOOTBALL LEAGUE" / "CHAMPION" / "Harambe's Dozen" with three stars.
> Do not invent other words.
>
> Constraints: the trophy must unmistakably match the supplied physical trophy;
> preserve the black base and real two-handle cup silhouette; no people; no hands;
> no NFL logos; no watermark.
>
> Avoid: giant Super Bowl-style trophy, ornate royal chalice, video-game trophy,
> movie-poster drama, casino styling, excessive glow, extra badges, extra text.

## ASSET-MANAGER-AWOODS-001 — A.Woods editorial portrait prototype

- Status: candidate used by the G1 specimen; awaiting approval.
- Method: OpenAI built-in image generation, precise portrait treatment.
- Authoritative source: the full-size Sleeper avatar for member
  `393634863552425984`, captured at `/private/tmp/awoods-sleeper-avatar.png`.
- Generated source:
  `/Users/aaronwoods/.codex/generated_images/019fe467-453e-73e0-9819-adc74316652b/exec-2c140b4c-5f46-4e35-b64d-cc01d7af9997.png`.
- Project asset: `v2/public/assets/manager-awoods-editorial-v1.png`.
- Intended use: prove the illustrated/headshot treatment in G1. The remaining
  eleven portraits are not generated until this treatment is approved.

### Prompt

> Use case: precise portrait treatment. Create a premium fantasy-football
> franchise manager portrait from the supplied square Sleeper avatar. Preserve
> the exact recognizable person, facial expression, haircut, dark suit, white
> shirt, and pink tie/flower so the source avatar's Sergio Dipp joke remains
> immediately recognizable to the league. Remove the microphone, broadcast
> lower-third, ESPN branding, background people, and all text. Reframe as a clean
> chest-up, straight-on sports media-day portrait. Visual system: Harambe's Dozen
> editorial sports almanac; realistic screenprint/engraved photographic treatment
> with restrained navy, warm cream, antique gold, and a very small red accent;
> subtle stadium-light grain; crisp face; strong silhouette. Square 1:1
> composition with generous headroom, designed to crop into both a circular
> manager avatar and a rectangular franchise card. No badge, no logo, no words,
> no gorilla, no fantasy or video-game styling, no cinematic poster drama, no
> watermark.
