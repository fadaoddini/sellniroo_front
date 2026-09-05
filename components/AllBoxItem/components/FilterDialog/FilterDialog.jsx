// src/components/AllBoxItem/components/FilterDialog/FilterDialog.jsx

'use client'

import React from 'react'
import { X, Check } from 'lucide-react'
import { filterLabels, filterOptions } from '../../constants/filterOptions'
import styles from './FilterDialog.module.css'

const FilterDialog = ({
  isOpen,
  selectedKey,
  tempValue,
  onSelectOption,
  onConfirm,
  onClear,
  onClose
}) => {
  if (!isOpen || !selectedKey) return null

  return (
    <div className={styles.dialogOverlay} onClick={onClose}>
      <div className={styles.dialogContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.dialogHeader}>
          <h4 className={styles.dialogTitle}>
            {filterLabels[selectedKey]}
          </h4>
          <button 
            className={styles.dialogCloseBtn}
            onClick={onClose}
            aria-label="بستن"
          >
            <X size={20} />
          </button>
        </div>

        <div className={styles.dialogBody}>
          <div className={styles.dialogOptions}>
            {filterOptions[selectedKey].map((option) => (
              <button
                key={option}
                className={`${styles.dialogOption} ${tempValue === option ? styles.dialogOptionSelected : ''}`}
                onClick={() => onSelectOption(option)}
              >
                <span>{option}</span>
                {tempValue === option && <Check size={16} />}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.dialogFooter}>
          <button 
            className={styles.dialogClearBtn}
            onClick={onClear}
          >
            پاک کردن
          </button>
          <div className={styles.dialogActions}>
            <button 
              className={styles.dialogCancelBtn}
              onClick={onClose}
            >
              لغو
            </button>
            <button 
              className={styles.dialogConfirmBtn}
              onClick={onConfirm}
            >
              تایید
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FilterDialog