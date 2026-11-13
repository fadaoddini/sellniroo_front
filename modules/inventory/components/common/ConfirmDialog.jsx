// modules/inventory/components/common/ConfirmDialog.jsx

'use client';

import React from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import styles from './common.module.css';

const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'تایید', loading = false }) => {
  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={`${styles.modal} ${styles.modalSm}`} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>{title}</h2>
          <button className={styles.modalClose} onClick={onClose}>✕</button>
        </div>
        <div className={styles.modalBody}>
          <div className={styles.confirmDialog}>
            <div className={styles.confirmIcon}>
              <AlertTriangle size={48} />
            </div>
            <p className={styles.confirmMessage}>{message}</p>
            <div className={styles.confirmActions}>
              <button className={styles.confirmCancel} onClick={onClose} disabled={loading}>
                انصراف
              </button>
              <button className={`${styles.confirmBtn} ${styles.confirmDanger}`} onClick={onConfirm} disabled={loading}>
                {loading ? <Loader2 size={16} className={styles.spinnerSmall} /> : confirmText}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;