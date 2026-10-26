'use client'

import React, { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowRight, Heart, ShoppingCart, Star } from 'lucide-react'
import PageBuilderRenderer from '@/components/layout/PageBuilderRenderer'
import {
  fetchSiteSettings,
  clearSiteSettingsCache,
} from '@/services/siteSettings'
import {
  DEFAULT_PRODUCT_SINGLE_LAYOUT,
  normalizeProductSingleLayout,
} from '@/config/homeLayout'
import {
  DEFAULT_PRODUCT_SINGLE_PAGE_SETTINGS,
  normalizeProductSinglePageSettings,
  productSingleCssVars,
} from '@/config/productSinglePageSettings'
import { useCartOptional } from '@/contexts/CartContext'
import shopApi from '@/services/shopApi'
import styles from './ProductDetail.module.css'

function formatPrice(n) {
  return (Number(n) || 0).toLocaleString('fa-IR')
}

/** ظاهر PDP هم‌تراز mrsaeed Description + Single */
function ProductArticleInner({ product, pageSettings }) {
  const router = useRouter()
  const cart = useCartOptional()
  const s = normalizeProductSinglePageSettings(pageSettings)
  const vars = productSingleCssVars(s)
  const img =
    shopApi.resolveImage(product) ||
    product?.images?.[0]?.image_url ||
    ''
  const finalPrice =
    product.final_price ?? product.get_discounted_price ?? product.price_one
  const hasDiscount = product.has_discount || (product.discount || 0) > 0
  const inStock =
    product.status === 'active' ||
    (product.stock?.remaining != null && product.stock.remaining > 0) ||
    product.status !== 'inactive'
  const inCartQty = cart ? cart.getQty(product.id) : 0
  const [qty, setQty] = useState(1)
  const [adding, setAdding] = useState(false)
  const rate = Math.round(Number(product.rate) || 0)
  const unit = Number(finalPrice) || 0
  const liveTotal = unit * (inCartQty > 0 ? inCartQty : qty)

  const handleAdd = async () => {
    if (!cart) {
      router.push('/cart')
      return
    }
    setAdding(true)
    try {
      await cart.setQty(product, Math.max(1, qty))
      router.push('/cart')
    } catch (err) {
      if (err?.code === 'other_shop' || err?.data?.code === 'other_shop') {
        const title = err.data?.current_shop_title || 'فروشگاه دیگر'
        if (
          window.confirm(`سبد فعلی متعلق به «${title}» است. جایگزین شود؟`)
        ) {
          await cart.setQty(product, Math.max(1, qty), { replaceShop: true })
          router.push('/cart')
        }
      }
    } finally {
      setAdding(false)
    }
  }

  const onQtyChange = async (next) => {
    const n = Math.max(1, next)
    setQty(n)
    if (cart && inCartQty > 0) {
      try {
        await cart.setQty(product, n)
      } catch {
        /* ignore */
      }
    }
  }

  useEffect(() => {
    if (inCartQty > 0) setQty(inCartQty)
  }, [inCartQty])

  const layoutClass =
    s.layout === 'split'
      ? styles.layoutSplit
      : s.layout === 'cover'
        ? styles.layoutMagazine
        : styles.layoutClassic

  return (
    <article className={styles.wrap} style={vars} data-pdp-layout={s.layout}>
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

      {s.layout === 'cover' && s.show_gallery ? (
        <div className={styles.cover}>
          {img ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={img} alt="" />
          ) : null}
          {s.show_title ? (
            <h1 className={styles.coverTitle}>{product.title}</h1>
          ) : null}
        </div>
      ) : null}

      <div className={`${styles.layout} ${layoutClass}`}>
        {s.layout !== 'cover' && s.show_gallery ? (
          <div className={styles.gallery}>
            {img ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={img} alt={product.title || ''} />
            ) : (
              <span
                style={{
                  display: 'grid',
                  placeItems: 'center',
                  height: '100%',
                  color: '#a1a1a1',
                }}
              >
                <ShoppingCart size={40} />
              </span>
            )}
          </div>
        ) : null}

        <div className={styles.content}>
          {(s.show_badges || s.show_discount_badge || s.show_featured_badge) &&
          (hasDiscount || product.is_featured || s.show_stock) ? (
            <div className={styles.badgesFloat}>
              {s.show_discount_badge && hasDiscount ? (
                <span className={styles.badgeSale}>
                  {product.discount}% تخفیف
                </span>
              ) : null}
              {s.show_stock ? (
                <span className={styles.badgeStock}>
                  {inStock ? 'موجود' : 'ناموجود'}
                </span>
              ) : null}
              {s.show_featured_badge && product.is_featured ? (
                <span className={styles.badge}>ویژه</span>
              ) : null}
            </div>
          ) : null}

          <div className={styles.headerRight}>
            {s.show_title && s.layout !== 'cover' ? (
              <h1 className={styles.title}>{product.title}</h1>
            ) : (
              <span />
            )}
          </div>

          {s.show_rating ? (
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
          ) : null}

          {s.show_lid && product.lid ? (
            <p className={styles.lid}>{product.lid}</p>
          ) : null}

          {s.show_description && product.description ? (
            <div className={styles.desc}>{product.description}</div>
          ) : null}

          {s.show_price ? (
            <div className={styles.priceBox}>
              {s.show_old_price && hasDiscount && product.price_one ? (
                <span className={styles.old}>
                  {formatPrice(product.price_one)} تومان
                </span>
              ) : null}
              <span className={styles.price}>
                {!finalPrice || Number(finalPrice) === 0
                  ? 'استعلام قیمت'
                  : `${formatPrice(finalPrice)} تومان`}
              </span>
              {unit > 0 && (qty > 1 || inCartQty > 0) ? (
                <span className={styles.old} style={{ color: 'var(--pdp-accent, #ff00a6)', textDecoration: 'none', fontWeight: 700 }}>
                  جمع: {formatPrice(liveTotal)} تومان
                </span>
              ) : null}
            </div>
          ) : null}

          <div className={styles.actions}>
            {s.show_add_to_cart ? (
              <>
                <div className={styles.counter}>
                  <button
                    type="button"
                    className={styles.counterBtn}
                    onClick={() => onQtyChange(qty + 1)}
                    aria-label="افزایش"
                  >
                    +
                  </button>
                  <span className={styles.count}>
                    {qty.toLocaleString('fa-IR')}
                  </span>
                  <button
                    type="button"
                    className={styles.counterBtn}
                    onClick={() => onQtyChange(Math.max(1, qty - 1))}
                    aria-label="کاهش"
                  >
                    −
                  </button>
                </div>
                <button
                  type="button"
                  className={styles.primary}
                  disabled={adding}
                  onClick={handleAdd}
                >
                  <ShoppingCart size={16} />
                  {inCartQty > 0 ? 'به‌روزرسانی سبد' : 'افزودن به سبد'}
                </button>
              </>
            ) : null}
            {s.show_wishlist ? (
              <button type="button" className={styles.wishBtn} aria-label="علاقه‌مندی">
                <Heart size={16} fill="currentColor" />
              </button>
            ) : null}
          </div>

          {s.show_category && product.category_title ? (
            <div className={styles.metaRow}>
              <strong>دسته‌بندی:</strong>
              <span>{product.category_title}</span>
            </div>
          ) : null}

          {s.show_shop &&
          (product.shop_title || product.shop_detail?.title) ? (
            <div className={styles.brandRow}>
              <div className={styles.brandRight}>
                <strong>
                  {product.shop_title || product.shop_detail?.title}
                </strong>
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
          ) : null}
        </div>
      </div>
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
    ;(async () => {
      try {
        clearSiteSettingsCache()
        const s = await fetchSiteSettings({ force: true })
        if (cancelled) return
        setPageSettings(
          normalizeProductSinglePageSettings(
            s?.product_single_page || DEFAULT_PRODUCT_SINGLE_PAGE_SETTINGS
          )
        )
        setSingleLayout(
          normalizeProductSingleLayout(s?.product_single_layout)
        )
      } catch {
        /* defaults */
      }
    })()
    const onLayout = (e) => {
      if (e?.detail) setSingleLayout(normalizeProductSingleLayout(e.detail))
    }
    const onPage = (e) => {
      if (e?.detail) {
        setPageSettings(normalizeProductSinglePageSettings(e.detail))
      }
    }
    window.addEventListener('product-single-layout-changed', onLayout)
    window.addEventListener('product-single-page-changed', onPage)
    return () => {
      cancelled = true
      window.removeEventListener('product-single-layout-changed', onLayout)
      window.removeEventListener('product-single-page-changed', onPage)
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setErr(null)
      try {
        const data = await shopApi.getProduct(productId)
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
  }, [productId])

  const articleNode = useMemo(() => {
    if (!product) return null
    return <ProductArticleInner product={product} pageSettings={pageSettings} />
  }, [product, pageSettings])

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
    <PageBuilderRenderer layout={singleLayout} articleSlot={articleNode} />
  )
}
