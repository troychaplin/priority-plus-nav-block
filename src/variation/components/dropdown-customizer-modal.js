/**
 * WordPress dependencies
 */
import {
	Modal,
	Button,
	ColorPicker,
	TextControl,
	__experimentalUnitControl as UnitControl,
	__experimentalBoxControl as BoxControl,
	__experimentalToolsPanel as ToolsPanel,
	__experimentalToolsPanelItem as ToolsPanelItem,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import './dropdown-customizer-modal.scss';
import { DropdownPreview } from './dropdown-preview';

/**
 * Parse spacing value string to BoxControl format
 * e.g., "0.75rem 1.25rem" -> { top: '0.75rem', right: '1.25rem', bottom: '0.75rem', left: '1.25rem' }
 */
function parseSpacingValue(value) {
	if (!value || typeof value !== 'string') {
		return { top: '0', right: '0', bottom: '0', left: '0' };
	}

	const parts = value.trim().split(/\s+/);

	if (parts.length === 1) {
		return {
			top: parts[0],
			right: parts[0],
			bottom: parts[0],
			left: parts[0],
		};
	} else if (parts.length === 2) {
		return {
			top: parts[0],
			right: parts[1],
			bottom: parts[0],
			left: parts[1],
		};
	} else if (parts.length === 3) {
		return {
			top: parts[0],
			right: parts[1],
			bottom: parts[2],
			left: parts[1],
		};
	} else if (parts.length === 4) {
		return {
			top: parts[0],
			right: parts[1],
			bottom: parts[2],
			left: parts[3],
		};
	}

	return { top: '0', right: '0', bottom: '0', left: '0' };
}

/**
 * Format BoxControl value to spacing string
 * e.g., { top: '0.75rem', right: '1.25rem', bottom: '0.75rem', left: '1.25rem' } -> "0.75rem 1.25rem"
 */
function formatSpacingValue(values) {
	if (!values) {
		return '';
	}

	const { top = '0', right = '0', bottom = '0', left = '0' } = values;

	// All same
	if (top === right && right === bottom && bottom === left) {
		return top;
	}

	// Top/bottom same, left/right same
	if (top === bottom && right === left) {
		return `${top} ${right}`;
	}

	// All different
	return `${top} ${right} ${bottom} ${left}`;
}

export function DropdownCustomizerModal({
	attributes,
	setAttributes,
	onClose,
}) {
	const { priorityNavDropdownStyles = {} } = attributes;

	// Helper to update a single style property
	const updateStyle = (key, value) => {
		setAttributes({
			priorityNavDropdownStyles: {
				...priorityNavDropdownStyles,
				[key]: value,
			},
		});
	};

	// Helper to check if a property has a value
	const hasValue = (key) => {
		return !!priorityNavDropdownStyles[key];
	};

	// Helper to reset a property to default
	const resetToDefault = (key, defaultValue) => {
		updateStyle(key, defaultValue);
	};

	return (
		<Modal
			title={__('Customize Dropdown Styles', 'priority-plus-navigation')}
			onRequestClose={onClose}
			className="priority-plus-dropdown-customizer"
			size="fill"
			isDismissible={true}
		>
			<div className="dropdown-customizer-layout">
				<div className="dropdown-customizer-controls">
					{/* DROPDOWN CONTAINER STYLES */}
					<ToolsPanel
						label={__(
							'Dropdown Container',
							'priority-plus-navigation'
						)}
						resetAll={() => {
							updateStyle('backgroundColor', '#ffffff');
							updateStyle('borderColor', '#dddddd');
							updateStyle('borderWidth', '1px');
							updateStyle('borderRadius', '4px');
							updateStyle(
								'boxShadow',
								'0 4px 12px rgba(0, 0, 0, 0.15)'
							);
						}}
					>
						{/* Background Color */}
						<ToolsPanelItem
							hasValue={() => hasValue('backgroundColor')}
							label={__(
								'Background Color',
								'priority-plus-navigation'
							)}
							onDeselect={() =>
								resetToDefault('backgroundColor', '#ffffff')
							}
							isShownByDefault
						>
							<div className="dropdown-customizer-control">
								<label>
									{__(
										'Background Color',
										'priority-plus-navigation'
									)}
								</label>
								<ColorPicker
									color={
										priorityNavDropdownStyles.backgroundColor ||
										'#ffffff'
									}
									onChange={(value) =>
										updateStyle('backgroundColor', value)
									}
									enableAlpha
								/>
							</div>
						</ToolsPanelItem>

						{/* Border Color */}
						<ToolsPanelItem
							hasValue={() => hasValue('borderColor')}
							label={__(
								'Border Color',
								'priority-plus-navigation'
							)}
							onDeselect={() =>
								resetToDefault('borderColor', '#dddddd')
							}
							isShownByDefault
						>
							<div className="dropdown-customizer-control">
								<label>
									{__(
										'Border Color',
										'priority-plus-navigation'
									)}
								</label>
								<ColorPicker
									color={
										priorityNavDropdownStyles.borderColor ||
										'#dddddd'
									}
									onChange={(value) =>
										updateStyle('borderColor', value)
									}
									enableAlpha
								/>
							</div>
						</ToolsPanelItem>

						{/* Border Width */}
						<ToolsPanelItem
							hasValue={() => hasValue('borderWidth')}
							label={__(
								'Border Width',
								'priority-plus-navigation'
							)}
							onDeselect={() =>
								resetToDefault('borderWidth', '1px')
							}
							isShownByDefault
						>
							<UnitControl
								label={__(
									'Border Width',
									'priority-plus-navigation'
								)}
								value={
									priorityNavDropdownStyles.borderWidth ||
									'1px'
								}
								onChange={(value) =>
									updateStyle('borderWidth', value)
								}
								units={[
									{ value: 'px', label: 'px' },
									{ value: 'rem', label: 'rem' },
									{ value: 'em', label: 'em' },
								]}
							/>
						</ToolsPanelItem>

						{/* Border Radius */}
						<ToolsPanelItem
							hasValue={() => hasValue('borderRadius')}
							label={__(
								'Border Radius',
								'priority-plus-navigation'
							)}
							onDeselect={() =>
								resetToDefault('borderRadius', '4px')
							}
							isShownByDefault
						>
							<UnitControl
								label={__(
									'Border Radius',
									'priority-plus-navigation'
								)}
								value={
									priorityNavDropdownStyles.borderRadius ||
									'4px'
								}
								onChange={(value) =>
									updateStyle('borderRadius', value)
								}
								units={[
									{ value: 'px', label: 'px' },
									{ value: 'rem', label: 'rem' },
									{ value: '%', label: '%' },
								]}
							/>
						</ToolsPanelItem>

						{/* Box Shadow */}
						<ToolsPanelItem
							hasValue={() => hasValue('boxShadow')}
							label={__('Box Shadow', 'priority-plus-navigation')}
							onDeselect={() =>
								resetToDefault(
									'boxShadow',
									'0 4px 12px rgba(0, 0, 0, 0.15)'
								)
							}
							isShownByDefault
						>
							<TextControl
								label={__(
									'Box Shadow',
									'priority-plus-navigation'
								)}
								value={
									priorityNavDropdownStyles.boxShadow ||
									'0 4px 12px rgba(0, 0, 0, 0.15)'
								}
								onChange={(value) =>
									updateStyle('boxShadow', value)
								}
								help={__(
									'CSS box-shadow property',
									'priority-plus-navigation'
								)}
							/>
						</ToolsPanelItem>
					</ToolsPanel>

					{/* DROPDOWN ITEM STYLES */}
					<ToolsPanel
						label={__('Dropdown Items', 'priority-plus-navigation')}
						resetAll={() => {
							updateStyle('itemSpacing', '0.75rem 1.25rem');
							updateStyle(
								'itemHoverBackgroundColor',
								'rgba(0, 0, 0, 0.05)'
							);
							updateStyle('itemHoverTextColor', 'inherit');
							updateStyle('multiLevelIndent', '1.25rem');
						}}
					>
						{/* Item Spacing */}
						<ToolsPanelItem
							hasValue={() => hasValue('itemSpacing')}
							label={__(
								'Item Spacing',
								'priority-plus-navigation'
							)}
							onDeselect={() =>
								resetToDefault('itemSpacing', '0.75rem 1.25rem')
							}
							isShownByDefault
						>
							<BoxControl
								label={__(
									'Item Spacing (Padding)',
									'priority-plus-navigation'
								)}
								values={parseSpacingValue(
									priorityNavDropdownStyles.itemSpacing ||
										'0.75rem 1.25rem'
								)}
								onChange={(value) =>
									updateStyle(
										'itemSpacing',
										formatSpacingValue(value)
									)
								}
								sides={['top', 'right', 'bottom', 'left']}
								units={[
									{ value: 'px', label: 'px' },
									{ value: 'rem', label: 'rem' },
									{ value: 'em', label: 'em' },
								]}
							/>
						</ToolsPanelItem>

						{/* Item Hover Background Color */}
						<ToolsPanelItem
							hasValue={() =>
								hasValue('itemHoverBackgroundColor')
							}
							label={__(
								'Hover Background',
								'priority-plus-navigation'
							)}
							onDeselect={() =>
								resetToDefault(
									'itemHoverBackgroundColor',
									'rgba(0, 0, 0, 0.05)'
								)
							}
							isShownByDefault
						>
							<div className="dropdown-customizer-control">
								<label>
									{__(
										'Hover Background Color',
										'priority-plus-navigation'
									)}
								</label>
								<ColorPicker
									color={
										priorityNavDropdownStyles.itemHoverBackgroundColor ||
										'rgba(0, 0, 0, 0.05)'
									}
									onChange={(value) =>
										updateStyle(
											'itemHoverBackgroundColor',
											value
										)
									}
									enableAlpha
								/>
							</div>
						</ToolsPanelItem>

						{/* Item Hover Text Color */}
						<ToolsPanelItem
							hasValue={() => hasValue('itemHoverTextColor')}
							label={__(
								'Hover Text Color',
								'priority-plus-navigation'
							)}
							onDeselect={() =>
								resetToDefault('itemHoverTextColor', 'inherit')
							}
						>
							<div className="dropdown-customizer-control">
								<label>
									{__(
										'Hover Text Color',
										'priority-plus-navigation'
									)}
								</label>
								<ColorPicker
									color={
										priorityNavDropdownStyles.itemHoverTextColor ||
										'inherit'
									}
									onChange={(value) =>
										updateStyle('itemHoverTextColor', value)
									}
									enableAlpha
								/>
							</div>
						</ToolsPanelItem>

						{/* Multi-level Indent */}
						<ToolsPanelItem
							hasValue={() => hasValue('multiLevelIndent')}
							label={__(
								'Multi-level Indent',
								'priority-plus-navigation'
							)}
							onDeselect={() =>
								resetToDefault('multiLevelIndent', '1.25rem')
							}
							isShownByDefault
						>
							<UnitControl
								label={__(
									'Multi-level Indent',
									'priority-plus-navigation'
								)}
								value={
									priorityNavDropdownStyles.multiLevelIndent ||
									'1.25rem'
								}
								onChange={(value) =>
									updateStyle('multiLevelIndent', value)
								}
								help={__(
									'Indentation for nested submenu items',
									'priority-plus-navigation'
								)}
								units={[
									{ value: 'px', label: 'px' },
									{ value: 'rem', label: 'rem' },
									{ value: 'em', label: 'em' },
								]}
							/>
						</ToolsPanelItem>
					</ToolsPanel>
				</div>

				<div className="dropdown-customizer-preview">
					<DropdownPreview dropdownStyles={priorityNavDropdownStyles} />
				</div>
			</div>

			<div className="dropdown-customizer-footer">
				<Button
					variant="tertiary"
					isDestructive
					onClick={() => {
						setAttributes({
							priorityNavDropdownStyles: {
								backgroundColor: '#ffffff',
								borderColor: '#dddddd',
								borderWidth: '1px',
								borderRadius: '4px',
								boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
								itemSpacing: '0.75rem 1.25rem',
								itemHoverBackgroundColor:
									'rgba(0, 0, 0, 0.05)',
								itemHoverTextColor: 'inherit',
								multiLevelIndent: '1.25rem',
							},
						});
					}}
				>
					{__('Reset to Defaults', 'priority-plus-navigation')}
				</Button>

				<Button variant="primary" onClick={onClose}>
					{__('Done', 'priority-plus-navigation')}
				</Button>
			</div>
		</Modal>
	);
}
