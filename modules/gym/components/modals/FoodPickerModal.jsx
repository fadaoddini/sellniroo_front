'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Search, Apple, Check, Loader2, X } from 'lucide-react';
import Modal from './Modal';
import { useBodybuildingApi } from '@/hooks/useBodybuildingApi';
import styles from './ExercisePickerModal.module.css';

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

const BASE_UNITS = {
  gram: 'گرم',
  ml: 'میلی‌لیتر',
  piece: 'عدد',
  slice: 'برش',
  tablespoon: 'قاشق غذاخوری',
  teaspoon: 'قاشق چای‌خوری',
  cup: 'لیوان',
  serving: 'پرس',
};

const COUNT_UNITS = new Set(['piece', 'slice', 'tablespoon', 'teaspoon', 'cup', 'serving']);

const defaultAmountFor = (unit, baseAmount) => {
  const base = Number(baseAmount);
  if (COUNT_UNITS.has(unit)) {
    if (base > 0 && base <= 12) return base;
    return 1;
  }
  if (base > 0 && base <= 500) return base;
  return 100;
};

const num = (v, digits = 0) => {
  const n = Number(v);
  if (!Number.isFinite(n)) return digits ? (0).toFixed(digits) : '0';
  return n.toFixed(digits);
};

export default function FoodPickerModal({ isOpen, onClose, onSelect, mealName }) {
  const api = useBodybuildingApi();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    if (!isOpen) return undefined;

    let cancelled = false;
    const fetchItems = async () => {
      try {
        setLoading(true);
        setError(null);
        const params = {};
        if (selectedCategory) params.category = selectedCategory;
        if (search.trim()) params.search = search.trim();
        const data = await api.library.foods.list(params);
        if (cancelled) return;
        setItems(Array.isArray(data) ? data : data.results || []);
      } catch (err) {
        if (cancelled) return;
        console.error('Fetch foods error:', err);
        setError(
          err?.response?.data?.detail ||
            err?.message ||
            'خطا در دریافت غذاها.',
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    const timer = setTimeout(fetchItems, 260);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [isOpen, search, selectedCategory, api]);

  const countLabel = useMemo(() => {
    if (loading) return 'در حال جستجو…';
    return `${items.length.toLocaleString('fa-IR')} غذا`;
  }, [loading, items.length]);

  const handleSelect = (item) => {
    const unit = item.base_unit || 'gram';
    const base = Number(item.base_amount) || (COUNT_UNITS.has(unit) ? 1 : 100);
    const defaultAmount = defaultAmountFor(unit, base);
    const ratio = defaultAmount / (base || 1);
    onSelect?.({
      ...item,
      selected_amount: defaultAmount,
      selected_unit: unit,
      calculated_calories: Number(item.calories || 0) * ratio,
      calculated_protein: Number(item.protein || 0) * ratio,
      calculated_carbs: Number(item.carbs || 0) * ratio,
      calculated_fat: Number(item.fat || 0) * ratio,
    });
    onClose?.();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mealName ? `افزودن غذا به ${mealName}` : 'انتخاب غذا از کتابخانه'}
      size="md"
      layer="nested"
    >
      <div className={styles.picker} dir="rtl" lang="fa">
        <div className={styles.searchBox}>
          <Search size={15} />
          <input
            type="search"
            placeholder="جستجو نام غذا…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
          />
          {search ? (
            <button
              type="button"
              className={styles.clearSearch}
              onClick={() => setSearch('')}
              aria-label="پاک کردن جستجو"
            >
              <X size={14} />
            </button>
          ) : null}
        </div>

        <div className={styles.muscleRow} role="tablist" aria-label="دسته‌بندی غذا">
          <button
            type="button"
            role="tab"
            aria-selected={!selectedCategory}
            className={`${styles.muscleChip} ${!selectedCategory ? styles.muscleChipOn : ''}`}
            onClick={() => setSelectedCategory(null)}
          >
            همه دسته‌ها
          </button>
          {CATEGORIES.map((c) => (
            <button
              key={c.value}
              type="button"
              role="tab"
              aria-selected={selectedCategory === c.value}
              className={`${styles.muscleChip} ${
                selectedCategory === c.value ? styles.muscleChipOn : ''
              }`}
              onClick={() => setSelectedCategory(c.value)}
            >
              {c.label}
            </button>
          ))}
        </div>

        <div className={styles.listMeta}>
          <span>{countLabel}</span>
        </div>

        <div className={styles.list} role="listbox" aria-label="لیست غذاها">
          {loading ? (
            <div className={styles.state}>
              <Loader2 className={styles.spinner} size={22} />
              <span>در حال بارگذاری…</span>
            </div>
          ) : error ? (
            <div className={styles.state}>
              <span>{error}</span>
              <button
                type="button"
                className={styles.retryBtn}
                onClick={() => {
                  setSearch('');
                  setSelectedCategory(null);
                }}
              >
                تلاش مجدد
              </button>
            </div>
          ) : items.length === 0 ? (
            <div className={styles.state}>
              <Apple size={22} />
              <span>غذایی پیدا نشد</span>
            </div>
          ) : (
            items.map((item) => {
              const cat =
                CATEGORIES.find((c) => c.value === item.category)?.label ||
                item.category_display ||
                '';
              const unit = BASE_UNITS[item.base_unit] || item.base_unit || '';
              const base = item.base_amount ? `${num(item.base_amount)} ${unit}` : '';
              return (
                <button
                  key={item.id}
                  type="button"
                  role="option"
                  className={styles.row}
                  onClick={() => handleSelect(item)}
                >
                  <span className={styles.thumb} aria-hidden>
                    {item.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.image_url} alt="" width={40} height={40} />
                    ) : (
                      <em>
                        <Apple size={16} />
                      </em>
                    )}
                  </span>
                  <span className={styles.rowBody}>
                    <strong className={styles.rowTitle}>{item.name}</strong>
                    <span className={styles.rowSub}>{[cat, base].filter(Boolean).join(' · ') || '—'}</span>
                    <span className={styles.rowMeta}>
                      {num(item.calories)} کالری
                      {' · '}
                      پ {num(item.protein, 1)}
                      {' · '}
                      ک {num(item.carbs, 1)}
                      {' · '}
                      چ {num(item.fat, 1)}
                    </span>
                  </span>
                  <span className={styles.rowAction} aria-hidden>
                    <Check size={14} />
                  </span>
                </button>
              );
            })
          )}
        </div>
      </div>
    </Modal>
  );
}
