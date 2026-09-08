---
name: Sacred Assembly
colors:
  surface: '#f9f9ff'
  surface-dim: '#cbdaff'
  surface-bright: '#f9f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f1f3ff'
  surface-container: '#e9edff'
  surface-container-high: '#e0e8ff'
  surface-container-highest: '#d8e2ff'
  on-surface: '#031b3e'
  on-surface-variant: '#45474c'
  inverse-surface: '#1c3054'
  inverse-on-surface: '#edf0ff'
  outline: '#75777d'
  outline-variant: '#c5c6cd'
  surface-tint: '#535f75'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#101c2f'
  on-primary-container: '#78849c'
  inverse-primary: '#bbc7e0'
  secondary: '#5f5f5a'
  on-secondary: '#ffffff'
  secondary-container: '#e1e0da'
  on-secondary-container: '#63635e'
  tertiary: '#755b00'
  on-tertiary: '#ffffff'
  tertiary-container: '#cea72c'
  on-tertiary-container: '#4f3d00'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d7e3fd'
  primary-fixed-dim: '#bbc7e0'
  on-primary-fixed: '#101c2f'
  on-primary-fixed-variant: '#3c475c'
  secondary-fixed: '#e4e2dd'
  secondary-fixed-dim: '#c8c6c1'
  on-secondary-fixed: '#1b1c19'
  on-secondary-fixed-variant: '#474743'
  tertiary-fixed: '#ffe08e'
  tertiary-fixed-dim: '#ecc246'
  on-tertiary-fixed: '#241a00'
  on-tertiary-fixed-variant: '#584400'
  background: '#f9f9ff'
  on-background: '#031b3e'
  surface-variant: '#d8e2ff'
typography:
  display-lg:
    fontFamily: Fraunces
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Fraunces
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
  headline-lg-mobile:
    fontFamily: Fraunces
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
  title-md:
    fontFamily: Fraunces
    fontSize: 24px
    fontWeight: '500'
    lineHeight: 32px
  body-lg:
    fontFamily: Work Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Work Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-sm:
    fontFamily: IBM Plex Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.05em
  numeric-md:
    fontFamily: IBM Plex Mono
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  sidebar-width: 16rem
  gutter: 1.5rem
  margin-mobile: 1rem
  margin-desktop: 2.5rem
  stack-sm: 0.5rem
  stack-md: 1rem
  stack-lg: 2rem
---

## Brand & Style

The design system is built on a "Modern Liturgical" aesthetic—a blend of timeless reverence and contemporary utility. It serves a community-focused audience, balancing the weight of tradition with the accessibility of modern technology. 

The style is **Neo-Classical / Minimalist**, characterized by high-contrast serif typography, generous whitespace, and a "parchment and ink" color foundation. It avoids the coldness of corporate SaaS by introducing organic tones (clay and leaf) and tactile elements like the "woven-rule" divider. The emotional response is one of calm, focus, and communal belonging.

Key stylistic markers:
- **Serif Dominance:** High-character headlines provide an editorial feel.
- **Subtle Tactility:** Soft, low-opacity shadows and fine borders suggest physical layers of paper and stone.
- **Sacred Geometry:** A strict 8px grid system ensures order and harmony.

## Colors

The palette is derived from natural, historical pigments. 

- **Ink (950, 900, 800):** The primary structural color. It acts as the "black" but with a deep navy warmth to maintain depth.
- **Parchment (50, 100):** The primary background surface, providing a softer, more readable alternative to pure white.
- **Gold (500):** Used sparingly for ornamentation, active states, and the "woven-rule" divider.
- **Clay & Leaf:** Functional accents used for semantic states or categorical differentiation (e.g., events vs. small groups).

**Dark Mode Behavior:**
When the system shifts to dark mode, the hierarchy inverts. The `ink-950` becomes the primary background, while `parchment-50` is reserved for high-contrast typography. Surface containers shift to `ink-900` to maintain a subtle lift from the background.

## Typography

This design system utilizes a trio of typefaces to establish a clear hierarchy of information:

1.  **Fraunces (Titles):** A soft-serif with variable weights. Use for all headlines and significant titles. It provides the "voice" of the design system.
2.  **Work Sans (Body):** A highly legible sans-serif. Used for all long-form reading, UI labels, and navigation items.
3.  **IBM Plex Mono (Numbers/Labels):** A monospaced font used for data, dates, and small metadata labels to provide a "cataloged" or "archival" feel.

**Woven-Rule:** Every `headline-lg` or `title-md` in a primary content area should be accompanied by a 1px `gold-500` horizontal rule positioned 8px below the baseline of the text.

## Layout & Spacing

The layout is structured around a **Fixed Sidebar / Fluid Content** model for desktop and a **Bottom-Nav / Top-Bar** model for mobile.

- **Sidebar:** Fixed at 256px (`w-64`). In light mode, it uses `bg-ink-950` with `parchment-50` text to create a strong vertical anchor.
- **Content Area:** Uses a standard 12-column grid on desktop. Spacing between cards and sections follows a strict 8px modular scale.
- **Mobile Navigation:** A 64px height bottom navigation bar is mandatory on mobile devices to ensure reachability.
- **Top Bar:** Houses the theme toggle and global search. It should remain "sticky" and use a backdrop-blur (12px) with `bg-parchment-50/80`.

## Elevation & Depth

This design system uses a low-depth, layered approach. Instead of heavy shadows, it relies on tonal separation and fine borders.

- **Level 0 (Base):** `bg-parchment-50` (Light) or `bg-ink-950` (Dark).
- **Level 1 (Cards):** `bg-white` (Light) or `bg-ink-900` (Dark). These feature a `shadow-card` [0 1px 2px rgba(15,27,46,0.06)] and a `border-ink-950/15`.
- **Level 2 (Modals/Popovers):** Increased shadow depth [0 10px 15px -3px rgba(15,27,46,0.1)] to denote immediate priority.

**Borders:** Fine 1px borders are the primary method of separation. In light mode, use `ink-950/15`. In dark mode, use `white/10`.

## Shapes

The shape language is "Rounded-Large" to soften the impact of the high-contrast serif typography.

- **Standard Containers:** Use `2xl` (1rem) for all content cards and primary containers.
- **Interactive Elements:** Buttons and input fields use `lg` (0.5rem).
- **Small Components:** Chips and badges use full-rounded (pill) shapes to distinguish them from structural UI.

## Components

### Buttons
- **Primary:** `bg-ink-950` with `text-parchment-50`. On hover, shift to `bg-ink-800`.
- **Secondary:** `border-ink-950/15` with `text-ink-950`.
- **Accent:** `bg-gold-500` with `text-ink-950` for "Give" or "Join" actions.

### Cards
Cards are the primary container unit. They must include:
- `rounded-2xl` corners.
- `bg-white` (Dark: `bg-ink-900`).
- Internal padding of `1.5rem` (6 units).
- `border-ink-950/15` (Dark: `border-white/10`).

### Woven-Rule Divider
A decorative and functional element used to separate sections.
- **Style:** 1px height, `bg-gold-500`.
- **Usage:** Always under a Fraunces-font title or between distinct list items in a vertical stack.

### Input Fields
- **Background:** `bg-parchment-100` (Dark: `bg-ink-800`).
- **Border:** `border-ink-950/10` (Dark: `border-white/10`).
- **Focus State:** `ring-2 ring-gold-500/50`.

### Bottom Navigation (Mobile)
- **Background:** `bg-white/90` with backdrop-blur.
- **Active State:** Icon color shifts to `gold-500` with a small 4px dot below the icon.