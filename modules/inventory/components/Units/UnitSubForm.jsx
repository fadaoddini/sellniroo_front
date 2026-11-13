// modules/inventory/components/units/UnitSubForm.jsx

'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { GitBranch, Tag, AlignLeft, CheckCircle, Circle, Loader2, Save, X, Layers, Info } from 'lucide-react';
import styles from './unit.module.css';

const UnitSubForm = ({ 
  parentUnit,        // ← این باید والد انتخاب شده باشد
  initialData,       // برای ویرایش
  onSubmit, 
  onCancel, 
  loading = false,
  units = [],
}) => {
  const isEditing = !!initialData;
  
  const [formData, setFormData] = useState({
    title: '',
    abbreviation: '',
    description: '',
    count_in_parent: 1,
    parent: null,
    is_active: true,
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ============================================
  // ✅ Effect - مقداردهی اولیه - اصلاح شده
  // ============================================
  useEffect(() => {
    console.log('🔄 UnitSubForm useEffect - isEditing:', isEditing);
    console.log('📦 parentUnit received:', parentUnit);
    console.log('📦 initialData:', initialData);

    if (isEditing && initialData) {
      // ✅ حالت ویرایش
      let parentId = null;
      
      if (typeof initialData.parent === 'number') {
        parentId = initialData.parent;
      } else if (typeof initialData.parent === 'string') {
        if (!isNaN(parseInt(initialData.parent))) {
          parentId = parseInt(initialData.parent);
        }
      } else if (initialData.parent && typeof initialData.parent === 'object') {
        parentId = initialData.parent.id || initialData.parent.parent_id;
        if (parentId) parentId = parseInt(parentId);
      }
      
      if (initialData.parent_id !== undefined && initialData.parent_id !== null) {
        parentId = parseInt(initialData.parent_id);
      }

      setFormData({
        title: initialData.title || '',
        abbreviation: initialData.abbreviation || '',
        description: initialData.description || '',
        count_in_parent: initialData.count_in_parent || 1,
        parent: parentId || null,
        is_active: initialData.is_active !== undefined ? initialData.is_active : true,
      });
    } else {
      // ✅ حالت ایجاد جدید - از parentUnit استفاده کن
      const parentId = parentUnit?.id || null;
      console.log('✅ Creating new sub-unit with parentId:', parentId);
      console.log('✅ Parent unit:', parentUnit);
      
      setFormData({
        title: '',
        abbreviation: '',
        description: '',
        count_in_parent: 1,
        parent: parentId,
        is_active: true,
      });
    }
    setErrors({});
  }, [initialData, parentUnit, isEditing]);

  // ============================================
  // ✅ والد نمایشی - اصلاح شده
  // ============================================
  const displayParent = useMemo(() => {
    console.log('🔍 Computing displayParent...');
    console.log('🔍 isEditing:', isEditing);
    console.log('🔍 parentUnit:', parentUnit);
    console.log('🔍 formData.parent:', formData.parent);
    
    if (isEditing) {
      // ✅ حالت ویرایش: والد رو از formData.parent پیدا کن
      if (formData.parent) {
        const parentId = parseInt(formData.parent);
        const found = units.find(u => u.id === parentId);
        console.log('🔍 Found parent from formData.parent:', found);
        return found || null;
      }
      return null;
    } else {
      // ✅ حالت ایجاد جدید: از parentUnit استفاده کن
      console.log('🔍 Using parentUnit for display:', parentUnit);
      return parentUnit || null;
    }
  }, [isEditing, parentUnit, formData.parent, units]);

  // ============================================
  // Handlers
  // ============================================
  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  }, [errors]);

  // ============================================
  // Validation
  // ============================================
  const validate = useCallback(() => {
    const newErrors = {};
    
    if (!formData.title?.trim()) {
      newErrors.title = 'عنوان زیرمجموعه الزامی است';
    }
    
    if (!formData.abbreviation?.trim()) {
      newErrors.abbreviation = 'مخفف زیرمجموعه الزامی است';
    }
    if (formData.abbreviation?.trim() && formData.abbreviation.length > 10) {
      newErrors.abbreviation = 'مخفف نباید بیشتر از 10 کاراکتر باشد';
    }
    
    const count = parseInt(formData.count_in_parent);
    if (!formData.count_in_parent || count < 1) {
      newErrors.count_in_parent = 'تعداد باید حداقل 1 باشد';
    }
    if (count > 999999) {
      newErrors.count_in_parent = 'تعداد نباید بیشتر از 999,999 باشد';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // ============================================
  // Submit
  // ============================================
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (isSubmitting || loading) return;
    if (validate()) {
      setIsSubmitting(true);
      try {
        const dataToSubmit = {
          title: formData.title.trim(),
          abbreviation: formData.abbreviation.trim().toLowerCase(),
          description: formData.description?.trim() || '',
          parent: formData.parent ? parseInt(formData.parent) : null,
          is_active: formData.is_active === true || formData.is_active === 'true',
          count_in_parent: parseInt(formData.count_in_parent) || 1,
        };
        
        console.log('📤 Submitting sub-unit:', dataToSubmit);
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

  // ============================================
  // Render
  // ============================================
  return (
    <form onSubmit={handleSubmit} className={styles.simpleForm}>
      <div className={styles.formHeader}>
        <div className={styles.formHeaderIcon} style={{ background: 'rgba(45,74,62,0.08)' }}>
          <GitBranch size={24} style={{ color: '#2d4a3e' }} />
        </div>
        <div>
          <h3 className={styles.formTitle}>
            {isEditing ? (
              <>✏️ ویرایش "{initialData?.title}"</>
            ) : (
              <>➕ زیرمجموعه جدید برای "{displayParent?.title || 'والد'}"</>
            )}
          </h3>
          <p className={styles.formSubtitle}>
            {isEditing ? 'اطلاعات زیرمجموعه را ویرایش کنید' : 'یک زیرمجموعه برای این واحد ایجاد کنید'}
          </p>
        </div>
      </div>

      <div className={styles.formGridSimple}>
        
        {/* عنوان */}
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>
            <Tag size={14} /> عنوان <span className={styles.required}>*</span>
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className={`${styles.formInput} ${errors.title ? styles.error : ''}`}
            placeholder="مثال: جعبه کوچک"
            disabled={isDisabled}
            autoFocus
          />
          {errors.title && <span className={styles.errorText}>⚠️ {errors.title}</span>}
        </div>

        {/* مخفف */}
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>
            <Tag size={14} /> مخفف <span className={styles.required}>*</span>
          </label>
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

        {/* تعداد در واحد والد */}
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>
            <Layers size={14} /> تعداد در واحد والد <span className={styles.required}>*</span>
          </label>
          <input
            type="number"
            name="count_in_parent"
            value={formData.count_in_parent}
            onChange={handleChange}
            className={`${styles.formInput} ${errors.count_in_parent ? styles.error : ''}`}
            placeholder="مثلاً ۲۰"
            min="1"
            max="999999"
            disabled={isDisabled}
          />
          {errors.count_in_parent && <span className={styles.errorText}>⚠️ {errors.count_in_parent}</span>}
          <span className={styles.helperText}>
            چند تا از این واحد در ۱ عدد "{displayParent?.title || 'والد'}" جای می‌گیرد؟
          </span>
        </div>

        {/* ✅ واحد والد - نمایش درست */}
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>
            <GitBranch size={14} />
            واحد والد
            {isEditing && (
              <span style={{ fontSize: '0.55rem', color: '#9ca3af' }}>
                (غیرقابل تغییر)
              </span>
            )}
          </label>
          
          {isEditing ? (
            // ✅ حالت ویرایش - فقط نمایش
            <div className={styles.parentDisplayBox}>
              <div className={styles.parentDisplayContent}>
                <GitBranch size={16} style={{ color: '#2d4a3e' }} />
                <span className={styles.parentDisplayName}>
                  {displayParent?.title || '⚠️ والد پیدا نشد'}
                </span>
                {displayParent?.abbreviation && (
                  <span className={styles.parentDisplayAbbr}>
                    ({displayParent.abbreviation})
                  </span>
                )}
                <span className={styles.parentDisplayLock}>🔒</span>
              </div>
              <input type="hidden" name="parent" value={formData.parent || ''} />
            </div>
          ) : (
            // ✅ حالت ایجاد جدید - نمایش والد انتخاب شده
            <div className={styles.parentDisplayBox} style={{ background: '#e8f5e9', borderColor: '#2e7d32' }}>
              <div className={styles.parentDisplayContent}>
                <GitBranch size={16} style={{ color: '#2e7d32' }} />
                <span className={styles.parentDisplayName} style={{ color: '#2e7d32' }}>
                  {displayParent?.title || '⚠️ والد انتخاب نشده'}
                </span>
                {displayParent?.abbreviation && (
                  <span className={styles.parentDisplayAbbr}>
                    ({displayParent.abbreviation})
                  </span>
                )}
                <span style={{ fontSize: '0.6rem', color: '#2e7d32', marginRight: 'auto' }}>
                  ✅ والد انتخاب شده
                </span>
              </div>
              {displayParent && (
                <div style={{ fontSize: '0.65rem', color: '#6b7280', marginTop: '4px' }}>
                  📍 مسیر: {displayParent.full_path || displayParent.title}
                </div>
              )}
              <input type="hidden" name="parent" value={formData.parent || ''} />
            </div>
          )}
        </div>

        {/* توضیحات */}
        <div className={`${styles.formGroup} ${styles.fullWidth}`}>
          <label className={styles.formLabel}>
            <AlignLeft size={14} /> توضیحات (اختیاری)
          </label>
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

        {/* وضعیت فعال */}
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
              {formData.is_active ? (
                <CheckCircle size={16} style={{ color: '#2e7d32' }} />
              ) : (
                <Circle size={16} style={{ color: '#c62828' }} />
              )}
              زیرمجموعه فعال است
            </span>
          </label>
        </div>

        {/* اطلاعات والد - نمایش کامل */}
        <div className={`${styles.formGroup} ${styles.fullWidth}`}>
          <div className={styles.parentInfoBox} style={{ 
            background: displayParent ? '#e8f5e9' : '#fff3e0',
            borderColor: displayParent ? '#2e7d32' : '#ff9800'
          }}>
            <Info size={14} style={{ color: displayParent ? '#2e7d32' : '#ff9800' }} />
            <span>
              {displayParent ? (
                <>
                  📌 والد: <strong>{displayParent.title}</strong>
                  {displayParent.abbreviation && ` (${displayParent.abbreviation})`}
                  {displayParent.level !== undefined && ` | سطح: ${displayParent.level + 1}`}
                </>
              ) : (
                '⚠️ هیچ والدی انتخاب نشده است. این واحد به عنوان ریشه ایجاد خواهد شد.'
              )}
            </span>
          </div>
        </div>
      </div>

      <div className={styles.formActions}>
        <button type="button" onClick={onCancel} className={styles.secondaryBtn} disabled={isDisabled}>
          <X size={16} /> انصراف
        </button>
        <button type="submit" className={styles.primaryBtn} disabled={isDisabled} style={{ background: '#2d4a3e' }}>
          {isDisabled ? (
            <><Loader2 size={16} className={styles.spinnerSmall} />در حال...</>
          ) : (
            <><Save size={16} />{isEditing ? 'ویرایش زیرمجموعه' : 'ایجاد زیرمجموعه'}</>
          )}
        </button>
      </div>
    </form>
  );
};

export default UnitSubForm;