/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { addFilter } from '@wordpress/hooks';
import {
	InspectorControls,
	PanelColorSettings,
	useSetting,
	__experimentalSpacingSizesControl as SpacingSizesControl,
} from '@wordpress/block-editor';
import {
	TextControl,
	SelectControl,
	BoxControl,
	Notice,
	__experimentalToolsPanel as ToolsPanel,
	__experimentalToolsPanelItem as ToolsPanelItem,
} from '@wordpress/components';
import { createHigherOrderComponent } from '@wordpress/compose';
import { useEffect, useRef } from '@wordpress/element';

/**
 * Add DOM manipulation to disable 'always' overlay option when Priority+ is active
 */
const addDisableAlwaysOption = createHigherOrderComponent( ( BlockEdit ) => {
	return ( props ) => {
		const { name, attributes } = props;

		if ( name !== 'core/navigation' ) {
			return <BlockEdit { ...props } />;
		}

		// Check if Priority+ variation is active
		const className = attributes.className || '';
		const isPriorityNavVariation =
			className.includes( 'is-style-priority-nav' ) ||
			attributes.priorityNavEnabled === true;

		// Use effect to modify the DOM after render
		useEffect( () => {
			if ( ! isPriorityNavVariation ) {
				return;
			}

			// Find all toggle group control buttons in the inspector
			const inspector = document.querySelector(
				'.block-editor-block-inspector'
			);
			if ( ! inspector ) {
				return;
			}

			// Find the 'always' button by data-value attribute
			const alwaysButton = inspector.querySelector(
				'.components-toggle-group-control-option-base[data-value="always"]'
			);

			if ( alwaysButton ) {
				alwaysButton.style.opacity = '0.4';
				alwaysButton.style.pointerEvents = 'none';
				alwaysButton.style.textDecoration = 'line-through';
				alwaysButton.style.cursor = 'not-allowed';
			}
		}, [ isPriorityNavVariation, attributes.overlayMenu ] );

		return <BlockEdit { ...props } />;
	};
}, 'addDisableAlwaysOption' );

/**
 * Add Inspector Controls to core/navigation block
 */
const withPriorityNavControls = createHigherOrderComponent( ( BlockEdit ) => {
	return ( props ) => {
		const { name, attributes, setAttributes } = props;

		if ( name !== 'core/navigation' ) {
			return <BlockEdit { ...props } />;
		}

		// Only show controls if the Priority+ variation is active.
		// Check for the variation className or explicit priorityNavEnabled attribute.
		const className = attributes.className || '';
		const isPriorityNavVariation =
			className.includes( 'is-style-priority-nav' ) ||
			attributes.priorityNavEnabled === true;

		// If not using the variation, return the block edit without our controls.
		if ( ! isPriorityNavVariation ) {
			return <BlockEdit { ...props } />;
		}

		const {
			priorityNavEnabled,
			priorityNavMoreLabel,
			priorityNavMoreBackgroundColor,
			priorityNavMoreBackgroundColorHover,
			priorityNavMoreTextColor,
			priorityNavMoreTextColorHover,
			priorityNavMorePadding,
			overlayMenu,
		} = attributes;

		// Automatically change overlayMenu from 'always' to 'mobile' when Priority+ is active
		useEffect( () => {
			if ( isPriorityNavVariation && overlayMenu === 'always' ) {
				setAttributes( { overlayMenu: 'mobile' } );
			}
		}, [ isPriorityNavVariation, overlayMenu, setAttributes ] );

		// Get spacing sizes from theme.
		const spacingSizes = useSetting( 'spacing.spacingSizes' ) || [];

		// Helper to check if padding has values.
		const hasPaddingValue = () => {
			if ( ! priorityNavMorePadding ) {
				return false;
			}
			return Object.keys( priorityNavMorePadding ).length > 0;
		};

		return (
			<>
				<BlockEdit { ...props } />

				<InspectorControls group="settings">
					<Notice status="info" isDismissible={ false }>
						{ __(
							'Priority+ Navigation is not compatible with "Always" overlay menu. The overlay menu is set to "Mobile" to allow Priority+ to work on desktop.',
							'priority-nav'
						) }
					</Notice>
				</InspectorControls>

				<InspectorControls group="styles">
					<ToolsPanel
						label={ __( 'Priority Plus Settings', 'priority-nav' ) }
						resetAll={ () =>
							setAttributes( {
								priorityNavMoreLabel: 'More',
							} )
						}
					>
						<ToolsPanelItem
							hasValue={ () => !! priorityNavMoreLabel }
							label={ __( 'More Button Label', 'priority-nav' ) }
							onDeselect={ () =>
								setAttributes( {
									priorityNavMoreLabel: 'More',
								} )
							}
							isShownByDefault
						>
							<TextControl
								label={ __(
									'More Button Label',
									'priority-nav'
								) }
								value={ priorityNavMoreLabel }
								onChange={ ( value ) =>
									setAttributes( {
										priorityNavMoreLabel: value,
									} )
								}
								help={ __(
									'Text displayed on the "More" button',
									'priority-nav'
								) }
							/>
						</ToolsPanelItem>
					</ToolsPanel>
					<PanelColorSettings
						title={ __( 'Priority Plus Colors', 'priority-nav' ) }
						colorSettings={ [
							{
								label: __(
									'Button Text Color',
									'priority-nav'
								),
								value: priorityNavMoreTextColor,
								onChange: ( color ) =>
									setAttributes( {
										priorityNavMoreTextColor:
											color || undefined,
									} ),
								clearable: true,
							},
							{
								label: __(
									'Button Text Hover Color',
									'priority-nav'
								),
								value: priorityNavMoreTextColorHover,
								onChange: ( color ) =>
									setAttributes( {
										priorityNavMoreTextColorHover:
											color || undefined,
									} ),
								clearable: true,
							},
							{
								label: __(
									'Button Background Color',
									'priority-nav'
								),
								value: priorityNavMoreBackgroundColor,
								onChange: ( color ) =>
									setAttributes( {
										priorityNavMoreBackgroundColor:
											color || undefined,
									} ),
								clearable: true,
							},
							{
								label: __(
									'Button Background Hover Color',
									'priority-nav'
								),
								value: priorityNavMoreBackgroundColorHover,
								onChange: ( color ) =>
									setAttributes( {
										priorityNavMoreBackgroundColorHover:
											color || undefined,
									} ),
								clearable: true,
							},
						] }
					/>
					<ToolsPanel
						label={ __( 'Priority Plus Button', 'priority-nav' ) }
						resetAll={ () =>
							setAttributes( {
								priorityNavMorePadding: undefined,
							} )
						}
					>
						<ToolsPanelItem
							hasValue={ hasPaddingValue }
							label={ __( 'Padding', 'priority-nav' ) }
							onDeselect={ () =>
								setAttributes( {
									priorityNavMorePadding: undefined,
								} )
							}
							isShownByDefault
						>
							{ spacingSizes.length > 0 ? (
								<SpacingSizesControl
									values={ priorityNavMorePadding }
									onChange={ ( value ) =>
										setAttributes( {
											priorityNavMorePadding: value,
										} )
									}
									label={ __(
										'Button Padding',
										'priority-nav'
									) }
									sides={ [
										'top',
										'right',
										'bottom',
										'left',
									] }
									units={ [ 'px', 'em', 'rem', 'vh', 'vw' ] }
								/>
							) : (
								<BoxControl
									label={ __(
										'Button Padding',
										'priority-nav'
									) }
									values={ priorityNavMorePadding }
									onChange={ ( value ) =>
										setAttributes( {
											priorityNavMorePadding: value,
										} )
									}
									sides={ [
										'top',
										'right',
										'bottom',
										'left',
									] }
									units={ [ 'px', 'em', 'rem', 'vh', 'vw' ] }
									allowReset={ true }
								/>
							) }
						</ToolsPanelItem>
					</ToolsPanel>
				</InspectorControls>
			</>
		);
	};
}, 'withPriorityNavControls' );

// Apply filters in order: first add DOM manipulation for styling, then our controls
addFilter(
	'editor.BlockEdit',
	'priority-nav/add-disable-always-option',
	addDisableAlwaysOption,
	5
);

addFilter(
	'editor.BlockEdit',
	'priority-nav/add-priority-nav-controls',
	withPriorityNavControls,
	10
);
