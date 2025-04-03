import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Radio from '../../src/renderer/components/ui/Radio';
import { ThemeProvider } from '../../src/renderer/styles/ThemeProvider';

// Mock the ThemeProvider to isolate tests
jest.mock('../../src/renderer/styles/ThemeProvider', () => ({
  useTheme: () => ({
    theme: {
      colors: {
        primary: {
          500: '#9747FF',
        },
        neutral: {
          400: '#9E9EA7',
          800: '#2C2C3F',
        },
        error: {
          main: '#FF4757',
        },
        border: {
          light: 'rgba(255, 255, 255, 0.08)',
        },
        text: {
          primary: 'rgba(255, 255, 255, 0.92)',
          disabled: 'rgba(255, 255, 255, 0.5)',
        },
      },
      spacing: {
        sm: '8px',
      },
      borderRadius: {
        sm: '4px',
      },
      typography: {
        caption: { fontSize: '12px' },
        body1: { fontSize: '16px' },
        body2: { fontSize: '14px' },
      },
      transition: {
        default: '0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
    isDarkMode: true,
  }),
  ThemeProvider: ({ children }) => <div>{children}</div>,
}));

describe('Radio Component', () => {
  // Basic rendering test
  test('renders correctly with label', () => {
    render(<Radio label="Test Radio" data-testid="radio" />);
    expect(screen.getByText('Test Radio')).toBeInTheDocument();
    expect(screen.getByTestId('radio')).toBeInTheDocument();
  });
  
  // Test different radio states
  test('renders in unchecked state by default', () => {
    render(<Radio label="Unchecked" data-testid="radio" />);
    const radio = screen.getByTestId('radio');
    expect(radio).not.toBeChecked();
  });
  
  test('renders in checked state when checked prop is true', () => {
    render(<Radio label="Checked" data-testid="radio" checked />);
    const radio = screen.getByTestId('radio');
    expect(radio).toBeChecked();
  });
  
  test('renders in disabled state when disabled prop is true', () => {
    render(<Radio label="Disabled" data-testid="radio" disabled />);
    const radio = screen.getByTestId('radio');
    expect(radio).toBeDisabled();
  });
  
  // Test event handling
  test('calls onChange handler when clicked', () => {
    const handleChange = jest.fn();
    render(
      <Radio 
        label="Clickable" 
        data-testid="radio" 
        onChange={handleChange} 
      />
    );
    
    const radio = screen.getByTestId('radio');
    fireEvent.click(radio);
    expect(handleChange).toHaveBeenCalledTimes(1);
  });
  
  test('does not call onChange when disabled and clicked', () => {
    const handleChange = jest.fn();
    render(
      <Radio 
        label="Disabled" 
        data-testid="radio" 
        disabled 
        onChange={handleChange} 
      />
    );
    
    const radio = screen.getByTestId('radio');
    fireEvent.click(radio);
    expect(handleChange).not.toHaveBeenCalled();
  });
  
  // Test size variants
  test('renders with different size variants', () => {
    const { rerender } = render(
      <Radio 
        label="Small" 
        data-testid="radio" 
        size="small" 
      />
    );
    let radio = screen.getByTestId('radio');
    expect(radio).toBeInTheDocument();
    
    rerender(
      <Radio 
        label="Medium" 
        data-testid="radio" 
        size="medium" 
      />
    );
    radio = screen.getByTestId('radio');
    expect(radio).toBeInTheDocument();
    
    rerender(
      <Radio 
        label="Large" 
        data-testid="radio" 
        size="large" 
      />
    );
    radio = screen.getByTestId('radio');
    expect(radio).toBeInTheDocument();
  });
  
  // Test error state
  test('renders with error state', () => {
    render(
      <Radio 
        label="Error" 
        data-testid="radio" 
        error 
      />
    );
    const radio = screen.getByTestId('radio');
    expect(radio).toBeInTheDocument();
    // In a real test, we might check for specific styling
  });
  
  // Test success state
  test('renders with success state', () => {
    render(
      <Radio 
        label="Success" 
        data-testid="radio" 
        success 
      />
    );
    const radio = screen.getByTestId('radio');
    expect(radio).toBeInTheDocument();
    // In a real test, we might check for specific styling
  });
  
  // Test with radio name and grouping
  test('uses the same name for grouped radio buttons', () => {
    render(
      <>
        <Radio 
          label="Option 1" 
          name="group"
          value="option1"
          data-testid="radio1" 
        />
        <Radio 
          label="Option 2" 
          name="group"
          value="option2"
          data-testid="radio2" 
        />
      </>
    );
    
    const radio1 = screen.getByTestId('radio1');
    const radio2 = screen.getByTestId('radio2');
    expect(radio1.name).toBe('group');
    expect(radio2.name).toBe('group');
  });
  
  // Test focused state
  test('handles focus events', () => {
    const handleFocus = jest.fn();
    const handleBlur = jest.fn();
    
    render(
      <Radio 
        label="Focus test" 
        data-testid="radio" 
        onFocus={handleFocus}
        onBlur={handleBlur}
      />
    );
    
    const radio = screen.getByTestId('radio');
    
    // Focus event
    fireEvent.focus(radio);
    expect(handleFocus).toHaveBeenCalledTimes(1);
    
    // Blur event
    fireEvent.blur(radio);
    expect(handleBlur).toHaveBeenCalledTimes(1);
  });
  
  // Test ref forwarding
  test('forwards ref to input element', () => {
    const ref = React.createRef();
    render(<Radio label="Ref Test" ref={ref} />);
    expect(ref.current).not.toBeNull();
    expect(ref.current.tagName).toBe('INPUT');
    expect(ref.current.type).toBe('radio');
  });
});
