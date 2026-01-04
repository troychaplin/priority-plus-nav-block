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
 * Default shadow value used when no shadow is selected
 */
const DEFAULT_SHADOW = '0 4px 12px rgba(0, 0, 0, 0.15)';

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
				value: DEFAULT_SHADOW,
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
 * @param {Object}   props                - Component props
 * @param {Object}   props.styles         - Current dropdown styles
 * @param {Function} props.updateStyle    - Function to update a style property
 * @param {Function} props.hasBorderValue - Function to check if border has a value
 * @param {Function} props.hasValue       - Function to check if a property has a value
 * @param {Function} props.resetToDefault - Function to reset a property to default
 * @return {JSX.Element} Menu styles panel component
 */
export function MenuStylesPanel({
	styles,
	updateStyle,
	hasBorderValue,
	hasValue,
	resetToDefault,
}) {
	// Get color palette from theme settings
	const colors = useSetting('color.palette') || [];

	// Handle border changes from BorderBoxControl
	// The control passes either a flat border or per-side borders
	const handleBorderChange = (newBorder) => {
		// Store the entire border object directly
		// It can be: undefined, flat { color, width, style }, or per-side { top, right, bottom, left }
		updateStyle('border', newBorder);
	};

	return (
		<ToolsPanel
			label={__('Priority Plus Menu Styles', 'priority-plus-navigation')}
			resetAll={() => {
				updateStyle('border', undefined);
				updateStyle('borderRadius', undefined);
				updateStyle('boxShadow', DEFAULT_SHADOW);
			}}
		>
			{/* Border */}
			<ToolsPanelItem
				hasValue={() => hasBorderBoxValue(styles.border)}
				label={__('Border', 'priority-plus-navigation')}
				onDeselect={() => {
					updateStyle('border', undefined);
				}}
				isShownByDefault
			>
				<BorderBoxControl
					label={__('Border', 'priority-plus-navigation')}
					colors={colors}
					value={styles.border}
					onChange={handleBorderChange}
					enableAlpha={true}
					enableStyle={true}
					size="__unstable-large"
				/>
			</ToolsPanelItem>

			{/* Border Radius */}
			<ToolsPanelItem
				hasValue={() => hasBorderRadiusValue(styles.borderRadius)}
				label={__('Border Radius', 'priority-plus-navigation')}
				onDeselect={() => resetToDefault('borderRadius', undefined)}
				isShownByDefault
			>
				<BorderRadiusControl
					values={styles.borderRadius}
					onChange={(value) => updateStyle('borderRadius', value)}
				/>
			</ToolsPanelItem>

			{/* Box Shadow */}
			<ToolsPanelItem
				hasValue={() => hasValue('boxShadow')}
				label={__('Shadow', 'priority-plus-navigation')}
				onDeselect={() => resetToDefault('boxShadow', DEFAULT_SHADOW)}
				isShownByDefault
			>
				<ShadowPresetPicker
					value={styles.boxShadow || DEFAULT_SHADOW}
					onChange={(value) => updateStyle('boxShadow', value)}
				/>
			</ToolsPanelItem>
		</ToolsPanel>
	);
}
