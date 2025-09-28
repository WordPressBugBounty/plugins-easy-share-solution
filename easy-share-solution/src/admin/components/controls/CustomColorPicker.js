/**
 * Custom Color Picker Component - WORDPRESS STANDARD APPROACH
 * Using WordPress ColorPicker with proper integration
 */

import { __ } from '@wordpress/i18n';
import { useState, useRef, useEffect } from '@wordpress/element';
import { ColorPicker, Button } from '@wordpress/components';

const CustomColorPicker = ({ label, value, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [localColor, setLocalColor] = useState(value);
    const pickerRef = useRef();
    
    // Generate unique IDs for form fields
    const uniqueId = useRef(`color-picker-${Math.random().toString(36).substr(2, 9)}`).current;
    const textInputId = `${uniqueId}-text`;
    const pickerContainerId = `${uniqueId}-container`;

    // Update local color when prop changes
    useEffect(() => {
        setLocalColor(value);
    }, [value]);

    const handleColorChange = (color) => {
        const hexColor = color.hex || color;
        setLocalColor(hexColor);
        onChange(hexColor);
    };

    const togglePicker = () => {
        setIsOpen(!isOpen);
    };

    const closePicker = () => {
        setIsOpen(false);
    };

    return (
        <div className="ess-wp-color-picker-wrapper">
            <label className="ess-color-label" htmlFor={textInputId}>{label}</label>
            
            <div className="ess-color-control-row">
                <div 
                    className="ess-color-preview-button"
                    onClick={togglePicker}
                    style={{ backgroundColor: localColor }}
                    role="button"
                    tabIndex={0}
                    aria-label={`Current color: ${localColor}. Click to open color picker.`}
                >
                    <span className="ess-color-value">{localColor}</span>
                </div>
                
                <input
                    id={textInputId}
                    name={textInputId}
                    type="text"
                    value={localColor}
                    onChange={(e) => handleColorChange(e.target.value)}
                    className="ess-color-text-input"
                    placeholder="#000000"
                    aria-label={`${label} color value`}
                    autoComplete="off"
                />
            </div>

            {isOpen && (
                <div 
                    id={pickerContainerId}
                    className="ess-color-picker-container" 
                    ref={pickerRef}
                    role="dialog"
                    aria-labelledby={textInputId}
                >
                    <ColorPicker
                        color={localColor}
                        onChange={handleColorChange}
                        enableAlpha={false}
                    />
                    <div className="ess-color-picker-actions">
                        <Button variant="primary" onClick={closePicker}>
                            {__('Done', 'easy-share-solution')}
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomColorPicker;
