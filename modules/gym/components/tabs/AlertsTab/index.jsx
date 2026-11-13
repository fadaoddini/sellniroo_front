// modules/gym/components/tabs/AlertsTab/index.jsx
'use client';

import React, { useMemo } from 'react';
import { Bell, AlertCircle, X, Eye } from 'lucide-react';
import styles from './AlertsTab.module.css';

function normalizeAlerts(alerts) {
  const raw = alerts && typeof alerts === 'object' ? alerts : {};
  const expiringSoon = Array.isArray(raw.expiringSoon)
    ? raw.expiringSoon
    : Array.isArray(raw.expiring_soon)
      ? raw.expiring_soon
      : [];
  const expired = Array.isArray(raw.expired) ? raw.expired : [];
  return { expiringSoon, expired };
}

function memberLabel(user) {
  return user?.full_name || user?.name || '—';
}

function memberDays(user) {
  const value =
    user?.days_remaining ??
    user?.daysRemaining ??
    user?.days_left ??
    0;
  return Number(value) || 0;
}

function AlertCard({ user, tone = 'warn', onView }) {
  const days = memberDays(user);
  return (
    <div className={styles.alertItem}>
      <div className={styles.alertItemInfo}>
        <span className={styles.alertItemName}>{memberLabel(user)}</span>
        <div className={styles.alertMeta}>
          <span className={styles.alertItemPhone} dir="ltr">
            {user.phone || '—'}
          </span>
          {tone === 'warn' ? (
            <span className={styles.alertItemDays}>{days} روز</span>
          ) : (
            <span className={styles.alertItemExpired}>
              {Math.abs(days)} روز گذشته
            </span>
          )}
        </div>
      </div>
      <button
        type="button"
        className={styles.alertItemBtn}
        onClick={() => onView?.(user)}
        aria-label="مشاهده"
      >
        <Eye size={12} />
        مشاهده
      </button>
    </div>
  );
}

export default function AlertsTab({ alerts, onView, onRefresh }) {
  const { expiringSoon, expired } = useMemo(
    () => normalizeAlerts(alerts),
    [alerts],
  );
  const total = expiringSoon.length + expired.length;

  return (
    <div className={styles.tabContent}>
      <div className={styles.tabHeader}>
        <div className={styles.tabHeaderLeft}>
          <h3 className={styles.tabTitle}>
            <Bell size={15} />
            هشدارها
          </h3>
          <span className={styles.tabCount}>{total}</span>
        </div>
        {typeof onRefresh === 'function' ? (
          <button type="button" className={styles.alertItemBtn} onClick={onRefresh}>
            بروزرسانی
          </button>
        ) : null}
      </div>

      <div className={styles.alertsContainer}>
        {expiringSoon.length > 0 ? (
          <section className={styles.alertSection}>
            <h4 className={styles.alertSectionTitle}>
              <AlertCircle size={14} className={styles.warnIcon} />
              نزدیک انقضا ({expiringSoon.length})
            </h4>
            <div className={styles.alertList}>
              {expiringSoon.map((user) => (
                <AlertCard
                  key={user.id}
                  user={user}
                  tone="warn"
                  onView={onView}
                />
              ))}
            </div>
          </section>
        ) : null}

        {expired.length > 0 ? (
          <section className={styles.alertSection}>
            <h4 className={styles.alertSectionTitle}>
              <X size={14} className={styles.dangerIcon} />
              منقضی ({expired.length})
            </h4>
            <div className={styles.alertList}>
              {expired.map((user) => (
                <AlertCard
                  key={user.id}
                  user={user}
                  tone="expired"
                  onView={onView}
                />
              ))}
            </div>
          </section>
        ) : null}

        {total === 0 ? (
          <div className={`${styles.alertSection} ${styles.alertSectionEmpty}`}>
            <p style={{ margin: 0 }}>هشدار فعالی نیست.</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
