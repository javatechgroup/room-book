# MeetSpace Frontend — CSS Architecture & Styling Guide

## 1. Overview & Architecture Philosophy

MeetSpace uses a **tiered modular CSS architecture** that provides clean separation of concerns between **Global Design Tokens**, **Atomic Foundation Controls**, **Reusable Common UI Components**, and **Feature-Scoped Portal Stylesheets**.

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Design Tokens & Primitives (variables.css, reset.css)    │
├─────────────────────────────────────────────────────────────┤
│ 2. Foundation Systems (typography, buttons, forms, tables)   │
├─────────────────────────────────────────────────────────────┤
│ 3. Shared Common Components (src/components/common/*)       │
├─────────────────────────────────────────────────────────────┤
│ 4. Portal & Feature Modules (Workplace, Facility, SuperAdmin)│
└─────────────────────────────────────────────────────────────┘
```

### Core Principles
1. **Single Source of Truth (Design Tokens)**: All colors, gradients, typography, shadows, border radii, and crystal glass effects are declared once as CSS Custom Properties in `src/styles/variables.css` and cascade automatically across **Light Mode** and **Dark Mode** (`[data-theme="dark"]`).
2. **DRY Foundation Controls**: Foundational controls such as buttons (`.btn`), form controls (`.form-input`), tables (`.app-table`), keyframe animations, and layout wrappers are maintained centrally in `src/styles/`.
3. **Crystal Glass & Ambient Atmosphere**: The modern UI features a backdrop blur and soft translucent glass surface system (`--crystal-surface`, `--crystal-border`, `--crystal-shadow`, `--portal-bg`) paired with high-contrast text tokens.
4. **Reusable Common Component Library**: Ubiquitous UI patterns (confirmation dialogs, date pickers, pagination bars, participant chips, custom selects, toast notifications) are extracted into `src/components/common/` with dedicated scoped CSS.
5. **Component Scoping & BEM Namespacing**: Component stylesheets isolate geometry, layout, and component-specific states using BEM naming conventions (e.g., `.facility-portal__stat-card--active`), preventing unexpected cascading side effects.
6. **Zero Hardcoded Design Values**: Components must consume CSS variables (`var(--bg-card)`, `var(--text-heading)`, `var(--border-card)`) rather than hardcoding hex colors or pixel shadows, ensuring 100% theme compatibility.

---

## 2. Directory Structure

```
frontend/src/
├── styles/                               <── Global Design System Layer
│   ├── index.css                         <── Master aggregator (single entry point imported in main.jsx)
│   ├── variables.css                     <── Design tokens (:root & [data-theme="dark"])
│   ├── reset.css                         <── CSS reset & base HTML defaults
│   ├── typography.css                    <── Font scales, font-features & shared section headers
│   ├── buttons.css                       <── Unified button system (.btn, .btn--primary, .btn--accent, etc.)
│   ├── forms.css                         <── Form controls, labels, and icon-adorned input wrappers
│   ├── tables.css                        <── Global Enterprise Data Table stylesheet & alignment system
│   ├── animations.css                    <── Shared @keyframes (fadeIn, slideUp, pulseGreen, pulse-ring)
│   └── utilities.css                     <── .container, .modal-overlay-base, portal ambient titles & badges
│
├── components/
│   ├── common/                           <── Reusable Common UI Components
│   │   ├── CancelRecurringModal/         <── Cancellation scope modal (single instance vs series)
│   │   │   ├── CancelRecurringModal.jsx
│   │   │   └── CancelRecurringModal.css
│   │   ├── ConfirmModal/                 <── Universal confirmation / danger dialog
│   │   │   ├── ConfirmModal.jsx
│   │   │   └── ConfirmModal.css
│   │   ├── DatePicker/                   <── Themed date/time selection calendar dropdown
│   │   │   ├── DatePicker.jsx
│   │   │   └── DatePicker.css
│   │   ├── Pagination/                   <── Enterprise data table pagination controls
│   │   │   ├── Pagination.jsx
│   │   │   └── Pagination.css
│   │   ├── ParticipantPicker/            <── Multi-select attendee chip input & suggestions
│   │   │   ├── ParticipantPicker.jsx
│   │   │   └── ParticipantPicker.css
│   │   ├── SearchInput/                  <── Search bar with clear button & debounce support
│   │   │   ├── SearchInput.jsx
│   │   │   └── SearchInput.css
│   │   ├── Select/                       <── Accessible custom dropdown select with chevrons
│   │   │   ├── Select.jsx
│   │   │   └── Select.css
│   │   └── Toast/                        <── Global toast notification stack & status cards
│   │       ├── Toast.jsx
│   │       └── Toast.css
│   │
│   ├── Header/                           <── Top navigation bar, brand logo, theme toggle
│   │   ├── Header.jsx
│   │   └── Header.css
│   ├── Footer/                           <── Footer columns, social links, legal notices
│   │   ├── Footer.jsx
│   │   └── Footer.css
│   │
│   ├── LoginGateway/                     <── Public hero section, live feature preview
│   │   ├── LoginGateway.jsx
│   │   └── LoginGateway.css
│   ├── WalkthroughSection/               <── 3-step feature walkthrough & interactive simulator
│   │   ├── WalkthroughSection.jsx
│   │   └── WalkthroughSection.css
│   ├── PolicyShowcase/                   <── Enterprise booking policy cards & rules showcase
│   │   ├── PolicyShowcase.jsx
│   │   └── PolicyShowcase.css
│   ├── RoleMatrix/                       <── Role permissions comparison matrix (Employee, Facility Admin, Super Admin)
│   │   ├── RoleMatrix.jsx
│   │   └── RoleMatrix.css
│   ├── Contact/                          <── Landing page contact section & inquiry details
│   │   ├── Contact.jsx
│   │   └── Contact.css
│   │
│   ├── LoginModal/                       <── Authentication dialog with quick demo credentials
│   │   ├── LoginModal.jsx
│   │   └── LoginModal.css
│   ├── ForgotPasswordModal/              <── Password recovery email trigger modal
│   │   ├── ForgotPasswordModal.jsx
│   │   └── ForgotPasswordModal.css
│   ├── ResetPasswordModal/               <── Set new password modal from token link
│   │   ├── ResetPasswordModal.jsx
│   │   └── ResetPasswordModal.css
│   ├── ContactModal/                     <── Floating contact / help inquiry dialog
│   │   ├── ContactModal.jsx
│   │   └── ContactModal.css
│   │
│   ├── WorkplacePortal/                  <── Employee Booking & Workspace Dashboard
│   │   ├── WorkplacePortal.jsx
│   │   ├── WorkplacePortal.css
│   │   └── components/                   <── Subcomponents: SlotFinderTab, CampusDirectoryTab, MyBookingsTab,
│   │                                         FacilityAdminTab, HelpdeskTab, RoomInfoCard, WorkplaceTabs
│   │
│   ├── FacilityAdminPortal/              <── Company & Facility Management Portal
│   │   ├── FacilityAdminPortal.jsx
│   │   ├── FacilityAdminPortal.css
│   │   └── components/                   <── Subcomponents: RoomsTab, FloorsTab, DepartmentsTab, EmployeesTab,
│   │                                         BookingMonitorTab, BookRoomTab, FacilityMyBookingsTab, PoliciesTab,
│   │                                         CompanyDirectoryTab, FacilityAdminMetrics, FacilityAdminTabs,
│   │                                         Modals & Drawers (RoomModal, FloorModal, DepartmentModal, etc.)
│   │
│   └── SuperAdminPortal/                 <── Platform Super Admin Portal
│       ├── SuperAdminPortal.jsx
│       ├── SuperAdminPortal.css
│       ├── components/                   <── Subcomponents: CompaniesTab, AdminsTab, AuditLogsTab,
│       │                                     BulkOperationsToolbar, SuperAdminMetrics, SuperAdminTabs,
│       │                                     CompanyModal, AdminModal, CompanyInspectorDrawer, AdminInspectorDrawer
│       └── data/                         <── Mock seed data & constants (superAdminData.js)
│
├── context/                              <── Global State & Providers
│   ├── AuthContext.jsx
│   ├── ConfirmContext.jsx
│   └── ToastContext.jsx
│
├── App.jsx                               <── Root application view switcher & modal mounting
└── main.jsx                              <── Imports './styles/index.css' before rendering React
```

---

## 3. Global Styles Layer (`src/styles/`)

The global layer comprises **8 specialized stylesheets** orchestrated through `src/styles/index.css`:

### 3.1 `index.css` (Master Aggregator)
Controls the cascading order of global styles loaded in `main.jsx`:
```css
@import './variables.css';
@import './reset.css';
@import './typography.css';
@import './animations.css';
@import './buttons.css';
@import './forms.css';
@import './tables.css';
@import './utilities.css';
```
> **Mount Point**: `import './styles/index.css';` in `src/main.jsx` ensures all tokens, resets, and utility classes are registered before component mounting.

---

### 3.2 `variables.css` (Design Tokens & Theming)

Defines all custom properties across **Light Theme** (`:root`) and **Dark Theme** (`[data-theme="dark"]`).

#### Color Palettes
* **Brand Colors (Tech Blue)**: `--primary-50` through `--primary-900` (`#eff6ff` to `#1e3a8a`).
* **Neutral Slate Scale**: `--gray-50` through `--gray-900` (`#f8fafc` to `#0f172a`).
* **Semantic Status Accents**:
  * Emerald (`--emerald-50`, `--emerald-500`, `--emerald-600`, `--emerald-700`) — Success, confirmed status, available rooms.
  * Amber (`--amber-50`, `--amber-500`, `--amber-600`, `--amber-700`) — Pending state, warnings, expiring reservations.
  * Red (`--red-50`, `--red-500`, `--red-600`, `--red-700`) — Cancelled bookings, errors, destructive actions.
  * Indigo (`--indigo-50`, `--indigo-500`, `--indigo-600`, `--indigo-700`) — Secondary focus, administrative roles.

#### Gradients
* `--accent-gradient`: `linear-gradient(135deg, #2563eb 0%, #6366f1 100%)`
* `--accent-gradient-subtle`: Subtle translucent tint for active card backdrops.
* `--brand-gradient`: `linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)`

#### Crystal Glass & Ambient Atmosphere System
* `--portal-bg`: Multi-layer radial mesh gradients delivering dynamic background glow.
* `--crystal-surface`: Semi-transparent white (`rgba(255, 255, 255, 0.85)` in light, `rgba(18, 26, 44, 0.78)` in dark).
* `--crystal-blur`: `blur(16px)` hardware-accelerated backdrop blur.
* `--crystal-border`: Delicate translucent rim border with inset top highlight.
* `--crystal-shadow`: Layered elevation shadow giving subtle float without heavy darkening.

#### Segmented Navigation Controls & Tabs
* `--tab-track-bg`, `--tab-track-border`, `--tab-track-shadow` — Inset rounded track container.
* `--tab-text-idle`, `--tab-text-hover`, `--tab-active-bg`, `--tab-active-text`, `--tab-active-shadow` — Elevated active pill.
* `--tab-badge-bg`, `--tab-badge-text`, `--tab-badge-active-bg`, `--tab-badge-active-text` — Pill count badges inside tabs.

#### Enterprise Data Tables Tokens
* `--table-wrap-bg`, `--table-wrap-border`, `--table-wrap-shadow` — Card wrapper container.
* `--th-bg`, `--th-text`, `--th-border`, `--th-shadow` — High-contrast sticky headers.
* `--th-sort-hover-bg`, `--th-sort-hover-text`, `--th-sort-icon`, `--th-sort-idle` — Interactive sorting indicators.
* `--tr-bg`, `--tr-alt-bg`, `--tr-border` — Striped alternating row backgrounds.
* `--tr-hover-bg`, `--tr-hover-stripe`, `--tr-hover-shadow` — Row hover state with left accent stripe.
* `--tr-selected-bg`, `--tr-selected-stripe` — Multi-select active row styling.

#### Typography, Elevation & Radii
* `--font-family`: `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`
* `--shadow-sm`, `--shadow-md`, `--shadow-lg`, `--shadow-xl`, `--shadow-card`, `--shadow-card-hover`
* `--radius-sm` (6px), `--radius-md` (8px), `--radius-lg` (12px), `--radius-xl` (16px), `--radius-2xl` (24px), `--radius-full` (9999px)
* `--transition`: `all 0.2s cubic-bezier(0.4, 0, 0.2, 1)`

---

### 3.3 `reset.css` (Resets & Base Defaults)
* Applies `box-sizing: border-box` globally (`*`, `*::before`, `*::after`).
* Sets smooth scrolling (`html { scroll-behavior: smooth; }`).
* Establishes font antialiasing (`-webkit-font-smoothing: antialiased`).
* Resets list formatting, image responsiveness, and media bounds (`img, picture, video { max-width: 100%; display: block; }`).
* Sets form elements to inherit font family and size.

---

### 3.4 `typography.css` (Headings & Section Headers)
* Normalizes `h1` through `h6` heading sizes, weights, and letter-spacing (`letter-spacing: -0.02em`).
* Enables modern OpenType font features on text elements (`font-feature-settings: 'cv02', 'cv03', 'cv04', 'cv11'`).
* **Shared Section Header System**:
  * `.section-header` — Centered header block with standardized responsive margin.
  * `.section-tag` — Pill badge for section categorization.
  * `.section-tag--primary` — Brand blue accent variant.
  * `.section-tag--light` — Translucent glass variant for hero/dark banner overlays.
  * `.section-title` — 2.25rem bold title with fluid scaling down to 1.65rem on mobile.
  * `.section-subtitle` — 1.1rem muted subtitle with 560px max width.

---

### 3.5 `buttons.css` (Unified Button System)
Provides consistent buttons across all portals and dialogs:

| Class | Appearance | Usage |
| :--- | :--- | :--- |
| `.btn` | Base reset, flex alignment, gap 8px, font 0.925rem, radius 8px | Foundation for all buttons |
| `.btn--primary` | Filled Tech Blue (`--primary-600`), hover lift, blue glow | Primary submit & booking CTAs |
| `.btn--accent` | Gradient fill (`--accent-gradient`), purple-blue glow | Featured landing & promotion actions |
| `.btn--secondary` | Surface background (`--bg-card`), gray border, subtle shadow | Cancel, back, and secondary options |
| `.btn--danger` | Filled Red (`--red-600`), red glow | Delete, revoke access, cancel booking |
| `.btn--warning` | Filled Amber (`--amber-600`), warm glow | Suspend account, override warning |
| `.btn--outline` | Transparent fill, blue border (`--primary-200`) | Filter toggles, secondary dialog links |
| `.btn--sm` | Compact sizing (`padding: 8px 18px; font-size: 0.85rem;`) | Table rows, toolbar filters |
| `.btn--lg` | Expanded sizing (`padding: 14px 32px; font-size: 1rem;`) | Landing hero buttons, checkout actions |
| `.btn--full` | 100% width button with centered content | Mobile forms, full-width modal actions |

---

### 3.6 `forms.css` (Form Controls & Input Wrappers)
Provides accessible, unified styling for inputs and controls:
* `.form-group` — Column layout with 6px spacing between label and input.
* `.form-label` — Bold 0.8rem label with `.req` red asterisk support for required fields.
* `.form-input`, `.form-select`, `.form-textarea` — Themed controls with focus rings (`0 0 0 3px rgba(59, 130, 246, 0.15)`).
* `.input-wrap`, `.input-with-icon` — Relative wrapper for inputs with leading SVG icons:
  ```jsx
  <div className="input-wrap">
    <Search size={16} className="input-icon" />
    <input type="text" className="form-input" placeholder="Search..." />
  </div>
  ```

---

### 3.7 `tables.css` (Enterprise Data Table System)
Handles all high-density data grids across **Super Admin**, **Facility Admin**, and **Employee Portals**.

#### Architectural Highlights:
1. **Desktop Table Card (`.desktop-table-wrap`)**:
   Encloses the data grid in a rounded crystal card (`border-radius: var(--radius-lg)`, `overflow: hidden`, `box-shadow: var(--table-wrap-shadow)`).
2. **Horizontal Scroll Safety (`.table-responsive`)**:
   Ensures tables scroll horizontally on small screens without breaking container bounds.
3. **Auto-Distribution Grid (`table-layout: fixed`)**:
   Applied to `.app-table`, `.superadmin-table`, `.rooms-table`, `.departments-table`, `.floors-table`, `.employees-table`, `.bookings-table`, `.my-bookings-table`, `.directory-table`:
   * All data columns without explicit width automatically and equally divide the remaining horizontal space.
   * Prevents layout shift when sorting or filtering.
4. **Sticky High-Contrast Headers (`thead th`)**:
   Header cells use `position: sticky; top: 0; z-index: 2;` with high-contrast text and subtle drop-shadows.
5. **Interactive Column Sorting (`.th-sortable`, `.th-content`, `.sort-idle`)**:
   Includes sort direction indicators that react smoothly to hover and active states.
6. **Tactile Hover & Selection Rows**:
   * Alternating row striping (`var(--tr-alt-bg)`).
   * Hover effect with left accent indicator (`var(--tr-hover-stripe)`).
   * Active selection state (`.tr--selected`) with inset left border.
7. **Fixed vs Dynamic Columns**:
   * `.th-checkbox`, `.td-checkbox`: Strictly fixed width (48px) and centered.
   * `.th-actions`, `.td-actions`: Fixed width (180px) and centered with `.td-actions__group` preventing wrap.
   * Primary descriptive columns (e.g., `.td-room-name`, `.td-company-name`): Left-aligned with auto-expansion.
   * Status pills, capacities, dates, and role tags: Centered with `.th-center`, `.td-center`, or automatic element selectors (`.status-pill`, `.code-pill`, `.capacity-pill`, etc.).
8. **Dense Formatting (`.table--dense`, `.audit-logs-table`)**:
   Compact row height (padding 8px 12px) for audit logs and large datasets.
9. **Empty States (`.td-empty`)**:
   Clean centered empty table fallback with icon, heading, and description.

---

### 3.8 `animations.css` (Centralized Keyframes)
* `@keyframes fadeIn` — Smooth 0 to 1 opacity fade (0.2s).
* `@keyframes slideUp` — Upward translation with subtle scaling for dialogs and modals (`translateY(16px) scale(0.97)` → `translateY(0) scale(1)`).
* `@keyframes slideDown` — Downward translation for toolbars and dropdown menus.
* `@keyframes pulseGreen` — Pulsing green radar glow for live availability and active tablets.
* `@keyframes pulse-ring` — Concentric expanding radar wave for simulation markers.

---

### 3.9 `utilities.css` (Layout Helpers & Crystal Portal Headings)
* `.container` — Responsive centered container (`max-width: 1200px`, padding 24px desktop, 16px mobile).
* `.modal-overlay-base` — Shared fixed overlay backdrop with blur effect (`backdrop-filter: blur(8px); z-index: 2000`).
* `.portal-title-block` — Heading stack with badge, title, and subtitle for administrative portals.
* `.portal-crystal-badge` — Pill badge with crystal glass surface and `.pulse-dot` live indicator.
* `.pulse-dot` — Green pulsing circle indicating live system status.
* `.portal-main-heading` — 2.1rem bold header (`font-weight: 850; letter-spacing: -0.03em;`).
* `.brand-title--accent` — Gradient-clipped text accent (`--primary-600` to `#8b5cf6`).
* `.portal-main-subheading` — Max-width 820px muted descriptive paragraph.
* `section[id], div[id="login-gateway"]` — Configures `scroll-margin-top: 80px` ensuring anchor links clear the fixed navbar.

---

## 4. Reusable Common Component Layer (`src/components/common/`)

These self-contained components provide shared functionality across the application and follow strict encapsulation:

| Component | Files | Purpose & Features |
| :--- | :--- | :--- |
| **ConfirmModal** | `ConfirmModal.jsx`<br>`ConfirmModal.css` | Universal modal dialog with customizable title, message, confirm/cancel labels, danger variant, and ESC/backdrop click handling. |
| **CancelRecurringModal** | `CancelRecurringModal.jsx`<br>`CancelRecurringModal.css` | Specialized cancellation dialog offering choices: cancel only this single reservation instance or cancel all future recurring reservations. |
| **DatePicker** | `DatePicker.jsx`<br>`DatePicker.css` | Custom theme-aware calendar dropdown with date navigation, format options, and time range integration. |
| **Pagination** | `Pagination.jsx`<br>`Pagination.css` | Enterprise data pagination controls: rows per page selector, item range indicator ("Showing 1-10 of 48"), page numbers, and previous/next buttons. |
| **ParticipantPicker** | `ParticipantPicker.jsx`<br>`ParticipantPicker.css` | Multi-select meeting attendee input supporting tag chips, email validation, contact search, and removable badge dismissals. |
| **SearchInput** | `SearchInput.jsx`<br>`SearchInput.css` | Standardized search control with magnifying glass icon, instant clear button (`×`), and smooth focus ring. |
| **Select** | `Select.jsx`<br>`Select.css` | Custom styled select element with SVG chevron, themed hover/focus, and option formatting. |
| **Toast** | `Toast.jsx`<br>`Toast.css` | Global floating toast notification stack rendering success, info, warning, and error toast cards with auto-dismiss timers. |

---

## 5. Portal & Feature Stylesheets (`src/components/`)

### 5.1 Public Landing Page
* **Header (`Header/Header.css`)**: Glassmorphic fixed navigation bar (`backdrop-filter: blur(12px)`), brand logo with icon mark, nav links with active indicator, mobile hamburger menu, and dark/light mode toggle button.
* **LoginGateway (`LoginGateway.css`)**: Hero section split layout, gradient headline, feature checkmarks, interactive preview card showing live room status badges.
* **WalkthroughSection (`WalkthroughSection.css`)**: 3-step numbered cards with interactive room reservation sandbox simulator.
* **PolicyShowcase (`PolicyShowcase.css`)**: Corporate booking policy showcase with card grid highlighting advance notice rules, duration limits, and quota controls.
* **RoleMatrix (`RoleMatrix.css`)**: Comparison grid outlining permissions for Employees, Facility Admins, and Platform Super Admins.
* **Contact (`Contact.css`) & ContactModal (`ContactModal.css`)**: Inquiry form cards, contact channels, and modal dialog.
* **Footer (`Footer.css`)**: Dark high-contrast footer with navigation links, copyright, and system status indicator.

### 5.2 Authentication & Password Recovery
* **LoginModal (`LoginModal.css`)**: Multi-role login dialog with tabbed role switches (Super Admin, Facility Admin, Employee) and pre-filled demo role shortcuts.
* **ForgotPasswordModal (`ForgotPasswordModal.css`)**: Clean email-based password reset request dialog.
* **ResetPasswordModal (`ResetPasswordModal.css`)**: Password reset completion dialog verifying security tokens.

### 5.3 WorkplacePortal (Employee Experience)
* **WorkplacePortal (`WorkplacePortal.css`)**:
  * Consumes `--portal-bg` for atmospheric ambient glow.
  * Segmented navigation tabs (`WorkplaceTabs.jsx`) with pill styling and count indicators.
  * Sub-tab views:
    * `SlotFinderTab.jsx`: Fast meeting slot recommendation and room booking engine.
    * `CampusDirectoryTab.jsx` & `RoomInfoCard.jsx`: Interactive room cards with capacity pills, amenity chips, and availability indicators.
    * `MyBookingsTab.jsx`: User's upcoming and past reservations with status badges, recurring tags, and action buttons.
    * `FacilityAdminTab.jsx`: Direct contact interface to the company facility manager.
    * `HelpdeskTab.jsx`: Workspace guidelines and support ticket submission.

### 5.4 FacilityAdminPortal (Company & Facility Operations)
* **FacilityAdminPortal (`FacilityAdminPortal.css`)**:
  * Expanded container layout (`.facility-admin-portal .container { max-width: 1440px; }`) to support dense data tables.
  * KPI metric cards (`FacilityAdminMetrics.jsx`): Real-time counts for Total Rooms, Desks, Current Occupancy, Active Bookings, and Policy Rules.
  * 9 Tabbed Administration Views (`FacilityAdminTabs.jsx`):
    * `RoomsTab.jsx`, `FloorsTab.jsx`, `DepartmentsTab.jsx`, `EmployeesTab.jsx`
    * `BookingMonitorTab.jsx`, `BookRoomTab.jsx`, `FacilityMyBookingsTab.jsx`, `PoliciesTab.jsx`, `CompanyDirectoryTab.jsx`
  * Slide-Over Inspector Drawers (`RoomInspectorDrawer.jsx`, `FloorInspectorDrawer.jsx`, etc.): Right-anchored slide-out panels with backdrop overlays for deep entity inspection.
  * Modal Form Editors (`RoomModal.jsx`, `FloorModal.jsx`, `DepartmentModal.jsx`, `EmployeeModal.jsx`).

### 5.5 SuperAdminPortal (Platform Multi-Tenant Governance)
* **SuperAdminPortal (`SuperAdminPortal.css`)**:
  * Multi-organization oversight with KPI statistics (`SuperAdminMetrics.jsx`).
  * Organization management (`CompaniesTab.jsx`), Company Admin provisioning (`AdminsTab.jsx`), and System Audit Logs (`AuditLogsTab.jsx`).
  * Bulk Operations Toolbar (`BulkOperationsToolbar.jsx`): Multi-select action bar appearing dynamically when table rows are checked.
  * Slide-over inspector panels and tenant creation modals (`CompanyModal.jsx`, `CompanyInspectorDrawer.jsx`).

---

## 6. Developer Guidelines & Recipes

### 6.1 Adding a New Design Token
Always add tokens in pairs—one for Light theme (`:root`), and one for Dark theme (`[data-theme="dark"]`):

```css
/* In src/styles/variables.css */
:root {
  --my-new-token: #2563eb;
}

[data-theme="dark"] {
  --my-new-token: #60a5fa;
}
```

### 6.2 Building an Enterprise Data Table
To create a consistent data table, wrap an `.app-table` in `.desktop-table-wrap` and `.table-responsive`:

```jsx
<div className="desktop-table-wrap">
  <div className="table-responsive">
    <table className="app-table">
      <thead>
        <tr>
          <th className="th-checkbox">
            <input type="checkbox" onChange={toggleSelectAll} />
          </th>
          <th className="th-sortable" onClick={() => handleSort('name')}>
            <span className="th-content">
              Name <ArrowUpDown size={13} className="sort-idle" />
            </span>
          </th>
          <th className="th-center">Status</th>
          <th className="th-actions">Actions</th>
        </tr>
      </thead>
      <tbody>
        {items.map((item) => (
          <tr key={item.id} className={isSelected(item.id) ? 'tr--selected' : ''}>
            <td className="td-checkbox">
              <input type="checkbox" checked={isSelected(item.id)} />
            </td>
            <td className="td-strong">{item.name}</td>
            <td className="td-center">
              <span className={`status-pill status-pill--${item.status}`}>
                {item.status}
              </span>
            </td>
            <td className="td-actions">
              <div className="td-actions__group">
                <button className="btn btn--sm btn--secondary">Edit</button>
                <button className="btn btn--sm btn--danger">Delete</button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
  <Pagination
    currentPage={page}
    totalItems={total}
    itemsPerPage={limit}
    onPageChange={setPage}
  />
</div>
```

### 6.3 Creating a Dialog or Slide-Over Drawer
Leverage the global modal backdrop token for consistent blurring:

```jsx
<div className="modal-overlay-base" onClick={onClose}>
  <div className="my-modal" onClick={(e) => e.stopPropagation()}>
    <div className="my-modal__header">
      <h3>Edit Resource</h3>
      <button onClick={onClose} aria-label="Close modal">×</button>
    </div>
    <div className="my-modal__body">
      {/* Form content using .form-group and .form-input */}
    </div>
    <div className="my-modal__footer">
      <button className="btn btn--secondary" onClick={onClose}>Cancel</button>
      <button className="btn btn--primary" onClick={onSave}>Save Changes</button>
    </div>
  </div>
</div>
```

```css
/* In MyComponent.css */
.my-modal {
  background: var(--bg-card);
  border: 1px solid var(--border-card);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-xl);
  animation: slideUp 0.22s cubic-bezier(0.16, 1, 0.3, 1);
  width: 100%;
  max-width: 540px;
}
```

---

## 7. Responsive Breakpoints & Media Strategy

| Device Category | Breakpoint | Styling Adjustments |
| :--- | :--- | :--- |
| **Mobile Portrait** | `< 480px` | `.container` padding drops to 16px; `.btn--lg` scales down to standard height; action button groups stack vertically where needed; tables scroll horizontally. |
| **Mobile Landscape / Tablet** | `< 768px` | Segmented tab bars switch to horizontal touch scrolling with hidden scrollbars; portal headings reduce from 2.1rem to 1.65rem; navigation drawer switches to mobile drawer. |
| **Laptop / Standard Desktop** | `768px – 1200px` | Standard `.container` max-width 1200px; grid layouts switch from 1 column to 2 or 3 columns. |
| **Enterprise Wide Desktop** | `> 1200px` | Facility Admin and Super Admin containers expand to `max-width: 1440px` for optimal multi-column data table display. |

---

## 8. Build & Bundling Pipeline

* **Build Tool**: Vite (`vite.config.js`).
* **CSS Compilation**: All `@import` rules in `src/styles/index.css` and component-level CSS imports are parsed, bundled, and autoprefixed during `npm run build`.
* **Minification & Asset Hashing**: Production output generates a minified, hashed bundle (`dist/assets/index-[hash].css`) with automatic dead-code elimination for unused selectors.
* **Zero Runtime Overhead**: The architecture relies on standard browser-native CSS Custom Properties and standard CSS, avoiding runtime CSS-in-JS style injection penalties.
