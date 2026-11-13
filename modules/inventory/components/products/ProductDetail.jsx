// modules/inventory/components/products/ProductDetail.jsx

'use client';

import React from 'react';
import Image from 'next/image';
import {
  Package, Tag, Layers, Edit, X, 
  CheckCircle, Circle, AlertCircle, FileText,
  Image as ImageIcon, Link, Box, Code, GitBranch,
  Info, Lock, Unlock, PackageOpen,
} from 'lucide-react';
import styles from './ProductDetail.module.css';

const ProductDetail = ({ 
  product, 
  onEdit, 
  onClose,
  getCategoryName,
  getUnitName,
  getUnitFullPath,
  getStatusBadge,
  t = {},
}) => {
  if (!product) return null;

  const rootUnitName = getUnitName?.(product.root_unit) || '-';
  const rootUnitPath = getUnitFullPath?.(product.root_unit) || rootUnitName;
  const categoryName = getCategoryName?.(product.category) || '-';
  const statusBadge = getStatusBadge?.(product.is_active) || null;

  const totalStock = Math.floor(product.total_stock || 0);
  const availableStock = Math.floor(product.available_stock || 0);
  const reservedStock = Math.floor(product.total_reserved || 0);
  const minAlert = Math.floor(product.min_stock_alert || 10);

  // دریافت بافر از stock_items
  let buffers = {};
  if (product.stock_items && product.stock_items.length > 0) {
    for (const item of product.stock_items) {
      if (item.packaging_buffer) {
        buffers = { ...buffers, ...item.packaging_buffer };
      }
    }
  }

  const hasBuffer = Object.keys(buffers).length > 0;

  return (
    <div className={styles.detail}>
      {/* ===== Header ===== */}
      <div className={styles.detailHeader}>
        <div className={styles.detailImage}>
          {product.main_image ? (
            <Image src={product.main_image} alt={product.title} width={120} height={120} className={styles.detailImageMain} />
          ) : (
            <div className={styles.detailImagePlaceholder}><Package size={48} /></div>
          )}
        </div>
        <div className={styles.detailTitleSection}>
          <h3 className={styles.detailTitle}>{product.title}</h3>
          <span className={styles.detailCode}><Code size={14} /> {product.code}</span>
          <div className={styles.detailStatus}>{statusBadge}</div>
          <div className={styles.detailQuickInfo}>
            <span className={styles.quickInfoItem}><Box size={14} /> {totalStock.toLocaleString('fa-IR')} {rootUnitName}</span>
            <span className={styles.quickInfoItem}><Info size={14} /> {categoryName}</span>
            {hasBuffer && <span className={`${styles.quickInfoItem} ${styles.bufferInfo}`}>📦 بافر دارد</span>}
          </div>
        </div>
        <div className={styles.detailActions}>
          <button className={styles.primaryBtn} onClick={onEdit}><Edit size={16} /> {t.edit || 'ویرایش'}</button>
          <button className={styles.secondaryBtn} onClick={onClose}><X size={16} /> {t.close || 'بستن'}</button>
        </div>
      </div>

      {/* ===== Info Grid ===== */}
      <div className={styles.detailGrid}>
        <div className={styles.detailRow}>
          <span className={styles.detailLabel}><Tag size={14} /> دسته‌بندی:</span>
          <span className={styles.detailValue}>{categoryName}</span>
        </div>
        <div className={styles.detailRow}>
          <span className={styles.detailLabel}><Layers size={14} /> واحد اصلی:</span>
          <span className={styles.detailValue}><strong>{rootUnitName}</strong> <span className={styles.detailSubInfo}>({rootUnitPath})</span></span>
        </div>
        <div className={styles.detailRow}>
          <span className={styles.detailLabel}><GitBranch size={14} /> واحد پیش‌فرض تراکنش:</span>
          <span className={styles.detailValue}>
            {product.default_transaction_unit ? (
              <><strong>{getUnitName?.(product.default_transaction_unit) || '-'}</strong> <span className={styles.detailSubInfo}>({getUnitFullPath?.(product.default_transaction_unit) || '-'})</span></>
            ) : (
              <span className={styles.detailEmpty}>تعیین نشده</span>
            )}
          </span>
        </div>
      </div>

      {/* ===== Stock Info ===== */}
      <div className={styles.detailSection}>
        <h4 className={styles.detailSectionTitle}><Package size={16} /> اطلاعات موجودی</h4>
        <div className={styles.detailGrid}>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>موجودی کل (واحد اصلی):</span>
            <span className={`${styles.detailValue} ${product.is_low_stock ? styles.lowStockValue : ''}`}>
              {totalStock.toLocaleString('fa-IR')} {rootUnitName}
            </span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>موجودی قابل استفاده:</span>
            <span className={styles.detailValue}>{availableStock.toLocaleString('fa-IR')} {rootUnitName}</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}><Lock size={14} /> موجودی رزرو شده:</span>
            <span className={styles.detailValue}>{reservedStock.toLocaleString('fa-IR')} {rootUnitName}</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}><PackageOpen size={14} /> بافر بسته‌بندی:</span>
            <span className={styles.detailValue}>
              {hasBuffer ? (
                <div className={styles.bufferList}>
                  {Object.entries(buffers).map(([unitId, value]) => {
                    const unitName =
                      getUnitName?.(Number(unitId)) ||
                      getUnitFullPath?.(Number(unitId)) ||
                      `واحد ${unitId}`
                    return (
                      <span key={unitId} className={styles.bufferItem}>
                        {unitName}: {Number(value || 0).toLocaleString('fa-IR')}
                      </span>
                    );
                  })}
                </div>
              ) : (
                <span className={styles.detailEmpty}>بدون بافر</span>
              )}
            </span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>حداقل هشدار:</span>
            <span className={styles.detailValue}>{minAlert.toLocaleString('fa-IR')} {rootUnitName}</span>
          </div>
          {product.is_low_stock && (
            <div className={`${styles.detailRow} ${styles.warningRow}`}>
              <span className={styles.detailLabel}><AlertCircle size={14} style={{ color: '#e65100' }} /> وضعیت:</span>
              <span className={styles.warningText}>⚠️ موجودی کالا کم است (زیر {minAlert.toLocaleString('fa-IR')} {rootUnitName})</span>
            </div>
          )}
        </div>
      </div>

      {/* ===== Description ===== */}
      {(product.description || product.specifications) && (
        <div className={styles.detailSection}>
          <h4 className={styles.detailSectionTitle}><FileText size={16} /> توضیحات و مشخصات</h4>
          {product.description && <div className={styles.detailDescription}>{product.description}</div>}
          {product.specifications && Object.keys(product.specifications).length > 0 && (
            <div className={styles.detailSpecs}>
              {Object.entries(product.specifications).map(([key, value]) => (
                <div key={key} className={styles.detailSpecItem}>
                  <span className={styles.detailSpecKey}>{key}:</span>
                  <span className={styles.detailSpecValue}>{typeof value === 'object' ? JSON.stringify(value) : value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ===== Video ===== */}
      {product.video && (
        <div className={styles.detailSection}>
          <h4 className={styles.detailSectionTitle}><Link size={16} /> فیلم معرفی</h4>
          <a href={product.video} target="_blank" rel="noopener noreferrer" className={styles.detailLink}>مشاهده فیلم معرفی کالا</a>
        </div>
      )}

      {/* ===== Images ===== */}
      {product.images && product.images.length > 0 && (
        <div className={styles.detailSection}>
          <h4 className={styles.detailSectionTitle}><ImageIcon size={16} /> تصاویر ({product.images.length})</h4>
          <div className={styles.detailImagesGrid}>
            {product.images.map((img, index) => (
              <div key={index} className={styles.detailImageItem}>
                <Image src={img} alt={`تصویر ${index + 1}`} width={100} height={100} className={styles.detailImageThumb} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===== Dates ===== */}
      <div className={styles.detailSection}>
        <h4 className={styles.detailSectionTitle}><Info size={16} /> اطلاعات ثبت</h4>
        <div className={styles.detailGrid}>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>تاریخ ایجاد:</span>
            <span className={styles.detailValue}>{product.created_at ? new Date(product.created_at).toLocaleDateString('fa-IR') : '-'}</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>آخرین بروزرسانی:</span>
            <span className={styles.detailValue}>{product.updated_at ? new Date(product.updated_at).toLocaleDateString('fa-IR') : '-'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;