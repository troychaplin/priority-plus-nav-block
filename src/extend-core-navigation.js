/**
 * Extends core/navigation block with Priority+ Navigation attributes and controls
 */

import { __ } from '@wordpress/i18n';
import { addFilter } from '@wordpress/hooks';
import { InspectorControls } from '@wordpress/block-editor';
import { PanelBody, TextControl, SelectControl } from '@wordpress/components';
import { createHigherOrderComponent } from '@wordpress/compose';
import { Fragment } from '@wordpress/element';
import { registerBlockVariation } from '@wordpress/blocks';
import { plusCircle } from '@wordpress/icons';

/**
 * Add Priority+ attributes to core/navigation block
 */
addFilter(
	'blocks.registerBlockType',
	'priority-nav/extend-core-navigation-attributes',
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
					default: 'More',
				},
				priorityNavMoreIcon: {
					type: 'string',
					default: 'dots',
				},
			},
		};
	}
);

/**
 * Add Inspector Controls to core/navigation block
 */
const withPriorityNavControls = createHigherOrderComponent( ( BlockEdit ) => {
	return ( props ) => {
		const { name, attributes, setAttributes } = props;

		if ( name !== 'core/navigation' ) {
			return <BlockEdit { ...props } />;
		}

		const {
			priorityNavEnabled,
			priorityNavMoreLabel,
			priorityNavMoreIcon,
		} = attributes;

		// Only show controls if Priority Nav is enabled
		if ( ! priorityNavEnabled ) {
			return <BlockEdit { ...props } />;
		}

		return (
			<Fragment>
				<BlockEdit { ...props } />
				<InspectorControls>
					<PanelBody
						title={ __( 'Priority+ Settings', 'priority-nav' ) }
					>
						<TextControl
							label={ __( 'More Button Label', 'priority-nav' ) }
							value={ priorityNavMoreLabel }
							onChange={ ( value ) =>
								setAttributes( { priorityNavMoreLabel: value } )
							}
							help={ __(
								'Text displayed on the "More" button',
								'priority-nav'
							) }
						/>
						<SelectControl
							label={ __( 'More Button Icon', 'priority-nav' ) }
							value={ priorityNavMoreIcon }
							options={ [
								{
									label: __(
										'Horizontal Dots (•••)',
										'priority-nav'
									),
									value: 'dots',
								},
								{
									label: __(
										'Chevron Down (▼)',
										'priority-nav'
									),
									value: 'chevron',
								},
								{
									label: __( 'Plus (+)', 'priority-nav' ),
									value: 'plus',
								},
								{
									label: __( 'Menu (≡)', 'priority-nav' ),
									value: 'menu',
								},
							] }
							onChange={ ( value ) =>
								setAttributes( { priorityNavMoreIcon: value } )
							}
						/>
					</PanelBody>
				</InspectorControls>
			</Fragment>
		);
	};
}, 'withPriorityNavControls' );

addFilter(
	'editor.BlockEdit',
	'priority-nav/add-priority-nav-controls',
	withPriorityNavControls
);

/**
 * Register block variation for Priority+ Navigation
 */
registerBlockVariation( 'core/navigation', {
	name: 'lumen-priority-nav',
	title: __( 'Priority+ Nav', 'priority-nav' ),
	description: __(
		'A responsive navigation that automatically moves overflow items to a "More" dropdown.',
		'priority-nav'
	),
	icon: plusCircle,
	attributes: {
		priorityNavEnabled: true,
		priorityNavMoreLabel: 'More',
		priorityNavMoreIcon: 'dots',
	},
	scope: [ 'inserter', 'block' ],
	isActive: ( blockAttributes ) => {
		return !! blockAttributes.priorityNavEnabled;
	},
} );
