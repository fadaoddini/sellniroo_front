'use client'

import React, { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Boxes, Calculator, Check, Zap } from 'lucide-react'
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

function PhonePreview({ accent, title, icon: Icon }) {
  return (
    <div className={styles.phone} style={{ '--accent': accent }} aria-hidden>
      <div className={styles.phoneGlow} />
      <div className={styles.phoneBody}>
        <div className={styles.phoneNotch} />
        <div className={styles.phoneScreen}>
          <div className={styles.phoneHero}>
            <span className={styles.phoneHeroIcon}>
              <Icon size={16} strokeWidth={1.7} />
            </span>
            <strong>{title}</strong>
          </div>
          <div className={styles.phoneBars}>
            <i />
            <i />
          </div>
          <div className={styles.phoneCards}>
            <span />
            <span />
            <span />
            <span />
          </div>
          <div className={styles.phonePriceBar} />
        </div>
        <div className={styles.phoneHome} />
      </div>
    </div>
  )
}

export default function ReboPricing({ settings: raw = {} }) {
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const { settings: s, style, visible } = useReboNormalized(raw, 'rebo_pricing')
  const { packages, standalone, groups, currency, hasPricing } =
    useReboPricingState()
  const [selectedPkgs, setSelectedPkgs] = useState(() => new Set())
  const [selectedItems, setSelectedItems] = useState(() => new Set())
  const [ordering, setOrdering] = useState(false)

  const paidPackages = useMemo(
    () => packages.filter(isPaidPackage),
    [packages],
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

  const total = useMemo(() => {
    let sum = 0
    paidPackages.forEach((pkg) => {
      if (!selectedPkgs.has(pkg.id)) return
      sum += getPackagePriceInfo(pkg).finalPrice
    })
    paidStandalone.forEach((it) => {
      if (!selectedItems.has(it.type)) return
      sum += Math.max(0, Number(it.price) || 0)
    })
    return sum
  }, [paidPackages, paidStandalone, selectedPkgs, selectedItems])

  const selectedCount = selectedPkgs.size + selectedItems.size

  if (!visible || !showPricing) return null

  const subtitle =
    s.subtitle ||
    `بسته‌ها را انتخاب کنید؛ با یک کلیک در پروفایل ثبت سفارش می‌شود — مبلغ به ${currency}.`

  const togglePkg = (id) => {
    setSelectedPkgs((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleItem = (type) => {
    setSelectedItems((prev) => {
      const next = new Set(prev)
      if (next.has(type)) next.delete(type)
      else next.add(type)
      return next
    })
  }

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
          price: info.active ? info.finalPrice : Math.max(0, Number(pkg.price) || 0),
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

  const goOrder = (pkgIds = selectedPkgs, itemTypes = selectedItems) => {
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

        <div className={styles.layout}>
          <div className={styles.groups}>
            {paidPackages.length > 0 ? (
              <div>
                {s.show_topics_heading !== false ? (
                  <h3 className={styles.groupTitle}>
                    <i />
                    موضوع‌ها
                  </h3>
                ) : null}
                <div className={styles.pkgGrid}>
                  {paidPackages.map((pkg, idx) => {
                    const Icon = resolveLucideIcon(pkg.icon, Boxes)
                    const on = selectedPkgs.has(pkg.id)
                    const features = getPackageFeatureLabels(pkg)
                    const priceInfo = getPackagePriceInfo(pkg)
                    const accent = ACCENTS[idx % ACCENTS.length]
                    return (
                      <article
                        key={pkg.id}
                        className={`${styles.pkgCard} ${on ? styles.pkgOn : ''}`}
                        style={{ '--accent': accent }}
                      >
                        <div className={styles.media}>
                          <PhonePreview
                            accent={accent}
                            title={pkg.name}
                            icon={Icon}
                          />
                        </div>

                        <div className={styles.body}>
                          {priceInfo.active ? (
                            <div className={styles.saleWrap}>
                              <ReboDiscountCountdown
                                endsAt={priceInfo.endsAt}
                                percent={priceInfo.percent}
                                label={priceInfo.label}
                                accent={accent}
                              />
                            </div>
                          ) : null}

                          <button
                            type="button"
                            className={styles.pkgSelect}
                            onClick={() => togglePkg(pkg.id)}
                            aria-pressed={on}
                          >
                            <span className={styles.check} aria-hidden>
                              {on ? (
                                <Check size={13} strokeWidth={2.6} />
                              ) : null}
                            </span>
                            <span className={styles.iconWrap}>
                              <Icon size={16} strokeWidth={1.75} />
                            </span>
                            <span className={styles.meta}>
                              <strong>{pkg.name}</strong>
                              {pkg.desc ? <small>{pkg.desc}</small> : null}
                            </span>
                          </button>

                          {features.length > 0 ? (
                            <ul className={styles.features}>
                              {features.slice(0, 5).map((f) => (
                                <li key={f}>
                                  <span className={styles.featCheck} aria-hidden>
                                    <Check size={11} strokeWidth={2.5} />
                                  </span>
                                  {f}
                                </li>
                              ))}
                            </ul>
                          ) : null}

                          <div className={styles.priceRow}>
                            <div className={styles.priceRowMeta}>
                              <span className={styles.priceRowLabel}>
                                {priceInfo.active ? 'قیمت با تخفیف' : 'قیمت موضوع'}
                              </span>
                              {priceInfo.active ? (
                                <span className={styles.priceBadge}>
                                  {priceInfo.percent.toLocaleString('fa-IR')}٪ تخفیف
                                </span>
                              ) : null}
                            </div>
                            <div className={styles.priceRowValue}>
                              {priceInfo.active ? (
                                <del className={styles.oldPrice}>
                                  {formatRial(priceInfo.original)}
                                </del>
                              ) : null}
                              <strong>
                                {formatRial(
                                  priceInfo.active
                                    ? priceInfo.finalPrice
                                    : pkg.price,
                                )}
                              </strong>
                              <em>{currency}</em>
                            </div>
                          </div>

                          <button
                            type="button"
                            className={styles.quickOrder}
                            disabled={ordering}
                            onClick={() => goOrder(new Set([pkg.id]), new Set())}
                          >
                            <Zap size={13} strokeWidth={2.2} />
                            سفارش یک‌کلیکه
                          </button>
                        </div>
                      </article>
                    )
                  })}
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
                    const on = selectedItems.has(it.type)
                    const accent = ACCENTS[(idx + 2) % ACCENTS.length]
                    return (
                      <article
                        key={it.type}
                        className={`${styles.pkgCard} ${on ? styles.pkgOn : ''}`}
                        style={{ '--accent': accent }}
                      >
                        <div className={styles.media}>
                          <PhonePreview
                            accent={accent}
                            title={it.label}
                            icon={Icon}
                          />
                        </div>
                        <div className={styles.body}>
                          <button
                            type="button"
                            className={styles.pkgSelect}
                            onClick={() => toggleItem(it.type)}
                            aria-pressed={on}
                          >
                            <span className={styles.check} aria-hidden>
                              {on ? (
                                <Check size={13} strokeWidth={2.6} />
                              ) : null}
                            </span>
                            <span className={styles.iconWrap}>
                              <Icon size={16} strokeWidth={1.75} />
                            </span>
                            <span className={styles.meta}>
                              <strong>{it.label}</strong>
                              {it.desc ? <small>{it.desc}</small> : null}
                            </span>
                          </button>

                          <div className={styles.priceRow}>
                            <div className={styles.priceRowMeta}>
                              <span className={styles.priceRowLabel}>قیمت</span>
                            </div>
                            <div className={styles.priceRowValue}>
                              <strong>{formatRial(it.price)}</strong>
                              <em>{currency}</em>
                            </div>
                          </div>
                        </div>
                      </article>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>

          <aside className={styles.summaryCol}>
            <div className={styles.summary}>
              <p className={styles.summaryLabel}>جمع برآوردی</p>
              <p className={styles.summaryTotal}>
                {formatRial(total)}
                <span>{currency}</span>
              </p>
              <p className={styles.summaryCount}>
                {selectedCount
                  ? `${selectedCount.toLocaleString('fa-IR')} مورد`
                  : 'انتخابی ندارید'}
              </p>
              <p className={styles.summaryNote}>
                هزینه دامنه و سرور جداگانه محاسبه می‌شود.
              </p>
              <div className={styles.summaryActions}>
                {s.show_cta !== false ? (
                  <button
                    type="button"
                    className={styles.cta}
                    disabled={ordering || selectedCount === 0}
                    onClick={() => goOrder()}
                  >
                    {ordering
                      ? 'در حال انتقال…'
                      : s.cta_label || 'ثبت سفارش در پروفایل'}
                    <ArrowLeft size={14} />
                  </button>
                ) : null}
                {selectedCount > 0 ? (
                  <button
                    type="button"
                    className={styles.clear}
                    onClick={() => {
                      setSelectedPkgs(new Set())
                      setSelectedItems(new Set())
                    }}
                  >
                    پاک کردن
                  </button>
                ) : null}
              </div>
              <p className={styles.hint}>
                انتخاب‌ها در پروفایل ثبت می‌شوند و تیم ربو پیگیری می‌کند.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </section>
  )
}
