---
name: 'Origo Design Phase 2 PRD: Business UI & Enterprise Components'
type: prd
status: approved
created: 2026-10-02
updated: 2026-10-04
---

# Origo Design Phase 2 PRD: Business UI & Enterprise Components

## 1. Executive Summary & Vision

Origo Design Phase 1 established the foundation for a framework-agnostic declarative platform (BADL). Phase 2 executes against the **Enterprise Data & Business UI** slice of the platform.

Our strategy is built around a significant competitive moat: **Origo Design is a declarative application UI platform that happens to contain a PrimeNG-class component library.** 
Instead of merely building 150 independent components, we are building a dual-layer product:
1. **The Standalone UI Component Library:** A highly polished, versioned, standalone UI library that competes directly with PrimeNG, offering functional parity.
2. **The Metadata UI OS (Enterprise/Dynamic Layer):** A layer of "dynamic" components that consume the underlying UI components but interpret BADL metadata (business rules, workflows, permissions) natively. 

Crucially, in Phase 2, we are deprecating our reliance on AG Grid and building a **fully custom, in-house Origo DataGrid** to ensure absolute control over virtualization, server-side data, and metadata injection.

## 2. Target Personas

1. **Library Consumers:** Traditional developers (Angular, React Native) who want a robust, accessible, and themeable UI component library similar to PrimeNG. They consume the standalone UI packages and the standalone documentation.
2. **Platform Consumers (Origo Developers):** Enterprise developers building applications on top of the Origo BADL engine. They interact primarily with the *Enterprise & Dynamic Components* layer, relying on the platform to translate business constraints into the underlying UI components.

## 3. Scope & Capabilities

### Epic 1: The Standalone UI Component Library (Core Primitives)
Build a comprehensive suite of UI primitives that conform strictly to the `Origo-Design-Component-API-Specification.md`. To prevent long-running tasks, this is divided into granular delivery epics.

* **Epic 1.1: Core Form Controls:** Input Text, Textarea, Input Number, Input Mask, Password, Checkbox, Checkbox Group, Radio Group, Select, Multi Select, Auto Complete, Cascade Select, Tree Select, Listbox, Date Picker, Date Range Picker, Time Picker, DateTime Picker, Calendar, Color Picker, Slider, Range Slider, Toggle Switch, Toggle Button, Toggle Button Group, Rating, OTP / Input OTP, Tags Input, Knob, Rich Text Editor, File Input, Form Field, Form Field Group, Label, Field Hint, Validation Message, Input Group, Input Group Addon, Floating Label.
* **Epic 1.2: Buttons, Actions & Layouts:** Button, Icon Button, Button Group, Split Button, Speed Dial, Floating Action Button, Link Button, Command Button, Action Menu. Card, Panel, Accordion, Tabs, Stepper, Divider, Fieldset, Toolbar, Splitter, Scroll Area, Stack, Grid, Container, Flex, Sidebar, Page Header, Page Footer, Master Detail Layout, Responsive Layout.
* **Epic 1.3: Overlays & Navigation:** Dialog / Modal, Drawer, Popover, Tooltip, Confirmation Dialog, Confirmation Popup, Dynamic Dialog, Bottom Sheet, Contextual Help, Full Screen Modal. Breadcrumb, Menu, Context Menu, Sidebar Navigation, Menubar, Mega Menu, Tiered Menu, Panel Menu, Command Palette, Navigation Tabs, Step Navigation, Bottom Navigation, Mobile Navigation.
* **Epic 1.4: Notifications, Feedback & Utility:** Alert, Message, Toast, Banner, Inline Validation, Callout, Notification Center, Status Indicator, Badge, Tag, Chip, Spinner, Progress Bar, Progress Circle, Skeleton, Empty State, Error State, Success State, Loading Overlay, Block UI, Avatar, Avatar Group, Meter. Auto Focus, Focus Trap, Ripple, Scroll Top, Clipboard, Copy Button, Keyboard Shortcut, Hotkey, Fullscreen, Resizable, Draggable, Droppable, Debounce, Intersection Observer, Portal, Virtualization, Animation, Transition.
* **Epic 1.5: File, Media & Charts:** File Upload, Drag & Drop Upload, Multiple Upload, Upload Progress, Image Upload, File Preview, File List, Attachment, Document Viewer, Image Cropper, Image, Image Gallery, Image Compare, Carousel, Video, Audio, Media Viewer, Lightbox. Line Chart, Bar Chart, Area Chart, Pie Chart, Doughnut Chart, Radar Chart, Polar Chart, Scatter Chart, Bubble Chart, Gauge, Progress Chart, Sparkline, KPI Card, Metric, Dashboard Widget, Heatmap, Funnel, Sankey, Treemap, Widget Toolbar, Widget Filter, Date Range Filter, Dashboard Layout Editor, Drag/Resize Widget.

### Epic 2: Enterprise Data Components (The Custom Origo DataGrid)
Replace AG Grid entirely. Build a high-density, virtualization-friendly grid and data presentation layer optimized for enterprise data, designed in-house.

* **Epic 2.1: DataGrid Foundation:** Core Data Table, Data Grid, Virtual Scroller, Infinite Scroll, Pagination, Text/Number/Date/Boolean Column Types.
* **Epic 2.2: Advanced DataGrid Capabilities:** Sorting, Multi-sort, Filtering, Filter builder, Global search, Column chooser, Column resize, Column reorder, Frozen columns, Sticky columns, Row selection, Multi-selection, Checkbox selection, Row expansion, Nested rows, Inline editing, Cell editing, Bulk actions, Server-side filtering/sorting/pagination, Export CSV/Excel, Print.
* **Epic 2.3: Alternative Data Views:** Data View, List, Tree, Tree Table, Timeline, Organization Chart, Order List, Pick List, Kanban Board, Calendar View, Master-Detail, Hierarchical Data Grid.

### Epic 3: Enterprise & Dynamic Component Layer (Brought forward from Phase 4)
This is the Origo differentiator. Components that interpret BADL metadata and evaluate business state automatically, sitting above the standard UI components.

* **Epic 3.1: Security & Authorization:** `PermissionGate`, `RoleGate`, `FeatureGate`, `TenantGate`, `CompanyGate`, `PermissionAwareButton`, `PermissionAwareMenu`, `PermissionAwareField`, `MaskedField`, `SensitiveField`.
* **Epic 3.2: Business State & Workflow:** `ApprovalStatus`, `WorkflowStatus`, `LifecycleStatus`, `StateBadge`, `StateTransition`, `ApprovalTimeline`, `ApprovalStepper`, `WorkflowViewer`, `TaskList`, `TaskAction`, `ApprovalAction`, `Delegation`, `Escalation`.
* **Epic 3.3: Audit & Business Semantic Components:** `AuditTimeline`, `AuditLog`, `ChangeHistory`, `VersionHistory`, `ActivityFeed`, User Card, User Selector, Team Selector, Currency Input, Document Status, Global Search.
* **Epic 3.4: Dynamic Rendering:** `DynamicForm`, `DynamicTable`, `DynamicPage`, `DynamicField`, `DynamicAction`, `DynamicLayout`, `DynamicWorkflow`.

### Epic 4: Standalone Versioned UI Documentation
Develop a dedicated documentation portal specifically for the Standalone UI Component product.
* **Epic 4.1: Documentation Architecture:** Navigation (`Category > Component` taxonomy), Version control matching library releases.
* **Epic 4.2: Component Content:** Inputs, events, styling hooks, `When to use?` and `How to use?` guidelines.
* **Epic 4.3: Release Management:** Structured "What's New in Version X.X" changelog.

## 4. Architectural API Compliance
Every interactive component must adhere to the Origo Component API Specification, implementing standard inputs such as:
* `id`, `class`, `style`, `visible`, `disabled`, `readonly`, `loading`, `size`, `variant`, `fluid`, `ariaLabel`.
* **Enterprise Hooks:** `permissions`, `rules`, and `metadata` must be supported natively on all components to allow the Metadata UI OS to attach dynamically.

## 5. Non-Functional Requirements
* **Accessibility:** All components must pass axe-core in CI, support full keyboard navigation, ARIA semantics, and reduced motion.
* **Responsive Design:** Native breakpoint handling built into the component metadata contract (e.g., Stack, Grid layouts).
* **Theming:** Agnostic design token architecture supporting Light, Dark, High-contrast, and Tenant-specific themes via CSS variables.

## 6. Out of Scope for Phase 2
* AI Components (AIAssistant, AIGeneratedUI) — Deferred to Phase 5.
* Advanced Visualizations (Heatmap, Gauge, complex charts) — Deferred to Phase 3.
* Long-Running Workflow Runtime execution (Temporal integration) — Deferred to later phase.
* Offline Storage Sync (Workbox/IndexedDB) — Deferred to later phase.
