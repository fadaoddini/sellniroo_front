// components/Quiz/QuizQuestion.jsx
'use client';

import { useState, useEffect, useRef } from 'react';
import styles from './Quiz.module.css';

export default function QuizQuestion({ 
  question, 
  currentIndex, 
  totalQuestions, 
  onAnswer,
  timeRemaining,
  questionTimer,
  onTimeOut
}) {
  const [selectedOption, setSelectedOption] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [isAnswering, setIsAnswering] = useState(false);
  const cardRef = useRef(null);

  const totalTime = 20;
  const progress = ((totalTime - timeRemaining) / totalTime) * 100;

  // تنظیم متغیر CSS برای progress
  useEffect(() => {
    if (cardRef.current) {
      cardRef.current.style.setProperty('--progress', `${progress}%`);
    }
  }, [progress]);

  // تشخیص وضعیت تایمر
  const getTimerStatus = () => {
    if (timeRemaining <= 3) return 'heartbeat';
    if (timeRemaining <= 5) return 'danger';
    if (timeRemaining <= 10) return 'warning';
    return 'normal';
  };

  const timerStatus = getTimerStatus();

  // تنظیم کلاس‌های کارت
  const getCardClasses = () => {
    let classes = styles.cardQuestion;
    if (timerStatus === 'warning') classes += ` ${styles.warning}`;
    if (timerStatus === 'danger') classes += ` ${styles.danger}`;
    if (timerStatus === 'heartbeat') classes += ` ${styles.heartbeat}`;
    return classes;
  };

  const formatTime = (seconds) => {
    return seconds.toString().padStart(2, '0');
  };

  const handleOptionClick = (option) => {
    if (showResult || isAnswering) return;
    
    setIsAnswering(true);
    setSelectedOption(option);
    setShowResult(true);

    setTimeout(() => {
      onAnswer(option);
      setSelectedOption(null);
      setShowResult(false);
      setIsAnswering(false);
    }, 500);
  };

  const getOptionClass = (option) => {
    if (!showResult) {
      return selectedOption === option ? styles.optionButtonSelected : '';
    }

    if (option === question.correctAnswer) {
      return styles.optionButtonCorrect;
    }

    if (selectedOption === option && option !== question.correctAnswer) {
      return styles.optionButtonWrong;
    }

    return styles.optionButtonDisabled;
  };

  const getTimerClass = () => {
    if (timerStatus === 'heartbeat' || timerStatus === 'danger') return styles.timerDanger;
    if (timerStatus === 'warning') return styles.timerWarning;
    return '';
  };

  const getTimerTextClass = () => {
    if (timerStatus === 'heartbeat' || timerStatus === 'danger') return styles.timerTextRed;
    if (timerStatus === 'warning') return styles.timerTextOrange;
    return styles.timerTextGreen;
  };

  const letters = ['الف', 'ب', 'ج', 'د'];

  return (
    <div className={styles.container}>
      <div 
        ref={cardRef}
        className={getCardClasses()}
      >
        <div className={styles.questionContent}>
          <div className={styles.questionHeader}>
            <span className={styles.questionCounter}>
              سوال {currentIndex + 1} از {totalQuestions}
            </span>
            <div className={`${styles.timer} ${getTimerClass()}`}>
              <span className={styles.timerIcon}>⏱️</span>
              <span className={`${styles.timerText} ${getTimerTextClass()}`}>
                {formatTime(timeRemaining)}
              </span>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                / {formatTime(totalTime)}
              </span>
            </div>
          </div>

          <div className={styles.progressBar}>
            <div 
              className={styles.progressFill}
              style={{ 
                width: `${((currentIndex + 1) / totalQuestions) * 100}%`,
                background: timerStatus === 'heartbeat' || timerStatus === 'danger'
                  ? 'linear-gradient(90deg, #ff3b30, #ff6b6b)' 
                  : timerStatus === 'warning'
                  ? 'linear-gradient(90deg, #ff9500, #ffb347)'
                  : 'linear-gradient(90deg, #800020, #a8324a)'
              }}
            />
          </div>

          <div className={styles.category}>{question.category}</div>

          <h2 className={styles.questionText}>{question.text}</h2>

          <div className={styles.options}>
            {question.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleOptionClick(option)}
                disabled={showResult || isAnswering}
                className={`${styles.optionButton} ${getOptionClass(option)}`}
              >
                <span className={styles.optionLetter}>{letters[index]}</span>
                <span className={styles.optionText}>{option}</span>
                {showResult && option === question.correctAnswer && (
                  <span className={`${styles.optionIcon} ${styles.optionIconCorrect}`}>✓</span>
                )}
                {showResult && selectedOption === option && option !== question.correctAnswer && (
                  <span className={`${styles.optionIcon} ${styles.optionIconWrong}`}>✗</span>
                )}
              </button>
            ))}
          </div>

          <div className={styles.questionFooter}>
            <span>⭐ امتیاز: {question.points || 1} نمره</span>
            <span>⏱️ {formatTime(timeRemaining)} ثانیه باقیمانده</span>
          </div>
        </div>
      </div>
    </div>
  );
}