'use client'

import React, { useEffect, useRef } from 'react'
import styles from '../../styles/modules/AnimatedBackground.module.css'

const AnimatedBackground = () => {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    let animationId
    let particles = []
    let connections = []

    // تنظیم سایز canvas
    const resize = () => {
      const rect = canvas.parentElement.getBoundingClientRect()
      canvas.width = rect.width
      canvas.height = rect.height
    }

    resize()
    window.addEventListener('resize', resize)

    // ایجاد نقاط (ذرات)
    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width
        this.y = Math.random() * canvas.height
        this.size = Math.random() * 3 + 1
        this.speedX = (Math.random() - 0.5) * 0.5
        this.speedY = (Math.random() - 0.5) * 0.5
        this.opacity = Math.random() * 0.5 + 0.3
        this.pulse = Math.random() * Math.PI * 2
        this.pulseSpeed = Math.random() * 0.02 + 0.01
        this.isBuilding = Math.random() > 0.7 // برخی نقاط شبیه اسکلت ساختمان
      }

      update() {
        this.x += this.speedX
        this.y += this.speedY
        this.pulse += this.pulseSpeed

        // بازگشت به داخل
        if (this.x < 0 || this.x > canvas.width) this.speedX *= -1
        if (this.y < 0 || this.y > canvas.height) this.speedY *= -1

        // نوسان اندازه
        this.currentSize = this.size + Math.sin(this.pulse) * 0.5
      }

      draw() {
        const alpha = this.opacity + Math.sin(this.pulse) * 0.15
        ctx.beginPath()
        
        if (this.isBuilding) {
          // نقاط اسکلت ساختمان - به شکل مربع
          ctx.rect(this.x - this.currentSize, this.y - this.currentSize, this.currentSize * 2, this.currentSize * 2)
          ctx.fillStyle = `rgba(128, 0, 32, ${alpha * 0.6})`
          ctx.shadowColor = 'rgba(128, 0, 32, 0.3)'
          ctx.shadowBlur = 10
        } else {
          // نقاط عادی
          ctx.arc(this.x, this.y, this.currentSize, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(45, 74, 62, ${alpha * 0.5})`
          ctx.shadowColor = 'rgba(45, 74, 62, 0.2)'
          ctx.shadowBlur = 8
        }
        
        ctx.fill()
        ctx.shadowBlur = 0
      }
    }

    // ایجاد اتصالات بین نقاط
    const createConnections = () => {
      connections = []
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const distance = Math.sqrt(dx * dx + dy * dy)
          
          if (distance < 150) {
            connections.push({
              p1: i,
              p2: j,
              distance: distance,
              opacity: 1 - (distance / 150)
            })
          }
        }
      }
    }

    // ایجاد نقاط اولیه
    const initParticles = () => {
      const count = Math.floor((canvas.width * canvas.height) / 3000)
      particles = []
      for (let i = 0; i < count; i++) {
        particles.push(new Particle())
      }
      
      // ایجاد نقاط اسکلت در بخش‌های خاص
      for (let i = 0; i < 20; i++) {
        const p = new Particle()
        p.isBuilding = true
        p.size = Math.random() * 4 + 2
        p.x = canvas.width * (0.2 + Math.random() * 0.6)
        p.y = canvas.height * (0.2 + Math.random() * 0.6)
        particles.push(p)
      }
      
      createConnections()
    }

    initParticles()

    // انیمیشن
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      // به‌روزرسانی و رسم نقاط
      particles.forEach(p => {
        p.update()
        p.draw()
      })

      // رسم خطوط اتصال
      connections.forEach(conn => {
        const p1 = particles[conn.p1]
        const p2 = particles[conn.p2]
        
        if (p1 && p2) {
          const gradient = ctx.createLinearGradient(p1.x, p1.y, p2.x, p2.y)
          gradient.addColorStop(0, `rgba(128, 0, 32, ${conn.opacity * 0.15})`)
          gradient.addColorStop(0.5, `rgba(45, 74, 62, ${conn.opacity * 0.1})`)
          gradient.addColorStop(1, `rgba(128, 0, 32, ${conn.opacity * 0.15})`)
          
          ctx.beginPath()
          ctx.moveTo(p1.x, p1.y)
          ctx.lineTo(p2.x, p2.y)
          ctx.strokeStyle = gradient
          ctx.lineWidth = 0.5
          ctx.stroke()
        }
      })

      // به‌روزرسانی اتصالات هر ۵۰ فریم
      if (Math.random() > 0.98) {
        createConnections()
      }

      animationId = requestAnimationFrame(animate)
    }

    animate()

    // Cleanup
    return () => {
      window.removeEventListener('resize', resize)
      if (animationId) {
        cancelAnimationFrame(animationId)
      }
    }
  }, [])

  return (
    <div className={styles.backgroundContainer}>
      <canvas ref={canvasRef} className={styles.canvas} />
    </div>
  )
}

export default AnimatedBackground
