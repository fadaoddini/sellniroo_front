// src/components/common/Header.jsx
"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Menu, X, UserPlus,
  Search, MapPin, ChevronDown, Phone, Loader2
} from "lucide-react";
import jobisellApi from "@/services/jobisellApi";
import styles from "@/styles/modules/Header.module.css";

const Header = () => {
  const router = useRouter();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState(null); // ✅ حالا object، نه string
  const [isCityOpen, setIsCityOpen] = useState(false);
  const [cities, setCities] = useState([]);
  const [citiesLoading, setCitiesLoading] = useState(true);
  const [citySearch, setCitySearch] = useState(""); // ✅ جستجو داخل لیست شهرها

  const cityDropdownRef = useRef(null);
  const cityButtonRef = useRef(null);
  const searchFormRef = useRef(null);

  // ============================================
  // ✅ بررسی موبایل
  // ============================================
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // ============================================
  // ✅ بارگذاری شهرها از API
  // ============================================
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setCitiesLoading(true);
        const data = await jobisellApi.getCities();
        if (mounted) {
          setCities(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error("Error loading cities:", err);
      } finally {
        if (mounted) setCitiesLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // ============================================
  // ✅ بستن dropdown با کلیک بیرون
  // ============================================
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
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ============================================
  // ✅ فیلتر شهرها بر اساس جستجو
  // ============================================
  const filteredCities = useMemo(() => {
    if (!citySearch.trim()) return cities;
    const q = citySearch.trim().toLowerCase();
    return cities.filter((c) => c.name.toLowerCase().includes(q));
  }, [cities, citySearch]);

  // ============================================
  // ✅ هندلرها
  // ============================================
  const handleCitySelect = (city) => {
    setSelectedCity(city);
    setIsCityOpen(false);
    setCitySearch("");
    // فوکوس روی input جستجو
    if (searchFormRef.current) {
      const input = searchFormRef.current.querySelector("input");
      if (input) input.focus();
    }
  };

  const handleCityClear = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedCity(null);
    setCitySearch("");
  };

  const toggleCityDropdown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsCityOpen(!isCityOpen);
    if (!isCityOpen) setCitySearch("");
  };

  const handleSearch = (e) => {
    e.preventDefault();

    const params = new URLSearchParams();

    // ✅ جستجوی متنی
    if (searchQuery.trim()) {
      params.append("q", searchQuery.trim());
    }

    // ✅ شهر بر اساس ID
    if (selectedCity?.id) {
      params.append("city", selectedCity.id);
    }

    // اگر هیچ‌کدام نبود، به صفحه jobs برو
    const query = params.toString();
    router.push(query ? `/jobs?${query}` : "/jobs");
  };

  // ============================================
  // ✅ رندر dropdown شهرها
  // ============================================
  const renderCityDropdown = () => {
    if (!isCityOpen) return null;

    return (
      <div
        ref={cityDropdownRef}
        className={styles.cityDropdown}
        onClick={(e) => e.stopPropagation()}
      >
        {/* جستجو داخل شهرها */}
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
            >
              <X size={12} />
            </button>
          )}
        </div>

        {/* لیست شهرها */}
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
              {/* گزینه "همه شهرها" */}
              <button
                type="button"
                className={`${styles.cityOption} ${!selectedCity ? styles.activeCity : ""}`}
                onClick={() => handleCitySelect(null)}
              >
                همه شهرها
              </button>

              {/* شهرها */}
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

  // ============================================
  // ✅ رندر فرم جستجو (استفاده در دسکتاپ و موبایل)
  // ============================================
  const renderSearchForm = () => (
    <form ref={searchFormRef} onSubmit={handleSearch} className={styles.searchForm}>
      {/* انتخاب شهر */}
      <div className={styles.citySelector}>
        <button
          type="button"
          ref={cityButtonRef}
          className={`${styles.cityButton} ${selectedCity ? styles.cityButtonActive : ""}`}
          onClick={toggleCityDropdown}
          aria-expanded={isCityOpen}
          aria-haspopup="true"
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

      {/* ورودی جستجو */}
      <div className={styles.searchInputWrapper}>
        <input
          type="text"
          className={styles.searchInput}
          placeholder="عنوان شغل، مهارت یا شرکت..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          aria-label="جستجوی شغل"
        />
        <button type="submit" className={styles.searchButton} aria-label="جستجو">
          <Search size={18} />
        </button>
      </div>
    </form>
  );

  // ============================================
  // ✅ رندر
  // ============================================
  const navItems = [
    { label: "ثبت آگهی", icon: UserPlus, href: "/post-job" },
  ];

  return (
    <>
      <header className={styles.header}>
        <div className={styles.headerContainer}>
          {!isMobile ? (
            /* ============================================
               🖥️ دسکتاپ: سه ستونه
               ============================================ */
            <>
              <div className={styles.logo}>
                <Link href="/" title="آریا استاد | کاریابی تخصصی فروش و بازاریابی">
                  <Image
                    src="/images/logo.png"
                    alt="آریا استاد"
                    width={160}
                    height={45}
                    priority
                    className={styles.logoImage}
                  />
                </Link>
              </div>

              <div className={styles.searchSection}>
                {renderSearchForm()}
              </div>

              <div className={styles.headerRight}>
                <nav className={styles.desktopNav}>
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
            /* ============================================
               📱 موبایل: دو ردیفی
               ============================================ */
            <>
              <div className={styles.topRow}>
                <div className={styles.logo}>
                  <Link href="/" title="آریا استاد">
                    <Image
                      src="/images/logo.png"
                      alt="آریا استاد"
                      width={160}
                      height={45}
                      priority
                      className={styles.logoImage}
                    />
                  </Link>
                </div>

                <div className={styles.headerRight}>
                  <button
                    className={styles.menuToggle}
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    aria-label="منو"
                  >
                    {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                  </button>
                </div>
              </div>

              <div className={styles.searchRow}>
                <div className={styles.searchSection}>
                  {renderSearchForm()}
                </div>
              </div>
            </>
          )}
        </div>
      </header>

      {/* منوی موبایل */}
      {isMobile && isMenuOpen && (
        <div className={styles.mobileMenu}>
          <nav>
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
                <Link
                  href="/contact"
                  className={styles.mobileNavLink}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Phone size={20} />
                  <span>تماس با ما</span>
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </>
  );
};

export default Header;