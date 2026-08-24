'use client'

import React, { useState, useEffect } from 'react'
import { 
  Ruler, Building2, DollarSign, Clock, 
  TrendingUp, Info, AlertCircle, HelpCircle,
  ChevronDown, ChevronUp
} from 'lucide-react'
import DesignCanvas from './DesignCanvas'
import styles from '../../../styles/modules/DesignModule.module.css'

const DesignModule = () => {
  const [formData, setFormData] = useState({
    totalArea: 0,
    width: 0,
    height: 0,
    floors: 1,
  })
  
  // ✅ قیمت‌های پایه هر متر مربع برای ۱ طبقه
  const BASE_PRICE_PER_METER = {
    min: 8_200_000,  // حداقل قیمت هر متر مربع
    max: 13_500_000, // حداکثر قیمت هر متر مربع
  }
  
  // ✅ ضرایب اضافی بر اساس طبقات
  const FLOOR_MULTIPLIER = {
    1: 1.0,
    2: 1.95,  
    3: 2.93,  
    4: 3.90,  
  }
  
  // ✅ فاکتورهای تأثیرگذار بر قیمت
  const priceFactors = [
    { 
      id: 'design', 
      label: 'نوع طراحی', 
      desc: 'طراحی ساده یا پیچیده',
      min: 1.0,
      max: 1.3
    },
    { 
      id: 'quality', 
      label: 'کیفیت ورق گالوانیزه', 
      desc: 'ورق با ضخامت و کیفیت بالاتر',
      min: 1.0,
      max: 1.25
    },
    { 
      id: 'roof', 
      label: 'نوع سقف', 
      desc: 'سقف تیرچه‌بلوک یا سقف کامپوزیت',
      min: 1.0,
      max: 1.2
    },
    { 
      id: 'location', 
      label: 'محل اجرای پروژه', 
      desc: 'هزینه حمل و نیروی کار در شهرهای مختلف',
      min: 0.9,
      max: 1.35
    },
    { 
      id: 'finishing', 
      label: 'سطح نازک‌کاری', 
      desc: 'کیفیت نازک‌کاری داخلی و خارجی',
      min: 1.0,
      max: 1.4
    },
  ]
  
  const [calculation, setCalculation] = useState({
    pricePerMeterMin: BASE_PRICE_PER_METER.min,
    pricePerMeterMax: BASE_PRICE_PER_METER.max,
    totalPriceMin: 0,
    totalPriceMax: 0,
    totalTime: 0,
    area: 0,
    floorMultiplier: 1.0,
  })
  
  // ✅ وضعیت نمایش توضیحات قیمت
  const [showPriceDetails, setShowPriceDetails] = useState(false)
  const [showFactors, setShowFactors] = useState(false)

  const floorOptions = [1, 2, 3, 4]
  const MAX_FLOORS = 3 // ✅ حداکثر ۳ طبقه

  const roundToThousand = (price) => Math.round(price / 1000) * 1000

  useEffect(() => {
    const area = formData.totalArea || (formData.width * formData.height)
    const floorMultiplier = FLOOR_MULTIPLIER[formData.floors] || 1.0
    
    // ✅ محاسبه قیمت با ضریب طبقات
    const rawMinPrice = area * BASE_PRICE_PER_METER.min * floorMultiplier
    const rawMaxPrice = area * BASE_PRICE_PER_METER.max * floorMultiplier
    
    const totalPriceMin = roundToThousand(rawMinPrice)
    const totalPriceMax = roundToThousand(rawMaxPrice)
    
    // ✅ زمان تخمینی با در نظر گرفتن طبقات
    const baseTime = Math.ceil(area / 100) * 30 // ۳۰ روز برای هر ۱۰۰ متر
    const totalTime = Math.ceil(baseTime * (1 + (formData.floors - 1) * 0.3)) // هر طبقه ۳۰٪ زمان بیشتر
    
    setCalculation(prev => ({
      ...prev,
      totalPriceMin,
      totalPriceMax,
      totalTime,
      area: area,
      floorMultiplier: floorMultiplier,
      pricePerMeterMin: BASE_PRICE_PER_METER.min * floorMultiplier,
      pricePerMeterMax: BASE_PRICE_PER_METER.max * floorMultiplier,
    }))
  }, [formData])

  const handleAreaChange = (area) => {
    setFormData(prev => ({ ...prev, totalArea: area }))
  }

  const handleDimensionsChange = (dimensions) => {
    const area = dimensions.width * dimensions.height
    setFormData(prev => ({ 
      ...prev, 
      width: dimensions.width, 
      height: dimensions.height,
      totalArea: area 
    }))
  }

  const handleFloorChange = (floors) => {
    if (floors > MAX_FLOORS) {
      alert(`حداکثر تعداد طبقات مجاز ${MAX_FLOORS} طبقه است`)
      return
    }
    setFormData(prev => ({ ...prev, floors }))
  }

  const formatPrice = (price) => new Intl.NumberFormat('fa-IR').format(price)

  // ✅ محاسبه بازه قیمتی با فاکتورها
  const getPriceRangeWithFactors = (baseMin, baseMax) => {
    let minFactor = 1.0
    let maxFactor = 1.0
    
    // ساده‌سازی: محاسبه میانگین فاکتورها
    priceFactors.forEach(factor => {
      minFactor *= factor.min
      maxFactor *= factor.max
    })
    
    return {
      min: baseMin * minFactor,
      max: baseMax * maxFactor,
    }
  }

  const priceRange = getPriceRangeWithFactors(
    calculation.pricePerMeterMin,
    calculation.pricePerMeterMax
  )

  return (
    <div className={styles.designContainer}>
      <div className={styles.designHeader}>
        <div className={styles.headerContent}>
          <h1 className={styles.pageTitle}>🏗️ طراحی و محاسبه سازه LSF</h1>
          <p className={styles.pageDesc}>
            زمین خود را به صورت چندضلعی طراحی کنید و قیمت دقیق سازه را محاسبه نمایید
          </p>
          <div className={styles.headerTips}>
            <span>💡 نکته: با کلیک روی بوم نقاط را مشخص کنید</span>
            <span>🔄 دوبار کلیک یا دکمه تکمیل برای پایان رسم</span>
            <span>📐 حداکثر {MAX_FLOORS} طبقه قابل محاسبه</span>
          </div>
        </div>
      </div>

      <div className={styles.mainGrid}>
        <div className={styles.designSection}>
          <div className={styles.sectionHeader}>
            <h2>✏️ طراحی زمین (چندضلعی)</h2>
            <p>برای شروع، روی بوم کلیک کنید و نقاط را مشخص کنید</p>
          </div>

          <DesignCanvas 
            onAreaChange={handleAreaChange}
            onDimensionsChange={handleDimensionsChange}
          />
        </div>

        <div className={styles.infoSection}>
          <div className={styles.infoCard}>
            <h3 className={styles.infoTitle}>📊 اطلاعات سازه</h3>
            
            <div className={styles.infoGroup}>
              <label className={styles.infoLabel}>
                <Ruler size={16} />
                متراژ کل
              </label>
              <div className={styles.infoValue}>
                {formData.totalArea > 0 
                  ? `${formData.totalArea.toFixed(2)} متر مربع`
                  : 'محاسبه نشده'}
              </div>
            </div>

            <div className={styles.infoGroup}>
              <label className={styles.infoLabel}>
                <Building2 size={16} />
                تعداد طبقات (حداکثر {MAX_FLOORS})
              </label>
              <div className={styles.floorSelector}>
                {floorOptions.map(floor => (
                  <button
                    key={floor}
                    className={`${styles.floorBtn} ${formData.floors === floor ? styles.activeFloor : ''} ${floor > MAX_FLOORS ? styles.disabledFloor : ''}`}
                    onClick={() => handleFloorChange(floor)}
                    disabled={floor > MAX_FLOORS}
                    title={floor > MAX_FLOORS ? `حداکثر ${MAX_FLOORS} طبقه` : ''}
                  >
                    {floor}
                  </button>
                ))}
              </div>
              {formData.floors > MAX_FLOORS && (
                <div className={styles.warningText}>
                  ⚠️ حداکثر تعداد طبقات مجاز {MAX_FLOORS} طبقه است
                </div>
              )}
            </div>

            <div className={styles.infoDivider} />

            {/* ✅ نمایش ضریب طبقات */}
            <div className={styles.floorMultiplierInfo}>
            
              <span className={styles.multiplierDesc}>
                (قیمت هر متر مربع × {formData.floors} طبقه)
              </span>
            </div>

            <div className={styles.infoDivider} />

            {/* ✅ بازه قیمتی */}
            <div className={styles.priceRangeSection}>
              <div className={styles.priceRangeHeader}>
                <h4>💰 بازه قیمتی سازه LSF</h4>
                <button 
                  className={styles.toggleDetailsBtn}
                  onClick={() => setShowPriceDetails(!showPriceDetails)}
                >
                  {showPriceDetails ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  {showPriceDetails ? 'بستن توضیحات' : 'مشاهده توضیحات'}
                </button>
              </div>

              <div className={styles.priceRangeCards}>
                <div className={`${styles.priceCard} ${styles.priceCardMin}`}>
                  <span className={styles.priceLabel}>حداقل قیمت</span>
                  <span className={styles.priceValue}>
                    {calculation.totalPriceMin > 0 
                      ? `${formatPrice(calculation.totalPriceMin)} تومان`
                      : 'محاسبه نشده'}
                  </span>
                  <span className={styles.pricePerMeter}>
                    {formatPrice(Math.round(priceRange.min))} تومان/متر مربع
                  </span>
                </div>

                <div className={`${styles.priceCard} ${styles.priceCardMax}`}>
                  <span className={styles.priceLabel}>حداکثر قیمت</span>
                  <span className={styles.priceValue}>
                    {calculation.totalPriceMax > 0 
                      ? `${formatPrice(calculation.totalPriceMax)} تومان`
                      : 'محاسبه نشده'}
                  </span>
                  <span className={styles.pricePerMeter}>
                    {formatPrice(Math.round(priceRange.max))} تومان/متر مربع
                  </span>
                </div>
              </div>

              {/* ✅ توضیحات بازه قیمتی */}
              {showPriceDetails && (
                <div className={styles.priceDetails}>
                  <div className={styles.priceNote}>
                    <Info size={16} className={styles.noteIcon} />
                    <div>
                      <strong>چرا قیمت‌ها در یک بازه هستند؟</strong>
                      <p>
                        در سازه‌های LSF، قیمت عدد ثابتی ندارد و برای هر پروژه به صورت اختصاصی محاسبه می‌شود.
                        متراژ ساختمان، نوع طراحی، تعداد طبقات، کیفیت ورق گالوانیزه، نوع سقف، 
                        محل اجرای پروژه و سطح نازک‌کاری، مهم‌ترین عوامل تعیین‌کننده هزینه هستند.
                      </p>
                    </div>
                  </div>

                  <button 
                    className={styles.showFactorsBtn}
                    onClick={() => setShowFactors(!showFactors)}
                  >
                    <HelpCircle size={14} />
                    {showFactors ? 'مشاهده عوامل مؤثر' : 'مشاهده عوامل مؤثر بر قیمت'}
                    {showFactors ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>

                  {showFactors && (
                    <div className={styles.factorsList}>
                      {priceFactors.map(factor => (
                        <div key={factor.id} className={styles.factorItem}>
                          <div className={styles.factorHeader}>
                            <span className={styles.factorName}>{factor.label}</span>
                            <span className={styles.factorRange}>
                              {Math.round((factor.min - 1) * 100)}% تا {Math.round((factor.max - 1) * 100)}%
                            </span>
                          </div>
                          <span className={styles.factorDesc}>{factor.desc}</span>
                        </div>
                      ))}
                      <div className={styles.factorNote}>
                        <AlertCircle size={14} />
                        <span>اختلاف قیمت بین دو پروژه با متراژ یکسان کاملاً طبیعی است</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className={styles.infoDivider} />

            <div className={styles.calculationResults}>
              <div className={styles.resultItem}>
                <div className={styles.resultIcon} style={{ background: 'rgba(128, 0, 32, 0.1)', color: '#800020' }}>
                  <DollarSign size={20} />
                </div>
                <div className={styles.resultContent}>
                  <span className={styles.resultLabel}>قیمت هر متر مربع (با ضریب طبقات)</span>
                  <span className={styles.resultValue}>
                    {calculation.pricePerMeterMin > 0 && calculation.pricePerMeterMax > 0
                      ? `${formatPrice(Math.round(calculation.pricePerMeterMin))} - ${formatPrice(Math.round(calculation.pricePerMeterMax))} تومان`
                      : 'محاسبه نشده'}
                  </span>
                </div>
              </div>

              <div className={styles.resultItem}>
                <div className={styles.resultIcon} style={{ background: 'rgba(52, 199, 89, 0.1)', color: '#34c759' }}>
                  <TrendingUp size={20} />
                </div>
                <div className={styles.resultContent}>
                  <span className={styles.resultLabel}>قیمت کل (گرد شده به ۱۰۰۰)</span>
                  <span className={styles.resultValue}>
                    {calculation.totalPriceMin > 0 && calculation.totalPriceMax > 0
                      ? `${formatPrice(calculation.totalPriceMin)} - ${formatPrice(calculation.totalPriceMax)} تومان`
                      : 'محاسبه نشده'}
                  </span>
                </div>
              </div>

              <div className={styles.resultItem}>
                <div className={styles.resultIcon} style={{ background: 'rgba(255, 149, 0, 0.1)', color: '#ff9500' }}>
                  <Clock size={20} />
                </div>
                <div className={styles.resultContent}>
                  <span className={styles.resultLabel}>زمان تخمینی</span>
                  <span className={styles.resultValue}>
                    {calculation.totalTime > 0 
                      ? `${calculation.totalTime} روز (${Math.ceil(calculation.totalTime / 30)} ماه)`
                      : 'محاسبه نشده'}
                  </span>
                </div>
              </div>
            </div>

            <div className={styles.infoBox}>
              <Info size={16} />
              <span>قیمت‌ها به ۱۰۰۰ تومان گرد شده‌اند و بر اساس ضریب طبقات محاسبه شده‌اند</span>
            </div>

            <div className={styles.disclaimerBox}>
              <AlertCircle size={16} />
              <div>
                <strong>توجه:</strong>
                <span>
                  این محاسبات برآورد اولیه است و برای قیمت دقیق باید نقشه‌ها و شرایط واقعی پروژه بررسی شود.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DesignModule