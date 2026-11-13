// modules/gym/components/tabs/modals/AddSessionModal.jsx
'use client';

import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import Modal from './Modal';
import styles from './SharedForm.module.css';

const empty = { name: '', startTime: '', endTime: '', gender: 'آقایان', capacity: 0 };

export default function AddSessionModal({ isOpen, onClose, onAdd }) {
  const [form, setForm] = useState(empty);

  useEffect(() => {
    if (isOpen) setForm(empty);
  }, [isOpen]);

  const handleSubmit = () => {
    if (!form.name.trim() || !form.startTime || !form.endTime) {
      alert('لطفاً تمام فیلدهای سانس را کامل کنید.');
      return;
    }
    onAdd(form);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="افزودن سانس جدید">
      <div className={styles.modalForm}>
        <div className={styles.formGroup}>
          <label>نام سانس</label>
          <input
            type="text"
            placeholder="مثلاً: صبح"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label>ساعت شروع</label>
            <input
              type="time"
              value={form.startTime}
              onChange={(e) => setForm({ ...form, startTime: e.target.value })}
            />
          </div>
          <div className={styles.formGroup}>
            <label>ساعت پایان</label>
            <input
              type="time"
              value={form.endTime}
              onChange={(e) => setForm({ ...form, endTime: e.target.value })}
            />
          </div>
        </div>
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label>جنسیت</label>
            <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
              <option value="آقایان">آقایان</option>
              <option value="بانوان">بانوان</option>
            </select>
          </div>
          <div className={styles.formGroup}>
            <label>ظرفیت</label>
            <input
              type="number"
              placeholder="۳۰"
              value={form.capacity || ''}
              onChange={(e) => setForm({ ...form, capacity: parseInt(e.target.value) || 0 })}
            />
          </div>
        </div>
        <div className={styles.modalActions}>
          <button className={styles.modalCancel} onClick={onClose}>انصراف</button>
          <button className={styles.modalConfirm} onClick={handleSubmit}>
            <Plus size={16} />
            افزودن سانس
          </button>
        </div>
      </div>
    </Modal>
  );
}