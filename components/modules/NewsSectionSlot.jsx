'use client'

import React from 'react'
import ModuleGate from '@/components/modules/ModuleGate'
import NewsSection from '@/modules/home/components/sections/news/NewsSection'
import { SITE_MODULE_KEYS } from '@/config/siteModules'

/** بخش اخبار صفحه اصلی — وضعیت از /adminweb (ماژول news_section ⊂ news) */
export default function NewsSectionSlot(props) {
  return (
    <ModuleGate moduleKey={SITE_MODULE_KEYS.NEWS_SECTION}>
      <NewsSection {...props} />
    </ModuleGate>
  )
}
