'use client'
import React, { useState, useEffect, useRef } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import Config from '@/config/config'
import axios from 'axios'
import styles from '../../styles/CertificatesCarousel.module.css'

const CertificatesCarousel = () => {
  const { language } = useLanguage()
  const [certificates, setCertificates] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [touchStartX, setTouchStartX] = useState(0)
  const [touchEndX, setTouchEndX] = useState(0)
  
  // State for lightbox
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [selectedImage, setSelectedImage] = useState(null)
  const [selectedTitle, setSelectedTitle] = useState('')
  
  const containerRef = useRef(null)

  // Number of visible items - changed to 4
  const VISIBLE_ITEMS = 4

  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        setLoading(true)
        const apiUrl = Config.endpoints.certificates?.list?.() || 
                      Config.getApiUrl({ segment: 'api', endpoint: 'certificates/', noVersion: true })
        
        const response = await axios.get(apiUrl)
        const data = response.data?.results || response.data || []
        setCertificates(data)
        setError(null)
      } catch (err) {
        console.error('Error fetching certificates:', err)
        setError('خطا در دریافت اطلاعات')
        const sampleData = [
          { id: 1, title_fa: 'ISO 9001', title_en: 'ISO 9001', image: '/images/cert1.jpg' },
          { id: 2, title_fa: 'CE', title_en: 'CE', image: '/images/cert2.jpg' },
          { id: 3, title_fa: 'GOST', title_en: 'GOST', image: '/images/cert3.jpg' },
          { id: 4, title_fa: 'IATF 16949', title_en: 'IATF 16949', image: '/images/cert4.jpg' },
          { id: 5, title_fa: 'API', title_en: 'API', image: '/images/cert5.jpg' },
          { id: 6, title_fa: 'ASME', title_en: 'ASME', image: '/images/cert6.jpg' },
          { id: 7, title_fa: 'PED', title_en: 'PED', image: '/images/cert7.jpg' },
        ]
        setCertificates(sampleData)
      } finally {
        setLoading(false)
      }
    }

    fetchCertificates()
  }, [])

  const moveLeft = () => {
    if (isAnimating || certificates.length === 0) return
    setIsAnimating(true)
    setActiveIndex(prev => (prev - 1 + certificates.length) % certificates.length)
  }

  const moveRight = () => {
    if (isAnimating || certificates.length === 0) return
    setIsAnimating(true)
    setActiveIndex(prev => (prev + 1) % certificates.length)
  }

  useEffect(() => {
    if (isAnimating) {
      const timer = setTimeout(() => {
        setIsAnimating(false)
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [isAnimating])

  useEffect(() => {
    if (certificates.length === 0 || isAnimating) return
    
    const interval = setInterval(() => {
      moveRight()
    }, 4000)
    
    return () => clearInterval(interval)
  }, [certificates.length, isAnimating])

  // Get visible items - changed for 4 items
  const getVisibleItems = () => {
    const total = certificates.length
    if (total === 0) return []
    
    const items = []
    const half = Math.floor(VISIBLE_ITEMS / 2)
    
    for (let i = -half; i <= half; i++) {
      const index = (activeIndex + i + total) % total
      items.push({
        index,
        position: i,
        isActive: i === 0
      })
    }
    
    return items
  }

  const handleTouchStart = (e) => {
    setTouchStartX(e.touches[0].clientX)
  }

  const handleTouchEnd = (e) => {
    setTouchEndX(e.changedTouches[0].clientX)
    const diff = touchStartX - touchEndX
    
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        moveRight()
      } else {
        moveLeft()
      }
    }
  }

  const getItemStyle = (position) => {
    const baseScale = 1
    const scale = baseScale - (Math.abs(position) * 0.12)
    const opacity = 1 - (Math.abs(position) * 0.25)
    const zIndex = 10 - Math.abs(position)
    
    return {
      transform: `scale(${scale})`,
      opacity: Math.max(opacity, 0.3),
      zIndex,
      transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)'
    }
  }

  // Open lightbox
  const openLightbox = (cert) => {
    const title = language === 'fa' 
      ? cert.title_fa || cert.title 
      : cert.title_en || cert.title
    const imageUrl = cert.image || cert.image_url || cert.logo
    
    if (imageUrl) {
      setSelectedImage(imageUrl)
      setSelectedTitle(title || 'Certificate')
      setLightboxOpen(true)
      document.body.style.overflow = 'hidden'
    }
  }

  // Close lightbox
  const closeLightbox = () => {
    setLightboxOpen(false)
    setSelectedImage(null)
    setSelectedTitle('')
    document.body.style.overflow = 'auto'
  }

  // Handle ESC key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && lightboxOpen) {
        closeLightbox()
      }
    }
    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [lightboxOpen])

  if (loading) {
    return (
      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.header}>
            <span className={styles.badge}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
              {language === 'fa' ? 'افتخارات' : 'Achievements'}
            </span>
            <h2 className={styles.title}>
              {language === 'fa' ? 'گواهینامه‌ها' : 'Certificates'}
            </h2>
            <p className={styles.subtitle}>
              {language === 'fa' ? 'در حال بارگذاری...' : 'Loading...'}
            </p>
          </div>
          <div className={styles.loadingContainer}>
            <div className={styles.spinner}></div>
          </div>
        </div>
      </section>
    )
  }

  if (error || certificates.length === 0) {
    return (
      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.header}>
            <span className={styles.badge}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
              {language === 'fa' ? 'افتخارات' : 'Achievements'}
            </span>
            <h2 className={styles.title}>
              {language === 'fa' ? 'گواهینامه‌ها' : 'Certificates'}
            </h2>
            <p className={styles.subtitle}>
              {language === 'fa' ? 'هیچ مدرکی یافت نشد' : 'No certificates found'}
            </p>
          </div>
        </div>
      </section>
    )
  }

  const visibleItems = getVisibleItems()

  return (
    <>
      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.header}>
            <h2 className={styles.title}>
              {language === 'fa' ? 'گواهینامه‌ها و افتخارات' : 'Achievements And Certificates'}
            </h2>
          </div>

          <div className={styles.carouselWrapper}>
            <div 
              className={styles.carouselContainer}
              ref={containerRef}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              <button 
                className={`${styles.arrow} ${styles.arrowLeft}`}
                onClick={moveLeft}
                aria-label="Previous"
                disabled={isAnimating || certificates.length === 0}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6"/>
                </svg>
              </button>

              <div className={styles.itemsContainer}>
                {visibleItems.map(({ index, position, isActive }) => {
                  const cert = certificates[index]
                  const itemStyle = getItemStyle(position)
                  
                  const title = language === 'fa' 
                    ? cert.title_fa || cert.title 
                    : cert.title_en || cert.title
                  const imageUrl = cert.image || cert.image_url || cert.logo

                  return (
                    <div 
                      key={cert.id || index}
                      className={`${styles.item} ${isActive ? styles.active : ''}`}
                      style={itemStyle}
                      onClick={() => openLightbox(cert)}
                    >
                      <div className={styles.card}>
                        <div className={styles.imageContainer}>
                          {imageUrl ? (
                            <img 
                              src={imageUrl} 
                              alt={title || 'Certificate'}
                              className={styles.image}
                              loading="lazy"
                            />
                          ) : (
                            <div className={styles.placeholder}>
                              <span>🏆</span>
                            </div>
                          )}
                        </div>
                        <div className={styles.info}>
                          <span className={styles.label}>
                            {title}
                          </span>
                          {isActive && (
                            <span className={styles.badgeActive}>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                              </svg>
                            </span>
                          )}
                        </div>
                        {/* Hover overlay for click hint */}
                        <div className={styles.clickOverlay}>
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M8 3H5a2 2 0 0 0-2 2v14c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2v-3"/>
                            <polyline points="18 8 22 4 18 0"/>
                            <line x1="16" y1="10" x2="22" y2="4"/>
                          </svg>
                          <span>{language === 'fa' ? 'برای بزرگنمایی کلیک کنید' : 'Click to enlarge'}</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              <button 
                className={`${styles.arrow} ${styles.arrowRight}`}
                onClick={moveRight}
                aria-label="Next"
                disabled={isAnimating || certificates.length === 0}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </button>
            </div>

            <div className={styles.dotsContainer}>
              {certificates.map((_, index) => (
                <button
                  key={index}
                  className={`${styles.dot} ${index === activeIndex ? styles.dotActive : ''}`}
                  onClick={() => {
                    if (!isAnimating && certificates.length > 0) {
                      setActiveIndex(index)
                      setIsAnimating(true)
                    }
                  }}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Lightbox Modal */}
      {lightboxOpen && selectedImage && (
        <div className={styles.lightboxOverlay} onClick={closeLightbox}>
          <div className={styles.lightboxContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.lightboxClose} onClick={closeLightbox}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
            <div className={styles.lightboxImageWrapper}>
              <img 
                src={selectedImage} 
                alt={selectedTitle}
                className={styles.lightboxImage}
              />
            </div>
            {selectedTitle && (
              <div className={styles.lightboxCaption}>
                <h3>{selectedTitle}</h3>
              </div>
            )}
            <div className={styles.lightboxNav}>
              <button 
                className={styles.lightboxNavBtn}
                onClick={(e) => {
                  e.stopPropagation()
                  moveLeft()
                  // Update selected image to new active
                  const newActive = certificates[activeIndex]
                  if (newActive) {
                    const newTitle = language === 'fa' 
                      ? newActive.title_fa || newActive.title 
                      : newActive.title_en || newActive.title
                    const newImage = newActive.image || newActive.image_url || newActive.logo
                    if (newImage) {
                      setSelectedImage(newImage)
                      setSelectedTitle(newTitle || 'Certificate')
                    }
                  }
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6"/>
                </svg>
              </button>
              <button 
                className={styles.lightboxNavBtn}
                onClick={(e) => {
                  e.stopPropagation()
                  moveRight()
                  const newActive = certificates[activeIndex]
                  if (newActive) {
                    const newTitle = language === 'fa' 
                      ? newActive.title_fa || newActive.title 
                      : newActive.title_en || newActive.title
                    const newImage = newActive.image || newActive.image_url || newActive.logo
                    if (newImage) {
                      setSelectedImage(newImage)
                      setSelectedTitle(newTitle || 'Certificate')
                    }
                  }
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default CertificatesCarousel