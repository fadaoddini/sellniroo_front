// modules/inventory/components/common/ConfirmDialog.jsx
'use client';

import React from 'react';
import { AlertTriangle } from 'lucide-react';
import Modal from './Modal';
import styles from '@/styles/modules/InventoryCommon.module.css';

const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'تأیید حذف',
  message = 'آیا از حذف این مورد اطمینان دارید؟',
  confirmText = 'حذف',
  cancelText = 'انصراف',
  confirmColor = 'danger',
  loading = false,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className={styles.confirmDialog}>
        <div className={styles.confirmIcon}>
          <AlertTriangle size={40} />
        </div>
        <p className={styles.confirmMessage}>{message}</p>
        <div className={styles.confirmActions}>
          <button
            onClick={onClose}
            className={styles.confirmCancel}
            disabled={loading}
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`${styles.confirmBtn} ${
              confirmColor === 'danger' ? styles.confirmDanger : styles.confirmSuccess
            }`}
            disabled={loading}
          >
            {loading ? '...' : confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;