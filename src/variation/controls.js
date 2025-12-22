/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { addFilter } from '@wordpress/hooks';
import { InspectorControls } from '@wordpress/block-editor';
import { PanelBody, TextControl, SelectControl } from '@wordpress/components';
import { createHigherOrderComponent } from '@wordpress/compose';

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

		return (
			<>
				{ priorityNavEnabled && (
					<div className="priority-nav-editor-wrapper">
						<BlockEdit { ...props } />
					</div>
				) }
				{ ! priorityNavEnabled && <BlockEdit { ...props } /> }
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
									label: __( 'None', 'priority-nav' ),
									value: 'none',
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
			</>
		);
	};
}, 'withPriorityNavControls' );

addFilter(
	'editor.BlockEdit',
	'priority-nav/add-priority-nav-controls',
	withPriorityNavControls
);
