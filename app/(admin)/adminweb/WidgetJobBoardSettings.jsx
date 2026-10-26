'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { ChevronDown, ExternalLink, Smartphone } from 'lucide-react'
import {
  DEFAULT_JOB_BOARD_WIDGET_SETTINGS,
  JOB_BOARD_MARGIN_FIELDS,
  JOB_BOARD_SPACE_FIELDS,
  JOB_BOARD_VIEW_MODES,
  JOB_CARDS_STRIP_TYPES,
  JOB_FULL_BOARD_TYPES,
  getJobWidgetVariant,
  normalizeJobBoardWidgetSettings,
} from '@/config/jobBoardWidgetSettings'
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
        const on = value === opt.id
        return (
          <button
            key={opt.id}
            type="button"
            className={`${styles.wsSegBtn} ${on ? styles.wsSegBtnActive : ''}`}
            onClick={() => onChange(opt.id)}
          >
            {opt.label}
          </button>
        )
      })}
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

/**
 * پنل تنظیمات همهٔ ویجت‌های سیستم کاریابی
 */
export default function WidgetJobBoardSettings({
  type = 'job_board_system',
  settings: raw,
  onChange,
}) {
  const settings = normalizeJobBoardWidgetSettings(
    raw || DEFAULT_JOB_BOARD_WIDGET_SETTINGS,
    type
  )
  const variant = getJobWidgetVariant(type)
  const isFull = JOB_FULL_BOARD_TYPES.has(type)
  const isCards = JOB_CARDS_STRIP_TYPES.has(type)
  const isSearch = type === 'job_search_bar'
  const isChrome = type === 'job_header_bar' || type === 'job_bottom_nav'
  const [openId, setOpenId] = useState('display')
  const patch = (key, value) => onChange?.({ [key]: value })

  return (
    <div className={styles.wsMinimal}>
      <div className={styles.wsBlock}>
        <p className={styles.wsLabel}>سیستم کاریابی</p>
        <p className={styles.paletteHint} style={{ marginBottom: '0.65rem' }}>
          {isChrome
            ? 'این ویجت کروم سایت است؛ با روشن بودن ماژول مربوط نمایش داده می‌شود.'
            : `ماژول لازم: ${variant.gate || 'job_board'} — وقتی ماژول کاریابی فعال باشد در پالت و صفحه در دسترس است.`}
        </p>
        <div className={styles.wsLinks}>
          <Link href="/jobs-manage">
            <ExternalLink size={13} style={{ verticalAlign: 'middle' }} /> مدیریت
            آگهی‌ها
          </Link>
          <Link href="/adminmodule#job-board-modules">
            <ExternalLink size={13} style={{ verticalAlign: 'middle' }} /> ماژول
            کاریابی
          </Link>
          <Link href="/adminkaryabi?tab=data">
            <ExternalLink size={13} style={{ verticalAlign: 'middle' }} /> داده‌های
            پایه
          </Link>
          <Link href="/jobs" target="_blank" rel="noopener noreferrer">
            <ExternalLink size={13} style={{ verticalAlign: 'middle' }} /> /jobs
          </Link>
        </div>
      </div>

      {!isChrome ? (
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
                {settings.show_on_mobile
                  ? 'نمایش داده می‌شود'
                  : 'مخفی زیر ۷۶۸px'}
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
            />
            <i />
          </span>
        </div>
      ) : null}

      {!isChrome ? (
        <Accordion
          id="display"
          title="نمایش"
          openId={openId}
          setOpenId={setOpenId}
        >
          <Toggle
            label="دادهٔ نمونه (دمو)"
            hint="اگر روشن باشد، عناوین و دسته‌بندی‌های دیتابیس در فیلتر دیده نمی‌شوند"
            checked={settings.use_demo_data}
            onChange={(v) => patch('use_demo_data', v)}
          />
          {isFull ? (
            <>
              <Toggle
                label="فیلترها"
                checked={settings.show_filters}
                onChange={(v) => patch('show_filters', v)}
              />
              <Toggle
                label="تب نوع آگهی"
                checked={settings.show_tabs}
                onChange={(v) => patch('show_tabs', v)}
              />
              <Toggle
                label="تغییر نمای لیست"
                checked={settings.show_view_toggle}
                onChange={(v) => patch('show_view_toggle', v)}
              />
              <Toggle
                label="عنوان بخش"
                checked={settings.show_title}
                onChange={(v) => patch('show_title', v)}
              />
              <Toggle
                label="تعداد آگهی"
                checked={settings.show_count}
                onChange={(v) => patch('show_count', v)}
              />
            </>
          ) : null}
          {(isCards ||
            type === 'job_categories_grid' ||
            type === 'verified_companies' ||
            type === 'public_resumes' ||
            type === 'job_stats_strip' ||
            type === 'job_quick_filters') && (
            <>
              <Toggle
                label="هدر ویجت"
                checked={settings.show_header}
                onChange={(v) => patch('show_header', v)}
              />
              <Toggle
                label="لینک مشاهده همه"
                checked={settings.show_more_link}
                onChange={(v) => patch('show_more_link', v)}
              />
            </>
          )}
          {isSearch ? (
            <Toggle
              label="انتخاب شهر"
              checked={settings.show_city_picker}
              onChange={(v) => patch('show_city_picker', v)}
            />
          ) : null}
          <Toggle
            label="تمام‌عرض سکشن"
            checked={settings.section_full}
            onChange={(v) => patch('section_full', v)}
          />
          <Toggle
            label="نمایش در دسکتاپ"
            checked={settings.show_on_desktop}
            onChange={(v) => patch('show_on_desktop', v)}
          />
        </Accordion>
      ) : null}

      {!isChrome ? (
        <Accordion
          id="defaults"
          title="محتوا و ظاهر"
          openId={openId}
          setOpenId={setOpenId}
        >
          {(isCards ||
            type === 'job_categories_grid' ||
            type === 'verified_companies' ||
            type === 'public_resumes' ||
            type === 'job_stats_strip' ||
            type === 'job_quick_filters') && (
            <label className={styles.wsPxField}>
              <span>عنوان سفارشی</span>
              <input
                type="text"
                className={styles.wsColorHex}
                style={{ width: '100%', maxWidth: 'none' }}
                value={settings.title_text || ''}
                placeholder={variant.title || ''}
                onChange={(e) => patch('title_text', e.target.value)}
              />
            </label>
          )}
          {(isCards ||
            type === 'job_categories_grid' ||
            type === 'verified_companies' ||
            type === 'public_resumes') && (
            <label className={styles.wsPxField} style={{ marginTop: '0.65rem' }}>
              <span>تعداد آیتم</span>
              <span className={styles.wsPxInput}>
                <input
                  type="number"
                  min={1}
                  max={48}
                  value={settings.limit}
                  onChange={(e) =>
                    patch(
                      'limit',
                      Math.max(1, Math.min(48, Number(e.target.value) || 8))
                    )
                  }
                  dir="ltr"
                />
              </span>
            </label>
          )}
          {isCards ? (
            <>
              <p className={styles.wsLabel} style={{ marginTop: '0.75rem' }}>
                نمای کارت
              </p>
              <Seg
                options={JOB_BOARD_VIEW_MODES.filter((v) => v.id !== 'grid-3')}
                value={
                  settings.default_view === 'grid-3'
                    ? 'grid-2'
                    : settings.default_view
                }
                onChange={(v) => patch('default_view', v)}
              />
              <p className={styles.wsLabel} style={{ marginTop: '0.75rem' }}>
                ستون‌ها
              </p>
              <Seg
                options={[
                  { id: 1, label: '۱' },
                  { id: 2, label: '۲' },
                  { id: 3, label: '۳' },
                  { id: 4, label: '۴' },
                ]}
                value={settings.columns}
                onChange={(v) => patch('columns', v)}
              />
            </>
          ) : null}
          {isFull ? (
            <>
              <p className={styles.wsLabel}>نمای کارت</p>
              <Seg
                options={JOB_BOARD_VIEW_MODES}
                value={settings.default_view}
                onChange={(v) => patch('default_view', v)}
              />
              <p className={styles.wsLabel} style={{ marginTop: '0.75rem' }}>
                تب اولیه
              </p>
              <Seg
                options={[
                  { id: 'all', label: 'همه' },
                  { id: 'hiring', label: 'استخدام' },
                  { id: 'seeking', label: 'کارجو' },
                ]}
                value={settings.default_tab}
                onChange={(v) => patch('default_tab', v)}
              />
            </>
          ) : null}
          {isSearch ? (
            <label className={styles.wsPxField}>
              <span>متن placeholder</span>
              <input
                type="text"
                className={styles.wsColorHex}
                style={{ width: '100%', maxWidth: 'none' }}
                value={settings.search_placeholder || ''}
                onChange={(e) => patch('search_placeholder', e.target.value)}
              />
            </label>
          ) : null}
          <label className={styles.wsPxField} style={{ marginTop: '0.75rem' }}>
            <span>حداکثر عرض محتوا</span>
            <span className={styles.wsPxInput}>
              <input
                type="number"
                min={640}
                max={1400}
                value={settings.max_width}
                onChange={(e) =>
                  patch(
                    'max_width',
                    Math.max(640, Math.min(1400, Number(e.target.value) || 1200))
                  )
                }
                dir="ltr"
              />
              <em>px</em>
            </span>
          </label>
        </Accordion>
      ) : null}

      {!isChrome ? (
        <Accordion
          id="space"
          title="فاصله (px)"
          openId={openId}
          setOpenId={setOpenId}
        >
          <p className={styles.paletteHint}>پدینگ</p>
          <div className={styles.wsPxGrid}>
            {JOB_BOARD_SPACE_FIELDS.map((f) => (
              <PxField
                key={f.key}
                label={f.label}
                value={settings[f.key]}
                onChange={(v) => patch(f.key, v)}
              />
            ))}
          </div>
          <p className={styles.paletteHint} style={{ marginTop: '0.65rem' }}>
            مارجین
          </p>
          <div className={styles.wsPxGrid}>
            {JOB_BOARD_MARGIN_FIELDS.map((f) => (
              <PxField
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
