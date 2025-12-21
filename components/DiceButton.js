/**
 * DiceButton Component
 * A subtle button with dice icon that randomizes settings and starts the game
 */

import diceButtonStyles from "../styles/diceButton.module.css";

export default function DiceButton({ onClick, disabled }) {
  return (
    <button
      className={diceButtonStyles.diceButton}
      onClick={onClick}
      disabled={disabled}
      aria-label="Randomize settings and start game"
    >
      <span className={diceButtonStyles.diceIcon}>🎲</span>
    </button>
  );
}
