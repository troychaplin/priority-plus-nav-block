# Priority Plus Navigation - Claude Context

## Project Overview

A WordPress block plugin that extends the core Navigation block with the "Priority Plus" responsive pattern. Navigation items that don't fit in available space automatically move to a "More" dropdown menu.

## Architecture

### Block Variation Approach
- Extends `core/navigation` as a block variation (not a wrapper block)
- Registered in `src/variation/block.js` with name `priority-plus-navigation`
- Identified by className `is-style-priority-plus-navigation`
- Custom attributes prefixed with `priorityNav*`

### Key Files

**Editor (Block Extension)**
- `src/variation/block.js` - Registers block variation and extends core/navigation attributes
- `src/variation/controls.js` - Adds InspectorControls via `editor.BlockEdit` filter
- `src/variation/constants.js` - Shared defaults (DEFAULT_DROPDOWN_STYLES)

**Modal & Components**
- `src/variation/components/dropdown-customizer-modal.js` - Main modal component for dropdown styling
- `src/variation/components/dropdown-preview.js` - Live preview inside modal
- `src/variation/components/panels/color-panel.js` - PanelColorSettings for dropdown colors
- `src/variation/components/panels/menu-styles-panel.js` - ToolsPanel for border, radius, shadow
- `src/variation/components/panels/menu-spacing-panel.js` - ToolsPanel for item spacing and indent

**Styles**
- `src/variation/components/modal.scss` - Modal layout styles
- `src/variation/components/dropdown-preview.scss` - Preview component styles
- `src/styles/style.scss` - Frontend dropdown styles
- `src/styles/editor.scss` - Editor-specific styles

**Frontend**
- `src/core/PriorityNav.js` - Main frontend class handling overflow detection
- `src/layout/width-calculator.js` - Width calculation algorithm
- `src/dom/dom-builder.js` - Builds dropdown menu dynamically
- `src/dom/dom-extractor.js` - Extracts nav item data
- `src/events/accordion-handler.js` - Handles accordion submenus
- `src/events/event-handlers.js` - Click/keyboard event handlers

## Modal Structure (Dropdown Customizer)

Triggered from ToolsPanel in controls.js via "Customize Dropdown" button.

```
DropdownCustomizerModal
├── ColorPanel - Background, hover background, hover text colors
├── MenuStylesPanel - Border (BorderBoxControl), border radius, box shadow
├── MenuSpacingPanel - Item spacing (BoxControl/SpacingSizesControl), multi-level indent
└── DropdownPreview - Live preview with actual frontend classes
```

**State Flow:**
1. `controls.js` manages `isDropdownCustomizerOpen` state
2. Modal reads `attributes.priorityNavDropdownStyles` merged with DEFAULT_DROPDOWN_STYLES
3. Updates via `updateStyle(key, value)` helper → `setAttributes({ priorityNavDropdownStyles: {...} })`
4. Preview updates instantly using CSS custom properties

## Custom Attributes (on core/navigation)

```javascript
priorityNavEnabled: boolean           // Whether Priority+ is active
priorityNavMoreLabel: string          // "More" button text
priorityNavMoreBackgroundColor: string
priorityNavMoreBackgroundColorHover: string
priorityNavMoreTextColor: string
priorityNavMoreTextColorHover: string
priorityNavMorePadding: object        // {top, right, bottom, left}
priorityNavDropdownStyles: object     // Full dropdown styling object
priorityNavTypographyFontFamily: string  // Copied from block for preview
priorityNavTypographyFontSize: string
priorityNavTypographyFontWeight: string
priorityNavTypographyFontStyle: string
```

## DEFAULT_DROPDOWN_STYLES

```javascript
{
  backgroundColor: '#ffffff',
  borderColor: '#dddddd',
  borderWidth: '1px',
  borderRadius: '4px',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
  itemSpacing: { top: '0.75rem', right: '1rem', bottom: '0.75rem', left: '1rem' },
  itemHoverBackgroundColor: 'rgba(0, 0, 0, 0.05)',
  itemHoverTextColor: 'inherit',
  multiLevelIndent: '1.25rem',
}
```

## WordPress Components Used

- `Modal`, `Button`, `TextControl`, `BoxControl` from `@wordpress/components`
- `ToolsPanel`, `ToolsPanelItem` (experimental)
- `BorderBoxControl`, `UnitControl` (experimental)
- `SpacingSizesControl` (experimental) from `@wordpress/block-editor`
- `PanelColorSettings`, `InspectorControls`, `useSetting` from `@wordpress/block-editor`

## Build Commands

```bash
npm run start    # Development with hot reload
npm run build    # Production build
npm run lint:js  # Lint JavaScript
npm run lint:css # Lint CSS/SCSS
```

## Notes

- Modal uses two-column grid layout (controls left, preview right)
- Preview uses exact same CSS classes as frontend for accuracy
- Preset values (var:preset|spacing|30) are converted to CSS custom properties
- BorderBoxControl in MenuStylesPanel handles both color and width updates atomically
- Typography settings are mirrored from navigation block for preview accuracy
