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
import { DEFAULT_DROPDOWN_STYLES } from '../../constants';

/**
 * MenuSpacingPanel Component
 *
 * Provides controls for dropdown menu spacing (item padding and multi-level indent).
 *
 * @param {Object}   props                     - Component props
 * @param {Object}   props.styles              - Current dropdown styles
 * @param {Array}    props.spacingSizes        - Available spacing sizes from theme
 * @param {Function} props.updateStyle         - Function to update a style property
 * @param {Function} props.hasValue            - Function to check if a property has a value
 * @param {Function} props.hasItemSpacingValue - Function to check if item spacing has values
 * @return {JSX.Element} Menu spacing panel component
 */
export function MenuSpacingPanel({
	styles,
	spacingSizes,
	updateStyle,
	hasValue,
	hasItemSpacingValue,
}) {
	return (
		<ToolsPanel
			label={__(
				'Priority Plus Nav Item Spacing',
				'priority-plus-navigation'
			)}
			resetAll={() => {
				updateStyle('itemSpacing', DEFAULT_DROPDOWN_STYLES.itemSpacing);
				updateStyle(
					'multiLevelIndent',
					DEFAULT_DROPDOWN_STYLES.multiLevelIndent
				);
			}}
		>
			<ToolsPanelItem
				hasValue={hasItemSpacingValue}
				label={__('Padding', 'priority-plus-navigation')}
				onDeselect={() =>
					updateStyle(
						'itemSpacing',
						DEFAULT_DROPDOWN_STYLES.itemSpacing
					)
				}
				isShownByDefault
			>
				{spacingSizes.length > 0 ? (
					<SpacingSizesControl
						values={styles.itemSpacing}
						onChange={(value) => updateStyle('itemSpacing', value)}
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
						values={styles.itemSpacing}
						onChange={(value) => updateStyle('itemSpacing', value)}
						sides={['top', 'right', 'bottom', 'left']}
						units={['px', 'em', 'rem', 'vh', 'vw']}
						allowReset={true}
					/>
				)}
			</ToolsPanelItem>
			<ToolsPanelItem
				hasValue={() => hasValue('multiLevelIndent')}
				label={__('Submenu Indentation', 'priority-plus-navigation')}
				onDeselect={() => updateStyle('multiLevelIndent', '1.25rem')}
				isShownByDefault
			>
				<UnitControl
					label={__(
						'Submenu Indentation',
						'priority-plus-navigation'
					)}
					value={styles.multiLevelIndent || '1.25rem'}
					onChange={(value) => updateStyle('multiLevelIndent', value)}
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
