<?php
/**
 * Enqueue assets.
 *
 * @package PriorityPlusNav
 */

namespace PriorityPlusNav;

/**
 * Class Enqueues
 *
 * This class is responsible for enqueueing scripts and styles for the plugin.
 *
 * @package PriorityPlusNav
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
	 * Enqueue editor assets for Priority+ Navigation extension.
	 * Loads JS that extends core/navigation with Priority+ functionality.
	 *
	 * @return void
	 */
	public function enqueue_editor_assets(): void {
		$asset_script = $this->build_dir->get_asset_meta( 'priority-editor.js' );
		$asset_style  = $this->build_dir->get_path( 'priority-editor.css' );

		if ( ! $asset_script ) {
			return;
		}

		wp_enqueue_script(
			'priority-nav-editor',
			$this->build_dir->get_url( 'priority-editor.js' ),
			$asset_script['dependencies'],
			$asset_script['version'],
			true
		);

		if ( file_exists( $asset_style ) ) {
			wp_enqueue_style(
				'priority-nav-editor-style',
				$this->build_dir->get_url( 'priority-editor.css' ),
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

		$asset_meta = $this->build_dir->get_asset_meta( 'priority-plus-nav.js' );
		if ( ! $asset_meta ) {
			return;
		}

		$this->frontend_assets_enqueued = true;

		wp_enqueue_script(
			'priority-plus-nav',
			$this->build_dir->get_url( 'priority-plus-nav.js' ),
			$asset_meta['dependencies'],
			$asset_meta['version'],
			true
		);

		$style_path = $this->build_dir->get_path( 'style-priority-plus-nav.css' );
		if ( file_exists( $style_path ) ) {
			wp_enqueue_style(
				'priority-plus-nav',
				$this->build_dir->get_url( 'style-priority-plus-nav.css' ),
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
		$more_label                  = $this->get_priority_attr( $block, 'priorityNavMoreLabel', 'Browse' );
		$more_icon                   = $this->get_priority_attr( $block, 'priorityNavMoreIcon', 'none' );
		$more_background_color       = $this->get_priority_attr( $block, 'priorityNavMoreBackgroundColor', '' );
		$more_background_color_hover = $this->get_priority_attr( $block, 'priorityNavMoreBackgroundColorHover', '' );
		$more_text_color             = $this->get_priority_attr( $block, 'priorityNavMoreTextColor', '' );
		$more_text_color_hover       = $this->get_priority_attr( $block, 'priorityNavMoreTextColorHover', '' );
		$more_padding                = $this->get_priority_attr( $block, 'priorityNavMorePadding', array() );
		$overlay_menu                = $this->get_priority_attr( $block, 'overlayMenu', 'never' );

		// Inject data attributes into the navigation element.
		return $this->inject_priority_attributes(
			$block_content,
			$more_label,
			$more_icon,
			$more_background_color,
			$more_background_color_hover,
			$more_text_color,
			$more_text_color_hover,
			$more_padding,
			$overlay_menu
		);
	}

	/**
	 * Check if Priority+ Navigation is enabled for this block.
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
		if ( ! empty( $attrs['priorityNavEnabled'] ) ) {
			return true;
		}

		// Check for class name from block variation.
		$class_name = $attrs['className'] ?? '';
		return false !== strpos( $class_name, 'is-style-priority-nav' );
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
	 * Convert border radius object to CSS value string.
	 *
	 * @param mixed $border_radius Border radius value (string or array with topLeft, topRight, bottomRight, bottomLeft).
	 * @return string CSS border-radius value string.
	 */
	private function border_radius_to_css( $border_radius ): string {
		// Handle string value.
		if ( is_string( $border_radius ) ) {
			return $border_radius;
		}

		// Handle array value.
		if ( ! is_array( $border_radius ) || empty( $border_radius ) ) {
			return '';
		}

		$top_left     = isset( $border_radius['topLeft'] ) ? (string) $border_radius['topLeft'] : '';
		$top_right    = isset( $border_radius['topRight'] ) ? (string) $border_radius['topRight'] : '';
		$bottom_right = isset( $border_radius['bottomRight'] ) ? (string) $border_radius['bottomRight'] : '';
		$bottom_left  = isset( $border_radius['bottomLeft'] ) ? (string) $border_radius['bottomLeft'] : '';

		// If all values are empty, return empty string.
		if ( '' === $top_left && '' === $top_right && '' === $bottom_right && '' === $bottom_left ) {
			return '';
		}

		// If all values are the same and not empty, use single value shorthand.
		if ( '' !== $top_left && $top_left === $top_right && $top_right === $bottom_right && $bottom_right === $bottom_left ) {
			return $top_left;
		}

		// For partial radius or mixed values, we need all 4 values.
		// Use '0' for empty corners to ensure proper CSS.
		$top_left     = '' !== $top_left ? $top_left : '0';
		$top_right    = '' !== $top_right ? $top_right : '0';
		$bottom_right = '' !== $bottom_right ? $bottom_right : '0';
		$bottom_left  = '' !== $bottom_left ? $bottom_left : '0';

		// CSS border-radius order: top-left, top-right, bottom-right, bottom-left.
		return $top_left . ' ' . $top_right . ' ' . $bottom_right . ' ' . $bottom_left;
	}

	/**
	 * Inject Priority+ data attributes into the navigation element.
	 *
	 * @param string $block_content              The block HTML content.
	 * @param string $more_label                 The "more" button label.
	 * @param string $more_icon                  The "more" button icon.
	 * @param string $more_background_color       The "more" button background color.
	 * @param string $more_background_color_hover The "more" button background hover color.
	 * @param string $more_text_color            The "more" button text color.
	 * @param string $more_text_color_hover      The "more" button text hover color.
	 * @param array  $more_padding               The "more" button padding values.
	 * @param string $overlay_menu               The overlay menu setting (never, mobile, always).
	 * @return string Modified block content with data attributes.
	 */
	private function inject_priority_attributes( string $block_content, string $more_label, string $more_icon, string $more_background_color = '', string $more_background_color_hover = '', string $more_text_color = '', string $more_text_color_hover = '', array $more_padding = array(), string $overlay_menu = 'never' ): string {
		if ( '' === $block_content ) {
			return $block_content;
		}

		// Match the opening <nav> tag with wp-block-navigation class.
		$pattern = '/(<nav[^>]*\bclass="[^"]*wp-block-navigation[^"]*")/i';

		// Extract existing style attribute if present.
		$existing_style = '';
		if ( preg_match( '/<nav[^>]*\bclass="[^"]*wp-block-navigation[^"]*"[^>]*style="([^"]*)"/i', $block_content, $style_matches ) ) {
			$existing_style = $style_matches[1];
		}

		// Build style attribute with CSS custom properties for colors.
		$style_parts = array();
		if ( ! empty( $existing_style ) ) {
			$style_parts[] = $existing_style;
		}

		// Add our CSS custom properties.
		if ( ! empty( $more_background_color ) ) {
			$style_parts[] = sprintf(
				'--priority-nav--background: %s',
				esc_attr( $more_background_color )
			);
		}
		if ( ! empty( $more_background_color_hover ) ) {
			$style_parts[] = sprintf(
				'--priority-nav--background-hover: %s',
				esc_attr( $more_background_color_hover )
			);
		}
		if ( ! empty( $more_text_color ) ) {
			$style_parts[] = sprintf(
				'--priority-nav--color: %s',
				esc_attr( $more_text_color )
			);
		}
		if ( ! empty( $more_text_color_hover ) ) {
			$style_parts[] = sprintf(
				'--priority-nav--color-hover: %s',
				esc_attr( $more_text_color_hover )
			);
		}

		// Convert padding object to CSS value and add as custom property.
		// Check if padding is an array with at least one key (even if values are empty strings).
		if ( is_array( $more_padding ) && ! empty( $more_padding ) ) {
			$padding_css = $this->padding_to_css( $more_padding );
			// Only add if we got a non-empty CSS value (empty string means no padding was set).
			if ( '' !== $padding_css ) {
				$style_parts[] = sprintf(
					'--priority-nav--padding: %s',
					esc_attr( $padding_css )
				);
			}
		}

		// Build attributes string.
		$attributes = sprintf(
			'$1 data-more-label="%s" data-more-icon="%s" data-overlay-menu="%s"',
			esc_attr( $more_label ),
			esc_attr( $more_icon ),
			esc_attr( $overlay_menu )
		);

		// Add style attribute if we have any styles.
		if ( ! empty( $style_parts ) ) {
			$attributes .= ' style="' . esc_attr( implode( '; ', $style_parts ) ) . '"';
		}

		// Remove existing style attribute from the nav tag if it exists, since we're adding it back.
		$block_content = preg_replace( '/(<nav[^>]*\bclass="[^"]*wp-block-navigation[^"]*"[^>]*)\s*style="[^"]*"/i', '$1', $block_content, 1 );

		$replacement = $attributes;

		return preg_replace( $pattern, $replacement, $block_content, 1 );
	}
}
