/**
 * WordPress dependencies
 */
import {
	ComboboxControl,
	__experimentalBorderBoxControl as BorderBoxControl,
	__experimentalToolsPanel as ToolsPanel,
	__experimentalToolsPanelItem as ToolsPanelItem,
} from '@wordpress/components';
import {
	useSetting,
	__experimentalBorderRadiusControl as BorderRadiusControl,
} from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';
import { useMemo, useState } from '@wordpress/element';

/**
 * Internal dependencies
 */
import {
	DEFAULT_DROPDOWN_BORDER,
	DEFAULT_DROPDOWN_BORDER_RADIUS,
	DEFAULT_DROPDOWN_BOX_SHADOW,
} from '../../constants';

/**
 * Check if border has a value (handles both flat and per-side formats)
 *
 * @param {Object} border - The border value (flat or per-side)
 * @return {boolean} Whether border has a value
 */
function hasBorderBoxValue(border) {
	if (!border) {
		return false;
	}

	// Check for flat border format (color, width, style at top level)
	if (border.color || border.width || border.style) {
		return true;
	}

	// Check for per-side format (top, right, bottom, left)
	const sides = ['top', 'right', 'bottom', 'left'];
	return sides.some((side) => {
		const sideBorder = border[side];
		return (
			sideBorder &&
			(sideBorder.color || sideBorder.width || sideBorder.style)
		);
	});
}

/**
 * Check if border radius has a value (handles both string and object formats)
 *
 * @param {string|Object} borderRadius - The border radius value
 * @return {boolean} Whether border radius has a value
 */
function hasBorderRadiusValue(borderRadius) {
	if (!borderRadius) {
		return false;
	}
	// Handle string format (e.g., '4px')
	if (typeof borderRadius === 'string') {
		return borderRadius !== '';
	}
	// Handle object format (per-corner values)
	if (typeof borderRadius === 'object') {
		return Object.values(borderRadius).some(
			(value) => value && value !== ''
		);
	}
	return false;
}

/**
 * ShadowPresetPicker Component
 *
 * A combobox picker for selecting shadow presets from the theme.
 * Falls back to a "None" option and a default shadow if no theme presets exist.
 *
 * @param {Object}   props          - Component props
 * @param {string}   props.value    - Current shadow value
 * @param {Function} props.onChange - Callback when shadow changes
 * @return {JSX.Element} Shadow preset picker component
 */
function ShadowPresetPicker({ value, onChange }) {
	// Get shadow presets from theme settings
	const themeShadows = useSetting('shadow.presets.theme') || [];
	const defaultShadows = useSetting('shadow.presets.default') || [];

	// Build options for ComboboxControl (requires value/label format)
	const shadowOptions = useMemo(() => {
		const options = [
			{
				value: 'none',
				label: __('None', 'priority-plus-navigation'),
			},
			{
				value: DEFAULT_DROPDOWN_BOX_SHADOW,
				label: __('Default', 'priority-plus-navigation'),
			},
		];

		// Add theme shadows first (they take priority)
		if (themeShadows.length > 0) {
			themeShadows.forEach((preset) => {
				options.push({
					value: preset.shadow,
					label: preset.name,
				});
			});
		}

		// Add default WordPress shadows
		if (defaultShadows.length > 0) {
			defaultShadows.forEach((preset) => {
				options.push({
					value: preset.shadow,
					label: preset.name,
				});
			});
		}

		return options;
	}, [themeShadows, defaultShadows]);

	// State for filtering options
	const [filteredOptions, setFilteredOptions] = useState(shadowOptions);

	// Handle filter changes for search functionality
	const handleFilterChange = (inputValue) => {
		if (!inputValue) {
			setFilteredOptions(shadowOptions);
			return;
		}
		const lowerInput = inputValue.toLowerCase();
		setFilteredOptions(
			shadowOptions.filter((option) =>
				option.label.toLowerCase().includes(lowerInput)
			)
		);
	};

	// Handle selection - ComboboxControl passes the value directly
	const handleChange = (newValue) => {
		onChange(newValue);
	};

	return (
		<ComboboxControl
			__next40pxDefaultSize
			__nextHasNoMarginBottom
			label={__('Shadow', 'priority-plus-navigation')}
			value={value}
			onChange={handleChange}
			options={filteredOptions}
			onFilterValueChange={handleFilterChange}
		/>
	);
}

/**
 * MenuStylesPanel Component
 *
 * Provides controls for dropdown container styles (border, radius, shadow).
 *
 * @param {Object}   props               - Component props
 * @param {Object}   props.attributes    - Block attributes
 * @param {Function} props.setAttributes - Function to update attributes
 * @return {JSX.Element} Menu styles panel component
 */
export function MenuStylesPanel({ attributes, setAttributes }) {
	const {
		priorityNavDropdownBorder,
		priorityNavDropdownBorderRadius,
		priorityNavDropdownBoxShadow,
	} = attributes;

	// Get color palette from theme settings
	const colors = useSetting('color.palette') || [];

	return (
		<ToolsPanel
			label={__('Priority Plus Menu Styles', 'priority-plus-navigation')}
			resetAll={() => {
				setAttributes({
					priorityNavDropdownBorder: DEFAULT_DROPDOWN_BORDER,
					priorityNavDropdownBorderRadius:
						DEFAULT_DROPDOWN_BORDER_RADIUS,
					priorityNavDropdownBoxShadow: DEFAULT_DROPDOWN_BOX_SHADOW,
				});
			}}
		>
			{/* Border */}
			<ToolsPanelItem
				hasValue={() => hasBorderBoxValue(priorityNavDropdownBorder)}
				label={__('Border', 'priority-plus-navigation')}
				onDeselect={() =>
					setAttributes({
						priorityNavDropdownBorder: DEFAULT_DROPDOWN_BORDER,
					})
				}
				isShownByDefault
			>
				<BorderBoxControl
					label={__('Border', 'priority-plus-navigation')}
					colors={colors}
					value={priorityNavDropdownBorder}
					onChange={(newBorder) =>
						setAttributes({ priorityNavDropdownBorder: newBorder })
					}
					enableAlpha={true}
					enableStyle={true}
					size="__unstable-large"
				/>
			</ToolsPanelItem>

			{/* Border Radius */}
			<ToolsPanelItem
				hasValue={() =>
					hasBorderRadiusValue(priorityNavDropdownBorderRadius)
				}
				label={__('Border Radius', 'priority-plus-navigation')}
				onDeselect={() =>
					setAttributes({
						priorityNavDropdownBorderRadius:
							DEFAULT_DROPDOWN_BORDER_RADIUS,
					})
				}
				isShownByDefault
			>
				<BorderRadiusControl
					values={priorityNavDropdownBorderRadius}
					onChange={(value) =>
						setAttributes({ priorityNavDropdownBorderRadius: value })
					}
				/>
			</ToolsPanelItem>

			{/* Box Shadow */}
			<ToolsPanelItem
				hasValue={() => !!priorityNavDropdownBoxShadow}
				label={__('Shadow', 'priority-plus-navigation')}
				onDeselect={() =>
					setAttributes({
						priorityNavDropdownBoxShadow: DEFAULT_DROPDOWN_BOX_SHADOW,
					})
				}
				isShownByDefault
			>
				<ShadowPresetPicker
					value={priorityNavDropdownBoxShadow || DEFAULT_DROPDOWN_BOX_SHADOW}
					onChange={(value) =>
						setAttributes({ priorityNavDropdownBoxShadow: value })
					}
				/>
			</ToolsPanelItem>
		</ToolsPanel>
	);
}
