// app/(site)/jobs/[id]/jobSeo.js — helpers سئوی صفحه سینگل آگهی

import { getFullImageUrl } from '@/utils/imageUrl';
import { getJobSlug } from '@/utils/jobSlug';

export const JOB_SITE_NAME = 'آریا استاد';
export const JOB_SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.NEXT_PUBLIC_APP_URL ||
  'https://sellniroo.com'
).replace(/\/$/, '');

const DEFAULT_OG_IMAGE = `${JOB_SITE_URL}/images/logo.png`;

/** حذف HTML و فشرده‌سازی فاصله‌ها برای meta description */
export function plainText(value, max = 160) {
  if (!value) return '';
  const text = String(value)
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1).trim()}…`;
}

export function absoluteMediaUrl(path) {
  const full = getFullImageUrl(path);
  if (!full) return null;
  if (full.startsWith('http://') || full.startsWith('https://')) return full;
  return `${JOB_SITE_URL}${full.startsWith('/') ? full : `/${full}`}`;
}

export function jobCanonicalUrl(jobOrId) {
  if (jobOrId && typeof jobOrId === 'object') {
    const slug = getJobSlug(jobOrId);
    return `${JOB_SITE_URL}/jobs/${slug || jobOrId.id}`;
  }
  return `${JOB_SITE_URL}/jobs/${jobOrId}`;
}

function mapEmploymentType(name = '') {
  const n = String(name).toLowerCase();
  if (n.includes('پاره') || n.includes('part')) return 'PART_TIME';
  if (n.includes('دورکار') || n.includes('remote')) return 'FULL_TIME';
  if (n.includes('پروژه') || n.includes('قرارداد') || n.includes('contract')) {
    return 'CONTRACTOR';
  }
  if (n.includes('کارآموزی') || n.includes('intern')) return 'INTERN';
  return 'FULL_TIME';
}

function buildBaseSalary(job) {
  const currency = 'IRR';
  const min = Number(job.min_salary) || 0;
  const max = Number(job.max_salary) || 0;
  if (!min && !max) return undefined;

  if (min && max && min !== max) {
    return {
      '@type': 'MonetaryAmount',
      currency,
      value: {
        '@type': 'QuantitativeValue',
        minValue: min,
        maxValue: max,
        unitText: 'MONTH',
      },
    };
  }

  return {
    '@type': 'MonetaryAmount',
    currency,
    value: {
      '@type': 'QuantitativeValue',
      value: min || max,
      unitText: 'MONTH',
    },
  };
}

function buildJobLocation(job) {
  const city = job.city_name || '';
  const province = job.province_name || '';
  if (!city && !province) {
    return {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        addressCountry: 'IR',
      },
    };
  }

  return {
    '@type': 'Place',
    address: {
      '@type': 'PostalAddress',
      addressLocality: city || undefined,
      addressRegion: province || undefined,
      addressCountry: 'IR',
    },
  };
}

/** اسکیما JobPosting فقط برای آگهی استخدام */
export function buildJobPostingJsonLd(job) {
  if (!job || job.is_demo) return null;
  if (job.type && job.type !== 'hiring') return null;

  const url = jobCanonicalUrl(job);
  const description =
    plainText(job.description, 5000) ||
    `${job.title} — آگهی استخدام در ${JOB_SITE_NAME}`;
  const coop = job.cooperation_type_name || '';
  const isRemote = String(coop).includes('دورکار');

  const json = {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: job.title,
    description,
    datePosted: job.published_at || job.created_at || undefined,
    validThrough: job.expires_at || undefined,
    employmentType: mapEmploymentType(coop),
    hiringOrganization: {
      '@type': 'Organization',
      name: job.company_name || JOB_SITE_NAME,
      sameAs: JOB_SITE_URL,
      logo: absoluteMediaUrl(job.company_logo) || undefined,
    },
    jobLocation: buildJobLocation(job),
    url,
    identifier: {
      '@type': 'PropertyValue',
      name: JOB_SITE_NAME,
      value: String(job.id),
    },
    directApply: true,
  };

  if (isRemote) {
    json.jobLocationType = 'TELECOMMUTE';
    json.applicantLocationRequirements = {
      '@type': 'Country',
      name: 'IR',
    };
  }

  const salary = buildBaseSalary(job);
  if (salary) json.baseSalary = salary;

  if (job.experience_level_name) {
    json.experienceRequirements = job.experience_level_name;
  }
  if (job.education_level_name) {
    json.educationRequirements = job.education_level_name;
  }

  return json;
}

export function buildBreadcrumbJsonLd(job) {
  if (!job) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'خانه',
        item: JOB_SITE_URL,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'آگهی‌های شغلی',
        item: `${JOB_SITE_URL}/jobs`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: job.title,
        item: jobCanonicalUrl(job),
      },
    ],
  };
}

export function buildJobMetadata(job, id) {
  if (!job) {
    return {
      title: `آگهی یافت نشد | ${JOB_SITE_NAME}`,
      robots: { index: false, follow: false },
    };
  }

  const url = jobCanonicalUrl(job);
  const isDemo = Boolean(job.is_demo);
  const isHiring = !job.type || job.type === 'hiring';
  const location = [job.city_name, job.province_name].filter(Boolean).join('، ');
  const company = job.company_name || '';

  const titleParts = [job.title];
  if (company && isHiring) titleParts.push(company);
  if (location) titleParts.push(location);
  const title = `${titleParts.join(' | ')}${isDemo ? ' (دمو)' : ''} | ${JOB_SITE_NAME}`;

  const descFallback = isHiring
    ? `استخدام ${job.title}${company ? ` در ${company}` : ''}${
        location ? ` — ${location}` : ''
      } | کاریابی ${JOB_SITE_NAME}`
    : `آگهی کارجو: ${job.title}${location ? ` — ${location}` : ''} | ${JOB_SITE_NAME}`;

  const description =
    plainText(job.description, 160) || plainText(descFallback, 160);

  const image =
    absoluteMediaUrl(job.image) ||
    absoluteMediaUrl(job.company_logo) ||
    DEFAULT_OG_IMAGE;

  const keywords = [
    job.title,
    company,
    location,
    job.cooperation_type_name,
    job.category_name,
    job.job_title_name,
    isHiring ? 'استخدام' : 'کارجو',
    'کاریابی',
    JOB_SITE_NAME,
  ].filter(Boolean);

  return {
    title,
    description,
    keywords,
    authors: [{ name: company || JOB_SITE_NAME }],
    creator: JOB_SITE_NAME,
    publisher: JOB_SITE_NAME,
    category: isHiring ? 'استخدام' : 'کارجو',
    alternates: {
      canonical: url,
    },
    openGraph: {
      type: isHiring ? 'website' : 'profile',
      locale: 'fa_IR',
      url,
      siteName: JOB_SITE_NAME,
      title: job.title,
      description,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: job.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: job.title,
      description,
      images: [image],
    },
    robots: isDemo
      ? {
          index: false,
          follow: false,
          googleBot: { index: false, follow: false },
        }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
          },
        },
    other: {
      'og:locale:alternate': 'en_US',
    },
  };
}
