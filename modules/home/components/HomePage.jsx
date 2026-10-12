'use client'

import React from 'react'
import JobListingsSlot from '@/components/modules/JobListingsSlot'
import NewsSectionSlot from '@/components/modules/NewsSectionSlot'
import CTASectionSlot from '@/components/modules/CTASectionSlot'
import VideoInstaSlot from '@/components/modules/VideoInstaSlot'
import CatalogSlot from '@/components/modules/CatalogSlot'

import styles from '../styles/HomePage.module.css'

const HomePage = ({ seoSubtitle = '', siteName = '' }) => {
  return (
    <div className={styles.homeContainer}>
      {seoSubtitle ? (
        <h2 className="sr-only">{seoSubtitle}</h2>
      ) : siteName ? (
        <h2 className="sr-only">{siteName}</h2>
      ) : null}
      <NewsSectionSlot />
      <VideoInstaSlot variant="section" />
      <CatalogSlot />
      <JobListingsSlot />
      <CTASectionSlot />
    </div>
  )
}

export default HomePage
