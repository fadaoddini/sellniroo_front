// modules/gym/components/tabs/LibraryTab/ExercisesLibraryPanel.jsx
'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Plus, Search, Edit, Trash2, Dumbbell, Loader2, RefreshCw,
  Eye, X, Filter, PlayCircle, Image as ImageIcon, Info,
} from 'lucide-react';
import styles from './ExercisesLibraryPanel.module.css';

import ExerciseLibraryFormModal from './modals/ExerciseLibraryFormModal';
import ExerciseLibraryDetailModal from './modals/ExerciseLibraryDetailModal';

// ثابت‌ها
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

export default function ExercisesLibraryPanel({ api }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState(null);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  const [showFormModal, setShowFormModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [detailItem, setDetailItem] = useState(null);

  // ============================================
  // Fetch
  // ============================================
  const fetchItems = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      else setRefreshing(true);
      setError(null);

      const params = {};
      if (search.trim()) params.search = search.trim();
      if (selectedMuscle) params.primary_muscle = selectedMuscle;
      if (selectedEquipment) params.equipment = selectedEquipment;
      if (selectedDifficulty) params.difficulty = selectedDifficulty;

      const data = await api.library.exercises.list(params);
      setItems(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      console.error(err);
      setError('خطا در دریافت حرکات');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [api, search, selectedMuscle, selectedEquipment, selectedDifficulty]);

  useEffect(() => {
    const t = setTimeout(() => fetchItems(), 300);
    return () => clearTimeout(t);
  }, [fetchItems]);

  // ============================================
  // Filters
  // ============================================
  const activeFiltersCount = useMemo(() => {
    let c = 0;
    if (selectedEquipment) c++;
    if (selectedDifficulty) c++;
    return c;
  }, [selectedEquipment, selectedDifficulty]);

  const clearFilters = () => {
    setSearch('');
    setSelectedMuscle(null);
    setSelectedEquipment(null);
    setSelectedDifficulty(null);
  };

  // ============================================
  // Handlers
  // ============================================
  const handleAdd = () => {
    setEditingItem(null);
    setShowFormModal(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setShowFormModal(true);
  };

  const handleSave = async (payload, isEdit) => {
    try {
      if (isEdit && editingItem) {
        const updated = await api.library.exercises.update(editingItem.slug, payload);
        setItems(prev => prev.map(i => i.id === updated.id ? updated : i));
      } else {
        const created = await api.library.exercises.create(payload);
        setItems(prev => [created, ...prev]);
      }
      setShowFormModal(false);
      setEditingItem(null);
    } catch (err) {
      alert(err.response?.data?.detail || JSON.stringify(err.response?.data) || 'خطا در ذخیره');
    }
  };

  const handleDelete = async (item) => {
    if (!confirm(`حذف حرکت «${item.title}»؟`)) return;
    try {
      await api.library.exercises.delete(item.slug);
      setItems(prev => prev.filter(i => i.id !== item.id));
    } catch (err) {
      alert(err.response?.data?.detail || 'خطا در حذف');
    }
  };

  // ============================================
  // Render
  // ============================================
  return (
    <div className={styles.panel}>
      {/* ============== نوار بالایی ============== */}
      <div className={styles.topBar}>
        <div className={styles.stats}>
          <span className={styles.statItem}>
            <Dumbbell size={14} />
            <strong>{items.length}</strong> حرکت
          </span>
        </div>

        <div className={styles.actions}>
          <div className={styles.searchBox}>
            <Search size={14} />
            <input
              type="text"
              placeholder="جستجو..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button className={styles.clearBtn} onClick={() => setSearch('')}>
                <X size={12} />
              </button>
            )}
          </div>

          <button
            className={`${styles.iconBtn} ${showFilters ? styles.iconBtnActive : ''}`}
            onClick={() => setShowFilters(!showFilters)}
            title="فیلترها"
          >
            <Filter size={14} />
            {activeFiltersCount > 0 && (
              <span className={styles.filterBadge}>{activeFiltersCount}</span>
            )}
          </button>

          <button
            className={styles.iconBtn}
            onClick={() => fetchItems(true)}
            disabled={refreshing}
            title="بروزرسانی"
          >
            <RefreshCw size={14} className={refreshing ? styles.spinning : ''} />
          </button>

          <button className={styles.addBtn} onClick={handleAdd}>
            <Plus size={14} />
            حرکت جدید
          </button>
        </div>
      </div>

      {/* ============== فیلترها ============== */}
      {showFilters && (
        <div className={styles.filtersPanel}>
          <div className={styles.filterGroup}>
            <label>تجهیزات</label>
            <div className={styles.chips}>
              <button
                className={`${styles.chip} ${!selectedEquipment ? styles.chipActive : ''}`}
                onClick={() => setSelectedEquipment(null)}
              >
                همه
              </button>
              {EQUIPMENT_OPTIONS.map((eq) => (
                <button
                  key={eq.value}
                  className={`${styles.chip} ${selectedEquipment === eq.value ? styles.chipActive : ''}`}
                  onClick={() => setSelectedEquipment(eq.value)}
                >
                  {eq.label}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.filterGroup}>
            <label>سطح دشواری</label>
            <div className={styles.chips}>
              <button
                className={`${styles.chip} ${!selectedDifficulty ? styles.chipActive : ''}`}
                onClick={() => setSelectedDifficulty(null)}
              >
                همه
              </button>
              {DIFFICULTY_OPTIONS.map((d) => (
                <button
                  key={d.value}
                  className={`${styles.chip} ${selectedDifficulty === d.value ? styles.chipActive : ''}`}
                  onClick={() => setSelectedDifficulty(d.value)}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {(activeFiltersCount > 0 || selectedMuscle || search) && (
            <button className={styles.clearFiltersBtn} onClick={clearFilters}>
              <X size={12} />
              پاک کردن همه فیلترها
            </button>
          )}
        </div>
      )}

      {/* ============== تب‌های عضلانی ============== */}
      <div className={styles.muscleTabs} role="tablist" aria-label="گروه عضلانی">
        <button
          type="button"
          role="tab"
          aria-selected={!selectedMuscle}
          className={`${styles.muscleTab} ${!selectedMuscle ? styles.muscleTabActive : ''}`}
          onClick={() => setSelectedMuscle(null)}
        >
          همه گروه‌ها
        </button>
        {MUSCLE_GROUPS.map((m) => (
          <button
            key={m.value}
            type="button"
            role="tab"
            aria-selected={selectedMuscle === m.value}
            className={`${styles.muscleTab} ${selectedMuscle === m.value ? styles.muscleTabActive : ''}`}
            onClick={() => setSelectedMuscle(m.value)}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* ============== لیست ============== */}
      {loading ? (
        <div className={styles.loadingState}>
          <Loader2 className={styles.spinner} size={32} />
          <p>در حال بارگذاری...</p>
        </div>
      ) : error ? (
        <div className={styles.emptyState}>
          <X size={48} />
          <p>{error}</p>
          <button className={styles.retryBtn} onClick={() => fetchItems()}>
            تلاش مجدد
          </button>
        </div>
      ) : items.length === 0 ? (
        <div className={styles.emptyState}>
          <Dumbbell size={48} />
          <h4>حرکتی یافت نشد</h4>
          <p>می‌تونی اولین حرکت رو اضافه کنی</p>
          <button className={styles.addBtn} onClick={handleAdd}>
            <Plus size={14} />
            افزودن حرکت جدید
          </button>
        </div>
      ) : (
        <div className={styles.grid}>
          {items.map((item) => (
            <div key={item.id} className={styles.card}>
              <div className={styles.cardImage}>
                {item.image_url ? (
                  <img src={item.image_url} alt={item.title} loading="lazy" />
                ) : (
                  <div className={styles.imagePlaceholder}>
                    <Dumbbell size={28} />
                  </div>
                )}
                {item.video_url && (
                  <div className={styles.videoBadge}>
                    <PlayCircle size={12} />
                  </div>
                )}
              </div>

              <div className={styles.cardBody}>
                <h4 className={styles.cardTitle}>{item.title}</h4>
                {item.title_en && (
                  <span className={styles.cardTitleEn} dir="ltr">{item.title_en}</span>
                )}

                <div className={styles.cardMeta}>
                  <span className={styles.metaTag}>
                    {MUSCLE_GROUPS.find(m => m.value === item.primary_muscle)?.label || item.primary_muscle}
                  </span>
                  {(item.equipment_display || item.equipment) && (
                    <span className={styles.metaTag}>
                      {item.equipment_display || item.equipment}
                    </span>
                  )}
                </div>

                <div className={styles.cardDefaults}>
                  {item.default_sets} ست × {item.default_reps} — {item.default_rest_time}ث
                </div>
              </div>

              <div className={styles.cardActions}>
                <button
                  className={styles.cardBtn}
                  onClick={() => setDetailItem(item)}
                  title="مشاهده"
                >
                  <Eye size={13} />
                </button>
                <button
                  className={styles.cardBtn}
                  onClick={() => handleEdit(item)}
                  title="ویرایش"
                >
                  <Edit size={13} />
                </button>
                <button
                  className={`${styles.cardBtn} ${styles.cardBtnDanger}`}
                  onClick={() => handleDelete(item)}
                  title="حذف"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ============== Modals ============== */}
      <ExerciseLibraryFormModal
        isOpen={showFormModal}
        onClose={() => { setShowFormModal(false); setEditingItem(null); }}
        onSave={handleSave}
        editingItem={editingItem}
      />

      <ExerciseLibraryDetailModal
        isOpen={!!detailItem}
        onClose={() => setDetailItem(null)}
        item={detailItem}
      />
    </div>
  );
}