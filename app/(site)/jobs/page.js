// app/jobs/page.js
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import JobsPageClient from './JobsPageClient';
import { isSiteModuleActive } from '@/services/siteModules';
import { SITE_MODULE_KEYS } from '@/config/siteModules';

// ============================================
// ✅ Metadata داینامیک بر اساس Query String
// ============================================
export async function generateMetadata({ searchParams }) {
  const q = searchParams?.q || '';
  const city = searchParams?.city || '';

  let title = 'آگهی‌های شغلی | آریا استاد';
  let description = 'جستجو در بین هزاران آگهی استخدام و کارجو در سراسر ایران';

  if (q) {
    title = `نتایج جستجو برای «${q}» | آریا استاد`;
    description = `آگهی‌های شغلی مرتبط با «${q}» - استخدام و کارجو در آریا استاد`;
  }

  return {
    title,
    description,
    openGraph: {
      title,
      description,
    },
  };
}

// ============================================
// ✅ صفحه اصلی
// ============================================
export default async function JobsPage() {
  const jobBoardOn = await isSiteModuleActive(SITE_MODULE_KEYS.JOB_BOARD, {
    force: true,
  });
  if (!jobBoardOn) {
    notFound();
  }

  return (
    <Suspense fallback={<JobsPageLoading />}>
      <JobsPageClient />
    </Suspense>
  );
}

// ============================================
// ✅ حالت بارگذاری
// ============================================
function JobsPageLoading() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
      color: '#666',
      fontFamily: 'iran, Tahoma, Arial, sans-serif',
    }}>
      در حال بارگذاری...
    </div>
  );
}