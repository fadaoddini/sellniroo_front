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
import { createPortal } from "react-dom";
import { usePathname, useRouter } from "next/navigation";
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
  LayoutDashboard,
  Brain,
  Gamepad2,
  User,
  HandCoins,
  Radar,
  Info,
  Menu,
  Home,
  FileText,
  Building2,
  ShieldAlert,
  ClipboardList,
} from "lucide-react";
import axios from "axios";
import { useAuth } from "@/contexts/AuthContext";
import Config from "@/config/config";
import { fetchMenuListBySlug } from "@/services/menuLists";
import {
  getNavVisibilityFlags,
  normalizeNavWidgetSettings,
  navWidgetCssVars,
} from "@/config/navWidgetSettings";
import { resolveLucideIcon } from "@/utils/lucideIcons";
import schoolService from "@/components/School/services/schoolService";
import {
  buildSchoolProfileMenuLinks,
  resolveSchoolRole,
  schoolRoleLabel,
} from "@/components/School/schoolRoleNav";
import {
  buildGymProfileMenuLinks,
  gymRoleLabel,
} from "@/components/Gym/gymRoleNav";
import {
  DEFAULT_SITE_SETTINGS,
  fetchSiteSettings,
} from "@/services/siteSettings";
import {
  DEFAULT_CORPORATE_APPEARANCE,
  fetchCorporateAppearance,
} from "@/services/corporateAppearance";
import { resolveProfileSystemId } from "@/services/profileSystem";
import NavCartIcon from "./NavCartIcon";
import NavBarSearch from "./NavBarSearch";
import styles from "./BreakingNews.module.css";

function resolveMenuIcon(name) {
  return resolveLucideIcon(name, Home);
}

/** مثل ویجت منو — مسیر لوگو را برای img/Image آماده می‌کند */
function resolveBarLogoSrc(url) {
  const raw = String(url || "").trim();
  if (!raw) return "";
  if (
    raw.startsWith("http://") ||
    raw.startsWith("https://") ||
    raw.startsWith("data:") ||
    raw.startsWith("/images/")
  ) {
    return raw;
  }
  const base = Config.baseUrl || "";
  if (raw.startsWith("/media/")) return `${base}${raw}`;
  if (raw.startsWith("media/")) return `${base}/${raw}`;
  return raw;
}

/** همان منطق LogoMark ویجت منو */
function BarLogoMark({ src, name, height }) {
  if (!src) {
    return <span className={styles.barLogoFallback}>{name}</span>;
  }
  if (typeof src === "string" && src.startsWith("/images/")) {
    return (
      <Image
        src={src}
        alt={name}
        width={Math.round(height * 3.6)}
        height={height}
        priority
        className={styles.barLogoImg}
      />
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={name} height={height} className={styles.barLogoImg} />
  );
}

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
  todo: "میزکار وظایف",
  challenge: "چالش مهندسین",
  game: "بازی",
  dearUser: "کاربر عزیز",
  resumeCta: "ساخت رزومه",
  companyCta: "ساخت شرکت",
  authRequiredTitle: "ابتدا باید وارد شوید",
  authRequiredBody:
    "برای ساخت رزومه یا ثبت شرکت، ابتدا وارد حساب کاربری خود شوید.",
  authRequiredCancel: "الان نه",
  authRequiredLogin: "ورود به حساب",
};

const AuthRequiredDialog = memo(function AuthRequiredDialog({
  open,
  closing,
  sheetMs,
  intentLabel,
  loginHref,
  onClose,
}) {
  if (!open && !closing) return null;

  return createPortal(
    <div
      className={[
        styles.authOverlay,
        closing ? styles.authOverlayOut : styles.authOverlayIn,
      ].join(" ")}
      style={{ "--bn-sheet-ms": `${sheetMs}ms` }}
      role="presentation"
      onClick={onClose}
    >
      <div
        className={[
          styles.authDialog,
          closing ? styles.authDialogOut : styles.authDialogIn,
        ].join(" ")}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="bn-auth-title"
        aria-describedby="bn-auth-desc"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.authGlow} aria-hidden />
        <div className={styles.authIconWrap} aria-hidden>
          <ShieldAlert size={28} strokeWidth={2.1} />
        </div>
        <h3 id="bn-auth-title" className={styles.authTitle}>
          {LABELS.authRequiredTitle}
        </h3>
        <p id="bn-auth-desc" className={styles.authBody}>
          {intentLabel
            ? `برای «${intentLabel}» ابتدا وارد حساب کاربری خود شوید.`
            : LABELS.authRequiredBody}
        </p>
        <div className={styles.authActions}>
          <button
            type="button"
            className={styles.authCancel}
            onClick={onClose}
          >
            {LABELS.authRequiredCancel}
          </button>
          <Link
            href={loginHref}
            className={styles.authLogin}
            onClick={onClose}
          >
            <LogIn size={15} strokeWidth={2.3} />
            <span>{LABELS.authRequiredLogin}</span>
          </Link>
        </div>
      </div>
    </div>,
    document.body
  );
});

const PROFILE_LINKS = [
  { href: "/dashboard", icon: LayoutDashboard, label: LABELS.dashboard },
  { href: "/profile", icon: User, label: LABELS.profile },
  { href: "/sale", icon: HandCoins, label: LABELS.marketing },
  { href: "/todo", icon: ClipboardList, label: LABELS.todo },
  { href: "/rasad", icon: Radar, label: "رصد" },
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
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia(`(max-width: ${breakpoint - 1}px)`).matches;
  });

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
  menuItems = null,
  canAccessSale = false,
  canAccessTodo = false,
  schoolLinks = null,
  schoolRoleLabel = "",
  gymLinks = null,
  gymRoleLabelText = "",
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
  // منوی سفارشی ویجت (مثل منوی تعمیرات صدرا) اولویت دارد
  const useCustomMenu = Array.isArray(menuItems);
  const useGymMenu =
    !useCustomMenu && Array.isArray(gymLinks) && gymLinks.length > 0;
  const useSchoolMenu =
    !useCustomMenu &&
    !useGymMenu &&
    Array.isArray(schoolLinks) &&
    schoolLinks.length > 0;
  const roleLabelText = useGymMenu
    ? gymRoleLabelText
    : useSchoolMenu
      ? schoolRoleLabel
      : "";
  const profileLinks = PROFILE_LINKS.filter((item) => {
    if (item.href === "/sale") return canAccessSale;
    if (item.href === "/todo") return canAccessTodo;
    return true;
  });

  const renderLink = (item) => {
    const Icon = item.icon;
    const active = isActive(item.href);
    return (
      <Link
        key={item.key || item.href}
        href={item.href}
        className={`${styles.profileMenuItem} ${active ? styles.activeMenuItem : ""}`}
        onClick={onClose}
      >
        <Icon size={iconSize} />
        <span>{item.label}</span>
        {active && <Check size={14} className={styles.activeCheck} />}
      </Link>
    );
  };

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
          <p>
            {roleLabelText
              ? `${roleLabelText} · ${user?.mobile || ""}`
              : user?.mobile}
          </p>
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

      {useCustomMenu ? (
        menuItems.length === 0 ? (
          <div className={styles.profileEmpty}>آیتمی در فهرست منو نیست</div>
        ) : (
          menuItems.map((item) => {
            const Icon = resolveMenuIcon(item.icon);
            const active = isActive(item.href || "");
            return (
              <Link
                key={item.id || item.href}
                href={item.href || "#"}
                className={`${styles.profileMenuItem} ${active ? styles.activeMenuItem : ""}`}
                onClick={onClose}
              >
                <Icon size={iconSize} />
                <span>{item.label_fa || item.label_en}</span>
                {active && <Check size={14} className={styles.activeCheck} />}
              </Link>
            );
          })
        )
      ) : useGymMenu ? (
        gymLinks.map(renderLink)
      ) : useSchoolMenu ? (
        schoolLinks.map(renderLink)
      ) : (
        profileLinks.map(renderLink)
      )}

      {/* خط جداکننده + خروج — همیشه در انتها */}
      <div className={`${styles.profileDivider} ${styles.profileDividerStrong}`} />
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

/**
 * @param {{ settings?: Record<string, any>|null }} props
 * اگر settings از چیدمان بیاید، منو/پروفایل/مهمان قابل تنظیم است.
 * بدون settings همان رفتار کلاسیک (مشاوره، درباره، ورود) حفظ می‌شود.
 */
const BreakingNews = ({ settings: rawSettings = null } = {}) => {
  const configured = rawSettings != null;
  const {
    user,
    isAuthenticated,
    logout,
    loading,
    hasPermission,
    getAuthHeaders,
    isEmployee,
  } = useAuth();
  const canAccessSale =
    !!user?.is_superuser ||
    !!user?.is_staff ||
    hasPermission('marketing') ||
    hasPermission('sales');
  const canAccessTodo =
    !!user?.is_superuser || !!user?.is_staff || !!isEmployee;
  const pathname = usePathname();
  const router = useRouter();
  const isMobile = useIsMobile(768);
  const viewport = isMobile ? 'mobile' : 'desktop';
  const settings = configured
    ? normalizeNavWidgetSettings(rawSettings, { viewport })
    : null;
  const visibility = configured ? getNavVisibilityFlags(rawSettings) : null;
  const currentDate = usePersianDate(isMobile);

  const [newsItems, setNewsItems] = useState(FALLBACK_NEWS);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [profileClosing, setProfileClosing] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuClosing, setMenuClosing] = useState(false);
  const [menuItems, setMenuItems] = useState([]);
  const [imageError, setImageError] = useState(false);
  const [authPrompt, setAuthPrompt] = useState(null);
  const [authClosing, setAuthClosing] = useState(false);
  const [schoolMe, setSchoolMe] = useState(null);
  const [gymMe, setGymMe] = useState(null);
  const [profileSystemId, setProfileSystemId] = useState(null);
  const [appearance, setAppearance] = useState(DEFAULT_CORPORATE_APPEARANCE);
  const [siteSettingsLogo, setSiteSettingsLogo] = useState(DEFAULT_SITE_SETTINGS);
  const authCloseTimer = useRef(null);

  const profileDropdownRef = useRef(null);
  const profileCloseTimer = useRef(null);
  const menuCloseTimer = useRef(null);
  const showTicker = !configured || settings.show_ticker !== false;
  const sheetMs = configured ? settings.sheet_ms : 350;
  const { textRef, cursorRef } = useTypewriter(newsItems, showTicker);

  useEffect(() => {
    if (!showTicker) return undefined;
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
  }, [showTicker]);

  useEffect(() => {
    if (!configured || !settings?.menu_slug) {
      setMenuItems([]);
      return undefined;
    }
    let cancelled = false;
    fetchMenuListBySlug(settings.menu_slug, { force: true }).then((menu) => {
      if (cancelled) return;
      setMenuItems((menu?.items || []).filter((i) => i.is_active !== false));
    });
    return () => {
      cancelled = true;
    };
  }, [configured, settings?.menu_slug]);

  useEffect(() => {
    if (!configured || !settings?.show_logo) return undefined;
    let cancelled = false;
    const loadLogos = () => {
      fetchSiteSettings({ force: true }).then((data) => {
        if (!cancelled && data) setSiteSettingsLogo(data);
      });
      fetchCorporateAppearance({ force: true }).then((data) => {
        if (!cancelled) setAppearance(data || DEFAULT_CORPORATE_APPEARANCE);
      });
    };
    loadLogos();
    const onAppear = () => {
      fetchCorporateAppearance({ force: true }).then((data) => {
        if (!cancelled) setAppearance(data || DEFAULT_CORPORATE_APPEARANCE);
      });
    };
    const onSiteSettings = (ev) => {
      if (ev?.detail) setSiteSettingsLogo(ev.detail);
      else loadLogos();
    };
    window.addEventListener("corporate-appearance-changed", onAppear);
    window.addEventListener("site-settings-changed", onSiteSettings);
    window.addEventListener("site-data-bust", loadLogos);
    return () => {
      cancelled = true;
      window.removeEventListener("corporate-appearance-changed", onAppear);
      window.removeEventListener("site-settings-changed", onSiteSettings);
      window.removeEventListener("site-data-bust", loadLogos);
    };
  }, [configured, settings?.show_logo]);

  useEffect(() => {
    setImageError(false);
  }, [user?.image]);

  useEffect(() => {
    let cancelled = false;
    ;(async () => {
      try {
        const [settings, systemId] = await Promise.all([
          fetchSiteSettings({ force: false }),
          resolveProfileSystemId({ force: false }),
        ])
        if (cancelled) return
        const primary = settings?.profile_layout?.primary
        setProfileSystemId(
          primary === 'gym_bodybuilding' || systemId === 'gym_bodybuilding'
            ? 'gym_bodybuilding'
            : systemId || primary || null,
        )
      } catch {
        if (!cancelled) setProfileSystemId(null)
      }
    })()
    const refresh = () => {
      resolveProfileSystemId({ force: true })
        .then((id) => {
          if (!cancelled) setProfileSystemId(id || null)
        })
        .catch(() => {})
    }
    window.addEventListener('profile-layout-changed', refresh)
    window.addEventListener('site-modules-changed', refresh)
    return () => {
      cancelled = true
      window.removeEventListener('profile-layout-changed', refresh)
      window.removeEventListener('site-modules-changed', refresh)
    }
  }, [])

  useEffect(() => {
    // منوی مدرسه فقط وقتی سیستم پروفایل مدرسه است
    if (profileSystemId !== 'school') {
      setSchoolMe(null)
      return undefined
    }
    if (!isAuthenticated || !user) {
      setSchoolMe(null);
      return undefined;
    }
    let cancelled = false;
    ;(async () => {
      try {
        const res = await schoolService.me();
        if (cancelled) return;
        if (res?.success) setSchoolMe(res.data || null);
        else setSchoolMe(null);
      } catch {
        if (!cancelled) setSchoolMe(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, user?.id, user?.mobile, profileSystemId]);

  useEffect(() => {
    if (profileSystemId !== 'gym_bodybuilding') {
      setGymMe(null)
      return undefined
    }
    if (!isAuthenticated || !user) {
      setGymMe(null)
      return undefined
    }
    let cancelled = false
    ;(async () => {
      try {
        const headers =
          typeof getAuthHeaders === 'function' ? getAuthHeaders() : {}
        const res = await axios.get(Config.endpoints.bodybuilding.me(), {
          headers,
        })
        if (!cancelled) setGymMe(res.data || null)
      } catch {
        if (!cancelled) setGymMe(null)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [isAuthenticated, user?.id, user?.mobile, profileSystemId, getAuthHeaders])

  const gymMenuLinks = useMemo(() => {
    if (profileSystemId !== 'gym_bodybuilding') return null
    const links = buildGymProfileMenuLinks(user, gymMe)
    return links.length ? links : null
  }, [profileSystemId, user, gymMe])

  const gymRoleLabelText = useMemo(() => {
    if (profileSystemId !== 'gym_bodybuilding') return ''
    return gymRoleLabel(gymMe || user)
  }, [profileSystemId, user, gymMe])

  const schoolMenuLinks = useMemo(() => {
    if (profileSystemId !== 'school') return null
    if (!schoolMe) return null;
    const links = buildSchoolProfileMenuLinks(schoolMe, user);
    return links.length ? links : null;
  }, [schoolMe, user, profileSystemId]);

  const schoolRoleLabelText = useMemo(() => {
    if (profileSystemId !== 'school' || !schoolMe) return "";
    return schoolRoleLabel(resolveSchoolRole(schoolMe, user));
  }, [schoolMe, user, profileSystemId]);

  // منوی دراپ‌داون پروفایل: از menu_slug ویجت (مثلاً repairs_menu)
  const profileDropdownMenuItems = useMemo(() => {
    if (!configured || !settings?.menu_slug) return null
    return menuItems
  }, [configured, settings?.menu_slug, menuItems])

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

  const profileSheetOpen = isProfileOpen || profileClosing;
  const menuSheetOpen = menuOpen || menuClosing;
  const [portalReady, setPortalReady] = useState(false);

  useEffect(() => {
    setPortalReady(true);
  }, []);

  /* وقتی شیت پروفایل/منو باز است، نوار پایین اپ را مخفی کن تا روی «خروج» نیفتد */
  useEffect(() => {
    if (!isMobile) return undefined;
    const open = profileSheetOpen || menuSheetOpen;
    if (open) document.body.classList.add("bn-sheet-open");
    else document.body.classList.remove("bn-sheet-open");
    return () => document.body.classList.remove("bn-sheet-open");
  }, [isMobile, profileSheetOpen, menuSheetOpen]);

  useEffect(() => {
    if (!(isMobile && profileSheetOpen) && !menuSheetOpen) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isMobile, profileSheetOpen, menuSheetOpen]);

  useEffect(() => {
    return () => {
      clearTimeout(profileCloseTimer.current);
      clearTimeout(menuCloseTimer.current);
      clearTimeout(authCloseTimer.current);
    };
  }, []);

  const closeAuthPrompt = useCallback(() => {
    if (authClosing || !authPrompt) return;
    setAuthClosing(true);
    clearTimeout(authCloseTimer.current);
    authCloseTimer.current = setTimeout(() => {
      setAuthPrompt(null);
      setAuthClosing(false);
    }, sheetMs);
  }, [authClosing, authPrompt, sheetMs]);

  useEffect(() => {
    if (!authPrompt && !authClosing) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => {
      if (e.key === "Escape") closeAuthPrompt();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [authPrompt, authClosing, closeAuthPrompt]);

  const openAuthPrompt = useCallback((intent) => {
    clearTimeout(authCloseTimer.current);
    setAuthClosing(false);
    setAuthPrompt(intent);
  }, []);

  const handleJobCta = useCallback(
    (intent) => {
      if (isAuthenticated) {
        router.push(intent.href);
        return;
      }
      openAuthPrompt(intent);
    },
    [isAuthenticated, openAuthPrompt, router]
  );

  const renderJobCtas = () => {
    if (!configured) return null;
    const showResume = settings.show_resume_cta;
    const showCompany = settings.show_company_cta;
    if (!showResume && !showCompany) return null;

    return (
      <div className={styles.jobCtaGroup} role="group" aria-label="اقدامات کاریابی">
        {showResume ? (
          <button
            type="button"
            className={`${styles.jobCtaBtn} ${styles.jobCtaResume}`}
            onClick={() =>
              handleJobCta({
                key: "resume",
                label: settings.resume_cta_label || LABELS.resumeCta,
                href: settings.resume_cta_href || "/profile?tab=resume",
              })
            }
            aria-label={settings.resume_cta_label || LABELS.resumeCta}
          >
            <FileText size={14} strokeWidth={2.25} aria-hidden />
            <span>{settings.resume_cta_label || LABELS.resumeCta}</span>
          </button>
        ) : null}
        {showCompany ? (
          <button
            type="button"
            className={`${styles.jobCtaBtn} ${styles.jobCtaCompany}`}
            onClick={() =>
              handleJobCta({
                key: "company",
                label: settings.company_cta_label || LABELS.companyCta,
                href: settings.company_cta_href || "/profile?tab=company",
              })
            }
            aria-label={settings.company_cta_label || LABELS.companyCta}
          >
            <Building2 size={14} strokeWidth={2.25} aria-hidden />
            <span>{settings.company_cta_label || LABELS.companyCta}</span>
          </button>
        ) : null}
      </div>
    );
  };

  const closeProfile = useCallback(() => {
    if (!isMobile) {
      setIsProfileOpen(false);
      setProfileClosing(false);
      return;
    }
    if (profileClosing || !isProfileOpen) return;
    setIsProfileOpen(false);
    setProfileClosing(true);
    clearTimeout(profileCloseTimer.current);
    profileCloseTimer.current = setTimeout(() => {
      setProfileClosing(false);
    }, sheetMs);
  }, [isMobile, isProfileOpen, profileClosing, sheetMs]);

  useEffect(() => {
    if (!profileSheetOpen && !menuSheetOpen) return undefined;
    const onEsc = (e) => {
      if (e.key !== "Escape") return;
      if (profileSheetOpen) closeProfile();
      else if (menuOpen || menuClosing) {
        setMenuOpen(false);
        setMenuClosing(true);
        clearTimeout(menuCloseTimer.current);
        menuCloseTimer.current = setTimeout(() => setMenuClosing(false), sheetMs);
      }
    };
    document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [
    profileSheetOpen,
    menuSheetOpen,
    menuOpen,
    menuClosing,
    closeProfile,
    sheetMs,
  ]);

  const closeMenu = useCallback(() => {
    if (menuClosing || !menuOpen) return;
    setMenuOpen(false);
    setMenuClosing(true);
    clearTimeout(menuCloseTimer.current);
    menuCloseTimer.current = setTimeout(() => {
      setMenuClosing(false);
    }, sheetMs);
  }, [menuOpen, menuClosing, sheetMs]);

  const openMenu = useCallback(() => {
    clearTimeout(menuCloseTimer.current);
    setMenuClosing(false);
    setMenuOpen(true);
  }, []);

  const handleImageError = useCallback(() => setImageError(true), []);

  const handleConsultClick = useCallback(() => {
    if (CONSULT_PHONE) window.location.href = `tel:${CONSULT_PHONE}`;
  }, []);

  const handleLogout = useCallback(async () => {
    await logout();
    closeProfile();
  }, [logout, closeProfile]);

  const toggleProfile = useCallback(() => {
    if (isMobile) {
      if (isProfileOpen || profileClosing) {
        closeProfile();
      } else {
        clearTimeout(profileCloseTimer.current);
        setProfileClosing(false);
        setIsProfileOpen(true);
      }
      return;
    }
    setIsProfileOpen((open) => !open);
  }, [isMobile, isProfileOpen, profileClosing, closeProfile]);

  const GuestIcon = resolveMenuIcon(settings?.guest_icon || "LogIn");
  const displayName =
    user?.display_name ||
    `${user?.first_name || ""} ${user?.last_name || ""}`.trim() ||
    user?.mobile ||
    LABELS.dearUser;

  const profileMode = settings?.profile_mode || "avatar";
  const showProfileConfigured =
    configured &&
    (isAuthenticated
      ? profileMode !== "hidden"
      : settings.guest_visible !== false);

  const renderProfileBlock = () => {
    if (loading) {
      return (
        <div className={styles.loginButton} style={{ opacity: 0.5 }} aria-hidden="true">
          <span>...</span>
        </div>
      );
    }

    if (configured && !showProfileConfigured) return null;

    if (isAuthenticated && user) {
      if (configured && profileMode === "hidden") return null;
      return (
        <>
          <div className={styles.profileSection} ref={profileDropdownRef}>
            <button
              type="button"
              className={`${styles.profileButton} ${
                configured && profileMode === "avatar_name" ? styles.profileButtonNamed : ""
              }`}
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
              {configured && profileMode === "avatar_name" ? (
                <span className={styles.profileNameInline}>{displayName}</span>
              ) : null}
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
                  menuItems={profileDropdownMenuItems}
                  canAccessSale={canAccessSale}
                  canAccessTodo={canAccessTodo}
                  schoolLinks={schoolMenuLinks}
                  schoolRoleLabel={schoolRoleLabelText}
                  gymLinks={gymMenuLinks}
                  gymRoleLabelText={gymRoleLabelText}
                />
              </div>
            )}
          </div>

          {isMobile && profileSheetOpen && portalReady
            ? createPortal(
                <div
                  className={[
                    styles.dialogOverlay,
                    profileClosing
                      ? styles.dialogOverlayOut
                      : styles.dialogOverlayIn,
                  ].join(" ")}
                  style={{ "--bn-sheet-ms": `${sheetMs}ms` }}
                  onClick={closeProfile}
                  role="presentation"
                >
                  <div
                    className={[
                      styles.dialogBox,
                      profileClosing ? styles.dialogBoxOut : styles.dialogBoxIn,
                    ].join(" ")}
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
                      menuItems={profileDropdownMenuItems}
                      canAccessSale={canAccessSale}
                      canAccessTodo={canAccessTodo}
                      schoolLinks={schoolMenuLinks}
                      schoolRoleLabel={schoolRoleLabelText}
                      gymLinks={gymMenuLinks}
                      gymRoleLabelText={gymRoleLabelText}
                    />
                  </div>
                </div>,
                document.body
              )
            : null}
        </>
      );
    }

    if (configured) {
      if (!settings.guest_visible) return null;
      return (
        <Link
          href={settings.guest_href || "/login"}
          className={styles.loginButton}
          aria-label={settings.guest_label || LABELS.login}
        >
          <GuestIcon size={14} />
          <span>{settings.guest_label || LABELS.login}</span>
        </Link>
      );
    }

    return (
      <Link href="/login" className={styles.loginButton} aria-label={LABELS.login}>
        <LogIn size={14} />
        <span>{LABELS.login}</span>
      </Link>
    );
  };

  const hideOnMobile = configured && visibility?.show_on_mobile === false;
  const hideOnDesktop = configured && visibility?.show_on_desktop === false;
  const themedStyle = configured
    ? navWidgetCssVars(rawSettings, { viewport })
    : undefined;
  const barFullBleed = configured && settings?.bar_full_bleed !== false;
  const barSticky = configured
    ? settings?.sticky !== false
    : true;
  const stickyOffset = configured
    ? Math.max(0, Number(settings?.sticky_offset) || 0)
    : 0;
  const showMenuIcons = !configured || settings?.show_menu_icons !== false;
  const underlineLinks = configured && !!settings?.underline;
  const showLogo = configured && !!settings?.show_logo;
  const logoHref = (settings?.logo_href || "/").trim() || "/";
  const logoHeight = Math.max(16, Number(settings?.logo_height) || 40);
  /* اولویت لوگوی /site-settings — بعد ظاهر شرکتی — بعد آپلود ویجت */
  const logoSrc = showLogo
    ? resolveBarLogoSrc(
        settings?.use_site_logo !== false
          ? siteSettingsLogo.logo_display ||
              siteSettingsLogo.logo_url ||
              appearance.logo_display ||
              appearance.logo_url ||
              "/images/logo.png"
          : settings?.logo_url || "/images/logo.png",
      )
    : "";
  const logoBeforeHamburger = settings?.logo_place === "before_hamburger";
  const logoName = "لوگو";

  const logoEl = showLogo ? (
    <Link
      href={logoHref}
      className={styles.barLogo}
      title={logoName}
      aria-label={logoName}
    >
      <BarLogoMark src={logoSrc} name={logoName} height={logoHeight} />
    </Link>
  ) : null;

  const hamburgerEl =
    configured && settings.show_hamburger ? (
      <button
        type="button"
        className={styles.hamburgerBtn}
        aria-label="منو"
        aria-expanded={menuOpen}
        onClick={() => {
          if (menuOpen || menuClosing) closeMenu();
          else openMenu();
        }}
      >
        {menuOpen ? <X size={18} /> : <Menu size={18} />}
      </button>
    ) : null;

  /* دسکتاپ: بعد از رسیدن به لبه با fixed پین می‌شود (sticky داخل ردیف کوتاه صفحه‌ساز کار نمی‌کند) */
  const stickySentinelRef = useRef(null);
  const barRef = useRef(null);
  const reservedHeightRef = useRef(0);
  const [pinned, setPinned] = useState(false);
  const [pinHeight, setPinHeight] = useState(0);

  useEffect(() => {
    if (!barSticky || isMobile) {
      setPinned(false);
      document.documentElement.style.setProperty("--pb-bn-sticky-h", "0px");
      return undefined;
    }
    const sentinel = stickySentinelRef.current;
    const bar = barRef.current;
    if (!sentinel || !bar) return undefined;

    const measureReserve = () => {
      const cs = window.getComputedStyle(bar);
      const mt = parseFloat(cs.marginTop) || 0;
      const mb = parseFloat(cs.marginBottom) || 0;
      const h = (bar.offsetHeight || 0) + mt + mb;
      reservedHeightRef.current = h;
      setPinHeight(h);
    };

    const publishStackHeight = (pinnedNow, height) => {
      /* ویجت منو از این ارتفاع برای چسبیدن زیر نوار خبر استفاده می‌کند */
      document.documentElement.style.setProperty(
        "--pb-bn-sticky-h",
        pinnedNow && height > 0 ? `${height}px` : "0px",
      );
    };

    const sync = () => {
      const top = sentinel.getBoundingClientRect().top;
      const shouldPin = top <= stickyOffset;
      if (!shouldPin) measureReserve();
      else if (!reservedHeightRef.current) measureReserve();
      const h = reservedHeightRef.current || bar.offsetHeight || 0;
      publishStackHeight(shouldPin, h);
      setPinned(shouldPin);
    };

    sync();
    window.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);
    return () => {
      window.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
      document.documentElement.style.setProperty("--pb-bn-sticky-h", "0px");
    };
  }, [barSticky, isMobile, stickyOffset]);

  return (
    <>
      {barSticky && !isMobile ? (
        <div
          ref={stickySentinelRef}
          className={styles.stickySentinel}
          aria-hidden
        />
      ) : null}
      {pinned ? (
        <div
          className={styles.stickySpacer}
          style={{ height: pinHeight }}
          aria-hidden
        />
      ) : null}
    <div
      ref={barRef}
      className={[
        styles.breakingNews,
        configured ? styles.breakingNewsConfigured : "",
        barSticky ? styles.breakingNewsSticky : "",
        pinned ? styles.breakingNewsPinned : "",
        configured
          ? barFullBleed
            ? styles.barFullBleed
            : styles.barInset
          : "",
        underlineLinks ? styles.underlineLinks : "",
        hideOnMobile ? styles.hideOnMobile : "",
        hideOnDesktop ? styles.hideOnDesktop : "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={{
        ...(themedStyle || {}),
        ...(pinned
          ? {
              /* فاصلهٔ بالا از --bn-mt در CSS به top اضافه می‌شود */
              '--bn-pin-top': `${stickyOffset}px`,
              marginTop: 0,
              marginBottom: 0,
              marginLeft: 0,
              marginRight: 0,
            }
          : {}),
      }}
    >
      <div className={styles.container}>
        {hamburgerEl || logoEl ? (
          <div className={styles.brandCluster}>
            {logoBeforeHamburger ? logoEl : null}
            {hamburgerEl}
            {!logoBeforeHamburger ? logoEl : null}
          </div>
        ) : null}

        {showTicker ? (
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
        ) : (
          <div className={styles.newsLeftSpacer} />
        )}

        <div className={styles.newsRight}>
          {configured && settings.show_menu_items ? (
            <nav className={styles.inlineMenu} aria-label="منو">
              {menuItems.map((item) => {
                const Icon = resolveMenuIcon(item.icon);
                return (
                  <Link
                    key={item.id}
                    href={item.href || "#"}
                    className={styles.inlineMenuLink}
                  >
                    {showMenuIcons ? <Icon size={13} /> : null}
                    <span>{item.label_fa || item.label_en}</span>
                  </Link>
                );
              })}
            </nav>
          ) : null}

          {!configured ? (
            <>
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
            </>
          ) : null}

          {(!configured || settings?.cart_place !== 'after_profile') ? (
            <NavCartIcon settings={configured ? settings : null} />
          ) : null}
          {configured && settings?.job_cta_place !== 'after_profile'
            ? renderJobCtas()
            : null}
          {configured && settings?.show_search ? (
            <NavBarSearch settings={settings} />
          ) : null}
          {renderProfileBlock()}
          {configured && settings?.job_cta_place === 'after_profile'
            ? renderJobCtas()
            : null}
          {configured && settings?.cart_place === 'after_profile' ? (
            <NavCartIcon settings={settings} />
          ) : null}

          {(!configured || settings.show_date !== false) &&
          (!configured || !isMobile) ? (
            <div className={styles.datetime} title={currentDate}>
              <span className={styles.dateText}>{currentDate}</span>
            </div>
          ) : null}
        </div>
      </div>

      {portalReady ? (
        <AuthRequiredDialog
          open={!!authPrompt}
          closing={authClosing}
          sheetMs={sheetMs}
          intentLabel={authPrompt?.label || ""}
          loginHref={`/login?next=${encodeURIComponent(
            authPrompt?.href || "/profile"
          )}`}
          onClose={closeAuthPrompt}
        />
      ) : null}

      {configured && settings.show_hamburger && menuSheetOpen && portalReady
        ? createPortal(
            <>
              <button
                type="button"
                className={[
                  styles.menuBackdrop,
                  menuClosing ? styles.menuBackdropOut : styles.menuBackdropIn,
                ].join(" ")}
                style={{ "--bn-sheet-ms": `${sheetMs}ms` }}
                aria-label="بستن منو"
                onClick={closeMenu}
              />
              <aside
                className={[
                  styles.menuDrawer,
                  menuClosing ? styles.menuDrawerOut : styles.menuDrawerIn,
                ].join(" ")}
                style={{ "--bn-sheet-ms": `${sheetMs}ms` }}
                aria-label="فهرست منو"
              >
                <div className={styles.menuDrawerHead}>
                  <strong>منو</strong>
                  <button type="button" onClick={closeMenu} aria-label="بستن">
                    <X size={18} />
                  </button>
                </div>
                <ul className={styles.menuDrawerList}>
                  {menuItems.length === 0 ? (
                    <li className={styles.menuDrawerEmpty}>
                      آیتمی در این فهرست نیست
                    </li>
                  ) : (
                    menuItems.map((item) => {
                      const Icon = resolveMenuIcon(item.icon);
                      return (
                        <li key={item.id}>
                          <Link
                            href={item.href || "#"}
                            className={styles.menuDrawerLink}
                            onClick={closeMenu}
                          >
                            <Icon size={16} />
                            <span>{item.label_fa || item.label_en}</span>
                          </Link>
                        </li>
                      );
                    })
                  )}
                </ul>
              </aside>
            </>,
            document.body
          )
        : null}
    </div>
    </>
  );
};

export default memo(BreakingNews);
