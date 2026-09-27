// modules/profile/components/JobsList.jsx
"use client";

import { useState, useEffect } from "react";
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

  // ✅ مودال‌ها
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [editTarget, setEditTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError(null);

      const url = Config.endpoints.jobisell.jobs.myListings();
      const res = await axios.get(url, { headers: getAuthHeaders() });

      const data = res.data?.results || res.data || [];
      // فیلتر بر اساس نوع
      const filtered = data.filter((j) => j.type === type);
      setJobs(filtered);
    } catch (err) {
      console.error("Error fetching jobs:", err);
      setError("خطا در دریافت آگهی‌ها. لطفاً دوباره تلاش کنید.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [type]);

  // ✅ حذف آگهی
  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      const url = Config.endpoints.jobisell.jobs.delete(deleteTarget.id);
      await axios.delete(url, { headers: getAuthHeaders() });
      setJobs((prev) => prev.filter((j) => j.id !== deleteTarget.id));
      setDeleteTarget(null);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error("Error deleting job:", err);
    } finally {
      setDeleting(false);
    }
  };

  // ✅ فیلتر نهایی
  const displayedJobs = jobs.filter((j) => {
    if (statusFilter !== "all" && j.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      if (
        !j.title?.toLowerCase().includes(q) &&
        !j.description?.toLowerCase().includes(q)
      )
        return false;
    }
    return true;
  });

  if (loading) {
    return (
      <div className={styles.loading}>
        <Loader2 className={styles.spinner} size={32} />
        <p>در حال بارگذاری آگهی‌ها...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorBox}>
        <AlertCircle size={28} />
        <p>{error}</p>
        <button onClick={fetchJobs} className={styles.retryBtn}>
          <RefreshCw size={14} />
          تلاش دوباره
        </button>
      </div>
    );
  }

  return (
    <div className={styles.jobsList}>
      {/* نوار ابزار */}
      <div className={styles.toolbar}>
        <div className={styles.searchBox}>
          <Search size={16} />
          <input
            type="text"
            placeholder="جستجو در آگهی‌ها..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className={styles.statusFilters}>
          {STATUS_FILTERS.map((s) => (
            <button
              key={s.key}
              className={`${styles.statusBtn} ${
                statusFilter === s.key ? styles.activeStatus : ""
              }`}
              onClick={() => setStatusFilter(s.key)}
            >
              {s.label}
            </button>
          ))}
        </div>

        <button className={styles.refreshBtn} onClick={fetchJobs}>
          <RefreshCw size={14} />
          بروزرسانی
        </button>
      </div>

      {/* لیست */}
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
            type === "hiring" ? "/jobs/create?type=hiring" : "/jobs/create?type=seeking"
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

      {/* مودال تایید حذف */}
      {deleteTarget && (
        <ConfirmDeleteModal
          title="حذف آگهی"
          message={`آیا از حذف آگهی "${deleteTarget.title}" مطمئن هستید؟ این عملیات قابل بازگشت نیست.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}

      {/* مودال ویرایش */}
      {editTarget && (
        <EditJobModal
          job={editTarget}
          onClose={() => setEditTarget(null)}
          onSaved={() => {
            setEditTarget(null);
            fetchJobs();
            if (onRefresh) onRefresh();
          }}
        />
      )}
    </div>
  );
};

export default JobsList;