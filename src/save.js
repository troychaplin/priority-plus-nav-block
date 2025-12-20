import { useBlockProps, useInnerBlocksProps } from '@wordpress/block-editor';

export default function save( { attributes } ) {
	const { moreLabel, moreIcon } = attributes;

	const blockProps = useBlockProps.save( {
		className: 'priority-nav-container',
		'data-priority-nav': '',
		'data-more-label': moreLabel,
		'data-more-icon': moreIcon,
	} );

	const innerBlocksProps = useInnerBlocksProps.save( blockProps );

	return <div { ...innerBlocksProps } />;
}
