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

export const specialties = [
  {
    id: 'field-sales',
    name: 'فروشنده حضوری',
    icon: ShoppingCart,
    description: 'ارزیابی مهارت‌های فروش حضوری و ارتباط رو در رو',
  },
  {
    id: 'telemarketing',
    name: 'فروش تلفنی',
    icon: Phone,
    description: 'سنجش مهارت‌های تماس تلفنی و متقاعدسازی',
  },
  {
    id: 'negotiation',
    name: 'مذاکره و متقاعدسازی',
    icon: Handshake,
    description: 'ارزیابی توانایی مذاکره و اثرگذاری',
  },
  {
    id: 'digital-marketing',
    name: 'بازاریابی دیجیتال',
    icon: Monitor,
    description: 'سنجش دانش سئو، تبلیغات آنلاین و شبکه‌های اجتماعی',
  },
  {
    id: 'sales-management',
    name: 'مدیریت فروش',
    icon: BarChart3,
    description: 'ارزیابی مهارت‌های رهبری تیم فروش و برنامه‌ریزی',
  },
  {
    id: 'b2b-telemarketing',
    name: 'بازاریابی تلفنی B2B',
    icon: Headset,
    description: 'سنجش مهارت تماس با مشتریان تجاری',
  },
  {
    id: 'visiting',
    name: 'ویزیتوری و توزیع',
    icon: Truck,
    description: 'ارزیابی مهارت‌های ویزیت و توزیع محصول',
  },
  {
    id: 'communication-skills',
    name: 'مهارت‌های ارتباطی',
    icon: MessageSquare,
    description: 'سنجش مهارت‌های ارتباط کلامی و غیرکلامی',
  },
  {
    id: 'b2b-sales',
    name: 'فروش B2B',
    icon: Building2,
    description: 'ارزیابی فروش به کسب‌وکارها و سازمان‌ها',
  },
  {
    id: 'b2c-sales',
    name: 'فروش B2C',
    icon: Store,
    description: 'سنجش مهارت فروش به مصرف‌کننده نهایی',
  },
  {
    id: 'crm',
    name: 'مدیریت ارتباط با مشتری (CRM)',
    icon: Contact,
    description: 'ارزیابی کار با سیستم‌های CRM و مدیریت مشتریان',
  },
  {
    id: 'content-marketing',
    name: 'بازاریابی محتوا',
    icon: FileText,
    description: 'سنجش مهارت تولید و توزیع محتوای بازاریابی',
  },
  {
    id: 'retail-sales',
    name: 'فروش خرده‌فروشی',
    icon: ShoppingBag,
    description: 'ارزیابی مهارت‌های فروش در فروشگاه و خرده‌فروشی',
  },
  {
    id: 'pricing',
    name: 'قیمت‌گذاری و پیشنهاد',
    icon: DollarSign,
    description: 'سنجش دانش استراتژی‌های قیمت‌گذاری',
  },
  {
    id: 'ecommerce-sales',
    name: 'فروش آنلاین و ای‌کامرس',
    icon: Globe,
    description: 'ارزیابی مهارت فروش در بستر آنلاین',
  },
  {
    id: 'sales-ethics',
    name: 'اصول و اخلاق حرفه‌ای فروش',
    icon: Scale,
    description: 'سنجش اخلاق حرفه‌ای و رعایت اصول در فروش',
  },
];