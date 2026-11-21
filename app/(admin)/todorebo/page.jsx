import { Suspense } from 'react'
import { TodoReboModule } from '@/modules/todorebo'

export const metadata = {
  title: 'میزکار قرارداد ربو',
  description: 'اقساط و مراحل قرارداد موتور ربو',
}

export default function TodoReboPage() {
  return (
    <Suspense fallback={null}>
      <TodoReboModule />
    </Suspense>
  )
}
