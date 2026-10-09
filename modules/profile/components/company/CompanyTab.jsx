// modules/profile/components/company/CompanyTab.jsx
"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Config from "@/config/config";
import { useAuth } from "@/contexts/AuthContext";
import CompanyForm from "./CompanyForm";
import CompanyView from "./CompanyView";
import VerificationSection from "./VerificationSection";
import styles from "../../styles/company/CompanyTab.module.css";
import { Loader2, Building2, AlertCircle, Plus } from "lucide-react";

const CompanyTab = ({ onRefresh }) => {
  const { getAuthHeaders } = useAuth();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mode, setMode] = useState("view"); // view | edit | create

  const fetchCompany = async () => {
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
        // هنوز شرکت ثبت نکرده
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
  };

  useEffect(() => {
    fetchCompany();
  }, []);

  const handleSaved = () => {
    fetchCompany();
    if (onRefresh) onRefresh();
  };

  const handleCancel = () => {
    if (company) setMode("view");
    else setMode("create"); // اگه شرکت نداشت، همون حالت create بمونه
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
        <button onClick={fetchCompany} className={styles.retryBtn}>
          تلاش دوباره
        </button>
      </div>
    );
  }

  // حالت ایجاد (شرکت نداره)
  if (!company && mode === "create") {
    return (
      <div className={styles.emptyWrapper}>
        <div className={styles.emptyCard}>
          <div className={styles.emptyIcon}>
            <Building2 size={48} />
          </div>
          <h2>هنوز شرکتی ثبت نکرده‌اید</h2>
          <p>
            با ثبت شرکت خود، می‌توانید آگهی‌های استخدامی منتشر کنید و
            درخواست تایید شرکت خود را ثبت نمایید.
          </p>
          <button
            className={styles.createBtn}
            onClick={() => setMode("create")}
          >
            <Plus size={16} />
            ثبت شرکت جدید
          </button>
        </div>

        <CompanyForm
          company={null}
          onSaved={handleSaved}
          onCancel={() => setMode("view")}
        />
      </div>
    );
  }

  // حالت ویرایش
  if (mode === "edit") {
    return (
      <CompanyForm
        company={company}
        onSaved={handleSaved}
        onCancel={handleCancel}
      />
    );
  }

  // حالت نمایش
  return (
    <div className={styles.companyTab}>
      <CompanyView
        company={company}
        onEdit={() => setMode("edit")}
      />

      <VerificationSection
        company={company}
        onRequestSubmitted={handleSaved}
      />
    </div>
  );
};

export default CompanyTab;