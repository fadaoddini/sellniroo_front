'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import {
  Award, Camera, Copy, ExternalLink, Film, HeartHandshake, ImagePlus,
  Link2, QrCode, RefreshCw, Save, Sparkles, Trash2, Upload, User, Video,
} from 'lucide-react'
import Config from '@/config/config'
import schoolService from '@/components/School/services/schoolService'
import TeacherIdCard from '@/components/School/TeacherIdCard'
import {
  teacherPublicAbsoluteUrl,
  teacherQrImageUrl,
} from '@/components/School/teacherQr'
import styles from './School.module.css'

const CKEditorWrapper = dynamic(
  () => import('@/components/newsAdmin/CKEditorWrapper'),
  { ssr: false, loading: () => <p className={styles.empty}>بارگذاری ویرایشگر…</p> },
)

function Section({ n, icon, title, hint, action, children, tone }) {
  return (
    <section className={`${styles.tpSection} ${tone ? styles[`tpTone_${tone}`] || '' : ''}`}>
      <div className={styles.tpSecHead}>
        <div className={styles.tpSecTitle}>
          <span className={styles.tpSecNum}>{n}</span>
          <span className={styles.tpSecIcon}>{icon}</span>
          <div>
            <h2>{title}</h2>
            {hint ? <p>{hint}</p> : null}
          </div>
        </div>
        {action || null}
      </div>
      <div className={styles.tpSecBody}>{children}</div>
    </section>
  )
}

function MediaPicker({
  kind = 'image',
  label,
  hint,
  accept,
  preview,
  onFile,
  onClear,
}) {
  const [active, setActive] = useState(false)
  const isVideo = kind === 'video'

  const pick = (files) => {
    const file = files?.[0]
    if (file && onFile) onFile(file)
  }

  return (
    <div className={`${styles.tpMediaTile} ${isVideo ? styles.tpMediaTileVideo : styles.tpMediaTilePhoto}`}>
      <div className={styles.tpMediaTileHead}>
        <div>
          <strong>{label}</strong>
          {hint ? <p>{hint}</p> : null}
        </div>
        {preview ? (
          <button type="button" className={styles.tpMediaClear} onClick={onClear} title="حذف">
            <Trash2 size={13} />
          </button>
        ) : null}
      </div>

      <label
        className={`${styles.tpMediaDrop} ${active ? styles.tpMediaDropOn : ''} ${preview ? styles.tpMediaDropFilled : ''}`}
        onDragOver={(e) => { e.preventDefault(); setActive(true) }}
        onDragLeave={() => setActive(false)}
        onDrop={(e) => {
          e.preventDefault()
          setActive(false)
          pick(e.dataTransfer.files)
        }}
      >
        <input type="file" accept={accept} hidden onChange={(e) => pick(e.target.files)} />

        {preview ? (
          isVideo ? (
            <video src={preview} className={styles.tpMediaVideo} controls playsInline />
          ) : (
            <span className={styles.tpMediaAvatarRing}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview} alt="" className={styles.tpMediaAvatar} />
              <span className={styles.tpMediaAvatarHint}>
                <RefreshCw size={14} />
                تعویض عکس
              </span>
            </span>
          )
        ) : (
          <span className={styles.tpMediaEmpty}>
            <span className={styles.tpMediaEmptyIcon}>
              {isVideo ? <Film size={22} /> : <ImagePlus size={22} />}
            </span>
            <span className={styles.tpMediaEmptyTitle}>
              {isVideo ? 'ویدیو را اینجا رها کنید' : 'عکس پروفایل را انتخاب کنید'}
            </span>
            <span className={styles.tpMediaEmptyMeta}>
              {isVideo ? 'MP4 / WebM · حداکثر ۸۰ مگابایت' : 'JPG / PNG · حداکثر ۵ مگابایت'}
            </span>
            <span className={styles.tpMediaEmptyBtn}>
              <Upload size={13} />
              انتخاب فایل
            </span>
          </span>
        )}
      </label>
    </div>
  )
}

export default function CounselorProfilePanel({
  mode = 'self',
  counselorId = null,
  previewCounselorId = null,
  onNotify,
}) {
  const [form, setForm] = useState(null)
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [videoFile, setVideoFile] = useState(null)
  const [videoPreview, setVideoPreview] = useState(null)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  const uploadUrl = useMemo(() => Config.endpoints.school.upload(), [])
  const meParams = useMemo(
    () => (previewCounselorId ? { counselor: previewCounselorId } : {}),
    [previewCounselorId],
  )

  const load = useCallback(async () => {
    setLoading(true)
    let res
    if (mode === 'admin' && counselorId) {
      res = await schoolService.getCounselor(counselorId)
    } else {
      res = await schoolService.getMyCounselorProfile(meParams)
    }
    setLoading(false)
    if (!res.success) {
      onNotify?.(res.error || 'خطا در بارگذاری پروفایل', true)
      setForm(null)
      return
    }
    const d = res.data
    setForm({
      display_name: d.display_name || '',
      specialty: d.specialty || '',
      bio: d.bio || '',
      bio_html: d.bio_html || '',
      license_no: d.license_no || '',
      years_experience: d.years_experience || 0,
      intro_video_url: d.intro_video_url || '',
      is_profile_public: d.is_profile_public !== false,
      public_slug: d.public_slug || '',
      public_path: d.public_path || '',
      avatar_url: d.avatar_url || null,
      intro_video_file_url: d.intro_video_file_url || null,
    })
    setAvatarFile(null)
    setVideoFile(null)
    setAvatarPreview(d.avatar_url)
    setVideoPreview(d.intro_video_file_url)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, counselorId, meParams])

  useEffect(() => { load() }, [load])

  const publicUrl = useMemo(() => {
    if (!form) return ''
    return teacherPublicAbsoluteUrl(
      form.public_path || (form.public_slug ? `/counselors/${form.public_slug}` : ''),
    )
  }, [form])

  const qrSrc = useMemo(() => teacherQrImageUrl(publicUrl, 200), [publicUrl])

  const patch = (key, value) => setForm((p) => (p ? { ...p, [key]: value } : p))

  const save = async () => {
    if (!form) return
    if (!(form.display_name || '').trim()) {
      onNotify?.('نام نمایشی الزامی است', true)
      return
    }
    if (avatarFile && avatarFile.size > 5 * 1024 * 1024) {
      onNotify?.('حجم تصویر نباید بیشتر از ۵ مگابایت باشد', true)
      return
    }
    if (videoFile && videoFile.size > 80 * 1024 * 1024) {
      onNotify?.('حجم ویدیو نباید بیشتر از ۸۰ مگابایت باشد', true)
      return
    }

    const fd = new FormData()
    fd.append('display_name', (form.display_name || '').trim())
    fd.append('specialty', (form.specialty || '').trim())
    fd.append('bio', (form.bio || '').trim())
    fd.append('bio_html', form.bio_html || '')
    fd.append('license_no', (form.license_no || '').trim())
    fd.append('years_experience', String(form.years_experience || 0))
    fd.append('intro_video_url', (form.intro_video_url || '').trim())
    fd.append('is_profile_public', form.is_profile_public ? 'true' : 'false')
    if (avatarFile) fd.append('avatar', avatarFile)
    if (videoFile) fd.append('intro_video', videoFile)

    setSaving(true)
    let res
    if (mode === 'admin' && counselorId) {
      res = await schoolService.updateCounselor(counselorId, fd)
    } else {
      res = await schoolService.updateMyCounselorProfile(fd, meParams)
    }
    setSaving(false)
    if (!res.success) {
      onNotify?.(res.error || 'ذخیره نشد', true)
      return
    }
    onNotify?.('پروفایل مشاور ذخیره شد', false)
    load()
  }

  const copyLink = async () => {
    if (!publicUrl) return
    try {
      await navigator.clipboard.writeText(publicUrl)
      onNotify?.('لینک کپی شد', false)
    } catch {
      onNotify?.('کپی نشد — لینک را دستی کپی کنید', true)
    }
  }

  if (loading || !form) {
    return (
      <div className={styles.tpLoading}>
        <Sparkles size={18} />
        <p>{loading ? 'در حال آماده‌سازی پروفایل مشاور…' : 'پروفایلی یافت نشد'}</p>
      </div>
    )
  }

  return (
    <div className={styles.tpRoot}>
      <header className={`${styles.tpHeroBar} ${styles.cpHeroBar}`}>
        <div className={styles.tpHeroAvatar}>
          {avatarPreview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarPreview} alt="" />
          ) : (
            <HeartHandshake size={28} />
          )}
        </div>
        <div className={styles.tpHeroText}>
          <p className={styles.tpHeroEyebrow}>پروفایل مشاور مدرسه</p>
          <h1>{form.display_name || 'بدون نام'}</h1>
          <p>{form.specialty || 'حوزه تخصص را تکمیل کنید'}</p>
        </div>
        <button type="button" className={styles.tpSaveFab} disabled={saving} onClick={save}>
          <Save size={15} />
          {saving ? 'ذخیره…' : 'ذخیره پروفایل'}
        </button>
      </header>

      <div className={styles.tpLayout}>
        <div className={styles.tpMain}>
          <Section
            n="۱"
            icon={<User size={15} />}
            title="اطلاعات پایه"
            hint="نام، تخصص و معرفی کوتاه برای کارت و صفحه عمومی"
          >
            <div className={styles.tpFields}>
              <div className={styles.formRow}>
                <div className={styles.field}>
                  <label>نام نمایشی</label>
                  <input
                    value={form.display_name}
                    onChange={(e) => patch('display_name', e.target.value)}
                    placeholder="مثلاً خانم کاظمی"
                  />
                </div>
                <div className={styles.field}>
                  <label>حوزه تخصص</label>
                  <input
                    value={form.specialty}
                    onChange={(e) => patch('specialty', e.target.value)}
                    placeholder="مشاوره تحصیلی · استعدادیابی"
                  />
                </div>
              </div>
              <div className={styles.formRow}>
                <div className={styles.field}>
                  <label>شماره پروانه / مجوز</label>
                  <input
                    value={form.license_no}
                    onChange={(e) => patch('license_no', e.target.value)}
                    placeholder="CS-1402-…"
                  />
                </div>
                <div className={styles.field}>
                  <label>سال سابقه</label>
                  <input
                    type="number"
                    min={0}
                    value={form.years_experience}
                    onChange={(e) => patch('years_experience', e.target.value)}
                  />
                </div>
              </div>
              <div className={styles.field}>
                <label>بیوگرافی کوتاه (روی کارت نمایش داده می‌شود)</label>
                <textarea
                  rows={2}
                  value={form.bio}
                  onChange={(e) => patch('bio', e.target.value)}
                  placeholder="یک یا دو جمله گرم درباره رویکرد مشاوره"
                />
              </div>
              <label className={`${styles.tpSwitch} ${form.is_profile_public ? styles.tpSwitchOn : ''}`}>
                <input
                  type="checkbox"
                  checked={!!form.is_profile_public}
                  onChange={(e) => patch('is_profile_public', e.target.checked)}
                />
                <span className={styles.tpSwitchTrack} aria-hidden />
                <span>
                  نمایش عمومی پروفایل
                  <small>لینک و QR فعال می‌شود</small>
                </span>
              </label>
            </div>
          </Section>

          <Section
            n="۲"
            icon={<Camera size={15} />}
            title="تصویر و ویدیو"
            hint="عکس پروفایل روی کارت و صفحه عمومی می‌آید"
            tone="media"
          >
            <div className={styles.tpMediaStage}>
              <div className={styles.tpMediaRow}>
                <MediaPicker
                  kind="image"
                  label="تصویر پروفایل"
                  hint="روی کارت JPG و صفحه عمومی"
                  accept="image/jpeg,image/png,image/webp,image/*"
                  preview={avatarPreview}
                  onFile={(file) => {
                    setAvatarFile(file)
                    setAvatarPreview(URL.createObjectURL(file))
                  }}
                  onClear={() => {
                    setAvatarFile(null)
                    setAvatarPreview(null)
                  }}
                />
                <MediaPicker
                  kind="video"
                  label="ویدیو معرفی"
                  hint="آپلود مستقیم فایل ویدیو"
                  accept="video/mp4,video/webm,video/*"
                  preview={videoPreview}
                  onFile={(file) => {
                    setVideoFile(file)
                    setVideoPreview(URL.createObjectURL(file))
                  }}
                  onClear={() => {
                    setVideoFile(null)
                    setVideoPreview(null)
                  }}
                />
              </div>

              <div className={styles.tpMediaLinkBox}>
                <div className={styles.tpMediaLinkLabel}>
                  <Link2 size={14} />
                  <div>
                    <strong>لینک ویدیو آپارات</strong>
                    <p>اگر فایل آپلود نکردید، لینک را اینجا بگذارید</p>
                  </div>
                </div>
                <div className={styles.tpMediaLinkField}>
                  <Video size={15} />
                  <input
                    dir="ltr"
                    value={form.intro_video_url}
                    onChange={(e) => patch('intro_video_url', e.target.value)}
                    placeholder="https://www.aparat.com/v/..."
                  />
                </div>
              </div>
            </div>
          </Section>

          <Section
            n="۳"
            icon={<Sparkles size={15} />}
            title="معرفی کامل"
            hint="با ویرایشگر متن؛ تصویر هم می‌توانید داخل متن بگذارید"
          >
            <div className={styles.tpEditor}>
              <CKEditorWrapper
                value={form.bio_html}
                onChange={(html) => patch('bio_html', html)}
                placeholder="رویکرد مشاوره، خدمات، پیام به والدین و دانش‌آموزان…"
                uploadUrl={uploadUrl}
              />
            </div>
          </Section>

          <Section
            n="۴"
            icon={<Award size={15} />}
            title="اعتبار حرفه‌ای"
            hint="روی کارت معرفی نمایش داده می‌شود"
          >
            <div className={styles.cpCredGrid}>
              <div className={styles.cpCredCard}>
                <span>پروانه</span>
                <strong>{form.license_no || '—'}</strong>
              </div>
              <div className={styles.cpCredCard}>
                <span>سابقه</span>
                <strong>{form.years_experience ? `${form.years_experience} سال` : '—'}</strong>
              </div>
              <div className={styles.cpCredCard}>
                <span>تخصص</span>
                <strong>{form.specialty || '—'}</strong>
              </div>
            </div>
          </Section>

          <div className={styles.tpActions}>
            <button type="button" className={styles.btnAccent} disabled={saving} onClick={save}>
              <Save size={14} /> {saving ? 'در حال ذخیره…' : 'ذخیره پروفایل'}
            </button>
          </div>
        </div>

        <aside className={styles.tpAside}>
          <div className={styles.tpAsideSticky}>
            <TeacherIdCard
              cardLabel="کارت معرفی مشاور"
              brandLabel="counsel"
              name={form.display_name}
              specialty={form.specialty}
              bio=""
              avatarUrl={avatarPreview}
              educations={form.license_no ? [{ degree: `پروانه ${form.license_no}`, field: '', institution: 'مشاور مدرسه', year: '' }] : []}
              achievements={form.years_experience ? [{ title: `${form.years_experience} سال سابقه مشاوره`, organization: form.specialty || '', year: '' }] : []}
              publicUrl={publicUrl}
              qrSrc={form.is_profile_public ? qrSrc : ''}
              onNotify={onNotify}
            />

            <div className={styles.tpQrCard}>
              <div className={styles.tpSecTitle} style={{ marginBottom: 10 }}>
                <span className={styles.tpSecIcon}><QrCode size={14} /></span>
                <div><h2 style={{ fontSize: '0.9rem' }}>لینک و QR مشاور</h2></div>
              </div>
              {publicUrl && form.is_profile_public ? (
                <>
                  {qrSrc ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={qrSrc} alt="QR" className={styles.tpQrImg} />
                  ) : null}
                  <p className={styles.tpQrUrl} dir="ltr">{publicUrl}</p>
                  <div className={styles.tpQrBtns}>
                    <button type="button" className={styles.btnGhost} onClick={copyLink}>
                      <Copy size={14} /> کپی لینک
                    </button>
                    <Link
                      href={form.public_path || `/counselors/${form.public_slug}`}
                      className={styles.btnGhost}
                      target="_blank"
                    >
                      <ExternalLink size={14} /> مشاهده صفحه
                    </Link>
                  </div>
                </>
              ) : (
                <p className={styles.empty}>
                  {form.is_profile_public
                    ? 'پس از ذخیره، لینک ساخته می‌شود'
                    : 'پروفایل عمومی خاموش است'}
                </p>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
