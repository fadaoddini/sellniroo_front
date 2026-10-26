'use client'

import Link from 'next/link'
import { Home, ArrowRight, Briefcase, Newspaper } from 'lucide-react'
import styles from './NotFoundView.module.css'

/**
 * صفحه ۴۰۴ سفارشی — برای notFound() و ModuleGate
 */
export default function NotFoundView({
  title = 'صفحه پیدا نشد',
  description = 'آدرسی که وارد کرده‌اید وجود ندارد، منتقل شده یا دیگر در دسترس نیست.',
  code = '404',
  showHints = true,
}) {
  return (
    <div className={styles.page} dir="rtl" role="alert" aria-live="polite">
      <div className={`${styles.glow} ${styles.glowA}`} aria-hidden />
      <div className={`${styles.glow} ${styles.glowB}`} aria-hidden />
      <div className={styles.grid} aria-hidden />

      <div className={styles.inner}>
        <Link href="/" className={styles.brand}>
          <span className={styles.brandMark} aria-hidden />
          <span className={styles.brandName}>سلنیرو</span>
        </Link>

        <div className={styles.codeWrap}>
          <span className={styles.codeShadow} aria-hidden />
          <p className={styles.code} aria-hidden>
            {code}
          </p>
        </div>

        <h1 className={styles.title}>{title}</h1>
        <p className={styles.text}>{description}</p>

        <div className={styles.actions}>
          <Link href="/" className={styles.btnPrimary}>
            <Home size={18} strokeWidth={2.25} />
            بازگشت به خانه
          </Link>
          <button
            type="button"
            className={styles.btnGhost}
            onClick={() => {
              if (typeof window !== 'undefined' && window.history.length > 1) {
                window.history.back()
              } else {
                window.location.href = '/'
              }
            }}
          >
            <ArrowRight size={18} strokeWidth={2.25} />
            صفحه قبل
          </button>
        </div>

        {showHints ? (
          <nav className={styles.hints} aria-label="میانبرها">
            <Link href="/jobs" className={styles.hint}>
              <Briefcase size={14} />
              آگهی‌ها
            </Link>
            <Link href="/news" className={styles.hint}>
              <Newspaper size={14} />
              اخبار
            </Link>
            <Link href="/about" className={styles.hint}>
              درباره ما
            </Link>
          </nav>
        ) : null}
      </div>
    </div>
  )
}
