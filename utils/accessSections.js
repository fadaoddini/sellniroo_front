export const SECTION_ICON_OPTIONS = [
  { value: 'users', fa: 'کاربران', en: 'Users' },
  { value: 'newspaper', fa: 'اخبار', en: 'News' },
  { value: 'settings', fa: 'تنظیمات', en: 'Settings' },
  { value: 'shopping-cart', fa: 'فروش', en: 'Sales' },
  { value: 'briefcase', fa: 'بازاریابی', en: 'Marketing' },
  { value: 'warehouse', fa: 'انبار', en: 'Warehouse' },
  { value: 'headphones', fa: 'پشتیبانی', en: 'Support' },
  { value: 'calendar', fa: 'تقویم', en: 'Calendar' },
  { value: 'shield', fa: 'امنیت', en: 'Security' },
  { value: 'layers', fa: 'عمومی', en: 'General' },
]

export function sectionLabel(sec, language = 'fa') {
  if (!sec) return ''
  if (language === 'en' && sec.name_en) return sec.name_en
  return sec.name_fa || sec.code || ''
}

export function employeeSections(emp) {
  if (Array.isArray(emp?.departments) && emp.departments.length) {
    return emp.departments
  }
  return []
}
