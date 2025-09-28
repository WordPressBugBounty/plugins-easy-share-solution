/**
 * Design Settings Tab Component - Advanced Floating Panel & Social Icons Design
 */

import { __ } from '@wordpress/i18n';
import { 
    Card, 
    CardBody, 
    RangeControl, 
    Notice,
    Button,
    ColorPicker,
    ToggleControl,
    SelectControl,
    TextControl,
    PanelBody,
    PanelRow
} from '@wordpress/components';
import { useState, useEffect, useRef } from '@wordpress/element';
import ProFeature from '../ProFeature';

const DesignSettingsTab = ({ settings, updateSetting, updateNestedSetting, isProActive, hasProFeature }) => {
    const [activeTab, setActiveTab] = useState('floating-design');
    const [activePreset, setActivePreset] = useState('custom'); // Track which preset is active
    const [activePopupPreset, setActivePopupPreset] = useState('default'); // Track popup preset
    const [showColorPickers, setShowColorPickers] = useState({
        primary: false,
        secondary: false,
        text: false,
        background: false,
        hover: false,
        floatingBg: false,
        floatingBorder: false,
        floatingIcon: false,
        floatingHover: false,
        shadowColor: false
    });

    // Safely handle settings object
    const safeSettings = settings || {};
    const safeColors = safeSettings.colors || {};
    const floatingDesign = safeSettings.floating_design || {};

    // Set initial active preset from settings and detect changes
    useEffect(() => {
        if (floatingDesign.active_preset) {
            setActivePreset(floatingDesign.active_preset);
        } else {
            // Check if current settings match any preset
            const currentPreset = detectCurrentPreset(floatingDesign);
            setActivePreset(currentPreset);
        }
    }, [floatingDesign]);

    // Function to detect which preset matches current settings
    const detectCurrentPreset = (design) => {
        const presets = getPresetDefinitions();
        
        for (const [presetName, presetSettings] of Object.entries(presets)) {
            const matches = Object.entries(presetSettings).every(([key, value]) => {
                return design[key] === value;
            });
            if (matches) {
                return presetName;
            }
        }
        
        return 'custom'; // If no preset matches, it's custom
    };

    // Define all preset configurations
    const getPresetDefinitions = () => ({
        'modern-glass': {
            background_style: 'glass',
            background_color: '#ffffff',
            icon_style: 'circle',
            hover_animation: 'scale',
            entrance_animation: 'fadeIn'
        },
        'vibrant-neon': {
            background_style: 'solid',
            background_color: '#1a1a1a',
            icon_style: 'rounded',
            hover_animation: 'glow',
            entrance_animation: 'bounceIn',
            use_platform_colors: false,
            icon_color: '#00ff88'
        },
        'minimal-clean': {
            background_style: 'solid',
            background_color: '#ffffff',
            icon_style: 'circle',
            hover_animation: 'lift',
            entrance_animation: 'slideInUp',
            use_platform_colors: false,
            icon_color: '#333333'
        },
        'gradient-flow': {
            background_style: 'gradient',
            background_color: '#ff6b6b',
            icon_style: 'rounded',
            hover_animation: 'pulse',
            entrance_animation: 'zoomIn',
            use_platform_colors: true
        },
        'dark-mode': {
            background_style: 'solid',
            background_color: '#2d3748',
            icon_style: 'square',
            hover_animation: 'rotate',
            entrance_animation: 'slideInRight',
            use_platform_colors: false,
            icon_color: '#a0aec0'
        },
        'retro-style': {
            background_style: 'solid',
            background_color: '#f7dc6f',
            icon_style: 'hexagon',
            hover_animation: 'wobble',
            entrance_animation: 'flipInX',
            use_platform_colors: false,
            icon_color: '#8b4513'
        }
    });

    // Popup presets configuration - 6 beautiful presets for share popups
    const [popupPresets] = useState({
        'default': {
            name: __('Default Clean', 'easy-share-solution'),
            description: __('Clean and professional popup with subtle gradients', 'easy-share-solution'),
            header_background: 'linear-gradient(135deg, #f8f9fd 0%, #ffffff 100%)',
            header_text_color: '#2d3748',
            header_text_gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            body_background: '#ffffff',
            category_title_color: '#2d3748',
            platform_background: 'linear-gradient(135deg, #ffffff 0%, #f7fafc 100%)',
            platform_border: '#e2e8f0',
            platform_text_color: '#4a5568',
            animation_speed: '0.4s',
            border_radius: '20px',
            backdrop_blur: '8px'
        },
        'modern-dark': {
            name: __('Modern Dark', 'easy-share-solution'),
            description: __('Sleek dark theme with blue accents', 'easy-share-solution'),
            header_background: 'linear-gradient(135deg, #1a202c 0%, #2d3748 100%)',
            header_text_color: '#e2e8f0',
            header_text_gradient: 'linear-gradient(135deg, #4299e1 0%, #3182ce 100%)',
            body_background: '#1a202c',
            category_title_color: '#e2e8f0',
            platform_background: 'linear-gradient(135deg, #2d3748 0%, #1a202c 100%)',
            platform_border: '#4a5568',
            platform_text_color: '#e2e8f0',
            animation_speed: '0.3s',
            border_radius: '16px',
            backdrop_blur: '12px'
        },
        'vibrant-gradient': {
            name: __('Vibrant Gradient', 'easy-share-solution'),
            description: __('Colorful gradient design with rainbow effects', 'easy-share-solution'),
            header_background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            header_text_color: '#ffffff',
            header_text_gradient: 'none',
            body_background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
            category_title_color: '#744c7a',
            platform_background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 50%, #ff9a9e 100%)',
            platform_border: '#e91e63',
            platform_text_color: '#744c7a',
            animation_speed: '0.5s',
            border_radius: '24px',
            backdrop_blur: '6px'
        },
        'minimal-glass': {
            name: __('Minimal Glass', 'easy-share-solution'),
            description: __('Glassmorphism design with transparency effects', 'easy-share-solution'),
            header_background: 'rgba(255, 255, 255, 0.25)',
            header_text_color: '#2d3748',
            header_text_gradient: 'linear-gradient(135deg, #4299e1 0%, #3182ce 100%)',
            body_background: 'rgba(255, 255, 255, 0.1)',
            category_title_color: '#2d3748',
            platform_background: 'rgba(255, 255, 255, 0.2)',
            platform_border: 'rgba(255, 255, 255, 0.3)',
            platform_text_color: '#2d3748',
            animation_speed: '0.4s',
            border_radius: '20px',
            backdrop_blur: '20px'
        },
        'retro-warm': {
            name: __('Retro Warm', 'easy-share-solution'),
            description: __('Warm retro colors with vintage feel', 'easy-share-solution'),
            header_background: 'linear-gradient(135deg, #f7dc6f 0%, #f39c12 100%)',
            header_text_color: '#8b4513',
            header_text_gradient: 'none',
            body_background: '#fff8e1',
            category_title_color: '#8b4513',
            platform_background: 'linear-gradient(135deg, #fef9e7 0%, #f7dc6f 100%)',
            platform_border: '#f39c12',
            platform_text_color: '#8b4513',
            animation_speed: '0.6s',
            border_radius: '16px',
            backdrop_blur: '4px'
        },
        'neon-cyber': {
            name: __('Neon Cyber', 'easy-share-solution'),
            description: __('Futuristic neon design with glowing effects', 'easy-share-solution'),
            header_background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 100%)',
            header_text_color: '#00ffff',
            header_text_gradient: 'linear-gradient(135deg, #00ffff 0%, #ff00ff 100%)',
            body_background: '#0f0f23',
            category_title_color: '#00ffff',
            platform_background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
            platform_border: '#00ffff',
            platform_text_color: '#00ffff',
            animation_speed: '0.3s',
            border_radius: '12px',
            backdrop_blur: '16px'
        }
    });

    // Update color setting with proper error handling
    const updateColorSetting = (colorKey, value) => {
        try {
            if (typeof updateNestedSetting === 'function') {
                updateNestedSetting('colors', colorKey, value);
            } else if (typeof updateSetting === 'function') {
                const newColors = { ...safeColors, [colorKey]: value };
                updateSetting('colors', newColors);
            }
        } catch (error) {
            console.error('Error updating color setting:', error);
        }
    };

    // Update floating design setting
    const updateFloatingDesign = (designKey, value) => {
        try {
            if (typeof updateNestedSetting === 'function') {
                updateNestedSetting('floating_design', designKey, value);
            } else if (typeof updateSetting === 'function') {
                const newFloatingDesign = { ...floatingDesign, [designKey]: value };
                updateSetting('floating_design', newFloatingDesign);
            }
        } catch (error) {
            console.error('Error updating floating design setting:', error);
        }
    };

    // Update popup preset setting
    const updatePopupPreset = (presetKey, value) => {
        try {
            if (typeof updateNestedSetting === 'function') {
                updateNestedSetting('popup_presets', presetKey, value);
            } else if (typeof updateSetting === 'function') {
                const safePopupPresets = safeSettings.popup_presets || {};
                const newPopupPresets = { ...safePopupPresets, [presetKey]: value };
                updateSetting('popup_presets', newPopupPresets);
            }
        } catch (error) {
            console.error('Error updating popup preset setting:', error);
        }
    };

    // Apply popup preset
    const applyPopupPreset = (presetName) => {
        try {
            const presetSettings = popupPresets[presetName];
            if (presetSettings) {
                // Apply preset settings
                updatePopupPreset('active_preset', presetName);
                Object.entries(presetSettings).forEach(([key, value]) => {
                    if (key !== 'name' && key !== 'description') {
                        updatePopupPreset(key, value);
                    }
                });
                
                // Update local state
                setActivePopupPreset(presetName);
            }
        } catch (error) {
            // Error applying popup preset - silent handling
        }
    };

    // Apply preset with active state tracking
    const applyPreset = (presetName, presetSettings) => {
        try {
            // Apply all preset settings
            Object.entries(presetSettings).forEach(([key, value]) => {
                if (typeof updateNestedSetting === 'function') {
                    updateNestedSetting('floating_design', key, value);
                } else if (typeof updateSetting === 'function') {
                    const newFloatingDesign = { ...floatingDesign, [key]: value };
                    updateSetting('floating_design', newFloatingDesign);
                }
            });
            
            // Set active preset
            setActivePreset(presetName);
            
            // Also save the active preset in settings for persistence
            if (typeof updateNestedSetting === 'function') {
                updateNestedSetting('floating_design', 'active_preset', presetName);
            } else if (typeof updateSetting === 'function') {
                const newFloatingDesign = { ...floatingDesign, active_preset: presetName };
                updateSetting('floating_design', newFloatingDesign);
            }
        } catch (error) {
            console.error('Error applying preset:', error);
        }
    };

    const toggleColorPicker = (colorKey) => {
        setShowColorPickers(prev => ({
            ...prev,
            [colorKey]: !prev[colorKey]
        }));
    };

    return (
        <div className="ess-design-settings-tab">
            <Card>
                <CardBody>
                    <h2>{__('Advanced Design & Styling', 'easy-share-solution')}</h2>
                    <p className="ess-tab-description">
                        {__('Create stunning floating panel designs with comprehensive styling options, animations, and effects for your social sharing icons.', 'easy-share-solution')}
                    </p>

                    {/* Vertical Tab Navigation */}
                    <div className="ess-vertical-tabs" style={{ marginBottom: '32px' }}>
                        <div style={{ 
                            display: 'flex', 
                            gap: '24px',
                            minHeight: '500px'
                        }}>
                            {/* Enhanced Sidebar Navigation */}
                            <div style={{
                                width: '220px',
                                flexShrink: 0,
                                borderRight: '2px solid #e0e0e0',
                                paddingRight: '16px'
                            }}>
                                <nav style={{ position: 'sticky', top: '20px' }}>
                                    <button
                                        onClick={() => setActiveTab('floating-design')}
                                        style={{
                                            display: 'block',
                                            width: '100%',
                                            padding: '14px 18px',
                                            margin: '0 0 8px 0',
                                            border: 'none',
                                            background: activeTab === 'floating-design' ? '#007cba' : '#f8f9fa',
                                            color: activeTab === 'floating-design' ? '#fff' : '#333',
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            fontWeight: activeTab === 'floating-design' ? '600' : '400',
                                            fontSize: '14px',
                                            textAlign: 'left',
                                            transition: 'all 0.2s ease',
                                            border: activeTab === 'floating-design' ? '2px solid #007cba' : '2px solid transparent'
                                        }}
                                        onMouseEnter={(e) => {
                                            if (activeTab !== 'floating-design') {
                                                e.target.style.background = '#e9ecef';
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (activeTab !== 'floating-design') {
                                                e.target.style.background = '#f8f9fa';
                                            }
                                        }}
                                    >
                                        � {__('Floating Panel Design', 'easy-share-solution')}
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('icon-styling')}
                                        style={{
                                            display: 'block',
                                            width: '100%',
                                            padding: '14px 18px',
                                            margin: '0 0 8px 0',
                                            border: 'none',
                                            background: activeTab === 'icon-styling' ? '#007cba' : '#f8f9fa',
                                            color: activeTab === 'icon-styling' ? '#fff' : '#333',
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            fontWeight: activeTab === 'icon-styling' ? '600' : '400',
                                            fontSize: '14px',
                                            textAlign: 'left',
                                            transition: 'all 0.2s ease',
                                            border: activeTab === 'icon-styling' ? '2px solid #007cba' : '2px solid transparent'
                                        }}
                                        onMouseEnter={(e) => {
                                            if (activeTab !== 'icon-styling') {
                                                e.target.style.background = '#e9ecef';
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (activeTab !== 'icon-styling') {
                                                e.target.style.background = '#f8f9fa';
                                            }
                                        }}
                                    >
                                        🎨 {__('Social Icon Styling', 'easy-share-solution')}
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('animations')}
                                        style={{
                                            display: 'block',
                                            width: '100%',
                                            padding: '14px 18px',
                                            margin: '0 0 8px 0',
                                            border: 'none',
                                            background: activeTab === 'animations' ? '#007cba' : '#f8f9fa',
                                            color: activeTab === 'animations' ? '#fff' : '#333',
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            fontWeight: activeTab === 'animations' ? '600' : '400',
                                            fontSize: '14px',
                                            textAlign: 'left',
                                            transition: 'all 0.2s ease',
                                            border: activeTab === 'animations' ? '2px solid #007cba' : '2px solid transparent'
                                        }}
                                        onMouseEnter={(e) => {
                                            if (activeTab !== 'animations') {
                                                e.target.style.background = '#e9ecef';
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (activeTab !== 'animations') {
                                                e.target.style.background = '#f8f9fa';
                                            }
                                        }}
                                    >
                                        ✨ {__('Animations & Effects', 'easy-share-solution')}
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('positioning')}
                                        style={{
                                            display: 'block',
                                            width: '100%',
                                            padding: '14px 18px',
                                            margin: '0 0 8px 0',
                                            border: 'none',
                                            background: activeTab === 'positioning' ? '#007cba' : '#f8f9fa',
                                            color: activeTab === 'positioning' ? '#fff' : '#333',
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            fontWeight: activeTab === 'positioning' ? '600' : '400',
                                            fontSize: '14px',
                                            textAlign: 'left',
                                            transition: 'all 0.2s ease',
                                            border: activeTab === 'positioning' ? '2px solid #007cba' : '2px solid transparent'
                                        }}
                                        onMouseEnter={(e) => {
                                            if (activeTab !== 'positioning') {
                                                e.target.style.background = '#e9ecef';
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (activeTab !== 'positioning') {
                                                e.target.style.background = '#f8f9fa';
                                            }
                                        }}
                                    >
                                        📐 {__('Position & Layout', 'easy-share-solution')}
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('popup-presets')}
                                        style={{
                                            display: 'block',
                                            width: '100%',
                                            padding: '14px 18px',
                                            margin: '0 0 8px 0',
                                            border: 'none',
                                            background: activeTab === 'popup-presets' ? '#007cba' : '#f8f9fa',
                                            color: activeTab === 'popup-presets' ? '#fff' : '#333',
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            fontWeight: activeTab === 'popup-presets' ? '600' : '400',
                                            fontSize: '14px',
                                            textAlign: 'left',
                                            transition: 'all 0.2s ease',
                                            border: activeTab === 'popup-presets' ? '2px solid #007cba' : '2px solid transparent'
                                        }}
                                        onMouseEnter={(e) => {
                                            if (activeTab !== 'popup-presets') {
                                                e.target.style.background = '#e9ecef';
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (activeTab !== 'popup-presets') {
                                                e.target.style.background = '#f8f9fa';
                                            }
                                        }}
                                    >
                                        🎨 {__('Popup Presets', 'easy-share-solution')}
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('responsive')}
                                        style={{
                                            display: 'block',
                                            width: '100%',
                                            padding: '14px 18px',
                                            margin: '0 0 8px 0',
                                            border: 'none',
                                            background: activeTab === 'responsive' ? '#007cba' : '#f8f9fa',
                                            color: activeTab === 'responsive' ? '#fff' : '#333',
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            fontWeight: activeTab === 'responsive' ? '600' : '400',
                                            fontSize: '14px',
                                            textAlign: 'left',
                                            transition: 'all 0.2s ease',
                                            border: activeTab === 'responsive' ? '2px solid #007cba' : '2px solid transparent'
                                        }}
                                        onMouseEnter={(e) => {
                                            if (activeTab !== 'responsive') {
                                                e.target.style.background = '#e9ecef';
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (activeTab !== 'responsive') {
                                                e.target.style.background = '#f8f9fa';
                                            }
                                        }}
                                    >
                                        📱 {__('Responsive Design', 'easy-share-solution')}
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('presets')}
                                        style={{
                                            display: 'block',
                                            width: '100%',
                                            padding: '14px 18px',
                                            margin: '0 0 8px 0',
                                            border: 'none',
                                            background: activeTab === 'presets' ? '#007cba' : '#f8f9fa',
                                            color: activeTab === 'presets' ? '#fff' : '#333',
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            fontWeight: activeTab === 'presets' ? '600' : '400',
                                            fontSize: '14px',
                                            textAlign: 'left',
                                            transition: 'all 0.2s ease',
                                            border: activeTab === 'presets' ? '2px solid #007cba' : '2px solid transparent'
                                        }}
                                        onMouseEnter={(e) => {
                                            if (activeTab !== 'presets') {
                                                e.target.style.background = '#e9ecef';
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (activeTab !== 'presets') {
                                                e.target.style.background = '#f8f9fa';
                                            }
                                        }}
                                    >
                                        🎭 {__('Design Presets', 'easy-share-solution')}
                                    </button>
                                </nav>
                            </div>

                            {/* Tab Content */}
                            <div className="ess-tab-content" style={{
                                flex: 1,
                                padding: '0 16px',
                                minHeight: '500px'
                            }}>

                            {/* Floating Panel Design Tab */}
                            {activeTab === 'floating-design' && (
                                <div className="ess-floating-design-tab">
                                    <h3>{__('Floating Panel Design', 'easy-share-solution')}</h3>
                                    <p>{__('Customize the appearance of your floating social panel with advanced styling options.', 'easy-share-solution')}</p>

                                    {/* Panel Background Style */}
                                    <div className="ess-setting-group" style={{ marginBottom: '24px' }}>
                                        <SelectControl
                                            label={__('Panel Background Style', 'easy-share-solution')}
                                            help={__('Choose the background style for the floating panel.', 'easy-share-solution')}
                                            value={floatingDesign.background_style || 'solid'}
                                            options={[
                                                { label: __('Solid Color', 'easy-share-solution'), value: 'solid' },
                                                { label: __('Gradient', 'easy-share-solution'), value: 'gradient' },
                                                { label: __('Glassmorphism', 'easy-share-solution'), value: 'glass' },
                                                { label: __('Neumorphism', 'easy-share-solution'), value: 'neomorphism' },
                                                { label: __('Transparent', 'easy-share-solution'), value: 'transparent' }
                                            ]}
                                            onChange={(value) => updateFloatingDesign('background_style', value)}
                                            __next40pxDefaultSize={true}
                                            __nextHasNoMarginBottom={true}
                                        />
                                    </div>

                                    {/* Panel Background Color */}
                                    <div className="ess-setting-group" style={{ marginBottom: '24px' }}>
                                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                                            {__('Panel Background Color', 'easy-share-solution')}
                                        </label>
                                        <p style={{ fontSize: '12px', color: '#666', marginBottom: '12px' }}>
                                            {__('Primary background color for the floating panel', 'easy-share-solution')}
                                        </p>
                                        
                                        <div style={{ position: 'relative' }}>
                                            <div 
                                                onClick={() => toggleColorPicker('floatingBg')}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '12px',
                                                    cursor: 'pointer',
                                                    padding: '12px',
                                                    border: '2px solid #ddd',
                                                    borderRadius: '8px',
                                                    background: '#fff'
                                                }}
                                            >
                                                <div 
                                                    style={{
                                                        width: '32px',
                                                        height: '32px',
                                                        borderRadius: '4px',
                                                        backgroundColor: floatingDesign.background_color || '#ffffff',
                                                        border: '2px solid #fff',
                                                        boxShadow: '0 0 0 1px #ddd'
                                                    }}
                                                />
                                                <div>
                                                    <div style={{ fontWeight: '500' }}>{__('Background Color', 'easy-share-solution')}</div>
                                                    <div style={{ fontSize: '12px', color: '#666' }}>{floatingDesign.background_color || '#ffffff'}</div>
                                                </div>
                                            </div>

                                            {showColorPickers.floatingBg && (
                                                <div style={{
                                                    position: 'absolute',
                                                    top: '100%',
                                                    left: '0',
                                                    zIndex: 1000,
                                                    marginTop: '8px',
                                                    padding: '16px',
                                                    background: '#fff',
                                                    border: '1px solid #ddd',
                                                    borderRadius: '8px',
                                                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                                                }}>
                                                    <ColorPicker
                                                        color={floatingDesign.background_color || '#ffffff'}
                                                        onChange={(color) => {
                                                            const newColor = color.hex || color;
                                                            updateFloatingDesign('background_color', newColor);
                                                        }}
                                                        enableAlpha={true}
                                                    />
                                                    <button 
                                                        onClick={() => toggleColorPicker('floatingBg')}
                                                        style={{
                                                            marginTop: '12px',
                                                            padding: '6px 12px',
                                                            background: '#007cba',
                                                            color: '#fff',
                                                            border: 'none',
                                                            borderRadius: '4px',
                                                            cursor: 'pointer'
                                                        }}
                                                    >
                                                        {__('Done', 'easy-share-solution')}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Gradient Colors - Show only when gradient is selected */}
                                    {floatingDesign.background_style === 'gradient' && (
                                        <>
                                            {/* Gradient Start Color */}
                                            <div className="ess-setting-group" style={{ marginBottom: '24px' }}>
                                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                                                    {__('Gradient Start Color', 'easy-share-solution')}
                                                </label>
                                                <p style={{ fontSize: '12px', color: '#666', marginBottom: '12px' }}>
                                                    {__('Starting color for the gradient background', 'easy-share-solution')}
                                                </p>
                                                
                                                <div style={{ position: 'relative' }}>
                                                    <div 
                                                        onClick={() => toggleColorPicker('gradientStart')}
                                                        style={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '12px',
                                                            cursor: 'pointer',
                                                            padding: '12px',
                                                            border: '2px solid #ddd',
                                                            borderRadius: '8px',
                                                            background: '#fff'
                                                        }}
                                                    >
                                                        <div 
                                                            style={{
                                                                width: '32px',
                                                                height: '32px',
                                                                borderRadius: '4px',
                                                                backgroundColor: floatingDesign.gradient_start_color || '#007cba',
                                                                border: '2px solid #fff',
                                                                boxShadow: '0 0 0 1px #ddd'
                                                            }}
                                                        />
                                                        <div>
                                                            <div style={{ fontWeight: '500' }}>{__('Start Color', 'easy-share-solution')}</div>
                                                            <div style={{ fontSize: '12px', color: '#666' }}>{floatingDesign.gradient_start_color || '#007cba'}</div>
                                                        </div>
                                                    </div>

                                                    {showColorPickers.gradientStart && (
                                                        <div style={{
                                                            position: 'absolute',
                                                            top: '100%',
                                                            left: '0',
                                                            zIndex: 1000,
                                                            marginTop: '8px',
                                                            padding: '16px',
                                                            background: '#fff',
                                                            border: '1px solid #ddd',
                                                            borderRadius: '8px',
                                                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                                                        }}>
                                                            <ColorPicker
                                                                color={floatingDesign.gradient_start_color || '#007cba'}
                                                                onChange={(color) => {
                                                                    const newColor = color.hex || color;
                                                                    updateFloatingDesign('gradient_start_color', newColor);
                                                                }}
                                                                enableAlpha={true}
                                                            />
                                                            <button 
                                                                onClick={() => toggleColorPicker('gradientStart')}
                                                                style={{
                                                                    marginTop: '12px',
                                                                    padding: '6px 12px',
                                                                    background: '#007cba',
                                                                    color: '#fff',
                                                                    border: 'none',
                                                                    borderRadius: '4px',
                                                                    cursor: 'pointer'
                                                                }}
                                                            >
                                                                {__('Done', 'easy-share-solution')}
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Gradient End Color */}
                                            <div className="ess-setting-group" style={{ marginBottom: '24px' }}>
                                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                                                    {__('Gradient End Color', 'easy-share-solution')}
                                                </label>
                                                <p style={{ fontSize: '12px', color: '#666', marginBottom: '12px' }}>
                                                    {__('Ending color for the gradient background', 'easy-share-solution')}
                                                </p>
                                                
                                                <div style={{ position: 'relative' }}>
                                                    <div 
                                                        onClick={() => toggleColorPicker('gradientEnd')}
                                                        style={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '12px',
                                                            cursor: 'pointer',
                                                            padding: '12px',
                                                            border: '2px solid #ddd',
                                                            borderRadius: '8px',
                                                            background: '#fff'
                                                        }}
                                                    >
                                                        <div 
                                                            style={{
                                                                width: '32px',
                                                                height: '32px',
                                                                borderRadius: '4px',
                                                                backgroundColor: floatingDesign.gradient_end_color || '#005a87',
                                                                border: '2px solid #fff',
                                                                boxShadow: '0 0 0 1px #ddd'
                                                            }}
                                                        />
                                                        <div>
                                                            <div style={{ fontWeight: '500' }}>{__('End Color', 'easy-share-solution')}</div>
                                                            <div style={{ fontSize: '12px', color: '#666' }}>{floatingDesign.gradient_end_color || '#005a87'}</div>
                                                        </div>
                                                    </div>

                                                    {showColorPickers.gradientEnd && (
                                                        <div style={{
                                                            position: 'absolute',
                                                            top: '100%',
                                                            left: '0',
                                                            zIndex: 1000,
                                                            marginTop: '8px',
                                                            padding: '16px',
                                                            background: '#fff',
                                                            border: '1px solid #ddd',
                                                            borderRadius: '8px',
                                                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                                                        }}>
                                                            <ColorPicker
                                                                color={floatingDesign.gradient_end_color || '#005a87'}
                                                                onChange={(color) => {
                                                                    const newColor = color.hex || color;
                                                                    updateFloatingDesign('gradient_end_color', newColor);
                                                                }}
                                                                enableAlpha={true}
                                                            />
                                                            <button 
                                                                onClick={() => toggleColorPicker('gradientEnd')}
                                                                style={{
                                                                    marginTop: '12px',
                                                                    padding: '6px 12px',
                                                                    background: '#007cba',
                                                                    color: '#fff',
                                                                    border: 'none',
                                                                    borderRadius: '4px',
                                                                    cursor: 'pointer'
                                                                }}
                                                            >
                                                                {__('Done', 'easy-share-solution')}
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Gradient Direction */}
                                            <div className="ess-setting-group" style={{ marginBottom: '24px' }}>
                                                <SelectControl
                                                    label={__('Gradient Direction', 'easy-share-solution')}
                                                    help={__('Choose the direction for the gradient effect.', 'easy-share-solution')}
                                                    value={floatingDesign.gradient_direction || '135deg'}
                                                    options={[
                                                        { label: __('Top to Bottom', 'easy-share-solution'), value: '180deg' },
                                                        { label: __('Left to Right', 'easy-share-solution'), value: '90deg' },
                                                        { label: __('Diagonal (Top-Left to Bottom-Right)', 'easy-share-solution'), value: '135deg' },
                                                        { label: __('Diagonal (Top-Right to Bottom-Left)', 'easy-share-solution'), value: '45deg' },
                                                        { label: __('Bottom to Top', 'easy-share-solution'), value: '0deg' },
                                                        { label: __('Right to Left', 'easy-share-solution'), value: '270deg' }
                                                    ]}
                                                    onChange={(value) => updateFloatingDesign('gradient_direction', value)}
                                                __next40pxDefaultSize={true}
                                                __nextHasNoMarginBottom={true}
                                                />
                                            </div>
                                        </>
                                    )}

                                    {/* Panel Border Styling */}
                                    <div className="ess-setting-group" style={{ marginBottom: '24px' }}>
                                        <RangeControl
                                            label={__('Panel Border Width', 'easy-share-solution')}
                                            help={__('Set the border thickness around the floating panel.', 'easy-share-solution')}
                                            value={floatingDesign.border_width !== undefined ? floatingDesign.border_width : 0}
                                            onChange={(value) => updateFloatingDesign('border_width', value)}
                                            min={0}
                                            max={10}
                                            step={1}
                                            __next40pxDefaultSize={true}
                                            __nextHasNoMarginBottom={true}
                                        />
                                    </div>

                                    {floatingDesign.border_width > 0 && (
                                        <div className="ess-setting-group" style={{ marginBottom: '24px' }}>
                                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                                                {__('Panel Border Color', 'easy-share-solution')}
                                            </label>
                                            
                                            <div style={{ position: 'relative' }}>
                                                <div 
                                                    onClick={() => toggleColorPicker('floatingBorder')}
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '12px',
                                                        cursor: 'pointer',
                                                        padding: '12px',
                                                        border: '2px solid #ddd',
                                                        borderRadius: '8px',
                                                        background: '#fff'
                                                    }}
                                                >
                                                    <div 
                                                        style={{
                                                            width: '32px',
                                                            height: '32px',
                                                            borderRadius: '4px',
                                                            backgroundColor: floatingDesign.border_color || '#e0e0e0',
                                                            border: '2px solid #fff',
                                                            boxShadow: '0 0 0 1px #ddd'
                                                        }}
                                                    />
                                                    <div>
                                                        <div style={{ fontWeight: '500' }}>{__('Border Color', 'easy-share-solution')}</div>
                                                        <div style={{ fontSize: '12px', color: '#666' }}>{floatingDesign.border_color || '#e0e0e0'}</div>
                                                    </div>
                                                </div>

                                                {showColorPickers.floatingBorder && (
                                                    <div style={{
                                                        position: 'absolute',
                                                        top: '100%',
                                                        left: '0',
                                                        zIndex: 1000,
                                                        marginTop: '8px',
                                                        padding: '16px',
                                                        background: '#fff',
                                                        border: '1px solid #ddd',
                                                        borderRadius: '8px',
                                                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                                                    }}>
                                                        <ColorPicker
                                                            color={floatingDesign.border_color || '#e0e0e0'}
                                                            onChange={(color) => {
                                                                const newColor = color.hex || color;
                                                                updateFloatingDesign('border_color', newColor);
                                                            }}
                                                            enableAlpha={false}
                                                        />
                                                        <button 
                                                            onClick={() => toggleColorPicker('floatingBorder')}
                                                            style={{
                                                                marginTop: '12px',
                                                                padding: '6px 12px',
                                                                background: '#007cba',
                                                                color: '#fff',
                                                                border: 'none',
                                                                borderRadius: '4px',
                                                                cursor: 'pointer'
                                                            }}
                                                        >
                                                            {__('Done', 'easy-share-solution')}
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Panel Border Radius */}
                                    <div className="ess-setting-group" style={{ marginBottom: '24px' }}>
                                        <RangeControl
                                            label={__('Panel Border Radius', 'easy-share-solution')}
                                            help={__('Adjust the roundness of panel corners. Set to 0 for sharp corners.', 'easy-share-solution')}
                                            value={floatingDesign.border_radius !== undefined ? floatingDesign.border_radius : 12}
                                            onChange={(value) => updateFloatingDesign('border_radius', value)}
                                            min={0}
                                            max={50}
                                            step={1}
                                        __next40pxDefaultSize={true}
                                        __nextHasNoMarginBottom={true}
                                        />
                                    </div>

                                    {/* Panel Shadow */}
                                    <div className="ess-setting-group" style={{ marginBottom: '24px' }}>
                                        <ToggleControl
                                            label={__('Enable Panel Shadow', 'easy-share-solution')}
                                            help={__('Add drop shadow to the floating panel for depth.', 'easy-share-solution')}
                                            checked={!!floatingDesign.enable_shadow}
                                            onChange={(value) => updateFloatingDesign('enable_shadow', value)}
                                        __nextHasNoMarginBottom={true}
                                        />
                                    </div>

                                    {floatingDesign.enable_shadow && (
                                        <>
                                            <div className="ess-setting-group" style={{ marginBottom: '24px' }}>
                                                <RangeControl
                                                    label={__('Shadow Blur', 'easy-share-solution')}
                                                    help={__('Control the blur intensity of the shadow.', 'easy-share-solution')}
                                                    value={floatingDesign.shadow_blur !== undefined ? floatingDesign.shadow_blur : 20}
                                                    onChange={(value) => updateFloatingDesign('shadow_blur', value)}
                                                    min={0}
                                                    max={50}
                                                    step={1}
                                                __next40pxDefaultSize={true}
                                                __nextHasNoMarginBottom={true}
                                                />
                                            </div>

                                            <div className="ess-setting-group" style={{ marginBottom: '24px' }}>
                                                <RangeControl
                                                    label={__('Shadow Spread', 'easy-share-solution')}
                                                    help={__('Control the spread of the shadow.', 'easy-share-solution')}
                                                    value={floatingDesign.shadow_spread !== undefined ? floatingDesign.shadow_spread : 0}
                                                    onChange={(value) => updateFloatingDesign('shadow_spread', value)}
                                                    min={-10}
                                                    max={10}
                                                    step={1}
                                                __next40pxDefaultSize={true}
                                                __nextHasNoMarginBottom={true}
                                                />
                                            </div>

                                            <div className="ess-setting-group" style={{ marginBottom: '24px' }}>
                                                <RangeControl
                                                    label={__('Shadow Opacity', 'easy-share-solution')}
                                                    help={__('Control the opacity of the shadow.', 'easy-share-solution')}
                                                    value={floatingDesign.shadow_opacity !== undefined ? floatingDesign.shadow_opacity : 0.15}
                                                    onChange={(value) => updateFloatingDesign('shadow_opacity', value)}
                                                    min={0}
                                                    max={1}
                                                    step={0.05}
                                                __next40pxDefaultSize={true}
                                                __nextHasNoMarginBottom={true}
                                                />
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}

                            {/* Social Icon Styling Tab */}
                            {activeTab === 'icon-styling' && (
                                <div className="ess-icon-styling-tab">
                                    <h3>{__('Social Icon Styling', 'easy-share-solution')}</h3>
                                    <p>{__('Customize the appearance of individual social media icons with comprehensive styling options.', 'easy-share-solution')}</p>

                                    {/* Icon Style */}
                                    <div className="ess-setting-group" style={{ marginBottom: '24px' }}>
                                        <SelectControl
                                            label={__('Icon Style', 'easy-share-solution')}
                                            help={__('Choose the overall shape and style of social icons.', 'easy-share-solution')}
                                            value={floatingDesign.icon_style || 'circle'}
                                            options={[
                                                { label: __('Circle', 'easy-share-solution'), value: 'circle' },
                                                { label: __('Square', 'easy-share-solution'), value: 'square' },
                                                { label: __('Rounded Square', 'easy-share-solution'), value: 'rounded' },
                                                { label: __('Hexagon', 'easy-share-solution'), value: 'hexagon' },
                                                { label: __('Diamond', 'easy-share-solution'), value: 'diamond' },
                                                { label: __('Pill Shape', 'easy-share-solution'), value: 'pill' }
                                            ]}
                                            onChange={(value) => updateFloatingDesign('icon_style', value)}
                                        __next40pxDefaultSize={true}
                                        __nextHasNoMarginBottom={true}
                                        />
                                    </div>

                                    {/* Icon Size */}
                                    <div className="ess-setting-group" style={{ marginBottom: '24px' }}>
                                        <RangeControl
                                            label={__('Icon Size', 'easy-share-solution')}
                                            help={__('Set the size of the social media icons in pixels.', 'easy-share-solution')}
                                            value={floatingDesign.icon_size || 40}
                                            onChange={(value) => updateFloatingDesign('icon_size', value)}
                                            min={20}
                                            max={100}
                                            step={2}
                                            marks={[
                                                { value: 20, label: '20px' },
                                                { value: 40, label: '40px' },
                                                { value: 60, label: '60px' },
                                                { value: 100, label: '100px' }
                                            ]}
                                        __next40pxDefaultSize={true}
                                        __nextHasNoMarginBottom={true}
                                        />
                                    </div>

                                    {/* Icon Colors */}
                                    <div className="ess-setting-group" style={{ marginBottom: '24px' }}>
                                        <ToggleControl
                                            label={__('Use Platform Colors', 'easy-share-solution')}
                                            help={__('Use official platform colors (Facebook blue, X black, etc.) or custom colors.', 'easy-share-solution')}
                                            checked={!!floatingDesign.use_platform_colors}
                                            onChange={(value) => updateFloatingDesign('use_platform_colors', value)}
                                        __nextHasNoMarginBottom={true}
                                        />
                                    </div>

                                    {!floatingDesign.use_platform_colors && (
                                        <div className="ess-setting-group" style={{ marginBottom: '24px' }}>
                                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                                                {__('Custom Icon Color', 'easy-share-solution')}
                                            </label>
                                            <p style={{ fontSize: '12px', color: '#666', marginBottom: '12px' }}>
                                                {__('Custom color for all social media icons', 'easy-share-solution')}
                                            </p>
                                            
                                            <div style={{ position: 'relative' }}>
                                                <div 
                                                    onClick={() => toggleColorPicker('floatingIcon')}
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '12px',
                                                        cursor: 'pointer',
                                                        padding: '12px',
                                                        border: '2px solid #ddd',
                                                        borderRadius: '8px',
                                                        background: '#fff'
                                                    }}
                                                >
                                                    <div 
                                                        style={{
                                                            width: '32px',
                                                            height: '32px',
                                                            borderRadius: '4px',
                                                            backgroundColor: floatingDesign.icon_color || '#007cba',
                                                            border: '2px solid #fff',
                                                            boxShadow: '0 0 0 1px #ddd'
                                                        }}
                                                    />
                                                    <div>
                                                        <div style={{ fontWeight: '500' }}>{__('Icon Color', 'easy-share-solution')}</div>
                                                        <div style={{ fontSize: '12px', color: '#666' }}>{floatingDesign.icon_color || '#007cba'}</div>
                                                    </div>
                                                </div>

                                                {showColorPickers.floatingIcon && (
                                                    <div style={{
                                                        position: 'absolute',
                                                        top: '100%',
                                                        left: '0',
                                                        zIndex: 1000,
                                                        marginTop: '8px',
                                                        padding: '16px',
                                                        background: '#fff',
                                                        border: '1px solid #ddd',
                                                        borderRadius: '8px',
                                                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                                                    }}>
                                                        <ColorPicker
                                                            color={floatingDesign.icon_color || '#007cba'}
                                                            onChange={(color) => {
                                                                const newColor = color.hex || color;
                                                                updateFloatingDesign('icon_color', newColor);
                                                            }}
                                                            enableAlpha={false}
                                                        />
                                                        <button 
                                                            onClick={() => toggleColorPicker('floatingIcon')}
                                                            style={{
                                                                marginTop: '12px',
                                                                padding: '6px 12px',
                                                                background: '#007cba',
                                                                color: '#fff',
                                                                border: 'none',
                                                                borderRadius: '4px',
                                                                cursor: 'pointer'
                                                            }}
                                                        >
                                                            {__('Done', 'easy-share-solution')}
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Toggle Button Color */}
                                    <div className="ess-setting-group" style={{ marginBottom: '24px' }}>
                                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                                            {__('Toggle Button Color', 'easy-share-solution')}
                                        </label>
                                        <p style={{ fontSize: '12px', color: '#666', marginBottom: '12px' }}>
                                            {__('Background color for the toggle button that opens/closes the panel', 'easy-share-solution')}
                                        </p>
                                        
                                        <div style={{ position: 'relative' }}>
                                            <div 
                                                onClick={() => toggleColorPicker('toggleButton')}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '12px',
                                                    cursor: 'pointer',
                                                    padding: '12px',
                                                    border: '2px solid #ddd',
                                                    borderRadius: '8px',
                                                    background: '#fff'
                                                }}
                                            >
                                                <div 
                                                    style={{
                                                        width: '32px',
                                                        height: '32px',
                                                        borderRadius: '4px',
                                                        backgroundColor: floatingDesign.toggle_button_color || '#1e88e5',
                                                        border: '2px solid #fff',
                                                        boxShadow: '0 0 0 1px #ddd'
                                                    }}
                                                />
                                                <div>
                                                    <div style={{ fontWeight: '500' }}>{__('Toggle Button Color', 'easy-share-solution')}</div>
                                                    <div style={{ fontSize: '12px', color: '#666' }}>{floatingDesign.toggle_button_color || '#1e88e5'}</div>
                                                </div>
                                            </div>

                                            {showColorPickers.toggleButton && (
                                                <div style={{
                                                    position: 'absolute',
                                                    top: '100%',
                                                    left: '0',
                                                    zIndex: 1000,
                                                    marginTop: '8px',
                                                    padding: '16px',
                                                    background: '#fff',
                                                    border: '1px solid #ddd',
                                                    borderRadius: '8px',
                                                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                                                }}>
                                                    <ColorPicker
                                                        color={floatingDesign.toggle_button_color || '#1e88e5'}
                                                        onChange={(color) => {
                                                            const newColor = color.hex || color;
                                                            updateFloatingDesign('toggle_button_color', newColor);
                                                        }}
                                                        enableAlpha={false}
                                                    />
                                                    <button 
                                                        onClick={() => toggleColorPicker('toggleButton')}
                                                        style={{
                                                            marginTop: '12px',
                                                            padding: '6px 12px',
                                                            background: '#007cba',
                                                            color: '#fff',
                                                            border: 'none',
                                                            borderRadius: '4px',
                                                            cursor: 'pointer'
                                                        }}
                                                    >
                                                        {__('Done', 'easy-share-solution')}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* More Button Color */}
                                    <div className="ess-setting-group" style={{ marginBottom: '24px' }}>
                                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                                            {__('More Button Color', 'easy-share-solution')}
                                        </label>
                                        <p style={{ fontSize: '12px', color: '#666', marginBottom: '12px' }}>
                                            {__('Background color for the "more" button that shows additional platforms', 'easy-share-solution')}
                                        </p>
                                        
                                        <div style={{ position: 'relative' }}>
                                            <div 
                                                onClick={() => toggleColorPicker('moreButton')}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '12px',
                                                    cursor: 'pointer',
                                                    padding: '12px',
                                                    border: '2px solid #ddd',
                                                    borderRadius: '8px',
                                                    background: '#fff'
                                                }}
                                            >
                                                <div 
                                                    style={{
                                                        width: '32px',
                                                        height: '32px',
                                                        borderRadius: '4px',
                                                        backgroundColor: floatingDesign.more_button_color || '#6c757d',
                                                        border: '2px solid #fff',
                                                        boxShadow: '0 0 0 1px #ddd'
                                                    }}
                                                />
                                                <div>
                                                    <div style={{ fontWeight: '500' }}>{__('More Button Color', 'easy-share-solution')}</div>
                                                    <div style={{ fontSize: '12px', color: '#666' }}>{floatingDesign.more_button_color || '#6c757d'}</div>
                                                </div>
                                            </div>

                                            {showColorPickers.moreButton && (
                                                <div style={{
                                                    position: 'absolute',
                                                    top: '100%',
                                                    left: '0',
                                                    zIndex: 1000,
                                                    marginTop: '8px',
                                                    padding: '16px',
                                                    background: '#fff',
                                                    border: '1px solid #ddd',
                                                    borderRadius: '8px',
                                                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                                                }}>
                                                    <ColorPicker
                                                        color={floatingDesign.more_button_color || '#6c757d'}
                                                        onChange={(color) => {
                                                            const newColor = color.hex || color;
                                                            updateFloatingDesign('more_button_color', newColor);
                                                        }}
                                                        enableAlpha={false}
                                                    />
                                                    <button 
                                                        onClick={() => toggleColorPicker('moreButton')}
                                                        style={{
                                                            marginTop: '12px',
                                                            padding: '6px 12px',
                                                            background: '#007cba',
                                                            color: '#fff',
                                                            border: 'none',
                                                            borderRadius: '4px',
                                                            cursor: 'pointer'
                                                        }}
                                                    >
                                                        {__('Done', 'easy-share-solution')}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Icon Border */}
                                    <div className="ess-setting-group" style={{ marginBottom: '24px' }}>
                                        <RangeControl
                                            label={__('Icon Border Width', 'easy-share-solution')}
                                            help={__('Set the border thickness around each icon.', 'easy-share-solution')}
                                            value={floatingDesign.icon_border_width !== undefined ? floatingDesign.icon_border_width : 0}
                                            onChange={(value) => updateFloatingDesign('icon_border_width', value)}
                                            min={0}
                                            max={8}
                                            step={1}
                                        __next40pxDefaultSize={true}
                                        __nextHasNoMarginBottom={true}
                                        />
                                    </div>

                                    {/* Icon Border Color */}
                                    {(floatingDesign.icon_border_width || 0) > 0 && (
                                        <div className="ess-setting-group" style={{ marginBottom: '24px' }}>
                                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                                                {__('Icon Border Color', 'easy-share-solution')}
                                            </label>
                                            <p style={{ fontSize: '12px', color: '#666', marginBottom: '12px' }}>
                                                {__('Color for the icon borders', 'easy-share-solution')}
                                            </p>
                                            
                                            <div style={{ position: 'relative' }}>
                                                <div 
                                                    onClick={() => toggleColorPicker('iconBorder')}
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '12px',
                                                        cursor: 'pointer',
                                                        padding: '12px',
                                                        border: '2px solid #ddd',
                                                        borderRadius: '8px',
                                                        background: '#fff'
                                                    }}
                                                >
                                                    <div 
                                                        style={{
                                                            width: '32px',
                                                            height: '32px',
                                                            borderRadius: '4px',
                                                            backgroundColor: floatingDesign.icon_border_color || '#007cba',
                                                            border: '2px solid #fff',
                                                            boxShadow: '0 0 0 1px #ddd'
                                                        }}
                                                    />
                                                    <div>
                                                        <div style={{ fontWeight: '500' }}>{__('Border Color', 'easy-share-solution')}</div>
                                                        <div style={{ fontSize: '12px', color: '#666' }}>{floatingDesign.icon_border_color || '#007cba'}</div>
                                                    </div>
                                                </div>

                                                {showColorPickers.iconBorder && (
                                                    <div style={{
                                                        position: 'absolute',
                                                        top: '100%',
                                                        left: '0',
                                                        zIndex: 1000,
                                                        marginTop: '8px',
                                                        padding: '16px',
                                                        background: '#fff',
                                                        border: '1px solid #ddd',
                                                        borderRadius: '8px',
                                                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                                                    }}>
                                                        <ColorPicker
                                                            color={floatingDesign.icon_border_color || '#007cba'}
                                                            onChange={(color) => {
                                                                const newColor = color.hex || color;
                                                                updateFloatingDesign('icon_border_color', newColor);
                                                            }}
                                                            enableAlpha={false}
                                                        />
                                                        <button 
                                                            onClick={() => toggleColorPicker('iconBorder')}
                                                            style={{
                                                                marginTop: '12px',
                                                                padding: '6px 12px',
                                                                background: '#007cba',
                                                                color: '#fff',
                                                                border: 'none',
                                                                borderRadius: '4px',
                                                                cursor: 'pointer'
                                                            }}
                                                        >
                                                            {__('Done', 'easy-share-solution')}
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Icon Spacing */}
                                    <div className="ess-setting-group" style={{ marginBottom: '24px' }}>
                                        <RangeControl
                                            label={__('Icon Spacing', 'easy-share-solution')}
                                            help={__('Adjust the space between social icons.', 'easy-share-solution')}
                                            value={floatingDesign.icon_spacing !== undefined ? floatingDesign.icon_spacing : 8}
                                            onChange={(value) => updateFloatingDesign('icon_spacing', value)}
                                            min={0}
                                            max={30}
                                            step={1}
                                        __next40pxDefaultSize={true}
                                        __nextHasNoMarginBottom={true}
                                        />
                                    </div>

                                    {/* Icon Padding */}
                                    <div className="ess-setting-group" style={{ marginBottom: '24px' }}>
                                        <RangeControl
                                            label={__('Icon Padding', 'easy-share-solution')}
                                            help={__('Internal padding inside each icon.', 'easy-share-solution')}
                                            value={floatingDesign.icon_padding !== undefined ? floatingDesign.icon_padding : 8}
                                            onChange={(value) => updateFloatingDesign('icon_padding', value)}
                                            min={0}
                                            max={40}
                                            step={1}
                                        __next40pxDefaultSize={true}
                                        __nextHasNoMarginBottom={true}
                                        />
                                    </div>

                                    {/* Show Labels */}
                                    <div className="ess-setting-group" style={{ marginBottom: '24px' }}>
                                        <ToggleControl
                                            label={__('Show Icon Labels', 'easy-share-solution')}
                                            help={__('Display platform names alongside icons.', 'easy-share-solution')}
                                            checked={!!floatingDesign.show_labels}
                                            onChange={(value) => updateFloatingDesign('show_labels', value)}
                                        __nextHasNoMarginBottom={true}
                                        />
                                    </div>

                                    {/* Label Position */}
                                    {floatingDesign.show_labels && (
                                        <div className="ess-setting-group" style={{ marginBottom: '24px' }}>
                                            <SelectControl
                                                label={__('Label Position', 'easy-share-solution')}
                                                help={__('Choose where to display the platform labels.', 'easy-share-solution')}
                                                value={floatingDesign.label_position || 'right'}
                                                options={[
                                                    { label: __('Top', 'easy-share-solution'), value: 'top' },
                                                    { label: __('Right', 'easy-share-solution'), value: 'right' },
                                                    { label: __('Left', 'easy-share-solution'), value: 'left' }
                                                ]}
                                                onChange={(value) => updateFloatingDesign('label_position', value)}
                                            __next40pxDefaultSize={true}
                                            __nextHasNoMarginBottom={true}
                                            />
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Animations & Effects Tab */}
                            {activeTab === 'animations' && (
                                <div className="ess-animations-tab">
                                    <h3>{__('Animations & Effects', 'easy-share-solution')}</h3>
                                    <p>{__('Add stunning animations and hover effects to make your social icons come alive.', 'easy-share-solution')}</p>

                                    {/* Entrance Animation */}
                                    <div className="ess-setting-group" style={{ marginBottom: '24px' }}>
                                        <SelectControl
                                            label={__('Entrance Animation', 'easy-share-solution')}
                                            help={__('Animation when the floating panel first appears.', 'easy-share-solution')}
                                            value={floatingDesign.entrance_animation || 'slideInUp'}
                                            options={[
                                                { label: __('None', 'easy-share-solution'), value: 'none' },
                                                { label: __('Fade In', 'easy-share-solution'), value: 'fadeIn' },
                                                { label: __('Slide In Up', 'easy-share-solution'), value: 'slideInUp' },
                                                { label: __('Slide In Right', 'easy-share-solution'), value: 'slideInRight' },
                                                { label: __('Slide In Left', 'easy-share-solution'), value: 'slideInLeft' },
                                                { label: __('Bounce In', 'easy-share-solution'), value: 'bounceIn' },
                                                { label: __('Zoom In', 'easy-share-solution'), value: 'zoomIn' },
                                                { label: __('Flip In X', 'easy-share-solution'), value: 'flipInX' },
                                                { label: __('Rotate In', 'easy-share-solution'), value: 'rotateIn' }
                                            ]}
                                            onChange={(value) => updateFloatingDesign('entrance_animation', value)}
                                        __next40pxDefaultSize={true}
                                        __nextHasNoMarginBottom={true}
                                        />
                                    </div>

                                    {/* Hover Animation */}
                                    <div className="ess-setting-group" style={{ marginBottom: '24px' }}>
                                        <SelectControl
                                            label={__('Icon Hover Effect', 'easy-share-solution')}
                                            help={__('Animation when hovering over individual icons.', 'easy-share-solution')}
                                            value={floatingDesign.hover_animation || 'scale'}
                                            options={[
                                                { label: __('None', 'easy-share-solution'), value: 'none' },
                                                { label: __('Scale Up', 'easy-share-solution'), value: 'scale' },
                                                { label: __('Lift Up', 'easy-share-solution'), value: 'lift' },
                                                { label: __('Pulse', 'easy-share-solution'), value: 'pulse' },
                                                { label: __('Bounce', 'easy-share-solution'), value: 'bounce' },
                                                { label: __('Shake', 'easy-share-solution'), value: 'shake' },
                                                { label: __('Rotate', 'easy-share-solution'), value: 'rotate' },
                                                { label: __('Wobble', 'easy-share-solution'), value: 'wobble' },
                                                { label: __('Jello', 'easy-share-solution'), value: 'jello' },
                                                { label: __('Glow', 'easy-share-solution'), value: 'glow' },
                                                { label: __('Flash', 'easy-share-solution'), value: 'flash' }
                                            ]}
                                            onChange={(value) => updateFloatingDesign('hover_animation', value)}
                                        __next40pxDefaultSize={true}
                                        __nextHasNoMarginBottom={true}
                                        />
                                    </div>

                                    {/* Animation Duration */}
                                    <div className="ess-setting-group" style={{ marginBottom: '24px' }}>
                                        <RangeControl
                                            label={__('Animation Duration', 'easy-share-solution')}
                                            help={__('How long animations should take (in milliseconds).', 'easy-share-solution')}
                                            value={floatingDesign.animation_duration || 300}
                                            onChange={(value) => updateFloatingDesign('animation_duration', value)}
                                            min={100}
                                            max={1000}
                                            step={50}
                                            marks={[
                                                { value: 100, label: '100ms' },
                                                { value: 300, label: '300ms' },
                                                { value: 500, label: '500ms' },
                                                { value: 1000, label: '1s' }
                                            ]}
                                        __next40pxDefaultSize={true}
                                        __nextHasNoMarginBottom={true}
                                        />
                                    </div>

                                    {/* Animation Delay */}
                                    <div className="ess-setting-group" style={{ marginBottom: '24px' }}>
                                        <RangeControl
                                            label={__('Animation Delay', 'easy-share-solution')}
                                            help={__('Delay before animations start (in milliseconds).', 'easy-share-solution')}
                                            value={floatingDesign.animation_delay !== undefined ? floatingDesign.animation_delay : 0}
                                            onChange={(value) => updateFloatingDesign('animation_delay', value)}
                                            min={0}
                                            max={2000}
                                            step={100}
                                            marks={[
                                                { value: 0, label: '0ms' },
                                                { value: 500, label: '500ms' },
                                                { value: 1000, label: '1s' },
                                                { value: 2000, label: '2s' }
                                            ]}
                                        __next40pxDefaultSize={true}
                                        __nextHasNoMarginBottom={true}
                                        />
                                    </div>

                                    {/* Staggered Animation */}
                                    <div className="ess-setting-group" style={{ marginBottom: '24px' }}>
                                        <ProFeature
                                            isProActive={isProActive}
                                            hasProFeature={hasProFeature}
                                            feature="staggered_animation"
                                            showNotice={true}
                                        >
                                            <ToggleControl
                                                label={__('Staggered Icon Animation', 'easy-share-solution')}
                                                help={__('Animate icons one after another for a flowing effect.', 'easy-share-solution')}
                                                checked={!!floatingDesign.staggered_animation}
                                                onChange={(value) => updateFloatingDesign('staggered_animation', value)}
                                            __nextHasNoMarginBottom={true}
                                            />
                                        </ProFeature>
                                    </div>

                                    {floatingDesign.staggered_animation && (
                                        <div className="ess-setting-group" style={{ marginBottom: '24px' }}>
                                            <RangeControl
                                                label={__('Stagger Delay', 'easy-share-solution')}
                                                help={__('Delay between each icon animation (in milliseconds).', 'easy-share-solution')}
                                                value={floatingDesign.stagger_delay || 100}
                                                onChange={(value) => updateFloatingDesign('stagger_delay', value)}
                                                min={50}
                                                max={500}
                                                step={25}
                                            __next40pxDefaultSize={true}
                                            __nextHasNoMarginBottom={true}
                                            />
                                        </div>
                                    )}

                                    {/* Hover Color Animation */}
                                    <div className="ess-setting-group" style={{ marginBottom: '24px' }}>
                                        <ToggleControl
                                            label={__('Enable Hover Color Change', 'easy-share-solution')}
                                            help={__('Change icon colors on hover for extra visual feedback.', 'easy-share-solution')}
                                            checked={!!floatingDesign.hover_color_change}
                                            onChange={(value) => updateFloatingDesign('hover_color_change', value)}
                                        __nextHasNoMarginBottom={true}
                                        />
                                    </div>

                                    {floatingDesign.hover_color_change && (
                                        <div className="ess-setting-group" style={{ marginBottom: '24px' }}>
                                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                                                {__('Hover Color', 'easy-share-solution')}
                                            </label>
                                            <p style={{ fontSize: '12px', color: '#666', marginBottom: '12px' }}>
                                                {__('Color that icons change to on hover', 'easy-share-solution')}
                                            </p>
                                            
                                            <div style={{ position: 'relative' }}>
                                                <div 
                                                    onClick={() => toggleColorPicker('floatingHover')}
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '12px',
                                                        cursor: 'pointer',
                                                        padding: '12px',
                                                        border: '2px solid #ddd',
                                                        borderRadius: '8px',
                                                        background: '#fff'
                                                    }}
                                                >
                                                    <div 
                                                        style={{
                                                            width: '32px',
                                                            height: '32px',
                                                            borderRadius: '4px',
                                                            backgroundColor: floatingDesign.hover_color || '#ff6b6b',
                                                            border: '2px solid #fff',
                                                            boxShadow: '0 0 0 1px #ddd'
                                                        }}
                                                    />
                                                    <div>
                                                        <div style={{ fontWeight: '500' }}>{__('Hover Color', 'easy-share-solution')}</div>
                                                        <div style={{ fontSize: '12px', color: '#666' }}>{floatingDesign.hover_color || '#ff6b6b'}</div>
                                                    </div>
                                                </div>

                                                {showColorPickers.floatingHover && (
                                                    <div style={{
                                                        position: 'absolute',
                                                        top: '100%',
                                                        left: '0',
                                                        zIndex: 1000,
                                                        marginTop: '8px',
                                                        padding: '16px',
                                                        background: '#fff',
                                                        border: '1px solid #ddd',
                                                        borderRadius: '8px',
                                                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                                                    }}>
                                                        <ColorPicker
                                                            color={floatingDesign.hover_color || '#ff6b6b'}
                                                            onChange={(color) => {
                                                                const newColor = color.hex || color;
                                                                updateFloatingDesign('hover_color', newColor);
                                                            }}
                                                            enableAlpha={false}
                                                        />
                                                        <button 
                                                            onClick={() => toggleColorPicker('floatingHover')}
                                                            style={{
                                                                marginTop: '12px',
                                                                padding: '6px 12px',
                                                                background: '#007cba',
                                                                color: '#fff',
                                                                border: 'none',
                                                                borderRadius: '4px',
                                                                cursor: 'pointer'
                                                            }}
                                                        >
                                                            {__('Done', 'easy-share-solution')}
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Continuous Animation */}
                                    <div className="ess-setting-group" style={{ marginBottom: '24px' }}>
                                        <ProFeature
                                            isProActive={isProActive}
                                            hasProFeature={hasProFeature}
                                            feature="continuous_animation"
                                            showNotice={true}
                                        >
                                            <SelectControl
                                                label={__('Continuous Animation', 'easy-share-solution')}
                                                help={__('Add subtle continuous animations to attract attention.', 'easy-share-solution')}
                                                value={floatingDesign.continuous_animation || 'none'}
                                                options={[
                                                    { label: __('None', 'easy-share-solution'), value: 'none' },
                                                    { label: __('Gentle Pulse', 'easy-share-solution'), value: 'pulse' },
                                                    { label: __('Soft Glow', 'easy-share-solution'), value: 'glow' },
                                                    { label: __('Floating', 'easy-share-solution'), value: 'float' },
                                                    { label: __('Slow Bounce', 'easy-share-solution'), value: 'rotate' },
                                                    { label: __('Rubber Band', 'easy-share-solution'), value: 'rubberband' },
                                                    { label: __('Flip Y Toggle', 'easy-share-solution'), value: 'flipytoggle' }
                                                ]}
                                                onChange={(value) => updateFloatingDesign('continuous_animation', value)}
                                            __next40pxDefaultSize={true}
                                            __nextHasNoMarginBottom={true}
                                            />
                                        </ProFeature>
                                    </div>
                                </div>
                            )}

                            {/* Position & Layout Tab */}
                            {activeTab === 'positioning' && (
                                <div className="ess-positioning-tab">
                                    <h3>{__('Position & Layout', 'easy-share-solution')}</h3>
                                    <p>{__('Fine-tune the positioning, spacing, and layout of your floating panel.', 'easy-share-solution')}</p>

                                    {/* Panel Position */}
                                    <div className="ess-setting-group" style={{ marginBottom: '24px' }}>
                                        <SelectControl
                                            label={__('Panel Position', 'easy-share-solution')}
                                            help={__('Choose where the floating panel appears on the screen.', 'easy-share-solution')}
                                            value={floatingDesign.panel_position || 'center-left'}
                                            options={[
                                                { label: __('Top Left', 'easy-share-solution'), value: 'top-left' },
                                                { label: __('Top Right', 'easy-share-solution'), value: 'top-right' },
                                                { label: __('Bottom Left', 'easy-share-solution'), value: 'bottom-left' },
                                                { label: __('Bottom Right', 'easy-share-solution'), value: 'bottom-right' },
                                                { label: __('Center Left', 'easy-share-solution'), value: 'center-left' },
                                                { label: __('Center Right', 'easy-share-solution'), value: 'center-right' }
                                            ]}
                                            onChange={(value) => updateFloatingDesign('panel_position', value)}
                                        __next40pxDefaultSize={true}
                                        __nextHasNoMarginBottom={true}
                                        />
                                    </div>

                                    {/* Horizontal Offset */}
                                    <div className="ess-setting-group" style={{ marginBottom: '24px' }}>
                                        <RangeControl
                                            label={__('Horizontal Offset', 'easy-share-solution')}
                                            help={__('Distance from the screen edge horizontally.', 'easy-share-solution')}
                                            value={floatingDesign.horizontal_offset !== undefined ? floatingDesign.horizontal_offset : 20}
                                            onChange={(value) => updateFloatingDesign('horizontal_offset', value)}
                                            min={0}
                                            max={100}
                                            step={5}
                                        __next40pxDefaultSize={true}
                                        __nextHasNoMarginBottom={true}
                                        />
                                    </div>

                                    {/* Icon Arrangement */}
                                    <div className="ess-setting-group" style={{ marginBottom: '24px' }}>
                                        <SelectControl
                                            label={__('Icon Arrangement', 'easy-share-solution')}
                                            help={__('How should the icons be arranged within the panel.', 'easy-share-solution')}
                                            value={floatingDesign.icon_arrangement || 'vertical'}
                                            options={[
                                                { label: __('Horizontal Row', 'easy-share-solution'), value: 'horizontal' },
                                                { label: __('Vertical Column', 'easy-share-solution'), value: 'vertical' },
                                                ...(isProActive ? [
                                                    { label: __('Grid 2x2', 'easy-share-solution'), value: 'grid-2x2' },
                                                    { label: __('Grid 3x2', 'easy-share-solution'), value: 'grid-3x2' },
                                                    { label: __('Circular', 'easy-share-solution'), value: 'circular' }
                                                ] : [
                                                    { label: __('Grid 2x2 (Pro)', 'easy-share-solution'), value: 'grid-2x2', disabled: true },
                                                    { label: __('Grid 3x2 (Pro)', 'easy-share-solution'), value: 'grid-3x2', disabled: true },
                                                    { label: __('Circular (Pro)', 'easy-share-solution'), value: 'circular', disabled: true }
                                                ])
                                            ]}
                                            onChange={(value) => {
                                                // Prevent selection of Pro features for free users
                                                if (!isProActive && ['grid-2x2', 'grid-3x2', 'circular'].includes(value)) {
                                                    return;
                                                }
                                                updateFloatingDesign('icon_arrangement', value);
                                            }}
                                        __next40pxDefaultSize={true}
                                        __nextHasNoMarginBottom={true}
                                        />
                                        {!isProActive && (
                                            <p className="ess-pro-hint" style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
                                                {__('Grid and circular layouts are available in Pro version.', 'easy-share-solution')}
                                            </p>
                                        )}
                                    </div>

                                    {/* Panel Padding */}
                                    <div className="ess-setting-group" style={{ marginBottom: '24px' }}>
                                        <RangeControl
                                            label={__('Panel Padding', 'easy-share-solution')}
                                            help={__('Internal spacing around the icons within the panel.', 'easy-share-solution')}
                                            value={floatingDesign.panel_padding !== undefined ? floatingDesign.panel_padding : 2}
                                            onChange={(value) => updateFloatingDesign('panel_padding', value)}
                                            min={0}
                                            max={50}
                                            step={2}
                                        __next40pxDefaultSize={true}
                                        __nextHasNoMarginBottom={true}
                                        />
                                    </div>

                                    {/* Z-Index */}
                                    <div className="ess-setting-group" style={{ marginBottom: '24px' }}>
                                        <RangeControl
                                            label={__('Z-Index (Layer Priority)', 'easy-share-solution')}
                                            help={__('Control which elements appear on top. Higher values appear above lower values.', 'easy-share-solution')}
                                            value={floatingDesign.z_index || 9999}
                                            onChange={(value) => updateFloatingDesign('z_index', value)}
                                            min={1}
                                            max={99999}
                                            step={1}
                                        __next40pxDefaultSize={true}
                                        __nextHasNoMarginBottom={true}
                                        />
                                    </div>

                                    {/* Auto Hide */}
                                    <div className="ess-setting-group" style={{ marginBottom: '24px' }}>
                                        <ProFeature
                                            isProActive={isProActive}
                                            hasProFeature={hasProFeature}
                                            feature="auto_hide_panel"
                                            showNotice={true}
                                        >
                                            <ToggleControl
                                                label={__('Auto Hide Panel', 'easy-share-solution')}
                                                help={__('Automatically hide the panel and show on hover.', 'easy-share-solution')}
                                                checked={!!floatingDesign.auto_hide}
                                                onChange={(value) => updateFloatingDesign('auto_hide', value)}
                                            __nextHasNoMarginBottom={true}
                                            />
                                        </ProFeature>
                                    </div>

                                    {floatingDesign.auto_hide && (
                                        <div className="ess-setting-group" style={{ marginBottom: '24px' }}>
                                            <RangeControl
                                                label={__('Auto Hide Delay', 'easy-share-solution')}
                                                help={__('How long to wait before hiding the panel (in seconds).', 'easy-share-solution')}
                                                value={floatingDesign.auto_hide_delay || 3}
                                                onChange={(value) => updateFloatingDesign('auto_hide_delay', value)}
                                                min={1}
                                                max={10}
                                                step={0.5}
                                            __next40pxDefaultSize={true}
                                            __nextHasNoMarginBottom={true}
                                            />
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Responsive Design Tab */}
                            {activeTab === 'responsive' && (
                                <div className="ess-responsive-tab">
                                    <h3>{__('Responsive Design', 'easy-share-solution')}</h3>
                                    <p>{__('Optimize your floating panel for different screen sizes and devices.', 'easy-share-solution')}</p>

                                    {/* Mobile Visibility */}
                                    <div className="ess-setting-group" style={{ marginBottom: '24px' }}>
                                        <ToggleControl
                                            label={__('Show on Mobile', 'easy-share-solution')}
                                            help={__('Display the floating panel on mobile devices.', 'easy-share-solution')}
                                            checked={!!floatingDesign.show_on_mobile}
                                            onChange={(value) => updateFloatingDesign('show_on_mobile', value)}
                                        __nextHasNoMarginBottom={true}
                                        />
                                    </div>

                                    {/* Tablet Visibility */}
                                    <div className="ess-setting-group" style={{ marginBottom: '24px' }}>
                                        <ToggleControl
                                            label={__('Show on Tablet', 'easy-share-solution')}
                                            help={__('Display the floating panel on tablet devices.', 'easy-share-solution')}
                                            checked={!!floatingDesign.show_on_tablet}
                                            onChange={(value) => updateFloatingDesign('show_on_tablet', value)}
                                        __nextHasNoMarginBottom={true}
                                        />
                                    </div>

                                    {/* Mobile Icon Size */}
                                    {floatingDesign.show_on_mobile && (
                                        <div className="ess-setting-group" style={{ marginBottom: '24px' }}>
                                            <RangeControl
                                                label={__('Mobile Icon Size', 'easy-share-solution')}
                                                help={__('Icon size specifically for mobile devices.', 'easy-share-solution')}
                                                value={floatingDesign.mobile_icon_size || 36}
                                                onChange={(value) => updateFloatingDesign('mobile_icon_size', value)}
                                                min={20}
                                                max={60}
                                                step={2}
                                            __next40pxDefaultSize={true}
                                            __nextHasNoMarginBottom={true}
                                            />
                                        </div>
                                    )}

                                    {/* Mobile Position */}
                                    {floatingDesign.show_on_mobile && (
                                        <div className="ess-setting-group" style={{ marginBottom: '24px' }}>
                                            <SelectControl
                                                label={__('Mobile Position', 'easy-share-solution')}
                                                help={__('Position of the panel on mobile devices.', 'easy-share-solution')}
                                                value={floatingDesign.mobile_position || 'bottom-right'}
                                                options={[
                                                    { label: __('Bottom Left', 'easy-share-solution'), value: 'bottom-left' },
                                                    { label: __('Bottom Right', 'easy-share-solution'), value: 'bottom-right' },
                                                    { label: __('Bottom Center', 'easy-share-solution'), value: 'bottom-center' },
                                                    { label: __('Top Left', 'easy-share-solution'), value: 'top-left' },
                                                    { label: __('Top Right', 'easy-share-solution'), value: 'top-right' }
                                                ]}
                                                onChange={(value) => updateFloatingDesign('mobile_position', value)}
                                            __next40pxDefaultSize={true}
                                            __nextHasNoMarginBottom={true}
                                            />
                                        </div>
                                    )}

                                    {/* Mobile Arrangement */}
                                    {floatingDesign.show_on_mobile && (
                                        <div className="ess-setting-group" style={{ marginBottom: '24px' }}>
                                            <SelectControl
                                                label={__('Mobile Icon Arrangement', 'easy-share-solution')}
                                                help={__('How icons are arranged on mobile devices.', 'easy-share-solution')}
                                                value={floatingDesign.mobile_arrangement || 'vertical'}
                                                options={[
                                                    { label: __('Horizontal Row', 'easy-share-solution'), value: 'horizontal' },
                                                    { label: __('Vertical Column', 'easy-share-solution'), value: 'vertical' },
                                                    { label: __('Grid 2x2', 'easy-share-solution'), value: 'grid-2x2' }
                                                ]}
                                                onChange={(value) => updateFloatingDesign('mobile_arrangement', value)}
                                            __next40pxDefaultSize={true}
                                            __nextHasNoMarginBottom={true}
                                            />
                                        </div>
                                    )}

                                    {/* Mobile Icons Display Mode */}
                                    {floatingDesign.show_on_mobile && (
                                        <div className="ess-setting-group" style={{ marginBottom: '24px' }}>
                                            <SelectControl
                                                label={__('Icons Display Mode for Mobile', 'easy-share-solution')}
                                                help={__('Choose how the social media icons are displayed on mobile devices.', 'easy-share-solution')}
                                                value={floatingDesign.mobile_icons_display || 'fold'}
                                                options={[
                                                    { label: __('Expand (Always Visible)', 'easy-share-solution'), value: 'expand' },
                                                    { label: __('Fold (Click to Expand)', 'easy-share-solution'), value: 'fold' }
                                                ]}
                                                onChange={(value) => updateFloatingDesign('mobile_icons_display', value)}
                                            __next40pxDefaultSize={true}
                                            __nextHasNoMarginBottom={true}
                                            />
                                        </div>
                                    )}

                                    {/* Breakpoint Settings */}
                                    <div className="ess-setting-group" style={{ marginBottom: '24px' }}>
                                        <RangeControl
                                            label={__('Mobile Breakpoint', 'easy-share-solution')}
                                            help={__('Screen width below which mobile styles apply (in pixels).', 'easy-share-solution')}
                                            value={floatingDesign.mobile_breakpoint || 768}
                                            onChange={(value) => updateFloatingDesign('mobile_breakpoint', value)}
                                            min={320}
                                            max={1024}
                                            step={10}
                                        __next40pxDefaultSize={true}
                                        __nextHasNoMarginBottom={true}
                                        />
                                    </div>

                                    <div className="ess-setting-group" style={{ marginBottom: '24px' }}>
                                        <RangeControl
                                            label={__('Tablet Breakpoint', 'easy-share-solution')}
                                            help={__('Screen width below which tablet styles apply (in pixels).', 'easy-share-solution')}
                                            value={floatingDesign.tablet_breakpoint || 1024}
                                            onChange={(value) => updateFloatingDesign('tablet_breakpoint', value)}
                                            min={768}
                                            max={1200}
                                            step={10}
                                        __next40pxDefaultSize={true}
                                        __nextHasNoMarginBottom={true}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Design Presets Tab */}
                            {activeTab === 'presets' && (
                                <ProFeature
                                    isProActive={isProActive}
                                    hasProFeature={hasProFeature}
                                    feature="design_presets"
                                    overlay={true}
                                    title={__('Design Presets', 'easy-share-solution')}
                                    description={__('Access professionally designed themes and presets to instantly transform your floating panel appearance.', 'easy-share-solution')}
                                >
                                    <div className="ess-presets-tab">
                                        <h3>{__('Design Presets', 'easy-share-solution')}</h3>
                                        <p>{__('Choose from professionally designed themes to instantly transform your floating panel.', 'easy-share-solution')}</p>

                                    <div style={{ 
                                        display: 'grid', 
                                        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
                                        gap: '20px',
                                        marginTop: '24px'
                                    }}>
                                        {/* Modern Glass Preset */}
                                        <div 
                                            onClick={() => applyPreset('modern-glass', {
                                                background_style: 'glass',
                                                background_color: '#ffffff',
                                                icon_style: 'circle',
                                                hover_animation: 'scale',
                                                entrance_animation: 'fadeIn'
                                            })}
                                            style={{
                                                padding: '20px',
                                                border: activePreset === 'modern-glass' ? '3px solid #007cba' : '2px solid #e0e0e0',
                                                borderRadius: '12px',
                                                cursor: 'pointer',
                                                textAlign: 'center',
                                                transition: 'all 0.3s',
                                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                color: '#fff',
                                                transform: activePreset === 'modern-glass' ? 'scale(1.02)' : 'scale(1)',
                                                boxShadow: activePreset === 'modern-glass' ? '0 4px 20px rgba(0,123,186,0.3)' : 'none',
                                                position: 'relative'
                                            }}
                                        >
                                            {activePreset === 'modern-glass' && (
                                                <div style={{
                                                    position: 'absolute',
                                                    top: '8px',
                                                    right: '8px',
                                                    background: '#007cba',
                                                    color: '#fff',
                                                    borderRadius: '50%',
                                                    width: '24px',
                                                    height: '24px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: '12px',
                                                    fontWeight: 'bold'
                                                }}>
                                                    ✓
                                                </div>
                                            )}
                                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '16px' }}>
                                                <div style={{ width: '30px', height: '30px', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '50%', backdropFilter: 'blur(10px)' }}></div>
                                                <div style={{ width: '30px', height: '30px', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '50%', backdropFilter: 'blur(10px)' }}></div>
                                                <div style={{ width: '30px', height: '30px', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '50%', backdropFilter: 'blur(10px)' }}></div>
                                            </div>
                                            <strong>{__('Modern Glass', 'easy-share-solution')}</strong>
                                            <p style={{ fontSize: '12px', margin: '8px 0 0 0', opacity: 0.9 }}>
                                                {__('Sleek glassmorphism with subtle animations', 'easy-share-solution')}
                                            </p>
                                        </div>

                                        {/* Vibrant Neon Preset */}
                                        <div 
                                            onClick={() => applyPreset('vibrant-neon', {
                                                background_style: 'solid',
                                                background_color: '#1a1a1a',
                                                icon_style: 'rounded',
                                                hover_animation: 'glow',
                                                entrance_animation: 'bounceIn',
                                                use_platform_colors: false,
                                                icon_color: '#00ff88'
                                            })}
                                            style={{
                                                padding: '20px',
                                                border: activePreset === 'vibrant-neon' ? '3px solid #007cba' : '2px solid #00ff88',
                                                borderRadius: '12px',
                                                cursor: 'pointer',
                                                textAlign: 'center',
                                                transition: 'all 0.3s',
                                                background: '#1a1a1a',
                                                color: '#00ff88',
                                                boxShadow: activePreset === 'vibrant-neon' ? '0 4px 20px rgba(0,123,186,0.3)' : '0 0 20px rgba(0,255,136,0.3)',
                                                position: 'relative',
                                                transform: activePreset === 'vibrant-neon' ? 'scale(1.02)' : 'scale(1)'
                                            }}
                                        >
                                            {activePreset === 'vibrant-neon' && (
                                                <div style={{
                                                    position: 'absolute',
                                                    top: '8px',
                                                    right: '8px',
                                                    background: '#007cba',
                                                    color: '#fff',
                                                    borderRadius: '50%',
                                                    width: '24px',
                                                    height: '24px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: '12px',
                                                    fontWeight: 'bold'
                                                }}>
                                                    ✓
                                                </div>
                                            )}
                                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '16px' }}>
                                                <div style={{ width: '30px', height: '30px', backgroundColor: '#00ff88', borderRadius: '8px', boxShadow: '0 0 15px rgba(0,255,136,0.5)' }}></div>
                                                <div style={{ width: '30px', height: '30px', backgroundColor: '#ff0080', borderRadius: '8px', boxShadow: '0 0 15px rgba(255,0,128,0.5)' }}></div>
                                                <div style={{ width: '30px', height: '30px', backgroundColor: '#0080ff', borderRadius: '8px', boxShadow: '0 0 15px rgba(0,128,255,0.5)' }}></div>
                                            </div>
                                            <strong>{__('Vibrant Neon', 'easy-share-solution')}</strong>
                                            <p style={{ fontSize: '12px', margin: '8px 0 0 0', opacity: 0.9 }}>
                                                {__('Eye-catching neon colors with glow effects', 'easy-share-solution')}
                                            </p>
                                        </div>

                                        {/* Minimal Clean Preset */}
                                        <div 
                                            onClick={() => applyPreset('minimal-clean', {
                                                background_style: 'solid',
                                                background_color: '#ffffff',
                                                icon_style: 'circle',
                                                hover_animation: 'lift',
                                                entrance_animation: 'slideInUp',
                                                use_platform_colors: false,
                                                icon_color: '#333333'
                                            })}
                                            style={{
                                                padding: '20px',
                                                border: activePreset === 'minimal-clean' ? '3px solid #007cba' : '2px solid #e0e0e0',
                                                borderRadius: '12px',
                                                cursor: 'pointer',
                                                textAlign: 'center',
                                                transition: 'all 0.3s',
                                                background: '#ffffff',
                                                color: '#333333',
                                                position: 'relative',
                                                transform: activePreset === 'minimal-clean' ? 'scale(1.02)' : 'scale(1)',
                                                boxShadow: activePreset === 'minimal-clean' ? '0 4px 20px rgba(0,123,186,0.3)' : 'none'
                                            }}
                                        >
                                            {activePreset === 'minimal-clean' && (
                                                <div style={{
                                                    position: 'absolute',
                                                    top: '8px',
                                                    right: '8px',
                                                    background: '#007cba',
                                                    color: '#fff',
                                                    borderRadius: '50%',
                                                    width: '24px',
                                                    height: '24px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: '12px',
                                                    fontWeight: 'bold'
                                                }}>
                                                    ✓
                                                </div>
                                            )}
                                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '16px' }}>
                                                <div style={{ width: '30px', height: '30px', backgroundColor: '#333333', borderRadius: '50%' }}></div>
                                                <div style={{ width: '30px', height: '30px', backgroundColor: '#666666', borderRadius: '50%' }}></div>
                                                <div style={{ width: '30px', height: '30px', backgroundColor: '#999999', borderRadius: '50%' }}></div>
                                            </div>
                                            <strong>{__('Minimal Clean', 'easy-share-solution')}</strong>
                                            <p style={{ fontSize: '12px', margin: '8px 0 0 0', color: '#666' }}>
                                                {__('Simple, elegant design with subtle effects', 'easy-share-solution')}
                                            </p>
                                        </div>

                                        {/* Gradient Flow Preset */}
                                        <div 
                                            onClick={() => applyPreset('gradient-flow', {
                                                background_style: 'gradient',
                                                background_color: '#ff6b6b',
                                                icon_style: 'rounded',
                                                hover_animation: 'pulse',
                                                entrance_animation: 'zoomIn',
                                                use_platform_colors: true
                                            })}
                                            style={{
                                                padding: '20px',
                                                border: activePreset === 'gradient-flow' ? '3px solid #007cba' : '2px solid transparent',
                                                borderRadius: '12px',
                                                cursor: 'pointer',
                                                textAlign: 'center',
                                                transition: 'all 0.3s',
                                                background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1)',
                                                color: '#ffffff',
                                                position: 'relative',
                                                transform: activePreset === 'gradient-flow' ? 'scale(1.02)' : 'scale(1)',
                                                boxShadow: activePreset === 'gradient-flow' ? '0 4px 20px rgba(0,123,186,0.3)' : 'none'
                                            }}
                                        >
                                            {activePreset === 'gradient-flow' && (
                                                <div style={{
                                                    position: 'absolute',
                                                    top: '8px',
                                                    right: '8px',
                                                    background: '#007cba',
                                                    color: '#fff',
                                                    borderRadius: '50%',
                                                    width: '24px',
                                                    height: '24px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: '12px',
                                                    fontWeight: 'bold'
                                                }}>
                                                    ✓
                                                </div>
                                            )}
                                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '16px' }}>
                                                <div style={{ width: '30px', height: '30px', backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: '8px' }}></div>
                                                <div style={{ width: '30px', height: '30px', backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: '8px' }}></div>
                                                <div style={{ width: '30px', height: '30px', backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: '8px' }}></div>
                                            </div>
                                            <strong>{__('Gradient Flow', 'easy-share-solution')}</strong>
                                            <p style={{ fontSize: '12px', margin: '8px 0 0 0', opacity: 0.9 }}>
                                                {__('Colorful gradients with platform colors', 'easy-share-solution')}
                                            </p>
                                        </div>

                                        {/* Dark Mode Preset */}
                                        <div 
                                            onClick={() => applyPreset('dark-mode', {
                                                background_style: 'solid',
                                                background_color: '#2d3748',
                                                icon_style: 'square',
                                                hover_animation: 'rotate',
                                                entrance_animation: 'slideInRight',
                                                use_platform_colors: false,
                                                icon_color: '#a0aec0'
                                            })}
                                            style={{
                                                padding: '20px',
                                                border: activePreset === 'dark-mode' ? '3px solid #007cba' : '2px solid #4a5568',
                                                borderRadius: '12px',
                                                cursor: 'pointer',
                                                textAlign: 'center',
                                                transition: 'all 0.3s',
                                                background: '#2d3748',
                                                color: '#a0aec0',
                                                position: 'relative',
                                                transform: activePreset === 'dark-mode' ? 'scale(1.02)' : 'scale(1)',
                                                boxShadow: activePreset === 'dark-mode' ? '0 4px 20px rgba(0,123,186,0.3)' : 'none'
                                            }}
                                        >
                                            {activePreset === 'dark-mode' && (
                                                <div style={{
                                                    position: 'absolute',
                                                    top: '8px',
                                                    right: '8px',
                                                    background: '#007cba',
                                                    color: '#fff',
                                                    borderRadius: '50%',
                                                    width: '24px',
                                                    height: '24px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: '12px',
                                                    fontWeight: 'bold'
                                                }}>
                                                    ✓
                                                </div>
                                            )}
                                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '16px' }}>
                                                <div style={{ width: '30px', height: '30px', backgroundColor: '#4a5568', borderRadius: '4px' }}></div>
                                                <div style={{ width: '30px', height: '30px', backgroundColor: '#718096', borderRadius: '4px' }}></div>
                                                <div style={{ width: '30px', height: '30px', backgroundColor: '#a0aec0', borderRadius: '4px' }}></div>
                                            </div>
                                            <strong>{__('Dark Mode', 'easy-share-solution')}</strong>
                                            <p style={{ fontSize: '12px', margin: '8px 0 0 0', opacity: 0.8 }}>
                                                {__('Perfect for dark themed websites', 'easy-share-solution')}
                                            </p>
                                        </div>

                                        {/* Retro Style Preset */}
                                        <div 
                                            onClick={() => applyPreset('retro-style', {
                                                background_style: 'solid',
                                                background_color: '#f7dc6f',
                                                icon_style: 'hexagon',
                                                hover_animation: 'wobble',
                                                entrance_animation: 'flipInX',
                                                use_platform_colors: false,
                                                icon_color: '#8b4513'
                                            })}
                                            style={{
                                                padding: '20px',
                                                border: activePreset === 'retro-style' ? '3px solid #007cba' : '2px solid #f39c12',
                                                borderRadius: '12px',
                                                cursor: 'pointer',
                                                textAlign: 'center',
                                                transition: 'all 0.3s',
                                                background: 'linear-gradient(135deg, #f7dc6f 0%, #f39c12 100%)',
                                                color: '#8b4513',
                                                position: 'relative',
                                                transform: activePreset === 'retro-style' ? 'scale(1.02)' : 'scale(1)',
                                                boxShadow: activePreset === 'retro-style' ? '0 4px 20px rgba(0,123,186,0.3)' : 'none'
                                            }}
                                        >
                                            {activePreset === 'retro-style' && (
                                                <div style={{
                                                    position: 'absolute',
                                                    top: '8px',
                                                    right: '8px',
                                                    background: '#007cba',
                                                    color: '#fff',
                                                    borderRadius: '50%',
                                                    width: '24px',
                                                    height: '24px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: '12px',
                                                    fontWeight: 'bold'
                                                }}>
                                                    ✓
                                                </div>
                                            )}
                                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '16px' }}>
                                                <div style={{ width: '30px', height: '30px', backgroundColor: '#e67e22', transform: 'rotate(45deg)' }}></div>
                                                <div style={{ width: '30px', height: '30px', backgroundColor: '#d35400', transform: 'rotate(45deg)' }}></div>
                                                <div style={{ width: '30px', height: '30px', backgroundColor: '#8b4513', transform: 'rotate(45deg)' }}></div>
                                            </div>
                                            <strong>{__('Retro Style', 'easy-share-solution')}</strong>
                                            <p style={{ fontSize: '12px', margin: '8px 0 0 0', opacity: 0.8 }}>
                                                {__('Vintage colors with unique shapes', 'easy-share-solution')}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                {/* Content Icon Presets Section */}
                    <Card style={{ marginTop: '32px' }}>
                        <CardBody>
                            <h3>{__('Content Icon Presets', 'easy-share-solution')}</h3>
                            <p>{__('Design presets for content share icons (.ess-share-block) with transparent backgrounds and SVG fill colors only. These settings affect content icons without background colors.', 'easy-share-solution')}</p>
                            
                            {/* Icon Presets Grid */}
                            <div className="ess-content-preset-grid" style={{ 
                                display: 'grid', 
                                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                                gap: '16px', 
                                marginBottom: '24px' 
                            }}>
                                {[
                                    {
                                        key: 'modern-glass',
                                        name: __('Modern Glass', 'easy-share-solution'),
                                        description: __('Clean transparent icons with blue fill', 'easy-share-solution'),
                                        icon_size: 32,
                                        icon_spacing: 8,
                                        use_platform_colors: false,
                                        svg_fill_color: '#007cba',
                                        hover_animation: 'scale',
                                        icon_arrangement: 'horizontal',
                                        alignment: 'center'
                                    },
                                    {
                                        key: 'vibrant-neon',
                                        name: __('Vibrant Neon', 'easy-share-solution'),
                                        description: __('Bright neon green SVG icons', 'easy-share-solution'),
                                        icon_size: 36,
                                        icon_spacing: 10,
                                        use_platform_colors: false,
                                        svg_fill_color: '#00ff88',
                                        hover_animation: 'glow',
                                        icon_arrangement: 'horizontal',
                                        alignment: 'center'
                                    },
                                    {
                                        key: 'minimal-clean',
                                        name: __('Minimal Clean', 'easy-share-solution'),
                                        description: __('Simple gray SVG icons', 'easy-share-solution'),
                                        icon_style: 'square',
                                        icon_size: 28,
                                        icon_spacing: 4,
                                        use_platform_colors: false,
                                        svg_fill_color: '#495057',
                                        hover_animation: 'lift',
                                        icon_arrangement: 'horizontal',
                                        alignment: 'center'
                                    },
                                    {
                                        key: 'gradient-flow',
                                        name: __('Gradient Flow', 'easy-share-solution'),
                                        description: __('Purple SVG icons with flow animation', 'easy-share-solution'),
                                        icon_size: 34,
                                        icon_spacing: 8,
                                        use_platform_colors: false,
                                        svg_fill_color: '#667eea',
                                        hover_animation: 'bounce',
                                        icon_arrangement: 'horizontal',
                                        alignment: 'center'
                                    },
                                    {
                                        key: 'svg-blue',
                                        name: __('SVG Blue', 'easy-share-solution'),
                                        description: __('Blue SVG fill only', 'easy-share-solution'),
                                        icon_size: 32,
                                        icon_spacing: 6,
                                        use_platform_colors: false,
                                        svg_fill_color: '#3b82f6',
                                        hover_animation: 'scale',
                                        icon_arrangement: 'horizontal',
                                        alignment: 'center'
                                    },
                                    {
                                        key: 'svg-red',
                                        name: __('SVG Red', 'easy-share-solution'),
                                        description: __('Red SVG fill only', 'easy-share-solution'),
                                        icon_size: 32,
                                        icon_spacing: 6,
                                        use_platform_colors: false,
                                        svg_fill_color: '#ef4444',
                                        hover_animation: 'scale',
                                        icon_arrangement: 'horizontal',
                                        alignment: 'center'
                                    }
                                ].map((preset) => {
                                    const contentIconDesign = safeSettings.content_icon_design || {};
                                    const isActive = contentIconDesign.active_preset === preset.key;
                                    
                                    return (
                                        <div 
                                            key={preset.key}
                                            className={`ess-preset-card ${isActive ? 'active' : ''}`}
                                            style={{
                                                padding: '16px',
                                                border: isActive ? '2px solid #007cba' : '1px solid #ddd',
                                                borderRadius: '8px',
                                                backgroundColor: '#fff',
                                                cursor: 'pointer',
                                                textAlign: 'center',
                                                transition: 'all 0.2s ease',
                                                position: 'relative'
                                            }}
                                            onClick={() => {
                                                // Update active preset
                                                updateNestedSetting('content_icon_design', 'active_preset', preset.key);
                                                
                                                // Apply all preset settings
                                                Object.entries(preset).forEach(([key, value]) => {
                                                    if (key !== 'key' && key !== 'name') {
                                                        updateNestedSetting('content_icon_design', key, value);
                                                    }
                                                });
                                            }}
                                        >
                                            {isActive && (
                                                <div style={{
                                                    position: 'absolute',
                                                    top: '8px',
                                                    right: '8px',
                                                    background: '#007cba',
                                                    color: '#fff',
                                                    borderRadius: '50%',
                                                    width: '20px',
                                                    height: '20px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: '10px',
                                                    fontWeight: 'bold'
                                                }}>
                                                    ✓
                                                </div>
                                            )}
                                            
                                            <h4 style={{ margin: '0 0 8px 0', fontSize: '14px' }}>
                                                {preset.name}
                                            </h4>
                                            
                                            {/* Mini preview - SVG color only */}
                                            <div style={{
                                                display: 'flex',
                                                justifyContent: 'center',
                                                gap: `${preset.icon_spacing || 6}px`,
                                                margin: '8px 0'
                                            }}>
                                                {['facebook', 'x_com', 'linkedin'].map((platform, index) => (
                                                    <div key={platform} style={{
                                                        width: `${(preset.icon_size || 32) * 0.4}px`,
                                                        height: `${(preset.icon_size || 32) * 0.4}px`,
                                                        background: 'transparent',
                                                        border: `2px solid ${preset.use_platform_colors 
                                                            ? (platform === 'facebook' ? '#1877f2' : platform === 'x_com' ? '#000000' : '#0077b5')
                                                            : (preset.svg_fill_color || '#007cba')}`,
                                                        borderRadius: preset.icon_style === 'square' ? '2px' : '50%',
                                                        position: 'relative'
                                                    }}>
                                                        {/* SVG icon representation */}
                                                        <div style={{
                                                            position: 'absolute',
                                                            top: '50%',
                                                            left: '50%',
                                                            transform: 'translate(-50%, -50%)',
                                                            width: '60%',
                                                            height: '60%',
                                                            backgroundColor: preset.use_platform_colors 
                                                                ? (platform === 'facebook' ? '#1877f2' : platform === 'x_com' ? '#000000' : '#0077b5')
                                                                : (preset.svg_fill_color || '#007cba'),
                                                            borderRadius: '1px'
                                                        }} />
                                                    </div>
                                                ))}
                                            </div>
                                            
                                            <p style={{ margin: '8px 0 0 0', fontSize: '11px', color: '#666' }}>
                                                {preset.description || (preset.key.includes('svg-') ? __('SVG Fill Only', 'easy-share-solution') : __('Transparent Background', 'easy-share-solution'))}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Content Icon Settings */}
                            <div style={{ marginTop: '24px' }}>
                                <h4>{__('Icon Alignment', 'easy-share-solution')}</h4>
                                <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                                    {['left', 'center', 'right'].map((align) => {
                                        const contentIconDesign = safeSettings.content_icon_design || {};
                                        const isActive = (contentIconDesign.alignment || 'center') === align;
                                        
                                        return (
                                            <button
                                                key={align}
                                                onClick={() => updateNestedSetting('content_icon_design', 'alignment', align)}
                                                style={{
                                                    padding: '8px 16px',
                                                    border: isActive ? '2px solid #007cba' : '1px solid #ddd',
                                                    borderRadius: '4px',
                                                    background: isActive ? '#e6f3ff' : '#fff',
                                                    color: isActive ? '#007cba' : '#333',
                                                    cursor: 'pointer',
                                                    fontSize: '14px',
                                                    textTransform: 'capitalize'
                                                }}
                                            >
                                                {align}
                                            </button>
                                        );
                                    })}
                                </div>

                                <h4>{__('SVG Fill Color', 'easy-share-solution')}</h4>
                                <div style={{ position: 'relative', marginBottom: '16px' }}>
                                    <div 
                                        onClick={() => toggleColorPicker('contentSvgFill')}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px',
                                            cursor: 'pointer',
                                            padding: '12px',
                                            border: '1px solid #ddd',
                                            borderRadius: '4px',
                                            background: '#fff',
                                            width: 'fit-content'
                                        }}
                                    >
                                        <div 
                                            style={{
                                                width: '24px',
                                                height: '24px',
                                                borderRadius: '4px',
                                                backgroundColor: (safeSettings.content_icon_design?.svg_fill_color || '#007cba'),
                                                border: '1px solid #ddd'
                                            }}
                                        />
                                        <span>{safeSettings.content_icon_design?.svg_fill_color || '#007cba'}</span>
                                    </div>

                                    {showColorPickers.contentSvgFill && (
                                        <div style={{
                                            position: 'absolute',
                                            top: '100%',
                                            left: '0',
                                            zIndex: 1000,
                                            marginTop: '8px',
                                            padding: '16px',
                                            background: '#fff',
                                            border: '1px solid #ddd',
                                            borderRadius: '8px',
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                                        }}>
                                            <ColorPicker
                                                color={safeSettings.content_icon_design?.svg_fill_color || '#007cba'}
                                                onChange={(color) => {
                                                    const newColor = color.hex || color;
                                                    updateNestedSetting('content_icon_design', 'svg_fill_color', newColor);
                                                }}
                                            />
                                            <button 
                                                onClick={() => toggleColorPicker('contentSvgFill')}
                                                style={{
                                                    marginTop: '12px',
                                                    padding: '6px 12px',
                                                    background: '#007cba',
                                                    color: '#fff',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                {__('Done', 'easy-share-solution')}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                                        </CardBody>
                                    </Card>
                                </ProFeature>
                            )}                            {/* Popup Presets Tab */}
                            {activeTab === 'popup-presets' && (
                                <ProFeature
                                    isProActive={isProActive}
                                    hasProFeature={hasProFeature}
                                    feature="popup_style_presets"
                                    overlay={true}
                                    title={__('Popup Style Presets', 'easy-share-solution')}
                                    description={__('Access beautiful pre-designed popup styles and customize popup appearance with professional themes.', 'easy-share-solution')}
                                >
                                    <div className="ess-popup-presets-tab">
                                        <h3>{__('Popup Style Presets', 'easy-share-solution')}</h3>
                                        <p>{__('Choose from beautiful pre-designed popup styles. All popups (ess-share-popup and ess-floating-popup) will use the same style.', 'easy-share-solution')}</p>

                                    {/* Current Active Preset Info */}
                                    <div style={{
                                        background: 'linear-gradient(135deg, #e6f3ff 0%, #f0f8ff 100%)',
                                        border: '2px solid #007cba',
                                        borderRadius: '12px',
                                        padding: '20px',
                                        marginBottom: '32px'
                                    }}>
                                        <h4 style={{ margin: '0 0 8px 0', color: '#007cba' }}>
                                            🎨 {__('Active Popup Style', 'easy-share-solution')}
                                        </h4>
                                        <p style={{ margin: '0', color: '#666' }}>
                                            {popupPresets[activePopupPreset]?.name || __('Default Clean', 'easy-share-solution')}: {' '}
                                            {popupPresets[activePopupPreset]?.description || __('Clean and professional popup with subtle gradients', 'easy-share-solution')}
                                        </p>
                                    </div>

                                    {/* Popup Presets Grid */}
                                    <div style={{ 
                                        display: 'grid', 
                                        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
                                        gap: '24px',
                                        marginBottom: '32px'
                                    }}>
                                        {Object.entries(popupPresets).map(([presetKey, preset]) => (
                                            <div 
                                                key={presetKey}
                                                onClick={() => applyPopupPreset(presetKey)}
                                                style={{
                                                    padding: '24px',
                                                    border: activePopupPreset === presetKey ? '3px solid #007cba' : '2px solid #e0e0e0',
                                                    borderRadius: '16px',
                                                    cursor: 'pointer',
                                                    textAlign: 'center',
                                                    transition: 'all 0.3s',
                                                    background: preset.body_background,
                                                    position: 'relative',
                                                    overflow: 'hidden',
                                                    transform: activePopupPreset === presetKey ? 'scale(1.02)' : 'scale(1)',
                                                    boxShadow: activePopupPreset === presetKey ? '0 8px 25px rgba(0,123,186,0.3)' : '0 4px 12px rgba(0,0,0,0.1)'
                                                }}
                                                onMouseEnter={(e) => {
                                                    if (activePopupPreset !== presetKey) {
                                                        e.target.style.transform = 'scale(1.02)';
                                                        e.target.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
                                                    }
                                                }}
                                                onMouseLeave={(e) => {
                                                    if (activePopupPreset !== presetKey) {
                                                        e.target.style.transform = 'scale(1)';
                                                        e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                                                    }
                                                }}
                                            >
                                                {/* Active indicator */}
                                                {activePopupPreset === presetKey && (
                                                    <div style={{
                                                        position: 'absolute',
                                                        top: '12px',
                                                        right: '12px',
                                                        background: '#007cba',
                                                        color: '#fff',
                                                        borderRadius: '50%',
                                                        width: '28px',
                                                        height: '28px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        fontSize: '14px',
                                                        fontWeight: 'bold',
                                                        boxShadow: '0 2px 8px rgba(0,123,186,0.4)'
                                                    }}>
                                                        ✓
                                                    </div>
                                                )}

                                                {/* Mini popup preview */}
                                                <div style={{
                                                    background: preset.header_background,
                                                    borderRadius: '8px 8px 0 0',
                                                    padding: '12px',
                                                    marginBottom: '12px',
                                                    position: 'relative'
                                                }}>
                                                    <div style={{
                                                        color: preset.header_text_color,
                                                        background: preset.header_text_gradient !== 'none' ? preset.header_text_gradient : 'none',
                                                        WebkitBackgroundClip: preset.header_text_gradient !== 'none' ? 'text' : 'unset',
                                                        WebkitTextFillColor: preset.header_text_gradient !== 'none' ? 'transparent' : preset.header_text_color,
                                                        fontSize: '14px',
                                                        fontWeight: 'bold'
                                                    }}>
                                                        Share Content
                                                    </div>
                                                </div>

                                                {/* Mini platform icons */}
                                                <div style={{ 
                                                    display: 'flex', 
                                                    gap: '8px', 
                                                    justifyContent: 'center', 
                                                    marginBottom: '16px',
                                                    flexWrap: 'wrap'
                                                }}>
                                                    {['📘', '🐦', '💼', '💬'].map((icon, index) => (
                                                        <div key={index} style={{
                                                            background: preset.platform_background,
                                                            border: `1px solid ${preset.platform_border}`,
                                                            borderRadius: '6px',
                                                            padding: '6px 8px',
                                                            fontSize: '12px',
                                                            color: preset.platform_text_color
                                                        }}>
                                                            {icon}
                                                        </div>
                                                    ))}
                                                </div>

                                                {/* Preset info */}
                                                <div>
                                                    <strong style={{ 
                                                        color: preset.category_title_color,
                                                        fontSize: '16px',
                                                        display: 'block',
                                                        marginBottom: '8px'
                                                    }}>
                                                        {preset.name}
                                                    </strong>
                                                    <p style={{ 
                                                        margin: '0',
                                                        fontSize: '12px',
                                                        color: preset.platform_text_color,
                                                        opacity: 0.8
                                                    }}>
                                                        {preset.description}
                                                    </p>
                                                </div>

                                                {/* Animation speed indicator */}
                                                <div style={{
                                                    position: 'absolute',
                                                    bottom: '8px',
                                                    left: '8px',
                                                    fontSize: '10px',
                                                    color: preset.platform_text_color,
                                                    opacity: 0.6,
                                                    background: 'rgba(255,255,255,0.1)',
                                                    padding: '2px 6px',
                                                    borderRadius: '4px'
                                                }}>
                                                    ⚡ {preset.animation_speed}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Usage Instructions */}
                                    <div style={{
                                        background: '#f8f9fa',
                                        border: '1px solid #e9ecef',
                                        borderRadius: '8px',
                                        padding: '20px',
                                        marginBottom: '24px'
                                    }}>
                                        <h4 style={{ margin: '0 0 12px 0', color: '#495057' }}>
                                            📋 {__('How to Use Popup Presets', 'easy-share-solution')}
                                        </h4>
                                        <ul style={{ margin: '0', paddingLeft: '20px', color: '#6c757d' }}>
                                            <li>{__('Click any preset above to apply it instantly', 'easy-share-solution')}</li>
                                            <li>{__('All popup types (share popup & floating popup) will use the same style', 'easy-share-solution')}</li>
                                            <li>{__('Changes are applied immediately and saved automatically', 'easy-share-solution')}</li>
                                            <li>{__('You can switch between presets anytime', 'easy-share-solution')}</li>
                                        </ul>
                                    </div>

                                    {/* Technical Preview Info */}
                                    <div style={{
                                        background: 'linear-gradient(135deg, #fff3cd 0%, #fefefe 100%)',
                                        border: '1px solid #ffc107',
                                        borderRadius: '8px',
                                        padding: '16px'
                                    }}>
                                        <h4 style={{ margin: '0 0 8px 0', color: '#856404' }}>
                                            ⚙️ {__('Technical Details', 'easy-share-solution')}
                                        </h4>
                                        <p style={{ margin: '0', fontSize: '14px', color: '#856404' }}>
                                            {__('Popup presets control header backgrounds, text colors, platform button styles, border radius, animation speeds, and backdrop effects for both ess-share-popup and ess-floating-popup classes.', 'easy-share-solution')}
                                        </p>
                                    </div>
                                    </div>
                                </ProFeature>
                            )}
                        </div>
                    </div>
                </div>

                    
                    {/* Pro Features Notice */}
                    {!isProActive && (
                        <Notice status="info" isDismissible={false} style={{ marginTop: '32px' }}>
                            <strong>{__('Pro Features:', 'easy-share-solution')}</strong>
                            {' '}
                            {__('Unlock advanced animations, custom CSS editor, gradient backgrounds, additional presets, and premium design effects with the Pro version.', 'easy-share-solution')}
                        </Notice>
                    )}
                </CardBody>
            </Card>
        </div>
    );
};

export default DesignSettingsTab;
