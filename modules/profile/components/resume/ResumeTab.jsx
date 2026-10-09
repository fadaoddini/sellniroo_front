// modules/profile/components/resume/ResumeTab.jsx
"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Config from "@/config/config";
import { useAuth } from "@/contexts/AuthContext";
import ResumeForm from "./ResumeForm";
import ResumeView from "./ResumeView";
import styles from "./ResumeTab.module.css";
import { Loader2, FileText, AlertCircle } from "lucide-react";

const ResumeTab = ({ onRefresh }) => {
  const { getAuthHeaders } = useAuth();
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mode, setMode] = useState("view"); // view | edit | create

  const fetchResume = async () => {
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
  };

  useEffect(() => {
    fetchResume();
  }, []);

  const handleSaved = () => {
    fetchResume();
    if (onRefresh) onRefresh();
  };

  const handleCancel = () => {
    if (resume) setMode("view");
    else setMode("create");
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <Loader2 className={styles.spinner} size={32} />
        <p>در حال بارگذاری...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorBox}>
        <AlertCircle size={28} />
        <p>{error}</p>
        <button onClick={fetchResume} className={styles.retryBtn}>
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
            <FileText size={48} />
          </div>
          <h2>هنوز رزومه‌ای نساخته‌اید</h2>
          <p>
            با ساخت رزومه حرفه‌ای، شانس خود را برای پیدا کردن شغل مناسب
            چند برابر کنید. رزومه شما قابل دانلود PDF و اشتراک‌گذاری با لینک است.
          </p>
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