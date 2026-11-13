'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import {
  Award, BookOpen, Camera, Copy, ExternalLink, Film, ImagePlus, Link2,
  Plus, QrCode, RefreshCw, Save, Sparkles, Trash2, Upload, User, Video,
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

const ACHIEVEMENT_KINDS = [
  { value: 'honor', label: 'افتخار' },
  { value: 'experience', label: 'سابقه' },
  { value: 'certificate', label: 'گواهی' },
  { value: 'other', label: 'سایر' },
]

const emptyEducation = () => ({
  id: null, degree: '', field: '', institution: '', year: '', description: '',
})
const emptyAchievement = () => ({
  id: null, kind: 'honor', title: '', organization: '', year: '', description: '',
})

function toForm(data) {
  return {
    display_name: data?.display_name || '',
    specialty: data?.specialty || '',
    bio: data?.bio || '',
    bio_html: data?.bio_html || '',
    intro_video_url: data?.intro_video_url || '',
    is_profile_public: data?.is_profile_public !== false,
    public_slug: data?.public_slug || '',
    public_path: data?.public_path || '',
    avatar_url: data?.avatar_url || null,
    intro_video_file_url: data?.intro_video_file_url || null,
    educations: (data?.educations || []).map((e) => ({
      id: e.id,
      degree: e.degree || '',
      field: e.field || '',
      institution: e.institution || '',
      year: e.year || '',
      description: e.description || '',
    })),
    achievements: (data?.achievements || []).map((a) => ({
      id: a.id,
      kind: a.kind || 'honor',
      title: a.title || '',
      organization: a.organization || '',
      year: a.year || '',
      description: a.description || '',
    })),
  }
}

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
        <input
          type="file"
          accept={accept}
          hidden
          onChange={(e) => pick(e.target.files)}
        />

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

export default function TeacherProfilePanel({
  mode = 'self',
  teacherId = null,
  previewTeacherId = null,
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
    () => (previewTeacherId ? { teacher: previewTeacherId } : {}),
    [previewTeacherId],
  )

  const load = useCallback(async () => {
    setLoading(true)
    let res
    if (mode === 'admin' && teacherId) {
      res = await schoolService.getTeacher(teacherId)
    } else {
      res = await schoolService.getMyTeacherProfile(meParams)
    }
    setLoading(false)
    if (!res.success) {
      onNotify?.(res.error || 'خطا در بارگذاری پروفایل', true)
      setForm(null)
      return
    }
    const next = toForm(res.data)
    setForm(next)
    setAvatarFile(null)
    setVideoFile(null)
    setAvatarPreview(next.avatar_url)
    setVideoPreview(next.intro_video_file_url)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, teacherId, meParams])

  useEffect(() => {
    load()
  }, [load])

  const publicUrl = useMemo(() => {
    if (!form) return ''
    return teacherPublicAbsoluteUrl(form.public_path || form.public_slug)
  }, [form])

  const qrSrc = useMemo(() => teacherQrImageUrl(publicUrl, 220), [publicUrl])

  const patch = (key, value) => setForm((p) => (p ? { ...p, [key]: value } : p))

  const patchEducation = (idx, key, value) => {
    setForm((p) => {
      if (!p) return p
      const educations = p.educations.map((row, i) => (i === idx ? { ...row, [key]: value } : row))
      return { ...p, educations }
    })
  }

  const patchAchievement = (idx, key, value) => {
    setForm((p) => {
      if (!p) return p
      const achievements = p.achievements.map((row, i) => (i === idx ? { ...row, [key]: value } : row))
      return { ...p, achievements }
    })
  }

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
    fd.append('intro_video_url', (form.intro_video_url || '').trim())
    fd.append('is_profile_public', form.is_profile_public ? 'true' : 'false')
    if ((form.public_slug || '').trim()) {
      fd.append('public_slug', (form.public_slug || '').trim())
    }
    fd.append('educations', JSON.stringify(
      form.educations
        .filter((e) => (e.degree || '').trim())
        .map((e, i) => ({
          id: e.id || undefined,
          degree: e.degree.trim(),
          field: (e.field || '').trim(),
          institution: (e.institution || '').trim(),
          year: (e.year || '').trim(),
          description: (e.description || '').trim(),
          order: i,
        })),
    ))
    fd.append('achievements', JSON.stringify(
      form.achievements
        .filter((a) => (a.title || '').trim())
        .map((a, i) => ({
          id: a.id || undefined,
          kind: a.kind || 'honor',
          title: a.title.trim(),
          organization: (a.organization || '').trim(),
          year: (a.year || '').trim(),
          description: (a.description || '').trim(),
          order: i,
        })),
    ))
    if (avatarFile) fd.append('avatar', avatarFile)
    if (videoFile) fd.append('intro_video', videoFile)

    setSaving(true)
    let res
    if (mode === 'admin' && teacherId) {
      res = await schoolService.updateTeacher(teacherId, fd)
    } else {
      res = await schoolService.updateMyTeacherProfile(fd, meParams)
    }
    setSaving(false)
    if (!res.success) {
      onNotify?.(res.error || 'ذخیره نشد', true)
      return
    }
    const next = toForm(res.data)
    setForm(next)
    setAvatarFile(null)
    setVideoFile(null)
    setAvatarPreview(next.avatar_url)
    setVideoPreview(next.intro_video_file_url)
    onNotify?.('پروفایل ذخیره شد', false)
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
        <p>{loading ? 'در حال آماده‌سازی پروفایل…' : 'پروفایلی یافت نشد'}</p>
      </div>
    )
  }

  return (
    <div className={styles.tpRoot}>
      <header className={styles.tpHeroBar}>
        <div className={styles.tpHeroAvatar}>
          {avatarPreview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarPreview} alt="" />
          ) : (
            <User size={28} />
          )}
        </div>
        <div className={styles.tpHeroText}>
          <p className={styles.tpHeroEyebrow}>رزومه و پروفایل معلم</p>
          <h1>{form.display_name || 'بدون نام'}</h1>
          <p>{form.specialty || 'تخصص را در فرم زیر تکمیل کنید'}</p>
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
                    placeholder="مثلاً آقای احمدی"
                  />
                </div>
                <div className={styles.field}>
                  <label>تخصص</label>
                  <input
                    value={form.specialty}
                    onChange={(e) => patch('specialty', e.target.value)}
                    placeholder="ریاضی · پایه نهم"
                  />
                </div>
              </div>
              <div className={styles.field}>
                <label>بیوگرافی کوتاه (روی کارت نمایش داده می‌شود)</label>
                <textarea
                  rows={2}
                  value={form.bio}
                  onChange={(e) => patch('bio', e.target.value)}
                  placeholder="یک یا دو جمله گرم و حرفه‌ای درباره خودتان"
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
                placeholder="سبک تدریس، اهداف، پیام به دانش‌آموزان…"
                uploadUrl={uploadUrl}
              />
            </div>
          </Section>

          <Section
            n="۴"
            icon={<BookOpen size={15} />}
            title="مدارک تحصیلی"
            hint="اولین مدرک روی کارت معرفی نمایش داده می‌شود"
            action={(
              <button
                type="button"
                className={styles.tpAddBtn}
                onClick={() => setForm((p) => ({ ...p, educations: [...p.educations, emptyEducation()] }))}
              >
                <Plus size={14} /> افزودن مدرک
              </button>
            )}
          >
            {!form.educations.length ? (
              <div className={styles.tpEmptyHint}>هنوز مدرکی ثبت نشده — دکمه افزودن را بزنید</div>
            ) : null}
            <div className={styles.tpStack}>
              {form.educations.map((ed, idx) => (
                <div key={ed.id || `ed-${idx}`} className={styles.tpItemCard}>
                  <div className={styles.tpItemTop}>
                    <span className={styles.tpItemBadge}>مدرک {idx + 1}</span>
                    <button
                      type="button"
                      className={styles.tpIconDel}
                      aria-label="حذف"
                      onClick={() => setForm((p) => ({
                        ...p,
                        educations: p.educations.filter((_, i) => i !== idx),
                      }))}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <div className={styles.formRow}>
                    <div className={styles.field}>
                      <label>مقطع / مدرک</label>
                      <input value={ed.degree} onChange={(e) => patchEducation(idx, 'degree', e.target.value)} placeholder="کارشناسی ارشد" />
                    </div>
                    <div className={styles.field}>
                      <label>رشته</label>
                      <input value={ed.field} onChange={(e) => patchEducation(idx, 'field', e.target.value)} placeholder="آموزش ریاضی" />
                    </div>
                  </div>
                  <div className={styles.formRow} style={{ marginTop: 8 }}>
                    <div className={styles.field}>
                      <label>دانشگاه / مؤسسه</label>
                      <input value={ed.institution} onChange={(e) => patchEducation(idx, 'institution', e.target.value)} />
                    </div>
                    <div className={styles.field}>
                      <label>سال</label>
                      <input value={ed.year} onChange={(e) => patchEducation(idx, 'year', e.target.value)} placeholder="۱۴۰۰" />
                    </div>
                  </div>
                  <div className={styles.field} style={{ marginTop: 8 }}>
                    <label>توضیح</label>
                    <input value={ed.description} onChange={(e) => patchEducation(idx, 'description', e.target.value)} />
                  </div>
                </div>
              ))}
            </div>
          </Section>

          <Section
            n="۵"
            icon={<Award size={15} />}
            title="افتخارات و سوابق"
            hint="اولین مورد روی کارت معرفی نمایش داده می‌شود"
            action={(
              <button
                type="button"
                className={styles.tpAddBtn}
                onClick={() => setForm((p) => ({ ...p, achievements: [...p.achievements, emptyAchievement()] }))}
              >
                <Plus size={14} /> افزودن مورد
              </button>
            )}
          >
            {!form.achievements.length ? (
              <div className={styles.tpEmptyHint}>افتخار یا سابقه‌ای ثبت نشده</div>
            ) : null}
            <div className={styles.tpStack}>
              {form.achievements.map((ac, idx) => (
                <div key={ac.id || `ac-${idx}`} className={styles.tpItemCard}>
                  <div className={styles.tpItemTop}>
                    <span className={styles.tpItemBadge}>مورد {idx + 1}</span>
                    <button
                      type="button"
                      className={styles.tpIconDel}
                      aria-label="حذف"
                      onClick={() => setForm((p) => ({
                        ...p,
                        achievements: p.achievements.filter((_, i) => i !== idx),
                      }))}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <div className={styles.formRow}>
                    <div className={styles.field}>
                      <label>نوع</label>
                      <select value={ac.kind} onChange={(e) => patchAchievement(idx, 'kind', e.target.value)}>
                        {ACHIEVEMENT_KINDS.map((k) => (
                          <option key={k.value} value={k.value}>{k.label}</option>
                        ))}
                      </select>
                    </div>
                    <div className={styles.field}>
                      <label>عنوان</label>
                      <input value={ac.title} onChange={(e) => patchAchievement(idx, 'title', e.target.value)} />
                    </div>
                  </div>
                  <div className={styles.formRow} style={{ marginTop: 8 }}>
                    <div className={styles.field}>
                      <label>سازمان / محل</label>
                      <input value={ac.organization} onChange={(e) => patchAchievement(idx, 'organization', e.target.value)} />
                    </div>
                    <div className={styles.field}>
                      <label>سال</label>
                      <input value={ac.year} onChange={(e) => patchAchievement(idx, 'year', e.target.value)} />
                    </div>
                  </div>
                  <div className={styles.field} style={{ marginTop: 8 }}>
                    <label>توضیح</label>
                    <input value={ac.description} onChange={(e) => patchAchievement(idx, 'description', e.target.value)} />
                  </div>
                </div>
              ))}
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
              name={form.display_name}
              specialty={form.specialty}
              bio={form.bio}
              avatarUrl={avatarPreview}
              educations={form.educations}
              achievements={form.achievements}
              publicUrl={publicUrl}
              qrSrc={form.is_profile_public ? qrSrc : ''}
              onNotify={onNotify}
            />

            <div className={styles.tpQrCard}>
              <div className={styles.tpSecTitle} style={{ marginBottom: 10 }}>
                <span className={styles.tpSecIcon}><QrCode size={14} /></span>
                <div><h2 style={{ fontSize: '0.9rem' }}>لینک و QR</h2></div>
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
                      href={form.public_path || `/school/teachers/${form.public_slug}`}
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
