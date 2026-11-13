// modules/inventory/components/in/StockInForm.jsx

'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Package, Warehouse, Layers, Tag, User, Calendar, Loader2, Save, X, ArrowDownToLine, Info, GitBranch, ChevronDown } from 'lucide-react';
import styles from './in.module.css';

const StockInForm = ({
  products = [],
  warehouses = [],
  units = [],
  onSubmit,
  onCancel,
  loading = false,
}) => {
  const [formData, setFormData] = useState({
    product_id: '',
    warehouse_id: '',
    root_unit_id: '',      // ✅ واحد ریشه انتخاب شده
    unit_id: '',           // ✅ واحد نهایی (زیرمجموعه)
    quantity: 1,
    description: '',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedRootUnit, setSelectedRootUnit] = useState(null);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [totalInBase, setTotalInBase] = useState(null);
  const [unitPath, setUnitPath] = useState('');

  // ============================================
  // محاسبه واحدهای ریشه (بدون والد)
  // ============================================
  const rootUnits = useMemo(() => {
    return units.filter(u => !u.parent || u.parent === null);
  }, [units]);

  // ============================================
  // محاسبه زیرمجموعه‌های یک ریشه
  // ============================================
  const getSubUnits = useCallback((rootUnitId) => {
    if (!rootUnitId) return [];
    
    // پیدا کردن همه واحدهایی که در زنجیره این ریشه هستند
    const result = [];
    const findChildren = (parentId, level = 0) => {
      const children = units.filter(u => u.parent === parentId);
      children.forEach(child => {
        result.push({ ...child, _level: level + 1 });
        findChildren(child.id, level + 1);
      });
    };
    
    findChildren(rootUnitId);
    return result;
  }, [units]);

  // ============================================
  // زیرمجموعه‌های ریشه انتخاب شده
  // ============================================
  const availableSubUnits = useMemo(() => {
    if (!formData.root_unit_id) return [];
    return getSubUnits(parseInt(formData.root_unit_id));
  }, [formData.root_unit_id, getSubUnits]);

  // ============================================
  // Reset form when products/units change
  // ============================================
  useEffect(() => {
    setFormData({
      product_id: '',
      warehouse_id: '',
      root_unit_id: '',
      unit_id: '',
      quantity: 1,
      description: '',
    });
    setSelectedProduct(null);
    setSelectedRootUnit(null);
    setSelectedUnit(null);
    setTotalInBase(null);
    setUnitPath('');
    setErrors({});
  }, []);

  // ============================================
  // محاسبه مسیر کامل واحد
  // ============================================
  const getUnitFullPath = useCallback((unitId) => {
    if (!unitId) return '';
    const unit = units.find(u => u.id === parseInt(unitId));
    if (!unit) return '';
    
    const path = [unit.title];
    let current = unit;
    while (current.parent) {
      const parent = units.find(u => u.id === parseInt(current.parent));
      if (!parent) break;
      path.unshift(parent.title);
      current = parent;
    }
    return path.join(' → ');
  }, [units]);

  // ============================================
  // محاسبه تعداد در واحد پایه
  // ============================================
  useEffect(() => {
    if (selectedUnit && formData.quantity) {
      // پیدا کردن واحد پایه (ریشه)
      const rootUnit = units.find(u => u.id === parseInt(formData.root_unit_id));
      if (rootUnit) {
        if (selectedUnit.id === rootUnit.id) {
          setTotalInBase(formData.quantity);
        } else {
          // محاسبه ضریب تبدیل
          let multiplier = 1;
          let current = selectedUnit;
          while (current.parent) {
            multiplier *= current.count_in_parent || 1;
            const parent = units.find(u => u.id === parseInt(current.parent));
            if (!parent) break;
            current = parent;
          }
          setTotalInBase(formData.quantity * multiplier);
        }
      } else {
        setTotalInBase(null);
      }
    } else {
      setTotalInBase(null);
    }
  }, [selectedUnit, formData.quantity, units, formData.root_unit_id]);

  // ============================================
  // به‌روزرسانی مسیر واحد
  // ============================================
  useEffect(() => {
    if (formData.unit_id) {
      const path = getUnitFullPath(formData.unit_id);
      setUnitPath(path);
    } else {
      setUnitPath('');
    }
  }, [formData.unit_id, getUnitFullPath]);

  // ============================================
  // Handlers
  // ============================================
  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    
    setFormData(prev => ({ ...prev, [name]: val }));
    
    // Update selected product
    if (name === 'product_id' && value) {
      const product = products.find(p => p.id === parseInt(value));
      setSelectedProduct(product || null);
      // Reset unit selections
      setFormData(prev => ({ ...prev, root_unit_id: '', unit_id: '' }));
      setSelectedRootUnit(null);
      setSelectedUnit(null);
      setTotalInBase(null);
      setUnitPath('');
    }
    
    // Update selected root unit
    if (name === 'root_unit_id' && value) {
      const root = units.find(u => u.id === parseInt(value));
      setSelectedRootUnit(root || null);
      // Reset sub unit
      setFormData(prev => ({ ...prev, unit_id: '' }));
      setSelectedUnit(null);
      setTotalInBase(null);
      setUnitPath('');
    }
    
    // Update selected unit
    if (name === 'unit_id' && value) {
      const unit = units.find(u => u.id === parseInt(value));
      setSelectedUnit(unit || null);
    }
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  }, [errors, products, units]);

  // ============================================
  // Validation
  // ============================================
  const validate = useCallback(() => {
    const newErrors = {};
    if (!formData.product_id) newErrors.product_id = 'انتخاب کالا الزامی است';
    if (!formData.warehouse_id) newErrors.warehouse_id = 'انتخاب انبار الزامی است';
    if (!formData.root_unit_id) newErrors.root_unit_id = 'انتخاب واحد ریشه الزامی است';
    if (!formData.unit_id) newErrors.unit_id = 'انتخاب واحد الزامی است';
    if (!formData.quantity || formData.quantity < 1) newErrors.quantity = 'تعداد باید حداقل ۱ باشد';
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
        await onSubmit({
          product_id: parseInt(formData.product_id),
          warehouse_id: parseInt(formData.warehouse_id),
          unit_id: parseInt(formData.unit_id),  // ✅ واحد نهایی ارسال میشه
          quantity: parseInt(formData.quantity),
          description: formData.description?.trim() || '',
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

  // ============================================
  // Render - انتخاب واحد با سطح بندی
  // ============================================
  return (
    <form onSubmit={handleSubmit} className={styles.stockForm}>
      <div className={styles.formHeader}>
        <div className={styles.formHeaderIcon} style={{ background: 'rgba(46,125,50,0.1)' }}>
          <ArrowDownToLine size={24} style={{ color: 'var(--secondary)' }} />
        </div>
        <div>
          <h3 className={styles.formTitle}>📥 ورود کالا به انبار</h3>
          <p className={styles.formSubtitle}>کالا را با واحد دلخواه وارد انبار کنید</p>
        </div>
      </div>

      <div className={styles.formGridStock}>
        {/* کالا */}
        <div className={styles.formGroup}>
          <label className={styles.formLabel}><Package size={14} /> کالا <span className={styles.required}>*</span></label>
          <select name="product_id" value={formData.product_id} onChange={handleChange}
            className={`${styles.formSelect} ${errors.product_id ? styles.error : ''}`} disabled={isDisabled}>
            <option value="">انتخاب کالا...</option>
            {products.filter(p => p.is_active !== false).map(p => (
              <option key={p.id} value={p.id}>{p.title} ({p.code})</option>
            ))}
          </select>
          {errors.product_id && <span className={styles.errorText}>⚠️ {errors.product_id}</span>}
        </div>

        {/* انبار */}
        <div className={styles.formGroup}>
          <label className={styles.formLabel}><Warehouse size={14} /> انبار <span className={styles.required}>*</span></label>
          <select name="warehouse_id" value={formData.warehouse_id} onChange={handleChange}
            className={`${styles.formSelect} ${errors.warehouse_id ? styles.error : ''}`} disabled={isDisabled}>
            <option value="">انتخاب انبار...</option>
            {warehouses.filter(w => w.is_active !== false).map(w => (
              <option key={w.id} value={w.id}>{w.title}</option>
            ))}
          </select>
          {errors.warehouse_id && <span className={styles.errorText}>⚠️ {errors.warehouse_id}</span>}
        </div>

        {/* ✅ انتخاب واحد ریشه */}
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>
            <GitBranch size={14} /> واحد ریشه <span className={styles.required}>*</span>
          </label>
          <select 
            name="root_unit_id" 
            value={formData.root_unit_id} 
            onChange={handleChange}
            className={`${styles.formSelect} ${errors.root_unit_id ? styles.error : ''}`} 
            disabled={isDisabled || !selectedProduct}
          >
            <option value="">انتخاب واحد ریشه...</option>
            {rootUnits.map(u => (
              <option key={u.id} value={u.id}>
                🌳 {u.title} {u.abbreviation && `(${u.abbreviation})`}
              </option>
            ))}
          </select>
          {errors.root_unit_id && <span className={styles.errorText}>⚠️ {errors.root_unit_id}</span>}
          {selectedProduct && rootUnits.length === 0 && (
            <span className={styles.helperText}>⚠️ هیچ واحد ریشه‌ای تعریف نشده است</span>
          )}
          {selectedRootUnit && (
            <span className={styles.helperText} style={{ color: 'var(--secondary)' }}>
              ✅ {selectedRootUnit.title} انتخاب شد
            </span>
          )}
        </div>

        {/* ✅ انتخاب زیرمجموعه */}
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>
            <Layers size={14} /> واحد <span className={styles.required}>*</span>
          </label>
          <select 
            name="unit_id" 
            value={formData.unit_id} 
            onChange={handleChange}
            className={`${styles.formSelect} ${errors.unit_id ? styles.error : ''}`} 
            disabled={isDisabled || !formData.root_unit_id}
          >
            <option value="">انتخاب واحد...</option>
            <option value={formData.root_unit_id}>
              🌳 {selectedRootUnit?.title || 'ریشه'} (واحد اصلی)
            </option>
            {availableSubUnits.map(u => {
              const level = u._level || 0;
              const prefix = '— '.repeat(level);
              return (
                <option key={u.id} value={u.id} style={{ paddingRight: `${level * 16}px` }}>
                  {prefix} {u.title} {u.abbreviation && `(${u.abbreviation})`}
                  {u.count_in_parent && ` ← ${u.count_in_parent} تا در والد`}
                </option>
              );
            })}
          </select>
          {errors.unit_id && <span className={styles.errorText}>⚠️ {errors.unit_id}</span>}
          {formData.root_unit_id && availableSubUnits.length === 0 && (
            <span className={styles.helperText}>ℹ️ این واحد ریشه زیرمجموعه‌ای ندارد</span>
          )}
        </div>

        {/* تعداد */}
        <div className={styles.formGroup}>
          <label className={styles.formLabel}><Tag size={14} /> تعداد <span className={styles.required}>*</span></label>
          <input type="number" name="quantity" value={formData.quantity} onChange={handleChange}
            className={`${styles.formInput} ${errors.quantity ? styles.error : ''}`}
            placeholder="مثلاً ۱۰" min="1" disabled={isDisabled} />
          {errors.quantity && <span className={styles.errorText}>⚠️ {errors.quantity}</span>}
          <span className={styles.helperText}>تعداد بر اساس واحد انتخاب شده</span>
        </div>

        {/* ✅ نمایش مسیر کامل واحد */}
        {unitPath && (
          <div className={`${styles.formGroup} ${styles.fullWidth}`}>
            <div className={styles.pathBox}>
              <GitBranch size={14} />
              <span>📍 مسیر: <strong>{unitPath}</strong></span>
            </div>
          </div>
        )}

        {/* ✅ محاسبه تعداد در واحد پایه */}
        {totalInBase !== null && selectedUnit && (
          <div className={`${styles.formGroup} ${styles.fullWidth}`}>
            <div className={styles.calcBoxStock}>
              <Info size={16} />
              <span>
                📊 <strong>{formData.quantity}</strong> {selectedUnit.title} = 
                <strong style={{ fontSize: '1rem', margin: '0 4px' }}> {totalInBase.toLocaleString()} </strong> 
                {selectedRootUnit?.title || 'واحد پایه'}
              </span>
            </div>
          </div>
        )}

        {/* توضیحات */}
        <div className={`${styles.formGroup} ${styles.fullWidth}`}>
          <label className={styles.formLabel}><Tag size={14} /> توضیحات (اختیاری)</label>
          <textarea name="description" value={formData.description} onChange={handleChange}
            className={styles.formTextarea} placeholder="توضیحات مربوط به این ورود..." rows={2} disabled={isDisabled} />
        </div>

        {/* اطلاعات محصول انتخاب شده */}
        {selectedProduct && (
          <div className={`${styles.formGroup} ${styles.fullWidth}`}>
            <div className={styles.productInfoBox}>
              <Package size={14} />
              <span><strong>{selectedProduct.title}</strong> ({selectedProduct.code})</span>
              {selectedProduct.category && <span className={styles.categoryTag}>📁 {selectedProduct.category}</span>}
              {selectedProduct.root_unit_title && (
                <span className={styles.categoryTag} style={{ background: '#e8f5e9', color: '#2e7d32' }}>
                  <Layers size={12} /> {selectedProduct.root_unit_title}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      <div className={styles.formActions}>
        <button type="button" onClick={onCancel} className={styles.secondaryBtn} disabled={isDisabled}>
          <X size={16} /> انصراف
        </button>
        <button type="submit" className={styles.primaryBtn} disabled={isDisabled} style={{ background: 'var(--secondary)' }}>
          {isDisabled ? <><Loader2 size={16} className={styles.spinnerSmall} />در حال...</> : <><Save size={16} />ثبت ورود</>}
        </button>
      </div>
    </form>
  );
};

export default StockInForm;