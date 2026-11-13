'use client'

import { useParams } from 'next/navigation'
import SchoolSlot from '@/components/modules/SchoolSlot'
import TeacherPublicProfile from '@/components/School/TeacherPublicProfile'

export default function TeacherPublicPage() {
  const params = useParams()
  const slug = params?.slug ? decodeURIComponent(String(params.slug)) : ''

  return (
    <SchoolSlot>
      <TeacherPublicProfile slug={slug} />
    </SchoolSlot>
  )
}
