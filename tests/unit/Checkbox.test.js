import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Checkbox from '../../src/renderer/components/ui/Checkbox';
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

describe('Checkbox Component', () => {
  // Basic rendering test
  test('renders correctly with label', () => {
    render(<Checkbox label="Test Checkbox" data-testid="checkbox" />);
    expect(screen.getByText('Test Checkbox')).toBeInTheDocument();
    expect(screen.getByTestId('checkbox')).toBeInTheDocument();
  });
  
  // Test different checkbox states
  test('renders in unchecked state by default', () => {
    render(<Checkbox label="Unchecked" data-testid="checkbox" />);
    const checkbox = screen.getByTestId('checkbox');
    expect(checkbox).not.toBeChecked();
  });
  
  test('renders in checked state when checked prop is true', () => {
    render(<Checkbox label="Checked" data-testid="checkbox" checked />);
    const checkbox = screen.getByTestId('checkbox');
    expect(checkbox).toBeChecked();
  });
  
  test('renders in disabled state when disabled prop is true', () => {
    render(<Checkbox label="Disabled" data-testid="checkbox" disabled />);
    const checkbox = screen.getByTestId('checkbox');
    expect(checkbox).toBeDisabled();
  });
  
  test('renders in indeterminate state when indeterminate prop is true', () => {
    const { container } = render(
      <Checkbox label="Indeterminate" data-testid="checkbox" indeterminate />
    );
    const checkbox = screen.getByTestId('checkbox');
    expect(checkbox.indeterminate).toBe(true);
  });
  
  // Test event handling
  test('calls onChange handler when clicked', () => {
    const handleChange = jest.fn();
    render(
      <Checkbox 
        label="Clickable" 
        data-testid="checkbox" 
        onChange={handleChange} 
      />
    );
    
    const checkbox = screen.getByTestId('checkbox');
    fireEvent.click(checkbox);
    expect(handleChange).toHaveBeenCalledTimes(1);
  });
  
  test('does not call onChange when disabled and clicked', () => {
    const handleChange = jest.fn();
    render(
      <Checkbox 
        label="Disabled" 
        data-testid="checkbox" 
        disabled 
        onChange={handleChange} 
      />
    );
    
    const checkbox = screen.getByTestId('checkbox');
    fireEvent.click(checkbox);
    expect(handleChange).not.toHaveBeenCalled();
  });
  
  // Test size variants
  test('renders with different size variants', () => {
    const { rerender } = render(
      <Checkbox 
        label="Small" 
        data-testid="checkbox" 
        size="small" 
      />
    );
    let checkbox = screen.getByTestId('checkbox');
    expect(checkbox).toBeInTheDocument();
    
    rerender(
      <Checkbox 
        label="Medium" 
        data-testid="checkbox" 
        size="medium" 
      />
    );
    checkbox = screen.getByTestId('checkbox');
    expect(checkbox).toBeInTheDocument();
    
    rerender(
      <Checkbox 
        label="Large" 
        data-testid="checkbox" 
        size="large" 
      />
    );
    checkbox = screen.getByTestId('checkbox');
    expect(checkbox).toBeInTheDocument();
  });
  
  // Test error state
  test('renders with error state', () => {
    render(
      <Checkbox 
        label="Error" 
        data-testid="checkbox" 
        error 
      />
    );
    const checkbox = screen.getByTestId('checkbox');
    expect(checkbox).toBeInTheDocument();
    // In a real test, we might check for specific styling
  });
  
  // Test success state
  test('renders with success state', () => {
    render(
      <Checkbox 
        label="Success" 
        data-testid="checkbox" 
        success 
      />
    );
    const checkbox = screen.getByTestId('checkbox');
    expect(checkbox).toBeInTheDocument();
    // In a real test, we might check for specific styling
  });
  
  // Test with custom icons
  test('renders with custom icons', () => {
    const CustomCheckedIcon = () => <div data-testid="custom-checked-icon">✓</div>;
    const CustomIndeterminateIcon = () => <div data-testid="custom-indeterminate-icon">-</div>;
    
    const { rerender } = render(
      <Checkbox 
        label="Custom Icons" 
        data-testid="checkbox"
        checked
        checkedIcon={CustomCheckedIcon}
      />
    );
    
    expect(screen.getByTestId('custom-checked-icon')).toBeInTheDocument();
    
    rerender(
      <Checkbox 
        label="Custom Icons" 
        data-testid="checkbox"
        indeterminate
        indeterminateIcon={CustomIndeterminateIcon}
      />
    );
    
    expect(screen.getByTestId('custom-indeterminate-icon')).toBeInTheDocument();
  });
  
  // Test ref forwarding
  test('forwards ref to input element', () => {
    const ref = React.createRef();
    render(<Checkbox label="Ref Test" ref={ref} />);
    expect(ref.current).not.toBeNull();
    expect(ref.current.tagName).toBe('INPUT');
    expect(ref.current.type).toBe('checkbox');
  });
});
