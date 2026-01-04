<?php
/**
 * Enqueue assets.
 *
 * @package PriorityPlusNavigation
 */

namespace PriorityPlusNavigation;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Class Enqueues
 *
 * This class is responsible for enqueueing scripts and styles for the plugin.
 *
 * @package PriorityPlusNavigation
 */
class Enqueues extends Plugin_Module {
	/**
	 * Path resolver for build directory.
	 *
	 * @var Plugin_Paths
	 */
	private Plugin_Paths $build_dir;

	/**
	 * Track if we've enqueued the frontend assets (to avoid duplicates).
	 *
	 * @var bool
	 */
	private bool $frontend_assets_enqueued = false;

	/**
	 * Setup the class.
	 *
	 * @param string $build_path Absolute path to the build directory for all assets.
	 */
	public function __construct( string $build_path ) {
		$this->build_dir = new Plugin_Paths( $build_path );
	}

	/**
	 * Initialize the module.
	 */
	public function init() {
		add_action( 'enqueue_block_editor_assets', array( $this, 'enqueue_editor_assets' ) );
		add_filter( 'render_block', array( $this, 'render_block' ), 10, 2 );
	}

	/**
	 * Enqueue editor assets for Priority Plus Navigation extension.
	 * Loads JS that extends core/navigation with Priority+ functionality.
	 *
	 * @return void
	 */
	public function enqueue_editor_assets(): void {
		$asset_script = $this->build_dir->get_asset_meta( 'priority-plus-nav-editor.js' );
		$asset_style  = $this->build_dir->get_path( 'priority-plus-nav-editor.css' );

		if ( ! $asset_script ) {
			return;
		}

		wp_enqueue_script(
			'priority-plus-nav-editor',
			$this->build_dir->get_url( 'priority-plus-nav-editor.js' ),
			$asset_script['dependencies'],
			$asset_script['version'],
			true
		);

		if ( file_exists( $asset_style ) ) {
			wp_enqueue_style(
				'priority-plus-nav-editor-style',
				$this->build_dir->get_url( 'priority-plus-nav-editor.css' ),
				array(),
				$asset_script['version']
			);
		}
	}

	/**
	 * Enqueue Priority+ frontend script and styles (only once).
	 * Called from render_block when needed.
	 *
	 * @return void
	 */
	private function enqueue_frontend_assets_once(): void {
		if ( $this->frontend_assets_enqueued ) {
			return;
		}

		$asset_meta = $this->build_dir->get_asset_meta( 'priority-plus-navigation.js' );
		if ( ! $asset_meta ) {
			return;
		}

		$this->frontend_assets_enqueued = true;

		wp_enqueue_script(
			'priority-plus-navigation',
			$this->build_dir->get_url( 'priority-plus-navigation.js' ),
			$asset_meta['dependencies'],
			$asset_meta['version'],
			true
		);

		$style_path = $this->build_dir->get_path( 'style-priority-plus-navigation.css' );
		if ( file_exists( $style_path ) ) {
			wp_enqueue_style(
				'priority-plus-navigation',
				$this->build_dir->get_url( 'style-priority-plus-navigation.css' ),
				array(),
				$asset_meta['version']
			);
		}
	}

	/**
	 * Filter block rendering to inject Priority+ data attributes and enqueue frontend assets when needed.
	 *
	 * @param string $block_content The block content.
	 * @param array  $block         The full block, including name and attributes.
	 * @return string Modified block content.
	 */
	public function render_block( string $block_content, array $block ): string {
		// Early return for non-navigation blocks.
		$block_name = $block['blockName'] ?? '';
		if ( 'core/navigation' !== $block_name ) {
			return $block_content;
		}

		// Check if Priority+ is enabled via attribute or class name.
		if ( ! $this->is_priority_nav_enabled( $block ) ) {
			return $block_content;
		}

		// Enqueue frontend assets (only once per page).
		$this->enqueue_frontend_assets_once();

		// Get Priority+ configuration with defaults.
		$toggle_label                  = $this->get_priority_attr( $block, 'priorityPlusToggleLabel', 'More' );
		$toggle_icon                   = $this->get_priority_attr( $block, 'priorityPlusToggleIcon', 'none' );
		$toggle_background_color       = $this->get_priority_attr( $block, 'priorityPlusToggleBackgroundColor', '' );
		$toggle_background_color_hover = $this->get_priority_attr( $block, 'priorityPlusToggleBackgroundColorHover', '' );
		$toggle_text_color             = $this->get_priority_attr( $block, 'priorityPlusToggleTextColor', '' );
		$toggle_text_color_hover       = $this->get_priority_attr( $block, 'priorityPlusToggleTextColorHover', '' );
		$toggle_padding                = $this->get_priority_attr( $block, 'priorityPlusTogglePadding', array() );
		$overlay_menu                  = $this->get_priority_attr( $block, 'overlayMenu', 'never' );

		// Get menu style attributes (separate attributes for reliable updates).
		$menu_background_color      = $this->get_priority_attr( $block, 'priorityPlusMenuBackgroundColor', '' );
		$menu_border                = $this->get_priority_attr( $block, 'priorityPlusMenuBorder', array() );
		$menu_border_radius         = $this->get_priority_attr( $block, 'priorityPlusMenuBorderRadius', '' );
		$menu_box_shadow            = $this->get_priority_attr( $block, 'priorityPlusMenuBoxShadow', '' );
		$menu_item_padding          = $this->get_priority_attr( $block, 'priorityPlusMenuItemPadding', array() );
		$menu_item_hover_background = $this->get_priority_attr( $block, 'priorityPlusMenuItemHoverBackground', '' );
		$menu_item_hover_text_color = $this->get_priority_attr( $block, 'priorityPlusMenuItemHoverTextColor', '' );
		$menu_submenu_indent        = $this->get_priority_attr( $block, 'priorityPlusMenuSubmenuIndent', '' );

		// Inject data attributes into the navigation element.
		return $this->inject_priority_attributes(
			$block_content,
			$toggle_label,
			$toggle_icon,
			$toggle_background_color,
			$toggle_background_color_hover,
			$toggle_text_color,
			$toggle_text_color_hover,
			$toggle_padding,
			$overlay_menu,
			$menu_background_color,
			$menu_border,
			$menu_border_radius,
			$menu_box_shadow,
			$menu_item_padding,
			$menu_item_hover_background,
			$menu_item_hover_text_color,
			$menu_submenu_indent
		);
	}

	/**
	 * Check if Priority Plus Navigation is enabled for this block.
	 *
	 * @param array $block The full block array.
	 * @return bool True if Priority+ is enabled.
	 */
	private function is_priority_nav_enabled( array $block ): bool {
		$attrs = $block['attrs'] ?? array();

		// Check if overlayMenu is set to 'always' - Priority+ should not run.
		$overlay_menu = $attrs['overlayMenu'] ?? '';
		if ( 'always' === $overlay_menu ) {
			return false;
		}

		// Check explicit attribute.
		if ( ! empty( $attrs['priorityPlusEnabled'] ) ) {
			return true;
		}

		// Check for class name from block variation.
		$class_name = $attrs['className'] ?? '';
		return false !== strpos( $class_name, 'is-style-priority-plus-navigation' );
	}

	/**
	 * Get a Priority+ attribute value with a default fallback.
	 *
	 * @param array        $block         The full block array.
	 * @param string       $attr_name     The attribute name to retrieve.
	 * @param string|array $default_value The default value if attribute is missing or empty.
	 * @return string|array The attribute value or default.
	 */
	private function get_priority_attr( array $block, string $attr_name, $default_value = '' ) {
		$attrs = $block['attrs'] ?? array();
		$value = $attrs[ $attr_name ] ?? null;

		if ( null === $value ) {
			return $default_value;
		}

		// For strings, check if empty.
		if ( is_string( $value ) && '' === $value ) {
			return $default_value;
		}

		// For arrays, check if it's truly empty (no elements).
		// Note: An array with keys but empty string values is NOT considered empty here,
		// as it might contain valid empty values that should be processed.
		if ( is_array( $value ) && 0 === count( $value ) ) {
			return $default_value;
		}

		return $value;
	}

	/**
	 * Convert WordPress preset value format to CSS custom property format.
	 *
	 * WordPress stores preset values as "var:preset|spacing|30" which needs to be
	 * converted to "var(--wp--preset--spacing--30)" for CSS.
	 *
	 * @param string $value The preset value string.
	 * @return string Converted CSS custom property or original value.
	 */
	private function convert_preset_value( string $value ): string {
		// Check if value matches WordPress preset format: var:preset|spacing|30.
		if ( preg_match( '/^var:preset\|([^|]+)\|(.+)$/', $value, $matches ) ) {
			$preset_type = $matches[1];
			$preset_slug = $matches[2];
			return sprintf( 'var(--wp--preset--%s--%s)', $preset_type, $preset_slug );
		}

		// If it's already a CSS custom property, return as-is.
		if ( strpos( $value, 'var(' ) === 0 ) {
			return $value;
		}

		// Otherwise return the original value.
		return $value;
	}

	/**
	 * Convert border value to CSS style parts.
	 *
	 * Handles both flat format (e.g., { color: '#ddd', width: '1px', style: 'solid' })
	 * and per-side format (e.g., { top: { color, width, style }, right: {...}, ... }).
	 *
	 * @param array $border The border value (flat or per-side).
	 * @return array Array of CSS style declarations to add to style_parts.
	 */
	private function border_to_css( array $border ): array {
		$style_parts = array();
		$defaults    = array(
			'color' => '#dddddd',
			'width' => '1px',
			'style' => 'solid',
		);

		// Check if it's a flat border (has color, width, or style at top level).
		if ( isset( $border['color'] ) || isset( $border['width'] ) || isset( $border['style'] ) ) {
			$color = isset( $border['color'] ) ? $border['color'] : $defaults['color'];
			$width = isset( $border['width'] ) ? $border['width'] : $defaults['width'];
			$style = isset( $border['style'] ) ? $border['style'] : $defaults['style'];

			$style_parts[] = sprintf(
				'--wp--custom--priority-plus-navigation--dropdown--border-color: %s',
				esc_attr( $color )
			);
			$style_parts[] = sprintf(
				'--wp--custom--priority-plus-navigation--dropdown--border-width: %s',
				esc_attr( $width )
			);
			$style_parts[] = sprintf(
				'--wp--custom--priority-plus-navigation--dropdown--border-style: %s',
				esc_attr( $style )
			);

			return $style_parts;
		}

		// Check if it's per-side format (has top, right, bottom, left).
		$sides         = array( 'top', 'right', 'bottom', 'left' );
		$side_css_vars = array(
			'top'    => '--wp--custom--priority-plus-navigation--dropdown--border-top',
			'right'  => '--wp--custom--priority-plus-navigation--dropdown--border-right',
			'bottom' => '--wp--custom--priority-plus-navigation--dropdown--border-bottom',
			'left'   => '--wp--custom--priority-plus-navigation--dropdown--border-left',
		);

		foreach ( $sides as $side ) {
			if ( isset( $border[ $side ] ) && is_array( $border[ $side ] ) ) {
				$side_border = $border[ $side ];
				// Only add CSS var if at least one property is set.
				if ( isset( $side_border['color'] ) || isset( $side_border['width'] ) || isset( $side_border['style'] ) ) {
					$width = isset( $side_border['width'] ) ? $side_border['width'] : $defaults['width'];
					$style = isset( $side_border['style'] ) ? $side_border['style'] : $defaults['style'];
					$color = isset( $side_border['color'] ) ? $side_border['color'] : $defaults['color'];

					$style_parts[] = sprintf(
						'%s: %s %s %s',
						$side_css_vars[ $side ],
						esc_attr( $width ),
						esc_attr( $style ),
						esc_attr( $color )
					);
				}
			}
		}

		return $style_parts;
	}

	/**
	 * Convert border radius value to CSS string.
	 *
	 * Handles both string format (e.g., '4px') and per-corner object format
	 * (e.g., { topLeft: '4px', topRight: '0', bottomRight: '4px', bottomLeft: '0' }).
	 *
	 * @param string|array $border_radius The border radius value.
	 * @return string CSS border-radius value string.
	 */
	private function border_radius_to_css( $border_radius ): string {
		// Handle string format directly.
		if ( is_string( $border_radius ) ) {
			return $border_radius;
		}

		// Handle object format (per-corner values).
		if ( is_array( $border_radius ) ) {
			$top_left     = isset( $border_radius['topLeft'] ) ? (string) $border_radius['topLeft'] : '';
			$top_right    = isset( $border_radius['topRight'] ) ? (string) $border_radius['topRight'] : '';
			$bottom_right = isset( $border_radius['bottomRight'] ) ? (string) $border_radius['bottomRight'] : '';
			$bottom_left  = isset( $border_radius['bottomLeft'] ) ? (string) $border_radius['bottomLeft'] : '';

			// If all values are empty, return empty string.
			if ( '' === $top_left && '' === $top_right && '' === $bottom_right && '' === $bottom_left ) {
				return '';
			}

			// If all values are the same, use single value shorthand.
			if ( '' !== $top_left && $top_left === $top_right && $top_right === $bottom_right && $bottom_right === $bottom_left ) {
				return $top_left;
			}

			// Use '0' for empty corners.
			$top_left     = '' !== $top_left ? $top_left : '0';
			$top_right    = '' !== $top_right ? $top_right : '0';
			$bottom_right = '' !== $bottom_right ? $bottom_right : '0';
			$bottom_left  = '' !== $bottom_left ? $bottom_left : '0';

			// Return full border-radius: top-left top-right bottom-right bottom-left.
			return $top_left . ' ' . $top_right . ' ' . $bottom_right . ' ' . $bottom_left;
		}

		return '';
	}

	/**
	 * Convert padding object to CSS value string.
	 *
	 * @param array $padding Padding object with top, right, bottom, left keys.
	 * @return string CSS padding value string.
	 */
	private function padding_to_css( array $padding ): string {
		if ( empty( $padding ) ) {
			return '';
		}

		$top    = isset( $padding['top'] ) ? (string) $padding['top'] : '';
		$right  = isset( $padding['right'] ) ? (string) $padding['right'] : '';
		$bottom = isset( $padding['bottom'] ) ? (string) $padding['bottom'] : '';
		$left   = isset( $padding['left'] ) ? (string) $padding['left'] : '';

		// If all values are empty, return empty string.
		if ( '' === $top && '' === $right && '' === $bottom && '' === $left ) {
			return '';
		}

		// Convert preset values to CSS custom property format.
		$top    = '' !== $top ? $this->convert_preset_value( $top ) : '';
		$right  = '' !== $right ? $this->convert_preset_value( $right ) : '';
		$bottom = '' !== $bottom ? $this->convert_preset_value( $bottom ) : '';
		$left   = '' !== $left ? $this->convert_preset_value( $left ) : '';

		// If all values are the same and not empty, use single value shorthand.
		if ( '' !== $top && $top === $right && $right === $bottom && $bottom === $left ) {
			return $top;
		}

		// For partial padding or mixed values, we need all 4 values.
		// Use '0' for empty sides to ensure proper CSS.
		$top    = '' !== $top ? $top : '0';
		$right  = '' !== $right ? $right : '0';
		$bottom = '' !== $bottom ? $bottom : '0';
		$left   = '' !== $left ? $left : '0';

		// Use shorthand when top/bottom are same and left/right are same.
		if ( $top === $bottom && $right === $left ) {
			return $top . ' ' . $right;
		}

		// Otherwise, return all 4 values.
		return $top . ' ' . $right . ' ' . $bottom . ' ' . $left;
	}

	/**
	 * Inject Priority+ data attributes into the navigation element.
	 *
	 * @param string       $block_content                 The block HTML content.
	 * @param string       $toggle_label                  The toggle button label.
	 * @param string       $toggle_icon                   The toggle button icon.
	 * @param string       $toggle_background_color       The toggle button background color.
	 * @param string       $toggle_background_color_hover The toggle button background hover color.
	 * @param string       $toggle_text_color             The toggle button text color.
	 * @param string       $toggle_text_color_hover       The toggle button text hover color.
	 * @param array        $toggle_padding                The toggle button padding values.
	 * @param string       $overlay_menu                  The overlay menu setting (never, mobile, always).
	 * @param string       $menu_background_color         Menu background color.
	 * @param array        $menu_border                   Menu border (flat or per-side).
	 * @param string|array $menu_border_radius            Menu border radius.
	 * @param string       $menu_box_shadow               Menu box shadow.
	 * @param array        $menu_item_padding             Menu item padding.
	 * @param string       $menu_item_hover_background    Menu item hover background color.
	 * @param string       $menu_item_hover_text_color    Menu item hover text color.
	 * @param string       $menu_submenu_indent           Menu submenu indent.
	 * @return string Modified block content with data attributes.
	 */
	private function inject_priority_attributes(
		string $block_content,
		string $toggle_label,
		string $toggle_icon,
		string $toggle_background_color = '',
		string $toggle_background_color_hover = '',
		string $toggle_text_color = '',
		string $toggle_text_color_hover = '',
		array $toggle_padding = array(),
		string $overlay_menu = 'never',
		string $menu_background_color = '',
		array $menu_border = array(),
		$menu_border_radius = '',
		string $menu_box_shadow = '',
		array $menu_item_padding = array(),
		string $menu_item_hover_background = '',
		string $menu_item_hover_text_color = '',
		string $menu_submenu_indent = ''
	): string {
		if ( '' === $block_content ) {
			return $block_content;
		}

		// Match the opening <nav> tag with wp-block-navigation class.
		$pattern = '/(<nav[^>]*\bclass="[^"]*wp-block-navigation[^"]*")/i';

		// Extract existing style attribute if present (WordPress adds typography styles here).
		// This pattern handles both attribute orders: style before class and class before style.
		$existing_style = '';
		if ( preg_match( '/<nav[^>]*\bstyle="([^"]*)"/i', $block_content, $style_matches ) ) {
			$existing_style = $style_matches[1];
		}

		// Build style attribute with CSS custom properties.
		$style_parts = array();

		// First, preserve WordPress's existing inline styles (typography, etc.).
		if ( ! empty( $existing_style ) ) {
			$style_declarations = explode( ';', $existing_style );
			foreach ( $style_declarations as $declaration ) {
				$declaration = trim( $declaration );
				if ( ! empty( $declaration ) ) {
					$style_parts[] = $declaration;
				}
			}
		}

		// Add our CSS custom properties.
		if ( ! empty( $toggle_background_color ) ) {
			$style_parts[] = sprintf(
				'--priority-plus-navigation--background: %s',
				esc_attr( $toggle_background_color )
			);
		}
		if ( ! empty( $toggle_background_color_hover ) ) {
			$style_parts[] = sprintf(
				'--priority-plus-navigation--background-hover: %s',
				esc_attr( $toggle_background_color_hover )
			);
		}
		if ( ! empty( $toggle_text_color ) ) {
			$style_parts[] = sprintf(
				'--priority-plus-navigation--color: %s',
				esc_attr( $toggle_text_color )
			);
		}
		if ( ! empty( $toggle_text_color_hover ) ) {
			$style_parts[] = sprintf(
				'--priority-plus-navigation--color-hover: %s',
				esc_attr( $toggle_text_color_hover )
			);
		}

		// Convert padding object to CSS value and add as custom property.
		// Check if padding is an array with at least one key (even if values are empty strings).
		if ( is_array( $toggle_padding ) && ! empty( $toggle_padding ) ) {
			$padding_css = $this->padding_to_css( $toggle_padding );
			// Only add if we got a non-empty CSS value (empty string means no padding was set).
			if ( '' !== $padding_css ) {
				$style_parts[] = sprintf(
					'--priority-plus-navigation--padding: %s',
					esc_attr( $padding_css )
				);
			}
		}

		// Add menu style CSS custom properties.
		if ( ! empty( $menu_background_color ) ) {
			$style_parts[] = sprintf(
				'--wp--custom--priority-plus-navigation--dropdown--background-color: %s',
				esc_attr( $menu_background_color )
			);
		}

		if ( ! empty( $menu_box_shadow ) ) {
			$style_parts[] = sprintf(
				'--wp--custom--priority-plus-navigation--dropdown--box-shadow: %s',
				esc_attr( $menu_box_shadow )
			);
		}

		if ( ! empty( $menu_item_hover_background ) ) {
			$style_parts[] = sprintf(
				'--wp--custom--priority-plus-navigation--dropdown--item-hover-background-color: %s',
				esc_attr( $menu_item_hover_background )
			);
		}

		if ( ! empty( $menu_item_hover_text_color ) ) {
			$style_parts[] = sprintf(
				'--wp--custom--priority-plus-navigation--dropdown--item-hover-text-color: %s',
				esc_attr( $menu_item_hover_text_color )
			);
		}

		if ( ! empty( $menu_submenu_indent ) ) {
			$style_parts[] = sprintf(
				'--wp--custom--priority-plus-navigation--dropdown--multi-level-indent: %s',
				esc_attr( $menu_submenu_indent )
			);
		}

		// Handle border separately as it can be flat or per-side object.
		if ( is_array( $menu_border ) && ! empty( $menu_border ) ) {
			$border_css_parts = $this->border_to_css( $menu_border );
			$style_parts      = array_merge( $style_parts, $border_css_parts );
		}

		// Handle borderRadius separately as it can be a string or per-corner object.
		if ( ! empty( $menu_border_radius ) ) {
			$border_radius_css = $this->border_radius_to_css( $menu_border_radius );

			if ( '' !== $border_radius_css ) {
				$style_parts[] = sprintf(
					'--wp--custom--priority-plus-navigation--dropdown--border-radius: %s',
					esc_attr( $border_radius_css )
				);
			}
		}

		// Handle itemPadding separately as it can be an object (SpacingSizesControl) or string.
		if ( ! empty( $menu_item_padding ) ) {
			$item_padding_css = '';
			if ( is_array( $menu_item_padding ) ) {
				// Convert padding object to CSS value (same logic as padding_to_css).
				$item_padding_css = $this->padding_to_css( $menu_item_padding );
			} elseif ( is_string( $menu_item_padding ) ) {
				// Use string value directly (backward compatibility).
				$item_padding_css = $menu_item_padding;
			}

			if ( '' !== $item_padding_css ) {
				$style_parts[] = sprintf(
					'--wp--custom--priority-plus-navigation--dropdown--item-spacing: %s',
					esc_attr( $item_padding_css )
				);
			}
		}

		// Build attributes string.
		$attributes = sprintf(
			'$1 data-more-label="%s" data-more-icon="%s" data-overlay-menu="%s"',
			esc_attr( $toggle_label ),
			esc_attr( $toggle_icon ),
			esc_attr( $overlay_menu )
		);

		// Add style attribute if we have any styles.
		if ( ! empty( $style_parts ) ) {
			// Join with semicolons and ensure proper formatting.
			$style_attr = implode( '; ', $style_parts );

			// Debug: Log the final style attribute to help diagnose issues.
			// error_log( 'Priority Plus Nav - Final style attribute: ' . $style_attr );.

			$attributes .= ' style="' . $style_attr . ';"';
		}

		// Remove existing style attribute from the nav tag if it exists, since we're adding it back.
		// This pattern handles both attribute orders: style before class and class before style.
		$block_content = preg_replace( '/(<nav[^>]*?)\s+style="[^"]*"([^>]*?>)/i', '$1$2', $block_content, 1 );

		$replacement = $attributes;

		return preg_replace( $pattern, $replacement, $block_content, 1 );
	}
}
