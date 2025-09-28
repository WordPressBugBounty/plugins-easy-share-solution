<?php
/**
 * General Settings Management for Easy Share Solution
 *
 * @package EasyShareSolution
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Class EasyShare_General_Settings
 */
class EasyShare_General_Settings {
    
    /**
     * Settings option name
     */
    const OPTION_NAME = 'easy_share_general_settings';
    
    /**
     * Default general settings
     */
    private static $defaults = array(
        // Basic General Settings
        'enabled' => true,
        'show_count' => false,
        'analytics_enabled' => false,
        'floating_panel_auto_hide' => true,
        'front_page_display' => true,
        
        // Display Positions
        'display_positions' => array(
            'before_content' => false,
            'after_content' => true,
            'floating_panel' => true
        ),
        
        // Post Types
        'post_types' => array('post', 'page'),
        
        // Custom CSS
        'custom_css' => '',
        
        // Popup display mode (for backward compatibility)
        'popup_display_mode' => 'icons_text'
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
     * Register REST API routes for general settings
     */
    public function register_rest_routes() {
        register_rest_route('easy-share/v1', '/settings/general', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_general_settings'),
            'permission_callback' => array($this, 'check_admin_permissions')
        ));
        
        register_rest_route('easy-share/v1', '/settings/general', array(
            'methods' => 'POST',
            'callback' => array($this, 'update_general_settings'),
            'permission_callback' => array($this, 'check_admin_permissions'),
            'args' => array()
        ));
        
        register_rest_route('easy-share/v1', '/settings/general/reset', array(
            'methods' => 'POST',
            'callback' => array($this, 'reset_general_settings'),
            'permission_callback' => array($this, 'check_admin_permissions')
        ));
    }
    
    /**
     * Get general settings via REST API
     */
    public function get_general_settings($request) {
        try {
            $settings = self::get_settings();
            
            return rest_ensure_response(array(
                'success' => true,
                'data' => $settings
            ));
            
        } catch (Exception $e) {
            return new WP_Error('settings_error', 'Failed to load general settings: ' . $e->getMessage(), array('status' => 500));
        }
    }
    
    /**
     * Update general settings via REST API
     */
    public function update_general_settings($request) {
        try {
            $params = $request->get_params();
            
            if (empty($params)) {
                return new WP_Error('no_params', 'No parameters received', array('status' => 400));
            }
            
            // Sanitize settings
            $sanitized_settings = self::sanitize_general_settings($params);
            
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
                    'message' => 'General settings updated successfully'
                ));
            } else {
                return new WP_Error('update_failed', 'Failed to update general settings in database', array('status' => 500));
            }
        } catch (Exception $e) {
            return new WP_Error('server_error', 'Server error: ' . $e->getMessage(), array('status' => 500));
        }
    }
    
    /**
     * Reset general settings to defaults via REST API
     */
    public function reset_general_settings($request) {
        try {
            $reset_result = self::reset_to_defaults();
            
            if ($reset_result) {
                wp_cache_delete(self::OPTION_NAME, 'options');
                $current_settings = self::get_settings();
                
                return rest_ensure_response(array(
                    'success' => true,
                    'message' => 'General settings reset to defaults successfully',
                    'data' => $current_settings
                ));
            } else {
                return new WP_Error('reset_failed', 'Failed to reset general settings to defaults', array('status' => 500));
            }
        } catch (Exception $e) {
            return new WP_Error('server_error', 'Server error: ' . $e->getMessage(), array('status' => 500));
        }
    }
    
    /**
     * Get all general settings
     */
    public static function get_settings() {
        $settings = get_option(self::OPTION_NAME, array());
        return wp_parse_args($settings, self::$defaults);
    }
    
    /**
     * Get a specific general setting
     */
    public static function get_setting($key, $default = null) {
        $settings = self::get_settings();
        
        // Support nested keys like 'display_positions.before_content'
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
     * Update a specific general setting
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
     * Update multiple general settings
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
        // Check for missing display_positions
        if (!isset($current_settings['display_positions'])) {
            return true;
        }
        
        return false;
    }
    
    /**
     * Sanitize general settings
     */
    public static function sanitize_general_settings($input) {
        $sanitized = array();
        
        // Basic settings
        $sanitized['enabled'] = isset($input['enabled']) ? (bool) $input['enabled'] : true;
        $sanitized['show_count'] = isset($input['show_count']) ? (bool) $input['show_count'] : false;
        $sanitized['analytics_enabled'] = isset($input['analytics_enabled']) ? (bool) $input['analytics_enabled'] : false;
        
        // Display positions
        if (isset($input['display_positions']) && is_array($input['display_positions'])) {
            $sanitized['display_positions'] = array(
                'before_content' => isset($input['display_positions']['before_content']) ? (bool) $input['display_positions']['before_content'] : false,
                'after_content' => isset($input['display_positions']['after_content']) ? (bool) $input['display_positions']['after_content'] : true,
                'floating_panel' => isset($input['display_positions']['floating_panel']) ? (bool) $input['display_positions']['floating_panel'] : true
            );
        } else {
            $sanitized['display_positions'] = self::$defaults['display_positions'];
        }
        
        // Post types
        if (isset($input['post_types']) && is_array($input['post_types'])) {
            $allowed_post_types = array_keys(get_post_types(array('public' => true)));
            $sanitized['post_types'] = array_intersect($input['post_types'], $allowed_post_types);
        } else {
            $sanitized['post_types'] = self::$defaults['post_types'];
        }
        
        // Colors (legacy)
        
        // Custom CSS  
        if (isset($input['custom_css'])) {
            $sanitized['custom_css'] = wp_strip_all_tags($input['custom_css']);
        } else {
            $sanitized['custom_css'] = '';
        }
        
        // Popup display mode
        $allowed_modes = array('icons_only', 'icons_text');
        $sanitized['popup_display_mode'] = isset($input['popup_display_mode']) && in_array($input['popup_display_mode'], $allowed_modes) ? 
            $input['popup_display_mode'] : 'icons_text';
        
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
