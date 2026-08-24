'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { Plus, Minus, Move, X, RotateCcw, MousePointer, Info, CheckCircle, XCircle } from 'lucide-react'
import styles from '../../../styles/modules/DesignCanvas.module.css'

const DesignCanvas = ({ onAreaChange, onDimensionsChange }) => {
  const canvasRef = useRef(null)
  const containerRef = useRef(null)
  
  const [points, setPoints] = useState([])
  const [isComplete, setIsComplete] = useState(false)
  const [mode, setMode] = useState('draw')
  const [selectedPoint, setSelectedPoint] = useState(null)
  const [hoveredPoint, setHoveredPoint] = useState(null)
  const [scale, setScale] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const [panStart, setPanStart] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState(null)
  const [showGrid, setShowGrid] = useState(true)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const [area, setArea] = useState(0)
  const [showCompletePrompt, setShowCompletePrompt] = useState(false)

  const PIXELS_PER_METER = 40
  const MIN_SCALE = 0.3
  const MAX_SCALE = 3

  const getCanvasCoords = useCallback((e) => {
    const rect = canvasRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left - offset.x * scale * PIXELS_PER_METER) / (scale * PIXELS_PER_METER)
    const y = (e.clientY - rect.top - offset.y * scale * PIXELS_PER_METER) / (scale * PIXELS_PER_METER)
    return { x, y }
  }, [scale, offset])

  const calculateArea = useCallback((pts) => {
    if (pts.length < 3) return 0
    let area = 0
    for (let i = 0; i < pts.length; i++) {
      const j = (i + 1) % pts.length
      area += pts[i].x * pts[j].y
      area -= pts[j].x * pts[i].y
    }
    return Math.abs(area) / 2
  }, [])

  const getCenter = useCallback((pts) => {
    if (pts.length === 0) return { x: 0, y: 0 }
    let cx = 0, cy = 0
    pts.forEach(p => { cx += p.x; cy += p.y })
    return { x: cx / pts.length, y: cy / pts.length }
  }, [])

  const calculateDimensions = useCallback((pts) => {
    if (pts.length < 2) return { width: 0, height: 0 }
    let minX = Infinity, maxX = -Infinity
    let minY = Infinity, maxY = -Infinity
    pts.forEach(p => {
      minX = Math.min(minX, p.x)
      maxX = Math.max(maxX, p.x)
      minY = Math.min(minY, p.y)
      maxY = Math.max(maxY, p.y)
    })
    return { width: maxX - minX, height: maxY - minY }
  }, [])

  const updateInfo = useCallback((pts) => {
    if (pts.length < 3) {
      setDimensions({ width: 0, height: 0 })
      setArea(0)
      if (onAreaChange) onAreaChange(0)
      if (onDimensionsChange) onDimensionsChange({ width: 0, height: 0 })
      return
    }
    const newArea = calculateArea(pts)
    const newDimensions = calculateDimensions(pts)
    setArea(newArea)
    setDimensions(newDimensions)
    if (onAreaChange) onAreaChange(newArea)
    if (onDimensionsChange) onDimensionsChange(newDimensions)
  }, [calculateArea, calculateDimensions, onAreaChange, onDimensionsChange])

  // تکمیل شکل
  const completeShape = () => {
    if (points.length >= 3) {
      setIsComplete(true)
      setMode('edit')
      setShowCompletePrompt(false)
      updateInfo(points)
    }
  }

  // ادامه رسم (بدون حذف نقطه قبلی)
  const continueDrawing = () => {
    setShowCompletePrompt(false)
    // نقطه قبلی حفظ می‌شود، فقط پرامپت بسته می‌شود
  }

  // شروع مجدد (شکل جدید)
  const resetShape = () => {
    setPoints([])
    setIsComplete(false)
    setSelectedPoint(null)
    setMode('draw')
    setShowCompletePrompt(false)
    setDimensions({ width: 0, height: 0 })
    setArea(0)
    if (onAreaChange) onAreaChange(0)
    if (onDimensionsChange) onDimensionsChange({ width: 0, height: 0 })
  }

  const drawGrid = useCallback((ctx, width, height) => {
    if (!showGrid) return
    const pixelPerMeter = scale * PIXELS_PER_METER
    const gridStep = pixelPerMeter
    const offsetX = offset.x * pixelPerMeter
    const offsetY = offset.y * pixelPerMeter
    
    ctx.strokeStyle = 'rgba(200, 200, 200, 0.3)'
    ctx.lineWidth = 0.5
    for (let x = offsetX % gridStep; x < width; x += gridStep) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, height)
      ctx.stroke()
    }
    for (let y = offsetY % gridStep; y < height; y += gridStep) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(width, y)
      ctx.stroke()
    }
    
    const majorStep = gridStep * 5
    ctx.strokeStyle = 'rgba(180, 180, 180, 0.5)'
    ctx.lineWidth = 1
    for (let x = offsetX % majorStep; x < width; x += majorStep) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, height)
      ctx.stroke()
    }
    for (let y = offsetY % majorStep; y < height; y += majorStep) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(width, y)
      ctx.stroke()
    }
    
    ctx.fillStyle = 'rgba(100, 100, 100, 0.5)'
    ctx.font = '9px system-ui'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    for (let x = offsetX % gridStep; x < width; x += gridStep) {
      const meterValue = ((x - offsetX) / pixelPerMeter)
      if (Math.abs(meterValue) > 0.1 && meterValue % 1 === 0 && x > 10) {
        ctx.fillText(`${Math.round(meterValue)}`, x, height - 16)
      }
    }
    ctx.textAlign = 'right'
    ctx.textBaseline = 'middle'
    for (let y = offsetY % gridStep; y < height; y += gridStep) {
      const meterValue = ((y - offsetY) / pixelPerMeter)
      if (Math.abs(meterValue) > 0.1 && meterValue % 1 === 0 && y > 10) {
        ctx.fillText(`${Math.round(meterValue)}`, 16, y)
      }
    }
  }, [scale, offset, showGrid])

  const drawShape = useCallback((ctx, width, height) => {
    if (points.length === 0) {
      ctx.fillStyle = '#8e8e93'
      ctx.font = '16px system-ui'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('🖱️ برای شروع رسم، روی بوم کلیک کنید', width / 2, height / 2 - 20)
      ctx.fillStyle = '#aeaeae'
      ctx.font = '13px system-ui'
      ctx.fillText('با کلیک روی بوم، نقاط را مشخص کنید', width / 2, height / 2 + 20)
      ctx.fillStyle = '#c0c0c0'
      ctx.font = '12px system-ui'
      ctx.fillText('هر مربع = ۱ متر مربع | خطوط نیمه = ۰.۵ متر', width / 2, height / 2 + 50)
      return
    }

    const pixelPerMeter = scale * PIXELS_PER_METER
    const offsetX = offset.x * pixelPerMeter
    const offsetY = offset.y * pixelPerMeter
    
    ctx.save()
    ctx.translate(offsetX, offsetY)
    ctx.scale(pixelPerMeter, pixelPerMeter)

    // رسم خطوط
    if (points.length > 1) {
      ctx.beginPath()
      ctx.moveTo(points[0].x, points[0].y)
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y)
      }
      
      if (isComplete) {
        ctx.closePath()
        ctx.strokeStyle = '#800020'
        ctx.lineWidth = 3 / pixelPerMeter
        ctx.shadowColor = 'rgba(128, 0, 32, 0.3)'
        ctx.shadowBlur = 10 / pixelPerMeter
        ctx.stroke()
        ctx.fillStyle = 'rgba(128, 0, 32, 0.12)'
        ctx.fill()
        ctx.shadowBlur = 0
        
        const area = calculateArea(points)
        if (area > 0) {
          const center = getCenter(points)
          ctx.fillStyle = '#800020'
          ctx.font = `bold ${18 / pixelPerMeter}px system-ui`
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText(`📐 مساحت: ${area.toFixed(2)} متر مربع`, center.x, center.y - 12 / pixelPerMeter)
          const dims = calculateDimensions(points)
          ctx.fillStyle = '#4a4a4a'
          ctx.font = `${13 / pixelPerMeter}px system-ui`
          ctx.fillText(`عرض: ${dims.width.toFixed(1)} متر`, center.x, center.y + 20 / pixelPerMeter)
          ctx.fillText(`طول: ${dims.height.toFixed(1)} متر`, center.x, center.y + 38 / pixelPerMeter)
        }
      } else {
        ctx.strokeStyle = '#007aff'
        ctx.lineWidth = 2.5 / pixelPerMeter
        ctx.setLineDash([8 / pixelPerMeter, 5 / pixelPerMeter])
        ctx.stroke()
        ctx.setLineDash([])
      }
    }

    // رسم نقاط
    points.forEach((point, index) => {
      const isSelected = selectedPoint === index
      const isHovered = hoveredPoint === index
      const isFirst = index === 0
      const isLast = index === points.length - 1
      
      let radius = 6 / pixelPerMeter
      let color = '#007aff'
      let shadowColor = 'rgba(0, 122, 255, 0.3)'
      
      if (isSelected) {
        radius = 9 / pixelPerMeter
        color = '#800020'
        shadowColor = 'rgba(128, 0, 32, 0.4)'
      } else if (isHovered) {
        radius = 8 / pixelPerMeter
        color = '#4f46e5'
        shadowColor = 'rgba(79, 70, 229, 0.3)'
      } else if (isFirst && isComplete) {
        radius = 7 / pixelPerMeter
        color = '#34c759'
        shadowColor = 'rgba(52, 199, 89, 0.3)'
      } else if (isLast && !isComplete) {
        radius = 7 / pixelPerMeter
        color = '#ff9500'
        shadowColor = 'rgba(255, 149, 0, 0.3)'
      }
      
      ctx.beginPath()
      ctx.arc(point.x, point.y, radius, 0, 2 * Math.PI)
      ctx.fillStyle = color
      ctx.shadowColor = shadowColor
      ctx.shadowBlur = 10 / pixelPerMeter
      ctx.fill()
      ctx.shadowBlur = 0
      
      ctx.fillStyle = '#ffffff'
      ctx.font = `bold ${8 / pixelPerMeter}px system-ui`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(index + 1, point.x, point.y)
    })

    ctx.restore()
  }, [points, isComplete, scale, offset, selectedPoint, hoveredPoint, calculateArea, getCenter, calculateDimensions])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const rect = containerRef.current.getBoundingClientRect()
    const dpr = window.devicePixelRatio || 1
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    canvas.style.width = rect.width + 'px'
    canvas.style.height = rect.height + 'px'
    ctx.scale(dpr, dpr)
    ctx.clearRect(0, 0, rect.width, rect.height)
    drawGrid(ctx, rect.width, rect.height)
    drawShape(ctx, rect.width, rect.height)
  }, [points, isComplete, scale, offset, showGrid, selectedPoint, hoveredPoint, drawGrid, drawShape])

  // مدیریت کلیک روی بوم
  const handleMouseDown = (e) => {
    const coords = getCanvasCoords(e)
    
    // اگر شکل کامل شده
    if (isComplete) {
      const threshold = 15 / (scale * PIXELS_PER_METER)
      const pointIndex = points.findIndex(p => 
        Math.abs(p.x - coords.x) < threshold && Math.abs(p.y - coords.y) < threshold
      )
      if (pointIndex !== -1) {
        setSelectedPoint(pointIndex)
        setIsDragging(true)
        setDragStart({ x: coords.x, y: coords.y })
      } else {
        setIsPanning(true)
        setPanStart({ x: e.clientX, y: e.clientY })
      }
      return
    }
    
    // اگر پرامپت تکمیل نمایش داده شده، کلیک روی بوم را نادیده بگیر
    if (showCompletePrompt) {
      return
    }
    
    // حالت رسم
    if (mode === 'draw' && !isComplete) {
      const newPoints = [...points, { x: coords.x, y: coords.y }]
      setPoints(newPoints)
      
      // اگر ۳ نقطه یا بیشتر شد، پرامپت تکمیل نمایش داده شود
      if (newPoints.length >= 3) {
        setShowCompletePrompt(true)
      }
    }
  }

  const handleMouseMove = (e) => {
    const coords = getCanvasCoords(e)
    
    if (isComplete) {
      const threshold = 15 / (scale * PIXELS_PER_METER)
      const pointIndex = points.findIndex(p => 
        Math.abs(p.x - coords.x) < threshold && Math.abs(p.y - coords.y) < threshold
      )
      setHoveredPoint(pointIndex !== -1 ? pointIndex : null)
      canvasRef.current.style.cursor = pointIndex !== -1 ? 'pointer' : 'grab'
    } else {
      canvasRef.current.style.cursor = 'crosshair'
    }
    
    if (isDragging && selectedPoint !== null && isComplete) {
      const newPoints = [...points]
      newPoints[selectedPoint] = { x: coords.x, y: coords.y }
      setPoints(newPoints)
      updateInfo(newPoints)
    }
    
    if (isPanning && isComplete) {
      const dx = e.clientX - panStart.x
      const dy = e.clientY - panStart.y
      const pixelPerMeter = scale * PIXELS_PER_METER
      setOffset(prev => ({
        x: prev.x + dx / pixelPerMeter,
        y: prev.y + dy / pixelPerMeter
      }))
      setPanStart({ x: e.clientX, y: e.clientY })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
    setIsPanning(false)
    setSelectedPoint(null)
  }

  const zoomIn = () => setScale(s => Math.min(s * 1.2, MAX_SCALE))
  const zoomOut = () => setScale(s => Math.max(s / 1.2, MIN_SCALE))
  const resetView = () => { setScale(1); setOffset({ x: 0, y: 0 }) }

  return (
    <div className={styles.canvasContainer}>
      <div className={styles.scaleInfo}>
        <Info size={16} />
        <span>هر مربع = ۱ متر × ۱ متر | خطوط نیمه = ۰.۵ متر</span>
        <span className={styles.scaleDetail}>
          مقیاس: {Math.round(scale * PIXELS_PER_METER)} پیکسل = ۱ متر
        </span>
        {isComplete && (
          <span className={styles.completeBadge}>✅ شکل کامل شد</span>
        )}
      </div>

      <div className={styles.canvasToolbar}>
        <div className={styles.toolGroup}>
          <button 
            className={`${styles.toolBtn} ${!isComplete ? styles.activeTool : ''}`}
            onClick={() => { if (!isComplete) setMode('draw') }}
            disabled={isComplete}
            title="رسم نقاط"
          >
            <Plus size={18} />
            <span>رسم</span>
          </button>
          <button 
            className={`${styles.toolBtn} ${isComplete && mode === 'edit' ? styles.activeTool : ''}`}
            onClick={() => { if (isComplete) setMode('edit') }}
            disabled={!isComplete}
            title="ویرایش نقاط"
          >
            <MousePointer size={18} />
            <span>ویرایش</span>
          </button>
          <button 
            className={`${styles.toolBtn} ${isComplete && mode === 'move' ? styles.activeTool : ''}`}
            onClick={() => { if (isComplete) setMode('move') }}
            disabled={!isComplete}
            title="جابجایی کل شکل"
          >
            <Move size={18} />
            <span>جابجایی</span>
          </button>
        </div>

        <div className={styles.toolGroup}>
          <button 
            className={`${styles.toolBtn} ${styles.newShapeBtn}`}
            onClick={resetShape}
            title="شکل جدید"
          >
            <span>✨</span>
            <span>شکل جدید</span>
          </button>
          <button className={styles.toolBtn} onClick={resetView} title="ریست نمایش">
            <RotateCcw size={18} />
            <span>ریست</span>
          </button>
        </div>

        <div className={styles.toolGroup}>
          <button 
            className={styles.toolBtn}
            onClick={() => setShowGrid(!showGrid)}
          >
            {showGrid ? '📐' : '📏'}
          </button>
          <div className={styles.zoomControls}>
            <button className={styles.toolBtn} onClick={zoomIn}>
              <Plus size={14} />
            </button>
            <span className={styles.zoomLevel}>{Math.round(scale * 100)}%</span>
            <button className={styles.toolBtn} onClick={zoomOut}>
              <Minus size={14} />
            </button>
          </div>
        </div>
      </div>

      <div className={styles.canvasWrapper} ref={containerRef}>
        <canvas
          ref={canvasRef}
          className={styles.canvas}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        />
        
        {!isComplete && points.length > 0 && !showCompletePrompt && (
          <div className={styles.canvasHint}>
            {points.length} نقطه - برای تکمیل به حداقل ۳ نقطه نیاز است
          </div>
        )}

        {/* پرامپت تکمیل شکل */}
        {showCompletePrompt && points.length >= 3 && (
          <div className={styles.completePrompt}>
            <div className={styles.promptContent}>
              <div className={styles.promptIcon}>🔗</div>
              <div className={styles.promptText}>
                <h4>آیا می‌خواهید شکل را کامل کنید؟</h4>
                <p>با تکمیل، آخرین نقطه به نقطه شروع متصل می‌شود و شکل بسته می‌شود</p>
                <p className={styles.promptPoints}>تعداد نقاط فعلی: {points.length}</p>
              </div>
              <div className={styles.promptActions}>
                <button 
                  className={`${styles.promptBtn} ${styles.confirmBtn}`}
                  onClick={completeShape}
                >
                  <CheckCircle size={16} />
                  تکمیل شکل
                </button>
                <button 
                  className={`${styles.promptBtn} ${styles.cancelBtn}`}
                  onClick={continueDrawing}
                >
                  <XCircle size={16} />
                  ادامه رسم
                </button>
              </div>
            </div>
          </div>
        )}

        {isComplete && (
          <div className={styles.canvasHintComplete}>
            ✅ شکل کامل شد - برای ویرایش نقاط بکشید
          </div>
        )}
      </div>

      <div className={styles.canvasInfo}>
        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>وضعیت:</span>
          <span className={`${styles.infoValue} ${isComplete ? styles.complete : ''}`}>
            {isComplete ? '✅ کامل' : points.length > 0 ? '⏳ در حال رسم' : '⭕ خالی'}
          </span>
        </div>
        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>تعداد اضلاع:</span>
          <span className={styles.infoValue}>{points.length || 0}</span>
        </div>
        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>مساحت:</span>
          <span className={styles.infoValue}>
            {area > 0 ? `${area.toFixed(2)} متر مربع` : 'محاسبه نشده'}
          </span>
        </div>
        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>ابعاد:</span>
          <span className={styles.infoValue}>
            {dimensions.width > 0 && dimensions.height > 0 
              ? `${dimensions.width.toFixed(1)} × ${dimensions.height.toFixed(1)} متر`
              : 'تعیین نشده'}
          </span>
        </div>
      </div>
    </div>
  )
}

export default DesignCanvas
