// modules/gym/components/modals/ExercisePickerModal.jsx
'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  Search,
  Dumbbell,
  Check,
  Loader2,
  X,
} from 'lucide-react';
import Modal from './Modal';
import { useBodybuildingApi } from '@/hooks/useBodybuildingApi';
import styles from './ExercisePickerModal.module.css';

const MUSCLE_GROUPS = [
  { value: 'chest', label: 'سینه' },
  { value: 'back', label: 'پشت' },
  { value: 'legs', label: 'پا' },
  { value: 'shoulders', label: 'سرشانه' },
  { value: 'arms', label: 'بازو' },
  { value: 'core', label: 'شکم' },
  { value: 'glutes', label: 'باسن' },
  { value: 'cardio', label: 'هوازی' },
  { value: 'full_body', label: 'کل بدن' },
];

function muscleLabel(item) {
  return (
    MUSCLE_GROUPS.find((m) => m.value === item.primary_muscle)?.label ||
    item.primary_muscle_display ||
    item.primary_muscle ||
    '—'
  );
}

function equipmentLabel(item) {
  return item.equipment_display || item.equipment || '';
}

export default function ExercisePickerModal({ isOpen, onClose, onSelect }) {
  const api = useBodybuildingApi();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState(null);

  useEffect(() => {
    if (!isOpen) return;

    let cancelled = false;
    const fetchItems = async () => {
      try {
        setLoading(true);
        setError(null);
        const params = {};
        if (selectedMuscle) params.primary_muscle = selectedMuscle;
        if (search.trim()) params.search = search.trim();
        const data = await api.library.exercises.list(params);
        if (cancelled) return;
        setItems(Array.isArray(data) ? data : data.results || []);
      } catch (err) {
        if (cancelled) return;
        console.error('Fetch exercises error:', err);
        setError(
          err?.response?.data?.detail ||
            err?.message ||
            'خطا در دریافت حرکات.',
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    const timer = setTimeout(fetchItems, 280);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [isOpen, search, selectedMuscle, api]);

  useEffect(() => {
    if (!isOpen) {
      setSearch('');
      setSelectedMuscle(null);
      setError(null);
    }
  }, [isOpen]);

  const countLabel = useMemo(() => {
    if (loading || error) return '';
    return items.length
      ? `${items.length.toLocaleString('fa-IR')} حرکت`
      : 'نتیجه‌ای نیست';
  }, [items.length, loading, error]);

  const handleSelect = (item) => {
    onSelect?.(item);
    onClose?.();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="انتخاب حرکت"
      size="md"
      layer="nested"
    >
      <div className={styles.picker} dir="rtl" lang="fa">
        <div className={styles.searchBox}>
          <Search size={15} />
          <input
            type="search"
            placeholder="جستجو نام حرکت…"
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

        <div className={styles.muscleRow} role="tablist" aria-label="گروه عضلانی">
          <button
            type="button"
            role="tab"
            aria-selected={!selectedMuscle}
            className={`${styles.muscleChip} ${!selectedMuscle ? styles.muscleChipOn : ''}`}
            onClick={() => setSelectedMuscle(null)}
          >
            همه گروه‌ها
          </button>
          {MUSCLE_GROUPS.map((m) => (
            <button
              key={m.value}
              type="button"
              role="tab"
              data-muscle={m.value}
              aria-selected={selectedMuscle === m.value}
              className={`${styles.muscleChip} ${
                selectedMuscle === m.value ? styles.muscleChipOn : ''
              }`}
              onClick={() => setSelectedMuscle(m.value)}
            >
              {m.label}
            </button>
          ))}
        </div>

        <div className={styles.listMeta}>
          <span>{countLabel}</span>
        </div>

        <div className={styles.list} role="listbox" aria-label="لیست حرکات">
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
                  setSelectedMuscle(null);
                }}
              >
                تلاش مجدد
              </button>
            </div>
          ) : items.length === 0 ? (
            <div className={styles.state}>
              <Dumbbell size={22} />
              <span>حرکتی پیدا نشد</span>
            </div>
          ) : (
            items.map((item) => {
              const muscle = muscleLabel(item);
              const equip = equipmentLabel(item);
              const line2 = [muscle, equip].filter(Boolean).join(' · ');
              const sets = item.default_sets ?? '—';
              const reps = item.default_reps ?? '—';
              const rest = item.default_rest_time ?? '—';
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
                        <Dumbbell size={16} />
                      </em>
                    )}
                  </span>

                  <span className={styles.rowBody}>
                    <strong className={styles.rowTitle}>{item.title}</strong>
                    <span className={styles.rowSub}>{line2 || '—'}</span>
                    <span className={styles.rowMeta}>
                      {sets} ست × {reps}
                      {' · '}
                      استراحت {rest}ث
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
