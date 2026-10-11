// modules/profile/components/ProfilePage.jsx
"use client";

import { useState, useEffect, useCallback, useMemo, Suspense } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import Config from "@/config/config";
import ProfileHeader from "./ProfileHeader";
import ProfileTabs from "./ProfileTabs";
import ProfileStats from "./ProfileStats";
import JobsList from "./JobsList";
import ApplicationsList from "./ApplicationsList";
import BookmarksList from "./BookmarksList";
import CompanyTab from "./company/CompanyTab";
import ResumeTab from "./resume/ResumeTab";
import styles from "../styles/ProfilePage.module.css";
import { Loader2 } from "lucide-react";

const TABS = [
  { key: "hiring", label: "آگهی‌های استخدامی", icon: "briefcase" },
  { key: "seeking", label: "آگهی‌های کاریابی", icon: "user" },
  { key: "applications", label: "درخواست‌ها", icon: "send" },
  { key: "bookmarks", label: "ذخیره‌شده‌ها", icon: "bookmark" },
  { key: "company", label: "شرکت من", icon: "building" },
  { key: "resume", label: "رزومه من", icon: "file-text" },
];

const TAB_KEYS = new Set(TABS.map((t) => t.key));

const EMPTY_STATS = {
  hiring: { total: 0, approved: 0, pending: 0, rejected: 0, expired: 0, views: 0, likes: 0 },
  seeking: { total: 0, approved: 0, pending: 0, rejected: 0, expired: 0, views: 0 },
  applications: { total: 0, pending: 0, reviewed: 0, accepted: 0, rejected: 0 },
  bookmarks: { total: 0 },
};

function ProfilePageInner() {
  const { user, isAuthenticated, loading: authLoading, getAuthHeaders } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialTab = useMemo(() => {
    const q = searchParams.get("tab");
    return q && TAB_KEYS.has(q) ? q : "hiring";
  }, [searchParams]);

  const [activeTab, setActiveTab] = useState(initialTab);
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace("/login?next=/profile");
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const fetchStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      const res = await axios.get(Config.endpoints.jobisell.jobs.myStats(), {
        headers: getAuthHeaders(),
      });
      setStats(res.data || EMPTY_STATS);
    } catch {
      setStats(EMPTY_STATS);
    } finally {
      setStatsLoading(false);
    }
  }, [getAuthHeaders]);

  useEffect(() => {
    if (!isAuthenticated) return undefined;
    fetchStats();
  }, [isAuthenticated, refreshKey, fetchStats]);

  const handleTabChange = useCallback(
    (key) => {
      if (!TAB_KEYS.has(key)) return;
      setActiveTab(key);
      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", key);
      router.replace(`/profile?${params.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  const handleRefresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  if (authLoading || !isAuthenticated) {
    return (
      <div className={styles.loadingContainer} role="status" aria-live="polite">
        <Loader2 className={styles.spinner} size={36} />
        <p>در حال بارگذاری پروفایل...</p>
      </div>
    );
  }

  return (
    <div className={styles.profilePage}>
      <div className={styles.container}>
        <ProfileHeader user={user} />

        <ProfileStats
          stats={stats}
          loading={statsLoading}
          activeTab={activeTab}
          onSelectTab={handleTabChange}
        />

        <ProfileTabs
          tabs={TABS}
          activeTab={activeTab}
          onChange={handleTabChange}
        />

        <div className={styles.tabContent} role="tabpanel" id={`panel-${activeTab}`}>
          {activeTab === "hiring" && (
            <JobsList key={`hiring-${refreshKey}`} type="hiring" onRefresh={handleRefresh} />
          )}
          {activeTab === "seeking" && (
            <JobsList key={`seeking-${refreshKey}`} type="seeking" onRefresh={handleRefresh} />
          )}
          {activeTab === "applications" && (
            <ApplicationsList key={`apps-${refreshKey}`} />
          )}
          {activeTab === "bookmarks" && (
            <BookmarksList key={`bm-${refreshKey}`} />
          )}
          {activeTab === "company" && (
            <CompanyTab key={`company-${refreshKey}`} onRefresh={handleRefresh} />
          )}
          {activeTab === "resume" && (
            <ResumeTab key={`resume-${refreshKey}`} onRefresh={handleRefresh} />
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense
      fallback={
        <div className={styles.loadingContainer}>
          <Loader2 className={styles.spinner} size={36} />
          <p>در حال بارگذاری پروفایل...</p>
        </div>
      }
    >
      <ProfilePageInner />
    </Suspense>
  );
}
