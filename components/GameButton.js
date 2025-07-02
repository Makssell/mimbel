import React from 'react';
import styles from '../styles/site1.module.css';

const GameButton = ({ 
  children, 
  onClick, 
  disabled = false, 
  variant = 'guess', // 'guess', 'flagGuess', 'skip', 'retry'
  className = '',
  ...props
}) => {
  const getButtonClass = () => {
    const baseClass = styles.button;
    let variantClass = '';
    
    switch (variant) {
      case 'guess':
        variantClass = styles.guessButton;
        break;
      case 'flagGuess':
        variantClass = styles.flagGuessButton;
        break;
      case 'skip':
        variantClass = styles.skipButton;
        break;
      case 'retry':
        variantClass = styles.retryButton;
        break;
      default:
        variantClass = styles.guessButton;
    }
    
    return `${baseClass} ${variantClass} ${className}`.trim();
  };

  return (
    <button
      className={getButtonClass()}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

export default GameButton; 