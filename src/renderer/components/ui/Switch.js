import React, { forwardRef, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useTheme } from '../../styles/ThemeProvider';

/**
 * Switch Component
 * 
 * A toggle switch component that provides a visual slider and supports
 * checked/unchecked states, disabled state, sizes, and custom labels.
 * 
 * @example
 * // Basic usage
 * <Switch 
 *   label="Enable notifications" 
 *   onChange={handleChange} 
 * />
 * 
 * // Controlled with state
 * <Switch 
 *   checked={isEnabled}
 *   onChange={(e) => setIsEnabled(e.target.checked)}
 *   label="Dark mode" 
 * />
 * 
 * // With custom styling
 * <Switch 
 *   label="Premium features"
 *   size="large"
 *   color="success"
 * />
 */
const Switch = forwardRef(({
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
  
  // Style props
  size = 'medium',
  color = 'primary',
  labelPlacement = 'end',
  
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
  const uniqueId = useRef(`switch-${Math.random().toString(36).substr(2, 9)}`);
  const switchId = id || uniqueId.current;
  
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
  
  // Define the color values based on the theme
  const getColorFromTheme = (colorName) => {
    switch (colorName) {
      case 'primary':
        return theme.colors.primary[500];
      case 'secondary':
        return theme.colors.secondary[500];
      case 'success':
        return theme.colors.success.main;
      case 'error':
        return theme.colors.error.main;
      case 'warning':
        return theme.colors.warning.main;
      case 'info':
        return theme.colors.info.main;
      default:
        return theme.colors.primary[500];
    }
  };
  
  // Define the base styles
  const getStyles = () => {
    // Color value
    const colorValue = getColorFromTheme(color);
    
    // Size variations
    const sizes = {
      small: {
        container: { minHeight: '32px' },
        track: { width: '32px', height: '16px' },
        thumb: { width: '12px', height: '12px' },
        thumbOffset: '2px',
        thumbCheckedTransform: 'translateX(16px)',
        label: { fontSize: theme.typography.caption.fontSize }
      },
      medium: {
        container: { minHeight: '40px' },
        track: { width: '40px', height: '20px' },
        thumb: { width: '16px', height: '16px' },
        thumbOffset: '2px',
        thumbCheckedTransform: 'translateX(20px)',
        label: { fontSize: theme.typography.body2.fontSize }
      },
      large: {
        container: { minHeight: '48px' },
        track: { width: '48px', height: '24px' },
        thumb: { width: '20px', height: '20px' },
        thumbOffset: '2px',
        thumbCheckedTransform: 'translateX(24px)',
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
        flexDirection: labelPlacement === 'start' ? 'row-reverse' : 'row',
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
      track: {
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: sizeConfig.track.width,
        height: sizeConfig.track.height,
        borderRadius: '999px', // Pill shape
        backgroundColor: checked 
          ? disabled 
            ? isDarkMode 
              ? 'rgba(151, 71, 255, 0.4)' 
              : 'rgba(151, 71, 255, 0.6)'
            : error
              ? theme.colors.error.main
              : colorValue
          : isDarkMode 
            ? 'rgba(255, 255, 255, 0.15)' 
            : 'rgba(0, 0, 0, 0.25)',
        transition: theme.transition.default
      },
      thumb: {
        position: 'absolute',
        top: '50%',
        left: sizeConfig.thumbOffset,
        width: sizeConfig.thumb.width,
        height: sizeConfig.thumb.height,
        borderRadius: '50%',
        backgroundColor: isDarkMode ? '#fff' : '#fff',
        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.2)',
        transform: checked 
          ? sizeConfig.thumbCheckedTransform 
          : 'translateY(-50%)',
        transition: theme.transition.default
      },
      label: {
        marginLeft: labelPlacement === 'start' ? 0 : theme.spacing.sm,
        marginRight: labelPlacement === 'start' ? theme.spacing.sm : 0,
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
  
  // Build class names
  const containerClasses = [
    'switch',
    `switch-${size}`,
    `switch-${color}`,
    checked && 'switch-checked',
    disabled && 'switch-disabled',
    error && 'switch-error',
    `switch-label-${labelPlacement}`,
    className
  ].filter(Boolean).join(' ');
  
  return (
    <label 
      className={containerClasses}
      style={styles.container}
      htmlFor={switchId}
      {...labelProps}
    >
      <input
        ref={inputRef}
        type="checkbox"
        id={switchId}
        role="switch"
        name={name}
        value={value}
        checked={checked}
        defaultChecked={defaultChecked}
        disabled={disabled}
        onChange={onChange}
        onFocus={onFocus}
        onBlur={onBlur}
        style={styles.input}
        aria-checked={checked}
        {...inputProps}
        {...props}
      />
      
      <div style={styles.track} className="switch-track">
        <div style={styles.thumb} className="switch-thumb" />
      </div>
      
      {label && (
        <span style={styles.label} className="switch-label">
          {label}
        </span>
      )}
    </label>
  );
});

Switch.displayName = 'Switch';

Switch.propTypes = {
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
  
  // Style props
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  color: PropTypes.oneOf(['primary', 'secondary', 'success', 'error', 'warning', 'info']),
  labelPlacement: PropTypes.oneOf(['start', 'end']),
  
  // Handler props
  onChange: PropTypes.func,
  onFocus: PropTypes.func,
  onBlur: PropTypes.func,
  
  // Additional props
  inputProps: PropTypes.object,
  labelProps: PropTypes.object
};

export default Switch;
