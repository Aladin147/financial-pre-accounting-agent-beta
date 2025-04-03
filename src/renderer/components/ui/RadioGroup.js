import React, { useState, useEffect, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useTheme } from '../../styles/ThemeProvider';
import Radio from './Radio';

/**
 * RadioGroup Component
 * 
 * A component to manage a group of related radio buttons with support for
 * both vertical and horizontal layouts and form integration.
 * 
 * @example
 * // Basic usage with options array
 * <RadioGroup
 *   name="gender"
 *   label="Gender"
 *   options={[
 *     { value: 'male', label: 'Male' },
 *     { value: 'female', label: 'Female' },
 *     { value: 'other', label: 'Other' }
 *   ]}
 *   onChange={handleGenderChange}
 * />
 * 
 * // Controlled usage with value
 * <RadioGroup
 *   name="plan"
 *   value={selectedPlan}
 *   onChange={(value) => setSelectedPlan(value)}
 *   options={plans}
 * />
 * 
 * // With horizontal layout
 * <RadioGroup
 *   name="category"
 *   options={categories}
 *   direction="horizontal"
 *   spacing="lg"
 * />
 */
const RadioGroup = ({
  // Content props
  name,
  label,
  options = [],
  children,
  
  // Layout props
  direction = 'vertical',
  spacing = 'md',
  
  // State props
  value = '',
  defaultValue = '',
  disabled = false,
  error = false,
  
  // Handler props
  onChange,
  
  // Style props
  className = '',
  style = {},
  
  // Additional props
  optionProps = {},
  ...props
}) => {
  // Get theme
  const { theme, isDarkMode } = useTheme();
  
  // Internal state for uncontrolled component
  const [internalValue, setInternalValue] = useState(defaultValue);
  
  // Determine if we're controlled or uncontrolled
  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : internalValue;
  
  // Handle value change
  const handleChange = useCallback((newValue) => {
    if (!isControlled) {
      setInternalValue(newValue);
    }
    
    if (onChange) {
      onChange(newValue, { name });
    }
  }, [isControlled, onChange, name]);
  
  // Handle individual radio change
  const handleRadioChange = useCallback((e) => {
    const { value: optionValue } = e.target;
    handleChange(optionValue);
  }, [handleChange]);
  
  // Update internal state if controlled value changes
  useEffect(() => {
    if (isControlled && value !== internalValue) {
      setInternalValue(value);
    }
  }, [isControlled, value, internalValue]);
  
  // Define base styles
  const getStyles = () => {
    // Spacing options
    const spacingOptions = {
      sm: theme.spacing.sm,
      md: theme.spacing.md,
      lg: theme.spacing.lg
    };
    
    // Build style objects
    return {
      container: {
        display: 'flex',
        flexDirection: direction === 'horizontal' ? 'row' : 'column',
        flexWrap: direction === 'horizontal' ? 'wrap' : 'nowrap',
        gap: spacingOptions[spacing] || theme.spacing.md,
        ...style
      },
      label: {
        display: 'block',
        marginBottom: theme.spacing.sm,
        fontSize: theme.typography.body1.fontSize,
        fontWeight: 500,
        color: error 
          ? theme.colors.error.main 
          : isDarkMode 
            ? theme.colors.text.primary 
            : theme.colors.neutral[800]
      }
    };
  };
  
  // Get styles
  const styles = getStyles();
  
  // Container classes
  const containerClasses = [
    'radio-group',
    `radio-group-${direction}`,
    disabled && 'radio-group-disabled',
    error && 'radio-group-error',
    className
  ].filter(Boolean).join(' ');
  
  // Parse options to standard format
  const normalizedOptions = useMemo(() => {
    return options.map(option => {
      if (typeof option === 'object') {
        return option;
      }
      return { value: option, label: option };
    });
  }, [options]);
  
  return (
    <div className={containerClasses} style={styles.container} {...props}>
      {label && (
        <label className="radio-group-label" style={styles.label}>
          {label}
        </label>
      )}
      
      <div className="radio-group-options">
        {normalizedOptions.map((option, index) => (
          <Radio
            key={option.value || index}
            name={name}
            value={option.value}
            label={option.label}
            checked={currentValue === option.value}
            onChange={handleRadioChange}
            disabled={option.disabled || disabled}
            error={error}
            {...optionProps}
            {...option.props}
          />
        ))}
        
        {children}
      </div>
    </div>
  );
};

RadioGroup.propTypes = {
  // Content props
  name: PropTypes.string,
  label: PropTypes.node,
  options: PropTypes.arrayOf(
    PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.shape({
        value: PropTypes.string.isRequired,
        label: PropTypes.node.isRequired,
        disabled: PropTypes.bool,
        props: PropTypes.object
      })
    ])
  ),
  children: PropTypes.node,
  
  // Layout props
  direction: PropTypes.oneOf(['vertical', 'horizontal']),
  spacing: PropTypes.oneOf(['sm', 'md', 'lg']),
  
  // State props
  value: PropTypes.string,
  defaultValue: PropTypes.string,
  disabled: PropTypes.bool,
  error: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
  
  // Handler props
  onChange: PropTypes.func,
  
  // Style props
  className: PropTypes.string,
  style: PropTypes.object,
  
  // Additional props
  optionProps: PropTypes.object
};

export default RadioGroup;
