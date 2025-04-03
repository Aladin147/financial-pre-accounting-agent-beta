import React, { useState } from 'react';
import Radio from '../ui/Radio';
import RadioGroup from '../ui/RadioGroup';
import FormField from '../ui/FormField';
import { useTheme } from '../../styles/ThemeProvider';

/**
 * Demo component for Radio and RadioGroup
 * 
 * This component showcases the various features of the Radio and RadioGroup components
 * with different states, configurations, and use cases.
 */
const RadioDemo = () => {
  const { theme } = useTheme();
  
  // State for basic radio
  const [selectedOption, setSelectedOption] = useState('');
  
  // State for controlled radio group
  const [selectedGender, setSelectedGender] = useState('female');
  
  // State for radio with FormField
  const [selectedPlan, setSelectedPlan] = useState('');
  const [formError, setFormError] = useState(true);
  
  // State for horizontal radio group
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('card');
  
  // Gender options
  const genderOptions = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other/Non-binary' }
  ];
  
  // Plan options
  const planOptions = [
    { value: 'basic', label: 'Basic Plan - $9.99/month' },
    { value: 'pro', label: 'Pro Plan - $19.99/month' },
    { value: 'enterprise', label: 'Enterprise Plan - $49.99/month', disabled: true }
  ];
  
  // Payment method options
  const paymentMethodOptions = [
    { value: 'card', label: 'Credit Card' },
    { value: 'bank', label: 'Bank Transfer' },
    { value: 'paypal', label: 'PayPal' },
    { value: 'crypto', label: 'Cryptocurrency' }
  ];
  
  // Handle changes for basic radio
  const handleBasicRadioChange = (e) => {
    setSelectedOption(e.target.value);
  };
  
  // Handle gender selection change
  const handleGenderChange = (value) => {
    setSelectedGender(value);
  };
  
  // Handle plan selection change
  const handlePlanChange = (value) => {
    setSelectedPlan(value);
    setFormError(value === '');
  };
  
  // Handle payment method change
  const handlePaymentMethodChange = (value) => {
    setSelectedPaymentMethod(value);
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
      {/* Basic Radio Examples */}
      <div style={sectionStyle}>
        <h3 style={titleStyle}>Basic Radio</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.md }}>
          <Radio
            label="Option A (uncontrolled)"
            name="basic_option"
            value="option_a"
          />
          
          <Radio
            label="Option B (controlled)"
            name="controlled_option"
            value="option_b"
            checked={selectedOption === 'option_b'}
            onChange={handleBasicRadioChange}
          />
          
          <Radio
            label="Option C (controlled)"
            name="controlled_option"
            value="option_c"
            checked={selectedOption === 'option_c'}
            onChange={handleBasicRadioChange}
          />
          
          <Radio
            label="Disabled option"
            disabled
            name="disabled_option"
            value="disabled"
          />
          
          <Radio
            label="Disabled checked option"
            disabled
            checked
            name="disabled_checked_option"
            value="disabled_checked"
          />
          
          <Radio
            label="Error state"
            error
            name="error_option"
            value="error"
          />
          
          <Radio
            label="Success state"
            success
            name="success_option"
            value="success"
          />
        </div>
        
        <pre style={codeStyle}>
{`// Basic uncontrolled radio
<Radio
  label="Option A (uncontrolled)"
  name="basic_option"
  value="option_a"
/>

// Controlled radio buttons with state
const [selectedOption, setSelectedOption] = useState('');

<Radio
  label="Option B (controlled)"
  name="controlled_option"
  value="option_b"
  checked={selectedOption === 'option_b'}
  onChange={(e) => setSelectedOption(e.target.value)}
/>

<Radio
  label="Option C (controlled)"
  name="controlled_option"
  value="option_c"
  checked={selectedOption === 'option_c'}
  onChange={(e) => setSelectedOption(e.target.value)}
/>`}
        </pre>
      </div>
      
      {/* Radio Sizes */}
      <div style={sectionStyle}>
        <h3 style={titleStyle}>Radio Sizes</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.md }}>
          <Radio
            label="Small radio"
            size="small"
            name="small_radio"
            value="small"
          />
          
          <Radio
            label="Medium radio (default)"
            size="medium"
            name="medium_radio"
            value="medium"
          />
          
          <Radio
            label="Large radio"
            size="large"
            name="large_radio"
            value="large"
          />
        </div>
        
        <pre style={codeStyle}>
{`// Size variants
<Radio
  label="Small radio"
  size="small"
  name="small_radio"
  value="small"
/>

<Radio
  label="Medium radio (default)"
  size="medium"
  name="medium_radio"
  value="medium"
/>

<Radio
  label="Large radio"
  size="large"
  name="large_radio"
  value="large"
/>`}
        </pre>
      </div>
      
      {/* Integration with FormField */}
      <div style={sectionStyle}>
        <h3 style={titleStyle}>Integration with FormField</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.md }}>
          <FormField
            label="Select a subscription plan"
            helperText={formError ? "Please select a subscription plan to continue" : "You selected a plan successfully"}
            error={formError}
          >
            <RadioGroup
              name="plan"
              value={selectedPlan}
              onChange={handlePlanChange}
              options={planOptions}
              error={formError}
            />
          </FormField>
        </div>
        
        <pre style={codeStyle}>
{`// Integration with FormField for validation
const [selectedPlan, setSelectedPlan] = useState('');
const [formError, setFormError] = useState(true);

const planOptions = [
  { value: 'basic', label: 'Basic Plan - $9.99/month' },
  { value: 'pro', label: 'Pro Plan - $19.99/month' },
  { value: 'enterprise', label: 'Enterprise Plan - $49.99/month', disabled: true }
];

const handlePlanChange = (value) => {
  setSelectedPlan(value);
  setFormError(value === '');
};

<FormField
  label="Select a subscription plan"
  helperText={formError ? "Please select a subscription plan to continue" : "You selected a plan successfully"}
  error={formError}
>
  <RadioGroup
    name="plan"
    value={selectedPlan}
    onChange={handlePlanChange}
    options={planOptions}
    error={formError}
  />
</FormField>`}
        </pre>
      </div>
      
      {/* RadioGroup - Vertical */}
      <div style={sectionStyle}>
        <h3 style={titleStyle}>RadioGroup Component (Vertical)</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.lg }}>
          <RadioGroup
            name="gender"
            label="Gender"
            options={genderOptions}
            value={selectedGender}
            onChange={handleGenderChange}
          />
        </div>
        
        <pre style={codeStyle}>
{`// Vertical RadioGroup
const [selectedGender, setSelectedGender] = useState('female');

const genderOptions = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other/Non-binary' }
];

<RadioGroup
  name="gender"
  label="Gender"
  options={genderOptions}
  value={selectedGender}
  onChange={setSelectedGender}
/>`}
        </pre>
      </div>
      
      {/* Horizontal RadioGroup */}
      <div style={sectionStyle}>
        <h3 style={titleStyle}>Horizontal RadioGroup</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.lg }}>
          <RadioGroup
            name="payment_method"
            label="Payment Method"
            options={paymentMethodOptions}
            value={selectedPaymentMethod}
            onChange={handlePaymentMethodChange}
            direction="horizontal"
            spacing="lg"
          />
        </div>
        
        <pre style={codeStyle}>
{`// Horizontal RadioGroup
const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('card');

const paymentMethodOptions = [
  { value: 'card', label: 'Credit Card' },
  { value: 'bank', label: 'Bank Transfer' },
  { value: 'paypal', label: 'PayPal' },
  { value: 'crypto', label: 'Cryptocurrency' }
];

<RadioGroup
  name="payment_method"
  label="Payment Method"
  options={paymentMethodOptions}
  value={selectedPaymentMethod}
  onChange={setSelectedPaymentMethod}
  direction="horizontal"
  spacing="lg"
/>`}
        </pre>
      </div>
      
      {/* Error State RadioGroup */}
      <div style={sectionStyle}>
        <h3 style={titleStyle}>Error State in RadioGroup</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.lg }}>
          <RadioGroup
            name="required_option"
            label="Required Selection (with error state)"
            options={[
              { value: 'option1', label: 'Option 1' },
              { value: 'option2', label: 'Option 2' },
              { value: 'option3', label: 'Option 3' }
            ]}
            error={true}
          />
        </div>
        
        <pre style={codeStyle}>
{`// Error state in RadioGroup
<RadioGroup
  name="required_option"
  label="Required Selection (with error state)"
  options={[
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' }
  ]}
  error={true}
/>`}
        </pre>
      </div>
    </div>
  );
};

export default RadioDemo;
