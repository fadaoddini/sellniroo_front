// modules/profile/components/resume/ResumeView.jsx
"use client";

import { useState, useRef } from "react";
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
  Edit, Eye, Download, Share2, Globe, EyeOff,
  Loader2, CheckCircle, AlertCircle, Copy, Link as LinkIcon,
} from "lucide-react";

const ResumeView = ({ resume, onEdit, onRefresh }) => {
  const { getAuthHeaders } = useAuth();
  const [publishing, setPublishing] = useState(false);
  const [toast, setToast] = useState(null);


  const isPublished = resume.status === "published";

 const printRef = useRef(null);

const handlePrint = useReactToPrint({
  contentRef: printRef,   // ⬅️ خود ref رو بده، نه function
  documentTitle: `resume-${resume.slug}`,
  pageStyle: `
    @page {
      size: A4;
      margin: 0;
    }
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
    } catch (e) {}
  },
});

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

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
      console.error(err);
      showToast(
        err.response?.data?.error || "خطا در انجام عملیات",
        "error"
      );
    } finally {
      setPublishing(false);
    }
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/resume/${resume.slug}`;
    navigator.clipboard.writeText(url);
    showToast("لینک کپی شد");
  };

  const TEMPLATE_MAP = {
  modern: ModernTemplate,
  classic: ClassicTemplate,
  minimal: MinimalTemplate,
  creative: CreativeTemplate,
  executive: ExecutiveTemplate,
};

const TemplateComponent = TEMPLATE_MAP[resume.template] || ModernTemplate;

  return (
    <div className={styles.viewWrapper}>
      {/* هدر با دکمه‌ها */}
      <div className={styles.toolbar}>
        <div className={styles.toolbarInfo}>
          <h2>{resume.title}</h2>
          <div className={styles.meta}>
            <span className={`${styles.statusBadge} ${isPublished ? styles.published : styles.draft}`}>
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
              <Eye size={12} /> {resume.views_count} بازدید
            </span>
            <span className={styles.metaItem}>
              <Download size={12} /> {resume.downloads_count} دانلود
            </span>
          </div>
        </div>

        <div className={styles.toolbarActions}>
          <button className={styles.actionBtn} onClick={onEdit}>
            <Edit size={14} />
            ویرایش
          </button>

          <button
            className={styles.actionBtn}
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
            <button className={styles.actionBtn} onClick={handleCopyLink}>
              <Copy size={14} />
              کپی لینک
            </button>
          )}

          <button className={`${styles.actionBtn} ${styles.primaryBtn}`} onClick={handlePrint}>
            <Download size={14} />
            دانلود PDF
          </button>
        </div>
      </div>

      {/* پیش‌نمایش */}
      <div className={styles.previewWrapper}>
        <div ref={printRef} className={styles.previewArea}>
          <TemplateComponent resume={resume} />
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className={`${styles.toast} ${toast.type === "error" ? styles.toastError : ""}`}>
          {toast.type === "error" ? <AlertCircle size={14} /> : <CheckCircle size={14} />}
          {toast.message}
        </div>
      )}
    </div>
  );
};

export default ResumeView;