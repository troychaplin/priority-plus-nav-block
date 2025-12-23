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
		$more_label = $this->get_priority_attr( $block, 'priorityNavMoreLabel', 'Browse' );
		$more_icon  = $this->get_priority_attr( $block, 'priorityNavMoreIcon', 'none' );

		// Inject data attributes into the navigation element.
		return $this->inject_priority_attributes( $block_content, $more_label, $more_icon );
	}

	/**
	 * Check if Priority+ Navigation is enabled for this block.
	 *
	 * @param array $block The full block array.
	 * @return bool True if Priority+ is enabled.
	 */
	private function is_priority_nav_enabled( array $block ): bool {
		$attrs = $block['attrs'] ?? array();

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
	 * @param array  $block     The full block array.
	 * @param string $attr_name The attribute name to retrieve.
	 * @param string $default   The default value if attribute is missing or empty.
	 * @return string The attribute value or default.
	 */
	private function get_priority_attr( array $block, string $attr_name, string $default ): string {
		$attrs = $block['attrs'] ?? array();
		$value = $attrs[ $attr_name ] ?? '';

		return ( '' !== $value ) ? $value : $default;
	}

	/**
	 * Inject Priority+ data attributes into the navigation element.
	 *
	 * @param string $block_content The block HTML content.
	 * @param string $more_label    The "more" button label.
	 * @param string $more_icon     The "more" button icon.
	 * @return string Modified block content with data attributes.
	 */
	private function inject_priority_attributes( string $block_content, string $more_label, string $more_icon ): string {
		if ( '' === $block_content ) {
			return $block_content;
		}

		// Match the opening <nav> tag with wp-block-navigation class.
		$pattern     = '/(<nav[^>]*\bclass="[^"]*wp-block-navigation[^"]*")/i';
		$replacement = sprintf(
			'$1 data-more-label="%s" data-more-icon="%s"',
			esc_attr( $more_label ),
			esc_attr( $more_icon )
		);

		return preg_replace( $pattern, $replacement, $block_content, 1 );
	}
}
