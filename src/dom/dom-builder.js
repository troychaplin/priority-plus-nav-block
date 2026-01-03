/**
 * DOM building utilities for PriorityNav
 */
import { DEFAULT_MORE_LABEL, CHEVRON_ICON_SVG } from '../utils/constants.js';
import { escapeHtml } from '../utils/html-utils.js';
import { extractNavItemData } from './dom-extractor.js';

/**
 * Create the More button and dropdown container
 * @param {HTMLElement} list      - Navigation list container
 * @param {string}      moreLabel - Label for the More button
 * @return {Object} Object containing moreContainer, moreButton, and dropdown elements
 */
export function createMoreButton(list, moreLabel = DEFAULT_MORE_LABEL) {
	// Create the more container
	const moreContainer = document.createElement('div');
	moreContainer.className = 'priority-plus-navigation-more';

	// Create button
	const moreButton = document.createElement('button');
	moreButton.type = 'button';
	moreButton.className =
		'priority-plus-navigation-more-button wp-block-navigation-item';
	moreButton.setAttribute('aria-expanded', 'false');
	moreButton.setAttribute('aria-haspopup', 'true');
	moreButton.setAttribute('aria-label', moreLabel);

	moreButton.innerHTML = `
		<span class="wp-block-navigation-item__label">${moreLabel}</span>
		<span class="priority-plus-navigation-icon">${CHEVRON_ICON_SVG}</span>
	`;

	// Create dropdown
	const dropdown = document.createElement('ul');
	dropdown.className =
		'priority-plus-navigation-dropdown wp-block-navigation__submenu-container';
	dropdown.setAttribute('role', 'menu');

	moreContainer.appendChild(moreButton);
	moreContainer.appendChild(dropdown);

	// Insert after the navigation list
	list.parentNode.appendChild(moreContainer);
	moreContainer.style.display = 'none';

	return {
		moreContainer,
		moreButton,
		dropdown,
	};
}

/**
 * Build accordion HTML for a navigation item
 * @param {Object}  data                - Navigation item data
 * @param {number}  level               - Nesting level
 * @param {string}  instanceId          - Unique instance ID
 * @param {number}  submenuCounter      - Counter for generating unique IDs (will be mutated)
 * @param {boolean} openSubmenusOnClick - Whether submenus open on click
 * @return {string} HTML string for the accordion item
 */
export function buildAccordionHTML(
	data,
	level,
	instanceId,
	submenuCounter,
	openSubmenusOnClick
) {
	const submenuId = `${instanceId}-submenu-${submenuCounter.value++}`;
	let html = '';

	if (data.hasSubmenu) {
		// Item has children - build accordion
		if (openSubmenusOnClick) {
			// Click mode: entire item is clickable
			html = `
				<button type="button" class="priority-plus-navigation-accordion-toggle priority-plus-navigation-accordion-toggle-full" 
				        aria-expanded="false" aria-controls="${submenuId}">
					<span class="priority-plus-navigation-accordion-text">${escapeHtml(data.text)}</span>
					<span class="priority-plus-navigation-accordion-arrow" aria-hidden="true">›</span>
				</button>
				<ul class="priority-plus-navigation-accordion-content" id="${submenuId}" aria-hidden="true">
			`;
		} else {
			// Arrow mode: link stays functional, separate arrow button
			html = `
				<span class="priority-plus-navigation-accordion-wrapper">
					<a href="${escapeHtml(
						data.url
					)}" class="priority-plus-navigation-accordion-link">${escapeHtml(
						data.text
					)}</a>
					<button type="button" class="priority-plus-navigation-accordion-toggle priority-plus-navigation-accordion-toggle-arrow" 
					        aria-expanded="false" aria-controls="${submenuId}" aria-label="Toggle submenu">
						<span class="priority-plus-navigation-accordion-arrow" aria-hidden="true">›</span>
					</button>
				</span>
				<ul class="priority-plus-navigation-accordion-content" id="${submenuId}" aria-hidden="true">
			`;
		}

		// Build children
		data.children.forEach((child) => {
			html += `<li>${buildAccordionHTML(
				child,
				level + 1,
				instanceId,
				submenuCounter,
				openSubmenusOnClick
			)}</li>`;
		});

		html += '</ul>';
	} else {
		// No submenu - just a link
		html = `<a href="${escapeHtml(data.url)}">${escapeHtml(data.text)}</a>`;
	}

	return html;
}

/**
 * Build dropdown from overflow items
 * @param {HTMLElement}        dropdown            - Dropdown container element
 * @param {Array<HTMLElement>} items               - All navigation items
 * @param {number}             visibleCount        - Number of visible items
 * @param {string}             instanceId          - Unique instance ID
 * @param {Object}             submenuCounter      - Counter object for generating unique IDs (will be mutated)
 * @param {boolean}            openSubmenusOnClick - Whether submenus open on click
 */
export function buildDropdownFromOverflow(
	dropdown,
	items,
	visibleCount,
	instanceId,
	submenuCounter,
	openSubmenusOnClick
) {
	dropdown.innerHTML = '';
	submenuCounter.value = 0; // Reset counter

	for (let i = visibleCount; i < items.length; i++) {
		// Extract data from the item
		const itemData = extractNavItemData(items[i]);

		// Build fresh accordion HTML
		const accordionHTML = buildAccordionHTML(
			itemData,
			0,
			instanceId,
			submenuCounter,
			openSubmenusOnClick
		);

		// Create container and insert HTML
		const container = document.createElement('li');
		container.innerHTML = accordionHTML;

		dropdown.appendChild(container);
	}
}
