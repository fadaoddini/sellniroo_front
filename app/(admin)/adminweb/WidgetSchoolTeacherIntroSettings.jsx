'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import axios from 'axios'
import { Image as ImageIcon, Plus, Trash2 } from 'lucide-react'
import Config from '@/config/config'
import { useAuth } from '@/contexts/AuthContext'
import schoolService from '@/components/School/services/schoolService'
import {
  createDefaultSchoolTeacherIntroSettings,
  mapApiTeacherToIntroItem,
  normalizeSchoolTeacherIntroSettings,
  normalizeTeacherIntroItem,
  SCHOOL_TEACHER_INTRO_ARROWS_SIDE,
  SCHOOL_TEACHER_INTRO_SIDE_OPTIONS,
} from '@/config/schoolTeacherIntroWidgetSettings'
import styles from './AdminWeb.module.css'

/** پیش‌نمایش: /media از همان مبدأ (ری‌رایت Next) تا حتماً لود شود */
function resolveImagePreview(url) {
  if (!url) return ''
  const raw = String(url).trim()
  if (!raw) return ''
  if (
    raw.startsWith('data:') ||
    raw.startsWith('blob:') ||
    raw.startsWith('http://') ||
    raw.startsWith('https://')
  ) {
    return raw
  }
  if (raw.startsWith('/media/') || raw.startsWith('/images/')) return raw
  if (raw.startsWith('media/')) return `/${raw}`
  if (raw.startsWith('/')) return raw
  return `/media/${raw.replace(/^\/+/, '')}`
}

function isAllowedImageFile(file) {
  if (!file) return false
  if (file.type?.startsWith('image/')) return true
  return /\.(jpe?g|png|webp|gif)$/i.test(file.name || '')
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result || ''))
    reader.onerror = () => reject(new Error('خواندن فایل ناموفق بود'))
    reader.readAsDataURL(file)
  })
}

/** URL آپلود را برای <img> قابل‌اطمینان می‌کند (ترجیحاً مطلق به API) */
function normalizeUploadedImageUrl(raw) {
  let nextUrl = String(raw || '').trim()
  if (!nextUrl) return ''
  if (nextUrl.startsWith('data:') || nextUrl.startsWith('blob:')) return nextUrl
  if (/^https?:\/\//i.test(nextUrl)) return nextUrl
  const base = String(Config.baseUrl || '').replace(/\/$/, '')
  if (nextUrl.startsWith('/media/') || nextUrl.startsWith('/images/')) {
    return base ? `${base}${nextUrl}` : nextUrl
  }
  if (nextUrl.startsWith('media/')) {
    return base ? `${base}/${nextUrl}` : `/${nextUrl}`
  }
  if (nextUrl.startsWith('/')) {
    return base ? `${base}${nextUrl}` : nextUrl
  }
  return base ? `${base}/media/${nextUrl.replace(/^\/+/, '')}` : nextUrl
}

function SideImageDropZone({ value, onChange, onClear }) {
  const { getAuthHeaders } = useAuth()
  const inputRef = useRef(null)
  const uploadGenRef = useRef(0)
  const busyRef = useRef(false)
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const preview = resolveImagePreview(value)

  const uploadFile = useCallback(
    async (file) => {
      if (!file || busyRef.current) return
      if (!isAllowedImageFile(file)) {
        setError('فقط تصویر (PNG / JPG / WEBP / GIF)')
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('حجم فایل نباید بیشتر از ۵ مگابایت باشد')
        return
      }

      const gen = ++uploadGenRef.current
      busyRef.current = true
      setError('')
      setUploading(true)

      /* ۱) فوراً در settings بنویس — تا رندر بعدی تصویر را پاک نکند */
      let stickyPreview = ''
      try {
        stickyPreview = await readFileAsDataUrl(file)
        if (gen !== uploadGenRef.current) return
        if (stickyPreview) onChange(stickyPreview)
      } catch {
        stickyPreview = ''
      }

      try {
        const fd = new FormData()
        fd.append('upload', file)
        const headers = { ...getAuthHeaders() }
        delete headers['Content-Type']
        const res = await axios.post(
          `${Config.baseUrl}/api/news/upload-image/`,
          fd,
          { headers },
        )
        if (gen !== uploadGenRef.current) return
        const nextUrl = normalizeUploadedImageUrl(
          res.data?.url ||
            res.data?.path ||
            res.data?.file ||
            res.data?.image ||
            '',
        )
        if (!nextUrl) throw new Error('آدرس تصویر برنگشت')
        /* ۲) فقط بعد از لود موفق تصویر سرور جایگزین کن — وگرنه data URL می‌ماند و «محو» نمی‌شود */
        const ok = await new Promise((resolve) => {
          const probe = new window.Image()
          probe.onload = () => resolve(true)
          probe.onerror = () => resolve(false)
          probe.src = nextUrl
        })
        if (gen !== uploadGenRef.current) return
        if (ok) {
          onChange(nextUrl)
          setError('')
        } else if (stickyPreview) {
          setError('فایل روی سرور ذخیره شد ولی پیش‌نمایش از سرور لود نشد — تصویر محلی مانده')
        } else {
          onChange(nextUrl)
        }
      } catch (err) {
        if (gen !== uploadGenRef.current) return
        const apiErr =
          err?.response?.data?.error ||
          err?.response?.data?.detail ||
          err?.message
        if (stickyPreview) {
          setError(
            typeof apiErr === 'string' && apiErr
              ? `آپلود سرور: ${apiErr} — تصویر فعلاً محلی است`
              : '',
          )
        } else {
          setError(
            typeof apiErr === 'string' ? apiErr : 'آپلود ناموفق بود',
          )
        }
      } finally {
        if (gen === uploadGenRef.current) {
          busyRef.current = false
          setUploading(false)
        }
      }
    },
    [getAuthHeaders, onChange],
  )

  const stopDnd = (e) => {
    e.preventDefault()
    e.stopPropagation()
  }

  return (
    <div className={styles.wsStack} style={{ gap: 6 }}>
      <div
        style={{
          position: 'relative',
          border: `2px dashed ${dragging ? '#16a34a' : 'rgba(0,0,0,0.18)'}`,
          borderRadius: 12,
          padding: preview ? '0.5rem' : '0.75rem',
          background: dragging ? 'rgba(22,163,74,0.06)' : 'rgba(0,0,0,0.02)',
          textAlign: 'center',
          cursor: uploading ? 'wait' : 'pointer',
          overflow: 'hidden',
          minHeight: preview ? 120 : undefined,
        }}
        onClick={() => {
          if (!uploading) inputRef.current?.click()
        }}
        onDragEnter={(e) => {
          stopDnd(e)
          setDragging(true)
        }}
        onDragOver={(e) => {
          stopDnd(e)
          if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy'
          setDragging(true)
        }}
        onDragLeave={(e) => {
          stopDnd(e)
          setDragging(false)
        }}
        onDrop={(e) => {
          stopDnd(e)
          setDragging(false)
          const file = e.dataTransfer?.files?.[0]
          if (file) uploadFile(file)
        }}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            inputRef.current?.click()
          }
        }}
      >
        {/* input مخفی — نه overlay، تا drop دوبار فایر نشود و تصویر پاک نشود */}
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp,image/gif,.jpg,.jpeg,.png,.webp,.gif"
          disabled={uploading}
          hidden
          onChange={(e) => {
            const file = e.target.files?.[0]
            e.target.value = ''
            if (file) uploadFile(file)
          }}
        />
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={preview}
            alt=""
            style={{
              display: 'block',
              margin: '0 auto',
              maxHeight: 160,
              maxWidth: '100%',
              width: 'auto',
              objectFit: 'contain',
              borderRadius: 10,
              pointerEvents: 'none',
              background: 'rgba(0,0,0,0.04)',
            }}
          />
        ) : (
          <>
            <ImageIcon size={20} style={{ marginBottom: 4, opacity: 0.7 }} />
            <div style={{ fontSize: 13, fontWeight: 700 }}>
              {uploading ? 'در حال آپلود…' : 'تصویر را اینجا رها کنید'}
            </div>
            <div style={{ fontSize: 11, opacity: 0.65, marginTop: 2 }}>
              یا کلیک کنید · jpg / png / webp / gif
            </div>
          </>
        )}
        {preview && uploading ? (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(255,255,255,0.55)',
              fontSize: 12,
              fontWeight: 700,
              zIndex: 1,
              pointerEvents: 'none',
            }}
          >
            در حال آپلود…
          </div>
        ) : null}
      </div>
      {error ? (
        <p className={styles.wsHint} style={{ color: '#dc2626' }}>
          {error}
        </p>
      ) : null}
      {preview ? (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 10,
          }}
        >
          <span className={styles.wsHint} style={{ margin: 0 }}>
            {uploading
              ? 'در حال ذخیره…'
              : 'تصویر انتخاب شد — برای عوض کردن کلیک یا رها کنید'}
          </span>
          <button
            type="button"
            className={styles.wsTinyBtn}
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              uploadGenRef.current += 1
              setError('')
              setUploading(false)
              if (typeof onClear === 'function') onClear()
              else onChange('')
            }}
          >
            حذف
          </button>
        </div>
      ) : null}
    </div>
  )
}

function Toggle({ checked, onChange, label, hint }) {
  return (
    <label className={styles.wsRow}>
      <span className={styles.wsRowText}>
        <span>{label}</span>
        {hint ? <small>{hint}</small> : null}
      </span>
      <span className={`${styles.wsSwitch} ${checked ? styles.wsSwitchOn : ''}`}>
        <input
          type="checkbox"
          checked={!!checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <i />
      </span>
    </label>
  )
}

function Field({ label, value, onChange, placeholder }) {
  return (
    <label className={styles.wsField}>
      <span>{label}</span>
      <input
        type="text"
        value={value ?? ''}
        placeholder={placeholder || ''}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  )
}

function PxField({ label, value, onChange, min = 0, max = 100 }) {
  return (
    <label className={styles.wsField}>
      <span>{label}</span>
      <input
        type="number"
        value={value ?? 0}
        min={min}
        max={max}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </label>
  )
}

function hexForPicker(color, fallback = '#8e0413') {
  const c = String(color || '').trim()
  if (/^#[0-9a-fA-F]{6}$/.test(c)) return c
  if (/^#[0-9a-fA-F]{3}$/.test(c)) {
    return `#${c[1]}${c[1]}${c[2]}${c[2]}${c[3]}${c[3]}`
  }
  return fallback
}

/** ردیف فشردهٔ رنگ: سواچ + شفاف + اسلایدر */
function ColorChip({
  label,
  color,
  opacity = 100,
  onColorChange,
  onOpacityChange,
  allowTransparent = true,
  fallbackHex = '#8e0413',
}) {
  const isTransparent = String(color || '').trim().toLowerCase() === 'transparent'
  const hasAlpha = typeof onOpacityChange === 'function'
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr auto',
        gap: '4px 8px',
        alignItems: 'center',
        padding: '6px 8px',
        borderRadius: 10,
        background: 'rgba(0,0,0,0.03)',
        border: '1px solid rgba(0,0,0,0.06)',
      }}
    >
      <span style={{ fontSize: 12, fontWeight: 600, gridColumn: '1 / -1' }}>
        {label}
      </span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
        <input
          type="color"
          disabled={isTransparent}
          value={hexForPicker(isTransparent ? fallbackHex : color, fallbackHex)}
          onChange={(e) => {
            const v = e.target.value
            onColorChange(v)
            if (hasAlpha && (isTransparent || !(opacity > 0))) {
              onOpacityChange(100)
            }
          }}
          title={isTransparent ? 'transparent' : color}
          style={{
            width: 28,
            height: 28,
            padding: 0,
            border: '1px solid rgba(0,0,0,0.12)',
            borderRadius: 8,
            cursor: isTransparent ? 'not-allowed' : 'pointer',
            opacity: isTransparent ? 0.35 : 1,
            background: 'transparent',
            flexShrink: 0,
          }}
        />
        {allowTransparent ? (
          <button
            type="button"
            onClick={() => {
              if (isTransparent) {
                onColorChange(fallbackHex)
                if (hasAlpha) onOpacityChange(100)
              } else {
                onColorChange('transparent')
                if (hasAlpha) onOpacityChange(0)
              }
            }}
            title="شفاف / رنگی"
            style={{
              fontSize: 10,
              fontWeight: 700,
              padding: '4px 7px',
              borderRadius: 999,
              border: '1px solid rgba(0,0,0,0.12)',
              background: isTransparent ? 'rgba(22,163,74,0.12)' : '#fff',
              color: isTransparent ? '#15803d' : '#444',
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            شفاف
          </button>
        ) : null}
      </div>
      {hasAlpha ? (
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            justifyContent: 'flex-end',
            opacity: isTransparent ? 0.4 : 1,
            fontSize: 10,
            fontWeight: 600,
          }}
        >
          <input
            type="range"
            min={0}
            max={100}
            disabled={isTransparent}
            value={isTransparent ? 0 : opacity ?? 100}
            onChange={(e) => onOpacityChange(Number(e.target.value))}
            style={{ width: 72 }}
          />
          <span dir="ltr" style={{ width: 28, textAlign: 'end' }}>
            {isTransparent ? 0 : opacity ?? 100}
          </span>
        </label>
      ) : (
        <span />
      )}
    </div>
  )
}

export default function WidgetSchoolTeacherIntroSettings({
  settings: raw,
  onChange,
}) {
  const settings = normalizeSchoolTeacherIntroSettings({
    ...createDefaultSchoolTeacherIntroSettings(),
    ...(raw || {}),
  })
  const [catalog, setCatalog] = useState([])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await schoolService.listTeachers()
        if (cancelled || !res?.success) return
        const list = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data?.results)
            ? res.data.results
            : []
        setCatalog(list.filter((t) => t && t.is_active !== false))
      } catch {
        /* ignore */
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const patch = (partial) => {
    if (typeof onChange === 'function') onChange(partial)
  }

  const items = Array.isArray(settings.items) ? settings.items : []

  const addFromCatalog = (teacherId) => {
    const t = catalog.find((x) => String(x.id) === String(teacherId))
    if (!t) return
    const mapped =
      mapApiTeacherToIntroItem(t, items.length) ||
      normalizeTeacherIntroItem(
        {
          id: t.id,
          name: t.display_name,
          specialty: t.specialty,
          bio: t.bio,
          slug: t.public_slug || '',
          href: t.public_path || (t.public_slug ? `/teachers/${t.public_slug}` : ''),
          avatar: t.avatar_url,
        },
        items.length,
      )
    if (items.some((x) => String(x.id) === String(mapped.id) || (mapped.slug && x.slug === mapped.slug)))
      return
    patch({ items: [...items, mapped], use_demo_data: false })
  }

  const updateItem = (index, partial) => {
    const next = items.map((item, i) =>
      i === index
        ? normalizeTeacherIntroItem({ ...item, ...partial }, i)
        : item,
    )
    patch({ items: next, use_demo_data: next.length ? false : settings.use_demo_data })
  }

  const addBlank = () => {
    const next = [
      ...items,
      normalizeTeacherIntroItem(
        {
          name: `معلم ${items.length + 1}`,
          specialty: 'تخصص',
          bio: '',
          slug: '',
        },
        items.length,
      ),
    ]
    patch({ items: next, use_demo_data: false })
  }

  const removeItem = (index) => {
    const next = items.filter((_, i) => i !== index)
    patch({
      items: next,
      use_demo_data: next.length === 0 ? true : settings.use_demo_data,
    })
  }

  return (
    <div className={styles.wsStack}>
      <p className={styles.paletteHint} style={{ marginTop: 0 }}>
        ریسایکلر معرفی معلم با QR پروفایل عمومی. معلمان دارای پروفایل عمومی را
        از لیست اضافه کنید یا دستی وارد کنید.
      </p>

      <Field
        label="عنوان"
        value={settings.title}
        onChange={(v) => patch({ title: v })}
      />
      <Field
        label="زیرعنوان"
        value={settings.subtitle}
        onChange={(v) => patch({ subtitle: v })}
      />

      <div className={styles.wsToggleGrid}>
        <Toggle
          label="نمایش عنوان"
          checked={settings.show_title !== false}
          onChange={(v) => patch({ show_title: v })}
        />
        <Toggle
          label="نمایش زیرعنوان"
          checked={settings.show_subtitle !== false}
          onChange={(v) => patch({ show_subtitle: v })}
        />
        <Toggle
          label="نمایش QR"
          checked={settings.show_qr !== false}
          onChange={(v) => patch({ show_qr: v })}
        />
        <Toggle
          label="تخصص"
          checked={settings.show_specialty !== false}
          onChange={(v) => patch({ show_specialty: v })}
        />
        <Toggle
          label="بیو"
          checked={settings.show_bio !== false}
          onChange={(v) => patch({ show_bio: v })}
        />
        <Toggle
          label="پیکان‌ها"
          checked={settings.show_arrows !== false}
          onChange={(v) => patch({ show_arrows: v })}
        />
        <Toggle
          label="دادهٔ نمونه"
          checked={settings.use_demo_data !== false}
          onChange={(v) => patch({ use_demo_data: v })}
        />
        <Toggle
          label="تصویر کناری"
          hint="داخل قاب، کنار کارت‌ها"
          checked={settings.show_side_image !== false}
          onChange={(v) => patch({ show_side_image: v })}
        />
        <Toggle
          label="تمام‌عرض"
          checked={settings.section_full !== false}
          onChange={(v) => patch({ section_full: v })}
        />
        <Toggle
          label="موبایل"
          checked={settings.show_on_mobile !== false}
          onChange={(v) => patch({ show_on_mobile: v })}
        />
        <Toggle
          label="دسکتاپ"
          checked={settings.show_on_desktop !== false}
          onChange={(v) => patch({ show_on_desktop: v })}
        />
      </div>

      <p className={`${styles.wsMiniLabel} ${styles.wsMiniLabelSpaced}`}>
        رنگ‌ها
      </p>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 6,
        }}
      >
        <ColorChip
          label="قاب"
          color={settings.color_frame}
          opacity={settings.frame_opacity}
          fallbackHex="#8e0413"
          onColorChange={(v) => patch({ color_frame: v })}
          onOpacityChange={(v) =>
            patch({
              frame_opacity: v,
              ...(v > 0 &&
              String(settings.color_frame).toLowerCase() === 'transparent'
                ? { color_frame: '#8e0413' }
                : {}),
              ...(v <= 0 ? { color_frame: 'transparent' } : {}),
            })
          }
        />
        <ColorChip
          label="بدنه (frameBody)"
          color={settings.color_frame_body}
          opacity={settings.frame_body_opacity}
          fallbackHex="#8e0413"
          onColorChange={(v) => {
            const transparent = String(v || '').toLowerCase() === 'transparent'
            patch({
              color_frame_body: v,
              frame_body_opacity: transparent
                ? 0
                : settings.frame_body_opacity > 0
                  ? settings.frame_body_opacity
                  : 100,
            })
          }}
          onOpacityChange={(v) =>
            patch({
              frame_body_opacity: v,
              ...(v > 0 &&
              String(settings.color_frame_body).toLowerCase() === 'transparent'
                ? { color_frame_body: '#8e0413' }
                : {}),
              ...(v <= 0 ? { color_frame_body: 'transparent' } : {}),
            })
          }
        />
        <ColorChip
          label="متن قاب"
          color={settings.color_frame_text}
          allowTransparent={false}
          fallbackHex="#f8f0f0"
          onColorChange={(v) => patch({ color_frame_text: v })}
        />
        <ColorChip
          label="متن کمرنگ"
          color={settings.color_frame_muted}
          allowTransparent={false}
          fallbackHex="#f8f0f0"
          onColorChange={(v) => patch({ color_frame_muted: v })}
        />
        <ColorChip
          label="کارت"
          color={settings.color_card}
          opacity={settings.card_opacity}
          fallbackHex="#ffffff"
          onColorChange={(v) => patch({ color_card: v })}
          onOpacityChange={(v) =>
            patch({
              card_opacity: v,
              ...(v > 0 &&
              String(settings.color_card).toLowerCase() === 'transparent'
                ? { color_card: '#ffffff' }
                : {}),
              ...(v <= 0 ? { color_card: 'transparent' } : {}),
            })
          }
        />
        <ColorChip
          label="متن کارت"
          color={settings.color_text}
          allowTransparent={false}
          fallbackHex="#111827"
          onColorChange={(v) => patch({ color_text: v })}
        />
        <ColorChip
          label="متن فرعی"
          color={settings.color_muted}
          allowTransparent={false}
          fallbackHex="#6b7280"
          onColorChange={(v) => patch({ color_muted: v })}
        />
        <ColorChip
          label="پیکان"
          color={settings.color_arrow_bg}
          allowTransparent
          fallbackHex="#ffffff"
          onColorChange={(v) => patch({ color_arrow_bg: v })}
        />
        <ColorChip
          label="آیکن پیکان"
          color={settings.color_arrow_text}
          allowTransparent={false}
          fallbackHex="#ffffff"
          onColorChange={(v) => patch({ color_arrow_text: v })}
        />
      </div>

      <p className={`${styles.wsMiniLabel} ${styles.wsMiniLabelSpaced}`}>
        رادیوس بدنه
      </p>
      <div className={styles.wsPxGrid}>
        <PxField
          label="↑ راست"
          value={settings.frame_body_radius_tr}
          onChange={(v) => patch({ frame_body_radius_tr: v })}
          max={80}
        />
        <PxField
          label="↑ چپ"
          value={settings.frame_body_radius_tl}
          onChange={(v) => patch({ frame_body_radius_tl: v })}
          max={80}
        />
        <PxField
          label="↓ راست"
          value={settings.frame_body_radius_br}
          onChange={(v) => patch({ frame_body_radius_br: v })}
          max={80}
        />
        <PxField
          label="↓ چپ"
          value={settings.frame_body_radius_bl}
          onChange={(v) => patch({ frame_body_radius_bl: v })}
          max={80}
        />
      </div>

      <label className={styles.wsField}>
        <span>جای فلش‌ها</span>
        <select
          value={settings.arrows_side || 'end'}
          onChange={(e) => patch({ arrows_side: e.target.value })}
        >
          {SCHOOL_TEACHER_INTRO_ARROWS_SIDE.map((opt) => (
            <option key={opt.id} value={opt.id}>
              {opt.label}
            </option>
          ))}
        </select>
      </label>

      {settings.show_side_image !== false ? (
        <>
          <p className={`${styles.wsMiniLabel} ${styles.wsMiniLabelSpaced}`}>
            پنل تصویر کناری
          </p>
          <SideImageDropZone
            value={settings.side_image}
            onChange={(v) =>
              patch({ side_image: v, show_side_image: true })
            }
            onClear={() => patch({ side_image: '' })}
          />
          <Field
            label="عنوان بالای تصویر (اختیاری)"
            value={settings.side_image_title}
            onChange={(v) => patch({ side_image_title: v })}
            placeholder="خالی = بدون عنوان"
          />
          <label className={styles.wsField}>
            <span>متن زیر تصویر (ریز · اختیاری)</span>
            <textarea
              rows={2}
              value={settings.side_image_caption ?? ''}
              placeholder="می‌توانید با فاصله بنویسید…"
              onChange={(e) => patch({ side_image_caption: e.target.value })}
              style={{ resize: 'vertical', minHeight: 48 }}
            />
          </label>
          <label className={styles.wsField}>
            <span>جای تصویر</span>
            <select
              value={settings.side_image_side || 'right'}
              onChange={(e) => patch({ side_image_side: e.target.value })}
            >
              {SCHOOL_TEACHER_INTRO_SIDE_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>
          <div className={styles.wsPxGrid}>
            <PxField
              label="عرض پنل تصویر"
              value={settings.side_image_width}
              onChange={(v) => patch({ side_image_width: v })}
              min={120}
              max={420}
            />
            <PxField
              label="گردی تصویر"
              value={settings.side_image_radius}
              onChange={(v) => patch({ side_image_radius: v })}
              max={40}
            />
          </div>
        </>
      ) : null}

      <div className={styles.wsPxGrid}>
        <PxField
          label="تعداد"
          value={settings.limit}
          onChange={(v) => patch({ limit: v })}
          min={1}
          max={24}
        />
        <PxField
          label="عرض کارت"
          value={settings.card_width}
          onChange={(v) => patch({ card_width: v })}
          min={140}
          max={320}
        />
        <PxField
          label="اندازه QR"
          value={settings.qr_size}
          onChange={(v) => patch({ qr_size: v })}
          min={48}
          max={140}
        />
        <PxField
          label="فاصله کارت‌ها"
          value={settings.gap}
          onChange={(v) => patch({ gap: v })}
          max={40}
        />
      </div>

      {catalog.length ? (
        <label className={styles.wsField}>
          <span>افزودن از معلمان سایت</span>
          <select
            defaultValue=""
            onChange={(e) => {
              if (e.target.value) {
                addFromCatalog(e.target.value)
                e.target.value = ''
              }
            }}
          >
            <option value="">انتخاب معلم…</option>
            {catalog.map((t) => (
              <option key={t.id} value={t.id}>
                {t.display_name || t.id}
                {t.is_profile_public === false ? ' (عمومی نیست)' : ''}
                {t.public_slug ? ` · ${t.public_slug}` : ''}
              </option>
            ))}
          </select>
        </label>
      ) : null}

      <p className={`${styles.wsMiniLabel} ${styles.wsMiniLabelSpaced}`}>
        معلمان انتخاب‌شده
      </p>
      <div className={styles.wsStack}>
        {items.map((item, index) => (
          <div key={item.id || index} className={styles.wsAcc}>
            <div className={styles.wsAccHead} style={{ cursor: 'default' }}>
              <span>
                {index + 1}. {item.name}
              </span>
              <button
                type="button"
                className={styles.themeChipDel}
                title="حذف"
                onClick={() => removeItem(index)}
              >
                <Trash2 size={12} />
              </button>
            </div>
            <div className={styles.wsAccBody}>
              <Field
                label="نام"
                value={item.name}
                onChange={(v) => updateItem(index, { name: v })}
              />
              <Field
                label="تخصص"
                value={item.specialty}
                onChange={(v) => updateItem(index, { specialty: v })}
              />
              <Field
                label="بیو"
                value={item.bio}
                onChange={(v) => updateItem(index, { bio: v })}
              />
              <Field
                label="slug پروفایل"
                value={item.slug}
                onChange={(v) =>
                  updateItem(index, {
                    slug: v,
                    href: v ? `/teachers/${v}` : item.href,
                  })
                }
                placeholder="مثلاً sara-mousavi"
              />
              <Field
                label="لینک"
                value={item.href}
                onChange={(v) => updateItem(index, { href: v })}
              />
              <Field
                label="عکس (URL)"
                value={item.avatar}
                onChange={(v) => updateItem(index, { avatar: v })}
              />
            </div>
          </div>
        ))}
        <button type="button" className={styles.themeChipAdd} onClick={addBlank}>
          <Plus size={14} />
          افزودن دستی
        </button>
      </div>
    </div>
  )
}
