'use client';

import React, { useEffect, useState } from 'react';
import {
  Archive,
  Flame,
  Loader2,
  Search,
  Target,
  Trash2,
  Utensils,
  X,
} from 'lucide-react';
import Modal from './Modal';
import styles from './WorkoutArchivePickerModal.module.css';

const TYPE_LABEL = {
  gain: 'افزایش وزن',
  loss: 'کاهش وزن',
  maintain: 'تثبیت وزن',
  bulk: 'حجمی',
  cut: 'خشک',
  special: 'تخصصی',
};

export default function DietArchivePickerModal({
  isOpen,
  onClose,
  api,
  onSelect,
}) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [applyingId, setApplyingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    if (!isOpen || !api?.dietProgramArchives?.list) return undefined;

    let cancelled = false;
    const fetchItems = async () => {
      try {
        setLoading(true);
        setError(null);
        const params = {};
        if (search.trim()) params.search = search.trim();
        const data = await api.dietProgramArchives.list(params);
        if (cancelled) return;
        setItems(Array.isArray(data) ? data : data.results || []);
      } catch (err) {
        if (cancelled) return;
        console.error('Fetch diet archives error:', err);
        setError(
          err?.response?.data?.detail ||
            err?.message ||
            'خطا در دریافت آرشیو برنامه‌های غذایی.',
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    const timer = setTimeout(fetchItems, 220);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [isOpen, search, api]);

  const handleApply = async (item) => {
    if (!onSelect || applyingId) return;
    try {
      setApplyingId(item.id);
      await onSelect(item);
    } finally {
      setApplyingId(null);
    }
  };

  const handleDelete = async (e, item) => {
    e.stopPropagation();
    if (!api?.dietProgramArchives?.delete || deletingId) return;
    if (!window.confirm(`«${item.name}» از آرشیو حذف شود؟`)) return;
    try {
      setDeletingId(item.id);
      await api.dietProgramArchives.delete(item.id);
      setItems((prev) => prev.filter((x) => x.id !== item.id));
    } catch (err) {
      console.error('Delete diet archive error:', err);
      alert(err?.response?.data?.detail || 'حذف آرشیو ناموفق بود.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="انتخاب از آرشیو برنامه‌های غذایی"
      size="lg"
    >
      <div className={styles.picker}>
        <p className={styles.hint}>
          برنامه‌هایی که قبلاً آرشیو کرده‌اید را برای همین روز اعمال کنید.
        </p>

        <div className={styles.searchBox}>
          <Search size={16} />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="جستجوی نام برنامه..."
            autoFocus
          />
          {search ? (
            <button
              type="button"
              className={styles.clearSearch}
              onClick={() => setSearch('')}
              aria-label="پاک کردن"
            >
              <X size={14} />
            </button>
          ) : null}
        </div>

        <div className={styles.list}>
          {loading ? (
            <div className={styles.state}>
              <Loader2 className={styles.spin} size={22} />
              <span>در حال بارگذاری...</span>
            </div>
          ) : error ? (
            <div className={styles.stateError}>{error}</div>
          ) : items.length === 0 ? (
            <div className={styles.state}>
              <Archive size={28} />
              <span>هنوز برنامه غذایی در آرشیو ندارید.</span>
              <small>از روی هر برنامه، دکمه «آرشیو» را بزنید.</small>
            </div>
          ) : (
            items.map((item) => {
              const busy = applyingId === item.id;
              const deleting = deletingId === item.id;
              const count = item.meals_count ?? item.meals?.length ?? 0;
              return (
                <div key={item.id} className={styles.card}>
                  <div className={styles.cardMain}>
                    <div className={styles.cardIcon} aria-hidden>
                      <Utensils size={18} />
                    </div>
                    <div className={styles.cardInfo}>
                      <div className={styles.cardTitle}>{item.name}</div>
                      <div className={styles.cardMeta}>
                        <span>
                          <Target size={12} />
                          {TYPE_LABEL[item.diet_type] ||
                            item.diet_type_display ||
                            item.diet_type}
                        </span>
                        <span>
                          <Utensils size={12} />
                          {count} وعده
                        </span>
                        {item.total_calories ? (
                          <span>
                            <Flame size={12} />
                            {item.total_calories} کالری
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>
                  <div className={styles.cardActions}>
                    <button
                      type="button"
                      className={styles.deleteBtn}
                      onClick={(e) => handleDelete(e, item)}
                      disabled={deleting || busy}
                      title="حذف از آرشیو"
                    >
                      {deleting ? <Loader2 size={14} className={styles.spin} /> : <Trash2 size={14} />}
                    </button>
                    <button
                      type="button"
                      className={styles.applyBtn}
                      onClick={() => handleApply(item)}
                      disabled={busy || deleting}
                    >
                      {busy ? (
                        <>
                          <Loader2 size={14} className={styles.spin} />
                          در حال اعمال...
                        </>
                      ) : (
                        'استفاده در این روز'
                      )}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </Modal>
  );
}
