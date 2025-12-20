<?php
/**
 * Base class for plugin modules which can be initialized.
 *
 * @package PriorityPlusNav
 */

namespace PriorityPlusNav;

/**
 * Plugin module extended by other classes.
 */
abstract class Plugin_Module {
	/**
	 * Initialize the module.
	 */
	abstract public function init();
}
