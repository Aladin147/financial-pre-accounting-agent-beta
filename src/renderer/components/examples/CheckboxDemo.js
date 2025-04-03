import React, { useState } from 'react';
import Checkbox from '../ui/Checkbox';
import CheckboxGroup from '../ui/CheckboxGroup';
import FormField from '../ui/FormField';
import { useTheme } from '../../styles/ThemeProvider';

/**
 * Demo component for Checkbox and CheckboxGroup
 * 
 * This component showcases the various features of the Checkbox and CheckboxGroup components
 * with different states, configurations, and use cases.
 */
const CheckboxDemo = () => {
  const { theme } = useTheme();
  
  // State for basic checkbox
  const [isChecked, setIsChecked] = useState(false);
  
  // State for indeterminate checkbox
  const [isAllSelected, setIsAllSelected] = useState(false);
  const [isIndeterminate, setIsIndeterminate] = useState(true);
  
  // State for checkbox group
  const [notifications, setNotifications] = useState(['email']);
  
  // State for checkbox with FormField
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [formError, setFormError] = useState(false);
  
  // State for horizontal checkbox group
  const [features, setFeatures] = useState(['charts', 'export']);
  
  // Options for notification preferences
  const notificationOptions = [
    { value: 'email', label: 'Email notifications' },
    { value: 'sms', label: 'SMS notifications' },
    { value: 'push', label: 'Push notifications' },
    { value: 'browser', label: 'Browser notifications' }
  ];
  
  // Options for features
  const featureOptions = [
    { value: 'charts', label: 'Interactive Charts' },
    { value: 'export', label: 'Export to PDF' },
    { value: 'api', label: 'API Access' },
    { value: 'automation', label: 'Automation Tools' },
    { value: 'templates', label: 'Custom Templates' }
  ];
  
  // Handle changes for basic checkbox
  const handleBasicCheckboxChange = (e) => {
    setIsChecked(e.target.checked);
  };
  
  // Handle changes for indeterminate checkbox
  const handleIndeterminateChange = (e) => {
    setIsIndeterminate(false);
    setIsAllSelected(e.target.checked);
  };
  
  // Handle notification preferences change
  const handleNotificationsChange = (values) => {
    setNotifications(values);
  };
  
  // Handle terms agreement change
  const handleTermsChange = (e) => {
    setAgreeTerms(e.target.checked);
    setFormError(!e.target.checked);
  };
  
  // Handle features change
  const handleFeaturesChange = (values) => {
    setFeatures(values);
  };
  
  // Style for section containers
  const sectionStyle = {
    marginBottom: theme.spacing.xl,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    border: `1px solid ${theme.colors.border.light}`,
    backgroundColor: 'rgba(29, 30, 45, 0.5)'
  };
  
  // Style for section titles
  const titleStyle = {
    fontSize: theme.typography.h5.fontSize,
    marginBottom: theme.spacing.md,
    color: theme.colors.primary[300],
    borderBottom: `1px solid ${theme.colors.border.light}`,
    paddingBottom: theme.spacing.xs
  };
  
  // Style for code examples
  const codeStyle = {
    display: 'block',
    marginTop: theme.spacing.md,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    color: theme.colors.text.secondary,
    fontFamily: theme.typography.fontFamilyMono,
    fontSize: '13px',
    whiteSpace: 'pre-wrap',
    overflowX: 'auto'
  };
  
  return (
    <div>
      {/* Basic Checkbox Examples */}
      <div style={sectionStyle}>
        <h3 style={titleStyle}>Basic Checkbox</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.md }}>
          <Checkbox
            label="Basic checkbox (uncontrolled)"
            name="basic"
          />
          
          <Checkbox
            label="Controlled checkbox"
            checked={isChecked}
            onChange={handleBasicCheckboxChange}
            name="controlled"
          />
          
          <Checkbox
            label="Disabled checkbox"
            disabled
            name="disabled"
          />
          
          <Checkbox
            label="Disabled checked checkbox"
            disabled
            checked
            name="disabled-checked"
          />
          
          <Checkbox
            label="Error state"
            error
            name="error"
          />
          
          <Checkbox
            label="Success state"
            success
            defaultChecked
            name="success"
          />
        </div>
        
        <pre style={codeStyle}>
{`// Basic uncontrolled checkbox
<Checkbox
  label="Basic checkbox (uncontrolled)"
  name="basic"
/>

// Controlled checkbox with state
const [isChecked, setIsChecked] = useState(false);

<Checkbox
  label="Controlled checkbox"
  checked={isChecked}
  onChange={(e) => setIsChecked(e.target.checked)}
  name="controlled"
/>`}
        </pre>
      </div>
      
      {/* Checkbox Sizes */}
      <div style={sectionStyle}>
        <h3 style={titleStyle}>Checkbox Sizes</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.md }}>
          <Checkbox
            label="Small checkbox"
            size="small"
            name="small"
          />
          
          <Checkbox
            label="Medium checkbox (default)"
            size="medium"
            name="medium"
          />
          
          <Checkbox
            label="Large checkbox"
            size="large"
            name="large"
          />
        </div>
        
        <pre style={codeStyle}>
{`// Size variants
<Checkbox
  label="Small checkbox"
  size="small"
  name="small"
/>

<Checkbox
  label="Medium checkbox (default)"
  size="medium"
  name="medium"
/>

<Checkbox
  label="Large checkbox"
  size="large"
  name="large"
/>`}
        </pre>
      </div>
      
      {/* Indeterminate State */}
      <div style={sectionStyle}>
        <h3 style={titleStyle}>Indeterminate State</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.md }}>
          <Checkbox
            label="Select all items"
            indeterminate={isIndeterminate}
            checked={isAllSelected}
            onChange={handleIndeterminateChange}
            name="indeterminate"
          />
          
          <div style={{ marginLeft: theme.spacing.lg }}>
            <Checkbox
              label="Item 1"
              name="item1"
            />
            <Checkbox
              label="Item 2"
              name="item2"
            />
            <Checkbox
              label="Item 3"
              name="item3"
            />
          </div>
        </div>
        
        <pre style={codeStyle}>
{`// Indeterminate state (some items selected)
const [isAllSelected, setIsAllSelected] = useState(false);
const [isIndeterminate, setIsIndeterminate] = useState(true);

<Checkbox
  label="Select all items"
  indeterminate={isIndeterminate}
  checked={isAllSelected}
  onChange={(e) => {
    setIsIndeterminate(false);
    setIsAllSelected(e.target.checked);
  }}
  name="indeterminate"
/>`}
        </pre>
      </div>
      
      {/* Integration with FormField */}
      <div style={sectionStyle}>
        <h3 style={titleStyle}>Integration with FormField</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.md }}>
          <FormField
            helperText={formError ? "You must agree to the terms to continue" : "By checking this box, you agree to our terms"}
            error={formError}
          >
            <Checkbox
              label="I agree to the terms and conditions"
              checked={agreeTerms}
              onChange={handleTermsChange}
              name="terms"
              error={formError}
            />
          </FormField>
        </div>
        
        <pre style={codeStyle}>
{`// Integration with FormField for validation
const [agreeTerms, setAgreeTerms] = useState(false);
const [formError, setFormError] = useState(false);

<FormField
  helperText={formError ? "You must agree to the terms to continue" : "By checking this box, you agree to our terms"}
  error={formError}
>
  <Checkbox
    label="I agree to the terms and conditions"
    checked={agreeTerms}
    onChange={(e) => {
      setAgreeTerms(e.target.checked);
      setFormError(!e.target.checked);
    }}
    name="terms"
    error={formError}
  />
</FormField>`}
        </pre>
      </div>
      
      {/* Checkbox Group */}
      <div style={sectionStyle}>
        <h3 style={titleStyle}>CheckboxGroup Component</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.lg }}>
          <CheckboxGroup
            name="notifications"
            label="Notification Preferences"
            options={notificationOptions}
            value={notifications}
            onChange={handleNotificationsChange}
            selectAllOption="Select all notification methods"
          />
        </div>
        
        <pre style={codeStyle}>
{`// CheckboxGroup with select all option
const [notifications, setNotifications] = useState(['email']);

const notificationOptions = [
  { value: 'email', label: 'Email notifications' },
  { value: 'sms', label: 'SMS notifications' },
  { value: 'push', label: 'Push notifications' },
  { value: 'browser', label: 'Browser notifications' }
];

<CheckboxGroup
  name="notifications"
  label="Notification Preferences"
  options={notificationOptions}
  value={notifications}
  onChange={setNotifications}
  selectAllOption="Select all notification methods"
/>`}
        </pre>
      </div>
      
      {/* Horizontal Checkbox Group */}
      <div style={sectionStyle}>
        <h3 style={titleStyle}>Horizontal CheckboxGroup</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.lg }}>
          <CheckboxGroup
            name="features"
            label="Select Features"
            options={featureOptions}
            value={features}
            onChange={handleFeaturesChange}
            direction="horizontal"
            spacing="lg"
          />
        </div>
        
        <pre style={codeStyle}>
{`// Horizontal CheckboxGroup
<CheckboxGroup
  name="features"
  label="Select Features"
  options={featureOptions}
  value={features}
  onChange={setFeatures}
  direction="horizontal"
  spacing="lg"
/>`}
        </pre>
      </div>
      
      {/* Error State Checkbox Group */}
      <div style={sectionStyle}>
        <h3 style={titleStyle}>Error State in CheckboxGroup</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.lg }}>
          <CheckboxGroup
            name="requiredFeatures"
            label="Required Features (at least one must be selected)"
            options={featureOptions.slice(0, 3)}
            error={true}
            defaultValue={[]}
          />
        </div>
        
        <pre style={codeStyle}>
{`// Error state in CheckboxGroup
<CheckboxGroup
  name="requiredFeatures"
  label="Required Features (at least one must be selected)"
  options={featureOptions.slice(0, 3)}
  error={true}
  defaultValue={[]}
/>`}
        </pre>
      </div>
    </div>
  );
};

export default CheckboxDemo;
