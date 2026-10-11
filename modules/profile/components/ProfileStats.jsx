// modules/profile/components/ProfileStats.jsx
"use client";

import styles from "../styles/ProfileStats.module.css";
import {
  Briefcase,
  User,
  Send,
  Bookmark,
  CheckCircle,
  Clock,
  XCircle,
  Eye,
  Heart,
  TrendingUp,
} from "lucide-react";

const faNum = (n) => Number(n || 0).toLocaleString("fa-IR");

const ProfileStats = ({ stats, loading = false, activeTab, onSelectTab }) => {
  const hiring = stats?.hiring || {};
  const seeking = stats?.seeking || {};
  const applications = stats?.applications || {};
  const bookmarks = stats?.bookmarks || {};

  const cards = [
    {
      key: "hiring",
      title: "آگهی‌های استخدامی",
      value: hiring.total,
      icon: Briefcase,
      tone: "gold",
      subItems: [
        { label: "تایید شده", value: hiring.approved, icon: CheckCircle },
        { label: "در انتظار", value: hiring.pending, icon: Clock },
        { label: "رد شده", value: hiring.rejected, icon: XCircle },
      ],
      extraStats: [
        { label: "بازدید", value: hiring.views, icon: Eye },
        { label: "لایک", value: hiring.likes, icon: Heart },
      ],
    },
    {
      key: "seeking",
      title: "آگهی‌های کاریابی",
      value: seeking.total,
      icon: User,
      tone: "amber",
      subItems: [
        { label: "تایید شده", value: seeking.approved, icon: CheckCircle },
        { label: "در انتظار", value: seeking.pending, icon: Clock },
        { label: "رد شده", value: seeking.rejected, icon: XCircle },
      ],
      extraStats: [{ label: "بازدید", value: seeking.views, icon: Eye }],
    },
    {
      key: "applications",
      title: "درخواست‌های ارسالی",
      value: applications.total,
      icon: Send,
      tone: "green",
      subItems: [
        { label: "در انتظار", value: applications.pending, icon: Clock },
        { label: "بررسی شده", value: applications.reviewed, icon: TrendingUp },
        { label: "پذیرفته", value: applications.accepted, icon: CheckCircle },
      ],
    },
    {
      key: "bookmarks",
      title: "ذخیره‌شده‌ها",
      value: bookmarks.total,
      icon: Bookmark,
      tone: "warm",
      subItems: [],
    },
  ];

  if (loading && !stats) {
    return (
      <div className={styles.statsGrid} aria-busy="true">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className={`${styles.statCard} ${styles.skeleton}`} />
        ))}
      </div>
    );
  }

  return (
    <div className={styles.statsGrid}>
      {cards.map((card) => {
        const Icon = card.icon;
        const isActive = activeTab === card.key;
        return (
          <button
            key={card.key}
            type="button"
            className={`${styles.statCard} ${styles[card.tone]} ${isActive ? styles.cardActive : ""}`}
            onClick={() => onSelectTab?.(card.key)}
            aria-pressed={isActive}
          >
            <div className={styles.statHeader}>
              <div className={styles.statIconWrapper}>
                <Icon size={20} aria-hidden />
              </div>
              <div className={styles.statTitleWrapper}>
                <h3>{card.title}</h3>
                <span className={styles.statValue}>{faNum(card.value)}</span>
              </div>
            </div>

            {card.subItems.length > 0 && (
              <div className={styles.subItems}>
                {card.subItems.map((s) => {
                  const SIcon = s.icon;
                  return (
                    <div key={s.label} className={styles.subItem}>
                      <SIcon size={13} aria-hidden />
                      <span className={styles.subLabel}>{s.label}</span>
                      <span className={styles.subValue}>{faNum(s.value)}</span>
                    </div>
                  );
                })}
              </div>
            )}

            {card.extraStats?.length > 0 && (
              <div className={styles.extraStats}>
                {card.extraStats.map((e) => {
                  const EIcon = e.icon;
                  return (
                    <span key={e.label} className={styles.extraItem} title={e.label}>
                      <EIcon size={13} aria-hidden />
                      {faNum(e.value)}
                    </span>
                  );
                })}
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default ProfileStats;
