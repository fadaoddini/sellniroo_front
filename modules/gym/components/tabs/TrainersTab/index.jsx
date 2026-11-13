// modules/gym/components/tabs/TrainersTab/index.jsx
'use client';

import React, { useMemo, useState } from 'react';
import {
  UserCog,
  UserPlus,
  Trash2,
  Search,
  Users,
  Check,
  X,
  Award,
  Phone,
  Mail,
  Eye,
  EyeOff,
} from 'lucide-react';
import GymTrainers from '@/components/widgets/gym/GymTrainers';
import styles from './TrainersTab.module.css';

const faNum = (n) => Number(n || 0).toLocaleString('fa-IR');

function initials(name) {
  const parts = String(name || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (!parts.length) return 'م';
  if (parts.length === 1) return parts[0].slice(0, 1);
  return `${parts[0].slice(0, 1)}${parts[parts.length - 1].slice(0, 1)}`;
}

export default function TrainersTab({ trainers, onAdd, onToggleStatus, onDelete }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showWidgetPreview, setShowWidgetPreview] = useState(false);

  const stats = useMemo(() => {
    const active = trainers.filter((t) => t.status === 'active').length;
    const clients = trainers.reduce(
      (sum, t) => sum + Number(t.clients_count || 0),
      0,
    );
    return {
      total: trainers.length,
      active,
      inactive: trainers.length - active,
      clients,
    };
  }, [trainers]);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return trainers.filter((t) => {
      const matchStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' ? t.status === 'active' : t.status !== 'active');
      if (!matchStatus) return false;
      if (!q) return true;
      const hay = `${t.full_name || ''} ${t.phone || ''} ${t.email || ''} ${t.specialty || ''}`.toLowerCase();
      return hay.includes(q);
    });
  }, [trainers, searchQuery, statusFilter]);

  return (
    <div className={styles.tabContent}>
      <div className={styles.tabHeader}>
        <div className={styles.tabHeaderLeft}>
          <h3 className={styles.tabTitle}>
            <UserCog size={15} />
            مربیان
          </h3>
          <span className={styles.tabCount}>{faNum(stats.total)}</span>
          <div className={styles.quickStats}>
            <span className={styles.statOk}>
              <Check size={12} />
              {faNum(stats.active)} فعال
            </span>
            {stats.inactive > 0 ? (
              <span className={styles.statMuted}>
                <X size={12} />
                {faNum(stats.inactive)} غیرفعال
              </span>
            ) : null}
            <span>
              <Users size={12} />
              {faNum(stats.clients)} شاگرد
            </span>
          </div>
        </div>
        <div className={styles.tabHeaderRight}>
          <select
            className={styles.filterSelect}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="فیلتر وضعیت"
          >
            <option value="all">همه</option>
            <option value="active">فعال</option>
            <option value="inactive">غیرفعال</option>
          </select>
          <div className={styles.searchBox}>
            <Search size={13} />
            <input
              type="text"
              placeholder="جستجو نام، تخصص، موبایل…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button type="button" className={styles.addButton} onClick={onAdd}>
            <UserPlus size={14} />
            مربی جدید
          </button>
        </div>
      </div>

      <p className={styles.widgetHint}>
        مربی‌های فعال در ویجت «مربیان باشگاه» صفحهٔ عمومی سایت هم نمایش داده می‌شوند.
        <button
          type="button"
          className={styles.previewToggle}
          onClick={() => setShowWidgetPreview((v) => !v)}
        >
          {showWidgetPreview ? <EyeOff size={12} /> : <Eye size={12} />}
          {showWidgetPreview ? 'بستن پیش‌نمایش' : 'پیش‌نمایش ویجت'}
        </button>
      </p>

      {showWidgetPreview ? (
        <div className={styles.widgetPreview} aria-label="پیش‌نمایش ویجت مربیان">
          <GymTrainers />
        </div>
      ) : null}

      {!filtered.length ? (
        <p className={styles.emptyNote}>
          {trainers.length
            ? 'مربی‌ای با این فیلتر پیدا نشد.'
            : 'هنوز مربی‌ای ثبت نشده — با «مربی جدید» شروع کنید.'}
        </p>
      ) : (
        <div className={styles.trainersGrid}>
          {filtered.map((trainer) => {
            const active = trainer.status === 'active';
            const clients = Number(trainer.clients_count || 0);
            return (
              <article
                key={trainer.id}
                className={`${styles.trainerCard} ${active ? '' : styles.trainerCardInactive}`}
              >
                <div className={styles.cardTop}>
                  <div className={styles.avatar} aria-hidden>
                    {trainer.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={trainer.avatar_url} alt="" />
                    ) : (
                      <em>{initials(trainer.full_name)}</em>
                    )}
                  </div>
                  <div className={styles.cardIdentity}>
                    <h4 className={styles.trainerName}>{trainer.full_name}</h4>
                    <p className={styles.specialty}>
                      <Award size={11} />
                      {trainer.specialty || 'مربی باشگاه'}
                    </p>
                  </div>
                  <button
                    type="button"
                    className={`${styles.statusChip} ${active ? styles.statusOn : styles.statusOff}`}
                    onClick={() => onToggleStatus(trainer.id)}
                    title={active ? 'غیرفعال کردن' : 'فعال کردن'}
                  >
                    {active ? <Check size={11} /> : <X size={11} />}
                    {active ? 'فعال' : 'غیرفعال'}
                  </button>
                </div>

                <div className={styles.metaRow}>
                  <span dir="ltr">
                    <Phone size={11} />
                    {trainer.phone || '—'}
                  </span>
                  <span dir="ltr" className={styles.emailMeta}>
                    <Mail size={11} />
                    {trainer.email || '—'}
                  </span>
                </div>

                <div className={styles.cardFooter}>
                  <span className={styles.clientsBadge}>
                    <Users size={12} />
                    {faNum(clients)} شاگرد
                  </span>
                  <button
                    type="button"
                    className={styles.deleteBtn}
                    onClick={() => onDelete(trainer.id)}
                    aria-label={`حذف ${trainer.full_name}`}
                  >
                    <Trash2 size={12} />
                    حذف
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
