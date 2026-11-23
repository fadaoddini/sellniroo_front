'use client'

import React, { useEffect, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import schoolService from '@/components/School/services/schoolService'
import {
  createDefaultSchoolClassLeadersSettings,
  DEMO_SCHOOL_CLASSES,
  normalizeClassLeaderItem,
  normalizeSchoolClassLeadersSettings,
  SCHOOL_CLASS_LEADERS_FONTS,
  SCHOOL_CLASS_LEADERS_RADIUS_CORNERS,
} from '@/config/schoolClassLeadersWidgetSettings'
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

function ColorField({ label, value, onChange }) {
  const hex =
    typeof value === 'string' && value.startsWith('#') && value.length >= 7
      ? value.slice(0, 7)
      : '#003528'
  return (
    <div className={styles.wsColorRow}>
      <span className={styles.wsColorRowLabel}>{label}</span>
      <div className={styles.wsColorRowControls}>
        <input
          type="color"
          className={styles.wsColorSwatch}
          value={hex}
          onChange={(e) => onChange(e.target.value)}
        />
        <input
          type="text"
          className={styles.wsColorHex}
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </div>
  )
}

export default function WidgetSchoolClassLeadersSettings({
  settings: raw,
  onChange,
}) {
  const settings = normalizeSchoolClassLeadersSettings({
    ...createDefaultSchoolClassLeadersSettings(),
    ...(raw || {}),
  })
  const [classes, setClasses] = useState(DEMO_SCHOOL_CLASSES)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await schoolService.classes()
        if (cancelled || !res?.success) return
        const list = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data?.results)
            ? res.data.results
            : []
        const mapped = list
          .map((c) => ({
            id: String(c.id),
            label:
              c.display_title ||
              c.title ||
              `${c.grade_label || ''} · ${c.section || ''}`.trim(),
          }))
          .filter((c) => c.label)
        if (mapped.length) setClasses(mapped)
      } catch {
        /* دمو */
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

  const onPickClass = (value) => {
    const found = classes.find(
      (c) => String(c.id) === String(value) || c.label === value,
    )
    if (!found) {
      patch({ class_label: value, class_id: '' })
      return
    }
    patch({
      class_id: found.id.startsWith('demo_') ? '' : found.id,
      class_label: found.label,
    })
  }

  const updateItem = (index, partial) => {
    const next = items.map((item, i) =>
      i === index
        ? normalizeClassLeaderItem({ ...item, ...partial }, i)
        : item,
    )
    patch({
      items: next,
      use_demo_data: next.length ? false : settings.use_demo_data,
    })
  }

  const addItem = () => {
    if (items.length >= 5) return
    const next = [
      ...items,
      normalizeClassLeaderItem(
        {
          name: `دانش‌آموز ${items.length + 1}`,
          score: '۱۸٫۰',
          points: 200,
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

  const selectValue =
    classes.find((c) => String(c.id) === String(settings.class_id))?.id ||
    classes.find((c) => c.label === settings.class_label)?.id ||
    settings.class_label ||
    ''

  return (
    <div className={styles.wsStack}>
      <p className={styles.paletteHint} style={{ marginTop: 0 }}>
        لیست جمع‌وجور ۵ نفر اول یک کلاس. کلاس را انتخاب کنید؛ نفر ۱ طلایی، ۲
        نقره‌ای، ۳ برنزی و بقیه سفید.
      </p>

      <Field
        label="عنوان"
        value={settings.title}
        onChange={(v) => patch({ title: v })}
      />

      <label className={styles.wsField}>
        <span>کلاس</span>
        <select
          value={selectValue}
          onChange={(e) => onPickClass(e.target.value)}
        >
          {!classes.some(
            (c) =>
              String(c.id) === String(selectValue) ||
              c.label === settings.class_label,
          ) && settings.class_label ? (
            <option value={settings.class_label}>{settings.class_label}</option>
          ) : null}
          {classes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>
      </label>

      <Field
        label="یا عنوان کلاس دستی"
        value={settings.class_label}
        onChange={(v) => patch({ class_label: v, class_id: '' })}
        placeholder="مثلاً اول دبستان · الف"
      />

      <div className={styles.wsToggleGrid}>
        <Toggle
          label="نمایش عنوان"
          checked={settings.show_title !== false}
          onChange={(v) => patch({ show_title: v })}
        />
        <Toggle
          label="نمایش معدل"
          checked={settings.show_score !== false}
          onChange={(v) => patch({ show_score: v })}
        />
        <Toggle
          label="نمایش امتیاز"
          checked={settings.show_points !== false}
          onChange={(v) => patch({ show_points: v })}
        />
        <Toggle
          label="دادهٔ نمونه"
          hint="اگر لیست دستی خالی باشد"
          checked={settings.use_demo_data !== false}
          onChange={(v) => patch({ use_demo_data: v })}
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
        <Toggle
          label="سایه"
          checked={settings.shadow === true}
          onChange={(v) => patch({ shadow: v })}
        />
      </div>

      <p className={`${styles.wsMiniLabel} ${styles.wsMiniLabelSpaced}`}>ظاهر</p>
      <div className={styles.wsColorList}>
        <ColorField
          label="پس‌زمینه"
          value={settings.color_bg}
          onChange={(v) => patch({ color_bg: v })}
        />
        <ColorField
          label="بردر"
          value={settings.color_border}
          onChange={(v) => patch({ color_border: v })}
        />
        <ColorField
          label="متن"
          value={settings.color_text}
          onChange={(v) => patch({ color_text: v })}
        />
        <ColorField
          label="متن فرعی"
          value={settings.color_muted}
          onChange={(v) => patch({ color_muted: v })}
        />
      </div>

      <div className={styles.wsPxGrid}>
        <PxField
          label="ضخامت بردر"
          value={settings.border_width}
          onChange={(v) => patch({ border_width: v })}
          max={8}
        />
      </div>

      <p className={`${styles.wsMiniLabel} ${styles.wsMiniLabelSpaced}`}>
        گردی گوشه‌ها
      </p>
      <div className={styles.wsPxGrid}>
        <PxField
          label="همه"
          value={settings.radius}
          onChange={(v) =>
            patch({
              radius: v,
              radius_tl: v,
              radius_tr: v,
              radius_br: v,
              radius_bl: v,
            })
          }
          max={48}
        />
        {SCHOOL_CLASS_LEADERS_RADIUS_CORNERS.map((f) => (
          <PxField
            key={f.key}
            label={f.label}
            value={settings[f.key]}
            onChange={(v) => patch({ [f.key]: v })}
            max={48}
          />
        ))}
      </div>

      <p className={`${styles.wsMiniLabel} ${styles.wsMiniLabelSpaced}`}>فونت</p>
      <label className={styles.wsField}>
        <span>فونت متن</span>
        <select
          value={settings.font_family}
          onChange={(e) => patch({ font_family: e.target.value })}
        >
          {SCHOOL_CLASS_LEADERS_FONTS.map((f) => (
            <option key={f.id} value={f.id}>
              {f.label}
            </option>
          ))}
        </select>
      </label>
      <label className={styles.wsField}>
        <span>فونت عنوان / نام</span>
        <select
          value={settings.font_title}
          onChange={(e) => patch({ font_title: e.target.value })}
        >
          {SCHOOL_CLASS_LEADERS_FONTS.map((f) => (
            <option key={f.id} value={f.id}>
              {f.label}
            </option>
          ))}
        </select>
      </label>
      <div className={styles.wsPxGrid}>
        <PxField
          label="سایز عنوان"
          value={settings.font_size_title}
          onChange={(v) => patch({ font_size_title: v })}
          min={10}
          max={28}
        />
        <PxField
          label="سایز نام"
          value={settings.font_size_name}
          onChange={(v) => patch({ font_size_name: v })}
          min={10}
          max={24}
        />
        <PxField
          label="سایز متا"
          value={settings.font_size_meta}
          onChange={(v) => patch({ font_size_meta: v })}
          min={9}
          max={20}
        />
      </div>

      <p className={`${styles.wsMiniLabel} ${styles.wsMiniLabelSpaced}`}>
        نفرات (حداکثر ۵ — اختیاری)
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
                label="معدل"
                value={item.score}
                onChange={(v) => updateItem(index, { score: v })}
              />
              <Field
                label="امتیاز"
                value={String(item.points ?? '')}
                onChange={(v) => updateItem(index, { points: Number(v) || 0 })}
              />
            </div>
          </div>
        ))}
        {items.length < 5 ? (
          <button
            type="button"
            className={styles.themeChipAdd}
            onClick={addItem}
          >
            <Plus size={14} />
            افزودن نفر
          </button>
        ) : null}
      </div>
    </div>
  )
}
