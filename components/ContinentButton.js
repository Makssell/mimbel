import styles from '../styles/site1.module.css';

const ContinentButton = ({ 
  label, 
  value, 
  isSelected, 
  onClick 
}) => {
  return (
    <button
      className={`${styles.continentButton} ${isSelected ? styles.selectedContinent : ''}`}
      onClick={onClick}
      aria-label={label}
    >
      {label}
    </button>
  );
};

export default ContinentButton;

 