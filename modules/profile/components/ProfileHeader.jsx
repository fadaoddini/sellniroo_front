// modules/profile/components/ProfileHeader.jsx
"use client";

import { useState, useRef, useEffect, useCallback, useMemo, memo } from "react";
import Image from "next/image";
import Link from "next/link";
import axios from "axios";
import Config from "@/config/config";
import { useAuth } from "@/contexts/AuthContext";
import { getFullImageUrl } from "@/utils/imageUrl";
import styles from "../styles/ProfileHeader.module.css";
import {
  Mail,
  Phone,
  Camera,
  Loader2,
  Check,
  X,
  Calendar,
  Pencil,
  Copy,
  CheckCheck,
  FileText,
  Building2,
  Briefcase,
  UserRound,
} from "lucide-react";
import moment from "moment-jalaali";

moment.loadPersian({ dialect: "persian-modern", usePersianDigits: false });

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "صبح بخیر";
  if (hour < 17) return "ظهر بخیر";
  if (hour < 21) return "عصر بخیر";
  return "شب بخیر";
};

const ProfileHeader = memo(function ProfileHeader({
  user,
  /** job = کاریابی | basic = حساب شخصی */
  variant = 'job',
  /** میانبرهای رزومه/شرکت/آگهی — فقط در پروفایل کاریابی */
  showJobShortcuts = true,
}) {
  const isBasic = variant === 'basic'
  const { getAuthHeaders, refreshTokens } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [message, setMessage] = useState(null);
  const [imageError, setImageError] = useState(false);
  const [copied, setCopied] = useState(null);
  const fileInputRef = useRef(null);
  const messageTimer = useRef(null);
  const copyTimer = useRef(null);

  const [formData, setFormData] = useState({
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
    email: user?.email || "",
  });

  useEffect(() => {
    setFormData({
      first_name: user?.first_name || "",
      last_name: user?.last_name || "",
      email: user?.email || "",
    });
  }, [user?.first_name, user?.last_name, user?.email]);

  useEffect(() => {
    setImageError(false);
  }, [user?.image]);

  useEffect(() => {
    return () => {
      if (messageTimer.current) clearTimeout(messageTimer.current);
      if (copyTimer.current) clearTimeout(copyTimer.current);
    };
  }, []);

  const showMessage = useCallback((type, text) => {
    setMessage({ type, text });
    if (messageTimer.current) clearTimeout(messageTimer.current);
    messageTimer.current = setTimeout(() => setMessage(null), 3200);
  }, []);

  const initials = useMemo(() => {
    const first = user?.first_name?.[0] || "";
    const last = user?.last_name?.[0] || "";
    return (first + last).toUpperCase() || user?.mobile?.slice(-2) || "U";
  }, [user?.first_name, user?.last_name, user?.mobile]);

  const displayName = useMemo(() => {
    if (user?.first_name && user?.last_name) {
      return `${user.first_name} ${user.last_name}`;
    }
    return user?.first_name || user?.last_name || "کاربر عزیز";
  }, [user?.first_name, user?.last_name]);

  const joinDate = useMemo(
    () => (user?.date_joined ? moment(user.date_joined).format("jYYYY/jMM/jDD") : "—"),
    [user?.date_joined]
  );

  const greeting = useMemo(() => getGreeting(), []);

  const profileImageUrl = getFullImageUrl(user?.image);
  const showImage = Boolean(profileImageUrl && !imageError);

  const completeness = useMemo(() => {
    const checks = [
      { key: "name", ok: !!(user?.first_name && user?.last_name), label: "نام کامل" },
      { key: "email", ok: !!user?.email, label: "ایمیل" },
      { key: "photo", ok: showImage, label: "عکس" },
      { key: "mobile", ok: !!user?.mobile, label: "موبایل" },
    ];
    const done = checks.filter((c) => c.ok).length;
    const percent = Math.round((done / checks.length) * 100);
    return { checks, done, total: checks.length, percent };
  }, [user?.first_name, user?.last_name, user?.email, user?.mobile, showImage]);

  const handleCopy = async (key, value) => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(key);
      if (copyTimer.current) clearTimeout(copyTimer.current);
      copyTimer.current = setTimeout(() => setCopied(null), 1800);
    } catch {
      showMessage("error", "کپی نشد؛ دوباره تلاش کنید");
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const res = await axios.post(
        Config.endpoints.login("profile/update"),
        {
          first_name: formData.first_name.trim(),
          last_name: formData.last_name.trim(),
          email: formData.email.trim(),
        },
        { headers: getAuthHeaders() }
      );

      if (res.data?.status === "ok") {
        showMessage("success", "اطلاعات با موفقیت ذخیره شد");
        setIsEditing(false);
        if (refreshTokens) await refreshTokens();
      } else {
        showMessage("error", "خطا در ذخیره اطلاعات");
      }
    } catch (err) {
      showMessage("error", err.response?.data?.message || "خطا در ارتباط با سرور");
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showMessage("error", "فقط فایل تصویری مجاز است");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showMessage("error", "حجم تصویر نباید بیشتر از ۵ مگابایت باشد");
      return;
    }

    try {
      setUploadingImage(true);
      const fd = new FormData();
      fd.append("image", file);

      const res = await axios.post(
        Config.endpoints.login("profile/update"),
        fd,
        { headers: getAuthHeaders() }
      );

      if (res.data?.status === "ok") {
        showMessage("success", "تصویر با موفقیت بروزرسانی شد");
        setImageError(false);
        if (refreshTokens) await refreshTokens();
      } else {
        showMessage("error", "خطا در آپلود تصویر");
      }
    } catch (err) {
      showMessage("error", err.response?.data?.message || "خطا در آپلود تصویر");
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setFormData({
      first_name: user?.first_name || "",
      last_name: user?.last_name || "",
      email: user?.email || "",
    });
  };

  return (
    <header
      className={`${styles.header} ${isBasic ? styles.headerBasic : styles.headerJob}`}
    >
      <div
        className={`${styles.cover} ${isBasic ? styles.coverBasic : ''}`}
        aria-hidden
      >
        <div className={styles.coverGlow} />
        <div className={styles.coverPattern} />
      </div>

      <div className={styles.headerContent}>
        <div className={styles.topRow}>
          <div className={styles.avatarWrapper}>
            <button
              type="button"
              className={styles.avatarBtn}
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingImage}
              aria-label="تغییر تصویر پروفایل"
            >
              <div className={styles.avatar}>
                {showImage ? (
                  <Image
                    src={profileImageUrl}
                    alt={displayName}
                    width={120}
                    height={120}
                    className={styles.avatarImage}
                    unoptimized
                    onError={() => setImageError(true)}
                    priority
                  />
                ) : (
                  <div className={styles.avatarPlaceholder}>{initials}</div>
                )}
                <span className={styles.avatarOverlay}>
                  {uploadingImage ? (
                    <Loader2 size={18} className={styles.spin} />
                  ) : (
                    <>
                      <Camera size={16} />
                      <span>تغییر عکس</span>
                    </>
                  )}
                </span>
              </div>
            </button>

            <button
              type="button"
              className={styles.cameraBtn}
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingImage}
              aria-label="آپلود تصویر"
            >
              {uploadingImage ? (
                <Loader2 size={14} className={styles.spin} />
              ) : (
                <Camera size={14} />
              )}
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className={styles.fileInput}
            />
          </div>

          <div className={styles.info}>
            {!isEditing ? (
              <>
                <div className={styles.nameRow}>
                  <div className={styles.nameBlock}>
                    <p className={styles.greeting}>
                      <UserRound size={13} aria-hidden />
                      {greeting}
                    </p>
                    <h1 className={styles.name}>{displayName}</h1>
                    <p className={styles.welcome}>
                      {isBasic
                        ? 'حساب کاربری شخصی شما'
                        : 'پنل کاریابی و مدیریت آگهی‌ها'}
                    </p>
                  </div>

                  <div className={styles.headerActions}>
                    <button
                      className={styles.editBtn}
                      onClick={() => setIsEditing(true)}
                      type="button"
                    >
                      <Pencil size={14} />
                      ویرایش پروفایل
                    </button>
                  </div>
                </div>

                <div className={styles.metaRow}>
                  {user?.mobile ? (
                    <button
                      type="button"
                      className={styles.metaItem}
                      onClick={() => handleCopy("mobile", user.mobile)}
                      title="کپی شماره"
                    >
                      <Phone size={14} aria-hidden />
                      <span dir="ltr">{user.mobile}</span>
                      {copied === "mobile" ? (
                        <CheckCheck size={13} className={styles.copyOk} />
                      ) : (
                        <Copy size={13} className={styles.copyIcon} />
                      )}
                    </button>
                  ) : (
                    <span className={`${styles.metaItem} ${styles.metaMuted}`}>
                      <Phone size={14} aria-hidden />
                      موبایل ثبت نشده
                    </span>
                  )}

                  {user?.email ? (
                    <button
                      type="button"
                      className={styles.metaItem}
                      onClick={() => handleCopy("email", user.email)}
                      title="کپی ایمیل"
                    >
                      <Mail size={14} aria-hidden />
                      <span dir="ltr">{user.email}</span>
                      {copied === "email" ? (
                        <CheckCheck size={13} className={styles.copyOk} />
                      ) : (
                        <Copy size={13} className={styles.copyIcon} />
                      )}
                    </button>
                  ) : (
                    <button
                      type="button"
                      className={`${styles.metaItem} ${styles.metaWarn}`}
                      onClick={() => setIsEditing(true)}
                    >
                      <Mail size={14} aria-hidden />
                      افزودن ایمیل
                    </button>
                  )}

                  <span className={styles.metaItem}>
                    <Calendar size={14} aria-hidden />
                    عضویت از {joinDate}
                  </span>
                </div>
              </>
            ) : (
              <div className={styles.editForm}>
                <div className={styles.editHead}>
                  <h2>ویرایش اطلاعات</h2>
                  <p>نام، نام خانوادگی و ایمیل خود را بروزرسانی کنید</p>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label htmlFor="profile-first-name">نام</label>
                    <input
                      id="profile-first-name"
                      type="text"
                      value={formData.first_name}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, first_name: e.target.value }))
                      }
                      placeholder="نام"
                      autoComplete="given-name"
                      autoFocus
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="profile-last-name">نام خانوادگی</label>
                    <input
                      id="profile-last-name"
                      type="text"
                      value={formData.last_name}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, last_name: e.target.value }))
                      }
                      placeholder="نام خانوادگی"
                      autoComplete="family-name"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="profile-email">ایمیل</label>
                    <input
                      id="profile-email"
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, email: e.target.value }))
                      }
                      placeholder="example@mail.com"
                      dir="ltr"
                      autoComplete="email"
                    />
                  </div>
                </div>

                {user?.mobile && (
                  <p className={styles.mobileHint}>
                    شماره موبایل: <span dir="ltr">{user.mobile}</span>
                    <em> (غیرقابل ویرایش از این بخش)</em>
                  </p>
                )}

                <div className={styles.formActions}>
                  <button
                    className={styles.saveBtn}
                    onClick={handleSave}
                    disabled={saving}
                    type="button"
                  >
                    {saving ? (
                      <Loader2 size={14} className={styles.spin} />
                    ) : (
                      <Check size={14} />
                    )}
                    <span>ذخیره تغییرات</span>
                  </button>

                  <button
                    className={styles.cancelBtn}
                    type="button"
                    onClick={cancelEdit}
                    disabled={saving}
                  >
                    <X size={14} />
                    <span>انصراف</span>
                  </button>
                </div>
              </div>
            )}

            {message && (
              <div
                className={`${styles.message} ${
                  message.type === "success" ? styles.msgSuccess : styles.msgError
                }`}
                role="status"
              >
                {message.text}
              </div>
            )}
          </div>
        </div>

        {!isEditing && (
          <div
            className={`${styles.bottomBar} ${
              showJobShortcuts ? '' : styles.bottomBarSolo
            }`}
          >
            <div className={styles.completeBox}>
              <div className={styles.completeHead}>
                <span>تکمیل پروفایل</span>
                <strong>{completeness.percent}٪</strong>
              </div>
              <div className={styles.progressTrack} aria-hidden>
                <div
                  className={`${styles.progressFill} ${
                    isBasic ? styles.progressFillBasic : ''
                  }`}
                  style={{ width: `${completeness.percent}%` }}
                />
              </div>
              <div className={styles.completeChips}>
                {completeness.checks.map((c) => (
                  <span
                    key={c.key}
                    className={`${styles.chip} ${c.ok ? styles.chipOk : styles.chipMiss}`}
                  >
                    {c.ok ? <Check size={11} /> : <X size={11} />}
                    {c.label}
                  </span>
                ))}
              </div>
            </div>

            {showJobShortcuts ? (
              <nav className={styles.quickNav} aria-label="میانبرهای کاریابی">
                <Link href="/profile?tab=resume" className={styles.quickLink}>
                  <FileText size={15} />
                  رزومه من
                </Link>
                <Link href="/profile?tab=company" className={styles.quickLink}>
                  <Building2 size={15} />
                  شرکت من
                </Link>
                <Link href="/profile?tab=hiring" className={styles.quickLink}>
                  <Briefcase size={15} />
                  آگهی‌ها
                </Link>
                <Link
                  href="/post-job"
                  className={`${styles.quickLink} ${styles.quickPrimary}`}
                >
                  ثبت آگهی
                </Link>
              </nav>
            ) : null}
          </div>
        )}
      </div>
    </header>
  );
});

export default ProfileHeader;
