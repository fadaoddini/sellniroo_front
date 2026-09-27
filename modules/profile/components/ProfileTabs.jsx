// modules/profile/components/ProfileTabs.jsx
"use client";

import styles from "../styles/ProfileTabs.module.css";
import { Briefcase, User, Send, Bookmark } from "lucide-react";

const ICONS = {
  briefcase: Briefcase,
  user: User,
  send: Send,
  bookmark: Bookmark,
};

const ProfileTabs = ({ tabs, activeTab, onChange }) => {
  return (
    <div className={styles.tabsWrapper}>
      <div className={styles.tabs} role="tablist">
        {tabs.map((tab) => {
          const Icon = ICONS[tab.icon] || Briefcase;
          const isActive = activeTab === tab.key;

          return (
            <button
              key={tab.key}
              role="tab"
              aria-selected={isActive}
              className={`${styles.tab} ${isActive ? styles.active : ""}`}
              onClick={() => onChange(tab.key)}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ProfileTabs;