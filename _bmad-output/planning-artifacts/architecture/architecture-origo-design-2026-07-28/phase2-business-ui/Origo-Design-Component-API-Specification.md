# Origo Design — Component API Specification

**Status:** Proposed API contract  
**Target:** PrimeNG-class parity + Origo metadata/business-rule capabilities  
**Scope:** Inputs/properties and event handlers for the core Origo Design component catalog.

> **Important:** This is an Origo API proposal, not a copy of PrimeNG's API. Names are intentionally normalized around Origo's metadata-first model. PrimeNG v20 is used as a parity reference; its current catalog includes Form, Button, Data, Panel, Overlay, Menu, Media, Messages, Charts, File and Miscellaneous components. PrimeNG also exposes pass-through customization, which is a useful reference for Origo's extensibility model.

## API conventions

### Common properties

Unless explicitly excluded, interactive Origo components should support these common properties:

| Property | Type | Description |
|---|---|---|
| `id` | `string` | Stable component identifier used by metadata, labels, rules and automation. |
| `class` | `string` | Custom CSS class(es). |
| `style` | `object/string` | Inline/custom style configuration. |
| `visible` | `boolean` | Controls whether the component is rendered. |
| `disabled` | `boolean` | Prevents user interaction. |
| `readonly` | `boolean` | Displays the value without allowing edits. |
| `loading` | `boolean` | Shows a loading state and suppresses unsafe interaction. |
| `size` | `small/medium/large` | Standardized component size. |
| `variant` | `string` | Visual variant such as outlined, filled, text or elevated. |
| `fluid` | `boolean` | Makes the component fill available width. |
| `ariaLabel` | `string` | Accessible name. |
| `ariaDescribedBy` | `string` | IDs of elements providing additional accessible description. |
| `testId` | `string` | Stable test automation identifier. |
| `permissions` | `PermissionConfig` | Declarative visibility/enablement permission rules. |
| `rules` | `Rule[]` | Declarative business/UI rules evaluated by Origo. |
| `metadata` | `object` | Arbitrary application metadata. |

### Common form properties

Form controls additionally standardize:

| Property | Type | Description |
|---|---|---|
| `value` | `unknown` | Current control value. |
| `defaultValue` | `unknown` | Initial value when uncontrolled. |
| `name` | `string` | Form/control field name. |
| `label` | `string` | Human-readable field label. |
| `placeholder` | `string` | Placeholder displayed when empty. |
| `required` | `boolean` | Marks the field as mandatory. |
| `invalid` | `boolean` | Explicit validation error state. |
| `errorText` | `string` | Validation message shown to the user. |
| `helpText` | `string` | Advisory text displayed below/near the control. |
| `autocomplete` | `string` | Browser autocomplete hint. |

### Common events

Events should use predictable names:

`valueChange`, `focus`, `blur`, `input`, `change`, `clear`, `click`, `open`, `close`, `submit`, `cancel`, `invalid`.

Event payloads should include at minimum:

```ts
{
  value,
  previousValue,
  componentId,
  source,
  originalEvent
}
```

---

# 1. FORM COMPONENTS

## 1.1 InputText

**Purpose:** Single-line text entry.

### Inputs

| Property | Description |
|---|---|
| `value` | Current text value. |
| `type` | Native input type such as text, email, URL or search. |
| `maxlength` | Maximum number of characters. |
| `minlength` | Minimum number of characters. |
| `pattern` | Validation pattern. |
| `autocomplete` | Browser autocomplete behavior. |
| `spellcheck` | Enables/disables browser spell checking. |
| `prefix` | Text/icon displayed before the value. |
| `suffix` | Text/icon displayed after the value. |

### Events

| Event | Description |
|---|---|
| `valueChange` | Fires when the text value changes. |
| `input` | Fires for each user input operation. |
| `focus` | Fires when the field receives focus. |
| `blur` | Fires when the field loses focus. |
| `clear` | Fires when the current value is cleared. |

## 1.2 Textarea

**Purpose:** Multi-line text entry.

### Inputs

`value` — current text; `rows` — preferred visible rows; `cols` — preferred width; `maxlength` — maximum characters; `autoResize` — automatically grows with content; `minRows` — minimum auto-resize rows; `maxRows` — maximum auto-resize rows; `wrap` — text wrapping behavior.

### Events

`valueChange` — value changed; `input` — user typed/edited; `focus` — focused; `blur` — unfocused; `resize` — rendered height changed.

## 1.3 InputNumber

**Purpose:** Locale-aware numeric input.

### Inputs

`value` — numeric value; `min` — minimum allowed value; `max` — maximum allowed value; `step` — increment/decrement step; `minFractionDigits` — minimum decimals; `maxFractionDigits` — maximum decimals; `useGrouping` — thousands grouping; `locale` — number locale; `mode` — decimal/currency/percent; `currency` — ISO currency code; `currencyDisplay` — symbol/code/name; `prefix` — displayed prefix; `suffix` — displayed suffix; `showButtons` — shows increment/decrement controls.

### Events

`valueChange` — numeric value changed; `input` — raw input changed; `focus` — focused; `blur` — unfocused; `increment` — value incremented; `decrement` — value decremented.

## 1.4 InputMask

**Purpose:** Structured text entry using a mask.

### Inputs

`value` — current value; `mask` — input mask definition; `slotChar` — placeholder character; `autoClear` — clears incomplete values; `unmask` — emits raw unmasked value; `characterPattern` — custom mask character definitions.

### Events

`valueChange` — masked value changed; `complete` — mask became complete; `incomplete` — incomplete value detected; `focus` — focused; `blur` — unfocused.

## 1.5 Password

**Purpose:** Secure password entry with visibility and strength support.

### Inputs

`value` — password value; `feedback` — displays password strength feedback; `toggleMask` — enables visibility toggle; `promptLabel` — initial feedback text; `weakLabel` — weak-strength text; `mediumLabel` — medium-strength text; `strongLabel` — strong-strength text; `maxlength` — maximum length.

### Events

`valueChange` — password changed; `strengthChange` — strength classification changed; `show` — password became visible; `hide` — password became masked; `focus` — focused; `blur` — unfocused.

## 1.6 Checkbox

**Purpose:** Boolean or multi-select option.

### Inputs

`value` — checked value; `binary` — treats value as boolean; `indeterminate` — displays mixed state; `label` — associated label; `trueValue` — checked value; `falseValue` — unchecked value.

### Events

`valueChange` — checked state changed; `check` — became checked; `uncheck` — became unchecked; `indeterminateChange` — indeterminate state changed; `focus` — focused; `blur` — unfocused.

## 1.7 CheckboxGroup

**Purpose:** Grouped multi-selection.

### Inputs

`options` — selectable options; `value` — selected values; `optionLabel` — label property; `optionValue` — value property; `layout` — row/column/grid layout; `maxSelected` — maximum selections; `orientation` — horizontal/vertical.

### Events

`valueChange` — selection collection changed; `optionSelect` — option selected; `optionUnselect` — option removed; `invalid` — group failed validation.

## 1.8 RadioGroup

**Purpose:** Single selection from mutually exclusive options.

### Inputs

`options` — available options; `value` — selected value; `optionLabel` — label property; `optionValue` — value property; `orientation` — layout direction; `allowEmpty` — allows clearing selection.

### Events

`valueChange` — selected value changed; `select` — option selected; `focus` — group focused; `blur` — group unfocused.

## 1.9 Select

**Purpose:** Single-selection dropdown.

### Inputs

`options` — available choices; `value` — selected choice; `optionLabel` — display field; `optionValue` — value field; `optionGroupLabel` — group label field; `optionGroupChildren` — grouped option field; `placeholder` — empty-state text; `filter` — enables option search; `filterPlaceholder` — filter prompt; `editable` — allows typed values; `clearable` — shows clear action; `appendTo` — overlay host; `virtualScroll` — enables virtualization; `itemSize` — virtual item height; `loading` — loads options asynchronously.

### Events

`valueChange` — selected value changed; `change` — selection committed; `filter` — option filter changed; `open` — dropdown opened; `close` — dropdown closed; `clear` — selection cleared; `optionSelect` — option selected.

## 1.10 MultiSelect

**Purpose:** Multiple option selection with filtering.

### Inputs

`options` — available options; `value` — selected values; `optionLabel` — display field; `optionValue` — value field; `placeholder` — empty-state label; `filter` — enables filtering; `showToggleAll` — displays select-all control; `maxSelectedLabels` — maximum selected labels shown; `selectedItemsLabel` — summary text template; `virtualScroll` — enables virtualization; `itemSize` — virtual item height; `display` — chip/label display mode.

### Events

`valueChange` — selection changed; `select` — option selected; `unselect` — option removed; `selectAll` — all options selected; `unselectAll` — all options cleared; `filter` — filter changed; `open` — opened; `close` — closed; `clear` — selection cleared.

## 1.11 AutoComplete

**Purpose:** Search-assisted value selection.

### Inputs

`value` — current value; `suggestions` — current suggestions; `minQueryLength` — characters before searching; `delay` — debounce delay; `multiple` — allows multiple values; `forceSelection` — restricts value to suggestions; `optionLabel` — display field; `optionValue` — value field; `completeOnFocus` — searches on focus; `virtualScroll` — virtualizes suggestions; `loading` — suggestion loading state.

### Events

`valueChange` — value changed; `complete` — search requested; `select` — suggestion selected; `unselect` — selected item removed; `clear` — value cleared; `focus` — focused; `blur` — unfocused; `open` — suggestion panel opened; `close` — panel closed.

## 1.12 CascadeSelect

**Purpose:** Hierarchical option selection.

### Inputs

`options` — hierarchical options; `value` — selected value; `optionLabel` — display field; `optionValue` — value field; `optionGroupLabel` — group label; `optionGroupChildren` — child collection; `placeholder` — empty text; `appendTo` — overlay host; `loading` — loading state.

### Events

`valueChange` — selected value changed; `select` — leaf option selected; `groupExpand` — hierarchy level opened; `open` — panel opened; `close` — panel closed; `clear` — value cleared.

## 1.13 TreeSelect

**Purpose:** Select values from hierarchical data.

### Inputs

`options` — tree nodes; `value` — selected node/value; `selectionMode` — single/multiple/checkbox; `filter` — enables node filtering; `filterPlaceholder` — filter prompt; `metaKeySelection` — modifier-key selection behavior; `propagateSelectionUp` — parent selection propagation; `propagateSelectionDown` — child selection propagation; `virtualScroll` — virtualizes nodes; `loading` — loading state.

### Events

`valueChange` — selection changed; `nodeSelect` — node selected; `nodeUnselect` — node unselected; `nodeExpand` — node expanded; `nodeCollapse` — node collapsed; `filter` — filter changed; `open` — opened; `close` — closed.

## 1.14 Listbox

**Purpose:** Visible list-based selection.

### Inputs

`options` — list options; `value` — selected value(s); `multiple` — allows multiple selection; `optionLabel` — label field; `optionValue` — value field; `filter` — enables filtering; `filterPlaceholder` — filter prompt; `virtualScroll` — virtualization; `listStyle` — list styling configuration.

### Events

`valueChange` — selection changed; `select` — item selected; `unselect` — item removed; `filter` — filter changed; `focus` — focused; `blur` — unfocused.

## 1.15 DatePicker

**Purpose:** Date, date-range and calendar-based selection.

### Inputs

`value` — selected date/value; `selectionMode` — single/multiple/range; `view` — month/year/date view; `minDate` — earliest date; `maxDate` — latest date; `disabledDates` — unavailable dates; `disabledDays` — unavailable weekdays; `dateFormat` — display format; `showIcon` — calendar icon; `showButtonBar` — today/clear controls; `showTime` — enables time; `hourFormat` — 12/24 hour format; `showSeconds` — enables seconds; `numberOfMonths` — displayed months; `inline` — permanently displays calendar; `monthNavigator` — month selection; `yearNavigator` — year selection; `locale` — date locale; `timezone` — display timezone; `readonlyInput` — prevents typing.

### Events

`valueChange` — date value changed; `dateSelect` — date selected; `monthChange` — visible month changed; `yearChange` — visible year changed; `open` — calendar opened; `close` — calendar closed; `clear` — date cleared; `today` — today action selected.

## 1.16 ColorPicker

**Purpose:** Color selection.

### Inputs

`value` — selected color; `format` — hex/rgb/hsl representation; `inline` — permanently displays picker; `disabled` — disables selection; `showAlpha` — supports transparency.

### Events

`valueChange` — color changed; `open` — picker opened; `close` — picker closed; `complete` — selection committed.

## 1.17 Slider

**Purpose:** Numeric range selection.

### Inputs

`value` — current number; `min` — minimum; `max` — maximum; `step` — increment; `range` — enables two-handle range; `orientation` — horizontal/vertical; `tooltip` — displays value tooltip; `tooltipPosition` — tooltip placement.

### Events

`valueChange` — value changed; `slideStart` — dragging started; `slide` — value changed during drag; `slideEnd` — dragging ended.

## 1.18 ToggleSwitch

**Purpose:** Boolean on/off control.

### Inputs

`value` — checked state; `trueValue` — enabled value; `falseValue` — disabled value; `onLabel` — enabled label; `offLabel` — disabled label; `showIcon` — displays state icons.

### Events

`valueChange` — state changed; `toggle` — state toggled; `focus` — focused; `blur` — unfocused.

## 1.19 ToggleButton

**Purpose:** Button-style boolean selection.

### Inputs

`value` — current state; `onLabel` — selected label; `offLabel` — unselected label; `onIcon` — selected icon; `offIcon` — unselected icon; `pressed` — explicit pressed state.

### Events

`valueChange` — state changed; `click` — button clicked; `focus` — focused; `blur` — unfocused.

## 1.20 SelectButton

**Purpose:** Single or multiple selection using button segments.

### Inputs

`options` — available choices; `value` — selected value(s); `multiple` — allows multiple selection; `optionLabel` — label field; `optionValue` — value field; `allowEmpty` — allows no selection.

### Events

`valueChange` — selection changed; `optionSelect` — option selected; `optionUnselect` — option removed; `click` — option clicked.

## 1.21 Rating

**Purpose:** Star/scale rating input.

### Inputs

`value` — rating value; `stars` — number of rating levels; `cancel` — allows clearing; `readonly` — display-only mode; `iconOn` — selected icon; `iconOff` — unselected icon.

### Events

`valueChange` — rating changed; `rate` — rating selected; `cancel` — rating cleared.

## 1.22 InputOtp

**Purpose:** One-time-password or segmented code input.

### Inputs

`value` — current OTP; `length` — number of characters; `integerOnly` — restricts to digits; `mask` — masks entered characters; `autofocus` — focuses on render.

### Events

`valueChange` — OTP changed; `complete` — required length reached; `input` — character entered; `paste` — value pasted.

## 1.23 Editor

**Purpose:** Rich text editing.

### Inputs

`value` — HTML/text content; `toolbar` — toolbar configuration; `placeholder` — empty-state text; `readonly` — display-only mode; `formats` — permitted formatting features; `sanitize` — sanitizes HTML; `height` — editor height.

### Events

`valueChange` — content changed; `textChange` — text changed; `selectionChange` — editor selection changed; `focus` — focused; `blur` — unfocused.

## 1.24 InputGroup

**Purpose:** Visually combine inputs, addons and actions.

### Inputs

`orientation` — horizontal/vertical grouping; `fluid` — fills container; `size` — standard group size.

### Events

`focus` — a child input received focus; `blur` — all child inputs lost focus.

## 1.25 FormField

**Purpose:** Standard wrapper for label, control, help and validation.

### Inputs

`control` — bound control definition; `label` — field label; `required` — mandatory indicator; `helpText` — advisory text; `errorText` — validation text; `labelPosition` — label placement; `showValidation` — validation visibility policy.

### Events

`valueChange` — wrapped control changed; `focus` — control focused; `blur` — control blurred; `invalid` — validation failed.

## 1.26 Form

**Purpose:** Declarative form orchestration and validation.

### Inputs

`schema` — form metadata/schema; `model` — bound form data; `validationMode` — validation timing; `layout` — form layout; `submitLabel` — submit action label; `resetOnSubmit` — resets after successful submit; `readonly` — makes all fields read-only; `loading` — submit/loading state; `rules` — cross-field/business validation rules.

### Events

`valueChange` — form model changed; `submit` — form submitted successfully; `invalid` — submission blocked by validation; `reset` — form reset; `fieldChange` — individual field changed; `fieldFocus` — field focused; `fieldBlur` — field blurred.

---

# 2. BUTTONS & ACTIONS

## 2.1 Button

### Inputs

`label` — visible button text; `icon` — button icon; `iconPosition` — icon placement; `severity` — semantic color/intent; `variant` — visual style; `size` — button size; `rounded` — rounded shape; `outlined` — outlined style; `text` — text-only style; `loading` — loading indicator; `loadingIcon` — loading icon; `type` — native button type; `badge` — badge value; `badgeSeverity` — badge semantic severity; `command` — declarative Origo action.

### Events

`click` — activated by the user; `focus` — focused; `blur` — unfocused; `command` — declarative action invoked.

## 2.2 IconButton

### Inputs

`icon` — icon to display; `label` — accessible label; `tooltip` — optional tooltip; `severity` — semantic intent; `variant` — visual style; `rounded` — circular/rounded presentation; `loading` — loading state.

### Events

`click` — icon button activated; `focus` — focused; `blur` — unfocused.

## 2.3 ButtonGroup

### Inputs

`buttons` — child button definitions; `orientation` — row/column; `attached` — visually joins buttons; `size` — shared size.

### Events

`buttonClick` — a child button was activated; `focus` — group focus entered; `blur` — group focus left.

## 2.4 SplitButton

### Inputs

`primaryAction` — main action definition; `menuItems` — secondary actions; `label` — main action label; `icon` — main action icon; `severity` — action severity; `loading` — main action loading; `appendTo` — menu overlay host.

### Events

`click` — primary action activated; `menuOpen` — action menu opened; `menuClose` — action menu closed; `itemSelect` — secondary action selected.

## 2.5 SpeedDial

### Inputs

`actions` — radial/floating actions; `direction` — expansion direction; `type` — linear/circular; `radius` — circular expansion radius; `transition` — animation style; `visible` — open/closed state.

### Events

`open` — actions expanded; `close` — actions collapsed; `actionClick` — child action activated.

## 2.6 ActionMenu

### Inputs

`items` — available actions; `trigger` — opening trigger; `placement` — menu placement; `context` — data passed to actions; `filter` — optional action filter; `permissions` — action visibility rules.

### Events

`open` — menu opened; `close` — menu closed; `action` — action invoked; `itemSelect` — menu item selected.

---

# 3. DATA COMPONENTS

## 3.1 DataTable

### Inputs

`value` — row collection; `columns` — column definitions; `dataKey` — unique row key; `selection` — selected row(s); `selectionMode` — single/multiple; `sortable` — enables sorting; `sortField` — active sort field; `sortOrder` — ascending/descending; `multiSortMeta` — multi-column sorting; `filterable` — enables filtering; `globalFilterFields` — fields used by global search; `paginator` — enables pagination; `rows` — page size; `first` — first row offset; `lazy` — delegates operations to server; `loading` — data loading state; `rowExpansion` — enables expandable rows; `editable` — enables editing; `virtualScroll` — enables virtualization; `scrollable` — enables table scrolling; `resizableColumns` — allows resizing; `reorderableColumns` — allows reordering; `frozenColumns` — frozen column definitions; `emptyMessage` — empty-state message; `exportable` — enables export; `rowClass` — row styling resolver; `rules` — row/action business rules.

### Events

`rowSelect` — row selected; `rowUnselect` — row deselected; `selectionChange` — selection collection changed; `sort` — sorting changed; `filter` — filtering changed; `page` — page changed; `lazyLoad` — server-side data requested; `rowExpand` — row expanded; `rowCollapse` — row collapsed; `cellEditInit` — cell editing started; `cellEditComplete` — cell edit committed; `cellEditCancel` — cell edit cancelled; `rowEditInit` — row editing started; `rowEditSave` — row edit saved; `rowEditCancel` — row edit cancelled; `columnResize` — column resized; `columnReorder` — column reordered; `contextMenu` — row/context menu invoked; `export` — export requested.

## 3.2 DataGrid

**Purpose:** High-density, virtualization-friendly grid for enterprise data.

### Inputs

`rows` — row data; `columns` — column definitions; `dataKey` — unique key; `selection` — selected records; `virtualScroll` — virtualization; `rowHeight` — row height; `pinnedColumns` — frozen columns; `groupBy` — grouping fields; `editable` — editing support; `filterable` — filtering; `sortable` — sorting; `resizable` — column resizing; `reorderable` — column ordering; `pagination` — paging configuration; `serverMode` — server-side operations; `loading` — loading state.

### Events

`selectionChange` — selection changed; `sortChange` — sorting changed; `filterChange` — filters changed; `pageChange` — page changed; `cellEdit` — cell edit committed; `rowEdit` — row edit committed; `columnResize` — column resized; `columnReorder` — column reordered; `rowExpand` — row expanded; `rowCollapse` — row collapsed; `dataRequest` — server data requested.

## 3.3 DataView

### Inputs

`value` — data collection; `layout` — list/grid; `paginator` — enables paging; `rows` — page size; `sortField` — sort field; `sortOrder` — sort direction; `loading` — loading state; `emptyMessage` — empty text.

### Events

`page` — page changed; `sort` — sorting changed; `itemClick` — item selected/clicked.

## 3.4 Paginator

### Inputs

`first` — first record offset; `rows` — page size; `totalRecords` — total available records; `rowsPerPageOptions` — allowed page sizes; `showFirstLastIcon` — first/last controls; `showPageLinks` — numbered page links; `template` — layout template.

### Events

`pageChange` — page index or size changed; `rowsChange` — page size changed.

## 3.5 Tree

### Inputs

`value` — tree nodes; `selection` — selected node(s); `selectionMode` — single/multiple/checkbox; `expandedKeys` — expanded nodes; `draggableNodes` — enables drag; `droppableNodes` — enables drop; `lazy` — lazy node loading; `loading` — loading state; `filter` — enables filtering; `filterMode` — matching mode; `virtualScroll` — virtualization.

### Events

`selectionChange` — selection changed; `nodeSelect` — node selected; `nodeUnselect` — node unselected; `nodeExpand` — node expanded; `nodeCollapse` — node collapsed; `nodeDrop` — node dropped; `filter` — tree filter changed; `lazyLoad` — child nodes requested.

## 3.6 TreeTable

### Inputs

`value` — hierarchical rows; `columns` — column definitions; `selection` — selected nodes; `selectionMode` — selection mode; `expandedKeys` — expanded nodes; `paginator` — paging; `rows` — page size; `lazy` — server-side loading; `loading` — loading state; `scrollable` — enables scrolling; `resizableColumns` — enables column resize.

### Events

`nodeSelect` — node selected; `nodeUnselect` — node unselected; `nodeExpand` — node expanded; `nodeCollapse` — node collapsed; `nodeDrop` — node moved; `page` — page changed; `sort` — sorting changed; `filter` — filtering changed; `lazyLoad` — data requested.

## 3.7 Timeline

### Inputs

`value` — timeline entries; `align` — left/right/alternate; `layout` — vertical/horizontal; `opposite` — opposite-side content template; `marker` — marker configuration; `connector` — connector configuration.

### Events

`itemClick` — timeline entry clicked; `itemAction` — entry action invoked.

## 3.8 Kanban

### Inputs

`columns` — board columns; `items` — cards; `groupField` — column grouping field; `itemKey` — unique card key; `draggable` — enables drag; `droppable` — enables drop; `filters` — board filters; `loading` — loading state.

### Events

`cardClick` — card selected; `cardMove` — card moved; `cardDrop` — drop completed; `columnMove` — column moved; `filterChange` — board filter changed.

## 3.9 MasterDetail

### Inputs

`master` — master dataset; `detail` — detail schema/content; `selectedKey` — selected master record; `splitRatio` — master/detail sizing; `responsive` — mobile behavior; `loading` — detail loading state.

### Events

`selectionChange` — master selection changed; `detailLoad` — detail requested; `splitResize` — divider resized.

## 3.10 OrderList

### Inputs

`value` — ordered items; `source` — source collection; `target` — target collection; `dragdrop` — enables drag/drop; `responsive` — responsive mode.

### Events

`reorder` — item order changed; `selectionChange` — selection changed; `itemMove` — item moved.

## 3.11 PickList

### Inputs

`source` — available items; `target` — selected items; `optionLabel` — display field; `optionValue` — value field; `dragdrop` — enables drag/drop; `filter` — filtering support; `responsive` — responsive layout.

### Events

`moveToTarget` — items moved to target; `moveToSource` — items returned to source; `moveAllToTarget` — all items moved; `moveAllToSource` — all items returned; `selectionChange` — selection changed.

## 3.12 VirtualScroller

### Inputs

`items` — virtualized collection; `itemSize` — item height/size; `orientation` — vertical/horizontal; `numToleratedItems` — buffer size; `lazy` — lazy loading; `delay` — lazy-load debounce; `loading` — loading state.

### Events

`scroll` — viewport scrolled; `lazyLoad` — additional items requested; `visibleRangeChange` — visible item range changed.

## 3.13 OrganizationChart

### Inputs

`value` — hierarchical organization nodes; `selection` — selected node(s); `selectionMode` — selection mode; `collapsible` — enables collapse; `preserveSpace` — deprecated/avoid in Origo; `layout` — tree orientation.

### Events

`selectionChange` — selection changed; `nodeSelect` — node selected; `nodeUnselect` — node unselected; `nodeExpand` — node expanded; `nodeCollapse` — node collapsed.

---

# 4. LAYOUT & PANELS

## 4.1 Card

### Inputs

`header` — header content; `subheader` — secondary heading; `footer` — footer content; `variant` — card visual style; `clickable` — enables interaction; `hoverable` — enables hover treatment.

### Events

`click` — card activated; `action` — card action invoked.

## 4.2 Panel

### Inputs

`header` — panel title; `collapsed` — collapsed state; `toggleable` — allows collapse; `toggleIcon` — toggle icon; `closable` — allows closing; `loading` — loading state.

### Events

`toggle` — collapsed state changed; `open` — panel opened; `close` — panel closed; `closeClick` — close action clicked.

## 4.3 Accordion

### Inputs

`items` — accordion panels; `value` — active panel key(s); `multiple` — allows multiple open panels; `disabled` — disables the whole accordion; `lazy` — lazy-renders content.

### Events

`valueChange` — active panel changed; `open` — panel opened; `close` — panel closed.

## 4.4 Tabs

### Inputs

`items` — tab definitions; `value` — active tab key; `scrollable` — enables tab scrolling; `lazy` — lazy-renders tab content; `orientation` — horizontal/vertical.

### Events

`valueChange` — active tab changed; `tabChange` — tab activated; `tabClose` — closable tab closed.

## 4.5 Stepper

### Inputs

`steps` — workflow steps; `value` — active step; `linear` — prevents skipping required steps; `readonly` — prevents navigation; `orientation` — horizontal/vertical; `completedSteps` — completed step keys.

### Events

`valueChange` — active step changed; `next` — next step requested; `previous` — previous step requested; `complete` — workflow completed; `stepClick` — step clicked.

## 4.6 Divider

### Inputs

`orientation` — horizontal/vertical; `type` — solid/dashed/dotted; `content` — optional center content.

### Events

None by default; `click` may be enabled when `content` is interactive.

## 4.7 Fieldset

### Inputs

`legend` — fieldset title; `toggleable` — allows collapse; `collapsed` — collapsed state; `toggleIcon` — toggle icon.

### Events

`toggle` — collapsed state changed.

## 4.8 ScrollPanel

### Inputs

`height` — viewport height; `width` — viewport width; `horizontal` — enables horizontal scrolling; `vertical` — enables vertical scrolling; `native` — uses native scrollbar behavior.

### Events

`scroll` — content scrolled; `reachStart` — top/left boundary reached; `reachEnd` — bottom/right boundary reached.

## 4.9 Splitter

### Inputs

`panels` — splitter panel definitions; `sizes` — panel percentages; `minSizes` — minimum panel sizes; `orientation` — horizontal/vertical; `gutterSize` — divider width; `resizable` — enables resizing.

### Events

`resizeStart` — resizing started; `resize` — sizes changed during drag; `resizeEnd` — resizing completed.

## 4.10 Toolbar

### Inputs

`start` — leading content/actions; `center` — central content/actions; `end` — trailing content/actions; `responsive` — responsive behavior; `orientation` — layout direction.

### Events

`action` — contained action invoked.

## 4.11 Stack

### Inputs

`direction` — row/column; `gap` — child spacing; `align` — cross-axis alignment; `justify` — main-axis distribution; `wrap` — wrapping behavior; `responsive` — breakpoint-specific layout.

### Events

None by default.

## 4.12 Grid

### Inputs

`columns` — number of columns; `gap` — grid spacing; `responsive` — breakpoint column configuration; `align` — item alignment; `justify` — content distribution.

### Events

None by default.

## 4.13 Sidebar / Drawer

### Inputs

`visible` — open state; `position` — left/right/top/bottom; `modal` — adds backdrop; `dismissible` — closes from backdrop; `closeOnEscape` — closes with Escape; `blockScroll` — locks page scrolling; `size` — drawer size; `header` — header content; `footer` — footer content.

### Events

`visibleChange` — open state changed; `open` — drawer opened; `close` — drawer closed; `show` — opening animation completed; `hide` — closing animation completed.

---

# 5. OVERLAYS

## 5.1 Dialog

### Inputs

`visible` — visibility state; `header` — dialog title; `modal` — backdrop behavior; `closable` — displays close action; `closeOnEscape` — Escape behavior; `dismissableMask` — backdrop closes dialog; `draggable` — enables dragging; `resizable` — enables resizing; `maximizable` — enables maximize; `maximized` — maximized state; `width` — dialog width; `height` — dialog height; `breakpoints` — responsive widths; `position` — screen position; `blockScroll` — prevents background scroll; `data` — contextual data.

### Events

`visibleChange` — visibility changed; `open` — opened; `close` — closed; `maximize` — maximized; `restore` — restored; `dragEnd` — moved; `resizeEnd` — resized.

## 5.2 Popover

### Inputs

`visible` — visibility state; `placement` — preferred placement; `dismissible` — closes outside click; `showClose` — displays close action; `appendTo` — overlay host; `data` — contextual data.

### Events

`open` — popover opened; `close` — popover closed; `action` — contained action invoked.

## 5.3 Tooltip

### Inputs

`content` — tooltip text/content; `position` — placement; `showDelay` — delay before showing; `hideDelay` — delay before hiding; `disabled` — disables tooltip; `trigger` — hover/focus/manual.

### Events

`show` — tooltip became visible; `hide` — tooltip became hidden.

## 5.4 ConfirmationDialog

### Inputs

`visible` — visibility; `message` — confirmation content; `header` — title; `acceptLabel` — confirmation action label; `rejectLabel` — cancellation label; `acceptSeverity` — confirmation action style; `rejectSeverity` — cancellation style; `icon` — confirmation icon; `data` — contextual payload.

### Events

`accept` — user confirmed; `reject` — user cancelled; `close` — dialog closed.

## 5.5 BottomSheet

### Inputs

`visible` — open state; `height` — sheet height; `snapPoints` — allowed heights; `dismissible` — allows backdrop dismissal; `draggable` — allows drag; `modal` — backdrop behavior.

### Events

`visibleChange` — visibility changed; `open` — opened; `close` — closed; `snapChange` — snap point changed; `dragEnd` — drag completed.

---

# 6. NAVIGATION

## 6.1 Breadcrumb

### Inputs

`items` — breadcrumb entries; `home` — home entry; `separator` — separator icon/content; `routerMode` — internal navigation strategy.

### Events

`itemClick` — breadcrumb item activated.

## 6.2 Menu

### Inputs

`items` — menu model; `popup` — popup mode; `visible` — popup visibility; `appendTo` — overlay host; `autoDisplay` — submenu behavior; `modelContext` — data context.

### Events

`itemClick` — item activated; `itemExpand` — submenu expanded; `itemCollapse` — submenu collapsed; `open` — popup opened; `close` — popup closed.

## 6.3 ContextMenu

### Inputs

`items` — context actions; `target` — target element/selector; `autoZIndex` — overlay stacking; `appendTo` — overlay host; `modelContext` — context data.

### Events

`itemClick` — action selected; `open` — menu opened; `close` — menu closed.

## 6.4 Menubar

### Inputs

`items` — top-level menu model; `orientation` — horizontal/vertical; `routerMode` — navigation integration; `modelContext` — action context.

### Events

`itemClick` — item activated; `itemExpand` — submenu opened; `itemCollapse` — submenu closed.

## 6.5 CommandPalette

### Inputs

`commands` — command definitions; `visible` — visibility; `shortcut` — keyboard shortcut; `placeholder` — search prompt; `maxResults` — result limit; `groupBy` — result grouping; `recentCommands` — recent command support.

### Events

`open` — palette opened; `close` — palette closed; `search` — query changed; `commandSelect` — command selected; `shortcut` — shortcut invoked.

## 6.6 NavigationSidebar

### Inputs

`items` — navigation tree; `activeKey` — active item; `collapsed` — compact mode; `responsive` — mobile behavior; `permissions` — navigation visibility rules; `searchable` — navigation search.

### Events

`activeChange` — active navigation item changed; `itemClick` — item clicked; `collapseChange` — sidebar collapsed/expanded; `search` — navigation search changed.

---

# 7. MESSAGES & STATUS

## 7.1 Message

### Inputs

`severity` — info/success/warn/error; `text` — message content; `icon` — optional icon; `closable` — allows dismissal; `variant` — visual style; `life` — automatic close duration.

### Events

`close` — message dismissed; `action` — message action invoked.

## 7.2 Toast

### Inputs

`messages` — toast collection; `position` — screen position; `life` — display duration; `closable` — allows dismissal; `preventDuplicates` — suppresses duplicates; `group` — toast group identifier.

### Events

`show` — toast displayed; `close` — toast dismissed; `action` — toast action invoked.

## 7.3 Alert

### Inputs

`severity` — alert intent; `title` — alert title; `message` — alert body; `icon` — icon; `closable` — dismissibility; `actions` — optional actions.

### Events

`close` — alert dismissed; `action` — alert action invoked.

## 7.4 Badge

### Inputs

`value` — badge content; `severity` — semantic severity; `size` — badge size; `shape` — shape; `max` — maximum numeric display.

### Events

`click` — badge clicked when interactive.

## 7.5 Tag

### Inputs

`value` — tag text; `severity` — semantic severity; `icon` — optional icon; `rounded` — rounded shape; `removable` — allows removal.

### Events

`remove` — tag removed; `click` — tag clicked.

## 7.6 Chip

### Inputs

`label` — chip text; `icon` — leading icon; `image` — avatar/image; `removable` — allows removal; `clickable` — enables interaction.

### Events

`click` — chip clicked; `remove` — chip removed.

## 7.7 Spinner

### Inputs

`size` — spinner size; `strokeWidth` — line thickness; `label` — accessible loading text; `variant` — spinner style.

### Events

None by default.

## 7.8 ProgressBar

### Inputs

`value` — progress percentage/value; `mode` — determinate/indeterminate; `showValue` — displays numeric value; `max` — maximum value; `label` — accessible label.

### Events

`complete` — progress reached maximum.

## 7.9 Skeleton

### Inputs

`shape` — rectangle/circle/etc.; `width` — rendered width; `height` — rendered height; `borderRadius` — radius; `animation` — shimmer/none.

### Events

None by default.

## 7.10 EmptyState

### Inputs

`title` — primary message; `description` — explanatory text; `icon` — illustrative icon; `action` — optional action; `illustration` — optional visual.

### Events

`action` — empty-state action invoked.

## 7.11 ErrorState

### Inputs

`title` — error title; `message` — explanation; `code` — application error code; `retryable` — shows retry action; `retryLabel` — retry label; `details` — optional technical details.

### Events

`retry` — retry requested; `action` — secondary action invoked.

---

# 8. FILE & MEDIA

## 8.1 FileUpload

### Inputs

`accept` — accepted MIME/extensions; `multiple` — multiple files; `maxFileSize` — per-file limit; `maxFiles` — file count limit; `auto` — uploads automatically; `url` — upload endpoint abstraction; `headers` — request headers; `chunkSize` — chunk size; `dragDrop` — enables drop zone; `showUploadButton` — upload action visibility; `showCancelButton` — cancel action visibility; `customUpload` — delegates upload implementation; `disabled` — disables upload.

### Events

`select` — files selected; `uploadStart` — upload started; `uploadProgress` — progress changed; `upload` — upload completed; `uploadError` — upload failed; `remove` — file removed; `cancel` — upload cancelled; `clear` — queue cleared.

## 8.2 FileList

### Inputs

`files` — file collection; `showPreview` — preview support; `showSize` — displays file size; `downloadable` — enables download; `removable` — enables removal; `emptyMessage` — empty-state text.

### Events

`fileClick` — file clicked; `download` — download requested; `remove` — file removal requested; `preview` — preview requested.

## 8.3 Image

### Inputs

`src` — image URL/source; `alt` — accessible description; `preview` — enables full-size preview; `width` — rendered width; `height` — rendered height; `fit` — object-fit behavior; `fallback` — fallback source.

### Events

`load` — image loaded; `error` — image failed; `previewOpen` — preview opened; `previewClose` — preview closed.

## 8.4 Carousel

### Inputs

`value` — items; `numVisible` — visible items; `numScroll` — items moved per navigation; `orientation` — horizontal/vertical; `circular` — wraps around; `autoplay` — automatic rotation; `interval` — rotation interval; `responsiveOptions` — breakpoint behavior; `page` — active page.

### Events

`pageChange` — carousel page changed; `itemClick` — item clicked; `play` — autoplay started; `pause` — autoplay paused.

## 8.5 MediaViewer

### Inputs

`sources` — media sources; `activeIndex` — active media; `showControls` — player controls; `downloadable` — download support; `fullscreen` — fullscreen support.

### Events

`activeChange` — media changed; `play` — playback started; `pause` — playback paused; `ended` — playback ended; `fullscreenChange` — fullscreen changed.

---

# 9. DATA VISUALIZATION

## 9.1 Chart

### Inputs

`type` — chart type; `data` — chart data; `options` — chart configuration; `plugins` — visualization plugins; `responsive` — responsive rendering; `height` — chart height; `width` — chart width; `loading` — loading state; `emptyMessage` — no-data message.

### Events

`dataPointClick` — chart point clicked; `legendClick` — legend item clicked; `hover` — pointer moved over data; `zoom` — zoom changed; `renderComplete` — chart rendered.

## 9.2 KPI

### Inputs

`label` — metric name; `value` — primary value; `unit` — unit/currency; `trend` — trend value; `trendDirection` — up/down/neutral; `severity` — semantic state; `icon` — metric icon; `comparison` — comparison text; `loading` — loading state.

### Events

`click` — KPI activated; `action` — KPI action invoked.

## 9.3 Metric

### Inputs

`value` — metric value; `label` — metric label; `format` — number/date/currency formatting; `locale` — formatting locale; `trend` — trend information; `target` — target value; `thresholds` — semantic thresholds.

### Events

`click` — metric clicked; `thresholdChange` — threshold state changed.

## 9.4 Gauge

### Inputs

`value` — current value; `min` — minimum; `max` — maximum; `unit` — displayed unit; `segments` — colored/semantic ranges; `label` — center label; `animated` — animated transition.

### Events

`valueChange` — displayed value changed; `click` — gauge clicked.

## 9.5 Sparkline

### Inputs

`data` — compact data series; `type` — line/bar/area; `min` — minimum scale; `max` — maximum scale; `showPoint` — highlights points; `trend` — semantic trend.

### Events

`pointClick` — point clicked; `hover` — point hovered.

## 9.6 Heatmap

### Inputs

`data` — matrix/cell data; `xAxis` — horizontal categories; `yAxis` — vertical categories; `colorScale` — value-to-color mapping; `showValues` — cell labels; `tooltip` — tooltip configuration.

### Events

`cellClick` — cell clicked; `cellHover` — cell hovered.

---

# 10. AVATAR & PEOPLE

## 10.1 Avatar

### Inputs

`image` — image URL; `label` — initials/text fallback; `icon` — icon fallback; `shape` — circle/square; `size` — avatar size; `status` — online/offline/etc.; `alt` — accessible description.

### Events

`click` — avatar clicked.

## 10.2 AvatarGroup

### Inputs

`items` — avatar collection; `max` — visible avatar limit; `overflowLabel` — overflow text; `size` — group size; `shape` — avatar shape.

### Events

`itemClick` — avatar clicked; `overflowClick` — overflow indicator clicked.

## 10.3 UserSelector

### Inputs

`options` — user records; `value` — selected user(s); `multiple` — multiple selection; `searchable` — user search; `optionLabel` — display field; `optionValue` — identity field; `includeInactive` — includes inactive users; `loading` — search/loading state.

### Events

`valueChange` — selection changed; `search` — user search requested; `select` — user selected; `unselect` — user removed.

---

# 11. ENTERPRISE / ORIGO-NATIVE COMPONENTS

These are intentionally beyond PrimeNG parity and are central to Origo's differentiation.

## 11.1 PermissionGate

### Inputs

`permission` — required permission; `permissions` — any/all permission rules; `role` — required role; `fallback` — alternate content; `mode` — hide/disable/readonly; `context` — permission evaluation context.

### Events

`permissionChange` — effective permission changed; `denied` — access was denied.

## 11.2 RoleGate

### Inputs

`roles` — allowed roles; `mode` — hide/disable/readonly; `match` — any/all role matching; `fallback` — fallback content.

### Events

`accessChange` — effective role access changed; `denied` — access denied.

## 11.3 BusinessAction

### Inputs

`action` — business action identifier; `label` — visible label; `icon` — action icon; `rules` — precondition rules; `permissions` — authorization rules; `confirmation` — confirmation configuration; `optimistic` — optimistic UI behavior; `loading` — execution state; `context` — entity/action context.

### Events

`beforeExecute` — action is about to execute; `execute` — action invoked; `success` — action completed; `error` — action failed; `cancel` — action cancelled; `ruleBlocked` — business rule prevented execution.

## 11.4 Workflow

### Inputs

`definition` — workflow metadata; `currentState` — current workflow state; `context` — workflow data; `steps` — workflow steps; `actions` — available transitions; `permissions` — workflow permissions; `readonly` — display-only mode.

### Events

`stateChange` — workflow state changed; `transitionStart` — transition started; `transitionSuccess` — transition completed; `transitionError` — transition failed; `action` — workflow action invoked.

## 11.5 Approval

### Inputs

`entity` — approval subject; `status` — approval status; `approvers` — approval participants; `currentUser` — current approver context; `actions` — approve/reject/request-change actions; `rules` — approval invariants; `commentRequired` — whether comments are required.

### Events

`approve` — approval accepted; `reject` — approval rejected; `requestChange` — changes requested; `delegate` — approval delegated; `comment` — approval comment added.

## 11.6 ApprovalTimeline

### Inputs

`entries` — approval history; `currentStep` — active step; `showComments` — displays comments; `showActors` — displays participants; `showTimestamps` — displays timestamps.

### Events

`entryClick` — history entry clicked; `actorClick` — actor clicked.

## 11.7 AuditTimeline

### Inputs

`entries` — audit records; `entityId` — entity identifier; `entityType` — entity type; `groupByDate` — groups records by date; `showDiff` — enables before/after diff; `pageSize` — records per page; `loading` — loading state.

### Events

`entryClick` — audit entry clicked; `loadMore` — more history requested; `diffOpen` — change diff opened.

## 11.8 ActivityFeed

### Inputs

`items` — activity records; `pageSize` — page size; `loadMore` — enables incremental loading; `groupByDate` — date grouping; `filter` — activity filters.

### Events

`itemClick` — activity clicked; `loadMore` — more activities requested; `filterChange` — activity filter changed.

## 11.9 EntitySelector

### Inputs

`entityType` — entity being selected; `value` — selected entity(s); `multiple` — multiple selection; `displayField` — display property; `valueField` — identity property; `searchFields` — searchable fields; `filters` — base filters; `query` — data query configuration; `allowCreate` — allows creation; `loading` — loading state.

### Events

`valueChange` — selected entity changed; `search` — entity search requested; `select` — entity selected; `unselect` — entity removed; `create` — create-new requested; `clear` — selection cleared.

## 11.10 DynamicForm

### Inputs

`schema` — declarative form schema; `model` — form data; `rules` — business/UI rules; `permissions` — field/action permissions; `layout` — layout definition; `validation` — validation configuration; `submitAction` — submit action definition; `readonly` — display-only mode.

### Events

`valueChange` — model changed; `fieldChange` — field changed; `submit` — form submitted; `invalid` — validation failed; `ruleChange` — dynamic rule changed rendered state.

## 11.11 DynamicTable

### Inputs

`schema` — table metadata; `dataSource` — data source definition; `query` — filtering/sorting/pagination query; `columns` — column metadata; `actions` — row/bulk actions; `permissions` — action/field permissions; `rules` — business/UI rules; `serverMode` — server-side operations.

### Events

`queryChange` — query state changed; `selectionChange` — selection changed; `action` — table action invoked; `rowClick` — row clicked; `dataRequest` — data requested; `export` — export requested.

## 11.12 DynamicPage

### Inputs

`schema` — page metadata; `routeParams` — route context; `queryParams` — URL query context; `data` — page data; `permissions` — page permissions; `rules` — page rules; `layout` — layout metadata; `loading` — page loading state.

### Events

`ready` — page rendered and initialized; `action` — page action invoked; `navigation` — navigation requested; `error` — page operation failed.

## 11.13 DynamicLayout

### Inputs

`schema` — layout metadata; `children` — dynamic child definitions; `responsive` — breakpoint rules; `rules` — conditional layout rules; `permissions` — visibility/access rules.

### Events

`layoutChange` — layout state changed; `action` — child action invoked.

---

# 12. AI-NATIVE COMPONENTS

## 12.1 AIAssistant

### Inputs

`provider` — AI provider/model configuration; `systemPrompt` — assistant behavior; `context` — business/application context; `tools` — available tools; `conversation` — conversation state; `streaming` — streaming responses; `suggestions` — suggested prompts; `permissions` — tool/action permissions.

### Events

`messageSend` — user message submitted; `responseStart` — AI response started; `responseChunk` — streamed response chunk received; `responseComplete` — response completed; `toolStart` — tool execution started; `toolComplete` — tool execution completed; `error` — AI operation failed.

## 12.2 AIChat

### Inputs

`messages` — conversation messages; `model` — selected model; `placeholder` — prompt placeholder; `streaming` — streaming mode; `attachments` — attachment support; `citations` — citation display; `tools` — enabled tools; `readonly` — display-only mode.

### Events

`send` — prompt submitted; `messageAction` — message action invoked; `cancel` — generation cancelled; `regenerate` — response regeneration requested; `attachmentAdd` — attachment added; `attachmentRemove` — attachment removed.

## 12.3 AICopilot

### Inputs

`context` — application context; `actions` — available AI actions; `suggestions` — contextual suggestions; `position` — panel placement; `autoOpen` — opens automatically; `model` — AI model configuration.

### Events

`open` — copilot opened; `close` — copilot closed; `suggestionSelect` — suggestion selected; `action` — AI action invoked; `response` — AI response completed.

## 12.4 AISuggestion

### Inputs

`suggestions` — suggestion collection; `mode` — inline/list/chips; `maxVisible` — maximum visible suggestions; `loading` — suggestion generation state.

### Events

`select` — suggestion selected; `refresh` — new suggestions requested.

## 12.5 AIAction

### Inputs

`action` — AI action identifier; `prompt` — action prompt/template; `context` — action context; `tools` — permitted tools; `confirmation` — confirmation policy; `permissions` — action permissions; `streaming` — streaming support.

### Events

`execute` — AI action started; `success` — completed successfully; `error` — failed; `toolCall` — tool invoked; `approvalRequired` — user approval required.

## 12.6 AIResponse

### Inputs

`content` — generated response; `format` — markdown/text/structured; `streaming` — streaming state; `citations` — sources; `actions` — response actions; `showThinking` — optional reasoning/status presentation; `editable` — allows editing.

### Events

`copy` — response copied; `regenerate` — regeneration requested; `edit` — response edited; `action` — response action invoked; `citationClick` — citation selected.

## 12.7 AICitation

### Inputs

`source` — source metadata; `title` — source title; `url` — source location; `snippet` — supporting excerpt; `index` — citation index.

### Events

`click` — citation opened; `preview` — source preview requested.

## 12.8 AIApproval

### Inputs

`request` — proposed AI operation; `risk` — risk classification; `actions` — approve/reject/edit actions; `context` — business context; `changes` — proposed changes.

### Events

`approve` — operation approved; `reject` — operation rejected; `edit` — proposal edited; `cancel` — approval cancelled.

---

# 13. ORIGO SYSTEM DIRECTIVES / UTILITIES

## 13.1 FocusTrap

### Inputs

`enabled` — activates focus trapping; `initialFocus` — initial target; `returnFocus` — restores previous focus.

### Events

`activate` — trap activated; `deactivate` — trap deactivated.

## 13.2 AutoFocus

### Inputs

`enabled` — enables autofocus; `delay` — focus delay; `selector` — target selector.

### Events

`focused` — target received focus.

## 13.3 Clipboard

### Inputs

`value` — content to copy; `format` — text/html/etc.; `feedbackDuration` — copied-state duration.

### Events

`copy` — copy succeeded; `error` — copy failed.

## 13.4 DragDrop

### Inputs

`draggable` — enables drag; `droppable` — enables drop; `group` — compatible drag/drop group; `data` — drag payload; `disabled` — disables interaction.

### Events

`dragStart` — drag started; `dragEnter` — dragged item entered target; `dragOver` — dragged item moved over target; `drop` — item dropped; `dragEnd` — drag completed.

## 13.5 ScrollTop

### Inputs

`threshold` — scroll distance before visibility; `behavior` — smooth/instant; `target` — scroll container.

### Events

`show` — control became visible; `hide` — control became hidden; `click` — scroll-to-top invoked.

---

# 14. API DESIGN RULES FOR ORIGO

## 14.1 Do not expose framework-specific event names

Prefer:

```ts
valueChange
selectionChange
open
close
action
error
```

over framework-specific names such as:

```ts
onNodeSelect
onRowSelect
onOverlayHide
```

Framework adapters can map Origo events to Angular/React/React Native conventions.

## 14.2 Separate UI state from business state

Do not make components responsible for business rules.

Bad:

```ts
<origo-button
  [disabled]="invoice.status !== 'Pending' || invoice.createdBy === user.id">
</origo-button>
```

Preferred:

```json
{
  "type": "business-action",
  "action": "invoice.approve",
  "rules": [
    "invoice.status == 'Pending'",
    "invoice.createdBy != currentUser.id"
  ],
  "permissions": ["invoice.approve"]
}
```

The renderer evaluates the rule and supplies the appropriate disabled/hidden state.

## 14.3 Every interactive component should support metadata

Minimum metadata contract:

```ts
interface OrigoComponentMetadata {
  id: string;
  type: string;
  props?: Record<string, unknown>;
  bindings?: Record<string, string>;
  events?: Record<string, string>;
  rules?: OrigoRule[];
  permissions?: OrigoPermission[];
  metadata?: Record<string, unknown>;
}
```

## 14.4 Every component should have predictable state

At minimum:

```text
default
hover
focus
active
disabled
readonly
loading
invalid
success
warning
error
```

## 14.5 Accessibility is part of the API

Accessibility should not be an optional plugin. Components must expose accessible labels, descriptions, keyboard behavior and focus management through their standard contract.

## 14.6 Extensibility

Origo should provide a controlled equivalent of PrimeNG's pass-through concept so applications can customize internal DOM attributes/events without requiring a new Origo release. PrimeNG explicitly uses pass-through APIs for this purpose. 

Recommended Origo contract:

```ts
interface OrigoPassThrough {
  host?: Record<string, unknown>;
  parts?: Record<string, Record<string, unknown>>;
  hooks?: Record<string, Function>;
}
```

## 14.7 Versioning

The metadata schema and public component APIs should follow semantic versioning:

```text
MAJOR = breaking API/schema changes
MINOR = backward-compatible capabilities
PATCH = fixes
```

The metadata contract should be versioned independently from individual renderers.

---

# 15. Recommended component implementation priority

### P0 — foundation

Form controls, Button, Card, Panel, Tabs, Accordion, Dialog, Drawer, Tooltip, Toast, Message, DataTable, Pagination, Menu, Breadcrumb, FileUpload, Spinner, Skeleton, FormField, Form.

### P1 — enterprise completeness

AutoComplete, MultiSelect, TreeSelect, DatePicker, InputNumber, Editor, Tree, TreeTable, Kanban, MasterDetail, Stepper, Splitter, ContextMenu, CommandPalette, Charts, KPI, Avatar, EntitySelector, DynamicForm, DynamicTable, PermissionGate, BusinessAction, Workflow, Approval, AuditTimeline.

### P2 — breadth

ColorPicker, Knob, SpeedDial, OrganizationChart, OrderList, PickList, MediaViewer, advanced charts, BottomSheet, advanced navigation and AI-generated UI.

---

# 16. Acceptance criteria for every Origo component

A component is not considered production-ready until it has:

1. Typed input/property contract.
2. Typed event contract.
3. Controlled value/state support where applicable.
4. Declarative metadata representation.
5. Accessibility support.
6. Keyboard behavior.
7. Responsive behavior.
8. Loading/disabled/readonly states where applicable.
9. Validation integration where applicable.
10. Permission integration where applicable.
11. Business-rule integration where applicable.
12. Theme/token integration.
13. Dark/high-contrast support.
14. RTL support where applicable.
15. Unit tests.
16. Interaction/accessibility tests.
17. Documentation and examples.
18. Angular renderer.
19. Framework-neutral metadata schema.
20. Stable semantic versioning.

