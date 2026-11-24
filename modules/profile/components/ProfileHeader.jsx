// modules/profile/components/ProfileHeader.jsx
"use client";

import { useState, useRef, useEffect, useCallback, useMemo, memo } from "react";
import Image from "next/image";
import Link from "next/link";
import axios from "axios";
import Config from "@/config/config";
import { useAuth } from "@/contexts/AuthContext";
import { getFullImageUrl } from "@/utils/imageUrl";
import { goHomeHash } from "@/utils/goHomeHash";
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
  ShoppingBag,
  Store,
  Package,
  CalendarCheck,
  Wrench,
  GraduationCap,
  Boxes,
  Cloud,
  Calculator,
  MessageCircle,
  Plus,
  HandCoins,
  BarChart3,
  Monitor,
  Activity,
  Warehouse,
  Dumbbell,
  Users,
  LayoutDashboard,
  ArrowDownToLine,
  ClipboardList,
  Radar,
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

const VARIANT_META = {
  job: {
    welcome: "حساب کاریابی",
    headerClass: "headerJob",
    shortcuts: [
      { href: "/profile?tab=resume", label: "رزومه", icon: FileText },
      { href: "/profile?tab=company", label: "شرکت", icon: Building2 },
      { href: "/profile?tab=hiring", label: "آگهی‌ها", icon: Briefcase },
      { href: "/post-job", label: "ثبت آگهی", icon: Plus, primary: true },
    ],
  },
  shop: {
    welcome: "حساب خریدار",
    headerClass: "headerShop",
    shortcuts: [
      { href: "/profile?tab=orders", label: "سفارش‌ها", icon: Package },
      { href: "/cart", label: "سبد", icon: ShoppingBag },
      { href: "/shop", label: "فروشگاه", icon: Store },
      { href: "/dashboard/my-shop", label: "فروشگاه من", icon: Store, primary: true },
    ],
  },
  booking: {
    welcome: "حساب نوبت‌دهی",
    headerClass: "headerBooking",
    shortcuts: [
      { href: "/profile?tab=bookings", label: "نوبت‌ها", icon: CalendarCheck },
      { href: "/booking", label: "رزرو", icon: CalendarCheck, primary: true },
    ],
  },
  repairs: {
    welcome: "حساب تعمیرات",
    headerClass: "headerRepairs",
    shortcuts: [
      { href: "/profile?tab=requests", label: "سفارش‌ها", icon: Wrench },
      { href: "/repairs", label: "سرویس", icon: Wrench, primary: true },
      { href: "/repairs?tab=track", label: "پیگیری", icon: Wrench },
    ],
  },
  school: {
    welcome: "حساب مدرسه",
    headerClass: "headerSchool",
    shortcuts: [],
  },
  rebo: {
    welcome: "پروفایل ربو",
    headerClass: "headerRebo",
    shortcuts: [
      { href: "/profile?tab=desk", label: "میزکار", icon: LayoutDashboard, primary: true },
      { href: "/#rebo-cost", label: "بسته", icon: Calculator },
      { href: "/profile?tab=cart", label: "سبد", icon: Boxes },
      { href: "/profile?tab=cloud", label: "سرور", icon: Cloud },
      { href: "/profile?tab=account", label: "حساب", icon: UserRound },
    ],
  },
  basic: {
    welcome: "",
    headerClass: "headerBasic",
    shortcuts: [],
  },
  sadra: {
    welcome: "مرکز صدرا",
    headerClass: "headerSadra",
    shortcuts: [
      { href: "/profile?tab=shop", label: "سفارش‌ها", icon: Package },
      { href: "/booking", label: "نوبت", icon: CalendarCheck, primary: true },
      { href: "/shop", label: "قطعات", icon: Store },
    ],
  },
  crm: {
    welcome: "پروفایل CRM",
    headerClass: "headerBasic",
    shortcuts: [
      { href: "/sale", label: "فروش", icon: HandCoins, primary: true },
      { href: "/sale/analytics", label: "آنالیتیکس", icon: BarChart3 },
      { href: "/rasad", label: "رصد", icon: Radar },
      { href: "/sale/monitor", label: "مانیتور", icon: Monitor },
    ],
  },
  inventory: {
    welcome: "پروفایل انبار",
    headerClass: "headerBasic",
    shortcuts: [
      { href: "/inventory", label: "انبار", icon: Warehouse, primary: true },
      { href: "/inventory/products", label: "کالا", icon: Package },
      { href: "/inventory/in", label: "ورود", icon: ArrowDownToLine },
      { href: "/inventory/vouchers", label: "حواله", icon: ClipboardList },
    ],
  },
  gym_bodybuilding: {
    welcome: "پروفایل باشگاه بدنسازی",
    headerClass: "headerGym",
    shortcuts: [
      { href: "/gym/profile?tab=manage", label: "مدیریت", icon: LayoutDashboard, primary: true },
      { href: "/gym/profile?tab=membership", label: "عضویت", icon: Dumbbell },
      { href: "/cart", label: "سبد", icon: ShoppingBag },
      { href: "/gym/profile?tab=orders", label: "سفارش‌ها", icon: Package },
    ],
  },
};

const ProfileHeader = memo(function ProfileHeader({
  user,
  variant = "job",
  showJobShortcuts = true,
  showShortcuts,
  welcome,
  shortcuts,
  roleChip = null,
  footer = null,
  actionsExtra = null,
  /** فقط نوار تب/اکشن — بدون کارت پروفایل شلوغ */
  chromeOnly = false,
}) {
  const isBasic = variant === "basic";
  const meta = VARIANT_META[variant] || VARIANT_META.job;
  const welcomeText = welcome ?? meta.welcome;
  const canShowShortcuts =
    showShortcuts !== undefined ? showShortcuts : showJobShortcuts;
  const shortcutItems = shortcuts ?? meta.shortcuts;
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
    () =>
      user?.date_joined
        ? moment(user.date_joined).format("jYYYY/jMM/jDD")
        : "—",
    [user?.date_joined]
  );

  const greeting = useMemo(() => getGreeting(), []);
  const profileImageUrl = getFullImageUrl(user?.image);
  const showImage = Boolean(profileImageUrl && !imageError);

  const completeness = useMemo(() => {
    const checks = [
      {
        key: "name",
        ok: !!(user?.first_name && user?.last_name),
        label: "نام",
      },
      { key: "email", ok: !!user?.email, label: "ایمیل" },
      { key: "photo", ok: showImage, label: "عکس" },
      { key: "mobile", ok: !!user?.mobile, label: "موبایل" },
    ];
    const done = checks.filter((c) => c.ok).length;
    const percent = Math.round((done / checks.length) * 100);
    return { checks, done, total: checks.length, percent };
  }, [
    user?.first_name,
    user?.last_name,
    user?.email,
    user?.mobile,
    showImage,
  ]);

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
        showMessage("success", "اطلاعات ذخیره شد");
        setIsEditing(false);
        if (refreshTokens) await refreshTokens();
      } else {
        showMessage("error", "خطا در ذخیره اطلاعات");
      }
    } catch (err) {
      showMessage(
        "error",
        err.response?.data?.message || "خطا در ارتباط با سرور"
      );
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
      showMessage("error", "حجم تصویر حداکثر ۵ مگابایت");
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
        showMessage("success", "تصویر بروزرسانی شد");
        setImageError(false);
        if (refreshTokens) await refreshTokens();
      } else {
        showMessage("error", "خطا در آپلود تصویر");
      }
    } catch (err) {
      showMessage(
        "error",
        err.response?.data?.message || "خطا در آپلود تصویر"
      );
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

  const openFilePicker = () => fileInputRef.current?.click();
  const headerTone = styles[meta.headerClass] || styles.headerJob;
  const showCompleteness = !isBasic && completeness.percent < 100;
  const ringSize = 84;
  const ringStroke = 3;
  const ringRadius = (ringSize - ringStroke) / 2;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringOffset =
    ringCircumference * (1 - Math.min(100, Math.max(0, completeness.percent)) / 100);

  if (chromeOnly) {
    return (
      <header
        className={`${styles.header} ${headerTone} ${styles.headerChromeOnly}`}
      >
        <div className={styles.body}>
          {actionsExtra ? (
            <div className={styles.chromeOnlyActions}>{actionsExtra}</div>
          ) : null}
          {footer ? <div className={styles.headerFooter}>{footer}</div> : null}
        </div>
      </header>
    );
  }

  return (
    <header className={`${styles.header} ${headerTone}`}>
      <div className={styles.accentBar} aria-hidden />

      <div className={styles.body}>
        {!isEditing ? (
          <>
            <div className={styles.mainRow}>
              <div
                className={`${styles.avatarBlock} ${
                  showCompleteness ? styles.avatarBlockRing : ""
                }`}
              >
                <div className={styles.avatarStage}>
                  {showCompleteness ? (
                    <>
                      <svg
                        className={styles.progressRing}
                        width={ringSize}
                        height={ringSize}
                        viewBox={`0 0 ${ringSize} ${ringSize}`}
                        role="progressbar"
                        aria-valuenow={completeness.percent}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label={`تکمیل پروفایل ${completeness.percent} درصد`}
                      >
                        <defs>
                          <linearGradient
                            id="profileProgressGrad"
                            x1="0%"
                            y1="0%"
                            x2="100%"
                            y2="100%"
                          >
                            <stop offset="0%" stopColor="#F4AE52" />
                            <stop offset="100%" stopColor="#D4621A" />
                          </linearGradient>
                        </defs>
                        <circle
                          className={styles.progressRingTrack}
                          cx={ringSize / 2}
                          cy={ringSize / 2}
                          r={ringRadius}
                          fill="none"
                          strokeWidth={ringStroke}
                        />
                        <circle
                          className={styles.progressRingValue}
                          cx={ringSize / 2}
                          cy={ringSize / 2}
                          r={ringRadius}
                          fill="none"
                          stroke="url(#profileProgressGrad)"
                          strokeWidth={ringStroke}
                          strokeDasharray={ringCircumference}
                          strokeDashoffset={ringOffset}
                          strokeLinecap="round"
                          transform={`rotate(-90 ${ringSize / 2} ${ringSize / 2})`}
                        />
                      </svg>
                      <span
                        className={styles.progressBadge}
                        title={`تکمیل پروفایل ${completeness.percent}٪`}
                      >
                        {completeness.percent}٪
                      </span>
                    </>
                  ) : null}

                  <button
                    type="button"
                    className={styles.avatarBtn}
                    onClick={openFilePicker}
                    disabled={uploadingImage}
                    aria-label="تغییر تصویر پروفایل"
                  >
                    <span className={styles.avatar}>
                      {showImage ? (
                        <Image
                          src={profileImageUrl}
                          alt={displayName}
                          width={72}
                          height={72}
                          className={styles.avatarImage}
                          unoptimized
                          onError={() => setImageError(true)}
                          priority
                        />
                      ) : (
                        <span className={styles.avatarPlaceholder}>
                          {initials}
                        </span>
                      )}
                      {uploadingImage ? (
                        <span className={styles.avatarBusy}>
                          <Loader2 size={18} className={styles.spin} />
                        </span>
                      ) : null}
                    </span>
                  </button>

                  <button
                    type="button"
                    className={styles.cameraBtn}
                    onClick={openFilePicker}
                    disabled={uploadingImage}
                    aria-label="آپلود تصویر"
                    title="تغییر عکس"
                  >
                    {uploadingImage ? (
                      <Loader2 size={13} className={styles.spin} />
                    ) : (
                      <Camera size={13} strokeWidth={2.25} />
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

                {roleChip ? (
                  <div className={styles.roleChipWrap}>{roleChip}</div>
                ) : null}
              </div>

              <div className={styles.identity}>
                <div className={styles.titleRow}>
                  <div className={styles.titleText}>
                    {!isBasic ? (
                      <p className={styles.greeting}>
                        <UserRound size={12} strokeWidth={2.25} aria-hidden />
                        <span>{greeting}</span>
                        {welcomeText ? (
                          <>
                            <span className={styles.dot} aria-hidden />
                            <span>{welcomeText}</span>
                          </>
                        ) : null}
                      </p>
                    ) : null}
                    <h1 className={styles.name}>{displayName}</h1>
                  </div>

                  <div className={styles.actions}>
                    <div className={styles.actionsTop}>
                      {showCompleteness ? (
                        <div
                          className={styles.completeChips}
                          aria-label="وضعیت تکمیل پروفایل"
                        >
                          {completeness.checks.map((c) => (
                            <span
                              key={c.key}
                              className={`${styles.chip} ${
                                c.ok ? styles.chipOk : styles.chipMiss
                              }`}
                              title={c.ok ? `${c.label} تکمیل` : `${c.label} ناقص`}
                            >
                              {c.ok ? (
                                <Check size={10} strokeWidth={2.5} />
                              ) : (
                                <X size={10} strokeWidth={2.5} />
                              )}
                              {c.label}
                            </span>
                          ))}
                        </div>
                      ) : null}
                      <button
                        type="button"
                        className={styles.editBtn}
                        onClick={() => setIsEditing(true)}
                      >
                        <Pencil size={14} strokeWidth={2.2} />
                        <span>ویرایش</span>
                      </button>
                    </div>
                    {actionsExtra ? (
                      <div className={styles.actionsExtra}>{actionsExtra}</div>
                    ) : null}
                  </div>
                </div>

                {!isBasic ? (
                  <div className={styles.metaRow}>
                    {user?.mobile ? (
                      <button
                        type="button"
                        className={styles.metaItem}
                        onClick={() => handleCopy("mobile", user.mobile)}
                        title="کپی شماره"
                      >
                        <Phone size={13} strokeWidth={2.2} aria-hidden />
                        <span dir="ltr">{user.mobile}</span>
                        {copied === "mobile" ? (
                          <CheckCheck size={12} className={styles.copyOk} />
                        ) : (
                          <Copy size={12} className={styles.copyIcon} />
                        )}
                      </button>
                    ) : (
                      <span className={`${styles.metaItem} ${styles.metaMuted}`}>
                        <Phone size={13} strokeWidth={2.2} aria-hidden />
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
                        <Mail size={13} strokeWidth={2.2} aria-hidden />
                        <span dir="ltr">{user.email}</span>
                        {copied === "email" ? (
                          <CheckCheck size={12} className={styles.copyOk} />
                        ) : (
                          <Copy size={12} className={styles.copyIcon} />
                        )}
                      </button>
                    ) : (
                      <button
                        type="button"
                        className={`${styles.metaItem} ${styles.metaWarn}`}
                        onClick={() => setIsEditing(true)}
                      >
                        <Mail size={13} strokeWidth={2.2} aria-hidden />
                        افزودن ایمیل
                      </button>
                    )}

                    <span className={styles.metaItem}>
                      <Calendar size={13} strokeWidth={2.2} aria-hidden />
                      از {joinDate}
                    </span>
                  </div>
                ) : null}
              </div>
            </div>

            {!isBasic && canShowShortcuts && shortcutItems.length ? (
              <nav className={styles.quickNav} aria-label="میانبرهای پروفایل">
                {shortcutItems.map((item) => {
                  const Icon = item.icon || Package;
                  const className = `${styles.quickLink} ${
                    item.primary ? styles.quickPrimary : ""
                  }`;
                  const hashMatch = String(item.href || "").match(
                    /^\/?#([\w-]+)$/
                  );
                  if (hashMatch) {
                    return (
                      <button
                        key={item.href + item.label}
                        type="button"
                        className={className}
                        onClick={() => goHomeHash(hashMatch[1])}
                      >
                        <Icon size={15} strokeWidth={2.2} />
                        <span>{item.label}</span>
                      </button>
                    );
                  }
                  return (
                    <Link
                      key={item.href + item.label}
                      href={item.href}
                      className={className}
                    >
                      <Icon size={15} strokeWidth={2.2} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            ) : null}

            {footer ? <div className={styles.headerFooter}>{footer}</div> : null}
          </>
        ) : (
          <div className={styles.editForm}>
            <div className={styles.editHead}>
              <div className={styles.editAvatarSide}>
                <button
                  type="button"
                  className={styles.avatarBtn}
                  onClick={openFilePicker}
                  disabled={uploadingImage}
                  aria-label="تغییر تصویر پروفایل"
                >
                  <span className={styles.avatar}>
                    {showImage ? (
                      <Image
                        src={profileImageUrl}
                        alt={displayName}
                        width={72}
                        height={72}
                        className={styles.avatarImage}
                        unoptimized
                        onError={() => setImageError(true)}
                      />
                    ) : (
                      <span className={styles.avatarPlaceholder}>
                        {initials}
                      </span>
                    )}
                  </span>
                </button>
                <button
                  type="button"
                  className={styles.cameraBtn}
                  onClick={openFilePicker}
                  disabled={uploadingImage}
                  aria-label="آپلود تصویر"
                >
                  <Camera size={13} strokeWidth={2.25} />
                </button>
              </div>
              <div>
                <h2>ویرایش اطلاعات</h2>
                <p>نام، نام‌خانوادگی و ایمیل را بروزرسانی کنید</p>
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="profile-first-name">نام</label>
                <input
                  id="profile-first-name"
                  type="text"
                  value={formData.first_name}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      first_name: e.target.value,
                    }))
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
                    setFormData((prev) => ({
                      ...prev,
                      last_name: e.target.value,
                    }))
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
                    setFormData((prev) => ({
                      ...prev,
                      email: e.target.value,
                    }))
                  }
                  placeholder="example@mail.com"
                  dir="ltr"
                  autoComplete="email"
                />
              </div>
            </div>

            {user?.mobile ? (
              <p className={styles.mobileHint}>
                موبایل: <span dir="ltr">{user.mobile}</span>
                <em> — از این بخش قابل تغییر نیست</em>
              </p>
            ) : null}

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
                  <Check size={14} strokeWidth={2.3} />
                )}
                <span>ذخیره</span>
              </button>

              <button
                className={styles.cancelBtn}
                type="button"
                onClick={cancelEdit}
                disabled={saving}
              >
                <X size={14} strokeWidth={2.3} />
                <span>انصراف</span>
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className={styles.fileInput}
            />
          </div>
        )}

        {message ? (
          <div
            className={`${styles.message} ${
              message.type === "success" ? styles.msgSuccess : styles.msgError
            }`}
            role="status"
          >
            {message.text}
          </div>
        ) : null}
      </div>
    </header>
  );
});

export default ProfileHeader;
