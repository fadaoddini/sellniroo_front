'use client'

import React, { useCallback, useMemo, useRef, useState } from 'react'
import axios from 'axios'
import { ChevronDown, Image as ImageIcon, Trash2, Video } from 'lucide-react'
import {
  createDefaultDeepSliderSettings,
  DEEP_UNDER_SOURCES,
  normalizeDeepSliderSettings,
} from '@/config/deepSliderSettings'
import { useAuth } from '@/contexts/AuthContext'
import Config from '@/config/config'
import styles from './AdminWeb.module.css'

function Toggle({ checked, onChange, label }) {
  return (
    <label className={styles.wsRow}>
      <span className={styles.wsRowText}>
        <span>{label}</span>
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

function Field({ label, children }) {
  return (
    <label className={styles.wsField}>
      <span>{label}</span>
      {children}
    </label>
  )
}

function ColorRow({ label, value, onChange }) {
  const hex =
    value && /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(value)
      ? value.length === 4
        ? `#${value[1]}${value[1]}${value[2]}${value[2]}${value[3]}${value[3]}`
        : value
      : '#080808'
  return (
    <div className={styles.wsColorRow}>
      <span className={styles.wsColorRowLabel}>{label}</span>
      <div className={styles.wsColorRowControls}>
        <input
          type="color"
          className={styles.wsColorSwatch}
          value={hex}
          onChange={(e) => onChange(e.target.value)}
          aria-label={label}
        />
        <input
          type="text"
          className={styles.wsColorHex}
          dir="ltr"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </div>
  )
}

function Accordion({ title, open, onToggle, children }) {
  return (
    <div className={styles.wsBlock} style={{ padding: '0.45rem 0.55rem' }}>
      <button
        type="button"
        className={styles.wsLabelRow}
        onClick={onToggle}
        style={{
          width: '100%',
          background: 'none',
          border: 0,
          padding: 0,
          cursor: 'pointer',
          marginBottom: open ? '0.45rem' : 0,
        }}
      >
        <strong style={{ fontSize: '0.78rem' }}>{title}</strong>
        <ChevronDown
          size={14}
          style={{
            transform: open ? 'rotate(180deg)' : 'none',
            transition: 'transform 0.15s ease',
          }}
        />
      </button>
      {open ? children : null}
    </div>
  )
}

function UnderMediaDropZone({ kind, src, onChange, onClear }) {
  const { getAuthHeaders } = useAuth()
  const inputRef = useRef(null)
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const isVideo = kind === 'video'

  const uploadFile = useCallback(
    async (file) => {
      if (!file) return
      setError('')
      setUploading(true)
      try {
        const fd = new FormData()
        fd.append('upload', file)
        const headers = { ...getAuthHeaders() }
        delete headers['Content-Type']
        const res = await axios.post(
          `${Config.baseUrl}/api/news/upload-rebo-media/`,
          fd,
          { headers },
        )
        const rawPath = res.data?.path || ''
        const rawUrl = res.data?.url || ''
        let nextUrl = rawPath || rawUrl
        if (nextUrl && /^https?:\/\//i.test(nextUrl)) {
          try {
            const u = new URL(nextUrl)
            if (u.pathname.startsWith('/media/')) nextUrl = u.pathname
          } catch {
            /* keep */
          }
        }
        if (!nextUrl) throw new Error('آدرس فایل برنگشت')
        const nextKind =
          file.type?.startsWith('video/') ||
          /\.(mp4|webm|mov)(\?|$)/i.test(file.name || nextUrl)
            ? 'video'
            : 'image'
        onChange({ under_media_src: nextUrl, under_media_kind: nextKind })
      } catch (err) {
        setError(
          err?.response?.data?.error ||
            err?.message ||
            'آپلود ناموفق بود',
        )
      } finally {
        setUploading(false)
      }
    },
    [getAuthHeaders, onChange],
  )

  return (
    <div className={styles.wsStack}>
      <div
        style={{
          border: `2px dashed ${dragging ? '#16a34a' : 'rgba(0,0,0,0.18)'}`,
          borderRadius: 12,
          padding: '0.85rem',
          background: dragging ? 'rgba(22,163,74,0.06)' : 'rgba(0,0,0,0.02)',
          textAlign: 'center',
          cursor: uploading ? 'wait' : 'pointer',
        }}
        onClick={() => !uploading && inputRef.current?.click()}
        onDragEnter={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={(e) => {
          e.preventDefault()
          setDragging(false)
        }}
        onDrop={(e) => {
          e.preventDefault()
          setDragging(false)
          const file = e.dataTransfer?.files?.[0]
          if (file) uploadFile(file)
        }}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click()
        }}
      >
        {isVideo ? (
          <Video size={22} style={{ marginBottom: 6, opacity: 0.7 }} />
        ) : (
          <ImageIcon size={22} style={{ marginBottom: 6, opacity: 0.7 }} />
        )}
        <div style={{ fontSize: 13, fontWeight: 700 }}>
          {uploading
            ? 'در حال آپلود…'
            : isVideo
              ? 'ویدیو را اینجا رها کنید'
              : 'تصویر را اینجا رها کنید'}
        </div>
        <div style={{ fontSize: 11, opacity: 0.65, marginTop: 4 }}>
          یا کلیک کنید ·{' '}
          {isVideo ? 'mp4 / webm / mov' : 'jpg / png / webp / gif'}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept={
            isVideo
              ? 'video/*,.mp4,.webm,.mov'
              : 'image/*,.jpg,.jpeg,.png,.webp,.gif'
          }
          hidden
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) uploadFile(file)
            e.target.value = ''
          }}
        />
      </div>
      {error ? (
        <p className={styles.wsHint} style={{ color: '#dc2626' }}>
          {error}
        </p>
      ) : null}
      {src ? (
        <div className={styles.wsLabelRow}>
          <span className={styles.wsMiniLabel} dir="ltr" style={{ fontSize: 11 }}>
            {src}
          </span>
          <button
            type="button"
            className={styles.wsTinyBtn}
            onClick={onClear}
            aria-label="حذف مدیا"
          >
            <Trash2 size={12} />
          </button>
        </div>
      ) : null}
    </div>
  )
}

export default function WidgetDeepSliderSettings({ settings: raw, onChange }) {
  const s = useMemo(
    () => normalizeDeepSliderSettings(raw || createDefaultDeepSliderSettings()),
    [raw],
  )
  const [openMotion, setOpenMotion] = useState(false)

  const patch = (partial) => onChange?.(partial)

  return (
    <div className={styles.wsMinimal}>
      <p className={styles.wsHint}>
        انتخاب کن زیر کلمه REBO چه چیزی دیده شود: تصویر/ویدیو، یا انیمیشن
        مدرسه / ربو (ویجت مربوط را دقیقاً زیر این اسلایدر بگذار).
      </p>

      <div className={styles.wsStack}>
        <Field label="متن ماسک">
          <input
            className={styles.wsInput}
            dir="ltr"
            value={s.mask_text}
            onChange={(e) => patch({ mask_text: e.target.value })}
            placeholder="REBO"
          />
        </Field>

        <p className={styles.wsMiniLabel} style={{ margin: '0.15rem 0' }}>
          محتوای زیر REBO
        </p>
        <div
          className={styles.wsSeg}
          style={{
            gridTemplateColumns: `repeat(${DEEP_UNDER_SOURCES.length}, 1fr)`,
          }}
        >
          {DEEP_UNDER_SOURCES.map((opt) => {
            const on = s.under_source === opt.id
            return (
              <button
                key={opt.id}
                type="button"
                className={`${styles.wsSegBtn} ${on ? styles.wsSegBtnActive : ''}`}
                onClick={() => patch({ under_source: opt.id })}
              >
                {opt.label}
              </button>
            )
          })}
        </div>

        {s.under_source === 'media' ? (
          <>
            <Field label="نوع مدیا">
              <select
                className={styles.wsSelect}
                value={s.under_media_kind}
                onChange={(e) => patch({ under_media_kind: e.target.value })}
              >
                <option value="image">تصویر</option>
                <option value="video">ویدیو</option>
              </select>
            </Field>
            <UnderMediaDropZone
              kind={s.under_media_kind}
              src={s.under_media_src}
              onChange={(partial) => patch(partial)}
              onClear={() => patch({ under_media_src: '' })}
            />
            <Field
              label={
                s.under_media_kind === 'video'
                  ? 'آدرس ویدیو (زیر کلمه)'
                  : 'آدرس تصویر (زیر کلمه)'
              }
            >
              <input
                className={styles.wsInput}
                dir="ltr"
                value={s.under_media_src}
                onChange={(e) => {
                  const src = e.target.value
                  const kind =
                    s.under_media_kind === 'video' ||
                    /\.(mp4|webm|mov)(\?|$)/i.test(src)
                      ? 'video'
                      : 'image'
                  patch({ under_media_src: src, under_media_kind: kind })
                }}
                placeholder={
                  s.under_media_kind === 'video'
                    ? '/media/…/hero.mp4'
                    : '/media/…/hero.jpg'
                }
              />
            </Field>
            {s.under_media_src ? (
              <Field label="نحوه نمایش مدیا">
                <select
                  className={styles.wsSelect}
                  value={s.under_media_fit}
                  onChange={(e) => patch({ under_media_fit: e.target.value })}
                >
                  <option value="cover">پر کردن صفحه (cover)</option>
                  <option value="contain">جا شدن کامل (contain)</option>
                </select>
              </Field>
            ) : null}
          </>
        ) : (
          <p className={styles.wsHint}>
            {s.under_source === 'school_animation'
              ? 'ویجت «انیمیشن مدرسه» را دقیقاً زیر اسلایدر عمیق بگذار تا از داخل حروف REBO دیده شود.'
              : 'ویجت «انیمیشن ربو» را دقیقاً زیر اسلایدر عمیق بگذار تا از داخل حروف REBO دیده شود.'}
          </p>
        )}

        <ColorRow
          label="رنگ لایه (موقع کلمه)"
          value={s.overlay_start}
          onChange={(v) => patch({ overlay_start: v })}
        />
        <ColorRow
          label="رنگ آسمان (بالای صحنه)"
          value={s.sky_color}
          onChange={(v) => patch({ sky_color: v, overlay_end: v })}
        />
        <ColorRow
          label="رنگ کرم (پایین صحنه)"
          value={s.cream_color}
          onChange={(v) => patch({ cream_color: v })}
        />

        <Field label={`فاصله حروف: ${Math.round(s.letter_spacing * 100)}٪`}>
          <input
            type="range"
            min={0}
            max={0.35}
            step={0.01}
            value={s.letter_spacing}
            onChange={(e) => patch({ letter_spacing: Number(e.target.value) })}
          />
        </Field>
        <Field label={`عرض اولیه: ${Math.round(s.blob_start * 100)}٪`}>
          <input
            type="range"
            min={0.28}
            max={1.05}
            step={0.01}
            value={s.blob_start}
            onChange={(e) => patch({ blob_start: Number(e.target.value) })}
          />
        </Field>
      </div>

      <p className={styles.wsMiniLabel} style={{ margin: '0.85rem 0 0.35rem' }}>
        نمایش عناصر
      </p>
      <div className={styles.wsToggleGrid}>
        <Toggle
          checked={s.show_title}
          onChange={(v) => patch({ show_title: v })}
          label="عنوان"
        />
        {s.show_title ? (
          <Field label="متن عنوان">
            <input
              className={styles.wsInput}
              value={s.title}
              onChange={(e) => patch({ title: e.target.value })}
            />
          </Field>
        ) : null}

        <Toggle
          checked={s.show_subtitle}
          onChange={(v) => patch({ show_subtitle: v })}
          label="زیرعنوان"
        />
        {s.show_subtitle ? (
          <Field label="متن زیرعنوان">
            <textarea
              className={styles.wsInput}
              rows={2}
              value={s.subtitle}
              onChange={(e) => patch({ subtitle: e.target.value })}
            />
          </Field>
        ) : null}

        <Toggle
          checked={s.show_brand}
          onChange={(v) => patch({ show_brand: v })}
          label="برند گوشه"
        />
        {s.show_brand ? (
          <Field label="متن برند">
            <input
              className={styles.wsInput}
              value={s.brand}
              onChange={(e) => patch({ brand: e.target.value })}
            />
          </Field>
        ) : null}

        <Toggle
          checked={s.show_cta}
          onChange={(v) => patch({ show_cta: v })}
          label="دکمه"
        />
        {s.show_cta ? (
          <>
            <Field label="متن دکمه">
              <input
                className={styles.wsInput}
                value={s.cta_label}
                onChange={(e) => patch({ cta_label: e.target.value })}
              />
            </Field>
            <Field label="لینک دکمه">
              <input
                className={styles.wsInput}
                dir="ltr"
                value={s.cta_href}
                onChange={(e) => patch({ cta_href: e.target.value })}
              />
            </Field>
          </>
        ) : null}

        <Toggle
          checked={s.show_scroll_hint}
          onChange={(v) => patch({ show_scroll_hint: v })}
          label="راهنمای اسکرول"
        />
        {s.show_scroll_hint ? (
          <Field label="متن راهنما">
            <input
              className={styles.wsInput}
              value={s.scroll_hint}
              onChange={(e) => patch({ scroll_hint: e.target.value })}
            />
          </Field>
        ) : null}

        <Toggle
          checked={s.show_progress}
          onChange={(v) => patch({ show_progress: v })}
          label="نوار پیشرفت"
        />
        <Toggle
          checked={s.full_bleed}
          onChange={(v) => patch({ full_bleed: v })}
          label="تمام‌عرض"
        />
        <Toggle
          checked={s.show_on_desktop}
          onChange={(v) => patch({ show_on_desktop: v })}
          label="نمایش دسکتاپ"
        />
        <Toggle
          checked={s.show_on_mobile}
          onChange={(v) => patch({ show_on_mobile: v })}
          label="نمایش موبایل"
        />
      </div>

      <div className={styles.wsStack} style={{ marginTop: '0.75rem' }}>
        <Accordion
          title="حرکت و زوم"
          open={openMotion}
          onToggle={() => setOpenMotion((v) => !v)}
        >
          <div className={styles.wsStack}>
            <Field label={`ارتفاع اسکرول: ${s.scroll_vh}vh`}>
              <input
                type="range"
                min={140}
                max={620}
                step={10}
                value={s.scroll_vh}
                onChange={(e) => patch({ scroll_vh: Number(e.target.value) })}
              />
            </Field>
            <Field label={`زوم خروج از صفحه: ${s.blob_end.toFixed(1)}x`}>
              <input
                type="range"
                min={5}
                max={32}
                step={0.5}
                value={s.blob_end}
                onChange={(e) => patch({ blob_end: Number(e.target.value) })}
              />
            </Field>
            <Field label={`نرمی لبه: ${s.feather}`}>
              <input
                type="range"
                min={0}
                max={48}
                step={1}
                value={s.feather}
                onChange={(e) => patch({ feather: Number(e.target.value) })}
              />
            </Field>
            <Field label={`نقطه invert: ${Math.round(s.invert_at * 100)}٪`}>
              <input
                type="range"
                min={0.15}
                max={0.85}
                step={0.01}
                value={s.invert_at}
                onChange={(e) => patch({ invert_at: Number(e.target.value) })}
              />
            </Field>
            <Toggle
              checked={s.mouse_follow}
              onChange={(v) => patch({ mouse_follow: v })}
              label="دنبال‌کردن موس"
            />
            <Toggle
              checked={s.auto_demo}
              onChange={(v) => patch({ auto_demo: v })}
              label="دمو خودکار"
            />
          </div>
        </Accordion>
      </div>
    </div>
  )
}
