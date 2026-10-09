// modules/profile/components/ProfilePage.jsx
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import axios from "axios";
import Config from "@/config/config";
import ProfileHeader from "./ProfileHeader";
import ProfileTabs from "./ProfileTabs";
import ProfileStats from "./ProfileStats";
import JobsList from "./JobsList";
import ApplicationsList from "./ApplicationsList";
import BookmarksList from "./BookmarksList";
import EmptyState from "./EmptyState";
import styles from "../styles/ProfilePage.module.css";
import CompanyTab from "./company/CompanyTab";
import { Loader2, Building2 } from "lucide-react";
import ResumeTab from "./resume/ResumeTab";

const TABS = [
  { key: "hiring", label: "آگهی‌های استخدامی من", icon: "briefcase" },
  { key: "seeking", label: "آگهی‌های کاریابی من", icon: "user" },
  { key: "applications", label: "درخواست‌های ارسالی", icon: "send" },
  { key: "bookmarks", label: "ذخیره‌شده‌ها", icon: "bookmark" },
  { key: "company", label: "شرکت من", icon: "building" },
  { key: "resume", label: "رزومه من", icon: "file-text" },
];

const ProfilePage = () => {
  const { user, isAuthenticated, loading: authLoading, getAuthHeaders } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("hiring");
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  // ✅ هدایت به لاگین اگر کاربر لاگین نیست
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  // ✅ دریافت آمار
const fetchStats = async () => {
  try {
    const headers = getAuthHeaders();
    const res = await axios.get(
      Config.endpoints.jobisell.jobs.myStats(),
      { headers }
    );
    setStats(res.data);
  } catch (err) {
    console.error("Error fetching stats:", err);
    // fallback: صفر بذار
    setStats({
      hiring: { total: 0, approved: 0, pending: 0, rejected: 0, expired: 0, views: 0, likes: 0 },
      seeking: { total: 0, approved: 0, pending: 0, rejected: 0, expired: 0, views: 0 },
      applications: { total: 0, pending: 0, reviewed: 0, accepted: 0, rejected: 0 },
      bookmarks: { total: 0 },
    });
  }
};

  useEffect(() => {
    if (isAuthenticated) {
      setLoading(true);
      fetchStats().finally(() => setLoading(false));
    }
  }, [isAuthenticated, refreshKey]);

  // ✅ مدیریت رفرش بعد از حذف/ویرایش
  const handleRefresh = () => {
    setRefreshKey((k) => k + 1);
  };

  if (authLoading || !isAuthenticated) {
    return (
      <div className={styles.loadingContainer}>
        <Loader2 className={styles.spinner} size={40} />
        <p>در حال بارگذاری...</p>
      </div>
    );
  }

  return (
    <div className={styles.profilePage}>
      <div className={styles.container}>
        {/* هدر پروفایل */}
        <ProfileHeader user={user} />

        {/* آمار */}
        {stats && <ProfileStats stats={stats} />}

        {/* تب‌ها */}
        <ProfileTabs
          tabs={TABS}
          activeTab={activeTab}
          onChange={setActiveTab}
        />

        {/* محتوای تب */}
        <div className={styles.tabContent}>
          {activeTab === "hiring" && (
            <JobsList
              key={`hiring-${refreshKey}`}
              type="hiring"
              onRefresh={handleRefresh}
            />
          )}
          {activeTab === "seeking" && (
            <JobsList
              key={`seeking-${refreshKey}`}
              type="seeking"
              onRefresh={handleRefresh}
            />
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
};

export default ProfilePage;