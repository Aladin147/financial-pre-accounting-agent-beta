import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Switch from '../../src/renderer/components/ui/Switch';
import { ThemeProvider } from '../../src/renderer/styles/ThemeProvider';

// Mock the ThemeProvider to isolate tests
jest.mock('../../src/renderer/styles/ThemeProvider', () => ({
  useTheme: () => ({
    theme: {
      colors: {
        primary: {
          500: '#9747FF',
        },
        secondary: {
          500: '#FF4757',
        },
        neutral: {
          400: '#9E9EA7',
          800: '#2C2C3F',
        },
        error: {
          main: '#FF4757',
        },
        success: {
          main: '#4CD97B',
        },
        warning: {
          main: '#FFC107',
        },
        info: {
          main: '#29B6F6',
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

describe('Switch Component', () => {
  // Basic rendering test
  test('renders correctly with label', () => {
    render(<Switch label="Test Switch" data-testid="switch" />);
    expect(screen.getByText('Test Switch')).toBeInTheDocument();
    expect(screen.getByTestId('switch')).toBeInTheDocument();
  });
  
  // Test different switch states
  test('renders in unchecked state by default', () => {
    render(<Switch label="Unchecked" data-testid="switch" />);
    const switchInput = screen.getByTestId('switch');
    expect(switchInput).not.toBeChecked();
  });
  
  test('renders in checked state when checked prop is true', () => {
    render(<Switch label="Checked" data-testid="switch" checked />);
    const switchInput = screen.getByTestId('switch');
    expect(switchInput).toBeChecked();
  });
  
  test('renders in disabled state when disabled prop is true', () => {
    render(<Switch label="Disabled" data-testid="switch" disabled />);
    const switchInput = screen.getByTestId('switch');
    expect(switchInput).toBeDisabled();
  });
  
  // Test event handling
  test('calls onChange handler when clicked', () => {
    const handleChange = jest.fn();
    render(
      <Switch 
        label="Clickable" 
        data-testid="switch" 
        onChange={handleChange} 
      />
    );
    
    const switchInput = screen.getByTestId('switch');
    fireEvent.click(switchInput);
    expect(handleChange).toHaveBeenCalledTimes(1);
  });
  
  test('does not call onChange when disabled and clicked', () => {
    const handleChange = jest.fn();
    render(
      <Switch 
        label="Disabled" 
        data-testid="switch" 
        disabled 
        onChange={handleChange} 
      />
    );
    
    const switchInput = screen.getByTestId('switch');
    fireEvent.click(switchInput);
    expect(handleChange).not.toHaveBeenCalled();
  });
  
  // Test size variants
  test('renders with different size variants', () => {
    const { rerender } = render(
      <Switch 
        label="Small" 
        data-testid="switch" 
        size="small" 
      />
    );
    let switchInput = screen.getByTestId('switch');
    expect(switchInput).toBeInTheDocument();
    
    rerender(
      <Switch 
        label="Medium" 
        data-testid="switch" 
        size="medium" 
      />
    );
    switchInput = screen.getByTestId('switch');
    expect(switchInput).toBeInTheDocument();
    
    rerender(
      <Switch 
        label="Large" 
        data-testid="switch" 
        size="large" 
      />
    );
    switchInput = screen.getByTestId('switch');
    expect(switchInput).toBeInTheDocument();
  });
  
  // Test color variants
  test('renders with different color variants', () => {
    const { rerender } = render(
      <Switch 
        label="Primary" 
        data-testid="switch" 
        color="primary" 
        checked
      />
    );
    let switchInput = screen.getByTestId('switch');
    expect(switchInput).toBeInTheDocument();
    
    rerender(
      <Switch 
        label="Secondary" 
        data-testid="switch" 
        color="secondary" 
        checked
      />
    );
    switchInput = screen.getByTestId('switch');
    expect(switchInput).toBeInTheDocument();
    
    rerender(
      <Switch 
        label="Success" 
        data-testid="switch" 
        color="success" 
        checked
      />
    );
    switchInput = screen.getByTestId('switch');
    expect(switchInput).toBeInTheDocument();
    
    rerender(
      <Switch 
        label="Error" 
        data-testid="switch" 
        color="error" 
        checked
      />
    );
    switchInput = screen.getByTestId('switch');
    expect(switchInput).toBeInTheDocument();
  });
  
  // Test error state
  test('renders with error state', () => {
    render(
      <Switch 
        label="Error" 
        data-testid="switch" 
        error 
      />
    );
    const switchInput = screen.getByTestId('switch');
    expect(switchInput).toBeInTheDocument();
  });
  
  // Test label placement
  test('renders with different label placements', () => {
    const { rerender } = render(
      <Switch 
        label="End label" 
        data-testid="switch" 
        labelPlacement="end" 
      />
    );
    let switchInput = screen.getByTestId('switch');
    expect(switchInput).toBeInTheDocument();
    expect(screen.getByText('End label')).toBeInTheDocument();
    
    rerender(
      <Switch 
        label="Start label" 
        data-testid="switch" 
        labelPlacement="start" 
      />
    );
    switchInput = screen.getByTestId('switch');
    expect(switchInput).toBeInTheDocument();
    expect(screen.getByText('Start label')).toBeInTheDocument();
  });
  
  // Test focus handling
  test('handles focus events', () => {
    const handleFocus = jest.fn();
    const handleBlur = jest.fn();
    
    render(
      <Switch 
        label="Focus test" 
        data-testid="switch" 
        onFocus={handleFocus}
        onBlur={handleBlur}
      />
    );
    
    const switchInput = screen.getByTestId('switch');
    
    // Focus event
    fireEvent.focus(switchInput);
    expect(handleFocus).toHaveBeenCalledTimes(1);
    
    // Blur event
    fireEvent.blur(switchInput);
    expect(handleBlur).toHaveBeenCalledTimes(1);
  });
  
  // Test ref forwarding
  test('forwards ref to input element', () => {
    const ref = React.createRef();
    render(<Switch label="Ref Test" ref={ref} />);
    expect(ref.current).not.toBeNull();
    expect(ref.current.tagName).toBe('INPUT');
    expect(ref.current.type).toBe('checkbox');
  });
  
  // Test ARIA attributes
  test('has correct ARIA attributes', () => {
    render(<Switch label="ARIA Test" data-testid="switch" checked />);
    const switchInput = screen.getByTestId('switch');
    expect(switchInput).toHaveAttribute('role', 'switch');
    expect(switchInput).toHaveAttribute('aria-checked', 'true');
  });
});
