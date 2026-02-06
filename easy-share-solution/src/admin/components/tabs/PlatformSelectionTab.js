/**
 * Platform Selection Tab Component
 */

import { useState, useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { 
    Card, 
    CardBody, 
    CheckboxControl, 
    SearchControl,
    Notice,
    Button,
    Spinner,
    RangeControl,
    Modal,
    SelectControl
} from '@wordpress/components';
import apiFetch from '@wordpress/api-fetch';
import { platforms } from '../../../utils/platforms';
import ProFeature from '../ProFeature';

const PlatformSelectionTab = ({ settings, updateSetting, isProActive, hasProFeature }) => {
    const [availablePlatforms, setAvailablePlatforms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [draggedItem, setDraggedItem] = useState(null);
    const [dragOverItem, setDragOverItem] = useState(null);
    const [showMoreModal, setShowMoreModal] = useState(false);
    const [visibleCount, setVisibleCount] = useState(settings.visible_platforms_count || 4);

    // Platform categories for filtering - matching trait file categories
    const categories = {
        all: __('All Platforms', 'easy-share-solution'),
        social: __('Social Media', 'easy-share-solution'),
        messaging: __('Messaging', 'easy-share-solution'),
        professional: __('Professional', 'easy-share-solution'),
        visual: __('Visual', 'easy-share-solution'),
        communication: __('Communication', 'easy-share-solution'),
        bookmarking: __('Bookmarking', 'easy-share-solution'),
        developer: __('Developer', 'easy-share-solution'),
        gaming: __('Gaming', 'easy-share-solution'),
        video: __('Video', 'easy-share-solution'),
        publishing: __('Publishing', 'easy-share-solution'),
        entertainment: __('Entertainment', 'easy-share-solution'),
        academic: __('Academic', 'easy-share-solution'),
        finance: __('Finance', 'easy-share-solution'),
        shopping: __('Shopping', 'easy-share-solution'),
        lifestyle: __('Lifestyle', 'easy-share-solution'),
        utility: __('Utility', 'easy-share-solution')
    };

    // Load available platforms
    useEffect(() => {
        const loadPlatforms = async () => {
            try {
                const response = await apiFetch({
                    path: '/easy-share/v1/platforms',
                    method: 'GET'
                });
                
                if (response.success && response.data.platforms) {
                    setAvailablePlatforms(Object.entries(response.data.platforms).map(([key, platform]) => ({
                        id: key,
                        ...platform
                    })));
                } else {
                    // Use platforms from utils as fallback
                    setAvailablePlatforms(getDefaultPlatforms());
                }
            } catch (error) {
                console.error('Failed to load platforms:', error);
                // Fallback to hardcoded platforms
                setAvailablePlatforms(getDefaultPlatforms());
            } finally {
                setLoading(false);
            }
        };

        loadPlatforms();
    }, []);

    // Default platforms fallback
    const getDefaultPlatforms = () => {
        return Object.entries(platforms).map(([id, platform]) => ({
            id,
            name: platform.name,
            color: platform.color,
            category: getCategoryForPlatform(id)
        }));
    };

    // Helper function to categorize platforms
    const getCategoryForPlatform = (platformId) => {
        // Use the category from platforms.js if available
        const platformData = platforms[platformId];
        if (platformData && platformData.category) {
            return platformData.category;
        }
        
        // Fallback categorization
        const socialPlatforms = ['facebook', 'x_com', 'instagram', 'pinterest', 'reddit', 'tumblr', 'tiktok', 'snapchat', 'vk', 'odnoklassniki', 'weibo', 'qq', 'douban', 'baidu', 'digg', 'stumbleupon', 'flipboard', 'mix'];
        const messagingPlatforms = ['whatsapp', 'telegram', 'messenger', 'viber', 'line', 'wechat', 'sms', 'teams', 'kik', 'threema', 'signal'];
        const professionalPlatforms = ['linkedin', 'slack', 'zoom', 'xing', 'behance', 'dribbble'];
        const visualPlatforms = ['pinterest', 'instagram'];
        const communicationPlatforms = ['email'];
        const bookmarkingPlatforms = ['pocket', 'evernote', 'instapaper'];
        const developerPlatforms = ['github', 'gitlab', 'stackoverflow', 'dev', 'hackernews'];
        const gamingPlatforms = ['discord', 'twitch'];
        const videoPlatforms = ['youtube', 'tiktok'];
        const publishingPlatforms = ['medium', 'wordpress', 'blogger'];
        const entertainmentPlatforms = ['spotify', 'soundcloud'];
        const academicPlatforms = ['mendeley', 'researchgate', 'academia'];
        const financePlatforms = ['coinbase'];
        const shoppingPlatforms = ['amazon', 'ebay', 'etsy'];
        const lifestylePlatforms = ['foursquare', 'yelp'];
        const utilityPlatforms = ['copy-link', 'print', 'qr-code'];
        
        if (socialPlatforms.includes(platformId)) return 'social';
        if (messagingPlatforms.includes(platformId)) return 'messaging';
        if (professionalPlatforms.includes(platformId)) return 'professional';
        if (visualPlatforms.includes(platformId)) return 'visual';
        if (communicationPlatforms.includes(platformId)) return 'communication';
        if (bookmarkingPlatforms.includes(platformId)) return 'bookmarking';
        if (developerPlatforms.includes(platformId)) return 'developer';
        if (gamingPlatforms.includes(platformId)) return 'gaming';
        if (videoPlatforms.includes(platformId)) return 'video';
        if (publishingPlatforms.includes(platformId)) return 'publishing';
        if (entertainmentPlatforms.includes(platformId)) return 'entertainment';
        if (academicPlatforms.includes(platformId)) return 'academic';
        if (financePlatforms.includes(platformId)) return 'finance';
        if (shoppingPlatforms.includes(platformId)) return 'shopping';
        if (lifestylePlatforms.includes(platformId)) return 'lifestyle';
        if (utilityPlatforms.includes(platformId)) return 'utility';
        
        return 'social'; // default fallback
    };

    // Get ordered platforms based on settings
    const getOrderedPlatforms = () => {
        const selectedPlatforms = settings.selected_platforms || [];
        const platformOrder = settings.platform_order || [];
        
        // Create ordered list: first use platform_order, then add any new selected platforms
        const orderedIds = [...platformOrder];
        
        // Add any selected platforms that aren't in the order yet
        selectedPlatforms.forEach(id => {
            if (!orderedIds.includes(id)) {
                orderedIds.push(id);
            }
        });
        
        // Filter to only include actually selected platforms and ensure platform data exists
        return orderedIds
            .filter(id => selectedPlatforms.includes(id))
            .map(id => availablePlatforms.find(p => p.id === id))
            .filter(Boolean);
    };

    // Handle platform selection
    const handlePlatformToggle = (platformId, isChecked) => {
        const currentPlatforms = settings.selected_platforms || [];
        const currentOrder = settings.platform_order || [];
        let newPlatforms;
        let newOrder;

        if (isChecked) {
            // Comment out Pro check for development
            // if (!isProActive && currentPlatforms.length >= 12) {
            //     return; // Don't allow more than 12 for free users
            // }
            newPlatforms = [...currentPlatforms, platformId];
            newOrder = [...currentOrder];
            
            // Add to order if not already there
            if (!newOrder.includes(platformId)) {
                newOrder.push(platformId);
            }
        } else {
            newPlatforms = currentPlatforms.filter(id => id !== platformId);
            newOrder = currentOrder.filter(id => id !== platformId);
        }

        updateSetting('selected_platforms', newPlatforms);
        updateSetting('platform_order', newOrder);
    };

    // Handle drag start
    const handleDragStart = (e, platformId) => {
        setDraggedItem(platformId);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', platformId);
        
        // Add some visual feedback
        e.target.style.opacity = '0.5';
    };

    // Handle drag end
    const handleDragEnd = (e) => {
        e.target.style.opacity = '1';
        setDraggedItem(null);
        setDragOverItem(null);
    };

    // Handle drag over
    const handleDragOver = (e, platformId) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        
        if (draggedItem && draggedItem !== platformId) {
            setDragOverItem(platformId);
        }
    };

    // Handle drag enter
    const handleDragEnter = (e, platformId) => {
        e.preventDefault();
        if (draggedItem && draggedItem !== platformId) {
            setDragOverItem(platformId);
        }
    };

    // Handle drag leave
    const handleDragLeave = (e) => {
        // Only clear if we're actually leaving the element
        if (!e.currentTarget.contains(e.relatedTarget)) {
            setDragOverItem(null);
        }
    };

    // Handle drop
    const handleDrop = (e, targetPlatformId) => {
        e.preventDefault();
        
        if (!draggedItem || draggedItem === targetPlatformId) {
            setDraggedItem(null);
            setDragOverItem(null);
            return;
        }

        const currentOrder = settings.platform_order || settings.selected_platforms || [];
        const newOrder = [...currentOrder];
        
        const draggedIndex = newOrder.indexOf(draggedItem);
        const targetIndex = newOrder.indexOf(targetPlatformId);
        
        if (draggedIndex !== -1 && targetIndex !== -1) {
            // Remove dragged item from its current position
            newOrder.splice(draggedIndex, 1);
            
            // Calculate new insertion index
            const newTargetIndex = draggedIndex < targetIndex ? targetIndex - 1 : targetIndex;
            
            // Insert dragged item at new position
            newOrder.splice(newTargetIndex, 0, draggedItem);
            
            // Update the platform order
            updateSetting('platform_order', newOrder);
        }
        
        setDraggedItem(null);
        setDragOverItem(null);
    };

    // Handle visible count change
    const handleVisibleCountChange = (count) => {
        setVisibleCount(count);
        updateSetting('visible_platforms_count', count);
    };

    // Filter platforms based on search and category
    const filteredPlatforms = availablePlatforms.filter(platform => {
        const matchesSearch = platform.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || platform.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    // Select all platforms in current filter
    const selectAllFiltered = () => {
        const currentPlatforms = settings.selected_platforms || [];
        const filteredIds = filteredPlatforms.map(p => p.id);
        const newPlatforms = [...new Set([...currentPlatforms, ...filteredIds])];
        
        // Comment out Pro limitation for development
        // if (!isProActive && newPlatforms.length > 12) {
        //     updateSetting('selected_platforms', newPlatforms.slice(0, 12));
        // } else {
            updateSetting('selected_platforms', newPlatforms);
        // }
    };

    // Deselect all platforms in current filter
    const deselectAllFiltered = () => {
        const currentPlatforms = settings.selected_platforms || [];
        const filteredIds = filteredPlatforms.map(p => p.id);
        const newPlatforms = currentPlatforms.filter(id => !filteredIds.includes(id));
        updateSetting('selected_platforms', newPlatforms);
    };

    if (loading) {
        return (
            <div className="ess-loading-container">
                <Spinner />
                <p>{__('Loading platforms...', 'easy-share-solution')}</p>
            </div>
        );
    }

    const orderedPlatforms = getOrderedPlatforms();
    const selectedPlatforms = settings.selected_platforms || [];

    return (
        <div className="ess-platform-selection-tab">
            <Card>
                <CardBody>
                    <h2>{__('Platform Selection & Ordering', 'easy-share-solution')}</h2>
                    <p className="ess-tab-description">
                        {__('Choose which platforms to display and arrange their order. The first platforms will be shown directly, while others appear in a "More" popup.', 'easy-share-solution')}
                    </p>

                    

                    {/* Visible Count Control */}
                    <Card>
                        <CardBody>
                            <h3>{__('Display Settings', 'easy-share-solution')}</h3>
                            <RangeControl label={__('Number of platforms to show directly', 'easy-share-solution')}
                                value={visibleCount}
                                onChange={handleVisibleCountChange}
                                min={2}
                                max={8}
                                help={__('Remaining platforms will appear in a "More" popup.', 'easy-share-solution')} __next40pxDefaultSize={true} __nextHasNoMarginBottom={true} />
                        </CardBody>
                    </Card>

                    {/* Selected Platforms with Drag & Drop */}
                    {selectedPlatforms.length > 0 && (
                        <Card>
                            <CardBody>
                                <h3>
                                    {isProActive 
                                        ? __('Selected Platforms (Drag to Reorder)', 'easy-share-solution')
                                        : __('Selected Platforms', 'easy-share-solution')
                                    }
                                    {!isProActive && (
                                        <ProFeature
                                            isProActive={isProActive}
                                            hasProFeature={hasProFeature}
                                            feature="platform_drag_sort"
                                            inline={true}
                                        />
                                    )}
                                </h3>
                                {!isProActive && (
                                    <Notice status="info" isDismissible={false} style={{ marginBottom: '16px' }}>
                                        <strong>{__('Pro Feature:', 'easy-share-solution')}</strong> {__('Drag and drop to reorder platforms is available in the Pro version.', 'easy-share-solution')}
                                    </Notice>
                                )}
                                <div className="ess-selected-platforms-grid">
                                    {orderedPlatforms.map((platform, index) => (
                                        <div
                                            key={platform.id}
                                            className={`ess-platform-item ess-platform-item--selected ${
                                                isProActive ? 'ess-platform-item--draggable' : 'ess-drag-disabled'
                                            } ${
                                                draggedItem === platform.id ? 'ess-platform-item--dragging' : ''
                                            } ${
                                                dragOverItem === platform.id ? 'ess-platform-item--drag-over' : ''
                                            } ${
                                                index < visibleCount ? 'ess-platform-item--primary' : 'ess-platform-item--secondary'
                                            }`}
                                            draggable={isProActive}
                                            onDragStart={isProActive ? (e) => handleDragStart(e, platform.id) : undefined}
                                            onDragEnd={isProActive ? handleDragEnd : undefined}
                                            onDragOver={isProActive ? (e) => handleDragOver(e, platform.id) : undefined}
                                            onDragEnter={isProActive ? (e) => handleDragEnter(e, platform.id) : undefined}
                                            onDragLeave={isProActive ? handleDragLeave : undefined}
                                            onDrop={isProActive ? (e) => handleDrop(e, platform.id) : undefined}
                                        >
                                            <div className={`ess-platform-drag-handle ${!isProActive ? 'ess-drag-handle' : ''}`}>
                                                {isProActive ? '⋮⋮' : '🔒'}
                                            </div>
                                            <div 
                                                className="ess-platform-icon"
                                                style={{ backgroundColor: platform.color || '#007cba' }}
                                            >
                                                {platform.name.charAt(0).toUpperCase()}
                                            </div>
                                            <span className="ess-platform-name">{platform.name}</span>
                                            <span className="ess-platform-position">
                                                {index < visibleCount 
                                                    ? __('Primary', 'easy-share-solution') 
                                                    : __('More', 'easy-share-solution')
                                                }
                                            </span>
                                            <Button
                                                isDestructive
                                                isSmall
                                                onClick={() => handlePlatformToggle(platform.id, false)}
                                                className="ess-platform-remove"
                                            >
                                                ×
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                                
                                {orderedPlatforms.length > visibleCount && (
                                    <Notice status="info" isDismissible={false}>
                                        <strong>{__('Display Preview:', 'easy-share-solution')}</strong>
                                        {' '}
                                        {__('First', 'easy-share-solution')} {visibleCount} {__('platforms will show directly, remaining', 'easy-share-solution')} {orderedPlatforms.length - visibleCount} {__('will appear in "More" popup.', 'easy-share-solution')}
                                    </Notice>
                                )}
                            </CardBody>
                        </Card>
                    )}

                    {/* Add More Platforms */}
                    <ProFeature
                        isProActive={isProActive}
                        feature="add_more_platforms"
                        hasProFeature={hasProFeature}
                        title={__('Unlock More Platforms', 'easy-share-solution')}
                        description={__('Access 60+ social media platforms including Discord, Twitch, Medium, WordPress, Blogger, and many more. Expand your reach with Pro!', 'easy-share-solution')}
                        overlay={true}
                    >
                        <Card>
                            <CardBody>
                                <div className="ess-platform-add-section">
                                    <h3>{__('Add Platforms', 'easy-share-solution')}</h3>
                                    
                                    <Button 
                                        isPrimary 
                                        onClick={() => setShowMoreModal(true)}
                                        className="ess-add-platforms-btn"
                                        disabled={!isProActive}
                                    >
                                        {__('+ Add More Platforms', 'easy-share-solution')}
                                    </Button>

                                    {/* Available platforms preview */}
                                    <div className="ess-available-platforms-preview">
                                        {availablePlatforms
                                            .filter(platform => !selectedPlatforms.includes(platform.id))
                                            .slice(0, 6)
                                            .map(platform => (
                                                <div
                                                    key={platform.id}
                                                    className="ess-platform-preview-item"
                                                    onClick={() => handlePlatformToggle(platform.id, true)}
                                                >
                                                    <div 
                                                        className="ess-platform-preview-icon"
                                                        style={{ backgroundColor: platform.color || '#007cba' }}
                                                    >
                                                        {platform.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <span>{platform.name}</span>
                                                </div>
                                            ))
                                        }
                                        {availablePlatforms.filter(platform => !selectedPlatforms.includes(platform.id)).length > 6 && (
                                            <div className="ess-platform-preview-more">
                                                +{availablePlatforms.filter(platform => !selectedPlatforms.includes(platform.id)).length - 6} {__('more', 'easy-share-solution')}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                    </ProFeature>

                    {/* Modal for adding platforms */}
                    {showMoreModal && (
                        <Modal
                            title={__('Select Platforms', 'easy-share-solution')}
                            onRequestClose={() => setShowMoreModal(false)}
                            className="ess-platform-selection-modal"
                        >
                            {/* Search and Filter Controls */}
                            <div className="ess-platform-controls">
                                <SearchControl
                                    value={searchTerm}
                                    onChange={setSearchTerm}
                                    placeholder={__('Search platforms...', 'easy-share-solution')}
                                />

                                <SelectControl
                                    label={__('Category', 'easy-share-solution')}
                                    value={selectedCategory}
                                    options={Object.entries(categories).map(([value, label]) => ({
                                        value,
                                        label
                                    }))}
                                    onChange={setSelectedCategory}
                                __next40pxDefaultSize={true}
                                __nextHasNoMarginBottom={true}
                                />

                                <div className="ess-platform-bulk-actions">
                                    <Button 
                                        isSecondary 
                                        size="small"
                                        onClick={selectAllFiltered}
                                        // Removed Pro limitation check
                                        // disabled={!isProActive && (settings.selected_platforms?.length || 0) >= 12}
                                    >
                                        {__('Select All', 'easy-share-solution')}
                                    </Button>
                                    <Button 
                                        isSecondary 
                                        size="small"
                                        onClick={deselectAllFiltered}
                                    >
                                        {__('Deselect All', 'easy-share-solution')}
                                    </Button>
                                </div>
                            </div>

                            {/* Platform Grid */}
                            <div className="ess-platform-grid">
                                {filteredPlatforms.map((platform) => {
                                    const isSelected = selectedPlatforms.includes(platform.id);
                                    // Check if platform is Pro-only
                                    const isProOnlyPlatform = ['print', 'qr-code'].includes(platform.id);
                                    const isDisabled = isProOnlyPlatform && !isProActive && !isSelected;

                                    const platformContent = (
                                        <div 
                                            key={platform.id} 
                                            className={`ess-platform-item ${isSelected ? 'ess-platform-item--selected' : ''} ${isDisabled ? 'ess-platform-item--disabled' : ''}`}
                                        >
                                            <CheckboxControl
                                                label=""
                                                checked={isSelected}
                                                disabled={isDisabled}
                                                onChange={(checked) => handlePlatformToggle(platform.id, checked)}
                                            __nextHasNoMarginBottom={true}
                                            />
                                            <div 
                                                className="ess-platform-icon"
                                                style={{ backgroundColor: platform.color || '#007cba' }}
                                            >
                                                {platform.name.charAt(0).toUpperCase()}
                                            </div>
                                            <span className="ess-platform-name">
                                                {platform.name}
                                                {isProOnlyPlatform && !isProActive && (
                                                    <span className="ess-pro-label" style={{ marginLeft: '4px' }}>
                                                        {__('Pro', 'easy-share-solution')}
                                                    </span>
                                                )}
                                            </span>
                                            {platform.category && (
                                                <span className="ess-platform-category">{platform.category}</span>
                                            )}
                                        </div>
                                    );

                                    // If it's a Pro-only platform and user is free, wrap with ProFeature for info
                                    if (isProOnlyPlatform && !isProActive) {
                                        return (
                                            <ProFeature
                                                key={platform.id}
                                                isProActive={isProActive}
                                                hasProFeature={hasProFeature}
                                                feature={platform.id === 'qr-code' ? 'qr_code_button' : 'print_button'}
                                                showNotice={false}
                                            >
                                                {platformContent}
                                            </ProFeature>
                                        );
                                    }

                                    return platformContent;
                                })}
                            </div>

                            {filteredPlatforms.length === 0 && (
                                <div className="ess-no-platforms">
                                    <p>{__('No platforms found matching your search criteria.', 'easy-share-solution')}</p>
                                </div>
                            )}

                            <div className="ess-modal-footer">
                                <Button isPrimary onClick={() => setShowMoreModal(false)}>
                                    {__('Done', 'easy-share-solution')}
                                </Button>
                            </div>
                        </Modal>
                    )}

                    {/* Selection Summary */}
                    <div className="ess-platform-summary">
                        <p>
                            <strong>
                                {__('Selected:', 'easy-share-solution')} {selectedPlatforms.length}
                                {/* Removed Pro limitation display */}
                                {/* {!isProActive && ` / 12`} */}
                            </strong>
                        </p>
                    </div>
                </CardBody>
            </Card>
        </div>
    );
};

export default PlatformSelectionTab;
