// app/sales/components/ConfirmDialog.jsx
'use client'

import React from 'react'
import { AlertTriangle, X, Loader2, CheckCircle, Info } from 'lucide-react'
import styles from '../styles/ConfirmDialog.module.css'

const ConfirmDialog = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message,
  confirmText = 'تایید',
  cancelText = 'انصراف',
  type = 'warning',
  loading = false
}) => {
  if (!isOpen) return null

  const getIcon = () => {
    switch (type) {
      case 'danger':
        return <AlertTriangle size={32} style={{ color: '#ff3b30' }} />
      case 'success':
        return <CheckCircle size={32} style={{ color: '#34c759' }} />
      case 'info':
        return <Info size={32} style={{ color: '#8b9aff' }} />
      default:
        return <AlertTriangle size={32} style={{ color: '#ff9500' }} />
    }
  }

  const getConfirmColor = () => {
    switch (type) {
      case 'danger':
        return '#ff3b30'
      case 'success':
        return '#34c759'
      case 'info':
        return '#8b9aff'
      default:
        return '#ff9500'
    }
  }

  return (
    <div className={styles.overlay} onClick={loading ? undefined : onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button 
          className={styles.closeBtn} 
          onClick={onClose}
          disabled={loading}
        >
          <X size={18} />
        </button>
        
        <div className={styles.iconWrapper}>
          {getIcon()}
        </div>
        
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.message}>{message}</p>
        
        <div className={styles.actions}>
          <button 
            className={styles.cancelBtn} 
            onClick={onClose}
            disabled={loading}
          >
            {cancelText}
          </button>
          <button 
            className={styles.confirmBtn}
            style={{ backgroundColor: getConfirmColor() }}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 size={16} className={styles.spinner} />
                در حال پردازش...
              </>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmDialog