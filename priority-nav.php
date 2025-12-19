<?php
/**
 * Plugin Name:       Priority+ Nav Block
 * Plugin URI:        https://github.com/troychaplin/priority-plus-nav-block
 * Description:       A responsive navigation block implementing the Priority+ pattern that automatically moves overflow items to a "More" dropdown.
 * Version:           0.1.0
 * Requires at least: 6.0
 * Requires PHP:      7.4
 * Author:            Troy Chaplin
 * License:           GPLv2 or later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       priority-plus-nav
 *
 * @package PriorityNav
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Registers the block using the metadata loaded from the `block.json` file.
 *
 * @see https://developer.wordpress.org/reference/functions/register_block_type/
 */
function priority_nav_block_init() {
	register_block_type( __DIR__ . '/build/' );
}
add_action( 'init', 'priority_nav_block_init' );
