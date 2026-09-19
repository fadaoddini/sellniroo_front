// components/slider/HeroSlider.jsx
'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import styles from './HeroSlider.module.css'

const HeroSlider = ({ slides: customSlides, autoPlayInterval = 5000 }) => {
  // اسلایدهای پیش‌فرض (اگه پاس داده نشه)
  const defaultSlides = [
    {
      id: 1,
      title: 'بهترین فرصت‌های شغلی فروش و بازاریابی',
      description: 'با بیش از ۵۰۰ فرصت شغلی فعال در سراسر کشور',
      image: '/images/bg01.png',
      link: '/jobs'
    },
    {
      id: 2,
      title: 'رزومه خود را حرفه‌ای بسازید',
      description: 'با ابزارهای رایگان ما در کمترین زمان استخدام شوید',
      image: '/images/bg01.png',
      link: '/resume'
    },
    {
      id: 3,
      title: 'مشاوره شغلی تخصصی رایگان',
      description: 'کارشناسان ما در کنار شما هستند تا بهترین انتخاب را داشته باشید',
      image: '/images/slider/slide-3.jpg',
      link: '/consult'
    },
    {
      id: 4,
      title: 'همکاری با بهترین شرکت‌های کشور',
      description: 'فرصت‌های شغلی در شرکت‌های معتبر و برتر',
      image: '/images/bg01.png',
      link: '/companies'
    },
    {
      id: 5,
      title: 'آموزش‌های تخصصی فروش',
      description: 'مهارت‌های خود را با دوره‌های حرفه‌ای ارتقا دهید',
      image: '/images/bg01.png',
      link: '/courses'
    }
  ]

  const slides = customSlides || defaultSlides
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [progressKey, setProgressKey] = useState(0)
  const intervalRef = useRef(null)

  const goToSlide = useCallback((index) => {
    setCurrentIndex(index)
    setProgressKey(prev => prev + 1) // ریست انیمیشن progress
  }, [])

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % slides.length)
    setProgressKey(prev => prev + 1)
  }, [slides.length])

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length)
    setProgressKey(prev => prev + 1)
  }, [slides.length])

  // Auto play
  useEffect(() => {
    if (isPaused) return

    intervalRef.current = setInterval(() => {
      nextSlide()
    }, autoPlayInterval)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isPaused, nextSlide, autoPlayInterval])

  return (
    <div
      className={styles.slider}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      dir="rtl"
    >
      {/* اسلایدها */}
      <div className={styles.slidesWrapper}>
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`${styles.slide} ${
              index === currentIndex ? styles.active : ''
            }`}
            style={{
              backgroundImage: slide.image ? `url(${slide.image})` : 'none'
            }}
          >
            {/* Overlay */}
            <div className={styles.overlay} />

            {/* محتوا */}
            <div className={styles.content}>
              <h2
                className={`${styles.title} ${
                  index === currentIndex ? styles.titleActive : ''
                }`}
              >
                {slide.title}
              </h2>
              <p
                className={`${styles.description} ${
                  index === currentIndex ? styles.descActive : ''
                }`}
              >
                {slide.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* دکمه‌های ناوبری چپ و راست */}
      <button
        className={`${styles.navBtn} ${styles.navPrev}`}
        onClick={goToPrev}
        aria-label="اسلاید قبلی"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path
            d="M15 18L9 12L15 6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <button
        className={`${styles.navBtn} ${styles.navNext}`}
        onClick={nextSlide}
        aria-label="اسلاید بعدی"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path
            d="M9 18L15 12L9 6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {/* دات‌های ناوبری */}
      <div className={styles.dots}>
        {slides.map((_, index) => (
          <button
            key={index}
            className={`${styles.dot} ${
              index === currentIndex ? styles.dotActive : ''
            }`}
            onClick={() => goToSlide(index)}
            aria-label={`رفتن به اسلاید ${index + 1}`}
          >
            {/* Progress bar داخل دات فعال */}
            {index === currentIndex && !isPaused && (
              <span
                key={progressKey}
                className={styles.dotProgress}
                style={{ animationDuration: `${autoPlayInterval}ms` }}
              />
            )}
          </button>
        ))}
      </div>
    </div>
  )
}

export default HeroSlider