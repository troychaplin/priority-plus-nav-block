/**
 * WordPress dependencies
 */
import {
	BoxControl,
	__experimentalUnitControl as UnitControl,
	__experimentalToolsPanel as ToolsPanel,
	__experimentalToolsPanelItem as ToolsPanelItem,
} from '@wordpress/components';
import { __experimentalSpacingSizesControl as SpacingSizesControl } from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import {
	DEFAULT_DROPDOWN_ITEM_SPACING,
	DEFAULT_DROPDOWN_MULTI_LEVEL_INDENT,
} from '../../constants';

/**
 * Check if item spacing has values
 *
 * @param {Object|string} itemSpacing - The item spacing value
 * @return {boolean} Whether item spacing has values
 */
function hasItemSpacingValue(itemSpacing) {
	if (!itemSpacing) {
		return false;
	}
	// Check if it's an object (SpacingSizesControl format) or string (legacy format)
	if (typeof itemSpacing === 'object') {
		// Check if object has any non-empty values
		const values = Object.values(itemSpacing);
		return values.some((value) => value && value !== '');
	}
	return !!itemSpacing;
}

/**
 * MenuSpacingPanel Component
 *
 * Provides controls for dropdown menu spacing (item padding and multi-level indent).
 *
 * @param {Object}   props               - Component props
 * @param {Object}   props.attributes    - Block attributes
 * @param {Function} props.setAttributes - Function to update attributes
 * @param {Array}    props.spacingSizes  - Available spacing sizes from theme
 * @return {JSX.Element} Menu spacing panel component
 */
export function MenuSpacingPanel({ attributes, setAttributes, spacingSizes }) {
	const {
		priorityNavDropdownItemSpacing,
		priorityNavDropdownMultiLevelIndent,
	} = attributes;

	return (
		<ToolsPanel
			label={__(
				'Priority Plus Nav Item Spacing',
				'priority-plus-navigation'
			)}
			resetAll={() => {
				setAttributes({
					priorityNavDropdownItemSpacing: DEFAULT_DROPDOWN_ITEM_SPACING,
					priorityNavDropdownMultiLevelIndent:
						DEFAULT_DROPDOWN_MULTI_LEVEL_INDENT,
				});
			}}
		>
			<ToolsPanelItem
				hasValue={() => hasItemSpacingValue(priorityNavDropdownItemSpacing)}
				label={__('Padding', 'priority-plus-navigation')}
				onDeselect={() =>
					setAttributes({
						priorityNavDropdownItemSpacing:
							DEFAULT_DROPDOWN_ITEM_SPACING,
					})
				}
				isShownByDefault
			>
				{spacingSizes.length > 0 ? (
					<SpacingSizesControl
						values={priorityNavDropdownItemSpacing}
						onChange={(value) =>
							setAttributes({ priorityNavDropdownItemSpacing: value })
						}
						label={__(
							'Nav Item Spacing',
							'priority-plus-navigation'
						)}
						sides={['top', 'right', 'bottom', 'left']}
						units={['px', 'em', 'rem', 'vh', 'vw']}
					/>
				) : (
					<BoxControl
						label={__(
							'Nav Item Spacing',
							'priority-plus-navigation'
						)}
						values={priorityNavDropdownItemSpacing}
						onChange={(value) =>
							setAttributes({ priorityNavDropdownItemSpacing: value })
						}
						sides={['top', 'right', 'bottom', 'left']}
						units={['px', 'em', 'rem', 'vh', 'vw']}
						allowReset={true}
					/>
				)}
			</ToolsPanelItem>
			<ToolsPanelItem
				hasValue={() => !!priorityNavDropdownMultiLevelIndent}
				label={__('Submenu Indentation', 'priority-plus-navigation')}
				onDeselect={() =>
					setAttributes({
						priorityNavDropdownMultiLevelIndent:
							DEFAULT_DROPDOWN_MULTI_LEVEL_INDENT,
					})
				}
				isShownByDefault
			>
				<UnitControl
					label={__(
						'Submenu Indentation',
						'priority-plus-navigation'
					)}
					value={
						priorityNavDropdownMultiLevelIndent ||
						DEFAULT_DROPDOWN_MULTI_LEVEL_INDENT
					}
					onChange={(value) =>
						setAttributes({ priorityNavDropdownMultiLevelIndent: value })
					}
					help={__(
						'Indentation for nested submenu items',
						'priority-plus-navigation'
					)}
					units={[
						{ value: 'px', label: 'px' },
						{ value: 'rem', label: 'rem' },
						{ value: 'em', label: 'em' },
					]}
				/>
			</ToolsPanelItem>
		</ToolsPanel>
	);
}
