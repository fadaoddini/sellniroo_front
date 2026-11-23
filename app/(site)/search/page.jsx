import SearchSlot from '@/components/modules/SearchSlot'

export const metadata = {
  title: 'جستجو | سایت',
  description: 'جستجو در اخبار، آگهی‌ها و محتوای سایت',
}

export default function SearchPage() {
  return (
    <>
      <h1 className="sr-only">جستجو در سایت</h1>
      <SearchSlot />
    </>
  )
}
