<?php
// This file is generated. Do not modify it manually.
return array(
	'build' => array(
		'$schema' => 'https://schemas.wp.org/trunk/block.json',
		'apiVersion' => 3,
		'name' => 'lumen/priority-nav',
		'version' => '0.1.0',
		'title' => 'Priority+ Navigation',
		'category' => 'theme',
		'icon' => 'menu-alt',
		'description' => 'A responsive navigation wrapper that implements the Priority+ pattern, automatically moving items to a More dropdown.',
		'keywords' => array(
			'navigation',
			'menu',
			'priority',
			'responsive'
		),
		'attributes' => array(
			'moreLabel' => array(
				'type' => 'string',
				'default' => 'More'
			),
			'moreIcon' => array(
				'type' => 'string',
				'default' => 'dots'
			)
		),
		'editorScript' => 'file:./index.js',
		'editorStyle' => 'file:./index.css',
		'style' => 'file:./style-index.css',
		'viewScript' => 'file:./view.js',
		'textdomain' => 'priority-nav'
	)
);
