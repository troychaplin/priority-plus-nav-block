/**
 * WordPress dependencies
 */
import { PanelColorSettings } from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import {
	DEFAULT_DROPDOWN_BACKGROUND_COLOR,
	DEFAULT_DROPDOWN_ITEM_HOVER_BACKGROUND_COLOR,
	DEFAULT_DROPDOWN_ITEM_HOVER_TEXT_COLOR,
} from '../../constants';

/**
 * ColorPanel Component
 *
 * Provides color controls for dropdown menu styling.
 *
 * @param {Object}   props               - Component props
 * @param {Object}   props.attributes    - Block attributes
 * @param {Function} props.setAttributes - Function to update attributes
 * @return {JSX.Element} Color panel component
 */
export function ColorPanel({ attributes, setAttributes }) {
	const {
		priorityNavDropdownBackgroundColor,
		priorityNavDropdownItemHoverBackgroundColor,
		priorityNavDropdownItemHoverTextColor,
	} = attributes;

	return (
		<PanelColorSettings
			title={__('Priority Plus Menu Colors', 'priority-plus-navigation')}
			colorSettings={[
				{
					label: __('Background Color', 'priority-plus-navigation'),
					value: priorityNavDropdownBackgroundColor,
					onChange: (color) =>
						setAttributes({
							priorityNavDropdownBackgroundColor:
								color || DEFAULT_DROPDOWN_BACKGROUND_COLOR,
						}),
					clearable: true,
				},
				{
					label: __(
						'Hover Background Color',
						'priority-plus-navigation'
					),
					value: priorityNavDropdownItemHoverBackgroundColor,
					onChange: (color) =>
						setAttributes({
							priorityNavDropdownItemHoverBackgroundColor:
								color ||
								DEFAULT_DROPDOWN_ITEM_HOVER_BACKGROUND_COLOR,
						}),
					clearable: true,
				},
				{
					label: __('Hover Text Color', 'priority-plus-navigation'),
					value: priorityNavDropdownItemHoverTextColor,
					onChange: (color) =>
						setAttributes({
							priorityNavDropdownItemHoverTextColor:
								color || DEFAULT_DROPDOWN_ITEM_HOVER_TEXT_COLOR,
						}),
					clearable: true,
				},
			]}
		/>
	);
}
