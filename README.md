# Priority+ Navigation Block

A WordPress block plugin that adds Priority+ pattern functionality to core WordPress navigation block. It automatically moves navigation items that don't fit into a responsive "More" dropdown menu as the viewport narrows.

## What is Priority+?

Priority+ navigation is a responsive design pattern that keeps all navigation items visible at wide screen sizes, but progressively moves overflow items into a "More" dropdown at smaller screen sizes. This ensures the navigation remains usable on all devices without requiring a hamburger menu or breaking the layout.

## Features

- ✅ **Core Navigation Variation** - Extends the standard WordPress navigation block as a variation, no need to rebuild your menus
- ✅ **Automatic Overflow Detection** - Intelligently calculates available space and moves items to dropdown
- ✅ **Easy Conversion** - Transform any Navigation block to Priority+ Navigation via block variations
- ✅ **Customizable "More" Button** - Choose label text and icon style
- ✅ **Responsive by Design** - Uses ResizeObserver for smooth, performant resizing
- ✅ **Core Navigation Integration** - Automatically detects and respects "Open submenus on click" setting
- ✅ **Smart Mobile Detection** - Automatically disables on mobile/hamburger mode to avoid conflicts
- ✅ **Submenu Accordions** - Items with submenus in the dropdown become accessible accordions
- ✅ **Accessible** - Proper ARIA attributes and keyboard support (Escape to close)
- ✅ **Block Theme Ready** - Full support for block themes with alignment, spacing, and color controls
- ✅ **Multiple Blocks** - Use multiple Priority+ Navigation blocks on the same page
- ✅ **Future-Proof** - Since it extends core navigation, it benefits from WordPress core updates

## Installation

### From Source

1. Clone or download this repository into your WordPress plugins directory:
```bash
cd wp-content/plugins/
git clone [repository-url] priority-nav
```

2. Install dependencies:
```bash
cd priority-nav
npm install
```

3. Build the plugin:
```bash
npm run build
```

4. Activate the plugin in WordPress Admin → Plugins

## Usage

The Priority+ Navigation is available as a variation of the core Navigation block. There are two ways to use it:

### Option 1: Insert as Variation

1. In the block editor, click the **+** button to add a block
2. Search for **"Priority+ Navigation"** or **"Navigation"**
3. When you see the Navigation block, look for the **Priority+ Navigation** variation in the block variations panel
4. Select the Priority+ Navigation variation
5. Configure your navigation using the familiar WordPress navigation tools
6. Customize the "More" button label and icon in the block sidebar (Priority+ Settings panel)

### Option 2: Convert Existing Navigation

1. Select any existing **Navigation** block
2. In the block toolbar or block settings, look for the block variations switcher
3. Choose **"Priority+ Navigation"** from the variations
4. Your navigation now has Priority+ behavior enabled!

### Converting Back to Standard Navigation

1. Select a **Priority+ Navigation** block
2. In the block variations switcher, choose the standard **"Navigation"** variation
3. The Priority+ behavior is disabled, returning to standard WordPress navigation

**Note:** Legacy wrapper blocks (from previous versions) will continue to work on the frontend, but are no longer available for insertion in the editor. If you have existing wrapper blocks, consider converting them to the variation approach.

## Configuration

### Block Settings (Inspector Sidebar)

**More Button Label**
- Default: "Browse"
- Customize the text displayed on the overflow button

**More Button Icon**
- None (no icon) - Default
- Chevron Down (▼)
- Plus (+)
- Menu (≡)

### Core Navigation Settings

The plugin automatically detects and respects settings from the Core Navigation block:

- **Open submenus on click** - When enabled in Core Navigation, submenus in the "More" dropdown become clickable accordions. When disabled, the link remains functional with a separate arrow button to toggle the submenu.

### Block Supports

The block supports all standard WordPress block features:

- **Alignment**: Wide, Full
- **Spacing**: Margin, Padding
- **Colors**: Background, Text

## How It Works

### Architecture

The plugin extends the core Navigation block as a **block variation**:

```
core/navigation (with Priority+ variation enabled)
  ├── core/navigation-link
  ├── core/navigation-submenu
  ├── core/page-list
  └── etc.
```

The variation approach:
- Extends `core/navigation` with Priority+ attributes and controls
- Adds priority+ behavior via JavaScript on the frontend
- The core navigation block handles all menu functionality
- This approach is maintainable, future-proof, and integrates seamlessly with WordPress

### Frontend Behavior

1. **On page load**: The script measures all navigation items
2. **Mobile detection**: Automatically detects if WordPress is in hamburger/responsive mode and disables Priority Nav to avoid conflicts
3. **Overflow detection**: Calculates how many items fit in available space
4. **Item distribution**: 
   - Visible items stay in the main navigation
   - Overflow items move to the "More" dropdown
   - At least one item always remains visible
5. **Submenu handling**: Items with submenus in the dropdown are converted to accessible accordions that respect the Core Navigation "Open on click" setting
6. **Responsive updates**: ResizeObserver automatically recalculates on viewport changes
7. **Smooth transitions**: Uses `requestAnimationFrame` for optimal performance

## Development

### Prerequisites

- Node.js 14+ and npm
- WordPress 6.0+
- PHP 7.4+

### Setup

```bash
# Install dependencies
npm install

# Start development mode with hot reload
npm run start

# Build for production
npm run build

# Lint JavaScript
npm run lint:js

# Lint CSS/SCSS
npm run lint:css

# Format code
npm run format

# Create plugin zip
npm run plugin-zip
```

### Project Structure

```
priority-nav/
├── build/                  # Compiled assets (generated)
├── src/
│   ├── index.js           # Editor extension entry point
│   ├── extend.js          # Variation registration & block extension
│   ├── view.js            # Frontend JavaScript
│   ├── style.scss         # Frontend styles
│   └── block.json         # Block configuration
├── priority-nav.php       # Main plugin file
├── package.json           # Node dependencies & scripts
└── README.md             # Documentation
```

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Uses ResizeObserver API (supported in all modern browsers)
- Falls back gracefully if JavaScript is disabled

## Accessibility

- **ARIA attributes**: `aria-expanded`, `aria-haspopup`, `aria-label`, `aria-controls`, `aria-hidden`
- **Keyboard navigation**: Escape key closes dropdown and accordions
- **Screen reader support**: Proper semantic markup and ARIA relationships
- **Focus management**: Standard browser focus behavior
- **Submenu accordions**: Accessible accordion pattern for nested menus in dropdown

## Performance

- **ResizeObserver**: Efficient viewport change detection
- **requestAnimationFrame**: Smooth, jank-free calculations
- **Width caching**: Minimizes layout recalculations
- **Debounced recalculation**: Prevents excessive computation

## Known Limitations

- When using multiple Priority+ Navigation blocks on the same page with "Open submenus on click" enabled, ensure each block has unique navigation content to avoid potential ID conflicts
- The plugin automatically disables on mobile/hamburger mode - this is intentional to work seamlessly with WordPress responsive navigation
- Legacy wrapper blocks (from previous plugin versions) are no longer insertable in the editor, but will continue to function on the frontend for backward compatibility

## Changelog

### 0.2.0 - Variation-Only Approach
- Refactored to use block variation instead of wrapper block
- Namespaced variation name (`lumen-priority-nav`) for better compatibility
- Improved editor integration with `isActive` detection
- Legacy wrapper blocks still supported on frontend for backward compatibility

### 0.1.0 - Initial Release
- Priority+ navigation as core/navigation variation
- Customizable "More" button label and icon
- Full block theme support
- Responsive overflow detection
- Core Navigation "Open on click" integration
- Automatic hamburger mode detection
- Accessible accordion submenus in dropdown

## Credits

Built with WordPress block development tools and inspired by the Priority+ navigation pattern.

## License

GPL-2.0-or-later

## Support

For issues, questions, or contributions, please visit the plugin repository.

