import React, { useState } from 'react';
import Switch from '../ui/Switch';
import FormField from '../ui/FormField';
import { useTheme } from '../../styles/ThemeProvider';

/**
 * Demo component for Switch
 * 
 * This component showcases the various features of the Switch component
 * with different states, configurations, and use cases.
 */
const SwitchDemo = () => {
  const { theme } = useTheme();
  
  // State for controlled switches
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [autoSave, setAutoSave] = useState(true);
  const [premium, setPremium] = useState(false);
  
  // State for switch with FormField
  const [emailUpdates, setEmailUpdates] = useState(false);
  const [formError, setFormError] = useState(false);
  
  // Handle changes for notification switch
  const handleNotificationsChange = (e) => {
    setNotifications(e.target.checked);
  };
  
  // Handle changes for dark mode switch
  const handleDarkModeChange = (e) => {
    setDarkMode(e.target.checked);
  };
  
  // Handle changes for auto save switch
  const handleAutoSaveChange = (e) => {
    setAutoSave(e.target.checked);
  };
  
  // Handle changes for premium switch
  const handlePremiumChange = (e) => {
    setPremium(e.target.checked);
  };
  
  // Handle changes for email updates switch with validation
  const handleEmailUpdatesChange = (e) => {
    setEmailUpdates(e.target.checked);
    setFormError(false);
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
      {/* Basic Switch Examples */}
      <div style={sectionStyle}>
        <h3 style={titleStyle}>Basic Switch</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.md }}>
          <Switch
            label="Uncontrolled switch (default unchecked)"
            name="uncontrolled1"
          />
          
          <Switch
            label="Uncontrolled switch (default checked)"
            name="uncontrolled2"
            defaultChecked
          />
          
          <Switch
            label="Notifications"
            name="notifications"
            checked={notifications}
            onChange={handleNotificationsChange}
          />
          
          <Switch
            label="Dark Mode"
            name="darkMode"
            checked={darkMode}
            onChange={handleDarkModeChange}
          />
        </div>
        
        <pre style={codeStyle}>
{`// Uncontrolled switch
<Switch
  label="Uncontrolled switch (default unchecked)"
  name="uncontrolled1"
/>

// Controlled switch with state
const [notifications, setNotifications] = useState(true);

<Switch
  label="Notifications"
  name="notifications"
  checked={notifications}
  onChange={(e) => setNotifications(e.target.checked)}
/>`}
        </pre>
      </div>
      
      {/* Switch Sizes */}
      <div style={sectionStyle}>
        <h3 style={titleStyle}>Switch Sizes</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.md }}>
          <Switch
            label="Small switch"
            size="small"
            name="smallSwitch"
            defaultChecked
          />
          
          <Switch
            label="Medium switch (default)"
            size="medium"
            name="mediumSwitch"
            defaultChecked
          />
          
          <Switch
            label="Large switch"
            size="large"
            name="largeSwitch"
            defaultChecked
          />
        </div>
        
        <pre style={codeStyle}>
{`// Size variants
<Switch
  label="Small switch"
  size="small"
  name="smallSwitch"
  defaultChecked
/>

<Switch
  label="Medium switch (default)"
  size="medium"
  name="mediumSwitch"
  defaultChecked
/>

<Switch
  label="Large switch"
  size="large"
  name="largeSwitch"
  defaultChecked
/>`}
        </pre>
      </div>
      
      {/* Switch Colors */}
      <div style={sectionStyle}>
        <h3 style={titleStyle}>Switch Colors</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.md }}>
          <Switch
            label="Primary color (default)"
            color="primary"
            name="primarySwitch"
            defaultChecked
          />
          
          <Switch
            label="Secondary color"
            color="secondary"
            name="secondarySwitch"
            defaultChecked
          />
          
          <Switch
            label="Success color"
            color="success"
            name="successSwitch"
            defaultChecked
          />
          
          <Switch
            label="Error color"
            color="error"
            name="errorSwitch"
            defaultChecked
          />
          
          <Switch
            label="Warning color"
            color="warning"
            name="warningSwitch"
            defaultChecked
          />
          
          <Switch
            label="Info color"
            color="info"
            name="infoSwitch"
            defaultChecked
          />
        </div>
        
        <pre style={codeStyle}>
{`// Color variants
<Switch
  label="Primary color (default)"
  color="primary"
  name="primarySwitch"
  defaultChecked
/>

<Switch
  label="Success color"
  color="success"
  name="successSwitch"
  defaultChecked
/>

// Available colors: primary, secondary, success, error, warning, info`}
        </pre>
      </div>
      
      {/* Switch States */}
      <div style={sectionStyle}>
        <h3 style={titleStyle}>Switch States</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.md }}>
          <Switch
            label="Disabled (unchecked)"
            disabled
            name="disabledUnchecked"
          />
          
          <Switch
            label="Disabled (checked)"
            disabled
            defaultChecked
            name="disabledChecked"
          />
          
          <Switch
            label="With error state"
            error
            name="errorSwitch"
          />
          
          <Switch
            label="Auto save documents"
            checked={autoSave}
            onChange={handleAutoSaveChange}
            name="autoSave"
          />
          
          <Switch
            label="Premium features"
            checked={premium}
            onChange={handlePremiumChange}
            name="premium"
            color="success"
          />
        </div>
        
        <pre style={codeStyle}>
{`// Disabled state
<Switch
  label="Disabled (unchecked)"
  disabled
  name="disabledUnchecked"
/>

// Error state
<Switch
  label="With error state"
  error
  name="errorSwitch"
/>`}
        </pre>
      </div>
      
      {/* Label Placement */}
      <div style={sectionStyle}>
        <h3 style={titleStyle}>Label Placement</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.md }}>
          <Switch
            label="Label at end (default)"
            labelPlacement="end"
            name="labelEnd"
            defaultChecked
          />
          
          <Switch
            label="Label at start"
            labelPlacement="start"
            name="labelStart"
            defaultChecked
          />
        </div>
        
        <pre style={codeStyle}>
{`// Label placement
<Switch
  label="Label at end (default)"
  labelPlacement="end"
  name="labelEnd"
  defaultChecked
/>

<Switch
  label="Label at start"
  labelPlacement="start"
  name="labelStart"
  defaultChecked
/>`}
        </pre>
      </div>
      
      {/* Integration with FormField */}
      <div style={sectionStyle}>
        <h3 style={titleStyle}>Integration with FormField</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.md }}>
          <FormField
            helperText={emailUpdates 
              ? "You'll receive our weekly newsletter" 
              : "Subscribe to our newsletter for updates"}
            error={formError}
          >
            <Switch
              label="Subscribe to email updates"
              checked={emailUpdates}
              onChange={handleEmailUpdatesChange}
              name="emailUpdates"
              error={formError}
            />
          </FormField>
          
          <button
            onClick={() => setFormError(!emailUpdates)}
            style={{
              background: theme.colors.primary[500],
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: theme.borderRadius.md,
              cursor: 'pointer',
              fontSize: '14px',
              width: 'fit-content'
            }}
          >
            Submit Form
          </button>
        </div>
        
        <pre style={codeStyle}>
{`// Integration with FormField for validation
const [emailUpdates, setEmailUpdates] = useState(false);
const [formError, setFormError] = useState(false);

const handleEmailUpdatesChange = (e) => {
  setEmailUpdates(e.target.checked);
  setFormError(false);
};

const handleSubmit = () => {
  setFormError(!emailUpdates);
};

<FormField
  helperText={emailUpdates 
    ? "You'll receive our weekly newsletter" 
    : "Subscribe to our newsletter for updates"}
  error={formError}
>
  <Switch
    label="Subscribe to email updates"
    checked={emailUpdates}
    onChange={handleEmailUpdatesChange}
    name="emailUpdates"
    error={formError}
  />
</FormField>

<button onClick={handleSubmit}>
  Submit Form
</button>`}
        </pre>
      </div>
    </div>
  );
};

export default SwitchDemo;
