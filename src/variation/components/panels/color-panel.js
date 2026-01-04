/**
 * WordPress dependencies
 */
import { PanelColorSettings } from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';

/**
 * ColorPanel Component
 *
 * Provides color controls for dropdown menu styling.
 *
 * @param {Object}   props             - Component props
 * @param {Object}   props.styles      - Current dropdown styles
 * @param {Function} props.updateStyle - Function to update a style property
 * @return {JSX.Element} Color panel component
 */
export function ColorPanel({ styles, updateStyle }) {
	return (
		<PanelColorSettings
			title={__('Priority Plus Menu Colors', 'priority-plus-navigation')}
			colorSettings={[
				{
					label: __('Background Color', 'priority-plus-navigation'),
					value: styles.backgroundColor,
					onChange: (color) =>
						updateStyle('backgroundColor', color || '#ffffff'),
					clearable: true,
				},
				{
					label: __(
						'Hover Background Color',
						'priority-plus-navigation'
					),
					value: styles.itemHoverBackgroundColor,
					onChange: (color) =>
						updateStyle(
							'itemHoverBackgroundColor',
							color || 'rgba(0, 0, 0, 0.05)'
						),
					clearable: true,
				},
				{
					label: __('Hover Text Color', 'priority-plus-navigation'),
					value: styles.itemHoverTextColor,
					onChange: (color) =>
						updateStyle('itemHoverTextColor', color || 'inherit'),
					clearable: true,
				},
			]}
		/>
	);
}
