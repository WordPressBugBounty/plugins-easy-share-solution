<?php
/**
 * Easy Share Solution Notice Utilities
 * Helper functions for managing admin notices
 */

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Notice utility functions
 */
class Easy_Share_Notice_Utils {
    
    /**
     * Reset all notices (useful for testing)
     */
    public static function reset_all_notices() {
        delete_option('ess_update_notice_dismissed1');
        delete_option('ess_pro_notice_dismissed1');
        
        return [
            'success' => true,
            'message' => 'All notices have been reset and will appear again.'
        ];
    }
    
    /**
     * Get notice status
     */
    public static function get_notice_status() {
        return [
            'update_notice_dismissed' => get_option('ess_update_notice_dismissed1', false),
            'pro_notice_dismissed' => get_option('ess_pro_notice_dismissed1', false)
        ];
    }
    
    /**
     * Manually dismiss a notice
     */
    public static function dismiss_notice($notice_type) {
        $notice_keys = [
            'update' => 'ess_update_notice_dismissed1',
            'pro' => 'ess_pro_notice_dismissed1'
        ];
        
        if (!isset($notice_keys[$notice_type])) {
            return [
                'success' => false,
                'message' => 'Invalid notice type'
            ];
        }
        
        update_option($notice_keys[$notice_type], true);
        
        return [
            'success' => true,
            'message' => ucfirst($notice_type) . ' notice dismissed successfully'
        ];
    }
    
    /**
     * Show a notice (un-dismiss it)
     */
    public static function show_notice($notice_type) {
        $notice_keys = [
            'update' => 'ess_update_notice_dismissed1',
            'pro' => 'ess_pro_notice_dismissed1'
        ];
        
        if (!isset($notice_keys[$notice_type])) {
            return [
                'success' => false,
                'message' => 'Invalid notice type'
            ];
        }
        
        delete_option($notice_keys[$notice_type]);
        
        return [
            'success' => true,
            'message' => ucfirst($notice_type) . ' notice will appear again'
        ];
    }
}

// Add AJAX handlers for admin notice management (for testing)
if (is_admin()) {
    add_action('wp_ajax_ess_reset_notices', function() {
        if (!current_user_can('manage_options')) {
            wp_die('Insufficient permissions');
        }
        
        $result = Easy_Share_Notice_Utils::reset_all_notices();
        wp_send_json($result);
    });
    
    add_action('wp_ajax_ess_get_notice_status', function() {
        if (!current_user_can('manage_options')) {
            wp_die('Insufficient permissions');
        }
        
        $status = Easy_Share_Notice_Utils::get_notice_status();
        wp_send_json(['success' => true, 'data' => $status]);
    });
}
