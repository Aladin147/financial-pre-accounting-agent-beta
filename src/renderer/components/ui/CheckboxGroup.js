import React, { useState, useEffect, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useTheme } from '../../styles/ThemeProvider';
import Checkbox from './Checkbox';

/**
 * CheckboxGroup Component
 * 
 * A component to manage a group of related checkboxes with support for
 * controlling them as a group, including select all functionality.
 * 
 * @example
 * // Basic usage with options array
 * <CheckboxGroup
 *   name="preferences"
 *   label="Notification Preferences"
 *   options={[
 *     { value: 'email', label: 'Email notifications' },
 *     { value: 'sms', label: 'SMS notifications' },
 *     { value: 'push', label: 'Push notifications' }
 *   ]}
 *   onChange={handlePreferenceChange}
 * />
 * 
 * // Controlled usage with value
 * <CheckboxGroup
 *   name="roles"
 *   value={selectedRoles}
 *   onChange={(values) => setSelectedRoles(values)}
 *   options={roles}
 * />
 * 
 * // With select all option
 * <CheckboxGroup
 *   name="permissions"
 *   options={permissions}
 *   value={selectedPermissions}
 *   onChange={setSelectedPermissions}
 *   selectAllOption="Select all permissions"
 * />
 */
const CheckboxGroup = ({
  // Content props
  name,
  label,
  options = [],
  children,
  
  // Layout props
  direction = 'vertical',
  spacing = 'md',
  
  // State props
  value = [],
  defaultValue,
  disabled = false,
  error = false,
  
  // Feature props
  selectAllOption = null,
  
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
  const [internalValue, setInternalValue] = useState(defaultValue || []);
  
  // Determine if we're controlled or uncontrolled
  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : internalValue;
  
  // Determine if all options are selected
  const allSelected = useMemo(() => {
    return options.length > 0 && currentValue.length === options.length;
  }, [options, currentValue]);
  
  // Determine if some options are selected (for indeterminate state)
  const someSelected = useMemo(() => {
    return currentValue.length > 0 && currentValue.length < options.length;
  }, [options, currentValue]);
  
  // Handle value change
  const handleChange = useCallback((newValues) => {
    if (!isControlled) {
      setInternalValue(newValues);
    }
    
    if (onChange) {
      onChange(newValues, { name });
    }
  }, [isControlled, onChange, name]);
  
  // Handle individual checkbox change
  const handleCheckboxChange = useCallback((e) => {
    const { value: optionValue, checked } = e.target;
    
    // Update the value array
    const newValues = checked
      ? [...currentValue, optionValue]
      : currentValue.filter(val => val !== optionValue);
    
    handleChange(newValues);
  }, [currentValue, handleChange]);
  
  // Handle select all change
  const handleSelectAllChange = useCallback((e) => {
    const { checked } = e.target;
    
    // Either select all or none
    const newValues = checked
      ? options.map(option => typeof option === 'object' ? option.value : option)
      : [];
    
    handleChange(newValues);
  }, [options, handleChange]);
  
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
      },
      selectAll: {
        marginBottom: theme.spacing.sm
      }
    };
  };
  
  // Get styles
  const styles = getStyles();
  
  // Container classes
  const containerClasses = [
    'checkbox-group',
    `checkbox-group-${direction}`,
    disabled && 'checkbox-group-disabled',
    error && 'checkbox-group-error',
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
        <label className="checkbox-group-label" style={styles.label}>
          {label}
        </label>
      )}
      
      {selectAllOption && normalizedOptions.length > 1 && (
        <div className="checkbox-group-select-all" style={styles.selectAll}>
          <Checkbox
            label={typeof selectAllOption === 'string' ? selectAllOption : 'Select All'}
            checked={allSelected}
            indeterminate={someSelected && !allSelected}
            onChange={handleSelectAllChange}
            disabled={disabled}
            error={error}
          />
        </div>
      )}
      
      <div className="checkbox-group-options">
        {normalizedOptions.map((option, index) => (
          <Checkbox
            key={option.value || index}
            name={name ? `${name}[${index}]` : undefined}
            value={option.value}
            label={option.label}
            checked={currentValue.includes(option.value)}
            onChange={handleCheckboxChange}
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

CheckboxGroup.propTypes = {
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
  value: PropTypes.array,
  defaultValue: PropTypes.array,
  disabled: PropTypes.bool,
  error: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
  
  // Feature props
  selectAllOption: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
  
  // Handler props
  onChange: PropTypes.func,
  
  // Style props
  className: PropTypes.string,
  style: PropTypes.object,
  
  // Additional props
  optionProps: PropTypes.object
};

export default CheckboxGroup;
