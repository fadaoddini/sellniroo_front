// components/About/AboutData.js

export const aboutData = {
  fa: {
    title: 'درباره هلدینگ آریا اِستاد',
    subtitle: 'پیشرو در صنعت ساخت‌وساز با بیش از ۲۵ سال تجربه',
    
    // بخش اول: معرفی اصلی (تصویر سمت راست)
    section1: {
      title: 'معرفی هلدینگ',
      paragraphs: [
        'هلدینگ آریا استاد یک گروه صنعتی پیشرو با بیش از ۲۵ سال تجربه در طراحی، تولید و اجرای ساختمان‌های پیش‌ساخته با استفاده از فناوری LSF است. این هلدینگ مالک دو شرکت بزرگ: شرکت تولیدی فولاد رسیس استاد و شرکت آریاسازه نوین شریعت می‌باشد.',
        'با تکیه بر شبکه توزیع گسترده، هلدینگ آریا استاد از استعدادهای خلاق و تیم‌های نوآور برای ارائه خدمات برجسته در زمینه‌های تحقیق، مشاوره، طراحی، مدیریت پروژه و مهندسی در پروژه‌های معماری و صنعتی در سراسر ایران بهره می‌برد.',
        'تلاش‌های این هلدینگ منجر به اجرای موفق پروژه‌های ساختمانی شده و گرید ۲ انبوه‌سازی از سازمان مسکن و شهرسازی و گرید ابنیه و راه‌سازی از سازمان برنامه و بودجه را کسب کرده است.'
      ],
      image: {
        src: '/images/about/factory.jpg',
        alt: 'کارخانه تولیدی آریا استاد',
        caption: 'کارخانه تولیدی پیشرفته آریا استاد'
      }
    },
    
    // بخش دوم: سابقه و استانداردها (تصویر سمت چپ)
    section2: {
      title: 'سابقه درخشان و استانداردهای بین‌المللی',
      paragraphs: [
        'با سابقه‌ای درخشان و پایبندی به استانداردهای بین‌المللی، هلدینگ آریا استاد نقش مهمی در توسعه فناوری‌های نوین ساخت‌وساز در ایران و کشورهای همسایه ایفا کرده است.'
      ],
      image: {
        src: '/images/about/standards.jpg',
        alt: 'استانداردهای بین‌المللی آریا استاد',
        caption: 'پایبندی به استانداردهای بین‌المللی'
      }
    },

    stats: [
      { value: '۲۵+', label: 'سال تجربه', icon: 'Calendar' },
      { value: '۱۷۰۰+', label: 'پروژه موفق', icon: 'CheckCircle' },
      { value: '۵', label: 'کارخانه فعال', icon: 'Factory' },
      { value: '۱۰۰+', label: 'همکار متخصص', icon: 'Users' },
      { value: '۹۶%', label: 'رضایت مشتری', icon: 'Award' }
    ],
    sections: {
      title: 'بخش‌های اصلی هلدینگ',
      items: [
        {
          title: 'مهندسی',
          desc: 'طراحی و محاسبات سازه‌های LSF با استفاده از نرم‌افزارهای پیشرفته و استانداردهای بین‌المللی',
          icon: 'Target'
        },
        {
          title: 'فنی',
          desc: 'اجرای تخصصی سازه‌های سبک فولادی با تیم‌های فنی مجرب و تجهیزات مدرن',
          icon: 'Zap'
        },
        {
          title: 'طراحی و تولید',
          desc: 'تولید انبوه مقاطع LSF با بالاترین کیفیت و طراحی متناسب با نیاز پروژه',
          icon: 'Building2'
        },
        {
          title: 'اجرا و پشتیبانی',
          desc: 'مدیریت اجرای پروژه‌ها و ارائه خدمات پشتیبانی پس از ساخت',
          icon: 'Briefcase'
        }
      ]
    },
    achievements: {
      title: 'افتخارات و گواهینامه‌ها',
      items: [
        { label: 'گرید ۵ ابنیه', desc: '-' },
        { label: 'گرید ۲ انبوه‌سازی', desc: '-' },
        { label: 'گرید راه‌سازی', desc: '-' },
        { label: 'گرید ۱ مدیریت', desc: '-' },

      ]
    }
  },
  en: {
    title: 'About Aria Stud Holding',
    subtitle: 'Pioneer in Construction Industry with Over 25 Years of Experience',
    
    // Section 1: Main Introduction (image on right)
    section1: {
      title: 'Holding Introduction',
      paragraphs: [
        'Aria Stud Holding is a leading industrial group with over 25 years of experience in design, production, and execution of prefabricated buildings using LSF technology. The holding owns two major companies: Resis Steel Production Company and Ariasaze Novin Shariat Company.',
        'Leveraging an extensive distribution network, Aria Stud Holding harnesses creative talents and innovative teams to deliver outstanding services in research, consulting, design, project management, and engineering for architectural and industrial projects across Iran.',
        'The holding\'s efforts have led to successful implementation of construction projects, earning Grade 2 Mass Construction from the Housing and Urban Development Organization and Grade 1 Building and Road Construction from the Plan and Budget Organization.'
      ],
      image: {
        src: '/images/about/factory.jpg',
        alt: 'Aria Stud Factory',
        caption: 'Aria Stud Advanced Production Factory'
      }
    },
    
    // Section 2: Track Record & Standards (image on left)
    section2: {
      title: 'Brilliant Track Record & International Standards',
      paragraphs: [
        'With a brilliant track record and commitment to international standards, Aria Stud Holding has played a significant role in developing modern construction technologies in Iran and neighboring countries.'
      ],
      image: {
        src: '/images/about/standards.jpg',
        alt: 'International Standards',
        caption: 'Commitment to International Standards'
      }
    },

    stats: [
      { value: '25+', label: 'Years Experience', icon: 'Calendar' },
      { value: '1700+', label: 'Successful Projects', icon: 'CheckCircle' },
      { value: '5', label: 'Active Factories', icon: 'Factory' },
      { value: '100+', label: 'Specialized Colleagues', icon: 'Users' },
      { value: '96%', label: 'Client Satisfaction', icon: 'Award' }
    ],
    sections: {
      title: 'Main Divisions of the Holding',
      items: [
        {
          title: 'Engineering',
          desc: 'Design and structural calculations of LSF using advanced software and international standards',
          icon: 'Target'
        },
        {
          title: 'Technical',
          desc: 'Professional execution of lightweight steel structures with experienced technical teams and modern equipment',
          icon: 'Zap'
        },
        {
          title: 'Design & Production',
          desc: 'Mass production of LSF profiles with highest quality and design tailored to project needs',
          icon: 'Building2'
        },
        {
          title: 'Execution & Support',
          desc: 'Project management and post-construction support services',
          icon: 'Briefcase'
        }
      ]
    },
   achievements: {
    title: 'Achievements & Certifications',
  items: [
    { label: 'Grade 5 Building Construction', desc: '-' },
    { label: 'Grade 2 Mass Construction', desc: '-' },
    { label: 'Grade Road Construction', desc: '-' },
    { label: 'Grade 1 Management', desc: '-' }
  ]
}
  }
}

// Icon mapping
export const iconMap = {
  'Calendar': 'Calendar',
  'CheckCircle': 'CheckCircle',
  'Factory': 'Factory',
  'Users': 'Users',
  'Award': 'Award',
  'Target': 'Target',
  'Zap': 'Zap',
  'Building2': 'Building2',
  'Briefcase': 'Briefcase',
  'Shield': 'Shield',
  'Home': 'Home',
  'BarChart3': 'BarChart3'
}