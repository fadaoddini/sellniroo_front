'use client'
import React, { useState, useEffect } from 'react'
import { useLanguage } from '../../../../contexts/LanguageContext'
import Config from '../../../../config/config'
import axios from 'axios'
import styles from '../../styles/BrandSection.module.css'

const BrandSection = () => {
  const { language } = useLanguage()
  const [brands, setBrands] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [direction, setDirection] = useState('right')
  const [visibleItems, setVisibleItems] = useState(7)
  const [windowWidth, setWindowWidth] = useState(0)

  const totalItems = brands.length

  // دریافت برندها از API
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        setLoading(true)
        const apiUrl = Config.endpoints.brands.list({
          is_active: true,
          limit: 20
        })
        console.log('Fetching brands from:', apiUrl)
        
        const response = await axios.get(apiUrl)
        console.log('Brands response:', response.data)
        
        // داده‌ها در response.data.results قرار دارند
        const brandData = response.data.results || response.data || []
        setBrands(brandData)
        setError(null)
      } catch (err) {
        console.error('Error fetching brands:', err)
        setError('خطا در دریافت اطلاعات برندها')
        // داده‌های پیش‌فرض در صورت خطا
        setBrands([])
      } finally {
        setLoading(false)
      }
    }

    fetchBrands()
  }, [])

  // تشخیص سایز صفحه
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth
      setWindowWidth(width)
      
      if (width >= 1024) {
        setVisibleItems(7)
      } else if (width >= 768) {
        setVisibleItems(5)
      } else {
        setVisibleItems(3)
      }
    }
    
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const moveLeft = () => {
    if (isAnimating || totalItems === 0) return
    setIsAnimating(true)
    setDirection('left')
    setActiveIndex(prev => (prev - 1 + totalItems) % totalItems)
  }

  const moveRight = () => {
    if (isAnimating || totalItems === 0) return
    setIsAnimating(true)
    setDirection('right')
    setActiveIndex(prev => (prev + 1) % totalItems)
  }

  useEffect(() => {
    if (isAnimating) {
      const timer = setTimeout(() => {
        setIsAnimating(false)
      }, 600)
      return () => clearTimeout(timer)
    }
  }, [isAnimating])

  useEffect(() => {
    if (totalItems === 0) return
    
    const interval = setInterval(() => {
      if (!isAnimating) {
        moveRight()
      }
    }, 3000)
    return () => clearInterval(interval)
  }, [isAnimating, totalItems])

  const getItemPosition = (index) => {
    let diff = index - activeIndex
    if (diff > totalItems / 2) diff -= totalItems
    if (diff < -totalItems / 2) diff += totalItems
    return diff
  }

  const shouldShowItem = (position) => {
    const half = Math.floor(visibleItems / 2)
    return Math.abs(position) <= half
  }

  const getItemStyle = (position, isRTL) => {
    let leftPos = '50%'
    let zIndex = 1
    let scale = 1
    
    const spacing = visibleItems === 7 ? 14 : visibleItems === 5 ? 18 : 25
    
    if (position === 0) {
      leftPos = '50%'
      zIndex = 10
      scale = 1
    } else {
      const absPos = Math.abs(position)
      const percentOffset = absPos * spacing
      
      if (position > 0) {
        leftPos = isRTL ? `${50 + percentOffset}%` : `${50 - percentOffset}%`
      } else {
        leftPos = isRTL ? `${50 - percentOffset}%` : `${50 + percentOffset}%`
      }
      
      zIndex = 10 - absPos
      scale = 1 - (absPos * 0.08)
    }

    return {
      left: leftPos,
      transform: `translate(-50%, -50%) scale(${scale})`,
      zIndex: zIndex
    }
  }

  const getLevelClass = (position) => {
    const absPos = Math.abs(position)
    
    if (position === 0) return styles.level0
    if (absPos === 1) return styles.level1
    if (absPos === 2) return styles.level2
    if (absPos === 3) return styles.level3
    return styles.level3
  }

  const handleBrandClick = async (brand) => {
    try {
      // ثبت کلیک در سرور
      const clickUrl = Config.endpoints.brands.click(brand.id)
      await axios.post(clickUrl)
      console.log('Click tracked for brand:', brand.name_fa)
    } catch (err) {
      console.error('Error tracking click:', err)
    }
    
    // اگر وبسایت داشت، باز شود
    if (brand.website) {
      window.open(brand.website, '_blank')
    }
  }

  if (loading) {
    return (
      <section className={styles.brandSection}>
        <div className="container">
          <div className={styles.brandHeader}>
            <h2 className={styles.brandTitle}>
              {language === 'fa' ? 'همراهان و مشتریان ما' : 'Our Trusted Partners'}
            </h2>
            <p className={styles.brandSubtitle}>
              {language === 'fa' ? 'در حال بارگذاری...' : 'Loading...'}
            </p>
          </div>
          <div className={styles.loadingContainer}>
            <div className={styles.loadingSpinner}></div>
          </div>
        </div>
      </section>
    )
  }

  if (error || totalItems === 0) {
    return (
      <section className={styles.brandSection}>
        <div className="container">
          <div className={styles.brandHeader}>
            <h2 className={styles.brandTitle}>
              {language === 'fa' ? 'همراهان و مشتریان ما' : 'Our Trusted Partners'}
            </h2>
            <p className={styles.brandSubtitle}>
              {language === 'fa' ? 'هیچ برندی یافت نشد' : 'No brands found'}
            </p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className={styles.brandSection}>
      <div className="container">
        <div className={styles.brandHeader}>
          <h2 className={styles.brandTitle}>
            {language === 'fa' ? 'همراهان و مشتریان ما' : 'Our Trusted Partners'}
          </h2>
          <p className={styles.brandSubtitle}>
            {language === 'fa' 
              ? 'افتخار همکاری با برترین صنایع و شرکت‌های بزرگ کشور را داریم' 
              : 'We are proud to partner with top industries and companies'}
          </p>
        </div>

        <div className={styles.carousel3dWrapper}>
          <div className={styles.carousel3dContainer}>
            <button 
              className={`${styles.arrow3d} ${styles.arrowLeft3d}`}
              onClick={moveLeft}
              aria-label="Previous"
              disabled={totalItems === 0}
            >
              ‹
            </button>

            <div className={styles.itemsContainer}>
              {brands.map((brand, index) => {
                const position = getItemPosition(index)
                
                if (!shouldShowItem(position)) {
                  return null
                }

                const isRTL = language === 'fa'
                const levelClass = getLevelClass(position)
                const itemStyle = getItemStyle(position, isRTL)

                let animationClass = ''
                if (isAnimating && totalItems > 0) {
                  const half = Math.floor(visibleItems / 2)
                  if (direction === 'left') {
                    if (position === half) animationClass = styles.enterLeft
                    else if (position === -half) animationClass = styles.leaveLeft
                  } else {
                    if (position === -half) animationClass = styles.enterRight
                    else if (position === half) animationClass = styles.leaveRight
                  }
                }

                const displayName = language === 'fa' ? brand.name_fa : (brand.name_en || brand.name_fa)
                const logoUrl = brand.logo_url || brand.logo

                return (
                  <div 
                    key={brand.id || index}
                    className={`${styles.item3d} ${levelClass} ${animationClass}`}
                    style={itemStyle}
                    onClick={() => handleBrandClick(brand)}
                  >
                    <div className={styles.itemLogoBox}>
                      {logoUrl ? (
                        <img 
                          src={logoUrl} 
                          alt={brand.logo_alt || displayName}
                          className={styles.itemLogo}
                        />
                      ) : (
                        <div className={styles.placeholderLogo}>
                          {displayName.charAt(0)}
                        </div>
                      )}
                    </div>
                    <span className={styles.itemText}>
                      {displayName}
                    </span>
                  </div>
                )
              })}
            </div>

            <button 
              className={`${styles.arrow3d} ${styles.arrowRight3d}`}
              onClick={moveRight}
              aria-label="Next"
              disabled={totalItems === 0}
            >
              ›
            </button>
          </div>

          {totalItems > 0 && (
            <div className={styles.dotsContainer}>
              {brands.map((_, index) => (
                <button
                  key={index}
                  className={`${styles.dot} ${index === activeIndex ? styles.dotActive : ''}`}
                  onClick={() => {
                    if (!isAnimating && totalItems > 0) {
                      const diff = index - activeIndex
                      if (diff > 0) {
                        setDirection('right')
                      } else if (diff < 0) {
                        setDirection('left')
                      }
                      setActiveIndex(index)
                      setIsAnimating(true)
                    }
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export default BrandSection