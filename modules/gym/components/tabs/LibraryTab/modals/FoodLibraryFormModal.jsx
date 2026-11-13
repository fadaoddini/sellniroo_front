// modules/gym/components/tabs/LibraryTab/modals/FoodLibraryFormModal.jsx
'use client';

import React, { useState, useEffect } from 'react';
import { Save, X, Upload, Image as ImageIcon, Loader2, Plus } from 'lucide-react';
import Modal from '../../../modals/Modal';
import styles from './FoodLibraryFormModal.module.css';

const CATEGORIES = [
  { value: 'protein', label: 'پروتئینی' },
  { value: 'carb', label: 'کربوهیدرات' },
  { value: 'fat', label: 'چربی' },
  { value: 'vegetable', label: 'سبزیجات' },
  { value: 'fruit', label: 'میوه' },
  { value: 'dairy', label: 'لبنیات' },
  { value: 'grain', label: 'غلات' },
  { value: 'drink', label: 'نوشیدنی' },
  { value: 'snack', label: 'میان‌وعده' },
  { value: 'supplement', label: 'مکمل' },
  { value: 'other', label: 'سایر' },
];

const UNITS = [
  { value: 'gram', label: 'گرم' },
  { value: 'ml', label: 'میلی‌لیتر' },
  { value: 'piece', label: 'عدد' },
  { value: 'slice', label: 'برش' },
  { value: 'tablespoon', label: 'قاشق غذاخوری' },
  { value: 'teaspoon', label: 'قاشق چای‌خوری' },
  { value: 'cup', label: 'لیوان' },
  { value: 'serving', label: 'پرس' },
];

const EMPTY_FORM = {
  name: '',
  name_en: '',
  description: '',
  category: 'protein',
  base_unit: 'gram',
  base_amount: 100,
  calories: 0,
  protein: 0,
  carbs: 0,
  fat: 0,
  fiber: 0,
  sugar: 0,
  sodium: 0,
  cholesterol: 0,
  is_vegan: false,
  is_vegetarian: false,
  is_halal: true,
  is_active: true,
  is_public: true,
};

export default function FoodLibraryFormModal({ isOpen, onClose, onSave, editingItem = null }) {
  const isEdit = !!editingItem;

  const [form, setForm] = useState(EMPTY_FORM);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    if (isEdit && editingItem) {
      setForm({
        name: editingItem.name || '',
        name_en: editingItem.name_en || '',
        description: editingItem.description || '',
        category: editingItem.category || 'protein',
        base_unit: editingItem.base_unit || 'gram',
        base_amount: editingItem.base_amount || 100,
        calories: editingItem.calories || 0,
        protein: editingItem.protein || 0,
        carbs: editingItem.carbs || 0,
        fat: editingItem.fat || 0,
        fiber: editingItem.fiber || 0,
        sugar: editingItem.sugar || 0,
        sodium: editingItem.sodium || 0,
        cholesterol: editingItem.cholesterol || 0,
        is_vegan: !!editingItem.is_vegan,
        is_vegetarian: !!editingItem.is_vegetarian,
        is_halal: editingItem.is_halal !== false,
        is_active: editingItem.is_active !== false,
        is_public: editingItem.is_public !== false,
      });
      setImagePreview(editingItem.image_url || '');
    } else {
      setForm(EMPTY_FORM);
      setImagePreview('');
    }

    setImageFile(null);
    setErrors({});
  }, [isOpen, isEdit, editingItem]);

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'نام غذا الزامی است';
    if (form.calories === 0 && form.protein === 0 && form.carbs === 0 && form.fat === 0) {
      errs.calories = 'حداقل یکی از فیلدهای تغذیه‌ای باید مقدار داشته باشد';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('حجم تصویر نباید بیشتر از ۵ مگابایت باشد');
      return;
    }
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setSubmitting(true);
    try {
      let payload;
      if (imageFile) {
        payload = new FormData();
        Object.keys(form).forEach((key) => {
          const val = form[key];
          if (typeof val === 'boolean') {
            payload.append(key, val ? 'true' : 'false');
          } else {
            payload.append(key, val ?? '');
          }
        });
        payload.append('image', imageFile);
      } else {
        payload = { ...form };
      }
      await onSave(payload, isEdit);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? `ویرایش: ${editingItem?.name}` : 'افزودن غذای جدید'}
      size="xl"
    >
      <div className={styles.form}>
        {/* ============ ردیف اول ============ */}
        <div className={styles.row}>
          <div className={styles.field}>
            <label>نام غذا <span className={styles.required}>*</span></label>
            <input
              type="text"
              placeholder="مثال: سینه مرغ پخته"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            {errors.name && <span className={styles.errorText}>{errors.name}</span>}
          </div>
          <div className={styles.field}>
            <label>نام انگلیسی</label>
            <input
              type="text"
              dir="ltr"
              placeholder="Chicken Breast"
              value={form.name_en}
              onChange={(e) => setForm({ ...form, name_en: e.target.value })}
            />
          </div>
        </div>

        {/* ============ دسته‌بندی ============ */}
        <div className={styles.row}>
          <div className={styles.field}>
            <label>دسته‌بندی</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
          <div className={styles.field}>
            <label>توضیحات</label>
            <input
              type="text"
              placeholder="توضیح کوتاه..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
        </div>

        {/* ============ واحد پایه ============ */}
        <div className={styles.row}>
          <div className={styles.field}>
            <label>واحد پایه</label>
            <select
              value={form.base_unit}
              onChange={(e) => setForm({ ...form, base_unit: e.target.value })}
            >
              {UNITS.map((u) => (
                <option key={u.value} value={u.value}>{u.label}</option>
              ))}
            </select>
          </div>
          <div className={styles.field}>
            <label>مقدار پایه</label>
            <input
              type="number"
              min="0.01"
              step="0.1"
              value={form.base_amount}
              onChange={(e) =>
                setForm({ ...form, base_amount: parseFloat(e.target.value) || 0 })
              }
            />
            <small className={styles.hint}>
              اطلاعات تغذیه‌ای زیر بر اساس این مقدار است
            </small>
          </div>
        </div>

        {/* ============ اطلاعات تغذیه‌ای ============ */}
        <div className={styles.section}>
          <h4>اطلاعات تغذیه‌ای</h4>
          <div className={styles.row3}>
            <div className={styles.field}>
              <label>کالری (kcal)</label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={form.calories}
                onChange={(e) =>
                  setForm({ ...form, calories: parseFloat(e.target.value) || 0 })
                }
              />
              {errors.calories && <span className={styles.errorText}>{errors.calories}</span>}
            </div>
            <div className={styles.field}>
              <label>پروتئین (گرم)</label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={form.protein}
                onChange={(e) =>
                  setForm({ ...form, protein: parseFloat(e.target.value) || 0 })
                }
              />
            </div>
            <div className={styles.field}>
              <label>کربوهیدرات (گرم)</label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={form.carbs}
                onChange={(e) =>
                  setForm({ ...form, carbs: parseFloat(e.target.value) || 0 })
                }
              />
            </div>
          </div>

          <div className={styles.row3}>
            <div className={styles.field}>
              <label>چربی (گرم)</label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={form.fat}
                onChange={(e) =>
                  setForm({ ...form, fat: parseFloat(e.target.value) || 0 })
                }
              />
            </div>
            <div className={styles.field}>
              <label>فیبر (گرم)</label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={form.fiber}
                onChange={(e) =>
                  setForm({ ...form, fiber: parseFloat(e.target.value) || 0 })
                }
              />
            </div>
            <div className={styles.field}>
              <label>قند (گرم)</label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={form.sugar}
                onChange={(e) =>
                  setForm({ ...form, sugar: parseFloat(e.target.value) || 0 })
                }
              />
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label>سدیم (میلی‌گرم)</label>
              <input
                type="number"
                min="0"
                value={form.sodium}
                onChange={(e) =>
                  setForm({ ...form, sodium: parseFloat(e.target.value) || 0 })
                }
              />
            </div>
            <div className={styles.field}>
              <label>کلسترول (میلی‌گرم)</label>
              <input
                type="number"
                min="0"
                value={form.cholesterol}
                onChange={(e) =>
                  setForm({ ...form, cholesterol: parseFloat(e.target.value) || 0 })
                }
              />
            </div>
          </div>
        </div>

        {/* ============ تصویر ============ */}
        <div className={styles.field}>
          <label>تصویر غذا</label>
          <div className={styles.uploadBox}>
            {imagePreview ? (
              <div className={styles.imagePreviewWrapper}>
                <img src={imagePreview} alt="preview" />
                <button
                  type="button"
                  className={styles.removeImageBtn}
                  onClick={() => {
                    setImagePreview('');
                    setImageFile(null);
                  }}
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <label className={styles.uploadLabel}>
                <ImageIcon size={24} />
                <span>انتخاب تصویر</span>
                <small>حداکثر ۵ مگابایت</small>
                <input type="file" accept="image/*" onChange={handleImageUpload} hidden />
              </label>
            )}
          </div>
        </div>

        {/* ============ ویژگی‌ها ============ */}
        <div className={styles.section}>
          <h4>ویژگی‌ها و وضعیت</h4>
          <div className={styles.togglesGrid}>
            <label className={styles.toggleLabel}>
              <input
                type="checkbox"
                checked={form.is_vegan}
                onChange={(e) => setForm({ ...form, is_vegan: e.target.checked })}
              />
              <span>🌱 وگان</span>
            </label>
            <label className={styles.toggleLabel}>
              <input
                type="checkbox"
                checked={form.is_vegetarian}
                onChange={(e) => setForm({ ...form, is_vegetarian: e.target.checked })}
              />
              <span>🥬 وجترین</span>
            </label>
            <label className={styles.toggleLabel}>
              <input
                type="checkbox"
                checked={form.is_halal}
                onChange={(e) => setForm({ ...form, is_halal: e.target.checked })}
              />
              <span>✅ حلال</span>
            </label>
            <label className={styles.toggleLabel}>
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
              />
              <span>فعال</span>
            </label>
            <label className={styles.toggleLabel}>
              <input
                type="checkbox"
                checked={form.is_public}
                onChange={(e) => setForm({ ...form, is_public: e.target.checked })}
              />
              <span>عمومی</span>
            </label>
          </div>
        </div>

        {/* ============ دکمه‌ها ============ */}
        <div className={styles.actions}>
          <button
            type="button"
            className={styles.cancelBtn}
            onClick={onClose}
            disabled={submitting}
          >
            انصراف
          </button>
          <button
            type="button"
            className={styles.submitBtn}
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <>
                <Loader2 size={16} className={styles.spinning} />
                در حال ذخیره...
              </>
            ) : isEdit ? (
              <>
                <Save size={16} />
                ذخیره تغییرات
              </>
            ) : (
              <>
                <Plus size={16} />
                افزودن غذا
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}