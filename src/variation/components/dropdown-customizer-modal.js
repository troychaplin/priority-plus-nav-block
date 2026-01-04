/**
 * WordPress dependencies
 */
import { Modal, Button } from '@wordpress/components';
import { useSetting } from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import './modal.scss';
import { DropdownPreview } from './dropdown-preview';
import { ColorPanel } from './panels/color-panel';
import { MenuStylesPanel } from './panels/menu-styles-panel';
import { MenuSpacingPanel } from './panels/menu-spacing-panel';
import {
	DEFAULT_DROPDOWN_BACKGROUND_COLOR,
	DEFAULT_DROPDOWN_BORDER,
	DEFAULT_DROPDOWN_BORDER_RADIUS,
	DEFAULT_DROPDOWN_BOX_SHADOW,
	DEFAULT_DROPDOWN_ITEM_SPACING,
	DEFAULT_DROPDOWN_ITEM_HOVER_BACKGROUND_COLOR,
	DEFAULT_DROPDOWN_ITEM_HOVER_TEXT_COLOR,
	DEFAULT_DROPDOWN_MULTI_LEVEL_INDENT,
} from '../constants';

export function DropdownCustomizerModal({
	attributes,
	setAttributes,
	onClose,
}) {
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

	// Reset all dropdown styles to defaults
	const resetAllToDefaults = () => {
		setAttributes({
			priorityNavDropdownBackgroundColor: DEFAULT_DROPDOWN_BACKGROUND_COLOR,
			priorityNavDropdownBorder: DEFAULT_DROPDOWN_BORDER,
			priorityNavDropdownBorderRadius: DEFAULT_DROPDOWN_BORDER_RADIUS,
			priorityNavDropdownBoxShadow: DEFAULT_DROPDOWN_BOX_SHADOW,
			priorityNavDropdownItemSpacing: DEFAULT_DROPDOWN_ITEM_SPACING,
			priorityNavDropdownItemHoverBackgroundColor:
				DEFAULT_DROPDOWN_ITEM_HOVER_BACKGROUND_COLOR,
			priorityNavDropdownItemHoverTextColor:
				DEFAULT_DROPDOWN_ITEM_HOVER_TEXT_COLOR,
			priorityNavDropdownMultiLevelIndent: DEFAULT_DROPDOWN_MULTI_LEVEL_INDENT,
		});
	};

	return (
		<Modal
			title={__(
				'Customize Priority Plus Dropdown',
				'priority-plus-navigation'
			)}
			onRequestClose={onClose}
			className="priority-plus-dropdown-customizer"
			size="large"
			isDismissible={true}
		>
			<div className="dropdown-customizer-layout">
				<div className="dropdown-customizer-controls">
					<ColorPanel
						attributes={attributes}
						setAttributes={setAttributes}
					/>

					<MenuStylesPanel
						attributes={attributes}
						setAttributes={setAttributes}
					/>

					<MenuSpacingPanel
						attributes={attributes}
						setAttributes={setAttributes}
						spacingSizes={spacingSizes}
					/>
				</div>

				<div className="dropdown-customizer-preview">
					<DropdownPreview
						attributes={attributes}
						typographyStyles={typographyStyles}
					/>
				</div>
			</div>

			<div className="dropdown-customizer-footer">
				<Button
					variant="tertiary"
					isDestructive
					onClick={resetAllToDefaults}
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
