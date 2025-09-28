<?php
/**
 * Admin panel management
 *
 * @package EasyShareSolution
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Class EasyShare_Admin
 */
class EasyShare_Admin {
    
    use Easy_Share_Platforms_Trait;
    
    /**
     * Constructor
     */
    public function __construct() {
        add_action('admin_menu', array($this, 'add_admin_menu'));
        add_action('admin_init', array($this, 'init_settings'));
        add_action('admin_enqueue_scripts', array($this, 'enqueue_admin_scripts'));
        
        // AJAX handlers
        add_action('wp_ajax_ess_save_all_design_settings', array($this, 'save_all_design_settings'));
        
        // Include required files (main settings and trait only, individual settings are loaded by settings loader)
        require_once EASY_SHARE_PLUGIN_DIR . 'inc/trait-share-platforms.php';
    }
    
    /**
     * Add admin menu
     */
    public function add_admin_menu() {
        // Add top-level menu page
        add_menu_page(
            __('Easy Share Solution', 'easy-share-solution'),
            __('Easy Share Solution', 'easy-share-solution'),
            'manage_options',
            'easy-share-solution',
            array($this, 'admin_page'),
            'dashicons-share',
            30
        );
        
        // Add submenu pages for better organization
        add_submenu_page(
            'easy-share-solution',
            __('Dashboard', 'easy-share-solution'),
            __('Dashboard', 'easy-share-solution'),
            'manage_options',
            'easy-share-solution',
            array($this, 'admin_page')
        );
    }
    
    /**
     * Initialize settings
     */
    public function init_settings() {
        register_setting(
            'easy_share_settings_group',
            'easy_share_settings',
            array($this, 'sanitize_settings')
        );
        
        add_settings_section(
            'easy_share_general_section',
            __('General Settings', 'easy-share-solution'),
            array($this, 'section_callback'),
            'easy_share_settings'
        );
        
        // Selected Platforms
        add_settings_field(
            'selected_platforms',
            __('Selected Platforms', 'easy-share-solution'),
            array($this, 'platforms_callback'),
            'easy_share_settings',
            'easy_share_general_section'
        );
        
        // Plugin Enable/Disable
        add_settings_field(
            'enabled',
            __('Enable Plugin', 'easy-share-solution'),
            array($this, 'enabled_callback'),
            'easy_share_settings',
            'easy_share_general_section'
        );
        
        // Icon Style
        add_settings_field(
            'icon_style',
            __('Icon Style', 'easy-share-solution'),
            array($this, 'icon_style_callback'),
            'easy_share_settings',
            'easy_share_general_section'
        );
        
        // Icon Size
        add_settings_field(
            'icon_size',
            __('Icon Size', 'easy-share-solution'),
            array($this, 'icon_size_callback'),
            'easy_share_settings',
            'easy_share_general_section'
        );
        
        // Floating Panel
        add_settings_field(
            'show_floating_panel',
            __('Show Floating Panel', 'easy-share-solution'),
            array($this, 'floating_panel_callback'),
            'easy_share_settings',
            'easy_share_general_section'
        );
        
        // Floating Panel Position
        add_settings_field(
            'floating_panel_position',
            __('Floating Panel Position', 'easy-share-solution'),
            array($this, 'panel_position_callback'),
            'easy_share_settings',
            'easy_share_general_section'
        );
        
        // Floating Panel Horizontal Position
        add_settings_field(
            'floating_panel_horizontal',
            __('Floating Panel Horizontal Position', 'easy-share-solution'),
            array($this, 'floating_panel_horizontal_callback'),
            'easy_share_settings',
            'easy_share_general_section'
        );
        
        // Floating Panel Vertical Position
        add_settings_field(
            'floating_panel_vertical',
            __('Floating Panel Vertical Position', 'easy-share-solution'),
            array($this, 'floating_panel_vertical_callback'),
            'easy_share_settings',
            'easy_share_general_section'
        );
        
        // Floating Panel Horizontal Offset
        add_settings_field(
            'floating_panel_offset_horizontal',
            __('Floating Panel Horizontal Offset', 'easy-share-solution'),
            array($this, 'floating_panel_offset_horizontal_callback'),
            'easy_share_settings',
            'easy_share_general_section'
        );
        
        // Floating Panel Auto Hide
        add_settings_field(
            'floating_panel_auto_hide',
            __('Floating Panel Auto Hide', 'easy-share-solution'),
            array($this, 'floating_panel_auto_hide_callback'),
            'easy_share_settings',
            'easy_share_general_section'
        );
        
        // Floating Panel Mobile
        
        // Floating Panel Icons Display
        add_settings_field(
            'floating_panel_icons_display',
            __('Floating Panel Icons Display', 'easy-share-solution'),
            array($this, 'floating_panel_icons_display_callback'),
            'easy_share_settings',
            'easy_share_general_section'
        );
        
        // Floating Panel Front Page
        add_settings_field(
            'floating_panel_front_page',
            __('Floating Panel Front Page', 'easy-share-solution'),
            array($this, 'floating_panel_front_page_callback'),
            'easy_share_settings',
            'easy_share_general_section'
        );
        
        // Floating Panel Home Page
        add_settings_field(
            'floating_panel_home_page',
            __('Floating Panel Home Page', 'easy-share-solution'),
            array($this, 'floating_panel_home_page_callback'),
            'easy_share_settings',
            'easy_share_general_section'
        );
        
        // Display Positions
        add_settings_field(
            'display_positions',
            __('Display Positions', 'easy-share-solution'),
            array($this, 'display_positions_callback'),
            'easy_share_settings',
            'easy_share_general_section'
        );
        
        // Post Types
        add_settings_field(
            'post_types',
            __('Post Types', 'easy-share-solution'),
            array($this, 'post_types_callback'),
            'easy_share_settings',
            'easy_share_general_section'
        );
        
        // Show Count
        add_settings_field(
            'show_count',
            __('Show Share Count', 'easy-share-solution'),
            array($this, 'show_count_callback'),
            'easy_share_settings',
            'easy_share_general_section'
        );
        
        // Analytics
        add_settings_field(
            'analytics_enabled',
            __('Enable Analytics', 'easy-share-solution'),
            array($this, 'analytics_callback'),
            'easy_share_settings',
            'easy_share_general_section'
        );
    }
    
    /**
     * Enqueue admin scripts
     */
    public function enqueue_admin_scripts($hook) {
        // Only load on our admin pages
        if (strpos($hook, 'easy-share-solution') === false) {
            return;
        }
        
        // Enqueue WordPress React dependencies
        wp_enqueue_script(
            'easy-share-admin-app',
            EASY_SHARE_PLUGIN_URL . 'build/admin.js',
            array('wp-element', 'wp-components', 'wp-api-fetch', 'wp-i18n', 'wp-data'),
            EASY_SHARE_VERSION,
            true
        );
        
        wp_enqueue_style(
            'easy-share-admin-style',
            EASY_SHARE_PLUGIN_URL . 'build/admin.css',
            array('wp-components'),
            EASY_SHARE_VERSION
        );
        
        // Localize script with admin data
        wp_localize_script('easy-share-admin-app', 'easyShareAdmin', array(
            'ajaxUrl' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('easy_share_admin_nonce'),
            'isPro' => $this->is_pro_active(),
            'restUrl' => rest_url('easy-share/v1/'),
            'restNonce' => wp_create_nonce('wp_rest'),
            'currentTab' => $this->get_current_tab(),
            'platforms' => $this->get_platforms_data(),
            'settings' => EasyShare_Settings::get_settings(),
            'pluginUrl' => EASY_SHARE_PLUGIN_URL
        ));
    }
    
    /**
     * Check if pro version is active
     */
    private function is_pro_active() {
        return get_option('has_easy_ss_pro', false) == true;
    }
    
    /**
     * Get current tab from URL parameter safely
     * 
     * @return string The current tab name or 'dashboard' as default
     */
    private function get_current_tab() {
        // Define allowed tabs to prevent arbitrary values
        $allowed_tabs = array(
            'dashboard',
            'general',
            'platforms', 
            'design',
            'advanced',
            'analytics',
            'icon-presets'
        );
        
        // Get and sanitize the tab parameter for navigation (not form processing)
        // Nonce verification not required for navigation GET parameters per WordPress standards
        // This is safe because: 1) Only reads data, doesn't modify anything
        // 2) Values are restricted to allowed list, 3) Properly sanitized
        $tab = '';
        if (isset($_GET['tab'])) { // phpcs:ignore WordPress.Security.NonceVerification.Recommended
            $tab = sanitize_text_field(wp_unslash($_GET['tab'])); // phpcs:ignore WordPress.Security.NonceVerification.Recommended
        }
        
        // Return the tab if it's allowed, otherwise default to dashboard
        return in_array($tab, $allowed_tabs, true) ? $tab : 'dashboard';
    }
    
    /**
     * Admin page callback
     */
    public function admin_page() {
        ?>
        <div class="wrap">
            <h1><?php echo esc_html(get_admin_page_title()); ?></h1>
            
            <!-- React App Container -->
            <div id="easy-share-admin-app" class="easy-share-admin-container">
                <!-- Loading state while React loads -->
                <div class="easy-share-loading">
                    <div class="easy-share-spinner"></div>
                    <p><?php esc_html_e('Loading Easy Share Solution...', 'easy-share-solution'); ?></p>
                </div>
            </div>
            
            <!-- Fallback content if JavaScript is disabled -->
            <noscript>
                <div class="notice notice-error">
                    <p><?php esc_html_e('Easy Share Solution admin panel requires JavaScript to function properly. Please enable JavaScript in your browser.', 'easy-share-solution'); ?></p>
                </div>
                
                <div class="easy-share-fallback">
                    <?php $this->render_fallback_form(); ?>
                </div>
            </noscript>
        </div>
        
        <style>
        .easy-share-admin-container {
            margin-top: 20px;
        }
        
        .easy-share-loading {
            text-align: center;
            padding: 60px 20px;
        }
        
        .easy-share-spinner {
            width: 40px;
            height: 40px;
            border: 4px solid #f3f3f3;
            border-top: 4px solid #0073aa;
            border-radius: 50%;
            animation: easy-share-spin 1s linear infinite;
            margin: 0 auto 20px;
        }
        
        @keyframes easy-share-spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        .easy-share-fallback {
            display: none;
        }
        
        /* Show fallback content when JavaScript is disabled */
        .no-js .easy-share-fallback {
            display: block;
        }
        
        .no-js #easy-share-admin-app {
            display: none;
        }
        </style>
        <?php
    }
    
    /**
     * Render fallback form for when JavaScript is disabled
     */
    private function render_fallback_form() {
        $settings = get_option('easy_share_settings', array());
        ?>
        <h2><?php esc_html_e('Basic Settings', 'easy-share-solution'); ?></h2>
        
        <form method="post" action="options.php">
            <?php
            settings_fields('easy_share_settings_group');
            do_settings_sections('easy_share_settings');
            ?>
            
            <table class="form-table">
                <tr>
                    <th scope="row"><?php esc_html_e('Enable Plugin', 'easy-share-solution'); ?></th>
                    <td>
                        <label>
                            <input type="checkbox" name="easy_share_settings[enabled]" value="1" <?php checked(isset($settings['enabled']) && $settings['enabled']); ?> />
                            <?php esc_html_e('Enable Easy Share Solution', 'easy-share-solution'); ?>
                        </label>
                    </td>
                </tr>
                
                <tr>
                    <th scope="row"><?php esc_html_e('Icon Style', 'easy-share-solution'); ?></th>
                    <td>
                        <select name="easy_share_settings[icon_style]">
                            <option value="circle" <?php selected(isset($settings['icon_style']) ? $settings['icon_style'] : 'circle', 'circle'); ?>><?php esc_html_e('Circle', 'easy-share-solution'); ?></option>
                            <option value="square" <?php selected(isset($settings['icon_style']) ? $settings['icon_style'] : 'circle', 'square'); ?>><?php esc_html_e('Square', 'easy-share-solution'); ?></option>
                        </select>
                    </td>
                </tr>
                
                <tr>
                    <th scope="row"><?php esc_html_e('Floating Panel Position', 'easy-share-solution'); ?></th>
                    <td>
                        <select name="easy_share_settings[floating_panel_position]">
                            <option value="left" <?php selected(isset($settings['floating_panel_position']) ? $settings['floating_panel_position'] : 'center-left', 'left'); ?>><?php esc_html_e('Left', 'easy-share-solution'); ?></option>
                            <option value="right" <?php selected(isset($settings['floating_panel_position']) ? $settings['floating_panel_position'] : 'center-left', 'right'); ?>><?php esc_html_e('Right', 'easy-share-solution'); ?></option>
                            <option value="center-left" <?php selected(isset($settings['floating_panel_position']) ? $settings['floating_panel_position'] : 'center-left', 'center-left'); ?>><?php esc_html_e('Center Left', 'easy-share-solution'); ?></option>
                            <option value="center-right" <?php selected(isset($settings['floating_panel_position']) ? $settings['floating_panel_position'] : 'center-left', 'center-right'); ?>><?php esc_html_e('Center Right', 'easy-share-solution'); ?></option>
                        </select>
                    </td>
                </tr>
            </table>
            
            <?php submit_button(); ?>
        </form>
        
        <div class="easy-share-upgrade-notice">
            <h3><?php esc_html_e('🔓 Upgrade to Pro', 'easy-share-solution'); ?></h3>
            <p><?php esc_html_e('Unlock advanced features:', 'easy-share-solution'); ?></p>
            <ul>
                <li>✅ <?php esc_html_e('Unlimited platform selection', 'easy-share-solution'); ?></li>
                <li>✅ <?php esc_html_e('Advanced analytics dashboard', 'easy-share-solution'); ?></li>
                <li>✅ <?php esc_html_e('6+ icon styles', 'easy-share-solution'); ?></li>
                <li>✅ <?php esc_html_e('Custom CSS editor', 'easy-share-solution'); ?></li>
                <li>✅ <?php esc_html_e('WooCommerce integration', 'easy-share-solution'); ?></li>
            </ul>
        </div>
        <?php
    }
    
    /**
     * Section callback
     */
    public function section_callback() {
        echo '<p>' . esc_html__('Configure your social sharing settings below.', 'easy-share-solution') . '</p>';
    }
    
    /**
     * Platforms selection callback
     */
    public function platforms_callback() {
        $settings = get_option('easy_share_settings', array());
        $selected_platforms = isset($settings['selected_platforms']) ? $settings['selected_platforms'] : array('facebook', 'x_com', 'linkedin', 'whatsapp', 'pinterest');
        $platforms = $this->get_platforms_data();
        
        echo '<div class="ess-platforms-selector">';
        echo '<p>' . esc_html__('Select up to 5 platforms (Free version). Drag to reorder.', 'easy-share-solution') . '</p>';
        
        echo '<div class="ess-selected-platforms" id="ess-selected-platforms">';
        foreach ($selected_platforms as $platform_key) {
            if (isset($platforms[$platform_key])) {
                $platform = $platforms[$platform_key];
                echo '<div class="ess-platform-item selected" data-platform="' . esc_attr($platform_key) . '">';
                echo '<span class="ess-platform-icon">' . $this->get_platform_icon($platform_key) . '</span>';
                echo '<span class="ess-platform-name">' . esc_html($platform['name']) . '</span>';
                echo '<span class="ess-remove-platform">×</span>';
                echo '<input type="hidden" name="easy_share_settings[selected_platforms][]" value="' . esc_attr($platform_key) . '">';
                echo '</div>';
            }
        }
        echo '</div>';
        
        echo '<div class="ess-available-platforms">';
        echo '<h4>' . esc_html__('Available Platforms', 'easy-share-solution') . '</h4>';
        foreach ($platforms as $platform_key => $platform) {
            if (!in_array($platform_key, $selected_platforms) && $platform_key !== 'copy-link') {
                echo '<div class="ess-platform-item available" data-platform="' . esc_attr($platform_key) . '">';
                echo '<span class="ess-platform-icon">' . $this->get_platform_icon($platform_key) . '</span>';
                echo '<span class="ess-platform-name">' . esc_html($platform['name']) . '</span>';
                echo '<span class="ess-add-platform">+</span>';
                echo '</div>';
            }
        }
        echo '</div>';
        
        echo '</div>';
    }
    
    /**
     * Icon style callback
     */
    public function icon_style_callback() {
        $settings = get_option('easy_share_settings', array());
        $icon_style = isset($settings['icon_style']) ? $settings['icon_style'] : 'circle';
        
        $styles = array(
            'circle' => __('Circle', 'easy-share-solution'),
            'square' => __('Square', 'easy-share-solution')
        );
        
        echo '<div class="ess-icon-styles">';
        foreach ($styles as $style_key => $style_name) {
            echo '<label class="ess-style-option">';
            echo '<input type="radio" name="easy_share_settings[icon_style]" value="' . esc_attr($style_key) . '" ' . checked($icon_style, $style_key, false) . '>';
            echo '<span class="ess-style-preview ess-style-' . esc_attr($style_key) . '"></span>';
            echo '<span class="ess-style-name">' . esc_html($style_name) . '</span>';
            echo '</label>';
        }
        echo '</div>';
        
        echo '<p class="description">' . esc_html__('More styles available in Pro version.', 'easy-share-solution') . '</p>';
    }
    
    /**
     * Floating panel callback
     */
    public function floating_panel_callback() {
        $settings = get_option('easy_share_settings', array());
        $show_floating_panel = isset($settings['show_floating_panel']) ? $settings['show_floating_panel'] : true;
        
        echo '<label>';
        echo '<input type="checkbox" name="easy_share_settings[show_floating_panel]" value="1" ' . checked($show_floating_panel, 1, false) . '>';
        echo ' ' . esc_html__('Enable floating share panel', 'easy-share-solution');
        echo '</label>';
        echo '<p class="description">' . esc_html__('Show a floating panel with share buttons on posts and pages.', 'easy-share-solution') . '</p>';
    }
    
    /**
     * Panel position callback
     */
    public function panel_position_callback() {
        $settings = get_option('easy_share_settings', array());
        $position = isset($settings['floating_panel_position']) ? $settings['floating_panel_position'] : 'center-left';
        
        $positions = array(
            'left' => __('Left', 'easy-share-solution'),
            'right' => __('Right', 'easy-share-solution')
        );
        
        echo '<select name="easy_share_settings[floating_panel_position]">';
        foreach ($positions as $pos_key => $pos_name) {
            echo '<option value="' . esc_attr($pos_key) . '" ' . selected($position, $pos_key, false) . '>';
            echo esc_html($pos_name);
            echo '</option>';
        }
        echo '</select>';
    }
    
    /**
     * Popup display mode callback
     */
    public function popup_display_mode_callback() {
        $settings = get_option('easy_share_settings', array());
        $mode = isset($settings['popup_display_mode']) ? $settings['popup_display_mode'] : 'icons_text';
        
        $modes = array(
            'icons_only' => __('Icons Only', 'easy-share-solution'),
            'icons_text' => __('Icons with Text', 'easy-share-solution')
        );
        
        echo '<select name="easy_share_settings[popup_display_mode]">';
        foreach ($modes as $mode_key => $mode_name) {
            echo '<option value="' . esc_attr($mode_key) . '" ' . selected($mode, $mode_key, false) . '>';
            echo esc_html($mode_name);
            echo '</option>';
        }
        echo '</select>';
        echo '<p class="description">' . esc_html__('Choose how platforms are displayed in the popup.', 'easy-share-solution') . '</p>';
    }
    
    /**
     * Plugin enabled callback
     */
    public function enabled_callback() {
        $settings = get_option('easy_share_settings', array());
        $enabled = isset($settings['enabled']) ? $settings['enabled'] : true;
        
        echo '<label>';
        echo '<input type="checkbox" name="easy_share_settings[enabled]" value="1" ' . checked($enabled, true, false) . ' />';
        echo ' ' . esc_html__('Enable the Easy Share Solution plugin', 'easy-share-solution');
        echo '</label>';
    }
    
    /**
     * Icon size callback
     */
    public function icon_size_callback() {
        $settings = get_option('easy_share_settings', array());
        $icon_size = isset($settings['icon_size']) ? intval($settings['icon_size']) : 32;
        
        echo '<input type="number" name="easy_share_settings[icon_size]" value="' . esc_attr($icon_size) . '" min="16" max="64" step="4" />';
        echo '<p class="description">' . esc_html__('Icon size in pixels (16-64)', 'easy-share-solution') . '</p>';
    }
    
    /**
     * Display positions callback
     */
    public function display_positions_callback() {
        $settings = get_option('easy_share_settings', array());
        $positions = isset($settings['display_positions']) ? $settings['display_positions'] : array(
            'before_content' => false,
            'after_content' => true,
            'floating_panel' => true
        );
        
        echo '<div class="ess-display-positions">';
        
        echo '<label>';
        echo '<input type="checkbox" name="easy_share_settings[display_positions][before_content]" value="1" ' . 
             checked($positions['before_content'], true, false) . ' />';
        echo ' ' . esc_html__('Before Content', 'easy-share-solution');
        echo '</label><br>';
        
        echo '<label>';
        echo '<input type="checkbox" name="easy_share_settings[display_positions][after_content]" value="1" ' . 
             checked($positions['after_content'], true, false) . ' />';
        echo ' ' . esc_html__('After Content', 'easy-share-solution');
        echo '</label><br>';
        
        echo '<label>';
        echo '<input type="checkbox" name="easy_share_settings[display_positions][floating_panel]" value="1" ' . 
             checked($positions['floating_panel'], true, false) . ' />';
        echo ' ' . esc_html__('Floating Panel', 'easy-share-solution');
        echo '</label>';
        
        echo '</div>';
    }
    
    /**
     * Post types callback
     */
    public function post_types_callback() {
        $settings = get_option('easy_share_settings', array());
        $selected_post_types = isset($settings['post_types']) ? $settings['post_types'] : array('post', 'page');
        
        $post_types = get_post_types(array('public' => true), 'objects');
        
        echo '<div class="ess-post-types">';
        foreach ($post_types as $post_type) {
            echo '<label>';
            echo '<input type="checkbox" name="easy_share_settings[post_types][]" value="' . esc_attr($post_type->name) . '" ' .
                 checked(in_array($post_type->name, $selected_post_types), true, false) . ' />';
            echo ' ' . esc_html($post_type->label);
            echo '</label><br>';
        }
        echo '</div>';
    }
    
    /**
     * Show count callback
     */
    public function show_count_callback() {
        $settings = get_option('easy_share_settings', array());
        $show_count = isset($settings['show_count']) ? $settings['show_count'] : false;
        
        echo '<label>';
        echo '<input type="checkbox" name="easy_share_settings[show_count]" value="1" ' . checked($show_count, true, false) . ' />';
        echo ' ' . esc_html__('Show share count next to icons', 'easy-share-solution');
        echo '</label>';
    }
    
    /**
     * Analytics callback
     */
    public function analytics_callback() {
        $settings = get_option('easy_share_settings', array());
        $analytics_enabled = isset($settings['analytics_enabled']) ? $settings['analytics_enabled'] : false;
        
        echo '<label>';
        echo '<input type="checkbox" name="easy_share_settings[analytics_enabled]" value="1" ' . checked($analytics_enabled, true, false) . ' />';
        echo ' ' . esc_html__('Enable analytics tracking', 'easy-share-solution');
        echo '</label>';
        echo '<p class="description">' . esc_html__('Track share counts and analytics data', 'easy-share-solution') . '</p>';
    }
    
    /**
     * Floating Panel Horizontal Position callback
     */
    public function floating_panel_horizontal_callback() {
        $settings = get_option('easy_share_settings', array());
        $position = isset($settings['floating_panel_horizontal']) ? $settings['floating_panel_horizontal'] : 'center-left';
        
        echo '<select name="easy_share_settings[floating_panel_horizontal]">';
        echo '<option value="left" ' . selected($position, 'left', false) . '>' . esc_html__('Left Side', 'easy-share-solution') . '</option>';
        echo '<option value="right" ' . selected($position, 'right', false) . '>' . esc_html__('Right Side', 'easy-share-solution') . '</option>';
        echo '</select>';
        echo '<p class="description">' . esc_html__('Choose whether the floating panel appears on the left or right side of the screen.', 'easy-share-solution') . '</p>';
    }
    
    /**
     * Floating Panel Vertical Position callback
     */
    public function floating_panel_vertical_callback() {
        $settings = get_option('easy_share_settings', array());
        $position = isset($settings['floating_panel_vertical']) ? $settings['floating_panel_vertical'] : 'center';
        
        echo '<select name="easy_share_settings[floating_panel_vertical]">';
        echo '<option value="top" ' . selected($position, 'top', false) . '>' . esc_html__('Top', 'easy-share-solution') . '</option>';
        echo '<option value="center" ' . selected($position, 'center', false) . '>' . esc_html__('Center', 'easy-share-solution') . '</option>';
        echo '<option value="bottom" ' . selected($position, 'bottom', false) . '>' . esc_html__('Bottom', 'easy-share-solution') . '</option>';
        echo '</select>';
        echo '<p class="description">' . esc_html__('Choose the vertical alignment of the floating panel.', 'easy-share-solution') . '</p>';
    }
    
    /**
     * Floating Panel Horizontal Offset callback
     */
    public function floating_panel_offset_horizontal_callback() {
        $settings = get_option('easy_share_settings', array());
        $offset = isset($settings['floating_panel_offset_horizontal']) ? $settings['floating_panel_offset_horizontal'] : 20;
        
        echo '<input type="range" name="easy_share_settings[floating_panel_offset_horizontal]" value="' . esc_attr($offset) . '" min="0" max="100" step="5" />';
        echo '<span class="range-value">' . esc_html($offset) . 'px</span>';
        echo '<p class="description">' . esc_html__('Adjust the distance from the left/right edge of the screen (in pixels).', 'easy-share-solution') . '</p>';
    }
    
    /**
     * Floating Panel Auto Hide callback
     */
    public function floating_panel_auto_hide_callback() {
        $settings = get_option('easy_share_settings', array());
        $auto_hide = isset($settings['floating_panel_auto_hide']) ? $settings['floating_panel_auto_hide'] : true;
        
        echo '<label>';
        echo '<input type="checkbox" name="easy_share_settings[floating_panel_auto_hide]" value="1" ' . checked($auto_hide, true, false) . ' />';
        echo ' ' . esc_html__('Hide the floating panel when users scroll up', 'easy-share-solution');
        echo '</label>';
        echo '<p class="description">' . esc_html__('Automatically hide the panel when scrolling up to save screen space.', 'easy-share-solution') . '</p>';
    }
    
    /**
     * Floating Panel Icons Display callback
     */
    public function floating_panel_icons_display_callback() {
        $settings = get_option('easy_share_settings', array());
        $display = isset($settings['floating_panel_icons_display']) ? $settings['floating_panel_icons_display'] : 'expand';
        
        echo '<select name="easy_share_settings[floating_panel_icons_display]">';
        echo '<option value="expand" ' . selected($display, 'expand', false) . '>' . esc_html__('Expand (Always Visible)', 'easy-share-solution') . '</option>';
        echo '<option value="fold" ' . selected($display, 'fold', false) . '>' . esc_html__('Fold (Click to Expand)', 'easy-share-solution') . '</option>';
        echo '</select>';
        echo '<p class="description">' . esc_html__('Choose how the social media icons are displayed in the floating panel.', 'easy-share-solution') . '</p>';
    }
    
    /**
     * Floating Panel Front Page callback
     */
    public function floating_panel_front_page_callback() {
        $settings = get_option('easy_share_settings', array());
        $front_page = isset($settings['floating_panel_front_page']) ? $settings['floating_panel_front_page'] : true;
        
        echo '<label>';
        echo '<input type="checkbox" name="easy_share_settings[floating_panel_front_page]" value="1" ' . checked($front_page, true, false) . ' />';
        echo ' ' . esc_html__('Show floating panel on front page', 'easy-share-solution');
        echo '</label>';
        echo '<p class="description">' . esc_html__('Display the floating panel on your site\'s front page.', 'easy-share-solution') . '</p>';
    }
    
    /**
     * Floating Panel Home Page callback
     */
    public function floating_panel_home_page_callback() {
        $settings = get_option('easy_share_settings', array());
        $home_page = isset($settings['floating_panel_home_page']) ? $settings['floating_panel_home_page'] : false;
        
        echo '<label>';
        echo '<input type="checkbox" name="easy_share_settings[floating_panel_home_page]" value="1" ' . checked($home_page, true, false) . ' />';
        echo ' ' . esc_html__('Show floating panel on home page', 'easy-share-solution');
        echo '</label>';
        echo '<p class="description">' . esc_html__('Display the floating panel on your blog\'s home page (posts page).', 'easy-share-solution') . '</p>';
    }
    
    /**
     * Sanitize settings
     */
    public function sanitize_settings($input) {
        $sanitized = array();
        
        // Plugin enabled
        $sanitized['enabled'] = isset($input['enabled']) ? (bool) $input['enabled'] : true;
        
        // Sanitize selected platforms
        if (isset($input['selected_platforms']) && is_array($input['selected_platforms'])) {
            $sanitized['selected_platforms'] = array_slice(array_map('sanitize_text_field', $input['selected_platforms']), 0, 10);
        } else {
            $sanitized['selected_platforms'] = array('facebook', 'x_com', 'linkedin', 'whatsapp', 'pinterest');
        }
        
        // Sanitize icon style
        $allowed_styles = array('circle', 'square');
        $sanitized['icon_style'] = isset($input['icon_style']) && in_array($input['icon_style'], $allowed_styles) ? 
            $input['icon_style'] : 'circle';
        
        // Sanitize icon size
        $sanitized['icon_size'] = isset($input['icon_size']) ? absint($input['icon_size']) : 32;
        if ($sanitized['icon_size'] < 16) $sanitized['icon_size'] = 16;
        if ($sanitized['icon_size'] > 64) $sanitized['icon_size'] = 64;
        
        // Sanitize floating panel
        $sanitized['show_floating_panel'] = isset($input['show_floating_panel']) ? (bool) $input['show_floating_panel'] : false;
        
        // Sanitize panel position
        $allowed_positions = array('left', 'right', 'center-left', 'center-right', 'top-left', 'top-right', 'bottom-left', 'bottom-right');
        $sanitized['floating_panel_position'] = isset($input['floating_panel_position']) && in_array($input['floating_panel_position'], $allowed_positions) ? 
            $input['floating_panel_position'] : 'center-left';
            
        // Sanitize floating panel horizontal position
        $allowed_horizontal = array('left', 'right');
        $sanitized['floating_panel_horizontal'] = isset($input['floating_panel_horizontal']) && in_array($input['floating_panel_horizontal'], $allowed_horizontal) ? 
            $input['floating_panel_horizontal'] : 'center-left';
            
        // Sanitize floating panel vertical position
        $allowed_vertical = array('top', 'center', 'bottom');
        $sanitized['floating_panel_vertical'] = isset($input['floating_panel_vertical']) && in_array($input['floating_panel_vertical'], $allowed_vertical) ? 
            $input['floating_panel_vertical'] : 'center';
            
        // Sanitize floating panel horizontal offset
        $sanitized['floating_panel_offset_horizontal'] = isset($input['floating_panel_offset_horizontal']) ? absint($input['floating_panel_offset_horizontal']) : 20;
        if ($sanitized['floating_panel_offset_horizontal'] < 0) $sanitized['floating_panel_offset_horizontal'] = 0;
        if ($sanitized['floating_panel_offset_horizontal'] > 100) $sanitized['floating_panel_offset_horizontal'] = 100;
        
        // Sanitize floating panel auto hide
        $sanitized['floating_panel_auto_hide'] = isset($input['floating_panel_auto_hide']) ? (bool) $input['floating_panel_auto_hide'] : true;
        
        // Sanitize floating panel icons display
        $allowed_icons_display = array('expand', 'fold');
        $sanitized['floating_panel_icons_display'] = isset($input['floating_panel_icons_display']) && in_array($input['floating_panel_icons_display'], $allowed_icons_display) ? 
            $input['floating_panel_icons_display'] : 'expand';
        
        // Sanitize floating panel front page
        $sanitized['floating_panel_front_page'] = isset($input['floating_panel_front_page']) ? (bool) $input['floating_panel_front_page'] : true;
        
        // Sanitize floating panel home page
        $sanitized['floating_panel_home_page'] = isset($input['floating_panel_home_page']) ? (bool) $input['floating_panel_home_page'] : false;
        
        // Sanitize display positions
        $sanitized['display_positions'] = array(
            'before_content' => isset($input['display_positions']['before_content']) ? (bool) $input['display_positions']['before_content'] : false,
            'after_content' => isset($input['display_positions']['after_content']) ? (bool) $input['display_positions']['after_content'] : false,
            'floating_panel' => isset($input['display_positions']['floating_panel']) ? (bool) $input['display_positions']['floating_panel'] : false
        );
        
        // Sanitize post types
        if (isset($input['post_types']) && is_array($input['post_types'])) {
            $all_post_types = array_keys(get_post_types(array('public' => true)));
            $sanitized['post_types'] = array_intersect($input['post_types'], $all_post_types);
        } else {
            $sanitized['post_types'] = array('post', 'page');
        }
        
        // Show count
        $sanitized['show_count'] = isset($input['show_count']) ? (bool) $input['show_count'] : false;
        
        // Sanitize colors
        $sanitized['colors'] = array(
            'primary' => isset($input['colors']['primary']) ? sanitize_hex_color($input['colors']['primary']) : '#007cba',
            'secondary' => isset($input['colors']['secondary']) ? sanitize_hex_color($input['colors']['secondary']) : '#f1f1f1',
            'text' => isset($input['colors']['text']) ? sanitize_hex_color($input['colors']['text']) : '#000000'
        );
        
        // Sanitize custom CSS
        $sanitized['custom_css'] = isset($input['custom_css']) ? wp_strip_all_tags($input['custom_css']) : '';
        
        // Analytics enabled
        $sanitized['analytics_enabled'] = isset($input['analytics_enabled']) ? (bool) $input['analytics_enabled'] : false;
        
        // Popup display mode (keep for backward compatibility)
        $allowed_modes = array('icons_only', 'icons_text');
        $sanitized['popup_display_mode'] = isset($input['popup_display_mode']) && in_array($input['popup_display_mode'], $allowed_modes) ? 
            $input['popup_display_mode'] : 'icons_text';
        
        return $sanitized;
    }
    
    /**
     * Render preview
     */
    private function render_preview($settings) {
        $platforms = isset($settings['selected_platforms']) ? $settings['selected_platforms'] : array('facebook', 'x_com', 'linkedin', 'whatsapp', 'pinterest');
        $icon_style = isset($settings['icon_style']) ? $settings['icon_style'] : 'circle';
        
        ob_start();
        ?>
        <div class="ess-preview-share-block ess-style-<?php echo esc_attr($icon_style); ?>">
            <?php foreach ($platforms as $platform): ?>
                <?php $platform_data = $this->get_platform_data($platform); ?>
                <?php if ($platform_data): ?>
                    <span class="ess-preview-button ess-platform-<?php echo esc_attr($platform); ?>" 
                          style="--platform-color: <?php echo esc_attr($platform_data['color']); ?>">
                        <?php echo $this->get_platform_icon($platform); ?>
                    </span>
                <?php endif; ?>
            <?php endforeach; ?>
            <span class="ess-preview-button ess-platform-copy-link">
                <?php echo $this->get_platform_icon('copy-link'); ?>
            </span>
        </div>
        <?php
        return ob_get_clean();
    }
    
    /**
     * Save all design settings via AJAX
     */
    public function save_all_design_settings() {
        // Verify nonce
        $nonce = isset($_POST['nonce']) ? sanitize_text_field(wp_unslash($_POST['nonce'])) : '';
        if (!wp_verify_nonce($nonce, 'ess_admin_nonce')) {
            wp_die(esc_html__('Security check failed', 'easy-share-solution'));
        }
        
        // Check user permissions
        if (!current_user_can('manage_options')) {
            wp_die(esc_html__('Insufficient permissions', 'easy-share-solution'));
        }
        
        // Get and validate settings array
        $raw_settings = isset($_POST['settings']) ? wp_unslash($_POST['settings']) : array();
        $settings = is_array($raw_settings) ? $raw_settings : array();
        
        if (empty($settings)) {
            wp_send_json_error(esc_html__('No settings to save', 'easy-share-solution'));
            return;
        }
        
        // Get current settings
        $current_settings = get_option('easy_share_settings', array());
        
        // Merge with new settings
        foreach ($settings as $key => $value) {
            // Sanitize based on field type
            if (is_bool($value) || $value === 'true' || $value === 'false') {
                $current_settings[$key] = (bool) $value;
            } elseif (is_numeric($value)) {
                $current_settings[$key] = (float) $value;
            } else {
                $current_settings[$key] = sanitize_text_field($value);
            }
        }
        
        // Save settings
        $updated = update_option('easy_share_settings', $current_settings);
        
        if ($updated) {
            wp_send_json_success(__('Settings saved successfully', 'easy-share-solution'));
        } else {
            wp_send_json_error(__('Failed to save settings', 'easy-share-solution'));
        }
    }
}
