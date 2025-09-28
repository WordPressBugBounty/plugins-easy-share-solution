<?php
/**
 * Block functionality
 *
 * @package EasyShareSolution
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

require_once EASY_SHARE_PLUGIN_DIR . 'inc/trait-share-platforms.php';

/**
 * Class EasyShare_Blocks
 */
class EasyShare_Blocks {
    
    use Easy_Share_Platforms_Trait;
    
    /**
     * Constructor
     */
    public function __construct() {
        add_action('init', array($this, 'register_blocks'));
        add_action('enqueue_block_editor_assets', array($this, 'enqueue_block_editor_assets'));
        add_filter('block_categories_all', array($this, 'add_block_category'), 10, 2);
    }
    
    /**
     * Add custom block category
     */
    public function add_block_category($categories, $post) {
        return array_merge(
            $categories,
            array(
                array(
                    'slug' => 'easy-share-solution',
                    'title' => __('Easy Share Solution', 'easy-share-solution'),
                    'icon' => 'share',
                ),
            )
        );
    }
    
    /**
     * Register blocks
     */
    public function register_blocks() {
        // Check if block functions exist
        if (!function_exists('register_block_type')) {
            return;
        }
        
        // Register share block
        $share_block_path = EASY_SHARE_PLUGIN_DIR . 'build/share-block';
        if (file_exists($share_block_path . '/block.json')) {
            register_block_type($share_block_path, array(
                'render_callback' => array($this, 'render_share_block')
            ));
        }
    }
    
    /**
     * Enqueue block editor assets
     */
    public function enqueue_block_editor_assets() {
        $asset_file = EASY_SHARE_PLUGIN_DIR . 'build/share-block/index.asset.php';
        if (file_exists($asset_file)) {
            $asset = include $asset_file;
            
            wp_enqueue_script(
                'easy-share-solution-share-block',
                EASY_SHARE_PLUGIN_URL . 'build/share-block/index.js',
                $asset['dependencies'],
                $asset['version']
            );
            
            wp_set_script_translations(
                'easy-share-solution-share-block',
                'easy-share-solution'
            );
        }
    }
    
    /**
     * Render share block
     */
    public function render_share_block($attributes) {
        $platforms = isset($attributes['selectedPlatforms']) ? $attributes['selectedPlatforms'] : array('facebook', 'xcom', 'linkedin', 'whatsapp', 'pinterest');
        $icon_style = isset($attributes['iconStyle']) ? $attributes['iconStyle'] : 'circle';
        $layout = isset($attributes['layout']) ? $attributes['layout'] : 'horizontal';
        $show_labels = isset($attributes['showLabels']) ? $attributes['showLabels'] : true;
        $alignment = isset($attributes['alignment']) ? $attributes['alignment'] : 'left';
        $show_more_button = isset($attributes['showMoreButton']) ? $attributes['showMoreButton'] : true;
        
        ob_start();
        ?>
        <div class="ess-share-block ess-layout-<?php echo esc_attr($layout); ?> ess-align-<?php echo esc_attr($alignment); ?>" data-style="<?php echo esc_attr($icon_style); ?>">
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
                       style="--platform-color: <?php echo esc_attr($platform_data['color']); ?>">
                        <span class="ess-icon">
                            <?php echo $this->get_platform_icon($platform); ?>
                        </span>
                        <?php if ($show_labels): ?>
                            <span class="ess-label"><?php echo esc_html($platform_data['name']); ?></span>
                        <?php endif; ?>
                    </a>
                <?php endif; ?>
            <?php endforeach; ?>
            
            

            <?php if ($show_more_button): ?>
                <!-- More button to show popup -->
                <button type="button" 
                        class="ess-share-button ess-more-button ess-style-<?php echo esc_attr($icon_style); ?>" 
                        title="<?php echo esc_attr__('More sharing options', 'easy-share-solution'); ?>"
                        aria-label="<?php echo esc_attr__('Show more sharing options', 'easy-share-solution'); ?>">
                    <span class="ess-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                        </svg>
                    </span>
                    <?php if ($show_labels): ?>
                        <span class="ess-label"><?php echo esc_html__('More', 'easy-share-solution'); ?></span>
                    <?php endif; ?>
                </button>

                <!-- Popup with all sharing options -->
                <div class="ess-share-popup" style="display: none;">
                    <div class="ess-popup-overlay"></div>
                    <div class="ess-popup-content">
                        <div class="ess-popup-header">
                            <h3><?php echo esc_html__('Share this content', 'easy-share-solution'); ?></h3>
                            <button type="button" class="ess-popup-close" aria-label="<?php echo esc_attr__('Close popup', 'easy-share-solution'); ?>">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                                </svg>
                            </button>
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
}
