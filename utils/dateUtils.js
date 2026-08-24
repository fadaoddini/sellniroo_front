// utils/dateUtils.js

/**
 * تبدیل تاریخ میلادی به شمسی
 * @param {string} dateString - تاریخ میلادی به فرمت YYYY-MM-DD
 * @returns {Object} - { year, month, day }
 */
export function toPersianDate(dateString) {
  if (!dateString) return null;
  
  // اگر تاریخ به فرمت YYYY-MM-DD نبود، تبدیلش کن
  let date;
  if (dateString.includes('/')) {
    // احتمالاً تاریخ شمسی هست
    const parts = dateString.split('/');
    if (parts.length === 3) {
      return {
        year: parseInt(parts[0]),
        month: parseInt(parts[1]),
        day: parseInt(parts[2])
      };
    }
  }
  
  try {
    date = new Date(dateString);
    if (isNaN(date.getTime())) {
      console.error('Invalid date:', dateString);
      return null;
    }
  } catch (e) {
    console.error('Error parsing date:', dateString, e);
    return null;
  }

  // الگوریتم تبدیل میلادی به شمسی
  const gregorianYear = date.getFullYear();
  const gregorianMonth = date.getMonth() + 1;
  const gregorianDay = date.getDate();

  // آرایه تعداد روزهای ماه‌های میلادی
  const gDaysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  
  // محاسبه روز سال میلادی
  let gDayOfYear = 0;
  for (let i = 0; i < gregorianMonth - 1; i++) {
    gDayOfYear += gDaysInMonth[i];
  }
  gDayOfYear += gregorianDay;
  
  // سال کبیسه میلادی
  const isLeapGregorian = (gregorianYear % 4 === 0 && gregorianYear % 100 !== 0) || gregorianYear % 400 === 0;
  
  // تنظیم برای سال کبیسه
  if (isLeapGregorian && gregorianMonth > 2) {
    gDayOfYear++;
  }

  // محاسبه سال شمسی
  let persianYear = gregorianYear - 621;
  let persianMonth = 10;
  let persianDay = 1;
  
  // محاسبه روز سال شمسی
  let pDayOfYear = gDayOfYear - 79;
  if (pDayOfYear < 1) {
    persianYear--;
    // سال کبیسه شمسی
    const isLeapPersian = (persianYear % 33 === 1 || persianYear % 33 === 5 || persianYear % 33 === 9 || 
                           persianYear % 33 === 13 || persianYear % 33 === 17 || persianYear % 33 === 22 || 
                           persianYear % 33 === 26 || persianYear % 33 === 30);
    const pDaysInYear = isLeapPersian ? 366 : 365;
    pDayOfYear += pDaysInYear;
  }

  // تبدیل روز سال به ماه و روز
  const pDaysInMonth = [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 29];
  const isLeapPersian = (persianYear % 33 === 1 || persianYear % 33 === 5 || persianYear % 33 === 9 || 
                         persianYear % 33 === 13 || persianYear % 33 === 17 || persianYear % 33 === 22 || 
                         persianYear % 33 === 26 || persianYear % 33 === 30);
  
  // تنظیم روزهای اسفند در سال کبیسه
  if (isLeapPersian) {
    pDaysInMonth[11] = 30;
  }

  let remainingDays = pDayOfYear;
  let month = 0;
  for (let i = 0; i < 12; i++) {
    if (remainingDays <= pDaysInMonth[i]) {
      month = i + 1;
      break;
    }
    remainingDays -= pDaysInMonth[i];
  }

  return {
    year: persianYear,
    month: month,
    day: remainingDays
  };
}

/**
 * دریافت تاریخ امروز به شمسی
 * @returns {Object} - { year, month, day }
 */
export function getTodayPersian() {
  const today = new Date();
  return toPersianDate(today.toISOString().split('T')[0]);
}

/**
 * تبدیل تاریخ شمسی به میلادی
 * @param {number} year - سال شمسی
 * @param {number} month - ماه شمسی (1-12)
 * @param {number} day - روز شمسی (1-31)
 * @returns {string} - تاریخ میلادی به فرمت YYYY-MM-DD
 */
export function persianToGregorian(year, month, day) {
  // آرایه تعداد روزهای ماه‌های شمسی
  const pDaysInMonth = [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 29];
  
  // سال کبیسه شمسی
  const isLeapPersian = (year % 33 === 1 || year % 33 === 5 || year % 33 === 9 || 
                         year % 33 === 13 || year % 33 === 17 || year % 33 === 22 || 
                         year % 33 === 26 || year % 33 === 30);
  
  if (isLeapPersian) {
    pDaysInMonth[11] = 30;
  }

  // محاسبه روز سال شمسی
  let pDayOfYear = 0;
  for (let i = 0; i < month - 1; i++) {
    pDayOfYear += pDaysInMonth[i];
  }
  pDayOfYear += day;

  // محاسبه سال میلادی
  let gregorianYear = year + 621;
  
  // محاسبه روز سال میلادی
  let gDayOfYear = pDayOfYear + 79;
  
  // سال کبیسه میلادی
  const isLeapGregorian = (gregorianYear % 4 === 0 && gregorianYear % 100 !== 0) || gregorianYear % 400 === 0;
  
  // اگر از 365 بیشتر شد، سال بعد
  const gDaysInYear = isLeapGregorian ? 366 : 365;
  if (gDayOfYear > gDaysInYear) {
    gregorianYear++;
    gDayOfYear -= gDaysInYear;
  }

  // تبدیل روز سال به ماه و روز میلادی
  const gDaysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (isLeapGregorian) {
    gDaysInMonth[1] = 29;
  }

  let remainingDays = gDayOfYear;
  let gregorianMonth = 0;
  for (let i = 0; i < 12; i++) {
    if (remainingDays <= gDaysInMonth[i]) {
      gregorianMonth = i + 1;
      break;
    }
    remainingDays -= gDaysInMonth[i];
  }

  // فرمت YYYY-MM-DD
  const monthStr = String(gregorianMonth).padStart(2, '0');
  const dayStr = String(remainingDays).padStart(2, '0');
  
  return `${gregorianYear}-${monthStr}-${dayStr}`;
}

/**
 * فرمت کردن تاریخ شمسی به صورت نمایشی
 * @param {Object} persianDate - { year, month, day }
 * @param {string} format - 'full' | 'short' | 'numeric'
 * @returns {string}
 */
export function formatPersianDate(persianDate, format = 'full') {
  if (!persianDate) return '';
  
  const monthNames = [
    'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
    'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
  ];
  
  const { year, month, day } = persianDate;
  
  if (format === 'numeric') {
    return `${year}/${String(month).padStart(2, '0')}/${String(day).padStart(2, '0')}`;
  }
  
  if (format === 'short') {
    return `${day} ${monthNames[month - 1]}`;
  }
  
  return `${day} ${monthNames[month - 1]} ${year}`;
}

/**
 * بررسی معتبر بودن تاریخ شمسی
 */
export function isValidPersianDate(year, month, day) {
  if (year < 1300 || year > 1500) return false;
  if (month < 1 || month > 12) return false;
  
  const pDaysInMonth = [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 29];
  const isLeap = (year % 33 === 1 || year % 33 === 5 || year % 33 === 9 || 
                   year % 33 === 13 || year % 33 === 17 || year % 33 === 22 || 
                   year % 33 === 26 || year % 33 === 30);
  
  if (month === 12 && isLeap) {
    return day >= 1 && day <= 30;
  }
  
  return day >= 1 && day <= pDaysInMonth[month - 1];
}