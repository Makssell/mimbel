/**
 * ProgressBar Component
 * Shows the current step in the game setup menu
 */

import sharedStyles from "../styles/shared.module.css";
import progressBarStyles from "../styles/progressBar.module.css";

const ProgressBar = ({
  gameMode,
  menuStep,
  progressBarHover,
  setProgressBarHover,
  getProgressSteps,
  getCurrentStepIndex,
  getCompletedSteps,
  canGoBack,
  canGoForward,
  goToPreviousStep,
  goToNextStep,
  handleProgressStepClick,
  playMenuClickSound
}) => {
  const steps = getProgressSteps();
  const currentIndex = getCurrentStepIndex();
  const completedSteps = getCompletedSteps();

  return (
    <div 
      className={progressBarStyles.progressBarContainer}
      onMouseEnter={() => setProgressBarHover(true)}
      onMouseLeave={() => setProgressBarHover(false)}
    >
      {/* Left Arrow (Desktop only) */}
      {progressBarHover && canGoBack() && (
        <button
          className={progressBarStyles.progressArrow}
          onClick={goToPreviousStep}
          aria-label="Go to previous step"
        >
          ←
        </button>
      )}
      
      {/* Progress Steps */}
      <div className={progressBarStyles.progressSteps}>
        {steps.map((step, index) => {
          const isCurrent = step.id === menuStep;
          const isCompleted = completedSteps.includes(step.id);
          const isFuture = index > currentIndex;
          const isTappable = index <= currentIndex; // Can tap current and completed steps
          
          return (
            <div key={step.id} className={progressBarStyles.progressStepWrapper}>
              <div
                className={`${progressBarStyles.progressStep} ${
                  isCurrent ? progressBarStyles.currentStep :
                  isCompleted ? progressBarStyles.completedStep :
                  progressBarStyles.futureStep
                } ${isTappable ? progressBarStyles.tappableStep : ''}`}
                onClick={isTappable ? () => handleProgressStepClick(step.id) : undefined}
                role={isTappable ? "button" : undefined}
                tabIndex={isTappable ? 0 : undefined}
                aria-label={isTappable ? `Go to ${step.name} step` : undefined}
              />
              {index < steps.length - 1 && (
                <div className={`${progressBarStyles.progressLine} ${
                  isCompleted ? progressBarStyles.completedLine : progressBarStyles.futureLine
                }`} />
              )}
            </div>
          );
        })}
      </div>
      
      {/* Right Arrow (Desktop only) */}
      {progressBarHover && canGoForward() && (
        <button
          className={progressBarStyles.progressArrow}
          onClick={goToNextStep}
          aria-label="Go to next step"
        >
          →
        </button>
      )}
    </div>
  );
};

export default ProgressBar;
