/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { registerBlockVariation } from '@wordpress/blocks';
import { plusCircle } from '@wordpress/icons';
import { addFilter } from '@wordpress/hooks';

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
		priorityNavDropdownStyles: {
			backgroundColor: '#ffffff',
			borderColor: '#dddddd',
			borderWidth: '1px',
			borderRadius: '4px',
			boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
			itemSpacing: {
				top: '0.75rem',
				right: '1rem',
				bottom: '0.75rem',
				left: '1rem',
			},
			itemHoverBackgroundColor: 'rgba(0, 0, 0, 0.05)',
			itemHoverTextColor: 'inherit',
			multiLevelIndent: '1.25rem',
		},
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
				priorityNavEnabled: {
					type: 'boolean',
					default: false,
				},
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
				priorityNavDropdownStyles: {
					type: 'object',
					default: {
						backgroundColor: '#ffffff',
						borderColor: '#dddddd',
						borderWidth: '1px',
						borderRadius: '4px',
						boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
						itemSpacing: {
							top: '0.75rem',
							right: '1rem',
							bottom: '0.75rem',
							left: '1rem',
						},
						itemHoverBackgroundColor: 'rgba(0, 0, 0, 0.05)',
						itemHoverTextColor: 'inherit',
						multiLevelIndent: '1.25rem',
					},
				},
			},
		};
	}
);
