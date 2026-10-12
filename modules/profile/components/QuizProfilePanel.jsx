'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Trophy,
  Medal,
  Target,
  RefreshCw,
  Brain,
  Award,
  Loader2,
  Sparkles,
} from 'lucide-react'
import quizService from '@/components/Quiz/services/quizService'
import styles from '../styles/QuizProfilePanel.module.css'

function rankClass(rank) {
  if (rank === 1) return styles.rankGold
  if (rank === 2) return styles.rankSilver
  if (rank === 3) return styles.rankBronze
  return styles.rankDefault
}

export default function QuizProfilePanel({ variant = 'embedded' }) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [data, setData] = useState(null)

  const load = async () => {
    setLoading(true)
    setError(null)
    const res = await quizService.getMyHistory()
    setLoading(false)
    if (!res.success) {
      setError(res.error)
      setData(null)
      return
    }
    setData(res.data)
  }

  useEffect(() => {
    load()
  }, [])

  if (loading) {
    return (
      <div className={styles.wrap} role="status">
        <Loader2 className={styles.spinner} size={28} />
        <p>در حال بارگذاری تاریخچه آزمون...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.wrap}>
        <p className={styles.error}>{error}</p>
        <button type="button" className={styles.btnGhost} onClick={load}>
          <RefreshCw size={15} />
          تلاش مجدد
        </button>
      </div>
    )
  }

  const summary = data?.summary || {}
  const best = data?.best_by_specialty || []
  const attempts = data?.attempts || []
  const hasData = (summary.total_attempts || 0) > 0

  return (
    <div
      className={`${styles.panel} ${
        variant === 'standalone' ? styles.panelStandalone : ''
      }`}
    >
      <div className={styles.hero}>
        <div className={styles.heroGlow} aria-hidden />
        <div className={styles.heroContent}>
          <div className={styles.heroText}>
            <p className={styles.heroEyebrow}>
              <Sparkles size={14} />
              کارنامه آزمون
            </p>
            <h2 className={styles.title}>
              <Brain size={22} />
              پروفایل آزمون
            </h2>
            <p className={styles.sub}>
              آزمون‌های قبلی، بهترین امتیازها و رتبه‌های شما در یک نگاه
            </p>
          </div>
          <div className={styles.headActions}>
            <button type="button" className={styles.btnGhost} onClick={load}>
              <RefreshCw size={15} />
              بروزرسانی
            </button>
            <Link href="/quiz" className={styles.btnPrimary}>
              شروع آزمون جدید
            </Link>
          </div>
        </div>
      </div>

      <div className={styles.stats}>
        <div className={styles.stat}>
          <span className={styles.statIcon}>
            <Target size={18} />
          </span>
          <strong>{summary.total_attempts || 0}</strong>
          <span>تعداد آزمون</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statIcon}>
            <Trophy size={18} />
          </span>
          <strong>{summary.best_percentage || 0}%</strong>
          <span>بهترین درصد</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statIcon}>
            <Award size={18} />
          </span>
          <strong>{summary.best_score || 0}</strong>
          <span>بهترین امتیاز</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statIcon}>
            <Medal size={18} />
          </span>
          <strong>{summary.specialties_played || 0}</strong>
          <span>حوزه شرکت‌کرده</span>
        </div>
      </div>

      {best.length > 0 ? (
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>بهترین نتیجه در هر حوزه</h3>
          <ul className={styles.list}>
            {best.map((row) => (
              <li key={row.specialty_key} className={styles.item}>
                <div className={styles.itemMain}>
                  <p className={styles.itemTitle}>{row.specialty_name}</p>
                  <p className={styles.itemMeta}>
                    {row.percentage}% · {row.score} امتیاز
                  </p>
                </div>
                <span className={`${styles.rank} ${rankClass(row.rank)}`}>
                  #{row.rank}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>تاریخچه آزمون‌ها</h3>
        {!hasData ? (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>
              <Brain size={28} />
            </div>
            <p>هنوز آزمونی ثبت نشده است.</p>
            <Link href="/quiz" className={styles.btnPrimary}>
              اولین آزمون را شروع کنید
            </Link>
          </div>
        ) : (
          <ul className={styles.list}>
            {attempts.map((row) => (
              <li key={row.id} className={styles.item}>
                <div className={styles.itemMain}>
                  <p className={styles.itemTitle}>
                    {row.specialty_name || row.specialty_key}
                  </p>
                  <p className={styles.itemMeta}>
                    {row.correct_count}/{row.total_questions} صحیح ·{' '}
                    {row.percentage}% · {row.score} امتیاز
                    {row.created_at
                      ? ` · ${new Date(row.created_at).toLocaleString('fa-IR')}`
                      : ''}
                  </p>
                </div>
                <span className={`${styles.rank} ${rankClass(row.rank)}`}>
                  #{row.rank}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
