/**
 * Custom hook for managing plugin settings
 */

import { useState, useEffect } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import { __ } from '@wordpress/i18n';

// Default settings constant
const defaultSettings = {
    enabled: true,
    icon_style: 'circle',
    icon_size: 32,
    floating_panel_position: 'center-left',
    show_floating_panel: true,
    show_count: false,
    selected_platforms: ['facebook', 'x_com', 'linkedin', 'instagram', 'pinterest'],
    platform_order: ['facebook', 'x_com', 'linkedin', 'instagram', 'pinterest'],
    visible_platforms_count: 5,
    display_positions: {
        before_content: false,
        after_content: true,
        floating_panel: true
    },
    floating_design: {
        background_style: 'solid',
        background_color: '#ffffff',
        gradient_start_color: '#007cba',
        gradient_end_color: '#005a87',
        gradient_direction: '135deg',
        icon_style: 'circle',
        icon_size: 40,
        hover_animation: 'scale',
        entrance_animation: 'fadeIn',
        animation_duration: 300,
        animation_delay: 0,
        staggered_animation: false,
        stagger_delay: 100,
        hover_color_change: false,
        hover_color: '#ff6b6b',
        continuous_animation: 'none',
        use_platform_colors: true,
        icon_color: '#007cba',
        toggle_button_color: '#1e88e5',
        more_button_color: '#6c757d',
        icon_border_width: 0,
        icon_border_color: '#007cba',
        icon_spacing: 8,
        icon_padding: 8,
        show_labels: true,
        label_position: 'right',
        enable_shadow: true,
        shadow_blur: 20,
        shadow_spread: 0,
        shadow_opacity: 0.15,
        // Position & Layout Settings
        panel_position: 'center-left',
        horizontal_offset: 20,
        icon_arrangement: 'vertical-column',
        panel_padding: 2,
        z_index: 9999,
        auto_hide: true,
        auto_hide_delay: 3,
        // Responsive Design Settings
        show_on_mobile: true,
        show_on_tablet: true,
        mobile_icon_size: 36,
        mobile_position: 'bottom-right',
        mobile_arrangement: 'horizontal',
        mobile_icons_display: 'fold',
        mobile_breakpoint: 768,
        tablet_breakpoint: 1024,
        // Design preset settings
        active_preset: ''
    },
    // Content Icon Design Settings (for .ess-share-block)
    content_icon_design: {
        // Active preset
        active_preset: 'modern-glass',
        
        // Background settings
        background_style: 'solid',
        background_color: '#ffffff',
        gradient_start_color: '#007cba',
        gradient_end_color: '#005a87',
        gradient_direction: '135deg',
        border_width: 1,
        border_color: '#e0e0e0',
        border_radius: 5,
        enable_shadow: true,
        shadow_blur: 15,
        shadow_spread: 0,
        shadow_opacity: 0.1,
        
        // Icon styling
        icon_style: 'circle',
        icon_size: 32,
        icon_spacing: 6,
        icon_padding: 8,
        icon_border_width: 0,
        icon_border_color: '#007cba',
        use_platform_colors: true,
        icon_color: '#007cba',
        svg_fill_color: '#007cba',
        
        // Hover effects
        hover_animation: 'scale',
        hover_color_change: false,
        hover_color: '#005a87',
        animation_duration: 300,
        
        // Layout
        icon_arrangement: 'horizontal',
        container_padding: 12,
        show_labels: true,
        label_position: 'right'
    },
    post_types: ['post', 'page'],
    custom_css: '',
    analytics_enabled: false,
    // New floating panel settings
    floating_panel_horizontal: 'center-left',
    floating_panel_vertical: 'center',
    floating_panel_offset_vertical: 20,
    floating_panel_offset_horizontal: 20,
    floating_panel_auto_hide: true,
    floating_panel_icons_display: 'expand',
    floating_panel_front_page: true,
    floating_panel_home_page: false
};

export const useSettings = () => {
    const [settings, setSettings] = useState(defaultSettings);
    
    const [loading, setLoading] = useState(true);
    const [errors, setErrors] = useState([]);

    // Load settings from WordPress
    const loadSettings = async () => {
        try {
            setLoading(true);
            const response = await apiFetch({
                path: '/easy-share/v1/settings/all',
                method: 'GET'
            });
            
            if (response.success && response.data) {
                setSettings(prev => ({ ...prev, ...response.data }));
            }
            
            setErrors([]);
        } catch (error) {
            console.error('Failed to load settings:', error);
            setErrors([__('Failed to load settings. Using defaults.', 'easy-share-solution')]);
        } finally {
            setLoading(false);
        }
    };

    // Save settings to WordPress
    const saveSettings = async () => {
        try {
            const response = await apiFetch({
                path: '/easy-share/v1/settings/all',
                method: 'POST',
                data: settings
            });
            
            if (response.success) {
                setErrors([]);
                return { success: true, message: response.message || 'Settings saved successfully!' };
            } else {
                throw new Error(response.message || 'Failed to save settings');
            }
        } catch (error) {
            console.error('Failed to save settings:', error);
            const errorMessage = error.message || __('Failed to save settings. Please try again.', 'easy-share-solution');
            setErrors([errorMessage]);
            throw error;
        }
    };

    // Reset settings to defaults
    const resetSettings = async () => {
        try {
            const response = await apiFetch({
                path: '/easy-share/v1/settings/reset',
                method: 'POST'
            });
            
            if (response.success) {
                // Update local state with defaults - prefer server response but fallback to defaultSettings
                setSettings(prev => ({
                    ...defaultSettings,
                    ...(response.data || {})
                }));
                setErrors([]);
                return { 
                    success: true, 
                    message: response.message || 'Settings reset to defaults successfully!'
                };
            } else {
                throw new Error(response.message || 'Failed to reset settings');
            }
        } catch (error) {
            console.error('Failed to reset settings:', error);
            const errorMessage = error.message || __('Failed to reset settings. Please try again.', 'easy-share-solution');
            setErrors([errorMessage]);
            throw error;
        }
    };

    // Update a single setting
    const updateSetting = (key, value) => {
        setSettings(prev => ({
            ...prev,
            [key]: value
        }));
    };

    // Update nested setting (like colors)
    const updateNestedSetting = (parentKey, childKey, value) => {
        setSettings(prev => ({
            ...prev,
            [parentKey]: {
                ...(prev[parentKey] || {}),
                [childKey]: value
            }
        }));
    };

    // Load settings on mount
    useEffect(() => {
        loadSettings();
    }, []);

    return {
        settings,
        loading,
        errors,
        updateSetting,
        updateNestedSetting,
        saveSettings,
        resetSettings,
        reloadSettings: loadSettings
    };
};
