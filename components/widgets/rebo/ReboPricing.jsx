'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import {
  Boxes,
  Calculator,
  Check,
  Info,
  Sparkles,
  X,
  Zap,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { resolveLucideIcon } from '@/utils/lucideIcons'
import {
  formatRial,
  getPackageFeatureLabels,
  getPackagePriceInfo,
} from '@/config/reboPricing'
import {
  buildReboOrderNextPath,
  writeReboPackageCart,
} from '@/utils/reboPackageCart'
import ReboDiscountCountdown from '@/components/widgets/ReboDiscountCountdown'
import useReboNormalized from './useReboNormalized'
import useReboPricingState from './useReboPricingState'
import styles from './ReboPricing.module.css'

const ACCENTS = [
  '#26a680',
  '#3b82f6',
  '#0d9488',
  '#8b5cf6',
  '#f59e0b',
  '#ef4444',
  '#06b6d4',
  '#c2410c',
]

/** موضوعات ویژه — بخش جدا با ردیف ۳تایی */
const FEATURED_PACKAGE_MATCHERS = [
  { id: 'jobs', test: /کاریابی|jobs|job_board/i },
  { id: 'shop_single', test: /فروشگاه\s*تکی|shop_single|single_store/i },
  { id: 'school', test: /مدرسه|school/i },
  { id: 'gym', test: /بدنسازی|gym_bodybuilding|pkg_gym/i },
]

const PHONE_THEMES = [
  {
    test: /انبار|inventory/i,
    short: 'انبار',
    chips: ['ورود کالا', 'خروج', 'حواله', 'نمودار'],
    bar: 'موجودی امروز',
  },
  {
    test: /بدنسازی|gym_bodybuilding|pkg_gym/i,
    short: 'باشگاه',
    chips: ['اعضا', 'سانس', 'مربی', 'برنامه'],
    bar: 'پروفایل عضو',
  },
  {
    test: /بیلیارد|billiard/i,
    short: 'بیلیارد',
    chips: ['میزها', 'رزرو', 'سانس', 'مشتری'],
    bar: 'میز آزاد',
  },
  {
    test: /فروشگاه\s*تکی|shop_single/i,
    short: 'فروشگاه',
    chips: ['ویترین', 'سبد', 'پرداخت', 'سفارش'],
    bar: 'تسویه سبد',
  },
  {
    test: /مارکت|چندفروش|marketplace/i,
    short: 'مارکت',
    chips: ['فروشنده', 'ویترین', 'تسویه', 'کمیسیون'],
    bar: 'پنل فروشنده',
  },
  {
    test: /کاریابی|jobs/i,
    short: 'کاریابی',
    chips: ['آگهی', 'رزومه', 'کارفرما', 'کارجو'],
    bar: 'ثبت آگهی',
  },
  {
    test: /مدرسه|school/i,
    short: 'مدرسه',
    chips: ['کلاس', 'تکلیف', 'آزمون', 'نمره'],
    bar: 'میز دانش‌آموز',
  },
  {
    test: /نوبت|booking/i,
    short: 'نوبت',
    chips: ['خدمت', 'تقویم', 'رزرو', 'کد پیگیری'],
    bar: 'رزرو نوبت',
  },
  {
    test: /خبر|news/i,
    short: 'خبر',
    chips: ['تیتر', 'دسته', 'سینگل', 'آرشیو'],
    bar: 'آخرین خبرها',
  },
  {
    test: /تعمیر|repairs/i,
    short: 'تعمیرات',
    chips: ['اعزام', 'اجرت', 'قطعه', 'پرداخت'],
    bar: 'درخواست سرویس',
  },
  {
    test: /ویدیو|استوری|video/i,
    short: 'ویدیو',
    chips: ['استوری', 'آرشیو', 'برجسته', 'پخش'],
    bar: 'پخش ویدیو',
  },
  {
    test: /کاتالوگ|catalog/i,
    short: 'کاتالوگ',
    chips: ['جلد', 'صفحه‌ها', 'دانلود', 'فلیپ'],
    bar: 'مشاهده کاتالوگ',
  },
]

function isPaidPackage(pkg) {
  const info = getPackagePriceInfo(pkg)
  const price = Math.max(
    Number(info.finalPrice) || 0,
    Number(info.original) || 0,
    Number(pkg.price) || 0,
  )
  return price > 0
}

function isPaidItem(it) {
  return Math.max(0, Number(it.price) || 0) > 0
}

function packageHaystack(pkgOrItem) {
  return [
    pkgOrItem?.id,
    pkgOrItem?.key,
    pkgOrItem?.type,
    pkgOrItem?.name,
    pkgOrItem?.label,
    pkgOrItem?.category,
    pkgOrItem?.desc,
  ]
    .filter(Boolean)
    .join(' ')
}

function featuredMatchId(pkg) {
  const hay = packageHaystack(pkg)
  const hit = FEATURED_PACKAGE_MATCHERS.find((m) => m.test.test(hay))
  return hit?.id || null
}

function isFeaturedPackage(pkg) {
  return !!featuredMatchId(pkg)
}

function sortFeaturedPackages(list) {
  const order = FEATURED_PACKAGE_MATCHERS.map((m) => m.id)
  return [...list].sort((a, b) => {
    const ai = order.indexOf(featuredMatchId(a) || '')
    const bi = order.indexOf(featuredMatchId(b) || '')
    return (ai < 0 ? 99 : ai) - (bi < 0 ? 99 : bi)
  })
}

function resolvePhoneTheme(pkgOrItem) {
  const hay = packageHaystack(pkgOrItem)
  const found = PHONE_THEMES.find((t) => t.test.test(hay))
  const title =
    String(pkgOrItem?.name || pkgOrItem?.label || '').trim() || 'موضوع'
  if (found) {
    return {
      short: found.short,
      chips: found.chips,
      bar: found.bar,
      title,
    }
  }
  const bits = title.split(/\s+/).filter(Boolean)
  return {
    short: bits.slice(0, 2).join(' ') || title,
    chips: bits.slice(0, 4).length
      ? bits.slice(0, 4)
      : ['بخش ۱', 'بخش ۲', 'بخش ۳', 'بخش ۴'],
    bar: title,
    title,
  }
}

function PhonePreview({ accent, title, icon: Icon, theme }) {
  const chips = theme?.chips || ['بخش ۱', 'بخش ۲', 'بخش ۳', 'بخش ۴']
  const bar = theme?.bar || title
  const head = theme?.short || title
  return (
    <div className={styles.phone} style={{ '--accent': accent }} aria-hidden>
      <div className={styles.phoneGlow} />
      <div className={styles.phoneBody}>
        <span className={styles.phoneBtnVol} />
        <span className={styles.phoneBtnMute} />
        <span className={styles.phoneBtnPower} />
        <div className={styles.phoneGlass}>
          <div className={styles.phoneScreen}>
            <div className={styles.phoneStatus}>
              <em>۹:۴۱</em>
              <span className={styles.phoneIsland} />
              <i className={styles.phoneStatusIcons} />
            </div>
            <div className={styles.phoneHero}>
              <span className={styles.phoneHeroIcon}>
                <Icon size={13} strokeWidth={1.75} />
              </span>
              <div className={styles.phoneHeroText}>
                <strong title={title}>{head}</strong>
                <small>Rebo</small>
              </div>
            </div>
            <div className={styles.phoneCardStack}>
              <div className={styles.phoneCardMain} />
              <div className={styles.phoneBars}>
                <i />
                <i />
                <i />
              </div>
            </div>
            <div className={styles.phoneChips}>
              {chips.slice(0, 4).map((label) => (
                <span key={label}>{label}</span>
              ))}
            </div>
            <div className={styles.phonePriceBar}>
              <em>{bar}</em>
            </div>
            <div className={styles.phoneHome} />
          </div>
        </div>
      </div>
    </div>
  )
}

function usePortalLock(open, onClose) {
  const [portalReady, setPortalReady] = useState(false)

  useEffect(() => {
    setPortalReady(true)
  }, [])

  useEffect(() => {
    if (!open) return undefined
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  return portalReady
}

function DetailsDialog({ open, onClose, accent, title, icon: Icon, children }) {
  const portalReady = usePortalLock(open, onClose)
  if (!open || !portalReady) return null

  return createPortal(
    <div className={styles.dialogRoot} role="presentation">
      <button
        type="button"
        className={styles.dialogBackdrop}
        aria-label="بستن"
        onClick={onClose}
      />
      <div
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        style={{ '--accent': accent }}
        dir="rtl"
      >
        <header className={styles.dialogHead}>
          <div className={styles.dialogBrand}>
            <span className={styles.dialogIcon} aria-hidden>
              <Icon size={18} strokeWidth={1.8} />
            </span>
            <div>
              <p className={styles.dialogKicker}>جزئیات موضوع</p>
              <h3 className={styles.dialogTitle}>{title}</h3>
            </div>
          </div>
          <button
            type="button"
            className={styles.dialogClose}
            aria-label="بستن"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </header>
        <div className={styles.dialogBody}>{children}</div>
      </div>
    </div>,
    document.body,
  )
}

export default function ReboPricing({ settings: raw = {} }) {
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const { settings: s, style, visible } = useReboNormalized(raw, 'rebo_pricing')
  const { packages, standalone, groups, currency, hasPricing } =
    useReboPricingState()
  const [ordering, setOrdering] = useState(false)
  const [detail, setDetail] = useState(null)

  const paidPackages = useMemo(
    () => packages.filter(isPaidPackage),
    [packages],
  )

  const featuredPackages = useMemo(
    () => sortFeaturedPackages(paidPackages.filter(isFeaturedPackage)),
    [paidPackages],
  )

  const regularPackages = useMemo(
    () => paidPackages.filter((pkg) => !isFeaturedPackage(pkg)),
    [paidPackages],
  )

  const paidGroups = useMemo(
    () =>
      groups
        .map((g) => ({
          ...g,
          items: (g.items || []).filter(isPaidItem),
        }))
        .filter((g) => g.items.length > 0),
    [groups],
  )

  const paidStandalone = useMemo(
    () => standalone.filter(isPaidItem),
    [standalone],
  )

  const showPricing =
    hasPricing && (paidPackages.length > 0 || paidGroups.length > 0)

  if (!visible || !showPricing) return null

  const subtitle =
    s.subtitle ||
    `موضوع را ببینید و مستقیم سفارش دهید — مبلغ به ${currency}.`

  const buildCartPayload = (pkgIds, itemTypes) => {
    const pkgs = paidPackages
      .filter((pkg) => pkgIds.has(pkg.id))
      .map((pkg) => {
        const info = getPackagePriceInfo(pkg)
        return {
          id: pkg.id,
          name: pkg.name,
          desc: pkg.desc || '',
          icon: pkg.icon || '',
          price: info.active
            ? info.finalPrice
            : Math.max(0, Number(pkg.price) || 0),
          original: info.original || Number(pkg.price) || 0,
          features: getPackageFeatureLabels(pkg).slice(0, 8),
        }
      })
    const its = paidStandalone
      .filter((it) => itemTypes.has(it.type))
      .map((it) => ({
        type: it.type,
        label: it.label,
        desc: it.desc || '',
        icon: it.icon || '',
        price: Math.max(0, Number(it.price) || 0),
      }))
    const total =
      pkgs.reduce((sum, p) => sum + (Number(p.price) || 0), 0) +
      its.reduce((sum, it) => sum + (Number(it.price) || 0), 0)
    return { packages: pkgs, items: its, total, currency }
  }

  const goOrder = (pkgIds, itemTypes) => {
    if (!pkgIds.size && !itemTypes.size) return
    setOrdering(true)
    writeReboPackageCart(buildCartPayload(pkgIds, itemTypes))
    const next = buildReboOrderNextPath()
    if (isAuthenticated) {
      router.push(next)
      return
    }
    router.push(`/login?next=${encodeURIComponent(next)}`)
  }

  const closeDetail = () => setDetail(null)

  const renderPackageCard = (pkg, idx, { featured = false } = {}) => {
    const Icon = resolveLucideIcon(pkg.icon, Boxes)
    const features = getPackageFeatureLabels(pkg)
    const priceInfo = getPackagePriceInfo(pkg)
    const accent = ACCENTS[idx % ACCENTS.length]
    const price = priceInfo.active ? priceInfo.finalPrice : pkg.price
    const phoneTheme = resolvePhoneTheme(pkg)
    return (
      <article
        key={pkg.id}
        className={`${styles.pkgCard}${
          featured ? ` ${styles.pkgCardFeatured}` : ''
        }`}
        style={{ '--accent': accent }}
      >
        <div className={styles.media}>
          <PhonePreview
            accent={accent}
            title={pkg.name}
            icon={Icon}
            theme={phoneTheme}
          />
        </div>

        <div className={styles.body}>
          <div className={styles.cardBadges}>
            {featured ? (
              <span className={styles.featuredChip}>ویژه</span>
            ) : null}
            {priceInfo.active ? (
              <span className={styles.dealChip}>
                <Sparkles size={11} strokeWidth={2.2} />
                {priceInfo.percent.toLocaleString('fa-IR')}٪
              </span>
            ) : null}
          </div>
          <div className={styles.nameRow}>
            <span className={styles.iconWrap} aria-hidden>
              <Icon size={14} strokeWidth={1.75} />
            </span>
            <div className={styles.meta}>
              <strong>{pkg.name}</strong>
              {pkg.desc ? <small>{pkg.desc}</small> : null}
            </div>
          </div>

          {priceInfo.active ? (
            <div className={styles.smallDeal}>
              <ReboDiscountCountdown
                endsAt={priceInfo.endsAt}
                percent={priceInfo.percent}
                label={priceInfo.label}
                accent={accent}
                compact
              />
            </div>
          ) : null}

          <div
            className={`${styles.priceCompact}${
              priceInfo.active ? ` ${styles.priceCompactDeal}` : ''
            }`}
          >
            {priceInfo.active ? (
              <del>{formatRial(priceInfo.original)}</del>
            ) : null}
            <strong>{formatRial(price)}</strong>
            <em>{currency}</em>
          </div>

          <div className={styles.cardActions}>
            <button
              type="button"
              className={styles.btnDetails}
              onClick={() =>
                setDetail({
                  kind: 'pkg',
                  pkg,
                  Icon,
                  accent,
                  features,
                  priceInfo,
                })
              }
            >
              <Info size={12} strokeWidth={2.2} />
              جزئیات
            </button>
            <button
              type="button"
              className={styles.btnOrder}
              disabled={ordering}
              onClick={() => goOrder(new Set([pkg.id]), new Set())}
            >
              <Zap size={12} strokeWidth={2.2} />
              سفارش
            </button>
          </div>
        </div>
      </article>
    )
  }

  return (
    <section
      className={styles.pricing}
      id="rebo-cost"
      style={style}
      dir="rtl"
      lang="fa"
    >
      <div className={styles.glow} aria-hidden />
      <div
        className={styles.inner}
        style={{ maxWidth: s.max_width ? `${s.max_width}px` : undefined }}
      >
        {s.show_kicker !== false ||
        (s.show_title !== false && s.title) ||
        s.show_subtitle !== false ? (
          <header className={styles.head}>
            {s.show_kicker !== false ? (
              <p className={styles.eyebrow}>
                <Calculator size={13} strokeWidth={2} />
                {s.kicker || 'برآورد هزینه'}
              </p>
            ) : null}
            {s.show_title !== false && s.title ? (
              <h2 className={styles.title}>{s.title}</h2>
            ) : null}
            {s.show_subtitle !== false ? (
              <p className={styles.subtitle}>{subtitle}</p>
            ) : null}
          </header>
        ) : null}
      </div>

      {featuredPackages.length > 0 ? (
        <div className={styles.featuredBand}>
          <div
            className={styles.featuredBandInner}
            style={{
              maxWidth: s.max_width ? `${s.max_width}px` : undefined,
            }}
          >
            <h3 className={styles.featuredTitle}>
              <Sparkles size={14} strokeWidth={2.2} />
              ویژه‌ها
            </h3>
            <div className={styles.pkgGrid}>
              {featuredPackages.map((pkg, idx) =>
                renderPackageCard(pkg, idx, { featured: true }),
              )}
            </div>
          </div>
        </div>
      ) : null}

      <div
        className={styles.inner}
        style={{ maxWidth: s.max_width ? `${s.max_width}px` : undefined }}
      >
        <div className={styles.groups}>
          {regularPackages.length > 0 ? (
            <div>
              {s.show_topics_heading !== false ? (
                <h3 className={styles.groupTitle}>
                  <i />
                  موضوع‌ها
                </h3>
              ) : null}
              <div className={styles.pkgGrid}>
                {regularPackages.map((pkg, idx) =>
                  renderPackageCard(pkg, idx + featuredPackages.length),
                )}
              </div>
            </div>
          ) : null}

          {paidGroups.map((g) => (
            <div key={g.id}>
              <h3 className={styles.groupTitle}>
                <i />
                {g.label}
              </h3>
              <div className={styles.itemGrid}>
                {g.items.map((it, idx) => {
                  const Icon = resolveLucideIcon(it.icon, Boxes)
                  const accent = ACCENTS[(idx + 2) % ACCENTS.length]
                  const phoneTheme = resolvePhoneTheme(it)
                  return (
                    <article
                      key={it.type}
                      className={styles.pkgCard}
                      style={{ '--accent': accent }}
                    >
                      <div className={styles.media}>
                        <PhonePreview
                          accent={accent}
                          title={it.label}
                          icon={Icon}
                          theme={phoneTheme}
                        />
                      </div>
                      <div className={styles.body}>
                        <div className={styles.nameRow}>
                          <span className={styles.iconWrap} aria-hidden>
                            <Icon size={15} strokeWidth={1.75} />
                          </span>
                          <div className={styles.meta}>
                            <strong>{it.label}</strong>
                            {it.desc ? <small>{it.desc}</small> : null}
                          </div>
                        </div>
                        <div className={styles.priceCompact}>
                          <strong>{formatRial(it.price)}</strong>
                          <em>{currency}</em>
                        </div>
                        <div className={styles.cardActions}>
                          <button
                            type="button"
                            className={styles.btnDetails}
                            onClick={() =>
                              setDetail({
                                kind: 'item',
                                item: it,
                                Icon,
                                accent,
                              })
                            }
                          >
                            <Info size={13} strokeWidth={2.2} />
                            جزئیات
                          </button>
                          <button
                            type="button"
                            className={styles.btnOrder}
                            disabled={ordering}
                            onClick={() =>
                              goOrder(new Set(), new Set([it.type]))
                            }
                          >
                            <Zap size={13} strokeWidth={2.2} />
                            سفارش
                          </button>
                        </div>
                      </div>
                    </article>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <DetailsDialog
        open={!!detail}
        onClose={closeDetail}
        accent={detail?.accent || ACCENTS[0]}
        title={
          detail?.kind === 'pkg'
            ? detail.pkg.name
            : detail?.kind === 'item'
              ? detail.item.label
              : ''
        }
        icon={detail?.Icon || Boxes}
      >
        {detail?.kind === 'pkg' ? (
          <>
            {detail.pkg.desc ? (
              <p className={styles.dialogDesc}>{detail.pkg.desc}</p>
            ) : null}

            {detail.priceInfo.active ? (
              <div className={styles.dialogDeal}>
                <ReboDiscountCountdown
                  endsAt={detail.priceInfo.endsAt}
                  percent={detail.priceInfo.percent}
                  label={detail.priceInfo.label}
                  accent={detail.accent}
                />
              </div>
            ) : null}

            {detail.features.length > 0 ? (
              <ul className={styles.dialogFeatures}>
                {detail.features.map((f) => (
                  <li key={f}>
                    <span className={styles.featCheck} aria-hidden>
                      <Check size={11} strokeWidth={2.5} />
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
            ) : (
              <p className={styles.dialogEmpty}>امکانات این موضوع به‌زودی.</p>
            )}

            <div className={styles.dialogPrice}>
              <span>قیمت</span>
              <div>
                {detail.priceInfo.active ? (
                  <del>{formatRial(detail.priceInfo.original)}</del>
                ) : null}
                <strong>
                  {formatRial(
                    detail.priceInfo.active
                      ? detail.priceInfo.finalPrice
                      : detail.pkg.price,
                  )}
                </strong>
                <em>{currency}</em>
              </div>
            </div>

            <div className={styles.dialogActions}>
              <button
                type="button"
                className={styles.dialogOrder}
                disabled={ordering}
                onClick={() => {
                  closeDetail()
                  goOrder(new Set([detail.pkg.id]), new Set())
                }}
              >
                <Zap size={14} strokeWidth={2.2} />
                {ordering ? 'در حال انتقال…' : 'سفارش این موضوع'}
              </button>
            </div>
          </>
        ) : null}

        {detail?.kind === 'item' ? (
          <>
            {detail.item.desc ? (
              <p className={styles.dialogDesc}>{detail.item.desc}</p>
            ) : (
              <p className={styles.dialogEmpty}>توضیح بیشتری ثبت نشده.</p>
            )}
            <div className={styles.dialogPrice}>
              <span>قیمت</span>
              <div>
                <strong>{formatRial(detail.item.price)}</strong>
                <em>{currency}</em>
              </div>
            </div>
            <button
              type="button"
              className={styles.dialogOrder}
              disabled={ordering}
              onClick={() => {
                closeDetail()
                goOrder(new Set(), new Set([detail.item.type]))
              }}
            >
              <Zap size={14} strokeWidth={2.2} />
              {ordering ? 'در حال انتقال…' : 'سفارش'}
            </button>
          </>
        ) : null}
      </DetailsDialog>
    </section>
  )
}
