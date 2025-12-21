import React from 'react';
import sharedStyles from '../styles/shared.module.css';
import startScreenStyles from '../styles/startScreen.module.css';

const MenuButton = ({ 
  icon, 
  label, 
  description, 
  isSelected = false, 
  onClick, 
  disabled = false,
  type = 'default' // 'mode', 'gameType', 'continent', 'setting'
}) => {
  const buttonClass = [
    startScreenStyles.menuButton,
    isSelected ? startScreenStyles.selectedGameType : '',
    disabled ? '' : '' // disabled state is handled by :disabled pseudo-class
  ].filter(Boolean).join(' ');

  return (
    <button
      className={buttonClass}
      onClick={onClick}
      disabled={disabled}
    >
      {icon && <span style={{ fontSize: '56px', marginBottom: '10px' }}>{icon}</span>}
      <span style={{ fontSize: '26px', fontWeight: 'bold', marginBottom: description ? '8px' : '0' }}>{label}</span>
      {description && (
        <span className={startScreenStyles.settingDescription}>{description}</span>
      )}
    </button>
  );
};

export default MenuButton;

