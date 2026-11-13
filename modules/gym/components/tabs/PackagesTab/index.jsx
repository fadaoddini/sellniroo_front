// modules/gym/components/tabs/PackagesTab/index.jsx
'use client';

import React from 'react';
import {
  Dumbbell,
  Plus,
  Edit,
  Trash2,
  Check,
  X,
  Zap,
  Calendar,
  Clock,
} from 'lucide-react';
import styles from './PackagesTab.module.css';

const faNum = (n) => Number(n || 0).toLocaleString('fa-IR');

const SCHEDULE_LABELS = {
  daily: 'همه روزه',
  alternate: 'یک روز در میان',
  even: 'یک روز در میان',
  odd: 'یک روز در میان',
};

export default function PackagesTab({ packages, onAdd, onEdit, onDelete }) {
  return (
    <div className={styles.tabContent}>
      <div className={styles.tabHeader}>
        <div className={styles.tabHeaderLeft}>
          <h3 className={styles.tabTitle}>
            <Dumbbell size={15} />
            بسته‌ها
          </h3>
          <span className={styles.tabCount}>{faNum(packages.length)}</span>
        </div>
        <button type="button" className={styles.addButton} onClick={onAdd}>
          <Plus size={14} />
          بسته جدید
        </button>
      </div>

      {!packages.length ? (
        <p className={styles.emptyNote}>هنوز بسته‌ای ثبت نشده است.</p>
      ) : (
        <div className={styles.packagesGrid}>
          {packages.map((pkg) => {
            const price = Number(pkg.final_price ?? pkg.price ?? 0);
            const sessions = (pkg.allowed_sessions_detail || [])
              .map((s) => s.name)
              .filter(Boolean);
            return (
              <article key={pkg.id} className={styles.packageCard}>
                <header className={styles.packageCardHeader}>
                  <div className={styles.packageTitleBlock}>
                    <h4 className={styles.packageCardTitle}>{pkg.title}</h4>
                    {Number(pkg.discount) > 0 ? (
                      <span className={styles.packageCardDiscount}>
                        <Zap size={11} />
                        {faNum(pkg.discount)}٪
                      </span>
                    ) : null}
                  </div>
                  <div className={styles.packageCardActions}>
                    <button
                      type="button"
                      className={styles.packageActionBtn}
                      onClick={() => onEdit(pkg)}
                      aria-label="ویرایش"
                    >
                      <Edit size={12} />
                    </button>
                    <button
                      type="button"
                      className={`${styles.packageActionBtn} ${styles.packageActionBtnDanger}`}
                      onClick={() => onDelete(pkg.id)}
                      aria-label="حذف"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </header>

                <div className={styles.packageCardPrice}>
                  <strong>{faNum(price)}</strong>
                  <span>تومان</span>
                  {pkg.duration_days ? (
                    <em>{faNum(pkg.duration_days)} روز</em>
                  ) : null}
                </div>

                <div className={styles.packageChips}>
                  <span
                    className={`${styles.chip} ${
                      pkg.has_aerobic ? styles.chipOn : styles.chipOff
                    }`}
                  >
                    {pkg.has_aerobic ? <Check size={11} /> : <X size={11} />}
                    هوازی
                  </span>
                  <span
                    className={`${styles.chip} ${
                      pkg.has_extra_facilities ? styles.chipOn : styles.chipOff
                    }`}
                  >
                    {pkg.has_extra_facilities ? (
                      <Check size={11} />
                    ) : (
                      <X size={11} />
                    )}
                    امکانات
                  </span>
                </div>

                {pkg.description ? (
                  <p className={styles.packageCardDesc}>{pkg.description}</p>
                ) : null}

                <div className={styles.packageMeta}>
                  <span>
                    <Calendar size={12} />
                    {SCHEDULE_LABELS[pkg.schedule] ||
                      pkg.schedule_display ||
                      pkg.schedule ||
                      '—'}
                  </span>
                  <span>
                    <Clock size={12} />
                    {sessions.length ? sessions.join('، ') : 'همه سانس‌ها'}
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
