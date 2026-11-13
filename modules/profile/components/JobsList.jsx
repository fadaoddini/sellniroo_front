// modules/profile/components/JobsList.jsx
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import Config from "@/config/config";
import { useAuth } from "@/contexts/AuthContext";
import JobCard from "./JobCard";
import JobDetailDialog from "./JobDetailDialog";
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
  ChevronRight,
  ChevronLeft,
} from "lucide-react";

const STATUS_FILTERS = [
  { key: "all", label: "همه" },
  { key: "approved", label: "تایید شده" },
  { key: "pending", label: "در انتظار تایید" },
  { key: "rejected", label: "رد شده" },
  { key: "expired", label: "منقضی شده" },
];

const PAGE_SIZE = 12;

const faNum = (n) => Number(n || 0).toLocaleString("fa-IR");

const JobsList = ({ type, onRefresh }) => {
  const { getAuthHeaders } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [editTarget, setEditTarget] = useState(null);
  const [detailTarget, setDetailTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const requestId = useRef(0);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    setPage(1);
    setSearchInput("");
    setSearch("");
    setStatusFilter("all");
  }, [type]);

  const fetchJobs = useCallback(async () => {
    const id = ++requestId.current;
    try {
      setLoading(true);
      setError(null);
      const url = Config.endpoints.jobisell.jobs.myListings();
      const res = await axios.get(url, {
        headers: getAuthHeaders(),
        params: {
          page,
          page_size: PAGE_SIZE,
          type,
          status: statusFilter !== "all" ? statusFilter : undefined,
          search: search || undefined,
        },
      });
      if (id !== requestId.current) return;

      const data = res.data;
      const list = Array.isArray(data?.results)
        ? data.results
        : Array.isArray(data)
          ? data
          : [];
      setJobs(list);
      setTotalCount(
        typeof data?.count === "number" ? data.count : list.length
      );
    } catch {
      if (id !== requestId.current) return;
      setError("خطا در دریافت آگهی‌ها. لطفاً دوباره تلاش کنید.");
      setJobs([]);
      setTotalCount(0);
    } finally {
      if (id === requestId.current) setLoading(false);
    }
  }, [getAuthHeaders, type, page, statusFilter, search]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      const url = Config.endpoints.jobisell.jobs.delete(deleteTarget.id);
      await axios.delete(url, { headers: getAuthHeaders() });
      setDeleteTarget(null);
      const nextCount = Math.max(0, totalCount - 1);
      const nextPages = Math.max(1, Math.ceil(nextCount / PAGE_SIZE));
      if (page > nextPages) setPage(nextPages);
      else await fetchJobs();
      onRefresh?.();
    } catch {
      setError("حذف آگهی ناموفق بود.");
    } finally {
      setDeleting(false);
    }
  };

  const goToPage = (p) => {
    const next = Math.min(totalPages, Math.max(1, p));
    if (next !== page) setPage(next);
  };

  const emptyTitle =
    type === "hiring"
      ? "هنوز آگهی استخدامی ثبت نکرده‌اید"
      : "هنوز آگهی کاریابی ثبت نکرده‌اید";

  const hasFilters = Boolean(search) || statusFilter !== "all";

  return (
    <div className={styles.jobsList}>
      <div className={styles.toolbar}>
        <div className={styles.searchBox}>
          <Search size={16} aria-hidden />
          <input
            type="search"
            placeholder="جستجو در آگهی‌ها..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            aria-label="جستجو در آگهی‌ها"
          />
        </div>

        <div
          className={styles.statusFilters}
          role="group"
          aria-label="فیلتر وضعیت"
        >
          {STATUS_FILTERS.map((s) => (
            <button
              key={s.key}
              type="button"
              className={`${styles.statusBtn} ${
                statusFilter === s.key ? styles.activeStatus : ""
              }`}
              onClick={() => {
                setStatusFilter(s.key);
                setPage(1);
              }}
              aria-pressed={statusFilter === s.key}
            >
              {s.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          className={styles.refreshBtn}
          onClick={fetchJobs}
          disabled={loading}
        >
          <RefreshCw size={14} className={loading ? styles.spinIcon : undefined} />
          بروزرسانی
        </button>
      </div>

      {error && jobs.length === 0 && !loading ? (
        <div className={styles.errorBox}>
          <AlertCircle size={28} />
          <p>{error}</p>
          <button type="button" onClick={fetchJobs} className={styles.retryBtn}>
            <RefreshCw size={14} />
            تلاش دوباره
          </button>
        </div>
      ) : null}

      {error && jobs.length > 0 ? (
        <div className={styles.errorBox} style={{ padding: "0.75rem 1rem" }}>
          <AlertCircle size={18} />
          <p style={{ margin: 0 }}>{error}</p>
        </div>
      ) : null}

      {loading && jobs.length === 0 ? (
        <div className={styles.loading} role="status">
          <Loader2 className={styles.spinner} size={32} />
          <p>در حال بارگذاری آگهی‌ها...</p>
        </div>
      ) : null}

      {!loading && jobs.length === 0 && !error ? (
        <EmptyState
          icon={Briefcase}
          title={
            hasFilters
              ? "آگهی‌ای با این فیلتر پیدا نشد"
              : emptyTitle
          }
          description={
            hasFilters
              ? "فیلتر یا عبارت جستجو را تغییر دهید."
              : "با ثبت اولین آگهی، فرصت‌های شغلی خود را به هزاران کاربر نمایش دهید."
          }
          actionLabel={hasFilters ? undefined : "ثبت آگهی جدید"}
          actionHref={
            hasFilters
              ? undefined
              : type === "hiring"
                ? "/jobs/create?type=hiring"
                : "/jobs/create?type=seeking"
          }
        />
      ) : null}

      {jobs.length > 0 ? (
        <>
          <div
            className={`${styles.list} ${styles.listGrid} ${
              loading ? styles.listLoading : ""
            }`}
            aria-busy={loading}
          >
            {jobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                type={type}
                onEdit={() => setEditTarget(job)}
                onDelete={() => setDeleteTarget(job)}
                onDetails={() => setDetailTarget(job)}
              />
            ))}
          </div>

          <div className={styles.pager}>
            <p className={styles.pagerMeta}>
              {faNum(totalCount)} آگهی · صفحه {faNum(page)} از {faNum(totalPages)}
            </p>
            {totalPages > 1 ? (
              <div className={styles.pagerControls} role="navigation" aria-label="صفحه‌بندی">
                <button
                  type="button"
                  className={styles.pageBtn}
                  onClick={() => goToPage(page - 1)}
                  disabled={page <= 1 || loading}
                  aria-label="صفحه قبل"
                >
                  <ChevronRight size={16} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => {
                    if (totalPages <= 7) return true;
                    if (p === 1 || p === totalPages) return true;
                    return Math.abs(p - page) <= 1;
                  })
                  .reduce((acc, p, idx, arr) => {
                    if (idx > 0 && p - arr[idx - 1] > 1) acc.push("…");
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((item, idx) =>
                    item === "…" ? (
                      <span key={`dots-${idx}`} className={styles.pageDots}>
                        …
                      </span>
                    ) : (
                      <button
                        key={item}
                        type="button"
                        className={`${styles.pageBtn} ${
                          item === page ? styles.pageBtnActive : ""
                        }`}
                        onClick={() => goToPage(item)}
                        disabled={loading}
                        aria-current={item === page ? "page" : undefined}
                      >
                        {faNum(item)}
                      </button>
                    )
                  )}
                <button
                  type="button"
                  className={styles.pageBtn}
                  onClick={() => goToPage(page + 1)}
                  disabled={page >= totalPages || loading}
                  aria-label="صفحه بعد"
                >
                  <ChevronLeft size={16} />
                </button>
              </div>
            ) : null}
          </div>
        </>
      ) : null}

      {detailTarget ? (
        <JobDetailDialog
          job={detailTarget}
          onClose={() => setDetailTarget(null)}
          onEdit={(job) => setEditTarget(job)}
          onDelete={(job) => setDeleteTarget(job)}
        />
      ) : null}

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
