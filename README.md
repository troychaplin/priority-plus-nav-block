# Priority+ Nav Block

A WordPress block plugin that adds Priority+ pattern functionality to core WordPress navigation block. It automatically moves navigation items that don't fit into a responsive "More" dropdown menu as the viewport narrows.

## What is Priority+?

Priority+ navigation is a responsive design pattern that keeps all navigation items visible at wide screen sizes, but progressively moves overflow items into a "More" dropdown at smaller screen sizes. This ensures the navigation remains usable on all devices without requiring a hamburger menu or breaking the layout.

## Features

- ✅ **Wraps Core Navigation** - Leverages the standard WordPress navigation block, no need to rebuild your menus
- ✅ **Automatic Overflow Detection** - Intelligently calculates available space and moves items to dropdown
- ✅ **Bidirectional Transforms** - Easy conversion between standard navigation and priority navigation
- ✅ **Customizable "More" Button** - Choose label text and icon style
- ✅ **Responsive by Design** - Uses ResizeObserver for smooth, performant resizing
- ✅ **Accessible** - Proper ARIA attributes and keyboard support (Escape to close)
- ✅ **Block Theme Ready** - Full support for block themes with alignment, spacing, and color controls
- ✅ **Future-Proof** - Since it wraps core navigation, it benefits from WordPress core updates

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

There are three ways to use the Priority+ Navigation block:

### Option 1: Start Fresh

1. In the block editor, click the **+** button to add a block
2. Search for **"Priority+ Navigation"**
3. Insert the block
4. Configure your navigation using the familiar WordPress navigation tools
5. Customize the "More" button label and icon in the block sidebar

### Option 2: Convert Existing Navigation

1. Select any existing **Navigation** block
2. Click the **Transform** button (⇄) in the block toolbar
3. Choose **"Priority+ Navigation"**
4. Your navigation is now wrapped with priority behavior!

### Option 3: Convert Back to Standard Navigation

1. Select a **Priority+ Navigation** block
2. Click the **Transform** button (⇄) in the block toolbar
3. Choose **"Navigation"**
4. The wrapper is removed, returning to standard WordPress navigation

## Configuration

### Block Settings (Inspector Sidebar)

**More Button Label**
- Default: "More"
- Customize the text displayed on the overflow button

**More Button Icon**
- Horizontal Dots (•••) - Default
- Chevron Down (▼)
- Plus (+)
- Menu (≡)

### Block Supports

The block supports all standard WordPress block features:

- **Alignment**: Wide, Full
- **Spacing**: Margin, Padding
- **Colors**: Background, Text

## How It Works

### Architecture

```
lumen/priority-nav (wrapper block)
  └── core/navigation (standard WordPress navigation)
        ├── core/navigation-link
        ├── core/navigation-submenu
        ├── core/page-list
        └── etc.
```

The plugin creates a lightweight wrapper around the core navigation block:
- The wrapper adds priority+ behavior via JavaScript
- The core navigation block handles all menu functionality
- This separation keeps the code maintainable and future-proof

### Frontend Behavior

1. **On page load**: The script measures all navigation items
2. **Overflow detection**: Calculates how many items fit in available space
3. **Item distribution**: 
   - Visible items stay in the main navigation
   - Overflow items move to the "More" dropdown
   - At least one item always remains visible
4. **Responsive updates**: ResizeObserver automatically recalculates on viewport changes
5. **Smooth transitions**: Uses `requestAnimationFrame` for optimal performance

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
│   ├── block.json         # Block configuration
│   ├── index.js           # Block registration & transforms
│   ├── edit.js            # Block editor component
│   ├── save.js            # Block save function
│   ├── view.js            # Frontend JavaScript
│   ├── style.scss         # Frontend styles
│   └── editor.scss        # Editor-only styles
├── priority-nav.php       # Main plugin file
├── package.json           # Node dependencies & scripts
└── README.md             # Documentation
```

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Uses ResizeObserver API (supported in all modern browsers)
- Falls back gracefully if JavaScript is disabled

## Accessibility

- **ARIA attributes**: `aria-expanded`, `aria-haspopup`, `aria-label`
- **Keyboard navigation**: Escape key closes dropdown
- **Screen reader support**: Proper semantic markup
- **Focus management**: Standard browser focus behavior

## Performance

- **ResizeObserver**: Efficient viewport change detection
- **requestAnimationFrame**: Smooth, jank-free calculations
- **Width caching**: Minimizes layout recalculations
- **Debounced recalculation**: Prevents excessive computation

## Changelog

### 0.1.0 - Initial Release
- Priority+ navigation wrapper block
- Bidirectional transforms (Navigation ↔ Priority+ Navigation)
- Customizable "More" button label and icon
- Full block theme support
- Responsive overflow detection
- Accessible implementation

## Credits

Built with WordPress block development tools and inspired by the Priority+ navigation pattern.

## License

GPL-2.0-or-later

## Support

For issues, questions, or contributions, please visit the plugin repository.

