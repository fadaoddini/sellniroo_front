'use client'

import React, { useCallback, useEffect, useState } from 'react'
import JobListingsSlot from '@/components/modules/JobListingsSlot'
import NewsSectionSlot from '@/components/modules/NewsSectionSlot'
import CTASectionSlot from '@/components/modules/CTASectionSlot'
import VideoInstaSlot from '@/components/modules/VideoInstaSlot'
import CatalogSlot from '@/components/modules/CatalogSlot'
import {
  SITE_MODULE_KEYS,
  HOMEPAGE_ORDERABLE_KEYS,
  sortHomepageModuleKeys,
} from '@/config/siteModules'
import { fetchSiteModules } from '@/services/siteModules'

import styles from '../styles/HomePage.module.css'

function VideoInstaSectionSlot() {
  return <VideoInstaSlot variant="section" />
}

const SLOT_BY_KEY = {
  [SITE_MODULE_KEYS.NEWS_SECTION]: NewsSectionSlot,
  [SITE_MODULE_KEYS.VIDEOINSTA]: VideoInstaSectionSlot,
  [SITE_MODULE_KEYS.CATALOG]: CatalogSlot,
  [SITE_MODULE_KEYS.JOB_LISTINGS]: JobListingsSlot,
  [SITE_MODULE_KEYS.CTA_SECTION]: CTASectionSlot,
}

const DEFAULT_ORDER = [...HOMEPAGE_ORDERABLE_KEYS]

const HomePage = ({ seoSubtitle = '', siteName = '' }) => {
  const [order, setOrder] = useState(DEFAULT_ORDER)

  const refreshOrder = useCallback(async () => {
    try {
      const { list } = await fetchSiteModules({ force: false })
      setOrder(sortHomepageModuleKeys(list))
    } catch {
      setOrder(DEFAULT_ORDER)
    }
  }, [])

  useEffect(() => {
    refreshOrder()
    const onChange = () => {
      fetchSiteModules({ force: true }).then(({ list }) => {
        setOrder(sortHomepageModuleKeys(list))
      }).catch(() => {})
    }
    window.addEventListener('site-modules-changed', onChange)
    return () => window.removeEventListener('site-modules-changed', onChange)
  }, [refreshOrder])

  return (
    <div className={styles.homeContainer}>
      {seoSubtitle ? (
        <h2 className="sr-only">{seoSubtitle}</h2>
      ) : siteName ? (
        <h2 className="sr-only">{siteName}</h2>
      ) : null}
      {order.map((key) => {
        const Slot = SLOT_BY_KEY[key]
        if (!Slot) return null
        return <Slot key={key} />
      })}
    </div>
  )
}

export default HomePage
