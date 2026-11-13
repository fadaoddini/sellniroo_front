// modules/gym/components/tabs/LibraryTab/modals/ExerciseLibraryFormModal.jsx
'use client';

import React, { useState, useEffect } from 'react';
import { Save, X, Upload, Image as ImageIcon, Loader2, Plus } from 'lucide-react';
import Modal from '../../../modals/Modal';
import { useBodybuildingApi } from '@/hooks/useBodybuildingApi';
import styles from './ExerciseLibraryFormModal.module.css';

// ============================================
// گزینه‌ها
// ============================================
const MUSCLE_GROUPS = [
  { value: 'chest', label: 'سینه' },
  { value: 'back', label: 'پشت' },
  { value: 'legs', label: 'پا' },
  { value: 'shoulders', label: 'سرشانه' },
  { value: 'arms', label: 'بازو' },
  { value: 'core', label: 'شکم و مرکز' },
  { value: 'glutes', label: 'باسن' },
  { value: 'cardio', label: 'هوازی' },
  { value: 'full_body', label: 'کل بدن' },
];

const EQUIPMENT_OPTIONS = [
  { value: 'barbell', label: 'هالتر' },
  { value: 'dumbbell', label: 'دمبل' },
  { value: 'machine', label: 'دستگاه' },
  { value: 'cable', label: 'سیم‌کش' },
  { value: 'bodyweight', label: 'وزن بدن' },
  { value: 'kettlebell', label: 'کتل‌بل' },
  { value: 'band', label: 'کش' },
  { value: 'other', label: 'سایر' },
];

const DIFFICULTY_OPTIONS = [
  { value: 'beginner', label: 'مبتدی' },
  { value: 'intermediate', label: 'متوسط' },
  { value: 'advanced', label: 'پیشرفته' },
];

const EMPTY_FORM = {
  title: '',
  title_en: '',
  description: '',
  primary_muscle: 'chest',
  secondary_muscles: [],
  equipment: 'barbell',
  difficulty: 'intermediate',
  instructions: '',
  tips: '',
  common_mistakes: '',
  default_sets: 4,
  default_reps: '10-12',
  default_rest_time: 60,
  video_url: '',
  is_active: true,
  is_public: true,
};

// ============================================
// کامپوننت
// ============================================
export default function ExerciseLibraryFormModal({
  isOpen,
  onClose,
  onSave,
  editingItem = null,
}) {
  const api = useBodybuildingApi();
  const isEdit = !!editingItem;

  const [form, setForm] = useState(EMPTY_FORM);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [videoFile, setVideoFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // ============================================
  // Load داده‌های موجود در حالت ویرایش
  // ============================================
  useEffect(() => {
    if (!isOpen) return;

    if (isEdit && editingItem) {
      setForm({
        title: editingItem.title || '',
        title_en: editingItem.title_en || '',
        description: editingItem.description || '',
        primary_muscle: editingItem.primary_muscle || 'chest',
        secondary_muscles: editingItem.secondary_muscles || [],
        equipment: editingItem.equipment || 'barbell',
        difficulty: editingItem.difficulty || 'intermediate',
        instructions: editingItem.instructions || '',
        tips: editingItem.tips || '',
        common_mistakes: editingItem.common_mistakes || '',
        default_sets: editingItem.default_sets || 4,
        default_reps: editingItem.default_reps || '10-12',
        default_rest_time: editingItem.default_rest_time || 60,
        video_url: editingItem.video_url || '',
        is_active: editingItem.is_active !== false,
        is_public: editingItem.is_public !== false,
      });
      setImagePreview(editingItem.image_url || '');
    } else {
      setForm(EMPTY_FORM);
      setImagePreview('');
    }

    setImageFile(null);
    setVideoFile(null);
    setErrors({});
  }, [isOpen, isEdit, editingItem]);

  // ============================================
  // Validation
  // ============================================
  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = 'نام حرکت الزامی است';
    if (!form.primary_muscle) errs.primary_muscle = 'عضله اصلی الزامی است';
    if (form.default_sets < 1) errs.default_sets = 'حداقل ۱ ست';
    if (!form.default_reps.trim()) errs.default_reps = 'تعداد تکرار الزامی است';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ============================================
  // Image Upload
  // ============================================
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

  // ============================================
  // Video Upload
  // ============================================
  const handleVideoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 50 * 1024 * 1024) {
      alert('حجم ویدیو نباید بیشتر از ۵۰ مگابایت باشد');
      return;
    }
    setVideoFile(file);
  };

  // ============================================
  // Toggle secondary muscle
  // ============================================
  const toggleSecondaryMuscle = (muscle) => {
    setForm((prev) => ({
      ...prev,
      secondary_muscles: prev.secondary_muscles.includes(muscle)
        ? prev.secondary_muscles.filter((m) => m !== muscle)
        : [...prev.secondary_muscles, muscle],
    }));
  };

  // ============================================
  // Submit
  // ============================================
  const handleSubmit = async () => {
    if (!validate()) return;

    setSubmitting(true);
    try {
      // اگه فایل داشت، FormData
      const hasFiles = imageFile || videoFile;

      let payload;
      if (hasFiles) {
        payload = new FormData();
        Object.keys(form).forEach((key) => {
          const val = form[key];
          if (key === 'secondary_muscles') {
            payload.append(key, JSON.stringify(val));
          } else if (typeof val === 'boolean') {
            payload.append(key, val ? 'true' : 'false');
          } else {
            payload.append(key, val ?? '');
          }
        });
        if (imageFile) payload.append('image', imageFile);
        if (videoFile) payload.append('video', videoFile);
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

  // ============================================
  // Render
  // ============================================
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? `ویرایش حرکت: ${editingItem?.title}` : 'افزودن حرکت جدید'}
      size="xl"
    >
      <div className={styles.form}>
        {/* ============ ردیف اول ============ */}
        <div className={styles.row}>
          <div className={styles.field}>
            <label>
              نام حرکت <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              placeholder="مثال: اسکوات با هالتر"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
            {errors.title && <span className={styles.errorText}>{errors.title}</span>}
          </div>
          <div className={styles.field}>
            <label>نام انگلیسی</label>
            <input
              type="text"
              dir="ltr"
              placeholder="Barbell Squat"
              value={form.title_en}
              onChange={(e) => setForm({ ...form, title_en: e.target.value })}
            />
          </div>
        </div>

        {/* ============ توضیحات ============ */}
        <div className={styles.field}>
          <label>توضیحات</label>
          <textarea
            rows={2}
            placeholder="توضیح کوتاه درباره حرکت..."
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>

        {/* ============ دسته‌بندی ============ */}
        <div className={styles.row3}>
          <div className={styles.field}>
            <label>
              عضله اصلی <span className={styles.required}>*</span>
            </label>
            <select
              value={form.primary_muscle}
              onChange={(e) => setForm({ ...form, primary_muscle: e.target.value })}
            >
              {MUSCLE_GROUPS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
            {errors.primary_muscle && (
              <span className={styles.errorText}>{errors.primary_muscle}</span>
            )}
          </div>
          <div className={styles.field}>
            <label>تجهیزات</label>
            <select
              value={form.equipment}
              onChange={(e) => setForm({ ...form, equipment: e.target.value })}
            >
              {EQUIPMENT_OPTIONS.map((e2) => (
                <option key={e2.value} value={e2.value}>
                  {e2.label}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.field}>
            <label>سطح دشواری</label>
            <select
              value={form.difficulty}
              onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
            >
              {DIFFICULTY_OPTIONS.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* ============ عضلات کمکی ============ */}
        <div className={styles.field}>
          <label>عضلات کمکی (چندتایی)</label>
          <div className={styles.muscleChips}>
            {MUSCLE_GROUPS.filter((m) => m.value !== form.primary_muscle).map((m) => (
              <button
                key={m.value}
                type="button"
                className={`${styles.muscleChip} ${
                  form.secondary_muscles.includes(m.value) ? styles.muscleChipActive : ''
                }`}
                onClick={() => toggleSecondaryMuscle(m.value)}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* ============ پیش‌فرض‌ها ============ */}
        <div className={styles.row3}>
          <div className={styles.field}>
            <label>ست پیش‌فرض</label>
            <input
              type="number"
              min="1"
              value={form.default_sets}
              onChange={(e) =>
                setForm({ ...form, default_sets: parseInt(e.target.value) || 0 })
              }
            />
            {errors.default_sets && (
              <span className={styles.errorText}>{errors.default_sets}</span>
            )}
          </div>
          <div className={styles.field}>
            <label>تکرار پیش‌فرض</label>
            <input
              type="text"
              placeholder="10-12"
              value={form.default_reps}
              onChange={(e) => setForm({ ...form, default_reps: e.target.value })}
            />
            {errors.default_reps && (
              <span className={styles.errorText}>{errors.default_reps}</span>
            )}
          </div>
          <div className={styles.field}>
            <label>استراحت (ثانیه)</label>
            <input
              type="number"
              min="0"
              value={form.default_rest_time}
              onChange={(e) =>
                setForm({ ...form, default_rest_time: parseInt(e.target.value) || 0 })
              }
            />
          </div>
        </div>

        {/* ============ تصویر و ویدیو ============ */}
        <div className={styles.mediaSection}>
          <div className={styles.field}>
            <label>تصویر حرکت</label>
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
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    hidden
                  />
                </label>
              )}
            </div>
          </div>

          <div className={styles.field}>
            <label>فایل ویدیو یا لینک</label>
            <div className={styles.uploadBox}>
              {videoFile ? (
                <div className={styles.videoPreviewWrapper}>
                  <span>{videoFile.name}</span>
                  <button
                    type="button"
                    className={styles.removeImageBtn}
                    onClick={() => setVideoFile(null)}
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <label className={styles.uploadLabel}>
                  <Upload size={24} />
                  <span>انتخاب ویدیو</span>
                  <small>حداکثر ۵۰ مگابایت</small>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleVideoUpload}
                    hidden
                  />
                </label>
              )}
            </div>

            <input
              type="url"
              dir="ltr"
              placeholder="یا لینک ویدیو (یوتیوب، آپارات...)"
              value={form.video_url}
              onChange={(e) => setForm({ ...form, video_url: e.target.value })}
              style={{ marginTop: '0.5rem' }}
            />
          </div>
        </div>

        {/* ============ راهنما ============ */}
        <div className={styles.field}>
          <label>راهنمای اجرا</label>
          <textarea
            rows={3}
            placeholder="مراحل انجام حرکت..."
            value={form.instructions}
            onChange={(e) => setForm({ ...form, instructions: e.target.value })}
          />
        </div>

        <div className={styles.row}>
          <div className={styles.field}>
            <label>نکات مهم</label>
            <textarea
              rows={2}
              placeholder="نکات ایمنی و تکنیک..."
              value={form.tips}
              onChange={(e) => setForm({ ...form, tips: e.target.value })}
            />
          </div>
          <div className={styles.field}>
            <label>اشتباهات رایج</label>
            <textarea
              rows={2}
              placeholder="اشتباهات رایج..."
              value={form.common_mistakes}
              onChange={(e) => setForm({ ...form, common_mistakes: e.target.value })}
            />
          </div>
        </div>

        {/* ============ وضعیت ============ */}
        <div className={styles.row}>
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
            <span>عمومی (همه باشگاه‌ها ببینند)</span>
          </label>
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
                افزودن حرکت
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}