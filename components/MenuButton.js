import React from 'react';
import styles from '../styles/site1.module.css';

const MenuButton = ({ 
  icon, 
  label, 
  description, 
  isSelected = false, 
  onClick, 
  disabled = false,
  type = 'default' // 'mode', 'gameType', 'continent', 'setting'
}) => {
  const getButtonClass = () => {
    const baseClass = styles.menuButton;
    const selectedClass = isSelected ? styles.selectedGameType : '';
    return `${baseClass} ${selectedClass}`.trim();
  };

  // Unified icon, label, and description classes for all button types
  const iconClass = styles.settingIcon;
  const labelClass = styles.settingLabel;
  const descriptionClass = styles.settingDescription;

  return (
    <button
      className={getButtonClass()}
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
    >
      {icon && <span className={iconClass}>{icon}</span>}
      <span className={labelClass}>{label}</span>
      {description && <span className={descriptionClass}>{description}</span>}
    </button>
  );
};

export default MenuButton; 