/**
 * DOM utility functions for PriorityNav
 */

/**
 * Check if an element is visible and has dimensions
 * @param {HTMLElement} element - Element to check
 * @return {boolean} True if element is visible
 */
export function isElementVisible( element ) {
	if ( ! element ) {
		return false;
	}

	const styles = window.getComputedStyle( element );
	const rect = element.getBoundingClientRect();

	return (
		styles.display !== 'none' &&
		styles.visibility !== 'hidden' &&
		rect.width > 0 &&
		rect.height > 0
	);
}

/**
 * Get the visible width of an element
 * @param {HTMLElement} element - Element to measure
 * @return {number} Width in pixels, or 0 if not visible
 */
export function getElementWidth( element ) {
	if ( ! isElementVisible( element ) ) {
		return 0;
	}
	return element.getBoundingClientRect().width;
}

/**
 * Check if the navigation list is measurable (visible and has dimensions)
 * @param {HTMLElement} list - List element to check
 * @return {boolean} True if measurable
 */
export function isMeasurable( list ) {
	return isElementVisible( list );
}

/**
 * Check if navigation is in hamburger/responsive mode
 * Returns true if the responsive overlay container exists and is active
 * @param {HTMLElement} responsiveContainer - Responsive container element
 * @param {HTMLElement} list                - Navigation list container
 * @return {boolean} True if in hamburger mode
 */
export function isInHamburgerMode( responsiveContainer, list ) {
	// No responsive container means overlayMenu is 'never' - not in hamburger mode
	if ( ! responsiveContainer ) {
		return false;
	}

	// WordPress uses the 'is-menu-open' class to indicate when hamburger is active
	// Check for this class first
	const hasMenuOpenClass =
		responsiveContainer.classList.contains( 'is-menu-open' ) ||
		responsiveContainer.classList.contains( 'has-modal-open' );

	// Debug logging
	console.log( '[Priority+ Debug] Hamburger mode check:', {
		hasMenuOpenClass,
		classList: Array.from( responsiveContainer.classList ),
		ariaHidden: responsiveContainer.getAttribute( 'aria-hidden' ),
		computedDisplay: window.getComputedStyle( responsiveContainer ).display,
	} );

	if ( hasMenuOpenClass ) {
		console.log(
			'[Priority+ Debug] Hamburger mode ACTIVE (menu open) - Priority+ should be DISABLED'
		);
		return true;
	}

	// If no 'is-menu-open' class, we're in desktop mode (even if container exists)
	console.log(
		'[Priority+ Debug] Desktop mode (menu closed) - Priority+ should be ENABLED'
	);
	return false;
}
