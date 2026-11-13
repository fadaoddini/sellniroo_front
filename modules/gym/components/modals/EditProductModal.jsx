// modules/gym/components/tabs/modals/EditProductModal.jsx
'use client';

import React, { useState, useEffect } from 'react';
import { Edit } from 'lucide-react';
import Modal from './Modal';
import styles from './SharedForm.module.css';

const CATEGORIES = ['مکمل ورزشی', 'پوشاک', 'لوازم ورزشی', 'سایر'];

export default function EditProductModal({ isOpen, onClose, product, onSave }) {
  const [form, setForm] = useState(product || {});
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen && product) {
      setForm(product);
      setErrors({});
    }
  }, [isOpen, product]);

  if (!product) return null;

  const validate = () => {
    const errs = {};
    if (!form.name?.trim()) errs.name = 'نام محصول الزامی است';
    if (!form.price || form.price <= 0) errs.price = 'قیمت باید بیشتر از صفر باشد';
    if (!form.memberPrice || form.memberPrice <= 0) errs.memberPrice = 'قیمت اعضا باید بیشتر از صفر باشد';
    if (form.memberPrice > form.price) errs.memberPrice = 'قیمت اعضا نمی‌تواند بیشتر از قیمت اصلی باشد';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onSave(form);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`ویرایش محصول: ${product.name}`}>
      <div className={styles.modalForm}>
        <div className={styles.formGroup}>
          <label>نام محصول *</label>
          <input
            type="text"
            value={form.name || ''}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          {errors.name && <span className={styles.errorText}>{errors.name}</span>}
        </div>

        <div className={styles.formGroup}>
          <label>دسته‌بندی</label>
          <select
            value={form.category || CATEGORIES[0]}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label>قیمت اصلی (تومان) *</label>
            <input
              type="number"
              value={form.price || ''}
              onChange={(e) => setForm({ ...form, price: parseInt(e.target.value) || 0 })}
            />
            {errors.price && <span className={styles.errorText}>{errors.price}</span>}
          </div>
          <div className={styles.formGroup}>
            <label>قیمت اعضای باشگاه (تومان) *</label>
            <input
              type="number"
              value={form.memberPrice || ''}
              onChange={(e) => setForm({ ...form, memberPrice: parseInt(e.target.value) || 0 })}
            />
            {errors.memberPrice && <span className={styles.errorText}>{errors.memberPrice}</span>}
          </div>
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label>موجودی</label>
            <input
              type="number"
              value={form.stock || ''}
              onChange={(e) => setForm({ ...form, stock: parseInt(e.target.value) || 0 })}
            />
          </div>
          <div className={styles.formGroup}>
            <label>وضعیت</label>
            <select
              value={form.status || 'active'}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              <option value="active">فعال</option>
              <option value="inactive">غیرفعال</option>
            </select>
          </div>
        </div>

        <div className={styles.formGroup}>
          <label>آدرس تصویر (URL)</label>
          <input
            type="text"
            value={form.image || ''}
            onChange={(e) => setForm({ ...form, image: e.target.value })}
          />
        </div>

        <div className={styles.formGroup}>
          <label>توضیحات</label>
          <textarea
            value={form.description || ''}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={3}
          />
        </div>

        <div className={styles.modalActions}>
          <button className={styles.modalCancel} onClick={onClose}>انصراف</button>
          <button className={styles.modalConfirm} onClick={handleSubmit}>
            <Edit size={16} />
            ذخیره تغییرات
          </button>
        </div>
      </div>
    </Modal>
  );
}