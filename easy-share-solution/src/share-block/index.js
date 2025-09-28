/**
 * WordPress dependencies
 */
import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import edit from './edit';
import save from './save';
import metadata from './block.json';

/**
 * Register Share Block
 */
registerBlockType(metadata.name, {
    ...metadata,
    title: __('Easy Share Buttons', 'easy-share-solution'),
    description: __('Add social media sharing buttons to your content.', 'easy-share-solution'),
    edit,
    save,
});
