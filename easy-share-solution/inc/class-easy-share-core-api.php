<?php
/**
 * Core REST API endpoints (non-settings)
 *
 * @package EasyShareSolution
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Class EasyShare_Core_Api
 * Handles non-settings REST API endpoints like platforms, analytics, and tracking
 */
class EasyShare_Core_Api {
    
    use Easy_Share_Platforms_Trait;
    
    /**
     * Constructor
     */
    public function __construct() {
        add_action('rest_api_init', array($this, 'register_routes'));
        
        // Include trait file
        require_once EASY_SHARE_PLUGIN_DIR . 'inc/trait-share-platforms.php';
    }
    
    /**
     * Register REST API routes
     */
    public function register_routes() {
        // Platforms endpoint
        register_rest_route('easy-share/v1', '/platforms', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_platforms'),
            'permission_callback' => '__return_true'
        ));
        
        // Pro status endpoint
        register_rest_route('easy-share/v1', '/pro-status', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_pro_status'),
            'permission_callback' => array($this, 'check_admin_permissions')
        ));

        // System info endpoint (fallback for advanced settings)
        register_rest_route('easy-share/v1', '/advanced/system-info', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_system_info'),
            'permission_callback' => array($this, 'check_admin_permissions')
        ));

        // Analytics endpoints
        register_rest_route('easy-share/v1', '/analytics/overview', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_analytics_overview'),
            'permission_callback' => array($this, 'check_admin_permissions_with_nonce'),
            'args' => array(
                'period' => array(
                    'description' => 'Time period for analytics',
                    'type' => 'string',
                    'enum' => array('1', '7', '30', '90'),
                    'default' => '30',
                    'sanitize_callback' => 'sanitize_text_field'
                )
            )
        ));

        register_rest_route('easy-share/v1', '/analytics/platform-stats', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_platform_stats'),
            'permission_callback' => array($this, 'check_admin_permissions_with_nonce'),
            'args' => array(
                'period' => array(
                    'description' => 'Time period for platform stats',
                    'type' => 'string',
                    'enum' => array('1', '7', '30', '90'),
                    'default' => '30',
                    'sanitize_callback' => 'sanitize_text_field'
                )
            )
        ));

        register_rest_route('easy-share/v1', '/analytics/content-stats', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_content_stats'),
            'permission_callback' => array($this, 'check_admin_permissions_with_nonce'),
            'args' => array(
                'period' => array(
                    'description' => 'Time period for content stats',
                    'type' => 'string',
                    'enum' => array('1', '7', '30', '90'),
                    'default' => '30',
                    'sanitize_callback' => 'sanitize_text_field'
                )
            )
        ));

        register_rest_route('easy-share/v1', '/analytics/daily-stats', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_daily_stats'),
            'permission_callback' => array($this, 'check_admin_permissions_with_nonce'),
            'args' => array(
                'period' => array(
                    'description' => 'Time period for daily stats',
                    'type' => 'string',
                    'enum' => array('1', '7', '30', '90'),
                    'default' => '30',
                    'sanitize_callback' => 'sanitize_text_field'
                )
            )
        ));

        // Track endpoint for frontend share tracking with rate limiting
        register_rest_route('easy-share/v1', '/track', array(
            'methods' => 'POST',
            'callback' => array($this, 'track_share'),
            'permission_callback' => array($this, 'check_track_permissions'),
            'args' => array(
                'platform' => array(
                    'description' => 'Social platform name',
                    'type' => 'string',
                    'required' => true,
                    'sanitize_callback' => 'sanitize_text_field'
                ),
                'post_id' => array(
                    'description' => 'WordPress post ID',
                    'type' => 'integer',
                    'required' => true,
                    'sanitize_callback' => 'absint'
                ),
                'url' => array(
                    'description' => 'URL being shared',
                    'type' => 'string',
                    'sanitize_callback' => 'esc_url_raw'
                )
            )
        ));

        // Settings import endpoint (for bulk import from file)
        register_rest_route('easy-share/v1', '/settings/import', array(
            'methods' => 'POST',
            'callback' => array($this, 'import_settings'),
            'permission_callback' => array($this, 'check_admin_permissions_with_nonce'),
            'args' => array(
                'settings' => array(
                    'description' => 'Settings data to import',
                    'type' => 'object',
                    'required' => true
                )
            )
        ));
    }

    /**
     * Get platforms data
     */
    public function get_platforms($request) {
        $platforms = $this->get_platforms_data();
        
        return rest_ensure_response(array(
            'success' => true,
            'data' => array(
                'platforms' => $platforms
            )
        ));
    }
    
    /**
     * Get pro status
     */
    public function get_pro_status($request) {
        $is_pro = get_option('has_easy_ss_pro', false) == true;
        
        return rest_ensure_response(array(
            'is_pro' => $is_pro,
            'version' => $is_pro ? 'pro' : 'free',
            'upgrade_url' => 'https://wpthemespace.com/product/easy-share-solution/#pricing',
            'features' => array(
                // Analytics features
                'analytics' => $is_pro,
                'full_analytics' => $is_pro,
                
                // General Settings features
                'show_share_count' => $is_pro,
                'custom_post_types' => $is_pro,
                
                // Design Settings features
                'staggered_animation' => $is_pro,
                'continuous_animation' => $is_pro,
                'grid_2x2_layout' => $is_pro,
                'grid_3x2_layout' => $is_pro,
                'circular_layout' => $is_pro,
                'auto_hide_panel' => $is_pro,
                'popup_style_presets' => $is_pro,
                'design_presets' => $is_pro,
                
                // Platform Selection features
                'platform_drag_sort' => $is_pro,
                'qr_code_button' => $is_pro,
                'print_button' => $is_pro,
                
                // Advanced Settings
                'advanced_settings' => $is_pro,
                'custom_css' => $is_pro,
                'unlimited_platforms' => $is_pro
            )
        ));
    }
    
    /**
     * Get system information
     */
    public function get_system_info($request) {
        global $wp_version;
        
        $active_plugins = apply_filters('active_plugins', get_option('active_plugins'));
        
        return rest_ensure_response(array(
            'wordpress_version' => $wp_version,
            'php_version' => PHP_VERSION,
            'plugin_version' => defined('EASY_SHARE_VERSION') ? EASY_SHARE_VERSION : '2.0.0',
            'active_plugins' => $active_plugins,
            'memory_limit' => ini_get('memory_limit'),
            'max_execution_time' => ini_get('max_execution_time'),
            'upload_max_filesize' => ini_get('upload_max_filesize'),
            'post_max_size' => ini_get('post_max_size')
        ));
    }
    
    /**
     * Track share action
     */
    public function track_share($request) {
        $platform = $request->get_param('platform');
        $post_id = $request->get_param('post_id');
        $url = $request->get_param('url');
        
        if (!$platform || !$post_id) {
            return new WP_Error('missing_data', 'Platform and post ID are required', array('status' => 400));
        }
        
        // Verify post exists
        if (!get_post($post_id)) {
            return new WP_Error('invalid_post', 'Post not found', array('status' => 404));
        }
        
        // Basic tracking - increment share count
        $current_count = get_post_meta($post_id, '_easy_share_count_' . $platform, true);
        $new_count = intval($current_count) + 1;
        update_post_meta($post_id, '_easy_share_count_' . $platform, $new_count);
        
        // Track total shares
        $total_shares = get_post_meta($post_id, '_easy_share_total', true);
        $new_total = intval($total_shares) + 1;
        update_post_meta($post_id, '_easy_share_total', $new_total);
        
        // Track timestamp
        update_post_meta($post_id, '_easy_share_last_' . $platform, current_time('mysql'));
        
        // Save to analytics database
        $this->save_share_analytics($platform, $post_id, $url);
        
        // Advanced analytics for pro (placeholder)
        if ($this->is_pro_active()) {
            $this->track_advanced_analytics($platform, $post_id, $url);
        }
        
        return rest_ensure_response(array(
            'success' => true,
            'data' => array(
                'platform' => $platform,
                'count' => $new_count,
                'total' => $new_total,
                'post_id' => $post_id
            )
        ));
    }
    
    /**
     * Get analytics overview data
     */
    public function get_analytics_overview($request = null) {
        global $wpdb;
        
        // Validate and sanitize period parameter
        $period = $request ? $request->get_param('period') : '30';
        $period = sanitize_text_field($period);
        $allowed_periods = array('1', '7', '30', '90');
        if (!in_array($period, $allowed_periods)) {
            $period = '30';
        }
        
        // Check if Pro is active - return test data for free users
        if (!$this->is_pro_active()) {
            return $this->get_test_analytics_overview($period);
        }
        
        try {
            // Use proper table name
            $table_name = $wpdb->prefix . 'easy_share_analytics';
            
            // Calculate date range
            $days_ago = absint($period);
            $start_date = gmdate('Y-m-d', strtotime("-{$days_ago} days"));
            
            // Check if table exists with caching
            $cache_key = 'easy_share_table_exists_' . md5($table_name);
            $table_exists = wp_cache_get($cache_key, 'easy_share');
            
            if (false === $table_exists) {
                $table_exists = $wpdb->get_var($wpdb->prepare( // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery
                    "SHOW TABLES LIKE %s",
                    $table_name
                )) === $table_name;
                
                // Cache for 1 hour
                wp_cache_set($cache_key, $table_exists, 'easy_share', HOUR_IN_SECONDS);
            }
            
            if (!$table_exists) {
                // Return empty data when table doesn't exist
                return rest_ensure_response(array(
                    'total_shares' => 0,
                    'unique_posts' => 0,
                    'growth_percentage' => 0,
                    'top_platforms' => array(),
                    'period' => $period,
                    'is_test_data' => false,
                    'data_source' => 'database'
                ));
            }
            
            // Check for database connection errors
            if (!empty($wpdb->last_error)) {
                return rest_ensure_response(array(
                    'total_shares' => 0,
                    'unique_posts' => 0,
                    'growth_percentage' => 0,
                    'top_platforms' => array(),
                    'period' => $period,
                    'is_test_data' => false,
                    'data_source' => 'database'
                ));
            }
            
            // Get real data from database with error checking and caching
            $total_shares_cache_key = 'easy_share_total_shares_' . md5($start_date);
            $total_shares = wp_cache_get($total_shares_cache_key, 'easy_share');
            
            if (false === $total_shares) {
                $total_shares = $wpdb->get_var($wpdb->prepare( // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching
                    "SELECT COUNT(*) FROM `{$wpdb->prefix}easy_share_analytics` WHERE DATE(share_timestamp) >= %s",
                    $start_date
                ));
                
                if (!empty($wpdb->last_error)) {
                    $total_shares = 0;
                }
                
                // Cache for 5 minutes
                wp_cache_set($total_shares_cache_key, $total_shares, 'easy_share', 300);
            }
            
            $unique_posts_cache_key = 'easy_share_unique_posts_' . md5($start_date);
            $unique_posts = wp_cache_get($unique_posts_cache_key, 'easy_share');
            
            if (false === $unique_posts) {
                $unique_posts = $wpdb->get_var($wpdb->prepare( // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching
                    "SELECT COUNT(DISTINCT post_id) FROM `{$wpdb->prefix}easy_share_analytics` WHERE DATE(share_timestamp) >= %s",
                    $start_date
                ));
                
                if (!empty($wpdb->last_error)) {
                    $unique_posts = 0;
                }
                
                // Cache for 5 minutes
                wp_cache_set($unique_posts_cache_key, $unique_posts, 'easy_share', 300);
            }
            
            $top_platforms_cache_key = 'easy_share_top_platforms_' . md5($start_date);
            $top_platforms = wp_cache_get($top_platforms_cache_key, 'easy_share');
            
            if (false === $top_platforms) {
                $top_platforms = $wpdb->get_results($wpdb->prepare( // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching
                    "SELECT platform, COUNT(*) as total_shares 
                     FROM `{$wpdb->prefix}easy_share_analytics` 
                     WHERE DATE(share_timestamp) >= %s 
                     GROUP BY platform 
                     ORDER BY total_shares DESC 
                     LIMIT 5",
                    $start_date
                ));
                
                if (!empty($wpdb->last_error)) {
                    $top_platforms = array();
                }
                
                // Cache for 5 minutes
                wp_cache_set($top_platforms_cache_key, $top_platforms, 'easy_share', 300);
            }
            
            // Calculate growth percentage
            $previous_period_start = gmdate('Y-m-d', strtotime("-" . ($days_ago * 2) . " days"));
            $previous_shares_cache_key = 'easy_share_previous_shares_' . md5($previous_period_start . $start_date);
            $previous_shares = wp_cache_get($previous_shares_cache_key, 'easy_share');
            
            if (false === $previous_shares) {
                $previous_shares = $wpdb->get_var($wpdb->prepare( // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching
                    "SELECT COUNT(*) FROM `{$wpdb->prefix}easy_share_analytics` WHERE DATE(share_timestamp) >= %s AND DATE(share_timestamp) < %s",
                    $previous_period_start,
                    $start_date
                ));
                
                if (!empty($wpdb->last_error)) {
                    // Continue without growth calculation
                    $previous_shares = 0;
                }
                
                // Cache for 5 minutes
                wp_cache_set($previous_shares_cache_key, $previous_shares, 'easy_share', 300);
            }
            
            $growth_percentage = 0;
            if ($previous_shares > 0) {
                $growth_percentage = round((($total_shares - $previous_shares) / $previous_shares) * 100, 1);
            } elseif ($total_shares > 0) {
                $growth_percentage = 100;
            }
            
            $real_data = array(
                'total_shares' => intval($total_shares),
                'unique_posts' => intval($unique_posts),
                'growth_percentage' => $growth_percentage,
                'top_platforms' => $top_platforms ?: array(),
                'period' => $period,
                'is_test_data' => false,
                'data_source' => 'database'
            );
            
            // Always return real data (even if it's zero)
            return rest_ensure_response($real_data);
            
        } catch (Exception $e) {
            // For Pro users, return empty data on error
            // For free users, this code path won't be reached since they get test data earlier
            return rest_ensure_response(array(
                'total_shares' => 0,
                'unique_posts' => 0,
                'growth_percentage' => 0,
                'top_platforms' => array(),
                'period' => $period,
                'is_test_data' => false,
                'data_source' => 'database'
            ));
        }
    }
    
    /**
     * Get platform statistics
     */
    public function get_platform_stats($request) {
        global $wpdb;
        
        // Check if Pro is active - return test data for free users
        if (!$this->is_pro_active()) {
            return $this->get_test_platform_stats($request->get_param('period') ?: '30');
        }
        
        // Validate and sanitize period parameter
        $period = $request->get_param('period') ?: '30';
        $period = sanitize_text_field($period);
        $allowed_periods = array('1', '7', '30', '90');
        if (!in_array($period, $allowed_periods)) {
            $period = '30';
        }
        
        $days_ago = absint($period);
        $start_date = gmdate('Y-m-d', strtotime("-{$days_ago} days"));
        
        // Check if analytics table exists with caching
        $table_name = $wpdb->prefix . 'easy_share_analytics';
        $table_cache_key = 'easy_share_table_exists_platform_' . md5($table_name);
        $table_exists = wp_cache_get($table_cache_key, 'easy_share');
        
        if (false === $table_exists) {
            $table_exists = $wpdb->get_var($wpdb->prepare( // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching
                "SHOW TABLES LIKE %s",
                $table_name
            )) === $table_name;
            
            // Cache for 1 hour
            wp_cache_set($table_cache_key, $table_exists, 'easy_share', HOUR_IN_SECONDS);
        }
        
        if (!$table_exists) {
            return rest_ensure_response(array());
        }
        
        // Check for database connection errors
        if (!empty($wpdb->last_error)) {
            return rest_ensure_response(array());
        }
        
        // Get real data from database with caching
        $platform_cache_key = 'easy_share_platform_stats_' . $period . '_' . md5($start_date);
        $platform_stats = wp_cache_get($platform_cache_key, 'easy_share');
        
        if (false === $platform_stats) {
            $platform_stats = $wpdb->get_results($wpdb->prepare( // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching
                "SELECT platform, 
                        COUNT(*) as total_shares,
                        COUNT(DISTINCT post_id) as unique_posts
                 FROM `{$wpdb->prefix}easy_share_analytics` 
                 WHERE DATE(share_timestamp) >= %s 
                 GROUP BY platform 
                 ORDER BY total_shares DESC",
                $start_date
            ));
            
            // Cache for 5 minutes
            wp_cache_set($platform_cache_key, $platform_stats, 'easy_share', 300);
        }
        
        if (!empty($wpdb->last_error)) {
            return $this->get_test_platform_stats($period);
        }
        
        // Convert to array format
        $real_data = array();
        if ($platform_stats) {
            foreach ($platform_stats as $stat) {
                $real_data[] = array(
                    'platform' => sanitize_text_field($stat->platform),
                    'total_shares' => intval($stat->total_shares),
                    'unique_posts' => intval($stat->unique_posts)
                );
            }
        }
        
        // Always return real data (even if empty)
        return rest_ensure_response($real_data);
    }
    
    /**
     * Get content statistics
     */
    public function get_content_stats($request) {
        global $wpdb;
        
        // Check if Pro is active - return test data for free users
        if (!$this->is_pro_active()) {
            return $this->get_test_content_stats($request->get_param('period') ?: '30');
        }
        
        $period = $request->get_param('period');
        $days_ago = gmdate('Y-m-d', strtotime("-{$period} days"));
        
        $table_name = $wpdb->prefix . 'easy_share_analytics';
        
        // Check if table exists with caching
        $table_cache_key = 'easy_share_table_exists_content_' . md5($table_name);
        $table_exists = wp_cache_get($table_cache_key, 'easy_share');
        
        if (false === $table_exists) {
            $table_exists = $wpdb->get_var($wpdb->prepare( // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching
                "SHOW TABLES LIKE %s",
                $table_name
            )) === $table_name;
            
            // Cache for 1 hour
            wp_cache_set($table_cache_key, $table_exists, 'easy_share', HOUR_IN_SECONDS);
        }
        
        if (!$table_exists) {
            return rest_ensure_response(array());
        }
        
        // Get top shared content with caching
        $content_cache_key = 'easy_share_content_stats_' . md5($days_ago);
        $top_content = wp_cache_get($content_cache_key, 'easy_share');
        
        if (false === $top_content) {
            $top_content = $wpdb->get_results($wpdb->prepare( // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching
                "SELECT post_id, 
                        COUNT(*) as total_shares,
                        COUNT(DISTINCT platform) as platforms_used
                 FROM `{$wpdb->prefix}easy_share_analytics` 
                 WHERE DATE(share_timestamp) >= %s 
                 GROUP BY post_id 
                 ORDER BY total_shares DESC 
                 LIMIT 10",
                $days_ago
            ));
            
            // Cache for 5 minutes
            wp_cache_set($content_cache_key, $top_content, 'easy_share', 300);
        }
        
        // Enrich with post data if we have content
        if (!empty($top_content)) {
            foreach ($top_content as &$content) {
                $post = get_post($content->post_id);
                if ($post) {
                    $content->post_title = $post->post_title;
                    $content->post_url = get_permalink($post->ID);
                    $content->post_type = $post->post_type;
                } else {
                    $content->post_title = 'Unknown Post';
                    $content->post_url = '';
                    $content->post_type = 'unknown';
                }
            }
        }
        
        return rest_ensure_response($top_content ?: array());
    }
    
    /**
     * Get daily statistics
     */
    public function get_daily_stats($request) {
        global $wpdb;
        
        // Check if Pro is active - return test data for free users
        if (!$this->is_pro_active()) {
            return $this->get_test_daily_stats($request->get_param('period') ?: '30');
        }
        
        try {
            $period = $request->get_param('period');
            $days_ago = gmdate('Y-m-d', strtotime("-{$period} days"));
            
            $table_name = $wpdb->prefix . 'easy_share_daily_stats';
            
            // Check if table exists with caching
            $table_cache_key = 'easy_share_table_exists_daily_' . md5($table_name);
            $table_exists = wp_cache_get($table_cache_key, 'easy_share');
            
            if (false === $table_exists) {
                $table_exists = $wpdb->get_var($wpdb->prepare( // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching
                    "SHOW TABLES LIKE %s",
                    $table_name
                )) === $table_name;
                
                // Cache for 1 hour
                wp_cache_set($table_cache_key, $table_exists, 'easy_share', HOUR_IN_SECONDS);
            }
            
            if (!$table_exists) {
                return rest_ensure_response(array());
            }
            
            // Check for database connection errors
            if (!empty($wpdb->last_error)) {
                return rest_ensure_response(array());
            }

            $daily_cache_key = 'easy_share_daily_stats_' . md5($days_ago);
            $daily_stats = wp_cache_get($daily_cache_key, 'easy_share');
            
            if (false === $daily_stats) {
                $daily_stats = $wpdb->get_results($wpdb->prepare( // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching
                    "SELECT * FROM `{$wpdb->prefix}easy_share_daily_stats` WHERE date_recorded >= %s ORDER BY date_recorded ASC",
                    $days_ago
                ));
                
                // Cache for 5 minutes
                wp_cache_set($daily_cache_key, $daily_stats, 'easy_share', 300);
            }            if (!empty($wpdb->last_error)) {
                return rest_ensure_response(array());
            }
            
            // Always return real data (even if empty)
            return rest_ensure_response($daily_stats ?: array());
            
        } catch (Exception $e) {
            return rest_ensure_response(array());
        }
    }
    
    /**
     * Check admin permissions
     */
    public function check_admin_permissions() {
        return current_user_can('manage_options');
    }

    /**
     * Check admin permissions with nonce verification
     */
    public function check_admin_permissions_with_nonce($request = null) {
        // Check admin capabilities first
        if (!current_user_can('manage_options')) {
            return new WP_Error('rest_forbidden', 'Sorry, you are not allowed to do that.', array('status' => 401));
        }

        // For logged-in admin users, verify nonce if provided
        if ($request && $request->get_header('X-WP-Nonce')) {
            $nonce = $request->get_header('X-WP-Nonce');
            if (!wp_verify_nonce($nonce, 'wp_rest')) {
                return new WP_Error('rest_forbidden', 'Invalid nonce.', array('status' => 403));
            }
        }

        return true;
    }

    /**
     * Check permissions for frontend track endpoint
     */
    public function check_track_permissions($request) {
        // Basic rate limiting - allow max 10 requests per minute per IP
        $user_ip = $this->get_user_ip();
        $rate_limit_key = 'easy_share_rate_limit_' . md5($user_ip);
        $current_requests = get_transient($rate_limit_key) ?: 0;
        
        if ($current_requests >= 10) {
            return new WP_Error('rest_rate_limited', 'Too many requests. Please try again later.', array('status' => 429));
        }
        
        // Increment counter
        set_transient($rate_limit_key, $current_requests + 1, 60); // 60 seconds
        
        return true;
    }
    
    /**
     * Check if pro version is active
     */
    private function is_pro_active() {
        return get_option('has_easy_ss_pro', false) == true;
    }
    
    /**
     * Check if real data is meaningful
     */
    private function has_meaningful_real_data($data) {
        if (empty($data)) {
            return false;
        }
        
        // For overview data
        if (isset($data['total_shares'])) {
            return intval($data['total_shares']) > 0;
        }
        
        // For array data (platforms, content, daily stats)
        if (is_array($data) && count($data) > 0) {
            // Check if any item has shares > 0
            foreach ($data as $item) {
                if (isset($item['total_shares']) && intval($item['total_shares']) > 0) {
                    return true;
                }
            }
        }
        
        return false;
    }
    
    /**
     * Get test analytics overview data
     */
    private function get_test_analytics_overview($period) {
        $test_data = $this->load_test_data();
        if ($test_data && isset($test_data['overview'])) {
            $overview = $test_data['overview'];
            $overview['period'] = $period;
            $overview['is_test_data'] = true;
            $overview['data_source'] = 'json_file';
            return rest_ensure_response($overview);
        }
        
        // Ultimate fallback
        return rest_ensure_response(array(
            'total_shares' => 0,
            'unique_posts' => 0,
            'growth_percentage' => 0,
            'top_platforms' => array(),
            'period' => $period,
            'is_test_data' => true,
            'data_source' => 'fallback'
        ));
    }
    
    /**
     * Get test platform stats data
     */
    private function get_test_platform_stats($period) {
        $test_data = $this->load_test_data();
        if ($test_data && isset($test_data['platform_stats'])) {
            return rest_ensure_response($this->filter_test_data_by_period($test_data['platform_stats'], $period));
        }
        
        return rest_ensure_response(array());
    }
    
    /**
     * Get test daily stats data
     */
    private function get_test_daily_stats($period) {
        $test_data = $this->load_test_data();
        if ($test_data && isset($test_data['daily_stats'])) {
            return rest_ensure_response($this->filter_test_data_by_period($test_data['daily_stats'], $period));
        }
        
        return rest_ensure_response(array());
    }
    
    /**
     * Get test content stats data
     */
    private function get_test_content_stats($period) {
        $test_data = $this->load_test_data();
        if ($test_data && isset($test_data['content_stats'])) {
            // Convert the JSON format to match the expected API format
            $content_stats = array();
            foreach ($test_data['content_stats'] as $content) {
                $content_stats[] = array(
                    'post_id' => $content['post_id'],
                    'post_title' => $content['post_title'],
                    'total_shares' => $content['total_shares'],
                    'platforms_used' => count($content['platforms']),
                    'post_type' => 'post',
                    'post_url' => '#'
                );
            }
            return rest_ensure_response($content_stats);
        }
        
        return rest_ensure_response(array());
    }
    
    /**
     * Load test data from JSON file
     */
    private function load_test_data() {
        $json_file = plugin_dir_path(__FILE__) . 'test-data.json';
        
        if (!file_exists($json_file)) {
            return null;
        }
        
        $json_content = file_get_contents($json_file);
        $test_data = json_decode($json_content, true);
        
        if (json_last_error() !== JSON_ERROR_NONE) {
            return null;
        }
        
        return $test_data;
    }
    
    /**
     * Filter test data by time period
     */
    private function filter_test_data_by_period($test_data, $period) {
        // For daily stats, filter by date range
        if (isset($test_data[0]['stat_date'])) {
            $days = intval($period);
            $start_date = gmdate('Y-m-d', strtotime("-{$days} days"));
            
            return array_filter($test_data, function($item) use ($start_date) {
                return $item['stat_date'] >= $start_date;
            });
        }
        
        // For other data types, return as-is
        return $test_data;
    }
    
    /**
     * Save share analytics to database
     */
    private function save_share_analytics($platform, $post_id, $url) {
        global $wpdb;
        
        // Sanitize inputs
        $platform = sanitize_text_field($platform);
        $post_id = absint($post_id);
        $url = esc_url_raw($url);
        
        // Validate inputs
        if (empty($platform) || $post_id <= 0) {
            return false;
        }
        
        $table_name = $wpdb->prefix . 'easy_share_analytics';
        
        // Check if table exists with caching
        $table_cache_key = 'easy_share_table_exists_save_' . md5($table_name);
        $table_exists = wp_cache_get($table_cache_key, 'easy_share');
        
        if (false === $table_exists) {
            $table_exists = $wpdb->get_var($wpdb->prepare( // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching
                "SHOW TABLES LIKE %s",
                $table_name
            )) === $table_name;
            
            // Cache for 1 hour
            wp_cache_set($table_cache_key, $table_exists, 'easy_share', HOUR_IN_SECONDS);
        }
        
        if (!$table_exists) {
            // Table doesn't exist, skip database operations
            return false;
        }
        
        // Get user info
        $user_id = get_current_user_id();
        $user_ip = $this->get_user_ip();
        $user_agent = isset($_SERVER['HTTP_USER_AGENT']) ? $this->sanitize_user_agent(sanitize_text_field(wp_unslash($_SERVER['HTTP_USER_AGENT']))) : '';
        
        // Insert new record
        $result = $wpdb->insert( // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery
            $table_name,
            array(
                'post_id' => $post_id,
                'platform' => $platform,
                'user_id' => $user_id,
                'user_ip' => $user_ip,
                'user_agent' => $user_agent,
                'shared_url' => $url,
                'share_timestamp' => current_time('mysql'),
                'share_count' => 1
            ),
            array('%d', '%s', '%d', '%s', '%s', '%s', '%s', '%d')
        );
        
        if ($result === false) {
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('Failed to save share analytics: ' . $wpdb->last_error);
            }
            return false;
        }
        
        // Update daily stats
        $this->update_daily_stats(gmdate('Y-m-d'));
        
        return true;
    }
    
    /**
     * Track advanced analytics (pro feature)
     */
    private function track_advanced_analytics($platform, $post_id, $url) {
        // Placeholder for pro analytics tracking
        do_action('easy_share_pro_track_analytics', $platform, $post_id, $url);
    }
    
    /**
     * Update daily statistics
     */
    private function update_daily_stats($date) {
        global $wpdb;
        
        $analytics_table = $wpdb->prefix . 'easy_share_analytics';
        $daily_stats_table = $wpdb->prefix . 'easy_share_daily_stats';
        
        // Check if daily stats table exists with caching
        $table_cache_key = 'easy_share_table_exists_update_daily_' . md5($daily_stats_table);
        $table_exists = wp_cache_get($table_cache_key, 'easy_share');
        
        if (false === $table_exists) {
            $table_exists = $wpdb->get_var($wpdb->prepare( // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching
                "SHOW TABLES LIKE %s",
                $daily_stats_table
            )) === $daily_stats_table;
            
            // Cache for 1 hour
            wp_cache_set($table_cache_key, $table_exists, 'easy_share', HOUR_IN_SECONDS);
        }
        
        if (!$table_exists) {
            return false;
        }
        
        // Get daily totals
        $daily_data = $wpdb->get_row($wpdb->prepare( // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching
            "SELECT 
                COUNT(*) as total_shares,
                COUNT(DISTINCT post_id) as unique_posts,
                COUNT(DISTINCT platform) as unique_platforms
             FROM `{$wpdb->prefix}easy_share_analytics` 
             WHERE DATE(share_timestamp) = %s 
             LIMIT 1",
            $date
        ));
        
        if ($daily_data) {
            // Check if record exists for today
            $existing = $wpdb->get_var($wpdb->prepare( // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching
                "SELECT id FROM `{$wpdb->prefix}easy_share_daily_stats` WHERE stat_date = %s",
                $date
            ));
            
            if ($existing) {
                // Update existing record
                $wpdb->update( // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery
                    $daily_stats_table,
                    array(
                        'total_shares' => $daily_data->total_shares,
                        'unique_posts' => $daily_data->unique_posts,
                        'unique_platforms' => $daily_data->unique_platforms,
                        'updated_at' => current_time('mysql')
                    ),
                    array('id' => $existing),
                    array('%d', '%d', '%d', '%s'),
                    array('%d')
                );
            } else {
                // Insert new record
                $wpdb->insert( // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery
                    $daily_stats_table,
                    array(
                        'stat_date' => $date,
                        'total_shares' => $daily_data->total_shares,
                        'unique_posts' => $daily_data->unique_posts,
                        'unique_platforms' => $daily_data->unique_platforms,
                        'created_at' => current_time('mysql'),
                        'updated_at' => current_time('mysql')
                    ),
                    array('%s', '%d', '%d', '%d', '%s', '%s')
                );
            }
        }
    }
    
    /**
     * Get user IP address with security considerations
     */
    private function get_user_ip() {
        $ip_keys = array('HTTP_CLIENT_IP', 'HTTP_X_FORWARDED_FOR', 'HTTP_X_FORWARDED', 
                        'HTTP_X_CLUSTER_CLIENT_IP', 'HTTP_FORWARDED_FOR', 'HTTP_FORWARDED', 'REMOTE_ADDR');
        
        foreach ($ip_keys as $key) {
            if (array_key_exists($key, $_SERVER) === true) {
                $server_value = sanitize_text_field(wp_unslash($_SERVER[$key]));
                foreach (explode(',', $server_value) as $ip) {
                    $ip = trim($ip);
                    if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE)) {
                        return $ip;
                    }
                }
            }
        }
        
        // Fallback to REMOTE_ADDR with validation
        $remote_addr = isset($_SERVER['REMOTE_ADDR']) ? sanitize_text_field(wp_unslash($_SERVER['REMOTE_ADDR'])) : '127.0.0.1';
        $ip = $remote_addr;
        
        if (filter_var($ip, FILTER_VALIDATE_IP)) {
            return $ip;
        }
        
        return '127.0.0.1'; // Ultimate fallback
    }

    /**
     * Sanitize user agent string
     */
    private function sanitize_user_agent($user_agent) {
        // Remove any potentially harmful characters
        $user_agent = sanitize_text_field($user_agent);
        
        // Limit length to prevent DoS
        $user_agent = substr($user_agent, 0, 255);
        
        // Remove any SQL-like patterns
        $user_agent = preg_replace('/[<>"\'\`\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/', '', $user_agent);
        
        return $user_agent ?: 'Unknown';
    }

    /**
     * Import settings from uploaded file
     */
    public function import_settings($request) {
        $settings_data = $request->get_param('settings');
        
        if (empty($settings_data) || !is_array($settings_data)) {
            return new WP_Error(
                'invalid_data',
                __('Invalid settings data provided', 'easy-share-solution'),
                array('status' => 400)
            );
        }
        
        // Handle both direct settings data and wrapped export format
        $final_settings = $settings_data;
        if (isset($settings_data['data'])) {
            // Data from export endpoint (wrapped format)
            $final_settings = $settings_data['data'];
        }
        
        // Use the main settings class for updating if available
        if (class_exists('EasyShare_Settings')) {
            $result = EasyShare_Settings::update_settings($final_settings);
        } else {
            // Fallback to direct option update
            $result = update_option('easy_share_settings', $final_settings);
        }
        
        // Clear any caches
        if (function_exists('wp_cache_flush')) {
            wp_cache_flush();
        }
        
        if ($result) {
            return rest_ensure_response(array(
                'success' => true,
                'message' => __('Settings imported successfully', 'easy-share-solution')
            ));
        } else {
            return new WP_Error(
                'import_failed',
                __('Failed to import settings', 'easy-share-solution'),
                array('status' => 500)
            );
        }
    }
}
