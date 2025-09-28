<?php
/**
 * Easy Share Solution Notices
 * Handles admin notices for updates and Pro upgrades
 */

if (!defined('ABSPATH')) {
    exit;
}

class Easy_Share_Notices {
    
    /**
     * Notice types and their settings
     */
    const NOTICES = [
        'update' => [
            'key' => 'ess_update_notice_dismissed1',
            'priority' => 1,
            'type' => 'info',
            'icon' => '🚀',
            'title' => 'Major Update Available!',
            'message' => 'Exciting news! A huge update is waiting for you featuring a completely modern dashboard, advanced analytics, and powerful new sharing options. Experience the next level of social sharing!',
            'button_text' => 'Explore New Dashboard',
            'button_url' => 'admin.php?page=easy-share-solution',
            'button_class' => 'button-primary'
        ],
        'pro_upgrade' => [
            'key' => 'ess_pro_notice_dismissed1',
            'priority' => 2,
            'type' => 'success',
            'icon' => '⚡',
            'title' => 'Early Bird Special - Limited Time!',
            'message' => 'Unlock the full power of Easy Share Solution Pro! Get advanced analytics, premium designs, and exclusive features. <strong>Special launch price: Only $19</strong> (regular $49) - Limited to first 100 customers!',
            'button_text' => 'Get Pro Now - Only $19!',
            'button_url' => 'https://wpthemespace.com/product/easy-share-solution/#pricing',
            'button_class' => 'button-primary ess-pro-button',
            'countdown' => true
        ]
    ];

    /**
     * Get translatable notice data
     */
    private function get_notice_data($notice_key) {
        $notices = [
            'update' => [
                'key' => 'ess_update_notice_dismissed1',
                'priority' => 1,
                'type' => 'info',
                'icon' => '🚀',
                'title' => __('Major Update Available!', 'easy-share-solution'),
                'message' => __('Exciting news! A huge update is waiting for you featuring a completely modern dashboard, advanced analytics, and powerful new sharing options. Experience the next level of social sharing!', 'easy-share-solution'),
                'button_text' => __('Explore New Dashboard', 'easy-share-solution'),
                'button_url' => admin_url('admin.php?page=easy-share-solution'),
                'button_class' => 'button-primary',
                'secondary_button_text' => __('View Analytics', 'easy-share-solution'),
                'secondary_button_url' => admin_url('admin.php?page=easy-share-solution&tab=analytics')
            ],
            'pro_upgrade' => [
                'key' => 'ess_pro_notice_dismissed1',
                'priority' => 2,
                'type' => 'success',
                'icon' => '⚡',
                'title' => __('Early Bird Special - Limited Time!', 'easy-share-solution'),
                'message' => __('Unlock the full power of Easy Share Solution Pro! Get advanced analytics, premium designs, and exclusive features. <strong>Special launch price: Only $19</strong> (regular $49) - Limited to first 100 customers!', 'easy-share-solution'),
                'button_text' => __('Get Pro Now - Only $19!', 'easy-share-solution'),
                'button_url' => 'https://wpthemespace.com/product/easy-share-solution/#pricing',
                'button_class' => 'button-primary ess-pro-button',
                'maybe_later_text' => __('Maybe Later', 'easy-share-solution'),
                'price_info' => [
                    'old_price' => '$49',
                    'new_price' => '$19',
                    'discount' => __('61% OFF', 'easy-share-solution'),
                    'limited_text' => __('⏰ Limited to first 100 customers only!', 'easy-share-solution')
                ],
                'countdown' => true
            ]
        ];

        return isset($notices[$notice_key]) ? $notices[$notice_key] : null;
    }

    /**
     * Initialize the notices
     */
    public function __construct() {
// Check if pro license is valid
        

        add_action('admin_notices', [$this, 'display_notices']);
        add_action('wp_ajax_ess_dismiss_notice', [$this, 'dismiss_notice']);
        add_action('admin_enqueue_scripts', [$this, 'enqueue_notice_scripts']);
    }

    /**
     * Display admin notices
     */
    public function display_notices() {
        // Only show on Easy Share Solution pages and dashboard
        $current_screen = get_current_screen();
        if (!$this->should_show_notices($current_screen)) {
            return;
        }

        $notices_to_show = $this->get_notices_to_show();
        
        foreach ($notices_to_show as $notice_key => $notice) {
            $this->render_notice($notice_key, $notice);
        }
    }

    /**
     * Check if notices should be shown on current page
     */
    private function should_show_notices($current_screen) {
        if (!$current_screen) {
            return false;
        }

        $allowed_pages = [
            'dashboard',
            'plugins',
            'toplevel_page_easy-share-solution',
            'easy-share-solution_page_easy-share-analytics'
        ];

        return in_array($current_screen->id, $allowed_pages) || 
               strpos($current_screen->id, 'easy-share') !== false;
    }

    /**
     * Get notices that should be displayed
     */
    private function get_notices_to_show() {
        $notices_to_show = [];

        // Show all notices that are not dismissed
        foreach (array_keys(self::NOTICES) as $notice_key) {
            // Skip pro upgrade notice if Pro version is already active
            if ($notice_key === 'pro_upgrade' && $this->is_pro_active()) {
                continue;
            }
            
            $notice_data = $this->get_notice_data($notice_key);
            if ($notice_data && !get_option($notice_data['key'], false)) {
                $notices_to_show[$notice_key] = $notice_data;
            }
        }

        return $notices_to_show;
    }

    /**
     * Render a notice
     */
    private function render_notice($notice_key, $notice) {
        // Create nonce for this specific notice
        $nonce = wp_create_nonce('ess_dismiss_notice_' . sanitize_key($notice_key));
        
        // Validate notice key
        if (!in_array($notice_key, array_keys(self::NOTICES))) {
            return;
        }
        
        ?>
        <div class="notice notice-<?php echo esc_attr($notice['type']); ?> ess-notice ess-notice-<?php echo esc_attr($notice_key); ?>" 
             data-notice="<?php echo esc_attr($notice_key); ?>" 
             data-nonce="<?php echo esc_attr($nonce); ?>"
             role="alert">
            
            <div class="ess-notice-content">
                <div class="ess-notice-header">
                    <div class="ess-notice-icon" aria-hidden="true">
                        <?php echo wp_kses_post($notice['icon']); ?>
                    </div>
                    
                    <div class="ess-notice-text">
                        <h3 class="ess-notice-title">
                            <?php echo esc_html($notice['title']); ?>
                        </h3>
                        <p class="ess-notice-message">
                            <?php echo wp_kses_post($notice['message']); ?>
                        </p>
                        
                        <?php if ($notice_key === 'pro_upgrade' && isset($notice['price_info'])): ?>
                            <div class="ess-early-bird-info">
                                <span class="ess-price-badge">
                                    <span class="ess-old-price"><?php echo esc_html($notice['price_info']['old_price']); ?></span>
                                    <span class="ess-new-price"><?php echo esc_html($notice['price_info']['new_price']); ?></span>
                                    <span class="ess-discount"><?php echo esc_html($notice['price_info']['discount']); ?></span>
                                </span>
                                <span class="ess-limited-text"><?php echo esc_html($notice['price_info']['limited_text']); ?></span>
                            </div>
                        <?php endif; ?>
                    </div>
                    
                    <?php if ($notice_key !== 'pro_upgrade'): ?>
                        <button type="button" class="notice-dismiss ess-dismiss-notice" 
                                aria-label="<?php esc_attr_e('Dismiss this notice', 'easy-share-solution'); ?>">
                            <span class="screen-reader-text"><?php esc_html_e('Dismiss this notice', 'easy-share-solution'); ?></span>
                        </button>
                    <?php endif; ?>
                </div>
                
                <div class="ess-notice-actions">
                    <a href="<?php echo esc_url($notice['button_url']); ?>" 
                       class="button <?php echo esc_attr($notice['button_class']); ?>" 
                       <?php echo strpos($notice['button_url'], 'http') === 0 ? 'target="_blank" rel="noopener noreferrer"' : ''; ?>>
                        <?php echo esc_html($notice['button_text']); ?>
                    </a>
                    
                    <?php if ($notice_key === 'update' && isset($notice['secondary_button_text'])): ?>
                        <a href="<?php echo esc_url($notice['secondary_button_url']); ?>" 
                           class="button button-secondary">
                            <?php echo esc_html($notice['secondary_button_text']); ?>
                        </a>
                    <?php endif; ?>
                    
                    <?php if ($notice_key === 'pro_upgrade'): ?>
                        <button type="button" class="button button-secondary ess-maybe-later" 
                                data-notice="<?php echo esc_attr($notice_key); ?>" 
                                data-nonce="<?php echo esc_attr($nonce); ?>">
                            <?php echo esc_html($notice['maybe_later_text']); ?>
                        </button>
                    <?php endif; ?>
                </div>
            </div>
        </div>
        <?php
    }

    /**
     * Handle AJAX notice dismissal
     */
    public function dismiss_notice() {
        // Check if user has permission
        if (!current_user_can('manage_options')) {
            wp_die(
                esc_html__('You do not have permission to perform this action.', 'easy-share-solution'),
                esc_html__('Permission Denied', 'easy-share-solution'),
                ['response' => 403]
            );
        }

        // Sanitize and validate input
        $notice_key = isset($_POST['notice']) ? sanitize_key($_POST['notice']) : '';
        $nonce = isset($_POST['nonce']) ? sanitize_text_field($_POST['nonce']) : '';
        
        // Verify nonce
        if (!wp_verify_nonce($nonce, 'ess_dismiss_notice_' . $notice_key)) {
            wp_die(
                esc_html__('Security check failed. Please refresh the page and try again.', 'easy-share-solution'),
                esc_html__('Security Error', 'easy-share-solution'),
                ['response' => 403]
            );
        }

        // Verify notice exists
        if (!in_array($notice_key, array_keys(self::NOTICES))) {
            wp_die(
                esc_html__('Invalid notice type.', 'easy-share-solution'),
                esc_html__('Invalid Request', 'easy-share-solution'),
                ['response' => 400]
            );
        }

        // Get notice data using the translatable method
        $notice_data = $this->get_notice_data($notice_key);
        if (!$notice_data) {
            wp_die(
                esc_html__('Notice not found.', 'easy-share-solution'),
                esc_html__('Not Found', 'easy-share-solution'),
                ['response' => 404]
            );
        }

        // Mark notice as dismissed
        $dismiss_key = sanitize_key($notice_data['key']);
        $result = update_option($dismiss_key, true);

        if ($result !== false) {
            wp_send_json_success([
                'message' => esc_html__('Notice dismissed successfully.', 'easy-share-solution'),
                'notice' => $notice_key
            ]);
        } else {
            wp_send_json_error([
                'message' => esc_html__('Failed to dismiss notice. Please try again.', 'easy-share-solution')
            ]);
        }
    }

    /**
     * Enqueue notice scripts and styles
     */
    public function enqueue_notice_scripts($hook) {
        if (!$this->should_show_notices(get_current_screen())) {
            return;
        }

        // Enqueue notice styles
        wp_enqueue_style(
            'ess-admin-notices',
            plugin_dir_url(dirname(__FILE__)) . 'assets/css/admin-notices.css',
            [],
            '1.0.0'
        );
        
        // Enqueue notice scripts
        wp_enqueue_script(
            'ess-admin-notices',
            plugin_dir_url(dirname(__FILE__)) . 'assets/js/admin-notices.js',
            ['jquery'],
            '1.0.0',
            true
        );
    }

    /**
     * Reset all notices (for testing purposes)
     * Only allow this in development environment
     */
    public static function reset_notices() {
        // Only allow in development or if WP_DEBUG is true
        if (!defined('WP_DEBUG') || !WP_DEBUG) {
            return false;
        }

        // Check user permissions
        if (!current_user_can('manage_options')) {
            return false;
        }

        $reset_count = 0;
        foreach (self::NOTICES as $notice_key => $notice_config) {
            $instance = new self();
            $notice_data = $instance->get_notice_data($notice_key);
            if ($notice_data && isset($notice_data['key'])) {
                $deleted = delete_option(sanitize_key($notice_data['key']));
                if ($deleted) {
                    $reset_count++;
                }
            }
        }

        return $reset_count;
    }

    /**
     * Check if Pro version is active
     */
    private function is_pro_active() {
        return get_option('has_easy_ss_pro', false) == true;
    }
}
