// modules/gym/components/tabs/LibraryTab/modals/FoodLibraryDetailModal.jsx
'use client';

import React from 'react';
import { X, Flame, Image as ImageIcon } from 'lucide-react';
import styles from './FoodLibraryDetailModal.module.css';

const CATEGORY_LABELS = {
  protein: 'پروتئینی',
  carb: 'کربوهیدرات',
  fat: 'چربی',
  vegetable: 'سبزیجات',
  fruit: 'میوه',
  dairy: 'لبنیات',
  grain: 'غلات',
  drink: 'نوشیدنی',
  snack: 'میان‌وعده',
  supplement: 'مکمل',
  other: 'سایر',
};

const UNIT_LABELS = {
  gram: 'گرم',
  ml: 'میلی‌لیتر',
  piece: 'عدد',
  slice: 'برش',
  tablespoon: 'قاشق غذاخوری',
  teaspoon: 'قاشق چای‌خوری',
  cup: 'لیوان',
  serving: 'پرس',
};

export default function FoodLibraryDetailModal({ isOpen, onClose, item }) {
  if (!isOpen || !item) return null;

  // محاسبه درصد کالری هر ماکرو
  const caloriesFromProtein = Number(item.protein) * 4;
  const caloriesFromCarbs = Number(item.carbs) * 4;
  const caloriesFromFat = Number(item.fat) * 9;
  const totalMacroCalories = caloriesFromProtein + caloriesFromCarbs + caloriesFromFat;

  const proteinPercent = totalMacroCalories > 0 ? (caloriesFromProtein / totalMacroCalories) * 100 : 0;
  const carbsPercent = totalMacroCalories > 0 ? (caloriesFromCarbs / totalMacroCalories) * 100 : 0;
  const fatPercent = totalMacroCalories > 0 ? (caloriesFromFat / totalMacroCalories) * 100 : 0;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h3>{item.name}</h3>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className={styles.body}>
          {/* تصویر */}
          <div className={styles.mediaSection}>
            {item.image_url ? (
              <img src={item.image_url} alt={item.name} className={styles.image} />
            ) : (
              <div className={styles.imagePlaceholder}>
                <ImageIcon size={48} />
                <p>تصویری موجود نیست</p>
              </div>
            )}

            <div className={styles.caloriesBox}>
              <Flame size={20} />
              <div>
                <span className={styles.caloriesValue}>{Number(item.calories).toFixed(0)}</span>
                <span className={styles.caloriesLabel}>کالری</span>
              </div>
            </div>
          </div>

          {/* اطلاعات */}
          <div className={styles.infoSection}>
            {item.name_en && (
              <div className={styles.infoRow}>
                <span className={styles.label}>نام انگلیسی:</span>
                <span dir="ltr">{item.name_en}</span>
              </div>
            )}

            <div className={styles.infoRow}>
              <span className={styles.label}>دسته:</span>
              <span>{CATEGORY_LABELS[item.category] || item.category}</span>
            </div>

            <div className={styles.infoRow}>
              <span className={styles.label}>مقدار پایه:</span>
              <span>
                {Number(item.base_amount)} {UNIT_LABELS[item.base_unit] || item.base_unit}
              </span>
            </div>

            {item.usage_count > 0 && (
              <div className={styles.infoRow}>
                <span className={styles.label}>تعداد استفاده:</span>
                <span><strong>{item.usage_count}</strong> بار</span>
              </div>
            )}

            {/* بج‌ها */}
            <div className={styles.badges}>
              {item.is_vegan && <span className={styles.badge}>🌱 وگان</span>}
              {item.is_vegetarian && <span className={styles.badge}>🥬 وجترین</span>}
              {item.is_halal && <span className={styles.badge}>✅ حلال</span>}
            </div>
          </div>
        </div>

        {/* ماکروس */}
        <div className={styles.macrosSection}>
          <h4>ترکیب تغذیه‌ای</h4>

          <div className={styles.macrosGrid}>
            <div className={styles.macroCard}>
              <span className={styles.macroValue}>{Number(item.protein).toFixed(1)}g</span>
              <span className={styles.macroLabel}>پروتئین</span>
            </div>
            <div className={styles.macroCard}>
              <span className={styles.macroValue}>{Number(item.carbs).toFixed(1)}g</span>
              <span className={styles.macroLabel}>کربوهیدرات</span>
            </div>
            <div className={styles.macroCard}>
              <span className={styles.macroValue}>{Number(item.fat).toFixed(1)}g</span>
              <span className={styles.macroLabel}>چربی</span>
            </div>
          </div>

          {/* نوار نسبت */}
          {totalMacroCalories > 0 && (
            <div className={styles.macroBar}>
              <div
                className={styles.macroBarSegment}
                style={{ width: `${proteinPercent}%`, background: '#4ecdc4' }}
                title={`پروتئین: ${proteinPercent.toFixed(0)}%`}
              />
              <div
                className={styles.macroBarSegment}
                style={{ width: `${carbsPercent}%`, background: '#ffd93d' }}
                title={`کربوهیدرات: ${carbsPercent.toFixed(0)}%`}
              />
              <div
                className={styles.macroBarSegment}
                style={{ width: `${fatPercent}%`, background: '#ff6b6b' }}
                title={`چربی: ${fatPercent.toFixed(0)}%`}
              />
            </div>
          )}

          <div className={styles.macroLegend}>
            <span><span style={{ background: '#4ecdc4' }} /> پروتئین</span>
            <span><span style={{ background: '#ffd93d' }} /> کربوهیدرات</span>
            <span><span style={{ background: '#ff6b6b' }} /> چربی</span>
          </div>
        </div>

        {/* جزئیات بیشتر */}
        {(item.fiber > 0 || item.sugar > 0 || item.sodium > 0 || item.cholesterol > 0) && (
          <div className={styles.extraSection}>
            <h4>سایر اطلاعات</h4>
            <div className={styles.extraGrid}>
              {item.fiber > 0 && (
                <div className={styles.extraItem}>
                  <span className={styles.extraLabel}>فیبر</span>
                  <span className={styles.extraValue}>{Number(item.fiber).toFixed(1)} گرم</span>
                </div>
              )}
              {item.sugar > 0 && (
                <div className={styles.extraItem}>
                  <span className={styles.extraLabel}>قند</span>
                  <span className={styles.extraValue}>{Number(item.sugar).toFixed(1)} گرم</span>
                </div>
              )}
              {item.sodium > 0 && (
                <div className={styles.extraItem}>
                  <span className={styles.extraLabel}>سدیم</span>
                  <span className={styles.extraValue}>{Number(item.sodium).toFixed(0)} mg</span>
                </div>
              )}
              {item.cholesterol > 0 && (
                <div className={styles.extraItem}>
                  <span className={styles.extraLabel}>کلسترول</span>
                  <span className={styles.extraValue}>{Number(item.cholesterol).toFixed(0)} mg</span>
                </div>
              )}
            </div>
          </div>
        )}

        <div className={styles.footer}>
          <button className={styles.closeFooterBtn} onClick={onClose}>
            بستن
          </button>
        </div>
      </div>
    </div>
  );
}