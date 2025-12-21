import React from 'react';
import sharedStyles from '../styles/shared.module.css';

const ActionButton = ({ 
  children, 
  onClick, 
  disabled = false, 
  variant = 'primary', // 'primary', 'secondary', 'danger'
  loading = false,
  className = '',
  ...props
}) => {
  const buttonClass = [
    variant === 'primary' ? sharedStyles.mainButton : sharedStyles.secondaryButton,
    className
  ].filter(Boolean).join(' ');

  return (
    <button
      className={buttonClass}
      onClick={onClick}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className={sharedStyles.loadingSpinner}></span>
      ) : (
        children
      )}
    </button>
  );
};

export default ActionButton;

