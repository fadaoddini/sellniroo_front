'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import QuizIntro from './QuizIntro'
import QuizQuestion from './QuizQuestion'
import QuizResult from './QuizResult'
import styles from './Quiz.module.css'
import quizService from './services/quizService'
import { useAuth } from '@/contexts/AuthContext'

const DEFAULT_TIME = 20

export default function Quiz() {
  const { user, isAuthenticated } = useAuth()
  const [currentStep, setCurrentStep] = useState('intro')
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState([])
  const [timeRemaining, setTimeRemaining] = useState(DEFAULT_TIME)
  const [isTimerActive, setIsTimerActive] = useState(false)
  const [score, setScore] = useState(0)
  const [selectedSpecialty, setSelectedSpecialty] = useState(null)
  const [specialtyMeta, setSpecialtyMeta] = useState(null)
  const [questions, setQuestions] = useState([])
  const [questionIds, setQuestionIds] = useState([])
  const [timePerQuestion, setTimePerQuestion] = useState(DEFAULT_TIME)
  const [bundle, setBundle] = useState(null)
  const [loadingBundle, setLoadingBundle] = useState(true)
  const [starting, setStarting] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitResult, setSubmitResult] = useState(null)
  const [error, setError] = useState(null)
  const [startedAt, setStartedAt] = useState(null)

  const answeredRef = useRef(false)
  const answersRef = useRef([])
  const totalQuestions = questions.length

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoadingBundle(true)
      const res = await quizService.getBundle()
      if (cancelled) return
      if (!res.success) {
        setError(res.error)
        setLoadingBundle(false)
        return
      }
      setBundle(res.data)
      setTimePerQuestion(res.data?.settings?.time_per_question || DEFAULT_TIME)
      setLoadingBundle(false)
    })()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    answersRef.current = answers
  }, [answers])

  const startQuiz = async (specialtyKey) => {
    setStarting(true)
    setError(null)
    const res = await quizService.start(specialtyKey)
    setStarting(false)
    if (!res.success) {
      setError(res.error)
      return
    }
    const list = Array.isArray(res.data.questions) ? res.data.questions : []
    setQuestions(list)
    setQuestionIds(res.data.question_ids || list.map((q) => q.id))
    setSpecialtyMeta(res.data.specialty || null)
    setSelectedSpecialty(specialtyKey)
    setTimePerQuestion(res.data?.settings?.time_per_question || DEFAULT_TIME)
    setCurrentStep('playing')
    setIsTimerActive(true)
    setCurrentQuestionIndex(0)
    setAnswers([])
    answersRef.current = []
    setScore(0)
    setTimeRemaining(res.data?.settings?.time_per_question || DEFAULT_TIME)
    setStartedAt(Date.now())
    setSubmitResult(null)
    answeredRef.current = false
  }

  const finishAndSubmit = useCallback(
    async (finalAnswers, finalScore) => {
      setIsTimerActive(false)
      setCurrentStep('result')
      setScore(finalScore)

      // مهمان: اول نتیجه را نشان بده، بعد با نام ثبت کن
      if (!isAuthenticated) {
        setSubmitResult(null)
        return
      }

      setSubmitting(true)
      const duration = startedAt
        ? Math.max(1, Math.round((Date.now() - startedAt) / 1000))
        : null
      const displayName =
        user?.display_name || user?.first_name || user?.username || ''

      const res = await quizService.submit({
        specialty_key: selectedSpecialty,
        question_ids: questionIds,
        answers: finalAnswers.map((a) => ({
          question_id: a.questionId,
          answer: a.answer,
          timed_out: a.answer === 'زمان تمام شد',
        })),
        display_name: displayName,
        duration_seconds: duration,
      })

      setSubmitting(false)
      if (res.success) {
        setSubmitResult(res.data)
        setScore(res.data?.result?.score ?? finalScore)
        if (Array.isArray(res.data?.leaderboard)) {
          setBundle((prev) =>
            prev
              ? { ...prev, leaderboard: res.data.leaderboard }
              : prev
          )
        }
      } else {
        setSubmitResult({ error: res.error, localScore: finalScore })
      }
    },
    [
      isAuthenticated,
      questionIds,
      selectedSpecialty,
      startedAt,
      user?.display_name,
      user?.first_name,
      user?.username,
    ]
  )

  const recordAnswer = useCallback(
    (answer, isCorrect, points = 0) => {
      const currentQuestion = questions[currentQuestionIndex]
      if (!currentQuestion) return

      const entry = {
        questionId: currentQuestion.id,
        answer,
        isCorrect,
        points,
      }
      const nextAnswers = [...answersRef.current, entry]
      answersRef.current = nextAnswers
      setAnswers(nextAnswers)

      let nextScore = score
      if (isCorrect) {
        nextScore = score + points
        setScore(nextScore)
      }

      if (currentQuestionIndex < totalQuestions - 1) {
        setCurrentQuestionIndex((prev) => prev + 1)
        setTimeRemaining(timePerQuestion)
        answeredRef.current = false
      } else {
        finishAndSubmit(nextAnswers, nextScore)
      }
    },
    [
      questions,
      currentQuestionIndex,
      totalQuestions,
      score,
      timePerQuestion,
      finishAndSubmit,
    ]
  )

  const handleTimeOut = useCallback(() => {
    if (answeredRef.current) return
    answeredRef.current = true
    recordAnswer('زمان تمام شد', false, 0)
  }, [recordAnswer])

  useEffect(() => {
    if (!isTimerActive) return
    if (timeRemaining <= 0) {
      handleTimeOut()
      return
    }
    const timer = setInterval(() => {
      setTimeRemaining((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(timer)
  }, [isTimerActive, timeRemaining, handleTimeOut])

  const handleAnswer = (answer) => {
    if (answeredRef.current) return
    answeredRef.current = true
    const currentQuestion = questions[currentQuestionIndex]
    const isCorrect = currentQuestion.correct_answer === answer
    const points = isCorrect ? currentQuestion.points || 1 : 0
    recordAnswer(answer, isCorrect, points)
  }

  const resetQuiz = () => {
    setCurrentStep('intro')
    setCurrentQuestionIndex(0)
    setAnswers([])
    answersRef.current = []
    setTimeRemaining(timePerQuestion)
    setScore(0)
    setIsTimerActive(false)
    setSelectedSpecialty(null)
    setSpecialtyMeta(null)
    setQuestions([])
    setQuestionIds([])
    setSubmitResult(null)
    setError(null)
    setStartedAt(null)
    answeredRef.current = false
    quizService.getBundle().then((res) => {
      if (res.success) setBundle(res.data)
    })
  }

  const submitGuestName = async (name) => {
    if (!name?.trim()) return
    setSubmitting(true)
    const duration = startedAt
      ? Math.max(1, Math.round((Date.now() - startedAt) / 1000))
      : null
    const res = await quizService.submit({
      specialty_key: selectedSpecialty,
      question_ids: questionIds,
      answers: answersRef.current.map((a) => ({
        question_id: a.questionId,
        answer: a.answer,
        timed_out: a.answer === 'زمان تمام شد',
      })),
      display_name: name.trim(),
      duration_seconds: duration,
    })
    setSubmitting(false)
    if (res.success) {
      setSubmitResult(res.data)
      if (Array.isArray(res.data?.leaderboard)) {
        setBundle((prev) =>
          prev ? { ...prev, leaderboard: res.data.leaderboard } : prev
        )
      }
    } else {
      setSubmitResult((prev) => ({ ...prev, error: res.error }))
    }
  }

  if (loadingBundle) {
    return (
      <div className={styles.loadingContainer}>
        <div>
          <div className={styles.spinner} />
          <p className={styles.loadingText}>در حال بارگذاری آزمون...</p>
        </div>
      </div>
    )
  }

  if (currentStep === 'intro') {
    return (
      <QuizIntro
        onStart={startQuiz}
        starting={starting}
        settings={bundle?.settings}
        specialties={bundle?.specialties || []}
        leaderboard={bundle?.leaderboard || []}
        error={error}
      />
    )
  }

  if (currentStep === 'result') {
    return (
      <QuizResult
        answers={answers}
        score={score}
        totalQuestions={totalQuestions}
        onReset={resetQuiz}
        specialty={selectedSpecialty}
        specialtyMeta={specialtyMeta}
        submitResult={submitResult}
        submitting={submitting}
        onSubmitGuestName={submitGuestName}
        isAuthenticated={!!isAuthenticated}
        leaderboard={
          submitResult?.leaderboard || bundle?.leaderboard || []
        }
        showLeaderboard={bundle?.settings?.show_leaderboard !== false}
      />
    )
  }

  if (totalQuestions === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <p className={styles.emptyState}>
            {error || 'خطا در بارگذاری سوالات. لطفاً مجدداً تلاش کنید.'}
          </p>
          <button onClick={resetQuiz} className={styles.buttonPrimary}>
            بازگشت
          </button>
        </div>
      </div>
    )
  }

  return (
    <QuizQuestion
      question={questions[currentQuestionIndex]}
      currentIndex={currentQuestionIndex}
      totalQuestions={totalQuestions}
      onAnswer={handleAnswer}
      timeRemaining={timeRemaining}
      timePerQuestion={timePerQuestion}
    />
  )
}
