// modules/profile/components/resume/ResumeTab.jsx
"use client";

import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import Config from "@/config/config";
import { useAuth } from "@/contexts/AuthContext";
import ResumeForm from "./ResumeForm";
import ResumeView from "./ResumeView";
import styles from "./ResumeTab.module.css";
import {
  Loader2,
  FileText,
  AlertCircle,
  RefreshCw,
  Download,
  Share2,
  Sparkles,
} from "lucide-react";

const ResumeTab = ({ onRefresh }) => {
  const { getAuthHeaders } = useAuth();
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mode, setMode] = useState("view"); // view | edit | create

  const fetchResume = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get(Config.endpoints.jobisell.myResume.get(), {
        headers: getAuthHeaders(),
      });
      setResume(res.data);
      setMode("view");
    } catch (err) {
      if (err.response?.status === 404) {
        setResume(null);
        setMode("create");
      } else {
        setError(
          err.response?.data?.message ||
            err.response?.data?.error ||
            "خطا در دریافت رزومه"
        );
      }
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders]);

  useEffect(() => {
    fetchResume();
  }, [fetchResume]);

  const handleSaved = useCallback(() => {
    fetchResume();
    onRefresh?.();
  }, [fetchResume, onRefresh]);

  const handleCancel = () => {
    if (resume) setMode("view");
    else setMode("create");
  };

  if (loading) {
    return (
      <div className={styles.loading} role="status">
        <Loader2 className={styles.spinner} size={32} />
        <p>در حال بارگذاری رزومه...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorBox}>
        <AlertCircle size={28} />
        <p>{error}</p>
        <button type="button" onClick={fetchResume} className={styles.retryBtn}>
          <RefreshCw size={14} />
          تلاش دوباره
        </button>
      </div>
    );
  }

  if (!resume && mode === "create") {
    return (
      <div className={styles.emptyWrapper}>
        <div className={styles.emptyCard}>
          <div className={styles.emptyIcon}>
            <FileText size={40} />
          </div>
          <h2>رزومه حرفه‌ای خود را بسازید</h2>
          <p>
            با چند مرحله ساده، رزومه‌ای استاندارد، قابل دانلود PDF و قابل
            اشتراک‌گذاری بسازید تا شانس استخدام‌تان بیشتر شود.
          </p>
          <div className={styles.features}>
            <span className={styles.featurePill}>
              <Sparkles size={12} /> قالب‌های متنوع
            </span>
            <span className={styles.featurePill}>
              <Download size={12} /> دانلود PDF
            </span>
            <span className={styles.featurePill}>
              <Share2 size={12} /> لینک عمومی
            </span>
          </div>
        </div>

        <ResumeForm
          resume={null}
          onSaved={handleSaved}
          onCancel={handleCancel}
        />
      </div>
    );
  }

  if (mode === "edit") {
    return (
      <ResumeForm
        resume={resume}
        onSaved={handleSaved}
        onCancel={handleCancel}
      />
    );
  }

  return (
    <div className={styles.resumeTab}>
      <ResumeView
        resume={resume}
        onEdit={() => setMode("edit")}
        onRefresh={handleSaved}
      />
    </div>
  );
};

export default ResumeTab;
