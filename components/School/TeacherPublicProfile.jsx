'use client'

import React, { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Award, BookOpen, GraduationCap, QrCode } from 'lucide-react'
import schoolService from '@/components/School/services/schoolService'
import {
  teacherPublicAbsoluteUrl,
  teacherQrImageUrl,
} from '@/components/School/teacherQr'
import styles from './School.module.css'

function AparatEmbed({ url }) {
  if (!url) return null
  let src = url
  try {
    const u = new URL(url)
    // aparat.com/v/XXXX → embed
    const m = u.pathname.match(/\/v\/([^/]+)/)
    if (m) src = `https://www.aparat.com/video/video/embed/videohash/${m[1]}/vt/frame`
  } catch {
    /* keep raw */
  }
  return (
    <div className={styles.tppVideo}>
      <iframe
        title="ویدیو معرفی"
        src={src}
        allowFullScreen
        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
      />
    </div>
  )
}

export default function TeacherPublicProfile({ slug }) {
  const [data, setData] = useState(null)
  const [err, setErr] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      const res = await schoolService.getPublicTeacherProfile(slug)
      if (cancelled) return
      setLoading(false)
      if (!res.success) {
        setErr(res.error || 'پروفایل یافت نشد')
        return
      }
      setData(res.data)
    })()
    return () => { cancelled = true }
  }, [slug])

  const publicUrl = useMemo(() => {
    if (!data) return ''
    return teacherPublicAbsoluteUrl(data.public_path || data.public_slug || slug)
  }, [data, slug])

  const qrSrc = useMemo(() => teacherQrImageUrl(publicUrl, 160), [publicUrl])

  if (loading) {
    return (
      <div className={styles.page} dir="rtl">
        <div className={styles.wrap}>
          <p className={styles.empty}>در حال بارگذاری…</p>
        </div>
      </div>
    )
  }

  if (err || !data) {
    return (
      <div className={styles.page} dir="rtl">
        <div className={styles.wrap}>
          <div className={styles.panel}>
            <p className={styles.empty}>{err || 'پروفایل یافت نشد'}</p>
            <Link href="/school" className={styles.btnGhost}>بازگشت به مدرسه</Link>
          </div>
        </div>
      </div>
    )
  }

  const videoFile = data.intro_video_file_url
  const videoLink = data.intro_video_url

  return (
    <div className={`${styles.page} ${styles.tppPage}`} dir="rtl">
      <div className={styles.wrap}>
        <header className={styles.tppHero}>
          <div className={styles.tppHeroInner}>
            <div className={styles.tppAvatarWrap}>
              {data.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={data.avatar_url} alt={data.display_name} className={styles.tppAvatar} />
              ) : (
                <div className={styles.tppAvatarFallback}>
                  <GraduationCap size={36} />
                </div>
              )}
            </div>
            <div className={styles.tppHeroText}>
              <p className={styles.tppEyebrow}>پروفایل معلم</p>
              <h1 className={styles.tppName}>{data.display_name}</h1>
              {data.specialty ? <p className={styles.tppSpecialty}>{data.specialty}</p> : null}
              {data.bio ? <p className={styles.tppBio}>{data.bio}</p> : null}
            </div>
            {qrSrc ? (
              <div className={styles.tppQrBox}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={qrSrc} alt="QR" className={styles.tppQr} />
                <span><QrCode size={12} /> اشتراک‌گذاری</span>
              </div>
            ) : null}
          </div>
        </header>

        {(videoFile || videoLink) ? (
          <section className={styles.tppSection}>
            <h2 className={styles.tppSectionTitle}>ویدیو معرفی</h2>
            {videoFile ? (
              <video className={styles.tppVideoFile} src={videoFile} controls playsInline />
            ) : null}
            {!videoFile && videoLink ? <AparatEmbed url={videoLink} /> : null}
          </section>
        ) : null}

        {data.bio_html ? (
          <section className={styles.tppSection}>
            <h2 className={styles.tppSectionTitle}>درباره معلم</h2>
            <div
              className={styles.tppHtml}
              dangerouslySetInnerHTML={{ __html: data.bio_html }}
            />
          </section>
        ) : null}

        {(data.educations || []).length ? (
          <section className={styles.tppSection}>
            <h2 className={styles.tppSectionTitle}><BookOpen size={16} /> مدارک تحصیلی</h2>
            <ul className={styles.tppList}>
              {data.educations.map((e) => (
                <li key={e.id} className={styles.tppListItem}>
                  <strong>{e.degree}</strong>
                  {e.field ? ` · ${e.field}` : ''}
                  <div className={styles.tppMeta}>
                    {[e.institution, e.year].filter(Boolean).join(' · ')}
                  </div>
                  {e.description ? <p>{e.description}</p> : null}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {(data.achievements || []).length ? (
          <section className={styles.tppSection}>
            <h2 className={styles.tppSectionTitle}><Award size={16} /> افتخارات و سوابق</h2>
            <ul className={styles.tppList}>
              {data.achievements.map((a) => (
                <li key={a.id} className={styles.tppListItem}>
                  <span className={styles.pill}>{a.kind_label || a.kind}</span>
                  {' '}
                  <strong>{a.title}</strong>
                  <div className={styles.tppMeta}>
                    {[a.organization, a.year].filter(Boolean).join(' · ')}
                  </div>
                  {a.description ? <p>{a.description}</p> : null}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {(data.subjects || []).length ? (
          <section className={styles.tppSection}>
            <h2 className={styles.tppSectionTitle}>دروس</h2>
            <div className={styles.tppSubjects}>
              {data.subjects.map((s) => (
                <span
                  key={s.id}
                  className={styles.tppSubject}
                  style={s.color ? { borderColor: s.color } : undefined}
                >
                  {s.title}
                </span>
              ))}
            </div>
          </section>
        ) : null}

        <nav className={styles.tppFooter}>
          <Link href="/school">هاب مدرسه</Link>
        </nav>
      </div>
    </div>
  )
}
