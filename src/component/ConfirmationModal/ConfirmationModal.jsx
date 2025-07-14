// src/components/ConfirmationModal/ConfirmationModal.jsx
import React from 'react';
import './ConfirmationModal.css';
import { FiLogOut, FiCheckCircle } from 'react-icons/fi';

/**
 * ConfirmationModal Component
 * 
 * A reusable modal dialog for confirming user actions with two variants:
 * - Danger (default): For destructive actions like deletion
 * - Success: For positive confirmations
 * 
 * Props:
 * @param {boolean} isOpen - Controls modal visibility
 * @param {function} onClose - Callback for cancel/close actions
 * @param {function} onConfirm - Callback for confirmation
 * @param {string} [title="Are you sure?"] - Modal title text
 * @param {string} [message="This action cannot be undone."] - Modal body text
 * @param {string} [confirmText="Confirm"] - Confirm button text
 * @param {string} [cancelText="Cancel"] - Cancel button text
 * @param {string} [type="danger"] - Modal type ('success' or 'danger')
 */
const ConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Are you sure?", 
  message = "This action cannot be undone.",
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "danger" // 'success' or 'danger'
}) => {
  // Return null if modal shouldn't be open (render nothing)
  if (!isOpen) return null;

  // Determine which icon to use based on modal type
  const Icon = type === "success" ? FiCheckCircle : FiLogOut;

  return (
    /* Modal overlay - fixed position covering entire viewport */
    <div className="modal-overlay">
      {/* Main modal container with animation */}
      <div className="modal-container">
        {/* Modal header with dynamic styling based on type */}
        <div className={`modal-header ${type}`}>
          <Icon size={24} />
          <h3>{title}</h3>
        </div>
        
        {/* Modal body with the message content */}
        <div className="modal-body">
          <p>{message}</p>
        </div>
        
        {/* Modal footer with action buttons */}
        <div className="modal-footer">
          {/* Cancel button - triggers onClose callback */}
          <button className="cancel-btn" onClick={onClose}>
            {cancelText}
          </button>
          
          {/* Confirm button - dynamic styling based on type */}
          <button 
            className={`confirm-btn ${type}`} 
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;