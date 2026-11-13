import { Suspense } from 'react'
import RepairsTechClient from './Client'

export const metadata = {
  title: 'پنل سرویسکار | سلنیرو',
}

export default function RepairsTechPage() {
  return (
    <Suspense fallback={null}>
      <RepairsTechClient />
    </Suspense>
  )
}
