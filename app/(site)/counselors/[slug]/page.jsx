'use client'

import { useParams } from 'next/navigation'
import CounselorPublicSlot from '@/components/modules/CounselorPublicSlot'

export default function CounselorPublicPage() {
  const params = useParams()
  const slug = params?.slug ? decodeURIComponent(String(params.slug)) : ''

  return <CounselorPublicSlot slug={slug} />
}
