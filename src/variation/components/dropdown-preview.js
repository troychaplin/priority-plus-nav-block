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
 * DropdownPreview Component
 *
 * Displays a live preview of the dropdown menu with all applied styles.
 * Updates in real-time as users modify controls in the customizer.
 * Matches the frontend dropdown structure with accordion buttons.
 */
export function DropdownPreview({ dropdownStyles }) {
	const {
		backgroundColor = '#ffffff',
		borderColor = '#dddddd',
		borderWidth = '1px',
		borderRadius = '4px',
		boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)',
		itemSpacing = '0.75rem 1.25rem',
		itemHoverBackgroundColor = 'rgba(0, 0, 0, 0.05)',
		itemHoverTextColor = 'inherit',
		multiLevelIndent = '1.25rem',
	} = dropdownStyles || {};

	// State for accordion open/closed
	const [isAccordionOpen, setIsAccordionOpen] = useState(true);

	// Memoize the inline styles to avoid unnecessary recalculations
	const previewStyles = useMemo(
		() => ({
			'--preview-background-color': backgroundColor,
			'--preview-border-color': borderColor,
			'--preview-border-width': borderWidth,
			'--preview-border-radius': borderRadius,
			'--preview-box-shadow': boxShadow,
			'--preview-item-spacing': itemSpacing,
			'--preview-item-hover-background': itemHoverBackgroundColor,
			'--preview-item-hover-text': itemHoverTextColor,
			'--preview-multi-level-indent': multiLevelIndent,
		}),
		[
			backgroundColor,
			borderColor,
			borderWidth,
			borderRadius,
			boxShadow,
			itemSpacing,
			itemHoverBackgroundColor,
			itemHoverTextColor,
			multiLevelIndent,
		]
	);

	return (
		<div className="dropdown-preview-wrapper">
			<div className="dropdown-preview-container" style={previewStyles}>
				<ul className="dropdown-preview-menu">
					<li className="dropdown-preview-item">
						<a href="#" onClick={(e) => e.preventDefault()}>
							{__('Home', 'priority-plus-navigation')}
						</a>
					</li>
					<li className="dropdown-preview-item dropdown-preview-item--hover">
						<a href="#" onClick={(e) => e.preventDefault()}>
							{__('About (Hover)', 'priority-plus-navigation')}
						</a>
					</li>
					<li className="dropdown-preview-item dropdown-preview-item--has-accordion">
						<button
							className="dropdown-preview-accordion-toggle"
							onClick={() => setIsAccordionOpen(!isAccordionOpen)}
							aria-expanded={isAccordionOpen}
						>
							<span className="dropdown-preview-accordion-text">
								{__('Services', 'priority-plus-navigation')}
							</span>
							<span className="dropdown-preview-accordion-arrow">
								▸
							</span>
						</button>
						{isAccordionOpen && (
							<ul className="dropdown-preview-submenu">
								<li className="dropdown-preview-item dropdown-preview-item--nested">
									<a href="#" onClick={(e) => e.preventDefault()}>
										{__('Web Design', 'priority-plus-navigation')}
									</a>
								</li>
								<li className="dropdown-preview-item dropdown-preview-item--nested">
									<a href="#" onClick={(e) => e.preventDefault()}>
										{__('Development', 'priority-plus-navigation')}
									</a>
								</li>
							</ul>
						)}
					</li>
					<li className="dropdown-preview-item">
						<a href="#" onClick={(e) => e.preventDefault()}>
							{__('Contact', 'priority-plus-navigation')}
						</a>
					</li>
				</ul>
			</div>
			<p className="dropdown-preview-help">
				{__('Live preview - Click "Services" to toggle accordion', 'priority-plus-navigation')}
			</p>
		</div>
	);
}
