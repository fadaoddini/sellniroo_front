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
import { Loader2 } from "lucide-react";

const TABS = [
  { key: "hiring", label: "آگهی‌های استخدامی من", icon: "briefcase" },
  { key: "seeking", label: "آگهی‌های کاریابی من", icon: "user" },
  { key: "applications", label: "درخواست‌های ارسالی", icon: "send" },
  { key: "bookmarks", label: "ذخیره‌شده‌ها", icon: "bookmark" },
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
      const [hiringRes, seekingRes, applicationsRes, bookmarksRes] =
        await Promise.all([
          axios.get(
            Config.endpoints.jobisell.jobs.myListings() + "?type=hiring",
            { headers }
          ),
          axios.get(
            Config.endpoints.jobisell.jobs.myListings() + "?type=seeking",
            { headers }
          ),
          axios.get(Config.endpoints.jobisell.jobs.myApplications(), {
            headers,
          }),
          axios.get(Config.endpoints.jobisell.jobs.myBookmarks(), { headers }),
        ]);

      const hiringData = hiringRes.data?.results || hiringRes.data || [];
      const seekingData = seekingRes.data?.results || seekingRes.data || [];
      const applicationsData =
        applicationsRes.data?.results || applicationsRes.data || [];
      const bookmarksData =
        bookmarksRes.data?.results || bookmarksRes.data || [];

      setStats({
        hiring: {
          total: hiringData.length,
          approved: hiringData.filter((j) => j.status === "approved").length,
          pending: hiringData.filter((j) => j.status === "pending").length,
          rejected: hiringData.filter((j) => j.status === "rejected").length,
          expired: hiringData.filter((j) => j.status === "expired").length,
          views: hiringData.reduce((sum, j) => sum + (j.views_count || 0), 0),
          likes: hiringData.reduce((sum, j) => sum + (j.likes_count || 0), 0),
        },
        seeking: {
          total: seekingData.length,
          approved: seekingData.filter((j) => j.status === "approved").length,
          pending: seekingData.filter((j) => j.status === "pending").length,
          rejected: seekingData.filter((j) => j.status === "rejected").length,
          expired: seekingData.filter((j) => j.status === "expired").length,
          views: seekingData.reduce((sum, j) => sum + (j.views_count || 0), 0),
        },
        applications: {
          total: applicationsData.length,
          pending: applicationsData.filter((a) => a.status === "pending").length,
          reviewed: applicationsData.filter((a) => a.status === "reviewed")
            .length,
          accepted: applicationsData.filter((a) => a.status === "accepted")
            .length,
          rejected: applicationsData.filter((a) => a.status === "rejected")
            .length,
        },
        bookmarks: { total: bookmarksData.length },
      });
    } catch (err) {
      console.error("Error fetching stats:", err);
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
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;