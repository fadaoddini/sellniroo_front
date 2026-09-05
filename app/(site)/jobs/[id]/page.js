// app/jobs/[id]/page.js
import { notFound } from 'next/navigation'
import { jobListings } from '@/components/AllBoxItem/constants/jobData'
import JobDetailClient from './JobDetailClient'

// تولید مسیرهای استاتیک برای بهبود SEO
export async function generateStaticParams() {
  return jobListings.map((job) => ({
    id: String(job.id),
  }))
}

// متادیتا برای SEO
export async function generateMetadata({ params }) {
  const job = jobListings.find(j => String(j.id) === params.id)
  
  if (!job) {
    return {
      title: 'آگهی یافت نشد',
    }
  }

  return {
    title: `${job.title} | آریا استاد`,
    description: job.description,
    openGraph: {
      title: job.title,
      description: job.description,
      images: job.image ? [job.image] : [],
    },
  }
}

export default function JobDetailPage({ params }) {
  const job = jobListings.find(j => String(j.id) === params.id)
  
  if (!job) {
    notFound()
  }

  return <JobDetailClient job={job} />
}