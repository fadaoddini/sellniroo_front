'use client'

import React, { useState } from 'react'
import { CreditCard, Download, Palette } from 'lucide-react'
import { getTeacherCardTheme, TEACHER_CARD_THEMES } from '@/components/School/teacherCardThemes'
import {
  renderTeacherCardJpeg,
  triggerJpegDownload,
} from '@/components/School/teacherCardExport'
import styles from './School.module.css'

/**
 * کارت معرفی معلم با تم رنگی و خروجی JPG
 */
export default function TeacherIdCard({
  name,
  specialty,
  bio,
  avatarUrl,
  educations = [],
  achievements = [],
  publicUrl,
  qrSrc,
  onNotify,
  cardLabel = 'کارت معرفی معلم',
  brandLabel = 'school',
}) {
  const [themeId, setThemeId] = useState('navy')
  const [exporting, setExporting] = useState(false)
  const theme = getTeacherCardTheme(themeId)

  const topEdu = educations.find((e) => (e.degree || '').trim()) || null
  const topHonor = achievements.find((a) => (a.title || '').trim()) || null

  const downloadJpg = async () => {
    if (!(name || '').trim()) {
      onNotify?.('ابتدا نام معلم را وارد کنید', true)
      return
    }
    setExporting(true)
    try {
      const dataUrl = await renderTeacherCardJpeg({
        theme,
        name: (name || '').trim(),
        specialty: (specialty || '').trim(),
        bio: (bio || '').trim(),
        avatarUrl,
        education: topEdu,
        honor: topHonor,
        publicUrl,
        qrSrc,
        cardLabel,
        brandLabel,
      })
      const safe = (name || 'teacher').replace(/[^\w\u0600-\u06FF-]+/g, '-').slice(0, 40)
      triggerJpegDownload(dataUrl, `teacher-card-${safe}-${themeId}.jpg`)
      onNotify?.(`کارت با تم ${theme.label} دانلود شد`, false)
    } catch (e) {
      onNotify?.(e?.message || 'دانلود کارت ناموفق بود', true)
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className={styles.tidcRoot}>
      <div className={styles.tidcHead}>
        <h2 className={styles.panelTitle}>
          <CreditCard size={16} /> {cardLabel}
        </h2>
        <p className={styles.tidcSub}>تم را انتخاب کنید و به‌صورت JPG دانلود کنید</p>
      </div>

      <div className={styles.tidcThemes}>
        <span className={styles.tidcThemesLabel}><Palette size={13} /> تم خروجی</span>
        <div className={styles.tidcThemeRow} role="listbox" aria-label="تم کارت">
          {TEACHER_CARD_THEMES.map((t) => (
            <button
              key={t.id}
              type="button"
              role="option"
              aria-selected={themeId === t.id}
              className={`${styles.tidcThemeBtn} ${themeId === t.id ? styles.tidcThemeOn : ''}`}
              title={t.label}
              onClick={() => setThemeId(t.id)}
            >
              <span className={styles.tidcSwatch} style={{ background: t.swatch }} />
              <span>{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className={styles.tidcPreviewWrap}>
        <div
          className={styles.tidcCard}
          dir="rtl"
          style={{
            background: theme.bg,
            color: theme.ink,
            '--tidc-accent': theme.accent,
            '--tidc-muted': theme.muted,
            '--tidc-chip': theme.chip,
            '--tidc-line': theme.line,
            '--tidc-glow': theme.glow,
          }}
        >
          <div className={styles.tidcOrnament} aria-hidden />
          <div className={styles.tidcOrnament2} aria-hidden />

          <div className={styles.tidcTop}>
            <span className={styles.tidcBadge}>{cardLabel}</span>
            <span className={styles.tidcBrand}>{brandLabel}</span>
          </div>

          <div className={styles.tidcPhotoRing}>
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt="" className={styles.tidcPhoto} />
            ) : (
              <div className={styles.tidcPhotoEmpty}>
                {(name || 'م').trim().charAt(0)}
              </div>
            )}
          </div>

          <h3 className={styles.tidcName}>{name || 'نام معلم'}</h3>
          {specialty ? <p className={styles.tidcSpecialty}>{specialty}</p> : null}
          {bio ? <p className={styles.tidcBio}>{bio}</p> : null}

          <div className={styles.tidcFacts}>
            {topEdu ? (
              <div className={styles.tidcFact}>
                <span className={styles.tidcFactLabel}>مدرک</span>
                <strong>
                  {topEdu.degree}
                  {topEdu.field ? ` · ${topEdu.field}` : ''}
                </strong>
                {(topEdu.institution || topEdu.year) ? (
                  <em>{[topEdu.institution, topEdu.year].filter(Boolean).join(' · ')}</em>
                ) : null}
              </div>
            ) : null}
            {topHonor ? (
              <div className={styles.tidcFact}>
                <span className={styles.tidcFactLabel}>افتخار / سابقه</span>
                <strong>{topHonor.title}</strong>
                {(topHonor.organization || topHonor.year) ? (
                  <em>{[topHonor.organization, topHonor.year].filter(Boolean).join(' · ')}</em>
                ) : null}
              </div>
            ) : null}
          </div>

          <div className={styles.tidcFooter}>
            <div className={styles.tidcFooterText}>
              <span>اسکن کنید</span>
            </div>
            {qrSrc ? (
              <div className={styles.tidcQrWrap}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={qrSrc} alt="" className={styles.tidcQr} />
              </div>
            ) : (
              <div className={styles.tidcQrPlaceholder}>QR</div>
            )}
          </div>
        </div>
      </div>

      <button
        type="button"
        className={styles.tidcDownload}
        disabled={exporting || !(name || '').trim()}
        onClick={downloadJpg}
      >
        <Download size={15} />
        {exporting ? 'در حال ساخت JPG…' : `دانلود JPG · تم ${theme.label}`}
      </button>
    </div>
  )
}
