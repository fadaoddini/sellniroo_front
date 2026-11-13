// modules/inventory/components/products/ProductForm.jsx

'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Image from 'next/image';
import {
  Package, Tag, AlignLeft, CheckCircle, Circle, Loader2, 
  Save, X, Layers, Image as ImageIcon, Plus, Trash2,
  Code, Type, FileText, AlertCircle, Box,
} from 'lucide-react';
import styles from './ProductForm.module.css';

const ProductForm = ({ 
  initialData, 
  onSubmit, 
  onCancel, 
  loading = false,
  categories = [],
  units = [],
}) => {
  const isEditing = !!initialData;

  const [formData, setFormData] = useState({
    title: '',
    code: '',
    category: '',
    root_unit: '',
    main_image: null,
    images: [],
    video: '',
    description: '',
    specifications: {},
    min_stock_alert: 10,
    is_active: true,
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [imageFiles, setImageFiles] = useState([]);

  // ============================================
  // استخراج واحدهای ریشه
  // ============================================
  const rootUnits = useMemo(() => {
    return units.filter(u => !u.parent && u.is_active);
  }, [units]);

  // ============================================
  // دریافت مسیر کامل واحد
  // ============================================
  const getUnitPath = useCallback((unitId) => {
    const unit = units.find(u => u.id === unitId);
    if (!unit) return '';
    const path = [unit.title];
    let current = unit;
    while (current.parent) {
      const parent = units.find(u => u.id === current.parent);
      if (parent) {
        path.unshift(parent.title);
        current = parent;
      } else {
        break;
      }
    }
    return path.join(' → ');
  }, [units]);

  // ============================================
  // Effect - مقداردهی اولیه
  // ============================================
  useEffect(() => {
    if (isEditing && initialData) {
      setFormData({
        title: initialData.title || '',
        code: initialData.code || '',
        category: initialData.category || '',
        root_unit: initialData.root_unit || '',
        main_image: initialData.main_image || null,
        images: initialData.images || [],
        video: initialData.video || '',
        description: initialData.description || '',
        specifications: initialData.specifications || {},
        min_stock_alert: initialData.min_stock_alert || 10,
        is_active: initialData.is_active !== undefined ? initialData.is_active : true,
      });
      setPreviewImage(initialData.main_image || null);
    } else {
      setFormData({
        title: '',
        code: '',
        category: '',
        root_unit: '',
        main_image: null,
        images: [],
        video: '',
        description: '',
        specifications: {},
        min_stock_alert: 10,
        is_active: true,
      });
      setPreviewImage(null);
      setImageFiles([]);
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
      setErrors(prev => ({ ...prev, main_image: 'حجم تصویر نباید بیشتر از 5 مگابایت باشد' }));
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setErrors(prev => ({ ...prev, main_image: 'فرمت تصویر باید jpg, png, gif یا webp باشد' }));
      return;
    }

    setFormData(prev => ({ ...prev, main_image: file }));
    setPreviewImage(URL.createObjectURL(file));
    if (errors.main_image) setErrors(prev => ({ ...prev, main_image: '' }));
  }, [errors]);

  const handleAddImage = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, images: 'حجم تصویر نباید بیشتر از 5 مگابایت باشد' }));
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setErrors(prev => ({ ...prev, images: 'فرمت تصویر باید jpg, png, gif یا webp باشد' }));
      return;
    }

    setImageFiles(prev => [...prev, file]);
    setFormData(prev => ({
      ...prev,
      images: [...(prev.images || []), URL.createObjectURL(file)]
    }));
    if (errors.images) setErrors(prev => ({ ...prev, images: '' }));
  }, [errors]);

  const handleRemoveImage = useCallback((index) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  }, []);

  const validate = useCallback(() => {
    const newErrors = {};
    
    if (!formData.title?.trim()) {
      newErrors.title = 'عنوان کالا الزامی است';
    }
    if (!formData.code?.trim()) {
      newErrors.code = 'کد کالا الزامی است';
    }
    if (!formData.root_unit) {
      newErrors.root_unit = 'واحد اصلی کالا الزامی است';
    }
    if (formData.min_stock_alert < 0) {
      newErrors.min_stock_alert = 'حداقل موجودی نباید منفی باشد';
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
          code: formData.code.trim(),
          category: formData.category || null,
          root_unit: formData.root_unit,
          main_image: formData.main_image,
          images: imageFiles,
          video: formData.video || '',
          description: formData.description || '',
          specifications: formData.specifications || {},
          min_stock_alert: parseInt(formData.min_stock_alert) || 10,
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
  }, [isSubmitting, loading, validate, formData, imageFiles, onSubmit]);

  const isDisabled = loading || isSubmitting;

  // ============================================
  // Render
  // ============================================
  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      {/* ===== Header ===== */}
      <div className={styles.formHeader}>
        <div className={styles.formHeaderIcon}>
          <Package size={24} />
        </div>
        <div>
          <h3 className={styles.formTitle}>{isEditing ? '✏️ ویرایش کالا' : '➕ کالای جدید'}</h3>
          <p className={styles.formSubtitle}>{isEditing ? 'اطلاعات کالا را ویرایش کنید' : 'یک کالای جدید ایجاد کنید'}</p>
        </div>
      </div>

      {/* ===== Form Grid ===== */}
      <div className={styles.formGrid}>
        {/* عنوان */}
        <div className={styles.formGroup}>
          <label className={styles.formLabel}><Type size={14} /> عنوان <span className={styles.required}>*</span></label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className={`${styles.formInput} ${errors.title ? styles.error : ''}`}
            placeholder="مثال: پیچ خودکار M4"
            disabled={isDisabled}
          />
          {errors.title && <span className={styles.errorText}>⚠️ {errors.title}</span>}
        </div>

        {/* کد کالا */}
        <div className={styles.formGroup}>
          <label className={styles.formLabel}><Code size={14} /> کد کالا <span className={styles.required}>*</span></label>
          <input
            type="text"
            name="code"
            value={formData.code}
            onChange={handleChange}
            className={`${styles.formInput} ${errors.code ? styles.error : ''}`}
            placeholder="مثال: SC-M4-100"
            disabled={isDisabled}
          />
          {errors.code && <span className={styles.errorText}>⚠️ {errors.code}</span>}
          <span className={styles.helperText}>کد یکتا برای شناسایی کالا</span>
        </div>

        {/* دسته‌بندی */}
        <div className={styles.formGroup}>
          <label className={styles.formLabel}><Tag size={14} /> دسته‌بندی (اختیاری)</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className={styles.formSelect}
            disabled={isDisabled}
          >
            <option value="">بدون دسته‌بندی</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.title}</option>
            ))}
          </select>
        </div>

        {/* واحد اصلی */}
        <div className={styles.formGroup}>
          <label className={styles.formLabel}><Layers size={14} /> واحد اصلی <span className={styles.required}>*</span></label>
          <select
            name="root_unit"
            value={formData.root_unit}
            onChange={handleChange}
            className={`${styles.formSelect} ${errors.root_unit ? styles.error : ''}`}
            disabled={isDisabled}
          >
            <option value="">انتخاب واحد اصلی...</option>
            {rootUnits.map(unit => (
              <option key={unit.id} value={unit.id}>
                {unit.title} {unit.abbreviation ? `(${unit.abbreviation})` : ''}
                {unit.children && unit.children.length > 0 && ` - دارای ${unit.children.length} زیرمجموعه`}
              </option>
            ))}
          </select>
          {errors.root_unit && <span className={styles.errorText}>⚠️ {errors.root_unit}</span>}
          <span className={styles.helperText}>بزرگترین واحد در سلسله‌مراتب (ریشه)</span>
          
          {formData.root_unit && (
            <div className={styles.selectedUnitInfo}>
              <span>📌 مسیر: </span>
              <span className={styles.selectedUnitPath}>{getUnitPath(parseInt(formData.root_unit))}</span>
            </div>
          )}
        </div>

        {/* تصویر اصلی */}
        <div className={`${styles.formGroup} ${styles.fullWidth}`}>
          <label className={styles.formLabel}><ImageIcon size={14} /> تصویر اصلی</label>
          <div className={styles.imageUpload}>
            {previewImage ? (
              <div className={styles.imagePreviewWrapper}>
                <Image src={previewImage} alt="تصویر اصلی" width={150} height={150} className={styles.imagePreview} />
                <button type="button" className={styles.removeImageBtn} onClick={() => { setPreviewImage(null); setFormData(prev => ({ ...prev, main_image: null })); }} disabled={isDisabled}>
                  <Trash2 size={16} />
                </button>
              </div>
            ) : (
              <div className={styles.imageUploadArea}>
                <input type="file" accept="image/*" onChange={handleImageChange} className={styles.imageInput} disabled={isDisabled} />
                <ImageIcon size={32} />
                <span>برای آپلود کلیک کنید</span>
                <span className={styles.imageHint}>jpg, png, gif, webp | max 5MB</span>
              </div>
            )}
          </div>
          {errors.main_image && <span className={styles.errorText}>⚠️ {errors.main_image}</span>}
        </div>

        {/* تصاویر اضافی */}
        <div className={`${styles.formGroup} ${styles.fullWidth}`}>
          <label className={styles.formLabel}><ImageIcon size={14} /> تصاویر اضافی</label>
          <div className={styles.imagesGrid}>
            {formData.images?.map((img, index) => (
              <div key={index} className={styles.imageItem}>
                <Image src={img} alt={`تصویر ${index + 1}`} width={80} height={80} className={styles.imageThumb} />
                <button type="button" className={styles.removeImageBtnSmall} onClick={() => handleRemoveImage(index)} disabled={isDisabled}>
                  <X size={12} />
                </button>
              </div>
            ))}
            <div className={styles.addImageBox}>
              <input type="file" accept="image/*" onChange={handleAddImage} className={styles.imageInput} disabled={isDisabled} />
              <Plus size={24} />
              <span>افزودن</span>
            </div>
          </div>
          {errors.images && <span className={styles.errorText}>⚠️ {errors.images}</span>}
        </div>

        {/* لینک ویدیو */}
        <div className={`${styles.formGroup} ${styles.fullWidth}`}>
          <label className={styles.formLabel}><FileText size={14} /> لینک فیلم معرفی (اختیاری)</label>
          <input type="url" name="video" value={formData.video} onChange={handleChange} className={styles.formInput} placeholder="https://www.youtube.com/watch?v=..." disabled={isDisabled} />
        </div>

        {/* توضیحات */}
        <div className={`${styles.formGroup} ${styles.fullWidth}`}>
          <label className={styles.formLabel}><AlignLeft size={14} /> توضیحات (اختیاری)</label>
          <textarea name="description" value={formData.description} onChange={handleChange} className={styles.formTextarea} placeholder="توضیحات کامل کالا..." rows={3} disabled={isDisabled} />
        </div>

        {/* حداقل موجودی هشدار */}
        <div className={styles.formGroup}>
          <label className={styles.formLabel}><AlertCircle size={14} /> حداقل موجودی هشدار</label>
          <input
            type="number"
            name="min_stock_alert"
            value={formData.min_stock_alert}
            onChange={handleChange}
            className={`${styles.formInput} ${errors.min_stock_alert ? styles.error : ''}`}
            min="0"
            disabled={isDisabled}
          />
          {errors.min_stock_alert && <span className={styles.errorText}>⚠️ {errors.min_stock_alert}</span>}
          <span className={styles.helperText}>زیر این مقدار، هشدار موجودی کم نمایش داده می‌شود</span>
        </div>

        {/* فعال/غیرفعال */}
        <div className={`${styles.formGroup} ${styles.fullWidth}`}>
          <label className={styles.formCheckbox}>
            <input type="checkbox" name="is_active" checked={formData.is_active} onChange={handleChange} disabled={isDisabled} />
            <span>
              {formData.is_active ? <CheckCircle size={16} style={{ color: '#2e7d32' }} /> : <Circle size={16} style={{ color: '#c62828' }} />}
              کالا فعال است
            </span>
          </label>
        </div>
      </div>

      {/* ===== Actions ===== */}
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

export default ProductForm;