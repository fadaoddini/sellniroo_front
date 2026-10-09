// modules/profile/components/company/CompanyForm.jsx
"use client";

import { useState, useEffect, useRef } from "react";
import axios from "axios";
import Config from "@/config/config";
import { useAuth } from "@/contexts/AuthContext";
import { getFullImageUrl } from "@/utils/imageUrl";
import styles from "../../styles/company/CompanyForm.module.css";
import {
  X,
  Loader2,
  Save,
  AlertCircle,
  Upload,
  Trash2,
  Image as ImageIcon,
  FileText,
} from "lucide-react";

const CompanyForm = ({ company, onSaved, onCancel }) => {
  const { getAuthHeaders } = useAuth();
  const isEdit = !!company;
  const logoInputRef = useRef(null);
  const docsInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: company?.name || "",
    description: company?.description || "",
    about: company?.about || "",
    email: company?.email || "",
    phone: company?.phone || "",
    website: company?.website || "",
    address: company?.address || "",
    city: company?.city || "",
  });

  const [logo, setLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState(
    company?.logo ? getFullImageUrl(company.logo) : null
  );
  const [documents, setDocuments] = useState([]);
  const [cities, setCities] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // ✅ لود شهرها
  useEffect(() => {
    const fetchCities = async () => {
      try {
        const res = await axios.get(Config.endpoints.jobisell.cities(), {
          headers: getAuthHeaders(),
        });
        setCities(res.data?.results || res.data || []);
      } catch (err) {
        console.error("Error fetching cities:", err);
      }
    };
    fetchCities();
  }, []);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // ✅ لوگو
  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("لوگو باید تصویر باشد");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("حجم لوگو نباید بیشتر از ۵ مگابایت باشد");
      return;
    }
    setLogo(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  // ✅ مدارک (حداکثر ۵)
  const handleDocsChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (documents.length + files.length > 5) {
      setError("حداکثر ۵ مدرک می‌توانید آپلود کنید");
      return;
    }
    const validFiles = files.filter((f) => {
      const ok = /image\/(jpeg|jpg|png|webp)|application\/pdf/.test(f.type);
      if (!ok) setError(`فرمت فایل ${f.name} پشتیبانی نمی‌شود`);
      return ok;
    });
    setDocuments((prev) => [...prev, ...validFiles]);
    if (docsInputRef.current) docsInputRef.current.value = "";
  };

  const removeDocument = (idx) => {
    setDocuments((prev) => prev.filter((_, i) => i !== idx));
  };

  const removeLogo = () => {
    setLogo(null);
    setLogoPreview(null);
    if (logoInputRef.current) logoInputRef.current.value = "";
  };

  // ✅ ارسال
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.name.trim()) {
      setError("نام شرکت الزامی است");
      return;
    }

    try {
      setSaving(true);

      const fd = new FormData();
      Object.entries(formData).forEach(([k, v]) => {
        if (v !== "" && v !== null && v !== undefined) {
          fd.append(k, v);
        }
      });

      if (logo) fd.append("logo", logo);

      documents.forEach((doc) => {
        fd.append("documents", doc);
      });

      const url = isEdit
        ? Config.endpoints.jobisell.myCompany.update()
        : Config.endpoints.jobisell.myCompany.create();

      const method = isEdit ? "patch" : "post";

      await axios[method](url, fd, {
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "multipart/form-data",
        },
      });

      onSaved?.();
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          err.response?.data?.detail ||
          "خطا در ذخیره اطلاعات"
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.formWrapper}>
      <div className={styles.header}>
        <h2>{isEdit ? "ویرایش شرکت" : "ثبت شرکت جدید"}</h2>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        {/* لوگو */}
        <div className={styles.logoSection}>
          <label>لوگوی شرکت</label>
          <div className={styles.logoBox}>
            {logoPreview ? (
              <div className={styles.logoPreviewWrapper}>
                <img
                  src={logoPreview}
                  alt="لوگو"
                  className={styles.logoPreview}
                />
                <button
                  type="button"
                  className={styles.removeLogoBtn}
                  onClick={removeLogo}
                  aria-label="حذف لوگو"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                className={styles.uploadBox}
                onClick={() => logoInputRef.current?.click()}
              >
                <ImageIcon size={28} />
                <span>آپلود لوگو</span>
                <span className={styles.hint}>حداکثر ۵ مگابایت</span>
              </button>
            )}
            <input
              ref={logoInputRef}
              type="file"
              accept="image/*"
              onChange={handleLogoChange}
              hidden
            />
          </div>
        </div>

        {/* اطلاعات پایه */}
        <div className={styles.row}>
          <div className={styles.formGroup}>
            <label>نام شرکت *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="نام کامل شرکت"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label>شهر</label>
            <select
              value={formData.city}
              onChange={(e) => handleChange("city", e.target.value)}
            >
              <option value="">انتخاب کنید</option>
              {cities.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className={styles.formGroup}>
          <label>توضیح کوتاه</label>
          <input
            type="text"
            value={formData.description}
            onChange={(e) => handleChange("description", e.target.value)}
            placeholder="یک توضیح کوتاه یک‌خطی درباره شرکت"
          />
        </div>

        <div className={styles.formGroup}>
          <label>درباره شرکت</label>
          <textarea
            value={formData.about}
            onChange={(e) => handleChange("about", e.target.value)}
            rows={5}
            placeholder="متن کامل درباره شرکت، تاریخچه، فعالیت‌ها و ..."
          />
        </div>

        <div className={styles.row}>
          <div className={styles.formGroup}>
            <label>ایمیل شرکت</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              placeholder="info@company.com"
              dir="ltr"
            />
          </div>

          <div className={styles.formGroup}>
            <label>تلفن شرکت</label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              placeholder="02112345678"
              dir="ltr"
            />
          </div>
        </div>

        <div className={styles.formGroup}>
          <label>وب‌سایت</label>
          <input
            type="url"
            value={formData.website}
            onChange={(e) => handleChange("website", e.target.value)}
            placeholder="https://example.com"
            dir="ltr"
          />
        </div>

        <div className={styles.formGroup}>
          <label>آدرس شرکت</label>
          <textarea
            value={formData.address}
            onChange={(e) => handleChange("address", e.target.value)}
            rows={2}
            placeholder="آدرس دقیق شرکت"
          />
        </div>

        {/* مدارک صحت‌سنجی */}
        <div className={styles.docsSection}>
          <label>مدارک صحت‌سنجی</label>
          <p className={styles.docsHint}>
            لطفاً مدارک مرتبط با شرکت و فعالیت خود را آپلود نمایید (حداکثر ۵
            تصویر یا PDF)
          </p>

          <div className={styles.docsGrid}>
            {documents.map((doc, idx) => (
              <div key={idx} className={styles.docItem}>
                <FileText size={20} />
                <span className={styles.docName}>
                  {doc.name.length > 20
                    ? doc.name.slice(0, 20) + "..."
                    : doc.name}
                </span>
                <button
                  type="button"
                  className={styles.removeDocBtn}
                  onClick={() => removeDocument(idx)}
                >
                  <X size={14} />
                </button>
              </div>
            ))}

            {documents.length < 5 && (
              <button
                type="button"
                className={styles.addDocBtn}
                onClick={() => docsInputRef.current?.click()}
              >
                <Upload size={18} />
                <span>افزودن مدرک</span>
                <span className={styles.docCount}>{documents.length} / 5</span>
              </button>
            )}
          </div>

          <input
            ref={docsInputRef}
            type="file"
            accept="image/*,application/pdf"
            multiple
            onChange={handleDocsChange}
            hidden
          />
        </div>

        {error && (
          <div className={styles.errorBox}>
            <AlertCircle size={14} />
            <span>{error}</span>
          </div>
        )}

        <div className={styles.actions}>
          {onCancel && (
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={onCancel}
              disabled={saving}
            >
              لغو
            </button>
          )}
          <button type="submit" className={styles.saveBtn} disabled={saving}>
            {saving ? (
              <Loader2 size={16} className={styles.spin} />
            ) : (
              <Save size={16} />
            )}
            <span>{saving ? "در حال ذخیره..." : "ذخیره"}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default CompanyForm;