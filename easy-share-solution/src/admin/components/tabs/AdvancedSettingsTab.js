/**
 * Advanced Settings Tab Component
 */

import React, { useState, useEffect } from 'react';
import { __ } from '@wordpress/i18n';
import { 
    Card, 
    CardBody, 
    TextareaControl, 
    ToggleControl, 
    RangeControl,
    SelectControl,
    CheckboxControl,
    Button,
    Notice,
    Spinner,
    __experimentalGrid as Grid,
    __experimentalSpacer as Spacer,
    __experimentalHeading as Heading,
    __experimentalText as Text,
    TabPanel,
    PanelBody,
    PanelRow
} from '@wordpress/components';
import apiFetch from '@wordpress/api-fetch';

const AdvancedSettingsTab = ({ settings, updateSetting, isProActive }) => {
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [notice, setNotice] = useState(null);
    const [systemInfo, setSystemInfo] = useState(null);

    // Load system info on component mount
    useEffect(() => {
        loadSystemInfo();
    }, []);

    // Get advanced settings from the main settings object
    const getAdvancedSetting = (key, defaultValue = null) => {
        return settings[key] !== undefined ? settings[key] : defaultValue;
    };

    // Update advanced setting using the parent's updateSetting function
    const updateAdvancedSetting = (key, value) => {
        updateSetting(key, value);
    };

    // Update nested settings
    const updateNestedSetting = (parentKey, childKey, value) => {
        const currentParent = getAdvancedSetting(parentKey, {});
        const updatedParent = {
            ...currentParent,
            [childKey]: value
        };
        updateAdvancedSetting(parentKey, updatedParent);
    };

    const loadSystemInfo = async () => {
        try {
            const response = await apiFetch({
                path: '/easy-share/v1/advanced/system-info',
                method: 'GET'
            });
            setSystemInfo(response);
        } catch (error) {
            console.error('Failed to load system info:', error);
            // Create fallback system info if API fails
            setSystemInfo({
                wordpress_version: 'Unknown',
                php_version: 'Unknown', 
                plugin_version: '2.0.0',
                active_plugins: []
            });
        }
    };

    const exportSettings = async () => {
        try {
            const response = await apiFetch({
                path: '/easy-share/v1/settings/all',
                method: 'GET'
            });
            
            const dataStr = JSON.stringify(response, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'easy-share-settings-' + new Date().toISOString().split('T')[0] + '.json';
            link.click();
            URL.revokeObjectURL(url);
            
            setNotice({
                type: 'success',
                message: __('Settings exported successfully', 'easy-share-solution')
            });
        } catch (error) {
            setNotice({
                type: 'error',
                message: __('Failed to export settings', 'easy-share-solution')
            });
        }
    };

    const resetAdvancedSettings = async () => {
        if (!confirm(__('Are you sure you want to reset all advanced settings to their default values?', 'easy-share-solution'))) {
            return;
        }

        // Reset advanced settings to defaults
        const defaultSettings = {
            custom_css: '',
            custom_js: '',
            lazy_loading: false,
            async_loading: true,
            cache_enabled: true,
            cache_duration: 3600,
            minify_css: false,
            minify_js: false,
            load_priority: 10,
            device_restrictions: {
                mobile: true,
                tablet: true,
                desktop: true
            },
            rate_limiting: {
                enabled: false,
                max_shares_per_minute: 10,
                max_shares_per_hour: 100,
                max_shares_per_day: 1000
            },
            security_settings: {
                csrf_protection: true,
                nonce_verification: true,
                sanitize_urls: true,
                validate_referrer: false
            }
        };

        Object.keys(defaultSettings).forEach(key => {
            updateAdvancedSetting(key, defaultSettings[key]);
        });

        setNotice({
            type: 'success',
            message: __('Advanced settings have been reset to defaults', 'easy-share-solution')
        });
    };

    return (
        <Card>
            <CardBody>
        <div className="ess-advanced-settings-tab">
            {notice && (
                <Notice 
                    status={notice.type} 
                    onRemove={() => setNotice(null)}
                    isDismissible
                >
                    {notice.message}
                </Notice>
            )}

            <div className="ess-tab-header">
                <Heading level={2}>{__('Advanced Settings', 'easy-share-solution')}</Heading>
                <Text className="ess-tab-description">
                    {__('Configure advanced options, performance settings, restrictions, and integrations.', 'easy-share-solution')}
                </Text>
            </div>

            <Spacer marginBottom={6} />

            <TabPanel
                className="ess-advanced-tabs"
                activeClass="active-tab"
                tabs={[
                    {
                        name: 'performance',
                        title: __('Performance', 'easy-share-solution'),
                        className: 'tab-performance',
                    },
                    {
                        name: 'customization',
                        title: __('Customization', 'easy-share-solution'),
                        className: 'tab-customization',
                    },
                    {
                        name: 'restrictions',
                        title: __('Restrictions', 'easy-share-solution'),
                        className: 'tab-restrictions',
                    },
                    {
                        name: 'security',
                        title: __('Security', 'easy-share-solution'),
                        className: 'tab-security',
                    },
                    {
                        name: 'tools',
                        title: __('Tools', 'easy-share-solution'),
                        className: 'tab-tools',
                    }
                ]}
            >
                {(tab) => (
                    <div className={`ess-tab-content ess-tab-${tab.name}`}>
                        {tab.name === 'performance' && (
                            <Grid columns={2} gap={6}>
                                <Card>
                                    <CardBody>
                                        <Heading level={3}>{__('Performance Optimization', 'easy-share-solution')}</Heading>
                                        
                                        <ToggleControl
                                            label={__('Enable Lazy Loading', 'easy-share-solution')}
                                            help={__('Load share buttons only when they become visible', 'easy-share-solution')}
                                            checked={getAdvancedSetting('lazy_loading', false)}
                                            onChange={(value) => updateAdvancedSetting('lazy_loading', value)}
                                        __nextHasNoMarginBottom={true}
                                        />
                                        
                                        <ToggleControl
                                            label={__('Async Script Loading', 'easy-share-solution')}
                                            help={__('Load scripts asynchronously to improve page speed', 'easy-share-solution')}
                                            checked={getAdvancedSetting('async_loading', true)}
                                            onChange={(value) => updateAdvancedSetting('async_loading', value)}
                                        __nextHasNoMarginBottom={true}
                                        />
                                        
                                        <ToggleControl
                                            label={__('Enable Caching', 'easy-share-solution')}
                                            help={__('Cache share counts and reduce API calls', 'easy-share-solution')}
                                            checked={getAdvancedSetting('cache_enabled', true)}
                                            onChange={(value) => updateAdvancedSetting('cache_enabled', value)}
                                        __nextHasNoMarginBottom={true}
                                        />
                                        
                                        {getAdvancedSetting('cache_enabled', true) && (
                                            <RangeControl
                                                label={__('Cache Duration (seconds)', 'easy-share-solution')}
                                                value={getAdvancedSetting('cache_duration', 3600)}
                                                onChange={(value) => updateAdvancedSetting('cache_duration', value)}
                                                min={300}
                                                max={86400}
                                                step={300}
                                            __next40pxDefaultSize={true}
                                            __nextHasNoMarginBottom={true}
                                            />
                                        )}
                                        
                                        <ToggleControl
                                            label={__('Minify CSS', 'easy-share-solution')}
                                            help={__('Compress CSS files for better performance', 'easy-share-solution')}
                                            checked={getAdvancedSetting('minify_css', false)}
                                            onChange={(value) => updateAdvancedSetting('minify_css', value)}
                                        __nextHasNoMarginBottom={true}
                                        />
                                        
                                        <ToggleControl
                                            label={__('Minify JavaScript', 'easy-share-solution')}
                                            help={__('Compress JavaScript files for better performance', 'easy-share-solution')}
                                            checked={getAdvancedSetting('minify_js', false)}
                                            onChange={(value) => updateAdvancedSetting('minify_js', value)}
                                        __nextHasNoMarginBottom={true}
                                        />
                                    </CardBody>
                                </Card>
                                
                                <Card>
                                    <CardBody>
                                        <Heading level={3}>{__('Loading Settings', 'easy-share-solution')}</Heading>
                                        
                                        <RangeControl
                                            label={__('Script Load Priority', 'easy-share-solution')}
                                            help={__('Lower numbers load earlier (10 is default)', 'easy-share-solution')}
                                            value={getAdvancedSetting('load_priority', 10)}
                                            onChange={(value) => updateAdvancedSetting('load_priority', value)}
                                            min={1}
                                            max={100}
                                        __next40pxDefaultSize={true}
                                        __nextHasNoMarginBottom={true}
                                        />
                                    </CardBody>
                                </Card>
                            </Grid>
                        )}

                        {tab.name === 'customization' && (
                            <Grid columns={1} gap={6}>
                                <Card>
                                    <CardBody>
                                        <Heading level={3}>{__('Custom CSS & JavaScript', 'easy-share-solution')}</Heading>
                                        
                                        <TextareaControl
                                            label={__('Custom CSS', 'easy-share-solution')}
                                            help={__('Add custom CSS to style your social sharing buttons. This CSS will be applied to the frontend.', 'easy-share-solution')}
                                            value={getAdvancedSetting('custom_css', '')}
                                            onChange={(value) => updateAdvancedSetting('custom_css', value)}
                                            rows={10}
                                            className="ess-custom-css-editor"
                                        />
                                        
                                        <Spacer marginTop={4} />
                                        
                                        <TextareaControl
                                            label={__('Custom JavaScript', 'easy-share-solution')}
                                            help={__('Add custom JavaScript code. Use with caution - requires theme editing permissions.', 'easy-share-solution')}
                                            value={getAdvancedSetting('custom_js', '')}
                                            onChange={(value) => updateAdvancedSetting('custom_js', value)}
                                            rows={8}
                                            className="ess-custom-js-editor"
                                        />
                                    </CardBody>
                                </Card>
                            </Grid>
                        )}

                        {tab.name === 'restrictions' && (
                            <Grid columns={2} gap={6}>
                                <Card>
                                    <CardBody>
                                        <Heading level={3}>{__('Device Restrictions', 'easy-share-solution')}</Heading>
                                        
                                        <CheckboxControl
                                            label={__('Show on Desktop', 'easy-share-solution')}
                                            checked={getAdvancedSetting('device_restrictions', { desktop: true }).desktop !== false}
                                            onChange={(value) => updateNestedSetting('device_restrictions', 'desktop', value)}
                                        __nextHasNoMarginBottom={true}
                                        />
                                        
                                        <CheckboxControl
                                            label={__('Show on Tablet', 'easy-share-solution')}
                                            checked={getAdvancedSetting('device_restrictions', { tablet: true }).tablet !== false}
                                            onChange={(value) => updateNestedSetting('device_restrictions', 'tablet', value)}
                                        __nextHasNoMarginBottom={true}
                                        />
                                        
                                        <CheckboxControl
                                            label={__('Show on Mobile', 'easy-share-solution')}
                                            checked={getAdvancedSetting('device_restrictions', { mobile: true }).mobile !== false}
                                            onChange={(value) => updateNestedSetting('device_restrictions', 'mobile', value)}
                                        __nextHasNoMarginBottom={true}
                                        />
                                    </CardBody>
                                </Card>
                                
                                <Card>
                                    <CardBody>
                                        <Heading level={3}>{__('Rate Limiting', 'easy-share-solution')}</Heading>
                                        
                                        <ToggleControl
                                            label={__('Enable Rate Limiting', 'easy-share-solution')}
                                            help={__('Prevent spam by limiting share requests', 'easy-share-solution')}
                                            checked={getAdvancedSetting('rate_limiting', { enabled: false }).enabled}
                                            onChange={(value) => updateNestedSetting('rate_limiting', 'enabled', value)}
                                        __nextHasNoMarginBottom={true}
                                        />
                                        
                                        {getAdvancedSetting('rate_limiting', { enabled: false }).enabled && (
                                            <>
                                                <RangeControl
                                                    label={__('Max Shares per Minute', 'easy-share-solution')}
                                                    value={getAdvancedSetting('rate_limiting', { max_shares_per_minute: 10 }).max_shares_per_minute}
                                                    onChange={(value) => updateNestedSetting('rate_limiting', 'max_shares_per_minute', value)}
                                                    min={1}
                                                    max={100}
                                                __next40pxDefaultSize={true}
                                                __nextHasNoMarginBottom={true}
                                                />
                                                
                                                <RangeControl
                                                    label={__('Max Shares per Hour', 'easy-share-solution')}
                                                    value={getAdvancedSetting('rate_limiting', { max_shares_per_hour: 100 }).max_shares_per_hour}
                                                    onChange={(value) => updateNestedSetting('rate_limiting', 'max_shares_per_hour', value)}
                                                    min={10}
                                                    max={1000}
                                                __next40pxDefaultSize={true}
                                                __nextHasNoMarginBottom={true}
                                                />
                                                
                                                <RangeControl
                                                    label={__('Max Shares per Day', 'easy-share-solution')}
                                                    value={getAdvancedSetting('rate_limiting', { max_shares_per_day: 1000 }).max_shares_per_day}
                                                    onChange={(value) => updateNestedSetting('rate_limiting', 'max_shares_per_day', value)}
                                                    min={100}
                                                    max={10000}
                                                __next40pxDefaultSize={true}
                                                __nextHasNoMarginBottom={true}
                                                />
                                            </>
                                        )}
                                    </CardBody>
                                </Card>
                            </Grid>
                        )}

                        {tab.name === 'security' && (
                            <Grid columns={2} gap={6}>
                                <Card>
                                    <CardBody>
                                        <Heading level={3}>{__('Security Options', 'easy-share-solution')}</Heading>
                                        
                                        <ToggleControl
                                            label={__('CSRF Protection', 'easy-share-solution')}
                                            help={__('Protect against Cross-Site Request Forgery attacks', 'easy-share-solution')}
                                            checked={getAdvancedSetting('security_settings', { csrf_protection: true }).csrf_protection}
                                            onChange={(value) => updateNestedSetting('security_settings', 'csrf_protection', value)}
                                        __nextHasNoMarginBottom={true}
                                        />
                                        
                                        <ToggleControl
                                            label={__('Nonce Verification', 'easy-share-solution')}
                                            help={__('Verify WordPress nonces for security', 'easy-share-solution')}
                                            checked={getAdvancedSetting('security_settings', { nonce_verification: true }).nonce_verification}
                                            onChange={(value) => updateNestedSetting('security_settings', 'nonce_verification', value)}
                                        __nextHasNoMarginBottom={true}
                                        />
                                        
                                        <ToggleControl
                                            label={__('Sanitize URLs', 'easy-share-solution')}
                                            help={__('Automatically sanitize all sharing URLs', 'easy-share-solution')}
                                            checked={getAdvancedSetting('security_settings', { sanitize_urls: true }).sanitize_urls}
                                            onChange={(value) => updateNestedSetting('security_settings', 'sanitize_urls', value)}
                                        __nextHasNoMarginBottom={true}
                                        />
                                        
                                        <ToggleControl
                                            label={__('Validate Referrer', 'easy-share-solution')}
                                            help={__('Check referrer headers for additional security', 'easy-share-solution')}
                                            checked={getAdvancedSetting('security_settings', { validate_referrer: false }).validate_referrer}
                                            onChange={(value) => updateNestedSetting('security_settings', 'validate_referrer', value)}
                                        __nextHasNoMarginBottom={true}
                                        />
                                    </CardBody>
                                </Card>
                                
                                <Card>
                                    <CardBody>
                                        <Heading level={3}>{__('System Information', 'easy-share-solution')}</Heading>
                                        
                                        {systemInfo && (
                                            <div className="ess-system-info">
                                                <Text><strong>{__('WordPress Version:', 'easy-share-solution')}</strong> {systemInfo.wordpress_version}</Text>
                                                <Text><strong>{__('PHP Version:', 'easy-share-solution')}</strong> {systemInfo.php_version}</Text>
                                                <Text><strong>{__('Plugin Version:', 'easy-share-solution')}</strong> {systemInfo.plugin_version}</Text>
                                                <Text><strong>{__('Active Plugins:', 'easy-share-solution')}</strong> {systemInfo.active_plugins?.length || 0}</Text>
                                            </div>
                                        )}
                                    </CardBody>
                                </Card>
                            </Grid>
                        )}

                        {tab.name === 'tools' && (
                            <Grid columns={2} gap={6}>
                                <Card>
                                    <CardBody>
                                        <Heading level={3}>{__('Import/Export', 'easy-share-solution')}</Heading>
                                        
                                        <div className="ess-tools-section">
                                            <Button 
                                                variant="primary" 
                                                onClick={exportSettings}
                                                style={{ marginRight: '10px' }}
                                            >
                                                {__('Export Settings', 'easy-share-solution')}
                                            </Button>
                                            
                                            <Button 
                                                variant="secondary" 
                                                onClick={() => document.getElementById('ess-import-file').click()}
                                            >
                                                {__('Import Settings', 'easy-share-solution')}
                                            </Button>
                                            
                                            <input
                                                id="ess-import-file"
                                                type="file"
                                                accept=".json"
                                                style={{ display: 'none' }}
                                                onChange={(e) => {
                                                    const file = e.target.files[0];
                                                    if (file) {
                                                        const reader = new FileReader();
                                                        reader.onload = async (event) => {
                                                            try {
                                                                const importData = JSON.parse(event.target.result);
                                                                
                                                                // Extract the actual settings data if it's wrapped in export format
                                                                const settingsData = importData.data || importData;
                                                                
                                                                const response = await apiFetch({
                                                                    path: '/easy-share/v1/settings/import',
                                                                    method: 'POST',
                                                                    data: { settings: settingsData }
                                                                });
                                                                
                                                                setNotice({
                                                                    type: 'success',
                                                                    message: __('Settings imported successfully', 'easy-share-solution')
                                                                });
                                                                
                                                                // Reload the current settings after import
                                                                window.location.reload();
                                                            } catch (error) {
                                                                setNotice({
                                                                    type: 'error',
                                                                    message: __('Failed to import settings', 'easy-share-solution')
                                                                });
                                                            }
                                                        };
                                                        reader.readAsText(file);
                                                    }
                                                }}
                                            />
                                        </div>
                                    </CardBody>
                                </Card>
                                
                                <Card>
                                    <CardBody>
                                        <Heading level={3}>{__('Reset Options', 'easy-share-solution')}</Heading>
                                        
                                        <div className="ess-reset-section">
                                            <Button 
                                                variant="tertiary" 
                                                isDestructive
                                                onClick={resetAdvancedSettings}
                                            >
                                                {__('Reset to Defaults', 'easy-share-solution')}
                                            </Button>
                                            
                                            <Text className="ess-warning-text">
                                                {__('This will reset all advanced settings to their default values.', 'easy-share-solution')}
                                            </Text>
                                        </div>
                                    </CardBody>
                                </Card>
                            </Grid>
                        )}
                    </div>
                )}
            </TabPanel>
        </div>
        </CardBody>
                </Card>
    );
};

export default AdvancedSettingsTab;
