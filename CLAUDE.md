# Priority+ Navigation Plugin - Technical Documentation

## Overview

This WordPress plugin implements the Priority+ navigation pattern as a **block variation** of the core WordPress Navigation block. It automatically moves navigation items that don't fit the available viewport width into a "More" dropdown menu, ensuring responsive navigation without requiring a hamburger menu.

## Architecture

### Block Variation Approach

The plugin extends `core/navigation` as a variation rather than creating a custom block:

**Benefits:**
- Leverages core navigation functionality (menu management, styling, block supports)
- Future-proof - benefits from WordPress core updates
- Seamless integration with block themes
- Users can convert between standard and Priority+ navigation easily

### File Structure

```
priority-plus-nav/
├── priority-plus-nav.php          # Main plugin file, bootstraps autoloader
├── classes/
│   ├── class-plugin-module.php    # Abstract base class for modules
│   ├── class-plugin-paths.php     # Path/URL resolution utilities
│   └── class-enqueues.php         # Asset enqueueing & block rendering
├── src/
│   ├── priority-editor.js         # Editor entry point
│   ├── priority-plus-nav.js       # Frontend entry point
│   ├── variation/
│   │   ├── block.js              # Block variation registration & attributes
│   │   └── controls.js           # Editor sidebar controls (settings panel)
│   ├── core/
│   │   └── PriorityNav.js        # Main class - priority nav logic
│   ├── dom/
│   │   ├── dom-builder.js        # Build More button, dropdown, accordion HTML
│   │   └── dom-extractor.js      # Extract data from nav items
│   ├── events/
│   │   ├── event-handlers.js     # Setup click/keyboard event listeners
│   │   └── accordion-handler.js  # Accordion open/close logic
│   ├── layout/
│   │   └── width-calculator.js   # Width caching & gap calculations
│   ├── utils/
│   │   ├── constants.js          # Default values (labels, icons)
│   │   ├── dom-utils.js          # DOM utility functions
│   │   └── html-utils.js         # HTML escaping utilities
│   └── styles/
│       ├── style.scss            # Frontend styles
│       └── editor.scss           # Editor styles
└── build/                         # Compiled assets (generated)
```

## How It Works

### 1. Block Registration (Editor)

**File:** `src/variation/block.js`

- Registers a block variation named `priority-nav` on `core/navigation`
- Sets default attributes:
  - `className`: `is-style-priority-nav` (CSS class for styling & detection)
  - `overlayMenu`: `never` (disable core hamburger menu)
  - `priorityNavEnabled`: `true`
  - `priorityNavMoreLabel`: `'Browse'`
  - `priorityNavMoreIcon`: `'none'`
- Adds `isActive` check to detect when variation is active based on className
- Extends core/navigation with custom attributes via WordPress hooks filter

**File:** `src/variation/controls.js`

- Adds InspectorControls (sidebar panel) to core/navigation when Priority+ is enabled
- Provides settings:
  - Text input for "More Button Label"
  - Select control for icon (None, Chevron, Plus, Menu)
- Wraps editor preview in `.priority-nav-editor-wrapper` for editor-specific styling

### 2. Asset Enqueueing (PHP)

**File:** `classes/class-enqueues.php`

**Editor Assets:**
- Enqueues `priority-editor.js` and styles on `enqueue_block_editor_assets` hook
- Loaded in WordPress editor for variation registration and controls

**Frontend Assets:**
- Hooks into `render_block` filter for `core/navigation` blocks
- Checks if Priority+ is enabled via:
  1. `priorityNavEnabled` attribute
  2. `is-style-priority-nav` class in className
- If enabled:
  - Enqueues `priority-plus-nav.js` and styles (once per page)
  - Injects `data-more-label` and `data-more-icon` attributes into `<nav>` element
  - Passes configuration from block attributes to frontend via data attributes

### 3. Frontend Initialization

**File:** `src/priority-plus-nav.js`

- On DOM ready, finds all `.wp-block-navigation.is-style-priority-nav` elements
- Instantiates a new `PriorityNav` class for each element

### 4. PriorityNav Class

**File:** `src/core/PriorityNav.js`

This is the main class that handles all Priority+ behavior.

#### Initialization

```javascript
constructor(element) {
  // Generate unique instance ID (for multiple navs on page)
  this.instanceId = `priority-nav-${instanceCounter++}`;

  // Get references
  this.nav = element;
  this.list = element.querySelector('.wp-block-navigation__container');

  // Get configuration from data attributes
  this.moreLabel = nav.getAttribute('data-more-label') || 'Browse';
  this.moreIcon = nav.getAttribute('data-more-icon') || 'none';

  // Detect WordPress "Open submenus on click" setting
  this.openSubmenusOnClick = this.detectOpenSubmenusOnClick();

  // Create More button and dropdown
  const { moreContainer, moreButton, dropdown } = createMoreButton(...);

  // Initialize state
  this.items = Array.from(this.list.children);
  this.itemWidths = []; // Cached widths
  this.isOpen = false;
  this.openAccordions = [];
  this.isEnabled = true;

  this.init();
}
```

#### Key Methods

**`detectOpenSubmenusOnClick()`**
- Detects WordPress core navigation "Open submenus on click" setting
- Checks data attributes, classes on nav element and list items
- Returns boolean used to determine accordion behavior

**`init()`**
- Sets up event listeners (click, keyboard, outside click)
- Sets up ResizeObserver to detect viewport changes
- Sets up MutationObserver to detect hamburger mode transitions
- Checks if in hamburger mode and enables/disables accordingly

**`isInHamburgerMode()`**
- Detects if WordPress core navigation is in responsive/hamburger mode
- Checks if `.wp-block-navigation__responsive-container` is visible
- Returns true if in hamburger mode (Priority+ should be disabled)

**`enablePriorityNav()`**
- Enables Priority+ behavior (called when exiting hamburger mode)
- Caches item widths if not already cached
- Triggers `checkOverflow()` to calculate visible items

**`disablePriorityNav()`**
- Disables Priority+ behavior (called when entering hamburger mode)
- Shows all navigation items
- Hides More button
- Closes dropdown
- Prevents conflicts with WordPress hamburger menu

**`checkOverflow()`**
- Main calculation method - runs on resize and initialization
- Guards:
  - Skips if disabled (hamburger mode)
  - Skips if element not measurable
  - Skips if element detached from DOM
- Caches widths if not cached or invalid
- Calculates available width (nav width - padding)
- Calculates how many items fit with More button visible
- Updates display:
  - If all items fit: show all, hide More button
  - If overflow: hide overflow items, show More button, build dropdown

**`calculateVisibleItems(availableWidth, moreButtonWidth, gap)`**
- Calculates how many items can fit in available width
- Accounts for:
  - Item widths (cached)
  - Gap between items (from CSS)
  - More button width (cached)
  - Gap before More button
- Always shows at least 1 item
- Returns number of visible items

**`toggleDropdown()` / `openDropdown()` / `closeDropdown()`**
- Controls dropdown visibility
- Updates ARIA attributes (`aria-expanded`)
- Adds/removes `is-open` class
- Closes all accordions when dropdown closes

**`destroy()`**
- Cleanup method
- Disconnects ResizeObserver and MutationObserver
- Removes event listeners
- Clears timeouts

### 5. DOM Building

**File:** `src/dom/dom-builder.js`

**`createMoreButton(list, moreLabel, moreIcon)`**
- Creates More button with proper ARIA attributes
- Adds icon HTML based on icon type
- Creates dropdown `<ul>` container
- Appends to navigation
- Returns references to elements

**`buildDropdownFromOverflow(dropdown, items, visibleCount, ...)`**
- Clears dropdown
- Iterates through overflow items (from `visibleCount` to end)
- Extracts data from each item (text, URL, children)
- Builds accordion HTML for each item
- Handles nested submenus

**`buildAccordionHTML(data, level, instanceId, submenuCounter, openSubmenusOnClick)`**
- Recursively builds accordion HTML
- Two modes based on `openSubmenusOnClick`:
  1. **Click mode (true):** Entire item is a `<button>` that toggles submenu
  2. **Arrow mode (false):** `<a>` link + separate `<button>` arrow toggle
- Generates unique IDs for ARIA relationships (`aria-controls`)
- Returns HTML string

### 6. Event Handling

**File:** `src/events/event-handlers.js`

**`setupEventListeners(elements, instance, callbacks)`**
- Sets up click handler on More button (toggle dropdown)
- Sets up outside click handler (close dropdown when clicking outside)
- Sets up keyboard handler (Escape key closes dropdown)
- Sets up delegation for accordion toggles in dropdown
- Returns handler references for cleanup

**File:** `src/events/accordion-handler.js`

**`toggleAccordionItem(button, submenu, instance, dropdown)`**
- Toggles accordion open/closed
- Updates ARIA attributes
- Uses inline styles with `!important` to override WordPress core styles
- Closes nested accordions when closing parent
- Tracks open accordions in instance

**`closeAllAccordions(instance)`**
- Closes all open accordions in the instance
- Clears `openAccordions` array

### 7. Width Calculations

**File:** `src/layout/width-calculator.js`

**`cacheItemWidths(list, items, onRetry)`**
- Measures and caches width of each navigation item
- Temporarily shows all items to get accurate measurements
- Uses `getBoundingClientRect()` for sub-pixel accuracy
- Schedules retry if elements not yet measurable
- Returns array of widths

**`cacheMoreButtonWidth(moreButton, moreContainer, cachedWidth)`**
- Caches More button width
- Temporarily shows button to measure if not yet cached
- Returns cached or measured width

**`getGap(list, nav)`**
- Calculates gap between flex items
- Falls back to checking nav element if list doesn't have gap
- Returns gap in pixels

**`hasValidWidthCache(widths, expectedCount)`**
- Validates width cache
- Checks if cache exists, has correct length, and no zero values
- Returns boolean

### 8. DOM Extraction

**File:** `src/dom/dom-extractor.js`

**`extractNavItemData(item)`**
- Extracts data from a navigation list item
- Recursively processes child items (submenus)
- Returns object with:
  - `text`: Link text
  - `url`: Link URL
  - `hasSubmenu`: Boolean
  - `children`: Array of child item data

## Key Features

### Responsive Behavior

1. **Desktop Mode:** Priority+ is active
   - Items overflow to More dropdown based on available width
   - ResizeObserver triggers recalculation on viewport changes

2. **Mobile/Hamburger Mode:** Priority+ is disabled
   - WordPress core hamburger menu takes over
   - All items shown in native WordPress responsive menu
   - More button hidden to avoid conflicts

### Hamburger Mode Detection

The plugin automatically detects when WordPress core navigation is in responsive/hamburger mode:

- Checks if `.wp-block-navigation__responsive-container` exists and is visible
- Uses MutationObserver to watch for attribute changes (`aria-hidden`, `class`)
- Disables Priority+ when in hamburger mode to prevent conflicts

### Submenu Handling (Accordions)

Items with submenus in the dropdown become accessible accordions:

- Respects WordPress "Open submenus on click" setting
- **Click mode:** Entire item is clickable toggle
- **Arrow mode:** Link functional + separate arrow toggle button
- Proper ARIA attributes (`aria-expanded`, `aria-controls`, `aria-hidden`)
- Nested accordions supported
- Closes all accordions when dropdown closes

### Width Caching

To avoid layout thrashing and improve performance:

1. **Item widths** are cached on first calculation
2. **More button width** is cached after first measure
3. Cache invalidated when transitioning from hamburger mode (items may have been hidden)
4. Uses `getBoundingClientRect()` for sub-pixel accuracy

### Multiple Instances

Supports multiple Priority+ navigation blocks on the same page:

- Each instance gets unique ID (`priority-nav-0`, `priority-nav-1`, etc.)
- Unique IDs used for ARIA relationships (submenu accordions)
- Event listeners scoped to instance
- No cross-instance conflicts

### Accessibility

- **ARIA attributes:** `aria-expanded`, `aria-haspopup`, `aria-controls`, `aria-hidden`, `aria-label`
- **Keyboard navigation:** Escape key closes dropdown and accordions
- **Semantic HTML:** Proper button/link/list structure
- **Screen reader support:** Proper ARIA relationships and labels

### Performance

- **ResizeObserver:** Efficient viewport change detection (no polling)
- **requestAnimationFrame:** Smooth calculations without blocking main thread
- **Width caching:** Minimizes layout recalculations
- **Debounced recalculation:** `isCalculating` flag prevents excessive computation
- **Early returns:** Guards prevent unnecessary work when disabled or unmeasurable

## Block Attributes

The plugin extends `core/navigation` with these custom attributes:

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `priorityNavEnabled` | boolean | false | Enables Priority+ behavior |
| `priorityNavMoreLabel` | string | 'Browse' | Text label for More button |
| `priorityNavMoreIcon` | string | 'none' | Icon type (none, chevron, plus, menu) |

These are stored in block attributes and passed to frontend via data attributes on the `<nav>` element.

## CSS Classes

| Class | Purpose |
|-------|---------|
| `.is-style-priority-nav` | Identifies Priority+ navigation (variation marker) |
| `.priority-nav-more` | Container for More button and dropdown |
| `.priority-nav-more-button` | More button |
| `.priority-nav-dropdown` | Dropdown menu container |
| `.priority-nav-icon` | Icon span in More button |
| `.priority-nav-accordion-toggle` | Accordion toggle button |
| `.priority-nav-accordion-toggle-full` | Full-width toggle (click mode) |
| `.priority-nav-accordion-toggle-arrow` | Arrow-only toggle (arrow mode) |
| `.priority-nav-accordion-content` | Accordion submenu container |
| `.priority-nav-accordion-wrapper` | Wrapper for link + arrow button |
| `.priority-nav-accordion-link` | Link in arrow mode |
| `.priority-nav-accordion-text` | Text in click mode |
| `.priority-nav-accordion-arrow` | Arrow icon |
| `.is-open` | Active state for dropdown/accordion |

## Data Attributes

| Attribute | Purpose |
|-----------|---------|
| `data-more-label` | More button label (injected by PHP) |
| `data-more-icon` | More button icon type (injected by PHP) |
| `data-priority-nav-initialized` | Prevents double initialization |

## Development Workflow

### Build Commands

```bash
npm run start    # Development mode with hot reload
npm run build    # Production build
npm run lint     # Lint JS, CSS, and PHP
npm run format   # Format JS, CSS, and PHP
npm run plugin-zip # Create distributable plugin zip
```

### File Watching

The `npm run start` command watches for changes in:
- `src/**/*.js` - JavaScript files
- `src/**/*.scss` - Stylesheet files

And outputs to `build/` directory.

### WordPress @wordpress/scripts

The plugin uses `@wordpress/scripts` which provides:
- Webpack configuration
- Babel transpilation (modern JS → browser-compatible)
- SASS compilation
- ESLint configuration (WordPress coding standards)
- Stylelint configuration
- Asset dependency extraction (for `wp_enqueue_script` dependencies)

## Edge Cases Handled

1. **Hamburger mode transitions:** Disables Priority+ to avoid conflicts
2. **Hidden menus:** Retries measurement when menu becomes visible
3. **Zero widths:** Invalidates cache and remeasures
4. **Detached DOM elements:** Guards prevent errors when elements removed
5. **More button larger than container:** Hides all items, shows only More button
6. **Multiple instances:** Unique IDs prevent conflicts
7. **Nested accordions:** Closes children when closing parent
8. **Sub-pixel rendering:** Uses `getBoundingClientRect()` for accuracy

## Known Limitations

1. **Multiple Priority+ blocks with "Open on click":** May have ID conflicts if blocks have identical navigation content (use unique menus per block)
2. **Legacy wrapper blocks:** Old plugin versions used wrapper block approach - these still work on frontend but can't be inserted in editor
3. **Automatic disabling in hamburger mode:** This is intentional to work with WordPress responsive navigation - not a bug

## Testing Scenarios

When testing changes, verify:

1. **Basic functionality:**
   - Items overflow to More dropdown on narrow screens
   - Items return to main nav on wider screens
   - More button shows/hides appropriately

2. **Multiple instances:**
   - Multiple Priority+ navs on same page
   - Each instance operates independently
   - No ID conflicts

3. **Hamburger mode:**
   - Priority+ disables when entering hamburger mode
   - WordPress native hamburger menu takes over
   - Priority+ re-enables when exiting hamburger mode

4. **Accordions:**
   - Submenus in dropdown work as accordions
   - "Open on click" setting respected
   - Nested accordions work correctly
   - All close when dropdown closes

5. **Accessibility:**
   - Keyboard navigation (Escape key)
   - ARIA attributes correct
   - Screen reader compatibility

6. **Performance:**
   - No layout thrashing on resize
   - Smooth transitions
   - No console errors

## Questions?

Let me know if you have any questions or need clarification on how the plugin works!
