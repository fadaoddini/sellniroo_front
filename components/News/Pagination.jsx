// components/News/Pagination.jsx
'use client'

import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faChevronLeft,
  faChevronRight,
  faEllipsis,
} from '@fortawesome/free-solid-svg-icons'
import styles from './News.module.css'

const STYLE_CLASS = {
  classic: styles.pagClassic,
  pills: styles.pagPills,
  minimal: styles.pagMinimal,
  bar: styles.pagBar,
}

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  variant = 'classic',
}) => {
  if (totalPages <= 1) return null

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page)
    }
  }

  const getVisiblePages = () => {
    const delta = 2
    const range = []
    const rangeWithDots = []
    let l

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - delta && i <= currentPage + delta)
      ) {
        range.push(i)
      }
    }

    for (let i = 0; i < range.length; i++) {
      if (l) {
        if (range[i] - l === 2) {
          rangeWithDots.push(l + 1)
        } else if (range[i] - l !== 1) {
          rangeWithDots.push('...')
        }
      }
      rangeWithDots.push(range[i])
      l = range[i]
    }

    return rangeWithDots
  }

  const styleClass = STYLE_CLASS[variant] || STYLE_CLASS.classic
  const isMinimal = variant === 'minimal'

  return (
    <div
      className={`${styles.pagination} ${styleClass}`}
      role="navigation"
      aria-label="صفحه‌بندی"
    >
      <button
        type="button"
        className={`${styles.pageBtn} ${styles.pageBtnNav}`}
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="صفحه قبلی"
      >
        <FontAwesomeIcon icon={faChevronRight} />
        {isMinimal ? <span className={styles.pagNavLabel}>قبلی</span> : null}
      </button>

      {isMinimal ? (
        <span className={styles.pagStatus}>
          صفحه {currentPage} از {totalPages}
        </span>
      ) : (
        getVisiblePages().map((page, index) => {
          if (page === '...') {
            return (
              <span key={`dots-${index}`} className={styles.pageDots}>
                <FontAwesomeIcon icon={faEllipsis} />
              </span>
            )
          }
          return (
            <button
              type="button"
              key={page}
              className={`${styles.pageBtn} ${
                page === currentPage ? styles.pageBtnActive : ''
              }`}
              onClick={() => handlePageChange(page)}
              aria-current={page === currentPage ? 'page' : undefined}
            >
              {page}
            </button>
          )
        })
      )}

      <button
        type="button"
        className={`${styles.pageBtn} ${styles.pageBtnNav}`}
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="صفحه بعدی"
      >
        {isMinimal ? <span className={styles.pagNavLabel}>بعدی</span> : null}
        <FontAwesomeIcon icon={faChevronLeft} />
      </button>
    </div>
  )
}

export default Pagination
