import { TodoModule } from '@/modules/todo'
import './todo-theme.css'

export const metadata = {
  title: 'میزکار وظایف',
  description: 'مدیریت فعالیت ها',
}

export default function TodoPage() {
  return <TodoModule />
}
