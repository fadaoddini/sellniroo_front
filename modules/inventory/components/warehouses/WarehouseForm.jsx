// modules/inventory/components/warehouses/WarehouseForm.jsx

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import {
  Warehouse, Building2, MapPin, Phone, User, Loader2, 
  Save, X, CheckCircle, Circle, Image as ImageIcon, Trash2,
} from 'lucide-react';
import styles from './warehouse.module.css';

const WarehouseForm = ({ 
  initialData, 
  onSubmit, 
  onCancel, 
  loading = false,
}) => {
  const isEditing = !!initialData;

  const [formData, setFormData] = useState({
    title: '',
    address: '',
    phone: '',
    manager: '',
    manager_phone: '',
    image: null,
    is_active: true,
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  // ============================================
  // Effect - مقداردهی اولیه
  // ============================================
  useEffect(() => {
    if (isEditing && initialData) {
      setFormData({
        title: initialData.title || '',
        address: initialData.address || '',
        phone: initialData.phone || '',
        manager: initialData.manager || '',
        manager_phone: initialData.manager_phone || '',
        image: initialData.image || null,
        is_active: initialData.is_active !== undefined ? initialData.is_active : true,
      });
      setPreviewImage(initialData.image || null);
    } else {
      setFormData({
        title: '',
        address: '',
        phone: '',
        manager: '',
        manager_phone: '',
        image: null,
        is_active: true,
      });
      setPreviewImage(null);
    }
    setErrors({});
  }, [initialData, isEditing]);

  // ============================================
  // Handlers
  // ============================================
  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  }, [errors]);

  const handleImageChange = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, image: 'حجم تصویر نباید بیشتر از 5 مگابایت باشد' }));
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setErrors(prev => ({ ...prev, image: 'فرمت تصویر باید jpg, png, gif یا webp باشد' }));
      return;
    }

    setFormData(prev => ({ ...prev, image: file }));
    setPreviewImage(URL.createObjectURL(file));
    if (errors.image) setErrors(prev => ({ ...prev, image: '' }));
  }, [errors]);

  const validate = useCallback(() => {
    const newErrors = {};
    
    if (!formData.title?.trim()) {
      newErrors.title = 'عنوان انبار الزامی است';
    }
    if (!formData.address?.trim()) {
      newErrors.address = 'آدرس انبار الزامی است';
    }
    if (!formData.phone?.trim()) {
      newErrors.phone = 'تلفن انبار الزامی است';
    }
    if (!formData.manager?.trim()) {
      newErrors.manager = 'نام مدیر انبار الزامی است';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (isSubmitting || loading) return;
    if (validate()) {
      setIsSubmitting(true);
      try {
        const dataToSubmit = {
          title: formData.title.trim(),
          address: formData.address.trim(),
          phone: formData.phone.trim(),
          manager: formData.manager.trim(),
          manager_phone: formData.manager_phone?.trim() || '',
          image: formData.image,
          is_active: formData.is_active,
        };
        await onSubmit(dataToSubmit);
      } catch (error) {
        console.error('Submit error:', error);
        if (error.response?.data) {
          const newErrors = {};
          Object.keys(error.response.data).forEach(key => {
            newErrors[key] = error.response.data[key].join(' ');
          });
          setErrors(newErrors);
        }
      } finally {
        setIsSubmitting(false);
      }
    }
  }, [isSubmitting, loading, validate, formData, onSubmit]);

  const isDisabled = loading || isSubmitting;

  return (
    <form onSubmit={handleSubmit} className={styles.warehouseForm}>
      <div className={styles.formHeader}>
        <div className={styles.formHeaderIcon}>
          <Warehouse size={24} style={{ color: '#800020' }} />
        </div>
        <div>
          <h3 className={styles.formTitle}>
            {isEditing ? '✏️ ویرایش انبار' : '➕ انبار جدید'}
          </h3>
          <p className={styles.formSubtitle}>
            {isEditing ? 'اطلاعات انبار را ویرایش کنید' : 'یک انبار جدید ایجاد کنید'}
          </p>
        </div>
      </div>

      <div className={styles.formGrid}>
        {/* عنوان */}
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>
            <Building2 size={14} /> عنوان <span className={styles.required}>*</span>
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className={`${styles.formInput} ${errors.title ? styles.error : ''}`}
            placeholder="مثال: انبار مرکزی"
            disabled={isDisabled}
          />
          {errors.title && <span className={styles.errorText}>⚠️ {errors.title}</span>}
        </div>

        {/* تلفن */}
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>
            <Phone size={14} /> تلفن <span className={styles.required}>*</span>
          </label>
          <input
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className={`${styles.formInput} ${errors.phone ? styles.error : ''}`}
            placeholder="مثال: 021-12345678"
            disabled={isDisabled}
          />
          {errors.phone && <span className={styles.errorText}>⚠️ {errors.phone}</span>}
        </div>

        {/* آدرس */}
        <div className={`${styles.formGroup} ${styles.fullWidth}`}>
          <label className={styles.formLabel}>
            <MapPin size={14} /> آدرس <span className={styles.required}>*</span>
          </label>
          <textarea
            name="address"
            value={formData.address}
            onChange={handleChange}
            className={`${styles.formTextarea} ${errors.address ? styles.error : ''}`}
            placeholder="آدرس کامل انبار..."
            rows={2}
            disabled={isDisabled}
          />
          {errors.address && <span className={styles.errorText}>⚠️ {errors.address}</span>}
        </div>

        {/* مدیر */}
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>
            <User size={14} /> نام مدیر <span className={styles.required}>*</span>
          </label>
          <input
            type="text"
            name="manager"
            value={formData.manager}
            onChange={handleChange}
            className={`${styles.formInput} ${errors.manager ? styles.error : ''}`}
            placeholder="مثال: علی محمدی"
            disabled={isDisabled}
          />
          {errors.manager && <span className={styles.errorText}>⚠️ {errors.manager}</span>}
        </div>

        {/* تلفن مدیر */}
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>
            <Phone size={14} /> تلفن مدیر (اختیاری)
          </label>
          <input
            type="text"
            name="manager_phone"
            value={formData.manager_phone}
            onChange={handleChange}
            className={styles.formInput}
            placeholder="مثال: 0912-1234567"
            disabled={isDisabled}
          />
        </div>

        {/* تصویر */}
        <div className={`${styles.formGroup} ${styles.fullWidth}`}>
          <label className={styles.formLabel}>
            <ImageIcon size={14} /> تصویر انبار (اختیاری)
          </label>
          <div className={styles.imageUpload}>
            {previewImage ? (
              <div className={styles.imagePreviewWrapper}>
                <Image 
                  src={previewImage} 
                  alt="تصویر انبار"
                  width={150}
                  height={150}
                  className={styles.imagePreview}
                />
                <button
                  type="button"
                  className={styles.removeImageBtn}
                  onClick={() => {
                    setPreviewImage(null);
                    setFormData(prev => ({ ...prev, image: null }));
                  }}
                  disabled={isDisabled}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ) : (
              <div className={styles.imageUploadArea}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className={styles.imageInput}
                  disabled={isDisabled}
                />
                <ImageIcon size={32} />
                <span>برای آپلود کلیک کنید</span>
                <span className={styles.imageHint}>jpg, png, gif, webp | حداکثر ۵ مگابایت</span>
              </div>
            )}
          </div>
          {errors.image && <span className={styles.errorText}>⚠️ {errors.image}</span>}
        </div>

        {/* فعال/غیرفعال */}
        <div className={`${styles.formGroup} ${styles.fullWidth}`}>
          <label className={styles.formCheckbox}>
            <input
              type="checkbox"
              name="is_active"
              checked={formData.is_active}
              onChange={handleChange}
              disabled={isDisabled}
            />
            <span>
              {formData.is_active ? 
                <CheckCircle size={16} style={{ color: '#2e7d32' }} /> : 
                <Circle size={16} style={{ color: '#c62828' }} />
              }
              انبار فعال است
            </span>
          </label>
        </div>
      </div>

      <div className={styles.formActions}>
        <button type="button" onClick={onCancel} className={styles.secondaryBtn} disabled={isDisabled}>
          <X size={16} /> انصراف
        </button>
        <button type="submit" className={styles.primaryBtn} disabled={isDisabled}>
          {isDisabled ? (
            <><Loader2 size={16} className={styles.spinnerSmall} />در حال...</>
          ) : (
            <><Save size={16} />{isEditing ? 'ویرایش' : 'ایجاد'}</>
          )}
        </button>
      </div>
    </form>
  );
};

export default WarehouseForm;