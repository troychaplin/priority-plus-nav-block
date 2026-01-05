/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { useMemo, useState } from '@wordpress/element';

/**
 * Internal dependencies
 */
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

/**
 * Convert WordPress preset value format to CSS custom property format.
 *
 * WordPress stores preset values as "var:preset|spacing|30" which needs to be
 * converted to "var(--wp--preset--spacing--30)" for CSS.
 *
 * @param {string} value - The preset value string
 * @return {string} Converted CSS custom property or original value
 */
function convertPresetValue(value) {
	if (!value || typeof value !== 'string') {
		return value;
	}

	// Check if value matches WordPress preset format: var:preset|spacing|30
	if (value.startsWith('var:preset|')) {
		const matches = value.match(/^var:preset\|([^|]+)\|(.+)$/);
		if (matches) {
			const presetType = matches[1];
			const presetSlug = matches[2];
			return `var(--wp--preset--${presetType}--${presetSlug})`;
		}
	}

	// If it's already a CSS custom property, return as-is
	if (value.startsWith('var(')) {
		return value;
	}

	// Otherwise return the original value
	return value;
}

/**
 * Convert border to CSS custom properties (handles both flat and per-side object formats)
 *
 * Returns an object with CSS custom property names as keys that can be spread into inline styles.
 * Uses the same CSS custom property names as the frontend SCSS.
 *
 * @param {Object} border - The border value (flat or per-side)
 * @return {Object} Object with CSS custom properties for borders
 */
function getBorderCSSProperties(border) {
	const defaults = DEFAULT_MENU_BORDER;

	const cssVarPrefix = '--wp--custom--priority-plus-navigation--dropdown--';

	// Handle null, undefined, or empty values - return unified border defaults
	if (!border) {
		return {
			[`${cssVarPrefix}border-color`]: defaults.color,
			[`${cssVarPrefix}border-width`]: defaults.width,
			[`${cssVarPrefix}border-style`]: defaults.style,
		};
	}

	// Check if it's a flat border (has color, width, or style at top level)
	if (border.color || border.width || border.style) {
		return {
			[`${cssVarPrefix}border-color`]: border.color || defaults.color,
			[`${cssVarPrefix}border-width`]: border.width || defaults.width,
			[`${cssVarPrefix}border-style`]: border.style || defaults.style,
		};
	}

	// Check if it's per-side format (has top, right, bottom, left)
	const sides = ['top', 'right', 'bottom', 'left'];
	const hasPerSide = sides.some((side) => border[side]);

	if (hasPerSide) {
		// Build CSS custom properties only for sides that have values
		// Sides without values will use the SCSS fallback (unified border)
		const result = {};

		sides.forEach((side) => {
			const sideBorder = border[side];
			if (
				sideBorder &&
				(sideBorder.color || sideBorder.width || sideBorder.style)
			) {
				const width = sideBorder.width || defaults.width;
				const style = sideBorder.style || defaults.style;
				const color = sideBorder.color || defaults.color;
				result[`${cssVarPrefix}border-${side}`] =
					`${width} ${style} ${color}`;
			}
		});

		// If we have at least one per-side value, return the result
		// The SCSS fallback will handle sides without explicit values
		if (Object.keys(result).length > 0) {
			return result;
		}
	}

	// Fallback to defaults
	return {
		[`${cssVarPrefix}border-color`]: defaults.color,
		[`${cssVarPrefix}border-width`]: defaults.width,
		[`${cssVarPrefix}border-style`]: defaults.style,
	};
}

/**
 * Convert borderRadius to CSS string (handles both string and per-corner object formats)
 *
 * @param {Object|string} borderRadius - The border radius value
 * @return {string} CSS border-radius value
 */
function getBorderRadiusCSS(borderRadius) {
	// Handle null, undefined, or empty values
	if (!borderRadius) {
		return DEFAULT_MENU_BORDER_RADIUS;
	}

	// If it's already a string, return as-is
	if (typeof borderRadius === 'string') {
		return borderRadius;
	}

	// If it's an object (per-corner values), convert to CSS
	if (typeof borderRadius === 'object') {
		const { topLeft, topRight, bottomRight, bottomLeft } = borderRadius;

		// Check if all values are the same - use shorthand
		if (
			topLeft === topRight &&
			topRight === bottomRight &&
			bottomRight === bottomLeft &&
			topLeft
		) {
			return topLeft;
		}

		// Build full border-radius: top-left top-right bottom-right bottom-left
		const tl = topLeft || '0';
		const tr = topRight || '0';
		const br = bottomRight || '0';
		const bl = bottomLeft || '0';

		return `${tl} ${tr} ${br} ${bl}`;
	}

	return DEFAULT_MENU_BORDER_RADIUS;
}

/**
 * Normalize submenu indent value to CSS string
 * Handles both new object format ({ left: '1.25rem' }) and legacy string format ('1.25rem')
 *
 * @param {Object|string} indent - The submenu indent value
 * @return {string} CSS indent value
 */
function getSubmenuIndentCSS(indent) {
	if (!indent) {
		return DEFAULT_MENU_SUBMENU_INDENT;
	}

	// Handle object format from SpacingSizesControl (e.g., { left: '1.25rem' })
	if (typeof indent === 'object' && indent.left) {
		return convertPresetValue(indent.left);
	}

	// Handle legacy string format (e.g., '1.25rem')
	if (typeof indent === 'string') {
		return convertPresetValue(indent);
	}

	return DEFAULT_MENU_SUBMENU_INDENT;
}

/**
 * Convert itemPadding to CSS string (handles both object and string formats)
 *
 * @param {Object|string} padding - The padding value (object or string)
 * @return {string} CSS padding value
 */
function getItemPaddingCSS(padding) {
	const defaultPadding = `${DEFAULT_MENU_ITEM_PADDING.top} ${DEFAULT_MENU_ITEM_PADDING.right} ${DEFAULT_MENU_ITEM_PADDING.bottom} ${DEFAULT_MENU_ITEM_PADDING.left}`;

	// Handle null, undefined, or empty values
	if (!padding) {
		return defaultPadding;
	}

	// If it's already a string, convert presets and return
	if (typeof padding === 'string') {
		return convertPresetValue(padding);
	}

	// If it's an object (SpacingSizesControl format), convert to CSS
	if (typeof padding === 'object') {
		// Check if it's an empty object (after reset)
		if (Object.keys(padding).length === 0) {
			return defaultPadding;
		}

		const { top, right, bottom, left } = padding;

		// Check if all values are undefined, empty, or "0" - use default
		const hasValues =
			(top && top !== '' && top !== '0') ||
			(right && right !== '' && right !== '0') ||
			(bottom && bottom !== '' && bottom !== '0') ||
			(left && left !== '' && left !== '0');

		if (!hasValues) {
			return defaultPadding;
		}

		// Convert preset values to CSS custom properties
		const topVal = convertPresetValue(top) || '';
		const rightVal = convertPresetValue(right) || '';
		const bottomVal = convertPresetValue(bottom) || '';
		const leftVal = convertPresetValue(left) || '';

		// If any value is empty, we can't use shorthand properly
		// Return full format with fallback to 0 for empty sides
		const topFinal = topVal || '0';
		const rightFinal = rightVal || '0';
		const bottomFinal = bottomVal || '0';
		const leftFinal = leftVal || '0';

		// All same
		if (
			topFinal === rightFinal &&
			rightFinal === bottomFinal &&
			bottomFinal === leftFinal
		) {
			return topFinal;
		}

		// Top/bottom same, left/right same
		if (topFinal === bottomFinal && rightFinal === leftFinal) {
			return `${topFinal} ${rightFinal}`;
		}

		// All different
		return `${topFinal} ${rightFinal} ${bottomFinal} ${leftFinal}`;
	}

	return defaultPadding;
}

/**
 * DropdownPreview Component
 *
 * Displays a live preview of the dropdown menu using the exact same classes
 * and structure as the frontend to ensure 100% accuracy.
 *
 * @param {Object} props                  - Component props
 * @param {Object} props.attributes       - Block attributes
 * @param {Object} props.typographyStyles - Typography values from navigation block
 * @return {JSX.Element} Preview component
 */
export function DropdownPreview({ attributes, typographyStyles = {} }) {
	const {
		priorityPlusMenuBackgroundColor,
		priorityPlusMenuBorder,
		priorityPlusMenuBorderRadius,
		priorityPlusMenuBoxShadow,
		priorityPlusMenuItemPadding,
		priorityPlusMenuItemHoverBackground,
		priorityPlusMenuItemTextColor,
		priorityPlusMenuItemHoverTextColor,
		priorityPlusMenuSubmenuIndent,
		priorityPlusMenuItemSeparator,
		priorityPlusSubmenuBackgroundColor,
		priorityPlusSubmenuItemHoverBackground,
		priorityPlusSubmenuItemTextColor,
		priorityPlusSubmenuItemHoverTextColor,
	} = attributes;

	// Use defaults if attributes are undefined
	const backgroundColor =
		priorityPlusMenuBackgroundColor || DEFAULT_MENU_BACKGROUND_COLOR;
	const border = priorityPlusMenuBorder || DEFAULT_MENU_BORDER;
	const borderRadius =
		priorityPlusMenuBorderRadius || DEFAULT_MENU_BORDER_RADIUS;
	const boxShadow = priorityPlusMenuBoxShadow || DEFAULT_MENU_BOX_SHADOW;
	const itemPadding =
		priorityPlusMenuItemPadding || DEFAULT_MENU_ITEM_PADDING;
	const itemHoverBackground =
		priorityPlusMenuItemHoverBackground ||
		DEFAULT_MENU_ITEM_HOVER_BACKGROUND;
	const itemTextColor =
		priorityPlusMenuItemTextColor || DEFAULT_MENU_ITEM_TEXT_COLOR;
	const itemHoverTextColor =
		priorityPlusMenuItemHoverTextColor ||
		DEFAULT_MENU_ITEM_HOVER_TEXT_COLOR;
	const itemSeparator =
		priorityPlusMenuItemSeparator || DEFAULT_MENU_ITEM_SEPARATOR;
	const submenuBackgroundColor =
		priorityPlusSubmenuBackgroundColor || DEFAULT_SUBMENU_BACKGROUND_COLOR;
	const submenuItemHoverBackground =
		priorityPlusSubmenuItemHoverBackground ||
		DEFAULT_SUBMENU_ITEM_HOVER_BACKGROUND;
	const submenuItemTextColor =
		priorityPlusSubmenuItemTextColor || DEFAULT_SUBMENU_ITEM_TEXT_COLOR;
	const submenuItemHoverTextColor =
		priorityPlusSubmenuItemHoverTextColor ||
		DEFAULT_SUBMENU_ITEM_HOVER_TEXT_COLOR;
	// State for accordion open/closed
	const [isAccordionOpen, setIsAccordionOpen] = useState(true);

	// Memoize the inline styles using the same CSS custom property names as the frontend
	const previewStyles = useMemo(() => {
		// Get border CSS properties (handles both flat and per-side formats)
		const borderCSSProperties = getBorderCSSProperties(border);

		const styles = {
			'--wp--custom--priority-plus-navigation--dropdown--background-color':
				backgroundColor,
			'--wp--custom--priority-plus-navigation--dropdown--border-radius':
				getBorderRadiusCSS(borderRadius),
			'--wp--custom--priority-plus-navigation--dropdown--box-shadow':
				boxShadow,
			'--wp--custom--priority-plus-navigation--dropdown--item-spacing':
				getItemPaddingCSS(itemPadding),
			'--wp--custom--priority-plus-navigation--dropdown--item-hover-background-color':
				itemHoverBackground,
			'--wp--custom--priority-plus-navigation--dropdown--item-text-color':
				itemTextColor,
			'--wp--custom--priority-plus-navigation--dropdown--item-hover-text-color':
				itemHoverTextColor,
			'--wp--custom--priority-plus-navigation--dropdown--multi-level-indent':
				getSubmenuIndentCSS(priorityPlusMenuSubmenuIndent),
			'--wp--custom--priority-plus-navigation--dropdown--item-separator-color':
				itemSeparator?.color || 'transparent',
			'--wp--custom--priority-plus-navigation--dropdown--item-separator-width':
				itemSeparator?.width || '0',
			'--wp--custom--priority-plus-navigation--dropdown--item-separator-style':
				itemSeparator?.style || 'solid',
			// Submenu colors
			'--wp--custom--priority-plus-navigation--dropdown--submenu-background-color':
				submenuBackgroundColor,
			'--wp--custom--priority-plus-navigation--dropdown--submenu-item-hover-background-color':
				submenuItemHoverBackground,
			'--wp--custom--priority-plus-navigation--dropdown--submenu-item-text-color':
				submenuItemTextColor,
			'--wp--custom--priority-plus-navigation--dropdown--submenu-item-hover-text-color':
				submenuItemHoverTextColor,
			// Spread border CSS properties (either unified or per-side)
			...borderCSSProperties,
		};

		// Add typography styles from navigation block
		if (typographyStyles.fontFamily) {
			styles.fontFamily = typographyStyles.fontFamily;
		}
		if (typographyStyles.fontSize) {
			styles.fontSize = typographyStyles.fontSize;
		}
		if (typographyStyles.fontWeight) {
			styles.fontWeight = typographyStyles.fontWeight;
		}
		if (typographyStyles.fontStyle) {
			styles.fontStyle = typographyStyles.fontStyle;
		}

		return styles;
	}, [
		backgroundColor,
		border,
		borderRadius,
		boxShadow,
		itemPadding,
		itemHoverBackground,
		itemTextColor,
		itemHoverTextColor,
		priorityPlusMenuSubmenuIndent,
		itemSeparator,
		submenuBackgroundColor,
		submenuItemHoverBackground,
		submenuItemTextColor,
		submenuItemHoverTextColor,
		typographyStyles,
	]);

	return (
		<ul
			className="priority-plus-navigation-dropdown is-open"
			style={previewStyles}
		>
			<li>
				<span className="priority-plus-navigation-preview-link">
					{__('Top level item', 'priority-plus-navigation')}
				</span>
			</li>
			<li className="dropdown-preview-hover-demo">
				<span className="priority-plus-navigation-preview-link">
					{__('Another top level item', 'priority-plus-navigation')}
				</span>
			</li>
			<li>
				<button
					type="button"
					className="priority-plus-navigation-accordion-toggle priority-plus-navigation-accordion-toggle-full"
					onClick={() => setIsAccordionOpen(!isAccordionOpen)}
					aria-expanded={isAccordionOpen}
				>
					<span className="priority-plus-navigation-accordion-text">
						{__(
							'Top level with a submenu',
							'priority-plus-navigation'
						)}
					</span>
					<span
						className="priority-plus-navigation-accordion-arrow"
						aria-hidden="true"
					>
						›
					</span>
				</button>
				{isAccordionOpen && (
					<ul className="priority-plus-navigation-accordion-content is-open">
						<li>
							<span className="priority-plus-navigation-preview-link">
								{__('Submenu item', 'priority-plus-navigation')}
							</span>
						</li>
						<li>
							<button
								type="button"
								className="priority-plus-navigation-accordion-toggle priority-plus-navigation-accordion-toggle-full"
								onClick={() =>
									setIsAccordionOpen(!isAccordionOpen)
								}
								aria-expanded={isAccordionOpen}
							>
								<span className="priority-plus-navigation-accordion-text">
									{__(
										'Submenu in a submenu',
										'priority-plus-navigation'
									)}
								</span>
								<span
									className="priority-plus-navigation-accordion-arrow"
									aria-hidden="true"
								>
									›
								</span>
							</button>
							{isAccordionOpen && (
								<ul className="priority-plus-navigation-accordion-content is-open">
									<li>
										<span className="priority-plus-navigation-preview-link">
											{__(
												'Going deeper into the submenu',
												'priority-plus-navigation'
											)}
										</span>
									</li>
									<li>
										<span className="priority-plus-navigation-preview-link">
											{__(
												'Woah, submenu inception!',
												'priority-plus-navigation'
											)}
										</span>
									</li>
								</ul>
							)}
						</li>
					</ul>
				)}
			</li>
			<li>
				<span className="priority-plus-navigation-preview-link">
					{__(
						"Don't forget to test nav item the hover effect!",
						'priority-plus-navigation'
					)}
				</span>
			</li>
		</ul>
	);
}
