<?php
/**
 * Analytics Settings Management for Easy Share Solution
 *
 * @package EasyShareSolution
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Class EasyShare_Analytics_Settings
 */
class EasyShare_Analytics_Settings {
    
    /**
     * Settings option name
     */
    const OPTION_NAME = 'easy_share_analytics_settings';
    
    /**
     * Default analytics settings
     */
    private static $defaults = array(
        // Analytics Configuration
        'analytics_enabled' => false,
        'track_shares' => true,
        'track_clicks' => true,
        'track_views' => false,
        'track_user_data' => false,
        'data_retention_days' => 90,
        
        // Report Settings
        'email_reports' => false,
        'email_frequency' => 'weekly',
        'report_recipients' => array(),
        
        // Privacy Settings
        'anonymize_ip' => true,
        'gdpr_compliant' => true,
        'data_export_enabled' => true,
        'data_deletion_enabled' => true,
        
        // Advanced Analytics (Pro features)
        'google_analytics_integration' => false,
        'custom_events' => false,
        'advanced_filtering' => false,
        'export_data' => false
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
     * Register REST API routes for analytics settings
     */
    public function register_rest_routes() {
        register_rest_route('easy-share/v1', '/settings/analytics', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_analytics_settings'),
            'permission_callback' => array($this, 'check_admin_permissions')
        ));
        
        register_rest_route('easy-share/v1', '/settings/analytics', array(
            'methods' => 'POST',
            'callback' => array($this, 'update_analytics_settings'),
            'permission_callback' => array($this, 'check_admin_permissions'),
            'args' => array()
        ));
        
        register_rest_route('easy-share/v1', '/settings/analytics/reset', array(
            'methods' => 'POST',
            'callback' => array($this, 'reset_analytics_settings'),
            'permission_callback' => array($this, 'check_admin_permissions')
        ));
        
        // Analytics data endpoints
        register_rest_route('easy-share/v1', '/analytics/overview', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_analytics_overview'),
            'permission_callback' => array($this, 'check_admin_permissions_with_nonce'),
            'args' => array(
                'period' => array(
                    'default' => '30',
                    'validate_callback' => function($param) {
                        return in_array($param, ['1', '7', '30', '90']);
                    },
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
                    'default' => '30',
                    'validate_callback' => function($param) {
                        return in_array($param, ['1', '7', '30', '90']);
                    },
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
                    'default' => '30',
                    'validate_callback' => function($param) {
                        return in_array($param, ['1', '7', '30', '90']);
                    },
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
                    'default' => '30',
                    'validate_callback' => function($param) {
                        return in_array($param, ['1', '7', '30', '90']);
                    },
                    'sanitize_callback' => 'sanitize_text_field'
                )
            )
        ));
    }
    
    /**
     * Get analytics settings via REST API
     */
    public function get_analytics_settings($request) {
        try {
            $settings = self::get_settings();
            
            return rest_ensure_response(array(
                'success' => true,
                'data' => $settings
            ));
            
        } catch (Exception $e) {
            return new WP_Error('settings_error', 'Failed to load analytics settings: ' . $e->getMessage(), array('status' => 500));
        }
    }
    
    /**
     * Update analytics settings via REST API
     */
    public function update_analytics_settings($request) {
        try {
            $params = $request->get_params();
            
            if (empty($params)) {
                return new WP_Error('no_params', 'No parameters received', array('status' => 400));
            }
            
            // Sanitize settings
            $sanitized_settings = self::sanitize_analytics_settings($params);
            
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
                    'message' => 'Analytics settings updated successfully'
                ));
            } else {
                return new WP_Error('update_failed', 'Failed to update analytics settings in database', array('status' => 500));
            }
        } catch (Exception $e) {
            return new WP_Error('server_error', 'Server error: ' . $e->getMessage(), array('status' => 500));
        }
    }
    
    /**
     * Reset analytics settings to defaults via REST API
     */
    public function reset_analytics_settings($request) {
        try {
            $reset_result = self::reset_to_defaults();
            
            if ($reset_result) {
                wp_cache_delete(self::OPTION_NAME, 'options');
                $current_settings = self::get_settings();
                
                return rest_ensure_response(array(
                    'success' => true,
                    'message' => 'Analytics settings reset to defaults successfully',
                    'data' => $current_settings
                ));
            } else {
                return new WP_Error('reset_failed', 'Failed to reset analytics settings to defaults', array('status' => 500));
            }
        } catch (Exception $e) {
            return new WP_Error('server_error', 'Server error: ' . $e->getMessage(), array('status' => 500));
        }
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
        
        try {
            // Use proper table name with esc_sql for extra safety
            $table_name = esc_sql($wpdb->prefix . 'easy_share_analytics');
            
            // Calculate date range - sanitize input
            $days_ago = absint($period);
            $start_date = gmdate('Y-m-d', strtotime("-{$days_ago} days"));
            
            // Get real data from database with proper prepared statements and caching
            $total_shares_cache_key = 'easy_share_analytics_total_' . md5($start_date);
            $total_shares = wp_cache_get($total_shares_cache_key, 'easy_share');
            
            if (false === $total_shares) {
                $total_shares = $wpdb->get_var($wpdb->prepare( // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching
                    "SELECT COUNT(*) FROM `{$table_name}` WHERE share_timestamp >= %s",
                    $start_date
                ));
                
                // Cache for 5 minutes
                wp_cache_set($total_shares_cache_key, $total_shares, 'easy_share', 300);
            }
            
            $unique_posts_cache_key = 'easy_share_analytics_unique_posts_' . md5($start_date);
            $unique_posts = wp_cache_get($unique_posts_cache_key, 'easy_share');
            
            if (false === $unique_posts) {
                $unique_posts = $wpdb->get_var($wpdb->prepare( // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching
                    "SELECT COUNT(DISTINCT post_id) FROM `{$table_name}` WHERE share_timestamp >= %s",
                    $start_date
                ));
                
                // Cache for 5 minutes
                wp_cache_set($unique_posts_cache_key, $unique_posts, 'easy_share', 300);
            }
            
            $top_platforms_cache_key = 'easy_share_analytics_top_platforms_' . md5($start_date);
            $top_platforms = wp_cache_get($top_platforms_cache_key, 'easy_share');
            
            if (false === $top_platforms) {
                $top_platforms = $wpdb->get_results($wpdb->prepare( // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching
                    "SELECT platform, COUNT(*) as total_shares 
                     FROM `{$table_name}` 
                     WHERE share_timestamp >= %s 
                     GROUP BY platform 
                     ORDER BY total_shares DESC 
                     LIMIT 5",
                    $start_date
                ));
                
                // Cache for 5 minutes
                wp_cache_set($top_platforms_cache_key, $top_platforms, 'easy_share', 300);
            }
            
            // Calculate growth percentage with proper date handling
            $previous_period_start = gmdate('Y-m-d', strtotime("-" . ($days_ago * 2) . " days"));
            $previous_shares_cache_key = 'easy_share_analytics_previous_' . md5($previous_period_start . $start_date);
            $previous_shares = wp_cache_get($previous_shares_cache_key, 'easy_share');
            
            if (false === $previous_shares) {
                $previous_shares = $wpdb->get_var($wpdb->prepare( // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching
                    "SELECT COUNT(*) FROM `{$table_name}` 
                     WHERE share_timestamp >= %s AND share_timestamp < %s",
                    $previous_period_start,
                    $start_date
                ));
                
                // Cache for 5 minutes
                wp_cache_set($previous_shares_cache_key, $previous_shares, 'easy_share', 300);
            }
            
            $growth_percentage = 0;
            if ($previous_shares > 0) {
                $growth_percentage = round((($total_shares - $previous_shares) / $previous_shares) * 100, 1);
            } elseif ($total_shares > 0) {
                $growth_percentage = 100;
            }
            
            // Sanitize output data
            $result = array(
                'total_shares' => absint($total_shares),
                'unique_posts' => absint($unique_posts),
                'growth_percentage' => floatval($growth_percentage),
                'top_platforms' => $this->sanitize_platform_stats($top_platforms),
                'period_days' => $days_ago,
                'data_source' => 'database'
            );
            
            return rest_ensure_response($result);
            
        } catch (Exception $e) {
            return new WP_Error('analytics_error', 'Failed to load analytics data', array('status' => 500));
        }
    }
    
    /**
     * Get platform statistics
     */
    public function get_platform_stats($request) {
    global $wpdb;
    
    // Add permission check
    if (!current_user_can('read')) {
        return new WP_Error('rest_forbidden', __('Sorry, you are not allowed to access this resource.', 'easy-share-solution'), array('status' => 403));
    }
    
    // Validate and sanitize period parameter
    $period = $request->get_param('period') ?: '30';
    $period = sanitize_text_field($period);
    $allowed_periods = array('1', '7', '30', '90');
    if (!in_array($period, $allowed_periods, true)) {
        $period = '30';
    }
    
    $days_ago = absint($period);
    $start_date = gmdate('Y-m-d', strtotime("-{$days_ago} days"));
    
    // Validate start_date
    if (!$start_date || $start_date === '1970-01-01') {
        return new WP_Error('invalid_date', __('Invalid date parameter.', 'easy-share-solution'), array('status' => 400));
    }
    
    // Use wpdb->prepare for table name (don't use esc_sql on table names in prepare)
    $table_name = $wpdb->prefix . 'easy_share_analytics';
    
    // Verify table exists
    $table_exists = $wpdb->get_var($wpdb->prepare( // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching
        "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = %s AND table_name = %s",
        DB_NAME,
        $table_name
    ));
    
    if (!$table_exists) {
        return new WP_Error('table_not_found', __('Analytics table not found.', 'easy-share-solution'), array('status' => 500));
    }
    
    // Get real data from database with proper prepared statements
    // Note: Table names cannot be parameterized in prepared statements, but we validate above
    $platform_stats = $wpdb->get_results($wpdb->prepare( // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching
        "SELECT platform, 
                COUNT(*) as total_shares,
                COUNT(DISTINCT post_id) as unique_posts,
                COUNT(*) / COUNT(DISTINCT post_id) as avg_shares,
                MAX(share_timestamp) as last_share
         FROM `{$table_name}` 
         WHERE share_timestamp >= %s 
         GROUP BY platform 
         ORDER BY total_shares DESC
         LIMIT 50",
        $start_date
    ));
    
    // Check for database errors
    if ($wpdb->last_error) {
        return new WP_Error('database_error', __('Database query failed.', 'easy-share-solution'), array('status' => 500));
    }
    
    // Convert to array format with proper sanitization and validation
    $result = array();
    if ($platform_stats) {
        foreach ($platform_stats as $stat) {
            // Validate platform name (only allow expected characters)
            $platform = sanitize_text_field($stat->platform);
            if (empty($platform) || !preg_match('/^[a-zA-Z0-9_-]+$/', $platform)) {
                continue; // Skip invalid platforms
            }
            
            // Validate numeric values
            $total_shares = absint($stat->total_shares);
            $unique_posts = absint($stat->unique_posts);
            $avg_shares = floatval($stat->avg_shares);
            
            // Validate date format
            $last_share = sanitize_text_field($stat->last_share);
            if (!empty($last_share) && !preg_match('/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/', $last_share)) {
                $last_share = ''; // Invalid date format
            }
            
            $result[] = array(
                'platform' => $platform,
                'total_shares' => $total_shares,
                'unique_posts' => $unique_posts,
                'avg_shares' => round($avg_shares, 1),
                'last_share' => $last_share
            );
        }
    }
    
    // Add response caching headers for performance
    $response = rest_ensure_response($result);
    $response->header('Cache-Control', 'public, max-age=300'); // 5 minutes cache
    
    return $response;
}
    
    /**
     * Get content statistics
     */
    public function get_content_stats($request) {
        global $wpdb;
        
        $period = $request->get_param('period');
        $days_ago = gmdate('Y-m-d', strtotime("-{$period} days"));
        
        $table_name = $wpdb->prefix . 'easy_share_analytics';
        
        // Get top shared content
        $top_content = $wpdb->get_results($wpdb->prepare( // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching
            "SELECT post_id, 
                    COUNT(*) as total_shares,
                    COUNT(DISTINCT platform) as platforms_used
             FROM {$table_name} 
             WHERE share_timestamp >= %s 
             GROUP BY post_id 
             ORDER BY total_shares DESC 
             LIMIT 10",
            $days_ago
        ));
        
        // Enrich with post data if we have content
        if (!empty($top_content)) {
            foreach ($top_content as &$content) {
                $post = get_post($content->post_id);
                if ($post) {
                    $content->post_title = $post->post_title;
                    $content->post_url = get_permalink($content->post_id);
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
        
        try {
            $period = $request->get_param('period');
            $days_ago = gmdate('Y-m-d', strtotime("-{$period} days"));
            
            $table_name = $wpdb->prefix . 'easy_share_daily_stats';
            
            $daily_stats = $wpdb->get_results($wpdb->prepare( // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching
                "SELECT date_recorded as stat_date, 
                        total_shares,
                        total_posts as unique_posts,
                        unique_users,
                        platform as most_shared_platform
                 FROM {$table_name} 
                 WHERE date_recorded >= %s 
                 ORDER BY date_recorded ASC",
                $days_ago
            ));
            
            if ($wpdb->last_error) {
                return new WP_Error('db_error', 'Database error in daily stats query: ' . $wpdb->last_error);
            }
            
            return rest_ensure_response($daily_stats ?: array());
            
        } catch (Exception $e) {
            return new WP_Error('exception', 'Exception in daily stats: ' . $e->getMessage());
        }
    }
    
    /**
     * Sanitize platform statistics output
     */
    private function sanitize_platform_stats($platform_stats) {
        if (!is_array($platform_stats)) {
            return array();
        }
        
        $sanitized = array();
        foreach ($platform_stats as $stat) {
            if (is_object($stat)) {
                $sanitized[] = array(
                    'platform' => sanitize_text_field($stat->platform ?? ''),
                    'total_shares' => absint($stat->total_shares ?? 0)
                );
            }
        }
        
        return $sanitized;
    }
    
    /**
     * Get all analytics settings
     */
    public static function get_settings() {
        $settings = get_option(self::OPTION_NAME, array());
        return wp_parse_args($settings, self::$defaults);
    }
    
    /**
     * Get a specific analytics setting
     */
    public static function get_setting($key, $default = null) {
        $settings = self::get_settings();
        return isset($settings[$key]) ? $settings[$key] : $default;
    }
    
    /**
     * Update a specific analytics setting
     */
    public static function update_setting($key, $value) {
        $settings = self::get_settings();
        $settings[$key] = $value;
        
        return update_option(self::OPTION_NAME, $settings);
    }
    
    /**
     * Update multiple analytics settings
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
        // Check for missing analytics configuration
        if (!isset($current_settings['track_shares']) || !isset($current_settings['data_retention_days'])) {
            return true;
        }
        
        return false;
    }
    
    /**
     * Sanitize analytics settings
     */
    public static function sanitize_analytics_settings($input) {
        $sanitized = array();
        
        // Basic analytics settings
        $sanitized['analytics_enabled'] = isset($input['analytics_enabled']) ? (bool) $input['analytics_enabled'] : false;
        $sanitized['track_shares'] = isset($input['track_shares']) ? (bool) $input['track_shares'] : true;
        $sanitized['track_clicks'] = isset($input['track_clicks']) ? (bool) $input['track_clicks'] : true;
        $sanitized['track_views'] = isset($input['track_views']) ? (bool) $input['track_views'] : false;
        $sanitized['track_user_data'] = isset($input['track_user_data']) ? (bool) $input['track_user_data'] : false;
        $sanitized['data_retention_days'] = isset($input['data_retention_days']) ? absint($input['data_retention_days']) : 90;
        
        // Ensure data retention is within reasonable bounds
        if ($sanitized['data_retention_days'] < 7) $sanitized['data_retention_days'] = 7;
        if ($sanitized['data_retention_days'] > 365) $sanitized['data_retention_days'] = 365;
        
        // Report settings
        $sanitized['email_reports'] = isset($input['email_reports']) ? (bool) $input['email_reports'] : false;
        
        $allowed_frequencies = array('daily', 'weekly', 'monthly');
        $sanitized['email_frequency'] = isset($input['email_frequency']) && in_array($input['email_frequency'], $allowed_frequencies) ? 
            $input['email_frequency'] : 'weekly';
        
        // Report recipients
        if (isset($input['report_recipients']) && is_array($input['report_recipients'])) {
            $sanitized['report_recipients'] = array();
            foreach ($input['report_recipients'] as $email) {
                $email = sanitize_email($email);
                if (is_email($email)) {
                    $sanitized['report_recipients'][] = $email;
                }
            }
        } else {
            $sanitized['report_recipients'] = array();
        }
        
        // Privacy settings
        $sanitized['anonymize_ip'] = isset($input['anonymize_ip']) ? (bool) $input['anonymize_ip'] : true;
        $sanitized['gdpr_compliant'] = isset($input['gdpr_compliant']) ? (bool) $input['gdpr_compliant'] : true;
        $sanitized['data_export_enabled'] = isset($input['data_export_enabled']) ? (bool) $input['data_export_enabled'] : true;
        $sanitized['data_deletion_enabled'] = isset($input['data_deletion_enabled']) ? (bool) $input['data_deletion_enabled'] : true;
        
        // Advanced analytics (Pro features)
        $sanitized['google_analytics_integration'] = isset($input['google_analytics_integration']) ? (bool) $input['google_analytics_integration'] : false;
        $sanitized['custom_events'] = isset($input['custom_events']) ? (bool) $input['custom_events'] : false;
        $sanitized['advanced_filtering'] = isset($input['advanced_filtering']) ? (bool) $input['advanced_filtering'] : false;
        $sanitized['export_data'] = isset($input['export_data']) ? (bool) $input['export_data'] : false;
        
        return $sanitized;
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
}
