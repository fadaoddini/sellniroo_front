'use client'

import React, { useState } from 'react'
import { ChevronDown, Plus, Smartphone, Trash2 } from 'lucide-react'
import {
  FEATURE_CARDS_BG_MODES,
  FEATURE_CARDS_COLOR_FIELDS,
  FEATURE_CARDS_COLUMNS,
  FEATURE_CARDS_FONTS,
  FEATURE_CARDS_HEAD_ALIGNS,
  FEATURE_CARDS_ICON_OPTIONS,
  FEATURE_CARDS_MARGIN_FIELDS,
  FEATURE_CARDS_PRESETS,
  FEATURE_CARDS_SPACE_FIELDS,
  applyFeatureCardsPreset,
  normalizeFeatureCardsSettings,
} from '@/config/featureCardsWidgetSettings'
import styles from './AdminWeb.module.css'

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

function PxField({ label, value, onChange, min = 0, max = 240 }) {
  return (
    <label className={styles.wsPxField}>
      <span>{label}</span>
      <span className={styles.wsPxInput}>
        <input
          type="number"
          min={min}
          max={max}
          step={1}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          dir="ltr"
        />
        <em>px</em>
      </span>
    </label>
  )
}

function Seg({ options, value, onChange, cols }) {
  return (
    <div
      className={styles.wsSeg}
      style={{
        gridTemplateColumns: `repeat(${cols || options.length}, 1fr)`,
      }}
    >
      {options.map((opt) => {
        const id = opt.id
        const on = value === id
        return (
          <button
            key={String(id)}
            type="button"
            className={`${styles.wsSegBtn} ${on ? styles.wsSegBtnActive : ''}`}
            onClick={() => onChange(id)}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}

function ColorRow({ label, value, onChange }) {
  const isRgba = typeof value === 'string' && value.includes('rgba')
  const isShadow = typeof value === 'string' && value.includes('px')
  const hex = value && /^#/.test(value) ? value : '#000000'
  return (
    <div className={styles.wsColorRow}>
      <span className={styles.wsColorRowLabel}>{label}</span>
      <div className={styles.wsColorRowControls}>
        {!isRgba && !isShadow ? (
          <input
            type="color"
            className={styles.wsColorSwatch}
            value={hex}
            onChange={(e) => onChange(e.target.value)}
            aria-label={label}
          />
        ) : null}
        <input
          type="text"
          className={styles.wsColorHex}
          dir="ltr"
          value={value || ''}
          placeholder="#000 / rgba() / shadow"
          onChange={(e) => onChange(e.target.value)}
          style={{ minWidth: isShadow || isRgba ? 140 : undefined }}
        />
      </div>
    </div>
  )
}

function TextField({ label, value, onChange, placeholder }) {
  return (
    <label className={styles.wsPxField}>
      <span>{label}</span>
      <input
        type="text"
        className={styles.wsColorHex}
        style={{ width: '100%', maxWidth: 'none' }}
        value={value || ''}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  )
}

function Accordion({ id, title, openId, setOpenId, children }) {
  const open = openId === id
  return (
    <div className={`${styles.wsAcc} ${open ? styles.wsAccOpen : ''}`}>
      <button
        type="button"
        className={styles.wsAccHead}
        onClick={() => setOpenId(open ? null : id)}
        aria-expanded={open}
      >
        <span>{title}</span>
        <ChevronDown size={14} />
      </button>
      {open ? <div className={styles.wsAccBody}>{children}</div> : null}
    </div>
  )
}

const emptyItem = () => ({
  title: 'ویژگی جدید',
  desc: '',
  icon: 'Package',
  href: '',
  cta: '',
})

export default function WidgetFeatureCardsSettings({ settings: raw, onChange }) {
  const settings = normalizeFeatureCardsSettings(raw || {})
  const [openId, setOpenId] = useState('content')
  const patch = (key, value) => onChange?.({ [key]: value })
  const patchMany = (obj) => onChange?.(obj)

  const updateItem = (index, key, value) => {
    const next = settings.items.map((it, i) =>
      i === index ? { ...it, [key]: value } : it
    )
    patch('items', next)
  }

  const removeItem = (index) => {
    if (settings.items.length <= 1) return
    patch(
      'items',
      settings.items.filter((_, i) => i !== index)
    )
  }

  const addItem = () => {
    if (settings.items.length >= 12) return
    patch('items', [...settings.items, emptyItem()])
  }

  const sectionColors = FEATURE_CARDS_COLOR_FIELDS.filter((f) =>
    ['section_bg', 'bg_from', 'bg_to'].includes(f.key)
  )
  const textColors = FEATURE_CARDS_COLOR_FIELDS.filter((f) =>
    ['eyebrow_color', 'eyebrow_bg', 'title_color', 'subtitle_color'].includes(
      f.key
    )
  )
  const cardColors = FEATURE_CARDS_COLOR_FIELDS.filter((f) =>
    [
      'card_bg',
      'card_bg_to',
      'card_border',
      'card_shadow',
      'card_title_color',
      'card_desc_color',
      'card_cta_color',
      'hover_border',
      'hover_shadow',
    ].includes(f.key)
  )
  const iconColors = FEATURE_CARDS_COLOR_FIELDS.filter((f) =>
    ['icon_color', 'icon_bg_from', 'icon_bg_to', 'icon_shadow'].includes(f.key)
  )

  return (
    <div className={styles.wsMinimal}>
      <div
        className={`${styles.wsMobileCard} ${
          settings.show_on_mobile ? '' : styles.wsMobileCardOff
        }`}
      >
        <div className={styles.wsMobileMeta}>
          <Smartphone size={15} strokeWidth={1.75} />
          <div>
            <strong>موبایل</strong>
            <span>
              {settings.show_on_mobile ? 'نمایش داده می‌شود' : 'مخفی زیر ۷۶۸px'}
            </span>
          </div>
        </div>
        <span
          className={`${styles.wsSwitch} ${
            settings.show_on_mobile ? styles.wsSwitchOn : ''
          }`}
        >
          <input
            type="checkbox"
            checked={!!settings.show_on_mobile}
            onChange={(e) => patch('show_on_mobile', e.target.checked)}
            aria-label="نمایش در موبایل"
          />
          <i />
        </span>
      </div>

      <Accordion id="preset" title="پالت آماده" openId={openId} setOpenId={setOpenId}>
        <p className={styles.wsHint}>
          با انتخاب پالت، رنگ‌ها پر می‌شوند؛ بعد می‌توانید تک‌تک عوض کنید.
        </p>
        <div className={styles.wsPresetGrid}>
          {FEATURE_CARDS_PRESETS.map((preset) => {
            const on = settings.preset === preset.id
            return (
              <button
                key={preset.id}
                type="button"
                className={`${styles.wsPresetCard} ${
                  on ? styles.wsPresetCardOn : ''
                }`}
                onClick={() => patchMany(applyFeatureCardsPreset(preset.id))}
              >
                <strong>{preset.label}</strong>
                <small>{preset.desc}</small>
              </button>
            )
          })}
        </div>
      </Accordion>

      <Accordion id="content" title="محتوا" openId={openId} setOpenId={setOpenId}>
        <TextField
          label="eyebrow"
          value={settings.eyebrow}
          onChange={(v) => patch('eyebrow', v)}
          placeholder="مارکت‌پلیس چندفروشگاهی"
        />
        <TextField
          label="عنوان"
          value={settings.title}
          onChange={(v) => patch('title', v)}
          placeholder="یک پلتفرم، صدها فروشگاه"
        />
        <TextField
          label="زیرعنوان"
          value={settings.subtitle}
          onChange={(v) => patch('subtitle', v)}
          placeholder="توضیح کوتاه زیر عنوان"
        />

        <p className={`${styles.wsMiniLabel} ${styles.wsMiniLabelSpaced}`}>
          کارت‌ها ({settings.items.length}/۱۲)
        </p>
        <div className={styles.wsStack}>
          {settings.items.map((item, index) => (
            <div
              key={`fc-item-${index}`}
              style={{
                border: '1px solid var(--line, #e5e5e5)',
                borderRadius: 12,
                padding: 10,
                display: 'grid',
                gap: 8,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <strong style={{ fontSize: 12 }}>کارت {index + 1}</strong>
                <button
                  type="button"
                  className={styles.wsTinyBtn}
                  onClick={() => removeItem(index)}
                  disabled={settings.items.length <= 1}
                  aria-label="حذف کارت"
                >
                  <Trash2 size={12} />
                </button>
              </div>
              <TextField
                label="عنوان کارت"
                value={item.title}
                onChange={(v) => updateItem(index, 'title', v)}
              />
              <TextField
                label="توضیح"
                value={item.desc}
                onChange={(v) => updateItem(index, 'desc', v)}
              />
              <label className={styles.wsPxField}>
                <span>آیکون</span>
                <select
                  className={styles.wsSelect}
                  value={item.icon || 'Package'}
                  onChange={(e) => updateItem(index, 'icon', e.target.value)}
                >
                  {FEATURE_CARDS_ICON_OPTIONS.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </label>
              <TextField
                label="لینک (اختیاری)"
                value={item.href}
                onChange={(v) => updateItem(index, 'href', v)}
                placeholder="/shop"
              />
              <TextField
                label="متن CTA"
                value={item.cta}
                onChange={(v) => updateItem(index, 'cta', v)}
                placeholder="مشاهده"
              />
            </div>
          ))}
        </div>
        <button
          type="button"
          className={styles.wsTinyBtn}
          onClick={addItem}
          disabled={settings.items.length >= 12}
          style={{ marginTop: 8 }}
        >
          <Plus size={12} /> افزودن کارت
        </button>
      </Accordion>

      <Accordion id="display" title="نمایش و چیدمان" openId={openId} setOpenId={setOpenId}>
        <p className={styles.wsMiniLabel}>تعداد ستون</p>
        <Seg
          options={FEATURE_CARDS_COLUMNS}
          value={settings.columns}
          onChange={(v) => patch('columns', v)}
        />
        <p className={`${styles.wsMiniLabel} ${styles.wsMiniLabelSpaced}`}>
          تراز عنوان
        </p>
        <Seg
          options={FEATURE_CARDS_HEAD_ALIGNS}
          value={settings.head_align}
          onChange={(v) => patch('head_align', v)}
        />
        <div className={styles.wsStack} style={{ marginTop: 10 }}>
          <Toggle
            checked={!!settings.section_full}
            onChange={(v) => patch('section_full', v)}
            label="سکشن تمام‌عرض"
            hint="پس‌زمینه لبه به لبه"
          />
          <Toggle
            checked={!!settings.show_eyebrow}
            onChange={(v) => patch('show_eyebrow', v)}
            label="نمایش eyebrow"
          />
          <Toggle
            checked={!!settings.show_title}
            onChange={(v) => patch('show_title', v)}
            label="نمایش عنوان"
          />
          <Toggle
            checked={!!settings.show_subtitle}
            onChange={(v) => patch('show_subtitle', v)}
            label="نمایش زیرعنوان"
          />
          <Toggle
            checked={!!settings.show_icons}
            onChange={(v) => patch('show_icons', v)}
            label="نمایش آیکون"
          />
          <Toggle
            checked={!!settings.show_cta}
            onChange={(v) => patch('show_cta', v)}
            label="نمایش لینک CTA کارت"
          />
          <Toggle
            checked={!!settings.show_on_desktop}
            onChange={(v) => patch('show_on_desktop', v)}
            label="نمایش در دسکتاپ"
          />
        </div>
        <div
          className={styles.wsPxGrid}
          style={{ marginTop: 10, display: 'grid', gap: 8 }}
        >
          <PxField
            label="حداکثر عرض محتوا"
            value={settings.max_width}
            onChange={(v) => patch('max_width', v)}
            max={1600}
          />
          <PxField
            label="فاصله کارت‌ها"
            value={settings.gap}
            onChange={(v) => patch('gap', v)}
            max={48}
          />
          <PxField
            label="گردی کارت"
            value={settings.card_radius}
            onChange={(v) => patch('card_radius', v)}
            max={48}
          />
          <PxField
            label="پدینگ کارت"
            value={settings.card_padding}
            onChange={(v) => patch('card_padding', v)}
            max={48}
          />
          <PxField
            label="اندازه آیکون"
            value={settings.icon_size}
            onChange={(v) => patch('icon_size', v)}
            max={96}
          />
          <PxField
            label="گردی آیکون"
            value={settings.icon_radius}
            onChange={(v) => patch('icon_radius', v)}
            max={48}
          />
        </div>
      </Accordion>

      <Accordion id="fonts" title="فونت و اندازه متن" openId={openId} setOpenId={setOpenId}>
        <p className={styles.wsMiniLabel}>فونت عنوان اصلی</p>
        <Seg
          options={FEATURE_CARDS_FONTS}
          value={settings.title_font}
          onChange={(v) => patch('title_font', v)}
          cols={2}
        />
        <p className={`${styles.wsMiniLabel} ${styles.wsMiniLabelSpaced}`}>
          فونت eyebrow
        </p>
        <Seg
          options={FEATURE_CARDS_FONTS}
          value={settings.eyebrow_font}
          onChange={(v) => patch('eyebrow_font', v)}
          cols={2}
        />
        <p className={`${styles.wsMiniLabel} ${styles.wsMiniLabelSpaced}`}>
          فونت عنوان کارت
        </p>
        <Seg
          options={FEATURE_CARDS_FONTS}
          value={settings.card_title_font}
          onChange={(v) => patch('card_title_font', v)}
          cols={2}
        />
        <p className={`${styles.wsMiniLabel} ${styles.wsMiniLabelSpaced}`}>
          فونت متن / توضیح
        </p>
        <Seg
          options={FEATURE_CARDS_FONTS}
          value={settings.body_font}
          onChange={(v) => patch('body_font', v)}
          cols={2}
        />
        <div
          style={{ marginTop: 10, display: 'grid', gap: 8 }}
        >
          <PxField
            label="اندازه عنوان"
            value={settings.title_size}
            onChange={(v) => patch('title_size', v)}
            max={64}
          />
          <PxField
            label="اندازه زیرعنوان"
            value={settings.subtitle_size}
            onChange={(v) => patch('subtitle_size', v)}
            max={32}
          />
          <PxField
            label="اندازه عنوان کارت"
            value={settings.card_title_size}
            onChange={(v) => patch('card_title_size', v)}
            max={32}
          />
          <PxField
            label="اندازه توضیح کارت"
            value={settings.card_desc_size}
            onChange={(v) => patch('card_desc_size', v)}
            max={24}
          />
        </div>
      </Accordion>

      <Accordion id="colors" title="رنگ و پس‌زمینه" openId={openId} setOpenId={setOpenId}>
        <p className={styles.wsMiniLabel}>حالت پس‌زمینه سکشن</p>
        <Seg
          options={FEATURE_CARDS_BG_MODES}
          value={settings.section_bg_mode}
          onChange={(v) => patch('section_bg_mode', v)}
        />
        <p className={`${styles.wsMiniLabel} ${styles.wsMiniLabelSpaced}`}>
          پس‌زمینه سکشن
        </p>
        <div className={styles.wsStack}>
          {sectionColors.map((f) => (
            <ColorRow
              key={f.key}
              label={f.label}
              value={settings[f.key]}
              onChange={(v) => patch(f.key, v)}
            />
          ))}
        </div>
        <p className={`${styles.wsMiniLabel} ${styles.wsMiniLabelSpaced}`}>
          متن هدر
        </p>
        <div className={styles.wsStack}>
          {textColors.map((f) => (
            <ColorRow
              key={f.key}
              label={f.label}
              value={settings[f.key]}
              onChange={(v) => patch(f.key, v)}
            />
          ))}
        </div>
        <p className={`${styles.wsMiniLabel} ${styles.wsMiniLabelSpaced}`}>
          کارت‌ها
        </p>
        <div className={styles.wsStack}>
          {cardColors.map((f) => (
            <ColorRow
              key={f.key}
              label={f.label}
              value={settings[f.key]}
              onChange={(v) => patch(f.key, v)}
            />
          ))}
        </div>
        <p className={`${styles.wsMiniLabel} ${styles.wsMiniLabelSpaced}`}>
          آیکون
        </p>
        <div className={styles.wsStack}>
          {iconColors.map((f) => (
            <ColorRow
              key={f.key}
              label={f.label}
              value={settings[f.key]}
              onChange={(v) => patch(f.key, v)}
            />
          ))}
        </div>
      </Accordion>

      <Accordion id="space" title="فاصله و حاشیه" openId={openId} setOpenId={setOpenId}>
        <p className={styles.wsMiniLabel}>پدینگ</p>
        <div style={{ display: 'grid', gap: 8 }}>
          {FEATURE_CARDS_SPACE_FIELDS.map((f) => (
            <PxField
              key={f.key}
              label={f.label}
              value={settings[f.key]}
              onChange={(v) => patch(f.key, v)}
            />
          ))}
        </div>
        <p className={`${styles.wsMiniLabel} ${styles.wsMiniLabelSpaced}`}>
          مارجین
        </p>
        <div style={{ display: 'grid', gap: 8 }}>
          {FEATURE_CARDS_MARGIN_FIELDS.map((f) => (
            <PxField
              key={f.key}
              label={f.label}
              value={settings[f.key]}
              onChange={(v) => patch(f.key, v)}
            />
          ))}
        </div>
      </Accordion>
    </div>
  )
}
