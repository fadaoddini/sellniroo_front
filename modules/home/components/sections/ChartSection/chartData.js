export const chartData = {
  id: 'holding',
  name: 'هلدینگ آریا اِستاد',
  type: 'holding',
  icon: '🏢',
  level: 0,
  color: '#800020',
  description: 'هلدینگ پیشرو در صنعت ساخت و ساز',
  url: 'https://aryagroup.com', // لینک وب‌سایت هلدینگ
  children: [
    {
      id: 'company1',
      name: 'آریا سازه LSF',
      type: 'company',
      icon: '🏗️',
      level: 1,
      color: '#2d4a3e',
      description: 'تولید و اجرای سازه‌های سبک فولادی',
      url: 'https://aryagroup.com/arya-lsf', // لینک وب‌سایت شرکت
      children: [
        {
          id: 'dept1-1',
          name: 'تولید پروفیل',
          type: 'department',
          icon: '⚙️',
          level: 2,
          color: '#4a6b5c',
          description: 'تولید پروفیل‌های گالوانیزه',
          url: 'https://aryagroup.com/arya-lsf/production', // لینک وب‌سایت بخش
          activities: ['تولید پروفیل C', 'تولید پروفیل U', 'تولید اتصالات']
        },
        {
          id: 'dept1-2',
          name: 'اجرا و نصب',
          type: 'department',
          icon: '🔧',
          level: 2,
          color: '#4a6b5c',
          description: 'اجرای حرفه‌ای سازه‌های LSF',
          url: 'https://aryagroup.com/arya-lsf/installation',
          activities: ['نصب پروفیل‌ها', 'جوشکاری و اتصالات', 'اجرای سقف و دیوار']
        },
        {
          id: 'dept1-3',
          name: 'مهندسی و طراحی',
          type: 'department',
          icon: '📐',
          level: 2,
          color: '#4a6b5c',
          description: 'طراحی و مهندسی سازه‌های LSF',
          url: 'https://aryagroup.com/arya-lsf/engineering',
          activities: ['طراحی سازه', 'محاسبات فنی', 'نقشه‌برداری']
        }
      ]
    },
    {
      id: 'company2',
      name: 'آریا کناف',
      type: 'company',
      icon: '🪟',
      level: 1,
      color: '#2d4a3e',
      description: 'تولید و اجرای سیستم‌های کناف',
      url: 'https://aryagroup.com/arya-knauf',
      children: [
        {
          id: 'dept2-1',
          name: 'تولید پنل',
          type: 'department',
          icon: '🏭',
          level: 2,
          color: '#4a6b5c',
          description: 'تولید پنل‌های گچی با کیفیت بالا',
          url: 'https://aryagroup.com/arya-knauf/panel-production',
          activities: ['تولید پنل گچی', 'تولید کناف سقفی', 'تولید کناف دیواری']
        },
        {
          id: 'dept2-2',
          name: 'اجرای کناف',
          type: 'department',
          icon: '🛠️',
          level: 2,
          color: '#4a6b5c',
          description: 'اجرای تخصصی سیستم‌های کناف',
          url: 'https://aryagroup.com/arya-knauf/installation',
          activities: ['اجرای سقف کاذب', 'اجرای دیوار کناف', 'اجرای دکوراسیون']
        }
      ]
    },
    {
      id: 'company3',
      name: 'آریا ساختمان',
      type: 'company',
      icon: '🏠',
      level: 1,
      color: '#2d4a3e',
      description: 'ساخت و ساز مسکونی و تجاری',
      url: 'https://aryagroup.com/arya-construction',
      children: [
        {
          id: 'dept3-1',
          name: 'ساخت مسکونی',
          type: 'department',
          icon: '🏘️',
          level: 2,
          color: '#4a6b5c',
          description: 'ساخت ویلایی و آپارتمانی',
          url: 'https://aryagroup.com/arya-construction/residential',
          activities: ['ساخت ویلای لوکس', 'ساخت آپارتمان', 'بازسازی ساختمان']
        },
        {
          id: 'dept3-2',
          name: 'ساخت تجاری',
          type: 'department',
          icon: '🏬',
          level: 2,
          color: '#4a6b5c',
          description: 'ساخت مراکز تجاری و اداری',
          url: 'https://aryagroup.com/arya-construction/commercial',
          activities: ['ساخت مراکز خرید', 'ساخت ساختمان‌های اداری', 'ساخت هتل']
        },
        {
          id: 'dept3-3',
          name: 'مدیریت پروژه',
          type: 'department',
          icon: '📋',
          level: 2,
          color: '#4a6b5c',
          description: 'مدیریت و نظارت بر پروژه‌ها',
          url: 'https://aryagroup.com/arya-construction/project-management',
          activities: ['مدیریت پروژه', 'نظارت فنی', 'کنترل کیفیت']
        }
      ]
    },
    {
      id: 'company4',
      name: 'آریا صنعت',
      type: 'company',
      icon: '🏭',
      level: 1,
      color: '#2d4a3e',
      description: 'صنایع و تجهیزات ساختمانی',
      url: 'https://aryagroup.com/arya-industry',
      children: [
        {
          id: 'dept4-1',
          name: 'تجهیزات ساختمانی',
          type: 'department',
          icon: '🔩',
          level: 2,
          color: '#4a6b5c',
          description: 'تولید و تامین تجهیزات ساختمانی',
          url: 'https://aryagroup.com/arya-industry/equipment',
          activities: ['تجهیزات اسکلت فلزی', 'تجهیزات بتنی', 'تجهیزات تاسیساتی']
        },
        {
          id: 'dept4-2',
          name: 'ماشین‌آلات',
          type: 'department',
          icon: '🚜',
          level: 2,
          color: '#4a6b5c',
          description: 'تامین ماشین‌آلات سنگین',
          url: 'https://aryagroup.com/arya-industry/machinery',
          activities: ['جرثقیل', 'بابکت', 'تراک میکسر']
        }
      ]
    }
  ]
};