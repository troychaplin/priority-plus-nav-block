/**
 * WordPress dependencies
 */
import {
	BoxControl,
	__experimentalToolsPanel as ToolsPanel,
	__experimentalToolsPanelItem as ToolsPanelItem,
} from '@wordpress/components';
import { __experimentalSpacingSizesControl as SpacingSizesControl } from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import {
	DEFAULT_MENU_ITEM_PADDING,
	DEFAULT_MENU_SUBMENU_INDENT,
} from '../../constants';

/**
 * Check if item padding has values
 *
 * @param {Object|string} itemPadding - The item padding value
 * @return {boolean} Whether item padding has values
 */
function hasItemPaddingValue(itemPadding) {
	if (!itemPadding) {
		return false;
	}
	// Check if it's an object (SpacingSizesControl format) or string (legacy format)
	if (typeof itemPadding === 'object') {
		// Check if object has any non-empty values
		const values = Object.values(itemPadding);
		return values.some((value) => value && value !== '');
	}
	return !!itemPadding;
}

/**
 * Check if submenu indent has a value
 *
 * @param {Object|string} indent - The submenu indent value
 * @return {boolean} Whether submenu indent has a value
 */
function hasSubmenuIndentValue(indent) {
	if (!indent) {
		return false;
	}
	// Handle object format from SpacingSizesControl (e.g., { left: '1.25rem' })
	if (typeof indent === 'object') {
		return indent.left && indent.left !== '';
	}
	// Handle legacy string format (e.g., '1.25rem')
	return !!indent;
}

/**
 * Normalize submenu indent value to object format for SpacingSizesControl
 *
 * @param {Object|string} indent - The submenu indent value
 * @return {Object} Normalized indent object with 'left' property
 */
function normalizeIndentValue(indent) {
	if (!indent) {
		return { left: DEFAULT_MENU_SUBMENU_INDENT };
	}
	// Already in object format
	if (typeof indent === 'object' && indent.left) {
		return indent;
	}
	// Convert string to object format
	if (typeof indent === 'string') {
		return { left: indent };
	}
	return { left: DEFAULT_MENU_SUBMENU_INDENT };
}

/**
 * MenuSpacingPanel Component
 *
 * Provides controls for menu spacing (item padding and submenu indent).
 *
 * @param {Object}   props               - Component props
 * @param {Object}   props.attributes    - Block attributes
 * @param {Function} props.setAttributes - Function to update attributes
 * @param {Array}    props.spacingSizes  - Available spacing sizes from theme
 * @return {JSX.Element} Menu spacing panel component
 */
export function MenuSpacingPanel({ attributes, setAttributes, spacingSizes }) {
	const { priorityPlusMenuItemPadding, priorityPlusMenuSubmenuIndent } =
		attributes;

	return (
		<ToolsPanel
			label={__(
				'Priority Menu Item Settings',
				'priority-plus-navigation'
			)}
			resetAll={() => {
				setAttributes({
					priorityPlusMenuItemPadding: DEFAULT_MENU_ITEM_PADDING,
					priorityPlusMenuSubmenuIndent: DEFAULT_MENU_SUBMENU_INDENT,
				});
			}}
		>
			<ToolsPanelItem
				hasValue={() =>
					hasItemPaddingValue(priorityPlusMenuItemPadding)
				}
				label={__('Menu Item Padding', 'priority-plus-navigation')}
				onDeselect={() =>
					setAttributes({
						priorityPlusMenuItemPadding: DEFAULT_MENU_ITEM_PADDING,
					})
				}
				isShownByDefault
			>
				{spacingSizes.length > 0 ? (
					<SpacingSizesControl
						values={priorityPlusMenuItemPadding}
						onChange={(value) =>
							setAttributes({
								priorityPlusMenuItemPadding: value,
							})
						}
						label={__(
							'Menu Item Padding',
							'priority-plus-navigation'
						)}
						sides={['top', 'right', 'bottom', 'left']}
						units={['px', 'em', 'rem', 'vh', 'vw']}
					/>
				) : (
					<BoxControl
						label={__(
							'Menu Item Padding',
							'priority-plus-navigation'
						)}
						values={priorityPlusMenuItemPadding}
						onChange={(value) =>
							setAttributes({
								priorityPlusMenuItemPadding: value,
							})
						}
						sides={['top', 'right', 'bottom', 'left']}
						units={['px', 'em', 'rem', 'vh', 'vw']}
						allowReset={true}
					/>
				)}
			</ToolsPanelItem>
			<ToolsPanelItem
				hasValue={() =>
					hasSubmenuIndentValue(priorityPlusMenuSubmenuIndent)
				}
				label={__('Submenu Indent', 'priority-plus-navigation')}
				onDeselect={() =>
					setAttributes({
						priorityPlusMenuSubmenuIndent: {
							left: DEFAULT_MENU_SUBMENU_INDENT,
						},
					})
				}
				isShownByDefault
			>
				<SpacingSizesControl
					label={__('Submenu Indent', 'priority-plus-navigation')}
					values={normalizeIndentValue(priorityPlusMenuSubmenuIndent)}
					onChange={(value) =>
						setAttributes({
							priorityPlusMenuSubmenuIndent: value,
						})
					}
					sides={['left']}
				/>
			</ToolsPanelItem>
		</ToolsPanel>
	);
}
