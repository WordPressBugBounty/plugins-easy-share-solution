/**
 * ProFeature Component
 * Wraps Pro-only features with lock overlay and upgrade notices
 */

import { __ } from '@wordpress/i18n';
import { 
    Card,
    CardBody,
    Button,
    Notice
} from '@wordpress/components';

const ProFeature = ({ 
    children, 
    isProActive, 
    feature, 
    hasProFeature = null,
    upgradeUrl = 'https://wpthemespace.com/product/easy-share-solution/#pricing',
    title = null,
    description = null,
    overlay = false,
    inline = false,
    showNotice = true
}) => {
    // If pro is active or no feature restriction, show children normally
    if (isProActive || (hasProFeature && hasProFeature(feature))) {
        return children;
    }

    // Default description based on common features
    const getDefaultDescription = (featureName) => {
        const descriptions = {
            'analytics': __('View detailed analytics and sharing statistics.', 'easy-share-solution'),
            'show_share_count': __('Display share counts next to social icons.', 'easy-share-solution'),
            'custom_post_types': __('Enable sharing on custom post types.', 'easy-share-solution'),
            'staggered_animation': __('Add staggered entrance animations to icons.', 'easy-share-solution'),
            'continuous_animation': __('Enable continuous icon animations.', 'easy-share-solution'),
            'grid_2x2_layout': __('Arrange icons in a 2×2 grid layout.', 'easy-share-solution'),
            'grid_3x2_layout': __('Arrange icons in a 3×2 grid layout.', 'easy-share-solution'),
            'circular_layout': __('Arrange icons in a circular layout.', 'easy-share-solution'),
            'auto_hide_panel': __('Automatically hide panel on scroll.', 'easy-share-solution'),
            'popup_style_presets': __('Access premium popup style presets.', 'easy-share-solution'),
            'design_presets': __('Access premium design presets and themes.', 'easy-share-solution'),
            'platform_drag_sort': __('Drag and drop to reorder platforms.', 'easy-share-solution'),
            'qr_code_button': __('Add QR code sharing option.', 'easy-share-solution'),
            'print_button': __('Add print sharing option.', 'easy-share-solution'),
            'advanced_settings': __('Access advanced configuration options.', 'easy-share-solution')
        };
        return descriptions[featureName] || __('This feature is available in the Pro version.', 'easy-share-solution');
    };

    const featureDescription = description || getDefaultDescription(feature);

    // For inline notices (small pro labels)
    if (inline) {
        return (
            <div className="ess-pro-feature-inline">
                {children && (
                    <div className="ess-pro-feature-content ess-pro-disabled">
                        {children}
                    </div>
                )}
                <span className="ess-pro-label">
                    {__('Pro', 'easy-share-solution')}
                </span>
            </div>
        );
    }

    // For overlay style (covers entire section)
    if (overlay) {
        return (
            <div className="ess-pro-feature-overlay-container">
                <div className="ess-pro-feature-content ess-pro-blurred">
                    {children}
                </div>
                <div className="ess-pro-feature-overlay">
                    <div className="ess-pro-feature-overlay-content">
                        <h3>🔒 {title || __('Pro Feature', 'easy-share-solution')}</h3>
                        <p>{featureDescription}</p>
                        <Button 
                            isPrimary 
                            href={upgradeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ess-pro-button"
                        >
                            {__('Upgrade to Pro', 'easy-share-solution')}
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    // Default style (notice + disabled content)
    return (
        <div className="ess-pro-feature-container">
            {showNotice && (
                <Notice 
                    status="warning" 
                    isDismissible={false}
                    className="ess-pro-notice"
                >
                    <div className="ess-pro-notice-content">
                        <strong>{__('Pro Feature:', 'easy-share-solution')}</strong> {featureDescription}
                        <Button 
                            isSmall
                            isPrimary 
                            href={upgradeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ess-pro-notice-button ess-pro-button"
                        >
                            {__('Upgrade to Pro', 'easy-share-solution')}
                        </Button>
                    </div>
                </Notice>
            )}
            <div className="ess-pro-feature-content ess-pro-disabled">
                {children}
            </div>
        </div>
    );
};

export default ProFeature;
