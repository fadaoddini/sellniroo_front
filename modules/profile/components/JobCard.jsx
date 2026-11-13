// modules/profile/components/JobCard.jsx
"use client";

import Image from "next/image";
import styles from "../styles/JobCard.module.css";
import {
  MapPin,
  Clock,
  Eye,
  Heart,
  Briefcase,
  Building2,
  MoreVertical,
  Edit,
  Trash2,
  ExternalLink,
  Calendar,
  Info,
  Wallet,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import moment from "moment-jalaali";
import { getJobHref } from "@/utils/jobSlug";

moment.loadPersian({ dialect: "persian-modern" });

const STATUS_MAP = {
  approved: { label: "تایید شده", class: "approved" },
  pending: { label: "در انتظار", class: "pending" },
  rejected: { label: "رد شده", class: "rejected" },
  expired: { label: "منقضی", class: "expired" },
};

const faNum = (n) => Number(n || 0).toLocaleString("fa-IR");

const formatSalary = (job) => {
  if (job.min_salary && job.max_salary) {
    return `${faNum(job.min_salary)} – ${faNum(job.max_salary)}`;
  }
  if (job.min_salary) return `از ${faNum(job.min_salary)}`;
  if (job.max_salary) return `تا ${faNum(job.max_salary)}`;
  return null;
};

const JobCard = ({ job, type, onEdit, onDelete, onDetails }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const isHiring = type === "hiring" || job?.type === "hiring";
  const status = STATUS_MAP[job.status] || STATUS_MAP.pending;
  const salary = !isHiring ? formatSalary(job) : null;
  const createdDate = job.created_at
    ? moment(job.created_at).format("jYYYY/jMM/jDD")
    : "—";
  const href = getJobHref(job) || "#";

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <article className={styles.card}>
      <div className={styles.media}>
        {job.image ? (
          <Image
            src={job.image}
            alt={job.title || ""}
            width={280}
            height={140}
            className={styles.image}
            unoptimized
          />
        ) : (
          <div className={styles.imagePlaceholder}>
            <Briefcase size={28} strokeWidth={1.7} />
          </div>
        )}

        <div className={styles.mediaTop}>
          <span className={`${styles.statusBadge} ${styles[status.class]}`}>
            {status.label}
          </span>
          {job.is_featured ? (
            <span className={styles.featuredBadge}>ویژه</span>
          ) : null}
        </div>

        <div className={styles.menuWrapper} ref={menuRef}>
          <button
            type="button"
            className={styles.menuBtn}
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="عملیات"
            aria-expanded={menuOpen}
          >
            <MoreVertical size={16} strokeWidth={2.2} />
          </button>
          {menuOpen ? (
            <div className={styles.menu}>
              <Link
                href={href}
                className={styles.menuItem}
                target="_blank"
                onClick={() => setMenuOpen(false)}
              >
                <ExternalLink size={14} />
                مشاهده عمومی
              </Link>
              <button
                type="button"
                className={styles.menuItem}
                onClick={() => {
                  setMenuOpen(false);
                  onEdit?.();
                }}
              >
                <Edit size={14} />
                ویرایش
              </button>
              <button
                type="button"
                className={`${styles.menuItem} ${styles.deleteItem}`}
                onClick={() => {
                  setMenuOpen(false);
                  onDelete?.();
                }}
              >
                <Trash2 size={14} />
                حذف
              </button>
            </div>
          ) : null}
        </div>
      </div>

      <div className={styles.content}>
        <h3 className={styles.title} title={job.title}>
          {job.title || "بدون عنوان"}
        </h3>

        <div className={styles.meta}>
          {job.city_name ? (
            <span className={styles.metaItem}>
              <MapPin size={12} strokeWidth={2.2} aria-hidden />
              {job.city_name}
            </span>
          ) : null}
          {job.cooperation_type_name ? (
            <span className={styles.metaItem}>
              <Clock size={12} strokeWidth={2.2} aria-hidden />
              {job.cooperation_type_name}
            </span>
          ) : null}
          {!isHiring && job.company_name ? (
            <span className={styles.metaItem}>
              <Building2 size={12} strokeWidth={2.2} aria-hidden />
              {job.company_name}
            </span>
          ) : null}
          <span className={styles.metaItem}>
            <Calendar size={12} strokeWidth={2.2} aria-hidden />
            {createdDate}
          </span>
        </div>

        {!isHiring && salary ? (
          <div className={styles.salary}>
            <Wallet size={13} strokeWidth={2.2} aria-hidden />
            <span>{salary}</span>
            <em>تومان</em>
          </div>
        ) : null}

        <div className={styles.stats}>
          <span className={styles.statItem}>
            <Eye size={12} strokeWidth={2.2} aria-hidden />
            {faNum(job.views_count)}
          </span>
          <span className={styles.statItem}>
            <Heart size={12} strokeWidth={2.2} aria-hidden />
            {faNum(job.likes_count)}
          </span>
        </div>

        <button
          type="button"
          className={styles.detailsBtn}
          onClick={() => onDetails?.(job)}
        >
          <Info size={14} strokeWidth={2.2} />
          جزئیات
        </button>
      </div>
    </article>
  );
};

export default JobCard;
