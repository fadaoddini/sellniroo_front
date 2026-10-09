// components/Quiz/Quiz.jsx
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import QuizIntro from './QuizIntro';
import QuizQuestion from './QuizQuestion';
import QuizResult from './QuizResult';
import styles from './Quiz.module.css';
import { specialtyQuestions } from './quizData';

const TIME_PER_QUESTION = 20; // ثانیه

export default function Quiz() {
  const [currentStep, setCurrentStep] = useState('intro');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [timeRemaining, setTimeRemaining] = useState(TIME_PER_QUESTION);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [score, setScore] = useState(0);
  const [selectedSpecialty, setSelectedSpecialty] = useState(null);
  const [questions, setQuestions] = useState([]);

  // ✅ useRef برای جلوگیری از بسته شدن روی مقدار قدیمی
  const answeredRef = useRef(false);

  const totalQuestions = questions.length;

  /* ============================================
     شروع آزمون
     ============================================ */
  const startQuiz = (specialtyId) => {
    const list = specialtyQuestions[specialtyId] || [];
    setQuestions(list);
    setSelectedSpecialty(specialtyId);
    setCurrentStep('playing');
    setIsTimerActive(true);
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setScore(0);
    setTimeRemaining(TIME_PER_QUESTION);
    answeredRef.current = false;
  };

  /* ============================================
     ثبت پاسخ + رفتن به سوال بعد / پایان
     ============================================ */
  const recordAnswer = useCallback((answer, isCorrect, points = 0) => {
    const currentQuestion = questions[currentQuestionIndex];
    if (!currentQuestion) return;

    setAnswers((prev) => [
      ...prev,
      {
        questionId: currentQuestion.id,
        answer,
        isCorrect,
        points,
      },
    ]);

    if (isCorrect) {
      setScore((prev) => prev + points);
    }

    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setTimeRemaining(TIME_PER_QUESTION);
      answeredRef.current = false;
    } else {
      setIsTimerActive(false);
      setCurrentStep('result');
    }
  }, [questions, currentQuestionIndex, totalQuestions]);

  /* ============================================
     پایان زمان
     ============================================ */
  const handleTimeOut = useCallback(() => {
    if (answeredRef.current) return;
    answeredRef.current = true;
    recordAnswer('زمان تمام شد', false, 0);
  }, [recordAnswer]);

  /* ============================================
     تایمر
     ============================================ */
  useEffect(() => {
    if (!isTimerActive) return;
    if (timeRemaining <= 0) {
      handleTimeOut();
      return;
    }

    const timer = setInterval(() => {
      setTimeRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [isTimerActive, timeRemaining, handleTimeOut]);

  /* ============================================
     پاسخ کاربر
     ============================================ */
  const handleAnswer = (answer) => {
    if (answeredRef.current) return;
    answeredRef.current = true;

    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = currentQuestion.correctAnswer === answer;
    const points = isCorrect ? currentQuestion.points || 1 : 0;
    recordAnswer(answer, isCorrect, points);
  };

  /* ============================================
     ریست
     ============================================ */
  const resetQuiz = () => {
    setCurrentStep('intro');
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setTimeRemaining(TIME_PER_QUESTION);
    setScore(0);
    setIsTimerActive(false);
    setSelectedSpecialty(null);
    setQuestions([]);
    answeredRef.current = false;
  };

  /* ============================================
     رندر
     ============================================ */
  if (currentStep === 'intro') {
    return <QuizIntro onStart={startQuiz} />;
  }

  if (currentStep === 'result') {
    return (
      <QuizResult
        answers={answers}
        score={score}
        totalQuestions={totalQuestions}
        onReset={resetQuiz}
        specialty={selectedSpecialty}
      />
    );
  }

  if (totalQuestions === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <p className={styles.emptyState}>
            خطا در بارگذاری سوالات. لطفاً مجدداً تلاش کنید.
          </p>
          <button onClick={resetQuiz} className={styles.buttonPrimary}>
            بازگشت
          </button>
        </div>
      </div>
    );
  }

  return (
    <QuizQuestion
      question={questions[currentQuestionIndex]}
      currentIndex={currentQuestionIndex}
      totalQuestions={totalQuestions}
      onAnswer={handleAnswer}
      timeRemaining={timeRemaining}
    />
  );
}