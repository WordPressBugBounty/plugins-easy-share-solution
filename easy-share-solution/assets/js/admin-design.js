/**
 * Easy Share Solution - Design Tab Accordion Interface
 * Comprehensive frontend implementation for all design options
 */

jQuery(document).ready(function($) {
    
    // Initialize design options accordion
    initializeDesignAccordion();
    
    // Initialize color pickers and live preview
    initializeDesignControls();
    
    // Initialize live preview functionality
    initializeLivePreview();
    
    /**
     * Initialize the design accordion interface
     */
    function initializeDesignAccordion() {
        // Create accordion structure for design options
        const designTabContent = $('#design-tab-content');
        
        if (designTabContent.length === 0) {
            console.warn('Design tab content container not found');
            return;
        }
        
        // Create accordion sections
        const accordionSections = [
            {
                id: 'design-presets',
                title: 'Design Presets',
                icon: 'dashicons-art',
                fields: ['design_preset']
            },
            {
                id: 'container-design',
                title: 'Container Design',
                icon: 'dashicons-admin-appearance',
                fields: [
                    'container_background_color',
                    'container_background_type',
                    'container_border_radius',
                    'container_padding',
                    'container_shadow',
                    'glassmorphism_enabled',
                    'glassmorphism_blur',
                    'glassmorphism_opacity'
                ]
            },
            {
                id: 'icon-styling',
                title: 'Icon Styling',
                icon: 'dashicons-format-gallery',
                fields: [
                    'icon_shape',
                    'icon_size',
                    'icon_spacing',
                    'icon_padding',
                    'icon_primary_color',
                    'icon_secondary_color',
                    'icon_hover_color',
                    'icon_background',
                    'icon_border_enabled',
                    'icon_border_width',
                    'icon_border_color'
                ]
            },
            {
                id: 'positioning',
                title: 'Position & Layout',
                icon: 'dashicons-move',
                fields: [
                    'position_type',
                    'position_offset_x',
                    'position_offset_y',
                    'z_index',
                    'display_mode',
                    'auto_hide_enabled',
                    'auto_hide_delay'
                ]
            },
            {
                id: 'animations',
                title: 'Animations & Effects',
                icon: 'dashicons-controls-play',
                fields: [
                    'entrance_animation',
                    'animation_duration',
                    'animation_delay',
                    'stagger_enabled',
                    'stagger_delay',
                    'hover_animation',
                    'hover_scale',
                    'exit_animation'
                ]
            },
            {
                id: 'responsive',
                title: 'Responsive Design',
                icon: 'dashicons-smartphone',
                fields: [
                    'mobile_enabled',
                    'mobile_position',
                    'mobile_size_adjustment',
                    'tablet_enabled',
                    'tablet_position',
                    'hide_on_mobile',
                    'hide_on_tablet'
                ]
            }
        ];
        
        // Build accordion HTML
        let accordionHTML = '<div class="ess-design-accordion">';
        
        accordionSections.forEach(section => {
            accordionHTML += createAccordionSection(section);
        });
        
        accordionHTML += '</div>';
        
        // Insert accordion into design tab
        designTabContent.html(accordionHTML);
        
        // Initialize accordion functionality
        initializeAccordionEvents();
    }
    
    /**
     * Create individual accordion section HTML
     */
    function createAccordionSection(section) {
        const isExpanded = section.id === 'container-design' ? 'ess-expanded' : '';
        const ariaExpanded = section.id === 'container-design' ? 'true' : 'false';
        
        return `
            <div class="ess-accordion-section ${isExpanded}" data-section="${section.id}">
                <div class="ess-accordion-header" role="button" tabindex="0" aria-expanded="${ariaExpanded}">
                    <span class="dashicons ${section.icon}"></span>
                    <h3>${section.title}</h3>
                    <span class="ess-accordion-toggle dashicons dashicons-arrow-down-alt2"></span>
                </div>
                <div class="ess-accordion-content">
                    <div class="ess-accordion-body">
                        ${createSectionFields(section)}
                    </div>
                </div>
            </div>
        `;
    }
    
    /**
     * Create fields for accordion section
     */
    function createSectionFields(section) {
        let fieldsHTML = '';
        
        // Field configurations
        const fieldConfigs = {
            // Design Presets
            'design_preset': {
                type: 'preset-selector',
                label: 'Quick Design Presets',
                description: 'Choose from pre-configured designs or customize your own',
                options: {
                    'custom': 'Custom Design',
                    'minimal': 'Minimal Clean',
                    'modern': 'Modern Gradient',
                    'classic': 'Classic Shadow',
                    'glassmorphism': 'Glassmorphism',
                    'colorful': 'Colorful Bright',
                    'dark': 'Dark Theme',
                    'corporate': 'Corporate Professional'
                },
                default: 'custom'
            },
            
            // Container Design Fields
            'container_background_color': {
                type: 'color',
                label: 'Background Color',
                default: '#ffffff',
                description: 'Set the container background color'
            },
            'container_background_type': {
                type: 'select',
                label: 'Background Type',
                options: {
                    'solid': 'Solid Color',
                    'gradient': 'Gradient',
                    'glassmorphism': 'Glassmorphism'
                },
                default: 'solid'
            },
            'container_border_radius': {
                type: 'range',
                label: 'Border Radius',
                min: 0,
                max: 50,
                default: 12,
                unit: 'px'
            },
            'container_padding': {
                type: 'range',
                label: 'Padding',
                min: 0,
                max: 50,
                default: 12,
                unit: 'px'
            },
            'container_shadow': {
                type: 'select',
                label: 'Shadow Style',
                options: {
                    'none': 'None',
                    'light': 'Light',
                    'medium': 'Medium',
                    'heavy': 'Heavy',
                    'custom': 'Custom'
                },
                default: 'medium'
            },
            'glassmorphism_enabled': {
                type: 'checkbox',
                label: 'Enable Glassmorphism',
                description: 'Apply glassmorphism effect with backdrop blur'
            },
            'glassmorphism_blur': {
                type: 'range',
                label: 'Blur Intensity',
                min: 0,
                max: 20,
                default: 10,
                unit: 'px'
            },
            'glassmorphism_opacity': {
                type: 'range',
                label: 'Background Opacity',
                min: 0,
                max: 1,
                step: 0.1,
                default: 0.8
            },
            
            // Icon Styling Fields
            'icon_shape': {
                type: 'select',
                label: 'Icon Shape',
                options: {
                    'circle': 'Circle',
                    'rounded': 'Rounded Square',
                    'square': 'Square',
                    'soft': 'Soft Rounded'
                },
                default: 'circle'
            },
            'icon_size': {
                type: 'range',
                label: 'Icon Size',
                min: 20,
                max: 80,
                default: 40,
                unit: 'px'
            },
            'icon_spacing': {
                type: 'range',
                label: 'Icon Spacing',
                min: 0,
                max: 30,
                default: 8,
                unit: 'px'
            },
            'icon_padding': {
                type: 'range',
                label: 'Icon Padding',
                min: 0,
                max: 20,
                default: 8,
                unit: 'px'
            },
            'icon_primary_color': {
                type: 'color',
                label: 'Primary Color',
                default: '#007cba'
            },
            'icon_secondary_color': {
                type: 'color',
                label: 'Secondary Color',
                default: '#ffffff'
            },
            'icon_hover_color': {
                type: 'color',
                label: 'Hover Color',
                default: '#005a87'
            },
            'icon_background': {
                type: 'color',
                label: 'Background Color',
                default: '#007cba'
            },
            'icon_border_enabled': {
                type: 'checkbox',
                label: 'Enable Borders'
            },
            'icon_border_width': {
                type: 'range',
                label: 'Border Width',
                min: 0,
                max: 10,
                default: 0,
                unit: 'px'
            },
            'icon_border_color': {
                type: 'color',
                label: 'Border Color',
                default: '#transparent'
            },
            
            // Position & Layout Fields
            'position_type': {
                type: 'select',
                label: 'Position Type',
                options: {
                    'fixed_left': 'Fixed Left',
                    'fixed_right': 'Fixed Right',
                    'center_left': 'Center Left',
                    'center_right': 'Center Right',
                    'fixed_top_left': 'Top Left',
                    'fixed_top_right': 'Top Right',
                    'fixed_bottom_left': 'Bottom Left',
                    'fixed_bottom_right': 'Bottom Right'
                },
                default: 'fixed_right'
            },
            'position_offset_x': {
                type: 'range',
                label: 'Horizontal Offset',
                min: 0,
                max: 100,
                default: 20,
                unit: 'px'
            },
            'z_index': {
                type: 'number',
                label: 'Z-Index',
                default: 9999,
                min: 1,
                max: 999999
            },
            'display_mode': {
                type: 'select',
                label: 'Display Mode',
                options: {
                    'expand': 'Always Expanded',
                    'fold': 'Fold/Expand on Click'
                },
                default: 'expand'
            },
            'auto_hide_enabled': {
                type: 'checkbox',
                label: 'Auto Hide'
            },
            'auto_hide_delay': {
                type: 'range',
                label: 'Auto Hide Delay',
                min: 1,
                max: 10,
                default: 3,
                unit: 's'
            },
            
            // Animation Fields
            'entrance_animation': {
                type: 'select',
                label: 'Entrance Animation',
                options: {
                    'none': 'None',
                    'fadeIn': 'Fade In',
                    'slideIn': 'Slide In',
                    'scaleIn': 'Scale In',
                    'bounceIn': 'Bounce In'
                },
                default: 'fadeIn'
            },
            'animation_duration': {
                type: 'range',
                label: 'Animation Duration',
                min: 0.1,
                max: 2,
                step: 0.1,
                default: 0.6,
                unit: 's'
            },
            'animation_delay': {
                type: 'range',
                label: 'Animation Delay',
                min: 0,
                max: 2,
                step: 0.1,
                default: 0,
                unit: 's'
            },
            'stagger_enabled': {
                type: 'checkbox',
                label: 'Stagger Animation'
            },
            'stagger_delay': {
                type: 'range',
                label: 'Stagger Delay',
                min: 50,
                max: 500,
                default: 100,
                unit: 'ms'
            },
            'hover_animation': {
                type: 'select',
                label: 'Hover Animation',
                options: {
                    'none': 'None',
                    'scale': 'Scale',
                    'rotate': 'Rotate',
                    'pulse': 'Pulse',
                    'bounce': 'Bounce',
                    'shake': 'Shake'
                },
                default: 'scale'
            },
            'hover_scale': {
                type: 'range',
                label: 'Hover Scale',
                min: 1,
                max: 1.5,
                step: 0.05,
                default: 1.1
            },
            'exit_animation': {
                type: 'select',
                label: 'Exit Animation',
                options: {
                    'none': 'None',
                    'fadeOut': 'Fade Out',
                    'slideOut': 'Slide Out',
                    'scaleOut': 'Scale Out'
                },
                default: 'none'
            },
            
            // Responsive Fields
            'mobile_enabled': {
                type: 'checkbox',
                label: 'Enable on Mobile',
                default: true
            },
            'mobile_position': {
                type: 'select',
                label: 'Mobile Position',
                options: {
                    'same': 'Same as Desktop',
                    'bottom_center': 'Bottom Center',
                    'bottom_left': 'Bottom Left',
                    'bottom_right': 'Bottom Right'
                },
                default: 'same'
            },
            'mobile_size_adjustment': {
                type: 'range',
                label: 'Mobile Size Adjustment',
                min: 0.5,
                max: 1.5,
                step: 0.1,
                default: 0.9
            },
            'tablet_enabled': {
                type: 'checkbox',
                label: 'Enable on Tablet',
                default: true
            },
            'tablet_position': {
                type: 'select',
                label: 'Tablet Position',
                options: {
                    'same': 'Same as Desktop',
                    'adapted': 'Adapted for Tablet'
                },
                default: 'same'
            },
            'hide_on_mobile': {
                type: 'checkbox',
                label: 'Hide on Mobile'
            },
            'hide_on_tablet': {
                type: 'checkbox',
                label: 'Hide on Tablet'
            }
        };
        
        // Generate fields HTML
        section.fields.forEach(fieldName => {
            if (fieldConfigs[fieldName]) {
                fieldsHTML += createFieldHTML(fieldName, fieldConfigs[fieldName]);
            }
        });
        
        return fieldsHTML;
    }
    
    /**
     * Create individual field HTML
     */
    function createFieldHTML(fieldName, config) {
        const fieldId = `ess_${fieldName}`;
        const currentValue = getFieldValue(fieldName, config.default);
        
        let fieldHTML = `
            <div class="ess-field-row" data-field="${fieldName}">
                <div class="ess-field-label">
                    <label for="${fieldId}">${config.label}</label>
                    ${config.description ? `<span class="ess-field-description">${config.description}</span>` : ''}
                </div>
                <div class="ess-field-control">
        `;
        
        switch (config.type) {
            case 'preset-selector':
                fieldHTML += `
                    <div class="ess-preset-selector">
                        <div class="ess-preset-grid">
                `;
                Object.entries(config.options).forEach(([value, label]) => {
                    const selected = currentValue === value ? 'selected' : '';
                    fieldHTML += `
                        <div class="ess-preset-option ${selected}" data-preset="${value}">
                            <div class="ess-preset-preview ess-preset-${value}"></div>
                            <span class="ess-preset-label">${label}</span>
                        </div>
                    `;
                });
                fieldHTML += `
                        </div>
                        <input type="hidden" id="${fieldId}" name="${fieldId}" value="${currentValue}" class="ess-preset-input">
                    </div>
                `;
                break;
                
            case 'color':
                fieldHTML += `<input type="color" id="${fieldId}" name="${fieldId}" value="${currentValue}" class="ess-color-picker">`;
                break;
                
            case 'range':
                const step = config.step || 1;
                fieldHTML += `
                    <div class="ess-range-control">
                        <input type="range" id="${fieldId}" name="${fieldId}" 
                               min="${config.min}" max="${config.max}" step="${step}" value="${currentValue}"
                               class="ess-range-slider">
                        <span class="ess-range-value">${currentValue}${config.unit || ''}</span>
                    </div>
                `;
                break;
                
            case 'select':
                fieldHTML += `<select id="${fieldId}" name="${fieldId}" class="ess-select">`;
                Object.entries(config.options).forEach(([value, label]) => {
                    const selected = currentValue === value ? 'selected' : '';
                    fieldHTML += `<option value="${value}" ${selected}>${label}</option>`;
                });
                fieldHTML += `</select>`;
                break;
                
            case 'checkbox':
                const checked = currentValue ? 'checked' : '';
                fieldHTML += `<input type="checkbox" id="${fieldId}" name="${fieldId}" ${checked} class="ess-checkbox">`;
                break;
                
            case 'number':
                fieldHTML += `<input type="number" id="${fieldId}" name="${fieldId}" value="${currentValue}" 
                             min="${config.min || ''}" max="${config.max || ''}" class="ess-number">`;
                break;
        }
        
        fieldHTML += `
                </div>
            </div>
        `;
        
        return fieldHTML;
    }
    
    /**
     * Get current field value from options
     */
    function getFieldValue(fieldName, defaultValue) {
        // In real implementation, this would get values from WordPress options
        // For now, return default values
        return defaultValue;
    }
    
    /**
     * Initialize accordion events
     */
    function initializeAccordionEvents() {
        // Accordion header click events
        $(document).on('click', '.ess-accordion-header', function() {
            const section = $(this).closest('.ess-accordion-section');
            const isExpanded = section.hasClass('ess-expanded');
            
            if (isExpanded) {
                section.removeClass('ess-expanded');
                $(this).attr('aria-expanded', 'false');
            } else {
                // Close other sections
                $('.ess-accordion-section').removeClass('ess-expanded');
                $('.ess-accordion-header').attr('aria-expanded', 'false');
                
                // Open clicked section
                section.addClass('ess-expanded');
                $(this).attr('aria-expanded', 'true');
            }
        });
        
        // Keyboard navigation
        $(document).on('keydown', '.ess-accordion-header', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                $(this).click();
            }
        });
    }
    
    /**
     * Initialize design controls
     */
    function initializeDesignControls() {
        // Preset selector changes
        $(document).on('click', '.ess-preset-option', function() {
            const $option = $(this);
            const preset = $option.data('preset');
            const $container = $option.closest('.ess-preset-selector');
            const $input = $container.find('.ess-preset-input');
            
            // Update selection
            $container.find('.ess-preset-option').removeClass('selected');
            $option.addClass('selected');
            $input.val(preset);
            
            // Apply preset
            applyDesignPreset(preset);
            updateDesignOption('design_preset', preset);
        });
        
        // Color picker changes
        $(document).on('change', '.ess-color-picker', function() {
            const fieldName = $(this).closest('.ess-field-row').data('field');
            const value = $(this).val();
            updateDesignOption(fieldName, value);
        });
        
        // Range slider changes - Fixed to allow 0 values
        $(document).on('input', '.ess-range-slider', function() {
            const fieldName = $(this).closest('.ess-field-row').data('field');
            const value = $(this).val();
            const $unit = $(this).closest('.ess-range-control').find('.ess-range-value');
            const unitText = $unit.text().replace(/[0-9.-]/g, '') || '';
            
            // Allow 0 values - don't reset to default
            $unit.text(value + unitText);
            updateDesignOption(fieldName, value);
        });
        
        // Range slider change event (when user releases slider)
        $(document).on('change', '.ess-range-slider', function() {
            const fieldName = $(this).closest('.ess-field-row').data('field');
            const value = $(this).val();
            
            // Explicitly allow 0 values - important for position offsets
            updateDesignOption(fieldName, value);
        });
        
        // Select changes
        $(document).on('change', '.ess-select', function() {
            const fieldName = $(this).closest('.ess-field-row').data('field');
            const value = $(this).val();
            updateDesignOption(fieldName, value);
        });
        
        // Checkbox changes
        $(document).on('change', '.ess-checkbox', function() {
            const fieldName = $(this).closest('.ess-field-row').data('field');
            const value = $(this).is(':checked');
            updateDesignOption(fieldName, value);
        });
        
        // Number input changes
        $(document).on('change', '.ess-number', function() {
            const fieldName = $(this).closest('.ess-field-row').data('field');
            const value = $(this).val();
            updateDesignOption(fieldName, value);
        });
    }
    
    /**
     * Update design option and trigger live preview
     */
    function updateDesignOption(fieldName, value) {
        // Update CSS custom property
        updateCSSVariable(fieldName, value);
        
        // Trigger live preview update
        updateLivePreview();
        
        // Save to database (implement AJAX call)
        saveDesignOption(fieldName, value);
    }
    
    /**
     * Update CSS custom properties for live preview
     */
    function updateCSSVariable(fieldName, value) {
        const root = document.documentElement;
        
        // Map field names to CSS variables
        const cssVariableMap = {
            'container_background_color': '--ess-container-bg-color',
            'container_border_radius': '--ess-container-border-radius',
            'container_padding': '--ess-container-padding',
            'icon_size': '--ess-icon-size',
            'icon_spacing': '--ess-icon-spacing',
            'icon_padding': '--ess-icon-padding',
            'icon_primary_color': '--ess-icon-primary-color',
            'icon_secondary_color': '--ess-icon-secondary-color',
            'icon_hover_color': '--ess-icon-hover-color',
            'icon_background': '--ess-icon-background',
            'z_index': '--ess-z-index',
            'glassmorphism_blur': '--ess-glassmorphism-blur',
            'glassmorphism_opacity': '--ess-glassmorphism-opacity'
        };
        
        if (cssVariableMap[fieldName]) {
            let cssValue = value;
            
            // Add units where needed
            if (['container_border_radius', 'container_padding', 'icon_size', 'icon_spacing', 'icon_padding'].includes(fieldName)) {
                cssValue += 'px';
            }
            
            if (fieldName === 'glassmorphism_blur') {
                root.style.setProperty('--ess-backdrop-filter', `blur(${value}px)`);
            }
            
            root.style.setProperty(cssVariableMap[fieldName], cssValue);
        }
        
        // Handle special cases
        handleSpecialDesignOptions(fieldName, value);
    }
    
    /**
     * Handle special design options that require class changes
     */
    function handleSpecialDesignOptions(fieldName, value) {
        const panel = document.querySelector('.ess-floating-panel');
        if (!panel) return;
        
        switch (fieldName) {
            case 'icon_shape':
                panel.className = panel.className.replace(/ess-shape-\w+/g, '');
                panel.classList.add(`ess-shape-${value}`);
                break;
                
            case 'position_type':
                panel.className = panel.className.replace(/ess-position-\w+/g, '');
                panel.classList.add(`ess-position-${value}`);
                break;
                
            case 'entrance_animation':
                panel.className = panel.className.replace(/ess-animation-\w+/g, '');
                if (value !== 'none') {
                    panel.classList.add(`ess-animation-${value}`);
                }
                break;
                
            case 'hover_animation':
                panel.className = panel.className.replace(/ess-hover-\w+/g, '');
                if (value !== 'none') {
                    panel.classList.add(`ess-hover-${value}`);
                }
                break;
                
            case 'display_mode':
                panel.className = panel.className.replace(/ess-display-\w+/g, '');
                panel.classList.add(`ess-display-${value}`);
                break;
                
            case 'glassmorphism_enabled':
                if (value) {
                    panel.classList.add('ess-glassmorphism-enabled');
                } else {
                    panel.classList.remove('ess-glassmorphism-enabled');
                }
                break;
                
            case 'stagger_enabled':
                if (value) {
                    panel.classList.add('ess-stagger-enabled');
                } else {
                    panel.classList.remove('ess-stagger-enabled');
                }
                break;
                
            case 'auto_hide_enabled':
                if (value) {
                    panel.classList.add('ess-auto-hide');
                } else {
                    panel.classList.remove('ess-auto-hide');
                }
                break;
        }
    }
    
    /**
     * Initialize live preview functionality
     */
    function initializeLivePreview() {
        // Create live preview toggle
        const previewToggle = `
            <div class="ess-live-preview-controls">
                <button type="button" class="button button-secondary ess-preview-toggle">
                    <span class="dashicons dashicons-visibility"></span>
                    Toggle Live Preview
                </button>
                <button type="button" class="button button-secondary ess-preview-reset">
                    <span class="dashicons dashicons-image-rotate"></span>
                    Reset to Defaults
                </button>
                <button type="button" class="button button-primary ess-save-settings">
                    <span class="dashicons dashicons-saved"></span>
                    Save Settings
                </button>
            </div>
        `;
        
        $('.ess-design-accordion').before(previewToggle);
        
        // Preview toggle event
        $(document).on('click', '.ess-preview-toggle', function() {
            const panel = document.querySelector('.ess-floating-panel');
            if (panel) {
                panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
                $(this).toggleClass('active');
            }
        });
        
        // Reset to defaults event
        $(document).on('click', '.ess-preview-reset', function() {
            if (confirm('Are you sure you want to reset all design options to defaults?')) {
                resetToDefaults();
            }
        });
        
        // Save settings event
        $(document).on('click', '.ess-save-settings', function() {
            saveAllSettings();
        });
    }
    
    /**
     * Update live preview
     */
    function updateLivePreview() {
        // Trigger any additional preview updates
        $(document).trigger('ess-design-updated');
    }
    
    /**
     * Save design option via AJAX
     */
    function saveDesignOption(fieldName, value) {
        $.ajax({
            url: ajaxurl,
            type: 'POST',
            data: {
                action: 'ess_save_design_option',
                field: fieldName,
                value: value,
                nonce: essAdminAjax.nonce
            },
            success: function(response) {
                if (response.success) {
                    // Option saved successfully
                    showNotification('Design option saved!', 'success');
                } else {
                    showNotification('Error saving option: ' + response.data, 'error');
                }
            },
            error: function() {
                showNotification('Ajax error occurred', 'error');
            }
        });
    }
    
    /**
     * Apply design preset
     */
    function applyDesignPreset(preset) {
        const presets = {
            'minimal': {
                container_background_color: '#ffffff',
                container_border_radius: 4,
                container_padding: 6,
                container_shadow: 'light',
                icon_shape: 'square',
                icon_size: 36,
                icon_spacing: 4,
                entrance_animation: 'fadeIn',
                hover_animation: 'none'
            },
            'modern': {
                container_background_color: '#f8f9fa',
                container_border_radius: 16,
                container_padding: 12,
                container_shadow: 'medium',
                icon_shape: 'soft',
                icon_size: 44,
                icon_spacing: 8,
                entrance_animation: 'scaleIn',
                hover_animation: 'scale'
            },
            'classic': {
                container_background_color: '#ffffff',
                container_border_radius: 8,
                container_padding: 10,
                container_shadow: 'heavy',
                icon_shape: 'circle',
                icon_size: 40,
                icon_spacing: 6,
                entrance_animation: 'slideIn',
                hover_animation: 'bounce'
            },
            'glassmorphism': {
                container_background_color: 'rgba(255,255,255,0.1)',
                container_border_radius: 20,
                container_padding: 16,
                glassmorphism_enabled: true,
                glassmorphism_blur: 15,
                glassmorphism_opacity: 0.3,
                icon_shape: 'circle',
                icon_size: 48,
                entrance_animation: 'bounceIn'
            },
            'colorful': {
                container_background_color: '#ff6b6b',
                container_border_radius: 12,
                container_padding: 12,
                container_shadow: 'medium',
                icon_shape: 'rounded',
                icon_size: 42,
                icon_spacing: 10,
                entrance_animation: 'scaleIn',
                hover_animation: 'pulse'
            },
            'dark': {
                container_background_color: '#2d3748',
                container_border_radius: 8,
                container_padding: 8,
                container_shadow: 'heavy',
                icon_shape: 'square',
                icon_size: 38,
                icon_spacing: 6,
                entrance_animation: 'fadeIn',
                hover_animation: 'scale'
            },
            'corporate': {
                container_background_color: '#f7fafc',
                container_border_radius: 6,
                container_padding: 8,
                container_shadow: 'light',
                icon_shape: 'soft',
                icon_size: 36,
                icon_spacing: 4,
                entrance_animation: 'slideIn',
                hover_animation: 'none'
            }
        };
        
        if (preset === 'custom' || !presets[preset]) {
            return;
        }
        
        const presetConfig = presets[preset];
        
        // Apply each preset value to the form
        Object.entries(presetConfig).forEach(([fieldName, value]) => {
            const $field = $(`.ess-field-row[data-field="${fieldName}"]`);
            
            if ($field.length) {
                const $input = $field.find('input, select');
                
                if ($input.hasClass('ess-range-slider')) {
                    $input.val(value);
                    $field.find('.ess-range-value').text(value + ($input.closest('.ess-field-row').find('.ess-range-value').text().replace(/[0-9.-]/g, '') || ''));
                } else if ($input.is('select')) {
                    $input.val(value);
                } else if ($input.is('[type="checkbox"]')) {
                    $input.prop('checked', !!value);
                } else {
                    $input.val(value);
                }
                
                // Trigger change to update preview
                $input.trigger('change');
            }
        });
        
        showNotification(`Applied ${preset} preset!`, 'success');
    }
    
    /**
     * Save all settings
     */
    function saveAllSettings() {
        const settings = {};
        
        // Collect all form values
        $('.ess-design-accordion .ess-field-row').each(function() {
            const $row = $(this);
            const fieldName = $row.data('field');
            const $input = $row.find('input, select');
            
            if ($input.length) {
                if ($input.is('[type="checkbox"]')) {
                    settings[fieldName] = $input.is(':checked');
                } else if ($input.hasClass('ess-preset-input')) {
                    settings[fieldName] = $input.val();
                } else {
                    settings[fieldName] = $input.val();
                }
            }
        });
        
        // Save via AJAX
        $.ajax({
            url: ajaxurl,
            type: 'POST',
            data: {
                action: 'ess_save_all_design_settings',
                settings: settings,
                nonce: essAdminAjax.nonce
            },
            beforeSend: function() {
                $('.ess-save-settings').prop('disabled', true).text('Saving...');
            },
            success: function(response) {
                if (response.success) {
                    showNotification('All settings saved successfully!', 'success');
                } else {
                    showNotification('Error saving settings: ' + response.data, 'error');
                }
            },
            error: function() {
                showNotification('Ajax error occurred while saving', 'error');
            },
            complete: function() {
                $('.ess-save-settings').prop('disabled', false).html('<span class="dashicons dashicons-saved"></span> Save Settings');
            }
        });
    }

    /**
     * Reset all options to defaults
     */
    function resetToDefaults() {
        // Reset all form fields to defaults
        $('.ess-design-accordion input, .ess-design-accordion select').each(function() {
            const field = $(this);
            const fieldRow = field.closest('.ess-field-row');
            const fieldName = fieldRow.data('field');
            
            // Get default value and reset field
            // Implementation would reset to actual defaults
            
            // Trigger change event to update preview
            field.trigger('change');
        });
        
        showNotification('Design options reset to defaults!', 'success');
    }
    
    /**
     * Show notification message
     */
    function showNotification(message, type) {
        const notification = $(`
            <div class="notice notice-${type} is-dismissible ess-notification">
                <p>${message}</p>
                <button type="button" class="notice-dismiss">
                    <span class="screen-reader-text">Dismiss this notice.</span>
                </button>
            </div>
        `);
        
        $('.ess-design-accordion').before(notification);
        
        // Auto-dismiss after 3 seconds
        setTimeout(() => {
            notification.fadeOut(() => notification.remove());
        }, 3000);
        
        // Manual dismiss
        notification.find('.notice-dismiss').on('click', function() {
            notification.fadeOut(() => notification.remove());
        });
    }
    
    /**
     * Additional CSS for the admin interface
     */
    const adminCSS = `
        <style>
        .ess-design-accordion {
            margin-top: 20px;
        }
        
        .ess-accordion-section {
            border: 1px solid #ddd;
            border-radius: 8px;
            margin-bottom: 12px;
            overflow: hidden;
            transition: all 0.3s ease;
        }
        
        .ess-accordion-header {
            background: #f8f9fa;
            padding: 16px 20px;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 12px;
            border-bottom: 1px solid #ddd;
            transition: background 0.3s ease;
        }
        
        .ess-accordion-header:hover {
            background: #f1f1f1;
        }
        
        .ess-accordion-header h3 {
            margin: 0;
            font-size: 16px;
            font-weight: 600;
            flex: 1;
        }
        
        .ess-accordion-toggle {
            transition: transform 0.3s ease;
        }
        
        .ess-accordion-section.ess-expanded .ess-accordion-toggle {
            transform: rotate(180deg);
        }
        
        .ess-accordion-content {
            max-height: 0;
            overflow: hidden;
            transition: max-height 0.3s ease;
        }
        
        .ess-accordion-section.ess-expanded .ess-accordion-content {
            max-height: 2000px;
        }
        
        .ess-accordion-body {
            padding: 20px;
        }
        
        .ess-field-row {
            display: flex;
            align-items: center;
            margin-bottom: 20px;
            gap: 20px;
        }
        
        .ess-field-label {
            flex: 0 0 200px;
        }
        
        .ess-field-label label {
            font-weight: 600;
            margin-bottom: 4px;
            display: block;
        }
        
        .ess-field-description {
            font-size: 12px;
            color: #666;
            font-style: italic;
        }
        
        .ess-field-control {
            flex: 1;
        }
        
        .ess-range-control {
            display: flex;
            align-items: center;
            gap: 12px;
        }
        
        .ess-range-slider {
            flex: 1;
            min-width: 200px;
        }
        
        .ess-range-value {
            min-width: 60px;
            text-align: center;
            font-weight: 600;
            background: #f8f9fa;
            padding: 4px 8px;
            border-radius: 4px;
            border: 1px solid #ddd;
        }
        
        .ess-color-picker {
            width: 60px;
            height: 40px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
        }
        
        .ess-select {
            min-width: 200px;
            padding: 8px 12px;
            border-radius: 4px;
            border: 1px solid #ddd;
        }
        
        .ess-checkbox {
            transform: scale(1.2);
        }
        
        .ess-number {
            width: 100px;
            padding: 8px 12px;
            border-radius: 4px;
            border: 1px solid #ddd;
        }
        
        .ess-live-preview-controls {
            margin-bottom: 20px;
            display: flex;
            gap: 12px;
        }
        
        .ess-preview-toggle.active {
            background: #0073aa;
            color: white;
        }
        
        .ess-notification {
            margin-bottom: 20px;
        }
        </style>
    `;
    
    $('head').append(adminCSS);
});
