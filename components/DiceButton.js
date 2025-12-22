/**
 * DiceButton Component
 * A subtle button with dice icon that randomizes settings and starts the game
 */

import { useState } from "react";
import diceButtonStyles from "../styles/diceButton.module.css";

export default function DiceButton({ onClick, disabled }) {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleClick = async () => {
    if (disabled || isAnimating) return;

    // Start animation
    setIsAnimating(true);

    // Wait for animation to complete (1.2 seconds)
    await new Promise(resolve => setTimeout(resolve, 1200));

    // Call the actual onClick handler
    if (onClick) {
      await onClick();
    }

    // Reset animation state
    setIsAnimating(false);
  };

  return (
    <button
      className={`${diceButtonStyles.diceButton} ${isAnimating ? diceButtonStyles.animating : ''}`}
      onClick={handleClick}
      disabled={disabled || isAnimating}
      aria-label="Randomize settings and start game"
    >
      <span className={`${diceButtonStyles.diceIcon} ${isAnimating ? diceButtonStyles.diceIconAnimating : ''}`}>🎲</span>
    </button>
  );
}
