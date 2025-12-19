
import { registerBlockType, createBlock } from '@wordpress/blocks';
import './style.scss';
import Edit from './edit';
import save from './save';
import metadata from './block.json';

registerBlockType( metadata.name, {
	edit: Edit,
	save,
	transforms: {
		from: [
			{
				type: 'block',
				blocks: [ 'core/navigation' ],
				transform: ( attributes, innerBlocks ) => {
					return createBlock(
						'lumen/priority-nav',
						{
							moreLabel: 'More',
							moreIcon: 'dots'
						},
						[ createBlock( 'core/navigation', attributes, innerBlocks ) ]
					);
				}
			}
		],
		to: [
			{
				type: 'block',
				blocks: [ 'core/navigation' ],
				transform: ( attributes, innerBlocks ) => {
					// Extract the core/navigation block from inside
					if ( innerBlocks.length > 0 && innerBlocks[ 0 ].name === 'core/navigation' ) {
						return createBlock(
							'core/navigation',
							innerBlocks[ 0 ].attributes,
							innerBlocks[ 0 ].innerBlocks
						);
					}
					// If no navigation block inside, create empty one
					return createBlock( 'core/navigation' );
				}
			}
		]
	}
} );
