# NeuroConvert Design System

> **Status:** v1.0 — built from brand specification (no Figma or codebase provided)
> **Source materials:** Brand brief provided via prompt. No external Figma links or codebase repos were attached.

---

## Company & Product Overview

**NeuroConvert** is a B2B SaaS platform in the neuromarketing space, focused on conversion-rate optimization. The product analyzes landing pages, checkout flows, and marketing assets through the lens of neuroscience and behavioral psychology, then delivers structured **laudos** (diagnostic reports) with a 0–100 score and actionable recommendations.

### Products / Surfaces

| Surface | Description |
|---|---|
| **Landing Page** | Public acquisition page — communicates scientific authority, showcases score samples, drives trial/demo CTAs |
| **User Dashboard** | Main app — shows laudos history, individual report detail, score breakdowns, subscription status |
| **Admin Panel** | Internal tool — financial metrics, user management, Stripe subscription data, MRR/churn dashboards |
| **Stripe Flow** | Subscription checkout, plan selection, billing management (Stripe-hosted + custom confirmation screens) |

### Target Audience
- E-commerce owners who want to improve conversion without a data team
- Marketing teams at mid-market companies
- Digital agencies managing multiple client accounts

### Core Concept: The Laudo (Report)
Every analysis produces a **Laudo** — a structured diagnostic report with:
- A **score 0–100** (the primary visual artifact of the product)
- **Category subscores** across dimensions like clarity, trust, urgency, visual hierarchy
- **Findings** classified by severity (critical, attention, good)
- **Recommendations** ranked by estimated impact

This report metaphor is central: the product behaves like a medical diagnostic tool, but for marketing.

---

## CONTENT FUNDAMENTALS

### Voice & Tone
NeuroConvert writes like a **senior consultant who happens to be a scientist** — precise, confident, and direct, but never cold or jargon-heavy without cause.

| Dimension | Approach |
|---|---|
| **Register** | Professional but conversational; never academic or bureaucratic |
| **Person** | "You" for users; "we" for the platform. Never "I" |
| **Tense** | Present tense for findings; past tense for analysis results |
| **Casing** | Sentence case throughout (not Title Case for UI labels) |
| **Punctuation** | Oxford comma; em-dashes for asides — not parentheses |
| **Numbers** | Always numeric (7, not seven); scores shown as integers |
| **Emoji** | Never used in product UI; potentially 1–2 in social/marketing copy only |

### Copy Patterns
- **Scores are facts, not opinions.** "Your score is 43" — not "We think your score might be around 43"
- **Severity language is clinical.** "Critical issue detected" not "Uh oh, something's wrong!"
- **Recommendations are direct imperatives.** "Add a trust badge above the CTA" not "You might want to consider adding..."
- **CTAs use action verbs with specificity.** "Analyze my landing page" not "Get started"

### Examples
```
❌ "Our AI-powered tool helps you boost conversions!"
✓  "NeuroConvert identifies the cognitive barriers preventing your visitors from converting."

❌ "Oops! Your score is low 😬"  
✓  "Score 31 — 3 critical issues require immediate attention."

❌ "Check it out now!"
✓  "Analyze your first page free."
```

---

## VISUAL FOUNDATIONS

### Color Philosophy
Dark, scientific, authoritative. The palette reads like a high-end analytics dashboard or medical imaging software — deep navy backgrounds, precise emerald accents, and a clear semantic color language for the score system.

**Backgrounds are always dark.** No light-mode variant exists in v1.

### Color System
| Role | Value | Usage |
|---|---|---|
| Background base | `#0F172A` | Page backgrounds, outer shells |
| Surface | `#1E293B` | Cards, sidebars, modals |
| Elevated | `#273548` | Dropdowns, popovers, input fills |
| Raised | `#2D3E52` | Hover states on surfaces |
| Border | `#2D3E52` | Default borders |
| Border strong | `#3D5068` | Emphasized borders, dividers |
| Primary | `#1D9E75` | CTAs, active states, primary actions, score accent |
| Primary light | `#25C98F` | Hover states, highlights |
| Primary dark | `#157A5B` | Pressed states |
| Primary muted | `#1D9E7520` | Ghost backgrounds, chips |
| Critical | `#EF4444` | Score 0–39, critical findings |
| Warning | `#F59E0B` | Score 40–69, attention findings |
| Good | `#22C55E` | Score 70–100, positive findings |
| Foreground 1 | `#F8FAFC` | Primary text |
| Foreground 2 | `#94A3B8` | Secondary text, labels |
| Foreground 3 | `#475569` | Disabled, placeholders |

### Score Color Semantics
The scoring system is the most visible UI element. Colors map strictly to ranges:
- **0–39** → Critical → `#EF4444` (red)
- **40–69** → Attention → `#F59E0B` (amber)
- **70–100** → Good → `#22C55E` (green)

### Typography
- **Display / Numbers / Scores**: `Space Grotesk` (weight 700) — heavy grotesque for big numerics
- **UI / Body / Labels**: `DM Sans` (weights 400, 500, 600) — clean, technical, legible at small sizes
- **Monospace / IDs / Code**: `JetBrains Mono` (weight 400, 500) — for report IDs, code snippets, raw values

**Scale:**
| Token | Size | Weight | Usage |
|---|---|---|---|
| `--text-score` | 72px | 700 | Score hero number |
| `--text-display` | 40px | 700 | Page titles |
| `--text-h1` | 28px | 600 | Section headers |
| `--text-h2` | 22px | 600 | Card headers |
| `--text-h3` | 18px | 500 | Sub-headers |
| `--text-body` | 14px | 400 | Body text |
| `--text-small` | 12px | 400 | Labels, captions |
| `--text-micro` | 11px | 500 | Tags, badges |

### Spacing System
Base unit: **4px**. Scale: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96.

### Corner Radii
| Token | Value | Usage |
|---|---|---|
| `--radius-sm` | 6px | Badges, chips, small buttons |
| `--radius-md` | 10px | Cards, inputs, modals |
| `--radius-lg` | 16px | Large cards, panels |
| `--radius-xl` | 24px | Full-bleed sections, hero |
| `--radius-full` | 9999px | Pills, score gauges |

### Shadows & Elevation
- **Level 0**: No shadow (flat surfaces)
- **Level 1**: `0 1px 3px rgba(0,0,0,0.4)` (cards on background)
- **Level 2**: `0 4px 16px rgba(0,0,0,0.5)` (modals, elevated panels)
- **Level 3**: `0 8px 32px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)` (popovers, dropdowns)
- **Glow (primary)**: `0 0 20px rgba(29,158,117,0.3)` (score gauges, CTA hovers)

### Cards
Cards use:
- Background: `--color-bg-surface` (#1E293B)
- Border: 1px solid `--color-border`
- Border radius: `--radius-md` (10px)
- Padding: 20–24px
- Shadow: Level 1
- **Accent variant**: Left border of 3px in the semantic score color — used for finding cards

### Animation & Motion
- **Easing**: `cubic-bezier(0.16, 1, 0.3, 1)` — snappy out, smooth settle (expo-out feel)
- **Duration**: 150ms for micro-interactions (hovers, button states); 300ms for panel transitions; 600ms for score reveal animations
- **Score gauge fill**: Animated on mount, 800ms ease-out
- **Page transitions**: Fade + slight Y translate (8px → 0)
- **No bounce or spring animations** — the brand is clinical, not playful

### Hover / Press States
- **Buttons**: Lighten primary on hover (`--primary-light`); scale(0.97) + darken on press
- **Cards**: Subtle border brighten + `--color-raised` background
- **Nav items**: `--primary-muted` background tint
- **Destructive**: Hover to `#DC2626`; press to `#B91C1C`

### Backgrounds & Textures
- Pure flat dark navy — no textures, no gradients on backgrounds
- Subtle radial gradient on marketing hero: `radial-gradient(ellipse at top, #1D9E7514 0%, transparent 60%)`
- No background images in the app; landing page may use abstract neural-network-style SVG line art (fine strokes only)

### Imagery
- **App**: No photography. Data visualizations, charts, and illustrations only.
- **Landing page**: High-contrast product screenshots in device frames; abstract scientific line-art backgrounds
- **Color grading**: Cool-toned, desaturated — images should feel precise and analytical, not warm or lifestyle

### Transparency & Blur
- Backdrop blur (`blur(12px)`) used sparingly for modals and sticky nav on scroll
- Frosted glass effect on nav: `background: rgba(15, 23, 42, 0.85); backdrop-filter: blur(12px)`
- Never used decoratively — only for layering context

---

## ICONOGRAPHY

Icons follow a **Lucide Icons** style: 2px stroke weight, rounded line caps, 24×24 default size. The brand does NOT use filled icons — outline only.

| Context | Usage |
|---|---|
| Navigation sidebar | 20×20, stroke #94A3B8 (fg2); active: #1D9E75 |
| Card actions | 16×16, stroke #94A3B8 |
| Status indicators | 16×16 with semantic color stroke |
| CTA decoration | 20×20 as inline accent |
| Empty states | 48×48, stroke #475569 (fg3) |

**CDN:** Lucide icons are loaded via `https://unpkg.com/lucide@latest/dist/umd/lucide.min.js`

No icon font or sprite — icons are inline SVG rendered by Lucide's JS library at runtime, or embedded inline as `<svg>` in JSX components.

**No emoji used anywhere in the product UI.**

---

## FILE INDEX

```
/
├── README.md                  ← You are here; full design system docs
├── SKILL.md                   ← Agent skill manifest
├── colors_and_type.css        ← All CSS custom properties (import this)
├── assets/
│   ├── logo.svg               ← NeuroConvert wordmark (dark bg)
│   ├── logo-icon.svg          ← Icon mark only
│   └── icons/                 ← Copied Lucide SVGs for key icons
├── fonts/                     ← (Google Fonts — linked via CDN; no local files)
├── preview/                   ← Design system card previews
│   ├── colors-primary.html
│   ├── colors-semantic.html
│   ├── colors-surface.html
│   ├── type-display.html
│   ├── type-ui.html
│   ├── type-scale.html
│   ├── spacing-tokens.html
│   ├── radius-shadow.html
│   ├── comp-buttons.html
│   ├── comp-badges.html
│   ├── comp-inputs.html
│   ├── comp-score-gauge.html
│   ├── comp-severity-bar.html
│   ├── comp-cards.html
│   └── comp-nav.html
└── ui_kits/
    ├── landing/               ← Public acquisition landing page
    │   ├── README.md
    │   ├── index.html
    │   └── *.jsx
    ├── dashboard/             ← User-facing app (laudos, history)
    │   ├── README.md
    │   ├── index.html
    │   └── *.jsx
    └── admin/                 ← Internal admin panel
        ├── README.md
        ├── index.html
        └── *.jsx
```
