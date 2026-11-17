import { TodoServiceModule } from '@/modules/todoservice'
import './todo-service-theme.css'

export const metadata = {
  title: 'میزکار سرویس',
  description: 'مدیریت پرونده‌های سرویس و تعمیر',
}

export default function TodoServicePage() {
  return <TodoServiceModule />
}