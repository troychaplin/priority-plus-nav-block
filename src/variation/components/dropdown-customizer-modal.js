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
import { ColorPanel } from './panels/menu-color-panel';
import { SubmenuColorPanel } from './panels/submenu-color-panel';
import { MenuStylesPanel } from './panels/menu-styles-panel';
import { MenuItemsPanel } from './panels/menu-items-panel';
import {
	DEFAULT_MENU_BACKGROUND_COLOR,
	DEFAULT_MENU_BORDER,
	DEFAULT_MENU_BORDER_RADIUS,
	DEFAULT_MENU_BOX_SHADOW,
	DEFAULT_MENU_ITEM_PADDING,
	DEFAULT_MENU_ITEM_HOVER_BACKGROUND,
	DEFAULT_MENU_ITEM_TEXT_COLOR,
	DEFAULT_MENU_ITEM_HOVER_TEXT_COLOR,
	DEFAULT_MENU_SUBMENU_INDENT,
	DEFAULT_MENU_ITEM_SEPARATOR,
	DEFAULT_SUBMENU_BACKGROUND_COLOR,
	DEFAULT_SUBMENU_ITEM_HOVER_BACKGROUND,
	DEFAULT_SUBMENU_ITEM_TEXT_COLOR,
	DEFAULT_SUBMENU_ITEM_HOVER_TEXT_COLOR,
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
	if (attributes.priorityPlusTypographyFontFamily) {
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
			(font) => font.slug === attributes.priorityPlusTypographyFontFamily
		);

		if (fontFamilyPreset) {
			typographyStyles.fontFamily = fontFamilyPreset.fontFamily;
		}
	}

	// Convert fontSize slug to actual font-size value
	if (attributes.priorityPlusTypographyFontSize) {
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
			(size) => size.slug === attributes.priorityPlusTypographyFontSize
		);
		if (fontSizePreset) {
			typographyStyles.fontSize = fontSizePreset.size;
		}
	}

	// Use direct values from style object for fontWeight and fontStyle
	if (attributes.priorityPlusTypographyFontWeight) {
		typographyStyles.fontWeight =
			attributes.priorityPlusTypographyFontWeight;
	}
	if (attributes.priorityPlusTypographyFontStyle) {
		typographyStyles.fontStyle = attributes.priorityPlusTypographyFontStyle;
	}

	// Get spacing sizes from theme
	const spacingSizes = useSetting('spacing.spacingSizes') || [];

	// Reset all menu styles to defaults
	const resetAllToDefaults = () => {
		setAttributes({
			priorityPlusMenuBackgroundColor: DEFAULT_MENU_BACKGROUND_COLOR,
			priorityPlusMenuBorder: DEFAULT_MENU_BORDER,
			priorityPlusMenuBorderRadius: DEFAULT_MENU_BORDER_RADIUS,
			priorityPlusMenuBoxShadow: DEFAULT_MENU_BOX_SHADOW,
			priorityPlusMenuItemPadding: DEFAULT_MENU_ITEM_PADDING,
			priorityPlusMenuItemHoverBackground:
				DEFAULT_MENU_ITEM_HOVER_BACKGROUND,
			priorityPlusMenuItemTextColor: DEFAULT_MENU_ITEM_TEXT_COLOR,
			priorityPlusMenuItemHoverTextColor:
				DEFAULT_MENU_ITEM_HOVER_TEXT_COLOR,
			priorityPlusMenuSubmenuIndent: {
				left: DEFAULT_MENU_SUBMENU_INDENT,
			},
			priorityPlusMenuItemSeparator: DEFAULT_MENU_ITEM_SEPARATOR,
			priorityPlusSubmenuBackgroundColor:
				DEFAULT_SUBMENU_BACKGROUND_COLOR,
			priorityPlusSubmenuItemHoverBackground:
				DEFAULT_SUBMENU_ITEM_HOVER_BACKGROUND,
			priorityPlusSubmenuItemTextColor: DEFAULT_SUBMENU_ITEM_TEXT_COLOR,
			priorityPlusSubmenuItemHoverTextColor:
				DEFAULT_SUBMENU_ITEM_HOVER_TEXT_COLOR,
		});
	};

	return (
		<Modal
			title={__(
				'Customize Priority Plus Menu',
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
					<SubmenuColorPanel
						attributes={attributes}
						setAttributes={setAttributes}
					/>
					<MenuItemsPanel
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
