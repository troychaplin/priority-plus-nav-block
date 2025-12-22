/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { registerBlockVariation } from '@wordpress/blocks';
import { plusCircle } from '@wordpress/icons';
import { addFilter } from '@wordpress/hooks';

/**
 * Register Priority+ Nav block variation
 */
registerBlockVariation( 'core/navigation', {
	name: 'priority-nav',
	title: __( 'Priority+ Nav', 'priority-nav' ),
	description: __(
		'A responsive navigation that automatically moves overflow items to a "More" dropdown.',
		'priority-nav'
	),
	icon: plusCircle,
	scope: [ 'inserter', 'transform' ],
	attributes: {
		className: 'is-style-priority-nav',
		overlayMenu: 'never',
		priorityNavEnabled: true,
		priorityNavMoreLabel: 'Browse',
		priorityNavMoreIcon: 'none',
	},
	isActive: ( blockAttributes, variationAttributes ) => {
		return blockAttributes.className?.includes(
			variationAttributes.className
		);
	},
} );

/**
 * Add Priority+ attributes to core/navigation block
 */
addFilter(
	'blocks.registerBlockType',
	'priority-nav/extend-core-navigation',
	( settings, name ) => {
		if ( name !== 'core/navigation' ) {
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
					default: 'Browse',
				},
				priorityNavMoreIcon: {
					type: 'string',
					default: 'none',
				},
			},
		};
	}
);
