// modules/profile/components/JobDetailDialog.jsx
"use client";

import { useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "../styles/JobDetailDialog.module.css";
import { getJobHref } from "@/utils/jobSlug";
import {
  X,
  MapPin,
  Clock,
  Eye,
  Heart,
  Briefcase,
  Building2,
  Calendar,
  ExternalLink,
  Edit3,
  Trash2,
  Wallet,
  GraduationCap,
  Users,
  Tag,
  FileText,
  Star,
} from "lucide-react";
import moment from "moment-jalaali";

moment.loadPersian({ dialect: "persian-modern" });

const STATUS_MAP = {
  approved: { label: "تایید شده", className: "approved" },
  pending: { label: "در انتظار تایید", className: "pending" },
  rejected: { label: "رد شده", className: "rejected" },
  expired: { label: "منقضی شده", className: "expired" },
};

const faNum = (n) =>
  n == null || n === "" ? "—" : Number(n).toLocaleString("fa-IR");

const formatSalary = (job) => {
  if (job.min_salary && job.max_salary) {
    return `${faNum(job.min_salary)} تا ${faNum(job.max_salary)} تومان`;
  }
  if (job.min_salary) return `از ${faNum(job.min_salary)} تومان`;
  if (job.max_salary) return `تا ${faNum(job.max_salary)} تومان`;
  return null;
};

export default function JobDetailDialog({ job, onClose, onEdit, onDelete }) {
  const status = STATUS_MAP[job?.status] || STATUS_MAP.pending;
  const salary = job ? formatSalary(job) : null;
  const createdDate = job?.created_at
    ? moment(job.created_at).format("jYYYY/jMM/jDD")
    : "—";
  const updatedDate = job?.updated_at
    ? moment(job.updated_at).format("jYYYY/jMM/jDD")
    : null;
  const expireDate = job?.expire_date || job?.expires_at
    ? moment(job.expire_date || job.expires_at).format("jYYYY/jMM/jDD")
    : null;

  const onKeyDown = useCallback(
    (e) => {
      if (e.key === "Escape") onClose?.();
    },
    [onClose]
  );

  useEffect(() => {
    document.addEventListener("keydown", onKeyDown);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prev;
    };
  }, [onKeyDown]);

  if (!job) return null;

  const facts = [
    job.city_name && { icon: MapPin, label: "شهر", value: job.city_name },
    job.cooperation_type_name && {
      icon: Clock,
      label: "نوع همکاری",
      value: job.cooperation_type_name,
    },
    job.category_name && {
      icon: Tag,
      label: "دسته‌بندی",
      value: job.category_name,
    },
    job.company_name && {
      icon: Building2,
      label: "شرکت",
      value: job.company_name,
    },
    job.education_level_name && {
      icon: GraduationCap,
      label: "تحصیلات",
      value: job.education_level_name,
    },
    job.gender_name && {
      icon: Users,
      label: "جنسیت",
      value: job.gender_name,
    },
    job.military_status_name && {
      icon: Briefcase,
      label: "وضعیت نظام وظیفه",
      value: job.military_status_name,
    },
    salary && { icon: Wallet, label: "حقوق", value: salary },
    { icon: Calendar, label: "تاریخ ثبت", value: createdDate },
    updatedDate && { icon: Calendar, label: "آخرین ویرایش", value: updatedDate },
    expireDate && { icon: Calendar, label: "انقضا", value: expireDate },
  ].filter(Boolean);

  const href = job ? getJobHref(job) : null;

  return (
    <div
      className={styles.overlay}
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="job-detail-title"
      >
        <div className={styles.topAccent} aria-hidden />

        <header className={styles.header}>
          <div className={styles.headerMain}>
            <div className={styles.thumb}>
              {job.image ? (
                <Image
                  src={job.image}
                  alt=""
                  width={72}
                  height={72}
                  className={styles.thumbImg}
                  unoptimized
                />
              ) : (
                <span className={styles.thumbFallback}>
                  <Briefcase size={26} strokeWidth={1.8} />
                </span>
              )}
            </div>
            <div className={styles.headerText}>
              <div className={styles.badges}>
                <span
                  className={`${styles.status} ${styles[status.className]}`}
                >
                  {status.label}
                </span>
                {job.is_featured ? (
                  <span className={styles.featured}>
                    <Star size={11} strokeWidth={2.4} />
                    ویژه
                  </span>
                ) : null}
                <span className={styles.typeChip}>
                  {job.type === "seeking" ? "کاریابی" : "استخدامی"}
                </span>
              </div>
              <h2 id="job-detail-title" className={styles.title}>
                {job.title || "بدون عنوان"}
              </h2>
            </div>
          </div>

          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="بستن"
          >
            <X size={18} strokeWidth={2.2} />
          </button>
        </header>

        <div className={styles.metrics}>
          <div className={styles.metric}>
            <Eye size={14} strokeWidth={2.2} aria-hidden />
            <span>بازدید</span>
            <strong>{faNum(job.views_count || 0)}</strong>
          </div>
          <div className={styles.metric}>
            <Heart size={14} strokeWidth={2.2} aria-hidden />
            <span>علاقه</span>
            <strong>{faNum(job.likes_count || 0)}</strong>
          </div>
          {job.applications_count != null ? (
            <div className={styles.metric}>
              <FileText size={14} strokeWidth={2.2} aria-hidden />
              <span>درخواست</span>
              <strong>{faNum(job.applications_count)}</strong>
            </div>
          ) : null}
        </div>

        <div className={styles.body}>
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>اطلاعات اصلی</h3>
            <div className={styles.facts}>
              {facts.map((f) => {
                const Icon = f.icon;
                return (
                  <div key={f.label} className={styles.fact}>
                    <span className={styles.factIcon}>
                      <Icon size={14} strokeWidth={2.2} aria-hidden />
                    </span>
                    <div className={styles.factText}>
                      <span>{f.label}</span>
                      <strong>{f.value}</strong>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {job.description ? (
            <section className={styles.section}>
              <h3 className={styles.sectionTitle}>توضیحات</h3>
              <p className={styles.description}>{job.description}</p>
            </section>
          ) : null}

          {job.requirements || job.skills || job.benefits ? (
            <section className={styles.section}>
              <h3 className={styles.sectionTitle}>جزئیات بیشتر</h3>
              {job.requirements ? (
                <div className={styles.block}>
                  <h4>شرایط و الزامات</h4>
                  <p>{job.requirements}</p>
                </div>
              ) : null}
              {job.skills ? (
                <div className={styles.block}>
                  <h4>مهارت‌ها</h4>
                  <p>{job.skills}</p>
                </div>
              ) : null}
              {job.benefits ? (
                <div className={styles.block}>
                  <h4>مزایا</h4>
                  <p>{job.benefits}</p>
                </div>
              ) : null}
            </section>
          ) : null}

          {job.status === "rejected" && job.reject_reason ? (
            <section className={`${styles.section} ${styles.rejectBox}`}>
              <h3 className={styles.sectionTitle}>دلیل رد</h3>
              <p>{job.reject_reason}</p>
            </section>
          ) : null}
        </div>

        <footer className={styles.footer}>
          {href ? (
            <Link href={href} className={styles.secondaryBtn} target="_blank">
              <ExternalLink size={14} strokeWidth={2.2} />
              مشاهده عمومی
            </Link>
          ) : null}
          <button
            type="button"
            className={styles.secondaryBtn}
            onClick={() => {
              onClose?.();
              onEdit?.(job);
            }}
          >
            <Edit3 size={14} strokeWidth={2.2} />
            ویرایش
          </button>
          <button
            type="button"
            className={styles.dangerBtn}
            onClick={() => {
              onClose?.();
              onDelete?.(job);
            }}
          >
            <Trash2 size={14} strokeWidth={2.2} />
            حذف
          </button>
        </footer>
      </div>
    </div>
  );
}
