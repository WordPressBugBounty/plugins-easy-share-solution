<?php
/**
 * Settings management compatibility wrapper
 * 
 * This is a lightweight wrapper that delegates to the new modular settings system
 * while maintaining backward compatibility with existing code.
 *
 * @package EasyShareSolution
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Class EasyShare_Settings
 * Compatibility wrapper for the new modular settings system
 */
class EasyShare_Settings {
    
    /**
     * Settings option name
     */
    const OPTION_NAME = 'easy_share_settings';
    
    /**
     * Constructor
     */
    public function __construct() {
        // Initialize if needed
        add_action('init', array($this, 'init_settings'));
    }
    
    /**
     * Initialize settings
     */
    public function init_settings() {
        // Ensure default settings exist
        $this->ensure_defaults();
    }
    
    /**
     * Get all settings
     */
    public static function get_settings() {
        $settings = get_option(self::OPTION_NAME, array());
        $defaults = self::get_defaults();
        
        // Merge with general settings if available
        if (class_exists('EasyShare_General_Settings')) {
            $general_settings = EasyShare_General_Settings::get_settings();
            // Merge general settings into main settings
            $settings = array_merge($settings, $general_settings);
        }
        
        // Merge with design settings if available
        if (class_exists('Design_Settings')) {
            $design_settings = Design_Settings::get_settings();
            // Merge design settings into main settings
            $settings = array_merge($settings, $design_settings);
        }
        
        return wp_parse_args($settings, $defaults);
    }
    
    /**
     * Get default settings
     */
    public static function get_defaults() {
        return array(
            // General Settings
            'enabled' => true,
            'selected_platforms' => array('facebook', 'x_com', 'linkedin', 'instagram', 'pinterest'),
            'show_count' => false,
            'analytics_enabled' => false,
            
            // Display Positions
            'display_positions' => array(
                'before_content' => false,
                'after_content' => true,
                'floating_panel' => true
            ),
            
            // Post Types
            'post_types' => array('post', 'page'),
            
            // Floating Panel Settings
            'show_floating_panel' => true,
            'floating_panel_position' => 'center-left',
            'floating_panel_auto_hide' => true,
            'floating_panel_icons_display' => 'expand',
            'floating_panel_front_page' => true,
            'floating_panel_home_page' => false,
            
            // Design Settings
            'floating_design' => array(
                'background_style' => 'solid',
                'background_color' => '#ffffff',
                'icon_style' => 'circle',
                'icon_size' => 40,
                'use_platform_colors' => true,
                'icon_color' => '#007cba',
                'border_radius' => 5,
                'arrangement' => 'vertical-column',
                'show_on_mobile' => true,
                'show_labels' => true,
                'label_position' => 'right'
            ),
            
            // Content Icon Design Settings
            'content_icon_design' => array(
                'active_preset' => 'modern-glass',
                'background_style' => 'solid',
                'background_color' => '#ffffff',
                'icon_style' => 'circle',
                'icon_size' => 32,
                'use_platform_colors' => true,
                'icon_color' => '#007cba',
                'border_radius' => 5,
                'arrangement' => 'vertical-column',
                'show_on_mobile' => true,
                'show_labels' => true,
                'label_position' => 'right'
            ),
            
            // Custom CSS
            'custom_css' => ''
        );
    }
    
    /**
     * Update multiple settings
     */
    public static function update_settings($new_settings) {
        $current_settings = self::get_settings();
        $updated_settings = array_merge($current_settings, $new_settings);
        
        // Force update by adding a timestamp
        $updated_settings['_last_updated'] = current_time('mysql');
        
        return update_option(self::OPTION_NAME, $updated_settings);
    }
    
    /**
     * Sanitize settings (basic sanitization)
     */
    public static function sanitize_settings($input) {
        if (!is_array($input)) {
            return self::get_defaults();
        }
        
        // For now, merge with defaults and return
        // Individual settings classes handle detailed sanitization
        return array_merge(self::get_defaults(), $input);
    }
    
    /**
     * Ensure default settings exist
     */
    private function ensure_defaults() {
        $current_settings = get_option(self::OPTION_NAME, array());
        
        if (empty($current_settings)) {
            update_option(self::OPTION_NAME, self::get_defaults());
        }
    }
}
