/**
 * Icon Presets Tab Component - Content Icon Design (.ess-share-block)
 */

import { __ } from '@wordpress/i18n';
import { 
    Card, 
    CardBody, 
    Notice,
    Button,
    ColorPicker,
    ToggleControl,
    SelectControl,
    RangeControl,
    PanelBody,
    PanelRow
} from '@wordpress/components';
import { useState, useEffect } from '@wordpress/element';

const IconPresetsTab = ({ settings, updateSetting, updateNestedSetting, isProActive }) => {
    const [activePreset, setActivePreset] = useState('custom');
    const [showColorPickers, setShowColorPickers] = useState({
        background: false,
        gradientStart: false,
        gradientEnd: false,
        border: false,
        iconColor: false,
        svgFill: false,
        hoverColor: false
    });

    // Safely handle settings object
    const safeSettings = settings || {};
    const contentIconDesign = safeSettings.content_icon_design || {};

    // Set initial active preset from settings
    useEffect(() => {
        if (contentIconDesign.active_preset) {
            setActivePreset(contentIconDesign.active_preset);
        } else {
            // Check if current settings match any preset
            const currentPreset = detectCurrentPreset(contentIconDesign);
            setActivePreset(currentPreset);
        }
    }, [contentIconDesign]);

    // Function to detect which preset matches current settings
    const detectCurrentPreset = (design) => {
        const presets = getIconPresetDefinitions();
        
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

    // Define all icon preset configurations
    const getIconPresetDefinitions = () => ({
        'modern-glass': {
            background_style: 'solid',
            background_color: '#ffffff',
            border_width: 1,
            border_color: '#e2e8f0',
            border_radius: 12,
            enable_shadow: true,
            shadow_blur: 20,
            shadow_opacity: 0.1,
            icon_style: 'circle',
            icon_size: 32,
            icon_spacing: 8,
            icon_padding: 10,
            hover_animation: 'scale',
            use_platform_colors: true,
            icon_arrangement: 'horizontal'
        },
        'vibrant-neon': {
            background_style: 'solid',
            background_color: '#1a1a1a',
            border_width: 2,
            border_color: '#00ff88',
            border_radius: 8,
            enable_shadow: true,
            shadow_blur: 25,
            shadow_opacity: 0.4,
            icon_style: 'rounded',
            icon_size: 36,
            icon_spacing: 10,
            icon_padding: 12,
            hover_animation: 'glow',
            use_platform_colors: false,
            icon_color: '#00ff88',
            icon_arrangement: 'horizontal'
        },
        'minimal-clean': {
            background_style: 'solid',
            background_color: '#f8f9fa',
            border_width: 0,
            border_color: '#dee2e6',
            border_radius: 6,
            enable_shadow: false,
            shadow_blur: 0,
            shadow_opacity: 0,
            icon_style: 'square',
            icon_size: 28,
            icon_spacing: 4,
            icon_padding: 8,
            hover_animation: 'lift',
            use_platform_colors: false,
            icon_color: '#495057',
            icon_arrangement: 'horizontal'
        },
        'gradient-flow': {
            background_style: 'gradient',
            background_color: '#667eea',
            gradient_start_color: '#667eea',
            gradient_end_color: '#764ba2',
            gradient_direction: '135deg',
            border_width: 0,
            border_color: '#transparent',
            border_radius: 16,
            enable_shadow: true,
            shadow_blur: 30,
            shadow_opacity: 0.2,
            icon_style: 'circle',
            icon_size: 34,
            icon_spacing: 8,
            icon_padding: 12,
            hover_animation: 'bounce',
            use_platform_colors: false,
            icon_color: '#ffffff',
            icon_arrangement: 'horizontal'
        },
        'svg-blue': {
            background_style: 'solid',
            background_color: '#ffffff',
            border_width: 1,
            border_color: '#e2e8f0',
            border_radius: 8,
            enable_shadow: false,
            icon_style: 'circle',
            icon_size: 32,
            icon_spacing: 6,
            icon_padding: 8,
            hover_animation: 'scale',
            use_platform_colors: false,
            svg_fill_color: '#3b82f6',
            icon_arrangement: 'horizontal'
        },
        'svg-red': {
            background_style: 'solid',
            background_color: '#ffffff',
            border_width: 1,
            border_color: '#e2e8f0',
            border_radius: 8,
            enable_shadow: false,
            icon_style: 'circle',
            icon_size: 32,
            icon_spacing: 6,
            icon_padding: 8,
            hover_animation: 'scale',
            use_platform_colors: false,
            svg_fill_color: '#ef4444',
            icon_arrangement: 'horizontal'
        }
    });

    // Apply preset function
    const applyIconPreset = (presetName) => {
        const presets = getIconPresetDefinitions();
        const presetSettings = presets[presetName];
        
        if (!presetSettings) {
            return;
        }

        // Update active preset
        updateNestedSetting('content_icon_design', 'active_preset', presetName);
        setActivePreset(presetName);

        // Apply all preset settings
        Object.entries(presetSettings).forEach(([key, value]) => {
            updateNestedSetting('content_icon_design', key, value);
        });
    };

    // Toggle color picker visibility
    const toggleColorPicker = (picker) => {
        setShowColorPickers(prev => ({
            ...prev,
            [picker]: !prev[picker]
        }));
    };

    // Update content icon design setting
    const updateContentIconSetting = (key, value) => {
        updateNestedSetting('content_icon_design', key, value);
        
        // If we're changing a setting manually, switch to custom preset
        if (activePreset !== 'custom') {
            setActivePreset('custom');
            updateNestedSetting('content_icon_design', 'active_preset', 'custom');
        }
    };

    return (
        <div className="ess-icon-presets-tab">
            <Card>
                <CardBody>
                    <h3>{__('Content Icon Presets', 'easy-share-solution')}</h3>
                    <p>{__('Design presets for content share icons (.ess-share-block). These settings only affect content icons and do not impact floating panels.', 'easy-share-solution')}</p>
                    
                    {/* Preset Selection */}
                    <div className="ess-preset-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                        {Object.entries(getIconPresetDefinitions()).map(([presetName, presetConfig]) => (
                            <div key={presetName} className={`ess-preset-card ${activePreset === presetName ? 'active' : ''}`}>
                                <div className="ess-preset-preview" style={{
                                    padding: '16px',
                                    border: activePreset === presetName ? '2px solid #007cba' : '1px solid #ddd',
                                    borderRadius: '8px',
                                    backgroundColor: '#fff',
                                    cursor: 'pointer',
                                    textAlign: 'center'
                                }} onClick={() => applyIconPreset(presetName)}>
                                    <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', textTransform: 'capitalize' }}>
                                        {presetName.replace(/-/g, ' ')}
                                    </h4>
                                    
                                    {/* Mini preview */}
                                    <div style={{
                                        display: 'inline-flex',
                                        gap: `${presetConfig.icon_spacing || 6}px`,
                                        padding: `${presetConfig.container_padding || 8}px`,
                                        background: presetConfig.background_style === 'gradient' 
                                            ? `linear-gradient(${presetConfig.gradient_direction || '135deg'}, ${presetConfig.gradient_start_color || '#667eea'}, ${presetConfig.gradient_end_color || '#764ba2'})`
                                            : presetConfig.background_color || '#ffffff',
                                        borderRadius: `${presetConfig.border_radius || 8}px`,
                                        border: presetConfig.border_width ? `${presetConfig.border_width}px solid ${presetConfig.border_color}` : 'none',
                                        boxShadow: presetConfig.enable_shadow ? `0 ${presetConfig.shadow_blur || 15}px ${presetConfig.shadow_blur || 15}px rgba(0,0,0,${presetConfig.shadow_opacity || 0.1})` : 'none'
                                    }}>
                                        {['facebook', 'x_com', 'linkedin'].map((platform, index) => (
                                            <div key={platform} style={{
                                                width: `${(presetConfig.icon_size || 32) * 0.6}px`,
                                                height: `${(presetConfig.icon_size || 32) * 0.6}px`,
                                                background: presetConfig.use_platform_colors 
                                                    ? (platform === 'facebook' ? '#1877f2' : platform === 'x_com' ? '#000000' : '#0077b5')
                                                    : (presetConfig.svg_fill_color || presetConfig.icon_color || '#007cba'),
                                                borderRadius: presetConfig.icon_style === 'circle' ? '50%' : 
                                                           presetConfig.icon_style === 'rounded' ? '4px' : '2px',
                                                border: presetConfig.icon_border_width ? `${presetConfig.icon_border_width}px solid ${presetConfig.icon_border_color}` : 'none'
                                            }} />
                                        ))}
                                    </div>
                                    
                                    <p style={{ margin: '8px 0 0 0', fontSize: '11px', color: '#666' }}>
                                        {presetName.includes('svg-') ? __('SVG Fill Only', 'easy-share-solution') : __('Full Styling', 'easy-share-solution')}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {activePreset === 'custom' && (
                        <Notice status="info" isDismissible={false}>
                            {__('You are using custom settings. Select a preset above to apply predefined styles.', 'easy-share-solution')}
                        </Notice>
                    )}
                </CardBody>
            </Card>

            {/* Custom Settings Panel */}
            <Card style={{ marginTop: '20px' }}>
                <CardBody>
                    <h3>{__('Custom Icon Settings', 'easy-share-solution')}</h3>
                    
                    {/* Background Settings */}
                    <PanelBody title={__('Background & Container', 'easy-share-solution')} initialOpen={true}>
                        <SelectControl
                            label={__('Background Style', 'easy-share-solution')}
                            value={contentIconDesign.background_style || 'solid'}
                            options={[
                                { label: __('Solid Color', 'easy-share-solution'), value: 'solid' },
                                { label: __('Gradient', 'easy-share-solution'), value: 'gradient' },
                                { label: __('Transparent', 'easy-share-solution'), value: 'transparent' }
                            ]}
                            onChange={(value) => updateContentIconSetting('background_style', value)}
                        __next40pxDefaultSize={true}
                        __nextHasNoMarginBottom={true}
                        />

                        {contentIconDesign.background_style !== 'transparent' && (
                            <PanelRow>
                                <div style={{ width: '100%' }}>
                                    <label>{__('Background Color', 'easy-share-solution')}</label>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '8px' }}>
                                        <div 
                                            style={{
                                                width: '30px',
                                                height: '30px',
                                                backgroundColor: contentIconDesign.background_color || '#ffffff',
                                                border: '1px solid #ccc',
                                                borderRadius: '4px',
                                                cursor: 'pointer'
                                            }}
                                            onClick={() => toggleColorPicker('background')}
                                        />
                                        <span>{contentIconDesign.background_color || '#ffffff'}</span>
                                    </div>
                                    {showColorPickers.background && (
                                        <div style={{ marginTop: '10px' }}>
                                            <ColorPicker
                                                color={contentIconDesign.background_color || '#ffffff'}
                                                onChange={(color) => updateContentIconSetting('background_color', color)}
                                            />
                                        </div>
                                    )}
                                </div>
                            </PanelRow>
                        )}

                        {contentIconDesign.background_style === 'gradient' && (
                            <>
                                <PanelRow>
                                    <div style={{ width: '100%' }}>
                                        <label>{__('Gradient Start Color', 'easy-share-solution')}</label>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '8px' }}>
                                            <div 
                                                style={{
                                                    width: '30px',
                                                    height: '30px',
                                                    backgroundColor: contentIconDesign.gradient_start_color || '#007cba',
                                                    border: '1px solid #ccc',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer'
                                                }}
                                                onClick={() => toggleColorPicker('gradientStart')}
                                            />
                                            <span>{contentIconDesign.gradient_start_color || '#007cba'}</span>
                                        </div>
                                        {showColorPickers.gradientStart && (
                                            <div style={{ marginTop: '10px' }}>
                                                <ColorPicker
                                                    color={contentIconDesign.gradient_start_color || '#007cba'}
                                                    onChange={(color) => updateContentIconSetting('gradient_start_color', color)}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </PanelRow>

                                <PanelRow>
                                    <div style={{ width: '100%' }}>
                                        <label>{__('Gradient End Color', 'easy-share-solution')}</label>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '8px' }}>
                                            <div 
                                                style={{
                                                    width: '30px',
                                                    height: '30px',
                                                    backgroundColor: contentIconDesign.gradient_end_color || '#005a87',
                                                    border: '1px solid #ccc',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer'
                                                }}
                                                onClick={() => toggleColorPicker('gradientEnd')}
                                            />
                                            <span>{contentIconDesign.gradient_end_color || '#005a87'}</span>
                                        </div>
                                        {showColorPickers.gradientEnd && (
                                            <div style={{ marginTop: '10px' }}>
                                                <ColorPicker
                                                    color={contentIconDesign.gradient_end_color || '#005a87'}
                                                    onChange={(color) => updateContentIconSetting('gradient_end_color', color)}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </PanelRow>

                                <SelectControl
                                    label={__('Gradient Direction', 'easy-share-solution')}
                                    value={contentIconDesign.gradient_direction || '135deg'}
                                    options={[
                                        { label: __('Top to Bottom', 'easy-share-solution'), value: '180deg' },
                                        { label: __('Left to Right', 'easy-share-solution'), value: '90deg' },
                                        { label: __('Diagonal ↘', 'easy-share-solution'), value: '135deg' },
                                        { label: __('Diagonal ↙', 'easy-share-solution'), value: '45deg' }
                                    ]}
                                    onChange={(value) => updateContentIconSetting('gradient_direction', value)}
                                __next40pxDefaultSize={true}
                                __nextHasNoMarginBottom={true}
                                />
                            </>
                        )}

                        <RangeControl
                            label={__('Border Radius', 'easy-share-solution')}
                            value={contentIconDesign.border_radius || 8}
                            onChange={(value) => updateContentIconSetting('border_radius', value)}
                            min={0}
                            max={50}
                        __next40pxDefaultSize={true}
                        __nextHasNoMarginBottom={true}
                        />

                        <RangeControl
                            label={__('Container Padding', 'easy-share-solution')}
                            value={contentIconDesign.container_padding || 12}
                            onChange={(value) => updateContentIconSetting('container_padding', value)}
                            min={0}
                            max={50}
                        __next40pxDefaultSize={true}
                        __nextHasNoMarginBottom={true}
                        />
                    </PanelBody>

                    {/* Icon Settings */}
                    <PanelBody title={__('Icon Styling', 'easy-share-solution')} initialOpen={false}>
                        <SelectControl
                            label={__('Icon Style', 'easy-share-solution')}
                            value={contentIconDesign.icon_style || 'circle'}
                            options={[
                                { label: __('Circle', 'easy-share-solution'), value: 'circle' },
                                { label: __('Rounded', 'easy-share-solution'), value: 'rounded' },
                                { label: __('Square', 'easy-share-solution'), value: 'square' }
                            ]}
                            onChange={(value) => updateContentIconSetting('icon_style', value)}
                        __next40pxDefaultSize={true}
                        __nextHasNoMarginBottom={true}
                        />

                        <RangeControl
                            label={__('Icon Size', 'easy-share-solution')}
                            value={contentIconDesign.icon_size || 32}
                            onChange={(value) => updateContentIconSetting('icon_size', value)}
                            min={16}
                            max={64}
                        __next40pxDefaultSize={true}
                        __nextHasNoMarginBottom={true}
                        />

                        <RangeControl
                            label={__('Icon Spacing', 'easy-share-solution')}
                            value={contentIconDesign.icon_spacing || 6}
                            onChange={(value) => updateContentIconSetting('icon_spacing', value)}
                            min={0}
                            max={30}
                        __next40pxDefaultSize={true}
                        __nextHasNoMarginBottom={true}
                        />

                        <RangeControl
                            label={__('Icon Padding', 'easy-share-solution')}
                            value={contentIconDesign.icon_padding || 8}
                            onChange={(value) => updateContentIconSetting('icon_padding', value)}
                            min={0}
                            max={20}
                        __next40pxDefaultSize={true}
                        __nextHasNoMarginBottom={true}
                        />

                        <ToggleControl
                            label={__('Use Platform Colors', 'easy-share-solution')}
                            checked={contentIconDesign.use_platform_colors !== false}
                            onChange={(value) => updateContentIconSetting('use_platform_colors', value)}
                        __nextHasNoMarginBottom={true}
                        />

                        {!contentIconDesign.use_platform_colors && (
                            <>
                                <PanelRow>
                                    <div style={{ width: '100%' }}>
                                        <label>{__('Icon Color', 'easy-share-solution')}</label>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '8px' }}>
                                            <div 
                                                style={{
                                                    width: '30px',
                                                    height: '30px',
                                                    backgroundColor: contentIconDesign.icon_color || '#007cba',
                                                    border: '1px solid #ccc',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer'
                                                }}
                                                onClick={() => toggleColorPicker('iconColor')}
                                            />
                                            <span>{contentIconDesign.icon_color || '#007cba'}</span>
                                        </div>
                                        {showColorPickers.iconColor && (
                                            <div style={{ marginTop: '10px' }}>
                                                <ColorPicker
                                                    color={contentIconDesign.icon_color || '#007cba'}
                                                    onChange={(color) => updateContentIconSetting('icon_color', color)}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </PanelRow>

                                <PanelRow>
                                    <div style={{ width: '100%' }}>
                                        <label>{__('SVG Fill Color', 'easy-share-solution')}</label>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '8px' }}>
                                            <div 
                                                style={{
                                                    width: '30px',
                                                    height: '30px',
                                                    backgroundColor: contentIconDesign.svg_fill_color || contentIconDesign.icon_color || '#007cba',
                                                    border: '1px solid #ccc',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer'
                                                }}
                                                onClick={() => toggleColorPicker('svgFill')}
                                            />
                                            <span>{contentIconDesign.svg_fill_color || contentIconDesign.icon_color || '#007cba'}</span>
                                        </div>
                                        {showColorPickers.svgFill && (
                                            <div style={{ marginTop: '10px' }}>
                                                <ColorPicker
                                                    color={contentIconDesign.svg_fill_color || contentIconDesign.icon_color || '#007cba'}
                                                    onChange={(color) => updateContentIconSetting('svg_fill_color', color)}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </PanelRow>
                            </>
                        )}

                        <SelectControl
                            label={__('Icon Arrangement', 'easy-share-solution')}
                            value={contentIconDesign.icon_arrangement || 'horizontal'}
                            options={[
                                { label: __('Horizontal', 'easy-share-solution'), value: 'horizontal' },
                                { label: __('Vertical', 'easy-share-solution'), value: 'vertical' }
                            ]}
                            onChange={(value) => updateContentIconSetting('icon_arrangement', value)}
                        __next40pxDefaultSize={true}
                        __nextHasNoMarginBottom={true}
                        />
                    </PanelBody>

                    {/* Animation Settings */}
                    <PanelBody title={__('Hover Effects', 'easy-share-solution')} initialOpen={false}>
                        <SelectControl
                            label={__('Hover Animation', 'easy-share-solution')}
                            value={contentIconDesign.hover_animation || 'scale'}
                            options={[
                                { label: __('None', 'easy-share-solution'), value: 'none' },
                                { label: __('Scale', 'easy-share-solution'), value: 'scale' },
                                { label: __('Lift', 'easy-share-solution'), value: 'lift' },
                                { label: __('Bounce', 'easy-share-solution'), value: 'bounce' },
                                { label: __('Glow', 'easy-share-solution'), value: 'glow' }
                            ]}
                            onChange={(value) => updateContentIconSetting('hover_animation', value)}
                        __next40pxDefaultSize={true}
                        __nextHasNoMarginBottom={true}
                        />

                        <RangeControl
                            label={__('Animation Duration (ms)', 'easy-share-solution')}
                            value={contentIconDesign.animation_duration || 300}
                            onChange={(value) => updateContentIconSetting('animation_duration', value)}
                            min={100}
                            max={1000}
                            step={50}
                        __next40pxDefaultSize={true}
                        __nextHasNoMarginBottom={true}
                        />
                    </PanelBody>
                </CardBody>
            </Card>
        </div>
    );
};

export default IconPresetsTab;
