/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { useMemo, useState } from '@wordpress/element';

/**
 * Internal dependencies
 */
import './dropdown-preview.scss';

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
 * Convert itemSpacing to CSS string (handles both object and string formats)
 *
 * @param {Object|string} spacing - The spacing value (object or string)
 * @return {string} CSS spacing value
 */
function getItemSpacingCSS(spacing) {
	// Handle null, undefined, or empty values
	if (!spacing) {
		return '0.75rem 1rem'; // Default
	}

	// If it's already a string, convert presets and return
	if (typeof spacing === 'string') {
		return convertPresetValue(spacing);
	}

	// If it's an object (SpacingSizesControl format), convert to CSS
	if (typeof spacing === 'object') {
		// Check if it's an empty object (after reset)
		if (Object.keys(spacing).length === 0) {
			return '0.75rem 1rem'; // Default for empty object
		}

		const { top, right, bottom, left } = spacing;

		// Check if all values are undefined, empty, or "0" - use default
		const hasValues =
			(top && top !== '' && top !== '0') ||
			(right && right !== '' && right !== '0') ||
			(bottom && bottom !== '' && bottom !== '0') ||
			(left && left !== '' && left !== '0');

		if (!hasValues) {
			return '0.75rem 1rem'; // Default when no real values set
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

	return '0.75rem 1rem'; // Fallback
}

/**
 * DropdownPreview Component
 *
 * Displays a live preview of the dropdown menu using the exact same classes
 * and structure as the frontend to ensure 100% accuracy.
 *
 * @param {Object} props                  - Component props
 * @param {Object} props.dropdownStyles   - Dropdown style settings
 * @param {Object} props.typographyStyles - Typography values from navigation block
 * @return {JSX.Element} Preview component
 */
export function DropdownPreview({ dropdownStyles, typographyStyles = {} }) {
	const {
		backgroundColor = '#ffffff',
		borderColor = '#dddddd',
		borderWidth = '1px',
		borderRadius = '4px',
		boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)',
		itemSpacing,
		itemHoverBackgroundColor = 'rgba(0, 0, 0, 0.05)',
		itemHoverTextColor = 'inherit',
		multiLevelIndent = '1.25rem',
	} = dropdownStyles || {};

	// State for accordion open/closed
	const [isAccordionOpen, setIsAccordionOpen] = useState(true);

	// Memoize the inline styles using the same CSS custom property names as the frontend
	const previewStyles = useMemo(() => {
		const styles = {
			'--wp--custom--priority-plus-navigation--dropdown--background-color':
				backgroundColor,
			'--wp--custom--priority-plus-navigation--dropdown--border-color':
				borderColor,
			'--wp--custom--priority-plus-navigation--dropdown--border-width':
				borderWidth,
			'--wp--custom--priority-plus-navigation--dropdown--border-radius':
				borderRadius,
			'--wp--custom--priority-plus-navigation--dropdown--box-shadow':
				boxShadow,
			'--wp--custom--priority-plus-navigation--dropdown--item-spacing':
				getItemSpacingCSS(itemSpacing),
			'--wp--custom--priority-plus-navigation--dropdown--item-hover-background-color':
				itemHoverBackgroundColor,
			'--wp--custom--priority-plus-navigation--dropdown--item-hover-text-color':
				itemHoverTextColor,
			'--wp--custom--priority-plus-navigation--dropdown--multi-level-indent':
				multiLevelIndent,
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
		borderColor,
		borderWidth,
		borderRadius,
		boxShadow,
		itemSpacing,
		itemHoverBackgroundColor,
		itemHoverTextColor,
		multiLevelIndent,
		typographyStyles,
	]);

	// Build class names
	const dropdownClasses = 'priority-plus-navigation-dropdown is-open';

	return (
		<div className="dropdown-preview-wrapper">
			{/* Use exact same classes as frontend for 100% accuracy */}
			<ul className={dropdownClasses} style={previewStyles}>
				<li>
					<a href="#" onClick={(e) => e.preventDefault()}>
						{__('Home', 'priority-plus-navigation')}
					</a>
				</li>
				<li className="dropdown-preview-hover-demo">
					<a href="#" onClick={(e) => e.preventDefault()}>
						{__('About (Hover)', 'priority-plus-navigation')}
					</a>
				</li>
				<li>
					<button
						type="button"
						className="priority-plus-navigation-accordion-toggle priority-plus-navigation-accordion-toggle-full"
						onClick={() => setIsAccordionOpen(!isAccordionOpen)}
						aria-expanded={isAccordionOpen}
					>
						<span className="priority-plus-navigation-accordion-text">
							{__('Services', 'priority-plus-navigation')}
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
								<a href="#" onClick={(e) => e.preventDefault()}>
									{__(
										'Web Design',
										'priority-plus-navigation'
									)}
								</a>
							</li>
							<li>
								<a href="#" onClick={(e) => e.preventDefault()}>
									{__(
										'Development',
										'priority-plus-navigation'
									)}
								</a>
							</li>
						</ul>
					)}
				</li>
				<li>
					<a href="#" onClick={(e) => e.preventDefault()}>
						{__('Contact', 'priority-plus-navigation')}
					</a>
				</li>
			</ul>
			<p className="dropdown-preview-help">
				{__(
					'Live preview - Click "Services" to toggle accordion',
					'priority-plus-navigation'
				)}
			</p>
		</div>
	);
}
