// modules/profile/components/ProfileTabs.jsx
"use client";

import { useRef, useEffect, useCallback } from "react";
import styles from "../styles/ProfileTabs.module.css";
import { Briefcase, User, Send, Bookmark, Building2, FileText, Brain, GraduationCap, ShoppingBag } from "lucide-react";

const ICONS = {
  briefcase: Briefcase,
  user: User,
  send: Send,
  bookmark: Bookmark,
  building: Building2,
  "file-text": FileText,
  brain: Brain,
  school: GraduationCap,
  shopping: ShoppingBag,
};

const ProfileTabs = ({ tabs, activeTab, onChange, tone = "job" }) => {
  const listRef = useRef(null);
  const btnRefs = useRef({});
  const toneClass = tone === "basic" ? styles.toneBasic : styles.toneJob;

  useEffect(() => {
    const el = btnRefs.current[activeTab];
    if (el?.scrollIntoView) {
      el.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    }
  }, [activeTab]);

  const onKeyDown = useCallback(
    (e) => {
      const idx = tabs.findIndex((t) => t.key === activeTab);
      if (idx < 0) return;
      let next = idx;
      if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        e.preventDefault();
        const dir = e.key === "ArrowLeft" ? 1 : -1; // RTL
        next = (idx + dir + tabs.length) % tabs.length;
        onChange(tabs[next].key);
        btnRefs.current[tabs[next].key]?.focus();
      } else if (e.key === "Home") {
        e.preventDefault();
        onChange(tabs[0].key);
        btnRefs.current[tabs[0].key]?.focus();
      } else if (e.key === "End") {
        e.preventDefault();
        const last = tabs[tabs.length - 1];
        onChange(last.key);
        btnRefs.current[last.key]?.focus();
      }
    },
    [tabs, activeTab, onChange]
  );

  return (
    <div className={`${styles.tabsWrapper} ${toneClass}`}>
      <div
        ref={listRef}
        className={styles.tabs}
        role="tablist"
        aria-label="بخش‌های پروفایل"
        onKeyDown={onKeyDown}
      >
        {tabs.map((tab) => {
          const Icon = ICONS[tab.icon] || Briefcase;
          const isActive = activeTab === tab.key;

          return (
            <button
              key={tab.key}
              ref={(node) => {
                btnRefs.current[tab.key] = node;
              }}
              type="button"
              role="tab"
              id={`tab-${tab.key}`}
              aria-selected={isActive}
              aria-controls={`panel-${tab.key}`}
              tabIndex={isActive ? 0 : -1}
              className={`${styles.tab} ${isActive ? styles.active : ""}`}
              onClick={() => onChange(tab.key)}
            >
              <Icon size={16} aria-hidden />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ProfileTabs;
