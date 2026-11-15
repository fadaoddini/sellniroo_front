'use client'

import React, { useMemo, useState } from 'react'
import { Dumbbell, LayoutTemplate, Store, Wrench } from 'lucide-react'
import SiteSkeletonStudio from '../adminweb/SiteSkeletonStudio'
import {
  SHOP_LAYOUT_MODE_DEFS,
  productSingleStudioMode,
  resolveActiveShopLayoutMode,
  shopListStudioMode,
} from '@/config/shopLayoutModes'
import styles from '../adminweb/AdminWeb.module.css'
import portalStyles from '@/components/Admin/OwnerPortal.module.css'

const SUBS = [
  { id: 'single', label: 'چیدمان سینگل محصول', icon: LayoutTemplate },
  { id: 'list', label: 'چیدمان لیست فروشگاه', icon: Store },
]

const MODE_ICONS = {
  default: Store,
  sadra: Wrench,
  gym_bodybuilding: Dumbbell,
}

export default function ShopDesignEmbed({ moduleMap = {} }) {
  const [sub, setSub] = useState('single')
  const activeMode = useMemo(
    () => resolveActiveShopLayoutMode(moduleMap),
    [moduleMap],
  )
  const [variant, setVariant] = useState(null)
  const layoutVariant = variant || activeMode
  const listLayoutMode = shopListStudioMode(layoutVariant)
  const singleLayoutMode = productSingleStudioMode(layoutVariant)

  return (
    <>
      <div className={portalStyles.tabsRow}>
        {SUBS.map((t) => {
          const Icon = t.icon
          return (
            <button
              key={t.id}
              type="button"
              className={`${portalStyles.tabBtn} ${
                sub === t.id ? portalStyles.tabBtnOn : ''
              }`}
              onClick={() => setSub(t.id)}
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
              onClick={() => setVariant(mode.id)}
              title={mode.desc}
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
        چیدمان فروشگاه همین‌جا ذخیره می‌شود؛ نیازی به صفحه جدا نیست.
      </p>
      {sub === 'single' ? (
        <SiteSkeletonStudio
          key={singleLayoutMode}
          moduleMap={moduleMap}
          standalone
          layoutMode={singleLayoutMode}
        />
      ) : (
        <SiteSkeletonStudio
          key={listLayoutMode}
          moduleMap={moduleMap}
          standalone
          layoutMode={listLayoutMode}
        />
      )}
    </>
  )
}
