/**
 * Main Admin App Component
 */

import { useState, useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { 
    TabPanel,
    Card,
    CardBody,
    Button,
    Spinner,
    Notice
} from '@wordpress/components';

// Import custom hooks
import { useSettings } from '../hooks/useSettings';
import { useProStatus } from '../hooks/useProStatus';

// Import tab components
import DashboardTab from './tabs/DashboardTab';
import GeneralSettingsTab from './tabs/GeneralSettingsTab';
import DesignSettingsTab from './tabs/DesignSettingsTab';

import PlatformSelectionTab from './tabs/PlatformSelectionTab';
import AnalyticsTab from './tabs/AnalyticsTab';
import AdvancedSettingsTab from './tabs/AdvancedSettingsTab';

const AdminApp = () => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [saveStatus, setSaveStatus] = useState('');
    const [resetStatus, setResetStatus] = useState('');
    
        const {
        settings,
        loading,
        errors,
        updateSetting,
        updateNestedSetting,
        saveSettings,
        resetSettings
    } = useSettings();
    const { isProActive, checkingPro } = useProStatus();

    // Tab configuration
    const tabs = [
        {
            name: 'dashboard',
            title: __('🏠 Dashboard', 'easy-share-solution'),
            component: DashboardTab,
            className: 'ess-tab-dashboard'
        },
        {
            name: 'analytics',
            title: __('📊 Analytics', 'easy-share-solution'),
            component: AnalyticsTab,
            className: 'ess-tab-analytics'
        },
        {
            name: 'general',
            title: __('⚙️ General Settings', 'easy-share-solution'),
            component: GeneralSettingsTab,
            className: 'ess-tab-general'
        },
        {
            name: 'design',
            title: __('🎨 Design Settings', 'easy-share-solution'),
            component: DesignSettingsTab,
            className: 'ess-tab-design'
        },
        {
            name: 'platforms',
            title: __('📱 Platform Selection', 'easy-share-solution'),
            component: PlatformSelectionTab,
            className: 'ess-tab-platforms'
        },
        
        {
            name: 'advanced',
            title: __('🔧 Advanced', 'easy-share-solution'),
            component: AdvancedSettingsTab,
            className: 'ess-tab-advanced',
            isPro: true
        }
    ];

    const handleSaveSettings = async () => {
        setSaveStatus('saving');
        try {
            await saveSettings();
            setSaveStatus('saved');
            setTimeout(() => setSaveStatus(''), 3000);
        } catch (error) {
            setSaveStatus('error');
            console.error('Save failed:', error);
            setTimeout(() => setSaveStatus(''), 5000);
        }
    };

    const handleResetSettings = async () => {
        if (!window.confirm(__('Are you sure you want to reset all settings to defaults? This action cannot be undone.', 'easy-share-solution'))) {
            return;
        }
        
        setResetStatus('resetting');
        try {
            await resetSettings();
            setResetStatus('reset');
            setTimeout(() => setResetStatus(''), 3000);
        } catch (error) {
            setResetStatus('error');
            console.error('Reset failed:', error);
            setTimeout(() => setResetStatus(''), 5000);
        }
    };

    const getSaveButtonText = () => {
        switch (saveStatus) {
            case 'saving':
                return __('Saving...', 'easy-share-solution');
            case 'saved':
                return __('✅ Saved!', 'easy-share-solution');
            case 'error':
                return __('❌ Error', 'easy-share-solution');
            default:
                return __('Save Settings', 'easy-share-solution');
        }
    };

    const getResetButtonText = () => {
        switch (resetStatus) {
            case 'resetting':
                return __('Resetting...', 'easy-share-solution');
            case 'reset':
                return __('✅ Reset!', 'easy-share-solution');
            case 'error':
                return __('❌ Error', 'easy-share-solution');
            default:
                return __('Reset to Defaults', 'easy-share-solution');
        }
    };

    if (loading || checkingPro) {
        return (
            <div className="ess-admin-loading">
                <Spinner />
                <p>{__('Loading Easy Share Solution...', 'easy-share-solution')}</p>
            </div>
        );
    }

    return (
        <div className="ess-admin-app">
            {/* Header */}
            <div className="ess-admin-header">
                <div className="ess-admin-header-content">
                    <h1 className="ess-admin-title">
                        {__('Easy Share Solution', 'easy-share-solution')}
                    </h1>
                    <div className="ess-admin-meta">
                        <span className="ess-version">v2.0.0</span>
                        {!isProActive && (
                            <>
                                <span className="ess-free-badge">
                                    {__('FREE', 'easy-share-solution')}
                                </span>
                                <a 
                                    href="https://wpthemespace.com/product/easy-share-solution/#pricing"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="ess-upgrade-pro-header-button"
                                >
                                    🚀 {__('Upgrade to Pro', 'easy-share-solution')}
                                </a>
                            </>
                        )}
                        {isProActive && (
                            <span className="ess-pro-badge">
                                {__('PRO', 'easy-share-solution')}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Error Messages */}
            {errors && errors.length > 0 && (
                <div className="ess-admin-errors">
                    {errors.map((error, index) => (
                        <Notice key={index} status="error" isDismissible={false}>
                            {error}
                        </Notice>
                    ))}
                </div>
            )}

            {/* Tab Panel */}
            <TabPanel
                className="ess-tab-panel"
                activeClass="is-active"
                initialTabName={activeTab}
                onSelect={(tabName) => setActiveTab(tabName)}
                tabs={tabs.map(tab => ({
                    name: tab.name,
                    title: tab.title,
                    className: `${tab.className} ${tab.isPro && !isProActive ? 'ess-tab-pro-locked' : ''}`
                }))}
            >
                {(tab) => {
                    const activeTabConfig = tabs.find(t => t.name === tab.name);
                    const TabComponent = activeTabConfig?.component;
                    
                    if (!TabComponent) {
                        return (
                            <Card>
                                <CardBody>
                                    <p>{__('Tab not found', 'easy-share-solution')}</p>
                                </CardBody>
                            </Card>
                        );
                    }

                    // Check if tab is locked for free users
                    if (activeTabConfig.isPro && !isProActive) {
                        return (
                            <Card className="ess-pro-feature-card">
                                <CardBody>
                                    <div className="ess-pro-overlay">
                                        <h2>🔒 {activeTabConfig.title.replace(/🔧|📊/, '').trim()}</h2>
                                        <p>{__('This feature is available in the Pro version.', 'easy-share-solution')}</p>
                                        <Button isPrimary href="https://wpthemespace.com/product/easy-share-solution/#pricing" target="_blank" rel="noopener noreferrer">
                                            {__('Upgrade to Pro', 'easy-share-solution')}
                                        </Button>
                                    </div>
                                </CardBody>
                            </Card>
                        );
                    }
                    
                    return (
                        <TabComponent 
                            settings={settings}
                            updateSetting={updateSetting}
                            updateNestedSetting={updateNestedSetting}
                            isProActive={isProActive}
                            hasProFeature={isProActive ? () => true : (feature) => false}
                            saveStatus={saveStatus}
                            setActiveTab={setActiveTab}
                        />
                    );
                }}
            </TabPanel>

            {/* Action Buttons */}
            <div className="ess-save-section">
                <div className="ess-button-group">
                    <Button
                        isSecondary
                        onClick={handleResetSettings}
                        disabled={resetStatus === 'resetting' || loading || saveStatus === 'saving'}
                        className={`ess-reset-button ess-reset-button--${resetStatus}`}
                        isDestructive
                    >
                        {getResetButtonText()}
                    </Button>
                    
                    <Button
                        isPrimary
                        onClick={handleSaveSettings}
                        disabled={saveStatus === 'saving' || loading || resetStatus === 'resetting'}
                        className={`ess-save-button ess-save-button--${saveStatus}`}
                    >
                        {getSaveButtonText()}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default AdminApp;
