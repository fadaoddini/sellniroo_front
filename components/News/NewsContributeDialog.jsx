'use client'

import React, { useEffect, useId, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import {
  X,
  PenLine,
  Upload,
  Loader2,
  CheckCircle2,
  User,
  Mail,
  Phone,
  Link2,
  FileText,
  Image as ImageIcon,
} from 'lucide-react'
import newsService from '@/services/newsService'
import { useAuth } from '@/contexts/AuthContext'
import styles from './News.module.css'

const CKEditorWrapper = dynamic(
  () => import('@/components/newsAdmin/CKEditorWrapper'),
  {
    ssr: false,
    loading: () => (
      <div className={styles.ncEditorLoading}>در حال بارگذاری ویرایشگر…</div>
    ),
  }
)

function plainTextLength(html) {
  return String(html || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim().length
}

const EMPTY = {
  writer_name: '',
  contact_email: '',
  contact_phone: '',
  title: '',
  excerpt: '',
  description: '',
  category: '',
  source_link: '',
  featured_image: null,
}

export default function NewsContributeDialog({
  open,
  onClose,
  categories = [],
}) {
  const titleId = useId()
  const fileRef = useRef(null)
  const { user, isAuthenticated } = useAuth()
  const [form, setForm] = useState(EMPTY)
  const [preview, setPreview] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const [editorKey, setEditorKey] = useState(0)

  useEffect(() => {
    if (!open) return undefined
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    setError('')
    setDone(false)
    setForm((f) => ({
      ...EMPTY,
      writer_name:
        f.writer_name ||
        user?.full_name ||
        user?.first_name ||
        user?.username ||
        '',
      contact_email: f.contact_email || user?.email || '',
    }))
    const onKey = (e) => {
      if (e.key === 'Escape' && !submitting) onClose?.()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onClose, submitting, user])

  useEffect(() => {
    if (!open) {
      setPreview('')
      setForm(EMPTY)
      setDone(false)
      setError('')
      setEditorKey((k) => k + 1)
      if (fileRef.current) fileRef.current.value = ''
    }
  }, [open])

  if (!open) return null

  const patch = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const onFile = (file) => {
    if (!file) {
      patch('featured_image', null)
      setPreview('')
      return
    }
    if (!file.type?.startsWith('image/')) {
      setError('فقط فایل تصویری مجاز است')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('حجم تصویر حداکثر ۵ مگابایت')
      return
    }
    setError('')
    patch('featured_image', file)
    const url = URL.createObjectURL(file)
    setPreview(url)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (submitting) return
    setError('')

    if (!form.writer_name.trim()) {
      setError('نام خود را وارد کنید')
      return
    }
    if (form.title.trim().length < 8) {
      setError('عنوان مطلب را کامل‌تر بنویسید')
      return
    }
    if (plainTextLength(form.description) < 40) {
      setError('متن مطلب کوتاه است؛ حداقل چند جمله بنویسید')
      return
    }

    const fd = new FormData()
    fd.append('writer_name', form.writer_name.trim())
    fd.append('title', form.title.trim())
    fd.append('description', form.description)
    if (form.excerpt.trim()) fd.append('excerpt', form.excerpt.trim())
    if (form.category) fd.append('category', form.category)
    if (form.contact_email.trim()) {
      fd.append('contact_email', form.contact_email.trim())
    }
    if (form.contact_phone.trim()) {
      fd.append('contact_phone', form.contact_phone.trim())
    }
    if (form.source_link.trim()) {
      fd.append('source_link', form.source_link.trim())
    }
    if (form.featured_image) {
      fd.append('featured_image', form.featured_image)
    }

    setSubmitting(true)
    try {
      const result = await newsService.contributeNews(fd)
      if (result.success) {
        setDone(true)
      } else {
        setError(result.error || 'ارسال ناموفق بود')
      }
    } catch {
      setError('خطا در ارتباط با سرور')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className={styles.ncOverlay} role="presentation">
      <button
        type="button"
        className={styles.ncBackdrop}
        aria-label="بستن"
        onClick={() => !submitting && onClose?.()}
      />
      <div
        className={styles.ncDialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <header className={styles.ncHead}>
          <div className={styles.ncHeadText}>
            <PenLine size={18} aria-hidden />
            <div>
              <h2 id={titleId} className={styles.ncTitle}>
                ارسال مطلب شما
              </h2>
              <p className={styles.ncSub}>
                ایده‌ها و مطالب مفیدتان را بفرستید؛ پس از تایید مدیر با نام شما
                منتشر می‌شود.
              </p>
            </div>
          </div>
          <button
            type="button"
            className={styles.ncClose}
            onClick={() => !submitting && onClose?.()}
            aria-label="بستن"
          >
            <X size={18} />
          </button>
        </header>

        {done ? (
          <div className={styles.ncSuccess}>
            <CheckCircle2 size={40} aria-hidden />
            <h3>مطلب دریافت شد</h3>
            <p>
              سپاس{form.writer_name ? ` ${form.writer_name}` : ''}؛ مطلب شما در
              صف بررسی است و پس از تایید مدیر روی مجله قرار می‌گیرد.
            </p>
            <button
              type="button"
              className={styles.ncPrimary}
              onClick={() => onClose?.()}
            >
              متوجه شدم
            </button>
          </div>
        ) : (
          <form className={styles.ncForm} onSubmit={handleSubmit}>
            <div className={styles.ncBody}>
              <fieldset className={styles.ncFieldset}>
                <legend>درباره شما</legend>
                <label className={styles.ncField}>
                  <span>
                    <User size={14} /> نام نمایشی *
                  </span>
                  <input
                    type="text"
                    value={form.writer_name}
                    onChange={(e) => patch('writer_name', e.target.value)}
                    placeholder="مثلاً سارا محمدی"
                    required
                    maxLength={200}
                    autoComplete="name"
                  />
                </label>
                <div className={styles.ncRow2}>
                  <label className={styles.ncField}>
                    <span>
                      <Mail size={14} /> ایمیل
                    </span>
                    <input
                      type="email"
                      value={form.contact_email}
                      onChange={(e) => patch('contact_email', e.target.value)}
                      placeholder="برای هماهنگی (اختیاری)"
                      autoComplete="email"
                      dir="ltr"
                    />
                  </label>
                  <label className={styles.ncField}>
                    <span>
                      <Phone size={14} /> تلفن
                    </span>
                    <input
                      type="tel"
                      value={form.contact_phone}
                      onChange={(e) => patch('contact_phone', e.target.value)}
                      placeholder="اختیاری"
                      autoComplete="tel"
                      dir="ltr"
                    />
                  </label>
                </div>
                {!isAuthenticated ? (
                  <p className={styles.ncHint}>
                    ورود لازم نیست؛ فقط نام برای نمایش روی مطلب کافی است.
                  </p>
                ) : null}
              </fieldset>

              <fieldset className={styles.ncFieldset}>
                <legend>محتوای مطلب</legend>
                <label className={styles.ncField}>
                  <span>
                    <FileText size={14} /> عنوان *
                  </span>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => patch('title', e.target.value)}
                    placeholder="عنوان جذاب و واضح"
                    required
                    maxLength={500}
                  />
                </label>
                <label className={styles.ncField}>
                  <span>خلاصه کوتاه</span>
                  <textarea
                    value={form.excerpt}
                    onChange={(e) => patch('excerpt', e.target.value)}
                    placeholder="۲–۳ جمله برای پیش‌نمایش در لیست (اختیاری)"
                    rows={2}
                    maxLength={500}
                  />
                </label>
                <div className={styles.ncField}>
                  <span>متن کامل *</span>
                  <div className={styles.ncEditor}>
                    {open ? (
                      <CKEditorWrapper
                        key={`contribute-editor-${editorKey}`}
                        compact
                        value={form.description}
                        onChange={(data) => patch('description', data)}
                        placeholder="متن کامل مطلب را اینجا بنویسید…"
                      />
                    ) : null}
                  </div>
                </div>
                <div className={styles.ncRow2}>
                  <label className={styles.ncField}>
                    <span>دسته‌بندی</span>
                    <select
                      value={form.category}
                      onChange={(e) => patch('category', e.target.value)}
                    >
                      <option value="">انتخاب کنید (اختیاری)</option>
                      {categories.map((c) => (
                        <option key={c.id || c.slug} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className={styles.ncField}>
                    <span>
                      <Link2 size={14} /> لینک منبع
                    </span>
                    <input
                      type="url"
                      value={form.source_link}
                      onChange={(e) => patch('source_link', e.target.value)}
                      placeholder="https://…"
                      dir="ltr"
                    />
                  </label>
                </div>
              </fieldset>

              <fieldset className={styles.ncFieldset}>
                <legend>
                  <ImageIcon size={14} /> تصویر شاخص
                </legend>
                <div
                  className={styles.ncDrop}
                  role="button"
                  tabIndex={0}
                  onClick={() => fileRef.current?.click()}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      fileRef.current?.click()
                    }
                  }}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault()
                    onFile(e.dataTransfer?.files?.[0])
                  }}
                >
                  {preview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={preview} alt="" className={styles.ncPreview} />
                  ) : (
                    <>
                      <Upload size={20} />
                      <span>کلیک یا رها کردن تصویر</span>
                      <small>JPG / PNG / WEBP · تا ۵MB · اختیاری</small>
                    </>
                  )}
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    hidden
                    onChange={(e) => onFile(e.target.files?.[0])}
                  />
                </div>
                {preview ? (
                  <button
                    type="button"
                    className={styles.ncClearImg}
                    onClick={() => {
                      onFile(null)
                      if (fileRef.current) fileRef.current.value = ''
                    }}
                  >
                    حذف تصویر
                  </button>
                ) : null}
              </fieldset>

              {error ? <p className={styles.ncError}>{error}</p> : null}
            </div>

            <footer className={styles.ncFoot}>
              <button
                type="button"
                className={styles.ncGhost}
                onClick={() => onClose?.()}
                disabled={submitting}
              >
                انصراف
              </button>
              <button
                type="submit"
                className={styles.ncPrimary}
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 size={16} className={styles.nlSpin} />
                    در حال ارسال…
                  </>
                ) : (
                  <>
                    <PenLine size={16} />
                    ارسال برای بررسی
                  </>
                )}
              </button>
            </footer>
          </form>
        )}
      </div>
    </div>
  )
}
