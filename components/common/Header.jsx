// src/components/common/Header.js
"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  Menu, X, Activity, ChevronDown, LayoutDashboard, Container , LibraryBig, Mountain, Layers,
  DollarSign, CheckSquare, Palette, User as UserIcon, Home, Info,
  Building2, Calculator
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import styles from "@/styles/modules/Header.module.css";

const Header = () => {
  const { language, dir } = useLanguage();
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isActivityOpen, setIsActivityOpen] = useState(false);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  
  const openTimerRef = useRef(null);
  const closeTimerRef = useRef(null);
  const calcOpenTimerRef = useRef(null);
  const calcCloseTimerRef = useRef(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    return () => {
      if (openTimerRef.current) clearTimeout(openTimerRef.current);
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
      if (calcOpenTimerRef.current) clearTimeout(calcOpenTimerRef.current);
      if (calcCloseTimerRef.current) clearTimeout(calcCloseTimerRef.current);
    };
  }, []);

  const navItems = [
    { label: language === "fa" ? "خانه" : "Home", icon: Home, href: "/" },
    { label: language === "fa" ? "اِل اِس اِف" : "Lsf", icon: Container, href: "/lsf" },
    // { label: language === "fa" ? "کناف" : "Kanaf", icon: LibraryBig, href: "/kanaf" },
    // { label: language === "fa" ? "گچ" : "Gypsum", icon: Mountain, href: "/gypsum" },
    { label: language === "fa" ? "سازمان" : "Chart", icon: Layers, href: "/chart" },
    { label: language === "fa" ? "محاسبات" : "Calculator", icon: Calculator, href: "/design" },
    { label: language === "fa" ? "درباره ما" : "About", icon: Info, href: "/about" },
  ];

  const activityItems = [
    { label: language === "fa" ? "وب" : "Web", icon: LayoutDashboard, href: "/web" },
    { label: language === "fa" ? "فروش" : "Sales", icon: DollarSign, href: "/sale" },
    { label: language === "fa" ? "وظایف" : "Tasks", icon: CheckSquare, href: "/todo" },
    { label: language === "fa" ? "کاربران" : "Users", icon: UserIcon, href: "/user" },
    { label: language === "fa" ? "طراحی" : "Design", icon: Palette, href: "/design" },
  ];

  const calculatorItems = [
    { label: language === "fa" ? "سازه" : "Structure", icon: Building2, href: "/calculator/structure" },
    { label: language === "fa" ? "کناف" : "Gypsum", icon: LayoutDashboard, href: "/calculator/gypsum" },
    { label: language === "fa" ? "طراحی" : "Design", icon: Palette, href: "/design" },
    { label: language === "fa" ? "ویلا" : "Villa", icon: Home, href: "/calculator/villa" },
  ];

  // مدیریت منوی فعالیت‌ها
  const handleActivityMouseEnter = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    if (!isActivityOpen) {
      openTimerRef.current = setTimeout(() => {
        setIsActivityOpen(true);
        openTimerRef.current = null;
      }, 150);
    }
  };

  const handleActivityMouseLeave = () => {
    if (openTimerRef.current) {
      clearTimeout(openTimerRef.current);
      openTimerRef.current = null;
    }
    closeTimerRef.current = setTimeout(() => {
      setIsActivityOpen(false);
      closeTimerRef.current = null;
    }, 300);
  };

  const handleActivityClick = () => {
    if (openTimerRef.current) {
      clearTimeout(openTimerRef.current);
      openTimerRef.current = null;
    }
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setIsActivityOpen(!isActivityOpen);
  };

  // مدیریت منوی محاسبات
  const handleCalculatorMouseEnter = () => {
    if (calcCloseTimerRef.current) {
      clearTimeout(calcCloseTimerRef.current);
      calcCloseTimerRef.current = null;
    }
    if (!isCalculatorOpen) {
      calcOpenTimerRef.current = setTimeout(() => {
        setIsCalculatorOpen(true);
        calcOpenTimerRef.current = null;
      }, 150);
    }
  };

  const handleCalculatorMouseLeave = () => {
    if (calcOpenTimerRef.current) {
      clearTimeout(calcOpenTimerRef.current);
      calcOpenTimerRef.current = null;
    }
    calcCloseTimerRef.current = setTimeout(() => {
      setIsCalculatorOpen(false);
      calcCloseTimerRef.current = null;
    }, 300);
  };

  const handleCalculatorClick = () => {
    if (calcOpenTimerRef.current) {
      clearTimeout(calcOpenTimerRef.current);
      calcOpenTimerRef.current = null;
    }
    if (calcCloseTimerRef.current) {
      clearTimeout(calcCloseTimerRef.current);
      calcCloseTimerRef.current = null;
    }
    setIsCalculatorOpen(!isCalculatorOpen);
  };

  const handleCalcMegaMenuEnter = () => {
    if (calcCloseTimerRef.current) {
      clearTimeout(calcCloseTimerRef.current);
      calcCloseTimerRef.current = null;
    }
  };

  const handleCalcMegaMenuLeave = () => {
    calcCloseTimerRef.current = setTimeout(() => {
      setIsCalculatorOpen(false);
      calcCloseTimerRef.current = null;
    }, 300);
  };

  const handleMegaMenuEnter = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  const handleMegaMenuLeave = () => {
    closeTimerRef.current = setTimeout(() => {
      setIsActivityOpen(false);
      closeTimerRef.current = null;
    }, 300);
  };

  const activityLabel = language === "fa" ? "فعالیت‌ها" : "Activities";
  const calculatorLabel = language === "fa" ? "محاسبات" : "Calculator";

  return (
    <>
      <header className={styles.header} dir={dir}>
        <div className={`container ${styles.headerContainer}`}>
         <div className={styles.logo}>
  <Link href="/"     
  title="آریا استاد هلدینگ | LSF"
    aria-label="آریا استاد هلدینگ">
    <Image
      src="/images/logo.png"
      alt="آریا استاد هلدینگ"
      width={180}
      height={50}
      priority
      className={styles.logoImage}
    />
  </Link>
</div>

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
                
                {/* <li 
                  className={styles.dropdownWrapper}
                  onMouseEnter={handleActivityMouseEnter}
                  onMouseLeave={handleActivityMouseLeave}
                >
                  <button 
                    className={`${styles.navLink} ${styles.dropdownTrigger} ${isActivityOpen ? styles.dropdownOpen : ""}`}
                    onClick={handleActivityClick}
                  >
                    <Activity size={18} />
                    <span>{activityLabel}</span>
                    <ChevronDown size={14} className={`${styles.dropdownArrow} ${isActivityOpen ? styles.rotated : ""}`} />
                  </button>
                </li> */}

                {/* <li 
                  className={styles.dropdownWrapper}
                  onMouseEnter={handleCalculatorMouseEnter}
                  onMouseLeave={handleCalculatorMouseLeave}
                >
                  <button 
                    className={`${styles.navLink} ${styles.dropdownTrigger} ${isCalculatorOpen ? styles.dropdownOpen : ""}`}
                    onClick={handleCalculatorClick}
                  >
                    <Calculator size={18} />
                    <span>{calculatorLabel}</span>
                    <ChevronDown size={14} className={`${styles.dropdownArrow} ${isCalculatorOpen ? styles.rotated : ""}`} />
                  </button>
                </li> */}
              </ul>
            </nav>
          )}

          <div className={styles.headerRight}>
            {/* این بخش خالی شد - موارد به BreakingNews منتقل شدند */}
            
            {isMobile && (
              <button 
                className={styles.menuToggle}
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* منوی فعالیت‌ها */}
      {/* {!isMobile && isActivityOpen && (
        <div 
          className={styles.megaMenu}
          onMouseEnter={handleMegaMenuEnter}
          onMouseLeave={handleMegaMenuLeave}
        >
          <div className={`container ${styles.megaMenuContainer}`}>
            <div className={styles.megaMenuContent}>
              {activityItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={styles.megaMenuItem}
                  onClick={() => setIsActivityOpen(false)}
                >
                  <span className={styles.megaMenuItemIcon}>
                    <item.icon size={22} />
                  </span>
                  <span className={styles.megaMenuItemLabel}>{item.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )} */}

      {/* منوی محاسبات */}
      {/* {!isMobile && isCalculatorOpen && (
        <div 
          className={styles.megaMenu}
          onMouseEnter={handleCalcMegaMenuEnter}
          onMouseLeave={handleCalcMegaMenuLeave}
        >
          <div className={`container ${styles.megaMenuContainer}`}>
            <div className={styles.megaMenuContent}>
              {calculatorItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={styles.megaMenuItem}
                  onClick={() => setIsCalculatorOpen(false)}
                >
                  <span className={styles.megaMenuItemIcon}>
                    <item.icon size={22} />
                  </span>
                  <span className={styles.megaMenuItemLabel}>{item.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )} */}

      {isMobile && isMenuOpen && (
        <div className={styles.mobileMenu}>
          <nav>
            <ul className={styles.mobileNavList}>
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className={styles.mobileNavLink} onClick={() => setIsMenuOpen(false)}>
                    <item.icon size={20} />
                    <span>{item.label}</span>
                  </Link>
                </li>
              ))}
              
              {/* <li className={styles.mobileDivider}>
                <span className={styles.mobileDividerText}>{activityLabel}</span>
              </li>
              
              {activityItems.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className={styles.mobileNavLink} onClick={() => setIsMenuOpen(false)}>
                    <item.icon size={20} />
                    <span>{item.label}</span>
                  </Link>
                </li>
              ))}

              <li className={styles.mobileDivider}>
                <span className={styles.mobileDividerText}>{calculatorLabel}</span>
              </li>
              
              {calculatorItems.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className={styles.mobileNavLink} onClick={() => setIsMenuOpen(false)}>
                    <item.icon size={20} />
                    <span>{item.label}</span>
                  </Link>
                </li>
              ))} */}
            </ul>
          </nav>
        </div>
      )}
    </>
  );
};

export default Header;