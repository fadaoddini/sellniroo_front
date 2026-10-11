// modules/profile/components/resume/ResumeView.jsx
"use client";

import { useState, useRef, useMemo, useCallback } from "react";
import axios from "axios";
import Config from "@/config/config";
import { useAuth } from "@/contexts/AuthContext";
import { useReactToPrint } from "react-to-print";
import ModernTemplate from "./templates/ModernTemplate";
import ClassicTemplate from "./templates/ClassicTemplate";
import MinimalTemplate from "./templates/MinimalTemplate";
import CreativeTemplate from "./templates/CreativeTemplate";
import ExecutiveTemplate from "./templates/ExecutiveTemplate";
import styles from "./ResumeView.module.css";
import {
  Edit,
  Eye,
  Download,
  Globe,
  EyeOff,
  Loader2,
  CheckCircle,
  AlertCircle,
  Copy,
  ExternalLink,
  FileText,
} from "lucide-react";

const TEMPLATE_MAP = {
  modern: ModernTemplate,
  classic: ClassicTemplate,
  minimal: MinimalTemplate,
  creative: CreativeTemplate,
  executive: ExecutiveTemplate,
};

const TEMPLATE_LABELS = {
  modern: "مدرن",
  classic: "کلاسیک",
  minimal: "مینیمال",
  creative: "خلاقانه",
  executive: "مدیریتی",
};

const faNum = (n) => Number(n || 0).toLocaleString("fa-IR");

const ResumeView = ({ resume, onEdit, onRefresh }) => {
  const { getAuthHeaders } = useAuth();
  const [publishing, setPublishing] = useState(false);
  const [toast, setToast] = useState(null);
  const printRef = useRef(null);
  const toastTimer = useRef(null);

  const isPublished = resume.status === "published";
  const TemplateComponent = TEMPLATE_MAP[resume.template] || ModernTemplate;
  const templateLabel = TEMPLATE_LABELS[resume.template] || "مدرن";

  const publicUrl = useMemo(() => {
    if (typeof window === "undefined") return `/resume/${resume.slug}`;
    return `${window.location.origin}/resume/${resume.slug}`;
  }, [resume.slug]);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `resume-${resume.slug}`,
    pageStyle: `
      @page { size: A4; margin: 0; }
      @media print {
        body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      }
    `,
    onAfterPrint: async () => {
      try {
        await axios.post(
          Config.endpoints.jobisell.publicResume.download(resume.slug),
          {},
          { headers: getAuthHeaders() }
        );
        onRefresh?.();
      } catch {
        /* ignore */
      }
    },
  });

  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3000);
  }, []);

  const handlePublishToggle = async () => {
    try {
      setPublishing(true);
      const url = isPublished
        ? Config.endpoints.jobisell.myResume.unpublish()
        : Config.endpoints.jobisell.myResume.publish();

      await axios.post(url, {}, { headers: getAuthHeaders() });
      showToast(isPublished ? "انتشار لغو شد" : "رزومه منتشر شد");
      onRefresh?.();
    } catch (err) {
      showToast(err.response?.data?.error || "خطا در انجام عملیات", "error");
    } finally {
      setPublishing(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl);
      showToast("لینک کپی شد");
    } catch {
      showToast("کپی لینک ناموفق بود", "error");
    }
  };

  return (
    <div className={styles.viewWrapper}>
      <div className={styles.toolbar}>
        <div className={styles.toolbarInfo}>
          <p className={styles.eyebrow}>رزومه من · قالب {templateLabel}</p>
          <h2>{resume.title || "رزومه بدون عنوان"}</h2>
          <div className={styles.meta}>
            <span
              className={`${styles.statusBadge} ${
                isPublished ? styles.published : styles.draft
              }`}
            >
              {isPublished ? (
                <>
                  <CheckCircle size={12} /> منتشر شده
                </>
              ) : (
                <>
                  <EyeOff size={12} /> پیش‌نویس
                </>
              )}
            </span>
            <span className={styles.metaItem}>
              <Eye size={12} /> {faNum(resume.views_count)} بازدید
            </span>
            <span className={styles.metaItem}>
              <Download size={12} /> {faNum(resume.downloads_count)} دانلود
            </span>
          </div>
        </div>

        <div className={styles.toolbarActions}>
          <button type="button" className={styles.actionBtn} onClick={onEdit}>
            <Edit size={14} />
            ویرایش
          </button>

          <button
            type="button"
            className={`${styles.actionBtn} ${styles.ghostBtn}`}
            onClick={handlePublishToggle}
            disabled={publishing}
          >
            {publishing ? (
              <Loader2 size={14} className={styles.spin} />
            ) : isPublished ? (
              <EyeOff size={14} />
            ) : (
              <Globe size={14} />
            )}
            {isPublished ? "لغو انتشار" : "انتشار"}
          </button>

          {isPublished && (
            <>
              <button
                type="button"
                className={styles.actionBtn}
                onClick={handleCopyLink}
              >
                <Copy size={14} />
                کپی لینک
              </button>
              <a
                href={`/resume/${resume.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.actionBtn}
              >
                <ExternalLink size={14} />
                مشاهده
              </a>
            </>
          )}

          <button
            type="button"
            className={`${styles.actionBtn} ${styles.primaryBtn}`}
            onClick={handlePrint}
          >
            <Download size={14} />
            دانلود PDF
          </button>
        </div>
      </div>

      <div className={styles.previewShell}>
        <div className={styles.previewHeader}>
          <span>
            <FileText size={14} />
            پیش‌نمایش رزومه
          </span>
          <span>اندازه A4</span>
        </div>
        <div className={styles.previewWrapper}>
          <div ref={printRef} className={styles.previewArea}>
            <TemplateComponent resume={resume} />
          </div>
        </div>
      </div>

      {toast && (
        <div
          className={`${styles.toast} ${
            toast.type === "error" ? styles.toastError : ""
          }`}
          role="status"
        >
          {toast.type === "error" ? (
            <AlertCircle size={14} />
          ) : (
            <CheckCircle size={14} />
          )}
          {toast.message}
        </div>
      )}
    </div>
  );
};

export default ResumeView;
