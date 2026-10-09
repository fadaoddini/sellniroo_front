// components/Quiz/QuizQuestion.jsx
'use client';

import { useState, useEffect } from 'react';
import styles from './Quiz.module.css';

const TOTAL_TIME = 20;

export default function QuizQuestion({
  question,
  currentIndex,
  totalQuestions,
  onAnswer,
  timeRemaining,
}) {
  const [selectedOption, setSelectedOption] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [isAnswering, setIsAnswering] = useState(false);

  /* ============================================
     ریست state هنگام تغییر سوال
     ============================================ */
  useEffect(() => {
    setSelectedOption(null);
    setShowResult(false);
    setIsAnswering(false);
  }, [question.id]);

  /* ============================================
     محاسبه وضعیت تایمر
     ============================================ */
  const getTimerStatus = () => {
    if (timeRemaining <= 3) return 'heartbeat';
    if (timeRemaining <= 5) return 'danger';
    if (timeRemaining <= 10) return 'warning';
    return 'normal';
  };

  const timerStatus = getTimerStatus();

  const getCardClasses = () => {
    let classes = styles.cardQuestion;
    if (timerStatus === 'warning') classes += ` ${styles.warning}`;
    if (timerStatus === 'danger') classes += ` ${styles.danger}`;
    if (timerStatus === 'heartbeat') classes += ` ${styles.heartbeat}`;
    return classes;
  };

  const formatTime = (seconds) =>
    seconds.toString().padStart(2, '0');

  /* ============================================
     کلیک روی گزینه
     ============================================ */
  const handleOptionClick = (option) => {
    if (showResult || isAnswering) return;

    setIsAnswering(true);
    setSelectedOption(option);
    setShowResult(true);

    setTimeout(() => {
      onAnswer(option);
    }, 600);
  };

  /* ============================================
     کلاس گزینه‌ها
     ============================================ */
  const getOptionClass = (option) => {
    if (!showResult) {
      return selectedOption === option
        ? styles.optionButtonSelected
        : '';
    }
    if (option === question.correctAnswer) return styles.optionButtonCorrect;
    if (selectedOption === option) return styles.optionButtonWrong;
    return styles.optionButtonDisabled;
  };

  const getTimerClass = () => {
    if (timerStatus === 'heartbeat' || timerStatus === 'danger')
      return styles.timerDanger;
    if (timerStatus === 'warning') return styles.timerWarning;
    return '';
  };

  const getTimerTextClass = () => {
    if (timerStatus === 'heartbeat' || timerStatus === 'danger')
      return styles.timerTextRed;
    if (timerStatus === 'warning') return styles.timerTextOrange;
    return styles.timerTextGreen;
  };

  const getProgressColor = () => {
    if (timerStatus === 'heartbeat' || timerStatus === 'danger')
      return 'linear-gradient(90deg, #ff3b30, #ff6b6b)';
    if (timerStatus === 'warning')
      return 'linear-gradient(90deg, #ff9500, #ffb347)';
    return 'linear-gradient(90deg, #0e8f59, #2da170)';
  };

  const letters = ['الف', 'ب', 'ج', 'د'];

  return (
    <div className={styles.container}>
      <div className={getCardClasses()}>
        <div className={styles.questionContent}>
          {/* ============ Header ============ */}
          <div className={styles.questionHeader}>
            <span className={styles.questionCounter}>
              سوال {currentIndex + 1} از {totalQuestions}
            </span>
            <div className={`${styles.timer} ${getTimerClass()}`}>
              <span className={styles.timerIcon}>⏱️</span>
              <span className={`${styles.timerText} ${getTimerTextClass()}`}>
                {formatTime(timeRemaining)}
              </span>
              <span className={styles.timerTotal}>
                / {formatTime(TOTAL_TIME)}
              </span>
            </div>
          </div>

          {/* ============ Progress Bar ============ */}
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{
                width: `${((currentIndex + 1) / totalQuestions) * 100}%`,
                background: getProgressColor(),
              }}
            />
          </div>

          {/* ============ Category ============ */}
          <div className={styles.category}>{question.category}</div>

          {/* ============ Question Text ============ */}
          <h2 className={styles.questionText}>{question.text}</h2>

          {/* ============ Options ============ */}
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
                  <span className={`${styles.optionIcon} ${styles.optionIconCorrect}`}>
                    ✓
                  </span>
                )}
                {showResult &&
                  selectedOption === option &&
                  option !== question.correctAnswer && (
                    <span className={`${styles.optionIcon} ${styles.optionIconWrong}`}>
                      ✗
                    </span>
                  )}
              </button>
            ))}
          </div>

          {/* ============ Footer ============ */}
          <div className={styles.questionFooter}>
            <span>⭐ امتیاز: {question.points || 1} نمره</span>
            <span>⏱️ {formatTime(timeRemaining)} ثانیه باقیمانده</span>
          </div>
        </div>
      </div>
    </div>
  );
}