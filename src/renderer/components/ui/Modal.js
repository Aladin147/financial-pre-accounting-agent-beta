import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { useTheme } from '../../styles/ThemeProvider';

/**
 * Modal Component
 * 
 * A customizable modal dialog component with backdrop, animations, and accessibility features.
 * Integrated with the application's theme system.
 *
 * @example
 * // Basic usage
 * const [isOpen, setIsOpen] = useState(false);
 * 
 * <Button onClick={() => setIsOpen(true)}>Open Modal</Button>
 * 
 * <Modal 
 *   isOpen={isOpen} 
 *   onClose={() => setIsOpen(false)}
 *   title="Sample Modal"
 * >
 *   <p>This is the modal content.</p>
 * </Modal>
 * 
 * // With custom footer
 * <Modal
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   title="Confirmation"
 *   footer={
 *     <>
 *       <Button variant="secondary" onClick={() => setIsOpen(false)}>Cancel</Button>
 *       <Button variant="primary" onClick={handleConfirm}>Confirm</Button>
 *     </>
 *   }
 * >
 *   <p>Are you sure you want to proceed?</p>
 * </Modal>
 */
const Modal = ({
  // Content
  children,
  title,
  footer,
  
  // State
  isOpen = false,
  onClose = () => {},
  
  // Size and Position
  size = 'medium',
  centered = false,
  fullWidth = false,
  
  // Behavior
  closeOnBackdropClick = true,
  closeOnEscape = true,
  showCloseButton = true,
  
  // Animation
  animationDuration = 300,
  
  // Accessibility
  ariaLabelledBy,
  ariaDescribedBy,
  
  // Styling
  className = '',
  contentClassName = '',
  headerClassName = '',
  footerClassName = '',
  backdropClassName = '',
  closeButtonClassName = '',
  
  // Additional props
  id,
  style = {},
  ...rest
}) => {
  const { theme, isDarkMode } = useTheme();
  const [isAnimating, setIsAnimating] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const modalRef = useRef(null);
  const previousActiveElement = useRef(null);
  
  // Handle modal opening and closing
  useEffect(() => {
    if (isOpen && !isVisible) {
      // Save previously focused element to restore it when modal closes
      previousActiveElement.current = document.activeElement;
      
      // Start opening animation
      setIsAnimating(true);
      setIsVisible(true);
      
      // Focus the modal after animation
      setTimeout(() => {
        setIsAnimating(false);
        if (modalRef.current) {
          modalRef.current.focus();
        }
      }, animationDuration);
    } else if (!isOpen && isVisible) {
      // Start closing animation
      setIsAnimating(true);
      
      // Hide modal after animation
      setTimeout(() => {
        setIsAnimating(false);
        setIsVisible(false);
        
        // Restore focus to previously focused element
        if (previousActiveElement.current) {
          previousActiveElement.current.focus();
        }
      }, animationDuration);
    }
  }, [isOpen, animationDuration]);
  
  // Handle ESC key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (closeOnEscape && e.key === 'Escape' && isVisible && !isAnimating) {
        onClose();
      }
    };
    
    if (isVisible) {
      document.addEventListener('keydown', handleKeyDown);
    }
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isVisible, isAnimating, closeOnEscape, onClose]);
  
  // Handle click outside modal
  const handleBackdropClick = (e) => {
    if (closeOnBackdropClick && e.target === e.currentTarget && !isAnimating) {
      onClose();
    }
  };
  
  // Prevent tab from leaving the modal
  const handleTabKey = (e) => {
    if (e.key !== 'Tab' || !modalRef.current) return;
    
    const focusableElements = modalRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    if (e.shiftKey && document.activeElement === firstElement) {
      lastElement.focus();
      e.preventDefault();
    } else if (!e.shiftKey && document.activeElement === lastElement) {
      firstElement.focus();
      e.preventDefault();
    }
  };
  
  // Add scroll lock to body when modal is open
  useEffect(() => {
    if (isVisible) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    } else {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }
    
    return () => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    };
  }, [isVisible]);
  
  // If modal is not visible, don't render anything
  if (!isVisible) {
    return null;
  }
  
  // Generate modal sizes
  const sizeStyles = {
    small: {
      maxWidth: '400px',
    },
    medium: {
      maxWidth: '600px',
    },
    large: {
      maxWidth: '800px',
    },
    xlarge: {
      maxWidth: '1000px',
    },
  };
  
  // Generate styles
  const styles = {
    backdrop: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: centered ? 'center' : 'flex-start',
      justifyContent: 'center',
      zIndex: 1000,
      padding: centered ? '0px' : '48px 0',
      overflow: 'auto',
      opacity: isAnimating && isOpen ? 0 : 1,
      transition: `opacity ${animationDuration}ms ease-in-out`,
    },
    modalContainer: {
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: isDarkMode ? theme.colors.bg.card : '#ffffff',
      borderRadius: theme.borderRadius.md,
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
      margin: centered ? 'auto' : '0 auto',
      width: fullWidth ? '100%' : 'auto',
      ...(fullWidth ? {} : sizeStyles[size]),
      maxHeight: centered ? 'calc(100vh - 48px)' : 'calc(100vh - 96px)',
      transform: isAnimating ? 
        (isOpen ? 'translateY(20px) scale(0.95)' : 'translateY(0) scale(1)') : 
        'translateY(0) scale(1)',
      opacity: isAnimating && isOpen ? 0 : 1,
      transition: `transform ${animationDuration}ms ease-out, opacity ${animationDuration}ms ease-in-out`,
      ...style,
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '16px 24px',
      borderBottom: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
      position: 'relative',
    },
    title: {
      margin: 0,
      fontSize: '1.25rem',
      fontWeight: 600,
      color: isDarkMode ? theme.colors.text.primary : theme.colors.text.primary,
    },
    closeButton: {
      padding: '8px',
      background: 'transparent',
      border: 'none',
      borderRadius: '50%',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
      transition: 'background-color 0.2s ease',
      '&:hover': {
        backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
      },
    },
    content: {
      padding: '24px',
      overflow: 'auto',
      flexGrow: 1,
    },
    footer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      padding: '16px 24px',
      borderTop: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
      gap: '8px',
    },
  };
  
  // Generate aria attributes
  const ariaProps = {
    role: 'dialog',
    'aria-modal': true,
    ...(ariaLabelledBy ? { 'aria-labelledby': ariaLabelledBy } : {}),
    ...(ariaDescribedBy ? { 'aria-describedby': ariaDescribedBy } : {}),
    ...(title && !ariaLabelledBy ? { 'aria-label': title } : {}),
  };
  
  return (
    <div 
      className={`modal-backdrop ${backdropClassName}`}
      style={styles.backdrop}
      onClick={handleBackdropClick}
      data-testid="modal-backdrop"
    >
      <div
        ref={modalRef}
        className={`modal-container ${className}`}
        style={styles.modalContainer}
        tabIndex={-1}
        onKeyDown={handleTabKey}
        id={id}
        {...ariaProps}
        {...rest}
        data-testid="modal"
      >
        {/* Modal Header */}
        {(title || showCloseButton) && (
          <div className={`modal-header ${headerClassName}`} style={styles.header}>
            {title && (
              <h2
                className="modal-title"
                style={styles.title}
                id={ariaLabelledBy}
              >
                {title}
              </h2>
            )}
            
            {showCloseButton && (
              <button
                type="button"
                className={`modal-close-button ${closeButtonClassName}`}
                style={styles.closeButton}
                onClick={onClose}
                aria-label="Close"
                data-testid="modal-close-button"
              >
                <svg 
                  width="18" 
                  height="18" 
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            )}
          </div>
        )}
        
        {/* Modal Content */}
        <div 
          className={`modal-content ${contentClassName}`} 
          style={styles.content}
          id={ariaDescribedBy}
        >
          {children}
        </div>
        
        {/* Modal Footer */}
        {footer && (
          <div className={`modal-footer ${footerClassName}`} style={styles.footer}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

Modal.propTypes = {
  // Content
  children: PropTypes.node,
  title: PropTypes.string,
  footer: PropTypes.node,
  
  // State
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  
  // Size and Position
  size: PropTypes.oneOf(['small', 'medium', 'large', 'xlarge']),
  centered: PropTypes.bool,
  fullWidth: PropTypes.bool,
  
  // Behavior
  closeOnBackdropClick: PropTypes.bool,
  closeOnEscape: PropTypes.bool,
  showCloseButton: PropTypes.bool,
  
  // Animation
  animationDuration: PropTypes.number,
  
  // Accessibility
  ariaLabelledBy: PropTypes.string,
  ariaDescribedBy: PropTypes.string,
  
  // Styling
  className: PropTypes.string,
  contentClassName: PropTypes.string,
  headerClassName: PropTypes.string,
  footerClassName: PropTypes.string,
  backdropClassName: PropTypes.string,
  closeButtonClassName: PropTypes.string,
  
  // Additional props
  id: PropTypes.string,
  style: PropTypes.object,
};

export default Modal;
