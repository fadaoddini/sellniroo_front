// modules/inventory/components/out/StockOutForm.jsx

'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Package, Warehouse, Layers, Tag, User, Calendar, Loader2, Save, X, ArrowUpFromLine, Info, AlertCircle } from 'lucide-react';
import styles from './out.module.css';

const StockOutForm = ({
  products = [],
  warehouses = [],
  units = [],
  authorizedPersons = [],
  onSubmit,
  onCancel,
  loading = false,
}) => {
  const [formData, setFormData] = useState({
    product_id: '',
    warehouse_id: '',
    unit_id: '',
    quantity: 1,
    authorized_person_id: '',
    description: '',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [totalInBase, setTotalInBase] = useState(null);
  const [stockInfo, setStockInfo] = useState(null);

  useEffect(() => {
    setFormData({
      product_id: '', warehouse_id: '', unit_id: '', quantity: 1,
      authorized_person_id: '', description: '',
    });
    setSelectedProduct(null);
    setSelectedUnit(null);
    setTotalInBase(null);
    setStockInfo(null);
    setErrors({});
  }, []);

  const availableUnits = useMemo(() => {
    if (!selectedProduct) return [];
    return units.filter(u => u.is_active !== false);
  }, [selectedProduct, units]);

  useEffect(() => {
    if (selectedUnit && formData.quantity) {
      const baseUnit = units.find(u => !u.parent);
      if (baseUnit && selectedUnit.id !== baseUnit.id) {
        let multiplier = 1;
        let current = selectedUnit;
        while (current.parent) {
          multiplier *= current.count_in_parent || 1;
          const parent = units.find(u => u.id === current.parent);
          if (!parent) break;
          current = parent;
        }
        setTotalInBase(formData.quantity * multiplier);
      } else {
        setTotalInBase(formData.quantity);
      }
    } else {
      setTotalInBase(null);
    }
  }, [selectedUnit, formData.quantity, units]);

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    
    setFormData(prev => ({ ...prev, [name]: val }));
    
    if (name === 'product_id' && value) {
      const product = products.find(p => p.id === parseInt(value));
      setSelectedProduct(product || null);
      setFormData(prev => ({ ...prev, unit_id: '' }));
      setSelectedUnit(null);
      setTotalInBase(null);
      // Simulate stock check
      if (product) {
        setStockInfo({ available: 1000, reserved: 0 });
      }
    }
    
    if (name === 'unit_id' && value) {
      const unit = units.find(u => u.id === parseInt(value));
      setSelectedUnit(unit || null);
    }
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  }, [errors, products, units]);

  const validate = useCallback(() => {
    const newErrors = {};
    if (!formData.product_id) newErrors.product_id = 'انتخاب کالا الزامی است';
    if (!formData.warehouse_id) newErrors.warehouse_id = 'انتخاب انبار الزامی است';
    if (!formData.unit_id) newErrors.unit_id = 'انتخاب واحد الزامی است';
    if (!formData.quantity || formData.quantity < 1) newErrors.quantity = 'تعداد باید حداقل ۱ باشد';
    if (totalInBase !== null && stockInfo && totalInBase > stockInfo.available) {
      newErrors.quantity = `موجودی کافی نیست. موجودی: ${stockInfo.available}`;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, totalInBase, stockInfo]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (isSubmitting || loading) return;
    if (validate()) {
      setIsSubmitting(true);
      try {
        await onSubmit({
          product_id: parseInt(formData.product_id),
          warehouse_id: parseInt(formData.warehouse_id),
          unit_id: parseInt(formData.unit_id),
          quantity: parseInt(formData.quantity),
          authorized_person_id: formData.authorized_person_id ? parseInt(formData.authorized_person_id) : null,
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

  return (
    <form onSubmit={handleSubmit} className={styles.stockForm}>
      <div className={styles.formHeader}>
        <div className={styles.formHeaderIcon} style={{ background: 'rgba(198,40,40,0.08)' }}>
          <ArrowUpFromLine size={24} style={{ color: 'var(--macos-red)' }} />
        </div>
        <div>
          <h3 className={styles.formTitle}>📤 خروج کالا از انبار</h3>
          <p className={styles.formSubtitle}>کالا را با واحد دلخواه از انبار خارج کنید</p>
        </div>
      </div>

      <div className={styles.formGridStock}>
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

        <div className={styles.formGroup}>
          <label className={styles.formLabel}><Layers size={14} /> واحد <span className={styles.required}>*</span></label>
          <select name="unit_id" value={formData.unit_id} onChange={handleChange}
            className={`${styles.formSelect} ${errors.unit_id ? styles.error : ''}`} disabled={isDisabled || !selectedProduct}>
            <option value="">انتخاب واحد...</option>
            {availableUnits.map(u => (
              <option key={u.id} value={u.id}>
                {u.title} {u.abbreviation && `(${u.abbreviation})`}
                {u.parent && ` ← ${u.count_in_parent || 1} تا در ${u.parent_title || 'والد'}`}
              </option>
            ))}
          </select>
          {errors.unit_id && <span className={styles.errorText}>⚠️ {errors.unit_id}</span>}
        </div>

        <div className={styles.formGroup}>
          <label className={styles.formLabel}><Tag size={14} /> تعداد <span className={styles.required}>*</span></label>
          <input type="number" name="quantity" value={formData.quantity} onChange={handleChange}
            className={`${styles.formInput} ${errors.quantity ? styles.error : ''}`}
            placeholder="مثلاً ۱۰" min="1" disabled={isDisabled} />
          {errors.quantity && <span className={styles.errorText}>⚠️ {errors.quantity}</span>}
          <span className={styles.helperText}>تعداد بر اساس واحد انتخاب شده</span>
        </div>

        {totalInBase !== null && selectedUnit && (
          <div className={`${styles.formGroup} ${styles.fullWidth}`}>
            <div className={styles.calcBoxStock}>
              <Info size={16} />
              <span>
                📊 {formData.quantity} {selectedUnit.title} = 
                <strong> {totalInBase.toLocaleString()} </strong> 
                {units.find(u => !u.parent)?.title || 'واحد پایه'}
              </span>
            </div>
          </div>
        )}

        {stockInfo && totalInBase !== null && (
          <div className={`${styles.formGroup} ${styles.fullWidth}`}>
            <div className={`${styles.stockInfoBox} ${totalInBase <= stockInfo.available ? styles.stockOk : styles.stockError}`}>
              {totalInBase <= stockInfo.available ? (
                <CheckCircle size={16} />
              ) : (
                <AlertCircle size={16} />
              )}
              <span>
                موجودی قابل استفاده: <strong>{stockInfo.available.toLocaleString()}</strong> واحد پایه
                {totalInBase > stockInfo.available && (
                  <span className={styles.stockErrorText}> ⚠️ موجودی کافی نیست!</span>
                )}
              </span>
            </div>
          </div>
        )}

        <div className={styles.formGroup}>
          <label className={styles.formLabel}><User size={14} /> فرد مجاز (اختیاری)</label>
          <select name="authorized_person_id" value={formData.authorized_person_id} onChange={handleChange}
            className={styles.formSelect} disabled={isDisabled}>
            <option value="">بدون فرد مجاز...</option>
            {authorizedPersons.filter(p => p.is_active !== false).map(p => (
              <option key={p.id} value={p.id}>{p.full_name} ({p.position})</option>
            ))}
          </select>
          <span className={styles.helperText}>فردی که مجوز خروج دارد</span>
        </div>

        <div className={`${styles.formGroup} ${styles.fullWidth}`}>
          <label className={styles.formLabel}><Tag size={14} /> توضیحات (اختیاری)</label>
          <textarea name="description" value={formData.description} onChange={handleChange}
            className={styles.formTextarea} placeholder="توضیحات مربوط به این خروج..." rows={2} disabled={isDisabled} />
        </div>

        {selectedProduct && (
          <div className={`${styles.formGroup} ${styles.fullWidth}`}>
            <div className={styles.productInfoBox}>
              <Package size={14} />
              <span><strong>{selectedProduct.title}</strong> ({selectedProduct.code})</span>
              {selectedProduct.category && <span className={styles.categoryTag}>📁 {selectedProduct.category}</span>}
            </div>
          </div>
        )}
      </div>

      <div className={styles.formActions}>
        <button type="button" onClick={onCancel} className={styles.secondaryBtn} disabled={isDisabled}>
          <X size={16} /> انصراف
        </button>
        <button type="submit" className={styles.primaryBtn} disabled={isDisabled} style={{ background: 'var(--macos-red)' }}>
          {isDisabled ? <><Loader2 size={16} className={styles.spinnerSmall} />در حال...</> : <><Save size={16} />ثبت خروج</>}
        </button>
      </div>
    </form>
  );
};

export default StockOutForm;