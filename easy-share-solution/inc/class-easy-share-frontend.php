<?php
/**
 * Frontend functionality
 *
 * @package EasyShareSolution
 * 
 * CSS & JS Organization:
 * - Static CSS: Moved to /assets/css/frontend.css
 * - Static JS: Moved to /assets/js/frontend.js  
 * - Inline styles: Only for dynamic PHP-dependent values (colors, sizes, positions)
 * - Inline scripts: Removed (moved to external file)
 * 
 * Remaining inline styles are required for:
 * - Platform-specific colors: --platform-color
 * - Dynamic icon sizes: width/height based on settings
 * - Positioning: Based on admin configuration
 * - Animation delays: Stagger effects
 * - Responsive breakpoints: Mobile/tablet specific values
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

require_once EASY_SHARE_PLUGIN_DIR . 'inc/trait-share-platforms.php';

/**
 * Class EasyShare_Frontend
 */
class EasyShare_Frontend {
    
    use Easy_Share_Platforms_Trait;
    
    /**
     * Constructor
     */
    public function __construct() {
        // Get load priority from settings for proper initialization
        $settings = EasyShare_Settings::get_settings();
        $load_priority = isset($settings['load_priority']) ? intval($settings['load_priority']) : 10;
        
        add_action('wp_enqueue_scripts', array($this, 'enqueue_scripts'), $load_priority);
        add_action('wp_head', array($this, 'apply_custom_css'), 20);
        add_action('wp_footer', array($this, 'apply_custom_js'), 25); // After custom CSS
        add_action('wp_footer', array($this, 'add_floating_panel'));
        // Removed duplicate add_floating_popup - it was causing duplicate panels
        add_action('wp_ajax_easy_share_track', array($this, 'track_share'));
        add_action('wp_ajax_nopriv_easy_share_track', array($this, 'track_share'));
        
        // Add shortcode support for frontend
        add_shortcode('easy_share', array($this, 'shortcode_handler'));
        
        // Auto-add share buttons to content
        add_filter('the_content', array($this, 'auto_add_share_buttons'));
    }
    
    /**
     * Shortcode handler for [easy_share] 
     * Primary frontend functionality
     * 
     * @param array $atts Shortcode attributes
     * @return string HTML output
     */
    public function shortcode_handler($atts) {
        $atts = shortcode_atts(array(
            'platforms' => 'facebook,xcom,linkedin,whatsapp,pinterest', // Default 5 platforms
            'layout' => 'horizontal',
            'style' => 'circle',
            'show_labels' => 'true',
            'show_more' => 'true', // Show more button with popup by default
            'alignment' => 'left',
            'size' => 'medium'
        ), $atts);
        
        return $this->render_share_buttons($atts);
    }
    
    /**
     * Auto-add share buttons to content based on display_positions settings
     * 
     * @param string $content Post content
     * @return string Modified content
     */
    public function auto_add_share_buttons($content) {
        if (!is_singular() || is_admin()) {
            return $content;
        }
        
        $settings = EasyShare_Settings::get_settings();
        
        // Check if plugin is enabled
        if (!isset($settings['enabled']) || !$settings['enabled']) {
            return $content;
        }
        
        // Advanced restrictions check
        if (!$this->check_advanced_restrictions($settings)) {
            return $content;
        }
        
        // Check if current post type is enabled
        $current_post_type = get_post_type();
        $enabled_post_types = isset($settings['post_types']) ? $settings['post_types'] : array('post', 'page');
        
        if (!in_array($current_post_type, $enabled_post_types)) {
            return $content;
        }
        
        // Get display positions
        $display_positions = isset($settings['display_positions']) ? $settings['display_positions'] : array();
        
        $share_buttons_html = '';
        
        // Only render if before_content or after_content is enabled
        if ((isset($display_positions['before_content']) && $display_positions['before_content']) ||
            (isset($display_positions['after_content']) && $display_positions['after_content'])) {
            
            // Get platforms from settings
            $selected_platforms = isset($settings['selected_platforms']) ? $settings['selected_platforms'] : array('facebook', 'x_com', 'linkedin', 'whatsapp', 'pinterest');
            
            // Get design settings
            $design_settings = isset($settings['floating_design']) ? $settings['floating_design'] : array();
            $icon_style = isset($design_settings['icon_style']) ? $design_settings['icon_style'] : 'circle';
            $icon_size = isset($design_settings['icon_size']) ? $design_settings['icon_size'] : 32;
            $show_count = isset($settings['show_count']) ? $settings['show_count'] : false;
            
            $share_buttons_html = $this->render_share_buttons(array(
                'platforms' => $selected_platforms,
                'show_more' => 'true',
                'layout' => 'horizontal',
                'style' => $icon_style,
                'size' => $this->convert_size_to_name($icon_size),
                'show_count' => $show_count
            ));
        }
        
        $modified_content = $content;
        
        // Add before content
        if (isset($display_positions['before_content']) && $display_positions['before_content'] && $share_buttons_html) {
            $modified_content = $share_buttons_html . $modified_content;
        }
        
        // Add after content  
        if (isset($display_positions['after_content']) && $display_positions['after_content'] && $share_buttons_html) {
            $modified_content = $modified_content . $share_buttons_html;
        }
        
        return $modified_content;
    }
    
    /**
     * Main render function for share buttons with popup
     * This is the core frontend functionality
     * 
     * @param array $args Configuration
     * @return string HTML output
     */
    public function render_share_buttons($args = array()) {
        $defaults = array(
            'platforms' => 'facebook,xcom,linkedin,whatsapp,pinterest',
            'layout' => 'horizontal',
            'style' => 'circle',
            'show_labels' => 'true',
            'show_more' => 'true',
            'alignment' => 'left',
            'size' => 'medium',
            'show_count' => false
        );
        
        $args = wp_parse_args($args, $defaults);
        
        // Convert string values to proper types
        $selected_platforms = is_array($args['platforms']) ? $args['platforms'] : explode(',', $args['platforms']);
        $show_labels = filter_var($args['show_labels'], FILTER_VALIDATE_BOOLEAN);
        $show_more = filter_var($args['show_more'], FILTER_VALIDATE_BOOLEAN);
        $show_count = filter_var($args['show_count'], FILTER_VALIDATE_BOOLEAN);
        
        // Clean platform names
        $selected_platforms = array_map('trim', $selected_platforms);
        
        // Get content icon design settings (separate from floating panel)
        $settings = EasyShare_Settings::get_settings();
        $content_design = isset($settings['content_icon_design']) ? $settings['content_icon_design'] : array();
        
        // Extract content icon design values with fallbacks
        $active_preset = isset($content_design['active_preset']) ? $content_design['active_preset'] : 'modern-glass';
        $background_style = isset($content_design['background_style']) ? $content_design['background_style'] : 'solid';
        $background_color = isset($content_design['background_color']) ? $content_design['background_color'] : '#ffffff';
        $gradient_start = isset($content_design['gradient_start_color']) ? $content_design['gradient_start_color'] : '#007cba';
        $gradient_end = isset($content_design['gradient_end_color']) ? $content_design['gradient_end_color'] : '#005a87';
        $gradient_direction = isset($content_design['gradient_direction']) ? $content_design['gradient_direction'] : '135deg';
        $border_width = isset($content_design['border_width']) ? $content_design['border_width'] : 1;
        $border_color = isset($content_design['border_color']) ? $content_design['border_color'] : '#e0e0e0';
        $border_radius = isset($content_design['border_radius']) ? $content_design['border_radius'] : 8;
        $enable_shadow = isset($content_design['enable_shadow']) ? $content_design['enable_shadow'] : true;
        $shadow_blur = isset($content_design['shadow_blur']) ? $content_design['shadow_blur'] : 15;
        $shadow_opacity = isset($content_design['shadow_opacity']) ? $content_design['shadow_opacity'] : 0.1;
        $icon_style = isset($content_design['icon_style']) ? $content_design['icon_style'] : 'circle';
        $icon_size = isset($content_design['icon_size']) ? $content_design['icon_size'] : 32;
        $icon_spacing = isset($content_design['icon_spacing']) ? $content_design['icon_spacing'] : 6;
        $icon_padding = isset($content_design['icon_padding']) ? $content_design['icon_padding'] : 8;
        $use_platform_colors = isset($content_design['use_platform_colors']) ? $content_design['use_platform_colors'] : true;
        $icon_color = isset($content_design['icon_color']) ? $content_design['icon_color'] : '#007cba';
        $svg_fill_color = isset($content_design['svg_fill_color']) ? $content_design['svg_fill_color'] : '#007cba';
        $hover_animation = isset($content_design['hover_animation']) ? $content_design['hover_animation'] : 'scale';
        $animation_duration = isset($content_design['animation_duration']) ? $content_design['animation_duration'] : 300;
        $icon_arrangement = isset($content_design['icon_arrangement']) ? $content_design['icon_arrangement'] : 'vertical';
        $container_padding = isset($content_design['container_padding']) ? $content_design['container_padding'] : 12;
        $alignment = isset($content_design['alignment']) ? $content_design['alignment'] : 'center';
        
        // Get general design settings for floating panel (different from content icons)
        $general_use_platform_colors = isset($design_settings['use_platform_colors']) ? $design_settings['use_platform_colors'] : true;
        $general_icon_color = isset($design_settings['icon_color']) ? $design_settings['icon_color'] : '#007cba';
        $icon_secondary_color = isset($design_settings['icon_secondary_color']) ? $design_settings['icon_secondary_color'] : '#ffffff';
        $icon_primary_color = isset($design_settings['icon_primary_color']) ? $design_settings['icon_primary_color'] : '#007cba';
        $icon_border_width = isset($design_settings['icon_border_width']) ? $design_settings['icon_border_width'] : 0;
        $icon_border_color = isset($design_settings['icon_border_color']) ? $design_settings['icon_border_color'] : '#000000';
        $icon_background_type = isset($design_settings['icon_background_type']) ? $design_settings['icon_background_type'] : 'solid';
        $icon_gradient_start = isset($design_settings['icon_gradient_start_color']) ? $design_settings['icon_gradient_start_color'] : '#007cba';
        $icon_gradient_end = isset($design_settings['icon_gradient_end_color']) ? $design_settings['icon_gradient_end_color'] : '#005a87';
        
        // Build CSS variables for content share block styling
        $css_variables = array(
            '--ess-content-bg-color' => $background_color,
            '--ess-content-gradient-start' => $gradient_start,
            '--ess-content-gradient-end' => $gradient_end,
            '--ess-content-border-width' => $border_width . 'px',
            '--ess-content-border-color' => $border_color,
            '--ess-content-border-radius' => $border_radius . 'px',
            '--ess-content-shadow-blur' => $shadow_blur . 'px',
            '--ess-content-shadow-opacity' => $shadow_opacity,
            '--ess-content-icon-size' => $icon_size . 'px',
            '--ess-content-icon-spacing' => $icon_spacing . 'px',
            '--ess-content-icon-padding' => $icon_padding . 'px',
            '--ess-content-icon-color' => $icon_color,
            '--ess-content-svg-fill-color' => $svg_fill_color,
            '--ess-content-animation-duration' => $animation_duration . 'ms',
            '--ess-content-container-padding' => $container_padding . 'px'
        );
        
        // Generate preset and modifier classes
        $preset_class = 'preset-' . esc_attr($active_preset);
        $shadow_class = !$enable_shadow ? 'no-shadow' : '';
        $gradient_class = $background_style === 'gradient' ? 'gradient-bg' : '';
        $icon_style_class = 'icon-' . $icon_style;
        $hover_class = 'hover-' . $hover_animation;
        $platform_colors_class = $use_platform_colors ? 'use-platform-colors' : '';
        $alignment_class = 'align-' . $alignment;
        
        // Combine all classes
        $content_classes = trim(implode(' ', array_filter(array(
            $preset_class,
            $shadow_class, 
            $gradient_class,
            $icon_style_class,
            $hover_class,
            $platform_colors_class,
            $alignment_class
        ))));
        
        // Add icon color based on platform color setting
        if (!$use_platform_colors) {
            $css_variables['--ess-icon-custom-color'] = $icon_color;
        }
        
        // Handle icon background based on type (for general settings, not content icons)
        if ($icon_background_type === 'gradient') {
            $css_variables['--ess-icon-background'] = 'linear-gradient(135deg, ' . $icon_gradient_start . ', ' . $icon_gradient_end . ')';
        } else {
            $css_variables['--ess-icon-background'] = $icon_primary_color;
        }
        
        // Add icon border if width > 0
        if ($icon_border_width > 0) {
            $css_variables['--ess-icon-border'] = $icon_border_width . 'px solid ' . $icon_border_color;
        } else {
            $css_variables['--ess-icon-border'] = 'none';
        }
        
        // Generate CSS variables string
        $css_vars_string = '';
        foreach ($css_variables as $var => $value) {
            $css_vars_string .= $var . ':' . $value . ';';
        }
        
        ob_start();
        ?>
        <div class="ess-share-block <?php echo esc_attr($content_classes); ?> ess-align-<?php echo esc_attr($args['alignment']); ?> ess-size-<?php echo esc_attr($args['size']); ?>" 
             data-style="<?php echo esc_attr($args['style']); ?>"
             data-icon-size="<?php echo esc_attr($this->convert_size_to_name($icon_size)); ?>"
             data-preset="<?php echo esc_attr($active_preset); ?>"
             style="<?php echo esc_attr($css_vars_string); ?>">
            
            <!-- Selected Platform Buttons -->
            <?php foreach ($selected_platforms as $platform): ?>
                <?php $platform_data = $this->get_platform_data($platform); ?>
                <?php if ($platform_data): ?>
                    <?php 
                    // Get share count for this platform if enabled
                    $share_count_display = '';
                    if ($show_count) {
                        $count = $this->get_platform_share_count($platform);
                        if ($count > 0) {
                            $share_count_display = '<span class="ess-share-count">' . $this->format_share_count($count) . '</span>';
                        }
                    }
                    ?>
                    <a href="#" 
                       class="ess-share-link ess-platform-<?php echo esc_attr($platform); ?> <?php echo esc_attr($platform); ?><?php echo $show_count ? ' ess-with-count' : ''; ?>" 
                       data-platform="<?php echo esc_attr($platform); ?>"
                       data-url="<?php echo esc_attr($platform_data['shareUrl']); ?>"
                       title="<?php echo esc_attr(sprintf(
                           /* translators: %s: social media platform name */
                           __('Share on %s', 'easy-share-solution'), 
                           $platform_data['name']
                       )); ?>"
                       style="--platform-color: <?php echo esc_attr($platform_data['color']); ?>">
                        <span class="ess-icon">
                            <?php echo $this->get_platform_icon($platform); ?>
                        </span>
                        <?php if ($show_labels): ?>
                            <span class="ess-label"><?php echo esc_html($platform_data['name']); ?></span>
                        <?php endif; ?>
                        <?php echo wp_kses($share_count_display, array(
                            'span' => array(
                                'class' => array()
                            )
                        )); ?>
                    </a>
                <?php endif; ?>
            <?php endforeach; ?>

            <?php if ($show_more): ?>
                <!-- More Button for Popup -->
                <a href="#" 
                   class="ess-share-button ess-more-button ess-style-<?php echo esc_attr($args['style']); ?>" 
                   title="<?php echo esc_attr__('More sharing options', 'easy-share-solution'); ?>"
                   aria-label="<?php echo esc_attr__('Show all sharing options', 'easy-share-solution'); ?>"
                   role="button"
                   style="--platform-color: #6c757d;">
                    <span class="ess-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                        </svg>
                    </span>
                    <?php if ($show_labels): ?>
                        <span class="ess-label"><?php echo esc_html__('More', 'easy-share-solution'); ?></span>
                    <?php endif; ?>
                </a>

                <!-- Popup with ALL Platforms -->
                <div class="ess-share-popup" style="display: none;" data-display-mode="<?php echo esc_attr($this->get_popup_display_mode()); ?>">
                    <div class="ess-popup-overlay"></div>
                    <div class="ess-popup-content">
                        <div class="ess-popup-header">
                            <h3><?php echo esc_html__('Share this content', 'easy-share-solution'); ?></h3>
                            <a href="#" class="ess-popup-close" aria-label="<?php echo esc_attr__('Close sharing popup', 'easy-share-solution'); ?>" role="button">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                                </svg>
                            </a>
                        </div>
                        <div class="ess-popup-body">
                            <div class="ess-popup-platforms">
                                <?php 
                                $all_platforms = $this->get_platforms_data();
                                $categories = $this->get_platform_categories();
                                ?>
                                
                                <?php foreach ($categories as $category_key => $category_name): ?>
                                    <?php $category_platforms = $this->get_platforms_by_category($category_key); ?>
                                    <?php if (!empty($category_platforms)): ?>
                                        <div class="ess-popup-category">
                                            <h4 class="ess-category-title"><?php echo esc_html($category_name); ?></h4>
                                            <div class="ess-category-platforms">
                                                <?php foreach ($category_platforms as $platform_key => $platform_data): ?>
                                                    <a href="#" 
                                                       class="ess-popup-platform ess-platform-<?php echo esc_attr($platform_key); ?>" 
                                                       data-platform="<?php echo esc_attr($platform_key); ?>"
                                                       data-url="<?php echo esc_attr($platform_data['shareUrl']); ?>"
                                                       title="<?php echo esc_attr(sprintf(
                                                           /* translators: %s: social media platform name */
                                                           __('Share on %s', 'easy-share-solution'), 
                                                           $platform_data['name']
                                                       )); ?>"
                                                       style="--platform-color: <?php echo esc_attr($platform_data['color']); ?>">
                                                        <span class="ess-popup-icon">
                                                            <?php echo $this->get_platform_icon($platform_key); ?>
                                                        </span>
                                                        <span class="ess-popup-label"><?php echo esc_html($platform_data['name']); ?></span>
                                                    </a>
                                                <?php endforeach; ?>
                                            </div>
                                        </div>
                                    <?php endif; ?>
                                <?php endforeach; ?>
                            </div>
                        </div>
                    </div>
                </div>
            <?php endif; ?>
        </div>
        <?php
        
        return ob_get_clean();
    }
    
    /**
     * Enqueue frontend scripts and styles
     */
    public function enqueue_scripts() {
        $settings = EasyShare_Settings::get_settings();
        
        // Check if plugin is enabled
        if (!isset($settings['enabled']) || !$settings['enabled']) {
            return;
        }
        
        // Get advanced settings
        $async_loading = isset($settings['async_loading']) ? $settings['async_loading'] : true;
        $load_priority = isset($settings['load_priority']) ? $settings['load_priority'] : 10;
        $lazy_loading = isset($settings['lazy_loading']) ? $settings['lazy_loading'] : false;
        $minify_css = isset($settings['minify_css']) ? $settings['minify_css'] : false;
        $minify_js = isset($settings['minify_js']) ? $settings['minify_js'] : false;
        $cache_enabled = isset($settings['cache_enabled']) ? $settings['cache_enabled'] : true;
        
        // Determine CSS file
        $css_file = $minify_css ? 'frontend.min.css' : 'frontend.css';
        $css_path = EASY_SHARE_PLUGIN_URL . 'assets/css/' . $css_file;
        
        // Check if minified version exists, fallback to regular
        if ($minify_css && !file_exists(EASY_SHARE_PLUGIN_DIR . 'assets/css/frontend.min.css')) {
            $css_file = 'frontend.css';
            $css_path = EASY_SHARE_PLUGIN_URL . 'assets/css/' . $css_file;
        }
        
        // Determine version for cache busting
        $version = $cache_enabled ? EASY_SHARE_VERSION : EASY_SHARE_VERSION . '-' . time();
        
        // Enqueue styles with priority consideration
        wp_enqueue_style(
            'easy-share-frontend',
            $css_path,
            array(),
            $version
        );
        
        // Enqueue content icon presets CSS
        wp_enqueue_style(
            'easy-share-content-icons',
            EASY_SHARE_PLUGIN_URL . 'assets/css/content-icon-presets.css',
            array('easy-share-frontend'),
            $version
        );
        
        // Determine JS file
        $js_file = $minify_js ? 'frontend.min.js' : 'frontend.js';
        $js_path = EASY_SHARE_PLUGIN_URL . 'assets/js/' . $js_file;
        
        // Check if minified version exists, fallback to regular
        if ($minify_js && !file_exists(EASY_SHARE_PLUGIN_DIR . 'assets/js/frontend.min.js')) {
            $js_file = 'frontend.js';
            $js_path = EASY_SHARE_PLUGIN_URL . 'assets/js/' . $js_file;
        }
        
        // Enqueue script with advanced settings
        wp_enqueue_script(
            'easy-share-frontend',
            $js_path,
            array('jquery'),
            $version,
            true // Always load in footer
        );
        
        // Apply async loading if enabled
        if ($async_loading) {
            add_filter('script_loader_tag', array($this, 'add_async_attribute'), $load_priority, 2);
        }
        
        // Localize script with enhanced settings
        wp_localize_script(
            'easy-share-frontend',
            'easyShareFrontend',
            array(
                'ajaxUrl' => admin_url('admin-ajax.php'),
                'nonce' => wp_create_nonce('easy_share_nonce'),
                'currentUrl' => get_permalink(),
                'currentTitle' => get_the_title(),
                'currentPostId' => get_the_ID(),
                'copySuccessMessage' => __('Link copied to clipboard!', 'easy-share-solution'),
                'copyErrorMessage' => __('Failed to copy link', 'easy-share-solution'),
                'lazyLoading' => $lazy_loading,
                'cacheEnabled' => true,
                'cacheDuration' => 300, // 5 minutes
                'rateLimiting' => isset($settings['rate_limiting']) ? $settings['rate_limiting'] : array(),
                'deviceRestrictions' => isset($settings['device_restrictions']) ? $settings['device_restrictions'] : array(
                    'mobile' => true,
                    'tablet' => true,
                    'desktop' => true
                )
            )
        );
    }
    
    /**
     * Check advanced restrictions (device, user role, geographic, time, exclusions)
     */
    private function check_advanced_restrictions($settings) {
        // Device restrictions
        if (isset($settings['device_restrictions'])) {
            $device_restrictions = $settings['device_restrictions'];
            $user_agent = isset($_SERVER['HTTP_USER_AGENT']) ? sanitize_text_field(wp_unslash($_SERVER['HTTP_USER_AGENT'])) : '';
            
            // Simple device detection
            $is_mobile = wp_is_mobile();
            $is_tablet = (preg_match('/(tablet|ipad|playbook|silk)|(android(?!.*mobile))/i', $user_agent));
            $is_desktop = !$is_mobile && !$is_tablet;
            
            if (($is_mobile && !isset($device_restrictions['mobile'])) || 
                ($is_mobile && isset($device_restrictions['mobile']) && !$device_restrictions['mobile'])) {
                return false;
            }
            
            if (($is_tablet && !isset($device_restrictions['tablet'])) || 
                ($is_tablet && isset($device_restrictions['tablet']) && !$device_restrictions['tablet'])) {
                return false;
            }
            
            if (($is_desktop && !isset($device_restrictions['desktop'])) || 
                ($is_desktop && isset($device_restrictions['desktop']) && !$device_restrictions['desktop'])) {
                return false;
            }
        }
        
        // User role restrictions
        if (isset($settings['user_role_restrictions']) && !empty($settings['user_role_restrictions'])) {
            $current_user = wp_get_current_user();
            $user_roles = $current_user->roles;
            $allowed_roles = $settings['user_role_restrictions'];
            
            // If no user roles match allowed roles, restrict access
            if (empty(array_intersect($user_roles, $allowed_roles)) && !empty($allowed_roles)) {
                return false;
            }
        }
        
        // Exclusions check
        $current_post_id = get_the_ID();
        
        // Page exclusions
        if (isset($settings['exclude_pages']) && is_array($settings['exclude_pages']) && in_array($current_post_id, $settings['exclude_pages'])) {
            return false;
        }
        
        // Post exclusions
        if (isset($settings['exclude_posts']) && is_array($settings['exclude_posts']) && in_array($current_post_id, $settings['exclude_posts'])) {
            return false;
        }
        
        // Category exclusions
        if (isset($settings['exclude_categories']) && is_array($settings['exclude_categories'])) {
            $post_categories = get_the_category($current_post_id);
            foreach ($post_categories as $category) {
                if (in_array($category->term_id, $settings['exclude_categories'])) {
                    return false;
                }
            }
        }
        
        // Tag exclusions
        if (isset($settings['exclude_tags']) && is_array($settings['exclude_tags'])) {
            $post_tags = get_the_tags($current_post_id);
            if ($post_tags) {
                foreach ($post_tags as $tag) {
                    if (in_array($tag->term_id, $settings['exclude_tags'])) {
                        return false;
                    }
                }
            }
        }
        
        // Time restrictions
        if (isset($settings['time_restrictions']) && isset($settings['time_restrictions']['enabled']) && $settings['time_restrictions']['enabled']) {
            $current_time = current_time('H:i');
            $start_time = isset($settings['time_restrictions']['start_time']) ? $settings['time_restrictions']['start_time'] : '00:00';
            $end_time = isset($settings['time_restrictions']['end_time']) ? $settings['time_restrictions']['end_time'] : '23:59';
            
            if ($current_time < $start_time || $current_time > $end_time) {
                return false;
            }
        }
        
        return true;
    }
    
    /**
     * Add async attribute to script tags for better performance
     */
    public function add_async_attribute($tag, $handle) {
        if ('easy-share-frontend' === $handle) {
            return str_replace('<script ', '<script async ', $tag);
        }
        return $tag;
    }
    
    /**
     * Add floating panel to footer
     */
    public function add_floating_panel() {
        $settings = EasyShare_Settings::get_settings();
        
        // Check if plugin is enabled
        if (!isset($settings['enabled']) || !$settings['enabled']) {
            return;
        }
        
        // Check if floating panel is enabled in display positions
        $display_positions = isset($settings['display_positions']) ? $settings['display_positions'] : array();
        $floating_enabled = isset($display_positions['floating_panel']) ? $display_positions['floating_panel'] : true;
        
        if (!$floating_enabled) {
            return;
        }
        
        // Check page restrictions
        if (!$this->should_show_floating_panel()) {
            return;
        }
        
        // Get platforms and design settings
        $platforms = isset($settings['selected_platforms']) ? $settings['selected_platforms'] : array('facebook', 'x_com', 'linkedin', 'whatsapp', 'pinterest');
        $design_settings = isset($settings['floating_design']) ? $settings['floating_design'] : array();
        $show_count = isset($settings['show_count']) ? $settings['show_count'] : false;
        
        // Render the floating panel
        echo wp_kses($this->render_comprehensive_floating_panel($platforms, $design_settings, $show_count), self::get_allowed_html_tags());
        
        // Render the floating popup with proper categories and grid
        echo wp_kses($this->render_floating_popup(), self::get_allowed_html_tags());
    }
    
    /**
     * Add floating popup to footer
     */
    public function add_floating_popup() {
        // Check if settings class is available (should be loaded by settings loader)
        if (!class_exists('EasyShare_Settings')) {
            return; // Settings not loaded, skip
        }
        
        $settings = EasyShare_Settings::get_settings();
        
        // Only add popup if floating panel is enabled
        if (!isset($settings['show_floating_panel']) || !$settings['show_floating_panel']) {
            return;
        }
        
        // Use the same logic as should_show_floating_panel for consistency
        if (!$this->should_show_floating_panel()) {
            return;
        }
        
        // Get platforms and design settings
        $platforms = isset($settings['selected_platforms']) ? $settings['selected_platforms'] : array('facebook', 'x_com', 'linkedin');
        $design_settings = isset($settings['floating_design']) ? $settings['floating_design'] : array();
        $show_count = isset($settings['show_count']) ? $settings['show_count'] : false;
        
        echo wp_kses($this->render_comprehensive_floating_panel($platforms, $design_settings, $show_count), self::get_allowed_html_tags());
    }
    
    /**
     * Render comprehensive floating panel with all design options
     */
    private function render_comprehensive_floating_panel($platforms, $design_settings, $show_count = false) {
        // Get background settings from React-based settings
        $background_style = isset($design_settings['background_style']) ? $design_settings['background_style'] : 'solid';
        $background_color = isset($design_settings['background_color']) ? $design_settings['background_color'] : '#ffffff';
        
        // Get border settings from React-based settings
        $border_width = isset($design_settings['border_width']) ? $design_settings['border_width'] : 0;
        $border_color = isset($design_settings['border_color']) ? $design_settings['border_color'] : '#e0e0e0';
        $border_radius = isset($design_settings['border_radius']) ? $design_settings['border_radius'] : 12;
        
        // Get other design settings with defaults
        $container_bg_type = $background_style; // Use background_style for legacy compatibility
        $container_bg_color = $background_color; // Use background_color for legacy compatibility
        $container_bg_alpha = isset($design_settings['container_background_alpha']) ? $design_settings['container_background_alpha'] : 1.0;
        $container_gradient_start = isset($design_settings['container_gradient_start']) ? $design_settings['container_gradient_start'] : '#ffffff';
        $container_gradient_end = isset($design_settings['container_gradient_end']) ? $design_settings['container_gradient_end'] : '#f0f0f0';
        $container_gradient_direction = isset($design_settings['container_gradient_direction']) ? $design_settings['container_gradient_direction'] : 'to_bottom';
        $container_border_radius = $border_radius; // Use React border_radius setting
        $container_shadow_enabled = isset($design_settings['container_shadow_enabled']) ? $design_settings['container_shadow_enabled'] : true;
        $container_shadow_enabled = isset($design_settings['container_shadow_enabled']) ? $design_settings['container_shadow_enabled'] : true;
        $container_padding = isset($design_settings['container_padding']) ? $design_settings['container_padding'] : 12;
        $glassmorphism_enabled = isset($design_settings['glassmorphism_enabled']) ? $design_settings['glassmorphism_enabled'] : false;
        $glassmorphism_blur = isset($design_settings['glassmorphism_blur']) ? $design_settings['glassmorphism_blur'] : 10;
        $glassmorphism_opacity = isset($design_settings['glassmorphism_opacity']) ? $design_settings['glassmorphism_opacity'] : 0.8;
        
        $icon_primary_color = isset($design_settings['icon_primary_color']) ? $design_settings['icon_primary_color'] : '#007cba';
        $icon_secondary_color = isset($design_settings['icon_secondary_color']) ? $design_settings['icon_secondary_color'] : '#ffffff';
        $icon_hover_color = isset($design_settings['icon_hover_color']) ? $design_settings['icon_hover_color'] : '#005a87';
        $icon_background_type = isset($design_settings['icon_background_type']) ? $design_settings['icon_background_type'] : 'solid';
        $icon_gradient_start = isset($design_settings['icon_gradient_start']) ? $design_settings['icon_gradient_start'] : '#007cba';
        $icon_gradient_end = isset($design_settings['icon_gradient_end']) ? $design_settings['icon_gradient_end'] : '#005a87';
        $icon_border_enabled = isset($design_settings['icon_border_enabled']) ? $design_settings['icon_border_enabled'] : false;
        $icon_border_width = isset($design_settings['icon_border_width']) ? $design_settings['icon_border_width'] : 0;
        $icon_border_color = isset($design_settings['icon_border_color']) ? $design_settings['icon_border_color'] : '#007cba';
        $icon_size = isset($design_settings['icon_size']) ? $design_settings['icon_size'] : 40;
        $icon_spacing = isset($design_settings['icon_spacing']) ? $design_settings['icon_spacing'] : 8;
        $icon_shape = isset($design_settings['icon_shape']) ? $design_settings['icon_shape'] : 'circle';
        $icon_style = isset($design_settings['icon_style']) ? $design_settings['icon_style'] : 'circle';
        $icon_padding = isset($design_settings['icon_padding']) && $design_settings['icon_padding'] !== '' ? $design_settings['icon_padding'] : 8;
        $use_platform_colors = isset($design_settings['use_platform_colors']) ? $design_settings['use_platform_colors'] : true;
        $icon_color = isset($design_settings['icon_color']) ? $design_settings['icon_color'] : '#007cba';
        $toggle_button_color = isset($design_settings['toggle_button_color']) ? $design_settings['toggle_button_color'] : '#1e88e5';
        $more_button_color = isset($design_settings['more_button_color']) ? $design_settings['more_button_color'] : '#6c757d';
        $show_labels = isset($design_settings['show_labels']) ? $design_settings['show_labels'] : true;
        $label_position = isset($design_settings['label_position']) ? $design_settings['label_position'] : 'right';
        
        $entrance_animation = isset($design_settings['entrance_animation']) ? $design_settings['entrance_animation'] : 'fadeIn';
        $hover_animation = isset($design_settings['hover_animation']) ? $design_settings['hover_animation'] : 'scale';
        $animation_duration = isset($design_settings['animation_duration']) ? $design_settings['animation_duration'] : 300;
        $animation_delay = isset($design_settings['animation_delay']) ? $design_settings['animation_delay'] : 0;
        $staggered_animation = isset($design_settings['staggered_animation']) ? $design_settings['staggered_animation'] : false;
        $stagger_delay = isset($design_settings['stagger_delay']) ? $design_settings['stagger_delay'] : 100;
        $hover_color_change = isset($design_settings['hover_color_change']) ? $design_settings['hover_color_change'] : false;
        $hover_color = isset($design_settings['hover_color']) ? $design_settings['hover_color'] : '#ff6b6b';
        $continuous_animation = isset($design_settings['continuous_animation']) ? $design_settings['continuous_animation'] : 'none';
        $stagger_enabled = isset($design_settings['stagger_enabled']) ? $design_settings['stagger_enabled'] : true;
        
        // Position & layout settings
        $panel_position = isset($design_settings['panel_position']) ? $design_settings['panel_position'] : 'center-left';
        $position_type = isset($design_settings['position_type']) ? $design_settings['position_type'] : 'fixed_left';
        $horizontal_offset = isset($design_settings['horizontal_offset']) ? $design_settings['horizontal_offset'] : 20;
        $icon_arrangement = isset($design_settings['icon_arrangement']) ? $design_settings['icon_arrangement'] : 'vertical';
        $panel_padding = isset($design_settings['panel_padding']) ? $design_settings['panel_padding'] : 2;
        $z_index = isset($design_settings['z_index']) ? $design_settings['z_index'] : 9999;
        $auto_hide = isset($design_settings['auto_hide']) ? $design_settings['auto_hide'] : false;
        $auto_hide_delay = isset($design_settings['auto_hide_delay']) ? $design_settings['auto_hide_delay'] : 3;
        
        // Responsive design settings
        $show_on_mobile = isset($design_settings['show_on_mobile']) ? $design_settings['show_on_mobile'] : true;
        $show_on_tablet = isset($design_settings['show_on_tablet']) ? $design_settings['show_on_tablet'] : true;
        $mobile_icon_size = isset($design_settings['mobile_icon_size']) ? $design_settings['mobile_icon_size'] : 36;
        $mobile_position = isset($design_settings['mobile_position']) ? $design_settings['mobile_position'] : 'center-left';
        $mobile_arrangement = isset($design_settings['mobile_arrangement']) ? $design_settings['mobile_arrangement'] : 'vertical';
        $mobile_icons_display = isset($design_settings['mobile_icons_display']) ? $design_settings['mobile_icons_display'] : 'fold';
        $mobile_breakpoint = isset($design_settings['mobile_breakpoint']) ? $design_settings['mobile_breakpoint'] : 768;
        $tablet_breakpoint = isset($design_settings['tablet_breakpoint']) ? $design_settings['tablet_breakpoint'] : 1024;
        
        // Get general settings for additional features
        $general_settings = EasyShare_Settings::get_settings();
        $auto_hide_scroll = isset($general_settings['floating_panel_auto_hide']) ? $general_settings['floating_panel_auto_hide'] : true;
        $display_mode = isset($general_settings['floating_panel_icons_display']) ? $general_settings['floating_panel_icons_display'] : 'expand';
        
        // Design preset support
        $active_preset = isset($design_settings['active_preset']) ? $design_settings['active_preset'] : '';
        
        // Build CSS variables for dynamic styling
        $css_variables = array(
            '--ess-container-border-radius' => $container_border_radius . 'px',
            '--ess-container-padding' => $container_padding . 'px',
            '--ess-icon-primary-color' => $icon_primary_color,
            '--ess-icon-secondary-color' => $icon_secondary_color,
            '--ess-icon-hover-color' => $icon_hover_color,
            '--ess-icon-size' => $icon_size . 'px',
            '--ess-icon-spacing' => $icon_spacing . 'px',
            '--ess-icon-padding' => $icon_padding . 'px',
            '--ess-z-index' => $z_index,
            '--ess-animation-duration' => $animation_duration . 'ms',
            '--ess-animation-delay' => $animation_delay . 'ms',
            '--ess-stagger-delay' => $stagger_delay . 'ms',
            '--ess-hover-color' => $hover_color,
            '--ess-panel-padding' => $panel_padding . 'px',
            '--ess-horizontal-offset' => $horizontal_offset . 'px',
            '--ess-auto-hide-delay' => $auto_hide_delay . 's',
            '--ess-mobile-icon-size' => $mobile_icon_size . 'px',
            '--ess-mobile-breakpoint' => $mobile_breakpoint . 'px',
            '--ess-tablet-breakpoint' => $tablet_breakpoint . 'px'
        );
        
        // Add icon color based on platform color setting
        if (!$use_platform_colors) {
            $css_variables['--ess-icon-custom-color'] = $icon_color;
        }
        
        // Add toggle and more button colors
        $css_variables['--ess-toggle-button-color'] = $toggle_button_color;
        $css_variables['--ess-more-button-color'] = $more_button_color;
        
        // Add panel border CSS variables
        if ($border_width > 0) {
            $css_variables['--ess-panel-border'] = $border_width . 'px solid ' . $border_color;
            $css_variables['--ess-panel-border-width'] = $border_width . 'px';
            $css_variables['--ess-panel-border-color'] = $border_color;
        } else {
            $css_variables['--ess-panel-border'] = 'none';
            $css_variables['--ess-panel-border-width'] = '0px';
        }
        
        // Handle icon background based on type
        if ($icon_background_type === 'gradient') {
            $css_variables['--ess-icon-background'] = 'linear-gradient(135deg, ' . $icon_gradient_start . ', ' . $icon_gradient_end . ')';
        } else {
            $css_variables['--ess-icon-background'] = $icon_primary_color;
        }
        
        // Add icon border if width > 0
        if ($icon_border_width > 0) {
            $css_variables['--ess-icon-border'] = $icon_border_width . 'px solid ' . $icon_border_color;
            $css_variables['--ess-icon-border-width'] = $icon_border_width . 'px';
            $css_variables['--ess-icon-border-color'] = $icon_border_color;
        } else {
            $css_variables['--ess-icon-border'] = 'none';
            $css_variables['--ess-icon-border-width'] = '0px';
        }
        
        // Handle background based on background_style
        switch ($background_style) {
            case 'gradient':
                $gradient_start = isset($design_settings['gradient_start_color']) ? $design_settings['gradient_start_color'] : '#007cba';
                $gradient_end = isset($design_settings['gradient_end_color']) ? $design_settings['gradient_end_color'] : '#005a87';
                $gradient_direction = isset($design_settings['gradient_direction']) ? $design_settings['gradient_direction'] : '135deg';
                $css_variables['--ess-container-bg-color'] = 'linear-gradient(' . $gradient_direction . ', ' . $gradient_start . ', ' . $gradient_end . ')';
                break;
                
            case 'glass':
            case 'glassmorphism':
                // Glassmorphism effect with backdrop blur and transparency
                $bg_alpha = 0.1; // More transparent for glass effect
                $css_variables['--ess-container-bg-color'] = $this->hex_to_rgba($background_color, $bg_alpha);
                $css_variables['--ess-backdrop-filter'] = 'blur(10px)';
                $css_variables['--ess-border'] = '1px solid rgba(255,255,255,0.2)';
                break;
                
            case 'neomorphism':
                // Soft shadow effect for neomorphism
                $css_variables['--ess-container-bg-color'] = $background_color;
                $css_variables['--ess-box-shadow'] = 'inset 5px 5px 10px rgba(0,0,0,0.1), inset -5px -5px 10px rgba(255,255,255,0.8)';
                break;
                
            case 'transparent':
                $css_variables['--ess-container-bg-color'] = 'transparent';
                break;
                
            case 'solid':
            default:
                $css_variables['--ess-container-bg-color'] = $this->hex_to_rgba($background_color, $container_bg_alpha);
                break;
        }
        
        // Add glassmorphism effects if enabled
        if ($glassmorphism_enabled) {
            $css_variables['--ess-glassmorphism-blur'] = $glassmorphism_blur . 'px';
            $css_variables['--ess-glassmorphism-opacity'] = $glassmorphism_opacity;
            $css_variables['--ess-backdrop-filter'] = 'blur(' . $glassmorphism_blur . 'px)';
        }
        
        // Add shadow if enabled
        if ($container_shadow_enabled) {
            $shadow_blur = isset($design_settings['container_shadow_blur']) ? $design_settings['container_shadow_blur'] : 10;
            $shadow_color = isset($design_settings['container_shadow_color']) ? $design_settings['container_shadow_color'] : '#00000020';
            $css_variables['--ess-container-shadow'] = '0 ' . ($shadow_blur / 2) . 'px ' . $shadow_blur . 'px ' . $shadow_color;
        } else {
            $css_variables['--ess-container-shadow'] = 'none';
        }

        // Add React-based panel shadow settings
        $enable_shadow = isset($design_settings['enable_shadow']) ? $design_settings['enable_shadow'] : false;
        if ($enable_shadow) {
            $shadow_blur = isset($design_settings['shadow_blur']) ? intval($design_settings['shadow_blur']) : 20;
            $shadow_spread = isset($design_settings['shadow_spread']) ? intval($design_settings['shadow_spread']) : 0;
            $shadow_opacity = isset($design_settings['shadow_opacity']) ? floatval($design_settings['shadow_opacity']) : 0.15;
            
            // Generate panel shadow CSS
            $shadow_color = 'rgba(0, 0, 0, ' . $shadow_opacity . ')';
            $css_variables['--ess-panel-shadow'] = '0 4px ' . $shadow_blur . 'px ' . $shadow_spread . 'px ' . $shadow_color;
        } else {
            $css_variables['--ess-panel-shadow'] = 'none';
        }
        
        // Calculate position styles - prioritize new panel_position over legacy position_type
        // For new panel positions, we'll rely on CSS classes instead of inline styles
        if (in_array($panel_position, ['top-left', 'top-right', 'bottom-left', 'bottom-right', 'center-left', 'center-right'])) {
            $position_styles = ''; // Let CSS classes handle positioning
        } else {
            $position_styles = $this->calculate_position_styles($panel_position, $horizontal_offset, $position_type);
        }
        
        // Generate CSS variables string
        $css_vars_string = '';
        foreach ($css_variables as $var => $value) {
            $css_vars_string .= $var . ':' . $value . ';';
        }
        
        ob_start();
        ?>
        <div class="ess-floating-panel ess-comprehensive-design 
                    ess-position-<?php echo esc_attr($panel_position); ?>
                    ess-old-position-<?php echo esc_attr($position_type); ?>
                    ess-shape-<?php echo esc_attr($icon_shape); ?>
                    ess-display-<?php echo esc_attr($display_mode); ?>
                    ess-arrangement-<?php echo esc_attr($icon_arrangement); ?>
                    ess-animation-<?php echo esc_attr($entrance_animation); ?>
                    ess-hover-<?php echo esc_attr($hover_animation); ?>
                    ess-continuous-<?php echo esc_attr($continuous_animation); ?>
                    ess-bg-<?php echo esc_attr($container_bg_type); ?>
                    <?php echo $stagger_enabled ? 'ess-stagger-enabled' : ''; ?>
                    <?php echo $staggered_animation ? 'ess-staggered-animation' : ''; ?>
                    <?php echo $hover_color_change ? 'ess-hover-color-change' : ''; ?>
                    <?php echo $auto_hide ? 'ess-auto-hide' : ''; ?>
                    <?php echo $auto_hide_scroll ? 'ess-scroll-auto-hide' : ''; ?>
                    <?php echo $glassmorphism_enabled ? 'ess-glassmorphism-enabled' : ''; ?>
                    <?php echo !$show_on_mobile ? 'ess-hide-mobile' : ''; ?>
                    <?php echo !$show_on_tablet ? 'ess-hide-tablet' : ''; ?>
                    <?php echo $show_on_mobile ? 'ess-mobile-position-' . esc_attr($mobile_position) : ''; ?>
                    <?php echo $show_on_mobile ? 'ess-mobile-arrangement-' . esc_attr($mobile_arrangement) : ''; ?>
                    <?php echo $show_on_mobile ? 'ess-mobile-display-' . esc_attr($mobile_icons_display) : ''; ?>
                    <?php echo !$use_platform_colors ? 'ess-use-custom-colors' : ''; ?>
                    <?php echo $show_labels ? 'ess-labels-enabled' : ''; ?>
                    <?php echo $active_preset ? 'ess-preset-' . esc_attr($active_preset) : ''; ?>"
             style="<?php echo esc_attr($css_vars_string . $position_styles); ?>"
             data-icon-size="<?php echo esc_attr($this->convert_size_to_name($icon_size)); ?>"
             data-panel-position="<?php echo esc_attr($panel_position); ?>"
             data-icon-arrangement="<?php echo esc_attr($icon_arrangement); ?>"
             data-panel-padding="<?php echo esc_attr($panel_padding); ?>"
             data-horizontal-offset="<?php echo esc_attr($horizontal_offset); ?>"
             data-auto-hide="<?php echo esc_attr($auto_hide ? 'true' : 'false'); ?>"
             data-auto-hide-delay="<?php echo esc_attr($auto_hide_delay); ?>"
             data-auto-hide-scroll="<?php echo esc_attr($auto_hide_scroll ? 'true' : 'false'); ?>"
             data-entrance-animation="<?php echo esc_attr($entrance_animation); ?>"
             data-hover-animation="<?php echo esc_attr($hover_animation); ?>"
             data-animation-duration="<?php echo esc_attr($animation_duration); ?>"
             data-animation-delay="<?php echo esc_attr($animation_delay); ?>"
             data-staggered-animation="<?php echo esc_attr($staggered_animation ? 'true' : 'false'); ?>"
             data-stagger-delay="<?php echo esc_attr($stagger_delay); ?>"
             data-hover-color-change="<?php echo esc_attr($hover_color_change ? 'true' : 'false'); ?>"
             data-hover-color="<?php echo esc_attr($hover_color); ?>"
             data-continuous-animation="<?php echo esc_attr($continuous_animation); ?>"
             data-show-on-mobile="<?php echo esc_attr($show_on_mobile ? 'true' : 'false'); ?>"
             data-show-on-tablet="<?php echo esc_attr($show_on_tablet ? 'true' : 'false'); ?>"
             data-mobile-icon-size="<?php echo esc_attr($mobile_icon_size); ?>"
             data-mobile-position="<?php echo esc_attr($mobile_position); ?>"
             data-mobile-arrangement="<?php echo esc_attr($mobile_arrangement); ?>"
             data-mobile-breakpoint="<?php echo esc_attr($mobile_breakpoint); ?>"
             data-tablet-breakpoint="<?php echo esc_attr($tablet_breakpoint); ?>">
            
            <div class="ess-panel-container">
                <!-- Toggle Button -->
                <div class="ess-panel-toggle">
                    <a href="#" class="ess-toggle-button ess-style-<?php echo esc_attr($icon_style); ?>" 
                       aria-label="<?php echo esc_attr__('Toggle share panel', 'easy-share-solution'); ?>" 
                       role="button"
                       style="width: <?php echo esc_attr($icon_size); ?>px; height: <?php echo esc_attr($icon_size); ?>px;">
                        <span class="ess-toggle-icon">
                            <svg width="<?php echo esc_attr($icon_size * 0.6); ?>" height="<?php echo esc_attr($icon_size * 0.6); ?>" viewBox="0 0 24 24" fill="none">
                                <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z" fill="currentColor"/>
                            </svg>
                        </span>
                        <span class="ess-close-icon" style="display: none;">
                            <svg width="<?php echo esc_attr($icon_size * 0.6); ?>" height="<?php echo esc_attr($icon_size * 0.6); ?>" viewBox="0 0 24 24" fill="none">
                                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill="currentColor"/>
                            </svg>
                        </span>
                    </a>
                </div>
                
                <!-- Panel Content -->
                <div class="ess-panel-content" <?php echo $display_mode === 'fold' ? 'style="display: none;"' : ''; ?>>
                <?php 
                $delay_counter = 0;
                foreach ($platforms as $platform): 
                    $platform_data = $this->get_platform_data($platform);
                    if (!$platform_data) continue;
                    
                    $style_delay = $stagger_enabled ? 'animation-delay: ' . ($delay_counter * $stagger_delay) . 'ms;' : '';
                    
                    // Get share count for this platform if enabled
                    $share_count_display = '';
                    if ($show_count) {
                        $count = $this->get_platform_share_count($platform);
                        if ($count > 0) {
                            $share_count_display = '<span class="ess-share-count">' . $this->format_share_count($count) . '</span>';
                        }
                    }
                ?>
                    <a href="#" 
                       class="ess-share-button ess-platform-<?php echo esc_attr($platform); ?> ess-style-<?php echo esc_attr($icon_style); ?> ess-label-position-<?php echo esc_attr($label_position); ?><?php echo $show_count ? ' ess-with-count' : ''; ?>"
                       data-platform="<?php echo esc_attr($platform); ?>"
                       data-url="<?php echo esc_attr($platform_data['shareUrl']); ?>"
                       title="<?php echo esc_attr(sprintf(
                           /* translators: %s: social media platform name */
                           __('Share on %s', 'easy-share-solution'), 
                           $platform_data['name']
                       )); ?>"
                       style="<?php echo esc_attr($style_delay); ?>"
                       aria-label="<?php echo esc_attr(sprintf(
                           /* translators: %s: social media platform name */
                           __('Share on %s', 'easy-share-solution'), 
                           $platform_data['name']
                       )); ?>">
                        <span class="ess-icon" style="color: <?php echo esc_attr($platform_data['color']); ?>">
                            <?php echo $this->get_platform_icon($platform); ?>
                        </span>
                        <?php if ($show_labels): ?>
                            <span class="ess-label"><?php echo esc_html($platform_data['name']); ?></span>
                        <?php endif; ?>
                        <?php echo wp_kses($share_count_display, self::get_allowed_html_tags()); ?>
                    </a>
                <?php 
                    $delay_counter++;
                endforeach; 
                ?>
                
                <!-- Plus Icon - More Button for Floating Panel Popup -->
                <a href="#" 
                   class="ess-floating-more-button ess-style-<?php echo esc_attr($icon_style); ?>" 
                   title="<?php echo esc_attr__('More sharing options', 'easy-share-solution'); ?>"
                   aria-label="<?php echo esc_attr__('Show all sharing options', 'easy-share-solution'); ?>"
                   role="button"
                   style="--platform-color: #6c757d; width: <?php echo esc_attr($icon_size); ?>px; height: <?php echo esc_attr($icon_size); ?>px;">
                    <span class="ess-icon">
                        <svg width="<?php echo esc_attr($icon_size * 0.6); ?>" height="<?php echo esc_attr($icon_size * 0.6); ?>" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                        </svg>
                    </span>
                </a>
                </div>
            </div>
        </div>
        
        <!-- Add comprehensive CSS for the floating panel -->
        <!-- Dynamic CSS for responsive breakpoints -->
        <style>
        /* Comprehensive Responsive Design System */
        
        /* Mobile Styles */
        @media (max-width: <?php echo esc_attr($mobile_breakpoint); ?>px) {
            /* Mobile visibility control */
            <?php if (!$show_on_mobile): ?>
            .ess-floating-panel.ess-hide-mobile {
                display: none !important;
            }
            <?php else: ?>
            
            /* Mobile icon size override with high specificity */
            .ess-floating-panel,
            .ess-floating-panel .ess-share-button {
                --ess-icon-size: <?php echo esc_attr($mobile_icon_size); ?>px !important;
            }
            
            .ess-floating-panel .ess-share-button,
            .ess-floating-panel .ess-toggle-button {
                width: <?php echo esc_attr($mobile_icon_size); ?>px !important;
                height: <?php echo esc_attr($mobile_icon_size); ?>px !important;
            }
            
            /* Mobile position overrides */
            .ess-floating-panel.ess-mobile-position-bottom-left {
                bottom: 10px !important;
                left: 10px !important;
                right: auto !important;
                top: auto !important;
                transform: none !important;
            }
            
            .ess-floating-panel.ess-mobile-position-bottom-right {
                bottom: 10px !important;
                right: 10px !important;
                left: auto !important;
                top: auto !important;
                transform: none !important;
            }
            
            .ess-floating-panel.ess-mobile-position-bottom-center {
                bottom: 10px !important;
                left: 50% !important;
                right: auto !important;
                top: auto !important;
                transform: translateX(-50%) !important;
            }
            
            .ess-floating-panel.ess-mobile-position-top-left {
                top: 10px !important;
                left: 10px !important;
                right: auto !important;
                bottom: auto !important;
                transform: none !important;
            }
            
            .ess-floating-panel.ess-mobile-position-top-right {
                top: 10px !important;
                right: 10px !important;
                left: auto !important;
                bottom: auto !important;
                transform: none !important;
            }
            
            /* Mobile arrangement overrides */
            .ess-floating-panel.ess-mobile-arrangement-horizontal .ess-panel-content,
            .ess-floating-panel.ess-mobile-arrangement-horizontal .ess-panel-content.open {
                display: flex !important;
                flex-direction: row !important;
                gap: 6px !important;
                padding: 8px !important;
            }
            
            .ess-floating-panel.ess-mobile-arrangement-vertical .ess-panel-content,
            .ess-floating-panel.ess-mobile-arrangement-vertical .ess-panel-content.open {
                display: flex !important;
                flex-direction: column !important;
                gap: 6px !important;
                padding: 8px !important;
            }
            
            .ess-floating-panel.ess-mobile-arrangement-grid-2x2 .ess-panel-content,
            .ess-floating-panel.ess-mobile-arrangement-grid-2x2 .ess-panel-content.open {
                display: grid !important;
                grid-template-columns: repeat(2, 1fr) !important;
                gap: 6px !important;
                padding: 8px !important;
            }
            
            <?php endif; ?>
        }
        
        /* Tablet Styles */
        @media (min-width: <?php echo esc_attr($mobile_breakpoint + 1); ?>px) and (max-width: <?php echo esc_attr($tablet_breakpoint); ?>px) {
            /* Tablet visibility control */
            <?php if (!$show_on_tablet): ?>
            .ess-floating-panel.ess-hide-tablet {
                display: none !important;
            }
            <?php else: ?>
            
            /* Tablet-specific adjustments */
            .ess-floating-panel {
                --ess-icon-size: <?php echo esc_attr(min($icon_size + 2, 50)); ?>px;
                --ess-panel-padding: <?php echo esc_attr($panel_padding); ?>px;
            }
            
            <?php endif; ?>
        }
        
        /* Desktop and larger screens */
        @media (min-width: <?php echo esc_attr($tablet_breakpoint + 1); ?>px) {
            /* Full desktop experience */
            .ess-floating-panel {
                --ess-icon-size: <?php echo esc_attr($icon_size); ?>px;
                --ess-panel-padding: <?php echo esc_attr($panel_padding); ?>px;
            }
        }
        </style>
        
        <?php
        return ob_get_clean();
    }
    
    /**
     * Calculate position styles based on panel position
     */
    private function calculate_position_styles($panel_position, $horizontal_offset, $legacy_position_type = null) {
        $styles = '';
        
        // Use new panel_position if available, otherwise fall back to legacy position_type
        $position = $panel_position && $panel_position !== 'center-left' ? $panel_position : $legacy_position_type;
        
        switch ($position) {
            // New panel position values
            case 'top-left':
                $styles = "left: {$horizontal_offset}px; top: {$horizontal_offset}px;";
                break;
            case 'top-right':
                $styles = "right: {$horizontal_offset}px; top: {$horizontal_offset}px;";
                break;
            case 'bottom-left':
                $styles = "left: {$horizontal_offset}px; bottom: {$horizontal_offset}px;";
                break;
            case 'bottom-right':
                $styles = "right: {$horizontal_offset}px; bottom: {$horizontal_offset}px;";
                break;
            case 'center-left':
                $styles = "left: {$horizontal_offset}px; top: 50%; transform: translateY(-50%);";
                break;
            case 'center-right':
                $styles = "right: {$horizontal_offset}px; top: 50%; transform: translateY(-50%);";
                break;
            
            // Legacy position values for backward compatibility
            case 'fixed_left':
                $styles = "left: {$horizontal_offset}px; top: 20%;";
                break;
            case 'fixed_right':
                $styles = "right: {$horizontal_offset}px; top: 20%;";
                break;
            case 'fixed_top_left':
                $styles = "left: {$horizontal_offset}px; top: 20px;";
                break;
            case 'fixed_top_right':
                $styles = "right: {$horizontal_offset}px; top: 20px;";
                break;
            case 'fixed_bottom_left':
                $styles = "left: {$horizontal_offset}px; bottom: 20px;";
                break;
            case 'fixed_bottom_right':
                $styles = "right: {$horizontal_offset}px; bottom: 20px;";
                break;
            
            default:
                // Default to center-left
                $styles = "left: {$horizontal_offset}px; top: 50%; transform: translateY(-50%);";
        }
        
        return $styles;
    }
    
    /**
     * Convert hex color to rgba
     */
    private function hex_to_rgba($hex, $alpha = 1) {
        $hex = ltrim($hex, '#');
        
        if (strlen($hex) === 3) {
            $hex = $hex[0] . $hex[0] . $hex[1] . $hex[1] . $hex[2] . $hex[2];
        }
        
        $r = hexdec(substr($hex, 0, 2));
        $g = hexdec(substr($hex, 2, 2));
        $b = hexdec(substr($hex, 4, 2));
        
        return "rgba($r, $g, $b, $alpha)";
    }
    
    /**
     * Render floating panel with all configuration options
     */
    private function render_floating_panel($platforms, $horizontal_position, $vertical_position, $icon_style, $options = array()) {
        $defaults = array(
            'horizontal_offset' => 20,
            'auto_hide' => false,
            'mobile_display' => false,
            'icons_display' => 'expand',
            'icon_size' => 32
        );
        
        $options = array_merge($defaults, $options);
        
        // Calculate CSS positioning
        $css_styles = array();
        
        // Horizontal positioning
        if ($horizontal_position === 'left') {
            $css_styles[] = 'left: ' . $options['horizontal_offset'] . 'px';
        } else {
            $css_styles[] = 'right: ' . $options['horizontal_offset'] . 'px';
        }
        
        // Vertical positioning
        switch ($vertical_position) {
            case 'top':
                $css_styles[] = 'top: 20px';
                break;
            case 'bottom':
                $css_styles[] = 'bottom: 20px';
                break;
            case 'center':
            default:
                $css_styles[] = 'top: 50%';
                $css_styles[] = 'transform: translateY(-50%)';
                break;
        }
        
        $style_attr = implode('; ', $css_styles);
        
        ob_start();
        ?>
        <div class="ess-floating-panel 
                    ess-position-<?php echo esc_attr($horizontal_position); ?> 
                    ess-vertical-<?php echo esc_attr($vertical_position); ?>
                    <?php echo $options['auto_hide'] ? ' ess-auto-hide' : ''; ?>
                    <?php echo !$options['mobile_display'] ? ' ess-hide-mobile' : ''; ?>
                    ess-display-<?php echo esc_attr($options['icons_display']); ?>" 
             data-style="<?php echo esc_attr($icon_style); ?>"
             data-auto-hide="<?php echo $options['auto_hide'] ? 'true' : 'false'; ?>"
             style="<?php echo esc_attr($style_attr); ?>">
            
            <div class="ess-panel-toggle">
                <a href="#" class="ess-toggle-button ess-style-<?php echo esc_attr($icon_style); ?>" 
                   aria-label="<?php echo esc_attr__('Toggle share panel', 'easy-share-solution'); ?>" 
                   role="button"
                   style="width: <?php echo esc_attr($options['icon_size']); ?>px; height: <?php echo esc_attr($options['icon_size']); ?>px;">
                    <span class="ess-toggle-icon">
                        <svg width="<?php echo esc_attr($options['icon_size'] * 0.6); ?>" height="<?php echo esc_attr($options['icon_size'] * 0.6); ?>" viewBox="0 0 24 24" fill="none">
                            <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z" fill="currentColor"/>
                        </svg>
                    </span>
                    <span class="ess-close-icon" style="display: none;">
                        <svg width="<?php echo esc_attr($options['icon_size'] * 0.6); ?>" height="<?php echo esc_attr($options['icon_size'] * 0.6); ?>" viewBox="0 0 24 24" fill="none">
                            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill="currentColor"/>
                        </svg>
                    </span>
                </a>
            </div>
            
            <div class="ess-panel-content" <?php echo $options['icons_display'] === 'fold' ? 'style="display: none;"' : ''; ?>>
                <?php foreach ($platforms as $platform): ?>
                    <?php $platform_data = $this->get_platform_data($platform); ?>
                    <?php if ($platform_data): ?>
                        <a href="#" 
                           class="ess-share-button ess-platform-<?php echo esc_attr($platform); ?> ess-style-<?php echo esc_attr($icon_style); ?>" 
                           data-platform="<?php echo esc_attr($platform); ?>"
                           data-url="<?php echo esc_attr($platform_data['shareUrl']); ?>"
                           title="<?php echo esc_attr(sprintf(
                               /* translators: %s: social media platform name */
                               __('Share on %s', 'easy-share-solution'), 
                               $platform_data['name']
                           )); ?>"
                           style="--platform-color: <?php echo esc_attr($platform_data['color']); ?>; width: <?php echo esc_attr($options['icon_size']); ?>px; height: <?php echo esc_attr($options['icon_size']); ?>px;">
                            <span class="ess-icon">
                                <?php echo $this->get_platform_icon($platform); ?>
                            </span>
                        </a>
                    <?php endif; ?>
                <?php endforeach; ?>
                
                <!-- More Button for Floating Panel Popup -->
                <a href="#" 
                   class="ess-floating-more-button ess-style-<?php echo esc_attr($icon_style); ?>" 
                   title="<?php echo esc_attr__('More sharing options', 'easy-share-solution'); ?>"
                   aria-label="<?php echo esc_attr__('Show all sharing options', 'easy-share-solution'); ?>"
                   role="button"
                   style="--platform-color: #6c757d; width: <?php echo esc_attr($options['icon_size']); ?>px; height: <?php echo esc_attr($options['icon_size']); ?>px;">
                    <span class="ess-icon">
                        <svg width="<?php echo esc_attr($options['icon_size'] * 0.6); ?>" height="<?php echo esc_attr($options['icon_size'] * 0.6); ?>" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                        </svg>
                    </span>
                </a>
            </div>
        </div>
        
        <?php
        return ob_get_clean();
    }
    
    /**
     * Render floating popup (separate from panel)
     */
    public function render_floating_popup() {
        // Use the settings class instead of get_option directly
        $settings = EasyShare_Settings::get_settings();
        $display_mode = isset($settings['popup_display_mode']) ? $settings['popup_display_mode'] : 'icons_text';
        
        ob_start();
        ?>
        <!-- Floating Popup with ALL Platforms (Bottom of page) -->
        <div class="ess-floating-popup" style="display: none;" data-display-mode="<?php echo esc_attr($display_mode); ?>">
            <div class="ess-popup-overlay"></div>
            <div class="ess-popup-content">
                <div class="ess-popup-header">
                    <h3><?php echo esc_html__('Share this content', 'easy-share-solution'); ?></h3>
                    <a href="#" class="ess-popup-close" aria-label="<?php echo esc_attr__('Close sharing popup', 'easy-share-solution'); ?>" role="button">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                        </svg>
                    </a>
                </div>
                <div class="ess-popup-body">
                    <div class="ess-popup-platforms">
                        <?php 
                        $all_platforms = $this->get_platforms_data();
                        $categories = $this->get_platform_categories();
                        ?>
                        
                        <?php foreach ($categories as $category_key => $category_name): ?>
                            <?php $category_platforms = $this->get_platforms_by_category($category_key); ?>
                            <?php if (!empty($category_platforms)): ?>
                                <div class="ess-popup-category">
                                    <h4 class="ess-category-title"><?php echo esc_html($category_name); ?></h4>
                                    <div class="ess-category-platforms">
                                        <?php foreach ($category_platforms as $platform_key => $platform_data): ?>
                                            <a href="#" 
                                               class="ess-popup-platform ess-platform-<?php echo esc_attr($platform_key); ?>" 
                                               data-platform="<?php echo esc_attr($platform_key); ?>"
                                               data-url="<?php echo esc_attr($platform_data['shareUrl']); ?>"
                                               title="<?php echo esc_attr(sprintf(
                                                   /* translators: %s: social media platform name */
                                                   __('Share on %s', 'easy-share-solution'), 
                                                   $platform_data['name']
                                               )); ?>"
                                               style="--platform-color: <?php echo esc_attr($platform_data['color']); ?>">
                                                <span class="ess-popup-icon">
                                                    <?php echo $this->get_platform_icon($platform_key); ?>
                                                </span>
                                                <span class="ess-popup-label"><?php echo esc_html($platform_data['name']); ?></span>
                                            </a>
                                        <?php endforeach; ?>
                                    </div>
                                </div>
                            <?php endif; ?>
                        <?php endforeach; ?>
                    </div>
                </div>
            </div>
        </div>
        <?php
        return ob_get_clean();
    }
    
    /**
     * Track share action (AJAX)
     */
    public function track_share() {
        check_ajax_referer('easy_share_nonce', 'nonce');
        
        $platform = isset($_POST['platform']) ? sanitize_text_field(wp_unslash($_POST['platform'])) : '';
        $post_id = isset($_POST['post_id']) ? intval($_POST['post_id']) : 0;
        
        if (!$platform) {
            wp_send_json_error('Invalid platform');
            return;
        }
        
        // If post_id is 0, try to get it from URL or use homepage
        if ($post_id === 0) {
            $url = isset($_POST['url']) ? esc_url_raw(wp_unslash($_POST['url'])) : '';
            if ($url) {
                $post_id = url_to_postid($url);
            }
            
            // If still 0, track as homepage/general site share
            if ($post_id === 0) {
                $post_id = get_option('page_on_front') ? get_option('page_on_front') : 1;
            }
        }
        
        // Basic tracking - increment share count
        $current_count = get_post_meta($post_id, '_easy_share_count_' . $platform, true);
        $new_count = intval($current_count) + 1;
        update_post_meta($post_id, '_easy_share_count_' . $platform, $new_count);
        
        // Track total shares
        $total_shares = get_post_meta($post_id, '_easy_share_total', true);
        $new_total = intval($total_shares) + 1;
        update_post_meta($post_id, '_easy_share_total', $new_total);
        
        // Save to analytics database
        $this->save_share_analytics($platform, $post_id);
        
        wp_send_json_success(array(
            'platform' => $platform,
            'count' => $new_count,
            'total' => $new_total,
            'post_id' => $post_id
        ));
    }
    
    /**
     * Save share analytics to database
     *
     * @param string $platform
     * @param int $post_id
     */
    private function save_share_analytics($platform, $post_id) {
        global $wpdb;
        
        $table_name = $wpdb->prefix . 'easy_share_analytics';
        
        // Get user info
        $user_id = get_current_user_id();
        $user_ip = $this->get_user_ip();
        $user_agent = isset($_SERVER['HTTP_USER_AGENT']) ? sanitize_text_field(wp_unslash($_SERVER['HTTP_USER_AGENT'])) : '';
        $post = get_post($post_id);
        
        // Handle case where post doesn't exist (homepage/archive shares)
        $post_title = $post ? $post->post_title : get_bloginfo('name');
        $post_type = $post ? $post->post_type : 'site';
        $page_url = $post ? get_permalink($post_id) : home_url();
        
        // Insert new analytics record (each share is a separate record)
        $result = $wpdb->insert( // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery
            $table_name,
            array(
                'post_id' => $post_id,
                'post_title' => $post_title,
                'post_type' => $post_type,
                'platform' => $platform,
                'user_ip' => $user_ip,
                'user_agent' => $user_agent,
                'user_id' => $user_id,
                'page_url' => $page_url,
                'share_timestamp' => current_time('mysql'),
                'created_at' => current_time('mysql')
            )
        );
        
        // Log any database errors
        if ($result === false) {
            error_log('Easy Share Analytics DB Error: ' . $wpdb->last_error);
        }
        
        // Update daily stats
        $this->update_daily_stats(gmdate('Y-m-d'));
    }
    
    /**
     * Update daily statistics
     *
     * @param string $date
     */
    private function update_daily_stats($date) {
        global $wpdb;
        
        $analytics_table = $wpdb->prefix . 'easy_share_analytics';
        $daily_stats_table = $wpdb->prefix . 'easy_share_daily_stats';
        
        // Get platform stats for the day with caching
        $platform_stats_cache_key = 'easy_share_daily_platform_stats_' . md5($date);
        $platform_stats = wp_cache_get($platform_stats_cache_key, 'easy_share');
        
        if (false === $platform_stats) {
            $platform_stats = $wpdb->get_results($wpdb->prepare( // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching
                "SELECT 
                    platform,
                    COUNT(*) as total_shares,
                    COUNT(DISTINCT post_id) as total_posts,
                    COUNT(DISTINCT user_ip) as unique_users
                 FROM {$analytics_table} 
                 WHERE DATE(share_timestamp) = %s
                 GROUP BY platform",
                $date
            ));
            
            // Cache for 5 minutes
            wp_cache_set($platform_stats_cache_key, $platform_stats, 'easy_share', 300);
        }
        
        foreach ($platform_stats as $stats) {
            // Check if record exists for today and platform with caching
            $existing_cache_key = 'easy_share_daily_exists_' . md5($date . $stats->platform);
            $existing = wp_cache_get($existing_cache_key, 'easy_share');
            
            if (false === $existing) {
                $existing = $wpdb->get_var($wpdb->prepare( // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching
                    "SELECT id FROM {$daily_stats_table} WHERE date_recorded = %s AND platform = %s",
                    $date,
                    $stats->platform
                ));
                
                // Cache for 1 minute (short duration for write operations)
                wp_cache_set($existing_cache_key, $existing, 'easy_share', 60);
            }
            
            if ($existing) {
                $wpdb->update( // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery
                    $daily_stats_table,
                    array(
                        'total_shares' => $stats->total_shares,
                        'unique_users' => $stats->unique_users,
                        'total_posts' => $stats->total_posts,
                        'updated_at' => current_time('mysql')
                    ),
                    array('id' => $existing)
                );
            } else {
                $wpdb->insert( // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery
                    $daily_stats_table,
                    array(
                        'date_recorded' => $date,
                        'platform' => $stats->platform,
                        'total_shares' => $stats->total_shares,
                        'unique_users' => $stats->unique_users,
                        'total_posts' => $stats->total_posts,
                        'created_at' => current_time('mysql'),
                        'updated_at' => current_time('mysql')
                    )
                );
            }
        }
    }
    
    /**
     * Get user IP address securely with proper sanitization and validation
     *
     * @return string
     */
    private function get_user_ip() {
        // Define the order of headers to check for real IP
        $ip_headers = array(
            'HTTP_CLIENT_IP',
            'HTTP_X_FORWARDED_FOR', 
            'HTTP_X_FORWARDED',
            'HTTP_X_CLUSTER_CLIENT_IP',
            'HTTP_FORWARDED_FOR',
            'HTTP_FORWARDED',
            'REMOTE_ADDR'
        );
        
        foreach ($ip_headers as $header) {
            if (!empty($_SERVER[$header])) {
                // Unslash and sanitize the IP value
                $ip_value = wp_unslash($_SERVER[$header]);
                $ip_value = sanitize_text_field($ip_value);
                
                // Handle comma-separated IPs (common with forwarded headers)
                $ips = array_map('trim', explode(',', $ip_value));
                
                foreach ($ips as $ip) {
                    // Validate IP address and exclude private/reserved ranges for forwarded headers
                    if ($this->is_valid_public_ip($ip)) {
                        return $ip;
                    }
                }
            }
        }
        
        // Fallback to REMOTE_ADDR if available and valid
        if (!empty($_SERVER['REMOTE_ADDR'])) {
            $remote_ip = wp_unslash($_SERVER['REMOTE_ADDR']);
            $remote_ip = sanitize_text_field($remote_ip);
            
            if ($this->is_valid_ip($remote_ip)) {
                return $remote_ip;
            }
        }
        
        // Final fallback to anonymous IP
        return '0.0.0.0';
    }
    
    /**
     * Validate if IP address is valid and public (not private/reserved)
     *
     * @param string $ip IP address to validate
     * @return bool True if valid public IP
     */
    private function is_valid_public_ip($ip) {
        // First check if it's a valid IP
        if (!$this->is_valid_ip($ip)) {
            return false;
        }
        
        // Check if it's not a private or reserved IP
        $flags = FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE;
        return filter_var($ip, FILTER_VALIDATE_IP, $flags) !== false;
    }
    
    /**
     * Validate if IP address is valid (IPv4 or IPv6)
     *
     * @param string $ip IP address to validate
     * @return bool True if valid IP
     */
    private function is_valid_ip($ip) {
        return filter_var($ip, FILTER_VALIDATE_IP) !== false;
    }

    /**
     * Check if should load on archive pages
     */
    private function should_load_on_archives() {
        $settings = EasyShare_Settings::get_settings();
        return isset($settings['load_on_archives']) ? $settings['load_on_archives'] : false;
    }
    
    /**
     * Get popup display mode from settings
     */
    private function get_popup_display_mode() {
        $settings = EasyShare_Settings::get_settings();
        return isset($settings['popup_display_mode']) ? $settings['popup_display_mode'] : 'icons_text';
    }
    
    /**
     * Check if floating panel should be shown based on page settings
     */
    private function should_show_floating_panel() {
        $settings = EasyShare_Settings::get_settings();
        
        // Check advanced device restrictions first
        if (!$this->check_advanced_restrictions($settings)) {
            return false;
        }
        
        // Check mobile display setting from floating_design
        if (wp_is_mobile()) {
            $design_settings = isset($settings['floating_design']) ? $settings['floating_design'] : array();
            $mobile_enabled = isset($design_settings['show_on_mobile']) ? $design_settings['show_on_mobile'] : true;
            if (!$mobile_enabled) {
                return false;
            }
        }
        
        // Check if on front page and front page display is enabled
        if (is_front_page()) {
            return $settings['floating_panel_front_page'];
        }
        
        // Check if on home page (blog page) and home page display is enabled
        if (is_home() && !is_front_page()) {
            return $settings['floating_panel_home_page'];
        }
        
        // Check if on single post/page
        if (is_singular()) {
            $current_post_type = get_post_type();
            $enabled_post_types = isset($settings['post_types']) ? $settings['post_types'] : array('post', 'page');
            return in_array($current_post_type, $enabled_post_types);
        }
        
        // Check if should load on archives
        if (is_archive() || is_category() || is_tag() || is_author() || is_date()) {
            return $this->should_load_on_archives();
        }
        
        return false;
    }
    
    /**
     * Convert icon size to size name
     */
    private function convert_size_to_name($size) {
        if ($size <= 20) return 'small';
        if ($size <= 32) return 'medium';
        if ($size <= 48) return 'large';
        return 'extra-large';
    }
    
    /**
     * Apply custom CSS from settings
     */
    public function apply_custom_css() {
        $settings = EasyShare_Settings::get_settings();
        $custom_css = isset($settings['custom_css']) ? $settings['custom_css'] : '';
        $popup_presets = isset($settings['popup_presets']) ? $settings['popup_presets'] : array();
        
        if (empty($custom_css) && empty($popup_presets)) {
            return;
        }
        
        echo '<style id="easy-share-custom-styles">';
        
        // Apply popup presets styling
        if (!empty($popup_presets)) {
            echo wp_kses($this->generate_popup_preset_css($popup_presets), array('style' => array()));
        }
        
        // Apply custom CSS
        if (!empty($custom_css)) {
            echo wp_strip_all_tags($custom_css);
        }
        
        echo '</style>';
    }
    
    /**
     * Apply custom JavaScript from advanced settings
     */
    public function apply_custom_js() {
        $settings = EasyShare_Settings::get_settings();
        $custom_js = isset($settings['custom_js']) ? $settings['custom_js'] : '';
        
        if (empty($custom_js)) {
            return;
        }
        
        // Only add if user has proper permissions (for security)
        if (!current_user_can('edit_themes')) {
            return;
        }
        
        echo '<script id="easy-share-custom-js">';
        echo wp_strip_all_tags($custom_js);
        echo '</script>';
    }
    
    /**
     * Generate CSS for popup presets
     *
     * @param array $popup_presets Popup preset settings
     * @return string Generated CSS
     */
    private function generate_popup_preset_css($popup_presets) {
        $css = '';
        
        // Apply popup preset styles to both ess-share-popup and ess-floating-popup
        $css .= '.ess-share-popup, .ess-floating-popup {';
        
        // Backdrop blur
        if (isset($popup_presets['backdrop_blur'])) {
            $css .= '.ess-popup-overlay { backdrop-filter: blur(' . esc_html($popup_presets['backdrop_blur']) . '); -webkit-backdrop-filter: blur(' . esc_html($popup_presets['backdrop_blur']) . '); }';
        }
        
        // Border radius
        if (isset($popup_presets['border_radius'])) {
            $css .= '.ess-popup-content { border-radius: ' . esc_html($popup_presets['border_radius']) . '; }';
        }
        
        // Animation speed
        if (isset($popup_presets['animation_speed'])) {
            $css .= '.ess-popup-content { animation-duration: ' . esc_html($popup_presets['animation_speed']) . '; }';
            $css .= '&.ess-popup-closing .ess-popup-content { animation-duration: ' . esc_html($popup_presets['animation_speed']) . '; }';
        }
        
        // Header background
        if (isset($popup_presets['header_background'])) {
            $css .= '.ess-popup-header { background: ' . esc_html($popup_presets['header_background']) . '; }';
        }
        
        // Header text color and gradient
        if (isset($popup_presets['header_text_color']) || isset($popup_presets['header_text_gradient'])) {
            $css .= '.ess-popup-header h3 {';
            if (isset($popup_presets['header_text_color'])) {
                $css .= 'color: ' . esc_html($popup_presets['header_text_color']) . ';';
            }
            if (isset($popup_presets['header_text_gradient']) && $popup_presets['header_text_gradient'] !== 'none') {
                $css .= 'background: ' . esc_html($popup_presets['header_text_gradient']) . ';';
                $css .= '-webkit-background-clip: text;';
                $css .= '-webkit-text-fill-color: transparent;';
                $css .= 'background-clip: text;';
            } else {
                $css .= 'background: none;';
                $css .= '-webkit-background-clip: unset;';
                $css .= '-webkit-text-fill-color: inherit;';
                $css .= 'background-clip: unset;';
            }
            $css .= '}';
        }
        
        // Body background
        if (isset($popup_presets['body_background'])) {
            $css .= '.ess-popup-body { background: ' . esc_html($popup_presets['body_background']) . '; }';
            $css .= '.ess-popup-content { background: ' . esc_html($popup_presets['body_background']) . '; }';
        }
        
        // Category title color
        if (isset($popup_presets['category_title_color'])) {
            $css .= '.ess-category-title { color: ' . esc_html($popup_presets['category_title_color']) . '; }';
        }
        
        // Platform background
        if (isset($popup_presets['platform_background'])) {
            $css .= '.ess-popup-platform { background: ' . esc_html($popup_presets['platform_background']) . '; }';
        }
        
        // Platform border
        if (isset($popup_presets['platform_border'])) {
            $css .= '.ess-popup-platform { border-color: ' . esc_html($popup_presets['platform_border']) . '; }';
        }
        
        // Platform text color
        if (isset($popup_presets['platform_text_color'])) {
            $css .= '.ess-popup-platform { color: ' . esc_html($popup_presets['platform_text_color']) . '; }';
        }
        
        $css .= '}';
        
        return $css;
    }

    /**
     * Get share count for a specific platform
     */
    private function get_platform_share_count($platform) {
        global $post;
        
        if (!$post || !$post->ID) {
            return 0;
        }
        
        $count = get_post_meta($post->ID, '_easy_share_count_' . $platform, true);
        return absint($count);
    }

    /**
     * Format share count for display
     */
    private function format_share_count($count) {
        if ($count < 1000) {
            return $count;
        } elseif ($count < 1000000) {
            return round($count / 1000, 1) . 'K';
        } else {
            return round($count / 1000000, 1) . 'M';
        }
    }
}
