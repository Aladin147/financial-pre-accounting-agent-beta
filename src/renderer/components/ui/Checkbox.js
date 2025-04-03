import React, { forwardRef, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useTheme } from '../../styles/ThemeProvider';

/**
 * Checkbox Component
 * 
 * A stylish checkbox component with support for various states including
 * checked, unchecked, indeterminate, disabled, and error states.
 * Follows the purple theme design system.
 * 
 * @example
 * // Basic usage
 * <Checkbox 
 *   id="agree" 
 *   name="agree" 
 *   label="I agree to terms" 
 *   onChange={handleChange} 
 * />
 * 
 * // Controlled with state
 * <Checkbox 
 *   checked={isChecked} 
 *   onChange={(e) => setIsChecked(e.target.checked)}
 *   label="Subscribe to newsletter" 
 * />
 * 
 * // Indeterminate state (some options selected)
 * <Checkbox 
 *   indeterminate={someSelected && !allSelected}
 *   checked={allSelected}
 *   onChange={selectAll}
 *   label="Select all" 
 * />
 */
const Checkbox = forwardRef(({
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
  indeterminate = false,
  disabled = false,
  error = false,
  success = false,
  
  // Size variant
  size = 'medium',
  
  // Handler props
  onChange,
  onFocus,
  onBlur,
  
  // Icon props
  icon,
  checkedIcon,
  indeterminateIcon,
  
  // Additional props
  inputProps = {},
  labelProps = {},
  ...props
}, ref) => {
  // Generate a unique ID if not provided
  const uniqueId = useRef(`checkbox-${Math.random().toString(36).substr(2, 9)}`);
  const checkboxId = id || uniqueId.current;
  
  // Manage the reference to the input
  const inputRef = useRef(null);
  
  // Get theme
  const { theme, isDarkMode } = useTheme();
  
  // Set indeterminate property (React doesn't handle this as a prop)
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);
  
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
        checkbox: { width: '16px', height: '16px' },
        label: { fontSize: theme.typography.caption.fontSize }
      },
      medium: {
        container: { minHeight: '40px' },
        checkbox: { width: '20px', height: '20px' },
        label: { fontSize: theme.typography.body2.fontSize }
      },
      large: {
        container: { minHeight: '48px' },
        checkbox: { width: '24px', height: '24px' },
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
      checkbox: {
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        borderRadius: theme.borderRadius.sm,
        backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
        border: '1px solid',
        borderColor: error
          ? theme.colors.error.main
          : checked || indeterminate
            ? theme.colors.primary[500]
            : isDarkMode
              ? theme.colors.border.light
              : theme.colors.neutral[400],
        transition: theme.transition.default,
        ...sizeConfig.checkbox
      },
      checked: {
        backgroundColor: disabled 
          ? isDarkMode 
            ? 'rgba(151, 71, 255, 0.4)' 
            : 'rgba(151, 71, 255, 0.6)'
          : theme.colors.primary[500],
        borderColor: disabled
          ? isDarkMode
            ? 'rgba(151, 71, 255, 0.4)'
            : 'rgba(151, 71, 255, 0.6)'
          : theme.colors.primary[500]
      },
      icon: {
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        width: '100%',
        color: '#fff',
        opacity: checked || indeterminate ? 1 : 0,
        transform: checked || indeterminate ? 'scale(1)' : 'scale(0.8)',
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
  
  // Apply checked styles to the base checkbox style if checked or indeterminate
  const checkboxStyle = {
    ...styles.checkbox,
    ...(checked || indeterminate ? styles.checked : {})
  };
  
  // Build class names
  const containerClasses = [
    'checkbox',
    `checkbox-${size}`,
    checked && 'checkbox-checked',
    indeterminate && 'checkbox-indeterminate',
    disabled && 'checkbox-disabled',
    error && 'checkbox-error',
    success && 'checkbox-success',
    className
  ].filter(Boolean).join(' ');
  
  // Define checkmark icon (can be overridden via props)
  const CheckIcon = () => (
    <svg viewBox="0 0 24 24" width="70%" height="70%" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
  
  // Define indeterminate icon (can be overridden via props)
  const IndeterminateIcon = () => (
    <svg viewBox="0 0 24 24" width="70%" height="70%" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
  
  // Determine which icon to show
  const IconComponent = indeterminate
    ? (indeterminateIcon || IndeterminateIcon)
    : checked
      ? (checkedIcon || CheckIcon)
      : null;
  
  return (
    <label 
      className={containerClasses}
      style={styles.container}
      htmlFor={checkboxId}
      {...labelProps}
    >
      <input
        ref={inputRef}
        type="checkbox"
        id={checkboxId}
        name={name}
        value={value}
        checked={checked}
        defaultChecked={defaultChecked}
        disabled={disabled}
        onChange={onChange}
        onFocus={onFocus}
        onBlur={onBlur}
        style={styles.input}
        aria-checked={indeterminate ? 'mixed' : checked}
        {...inputProps}
        {...props}
      />
      
      <div style={checkboxStyle} className="checkbox-box">
        <span style={styles.icon} className="checkbox-icon">
          {IconComponent && <IconComponent />}
        </span>
      </div>
      
      {label && (
        <span style={styles.label} className="checkbox-label">
          {label}
        </span>
      )}
    </label>
  );
});

Checkbox.displayName = 'Checkbox';

Checkbox.propTypes = {
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
  indeterminate: PropTypes.bool,
  disabled: PropTypes.bool,
  error: PropTypes.bool,
  success: PropTypes.bool,
  
  // Size variant
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  
  // Handler props
  onChange: PropTypes.func,
  onFocus: PropTypes.func,
  onBlur: PropTypes.func,
  
  // Icon props
  icon: PropTypes.elementType,
  checkedIcon: PropTypes.elementType,
  indeterminateIcon: PropTypes.elementType,
  
  // Additional props
  inputProps: PropTypes.object,
  labelProps: PropTypes.object
};

export default Checkbox;
