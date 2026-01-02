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
	__experimentalToolsPanel as ToolsPanel,
	__experimentalToolsPanelItem as ToolsPanelItem,
} from '@wordpress/components';
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
			priorityNavMoreIcon,
			priorityNavMoreBackgroundColor,
			priorityNavMoreBackgroundColorHover,
			priorityNavMoreTextColor,
			priorityNavMoreTextColorHover,
			priorityNavMorePadding,
		} = attributes;

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

				<InspectorControls>
					<ToolsPanel
						label={ __( 'Priority Plus Settings', 'priority-nav' ) }
						resetAll={ () =>
							setAttributes( {
								priorityNavMoreLabel: 'Browse',
								priorityNavMoreIcon: 'none',
							} )
						}
					>
						<ToolsPanelItem
							hasValue={ () => !! priorityNavMoreLabel }
							label={ __( 'More Button Label', 'priority-nav' ) }
							onDeselect={ () =>
								setAttributes( {
									priorityNavMoreLabel: 'Browse',
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
						<ToolsPanelItem
							hasValue={ () => !! priorityNavMoreIcon }
							label={ __( 'More Button Icon', 'priority-nav' ) }
							onDeselect={ () =>
								setAttributes( { priorityNavMoreIcon: 'none' } )
							}
							isShownByDefault
						>
							<SelectControl
								label={ __(
									'More Button Icon',
									'priority-nav'
								) }
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
									setAttributes( {
										priorityNavMoreIcon: value,
									} )
								}
							/>
						</ToolsPanelItem>
					</ToolsPanel>
				</InspectorControls>

				<InspectorControls group="styles">
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

addFilter(
	'editor.BlockEdit',
	'priority-nav/add-priority-nav-controls',
	withPriorityNavControls
);
