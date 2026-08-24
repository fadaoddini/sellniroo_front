// modules/inventory/components/Warehouses/WarehouseForm.jsx
'use client';

import React, { useState, useEffect } from 'react';
import styles from '@/styles/modules/InventoryCommon.module.css';

const WarehouseForm = ({ initialData, onSubmit, onCancel, loading = false }) => {
  const [formData, setFormData] = useState({
    title: '',
    address: '',
    phone: '',
    manager: '',
    manager_phone: '',
    is_active: true,
    image: null,
  });

  const [errors, setErrors] = useState({});

  useEffect(() => { 
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        address: initialData.address || '',
        phone: initialData.phone || '',
        manager: initialData.manager || '',
        manager_phone: initialData.manager_phone || '',
        is_active: initialData.is_active !== undefined ? initialData.is_active : true,
        image: null,
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'file' ? files[0] : value,
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.title?.trim()) {
      newErrors.title = 'عنوان انبار الزامی است';
    }
    if (!formData.address?.trim()) {
      newErrors.address = 'آدرس انبار الزامی است';
    }
    if (!formData.phone?.trim()) {
      newErrors.phone = 'تلفن الزامی است';
    }
    if (!formData.manager?.trim()) {
      newErrors.manager = 'نام مسئول انبار الزامی است';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      const data = new FormData();
      Object.keys(formData).forEach((key) => {
        if (formData[key] !== null && formData[key] !== undefined) {
          data.append(key, formData[key]);
        }
      });
      onSubmit(data);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.formGrid}>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>
            عنوان انبار <span className={styles.required}>*</span>
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className={`${styles.formInput} ${errors.title ? styles.error : ''}`}
            placeholder="عنوان انبار را وارد کنید"
            disabled={loading}
          />
          {errors.title && <span className={styles.errorText}>{errors.title}</span>}
        </div>

        <div className={styles.formGroup}>
          <label className={styles.formLabel}>
            تلفن <span className={styles.required}>*</span>
          </label>
          <input
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className={`${styles.formInput} ${errors.phone ? styles.error : ''}`}
            placeholder="تلفن انبار را وارد کنید"
            disabled={loading}
          />
          {errors.phone && <span className={styles.errorText}>{errors.phone}</span>}
        </div>

        <div className={styles.formGroup}>
          <label className={styles.formLabel}>
            نام مسئول انبار <span className={styles.required}>*</span>
          </label>
          <input
            type="text"
            name="manager"
            value={formData.manager}
            onChange={handleChange}
            className={`${styles.formInput} ${errors.manager ? styles.error : ''}`}
            placeholder="نام مسئول را وارد کنید"
            disabled={loading}
          />
          {errors.manager && <span className={styles.errorText}>{errors.manager}</span>}
        </div>

        <div className={styles.formGroup}>
          <label className={styles.formLabel}>تلفن مسئول</label>
          <input
            type="text"
            name="manager_phone"
            value={formData.manager_phone}
            onChange={handleChange}
            className={styles.formInput}
            placeholder="تلفن مسئول را وارد کنید"
            disabled={loading}
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.formLabel}>
            آدرس <span className={styles.required}>*</span>
          </label>
          <textarea
            name="address"
            value={formData.address}
            onChange={handleChange}
            className={`${styles.formTextarea} ${errors.address ? styles.error : ''}`}
            placeholder="آدرس کامل انبار را وارد کنید"
            rows={3}
            disabled={loading}
          />
          {errors.address && <span className={styles.errorText}>{errors.address}</span>}
        </div>

        <div className={styles.formGroup}>
          <label className={styles.formLabel}>تصویر انبار</label>
          <input
            type="file"
            name="image"
            onChange={handleChange}
            className={styles.formFile}
            accept="image/*"
            disabled={loading}
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.formCheckbox}>
            <input
              type="checkbox"
              name="is_active"
              checked={formData.is_active}
              onChange={handleChange}
              disabled={loading}
            />
            <span>فعال</span>
          </label>
        </div>
      </div>

      <div className={styles.formActions}>
        <button
          type="button"
          onClick={onCancel}
          className={styles.secondaryBtn}
          disabled={loading}
        >
          انصراف
        </button>
        <button type="submit" className={styles.primaryBtn} disabled={loading}>
          {loading ? 'در حال ذخیره...' : initialData ? 'ویرایش' : 'ایجاد'}
        </button>
      </div>
    </form>
  );
};

export default WarehouseForm;