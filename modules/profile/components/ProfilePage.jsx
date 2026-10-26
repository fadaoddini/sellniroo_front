// modules/profile/components/ProfilePage.jsx
// ماژول سایت: job_profile ⊂ job_board — از /adminweb فعال/غیرفعال می‌شود
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
import QuizProfilePanel from "./QuizProfilePanel";
import SchoolProfilePanel from "@/components/School/SchoolProfilePanel";
import ShopProfilePanel from "./ShopProfilePanel";
import styles from "../styles/ProfilePage.module.css";
import { Loader2 } from "lucide-react";
import { isSiteModuleActive } from "@/services/siteModules";
import { SITE_MODULE_KEYS } from "@/config/siteModules";

const JOB_TABS = [
  { key: "hiring", label: "آگهی‌های استخدامی", icon: "briefcase" },
  { key: "seeking", label: "آگهی‌های کاریابی", icon: "user" },
  { key: "applications", label: "درخواست‌ها", icon: "send" },
  { key: "bookmarks", label: "ذخیره‌شده‌ها", icon: "bookmark" },
  { key: "company", label: "شرکت من", icon: "building" },
  { key: "resume", label: "رزومه من", icon: "file-text" },
];

const SHOP_TAB = { key: "shop", label: "فروشگاه", icon: "shopping" };
const QUIZ_TAB = { key: "quiz", label: "آزمون‌ها", icon: "brain" };
const SCHOOL_TAB = { key: "school", label: "مدرسه", icon: "school" };

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
  const [quizOn, setQuizOn] = useState(false);
  const [schoolOn, setSchoolOn] = useState(false);
  const [shopOn, setShopOn] = useState(false);

  const tabs = useMemo(() => {
    const list = [...JOB_TABS];
    if (shopOn) list.push(SHOP_TAB);
    if (quizOn) list.push(QUIZ_TAB);
    if (schoolOn) list.push(SCHOOL_TAB);
    return list;
  }, [quizOn, schoolOn, shopOn]);
  const tabKeys = useMemo(() => new Set(tabs.map((t) => t.key)), [tabs]);

  const initialTab = useMemo(() => {
    const q = searchParams.get("tab");
    return q && tabKeys.has(q) ? q : "hiring";
  }, [searchParams, tabKeys]);

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
    let cancelled = false;
    const refresh = () => {
      Promise.all([
        isSiteModuleActive(SITE_MODULE_KEYS.QUIZ, { force: true }),
        isSiteModuleActive(SITE_MODULE_KEYS.SCHOOL, { force: true }),
        isSiteModuleActive(SITE_MODULE_KEYS.SHOP, { force: true }),
      ]).then(([quiz, school, shop]) => {
        if (cancelled) return;
        setQuizOn(!!quiz);
        setSchoolOn(!!school);
        setShopOn(!!shop);
      });
    };
    refresh();
    window.addEventListener("site-modules-changed", refresh);
    return () => {
      cancelled = true;
      window.removeEventListener("site-modules-changed", refresh);
    };
  }, []);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    if (!tabKeys.has(activeTab)) {
      setActiveTab("hiring");
    }
  }, [tabKeys, activeTab]);

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
      if (!tabKeys.has(key)) return;
      setActiveTab(key);
      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", key);
      router.replace(`/profile?${params.toString()}`, { scroll: false });
    },
    [router, searchParams, tabKeys]
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
    <div className={`${styles.profilePage} ${styles.profilePageJob}`}>
      <div className={styles.container}>
        <ProfileHeader user={user} variant="job" showJobShortcuts />

        {activeTab !== "quiz" && activeTab !== "shop" && activeTab !== "school" ? (
          <ProfileStats
            stats={stats}
            loading={statsLoading}
            activeTab={activeTab}
            onSelectTab={handleTabChange}
          />
        ) : null}

        <ProfileTabs
          tabs={tabs}
          activeTab={activeTab}
          onChange={handleTabChange}
          tone="job"
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
          {activeTab === "shop" && shopOn && (
            <ShopProfilePanel key={`shop-${refreshKey}`} />
          )}
          {activeTab === "quiz" && quizOn && (
            <QuizProfilePanel key={`quiz-${refreshKey}`} variant="embedded" />
          )}
          {activeTab === "school" && schoolOn && (
            <SchoolProfilePanel key={`school-${refreshKey}`} />
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
