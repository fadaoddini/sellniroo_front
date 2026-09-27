// modules/profile/components/BookmarksList.jsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import axios from "axios";
import Config from "@/config/config";
import { useAuth } from "@/contexts/AuthContext";
import EmptyState from "./EmptyState";
import styles from "../styles/BookmarksList.module.css";
import {
  Loader2,
  Bookmark,
  MapPin,
  Clock,
  Building2,
  Eye,
  Heart,
  ExternalLink,
  Trash2,
  AlertCircle,
} from "lucide-react";
import moment from "moment-jalaali";

moment.loadPersian({ dialect: "persian-modern" });

const BookmarksList = () => {
  const { getAuthHeaders } = useAuth();
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBookmarks = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get(
        Config.endpoints.jobisell.jobs.myBookmarks(),
        { headers: getAuthHeaders() }
      );
      setBookmarks(res.data?.results || res.data || []);
    } catch (err) {
      console.error(err);
      setError("خطا در دریافت ذخیره‌شده‌ها");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookmarks();
  }, []);

  // ✅ حذف از ذخیره‌شده‌ها
  const handleRemove = async (jobId) => {
    try {
      await axios.post(
        Config.endpoints.jobisell.jobs.bookmark(jobId),
        {},
        { headers: getAuthHeaders() }
      );
      setBookmarks((prev) =>
        prev.filter((b) => b.job?.id !== jobId && b.job_listing !== jobId)
      );
    } catch (err) {
      console.error(err);
    }
  };

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

  if (bookmarks.length === 0) {
    return (
      <EmptyState
        icon={Bookmark}
        title="هیچ آگهی ذخیره‌شده‌ای ندارید"
        description="آگهی‌های موردعلاقه خود را ذخیره کنید تا بعداً راحت‌تر پیدایشان کنید."
        actionLabel="مشاهده آگهی‌ها"
        actionHref="/jobs"
      />
    );
  }

  return (
    <div className={styles.list}>
      {bookmarks.map((bm) => {
        const job = bm.job || bm;
        const date = bm.created_at
          ? moment(bm.created_at).format("jYYYY/jMM/jDD")
          : "—";

        return (
          <div key={bm.id} className={styles.card}>
            <div className={styles.imageWrapper}>
              {job.company_logo ? (
                <Image
                  src={job.company_logo}
                  alt={job.company_name || ""}
                  width={70}
                  height={70}
                  className={styles.logo}
                />
              ) : (
                <div className={styles.logoPlaceholder}>
                  <Building2 size={24} />
                </div>
              )}
            </div>

            <div className={styles.content}>
              <Link href={`/jobs/${job.slug}`} className={styles.titleLink}>
                <h3>{job.title}</h3>
              </Link>

              <div className={styles.meta}>
                {job.city_name && (
                  <span className={styles.metaItem}>
                    <MapPin size={13} />
                    {job.city_name}
                  </span>
                )}
                {job.cooperation_type_name && (
                  <span className={styles.metaItem}>
                    <Clock size={13} />
                    {job.cooperation_type_name}
                  </span>
                )}
                {job.company_name && (
                  <span className={styles.metaItem}>
                    <Building2 size={13} />
                    {job.company_name}
                  </span>
                )}
              </div>

              <div className={styles.stats}>
                <span>
                  <Eye size={13} />
                  {job.views_count || 0}
                </span>
                <span>
                  <Heart size={13} />
                  {job.likes_count || 0}
                </span>
                <span className={styles.date}>ذخیره: {date}</span>
              </div>
            </div>

            <div className={styles.actions}>
              <Link
                href={`/jobs/${job.slug}`}
                className={styles.viewBtn}
                target="_blank"
              >
                <ExternalLink size={14} />
              </Link>
              <button
                className={styles.removeBtn}
                onClick={() => handleRemove(job.id)}
                aria-label="حذف"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default BookmarksList;