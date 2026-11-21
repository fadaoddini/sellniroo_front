'use client'

import { useParams } from 'next/navigation'
import SchoolSlot from '@/components/modules/SchoolSlot'
import CounselorPublicProfile from '@/components/School/CounselorPublicProfile'

export default function CounselorPublicPage() {
  const params = useParams()
  const slug = params?.slug ? decodeURIComponent(String(params.slug)) : ''

  return (
    <SchoolSlot>
      <CounselorPublicProfile slug={slug} />
    </SchoolSlot>
  )
}
