/**
 * Custom hook for managing pro status
 */

import { useState, useEffect } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';

export const useProStatus = () => {
    const [isProActive, setIsProActive] = useState(false);
    const [checkingPro, setCheckingPro] = useState(true);
    const [proFeatures, setProFeatures] = useState({});

    // Check pro status
    const checkProStatus = async () => {
        try {
            setCheckingPro(true);
            const response = await apiFetch({
                path: '/easy-share/v1/pro-status',
                method: 'GET'
            });
            
            setIsProActive(response.is_pro || false);
            setProFeatures(response.features || {});
        } catch (error) {
            // Pro status check failed, assuming free version
            setIsProActive(false);
            setProFeatures({});
        } finally {
            setCheckingPro(false);
        }
    };

    // Check if specific feature is available
    const hasProFeature = (featureName) => {
        return isProActive && proFeatures[featureName] === true;
    };

    // Check pro status on mount
    useEffect(() => {
        checkProStatus();
    }, []);

    return {
        isProActive,
        checkingPro,
        proFeatures,
        hasProFeature,
        recheckProStatus: checkProStatus
    };
};
