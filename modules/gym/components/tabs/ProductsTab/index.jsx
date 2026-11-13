// modules/gym/components/tabs/ProductsTab/index.jsx
'use client';

import React, { useState } from 'react';
import {
  ShoppingBag,
  Plus,
  Edit,
  Trash2,
  Search,
  Package,
  Image as ImageIcon,
  Tag,
  AlertTriangle,
} from 'lucide-react';
import styles from './ProductsTab.module.css';

const faNum = (n) => Number(n || 0).toLocaleString('fa-IR');

const CATEGORIES = [
  { value: 'all', label: 'همه' },
  { value: 'supplement', label: 'مکمل' },
  { value: 'clothing', label: 'پوشاک' },
  { value: 'equipment', label: 'لوازم' },
  { value: 'other', label: 'سایر' },
];

export default function ProductsTab({ products, onAdd, onEdit, onDelete }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const filteredProducts = products.filter((product) => {
    const q = searchQuery.trim();
    const matchSearch =
      !q || String(product.name || '').includes(q);
    const matchCategory =
      categoryFilter === 'all' || product.category === categoryFilter;
    return matchSearch && matchCategory;
  });

  const stats = {
    total: products.length,
    active: products.filter((p) => p.status === 'active').length,
    outOfStock: products.filter((p) => Number(p.stock) === 0).length,
  };

  return (
    <div className={styles.tabContent}>
      <div className={styles.tabHeader}>
        <div className={styles.tabHeaderLeft}>
          <h3 className={styles.tabTitle}>
            <ShoppingBag size={15} />
            محصولات
          </h3>
          <span className={styles.tabCount}>{faNum(products.length)}</span>
          <div className={styles.quickStats}>
            <span>
              <Package size={12} />
              {faNum(stats.total)}
            </span>
            <span className={styles.statOk}>
              <Tag size={12} />
              {faNum(stats.active)} فعال
            </span>
            {stats.outOfStock > 0 ? (
              <span className={styles.statWarn}>
                <AlertTriangle size={12} />
                {faNum(stats.outOfStock)} ناموجود
              </span>
            ) : null}
          </div>
        </div>
        <div className={styles.tabHeaderRight}>
          <select
            className={styles.filterSelect}
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
          <div className={styles.searchBox}>
            <Search size={13} />
            <input
              type="text"
              placeholder="جستجو…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button type="button" className={styles.addButton} onClick={onAdd}>
            <Plus size={14} />
            محصول جدید
          </button>
        </div>
      </div>

      <p className={styles.shopSyncHint}>
        همگام با فروشگاه سایت — سفارش در پروفایل دیده می‌شود.
      </p>

      {!filteredProducts.length ? (
        <div className={styles.emptyState}>
          <ShoppingBag size={28} />
          <h4>محصولی نیست</h4>
          <button type="button" className={styles.addButton} onClick={onAdd}>
            <Plus size={14} />
            افزودن محصول
          </button>
        </div>
      ) : (
        <div className={styles.productsGrid}>
          {filteredProducts.map((product) => {
            const stock = Number(product.stock) || 0;
            const inactive = product.status === 'inactive';
            return (
              <article
                key={product.id}
                className={`${styles.productCard} ${
                  inactive ? styles.productCardInactive : ''
                }`}
              >
                <div className={styles.productImage}>
                  {product.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={product.image_url} alt={product.name} />
                  ) : (
                    <ImageIcon size={22} />
                  )}
                  {stock === 0 ? (
                    <span className={styles.outOfStockBadge}>ناموجود</span>
                  ) : null}
                </div>

                <div className={styles.productContent}>
                  <header className={styles.productHeader}>
                    <h4 className={styles.productName}>{product.name}</h4>
                    <div className={styles.productActions}>
                      <button
                        type="button"
                        className={styles.productActionBtn}
                        onClick={() => onEdit(product)}
                        aria-label="ویرایش"
                      >
                        <Edit size={12} />
                      </button>
                      <button
                        type="button"
                        className={`${styles.productActionBtn} ${styles.productActionBtnDanger}`}
                        onClick={() => onDelete(product.id)}
                        aria-label="حذف"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </header>

                  <span className={styles.productCategory}>
                    {product.category_display || product.category || '—'}
                  </span>

                  {product.description ? (
                    <p className={styles.productDescription}>
                      {product.description}
                    </p>
                  ) : null}

                  <div className={styles.productPrices}>
                    <div>
                      <span>اصلی</span>
                      <strong>{faNum(product.price)}</strong>
                    </div>
                    <div>
                      <span>اعضا</span>
                      <strong className={styles.memberPrice}>
                        {faNum(product.member_price)}
                      </strong>
                    </div>
                  </div>

                  <footer className={styles.productFooter}>
                    <span className={styles.productStock}>
                      موجودی <strong>{faNum(stock)}</strong>
                    </span>
                    <span
                      className={`${styles.productStatus} ${
                        inactive ? styles.statusInactive : styles.statusActive
                      }`}
                    >
                      {product.status_display ||
                        (inactive ? 'غیرفعال' : 'فعال')}
                    </span>
                  </footer>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
