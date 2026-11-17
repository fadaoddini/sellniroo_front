// app/(admin)/adminshop — چیدمان فروشگاه و سینگل محصول
'use client'

import React, { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  ShoppingBag,
  LayoutTemplate,
  FileText,
  Store,
  Package,
  Dumbbell,
  Wrench,
} from 'lucide-react'
import OwnerPortalShell from '@/components/Admin/OwnerPortalShell'
import useOwnerGate from '@/components/Admin/useOwnerGate'
import SiteSkeletonStudio from '../adminweb/SiteSkeletonStudio'
import {
  fetchSiteModules,
  clearSiteModulesCache,
} from '@/services/siteModules'
import { SITE_MODULE_KEYS } from '@/config/siteModules'
import {
  SHOP_LAYOUT_MODE_DEFS,
  productSingleStudioMode,
  resolveActiveShopLayoutMode,
  shopListStudioMode,
} from '@/config/shopLayoutModes'
import styles from '../adminweb/AdminWeb.module.css'
import portalStyles from '@/components/Admin/OwnerPortal.module.css'

const TABS = [
  { id: 'single', label: 'چیدمان سینگل محصول', icon: LayoutTemplate },
  { id: 'list', label: 'چیدمان لیست فروشگاه', icon: Store },
]

const MODE_ICONS = {
  default: Store,
  sadra: Wrench,
  gym_bodybuilding: Dumbbell,
}

const SHOP_LINKS = [
  { href: '/dashboard/my-shop?tab=products', label: 'محصولات', desc: 'کاتالوگ فروشگاه من', icon: Package },
  { href: '/product-single', label: 'سینگل محصول', desc: 'تنظیمات صفحه محصول', icon: FileText },
  { href: '/shop-categories', label: 'دسته‌ها', desc: 'دسته‌بندی محصولات', icon: FileText },
  { href: '/dashboard/shop-accounting', label: 'حسابداری', desc: 'سود و زیان و دفتر', icon: Store },
  { href: '/shop', label: 'ویترین', desc: 'نمایش عمومی', icon: ShoppingBag },
  { href: '/payment-manage', label: 'پرداخت', desc: 'درگاه', icon: Store },
]

export default function AdminShopPage() {
  const gate = useOwnerGate('/adminshop')
  const router = useRouter()
  const searchParams = useSearchParams()
  const [moduleMap, setModuleMap] = useState({})
  const [modulesReady, setModulesReady] = useState(false)
  const initialTab = searchParams?.get('tab') === 'list' ? 'list' : 'single'
  const [tab, setTab] = useState(initialTab)
  const shopKey = SITE_MODULE_KEYS.SHOP
  const shopKnown = Object.prototype.hasOwnProperty.call(moduleMap, shopKey)
  const shopOn = !modulesReady || !shopKnown || !!moduleMap[shopKey]

  const activeMode = useMemo(
    () => resolveActiveShopLayoutMode(moduleMap),
    [moduleMap],
  )

  const layoutVariant = useMemo(() => {
    const q = searchParams?.get('mode')
    if (q && SHOP_LAYOUT_MODE_DEFS.some((d) => d.id === q)) return q
    return activeMode
  }, [searchParams, activeMode])

  const listLayoutMode = shopListStudioMode(layoutVariant)
  const singleLayoutMode = productSingleStudioMode(layoutVariant)

  useEffect(() => {
    if (!gate.allowed) return undefined
    let cancelled = false
    ;(async () => {
      try {
        clearSiteModulesCache()
        const { map } = await fetchSiteModules({ force: true })
        if (!cancelled) {
          setModuleMap(map || {})
          setModulesReady(true)
        }
      } catch {
        if (!cancelled) {
          setModuleMap({})
          setModulesReady(true)
        }
      }
    })()
    const onChange = () => {
      clearSiteModulesCache()
      fetchSiteModules({ force: true })
        .then(({ map }) => {
          setModuleMap(map || {})
          setModulesReady(true)
        })
        .catch(() => {})
    }
    window.addEventListener('site-modules-changed', onChange)
    return () => {
      cancelled = true
      window.removeEventListener('site-modules-changed', onChange)
    }
  }, [gate.allowed])

  const setMode = (modeId) => {
    const params = new URLSearchParams(searchParams?.toString() || '')
    params.set('tab', tab)
    params.set('mode', modeId)
    router.replace(`/adminshop?${params.toString()}`, { scroll: false })
  }

  const onTab = (id) => {
    setTab(id)
    const params = new URLSearchParams(searchParams?.toString() || '')
    params.set('tab', id)
    if (!params.get('mode')) params.set('mode', activeMode)
    router.replace(`/adminshop?${params.toString()}`, { scroll: false })
  }

  return (
    <OwnerPortalShell
      brand="web"
      brandAccent="admin"
      tagline="چیدمان سینگل محصول، لیست فروشگاه و ویجت‌های ویترین"
      wide
      {...gate}
    >
      {gate.allowed && modulesReady && !shopOn ? (
        <div className={styles.section}>
          <p className={styles.moduleIntro}>
            ماژول فروشگاه خاموش است — چیدمان را می‌توانید بسازید؛ برای نمایش از{' '}
            <Link href="/adminmodule">adminmodule</Link> روشن کنید.
          </p>
        </div>
      ) : null}

      {gate.allowed ? (
        <>
          <div className={portalStyles.tabsRow}>
            {TABS.map((t) => {
              const Icon = t.icon
              return (
                <button
                  key={t.id}
                  type="button"
                  className={`${portalStyles.tabBtn} ${
                    tab === t.id ? portalStyles.tabBtnOn : ''
                  }`}
                  onClick={() => onTab(t.id)}
                >
                  <Icon size={14} />
                  {t.label}
                </button>
              )
            })}
          </div>

          <div className={portalStyles.tabsRow} style={{ marginTop: '0.65rem' }}>
            {SHOP_LAYOUT_MODE_DEFS.map((mode) => {
              const Icon = MODE_ICONS[mode.id] || Store
              const isOn = layoutVariant === mode.id
              const isLive = activeMode === mode.id
              return (
                <button
                  key={mode.id}
                  type="button"
                  className={`${portalStyles.tabBtn} ${
                    isOn ? portalStyles.tabBtnOn : ''
                  }`}
                  onClick={() => setMode(mode.id)}
                  title={mode.desc}
                  style={
                    isOn
                      ? {
                          borderColor: mode.accent,
                          boxShadow: `0 0 0 1px ${mode.accent}33`,
                        }
                      : undefined
                  }
                >
                  <Icon size={14} />
                  {mode.label}
                  {isLive ? (
                    <small style={{ opacity: 0.85, marginInlineStart: 4 }}>
                      · فعال
                    </small>
                  ) : null}
                </button>
              )
            })}
          </div>

          <p className={styles.moduleIntro} style={{ marginTop: '0.75rem' }}>
            {tab === 'single'
              ? layoutVariant === 'sadra'
                ? 'سینگل صدرا: منو با رزرو تعمیر روی /shop/products.'
                : layoutVariant === 'gym_bodybuilding'
                  ? 'سینگل باشگاه: تم و منوی باشگاه روی /shop/products.'
                  : 'سینگل پیش‌فرض فروشگاه / مارکت.'
              : layoutVariant === 'sadra'
                ? 'لیست صدرا: منو با رزرو تعمیر روی /shop.'
                : layoutVariant === 'gym_bodybuilding'
                  ? 'لیست باشگاه: چیدمان و منوی باشگاه روی /shop.'
                  : 'لیست پیش‌فرض فروشگاه / مارکت.'}
            {activeMode === layoutVariant
              ? ' این حالت هم‌اکنون روی سایت زنده است.'
              : ` الان سایت روی حالت «${
                  SHOP_LAYOUT_MODE_DEFS.find((d) => d.id === activeMode)?.label ||
                  activeMode
                }» است.`}
          </p>

          {tab === 'single' ? (
            <SiteSkeletonStudio
              key={singleLayoutMode}
              moduleMap={moduleMap}
              standalone
              layoutMode={singleLayoutMode}
            />
          ) : null}
          {tab === 'list' ? (
            <SiteSkeletonStudio
              key={listLayoutMode}
              moduleMap={moduleMap}
              standalone
              layoutMode={listLayoutMode}
            />
          ) : null}
        </>
      ) : null}

      <section className={portalStyles.sectionBlock} style={{ marginTop: '1.25rem' }}>
        <h2 className={portalStyles.sectionTitle}>ابزارهای فروشگاه</h2>
        <div className={styles.linkGrid}>
          {SHOP_LINKS.map((item) => {
            const Icon = item.icon
            return (
              <Link key={item.href} href={item.href} className={styles.linkCard}>
                <span className={styles.linkIcon}>
                  <Icon size={20} />
                </span>
                <span className={styles.linkText}>
                  <strong>{item.label}</strong>
                  <small>{item.desc}</small>
                </span>
              </Link>
            )
          })}
        </div>
      </section>
    </OwnerPortalShell>
  )
}
