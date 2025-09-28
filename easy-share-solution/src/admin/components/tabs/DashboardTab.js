/**
 * Dashboard Tab Component
 */

import { __ } from '@wordpress/i18n';
import { Card, CardBody, Button } from '@wordpress/components';

const DashboardTab = ({ settings, isProActive, setActiveTab }) => {
    const handleQuickAction = (tabName) => {
        // Direct DOM manipulation approach for WordPress TabPanel
        const tabButton = document.querySelector(`button[id*="${tabName}"]`);
        if (tabButton) {
            tabButton.click();
        } else {
            // Fallback: try finding by data attribute or class
            const altTabButton = document.querySelector(`[data-tab="${tabName}"], .ess-tab-${tabName} button`);
            if (altTabButton) {
                altTabButton.click();
            }
        }
    };

    return (
        <div className="ess-dashboard-tab">
            {/* Hero Section */}
            <div className="ess-dashboard-hero">
                <div className="ess-hero-content">
                    <h2 className="ess-hero-title">
                        {__('Welcome to Easy Share Solution', 'easy-share-solution')}
                    </h2>
                    <p className="ess-hero-description">
                        {__('Manage your social sharing settings and monitor performance with our modern, user-friendly dashboard.', 'easy-share-solution')}
                    </p>
                    <Button 
                            isPrimary 
                            className="ess-dashboard-hero-btn"
                            onClick={() => handleQuickAction('analytics')}
                        >
                            {__('View Analytics', 'easy-share-solution')}
                    </Button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="ess-dashboard-stats">
                <div className="ess-stat-card ess-stat-card--primary">
                    <div className="ess-stat-card__header">
                        <div className="ess-stat-card__icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </div>
                    </div>
                    <div className="ess-stat-card__content">
                        <h3 className="ess-stat-card__number">63+</h3>
                        <p className="ess-stat-card__label">
                            {__('Available Platforms', 'easy-share-solution')}
                        </p>
                    </div>
                </div>

                <div className="ess-stat-card ess-stat-card--success">
                    <div className="ess-stat-card__header">
                        <div className="ess-stat-card__icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                            </svg>
                        </div>
                    </div>
                    <div className="ess-stat-card__content">
                        <h3 className="ess-stat-card__number">
                            {settings.selected_platforms?.length || 0}
                        </h3>
                        <p className="ess-stat-card__label">
                            {__('Active Platforms', 'easy-share-solution')}
                        </p>
                    </div>
                </div>

                <div className={`ess-stat-card ${settings.enabled ? 'ess-stat-card--online' : 'ess-stat-card--offline'}`}>
                    <div className="ess-stat-card__header">
                        <div className="ess-stat-card__icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                                <circle cx="12" cy="12" r="3" fill="currentColor"/>
                            </svg>
                        </div>
                    </div>
                    <div className="ess-stat-card__content">
                        <h3 className="ess-stat-card__number">
                            {settings.enabled ? __('Active', 'easy-share-solution') : __('Inactive', 'easy-share-solution')}
                        </h3>
                        <p className="ess-stat-card__label">
                            {__('Plugin Status', 'easy-share-solution')}
                        </p>
                    </div>
                </div>

                {/* Pro Features Banner */}
                {isProActive && (
                    <div className="ess-stat-card ess-stat-card--pro">
                        <div className="ess-stat-card__header">
                            <div className="ess-stat-card__icon">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                    <path d="M12 2L15.09 8.26L22 9L17 14L18.18 21L12 17.77L5.82 21L7 14L2 9L8.91 8.26L12 2Z" fill="currentColor"/>
                                </svg>
                            </div>
                        </div>
                        <div className="ess-stat-card__content">
                            <h3 className="ess-stat-card__number">PRO</h3>
                            <p className="ess-stat-card__label">
                                {__('Version Active', 'easy-share-solution')}
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Quick Actions */}
            <Card className="ess-quick-actions-card">
                <CardBody>
                    <h3>{__('Quick Action', 'easy-share-solution')}</h3>
                    <div className="ess-quick-actions">
                        <Button 
                            isPrimary 
                            className="ess-quick-action-btn"
                            onClick={() => handleQuickAction('analytics')}
                        >
                            {__('View Analytics', 'easy-share-solution')}
                        </Button>
                        <Button 
                            isSecondary 
                            className="ess-quick-action-btn"
                            onClick={() => handleQuickAction('design')}
                        >
                            {__('Customize Design', 'easy-share-solution')}
                        </Button>
                        <Button 
                            isSecondary 
                            className="ess-quick-action-btn"
                            onClick={() => handleQuickAction('advanced')}
                        >
                            {__('Advanced Settings', 'easy-share-solution')}
                        </Button>
                    </div>
                </CardBody>
            </Card>

            {/* Pro Upgrade Section (for free users) */}
            {!isProActive && (
                <Card className="ess-pro-upgrade-card">
                    <CardBody>
                        <div className="ess-pro-upgrade-content">
                            <h3 className="ess-pro-upgrade-title">
                                {__('Unlock Pro Features', 'easy-share-solution')}
                            </h3>
                            <p className="ess-pro-upgrade-description">
                                {__('Get access to advanced analytics, unlimited platforms, and priority support.', 'easy-share-solution')}
                            </p>
                            
                            <div className="ess-pro-features">
                                <div className="ess-pro-feature">
                                    <span className="ess-pro-feature__icon">📊</span>
                                    <span className="ess-pro-feature__text">
                                        {__('Advanced Analytics', 'easy-share-solution')}
                                    </span>
                                </div>
                                <div className="ess-pro-feature">
                                    <span className="ess-pro-feature__icon">🚀</span>
                                    <span className="ess-pro-feature__text">
                                        {__('Unlimited Platforms', 'easy-share-solution')}
                                    </span>
                                </div>
                                <div className="ess-pro-feature">
                                    <span className="ess-pro-feature__icon">🎨</span>
                                    <span className="ess-pro-feature__text">
                                        {__('Custom CSS & Styling', 'easy-share-solution')}
                                    </span>
                                </div>
                                <div className="ess-pro-feature">
                                    <span className="ess-pro-feature__icon">🛒</span>
                                    <span className="ess-pro-feature__text">
                                        {__('WooCommerce Integration', 'easy-share-solution')}
                                    </span>
                                </div>
                                <div className="ess-pro-feature">
                                    <span className="ess-pro-feature__icon">🎯</span>
                                    <span className="ess-pro-feature__text">
                                        {__('Advanced Targeting Options', 'easy-share-solution')}
                                    </span>
                                </div>
                                <div className="ess-pro-feature">
                                    <span className="ess-pro-feature__icon">📧</span>
                                    <span className="ess-pro-feature__text">
                                        {__('Priority Support', 'easy-share-solution')}
                                    </span>
                                </div>
                            </div>
                            
                            <div className="ess-pro-upgrade-actions">
                                <Button isPrimary size="large" href="https://wpthemespace.com/product/easy-share-solution/#pricing" className="ess-upgrade-pro-header-button">
                                    {__('Upgrade Now', 'easy-share-solution')}
                                </Button>
                                <Button isLink href="https://wpthemespace.com/product/easy-share-solution/" className="ess-learn-more-btn">
                                    {__('Learn More', 'easy-share-solution')}
                                </Button>
                            </div>
                        </div>
                    </CardBody>
                </Card>
            )}
        </div>
    );
};

export default DashboardTab;
