<?php
/**
 * Plugin Name:       Priority+ Navigation
 * Plugin URI:        https://github.com/troychaplin/priority-plus-nav-block
 * Description:       A WordPress block plugin that adds Priority+ pattern functionality to core WordPress navigation block. It automatically moves navigation items that don't fit into a responsive "More" dropdown menu as the viewport narrows.
 * Version:           1.0.0
 * Requires at least: 6.0
 * Requires PHP:      7.4
 * Author:            Troy Chaplin
 * License:           GPLv2 or later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       priority-plus-nav
 *
 * @package PriorityPlusNav
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// Include our bundled autoload if not loaded globally.
if ( ! class_exists( PriorityPlusNav\Plugin_Paths::class ) && file_exists( __DIR__ . '/vendor/autoload.php' ) ) {
	require_once __DIR__ . '/vendor/autoload.php';
}

if ( ! class_exists( PriorityPlusNav\Plugin_Paths::class ) ) {
	wp_trigger_error( 'Multi Block Starter Plugin: Composer autoload file not found. Please run `composer install`.', E_USER_ERROR );
	return;
}

// Instantiate our modules.
$priority_plus_nav_modules = array(
	new PriorityPlusNav\Enqueues( __DIR__ . '/build' ),
);


foreach ( $priority_plus_nav_modules as $priority_plus_nav_module ) {
	if ( is_a( $priority_plus_nav_module, PriorityPlusNav\Plugin_Module::class ) ) {
		$priority_plus_nav_module->init();
	}
}
