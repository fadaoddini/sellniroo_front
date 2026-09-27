// modules/profile/components/JobCard.jsx
"use client";

import Link from "next/link";
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
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import moment from "moment-jalaali";

moment.loadPersian({ dialect: "persian-modern" });

const STATUS_MAP = {
  approved: { label: "تایید شده", class: "approved" },
  pending: { label: "در انتظار تایید", class: "pending" },
  rejected: { label: "رد شده", class: "rejected" },
  expired: { label: "منقضی شده", class: "expired" },
};

const JobCard = ({ job, onEdit, onDelete }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const status = STATUS_MAP[job.status] || STATUS_MAP.pending;

  // بستن منو با کلیک بیرون
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const createdDate = job.created_at
    ? moment(job.created_at).format("jYYYY/jMM/jDD")
    : "—";

  return (
    <div className={styles.card}>
      {/* بخش راست - تصویر */}
      <div className={styles.imageWrapper}>
        {job.image ? (
          <Image
            src={job.image}
            alt={job.title}
            width={120}
            height={120}
            className={styles.image}
          />
        ) : (
          <div className={styles.imagePlaceholder}>
            <Briefcase size={32} />
          </div>
        )}
        {job.is_featured && (
          <span className={styles.featuredBadge}>ویژه</span>
        )}
      </div>

      {/* بخش مرکزی - اطلاعات */}
      <div className={styles.content}>
        <div className={styles.topRow}>
          <div className={styles.titleWrapper}>
            <h3 className={styles.title}>{job.title}</h3>
            <span className={`${styles.statusBadge} ${styles[status.class]}`}>
              {status.label}
            </span>
          </div>

          {/* منوی عملیات */}
          <div className={styles.menuWrapper} ref={menuRef}>
            <button
              className={styles.menuBtn}
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="عملیات"
            >
              <MoreVertical size={18} />
            </button>

            {menuOpen && (
              <div className={styles.menu}>
                <Link
                  href={`/jobs/${job.slug}`}
                  className={styles.menuItem}
                  target="_blank"
                >
                  <ExternalLink size={14} />
                  <span>مشاهده</span>
                </Link>
                <button
                  className={styles.menuItem}
                  onClick={() => {
                    setMenuOpen(false);
                    onEdit();
                  }}
                >
                  <Edit size={14} />
                  <span>ویرایش</span>
                </button>
                <button
                  className={`${styles.menuItem} ${styles.deleteItem}`}
                  onClick={() => {
                    setMenuOpen(false);
                    onDelete();
                  }}
                >
                  <Trash2 size={14} />
                  <span>حذف</span>
                </button>
              </div>
            )}
          </div>
        </div>

        <p className={styles.description}>
          {job.description?.length > 150
            ? `${job.description.slice(0, 150)}...`
            : job.description}
        </p>

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

          <span className={styles.metaItem}>
            <Calendar size={13} />
            {createdDate}
          </span>
        </div>

        <div className={styles.stats}>
          <span className={styles.statItem}>
            <Eye size={13} />
            {job.views_count?.toLocaleString("fa-IR") || 0}
          </span>
          <span className={styles.statItem}>
            <Heart size={13} />
            {job.likes_count?.toLocaleString("fa-IR") || 0}
          </span>

          {(job.min_salary || job.max_salary) && (
            <span className={styles.salary}>
              {job.min_salary?.toLocaleString("fa-IR")}
              {job.max_salary && ` - ${job.max_salary.toLocaleString("fa-IR")}`}
              {" تومان"}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobCard;