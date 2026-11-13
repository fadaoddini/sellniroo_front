// modules/gym/components/modals/EditUserModal.jsx
'use client';

import React, { useState, useEffect } from 'react';
import { Edit } from 'lucide-react';
import Modal from './Modal';
import styles from './SharedForm.module.css';

export default function EditUserModal({
  isOpen,
  onClose,
  user,
  onSave,
  packages = [],
  sessions = [],
  trainers = [],
}) {
  const [form, setForm] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      setForm({
        id: user.id,
        full_name: user.full_name || '',
        phone: user.phone || '',
        email: user.email || '',
        gender: user.gender || 'male',
        membership: user.membership || 'bronze',
        package: user.package || '',
        session: user.session || '',
        trainer: user.trainer || '',
        join_date: user.join_date || '',
        expiration_date: user.expiration_date || '',
        notes: user.notes || '',
      });
    }
  }, [isOpen, user]);

  if (!user || !form) return null;

  const filteredSessions = sessions.filter(
    (s) => !form.gender || s.gender === form.gender
  );

  const handleSubmit = async () => {
    if (!form.full_name?.trim() || !form.phone?.trim()) {
      alert('نام و شماره تماس الزامی است');
      return;
    }
    setSubmitting(true);
    try {
      const payload = { ...form };
      ['package', 'session', 'trainer'].forEach((k) => {
        if (!payload[k]) payload[k] = null;
      });
      await onSave(payload);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`ویرایش: ${user.full_name}`} size="lg">
      <div className={styles.modalForm}>
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label>نام کامل</label>
            <input
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
            />
          </div>
          <div className={styles.formGroup}>
            <label>شماره تماس</label>
            <input
              dir="ltr"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label>ایمیل</label>
            <input
              dir="ltr"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div className={styles.formGroup}>
            <label>جنسیت</label>
            <select
              value={form.gender}
              onChange={(e) => setForm({ ...form, gender: e.target.value })}
            >
              <option value="male">آقایان</option>
              <option value="female">بانوان</option>
            </select>
          </div>
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label>عضویت</label>
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
              value={form.session || ''}
              onChange={(e) => setForm({ ...form, session: e.target.value })}
            >
              <option value="">بدون سانس</option>
              {filteredSessions.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label>بسته</label>
            <select
              value={form.package || ''}
              onChange={(e) => setForm({ ...form, package: e.target.value })}
            >
              <option value="">بدون بسته</option>
              {packages.map((p) => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
          </div>
          <div className={styles.formGroup}>
            <label>مربی</label>
            <select
              value={form.trainer || ''}
              onChange={(e) => setForm({ ...form, trainer: e.target.value })}
            >
              <option value="">بدون مربی</option>
              {trainers.map((t) => (
                <option key={t.id} value={t.id}>{t.full_name}</option>
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
            <label>تاریخ انقضا</label>
            <input
              type="date"
              value={form.expiration_date}
              onChange={(e) => setForm({ ...form, expiration_date: e.target.value })}
            />
          </div>
        </div>

        <div className={styles.formGroup}>
          <label>یادداشت</label>
          <textarea
            rows={3}
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />
        </div>

        <div className={styles.modalActions}>
          <button className={styles.modalCancel} onClick={onClose} disabled={submitting}>
            انصراف
          </button>
          <button className={styles.modalConfirm} onClick={handleSubmit} disabled={submitting}>
            <Edit size={16} />
            {submitting ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
          </button>
        </div>
      </div>
    </Modal>
  );
}