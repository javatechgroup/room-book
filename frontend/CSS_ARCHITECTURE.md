# MeetSpace Frontend — CSS Architecture & Styling Guide

## 1. Overview & Philosophy

This project uses a **hybrid modular CSS architecture** that cleanly separates **Global Design Primitives** from **Component-Specific Styles**. 

### Core Principles
1. **DRY (Don't Repeat Yourself)**: Shared design tokens, buttons, form controls, animations, and typography live in a single centralized directory (`src/styles/`).
2. **Single Source of Truth**: Colors, shadows, border radii, and spacing are defined once as CSS Custom Properties and cascade through light and dark themes.
3. **Component Isolation**: Component CSS files (`src/components/<ComponentName>/<ComponentName>.css`) contain **only** layout, geometry, and styles unique to that component.
4. **BEM Naming Convention**: Class names follow BEM-like patterns (e.g., `.block__element--modifier`) to prevent namespace collisions without requiring complex build-time CSS transformations.

---

## 2. Directory Structure

```
frontend/src/
├── styles/                          <── Global Design System Layer
│   ├── index.css                    <── Master aggregator (single entry point)
│   ├── variables.css                <── Design tokens (:root & [data-theme="dark"])
│   ├── reset.css                    <── CSS reset & base HTML defaults
│   ├── typography.css               <── Headings, text styles & section headers
│   ├── buttons.css                  <── Reusable button system (.btn, .btn--primary, etc.)
│   ├── forms.css                    <── Reusable form controls & input wrappers
│   ├── animations.css               <── Shared @keyframes (fadeIn, slideUp, pulse, etc.)
│   └── utilities.css                <── .container & layout helpers
│
├── components/                      <── Component-Specific Stylesheets
│   ├── Header/
│   │   ├── Header.jsx
│   │   └── Header.css               <── Header bar, brand logo, theme toggle
│   ├── Footer/
│   │   ├── Footer.jsx
│   │   └── Footer.css               <── Footer columns, social links, back-to-top
│   ├── LoginGateway/
│   │   ├── LoginGateway.jsx
│   │   └── LoginGateway.css         <── Hero split banner, feature badges
│   ├── WalkthroughSection/
│   │   ├── WalkthroughSection.jsx
│   │   └── WalkthroughSection.css   <── 3-step grid, interactive sandbox simulator
│   ├── Contact/
│   │   ├── Contact.jsx
│   │   └── Contact.css              <── Landing page contact section & details list
│   ├── ContactModal/
│   │   ├── ContactModal.jsx
│   │   └── ContactModal.css         <── Contact dialog modal dimensions & channels
│   ├── LoginModal/
│   │   ├── LoginModal.jsx
│   │   └── LoginModal.css           <── Sign-in modal dimensions & demo role chips
│   ├── WorkplacePortal/
│   │   ├── WorkplacePortal.jsx
│   │   ├── WorkplacePortal.css      <── Slot manager, door tablet UI, room directory
│   │   ├── components/              <── Subcomponents: SlotFinder, Directory, Bookings, Admin, Helpdesk, DoorTablet
│   │   └── data/                    <── Constants & initial room datasets
│   ├── SuperAdminPortal/
│   │   ├── SuperAdminPortal.jsx
│   │   └── SuperAdminPortal.css     <── Data tables, metrics grid, drawer inspector
│   └── common/
│       └── Toast/
│           ├── Toast.jsx
│           └── Toast.css            <── Toast notification card variants & toasts container
│
├── App.jsx
└── main.jsx                         <── Imports './styles/index.css'
```

---

## 3. Global Styles Layer (`src/styles/`)

The global layer is located in `src/styles/` and consists of 8 purpose-driven stylesheets loaded through `src/styles/index.css`:

### 3.1 `index.css` (Master Aggregator)
Aggregates all global stylesheets in the exact cascading order required by the browser:
```css
@import './variables.css';
@import './reset.css';
@import './typography.css';
@import './animations.css';
@import './buttons.css';
@import './forms.css';
@import './utilities.css';
```
> **Loaded in `main.jsx`**: `import './styles/index.css';` ensures the entire design foundation is mounted before any React component renders.

---

### 3.2 `variables.css` (Design Tokens & Theming)
Contains all CSS custom properties for both **Light Mode** and **Dark Mode**.

* **Brand Colors**: `--primary-50` through `--primary-900`
* **Neutral Palette**: `--gray-50` through `--gray-900` (Modern Slate in Dark mode)
* **Accent Colors**: `--emerald-500`, `--amber-500`, `--red-500`
* **Semantic Tokens**:
  * `--bg-body`, `--bg-surface`, `--bg-surface-alt`, `--bg-card`, `--bg-input`
  * `--border-card`, `--border-card-hover`, `--border-input`
  * `--text-heading`, `--text-body`, `--text-muted`, `--text-faint`
* **Elevations & Radii**:
  * `--shadow-sm`, `--shadow-md`, `--shadow-lg`, `--shadow-xl`
  * `--radius-sm` (6px), `--radius-md` (8px), `--radius-lg` (12px), `--radius-xl` (16px), `--radius-2xl` (24px), `--radius-full` (9999px)
  * `--transition`: `all 0.2s ease`

#### How Theming Works:
Dark mode activates when the root or document element has the `[data-theme="dark"]` attribute:
```html
<html data-theme="dark">
```
All components automatically adapt because they reference semantic tokens like `var(--bg-card)` and `var(--text-heading)`.

---

### 3.3 `reset.css` (Resets & Base Defaults)
* Sets `box-sizing: border-box` across `*`, `*::before`, and `*::after`.
* Sets default typography smoothing (`-webkit-font-smoothing: antialiased`).
* Normalizes `html`, `body`, `#root`, `.app`, `img`, `ul`, `ol`, and form elements.

---

### 3.4 `typography.css` (Headings & Section Headers)
* Normalizes font families and heading sizes (`h1` through `h6`).
* Shared Section Header Classes:
  * `.section-header` — Centered header container with bottom spacing.
  * `.section-tag` — Pill badge for section categories.
  * `.section-tag--light` — Semi-transparent variant for dark hero banners.
  * `.section-title` — 2.25rem bold heading with responsive scaling.
  * `.section-subtitle` — 1.1rem muted paragraph with max width.

---

### 3.5 `buttons.css` (Unified Button System)
Provides standard button styling across the application:

| Class | Description |
| :--- | :--- |
| `.btn` | Base button reset, font, flex alignment, and transition |
| `.btn--primary` | Filled primary blue button with elevation hover effect |
| `.btn--outline` | Ghost/bordered button with subtle tinted hover background |
| `.btn--sm` | Compact button for tables and toolbars (`padding: 8px 18px; font-size: 0.85rem;`) |
| `.btn--lg` | Large call-to-action button (`padding: 14px 32px; font-size: 1rem;`) |
| `.btn--full` | Full-width button (`width: 100%; justify-content: center;`) |

---

### 3.6 `forms.css` (Shared Form Controls)
Provides consistent styling for form fields, inputs, and icon adornments:

* `.form-group` — Column layout with 6px spacing for label + input.
* `.form-label` — Semibold label with `.req` red asterisk support.
* `.form-input`, `.form-select`, `.form-textarea` — Styled inputs with focus rings.
* `.input-wrap`, `.input-with-icon` — Relative wrapper for inputs with leading SVG icons:
  ```jsx
  <div className="input-wrap">
    <Mail size={16} className="input-icon" />
    <input type="email" placeholder="user@company.com" />
  </div>
  ```

---

### 3.7 `animations.css` (Centralized Keyframes)
Common animations defined once globally:
* `@keyframes fadeIn` — Smooth 0 to 1 opacity fade.
* `@keyframes slideUp` — Upward translation with subtle scale for dialogs/modals.
* `@keyframes slideDown` — Downward translation for toolbars and dropdowns.
* `@keyframes pulseGreen` — Pulsing green glow for live status indicators.
* `@keyframes pulse-ring` — Pulsing radar ring for active simulations.

---

### 3.8 `utilities.css` (Layout Helpers)
* `.container` — Max width 1200px centered layout with responsive padding (24px on desktop, 16px on mobile).
* `.modal-overlay-base` — Shared fixed overlay backdrop with blur effect for dialogs.

---

## 4. Component Styles Layer (`src/components/`)

Each React component has its own `.css` file in its directory (e.g. `Header/Header.css`).

### Rules for Component Stylesheets:
1. **Scope to the Component Root**: Prefix classes with the component name (e.g., `.header__nav`, `.login-gateway__container`, `.dir-room-card`).
2. **Never Re-define Global Primitives**: Do not define `@keyframes fadeIn`, `.btn`, or `:root` tokens inside component CSS files.
3. **Use Semantic CSS Variables**: Always use `var(--bg-card)`, `var(--text-heading)`, `var(--border-card)` rather than hardcoding hex colors like `#ffffff` or `#000000`.

---

## 5. Developer Cheat Sheet

### Adding a New Theme Variable
1. Open [`src/styles/variables.css`](file:///d:/RAM/room-book/frontend/src/styles/variables.css).
2. Add the variable to `:root` (for Light theme).
3. Add the dark mode equivalent under `[data-theme="dark"]`.

### Creating a New Component
1. Create `src/components/MyNewFeature/MyNewFeature.jsx`.
2. Create `src/components/MyNewFeature/MyNewFeature.css`.
3. In `MyNewFeature.jsx`, import its stylesheet:
   ```javascript
   import './MyNewFeature.css';
   ```
4. Use global classes directly in your JSX (`className="btn btn--primary"`, `className="container"`, `className="input-wrap"`).
5. Put only layout and feature-specific styling in `MyNewFeature.css`.

### Adding a Shared Global Animation
1. Open [`src/styles/animations.css`](file:///d:/RAM/room-book/frontend/src/styles/animations.css).
2. Define the `@keyframes myNewAnimation { ... }`.
3. Any component can now use `animation: myNewAnimation 0.3s ease;` immediately without re-declaring the keyframe.

---

## 6. Build & Bundling

* **Bundler**: Vite (`vite.config.js`).
* **Production Command**: `npm run build`.
* **Output**: All CSS files and `@import` dependencies in `src/styles/` and components are compiled, purged of unused duplication, and concatenated into a single optimized bundle (`dist/assets/index-[hash].css`).
