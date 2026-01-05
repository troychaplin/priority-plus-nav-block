<?php
/**
 * Block rendering and output modification.
 *
 * Filters core/navigation block output to inject Priority Plus functionality.
 *
 * @package PriorityPlusNavigation
 */

namespace PriorityPlusNavigation;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Class Block_Renderer
 *
 * Handles the render_block filter to inject Priority Plus data attributes
 * and inline styles into core/navigation blocks.
 *
 * @package PriorityPlusNavigation
 */
class Block_Renderer extends Plugin_Module {

	/**
	 * CSS converter utility.
	 *
	 * @var CSS_Converter
	 */
	private CSS_Converter $css_converter;

	/**
	 * Callback to enqueue frontend assets.
	 *
	 * @var callable
	 */
	private $enqueue_callback;

	/**
	 * Setup the class.
	 *
	 * @param CSS_Converter $css_converter    CSS converter utility instance.
	 * @param callable      $enqueue_callback Callback to enqueue frontend assets when needed.
	 */
	public function __construct( CSS_Converter $css_converter, callable $enqueue_callback ) {
		$this->css_converter    = $css_converter;
		$this->enqueue_callback = $enqueue_callback;
	}

	/**
	 * Initialize the module.
	 */
	public function init() {
		add_filter( 'render_block', array( $this, 'render_block' ), 10, 2 );
	}

	/**
	 * Filter block rendering to inject Priority+ data attributes and trigger asset enqueueing.
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

		// Trigger frontend asset enqueueing via callback.
		call_user_func( $this->enqueue_callback );

		// Collect all attributes.
		$attributes = $this->collect_attributes( $block );

		// Inject data attributes into the navigation element.
		return $this->inject_priority_attributes( $block_content, $attributes );
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
		if ( is_array( $value ) && 0 === count( $value ) ) {
			return $default_value;
		}

		return $value;
	}

	/**
	 * Collect all Priority Plus attributes from block.
	 *
	 * @param array $block The full block array.
	 * @return array Collected attributes.
	 */
	private function collect_attributes( array $block ): array {
		return array(
			// Toggle button attributes.
			'toggle_label'                  => $this->get_priority_attr( $block, 'priorityPlusToggleLabel', 'More' ),
			'toggle_icon'                   => $this->get_priority_attr( $block, 'priorityPlusToggleIcon', 'none' ),
			'toggle_background_color'       => $this->get_priority_attr( $block, 'priorityPlusToggleBackgroundColor', '' ),
			'toggle_background_color_hover' => $this->get_priority_attr( $block, 'priorityPlusToggleBackgroundColorHover', '' ),
			'toggle_text_color'             => $this->get_priority_attr( $block, 'priorityPlusToggleTextColor', '' ),
			'toggle_text_color_hover'       => $this->get_priority_attr( $block, 'priorityPlusToggleTextColorHover', '' ),
			'toggle_padding'                => $this->get_priority_attr( $block, 'priorityPlusTogglePadding', array() ),

			// Core navigation attribute.
			'overlay_menu'                  => $this->get_priority_attr( $block, 'overlayMenu', 'never' ),

			// Menu style attributes.
			'menu_background_color'         => $this->get_priority_attr( $block, 'priorityPlusMenuBackgroundColor', '' ),
			'menu_border'                   => $this->get_priority_attr( $block, 'priorityPlusMenuBorder', array() ),
			'menu_border_radius'            => $this->get_priority_attr( $block, 'priorityPlusMenuBorderRadius', '' ),
			'menu_box_shadow'               => $this->get_priority_attr( $block, 'priorityPlusMenuBoxShadow', '' ),
			'menu_item_padding'             => $this->get_priority_attr( $block, 'priorityPlusMenuItemPadding', array() ),
			'menu_item_hover_background'    => $this->get_priority_attr( $block, 'priorityPlusMenuItemHoverBackground', '' ),
			'menu_item_text_color'          => $this->get_priority_attr( $block, 'priorityPlusMenuItemTextColor', '' ),
			'menu_item_hover_text_color'    => $this->get_priority_attr( $block, 'priorityPlusMenuItemHoverTextColor', '' ),
			'menu_submenu_indent'           => $this->get_priority_attr( $block, 'priorityPlusMenuSubmenuIndent', '' ),
			'menu_item_separator'           => $this->get_priority_attr( $block, 'priorityPlusMenuItemSeparator', array() ),

			// Submenu color attributes.
			'submenu_background_color'       => $this->get_priority_attr( $block, 'priorityPlusSubmenuBackgroundColor', '' ),
			'submenu_item_hover_background'  => $this->get_priority_attr( $block, 'priorityPlusSubmenuItemHoverBackground', '' ),
			'submenu_item_text_color'        => $this->get_priority_attr( $block, 'priorityPlusSubmenuItemTextColor', '' ),
			'submenu_item_hover_text_color'  => $this->get_priority_attr( $block, 'priorityPlusSubmenuItemHoverTextColor', '' ),
		);
	}

	/**
	 * Inject Priority+ data attributes into the navigation element.
	 *
	 * @param string $block_content The block HTML content.
	 * @param array  $attributes    Collected attributes array.
	 * @return string Modified block content with data attributes.
	 */
	private function inject_priority_attributes( string $block_content, array $attributes ): string {
		if ( '' === $block_content ) {
			return $block_content;
		}

		// Match the opening <nav> tag with wp-block-navigation class.
		$pattern = '/(<nav[^>]*\bclass="[^"]*wp-block-navigation[^"]*")/i';

		// Build style parts array.
		$style_parts = $this->build_style_parts( $block_content, $attributes );

		// Build data attributes string.
		$data_attributes = sprintf(
			'$1 data-more-label="%s" data-more-icon="%s" data-overlay-menu="%s"',
			esc_attr( $attributes['toggle_label'] ),
			esc_attr( $attributes['toggle_icon'] ),
			esc_attr( $attributes['overlay_menu'] )
		);

		// Add style attribute if we have any styles.
		if ( ! empty( $style_parts ) ) {
			$style_attr       = implode( '; ', $style_parts );
			$data_attributes .= ' style="' . $style_attr . ';"';
		}

		// Remove existing style attribute from the nav tag if it exists.
		$block_content = preg_replace( '/(<nav[^>]*?)\s+style="[^"]*"([^>]*?>)/i', '$1$2', $block_content, 1 );

		return preg_replace( $pattern, $data_attributes, $block_content, 1 );
	}

	/**
	 * Build array of CSS style declarations.
	 *
	 * @param string $block_content Original block content (to preserve existing styles).
	 * @param array  $attributes    Collected attributes.
	 * @return array Array of CSS style declarations.
	 */
	private function build_style_parts( string $block_content, array $attributes ): array {
		$style_parts = array();

		// First, preserve WordPress's existing inline styles (typography, etc.).
		$style_parts = $this->preserve_existing_styles( $block_content, $style_parts );

		// Add toggle button styles.
		$style_parts = $this->add_toggle_styles( $attributes, $style_parts );

		// Add menu styles.
		$style_parts = $this->add_menu_styles( $attributes, $style_parts );

		return $style_parts;
	}

	/**
	 * Preserve existing inline styles from the block content.
	 *
	 * @param string $block_content Block HTML content.
	 * @param array  $style_parts   Current style parts array.
	 * @return array Updated style parts array.
	 */
	private function preserve_existing_styles( string $block_content, array $style_parts ): array {
		if ( preg_match( '/<nav[^>]*\bstyle="([^"]*)"/i', $block_content, $style_matches ) ) {
			$existing_style     = $style_matches[1];
			$style_declarations = explode( ';', $existing_style );
			foreach ( $style_declarations as $declaration ) {
				$declaration = trim( $declaration );
				if ( ! empty( $declaration ) ) {
					$style_parts[] = $declaration;
				}
			}
		}
		return $style_parts;
	}

	/**
	 * Add toggle button CSS custom properties.
	 *
	 * @param array $attributes  Collected attributes.
	 * @param array $style_parts Current style parts array.
	 * @return array Updated style parts array.
	 */
	private function add_toggle_styles( array $attributes, array $style_parts ): array {
		if ( ! empty( $attributes['toggle_background_color'] ) ) {
			$style_parts[] = sprintf(
				'--priority-plus-navigation--background: %s',
				esc_attr( $attributes['toggle_background_color'] )
			);
		}
		if ( ! empty( $attributes['toggle_background_color_hover'] ) ) {
			$style_parts[] = sprintf(
				'--priority-plus-navigation--background-hover: %s',
				esc_attr( $attributes['toggle_background_color_hover'] )
			);
		}
		if ( ! empty( $attributes['toggle_text_color'] ) ) {
			$style_parts[] = sprintf(
				'--priority-plus-navigation--color: %s',
				esc_attr( $attributes['toggle_text_color'] )
			);
		}
		if ( ! empty( $attributes['toggle_text_color_hover'] ) ) {
			$style_parts[] = sprintf(
				'--priority-plus-navigation--color-hover: %s',
				esc_attr( $attributes['toggle_text_color_hover'] )
			);
		}

		// Convert padding object to CSS value.
		if ( is_array( $attributes['toggle_padding'] ) && ! empty( $attributes['toggle_padding'] ) ) {
			$padding_css = $this->css_converter->padding_to_css( $attributes['toggle_padding'] );
			if ( '' !== $padding_css ) {
				$style_parts[] = sprintf(
					'--priority-plus-navigation--padding: %s',
					esc_attr( $padding_css )
				);
			}
		}

		return $style_parts;
	}

	/**
	 * Add menu CSS custom properties.
	 *
	 * @param array $attributes  Collected attributes.
	 * @param array $style_parts Current style parts array.
	 * @return array Updated style parts array.
	 */
	private function add_menu_styles( array $attributes, array $style_parts ): array {
		if ( ! empty( $attributes['menu_background_color'] ) ) {
			$style_parts[] = sprintf(
				'--wp--custom--priority-plus-navigation--dropdown--background-color: %s',
				esc_attr( $attributes['menu_background_color'] )
			);
		}

		if ( ! empty( $attributes['menu_box_shadow'] ) ) {
			$style_parts[] = sprintf(
				'--wp--custom--priority-plus-navigation--dropdown--box-shadow: %s',
				esc_attr( $attributes['menu_box_shadow'] )
			);
		}

		if ( ! empty( $attributes['menu_item_hover_background'] ) ) {
			$style_parts[] = sprintf(
				'--wp--custom--priority-plus-navigation--dropdown--item-hover-background-color: %s',
				esc_attr( $attributes['menu_item_hover_background'] )
			);
		}

		if ( ! empty( $attributes['menu_item_text_color'] ) ) {
			$style_parts[] = sprintf(
				'--wp--custom--priority-plus-navigation--dropdown--item-text-color: %s',
				esc_attr( $attributes['menu_item_text_color'] )
			);
		}

		if ( ! empty( $attributes['menu_item_hover_text_color'] ) ) {
			$style_parts[] = sprintf(
				'--wp--custom--priority-plus-navigation--dropdown--item-hover-text-color: %s',
				esc_attr( $attributes['menu_item_hover_text_color'] )
			);
		}

		if ( ! empty( $attributes['menu_submenu_indent'] ) ) {
			$submenu_indent_css = '';
			// Handle new object format (e.g., { left: '1.25rem' }).
			if ( is_array( $attributes['menu_submenu_indent'] ) && ! empty( $attributes['menu_submenu_indent']['left'] ) ) {
				$submenu_indent_css = $this->css_converter->convert_preset_value( $attributes['menu_submenu_indent']['left'] );
			} elseif ( is_string( $attributes['menu_submenu_indent'] ) ) {
				// Handle legacy string format.
				$submenu_indent_css = $this->css_converter->convert_preset_value( $attributes['menu_submenu_indent'] );
			}

			if ( '' !== $submenu_indent_css ) {
				$style_parts[] = sprintf(
					'--wp--custom--priority-plus-navigation--dropdown--multi-level-indent: %s',
					esc_attr( $submenu_indent_css )
				);
			}
		}

		// Handle border.
		if ( is_array( $attributes['menu_border'] ) && ! empty( $attributes['menu_border'] ) ) {
			$border_css_parts = $this->css_converter->border_to_css( $attributes['menu_border'] );
			$style_parts      = array_merge( $style_parts, $border_css_parts );
		}

		// Handle border radius.
		if ( ! empty( $attributes['menu_border_radius'] ) ) {
			$border_radius_css = $this->css_converter->border_radius_to_css( $attributes['menu_border_radius'] );
			if ( '' !== $border_radius_css ) {
				$style_parts[] = sprintf(
					'--wp--custom--priority-plus-navigation--dropdown--border-radius: %s',
					esc_attr( $border_radius_css )
				);
			}
		}

		// Handle item padding.
		if ( ! empty( $attributes['menu_item_padding'] ) ) {
			$item_padding_css = '';
			if ( is_array( $attributes['menu_item_padding'] ) ) {
				$item_padding_css = $this->css_converter->padding_to_css( $attributes['menu_item_padding'] );
			} elseif ( is_string( $attributes['menu_item_padding'] ) ) {
				$item_padding_css = $attributes['menu_item_padding'];
			}

			if ( '' !== $item_padding_css ) {
				$style_parts[] = sprintf(
					'--wp--custom--priority-plus-navigation--dropdown--item-spacing: %s',
					esc_attr( $item_padding_css )
				);
			}
		}

		// Handle item separator (top border on each li).
		// Use defaults if not set to ensure separator is visible on first load.
		$separator_defaults = array(
			'color' => '#dddddd',
			'width' => '1px',
			'style' => 'solid',
		);
		$separator          = is_array( $attributes['menu_item_separator'] ) && ! empty( $attributes['menu_item_separator'] )
			? $attributes['menu_item_separator']
			: $separator_defaults;

		$style_parts[] = sprintf(
			'--wp--custom--priority-plus-navigation--dropdown--item-separator-color: %s',
			esc_attr( ! empty( $separator['color'] ) ? $separator['color'] : $separator_defaults['color'] )
		);
		$style_parts[] = sprintf(
			'--wp--custom--priority-plus-navigation--dropdown--item-separator-width: %s',
			esc_attr( ! empty( $separator['width'] ) ? $separator['width'] : $separator_defaults['width'] )
		);
		$style_parts[] = sprintf(
			'--wp--custom--priority-plus-navigation--dropdown--item-separator-style: %s',
			esc_attr( ! empty( $separator['style'] ) ? $separator['style'] : $separator_defaults['style'] )
		);

		// Handle submenu colors (always output with defaults to ensure they're available on first load).
		$submenu_defaults = array(
			'background_color'      => '#ffffff',
			'item_hover_background' => 'rgba(0, 0, 0, 0.05)',
			'item_text_color'       => '#191919',
			'item_hover_text_color' => '#191919',
		);

		$style_parts[] = sprintf(
			'--wp--custom--priority-plus-navigation--dropdown--submenu-background-color: %s',
			esc_attr( ! empty( $attributes['submenu_background_color'] ) ? $attributes['submenu_background_color'] : $submenu_defaults['background_color'] )
		);
		$style_parts[] = sprintf(
			'--wp--custom--priority-plus-navigation--dropdown--submenu-item-hover-background-color: %s',
			esc_attr( ! empty( $attributes['submenu_item_hover_background'] ) ? $attributes['submenu_item_hover_background'] : $submenu_defaults['item_hover_background'] )
		);
		$style_parts[] = sprintf(
			'--wp--custom--priority-plus-navigation--dropdown--submenu-item-text-color: %s',
			esc_attr( ! empty( $attributes['submenu_item_text_color'] ) ? $attributes['submenu_item_text_color'] : $submenu_defaults['item_text_color'] )
		);
		$style_parts[] = sprintf(
			'--wp--custom--priority-plus-navigation--dropdown--submenu-item-hover-text-color: %s',
			esc_attr( ! empty( $attributes['submenu_item_hover_text_color'] ) ? $attributes['submenu_item_hover_text_color'] : $submenu_defaults['item_hover_text_color'] )
		);

		return $style_parts;
	}
}
