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
		$asset_meta = $this->build_dir->get_asset_meta( 'index.js' );

		if ( ! $asset_meta ) {
			return;
		}

		wp_enqueue_script(
			'priority-nav-editor',
			$this->build_dir->get_url( 'index.js' ),
			$asset_meta['dependencies'],
			$asset_meta['version'],
			true
		);
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

		$asset_meta = $this->build_dir->get_asset_meta( 'view.js' );
		if ( ! $asset_meta ) {
			return;
		}

		$this->frontend_assets_enqueued = true;

		wp_enqueue_script(
			'priority-nav-view',
			$this->build_dir->get_url( 'view.js' ),
			$asset_meta['dependencies'],
			$asset_meta['version'],
			true
		);

		$style_path = $this->build_dir->get_path( 'style-index.css' );
		if ( file_exists( $style_path ) ) {
			wp_enqueue_style(
				'priority-nav-style',
				$this->build_dir->get_url( 'style-index.css' ),
				array(),
				$asset_meta['version']
			);
		}
	}

	/**
	 * Filter block rendering to inject Priority+ data attributes and enqueue frontend assets when needed.
	 * Handles both core/navigation with Priority+ enabled and legacy wrapper blocks.
	 *
	 * @param string $block_content The block content.
	 * @param array  $block         The full block, including name and attributes.
	 * @return string Modified block content.
	 */
	public function render_block( string $block_content, array $block ): string {
		$block_name = isset( $block['blockName'] ) ? $block['blockName'] : '';

		// Handle core/navigation blocks with Priority+ enabled.
		if ( 'core/navigation' === $block_name ) {
			$priority_nav_enabled = isset( $block['attrs']['priorityNavEnabled'] ) && $block['attrs']['priorityNavEnabled'];

			if ( ! $priority_nav_enabled ) {
				return $block_content;
			}

		$this->enqueue_frontend_assets_once();

		$more_label = isset( $block['attrs']['priorityNavMoreLabel'] ) && '' !== $block['attrs']['priorityNavMoreLabel'] 
			? $block['attrs']['priorityNavMoreLabel'] 
			: 'Browse';
		$more_icon = isset( $block['attrs']['priorityNavMoreIcon'] ) && '' !== $block['attrs']['priorityNavMoreIcon'] 
			? $block['attrs']['priorityNavMoreIcon'] 
			: 'none';

			// Inject data attributes on the .wp-block-navigation element.
			if ( '' !== $block_content ) {
				$block_content = preg_replace(
					'/(<nav[^>]*class="[^"]*wp-block-navigation[^"]*")/i',
					'$1 data-priority-nav data-more-label="' . esc_attr( $more_label ) . '" data-more-icon="' . esc_attr( $more_icon ) . '"',
					$block_content,
					1
				);
			}

			return $block_content;
		}

		// Handle legacy wrapper blocks (frontend compatibility).
		if (
			'lumen/priority-nav' === $block_name ||
			( '' !== $block_content && false !== strpos( $block_content, 'data-priority-nav' ) )
		) {
			$this->enqueue_frontend_assets_once();
		}

		return $block_content;
	}
}
