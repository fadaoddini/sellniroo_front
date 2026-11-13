'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { ChevronDown, ExternalLink, Film, Smartphone } from 'lucide-react'
import {
  DEFAULT_VIDEO_ARCHIVE_WIDGET_SETTINGS,
  VIDEO_ARCHIVE_CARD_STYLES,
  VIDEO_ARCHIVE_COLOR_FIELDS,
  VIDEO_ARCHIVE_COLUMNS,
  VIDEO_ARCHIVE_FONTS,
  VIDEO_ARCHIVE_MARGIN_FIELDS,
  VIDEO_ARCHIVE_RECYCLER_ASPECTS,
  VIDEO_ARCHIVE_RECYCLER_VISIBLE,
  VIDEO_ARCHIVE_SITE_THEME,
  VIDEO_ARCHIVE_SPACE_FIELDS,
  VIDEO_ARCHIVE_TITLE_ALIGNS,
  normalizeVideoArchiveWidgetSettings,
} from '@/config/videoArchiveWidgetSettings'
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

function NumField({ label, value, onChange, min = 1, max = 48, unit }) {
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
        {unit ? <em>{unit}</em> : null}
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

function ColorRow({ label, value, onChange, allowEmpty = true }) {
  const hex = value && /^#/.test(value) ? value : '#be123c'
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
          placeholder="#hex"
          onChange={(e) => onChange(e.target.value)}
        />
        {allowEmpty && value ? (
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
 * تنظیمات پیشرفته ویجت آرشیو ویدیو / استوری
 */
export default function WidgetVideoArchiveSettings({
  type = 'video_gallery',
  settings: raw,
  onChange,
}) {
  const settings = normalizeVideoArchiveWidgetSettings(
    raw || DEFAULT_VIDEO_ARCHIVE_WIDGET_SETTINGS
  )
  const [openId, setOpenId] = useState('display')
  const patch = (key, value) => onChange?.({ [key]: value })

  const isRail =
    type === 'story' || type === 'story_circles' || type === 'featured_video'
  const isRecycler = type === 'video_archive_recycler'
  const isArchive =
    type === 'video_gallery' || type === 'video_archive_grid'

  const sectionColors = VIDEO_ARCHIVE_COLOR_FIELDS.filter((f) =>
    ['section_bg_from', 'section_bg_to', 'accent_color', 'accent_secondary'].includes(
      f.key
    )
  )
  const textColors = VIDEO_ARCHIVE_COLOR_FIELDS.filter((f) =>
    ['title_color', 'subtitle_color'].includes(f.key)
  )
  const cardColors = VIDEO_ARCHIVE_COLOR_FIELDS.filter((f) =>
    ['card_bg', 'card_border'].includes(f.key)
  )
  const storyColors = VIDEO_ARCHIVE_COLOR_FIELDS.filter((f) =>
    ['ring_color_1', 'ring_color_2', 'ring_color_3', 'rail_bg'].includes(f.key)
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
            aria-label="نمایش در موبایل"
          />
          <i />
        </span>
      </div>

      <Toggle
        checked={!!settings.show_on_desktop}
        onChange={(v) => patch('show_on_desktop', v)}
        label="نمایش در دسکتاپ"
      />

      <p className={styles.wsHint} style={{ marginTop: 4 }}>
        <Film size={13} style={{ verticalAlign: '-2px', marginLeft: 4 }} />
        مدیریت فایل‌های ویدیو از{' '}
        <span className={styles.wsLinks} style={{ display: 'inline' }}>
          <Link href="/videoinsta-manage">
            آرشیو ویدیو <ExternalLink size={11} style={{ verticalAlign: '-1px' }} />
          </Link>
        </span>
      </p>

      <Accordion id="display" title="نمایش" openId={openId} setOpenId={setOpenId}>
        <div className={styles.wsStack}>
          {isArchive ? (
            <Toggle
              checked={!!settings.show_desktop_section}
              onChange={(v) => patch('show_desktop_section', v)}
              label="نمایش بخش آرشیو"
            />
          ) : null}
          {isRail || isArchive ? (
            <Toggle
              checked={!!settings.show_mobile_rail}
              onChange={(v) => patch('show_mobile_rail', v)}
              label="نوار استوری موبایل"
              hint="دایره‌های استوری در موبایل"
            />
          ) : null}
          <Toggle
            checked={!!settings.show_title}
            onChange={(v) => patch('show_title', v)}
            label="عنوان"
          />
          <Toggle
            checked={!!settings.show_subtitle}
            onChange={(v) => patch('show_subtitle', v)}
            label="زیرعنوان"
          />
          <Toggle
            checked={!!settings.show_views}
            onChange={(v) => patch('show_views', v)}
            label="تعداد بازدید"
          />
          {!isRecycler ? (
            <Toggle
              checked={!!settings.show_add_button}
              onChange={(v) => patch('show_add_button', v)}
              label="دکمه افزودن (ادمین)"
            />
          ) : null}
          {isArchive ? (
            <Toggle
              checked={!!settings.show_pagination}
              onChange={(v) => patch('show_pagination', v)}
              label="صفحه‌بندی"
            />
          ) : null}
          {isRecycler ? (
            <>
              <Toggle
                checked={!!settings.recycler_show_arrows}
                onChange={(v) => patch('recycler_show_arrows', v)}
                label="فلش‌های اسکرول"
              />
              <Toggle
                checked={!!settings.recycler_drag_scroll}
                onChange={(v) => patch('recycler_drag_scroll', v)}
                label="اسکرول با کشیدن"
              />
              <Toggle
                checked={settings.show_view_all !== false}
                onChange={(v) => patch('show_view_all', v)}
                label="لینک «همه»"
                hint="رفتن به صفحه آرشیو /videos"
              />
            </>
          ) : null}
        </div>
      </Accordion>

      <Accordion id="content" title="متن‌ها" openId={openId} setOpenId={setOpenId}>
        <label className={styles.wsPxField}>
          <span>عنوان فارسی</span>
          <input
            className={styles.wsInput}
            type="text"
            value={settings.title_fa || ''}
            onChange={(e) => patch('title_fa', e.target.value)}
          />
        </label>
        <label className={styles.wsPxField}>
          <span>عنوان انگلیسی</span>
          <input
            className={styles.wsInput}
            type="text"
            value={settings.title_en || ''}
            onChange={(e) => patch('title_en', e.target.value)}
            dir="ltr"
          />
        </label>
        <label className={styles.wsPxField}>
          <span>زیرعنوان فارسی</span>
          <textarea
            className={styles.wsInput}
            rows={2}
            value={settings.subtitle_fa || ''}
            onChange={(e) => patch('subtitle_fa', e.target.value)}
          />
        </label>
        <label className={styles.wsPxField}>
          <span>زیرعنوان انگلیسی</span>
          <textarea
            className={styles.wsInput}
            rows={2}
            value={settings.subtitle_en || ''}
            onChange={(e) => patch('subtitle_en', e.target.value)}
            dir="ltr"
          />
        </label>
        <p className={styles.wsMiniLabel}>فونت عنوان بخش</p>
        <Seg
          options={VIDEO_ARCHIVE_FONTS}
          value={settings.title_font}
          onChange={(v) => patch('title_font', v)}
        />
        <p className={styles.wsMiniLabel}>فونت عنوان کارت‌ها</p>
        <Seg
          options={VIDEO_ARCHIVE_FONTS}
          value={settings.card_title_font}
          onChange={(v) => patch('card_title_font', v)}
        />
        <p className={styles.wsMiniLabel}>تراز عنوان</p>
        <Seg
          options={VIDEO_ARCHIVE_TITLE_ALIGNS}
          value={settings.title_align}
          onChange={(v) => patch('title_align', v)}
        />
        <div className={styles.wsPxGrid}>
          <PxField
            label="سایز عنوان"
            value={settings.title_font_size}
            onChange={(v) => patch('title_font_size', v)}
            min={14}
            max={48}
          />
          <PxField
            label="سایز زیرعنوان"
            value={settings.subtitle_font_size}
            onChange={(v) => patch('subtitle_font_size', v)}
            min={11}
            max={24}
          />
        </div>
        <Toggle
          checked={!!settings.title_font_bold}
          onChange={(v) => patch('title_font_bold', v)}
          label="عنوان ضخیم"
        />
      </Accordion>

      {isArchive ? (
        <Accordion
          id="layout"
          title="چیدمان آرشیو"
          openId={openId}
          setOpenId={setOpenId}
        >
          <NumField
            label="تعداد در هر صفحه"
            value={settings.count}
            onChange={(v) => patch('count', v)}
            min={4}
            max={24}
            unit="ویدیو"
          />
          <p className={styles.wsMiniLabel}>ستون‌ها</p>
          <Seg
            options={VIDEO_ARCHIVE_COLUMNS}
            value={settings.columns}
            onChange={(v) => patch('columns', v)}
          />
          <p className={styles.wsMiniLabel}>سبک کارت</p>
          <Seg
            options={VIDEO_ARCHIVE_CARD_STYLES}
            value={settings.card_style}
            onChange={(v) => patch('card_style', v)}
          />
          <div className={styles.wsPxGrid}>
            <PxField
              label="گردی کارت"
              value={settings.card_radius}
              onChange={(v) => patch('card_radius', v)}
              max={40}
            />
            <PxField
              label="فاصله کارت‌ها"
              value={settings.card_gap}
              onChange={(v) => patch('card_gap', v)}
              max={40}
            />
          </div>
        </Accordion>
      ) : null}

      {isRecycler ? (
        <Accordion
          id="recycler"
          title="چیدمان ریسایکلر"
          openId={openId}
          setOpenId={setOpenId}
        >
          <NumField
            label="تعداد آخرین ویدیوها"
            value={settings.count}
            onChange={(v) => patch('count', v)}
            min={1}
            max={48}
            unit="ویدیو"
          />
          <p className={styles.wsMiniLabel}>تعداد قابل‌مشاهده در دسکتاپ</p>
          <Seg
            options={VIDEO_ARCHIVE_RECYCLER_VISIBLE}
            value={settings.recycler_visible_desktop}
            onChange={(v) => patch('recycler_visible_desktop', v)}
          />
          <p className={styles.wsMiniLabel}>نسبت کارت</p>
          <Seg
            options={VIDEO_ARCHIVE_RECYCLER_ASPECTS}
            value={settings.recycler_aspect}
            onChange={(v) => patch('recycler_aspect', v)}
          />
          <div className={styles.wsPxGrid}>
            <PxField
              label="گردی کارت"
              value={settings.card_radius}
              onChange={(v) => patch('card_radius', v)}
              max={40}
            />
            <PxField
              label="فاصله کارت‌ها"
              value={settings.card_gap}
              onChange={(v) => patch('card_gap', v)}
              max={40}
            />
          </div>
          {settings.show_view_all !== false ? (
            <>
              <label className={styles.wsPxField}>
                <span>متن لینک همه (فارسی)</span>
                <input
                  className={styles.wsInput}
                  type="text"
                  value={settings.view_all_label_fa || ''}
                  onChange={(e) => patch('view_all_label_fa', e.target.value)}
                />
              </label>
              <label className={styles.wsPxField}>
                <span>آدرس صفحه آرشیو</span>
                <input
                  className={styles.wsInput}
                  type="text"
                  value={settings.view_all_href || '/videos'}
                  onChange={(e) => patch('view_all_href', e.target.value)}
                  dir="ltr"
                />
              </label>
            </>
          ) : null}
        </Accordion>
      ) : null}

      {isRail ? (
        <Accordion
          id="story"
          title="نوار استوری"
          openId={openId}
          setOpenId={setOpenId}
        >
          <div className={styles.wsPxGrid}>
            <PxField
              label="اندازه دایره"
              value={settings.story_size}
              onChange={(v) => patch('story_size', v)}
              min={48}
              max={120}
            />
            <PxField
              label="فاصله دایره‌ها"
              value={settings.story_gap}
              onChange={(v) => patch('story_gap', v)}
              max={40}
            />
          </div>
        </Accordion>
      ) : null}

      <Accordion id="space" title="فاصله و اندازه" openId={openId} setOpenId={setOpenId}>
        <Toggle
          checked={!!settings.section_full_bleed}
          onChange={(v) => patch('section_full_bleed', v)}
          label="تمام‌عرض بخش"
        />
        <PxField
          label="گردی بخش"
          value={settings.section_radius}
          onChange={(v) => patch('section_radius', v)}
          max={48}
        />
        <p className={styles.wsMiniLabel}>پدینگ</p>
        <div className={styles.wsPxGrid}>
          {VIDEO_ARCHIVE_SPACE_FIELDS.map((f) => (
            <PxField
              key={f.key}
              label={f.label}
              value={settings[f.key]}
              onChange={(v) => patch(f.key, v)}
            />
          ))}
        </div>
        <p className={styles.wsMiniLabel}>مارجین</p>
        <div className={styles.wsPxGrid}>
          {VIDEO_ARCHIVE_MARGIN_FIELDS.map((f) => (
            <PxField
              key={f.key}
              label={f.label}
              value={settings[f.key]}
              onChange={(v) => patch(f.key, v)}
            />
          ))}
        </div>
      </Accordion>

      <Accordion id="colors" title="رنگ‌ها" openId={openId} setOpenId={setOpenId}>
        <Toggle
          checked={settings.follow_site_theme !== false}
          onChange={(v) => {
            if (v) {
              onChange?.({
                follow_site_theme: true,
                ...VIDEO_ARCHIVE_SITE_THEME,
              })
            } else {
              patch('follow_site_theme', false)
            }
          }}
          label="پیروی از تم سایت"
          hint="کرم / طلایی سلنیرو"
        />
        {settings.follow_site_theme !== false ? (
          <p className={styles.wsHint}>
            رنگ‌ها از پالت برند سایت گرفته می‌شوند. برای سفارشی‌سازی، این گزینه را خاموش کنید.
          </p>
        ) : (
          <>
            <button
              type="button"
              className={styles.wsTinyBtn}
              style={{ marginBottom: 8 }}
              onClick={() =>
                onChange?.({
                  follow_site_theme: true,
                  ...VIDEO_ARCHIVE_SITE_THEME,
                })
              }
            >
              اعمال دوباره تم سایت
            </button>
            <p className={styles.wsMiniLabel}>بخش</p>
            {sectionColors.map((f) => (
              <ColorRow
                key={f.key}
                label={f.label}
                value={settings[f.key]}
                onChange={(v) => patch(f.key, v)}
                allowEmpty={false}
              />
            ))}
            <p className={styles.wsMiniLabel}>متن</p>
            {textColors.map((f) => (
              <ColorRow
                key={f.key}
                label={f.label}
                value={settings[f.key]}
                onChange={(v) => patch(f.key, v)}
              />
            ))}
            {isArchive ? (
              <>
                <p className={styles.wsMiniLabel}>کارت</p>
                {cardColors.map((f) => (
                  <ColorRow
                    key={f.key}
                    label={f.label}
                    value={settings[f.key]}
                    onChange={(v) => patch(f.key, v)}
                  />
                ))}
              </>
            ) : null}
            <p className={styles.wsMiniLabel}>استوری</p>
            {storyColors.map((f) => (
              <ColorRow
                key={f.key}
                label={f.label}
                value={settings[f.key]}
                onChange={(v) => patch(f.key, v)}
                allowEmpty={false}
              />
            ))}
          </>
        )}
      </Accordion>
    </div>
  )
}
