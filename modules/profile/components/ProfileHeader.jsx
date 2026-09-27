// modules/profile/components/ProfileHeader.jsx
"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
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
} from "lucide-react";
import moment from "moment-jalaali";

moment.loadPersian({ dialect: "persian-modern" });

const ProfileHeader = ({ user }) => {
  const { getAuthHeaders, refreshTokens } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [message, setMessage] = useState(null);
  const [imageError, setImageError] = useState(false);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
    email: user?.email || "",
  });

  // ✅ sync formData وقتی user عوض شد
  useEffect(() => {
    setFormData({
      first_name: user?.first_name || "",
      last_name: user?.last_name || "",
      email: user?.email || "",
    });
  }, [user?.first_name, user?.last_name, user?.email]);

  // ✅ ریست خطای تصویر وقتی user.image عوض شد
  useEffect(() => {
    setImageError(false);
  }, [user?.image]);

  const getInitials = () => {
    const first = user?.first_name?.[0] || "";
    const last = user?.last_name?.[0] || "";
    return (first + last).toUpperCase() || user?.mobile?.slice(0, 2) || "U";
  };

  const getDisplayName = () => {
    if (user?.first_name && user?.last_name)
      return `${user.first_name} ${user.last_name}`;
    if (user?.first_name) return user.first_name;
    if (user?.last_name) return user.last_name;
    return "کاربر عزیز";
  };

  const joinDate = user?.date_joined
    ? moment(user.date_joined).format("jYYYY/jMM/jDD")
    : "—";

  // ✅ URL نهایی تصویر
  const profileImageUrl = getFullImageUrl(user?.image);
  const showImage = profileImageUrl && !imageError;

  // ✅ ذخیره اطلاعات
  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage(null);

      const res = await axios.post(
        Config.endpoints.login("profile/update"),
        formData,
        { headers: getAuthHeaders() }
      );

      if (res.data?.status === "ok") {
        setMessage({ type: "success", text: "اطلاعات با موفقیت ذخیره شد" });
        setIsEditing(false);
        if (refreshTokens) await refreshTokens();
      } else {
        setMessage({ type: "error", text: "خطا در ذخیره اطلاعات" });
      }
    } catch (err) {
      console.error(err);
      setMessage({
        type: "error",
        text: err.response?.data?.message || "خطا در ارتباط با سرور",
      });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  // ✅ آپلود تصویر
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setMessage({ type: "error", text: "فقط فایل تصویری مجاز است" });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage({
        type: "error",
        text: "حجم تصویر نباید بیشتر از ۵ مگابایت باشد",
      });
      return;
    }

    try {
      setUploadingImage(true);
      setMessage(null);

      const fd = new FormData();
      fd.append("image", file);

      const res = await axios.post(
        Config.endpoints.login("profile/update"),
        fd,
        {
          headers: {
            ...getAuthHeaders(),
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (res.data?.status === "ok") {
        setMessage({ type: "success", text: "تصویر با موفقیت بروزرسانی شد" });
        setImageError(false); // ✅ ریست خطا
        if (refreshTokens) await refreshTokens();
      }
    } catch (err) {
      console.error(err);
      setMessage({
        type: "error",
        text: err.response?.data?.message || "خطا در آپلود تصویر",
      });
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setTimeout(() => setMessage(null), 3000);
    }
  };

  return (
    <div className={styles.header}>
      <div className={styles.headerBg} />

      <div className={styles.headerContent}>
        {/* تصویر پروفایل */}
        <div className={styles.avatarWrapper}>
          <div className={styles.avatar}>
            {showImage ? (
              <Image
                src={profileImageUrl}
                alt={getDisplayName()}
                width={110}
                height={110}
                className={styles.avatarImage}
                unoptimized
                onError={() => setImageError(true)}
                priority
              />
            ) : (
              <div className={styles.avatarPlaceholder}>{getInitials()}</div>
            )}
          </div>

          <button
            className={styles.cameraBtn}
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingImage}
            aria-label="تغییر تصویر"
            type="button"
          >
            {uploadingImage ? (
              <Loader2 size={16} className={styles.spin} />
            ) : (
              <Camera size={16} />
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

        {/* اطلاعات */}
        <div className={styles.info}>
          {!isEditing ? (
            <>
              <div className={styles.nameRow}>
                <h1 className={styles.name}>{getDisplayName()}</h1>
                <button
                  className={styles.editBtn}
                  onClick={() => setIsEditing(true)}
                  type="button"
                >
                  ویرایش پروفایل
                </button>
              </div>

              <div className={styles.metaRow}>
                <span className={styles.metaItem}>
                  <Phone size={14} />
                  <span dir="ltr">{user?.mobile || "—"}</span>
                </span>

                {user?.email && (
                  <span className={styles.metaItem}>
                    <Mail size={14} />
                    <span dir="ltr">{user.email}</span>
                  </span>
                )}

                <span className={styles.metaItem}>
                  <Calendar size={14} />
                  عضویت: {joinDate}
                </span>
              </div>
            </>
          ) : (
            <div className={styles.editForm}>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>نام</label>
                  <input
                    type="text"
                    value={formData.first_name}
                    onChange={(e) =>
                      setFormData({ ...formData, first_name: e.target.value })
                    }
                    placeholder="نام"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>نام خانوادگی</label>
                  <input
                    type="text"
                    value={formData.last_name}
                    onChange={(e) =>
                      setFormData({ ...formData, last_name: e.target.value })
                    }
                    placeholder="نام خانوادگی"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>ایمیل</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="example@mail.com"
                    dir="ltr"
                  />
                </div>
              </div>

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
                  <span>ذخیره</span>
                </button>

                <button
                  className={styles.cancelBtn}
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setFormData({
                      first_name: user?.first_name || "",
                      last_name: user?.last_name || "",
                      email: user?.email || "",
                    });
                  }}
                >
                  <X size={14} />
                  <span>لغو</span>
                </button>
              </div>
            </div>
          )}

          {message && (
            <div
              className={`${styles.message} ${
                message.type === "success" ? styles.msgSuccess : styles.msgError
              }`}
            >
              {message.text}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;