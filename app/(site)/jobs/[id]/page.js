// app/jobs/[id]/page.js
import { notFound } from 'next/navigation';
import JobDetailClient from './JobDetailClient';
import Config from '@/config/config';

// دریافت جزئیات آگهی از سرور (SSR/SSG)
async function getJob(id) {
  try {
    const res = await fetch(Config.endpoints.jobisell.jobs.detail(id), {
      next: { revalidate: 60 }, // cache 60 ثانیه
    });

    if (!res.ok) {
      if (res.status === 404) return null;
      throw new Error(`Failed to fetch job: ${res.status}`);
    }

    return await res.json();
  } catch (err) {
    console.error('Error fetching job:', err);
    return null;
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
    title: `${job.title} | آریا استاد`,
    description: job.description?.substring(0, 160) || 'جزئیات آگهی شغلی',
    openGraph: {
      title: job.title,
      description: job.description?.substring(0, 160),
      images: job.image ? [job.image] : [],
    },
  };
}

export default async function JobDetailPage({ params }) {
  const job = await getJob(params.id);

  if (!job) {
    notFound();
  }

  return <JobDetailClient initialJob={job} />;
}