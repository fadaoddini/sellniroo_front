// modules/inventory/components/Units/UnitForm.jsx

'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import styles from '@/styles/modules/InventoryCommon.module.css';
import { 
  Ruler, 
  Tag, 
  AlignLeft, 
  CheckCircle, 
  Circle,
  Loader2,
  GitBranch,
  Layers,
  Info,
  AlertCircle,
} from 'lucide-react';

const UnitForm = ({ 
  initialData, 
  onSubmit, 
  onCancel, 
  loading = false,
  units = [],
}) => {
  const [formData, setFormData] = useState({
    title: '',
    abbreviation: '',
    description: '',
    parent: '',
    is_active: true,
    count_in_parent: 1,
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedParentInfo, setSelectedParentInfo] = useState(null);

  // ============================================
  // Handlers - با useCallback
  // ============================================
  const handleParentChange = useCallback((e) => {
    const parentId = e.target.value;
    setFormData(prev => ({ ...prev, parent: parentId }));
    
    if (parentId) {
      const parent = units.find(u => u.id === parseInt(parentId));
      setSelectedParentInfo(parent || null);
    } else {
      setSelectedParentInfo(null);
    }
    
    if (errors.parent) {
      setErrors(prev => ({ ...prev, parent: '' }));
    }
  }, [units, errors.parent]);

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  }, [errors]);

  // ============================================
  // Effect - به‌روزرسانی فرم
  // ============================================
  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        abbreviation: initialData.abbreviation || '',
        description: initialData.description || '',
        parent: initialData.parent || '',
        is_active: initialData.is_active !== undefined ? initialData.is_active : true,
        count_in_parent: initialData.count_in_parent || 1,
      });
      
      if (initialData.parent) {
        const parent = units.find(u => u.id === parseInt(initialData.parent));
        setSelectedParentInfo(parent || null);
      }
    } else {
      setFormData({
        title: '',
        abbreviation: '',
        description: '',
        parent: '',
        is_active: true,
        count_in_parent: 1,
      });
      setSelectedParentInfo(null);
    }
    setErrors({});
  }, [initialData, units]);

  // ============================================
  // Validation
  // ============================================
  const validate = useCallback(() => {
    const newErrors = {};
    
    if (!formData.title?.trim()) {
      newErrors.title = 'عنوان واحد الزامی است';
    }
    
    if (!formData.abbreviation?.trim()) {
      newErrors.abbreviation = 'مخفف واحد الزامی است';
    }
    if (formData.abbreviation?.trim() && formData.abbreviation.length > 10) {
      newErrors.abbreviation = 'مخفف نباید بیشتر از 10 کاراکتر باشد';
    }
    
    if (formData.parent) {
      const count = parseInt(formData.count_in_parent);
      if (!formData.count_in_parent || count < 1) {
        newErrors.count_in_parent = 'تعداد در واحد والد باید حداقل 1 باشد';
      }
      if (count > 999999) {
        newErrors.count_in_parent = 'تعداد در واحد والد نباید بیشتر از 999,999 باشد';
      }
    }
    
    if (formData.parent && initialData?.id) {
      if (parseInt(formData.parent) === initialData.id) {
        newErrors.parent = 'نمی‌توانید خودتان را به عنوان والد انتخاب کنید';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, initialData]);

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
          is_active: formData.is_active,
          count_in_parent: formData.parent ? parseInt(formData.count_in_parent) : 1,
        };
        await onSubmit(dataToSubmit);
      } catch (error) {
        console.error('Submit error:', error);
        if (error.response?.data) {
          const serverErrors = error.response.data;
          const newErrors = {};
          Object.keys(serverErrors).forEach(key => {
            newErrors[key] = serverErrors[key].join(' ');
          });
          setErrors(newErrors);
        }
      } finally {
        setIsSubmitting(false);
      }
    }
  }, [isSubmitting, loading, validate, formData, onSubmit]);

  // ============================================
  // Tree Options - با useMemo
  // ============================================
  const buildTreeOptions = useMemo(() => {
    const currentId = initialData?.id;
    
    const filterUnits = (items) => {
      return items.filter(unit => {
        if (unit.id === currentId) return false;
        return unit.is_active !== false;
      });
    };

    const buildOptions = (items, level = 0) => {
      let options = [];
      const filtered = filterUnits(items);
      
      filtered.forEach(item => {
        const prefix = '— '.repeat(level);
        const levelLabel = level === 0 ? ' (ریشه)' : ` (سطح ${level})`;
        
        options.push(
          <option 
            key={item.id} 
            value={item.id} 
            style={{ paddingRight: `${level * 24}px` }}
          >
            {prefix}{item.title} {item.abbreviation ? `(${item.abbreviation})` : ''}{levelLabel}
          </option>
        );
        
        if (item.children && item.children.length > 0) {
          options = options.concat(buildOptions(item.children, level + 1));
        }
      });
      return options;
    };

    if (!units || units.length === 0) {
      return [
        <option key="no-options" value="" disabled>
          — هیچ واحدی وجود ندارد —
        </option>
      ];
    }

    return buildOptions(units);
  }, [units, initialData]);

  // ============================================
  // Computed Values
  // ============================================
  const getParentFullPath = useMemo(() => {
    if (!selectedParentInfo) return null;
    
    const getPath = (unit) => {
      if (!unit) return [];
      const path = [unit.title];
      let current = unit;
      while (current.parent_id || current.parent) {
        const parentId = current.parent_id || current.parent;
        const parent = units.find(u => u.id === (typeof parentId === 'object' ? parentId.id : parentId));
        if (parent) {
          path.unshift(parent.title);
          current = parent;
        } else {
          break;
        }
      }
      return path;
    };
    
    return getPath(selectedParentInfo).join(' → ');
  }, [selectedParentInfo, units]);

  const getParentLevel = useMemo(() => {
    if (!selectedParentInfo) return 0;
    
    const getLevel = (unit) => {
      if (!unit) return 0;
      let level = 0;
      let current = unit;
      while (current.parent_id || current.parent) {
        const parentId = current.parent_id || current.parent;
        const parent = units.find(u => u.id === (typeof parentId === 'object' ? parentId.id : parentId));
        if (parent) {
          level++;
          current = parent;
        } else {
          break;
        }
      }
      return level;
    };
    
    return getLevel(selectedParentInfo);
  }, [selectedParentInfo, units]);

  const isDisabled = loading || isSubmitting;

  // ============================================
  // Render
  // ============================================
  return (
    <form onSubmit={handleSubmit} className={styles.unitForm}>
      <div className={styles.formGrid}>
        
        {/* ===== عنوان ===== */}
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>
            <Ruler size={16} />
            عنوان واحد <span className={styles.required}>*</span>
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className={`${styles.formInput} ${errors.title ? styles.error : ''}`}
            placeholder="مثال: کیلوگرم، متر، عدد، کارتن، باکس، ..."
            disabled={isDisabled}
            autoFocus
            maxLength={100}
          />
          {errors.title && <span className={styles.errorText}>⚠️ {errors.title}</span>}
          <small className={styles.fieldHelp}>عنوان کامل واحد را به فارسی وارد کنید</small>
        </div>

        {/* ===== مخفف ===== */}
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>
            <Tag size={16} />
            مخفف <span className={styles.required}>*</span>
          </label>
          <input
            type="text"
            name="abbreviation"
            value={formData.abbreviation}
            onChange={handleChange}
            className={`${styles.formInput} ${errors.abbreviation ? styles.error : ''}`}
            placeholder="مثال: kg, m, pcs, carton, box, ..."
            disabled={isDisabled}
            maxLength={10}
          />
          {errors.abbreviation && <span className={styles.errorText}>⚠️ {errors.abbreviation}</span>}
          <small className={styles.fieldHelp}>مخفف استاندارد واحد را به انگلیسی وارد کنید (حداکثر 10 کاراکتر)</small>
        </div>

        {/* ===== واحد والد ===== */}
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>
            <GitBranch size={16} />
            واحد والد
          </label>
          <select
            name="parent"
            value={formData.parent}
            onChange={handleParentChange}
            className={`${styles.formSelect} ${errors.parent ? styles.error : ''}`}
            disabled={isDisabled}
          >
            <option value="">بدون والد (واحد ریشه)</option>
            {buildTreeOptions}
          </select>
          {errors.parent && <span className={styles.errorText}>⚠️ {errors.parent}</span>}
          <small className={styles.fieldHelp}>
            در صورت انتخاب والد، این واحد به عنوان زیرمجموعه آن واحد در سلسله‌مراتب قرار می‌گیرد
          </small>
        </div>

        {/* ===== اطلاعات والد انتخاب شده ===== */}
        {selectedParentInfo && (
          <div className={`${styles.formGroup} ${styles.fullWidth}`}>
            <div className={styles.parentInfoBox}>
              <div className={styles.parentInfoHeader}>
                <Info size={16} />
                <span>اطلاعات والد انتخاب شده</span>
              </div>
              <div className={styles.parentInfoContent}>
                <div className={styles.parentInfoRow}>
                  <span className={styles.parentInfoLabel}>عنوان:</span>
                  <span className={styles.parentInfoValue}>{selectedParentInfo.title}</span>
                </div>
                <div className={styles.parentInfoRow}>
                  <span className={styles.parentInfoLabel}>مخفف:</span>
                  <span className={styles.parentInfoValue}>{selectedParentInfo.abbreviation || '-'}</span>
                </div>
                <div className={styles.parentInfoRow}>
                  <span className={styles.parentInfoLabel}>سطح:</span>
                  <span className={styles.parentInfoValue}>سطح {getParentLevel}</span>
                </div>
                <div className={styles.parentInfoRow}>
                  <span className={styles.parentInfoLabel}>مسیر کامل:</span>
                  <span className={styles.parentInfoValue}>{getParentFullPath}</span>
                </div>
                {selectedParentInfo.count_in_parent && (
                  <div className={styles.parentInfoRow}>
                    <span className={styles.parentInfoLabel}>تعداد در واحد بالاتر:</span>
                    <span className={styles.parentInfoValue}>{selectedParentInfo.count_in_parent}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ===== تعداد در واحد والد ===== */}
        {formData.parent && (
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              <Layers size={16} />
              تعداد در واحد والد <span className={styles.required}>*</span>
            </label>
            <input
              type="number"
              name="count_in_parent"
              value={formData.count_in_parent}
              onChange={handleChange}
              className={`${styles.formInput} ${errors.count_in_parent ? styles.error : ''}`}
              placeholder="مثلاً 100"
              min="1"
              max="999999"
              disabled={isDisabled}
            />
            {errors.count_in_parent && <span className={styles.errorText}>⚠️ {errors.count_in_parent}</span>}
            <small className={styles.fieldHelp}>
              تعداد این واحد در واحد والد (مثلاً اگر هر باکس شامل 100 جعبه است، مقدار 100 را وارد کنید)
            </small>
            
            <div className={styles.calculationExample}>
              <AlertCircle size={14} />
              <span>
                مثال: 1 {formData.title || 'واحد جدید'} = {formData.count_in_parent || '?'} {selectedParentInfo?.title || 'واحد والد'}
              </span>
            </div>
          </div>
        )}

        {/* ===== توضیحات ===== */}
        <div className={`${styles.formGroup} ${styles.fullWidth}`}>
          <label className={styles.formLabel}>
            <AlignLeft size={16} />
            توضیحات
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className={styles.formTextarea}
            placeholder="توضیحات تکمیلی درباره این واحد (اختیاری)..."
            rows={3}
            disabled={isDisabled}
            maxLength={500}
          />
          <small className={styles.fieldHelp}>
            {formData.description.length}/500 کاراکتر
          </small>
        </div>

        {/* ===== وضعیت فعال ===== */}
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
              واحد فعال است
            </span>
          </label>
          <small className={styles.fieldHelp}>
            در صورت غیرفعال بودن، این واحد در لیست واحدهای قابل انتخاب نمایش داده نمی‌شود
          </small>
        </div>

        {/* ===== پیش‌نمایش مسیر ===== */}
        {formData.parent && selectedParentInfo && (
          <div className={`${styles.formGroup} ${styles.fullWidth}`}>
            <div className={styles.pathPreview}>
              <span className={styles.pathLabel}>📍 مسیر نهایی:</span>
              <span className={styles.pathValue}>
                {getParentFullPath} → {formData.title || 'واحد جدید'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ===== دکمه‌های اقدام ===== */}
      <div className={styles.formActions}>
        <button
          type="button"
          onClick={onCancel}
          className={styles.secondaryBtn}
          disabled={isDisabled}
        >
          انصراف
        </button>
        <button 
          type="submit" 
          className={styles.primaryBtn} 
          disabled={isDisabled}
        >
          {isDisabled ? (
            <>
              <Loader2 size={18} className={styles.spinnerSmall} />
              {initialData ? 'در حال ویرایش...' : 'در حال ایجاد...'}
            </>
          ) : (
            initialData ? 'ویرایش واحد' : 'ایجاد واحد'
          )}
        </button>
      </div>
    </form>
  );
};

export default UnitForm;