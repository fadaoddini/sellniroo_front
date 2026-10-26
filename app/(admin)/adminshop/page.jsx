// app/(admin)/adminshop — چیدمان فروشگاه و سینگل محصول
'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import {
  ShoppingBag,
  LayoutTemplate,
  FileText,
  Store,
  Package,
} from 'lucide-react'
import OwnerPortalShell from '@/components/Admin/OwnerPortalShell'
import useOwnerGate from '@/components/Admin/useOwnerGate'
import SiteSkeletonStudio from '../adminweb/SiteSkeletonStudio'
import {
  fetchSiteModules,
  clearSiteModulesCache,
} from '@/services/siteModules'
import { SITE_MODULE_KEYS } from '@/config/siteModules'
import styles from '../adminweb/AdminWeb.module.css'
import portalStyles from '@/components/Admin/OwnerPortal.module.css'

const TABS = [
  { id: 'single', label: 'چیدمان سینگل محصول', icon: LayoutTemplate },
  { id: 'list', label: 'چیدمان لیست فروشگاه', icon: Store },
]

const SHOP_LINKS = [
  { href: '/shop-manage', label: 'مدیریت محصولات', desc: 'کاتالوگ', icon: Package },
  { href: '/product-single', label: 'تنظیمات سینگل', desc: 'اجزای محصول', icon: FileText },
  { href: '/shop', label: 'صفحه فروشگاه', desc: 'نمایش عمومی', icon: ShoppingBag },
  { href: '/payment-manage', label: 'ماژول پرداخت', desc: 'درگاه', icon: Store },
]

export default function AdminShopPage() {
  const gate = useOwnerGate('/adminshop')
  const searchParams = useSearchParams()
  const [moduleMap, setModuleMap] = useState({})
  const [modulesReady, setModulesReady] = useState(false)
  const initialTab = searchParams?.get('tab') === 'list' ? 'list' : 'single'
  const [tab, setTab] = useState(initialTab)
  const shopKey = SITE_MODULE_KEYS.SHOP
  const shopKnown = Object.prototype.hasOwnProperty.call(moduleMap, shopKey)
  const shopOn = !modulesReady || !shopKnown || !!moduleMap[shopKey]

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
                  onClick={() => setTab(t.id)}
                >
                  <Icon size={14} />
                  {t.label}
                </button>
              )
            })}
          </div>

          {tab === 'single' ? (
            <SiteSkeletonStudio
              moduleMap={moduleMap}
              standalone
              layoutMode="product_single"
            />
          ) : null}
          {tab === 'list' ? (
            <SiteSkeletonStudio
              moduleMap={moduleMap}
              standalone
              layoutMode="shop_list"
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
