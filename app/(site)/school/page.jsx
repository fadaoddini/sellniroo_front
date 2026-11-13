import SchoolSlot from '@/components/modules/SchoolSlot'
import ModulePageShell from '@/components/layout/ModulePageShell'

export const metadata = {
  title: 'مدرسه | سلنیرو',
  description: 'سامانه یکپارچه مدرسه — کارنامه، مشاور، معلم و دانش‌آموز',
}

export default function SchoolPage() {
  return (
    <SchoolSlot>
      <ModulePageShell pageKey="school" />
    </SchoolSlot>
  )
}
