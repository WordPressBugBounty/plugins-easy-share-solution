/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { 
    useBlockProps, 
    InspectorControls,
    BlockControls,
    AlignmentToolbar
} from '@wordpress/block-editor';
import {
    PanelBody,
    SelectControl,
    ToggleControl,
    ButtonGroup,
    Button,
    __experimentalGrid as Grid,
    __experimentalText as Text
} from '@wordpress/components';
import { useState, useEffect } from '@wordpress/element';

/**
 * Internal dependencies
 */
import { platforms } from '../utils/platforms';
import { PlatformIcon } from '../components/PlatformIcon';

/**
 * Edit component
 */
export default function Edit({ attributes, setAttributes }) {
    const { selectedPlatforms, iconStyle, layout, showLabels, alignment, showMoreButton } = attributes;
    const [availablePlatforms, setAvailablePlatforms] = useState([]);

    const blockProps = useBlockProps({
        className: `ess-share-block ess-layout-${layout} ess-align-${alignment}`,
    });

    // Load available platforms
    useEffect(() => {
        const platformsList = Object.keys(platforms).filter(key => key !== 'copy-link');
        setAvailablePlatforms(platformsList);
    }, []);

    const handlePlatformToggle = (platform) => {
        const isSelected = selectedPlatforms.includes(platform);
        let newSelected;

        if (isSelected) {
            newSelected = selectedPlatforms.filter(p => p !== platform);
        } else {
            if (selectedPlatforms.length >= 5) {
                // Free version limit
                return;
            }
            newSelected = [...selectedPlatforms, platform];
        }

        setAttributes({ selectedPlatforms: newSelected });
    };

    const renderPlatformButton = (platform) => {
        const platformData = platforms[platform];
        if (!platformData) return null;

        return (
            <div
                key={platform}
                className={`ess-share-button ess-platform-${platform} ess-style-${iconStyle}`}
                style={{ '--platform-color': platformData.color }}
            >
                <span className="ess-icon">
                    <PlatformIcon platform={platform} />
                </span>
                {showLabels && (
                    <span className="ess-label">{platformData.name}</span>
                )}
            </div>
        );
    };

    return (
        <>
            <InspectorControls>
                <PanelBody title={__('Platform Settings', 'easy-share-solution')}>
                    <Text>
                        {__('Select up to 5 platforms (Free version)', 'easy-share-solution')}
                    </Text>
                    <div style={{ marginTop: '10px' }}>
                        <Grid columns={2} gap={2}>
                            {availablePlatforms.map(platform => {
                                const platformData = platforms[platform];
                                const isSelected = selectedPlatforms.includes(platform);
                                
                                return (
                                    <Button
                                        key={platform}
                                        variant={isSelected ? 'primary' : 'secondary'}
                                        onClick={() => handlePlatformToggle(platform)}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'flex-start',
                                            gap: '8px',
                                            height: '36px',
                                            fontSize: '12px'
                                        }}
                                        disabled={!isSelected && selectedPlatforms.length >= 5}
                                    >
                                        <PlatformIcon platform={platform} size={16} />
                                        {platformData.name}
                                    </Button>
                                );
                            })}
                        </Grid>
                    </div>
                    {selectedPlatforms.length >= 5 && (
                        <Text style={{ color: '#d63638', fontSize: '12px', marginTop: '8px' }}>
                            {__('Maximum 5 platforms in free version. Upgrade to Pro for unlimited platforms.', 'easy-share-solution')}
                        </Text>
                    )}
                </PanelBody>

                <PanelBody title={__('Display Settings', 'easy-share-solution')}>
                    <SelectControl
                        label={__('Icon Style', 'easy-share-solution')}
                        value={iconStyle}
                        options={[
                            { label: __('Circle', 'easy-share-solution'), value: 'circle' },
                            { label: __('Square', 'easy-share-solution'), value: 'square' }
                        ]}
                        onChange={(value) => setAttributes({ iconStyle: value })}
                    __next40pxDefaultSize={true}
                    __nextHasNoMarginBottom={true}
                    />
                    
                    <SelectControl
                        label={__('Layout', 'easy-share-solution')}
                        value={layout}
                        options={[
                            { label: __('Horizontal', 'easy-share-solution'), value: 'horizontal' },
                            { label: __('Vertical', 'easy-share-solution'), value: 'vertical' }
                        ]}
                        onChange={(value) => setAttributes({ layout: value })}
                    __next40pxDefaultSize={true}
                    __nextHasNoMarginBottom={true}
                    />
                    
                    <ToggleControl
                        label={__('Show Labels', 'easy-share-solution')}
                        checked={showLabels}
                        onChange={(value) => setAttributes({ showLabels: value })}
                    __nextHasNoMarginBottom={true}
                    />
                    
                    <ToggleControl
                        label={__('Show More Button', 'easy-share-solution')}
                        help={__('Display a "More" button that opens a popup with all available platforms', 'easy-share-solution')}
                        checked={showMoreButton}
                        onChange={(value) => setAttributes({ showMoreButton: value })}
                    __nextHasNoMarginBottom={true}
                    />
                </PanelBody>
            </InspectorControls>

            <BlockControls>
                <AlignmentToolbar
                    value={alignment}
                    onChange={(value) => setAttributes({ alignment: value })}
                />
            </BlockControls>

            <div {...blockProps}>
                <div style={{ marginBottom: '10px', fontSize: '12px', color: '#666' }}>
                    {__('Easy Share Buttons Preview:', 'easy-share-solution')}
                </div>
                
                {selectedPlatforms.length === 0 ? (
                    <div style={{ 
                        padding: '20px', 
                        border: '2px dashed #ccc', 
                        borderRadius: '4px',
                        textAlign: 'center',
                        color: '#666'
                    }}>
                        {__('Select platforms in the sidebar to display share buttons', 'easy-share-solution')}
                    </div>
                ) : (
                    <div className={`ess-preview-container ess-layout-${layout}`}>
                        {selectedPlatforms.map(renderPlatformButton)}
                        
                        {/* Copy link button */}
                        <div className={`ess-share-button ess-platform-copy-link ess-style-${iconStyle}`}>
                            <span className="ess-icon">
                                <PlatformIcon platform="copy-link" />
                            </span>
                            {showLabels && (
                                <span className="ess-label">{__('Copy Link', 'easy-share-solution')}</span>
                            )}
                        </div>
                        
                        {/* More button */}
                        {showMoreButton && (
                            <div className={`ess-share-button ess-more-button ess-style-${iconStyle}`}>
                                <span className="ess-icon">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                                    </svg>
                                </span>
                                {showLabels && (
                                    <span className="ess-label">{__('More', 'easy-share-solution')}</span>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </>
    );
}
