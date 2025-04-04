import React, { useState } from 'react';
import Modal from '../ui/Modal';
import { ThemeProvider } from '../../styles/ThemeProvider';

/**
 * ModalDemo Component
 * 
 * Demonstrates the usage of the Modal component with various configurations.
 */
const ModalDemo = () => {
  // State for basic modal
  const [isBasicModalOpen, setIsBasicModalOpen] = useState(false);
  
  // State for confirmation modal
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState(null);
  
  // State for different sizes
  const [sizeModalOpen, setSizeModalOpen] = useState(false);
  const [selectedSize, setSelectedSize] = useState('medium');
  
  // State for centered modal
  const [isCenteredModalOpen, setIsCenteredModalOpen] = useState(false);
  
  // State for full width modal
  const [isFullWidthModalOpen, setIsFullWidthModalOpen] = useState(false);
  
  // State for custom footer modal
  const [isCustomFooterModalOpen, setIsCustomFooterModalOpen] = useState(false);
  
  // State for nested modal
  const [isOuterModalOpen, setIsOuterModalOpen] = useState(false);
  const [isInnerModalOpen, setIsInnerModalOpen] = useState(false);
  
  // State for form modal
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  
  // Handle form input changes
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  // Handle form submission
  const handleFormSubmit = (e) => {
    e.preventDefault();
    alert(`Form submitted with:\nName: ${formData.name}\nEmail: ${formData.email}\nMessage: ${formData.message}`);
    setIsFormModalOpen(false);
  };
  
  // Button style for demo
  const buttonStyle = {
    padding: '8px 16px',
    margin: '8px',
    backgroundColor: '#6200ea',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: '500'
  };
  
  return (
    <ThemeProvider>
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
        <h1>Modal Component Demo</h1>
        <p>A feature-rich modal dialog component with various configurations.</p>
        
        {/* Basic Modal Demo */}
        <section style={{ marginBottom: '40px' }}>
          <h2>Basic Modal</h2>
          <button 
            style={buttonStyle}
            onClick={() => setIsBasicModalOpen(true)}
          >
            Open Basic Modal
          </button>
          
          <Modal 
            isOpen={isBasicModalOpen}
            onClose={() => setIsBasicModalOpen(false)}
            title="Basic Modal"
          >
            <p>This is a basic modal with a title and content.</p>
            <p>Click the X button or click outside the modal to close it.</p>
          </Modal>
        </section>
        
        {/* Confirmation Modal Demo */}
        <section style={{ marginBottom: '40px' }}>
          <h2>Confirmation Modal</h2>
          <button 
            style={buttonStyle}
            onClick={() => setIsConfirmationModalOpen(true)}
          >
            Open Confirmation Modal
          </button>
          
          {confirmationResult && (
            <div style={{ 
              marginTop: '10px', 
              padding: '10px', 
              backgroundColor: confirmationResult === 'confirmed' ? '#e6f7e6' : '#f7e6e6',
              borderRadius: '4px'
            }}>
              User {confirmationResult === 'confirmed' ? 'confirmed' : 'cancelled'} the action.
            </div>
          )}
          
          <Modal 
            isOpen={isConfirmationModalOpen}
            onClose={() => setIsConfirmationModalOpen(false)}
            title="Confirm Action"
            footer={
              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  style={{ 
                    ...buttonStyle, 
                    backgroundColor: '#6c757d',
                    margin: 0
                  }}
                  onClick={() => {
                    setConfirmationResult('cancelled');
                    setIsConfirmationModalOpen(false);
                  }}
                >
                  Cancel
                </button>
                <button 
                  style={{ 
                    ...buttonStyle,
                    margin: 0 
                  }}
                  onClick={() => {
                    setConfirmationResult('confirmed');
                    setIsConfirmationModalOpen(false);
                  }}
                >
                  Confirm
                </button>
              </div>
            }
          >
            <p>Are you sure you want to perform this action?</p>
            <p>This action cannot be undone.</p>
          </Modal>
        </section>
        
        {/* Different Sizes Demo */}
        <section style={{ marginBottom: '40px' }}>
          <h2>Different Sizes</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap' }}>
            {['small', 'medium', 'large', 'xlarge'].map((size) => (
              <button 
                key={size}
                style={buttonStyle}
                onClick={() => {
                  setSelectedSize(size);
                  setSizeModalOpen(true);
                }}
              >
                {size.charAt(0).toUpperCase() + size.slice(1)} Modal
              </button>
            ))}
          </div>
          
          <Modal 
            isOpen={sizeModalOpen}
            onClose={() => setSizeModalOpen(false)}
            title={`${selectedSize.charAt(0).toUpperCase() + selectedSize.slice(1)} Modal`}
            size={selectedSize}
          >
            <p>This is a modal with size <strong>{selectedSize}</strong>.</p>
            <div style={{ height: '100px', backgroundColor: '#f5f5f5', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              Content Area
            </div>
          </Modal>
        </section>
        
        {/* Centered Modal Demo */}
        <section style={{ marginBottom: '40px' }}>
          <h2>Centered Modal</h2>
          <button 
            style={buttonStyle}
            onClick={() => setIsCenteredModalOpen(true)}
          >
            Open Centered Modal
          </button>
          
          <Modal 
            isOpen={isCenteredModalOpen}
            onClose={() => setIsCenteredModalOpen(false)}
            title="Centered Modal"
            centered={true}
          >
            <p>This modal is vertically centered in the viewport.</p>
            <p>It's useful for important alerts or confirmations.</p>
          </Modal>
        </section>
        
        {/* Full Width Modal Demo */}
        <section style={{ marginBottom: '40px' }}>
          <h2>Full Width Modal</h2>
          <button 
            style={buttonStyle}
            onClick={() => setIsFullWidthModalOpen(true)}
          >
            Open Full Width Modal
          </button>
          
          <Modal 
            isOpen={isFullWidthModalOpen}
            onClose={() => setIsFullWidthModalOpen(false)}
            title="Full Width Modal"
            fullWidth={true}
          >
            <p>This modal takes up the full width of its container.</p>
            <p>It's useful for displaying large amounts of content or complex forms.</p>
            <div style={{ height: '200px', backgroundColor: '#f5f5f5', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              Wide Content Area
            </div>
          </Modal>
        </section>
        
        {/* Custom Footer Modal Demo */}
        <section style={{ marginBottom: '40px' }}>
          <h2>Custom Footer</h2>
          <button 
            style={buttonStyle}
            onClick={() => setIsCustomFooterModalOpen(true)}
          >
            Open Modal with Custom Footer
          </button>
          
          <Modal 
            isOpen={isCustomFooterModalOpen}
            onClose={() => setIsCustomFooterModalOpen(false)}
            title="Custom Footer Modal"
            footer={
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                <div>
                  <button 
                    style={{ 
                      padding: '6px 12px', 
                      backgroundColor: 'transparent', 
                      border: 'none',
                      color: '#6200ea',
                      cursor: 'pointer'
                    }}
                    onClick={() => alert('Help clicked')}
                  >
                    Need Help?
                  </button>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    style={{ 
                      ...buttonStyle, 
                      backgroundColor: '#6c757d',
                      margin: 0
                    }}
                    onClick={() => setIsCustomFooterModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    style={{ 
                      ...buttonStyle,
                      margin: 0 
                    }}
                    onClick={() => {
                      alert('Action completed');
                      setIsCustomFooterModalOpen(false);
                    }}
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            }
          >
            <p>This modal has a custom footer with multiple elements.</p>
            <p>You can add any content to the footer, like help links or multiple buttons.</p>
          </Modal>
        </section>
        
        {/* Nested Modal Demo */}
        <section style={{ marginBottom: '40px' }}>
          <h2>Nested Modals</h2>
          <button 
            style={buttonStyle}
            onClick={() => setIsOuterModalOpen(true)}
          >
            Open Nested Modal Example
          </button>
          
          <Modal 
            isOpen={isOuterModalOpen}
            onClose={() => setIsOuterModalOpen(false)}
            title="Outer Modal"
          >
            <p>This is the outer modal. You can open another modal from here.</p>
            <button 
              style={buttonStyle}
              onClick={() => setIsInnerModalOpen(true)}
            >
              Open Inner Modal
            </button>
            
            <Modal 
              isOpen={isInnerModalOpen}
              onClose={() => setIsInnerModalOpen(false)}
              title="Inner Modal"
              centered={true}
              size="small"
            >
              <p>This is the inner modal.</p>
              <p>You can stack modals for complex workflows.</p>
              <button 
                style={buttonStyle}
                onClick={() => setIsInnerModalOpen(false)}
              >
                Close Inner Modal
              </button>
            </Modal>
          </Modal>
        </section>
        
        {/* Form Modal Demo */}
        <section style={{ marginBottom: '40px' }}>
          <h2>Form in Modal</h2>
          <button 
            style={buttonStyle}
            onClick={() => setIsFormModalOpen(true)}
          >
            Open Form Modal
          </button>
          
          <Modal 
            isOpen={isFormModalOpen}
            onClose={() => setIsFormModalOpen(false)}
            title="Contact Form"
            footer={
              <div>
                <button 
                  style={{ 
                    ...buttonStyle, 
                    backgroundColor: '#6c757d',
                    margin: 0,
                    marginRight: '8px'
                  }}
                  onClick={() => setIsFormModalOpen(false)}
                  type="button"
                >
                  Cancel
                </button>
                <button 
                  style={{ 
                    ...buttonStyle,
                    margin: 0 
                  }}
                  form="contactForm"
                  type="submit"
                >
                  Submit
                </button>
              </div>
            }
          >
            <form id="contactForm" onSubmit={handleFormSubmit}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                  Name
                </label>
                <input 
                  type="text" 
                  name="name" 
                  value={formData.name} 
                  onChange={handleFormChange} 
                  style={{ 
                    width: '100%', 
                    padding: '8px 12px', 
                    borderRadius: '4px',
                    border: '1px solid #ced4da'
                  }}
                  required
                />
              </div>
              
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                  Email
                </label>
                <input 
                  type="email" 
                  name="email" 
                  value={formData.email} 
                  onChange={handleFormChange} 
                  style={{ 
                    width: '100%', 
                    padding: '8px 12px', 
                    borderRadius: '4px',
                    border: '1px solid #ced4da'
                  }}
                  required
                />
              </div>
              
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                  Message
                </label>
                <textarea 
                  name="message" 
                  value={formData.message} 
                  onChange={handleFormChange} 
                  style={{ 
                    width: '100%', 
                    padding: '8px 12px', 
                    borderRadius: '4px',
                    border: '1px solid #ced4da',
                    minHeight: '100px',
                    resize: 'vertical'
                  }}
                  required
                />
              </div>
            </form>
          </Modal>
        </section>
      </div>
    </ThemeProvider>
  );
};

export default ModalDemo;
