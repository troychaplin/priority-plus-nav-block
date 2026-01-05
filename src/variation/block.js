/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { registerBlockVariation } from '@wordpress/blocks';
import { plusCircle } from '@wordpress/icons';
import { addFilter } from '@wordpress/hooks';

/**
 * Internal dependencies
 */
import {
	DEFAULT_MENU_BACKGROUND_COLOR,
	DEFAULT_MENU_BORDER,
	DEFAULT_MENU_BORDER_RADIUS,
	DEFAULT_MENU_BOX_SHADOW,
	DEFAULT_MENU_ITEM_PADDING,
	DEFAULT_MENU_ITEM_HOVER_BACKGROUND,
	DEFAULT_MENU_ITEM_TEXT_COLOR,
	DEFAULT_MENU_ITEM_HOVER_TEXT_COLOR,
	DEFAULT_MENU_SUBMENU_INDENT,
	DEFAULT_MENU_ITEM_SEPARATOR,
	DEFAULT_SUBMENU_BACKGROUND_COLOR,
	DEFAULT_SUBMENU_ITEM_HOVER_BACKGROUND,
	DEFAULT_SUBMENU_ITEM_TEXT_COLOR,
	DEFAULT_SUBMENU_ITEM_HOVER_TEXT_COLOR,
} from './constants';

/**
 * Register Priority Plus Navigation block variation
 */
registerBlockVariation('core/navigation', {
	name: 'priority-plus-navigation',
	title: __('Priority Plus Navigation', 'priority-plus-navigation'),
	description: __(
		'A responsive navigation that automatically moves overflow items to a "More" dropdown.',
		'priority-plus-navigation'
	),
	icon: plusCircle,
	scope: ['inserter', 'transform'],
	attributes: {
		className: 'is-style-priority-plus-navigation',
		overlayMenu: 'never',
		priorityPlusEnabled: true,
		priorityPlusToggleLabel: 'More',
		priorityPlusToggleBackgroundColor: undefined,
		priorityPlusToggleBackgroundColorHover: undefined,
		priorityPlusToggleTextColor: undefined,
		priorityPlusToggleTextColorHover: undefined,
	},
	isActive: (blockAttributes, variationAttributes) => {
		return blockAttributes.className?.includes(
			variationAttributes.className
		);
	},
});

/**
 * Add Priority+ attributes to core/navigation block
 */
addFilter(
	'blocks.registerBlockType',
	'priority-plus-navigation/extend-core-navigation',
	(settings, name) => {
		if (name !== 'core/navigation') {
			return settings;
		}

		return {
			...settings,
			attributes: {
				...settings.attributes,
				// Priority+ enabled flag
				priorityPlusEnabled: {
					type: 'boolean',
					default: false,
				},
				// Toggle button settings (the "More" button)
				priorityPlusToggleLabel: {
					type: 'string',
					default: 'More',
				},
				priorityPlusToggleIcon: {
					type: 'string',
					default: 'none',
				},
				priorityPlusToggleBackgroundColor: {
					type: 'string',
				},
				priorityPlusToggleBackgroundColorHover: {
					type: 'string',
				},
				priorityPlusToggleTextColor: {
					type: 'string',
				},
				priorityPlusToggleTextColorHover: {
					type: 'string',
				},
				priorityPlusTogglePadding: {
					type: 'object',
					default: undefined,
				},
				// Menu style attributes (the dropdown menu)
				priorityPlusMenuBackgroundColor: {
					type: 'string',
					default: DEFAULT_MENU_BACKGROUND_COLOR,
				},
				priorityPlusMenuBorder: {
					type: 'object',
					default: DEFAULT_MENU_BORDER,
				},
				priorityPlusMenuBorderRadius: {
					type: ['string', 'object'],
					default: DEFAULT_MENU_BORDER_RADIUS,
				},
				priorityPlusMenuBoxShadow: {
					type: 'string',
					default: DEFAULT_MENU_BOX_SHADOW,
				},
				priorityPlusMenuItemPadding: {
					type: 'object',
					default: DEFAULT_MENU_ITEM_PADDING,
				},
				priorityPlusMenuItemHoverBackground: {
					type: 'string',
					default: DEFAULT_MENU_ITEM_HOVER_BACKGROUND,
				},
				priorityPlusMenuItemTextColor: {
					type: 'string',
					default: DEFAULT_MENU_ITEM_TEXT_COLOR,
				},
				priorityPlusMenuItemHoverTextColor: {
					type: 'string',
					default: DEFAULT_MENU_ITEM_HOVER_TEXT_COLOR,
				},
				priorityPlusMenuSubmenuIndent: {
					type: 'string',
					default: DEFAULT_MENU_SUBMENU_INDENT,
				},
				priorityPlusMenuItemSeparator: {
					type: 'object',
					default: DEFAULT_MENU_ITEM_SEPARATOR,
				},
				// Submenu color attributes
				priorityPlusSubmenuBackgroundColor: {
					type: 'string',
					default: DEFAULT_SUBMENU_BACKGROUND_COLOR,
				},
				priorityPlusSubmenuItemHoverBackground: {
					type: 'string',
					default: DEFAULT_SUBMENU_ITEM_HOVER_BACKGROUND,
				},
				priorityPlusSubmenuItemTextColor: {
					type: 'string',
					default: DEFAULT_SUBMENU_ITEM_TEXT_COLOR,
				},
				priorityPlusSubmenuItemHoverTextColor: {
					type: 'string',
					default: DEFAULT_SUBMENU_ITEM_HOVER_TEXT_COLOR,
				},
				// Typography attributes (for preview)
				priorityPlusTypographyFontFamily: {
					type: 'string',
				},
				priorityPlusTypographyFontSize: {
					type: 'string',
				},
				priorityPlusTypographyFontWeight: {
					type: 'string',
				},
				priorityPlusTypographyFontStyle: {
					type: 'string',
				},
			},
		};
	}
);
