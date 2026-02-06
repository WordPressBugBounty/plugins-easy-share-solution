<?php
/**
 * Plugin Name: Easy Share Solution
 * Plugin URI: https://wpthemespace.com/product/easy-share-solution/
 * Description: A share toolkit that helps you share anything. Lightweight, modern WordPress sharing plugin with 60+ platforms support
 * Version: 2.0.1
 * Author: Noor alam
 * Author URI: https://wpthemespace.com
 * License: GPL v2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: easy-share-solution
 * Domain Path: /languages
 * Requires at least: 6.0
 * Tested up to: 6.9
 * Requires PHP: 7.4
 *
 * @package EasyShareSolution
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}


// Define plugin constants
define('EASY_SHARE_VERSION', '2.0.1');
define('EASY_SHARE_PLUGIN_FILE', __FILE__);
define('EASY_SHARE_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('EASY_SHARE_PLUGIN_URL', plugin_dir_url(__FILE__));
define('EASY_SHARE_PLUGIN_BASENAME', plugin_basename(__FILE__));

// Autoloader for classes
spl_autoload_register(function ($class) {
    if (strpos($class, 'EasyShare') === 0) {
        $class_file = str_replace('_', '-', strtolower($class));
        $class_file = str_replace('easyshare', 'class-easy-share', $class_file);
        $file = EASY_SHARE_PLUGIN_DIR . 'inc/' . $class_file . '.php';
        if (file_exists($file)) {
            require_once $file;
        }
    }
});

/**
 * Main plugin class
 */
final class EasyShareSolution {
    
    /**
     * Plugin instance
     */
    private static $instance = null;
    
    /**
     * Get plugin instance
     */
    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    /**
     * Constructor
     */
    private function __construct() {
        $this->init_hooks();
    }
    
    /**
     * Initialize hooks
     */
    private function init_hooks() {
        add_action('init', array($this, 'init'));
        
        // Activation and deactivation hooks
        register_activation_hook(__FILE__, array($this, 'activate'));
        register_deactivation_hook(__FILE__, array($this, 'deactivate'));
    }
    
    /**
     * Initialize plugin
     */
    public function init() {
        // Load database management class
        require_once EASY_SHARE_PLUGIN_DIR . 'inc/class-easy-share-database.php';
        if (class_exists('EasyShare_Database')) {
            $database = new EasyShare_Database();
            // Automatically check and update database if needed (for existing users)
            $database->maybe_create_tables();
        }
        
        // Block will add Gutenberg support in future versions
        /* if (class_exists('EasyShare_Blocks')) {
            new EasyShare_Blocks();
        } */
        
        if (class_exists('EasyShare_Frontend')) {
            new EasyShare_Frontend();
        }
        
        // Load REST API (needed globally for frontend AJAX calls)
        require_once EASY_SHARE_PLUGIN_DIR . 'inc/class-easy-share-core-api.php';
        if (class_exists('EasyShare_Core_Api')) {
            new EasyShare_Core_Api();
        }
        
        // Initialize settings class first (compatibility wrapper)
        require_once EASY_SHARE_PLUGIN_DIR . 'inc/class-easy-share-settings.php';
        if (class_exists('EasyShare_Settings')) {
            new EasyShare_Settings();
        }
        
        // Load settings loader (manages all settings classes and REST API)
        $this->load_settings_loader();
        
        // Load admin classes only in admin area
        if (is_admin()) {
            if (class_exists('EasyShare_Admin')) {
                new EasyShare_Admin();
            }
            
            // Load admin notices
            require_once EASY_SHARE_PLUGIN_DIR . 'inc/class-easy-share-notices.php';
            if (class_exists('Easy_Share_Notices')) {
                new Easy_Share_Notices();
            }
            
            // Load notice utilities (for testing/debugging)
            require_once EASY_SHARE_PLUGIN_DIR . 'inc/class-easy-share-notice-utils.php';
        }
        
    }
    
    /**
     * Load settings loader class
     */
    private function load_settings_loader() {
        // Include settings loader
        $loader_file = EASY_SHARE_PLUGIN_DIR . 'inc/settings/class-settings-loader.php';
        if (file_exists($loader_file)) {
            require_once $loader_file;
            
            if (class_exists('EasyShare_Settings_Loader')) {
                new EasyShare_Settings_Loader();
            }
        }
    }
    
   
    
    /**
     * Plugin activation
     */
    public function activate() {
        // Capture any unexpected output
        ob_start();
        
        // Set default options
        $default_options = array(
            'selected_platforms' => array('facebook', 'x_com', 'linkedin', 'instagram', 'pinterest'),
            'icon_style' => 'circle',
            'show_floating_panel' => true,
            'floating_panel_position' => 'center-left',
            'floating_panel_auto_hide' => true,
            'floating_panel_front_page' => true,
            'animation_enabled' => true,
            'copy_link_enabled' => true,
            'border_radius' => 5,
            'arrangement' => 'vertical-column',
            'show_on_mobile' => true
        );
        
        add_option('easy_share_settings', $default_options);
        
        // Create necessary database tables using database class
        require_once EASY_SHARE_PLUGIN_DIR . 'inc/class-easy-share-database.php';
        if (class_exists('EasyShare_Database')) {
            $database = new EasyShare_Database();
            $database->create_tables();
        }
        
        // Flush rewrite rules
        flush_rewrite_rules();
        
        // Discard any captured output
        ob_end_clean();
    }
    
    /**
     * Plugin deactivation
     */
    public function deactivate() {
        flush_rewrite_rules();
    }
}

// Initialize the plugin
EasyShareSolution::get_instance();
