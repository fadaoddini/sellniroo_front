'use client'

import Link from 'next/link'
import { Home, ArrowRight } from 'lucide-react'
import styles from './ModuleNotFound.module.css'

/** ظاهر شبیه خطای ۴۰۴ — بدون اشاره به وضعیت ماژول‌ها */
export default function ModuleNotFound({
  title = 'صفحه یافت نشد',
  description = 'صفحه‌ای که دنبال آن هستید وجود ندارد یا منتقل شده است.',
  code = '404',
}) {
  return (
    <div className={styles.page} dir="rtl" role="alert">
      <div className={styles.card}>
        <p className={styles.code} aria-hidden>
          {code}
        </p>
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.text}>{description}</p>
        <div className={styles.actions}>
          <Link href="/" className={styles.btnPrimary}>
            <Home size={16} />
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
            <ArrowRight size={16} />
            صفحه قبل
          </button>
        </div>
      </div>
    </div>
  )
}
