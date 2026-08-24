// components/About/index.jsx

'use client'

import React from 'react'
import Link from "next/link";
import Image from "next/image";
import { 
  Building2, Factory, Users, Award, 
  Target, Zap, Briefcase, CheckCircle,
  Calendar, Shield, Home, BarChart3, GitBranch,
  Image as ImageIcon
} from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import { AboutProvider, useAboutContext } from './AboutContext'
import styles from './About.module.css'
import OrganizationChartHexa from '../../modules/home/components/sections/ChartSection/OrganizationChartHexa';


// Icon mapping
const iconMap = {
  'Calendar': Calendar,
  'CheckCircle': CheckCircle,
  'Factory': Factory,
  'Users': Users,
  'Award': Award,
  'Target': Target,
  'Zap': Zap,
  'Building2': Building2,
  'Briefcase': Briefcase,
  'Shield': Shield,
  'Home': Home,
  'BarChart3': BarChart3,
  'ImageIcon': ImageIcon
}

// کامپوننت نمایش آیکون
const IconRenderer = ({ name, size = 28, className = '' }) => {
  const Icon = iconMap[name] || Building2
  return <Icon size={size} className={className} />
}

// کامپوننت رندر تصویر
const ImageRenderer = ({ image, language }) => {
  if (image?.src) {
    return (
      <>
        <img
          src={image.src}
          alt={image.alt}
          className={styles.image}
          loading="lazy"
        />
        {image.caption && (
          <div className={styles.imageCaption}>
            {image.caption}
          </div>
        )}
      </>
    )
  }

  return (
    <div className={styles.imagePlaceholder}>
      <ImageIcon size={64} />
      <span>
        {language === 'fa' 
          ? 'تصویر' 
          : 'Image'}
      </span>
    </div>
  )
}

// کامپوننت داخلی برای استفاده از کانتکست
const AboutContent = () => {
  const { data, loading } = useAboutContext()
  const { language } = useLanguage()

  if (loading) {
    return <div className={styles.loading}>در حال بارگذاری...</div>
  }

  return (
    <section className={styles.about}>
      <div className="container">
        {/* Header */}
        <div className={styles.header}>
        
          <h1 className={styles.title}>{data.title}</h1>
          <p className={styles.subtitle}>{data.subtitle}</p>
        </div>

        {/* Main Content */}
        <div className={styles.contentWrapper}>
          {/* بخش اول: معرفی اصلی - تصویر سمت راست */}
          <div className={`${styles.sectionBlock} ${styles.imageRight}`}>
            <div className={styles.textContent}>
              <h2 className={styles.sectionTitle}>
                {data.section1.title}
              </h2>
              {data.section1.paragraphs.map((text, index) => (
                <p key={index} className={styles.paragraph}>
                  {text}
                </p>
              ))}
            </div>
<div className={styles.imageWrapper}>
  <Image
    src="/images/bglogo.jpg"
    alt="آریا استاد هلدینگ"
    width={900}
    height={650}
    className={styles.contentImage}
    priority
  />
</div>
          </div>

          {/* بخش دوم: سابقه و استانداردها - تصویر سمت چپ */}
          <div className={`${styles.sectionBlock} ${styles.imageLeft}`}>
  <div className={styles.imageWrapper}>
  <Image
    src="/images/lsf.jpeg"
    alt="سازه سبک فولادی LSF"
    width={900}
    height={650}
    className={styles.contentImage}
  />
</div>
            <div className={styles.textContent}>
              <h2 className={styles.sectionTitle}>
                {data.section2.title}
              </h2>
              {data.section2.paragraphs.map((text, index) => (
                <p key={index} className={styles.paragraph}>
                  {text}
                </p>
              ))}
            </div>
          </div>

                   
     
  

          {/* آمار کلیدی */}
          <div className={styles.statsSection}>
            <h3 className={styles.sectionTitle}>
              {language === 'fa' ? ' آمار کلیدی' : ' Key Statistics'}
            </h3>
            <div className={styles.statsGrid}>
              {data.stats.map((stat, index) => (
                <div key={index} className={styles.statCard}>
                  <div className={styles.statIconWrapper}>
                    <IconRenderer name={stat.icon} size={28} />
                  </div>
                  <span className={styles.statValue}>{stat.value}</span>
                  <span className={styles.statLabel}>{stat.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* بخش‌های اصلی هلدینگ */}
          <div className={styles.sectionsSection}>
            <h3 className={styles.sectionTitle}>{data.sections.title}</h3>
            <div className={styles.sectionsGrid}>
              {data.sections.items.map((item, index) => (
                <div key={index} className={styles.sectionCard}>
                  <div className={styles.sectionIcon}>
                    <IconRenderer name={item.icon} size={28} />
                  </div>
                  <h4 className={styles.sectionCardTitle}>{item.title}</h4>
                  <p className={styles.sectionCardDesc}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>



 {/* نمودار سازمانی - با هدر و توضیحات */}
          <div className={styles.orgChartSection}>
            <h2 className={styles.orgChartSectionTitle}>
              <GitBranch size={28} style={{ display: 'inline-block', marginLeft: '8px', color: '#f97316' }} />
              {language === 'fa' ? (
                <>ساختار <span className={styles.highlight}>سازمانی</span></>
              ) : (
                <>Organizational <span className={styles.highlight}>Structure</span></>
              )}
            </h2>
            <p className={styles.orgChartSectionDesc}>
              {language === 'fa' 
                ? 'نمودار ساختار هلدینگ آریا استاد شامل شرکت‌ها، بخش‌ها و زیرمجموعه‌ها'
                : 'chart of Aria Stud Holding structure including companies, departments and subsidiaries'
              }
            </p>
            <div className={styles.orgChartWrapper}>
              <OrganizationChartHexa />
            </div>
          </div>




          {/* افتخارات و گواهینامه‌ها */}
          <div className={styles.achievementsSection}>
            <h3 className={styles.sectionTitle}>
              {language === 'fa' ? ' افتخارات و گواهینامه‌ها' : ' Achievements & Certifications'}
            </h3>
            <div className={styles.achievementsGrid}>
              {data.achievements.items.map((item, index) => (
                <div key={index} className={styles.achievementItem}>
                  <div className={styles.achievementDot} />
                  <div>
                    <span className={styles.achievementLabel}>{item.label}</span>
                    <span className={styles.achievementDesc}>{item.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// کامپوننت اصلی با Provider
const AboutUs = () => {
  const { language } = useLanguage()

  return (
    <AboutProvider language={language}>
      <AboutContent />
    </AboutProvider>
  )
}

export default AboutUs