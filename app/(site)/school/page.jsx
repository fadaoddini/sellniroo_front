import SchoolSlot from '@/components/modules/SchoolSlot'
import SchoolHub from '@/components/School/SchoolHub'

export const metadata = {
  title: 'مدرسه | سلنیرو',
  description: 'داشبورد معلم، دانش‌آموز و مدیریت مدرسه',
}

export default function SchoolPage() {
  return (
    <SchoolSlot>
      <SchoolHub />
    </SchoolSlot>
  )
}
