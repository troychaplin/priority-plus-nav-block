# How Priority+ Navigation Works

This document explains how the Priority+ Navigation plugin implements the Priority+ design pattern in WordPress.

## The Priority+ Pattern

### Concept

Priority+ navigation prioritizes the most important navigation items by keeping them visible. As horizontal space decreases, less important items progressively move into a "More" dropdown menu.

### Visual Example

**Wide Screen:**
```
[Home] [About] [Services] [Products] [Blog] [Contact]
```

**Medium Screen:**
```
[Home] [About] [Services] [Products] [More ▼]
                                      ├─ Blog
                                      └─ Contact
```

**Narrow Screen:**
```
[Home] [About] [More ▼]
               ├─ Services
               ├─ Products
               ├─ Blog
               └─ Contact
```

### Key Principles

1. **At least one item always visible** - Ensures navigation is never completely hidden
2. **Progressive disclosure** - Items hide one by one, not all at once
3. **Dynamic adjustment** - Responds to viewport changes in real-time
4. **Predictable behavior** - Items hide in reverse order (last items first)

## Implementation

### Architecture

The plugin uses a **block variation** approach:

```
core/navigation (WordPress block)
    ↓
Priority+ Variation
    ├── Inherits all core navigation features
    ├── Adds custom attributes
    ├── Injects frontend JavaScript
    └── Adds custom controls
```

**Why block variation?**
- Reuses WordPress menus
- Automatic theme compatibility
- Benefits from core updates
- Easy to convert back and forth

### Frontend Lifecycle

#### 1. Initialization

When the page loads, the Priority+ script:

```javascript
// Find all Priority+ navigation blocks
const navs = document.querySelectorAll('.is-style-priority-nav');

// Initialize each one
navs.forEach(nav => new PriorityNav(nav));
```

#### 2. Initial Calculation

For each navigation:

1. **Check compatibility**
   ```javascript
   if (overlayMenu === 'always') return; // Not compatible
   ```

2. **Check hamburger mode**
   ```javascript
   if (isInHamburgerMode()) {
     disablePriorityNav(); // Let WordPress handle it
   }
   ```

3. **Measure items**
   ```javascript
   // Cache width of each navigation item
   itemWidths = [125.5, 98.2, 156.7, 88.3, 112.9];
   ```

4. **Calculate overflow**
   ```javascript
   // How many items fit?
   visibleCount = calculateVisibleItems();
   // Update display
   showVisibleItems(visibleCount);
   buildDropdown(visibleCount);
   ```

#### 3. Responsive Updates

The plugin watches for viewport changes:

```javascript
// Use ResizeObserver for efficient detection
resizeObserver.observe(nav);

// On resize:
checkOverflow(); // Recalculate visible items
```

### The Overflow Algorithm

This is the core of Priority+:

```javascript
function calculateVisibleItems(availableWidth, moreButtonWidth, gap) {
  let usedWidth = 0;
  let visibleCount = 0;

  // Try to fit each item
  for (let i = 0; i < items.length; i++) {
    const itemWidth = itemWidths[i];
    const gapWidth = i > 0 ? gap : 0;

    // Would this item + More button fit?
    const totalNeeded = usedWidth + gapWidth + itemWidth + gap + moreButtonWidth;

    if (totalNeeded <= availableWidth || i === 0) {
      // Yes! Show this item
      usedWidth += gapWidth + itemWidth;
      visibleCount++;
    } else {
      // No room - this and remaining items go to dropdown
      break;
    }
  }

  return visibleCount;
}
```

**Key points:**
- Accounts for gaps between items
- Always includes More button in calculation
- Always shows at least one item (`i === 0`)
- Uses cached widths for performance

### Width Caching

To avoid constant re-measurement:

```javascript
// Measure once, on initialization
function cacheItemWidths(items) {
  // Temporarily show all items
  items.forEach(item => item.style.display = '');

  // Measure each one
  const widths = items.map(item => {
    return item.getBoundingClientRect().width; // Sub-pixel accuracy
  });

  return widths; // [125.5, 98.2, 156.7, ...]
}
```

**Cache invalidation:**
- When transitioning from hamburger to desktop mode
- When items might have been hidden/resized

### Hamburger Mode Detection

WordPress overlay menu integration:

```javascript
function isInHamburgerMode(responsiveContainer) {
  if (!responsiveContainer) {
    return false; // overlayMenu: 'never'
  }

  // WordPress adds 'is-menu-open' when hamburger is active
  return responsiveContainer.classList.contains('is-menu-open');
}
```

**Behavior by overlay menu setting:**

| Setting | Container Exists? | Priority+ Behavior |
|---------|------------------|-------------------|
| **Never** | No | Always active |
| **Mobile** | Yes (hidden) | Active on desktop, disables when hamburger opens |
| **Always** | Yes (visible) | Blocked - not compatible |

### Dropdown Building

Items that don't fit are dynamically added to dropdown:

```javascript
function buildDropdown(visibleCount) {
  dropdown.innerHTML = ''; // Clear existing

  // Build from overflow items
  for (let i = visibleCount; i < items.length; i++) {
    const item = items[i];
    const data = extractNavItemData(item);

    if (data.hasSubmenu) {
      // Create accordion
      const accordion = buildAccordion(data);
      dropdown.appendChild(accordion);
    } else {
      // Create simple link
      const li = buildDropdownItem(data);
      dropdown.appendChild(li);
    }
  }
}
```

### Accordion Pattern

Items with submenus become accordions in the dropdown:

**Two modes based on WordPress setting:**

1. **Click mode** (`openSubmenusOnClick: true`)
   - Entire item is clickable button
   - Toggles submenu open/closed
   - Link not functional

2. **Arrow mode** (`openSubmenusOnClick: false`)
   - Link remains functional
   - Separate arrow button for submenu
   - Better for touch devices

## Performance

### Optimization Techniques

1. **Width Caching**
   - Measure once, reuse many times
   - Only invalidate when necessary

2. **ResizeObserver**
   - Native browser API
   - More efficient than polling or resize events

3. **requestAnimationFrame**
   - Smooth calculations
   - Doesn't block main thread

4. **Debouncing**
   - `isCalculating` flag prevents overlapping calculations

5. **Early Returns**
   - Skip work when disabled or unmeasurable

### Performance Metrics

- **Initial load**: Single layout calculation (~5-10ms)
- **Resize**: Recalculation only when needed (~2-5ms)
- **Hamburger toggle**: Simple class check (~1ms)

## Responsive Behavior

### Desktop to Mobile Transition

```
Desktop (Priority+ active)
    ↓ viewport narrows
Mobile breakpoint reached
    ↓ WordPress adds 'is-menu-open' class
MutationObserver detects change
    ↓ isInHamburgerMode() returns true
Priority+ disables
    ↓ Show all items, hide More button
WordPress hamburger menu takes over
```

### Mobile to Desktop Transition

```
Mobile (WordPress hamburger active)
    ↓ viewport widens
Desktop breakpoint reached
    ↓ WordPress removes 'is-menu-open' class
MutationObserver detects change
    ↓ isInHamburgerMode() returns false
Priority+ enables
    ↓ Cache widths, calculate overflow
Show visible items, build dropdown
```

## Edge Cases

### 1. More Button Larger Than Container

```javascript
if (moreButtonWidth >= availableWidth) {
  // Hide all items, show only More button
  items.forEach(item => item.style.display = 'none');
  moreContainer.style.display = '';
  return;
}
```

### 2. Hidden Navigation

```javascript
if (!isMeasurable(list)) {
  // Schedule retry when visible
  scheduleRetry();
  return;
}
```

### 3. Multiple Instances

```javascript
// Each instance gets unique ID
this.instanceId = `priority-nav-${instanceCounter++}`;

// Used for accordion ARIA relationships
<button aria-controls="priority-nav-0-submenu-1">
```

### 4. Zero Widths

```javascript
// Detect invalid cache
if (widths.some(w => w === 0)) {
  // Remeasure
  widths = cacheItemWidths(items);
}
```

## Summary

The Priority+ Navigation plugin implements a sophisticated responsive pattern that:

1. **Measures** navigation items accurately
2. **Calculates** how many fit in available space
3. **Hides** overflow items progressively
4. **Builds** dropdown menu dynamically
5. **Updates** on viewport changes
6. **Integrates** with WordPress hamburger menu
7. **Performs** efficiently through caching and optimization

The result is a navigation system that provides the best of both worlds: horizontal navigation on desktop with graceful degradation on smaller screens, while seamlessly integrating with WordPress's native mobile navigation.
