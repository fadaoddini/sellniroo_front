'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  Heart,
  Layers,
  Package,
  Percent,
  Share2,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  Star,
} from 'lucide-react'
import PageBuilderRenderer from '@/components/layout/PageBuilderRenderer'
import {
  fetchSiteSettings,
  clearSiteSettingsCache,
  resolveActiveShopLayoutMode,
  resolveProductSingleLayoutForMode,
} from '@/services/siteSettings'
import {
  fetchSiteModules,
  clearSiteModulesCache,
} from '@/services/siteModules'
import {
  DEFAULT_PRODUCT_SINGLE_LAYOUT,
  normalizeProductSingleLayout,
} from '@/config/homeLayout'
import {
  DEFAULT_PRODUCT_SINGLE_PAGE_SETTINGS,
  findProductArticleWidgetSettings,
  normalizeProductSingleDetailBlocksOrder,
  normalizeProductSinglePageSettings,
  productSingleCssVars,
  productSingleIsStack,
  productSingleLayoutFamily,
} from '@/config/productSinglePageSettings'
import { useCartOptional } from '@/contexts/CartContext'
import shopApi from '@/services/shopApi'
import { iranShareTargets } from '@/utils/iranShare'
import {
  SHOP_WISHLIST_EVENT,
  isProductWishlisted,
  toggleProductWishlist,
} from '@/utils/shopWishlist'
import styles from './ProductDetail.module.css'

function formatPrice(n) {
  return (Number(n) || 0).toLocaleString('fa-IR')
}

function productQtyLimits(product) {
  const min = Math.max(1, Number(product?.number_min) || 1)
  let max = Number(product?.number_max)
  if (!Number.isFinite(max) || max < 1) max = 9999
  // سقف سفارش برای این کاربر (رزرو خودش از سقفش کم نمی‌شود)
  const availableForUserRaw =
    product?.stock?.available ??
    product?.stock_remaining ??
    product?.stock?.remaining ??
    null
  // موجودی آزاد واقعی الان (همه رزروها کسر شده) — عدد نمایشی
  const availableNowRaw =
    product?.stock?.available_now ??
    product?.stock?.available ??
    product?.stock_remaining ??
    product?.stock?.remaining ??
    null
  const remainingRaw = product?.stock?.remaining ?? product?.stock_remaining ?? null
  const heldOthers = Number(product?.stock?.held_by_others) || 0
  const heldTotal = Number(product?.stock?.held_total) || heldOthers
  let maxStock = null
  if (availableForUserRaw != null && availableForUserRaw !== '') {
    maxStock = Math.max(0, Number(availableForUserRaw) || 0)
    max = Math.min(max, maxStock)
  }
  let availableNow = null
  if (availableNowRaw != null && availableNowRaw !== '') {
    availableNow = Math.max(0, Number(availableNowRaw) || 0)
  }
  const canOrder = max >= min && (maxStock == null || maxStock > 0)
  return {
    min,
    max: canOrder ? max : 0,
    canOrder,
    stock: availableNow,
    maxStock,
    remaining:
      remainingRaw != null && remainingRaw !== ''
        ? Math.max(0, Number(remainingRaw) || 0)
        : null,
    heldOthers,
    heldTotal,
    holdMinutes: Number(product?.stock?.hold_minutes) || 5,
  }
}

function unitPriceForQty(product, quantity) {
  const qty = Math.max(1, Number(quantity) || 1)
  const tiers = [...(product?.price_tiers || [])].sort(
    (a, b) => Number(b.min_quantity || 0) - Number(a.min_quantity || 0)
  )
  for (const tier of tiers) {
    if (qty >= Number(tier.min_quantity || 0)) {
      return Math.max(0, Number(tier.unit_price) || 0)
    }
  }
  return Math.max(
    0,
    Number(
      product?.final_price ?? product?.get_discounted_price ?? product?.price_one
    ) || 0
  )
}

function productImages(product) {
  const list = []
  const main = shopApi.resolveImage(product)
  if (main) list.push(main)
  ;(product?.images || []).forEach((im) => {
    const url = im?.image_url || im?.url || im?.image || ''
    if (url && !list.includes(url)) list.push(url)
  })
  return list
}

function thumbsDir(position) {
  return position === 'start' || position === 'end' ? 'v' : 'h'
}

function GalleryBlock({
  images,
  title,
  active,
  onPick,
  showThumbs,
  placement = 'outside',
  position = 'bottom',
  hover = 'zoom',
  className,
}) {
  const src = images[active] || images[0] || ''
  const inside = placement === 'inside'
  const dir = thumbsDir(position)
  const galleryMods = [
    styles.gallery,
    className,
    inside ? styles.galleryThumbsInside : styles.galleryThumbsOutside,
    styles[`galleryPos_${position}`] || styles.galleryPos_bottom,
    styles[`galleryDir_${dir}`] || styles.galleryDir_h,
    styles[`hover_${hover}`] || styles.hover_zoom,
  ]
    .filter(Boolean)
    .join(' ')

  const thumbsEl =
    showThumbs && images.length > 1 ? (
      <div
        className={`${styles.thumbs} ${
          dir === 'v' ? styles.thumbsV : styles.thumbsH
        }`}
        role="list"
      >
        {images.map((url, i) => (
          <button
            key={`${url}-${i}`}
            type="button"
            className={`${styles.thumb} ${i === active ? styles.thumbOn : ''}`}
            onClick={() => onPick(i)}
            aria-label={`تصویر ${i + 1}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt="" />
          </button>
        ))}
      </div>
    ) : null

  return (
    <div className={galleryMods}>
      <div className={styles.galleryMain}>
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt={title || ''} />
        ) : (
          <span className={styles.galleryEmpty}>
            <ShoppingCart size={40} />
          </span>
        )}
        {inside ? thumbsEl : null}
      </div>
      {!inside ? thumbsEl : null}
    </div>
  )
}

function iconBtnClass(styleKey, solidCls, outlineCls, softCls) {
  if (styleKey === 'outline') return outlineCls
  if (styleKey === 'soft') return softCls
  return solidCls
}

function patchStockAfterHold(product, heldDelta) {
  const stock = product?.stock && typeof product.stock === 'object' ? product.stock : {}
  const remaining =
    stock.remaining != null
      ? Number(stock.remaining)
      : product?.stock_remaining != null
        ? Number(product.stock_remaining)
        : null
  const prevNow =
    stock.available_now != null
      ? Number(stock.available_now)
      : stock.available != null
        ? Number(stock.available)
        : remaining
  const delta = Number(heldDelta) || 0
  const nextNow =
    prevNow == null ? null : Math.max(0, prevNow - delta)
  const heldTotal = Math.max(0, (Number(stock.held_total) || 0) + delta)
  return {
    ...product,
    stock_remaining: nextNow ?? product.stock_remaining,
    stock: {
      ...stock,
      remaining: remaining ?? stock.remaining,
      available_now: nextNow,
      available:
        stock.available != null ? Number(stock.available) : nextNow,
      held_total: heldTotal,
      held_by_others: Number(stock.held_by_others) || 0,
      hold_minutes: stock.hold_minutes || 5,
    },
  }
}

/** ظاهر PDP — ۴ اسکلتون + تنظیمات کامل */
function ProductArticleInner({
  product,
  pageSettings,
  onCartChanged,
  onOptimisticStock,
}) {
  const cart = useCartOptional()
  const s = normalizeProductSinglePageSettings(pageSettings)
  const vars = productSingleCssVars(s)
  const images = useMemo(() => productImages(product), [product])
  const [activeImg, setActiveImg] = useState(0)
  const basePrice =
    product.final_price ?? product.get_discounted_price ?? product.price_one
  const hasDiscount = product.has_discount || (product.discount || 0) > 0
  const limits = useMemo(() => productQtyLimits(product), [product])
  const inStock = limits.canOrder && product.status !== 'inactive'
  const inCartQty = cart ? cart.getQty(product.id) : 0
  const [qty, setQty] = useState(() => limits.min || 1)
  const [adding, setAdding] = useState(false)
  const [toast, setToast] = useState(null)
  const [wished, setWished] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)
  const [shareCopied, setShareCopied] = useState(false)
  const [stockFlash, setStockFlash] = useState(false)
  const shareWrapRef = useRef(null)
  const toastTimerRef = useRef(null)
  const prevAvailableRef = useRef(limits.stock)

  useEffect(() => {
    const next = limits.stock
    if (
      prevAvailableRef.current != null &&
      next != null &&
      prevAvailableRef.current !== next
    ) {
      setStockFlash(true)
      const t = window.setTimeout(() => setStockFlash(false), 700)
      prevAvailableRef.current = next
      return () => window.clearTimeout(t)
    }
    prevAvailableRef.current = next
    return undefined
  }, [limits.stock])
  const priceTiers = useMemo(() => {
    return [...(product.price_tiers || [])]
      .map((t) => ({
        min_quantity: Number(t.min_quantity) || 0,
        unit_price: Number(t.unit_price) || 0,
      }))
      .filter((t) => t.min_quantity > 1)
      .sort((a, b) => a.min_quantity - b.min_quantity)
  }, [product.price_tiers])

  const showToast = (message) => {
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current)
    setToast(message)
    toastTimerRef.current = window.setTimeout(() => setToast(null), 2200)
  }
  const rate = Math.round(Number(product.rate) || 0)
  const effectiveQty = inCartQty > 0 ? inCartQty : qty
  const unit = unitPriceForQty(product, effectiveQty)
  const liveTotal = unit * effectiveQty
  const layout = s.layout || 'split'
  const clampQty = (n) => {
    if (!limits.canOrder) return limits.min
    return Math.min(limits.max, Math.max(limits.min, Number(n) || limits.min))
  }

  useEffect(() => {
    setActiveImg(0)
    setQty(limits.min || 1)
  }, [product?.id, limits.min])

  useEffect(
    () => () => {
      if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current)
    },
    []
  )

  const handleAdd = async () => {
    if (!cart || !limits.canOrder) {
      showToast(
        limits.stock === 0 ? 'این محصول ناموجود است' : 'امکان سفارش وجود ندارد'
      )
      return
    }
    const nextQty = clampQty(Math.max(limits.min || 1, 1))
    setQty(nextQty)
    setAdding(true)
    try {
      await cart.setQty(product, nextQty)
      onOptimisticStock?.(nextQty)
      showToast(
        `به سبد اضافه و تا ${limits.holdMinutes.toLocaleString('fa-IR')} دقیقه رزرو شد`
      )
      onCartChanged?.()
    } catch (err) {
      const code = err?.code || err?.data?.code
      if (code === 'other_shop') {
        const title = err.data?.current_shop_title || 'فروشگاه دیگر'
        if (
          window.confirm(`سبد فعلی متعلق به «${title}» است. جایگزین شود؟`)
        ) {
          await cart.setQty(product, nextQty, { replaceShop: true })
          onOptimisticStock?.(nextQty)
          showToast(
            `به سبد اضافه و تا ${limits.holdMinutes.toLocaleString('fa-IR')} دقیقه رزرو شد`
          )
          onCartChanged?.()
        }
      } else {
        showToast(err?.data?.error || err?.message || 'خطا در افزودن به سبد')
        onCartChanged?.()
      }
    } finally {
      setAdding(false)
    }
  }

  const onCartQtyChange = async (next) => {
    if (!cart || inCartQty <= 0) return
    let n = Number(next) || 0
    if (n <= 0) {
      setAdding(true)
      try {
        const prevHeld = inCartQty
        await cart.setQty(product, 0)
        onOptimisticStock?.(-prevHeld)
        setQty(limits.min || 1)
        showToast('از سبد حذف شد')
        onCartChanged?.()
      } catch (err) {
        showToast(err?.data?.error || err?.message || 'خطا در حذف از سبد')
        onCartChanged?.()
      } finally {
        setAdding(false)
      }
      return
    }
    if (n > limits.max) {
      showToast(
        `حداکثر سفارش ${limits.max.toLocaleString('fa-IR')} عدد است`
      )
      n = limits.max
    }
    if (n < limits.min) {
      showToast(
        `حداقل سفارش ${limits.min.toLocaleString('fa-IR')} عدد است`
      )
      n = limits.min
    }
    n = clampQty(n)
    setQty(n)
    setAdding(true)
    try {
      const prevHeld = inCartQty
      await cart.setQty(product, n)
      onOptimisticStock?.(n - prevHeld)
      onCartChanged?.()
    } catch (err) {
      showToast(err?.data?.error || err?.message || 'خطا در تغییر تعداد')
      onCartChanged?.()
    } finally {
      setAdding(false)
    }
  }

  useEffect(() => {
    if (inCartQty > 0) setQty(clampQty(inCartQty))
  }, [inCartQty, limits.min, limits.max, limits.canOrder])

  useEffect(() => {
    setWished(isProductWishlisted(product?.id))
    const sync = () => setWished(isProductWishlisted(product?.id))
    window.addEventListener(SHOP_WISHLIST_EVENT, sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener(SHOP_WISHLIST_EVENT, sync)
      window.removeEventListener('storage', sync)
    }
  }, [product?.id])

  useEffect(() => {
    if (!shareOpen) return undefined
    const onDoc = (e) => {
      if (shareWrapRef.current && !shareWrapRef.current.contains(e.target)) {
        setShareOpen(false)
      }
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [shareOpen])

  const onToggleWish = () => {
    setWished(toggleProductWishlist(product.id))
  }

  const shareUrl =
    typeof window !== 'undefined' ? window.location.href : ''
  const shareTargets = iranShareTargets(shareUrl, product.title || 'محصول', {
    share_bale: s.share_bale,
    share_eitaa: s.share_eitaa,
    share_rubika: s.share_rubika,
    share_soroush: s.share_soroush,
  })

  const onCopyShare = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl)
        setShareCopied(true)
        setTimeout(() => setShareCopied(false), 1800)
      }
    } catch {
      /* ignore */
    }
  }

  const family = productSingleLayoutFamily(layout)
  const isStack = productSingleIsStack(family)
  const isCover = family === 'cover'
  const isReverse = family === 'two_col_rev'
  const layoutClass =
    family === 'cover'
      ? styles.layoutCover
      : isStack
        ? styles.layoutStack
        : isReverse
          ? styles.layoutTwoColRev
          : styles.layoutTwoCol

  const ctaClass =
    s.cta_style === 'outline'
      ? styles.primaryOutline
      : s.cta_style === 'soft'
        ? styles.primarySoft
        : styles.primary

  const badges = (
    (s.show_badges || s.show_discount_badge || s.show_featured_badge) &&
    (hasDiscount || product.is_featured || s.show_stock) ? (
      <div className={styles.badgeRow} aria-label="نشان‌های محصول">
        {s.show_discount_badge && hasDiscount ? (
          <span className={`${styles.badgePill} ${styles.badgeSale}`}>
            <Percent size={13} strokeWidth={2.4} aria-hidden />
            <span className={styles.badgePillText}>
              <small>تخفیف</small>
              <strong>
                {Number(product.discount).toLocaleString('fa-IR')}٪
              </strong>
            </span>
          </span>
        ) : null}
        {s.show_featured_badge && product.is_featured ? (
          <span className={`${styles.badgePill} ${styles.badgeFeatured}`}>
            <Sparkles size={13} strokeWidth={2.4} aria-hidden />
            <span className={styles.badgePillText}>
              <small>وضعیت</small>
              <strong>ویژه</strong>
            </span>
          </span>
        ) : null}
        {s.show_stock ? (
          <span
            className={`${styles.badgePill} ${
              inStock ? styles.badgeStock : styles.badgeOut
            } ${stockFlash ? styles.stockFlash : ''}`}
          >
            <ShoppingBag size={13} strokeWidth={2.4} aria-hidden />
            <span className={styles.badgePillText}>
              <small>موجودی انبار</small>
              <strong>
                {!inStock
                  ? 'ناموجود'
                  : limits.stock != null
                    ? `${limits.stock.toLocaleString('fa-IR')} عدد`
                    : 'موجود'}
              </strong>
            </span>
          </span>
        ) : null}
      </div>
    ) : null
  )

  const titleBlock =
    s.show_title && !isCover && !isStack ? (
      <div className={styles.headerRight}>
        <h1 className={styles.title}>{product.title}</h1>
      </div>
    ) : null

  const ratingBlock = s.show_rating ? (
    <div className={styles.rateBar}>
      <ul className={styles.stars} aria-label="امتیاز">
        {[...Array(5)].map((_, i) => (
          <li key={i}>
            <Star
              size={14}
              fill={i < rate ? 'currentColor' : 'none'}
              strokeWidth={i < rate ? 0 : 1.5}
            />
          </li>
        ))}
      </ul>
      {product.rate != null ? (
        <span className={styles.rateBox}>
          {Number(product.rate).toLocaleString('fa-IR')}
        </span>
      ) : null}
    </div>
  ) : null

  const lidBlock =
    s.show_lid && product.lid ? (
      <p className={styles.lid}>{product.lid}</p>
    ) : null

  const priceBlock =
    s.show_price || priceTiers.length > 0 ? (
      <section className={styles.pricePanel} aria-label="قیمت محصول">
        {s.show_price &&
        s.show_old_price &&
        hasDiscount &&
        product.discount > 0 &&
        unit > 0 ? (
          <span className={styles.priceOff}>
            {Number(product.discount).toLocaleString('fa-IR')}٪
          </span>
        ) : null}
        {s.show_price ? (
          <div className={styles.priceRow}>
            <div className={styles.priceMain}>
              <span className={styles.priceLabel}>
                {!unit || Number(unit) === 0 ? 'قیمت' : 'قیمت واحد'}
              </span>
              <div className={styles.priceValues}>
                {s.show_old_price &&
                hasDiscount &&
                product.price_one &&
                Number(unit) !== Number(product.price_one) ? (
                  <span className={styles.old}>
                    {formatPrice(product.price_one)}
                    <em>تومان</em>
                  </span>
                ) : null}
                <span
                  className={`${styles.price} ${
                    !unit || Number(unit) === 0 ? styles.priceInquire : ''
                  }`}
                >
                  {!unit || Number(unit) === 0 ? (
                    'استعلام قیمت'
                  ) : (
                    <>
                      {formatPrice(unit)}
                      <em>تومان</em>
                    </>
                  )}
                </span>
              </div>
            </div>
            {unit > 0 && effectiveQty > 1 ? (
              <div className={styles.priceTotal}>
                <span className={styles.priceTotalLabel}>
                  جمع {effectiveQty.toLocaleString('fa-IR')} عدد
                </span>
                <strong>
                  {formatPrice(liveTotal)}
                  <em>تومان</em>
                </strong>
              </div>
            ) : null}
          </div>
        ) : null}

        {priceTiers.length > 0 ? (
          <div className={styles.wholesale}>
            <div className={styles.wholesaleHead}>
              <h3 className={styles.wholesaleTitle}>قیمت تعدادی</h3>
              <p className={styles.wholesaleHint}>
                با افزایش تعداد، قیمت هر عدد کمتر می‌شود
              </p>
            </div>
            <ul className={styles.wholesaleList}>
              <li
                className={
                  effectiveQty < (priceTiers[0]?.min_quantity || 2)
                    ? styles.wholesaleOn
                    : undefined
                }
              >
                <span>
                  ۱ تا{' '}
                  {(priceTiers[0].min_quantity - 1).toLocaleString('fa-IR')}
                </span>
                <strong>
                  {formatPrice(basePrice)}
                  <em>تومان</em>
                </strong>
              </li>
              {priceTiers.map((tier, i) => {
                const nextMin = priceTiers[i + 1]?.min_quantity
                const active =
                  effectiveQty >= tier.min_quantity &&
                  (nextMin == null || effectiveQty < nextMin)
                const rangeLabel = nextMin
                  ? `${tier.min_quantity.toLocaleString('fa-IR')} تا ${(nextMin - 1).toLocaleString('fa-IR')}`
                  : `از ${tier.min_quantity.toLocaleString('fa-IR')} به بالا`
                return (
                  <li
                    key={`${tier.min_quantity}-${tier.unit_price}`}
                    className={active ? styles.wholesaleOn : undefined}
                  >
                    <span>{rangeLabel}</span>
                    <strong>
                      {formatPrice(tier.unit_price)}
                      <em>تومان</em>
                    </strong>
                  </li>
                )
              })}
            </ul>
          </div>
        ) : null}
      </section>
    ) : null

  const descriptionBlock =
    s.show_description && product.description ? (
      <div className={styles.desc}>{product.description}</div>
    ) : null

  const specsBlock =
    s.show_specs &&
    (product.specs || product.attributes || product.weight) ? (
      <div className={styles.specs}>
        <h3>مشخصات</h3>
        <ul>
          {product.weight ? (
            <li>
              <span>وزن</span>
              <strong>{product.weight}</strong>
            </li>
          ) : null}
          {Object.entries(product.specs || product.attributes || {}).map(
            ([k, v]) => (
              <li key={k}>
                <span>{k}</span>
                <strong>{String(v)}</strong>
              </li>
            )
          )}
        </ul>
      </div>
    ) : null

  const hasStockMeta =
    limits.min > 1 ||
    Number(product.number_max) > 0 ||
    limits.stock != null ||
    limits.heldTotal > 0

  const stockBlock = hasStockMeta ? (
    <div className={styles.stockPanel} aria-label="وضعیت موجودی و سفارش">
      <div className={styles.stockGrid}>
        {limits.min > 1 ? (
          <div className={styles.stockChip}>
            <span className={styles.stockChipIcon} aria-hidden>
              <Package size={15} strokeWidth={2.2} />
            </span>
            <span className={styles.stockChipBody}>
              <small>حداقل سفارش</small>
              <strong>
                {limits.min.toLocaleString('fa-IR')}
                <em>عدد</em>
              </strong>
            </span>
          </div>
        ) : null}
        {Number(product.number_max) > 0 ? (
          <div className={styles.stockChip}>
            <span className={styles.stockChipIcon} aria-hidden>
              <Layers size={15} strokeWidth={2.2} />
            </span>
            <span className={styles.stockChipBody}>
              <small>حداکثر سفارش</small>
              <strong>
                {Number(product.number_max).toLocaleString('fa-IR')}
                <em>عدد</em>
              </strong>
            </span>
          </div>
        ) : null}
        {limits.stock != null ? (
          <div
            className={`${styles.stockChip} ${styles.stockChipAccent} ${
              stockFlash ? styles.stockFlash : ''
            }`}
          >
            <span className={styles.stockChipIcon} aria-hidden>
              <ShoppingBag size={15} strokeWidth={2.2} />
            </span>
            <span className={styles.stockChipBody}>
              <small>قابل سفارش الان</small>
              <strong>
                {limits.stock.toLocaleString('fa-IR')}
                <em>عدد</em>
              </strong>
            </span>
          </div>
        ) : null}
        {limits.heldTotal > 0 ? (
          <div className={`${styles.stockChip} ${styles.stockChipHold}`}>
            <span className={styles.stockChipIcon} aria-hidden>
              <Clock3 size={15} strokeWidth={2.2} />
            </span>
            <span className={styles.stockChipBody}>
              <small>در حال رزرو سبدها</small>
              <strong>
                {limits.heldTotal.toLocaleString('fa-IR')}
                <em>عدد</em>
              </strong>
              {limits.heldOthers > 0 ? (
                <span className={styles.stockChipNote}>
                  دیگران: {limits.heldOthers.toLocaleString('fa-IR')}
                </span>
              ) : null}
            </span>
          </div>
        ) : null}
      </div>
      {s.show_add_to_cart ? (
        <p className={styles.holdHint}>
          با افزودن به سبد، موجودی تا{' '}
          {limits.holdMinutes.toLocaleString('fa-IR')} دقیقه برای شما رزرو
          می‌شود تا خرید را نهایی کنید.
        </p>
      ) : null}
    </div>
  ) : s.show_add_to_cart ? (
    <p className={styles.holdHint}>
      با افزودن به سبد، موجودی تا {limits.holdMinutes.toLocaleString('fa-IR')}{' '}
      دقیقه برای شما رزرو می‌شود تا خرید را نهایی کنید.
    </p>
  ) : null

  const actionsBlock =
    s.show_add_to_cart || s.show_wishlist || s.show_share ? (
      <div className={styles.actions}>
        {s.show_add_to_cart ? (
          inCartQty > 0 ? (
            <div className={styles.cartQtyBar} aria-label="تعداد در سبد خرید">
              <button
                type="button"
                className={`${styles.cartQtyBtn} ${styles.cartQtyBtnMinus}`}
                onClick={() => onCartQtyChange(inCartQty - 1)}
                aria-label="کاهش تعداد در سبد"
                disabled={adding}
              >
                −
              </button>
              <div className={styles.cartQtyValue}>
                <strong>{inCartQty.toLocaleString('fa-IR')}</strong>
                <small>در سبد</small>
              </div>
              <button
                type="button"
                className={`${styles.cartQtyBtn} ${styles.cartQtyBtnPlus}`}
                onClick={() => onCartQtyChange(inCartQty + 1)}
                aria-label="افزایش تعداد در سبد"
                disabled={
                  adding || !limits.canOrder || inCartQty >= limits.max
                }
              >
                +
              </button>
            </div>
          ) : (
            <button
              type="button"
              className={ctaClass}
              disabled={adding || !limits.canOrder}
              onClick={handleAdd}
            >
              <ShoppingCart size={16} />
              {!limits.canOrder ? 'ناموجود' : 'افزودن به سبد خرید'}
            </button>
          )
        ) : null}
        {s.show_wishlist ? (
          <button
            type="button"
            className={`${iconBtnClass(
              s.wish_style,
              styles.wishBtn,
              styles.wishOutline,
              styles.wishSoft
            )} ${wished ? styles.wishOn : ''}`}
            aria-label={
              wished ? 'حذف از علاقه‌مندی' : 'افزودن به علاقه‌مندی'
            }
            aria-pressed={wished}
            onClick={onToggleWish}
          >
            <Heart size={16} fill={wished ? 'currentColor' : 'none'} />
          </button>
        ) : null}
        {s.show_share ? (
          <div className={styles.shareWrap} ref={shareWrapRef}>
            <button
              type="button"
              className={`${iconBtnClass(
                s.share_style,
                styles.shareSolid,
                styles.shareBtn,
                styles.shareSoft
              )} ${shareOpen ? styles.shareOpen : ''}`}
              aria-label="اشتراک‌گذاری"
              aria-expanded={shareOpen}
              aria-haspopup="menu"
              onClick={() => setShareOpen((v) => !v)}
            >
              <Share2 size={16} />
            </button>
            {shareOpen ? (
              <div className={styles.shareMenu} role="menu">
                <p className={styles.shareMenuLabel}>اشتراک در پیام‌رسان</p>
                <div className={styles.shareGrid}>
                  {shareTargets.map((t) => (
                    <a
                      key={t.id}
                      href={t.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${styles.shareItem} ${
                        styles[`share_${t.id}`] || ''
                      }`}
                      role="menuitem"
                      onClick={() => setShareOpen(false)}
                    >
                      {t.label}
                    </a>
                  ))}
                </div>
                <button
                  type="button"
                  className={styles.shareCopy}
                  onClick={onCopyShare}
                >
                  {shareCopied ? 'کپی شد' : 'کپی لینک'}
                </button>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    ) : null

  const categoryBlock =
    s.show_category && product.category_title ? (
      <div className={styles.metaRow}>
        <strong>دسته‌بندی:</strong>
        <span>{product.category_title}</span>
      </div>
    ) : null

  const shopBlock =
    s.show_shop && (product.shop_title || product.shop_detail?.title) ? (
      <div className={styles.brandRow}>
        <div className={styles.brandRight}>
          <strong>{product.shop_title || product.shop_detail?.title}</strong>
          {product.shop_logo || product.shop_detail?.logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              className={styles.brandLogo}
              src={product.shop_logo || product.shop_detail?.logo}
              alt=""
            />
          ) : null}
        </div>
      </div>
    ) : null

  const detailBlocks = {
    badges: !isStack ? badges : null,
    title: titleBlock,
    rating: ratingBlock,
    lid: lidBlock,
    price: priceBlock,
    stock: stockBlock,
    actions: actionsBlock,
    category: categoryBlock,
    shop: shopBlock,
    description: descriptionBlock,
    specs: specsBlock,
  }

  const detailOrder = normalizeProductSingleDetailBlocksOrder(
    s.detail_blocks_order
  )

  const details = (
    <div className={styles.content} style={{ gap: 'var(--pdp-gap)' }}>
      {detailOrder.map((blockId) => {
        const node = detailBlocks[blockId]
        if (!node) return null
        return (
          <div key={blockId} className={styles.detailBlock} data-pdp-block={blockId}>
            {node}
          </div>
        )
      })}
    </div>
  )

  return (
    <article
      className={styles.wrap}
      style={vars}
      data-pdp-layout={layout}
    >
      {s.show_back_link ? (
        <Link href="/shop" className={styles.back}>
          <ArrowRight size={14} />
          بازگشت به فروشگاه
        </Link>
      ) : null}
      {s.show_breadcrumb ? (
        <nav className={styles.breadcrumb} aria-label="مسیر">
          <Link href="/">خانه</Link>
          <span>/</span>
          <Link href="/shop">فروشگاه</Link>
          <span>/</span>
          <span>{product.title}</span>
        </nav>
      ) : null}

      {isCover && s.show_gallery ? (
        <div
          className={`${styles.cover} ${styles[`hover_${s.image_hover}`] || ''}`}
        >
          {images[0] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={images[activeImg] || images[0]} alt="" />
          ) : null}
          {s.show_title ? (
            <h1 className={styles.coverTitle}>{product.title}</h1>
          ) : null}
          {s.show_thumbs && images.length > 1 ? (
            <div
              className={`${styles.thumbs} ${styles.thumbsInsideCover} ${
                thumbsDir(s.thumbs_position) === 'v'
                  ? styles.thumbsV
                  : styles.thumbsH
              }`}
              role="list"
            >
              {images.map((url, i) => (
                <button
                  key={`cover-${url}-${i}`}
                  type="button"
                  className={`${styles.thumb} ${
                    i === activeImg ? styles.thumbOn : ''
                  }`}
                  onClick={() => setActiveImg(i)}
                  aria-label={`تصویر ${i + 1}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt="" />
                </button>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}

      {isStack ? (
        <div className={`${styles.layout} ${layoutClass}`}>
          {s.show_title ? (
            <h1 className={styles.magazineTitle}>{product.title}</h1>
          ) : null}
          {badges}
          {s.show_gallery ? (
            <GalleryBlock
              images={images}
              title={product.title}
              active={activeImg}
              onPick={setActiveImg}
              showThumbs={s.show_thumbs}
              placement={s.thumbs_placement}
              position={s.thumbs_position}
              hover={s.image_hover}
            />
          ) : null}
          {details}
        </div>
      ) : (
        <div className={`${styles.layout} ${layoutClass}`}>
          {isReverse ? (
            <>
              {details}
              {!isCover && s.show_gallery ? (
                <GalleryBlock
                  images={images}
                  title={product.title}
                  active={activeImg}
                  onPick={setActiveImg}
                  showThumbs={s.show_thumbs}
                  placement={s.thumbs_placement}
                  position={s.thumbs_position}
                  hover={s.image_hover}
                />
              ) : null}
            </>
          ) : (
            <>
              {!isCover && s.show_gallery ? (
                <GalleryBlock
                  images={images}
                  title={product.title}
                  active={activeImg}
                  onPick={setActiveImg}
                  showThumbs={s.show_thumbs}
                  placement={s.thumbs_placement}
                  position={s.thumbs_position}
                  hover={s.image_hover}
                />
              ) : null}
              {details}
            </>
          )}
        </div>
      )}

      {toast ? (
        <div className={styles.toast} role="status" aria-live="polite">
          <CheckCircle2 size={18} className={styles.toastIcon} />
          <span>{toast}</span>
        </div>
      ) : null}
    </article>
  )
}

export default function ProductDetail({ productId }) {
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState(null)
  const [pageSettings, setPageSettings] = useState(
    DEFAULT_PRODUCT_SINGLE_PAGE_SETTINGS
  )
  const [singleLayout, setSingleLayout] = useState(
    normalizeProductSingleLayout(DEFAULT_PRODUCT_SINGLE_LAYOUT)
  )

  useEffect(() => {
    let cancelled = false
    const applySettings = async () => {
      clearSiteSettingsCache()
      clearSiteModulesCache()
      const [settingsMod, mods] = await Promise.all([
        fetchSiteSettings({ force: true }),
        fetchSiteModules({ force: true }).catch(() => ({ map: {} })),
      ])
      const mode = resolveActiveShopLayoutMode(mods?.map || {})
      const layout = resolveProductSingleLayoutForMode(settingsMod, mode)
      if (cancelled) return
      setSingleLayout(layout)
      const fromWidget = findProductArticleWidgetSettings(layout)
      setPageSettings(
        fromWidget ||
          normalizeProductSinglePageSettings(
            settingsMod?.product_single_page ||
              DEFAULT_PRODUCT_SINGLE_PAGE_SETTINGS,
          ),
      )
    }
    applySettings().catch(() => {})
    const onLayout = () => {
      applySettings().catch(() => {})
    }
    const onPage = (e) => {
      if (e?.detail) {
        setPageSettings(normalizeProductSinglePageSettings(e.detail))
      }
    }
    window.addEventListener('product-single-layout-changed', onLayout)
    window.addEventListener('product-single-layouts-changed', onLayout)
    window.addEventListener('product-single-page-changed', onPage)
    window.addEventListener('site-modules-changed', onLayout)
    return () => {
      cancelled = true
      window.removeEventListener('product-single-layout-changed', onLayout)
      window.removeEventListener('product-single-layouts-changed', onLayout)
      window.removeEventListener('product-single-page-changed', onPage)
      window.removeEventListener('site-modules-changed', onLayout)
    }
  }, [])

  const loadProduct = useCallback(async () => {
    const token =
      typeof window !== 'undefined'
        ? window.localStorage.getItem('accessToken')
        : null
    const headers = token ? { Authorization: `Bearer ${token}` } : undefined
    return shopApi.getProduct(productId, { headers })
  }, [productId])

  const refreshStock = useCallback(async () => {
    try {
      const data = await loadProduct()
      setProduct((prev) => {
        if (!prev) return data
        // فقط موجودی/قیمت پلکانی را زنده نگه می‌داریم تا رفرش سنگین نشود
        return {
          ...prev,
          ...data,
          stock: data.stock ?? prev.stock,
          stock_remaining: data.stock_remaining ?? prev.stock_remaining,
          price_tiers: data.price_tiers ?? prev.price_tiers,
          number_min: data.number_min ?? prev.number_min,
          number_max: data.number_max ?? prev.number_max,
        }
      })
      return data
    } catch {
      return null
    }
  }, [loadProduct])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setErr(null)
      try {
        const data = await loadProduct()
        if (!cancelled) setProduct(data)
      } catch (e) {
        if (!cancelled) setErr(e.message || 'محصول یافت نشد')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [loadProduct])

  // بروزرسانی لحظه‌ای موجودی آزاد (رزرو دیگران / سفارش موازی)
  useEffect(() => {
    if (!productId) return undefined
    const tick = () => {
      if (typeof document !== 'undefined' && document.hidden) return
      refreshStock()
    }
    const t = window.setInterval(tick, 3000)
    const onFocus = () => refreshStock()
    window.addEventListener('focus', onFocus)
    document.addEventListener('visibilitychange', onFocus)
    return () => {
      window.clearInterval(t)
      window.removeEventListener('focus', onFocus)
      document.removeEventListener('visibilitychange', onFocus)
    }
  }, [productId, refreshStock])

  const articleNode = useMemo(() => {
    if (!product) return null
    return (
      <ProductArticleInner
        product={product}
        pageSettings={pageSettings}
        onOptimisticStock={(deltaHold) => {
          setProduct((prev) =>
            prev ? patchStockAfterHold(prev, deltaHold) : prev
          )
        }}
        onCartChanged={async () => {
          await refreshStock()
        }}
      />
    )
  }, [product, pageSettings, refreshStock])

  if (loading) {
    return <div className={styles.state}>در حال بارگذاری محصول…</div>
  }
  if (err || !product) {
    return (
      <div className={styles.state}>
        <p>{err || 'محصول یافت نشد'}</p>
        <Link href="/shop">بازگشت به فروشگاه</Link>
      </div>
    )
  }

  return (
    <PageBuilderRenderer
      layout={singleLayout}
      articleSlot={articleNode}
      productContext={product}
    />
  )
}
