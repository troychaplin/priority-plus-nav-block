/* global ResizeObserver, requestAnimationFrame, MutationObserver */

/**
 * Internal dependencies
 */
import { DEFAULT_MORE_LABEL, DEFAULT_MORE_ICON } from '../utils/constants.js';
import { isMeasurable, isInHamburgerMode } from '../utils/dom-utils.js';
import { setupEventListeners } from '../events/event-handlers.js';
import {
	createMoreButton,
	buildDropdownFromOverflow,
} from '../dom/dom-builder.js';
import {
	toggleAccordionItem,
	closeAllAccordions,
} from '../events/accordion-handler.js';
import {
	hasValidWidthCache,
	cacheItemWidths,
	cacheMoreButtonWidth,
	getGap,
} from '../layout/width-calculator.js';

class PriorityNav {
	// Static counter for generating unique instance IDs
	static instanceCounter = 0;

	constructor( element ) {
		// Prevent double initialization
		if ( element.dataset.priorityNavInitialized === 'true' ) {
			return;
		}

		// Generate unique instance ID for this PriorityNav instance
		this.instanceId = `priority-nav-${ PriorityNav.instanceCounter++ }`;

		// Element should be .wp-block-navigation.is-style-priority-nav
		if (
			! element.classList.contains( 'wp-block-navigation' ) ||
			! element.classList.contains( 'is-style-priority-nav' )
		) {
			return;
		}

		// Mark as initialized to prevent double initialization
		element.dataset.priorityNavInitialized = 'true';

		this.nav = element;

		// Get list container
		this.list = this.nav.querySelector( '.wp-block-navigation__container' );
		if ( ! this.list ) {
			return;
		}

		// Get attributes from nav element
		this.moreLabel =
			this.nav.getAttribute( 'data-more-label' ) || DEFAULT_MORE_LABEL;
		this.moreIcon =
			this.nav.getAttribute( 'data-more-icon' ) || DEFAULT_MORE_ICON;

		// Detect if navigation has openSubmenusOnClick setting
		this.openSubmenusOnClick = this.detectOpenSubmenusOnClick();

		// Create More button and dropdown
		const { moreContainer, moreButton, dropdown } = createMoreButton(
			this.list,
			this.moreLabel,
			this.moreIcon
		);
		this.moreContainer = moreContainer;
		this.moreButton = moreButton;
		this.dropdown = dropdown;

		// Initialize state
		this.items = Array.from( this.list.children );
		this.itemWidths = [];
		this.isOpen = false;
		this.isCalculating = false;
		this.openAccordions = [];
		this.submenuCounter = { value: 0 }; // For generating unique IDs (object for mutation)

		// Track responsive container for hamburger mode detection
		this.responsiveContainer = this.nav.querySelector(
			'.wp-block-navigation__responsive-container'
		);
		this.mutationObserver = null;
		this.retryTimeout = null;
		this.isEnabled = true; // Track if Priority Nav should be active
		this.moreButtonWidth = null; // Cache more button width

		// Store event handlers for cleanup
		this.eventHandlers = null;

		this.init();
	}

	/**
	 * Detect if navigation has openSubmenusOnClick setting
	 * Checks attributes and classes on nav element and list items
	 * @return {boolean} True if submenus should open on click
	 */
	detectOpenSubmenusOnClick() {
		// Check data attributes on nav element
		const dataAttr =
			this.nav.getAttribute( 'data-opensubmenusonclick' ) ||
			this.nav.getAttribute( 'data-open-submenus-on-click' );

		if ( dataAttr ) {
			return dataAttr === 'true' || dataAttr === '1' || dataAttr === '';
		}

		// Check for generic data attributes containing the keywords
		if ( this.nav.attributes ) {
			for ( let i = 0; i < this.nav.attributes.length; i++ ) {
				const attr = this.nav.attributes[ i ];
				const name = attr.name.toLowerCase();
				// WordPress may use various formats
				if (
					name.includes( 'open' ) &&
					name.includes( 'submenu' ) &&
					name.includes( 'click' )
				) {
					const value = attr.value;
					return value === 'true' || value === '1' || value === '';
				}
			}
		}

		// Check for class-based indicators on nav element
		if (
			this.nav.classList.contains( 'open-on-click' ) ||
			this.nav.classList.contains( 'open-submenus-on-click' ) ||
			this.nav.classList.contains( 'has-open-submenus-on-click' )
		) {
			return true;
		}

		// Check list items for the class (WordPress might set it on individual items)
		if ( this.list ) {
			const firstItem = this.list.querySelector(
				'li.has-child, li.open-on-click'
			);
			if (
				firstItem &&
				( firstItem.classList.contains( 'open-on-click' ) ||
					firstItem.classList.contains( 'open-submenus-on-click' ) )
			) {
				return true;
			}
		}

		// Default to false if not found
		return false;
	}

	init() {
		// Guard against missing elements
		if ( ! this.nav || ! document.body.contains( this.nav ) ) {
			return;
		}

		// Set up event listeners
		this.eventHandlers = setupEventListeners(
			{
				moreButton: this.moreButton,
				moreContainer: this.moreContainer,
				dropdown: this.dropdown,
			},
			this,
			{
				toggleDropdown: () => this.toggleDropdown(),
				closeDropdown: () => this.closeDropdown(),
				closeAllAccordions: () => this.closeAllAccordions(),
				toggleAccordionItem: ( button, submenu ) =>
					this.toggleAccordionItem( button, submenu ),
			}
		);

		this.setupResponsiveObserver();

		// Check if we should enable Priority Nav
		if ( this.isInHamburgerMode() ) {
			this.disablePriorityNav();
		} else {
			this.enablePriorityNav();
		}

		// Set up resize observer with error handling
		if ( typeof ResizeObserver !== 'undefined' ) {
			this.resizeObserver = new ResizeObserver( () => {
				// Guard against detached elements
				if ( ! document.body.contains( this.nav ) ) {
					return;
				}

				if ( ! this.isCalculating ) {
					// Check if we've transitioned between hamburger and desktop mode
					const wasEnabled = this.isEnabled;
					const inHamburger = this.isInHamburgerMode();

					if ( inHamburger && wasEnabled ) {
						this.disablePriorityNav();
					} else if ( ! inHamburger && ! wasEnabled ) {
						this.enablePriorityNav();
					} else if ( ! inHamburger && wasEnabled ) {
						// Still in desktop mode, just recalculate
						requestAnimationFrame( () => this.checkOverflow() );
					}
				}
			} );
			this.resizeObserver.observe( this.nav );
		}
	}

	/**
	 * Check if navigation is in hamburger/responsive mode
	 * @return {boolean} True if in hamburger mode
	 */
	isInHamburgerMode() {
		return isInHamburgerMode( this.responsiveContainer, this.list );
	}

	/**
	 * Disable Priority Nav when in hamburger mode
	 */
	disablePriorityNav() {
		if ( ! this.items || ! Array.isArray( this.items ) ) {
			return;
		}

		this.isEnabled = false;

		// Show all items
		this.items.forEach( ( item ) => {
			if ( item && item.style ) {
				item.style.display = '';
			}
		} );

		// Hide the More button
		if ( this.moreContainer && this.moreContainer.style ) {
			this.moreContainer.style.display = 'none';
		}

		// Close dropdown if open
		this.closeDropdown();
	}

	/**
	 * Enable Priority Nav and recalculate
	 */
	enablePriorityNav() {
		this.isEnabled = true;

		// Only proceed if measurable
		if ( ! isMeasurable( this.list ) ) {
			// Schedule retry
			this.scheduleRetry();
			return;
		}

		// Cache widths if needed (or if they contain zeros from previous hidden state)
		const needsRecache =
			this.itemWidths.length === 0 ||
			this.itemWidths.some( ( width ) => width === 0 );

		if ( needsRecache ) {
			this.itemWidths = cacheItemWidths( this.list, this.items, () =>
				this.scheduleRetry()
			);
		}

		// Recalculate overflow
		requestAnimationFrame( () => {
			this.checkOverflow();
		} );
	}

	/**
	 * Schedule a retry when menu becomes visible
	 * @param {number} maxAttempts - Maximum number of retry attempts
	 */
	scheduleRetry( maxAttempts = 20 ) {
		if ( this.retryTimeout ) {
			clearTimeout( this.retryTimeout );
		}

		let attempts = 0;
		const tryEnable = () => {
			attempts++;

			if ( isMeasurable( this.list ) && ! this.isInHamburgerMode() ) {
				this.enablePriorityNav();
				this.retryTimeout = null;
			} else if ( attempts < maxAttempts ) {
				this.retryTimeout = setTimeout( tryEnable, 100 );
			} else {
				// Give up after max attempts
				this.retryTimeout = null;
			}
		};

		this.retryTimeout = setTimeout( tryEnable, 100 );
	}

	/**
	 * Set up observer for responsive container changes
	 */
	setupResponsiveObserver() {
		if ( typeof MutationObserver === 'undefined' ) {
			return;
		}

		if ( ! this.responsiveContainer ) {
			return;
		}

		// Watch for attribute and class changes on responsive container
		this.mutationObserver = new MutationObserver( ( mutations ) => {
			// Guard against detached elements
			if ( ! document.body.contains( this.nav ) ) {
				return;
			}

			let shouldCheck = false;

			mutations.forEach( ( mutation ) => {
				if (
					mutation.type === 'attributes' &&
					( mutation.attributeName === 'aria-hidden' ||
						mutation.attributeName === 'class' )
				) {
					shouldCheck = true;
				}
			} );

			if ( shouldCheck ) {
				const inHamburger = this.isInHamburgerMode();

				if ( inHamburger && this.isEnabled ) {
					this.disablePriorityNav();
				} else if ( ! inHamburger && ! this.isEnabled ) {
					this.enablePriorityNav();
				}
			}
		} );

		this.mutationObserver.observe( this.responsiveContainer, {
			attributes: true,
			attributeFilter: [ 'aria-hidden', 'class' ],
		} );

		// Also observe the list container for visibility changes
		if ( this.list && document.body.contains( this.list ) ) {
			this.mutationObserver.observe( this.list, {
				attributes: true,
				attributeFilter: [ 'style', 'class' ],
				attributeOldValue: false,
			} );
		}
	}

	/**
	 * Check overflow and update display
	 */
	checkOverflow() {
		// Don't run if disabled (hamburger mode) or not measurable
		if ( ! this.isEnabled || ! isMeasurable( this.list ) ) {
			this.isCalculating = false;
			return;
		}

		// Guard against detached DOM elements
		if ( ! document.body.contains( this.nav ) ) {
			this.isCalculating = false;
			return;
		}

		this.isCalculating = true;

		// Ensure we have valid item widths
		if ( ! hasValidWidthCache( this.itemWidths, this.items.length ) ) {
			this.itemWidths = cacheItemWidths( this.list, this.items, () =>
				this.scheduleRetry()
			);
			// If still invalid, abort
			if ( ! hasValidWidthCache( this.itemWidths, this.items.length ) ) {
				this.isCalculating = false;
				return;
			}
		}

		// Get measurements
		const availableWidth = this.calculateAvailableWidth();
		this.moreButtonWidth = cacheMoreButtonWidth(
			this.moreButton,
			this.moreContainer,
			this.moreButtonWidth
		);

		// Handle edge case where more button is larger than available width
		if ( this.moreButtonWidth >= availableWidth ) {
			this.items.forEach( ( item ) => ( item.style.display = 'none' ) );
			this.moreContainer.style.display = '';
			this.isCalculating = false;
			return;
		}

		// Get gap after early return check
		const gap = getGap( this.list, this.nav );

		// Calculate visible items
		const visibleCount = this.calculateVisibleItems(
			availableWidth,
			this.moreButtonWidth,
			gap
		);

		// Update display
		if ( visibleCount === this.items.length ) {
			// All items fit
			this.items.forEach( ( item ) => ( item.style.display = '' ) );
			this.moreContainer.style.display = 'none';
			this.closeDropdown();
		} else {
			// Ensure more button is hidden during DOM manipulation
			this.moreContainer.style.display = 'none';

			// Hide overflow items FIRST to prevent button from wrapping
			for ( let i = visibleCount; i < this.items.length; i++ ) {
				this.items[ i ].style.display = 'none';
			}

			// Show visible items
			for ( let i = 0; i < visibleCount; i++ ) {
				this.items[ i ].style.display = '';
			}

			// Force a reflow to ensure layout updates before showing button
			// Reading offsetHeight forces the browser to recalculate layout
			void this.list.offsetHeight;

			// Build dropdown from overflow (items already hidden and layout updated)
			buildDropdownFromOverflow(
				this.dropdown,
				this.items,
				visibleCount,
				this.instanceId,
				this.submenuCounter,
				this.openSubmenusOnClick
			);

			// Show more button AFTER items are hidden and layout has reflowed
			this.moreContainer.style.display = '';
		}

		this.isCalculating = false;
	}

	/**
	 * Calculate available width for navigation items
	 * @return {number} Available width in pixels
	 */
	calculateAvailableWidth() {
		// Get actual visible container width - prefer the nav element itself
		const navRect = this.nav.getBoundingClientRect();
		const navStyles = window.getComputedStyle( this.nav );
		const padding =
			parseFloat( navStyles.paddingLeft ) +
			parseFloat( navStyles.paddingRight );

		// Use nav width
		const containerWidth = navRect.width > 0 ? navRect.width : 0;

		return containerWidth > 0 ? containerWidth - padding : 0;
	}

	/**
	 * Calculate how many items can fit in available width
	 * @param {number} availableWidth  - Available width in pixels
	 * @param {number} moreButtonWidth - Width of more button in pixels
	 * @param {number} gap             - Gap between items in pixels
	 * @return {number} Number of visible items
	 */
	calculateVisibleItems( availableWidth, moreButtonWidth, gap ) {
		// Calculate total width needed for all items
		let totalWidth = 0;
		for ( let i = 0; i < this.items.length; i++ ) {
			const itemWidth = this.itemWidths[ i ];
			const gapWidth = i > 0 ? gap : 0;
			totalWidth += gapWidth + itemWidth;
		}

		// If everything fits, show all items
		if ( totalWidth <= availableWidth ) {
			return this.items.length;
		}

		// Calculate how many items fit with the More button visible
		let usedWidth = 0;
		let visibleCount = 0;

		for ( let i = 0; i < this.items.length; i++ ) {
			const itemWidth = this.itemWidths[ i ];
			const gapWidth = i > 0 ? gap : 0;
			const moreButtonGap = gap;
			const itemTotalWidth = gapWidth + itemWidth;

			// Check if this item + more button would fit
			const wouldFit =
				usedWidth + itemTotalWidth + moreButtonGap + moreButtonWidth <=
				availableWidth;

			// Always show at least one item
			if ( wouldFit || i === 0 ) {
				usedWidth += itemTotalWidth;
				visibleCount++;
			} else {
				break;
			}
		}

		return visibleCount;
	}

	toggleDropdown() {
		if ( this.isOpen ) {
			this.closeDropdown();
		} else {
			this.openDropdown();
		}
	}

	openDropdown() {
		if ( ! this.dropdown || ! this.moreButton ) {
			return;
		}

		this.isOpen = true;
		this.dropdown.classList.add( 'is-open' );
		this.moreButton.setAttribute( 'aria-expanded', 'true' );
	}

	closeDropdown() {
		if ( ! this.dropdown || ! this.moreButton ) {
			return;
		}

		this.isOpen = false;
		this.dropdown.classList.remove( 'is-open' );
		this.moreButton.setAttribute( 'aria-expanded', 'false' );
		// Close all open accordions
		this.closeAllAccordions();
	}

	/**
	 * Toggle an accordion item
	 * @param {HTMLElement} button  - Accordion toggle button
	 * @param {HTMLElement} submenu - Submenu element
	 */
	toggleAccordionItem( button, submenu ) {
		toggleAccordionItem( button, submenu, this, this.dropdown );
	}

	/**
	 * Close all open accordions
	 */
	closeAllAccordions() {
		closeAllAccordions( this );
	}

	/**
	 * Cleanup observers, timeouts, and event listeners
	 */
	destroy() {
		// Cleanup resize observer
		if ( this.resizeObserver ) {
			this.resizeObserver.disconnect();
			this.resizeObserver = null;
		}

		// Cleanup mutation observer
		if ( this.mutationObserver ) {
			this.mutationObserver.disconnect();
			this.mutationObserver = null;
		}

		// Cleanup retry timeout
		if ( this.retryTimeout ) {
			clearTimeout( this.retryTimeout );
			this.retryTimeout = null;
		}

		// Cleanup event listeners
		if ( this.eventHandlers ) {
			const {
				moreButtonClickHandler,
				documentClickHandler,
				documentKeydownHandler,
				dropdownClickHandler,
			} = this.eventHandlers;

			if ( this.moreButton && moreButtonClickHandler ) {
				this.moreButton.removeEventListener(
					'click',
					moreButtonClickHandler
				);
			}

			if ( documentClickHandler ) {
				document.removeEventListener(
					'click',
					documentClickHandler,
					true
				);
			}

			if ( documentKeydownHandler ) {
				document.removeEventListener(
					'keydown',
					documentKeydownHandler
				);
			}

			if ( this.dropdown && dropdownClickHandler ) {
				this.dropdown.removeEventListener(
					'click',
					dropdownClickHandler
				);
			}
		}
	}
}

export default PriorityNav;
