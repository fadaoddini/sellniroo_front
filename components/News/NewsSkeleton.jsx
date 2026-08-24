// components/News/NewsSkeleton.jsx

import React from 'react';
import styles from './News.module.css';

const NewsSkeleton = ({ count = 6 }) => {
  return (
    <div className={styles.skeletonGrid}>
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
  );
};

export default NewsSkeleton;