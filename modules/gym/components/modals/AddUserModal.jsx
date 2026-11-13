// modules/gym/components/modals/AddUserModal.jsx
'use client';

import React, { useState, useEffect } from 'react';
import { UserPlus } from 'lucide-react';
import Modal from './Modal';
import styles from './SharedForm.module.css';

const EMPTY = {
  full_name: '',
  phone: '',
  email: '',
  gender: 'male',
  membership: 'bronze',
  package: '',
  session: '',
  trainer: '',
  join_date: new Date().toISOString().slice(0, 10),
  expiration_date: '',
  notes: '',
};

export default function AddUserModal({
  isOpen,
  onClose,
  onAdd,
  packages = [],
  sessions = [],
  trainers = [],
}) {
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setForm(EMPTY);
      setErrors({});
    }
  }, [isOpen]);

  // فیلتر سانس‌ها بر اساس جنسیت
  const filteredSessions = sessions.filter(
    (s) => !form.gender || s.gender === form.gender
  );

  // فیلتر پکیج‌های مجاز بر اساس سانس انتخابی
  const filteredPackages = form.session
    ? packages.filter((p) =>
        (p.allowed_sessions || []).includes(parseInt(form.session))
      )
    : packages;

  const validate = () => {
    const errs = {};
    if (!form.full_name?.trim()) errs.full_name = 'نام کامل الزامی است';
    if (!form.phone?.trim()) errs.phone = 'شماره تماس الزامی است';
    else if (!/^09\d{9}$/.test(form.phone))
      errs.phone = 'شماره موبایل معتبر نیست (مثال: 09123456789)';
    if (!form.expiration_date) errs.expiration_date = 'تاریخ انقضا الزامی است';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const payload = { ...form };
      // تبدیل "" به null
      ['package', 'session', 'trainer'].forEach((k) => {
        if (!payload[k]) payload[k] = null;
      });
      await onAdd(payload);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="افزودن کاربر جدید" size="lg">
      <div className={styles.modalForm}>
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label>نام کامل *</label>
            <input
              type="text"
              placeholder="نام کاربر"
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
            />
            {errors.full_name && <span className={styles.errorText}>{errors.full_name}</span>}
          </div>
          <div className={styles.formGroup}>
            <label>شماره تماس *</label>
            <input
              type="tel"
              placeholder="09123456789"
              dir="ltr"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
            {errors.phone && <span className={styles.errorText}>{errors.phone}</span>}
          </div>
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label>ایمیل (اختیاری)</label>
            <input
              type="email"
              placeholder="example@email.com"
              dir="ltr"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div className={styles.formGroup}>
            <label>جنسیت *</label>
            <select
              value={form.gender}
              onChange={(e) => {
                setForm({ ...form, gender: e.target.value, session: '' });
              }}
            >
              <option value="male">آقایان</option>
              <option value="female">بانوان</option>
            </select>
          </div>
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label>نوع عضویت *</label>
            <select
              value={form.membership}
              onChange={(e) => setForm({ ...form, membership: e.target.value })}
            >
              <option value="bronze">برنزی</option>
              <option value="silver">نقره‌ای</option>
              <option value="gold">طلایی</option>
            </select>
          </div>
          <div className={styles.formGroup}>
            <label>سانس</label>
            <select
              value={form.session}
              onChange={(e) => setForm({ ...form, session: e.target.value, package: '' })}
            >
              <option value="">انتخاب سانس</option>
              {filteredSessions.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.start_time} - {s.end_time})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label>بسته تمرینی</label>
            <select
              value={form.package}
              onChange={(e) => setForm({ ...form, package: e.target.value })}
            >
              <option value="">انتخاب بسته</option>
              {filteredPackages.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title} — {parseInt(p.price).toLocaleString('fa-IR')} تومان
                </option>
              ))}
            </select>
          </div>
          <div className={styles.formGroup}>
            <label>مربی (اختیاری)</label>
            <select
              value={form.trainer}
              onChange={(e) => setForm({ ...form, trainer: e.target.value })}
            >
              <option value="">بدون مربی</option>
              {trainers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.full_name} — {t.specialty}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label>تاریخ عضویت</label>
            <input
              type="date"
              value={form.join_date}
              onChange={(e) => setForm({ ...form, join_date: e.target.value })}
            />
          </div>
          <div className={styles.formGroup}>
            <label>تاریخ انقضا *</label>
            <input
              type="date"
              value={form.expiration_date}
              onChange={(e) => setForm({ ...form, expiration_date: e.target.value })}
            />
            {errors.expiration_date && (
              <span className={styles.errorText}>{errors.expiration_date}</span>
            )}
          </div>
        </div>

        <div className={styles.formGroup}>
          <label>یادداشت</label>
          <textarea
            rows={3}
            placeholder="یادداشت داخلی..."
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />
        </div>

        <div className={styles.modalActions}>
          <button className={styles.modalCancel} onClick={onClose} disabled={submitting}>
            انصراف
          </button>
          <button className={styles.modalConfirm} onClick={handleSubmit} disabled={submitting}>
            <UserPlus size={16} />
            {submitting ? 'در حال ثبت...' : 'افزودن کاربر'}
          </button>
        </div>
      </div>
    </Modal>
  );
}