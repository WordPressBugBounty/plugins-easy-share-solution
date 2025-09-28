<?php
/**
 * Design Settings Management for Easy Share Solution
 *
 * @package EasyShareSolution
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Class EasyShare_Design_Settings
 */
class EasyShare_Design_Settings {
    
    /**
     * Settings option name
     */
    const OPTION_NAME = 'easy_share_design_settings';
    
    /**
     * Default design settings
     */
    private static $defaults = array(
        // Comprehensive Floating Panel Design Settings
        'floating_design' => array(
            // Background settings (React field names)
            'background_style' => 'solid',
            'background_color' => '#ffffff',
            'gradient_start_color' => '#007cba',
            'gradient_end_color' => '#005a87',
            'gradient_direction' => '135deg',
            'border_width' => 0,
            'border_color' => '#e0e0e0',
            'border_radius' => 5,
            'enable_shadow' => true,
            'shadow_blur' => 20,
            'shadow_spread' => 0,
            'shadow_opacity' => 0.15,
            
            // Icon styling (React field names)
            'icon_style' => 'circle',
            'icon_size' => 40,
            'icon_spacing' => 8,
            'icon_padding' => 8,
            'icon_border_width' => 0,
            'use_platform_colors' => true,
            'icon_color' => '#007cba',
            
            // Position and arrangement
            'position' => 'center-left',
            'arrangement' => 'vertical-column',
            'auto_hide' => true,
            'show_on_mobile' => true,
            'toggle_button_color' => '#1e88e5',
            'more_button_color' => '#6c757d',
            'show_labels' => true,
            'label_position' => 'right',
            
            // Animations (React field names)
            'entrance_animation' => 'fadeIn',
            'hover_animation' => 'scale',
            'animation_duration' => 300,
            'animation_delay' => 0,
            'staggered_animation' => false,
            'stagger_delay' => 100,
            'hover_color_change' => false,
            'hover_color' => '#ff6b6b',
            'continuous_animation' => 'none',
            
            // Position & Layout (React field names)
            'panel_position' => 'center-left',
            'horizontal_offset' => 20,
            'icon_arrangement' => 'vertical',
            'panel_padding' => 2,
            'z_index' => 9999,
            'auto_hide' => false,
            'auto_hide_delay' => 3,
            
            // Responsive settings (React field names)
            'show_on_mobile' => true,
            'show_on_tablet' => true,
            'mobile_icon_size' => 36,
            'mobile_position' => 'center-left',
            'mobile_arrangement' => 'vertical',
            'mobile_icons_display' => 'fold',
            'mobile_breakpoint' => 768,
            'tablet_breakpoint' => 1024,
            
            // Legacy field mappings (for backwards compatibility)
            'container_background_type' => 'solid',
            'container_background_color' => '#ffffff',
            'container_background_alpha' => 1.0,
            'container_gradient_start' => '#ffffff',
            'container_gradient_end' => '#f0f0f0',
            'container_gradient_direction' => 'to_bottom',
            'container_border_style' => 'solid',
            'container_border_width' => 0,
            'container_border_color' => '#e0e0e0',
            'container_border_radius' => 12,
            'container_shadow_enabled' => true,
            'container_shadow_blur' => 10,
            'container_shadow_spread' => 0,
            'container_shadow_color' => '#00000020',
            'container_padding' => 12,
            'glassmorphism_enabled' => false,
            'glassmorphism_blur' => 10,
            'glassmorphism_opacity' => 0.8,
            'icon_primary_color' => '#007cba',
            'icon_secondary_color' => '#ffffff',
            'icon_hover_color' => '#005a87',
            'icon_background_type' => 'solid',
            'icon_gradient_start' => '#007cba',
            'icon_gradient_end' => '#005a87',
            'icon_border_enabled' => false,
            'icon_border_color' => '#007cba',
            'icon_shape' => 'circle',
            'entrance_duration' => 'normal',
            'entrance_delay' => 100,
            'hover_duration' => 'normal',
            'stagger_enabled' => true,
            'continuous_duration' => 'slow',
            'position_type' => 'fixed_left',
            'custom_position_horizontal' => 'left',
            'custom_position_vertical' => 'center',
            'alignment' => 'center',
            'direction' => 'column',
            'gap' => 8,
            'breakpoints' => array()
        ),
        
        // Content Icon Design Settings (for .ess-share-block)
        'content_icon_design' => array(
            // Active preset
            'active_preset' => 'modern-glass',
            
            // Background settings
            'background_style' => 'solid',
            'background_color' => '#ffffff',
            'gradient_start_color' => '#007cba',
            'gradient_end_color' => '#005a87',
            'gradient_direction' => '135deg',
            'border_width' => 1,
            'border_color' => '#e0e0e0',
            'border_radius' => 8,
            'enable_shadow' => true,
            'shadow_blur' => 15,
            'shadow_spread' => 0,
            'shadow_opacity' => 0.1,
            
            // Icon styling
            'icon_style' => 'circle',
            'icon_size' => 32,
            'icon_spacing' => 6,
            'icon_padding' => 8,
            'icon_border_width' => 0,
            'icon_border_color' => '#007cba',
            'use_platform_colors' => true,
            'icon_color' => '#007cba',
            'svg_fill_color' => '#007cba',
            
            // Hover effects
            'hover_animation' => 'scale',
            'hover_color_change' => false,
            'hover_color' => '#005a87',
            'animation_duration' => 300,
            
            // Layout
            'icon_arrangement' => 'vertical',
            'alignment' => 'center',
            'container_padding' => 12,
            'show_labels' => true,
            'label_position' => 'right'
        )
    );
    
    /**
     * Constructor
     */
    public function __construct() {
        add_action('init', array($this, 'init_settings'));
        add_action('rest_api_init', array($this, 'register_rest_routes'));
    }
    
    /**
     * Initialize settings
     */
    public function init_settings() {
        // Ensure default settings exist
        $this->ensure_defaults();
    }
    
    /**
     * Register REST API routes for design settings
     */
    public function register_rest_routes() {
        register_rest_route('easy-share/v1', '/settings/design', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_design_settings'),
            'permission_callback' => array($this, 'check_admin_permissions')
        ));
        
        register_rest_route('easy-share/v1', '/settings/design', array(
            'methods' => 'POST',
            'callback' => array($this, 'update_design_settings'),
            'permission_callback' => array($this, 'check_admin_permissions'),
            'args' => array()
        ));
        
        register_rest_route('easy-share/v1', '/settings/design/reset', array(
            'methods' => 'POST',
            'callback' => array($this, 'reset_design_settings'),
            'permission_callback' => array($this, 'check_admin_permissions')
        ));
    }
    
    /**
     * Get design settings via REST API
     */
    public function get_design_settings($request) {
        try {
            $settings = self::get_settings();
            
            return rest_ensure_response(array(
                'success' => true,
                'data' => $settings
            ));
            
        } catch (Exception $e) {
            return new WP_Error('settings_error', 'Failed to load design settings: ' . $e->getMessage(), array('status' => 500));
        }
    }
    
    /**
     * Update design settings via REST API
     */
    public function update_design_settings($request) {
        try {
            $params = $request->get_params();
            
            if (empty($params)) {
                return new WP_Error('no_params', 'No parameters received', array('status' => 400));
            }
            
            // Sanitize settings
            $sanitized_settings = self::sanitize_design_settings($params);
            
            if (empty($sanitized_settings)) {
                return new WP_Error('sanitization_failed', 'Settings sanitization failed', array('status' => 400));
            }
            
            // Update settings
            $updated = self::update_settings($sanitized_settings);
            
            if ($updated !== false) {
                wp_cache_delete(self::OPTION_NAME, 'options');
                
                return rest_ensure_response(array(
                    'success' => true,
                    'data' => $sanitized_settings,
                    'message' => 'Design settings updated successfully'
                ));
            } else {
                return new WP_Error('update_failed', 'Failed to update design settings in database', array('status' => 500));
            }
        } catch (Exception $e) {
            return new WP_Error('server_error', 'Server error: ' . $e->getMessage(), array('status' => 500));
        }
    }
    
    /**
     * Reset design settings to defaults via REST API
     */
    public function reset_design_settings($request) {
        try {
            $reset_result = self::reset_to_defaults();
            
            if ($reset_result) {
                wp_cache_delete(self::OPTION_NAME, 'options');
                $current_settings = self::get_settings();
                
                return rest_ensure_response(array(
                    'success' => true,
                    'message' => 'Design settings reset to defaults successfully',
                    'data' => $current_settings
                ));
            } else {
                return new WP_Error('reset_failed', 'Failed to reset design settings to defaults', array('status' => 500));
            }
        } catch (Exception $e) {
            return new WP_Error('server_error', 'Server error: ' . $e->getMessage(), array('status' => 500));
        }
    }
    
    /**
     * Get all design settings
     */
    public static function get_settings() {
        $settings = get_option(self::OPTION_NAME, array());
        return wp_parse_args($settings, self::$defaults);
    }
    
    /**
     * Get a specific design setting
     */
    public static function get_setting($key, $default = null) {
        $settings = self::get_settings();
        
        // Support nested keys like 'floating_design.background_color'
        if (strpos($key, '.') !== false) {
            $keys = explode('.', $key);
            $value = $settings;
            
            foreach ($keys as $nested_key) {
                if (isset($value[$nested_key])) {
                    $value = $value[$nested_key];
                } else {
                    return $default;
                }
            }
            
            return $value;
        }
        
        return isset($settings[$key]) ? $settings[$key] : $default;
    }
    
    /**
     * Update a specific design setting
     */
    public static function update_setting($key, $value) {
        $settings = self::get_settings();
        
        // Support nested keys
        if (strpos($key, '.') !== false) {
            $keys = explode('.', $key);
            $current = &$settings;
            
            for ($i = 0; $i < count($keys) - 1; $i++) {
                if (!isset($current[$keys[$i]]) || !is_array($current[$keys[$i]])) {
                    $current[$keys[$i]] = array();
                }
                $current = &$current[$keys[$i]];
            }
            
            $current[$keys[count($keys) - 1]] = $value;
        } else {
            $settings[$key] = $value;
        }
        
        return update_option(self::OPTION_NAME, $settings);
    }
    
    /**
     * Update multiple design settings
     */
    public static function update_settings($new_settings) {
        $current_settings = self::get_settings();
        $updated_settings = array_merge($current_settings, $new_settings);
        
        // Check if settings actually changed
        if (serialize($current_settings) === serialize($updated_settings)) {
            return false;
        }
        
        // Force update by adding a timestamp to ensure the data changes
        $updated_settings['_last_updated'] = current_time('mysql');
        
        return update_option(self::OPTION_NAME, $updated_settings);
    }
    
    /**
     * Ensure default settings exist
     */
    private function ensure_defaults() {
        $current_settings = get_option(self::OPTION_NAME, array());
        
        // If settings don't exist or are missing keys, merge with defaults
        if (empty($current_settings) || $this->settings_need_update($current_settings)) {
            $merged_settings = wp_parse_args($current_settings, self::$defaults);
            update_option(self::OPTION_NAME, $merged_settings);
        }
    }
    
    /**
     * Check if settings need update (missing new keys)
     */
    private function settings_need_update($current_settings) {
        // Check for new floating_design section
        if (!isset($current_settings['floating_design'])) {
            return true;
        }
        
        // Check for new content_icon_design section
        if (!isset($current_settings['content_icon_design'])) {
            return true;
        }
        
        // Check for new responsive breakpoints
        if (!isset($current_settings['floating_design']['breakpoints'])) {
            return true;
        }
        
        return false;
    }
    
    /**
     * Sanitize design settings
     */
    public static function sanitize_design_settings($input) {
        $sanitized = array();
        
        // Design settings
        if (isset($input['floating_design']) && is_array($input['floating_design'])) {
            $sanitized['floating_design'] = self::sanitize_floating_design_settings($input['floating_design']);
        } else {
            $sanitized['floating_design'] = self::$defaults['floating_design'];
        }
        
        // Content Icon Design settings
        if (isset($input['content_icon_design']) && is_array($input['content_icon_design'])) {
            $sanitized['content_icon_design'] = self::sanitize_content_icon_design($input['content_icon_design']);
        } else {
            $sanitized['content_icon_design'] = self::$defaults['content_icon_design'];
        }
        
        return $sanitized;
    }
    
    /**
     * Sanitize floating design settings
     */
    private static function sanitize_floating_design_settings($design_input) {
        $sanitized = array();
        
        // Handle both legacy and new field names
        // Background settings
        $sanitized['background_style'] = isset($design_input['background_style']) ? sanitize_text_field($design_input['background_style']) : 'solid';
        $sanitized['background_color'] = isset($design_input['background_color']) ? self::sanitize_hex_color_fallback($design_input['background_color']) : '#ffffff';
        $sanitized['gradient_start_color'] = isset($design_input['gradient_start_color']) ? self::sanitize_hex_color_fallback($design_input['gradient_start_color']) : '#007cba';
        $sanitized['gradient_end_color'] = isset($design_input['gradient_end_color']) ? self::sanitize_hex_color_fallback($design_input['gradient_end_color']) : '#005a87';
        $sanitized['gradient_direction'] = isset($design_input['gradient_direction']) ? sanitize_text_field($design_input['gradient_direction']) : '135deg';
        $sanitized['border_width'] = isset($design_input['border_width']) ? absint($design_input['border_width']) : 0;
        $sanitized['border_color'] = isset($design_input['border_color']) ? self::sanitize_hex_color_fallback($design_input['border_color']) : '#e0e0e0';
        $sanitized['border_radius'] = isset($design_input['border_radius']) ? absint($design_input['border_radius']) : 12;
        $sanitized['enable_shadow'] = isset($design_input['enable_shadow']) ? (bool) $design_input['enable_shadow'] : true;
        $sanitized['shadow_blur'] = isset($design_input['shadow_blur']) ? absint($design_input['shadow_blur']) : 20;
        $sanitized['shadow_spread'] = isset($design_input['shadow_spread']) ? intval($design_input['shadow_spread']) : 0;
        $sanitized['shadow_opacity'] = isset($design_input['shadow_opacity']) ? floatval($design_input['shadow_opacity']) : 0.15;
        
        // Icon styling
        $sanitized['icon_style'] = isset($design_input['icon_style']) ? sanitize_text_field($design_input['icon_style']) : 'circle';
        $sanitized['icon_size'] = isset($design_input['icon_size']) ? absint($design_input['icon_size']) : 40;
        $sanitized['icon_spacing'] = isset($design_input['icon_spacing']) ? absint($design_input['icon_spacing']) : 8;
        $sanitized['icon_padding'] = (isset($design_input['icon_padding']) && $design_input['icon_padding'] !== '') ? absint($design_input['icon_padding']) : 8;
        $sanitized['icon_border_width'] = isset($design_input['icon_border_width']) ? absint($design_input['icon_border_width']) : 0;
        $sanitized['use_platform_colors'] = isset($design_input['use_platform_colors']) ? (bool) $design_input['use_platform_colors'] : true;
        $sanitized['icon_color'] = isset($design_input['icon_color']) ? self::sanitize_hex_color_fallback($design_input['icon_color']) : '#007cba';
        $sanitized['toggle_button_color'] = isset($design_input['toggle_button_color']) ? self::sanitize_hex_color_fallback($design_input['toggle_button_color']) : '#1e88e5';
        $sanitized['more_button_color'] = isset($design_input['more_button_color']) ? self::sanitize_hex_color_fallback($design_input['more_button_color']) : '#6c757d';
        $sanitized['show_labels'] = isset($design_input['show_labels']) ? (bool) $design_input['show_labels'] : true;
        $sanitized['label_position'] = isset($design_input['label_position']) ? sanitize_text_field($design_input['label_position']) : 'right';
        
        // Animations
        $sanitized['entrance_animation'] = isset($design_input['entrance_animation']) ? sanitize_text_field($design_input['entrance_animation']) : 'fadeIn';
        $sanitized['hover_animation'] = isset($design_input['hover_animation']) ? sanitize_text_field($design_input['hover_animation']) : 'scale';
        $sanitized['animation_duration'] = isset($design_input['animation_duration']) ? absint($design_input['animation_duration']) : 300;
        $sanitized['animation_delay'] = isset($design_input['animation_delay']) ? absint($design_input['animation_delay']) : 0;
        $sanitized['staggered_animation'] = isset($design_input['staggered_animation']) ? (bool) $design_input['staggered_animation'] : false;
        $sanitized['stagger_delay'] = isset($design_input['stagger_delay']) ? absint($design_input['stagger_delay']) : 100;
        $sanitized['hover_color_change'] = isset($design_input['hover_color_change']) ? (bool) $design_input['hover_color_change'] : false;
        $sanitized['hover_color'] = isset($design_input['hover_color']) ? self::sanitize_hex_color_fallback($design_input['hover_color']) : '#ff6b6b';
        $sanitized['continuous_animation'] = isset($design_input['continuous_animation']) ? sanitize_text_field($design_input['continuous_animation']) : 'none';
        
        // Position & Layout
        $sanitized['panel_position'] = isset($design_input['panel_position']) ? sanitize_text_field($design_input['panel_position']) : 'center-left';
        $sanitized['horizontal_offset'] = isset($design_input['horizontal_offset']) ? absint($design_input['horizontal_offset']) : 20;
        $sanitized['icon_arrangement'] = isset($design_input['icon_arrangement']) ? sanitize_text_field($design_input['icon_arrangement']) : 'vertical';
        $sanitized['panel_padding'] = isset($design_input['panel_padding']) ? absint($design_input['panel_padding']) : 2;
        $sanitized['z_index'] = isset($design_input['z_index']) ? absint($design_input['z_index']) : 9999;
        $sanitized['auto_hide'] = isset($design_input['auto_hide']) ? (bool) $design_input['auto_hide'] : false;
        $sanitized['auto_hide_delay'] = isset($design_input['auto_hide_delay']) ? floatval($design_input['auto_hide_delay']) : 3;
        
        // Responsive settings
        $sanitized['show_on_mobile'] = isset($design_input['show_on_mobile']) ? (bool) $design_input['show_on_mobile'] : true;
        $sanitized['show_on_tablet'] = isset($design_input['show_on_tablet']) ? (bool) $design_input['show_on_tablet'] : true;
        $sanitized['mobile_icon_size'] = isset($design_input['mobile_icon_size']) ? absint($design_input['mobile_icon_size']) : 36;
        $sanitized['mobile_position'] = isset($design_input['mobile_position']) ? sanitize_text_field($design_input['mobile_position']) : 'center-left';
        $sanitized['mobile_arrangement'] = isset($design_input['mobile_arrangement']) ? sanitize_text_field($design_input['mobile_arrangement']) : 'vertical';
        $sanitized['mobile_icons_display'] = isset($design_input['mobile_icons_display']) ? sanitize_text_field($design_input['mobile_icons_display']) : 'fold';
        $sanitized['mobile_breakpoint'] = isset($design_input['mobile_breakpoint']) ? absint($design_input['mobile_breakpoint']) : 768;
        $sanitized['tablet_breakpoint'] = isset($design_input['tablet_breakpoint']) ? absint($design_input['tablet_breakpoint']) : 1024;
        
        // Legacy field mappings for backwards compatibility
        $sanitized['container_background_type'] = $sanitized['background_style'];
        $sanitized['container_background_color'] = $sanitized['background_color'];
        $sanitized['container_border_radius'] = $sanitized['border_radius'];
        $sanitized['container_shadow_enabled'] = $sanitized['enable_shadow'];
        $sanitized['icon_primary_color'] = $sanitized['icon_color'];
        $sanitized['icon_secondary_color'] = '#ffffff';
        $sanitized['icon_hover_color'] = $sanitized['hover_color'];
        $sanitized['entrance_duration'] = 'normal';
        $sanitized['position_type'] = 'fixed_left';
        
        return $sanitized;
    }
    
    /**
     * Sanitize content icon design settings
     *
     * @param array $design_input Raw content icon design input
     * @return array Sanitized content icon design settings
     */
    private static function sanitize_content_icon_design($design_input) {
        $sanitized = array();
        
        // Valid presets
        $valid_presets = array('modern-glass', 'vibrant-neon', 'minimal-clean', 'gradient-flow', 'svg-blue', 'svg-red', 'custom');
        
        // Active preset
        $sanitized['active_preset'] = isset($design_input['active_preset']) && in_array($design_input['active_preset'], $valid_presets) 
            ? $design_input['active_preset'] : 'modern-glass';
        
        // Background settings
        $valid_bg_styles = array('solid', 'gradient', 'transparent');
        $sanitized['background_style'] = isset($design_input['background_style']) && in_array($design_input['background_style'], $valid_bg_styles)
            ? $design_input['background_style'] : 'solid';
        
        $sanitized['background_color'] = isset($design_input['background_color']) 
            ? self::sanitize_hex_color_fallback($design_input['background_color']) : '#ffffff';
            
        $sanitized['gradient_start_color'] = isset($design_input['gradient_start_color']) 
            ? self::sanitize_hex_color_fallback($design_input['gradient_start_color']) : '#007cba';
            
        $sanitized['gradient_end_color'] = isset($design_input['gradient_end_color']) 
            ? self::sanitize_hex_color_fallback($design_input['gradient_end_color']) : '#005a87';
            
        $sanitized['gradient_direction'] = isset($design_input['gradient_direction']) 
            ? sanitize_text_field($design_input['gradient_direction']) : '135deg';
        
        // Border settings
        $sanitized['border_width'] = isset($design_input['border_width']) 
            ? absint($design_input['border_width']) : 1;
            
        $sanitized['border_color'] = isset($design_input['border_color']) 
            ? self::sanitize_hex_color_fallback($design_input['border_color']) : '#e0e0e0';
            
        $sanitized['border_radius'] = isset($design_input['border_radius']) 
            ? absint($design_input['border_radius']) : 8;
        
        // Shadow settings
        $sanitized['enable_shadow'] = isset($design_input['enable_shadow']) 
            ? (bool) $design_input['enable_shadow'] : true;
            
        $sanitized['shadow_blur'] = isset($design_input['shadow_blur']) 
            ? absint($design_input['shadow_blur']) : 15;
            
        $sanitized['shadow_spread'] = isset($design_input['shadow_spread']) 
            ? intval($design_input['shadow_spread']) : 0;
            
        $sanitized['shadow_opacity'] = isset($design_input['shadow_opacity']) 
            ? floatval($design_input['shadow_opacity']) : 0.1;
        
        // Icon settings
        $valid_icon_styles = array('circle', 'rounded', 'square');
        $sanitized['icon_style'] = isset($design_input['icon_style']) && in_array($design_input['icon_style'], $valid_icon_styles)
            ? $design_input['icon_style'] : 'circle';
            
        $sanitized['icon_size'] = isset($design_input['icon_size']) 
            ? absint($design_input['icon_size']) : 32;
            
        $sanitized['icon_spacing'] = isset($design_input['icon_spacing']) 
            ? absint($design_input['icon_spacing']) : 6;
            
        $sanitized['icon_padding'] = isset($design_input['icon_padding']) 
            ? absint($design_input['icon_padding']) : 8;
            
        $sanitized['icon_border_width'] = isset($design_input['icon_border_width']) 
            ? absint($design_input['icon_border_width']) : 0;
            
        $sanitized['icon_border_color'] = isset($design_input['icon_border_color']) 
            ? self::sanitize_hex_color_fallback($design_input['icon_border_color']) : '#007cba';
        
        // Color settings
        $sanitized['use_platform_colors'] = isset($design_input['use_platform_colors']) 
            ? (bool) $design_input['use_platform_colors'] : true;
            
        $sanitized['icon_color'] = isset($design_input['icon_color']) 
            ? self::sanitize_hex_color_fallback($design_input['icon_color']) : '#007cba';
            
        $sanitized['svg_fill_color'] = isset($design_input['svg_fill_color']) 
            ? self::sanitize_hex_color_fallback($design_input['svg_fill_color']) : '#007cba';
        
        // Hover effects
        $valid_animations = array('none', 'scale', 'lift', 'bounce', 'glow');
        $sanitized['hover_animation'] = isset($design_input['hover_animation']) && in_array($design_input['hover_animation'], $valid_animations)
            ? $design_input['hover_animation'] : 'scale';
            
        $sanitized['hover_color_change'] = isset($design_input['hover_color_change']) 
            ? (bool) $design_input['hover_color_change'] : false;
            
        $sanitized['hover_color'] = isset($design_input['hover_color']) 
            ? self::sanitize_hex_color_fallback($design_input['hover_color']) : '#005a87';
            
        $sanitized['animation_duration'] = isset($design_input['animation_duration']) 
            ? absint($design_input['animation_duration']) : 300;
        
        // Layout settings
        $valid_arrangements = array('horizontal', 'vertical');
        $sanitized['icon_arrangement'] = isset($design_input['icon_arrangement']) && in_array($design_input['icon_arrangement'], $valid_arrangements)
            ? $design_input['icon_arrangement'] : 'vertical';
            
        $valid_alignments = array('left', 'center', 'right');
        $sanitized['alignment'] = isset($design_input['alignment']) && in_array($design_input['alignment'], $valid_alignments)
            ? $design_input['alignment'] : 'center';
            
        $sanitized['container_padding'] = isset($design_input['container_padding']) 
            ? absint($design_input['container_padding']) : 12;
            
        $sanitized['show_labels'] = isset($design_input['show_labels']) 
            ? (bool) $design_input['show_labels'] : true;
            
        $valid_label_positions = array('top', 'bottom', 'left', 'right');
        $sanitized['label_position'] = isset($design_input['label_position']) && in_array($design_input['label_position'], $valid_label_positions)
            ? $design_input['label_position'] : 'right';
        
        return $sanitized;
    }
    
    /**
     * Fallback for sanitize_hex_color if not available
     */
    private static function sanitize_hex_color_fallback($color) {
        if (function_exists('sanitize_hex_color')) {
            return sanitize_hex_color($color);
        }
        
        // Fallback implementation
        $color = ltrim($color, '#');
        if (preg_match('/^[a-fA-F0-9]{6}$/', $color) || preg_match('/^[a-fA-F0-9]{3}$/', $color)) {
            return '#' . $color;
        }
        return '#ffffff'; // Default to white if invalid
    }
    
    /**
     * Reset settings to defaults
     */
    public static function reset_to_defaults() {
        return update_option(self::OPTION_NAME, self::$defaults);
    }
    
    /**
     * Export settings for REST API
     */
    public static function export_for_api() {
        return self::get_settings();
    }
    
    /**
     * Check admin permissions
     */
    public function check_admin_permissions() {
        return current_user_can('manage_options');
    }
}
