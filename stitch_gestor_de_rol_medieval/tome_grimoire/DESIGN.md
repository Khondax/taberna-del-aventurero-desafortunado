---
name: Tome & Grimoire
colors:
  surface: '#fef9f0'
  surface-dim: '#ded9d1'
  surface-bright: '#fef9f0'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f8f3ea'
  surface-container: '#f2ede4'
  surface-container-high: '#ece8df'
  surface-container-highest: '#e7e2d9'
  on-surface: '#1d1c16'
  on-surface-variant: '#574240'
  inverse-surface: '#32302a'
  inverse-on-surface: '#f5f0e7'
  outline: '#8a716f'
  outline-variant: '#ddc0bd'
  surface-tint: '#a43b37'
  primary: '#5b0309'
  on-primary: '#ffffff'
  primary-container: '#7a1c1c'
  on-primary-container: '#ff8981'
  inverse-primary: '#ffb3ad'
  secondary: '#815500'
  on-secondary: '#ffffff'
  secondary-container: '#fec169'
  on-secondary-container: '#764e00'
  tertiary: '#422200'
  on-tertiary: '#ffffff'
  tertiary-container: '#5d370e'
  on-tertiary-container: '#d8a06e'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdad7'
  primary-fixed-dim: '#ffb3ad'
  on-primary-fixed: '#410004'
  on-primary-fixed-variant: '#842322'
  secondary-fixed: '#ffddb2'
  secondary-fixed-dim: '#f8bc64'
  on-secondary-fixed: '#291800'
  on-secondary-fixed-variant: '#624000'
  tertiary-fixed: '#ffdcc0'
  tertiary-fixed-dim: '#f6bb87'
  on-tertiary-fixed: '#2d1600'
  on-tertiary-fixed-variant: '#653d14'
  background: '#fef9f0'
  on-background: '#1d1c16'
  surface-variant: '#e7e2d9'
typography:
  display:
    fontFamily: EB Garamond
    fontSize: 48px
    fontWeight: '600'
    lineHeight: 56px
    letterSpacing: -0.01em
  display-mobile:
    fontFamily: EB Garamond
    fontSize: 36px
    fontWeight: '600'
    lineHeight: 42px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: EB Garamond
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.005em
  headline-lg-mobile:
    fontFamily: EB Garamond
    fontSize: 26px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: 0em
  headline-md:
    fontFamily: EB Garamond
    fontSize: 24px
    fontWeight: '500'
    lineHeight: 30px
  headline-sm:
    fontFamily: EB Garamond
    fontSize: 20px
    fontWeight: '500'
    lineHeight: 26px
  title-lg:
    fontFamily: Hanken Grotesk
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  title-md:
    fontFamily: Hanken Grotesk
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 22px
  body-lg:
    fontFamily: Hanken Grotesk
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Hanken Grotesk
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Hanken Grotesk
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-md:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0.04em
  stat-value:
    fontFamily: JetBrains Mono
    fontSize: 22px
    fontWeight: '700'
    lineHeight: 24px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  space-2xs: 0.125rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
  space-2xl: 3rem
  space-3xl: 4rem
  grid-margin-mobile: 1rem
  grid-margin-desktop: 2.5rem
  grid-gutter: 1rem
---

## Brand & Style

The design system merges classical medieval illuminated manuscripts with high-density contemporary utility. It avoids heavy-handed skeuomorphism and kitsch in favor of an archival, scholarly aesthetic: illuminated editorial clarity, crisp geometric hierarchy, and warm, tactile materials distilled into clean web ergonomics. 

The emotional tone is immersive, disciplined, and dependable—evoking the gravitas of ancient tomes, historical cartography, and brass astrolabes without compromising instantaneous data consumption during fast-paced tabletop encounters. Visual elements balance ceremonial majesty with utilitarian speed.

## Colors

The palette is rooted in archival parchment and bookbinding materials:
- **Primary (`#7A1C1C` / Garnet):** Derived from rubricated script and archival sealing wax. Used for key active states, vital action points, danger signals, and active markers.
- **Secondary (`#B07D2B` / Antique Brass):** Sourced from patinated metal clasps and illuminated gold-leaf trim. Dictates interactive hover states, highlights, ratings, and elevated insignias.
- **Tertiary (`#8C5E32` / Burnished Leather):** Represents bound leather spines and brass filigree accents; deployed for structural division, categorical badging, and contextual accents.
- **Neutral (`#F4EFE6` / Vellum Parchment):** The foundation base layer. Evokes treated calfskin and warm fibrous paper, paired with deep iron gall ink (`#1E1815`) for high-contrast, WCAG AAA-compliant reading legibility.
- **Surface Elevation Steps:**
  - Base Ground (Page Canvas): `#F4EFE6`
  - Container / Sheet Surface: `#FAF6F0`
  - Elevated Popover / Drawer: `#FFFFFF`
  - Inset Well / Stat Block Field: `#EDE5D8`

## Typography

The typographical architecture splits three responsibilities across distinct typefaces:
1. **Headlines & Narrative (EB Garamond):** Brings bookish refinement, literary authority, and historical resonance to chapter headers, lore passages, and character names. Small-caps styles should be applied to section subtitles.
2. **Body & Descriptive Interface (Hanken Grotesk):** Provides maximum legibility for spell descriptions, inventory logs, and rule texts. Avoids fatigue over extended reading sessions with low stroke contrast and open apertures.
3. **Values, Attributes & Dice (JetBrains Mono):** Monospaced numeric alignment guarantees dice modifiers (`+5`, `-2`), hit dice, armor class, and spell slots remain strictly aligned in tables, grid arrays, and combat trackers.

## Layout & Spacing

The layout operates on a strict 8px base grid, expanding to a 12-column modular framework on desktop and 4 columns on mobile. 

- **Desktop (1280px+):** Employs an asymmetric triple-pane workbench model reminiscent of an open campaign binder. Left rail: Persistent campaign/party roster (3 columns). Center: Live combat tracking or active encounter sheets (6 columns). Right: Quick reference, dice roller, and spell compendium (3 columns).
- **Tablet (768px - 1279px):** Two-pane layout with collapsible drawer navigation. Main sheet remains dominant.
- **Mobile (< 768px):** Single-column stacked stream. Persistent bottom action dock houses critical quick-cast shortcuts, turn advances, and dice rolls.
- **Data Density:** Dense modular layouts apply `space-xs` and `space-sm` for combat matrices and spell lists; narrative lore and adventure logs relax spacing to `space-lg` and `space-xl` for editorial pacing.

## Elevation & Depth

Visual hierarchy uses physical sheet layering and warm, diffuse shadow casting rather than pure digital dropshadows:
- **Tonal Layering:** The primary canvas sits at the base `#F4EFE6`. Interactive panels use a warmer, slightly brighter `#FAF6F0` bound by crisp structural hairline borders (`1px solid #D8CEBE`).
- **Filigree Insets:** Active components, cards, and modal panels feature a dual-stroke boundary: an outer border of `#D8CEBE` paired with an inner inset rule (`1px inset #EADFCF`) offset by `2px` to evoke debossed leatherwork or framed book plates.
- **Warm Umber Shadows:**
  - **Flat / Resting:** `0 1px 3px rgba(45, 30, 15, 0.06), 0 1px 2px rgba(45, 30, 15, 0.04)`
  - **Elevated / Hover:** `0 4px 12px rgba(45, 30, 15, 0.08), 0 2px 4px rgba(45, 30, 15, 0.04)`
  - **Floating / Overlay / Dialog:** `0 16px 32px -4px rgba(35, 20, 10, 0.16), 0 4px 8px -2px rgba(35, 20, 10, 0.06)`

## Shapes

The design uses soft, deliberate corner shaping (`0.25rem` / `rounded-sm` base) to reflect hand-cut parchment, archival vellum cards, and brass metal corners. 

Elements avoid extreme pill rounding or exaggerated bubbles to maintain the grounded, historical weight of physical campaign manuals. Small decorative notch treatments or 45-degree chamfered corner clips (`2px` to `4px`) are used on stat-block cards, spell level indicators, and character portrait frames to provide subtle reinforcement reminiscent of bound book corners.

## Components

### Buttons
- **Primary (Garnet Action):** Solid `#7A1C1C` background, `#FAF6F0` text, subtle 1px border of `#5E1414`. Hover darkens to `#661515` with a warm glow. Font is `Hanken Grotesk` Medium uppercase (`0.05em` letter-spacing).
- **Secondary (Brass Crest):** Parchment surface (`#FAF6F0`) with a prominent `#B07D2B` border, text in `#1E1815`. Hover state applies `#F2ECE0` background with brass edge brightening.
- **Tertiary / Ghost:** No background; text in `#8C5E32`. Hover applies `#EDE5D8` background with `0.25rem` radius.

### Input Fields & Selects
- Background of `#EDE5D8` (inset well).
- Border: `1px solid #D8CEBE`. Text: `#1E1815` in `Hanken Grotesk` (or `JetBrains Mono` for stat counters).
- Focus state creates an amber brass outline (`1px solid #B07D2B`) with an umber inner shadow (`inset 0 1px 2px rgba(0,0,0,0.05)`).

### Cards & Stat Blocks
- Modular panels on `#FAF6F0` surface.
- Double-lined subtle header separator in `#D8CEBE`.
- Section titles set in `EB Garamond` semibold with small decorative diamond glyphs (`◆`) flanking key section headings.
- Metric values (HP, AC, Initiative) are housed in recessed square boxes with `JetBrains Mono` bold values.

### Chips & Badges
- Compact tags with `0.25rem` border radius.
- Spell school / damage type badges feature subtle tinted backgrounds (e.g., `#7A1C1C15` for Evocation/Fire) with an integrated `1px` border and `label-sm` monospaced text.

### Checkboxes & Radio Controls
- Checkboxes: `16px` square with `2px` rounded edges. Unchecked state is `#EDE5D8` with `#C8BCAB` border. Checked state is solid `#7A1C1C` displaying an illuminated cross-hatch or check icon in `#FAF6F0`.
- Radio Buttons: Diamond or circular shape with an amber brass ring and solid garnet central core when active.

### Tables & Data Grids
- Alternating row zebra banding with `#FAF6F0` and `#F5EFE4`.
- Column headers set in `JetBrains Mono` uppercase `label-sm` with bottom border `2px solid #D8CEBE`.
- Cell dividers use hairline rules (`1px solid #EAE2D5`) with strict numeric right-alignment for bonus dice and resource counts.

### Specialized TTRPG Components
- **Dice Result Rollouts:** Inset notification drawer with glowing brass numbers, monospaced modifier breakdowns (`1d20 [14] + 5 = 19`), and garnet critical hit highlights.
- **Spell Slot Trackers:** A row of modular diamond pips that toggle between empty parchment outlines and filled brass/garnet states.