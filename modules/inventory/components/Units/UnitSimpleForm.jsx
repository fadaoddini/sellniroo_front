// modules/inventory/components/units/UnitSimpleForm.jsx

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Ruler, Tag, AlignLeft, CheckCircle, Circle, Loader2, Save, X, Info } from 'lucide-react';
import styles from './unit.module.css';

const UnitSimpleForm = ({ initialData, onSubmit, onCancel, loading = false }) => {
  const [formData, setFormData] = useState({ 
    title: '', 
    abbreviation: '', 
    description: '', 
    is_active: true 
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        abbreviation: initialData.abbreviation || '',
        description: initialData.description || '',
        is_active: initialData.is_active !== undefined ? initialData.is_active : true,
      });
    } else {
      setFormData({ title: '', abbreviation: '', description: '', is_active: true });
    }
    setErrors({});
  }, [initialData]);

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  }, [errors]);

  const validate = useCallback(() => {
    const newErrors = {};
    if (!formData.title?.trim()) newErrors.title = 'عنوان واحد الزامی است';
    if (!formData.abbreviation?.trim()) newErrors.abbreviation = 'مخفف واحد الزامی است';
    if (formData.abbreviation?.trim() && formData.abbreviation.length > 10) {
      newErrors.abbreviation = 'مخفف نباید بیشتر از 10 کاراکتر باشد';
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
        await onSubmit({
          title: formData.title.trim(),
          abbreviation: formData.abbreviation.trim().toLowerCase(),
          description: formData.description?.trim() || '',
          parent: null, // ریشه
          is_active: formData.is_active,
          count_in_parent: 1,
        });
      } catch (error) {
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
    <form onSubmit={handleSubmit} className={styles.simpleForm}>
      <div className={styles.formHeader}>
        <div className={styles.formHeaderIcon}><Ruler size={24} /></div>
        <div>
          <h3 className={styles.formTitle}>
            {initialData ? '✏️ ویرایش واحد ریشه' : '➕ واحد ریشه جدید'}
          </h3>
          <p className={styles.formSubtitle}>
            {initialData ? 'اطلاعات واحد ریشه را ویرایش کنید' : 'یک واحد ریشه جدید ایجاد کنید'}
          </p>
        </div>
      </div>

      <div className={styles.formGridSimple}>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}><Ruler size={14} /> عنوان <span className={styles.required}>*</span></label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className={`${styles.formInput} ${errors.title ? styles.error : ''}`}
            placeholder="مثال: جعبه مادر، کارتن، پالت"
            disabled={isDisabled}
            autoFocus
          />
          {errors.title && <span className={styles.errorText}>⚠️ {errors.title}</span>}
        </div>

        <div className={styles.formGroup}>
          <label className={styles.formLabel}><Tag size={14} /> مخفف <span className={styles.required}>*</span></label>
          <input
            type="text"
            name="abbreviation"
            value={formData.abbreviation}
            onChange={handleChange}
            className={`${styles.formInput} ${errors.abbreviation ? styles.error : ''}`}
            placeholder="مثال: box4819"
            disabled={isDisabled}
          />
          {errors.abbreviation && <span className={styles.errorText}>⚠️ {errors.abbreviation}</span>}
          <span className={styles.helperText}>حداکثر ۱۰ کاراکتر</span>
        </div>

        <div className={`${styles.formGroup} ${styles.fullWidth}`}>
          <label className={styles.formLabel}><AlignLeft size={14} /> توضیحات (اختیاری)</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className={styles.formTextarea}
            placeholder="توضیحات تکمیلی..."
            rows={2}
            disabled={isDisabled}
          />
        </div>

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
              واحد فعال است
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
            <><Save size={16} />{initialData ? 'ویرایش' : 'ایجاد'}</>
          )}
        </button>
      </div>
    </form>
  );
};

export default UnitSimpleForm;