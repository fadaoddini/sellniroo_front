'use client'

import { useState } from 'react'
import styles from './Quiz.module.css'
import { specialtyIconMap } from './specialties'
import { Trophy, Medal, Award } from 'lucide-react'

export default function QuizIntro({
  onStart,
  starting = false,
  settings,
  specialties = [],
  leaderboard = [],
  error,
}) {
  const [selectedSpecialty, setSelectedSpecialty] = useState(null)

  const handleStart = () => {
    if (!selectedSpecialty || starting) return
    onStart(selectedSpecialty)
  }

  const title = settings?.title_fa || 'آزمون تخصصی فروش و بازاریابی'
  const subtitle =
    settings?.subtitle_fa ||
    'حوزه تخصصی خود را انتخاب کنید و مهارت‌های خود را بسنجید'
  const qCount = settings?.questions_per_session || 10
  const timeSec = settings?.time_per_question || 20
  const showBoard = settings?.show_leaderboard !== false

  return (
    <div className={styles.container}>
      <div className={`${styles.card} ${styles.cardWide}`}>
        <div className={styles.header}>
          <div className={styles.badge}>سلنیرو</div>
          <h1 className={styles.title}>{title}</h1>
          <p className={styles.subtitle}>{subtitle}</p>
        </div>

        {error ? <p className={styles.emptyState}>{error}</p> : null}

        <div className={styles.specialtyGrid}>
          {specialties.map((specialty) => {
            const Icon = specialtyIconMap[specialty.key]
            const isActive = selectedSpecialty === specialty.key
            return (
              <button
                key={specialty.key}
                className={`${styles.specialtyButton} ${
                  isActive ? styles.specialtyButtonActive : ''
                }`}
                onClick={() => setSelectedSpecialty(specialty.key)}
                aria-pressed={isActive}
                aria-label={specialty.name_fa}
                type="button"
              >
                {Icon ? (
                  <Icon size={26} className={styles.specialtyIcon} />
                ) : (
                  <span className={styles.specialtyIcon} aria-hidden>
                    {specialty.icon || '📝'}
                  </span>
                )}
                <span className={styles.specialtyName}>{specialty.name_fa}</span>
              </button>
            )
          })}
        </div>

        {!specialties.length ? (
          <p className={styles.emptyState}>حوزه فعالی برای آزمون تعریف نشده است.</p>
        ) : null}

        <button
          onClick={handleStart}
          disabled={starting || !selectedSpecialty}
          className={styles.buttonPrimary}
          type="button"
        >
          {starting
            ? 'در حال آماده‌سازی سوالات...'
            : selectedSpecialty
              ? 'شروع آزمون'
              : 'لطفاً یک حوزه تخصصی انتخاب کنید'}
        </button>

        <p className={styles.footerText}>
          هر آزمون {qCount} سوال رندم • گزینه‌ها جابه‌جا می‌شوند • هر سوال{' '}
          {timeSec} ثانیه
        </p>

        {showBoard && leaderboard.length > 0 ? (
          <div className={styles.leaderboardBox}>
            <h2 className={styles.leaderboardTitle}>
              <Trophy size={18} />
              نفرات برتر
            </h2>
            <ol className={styles.leaderboardList}>
              {leaderboard.slice(0, 10).map((row, index) => {
                const RankIcon =
                  index === 0 ? Trophy : index === 1 ? Medal : Award
                return (
                  <li key={row.id} className={styles.leaderboardItem}>
                    <span className={styles.leaderboardRank}>
                      <RankIcon size={14} />
                      {index + 1}
                    </span>
                    <span className={styles.leaderboardName}>
                      {row.display_name}
                      {row.specialty_name ? (
                        <small> — {row.specialty_name}</small>
                      ) : null}
                    </span>
                    <span className={styles.leaderboardScore}>
                      {row.percentage}% · {row.score} امتیاز
                    </span>
                  </li>
                )
              })}
            </ol>
          </div>
        ) : null}
      </div>
    </div>
  )
}
