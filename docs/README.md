# Priority+ Navigation - Documentation

## What is Priority+?

Priority+ navigation is a responsive design pattern that solves a common problem: fitting many navigation items into limited horizontal space without immediately hiding everything behind a hamburger menu.

### The Problem

Traditional navigation approaches face challenges:

- **Fixed navigation**: Items wrap or overflow on smaller screens
- **Hamburger-only**: Hides all items, reducing discoverability
- **Mega menus**: Complex and difficult to maintain

### The Priority+ Solution

Priority+ provides a progressive approach:

1. **Wide screens**: All navigation items visible
2. **Medium screens**: Less important items move to "More" dropdown
3. **Narrow screens**: Only most important items visible, rest in dropdown
4. **Dynamic**: Automatically adjusts as viewport changes

### Benefits

- **Better discoverability** - Important items always visible
- **Graceful degradation** - Progressive disclosure as space decreases
- **No hamburger needed** - Maintains horizontal navigation on desktop
- **Mobile friendly** - Works with WordPress hamburger menu on mobile

## How This Plugin Works

For detailed technical information, see [how-it-works.md](how-it-works.md).

### Quick Overview

1. **Block Variation Approach**
   - Extends WordPress core navigation block
   - No need to rebuild menus
   - Easy to convert between standard and Priority+ navigation

2. **Automatic Width Calculation**
   - Measures navigation items on page load
   - Caches widths for performance
   - Recalculates on viewport resize

3. **Smart Overflow Detection**
   - Calculates how many items fit
   - Hides overflow items
   - Builds dropdown menu dynamically

4. **Responsive Integration**
   - Works with WordPress overlay menu settings
   - Disables when hamburger menu is active
   - Seamless transitions between modes

## Usage

### For Users

See the main [README.md](../README.md) for:
- Installation instructions
- How to use the block
- Configuration options

### For Developers

See [how-it-works.md](how-it-works.md) for:
- Architecture overview
- Frontend lifecycle
- Width calculation algorithm
- Hamburger mode detection

## Support

For issues, questions, or contributions, please visit the plugin repository.
