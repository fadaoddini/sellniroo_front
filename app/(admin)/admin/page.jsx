
import StatsCards from "@/components/Admin/StatsCards/StatsCards";
import DataTable from "@/components/Admin/DataTable/DataTable";
import styles from "./page.module.css";

const statsData = [
  {
    title: "کل کاربران",
    value: "۱,۲۴۷",
    change: "+۱۲٪",
    icon: "Users",
  },
  {
    title: "آگهی‌های فعال",
    value: "۳۴۲",
    change: "+۸٪",
    icon: "Newspaper",
  },
  {
    title: "دسته بندی‌ها",
    value: "۱۸",
    change: "۰",
    icon: "FolderTree",
  },
  {
    title: "بازدید امروز",
    value: "۴,۸۲۹",
    change: "+۲۳٪",
    icon: "Eye",
  },
];

const recentAds = [
  {
    id: 1,
    title: "فروشنده حرفه‌ای",
    company: "آریا استاد",
    status: "فعال",
    date: "۱۴۰۴/۰۱/۱۵",
  },
  {
    id: 2,
    title: "بازاریاب دیجیتال",
    company: "رضا محمدی",
    status: "در انتظار",
    date: "۱۴۰۴/۰۱/۱۴",
  },
  {
    id: 3,
    title: "مشاور فروش",
    company: "آریا استاد",
    status: "فعال",
    date: "۱۴۰۴/۰۱/۱۳",
  },
];

const columns = [
  {
    key: "title",
    label: "عنوان",
  },
  {
    key: "company",
    label: "شرکت",
  },
  {
    key: "status",
    label: "وضعیت",
  },
  {
    key: "date",
    label: "تاریخ",
  },
];

export default function AdminDashboard() {
  return (
    <div className={styles.dashboard}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>داشبورد</h1>

        <p className={styles.pageDesc}>
          خلاصه وضعیت سامانه
        </p>
      </div>

      <StatsCards stats={statsData} />

      <div className={styles.recentSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>
            آخرین آگهی‌ها
          </h2>

          <button className={styles.viewAllBtn}>
            مشاهده همه
          </button>
        </div>

        <DataTable
          data={recentAds}
          columns={columns}
        />
      </div>
    </div>
  );
}
