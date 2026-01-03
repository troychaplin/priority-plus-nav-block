/**
 * WordPress dependencies
 */
import { Modal, Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import './dropdown-customizer-modal.scss';

export function DropdownCustomizerModal({
	attributes,
	setAttributes,
	onClose,
}) {
	const { priorityNavDropdownStyles = {} } = attributes;

	return (
		<Modal
			title={__('Customize Dropdown Styles', 'priority-plus-navigation')}
			onRequestClose={onClose}
			className="priority-plus-dropdown-customizer"
			size="fill"
			isDismissible={true}
		>
			<div className="dropdown-customizer-layout">
				<div className="dropdown-customizer-controls">
					<p>
						{__(
							'Controls will go here',
							'priority-plus-navigation'
						)}
					</p>
				</div>

				<div className="dropdown-customizer-preview">
					<p>
						{__('Preview will go here', 'priority-plus-navigation')}
					</p>
				</div>
			</div>

			<div className="dropdown-customizer-footer">
				<Button variant="primary" onClick={onClose}>
					{__('Done', 'priority-plus-navigation')}
				</Button>
			</div>
		</Modal>
	);
}
