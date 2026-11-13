// modules/inventory/components/alerts/AlertDetail.jsx

'use client';

import React from 'react';
import {
  Bell, Package, Building2, AlertTriangle, CheckCircle, 
  Clock, Calendar, MessageSquare, Edit, X, Check,
  AlertOctagon, Zap, AlertCircle as AlertCircleIcon,
} from 'lucide-react';
import styles from './alert.module.css';

const AlertDetail = ({ 
  alert, 
  onResolve, 
  onClose,
  getTypeBadge,
  getLevelBadge,
  getStatusBadge,
  getProductName,
  getWarehouseName,
  t = {},
}) => {
  if (!alert) return null;

  return (
    <div className={styles.alertDetail}>
      <div className={styles.detailHeader}>
        <div className={styles.detailIcon}>
          {alert.alert_type === 'LOW_STOCK' && <AlertCircleIcon size={32} className={styles.iconLowStock} />}
          {alert.alert_type === 'NO_STOCK' && <AlertOctagon size={32} className={styles.iconNoStock} />}
          {alert.alert_type === 'OVER_STOCK' && <Zap size={32} className={styles.iconOverStock} />}
        </div>
        <div className={styles.detailTitleSection}>
          <h3 className={styles.detailTitle}>
            {getProductName(alert.product)}
          </h3>
          <div className={styles.detailBadges}>
            {getTypeBadge(alert.alert_type)}
            {getLevelBadge(alert.level)}
            {getStatusBadge(alert.is_resolved)}
          </div>
        </div>
        <div className={styles.detailActions}>
          {!alert.is_resolved && (
            <button className={`${styles.primaryBtn} ${styles.resolveBtn}`} onClick={onResolve}>
              <Check size={16} />
              {t.resolve || 'برطرف کردن'}
            </button>
          )}
          <button className={styles.secondaryBtn} onClick={onClose}>
            <X size={16} />
            {t.close || 'بستن'}
          </button>
        </div>
      </div>

      <div className={styles.detailGrid}>
        <div className={styles.detailRow}>
          <span className={styles.detailLabel}>
            <MessageSquare size={14} /> پیام:
          </span>
          <span className={`${styles.detailValue} ${styles.detailMessage}`}>
            {alert.message}
          </span>
        </div>
        <div className={styles.detailRow}>
          <span className={styles.detailLabel}>
            <Package size={14} /> کالا:
          </span>
          <span className={styles.detailValue}>
            {getProductName(alert.product)}
          </span>
        </div>
        <div className={styles.detailRow}>
          <span className={styles.detailLabel}>
            <Building2 size={14} /> انبار:
          </span>
          <span className={styles.detailValue}>
            {getWarehouseName(alert.warehouse)}
          </span>
        </div>
        <div className={styles.detailRow}>
          <span className={styles.detailLabel}>
            <AlertTriangle size={14} /> نوع هشدار:
          </span>
          <span className={styles.detailValue}>
            {getTypeBadge(alert.alert_type)}
          </span>
        </div>
        <div className={styles.detailRow}>
          <span className={styles.detailLabel}>
            <AlertCircleIcon size={14} /> سطح هشدار:
          </span>
          <span className={styles.detailValue}>
            {getLevelBadge(alert.level)}
          </span>
        </div>
        <div className={styles.detailRow}>
          <span className={styles.detailLabel}>
            <CheckCircle size={14} /> وضعیت:
          </span>
          <span className={styles.detailValue}>
            {getStatusBadge(alert.is_resolved)}
          </span>
        </div>
        <div className={`${styles.detailRow} ${styles.detailQuantities}`}>
          <span className={styles.detailLabel}>
            <span className={styles.quantityLabel}>موجودی فعلی:</span>
            <span className={`${styles.quantityValue} ${alert.current_quantity <= 0 ? styles.criticalValue : ''}`}>
              {alert.current_quantity}
            </span>
          </span>
          <span className={styles.detailLabel}>
            <span className={styles.quantityLabel}>آستانه:</span>
            <span className={styles.quantityValue}>
              {alert.threshold}
            </span>
          </span>
        </div>
        <div className={styles.detailRow}>
          <span className={styles.detailLabel}>
            <Clock size={14} /> تاریخ ایجاد:
          </span>
          <span className={styles.detailValue}>
            {new Date(alert.created_at).toLocaleString('fa-IR')}
          </span>
        </div>
        {alert.resolved_at && (
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>
              <Calendar size={14} /> تاریخ برطرف شدن:
            </span>
            <span className={styles.detailValue}>
              {new Date(alert.resolved_at).toLocaleString('fa-IR')}
            </span>
          </div>
        )}
      </div>

      {!alert.is_resolved && (
        <div className={styles.detailFooter}>
          <div className={styles.detailWarning}>
            <AlertTriangle size={16} />
            <span>این هشدار هنوز برطرف نشده است. برای برطرف کردن آن، روی دکمه زیر کلیک کنید.</span>
          </div>
          <button className={`${styles.primaryBtn} ${styles.resolveBtn}`} onClick={onResolve}>
            <Check size={16} />
            {t.resolve || 'برطرف کردن هشدار'}
          </button>
        </div>
      )}
    </div>
  );
};

export default AlertDetail;