'use client'

import React, { useState } from 'react'
import { ChevronDown, Monitor, Smartphone } from 'lucide-react'
import LucideIconPicker from '@/components/common/LucideIconPicker'
import {
  DEFAULT_POST_JOB_SETTINGS,
  POST_JOB_COLOR_FIELDS,
  POST_JOB_DEVICES,
  POST_JOB_POSITIONS,
  POST_JOB_SHAPES,
  POST_JOB_SIZES,
  buildPostJobViewportPatch,
  getPostJobVisibilityFlags,
  normalizePostJobButtonSettings,
  snapshotPostJobViewportSettings,
} from '@/config/postJobButtonWidgetSettings'
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

function PxField({ label, value, onChange, max = 240, min = 0 }) {
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

function Seg({ options, value, onChange }) {
  return (
    <div
      className={styles.wsSeg}
      style={{
        gridTemplateColumns: `repeat(${Math.min(options.length, 4)}, 1fr)`,
      }}
    >
      {options.map((opt) => (
        <button
          key={opt.id}
          type="button"
          className={`${styles.wsSegBtn} ${
            value === opt.id ? styles.wsSegBtnActive : ''
          }`}
          onClick={() => onChange(opt.id)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

function ColorRow({ label, value, onChange }) {
  const hex = value && /^#/.test(value) ? value : '#fbc300'
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
          dir="ltr"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </div>
  )
}

function TextField({ label, value, onChange, dir }) {
  return (
    <label className={styles.wsPxField}>
      <span>{label}</span>
      <input
        type="text"
        className={styles.wsColorHex}
        style={{ width: '100%', maxWidth: 'none' }}
        value={value || ''}
        dir={dir}
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

export default function WidgetPostJobButtonSettings({
  settings: raw,
  onChange,
}) {
  const rawSettings = raw || DEFAULT_POST_JOB_SETTINGS
  const [device, setDevice] = useState('desktop')
  const [openId, setOpenId] = useState('content')
  const visibility = getPostJobVisibilityFlags(rawSettings)
  const settings = normalizePostJobButtonSettings(rawSettings, {
    viewport: device,
  })

  const patch = (key, value) => {
    onChange(buildPostJobViewportPatch(rawSettings, device, key, value))
  }

  return (
    <div className={styles.wsMinimal}>
      <p className={styles.wsMiniLabel}>نمایش در دستگاه</p>
      <div className={styles.wsStack}>
        <Toggle
          checked={!!visibility.show_on_desktop}
          onChange={(v) => patch('show_on_desktop', v)}
          label="نمایش در دسکتاپ"
        />
        <Toggle
          checked={!!visibility.show_on_mobile}
          onChange={(v) => patch('show_on_mobile', v)}
          label="نمایش در موبایل / اپ"
        />
      </div>

      <p className={`${styles.wsMiniLabel} ${styles.wsMiniLabelSpaced}`}>
        ویرایش برای
      </p>
      <div className={styles.wsSeg} style={{ gridTemplateColumns: '1fr 1fr' }}>
        {POST_JOB_DEVICES.map((d) => (
          <button
            key={d.id}
            type="button"
            className={`${styles.wsSegBtn} ${
              device === d.id ? styles.wsSegBtnActive : ''
            }`}
            onClick={() => setDevice(d.id)}
          >
            {d.id === 'desktop' ? (
              <Monitor size={14} style={{ marginInlineEnd: 4 }} />
            ) : (
              <Smartphone size={14} style={{ marginInlineEnd: 4 }} />
            )}
            {d.label}
          </button>
        ))}
      </div>
      {device === 'mobile' ? (
        <button
          type="button"
          className={styles.wsGhostLink}
          style={{
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            padding: 0,
          }}
          onClick={() => {
            onChange({
              mobile: snapshotPostJobViewportSettings(rawSettings, 'desktop'),
            })
          }}
        >
          کپی دسکتاپ روی موبایل
        </button>
      ) : null}

      <Accordion id="content" title="محتوا" openId={openId} setOpenId={setOpenId}>
        <TextField
          label="متن دکمه"
          value={settings.label}
          onChange={(v) => patch('label', v)}
        />
        <TextField
          label="متن انگلیسی"
          value={settings.label_en}
          onChange={(v) => patch('label_en', v)}
          dir="ltr"
        />
        <TextField
          label="لینک"
          value={settings.href}
          onChange={(v) => patch('href', v)}
          dir="ltr"
        />
        <p className={`${styles.wsMiniLabel} ${styles.wsMiniLabelSpaced}`}>
          آیکن
        </p>
        <LucideIconPicker
          value={settings.icon}
          onChange={(v) => patch('icon', v)}
        />
        <div className={styles.wsStack}>
          <Toggle
            checked={!!settings.open_new_tab}
            onChange={(v) => patch('open_new_tab', v)}
            label="باز شدن در تب جدید"
          />
        </div>
      </Accordion>

      <Accordion id="layout" title="شکل و جایگاه" openId={openId} setOpenId={setOpenId}>
        <div className={styles.wsStack}>
          <Toggle
            checked={!!settings.visible}
            onChange={(v) => patch('visible', v)}
            label="نمایش دکمه"
          />
          <Toggle
            checked={!!settings.show_icon}
            onChange={(v) => patch('show_icon', v)}
            label="نمایش آیکن"
          />
          <Toggle
            checked={!!settings.full_width}
            onChange={(v) => patch('full_width', v)}
            label="تمام‌عرض"
          />
          <Toggle
            checked={!!settings.shadow}
            onChange={(v) => patch('shadow', v)}
            label="سایه"
          />
        </div>
        <p className={`${styles.wsMiniLabel} ${styles.wsMiniLabelSpaced}`}>
          اندازه
        </p>
        <Seg
          options={POST_JOB_SIZES}
          value={settings.size}
          onChange={(v) => patch('size', v)}
        />
        <p className={`${styles.wsMiniLabel} ${styles.wsMiniLabelSpaced}`}>
          شکل
        </p>
        <Seg
          options={POST_JOB_SHAPES}
          value={settings.shape}
          onChange={(v) => patch('shape', v)}
        />
        <p className={`${styles.wsMiniLabel} ${styles.wsMiniLabelSpaced}`}>
          جایگاه
        </p>
        <Seg
          options={POST_JOB_POSITIONS}
          value={settings.position}
          onChange={(v) => patch('position', v)}
        />
        <div className={styles.wsPxGrid}>
          <PxField
            label="اندازه فونت"
            value={settings.font_size}
            onChange={(v) => patch('font_size', v)}
            min={11}
            max={22}
          />
          <PxField
            label="پدینگ افقی"
            value={settings.padding_x}
            onChange={(v) => patch('padding_x', v)}
            max={48}
          />
          <PxField
            label="پدینگ عمودی"
            value={settings.padding_y}
            onChange={(v) => patch('padding_y', v)}
            max={28}
          />
          <PxField
            label="گردی"
            value={settings.radius}
            onChange={(v) => patch('radius', v)}
            max={999}
          />
          <PxField
            label="ضخامت بردر"
            value={settings.border_width}
            onChange={(v) => patch('border_width', v)}
            max={4}
          />
          {settings.position !== 'inline' ? (
            <>
              <PxField
                label="فاصله افقی"
                value={settings.offset_x}
                onChange={(v) => patch('offset_x', v)}
                max={80}
              />
              <PxField
                label="فاصله از پایین"
                value={settings.offset_y}
                onChange={(v) => patch('offset_y', v)}
                max={160}
              />
              <PxField
                label="z-index"
                value={settings.z_index}
                onChange={(v) => patch('z_index', v)}
                max={9999}
              />
            </>
          ) : null}
        </div>
      </Accordion>

      <Accordion id="colors" title="رنگ‌ها" openId={openId} setOpenId={setOpenId}>
        <div className={`${styles.wsColorList} ${styles.wsColorListSpaced}`}>
          {POST_JOB_COLOR_FIELDS.map((f) => (
            <ColorRow
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
