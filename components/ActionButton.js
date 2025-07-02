import React from 'react';
import styles from '../styles/site1.module.css';

const ActionButton = ({ 
  children, 
  onClick, 
  disabled = false, 
  variant = 'primary', // 'primary', 'secondary'
  className = ''
}) => {
  const getButtonClass = () => {
    const baseClass = styles.button;
    const variantClass = variant === 'primary' ? styles.mainButton : styles.secondaryButton;
    return `${baseClass} ${variantClass} ${className}`.trim();
  };

  return (
    <button
      className={getButtonClass()}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default ActionButton; 