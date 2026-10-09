// modules/profile/components/company/CompanyView.jsx
"use client";

import { getFullImageUrl } from "@/utils/imageUrl";
import styles from "../../styles/company/CompanyView.module.css";
import {
  Building2,
  Mail,
  Phone,
  Globe,
  MapPin,
  Edit,
  CheckCircle,
  XCircle,
  Clock,
  ShieldAlert,
} from "lucide-react";

const STATUS_MAP = {
  verified: {
    label: "تایید شده",
    icon: CheckCircle,
    className: "verified",
  },
  pending: {
    label: "در انتظار بررسی",
    icon: Clock,
    className: "pending",
  },
  rejected: {
    label: "رد شده",
    icon: XCircle,
    className: "rejected",
  },
  unverified: {
    label: "تایید نشده",
    icon: ShieldAlert,
    className: "unverified",
  },
};

const CompanyView = ({ company, onEdit }) => {
  const status = STATUS_MAP[company.verification_status] || STATUS_MAP.unverified;
  const StatusIcon = status.icon;

  const logoUrl = company.logo ? getFullImageUrl(company.logo) : null;

  return (
    <div className={styles.viewWrapper}>
      <div className={styles.companyCard}>
        <div className={styles.cardHeader}>
          <div className={styles.logoBox}>
            {logoUrl ? (
              <img src={logoUrl} alt={company.name} className={styles.logo} />
            ) : (
              <div className={styles.logoPlaceholder}>
                <Building2 size={36} />
              </div>
            )}
          </div>

          <div className={styles.titleBox}>
            <div className={styles.titleRow}>
              <h2>{company.name}</h2>
              <span
                className={`${styles.statusBadge} ${styles[status.className]}`}
              >
                <StatusIcon size={13} />
                {status.label}
              </span>
            </div>
            {company.description && (
              <p className={styles.shortDesc}>{company.description}</p>
            )}
          </div>

          <button className={styles.editBtn} onClick={onEdit} aria-label="ویرایش">
            <Edit size={16} />
            ویرایش
          </button>
        </div>

        {company.about && (
          <div className={styles.aboutSection}>
            <h3>درباره شرکت</h3>
            <p>{company.about}</p>
          </div>
        )}

        <div className={styles.contactGrid}>
          {company.email && (
            <div className={styles.contactItem}>
              <Mail size={16} />
              <div>
                <span className={styles.contactLabel}>ایمیل</span>
                <a href={`mailto:${company.email}`} dir="ltr">
                  {company.email}
                </a>
              </div>
            </div>
          )}

          {company.phone && (
            <div className={styles.contactItem}>
              <Phone size={16} />
              <div>
                <span className={styles.contactLabel}>تلفن</span>
                <a href={`tel:${company.phone}`} dir="ltr">
                  {company.phone}
                </a>
              </div>
            </div>
          )}

          {company.website && (
            <div className={styles.contactItem}>
              <Globe size={16} />
              <div>
                <span className={styles.contactLabel}>وب‌سایت</span>
                <a
                  href={company.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  dir="ltr"
                >
                  {company.website}
                </a>
              </div>
            </div>
          )}

          {company.city_name && (
            <div className={styles.contactItem}>
              <MapPin size={16} />
              <div>
                <span className={styles.contactLabel}>شهر</span>
                <span>{company.city_name}</span>
              </div>
            </div>
          )}
        </div>

        {company.address && (
          <div className={styles.addressSection}>
            <h4>آدرس</h4>
            <p>{company.address}</p>
          </div>
        )}

        {company.documents && company.documents.length > 0 && (
          <div className={styles.docsSection}>
            <h4>مدارک آپلود شده ({company.documents.length})</h4>
            <div className={styles.docsGrid}>
              {company.documents.map((doc) => {
                const docUrl = getFullImageUrl(doc.image);
                return (
                  <a
                    key={doc.id}
                    href={docUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.docThumb}
                  >
                    <img src={docUrl} alt={doc.title || "مدرک"} />
                    {doc.title && (
                      <span className={styles.docTitle}>{doc.title}</span>
                    )}
                  </a>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanyView;