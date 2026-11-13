'use client'

import React, { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { ExternalLink } from 'lucide-react'
import {
  DEFAULT_SHOP_WIDGET_SETTINGS,
  SHOP_ACTIONS_ALIGNS,
  SHOP_ACTIONS_ZONES,
  SHOP_BTN_RADIUS_CORNERS,
  SHOP_CARD_RADIUS_CORNERS,
  SHOP_CARD_STYLES,
  SHOP_COLOR_FIELDS,
  SHOP_COLOR_GROUPS,
  SHOP_CTA_STYLES,
  SHOP_DISCOUNT_ZONES,
  SHOP_DISPLAY_MODES,
  SHOP_FONTS,
  SHOP_HEAD_TITLE_ALIGNS,
  SHOP_HEAD_TITLE_WEIGHTS,
  SHOP_HOVER_EFFECTS,
  SHOP_IMAGE_OVERFLOWS,
  SHOP_IMAGE_PLACEMENTS,
  SHOP_IMAGE_RADIUS_CORNERS,
  SHOP_IMAGE_RATIOS,
  SHOP_IMAGE_SHAPES,
  SHOP_MARGIN_FIELDS,
  SHOP_PRODUCT_STRIP_TYPES,
  SHOP_RATING_ALIGNS,
  SHOP_RATING_CORNERS,
  SHOP_RATING_STYLES,
  SHOP_RATING_ZONES,
  SHOP_RECYCLER_ARROW_ICONS,
  SHOP_RECYCLER_ARROW_PLACES,
  SHOP_RECYCLER_ARROW_RADIUS_CORNERS,
  SHOP_RECYCLER_ARROW_SPACE_FIELDS,
  SHOP_RECYCLER_ARROW_STYLES,
  SHOP_RECYCLER_PRESETS,
  SHOP_SETTINGS_TABS,
  SHOP_SPACE_FIELDS,
  SHOP_SURFACE_MODES,
  SHOP_SURFACE_SPANS,
  getShopWidgetVariant,
  normalizeShopWidgetSettings,
} from '@/config/shopWidgetSettings'
import {
  DEFAULT_PRODUCT_SINGLE_PAGE_SETTINGS,
  PRODUCT_SINGLE_ADMIN_TABS,
  PRODUCT_SINGLE_COLOR_FIELDS,
  PRODUCT_SINGLE_COLOR_GROUPS,
  PRODUCT_SINGLE_CTA_STYLES,
  PRODUCT_SINGLE_FONTS,
  PRODUCT_SINGLE_GALLERY_FITS,
  PRODUCT_SINGLE_GALLERY_RATIOS,
  PRODUCT_SINGLE_IMAGE_HOVERS,
  PRODUCT_SINGLE_SKELETONS,
  PRODUCT_SINGLE_THUMB_PLACEMENTS,
  PRODUCT_SINGLE_THUMB_POSITIONS,
  PRODUCT_SINGLE_TITLE_SIZES,
  PRODUCT_SINGLE_DETAIL_BLOCKS,
  productSingleIsTwoCol,
  productSingleLayoutFamily,
  applyProductSingleComposition,
  moveProductSingleDetailBlock,
  normalizeProductSingleDetailBlocksOrder,
  normalizeProductSinglePageSettings,
} from '@/config/productSinglePageSettings'
import styles from './AdminWeb.module.css'

const PRODUCT_ARTICLE_TOGGLES = [
  { key: 'show_breadcrumb', label: 'مسیر (breadcrumb)' },
  { key: 'show_back_link', label: 'لینک بازگشت' },
  { key: 'show_gallery', label: 'گالری تصویر' },
  { key: 'show_thumbs', label: 'بندانگشتی‌ها' },
  { key: 'show_badges', label: 'نشان‌ها' },
  { key: 'show_featured_badge', label: 'نشان ویژه' },
  { key: 'show_discount_badge', label: 'نشان تخفیف' },
  { key: 'show_title', label: 'عنوان' },
  { key: 'show_shop', label: 'نام فروشگاه' },
  { key: 'show_category', label: 'دسته' },
  { key: 'show_rating', label: 'امتیاز' },
  { key: 'show_price', label: 'قیمت' },
  { key: 'show_old_price', label: 'قیمت قبل تخفیف' },
  { key: 'show_stock', label: 'موجودی' },
  { key: 'show_lid', label: 'خلاصه' },
  { key: 'show_description', label: 'توضیحات' },
  { key: 'show_specs', label: 'مشخصات' },
  { key: 'show_qty', label: 'انتخاب تعداد' },
  { key: 'show_add_to_cart', label: 'دکمه افزودن به سبد' },
  { key: 'show_wishlist', label: 'علاقه‌مندی' },
  { key: 'show_share', label: 'اشتراک‌گذاری' },
  { key: 'share_bale', label: 'اشتراک بله' },
  { key: 'share_eitaa', label: 'اشتراک ایتا' },
  { key: 'share_rubika', label: 'اشتراک روبیکا' },
  { key: 'share_soroush', label: 'اشتراک سروش' },
  { key: 'show_similar', label: 'محصولات مشابه' },
]

function ProductArticleSkel({ skeleton, family }) {
  const fam =
    family ||
    (skeleton === 'pdp_cover'
      ? 'cover'
      : skeleton === 'pdp_magazine'
        ? 'stack'
        : 'two_col')
  return (
    <div
      className={`${styles.wsPresetSkel} ${styles[`wsPresetSkel_${skeleton}`] || ''}`}
      aria-hidden
    >
      {fam === 'cover' ? (
        <div className={styles.wsPresetSkelPdpCover}>
          <i className={styles.wsPresetSkelImg} />
          <i className={styles.wsPresetSkelLine} />
        </div>
      ) : fam === 'stack' ? (
        <div className={styles.wsPresetSkelPdpMag}>
          <i className={styles.wsPresetSkelLine} />
          <i className={styles.wsPresetSkelLineShort} />
          <i className={styles.wsPresetSkelImg} />
          <i className={styles.wsPresetSkelLine} />
          <i className={styles.wsPresetSkelBtn} />
        </div>
      ) : (
        <div className={styles.wsPresetSkelPdpSplit}>
          <i className={styles.wsPresetSkelImg} />
          <div className={styles.wsPresetSkelPdpSide}>
            <i className={styles.wsPresetSkelLine} />
            <i className={styles.wsPresetSkelLineShort} />
            <i className={styles.wsPresetSkelBtn} />
          </div>
        </div>
      )}
    </div>
  )
}

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

function ColorRow({ label, value, fallback, onChange, allowTransparent }) {
  const isTransparent =
    String(value || '').toLowerCase() === 'transparent'
  const hex = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value || '')
    ? value
    : fallback
  return (
    <div className={styles.wsColorRow}>
      <span className={styles.wsColorRowLabel}>
        {label}
        {allowTransparent ? (
          <button
            type="button"
            className={`${styles.wsSegBtn} ${
              isTransparent ? styles.wsSegBtnActive : ''
            }`}
            style={{
              marginInlineStart: '0.35rem',
              padding: '0.1rem 0.45rem',
              fontSize: '0.65rem',
            }}
            onClick={() =>
              onChange(isTransparent ? fallback : 'transparent')
            }
          >
            شفاف
          </button>
        ) : null}
      </span>
      <div className={styles.wsColorRowControls}>
        <input
          className={styles.wsColorHex}
          dir="ltr"
          value={value || ''}
          placeholder={fallback}
          onChange={(e) => onChange(e.target.value)}
        />
        <input
          className={styles.wsColorSwatch}
          type="color"
          value={hex}
          onChange={(e) => onChange(e.target.value)}
          aria-label={label}
          disabled={isTransparent}
        />
      </div>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div className={styles.wsStack} style={{ gap: '0.55rem' }}>
      {title ? <p className={styles.wsMiniLabel}>{title}</p> : null}
      {children}
    </div>
  )
}

function colorMeta(key) {
  return SHOP_COLOR_FIELDS.find((f) => f.key === key)
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
  const isStrip =
    SHOP_PRODUCT_STRIP_TYPES.has(type) || type === 'product_stories'
  const isStories = type === 'product_stories'
  const isShopPage = type === 'shop_page'
  const isProductArticle = type === 'product_article'
  const [tab, setTab] = useState('general')
  const [pdpTab, setPdpTab] = useState('skeleton')
  const patch = (key, value) => onChange?.({ [key]: value })
  const patchMany = (obj) => onChange?.(obj)

  const pdp = useMemo(
    () =>
      normalizeProductSinglePageSettings(
        raw || DEFAULT_PRODUCT_SINGLE_PAGE_SETTINGS
      ),
    [raw]
  )

  const tabs = useMemo(() => {
    if (!isStrip) return [{ id: 'general', label: 'کلی' }]
    return SHOP_SETTINGS_TABS.filter((t) => {
      if (isStories) {
        return ['general', 'title', 'content', 'layout'].includes(t.id)
      }
      if (t.modes && !t.modes.includes(settings.display_mode)) return false
      return true
    })
  }, [isStrip, isStories, settings.display_mode])

  useEffect(() => {
    if (!tabs.some((t) => t.id === tab)) setTab(tabs[0]?.id || 'general')
  }, [tabs, tab])

  if (type === 'shop_search_bar') return null

  if (isShopPage) {
    return (
      <div className={styles.wsPanel}>
        <p className={styles.wsHint}>
          این ویجت محتوای اصلی لیست فروشگاه است. ظاهر کارت‌ها را از ویجت‌های
          محصولات کنارش تنظیم کنید.
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

  if (isProductArticle) {
    const pdpTabs = PRODUCT_SINGLE_ADMIN_TABS
    return (
      <div className={styles.wsPanel}>
        <p className={styles.wsHint}>
          تنظیم کامل سینگل محصول: اسکلتون، اجزا، گالری، سبد/علاقه، فونت و رنگ
          (شفاف مجاز).{' '}
          <Link href="/product-single">
            صفحه تنظیمات سراسری <ExternalLink size={12} />
          </Link>
        </p>

        <div
          className={styles.wsSeg}
          style={{
            gridTemplateColumns: 'repeat(3, 1fr)',
            marginBottom: '0.65rem',
          }}
        >
          {pdpTabs.map((t) => (
            <button
              key={t.id}
              type="button"
              className={`${styles.wsSegBtn} ${
                pdpTab === t.id ? styles.wsSegBtnActive : ''
              }`}
              onClick={() => setPdpTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {pdpTab === 'skeleton' ? (
          <Section title="۴ مدل اسکلتون">
            <p className={styles.wsHint}>
              هر اسکلتون یک ترکیب آمادهٔ استاندارد است؛ بعد از انتخاب، درصد ستون
              تصویر و سقف ارتفاع را در تب گالری تنظیم کنید.
            </p>
            <div className={styles.wsPresetGrid}>
              {PRODUCT_SINGLE_SKELETONS.map((preset) => {
                const on = pdp.layout === preset.id
                return (
                  <button
                    key={preset.id}
                    type="button"
                    className={`${styles.wsPresetCard} ${
                      on ? styles.wsPresetCardOn : ''
                    }`}
                    onClick={() =>
                      patchMany(
                        applyProductSingleComposition(pdp, preset.id)
                      )
                    }
                  >
                    <ProductArticleSkel
                      skeleton={preset.skeleton}
                      family={preset.family}
                    />
                    <strong>{preset.label}</strong>
                    <small>{preset.desc}</small>
                  </button>
                )
              })}
            </div>
            <Toggle
              checked={pdp.show_on_mobile}
              onChange={(v) => patch('show_on_mobile', v)}
              label="نمایش در موبایل"
            />
            <Toggle
              checked={pdp.show_on_desktop}
              onChange={(v) => patch('show_on_desktop', v)}
              label="نمایش در دسکتاپ"
            />
          </Section>
        ) : null}

        {pdpTab === 'blocks' ? (
          <>
            <Section title="چینش کنار تصویر">
              <p className={styles.wsHint}>
                ترتیب ردیف‌های ستون اطلاعات کنار گالری را با بالا/پایین عوض
                کنید و نمایش هر ردیف را روشن یا خاموش کنید.
              </p>
              <div className={styles.wsOrderList}>
                {normalizeProductSingleDetailBlocksOrder(
                  pdp.detail_blocks_order
                ).map((blockId, index, list) => {
                  const meta =
                    PRODUCT_SINGLE_DETAIL_BLOCKS.find((b) => b.id === blockId) ||
                    { id: blockId, label: blockId, showKey: null }
                  const showKey = meta.showKey
                  const enabled = showKey ? !!pdp[showKey] : true
                  return (
                    <div key={blockId} className={styles.wsOrderRow}>
                      <span className={styles.wsOrderIndex}>
                        {(index + 1).toLocaleString('fa-IR')}
                      </span>
                      <span className={styles.wsOrderText}>
                        <strong>{meta.label}</strong>
                        {meta.desc ? <small>{meta.desc}</small> : null}
                      </span>
                      <span className={styles.wsOrderActions}>
                        <button
                          type="button"
                          className={styles.wsOrderBtn}
                          disabled={index === 0}
                          onClick={() =>
                            patch(
                              'detail_blocks_order',
                              moveProductSingleDetailBlock(
                                pdp.detail_blocks_order,
                                blockId,
                                'up'
                              )
                            )
                          }
                          aria-label="جابه‌جایی به بالا"
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          className={styles.wsOrderBtn}
                          disabled={index === list.length - 1}
                          onClick={() =>
                            patch(
                              'detail_blocks_order',
                              moveProductSingleDetailBlock(
                                pdp.detail_blocks_order,
                                blockId,
                                'down'
                              )
                            )
                          }
                          aria-label="جابه‌جایی به پایین"
                        >
                          ↓
                        </button>
                      </span>
                      {showKey ? (
                        <label className={styles.wsOrderToggle}>
                          <input
                            type="checkbox"
                            checked={enabled}
                            onChange={(e) =>
                              patch(showKey, e.target.checked)
                            }
                          />
                          <span>{enabled ? 'روشن' : 'خاموش'}</span>
                        </label>
                      ) : null}
                    </div>
                  )
                })}
              </div>
            </Section>
            <Section title="جزئیات بیشتر نمایش">
              <div className={styles.wsToggleGrid}>
                {PRODUCT_ARTICLE_TOGGLES.filter(
                  (f) =>
                    ![
                      'show_badges',
                      'show_title',
                      'show_rating',
                      'show_lid',
                      'show_price',
                      'show_stock',
                      'show_add_to_cart',
                      'show_category',
                      'show_shop',
                      'show_description',
                      'show_specs',
                      'show_similar',
                      'share_bale',
                      'share_eitaa',
                      'share_rubika',
                      'share_soroush',
                    ].includes(f.key)
                ).map((f) => (
                  <Toggle
                    key={f.key}
                    checked={!!pdp[f.key]}
                    onChange={(v) => patch(f.key, v)}
                    label={f.label}
                  />
                ))}
              </div>
              <p className={styles.wsHint} style={{ marginTop: '0.65rem' }}>
                محصولات مشابه در ردیف جدا زیر سینگل است؛ ویجت «محصولات مشابه»
                را از چیدمان صفحه انتخاب کنید.
              </p>
            </Section>
          </>
        ) : null}

        {pdpTab === 'gallery' ? (
          <>
            {productSingleIsTwoCol(productSingleLayoutFamily(pdp)) ? (
              <Section title="عرض ستون‌ها">
                <p className={styles.wsHint}>
                  تصویر {pdp.gallery_col_pct}٪ — اطلاعات{' '}
                  {100 - pdp.gallery_col_pct}٪
                </p>
                <label className={styles.wsPxField}>
                  <span>درصد ستون تصویر</span>
                  <span className={styles.wsPxInput}>
                    <input
                      type="range"
                      min={28}
                      max={72}
                      step={1}
                      value={pdp.gallery_col_pct}
                      onChange={(e) =>
                        patch('gallery_col_pct', Number(e.target.value))
                      }
                      dir="ltr"
                      style={{ width: '100%' }}
                    />
                    <em>{pdp.gallery_col_pct}%</em>
                  </span>
                </label>
              </Section>
            ) : null}
            <Section title="ارتفاع و برش تصویر">
              <PxField
                label="سقف ارتفاع گالری"
                value={pdp.gallery_max_h}
                onChange={(v) => patch('gallery_max_h', v)}
                min={240}
                max={720}
              />
              <Seg
                options={PRODUCT_SINGLE_GALLERY_FITS}
                value={pdp.gallery_fit}
                onChange={(id) => patch('gallery_fit', id)}
                cols={2}
              />
            </Section>
            <Section title="نسبت تصویر">
              <Seg
                options={PRODUCT_SINGLE_GALLERY_RATIOS}
                value={pdp.gallery_ratio}
                onChange={(id) => patch('gallery_ratio', id)}
                cols={4}
              />
            </Section>
            <Section title="افکت هاور تصویر">
              <Seg
                options={PRODUCT_SINGLE_IMAGE_HOVERS}
                value={pdp.image_hover}
                onChange={(id) => patch('image_hover', id)}
                cols={3}
              />
            </Section>
            <Section title="جایگاه بندانگشتی">
              <Seg
                options={PRODUCT_SINGLE_THUMB_PLACEMENTS}
                value={pdp.thumbs_placement}
                onChange={(id) => patch('thumbs_placement', id)}
                cols={2}
              />
            </Section>
            <Section title="موقعیت بندانگشتی">
              <Seg
                options={PRODUCT_SINGLE_THUMB_POSITIONS}
                value={pdp.thumbs_position}
                onChange={(id) => patch('thumbs_position', id)}
              />
            </Section>
            <Section title="اندازه‌های گالری">
              <PxField
                label="شعاع گالری"
                value={pdp.gallery_radius}
                onChange={(v) => patch('gallery_radius', v)}
                max={48}
              />
              <PxField
                label="اندازه بندانگشتی"
                value={pdp.thumbs_size}
                onChange={(v) => patch('thumbs_size', v)}
                min={36}
                max={96}
              />
              <PxField
                label="فاصله بندانگشتی"
                value={pdp.thumbs_gap}
                onChange={(v) => patch('thumbs_gap', v)}
                max={24}
              />
              <PxField
                label="شعاع بندانگشتی"
                value={pdp.thumbs_radius}
                onChange={(v) => patch('thumbs_radius', v)}
                max={40}
              />
            </Section>
          </>
        ) : null}

        {pdpTab === 'actions' ? (
          <>
            <Section title="سبک دکمه سبد">
              <Seg
                options={PRODUCT_SINGLE_CTA_STYLES}
                value={pdp.cta_style}
                onChange={(id) => patch('cta_style', id)}
              />
            </Section>
            <Section title="سبک علاقه">
              <Seg
                options={PRODUCT_SINGLE_CTA_STYLES}
                value={pdp.wish_style}
                onChange={(id) => patch('wish_style', id)}
              />
            </Section>
            <Section title="سبک اشتراک">
              <Seg
                options={PRODUCT_SINGLE_CTA_STYLES}
                value={pdp.share_style}
                onChange={(id) => patch('share_style', id)}
              />
            </Section>
            {pdp.show_share ? (
              <Section title="پیام‌رسان‌ها">
                <Toggle
                  checked={!!pdp.share_bale}
                  onChange={(v) => patch('share_bale', v)}
                  label="بله"
                />
                <Toggle
                  checked={!!pdp.share_eitaa}
                  onChange={(v) => patch('share_eitaa', v)}
                  label="ایتا"
                />
                <Toggle
                  checked={!!pdp.share_rubika}
                  onChange={(v) => patch('share_rubika', v)}
                  label="روبیکا"
                />
                <Toggle
                  checked={!!pdp.share_soroush}
                  onChange={(v) => patch('share_soroush', v)}
                  label="سروش"
                />
              </Section>
            ) : null}
            <Section title="اندازه اکشن‌ها">
              <PxField
                label="ارتفاع دکمه"
                value={pdp.btn_height}
                onChange={(v) => patch('btn_height', v)}
                min={28}
                max={64}
              />
              <PxField
                label="شعاع دکمه"
                value={pdp.btn_radius}
                onChange={(v) => patch('btn_radius', v)}
                max={40}
              />
              <PxField
                label="سایز فونت دکمه"
                value={pdp.btn_font_size}
                onChange={(v) => patch('btn_font_size', v)}
                min={10}
                max={22}
              />
              <PxField
                label="فاصله اکشن‌ها"
                value={pdp.action_gap}
                onChange={(v) => patch('action_gap', v)}
                max={32}
              />
            </Section>
          </>
        ) : null}

        {pdpTab === 'type' ? (
          <>
            <Section title="فونت عنوان">
              <Seg
                options={PRODUCT_SINGLE_FONTS}
                value={pdp.title_font}
                onChange={(id) => patch('title_font', id)}
                cols={3}
              />
            </Section>
            <Section title="فونت متن">
              <Seg
                options={PRODUCT_SINGLE_FONTS}
                value={pdp.body_font}
                onChange={(id) => patch('body_font', id)}
                cols={3}
              />
            </Section>
            <Section title="فونت قیمت">
              <Seg
                options={PRODUCT_SINGLE_FONTS}
                value={pdp.price_font}
                onChange={(id) => patch('price_font', id)}
                cols={3}
              />
            </Section>
            <Section title="فونت دکمه">
              <Seg
                options={PRODUCT_SINGLE_FONTS}
                value={pdp.btn_font}
                onChange={(id) => patch('btn_font', id)}
                cols={3}
              />
            </Section>
            <Section title="اندازه عنوان">
              <Seg
                options={PRODUCT_SINGLE_TITLE_SIZES}
                value={pdp.title_size}
                onChange={(id) => {
                  const meta = PRODUCT_SINGLE_TITLE_SIZES.find((x) => x.id === id)
                  patchMany({
                    title_size: id,
                    title_font_size: meta?.px || 28,
                  })
                }}
              />
            </Section>
            <Section title="اندازه‌ها">
              <PxField
                label="سایز عنوان"
                value={pdp.title_font_size}
                onChange={(v) => patch('title_font_size', v)}
                min={14}
                max={72}
              />
              <PxField
                label="سایز متن"
                value={pdp.content_font_size}
                onChange={(v) => patch('content_font_size', v)}
                min={11}
                max={28}
              />
              <PxField
                label="سایز قیمت"
                value={pdp.price_font_size}
                onChange={(v) => patch('price_font_size', v)}
                min={12}
                max={48}
              />
              <PxField
                label="عرض محتوا"
                value={pdp.section_max_width}
                onChange={(v) => patch('section_max_width', v)}
                min={480}
                max={1600}
              />
              <PxField
                label="فاصله داخلی"
                value={pdp.content_gap}
                onChange={(v) => patch('content_gap', v)}
                max={48}
              />
              <PxField
                label="پدینگ بخش"
                value={pdp.section_pad}
                onChange={(v) => patch('section_pad', v)}
                max={48}
              />
            </Section>
            <Section title="شعاع گوشه‌ها (جدا)">
              <p className={styles.wsHint}>
                برای هر گوشه جداگانه شعاع بگذارید. با تغییر «همه گوشه‌ها» هر چهار
                مقدار یکسان می‌شود.
              </p>
              <PxField
                label="همه گوشه‌ها"
                value={pdp.section_radius}
                onChange={(v) =>
                  patchMany({
                    section_radius: v,
                    section_radius_tl: v,
                    section_radius_tr: v,
                    section_radius_br: v,
                    section_radius_bl: v,
                  })
                }
                max={48}
              />
              <PxField
                label="بالا راست"
                value={pdp.section_radius_tr}
                onChange={(v) => patch('section_radius_tr', v)}
                max={48}
              />
              <PxField
                label="بالا چپ"
                value={pdp.section_radius_tl}
                onChange={(v) => patch('section_radius_tl', v)}
                max={48}
              />
              <PxField
                label="پایین راست"
                value={pdp.section_radius_br}
                onChange={(v) => patch('section_radius_br', v)}
                max={48}
              />
              <PxField
                label="پایین چپ"
                value={pdp.section_radius_bl}
                onChange={(v) => patch('section_radius_bl', v)}
                max={48}
              />
            </Section>
          </>
        ) : null}

        {pdpTab === 'colors' ? (
          <>
            <p className={styles.wsHint}>
              برای پس‌زمینه کلی دکمه «شفاف» را بزنید. رنگ باکس قیمت را از بخش
              «ردیف قیمت» کاستوم کنید.
            </p>
            {PRODUCT_SINGLE_COLOR_GROUPS.map((group) => {
              const fields = PRODUCT_SINGLE_COLOR_FIELDS.filter(
                (f) => (f.group || 'general') === group.id
              )
              if (!fields.length) return null
              return (
                <Section key={group.id} title={group.label}>
                  {fields.map((f) => (
                    <ColorRow
                      key={f.key}
                      label={f.label}
                      value={pdp[f.key]}
                      fallback={f.fallback}
                      allowTransparent={!!f.allowTransparent}
                      onChange={(v) => patch(f.key, v)}
                    />
                  ))}
                </Section>
              )
            })}
          </>
        ) : null}
      </div>
    )
  }

  return (
    <div className={styles.wsPanel}>
      <p className={styles.wsHint}>
        ویجت فروشگاه · منبع:{' '}
        <strong dir="ltr">{variant.source || variant.kind}</strong>
      </p>

      <p className={styles.wsMiniLabel}>بخش تنظیمات</p>
      <div
        className={styles.wsSeg}
        style={{
          gridTemplateColumns: `repeat(${Math.min(tabs.length, 3)}, 1fr)`,
          marginBottom: '0.65rem',
        }}
      >
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`${styles.wsSegBtn} ${
              tab === t.id ? styles.wsSegBtnActive : ''
            }`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'general' ? (
        <Section title="نمایش و منبع">
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
            label="محتوای تمام‌عرض"
            hint="عرض محتوای داخل سکشن بدون محدودیت کانتینر"
          />

          <p className={`${styles.wsMiniLabel} ${styles.wsMiniLabelSpaced}`}>
            پس‌زمینه سکشن
          </p>
          <label className={styles.wsLabel}>نوع پس‌زمینه</label>
          <Seg
            options={SHOP_SURFACE_MODES}
            value={settings.surface_mode || 'transparent'}
            onChange={(v) => patch('surface_mode', v)}
            cols={2}
          />
          {(settings.surface_mode || 'transparent') === 'color' ? (
            <>
              <ColorRow
                label="رنگ پس‌زمینه"
                value={settings.surface_bg}
                fallback="#f5f5f5"
                onChange={(v) => patch('surface_bg', v)}
              />
              <label className={styles.wsLabel}>محدوده رنگ</label>
              <Seg
                options={SHOP_SURFACE_SPANS}
                value={settings.surface_span || 'full'}
                onChange={(v) => patch('surface_span', v)}
                cols={1}
              />
              <p className={styles.wsHint}>
                تمام عرض صفحه = نوار رنگی لب‌به‌لب صفحه · فقط کانتینر = رنگ فقط
                داخل عرض محتوا
              </p>
            </>
          ) : null}
        </Section>
      ) : null}

      {tab === 'title' ? (
        <Section title="عنوان بخش">
          <Toggle
            checked={settings.show_title}
            onChange={(v) => patch('show_title', v)}
            label="نمایش عنوان"
          />
          <label className={styles.wsField}>
            <span>متن عنوان</span>
            <input
              value={settings.title_text}
              placeholder={variant.title || ''}
              onChange={(e) => patch('title_text', e.target.value)}
            />
          </label>
          {settings.show_title ? (
            <>
              <label className={styles.wsLabel}>نوع فونت عنوان</label>
              <Seg
                options={SHOP_FONTS}
                value={settings.head_title_font}
                onChange={(v) => patch('head_title_font', v)}
                cols={2}
              />
              <div className={styles.wsPxGrid}>
                <PxField
                  label="اندازه فونت"
                  value={settings.head_title_size}
                  min={12}
                  max={48}
                  onChange={(v) => patch('head_title_size', v)}
                />
                <PxField
                  label="اندازه لینک بیشتر"
                  value={settings.more_link_size}
                  min={10}
                  max={24}
                  onChange={(v) => patch('more_link_size', v)}
                />
              </div>
              <label className={styles.wsLabel}>وزن فونت</label>
              <Seg
                options={SHOP_HEAD_TITLE_WEIGHTS}
                value={String(settings.head_title_weight)}
                onChange={(v) => patch('head_title_weight', v)}
                cols={2}
              />
              <label className={styles.wsLabel}>چینش عنوان</label>
              <Seg
                options={SHOP_HEAD_TITLE_ALIGNS}
                value={settings.head_title_align}
                onChange={(v) => patch('head_title_align', v)}
                cols={2}
              />
              <ColorRow
                label="رنگ عنوان"
                value={settings.head_title_color}
                fallback="#3f3f3f"
                onChange={(v) => patch('head_title_color', v)}
              />
            </>
          ) : null}

          <p className={`${styles.wsMiniLabel} ${styles.wsMiniLabelSpaced}`}>
            لینک بیشتر
          </p>
          <Toggle
            checked={settings.show_more_link}
            onChange={(v) => patch('show_more_link', v)}
            label="نمایش لینک مشاهده همه"
          />
          {settings.show_more_link ? (
            <>
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
              <ColorRow
                label="رنگ لینک"
                value={settings.more_link_color}
                fallback="#ff00a6"
                onChange={(v) => patch('more_link_color', v)}
              />
            </>
          ) : null}
        </Section>
      ) : null}

      {tab === 'recycler' ? (
        <Section title="اسکلتون آماده">
          <p className={styles.wsHint}>
            یکی از اسکلتون‌ها را انتخاب کنید تا ظاهر کارت، تصویر و فلش‌ها یکجا ست
            شود (از جمله افقی فشرده طلایی مثل محصولات مشابه).
          </p>
          <div className={styles.wsPresetGrid}>
            {SHOP_RECYCLER_PRESETS.map((preset) => {
              const on = settings.recycler_preset === preset.id
              return (
                <button
                  key={preset.id}
                  type="button"
                  className={`${styles.wsPresetCard} ${
                    on ? styles.wsPresetCardOn : ''
                  }`}
                  onClick={() => patchMany({ ...preset.patch })}
                >
                  <div
                    className={`${styles.wsPresetSkel} ${
                      styles[`wsPresetSkel_${preset.skeleton}`] || ''
                    }`}
                    aria-hidden
                  >
                    <span className={styles.wsPresetSkelArrow} />
                    <div className={styles.wsPresetSkelCards}>
                      <div className={styles.wsPresetSkelCard}>
                        <i className={styles.wsPresetSkelImg} />
                        <i className={styles.wsPresetSkelLine} />
                        <i className={styles.wsPresetSkelLineShort} />
                        <i className={styles.wsPresetSkelBtn} />
                      </div>
                      <div className={styles.wsPresetSkelCard}>
                        <i className={styles.wsPresetSkelImg} />
                        <i className={styles.wsPresetSkelLine} />
                        <i className={styles.wsPresetSkelLineShort} />
                        <i className={styles.wsPresetSkelBtn} />
                      </div>
                    </div>
                    <span className={styles.wsPresetSkelArrow} />
                  </div>
                  <strong>{preset.label}</strong>
                  <small>{preset.desc}</small>
                </button>
              )
            })}
          </div>

          <p className={`${styles.wsMiniLabel} ${styles.wsMiniLabelSpaced}`}>
            تنظیمات دستی ریسایکلر
          </p>
          <PxField
            label="عرض کارت"
            value={settings.recycler_card_width}
            min={120}
            max={320}
            onChange={(v) => patch('recycler_card_width', v)}
          />
          <Toggle
            checked={settings.recycler_show_scrollbar}
            onChange={(v) => patch('recycler_show_scrollbar', v)}
            label="نمایش اسکرول‌بار"
          />
          <Toggle
            checked={settings.recycler_show_arrows}
            onChange={(v) => patch('recycler_show_arrows', v)}
            label="دکمه‌های قبلی / بعدی"
          />
          {settings.recycler_show_arrows ? (
            <>
              <label className={styles.wsLabel}>جایگاه فلش‌ها</label>
              <Seg
                options={SHOP_RECYCLER_ARROW_PLACES}
                value={
                  settings.recycler_arrow_place === 'sides'
                    ? 'overlay'
                    : settings.recycler_arrow_place
                }
                onChange={(v) => patch('recycler_arrow_place', v)}
                cols={1}
              />
              {(settings.recycler_arrow_place || 'outside') === 'outside' ? (
                <>
                  <PxField
                    label="فاصله فلش تا کارت‌ها"
                    value={settings.recycler_arrow_gap}
                    min={0}
                    max={40}
                    onChange={(v) => patch('recycler_arrow_gap', v)}
                  />
                  <Toggle
                    checked={settings.recycler_arrow_match_height}
                    onChange={(v) => patch('recycler_arrow_match_height', v)}
                    label="ارتفاع بک‌گراند فلش = ارتفاع کارت‌ها"
                    hint="در حالت خارج از محدوده، فلش تمام ارتفاع فضای کارت را می‌گیرد"
                  />
                </>
              ) : null}
              <label className={styles.wsLabel}>شکل دکمه</label>
              <Seg
                options={SHOP_RECYCLER_ARROW_STYLES}
                value={settings.recycler_arrow_style}
                onChange={(v) => {
                  const r = v === 'square' ? 10 : 999
                  patchMany({
                    recycler_arrow_style: v,
                    recycler_arrow_radius: r,
                    recycler_arrow_radius_tl: r,
                    recycler_arrow_radius_tr: r,
                    recycler_arrow_radius_br: r,
                    recycler_arrow_radius_bl: r,
                  })
                }}
                cols={2}
              />
              <label className={styles.wsLabel}>نوع آیکون</label>
              <Seg
                options={SHOP_RECYCLER_ARROW_ICONS}
                value={settings.recycler_arrow_icon}
                onChange={(v) => patch('recycler_arrow_icon', v)}
                cols={3}
              />
              <PxField
                label="اندازه دکمه"
                value={settings.recycler_arrow_size}
                min={24}
                max={64}
                onChange={(v) => patch('recycler_arrow_size', v)}
              />
              <label className={styles.wsLabel}>رَدیوس گوشه‌ها</label>
              <div className={styles.wsPxGrid}>
                {SHOP_RECYCLER_ARROW_RADIUS_CORNERS.map((f) => (
                  <PxField
                    key={f.key}
                    label={f.label}
                    value={settings[f.key]}
                    max={999}
                    onChange={(v) => patch(f.key, v)}
                  />
                ))}
              </div>
              <PxField
                label="همه گوشه‌ها یکسان"
                value={settings.recycler_arrow_radius}
                max={999}
                onChange={(v) =>
                  patchMany({
                    recycler_arrow_radius: v,
                    recycler_arrow_radius_tl: v,
                    recycler_arrow_radius_tr: v,
                    recycler_arrow_radius_br: v,
                    recycler_arrow_radius_bl: v,
                  })
                }
              />
              <label className={styles.wsLabel}>پدینگ و مارجین</label>
              <div className={styles.wsPxGrid}>
                {SHOP_RECYCLER_ARROW_SPACE_FIELDS.map((f) => (
                  <PxField
                    key={f.key}
                    label={f.label}
                    value={settings[f.key]}
                    max={80}
                    onChange={(v) => patch(f.key, v)}
                  />
                ))}
              </div>
              <div
                className={`${styles.wsColorList} ${styles.wsColorListSpaced}`}
              >
                <ColorRow
                  label="پس‌زمینه دکمه"
                  value={settings.recycler_arrow_bg}
                  fallback="#ffffff"
                  onChange={(v) => patch('recycler_arrow_bg', v)}
                />
                <ColorRow
                  label="رنگ آیکون"
                  value={settings.recycler_arrow_color}
                  fallback="#3f3f3f"
                  onChange={(v) => patch('recycler_arrow_color', v)}
                />
                <ColorRow
                  label="حاشیه دکمه"
                  value={settings.recycler_arrow_border}
                  fallback="#dbdbdb"
                  onChange={(v) => patch('recycler_arrow_border', v)}
                />
              </div>
            </>
          ) : null}
        </Section>
      ) : null}

      {tab === 'card' ? (
        <Section title="ظاهر کارت">
          <label className={styles.wsLabel}>استایل کارت</label>
          <Seg
            options={SHOP_CARD_STYLES}
            value={settings.card_style}
            onChange={(v) => patch('card_style', v)}
            cols={2}
          />
          <label className={styles.wsLabel}>افکت هاور</label>
          <Seg
            options={SHOP_HOVER_EFFECTS}
            value={settings.hover_effect}
            onChange={(v) => patch('hover_effect', v)}
            cols={2}
          />
          <label className={styles.wsLabel}>فونت عنوان محصول</label>
          <Seg
            options={SHOP_FONTS}
            value={settings.product_title_font}
            onChange={(v) => patch('product_title_font', v)}
            cols={2}
          />
          <label className={styles.wsLabel}>شعاع گوشه‌های کارت</label>
          <div className={styles.wsPxGrid}>
            {SHOP_CARD_RADIUS_CORNERS.map((f) => (
              <PxField
                key={f.key}
                label={f.label}
                value={settings[f.key]}
                max={80}
                onChange={(v) => patch(f.key, v)}
              />
            ))}
          </div>
          <PxField
            label="همه گوشه‌ها یکسان"
            value={settings.card_radius}
            max={80}
            onChange={(v) =>
              patchMany({
                card_radius: v,
                card_radius_tl: v,
                card_radius_tr: v,
                card_radius_br: v,
                card_radius_bl: v,
              })
            }
          />
        </Section>
      ) : null}

      {tab === 'image' ? (
        <Section title="تصویر کارت">
          <Toggle
            checked={settings.show_image}
            onChange={(v) => patch('show_image', v)}
            label="نمایش تصویر"
          />
          {settings.show_image ? (
            <>
              <label className={styles.wsLabel}>جانمایی تصویر</label>
              <Seg
                options={SHOP_IMAGE_PLACEMENTS}
                value={settings.image_placement}
                onChange={(v) => patch('image_placement', v)}
                cols={3}
              />
              <label className={styles.wsLabel}>بیرون‌زدگی تصویر از کارت</label>
              <Seg
                options={SHOP_IMAGE_OVERFLOWS}
                value={settings.image_overflow || 'none'}
                onChange={(v) => patch('image_overflow', v)}
                cols={1}
              />
              <label className={styles.wsLabel}>شکل تصویر</label>
              <Seg
                options={SHOP_IMAGE_SHAPES}
                value={settings.image_shape || 'circle'}
                onChange={(v) => {
                  // شعاع را با شکل عوض کن؛ وگرنه radius=999 از دایره می‌ماند و هنوز گرد دیده می‌شود
                  if (v === 'circle') {
                    patchMany({
                      image_shape: v,
                      image_radius: 999,
                      image_radius_tl: 999,
                      image_radius_tr: 999,
                      image_radius_br: 999,
                      image_radius_bl: 999,
                      recycler_preset: '',
                      _keep_circle_image: true,
                      _keep_image_style: true,
                    })
                  } else if (v === 'square') {
                    patchMany({
                      image_shape: v,
                      image_radius: 0,
                      image_radius_tl: 0,
                      image_radius_tr: 0,
                      image_radius_br: 0,
                      image_radius_bl: 0,
                      recycler_preset: '',
                      _keep_circle_image: false,
                      _keep_image_style: true,
                    })
                  } else {
                    patchMany({
                      image_shape: v,
                      image_radius: 18,
                      image_radius_tl: 18,
                      image_radius_tr: 18,
                      image_radius_br: 18,
                      image_radius_bl: 18,
                      image_overflow: 'half_top',
                      image_placement: 'top',
                      recycler_preset: '',
                      _keep_circle_image: false,
                      _keep_image_style: true,
                    })
                  }
                }}
                cols={3}
              />
              <label className={styles.wsLabel}>نسبت تصویر</label>
              <Seg
                options={SHOP_IMAGE_RATIOS}
                value={settings.image_ratio}
                onChange={(v) => patch('image_ratio', v)}
                cols={2}
              />
              <PxField
                label="ابعاد تصویر"
                value={settings.image_size}
                min={48}
                max={240}
                onChange={(v) => patch('image_size', v)}
              />
              {settings.image_shape === 'rounded' ? (
                <>
                  <label className={styles.wsLabel}>شعاع گوشه‌های تصویر</label>
                  <div className={styles.wsPxGrid}>
                    {SHOP_IMAGE_RADIUS_CORNERS.map((f) => (
                      <PxField
                        key={f.key}
                        label={f.label}
                        value={settings[f.key]}
                        max={999}
                        onChange={(v) => patch(f.key, v)}
                      />
                    ))}
                  </div>
                  <PxField
                    label="همه گوشه‌ها یکسان"
                    value={settings.image_radius}
                    max={999}
                    onChange={(v) =>
                      patchMany({
                        image_radius: v,
                        image_radius_tl: v,
                        image_radius_tr: v,
                        image_radius_br: v,
                        image_radius_bl: v,
                      })
                    }
                  />
                </>
              ) : null}
            </>
          ) : null}
        </Section>
      ) : null}

      {tab === 'content' ? (
        <Section title="عناصر قابل نمایش">
          {!isStories ? (
            <>
              <Toggle
                checked={settings.show_product_title}
                onChange={(v) => patch('show_product_title', v)}
                label="عنوان محصول"
              />
              <Toggle
                checked={settings.show_lid}
                onChange={(v) => patch('show_lid', v)}
                label="توضیح کوتاه (لید)"
              />
            </>
          ) : null}
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
            label="امتیاز / رتبه"
          />

          {!isStories && settings.show_discount ? (
            <>
              <p
                className={`${styles.wsMiniLabel} ${styles.wsMiniLabelSpaced}`}
              >
                تخفیف
              </p>
              <label className={styles.wsLabel}>جایگاه تخفیف</label>
              <Seg
                options={SHOP_DISCOUNT_ZONES}
                value={settings.discount_zone}
                onChange={(v) => patch('discount_zone', v)}
                cols={1}
              />
            </>
          ) : null}

          {!isStories && settings.show_rating ? (
            <>
              <p
                className={`${styles.wsMiniLabel} ${styles.wsMiniLabelSpaced}`}
              >
                امتیاز
              </p>
              <label className={styles.wsLabel}>نوع نمایش</label>
              <Seg
                options={SHOP_RATING_STYLES}
                value={settings.rating_style}
                onChange={(v) => patch('rating_style', v)}
                cols={2}
              />
              <label className={styles.wsLabel}>ناحیه</label>
              <Seg
                options={SHOP_RATING_ZONES}
                value={settings.rating_zone}
                onChange={(v) => patch('rating_zone', v)}
                cols={2}
              />
              {settings.rating_zone === 'image' ||
              settings.rating_zone === 'card' ? (
                <>
                  <label className={styles.wsLabel}>موقعیت</label>
                  <Seg
                    options={SHOP_RATING_CORNERS}
                    value={settings.rating_corner}
                    onChange={(v) => patch('rating_corner', v)}
                    cols={3}
                  />
                </>
              ) : (
                <>
                  <label className={styles.wsLabel}>تراز افقی</label>
                  <Seg
                    options={SHOP_RATING_ALIGNS}
                    value={settings.rating_align}
                    onChange={(v) => patch('rating_align', v)}
                    cols={3}
                  />
                </>
              )}
            </>
          ) : null}
        </Section>
      ) : null}

      {tab === 'buttons' ? (
        <Section title="لایک و سبد خرید">
          <Toggle
            checked={settings.show_add_button}
            onChange={(v) => patch('show_add_button', v)}
            label="دکمه افزودن به سبد"
          />
          <Toggle
            checked={settings.show_like}
            onChange={(v) => patch('show_like', v)}
            label="دکمه لایک / علاقه‌مندی"
          />
          <label className={styles.wsLabel}>استایل دکمه خرید</label>
          <Seg
            options={SHOP_CTA_STYLES}
            value={settings.cta_style}
            onChange={(v) => patch('cta_style', v)}
            cols={2}
          />
          <label className={styles.wsLabel}>فونت دکمه</label>
          <Seg
            options={SHOP_FONTS}
            value={settings.btn_font}
            onChange={(v) => patch('btn_font', v)}
            cols={2}
          />
          <label className={styles.wsLabel}>جایگاه دکمه‌ها</label>
          <Seg
            options={SHOP_ACTIONS_ZONES}
            value={settings.actions_zone}
            onChange={(v) => patch('actions_zone', v)}
            cols={1}
          />
          <label className={styles.wsLabel}>تراز / عرض</label>
          <Seg
            options={SHOP_ACTIONS_ALIGNS}
            value={settings.actions_align}
            onChange={(v) => patch('actions_align', v)}
            cols={2}
          />
          <label className={styles.wsLabel}>ابعاد دکمه</label>
          <div className={styles.wsPxGrid}>
            <PxField
              label="ارتفاع"
              value={settings.btn_height}
              min={20}
              max={80}
              onChange={(v) => patch('btn_height', v)}
            />
            <PxField
              label="پدینگ افقی"
              value={settings.btn_pad_x}
              min={0}
              max={48}
              onChange={(v) => patch('btn_pad_x', v)}
            />
            <PxField
              label="اندازه فونت"
              value={settings.btn_font_size}
              min={8}
              max={24}
              onChange={(v) => patch('btn_font_size', v)}
            />
            <PxField
              label="حداقل عرض"
              value={settings.btn_min_width}
              min={0}
              max={320}
              onChange={(v) => patch('btn_min_width', v)}
            />
          </div>
          <label className={styles.wsLabel}>شعاع گوشه‌های دکمه</label>
          <div className={styles.wsPxGrid}>
            {SHOP_BTN_RADIUS_CORNERS.map((f) => (
              <PxField
                key={f.key}
                label={f.label}
                value={settings[f.key]}
                max={999}
                onChange={(v) => patch(f.key, v)}
              />
            ))}
          </div>
          <PxField
            label="همه گوشه‌ها یکسان"
            value={settings.btn_radius}
            max={999}
            onChange={(v) =>
              patchMany({
                btn_radius: v,
                btn_radius_tl: v,
                btn_radius_tr: v,
                btn_radius_br: v,
                btn_radius_bl: v,
              })
            }
          />
        </Section>
      ) : null}

      {tab === 'colors' ? (
        <Section title="پالت رنگ">
          {SHOP_COLOR_GROUPS.map((group) => (
            <div key={group.id} className={styles.wsStack}>
              <p className={styles.wsMiniLabel}>{group.label}</p>
              <div
                className={`${styles.wsColorList} ${styles.wsColorListSpaced}`}
              >
                {group.keys.map((key) => {
                  const meta = colorMeta(key)
                  if (!meta) return null
                  return (
                    <ColorRow
                      key={key}
                      label={meta.label}
                      value={settings[key]}
                      fallback={meta.fallback}
                      onChange={(v) => patch(key, v)}
                    />
                  )
                })}
              </div>
            </div>
          ))}
        </Section>
      ) : null}

      {tab === 'layout' ? (
        <Section title="فاصله و عرض">
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
        </Section>
      ) : null}
    </div>
  )
}
