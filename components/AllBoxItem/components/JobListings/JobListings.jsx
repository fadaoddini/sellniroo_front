// src/components/AllBoxItem/components/JobListings/JobListings.jsx

'use client'

import React from 'react'
import JobCard from '../JobCard/JobCard'
import styles from './JobListings.module.css'

const JobListings = ({ jobs, totalItems, viewMode = 'grid-2', children }) => {
  const getGridClass = () => {
    switch (viewMode) {
      case 'grid-3':
        return styles.grid3
      case 'image-left':
        return styles.imageLeft
      case 'list':
        return styles.list
      default:
        return styles.grid2
    }
  }

  return (
    <div className={styles.listingsSection}>
      <div className={styles.listingsGridWrapper}>
        <div className={`${styles.listingsGrid} ${getGridClass()}`}>
          {jobs.length > 0 ? (
            jobs.map((job) => (
              <JobCard key={job.id} job={job} viewMode={viewMode} />
            ))
          ) : (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>🔍</div>
              <p className={styles.emptyText}>هیچ آگهی با این فیلترها یافت نشد</p>
              {children}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default JobListings