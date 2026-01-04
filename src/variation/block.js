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
	DEFAULT_DROPDOWN_BACKGROUND_COLOR,
	DEFAULT_DROPDOWN_BORDER,
	DEFAULT_DROPDOWN_BORDER_RADIUS,
	DEFAULT_DROPDOWN_BOX_SHADOW,
	DEFAULT_DROPDOWN_ITEM_SPACING,
	DEFAULT_DROPDOWN_ITEM_HOVER_BACKGROUND_COLOR,
	DEFAULT_DROPDOWN_ITEM_HOVER_TEXT_COLOR,
	DEFAULT_DROPDOWN_MULTI_LEVEL_INDENT,
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
		priorityNavEnabled: true,
		priorityNavMoreLabel: 'More',
		priorityNavMoreBackgroundColor: undefined,
		priorityNavMoreBackgroundColorHover: undefined,
		priorityNavMoreTextColor: undefined,
		priorityNavMoreTextColorHover: undefined,
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
				priorityNavEnabled: {
					type: 'boolean',
					default: false,
				},
				// More button settings
				priorityNavMoreLabel: {
					type: 'string',
					default: 'More',
				},
				priorityNavMoreIcon: {
					type: 'string',
					default: 'none',
				},
				priorityNavMoreBackgroundColor: {
					type: 'string',
				},
				priorityNavMoreBackgroundColorHover: {
					type: 'string',
				},
				priorityNavMoreTextColor: {
					type: 'string',
				},
				priorityNavMoreTextColorHover: {
					type: 'string',
				},
				priorityNavMorePadding: {
					type: 'object',
					default: undefined,
				},
				// Dropdown style attributes (separate for reliable updates)
				priorityNavDropdownBackgroundColor: {
					type: 'string',
					default: DEFAULT_DROPDOWN_BACKGROUND_COLOR,
				},
				priorityNavDropdownBorder: {
					type: 'object',
					default: DEFAULT_DROPDOWN_BORDER,
				},
				priorityNavDropdownBorderRadius: {
					type: ['string', 'object'],
					default: DEFAULT_DROPDOWN_BORDER_RADIUS,
				},
				priorityNavDropdownBoxShadow: {
					type: 'string',
					default: DEFAULT_DROPDOWN_BOX_SHADOW,
				},
				priorityNavDropdownItemSpacing: {
					type: 'object',
					default: DEFAULT_DROPDOWN_ITEM_SPACING,
				},
				priorityNavDropdownItemHoverBackgroundColor: {
					type: 'string',
					default: DEFAULT_DROPDOWN_ITEM_HOVER_BACKGROUND_COLOR,
				},
				priorityNavDropdownItemHoverTextColor: {
					type: 'string',
					default: DEFAULT_DROPDOWN_ITEM_HOVER_TEXT_COLOR,
				},
				priorityNavDropdownMultiLevelIndent: {
					type: 'string',
					default: DEFAULT_DROPDOWN_MULTI_LEVEL_INDENT,
				},
				// Typography attributes (for preview)
				priorityNavTypographyFontFamily: {
					type: 'string',
				},
				priorityNavTypographyFontSize: {
					type: 'string',
				},
				priorityNavTypographyFontWeight: {
					type: 'string',
				},
				priorityNavTypographyFontStyle: {
					type: 'string',
				},
			},
		};
	}
);
