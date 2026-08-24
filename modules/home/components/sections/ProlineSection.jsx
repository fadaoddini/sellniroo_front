'use client'
import React, { useState, useEffect, useRef } from 'react'
import { useLanguage } from '../../../../contexts/LanguageContext'
import styles from '../../styles/ProlineSection.module.css'

const ProlineSection = () => {
  const { language, dir } = useLanguage()
  const [selectedIndex, setSelectedIndex] = useState(0)
  const containerRef = useRef(null)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)

  const projects = [
    { id: 1, title_fa: '۱۳۴ واحد', title_en: '134 Units', client_fa: 'نهضت ملی مسکن', client_en: 'National Housing', location_fa: 'مشهد - مهرگان', location_en: 'Mashhad - Mehregan' },
    { id: 2, title_fa: '۲۲۰ واحد', title_en: '220 Units', client_fa: 'نهضت ملی مسکن', client_en: 'National Housing', location_fa: 'درگز', location_en: 'Dargaz' },
    { id: 3, title_fa: '۵۰۰۰ متر', title_en: '5000 sqm', client_fa: 'کشت وصنعت مکران', client_en: 'Makran Agro-Industry', location_fa: 'چابهار', location_en: 'Chabahar' },
    { id: 4, title_fa: '۷۲ واحد', title_en: '72 Units', client_fa: 'یادگار امام', client_en: 'Yadegar-e-Imam', location_fa: 'مشهد - فلاحی', location_en: 'Mashhad - Fallahi' },
    { id: 5, title_fa: 'خودمالکی', title_en: 'Owner-Occupied', client_fa: 'تیرپارک', client_en: 'Tirpark', location_fa: 'درگز - لطف آباد', location_en: 'Dargaz - Lotfabad' },
    { id: 6, title_fa: '۳۴۰۰ متر', title_en: '3400 sqm', client_fa: 'اسکلت فلزی', client_en: 'Steel Structure', location_fa: 'مشهد - توفیق', location_en: 'Mashhad - Tofigh' },
    { id: 7, title_fa: '۲۵۰۰ متر', title_en: '2500 sqm', client_fa: 'اسکلت فلزی', client_en: 'Steel Structure', location_fa: 'مشهد - توفیق', location_en: 'Mashhad - Tofigh' },
    { id: 8, title_fa: '۲۶۰۰ متر', title_en: '2600 sqm', client_fa: 'پروژه بتنی', client_en: 'Concrete Project', location_fa: 'مشهد - بیستون', location_en: 'Mashhad - Bistoon' },
    { id: 9, title_fa: '۳۳۰۰ متر', title_en: '3300 sqm', client_fa: 'خدمات رفاهی', client_en: 'Service Complex', location_fa: 'یزد', location_en: 'Yazd' },
    { id: 10, title_fa: 'مسکونی', title_en: 'Residential', client_fa: 'مسکن ملی', client_en: 'National Housing', location_fa: 'طبس', location_en: 'Tabas' },
    { id: 11, title_fa: 'آموزشی', title_en: 'Educational', client_fa: 'دکتر حسابی', client_en: 'Dr. Hesabi', location_fa: 'بجنورد', location_en: 'Bojnourd' },
    { id: 12, title_fa: 'ساختمانی', title_en: 'Construction', client_fa: 'بنیاد شهید', client_en: 'Martyr Foundation', location_fa: 'مشهد - نخریسی', location_en: 'Mashhad - Nakhrisi' },
    { id: 13, title_fa: 'اقامتگاهی', title_en: 'Lodging', client_fa: 'پارک جنگلی', client_en: 'Forest Park', location_fa: 'ساری', location_en: 'Sari' },
    { id: 14, title_fa: '۲۰۰۰ متر', title_en: '2000 sqm', client_fa: 'معدن جو', client_en: 'Mining Co.', location_fa: 'طبس', location_en: 'Tabas' },
    { id: 15, title_fa: 'پالایشگاهی', title_en: 'Refinery', client_fa: 'خلیج فارس', client_en: 'Persian Gulf', location_fa: 'بندرعباس', location_en: 'Bandar Abbas' },
    { id: 16, title_fa: 'خدماتی', title_en: 'Service', client_fa: 'هواپیمایی ماهان', client_en: 'Mahan Air', location_fa: 'چابهار', location_en: 'Chabahar' },
    { id: 17, title_fa: 'ساختمانی', title_en: 'Construction', client_fa: 'آب و فاضلاب اهواز', client_en: 'Ahvaz Water', location_fa: 'اهواز', location_en: 'Ahvaz' },
    { id: 18, title_fa: 'صنعتی', title_en: 'Industrial', client_fa: 'فولاد نیشابور', client_en: 'Neyshabur Steel', location_fa: 'نیشابور', location_en: 'Neyshabur' },
    { id: 19, title_fa: 'اداری', title_en: 'Administrative', client_fa: 'شهرداری خوزستان', client_en: 'Khuzestan Municipality', location_fa: 'خوزستان', location_en: 'Khuzestan' },
    { id: 20, title_fa: 'اداری', title_en: 'Administrative', client_fa: 'شهرداری کرج', client_en: 'Karaj Municipality', location_fa: 'کرج', location_en: 'Karaj' },
    { id: 21, title_fa: 'هتل', title_en: 'Hotel', client_fa: 'هتل ولایت', client_en: 'Velayat Hotel', location_fa: 'مشهد - شارستان', location_en: 'Mashhad - Sharestan' },
    { id: 22, title_fa: 'هتل', title_en: 'Hotel', client_fa: 'هتل جوار الملک', client_en: 'Javarelmalek Hotel', location_fa: 'مشهد - خسروی', location_en: 'Mashhad - Khosravi' },
    { id: 23, title_fa: 'خدماتی', title_en: 'Service', client_fa: 'کمیته امداد', client_en: 'Imam Khomeini Relief', location_fa: 'تربت حیدریه - زاوه', location_en: 'Torbat - Zaveh' },
    { id: 24, title_fa: 'ساختمانی', title_en: 'Construction', client_fa: 'شرکت گاز زاهدان', client_en: 'Zahedan Gas Co.', location_fa: 'زاهدان', location_en: 'Zahedan' },
    { id: 25, title_fa: 'پزشکی', title_en: 'Medical', client_fa: 'کلینیک سیماطب', client_en: 'Simatab Clinic', location_fa: 'مشهد - کلاهدوز', location_en: 'Mashhad - Kolahdooz' },
    { id: 26, title_fa: 'ساختمانی', title_en: 'Construction', client_fa: 'خانگیران سرخس', client_en: 'Khangeeran Sarakhs', location_fa: 'سرخس', location_en: 'Sarakhs' },
    { id: 27, title_fa: 'اردوگاهی', title_en: 'Camp', client_fa: 'اردوگاه فردوس', client_en: 'Ferdows Camp', location_fa: 'فردوس', location_en: 'Ferdows' },
    { id: 28, title_fa: 'اردوگاهی', title_en: 'Camp', client_fa: 'بنیاد شهید', client_en: 'Martyr Foundation', location_fa: 'مشهد', location_en: 'Mashhad' },
    { id: 29, title_fa: 'بیمارستانی', title_en: 'Hospital', client_fa: 'بیمارستان اکبر', client_en: 'Akbar Hospital', location_fa: 'مشهد', location_en: 'Mashhad' },
    { id: 30, title_fa: 'ساختمانی', title_en: 'Construction', client_fa: 'شرکت گاز بجستان', client_en: 'Bajestan Gas Co.', location_fa: 'بجستان', location_en: 'Bajestan' },
    { id: 31, title_fa: 'ساختمانی', title_en: 'Construction', client_fa: 'شرکت برق بوژان', client_en: 'Bozhan Power Co.', location_fa: 'بوژان', location_en: 'Bozhan' },
    { id: 32, title_fa: 'اضافه بنا', title_en: 'Extension', client_fa: 'فولاد خراسان', client_en: 'Khorasan Steel', location_fa: 'نیشابور', location_en: 'Neyshabur' },
    { id: 33, title_fa: 'پست برق', title_en: 'Power Substation', client_fa: 'شعاع گستر شرق', client_en: 'Shoa Gostar Shargh', location_fa: 'بجنورد', location_en: 'Bojnourd' },
    { id: 34, title_fa: 'پست برق', title_en: 'Power Substation', client_fa: 'شرکت آرتا', client_en: 'Arta Co.', location_fa: 'بوژان', location_en: 'Bozhan' },
    { id: 35, title_fa: 'پست برق', title_en: 'Power Substation', client_fa: 'شرکت آرتا', client_en: 'Arta Co.', location_fa: 'خوسف', location_en: 'Khusf' },
    { id: 36, title_fa: 'اضافه بنا', title_en: 'Extension', client_fa: 'کلینیک مریم', client_en: 'Maryam Clinic', location_fa: 'مشهد', location_en: 'Mashhad' },
    { id: 37, title_fa: 'آموزشی', title_en: 'Educational', client_fa: 'آموزشگاه وکیلی', client_en: 'Vakili School', location_fa: 'نیشابور', location_en: 'Neyshabur' },
    { id: 38, title_fa: 'خوابگاه', title_en: 'Dormitory', client_fa: 'دانشگاه خیام', client_en: 'Khayyam University', location_fa: 'سبزوار', location_en: 'Sabzevar' },
    { id: 39, title_fa: 'مسکونی', title_en: 'Residential', client_fa: 'پروژه مسکونی', client_en: 'Residential Project', location_fa: 'عراق - بصره', location_en: 'Iraq - Basra' },
    { id: 40, title_fa: 'آموزشی', title_en: 'Educational', client_fa: 'مجتمع دکتر حسابی', client_en: 'Dr. Hesabi Complex', location_fa: 'بجنورد', location_en: 'Bojnourd' },
    { id: 41, title_fa: 'اقامتگاهی', title_en: 'Lodging', client_fa: 'هلال احمر', client_en: 'Red Crescent', location_fa: 'بندرانزلی', location_en: 'Bandar Anzali' },
    { id: 42, title_fa: 'مذهبی', title_en: 'Religious', client_fa: 'هلال احمر', client_en: 'Red Crescent', location_fa: 'بندرانزلی', location_en: 'Bandar Anzali' },
    { id: 43, title_fa: 'پست برق', title_en: 'Power Substation', client_fa: 'کاوش گستر پاژ', client_en: 'Kavosh Gostar Paj', location_fa: 'سبزوار', location_en: 'Sabzevar' },
    { id: 44, title_fa: 'خدماتی', title_en: 'Service', client_fa: 'مجتمع بین راهی A', client_en: 'Road Complex A', location_fa: 'طبس', location_en: 'Tabas' },
    { id: 45, title_fa: 'خدماتی', title_en: 'Service', client_fa: 'مجتمع بین راهی B', client_en: 'Road Complex B', location_fa: 'طبس', location_en: 'Tabas' },
    { id: 46, title_fa: 'خدماتی', title_en: 'Service', client_fa: 'مجتمع بین راهی C', client_en: 'Road Complex C', location_fa: 'طبس', location_en: 'Tabas' },
    { id: 47, title_fa: '۳۰۰ واحدی', title_en: '300 Units', client_fa: 'پروژه ارتش', client_en: 'Army Project', location_fa: 'سبزوار', location_en: 'Sabzevar' },
  ]

  // Drag handlers
  const handleMouseDown = (e) => {
    setIsDragging(true)
    setStartX(e.pageX - containerRef.current.offsetLeft)
    setScrollLeft(containerRef.current.scrollLeft)
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleMouseMove = (e) => {
    if (!isDragging) return
    e.preventDefault()
    const x = e.pageX - containerRef.current.offsetLeft
    const walk = (x - startX) * (dir === 'rtl' ? 1 : -1)
    containerRef.current.scrollLeft = scrollLeft - walk
  }

  const handleTouchStart = (e) => {
    setIsDragging(true)
    setStartX(e.touches[0].pageX - containerRef.current.offsetLeft)
    setScrollLeft(containerRef.current.scrollLeft)
  }

  const handleTouchMove = (e) => {
    if (!isDragging) return
    const x = e.touches[0].pageX - containerRef.current.offsetLeft
    const walk = (x - startX) * (dir === 'rtl' ? 1 : -1)
    containerRef.current.scrollLeft = scrollLeft - walk
  }

  const scrollTo = (dir) => {
    const container = containerRef.current
    const amount = 300
    container.scrollLeft += dir === 'left' ? -amount : amount
  }

  return (
    <section className={styles.prolineSection}>
      <div className="container">
        {/* هدر */}
        <div className={styles.header}>
          <h2 className={styles.title}>
            {language === 'fa' ? 'پروژه‌های اجرا شده' : 'Completed Projects'}
          </h2>
          <p className={styles.subtitle}>
            {language === 'fa' 
              ? 'نمایش پروژه‌های اجرا شده در طول سال‌های فعالیت' 
              : 'Timeline of completed projects over the years'}
          </p>
        </div>

        {/* تایم‌لاین */}
        <div className={styles.timelineWrapper}>
          {/* دکمه‌ها */}
          <button 
            className={`${styles.arrow} ${styles.arrowLeft}`}
            onClick={() => scrollTo('right')}
          >
            {dir === 'rtl' ? '→' : '←'}
          </button>

          <button 
            className={`${styles.arrow} ${styles.arrowRight}`}
            onClick={() => scrollTo('left')}
          >
            {dir === 'rtl' ? '←' : '→'}
          </button>

          {/* لیست پروژه‌ها */}
          <div 
            ref={containerRef}
            className={styles.projectsList}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onMouseMove={handleMouseMove}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleMouseUp}
          >
            {/* خط تایم‌لاین */}
            <div className={styles.timelineLine}></div>

            {projects.map((project, index) => {
              const isEven = index % 2 === 0
              const isSelected = index === selectedIndex

              return (
                <div 
                  key={project.id}
                  className={`${styles.projectItem} ${isEven ? styles.top : styles.bottom}`}
                  onClick={() => setSelectedIndex(index)}
                >
                  <div className={`${styles.dot} ${isSelected ? styles.dotActive : ''}`}></div>
                  
                  <div className={`${styles.card} ${isSelected ? styles.cardActive : ''}`}>
                    <div className={styles.cardNumber}>{index + 1}</div>
                    <div className={styles.cardTitle}>
                      {language === 'fa' ? project.title_fa : project.title_en}
                    </div>
                    <div className={styles.cardClient}>
                      {language === 'fa' ? project.client_fa : project.client_en}
                    </div>
                    <div className={styles.cardLocation}>
                      📍 {language === 'fa' ? project.location_fa : project.location_en}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* اندیکاتور */}
          <div className={styles.indicator}>
            <div className={styles.indicatorTrack}>
              <div 
                className={styles.indicatorFill}
                style={{
                  width: containerRef.current 
                    ? `${(containerRef.current.scrollLeft / (containerRef.current.scrollWidth - containerRef.current.clientWidth)) * 100}%` 
                    : '0%'
                }}
              />
            </div>
          </div>

          <p className={styles.hint}>
            {language === 'fa' ? '↔ بکشید یا از دکمه‌ها استفاده کنید' : '↔ Drag or use buttons'}
          </p>
        </div>
      </div>
    </section>
  )
}

export default ProlineSection