import { useState } from 'react';
import sharedStyles from '../styles/shared.module.css';
import modalsStyles from '../styles/modals.module.css';

const FeedbackModal = ({ isOpen, onClose, currentFlag = null, gameContext = null }) => {
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  const categories = [
    { value: 'bug', label: '🐛 Bug Report', description: 'Report a technical issue or error' },
    { value: 'flag-error', label: '🚩 Flag Data Error', description: 'Incorrect flag image, name, or information' },
    { value: 'feedback', label: '💬 General Feedback', description: 'Share your thoughts or suggest features' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!category || !description) {
      setSubmitMessage('Please select a category and provide your feedback.');
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage('');

    try {
      // Prepare the feedback data
      const feedbackData = {
        category,
        description,
        email: email || 'anonymous',
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        gameContext: gameContext || {},
        currentFlag: currentFlag ? {
          id: currentFlag.id,
          name: currentFlag.name,
          image_url: currentFlag.image_url
        } : null
      };

      // Submit feedback to API
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(feedbackData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to submit feedback');
      }
      
      setSubmitMessage('Thank you for your feedback! We\'ll review it shortly.');
      
      // Reset form
      setCategory('');
      setDescription('');
      setEmail('');
      
      // Close modal after a delay
      setTimeout(() => {
        onClose();
        setSubmitMessage('');
      }, 2000);
      
    } catch (error) {
      console.error('Error submitting feedback:', error);
      setSubmitMessage('Sorry, there was an error submitting your feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
      // Reset form when closing
      setCategory('');
      setDescription('');
      setEmail('');
      setSubmitMessage('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className={modalsStyles.modalOverlay} onClick={handleClose}>
      <div className={modalsStyles.feedbackModal} onClick={(e) => e.stopPropagation()}>
        <div className={modalsStyles.modalHeader}>
          <h2>📝 Send Feedback</h2>
          <button 
            className={modalsStyles.closeButton}
            onClick={handleClose}
            disabled={isSubmitting}
            aria-label="Close feedback modal"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className={modalsStyles.feedbackForm}>
          {/* Category Selection */}
          <div className={modalsStyles.formGroup}>
            <label className={modalsStyles.formLabel}>Category *</label>
            <div className={modalsStyles.categoryGrid}>
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  className={`${modalsStyles.categoryButton} ${category === cat.value ? modalsStyles.selectedCategory : ''}`}
                  onClick={() => setCategory(cat.value)}
                  disabled={isSubmitting}
                >
                  <div className={modalsStyles.categoryIcon}>{cat.label.split(' ')[0]}</div>
                  <div className={modalsStyles.categoryContent}>
                    <div className={modalsStyles.categoryLabel}>{cat.label.split(' ').slice(1).join(' ')}</div>
                    <div className={modalsStyles.categoryDescription}>{cat.description}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className={modalsStyles.formGroup}>
            <label className={modalsStyles.formLabel}>Your Feedback *</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell us what you think, report an issue, or suggest improvements..."
              className={modalsStyles.formTextarea}
              rows={5}
              disabled={isSubmitting}
              maxLength={1000}
            />
            <div className={modalsStyles.charCount}>
              {description.length}/1000 characters
            </div>
          </div>

          {/* Email (Optional) */}
          <div className={modalsStyles.formGroup}>
            <label className={modalsStyles.formLabel}>Email (Optional)</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.email@example.com"
              className={modalsStyles.formInput}
              disabled={isSubmitting}
            />
            <div className={modalsStyles.formHelp}>
              We'll only use this to follow up on your feedback if needed
            </div>
          </div>

          {/* Submit Message */}
          {submitMessage && (
            <div className={`${modalsStyles.submitMessage} ${submitMessage.includes('Thank you') ? modalsStyles.success : modalsStyles.error}`}>
              {submitMessage}
            </div>
          )}

          {/* Form Actions */}
          <div className={modalsStyles.formActions}>
            <button
              type="button"
              onClick={handleClose}
              className={`${sharedStyles.button} ${sharedStyles.secondaryButton}`}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`${sharedStyles.button} ${modalsStyles.mainButton}`}
              disabled={isSubmitting || !category || !description}
            >
              {isSubmitting ? 'Sending...' : 'Send Feedback'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FeedbackModal; 
