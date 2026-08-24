'use client'

import React, { useEffect, useRef } from 'react'

const AnimatedBackground = () => {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    let animationId
    let particles = []
    let frameCount = 0

    const resize = () => {
      const rect = canvas.parentElement.getBoundingClientRect()
      canvas.width = rect.width
      canvas.height = rect.height
    }

    resize()
    window.addEventListener('resize', resize)

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width
        this.y = Math.random() * canvas.height
        this.size = Math.random() * 2 + 0.5
        this.speedX = (Math.random() - 0.5) * 0.3
        this.speedY = (Math.random() - 0.5) * 0.3
        this.opacity = Math.random() * 0.3 + 0.1
        this.pulse = Math.random() * Math.PI * 2
        this.pulseSpeed = Math.random() * 0.01 + 0.005
        this.isBuilding = Math.random() > 0.85
      }

      update() {
        this.x += this.speedX
        this.y += this.speedY
        this.pulse += this.pulseSpeed

        if (this.x < 0 || this.x > canvas.width) this.speedX *= -1
        if (this.y < 0 || this.y > canvas.height) this.speedY *= -1

        this.currentSize = this.size + Math.sin(this.pulse) * 0.3
      }

      draw() {
        const alpha = this.opacity + Math.sin(this.pulse) * 0.08
        ctx.beginPath()
        
        if (this.isBuilding) {
          ctx.rect(this.x - this.currentSize, this.y - this.currentSize, this.currentSize * 2, this.currentSize * 2)
          ctx.fillStyle = `rgba(128, 0, 32, ${alpha * 0.5})`
        } else {
          ctx.arc(this.x, this.y, this.currentSize, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(45, 74, 62, ${alpha * 0.4})`
        }
        
        ctx.fill()
      }
    }

    const initParticles = () => {
      const count = Math.min(Math.floor((canvas.width * canvas.height) / 5000), 80)
      particles = []
      for (let i = 0; i < count; i++) {
        particles.push(new Particle())
      }
    }

    initParticles()

    const animate = () => {
      frameCount++
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      // فقط هر 2 فریم آپدیت شود برای کاهش مصرف CPU
      if (frameCount % 2 === 0) {
        particles.forEach(p => p.update())
      }
      
      particles.forEach(p => p.draw())

      animationId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', resize)
      if (animationId) {
        cancelAnimationFrame(animationId)
      }
    }
  }, [])

  return <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
}

export default AnimatedBackground
