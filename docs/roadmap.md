# Roadmap

**Non-binding.** Items are plausible extensions; none are promised. Order is not priority.

## Near-term (still frontend-only)

- [ ] **More speak sentences** per category, or new lightweight categories (night bus, hospital, part-time interview).  
- [ ] **Adjustable pass threshold** exposed as a dev/demo slider (not for end users unless copy explains tradeoffs).  
- [ ] **Reduced-motion** respect: gate `animate-pulse` / `ping` behind `prefers-reduced-motion`.  
- [ ] **CI workflow** — `pnpm lint` + `pnpm build` on pull requests.

## Medium-term (still no required backend)

- [ ] **Sharable result cards** — static PNG/SVG export from canvas or `html-to-image` (evaluate bundle cost).  
- [ ] **More scenario content** — new `Scenario` entries with fresh NPC voices.  
- [ ] **Mobile polish pass** — landscape speak layout, safe-area padding audit.

## Heavier lifts (need design + possibly server)

- [ ] **Real pronunciation or prosody scoring** — browser SR transcript is not enough; would need extra SDK or server-side audio model + privacy review.  
- [ ] **LLM-generated reactions** — replace static `reaction` strings; requires API keys, caching, moderation, latency UX.  
- [ ] **Multiplayer / async challenge** — accounts or anonymous codes, sync layer, abuse controls.

## Explicit non-goals (until someone argues otherwise)

- Turning this repo into a generic “English LMS” with grades, teacher dashboards, and compliance reporting.  
- Shipping auth + database **just because** it feels “more real.”

Update this file when the team actually ships or rejects a direction.
