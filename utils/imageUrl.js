// utils/imageUrl.js
import Config from "@/config/config";

/**
 * ساخت URL کامل برای فایل‌های مدیا
 * @param {string} path - مسیر فایل (ممکن است نسبی یا کامل باشد)
 * @returns {string|null} - URL کامل یا null
 */
export const getFullImageUrl = (path) => {
  if (!path) return null;
  if (typeof path !== "string") return null;

  // اگر از قبل کامل است
  if (
    path.startsWith("http://") ||
    path.startsWith("https://") ||
    path.startsWith("data:") ||
    path.startsWith("blob:")
  ) {
    return path;
  }

  // ساخت URL کامل با baseUrl
  const baseUrl = (Config.baseUrl || "").replace(/\/$/, "");
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
};

/**
 * ساخت URL کامل برای تصویر پروفایل
 */
export const getProfileImageUrl = (image) => {
  return getFullImageUrl(image);
};

/**
 * استخراج مسیر نسبی از URL کامل (برای ارسال به بک‌اند اگر لازم شد)
 */
export const getRelativePath = (url) => {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://")) {
    try {
      const u = new URL(url);
      return u.pathname;
    } catch {
      return url;
    }
  }
  return url;
};