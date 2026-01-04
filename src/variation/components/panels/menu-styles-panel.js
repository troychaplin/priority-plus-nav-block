/**
 * WordPress dependencies
 */
import {
	BaseControl,
	Button,
	Dropdown,
	FlexItem,
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	__experimentalBorderBoxControl as BorderBoxControl,
	__experimentalToolsPanel as ToolsPanel,
	__experimentalToolsPanelItem as ToolsPanelItem,
} from '@wordpress/components';
import {
	useSetting,
	__experimentalBorderRadiusControl as BorderRadiusControl,
} from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';
import { useMemo } from '@wordpress/element';

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
 * A dropdown picker for selecting shadow presets from the theme.
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

	// Combine shadow presets with built-in options
	const shadowOptions = useMemo(() => {
		const options = [
			{
				name: __('None', 'priority-plus-navigation'),
				slug: 'none',
				shadow: 'none',
			},
			{
				name: __('Default', 'priority-plus-navigation'),
				slug: 'default',
				shadow: DEFAULT_SHADOW,
			},
		];

		// Add theme shadows first (they take priority)
		if (themeShadows.length > 0) {
			themeShadows.forEach((preset) => {
				options.push({
					name: preset.name,
					slug: preset.slug,
					shadow: preset.shadow,
				});
			});
		}

		// Add default WordPress shadows
		if (defaultShadows.length > 0) {
			defaultShadows.forEach((preset) => {
				options.push({
					name: preset.name,
					slug: preset.slug,
					shadow: preset.shadow,
				});
			});
		}

		return options;
	}, [themeShadows, defaultShadows]);

	// Find the currently selected option
	const selectedOption = useMemo(() => {
		if (!value || value === 'none') {
			return shadowOptions.find((opt) => opt.slug === 'none');
		}
		// Try to find by exact shadow value match
		const match = shadowOptions.find((opt) => opt.shadow === value);
		if (match) {
			return match;
		}
		// If no match, it's a custom value - show as "Custom"
		return {
			name: __('Custom', 'priority-plus-navigation'),
			slug: 'custom',
			shadow: value,
		};
	}, [value, shadowOptions]);

	return (
		<BaseControl
			label={__('Shadow', 'priority-plus-navigation')}
			__nextHasNoMarginBottom
		>
			<Dropdown
				className="priority-plus-shadow-picker"
				contentClassName="priority-plus-shadow-picker__popover"
				popoverProps={{ placement: 'left-start', offset: 36 }}
				renderToggle={({ isOpen, onToggle }) => (
					<Button
						onClick={onToggle}
						aria-expanded={isOpen}
						className="priority-plus-shadow-picker__toggle"
					>
						<HStack justify="flex-start">
							<FlexItem
								className="priority-plus-shadow-picker__preview"
								style={{
									boxShadow:
										selectedOption?.shadow || 'none',
								}}
							/>
							<FlexItem>
								{selectedOption?.name ||
									__('Select shadow', 'priority-plus-navigation')}
							</FlexItem>
						</HStack>
					</Button>
				)}
				renderContent={({ onClose }) => (
					<VStack
						spacing={2}
						className="priority-plus-shadow-picker__options"
					>
						{shadowOptions.map((option) => (
							<Button
								key={option.slug}
								onClick={() => {
									onChange(option.shadow);
									onClose();
								}}
								className={`priority-plus-shadow-picker__option ${
									selectedOption?.slug === option.slug
										? 'is-selected'
										: ''
								}`}
							>
								<HStack justify="flex-start">
									<FlexItem
										className="priority-plus-shadow-picker__preview"
										style={{ boxShadow: option.shadow }}
									/>
									<FlexItem>{option.name}</FlexItem>
								</HStack>
							</Button>
						))}
					</VStack>
				)}
			/>
		</BaseControl>
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
			label={__('Dropdown Menu Styles', 'priority-plus-navigation')}
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
