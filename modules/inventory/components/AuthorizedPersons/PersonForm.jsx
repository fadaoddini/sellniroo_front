// modules/inventory/components/AuthorizedPersons/PersonForm.jsx

'use client';

import React, { useState, useEffect } from 'react';
import styles from '@/styles/modules/InventoryCommon.module.css';
import { 
  User, 
  Briefcase, 
  Phone, 
  Mail, 
  Building2,
  CheckCircle,
  X,
  Loader2,
  Shield,
  ShieldCheck,
  ShieldOff,
  UserCheck,
  UserX
} from 'lucide-react';

const PersonForm = ({ 
  initialData, 
  onSubmit, 
  onCancel, 
  loading = false,
  warehouses = [],
}) => {
  const [formData, setFormData] = useState({
    full_name: '',
    position: '',
    phone: '',
    email: '',
    warehouses: [],
    can_confirm: true,
    is_active: true,
  });

  const [errors, setErrors] = useState({});
  const [selectedWarehouses, setSelectedWarehouses] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ============================================
  // Initialize Form
  // ============================================
  useEffect(() => {
    if (initialData) {
      // اگر initialData دارای warehouse_ids است از آن استفاده کن
      const warehouseIds = initialData.warehouses || initialData.warehouse_ids || [];
      
      setFormData({
        full_name: initialData.full_name || '',
        position: initialData.position || '',
        phone: initialData.phone || '',
        email: initialData.email || '',
        warehouses: warehouseIds,
        can_confirm: initialData.can_confirm !== undefined ? initialData.can_confirm : true,
        is_active: initialData.is_active !== undefined ? initialData.is_active : true,
      });
      
      // تنظیم نام انبارهای انتخاب شده
      if (warehouseIds.length > 0) {
        const names = warehouseIds
          .map(id => {
            const warehouse = warehouses.find(w => w.id === id);
            return warehouse ? warehouse.title : null;
          })
          .filter(Boolean);
        setSelectedWarehouses(names);
      }
    }
  }, [initialData, warehouses]);

  // ============================================
  // Handlers
  // ============================================
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleWarehouseChange = (e) => {
    const options = e.target.options;
    const selected = [];
    const selectedNames = [];
    
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        const id = parseInt(options[i].value);
        if (!isNaN(id)) {
          selected.push(id);
          const warehouse = warehouses.find(w => w.id === id);
          if (warehouse) {
            selectedNames.push(warehouse.title);
          }
        }
      }
    }
    
    setFormData((prev) => ({
      ...prev,
      warehouses: selected,
    }));
    setSelectedWarehouses(selectedNames);
    
    if (errors.warehouses) {
      setErrors((prev) => ({ ...prev, warehouses: '' }));
    }
  };

  // ============================================
  // Validation
  // ============================================
  const validate = () => {
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
    
    if (formData.warehouses.length === 0) {
      newErrors.warehouses = 'حداقل یک انبار را انتخاب کنید';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ============================================
  // Submit - اصلاح شده
  // ============================================
const handleSubmit = async (e) => {
  e.preventDefault();
  if (isSubmitting || loading) return;
  
  if (validate()) {
    setIsSubmitting(true);
    try {
      // ✅ اضافه کردن user_id (شناسه کاربر فعلی)
      const dataToSubmit = {
        full_name: formData.full_name.trim(),
        position: formData.position.trim(),
        phone: formData.phone.trim(),
        email: formData.email?.trim() || '',
        warehouses: formData.warehouses,
        can_confirm: formData.can_confirm,
        is_active: formData.is_active,
        user_id: 1, // یا از Context بگیرید
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
};

  // ============================================
  // Render
  // ============================================
  const isDisabled = loading || isSubmitting;

  return (
    <form onSubmit={handleSubmit} className={styles.personForm}>
      <div className={styles.formGrid}>
        
        {/* ===== نام کامل ===== */}
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>
            <User size={16} />
            نام کامل <span className={styles.required}>*</span>
          </label>
          <input
            type="text"
            name="full_name"
            value={formData.full_name}
            onChange={handleChange}
            className={`${styles.formInput} ${errors.full_name ? styles.error : ''}`}
            placeholder="نام کامل را وارد کنید"
            disabled={isDisabled}
            autoFocus
          />
          {errors.full_name && <span className={styles.errorText}>⚠️ {errors.full_name}</span>}
        </div>

        {/* ===== سمت ===== */}
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>
            <Briefcase size={16} />
            سمت <span className={styles.required}>*</span>
          </label>
          <input
            type="text"
            name="position"
            value={formData.position}
            onChange={handleChange}
            className={`${styles.formInput} ${errors.position ? styles.error : ''}`}
            placeholder="سمت را وارد کنید"
            disabled={isDisabled}
          />
          {errors.position && <span className={styles.errorText}>⚠️ {errors.position}</span>}
        </div>

        {/* ===== تلفن ===== */}
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>
            <Phone size={16} />
            تلفن <span className={styles.required}>*</span>
          </label>
          <input
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className={`${styles.formInput} ${errors.phone ? styles.error : ''}`}
            placeholder="تلفن را وارد کنید"
            disabled={isDisabled}
          />
          {errors.phone && <span className={styles.errorText}>⚠️ {errors.phone}</span>}
        </div>

        {/* ===== ایمیل ===== */}
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>
            <Mail size={16} />
            ایمیل
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={styles.formInput}
            placeholder="ایمیل را وارد کنید"
            disabled={isDisabled}
          />
        </div>

        {/* ===== انبارهای مجاز ===== */}
        <div className={`${styles.formGroup} ${styles.fullWidth}`}>
          <label className={styles.formLabel}>
            <Building2 size={16} />
            انبارهای مجاز <span className={styles.required}>*</span>
          </label>
          <select
            name="warehouses"
            multiple
            value={formData.warehouses.map(String)}
            onChange={handleWarehouseChange}
            className={`${styles.formSelect} ${errors.warehouses ? styles.error : ''}`}
            disabled={isDisabled}
          >
            {warehouses.map((w) => (
              <option key={w.id} value={w.id}>
                {w.title}
              </option>
            ))}
          </select>
          <small className={styles.fieldHelp}>
            برای انتخاب چند مورد، کلید Ctrl (یا ⌘) را نگه دارید
          </small>
          {errors.warehouses && <span className={styles.errorText}>⚠️ {errors.warehouses}</span>}
          
          {/* نمایش انبارهای انتخاب شده */}
          {selectedWarehouses.length > 0 && (
            <div className={styles.selectedWarehouses}>
              <span className={styles.selectedLabel}>انبارهای انتخاب شده:</span>
              {selectedWarehouses.map((name, idx) => (
                <span key={idx} className={styles.warehouseBadge}>
                  <Building2 size={12} />
                  {name}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* ===== چک‌باکس‌ها ===== */}
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
              {formData.can_confirm ? (
                <ShieldCheck size={16} style={{ color: '#1976d2' }} />
              ) : (
                <ShieldOff size={16} style={{ color: '#c62828' }} />
              )}
              امکان تایید خروج
            </span>
          </label>
          <small className={styles.fieldHelp}>
            در صورت فعال بودن، این فرد می‌تواند خروج کالا را تایید کند
          </small>
        </div>

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
                <UserCheck size={16} style={{ color: '#2e7d32' }} />
              ) : (
                <UserX size={16} style={{ color: '#c62828' }} />
              )}
              فعال
            </span>
          </label>
          <small className={styles.fieldHelp}>
            در صورت غیرفعال بودن، این فرد قابل انتخاب نخواهد بود
          </small>
        </div>
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
            initialData ? 'ویرایش فرد مجاز' : 'ایجاد فرد مجاز'
          )}
        </button>
      </div>
    </form>
  );
};

export default PersonForm;