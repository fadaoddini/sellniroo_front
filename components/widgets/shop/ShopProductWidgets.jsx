'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowDownWideNarrow,
  ArrowLeft,
  ArrowRight,
  ArrowUpDown,
  BadgePercent,
  Check,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Heart,
  LayoutGrid,
  Search,
  ShoppingBag,
  SlidersHorizontal,
  Sparkles,
  Square,
  Star,
  TrendingUp,
  X,
} from 'lucide-react'
import ModuleGate from '@/components/modules/ModuleGate'
import { SITE_MODULE_KEYS } from '@/config/siteModules'
import {
  getShopWidgetVariant,
  normalizeShopSearchSettings,
  normalizeShopWidgetSettings,
  shopSearchCssVars,
  shopWidgetCssVars,
} from '@/config/shopWidgetSettings'
import { useCartOptional } from '@/contexts/CartContext'
import shopApi from '@/services/shopApi'
import {
  SHOP_WISHLIST_EVENT,
  isProductWishlisted,
  toggleProductWishlist,
} from '@/utils/shopWishlist'
import styles from './ShopWidgetShell.module.css'

function useIsMobile(breakpoint = 768) {
  const [mobile, setMobile] = useState(false)
  useEffect(() => {
    if (typeof window === 'undefined') return undefined
    const mq = window.matchMedia(`(max-width: ${breakpoint - 1}px)`)
    const apply = () => setMobile(!!mq.matches)
    apply()
    mq.addEventListener?.('change', apply)
    return () => mq.removeEventListener?.('change', apply)
  }, [breakpoint])
  return mobile
}

function shellClass(settings) {
  return [
    styles.shell,
    settings.show_on_mobile === false ? styles.hideOnMobile : '',
    settings.show_on_desktop === false ? styles.hideOnDesktop : '',
  ]
    .filter(Boolean)
    .join(' ')
}

function formatPrice(n) {
  const v = Number(n) || 0
  return v.toLocaleString('fa-IR')
}

function WidgetHead({
  title,
  show,
  moreHref,
  moreLabel,
  showMore,
  settings,
  navControls = null,
}) {
  if (!show || !title) return null
  const align = settings?.head_title_align || 'between'
  const alignClass =
    align === 'start'
      ? styles.headAlignStart
      : align === 'center'
        ? styles.headAlignCenter
        : align === 'end'
          ? styles.headAlignEnd
          : styles.headAlignBetween
  return (
    <div className={`${styles.head} ${alignClass}`}>
      <h3 className={styles.title}>{title}</h3>
      <div className={styles.headActions}>
        {navControls}
        {showMore && moreHref ? (
          <Link href={moreHref} className={styles.more}>
            {moreLabel || 'همه'}
          </Link>
        ) : null}
      </div>
    </div>
  )
}

function RecyclerArrowIcon({ dir, icon }) {
  const size = 18
  if (icon === 'arrow') {
    return dir === 'prev' ? <ArrowRight size={size} /> : <ArrowLeft size={size} />
  }
  if (icon === 'chevrons') {
    return dir === 'prev' ? (
      <ChevronsRight size={size} />
    ) : (
      <ChevronsLeft size={size} />
    )
  }
  return dir === 'prev' ? (
    <ChevronRight size={size} />
  ) : (
    <ChevronLeft size={size} />
  )
}

function recyclerArrowClasses(settings, place) {
  const styleId = settings.recycler_arrow_style || 'circle'
  const styleClass =
    styleId === 'square'
      ? styles.recyclerArrowSquare
      : styleId === 'pill'
        ? styles.recyclerArrowPill
        : styleId === 'ghost'
          ? styles.recyclerArrowGhost
          : styles.recyclerArrowCircle
  const placeClass =
    place === 'head'
      ? styles.recyclerArrowHead
      : place === 'outside'
        ? styles.recyclerArrowOutside
        : styles.recyclerArrowOverlay
  return `${styles.recyclerArrow} ${styleClass} ${placeClass}`
}

function RecyclerNavButtons({ settings, onPrev, onNext, place = 'outside' }) {
  if (settings.recycler_show_arrows === false) return null
  const base = recyclerArrowClasses(settings, place)
  const icon = settings.recycler_arrow_icon || 'chevron'
  const buttons = (
    <>
      <button
        type="button"
        className={`${base} ${styles.recyclerArrowPrev}`}
        aria-label="قبلی"
        onClick={onPrev}
      >
        <RecyclerArrowIcon dir="prev" icon={icon} />
      </button>
      <button
        type="button"
        className={`${base} ${styles.recyclerArrowNext}`}
        aria-label="بعدی"
        onClick={onNext}
      >
        <RecyclerArrowIcon dir="next" icon={icon} />
      </button>
    </>
  )
  if (place === 'head') {
    return <div className={styles.recyclerHeadNav}>{buttons}</div>
  }
  return buttons
}

function RecyclerStrip({ products, settings, scrollApiRef }) {
  const ref = useRef(null)
  const showSb = !!settings.recycler_show_scrollbar
  const showArrows = settings.recycler_show_arrows !== false
  let place = settings.recycler_arrow_place || 'outside'
  if (place === 'sides') place = 'overlay'
  const icon = settings.recycler_arrow_icon || 'chevron'
  const outsideBase = recyclerArrowClasses(settings, 'outside')

  const scrollByDir = (sign) => {
    const el = ref.current
    if (!el) return
    const step =
      (Number(settings.recycler_card_width) || 168) +
      (Number(settings.gap) || 20)
    const rtl = getComputedStyle(el).direction === 'rtl'
    const delta = (rtl ? -sign : sign) * step
    el.scrollBy({ left: delta, behavior: 'smooth' })
  }

  useEffect(() => {
    if (!scrollApiRef) return undefined
    scrollApiRef.current = {
      prev: () => scrollByDir(-1),
      next: () => scrollByDir(1),
    }
    return () => {
      scrollApiRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.recycler_card_width, settings.gap])

  const overflowHalf = settings.image_overflow === 'half_top'
  const track = (
    <div
      ref={ref}
      className={`${styles.recycler} ${
        showSb ? styles.recyclerScrollVisible : styles.recyclerNoScroll
      } ${overflowHalf ? styles.recyclerOverflowPad : ''}`}
    >
      {products.map((p) => (
        <div
          key={p.id}
          className={`${styles.recyclerItem} ${
            overflowHalf ? styles.recyclerItemOverflow : ''
          }`}
        >
          <ProductCard product={p} settings={settings} />
        </div>
      ))}
    </div>
  )

  if (showArrows && place === 'outside') {
    const matchH = !!settings.recycler_arrow_match_height
    return (
      <div
        className={`${styles.recyclerWrap} ${styles.recyclerWrapOutside} ${
          matchH ? styles.recyclerWrapMatchHeight : ''
        } ${overflowHalf ? styles.recyclerWrapOverflow : ''}`}
      >
        <button
          type="button"
          className={`${outsideBase} ${styles.recyclerArrowPrev}`}
          aria-label="قبلی"
          onClick={() => scrollByDir(-1)}
        >
          <RecyclerArrowIcon dir="prev" icon={icon} />
        </button>
        <div
          className={`${styles.recyclerTrack} ${
            overflowHalf ? styles.recyclerTrackOverflow : ''
          }`}
        >
          {track}
        </div>
        <button
          type="button"
          className={`${outsideBase} ${styles.recyclerArrowNext}`}
          aria-label="بعدی"
          onClick={() => scrollByDir(1)}
        >
          <RecyclerArrowIcon dir="next" icon={icon} />
        </button>
      </div>
    )
  }

  return (
    <div
      className={`${styles.recyclerWrap} ${
        overflowHalf ? styles.recyclerWrapOverflow : ''
      }`}
    >
      {showArrows && place === 'overlay' ? (
        <RecyclerNavButtons
          settings={settings}
          place="overlay"
          onPrev={() => scrollByDir(-1)}
          onNext={() => scrollByDir(1)}
        />
      ) : null}
      {track}
    </div>
  )
}

function useCartActions(product) {
  const cartCtx = useCartOptional()
  const qty = cartCtx ? cartCtx.getQty(product.id) : 0
  const busy = cartCtx ? cartCtx.busyProductId === product.id : false
  const unit = Number(product.final_price ?? product.price_one) || 0
  const lineTotal = qty * unit

  const bump = async (d, e) => {
    e?.preventDefault?.()
    e?.stopPropagation?.()
    if (!cartCtx) return
    try {
      await cartCtx.delta(product, d)
    } catch (err) {
      if (err?.code === 'other_shop' || err?.data?.code === 'other_shop') {
        const title = err.data?.current_shop_title || 'فروشگاه دیگر'
        if (
          typeof window !== 'undefined' &&
          window.confirm(
            `سبد فعلی متعلق به «${title}» است. جایگزین شود؟`,
          )
        ) {
          await cartCtx.delta(product, d, { replaceShop: true })
        }
      }
    }
  }

  return { qty, busy, unit, lineTotal, bump, ready: !!cartCtx }
}

function CartControls({ product, compact = false, ctaStyle = 'outline' }) {
  const { qty, busy, lineTotal, bump, ready } = useCartActions(product)
  const btnClass = [
    styles.btnBuy,
    ctaStyle === 'solid' ? styles.btnBuySolid : '',
    ctaStyle === 'icon' ? styles.btnBuyIcon : '',
    ctaStyle === 'text' ? styles.btnBuyText : '',
  ]
    .filter(Boolean)
    .join(' ')
  const showTotalRow = !compact && ctaStyle !== 'icon'
  const totalRow = showTotalRow ? (
    <div className={styles.lineTotalRow} aria-live="polite">
      {qty > 0 && lineTotal > 0 ? (
        <>
          <span className={styles.lineTotalLabel}>جمع</span>
          <strong className={styles.lineTotal}>
            {formatPrice(lineTotal)}
            <em>تومان</em>
          </strong>
        </>
      ) : (
        <span className={styles.lineTotalPlaceholder}> </span>
      )}
    </div>
  ) : null

  if (!ready) {
    return (
      <div className={styles.cartBlock}>
        <span className={btnClass}>
          {ctaStyle === 'icon' ? <ShoppingBag size={16} /> : 'خرید'}
        </span>
        {totalRow}
      </div>
    )
  }

  if (qty <= 0) {
    return (
      <div className={styles.cartBlock}>
        <button
          type="button"
          className={btnClass}
          disabled={busy}
          aria-label="افزودن به سبد"
          onClick={(e) => bump(1, e)}
        >
          {ctaStyle === 'icon' ? <ShoppingBag size={16} /> : 'خرید'}
        </button>
        {totalRow}
      </div>
    )
  }

  return (
    <div
      className={styles.cartBlock}
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
      }}
    >
      <div className={styles.qtyRow}>
        <button
          type="button"
          className={styles.qtyBtn}
          disabled={busy}
          aria-label="کاهش"
          onClick={(e) => bump(-1, e)}
        >
          −
        </button>
        <span className={styles.qtyVal}>{qty.toLocaleString('fa-IR')}</span>
        <button
          type="button"
          className={styles.qtyBtn}
          disabled={busy}
          aria-label="افزایش"
          onClick={(e) => bump(1, e)}
        >
          +
        </button>
      </div>
      {totalRow}
    </div>
  )
}

function LikeButton({ productId }) {
  const [liked, setLiked] = useState(false)
  useEffect(() => {
    setLiked(isProductWishlisted(productId))
    const sync = () => setLiked(isProductWishlisted(productId))
    window.addEventListener(SHOP_WISHLIST_EVENT, sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener(SHOP_WISHLIST_EVENT, sync)
      window.removeEventListener('storage', sync)
    }
  }, [productId])

  const toggle = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setLiked(toggleProductWishlist(productId))
  }

  return (
    <button
      type="button"
      className={`${styles.likeBtn} ${liked ? styles.likeBtnOn : ''}`}
      aria-label={liked ? 'حذف از علاقه‌مندی' : 'افزودن به علاقه‌مندی'}
      aria-pressed={liked}
      onClick={toggle}
    >
      <Heart size={15} fill={liked ? 'currentColor' : 'none'} />
    </button>
  )
}

function RatingDisplay({ value, styleId = 'icon_number', className = '' }) {
  const n = Number(value)
  if (!Number.isFinite(n) || n <= 0) return null
  const clamped = Math.max(0, Math.min(5, n))
  const label = clamped.toLocaleString('fa-IR', {
    maximumFractionDigits: 1,
  })
  const full = Math.floor(clamped)
  const half = clamped - full >= 0.4
  const stars = Array.from({ length: 5 }, (_, i) => {
    const filled = i < full || (i === full && half)
    return (
      <Star
        key={i}
        size={11}
        className={filled ? styles.rateStarOn : styles.rateStarOff}
        fill={i < full ? 'currentColor' : 'none'}
      />
    )
  })

  if (styleId === 'number') {
    return <span className={`${styles.rate} ${className}`.trim()}>{label}</span>
  }
  if (styleId === 'text') {
    return (
      <span className={`${styles.rate} ${className}`.trim()}>
        {label} از ۵
      </span>
    )
  }
  if (styleId === 'stars') {
    return (
      <span className={`${styles.rate} ${styles.rateStars} ${className}`.trim()}>
        {stars}
      </span>
    )
  }
  if (styleId === 'stars_number') {
    return (
      <span className={`${styles.rate} ${styles.rateStars} ${className}`.trim()}>
        {stars}
        <em className={styles.rateNum}>{label}</em>
      </span>
    )
  }
  if (styleId === 'badge') {
    return (
      <span className={`${styles.rate} ${styles.rateBadge} ${className}`.trim()}>
        <Star size={11} fill="currentColor" />
        {label}
      </span>
    )
  }
  return (
    <span className={`${styles.rate} ${className}`.trim()}>
      <Star size={11} fill="currentColor" />
      {label}
    </span>
  )
}

/** کارت محصول — استایل/هاور/تصویر/زون‌ها از تنظیمات ویجت */
function ProductCard({ product, settings, className = '' }) {
  const href = shopApi.productHref(product)
  const img = shopApi.resolveImage(product)
  const cardStyle =
    settings.card_style === 'elevated'
      ? styles.cardElevated
      : settings.card_style === 'outline'
        ? styles.cardOutline
        : settings.card_style === 'minimal'
          ? styles.cardMinimal
          : ''
  const hover =
    settings.hover_effect === 'scale'
      ? styles.hoverScale
      : settings.hover_effect === 'lift'
        ? styles.hoverLift
        : settings.hover_effect === 'glow'
          ? styles.hoverGlow
          : settings.hover_effect === 'border'
            ? styles.hoverBorder
            : settings.hover_effect === 'none'
              ? styles.hoverNone
              : styles.hoverFill
  const place =
    settings.image_placement === 'start'
      ? styles.cardPlaceStart
      : settings.image_placement === 'end'
        ? styles.cardPlaceEnd
        : styles.cardPlaceTop
  const overflowHalf = settings.image_overflow === 'half_top'
  const finalPrice = product.final_price ?? product.price_one
  const hasDiscount = product.has_discount || (product.discount || 0) > 0
  const shape = settings.image_shape || 'circle'
  const imgClass = [
    shape === 'circle'
      ? styles.imgCircle
      : shape === 'square'
        ? styles.imgSquare
        : styles.imgRect,
    overflowHalf ? styles.imgOverflowHalfTop : '',
  ]
    .filter(Boolean)
    .join(' ')
  const noPrice = !finalPrice || Number(finalPrice) === 0
  const actionsZoneRaw = settings.actions_zone || 'bottom'
  const showImage = settings.show_image !== false
  const actionsZone =
    actionsZoneRaw === 'overlay' && !showImage ? 'bottom' : actionsZoneRaw
  const discountZone = settings.discount_zone || 'actions'
  const ratingStyle = settings.rating_style || 'icon_number'
  const ratingZoneRaw = settings.rating_zone || 'under_meta'
  const ratingZone =
    (ratingZoneRaw === 'image' && settings.show_image === false) ||
    (ratingZoneRaw === 'under_lid' && settings.show_lid === false)
      ? 'under_meta'
      : ratingZoneRaw
  const ratingAlign = settings.rating_align || 'center'
  const ratingCorner = settings.rating_corner || 'top_end'
  const ratingAlignClass =
    ratingAlign === 'start'
      ? styles.ratingAlignStart
      : ratingAlign === 'end'
        ? styles.ratingAlignEnd
        : styles.ratingAlignCenter
  const ratingCornerClass = {
    top_start: styles.ratingCornerTopStart,
    top_center: styles.ratingCornerTopCenter,
    top_end: styles.ratingCornerTopEnd,
    middle_start: styles.ratingCornerMiddleStart,
    middle_center: styles.ratingCornerMiddleCenter,
    middle_end: styles.ratingCornerMiddleEnd,
    bottom_start: styles.ratingCornerBottomStart,
    bottom_center: styles.ratingCornerBottomCenter,
    bottom_end: styles.ratingCornerBottomEnd,
  }[ratingCorner] || styles.ratingCornerTopEnd
  const ratingRaw =
    settings.show_rating !== false && product.rate ? (
      <RatingDisplay value={product.rate} styleId={ratingStyle} />
    ) : null
  const ratingInFlow = ratingRaw ? (
    <div className={`${styles.ratingSlot} ${ratingAlignClass}`}>{ratingRaw}</div>
  ) : null
  const ratingFloat =
    ratingRaw && (ratingZone === 'image' || ratingZone === 'card') ? (
      <span className={`${styles.ratingFloat} ${ratingCornerClass}`}>{ratingRaw}</span>
    ) : null
  const ctaStyle = settings.cta_style || 'outline'
  const actionsAlign = settings.actions_align || 'between'
  const alignClass =
    actionsAlign === 'stretch'
      ? styles.statusAlignStretch
      : actionsAlign === 'start'
        ? styles.statusAlignStart
        : actionsAlign === 'center'
          ? styles.statusAlignCenter
          : actionsAlign === 'end'
            ? styles.statusAlignEnd
            : styles.statusAlignBetween
  const showActions =
    settings.show_add_button !== false || settings.show_like === true
  const discountBadge =
    settings.show_discount !== false && hasDiscount ? (
      <span className={styles.discount}>%{product.discount}</span>
    ) : null
  const showDiscountInBar =
    discountZone === 'actions' && !!discountBadge && actionsAlign !== 'stretch'
  const actions = showActions ? (
    <div
      className={`${styles.statusBar} ${alignClass} ${
        actionsZone === 'overlay' ? styles.statusBarOverlay : ''
      }`}
    >
      <div className={styles.actionsGroup}>
        {settings.show_like ? <LikeButton productId={product.id} /> : null}
        {settings.show_add_button !== false ? (
          <CartControls
            product={product}
            compact={ctaStyle === 'icon'}
            ctaStyle={ctaStyle}
          />
        ) : null}
      </div>
      {actionsAlign === 'stretch' && discountZone === 'actions'
        ? discountBadge
        : null}
      {showDiscountInBar ? discountBadge : actionsAlign === 'between' ? <span /> : null}
    </div>
  ) : discountZone === 'actions' && discountBadge ? (
    <div className={`${styles.statusBar} ${alignClass}`}>
      {actionsAlign === 'between' ? <span /> : null}
      {discountBadge}
    </div>
  ) : null

  const imageBlock = showImage ? (
    <div className={`${styles.imgWrap} ${imgClass}`}>
      <Link
        href={href}
        className={styles.imgLink}
        style={{ textDecoration: 'none', color: 'inherit' }}
      >
        {img ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={img} alt={product.title || ''} />
        ) : (
          <span className={styles.imgPlaceholder}>
            <ShoppingBag size={shape === 'circle' ? 28 : 24} />
          </span>
        )}
      </Link>
      {discountZone === 'badge' && discountBadge ? (
        <span className={styles.discountBadge}>{discountBadge}</span>
      ) : null}
      {ratingZone === 'image' ? ratingFloat : null}
      {actionsZone === 'overlay' ? actions : null}
    </div>
  ) : null

  return (
    <div
      className={`${styles.card} ${cardStyle} ${hover} ${place} ${
        overflowHalf ? styles.cardOverflowHalf : ''
      } ${className}`.trim()}
      data-img-shape={shape}
      data-hover={settings.hover_effect || 'fill'}
    >
      {ratingZone === 'card' ? ratingFloat : null}
      {imageBlock}

      <div className={styles.cardBody}>
        <Link href={href} style={{ textDecoration: 'none', color: 'inherit' }}>
          {settings.show_product_title !== false ? (
            <h4 className={styles.cardTitle}>{product.title}</h4>
          ) : null}
          {ratingZone === 'under_title' ? ratingInFlow : null}
          {settings.show_lid !== false ? (
            product.lid ? (
              <p className={styles.lid}>{product.lid}</p>
            ) : (
              <p className={styles.lid}>مواد تشکیل دهنده</p>
            )
          ) : null}
          {ratingZone === 'under_lid' ? ratingInFlow : null}
        </Link>
        {settings.show_shop !== false && product.shop_title ? (
          <span className={styles.shopName}>{product.shop_title}</span>
        ) : null}
        {ratingZone === 'under_meta' ? ratingInFlow : null}

        {settings.show_price !== false ? (
          <div className={styles.bodyPrice}>
            {noPrice ? (
              <span className={styles.priceNew}>استعلام قیمت</span>
            ) : (
              <div className={styles.priceStack}>
                <span className={styles.priceRow}>
                  <span className={styles.priceNew}>
                    {formatPrice(finalPrice)}
                    <em className={styles.priceUnit}>تومان</em>
                  </span>
                  {discountZone === 'near_price' && discountBadge ? (
                    <span className={styles.discountInline}>
                      {Number(product.discount).toLocaleString('fa-IR')}٪
                    </span>
                  ) : null}
                  {ratingZone === 'near_price' ? ratingRaw : null}
                </span>
                {settings.show_discount !== false &&
                hasDiscount &&
                product.price_one ? (
                  <span className={styles.priceOld}>
                    {formatPrice(product.price_one)} تومان
                  </span>
                ) : null}
              </div>
            )}
          </div>
        ) : null}

        {ratingZone === 'above_actions' ? ratingInFlow : null}
        {actionsZone === 'under_price' || actionsZone === 'bottom'
          ? actions
          : null}
      </div>
    </div>
  )
}

function ProductListItem({ product, settings }) {
  const href = shopApi.productHref(product)
  const img = shopApi.resolveImage(product)
  const finalPrice = product.final_price ?? product.price_one
  const hasDiscount = product.has_discount || (product.discount || 0) > 0

  return (
    <div className={styles.listItem}>
      <Link href={href} style={{ display: 'contents', textDecoration: 'none', color: 'inherit' }}>
        {settings.show_image !== false ? (
          img ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img className={styles.listThumb} src={img} alt="" />
          ) : (
            <span className={styles.listThumb} />
          )
        ) : null}
        <div className={styles.listBody}>
          <h4 className={styles.listTitle}>{product.title}</h4>
          {settings.show_price !== false ? (
            <div className={styles.listMeta}>
              {hasDiscount && product.price_one ? (
                <span className={styles.priceOld} style={{ display: 'inline' }}>
                  {formatPrice(product.price_one)}{' '}
                </span>
              ) : null}
              {formatPrice(finalPrice)} تومان
            </div>
          ) : null}
        </div>
      </Link>
      <div className={styles.listActions}>
        {settings.show_add_button !== false ? (
          <CartControls product={product} compact />
        ) : null}
        {settings.show_discount !== false && hasDiscount ? (
          <span className={styles.discount}>%{product.discount}</span>
        ) : null}
      </div>
    </div>
  )
}

function ProductStory({ product }) {
  const href = shopApi.productHref(product)
  const img = shopApi.resolveImage(product)
  const label = String(product.title || '').slice(0, 11)
  return (
    <Link href={href} className={styles.story}>
      <div className={styles.storyRing}>
        {img ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={img} alt="" />
        ) : (
          <span className={styles.storyPlaceholder} />
        )}
      </div>
      <div className={styles.storyLabel}>{label}</div>
    </Link>
  )
}

function ProductsDisplay({ products, settings, mode, scrollApiRef }) {
  if (!products?.length) {
    return <div className={styles.empty}>محصولی برای نمایش نیست</div>
  }

  if (mode === 'list') {
    return (
      <div className={styles.list}>
        {products.map((p) => (
          <ProductListItem key={p.id} product={p} settings={settings} />
        ))}
      </div>
    )
  }

  if (mode === 'recycler') {
    return (
      <RecyclerStrip
        products={products}
        settings={settings}
        scrollApiRef={scrollApiRef}
      />
    )
  }

  if (mode === 'stories') {
    return (
      <div className={styles.stories}>
        {products.map((p) => (
          <ProductStory key={p.id} product={p} />
        ))}
      </div>
    )
  }

  const gridMods = [
    styles.grid,
    mode === 'grid-4' ? styles.grid4 : '',
    mode === 'grid-3' ? styles.grid3 : '',
    mode === 'grid-2' || mode === 'card' ? styles.grid2 : '',
    mode === 'grid-4' || mode === 'grid-3' || mode === 'grid-2'
      ? styles.gridKeep
      : '',
  ]
    .filter(Boolean)
    .join(' ')

  /* card / default = ۵ ستونه مثل DetailsShop */
  const useFiveCol = mode === 'card' || !mode || mode === 'grid-5'

  return (
    <div
      className={
        useFiveCol
          ? `${styles.grid} ${mode === 'card' ? '' : styles.gridKeep}`.trim()
          : gridMods
      }
      data-card-layout={
        settings.image_placement === 'start' || settings.image_placement === 'end'
          ? 'horizontal'
          : 'vertical'
      }
    >
      {products.map((p) => (
        <div key={p.id} className={styles.gridItem}>
          <ProductCard product={p} settings={settings} />
        </div>
      ))}
    </div>
  )
}

/** سبد / ویترین محصولات با ظاهر mrsaeed */
export function ShopProductsStripWidget({
  type = 'featured_products',
  settings: raw,
  product = null,
}) {
  const settings = normalizeShopWidgetSettings(raw, type)
  const variant = getShopWidgetVariant(type)
  const vars = {
    ...shopWidgetCssVars(settings),
    '--shop-accent': settings.accent_color || '#ff00a6',
    '--shop-success-light': settings.accent_color || '#ff00a6',
  }
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  const title = settings.title_text || settings._default_title || variant.title
  const mode = settings.display_mode || variant.defaultMode || 'card'
  const scrollApiRef = useRef(null)
  const isRecycler = mode === 'recycler'
  const arrowsInHead =
    isRecycler &&
    settings.recycler_show_arrows !== false &&
    settings.recycler_arrow_place === 'head'
  const isSimilar = type === 'product_similar'

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      try {
        if (isSimilar) {
          if (!product?.id) {
            if (!cancelled) {
              setItems([])
              setLoading(false)
            }
            return
          }
          const limit = settings.limit || 6
          const fetchLimit = Math.min(40, Math.max(limit + 4, limit))
          const categoryId =
            product?.category_id ||
            product?.category?.id ||
            product?.category ||
            null
          const shopId =
            product?.shop_id || product?.shop?.id || product?.shop || null
          const params = { limit: fetchLimit, source: 'latest' }
          if (shopId && typeof shopId !== 'object') params.shop = shopId
          if (categoryId && typeof categoryId !== 'object') {
            params.category = categoryId
          } else if (product?.category_title) {
            params.category = product.category_title
          }
          const data = await shopApi.listProducts(params, {
            demoFallback: settings.use_demo_data === true,
          })
          let list = (data?.results || [])
            .filter((p) => String(p.id) !== String(product.id))
            .slice(0, limit)
          if (list.length === 0 && params.shop) {
            const fallback = await shopApi.listProducts(
              {
                limit: fetchLimit,
                source: 'latest',
                shop: params.shop,
              },
              { demoFallback: settings.use_demo_data === true }
            )
            list = (fallback?.results || [])
              .filter((p) => String(p.id) !== String(product.id))
              .slice(0, limit)
          }
          if (!cancelled) setItems(list)
          return
        }

        const params = {
          source: variant.source || 'latest',
          limit: settings.limit || 8,
        }
        if (type === 'products_by_category' && settings.category_id) {
          params.category = settings.category_id
          params.source = 'all'
        }
        const data = await shopApi.listProducts(params, {
          // در ویترین واقعی، دموی چندفروشگاهی قاطی نشود
          demoFallback: settings.use_demo_data === true,
        })
        if (!cancelled) setItems(data.results || [])
      } catch {
        if (!cancelled) setItems([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [
    type,
    isSimilar,
    product?.id,
    product?.category_id,
    product?.category,
    product?.category_title,
    product?.shop_id,
    product?.shop,
    variant.source,
    settings.limit,
    settings.category_id,
    settings.use_demo_data,
  ])

  const gate =
    variant.gate === 'shop'
      ? SITE_MODULE_KEYS.SHOP
      : SITE_MODULE_KEYS.SHOP_LISTINGS

  const surfaceMode = settings.surface_mode || 'transparent'
  const surfaceSpan = settings.surface_span || 'full'
  const surfaceOn =
    surfaceMode === 'color' && !!(settings.surface_bg || '').trim()
  const surfaceClass = surfaceOn
    ? surfaceSpan === 'container'
      ? styles.shellSurfaceContained
      : styles.shellSurfaceFull
    : ''

  return (
    <ModuleGate moduleKey={gate}>
      <div
        className={`${shellClass(settings)} ${surfaceClass}`.trim()}
        style={vars}
        data-shop-widget={type}
        data-section-full={settings.section_full ? '1' : '0'}
        data-surface-mode={surfaceMode}
        data-surface-span={surfaceSpan}
      >
        <div className={styles.inner}>
          <WidgetHead
            title={title}
            show={settings.show_title !== false}
            moreHref={settings.more_href}
            moreLabel={settings.more_label}
            showMore={settings.show_more_link !== false}
            settings={settings}
            navControls={
              arrowsInHead ? (
                <RecyclerNavButtons
                  settings={settings}
                  place="head"
                  onPrev={() => scrollApiRef.current?.prev?.()}
                  onNext={() => scrollApiRef.current?.next?.()}
                />
              ) : null
            }
          />
          {loading ? (
            <div className={styles.empty}>در حال بارگذاری…</div>
          ) : isSimilar && !product?.id ? (
            <div className={styles.empty}>
              در صفحه محصول، ریسایکلر محصولات مشابه اینجا نمایش داده می‌شود.
            </div>
          ) : (
            <ProductsDisplay
              products={items}
              settings={settings}
              mode={mode}
              scrollApiRef={scrollApiRef}
            />
          )}
        </div>
      </div>
    </ModuleGate>
  )
}

export function ProductStoriesWidget({ settings: raw }) {
  return <ShopProductsStripWidget type="product_stories" settings={raw} />
}

export function ShopSearchBarWidget({ settings: raw }) {
  const isMobile = useIsMobile(768)
  const viewport = isMobile ? 'mobile' : 'desktop'
  const settings = normalizeShopSearchSettings(raw, { viewport })
  const vars = shopSearchCssVars(raw, { viewport })
  const router = useRouter()
  const [q, setQ] = useState('')
  const hrefBase = settings.results_href || '/shop'
  const submitMode = settings.submit_mode || 'label'
  const showSubmit = submitMode !== 'hidden'
  const showSubmitLabel = submitMode === 'label' || submitMode === 'both'
  const showSubmitIcon = submitMode === 'icon' || submitMode === 'both'
  const fullBleed = !!settings.section_full

  return (
    <ModuleGate moduleKey={SITE_MODULE_KEYS.SHOP}>
      <div
        className={[
          shellClass(settings),
          styles.searchShell,
          fullBleed ? styles.searchFullBleed : styles.searchInset,
          fullBleed ? styles.searchFull : '',
          settings.sticky ? styles.searchSticky : '',
        ]
          .filter(Boolean)
          .join(' ')}
        style={{
          ...vars,
          '--shop-pad-l': '0px',
          '--shop-pad-r': '0px',
          '--shop-mar-l': '0px',
          '--shop-mar-r': '0px',
        }}
        data-shop-widget="search"
        data-search-style={settings.search_style || 'pill'}
      >
        <div className={`${styles.inner} ${styles.searchInner}`}>
          <form
            className={styles.searchBarV2}
            onSubmit={(e) => {
              e.preventDefault()
              const query = q.trim()
              router.push(
                query
                  ? `${hrefBase}${hrefBase.includes('?') ? '&' : '?'}q=${encodeURIComponent(query)}`
                  : hrefBase,
              )
            }}
          >
            {settings.show_icon !== false ? (
              <Search className={styles.searchLeadIcon} size={17} strokeWidth={1.85} aria-hidden />
            ) : null}
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={settings.placeholder || 'جستجوی محصول…'}
              aria-label={settings.placeholder || 'جستجوی محصول'}
              autoComplete="off"
            />
            {showSubmit ? (
              <button
                type="submit"
                className={
                  showSubmitLabel
                    ? styles.searchSubmitBtn
                    : `${styles.searchSubmitBtn} ${styles.searchSubmitIconOnly}`
                }
                aria-label={
                  showSubmitLabel
                    ? settings.submit_label || 'جستجو'
                    : 'جستجو'
                }
              >
                {showSubmitIcon ? <Search size={14} strokeWidth={2.4} /> : null}
                {showSubmitLabel ? settings.submit_label || 'جستجو' : null}
              </button>
            ) : null}
          </form>
          {settings.hint ? (
            <p className={styles.searchHint}>{settings.hint}</p>
          ) : null}
        </div>
      </div>
    </ModuleGate>
  )
}

export function ShopCategoriesWidget({ settings: raw }) {
  const settings = normalizeShopWidgetSettings(raw, 'shop_categories')
  const vars = shopWidgetCssVars(settings)
  const [cats, setCats] = useState([])

  useEffect(() => {
    let cancelled = false
    shopApi
      .listCategories({ demoFallback: settings.use_demo_data !== false })
      .then((list) => {
        if (!cancelled) setCats(list || [])
      })
      .catch(() => {
        if (!cancelled) setCats([])
      })
    return () => {
      cancelled = true
    }
  }, [settings.use_demo_data])

  const title =
    settings.title_text || settings._default_title || 'دسته‌های فروشگاه'

  return (
    <ModuleGate moduleKey={SITE_MODULE_KEYS.SHOP_LISTINGS}>
      <div
        className={shellClass(settings)}
        style={vars}
        data-shop-widget="categories"
      >
        <div className={styles.inner}>
          <WidgetHead
            title={title}
            show={settings.show_title !== false}
            moreHref={settings.more_href}
            moreLabel={settings.more_label}
            showMore={settings.show_more_link !== false}
          />
          <div className={styles.catGrid}>
            {cats.map((c) => (
              <Link
                key={c.id}
                href={`/shop?category=${c.id}`}
                className={styles.catCard}
              >
                {c.title}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </ModuleGate>
  )
}

const SHOP_SORT_OPTIONS = [
  {
    id: 'newest',
    label: 'جدیدترین',
    desc: 'تازه‌ترین محصولات اضافه‌شده',
    Icon: Sparkles,
  },
  {
    id: 'price_asc',
    label: 'ارزان‌ترین',
    desc: 'از کم‌قیمت به گران',
    Icon: ArrowDownWideNarrow,
  },
  {
    id: 'price_desc',
    label: 'گران‌ترین',
    desc: 'از گران به ارزان',
    Icon: ArrowUpDown,
  },
  {
    id: 'bestsellers',
    label: 'پرفروش‌ترین',
    desc: 'بر اساس تعداد فروش',
    Icon: TrendingUp,
  },
  {
    id: 'featured',
    label: 'ویژه‌ها',
    desc: 'محصولات منتخب و ویژه',
    Icon: BadgePercent,
  },
]

const SHOP_QUICK_FILTERS = [
  { id: 'all', label: 'همه محصولات' },
  { id: 'featured', label: 'ویژه' },
  { id: 'bestsellers', label: 'پرفروش' },
  { id: 'discounted', label: 'تخفیف‌دار' },
]

/** اندازه صفحه کاتالوگ — برای کاهش فشار سرور */
const SHOP_PAGE_SIZE = 12

function shopListApiParams({ q, category, sort, filter, page, pageSize }) {
  const params = {
    page: Math.max(1, Number(page) || 1),
    page_size: Math.min(48, Math.max(6, Number(pageSize) || SHOP_PAGE_SIZE)),
  }
  if (q) params.q = q
  if (category) params.category = category

  // فیلتر سریع سایدبار اولویت دارد مگر sort ویژه/پرفروش باشد و فیلتر «همه» باشد
  if (filter === 'featured' || sort === 'featured') {
    params.source = 'featured'
  } else if (filter === 'bestsellers' || sort === 'bestsellers') {
    params.source = 'bestsellers'
  } else if (filter === 'discounted') {
    params.source = 'discounted'
  } else {
    params.source = 'all'
    if (sort === 'price_asc') params.ordering = 'price_one'
    else if (sort === 'price_desc') params.ordering = '-price_one'
    else params.ordering = '-id'
  }
  return params
}

/** محتوای لیست فروشگاه — دوستونه: فیلتر + گرید قابل سورت */
export function ShopListingContent({
  initialQuery = '',
  category: categoryProp = '',
  sort: sortProp = 'newest',
  filter: filterProp = 'all',
  cols: colsProp = 4,
  settings: settingsProp = null,
}) {
  const router = useRouter()
  const [q, setQ] = useState(initialQuery)
  const [category, setCategory] = useState(String(categoryProp || ''))
  const [sort, setSort] = useState(
    SHOP_SORT_OPTIONS.some((o) => o.id === sortProp) ? sortProp : 'newest'
  )
  const [filter, setFilter] = useState(
    SHOP_QUICK_FILTERS.some((o) => o.id === filterProp) ? filterProp : 'all'
  )
  const [cols, setCols] = useState(Number(colsProp) === 3 ? 3 : 4)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [sortOpen, setSortOpen] = useState(false)
  const [categories, setCategories] = useState([])
  const [items, setItems] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [loadError, setLoadError] = useState('')
  const [usingDemo, setUsingDemo] = useState(false)

  const settings = useMemo(() => {
    // ۳ستونه = کارت افقی | ۴ستونه = کارت ستونی/عمودی
    const horizontal = cols === 3
    return normalizeShopWidgetSettings(
      {
        show_title: false,
        limit: 48,
        more_label: 'همه',
        accent_color: '#B38C00',
        more_link_color: '#B38C00',
        lid_color: '#dbbe00',
        discount_bg: '#B38C00',
        discount_text: '#ffffff',
        btn_bg: '#B38C00',
        btn_text: '#ffffff',
        btn_border: '#dbbe00',
        like_color: '#B38C00',
        hover_fill: '#FFF9E8',
        cta_style: 'solid',
        card_style: 'soft',
        image_shape: 'rounded',
        image_ratio: '1_1',
        image_radius: 12,
        show_lid: false,
        show_shop: false,
        actions_zone: 'bottom',
        actions_align: 'stretch',
        ...(settingsProp || {}),
        display_mode: horizontal ? 'grid-3' : 'grid-4',
        image_placement: horizontal ? 'start' : 'top',
        image_size: horizontal ? 88 : 112,
        image_overflow: 'none',
        show_rating: true,
        rating_style: 'stars_number',
        rating_zone: 'under_title',
        rating_align: horizontal ? 'start' : 'center',
        discount_zone: 'near_price',
        show_discount: true,
        card_radius: horizontal ? 16 : 14,
        card_radius_tl: horizontal ? 16 : 14,
        card_radius_tr: horizontal ? 16 : 14,
        card_radius_br: horizontal ? 16 : 14,
        card_radius_bl: horizontal ? 16 : 14,
        gap: horizontal ? 12 : 14,
        btn_height: 32,
        btn_radius: 999,
        btn_radius_tl: 999,
        btn_radius_tr: 999,
        btn_radius_br: 999,
        btn_radius_bl: 999,
      },
      'shop_page'
    )
  }, [settingsProp, cols])
  const accent = settings.accent_color || '#B38C00'
  const listMode = cols === 3 ? 'grid-3' : 'grid-4'
  const pageSize = SHOP_PAGE_SIZE
  const activeSort =
    SHOP_SORT_OPTIONS.find((o) => o.id === sort) || SHOP_SORT_OPTIONS[0]
  const hasMore = total > 0 ? items.length < total : false
  const loadMoreRef = useRef(null)
  const loadingMoreLock = useRef(false)

  useEffect(() => {
    setQ(initialQuery || '')
    setPage(1)
  }, [initialQuery])
  useEffect(() => {
    setCategory(String(categoryProp || ''))
    setPage(1)
  }, [categoryProp])

  useEffect(() => {
    if (!sortOpen || typeof document === 'undefined') return undefined
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [sortOpen])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const list = await shopApi.listCategories({ demoFallback: true })
        if (cancelled) return
        const rows = Array.isArray(list) ? list : []
        setCategories(
          rows.filter((c) => {
            const n = Number(
              c.active_products_count ?? c.products_count ?? 1
            )
            return !Number.isFinite(n) || n > 0
          })
        )
      } catch {
        if (!cancelled) setCategories([])
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    const isFirstPage = page <= 1
    ;(async () => {
      if (isFirstPage) {
        setLoading(true)
        setLoadError('')
      } else {
        setLoadingMore(true)
      }
      try {
        const data = await shopApi.listProducts(
          shopListApiParams({
            q,
            category,
            sort,
            filter,
            page,
            pageSize,
          }),
          { demoFallback: true }
        )
        if (cancelled) return
        const rows = data.results || []
        const count = Number(data.count)
        setTotal(Number.isFinite(count) ? count : rows.length)
        setItems((prev) => {
          if (isFirstPage) return rows
          const seen = new Set(prev.map((p) => p.id))
          const merged = [...prev]
          rows.forEach((p) => {
            if (p?.id == null || seen.has(p.id)) return
            seen.add(p.id)
            merged.push(p)
          })
          return merged
        })
        setUsingDemo(!!data.demo)
        if (data.demo && isFirstPage) {
          setLoadError('ارتباط با سرور برقرار نشد؛ نمونه نمایش داده شد.')
        } else if (isFirstPage) {
          setLoadError('')
        }
      } catch (e) {
        if (cancelled) return
        if (isFirstPage) {
          setItems([])
          setTotal(0)
        }
        setUsingDemo(false)
        setLoadError(e?.message || 'بارگذاری محصولات ناموفق بود')
      } finally {
        if (!cancelled) {
          setLoading(false)
          setLoadingMore(false)
          loadingMoreLock.current = false
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [q, category, sort, filter, page, pageSize])

  const requestNextPage = () => {
    if (loading || loadingMore || loadingMoreLock.current) return
    if (!hasMore) return
    loadingMoreLock.current = true
    setPage((p) => p + 1)
  }

  useEffect(() => {
    const node = loadMoreRef.current
    if (!node || typeof IntersectionObserver === 'undefined') return undefined
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) requestNextPage()
      },
      { root: null, rootMargin: '280px 0px', threshold: 0 }
    )
    io.observe(node)
    return () => io.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasMore, loading, loadingMore, items.length, total])

  const syncUrl = (next) => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams()
    if (next.q) params.set('q', next.q)
    if (next.category) params.set('category', next.category)
    if (next.sort && next.sort !== 'newest') params.set('sort', next.sort)
    if (next.filter && next.filter !== 'all') params.set('filter', next.filter)
    if (next.cols === 3) params.set('cols', '3')
    const qs = params.toString()
    router.replace(qs ? `/shop?${qs}` : '/shop', { scroll: false })
  }

  const applyState = (patch) => {
    const next = {
      q,
      category,
      sort,
      filter,
      cols,
      ...patch,
    }
    const resetsList =
      patch.q != null ||
      patch.category != null ||
      patch.sort != null ||
      patch.filter != null
    if (patch.q != null) setQ(patch.q)
    if (patch.category != null) setCategory(patch.category)
    if (patch.sort != null) setSort(patch.sort)
    if (patch.filter != null) setFilter(patch.filter)
    if (patch.cols != null) setCols(patch.cols)
    if (resetsList) {
      setPage(1)
      setItems([])
      setTotal(0)
    }
    syncUrl(next)
  }

  const pickSort = (nextSort) => {
    applyState({
      sort: nextSort,
      filter:
        nextSort === 'featured' || nextSort === 'bestsellers'
          ? nextSort
          : filter === 'featured' || filter === 'bestsellers'
            ? 'all'
            : filter,
    })
    setSortOpen(false)
  }

  const filterPanel = (
    <aside className={styles.catalogAside} aria-label="فیلتر محصولات">
      <div className={styles.catalogAsideHead}>
        <strong>فیلترها</strong>
        <button
          type="button"
          className={styles.catalogAsideClose}
          onClick={() => setFiltersOpen(false)}
          aria-label="بستن فیلتر"
        >
          <X size={16} />
        </button>
      </div>

      <form
        className={styles.catalogSearch}
        onSubmit={(e) => {
          e.preventDefault()
          applyState({
            q: String(new FormData(e.currentTarget).get('q') || '').trim(),
          })
          setFiltersOpen(false)
        }}
      >
        <Search size={15} aria-hidden />
        <input name="q" defaultValue={q} placeholder="جستجو در فروشگاه…" />
        <button type="submit">برو</button>
      </form>

      <div className={styles.catalogFilterBlock}>
        <p className={styles.catalogFilterLabel}>دسترسی سریع</p>
        <div className={styles.catalogChipCol}>
          {SHOP_QUICK_FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              className={`${styles.catalogChip} ${
                filter === f.id ? styles.catalogChipOn : ''
              }`}
              onClick={() => {
                applyState({
                  filter: f.id,
                  sort:
                    f.id === 'featured' || f.id === 'bestsellers'
                      ? f.id
                      : sort === 'featured' || sort === 'bestsellers'
                        ? 'newest'
                        : sort,
                })
                setFiltersOpen(false)
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.catalogFilterBlock}>
        <p className={styles.catalogFilterLabel}>دسته‌بندی</p>
        <div className={styles.catalogChipCol}>
          <button
            type="button"
            className={`${styles.catalogChip} ${
              !category ? styles.catalogChipOn : ''
            }`}
            onClick={() => {
              applyState({ category: '' })
              setFiltersOpen(false)
            }}
          >
            همه دسته‌ها
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              type="button"
              className={`${styles.catalogChip} ${
                String(category) === String(c.id) ? styles.catalogChipOn : ''
              }`}
              onClick={() => {
                applyState({ category: String(c.id) })
                setFiltersOpen(false)
              }}
            >
              <span>{c.title}</span>
              {c.active_products_count != null ? (
                <em>{Number(c.active_products_count).toLocaleString('fa-IR')}</em>
              ) : null}
            </button>
          ))}
        </div>
      </div>
    </aside>
  )

  return (
    <div
      className={`${styles.shell} ${styles.catalogShell}`}
      style={{
        ...shopWidgetCssVars({
          ...settings,
          max_width: 1200,
          padding_left: 0,
          padding_right: 0,
          margin_left: 0,
          margin_right: 0,
        }),
        '--shop-max': 'var(--home-max-width, 1200px)',
        '--shop-success-light': accent,
        '--shop-success': accent,
      }}
    >
      <div className={`${styles.inner} ${styles.catalogInner}`}>
        <div className={styles.catalogLayout}>
          <div
            className={`${styles.catalogAsideWrap} ${
              filtersOpen ? styles.catalogAsideWrapOpen : ''
            }`}
          >
            {filterPanel}
          </div>

          <div className={styles.catalogMain}>
            <div className={styles.catalogToolbar}>
              <button
                type="button"
                className={styles.catalogFilterBtn}
                onClick={() => setFiltersOpen(true)}
              >
                <SlidersHorizontal size={15} />
                فیلترها
              </button>

              <div className={styles.catalogMeta}>
                {loading
                  ? 'در حال بارگذاری…'
                  : total > 0
                    ? `${items.length.toLocaleString('fa-IR')} از ${Number(
                        total
                      ).toLocaleString('fa-IR')} محصول`
                    : '۰ محصول'}
                {usingDemo ? ' · نمونه' : ''}
              </div>

              <button
                type="button"
                className={styles.catalogSortBtn}
                onClick={() => setSortOpen(true)}
                aria-haspopup="dialog"
                aria-expanded={sortOpen}
              >
                <ArrowUpDown size={15} aria-hidden />
                <span className={styles.catalogSortBtnText}>
                  <em>مرتب‌سازی</em>
                  <strong>{activeSort.label}</strong>
                </span>
              </button>

              <div className={styles.catalogCols} role="group" aria-label="تعداد ستون">
                <button
                  type="button"
                  className={cols === 3 ? styles.catalogColOn : ''}
                  onClick={() => applyState({ cols: 3 })}
                  title="۳ ستونه"
                  aria-pressed={cols === 3}
                >
                  <Square size={13} />
                  ۳
                </button>
                <button
                  type="button"
                  className={cols === 4 ? styles.catalogColOn : ''}
                  onClick={() => applyState({ cols: 4 })}
                  title="۴ ستونه"
                  aria-pressed={cols === 4}
                >
                  <LayoutGrid size={14} />
                  ۴
                </button>
              </div>
            </div>

            {loadError ? (
              <p className={styles.catalogBanner} role="status">
                {loadError}
              </p>
            ) : null}

            {loading && items.length === 0 ? (
              <div className={styles.empty}>در حال بارگذاری محصولات…</div>
            ) : (
              <>
                <ProductsDisplay
                  products={items}
                  settings={settings}
                  mode={listMode}
                />
                {hasMore ? (
                  <div className={styles.catalogPager} ref={loadMoreRef}>
                    <button
                      type="button"
                      className={styles.catalogLoadMore}
                      onClick={requestNextPage}
                      disabled={loadingMore}
                    >
                      {loadingMore
                        ? 'در حال بارگذاری…'
                        : 'نمایش محصولات بیشتر'}
                    </button>
                  </div>
                ) : items.length > 0 ? (
                  <p className={styles.catalogPagerDone}>
                    همهٔ محصولات این فهرست نمایش داده شد
                  </p>
                ) : null}
              </>
            )}
          </div>
        </div>

        {filtersOpen ? (
          <button
            type="button"
            className={styles.catalogScrim}
            aria-label="بستن فیلتر"
            onClick={() => setFiltersOpen(false)}
          />
        ) : null}

        {sortOpen ? (
          <div className={styles.sortDialogRoot} role="presentation">
            <button
              type="button"
              className={styles.sortDialogScrim}
              aria-label="بستن مرتب‌سازی"
              onClick={() => setSortOpen(false)}
            />
            <div
              className={styles.sortDialog}
              role="dialog"
              aria-modal="true"
              aria-labelledby="shop-sort-dialog-title"
            >
              <div className={styles.sortDialogHandle} aria-hidden />
              <div className={styles.sortDialogHead}>
                <div>
                  <p className={styles.sortDialogEyebrow}>نمایش بر اساس</p>
                  <h3 id="shop-sort-dialog-title">مرتب‌سازی محصولات</h3>
                </div>
                <button
                  type="button"
                  className={styles.sortDialogClose}
                  onClick={() => setSortOpen(false)}
                  aria-label="بستن"
                >
                  <X size={16} />
                </button>
              </div>
              <div className={styles.sortDialogList}>
                {SHOP_SORT_OPTIONS.map((o) => {
                  const on = sort === o.id
                  const Icon = o.Icon
                  return (
                    <button
                      key={o.id}
                      type="button"
                      className={`${styles.sortDialogOption} ${
                        on ? styles.sortDialogOptionOn : ''
                      }`}
                      onClick={() => pickSort(o.id)}
                      aria-pressed={on}
                    >
                      <span className={styles.sortDialogIcon} aria-hidden>
                        <Icon size={18} />
                      </span>
                      <span className={styles.sortDialogCopy}>
                        <strong>{o.label}</strong>
                        <em>{o.desc}</em>
                      </span>
                      <span
                        className={`${styles.sortDialogCheck} ${
                          on ? styles.sortDialogCheckOn : ''
                        }`}
                        aria-hidden
                      >
                        {on ? <Check size={14} strokeWidth={2.6} /> : null}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
