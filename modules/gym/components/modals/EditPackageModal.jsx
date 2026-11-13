// modules/gym/components/modals/EditPackageModal.jsx
'use client';

import React, { useEffect, useState } from 'react';
import { Check, Save } from 'lucide-react';
import Modal from './Modal';
import styles from './SharedForm.module.css';

const SCHEDULE_OPTIONS = [
  { value: 'daily', label: 'همه روزه' },
  { value: 'alternate', label: 'یک روز در میان' },
];

const SCHEDULE_ALIASES = {
  'همه روزه': 'daily',
  زوج: 'even',
  'روزهای زوج': 'even',
  فرد: 'odd',
  'روزهای فرد': 'odd',
  'یک روز در میان': 'alternate',
};

function normalizeSchedule(value) {
  if (!value) return 'daily';
  if (SCHEDULE_ALIASES[value]) return SCHEDULE_ALIASES[value];
  if (value === 'even' || value === 'odd') return 'alternate';
  if (value === 'daily' || value === 'alternate') return value;
  return 'daily';
}

function fromPkg(pkg) {
  if (!pkg) return null;
  const sessions =
    Array.isArray(pkg.allowed_sessions) && pkg.allowed_sessions.length
      ? pkg.allowed_sessions.map(Number)
      : (pkg.allowed_sessions_detail || []).map((s) => Number(s.id));
  return {
    id: pkg.id,
    title: pkg.title || '',
    price: pkg.price ?? '',
    discount: pkg.discount ?? '',
    duration_days: pkg.duration_days ?? 30,
    schedule: normalizeSchedule(pkg.schedule),
    allowed_sessions: sessions,
    has_aerobic: !!(pkg.has_aerobic ?? pkg.hasAerobic),
    has_extra_facilities: !!(
      pkg.has_extra_facilities ?? pkg.hasExtraFacilities
    ),
    description: pkg.description || '',
    is_active: pkg.is_active !== false,
  };
}

function toPayload(form) {
  return {
    id: form.id,
    title: String(form.title || '').trim(),
    price: Number(form.price) || 0,
    discount: Number(form.discount) || 0,
    duration_days: Number(form.duration_days) || 30,
    schedule: form.schedule || 'daily',
    allowed_sessions: Array.isArray(form.allowed_sessions)
      ? form.allowed_sessions.map(Number)
      : [],
    has_aerobic: !!form.has_aerobic,
    has_extra_facilities: !!form.has_extra_facilities,
    description: form.description || '',
    is_active: form.is_active !== false,
  };
}

export default function EditPackageModal({
  isOpen,
  onClose,
  pkg,
  onSave,
  sessions = [],
}) {
  const [form, setForm] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && pkg) {
      setForm(fromPkg(pkg));
      setError('');
    }
  }, [isOpen, pkg]);

  if (!pkg || !form) return null;

  const toggleSession = (id) => {
    const sid = Number(id);
    setForm((prev) => {
      const current = prev.allowed_sessions || [];
      const next = current.includes(sid)
        ? current.filter((x) => x !== sid)
        : [...current, sid];
      return { ...prev, allowed_sessions: next };
    });
  };

  const handleSubmit = () => {
    const payload = toPayload(form);
    if (!payload.title || !payload.price) {
      setError('عنوان و قیمت بسته الزامی است.');
      return;
    }
    setError('');
    onSave(payload);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`ویرایش: ${pkg.title}`}>
      <div className={styles.modalForm}>
        <div className={styles.formGroup}>
          <label htmlFor="edit-pkg-title">عنوان بسته</label>
          <input
            id="edit-pkg-title"
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            autoFocus
          />
        </div>

        <div className={styles.formRow3}>
          <div className={styles.formGroup}>
            <label htmlFor="edit-pkg-price">قیمت (تومان)</label>
            <input
              id="edit-pkg-price"
              type="number"
              min="0"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="edit-pkg-discount">تخفیف (%)</label>
            <input
              id="edit-pkg-discount"
              type="number"
              min="0"
              max="100"
              value={form.discount}
              onChange={(e) => setForm({ ...form, discount: e.target.value })}
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="edit-pkg-days">اعتبار (روز)</label>
            <input
              id="edit-pkg-days"
              type="number"
              min="1"
              value={form.duration_days}
              onChange={(e) =>
                setForm({ ...form, duration_days: e.target.value })
              }
            />
          </div>
        </div>

        <div className={styles.formGroup}>
          <span className={styles.fieldLabel}>برنامه هفتگی</span>
          <div className={styles.segmentGroup} role="group">
            {SCHEDULE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                className={`${styles.segmentBtn} ${
                  form.schedule === opt.value ? styles.segmentBtnActive : ''
                }`}
                onClick={() => setForm({ ...form, schedule: opt.value })}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.formGroup}>
          <span className={styles.fieldLabel}>سانس‌های مجاز</span>
          {sessions?.length ? (
            <div className={styles.chipGrid}>
              {sessions.map((s) => {
                const active = (form.allowed_sessions || []).includes(
                  Number(s.id),
                );
                return (
                  <button
                    key={s.id}
                    type="button"
                    className={`${styles.chipBtn} ${
                      active ? styles.chipBtnActive : ''
                    }`}
                    onClick={() => toggleSession(s.id)}
                  >
                    {active ? <Check size={11} /> : null}
                    {s.name}
                  </button>
                );
              })}
            </div>
          ) : (
            <p className={styles.chipEmpty}>سانسی ثبت نشده است.</p>
          )}
        </div>

        <div className={styles.toggleRow}>
          <button
            type="button"
            className={`${styles.toggleCard} ${
              form.has_aerobic ? styles.toggleCardOn : ''
            }`}
            onClick={() =>
              setForm({ ...form, has_aerobic: !form.has_aerobic })
            }
          >
            <span className={styles.toggleSwitch} aria-hidden />
            <span className={styles.toggleText}>
              <strong>هوازی</strong>
              <em>{form.has_aerobic ? 'فعال' : 'غیرفعال'}</em>
            </span>
          </button>
          <button
            type="button"
            className={`${styles.toggleCard} ${
              form.has_extra_facilities ? styles.toggleCardOn : ''
            }`}
            onClick={() =>
              setForm({
                ...form,
                has_extra_facilities: !form.has_extra_facilities,
              })
            }
          >
            <span className={styles.toggleSwitch} aria-hidden />
            <span className={styles.toggleText}>
              <strong>امکانات اضافی</strong>
              <em>{form.has_extra_facilities ? 'فعال' : 'غیرفعال'}</em>
            </span>
          </button>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="edit-pkg-desc">توضیحات</label>
          <textarea
            id="edit-pkg-desc"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={2}
          />
        </div>

        {error ? <p className={styles.errorText}>{error}</p> : null}

        <div className={styles.modalActions}>
          <button type="button" className={styles.modalCancel} onClick={onClose}>
            انصراف
          </button>
          <button
            type="button"
            className={styles.modalConfirm}
            onClick={handleSubmit}
          >
            <Save size={14} />
            ذخیره
          </button>
        </div>
      </div>
    </Modal>
  );
}
