// app/jobs/[id]/page.js — param می‌تواند id عددی یا slug عنوان باشد
import { notFound, permanentRedirect } from 'next/navigation';
import JobDetailClient from './JobDetailClient';
import JobsPageSlot from '@/components/modules/JobsPageSlot';
import Config from '@/config/config';
import { isSiteModuleActive } from '@/services/siteModules';
import { SITE_MODULE_KEYS } from '@/config/siteModules';
import { getDemoJobByParam } from '@/components/AllBoxItem/constants/demoJobs';
import {
  buildBreadcrumbJsonLd,
  buildJobMetadata,
  buildJobPostingJsonLd,
} from './jobSeo';
import {
  getJobSlug,
  isNumericJobParam,
} from '@/utils/jobSlug';

async function getJob(param) {
  const key = decodeURIComponent(String(param || '')).trim();
  if (!key) return null;

  // دمو: id یا slug
  const demo = getDemoJobByParam(key);
  if (demo) return demo;

  try {
    const res = await fetch(Config.endpoints.jobisell.jobs.detail(key), {
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      if (res.status === 404) return getDemoJobByParam(key);
      throw new Error(`Failed to fetch job: ${res.status}`);
    }

    return await res.json();
  } catch (err) {
    console.error('Error fetching job:', err);
    return getDemoJobByParam(key);
  }
}

export async function generateMetadata({ params }) {
  const param = params?.id;
  const job = await getJob(param);
  return buildJobMetadata(job, param);
}

function JsonLd({ data }) {
  if (!data) return null;
  const json = JSON.stringify(data).replace(/</g, '\\u003c');
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}

export default async function JobDetailPage({ params }) {
  const jobBoardOn = await isSiteModuleActive(SITE_MODULE_KEYS.JOB_BOARD, {
    force: true,
  });
  if (!jobBoardOn) {
    notFound();
  }

  const param = params.id;
  const job = await getJob(param);

  if (!job) {
    notFound();
  }

  const slug = getJobSlug(job);
  // /jobs/9004 → /jobs/مدیر-فروش-...
  if (
    slug &&
    isNumericJobParam(param) &&
    decodeURIComponent(String(param)) !== slug
  ) {
    permanentRedirect(`/jobs/${slug}`);
  }

  const jobPostingLd = buildJobPostingJsonLd(job);
  const breadcrumbLd = buildBreadcrumbJsonLd(job);

  return (
    <JobsPageSlot>
      <JsonLd data={jobPostingLd} />
      <JsonLd data={breadcrumbLd} />
      <JobDetailClient initialJob={job} />
    </JobsPageSlot>
  );
}
