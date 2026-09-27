// modules/profile/components/ApplicationsList.jsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import axios from "axios";
import Config from "@/config/config";
import { useAuth } from "@/contexts/AuthContext";
import EmptyState from "./EmptyState";
import styles from "../styles/ApplicationsList.module.css";
import {
  Loader2,
  Send,
  Building2,
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
  TrendingUp,
  ExternalLink,
  AlertCircle,
} from "lucide-react";
import moment from "moment-jalaali";

moment.loadPersian({ dialect: "persian-modern" });

const STATUS_MAP = {
  pending: { label: "در انتظار بررسی", icon: Clock, class: "pending" },
  reviewed: { label: "بررسی شده", icon: TrendingUp, class: "reviewed" },
  accepted: { label: "پذیرفته شده", icon: CheckCircle, class: "accepted" },
  rejected: { label: "رد شده", icon: XCircle, class: "rejected" },
};

const ApplicationsList = () => {
  const { getAuthHeaders } = useAuth();
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchApps = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get(
        Config.endpoints.jobisell.jobs.myApplications(),
        { headers: getAuthHeaders() }
      );
      setApps(res.data?.results || res.data || []);
    } catch (err) {
      console.error(err);
      setError("خطا در دریافت درخواست‌ها");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApps();
  }, []);

  if (loading) {
    return (
      <div className={styles.loading}>
        <Loader2 className={styles.spinner} size={32} />
        <p>در حال بارگذاری...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorBox}>
        <AlertCircle size={28} />
        <p>{error}</p>
      </div>
    );
  }

  if (apps.length === 0) {
    return (
      <EmptyState
        icon={Send}
        title="هنوز درخواستی ارسال نکرده‌اید"
        description="با ارسال درخواست برای آگهی‌های استخدامی، شانس خود را برای پیدا کردن شغل مناسب افزایش دهید."
        actionLabel="مشاهده آگهی‌های استخدامی"
        actionHref="/jobs"
      />
    );
  }

  return (
    <div className={styles.list}>
      {apps.map((app) => {
        const status = STATUS_MAP[app.status] || STATUS_MAP.pending;
        const StatusIcon = status.icon;
        const date = app.created_at
          ? moment(app.created_at).format("jYYYY/jMM/jDD")
          : "—";

        return (
          <div key={app.id} className={styles.card}>
            <div className={styles.cardHeader}>
              <h3 className={styles.jobTitle}>{app.job_title}</h3>
              <span className={`${styles.statusBadge} ${styles[status.class]}`}>
                <StatusIcon size={13} />
                {status.label}
              </span>
            </div>

            <div className={styles.cardMeta}>
              <span className={styles.metaItem}>
                <Calendar size={13} />
                {date}
              </span>

              {app.phone && (
                <span className={styles.metaItem} dir="ltr">
                  {app.phone}
                </span>
              )}

              {app.email && (
                <span className={styles.metaItem} dir="ltr">
                  {app.email}
                </span>
              )}
            </div>

            {app.cover_letter && (
              <p className={styles.coverLetter}>{app.cover_letter}</p>
            )}

            <div className={styles.cardActions}>
              <Link
                href={`/jobs/${app.job_listing}`}
                className={styles.viewBtn}
                target="_blank"
              >
                <ExternalLink size={14} />
                مشاهده آگهی
              </Link>

              {app.resume && (
                <a
                  href={app.resume}
                  className={styles.resumeBtn}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  دانلود رزومه
                </a>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ApplicationsList;