// app/jobs/[id]/page.js
import { notFound } from 'next/navigation';
import JobDetailClient from './JobDetailClient';
import JobsPageSlot from '@/components/modules/JobsPageSlot';
import Config from '@/config/config';
import { isSiteModuleActive } from '@/services/siteModules';
import { SITE_MODULE_KEYS } from '@/config/siteModules';
import {
  getDemoJobById,
  isDemoJobId,
} from '@/components/AllBoxItem/constants/demoJobs';

// دریافت جزئیات آگهی از سرور (SSR) — با پشتیبانی آگهی‌های دمو ویجت
async function getJob(id) {
  if (isDemoJobId(id)) {
    return getDemoJobById(id);
  }

  try {
    const res = await fetch(Config.endpoints.jobisell.jobs.detail(id), {
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      if (res.status === 404) return getDemoJobById(id);
      throw new Error(`Failed to fetch job: ${res.status}`);
    }

    return await res.json();
  } catch (err) {
    console.error('Error fetching job:', err);
    return getDemoJobById(id);
  }
}

// Metadata برای SEO
export async function generateMetadata({ params }) {
  const job = await getJob(params.id);

  if (!job) {
    return {
      title: 'آگهی یافت نشد | آریا استاد',
    };
  }

  return {
    title: `${job.title}${job.is_demo ? ' (دمو)' : ''} | آریا استاد`,
    description: job.description?.substring(0, 160) || 'جزئیات آگهی شغلی',
    openGraph: {
      title: job.title,
      description: job.description?.substring(0, 160),
      images: job.image ? [job.image] : [],
    },
  };
}

export default async function JobDetailPage({ params }) {
  const jobBoardOn = await isSiteModuleActive(SITE_MODULE_KEYS.JOB_BOARD, {
    force: true,
  });
  if (!jobBoardOn) {
    notFound();
  }

  const job = await getJob(params.id);

  if (!job) {
    notFound();
  }

  return (
    <JobsPageSlot>
      <JobDetailClient initialJob={job} />
    </JobsPageSlot>
  );
}
