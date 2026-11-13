import { Suspense } from 'react'
import RepairsManageClient from './Client'

export const metadata = {
  title: 'داشبورد تعمیرات و سرویس | سلنیرو',
}

export default function RepairsManagePage() {
  return (
    <Suspense fallback={null}>
      <RepairsManageClient />
    </Suspense>
  )
}
