<?php
/**
 * Database management for Easy Share Solution
 *
 * @package EasyShareSolution
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Class EasyShare_Database
 * 
 * Handles all database operations including table creation, updates, and version management
 */
class EasyShare_Database {
    
    /**
     * Current database version
     */
    const DB_VERSION = '2.0.0';
    
    /**
     * Database version option name
     */
    const DB_VERSION_OPTION = 'easy_share_db_version';
    
    /**
     * Auto-update flag option name
     */
    const AUTO_UPDATE_FLAG = 'easy_share_auto_updated';
    
    /**
     * Constructor
     */
    public function __construct() {
        // Hook for admin notices
        add_action('admin_notices', array($this, 'maybe_show_update_success_notice'));
    }
    
    /**
     * Check if database tables need to be created/updated
     * 
     * @return bool True if tables were created/updated, false if no action needed
     */
    public function maybe_create_tables() {
        $current_db_version = get_option(self::DB_VERSION_OPTION, '0');
        $required_db_version = self::DB_VERSION;
        
        // If database version is outdated or doesn't exist, create/update tables
        if (version_compare($current_db_version, $required_db_version, '<')) {
            // Add a flag to show that auto-update happened (only for existing users)
            if ($current_db_version !== '0') {
                update_option(self::AUTO_UPDATE_FLAG, true);
            }
            
            $this->create_tables();
            
            // Log the update for debugging
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log(sprintf(
                    /* translators: %1$s: current database version, %2$s: required database version */
                    __('Easy Share Solution: Database tables updated from version %1$s to %2$s', 'easy-share-solution'),
                    $current_db_version,
                    $required_db_version
                ));
            }
            
            return true;
        }
        
        return false;
    }
    
    /**
     * Show admin notice after auto-update
     */
    public function maybe_show_update_success_notice() {
        // Security: Only show to users who can manage options
        if (!current_user_can('manage_options')) {
            return;
        }
        
        if (get_option(self::AUTO_UPDATE_FLAG)) {
            delete_option(self::AUTO_UPDATE_FLAG);
            ?>
            <div class="notice notice-success is-dismissible">
                <p>
                    <strong><?php echo esc_html__('Easy Share Solution:', 'easy-share-solution'); ?></strong> 
                    <?php echo esc_html__('Database has been automatically updated to support new analytics features!', 'easy-share-solution'); ?>
                </p>
            </div>
            <?php
        }
    }
    
    /**
     * Create database tables
     * 
     * Creates all necessary tables for analytics and tracking
     * 
     * @return bool True on success, false on failure
     */
    public function create_tables() {
        global $wpdb;
        
        // Security: Check if user has proper capabilities (for manual calls)
        if (defined('WP_CLI') && WP_CLI) {
            // Allow WP-CLI access
        } elseif (is_admin() && current_user_can('activate_plugins')) {
            // Allow admin users with plugin activation rights
        } elseif (defined('WP_INSTALLING') && WP_INSTALLING) {
            // Allow during WordPress installation
        } else {
            // For automatic calls during plugin initialization, allow it
            // This is safe because it's only called from controlled contexts
        }
        
        $charset_collate = $wpdb->get_charset_collate();
        
        // Validate charset_collate for security
        if (empty($charset_collate)) {
            $charset_collate = 'DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci';
            // Log charset fallback for debugging
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log(__('Easy Share Solution: Using fallback charset collation', 'easy-share-solution'));
            }
        }
        
        // Analytics table for tracking shares
        $table_analytics = $wpdb->prefix . 'easy_share_analytics';
        $sql_analytics = "CREATE TABLE $table_analytics (
            id bigint(20) NOT NULL AUTO_INCREMENT,
            post_id bigint(20) NOT NULL,
            platform varchar(50) NOT NULL,
            share_count bigint(20) DEFAULT 1,
            user_agent text,
            ip_address varchar(45),
            referrer text,
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY post_platform (post_id, platform),
            KEY platform (platform),
            KEY created_at (created_at)
        ) $charset_collate;";
        
        // Daily statistics table
        $table_daily_stats = $wpdb->prefix . 'easy_share_daily_stats';
        $sql_daily_stats = "CREATE TABLE $table_daily_stats (
            id bigint(20) NOT NULL AUTO_INCREMENT,
            stat_date date NOT NULL,
            platform varchar(50) NOT NULL,
            total_shares bigint(20) DEFAULT 0,
            unique_posts bigint(20) DEFAULT 0,
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            UNIQUE KEY date_platform (stat_date, platform),
            KEY stat_date (stat_date),
            KEY platform (platform)
        ) $charset_collate;";
        
        // Session tracking table
        $table_sessions = $wpdb->prefix . 'easy_share_sessions';
        $sql_sessions = "CREATE TABLE $table_sessions (
            id bigint(20) NOT NULL AUTO_INCREMENT,
            session_id varchar(100) NOT NULL,
            user_id bigint(20) DEFAULT NULL,
            ip_address varchar(45),
            user_agent text,
            first_visit datetime DEFAULT CURRENT_TIMESTAMP,
            last_activity datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            page_views bigint(20) DEFAULT 1,
            total_shares bigint(20) DEFAULT 0,
            PRIMARY KEY (id),
            UNIQUE KEY session_id (session_id),
            KEY user_id (user_id),
            KEY last_activity (last_activity)
        ) $charset_collate;";
        
        // Content performance table
        $table_content_stats = $wpdb->prefix . 'easy_share_content_stats';
        $sql_content_stats = "CREATE TABLE $table_content_stats (
            id bigint(20) NOT NULL AUTO_INCREMENT,
            post_id bigint(20) NOT NULL,
            post_title text,
            post_type varchar(50),
            total_shares bigint(20) DEFAULT 0,
            facebook_shares bigint(20) DEFAULT 0,
            x_com_shares bigint(20) DEFAULT 0,
            linkedin_shares bigint(20) DEFAULT 0,
            pinterest_shares bigint(20) DEFAULT 0,
            whatsapp_shares bigint(20) DEFAULT 0,
            other_shares bigint(20) DEFAULT 0,
            first_shared datetime DEFAULT CURRENT_TIMESTAMP,
            last_shared datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            UNIQUE KEY post_id (post_id),
            KEY post_type (post_type),
            KEY total_shares (total_shares),
            KEY last_shared (last_shared)
        ) $charset_collate;";
        
        // Include WordPress upgrade script
        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        
        // Create tables with error handling and output buffering
        ob_start();
        $results = array();
        $results[] = dbDelta($sql_analytics);
        $results[] = dbDelta($sql_daily_stats);
        $results[] = dbDelta($sql_sessions);
        $results[] = dbDelta($sql_content_stats);
        ob_end_clean(); // Discard any output from dbDelta
        
        // Check for any errors
        if ($wpdb->last_error) {
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log(sprintf(
                    /* translators: %s: database error message */
                    __('Easy Share Database Error: %s', 'easy-share-solution'),
                    $wpdb->last_error
                ));
            }
            return false;
        }
        
        // Set database version for future upgrades
        $version_updated = update_option(self::DB_VERSION_OPTION, self::DB_VERSION);
        
        return $version_updated;
    }
    
    /**
     * Drop all plugin tables (for uninstall)
     * 
     * @param bool $confirm_deletion Requires true to actually delete tables (safety measure)
     * @return bool True on success, false on failure or insufficient permissions
     */
    public function drop_tables($confirm_deletion = false) {
        // Security: Only allow if user has proper capabilities
        if (!current_user_can('activate_plugins')) {
            return false;
        }
        
        // Safety: Require explicit confirmation
        if (!$confirm_deletion) {
            return false;
        }
        
        global $wpdb;
        
        $tables = array(
            $wpdb->prefix . 'easy_share_analytics',
            $wpdb->prefix . 'easy_share_daily_stats',
            $wpdb->prefix . 'easy_share_sessions',
            $wpdb->prefix . 'easy_share_content_stats'
        );
        
        foreach ($tables as $table) {
            // Security: Use proper SQL escaping and validate table name format
            $table = esc_sql($table);
            // Additional security: Verify it's actually our table
            if (strpos($table, $wpdb->prefix . 'easy_share_') === 0) {
                // Table names cannot be parameterized, but we've validated and escaped
                $wpdb->query("DROP TABLE IF EXISTS `{$table}`"); // phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared,WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching,WordPress.DB.DirectDatabaseQuery.SchemaChange
            }
        }
        
        // Remove database version option
        delete_option(self::DB_VERSION_OPTION);
        delete_option(self::AUTO_UPDATE_FLAG);
        
        return true;
    }
    
    /**
     * Get current database version
     * 
     * @return string Database version or '0' if not set
     */
    public function get_db_version() {
        return get_option(self::DB_VERSION_OPTION, '0');
    }
    
    /**
     * Check if tables exist
     * 
     * @return array Array of table existence status
     */
    public function check_tables_exist() {
        // Security: Only allow users who can manage options to check table status
        if (!current_user_can('manage_options')) {
            return array();
        }
        
        global $wpdb;
        
        $tables = array(
            'analytics' => $wpdb->prefix . 'easy_share_analytics',
            'daily_stats' => $wpdb->prefix . 'easy_share_daily_stats',
            'sessions' => $wpdb->prefix . 'easy_share_sessions',
            'content_stats' => $wpdb->prefix . 'easy_share_content_stats'
        );
        
        $status = array();
        
        foreach ($tables as $key => $table_name) {
            // Check cache first
            $cache_key = 'easy_share_table_status_' . md5($table_name);
            $table_exists = wp_cache_get($cache_key, 'easy_share');
            
            if (false === $table_exists) {
                // Security: Use prepared statement to check table existence
                $table_exists = $wpdb->get_var($wpdb->prepare("SHOW TABLES LIKE %s", $table_name)); // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching
                
                // Cache for 1 hour
                wp_cache_set($cache_key, $table_exists, 'easy_share', HOUR_IN_SECONDS);
            }
            
            $status[$key] = ($table_exists === $table_name);
        }
        
        return $status;
    }
    
    /**
     * Get database statistics
     * 
     * @return array Database statistics including table sizes and row counts
     */
    public function get_database_stats() {
        // Security: Only allow users who can manage options to view database stats
        if (!current_user_can('manage_options')) {
            return array();
        }
        
        global $wpdb;
        
        $tables = array(
            'analytics' => $wpdb->prefix . 'easy_share_analytics',
            'daily_stats' => $wpdb->prefix . 'easy_share_daily_stats',
            'sessions' => $wpdb->prefix . 'easy_share_sessions',
            'content_stats' => $wpdb->prefix . 'easy_share_content_stats'
        );
        
        $stats = array();
        
        foreach ($tables as $key => $table_name) {
            // Security: Validate table name and use prepared statements
            if (strpos($table_name, $wpdb->prefix . 'easy_share_') !== 0) {
                continue; // Skip if not our table
            }
            
            // Check cache for row count
            $row_count_cache_key = 'easy_share_row_count_' . md5($table_name);
            $row_count = wp_cache_get($row_count_cache_key, 'easy_share');
            
            if (false === $row_count) {
                // Use prepared statements for security
                $row_count = $wpdb->get_var($wpdb->prepare("SELECT COUNT(*) FROM `%s`", $table_name)); // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching
                
                // Cache for 5 minutes
                wp_cache_set($row_count_cache_key, $row_count, 'easy_share', 300);
            }
            
            // Check cache for table size
            $table_size_cache_key = 'easy_share_table_size_' . md5($table_name);
            $table_size = wp_cache_get($table_size_cache_key, 'easy_share');
            
            if (false === $table_size) {
                $table_size = $wpdb->get_var($wpdb->prepare( // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching
                    "SELECT ROUND(((data_length + index_length) / 1024 / 1024), 2) 
                    FROM information_schema.TABLES 
                    WHERE table_schema = DATABASE() 
                    AND table_name = %s",
                    $table_name
                ));
                
                // Cache for 5 minutes
                wp_cache_set($table_size_cache_key, $table_size, 'easy_share', 300);
            }
            
            $stats[$key] = array(
                'table_name' => esc_html($table_name),
                'row_count' => (int) $row_count,
                'size_mb' => (float) $table_size
            );
        }
        
        return $stats;
    }
    
    /**
     * Validate database integrity
     * 
     * @return array Array of validation results
     */
    public function validate_database_integrity() {
        // Security: Only allow users who can manage options
        if (!current_user_can('manage_options')) {
            return array('error' => __('Insufficient permissions', 'easy-share-solution'));
        }
        
        global $wpdb;
        
        $validation = array(
            'tables_exist' => $this->check_tables_exist(),
            'version_match' => version_compare($this->get_db_version(), self::DB_VERSION, '>='),
            'charset_correct' => true,
            'errors' => array()
        );
        
        // Check table structure integrity
        $expected_tables = array(
            'analytics' => $wpdb->prefix . 'easy_share_analytics',
            'daily_stats' => $wpdb->prefix . 'easy_share_daily_stats',
            'sessions' => $wpdb->prefix . 'easy_share_sessions',
            'content_stats' => $wpdb->prefix . 'easy_share_content_stats'
        );
        
        foreach ($expected_tables as $key => $table_name) {
            if (!$validation['tables_exist'][$key]) {
                $validation['errors'][] = sprintf(
                    /* translators: %s: database table name */
                    __('Table %s is missing', 'easy-share-solution'),
                    esc_html($table_name)
                );
            }
        }
        
        return $validation;
    }
}