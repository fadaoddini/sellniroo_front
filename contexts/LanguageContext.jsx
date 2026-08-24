'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

// داده‌های ترجمه مستقیم در فایل
const translations = {
  fa: {
    home: {
      hero: {
        badge: "پیشرو در صنعت ساخت و ساز",
        title: "هلدینگ آریا اِستاد",
        titleHighlight: "",
        subtitle: "",
        description: "با بیش از یک دهه تجربه درخشان در زمینه مشاوره، طراحی و اجرای سازه‌های مسکونی، صنعتی و تجاری با استفاده از جدیدترین تکنولوژی‌های روز دنیا",
        primaryBtn: "مشاوره رایگان",
        secondaryBtn: "بیشتر بدانید"
      },
      stats: [
        { 
          value: '۲۵+', 
          label: 'سال تجربه',
          title: '۱۵ سال تجربه درخشان',
          desc: 'مشاهده روند پیشرفت و تجربه ما در صنعت ساخت و ساز',
          badge: '🏆 سال‌ها تجربه'
        },
        { 
          value: '۱۷۰۰+', 
          label: 'پروژه موفق',
          title: 'بیش از ۱۷۰۰ پروژه موفق',
          desc: 'نمونه‌ای از پروژه‌های مسکونی، صنعتی و تجاری',
          badge: '🏗️ پروژه‌های موفق'
        },
        { 
          value: '۵', 
          label: 'کارخانه فعال',
          title: '۵ کارخانه فعال در سراسر کشور',
          desc: 'تولید انبوه سازه‌های LSF با تکنولوژی روز',
          badge: '🏭 کارخانه‌های ما'
        },
        { 
          value: '۱۰۰+', 
          label: 'همکار',
          title: 'تیمی متشکل از ۱۰۰+ همکار',
          desc: 'همکاران متخصص در زمینه اجرای پروژه‌های عمرانی',
          badge: '👥 تیم حرفه‌ای'
        },
        { 
          value: '۹۶%', 
          label: 'رضایت مشتری',
          title: '۹۶٪ رضایت مشتریان',
          desc: 'نظرات و بازخوردهای مثبت مشتریان از پروژه‌های ما',
          badge: '⭐ رضایت مشتریان'
        }
      ],
      features: {
        title: "حوزه‌های",
        titleHighlight: "فعالیت",
        subtitle: "تخصص‌های ما در صنعت ساخت و ساز",
        items: [
          { title: "بزرگترین تولید کننده LSF", desc: "پیشرو در تولید سازه‌های سبک فولادی در ایران با بالاترین کیفیت" },
          { title: "تولید کننده کناف", desc: "تولید و اجرای سیستم‌های کناف با استانداردهای روز دنیا" },
          { title: "سازه‌های مسکونی", desc: "مشاوره، طراحی و اجرای سازه‌های مسکونی مدرن و مقاوم" },
          { title: "مقاوم در برابر زلزله", desc: "سازه‌های LSF با مقاومت بالا در برابر زلزله و حوادث طبیعی" }
        ]
      },
      services: {
        title: "خدمات",
        titleHighlight: "تخصصی",
        subtitle: "راهکارهای جامع ساخت و ساز",
        items: [
          { title: "سازه‌های LSF", desc: "طراحی و اجرای سازه‌های سبک فولادی با بالاترین کیفیت و سرعت" },
          { title: "سیستم‌های کناف", desc: "تولید و اجرای حرفه‌ای کناف برای ساختمان‌های مدرن" },
          { title: "طراحی معماری", desc: "مشاوره و طراحی معماری مدرن متناسب با نیاز شما" },
          { title: "اجرای سازه", desc: "اجرای سریع و حرفه‌ای سازه‌های مسکونی و تجاری" }
        ]
      },
      advantages: {
        title: "چرا",
        titleHighlight: "ما",
        subtitle: "مزایای همکاری با بزرگترین تولید کننده LSF ایران",
        items: [
          { title: "سرعت اجرا", desc: "کاهش ۵۰٪ زمان اجرا نسبت به روش‌های سنتی" },
          { title: "کیفیت تضمینی", desc: "استانداردهای بین‌المللی در تولید و اجرا" },
          { title: "سازگار با محیط زیست", desc: "استفاده از مواد قابل بازیافت و سازگار با محیط زیست" },
          { title: "صرفه‌جویی اقتصادی", desc: "کاهش هزینه‌های ساخت و افزایش بهره‌وری" }
        ]
      },
      projects: {
        title: "پروژه‌های",
        titleHighlight: "انجام شده",
        subtitle: "نمونه‌هایی از پروژه‌های موفق شرکت ساختمانی آریال اس اف",
        hint: "🔄 خط وسط را بکشید تا تغییرات را مشاهده کنید | برای مشاهده پروژه‌های دیگر روی تصاویر کناری کلیک کنید",
        beforeLabel: "قبل از اجرا",
        afterLabel: "بعد از اجرا",
        dragHint: "بکشید",
        dragHintVertical: "بکشید",
        project1: "سازه LSF مسکونی",
        project1Desc: "پروژه مسکونی ۴ طبقه با سازه LSF در تهران",
        project2: "ویلای لوکس",
        project2Desc: "طراحی و اجرای ویلای لوکس با سیستم کناف",
        project3: "سازه صنعتی LSF",
        project3Desc: "سوله صنعتی با سازه سبک فولادی",
        project4: "کناف مدرن",
        project4Desc: "طراحی و اجرای کناف در ساختمان اداری",
        project5: "مجتمع مسکونی",
        project5Desc: "مجتمع مسکونی ۵ طبقه با سازه LSF",
        project6: "سوله ورزشی",
        project6Desc: "سوله ورزشی با سازه LSF و کناف",
        project7: "ساختمان اداری",
        project7Desc: "ساختمان اداری ۸ طبقه با سیستم کناف",
        project8: "مجتمع تجاری",
        project8Desc: "مجتمع تجاری با سازه LSF مدرن",
        project9: "سازه LSF صنعتی",
        project9Desc: "کارخانه تولیدی با سازه LSF",
        project10: "ویلای مدرن",
        project10Desc: "ویلای مدرن با طراحی کناف و LSF"
      },
      certificates: {
        title: "🏆 افتخارات و گواهینامه‌ها",
        subtitle: "دارای گواهینامه‌های معتبر بین‌المللی و استانداردهای جهانی",
        items: ["ISO 9001", "CE Mark", "کیفیت برتر", "مقاوم در زلزله"]
      },
      cta: {
        title: "آماده همکاری با ما هستید؟",
        subtitle: "همین امروز با کارشناسان ما تماس بگیرید و از مشاوره رایگان بهره‌مند شوید",
        btn: "دریافت مشاوره"
      }
    }
  },
  en: {
    home: {
      hero: {
        badge: "Leader in Construction Industry",
        title: "Aria Stud Holding",
        titleHighlight: "",
        subtitle: "",
        description: "With over a decade of excellence in consulting, design, and execution of residential, industrial, and commercial structures using the latest world-class technologies",
        primaryBtn: "Free Consultation",
        secondaryBtn: "Learn More"
      },
      stats: [
        { 
          value: '25+', 
          label: 'Years Experience',
          title: '15 Years of Excellence',
          desc: 'Witness our growth and expertise in the construction industry',
          badge: '🏆 Years of Experience'
        },
        { 
          value: '1700+', 
          label: 'Successful Projects',
          title: 'Over 1700 Successful Projects',
          desc: 'Examples of residential, industrial, and commercial projects',
          badge: '🏗️ Successful Projects'
        },
        { 
          value: '5', 
          label: 'Active Factories',
          title: '5 Active Factories Across the Country',
          desc: 'Mass production of LSF structures with modern technology',
          badge: '🏭 Our Factories'
        },
        { 
          value: '100+', 
          label: 'Colleagues',
          title: 'A Team of 100+ Colleagues',
          desc: 'Specialized colleagues in construction project execution',
          badge: '👥 Professional Team'
        },
        { 
          value: '96%', 
          label: 'Client Satisfaction',
          title: '96% Client Satisfaction',
          desc: 'Positive feedback and reviews from our clients',
          badge: '⭐ Client Satisfaction'
        }
      ],
      features: {
        title: "Areas of",
        titleHighlight: "Expertise",
        subtitle: "Our specialties in the construction industry",
        items: [
          { title: "Leading LSF Manufacturer", desc: "Pioneer in producing lightweight steel structures in Iran with the highest quality" },
          { title: "Gypsum Ceiling Producer", desc: "Production and installation of gypsum ceiling systems with international standards" },
          { title: "Residential Structures", desc: "Consulting, design, and construction of modern and durable residential buildings" },
          { title: "Earthquake Resistant", desc: "LSF structures with high resistance to earthquakes and natural disasters" }
        ]
      },
      services: {
        title: "Specialized",
        titleHighlight: "Services",
        subtitle: "Comprehensive construction solutions",
        items: [
          { title: "LSF Structures", desc: "Design and construction of lightweight steel structures with highest quality and speed" },
          { title: "Gypsum Systems", desc: "Professional production and installation of gypsum ceilings for modern buildings" },
          { title: "Architectural Design", desc: "Modern architectural consulting and design tailored to your needs" },
          { title: "Structure Execution", desc: "Fast and professional execution of residential and commercial structures" }
        ]
      },
      advantages: {
        title: "Why",
        titleHighlight: "Us",
        subtitle: "Benefits of partnering with Iran's largest LSF producer",
        items: [
          { title: "Fast Execution", desc: "50% reduction in construction time compared to traditional methods" },
          { title: "Guaranteed Quality", desc: "International standards in production and execution" },
          { title: "Eco-Friendly", desc: "Using recyclable and environmentally friendly materials" },
          { title: "Cost Efficiency", desc: "Reducing construction costs and increasing productivity" }
        ]
      },
      projects: {
        title: "Completed",
        titleHighlight: "Projects",
        subtitle: "Examples of successful projects by ArialSF Construction Company",
        hint: "🔄 Drag the center line to see changes | Click on side images to view other projects",
        beforeLabel: "Before",
        afterLabel: "After",
        dragHint: "Drag",
        dragHintVertical: "Drag",
        project1: "Residential LSF Structure",
        project1Desc: "4-story residential project with LSF structure in Tehran",
        project2: "Luxury Villa",
        project2Desc: "Design and construction of luxury villa with gypsum system",
        project3: "Industrial LSF Structure",
        project3Desc: "Industrial warehouse with lightweight steel structure",
        project4: "Modern Gypsum",
        project4Desc: "Design and installation of gypsum ceiling in office building",
        project5: "Residential Complex",
        project5Desc: "5-story residential complex with LSF structure",
        project6: "Sports Hall",
        project6Desc: "Sports hall with LSF structure and gypsum ceiling",
        project7: "Office Building",
        project7Desc: "8-story office building with gypsum ceiling system",
        project8: "Commercial Complex",
        project8Desc: "Commercial complex with modern LSF structure",
        project9: "Industrial LSF",
        project9Desc: "Manufacturing plant with LSF structure",
        project10: "Modern Villa",
        project10Desc: "Modern villa with gypsum and LSF design"
      },
      certificates: {
        title: "🏆 Achievements & Certifications",
        subtitle: "Holding internationally recognized certifications and global standards",
        items: ["ISO 9001", "CE Mark", "Top Quality", "Earthquake Resistant"]
      },
      cta: {
        title: "Ready to Partner With Us?",
        subtitle: "Contact our experts today and benefit from free consultation",
        btn: "Get Consultation"
      }
    }
  }
}

const LanguageContext = createContext()

export const useLanguage = () => {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider')
  }
  return context
}

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('fa')
  const [t, setT] = useState(translations.fa)
  const [dir, setDir] = useState('rtl')

  useEffect(() => {
    const savedLang = typeof window !== 'undefined' ? localStorage.getItem('language') : null
    if (savedLang && (savedLang === 'fa' || savedLang === 'en')) {
      setLanguage(savedLang)
      setT(translations[savedLang])
      setDir(savedLang === 'fa' ? 'rtl' : 'ltr')
    }
  }, [])

  const changeLanguage = (lang) => {
    if (lang === 'fa' || lang === 'en') {
      setLanguage(lang)
      setT(translations[lang])
      setDir(lang === 'fa' ? 'rtl' : 'ltr')
      if (typeof window !== 'undefined') {
        localStorage.setItem('language', lang)
        document.documentElement.dir = lang === 'fa' ? 'rtl' : 'ltr'
        document.documentElement.lang = lang === 'fa' ? 'fa' : 'en'
      }
    }
  }

  const value = {
    language,
    t,
    changeLanguage,
    dir,
  }

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}