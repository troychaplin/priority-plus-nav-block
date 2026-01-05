/**
 * WordPress dependencies
 */
import { PanelColorSettings } from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import {
	DEFAULT_SUBMENU_BACKGROUND_COLOR,
	DEFAULT_SUBMENU_ITEM_HOVER_BACKGROUND,
	DEFAULT_SUBMENU_ITEM_TEXT_COLOR,
	DEFAULT_SUBMENU_ITEM_HOVER_TEXT_COLOR,
} from '../../constants';

/**
 * SubmenuColorPanel Component
 *
 * Provides color controls for submenu styling (nested accordion items).
 * Colors always show their value (or default) and reset to defaults when cleared.
 *
 * @param {Object}   props               - Component props
 * @param {Object}   props.attributes    - Block attributes
 * @param {Function} props.setAttributes - Function to update attributes
 * @return {JSX.Element} Submenu color panel component
 */
export function SubmenuColorPanel({ attributes, setAttributes }) {
	const {
		priorityPlusSubmenuBackgroundColor,
		priorityPlusSubmenuItemHoverBackground,
		priorityPlusSubmenuItemTextColor,
		priorityPlusSubmenuItemHoverTextColor,
	} = attributes;

	return (
		<PanelColorSettings
			title={__('Priority Plus Submenu Colors', 'priority-plus-navigation')}
			colorSettings={[
				{
					label: __('Background Color', 'priority-plus-navigation'),
					value:
						priorityPlusSubmenuBackgroundColor ||
						DEFAULT_SUBMENU_BACKGROUND_COLOR,
					onChange: (color) =>
						setAttributes({
							priorityPlusSubmenuBackgroundColor:
								color || DEFAULT_SUBMENU_BACKGROUND_COLOR,
						}),
                        enableAlpha: true,
				},
				{
					label: __(
						'Item Hover Background',
						'priority-plus-navigation'
					),
					value:
						priorityPlusSubmenuItemHoverBackground ||
						DEFAULT_SUBMENU_ITEM_HOVER_BACKGROUND,
					onChange: (color) =>
						setAttributes({
							priorityPlusSubmenuItemHoverBackground:
								color || DEFAULT_SUBMENU_ITEM_HOVER_BACKGROUND,
						}),
					enableAlpha: true,
				},
				{
					label: __('Item Text Color', 'priority-plus-navigation'),
					value:
						priorityPlusSubmenuItemTextColor ||
						DEFAULT_SUBMENU_ITEM_TEXT_COLOR,
					onChange: (color) =>
						setAttributes({
							priorityPlusSubmenuItemTextColor:
								color || DEFAULT_SUBMENU_ITEM_TEXT_COLOR,
						}),
					enableAlpha: true,
				},
				{
					label: __(
						'Item Hover Text Color',
						'priority-plus-navigation'
					),
					value:
						priorityPlusSubmenuItemHoverTextColor ||
						DEFAULT_SUBMENU_ITEM_HOVER_TEXT_COLOR,
					onChange: (color) =>
						setAttributes({
							priorityPlusSubmenuItemHoverTextColor:
								color || DEFAULT_SUBMENU_ITEM_HOVER_TEXT_COLOR,
						}),
                        enableAlpha: true,
				},
			]}
		/>
	);
}
