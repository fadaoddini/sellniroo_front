'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { Check, ImagePlus, Plus, Video, X } from 'lucide-react'
import PersianDatePicker from '@/components/common/PersianDatePicker'
import CategoryPicker, { useCategoryLabel } from './CategoryPicker'
import styles from './ShopPanel.module.css'

export const PRESET_COLORS = [
  { name: 'قرمز', hex: '#e11d48' },
  { name: 'آبی', hex: '#2563eb' },
  { name: 'سبز', hex: '#16a34a' },
  { name: 'مشکی', hex: '#171717' },
  { name: 'سفید', hex: '#f5f5f5' },
  { name: 'زرد', hex: '#eab308' },
  { name: 'نارنجی', hex: '#ea580c' },
  { name: 'بنفش', hex: '#7c3aed' },
  { name: 'صورتی', hex: '#db2777' },
  { name: 'خاکستری', hex: '#737373' },
  { name: 'قهوه‌ای', hex: '#92400e' },
  { name: 'طلایی', hex: '#ca8a04' },
  { name: 'فیروزه‌ای', hex: '#0d9488' },
  { name: 'نوک‌مدادی', hex: '#334155' },
]

export const PRESET_SIZES = [
  'XS',
  'S',
  'M',
  'L',
  'XL',
  'XXL',
  '۳۸',
  '۳۹',
  '۴۰',
  '۴۱',
  '۴۲',
  '۴۳',
  '۴۴',
  '۴۵',
]

const MAX_VIDEO_BYTES = 50 * 1024 * 1024

function Dialog({ open, title, onClose, children, footer }) {
  useEffect(() => {
    if (!open) return undefined
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.()
    }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open, onClose])

  if (!open) return null
  return (
    <div className={styles.dialogRoot} role="dialog" aria-modal="true">
      <button
        type="button"
        className={styles.dialogBackdrop}
        aria-label="بستن"
        onClick={onClose}
      />
      <div className={styles.dialogCard}>
        <div className={styles.dialogHead}>
          <h4>{title}</h4>
          <button type="button" className={styles.iconRound} onClick={onClose}>
            <X size={15} />
          </button>
        </div>
        <div className={styles.dialogBody}>{children}</div>
        {footer ? <div className={styles.dialogFoot}>{footer}</div> : null}
      </div>
    </div>
  )
}

export default function ProductFormExtras({
  form,
  setForm,
  categories = [],
  selectedColors = [],
  setSelectedColors,
  selectedSizes = [],
  setSelectedSizes,
  videoFile,
  setVideoFile,
  posterFile,
  setPosterFile,
}) {
  const [colorDialog, setColorDialog] = useState(false)
  const [sizeDialog, setSizeDialog] = useState(false)
  const [categoryDialog, setCategoryDialog] = useState(false)
  const [draftColors, setDraftColors] = useState([])
  const [draftSizes, setDraftSizes] = useState([])
  const [customHex, setCustomHex] = useState('#3b82f6')
  const [customColorName, setCustomColorName] = useState('')
  const [customSize, setCustomSize] = useState('')
  const [mediaError, setMediaError] = useState('')

  const videoPreview = useMemo(
    () => (videoFile ? URL.createObjectURL(videoFile) : ''),
    [videoFile],
  )
  const posterPreview = useMemo(
    () => (posterFile ? URL.createObjectURL(posterFile) : ''),
    [posterFile],
  )

  useEffect(() => {
    return () => {
      if (videoPreview) URL.revokeObjectURL(videoPreview)
      if (posterPreview) URL.revokeObjectURL(posterPreview)
    }
  }, [videoPreview, posterPreview])

  const categoryLabel = useCategoryLabel(categories, form.category)

  const openColorDialog = () => {
    setDraftColors(selectedColors.map((c) => ({ ...c })))
    setCustomHex('#3b82f6')
    setCustomColorName('')
    setColorDialog(true)
  }

  const openSizeDialog = () => {
    setDraftSizes([...selectedSizes])
    setCustomSize('')
    setSizeDialog(true)
  }

  const toggleDraftColor = (item) => {
    setDraftColors((prev) => {
      const exists = prev.some((c) => c.name === item.name)
      if (exists) return prev.filter((c) => c.name !== item.name)
      return [...prev, { name: item.name, hex: item.hex }]
    })
  }

  const addCustomColor = () => {
    const name = (customColorName || '').trim() || `رنگ ${customHex}`
    setDraftColors((prev) => {
      if (prev.some((c) => c.name === name || c.hex === customHex)) return prev
      return [...prev, { name, hex: customHex }]
    })
    setCustomColorName('')
  }

  const toggleDraftSize = (size) => {
    setDraftSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size],
    )
  }

  const addCustomSize = () => {
    const s = (customSize || '').trim()
    if (!s) return
    setDraftSizes((prev) => (prev.includes(s) ? prev : [...prev, s]))
    setCustomSize('')
  }

  const onPickVideo = (file) => {
    setMediaError('')
    if (!file) return
    if (file.size > MAX_VIDEO_BYTES) {
      setMediaError('حجم ویدیو نباید بیشتر از ۵۰ مگابایت باشد')
      return
    }
    if (!file.type.startsWith('video/') && !/\.(mp4|webm|mov|mkv)$/i.test(file.name)) {
      setMediaError('فرمت ویدیو معتبر نیست')
      return
    }
    setVideoFile(file)
  }

  const onPickPoster = (file) => {
    setMediaError('')
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setMediaError('تصویر شاخص باید فایل تصویری باشد')
      return
    }
    setPosterFile(file)
  }

  return (
    <>
      <div className={styles.attrPanel} dir="rtl">
        <div className={styles.attrPanelHead}>
          <div>
            <p className={styles.fieldGroupTitle}>ویژگی‌ها و رسانه</p>
            <p className={styles.attrHint}>
              گزینه‌ها را روشن کنید و از دیالوگ، انتخاب کنید
            </p>
          </div>
        </div>

        <div className={styles.pickerField}>
          <span className={styles.editorLabel}>دسته‌بندی</span>
          <button
            type="button"
            className={styles.pickerTrigger}
            onClick={() => setCategoryDialog(true)}
          >
            <span className={categoryLabel ? styles.pickerPath : undefined}>
              {categoryLabel || 'انتخاب دسته نهایی…'}
            </span>
            <Plus size={15} />
          </button>
          <p className={styles.fileHint}>
            فقط آخرین سطح درخت (مثلاً برند یا نوع محصول) قابل انتخاب است
          </p>
        </div>

        <div className={styles.featureList}>
          <div className={styles.featureCard}>
            <label className={styles.switchRow}>
              <input
                type="checkbox"
                checked={!!form.has_colors}
                onChange={(e) => {
                  const on = e.target.checked
                  setForm((f) => ({ ...f, has_colors: on }))
                  if (on) openColorDialog()
                  else setSelectedColors([])
                }}
              />
              <span>دارای رنگ</span>
            </label>
            {form.has_colors ? (
              <div className={styles.featureBody}>
                <div className={styles.swatchRow}>
                  {selectedColors.map((c) => (
                    <span
                      key={c.name}
                      className={styles.swatch}
                      title={c.name}
                      style={{ background: c.hex }}
                    />
                  ))}
                  <button
                    type="button"
                    className={styles.addSwatchBtn}
                    onClick={openColorDialog}
                    title="انتخاب رنگ"
                  >
                    <Plus size={14} />
                  </button>
                </div>
                <p className={styles.fileHint}>
                  {selectedColors.length
                    ? selectedColors.map((c) => c.name).join('، ')
                    : 'هنوز رنگی انتخاب نشده'}
                </p>
              </div>
            ) : null}
          </div>

          <div className={styles.featureCard}>
            <label className={styles.switchRow}>
              <input
                type="checkbox"
                checked={!!form.has_sizes}
                onChange={(e) => {
                  const on = e.target.checked
                  setForm((f) => ({ ...f, has_sizes: on }))
                  if (on) openSizeDialog()
                  else setSelectedSizes([])
                }}
              />
              <span>دارای سایز</span>
            </label>
            {form.has_sizes ? (
              <div className={styles.featureBody}>
                <div className={styles.sizeChipRow}>
                  {selectedSizes.map((s) => (
                    <span key={s} className={styles.sizeChipOn}>
                      {s}
                    </span>
                  ))}
                  <button
                    type="button"
                    className={styles.addSwatchBtn}
                    onClick={openSizeDialog}
                    title="انتخاب سایز"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            ) : null}
          </div>

          <div className={styles.featureCard}>
            <label className={styles.switchRow}>
              <input
                type="checkbox"
                checked={!!form.is_virtual}
                onChange={(e) =>
                  setForm((f) => ({ ...f, is_virtual: e.target.checked }))
                }
              />
              <span>محصول مجازی (غیر فیزیکی)</span>
            </label>
          </div>

          <div className={styles.featureCard}>
            <label className={styles.switchRow}>
              <input
                type="checkbox"
                checked={!!form.has_warranty}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    has_warranty: e.target.checked,
                    warranty_until: e.target.checked ? f.warranty_until : '',
                  }))
                }
              />
              <span>دارای ضمانت با تاریخ</span>
            </label>
            {form.has_warranty ? (
              <div className={styles.featureBody}>
                <label className={styles.jalaliField}>
                  <span>تاریخ پایان ضمانت</span>
                  <PersianDatePicker
                    value={form.warranty_until || ''}
                    onChange={(date) =>
                      setForm((f) => ({ ...f, warranty_until: date || '' }))
                    }
                    placeholder="انتخاب تاریخ شمسی"
                  />
                </label>
              </div>
            ) : null}
          </div>

          <div className={styles.featureCard}>
            <label className={styles.switchRow}>
              <input
                type="checkbox"
                checked={!!form.is_featured}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    is_featured: e.target.checked,
                    featured_until: e.target.checked ? f.featured_until : '',
                  }))
                }
              />
              <span>محصول ویژه</span>
            </label>
            {form.is_featured ? (
              <div className={styles.featureBody}>
                <label className={styles.jalaliField}>
                  <span>ویژه تا تاریخ (اختیاری)</span>
                  <PersianDatePicker
                    value={form.featured_until || ''}
                    onChange={(date) =>
                      setForm((f) => ({ ...f, featured_until: date || '' }))
                    }
                    placeholder="بدون محدودیت زمانی"
                  />
                </label>
              </div>
            ) : null}
          </div>
        </div>

        <div className={styles.videoBlock}>
          <p className={styles.editorLabel}>ویدیو معرفی</p>
          <p className={styles.fileHint}>حداکثر ۵۰ مگابایت · mp4 / webm / mov</p>
          {mediaError ? <div className={styles.err}>{mediaError}</div> : null}
          <div className={styles.videoGrid}>
            <label className={styles.videoDrop}>
              <input
                type="file"
                accept="video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov"
                hidden
                onChange={(e) => {
                  const f = e.target.files?.[0]
                  e.target.value = ''
                  onPickVideo(f)
                }}
              />
              {videoPreview ? (
                // eslint-disable-next-line jsx-a11y/media-has-caption
                <video src={videoPreview} className={styles.videoPreview} controls />
              ) : (
                <>
                  <Video size={22} strokeWidth={1.6} />
                  <strong>آپلود ویدیو</strong>
                  <span>کلیک کنید یا فایل را رها کنید</span>
                </>
              )}
            </label>
            <label className={styles.videoDrop}>
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => {
                  const f = e.target.files?.[0]
                  e.target.value = ''
                  onPickPoster(f)
                }}
              />
              {posterPreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={posterPreview} alt="" className={styles.posterPreview} />
              ) : (
                <>
                  <ImagePlus size={22} strokeWidth={1.6} />
                  <strong>تصویر شاخص ویدیو</strong>
                  <span>کاور نمایش در لیست</span>
                </>
              )}
            </label>
          </div>
          {(videoFile || posterFile) && (
            <div className={styles.formActions} style={{ borderTop: 0, marginTop: '0.5rem', paddingTop: 0 }}>
              {videoFile ? (
                <button
                  type="button"
                  className={styles.ghostBtn}
                  onClick={() => setVideoFile(null)}
                >
                  حذف ویدیو
                </button>
              ) : null}
              {posterFile ? (
                <button
                  type="button"
                  className={styles.ghostBtn}
                  onClick={() => setPosterFile(null)}
                >
                  حذف پوستر
                </button>
              ) : null}
            </div>
          )}
        </div>
      </div>

      <CategoryPicker
        open={categoryDialog}
        onClose={() => setCategoryDialog(false)}
        categories={categories}
        value={form.category}
        onSelect={(id) => setForm((f) => ({ ...f, category: id }))}
      />

      <Dialog
        open={colorDialog}
        title="انتخاب رنگ‌ها"
        onClose={() => setColorDialog(false)}
        footer={
          <>
            <button
              type="button"
              className={styles.ghostBtn}
              onClick={() => setColorDialog(false)}
            >
              انصراف
            </button>
            <button
              type="button"
              className={styles.primaryBtn}
              onClick={() => {
                setSelectedColors(draftColors)
                setForm((f) => ({
                  ...f,
                  has_colors: draftColors.length > 0 ? true : f.has_colors,
                }))
                setColorDialog(false)
              }}
            >
              تأیید ({draftColors.length.toLocaleString('fa-IR')})
            </button>
          </>
        }
      >
        <div className={styles.colorCheckGrid}>
          {PRESET_COLORS.map((c) => {
            const on = draftColors.some((x) => x.name === c.name)
            return (
              <label key={c.name} className={on ? styles.colorCheckOn : styles.colorCheck}>
                <input
                  type="checkbox"
                  checked={on}
                  onChange={() => toggleDraftColor(c)}
                />
                <span
                  className={styles.colorDot}
                  style={{ background: c.hex }}
                />
                <em>{c.name}</em>
              </label>
            )
          })}
          {draftColors
            .filter((c) => !PRESET_COLORS.some((p) => p.name === c.name))
            .map((c) => (
              <label key={c.name} className={styles.colorCheckOn}>
                <input
                  type="checkbox"
                  checked
                  onChange={() => toggleDraftColor(c)}
                />
                <span className={styles.colorDot} style={{ background: c.hex }} />
                <em>{c.name}</em>
              </label>
            ))}
        </div>
        <div className={styles.customColorRow}>
          <label className={styles.paletteBtn} title="پالت رنگ">
            <input
              type="color"
              value={customHex}
              onChange={(e) => setCustomHex(e.target.value)}
            />
            <Plus size={14} />
            <span>پالت</span>
          </label>
          <input
            className={styles.customColorName}
            placeholder="نام رنگ دلخواه"
            value={customColorName}
            onChange={(e) => setCustomColorName(e.target.value)}
          />
          <button type="button" className={styles.primaryBtn} onClick={addCustomColor}>
            افزودن
          </button>
        </div>
      </Dialog>

      <Dialog
        open={sizeDialog}
        title="انتخاب سایزها"
        onClose={() => setSizeDialog(false)}
        footer={
          <>
            <button
              type="button"
              className={styles.ghostBtn}
              onClick={() => setSizeDialog(false)}
            >
              انصراف
            </button>
            <button
              type="button"
              className={styles.primaryBtn}
              onClick={() => {
                setSelectedSizes(draftSizes)
                setForm((f) => ({
                  ...f,
                  has_sizes: draftSizes.length > 0 ? true : f.has_sizes,
                }))
                setSizeDialog(false)
              }}
            >
              تأیید ({draftSizes.length.toLocaleString('fa-IR')})
            </button>
          </>
        }
      >
        <div className={styles.sizeCheckGrid}>
          {PRESET_SIZES.map((s) => {
            const on = draftSizes.includes(s)
            return (
              <label key={s} className={on ? styles.sizeCheckOn : styles.sizeCheck}>
                <input
                  type="checkbox"
                  checked={on}
                  onChange={() => toggleDraftSize(s)}
                />
                <span>{s}</span>
              </label>
            )
          })}
          {draftSizes
            .filter((s) => !PRESET_SIZES.includes(s))
            .map((s) => (
              <label key={s} className={styles.sizeCheckOn}>
                <input
                  type="checkbox"
                  checked
                  onChange={() => toggleDraftSize(s)}
                />
                <span>{s}</span>
              </label>
            ))}
        </div>
        <div className={styles.customColorRow}>
          <button type="button" className={styles.paletteBtn} onClick={addCustomSize}>
            <Plus size={14} />
            <span>افزودن</span>
          </button>
          <input
            className={styles.customColorName}
            placeholder="سایز دلخواه مثلاً ۴۶ یا XXXL"
            value={customSize}
            onChange={(e) => setCustomSize(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomSize())}
          />
        </div>
      </Dialog>
    </>
  )
}
