// components/common/Header.jsx
"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
  memo,
} from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import {
  Menu, X, UserPlus,
  Search, MapPin, ChevronDown, Phone, Loader2,
} from "lucide-react";
import jobisellApi from "@/services/jobisellApi";
import { fetchSiteSettings, DEFAULT_SITE_SETTINGS } from "@/services/siteSettings";
import styles from "@/styles/modules/Header.module.css";

const LogoImage = memo(function LogoImage({ src, alt, className }) {
  const isLocal = typeof src === "string" && src.startsWith("/images/");
  if (isLocal) {
    return (
      <Image
        src={src}
        alt={alt || "لوگو"}
        width={160}
        height={45}
        priority
        className={className}
      />
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt || "لوگو"} className={className} width={160} height={45} />
  );
});

const Header = memo(function Header() {
  const router = useRouter();
  const pathname = usePathname();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState(null);
  const [isCityOpen, setIsCityOpen] = useState(false);
  const [cities, setCities] = useState([]);
  const [citiesLoading, setCitiesLoading] = useState(true);
  const [citySearch, setCitySearch] = useState("");
  const [settings, setSettings] = useState(DEFAULT_SITE_SETTINGS);

  const cityDropdownRef = useRef(null);
  const cityButtonRef = useRef(null);
  const searchFormRef = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return undefined;
    const mq = window.matchMedia("(max-width: 1023px)");
    const update = () => setIsMobile(!!mq.matches);
    update();
    mq.addEventListener?.("change", update);
    return () => mq.removeEventListener?.("change", update);
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetchSiteSettings().then((data) => {
      if (!cancelled) setSettings(data);
    });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setCitiesLoading(true);
        const data = await jobisellApi.getCities();
        if (mounted) setCities(Array.isArray(data) ? data : []);
      } catch {
        if (mounted) setCities([]);
      } finally {
        if (mounted) setCitiesLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
    setIsCityOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        cityDropdownRef.current &&
        !cityDropdownRef.current.contains(event.target) &&
        cityButtonRef.current &&
        !cityButtonRef.current.contains(event.target)
      ) {
        setIsCityOpen(false);
      }
    };
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setIsCityOpen(false);
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const filteredCities = useMemo(() => {
    if (!citySearch.trim()) return cities;
    const q = citySearch.trim().toLowerCase();
    return cities.filter((c) => (c.name || "").toLowerCase().includes(q));
  }, [cities, citySearch]);

  const navItems = useMemo(
    () => [
      {
        label: settings.header_cta_label || "ثبت آگهی",
        icon: UserPlus,
        href: settings.header_cta_href || "/post-job",
      },
    ],
    [settings.header_cta_label, settings.header_cta_href]
  );

  const handleCitySelect = useCallback((city) => {
    setSelectedCity(city);
    setIsCityOpen(false);
    setCitySearch("");
    const input = searchFormRef.current?.querySelector("input");
    input?.focus();
  }, []);

  const handleCityClear = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedCity(null);
    setCitySearch("");
  }, []);

  const toggleCityDropdown = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsCityOpen((open) => {
      if (!open) setCitySearch("");
      return !open;
    });
  }, []);

  const handleSearch = useCallback(
    (e) => {
      e.preventDefault();
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.append("q", searchQuery.trim());
      if (selectedCity?.id) params.append("city", selectedCity.id);
      const query = params.toString();
      router.push(query ? `/jobs?${query}` : "/jobs");
    },
    [router, searchQuery, selectedCity]
  );

  const logoSrc = settings.logo_display || "/images/logo.png";
  const logoAlt = settings.logo_alt || settings.site_name || "لوگو";
  const logoTitle = settings.logo_title || settings.site_name || "";
  const searchPlaceholder =
    settings.search_placeholder || "عنوان شغل، مهارت یا شرکت...";

  const renderCityDropdown = () => {
    if (!isCityOpen) return null;

    return (
      <div
        ref={cityDropdownRef}
        className={styles.cityDropdown}
        onClick={(e) => e.stopPropagation()}
        role="listbox"
      >
        <div className={styles.citySearchWrapper}>
          <Search size={14} className={styles.citySearchIcon} />
          <input
            type="text"
            placeholder="جستجوی شهر..."
            value={citySearch}
            onChange={(e) => setCitySearch(e.target.value)}
            className={styles.citySearchInput}
            autoFocus
          />
          {citySearch && (
            <button
              type="button"
              onClick={() => setCitySearch("")}
              className={styles.citySearchClear}
              aria-label="پاک کردن جستجوی شهر"
            >
              <X size={12} />
            </button>
          )}
        </div>

        <div className={styles.cityList}>
          {citiesLoading ? (
            <div className={styles.cityLoading}>
              <Loader2 size={16} className={styles.spinner} />
              <span>در حال بارگذاری...</span>
            </div>
          ) : filteredCities.length === 0 ? (
            <div className={styles.cityEmpty}>شهری یافت نشد</div>
          ) : (
            <>
              <button
                type="button"
                className={`${styles.cityOption} ${!selectedCity ? styles.activeCity : ""}`}
                onClick={() => handleCitySelect(null)}
              >
                همه شهرها
              </button>
              {filteredCities.map((city) => (
                <button
                  key={city.id}
                  type="button"
                  className={`${styles.cityOption} ${selectedCity?.id === city.id ? styles.activeCity : ""}`}
                  onClick={() => handleCitySelect(city)}
                >
                  {city.name}
                  {city.province_name && (
                    <span className={styles.cityProvince}>{city.province_name}</span>
                  )}
                </button>
              ))}
            </>
          )}
        </div>
      </div>
    );
  };

  const renderSearchForm = () => (
    <form ref={searchFormRef} onSubmit={handleSearch} className={styles.searchForm} role="search">
      <div className={styles.citySelector}>
        <button
          type="button"
          ref={cityButtonRef}
          className={`${styles.cityButton} ${selectedCity ? styles.cityButtonActive : ""}`}
          onClick={toggleCityDropdown}
          aria-expanded={isCityOpen}
          aria-haspopup="listbox"
        >
          <MapPin size={16} />
          <span className={styles.cityButtonText}>
            {selectedCity ? selectedCity.name : "همه شهرها"}
          </span>
          {selectedCity ? (
            <X
              size={14}
              className={styles.cityClearIcon}
              onClick={handleCityClear}
            />
          ) : (
            <ChevronDown
              size={14}
              className={`${styles.dropdownArrow} ${isCityOpen ? styles.rotated : ""}`}
            />
          )}
        </button>
        {renderCityDropdown()}
      </div>

      <div className={styles.searchInputWrapper}>
        <input
          type="search"
          className={styles.searchInput}
          placeholder={searchPlaceholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          aria-label="جستجوی شغل"
          enterKeyHint="search"
        />
        <button type="submit" className={styles.searchButton} aria-label="جستجو">
          <Search size={18} />
        </button>
      </div>
    </form>
  );

  const logoBlock = (
    <div className={styles.logo}>
      <Link href="/" title={logoTitle}>
        <LogoImage src={logoSrc} alt={logoAlt} className={styles.logoImage} />
      </Link>
    </div>
  );

  return (
    <>
      <header className={styles.header}>
        <div className={styles.headerContainer}>
          {!isMobile ? (
            <>
              {logoBlock}
              <div className={styles.searchSection}>{renderSearchForm()}</div>
              <div className={styles.headerRight}>
                <nav className={styles.desktopNav} aria-label="منوی اصلی">
                  <ul className={styles.navList}>
                    {navItems.map((item) => (
                      <li key={item.href}>
                        <Link href={item.href} className={styles.navLink}>
                          <item.icon size={18} />
                          <span>{item.label}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>
              </div>
            </>
          ) : (
            <>
              <div className={styles.topRow}>
                {logoBlock}
                <div className={styles.headerRight}>
                  <button
                    type="button"
                    className={styles.menuToggle}
                    onClick={() => setIsMenuOpen((v) => !v)}
                    aria-label="منو"
                    aria-expanded={isMenuOpen}
                  >
                    {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                  </button>
                </div>
              </div>
              <div className={styles.searchRow}>
                <div className={styles.searchSection}>{renderSearchForm()}</div>
              </div>
            </>
          )}
        </div>
      </header>

      {isMobile && isMenuOpen && (
        <div className={styles.mobileMenu}>
          <nav aria-label="منوی موبایل">
            <ul className={styles.mobileNavList}>
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={styles.mobileNavLink}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <item.icon size={20} />
                    <span>{item.label}</span>
                  </Link>
                </li>
              ))}
              <li className={styles.mobileDivider}>
                <span className={styles.mobileDividerText}>ارتباط با ما</span>
              </li>
              <li>
                {settings.contact_phone ? (
                  <a
                    href={`tel:${settings.contact_phone.replace(/\s+/g, "")}`}
                    className={styles.mobileNavLink}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Phone size={20} />
                    <span>{settings.contact_phone}</span>
                  </a>
                ) : (
                  <Link
                    href="/contact"
                    className={styles.mobileNavLink}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Phone size={20} />
                    <span>تماس با ما</span>
                  </Link>
                )}
              </li>
            </ul>
          </nav>
        </div>
      )}
    </>
  );
});

export default Header;
