/**
 * WordPress dependencies
 */
import { Modal, Button } from '@wordpress/components';
import { useSetting } from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';
import { useEffect } from '@wordpress/element';

/**
 * Internal dependencies
 */
import './modal.scss';
import { DropdownPreview } from './dropdown-preview';
import { ColorPanel } from './panels/color-panel';
import { MenuStylesPanel } from './panels/menu-styles-panel';
import { MenuSpacingPanel } from './panels/menu-spacing-panel';
import { DEFAULT_DROPDOWN_STYLES } from '../constants';

export function DropdownCustomizerModal({
	attributes,
	setAttributes,
	onClose,
}) {
	// Always get the latest dropdown styles from attributes
	// This ensures the preview updates immediately when styles change
	const priorityNavDropdownStyles = {
		...DEFAULT_DROPDOWN_STYLES,
		...(attributes.priorityNavDropdownStyles || {}),
		// If itemSpacing exists but is empty/undefined, use default
		itemSpacing:
			attributes.priorityNavDropdownStyles?.itemSpacing ||
			DEFAULT_DROPDOWN_STYLES.itemSpacing,
	};

	// Get typography settings from theme to convert slugs to values
	const fontSizes = useSetting('typography.fontSizes') || [];
	const fontFamilies = useSetting('typography.fontFamilies') || [];

	// Convert typography slugs to actual CSS values
	const typographyStyles = {};

	// Convert fontFamily slug to actual font-family value
	if (attributes.priorityNavTypographyFontFamily) {
		// Handle different fontFamilies structures
		let allFontFamilies = [];

		// Handle object structure with theme/custom properties
		if (
			fontFamilies &&
			typeof fontFamilies === 'object' &&
			!Array.isArray(fontFamilies)
		) {
			if (fontFamilies.theme && Array.isArray(fontFamilies.theme)) {
				allFontFamilies = allFontFamilies.concat(fontFamilies.theme);
			}
			if (fontFamilies.custom && Array.isArray(fontFamilies.custom)) {
				allFontFamilies = allFontFamilies.concat(fontFamilies.custom);
			}
		}
		// Handle flat array structure
		else if (Array.isArray(fontFamilies)) {
			fontFamilies.forEach((item) => {
				if (item.fontFamilies && Array.isArray(item.fontFamilies)) {
					allFontFamilies = allFontFamilies.concat(item.fontFamilies);
				} else if (item.slug && item.fontFamily) {
					allFontFamilies.push(item);
				}
			});
		}

		const fontFamilyPreset = allFontFamilies.find(
			(font) => font.slug === attributes.priorityNavTypographyFontFamily
		);

		if (fontFamilyPreset) {
			typographyStyles.fontFamily = fontFamilyPreset.fontFamily;
		}
	}

	// Convert fontSize slug to actual font-size value
	if (attributes.priorityNavTypographyFontSize) {
		// Handle different fontSize structures
		let allFontSizes = [];
		if (Array.isArray(fontSizes)) {
			fontSizes.forEach((item) => {
				if (item.sizes && Array.isArray(item.sizes)) {
					allFontSizes = allFontSizes.concat(item.sizes);
				} else if (item.slug && item.size) {
					allFontSizes.push(item);
				}
			});
		}

		const fontSizePreset = allFontSizes.find(
			(size) => size.slug === attributes.priorityNavTypographyFontSize
		);
		if (fontSizePreset) {
			typographyStyles.fontSize = fontSizePreset.size;
		}
	}

	// Use direct values from style object for fontWeight and fontStyle
	if (attributes.priorityNavTypographyFontWeight) {
		typographyStyles.fontWeight =
			attributes.priorityNavTypographyFontWeight;
	}
	if (attributes.priorityNavTypographyFontStyle) {
		typographyStyles.fontStyle = attributes.priorityNavTypographyFontStyle;
	}

	// Get spacing sizes from theme
	const spacingSizes = useSetting('spacing.spacingSizes') || [];

	// Initialize defaults on mount if missing
	useEffect(() => {
		// Check if we need to set defaults
		if (!attributes.priorityNavDropdownStyles?.itemSpacing) {
			setAttributes({
				priorityNavDropdownStyles: {
					...DEFAULT_DROPDOWN_STYLES,
					...(attributes.priorityNavDropdownStyles || {}),
				},
			});
		}
	}, []); // Only run on mount

	// Helper to update style properties (single or multiple)
	const updateStyle = (key, value) => {
		// Always get the latest styles from attributes to avoid stale closure
		const currentStyles = {
			...DEFAULT_DROPDOWN_STYLES,
			...(attributes.priorityNavDropdownStyles || {}),
		};

		// Store the value directly under the key
		const newStyles = { ...currentStyles, [key]: value };

		setAttributes({
			priorityNavDropdownStyles: newStyles,
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

	// Helper to check if item spacing has values
	const hasItemSpacingValue = () => {
		if (!priorityNavDropdownStyles.itemSpacing) {
			return false;
		}
		// Check if it's an object (SpacingSizesControl format) or string (legacy format)
		if (typeof priorityNavDropdownStyles.itemSpacing === 'object') {
			// Check if object has any non-empty values
			const values = Object.values(priorityNavDropdownStyles.itemSpacing);
			return values.some((value) => value && value !== '');
		}
		return !!priorityNavDropdownStyles.itemSpacing;
	};

	// Helper to check if border has values (handles both flat and per-side formats)
	const hasBorderValue = () => {
		const border = priorityNavDropdownStyles.border;
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
	};

	return (
		<Modal
			title={__('Customize Dropdown Styles', 'priority-plus-navigation')}
			onRequestClose={onClose}
			className="priority-plus-dropdown-customizer"
			size="large"
			isDismissible={true}
		>
			<div className="dropdown-customizer-layout">
				<div className="dropdown-customizer-controls">
					<ColorPanel
						styles={priorityNavDropdownStyles}
						updateStyle={updateStyle}
					/>

					<MenuStylesPanel
						styles={priorityNavDropdownStyles}
						updateStyle={updateStyle}
						hasBorderValue={hasBorderValue}
						hasValue={hasValue}
						resetToDefault={resetToDefault}
					/>

					<MenuSpacingPanel
						styles={priorityNavDropdownStyles}
						spacingSizes={spacingSizes}
						updateStyle={updateStyle}
						hasValue={hasValue}
						hasItemSpacingValue={hasItemSpacingValue}
					/>
				</div>

				<div className="dropdown-customizer-preview">
					<DropdownPreview
						dropdownStyles={priorityNavDropdownStyles}
						typographyStyles={typographyStyles}
					/>
				</div>
			</div>

			<div className="dropdown-customizer-footer">
				<Button
					variant="tertiary"
					isDestructive
					onClick={() => {
						setAttributes({
							priorityNavDropdownStyles: DEFAULT_DROPDOWN_STYLES,
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
