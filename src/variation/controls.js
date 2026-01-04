/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { addFilter } from '@wordpress/hooks';

/**
 * Internal dependencies
 */
import { DEFAULT_DROPDOWN_STYLES } from './constants';
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
	Button,
	__experimentalToolsPanel as ToolsPanel,
	__experimentalToolsPanelItem as ToolsPanelItem,
} from '@wordpress/components';
import { createHigherOrderComponent } from '@wordpress/compose';
import { useEffect, useRef, useState } from '@wordpress/element';

/**
 * Internal dependencies
 */
import { DropdownCustomizerModal } from './components/dropdown-customizer-modal';

/**
 * Add DOM manipulation to disable 'always' overlay option when Priority+ is active
 */
const addDisableAlwaysOption = createHigherOrderComponent((BlockEdit) => {
	return (props) => {
		const { name, attributes } = props;

		if (name !== 'core/navigation') {
			return <BlockEdit {...props} />;
		}

		// Check if Priority+ variation is active
		const className = attributes.className || '';
		const isPriorityNavVariation =
			className.includes('is-style-priority-plus-navigation') ||
			attributes.priorityNavEnabled === true;

		// Use effect to modify the DOM after render
		useEffect(() => {
			if (!isPriorityNavVariation) {
				return;
			}

			// Find all toggle group control buttons in the inspector
			const inspector = document.querySelector(
				'.block-editor-block-inspector'
			);
			if (!inspector) {
				return;
			}

			// Find the 'always' button by data-value attribute
			const alwaysButton = inspector.querySelector(
				'.components-toggle-group-control-option-base[data-value="always"]'
			);

			if (alwaysButton) {
				alwaysButton.style.opacity = '0.4';
				alwaysButton.style.pointerEvents = 'none';
				alwaysButton.style.textDecoration = 'line-through';
				alwaysButton.style.cursor = 'not-allowed';
			}
		}, [isPriorityNavVariation, attributes.overlayMenu]);

		return <BlockEdit {...props} />;
	};
}, 'addDisableAlwaysOption');

/**
 * Add Inspector Controls to core/navigation block
 */
const withPriorityNavControls = createHigherOrderComponent((BlockEdit) => {
	return (props) => {
		const { name, attributes, setAttributes } = props;

		if (name !== 'core/navigation') {
			return <BlockEdit {...props} />;
		}

		// Only show controls if the Priority+ variation is active.
		// Check for the variation className or explicit priorityNavEnabled attribute.
		const className = attributes.className || '';
		const isPriorityNavVariation =
			className.includes('is-style-priority-plus-navigation') ||
			attributes.priorityNavEnabled === true;

		// If not using the variation, return the block edit without our controls.
		if (!isPriorityNavVariation) {
			return <BlockEdit {...props} />;
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

		// State for dropdown customizer modal
		const [isDropdownCustomizerOpen, setIsDropdownCustomizerOpen] =
			useState(false);

		// Automatically change overlayMenu from 'always' to 'mobile' when Priority+ is active
		useEffect(() => {
			if (isPriorityNavVariation && overlayMenu === 'always') {
				setAttributes({ overlayMenu: 'mobile' });
			}
		}, [isPriorityNavVariation, overlayMenu, setAttributes]);

		// Store typography attribute values for preview
		useEffect(() => {
			if (!isPriorityNavVariation) {
				return;
			}

			// Store fontSize and fontFamily slug values directly from attributes
			// Also get fontWeight and fontStyle from style object
			const fontWeight = attributes.style?.typography?.fontWeight;
			const fontStyle = attributes.style?.typography?.fontStyle;

			console.log('Typography Capture - All Attributes:', attributes);
			console.log('Typography Capture - Source values:', {
				fontSize: attributes.fontSize,
				fontFamily: attributes.fontFamily,
				fontWeight,
				fontStyle,
			});
			console.log('Typography Capture - Currently stored values:', {
				priorityNavTypographyFontFamily: attributes.priorityNavTypographyFontFamily,
				priorityNavTypographyFontSize: attributes.priorityNavTypographyFontSize,
				priorityNavTypographyFontWeight: attributes.priorityNavTypographyFontWeight,
				priorityNavTypographyFontStyle: attributes.priorityNavTypographyFontStyle,
			});

			// Only update if values have changed to avoid infinite loops
			if (
				attributes.fontSize !== attributes.priorityNavTypographyFontSize ||
				attributes.fontFamily !== attributes.priorityNavTypographyFontFamily ||
				fontWeight !== attributes.priorityNavTypographyFontWeight ||
				fontStyle !== attributes.priorityNavTypographyFontStyle
			) {
				console.log('Typography Capture - Updating stored values');
				setAttributes({
					priorityNavTypographyFontFamily: attributes.fontFamily,
					priorityNavTypographyFontSize: attributes.fontSize,
					priorityNavTypographyFontWeight: fontWeight,
					priorityNavTypographyFontStyle: fontStyle,
				});
			}
		}, [
			isPriorityNavVariation,
			attributes.fontSize,
			attributes.fontFamily,
			attributes.style?.typography?.fontWeight,
			attributes.style?.typography?.fontStyle,
			attributes.priorityNavTypographyFontFamily,
			attributes.priorityNavTypographyFontSize,
			attributes.priorityNavTypographyFontWeight,
			attributes.priorityNavTypographyFontStyle,
			setAttributes,
		]);

		// Get spacing sizes from theme.
		const spacingSizes = useSetting('spacing.spacingSizes') || [];

		// Helper to check if padding has values.
		const hasPaddingValue = () => {
			if (!priorityNavMorePadding) {
				return false;
			}
			return Object.keys(priorityNavMorePadding).length > 0;
		};

		return (
			<>
				<BlockEdit {...props} />

				<InspectorControls group="settings">
					<Notice status="info" isDismissible={false}>
						{__(
							'Priority Plus Navigation is not compatible with "Always" overlay menu. The overlay menu is set to "Mobile" to allow Priority+ to work on desktop.',
							'priority-plus-navigation'
						)}
					</Notice>
				</InspectorControls>

				<InspectorControls group="styles">
					<ToolsPanel
						label={__(
							'Priority Plus Settings',
							'priority-plus-navigation'
						)}
						resetAll={() =>
							setAttributes({
								priorityNavMoreLabel: 'More',
							})
						}
					>
						<ToolsPanelItem
							hasValue={() => !!priorityNavMoreLabel}
							label={__(
								'More Button Label',
								'priority-plus-navigation'
							)}
							onDeselect={() =>
								setAttributes({
									priorityNavMoreLabel: 'More',
								})
							}
							isShownByDefault
						>
							<TextControl
								label={__(
									'More Button Label',
									'priority-plus-navigation'
								)}
								value={priorityNavMoreLabel}
								onChange={(value) =>
									setAttributes({
										priorityNavMoreLabel: value,
									})
								}
								help={__(
									'Text displayed on the "More" button',
									'priority-plus-navigation'
								)}
							/>
						</ToolsPanelItem>
					</ToolsPanel>
					<PanelColorSettings
						title={__(
							'Priority Plus Colors',
							'priority-plus-navigation'
						)}
						colorSettings={[
							{
								label: __(
									'Button Text Color',
									'priority-plus-navigation'
								),
								value: priorityNavMoreTextColor,
								onChange: (color) =>
									setAttributes({
										priorityNavMoreTextColor:
											color || undefined,
									}),
								clearable: true,
							},
							{
								label: __(
									'Button Text Hover Color',
									'priority-plus-navigation'
								),
								value: priorityNavMoreTextColorHover,
								onChange: (color) =>
									setAttributes({
										priorityNavMoreTextColorHover:
											color || undefined,
									}),
								clearable: true,
							},
							{
								label: __(
									'Button Background Color',
									'priority-plus-navigation'
								),
								value: priorityNavMoreBackgroundColor,
								onChange: (color) =>
									setAttributes({
										priorityNavMoreBackgroundColor:
											color || undefined,
									}),
								clearable: true,
							},
							{
								label: __(
									'Button Background Hover Color',
									'priority-plus-navigation'
								),
								value: priorityNavMoreBackgroundColorHover,
								onChange: (color) =>
									setAttributes({
										priorityNavMoreBackgroundColorHover:
											color || undefined,
									}),
								clearable: true,
							},
						]}
					/>
					<ToolsPanel
						label={__(
							'Priority Plus Button',
							'priority-plus-navigation'
						)}
						resetAll={() =>
							setAttributes({
								priorityNavMorePadding: undefined,
							})
						}
					>
						<ToolsPanelItem
							hasValue={hasPaddingValue}
							label={__('Padding', 'priority-plus-navigation')}
							onDeselect={() =>
								setAttributes({
									priorityNavMorePadding: undefined,
								})
							}
							isShownByDefault
						>
							{spacingSizes.length > 0 ? (
								<SpacingSizesControl
									values={priorityNavMorePadding}
									onChange={(value) =>
										setAttributes({
											priorityNavMorePadding: value,
										})
									}
									label={__(
										'Button Padding',
										'priority-plus-navigation'
									)}
									sides={['top', 'right', 'bottom', 'left']}
									units={['px', 'em', 'rem', 'vh', 'vw']}
								/>
							) : (
								<BoxControl
									label={__(
										'Button Padding',
										'priority-plus-navigation'
									)}
									values={priorityNavMorePadding}
									onChange={(value) =>
										setAttributes({
											priorityNavMorePadding: value,
										})
									}
									sides={['top', 'right', 'bottom', 'left']}
									units={['px', 'em', 'rem', 'vh', 'vw']}
									allowReset={true}
								/>
							)}
						</ToolsPanelItem>
					</ToolsPanel>
					<ToolsPanel
						label={__(
							'Dropdown Styles',
							'priority-plus-navigation'
						)}
						resetAll={() => {
							setAttributes({
								priorityNavDropdownStyles:
									DEFAULT_DROPDOWN_STYLES,
							});
						}}
					>
						<ToolsPanelItem
							hasValue={() => {
								const { priorityNavDropdownStyles } =
									attributes;
								return (
									!!priorityNavDropdownStyles &&
									Object.keys(priorityNavDropdownStyles)
										.length > 0
								);
							}}
							label={__(
								'Customize Dropdown',
								'priority-plus-navigation'
							)}
							onDeselect={() =>
								setAttributes({
									priorityNavDropdownStyles: undefined,
								})
							}
							isShownByDefault
						>
							<Button
								variant="secondary"
								onClick={() =>
									setIsDropdownCustomizerOpen(true)
								}
								style={{ width: '100%' }}
							>
								{__(
									'Customize Dropdown Styles',
									'priority-plus-navigation'
								)}
							</Button>
						</ToolsPanelItem>
					</ToolsPanel>
				</InspectorControls>

				{/* Render modal conditionally */}
				{isDropdownCustomizerOpen && (
					<DropdownCustomizerModal
						attributes={attributes}
						setAttributes={setAttributes}
						onClose={() => setIsDropdownCustomizerOpen(false)}
					/>
				)}
			</>
		);
	};
}, 'withPriorityNavControls');

// Apply filters in order: first add DOM manipulation for styling, then our controls
addFilter(
	'editor.BlockEdit',
	'priority-plus-navigation/add-disable-always-option',
	addDisableAlwaysOption,
	5
);

addFilter(
	'editor.BlockEdit',
	'priority-plus-navigation/add-priority-plus-navigation-controls',
	withPriorityNavControls,
	10
);
