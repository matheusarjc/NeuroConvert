---
name: neuroconvert-design
description: Use this skill to generate well-branded interfaces and assets for NeuroConvert, a B2B SaaS neuromarketing platform for conversion optimization. Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for prototyping all three surfaces: landing page, user dashboard, and admin panel.
user-invocable: true
---

Read the README.md file within this skill, and explore the other available files.

If creating visual artifacts (slides, mocks, throwaway prototypes, etc), copy assets out and create static HTML files for the user to view. If working on production code, you can copy assets and read the rules here to become an expert in designing with this brand.

If the user invokes this skill without any other guidance, ask them what they want to build or design, ask some questions, and act as an expert designer who outputs HTML artifacts _or_ production code, depending on the need.

## Quick reference

**Colors**
- Background: `#0F172A` (navy) / Surface: `#1E293B` (slate)
- Primary: `#1D9E75` (emerald) / Light: `#25C98F` / Dark: `#157A5B`
- Critical: `#EF4444` · Warning: `#F59E0B` · Good: `#22C55E`
- Text: `#F8FAFC` / Secondary: `#94A3B8` / Muted: `#475569`

**Fonts** (Google Fonts CDN)
- Display/Scores: `Space Grotesk` 700
- UI/Body: `DM Sans` 400/500/600
- Mono/IDs: `JetBrains Mono` 400/500

**Radii**: 6px (sm) · 10px (md) · 16px (lg) · 9999px (pill)

**Score ranges**: 0–39 critical (#EF4444) · 40–69 warning (#F59E0B) · 70–100 good (#22C55E)

**Icons**: Lucide, 2px stroke, outline only. No emoji in product UI.

**Voice**: Precise like a medical report, accessible like a marketing consultant. Sentence case. Direct imperatives for recommendations.

## CSS import
```html
<link rel="stylesheet" href="colors_and_type.css">
```

## UI Kits
- `ui_kits/landing/index.html` — Public acquisition landing page
- `ui_kits/dashboard/index.html` — User app (laudos, history, new analysis)
- `ui_kits/admin/index.html` — Internal admin panel (MRR, users, subscriptions)
