'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useLanguage } from '../../../../contexts/LanguageContext'
import styles from '../../styles/BeforeAfterSlider.module.css'

const BeforeAfterSlider = ({ project }) => {
  const { t } = useLanguage()
  const homeT = t.home || {}
  
  const [sliderPosition, setSliderPosition] = useState(50)
  const [isDragging, setIsDragging] = useState(false)
  const [currentProject, setCurrentProject] = useState(project)
  const containerRef = useRef(null)
  const lineRef = useRef(null)
  const thumbnailContainerRef = useRef(null)
  
  const [isDraggingScroll, setIsDraggingScroll] = useState(false)
  const [startY, setStartY] = useState(0)
  const [scrollStart, setScrollStart] = useState(0)
  const [velocity, setVelocity] = useState(0)
  const [lastMoveTime, setLastMoveTime] = useState(0)
  const [lastMoveY, setLastMoveY] = useState(0)
  const animationRef = useRef(null)

  const allProjects = [
    {
      id: 1,
      title: homeT.projects?.project1 || 'سازه LSF مسکونی',
      description: homeT.projects?.project1Desc || 'پروژه مسکونی ۴ طبقه با سازه LSF در تهران',
      beforeImage: '/projects/before-1.jpg',
      afterImage: '/projects/after-1.jpg',
    },
    {
      id: 2,
      title: homeT.projects?.project2 || 'ویلای لوکس',
      description: homeT.projects?.project2Desc || 'طراحی و اجرای ویلای لوکس با سیستم کناف',
      beforeImage: '/projects/before-2.jpg',
      afterImage: '/projects/after-2.jpg',
    },
    {
      id: 3,
      title: homeT.projects?.project3 || 'سازه صنعتی LSF',
      description: homeT.projects?.project3Desc || 'سوله صنعتی با سازه سبک فولادی',
      beforeImage: '/projects/before-3.jpg',
      afterImage: '/projects/after-3.jpg',
    },
    {
      id: 4,
      title: homeT.projects?.project4 || 'کناف مدرن',
      description: homeT.projects?.project4Desc || 'طراحی و اجرای کناف در ساختمان اداری',
      beforeImage: '/projects/before-4.jpg',
      afterImage: '/projects/after-4.jpg',
    },
    {
      id: 5,
      title: homeT.projects?.project5 || 'مجتمع مسکونی',
      description: homeT.projects?.project5Desc || 'مجتمع مسکونی ۵ طبقه با سازه LSF',
      beforeImage: '/projects/before-5.jpg',
      afterImage: '/projects/after-5.jpg',
    },
    {
      id: 6,
      title: homeT.projects?.project6 || 'سوله ورزشی',
      description: homeT.projects?.project6Desc || 'سوله ورزشی با سازه LSF و کناف',
      beforeImage: '/projects/before-6.jpg',
      afterImage: '/projects/after-6.jpg',
    },
    {
      id: 7,
      title: homeT.projects?.project7 || 'ساختمان اداری',
      description: homeT.projects?.project7Desc || 'ساختمان اداری ۸ طبقه با سیستم کناف',
      beforeImage: '/projects/before-7.jpg',
      afterImage: '/projects/after-7.jpg',
    },
    {
      id: 8,
      title: homeT.projects?.project8 || 'مجتمع تجاری',
      description: homeT.projects?.project8Desc || 'مجتمع تجاری با سازه LSF مدرن',
      beforeImage: '/projects/before-8.jpg',
      afterImage: '/projects/after-8.jpg',
    },
    {
      id: 9,
      title: homeT.projects?.project9 || 'سازه LSF صنعتی',
      description: homeT.projects?.project9Desc || 'کارخانه تولیدی با سازه LSF',
      beforeImage: '/projects/before-9.jpg',
      afterImage: '/projects/after-9.jpg',
    },
    {
      id: 10,
      title: homeT.projects?.project10 || 'ویلای مدرن',
      description: homeT.projects?.project10Desc || 'ویلای مدرن با طراحی کناف و LSF',
      beforeImage: '/projects/before-10.jpg',
      afterImage: '/projects/after-10.jpg',
    },
  ]

  const selectProject = (project) => {
    setCurrentProject(project)
    setSliderPosition(50)
  }

  const handleMouseDown = useCallback((e) => {
    e.preventDefault()
    setIsDragging(true)
    document.body.style.cursor = 'ew-resize'
    document.body.style.userSelect = 'none'
  }, [])

  const handleTouchStart = useCallback((e) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleMove = useCallback((clientX) => {
    if (!containerRef.current) return
    
    const rect = containerRef.current.getBoundingClientRect()
    const x = clientX - rect.left
    const width = rect.width
    let percentage = (x / width) * 100
    
    if (percentage < 0) percentage = 0
    if (percentage > 100) percentage = 100
    
    setSliderPosition(percentage)
  }, [])

  const handleMouseMove = useCallback((e) => {
    if (isDragging) {
      handleMove(e.clientX)
    }
  }, [isDragging, handleMove])

  const handleTouchMove = useCallback((e) => {
    if (isDragging) {
      handleMove(e.touches[0].clientX)
    }
  }, [isDragging, handleMove])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
    document.body.style.cursor = ''
    document.body.style.userSelect = ''
  }, [])

  const handleScrollStart = (e) => {
    const clientY = e.type === 'touchstart' ? e.touches[0].clientY : e.clientY
    setIsDraggingScroll(true)
    setStartY(clientY)
    setScrollStart(thumbnailContainerRef.current?.scrollTop || 0)
    setVelocity(0)
    setLastMoveY(clientY)
    setLastMoveTime(Date.now())
    
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
      animationRef.current = null
    }
  }

  const handleScrollMove = (e) => {
    if (!isDraggingScroll) return
    
    const clientY = e.type === 'touchmove' ? e.touches[0].clientY : e.clientY
    const container = thumbnailContainerRef.current
    if (!container) return
    
    const deltaY = startY - clientY
    const newScrollTop = scrollStart + deltaY
    
    const maxScroll = container.scrollHeight - container.clientHeight
    container.scrollTop = Math.max(0, Math.min(newScrollTop, maxScroll))
    
    const now = Date.now()
    const timeDiff = now - lastMoveTime
    if (timeDiff > 0) {
      const speed = (lastMoveY - clientY) / timeDiff
      setVelocity(speed * 0.8)
    }
    setLastMoveY(clientY)
    setLastMoveTime(now)
  }

  const handleScrollEnd = () => {
    setIsDraggingScroll(false)
    
    if (Math.abs(velocity) > 0.1) {
      const container = thumbnailContainerRef.current
      if (!container) return
      
      const maxScroll = container.scrollHeight - container.clientHeight
      let currentScroll = container.scrollTop
      let speed = velocity * 100
      
      const animateInertia = () => {
        if (Math.abs(speed) < 0.5) {
          animationRef.current = null
          return
        }
        
        currentScroll -= speed
        speed *= 0.95
        
        if (currentScroll < 0) {
          currentScroll = 0
          speed = 0
        } else if (currentScroll > maxScroll) {
          currentScroll = maxScroll
          speed = 0
        }
        
        container.scrollTop = currentScroll
        
        if (Math.abs(speed) > 0.5) {
          animationRef.current = requestAnimationFrame(animateInertia)
        } else {
          animationRef.current = null
        }
      }
      
      animateInertia()
    }
  }

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove, { passive: false })
      window.addEventListener('touchmove', handleTouchMove, { passive: false })
      window.addEventListener('mouseup', handleMouseUp, { passive: false })
      window.addEventListener('touchend', handleMouseUp, { passive: false })
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('touchmove', handleTouchMove)
      window.removeEventListener('mouseup', handleMouseUp)
      window.removeEventListener('touchend', handleMouseUp)
    }
  }, [isDragging, handleMouseMove, handleTouchMove, handleMouseUp])

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
        animationRef.current = null
      }
    }
  }, [])

  return (
    <div className={styles.sliderContainer}>
      <div className={styles.sliderMain}>
        <div className={styles.sliderWrapper} ref={containerRef}>
          <div className={styles.beforeImage}>
            <div className={styles.imageContent}>
              <div className={styles.placeholderImage}>
                <span>🏗️</span>
                <span>{homeT.projects?.beforeLabel || 'قبل از اجرا'}</span>
              </div>
              <div className={styles.imageLabel}>{homeT.projects?.beforeLabel || 'قبل'}</div>
            </div>
          </div>
          
          <div 
            className={styles.afterImage}
            style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
          >
            <div className={styles.imageContent}>
              <div className={styles.placeholderImage}>
                <span>✨</span>
                <span>{homeT.projects?.afterLabel || 'بعد از اجرا'}</span>
              </div>
              <div className={styles.imageLabel}>{homeT.projects?.afterLabel || 'بعد'}</div>
            </div>
          </div>
          
          <div 
            ref={lineRef}
            className={styles.sliderLine}
            style={{ left: `${sliderPosition}%` }}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
          >
            <div className={styles.sliderHandle}>
              <ChevronLeft size={18} />
              <ChevronRight size={18} />
            </div>
          </div>
          
          {!isDragging && (
            <div className={styles.sliderGuide}>
              <span>↔ {homeT.projects?.dragHint || 'بکشید'}</span>
            </div>
          )}
          
          <div className={styles.sliderPercent}>
            <span>{Math.round(sliderPosition)}%</span>
          </div>
        </div>
        
        <div className={styles.thumbnailWrapper}>
          <div 
            className={styles.thumbnailContainer} 
            ref={thumbnailContainerRef}
            onMouseDown={handleScrollStart}
            onMouseMove={handleScrollMove}
            onMouseUp={handleScrollEnd}
            onMouseLeave={handleScrollEnd}
            onTouchStart={handleScrollStart}
            onTouchMove={handleScrollMove}
            onTouchEnd={handleScrollEnd}
          >
            <div className={styles.thumbnailList}>
              {allProjects.map((p, index) => (
                <div 
                  key={p.id}
                  className={`${styles.thumbnailItem} ${currentProject.id === p.id ? styles.activeThumbnail : ''}`}
                  onClick={() => selectProject(p)}
                >
                  <div className={styles.thumbnailImage}>
                    <div className={styles.thumbnailBg}>
                      <span>📸</span>
                    </div>
                    <div className={styles.thumbnailOverlay} />
                    <div className={styles.thumbnailContent}>
                      <span className={styles.thumbnailNumber}>۰{index + 1}</span>
                      <span className={styles.thumbnailTitle}>{p.title}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {!isDraggingScroll && (
              <div className={styles.dragHint}>
                <span>↕ {homeT.projects?.dragHintVertical || 'بکشید'}</span>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className={styles.sliderInfo}>
        <div className={styles.sliderLabels}>
          <div className={styles.beforeLabel}>
            <span className={styles.labelDot} style={{ background: '#800020' }} />
            {homeT.projects?.beforeLabel || 'قبل از اجرا'}
          </div>
          <div className={styles.sliderTitle}>
            <h3>{currentProject.title}</h3>
            <p>{currentProject.description}</p>
          </div>
          <div className={styles.afterLabel}>
            <span className={styles.labelDot} style={{ background: '#2d4a3e' }} />
            {homeT.projects?.afterLabel || 'بعد از اجرا'}
          </div>
        </div>
      </div>
    </div>
  )
}

export default BeforeAfterSlider
