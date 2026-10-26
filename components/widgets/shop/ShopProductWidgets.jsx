'use client'

import React, { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Search, ShoppingBag, Star } from 'lucide-react'
import ModuleGate from '@/components/modules/ModuleGate'
import { SITE_MODULE_KEYS } from '@/config/siteModules'
import {
  getShopWidgetVariant,
  normalizeShopWidgetSettings,
  shopWidgetCssVars,
} from '@/config/shopWidgetSettings'
import { useCartOptional } from '@/contexts/CartContext'
import shopApi from '@/services/shopApi'
import styles from './ShopWidgetShell.module.css'

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

function WidgetHead({ title, show, moreHref, moreLabel, showMore }) {
  if (!show || !title) return null
  return (
    <div className={styles.head}>
      <h3 className={styles.title}>{title}</h3>
      {showMore && moreHref ? (
        <Link href={moreHref} className={styles.more}>
          {moreLabel || 'همه'}
        </Link>
      ) : null}
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

function CartControls({ product, compact = false }) {
  const { qty, busy, lineTotal, bump, ready } = useCartActions(product)

  if (!ready) {
    return <span className={styles.btnBuy}>خرید</span>
  }

  if (qty <= 0) {
    return (
      <button
        type="button"
        className={styles.btnBuy}
        disabled={busy}
        onClick={(e) => bump(1, e)}
      >
        خرید
      </button>
    )
  }

  return (
    <div onClick={(e) => e.preventDefault()}>
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
      {!compact && lineTotal > 0 ? (
        <span className={styles.lineTotal}>
          {formatPrice(lineTotal)} تومان
        </span>
      ) : null}
    </div>
  )
}

/** کارت منوی mrsaeed — تصویر دایره‌ای، تخفیف صورتی، دکمه خرید */
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
  const finalPrice = product.final_price ?? product.price_one
  const hasDiscount = product.has_discount || (product.discount || 0) > 0
  const useCircle = settings.image_shape !== 'rounded'
  const noPrice = !finalPrice || Number(finalPrice) === 0

  return (
    <div className={`${styles.card} ${cardStyle} ${className}`.trim()}>
      <Link href={href} style={{ textDecoration: 'none', color: 'inherit', display: 'contents' }}>
        {settings.show_image !== false ? (
          <div className={useCircle ? styles.imgCircle : styles.imgRect}>
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
                <ShoppingBag size={useCircle ? 28 : 24} />
              </span>
            )}
          </div>
        ) : null}
      </Link>

      <div style={{ width: '100%', flex: 1 }}>
        <Link href={href} style={{ textDecoration: 'none', color: 'inherit' }}>
          <h4 className={styles.cardTitle}>{product.title}</h4>
          {product.lid ? (
            <p className={styles.lid}>{product.lid}</p>
          ) : (
            <p className={styles.lid}>مواد تشکیل دهنده</p>
          )}
        </Link>
        {settings.show_shop !== false && product.shop_title ? (
          <span className={styles.shopName}>{product.shop_title}</span>
        ) : null}
        {settings.show_rating !== false && product.rate ? (
          <span className={styles.rate}>
            <Star size={11} />
            {Number(product.rate).toLocaleString('fa-IR')}
          </span>
        ) : null}

        {settings.show_price !== false ? (
          <div className={styles.bodyPrice}>
            {noPrice ? (
              <span className={styles.priceNew}>استعلام قیمت</span>
            ) : (
              <>
                {settings.show_discount !== false &&
                hasDiscount &&
                product.price_one ? (
                  <span className={styles.priceOld}>
                    {formatPrice(product.price_one)} تومان
                  </span>
                ) : null}
                <span className={styles.priceNew}>
                  {formatPrice(finalPrice)} تومان
                </span>
              </>
            )}
          </div>
        ) : null}

        <div className={styles.statusBar}>
          {settings.show_add_button !== false ? (
            <CartControls product={product} />
          ) : (
            <span />
          )}
          {settings.show_discount !== false && hasDiscount ? (
            <span className={styles.discount}>%{product.discount}</span>
          ) : (
            <span />
          )}
        </div>
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

function ProductsDisplay({ products, settings, mode }) {
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
      <div className={styles.recycler}>
        {products.map((p) => (
          <div key={p.id} className={styles.recyclerItem}>
            <ProductCard product={p} settings={settings} />
          </div>
        ))}
      </div>
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
    mode === 'grid-3' ? styles.grid3 : '',
    mode === 'grid-2' || mode === 'card' ? styles.grid2 : '',
    mode === 'grid-3' || mode === 'grid-2' ? styles.gridKeep : '',
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

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      try {
        const params = {
          source: variant.source || 'latest',
          limit: settings.limit || 8,
        }
        if (type === 'products_by_category' && settings.category_id) {
          params.category = settings.category_id
          params.source = 'all'
        }
        const data = await shopApi.listProducts(params, {
          demoFallback: settings.use_demo_data !== false,
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
    variant.source,
    settings.limit,
    settings.category_id,
    settings.use_demo_data,
  ])

  const gate =
    variant.gate === 'shop'
      ? SITE_MODULE_KEYS.SHOP
      : SITE_MODULE_KEYS.SHOP_LISTINGS

  return (
    <ModuleGate moduleKey={gate}>
      <div
        className={shellClass(settings)}
        style={vars}
        data-shop-widget={type}
        data-section-full={settings.section_full ? '1' : '0'}
      >
        <div className={styles.inner}>
          <WidgetHead
            title={title}
            show={settings.show_title !== false}
            moreHref={settings.more_href}
            moreLabel={settings.more_label}
            showMore={settings.show_more_link !== false}
          />
          {loading ? (
            <div className={styles.empty}>در حال بارگذاری…</div>
          ) : (
            <ProductsDisplay products={items} settings={settings} mode={mode} />
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
  const settings = normalizeShopWidgetSettings(raw, 'shop_search_bar')
  const vars = shopWidgetCssVars(settings)
  const router = useRouter()
  const [q, setQ] = useState('')

  return (
    <ModuleGate moduleKey={SITE_MODULE_KEYS.SHOP}>
      <div className={shellClass(settings)} style={vars} data-shop-widget="search">
        <div className={styles.inner}>
          <form
            className={styles.searchBar}
            onSubmit={(e) => {
              e.preventDefault()
              const query = q.trim()
              router.push(query ? `/shop?q=${encodeURIComponent(query)}` : '/shop')
            }}
          >
            <Search size={16} style={{ color: '#a1a1a1', flexShrink: 0 }} />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="جستجوی محصول…"
              aria-label="جستجوی محصول"
            />
            <button type="submit">جستجو</button>
          </form>
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

/** محتوای لیست فروشگاه برای articleSlot — گرید ۵ ستونه mrsaeed */
export function ShopListingContent({ initialQuery = '', category = '' }) {
  const [q, setQ] = useState(initialQuery)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const settings = useMemo(
    () =>
      normalizeShopWidgetSettings(
        {
          display_mode: 'card',
          show_title: false,
          limit: 24,
          accent_color: '#ff00a6',
          more_label: 'همه',
        },
        'products_grid'
      ),
    []
  )

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      try {
        const data = await shopApi.listProducts({
          source: 'all',
          q: q || undefined,
          category: category || undefined,
          limit: 24,
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
  }, [q, category])

  return (
    <div
      className={styles.shell}
      style={{
        ...shopWidgetCssVars(settings),
        '--shop-success-light': '#ff00a6',
      }}
    >
      <div className={styles.inner}>
        <form
          className={styles.searchBar}
          style={{ marginBottom: '1rem' }}
          onSubmit={(e) => {
            e.preventDefault()
            setQ(String(new FormData(e.currentTarget).get('q') || '').trim())
          }}
        >
          <Search size={16} style={{ color: '#a1a1a1' }} />
          <input name="q" defaultValue={initialQuery} placeholder="جستجو در فروشگاه…" />
          <button type="submit">جستجو</button>
        </form>
        {loading ? (
          <div className={styles.empty}>در حال بارگذاری…</div>
        ) : (
          <ProductsDisplay products={items} settings={settings} mode="card" />
        )}
      </div>
    </div>
  )
}
