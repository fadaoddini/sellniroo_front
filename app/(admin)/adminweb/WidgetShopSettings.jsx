'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { ChevronDown, ExternalLink } from 'lucide-react'
import {
  DEFAULT_SHOP_WIDGET_SETTINGS,
  SHOP_CARD_STYLES,
  SHOP_DISPLAY_MODES,
  SHOP_IMAGE_RATIOS,
  SHOP_MARGIN_FIELDS,
  SHOP_PRODUCT_STRIP_TYPES,
  SHOP_SPACE_FIELDS,
  getShopWidgetVariant,
  normalizeShopWidgetSettings,
} from '@/config/shopWidgetSettings'
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

export default function WidgetShopSettings({
  type = 'featured_products',
  settings: raw,
  onChange,
}) {
  const settings = normalizeShopWidgetSettings(
    raw || DEFAULT_SHOP_WIDGET_SETTINGS,
    type
  )
  const variant = getShopWidgetVariant(type)
  const isStrip = SHOP_PRODUCT_STRIP_TYPES.has(type) || type === 'product_stories'
  const isStories = type === 'product_stories'
  const isSearch = type === 'shop_search_bar'
  const isArticle = type === 'product_article' || type === 'shop_page'
  const [openId, setOpenId] = useState('display')
  const patch = (key, value) => onChange?.({ [key]: value })

  if (isArticle) {
    return (
      <div className={styles.wsPanel}>
        <p className={styles.wsHint}>
          این ویجت محتوای اصلی صفحه است. ظاهر اجزای داخلی را از{' '}
          <Link href="/product-single">
            تنظیمات سینگل محصول <ExternalLink size={12} />
          </Link>{' '}
          تنظیم کنید.
        </p>
        <Toggle
          checked={settings.show_on_mobile}
          onChange={(v) => patch('show_on_mobile', v)}
          label="نمایش در موبایل"
        />
        <Toggle
          checked={settings.show_on_desktop}
          onChange={(v) => patch('show_on_desktop', v)}
          label="نمایش در دسکتاپ"
        />
      </div>
    )
  }

  return (
    <div className={styles.wsPanel}>
      <p className={styles.wsHint}>
        ویجت فروشگاه · منبع:{' '}
        <strong dir="ltr">{variant.source || variant.kind}</strong>
      </p>

      <Accordion id="display" title="نمایش" openId={openId} setOpenId={setOpenId}>
        {isStrip ? (
          <>
            <label className={styles.wsLabel}>حالت نمایش</label>
            <Seg
              options={
                isStories
                  ? SHOP_DISPLAY_MODES.filter((m) => m.id === 'stories')
                  : SHOP_DISPLAY_MODES.filter((m) => m.id !== 'stories')
              }
              value={settings.display_mode}
              onChange={(v) => patch('display_mode', v)}
              cols={3}
            />
            <label className={styles.wsLabel}>تعداد آیتم</label>
            <PxField
              label="limit"
              value={settings.limit}
              min={1}
              max={48}
              onChange={(v) => patch('limit', v)}
            />
            <label className={styles.wsField}>
              <span>عنوان بخش</span>
              <input
                value={settings.title_text}
                placeholder={variant.title || ''}
                onChange={(e) => patch('title_text', e.target.value)}
              />
            </label>
            {type === 'products_by_category' ? (
              <label className={styles.wsField}>
                <span>شناسه دسته</span>
                <input
                  dir="ltr"
                  value={settings.category_id}
                  placeholder="مثلاً 3"
                  onChange={(e) => patch('category_id', e.target.value)}
                />
              </label>
            ) : null}
            <label className={styles.wsLabel}>استایل کارت</label>
            <Seg
              options={SHOP_CARD_STYLES}
              value={settings.card_style}
              onChange={(v) => patch('card_style', v)}
              cols={2}
            />
            <label className={styles.wsLabel}>شکل تصویر</label>
            <Seg
              options={[
                { id: 'circle', label: 'دایره‌ای' },
                { id: 'rounded', label: 'مستطیل' },
              ]}
              value={settings.image_shape || 'circle'}
              onChange={(v) => patch('image_shape', v)}
              cols={2}
            />
            <label className={styles.wsLabel}>نسبت تصویر</label>
            <Seg
              options={SHOP_IMAGE_RATIOS}
              value={settings.image_ratio}
              onChange={(v) => patch('image_ratio', v)}
              cols={3}
            />
            {settings.display_mode === 'recycler' ? (
              <PxField
                label="عرض کارت ریسایکلر"
                value={settings.recycler_card_width}
                min={120}
                max={320}
                onChange={(v) => patch('recycler_card_width', v)}
              />
            ) : null}
            {isStories ? (
              <PxField
                label="اندازه استوری"
                value={settings.story_size}
                min={56}
                max={120}
                onChange={(v) => patch('story_size', v)}
              />
            ) : null}
          </>
        ) : null}

        {isSearch ? (
          <p className={styles.wsHint}>نوار جستجو کاربران را به /shop می‌برد.</p>
        ) : null}

        <Toggle
          checked={settings.show_title}
          onChange={(v) => patch('show_title', v)}
          label="نمایش عنوان"
        />
        <Toggle
          checked={settings.show_more_link}
          onChange={(v) => patch('show_more_link', v)}
          label="لینک مشاهده همه"
        />
        <Toggle
          checked={settings.use_demo_data}
          onChange={(v) => patch('use_demo_data', v)}
          label="داده نمونه در صورت خالی بودن API"
          hint="برای پیش‌نمایش در استودیو مفید است"
        />
        <Toggle
          checked={settings.show_on_mobile}
          onChange={(v) => patch('show_on_mobile', v)}
          label="نمایش در موبایل"
        />
        <Toggle
          checked={settings.show_on_desktop}
          onChange={(v) => patch('show_on_desktop', v)}
          label="نمایش در دسکتاپ"
        />
        <Toggle
          checked={settings.section_full}
          onChange={(v) => patch('section_full', v)}
          label="تمام‌عرض سکشن"
        />
      </Accordion>

      {isStrip ? (
        <Accordion id="fields" title="فیلدهای کارت" openId={openId} setOpenId={setOpenId}>
          <Toggle
            checked={settings.show_image}
            onChange={(v) => patch('show_image', v)}
            label="تصویر"
          />
          <Toggle
            checked={settings.show_price}
            onChange={(v) => patch('show_price', v)}
            label="قیمت"
          />
          <Toggle
            checked={settings.show_discount}
            onChange={(v) => patch('show_discount', v)}
            label="تخفیف"
          />
          <Toggle
            checked={settings.show_shop}
            onChange={(v) => patch('show_shop', v)}
            label="نام فروشگاه"
          />
          <Toggle
            checked={settings.show_rating}
            onChange={(v) => patch('show_rating', v)}
            label="امتیاز"
          />
        </Accordion>
      ) : null}

      <Accordion id="space" title="فاصله و حاشیه" openId={openId} setOpenId={setOpenId}>
        <div className={styles.wsPxGrid}>
          {SHOP_SPACE_FIELDS.map((f) => (
            <PxField
              key={f.key}
              label={`پدینگ ${f.label}`}
              value={settings[f.key]}
              onChange={(v) => patch(f.key, v)}
            />
          ))}
          {SHOP_MARGIN_FIELDS.map((f) => (
            <PxField
              key={f.key}
              label={`مارجین ${f.label}`}
              value={settings[f.key]}
              onChange={(v) => patch(f.key, v)}
            />
          ))}
        </div>
        <PxField
          label="فاصله بین آیتم‌ها"
          value={settings.gap}
          max={48}
          onChange={(v) => patch('gap', v)}
        />
        <PxField
          label="حداکثر عرض"
          value={settings.max_width}
          min={320}
          max={1600}
          onChange={(v) => patch('max_width', v)}
        />
      </Accordion>

      <Accordion id="link" title="لینک بیشتر" openId={openId} setOpenId={setOpenId}>
        <label className={styles.wsField}>
          <span>متن لینک</span>
          <input
            value={settings.more_label}
            onChange={(e) => patch('more_label', e.target.value)}
          />
        </label>
        <label className={styles.wsField}>
          <span>آدرس</span>
          <input
            dir="ltr"
            value={settings.more_href}
            onChange={(e) => patch('more_href', e.target.value)}
          />
        </label>
        <label className={styles.wsField}>
          <span>رنگ اکسنت</span>
          <input
            type="color"
            value={settings.accent_color || '#ff00a6'}
            onChange={(e) => patch('accent_color', e.target.value)}
          />
        </label>
      </Accordion>
    </div>
  )
}
