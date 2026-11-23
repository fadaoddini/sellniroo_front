'use client'

import { useParams } from 'next/navigation'
import TeacherPublicSlot from '@/components/modules/TeacherPublicSlot'

export default function TeacherPublicPage() {
  const params = useParams()
  const slug = params?.slug ? decodeURIComponent(String(params.slug)) : ''

  return <TeacherPublicSlot slug={slug} />
}
