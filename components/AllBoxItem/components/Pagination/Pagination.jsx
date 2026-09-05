// src/components/AllBoxItem/components/Pagination/Pagination.jsx

'use client'

import React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import styles from './Pagination.module.css'

const Pagination = ({ 
  currentPage, 
  totalPages, 
  totalItems, 
  itemsPerPage,
  onPageChange 
}) => {
  if (totalPages <= 1) return null

  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems)

  const renderPaginationButtons = () => {
    const buttons = []
    const maxVisibleButtons = 5
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisibleButtons / 2))
    let endPage = Math.min(totalPages, startPage + maxVisibleButtons - 1)
    
    if (endPage - startPage + 1 < maxVisibleButtons) {
      startPage = Math.max(1, endPage - maxVisibleButtons + 1)
    }

    // دکمه قبلی
    buttons.push(
      <button
        key="prev"
        className={`${styles.paginationBtn} ${currentPage === 1 ? styles.disabled : ''}`}
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="صفحه قبلی"
      >
        <ChevronRight size={16} />
      </button>
    )

    // دکمه اول
    if (startPage > 1) {
      buttons.push(
        <button
          key={1}
          className={`${styles.paginationBtn} ${currentPage === 1 ? styles.active : ''}`}
          onClick={() => onPageChange(1)}
        >
          ۱
        </button>
      )
      if (startPage > 2) {
        buttons.push(
          <span key="dots1" className={styles.paginationDots}>...</span>
        )
      }
    }

    // دکمه‌های وسط
    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button
          key={i}
          className={`${styles.paginationBtn} ${currentPage === i ? styles.active : ''}`}
          onClick={() => onPageChange(i)}
        >
          {i}
        </button>
      )
    }

    // دکمه آخر
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        buttons.push(
          <span key="dots2" className={styles.paginationDots}>...</span>
        )
      }
      buttons.push(
        <button
          key={totalPages}
          className={`${styles.paginationBtn} ${currentPage === totalPages ? styles.active : ''}`}
          onClick={() => onPageChange(totalPages)}
        >
          {totalPages}
        </button>
      )
    }

    // دکمه بعدی
    buttons.push(
      <button
        key="next"
        className={`${styles.paginationBtn} ${currentPage === totalPages ? styles.disabled : ''}`}
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="صفحه بعدی"
      >
        <ChevronLeft size={16} />
      </button>
    )

    return buttons
  }

  return (
    <div className={styles.paginationContainer}>
      <div className={styles.paginationInfo}>
        نمایش {startIndex + 1} تا {endIndex} از {totalItems} آگهی
      </div>
      <div className={styles.paginationWrapper}>
        {renderPaginationButtons()}
      </div>
    </div>
  )
}

export default Pagination