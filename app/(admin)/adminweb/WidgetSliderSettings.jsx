'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { ChevronDown, Monitor, Smartphone } from 'lucide-react'
import {
  DEFAULT_SLIDER_WIDGET_SETTINGS,
  SLIDER_DEVICES,
  SLIDER_DOTS_PLACES,
  SLIDER_HEIGHTS,
  SLIDER_INTERVALS,
  SLIDER_MARGIN_FIELDS,
  SLIDER_RADIUS_FIELDS,
  SLIDER_SPACE_FIELDS,
  buildSliderViewportPatch,
  getSliderVisibilityFlags,
  normalizeSliderWidgetSettings,
  snapshotSliderViewportSettings,
} from '@/config/sliderWidgetSettings'
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

function PxField({ label, value, onChange, max = 240 }) {
  return (
    <label className={styles.wsPxField}>
      <span>{label}</span>
      <span className={styles.wsPxInput}>
        <input
          type="number"
          min={0}
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

function ColorRow({ label, value, onChange, allowTransparent = false }) {
  const isTransparent = value === 'transparent'
  const hex = value && /^#/.test(value) ? value : '#0b1220'
  return (
    <div className={styles.wsColorRow}>
      <span className={styles.wsColorRowLabel}>{label}</span>
      <div className={styles.wsColorRowControls}>
        <input
          type="color"
          className={styles.wsColorSwatch}
          value={isTransparent ? '#0b1220' : hex}
          disabled={isTransparent}
          onChange={(e) => onChange(e.target.value)}
          aria-label={label}
        />
        <input
          type="text"
          className={styles.wsColorHex}
          dir="ltr"
          value={value || ''}
          placeholder="rgba / #hex"
          onChange={(e) => onChange(e.target.value)}
        />
        {allowTransparent ? (
          <button
            type="button"
            className={`${styles.wsTinyBtn} ${
              isTransparent ? styles.wsTinyBtnOn : ''
            }`}
            onClick={() =>
              onChange(isTransparent ? 'rgba(0, 0, 0, 0.25)' : 'transparent')
            }
          >
            شفاف
          </button>
        ) : null}
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

/**
 * پنل تنظیمات اسلایدر — دسکتاپ و موبایل جدا
 * @param {{ settings?: object, onChange: Function, type?: string }} props
 * type=featured_news_slider → منبع اخبار ویژه + count/offset
 */
export default function WidgetSliderSettings({
  settings: raw,
  onChange,
  type = 'hero_slider',
}) {
  const isFeaturedNews = type === 'featured_news_slider'
  const rawSettings = raw || DEFAULT_SLIDER_WIDGET_SETTINGS
  const [device, setDevice] = useState('desktop')
  const [openId, setOpenId] = useState('content')
  const visibility = getSliderVisibilityFlags(rawSettings)
  const settings = normalizeSliderWidgetSettings(rawSettings, {
    viewport: device,
  })
  const count = Math.max(
    1,
    Math.min(20, Number(rawSettings.count) || 5)
  )
  const offset = Math.max(0, Math.min(40, Number(rawSettings.offset) || 0))

  const patch = (key, value) => {
    onChange(buildSliderViewportPatch(rawSettings, device, key, value))
  }

  const patchRoot = (key, value) => {
    onChange({ [key]: value })
  }

  const copyDesktopToMobile = () => {
    onChange({
      mobile: snapshotSliderViewportSettings(rawSettings, 'desktop'),
    })
    setDevice('mobile')
  }

  return (
    <div className={styles.wsMinimal}>
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
        {SLIDER_DEVICES.map((d) => {
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
          ? 'فقط تنظیمات دسکتاپ — روی موبایل اثر نمی‌گذارد'
          : 'فقط تنظیمات موبایل — از دسکتاپ جدا است (بردر، فاصله، نقطه‌ها و …)'}
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

      <Accordion id="content" title="محتوا" openId={openId} setOpenId={setOpenId}>
        {isFeaturedNews ? (
          <>
            <div className={styles.wsLabelRow}>
              <p className={styles.wsMiniLabel}>اخبار ویژه اسلایدر</p>
              <Link
                href="/news-management?tab=featured"
                className={styles.wsGhostLink}
              >
                مدیریت
              </Link>
            </div>
            <p className={styles.wsHint}>
              اسلایدها از اخبار علامت‌خورده به‌عنوان ویژه ساخته می‌شوند — ظاهر
              اسلایدر مثل هیرو کاملاً قابل تنظیم است.
            </p>
            <div className={styles.wsPxGrid}>
              <PxField
                label="تعداد خبر"
                value={count}
                onChange={(v) =>
                  patchRoot('count', Math.max(1, Math.min(20, v || 1)))
                }
                max={20}
              />
              <PxField
                label="افست"
                value={offset}
                onChange={(v) =>
                  patchRoot('offset', Math.max(0, Math.min(40, v || 0)))
                }
                max={40}
              />
            </div>
            <p className={styles.wsHint}>
              افست {offset} یعنی از خبر شماره {offset + 1} نمایش شروع می‌شود
            </p>
          </>
        ) : (
          <>
            <div className={styles.wsLabelRow}>
              <p className={styles.wsMiniLabel}>اسلایدها</p>
              <Link href="/hero-slider" className={styles.wsGhostLink}>
                مدیریت
              </Link>
            </div>
            <p className={styles.wsHint}>
              اسلایدها از صفحه مدیریت هیرو خوانده می‌شوند (مشترک برای هر دو حالت).
            </p>
          </>
        )}
      </Accordion>

      <Accordion id="space" title="شکل و فاصله" openId={openId} setOpenId={setOpenId}>
        <div className={styles.wsStack}>
          <Toggle
            checked={!!settings.full_bleed}
            onChange={(v) => patch('full_bleed', v)}
            label="تمام‌عرض صفحه"
            hint={
              settings.full_bleed
                ? 'لبه به لبه — مناسب دسکتاپ'
                : 'با فاصله از کنار — مناسب موبایل'
            }
          />
        </div>

        <p className={styles.wsMiniLabel}>Padding</p>
        <div className={styles.wsPxGrid}>
          {SLIDER_SPACE_FIELDS.map((f) => (
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
          {SLIDER_MARGIN_FIELDS.map((f) => (
            <PxField
              key={f.key}
              label={f.label}
              value={settings[f.key]}
              onChange={(v) => patch(f.key, v)}
            />
          ))}
        </div>
        {settings.full_bleed ? (
          <p className={styles.wsHint}>
            در تمام‌عرض، مارجین چپ/راست اعمال نمی‌شود
          </p>
        ) : null}

        <p className={`${styles.wsMiniLabel} ${styles.wsMiniLabelSpaced}`}>
          گردی گوشه‌ها
        </p>
        <div className={styles.wsPxGrid}>
          {SLIDER_RADIUS_FIELDS.map((f) => (
            <PxField
              key={f.key}
              label={f.label}
              value={settings[f.key]}
              onChange={(v) => patch(f.key, v)}
              max={64}
            />
          ))}
        </div>
      </Accordion>

      <Accordion id="size" title="ارتفاع" openId={openId} setOpenId={setOpenId}>
        <Seg
          options={SLIDER_HEIGHTS}
          value={settings.height}
          onChange={(v) => patch('height', v)}
        />
      </Accordion>

      <Accordion id="display" title="نمایش" openId={openId} setOpenId={setOpenId}>
        <div className={styles.wsStack}>
          <Toggle
            checked={!!settings.show_caption}
            onChange={(v) => patch('show_caption', v)}
            label="عنوان و توضیح"
          />
          <Toggle
            checked={!!settings.show_arrows}
            onChange={(v) => patch('show_arrows', v)}
            label="فلش‌های قبلی/بعدی"
          />
          <Toggle
            checked={!!settings.show_dots}
            onChange={(v) => patch('show_dots', v)}
            label="نقطه‌های اسلاید"
          />
          {settings.show_dots ? (
            <>
              <p className={`${styles.wsMiniLabel} ${styles.wsMiniLabelSpaced}`}>
                جای نقطه‌ها
              </p>
              <Seg
                options={SLIDER_DOTS_PLACES}
                value={settings.dots_place}
                onChange={(v) => patch('dots_place', v)}
              />
            </>
          ) : null}
          <Toggle
            checked={!!settings.swipe_drag}
            onChange={(v) => patch('swipe_drag', v)}
            label="کشیدن برای عوض کردن اسلاید"
            hint="مثل اپ؛ با انگشت یا موس بکشید"
          />
        </div>
      </Accordion>

      {settings.show_dots ? (
        <Accordion
          id="dotsStyle"
          title="استایل نقطه‌ها"
          openId={openId}
          setOpenId={setOpenId}
        >
          <p className={styles.wsMiniLabel}>ظرف نقطه‌ها</p>
          <div className={`${styles.wsColorList} ${styles.wsColorListSpaced}`}>
            <ColorRow
              label="پس‌زمینه"
              value={settings.dots_bg}
              onChange={(v) => patch('dots_bg', v)}
              allowTransparent
            />
            <ColorRow
              label="رنگ بردر"
              value={settings.dots_border_color}
              onChange={(v) => patch('dots_border_color', v)}
              allowTransparent
            />
          </div>
          <div className={styles.wsPxGrid}>
            <PxField
              label="ضخامت بردر"
              value={settings.dots_border_width}
              onChange={(v) => patch('dots_border_width', v)}
              max={8}
            />
            <PxField
              label="گردی"
              value={settings.dots_radius}
              onChange={(v) => patch('dots_radius', v)}
              max={999}
            />
            <PxField
              label="پدینگ عمودی"
              value={settings.dots_pad_y}
              onChange={(v) => patch('dots_pad_y', v)}
              max={32}
            />
            <PxField
              label="پدینگ افقی"
              value={settings.dots_pad_x}
              onChange={(v) => patch('dots_pad_x', v)}
              max={48}
            />
            <PxField
              label="فاصله نقطه‌ها"
              value={settings.dots_gap}
              onChange={(v) => patch('dots_gap', v)}
              max={32}
            />
            <PxField
              label="بلور پس‌زمینه"
              value={settings.dots_blur}
              onChange={(v) => patch('dots_blur', v)}
              max={40}
            />
            {settings.dots_place === 'below' ? (
              <PxField
                label="فاصله از بالا"
                value={settings.dots_margin_top}
                onChange={(v) => patch('dots_margin_top', v)}
                max={64}
              />
            ) : null}
          </div>

          <p className={`${styles.wsMiniLabel} ${styles.wsMiniLabelSpaced}`}>
            سایه
          </p>
          <div className={styles.wsStack}>
            <Toggle
              checked={!!settings.dots_shadow}
              onChange={(v) => patch('dots_shadow', v)}
              label="سایه ظرف"
            />
          </div>
          {settings.dots_shadow ? (
            <>
              <div
                className={`${styles.wsColorList} ${styles.wsColorListSpaced}`}
              >
                <ColorRow
                  label="رنگ سایه"
                  value={settings.dots_shadow_color}
                  onChange={(v) => patch('dots_shadow_color', v)}
                />
              </div>
              <div className={styles.wsPxGrid}>
                <PxField
                  label="محو سایه"
                  value={settings.dots_shadow_blur}
                  onChange={(v) => patch('dots_shadow_blur', v)}
                  max={48}
                />
                <PxField
                  label="جابه‌جایی عمودی"
                  value={settings.dots_shadow_y}
                  onChange={(v) => patch('dots_shadow_y', v)}
                  max={40}
                />
              </div>
            </>
          ) : null}

          <p className={`${styles.wsMiniLabel} ${styles.wsMiniLabelSpaced}`}>
            خود نقطه‌ها
          </p>
          <div className={`${styles.wsColorList} ${styles.wsColorListSpaced}`}>
            <ColorRow
              label="رنگ نقطه"
              value={settings.dots_dot_color}
              onChange={(v) => patch('dots_dot_color', v)}
            />
            <ColorRow
              label="هاور"
              value={settings.dots_dot_hover}
              onChange={(v) => patch('dots_dot_hover', v)}
            />
            <ColorRow
              label="فعال"
              value={settings.dots_dot_active}
              onChange={(v) => patch('dots_dot_active', v)}
            />
            <ColorRow
              label="پرشدن انیمیشن (شروع)"
              value={settings.dots_progress_from}
              onChange={(v) => patch('dots_progress_from', v)}
            />
            <ColorRow
              label="پرشدن انیمیشن (پایان)"
              value={settings.dots_progress_to}
              onChange={(v) => patch('dots_progress_to', v)}
            />
          </div>
          <div className={styles.wsPxGrid}>
            <PxField
              label="اندازه"
              value={settings.dots_dot_size}
              onChange={(v) => patch('dots_dot_size', v)}
              max={24}
            />
            <PxField
              label="عرض فعال"
              value={settings.dots_dot_active_width}
              onChange={(v) => patch('dots_dot_active_width', v)}
              max={64}
            />
          </div>
        </Accordion>
      ) : null}

      <Accordion id="play" title="پخش خودکار" openId={openId} setOpenId={setOpenId}>
        <div className={styles.wsStack}>
          <Toggle
            checked={!!settings.autoplay}
            onChange={(v) => patch('autoplay', v)}
            label="چرخش خودکار"
          />
        </div>
        {settings.autoplay ? (
          <Seg
            options={SLIDER_INTERVALS}
            value={settings.autoplay_ms}
            onChange={(v) => patch('autoplay_ms', v)}
          />
        ) : null}
      </Accordion>
    </div>
  )
}
