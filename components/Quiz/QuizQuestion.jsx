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
  timePerQuestion = TOTAL_TIME,
}) {
  const [selectedOption, setSelectedOption] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [isAnswering, setIsAnswering] = useState(false);
  const correctAnswer = question.correct_answer || question.correctAnswer;
  const options = Array.isArray(question.options) ? question.options : [];

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
  const totalTime = Math.max(1, Number(timePerQuestion) || TOTAL_TIME);
  const timeLeft = Math.max(0, Number(timeRemaining) || 0);
  // درصد زمان باقی‌مانده برای حاشیه دایره‌ای (از پر به خالی)
  const timeProgressPct = Math.min(100, Math.max(0, (timeLeft / totalTime) * 100));
  // درصد پیشرفت سوالات
  const questionProgressPct =
    totalQuestions > 0
      ? Math.min(100, ((currentIndex + 1) / totalQuestions) * 100)
      : 0;

  const getCardClasses = () => {
    let classes = styles.cardQuestion;
    if (timerStatus === 'warning') classes += ` ${styles.warning}`;
    if (timerStatus === 'danger') classes += ` ${styles.danger}`;
    if (timerStatus === 'heartbeat') classes += ` ${styles.heartbeat}`;
    return classes;
  };

  const formatTime = (seconds) =>
    Math.max(0, Math.floor(Number(seconds) || 0))
      .toString()
      .padStart(2, '0');

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
    if (option === correctAnswer) return styles.optionButtonCorrect;
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

  const letters = ['الف', 'ب', 'ج', 'د'];

  return (
    <div className={styles.container}>
      <div
        className={getCardClasses()}
        style={{ '--progress': `${timeProgressPct}%` }}
      >
        <div className={styles.questionContent}>
          {/* ============ Header ============ */}
          <div className={styles.questionHeader}>
            <span className={styles.questionCounter}>
              سوال {currentIndex + 1} از {totalQuestions}
            </span>
            <div
              className={`${styles.timer} ${getTimerClass()}`}
              aria-label={`زمان باقی‌مانده ${formatTime(timeLeft)} ثانیه`}
            >
              <span
                className={styles.timerRing}
                style={{ '--progress': `${timeProgressPct}%` }}
                aria-hidden
              >
                <span className={styles.timerRingInner}>
                  <span className={`${styles.timerText} ${getTimerTextClass()}`}>
                    {formatTime(timeLeft)}
                  </span>
                </span>
              </span>
              <span className={styles.timerTotal}>
                از {formatTime(totalTime)}
              </span>
            </div>
          </div>

          {/* ============ نوار زمان ============ */}
          <div className={styles.timeTrack} aria-hidden>
            <div
              className={`${styles.timeFill} ${
                timerStatus === 'warning'
                  ? styles.timeFillWarn
                  : timerStatus === 'danger' || timerStatus === 'heartbeat'
                    ? styles.timeFillDanger
                    : styles.timeFillOk
              }`}
              style={{ width: `${timeProgressPct}%` }}
            />
          </div>

          {/* ============ پیشرفت سوالات ============ */}
          <div className={styles.progressBar} aria-label="پیشرفت سوالات">
            <div
              className={styles.progressFill}
              style={{ width: `${questionProgressPct}%` }}
            />
          </div>

          {/* ============ Category ============ */}
          <div className={styles.category}>{question.category}</div>

          {/* ============ Question Text ============ */}
          <h2 className={styles.questionText}>{question.text}</h2>

          {/* ============ Options ============ */}
          <div className={styles.options}>
            {options.map((option, index) => (
              <button
                key={`${question.id}-${option}-${index}`}
                onClick={() => handleOptionClick(option)}
                disabled={showResult || isAnswering}
                className={`${styles.optionButton} ${getOptionClass(option)}`}
                type="button"
              >
                <span className={styles.optionLetter}>{letters[index]}</span>
                <span className={styles.optionText}>{option}</span>
                {showResult && option === correctAnswer && (
                  <span className={`${styles.optionIcon} ${styles.optionIconCorrect}`}>
                    ✓
                  </span>
                )}
                {showResult &&
                  selectedOption === option &&
                  option !== correctAnswer && (
                    <span className={`${styles.optionIcon} ${styles.optionIconWrong}`}>
                      ✗
                    </span>
                  )}
              </button>
            ))}
          </div>

          {/* ============ Footer ============ */}
          <div className={styles.questionFooter}>
            <span>امتیاز: {question.points || 1} نمره</span>
            <span>
              زمان: {formatTime(timeLeft)} از {formatTime(totalTime)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}