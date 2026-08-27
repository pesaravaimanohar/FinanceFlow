---
name: Equilibrium Finance
colors:
  surface: '#f7f9fb'
  surface-dim: '#d8dadc'
  surface-bright: '#f7f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#eceef0'
  surface-container-high: '#e6e8ea'
  surface-container-highest: '#e0e3e5'
  on-surface: '#191c1e'
  on-surface-variant: '#45464d'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f3'
  outline: '#76777d'
  outline-variant: '#c6c6cd'
  surface-tint: '#565e74'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#131b2e'
  on-primary-container: '#7c839b'
  inverse-primary: '#bec6e0'
  secondary: '#0058be'
  on-secondary: '#ffffff'
  secondary-container: '#2170e4'
  on-secondary-container: '#fefcff'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#0b1c30'
  on-tertiary-container: '#75859d'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dae2fd'
  primary-fixed-dim: '#bec6e0'
  on-primary-fixed: '#131b2e'
  on-primary-fixed-variant: '#3f465c'
  secondary-fixed: '#d8e2ff'
  secondary-fixed-dim: '#adc6ff'
  on-secondary-fixed: '#001a42'
  on-secondary-fixed-variant: '#004395'
  tertiary-fixed: '#d3e4fe'
  tertiary-fixed-dim: '#b7c8e1'
  on-tertiary-fixed: '#0b1c30'
  on-tertiary-fixed-variant: '#38485d'
  background: '#f7f9fb'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'
typography:
  display-lg:
    fontFamily: Manrope
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Manrope
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Manrope
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-sm:
    fontFamily: Manrope
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  data-lg:
    fontFamily: JetBrains Mono
    fontSize: 20px
    fontWeight: '500'
    lineHeight: 24px
  data-md:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 8px
  sm: 12px
  md: 16px
  lg: 24px
  xl: 32px
  xxl: 48px
  container-max: 1440px
  gutter: 24px
---

## Brand & Style

This design system is built for high-stakes financial environments where clarity and composure are paramount. The personality is **authoritative yet approachable**, balancing the rigor of institutional finance with the accessibility of a modern SaaS platform.

The design style is **Corporate Modern with Tonal Layering**. It prioritizes high-density information without visual clutter, utilizing generous white space and a structured card-based architecture to organize complex data sets. The emotional response should be one of "controlled confidence"—users should feel that their data is secure, organized, and easy to interpret. 

Key stylistic pillars include:
- **Functional Minimalism:** Removing non-essential decorative elements to keep the focus on financial metrics.
- **Structured Precision:** Using mathematical alignment and consistent spacing to imply reliability.
- **Information Hierarchy:** Utilizing weight and color to guide the eye toward critical figures (Net Worth, ROI, Alerts).

## Colors

The palette is anchored by **Deep Slate (Primary)**, providing a sense of stability and institutional trust. **Vibrant Blue (Secondary)** is used sparingly for primary actions and interactive states, while **Cool Gray (Tertiary)** handles utility icons and secondary text.

- **Foundations:** The background utilizes a subtle off-white (`#F8FAFC`) to reduce eye strain and provide a clean canvas for white cards.
- **Semantic Clarity:** Success and Error colors are saturated to ensure financial alerts (gains/losses) are immediately recognizable. 
- **Neutral Scales:** Use a range of slates for borders (`#E2E8F0`) and disabled states (`#94A3B8`) to maintain a professional, low-friction environment.

## Typography

This design system uses a triple-font approach to maximize utility:
1. **Manrope (Headlines):** A modern, geometric sans-serif that feels refined and professional for page titles and card headers.
2. **Inter (Body):** The industry standard for UI legibility, used for all descriptive text, inputs, and standard navigation.
3. **JetBrains Mono (Data):** A monospaced font used exclusively for numerical data, currency, and percentages. This ensures that columns of numbers align perfectly for easy comparison.

**Mobile Scaling:** Headlines above 32px should scale down by 20% on mobile devices to prevent awkward line breaks.

## Layout & Spacing

The design system follows a **12-column fixed grid** on desktop, centering the content within a 1440px container. On smaller screens, the layout shifts to a fluid 4-column (mobile) or 8-column (tablet) grid.

- **Card Architecture:** Most content is housed in cards. Cards should be separated by `24px` (lg) gutters both vertically and horizontally.
- **Section Padding:** Internal card padding is standardized at `24px` to ensure data has room to breathe.
- **Financial Groups:** Related metrics (e.g., a balance and its percentage change) should use `8px` (xs) spacing to indicate relationship.

## Elevation & Depth

To maintain a "clean" and "organized" feel, this design system uses **Tonal Layers** combined with **Ambient Shadows**.

1. **Level 0 (Background):** The base canvas (`#F8FAFC`).
2. **Level 1 (Cards):** Pure white surfaces with a very soft, diffused shadow (`0px 4px 20px rgba(15, 23, 42, 0.05)`). These cards house the primary content.
3. **Level 2 (Dropdowns/Modals):** Elements that sit above cards use a slightly more pronounced shadow (`0px 10px 30px rgba(15, 23, 42, 0.10)`) and a thin `1px` border (`#E2E8F0`) to ensure crisp edges.

Avoid heavy blacks or high-opacity shadows. Depth is used to imply order, not drama.

## Shapes

The design system utilizes **Rounded (0.5rem)** corners as the default for all primary components (cards, buttons, inputs). 

- **Primary Cards:** Use `rounded-lg` (1rem) to create a soft, modern container feel.
- **Small Components:** Tags, chips, and checkboxes use the standard `0.5rem` to maintain a professional, geometric look.
- **Buttons:** Large action buttons may use the same `0.5rem` for consistency, avoiding pill shapes to maintain the "serious" financial aesthetic.

## Components

### Buttons
- **Primary:** Solid Deep Slate (`#0F172A`) with White text. Bold and authoritative.
- **Secondary:** White background with 1px border (`#E2E8F0`). Used for "Cancel" or secondary filters.
- **Tertiary:** Ghost style, no border, Blue (`#3B82F6`) text. Used for "View All" or inline actions.

### Cards & Data Visualization
- **Metrics Card:** Headline-sm for the title, Data-lg for the primary value. Trend indicators (green/red) should sit immediately to the right of the value.
- **Charts:** Use a 2px stroke width for line charts. Use the secondary blue for the primary data series and light gray for grid lines.

### Input Fields
- **Default State:** White background, 1px Slate-200 border.
- **Focus State:** 2px Blue (`#3B82F6`) border with a subtle blue outer glow.
- **Labels:** Always use `label-caps` positioned above the input field for maximum clarity.

### Lists
- Standardize on "Financial Rows"—a list item with a leading icon/avatar, a title/subtitle group on the left, and a numerical value (monospaced) on the right. Use subtle 1px dividers between rows.