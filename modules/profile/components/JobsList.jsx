// modules/profile/components/JobsList.jsx
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import Config from "@/config/config";
import { useAuth } from "@/contexts/AuthContext";
import JobCard from "./JobCard";
import EmptyState from "./EmptyState";
import ConfirmDeleteModal from "./ConfirmDeleteModal";
import EditJobModal from "./EditJobModal";
import styles from "../styles/JobsList.module.css";
import {
  Loader2,
  Briefcase,
  Search,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

const STATUS_FILTERS = [
  { key: "all", label: "همه" },
  { key: "approved", label: "تایید شده" },
  { key: "pending", label: "در انتظار تایید" },
  { key: "rejected", label: "رد شده" },
  { key: "expired", label: "منقضی شده" },
];

const JobsList = ({ type, onRefresh }) => {
  const { getAuthHeaders } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [editTarget, setEditTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const url = Config.endpoints.jobisell.jobs.myListings();
      const res = await axios.get(url, { headers: getAuthHeaders() });
      const data = res.data?.results || res.data || [];
      const list = Array.isArray(data) ? data : [];
      setJobs(list.filter((j) => j.type === type));
    } catch {
      setError("خطا در دریافت آگهی‌ها. لطفاً دوباره تلاش کنید.");
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders, type]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      const url = Config.endpoints.jobisell.jobs.delete(deleteTarget.id);
      await axios.delete(url, { headers: getAuthHeaders() });
      setJobs((prev) => prev.filter((j) => j.id !== deleteTarget.id));
      setDeleteTarget(null);
      onRefresh?.();
    } catch {
      setError("حذف آگهی ناموفق بود.");
    } finally {
      setDeleting(false);
    }
  };

  const displayedJobs = useMemo(() => {
    const q = search.trim().toLowerCase();
    return jobs.filter((j) => {
      if (statusFilter !== "all" && j.status !== statusFilter) return false;
      if (!q) return true;
      return (
        j.title?.toLowerCase().includes(q) ||
        j.description?.toLowerCase().includes(q)
      );
    });
  }, [jobs, search, statusFilter]);

  if (loading) {
    return (
      <div className={styles.loading} role="status">
        <Loader2 className={styles.spinner} size={32} />
        <p>در حال بارگذاری آگهی‌ها...</p>
      </div>
    );
  }

  if (error && jobs.length === 0) {
    return (
      <div className={styles.errorBox}>
        <AlertCircle size={28} />
        <p>{error}</p>
        <button type="button" onClick={fetchJobs} className={styles.retryBtn}>
          <RefreshCw size={14} />
          تلاش دوباره
        </button>
      </div>
    );
  }

  return (
    <div className={styles.jobsList}>
      <div className={styles.toolbar}>
        <div className={styles.searchBox}>
          <Search size={16} aria-hidden />
          <input
            type="search"
            placeholder="جستجو در آگهی‌ها..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="جستجو در آگهی‌ها"
          />
        </div>

        <div className={styles.statusFilters} role="group" aria-label="فیلتر وضعیت">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s.key}
              type="button"
              className={`${styles.statusBtn} ${
                statusFilter === s.key ? styles.activeStatus : ""
              }`}
              onClick={() => setStatusFilter(s.key)}
              aria-pressed={statusFilter === s.key}
            >
              {s.label}
            </button>
          ))}
        </div>

        <button type="button" className={styles.refreshBtn} onClick={fetchJobs}>
          <RefreshCw size={14} />
          بروزرسانی
        </button>
      </div>

      {error && jobs.length > 0 && (
        <div className={styles.errorBox} style={{ padding: "0.75rem 1rem" }}>
          <AlertCircle size={18} />
          <p style={{ margin: 0 }}>{error}</p>
        </div>
      )}

      {displayedJobs.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title={
            type === "hiring"
              ? "هنوز آگهی استخدامی ثبت نکرده‌اید"
              : "هنوز آگهی کاریابی ثبت نکرده‌اید"
          }
          description="با ثبت اولین آگهی، فرصت‌های شغلی خود را به هزاران کاربر نمایش دهید."
          actionLabel="ثبت آگهی جدید"
          actionHref={
            type === "hiring"
              ? "/jobs/create?type=hiring"
              : "/jobs/create?type=seeking"
          }
        />
      ) : (
        <div className={styles.list}>
          {displayedJobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              onEdit={() => setEditTarget(job)}
              onDelete={() => setDeleteTarget(job)}
            />
          ))}
        </div>
      )}

      {deleteTarget && (
        <ConfirmDeleteModal
          title="حذف آگهی"
          message={`آیا از حذف آگهی «${deleteTarget.title}» مطمئن هستید؟ این عملیات قابل بازگشت نیست.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}

      {editTarget && (
        <EditJobModal
          job={editTarget}
          onClose={() => setEditTarget(null)}
          onSaved={() => {
            setEditTarget(null);
            fetchJobs();
            onRefresh?.();
          }}
        />
      )}
    </div>
  );
};

export default JobsList;
