// components/Quiz/Quiz.jsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import QuizIntro from './QuizIntro';
import QuizQuestion from './QuizQuestion';
import QuizResult from './QuizResult';
import { specialtyQuestions } from './quizData';

export default function Quiz() {
  const [currentStep, setCurrentStep] = useState('intro');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [timeRemaining, setTimeRemaining] = useState(20); // 20 ثانیه برای هر سوال
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [score, setScore] = useState(0);
  const [selectedSpecialty, setSelectedSpecialty] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [questionTimer, setQuestionTimer] = useState(20);

  const totalQuestions = questions.length;

  // تایمر برای هر سوال
  useEffect(() => {
    let timer;
    if (isTimerActive && timeRemaining > 0) {
      timer = setInterval(() => {
        setTimeRemaining(prev => {
          const newTime = prev - 1;
          setQuestionTimer(newTime);
          return newTime;
        });
      }, 1000);
    } else if (timeRemaining === 0 && isTimerActive) {
      // زمان تمام شد - پاسخ اشتباه محسوب می‌شود
      handleTimeOut();
    }
    return () => clearInterval(timer);
  }, [isTimerActive, timeRemaining]);

  const startQuiz = (specialtyId) => {
    const specialtyQuestionsList = specialtyQuestions[specialtyId] || [];
    setQuestions(specialtyQuestionsList);
    setSelectedSpecialty(specialtyId);
    setCurrentStep('playing');
    setIsTimerActive(true);
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setScore(0);
    setTimeRemaining(20);
    setQuestionTimer(20);
  };

  const handleTimeOut = () => {
    // زمان تمام شد - ثبت پاسخ اشتباه
    const currentQuestion = questions[currentQuestionIndex];
    setAnswers(prev => [...prev, { 
      questionId: currentQuestion.id, 
      answer: 'زمان تمام شد', 
      isCorrect: false,
      points: 0 
    }]);

    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setTimeRemaining(20);
      setQuestionTimer(20);
    } else {
      handleFinish();
    }
  };

  const handleAnswer = (answer) => {
    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = currentQuestion.correctAnswer === answer;
    
    setAnswers(prev => [...prev, { 
      questionId: currentQuestion.id, 
      answer, 
      isCorrect,
      points: isCorrect ? currentQuestion.points || 1 : 0 
    }]);

    if (isCorrect) {
      setScore(prev => prev + (currentQuestion.points || 1));
    }

    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setTimeRemaining(20);
      setQuestionTimer(20);
    } else {
      handleFinish();
    }
  };

  const handleFinish = useCallback(() => {
    setIsTimerActive(false);
    setCurrentStep('result');
  }, []);

  const resetQuiz = () => {
    setCurrentStep('intro');
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setTimeRemaining(20);
    setQuestionTimer(20);
    setScore(0);
    setIsTimerActive(false);
    setSelectedSpecialty(null);
    setQuestions([]);
  };

  if (currentStep === 'intro') {
    return <QuizIntro onStart={startQuiz} totalQuestions={totalQuestions} />;
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
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
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
      questionTimer={questionTimer}
      onTimeOut={handleTimeOut}
    />
  );
}