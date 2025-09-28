/**
 * Easy Share Solution - Frontend JavaScript
 */

(function($) {
    'use strict';

    /**
     * Easy Share Handler Class
     */
    class EasyShareHandler {
        constructor() {
            // Get settings from localized script
            this.settings = window.easyShareFrontend || {};
            this.rateLimitData = {};
            this.init();
        }

        init() {
            // Check device restrictions
            if (!this.checkDeviceRestrictions()) {
                return;
            }
            
            // Initialize based on lazy loading setting
            if (this.settings.lazyLoading) {
                this.initLazyLoading();
            } else {
                this.initImmediate();
            }
        }
        
        /**
         * Check if current device is allowed
         */
        checkDeviceRestrictions() {
            const deviceRestrictions = this.settings.deviceRestrictions || {
                mobile: true,
                tablet: true,
                desktop: true
            };
            
            const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
            const isTablet = /iPad|Android(?!.*Mobile)/i.test(navigator.userAgent);
            const isDesktop = !isMobile && !isTablet;
            
            if (isMobile && !deviceRestrictions.mobile) return false;
            if (isTablet && !deviceRestrictions.tablet) return false;
            if (isDesktop && !deviceRestrictions.desktop) return false;
            
            return true;
        }
        
        /**
         * Initialize with lazy loading
         */
        initLazyLoading() {
            // Use Intersection Observer for lazy loading
            if ('IntersectionObserver' in window) {
                const observer = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            this.initShareButtons($(entry.target));
                            observer.unobserve(entry.target);
                        }
                    });
                });
                
                $('.ess-share-block, .ess-floating-panel').each(function() {
                    observer.observe(this);
                });
            } else {
                // Fallback for older browsers
                this.initImmediate();
            }
        }
        
        /**
         * Initialize immediately
         */
        initImmediate() {
            this.bindEvents();
            this.initFloatingPanel();
            this.handleResponsiveToggle();
            this.initGlobalScrollHide();
            this.initContinuousAnimations();
        }
        
        /**
         * Initialize share buttons for a specific container
         */
        initShareButtons($container) {
            if ($container.hasClass('ess-initialized')) {
                return;
            }
            
            $container.addClass('ess-initialized');
            this.bindEvents();
            
            if ($container.hasClass('ess-floating-panel')) {
                this.initFloatingPanel();
            }
        }
        
        /**
         * Check rate limiting before allowing share
         */
        checkRateLimit(platform) {
            const rateLimiting = this.settings.rateLimiting || {};
            
            if (!rateLimiting.enabled) {
                return true;
            }
            
            const now = Date.now();
            const minute = Math.floor(now / 60000);
            const hour = Math.floor(now / 3600000);
            const day = Math.floor(now / 86400000);
            
            // Initialize tracking if not exists
            if (!this.rateLimitData[platform]) {
                this.rateLimitData[platform] = {
                    minute: { time: minute, count: 0 },
                    hour: { time: hour, count: 0 },
                    day: { time: day, count: 0 }
                };
            }
            
            const data = this.rateLimitData[platform];
            
            // Reset counters if time periods have changed
            if (data.minute.time !== minute) {
                data.minute = { time: minute, count: 0 };
            }
            if (data.hour.time !== hour) {
                data.hour = { time: hour, count: 0 };
            }
            if (data.day.time !== day) {
                data.day = { time: day, count: 0 };
            }
            
            // Check limits
            const limits = {
                minute: rateLimiting.max_shares_per_minute || 10,
                hour: rateLimiting.max_shares_per_hour || 100,
                day: rateLimiting.max_shares_per_day || 1000
            };
            
            if (data.minute.count >= limits.minute ||
                data.hour.count >= limits.hour ||
                data.day.count >= limits.day) {
                return false;
            }
            
            // Increment counters
            data.minute.count++;
            data.hour.count++;
            data.day.count++;
            
            return true;
        }

        /**
         * Bind click events
         */
        bindEvents() {
            $(document).on('click', '.ess-share-button, .ess-share-link, .ess-copy-link', this.handleShare.bind(this));
            $(document).on('click', '.ess-toggle-button', this.toggleFloatingPanel.bind(this));
            $(document).on('click', '.ess-more-button', this.openSharePopup.bind(this));
            $(document).on('click', '.ess-floating-more-button', this.openFloatingPopup.bind(this));
            $(document).on('click', '.ess-popup-close, .ess-popup-overlay', this.closeAllPopups.bind(this));
            $(document).on('click', '.ess-popup-platform', this.handlePopupShare.bind(this));
            $(document).on('keydown', this.handlePopupKeydown.bind(this));
        }

        /**
         * Handle share button click
         */
        handleShare(e) {
            e.preventDefault();
            
            const $button = $(e.currentTarget);
            
            // Skip if this is a more button (they have their own handlers)
            if ($button.hasClass('ess-more-button') || $button.hasClass('ess-floating-more-button')) {
                return;
            }
            
            const platform = $button.data('platform');
            const url = $button.attr('data-url'); // Use attr instead of data to avoid jQuery caching issues
            
            // Check rate limiting
            if (!this.checkRateLimit(platform)) {
                this.showRateLimitMessage();
                return;
            }
            
            if (platform === 'copy-link') {
                this.copyToClipboard();
                return;
            }

            // Track the share
            this.trackShare(platform);
            
            // Open share URL
            this.openShareWindow(platform, url);
            
            // Add animation
            this.animateButton($button);
        }
        
        /**
         * Show rate limit message
         */
        showRateLimitMessage() {
            // Create and show a temporary message
            const message = $('<div class="ess-rate-limit-message">Too many shares. Please wait a moment.</div>');
            message.css({
                position: 'fixed',
                top: '20px',
                right: '20px',
                background: '#f44336',
                color: 'white',
                padding: '10px 15px',
                borderRadius: '4px',
                zIndex: 10000,
                fontSize: '14px'
            });
            
            $('body').append(message);
            
            setTimeout(() => {
                message.fadeOut(() => message.remove());
            }, 3000);
        }

        /**
         * Open share window
         */
        openShareWindow(platform, shareUrl) {
            const currentUrl = encodeURIComponent(window.location.href);
            const currentTitle = encodeURIComponent(document.title);
            
            // Replace placeholders in share URL
            const finalUrl = shareUrl
                .replace(/{url}/g, currentUrl)
                .replace(/{title}/g, currentTitle);
            
            // Special handling for email and SMS
            if (platform === 'email' || platform === 'sms') {
                window.location.href = finalUrl;
                return;
            }
            
            // Open in popup window
            const popup = window.open(
                finalUrl,
                'share-' + platform,
                'width=600,height=400,scrollbars=yes,resizable=yes'
            );
            
            if (popup) {
                popup.focus();
            }
        }

        /**
         * Copy current URL to clipboard
         */
        copyToClipboard() {
            const url = window.location.href;
            
            if (navigator.clipboard && window.isSecureContext) {
                // Use modern clipboard API
                navigator.clipboard.writeText(url).then(() => {
                    this.showCopyNotification(true);
                }).catch(() => {
                    this.fallbackCopyToClipboard(url);
                });
            } else {
                // Fallback for older browsers
                this.fallbackCopyToClipboard(url);
            }
            
            // Track copy action
            this.trackShare('copy-link');
        }

        /**
         * Fallback copy method
         */
        fallbackCopyToClipboard(text) {
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            textArea.style.top = '-999999px';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            
            try {
                const successful = document.execCommand('copy');
                this.showCopyNotification(successful);
            } catch (err) {
                this.showCopyNotification(false);
            }
            
            document.body.removeChild(textArea);
        }

        /**
         * Show copy notification
         */
        showCopyNotification(success) {
            const message = success ? 
                (easyShareFrontend.copySuccessMessage || 'Link copied to clipboard!') :
                (easyShareFrontend.copyErrorMessage || 'Failed to copy link');
            
            const $notification = $(`
                <div class="ess-copy-notification ${success ? 'success' : 'error'}">
                    ${message}
                </div>
            `);
            
            $('body').append($notification);
            
            // Show notification
            setTimeout(() => {
                $notification.addClass('show');
            }, 100);
            
            // Hide notification
            setTimeout(() => {
                $notification.removeClass('show');
                setTimeout(() => {
                    $notification.remove();
                }, 300);
            }, 3000);
        }

        /**
         * Track share action with caching and security
         */
        trackShare(platform) {
            if (!easyShareFrontend.ajaxUrl || !easyShareFrontend.nonce) {
                return;
            }
            
            const postId = this.getCurrentPostId();
            const url = window.location.href;
            
            // Check cache first
            const cacheKey = `ess_share_${postId}_${platform}`;
            const cached = this.getFromCache(cacheKey);
            
            if (cached && cached.timestamp > Date.now() - (this.settings.cacheDuration * 1000)) {
                return;
            }
            
            // Check rate limiting
            if (!this.checkRateLimit()) {
                return;
            }
            
            $.ajax({
                url: easyShareFrontend.ajaxUrl,
                type: 'POST',
                data: {
                    action: 'easy_share_track',
                    platform: platform,
                    post_id: postId,
                    url: url,
                    nonce: easyShareFrontend.nonce
                },
                success: (response) => {
                    if (response.success) {
                        // Cache the result
                        this.setCache(cacheKey, {
                            data: response.data,
                            timestamp: Date.now()
                        });
                    }
                },
                error: (xhr, status, error) => {
                    // Silent error handling
                }
            });
        }
        
        /**
         * Get data from cache
         */
        getFromCache(key) {
            if (!this.settings.cacheEnabled) {
                return null;
            }
            
            try {
                const cached = localStorage.getItem(key);
                return cached ? JSON.parse(cached) : null;
            } catch (e) {
                return null;
            }
        }
        
        /**
         * Set data to cache
         */
        setCache(key, data) {
            if (!this.settings.cacheEnabled) {
                return;
            }
            
            try {
                localStorage.setItem(key, JSON.stringify(data));
            } catch (e) {
                // Silent error handling
            }
        }
        
        /**
         * Check rate limiting
         */
        checkRateLimit() {
            const rateLimiting = this.settings.rateLimiting;
            
            if (!rateLimiting || !rateLimiting.enabled) {
                return true;
            }
            
            const now = Date.now();
            const minute = Math.floor(now / 60000);
            const hour = Math.floor(now / 3600000);
            const day = Math.floor(now / 86400000);
            
            // Check per minute limit
            if (rateLimiting.max_shares_per_minute) {
                const minuteKey = `rate_limit_minute_${minute}`;
                const minuteCount = parseInt(localStorage.getItem(minuteKey) || '0');
                
                if (minuteCount >= rateLimiting.max_shares_per_minute) {
                    return false;
                }
                
                localStorage.setItem(minuteKey, (minuteCount + 1).toString());
                
                // Clean up old minute data
                setTimeout(() => localStorage.removeItem(minuteKey), 60000);
            }
            
            // Check per hour limit
            if (rateLimiting.max_shares_per_hour) {
                const hourKey = `rate_limit_hour_${hour}`;
                const hourCount = parseInt(localStorage.getItem(hourKey) || '0');
                
                if (hourCount >= rateLimiting.max_shares_per_hour) {
                    return false;
                }
                
                localStorage.setItem(hourKey, (hourCount + 1).toString());
                
                // Clean up old hour data
                setTimeout(() => localStorage.removeItem(hourKey), 3600000);
            }
            
            // Check per day limit
            if (rateLimiting.max_shares_per_day) {
                const dayKey = `rate_limit_day_${day}`;
                const dayCount = parseInt(localStorage.getItem(dayKey) || '0');
                
                if (dayCount >= rateLimiting.max_shares_per_day) {
                    return false;
                }
                
                localStorage.setItem(dayKey, (dayCount + 1).toString());
                
                // Clean up old day data
                setTimeout(() => localStorage.removeItem(dayKey), 86400000);
            }
            
            return true;
        }

        /**
         * Open share popup
         */
        openSharePopup(e) {
            e.preventDefault();
            const $button = $(e.currentTarget);
            const $popup = $button.siblings('.ess-share-popup');
            
            if ($popup.length) {
                // Use CSS animation
                $popup.css('display', 'block').removeClass('ess-popup-closing');
                $('body').addClass('ess-popup-open');
                
                // Focus first platform for accessibility
                setTimeout(() => {
                    $popup.find('.ess-popup-platform').first().focus();
                }, 200);
            }
        }

        /**
         * Open floating panel popup
         */
        openFloatingPopup(e) {
            e.preventDefault();
            e.stopPropagation();
            
            // Find the floating popup globally (it's now in wp_footer, not a sibling)
            const $popup = $('.ess-floating-popup');
            
            if ($popup.length) {
                // Use CSS animation
                $popup.css('display', 'block').removeClass('ess-popup-closing');
                $('body').addClass('ess-popup-open');
                
                // Focus first platform for accessibility
                setTimeout(() => {
                    $popup.find('.ess-popup-platform').first().focus();
                }, 200);
            }
        }

        /**
         * Close all popups
         */
        closeAllPopups(e) {
            e.preventDefault();
            const $sharePopup = $('.ess-share-popup:visible');
            const $floatingPopup = $('.ess-floating-popup:visible');
            
            // Close share popup
            if ($sharePopup.length) {
                // Add closing animation
                $sharePopup.addClass('ess-popup-closing');
                $('body').removeClass('ess-popup-open');
                
                // Hide after animation completes
                setTimeout(() => {
                    $sharePopup.css('display', 'none').removeClass('ess-popup-closing');
                }, 400);
                
                // Return focus to more button
                const $moreButton = $sharePopup.siblings('.ess-more-button');
                if ($moreButton.length) {
                    $moreButton.focus();
                }
            }
            
            // Close floating popup
            if ($floatingPopup.length) {
                // Add closing animation
                $floatingPopup.addClass('ess-popup-closing');
                $('body').removeClass('ess-popup-open');
                
                // Hide after animation completes
                setTimeout(() => {
                    $floatingPopup.css('display', 'none').removeClass('ess-popup-closing');
                }, 400);
                
                // Return focus to floating more button (find globally since popup is now in footer)
                const $floatingMoreButton = $('.ess-floating-more-button');
                if ($floatingMoreButton.length) {
                    $floatingMoreButton.focus();
                }
            }
        }

        /**
         * Close share popup (legacy method for compatibility)
         */
        closeSharePopup(e) {
            this.closeAllPopups(e);
        }

        /**
         * Handle popup platform share
         */
        handlePopupShare(e) {
            e.preventDefault();
            const $platform = $(e.currentTarget);
            const platform = $platform.data('platform');
            const url = $platform.data('url');
            
            if (platform === 'copy-link') {
                this.copyToClipboard();
            } else {
                this.openShareWindow(platform, url);
                this.trackShare(platform);
            }
            
            // Close popup after sharing
            this.closeAllPopups(e);
        }

        /**
         * Handle keyboard navigation in popup
         */
        handlePopupKeydown(e) {
            const $sharePopup = $('.ess-share-popup:visible');
            const $floatingPopup = $('.ess-floating-popup:visible');
            const $popup = $sharePopup.length ? $sharePopup : $floatingPopup;
            
            if (!$popup.length) return;
            
            switch(e.key) {
                case 'Escape':
                    this.closeAllPopups(e);
                    break;
                case 'Tab':
                    this.handlePopupTabNavigation(e, $popup);
                    break;
            }
        }

        /**
         * Handle tab navigation within popup
         */
        handlePopupTabNavigation(e, $popup) {
            const $focusableElements = $popup.find('.ess-popup-platform, .ess-popup-close');
            const $firstElement = $focusableElements.first();
            const $lastElement = $focusableElements.last();
            const $activeElement = $(document.activeElement);
            
            if (e.shiftKey) {
                // Shift + Tab (backward)
                if ($activeElement.is($firstElement)) {
                    e.preventDefault();
                    $lastElement.focus();
                }
            } else {
                // Tab (forward)
                if ($activeElement.is($lastElement)) {
                    e.preventDefault();
                    $firstElement.focus();
                }
            }
        }

        /**
         * Get current post ID
         */
        getCurrentPostId() {
            // First, try to get from localized script
            if (window.easyShareFrontend && window.easyShareFrontend.currentPostId) {
                return parseInt(window.easyShareFrontend.currentPostId);
            }
            
            // Try to get post ID from body class
            const bodyClasses = document.body.className;
            const postIdMatch = bodyClasses.match(/postid-(\d+)/);
            
            if (postIdMatch) {
                return parseInt(postIdMatch[1]);
            }
            
            // Fallback: try to get from URL or other methods
            const urlParams = new URLSearchParams(window.location.search);
            const urlPostId = urlParams.get('p') || urlParams.get('post_id');
            
            if (urlPostId) {
                return parseInt(urlPostId);
            }
            
            // Default fallback
            return 0;
        }

        /**
         * Initialize floating panel
         */
        initFloatingPanel() {
            const $panel = $('.ess-floating-panel');
            if ($panel.length === 0) {
                return;
            }
            
            // Check if panel should be hidden by default
            const isHidden = localStorage.getItem('ess_floating_panel_hidden') === 'true';
            if (isHidden) {
                $panel.hide();
            }
            
            // Handle responsive state loading
            this.loadResponsiveState($panel);
            
            // Handle auto-hide functionality
            if ($panel.hasClass('ess-auto-hide')) {
                this.initAutoHide($panel);
            }
            
            // Handle fold/expand functionality
            const currentIsMobile = this.isMobile();
            let displayMode = '';
            
            if (currentIsMobile) {
                // Check mobile display mode
                if ($panel.hasClass('ess-mobile-display-fold')) {
                    displayMode = 'fold';
                } else if ($panel.hasClass('ess-mobile-display-expand')) {
                    displayMode = 'expand';
                }
            } else {
                // Check desktop display mode
                if ($panel.hasClass('ess-display-fold')) {
                    displayMode = 'fold';
                } else if ($panel.hasClass('ess-display-expand')) {
                    displayMode = 'expand';
                }
            }
            
            if (displayMode === 'fold') {
                this.initFoldMode($panel);
            } else if (displayMode === 'expand') {
                this.initExpandMode($panel);
            }
            
            // Initialize scroll-based hiding for both mobile and desktop
            // Only if auto-hide-scroll is enabled
            const autoHideScroll = $panel.data('auto-hide-scroll');
            if (autoHideScroll === true || autoHideScroll === 'true') {
                this.initScrollHide($panel);
            }
        }

        /**
         * Initialize auto-hide functionality (time-based only)
         */
        initAutoHide($panel) {
            const autoHideDelay = parseFloat($panel.data('auto-hide-delay')) || 3;
            const delayMs = autoHideDelay * 1000; // Convert to milliseconds
            let autoHideTimeout;
            
            // Function to start auto-hide timer
            const startAutoHideTimer = () => {
                clearTimeout(autoHideTimeout);
                autoHideTimeout = setTimeout(() => {
                    $panel.addClass('ess-auto-hide-active');
                }, delayMs);
            };
            
            // Function to stop auto-hide
            const stopAutoHide = () => {
                clearTimeout(autoHideTimeout);
                $panel.removeClass('ess-auto-hide-active');
            };
            
            // Start initial timer
            startAutoHideTimer();
            
            // Reset timer on user interaction
            $panel.on('mouseenter focus', stopAutoHide);
            $panel.on('mouseleave blur', startAutoHideTimer);
            
            // Handle clicks to temporarily stop auto-hide
            $panel.on('click', () => {
                stopAutoHide();
                // Restart timer after 1 second
                setTimeout(startAutoHideTimer, 1000);
            });
        }

        /**
         * Initialize fold mode
         */
        initFoldMode($panel) {
            const $content = $panel.find('.ess-panel-content');
            const $toggleButton = $panel.find('.ess-toggle-button');
            
            // Always start in folded state on page load
            $content.removeClass('open').addClass('ess-close').hide();
            $panel.removeClass('panel-open').addClass('panel-close');
            $toggleButton.removeClass('active');
            $toggleButton.find('.ess-close-icon').hide();
            $toggleButton.find('.ess-toggle-icon').show();
            
            // Clear any previous localStorage state to ensure fresh start
            localStorage.removeItem('ess_floating_panel_open');
        }

        /**
         * Initialize expand mode
         */
        initExpandMode($panel) {
            const $content = $panel.find('.ess-panel-content');
            const $toggleButton = $panel.find('.ess-toggle-button');
            $content.removeClass('ess-close').addClass('open').show();
            $panel.removeClass('panel-close').addClass('panel-open');
            $toggleButton.addClass('active');
            $toggleButton.find('.ess-toggle-icon').hide();
            $toggleButton.find('.ess-close-icon').show();
        }

        /**
         * Toggle floating panel
         */
        toggleFloatingPanel(e) {
            e.preventDefault();
            
            const $button = $(e.currentTarget);
            const $panel = $button.closest('.ess-floating-panel');
            const $content = $panel.find('.ess-panel-content');
            
            // Check display mode based on device type
            const deviceIsMobile = this.isMobile();
            let isFoldMode, isExpandMode;
            
            if (deviceIsMobile) {
                // On mobile, check mobile-specific display classes
                isFoldMode = $panel.hasClass('ess-mobile-display-fold');
                isExpandMode = $panel.hasClass('ess-mobile-display-expand');
            } else {
                // On desktop, check desktop display classes
                isFoldMode = $panel.hasClass('ess-display-fold');
                isExpandMode = $panel.hasClass('ess-display-expand');
            }
            
            // If not in a valid display mode, exit
            if (!isFoldMode && !isExpandMode) {
                return;
            }
            
            const isOpen = $content.hasClass('open') && $content.is(':visible');
            
            if (isOpen) {
                // Close the panel
                $content.removeClass('open').addClass('ess-close').slideUp(300);
                $panel.removeClass('panel-open').addClass('panel-close');
                $button.removeClass('active');
                $button.find('.ess-close-icon').hide();
                $button.find('.ess-toggle-icon').show();
            } else {
                // Open the panel
                $content.removeClass('ess-close').addClass('open').slideDown(300);
                $panel.removeClass('panel-close').addClass('panel-open');
                $button.addClass('active');
                $button.find('.ess-toggle-icon').hide();
                $button.find('.ess-close-icon').show();
            }
            
            // Only save state for expand mode, not fold mode
            // Fold mode should always start closed on page reload
            // Save state separately for mobile and desktop
            const toggleIsMobile = this.isMobile();
            const storageKey = toggleIsMobile ? 'ess_floating_panel_open_mobile' : 'ess_floating_panel_open_desktop';
            
            if (isExpandMode) {
                localStorage.setItem(storageKey, !isOpen);
            }
        }

        /**
         * Animate button on click
         */
        animateButton($button) {
            $button.addClass('ess-bounce');
            setTimeout(() => {
                $button.removeClass('ess-bounce');
            }, 500);
        }

        /**
         * Load responsive state based on device type
         */
        loadResponsiveState($panel) {
            const initIsMobile = this.isMobile();
            const storageKey = initIsMobile ? 'ess_floating_panel_open_mobile' : 'ess_floating_panel_open_desktop';
            const savedState = localStorage.getItem(storageKey);
            
            // Check current display mode
            let isExpandMode = false;
            if (initIsMobile) {
                isExpandMode = $panel.hasClass('ess-mobile-display-expand');
            } else {
                isExpandMode = $panel.hasClass('ess-display-expand');
            }
            
            // Only apply saved state for expand mode
            if (isExpandMode && savedState === 'true') {
                const $content = $panel.find('.ess-panel-content');
                const $toggleButton = $panel.find('.ess-toggle-button');
                
                $content.removeClass('ess-close').addClass('open').show();
                $panel.removeClass('panel-close').addClass('panel-open');
                $toggleButton.addClass('active');
                $toggleButton.find('.ess-toggle-icon').hide();
                $toggleButton.find('.ess-close-icon').show();
            } else if (isExpandMode && savedState === 'false') {
                // Expand mode but user chose to close it, so apply close classes
                const $content = $panel.find('.ess-panel-content');
                const $toggleButton = $panel.find('.ess-toggle-button');
                
                $content.removeClass('open').addClass('ess-close').hide();
                $panel.removeClass('panel-open').addClass('panel-close');
                $toggleButton.removeClass('active');
                $toggleButton.find('.ess-close-icon').hide();
                $toggleButton.find('.ess-toggle-icon').show();
            }
        }

        /**
         * Handle responsive behavior changes
         */
        handleResponsiveToggle() {
            const self = this;
            let resizeTimeout;
            
            // Handle window resize to reinitialize panels if device type changes
            $(window).on('resize', function() {
                clearTimeout(resizeTimeout);
                resizeTimeout = setTimeout(function() {
                    $('.ess-floating-panel').each(function() {
                        self.reinitializePanel($(this));
                    });
                }, 250);
            });
        }

        /**
         * Reinitialize panel based on current screen size
         */
        reinitializePanel($panel) {
            const isMobile = this.isMobile();
            let displayMode = '';
            
            if (isMobile) {
                // Check mobile display mode
                if ($panel.hasClass('ess-mobile-display-fold')) {
                    displayMode = 'fold';
                } else if ($panel.hasClass('ess-mobile-display-expand')) {
                    displayMode = 'expand';
                }
            } else {
                // Check desktop display mode
                if ($panel.hasClass('ess-display-fold')) {
                    displayMode = 'fold';
                } else if ($panel.hasClass('ess-display-expand')) {
                    displayMode = 'expand';
                }
            }
            
            // Reinitialize based on current display mode
            if (displayMode === 'fold') {
                this.initFoldMode($panel);
            } else if (displayMode === 'expand') {
                this.initExpandMode($panel);
            }
        }

        /**
         * Check if device is mobile
         */
        isMobile() {
            return window.innerWidth <= 768;
        }

        /**
         * Initialize scroll-based hide functionality (works on mobile and desktop)
         */
        initScrollHide($panel) {
            let lastScrollTop = 0;
            let scrollTimeout;
            let ticking = false;
            
            const handleScroll = () => {
                const scrollTop = $(window).scrollTop();
                const scrollDelta = scrollTop - lastScrollTop;
                
                // Only process scroll if moved more than 5px to prevent jitter
                if (Math.abs(scrollDelta) < 5) {
                    ticking = false;
                    return;
                }
                
                if (scrollDelta > 0 && scrollTop > 100) {
                    // Scrolling down - hide panel with animation
                    $panel.removeClass('ess-fade-in').addClass('ess-hidden ess-fade-out');
                } else if (scrollDelta < 0) {
                    // Scrolling up - show panel with animation
                    $panel.removeClass('ess-hidden ess-fade-out').addClass('ess-fade-in');
                }
                
                lastScrollTop = scrollTop;
                
                // Clear timeout and set new one
                clearTimeout(scrollTimeout);
                scrollTimeout = setTimeout(() => {
                    $panel.removeClass('ess-hidden ess-fade-out').addClass('ess-fade-in');
                }, 3000); // Show after 3 seconds of no scrolling
                
                ticking = false;
            };
            
            $(window).on('scroll', () => {
                if (!ticking) {
                    requestAnimationFrame(handleScroll);
                    ticking = true;
                }
            });
        }

        /**
         * Initialize continuous animations
         */
        initContinuousAnimations() {
            $('.ess-floating-panel').each(function() {
                const $panel = $(this);
                const continuousAnimation = $panel.data('continuous-animation');
                
                if (continuousAnimation && continuousAnimation !== 'none') {
                    const animationClass = 'ess-continuous-' + continuousAnimation;
                    
                    // Ensure the class is properly applied
                    if (!$panel.hasClass(animationClass)) {
                        $panel.addClass(animationClass);
                    }
                    
                    // Verify the animation is working by checking computed style
                    setTimeout(() => {
                        const computedStyle = window.getComputedStyle($panel[0]);
                        const animationName = computedStyle.animationName;
                        const animationDuration = computedStyle.animationDuration;
                        
                        if (animationName === 'none' || animationDuration === '0s') {
                            // Animation not working, but we'll fail silently
                        }
                    }, 100);
                }
            });
        }

        /**
         * Handle keyboard navigation
         */
        initKeyboardNavigation() {
            $(document).on('keydown', '.ess-share-button, .ess-share-link, .ess-copy-link', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    $(e.currentTarget).click();
                }
            });
            
            $(document).on('keydown', '.ess-toggle-button', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    $(e.currentTarget).click();
                }
            });
        }

        /**
         * Initialize accessibility features
         */
        initAccessibility() {
            // Add ARIA labels
            $('.ess-share-button, .ess-share-link, .ess-copy-link').each(function() {
                const $button = $(this);
                const platform = $button.data('platform');
                const platformName = $button.find('.ess-label').text() || platform;
                
                if (!$button.attr('aria-label')) {
                    $button.attr('aria-label', `Share on ${platformName}`);
                }
            });
            
            // Add role attributes
            $('.ess-share-block').attr('role', 'toolbar');
            $('.ess-floating-panel').attr('role', 'complementary');
        }

        /**
         * Handle window resize
         */
        initResizeHandler() {
            $(window).on('resize', this.debounce(() => {
                const $panel = $('.ess-floating-panel');
                if ($panel.length === 0) {
                    return;
                }
                
                // Reposition panel if needed
                this.repositionFloatingPanel($panel);
            }, 250));
        }

        /**
         * Reposition floating panel
         */
        repositionFloatingPanel($panel) {
            // Check if panel is off-screen and adjust
            const panelRect = $panel[0].getBoundingClientRect();
            const windowHeight = window.innerHeight;
            
            if (panelRect.bottom > windowHeight) {
                $panel.css('top', windowHeight - panelRect.height - 20);
            }
            
            if (panelRect.top < 0) {
                $panel.css('top', 20);
            }
        }

        /**
         * Debounce utility function
         */
        debounce(func, wait) {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        }

        /**
         * Global scroll-based hiding (backup method that always works)
         */
        initGlobalScrollHide() {
            let lastScrollTop = 0;
            let scrollTimeout;
            let ticking = false;
            
            const handleGlobalScroll = () => {
                const scrollTop = $(window).scrollTop();
                const scrollDelta = scrollTop - lastScrollTop;
                const $panels = $('.ess-scroll-auto-hide');
                
                if ($panels.length === 0) {
                    ticking = false;
                    return;
                }
                
                // Only process scroll if moved more than 10px to prevent jitter
                if (Math.abs(scrollDelta) < 10) {
                    ticking = false;
                    return;
                }
                
                if (scrollDelta > 0 && scrollTop > 100) {
                    // Scrolling down - hide all floating panels with animation
                    $panels.removeClass('ess-fade-in').addClass('ess-scroll-hidden ess-fade-out');
                } else if (scrollDelta < 0) {
                    // Scrolling up - show all floating panels with animation
                    $panels.removeClass('ess-scroll-hidden ess-fade-out').addClass('ess-fade-in');
                }
                
                lastScrollTop = scrollTop;
                
                // Clear timeout and set new one
                clearTimeout(scrollTimeout);
                scrollTimeout = setTimeout(() => {
                    $panels.removeClass('ess-scroll-hidden ess-fade-out').addClass('ess-fade-in');
                }, 2000); // Show after 2 seconds of no scrolling
                
                ticking = false;
            };
            
            $(window).on('scroll', () => {
                if (!ticking) {
                    requestAnimationFrame(handleGlobalScroll);
                    ticking = true;
                }
            });
        }
    }

    /**
     * Initialize when DOM is ready
     */
    $(document).ready(() => {
        const easyShare = new EasyShareHandler();
        
        // Initialize additional features
        easyShare.initKeyboardNavigation();
        easyShare.initAccessibility();
        easyShare.initResizeHandler();
    });

    /**
     * Handle dynamic content loading
     */
    $(document).on('DOMNodeInserted', (e) => {
        const $target = $(e.target);
        if ($target.hasClass('ess-share-block') || $target.hasClass('ess-floating-panel')) {
            // Reinitialize for dynamically loaded content
            setTimeout(() => {
                if (window.EasyShare) {
                    window.EasyShare.initAccessibility();
                }
            }, 100);
        }
    });

})(jQuery);

/**
 * Intelligent overflow management for center-positioned panels
 * This script manages scrollbar behavior for floating panels
 */
document.addEventListener('DOMContentLoaded', function() {
    const centerPanels = document.querySelectorAll('.ess-floating-panel.ess-position-center_left, .ess-floating-panel.ess-position-center_right');
    
    centerPanels.forEach(panel => {
        function checkOverflow() {
            const viewportHeight = window.innerHeight;
            const panelHeight = panel.scrollHeight;
            const panelTop = panel.getBoundingClientRect().top;
            
            // Only enable scrolling if panel would actually overflow viewport
            if (panelHeight > viewportHeight - 80) { // 80px buffer for margins
                panel.style.maxHeight = 'calc(100vh - 40px)';
                panel.style.overflowY = 'auto';
            } else {
                panel.style.maxHeight = 'none';
                panel.style.overflowY = 'visible';
            }
        }
        
        // Check initially and on window resize
        checkOverflow();
        window.addEventListener('resize', checkOverflow);
        
        // Also check when panel content changes (for dynamic loading)
        const observer = new MutationObserver(checkOverflow);
        observer.observe(panel, { childList: true, subtree: true });
    });
});
