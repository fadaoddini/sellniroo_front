'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { ChevronDown, ExternalLink, Monitor, Smartphone } from 'lucide-react'
import {
  DEFAULT_REPAIRS_CTA_SETTINGS,
  DEFAULT_REPAIRS_REQ_SETTINGS,
  DEFAULT_REPAIRS_SVC_SETTINGS,
  DEFAULT_REPAIRS_TECH_SETTINGS,
  DEFAULT_REPAIRS_TRACK_SETTINGS,
  REPAIRS_COLUMNS,
  REPAIRS_CTA_BG_MODES,
  REPAIRS_CTA_COLORS,
  REPAIRS_CTA_LAYOUTS,
  REPAIRS_DEVICES,
  REPAIRS_MARGIN_FIELDS,
  REPAIRS_REQ_COLORS,
  REPAIRS_SPACE_FIELDS,
  REPAIRS_SVC_COLORS,
  REPAIRS_TECH_COLORS,
  REPAIRS_TRACK_COLORS,
  buildRepairsViewportPatch,
  getRepairsVisibilityFlags,
  normalizeRepairsWidgetSettings,
  snapshotRepairsViewportSettings,
} from '@/config/repairsWidgetSettings'
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

function Seg({ options, value, onChange }) {
  return (
    <div
      className={styles.wsSeg}
      style={{ gridTemplateColumns: `repeat(${options.length}, 1fr)` }}
    >
      {options.map((opt) => {
        const on = value === opt.id
        return (
          <button
            key={String(opt.id)}
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

function ColorRow({ label, value, onChange, allowTransparent = false }) {
  const isTransparent = value === 'transparent'
  const hex = value && /^#/.test(value) ? value : '#b45309'
  return (
    <div className={styles.wsColorRow}>
      <span className={styles.wsColorRowLabel}>{label}</span>
      <div className={styles.wsColorRowControls}>
        <input
          type="color"
          className={styles.wsColorSwatch}
          value={isTransparent ? '#b45309' : hex}
          disabled={isTransparent}
          onChange={(e) => onChange(e.target.value)}
          aria-label={label}
        />
        <input
          type="text"
          className={styles.wsColorHex}
          dir="ltr"
          value={value || ''}
          placeholder="auto"
          onChange={(e) => onChange(e.target.value)}
        />
        {allowTransparent ? (
          <button
            type="button"
            className={`${styles.wsTinyBtn} ${
              isTransparent ? styles.wsTinyBtnOn : ''
            }`}
            onClick={() => onChange(isTransparent ? '' : 'transparent')}
          >
            شفاف
          </button>
        ) : null}
        {value && !isTransparent ? (
          <button
            type="button"
            className={styles.wsTinyBtn}
            onClick={() => onChange('')}
          >
            ×
          </button>
        ) : null}
      </div>
    </div>
  )
}

function TextField({ label, value, onChange, placeholder, dir }) {
  return (
    <label className={styles.wsPxField}>
      <span>{label}</span>
      <input
        type="text"
        className={styles.wsColorHex}
        style={{ width: '100%', maxWidth: 'none' }}
        value={value || ''}
        placeholder={placeholder}
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

function SpaceSection({ settings, patch }) {
  return (
    <>
      <p className={`${styles.wsMiniLabel} ${styles.wsMiniLabelSpaced}`}>
        Padding بیرونی
      </p>
      <div className={styles.wsPxGrid}>
        {REPAIRS_SPACE_FIELDS.map((f) => (
          <PxField
            key={f.key}
            label={f.label}
            value={settings[f.key]}
            onChange={(v) => patch(f.key, v)}
          />
        ))}
      </div>
      <p className={`${styles.wsMiniLabel} ${styles.wsMiniLabelSpaced}`}>
        Margin
      </p>
      <div className={styles.wsPxGrid}>
        {REPAIRS_MARGIN_FIELDS.map((f) => (
          <PxField
            key={f.key}
            label={f.label}
            value={settings[f.key]}
            onChange={(v) => patch(f.key, v)}
            max={120}
          />
        ))}
      </div>
    </>
  )
}

const DEFAULT_BY_TYPE = {
  repairs_cta: DEFAULT_REPAIRS_CTA_SETTINGS,
  repairs_technicians: DEFAULT_REPAIRS_TECH_SETTINGS,
  repairs_services: DEFAULT_REPAIRS_SVC_SETTINGS,
  repairs_request: DEFAULT_REPAIRS_REQ_SETTINGS,
  repairs_track: DEFAULT_REPAIRS_TRACK_SETTINGS,
}

export default function WidgetRepairsSettings({
  type = 'repairs_cta',
  settings: raw,
  onChange,
}) {
  const [device, setDevice] = useState('desktop')
  const [openId, setOpenId] = useState('content')

  const rawSettings = raw || DEFAULT_BY_TYPE[type] || DEFAULT_REPAIRS_CTA_SETTINGS
  const visibility = getRepairsVisibilityFlags(rawSettings)
  const settings = normalizeRepairsWidgetSettings(rawSettings, type, {
    viewport: device,
  })

  const patch = (key, value) => {
    onChange(buildRepairsViewportPatch(rawSettings, device, key, value, type))
  }

  const copyDesktopToMobile = () => {
    const snap = snapshotRepairsViewportSettings(rawSettings, 'desktop', type)
    onChange({ mobile: snap })
    setDevice('mobile')
  }

  return (
    <div className={styles.wsMinimal}>
      <div className={styles.wsLabelRow}>
        <p className={styles.wsMiniLabel}>ویجت تعمیرات</p>
        <Link
          href="/repairs-manage"
          className={styles.wsGhostLink}
          target="_blank"
        >
          مدیریت محتوا <ExternalLink size={12} />
        </Link>
      </div>

      <p className={styles.wsMiniLabel}>نمایش در دستگاه</p>
      <div className={styles.wsStack}>
        <Toggle
          checked={!!visibility.show_on_desktop}
          onChange={(v) => patch('show_on_desktop', v)}
          label="نمایش در دسکتاپ"
          hint="بالای ۷۶۸px"
        />
        <Toggle
          checked={!!visibility.show_on_mobile}
          onChange={(v) => patch('show_on_mobile', v)}
          label="نمایش در موبایل / اپ"
          hint="زیر ۷۶۸px"
        />
      </div>

      <p className={`${styles.wsMiniLabel} ${styles.wsMiniLabelSpaced}`}>
        ویرایش تنظیمات برای
      </p>
      <div className={styles.wsSeg} style={{ gridTemplateColumns: '1fr 1fr' }}>
        {REPAIRS_DEVICES.map((d) => {
          const on = device === d.id
          return (
            <button
              key={d.id}
              type="button"
              className={`${styles.wsSegBtn} ${on ? styles.wsSegBtnActive : ''}`}
              onClick={() => setDevice(d.id)}
            >
              {d.id === 'desktop' ? (
                <Monitor size={14} style={{ marginInlineEnd: 4 }} />
              ) : (
                <Smartphone size={14} style={{ marginInlineEnd: 4 }} />
              )}
              {d.label}
            </button>
          )
        })}
      </div>
      <p className={styles.wsHint}>
        {device === 'desktop'
          ? 'در حال ویرایش ظاهر دسکتاپ'
          : 'در حال ویرایش ظاهر موبایل / اپ'}
      </p>
      {device === 'mobile' ? (
        <button
          type="button"
          className={styles.wsGhostLink}
          style={{
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            padding: 0,
            marginBottom: '0.5rem',
          }}
          onClick={copyDesktopToMobile}
        >
          کپی تنظیمات دسکتاپ روی موبایل
        </button>
      ) : null}

      {type === 'repairs_cta' ? (
        <>
          <Accordion id="content" title="محتوا و لینک‌ها" openId={openId} setOpenId={setOpenId}>
            <TextField label="عنوان" value={settings.title} onChange={(v) => patch('title', v)} />
            <TextField label="زیرعنوان" value={settings.subtitle} onChange={(v) => patch('subtitle', v)} />
            <TextField label="متن دکمه اصلی" value={settings.primary_label} onChange={(v) => patch('primary_label', v)} />
            <TextField label="لینک دکمه اصلی" value={settings.primary_href} onChange={(v) => patch('primary_href', v)} dir="ltr" />
            <TextField label="متن دکمه فرعی" value={settings.secondary_label} onChange={(v) => patch('secondary_label', v)} />
            <TextField label="لینک دکمه فرعی" value={settings.secondary_href} onChange={(v) => patch('secondary_href', v)} dir="ltr" />
          </Accordion>
          <Accordion id="display" title="نمایش" openId={openId} setOpenId={setOpenId}>
            <p className={styles.wsMiniLabel}>چیدمان</p>
            <Seg options={REPAIRS_CTA_LAYOUTS} value={settings.layout} onChange={(v) => patch('layout', v)} />
            <div className={styles.wsStack}>
              <Toggle checked={!!settings.show_icon} onChange={(v) => patch('show_icon', v)} label="نمایش آیکن" />
              <Toggle checked={!!settings.show_glow} onChange={(v) => patch('show_glow', v)} label="درخشش پس‌زمینه" />
              <Toggle checked={!!settings.show_primary} onChange={(v) => patch('show_primary', v)} label="دکمه اصلی" />
              <Toggle checked={!!settings.show_secondary} onChange={(v) => patch('show_secondary', v)} label="دکمه فرعی" />
              <Toggle checked={!!settings.band_shadow} onChange={(v) => patch('band_shadow', v)} label="سایه بنر" />
              <Toggle checked={!!settings.section_full} onChange={(v) => patch('section_full', v)} label="سکشن تمام‌عرض" />
            </div>
          </Accordion>
          <Accordion id="space" title="شکل و فاصله" openId={openId} setOpenId={setOpenId}>
            <div className={styles.wsPxGrid}>
              <PxField label="حداکثر عرض" value={settings.max_width} onChange={(v) => patch('max_width', v)} min={320} max={1400} />
              <PxField label="گردی بنر" value={settings.band_radius} onChange={(v) => patch('band_radius', v)} max={40} />
              <PxField label="پدینگ عمودی بنر" value={settings.band_padding_y} onChange={(v) => patch('band_padding_y', v)} max={64} />
              <PxField label="پدینگ افقی بنر" value={settings.band_padding_x} onChange={(v) => patch('band_padding_x', v)} max={64} />
              <PxField label="اندازه عنوان" value={settings.title_size} onChange={(v) => patch('title_size', v)} min={16} max={42} />
              <PxField label="اندازه زیرعنوان" value={settings.subtitle_size} onChange={(v) => patch('subtitle_size', v)} min={11} max={22} />
            </div>
            <SpaceSection settings={settings} patch={patch} />
          </Accordion>
          <Accordion id="colors" title="رنگ‌ها" openId={openId} setOpenId={setOpenId}>
            <p className={styles.wsMiniLabel}>پس‌زمینه بنر</p>
            <Seg
              options={REPAIRS_CTA_BG_MODES}
              value={settings.bg_mode || 'solid'}
              onChange={(v) => patch('bg_mode', v)}
            />
            <div className={styles.wsColorList}>
              {(settings.bg_mode || 'solid') === 'solid' ? (
                <ColorRow
                  label="رنگ پس‌زمینه"
                  value={settings.bg_solid}
                  onChange={(v) => patch('bg_solid', v)}
                />
              ) : null}
              {(settings.bg_mode || 'solid') === 'gradient'
                ? REPAIRS_CTA_COLORS.filter((f) =>
                    ['bg_from', 'bg_mid', 'bg_to', 'glow'].includes(f.key),
                  ).map((f) => (
                    <ColorRow
                      key={f.key}
                      label={f.label}
                      value={settings[f.key]}
                      onChange={(v) => patch(f.key, v)}
                      allowTransparent={f.key === 'glow'}
                    />
                  ))
                : null}
              {REPAIRS_CTA_COLORS.filter(
                (f) =>
                  !['bg_solid', 'bg_from', 'bg_mid', 'bg_to', 'glow'].includes(
                    f.key,
                  ),
              ).map((f) => (
                <ColorRow
                  key={f.key}
                  label={f.label}
                  value={settings[f.key]}
                  onChange={(v) => patch(f.key, v)}
                  allowTransparent={
                    f.key === 'secondary_bg' || f.key === 'secondary_border'
                  }
                />
              ))}
            </div>
          </Accordion>
        </>
      ) : null}

      {type === 'repairs_technicians' ? (
        <>
          <Accordion id="content" title="محتوا" openId={openId} setOpenId={setOpenId}>
            <TextField label="Eyebrow" value={settings.eyebrow_text} onChange={(v) => patch('eyebrow_text', v)} />
            <TextField label="عنوان" value={settings.title} onChange={(v) => patch('title', v)} />
            <TextField label="زیرعنوان" value={settings.subtitle} onChange={(v) => patch('subtitle', v)} />
            <PxField label="تعداد نمایش" value={settings.limit} onChange={(v) => patch('limit', v)} min={1} max={48} />
          </Accordion>
          <Accordion id="display" title="نمایش و چیدمان" openId={openId} setOpenId={setOpenId}>
            <p className={styles.wsMiniLabel}>ستون‌ها</p>
            <Seg options={REPAIRS_COLUMNS} value={settings.columns} onChange={(v) => patch('columns', v)} />
            <div className={styles.wsStack}>
              <Toggle checked={!!settings.show_eyebrow} onChange={(v) => patch('show_eyebrow', v)} label="Eyebrow" />
              <Toggle checked={!!settings.show_avatar} onChange={(v) => patch('show_avatar', v)} label="آواتار" />
              <Toggle checked={!!settings.show_specialty} onChange={(v) => patch('show_specialty', v)} label="تخصص" />
              <Toggle checked={!!settings.show_city} onChange={(v) => patch('show_city', v)} label="شهر" />
              <Toggle checked={!!settings.card_lift} onChange={(v) => patch('card_lift', v)} label="افکت هاور کارت" />
              <Toggle checked={!!settings.section_full} onChange={(v) => patch('section_full', v)} label="سکشن تمام‌عرض" />
            </div>
          </Accordion>
          <Accordion id="space" title="شکل و فاصله" openId={openId} setOpenId={setOpenId}>
            <div className={styles.wsPxGrid}>
              <PxField label="حداکثر عرض" value={settings.max_width} onChange={(v) => patch('max_width', v)} min={320} max={1400} />
              <PxField label="حداقل عرض کارت" value={settings.card_min} onChange={(v) => patch('card_min', v)} min={100} max={280} />
              <PxField label="فاصله" value={settings.gap} onChange={(v) => patch('gap', v)} max={32} />
              <PxField label="گردی کارت" value={settings.card_radius} onChange={(v) => patch('card_radius', v)} max={28} />
              <PxField label="پدینگ کارت" value={settings.card_padding} onChange={(v) => patch('card_padding', v)} max={32} />
              <PxField label="اندازه آواتار" value={settings.avatar_size} onChange={(v) => patch('avatar_size', v)} min={36} max={96} />
            </div>
            <SpaceSection settings={settings} patch={patch} />
          </Accordion>
          <Accordion id="colors" title="رنگ‌ها" openId={openId} setOpenId={setOpenId}>
            <div className={styles.wsColorList}>
              {REPAIRS_TECH_COLORS.map((f) => (
                <ColorRow key={f.key} label={f.label} value={settings[f.key]} onChange={(v) => patch(f.key, v)} />
              ))}
            </div>
          </Accordion>
        </>
      ) : null}

      {type === 'repairs_services' ? (
        <>
          <Accordion id="content" title="محتوا" openId={openId} setOpenId={setOpenId}>
            <TextField label="Eyebrow" value={settings.eyebrow_text} onChange={(v) => patch('eyebrow_text', v)} />
            <TextField label="عنوان" value={settings.title} onChange={(v) => patch('title', v)} />
            <TextField label="زیرعنوان" value={settings.subtitle} onChange={(v) => patch('subtitle', v)} />
            <TextField label="متن CTA" value={settings.cta_label} onChange={(v) => patch('cta_label', v)} />
            <TextField label="لینک پایه" value={settings.link_base} onChange={(v) => patch('link_base', v)} dir="ltr" />
            <PxField label="تعداد نمایش" value={settings.limit} onChange={(v) => patch('limit', v)} min={1} max={48} />
          </Accordion>
          <Accordion id="display" title="نمایش و چیدمان" openId={openId} setOpenId={setOpenId}>
            <p className={styles.wsMiniLabel}>ستون‌ها</p>
            <Seg options={REPAIRS_COLUMNS.filter((c) => c.id <= 4)} value={settings.columns} onChange={(v) => patch('columns', v)} />
            <div className={styles.wsStack}>
              <Toggle checked={!!settings.show_eyebrow} onChange={(v) => patch('show_eyebrow', v)} label="Eyebrow" />
              <Toggle checked={!!settings.show_price} onChange={(v) => patch('show_price', v)} label="قیمت" />
              <Toggle checked={!!settings.show_unit} onChange={(v) => patch('show_unit', v)} label="نوع اجرت" />
              <Toggle checked={!!settings.show_desc} onChange={(v) => patch('show_desc', v)} label="توضیحات" />
              <Toggle checked={!!settings.show_cta} onChange={(v) => patch('show_cta', v)} label="لینک CTA" />
              <Toggle checked={!!settings.show_dot} onChange={(v) => patch('show_dot', v)} label="نقطه اکسنت" />
              <Toggle checked={!!settings.card_lift} onChange={(v) => patch('card_lift', v)} label="افکت هاور کارت" />
              <Toggle checked={!!settings.section_full} onChange={(v) => patch('section_full', v)} label="سکشن تمام‌عرض" />
            </div>
          </Accordion>
          <Accordion id="space" title="شکل و فاصله" openId={openId} setOpenId={setOpenId}>
            <div className={styles.wsPxGrid}>
              <PxField label="حداکثر عرض" value={settings.max_width} onChange={(v) => patch('max_width', v)} min={320} max={1400} />
              <PxField label="حداقل عرض کارت" value={settings.card_min} onChange={(v) => patch('card_min', v)} min={120} max={280} />
              <PxField label="فاصله" value={settings.gap} onChange={(v) => patch('gap', v)} max={32} />
              <PxField label="گردی کارت" value={settings.card_radius} onChange={(v) => patch('card_radius', v)} max={28} />
            </div>
            <SpaceSection settings={settings} patch={patch} />
          </Accordion>
          <Accordion id="colors" title="رنگ‌ها" openId={openId} setOpenId={setOpenId}>
            <div className={styles.wsColorList}>
              {REPAIRS_SVC_COLORS.map((f) => (
                <ColorRow key={f.key} label={f.label} value={settings[f.key]} onChange={(v) => patch(f.key, v)} />
              ))}
            </div>
          </Accordion>
        </>
      ) : null}

      {type === 'repairs_request' ? (
        <>
          <Accordion id="content" title="محتوا" openId={openId} setOpenId={setOpenId}>
            <TextField label="Eyebrow" value={settings.eyebrow_text} onChange={(v) => patch('eyebrow_text', v)} />
            <TextField label="عنوان" value={settings.title} onChange={(v) => patch('title', v)} />
            <TextField label="زیرعنوان" value={settings.subtitle} onChange={(v) => patch('subtitle', v)} />
            <TextField label="متن دکمه" value={settings.submit_label} onChange={(v) => patch('submit_label', v)} />
            <TextField label="راهنما" value={settings.success_hint} onChange={(v) => patch('success_hint', v)} />
          </Accordion>
          <Accordion id="display" title="نمایش" openId={openId} setOpenId={setOpenId}>
            <p className={styles.wsMiniLabel}>تراکم</p>
            <Seg
              options={[
                { id: 'comfortable', label: 'راحت' },
                { id: 'compact', label: 'فشرده' },
              ]}
              value={settings.density}
              onChange={(v) => patch('density', v)}
            />
            <div className={styles.wsStack}>
              <Toggle checked={!!settings.show_panel} onChange={(v) => patch('show_panel', v)} label="پنل پس‌زمینه" />
              <Toggle checked={!!settings.show_eyebrow} onChange={(v) => patch('show_eyebrow', v)} label="Eyebrow" />
              <Toggle checked={!!settings.show_deposit_hint} onChange={(v) => patch('show_deposit_hint', v)} label="نمایش مبلغ رزرو" />
              <Toggle checked={!!settings.show_brand_fields} onChange={(v) => patch('show_brand_fields', v)} label="فیلد برند/مدل" />
              <Toggle checked={!!settings.show_serial} onChange={(v) => patch('show_serial', v)} label="فیلد سریال" />
              <Toggle checked={!!settings.panel_shadow} onChange={(v) => patch('panel_shadow', v)} label="سایه پنل" />
              <Toggle checked={!!settings.section_full} onChange={(v) => patch('section_full', v)} label="سکشن تمام‌عرض" />
            </div>
          </Accordion>
          <Accordion id="space" title="شکل و فاصله" openId={openId} setOpenId={setOpenId}>
            <div className={styles.wsPxGrid}>
              <PxField label="حداکثر عرض" value={settings.max_width} onChange={(v) => patch('max_width', v)} min={320} max={900} />
              <PxField label="گردی پنل" value={settings.panel_radius} onChange={(v) => patch('panel_radius', v)} max={32} />
              <PxField label="پدینگ پنل" value={settings.panel_padding} onChange={(v) => patch('panel_padding', v)} max={40} />
              <PxField label="گردی ورودی" value={settings.input_radius} onChange={(v) => patch('input_radius', v)} max={24} />
              <PxField label="گردی دکمه" value={settings.button_radius} onChange={(v) => patch('button_radius', v)} max={24} />
            </div>
            <SpaceSection settings={settings} patch={patch} />
          </Accordion>
          <Accordion id="colors" title="رنگ‌ها" openId={openId} setOpenId={setOpenId}>
            <div className={styles.wsColorList}>
              {REPAIRS_REQ_COLORS.map((f) => (
                <ColorRow key={f.key} label={f.label} value={settings[f.key]} onChange={(v) => patch(f.key, v)} />
              ))}
            </div>
          </Accordion>
        </>
      ) : null}

      {type === 'repairs_track' ? (
        <>
          <Accordion id="content" title="محتوا" openId={openId} setOpenId={setOpenId}>
            <TextField label="Eyebrow" value={settings.eyebrow_text} onChange={(v) => patch('eyebrow_text', v)} />
            <TextField label="عنوان" value={settings.title} onChange={(v) => patch('title', v)} />
            <TextField label="زیرعنوان" value={settings.subtitle} onChange={(v) => patch('subtitle', v)} />
            <TextField label="برچسب کد" value={settings.code_label} onChange={(v) => patch('code_label', v)} />
            <TextField label="برچسب موبایل" value={settings.mobile_label} onChange={(v) => patch('mobile_label', v)} />
            <TextField label="متن دکمه" value={settings.submit_label} onChange={(v) => patch('submit_label', v)} />
            <TextField label="Placeholder کد" value={settings.code_placeholder} onChange={(v) => patch('code_placeholder', v)} />
            <TextField label="Placeholder موبایل" value={settings.mobile_placeholder} onChange={(v) => patch('mobile_placeholder', v)} />
          </Accordion>
          <Accordion id="display" title="نمایش" openId={openId} setOpenId={setOpenId}>
            <div className={styles.wsStack}>
              <Toggle checked={!!settings.show_eyebrow} onChange={(v) => patch('show_eyebrow', v)} label="Eyebrow" />
              <Toggle checked={!!settings.show_panel} onChange={(v) => patch('show_panel', v)} label="پنل پس‌زمینه" />
              <Toggle checked={!!settings.panel_shadow} onChange={(v) => patch('panel_shadow', v)} label="سایه پنل" />
              <Toggle checked={!!settings.section_full} onChange={(v) => patch('section_full', v)} label="سکشن تمام‌عرض" />
            </div>
          </Accordion>
          <Accordion id="space" title="شکل و فاصله" openId={openId} setOpenId={setOpenId}>
            <div className={styles.wsPxGrid}>
              <PxField label="حداکثر عرض" value={settings.max_width} onChange={(v) => patch('max_width', v)} min={280} max={800} />
              <PxField label="گردی پنل" value={settings.panel_radius} onChange={(v) => patch('panel_radius', v)} max={32} />
              <PxField label="پدینگ پنل" value={settings.panel_padding} onChange={(v) => patch('panel_padding', v)} max={40} />
            </div>
            <SpaceSection settings={settings} patch={patch} />
          </Accordion>
          <Accordion id="colors" title="رنگ‌ها" openId={openId} setOpenId={setOpenId}>
            <div className={styles.wsColorList}>
              {REPAIRS_TRACK_COLORS.map((f) => (
                <ColorRow key={f.key} label={f.label} value={settings[f.key]} onChange={(v) => patch(f.key, v)} />
              ))}
            </div>
          </Accordion>
        </>
      ) : null}
    </div>
  )
}
