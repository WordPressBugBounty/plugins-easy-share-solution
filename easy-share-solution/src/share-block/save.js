/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { useBlockProps } from '@wordpress/block-editor';

/**
 * Internal dependencies
 */
import { platforms } from '../utils/platforms';
import { PlatformIcon } from '../components/PlatformIcon';

/**
 * Save component
 */
export default function Save({ attributes }) {
    const { selectedPlatforms, iconStyle, layout, showLabels, alignment } = attributes;

    const blockProps = useBlockProps.save({
        className: `ess-share-block ess-layout-${layout} ess-align-${alignment}`,
    });

    const renderPlatformButton = (platform) => {
        const platformData = platforms[platform];
        if (!platformData) return null;

        return (
            <a
                key={platform}
                href="#"
                className={`ess-share-button ess-platform-${platform} ess-style-${iconStyle}`}
                data-platform={platform}
                data-url=""
                data-title=""
                data-description=""
                style={{ '--platform-color': platformData.color }}
                role="button"
                tabIndex="0"
                aria-label={`${__('Share on', 'easy-share-solution')} ${platformData.name}`}
            >
                <span className="ess-icon">
                    <PlatformIcon platform={platform} />
                </span>
                {showLabels && (
                    <span className="ess-label">{platformData.name}</span>
                )}
            </a>
        );
    };

    if (!selectedPlatforms || selectedPlatforms.length === 0) {
        return null;
    }

    return (
        <div {...blockProps}>
            <div className="ess-share-container">
                {selectedPlatforms.map(renderPlatformButton)}
                
                {/* Copy link button */}
                <button
                    className={`ess-share-button ess-platform-copy-link ess-style-${iconStyle}`}
                    data-platform="copy-link"
                    type="button"
                    aria-label={__('Copy link to clipboard', 'easy-share-solution')}
                >
                    <span className="ess-icon">
                        <PlatformIcon platform="copy-link" />
                    </span>
                    {showLabels && (
                        <span className="ess-label">{__('Copy Link', 'easy-share-solution')}</span>
                    )}
                </button>
            </div>
        </div>
    );
}
