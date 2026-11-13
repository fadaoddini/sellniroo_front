// modules/gym/components/tabs/LibraryTab/modals/ExerciseLibraryDetailModal.jsx
'use client';

import React from 'react';
import { X, Info, PlayCircle, Image as ImageIcon, Dumbbell } from 'lucide-react';
import styles from './ExerciseLibraryDetailModal.module.css';

const MUSCLE_GROUPS = {
  chest: 'سینه',
  back: 'پشت',
  legs: 'پا',
  shoulders: 'سرشانه',
  arms: 'بازو',
  core: 'شکم و مرکز',
  glutes: 'باسن',
  cardio: 'هوازی',
  full_body: 'کل بدن',
};

const EQUIPMENT_LABELS = {
  barbell: 'هالتر',
  dumbbell: 'دمبل',
  machine: 'دستگاه',
  cable: 'سیم‌کش',
  bodyweight: 'وزن بدن',
  kettlebell: 'کتل‌بل',
  band: 'کش',
  other: 'سایر',
};

const DIFFICULTY_LABELS = {
  beginner: 'مبتدی',
  intermediate: 'متوسط',
  advanced: 'پیشرفته',
};

export default function ExerciseLibraryDetailModal({ isOpen, onClose, item }) {
  if (!isOpen || !item) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h3>{item.title}</h3>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className={styles.body}>
          {/* تصویر */}
          <div className={styles.mediaSection}>
            {item.image_url ? (
              <img src={item.image_url} alt={item.title} className={styles.image} />
            ) : (
              <div className={styles.imagePlaceholder}>
                <ImageIcon size={48} />
                <p>تصویری موجود نیست</p>
              </div>
            )}

            {item.video_url && (
              <a
                href={item.video_url}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.videoBtn}
              >
                <PlayCircle size={16} />
                مشاهده ویدیو
              </a>
            )}
          </div>

          {/* اطلاعات */}
          <div className={styles.infoSection}>
            {item.title_en && (
              <div className={styles.infoRow}>
                <span className={styles.label}>نام انگلیسی:</span>
                <span dir="ltr">{item.title_en}</span>
              </div>
            )}

            <div className={styles.infoRow}>
              <span className={styles.label}>عضله اصلی:</span>
              <span>{MUSCLE_GROUPS[item.primary_muscle] || item.primary_muscle}</span>
            </div>

            {item.secondary_muscles?.length > 0 && (
              <div className={styles.infoRow}>
                <span className={styles.label}>عضلات کمکی:</span>
                <span>
                  {item.secondary_muscles
                    .map((m) => MUSCLE_GROUPS[m] || m)
                    .join('، ')}
                </span>
              </div>
            )}

            {item.equipment && (
              <div className={styles.infoRow}>
                <span className={styles.label}>تجهیزات:</span>
                <span>
                  {item.equipment_display || EQUIPMENT_LABELS[item.equipment] || item.equipment}
                </span>
              </div>
            )}

            {item.difficulty && (
              <div className={styles.infoRow}>
                <span className={styles.label}>سطح دشواری:</span>
                <span>
                  {item.difficulty_display || DIFFICULTY_LABELS[item.difficulty]}
                </span>
              </div>
            )}

            <div className={styles.infoRow}>
              <span className={styles.label}>پیش‌فرض:</span>
              <span>
                {item.default_sets} ست × {item.default_reps} — استراحت{' '}
                {item.default_rest_time}ث
              </span>
            </div>

            {item.usage_count > 0 && (
              <div className={styles.infoRow}>
                <span className={styles.label}>تعداد استفاده:</span>
                <span>
                  <strong>{item.usage_count}</strong> بار
                </span>
              </div>
            )}
          </div>
        </div>

        {/* بخش‌های متنی */}
        <div className={styles.sections}>
          {item.description && (
            <div className={styles.section}>
              <h4>
                <Info size={14} />
                توضیحات
              </h4>
              <p>{item.description}</p>
            </div>
          )}

          {item.instructions && (
            <div className={styles.section}>
              <h4>
                <Dumbbell size={14} />
                راهنمای اجرا
              </h4>
              <p style={{ whiteSpace: 'pre-line' }}>{item.instructions}</p>
            </div>
          )}

          {item.tips && (
            <div className={styles.section}>
              <h4>
                <Info size={14} />
                نکات مهم
              </h4>
              <p style={{ whiteSpace: 'pre-line' }}>{item.tips}</p>
            </div>
          )}

          {item.common_mistakes && (
            <div className={styles.section}>
              <h4>
                <Info size={14} />
                اشتباهات رایج
              </h4>
              <p style={{ whiteSpace: 'pre-line' }}>{item.common_mistakes}</p>
            </div>
          )}
        </div>

        <div className={styles.footer}>
          <button className={styles.closeFooterBtn} onClick={onClose}>
            بستن
          </button>
        </div>
      </div>
    </div>
  );
}