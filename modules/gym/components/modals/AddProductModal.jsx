// modules/gym/components/tabs/modals/AddProductModal.jsx
'use client';

import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import Modal from './Modal';
import styles from './SharedForm.module.css';

const CATEGORIES = ['مکمل ورزشی', 'پوشاک', 'لوازم ورزشی', 'سایر'];

const empty = {
  name: '',
  category: 'مکمل ورزشی',
  price: 0,
  memberPrice: 0,
  stock: 0,
  description: '',
  image: '',
  status: 'active',
};

export default function AddProductModal({ isOpen, onClose, onAdd }) {
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      setForm(empty);
      setErrors({});
    }
  }, [isOpen]);

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'نام محصول الزامی است';
    if (!form.price || form.price <= 0) errs.price = 'قیمت باید بیشتر از صفر باشد';
    if (!form.memberPrice || form.memberPrice <= 0) errs.memberPrice = 'قیمت اعضا باید بیشتر از صفر باشد';
    if (form.memberPrice > form.price) errs.memberPrice = 'قیمت اعضا نمی‌تواند بیشتر از قیمت اصلی باشد';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onAdd(form);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="افزودن محصول جدید">
      <div className={styles.modalForm}>
        <div className={styles.formGroup}>
          <label>نام محصول *</label>
          <input
            type="text"
            placeholder="مثلاً: پروتئین وی ۲ کیلویی"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          {errors.name && <span className={styles.errorText}>{errors.name}</span>}
        </div>

        <div className={styles.formGroup}>
          <label>دسته‌بندی</label>
          <select
            value={form.category}
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
              placeholder="3500000"
              value={form.price || ''}
              onChange={(e) => setForm({ ...form, price: parseInt(e.target.value) || 0 })}
            />
            {errors.price && <span className={styles.errorText}>{errors.price}</span>}
          </div>
          <div className={styles.formGroup}>
            <label>قیمت اعضای باشگاه (تومان) *</label>
            <input
              type="number"
              placeholder="3200000"
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
              placeholder="25"
              value={form.stock || ''}
              onChange={(e) => setForm({ ...form, stock: parseInt(e.target.value) || 0 })}
            />
          </div>
          <div className={styles.formGroup}>
            <label>وضعیت</label>
            <select
              value={form.status}
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
            placeholder="https://example.com/image.jpg"
            value={form.image}
            onChange={(e) => setForm({ ...form, image: e.target.value })}
          />
        </div>

        <div className={styles.formGroup}>
          <label>توضیحات</label>
          <textarea
            placeholder="توضیحات محصول..."
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={3}
          />
        </div>

        <div className={styles.modalActions}>
          <button className={styles.modalCancel} onClick={onClose}>انصراف</button>
          <button className={styles.modalConfirm} onClick={handleSubmit}>
            <Plus size={16} />
            افزودن محصول
          </button>
        </div>
      </div>
    </Modal>
  );
}