<?php
/**
 * Icon Presets Settings Management for Easy Share Solution
 *
 * @package EasyShareSolution
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Class EasyShare_Icon_Presets_Settings
 */
class EasyShare_Icon_Presets_Settings {
    
    /**
     * Settings option name
     */
    const OPTION_NAME = 'easy_share_icon_presets_settings';
    
    /**
     * Default icon presets settings
     */
    private static $defaults = array(
        // Icon Presets for Content Block
        'content_icon_presets' => array(
            'modern-glass' => array(
                'name' => 'Modern Glass',
                'background_style' => 'solid',
                'background_color' => '#ffffff',
                'gradient_start_color' => '#f8fafc',
                'gradient_end_color' => '#e2e8f0',
                'gradient_direction' => '135deg',
                'border_width' => 1,
                'border_color' => '#e2e8f0',
                'border_radius' => 12,
                'enable_shadow' => true,
                'shadow_blur' => 20,
                'shadow_spread' => 0,
                'shadow_opacity' => 0.1,
                'icon_style' => 'circle',
                'icon_size' => 32,
                'icon_spacing' => 8,
                'icon_padding' => 8,
                'icon_border_width' => 0,
                'use_platform_colors' => true,
                'hover_animation' => 'scale',
                'animation_duration' => 300,
                'icon_arrangement' => 'vertical',
                'alignment' => 'center',
                'container_padding' => 16
            ),
            'vibrant-neon' => array(
                'name' => 'Vibrant Neon',
                'background_style' => 'gradient',
                'background_color' => '#1a1a2e',
                'gradient_start_color' => '#16213e',
                'gradient_end_color' => '#0f3460',
                'gradient_direction' => '135deg',
                'border_width' => 1,
                'border_color' => '#00ff41',
                'border_radius' => 8,
                'enable_shadow' => true,
                'shadow_blur' => 15,
                'shadow_spread' => 0,
                'shadow_opacity' => 0.3,
                'icon_style' => 'rounded',
                'icon_size' => 36,
                'icon_spacing' => 12,
                'icon_padding' => 10,
                'icon_border_width' => 2,
                'use_platform_colors' => false,
                'hover_animation' => 'glow',
                'animation_duration' => 400,
                'icon_arrangement' => 'vertical',
                'alignment' => 'center',
                'container_padding' => 20
            ),
            'minimal-clean' => array(
                'name' => 'Minimal Clean',
                'background_style' => 'transparent',
                'background_color' => 'transparent',
                'gradient_start_color' => '#ffffff',
                'gradient_end_color' => '#f7fafc',
                'gradient_direction' => '90deg',
                'border_width' => 0,
                'border_color' => '#e2e8f0',
                'border_radius' => 0,
                'enable_shadow' => false,
                'shadow_blur' => 0,
                'shadow_spread' => 0,
                'shadow_opacity' => 0,
                'icon_style' => 'square',
                'icon_size' => 28,
                'icon_spacing' => 4,
                'icon_padding' => 6,
                'icon_border_width' => 0,
                'use_platform_colors' => true,
                'hover_animation' => 'lift',
                'animation_duration' => 200,
                'icon_arrangement' => 'vertical',
                'alignment' => 'left',
                'container_padding' => 8
            ),
            'gradient-flow' => array(
                'name' => 'Gradient Flow',
                'background_style' => 'gradient',
                'background_color' => '#667eea',
                'gradient_start_color' => '#667eea',
                'gradient_end_color' => '#764ba2',
                'gradient_direction' => '45deg',
                'border_width' => 0,
                'border_color' => '#667eea',
                'border_radius' => 25,
                'enable_shadow' => true,
                'shadow_blur' => 25,
                'shadow_spread' => 0,
                'shadow_opacity' => 0.2,
                'icon_style' => 'circle',
                'icon_size' => 40,
                'icon_spacing' => 10,
                'icon_padding' => 12,
                'icon_border_width' => 0,
                'use_platform_colors' => false,
                'hover_animation' => 'bounce',
                'animation_duration' => 500,
                'icon_arrangement' => 'vertical',
                'alignment' => 'center',
                'container_padding' => 18
            )
        ),
        
        // Floating Panel Icon Presets
        'floating_panel_presets' => array(
            'classic-left' => array(
                'name' => 'Classic Left',
                'panel_position' => 'center-left',
                'background_style' => 'solid',
                'background_color' => '#ffffff',
                'border_radius' => 12,
                'enable_shadow' => true,
                'shadow_blur' => 20,
                'icon_style' => 'circle',
                'icon_size' => 40,
                'icon_arrangement' => 'vertical',
                'use_platform_colors' => true,
                'hover_animation' => 'scale'
            ),
            'modern-right' => array(
                'name' => 'Modern Right',
                'panel_position' => 'center-right',
                'background_style' => 'gradient',
                'background_color' => '#f8fafc',
                'border_radius' => 16,
                'enable_shadow' => true,
                'shadow_blur' => 25,
                'icon_style' => 'rounded',
                'icon_size' => 44,
                'icon_arrangement' => 'vertical',
                'use_platform_colors' => true,
                'hover_animation' => 'lift'
            ),
            'minimal-bottom' => array(
                'name' => 'Minimal Bottom',
                'panel_position' => 'bottom-center',
                'background_style' => 'transparent',
                'background_color' => 'transparent',
                'border_radius' => 0,
                'enable_shadow' => false,
                'shadow_blur' => 0,
                'icon_style' => 'square',
                'icon_size' => 36,
                'icon_arrangement' => 'vertical',
                'use_platform_colors' => true,
                'hover_animation' => 'glow'
            )
        ),
        
        // Active presets
        'active_content_preset' => 'modern-glass',
        'active_floating_preset' => 'classic-left'
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
     * Register REST API routes for icon presets settings
     */
    public function register_rest_routes() {
        register_rest_route('easy-share/v1', '/settings/icon-presets', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_icon_presets_settings'),
            'permission_callback' => array($this, 'check_admin_permissions')
        ));
        
        register_rest_route('easy-share/v1', '/settings/icon-presets', array(
            'methods' => 'POST',
            'callback' => array($this, 'update_icon_presets_settings'),
            'permission_callback' => array($this, 'check_admin_permissions'),
            'args' => array()
        ));
        
        register_rest_route('easy-share/v1', '/settings/icon-presets/reset', array(
            'methods' => 'POST',
            'callback' => array($this, 'reset_icon_presets_settings'),
            'permission_callback' => array($this, 'check_admin_permissions')
        ));
        
        // Apply preset endpoint
        register_rest_route('easy-share/v1', '/settings/icon-presets/apply', array(
            'methods' => 'POST',
            'callback' => array($this, 'apply_preset'),
            'permission_callback' => array($this, 'check_admin_permissions'),
            'args' => array(
                'preset_type' => array(
                    'required' => true,
                    'type' => 'string',
                    'enum' => array('content', 'floating'),
                    'sanitize_callback' => 'sanitize_text_field'
                ),
                'preset_name' => array(
                    'required' => true,
                    'type' => 'string',
                    'sanitize_callback' => 'sanitize_text_field'
                )
            )
        ));
    }
    
    /**
     * Get icon presets settings via REST API
     */
    public function get_icon_presets_settings($request) {
        try {
            $settings = self::get_settings();
            
            return rest_ensure_response(array(
                'success' => true,
                'data' => $settings
            ));
            
        } catch (Exception $e) {
            return new WP_Error('settings_error', 'Failed to load icon presets settings: ' . $e->getMessage(), array('status' => 500));
        }
    }
    
    /**
     * Update icon presets settings via REST API
     */
    public function update_icon_presets_settings($request) {
        try {
            $params = $request->get_params();
            
            if (empty($params)) {
                return new WP_Error('no_params', 'No parameters received', array('status' => 400));
            }
            
            // Sanitize settings
            $sanitized_settings = self::sanitize_icon_presets_settings($params);
            
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
                    'message' => 'Icon presets settings updated successfully'
                ));
            } else {
                return new WP_Error('update_failed', 'Failed to update icon presets settings in database', array('status' => 500));
            }
        } catch (Exception $e) {
            return new WP_Error('server_error', 'Server error: ' . $e->getMessage(), array('status' => 500));
        }
    }
    
    /**
     * Reset icon presets settings to defaults via REST API
     */
    public function reset_icon_presets_settings($request) {
        try {
            $reset_result = self::reset_to_defaults();
            
            if ($reset_result) {
                wp_cache_delete(self::OPTION_NAME, 'options');
                $current_settings = self::get_settings();
                
                return rest_ensure_response(array(
                    'success' => true,
                    'message' => 'Icon presets settings reset to defaults successfully',
                    'data' => $current_settings
                ));
            } else {
                return new WP_Error('reset_failed', 'Failed to reset icon presets settings to defaults', array('status' => 500));
            }
        } catch (Exception $e) {
            return new WP_Error('server_error', 'Server error: ' . $e->getMessage(), array('status' => 500));
        }
    }
    
    /**
     * Apply a preset via REST API
     */
    public function apply_preset($request) {
        try {
            $preset_type = $request->get_param('preset_type');
            $preset_name = $request->get_param('preset_name');
            
            $settings = self::get_settings();
            
            if ($preset_type === 'content') {
                if (!isset($settings['content_icon_presets'][$preset_name])) {
                    return new WP_Error('invalid_preset', 'Invalid content preset name', array('status' => 400));
                }
                
                $settings['active_content_preset'] = $preset_name;
                
            } elseif ($preset_type === 'floating') {
                if (!isset($settings['floating_panel_presets'][$preset_name])) {
                    return new WP_Error('invalid_preset', 'Invalid floating panel preset name', array('status' => 400));
                }
                
                $settings['active_floating_preset'] = $preset_name;
            }
            
            $updated = self::update_settings($settings);
            
            if ($updated !== false) {
                wp_cache_delete(self::OPTION_NAME, 'options');
                
                return rest_ensure_response(array(
                    'success' => true,
                    'message' => ucfirst($preset_type) . ' preset applied successfully',
                    'data' => array(
                        'preset_type' => $preset_type,
                        'preset_name' => $preset_name,
                        'preset_data' => $settings[$preset_type . '_icon_presets'][$preset_name] ?? $settings['floating_panel_presets'][$preset_name]
                    )
                ));
            } else {
                return new WP_Error('update_failed', 'Failed to apply preset', array('status' => 500));
            }
        } catch (Exception $e) {
            return new WP_Error('server_error', 'Server error: ' . $e->getMessage(), array('status' => 500));
        }
    }
    
    /**
     * Get all icon presets settings
     */
    public static function get_settings() {
        $settings = get_option(self::OPTION_NAME, array());
        return wp_parse_args($settings, self::$defaults);
    }
    
    /**
     * Get a specific icon presets setting
     */
    public static function get_setting($key, $default = null) {
        $settings = self::get_settings();
        
        // Support nested keys like 'content_icon_presets.modern-glass.background_color'
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
     * Update a specific icon presets setting
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
     * Update multiple icon presets settings
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
        // Check for missing presets sections
        if (!isset($current_settings['content_icon_presets']) || !isset($current_settings['floating_panel_presets'])) {
            return true;
        }
        
        return false;
    }
    
    /**
     * Sanitize icon presets settings
     */
    public static function sanitize_icon_presets_settings($input) {
        $sanitized = array();
        
        // Content icon presets
        if (isset($input['content_icon_presets']) && is_array($input['content_icon_presets'])) {
            $sanitized['content_icon_presets'] = array();
            foreach ($input['content_icon_presets'] as $preset_key => $preset_data) {
                $sanitized['content_icon_presets'][sanitize_text_field($preset_key)] = self::sanitize_content_preset($preset_data);
            }
        } else {
            $sanitized['content_icon_presets'] = self::$defaults['content_icon_presets'];
        }
        
        // Floating panel presets
        if (isset($input['floating_panel_presets']) && is_array($input['floating_panel_presets'])) {
            $sanitized['floating_panel_presets'] = array();
            foreach ($input['floating_panel_presets'] as $preset_key => $preset_data) {
                $sanitized['floating_panel_presets'][sanitize_text_field($preset_key)] = self::sanitize_floating_preset($preset_data);
            }
        } else {
            $sanitized['floating_panel_presets'] = self::$defaults['floating_panel_presets'];
        }
        
        // Active presets
        $sanitized['active_content_preset'] = isset($input['active_content_preset']) ? 
            sanitize_text_field($input['active_content_preset']) : 'modern-glass';
        $sanitized['active_floating_preset'] = isset($input['active_floating_preset']) ? 
            sanitize_text_field($input['active_floating_preset']) : 'classic-left';
        
        return $sanitized;
    }
    
    /**
     * Sanitize content preset data
     */
    private static function sanitize_content_preset($preset_data) {
        if (!is_array($preset_data)) {
            return array();
        }
        
        $sanitized = array();
        
        // Basic properties
        $sanitized['name'] = isset($preset_data['name']) ? sanitize_text_field($preset_data['name']) : '';
        $sanitized['background_style'] = isset($preset_data['background_style']) ? sanitize_text_field($preset_data['background_style']) : 'solid';
        $sanitized['background_color'] = isset($preset_data['background_color']) ? self::sanitize_hex_color_fallback($preset_data['background_color']) : '#ffffff';
        $sanitized['gradient_start_color'] = isset($preset_data['gradient_start_color']) ? self::sanitize_hex_color_fallback($preset_data['gradient_start_color']) : '#007cba';
        $sanitized['gradient_end_color'] = isset($preset_data['gradient_end_color']) ? self::sanitize_hex_color_fallback($preset_data['gradient_end_color']) : '#005a87';
        $sanitized['gradient_direction'] = isset($preset_data['gradient_direction']) ? sanitize_text_field($preset_data['gradient_direction']) : '135deg';
        $sanitized['border_width'] = isset($preset_data['border_width']) ? absint($preset_data['border_width']) : 0;
        $sanitized['border_color'] = isset($preset_data['border_color']) ? self::sanitize_hex_color_fallback($preset_data['border_color']) : '#e0e0e0';
        $sanitized['border_radius'] = isset($preset_data['border_radius']) ? absint($preset_data['border_radius']) : 8;
        $sanitized['enable_shadow'] = isset($preset_data['enable_shadow']) ? (bool) $preset_data['enable_shadow'] : false;
        $sanitized['shadow_blur'] = isset($preset_data['shadow_blur']) ? absint($preset_data['shadow_blur']) : 0;
        $sanitized['shadow_spread'] = isset($preset_data['shadow_spread']) ? intval($preset_data['shadow_spread']) : 0;
        $sanitized['shadow_opacity'] = isset($preset_data['shadow_opacity']) ? floatval($preset_data['shadow_opacity']) : 0;
        $sanitized['icon_style'] = isset($preset_data['icon_style']) ? sanitize_text_field($preset_data['icon_style']) : 'circle';
        $sanitized['icon_size'] = isset($preset_data['icon_size']) ? absint($preset_data['icon_size']) : 32;
        $sanitized['icon_spacing'] = isset($preset_data['icon_spacing']) ? absint($preset_data['icon_spacing']) : 6;
        $sanitized['icon_padding'] = isset($preset_data['icon_padding']) ? absint($preset_data['icon_padding']) : 8;
        $sanitized['icon_border_width'] = isset($preset_data['icon_border_width']) ? absint($preset_data['icon_border_width']) : 0;
        $sanitized['use_platform_colors'] = isset($preset_data['use_platform_colors']) ? (bool) $preset_data['use_platform_colors'] : true;
        $sanitized['hover_animation'] = isset($preset_data['hover_animation']) ? sanitize_text_field($preset_data['hover_animation']) : 'scale';
        $sanitized['animation_duration'] = isset($preset_data['animation_duration']) ? absint($preset_data['animation_duration']) : 300;
        $sanitized['icon_arrangement'] = isset($preset_data['icon_arrangement']) ? sanitize_text_field($preset_data['icon_arrangement']) : 'vertical';
        $sanitized['alignment'] = isset($preset_data['alignment']) ? sanitize_text_field($preset_data['alignment']) : 'center';
        $sanitized['container_padding'] = isset($preset_data['container_padding']) ? absint($preset_data['container_padding']) : 12;
        
        return $sanitized;
    }
    
    /**
     * Sanitize floating preset data
     */
    private static function sanitize_floating_preset($preset_data) {
        if (!is_array($preset_data)) {
            return array();
        }
        
        $sanitized = array();
        
        // Basic properties
        $sanitized['name'] = isset($preset_data['name']) ? sanitize_text_field($preset_data['name']) : '';
        $sanitized['panel_position'] = isset($preset_data['panel_position']) ? sanitize_text_field($preset_data['panel_position']) : 'center-left';
        $sanitized['background_style'] = isset($preset_data['background_style']) ? sanitize_text_field($preset_data['background_style']) : 'solid';
        $sanitized['background_color'] = isset($preset_data['background_color']) ? self::sanitize_hex_color_fallback($preset_data['background_color']) : '#ffffff';
        $sanitized['border_radius'] = isset($preset_data['border_radius']) ? absint($preset_data['border_radius']) : 12;
        $sanitized['enable_shadow'] = isset($preset_data['enable_shadow']) ? (bool) $preset_data['enable_shadow'] : true;
        $sanitized['shadow_blur'] = isset($preset_data['shadow_blur']) ? absint($preset_data['shadow_blur']) : 20;
        $sanitized['icon_style'] = isset($preset_data['icon_style']) ? sanitize_text_field($preset_data['icon_style']) : 'circle';
        $sanitized['icon_size'] = isset($preset_data['icon_size']) ? absint($preset_data['icon_size']) : 40;
        $sanitized['icon_arrangement'] = isset($preset_data['icon_arrangement']) ? sanitize_text_field($preset_data['icon_arrangement']) : 'vertical';
        $sanitized['use_platform_colors'] = isset($preset_data['use_platform_colors']) ? (bool) $preset_data['use_platform_colors'] : true;
        $sanitized['hover_animation'] = isset($preset_data['hover_animation']) ? sanitize_text_field($preset_data['hover_animation']) : 'scale';
        
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
