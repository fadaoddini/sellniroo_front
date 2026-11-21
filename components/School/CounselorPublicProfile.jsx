'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { HeartHandshake } from 'lucide-react'
import schoolService from '@/components/School/services/schoolService'
import styles from './School.module.css'

export default function CounselorPublicProfile({ slug }) {
  const [data, setData] = useState(null)
  const [err, setErr] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const res = await schoolService.getPublicCounselorProfile(slug)
      if (cancelled) return
      setLoading(false)
      if (!res.success) {
        setErr(res.error || 'یافت نشد')
        return
      }
      setData(res.data)
    })()
    return () => { cancelled = true }
  }, [slug])

  if (loading) {
    return (
      <div className={styles.page} dir="rtl">
        <div className={styles.wrap}><p className={styles.empty}>بارگذاری…</p></div>
      </div>
    )
  }

  if (err || !data) {
    return (
      <div className={styles.page} dir="rtl">
        <div className={styles.wrap}>
          <div className={styles.panel}>
            <p className={styles.empty}>{err || 'یافت نشد'}</p>
            <Link href="/profile" className={styles.btnGhost}>بازگشت</Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`${styles.page} ${styles.tppPage}`} dir="rtl">
      <div className={styles.wrap}>
        <header className={styles.tppHero}>
          <div className={styles.tppHeroInner}>
            <div className={styles.tppAvatarWrap}>
              {data.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={data.avatar_url} alt="" className={styles.tppAvatar} />
              ) : (
                <div className={styles.tppAvatarFallback}><HeartHandshake size={36} /></div>
              )}
            </div>
            <div className={styles.tppHeroText}>
              <p className={styles.tppEyebrow}>مشاور مدرسه</p>
              <h1 className={styles.tppName}>{data.display_name}</h1>
              {data.specialty ? <p className={styles.tppSpecialty}>{data.specialty}</p> : null}
              {data.years_experience ? (
                <p className={styles.tppBio}>{data.years_experience} سال سابقه{data.license_no ? ` · پروانه ${data.license_no}` : ''}</p>
              ) : null}
              {data.bio ? <p className={styles.tppBio}>{data.bio}</p> : null}
            </div>
          </div>
        </header>

        {data.bio_html ? (
          <section className={styles.tppSection}>
            <h2 className={styles.tppSectionTitle}>درباره مشاور</h2>
            <div className={styles.tppHtml} dangerouslySetInnerHTML={{ __html: data.bio_html }} />
          </section>
        ) : null}

        <nav className={styles.tppFooter}>
          <Link href="/profile">پروفایل مدرسه</Link>
        </nav>
      </div>
    </div>
  )
}
