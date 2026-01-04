/**
 * WordPress dependencies
 */
import {
	TextControl,
	__experimentalBorderControl as BorderControl,
	__experimentalToolsPanel as ToolsPanel,
	__experimentalToolsPanelItem as ToolsPanelItem,
} from '@wordpress/components';
import {
	useSetting,
	__experimentalBorderRadiusControl as BorderRadiusControl,
} from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';

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

	// Convert individual border properties to BorderControl format
	const borderValue = {
		color: styles.borderColor,
		style: styles.borderStyle || 'solid',
		width: styles.borderWidth,
	};

	// Handle border changes from BorderControl
	const handleBorderChange = (newBorder) => {
		const updates = {};

		// Handle undefined/cleared border
		if (newBorder === undefined) {
			updates.borderColor = undefined;
			updates.borderWidth = undefined;
			updates.borderStyle = undefined;
		} else {
			if (newBorder.color !== undefined) {
				updates.borderColor = newBorder.color;
			}
			if (newBorder.width !== undefined) {
				updates.borderWidth = newBorder.width;
			}
			if (newBorder.style !== undefined) {
				updates.borderStyle = newBorder.style;
			}
		}

		// Update all border properties at once
		if (Object.keys(updates).length > 0) {
			updateStyle('border', updates);
		}
	};

	return (
		<ToolsPanel
			label={__('Dropdown Menu Styles', 'priority-plus-navigation')}
			resetAll={() => {
				updateStyle('borderColor', '#dddddd');
				updateStyle('borderWidth', '1px');
				updateStyle('borderRadius', undefined);
				updateStyle('boxShadow', '0 4px 12px rgba(0, 0, 0, 0.15)');
			}}
		>
			{/* Border */}
			<ToolsPanelItem
				hasValue={hasBorderValue}
				label={__('Border', 'priority-plus-navigation')}
				onDeselect={() => {
					resetToDefault('borderColor', '#dddddd');
					resetToDefault('borderWidth', '1px');
					resetToDefault('borderStyle', 'solid');
				}}
				isShownByDefault
			>
				<BorderControl
					label={__('Border', 'priority-plus-navigation')}
					colors={colors}
					value={borderValue}
					onChange={handleBorderChange}
					enableAlpha={true}
					enableStyle={true}
					size="__unstable-large"
					withSlider={true}
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
					label={__('Box Shadow', 'priority-plus-navigation')}
					value={styles.boxShadow || '0 4px 12px rgba(0, 0, 0, 0.15)'}
					onChange={(value) => updateStyle('boxShadow', value)}
					help={__(
						'CSS box-shadow property',
						'priority-plus-navigation'
					)}
				/>
			</ToolsPanelItem>
		</ToolsPanel>
	);
}
