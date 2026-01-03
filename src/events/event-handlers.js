/**
 * Event handling utilities for PriorityNav
 */

/**
 * Set up all event listeners
 * @param {Object} elements  - DOM elements
 * @param {Object} instance  - PriorityNav instance
 * @param {Object} callbacks - Callback functions
 * @return {Object} Object containing all handler functions for cleanup
 */
export function setupEventListeners(elements, instance, callbacks) {
	const { moreButton, moreContainer, dropdown } = elements;
	const {
		toggleDropdown,
		closeDropdown,
		closeAllAccordions,
		toggleAccordionItem,
	} = callbacks;

	// More button click handler
	const moreButtonClickHandler = (e) => {
		e.preventDefault();
		e.stopPropagation();
		toggleDropdown();
	};
	moreButton.addEventListener('click', moreButtonClickHandler);

	// Document click handler - close dropdown when clicking outside
	const documentClickHandler = (e) => {
		if (
			moreContainer &&
			!moreContainer.contains(e.target) &&
			instance.isOpen
		) {
			closeDropdown();
		}
	};
	document.addEventListener('click', documentClickHandler, true);

	// Document keydown handler - close on Escape
	const documentKeydownHandler = (e) => {
		if (e.key === 'Escape' && instance.isOpen) {
			// If accordions are open, close them first, otherwise close dropdown
			if (instance.openAccordions.length > 0) {
				closeAllAccordions();
				e.preventDefault();
			} else {
				closeDropdown();
			}
		}
	};
	document.addEventListener('keydown', documentKeydownHandler);

	// Event delegation for accordion toggles
	const dropdownClickHandler = (e) => {
		const toggle = e.target.closest(
			'.priority-plus-navigation-accordion-toggle'
		);
		if (toggle) {
			e.preventDefault();
			e.stopPropagation();
			const submenuId = toggle.getAttribute('aria-controls');
			// Use scoped lookup within this instance's dropdown to avoid cross-instance collisions
			const submenu = dropdown.querySelector(`#${submenuId}`);
			if (submenu) {
				toggleAccordionItem(toggle, submenu, instance);
			}
		}
	};
	dropdown.addEventListener('click', dropdownClickHandler);

	// Return handlers for cleanup
	return {
		moreButtonClickHandler,
		documentClickHandler,
		documentKeydownHandler,
		dropdownClickHandler,
	};
}
