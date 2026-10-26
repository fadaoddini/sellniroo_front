'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { ChevronDown, Monitor, Smartphone } from 'lucide-react'
import {
  APP_BOTTOM_NAV_COLOR_FIELDS,
  APP_BOTTOM_NAV_DEVICES,
  APP_BOTTOM_NAV_STYLES,
  DEFAULT_APP_BOTTOM_NAV_SETTINGS,
  buildAppBottomNavViewportPatch,
  getAppBottomNavVisibilityFlags,
  normalizeAppBottomNavSettings,
  snapshotAppBottomNavViewportSettings,
} from '@/config/appBottomNavWidgetSettings'
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
      style={{ gridTemplateColumns: `repeat(${Math.min(options.length, 4)}, 1fr)` }}
    >
      {options.map((opt) => (
        <button
          key={opt.id}
          type="button"
          className={`${styles.wsSegBtn} ${value === opt.id ? styles.wsSegBtnActive : ''}`}
          onClick={() => onChange(opt.id)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

function ColorRow({ label, value, onChange }) {
  const hex = value && /^#/.test(value) ? value : '#0a0a0a'
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

export default function WidgetAppBottomNavSettings({ settings: raw, onChange }) {
  const rawSettings = raw || DEFAULT_APP_BOTTOM_NAV_SETTINGS
  const [device, setDevice] = useState('mobile')
  const [openId, setOpenId] = useState('layout')
  const visibility = getAppBottomNavVisibilityFlags(rawSettings)
  const settings = normalizeAppBottomNavSettings(rawSettings, {
    viewport: device,
  })

  const patch = (key, value) => {
    onChange(buildAppBottomNavViewportPatch(rawSettings, device, key, value))
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
        {APP_BOTTOM_NAV_DEVICES.map((d) => (
          <button
            key={d.id}
            type="button"
            className={`${styles.wsSegBtn} ${device === d.id ? styles.wsSegBtnActive : ''}`}
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
          style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0 }}
          onClick={() => {
            onChange({
              mobile: snapshotAppBottomNavViewportSettings(rawSettings, 'desktop'),
            })
            setDevice('mobile')
          }}
        >
          کپی دسکتاپ روی موبایل
        </button>
      ) : null}

      <Accordion id="content" title="محتوا" openId={openId} setOpenId={setOpenId}>
        <div className={styles.wsStack}>
          <Toggle
            checked={!!settings.filter_by_modules}
            onChange={(v) => patch('filter_by_modules', v)}
            label="فیلتر لینک‌ها با ماژول‌های فعال"
          />
          <Toggle
            checked={!!settings.use_site_appearance}
            onChange={(v) => patch('use_site_appearance', v)}
            label="رنگ/استایل از ظاهر منو"
            hint="تب ظاهر در مدیریت منو"
          />
        </div>
        <div className={styles.wsLabelRow}>
          <p className={styles.wsMiniLabel}>لینک‌های منو</p>
          <Link href="/header-menu?tab=links" className={styles.wsGhostLink}>
            مدیریت
          </Link>
        </div>
        <Link href="/header-menu?tab=mobile" className={styles.wsGhostLink}>
          ظاهر موبایل
        </Link>
      </Accordion>

      <Accordion id="layout" title="چیدمان و استایل" openId={openId} setOpenId={setOpenId}>
        <div className={styles.wsStack}>
          <Toggle
            checked={!!settings.visible}
            onChange={(v) => patch('visible', v)}
            label="نمایش نوار"
          />
          <Toggle
            checked={!!settings.fixed}
            onChange={(v) => patch('fixed', v)}
            label="ثابت پایین صفحه"
          />
          <Toggle
            checked={!!settings.show_icons}
            onChange={(v) => patch('show_icons', v)}
            label="آیکن"
          />
          <Toggle
            checked={!!settings.show_labels}
            onChange={(v) => patch('show_labels', v)}
            label="متن"
          />
          <Toggle
            checked={!!settings.shadow}
            onChange={(v) => patch('shadow', v)}
            label="سایه"
          />
        </div>
        <p className={`${styles.wsMiniLabel} ${styles.wsMiniLabelSpaced}`}>
          استایل نوار
        </p>
        <Seg
          options={APP_BOTTOM_NAV_STYLES}
          value={settings.nav_style}
          onChange={(v) => patch('nav_style', v)}
        />
        <div className={styles.wsPxGrid}>
          <PxField
            label="حداکثر آیتم"
            value={settings.max_items}
            onChange={(v) => patch('max_items', v)}
            min={3}
            max={7}
          />
          <PxField
            label="ارتفاع"
            value={settings.height}
            onChange={(v) => patch('height', v)}
            min={48}
            max={96}
          />
          <PxField
            label="بلور"
            value={settings.blur}
            onChange={(v) => patch('blur', v)}
            max={40}
          />
          <PxField
            label="گردی"
            value={settings.radius}
            onChange={(v) => patch('radius', v)}
            max={40}
          />
          <PxField
            label="فاصله کناری"
            value={settings.inset_x}
            onChange={(v) => patch('inset_x', v)}
            max={48}
          />
          <PxField
            label="فاصله از پایین"
            value={settings.inset_bottom}
            onChange={(v) => patch('inset_bottom', v)}
            max={48}
          />
          <PxField
            label="ضخامت بردر"
            value={settings.border_width}
            onChange={(v) => patch('border_width', v)}
            max={4}
          />
          <PxField
            label="z-index"
            value={settings.z_index}
            onChange={(v) => patch('z_index', v)}
            max={9999}
          />
        </div>
      </Accordion>

      {!settings.use_site_appearance ? (
        <Accordion id="colors" title="رنگ‌ها" openId={openId} setOpenId={setOpenId}>
          <div className={`${styles.wsColorList} ${styles.wsColorListSpaced}`}>
            {APP_BOTTOM_NAV_COLOR_FIELDS.map((f) => (
              <ColorRow
                key={f.key}
                label={f.label}
                value={settings[f.key]}
                onChange={(v) => patch(f.key, v)}
              />
            ))}
          </div>
        </Accordion>
      ) : null}
    </div>
  )
}
