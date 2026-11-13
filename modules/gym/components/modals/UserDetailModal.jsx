// modules/gym/components/modals/UserDetailModal.jsx
'use client';

import React from 'react';
import { ClipboardList, Utensils, Phone, Mail, Calendar } from 'lucide-react';
import Modal from './Modal';
import styles from './UserDetailModal.module.css';
import { formatJalaliDate } from '@/utils/dateUtils';

export default function UserDetailModal({
  isOpen,
  onClose,
  user,
  onOpenWorkout,
  onOpenDiet,
}) {
  if (!user) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`جزئیات: ${user.full_name}`}
      size="lg"
    >
      <div className={styles.modalDetailContent}>
        <div className={styles.detailGrid}>
          <DetailItem label="نام کامل" value={user.full_name} />
          <DetailItem label="شماره تماس" value={user.phone} />
          <DetailItem label="ایمیل" value={user.email || '-'} />
          <DetailItem
            label="جنسیت"
            value={user.gender === 'male' ? 'آقا' : 'خانم'}
          />
          <DetailItem
            label="نوع عضویت"
            value={user.membership_display || user.membership}
          />
          <DetailItem label="بسته" value={user.package_title || '-'} />
          <DetailItem label="سانس" value={user.session_name || '-'} />
          <DetailItem label="مربی" value={user.trainer_name || '-'} />

          {/* ✅ تاریخ عضویت */}
          <DetailItem
            label="تاریخ عضویت"
            value={formatJalaliDate(user.join_date)}
          />

          {/* ✅ تاریخ انقضا */}
          <DetailItem
            label="تاریخ انقضا"
            value={formatJalaliDate(user.expiration_date)}
          />

          <DetailItem
            label="روزهای باقی‌مانده"
            value={
              user.days_remaining < 0
                ? `${Math.abs(user.days_remaining)} روز گذشته`
                : `${user.days_remaining} روز`
            }
            valueClass={
              user.days_remaining < 0
                ? styles.expiredText
                : user.days_remaining <= 15
                ? styles.expiringText
                : ''
            }
          />
          <DetailItem label="وضعیت" value={user.status_display} />
        </div>

        <div className={styles.detailActionsRow}>
          <button
            className={styles.detailActionBtn}
            onClick={() => onOpenWorkout(user)}
          >
            <ClipboardList size={14} />
            برنامه تمرینی
          </button>
          <button
            className={styles.detailActionBtn}
            onClick={() => onOpenDiet(user)}
          >
            <Utensils size={14} />
            برنامه غذایی
          </button>
        </div>

        <div className={styles.detailActions}>
          <button className={styles.modalCancel} onClick={onClose}>
            بستن
          </button>
        </div>
      </div>
    </Modal>
  );
}

function DetailItem({ label, value, valueClass = '' }) {
  return (
    <div className={styles.detailItem}>
      <span className={styles.detailLabel}>{label}</span>
      <span className={`${styles.detailValue} ${valueClass}`}>{value}</span>
    </div>
  );
}