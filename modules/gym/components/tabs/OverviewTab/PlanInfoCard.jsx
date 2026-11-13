// modules/gym/components/tabs/OverviewTab/PlanInfoCard.jsx
'use client';

import React from 'react';
import {
  Crown,
  Gem,
  Star,
  Check,
  X,
  Calendar,
  Users,
  Sparkles,
} from 'lucide-react';
import styles from './PlanInfoCard.module.css';

const iconMap = {
  Gold: Crown,
  Silver: Gem,
  Bronze: Star,
};

const planColors = {
  gold: { color: '#ffd700', bg: 'rgba(255, 215, 0, 0.15)' },
  silver: { color: '#c0c0c0', bg: 'rgba(192, 192, 192, 0.15)' },
  bronze: { color: '#cd7f32', bg: 'rgba(205, 127, 50, 0.15)' },
};

export default function PlanInfoCard({ planInfo }) {
  if (!planInfo) return null;

  const Icon = iconMap[planInfo.icon] || Gem;
  const colors = planColors[planInfo.level] || planColors.silver;
  const progressPercent = (planInfo.daysRemaining / planInfo.totalDays) * 100;

  const isExpiringSoon = planInfo.daysRemaining <= 30;
  const isExpired = planInfo.daysRemaining <= 0;

  return (
    <div className={styles.planCard}>
      {/* هدر */}
      <div className={styles.planCardHeader}>
        <div
          className={styles.planIconWrapper}
          style={{ background: colors.bg }}
        >
          <Icon size={18} style={{ color: colors.color }} />
        </div>
        <div className={styles.planHeaderInfo}>
          <span className={styles.planLabel}>وضعیت دسترسی سامانه</span>
          <h3 className={styles.planName} style={{ color: colors.color }}>
            {planInfo.name}
          </h3>
        </div>
        <div className={styles.planBadge}>
          <Sparkles size={12} />
          فعال
        </div>
      </div>

      {/* اطلاعات تاریخ */}
      <div className={styles.planDates}>
        <div className={styles.planDateItem}>
          <Calendar size={14} />
          <div>
            <span className={styles.planDateLabel}>تاریخ شروع</span>
            <span className={styles.planDateValue}>{planInfo.startDate}</span>
          </div>
        </div>
        <div className={styles.planDateItem}>
          <Calendar size={14} />
          <div>
            <span className={styles.planDateLabel}>تاریخ انقضا</span>
            <span className={styles.planDateValue}>{planInfo.expirationDate}</span>
          </div>
        </div>
      </div>

      {/* نوار پیشرفت */}
      <div className={styles.planProgressSection}>
        <div className={styles.planProgressHeader}>
          <span>روزهای باقی‌مانده</span>
          <span
            className={
              isExpired
                ? styles.progressExpired
                : isExpiringSoon
                ? styles.progressWarning
                : styles.progressNormal
            }
          >
            {isExpired
              ? 'منقضی شده'
              : `${planInfo.daysRemaining} روز`}
          </span>
        </div>
        <div className={styles.planProgressBar}>
          <div
            className={`${styles.planProgressFill} ${
              isExpired
                ? styles.fillExpired
                : isExpiringSoon
                ? styles.fillWarning
                : styles.fillNormal
            }`}
            style={{ width: `${Math.min(progressPercent, 100)}%` }}
          />
        </div>
      </div>

      {/* کاربران */}
      <div className={styles.planUsersRow}>
        <Users size={14} />
        <span>
          <strong>{planInfo.currentUsers}</strong> از{' '}
          <strong>{planInfo.maxUsers}</strong> کاربر مجاز
        </span>
      </div>

      {/* امکانات پلن */}
      <div className={styles.planFeaturesSection}>
        <h4 className={styles.planFeaturesTitle}>امکانات پلن شما</h4>
        <div className={styles.planFeaturesList}>
          {(planInfo.features || []).map((feature, i) => (
            <div
              key={i}
              className={`${styles.planFeatureItem} ${
                !feature.active ? styles.planFeatureInactive : ''
              }`}
            >
              {feature.active ? (
                <Check size={14} className={styles.featureCheck} />
              ) : (
                <X size={14} className={styles.featureX} />
              )}
              <span>{feature.title}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}