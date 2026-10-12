// components/Quiz/specialties.js
// ============================================
// تخصص‌های آزمون سلنیرو
// محوریت: استخدام فروش و بازاریابی
// ============================================
import {
  ShoppingCart,
  Phone,
  Handshake,
  Monitor,
  BarChart3,
  Headset,
  Truck,
  MessageSquare,
  Building2,
  Store,
  Contact,
  FileText,
  ShoppingBag,
  DollarSign,
  Globe,
  Scale,
} from 'lucide-react';

export const specialtyIconMap = {
  'field-sales': ShoppingCart,
  telemarketing: Phone,
  negotiation: Handshake,
  'digital-marketing': Monitor,
  'sales-management': BarChart3,
  'b2b-telemarketing': Headset,
  visiting: Truck,
  'communication-skills': MessageSquare,
  'b2b-sales': Building2,
  'b2c-sales': Store,
  crm: Contact,
  'content-marketing': FileText,
  'retail-sales': ShoppingBag,
  pricing: DollarSign,
  'ecommerce-sales': Globe,
  'sales-ethics': Scale,
}

/** @deprecated از API استفاده کنید؛ فقط برای سازگاری نگه داشته شده */
export const specialties = Object.entries(specialtyIconMap).map(([id, icon]) => ({
  id,
  icon,
  name: id,
  description: '',
}))