// modules/profile/components/EditJobModal.jsx
"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Config from "@/config/config";
import { useAuth } from "@/contexts/AuthContext";
import styles from "../styles/EditJobModal.module.css";
import {
  X,
  Loader2,
  Save,
  AlertCircle,
  Image as ImageIcon,
} from "lucide-react";

const EditJobModal = ({ job, onClose, onSaved }) => {
  const { getAuthHeaders } = useAuth();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    title: job.title || "",
    description: job.description || "",
    min_salary: job.min_salary || "",
    max_salary: job.max_salary || "",
    contact_phone: job.contact_phone || "",
    contact_email: job.contact_email || "",
    address: job.address || "",
  });

  // جلوگیری از اسکرول پس‌زمینه
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // بستن با Escape
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape" && !saving) onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [saving, onClose]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim()) {
      setError("عنوان و توضیحات الزامی است");
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const payload = { ...formData };
      // تبدیل اعداد
      if (payload.min_salary) payload.min_salary = Number(payload.min_salary);
      else delete payload.min_salary;
      if (payload.max_salary) payload.max_salary = Number(payload.max_salary);
      else delete payload.max_salary;

      const url = Config.endpoints.jobisell.jobs.partialUpdate(job.id);
      await axios.patch(url, payload, { headers: getAuthHeaders() });

      onSaved?.();
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
          err.response?.data?.detail ||
          "خطا در ذخیره تغییرات"
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>ویرایش آگهی</h2>
          <button
            className={styles.closeBtn}
            onClick={onClose}
            disabled={saving}
            aria-label="بستن"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label>عنوان آگهی *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleChange("title", e.target.value)}
              placeholder="مثال: استخدام فروشنده حرفه‌ای"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label>توضیحات *</label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              rows={6}
              placeholder="شرح کامل آگهی..."
              required
            />
          </div>

          <div className={styles.row}>
            <div className={styles.formGroup}>
              <label>حداقل حقوق (تومان)</label>
              <input
                type="number"
                value={formData.min_salary}
                onChange={(e) => handleChange("min_salary", e.target.value)}
                placeholder="مثال: 10000000"
                dir="ltr"
              />
            </div>

            <div className={styles.formGroup}>
              <label>حداکثر حقوق (تومان)</label>
              <input
                type="number"
                value={formData.max_salary}
                onChange={(e) => handleChange("max_salary", e.target.value)}
                placeholder="مثال: 25000000"
                dir="ltr"
              />
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.formGroup}>
              <label>شماره تماس</label>
              <input
                type="text"
                value={formData.contact_phone}
                onChange={(e) => handleChange("contact_phone", e.target.value)}
                placeholder="09123456789"
                dir="ltr"
              />
            </div>

            <div className={styles.formGroup}>
              <label>ایمیل تماس</label>
              <input
                type="email"
                value={formData.contact_email}
                onChange={(e) => handleChange("contact_email", e.target.value)}
                placeholder="example@mail.com"
                dir="ltr"
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>آدرس</label>
            <textarea
              value={formData.address}
              onChange={(e) => handleChange("address", e.target.value)}
              rows={2}
              placeholder="آدرس دقیق..."
            />
          </div>

          {error && (
            <div className={styles.errorBox}>
              <AlertCircle size={14} />
              <span>{error}</span>
            </div>
          )}

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={onClose}
              disabled={saving}
            >
              لغو
            </button>
            <button
              type="submit"
              className={styles.saveBtn}
              disabled={saving}
            >
              {saving ? (
                <Loader2 size={16} className={styles.spin} />
              ) : (
                <Save size={16} />
              )}
              <span>{saving ? "در حال ذخیره..." : "ذخیره تغییرات"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditJobModal;