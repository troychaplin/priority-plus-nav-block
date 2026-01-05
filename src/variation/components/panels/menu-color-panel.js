/**
 * WordPress dependencies
 */
import { PanelColorSettings } from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import {
	DEFAULT_MENU_BACKGROUND_COLOR,
	DEFAULT_MENU_ITEM_HOVER_BACKGROUND,
	DEFAULT_MENU_ITEM_TEXT_COLOR,
	DEFAULT_MENU_ITEM_HOVER_TEXT_COLOR,
} from '../../constants';

/**
 * ColorPanel Component
 *
 * Provides color controls for menu styling.
 * Colors always show their value (or default) and reset to defaults when cleared.
 *
 * @param {Object}   props               - Component props
 * @param {Object}   props.attributes    - Block attributes
 * @param {Function} props.setAttributes - Function to update attributes
 * @return {JSX.Element} Color panel component
 */
export function ColorPanel({ attributes, setAttributes }) {
	const {
		priorityPlusMenuBackgroundColor,
		priorityPlusMenuItemHoverBackground,
		priorityPlusMenuItemTextColor,
		priorityPlusMenuItemHoverTextColor,
	} = attributes;

	return (
		<PanelColorSettings
			title={__('Priority Plus Menu Colors', 'priority-plus-navigation')}
			colorSettings={[
				{
					label: __('Background Color', 'priority-plus-navigation'),
					value:
						priorityPlusMenuBackgroundColor ||
						DEFAULT_MENU_BACKGROUND_COLOR,
					onChange: (color) =>
						setAttributes({
							priorityPlusMenuBackgroundColor:
								color || DEFAULT_MENU_BACKGROUND_COLOR,
						}),
					enableAlpha: true,
				},
				{
					label: __(
						'Item Hover Background',
						'priority-plus-navigation'
					),
					value:
						priorityPlusMenuItemHoverBackground ||
						DEFAULT_MENU_ITEM_HOVER_BACKGROUND,
					onChange: (color) =>
						setAttributes({
							priorityPlusMenuItemHoverBackground:
								color || DEFAULT_MENU_ITEM_HOVER_BACKGROUND,
						}),
					enableAlpha: true,
				},
				{
					label: __('Item Text Color', 'priority-plus-navigation'),
					value:
						priorityPlusMenuItemTextColor ||
						DEFAULT_MENU_ITEM_TEXT_COLOR,
					onChange: (color) =>
						setAttributes({
							priorityPlusMenuItemTextColor:
								color || DEFAULT_MENU_ITEM_TEXT_COLOR,
						}),
					enableAlpha: true,
				},
				{
					label: __(
						'Item Hover Text Color',
						'priority-plus-navigation'
					),
					value:
						priorityPlusMenuItemHoverTextColor ||
						DEFAULT_MENU_ITEM_HOVER_TEXT_COLOR,
					onChange: (color) =>
						setAttributes({
							priorityPlusMenuItemHoverTextColor:
								color || DEFAULT_MENU_ITEM_HOVER_TEXT_COLOR,
						}),
					enableAlpha: true,
				},
			]}
		/>
	);
}
