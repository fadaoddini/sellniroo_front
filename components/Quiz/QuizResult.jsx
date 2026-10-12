'use client'

import { useState } from 'react'
import styles from './QuizResult.module.css'
import {
  Trophy,
  Medal,
  Crown,
  TrendingUp,
  Target,
  RefreshCw,
  Home,
  Share2,
  Send,
  MessageCircle,
  Linkedin,
  Award,
} from 'lucide-react'

export default function QuizResult({
  answers,
  score,
  totalQuestions,
  onReset,
  specialty,
  specialtyMeta,
  submitResult,
  submitting,
  onSubmitGuestName,
  isAuthenticated,
  leaderboard = [],
  showLeaderboard = true,
}) {
  const [guestName, setGuestName] = useState('')
  const result = submitResult?.result
  const correctCount =
    result?.correct_count ?? answers.filter((a) => a.isCorrect).length
  const wrongCount = answers.filter(
    (a) => !a.isCorrect && a.answer !== 'زمان تمام شد'
  ).length
  const timedOutCount = answers.filter(
    (a) => a.answer === 'زمان تمام شد'
  ).length
  const percentage =
    result?.percentage ??
    (totalQuestions
      ? Math.round((correctCount / totalQuestions) * 100)
      : 0)
  const finalScore = result?.score ?? score
  const specialtyName =
    specialtyMeta?.name_fa || result?.specialty_name || specialty || ''

  const getRank = () => {
    if (percentage >= 90)
      return {
        title: 'استاد فروش',
        icon: Crown,
        badgeColor: 'gold',
        description:
          'شما یک استاد واقعی فروش هستید! دانش شما در سطح بالایی قرار دارد.',
      }
    if (percentage >= 75)
      return {
        title: 'فروشنده حرفه‌ای',
        icon: Trophy,
        badgeColor: 'silver',
        description: 'شما یک فروشنده حرفه‌ای هستید. دانش بسیار خوبی دارید!',
      }
    if (percentage >= 60)
      return {
        title: 'کارشناس فروش',
        icon: Medal,
        badgeColor: 'bronze',
        description:
          'شما در مسیر درستی هستید. با تمرین بیشتر به سطح بالاتر می‌رسید.',
      }
    if (percentage >= 40)
      return {
        title: 'فروشنده در حال رشد',
        icon: TrendingUp,
        badgeColor: 'blue',
        description:
          'شما پایه‌های خوبی دارید. مطالعه و تمرین بیشتری توصیه می‌شود.',
      }
    return {
      title: 'تازه‌کار فروش',
      icon: Target,
      badgeColor: 'gray',
      description:
        'هر فروشنده حرفه‌ای روزی تازه‌کار بوده. با تمرین و مطالعه به هدف خود می‌رسید.',
    }
  }

  const rank = getRank()
  const circumference = 2 * Math.PI * 47
  const offset = circumference - (percentage / 100) * circumference

  const getCircleClass = () => {
    if (percentage >= 75) return ''
    if (percentage >= 50) return styles.warning
    if (percentage >= 30) return styles.danger
    return styles.heartbeat
  }

  const shareText = encodeURIComponent(
    `من در آزمون تخصصی ${specialtyName} سلنیرو ${percentage}% شدم! تو هم امتحان کن: https://sellniroo.com/quiz`
  )

  const shareLinks = [
    {
      name: 'تلگرام',
      icon: Send,
      className: styles.telegram,
      link: `https://t.me/share/url?url=${shareText}`,
    },
    {
      name: 'واتساپ',
      icon: MessageCircle,
      className: styles.whatsapp,
      link: `https://wa.me/?text=${shareText}`,
    },
    {
      name: 'لینکدین',
      icon: Linkedin,
      className: styles.linkedin,
      link: `https://linkedin.com/sharing/share-offsite/?url=https://sellniroo.com/quiz`,
    },
  ]

  const needsGuestName =
    !isAuthenticated && !result && !submitting && typeof onSubmitGuestName === 'function'

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.headerRow}>
          <div className={styles.scoreSection}>
            <div className={styles.scoreCircleWrapper}>
              <svg
                className={styles.scoreCircleSvg}
                viewBox="0 0 100 100"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle
                  className={styles.scoreCircleBg}
                  cx="50"
                  cy="50"
                  r="47"
                />
                <circle
                  className={`${styles.scoreCircleProgress} ${getCircleClass()}`}
                  cx="50"
                  cy="50"
                  r="47"
                  strokeDasharray={circumference}
                  strokeDashoffset={offset}
                />
              </svg>
              <div className={styles.scoreCircleCenter}>
                <span className={styles.scoreNumber}>{percentage}</span>
                <span className={styles.scoreFraction}>درصد</span>
              </div>
            </div>
          </div>

          <div className={styles.rankSection}>
            <div className={`${styles.rankTitle} ${styles[rank.badgeColor]}`}>
              {rank.title}
            </div>
            <p className={styles.subtitleText}>
              شما در حوزه <strong>{specialtyName}</strong>، {correctCount} از{' '}
              {totalQuestions} سوال را درست پاسخ دادید
            </p>
            <p className={styles.descriptionText}>{rank.description}</p>
            {submitResult?.rank ? (
              <p className={styles.descriptionText}>
                رتبه شما در جدول برترها: <strong>#{submitResult.rank}</strong>
              </p>
            ) : null}
            {submitting ? (
              <p className={styles.descriptionText}>در حال ثبت امتیاز...</p>
            ) : null}
            {submitResult?.error ? (
              <p className={styles.descriptionText}>{submitResult.error}</p>
            ) : null}
          </div>
        </div>

        {needsGuestName ? (
          <form
            className={styles.guestForm}
            onSubmit={(e) => {
              e.preventDefault()
              onSubmitGuestName(guestName)
            }}
          >
            <label htmlFor="quiz-guest-name">نام شما برای جدول برترها</label>
            <div className={styles.guestRow}>
              <input
                id="quiz-guest-name"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="مثلاً علی محمدی"
                maxLength={80}
              />
              <button type="submit" className={styles.buttonPrimary} disabled={!guestName.trim()}>
                ثبت امتیاز
              </button>
            </div>
          </form>
        ) : null}

        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <span className={`${styles.statValue} ${styles.green}`}>
              {correctCount}
            </span>
            <span className={styles.statLabel}>پاسخ صحیح</span>
          </div>
          <div className={styles.statCard}>
            <span className={`${styles.statValue} ${styles.red}`}>
              {wrongCount}
            </span>
            <span className={styles.statLabel}>پاسخ اشتباه</span>
          </div>
          <div className={styles.statCard}>
            <span className={`${styles.statValue} ${styles.orange}`}>
              {timedOutCount}
            </span>
            <span className={styles.statLabel}>زمان تمام شد</span>
          </div>
          <div className={styles.statCard}>
            <span className={`${styles.statValue} ${styles.purple}`}>
              {finalScore}
            </span>
            <span className={styles.statLabel}>امتیاز کل</span>
          </div>
        </div>

        {showLeaderboard && leaderboard.length > 0 ? (
          <div className={styles.leaderboardBox}>
            <h3 className={styles.leaderboardTitle}>
              <Trophy size={16} />
              نفرات برتر این حوزه
            </h3>
            <ol className={styles.leaderboardList}>
              {leaderboard.slice(0, 10).map((row, index) => {
                const RankIcon =
                  index === 0 ? Trophy : index === 1 ? Medal : Award
                return (
                  <li key={row.id} className={styles.leaderboardItem}>
                    <span className={styles.leaderboardRank}>
                      <RankIcon size={13} />
                      {index + 1}
                    </span>
                    <span className={styles.leaderboardName}>
                      {row.display_name}
                    </span>
                    <span className={styles.leaderboardScore}>
                      {row.percentage}% · {row.score}
                    </span>
                  </li>
                )
              })}
            </ol>
          </div>
        ) : null}

        <div className={styles.actionButtons}>
          <button onClick={onReset} className={styles.buttonPrimary} type="button">
            <RefreshCw size={18} />
            آزمون مجدد
          </button>
          <button
            onClick={() => (window.location.href = '/')}
            className={styles.buttonSecondary}
            type="button"
          >
            <Home size={18} />
            صفحه اصلی
          </button>
        </div>

        <div className={styles.shareSection}>
          <p className={styles.shareTitle}>
            <Share2 size={14} />
            نتیجه خود را با دوستان به اشتراک بگذارید
          </p>
          <div className={styles.shareButtons}>
            {shareLinks.map((social) => {
              const Icon = social.icon
              return (
                <a
                  key={social.name}
                  href={social.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${styles.shareButton} ${social.className}`}
                >
                  <Icon size={16} className={styles.shareIcon} />
                  {social.name}
                </a>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
