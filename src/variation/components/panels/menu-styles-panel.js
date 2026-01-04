/**
 * WordPress dependencies
 */
import {
	TextControl,
	__experimentalBorderBoxControl as BorderBoxControl,
	__experimentalToolsPanel as ToolsPanel,
	__experimentalToolsPanelItem as ToolsPanelItem,
} from '@wordpress/components';
import { useSetting } from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';

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

	// Convert individual border properties to BorderBoxControl format
	const borderValue = {
		color: styles.borderColor,
		style: 'solid',
		width: styles.borderWidth,
	};

	// Handle border changes from BorderBoxControl
	const handleBorderChange = (newBorder) => {
		// BorderBoxControl passes the complete border object
		// We need to update both color and width in a single update to avoid race conditions
		if (newBorder !== undefined) {
			const updates = {};

			if (newBorder.color !== undefined) {
				updates.borderColor = newBorder.color;
			}
			if (newBorder.width !== undefined) {
				updates.borderWidth = newBorder.width;
			}

			// Update all border properties at once
			if (Object.keys(updates).length > 0) {
				updateStyle('border', updates);
			}
		}
	};

	return (
		<ToolsPanel
			label={__('Dropdown Menu Styles', 'priority-plus-navigation')}
			resetAll={() => {
				updateStyle('borderColor', '#dddddd');
				updateStyle('borderWidth', '1px');
				updateStyle('borderRadius', '4px');
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
				}}
				isShownByDefault
			>
				<BorderBoxControl
					label={__('Border', 'priority-plus-navigation')}
					colors={colors}
					value={borderValue}
					onChange={handleBorderChange}
					enableAlpha={true}
					enableStyle={false}
					size="__unstable-large"
					__experimentalHasMultipleOrigins={true}
					__experimentalIsRenderedInSidebar={true}
				/>
			</ToolsPanelItem>

			{/* Border Radius */}
			<ToolsPanelItem
				hasValue={() => hasValue('borderRadius')}
				label={__('Border Radius', 'priority-plus-navigation')}
				onDeselect={() => resetToDefault('borderRadius', '4px')}
				isShownByDefault
			>
				<BorderBoxControl
					label={__('Border Radius', 'priority-plus-navigation')}
					value={styles.borderRadius}
					onChange={(value) => updateStyle('borderRadius', value)}
					enableAlpha={false}
					enableStyle={false}
					size="__unstable-large"
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
