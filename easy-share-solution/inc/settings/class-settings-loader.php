<?php
/**
 * Settings Loader - Manages all settings classes and their REST API endpoints
 *
 * @package EasyShareSolution
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Class EasyShare_Settings_Loader
 */
class EasyShare_Settings_Loader {
    
    /**
     * Settings classes instances
     */
    private $settings_instances = array();
    
    /**
     * Constructor
     */
    public function __construct() {
        add_action('init', array($this, 'load_settings_classes'));
        add_action('rest_api_init', array($this, 'register_all_rest_routes'));
    }
    
    /**
     * Load all settings classes
     */
    public function load_settings_classes() {
        // Define settings files and their class names
        $settings_files = array(
            'class-general-settings.php' => 'General_Settings',
            'class-platform-settings.php' => 'Platform_Settings',
            'class-design-settings.php' => 'Design_Settings',
            'class-icon-presets-settings.php' => 'Icon_Presets_Settings',
            'class-analytics-settings.php' => 'EasyShare_Analytics_Settings',
            'class-advanced-settings.php' => 'Advanced_Settings',
        );
        
        // Include and instantiate each settings class
        foreach ($settings_files as $file => $class_name) {
            $file_path = EASY_SHARE_PLUGIN_DIR . 'inc/settings/' . $file;
            
            if (file_exists($file_path)) {
                require_once $file_path;
                
                if (class_exists($class_name)) {
                    $this->settings_instances[$class_name] = new $class_name();
                }
            }
        }
    }
    
    /**
     * Register all REST API routes from settings classes
     */
    public function register_all_rest_routes() {
        // All individual settings classes will register their own routes
        // This method ensures they all get loaded properly
        
        // Register a unified settings endpoint that combines all settings
        register_rest_route('easy-share/v1', '/settings/all', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_all_settings'),
            'permission_callback' => array($this, 'check_admin_permissions'),
        ));
        
        register_rest_route('easy-share/v1', '/settings/all', array(
            'methods' => 'POST',
            'callback' => array($this, 'update_all_settings'),
            'permission_callback' => array($this, 'check_admin_permissions'),
        ));
        
        // Reset settings endpoint
        register_rest_route('easy-share/v1', '/settings/reset', array(
            'methods' => 'POST',
            'callback' => array($this, 'reset_all_settings'),
            'permission_callback' => array($this, 'check_admin_permissions'),
        ));
        
        // Settings categories endpoint
        register_rest_route('easy-share/v1', '/settings/categories', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_settings_categories'),
            'permission_callback' => array($this, 'check_admin_permissions'),
        ));
    }
    
    /**
     * Get all settings combined
     */
    public function get_all_settings($request) {
        if (!class_exists('EasyShare_Settings')) {
            return new WP_Error('settings_not_loaded', 'Main settings class not loaded', array('status' => 500));
        }
        
        $all_settings = EasyShare_Settings::get_settings();
        
        return rest_ensure_response(array(
            'success' => true,
            'data' => $all_settings,
            'categories' => $this->get_settings_categories_data(),
        ));
    }
    
    /**
     * Update all settings
     */
    public function update_all_settings($request) {
        if (!class_exists('EasyShare_Settings')) {
            return new WP_Error('settings_not_loaded', 'Main settings class not loaded', array('status' => 500));
        }
        
        $params = $request->get_params();
        
        if (empty($params)) {
            return new WP_Error('no_params', 'No parameters provided', array('status' => 400));
        }
        
        // Sanitize and update settings
        $sanitized_settings = EasyShare_Settings::sanitize_settings($params);
        $updated = EasyShare_Settings::update_settings($sanitized_settings);
        
        if ($updated) {
            return rest_ensure_response(array(
                'success' => true,
                'message' => 'All settings updated successfully',
                'data' => $sanitized_settings,
            ));
        } else {
            return new WP_Error('update_failed', 'Failed to update settings', array('status' => 500));
        }
    }
    
    /**
     * Reset all settings to defaults
     */
    public function reset_all_settings($request) {
        if (!class_exists('EasyShare_Settings')) {
            return new WP_Error('settings_not_loaded', 'Main settings class not loaded', array('status' => 500));
        }
        
        // Delete the settings option to reset to defaults
        delete_option('easy_share_settings');
        
        // Get fresh default settings
        $default_settings = EasyShare_Settings::get_settings();
        
        if ($default_settings) {
            return rest_ensure_response(array(
                'success' => true,
                'message' => 'Settings reset to defaults successfully',
                'data' => $default_settings,
            ));
        } else {
            return new WP_Error('reset_failed', 'Failed to reset settings', array('status' => 500));
        }
    }
    
    /**
     * Get settings categories
     */
    public function get_settings_categories($request) {
        return rest_ensure_response($this->get_settings_categories_data());
    }
    
    /**
     * Get settings categories data
     */
    private function get_settings_categories_data() {
        return array(
            'general' => array(
                'name' => __('General Settings', 'easy-share-solution'),
                'description' => __('Basic plugin configuration', 'easy-share-solution'),
                'endpoint' => 'general',
                'icon' => 'admin-settings',
            ),
            'platforms' => array(
                'name' => __('Platform Selection', 'easy-share-solution'),
                'description' => __('Choose and configure social platforms', 'easy-share-solution'),
                'endpoint' => 'platforms',
                'icon' => 'share',
            ),
            'design' => array(
                'name' => __('Design Settings', 'easy-share-solution'),
                'description' => __('Customize appearance and styling', 'easy-share-solution'),
                'endpoint' => 'design',
                'icon' => 'admin-customizer',
            ),
            'presets' => array(
                'name' => __('Icon Presets', 'easy-share-solution'),
                'description' => __('Pre-designed icon styles', 'easy-share-solution'),
                'endpoint' => 'presets',
                'icon' => 'art',
            ),
            'analytics' => array(
                'name' => __('Analytics', 'easy-share-solution'),
                'description' => __('Track sharing performance', 'easy-share-solution'),
                'endpoint' => 'analytics',
                'icon' => 'chart-bar',
            ),
            'advanced' => array(
                'name' => __('Advanced Settings', 'easy-share-solution'),
                'description' => __('Advanced configuration options', 'easy-share-solution'),
                'endpoint' => 'advanced',
                'icon' => 'admin-tools',
            ),
        );
    }
    
    /**
     * Check admin permissions
     */
    public function check_admin_permissions() {
        return current_user_can('manage_options');
    }
    
    /**
     * Get loaded settings instances
     */
    public function get_settings_instances() {
        return $this->settings_instances;
    }
    
    /**
     * Check if a specific settings class is loaded
     */
    public function is_settings_class_loaded($class_name) {
        return isset($this->settings_instances[$class_name]);
    }
}
