// components/common/breakingnews/BreakingNews.jsx
// ماژول سایت: breaking_news — از /adminweb فعال/غیرفعال می‌شود
"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  memo,
} from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import moment from "moment-jalaali";
import {
  Megaphone,
  Check,
  X,
  LogIn,
  LogOut,
  Phone,
  Settings,
  LayoutDashboard,
  Brain,
  Gamepad2,
  User,
  HandCoins,
  Info,
} from "lucide-react";
import axios from "axios";
import { useAuth } from "@/contexts/AuthContext";
import Config from "@/config/config";
import styles from "./BreakingNews.module.css";

moment.loadPersian({ dialect: "persian-modern", usePersianDigits: false });

const FALLBACK_NEWS = [
  { id: 1, text: "بهترین فرصت‌های شغلی فروش و بازاریابی را با ما پیدا کنید" },
  { id: 2, text: "رزومه خود را ارسال کنید و به تیم حرفه‌ای ما بپیوندید" },
  { id: 3, text: "استخدام بازاریاب و فروشنده حرفه‌ای - شرایط عالی" },
  { id: 4, text: "برای مشاوره شغلی رایگان با ما تماس بگیرید" },
  { id: 5, text: "بیش از ۵۰۰ فرصت شغلی در سراسر کشور" },
];

const WEEK_DAYS = {
  Saturday: "شنبه",
  Sunday: "یکشنبه",
  Monday: "دوشنبه",
  Tuesday: "سه‌شنبه",
  Wednesday: "چهارشنبه",
  Thursday: "پنجشنبه",
  Friday: "جمعه",
};

const MONTH_NAMES = [
  "فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور",
  "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند",
];

const LABELS = {
  login: "ورود",
  consult: "مشاوره شغلی",
  about: "درباره ما",
  logout: "خروج",
  profile: "پروفایل من",
  settings: "تنظیمات",
  dashboard: "داشبورد",
  marketing: "بازاریابی",
  challenge: "چالش مهندسین",
  game: "بازی",
  dearUser: "کاربر عزیز",
};

const PROFILE_LINKS = [
  { href: "/dashboard", icon: LayoutDashboard, label: LABELS.dashboard },
  { href: "/profile", icon: User, label: LABELS.profile },
  { href: "/sale", icon: HandCoins, label: LABELS.marketing },
  { href: "/quiz", icon: Brain, label: LABELS.challenge },
  { href: "/game", icon: Gamepad2, label: LABELS.game },
];

const CONSULT_PHONE = typeof atob === "function" ? atob("MDkxNTEyNDQ4OTg=") : "";

function formatPersianDate(short = false) {
  const m = moment();
  const day = WEEK_DAYS[m.format("dddd")] || m.format("dddd");
  const date = m.jDate();
  const month = MONTH_NAMES[m.jMonth()];
  const year = m.jYear();
  if (short) return `${date} ${month}`;
  return `${day} ${date} ${month} ${year}`;
}

function prefersReducedMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    const apply = () => setIsMobile(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [breakpoint]);

  return isMobile;
}

function usePersianDate(isMobile) {
  const [full, setFull] = useState("");
  const [short, setShort] = useState("");

  useEffect(() => {
    const tick = () => {
      setFull(formatPersianDate(false));
      setShort(formatPersianDate(true));
    };
    tick();

    const now = new Date();
    const msToMidnight =
      new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).getTime() -
      now.getTime() +
      1000;

    let dayTimer;
    const start = setTimeout(() => {
      tick();
      dayTimer = setInterval(tick, 60 * 60 * 1000);
    }, msToMidnight);

    return () => {
      clearTimeout(start);
      if (dayTimer) clearInterval(dayTimer);
    };
  }, []);

  return isMobile ? short : full;
}

function useTypewriter(items, enabled = true) {
  const textRef = useRef(null);
  const cursorRef = useRef(null);
  const indexRef = useRef(0);
  const timersRef = useRef({ interval: null, pause: null, raf: null });

  const clearTimers = useCallback(() => {
    const t = timersRef.current;
    if (t.interval) clearInterval(t.interval);
    if (t.pause) clearTimeout(t.pause);
    if (t.raf) cancelAnimationFrame(t.raf);
    t.interval = t.pause = t.raf = null;
  }, []);

  const setCursorVisible = useCallback((visible) => {
    if (cursorRef.current) {
      cursorRef.current.style.display = visible ? "inline-block" : "none";
    }
  }, []);

  const writeText = useCallback(
    (text) => {
      const el = textRef.current;
      if (!el) return;

      clearTimers();

      if (!enabled || prefersReducedMotion() || !text) {
        el.textContent = text || "";
        setCursorVisible(false);
        timersRef.current.pause = setTimeout(() => {
          indexRef.current = (indexRef.current + 1) % Math.max(items.length, 1);
          writeText(items[indexRef.current]?.text || "");
        }, 4000);
        return;
      }

      el.textContent = "";
      setCursorVisible(true);

      let charIndex = 0;
      const speed = Math.min(90, Math.max(35, 65 - text.length * 0.12));

      timersRef.current.interval = setInterval(() => {
        charIndex += 1;
        el.textContent = text.slice(0, charIndex);

        if (charIndex >= text.length) {
          clearInterval(timersRef.current.interval);
          timersRef.current.interval = null;
          setCursorVisible(false);
          timersRef.current.pause = setTimeout(() => {
            indexRef.current = (indexRef.current + 1) % Math.max(items.length, 1);
            writeText(items[indexRef.current]?.text || "");
          }, 4000);
        }
      }, speed);
    },
    [clearTimers, enabled, items, setCursorVisible]
  );

  useEffect(() => {
    if (!items.length) return undefined;
    indexRef.current = 0;
    writeText(items[0].text);
    return clearTimers;
  }, [items, writeText, clearTimers]);

  return { textRef, cursorRef };
}

const Avatar = memo(function Avatar({ user, imageError, onImageError, size = 28, className, placeholderClass }) {
  const initials = useMemo(() => {
    if (!user) return "U";
    const first = user.first_name?.[0] || "";
    const last = user.last_name?.[0] || "";
    return (first + last).toUpperCase() || user.mobile?.slice(0, 2) || "U";
  }, [user]);

  if (user?.image && !imageError) {
    return (
      <Image
        src={user.image}
        alt={LABELS.profile}
        width={size}
        height={size}
        className={className}
        unoptimized
        onError={onImageError}
      />
    );
  }

  return <div className={placeholderClass}>{initials}</div>;
});

const ProfileMenu = memo(function ProfileMenu({
  user,
  imageError,
  onImageError,
  pathname,
  isMobile,
  onClose,
  onLogout,
}) {
  const displayName =
    user?.display_name ||
    `${user?.first_name || ""} ${user?.last_name || ""}`.trim() ||
    user?.mobile ||
    LABELS.dearUser;

  const isActive = (href) => {
    if (!pathname) return false;
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const iconSize = isMobile ? 20 : 16;

  return (
    <>
      <div className={styles.profileHeader}>
        <div className={styles.profileAvatar}>
          <Avatar
            user={user}
            imageError={imageError}
            onImageError={onImageError}
            size={48}
            className={styles.profileAvatarImage}
            placeholderClass={styles.profileAvatarPlaceholder}
          />
        </div>
        <div className={styles.profileInfo}>
          <h4>{displayName}</h4>
          <p>{user?.mobile}</p>
        </div>
        {isMobile && (
          <button
            type="button"
            className={styles.closeDialogBtn}
            onClick={onClose}
            aria-label="بستن"
          >
            <X size={20} />
          </button>
        )}
      </div>

      <div className={styles.profileDivider} />

      {PROFILE_LINKS.map((item) => {
        const active = isActive(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`${styles.profileMenuItem} ${active ? styles.activeMenuItem : ""}`}
            onClick={onClose}
          >
            <item.icon size={iconSize} />
            <span>{item.label}</span>
            {active && <Check size={14} className={styles.activeCheck} />}
          </Link>
        );
      })}

      <div className={styles.profileDivider} />

      <Link
        href="/settings"
        className={`${styles.profileMenuItem} ${isActive("/settings") ? styles.activeMenuItem : ""}`}
        onClick={onClose}
      >
        <Settings size={iconSize} />
        <span>{LABELS.settings}</span>
      </Link>

      <button
        type="button"
        className={`${styles.profileMenuItem} ${styles.logoutItem}`}
        onClick={onLogout}
      >
        <LogOut size={iconSize} />
        <span>{LABELS.logout}</span>
      </button>
    </>
  );
});

const BreakingNews = () => {
  const { user, isAuthenticated, logout, loading } = useAuth();
  const pathname = usePathname();
  const isMobile = useIsMobile(768);
  const currentDate = usePersianDate(isMobile);

  const [newsItems, setNewsItems] = useState(FALLBACK_NEWS);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [imageError, setImageError] = useState(false);

  const profileDropdownRef = useRef(null);
  const { textRef, cursorRef } = useTypewriter(newsItems, true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await axios.get(Config.endpoints.news.tickers.active());
        const list = Array.isArray(res.data?.data)
          ? res.data.data
          : Array.isArray(res.data)
            ? res.data
            : [];
        if (cancelled || !list.length) return;
        const mapped = list
          .map((item, i) => ({
            id: item.id ?? i,
            text: String(item.text || "").trim(),
          }))
          .filter((item) => item.text);
        if (mapped.length) setNewsItems(mapped);
      } catch {
        // fallback already set
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    setImageError(false);
  }, [user?.image]);

  useEffect(() => {
    if (isMobile) return undefined;

    const handleClickOutside = (event) => {
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target)
      ) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMobile]);

  useEffect(() => {
    if (!(isMobile && isProfileOpen)) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isMobile, isProfileOpen]);

  useEffect(() => {
    if (!isProfileOpen) return undefined;
    const onEsc = (e) => {
      if (e.key === "Escape") setIsProfileOpen(false);
    };
    document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [isProfileOpen]);

  const closeProfile = useCallback(() => setIsProfileOpen(false), []);

  const handleImageError = useCallback(() => setImageError(true), []);

  const handleConsultClick = useCallback(() => {
    if (CONSULT_PHONE) window.location.href = `tel:${CONSULT_PHONE}`;
  }, []);

  const handleLogout = useCallback(async () => {
    await logout();
    setIsProfileOpen(false);
  }, [logout]);

  const toggleProfile = useCallback(() => {
    setIsProfileOpen((open) => !open);
  }, []);

  return (
    <div className={styles.breakingNews}>
      <div className={styles.container}>
        <div className={styles.newsLeft}>
          <div className={styles.newsLabel} aria-hidden="true">
            <Megaphone size={16} className={styles.labelIcon} />
          </div>
          <div className={styles.newsContent} aria-live="polite">
            <span className={styles.newsText}>
              <span ref={textRef} />
              <span ref={cursorRef} className={styles.cursor} aria-hidden="true">
                |
              </span>
            </span>
          </div>
        </div>

        <div className={styles.newsRight}>
          <button
            type="button"
            className={styles.consultButton}
            onClick={handleConsultClick}
            aria-label={LABELS.consult}
          >
            <Phone size={14} />
            <span>{LABELS.consult}</span>
          </button>

          <Link href="/about" className={styles.aboutButton} aria-label={LABELS.about}>
            <Info size={14} />
            <span>{LABELS.about}</span>
          </Link>

          {loading ? (
            <div className={styles.loginButton} style={{ opacity: 0.5 }} aria-hidden="true">
              <span>...</span>
            </div>
          ) : isAuthenticated && user ? (
            <>
              <div className={styles.profileSection} ref={profileDropdownRef}>
                <button
                  type="button"
                  className={styles.profileButton}
                  onClick={toggleProfile}
                  aria-label={LABELS.profile}
                  aria-expanded={isProfileOpen}
                  aria-haspopup="menu"
                >
                  <div className={styles.avatar}>
                    <Avatar
                      user={user}
                      imageError={imageError}
                      onImageError={handleImageError}
                      size={28}
                      className={styles.avatarImage}
                      placeholderClass={styles.avatarPlaceholder}
                    />
                  </div>
                </button>

                {!isMobile && isProfileOpen && (
                  <div className={styles.profileDropdown} role="menu">
                    <ProfileMenu
                      user={user}
                      imageError={imageError}
                      onImageError={handleImageError}
                      pathname={pathname}
                      isMobile={false}
                      onClose={closeProfile}
                      onLogout={handleLogout}
                    />
                  </div>
                )}
              </div>

              {isMobile && isProfileOpen && (
                <div
                  className={styles.dialogOverlay}
                  onClick={closeProfile}
                  role="presentation"
                >
                  <div
                    className={styles.dialogBox}
                    onClick={(e) => e.stopPropagation()}
                    role="dialog"
                    aria-modal="true"
                    aria-label={LABELS.profile}
                  >
                    <ProfileMenu
                      user={user}
                      imageError={imageError}
                      onImageError={handleImageError}
                      pathname={pathname}
                      isMobile
                      onClose={closeProfile}
                      onLogout={handleLogout}
                    />
                  </div>
                </div>
              )}
            </>
          ) : (
            <Link href="/login" className={styles.loginButton} aria-label={LABELS.login}>
              <LogIn size={14} />
              <span>{LABELS.login}</span>
            </Link>
          )}

          <div className={styles.datetime} title={currentDate}>
            <span className={styles.dateText}>{currentDate}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(BreakingNews);
