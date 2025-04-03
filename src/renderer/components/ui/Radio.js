import React, { forwardRef, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useTheme } from '../../styles/ThemeProvider';

/**
 * Radio Component
 * 
 * A stylish radio button component with support for various states including
 * checked, unchecked, disabled, and error states.
 * Follows the purple theme design system.
 * 
 * @example
 * // Basic usage
 * <Radio 
 *   id="option1" 
 *   name="options" 
 *   value="option1"
 *   label="Option 1" 
 *   onChange={handleChange} 
 * />
 * 
 * // Controlled with state
 * <Radio 
 *   checked={selectedOption === 'option2'} 
 *   onChange={(e) => setSelectedOption(e.target.value)}
 *   name="options"
 *   value="option2"
 *   label="Option 2" 
 * />
 */
const Radio = forwardRef(({
  // Basic props
  id,
  name,
  value,
  label,
  className = '',
  style = {},
  
  // State props
  checked = false,
  defaultChecked,
  disabled = false,
  error = false,
  success = false,
  
  // Size variant
  size = 'medium',
  
  // Handler props
  onChange,
  onFocus,
  onBlur,
  
  // Additional props
  inputProps = {},
  labelProps = {},
  ...props
}, ref) => {
  // Generate a unique ID if not provided
  const uniqueId = useRef(`radio-${Math.random().toString(36).substr(2, 9)}`);
  const radioId = id || uniqueId.current;
  
  // Manage the reference to the input
  const inputRef = useRef(null);
  
  // Get theme
  const { theme, isDarkMode } = useTheme();
  
  // Forward ref to the input element
  useEffect(() => {
    if (ref) {
      if (typeof ref === 'function') {
        ref(inputRef.current);
      } else {
        ref.current = inputRef.current;
      }
    }
  }, [ref]);
  
  // Define the base styles
  const getStyles = () => {
    // Size variations
    const sizes = {
      small: {
        container: { minHeight: '32px' },
        radio: { width: '16px', height: '16px' },
        dot: { width: '6px', height: '6px' },
        label: { fontSize: theme.typography.caption.fontSize }
      },
      medium: {
        container: { minHeight: '40px' },
        radio: { width: '20px', height: '20px' },
        dot: { width: '8px', height: '8px' },
        label: { fontSize: theme.typography.body2.fontSize }
      },
      large: {
        container: { minHeight: '48px' },
        radio: { width: '24px', height: '24px' },
        dot: { width: '10px', height: '10px' },
        label: { fontSize: theme.typography.body1.fontSize }
      }
    };
    
    // Current size config
    const sizeConfig = sizes[size] || sizes.medium;
    
    // Build the style objects
    return {
      container: {
        display: 'inline-flex',
        alignItems: 'center',
        position: 'relative',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
        ...sizeConfig.container,
        ...style
      },
      input: {
        position: 'absolute',
        opacity: 0,
        width: '100%',
        height: '100%',
        top: 0,
        left: 0,
        margin: 0,
        cursor: disabled ? 'not-allowed' : 'pointer',
        zIndex: 1
      },
      radio: {
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        borderRadius: '50%', // Circle for radio buttons
        backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
        border: '1px solid',
        borderColor: error
          ? theme.colors.error.main
          : checked
            ? theme.colors.primary[500]
            : isDarkMode
              ? theme.colors.border.light
              : theme.colors.neutral[400],
        transition: theme.transition.default,
        ...sizeConfig.radio
      },
      checked: {
        borderColor: disabled
          ? isDarkMode
            ? 'rgba(151, 71, 255, 0.4)'
            : 'rgba(151, 71, 255, 0.6)'
          : theme.colors.primary[500]
      },
      dot: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: checked 
          ? 'translate(-50%, -50%) scale(1)' 
          : 'translate(-50%, -50%) scale(0)',
        width: sizeConfig.dot.width,
        height: sizeConfig.dot.height,
        borderRadius: '50%',
        backgroundColor: disabled 
          ? isDarkMode 
            ? 'rgba(151, 71, 255, 0.4)' 
            : 'rgba(151, 71, 255, 0.6)'
          : theme.colors.primary[500],
        transition: theme.transition.default
      },
      label: {
        marginLeft: theme.spacing.sm,
        color: disabled
          ? isDarkMode
            ? theme.colors.text.disabled
            : theme.colors.neutral[400]
          : error
            ? theme.colors.error.main
            : isDarkMode
              ? theme.colors.text.primary
              : theme.colors.neutral[800],
        userSelect: 'none',
        ...sizeConfig.label
      }
    };
  };
  
  // Get all the style objects
  const styles = getStyles();
  
  // Apply checked styles to the base radio style if checked
  const radioStyle = {
    ...styles.radio,
    ...(checked ? styles.checked : {})
  };
  
  // Build class names
  const containerClasses = [
    'radio',
    `radio-${size}`,
    checked && 'radio-checked',
    disabled && 'radio-disabled',
    error && 'radio-error',
    success && 'radio-success',
    className
  ].filter(Boolean).join(' ');
  
  return (
    <label 
      className={containerClasses}
      style={styles.container}
      htmlFor={radioId}
      {...labelProps}
    >
      <input
        ref={inputRef}
        type="radio"
        id={radioId}
        name={name}
        value={value}
        checked={checked}
        defaultChecked={defaultChecked}
        disabled={disabled}
        onChange={onChange}
        onFocus={onFocus}
        onBlur={onBlur}
        style={styles.input}
        {...inputProps}
        {...props}
      />
      
      <div style={radioStyle} className="radio-circle">
        <div style={styles.dot} className="radio-dot" />
      </div>
      
      {label && (
        <span style={styles.label} className="radio-label">
          {label}
        </span>
      )}
    </label>
  );
});

Radio.displayName = 'Radio';

Radio.propTypes = {
  // Basic props
  id: PropTypes.string,
  name: PropTypes.string,
  value: PropTypes.string,
  label: PropTypes.node,
  className: PropTypes.string,
  style: PropTypes.object,
  
  // State props
  checked: PropTypes.bool,
  defaultChecked: PropTypes.bool,
  disabled: PropTypes.bool,
  error: PropTypes.bool,
  success: PropTypes.bool,
  
  // Size variant
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  
  // Handler props
  onChange: PropTypes.func,
  onFocus: PropTypes.func,
  onBlur: PropTypes.func,
  
  // Additional props
  inputProps: PropTypes.object,
  labelProps: PropTypes.object
};

export default Radio;
