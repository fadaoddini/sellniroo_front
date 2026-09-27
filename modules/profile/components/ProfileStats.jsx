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

const ProfileStats = ({ stats }) => {
  const { hiring, seeking, applications, bookmarks } = stats;

  const cards = [
    {
      title: "آگهی‌های استخدامی",
      value: hiring.total,
      icon: Briefcase,
      color: "primary",
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
      title: "آگهی‌های کاریابی",
      value: seeking.total,
      icon: User,
      color: "secondary",
      subItems: [
        { label: "تایید شده", value: seeking.approved, icon: CheckCircle },
        { label: "در انتظار", value: seeking.pending, icon: Clock },
        { label: "رد شده", value: seeking.rejected, icon: XCircle },
      ],
      extraStats: [{ label: "بازدید", value: seeking.views, icon: Eye }],
    },
    {
      title: "درخواست‌های ارسالی",
      value: applications.total,
      icon: Send,
      color: "green",
      subItems: [
        { label: "در انتظار", value: applications.pending, icon: Clock },
        { label: "بررسی شده", value: applications.reviewed, icon: TrendingUp },
        { label: "پذیرفته", value: applications.accepted, icon: CheckCircle },
      ],
    },
    {
      title: "ذخیره‌شده‌ها",
      value: bookmarks.total,
      icon: Bookmark,
      color: "orange",
      subItems: [],
    },
  ];

  return (
    <div className={styles.statsGrid}>
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className={`${styles.statCard} ${styles[card.color]}`}
          >
            <div className={styles.statHeader}>
              <div className={styles.statIconWrapper}>
                <Icon size={22} />
              </div>
              <div className={styles.statTitleWrapper}>
                <h3>{card.title}</h3>
                <span className={styles.statValue}>{card.value}</span>
              </div>
            </div>

            {card.subItems.length > 0 && (
              <div className={styles.subItems}>
                {card.subItems.map((s, i) => {
                  const SIcon = s.icon;
                  return (
                    <div key={i} className={styles.subItem}>
                      <SIcon size={13} />
                      <span className={styles.subLabel}>{s.label}</span>
                      <span className={styles.subValue}>{s.value}</span>
                    </div>
                  );
                })}
              </div>
            )}

            {card.extraStats && card.extraStats.length > 0 && (
              <div className={styles.extraStats}>
                {card.extraStats.map((e, i) => {
                  const EIcon = e.icon;
                  return (
                    <span key={i} className={styles.extraItem}>
                      <EIcon size={13} />
                      {e.value.toLocaleString("fa-IR")}
                    </span>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ProfileStats;