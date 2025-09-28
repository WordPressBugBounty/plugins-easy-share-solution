/**
 * Easy Share Solution Admin Dashboard Entry Point
 * Modern React implementation with wp-scripts
 */

import { render } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import AdminApp from './components/AdminApp';
import './styles/admin.scss';

// Initialize the admin app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('easy-share-admin-app');
    
    if (container) {
        // Hide loading spinner
        const loading = container.querySelector('.easy-share-loading');
        if (loading) {
            loading.style.display = 'none';
        }
        
        // Render React app
        try {
            render(<AdminApp />, container);
        } catch (error) {
            if (loading) {
                loading.innerHTML = '<p style="color: red;">Failed to load admin interface. Please refresh the page.</p>';
                loading.style.display = 'block';
            }
        }
    } else {
        console.error('Easy Share Admin container not found');
    }
});
