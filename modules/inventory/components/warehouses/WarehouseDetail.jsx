// modules/inventory/components/warehouses/WarehouseDetail.jsx

'use client';

import React from 'react';
import Image from 'next/image';
import {
  Warehouse, Building2, MapPin, Phone, User, Edit, X, 
  CheckCircle, Circle, Package, Calendar,
} from 'lucide-react';
import styles from './warehouse.module.css';

const WarehouseDetail = ({ 
  warehouse, 
  onEdit, 
  onClose,
  getStatusBadge,
  t = {},
}) => {
  if (!warehouse) return null;

  return (
    <div className={styles.warehouseDetail}>
      <div className={styles.detailHeader}>
        <div className={styles.detailImage}>
          {warehouse.image ? (
            <Image 
              src={warehouse.image} 
              alt={warehouse.title}
              width={120}
              height={120}
              className={styles.detailImageMain}
            />
          ) : (
            <div className={styles.detailImagePlaceholder}>
              <Warehouse size={48} />
            </div>
          )}
        </div>
        <div className={styles.detailTitleSection}>
          <h3 className={styles.detailTitle}>{warehouse.title}</h3>
          <div className={styles.detailStatus}>
            {getStatusBadge?.(warehouse.is_active)}
          </div>
        </div>
        <div className={styles.detailActions}>
          <button className={styles.primaryBtn} onClick={onEdit}>
            <Edit size={16} />
            {t.edit || 'ویرایش'}
          </button>
          <button className={styles.secondaryBtn} onClick={onClose}>
            <X size={16} />
            {t.close || 'بستن'}
          </button>
        </div>
      </div>

      <div className={styles.detailGrid}>
        <div className={styles.detailRow}>
          <span className={styles.detailLabel}>
            <Building2 size={14} /> عنوان:
          </span>
          <span className={styles.detailValue}>{warehouse.title}</span>
        </div>
        <div className={styles.detailRow}>
          <span className={styles.detailLabel}>
            <MapPin size={14} /> آدرس:
          </span>
          <span className={styles.detailValue}>{warehouse.address}</span>
        </div>
        <div className={styles.detailRow}>
          <span className={styles.detailLabel}>
            <Phone size={14} /> تلفن:
          </span>
          <span className={styles.detailValue}>{warehouse.phone}</span>
        </div>
        <div className={styles.detailRow}>
          <span className={styles.detailLabel}>
            <User size={14} /> مدیر:
          </span>
          <span className={styles.detailValue}>{warehouse.manager}</span>
        </div>
        {warehouse.manager_phone && (
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>
              <Phone size={14} /> تلفن مدیر:
            </span>
            <span className={styles.detailValue}>{warehouse.manager_phone}</span>
          </div>
        )}
        <div className={styles.detailRow}>
          <span className={styles.detailLabel}>
            <Package size={14} /> کل اقلام:
          </span>
          <span className={styles.detailValue}>
            {warehouse.total_items || 0}
          </span>
        </div>
        <div className={styles.detailRow}>
          <span className={styles.detailLabel}>
            <Calendar size={14} /> تاریخ ایجاد:
          </span>
          <span className={styles.detailValue}>
            {new Date(warehouse.created_at).toLocaleDateString('fa-IR')}
          </span>
        </div>
        {warehouse.updated_at && (
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>
              <Calendar size={14} /> آخرین بروزرسانی:
            </span>
            <span className={styles.detailValue}>
              {new Date(warehouse.updated_at).toLocaleDateString('fa-IR')}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default WarehouseDetail;