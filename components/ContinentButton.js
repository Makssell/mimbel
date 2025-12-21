import React from 'react';
import startScreenStyles from '../styles/startScreen.module.css';

const ContinentButton = ({ 
  label, 
  isSelected, 
  onClick 
}) => {
  const buttonClass = [
    startScreenStyles.continentButton,
    isSelected ? startScreenStyles.selectedContinent : ''
  ].filter(Boolean).join(' ');

  return (
    <button
      className={buttonClass}
      onClick={onClick}
    >
      {label}
    </button>
  );
};

export default ContinentButton;

