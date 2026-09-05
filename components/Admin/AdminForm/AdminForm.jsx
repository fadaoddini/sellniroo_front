// src/components/Admin/AdminForm/AdminForm.jsx
'use client'

import React from 'react'
import styles from './AdminForm.module.css'

const AdminForm = ({ 
  children, 
  onSubmit, 
  onCancel, 
  submitLabel = 'ذخیره',
  cancelLabel = 'انصراف',
  isLoading = false
}) => {
  return (
    <form className={styles.adminForm} onSubmit={onSubmit}>
      <div className={styles.formBody}>
        {children}
      </div>
      <div className={styles.formActions}>
        <button 
          type="button" 
          className={styles.cancelBtn}
          onClick={onCancel}
        >
          {cancelLabel}
        </button>
        <button 
          type="submit" 
          className={styles.submitBtn}
          disabled={isLoading}
        >
          {isLoading ? 'در حال ذخیره...' : submitLabel}
        </button>
      </div>
    </form>
  )
}

export default AdminForm

// فیلدهای فرم
export const FormGroup = ({ label, children, error, required }) => (
  <div className={styles.formGroup}>
    <label className={styles.formLabel}>
      {label}
      {required && <span className={styles.required}>*</span>}
    </label>
    {children}
    {error && <span className={styles.formError}>{error}</span>}
  </div>
)

export const FormRow = ({ children }) => (
  <div className={styles.formRow}>
    {children}
  </div>
)