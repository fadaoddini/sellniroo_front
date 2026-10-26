'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { ChevronDown, ExternalLink, Smartphone } from 'lucide-react'
import {
  DEFAULT_NEWS_WIDGET_SETTINGS,
  DEFAULT_NEWS_MAGAZINE_SETTINGS,
  NEWS_BAR_COLORS,
  NEWS_BORDER_STYLES,
  NEWS_FONTS,
  NEWS_IMAGE_SHAPES,
  NEWS_TEXT_MARKERS,
  NEWS_CARD_RADIUS_FIELDS,
  NEWS_MARGIN_FIELDS,
  NEWS_MAGAZINE_ASPECTS,
  NEWS_MAGAZINE_CARD_STYLES,
  NEWS_MAGAZINE_COLUMNS,
  NEWS_MAGAZINE_PAGINATION_POSITIONS,
  NEWS_MAGAZINE_PAGINATION_STYLES,
  NEWS_READ_MORE_PLACES,
  NEWS_READ_MORE_ALIGNS,
  NEWS_READ_MORE_RADIUS_FIELDS,
  NEWS_SPACE_FIELDS,
  NEWS_STATS_LAYOUTS,
  NEWS_RECYCLER_TEXT_Y,
  NEWS_RECYCLER_TEXT_X,
  NEWS_RECYCLER_ASPECTS,
  normalizeNewsWidgetSettings,
  normalizeNewsMagazineSettings,
} from '@/config/newsWidgetSettings'
import newsService from '@/services/newsService'
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

function NumField({ label, value, onChange, min = 0, max = 200, unit }) {
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
  const hex = value && /^#/.test(value) ? value : '#ffffff'
  return (
    <div className={styles.wsColorRow}>
      <span className={styles.wsColorRowLabel}>{label}</span>
      <div className={styles.wsColorRowControls}>
        <input
          type="color"
          className={styles.wsColorSwatch}
          value={isTransparent ? '#ffffff' : hex}
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
 * پنل تنظیمات ویجت‌های خبری (لیست / دسته / ویژه / افقی / اسلایدر ویژه)
 */
export default function WidgetNewsSettings({
  settings: raw,
  onChange,
  type = 'latest_news',
}) {
  const isNewsList = type === 'news_list'
  const settings = isNewsList
    ? normalizeNewsMagazineSettings(raw || DEFAULT_NEWS_MAGAZINE_SETTINGS)
    : normalizeNewsWidgetSettings(raw || DEFAULT_NEWS_WIDGET_SETTINGS)
  const isCategory = type === 'news_by_category'
  const isSlider = type === 'featured_news_slider'
  const isFeaturedList = type === 'featured_news'
  const isLatest = type === 'latest_news'
  const isRecycler = type === 'latest_news_recycler'
  const isListUi = !isSlider && !isNewsList

  const [openId, setOpenId] = useState(
    isRecycler ? 'recycler' : isNewsList ? 'magazine' : 'content'
  )
  const [categories, setCategories] = useState([])
  const [catLoading, setCatLoading] = useState(false)
  const patch = (key, value) => onChange({ [key]: value })

  useEffect(() => {
    setOpenId(isRecycler ? 'recycler' : isNewsList ? 'magazine' : 'content')
  }, [isRecycler, isNewsList])

  useEffect(() => {
    if (!isCategory && !isFeaturedList && !isLatest && !isNewsList && !isRecycler)
      return undefined
    let cancelled = false
    setCatLoading(true)
    newsService.getCategories().then((res) => {
      if (cancelled) return
      const raw = Array.isArray(res?.data) ? res.data : []
      const flat = []
      const walk = (nodes, depth = 0) => {
        ;(nodes || []).forEach((n) => {
          if (!n?.slug) return
          flat.push({
            id: n.id,
            slug: n.slug,
            name: `${depth ? `${'— '.repeat(depth)}` : ''}${n.name}`,
            news_count: n.news_count,
          })
          if (Array.isArray(n.children) && n.children.length) {
            walk(n.children, depth + 1)
          }
        })
      }
      walk(raw)
      setCategories(flat)
      setCatLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [isCategory, isFeaturedList, isLatest, isNewsList, isRecycler])

  if (isNewsList) {
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

        <Accordion
          id="magazine"
          title="لیست اخبار (مجله)"
          openId={openId}
          setOpenId={setOpenId}
        >
          <div className={styles.wsLabelRow}>
            <p className={styles.wsMiniLabel}>شبیه صفحه /news</p>
            <Link href="/news-list" className={styles.wsGhostLink}>
              <ExternalLink size={13} style={{ verticalAlign: 'middle' }} />{' '}
              تنظیمات کامل داشبورد
            </Link>
          </div>
          <p className={styles.wsHint}>
            گرید کارت، صفحه‌بندی، جستجو و دسته‌ها — ظاهر مجله اخبار
          </p>
          <label className={styles.wsPxField}>
            <span>عنوان بخش</span>
            <input
              className={styles.wsInput}
              type="text"
              value={settings.title || ''}
              onChange={(e) => patch('title', e.target.value)}
            />
          </label>
          <p className={styles.wsMiniLabel}>دسته پیش‌فرض</p>
          <select
            className={styles.wsInput}
            value={settings.category_slug || ''}
            onChange={(e) => patch('category_slug', e.target.value)}
            disabled={catLoading}
          >
            <option value="">
              {catLoading ? 'در حال بارگذاری…' : 'همه دسته‌ها'}
            </option>
            {categories.map((c) => (
              <option key={c.id || c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
          <NumField
            label="تعداد در هر صفحه"
            value={settings.per_page}
            onChange={(v) => patch('per_page', v)}
            min={4}
            max={24}
            unit="خبر"
          />
          <p className={styles.wsMiniLabel}>کارت در هر ردیف</p>
          <div
            className={styles.wsSeg}
            style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}
          >
            {NEWS_MAGAZINE_COLUMNS.map((o) => (
              <button
                key={o.id}
                type="button"
                className={`${styles.wsSegBtn} ${
                  Number(settings.columns) === o.id ? styles.wsSegBtnActive : ''
                }`}
                onClick={() => patch('columns', o.id)}
              >
                {o.label}
              </button>
            ))}
          </div>
          <p className={styles.wsMiniLabel}>سبک کارت</p>
          <div
            className={styles.wsSeg}
            style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}
          >
            {NEWS_MAGAZINE_CARD_STYLES.map((o) => (
              <button
                key={o.id}
                type="button"
                className={`${styles.wsSegBtn} ${
                  settings.card_style === o.id ? styles.wsSegBtnActive : ''
                }`}
                onClick={() => patch('card_style', o.id)}
                title={o.hint}
              >
                {o.label}
              </button>
            ))}
          </div>
          <p className={styles.wsHint}>
            {NEWS_MAGAZINE_CARD_STYLES.find((x) => x.id === settings.card_style)
              ?.hint || ''}
          </p>
          <p className={styles.wsMiniLabel}>شکل صفحه‌بندی</p>
          <div
            className={styles.wsSeg}
            style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}
          >
            {NEWS_MAGAZINE_PAGINATION_STYLES.map((o) => (
              <button
                key={o.id}
                type="button"
                className={`${styles.wsSegBtn} ${
                  settings.pagination_style === o.id ? styles.wsSegBtnActive : ''
                }`}
                onClick={() => patch('pagination_style', o.id)}
                title={o.hint}
              >
                {o.label}
              </button>
            ))}
          </div>
          <p className={styles.wsMiniLabel}>جایگاه صفحه‌بندی</p>
          <div
            className={styles.wsSeg}
            style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}
          >
            {NEWS_MAGAZINE_PAGINATION_POSITIONS.map((o) => (
              <button
                key={o.id}
                type="button"
                className={`${styles.wsSegBtn} ${
                  settings.pagination_position === o.id
                    ? styles.wsSegBtnActive
                    : ''
                }`}
                onClick={() => patch('pagination_position', o.id)}
              >
                {o.label}
              </button>
            ))}
          </div>
          <p className={styles.wsMiniLabel}>جزئیات کارت</p>
          <div className={styles.wsStack}>
            <Toggle
              checked={!!settings.show_card_title}
              onChange={(v) => patch('show_card_title', v)}
              label="عنوان"
            />
            <Toggle
              checked={!!settings.show_card_excerpt}
              onChange={(v) => patch('show_card_excerpt', v)}
              label="لید"
            />
            <Toggle
              checked={!!settings.show_read_more}
              onChange={(v) => patch('show_read_more', v)}
              label="ادامه مطلب"
            />
            <Toggle
              checked={!!settings.show_likes}
              onChange={(v) => patch('show_likes', v)}
              label="لایک"
            />
            <Toggle
              checked={!!settings.show_share}
              onChange={(v) => patch('show_share', v)}
              label="اشتراک (بله/ایتا/روبیکا/سروش)"
            />
          </div>
          {settings.show_read_more ? (
            <>
              <p className={styles.wsMiniLabel}>جایگاه ادامه مطلب</p>
              <select
                className={styles.wsInput}
                value={settings.read_more_place || 'flow'}
                onChange={(e) => patch('read_more_place', e.target.value)}
              >
                {NEWS_READ_MORE_PLACES.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.label}
                  </option>
                ))}
              </select>
            </>
          ) : null}
          <p className={styles.wsMiniLabel}>نسبت تصویر</p>
          <div
            className={styles.wsSeg}
            style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}
          >
            {NEWS_MAGAZINE_ASPECTS.map((o) => (
              <button
                key={o.id}
                type="button"
                className={`${styles.wsSegBtn} ${
                  settings.card_aspect === o.id ? styles.wsSegBtnActive : ''
                }`}
                onClick={() => patch('card_aspect', o.id)}
              >
                {o.label}
              </button>
            ))}
          </div>
          <div className={styles.wsStack}>
            <Toggle
              checked={!!settings.show_title}
              onChange={(v) => patch('show_title', v)}
              label="عنوان بخش"
            />
            <Toggle
              checked={!!settings.show_search}
              onChange={(v) => patch('show_search', v)}
              label="جستجو"
            />
            <Toggle
              checked={!!settings.show_categories}
              onChange={(v) => patch('show_categories', v)}
              label="دسته‌ها"
            />
            <Toggle
              checked={!!settings.show_stats_bar}
              onChange={(v) => patch('show_stats_bar', v)}
              label="نوار آمار بالا"
            />
            <Toggle
              checked={!!settings.show_total_count}
              onChange={(v) => patch('show_total_count', v)}
              label="تعداد محتوا"
            />
            <Toggle
              checked={!!settings.show_page_info}
              onChange={(v) => patch('show_page_info', v)}
              label="شماره صفحه در نوار"
            />
            <Toggle
              checked={!!settings.show_pagination}
              onChange={(v) => patch('show_pagination', v)}
              label="صفحه‌بندی"
            />
            <Toggle
              checked={!!settings.card_border}
              onChange={(v) => patch('card_border', v)}
              label="بردر کارت"
            />
            <Toggle
              checked={!!settings.card_shadow}
              onChange={(v) => patch('card_shadow', v)}
              label="باکس‌شادو"
            />
          </div>
          <ColorRow
            label="رنگ تاکید"
            value={settings.accent_color}
            onChange={(v) => patch('accent_color', v)}
          />
          <ColorRow
            label="رنگ عنوان"
            value={settings.title_color || settings.ink_color}
            onChange={(v) => patch('title_color', v)}
          />
          <ColorRow
            label="رنگ متن"
            value={settings.ink_color}
            onChange={(v) => patch('ink_color', v)}
          />
        </Accordion>
      </div>
    )
  }

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

      {isRecycler ? (
        <Accordion
          id="recycler"
          title="ریسایکلرویوی اخبار (ظاهر و اسکرول)"
          openId={openId}
          setOpenId={setOpenId}
        >
          <div className={styles.wsLabelRow}>
            <p className={styles.wsMiniLabel}>ریسایکلرویوی اخبار</p>
            <Link href="/news-recycler" className={styles.wsGhostLink}>
              <ExternalLink size={13} style={{ verticalAlign: 'middle' }} />{' '}
              تنظیمات کامل در داشبورد
            </Link>
          </div>
          <p className={styles.wsHint}>
            در داشبورد همه چیز هست: داده، پالت رنگ، کارت، اسکرول و آمار — اینجا
            هم قابل ویرایش سریع است
          </p>

          <p className={styles.wsMiniLabel}>سکشن</p>
          <div className={styles.wsStack}>
            <Toggle
              checked={!!settings.recycler_section_full}
              onChange={(v) => patch('recycler_section_full', v)}
              label="سکشن تمام‌عرض"
              hint="پس‌زمینه لبه به لبه؛ خود ریسایکلر داخل container می‌ماند"
            />
          </div>
          <ColorRow
            label="رنگ شروع گرادیان سکشن"
            value={settings.recycler_section_from}
            onChange={(v) => patch('recycler_section_from', v)}
            allowTransparent
          />
          <ColorRow
            label="رنگ پایان گرادیان سکشن"
            value={settings.recycler_section_to}
            onChange={(v) => patch('recycler_section_to', v)}
            allowTransparent
          />
          <PxField
            label="زاویه گرادیان"
            value={settings.recycler_section_angle}
            onChange={(v) => patch('recycler_section_angle', v)}
            min={0}
            max={360}
          />
          <p className={`${styles.wsMiniLabel} ${styles.wsMiniLabelSpaced}`}>
            پدینگ سکشن
          </p>
          <div className={styles.wsPxGrid}>
            <PxField
              label="بالا"
              value={settings.padding_top}
              onChange={(v) => patch('padding_top', v)}
              max={200}
            />
            <PxField
              label="پایین"
              value={settings.padding_bottom}
              onChange={(v) => patch('padding_bottom', v)}
              max={200}
            />
          </div>
          <p className={styles.wsHint}>
            فاصله عمودی گرادیان سکشن از محتوا — پیش‌فرض ۲۸px
          </p>

          <p className={`${styles.wsMiniLabel} ${styles.wsMiniLabelSpaced}`}>
            فونت و رنگ متن
          </p>
          <Seg
            options={NEWS_FONTS}
            value={settings.font_family}
            onChange={(v) => patch('font_family', v)}
            cols={2}
          />
          <div className={styles.wsPxGrid}>
            <PxField
              label="اندازه فونت"
              value={settings.font_size}
              onChange={(v) => patch('font_size', v)}
              min={10}
              max={28}
            />
          </div>
          <div className={styles.wsStack}>
            <Toggle
              checked={!!settings.font_bold}
              onChange={(v) => patch('font_bold', v)}
              label="متن بولد"
            />
          </div>
          <ColorRow
            label="رنگ متن روی تصویر"
            value={settings.recycler_text_color}
            onChange={(v) => patch('recycler_text_color', v)}
          />
          <ColorRow
            label="پس‌زمینه لایه متن"
            value={settings.recycler_overlay_bg}
            onChange={(v) => patch('recycler_overlay_bg', v)}
            allowTransparent
          />
          <p className={styles.wsHint}>
            شفاف = بدون رنگ پشت عنوان؛ فقط تصویر دیده می‌شود
          </p>
          <div className={styles.wsStack}>
            <Toggle
              checked={!!settings.recycler_show_gradient}
              onChange={(v) => patch('recycler_show_gradient', v)}
              label="گرادیان تیره قوی‌تر"
              hint="روشن = تیره‌تر برای خوانایی بهتر عنوان"
            />
            <Toggle
              checked={!!settings.recycler_card_shadow}
              onChange={(v) => patch('recycler_card_shadow', v)}
              label="سایه زیر کارت"
            />
          </div>

          <p className={`${styles.wsMiniLabel} ${styles.wsMiniLabelSpaced}`}>
            بردر کارت
          </p>
          <div className={styles.wsPxGrid}>
            <PxField
              label="ضخامت بردر"
              value={settings.recycler_card_border_width}
              onChange={(v) => patch('recycler_card_border_width', v)}
              min={0}
              max={12}
            />
          </div>
          <ColorRow
            label="رنگ بردر"
            value={settings.recycler_card_border_color}
            onChange={(v) => patch('recycler_card_border_color', v)}
            allowTransparent
          />
          <ColorRow
            label="رنگ بردر در هاور"
            value={settings.recycler_card_border_hover}
            onChange={(v) => patch('recycler_card_border_hover', v)}
            allowTransparent
          />
          <p className={styles.wsHint}>
            ضخامت ۰ = بدون بردر
          </p>

          <p className={`${styles.wsMiniLabel} ${styles.wsMiniLabelSpaced}`}>
            کارت و نسبت تصویر
          </p>
          <Seg
            options={NEWS_RECYCLER_ASPECTS}
            value={settings.recycler_aspect}
            onChange={(v) => patch('recycler_aspect', v)}
            cols={3}
          />
          <p className={styles.wsHint}>
            مثلاً ۱۶:۹ — در حالت آزاد ارتفاع دستی اعمال می‌شود
          </p>
          {settings.recycler_aspect === 'free' ? (
            <PxField
              label="ارتفاع کارت"
              value={settings.recycler_height}
              onChange={(v) => patch('recycler_height', v)}
              min={160}
              max={520}
            />
          ) : null}
          <div className={styles.wsStack}>
            <Toggle
              checked={!!settings.recycler_image_crop}
              onChange={(v) => patch('recycler_image_crop', v)}
              label="کراپ تصویر"
              hint="خاموش = تصویر کامل (contain)"
            />
          </div>
          <p className={`${styles.wsMiniLabel} ${styles.wsMiniLabelSpaced}`}>
            موقعیت عمودی متن
          </p>
          <Seg
            options={NEWS_RECYCLER_TEXT_Y}
            value={settings.recycler_text_y}
            onChange={(v) => patch('recycler_text_y', v)}
          />
          <p className={`${styles.wsMiniLabel} ${styles.wsMiniLabelSpaced}`}>
            تراز افقی متن
          </p>
          <Seg
            options={NEWS_RECYCLER_TEXT_X}
            value={settings.recycler_text_x}
            onChange={(v) => patch('recycler_text_x', v)}
            cols={2}
          />

          <p className={`${styles.wsMiniLabel} ${styles.wsMiniLabelSpaced}`}>
            اسکرول و ناوبری
          </p>
          <NumField
            label="تعداد کنار هم (نگاه اول)"
            value={settings.recycler_visible_desktop}
            onChange={(v) => patch('recycler_visible_desktop', v)}
            min={1}
            max={8}
            unit="تایی"
          />
          <p className={styles.wsHint}>
            چند کارت هم‌زمان در عرض دیده شود (مثلاً ۴)
          </p>
          <div className={styles.wsStack}>
            <Toggle
              checked={!!settings.recycler_drag_scroll}
              onChange={(v) => patch('recycler_drag_scroll', v)}
              label="اسکرول با کشیدن موس"
              hint="کلیک کنید و بکشید تا کارت‌ها جابه‌جا شوند"
            />
            <Toggle
              checked={!!settings.recycler_show_arrows}
              onChange={(v) => patch('recycler_show_arrows', v)}
              label="دکمه قبلی / بعدی"
            />
            <Toggle
              checked={!!settings.recycler_autoplay}
              onChange={(v) => patch('recycler_autoplay', v)}
              label="حرکت خودکار"
            />
            {settings.recycler_autoplay ? (
              <>
                <NumField
                  label="فاصله حرکت خودکار"
                  value={settings.recycler_autoplay_ms}
                  onChange={(v) => patch('recycler_autoplay_ms', v)}
                  min={1500}
                  max={15000}
                  unit="ms"
                />
                <Toggle
                  checked={!!settings.recycler_pause_on_hover}
                  onChange={(v) => patch('recycler_pause_on_hover', v)}
                  label="توقف با هاور موس"
                  hint="با رفتن موس روی ریسایکلر، حرکت خودکار قطع شود"
                />
              </>
            ) : null}
          </div>
        </Accordion>
      ) : null}

      <Accordion id="content" title="محتوا" openId={openId} setOpenId={setOpenId}>
        {isCategory || isFeaturedList || isLatest || isRecycler ? (
          <div className={styles.wsGuest}>
            <p className={styles.wsMiniLabel}>دسته‌بندی</p>
            <select
              className={styles.wsInput}
              value={settings.category_slug || ''}
              onChange={(e) => patch('category_slug', e.target.value)}
              disabled={catLoading}
            >
              <option value="">
                {catLoading
                  ? 'در حال بارگذاری…'
                  : isFeaturedList
                    ? 'همهٔ اخبار ویژه'
                    : isLatest || isRecycler
                      ? 'همهٔ آخرین اخبار'
                      : 'انتخاب دسته…'}
              </option>
              {categories.map((c) => (
                <option key={c.id || c.slug} value={c.slug}>
                  {c.name}
                  {typeof c.news_count === 'number' ? ` (${c.news_count})` : ''}
                </option>
              ))}
            </select>
            <p className={styles.wsHint}>
              {isFeaturedList
                ? 'اختیاری — فقط اخبار ویژهٔ همین دسته (خالی = همهٔ ویژه)'
                : isLatest || isRecycler
                  ? 'اختیاری — فقط آخرین اخبار همین دسته (خالی = همه)'
                  : 'فقط اخبار همین دسته نمایش داده می‌شود'}
            </p>
          </div>
        ) : null}

        {isLatest ? (
          <>
            <div className={styles.wsLabelRow}>
              <p className={styles.wsMiniLabel}>آخرین اخبار</p>
              <Link href="/news-latest" className={styles.wsGhostLink}>
                <ExternalLink size={13} style={{ verticalAlign: 'middle' }} />{' '}
                مدیریت در داشبورد
              </Link>
            </div>
            <p className={styles.wsHint}>
              دسته، تعداد، افست و تنظیمات کلی داده از داشبورد هم قابل ویرایش است؛
              رنگ و ظاهر فقط اینجا
            </p>
          </>
        ) : null}

        {isCategory ? (
          <>
            <div className={styles.wsLabelRow}>
              <p className={styles.wsMiniLabel}>اخبار یک دسته</p>
              <Link href="/news-by-category" className={styles.wsGhostLink}>
                <ExternalLink size={13} style={{ verticalAlign: 'middle' }} />{' '}
                مدیریت در داشبورد
              </Link>
            </div>
            <p className={styles.wsHint}>
              دسته، تعداد، افست و تنظیمات کلی داده از داشبورد هم قابل ویرایش است؛
              رنگ و ظاهر فقط اینجا
            </p>
          </>
        ) : null}

        {isFeaturedList ? (
          <>
            <div className={styles.wsLabelRow}>
              <p className={styles.wsMiniLabel}>اخبار ویژه لیست سفارشی</p>
              <Link href="/news-featured-list" className={styles.wsGhostLink}>
                <ExternalLink size={13} style={{ verticalAlign: 'middle' }} />{' '}
                مدیریت در داشبورد
              </Link>
            </div>
            <p className={styles.wsHint}>
              دسته، تعداد، افست و تنظیمات کلی داده از داشبورد هم قابل ویرایش است؛
              رنگ و ظاهر فقط اینجا
            </p>
          </>
        ) : null}

        {isSlider ? (
          <>
            <div className={styles.wsLabelRow}>
              <p className={styles.wsMiniLabel}>اخبار ویژه اسلایدر</p>
              <Link
                href="/news-management?tab=featured"
                className={styles.wsGhostLink}
              >
                <ExternalLink size={13} style={{ verticalAlign: 'middle' }} />{' '}
                مدیریت
              </Link>
            </div>
            <p className={styles.wsHint}>
              اسلایدر از اخبار علامت‌خورده ویژه ساخته می‌شود — مدیریت محتوا در
              داشبورد → اخبار ویژه
            </p>
          </>
        ) : null}

        <NumField
          label="تعداد خبر"
          value={settings.count}
          onChange={(v) => patch('count', v)}
          min={1}
          max={20}
          unit="عدد"
        />
        <NumField
          label="افست"
          value={settings.offset}
          onChange={(v) => patch('offset', v)}
          min={0}
          max={40}
          unit="خبر"
        />
        <NumField
          label="شروع از خبر شماره"
          value={(settings.offset || 0) + 1}
          onChange={(v) => patch('offset', Math.max(0, (v || 1) - 1))}
          min={1}
          max={41}
          unit="ام"
        />
        <p className={styles.wsHint}>
          افست {settings.offset || 0} یعنی از خبر شماره{' '}
          {(settings.offset || 0) + 1} نمایش شروع می‌شود
          {settings.offset
            ? ` (${settings.offset} خبر اول رد می‌شود)`
            : ' (از ابتدای لیست)'}
        </p>
        {isListUi ? (
        <>
        <div className={styles.wsStack}>
          <Toggle
            checked={!!settings.show_likes}
            onChange={(v) => patch('show_likes', v)}
            label="نمایش لایک"
          />
          <Toggle
            checked={!!settings.show_views}
            onChange={(v) => patch('show_views', v)}
            label="نمایش بازدید"
          />
          <Toggle
            checked={!!settings.show_share}
            onChange={(v) => patch('show_share', v)}
            label="اشتراک‌گذاری"
          />
          {settings.show_likes ||
          settings.show_views ||
          settings.show_share ? (
            <div className={styles.wsGuest}>
              <p className={styles.wsMiniLabel}>چیدمان آیکون‌ها</p>
              <Seg
                options={NEWS_STATS_LAYOUTS}
                value={settings.stats_layout}
                onChange={(v) => patch('stats_layout', v)}
              />
              <p className={styles.wsHint}>
                زیر هم یا کنار هم — برای لایک، بازدید و اشتراک
              </p>
              <div className={styles.wsPxGrid}>
                <PxField
                  label="ابعاد آیکون"
                  value={settings.stats_icon_size}
                  onChange={(v) => patch('stats_icon_size', v)}
                  min={10}
                  max={28}
                />
                <PxField
                  label="سایز عدد"
                  value={settings.stats_font_size}
                  onChange={(v) => patch('stats_font_size', v)}
                  min={8}
                  max={18}
                />
                <PxField
                  label="فاصله بین آیتم"
                  value={settings.stats_gap}
                  onChange={(v) => patch('stats_gap', v)}
                  min={0}
                  max={32}
                />
                <PxField
                  label="گردی پس‌زمینه"
                  value={settings.stats_radius}
                  onChange={(v) => patch('stats_radius', v)}
                  max={999}
                />
                <PxField
                  label="پدینگ افقی"
                  value={settings.stats_padding_x}
                  onChange={(v) => patch('stats_padding_x', v)}
                  max={40}
                />
                <PxField
                  label="پدینگ عمودی"
                  value={settings.stats_padding_y}
                  onChange={(v) => patch('stats_padding_y', v)}
                  max={40}
                />
                <PxField
                  label="مارجین افقی"
                  value={settings.stats_margin_x}
                  onChange={(v) => patch('stats_margin_x', v)}
                  max={48}
                />
                <PxField
                  label="مارجین عمودی"
                  value={settings.stats_margin_y}
                  onChange={(v) => patch('stats_margin_y', v)}
                  max={48}
                />
              </div>
              <ColorRow
                label="پس‌زمینه باکس"
                value={settings.stats_bg}
                onChange={(v) => patch('stats_bg', v)}
                allowTransparent
              />
              {settings.show_likes ? (
                <ColorRow
                  label="رنگ لایک"
                  value={settings.like_color}
                  onChange={(v) => patch('like_color', v)}
                />
              ) : null}
              {settings.show_views ? (
                <ColorRow
                  label="رنگ بازدید"
                  value={settings.views_color}
                  onChange={(v) => patch('views_color', v)}
                />
              ) : null}
              {settings.show_share ? (
                <ColorRow
                  label="رنگ اشتراک"
                  value={settings.share_color}
                  onChange={(v) => patch('share_color', v)}
                />
              ) : null}
            </div>
          ) : null}
          <Toggle
            checked={!!settings.show_author}
            onChange={(v) => patch('show_author', v)}
            label="نمایش نویسنده"
          />
          <Toggle
            checked={!!settings.show_lead}
            onChange={(v) => patch('show_lead', v)}
            label="نمایش لید"
          />
          <Toggle
            checked={!!settings.show_read_more}
            onChange={(v) => patch('show_read_more', v)}
            label="ادامه مطلب"
          />
        </div>

        {settings.show_read_more ? (
          <div className={styles.wsGuest}>
            <p className={styles.wsMiniLabel}>متن ادامه مطلب</p>
            <input
              className={styles.wsInput}
              type="text"
              value={settings.read_more_text}
              onChange={(e) => patch('read_more_text', e.target.value)}
              placeholder="ادامه مطلب…"
            />

            <p className={`${styles.wsMiniLabel} ${styles.wsMiniLabelSpaced}`}>
              موقعیت روی کارت
            </p>
            <p className={styles.wsHint}>
              راست و چپ همان سمت فیزیکی صفحه است (مناسب فارسی)
            </p>
            <Seg
              options={NEWS_READ_MORE_PLACES}
              value={settings.read_more_place}
              onChange={(v) => patch('read_more_place', v)}
              cols={2}
            />

            {settings.read_more_place === 'flow' ? (
              <>
                <p className={`${styles.wsMiniLabel} ${styles.wsMiniLabelSpaced}`}>
                  تراز در جریان متن
                </p>
                <Seg
                  options={NEWS_READ_MORE_ALIGNS}
                  value={settings.read_more_align}
                  onChange={(v) => patch('read_more_align', v)}
                />
              </>
            ) : (
              <PxField
                label="فاصله از لبه کارت"
                value={settings.read_more_inset}
                onChange={(v) => patch('read_more_inset', v)}
                min={0}
                max={48}
              />
            )}

            <div className={styles.wsPxGrid}>
              <PxField
                label="سایز"
                value={settings.read_more_size}
                onChange={(v) => patch('read_more_size', v)}
                min={10}
                max={22}
              />
            </div>
            <div className={styles.wsStack}>
              <Toggle
                checked={!!settings.read_more_bold}
                onChange={(v) => patch('read_more_bold', v)}
                label="بولد"
              />
              <Toggle
                checked={!!settings.read_more_as_button}
                onChange={(v) => patch('read_more_as_button', v)}
                label="حالت دکمه"
                hint="پس‌زمینه و پدینگ دکمه"
              />
              <Toggle
                checked={!!settings.read_more_on_hover}
                onChange={(v) => patch('read_more_on_hover', v)}
                label="فقط با هاور کارت"
                hint="فقط دسکتاپ؛ در موبایل نمایش داده نمی‌شود"
              />
            </div>
            <ColorRow
              label="رنگ متن"
              value={settings.read_more_color}
              onChange={(v) => patch('read_more_color', v)}
            />
            <ColorRow
              label="رنگ هاور متن"
              value={settings.read_more_hover_color}
              onChange={(v) => patch('read_more_hover_color', v)}
            />
            {settings.read_more_as_button ? (
              <>
                <ColorRow
                  label="پس‌زمینه دکمه"
                  value={settings.read_more_bg}
                  onChange={(v) => patch('read_more_bg', v)}
                />
                <ColorRow
                  label="پس‌زمینه هاور"
                  value={settings.read_more_hover_bg}
                  onChange={(v) => patch('read_more_hover_bg', v)}
                />
                <p className={`${styles.wsMiniLabel} ${styles.wsMiniLabelSpaced}`}>
                  گردی گوشه‌های دکمه
                </p>
                <p className={styles.wsHint}>
                  چیدمان مثل خود دکمه روی صفحه: راست بالا ← چپ بالا
                </p>
                <div className={styles.wsRadiusMap} dir="rtl">
                  {NEWS_READ_MORE_RADIUS_FIELDS.map((f) => (
                    <PxField
                      key={f.key}
                      label={f.label}
                      value={settings[f.key]}
                      onChange={(v) => patch(f.key, v)}
                      max={64}
                    />
                  ))}
                </div>
              </>
            ) : null}
          </div>
        ) : null}
        </>
        ) : null}
      </Accordion>

      {isListUi ? (
      <>
      <Accordion id="title" title="عنوان و فونت" openId={openId} setOpenId={setOpenId}>
        <p className={styles.wsMiniLabel}>فونت</p>
        <Seg
          options={NEWS_FONTS}
          value={settings.font_family}
          onChange={(v) => patch('font_family', v)}
          cols={2}
        />
        <div className={styles.wsPxGrid}>
          <PxField
            label="سایز"
            value={settings.font_size}
            onChange={(v) => patch('font_size', v)}
            min={10}
            max={28}
          />
          <NumField
            label="حداکثر حروف"
            value={settings.title_max_chars}
            onChange={(v) => patch('title_max_chars', v)}
            min={10}
            max={200}
            unit="حرف"
          />
        </div>
        <div className={styles.wsStack}>
          <Toggle
            checked={!!settings.font_bold}
            onChange={(v) => patch('font_bold', v)}
            label="متن بولد"
          />
          <Toggle
            checked={!!settings.title_wrap}
            onChange={(v) => patch('title_wrap', v)}
            label="رفتن به خط بعد"
            hint="در غیر این‌صورت تک‌خط با …"
          />
        </div>
      </Accordion>

      <Accordion id="image" title="تصویر شاخص" openId={openId} setOpenId={setOpenId}>
        {isRecycler ? (
          <p className={styles.wsHint}>
            در ریسایکلر تصویر همیشه بک‌گراند کامل کارت است؛ تنظیم لایه متن در بخش
            محتواست
          </p>
        ) : null}
        {!isRecycler ? (
        <div className={styles.wsStack}>
          <Toggle
            checked={!!settings.show_image}
            onChange={(v) => patch('show_image', v)}
            label="نمایش تصویر"
          />
        </div>
        ) : null}
        {!isRecycler && settings.show_image ? (
          <>
            <p className={styles.wsMiniLabel}>شکل</p>
            <Seg
              options={NEWS_IMAGE_SHAPES}
              value={settings.image_shape}
              onChange={(v) => patch('image_shape', v)}
            />
            <div className={styles.wsPxGrid}>
              <PxField
                label="ابعاد"
                value={settings.image_size}
                onChange={(v) => patch('image_size', v)}
                min={24}
                max={120}
              />
              <PxField
                label="ضخامت حاشیه"
                value={settings.image_border_width}
                onChange={(v) => patch('image_border_width', v)}
                min={0}
                max={8}
              />
            </div>
            <div className={styles.wsStack}>
              <Toggle
                checked={!!settings.image_shadow}
                onChange={(v) => patch('image_shadow', v)}
                label="سایه تصویر"
              />
            </div>
            <ColorRow
              label="رنگ حاشیه تصویر"
              value={settings.image_border_color}
              onChange={(v) => patch('image_border_color', v)}
            />
          </>
        ) : null}
        {!isRecycler && !settings.show_image ? (
          <div className={styles.wsGuest}>
            <p className={styles.wsMiniLabel}>کنار متن چه چیزی باشد؟</p>
            <p className={styles.wsHint}>
              چون تصویر خاموش است، یک نشانگر کنار عنوان انتخاب کنید
            </p>
            <Seg
              options={NEWS_TEXT_MARKERS}
              value={settings.text_marker}
              onChange={(v) => patch('text_marker', v)}
              cols={2}
            />
            {settings.text_marker && settings.text_marker !== 'none' ? (
              <>
                <div className={styles.wsPxGrid}>
                  <PxField
                    label="اندازه نشانگر"
                    value={settings.text_marker_size}
                    onChange={(v) => patch('text_marker_size', v)}
                    min={4}
                    max={20}
                  />
                </div>
                <ColorRow
                  label="رنگ نشانگر"
                  value={settings.text_marker_color}
                  onChange={(v) => patch('text_marker_color', v)}
                />
              </>
            ) : null}
          </div>
        ) : null}
      </Accordion>

      <Accordion id="card" title="کارت" openId={openId} setOpenId={setOpenId}>
        <ColorRow
          label="پس‌زمینه کارت"
          value={settings.card_bg}
          onChange={(v) => patch('card_bg', v)}
          allowTransparent
        />
        <p className={`${styles.wsMiniLabel} ${styles.wsMiniLabelSpaced}`}>
          گردی گوشه‌ها
        </p>
        <div className={styles.wsPxGrid}>
          {NEWS_CARD_RADIUS_FIELDS.map((f) => (
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

      <Accordion id="border" title="بردر و هاور" openId={openId} setOpenId={setOpenId}>
        <div className={styles.wsStack}>
          <Toggle
            checked={!!settings.item_border}
            onChange={(v) => patch('item_border', v)}
            label="بردر پایین هر خبر"
          />
        </div>
        {settings.item_border ? (
          <>
            <p className={styles.wsMiniLabel}>سبک بردر</p>
            <Seg
              options={NEWS_BORDER_STYLES.filter((b) => b.id !== 'none')}
              value={settings.border_style === 'none' ? 'solid' : settings.border_style}
              onChange={(v) => patch('border_style', v)}
              cols={3}
            />
            <PxField
              label="ضخامت بردر"
              value={settings.border_width}
              onChange={(v) => patch('border_width', v)}
              min={1}
              max={8}
            />
          </>
        ) : null}

        <div className={`${styles.wsColorList} ${styles.wsColorListSpaced}`}>
          {NEWS_BAR_COLORS.filter((c) =>
            settings.item_border ? true : c.key !== 'border_color'
          )
            .filter((c) =>
              settings.show_image ? true : c.key !== 'image_border_color'
            )
            .map((f) => (
              <ColorRow
                key={f.key}
                label={f.label}
                value={settings[f.key]}
                onChange={(v) => patch(f.key, v)}
              />
            ))}
        </div>

        <div className={styles.wsStack}>
          <Toggle
            checked={!!settings.hover_show_lead}
            onChange={(v) => patch('hover_show_lead', v)}
            label="کارت لید روی هاور"
            hint="فقط دسکتاپ؛ در موبایل اصلاً نمایش داده نمی‌شود"
          />
          {settings.hover_show_lead ? (
            <Toggle
              checked={!!settings.hover_lead_image}
              onChange={(v) => patch('hover_lead_image', v)}
              label="تصویر داخل کارت لید"
            />
          ) : null}
        </div>
      </Accordion>

      </>
      ) : null}

      <Accordion id="space" title="فاصله (px)" openId={openId} setOpenId={setOpenId}>
        <p className={styles.wsMiniLabel}>Padding</p>
        <div className={styles.wsPxGrid}>
          {NEWS_SPACE_FIELDS.map((f) => (
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
          {NEWS_MARGIN_FIELDS.map((f) => (
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
