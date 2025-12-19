class PriorityNav {
	constructor( element ) {
		this.wrapper = element;
		this.nav = element.querySelector( '.wp-block-navigation' );
		
		if ( ! this.nav ) {
			return;
		}
		
		this.list = this.nav.querySelector( '.wp-block-navigation__container' );
		this.moreLabel = element.getAttribute( 'data-more-label' ) || 'More';
		this.moreIcon = element.getAttribute( 'data-more-icon' ) || 'dots';
		
		// Check if navigation has openSubmenusOnClick setting
		// WordPress stores this as data attribute on the nav block
		// Check all possible attribute name formats
		let openSubmenusOnClickAttr = null;
		
		// Check all data attributes on nav element
		if ( this.nav.attributes ) {
			for ( let i = 0; i < this.nav.attributes.length; i++ ) {
				const attr = this.nav.attributes[ i ];
				const name = attr.name.toLowerCase();
				// WordPress may use various formats
				if ( name.includes( 'open' ) && name.includes( 'submenu' ) && name.includes( 'click' ) ) {
					openSubmenusOnClickAttr = attr.value;
					break;
				}
				// Also check for "opensubmenusonclick" variations
				if ( name === 'data-opensubmenusonclick' || name === 'data-open-submenus-on-click' ) {
					openSubmenusOnClickAttr = attr.value;
					break;
				}
			}
		}
		
		// Also check for class-based indicators
		// WordPress might use class names like "open-on-click" or "open-submenus-on-click"
		if ( openSubmenusOnClickAttr === null ) {
			if ( this.nav.classList.contains( 'open-on-click' ) || 
			     this.nav.classList.contains( 'open-submenus-on-click' ) ||
			     this.nav.classList.contains( 'has-open-submenus-on-click' ) ) {
				openSubmenusOnClickAttr = 'true';
			}
		}
		
		// Check list items for the class too (WordPress might set it on individual items)
		if ( openSubmenusOnClickAttr === null && this.list ) {
			const firstItem = this.list.querySelector( 'li.has-child, li.open-on-click' );
			if ( firstItem && ( firstItem.classList.contains( 'open-on-click' ) || 
			                    firstItem.classList.contains( 'open-submenus-on-click' ) ) ) {
				openSubmenusOnClickAttr = 'true';
			}
		}
		
		// WordPress may use '1' for true, '0' for false, or boolean strings
		// Default to false if not found
		this.openSubmenusOnClick = openSubmenusOnClickAttr === 'true' || 
		                           openSubmenusOnClickAttr === '1' || 
		                           openSubmenusOnClickAttr === '';
		
		// Debug log - log all nav attributes for debugging
		if ( typeof console !== 'undefined' && console.log ) {
			const allAttrs = {};
			if ( this.nav.attributes ) {
				for ( let i = 0; i < this.nav.attributes.length; i++ ) {
					const attr = this.nav.attributes[ i ];
					allAttrs[ attr.name ] = attr.value;
				}
			}
			console.log( 'Priority Nav - All nav attributes:', allAttrs );
			console.log( 'Priority Nav - openSubmenusOnClick:', this.openSubmenusOnClick, 'from attr:', openSubmenusOnClickAttr );
			console.log( 'Priority Nav - Nav classes:', Array.from( this.nav.classList ) );
		}
		
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

		this.init();
	}

	createMoreButton() {
		// Create the more container
		this.moreContainer = document.createElement( 'div' );
		this.moreContainer.className = 'priority-nav-more';
		
		// Create button
		this.moreButton = document.createElement( 'button' );
		this.moreButton.type = 'button';
		this.moreButton.className = 'priority-nav-more-button wp-block-navigation-item';
		this.moreButton.setAttribute( 'aria-expanded', 'false' );
		this.moreButton.setAttribute( 'aria-haspopup', 'true' );
		this.moreButton.setAttribute( 'aria-label', this.moreLabel );
		
		const iconMap = {
			dots: '•••',
			chevron: '▼',
			plus: '+',
			menu: '≡'
		};
		
		this.moreButton.innerHTML = `
			<span class="wp-block-navigation-item__label">${ this.moreLabel }</span>
			<span class="priority-nav-icon">${ iconMap[ this.moreIcon ] || iconMap.dots }</span>
		`;
		
		// Create dropdown
		this.dropdown = document.createElement( 'ul' );
		this.dropdown.className = 'priority-nav-dropdown wp-block-navigation__submenu-container';
		this.dropdown.setAttribute( 'role', 'menu' );
		
		this.moreContainer.appendChild( this.moreButton );
		this.moreContainer.appendChild( this.dropdown );
		
		// Insert after the navigation list
		this.list.parentNode.appendChild( this.moreContainer );
		this.moreContainer.style.display = 'none';
	}

	init() {
		this.cacheItemWidths();
		this.setupEventListeners();
		
		requestAnimationFrame( () => {
			this.checkOverflow();
		} );
		
		const resizeObserver = new ResizeObserver( () => {
			if ( ! this.isCalculating ) {
				requestAnimationFrame( () => this.checkOverflow() );
			}
		} );
		resizeObserver.observe( this.wrapper );
	}

	cacheItemWidths() {
		this.items.forEach( item => {
			item.style.display = '';
		} );
		
		this.itemWidths = this.items.map( item => {
			return item.getBoundingClientRect().width;
		} );
	}

	setupEventListeners() {
		this.moreButton.addEventListener( 'click', ( e ) => {
			e.preventDefault();
			e.stopPropagation();
			this.toggleDropdown();
		} );
		
		document.addEventListener( 'click', ( e ) => {
			if ( ! this.moreContainer.contains( e.target ) && this.isOpen ) {
				this.closeDropdown();
			}
		} );

		document.addEventListener( 'keydown', ( e ) => {
			if ( e.key === 'Escape' && this.isOpen ) {
				// If accordions are open, close them first, otherwise close dropdown
				if ( this.openAccordions.length > 0 ) {
					this.closeAllAccordions();
					e.preventDefault();
				} else {
					this.closeDropdown();
				}
			}
		} );
		
		// Event delegation for accordion toggles
		this.dropdown.addEventListener( 'click', ( e ) => {
			const toggle = e.target.closest( '.priority-nav-accordion-toggle' );
			if ( toggle ) {
				e.preventDefault();
				e.stopPropagation();
				const submenuId = toggle.getAttribute( 'aria-controls' );
				const submenu = document.getElementById( submenuId );
				if ( submenu ) {
					this.toggleAccordionItem( toggle, submenu );
				}
			}
		} );
	}

	checkOverflow() {
		this.isCalculating = true;
		
		const wrapperWidth = this.wrapper.getBoundingClientRect().width;
		const navStyles = window.getComputedStyle( this.nav );
		const padding = parseFloat( navStyles.paddingLeft ) + parseFloat( navStyles.paddingRight );
		const gap = parseFloat( navStyles.gap ) || 8;
		
		// Temporarily show more button to measure it
		this.moreContainer.style.display = '';
		const moreButtonWidth = this.moreButton.getBoundingClientRect().width;
		
		let availableWidth = wrapperWidth - padding;
		let visibleCount = 0;
		
		// First pass: try to fit all items
		let totalWidth = 0;
		for ( let i = 0; i < this.items.length; i++ ) {
			const itemWidth = this.itemWidths[ i ];
			const gapWidth = i > 0 ? gap : 0; // Gap before item (not for first item)
			totalWidth += gapWidth + itemWidth;
		}
		
		// If everything fits, show all items and hide the More button
		if ( totalWidth <= availableWidth ) {
			this.items.forEach( item => item.style.display = '' );
			this.moreContainer.style.display = 'none';
			this.closeDropdown();
			this.isCalculating = false;
			return;
		}
		
		// Calculate how many items fit with the More button visible
		let usedWidth = 0;
		for ( let i = 0; i < this.items.length; i++ ) {
			const itemWidth = this.itemWidths[ i ];
			const gapWidth = i > 0 ? gap : 0;
			const moreButtonGap = gap; // Gap before the More button
			const itemTotalWidth = gapWidth + itemWidth;
			
			// Check if this item + more button would fit
			const wouldFit = usedWidth + itemTotalWidth + moreButtonGap + moreButtonWidth <= availableWidth;
			
			// Always show at least one item
			if ( wouldFit || i === 0 ) {
				this.items[ i ].style.display = '';
				usedWidth += itemTotalWidth;
				visibleCount++;
			} else {
				break;
			}
		}
		
		// Move overflow items to dropdown - build fresh accordion HTML
		this.dropdown.innerHTML = '';
		this.submenuCounter = 0; // Reset counter
		let hasHiddenItems = false;
		
		for ( let i = visibleCount; i < this.items.length; i++ ) {
			this.items[ i ].style.display = 'none';
			
			// Extract data from the item
			const itemData = this.extractNavItemData( this.items[ i ] );
			
			// Build fresh accordion HTML
			const accordionHTML = this.buildAccordionHTML( itemData, 0 );
			
			// Create container and insert HTML
			const container = document.createElement( 'li' );
			container.innerHTML = accordionHTML;
			
			if ( typeof console !== 'undefined' && console.log ) {
				console.log( 'Built accordion HTML:', accordionHTML );
				console.log( 'Item data:', itemData );
			}
			
			this.dropdown.appendChild( container );
			hasHiddenItems = true;
		}
		
		// Show/hide More button (should always be visible here since we broke out of the first check)
		if ( hasHiddenItems ) {
			this.moreContainer.style.display = '';
		} else {
			this.moreContainer.style.display = 'none';
			this.closeDropdown();
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
		this.isOpen = true;
		this.dropdown.classList.add( 'is-open' );
		this.moreButton.setAttribute( 'aria-expanded', 'true' );
	}

	closeDropdown() {
		this.isOpen = false;
		this.dropdown.classList.remove( 'is-open' );
		this.moreButton.setAttribute( 'aria-expanded', 'false' );
		// Close all open accordions
		this.closeAllAccordions();
	}

	extractNavItemData( item ) {
		// Extract data from a navigation list item
		const data = {
			text: '',
			url: '#',
			hasSubmenu: false,
			children: []
		};

		// Check for submenu FIRST - if it exists, we need to get text differently
		const submenuContainer = item.querySelector( ':scope > .wp-block-navigation__submenu-container' );
		
		// Find the link element
		let linkElement = item.querySelector( ':scope > a' );
		if ( ! linkElement ) {
			linkElement = item.querySelector( ':scope > .wp-block-navigation-item__content a' );
		}
		if ( ! linkElement ) {
			// Fallback: try to get text from item directly, but exclude submenu text
			if ( submenuContainer ) {
				// Clone item, remove submenu, then get text
				const clone = item.cloneNode( true );
				const cloneSubmenu = clone.querySelector( '.wp-block-navigation__submenu-container' );
				if ( cloneSubmenu ) {
					cloneSubmenu.remove();
				}
				data.text = clone.textContent.trim();
			} else {
				data.text = item.textContent.trim();
			}
			if ( submenuContainer ) {
				data.hasSubmenu = true;
				const childItems = submenuContainer.querySelectorAll( ':scope > li' );
				childItems.forEach( childItem => {
					data.children.push( this.extractNavItemData( childItem ) );
				} );
			}
			return data;
		}

		// Extract text - only get direct text content, not from nested elements or submenu
		// Get the label element if it exists (WordPress navigation uses this)
		const label = linkElement.querySelector( '.wp-block-navigation-item__label' );
		if ( label ) {
			data.text = label.textContent.trim();
		} else {
			// No label - extract only direct text nodes, not from nested elements
			// Clone link and remove all child elements to get only text
			const linkClone = linkElement.cloneNode( true );
			const allChildren = linkClone.querySelectorAll( '*' );
			allChildren.forEach( child => child.remove() );
			data.text = linkClone.textContent.trim();
			
			// If that didn't work, try getting first text node only
			if ( ! data.text ) {
				const textNodes = Array.from( linkElement.childNodes ).filter( node => node.nodeType === Node.TEXT_NODE );
				if ( textNodes.length > 0 ) {
					data.text = textNodes.map( node => node.textContent.trim() ).filter( t => t ).join( ' ' );
				}
			}
		}
		
		// Ensure we don't have submenu text mixed in (safety check)
		if ( submenuContainer && data.text ) {
			// If text seems unusually long or contains child item text, try to clean it
			const childTexts = [];
			submenuContainer.querySelectorAll( 'li a' ).forEach( childLink => {
				const childText = childLink.textContent.trim();
				if ( childText && data.text.includes( childText ) ) {
					childTexts.push( childText );
				}
			} );
			
			// Remove child texts from parent text if they're found
			if ( childTexts.length > 0 ) {
				childTexts.forEach( childText => {
					data.text = data.text.replace( childText, '' ).trim();
				} );
			}
		}
		
		data.url = linkElement.getAttribute( 'href' ) || '#';

		// Extract children if submenu exists
		if ( submenuContainer ) {
			data.hasSubmenu = true;
			
			// Extract children recursively
			const childItems = submenuContainer.querySelectorAll( ':scope > li' );
			childItems.forEach( childItem => {
				data.children.push( this.extractNavItemData( childItem ) );
			} );
		}

		return data;
	}

	buildAccordionHTML( data, level ) {
		const submenuId = 'priority-nav-submenu-' + ( this.submenuCounter++ );
		let html = '';

		if ( data.hasSubmenu ) {
			// Item has children - build accordion
			if ( this.openSubmenusOnClick ) {
				// Click mode: entire item is clickable
				html = `
					<button type="button" class="priority-nav-accordion-toggle priority-nav-accordion-toggle-full" 
					        aria-expanded="false" aria-controls="${ submenuId }">
						<span class="priority-nav-accordion-text">${ this.escapeHtml( data.text ) }</span>
						<span class="priority-nav-accordion-arrow" aria-hidden="true">›</span>
					</button>
					<ul class="priority-nav-accordion-content" id="${ submenuId }" aria-hidden="true">
				`;
			} else {
				// Arrow mode: link stays functional, separate arrow button
				html = `
					<span class="priority-nav-accordion-wrapper">
						<a href="${ this.escapeHtml( data.url ) }" class="priority-nav-accordion-link">${ this.escapeHtml( data.text ) }</a>
						<button type="button" class="priority-nav-accordion-toggle priority-nav-accordion-toggle-arrow" 
						        aria-expanded="false" aria-controls="${ submenuId }" aria-label="Toggle submenu">
							<span class="priority-nav-accordion-arrow" aria-hidden="true">›</span>
						</button>
					</span>
					<ul class="priority-nav-accordion-content" id="${ submenuId }" aria-hidden="true">
				`;
			}

			// Build children
			data.children.forEach( child => {
				html += `<li>${ this.buildAccordionHTML( child, level + 1 ) }</li>`;
			} );

			html += '</ul>';
		} else {
			// No submenu - just a link
			html = `<a href="${ this.escapeHtml( data.url ) }">${ this.escapeHtml( data.text ) }</a>`;
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
		
		if ( typeof console !== 'undefined' && console.log ) {
			console.log( 'toggleAccordionItem called, isExpanded:', isExpanded, 'submenu ID:', submenu.id );
		}
		
		if ( isExpanded ) {
			// Close this accordion
			button.setAttribute( 'aria-expanded', 'false' );
			submenu.style.setProperty( 'display', 'none', 'important' );
			submenu.classList.remove( 'is-open' );
			submenu.setAttribute( 'aria-hidden', 'true' );
			
			// Remove from open accordions array
			this.openAccordions = this.openAccordions.filter( item => item.button !== button );
			
			// Close any nested accordions
			const nestedAccordions = submenu.querySelectorAll( '.priority-nav-accordion-toggle[aria-expanded="true"]' );
			nestedAccordions.forEach( nestedButton => {
				const nestedSubmenuId = nestedButton.getAttribute( 'aria-controls' );
				const nestedSubmenu = document.getElementById( nestedSubmenuId );
				if ( nestedSubmenu ) {
					nestedButton.setAttribute( 'aria-expanded', 'false' );
					nestedSubmenu.style.setProperty( 'display', 'none', 'important' );
					nestedSubmenu.classList.remove( 'is-open' );
					nestedSubmenu.setAttribute( 'aria-hidden', 'true' );
				}
			} );
			
			if ( typeof console !== 'undefined' && console.log ) {
				console.log( 'Accordion closed' );
			}
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
			
			if ( typeof console !== 'undefined' && console.log ) {
				console.log( 'Accordion opened, submenu styles:', {
					display: window.getComputedStyle( submenu ).display,
					opacity: window.getComputedStyle( submenu ).opacity,
					visibility: window.getComputedStyle( submenu ).visibility
				} );
			}
			
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
}

// Initialize on DOM ready
document.addEventListener( 'DOMContentLoaded', () => {
	const navElements = document.querySelectorAll( '[data-priority-nav]' );
	navElements.forEach( nav => new PriorityNav( nav ) );
} );