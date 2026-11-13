// modules/gym/components/modals/Modal.jsx
'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import styles from './Modal.module.css';

/**
 * @param {'default' | 'nested'} layer
 * nested = روی مودال‌های دیگر (مثلاً انتخاب از کتابخانه)
 */
export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  layer = 'default',
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  const sizeClass =
    styles[`modal${size.charAt(0).toUpperCase() + size.slice(1)}`] ||
    styles.modalMd;

  return createPortal(
    <div
      className={`${styles.modalOverlay} ${
        layer === 'nested' ? styles.modalOverlayNested : ''
      }`}
      onClick={onClose}
      role="presentation"
    >
      <div
        className={`${styles.modal} ${sizeClass}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className={styles.modalHeader}>
          <h3>{title}</h3>
          <button
            type="button"
            className={styles.modalClose}
            onClick={onClose}
            aria-label="بستن"
          >
            <X size={20} />
          </button>
        </div>
        <div className={styles.modalBody}>{children}</div>
      </div>
    </div>,
    document.body,
  );
}
