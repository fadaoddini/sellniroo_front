'use client'

import React, { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Award,
  BookOpen,
  GraduationCap,
  QrCode,
  Sparkles,
  Video,
} from 'lucide-react'
import schoolService from '@/components/School/services/schoolService'
import {
  teacherPublicAbsoluteUrl,
  teacherQrImageUrl,
} from '@/components/School/teacherQr'
import styles from './TeacherPublicProfile.module.css'

function initials(name) {
  const parts = String(name || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
  if (!parts.length) return 'م'
  if (parts.length === 1) return parts[0].slice(0, 1)
  return `${parts[0].slice(0, 1)}${parts[parts.length - 1].slice(0, 1)}`
}

function AparatEmbed({ url }) {
  if (!url) return null
  let src = url
  try {
    const u = new URL(url)
    const m = u.pathname.match(/\/v\/([^/]+)/)
    if (m) {
      src = `https://www.aparat.com/video/video/embed/videohash/${m[1]}/vt/frame`
    }
  } catch {
    /* keep raw */
  }
  return (
    <div className={styles.video}>
      <iframe
        title="ویدیو معرفی"
        src={src}
        allowFullScreen
        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
      />
    </div>
  )
}

function SectionTitle({ icon: Icon, children }) {
  return (
    <h2 className={styles.sectionTitle}>
      <span className={styles.sectionTitleIcon} aria-hidden>
        <Icon size={14} strokeWidth={2.25} />
      </span>
      {children}
    </h2>
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
    return () => {
      cancelled = true
    }
  }, [slug])

  const publicUrl = useMemo(() => {
    if (!data) return ''
    return teacherPublicAbsoluteUrl(
      data.public_path || data.public_slug || slug,
    )
  }, [data, slug])

  const qrSrc = useMemo(() => teacherQrImageUrl(publicUrl, 180), [publicUrl])

  if (loading) {
    return (
      <div className={styles.root} dir="rtl">
        <div className={styles.stateBox}>
          <p className={styles.stateText}>در حال بارگذاری پروفایل…</p>
        </div>
      </div>
    )
  }

  if (err || !data) {
    return (
      <div className={styles.root} dir="rtl">
        <div className={styles.stateBox}>
          <p className={styles.stateText}>{err || 'پروفایل یافت نشد'}</p>
          <Link href="/" className={styles.stateLink}>
            بازگشت به خانه
          </Link>
        </div>
      </div>
    )
  }

  const videoFile = data.intro_video_file_url
  const videoLink = data.intro_video_url
  const educations = Array.isArray(data.educations) ? data.educations : []
  const achievements = Array.isArray(data.achievements) ? data.achievements : []
  const subjects = Array.isArray(data.subjects) ? data.subjects : []

  return (
    <article className={styles.root} dir="rtl" aria-label={data.display_name}>
      <div className={styles.inner}>
        <header className={styles.hero}>
          <div className={styles.avatarWrap}>
            <div className={styles.avatarRing}>
              {data.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={data.avatar_url}
                  alt={data.display_name}
                  className={styles.avatar}
                />
              ) : (
                <div className={styles.avatarFallback} aria-hidden>
                  {initials(data.display_name)}
                </div>
              )}
            </div>
          </div>

          <div className={styles.identity}>
            <p className={styles.kicker}>
              <GraduationCap size={13} strokeWidth={2.25} />
              معرفی معلم
            </p>
            <h1 className={styles.name}>{data.display_name}</h1>
            {data.specialty ? (
              <p className={styles.specialty}>{data.specialty}</p>
            ) : null}
            {data.bio ? <p className={styles.bio}>{data.bio}</p> : null}
          </div>

          {qrSrc ? (
            <div className={styles.qrCard}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qrSrc}
                alt={`QR پروفایل ${data.display_name}`}
                className={styles.qrImg}
              />
              <span className={styles.qrLabel}>
                <QrCode size={12} strokeWidth={2.25} />
                اسکن پروفایل
              </span>
            </div>
          ) : null}
        </header>

        {videoFile || videoLink ? (
          <section className={styles.section}>
            <SectionTitle icon={Video}>ویدیو معرفی</SectionTitle>
            {videoFile ? (
              // eslint-disable-next-line jsx-a11y/media-has-caption
              <video
                className={styles.videoFile}
                src={videoFile}
                controls
                playsInline
              />
            ) : null}
            {!videoFile && videoLink ? <AparatEmbed url={videoLink} /> : null}
          </section>
        ) : null}

        {data.bio_html ? (
          <section className={styles.section}>
            <SectionTitle icon={Sparkles}>درباره معلم</SectionTitle>
            <div
              className={styles.html}
              dangerouslySetInnerHTML={{ __html: data.bio_html }}
            />
          </section>
        ) : null}

        {educations.length ? (
          <section className={styles.section}>
            <SectionTitle icon={BookOpen}>مدارک تحصیلی</SectionTitle>
            <ul className={styles.list}>
              {educations.map((e) => (
                <li key={e.id} className={styles.listItem}>
                  <strong>
                    {e.degree}
                    {e.field ? ` · ${e.field}` : ''}
                  </strong>
                  <div className={styles.meta}>
                    {[e.institution, e.year].filter(Boolean).join(' · ')}
                  </div>
                  {e.description ? <p>{e.description}</p> : null}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {achievements.length ? (
          <section className={styles.section}>
            <SectionTitle icon={Award}>افتخارات و سوابق</SectionTitle>
            <ul className={styles.list}>
              {achievements.map((a) => (
                <li key={a.id} className={styles.listItem}>
                  {a.kind_label || a.kind ? (
                    <span className={styles.pill}>{a.kind_label || a.kind}</span>
                  ) : null}
                  <strong>{a.title}</strong>
                  <div className={styles.meta}>
                    {[a.organization, a.year].filter(Boolean).join(' · ')}
                  </div>
                  {a.description ? <p>{a.description}</p> : null}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {subjects.length ? (
          <section className={styles.section}>
            <SectionTitle icon={BookOpen}>دروس</SectionTitle>
            <div className={styles.subjects}>
              {subjects.map((s) => (
                <span
                  key={s.id}
                  className={styles.subject}
                  style={
                    s.color
                      ? {
                          borderColor: s.color,
                          color: s.color,
                        }
                      : undefined
                  }
                >
                  {s.title}
                </span>
              ))}
            </div>
          </section>
        ) : null}

        <nav className={styles.footer}>
          <Link href="/" className={styles.footerLink}>
            بازگشت به خانه
            <ArrowLeft size={14} strokeWidth={2.25} />
          </Link>
        </nav>
      </div>
    </article>
  )
}
