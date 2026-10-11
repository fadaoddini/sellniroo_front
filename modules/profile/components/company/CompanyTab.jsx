// modules/profile/components/company/CompanyTab.jsx
"use client";

import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import Config from "@/config/config";
import { useAuth } from "@/contexts/AuthContext";
import CompanyForm from "./CompanyForm";
import CompanyView from "./CompanyView";
import VerificationSection from "./VerificationSection";
import styles from "../../styles/company/CompanyTab.module.css";
import {
  Loader2,
  Building2,
  AlertCircle,
  RefreshCw,
  ShieldCheck,
  Megaphone,
  FileBadge,
} from "lucide-react";

const CompanyTab = ({ onRefresh }) => {
  const { getAuthHeaders } = useAuth();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mode, setMode] = useState("view"); // view | edit | create

  const fetchCompany = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get(Config.endpoints.jobisell.myCompany.get(), {
        headers: getAuthHeaders(),
      });
      setCompany(res.data);
      setMode("view");
    } catch (err) {
      if (err.response?.status === 404) {
        setCompany(null);
        setMode("create");
      } else {
        setError(
          err.response?.data?.message ||
            err.response?.data?.error ||
            "خطا در دریافت اطلاعات شرکت"
        );
      }
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders]);

  useEffect(() => {
    fetchCompany();
  }, [fetchCompany]);

  const handleSaved = useCallback(() => {
    fetchCompany();
    onRefresh?.();
  }, [fetchCompany, onRefresh]);

  const handleCancel = () => {
    if (company) setMode("view");
    else setMode("create");
  };

  if (loading) {
    return (
      <div className={styles.loading} role="status">
        <Loader2 className={styles.spinner} size={32} />
        <p>در حال بارگذاری اطلاعات شرکت...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorBox}>
        <AlertCircle size={28} />
        <p>{error}</p>
        <button type="button" onClick={fetchCompany} className={styles.retryBtn}>
          <RefreshCw size={14} />
          تلاش دوباره
        </button>
      </div>
    );
  }

  if (!company && mode === "create") {
    return (
      <div className={styles.emptyWrapper}>
        <div className={styles.emptyCard}>
          <div className={styles.emptyIcon}>
            <Building2 size={40} />
          </div>
          <h2>شرکت خود را ثبت کنید</h2>
          <p>
            با ثبت شرکت می‌توانید آگهی استخدام منتشر کنید، مدارک را آپلود کنید
            و درخواست تایید رسمی ثبت نمایید.
          </p>
          <div className={styles.features}>
            <span className={styles.featurePill}>
              <Megaphone size={12} /> انتشار آگهی
            </span>
            <span className={styles.featurePill}>
              <FileBadge size={12} /> آپلود مدارک
            </span>
            <span className={styles.featurePill}>
              <ShieldCheck size={12} /> تایید شرکت
            </span>
          </div>
        </div>

        <CompanyForm
          company={null}
          onSaved={handleSaved}
          onCancel={handleCancel}
        />
      </div>
    );
  }

  if (mode === "edit") {
    return (
      <CompanyForm
        company={company}
        onSaved={handleSaved}
        onCancel={handleCancel}
      />
    );
  }

  return (
    <div className={styles.companyTab}>
      <CompanyView company={company} onEdit={() => setMode("edit")} />
      <VerificationSection
        company={company}
        onRequestSubmitted={handleSaved}
      />
    </div>
  );
};

export default CompanyTab;
