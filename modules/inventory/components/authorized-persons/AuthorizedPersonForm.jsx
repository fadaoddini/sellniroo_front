// modules/inventory/components/authorized-persons/AuthorizedPersonForm.jsx

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  User, Shield, Phone, Mail, Building2, Loader2, 
  Save, X, CheckCircle, Circle, Users, Briefcase,
} from 'lucide-react';
import styles from './authorizedPerson.module.css';

const AuthorizedPersonForm = ({ 
  initialData, 
  onSubmit, 
  onCancel, 
  loading = false,
  warehouses = [],
}) => {
  const isEditing = !!initialData;

  const [formData, setFormData] = useState({
    full_name: '',
    position: '',
    phone: '',
    email: '',
    mobile: '',
    warehouses: [],
    is_active: true,
    can_confirm: true,
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ============================================
  // Effect - مقداردهی اولیه
  // ============================================
  useEffect(() => {
    if (isEditing && initialData) {
      // استخراج warehouse IDs
      let warehouseIds = [];
      if (Array.isArray(initialData.warehouses)) {
        warehouseIds = initialData.warehouses.map(w => typeof w === 'object' ? w.id : w);
      } else if (initialData.warehouse_ids) {
        warehouseIds = initialData.warehouse_ids;
      } else if (initialData.warehouses) {
        warehouseIds = initialData.warehouses;
      }

      setFormData({
        full_name: initialData.full_name || '',
        position: initialData.position || '',
        phone: initialData.phone || '',
        email: initialData.email || '',
        mobile: initialData.user?.mobile || initialData.mobile || '',
        warehouses: warehouseIds,
        is_active: initialData.is_active !== undefined ? initialData.is_active : true,
        can_confirm: initialData.can_confirm !== undefined ? initialData.can_confirm : true,
      });
    } else {
      setFormData({
        full_name: '',
        position: '',
        phone: '',
        email: '',
        mobile: '',
        warehouses: [],
        is_active: true,
        can_confirm: true,
      });
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

  const handleWarehouseChange = useCallback((e) => {
    const options = e.target.options;
    const selected = [];
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        selected.push(parseInt(options[i].value));
      }
    }
    setFormData(prev => ({ ...prev, warehouses: selected }));
    if (errors.warehouses) setErrors(prev => ({ ...prev, warehouses: '' }));
  }, [errors]);

  const validate = useCallback(() => {
    const newErrors = {};
    
    if (!formData.full_name?.trim()) {
      newErrors.full_name = 'نام کامل الزامی است';
    }
    if (!formData.position?.trim()) {
      newErrors.position = 'سمت الزامی است';
    }
    if (!formData.phone?.trim()) {
      newErrors.phone = 'تلفن الزامی است';
    }
    if (!formData.mobile?.trim() && !isEditing) {
      newErrors.mobile = 'شماره موبایل کاربر الزامی است';
    }
    if (formData.warehouses.length === 0) {
      newErrors.warehouses = 'حداقل یک انبار را انتخاب کنید';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, isEditing]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (isSubmitting || loading) return;
    if (validate()) {
      setIsSubmitting(true);
      try {
        const dataToSubmit = {
          full_name: formData.full_name.trim(),
          position: formData.position.trim(),
          phone: formData.phone.trim(),
          email: formData.email?.trim() || '',
          mobile: formData.mobile?.trim() || '',
          warehouses: formData.warehouses,
          is_active: formData.is_active,
          can_confirm: formData.can_confirm,
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
    <form onSubmit={handleSubmit} className={styles.personForm}>
      <div className={styles.formHeader}>
        <div className={styles.formHeaderIcon}>
          <Shield size={24} style={{ color: '#800020' }} />
        </div>
        <div>
          <h3 className={styles.formTitle}>
            {isEditing ? '✏️ ویرایش فرد مجاز' : '➕ فرد مجاز جدید'}
          </h3>
          <p className={styles.formSubtitle}>
            {isEditing ? 'اطلاعات فرد مجاز را ویرایش کنید' : 'یک فرد مجاز جدید ایجاد کنید'}
          </p>
        </div>
      </div>

      <div className={styles.formGrid}>
        {/* نام کامل */}
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>
            <User size={14} /> نام کامل <span className={styles.required}>*</span>
          </label>
          <input
            type="text"
            name="full_name"
            value={formData.full_name}
            onChange={handleChange}
            className={`${styles.formInput} ${errors.full_name ? styles.error : ''}`}
            placeholder="مثال: علی محمدی"
            disabled={isDisabled}
          />
          {errors.full_name && <span className={styles.errorText}>⚠️ {errors.full_name}</span>}
        </div>

        {/* سمت */}
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>
            <Briefcase size={14} /> سمت <span className={styles.required}>*</span>
          </label>
          <input
            type="text"
            name="position"
            value={formData.position}
            onChange={handleChange}
            className={`${styles.formInput} ${errors.position ? styles.error : ''}`}
            placeholder="مثال: مدیر انبار"
            disabled={isDisabled}
          />
          {errors.position && <span className={styles.errorText}>⚠️ {errors.position}</span>}
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

        {/* ایمیل */}
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>
            <Mail size={14} /> ایمیل (اختیاری)
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={styles.formInput}
            placeholder="مثال: ali@example.com"
            disabled={isDisabled}
          />
        </div>

        {/* شماره موبایل کاربر */}
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>
            <Users size={14} /> شماره موبایل کاربر {!isEditing && <span className={styles.required}>*</span>}
          </label>
          <input
            type="text"
            name="mobile"
            value={formData.mobile}
            onChange={handleChange}
            className={`${styles.formInput} ${errors.mobile ? styles.error : ''}`}
            placeholder="مثال: 09123456789"
            disabled={isDisabled}
          />
          {errors.mobile && <span className={styles.errorText}>⚠️ {errors.mobile}</span>}
          {isEditing && (
            <span className={styles.helperText}>برای تغییر شماره، کاربر جدید ایجاد کنید</span>
          )}
        </div>

        {/* انبارهای مجاز */}
        <div className={`${styles.formGroup} ${styles.fullWidth}`}>
          <label className={styles.formLabel}>
            <Building2 size={14} /> انبارهای مجاز <span className={styles.required}>*</span>
          </label>
          <select
            name="warehouses"
            multiple
            value={formData.warehouses}
            onChange={handleWarehouseChange}
            className={`${styles.formSelect} ${styles.formSelectMultiple} ${errors.warehouses ? styles.error : ''}`}
            disabled={isDisabled}
            size={4}
          >
            {warehouses.map(warehouse => (
              <option key={warehouse.id} value={warehouse.id}>
                {warehouse.title}
              </option>
            ))}
          </select>
          {errors.warehouses && <span className={styles.errorText}>⚠️ {errors.warehouses}</span>}
          <span className={styles.helperText}>برای انتخاب چندین انبار، کلید Ctrl (یا Cmd) را نگه دارید</span>
        </div>

        {/* فعال/غیرفعال */}
        <div className={styles.formGroup}>
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
              فرد مجاز فعال است
            </span>
          </label>
        </div>

        {/* امکان تایید */}
        <div className={styles.formGroup}>
          <label className={styles.formCheckbox}>
            <input
              type="checkbox"
              name="can_confirm"
              checked={formData.can_confirm}
              onChange={handleChange}
              disabled={isDisabled}
            />
            <span>
              {formData.can_confirm ? 
                <CheckCircle size={16} style={{ color: '#2e7d32' }} /> : 
                <Circle size={16} style={{ color: '#c62828' }} />
              }
              امکان تایید خروج کالا دارد
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

export default AuthorizedPersonForm;