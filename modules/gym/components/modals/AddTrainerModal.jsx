// modules/gym/components/tabs/modals/AddTrainerModal.jsx
'use client';

import React, { useState, useEffect } from 'react';
import { UserPlus } from 'lucide-react';
import Modal from './Modal';
import styles from './SharedForm.module.css';

const empty = { name: '', phone: '', email: '', specialty: '' };

export default function AddTrainerModal({ isOpen, onClose, onAdd }) {
  const [form, setForm] = useState(empty);

  useEffect(() => {
    if (isOpen) setForm(empty);
  }, [isOpen]);

  const handleSubmit = () => {
    if (!form.name.trim() || !form.phone.trim()) {
      alert('لطفاً نام و شماره تماس مربی را وارد کنید.');
      return;
    }
    onAdd(form);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="افزودن مربی جدید">
      <div className={styles.modalForm}>
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label>نام کامل</label>
            <input
              type="text"
              placeholder="نام مربی را وارد کنید"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div className={styles.formGroup}>
            <label>شماره تماس</label>
            <input
              type="text"
              placeholder="۰۹۱۲۳۴۵۶۷۸۹"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>
        </div>
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label>ایمیل (اختیاری)</label>
            <input
              type="email"
              placeholder="example@email.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div className={styles.formGroup}>
            <label>تخصص</label>
            <input
              type="text"
              placeholder="مثلاً: بدنسازی حرفه‌ای"
              value={form.specialty}
              onChange={(e) => setForm({ ...form, specialty: e.target.value })}
            />
          </div>
        </div>
        <div className={styles.modalActions}>
          <button className={styles.modalCancel} onClick={onClose}>انصراف</button>
          <button className={styles.modalConfirm} onClick={handleSubmit}>
            <UserPlus size={16} />
            افزودن مربی
          </button>
        </div>
      </div>
    </Modal>
  );
}