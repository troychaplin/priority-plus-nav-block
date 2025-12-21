/* global ResizeObserver, requestAnimationFrame, MutationObserver, Node */

class PriorityNav {
	// Static counter for generating unique instance IDs
	static instanceCounter = 0;

	// Class constants
	static DEFAULT_MORE_LABEL = 'Browse';
	static DEFAULT_MORE_ICON = 'none';
	static DEFAULT_GAP = 8;
	static RETRY_INTERVAL = 100;
	static MAX_RETRY_ATTEMPTS = 20;

	constructor( element ) {
		// Generate unique instance ID for this PriorityNav instance
		this.instanceId = `priority-nav-${ PriorityNav.instanceCounter++ }`;

		// Support both wrapper mode and direct mode
		// Wrapper mode: element has [data-priority-nav] and contains .wp-block-navigation
		// Direct mode: element IS .wp-block-navigation with [data-priority-nav]
		if (
			element.classList.contains( 'wp-block-navigation' ) &&
			element.hasAttribute( 'data-priority-nav' )
		) {
			// Direct mode: element is the nav itself
			this.nav = element;
			this.wrapper = element; // Use nav as wrapper for compatibility
		} else {
			// Wrapper mode: look for nav inside
			this.wrapper = element;
			this.nav = element.querySelector( '.wp-block-navigation' );
		}

		if ( ! this.nav ) {
			return;
		}

		this.list = this.nav.querySelector( '.wp-block-navigation__container' );
		// Get attributes from nav element (works for both modes since we inject on nav)
		this.moreLabel =
			this.nav.getAttribute( 'data-more-label' ) ||
			PriorityNav.DEFAULT_MORE_LABEL;
		this.moreIcon =
			this.nav.getAttribute( 'data-more-icon' ) ||
			PriorityNav.DEFAULT_MORE_ICON;

		// Detect if navigation has openSubmenusOnClick setting
		this.openSubmenusOnClick = this.detectOpenSubmenusOnClick();

		// (Debug logging removed for production.)

		if ( ! this.list ) {
			return;
		}

		// Create More button and dropdown
		this.createMoreButton();

		this.items = Array.from( this.list.children );
		this.itemWidths = [];
		this.isOpen = false;
		this.isCalculating = false;
		this.openAccordions = [];
		this.submenuCounter = 0; // For generating unique IDs

		// Track responsive container for hamburger mode detection
		this.responsiveContainer = this.nav.querySelector(
			'.wp-block-navigation__responsive-container'
		);
		this.mutationObserver = null;
		this.retryTimeout = null;
		this.isEnabled = true; // Track if Priority Nav should be active
		this.moreButtonWidth = null; // Cache more button width

		this.init();
	}

	/**
	 * Detect if navigation has openSubmenusOnClick setting
	 * Checks attributes and classes on nav element and list items
	 * @return {boolean} True if submenus should open on click
	 */
	detectOpenSubmenusOnClick() {
		let openSubmenusOnClickAttr = null;

		// Check all data attributes on nav element
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
					openSubmenusOnClickAttr = attr.value;
					break;
				}
				// Also check for "opensubmenusonclick" variations
				if (
					name === 'data-opensubmenusonclick' ||
					name === 'data-open-submenus-on-click'
				) {
					openSubmenusOnClickAttr = attr.value;
					break;
				}
			}
		}

		// Check for class-based indicators on nav element
		if ( openSubmenusOnClickAttr === null ) {
			if (
				this.nav.classList.contains( 'open-on-click' ) ||
				this.nav.classList.contains( 'open-submenus-on-click' ) ||
				this.nav.classList.contains( 'has-open-submenus-on-click' )
			) {
				openSubmenusOnClickAttr = 'true';
			}
		}

		// Check list items for the class (WordPress might set it on individual items)
		if ( openSubmenusOnClickAttr === null && this.list ) {
			const firstItem = this.list.querySelector(
				'li.has-child, li.open-on-click'
			);
			if (
				firstItem &&
				( firstItem.classList.contains( 'open-on-click' ) ||
					firstItem.classList.contains( 'open-submenus-on-click' ) )
			) {
				openSubmenusOnClickAttr = 'true';
			}
		}

		// WordPress may use '1' for true, '0' for false, or boolean strings
		// Default to false if not found
		return (
			openSubmenusOnClickAttr === 'true' ||
			openSubmenusOnClickAttr === '1' ||
			openSubmenusOnClickAttr === ''
		);
	}

	/**
	 * Check if an element is visible and has dimensions
	 * @param {HTMLElement} element - Element to check
	 * @return {boolean} True if element is visible
	 */
	isElementVisible( element ) {
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
	getElementWidth( element ) {
		if ( ! this.isElementVisible( element ) ) {
			return 0;
		}
		return element.getBoundingClientRect().width;
	}

	createMoreButton() {
		// Create the more container
		this.moreContainer = document.createElement( 'div' );
		this.moreContainer.className = 'priority-nav-more';

		// Create button
		this.moreButton = document.createElement( 'button' );
		this.moreButton.type = 'button';
		this.moreButton.className =
			'priority-nav-more-button wp-block-navigation-item';
		this.moreButton.setAttribute( 'aria-expanded', 'false' );
		this.moreButton.setAttribute( 'aria-haspopup', 'true' );
		this.moreButton.setAttribute( 'aria-label', this.moreLabel );

		const iconMap = {
			chevron: '▼',
			plus: '+',
			menu: '≡',
		};

		// Build icon HTML only if icon exists in map
		const iconHTML = iconMap[ this.moreIcon ]
			? `<span class="priority-nav-icon">${ iconMap[ this.moreIcon ] }</span>`
			: '';

		this.moreButton.innerHTML = `
			<span class="wp-block-navigation-item__label">${ this.moreLabel }</span>
			${ iconHTML }
		`;

		// Create dropdown
		this.dropdown = document.createElement( 'ul' );
		this.dropdown.className =
			'priority-nav-dropdown wp-block-navigation__submenu-container';
		this.dropdown.setAttribute( 'role', 'menu' );

		this.moreContainer.appendChild( this.moreButton );
		this.moreContainer.appendChild( this.dropdown );

		// Insert after the navigation list
		this.list.parentNode.appendChild( this.moreContainer );
		this.moreContainer.style.display = 'none';
	}

	init() {
		// Guard against missing elements
		if ( ! this.wrapper || ! document.body.contains( this.wrapper ) ) {
			return;
		}

		this.setupEventListeners();
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
				if ( ! document.body.contains( this.wrapper ) ) {
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
			this.resizeObserver.observe( this.wrapper );
		}
	}

	/**
	 * Check if navigation is in hamburger/responsive mode
	 * Returns true if the menu container is hidden or in responsive overlay mode
	 * @return {boolean} True if in hamburger mode
	 */
	isInHamburgerMode() {
		// Check if responsive container exists and is hidden
		if (
			this.responsiveContainer &&
			( ! this.isElementVisible( this.responsiveContainer ) ||
				this.responsiveContainer.getAttribute( 'aria-hidden' ) ===
					'true' )
		) {
			return true;
		}

		// Check if the main list container is hidden (fallback detection)
		if ( this.list && ! this.isElementVisible( this.list ) ) {
			return true;
		}

		return false;
	}

	/**
	 * Check if the navigation list is measurable (visible and has dimensions)
	 * @return {boolean} True if measurable
	 */
	isMeasurable() {
		return this.isElementVisible( this.list );
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
		if ( ! this.isMeasurable() ) {
			// Schedule retry
			this.scheduleRetry();
			return;
		}

		// Cache widths if needed (or if they contain zeros from previous hidden state)
		const needsRecache =
			this.itemWidths.length === 0 ||
			this.itemWidths.some( ( width ) => width === 0 );

		if ( needsRecache ) {
			this.cacheItemWidths();
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
	scheduleRetry( maxAttempts = PriorityNav.MAX_RETRY_ATTEMPTS ) {
		if ( this.retryTimeout ) {
			clearTimeout( this.retryTimeout );
		}

		let attempts = 0;
		const tryEnable = () => {
			attempts++;

			if ( this.isMeasurable() && ! this.isInHamburgerMode() ) {
				this.enablePriorityNav();
				this.retryTimeout = null;
			} else if ( attempts < maxAttempts ) {
				this.retryTimeout = setTimeout(
					tryEnable,
					PriorityNav.RETRY_INTERVAL
				);
			} else {
				// Give up after max attempts
				this.retryTimeout = null;
			}
		};

		this.retryTimeout = setTimeout( tryEnable, PriorityNav.RETRY_INTERVAL );
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
	 * Check if item widths cache is valid
	 * @return {boolean} True if cache is valid
	 */
	hasValidWidthCache() {
		return (
			this.itemWidths.length === this.items.length &&
			! this.itemWidths.some( ( width ) => width === 0 )
		);
	}

	/**
	 * Cache the widths of all navigation items
	 * Only measures if element is visible and cache is invalid
	 */
	cacheItemWidths() {
		// Only cache if measurable
		if ( ! this.isMeasurable() ) {
			return;
		}

		// Show all items for accurate measurement
		this.items.forEach( ( item ) => {
			item.style.display = '';
		} );

		// Force a reflow to ensure accurate measurements
		void this.list.offsetHeight;

		// Measure all items
		this.itemWidths = this.items.map( ( item ) => {
			const width = this.getElementWidth( item );
			return width > 0 ? width : 0;
		} );

		// If we got zero widths, schedule a retry (but don't retry indefinitely)
		if ( this.itemWidths.some( ( width ) => width === 0 ) ) {
			this.scheduleRetry();
		}
	}

	/**
	 * Cache the more button width if not already cached
	 * @return {number} Width of more button in pixels
	 */
	cacheMoreButtonWidth() {
		if ( this.moreButtonWidth !== null ) {
			return this.moreButtonWidth;
		}

		// Temporarily show more button to measure it
		const wasHidden = this.moreContainer.style.display === 'none';
		if ( wasHidden ) {
			this.moreContainer.style.display = '';
		}

		// Force a reflow for accurate measurement
		void this.moreButton.offsetHeight;
		this.moreButtonWidth = this.getElementWidth( this.moreButton );

		// Restore previous state
		if ( wasHidden ) {
			this.moreContainer.style.display = 'none';
		}

		return this.moreButtonWidth;
	}

	setupEventListeners() {
		// More button click handler
		this.moreButtonClickHandler = ( e ) => {
			e.preventDefault();
			e.stopPropagation();
			this.toggleDropdown();
		};
		this.moreButton.addEventListener(
			'click',
			this.moreButtonClickHandler
		);

		// Document click handler - close dropdown when clicking outside
		this.documentClickHandler = ( e ) => {
			if (
				this.moreContainer &&
				! this.moreContainer.contains( e.target ) &&
				this.isOpen
			) {
				this.closeDropdown();
			}
		};
		document.addEventListener( 'click', this.documentClickHandler, true );

		// Document keydown handler - close on Escape
		this.documentKeydownHandler = ( e ) => {
			if ( e.key === 'Escape' && this.isOpen ) {
				// If accordions are open, close them first, otherwise close dropdown
				if ( this.openAccordions.length > 0 ) {
					this.closeAllAccordions();
					e.preventDefault();
				} else {
					this.closeDropdown();
				}
			}
		};
		document.addEventListener( 'keydown', this.documentKeydownHandler );

		// Event delegation for accordion toggles
		this.dropdownClickHandler = ( e ) => {
			const toggle = e.target.closest( '.priority-nav-accordion-toggle' );
			if ( toggle ) {
				e.preventDefault();
				e.stopPropagation();
				const submenuId = toggle.getAttribute( 'aria-controls' );
				// Use scoped lookup within this instance's dropdown to avoid cross-instance collisions
				const submenu = this.dropdown.querySelector(
					`#${ submenuId }`
				);
				if ( submenu ) {
					this.toggleAccordionItem( toggle, submenu );
				}
			}
		};
		this.dropdown.addEventListener( 'click', this.dropdownClickHandler );
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

		// Use nav width if available, otherwise fall back to wrapper
		const containerWidth =
			navRect.width > 0
				? navRect.width
				: this.getElementWidth( this.wrapper );

		return containerWidth > 0 ? containerWidth - padding : 0;
	}

	/**
	 * Get gap value from list or nav styles
	 * @return {number} Gap in pixels
	 */
	getGap() {
		const listStyles = window.getComputedStyle( this.list );
		const navStyles = window.getComputedStyle( this.nav );
		return (
			parseFloat( listStyles.gap ) ||
			parseFloat( navStyles.gap ) ||
			PriorityNav.DEFAULT_GAP
		);
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

	/**
	 * Build dropdown from overflow items
	 * @param {number} visibleCount - Number of visible items
	 */
	buildDropdownFromOverflow( visibleCount ) {
		this.dropdown.innerHTML = '';
		this.submenuCounter = 0; // Reset counter

		for ( let i = visibleCount; i < this.items.length; i++ ) {
			// Extract data from the item
			const itemData = this.extractNavItemData( this.items[ i ] );

			// Build fresh accordion HTML
			const accordionHTML = this.buildAccordionHTML( itemData, 0 );

			// Create container and insert HTML
			const container = document.createElement( 'li' );
			container.innerHTML = accordionHTML;

			this.dropdown.appendChild( container );
		}
	}

	checkOverflow() {
		// Don't run if disabled (hamburger mode) or not measurable
		if ( ! this.isEnabled || ! this.isMeasurable() ) {
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
		if ( ! this.hasValidWidthCache() ) {
			this.cacheItemWidths();
			// If still invalid, abort
			if ( ! this.hasValidWidthCache() ) {
				this.isCalculating = false;
				return;
			}
		}

		// Get measurements
		const availableWidth = this.calculateAvailableWidth();
		const moreButtonWidth = this.cacheMoreButtonWidth();

		// Handle edge case where more button is larger than available width
		if ( moreButtonWidth >= availableWidth ) {
			this.items.forEach( ( item ) => ( item.style.display = 'none' ) );
			this.moreContainer.style.display = '';
			this.isCalculating = false;
			return;
		}

		// Get gap after early return check
		const gap = this.getGap();

		// Calculate visible items
		const visibleCount = this.calculateVisibleItems(
			availableWidth,
			moreButtonWidth,
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
			this.buildDropdownFromOverflow( visibleCount );

			// Show more button AFTER items are hidden and layout has reflowed
			this.moreContainer.style.display = '';
		}

		this.isCalculating = false;
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
	 * Extract text content from a link element
	 * @param {HTMLElement} linkElement - Link element to extract text from
	 * @return {string} Extracted text
	 */
	extractLinkText( linkElement ) {
		if ( ! linkElement ) {
			return '';
		}

		// Get the label element if it exists (WordPress navigation uses this)
		const label = linkElement.querySelector(
			'.wp-block-navigation-item__label'
		);
		if ( label ) {
			return label.textContent.trim();
		}

		// No label - extract only direct text nodes, not from nested elements
		// Clone link and remove all child elements to get only text
		const linkClone = linkElement.cloneNode( true );
		const allChildren = linkClone.querySelectorAll( '*' );
		allChildren.forEach( ( child ) => child.remove() );
		let text = linkClone.textContent.trim();

		// If that didn't work, try getting first text node only
		if ( ! text ) {
			const textNodes = Array.from( linkElement.childNodes ).filter(
				( node ) => node.nodeType === Node.TEXT_NODE
			);
			if ( textNodes.length > 0 ) {
				text = textNodes
					.map( ( node ) => node.textContent.trim() )
					.filter( ( t ) => t )
					.join( ' ' );
			}
		}

		return text;
	}

	/**
	 * Remove child text from parent text to avoid contamination
	 * @param {string}      parentText       - Parent item text
	 * @param {HTMLElement} submenuContainer - Submenu container element
	 * @return {string} Cleaned parent text
	 */
	removeChildTextFromParent( parentText, submenuContainer ) {
		if ( ! parentText || ! submenuContainer ) {
			return parentText;
		}

		const childTexts = [];
		submenuContainer.querySelectorAll( 'li a' ).forEach( ( childLink ) => {
			const childText = childLink.textContent.trim();
			if ( childText && parentText.includes( childText ) ) {
				childTexts.push( childText );
			}
		} );

		// Remove child texts from parent text if they're found
		if ( childTexts.length > 0 ) {
			let cleanedText = parentText;
			childTexts.forEach( ( childText ) => {
				cleanedText = cleanedText.replace( childText, '' ).trim();
			} );
			return cleanedText;
		}

		return parentText;
	}

	/**
	 * Extract data from a navigation list item
	 * @param {HTMLElement} item - Navigation list item element
	 * @return {Object} Extracted navigation item data
	 */
	extractNavItemData( item ) {
		const data = {
			text: '',
			url: '#',
			hasSubmenu: false,
			children: [],
		};

		// Check for submenu FIRST - if it exists, we need to get text differently
		const submenuContainer = item.querySelector(
			':scope > .wp-block-navigation__submenu-container'
		);

		// Find the link element
		let linkElement = item.querySelector( ':scope > a' );
		if ( ! linkElement ) {
			linkElement = item.querySelector(
				':scope > .wp-block-navigation-item__content a'
			);
		}

		if ( ! linkElement ) {
			// Fallback: try to get text from item directly, but exclude submenu text
			if ( submenuContainer ) {
				// Clone item, remove submenu, then get text
				const clone = item.cloneNode( true );
				const cloneSubmenu = clone.querySelector(
					'.wp-block-navigation__submenu-container'
				);
				if ( cloneSubmenu ) {
					cloneSubmenu.remove();
				}
				data.text = clone.textContent.trim();
			} else {
				data.text = item.textContent.trim();
			}

			if ( submenuContainer ) {
				data.hasSubmenu = true;
				const childItems =
					submenuContainer.querySelectorAll( ':scope > li' );
				childItems.forEach( ( childItem ) => {
					data.children.push( this.extractNavItemData( childItem ) );
				} );
			}

			return data;
		}

		// Extract text from link
		data.text = this.extractLinkText( linkElement );

		// Ensure we don't have submenu text mixed in (safety check)
		if ( submenuContainer && data.text ) {
			data.text = this.removeChildTextFromParent(
				data.text,
				submenuContainer
			);
		}

		data.url = linkElement.getAttribute( 'href' ) || '#';

		// Extract children if submenu exists
		if ( submenuContainer ) {
			data.hasSubmenu = true;

			// Extract children recursively
			const childItems =
				submenuContainer.querySelectorAll( ':scope > li' );
			childItems.forEach( ( childItem ) => {
				data.children.push( this.extractNavItemData( childItem ) );
			} );
		}

		return data;
	}

	buildAccordionHTML( data, level ) {
		const submenuId = `${ this.instanceId }-submenu-${ this
			.submenuCounter++ }`;
		let html = '';

		if ( data.hasSubmenu ) {
			// Item has children - build accordion
			if ( this.openSubmenusOnClick ) {
				// Click mode: entire item is clickable
				html = `
					<button type="button" class="priority-nav-accordion-toggle priority-nav-accordion-toggle-full" 
					        aria-expanded="false" aria-controls="${ submenuId }">
						<span class="priority-nav-accordion-text">${ this.escapeHtml(
							data.text
						) }</span>
						<span class="priority-nav-accordion-arrow" aria-hidden="true">›</span>
					</button>
					<ul class="priority-nav-accordion-content" id="${ submenuId }" aria-hidden="true">
				`;
			} else {
				// Arrow mode: link stays functional, separate arrow button
				html = `
					<span class="priority-nav-accordion-wrapper">
						<a href="${ this.escapeHtml(
							data.url
						) }" class="priority-nav-accordion-link">${ this.escapeHtml(
							data.text
						) }</a>
						<button type="button" class="priority-nav-accordion-toggle priority-nav-accordion-toggle-arrow" 
						        aria-expanded="false" aria-controls="${ submenuId }" aria-label="Toggle submenu">
							<span class="priority-nav-accordion-arrow" aria-hidden="true">›</span>
						</button>
					</span>
					<ul class="priority-nav-accordion-content" id="${ submenuId }" aria-hidden="true">
				`;
			}

			// Build children
			data.children.forEach( ( child ) => {
				html += `<li>${ this.buildAccordionHTML(
					child,
					level + 1
				) }</li>`;
			} );

			html += '</ul>';
		} else {
			// No submenu - just a link
			html = `<a href="${ this.escapeHtml(
				data.url
			) }">${ this.escapeHtml( data.text ) }</a>`;
		}

		return html;
	}

	escapeHtml( text ) {
		const div = document.createElement( 'div' );
		div.textContent = text;
		return div.innerHTML;
	}

	toggleAccordionItem( button, submenu ) {
		const isExpanded = button.getAttribute( 'aria-expanded' ) === 'true';

		if ( isExpanded ) {
			// Close this accordion
			button.setAttribute( 'aria-expanded', 'false' );
			submenu.style.setProperty( 'display', 'none', 'important' );
			submenu.classList.remove( 'is-open' );
			submenu.setAttribute( 'aria-hidden', 'true' );

			// Remove from open accordions array
			this.openAccordions = this.openAccordions.filter(
				( item ) => item.button !== button
			);

			// Close any nested accordions
			const nestedAccordions = submenu.querySelectorAll(
				'.priority-nav-accordion-toggle[aria-expanded="true"]'
			);
			nestedAccordions.forEach( ( nestedButton ) => {
				const nestedSubmenuId =
					nestedButton.getAttribute( 'aria-controls' );
				// Use scoped lookup within this instance's dropdown to avoid cross-instance collisions
				const nestedSubmenu = this.dropdown.querySelector(
					`#${ nestedSubmenuId }`
				);
				if ( nestedSubmenu ) {
					nestedButton.setAttribute( 'aria-expanded', 'false' );
					nestedSubmenu.style.setProperty(
						'display',
						'none',
						'important'
					);
					nestedSubmenu.classList.remove( 'is-open' );
					nestedSubmenu.setAttribute( 'aria-hidden', 'true' );
				}
			} );
		} else {
			// Open this accordion
			button.setAttribute( 'aria-expanded', 'true' );
			// Force display block with !important via style
			submenu.style.setProperty( 'display', 'block', 'important' );
			submenu.style.setProperty( 'opacity', '1', 'important' );
			submenu.style.setProperty( 'visibility', 'visible', 'important' );
			submenu.style.setProperty( 'position', 'static', 'important' );
			submenu.classList.add( 'is-open' );
			submenu.setAttribute( 'aria-hidden', 'false' );

			// Add to open accordions array
			this.openAccordions.push( { button, submenu } );
		}
	}

	closeAllAccordions() {
		this.openAccordions.forEach( ( { button, submenu } ) => {
			button.setAttribute( 'aria-expanded', 'false' );
			submenu.style.setProperty( 'display', 'none', 'important' );
			submenu.classList.remove( 'is-open' );
			submenu.setAttribute( 'aria-hidden', 'true' );
		} );
		this.openAccordions = [];
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
		if ( this.moreButton && this.moreButtonClickHandler ) {
			this.moreButton.removeEventListener(
				'click',
				this.moreButtonClickHandler
			);
		}

		if ( this.documentClickHandler ) {
			document.removeEventListener(
				'click',
				this.documentClickHandler,
				true
			);
		}

		if ( this.documentKeydownHandler ) {
			document.removeEventListener(
				'keydown',
				this.documentKeydownHandler
			);
		}

		if ( this.dropdown && this.dropdownClickHandler ) {
			this.dropdown.removeEventListener(
				'click',
				this.dropdownClickHandler
			);
		}
	}
}

// Initialize on DOM ready
document.addEventListener( 'DOMContentLoaded', () => {
	// Support both wrapper mode and direct mode
	// Wrapper mode: [data-priority-nav] containing .wp-block-navigation
	// Direct mode: .wp-block-navigation[data-priority-nav]
	const wrapperElements = document.querySelectorAll(
		'[data-priority-nav]:not(.wp-block-navigation)'
	);
	const directNavElements = document.querySelectorAll(
		'.wp-block-navigation[data-priority-nav]'
	);

	// Initialize wrapper mode (backward compatibility)
	wrapperElements.forEach( ( element ) => new PriorityNav( element ) );

	// Initialize direct mode (new variation approach)
	directNavElements.forEach( ( element ) => new PriorityNav( element ) );
} );
