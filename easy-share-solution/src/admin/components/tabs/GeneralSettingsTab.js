/**
 * General Settings Tab Component
 */

import { __ } from '@wordpress/i18n';
import { 
    Card, 
    CardBody, 
    ToggleControl, 
    SelectControl, 
    RangeControl,
    CheckboxControl,
    ColorPicker,
    Button
} from '@wordpress/components';
import { useState } from '@wordpress/element';
import ProFeature from '../ProFeature';

const GeneralSettingsTab = ({ settings, updateSetting, isProActive, hasProFeature }) => {
    const [cookieNotice, setCookieNotice] = useState('');
    const visitorHideDuration = isProActive ? (settings.floating_panel_visitor_hide_duration || 1) : 15;

    const clearVisitorHideCookie = () => {
        const cookieName = 'ess_floating_panel_hidden';
        const host = window.location.hostname;
        const domains = ['', host, host.startsWith('www.') ? host.replace(/^www\./, '') : `.${host}`];

        domains.forEach((domain) => {
            const domainPart = domain ? `; domain=${domain}` : '';
            document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0; path=/${domainPart}; SameSite=Lax`;
            document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0${domainPart}; SameSite=Lax`;
        });

        localStorage.removeItem('ess_floating_panel_hidden');
        sessionStorage.removeItem('ess_floating_panel_hidden');
        setCookieNotice(__('Visitor hide cookie cleared for this browser.', 'easy-share-solution'));
        setTimeout(() => setCookieNotice(''), 3000);
    };

    return (
        <div className="ess-general-settings-tab">
            <Card>
                <CardBody>
                    <h2>{__('General Settings', 'easy-share-solution')}</h2>
                    <p className="ess-tab-description">
                        {__('Configure the basic settings for your social sharing buttons.', 'easy-share-solution')}
                    </p>

                    {/* Plugin Enable/Disable */}
                    <div className="ess-setting-group">
                        <ToggleControl
                            label={__('Enable Plugin', 'easy-share-solution')}
                            help={__('Enable or disable the Easy Share Solution plugin globally across your site.', 'easy-share-solution')}
                            checked={settings.enabled || false}
                            onChange={(value) => updateSetting('enabled', value)}
                            __nextHasNoMarginBottom={true}
                        />
                    </div>



                    {/* Show Share Count */}
                    <div className="ess-setting-group">
                        <ProFeature
                            isProActive={isProActive}
                            hasProFeature={hasProFeature}
                            feature="show_share_count"
                            showNotice={true}
                        >
                            <ToggleControl
                                label={__('Show Share Count', 'easy-share-solution')}
                                help={__('Display the number of shares next to each social media icon. Note: Front page won\'t show the share count.', 'easy-share-solution')}
                                checked={settings.show_count || false}
                                onChange={(value) => updateSetting('show_count', value)}
                                __nextHasNoMarginBottom={true}
                            />
                        </ProFeature>
                    </div>

                    {/* Display Positions - All checkboxes clickable */}
                    <div className="ess-setting-group">
                        <h3>{__('Display Positions', 'easy-share-solution')}</h3>
                        <p className="ess-setting-description">
                            {__('Choose where to display the social sharing buttons. You can select multiple positions. Floating Panel is the main recommended view for best user experience.', 'easy-share-solution')}
                        </p>
                        
                        <div className="ess-checkbox-group">
                            <CheckboxControl
                                label={__('🚀 Floating Panel (Recommended)', 'easy-share-solution')}
                                help={__('Show a floating panel that follows users as they scroll - provides the best user experience', 'easy-share-solution')}
                                checked={settings.display_positions?.floating_panel || false}
                                onChange={(value) => updateSetting('display_positions', {
                                    ...settings.display_positions,
                                    floating_panel: value
                                })}
                                __nextHasNoMarginBottom={true}
                            />
                            
                            <CheckboxControl
                                label={__('Before Content', 'easy-share-solution')}
                                help={__('Show buttons at the top of post/page content', 'easy-share-solution')}
                                checked={settings.display_positions?.before_content || false}
                                onChange={(value) => updateSetting('display_positions', {
                                    ...settings.display_positions,
                                    before_content: value
                                })}
                                __nextHasNoMarginBottom={true}
                            />
                            
                            <CheckboxControl
                                label={__('After Content', 'easy-share-solution')}
                                help={__('Show buttons at the bottom of post/page content', 'easy-share-solution')}
                                checked={settings.display_positions?.after_content || false}
                                onChange={(value) => updateSetting('display_positions', {
                                    ...settings.display_positions,
                                    after_content: value
                                })}
                                __nextHasNoMarginBottom={true}
                            />
                        </div>
                    </div>

                    {/* Floating Panel Configuration - Show only when enabled */}
                    {settings.display_positions?.floating_panel && (
                        <div className="ess-setting-group ess-floating-panel-config">
                            <h3>{__('🎯 Floating Panel Configuration', 'easy-share-solution')}</h3>
                            <p className="ess-setting-description">
                                {__('Configure the position and behavior of your floating social panel.', 'easy-share-solution')}
                            </p>

                            {/* Auto Hide on Scroll */}
                            <div className="ess-setting-row">
                                <ToggleControl
                                    label={__('Auto Hide on Scroll Up', 'easy-share-solution')}
                                    help={__('Hide the floating panel when users scroll up to save screen space.', 'easy-share-solution')}
                                    checked={settings.floating_panel_auto_hide || false}
                                    onChange={(value) => updateSetting('floating_panel_auto_hide', value)}
                                    __nextHasNoMarginBottom={true}
                                />
                            </div>

                            {/* Icons Display Mode */}
                            <div className="ess-setting-row">
                                <SelectControl
                                    label={__('Icons Display Mode', 'easy-share-solution')}
                                    help={__('Choose how the social media icons are displayed in the floating panel.', 'easy-share-solution')}
                                    value={settings.floating_panel_icons_display || 'expand'}
                                    options={[
                                        { label: __('Expand (Always Visible)', 'easy-share-solution'), value: 'expand' },
                                        { label: __('Fold (Click to Expand)', 'easy-share-solution'), value: 'fold' }
                                    ]}
                                    onChange={(value) => updateSetting('floating_panel_icons_display', value)}
                                    __next40pxDefaultSize={true}
                                    __nextHasNoMarginBottom={true}
                                />
                            </div>

                            {/* Show on Front Page */}
                            <div className="ess-setting-row">
                                <ToggleControl
                                    label={__('Show on Front Page', 'easy-share-solution')}
                                    help={__('Display the floating panel on your site\'s front page.', 'easy-share-solution')}
                                    checked={settings.floating_panel_front_page || true}
                                    onChange={(value) => updateSetting('floating_panel_front_page', value)}
                                    __nextHasNoMarginBottom={true}
                                />
                            </div>

                            {/* Show on Home Page */}
                            <div className="ess-setting-row">
                                <ToggleControl
                                    label={__('Show on Home Page', 'easy-share-solution')}
                                    help={__('Display the floating panel on your blog\'s home page (posts page).', 'easy-share-solution')}
                                    checked={settings.floating_panel_home_page || false}
                                    onChange={(value) => updateSetting('floating_panel_home_page', value)}
                                    __nextHasNoMarginBottom={true}
                                />
                            </div>

                            <div className="ess-setting-row">
                                <ToggleControl
                                    label={__('Allow Visitors to Hide Panel', 'easy-share-solution')}
                                    help={__('Show a close button that lets visitors completely hide the floating share panel in this browser.', 'easy-share-solution')}
                                    checked={settings.floating_panel_visitor_hide_enabled || false}
                                    onChange={(value) => updateSetting('floating_panel_visitor_hide_enabled', value)}
                                    __nextHasNoMarginBottom={true}
                                />
                            </div>

                            {settings.floating_panel_visitor_hide_enabled && (
                                <div className="ess-setting-row">
                                    <SelectControl
                                        label={(
                                            <span className="ess-pro-setting-label">
                                                {__('Visitor Hide Duration', 'easy-share-solution')}
                                                <span className="ess-pro-label">{__('Pro', 'easy-share-solution')}</span>
                                            </span>
                                        )}
                                        help={isProActive ? __('Choose how long the panel stays hidden after a visitor closes it.', 'easy-share-solution') : __('Free users use a fixed 15 day hide duration. Pro users can choose 1, 3, or 7 days.', 'easy-share-solution')}
                                        value={String(visitorHideDuration)}
                                        options={[
                                            ...(isProActive ? [
                                                { label: __('1 day', 'easy-share-solution'), value: '1' },
                                                { label: __('3 days', 'easy-share-solution'), value: '3' },
                                                { label: __('7 days', 'easy-share-solution'), value: '7' }
                                            ] : [
                                                { label: __('15 days', 'easy-share-solution'), value: '15' }
                                            ])
                                        ]}
                                        disabled={!isProActive}
                                        onChange={(value) => updateSetting('floating_panel_visitor_hide_duration', parseInt(value, 10))}
                                        __next40pxDefaultSize={true}
                                        __nextHasNoMarginBottom={true}
                                    />
                                    <Button isSecondary type="button" onClick={clearVisitorHideCookie}>
                                        {__('Clear Hide Cookie for Testing', 'easy-share-solution')}
                                    </Button>
                                    {cookieNotice && <p className="ess-setting-description">{cookieNotice}</p>}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Post Types */}
                    <div className="ess-setting-group">
                        <h3>{__('Post Types', 'easy-share-solution')}</h3>
                        <p className="ess-setting-description">
                            {__('Select which post types should display social sharing buttons.', 'easy-share-solution')}
                        </p>
                        
                        <div className="ess-checkbox-group">
                            <CheckboxControl
                                label={__('Posts', 'easy-share-solution')}
                                checked={settings.post_types?.includes('post') || false}
                                onChange={(value) => {
                                    const currentTypes = settings.post_types || [];
                                    const newTypes = value 
                                        ? [...currentTypes.filter(type => type !== 'post'), 'post']
                                        : currentTypes.filter(type => type !== 'post');
                                    updateSetting('post_types', newTypes);
                                }}
                                __nextHasNoMarginBottom={true}
                            />
                            
                            <CheckboxControl
                                label={__('Pages', 'easy-share-solution')}
                                checked={settings.post_types?.includes('page') || false}
                                onChange={(value) => {
                                    const currentTypes = settings.post_types || [];
                                    const newTypes = value 
                                        ? [...currentTypes.filter(type => type !== 'page'), 'page']
                                        : currentTypes.filter(type => type !== 'page');
                                    updateSetting('post_types', newTypes);
                                }}
                                __nextHasNoMarginBottom={true}
                            />
                            
                            <ProFeature
                                isProActive={isProActive}
                                hasProFeature={hasProFeature}
                                feature="custom_post_types"
                                inline={true}
                            >
                                <CheckboxControl
                                    label={__('Custom Post Types', 'easy-share-solution')}
                                    checked={settings.post_types?.includes('custom') || false}
                                    onChange={(value) => {
                                        const currentTypes = settings.post_types || [];
                                        const newTypes = value 
                                            ? [...currentTypes.filter(type => type !== 'custom'), 'custom']
                                            : currentTypes.filter(type => type !== 'custom');
                                        updateSetting('post_types', newTypes);
                                    }}
                                    __nextHasNoMarginBottom={true}
                                />
                            </ProFeature>
                        </div>
                    </div>
                </CardBody>
            </Card>
        </div>
    );
};

export default GeneralSettingsTab;
