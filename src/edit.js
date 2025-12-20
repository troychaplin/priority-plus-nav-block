import { __ } from '@wordpress/i18n';
import {
	useBlockProps,
	useInnerBlocksProps,
	InspectorControls,
} from '@wordpress/block-editor';
import { PanelBody, TextControl, SelectControl } from '@wordpress/components';
// import './editor.scss';

const ALLOWED_BLOCKS = [ 'core/navigation' ];
const TEMPLATE = [ [ 'core/navigation' ] ];

export default function Edit( { attributes, setAttributes } ) {
	const { moreLabel, moreIcon } = attributes;

	const blockProps = useBlockProps( {
		className: 'priority-nav-wrapper',
	} );

	const innerBlocksProps = useInnerBlocksProps( blockProps, {
		allowedBlocks: ALLOWED_BLOCKS,
		template: TEMPLATE,
		templateLock: false,
		renderAppender: false,
	} );

	return (
		<>
			<InspectorControls>
				<PanelBody title={ __( 'Priority+ Settings', 'priority-nav' ) }>
					<TextControl
						label={ __( 'More Button Label', 'priority-nav' ) }
						value={ moreLabel }
						onChange={ ( value ) =>
							setAttributes( { moreLabel: value } )
						}
						help={ __(
							'Text displayed on the "More" button',
							'priority-nav'
						) }
					/>
					<SelectControl
						label={ __( 'More Button Icon', 'priority-nav' ) }
						value={ moreIcon }
						options={ [
							{
								label: __(
									'Horizontal Dots (•••)',
									'priority-nav'
								),
								value: 'dots',
							},
							{
								label: __( 'Chevron Down (▼)', 'priority-nav' ),
								value: 'chevron',
							},
							{
								label: __( 'Plus (+)', 'priority-nav' ),
								value: 'plus',
							},
							{
								label: __( 'Menu (≡)', 'priority-nav' ),
								value: 'menu',
							},
						] }
						onChange={ ( value ) =>
							setAttributes( { moreIcon: value } )
						}
					/>
				</PanelBody>
			</InspectorControls>

			<div { ...innerBlocksProps } />
		</>
	);
}
