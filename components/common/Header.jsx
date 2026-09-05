// src/components/common/Header.jsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  Menu, X, Home, Briefcase, Users, UserPlus, 
  Search, MapPin, ChevronDown, Phone, FileText,
  Building2, Award, Target, TrendingUp
} from "lucide-react";
import styles from "@/styles/modules/Header.module.css";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("همه شهرها");
  const [isCityOpen, setIsCityOpen] = useState(false);
  
  const cityDropdownRef = useRef(null);
  const cityButtonRef = useRef(null);
  const searchFormRef = useRef(null);

  // لیست شهرهای ایران
  const cities = [
    "همه شهرها",
    "تهران", "مشهد", "اصفهان", "شیراز", "تبریز", "کرج", 
    "قم", "اهواز", "رشت", "کرمانشاه", "زاهدان", "همدان",
    "یزد", "اراک", "اردبیل", "بندرعباس", "ایلام", "بوشهر",
    "خرم‌آباد", "ساری", "سنندج", "شهرکرد", "قزوین", "گرگان",
    "ارومیه", "زنجان", "سمنان", "قشم", "کیش"
  ];

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // مدیریت کلیک خارج از دراپ‌داون شهر
  useEffect(() => {
    const handleClickOutside = (event) => {
      // اگر کلیک روی دکمه شهر یا داخل دراپ‌داون نبود، ببند
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

  // جلوگیری از بسته شدن دراپ‌داون هنگام کلیک روی آیتم‌ها
  const handleCitySelect = (city) => {
    setSelectedCity(city);
    setIsCityOpen(false);
    // حفظ فوکوس روی فرم
    if (searchFormRef.current) {
      const input = searchFormRef.current.querySelector('input');
      if (input) input.focus();
    }
  };

  // باز و بسته کردن دراپ‌داون
  const toggleCityDropdown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsCityOpen(!isCityOpen);
  };

  // تابع جستجو
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const params = new URLSearchParams();
      params.append('q', searchQuery.trim());
      if (selectedCity !== "همه شهرها") {
        params.append('city', selectedCity);
      }
      window.location.href = `/jobs?${params.toString()}`;
    }
  };

  // آیتم‌های منوی اصلی
  const navItems = [
    { label: "ثبت آگهی", icon: UserPlus, href: "/post-job" },

  ];

  return (
    <>
      <header className={styles.header}>
        <div className={styles.headerContainer}>
          {/* لوگو */}
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

          {/* بخش جستجو */}
          <div className={styles.searchSection}>
            <form 
              ref={searchFormRef}
              onSubmit={handleSearch} 
              className={styles.searchForm}
            >
              {/* انتخاب شهر */}
              <div className={styles.citySelector}>
                <button
                  type="button"
                  ref={cityButtonRef}
                  className={styles.cityButton}
                  onClick={toggleCityDropdown}
                  aria-expanded={isCityOpen}
                  aria-haspopup="true"
                >
                  <MapPin size={16} />
                  <span>{selectedCity}</span>
                  <ChevronDown 
                    size={14} 
                    className={`${styles.dropdownArrow} ${isCityOpen ? styles.rotated : ''}`}
                  />
                </button>
                
                {isCityOpen && (
                  <div 
                    ref={cityDropdownRef}
                    className={styles.cityDropdown}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className={styles.cityList}>
                      {cities.map((city) => (
                        <button
                          key={city}
                          type="button"
                          className={`${styles.cityOption} ${city === selectedCity ? styles.activeCity : ''}`}
                          onClick={() => handleCitySelect(city)}
                        >
                          {city}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
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
                <button 
                  type="submit" 
                  className={styles.searchButton}
                  aria-label="جستجو"
                >
                  <Search size={18} />
                </button>
              </div>
            </form>
          </div>

          {/* بخش راست هدر */}
          <div className={styles.headerRight}>
            {/* منوی دسکتاپ */}
            {!isMobile && (
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
            )}

            {/* دکمه منوی موبایل */}
            {isMobile && (
              <button 
                className={styles.menuToggle}
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="منو"
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            )}
          </div>
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
                <Link href="/contact" className={styles.mobileNavLink} onClick={() => setIsMenuOpen(false)}>
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