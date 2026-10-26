// components/News/NewsSkeleton.jsx

import React from 'react'
import styles from './News.module.css'

const COL_CLASS = {
  1: styles.newsGridCols1,
  2: styles.newsGridCols2,
  3: styles.newsGridCols3,
  4: styles.newsGridCols4,
}

const NewsSkeleton = ({ count = 6, columns }) => {
  const colClass = columns ? COL_CLASS[columns] : ''
  return (
    <div className={`${styles.skeletonGrid} ${colClass || ''}`.trim()}>
      {[...Array(count)].map((_, index) => (
        <div key={index} className={styles.skeletonCard}>
          <div className={styles.skeletonImage} />
          <div className={styles.skeletonContent}>
            <div className={styles.skeletonTitle} />
            <div className={styles.skeletonExcerpt}>
              <div className={styles.skeletonLine} />
              <div className={styles.skeletonLine} />
            </div>
            <div className={styles.skeletonFooter}>
              <div className={styles.skeletonDate} />
              <div className={styles.skeletonSource} />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default NewsSkeleton