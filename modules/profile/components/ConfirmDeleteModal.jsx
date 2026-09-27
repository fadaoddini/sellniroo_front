// modules/profile/components/ConfirmDeleteModal.jsx
"use client";

import { useEffect } from "react";
import styles from "../styles/ConfirmDeleteModal.module.css";
import { AlertTriangle, Loader2, X } from "lucide-react";

const ConfirmDeleteModal = ({
  title = "تایید حذف",
  message = "آیا از انجام این عملیات مطمئن هستید؟",
  onConfirm,
  onCancel,
  loading = false,
}) => {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape" && !loading) onCancel();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [loading, onCancel]);

  return (
    <div className={styles.overlay} onClick={onCancel}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button
          className={styles.closeBtn}
          onClick={onCancel}
          disabled={loading}
          aria-label="بستن"
        >
          <X size={16} />
        </button>

        <div className={styles.iconWrapper}>
          <AlertTriangle size={32} />
        </div>

        <h3 className={styles.title}>{title}</h3>
        <p className={styles.message}>{message}</p>

        <div className={styles.actions}>
          <button
            className={styles.cancelBtn}
            onClick={onCancel}
            disabled={loading}
          >
            انصراف
          </button>
          <button
            className={styles.confirmBtn}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 size={14} className={styles.spin} />
                <span>در حال حذف...</span>
              </>
            ) : (
              "بله، حذف کن"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteModal;