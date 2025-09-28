<?php
/**
 * Platform Selection Settings Management for Easy Share Solution
 *
 * @package EasyShareSolution
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Class EasyShare_Platform_Settings
 */
class EasyShare_Platform_Settings {
    
    use Easy_Share_Platforms_Trait;
    
    /**
     * Settings option name
     */
    const OPTION_NAME = 'easy_share_platform_settings';
    
    /**
     * Default platform settings
     */
    private static $defaults = array(
        'selected_platforms' => array('facebook', 'x_com', 'linkedin', 'instagram', 'pinterest'),
        
        // Floating Panel Settings
        'show_floating_panel' => true,
        'floating_panel_position' => 'center-left',
        'floating_panel_auto_hide' => true,
        'floating_panel_icons_display' => 'expand',
        'floating_panel_front_page' => true,
        'floating_panel_home_page' => false,
        
        // Popup Presets Settings
        'popup_presets' => array(
            'active_preset' => 'default',
            'header_background' => 'linear-gradient(135deg, #f8f9fd 0%, #ffffff 100%)',
            'header_text_color' => '#2d3748',
            'header_text_gradient' => 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            'body_background' => '#ffffff',
            'category_title_color' => '#2d3748',
            'platform_background' => 'linear-gradient(135deg, #ffffff 0%, #f7fafc 100%)',
            'platform_border' => '#e2e8f0',
            'platform_text_color' => '#4a5568',
            'animation_speed' => '0.4s',
            'border_radius' => '20px',
            'backdrop_blur' => '8px'
        )
    );
    
    /**
     * Constructor
     */
    public function __construct() {
        add_action('init', array($this, 'init_settings'));
        add_action('rest_api_init', array($this, 'register_rest_routes'));
        
        // Include trait file
        require_once EASY_SHARE_PLUGIN_DIR . 'inc/trait-share-platforms.php';
    }
    
    /**
     * Initialize settings
     */
    public function init_settings() {
        // Ensure default settings exist
        $this->ensure_defaults();
    }
    
    /**
     * Register REST API routes for platform settings
     */
    public function register_rest_routes() {
        register_rest_route('easy-share/v1', '/settings/platforms', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_platform_settings'),
            'permission_callback' => array($this, 'check_admin_permissions')
        ));
        
        register_rest_route('easy-share/v1', '/settings/platforms', array(
            'methods' => 'POST',
            'callback' => array($this, 'update_platform_settings'),
            'permission_callback' => array($this, 'check_admin_permissions'),
            'args' => array()
        ));
        
        register_rest_route('easy-share/v1', '/settings/platforms/reset', array(
            'methods' => 'POST',
            'callback' => array($this, 'reset_platform_settings'),
            'permission_callback' => array($this, 'check_admin_permissions')
        ));
        
        // Platforms data endpoint
        register_rest_route('easy-share/v1', '/platforms', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_platforms'),
            'permission_callback' => '__return_true'
        ));
    }
    
    /**
     * Get platform settings via REST API
     */
    public function get_platform_settings($request) {
        try {
            $settings = self::get_settings();
            
            return rest_ensure_response(array(
                'success' => true,
                'data' => $settings
            ));
            
        } catch (Exception $e) {
            return new WP_Error('settings_error', 'Failed to load platform settings: ' . $e->getMessage(), array('status' => 500));
        }
    }
    
    /**
     * Update platform settings via REST API
     */
    public function update_platform_settings($request) {
        try {
            $params = $request->get_params();
            
            if (empty($params)) {
                return new WP_Error('no_params', 'No parameters received', array('status' => 400));
            }
            
            // Sanitize settings
            $sanitized_settings = self::sanitize_platform_settings($params);
            
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
                    'message' => 'Platform settings updated successfully'
                ));
            } else {
                return new WP_Error('update_failed', 'Failed to update platform settings in database', array('status' => 500));
            }
        } catch (Exception $e) {
            return new WP_Error('server_error', 'Server error: ' . $e->getMessage(), array('status' => 500));
        }
    }
    
    /**
     * Reset platform settings to defaults via REST API
     */
    public function reset_platform_settings($request) {
        try {
            $reset_result = self::reset_to_defaults();
            
            if ($reset_result) {
                wp_cache_delete(self::OPTION_NAME, 'options');
                $current_settings = self::get_settings();
                
                return rest_ensure_response(array(
                    'success' => true,
                    'message' => 'Platform settings reset to defaults successfully',
                    'data' => $current_settings
                ));
            } else {
                return new WP_Error('reset_failed', 'Failed to reset platform settings to defaults', array('status' => 500));
            }
        } catch (Exception $e) {
            return new WP_Error('server_error', 'Server error: ' . $e->getMessage(), array('status' => 500));
        }
    }
    
    /**
     * Get platforms data
     */
    public function get_platforms($request) {
        $platforms = $this->get_platforms_data();
        
        return rest_ensure_response(array(
            'success' => true,
            'data' => $platforms
        ));
    }
    
    /**
     * Get all platform settings
     */
    public static function get_settings() {
        $settings = get_option(self::OPTION_NAME, array());
        return wp_parse_args($settings, self::$defaults);
    }
    
    /**
     * Get a specific platform setting
     */
    public static function get_setting($key, $default = null) {
        $settings = self::get_settings();
        
        // Support nested keys like 'popup_presets.active_preset'
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
     * Update a specific platform setting
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
     * Update multiple platform settings
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
        // Check for missing popup_presets
        if (!isset($current_settings['popup_presets'])) {
            return true;
        }
        
        return false;
    }
    
    /**
     * Sanitize platform settings
     */
    public static function sanitize_platform_settings($input) {
        $sanitized = array();
        
        // Platforms
        if (isset($input['selected_platforms']) && is_array($input['selected_platforms'])) {
            $sanitized['selected_platforms'] = array_slice(array_map('sanitize_text_field', $input['selected_platforms']), 0, 10);
        } else {
            $sanitized['selected_platforms'] = self::$defaults['selected_platforms'];
        }
        
        // Floating panel settings
        $sanitized['show_floating_panel'] = isset($input['show_floating_panel']) ? (bool) $input['show_floating_panel'] : true;
        
        $allowed_positions = array('left', 'right', 'center-left', 'center-right', 'top-left', 'top-right', 'bottom-left', 'bottom-right');
        $sanitized['floating_panel_position'] = isset($input['floating_panel_position']) && in_array($input['floating_panel_position'], $allowed_positions) ? 
            $input['floating_panel_position'] : 'center-left';
        
        $sanitized['floating_panel_auto_hide'] = isset($input['floating_panel_auto_hide']) ? (bool) $input['floating_panel_auto_hide'] : true;
        
        $allowed_icons_display = array('expand', 'fold');
        $sanitized['floating_panel_icons_display'] = isset($input['floating_panel_icons_display']) && in_array($input['floating_panel_icons_display'], $allowed_icons_display) ? 
            $input['floating_panel_icons_display'] : 'expand';
        
        $sanitized['floating_panel_front_page'] = isset($input['floating_panel_front_page']) ? (bool) $input['floating_panel_front_page'] : true;
        $sanitized['floating_panel_home_page'] = isset($input['floating_panel_home_page']) ? (bool) $input['floating_panel_home_page'] : false;
        
        // Popup presets settings
        if (isset($input['popup_presets']) && is_array($input['popup_presets'])) {
            $sanitized['popup_presets'] = self::sanitize_popup_presets($input['popup_presets']);
        } else {
            $sanitized['popup_presets'] = self::$defaults['popup_presets'];
        }
        
        return $sanitized;
    }
    
    /**
     * Sanitize popup presets settings
     */
    private static function sanitize_popup_presets($popup_input) {
        $sanitized = array();
        
        // Valid presets
        $valid_presets = array('default', 'modern-dark', 'vibrant-gradient', 'minimal-glass', 'retro-warm', 'neon-cyber');
        
        // Active preset
        $sanitized['active_preset'] = isset($popup_input['active_preset']) && in_array($popup_input['active_preset'], $valid_presets) ? 
            $popup_input['active_preset'] : 'default';
        
        // Header settings
        $sanitized['header_background'] = isset($popup_input['header_background']) ? 
            sanitize_text_field($popup_input['header_background']) : 'linear-gradient(135deg, #f8f9fd 0%, #ffffff 100%)';
        
        $sanitized['header_text_color'] = isset($popup_input['header_text_color']) ? 
            self::sanitize_hex_color_fallback($popup_input['header_text_color']) : '#2d3748';
        
        $sanitized['header_text_gradient'] = isset($popup_input['header_text_gradient']) ? 
            sanitize_text_field($popup_input['header_text_gradient']) : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
        
        // Body settings
        $sanitized['body_background'] = isset($popup_input['body_background']) ? 
            self::sanitize_hex_color_fallback($popup_input['body_background']) : '#ffffff';
        
        $sanitized['category_title_color'] = isset($popup_input['category_title_color']) ? 
            self::sanitize_hex_color_fallback($popup_input['category_title_color']) : '#2d3748';
        
        // Platform settings
        $sanitized['platform_background'] = isset($popup_input['platform_background']) ? 
            sanitize_text_field($popup_input['platform_background']) : 'linear-gradient(135deg, #ffffff 0%, #f7fafc 100%)';
        
        $sanitized['platform_border'] = isset($popup_input['platform_border']) ? 
            self::sanitize_hex_color_fallback($popup_input['platform_border']) : '#e2e8f0';
        
        $sanitized['platform_text_color'] = isset($popup_input['platform_text_color']) ? 
            self::sanitize_hex_color_fallback($popup_input['platform_text_color']) : '#4a5568';
        
        // Style settings
        $sanitized['animation_speed'] = isset($popup_input['animation_speed']) ? 
            sanitize_text_field($popup_input['animation_speed']) : '0.4s';
        
        $sanitized['border_radius'] = isset($popup_input['border_radius']) ? 
            sanitize_text_field($popup_input['border_radius']) : '20px';
        
        $sanitized['backdrop_blur'] = isset($popup_input['backdrop_blur']) ? 
            sanitize_text_field($popup_input['backdrop_blur']) : '8px';
        
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
