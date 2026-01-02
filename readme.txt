
=== Priority+ Nav ===

Contributors:      areziaal
Tags:              block, navigation, responsive, priority-plus
Tested up to:      6.9
Stable tag:        1.0.0
License:           GPLv2 or later
License URI:       https://www.gnu.org/licenses/gpl-2.0.html

A WordPress block plugin that adds Priority+ pattern functionality to core WordPress navigation block. It automatically moves navigation items that don't fit into a responsive "More" dropdown menu (default label: "Browse") as the viewport narrows.

== Description ==

Priority Nav extends the core WordPress Navigation block as a variation, implementing the Priority+ design pattern. It displays the most important navigation items in the main menu bar and automatically moves overflow items into a "More" dropdown menu (default label: "Browse") when horizontal space is limited.

Key Features:

* **Automatic Overflow Detection**: Continuously monitors available space and adjusts navigation visibility
* **Responsive by Design**: Adapts to any screen size or container width
* **Customizable Labels**: Change the "More" button text and icon
* **Seamless Integration**: Works beautifully with WordPress themes
* **Performance Optimized**: Uses ResizeObserver for efficient layout calculations
* **Accessible**: Keyboard navigation and screen reader friendly

Perfect for sites with many navigation items that need to work across all device sizes without compromising usability.

== Installation ==

1. Upload the plugin files to the `/wp-content/plugins/priority-nav` directory, or install the plugin through the WordPress plugins screen directly.
2. Activate the plugin through the 'Plugins' screen in WordPress
3. Add a Navigation block and select the "Priority+ Nav" variation, or search for "Priority+ Nav" in the block inserter
4. Configure your navigation using the familiar WordPress navigation tools

== Frequently Asked Questions ==

= How does the Priority+ pattern work? =

The Priority+ pattern prioritizes the most important navigation items by keeping them visible in the main navigation bar. When there isn't enough horizontal space for all items, less important items are automatically moved into a "More" dropdown menu. As the viewport width changes, items dynamically move in and out of the dropdown.

= Can I customize the "More" button text? =

Yes! In the block inspector panel, you can customize both the "More" button label (default: "Browse") and choose from different icons: none (default), chevron down, plus, or menu symbols.

= Does it work with nested navigation items? =

Yes! Items with submenus in the dropdown are converted to accessible accordions that respect the Core Navigation "Open submenus on click" setting.

= How does it work with WordPress's responsive overlay menu? =

Priority+ Nav intelligently integrates with WordPress core navigation overlay menu settings:

* **Never**: Priority+ is always active across all screen sizes
* **Mobile**: Priority+ works on desktop and automatically disables when the hamburger menu activates
* **Always**: Not compatible - Priority+ is automatically disabled and the "Always" option appears greyed out in the editor

= Is it accessible? =

Yes, the block is built with accessibility in mind, supporting keyboard navigation and providing proper ARIA labels for screen readers.

== Screenshots ==

1. Priority Nav showing all items on wide screens
2. Priority Nav with overflow items moved to "More" dropdown on smaller screens
3. Block inspector controls for customization

== Changelog ==

= 0.3.0 =
* Added intelligent overlay menu detection and compatibility
* Priority+ now properly disables when hamburger menu is active (overlayMenu: 'mobile')
* "Always" overlay option is automatically prevented and visually disabled in editor
* Improved hamburger mode detection using `is-menu-open` class
* Enhanced documentation with overlay menu compatibility details

= 0.2.0 =
* Refactored to use block variation approach instead of wrapper block
* Improved editor integration with isActive detection
* Legacy wrapper blocks still supported for backward compatibility

= 0.1.0 =
* Initial release
* Implements Priority+ navigation pattern
* Automatic overflow detection and management
* Customizable "More" button
* Full keyboard and screen reader support