// modules/inventory/components/Products/ProductForm.jsx
'use client';

import React, { useState, useEffect } from 'react';
import styles from '@/styles/modules/InventoryCommon.module.css';
import { 
  Package, 
  Hash, 
  FolderTree, 
  Ruler, 
  Image, 
  Video, 
  AlignLeft,
  Settings,
  AlertCircle,
  CheckCircle,
  Loader2,
  Trash2,
  Plus,
  X
} from 'lucide-react';

const ProductForm = ({
  initialData, 
  onSubmit, 
  onCancel, 
  loading = false,
  categories = [],
  units = [],
}) => {
  const [formData, setFormData] = useState({
    title: '',
    code: '',
    category: '',
    base_unit: '',
    main_image: null,
    images: [],
    video: '',
    description: '',
    specifications: {},
    min_stock_alert: 10,
    is_active: true,
  });

  const [errors, setErrors] = useState({});
  const [imageUrls, setImageUrls] = useState([]);
  const [showSpecInput, setShowSpecInput] = useState(false);
  const [newSpecKey, setNewSpecKey] = useState('');
  const [newSpecValue, setNewSpecValue] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        code: initialData.code || '',
        category: initialData.category || '',
        base_unit: initialData.base_unit || '',
        main_image: null,
        images: initialData.images || [],
        video: initialData.video || '',
        description: initialData.description || '',
        specifications: initialData.specifications || {},
        min_stock_alert: initialData.min_stock_alert || 10,
        is_active: initialData.is_active !== undefined ? initialData.is_active : true,
      });
      setImageUrls(initialData.images || []);
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'file' ? files[0] : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleImagesChange = (e) => {
    const files = Array.from(e.target.files);
    setFormData((prev) => ({
      ...prev,
      images: files,
    }));
  };

  const handleSpecificationChange = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      specifications: {
        ...prev.specifications,
        [key]: value,
      },
    }));
  };

  const addSpecification = () => {
    if (newSpecKey.trim() && newSpecValue.trim()) {
      handleSpecificationChange(newSpecKey.trim(), newSpecValue.trim());
      setNewSpecKey('');
      setNewSpecValue('');
      setShowSpecInput(false);
    }
  };

  const removeSpecification = (key) => {
    const newSpecs = { ...formData.specifications };
    delete newSpecs[key];
    setFormData((prev) => ({
      ...prev,
      specifications: newSpecs,
    }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.title?.trim()) {
      newErrors.title = 'عنوان کالا الزامی است';
    }
    if (!formData.code?.trim()) {
      newErrors.code = 'کد کالا الزامی است';
    }
    if (!formData.base_unit) {
      newErrors.base_unit = 'واحد پایه الزامی است';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      const data = new FormData();
      Object.keys(formData).forEach((key) => {
        if (key === 'images') {
          if (Array.isArray(formData.images) && formData.images.length > 0) {
            if (formData.images[0] instanceof File) {
              formData.images.forEach((file) => {
                data.append('images', file);
              });
            }
          }
        } else if (key === 'specifications') {
          data.append(key, JSON.stringify(formData.specifications));
        } else if (formData[key] !== null && formData[key] !== undefined) {
          data.append(key, formData[key]);
        }
      });
      onSubmit(data);
    }
  };

  const isDisabled = loading;

  return (
    <form onSubmit={handleSubmit} className={styles.productForm}>
      <div className={styles.formGrid}>
        {/* عنوان */}
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>
            <Package size={16} />
            عنوان کالا <span className={styles.required}>*</span>
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className={`${styles.formInput} ${errors.title ? styles.error : ''}`}
            placeholder="عنوان کالا را وارد کنید"
            disabled={isDisabled}
            autoFocus
          />
          {errors.title && <span className={styles.errorText}>⚠️ {errors.title}</span>}
        </div>

        {/* کد */}
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>
            <Hash size={16} />
            کد کالا <span className={styles.required}>*</span>
          </label>
          <input
            type="text"
            name="code"
            value={formData.code}
            onChange={handleChange}
            className={`${styles.formInput} ${errors.code ? styles.error : ''}`}
            placeholder="کد کالا را وارد کنید"
            disabled={isDisabled || !!initialData}
          />
          {errors.code && <span className={styles.errorText}>⚠️ {errors.code}</span>}
          {initialData && (
            <small className={styles.fieldHelp}>کد کالا قابل ویرایش نیست</small>
          )}
        </div>

        {/* دسته‌بندی */}
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>
            <FolderTree size={16} />
            دسته‌بندی
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className={styles.formSelect}
            disabled={isDisabled}
          >
            <option value="">انتخاب دسته‌بندی</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.title}
              </option>
            ))}
          </select>
        </div>

        {/* واحد پایه */}
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>
            <Ruler size={16} />
            واحد پایه <span className={styles.required}>*</span>
          </label>
          <select
            name="base_unit"
            value={formData.base_unit}
            onChange={handleChange}
            className={`${styles.formSelect} ${errors.base_unit ? styles.error : ''}`}
            disabled={isDisabled}
          >
            <option value="">انتخاب واحد</option>
            {units.map((unit) => (
              <option key={unit.id} value={unit.id}>
                {unit.title} ({unit.abbreviation})
              </option>
            ))}
          </select>
          {errors.base_unit && <span className={styles.errorText}>⚠️ {errors.base_unit}</span>}
        </div>

        {/* تصویر اصلی */}
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>
            <Image size={16} />
            تصویر اصلی
          </label>
          <input
            type="file"
            name="main_image"
            onChange={handleChange}
            className={styles.formFile}
            accept="image/*"
            disabled={isDisabled}
          />
          {initialData?.main_image && (
            <div className={styles.imagePreview}>
              <img src={initialData.main_image} alt="تصویر اصلی فعلی" />
            </div>
          )}
        </div>

        {/* تصاویر اضافی */}
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>
            <Image size={16} />
            تصاویر اضافی
          </label>
          <input
            type="file"
            name="images"
            onChange={handleImagesChange}
            className={styles.formFile}
            accept="image/*"
            multiple
            disabled={isDisabled}
          />
          {imageUrls.length > 0 && (
            <div className={styles.imagesPreview}>
              {imageUrls.map((url, idx) => (
                <img key={idx} src={url} alt={`تصویر ${idx + 1}`} />
              ))}
            </div>
          )}
        </div>

        {/* ویدئو */}
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>
            <Video size={16} />
            لینک ویدئو معرفی
          </label>
          <input
            type="url"
            name="video"
            value={formData.video}
            onChange={handleChange}
            className={styles.formInput}
            placeholder="https://example.com/video"
            disabled={isDisabled}
          />
        </div>

        {/* حداقل موجودی هشدار */}
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>
            <AlertCircle size={16} />
            حداقل موجودی هشدار
          </label>
          <input
            type="number"
            name="min_stock_alert"
            value={formData.min_stock_alert}
            onChange={handleChange}
            className={styles.formInput}
            min="0"
            disabled={isDisabled}
          />
          <small className={styles.fieldHelp}>
            وقتی موجودی به این مقدار رسید، هشدار نمایش داده می‌شود
          </small>
        </div>

        {/* فعال */}
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
              {formData.is_active ? (
                <CheckCircle size={16} style={{ color: '#2e7d32' }} />
              ) : (
                <X size={16} style={{ color: '#c62828' }} />
              )}
              کالا فعال است
            </span>
          </label>
        </div>

        {/* توضیحات */}
        <div className={`${styles.formGroup} ${styles.fullWidth}`}>
          <label className={styles.formLabel}>
            <AlignLeft size={16} />
            توضیحات کامل
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className={styles.formTextarea}
            placeholder="توضیحات کامل کالا را وارد کنید"
            rows={4}
            disabled={isDisabled}
          />
        </div>

        {/* مشخصات فنی */}
        <div className={`${styles.formGroup} ${styles.fullWidth}`}>
          <label className={styles.formLabel}>
            <Settings size={16} />
            مشخصات فنی
          </label>
          <div className={styles.specsContainer}>
            {Object.entries(formData.specifications).length === 0 ? (
              <div className={styles.emptySpecs}>
                <Settings size={32} />
                <span>هیچ مشخصه‌ای ثبت نشده است</span>
                <span style={{ fontSize: '0.75rem' }}>
                  برای افزودن مشخصه، دکمه زیر را کلیک کنید
                </span>
              </div>
            ) : (
              Object.entries(formData.specifications).map(([key, value]) => (
                <div key={key} className={styles.specItem}>
                  <span className={styles.specKey}>{key}</span>
                  <span className={styles.specValue}>{value}</span>
                  <button
                    type="button"
                    onClick={() => removeSpecification(key)}
                    className={styles.specRemove}
                    disabled={isDisabled}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))
            )}
            
            {showSpecInput ? (
              <div className={styles.specInputGroup}>
                <input
                  type="text"
                  placeholder="نام مشخصه..."
                  value={newSpecKey}
                  onChange={(e) => setNewSpecKey(e.target.value)}
                  className={styles.specInput}
                  disabled={isDisabled}
                  autoFocus
                />
                <input
                  type="text"
                  placeholder="مقدار..."
                  value={newSpecValue}
                  onChange={(e) => setNewSpecValue(e.target.value)}
                  className={styles.specInput}
                  disabled={isDisabled}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addSpecification();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={addSpecification}
                  className={styles.specConfirmBtn}
                  disabled={isDisabled || !newSpecKey.trim() || !newSpecValue.trim()}
                >
                  <CheckCircle size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowSpecInput(false);
                    setNewSpecKey('');
                    setNewSpecValue('');
                  }}
                  className={styles.specCancelBtn}
                  disabled={isDisabled}
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowSpecInput(true)}
                className={styles.specAddBtn}
                disabled={isDisabled}
              >
                <Plus size={16} />
                افزودن مشخصه
              </button>
            )}
          </div>
        </div>
      </div>

      {/* دکمه‌های اقدام */}
      <div className={styles.formActions}>
        <button
          type="button"
          onClick={onCancel}
          className={styles.secondaryBtn}
          disabled={isDisabled}
        >
          انصراف
        </button>
        <button type="submit" className={styles.primaryBtn} disabled={isDisabled}>
          {isDisabled ? (
            <>
              <Loader2 size={18} className={styles.spinnerSmall} />
              {initialData ? 'در حال ویرایش...' : 'در حال ایجاد...'}
            </>
          ) : (
            initialData ? 'ویرایش کالا' : 'ایجاد کالا'
          )}
        </button>
      </div>
    </form>
  );
};

export default ProductForm;