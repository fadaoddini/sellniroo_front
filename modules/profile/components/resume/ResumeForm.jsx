// modules/profile/components/resume/ResumeForm.jsx
"use client";

import { useState, useEffect, useRef } from "react";
import axios from "axios";
import Config from "@/config/config";
import { useAuth } from "@/contexts/AuthContext";
import { getFullImageUrl } from "@/utils/imageUrl";
import PersianDatePicker from "@/components/common/PersianDatePicker";
import styles from "./ResumeForm.module.css";
import TemplateSelector from "./TemplateSelector";
import FieldSelect from "./FieldSelect";
import {
  Loader2, Save, AlertCircle, Trash2,
  User, Briefcase, GraduationCap, Award, Globe, FileText,
  Image as ImageIcon, Palette,
} from "lucide-react";

// Section Components
import WorkExperienceSection from "./sections/WorkExperienceSection";
import EducationSection from "./sections/EducationSection";
import SkillsSection from "./sections/SkillsSection";
import LanguagesSection from "./sections/LanguagesSection";
import CertificatesSection from "./sections/CertificatesSection";
import ProjectsSection from "./sections/ProjectsSection";
import AwardsSection from "./sections/AwardsSection";
import InterestsSection from "./sections/InterestsSection";

const FORM_STEPS = [
  { key: "template", label: "انتخاب قالب", icon: Palette },
  { key: "personal", label: "اطلاعات شخصی", icon: User },
  { key: "summary", label: "خلاصه حرفه‌ای", icon: FileText },
  { key: "work", label: "سوابق شغلی", icon: Briefcase },
  { key: "education", label: "تحصیلات", icon: GraduationCap },
  { key: "skills", label: "مهارت‌ها", icon: Award },
  { key: "languages", label: "زبان‌ها", icon: Globe },
  { key: "certificates", label: "دوره‌ها", icon: Award },
  { key: "projects", label: "پروژه‌ها", icon: Briefcase },
  { key: "awards", label: "افتخارات", icon: Award },
  { key: "interests", label: "علاقه‌مندی‌ها", icon: Award },
];

const ResumeForm = ({ resume, onSaved, onCancel }) => {
  const { getAuthHeaders } = useAuth();
  const isEdit = !!resume;
  const imageInputRef = useRef(null);

  // ✅ اگه ویرایش، از تب "اطلاعات شخصی" شروع کن
  const [activeStep, setActiveStep] = useState(
    isEdit ? "personal" : "template"
  );

  const [cities, setCities] = useState([]);
  const [genders, setGenders] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  const [formData, setFormData] = useState({
    title: resume?.title || "",
    template: resume?.template || "modern",
    full_name: resume?.full_name || "",
    job_title: resume?.job_title || "",
    email: resume?.email || "",
    phone: resume?.phone || "",
    mobile: resume?.mobile || "",
    address: resume?.address || "",
    city: resume?.city || "",
    birth_date: resume?.birth_date || "",
    gender: resume?.gender || "",
    marital_status: resume?.marital_status || "",
    military_status: resume?.military_status || "",
    website: resume?.website || "",
    linkedin: resume?.linkedin || "",
    github: resume?.github || "",
    telegram: resume?.telegram || "",
    summary: resume?.summary || "",
  });

  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(
    resume?.image_url ? getFullImageUrl(resume.image_url) : null
  );

  // ============================================
  // ✅ Fetch lookups
  // ============================================
  useEffect(() => {
    const fetchData = async () => {
      try {
        const headers = getAuthHeaders();
        const [citiesRes, gendersRes] = await Promise.all([
          axios.get(Config.endpoints.jobisell.cities(), { headers }),
          axios.get(Config.endpoints.jobisell.genders(), { headers }),
        ]);
        setCities(citiesRes.data?.results || citiesRes.data || []);
        setGenders(gendersRes.data?.results || gendersRes.data || []);
      } catch (err) {
        console.error("Error fetching lookups:", err);
      }
    };
    fetchData();
  }, []);

  // ============================================
  // ✅ Toast
  // ============================================
  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2500);
  };

  // ============================================
  // ✅ تغییر فیلد
  // ============================================
  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // ============================================
  // ✅ تغییر قالب — با ذخیره خودکار در edit mode
  // ============================================
  const handleTemplateChange = async (newTemplate) => {
    // آپدیت state برای UI فوری
    handleChange("template", newTemplate);

    // اگه edit mode، خودکار ذخیره کن
    if (isEdit) {
      try {
        await axios.patch(
          Config.endpoints.jobisell.myResume.update(),
          { template: newTemplate },
          {
            headers: {
              ...getAuthHeaders(),
              "Content-Type": "application/json",
            },
          }
        );
        showToast("قالب با موفقیت ذخیره شد");
      } catch (err) {
        console.error("Error saving template:", err);
        showToast("خطا در ذخیره قالب", "error");
      }
    }
  };

  // ============================================
  // ✅ عکس
  // ============================================
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("فقط تصویر مجاز است");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("حجم تصویر نباید بیشتر از ۵ مگابایت باشد");
      return;
    }
    setImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
    if (imageInputRef.current) imageInputRef.current.value = "";
  };

  // ============================================
  // ✅ ذخیره اطلاعات پایه
  // ============================================
  const handleSaveBasicInfo = async () => {
    setError(null);

    if (!formData.title.trim()) {
      setError("عنوان رزومه الزامی است");
      return;
    }
    if (!formData.full_name.trim()) {
      setError("نام کامل الزامی است");
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
      if (image) fd.append("image", image);

      const url = isEdit
        ? Config.endpoints.jobisell.myResume.update()
        : Config.endpoints.jobisell.myResume.create();

      const method = isEdit ? "patch" : "post";

      await axios[method](url, fd, {
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "multipart/form-data",
        },
      });

      showToast("اطلاعات با موفقیت ذخیره شد");

      if (!isEdit) {
        // بعد از ساخت، parent رو رفرش کن
        onSaved?.();
      } else {
        // اگه ویرایش، فقط رفرش کن
        onSaved?.();
      }
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          err.response?.data?.detail ||
          JSON.stringify(err.response?.data) ||
          "خطا در ذخیره اطلاعات"
      );
    } finally {
      setSaving(false);
    }
  };

  // ============================================
  // ✅ رندر
  // ============================================
  return (
    <div className={styles.formWrapper}>
      {/* Header */}
      <div className={styles.header}>
        <h2>{isEdit ? "ویرایش رزومه" : "ساخت رزومه جدید"}</h2>
        <p className={styles.subtitle}>
          از مراحل زیر بخش‌ها را کامل کنید. بعد از هر تغییر مهم، ذخیره را بزنید.
        </p>
      </div>

      {/* استپر */}
      <div className={styles.stepsWrapper}>
        {FORM_STEPS.map((step) => {
          const Icon = step.icon;
          return (
            <button
              key={step.key}
              type="button"
              className={`${styles.stepBtn} ${
                activeStep === step.key ? styles.activeStep : ""
              }`}
              onClick={() => setActiveStep(step.key)}
            >
              <Icon size={16} />
              <span>{step.label}</span>
            </button>
          );
        })}
      </div>

      {/* محتوا */}
      <div className={styles.stepContent}>
        {/* ============================================
            انتخاب قالب
            ============================================ */}
        {activeStep === "template" && (
          <TemplateSelector
            value={formData.template}
            onChange={handleTemplateChange}
          />
        )}

        {/* ============================================
            اطلاعات شخصی
            ============================================ */}
        {activeStep === "personal" && (
          <div className={styles.personalPanel}>
            <div className={styles.personalTop}>
              <div className={styles.avatarCol}>
                {imagePreview ? (
                  <div className={styles.imagePreviewWrapper}>
                    <img
                      src={imagePreview}
                      alt="پروفایل"
                      className={styles.imagePreview}
                    />
                    <button
                      type="button"
                      className={styles.removeImageBtn}
                      onClick={removeImage}
                      aria-label="حذف تصویر"
                    >
                      <Trash2 size={12} />
                    </button>
                    <button
                      type="button"
                      className={styles.changeImageBtn}
                      onClick={() => imageInputRef.current?.click()}
                    >
                      تغییر
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    className={styles.uploadBox}
                    onClick={() => imageInputRef.current?.click()}
                  >
                    <ImageIcon size={22} strokeWidth={1.8} />
                    <span>عکس</span>
                  </button>
                )}
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  hidden
                />
              </div>

              <div className={styles.personalIdentity}>
                <div className={`${styles.formGroup} ${styles.spanFull}`}>
                  <label>عنوان رزومه *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleChange("title", e.target.value)}
                    placeholder="مثلاً: رزومه کارشناس فروش"
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>نام کامل *</label>
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => handleChange("full_name", e.target.value)}
                    placeholder="نام و نام خانوادگی"
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>عنوان شغلی</label>
                  <input
                    type="text"
                    value={formData.job_title}
                    onChange={(e) => handleChange("job_title", e.target.value)}
                    placeholder="مثلاً: کارشناس فروش"
                  />
                </div>
              </div>
            </div>

            <section className={styles.personalBlock}>
              <h4 className={styles.blockTitle}>اطلاعات تماس</h4>
              <div className={styles.grid3}>
                <div className={styles.formGroup}>
                  <label>ایمیل</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    placeholder="example@mail.com"
                    dir="ltr"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>موبایل</label>
                  <input
                    type="text"
                    value={formData.mobile}
                    onChange={(e) => handleChange("mobile", e.target.value)}
                    placeholder="09123456789"
                    dir="ltr"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>تلفن ثابت</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    placeholder="02112345678"
                    dir="ltr"
                  />
                </div>
              </div>
            </section>

            <section className={styles.personalBlock}>
              <h4 className={styles.blockTitle}>مشخصات فردی</h4>
              <div className={styles.grid3}>
                <FieldSelect
                  label="شهر"
                  value={formData.city}
                  onChange={(v) => handleChange("city", v)}
                  options={cities.map((c) => ({ value: c.id, label: c.name }))}
                  placeholder="انتخاب شهر"
                  searchable
                  allowClear
                />
                <div className={styles.formGroup}>
                  <label>تاریخ تولد</label>
                  <PersianDatePicker
                    value={formData.birth_date}
                    onChange={(date) => handleChange("birth_date", date || "")}
                    placeholder="انتخاب تاریخ"
                    minYear={1300}
                    maxYear={1410}
                  />
                </div>
                <FieldSelect
                  label="جنسیت"
                  value={formData.gender}
                  onChange={(v) => handleChange("gender", v)}
                  options={genders.map((g) => ({ value: g.id, label: g.name }))}
                  placeholder="انتخاب جنسیت"
                  allowClear
                />
                <FieldSelect
                  label="وضعیت تاهل"
                  value={formData.marital_status}
                  onChange={(v) => handleChange("marital_status", v)}
                  options={[
                    { value: "single", label: "مجرد" },
                    { value: "married", label: "متاهل" },
                  ]}
                  placeholder="انتخاب کنید"
                  allowClear
                />
                <FieldSelect
                  label="وضعیت خدمت سربازی"
                  value={formData.military_status}
                  onChange={(v) => handleChange("military_status", v)}
                  options={[
                    { value: "done", label: "انجام شده" },
                    { value: "exempt", label: "معاف" },
                    { value: "not_done", label: "انجام نشده" },
                  ]}
                  placeholder="انتخاب کنید"
                  allowClear
                />
                <div className={`${styles.formGroup} ${styles.spanFull}`}>
                  <label>آدرس</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => handleChange("address", e.target.value)}
                    placeholder="آدرس محل سکونت"
                  />
                </div>
              </div>
            </section>

            <section className={styles.personalBlock}>
              <h4 className={styles.blockTitle}>شبکه‌ها و لینک‌ها</h4>
              <div className={styles.grid3}>
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
                  <label>لینکدین</label>
                  <input
                    type="url"
                    value={formData.linkedin}
                    onChange={(e) => handleChange("linkedin", e.target.value)}
                    placeholder="https://linkedin.com/in/..."
                    dir="ltr"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>گیت‌هاب</label>
                  <input
                    type="url"
                    value={formData.github}
                    onChange={(e) => handleChange("github", e.target.value)}
                    placeholder="https://github.com/..."
                    dir="ltr"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>تلگرام</label>
                  <input
                    type="text"
                    value={formData.telegram}
                    onChange={(e) => handleChange("telegram", e.target.value)}
                    placeholder="@username"
                    dir="ltr"
                  />
                </div>
              </div>
            </section>
          </div>
        )}

        {/* ============================================
            خلاصه حرفه‌ای
            ============================================ */}
        {activeStep === "summary" && (
          <div className={`${styles.sectionWrapper} ${styles.miniPanel}`}>
            <div className={styles.sectionHeader}>
              <h3>خلاصه حرفه‌ای</h3>
            </div>
            <div className={styles.subForm}>
              <div className={styles.formGroup}>
                <label>معرفی کوتاه</label>
                <p className={styles.hint}>
                  ۲ تا ۳ خط درباره تخصص‌ها و اهدافتان بنویسید.
                </p>
                <textarea
                  value={formData.summary}
                  onChange={(e) => handleChange("summary", e.target.value)}
                  rows={5}
                  placeholder="مثلاً: کارشناس فروش با ۵ سال سابقه در حوزه تجهیزات صنعتی..."
                />
              </div>
            </div>
          </div>
        )}

        {/* ============================================
            بخش‌های زیرمجموعه
            ============================================ */}
        {activeStep === "work" && (
          <WorkExperienceSection resume={resume} onRefresh={onSaved} />
        )}
        {activeStep === "education" && (
          <EducationSection resume={resume} onRefresh={onSaved} />
        )}
        {activeStep === "skills" && (
          <SkillsSection resume={resume} onRefresh={onSaved} />
        )}
        {activeStep === "languages" && (
          <LanguagesSection resume={resume} onRefresh={onSaved} />
        )}
        {activeStep === "certificates" && (
          <CertificatesSection resume={resume} onRefresh={onSaved} />
        )}
        {activeStep === "projects" && (
          <ProjectsSection resume={resume} onRefresh={onSaved} />
        )}
        {activeStep === "awards" && (
          <AwardsSection resume={resume} onRefresh={onSaved} />
        )}
        {activeStep === "interests" && (
          <InterestsSection resume={resume} onRefresh={onSaved} />
        )}
      </div>

      {/* Footer */}
      <div className={styles.footer}>
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
          <button
            type="button"
            className={styles.saveBtn}
            onClick={handleSaveBasicInfo}
            disabled={saving}
          >
            {saving ? (
              <Loader2 size={16} className={styles.spin} />
            ) : (
              <Save size={16} />
            )}
            <span>{saving ? "در حال ذخیره..." : "ذخیره اطلاعات پایه"}</span>
          </button>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div
          className={`${styles.toast} ${
            toast.type === "error" ? styles.toastError : ""
          }`}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
};

export default ResumeForm;