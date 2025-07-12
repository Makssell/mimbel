import { useState } from 'react';
import styles from '../styles/site1.module.css';

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
      const response = await fetch('/api/admin/feedback', {
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
    <div className={styles.modalOverlay} onClick={handleClose}>
      <div className={styles.feedbackModal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>📝 Send Feedback</h2>
          <button 
            className={styles.closeButton}
            onClick={handleClose}
            disabled={isSubmitting}
            aria-label="Close feedback modal"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.feedbackForm}>
          {/* Category Selection */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Category *</label>
            <div className={styles.categoryGrid}>
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  className={`${styles.categoryButton} ${category === cat.value ? styles.selectedCategory : ''}`}
                  onClick={() => setCategory(cat.value)}
                  disabled={isSubmitting}
                >
                  <div className={styles.categoryIcon}>{cat.label.split(' ')[0]}</div>
                  <div className={styles.categoryContent}>
                    <div className={styles.categoryLabel}>{cat.label.split(' ').slice(1).join(' ')}</div>
                    <div className={styles.categoryDescription}>{cat.description}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Your Feedback *</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell us what you think, report an issue, or suggest improvements..."
              className={styles.formTextarea}
              rows={5}
              disabled={isSubmitting}
              maxLength={1000}
            />
            <div className={styles.charCount}>
              {description.length}/1000 characters
            </div>
          </div>

          {/* Email (Optional) */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Email (Optional)</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.email@example.com"
              className={styles.formInput}
              disabled={isSubmitting}
            />
            <div className={styles.formHelp}>
              We'll only use this to follow up on your feedback if needed
            </div>
          </div>

          {/* Submit Message */}
          {submitMessage && (
            <div className={`${styles.submitMessage} ${submitMessage.includes('Thank you') ? styles.success : styles.error}`}>
              {submitMessage}
            </div>
          )}

          {/* Form Actions */}
          <div className={styles.formActions}>
            <button
              type="button"
              onClick={handleClose}
              className={`${styles.button} ${styles.secondaryButton}`}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`${styles.button} ${styles.mainButton}`}
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