'use client'

import NotFoundView from '@/components/common/NotFoundView'

/** ظاهر ۴۰۴ سفارشی — بدون اشاره به وضعیت ماژول‌ها */
export default function ModuleNotFound({
  title = 'صفحه یافت نشد',
  description = 'صفحه‌ای که دنبال آن هستید وجود ندارد یا منتقل شده است.',
  code = '404',
}) {
  return (
    <NotFoundView
      title={title}
      description={description}
      code={code}
      showHints={false}
    />
  )
}
