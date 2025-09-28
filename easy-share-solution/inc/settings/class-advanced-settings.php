<?php
/**
 * Advanced Settings for Easy Share Solution
 *
 * @package EasyShareSolution
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Class Advanced_Settings
 */
class Advanced_Settings {
    
    /**
     * Constructor
     */
    public function __construct() {
        add_action('init', array($this, 'init'));
        add_action('rest_api_init', array($this, 'register_rest_routes'));
    }
    
    /**
     * Initialize advanced settings
     */
    public function init() {
        // Add any initialization code here
    }
    
    /**
     * Register REST API routes for advanced settings
     */
    public function register_rest_routes() {
        register_rest_route('easy-share/v1', '/advanced', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_advanced_settings'),
            'permission_callback' => array($this, 'check_admin_permissions'),
        ));
        
        register_rest_route('easy-share/v1', '/advanced', array(
            'methods' => 'POST',
            'callback' => array($this, 'update_advanced_settings'),
            'permission_callback' => array($this, 'check_admin_permissions'),
            'args' => array(
                'custom_css' => array(
                    'type' => 'string',
                    'sanitize_callback' => array($this, 'sanitize_css'),
                ),
                'custom_js' => array(
                    'type' => 'string',
                    'sanitize_callback' => array($this, 'sanitize_js'),
                ),
                'lazy_loading' => array(
                    'type' => 'boolean',
                    'sanitize_callback' => 'rest_sanitize_boolean',
                ),
                'async_loading' => array(
                    'type' => 'boolean',
                    'sanitize_callback' => 'rest_sanitize_boolean',
                ),
                'cache_enabled' => array(
                    'type' => 'boolean',
                    'sanitize_callback' => 'rest_sanitize_boolean',
                ),
                'cache_duration' => array(
                    'type' => 'integer',
                    'sanitize_callback' => 'absint',
                ),
                'minify_css' => array(
                    'type' => 'boolean',
                    'sanitize_callback' => 'rest_sanitize_boolean',
                ),
                'minify_js' => array(
                    'type' => 'boolean',
                    'sanitize_callback' => 'rest_sanitize_boolean',
                ),
                'load_priority' => array(
                    'type' => 'integer',
                    'sanitize_callback' => 'absint',
                ),
                'exclude_pages' => array(
                    'type' => 'array',
                    'items' => array(
                        'type' => 'integer',
                    ),
                ),
                'exclude_posts' => array(
                    'type' => 'array',
                    'items' => array(
                        'type' => 'integer',
                    ),
                ),
                'exclude_categories' => array(
                    'type' => 'array',
                    'items' => array(
                        'type' => 'integer',
                    ),
                ),
                'exclude_tags' => array(
                    'type' => 'array',
                    'items' => array(
                        'type' => 'integer',
                    ),
                ),
                'user_role_restrictions' => array(
                    'type' => 'array',
                    'items' => array(
                        'type' => 'string',
                    ),
                ),
                'device_restrictions' => array(
                    'type' => 'object',
                ),
                'geographic_restrictions' => array(
                    'type' => 'object',
                ),
                'time_restrictions' => array(
                    'type' => 'object',
                ),
                'rate_limiting' => array(
                    'type' => 'object',
                ),
                'security_settings' => array(
                    'type' => 'object',
                ),
            ),
        ));
        
        register_rest_route('easy-share/v1', '/advanced/reset', array(
            'methods' => 'POST',
            'callback' => array($this, 'reset_advanced_settings'),
            'permission_callback' => array($this, 'check_admin_permissions'),
        ));
        
        register_rest_route('easy-share/v1', '/advanced/export', array(
            'methods' => 'GET',
            'callback' => array($this, 'export_settings'),
            'permission_callback' => array($this, 'check_admin_permissions'),
        ));
        
        register_rest_route('easy-share/v1', '/advanced/import', array(
            'methods' => 'POST',
            'callback' => array($this, 'import_settings'),
            'permission_callback' => array($this, 'check_admin_permissions'),
        ));
        
        register_rest_route('easy-share/v1', '/advanced/system-info', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_system_info'),
            'permission_callback' => array($this, 'check_admin_permissions'),
        ));
    }
    
    /**
     * Check admin permissions
     */
    public function check_admin_permissions() {
        return current_user_can('manage_options');
    }
    
    /**
     * Get advanced settings
     */
    public function get_advanced_settings($request) {
        $settings = EasyShare_Settings::get_settings();
        
        $advanced_settings = array(
            'custom_css' => isset($settings['custom_css']) ? $settings['custom_css'] : '',
            'custom_js' => isset($settings['custom_js']) ? $settings['custom_js'] : '',
            'lazy_loading' => isset($settings['lazy_loading']) ? $settings['lazy_loading'] : false,
            'async_loading' => isset($settings['async_loading']) ? $settings['async_loading'] : true,
            'cache_enabled' => isset($settings['cache_enabled']) ? $settings['cache_enabled'] : true,
            'cache_duration' => isset($settings['cache_duration']) ? $settings['cache_duration'] : 3600,
            'minify_css' => isset($settings['minify_css']) ? $settings['minify_css'] : false,
            'minify_js' => isset($settings['minify_js']) ? $settings['minify_js'] : false,
            'load_priority' => isset($settings['load_priority']) ? $settings['load_priority'] : 10,
            'exclude_pages' => isset($settings['exclude_pages']) ? $settings['exclude_pages'] : array(),
            'exclude_posts' => isset($settings['exclude_posts']) ? $settings['exclude_posts'] : array(),
            'exclude_categories' => isset($settings['exclude_categories']) ? $settings['exclude_categories'] : array(),
            'exclude_tags' => isset($settings['exclude_tags']) ? $settings['exclude_tags'] : array(),
            'user_role_restrictions' => isset($settings['user_role_restrictions']) ? $settings['user_role_restrictions'] : array(),
            'device_restrictions' => isset($settings['device_restrictions']) ? $settings['device_restrictions'] : array(
                'mobile' => true,
                'tablet' => true,
                'desktop' => true,
            ),
            'geographic_restrictions' => isset($settings['geographic_restrictions']) ? $settings['geographic_restrictions'] : array(
                'enabled' => false,
                'allowed_countries' => array(),
                'blocked_countries' => array(),
            ),
            'time_restrictions' => isset($settings['time_restrictions']) ? $settings['time_restrictions'] : array(
                'enabled' => false,
                'start_time' => '00:00',
                'end_time' => '23:59',
                'timezone' => 'UTC',
                'days_of_week' => array('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'),
            ),
            'rate_limiting' => isset($settings['rate_limiting']) ? $settings['rate_limiting'] : array(
                'enabled' => false,
                'max_shares_per_minute' => 10,
                'max_shares_per_hour' => 100,
                'max_shares_per_day' => 1000,
            ),
            'security_settings' => isset($settings['security_settings']) ? $settings['security_settings'] : array(
                'csrf_protection' => true,
                'nonce_verification' => true,
                'sanitize_urls' => true,
                'validate_referrer' => false,
            ),
        );
        
        return rest_ensure_response($advanced_settings);
    }
    
    /**
     * Update advanced settings
     */
    public function update_advanced_settings($request) {
        $params = $request->get_params();
        
        $advanced_settings = array();
        
        // Custom CSS/JS
        if (isset($params['custom_css'])) {
            $advanced_settings['custom_css'] = $this->sanitize_css($params['custom_css']);
        }
        
        if (isset($params['custom_js'])) {
            $advanced_settings['custom_js'] = $this->sanitize_js($params['custom_js']);
        }
        
        // Performance settings
        if (isset($params['lazy_loading'])) {
            $advanced_settings['lazy_loading'] = (bool) $params['lazy_loading'];
        }
        
        if (isset($params['async_loading'])) {
            $advanced_settings['async_loading'] = (bool) $params['async_loading'];
        }
        
        if (isset($params['cache_enabled'])) {
            $advanced_settings['cache_enabled'] = (bool) $params['cache_enabled'];
        }
        
        if (isset($params['cache_duration'])) {
            $advanced_settings['cache_duration'] = absint($params['cache_duration']);
        }
        
        if (isset($params['minify_css'])) {
            $advanced_settings['minify_css'] = (bool) $params['minify_css'];
        }
        
        if (isset($params['minify_js'])) {
            $advanced_settings['minify_js'] = (bool) $params['minify_js'];
        }
        
        if (isset($params['load_priority'])) {
            $advanced_settings['load_priority'] = absint($params['load_priority']);
        }
        
        // Exclusion settings
        if (isset($params['exclude_pages'])) {
            $advanced_settings['exclude_pages'] = array_map('absint', (array) $params['exclude_pages']);
        }
        
        if (isset($params['exclude_posts'])) {
            $advanced_settings['exclude_posts'] = array_map('absint', (array) $params['exclude_posts']);
        }
        
        if (isset($params['exclude_categories'])) {
            $advanced_settings['exclude_categories'] = array_map('absint', (array) $params['exclude_categories']);
        }
        
        if (isset($params['exclude_tags'])) {
            $advanced_settings['exclude_tags'] = array_map('absint', (array) $params['exclude_tags']);
        }
        
        // User role restrictions
        if (isset($params['user_role_restrictions'])) {
            $advanced_settings['user_role_restrictions'] = array_map('sanitize_text_field', (array) $params['user_role_restrictions']);
        }
        
        // Device restrictions
        if (isset($params['device_restrictions'])) {
            $advanced_settings['device_restrictions'] = $this->sanitize_device_restrictions($params['device_restrictions']);
        }
        
        // Geographic restrictions
        if (isset($params['geographic_restrictions'])) {
            $advanced_settings['geographic_restrictions'] = $this->sanitize_geographic_restrictions($params['geographic_restrictions']);
        }
        
        // Time restrictions
        if (isset($params['time_restrictions'])) {
            $advanced_settings['time_restrictions'] = $this->sanitize_time_restrictions($params['time_restrictions']);
        }
        
        // Rate limiting
        if (isset($params['rate_limiting'])) {
            $advanced_settings['rate_limiting'] = $this->sanitize_rate_limiting($params['rate_limiting']);
        }
        
        // Security settings
        if (isset($params['security_settings'])) {
            $advanced_settings['security_settings'] = $this->sanitize_security_settings($params['security_settings']);
        }
        
        $updated = EasyShare_Settings::update_settings($advanced_settings);
        
        if ($updated) {
            return rest_ensure_response(array(
                'success' => true,
                'message' => 'Advanced settings updated successfully',
                'settings' => $advanced_settings
            ));
        } else {
            return new WP_Error('update_failed', 'Failed to update advanced settings', array('status' => 500));
        }
    }
    
    /**
     * Reset advanced settings to defaults
     */
    public function reset_advanced_settings($request) {
        $defaults = $this->get_defaults();
        $updated = EasyShare_Settings::update_settings($defaults);
        
        if ($updated) {
            return rest_ensure_response(array(
                'success' => true,
                'message' => 'Advanced settings reset to defaults',
                'settings' => $defaults
            ));
        } else {
            return new WP_Error('reset_failed', 'Failed to reset advanced settings', array('status' => 500));
        }
    }
    
    /**
     * Export all settings
     */
    public function export_settings($request) {
        $all_settings = EasyShare_Settings::get_settings();
        
        $export_data = array(
            'version' => EASY_SHARE_VERSION,
            'export_date' => current_time('mysql'),
            'site_url' => get_site_url(),
            'settings' => $all_settings,
        );
        
        return rest_ensure_response(array(
            'success' => true,
            'data' => $export_data,
            'filename' => 'easy-share-settings-' . gmdate('Y-m-d-H-i-s') . '.json'
        ));
    }
    
    /**
     * Import settings
     */
    public function import_settings($request) {
        $import_data = $request->get_param('import_data');
        
        if (empty($import_data)) {
            return new WP_Error('no_data', 'No import data provided', array('status' => 400));
        }
        
        // Decode if it's a JSON string
        if (is_string($import_data)) {
            $import_data = json_decode($import_data, true);
        }
        
        if (!is_array($import_data) || !isset($import_data['settings'])) {
            return new WP_Error('invalid_data', 'Invalid import data format', array('status' => 400));
        }
        
        $sanitized_settings = EasyShare_Settings::sanitize_settings($import_data['settings']);
        $updated = EasyShare_Settings::update_settings($sanitized_settings);
        
        if ($updated) {
            return rest_ensure_response(array(
                'success' => true,
                'message' => 'Settings imported successfully',
                'imported_settings' => count($sanitized_settings),
            ));
        } else {
            return new WP_Error('import_failed', 'Failed to import settings', array('status' => 500));
        }
    }
    
    /**
     * Get system information
     */
    public function get_system_info($request) {
        global $wp_version;
        
        $system_info = array(
            'wordpress_version' => $wp_version,
            'php_version' => PHP_VERSION,
            'plugin_version' => defined('EASY_SHARE_VERSION') ? EASY_SHARE_VERSION : 'Unknown',
            'theme' => array(
                'name' => get_stylesheet(),
                'version' => wp_get_theme()->get('Version'),
            ),
            'active_plugins' => get_option('active_plugins', array()),
            'server_info' => array(
                'server_software' => isset($_SERVER['SERVER_SOFTWARE']) ? sanitize_text_field(wp_unslash($_SERVER['SERVER_SOFTWARE'])) : 'Unknown',
                'memory_limit' => ini_get('memory_limit'),
                'max_execution_time' => ini_get('max_execution_time'),
                'upload_max_filesize' => ini_get('upload_max_filesize'),
                'post_max_size' => ini_get('post_max_size'),
            ),
            'database' => array(
                'version' => $GLOBALS['wpdb']->db_version(),
                'charset' => $GLOBALS['wpdb']->charset,
                'collate' => $GLOBALS['wpdb']->collate,
            ),
            'constants' => array(
                'WP_DEBUG' => defined('WP_DEBUG') ? WP_DEBUG : false,
                'WP_DEBUG_LOG' => defined('WP_DEBUG_LOG') ? WP_DEBUG_LOG : false,
                'WP_DEBUG_DISPLAY' => defined('WP_DEBUG_DISPLAY') ? WP_DEBUG_DISPLAY : false,
                'SCRIPT_DEBUG' => defined('SCRIPT_DEBUG') ? SCRIPT_DEBUG : false,
            ),
        );
        
        return rest_ensure_response($system_info);
    }
    
    /**
     * Sanitize CSS
     */
    private function sanitize_css($css) {
        // Basic CSS sanitization - remove script tags and javascript
        $css = preg_replace('/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/mi', '', $css);
        $css = preg_replace('/javascript:/i', '', $css);
        $css = preg_replace('/on\w+\s*=/i', '', $css);
        
        return wp_strip_all_tags($css, true);
    }
    
    /**
     * Sanitize JavaScript
     */
    private function sanitize_js($js) {
        // Basic JS sanitization - only allow if user can edit theme options
        if (!current_user_can('edit_theme_options')) {
            return '';
        }
        
        return $js;
    }
    
    /**
     * Sanitize device restrictions
     */
    private function sanitize_device_restrictions($input) {
        return array(
            'mobile' => isset($input['mobile']) ? (bool) $input['mobile'] : true,
            'tablet' => isset($input['tablet']) ? (bool) $input['tablet'] : true,
            'desktop' => isset($input['desktop']) ? (bool) $input['desktop'] : true,
        );
    }
    
    /**
     * Sanitize geographic restrictions
     */
    private function sanitize_geographic_restrictions($input) {
        return array(
            'enabled' => isset($input['enabled']) ? (bool) $input['enabled'] : false,
            'allowed_countries' => isset($input['allowed_countries']) ? array_map('sanitize_text_field', (array) $input['allowed_countries']) : array(),
            'blocked_countries' => isset($input['blocked_countries']) ? array_map('sanitize_text_field', (array) $input['blocked_countries']) : array(),
        );
    }
    
    /**
     * Sanitize time restrictions
     */
    private function sanitize_time_restrictions($input) {
        $valid_days = array('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday');
        
        return array(
            'enabled' => isset($input['enabled']) ? (bool) $input['enabled'] : false,
            'start_time' => isset($input['start_time']) ? sanitize_text_field($input['start_time']) : '00:00',
            'end_time' => isset($input['end_time']) ? sanitize_text_field($input['end_time']) : '23:59',
            'timezone' => isset($input['timezone']) ? sanitize_text_field($input['timezone']) : 'UTC',
            'days_of_week' => isset($input['days_of_week']) ? array_intersect((array) $input['days_of_week'], $valid_days) : $valid_days,
        );
    }
    
    /**
     * Sanitize rate limiting
     */
    private function sanitize_rate_limiting($input) {
        return array(
            'enabled' => isset($input['enabled']) ? (bool) $input['enabled'] : false,
            'max_shares_per_minute' => isset($input['max_shares_per_minute']) ? absint($input['max_shares_per_minute']) : 10,
            'max_shares_per_hour' => isset($input['max_shares_per_hour']) ? absint($input['max_shares_per_hour']) : 100,
            'max_shares_per_day' => isset($input['max_shares_per_day']) ? absint($input['max_shares_per_day']) : 1000,
        );
    }
    
    /**
     * Sanitize security settings
     */
    private function sanitize_security_settings($input) {
        return array(
            'csrf_protection' => isset($input['csrf_protection']) ? (bool) $input['csrf_protection'] : true,
            'nonce_verification' => isset($input['nonce_verification']) ? (bool) $input['nonce_verification'] : true,
            'sanitize_urls' => isset($input['sanitize_urls']) ? (bool) $input['sanitize_urls'] : true,
            'validate_referrer' => isset($input['validate_referrer']) ? (bool) $input['validate_referrer'] : false,
        );
    }
    
    /**
     * Get default advanced settings
     */
    public static function get_defaults() {
        return array(
            'custom_css' => '',
            'custom_js' => '',
            'lazy_loading' => false,
            'async_loading' => true,
            'cache_enabled' => true,
            'cache_duration' => 3600,
            'minify_css' => false,
            'minify_js' => false,
            'load_priority' => 10,
            'exclude_pages' => array(),
            'exclude_posts' => array(),
            'exclude_categories' => array(),
            'exclude_tags' => array(),
            'user_role_restrictions' => array(),
            'device_restrictions' => array(
                'mobile' => true,
                'tablet' => true,
                'desktop' => true,
            ),
            'geographic_restrictions' => array(
                'enabled' => false,
                'allowed_countries' => array(),
                'blocked_countries' => array(),
            ),
            'time_restrictions' => array(
                'enabled' => false,
                'start_time' => '00:00',
                'end_time' => '23:59',
                'timezone' => 'UTC',
                'days_of_week' => array('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'),
            ),
            'rate_limiting' => array(
                'enabled' => false,
                'max_shares_per_minute' => 10,
                'max_shares_per_hour' => 100,
                'max_shares_per_day' => 1000,
            ),
            'security_settings' => array(
                'csrf_protection' => true,
                'nonce_verification' => true,
                'sanitize_urls' => true,
                'validate_referrer' => false,
            ),
        );
    }
    
    /**
     * Sanitize advanced settings
     */
    public static function sanitize_settings($input) {
        $sanitized = array();
        
        $sanitized['custom_css'] = isset($input['custom_css']) ? wp_strip_all_tags($input['custom_css'], true) : '';
        $sanitized['custom_js'] = isset($input['custom_js']) && current_user_can('edit_theme_options') ? $input['custom_js'] : '';
        $sanitized['lazy_loading'] = isset($input['lazy_loading']) ? (bool) $input['lazy_loading'] : false;
        $sanitized['async_loading'] = isset($input['async_loading']) ? (bool) $input['async_loading'] : true;
        $sanitized['cache_enabled'] = isset($input['cache_enabled']) ? (bool) $input['cache_enabled'] : true;
        $sanitized['cache_duration'] = isset($input['cache_duration']) ? absint($input['cache_duration']) : 3600;
        $sanitized['minify_css'] = isset($input['minify_css']) ? (bool) $input['minify_css'] : false;
        $sanitized['minify_js'] = isset($input['minify_js']) ? (bool) $input['minify_js'] : false;
        $sanitized['load_priority'] = isset($input['load_priority']) ? absint($input['load_priority']) : 10;
        
        // Exclusion arrays
        $sanitized['exclude_pages'] = isset($input['exclude_pages']) ? array_map('absint', (array) $input['exclude_pages']) : array();
        $sanitized['exclude_posts'] = isset($input['exclude_posts']) ? array_map('absint', (array) $input['exclude_posts']) : array();
        $sanitized['exclude_categories'] = isset($input['exclude_categories']) ? array_map('absint', (array) $input['exclude_categories']) : array();
        $sanitized['exclude_tags'] = isset($input['exclude_tags']) ? array_map('absint', (array) $input['exclude_tags']) : array();
        $sanitized['user_role_restrictions'] = isset($input['user_role_restrictions']) ? array_map('sanitize_text_field', (array) $input['user_role_restrictions']) : array();
        
        // Complex objects
        if (isset($input['device_restrictions'])) {
            $sanitized['device_restrictions'] = self::sanitize_device_restrictions($input['device_restrictions']);
        }
        
        if (isset($input['geographic_restrictions'])) {
            $sanitized['geographic_restrictions'] = self::sanitize_geographic_restrictions($input['geographic_restrictions']);
        }
        
        if (isset($input['time_restrictions'])) {
            $sanitized['time_restrictions'] = self::sanitize_time_restrictions($input['time_restrictions']);
        }
        
        if (isset($input['rate_limiting'])) {
            $sanitized['rate_limiting'] = self::sanitize_rate_limiting($input['rate_limiting']);
        }
        
        if (isset($input['security_settings'])) {
            $sanitized['security_settings'] = self::sanitize_security_settings($input['security_settings']);
        }
        
        return $sanitized;
    }
}
