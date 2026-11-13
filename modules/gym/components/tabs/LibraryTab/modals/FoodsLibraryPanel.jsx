// modules/gym/components/tabs/LibraryTab/FoodsLibraryPanel.jsx
'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Plus, Search, Edit, Trash2, Apple, Loader2, RefreshCw,
  Eye, X, Filter, Flame, Image as ImageIcon,
} from 'lucide-react';
import styles from './FoodsLibraryPanel.module.css';

import FoodLibraryFormModal from './FoodLibraryFormModal';
import FoodLibraryDetailModal from './FoodLibraryDetailModal';

// ============================================
// دسته‌بندی‌ها
// ============================================
const CATEGORIES = [
  { value: 'protein', label: 'پروتئینی', icon: '🥩' },
  { value: 'carb', label: 'کربوهیدرات', icon: '🍚' },
  { value: 'fat', label: 'چربی', icon: '🥑' },
  { value: 'vegetable', label: 'سبزیجات', icon: '🥦' },
  { value: 'fruit', label: 'میوه', icon: '🍎' },
  { value: 'dairy', label: 'لبنیات', icon: '🥛' },
  { value: 'grain', label: 'غلات', icon: '🌾' },
  { value: 'drink', label: 'نوشیدنی', icon: '🥤' },
  { value: 'snack', label: 'میان‌وعده', icon: '🍫' },
  { value: 'supplement', label: 'مکمل', icon: '💊' },
  { value: 'other', label: 'سایر', icon: '🍽️' },
];

export default function FoodsLibraryPanel({ api }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [filterVegan, setFilterVegan] = useState(false);
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
      if (selectedCategory) params.category = selectedCategory;
      if (filterVegan) params.is_vegan = 'true';

      const data = await api.library.foods.list(params);
      setItems(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      console.error(err);
      setError('خطا در دریافت غذاها');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [api, search, selectedCategory, filterVegan]);

  useEffect(() => {
    const t = setTimeout(() => fetchItems(), 300);
    return () => clearTimeout(t);
  }, [fetchItems]);

  // ============================================
  // Filters
  // ============================================
  const activeFiltersCount = useMemo(() => {
    let c = 0;
    if (filterVegan) c++;
    return c;
  }, [filterVegan]);

  const clearFilters = () => {
    setSearch('');
    setSelectedCategory(null);
    setFilterVegan(false);
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
        const updated = await api.library.foods.update(editingItem.slug, payload);
        setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
      } else {
        const created = await api.library.foods.create(payload);
        setItems((prev) => [created, ...prev]);
      }
      setShowFormModal(false);
      setEditingItem(null);
    } catch (err) {
      alert(err.response?.data?.detail || 'خطا در ذخیره');
    }
  };

  const handleDelete = async (item) => {
    if (!confirm(`حذف «${item.name}»؟`)) return;
    try {
      await api.library.foods.delete(item.slug);
      setItems((prev) => prev.filter((i) => i.id !== item.id));
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
            <Apple size={14} />
            <strong>{items.length}</strong> غذا
          </span>
        </div>

        <div className={styles.actions}>
          <div className={styles.searchBox}>
            <Search size={14} />
            <input
              type="text"
              placeholder="جستجوی غذا..."
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
            غذای جدید
          </button>
        </div>
      </div>

      {/* ============== فیلترها ============== */}
      {showFilters && (
        <div className={styles.filtersPanel}>
          <div className={styles.filterGroup}>
            <label>ویژگی‌ها</label>
            <div className={styles.chips}>
              <button
                className={`${styles.chip} ${filterVegan ? styles.chipActive : ''}`}
                onClick={() => setFilterVegan(!filterVegan)}
              >
                🌱 وگان
              </button>
            </div>
          </div>

          {(activeFiltersCount > 0 || selectedCategory || search) && (
            <button className={styles.clearFiltersBtn} onClick={clearFilters}>
              <X size={12} />
              پاک کردن همه فیلترها
            </button>
          )}
        </div>
      )}

      {/* ============== تب‌های دسته‌بندی ============== */}
      <div className={styles.categoryTabs}>
        <button
          className={`${styles.categoryTab} ${!selectedCategory ? styles.categoryTabActive : ''}`}
          onClick={() => setSelectedCategory(null)}
        >
          همه
        </button>
        {CATEGORIES.map((c) => (
          <button
            key={c.value}
            className={`${styles.categoryTab} ${selectedCategory === c.value ? styles.categoryTabActive : ''}`}
            onClick={() => setSelectedCategory(c.value)}
          >
            <span>{c.icon}</span>
            {c.label}
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
          <Apple size={48} />
          <h4>غذایی یافت نشد</h4>
          <p>اولین غذا رو اضافه کن</p>
          <button className={styles.addBtn} onClick={handleAdd}>
            <Plus size={14} />
            افزودن غذای جدید
          </button>
        </div>
      ) : (
        <div className={styles.grid}>
          {items.map((item) => (
            <div key={item.id} className={styles.card}>
              <div className={styles.cardImage}>
                {item.image_url ? (
                  <img src={item.image_url} alt={item.name} loading="lazy" />
                ) : (
                  <div className={styles.imagePlaceholder}>
                    <Apple size={28} />
                  </div>
                )}
                <div className={styles.categoryBadge}>
                  {CATEGORIES.find((c) => c.value === item.category)?.icon || '🍽️'}
                </div>
              </div>

              <div className={styles.cardBody}>
                <h4 className={styles.cardTitle}>{item.name}</h4>
                {item.name_en && (
                  <span className={styles.cardTitleEn} dir="ltr">
                    {item.name_en}
                  </span>
                )}

                <div className={styles.nutritionRow}>
                  <div className={styles.nutritionItem}>
                    <Flame size={12} />
                    <span className={styles.nutritionValue}>
                      {Number(item.calories).toFixed(0)}
                    </span>
                    <span className={styles.nutritionLabel}>کالری</span>
                  </div>
                </div>

                <div className={styles.macros}>
                  <div className={styles.macro}>
                    <span className={styles.macroLabel}>پروتئین</span>
                    <span className={styles.macroValue}>{Number(item.protein).toFixed(1)}g</span>
                  </div>
                  <div className={styles.macro}>
                    <span className={styles.macroLabel}>کربو</span>
                    <span className={styles.macroValue}>{Number(item.carbs).toFixed(1)}g</span>
                  </div>
                  <div className={styles.macro}>
                    <span className={styles.macroLabel}>چربی</span>
                    <span className={styles.macroValue}>{Number(item.fat).toFixed(1)}g</span>
                  </div>
                </div>

                <div className={styles.baseInfo}>
                  به ازای {Number(item.base_amount)} {item.base_unit === 'gram' ? 'گرم' : 'واحد'}
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
      <FoodLibraryFormModal
        isOpen={showFormModal}
        onClose={() => {
          setShowFormModal(false);
          setEditingItem(null);
        }}
        onSave={handleSave}
        editingItem={editingItem}
      />

      <FoodLibraryDetailModal
        isOpen={!!detailItem}
        onClose={() => setDetailItem(null)}
        item={detailItem}
      />
    </div>
  );
}