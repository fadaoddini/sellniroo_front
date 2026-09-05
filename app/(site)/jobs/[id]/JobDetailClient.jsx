// app/jobs/[id]/JobDetailClient.jsx
'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { 
  MapPin, 
  DollarSign, 
  Clock, 
  Phone, 
  Heart, 
  Building2, 
  ArrowRight,
  Calendar,
  Briefcase,
  Users,
  CheckCircle,
  Share2,
  Bookmark,
  Mail,
  Globe,
  Instagram,
  Linkedin,
  Twitter,
  ChevronRight,
  Star,
  Eye,
  MessageCircle,
  ShieldCheck,
  Truck,
  Utensils,
  Award,
  Wifi,
  User,
  XCircle,
  MinusCircle
} from 'lucide-react'
import styles from './JobDetail.module.css'

export default function JobDetailClient({ job }) {
  const { isAuthenticated, user } = useAuth()
  const router = useRouter()
  const [isLiked, setIsLiked] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [showContact, setShowContact] = useState(false)
  const [isApplying, setIsApplying] = useState(false)
  const [applicationStatus, setApplicationStatus] = useState(null)

  // تعیین نوع آگهی
  const isHiring = job.type === 'hiring'
  const adTypeLabel = isHiring ? 'استخدام' : 'کارجو'
  const adTypeIcon = isHiring ? <Briefcase size={20} /> : <User size={20} />
  const adTypeColor = isHiring ? '#e67e22' : '#2ecc71'

  // چک کردن لاگین برای اقدامات نیازمند احراز هویت
  const requireAuth = (callback) => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=/jobs/${job.id}`)
      return
    }
    callback()
  }

  const handleApply = () => {
    requireAuth(() => {
      setIsApplying(true)
      setTimeout(() => {
        setApplicationStatus('success')
        setIsApplying(false)
      }, 1500)
    })
  }

  const handleContact = () => {
    requireAuth(() => {
      setShowContact(!showContact)
    })
  }

  const handleLike = () => {
    requireAuth(() => {
      setIsLiked(!isLiked)
    })
  }

  const handleBookmark = () => {
    requireAuth(() => {
      setIsBookmarked(!isBookmarked)
    })
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: job.title,
        text: job.description,
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert('لینک آگهی کپی شد!')
    }
  }

  // محاسبه روزهای گذشته
  const getDaysAgo = (date) => {
    if (!date) return 'تاریخ نامشخص'
    const now = new Date()
    const jobDate = new Date(date.split('/').join('-'))
    const diffTime = Math.abs(now - jobDate)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'امروز'
    if (diffDays === 1) return 'دیروز'
    if (diffDays < 7) return `${diffDays} روز پیش`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} هفته پیش`
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} ماه پیش`
    return `${Math.floor(diffDays / 365)} سال پیش`
  }

  // فرمت کردن حقوق
  const formatSalary = (amount) => {
    if (!amount) return null
    return new Intl.NumberFormat('fa-IR').format(amount)
  }

  // نمایش حقوق
  const renderSalary = () => {
    if (!isHiring) return null
    if (job.minSalary && job.maxSalary) {
      return `${formatSalary(job.minSalary)} - ${formatSalary(job.maxSalary)} تومان`
    }
    if (job.minSalary) {
      return `از ${formatSalary(job.minSalary)} تومان`
    }
    if (job.maxSalary) {
      return `تا ${formatSalary(job.maxSalary)} تومان`
    }
    return 'توافقی'
  }

  // ویژگی‌های آگهی
  const features = [
    { key: 'hasInsurance', icon: ShieldCheck, label: 'بیمه', value: job.hasInsurance },
    { key: 'hasExperience', icon: Clock, label: 'سابقه کار', value: job.hasExperience },
    { key: 'hasTransportation', icon: Truck, label: 'سرویس رفت و آمد', value: job.hasTransportation },
    { key: 'hasMeal', icon: Utensils, label: 'وعده غذایی', value: job.hasMeal },
    { key: 'hasBonus', icon: Award, label: 'پاداش', value: job.hasBonus },
    { key: 'hasFlexibleHours', icon: Calendar, label: 'ساعت انعطاف‌پذیر', value: job.hasFlexibleHours },
    { key: 'hasRemoteWork', icon: Wifi, label: 'دورکاری', value: job.hasRemoteWork }
  ]

  const getFeatureStatus = (value) => {
    if (value === true) return { class: styles.active, icon: <CheckCircle size={16} className={styles.featureActiveIcon} />, text: 'دارد' }
    if (value === false) return { class: styles.inactive, icon: <XCircle size={16} className={styles.featureInactiveIcon} />, text: 'ندارد' }
    return { class: styles.unknown, icon: <MinusCircle size={16} className={styles.featureUnknownIcon} />, text: 'نامشخص' }
  }

  return (
    <div className={styles.jobDetailPage}>
      <div className={styles.container}>
        {/* مسیر یابی (Breadcrumb) */}
        <nav className={styles.breadcrumb} aria-label="مسیر یابی">
          <Link href="/" className={styles.breadcrumbLink}>
            خانه
          </Link>
          <ChevronRight size={14} className={styles.breadcrumbSeparator} />
          <Link href="/" className={styles.breadcrumbLink}>
            آگهی‌های شغلی
          </Link>
          <ChevronRight size={14} className={styles.breadcrumbSeparator} />
          <span className={styles.breadcrumbCurrent}>{job.title}</span>
        </nav>

        <div className={styles.jobDetailGrid}>
          {/* ستون اصلی */}
          <div className={styles.mainColumn}>
            {/* کارت اصلی آگهی */}
            <div className={styles.jobCard}>
              {/* تصویر شاخص */}
              <div className={styles.jobImageWrapper}>
                {job.image ? (
                  <div className={styles.jobImage}>
                    <Image
                      src={job.image}
                      alt={job.title}
                      fill
                      className={styles.image}
                      priority
                    />
                    {job.isFeatured && (
                      <span className={styles.featuredBadge}>
                        <Star size={12} fill="#fff" />
                        ویژه
                      </span>
                    )}
                    {/* نشان نوع آگهی روی تصویر */}
                    <div className={`${styles.adTypeOverlay} ${isHiring ? styles.hiringOverlay : styles.seekingOverlay}`}>
                      {adTypeIcon}
                      <span>{adTypeLabel}</span>
                    </div>
                  </div>
                ) : (
                  <div className={styles.jobImagePlaceholder}>
                    <Building2 size={64} className={styles.placeholderIcon} />
                    <span>بدون تصویر</span>
                  </div>
                )}
              </div>

              {/* هدر آگهی */}
              <div className={styles.jobHeader}>
                <div className={styles.jobTitleSection}>
                  <div className={styles.jobTitleRow}>
                    <h1 className={styles.jobTitle}>{job.title}</h1>
                    <span className={`${styles.adTypeBadgeLarge} ${isHiring ? styles.hiringBadgeLarge : styles.seekingBadgeLarge}`}>
                      {adTypeLabel}
                    </span>
                  </div>
                  <div className={styles.jobCompany}>
                    <Building2 size={18} className={styles.companyIcon} />
                    <span>{job.company}</span>
                    {job.isVerified && (
                      <span className={styles.verifiedBadge}>
                        <ShieldCheck size={14} />
                        تایید شده
                      </span>
                    )}
                  </div>
                </div>
                <div className={styles.jobActions}>
                  <button
                    onClick={handleBookmark}
                    className={`${styles.actionBtn} ${isBookmarked ? styles.active : ''}`}
                    aria-label={isBookmarked ? 'حذف از نشان‌ها' : 'افزودن به نشان‌ها'}
                  >
                    <Bookmark size={18} fill={isBookmarked ? '#e67e22' : 'none'} />
                  </button>
                  <button
                    onClick={handleLike}
                    className={`${styles.actionBtn} ${isLiked ? styles.active : ''}`}
                    aria-label={isLiked ? 'حذف از علاقه‌مندی‌ها' : 'افزودن به علاقه‌مندی‌ها'}
                  >
                    <Heart size={18} fill={isLiked ? '#e67e22' : 'none'} />
                  </button>
                  <button
                    onClick={handleShare}
                    className={styles.actionBtn}
                    aria-label="اشتراک‌گذاری"
                  >
                    <Share2 size={18} />
                  </button>
                </div>
              </div>

              {/* جزئیات سریع */}
              <div className={styles.jobQuickInfo}>
                <div className={styles.quickInfoItem}>
                  <MapPin size={16} className={styles.quickInfoIcon} />
                  <span>{job.location}</span>
                </div>
                {isHiring && renderSalary() && (
                  <div className={styles.quickInfoItem}>
                    <DollarSign size={16} className={styles.quickInfoIcon} />
                    <span>{renderSalary()}</span>
                  </div>
                )}
                <div className={styles.quickInfoItem}>
                  <Clock size={16} className={styles.quickInfoIcon} />
                  <span>{job.cooperationType}</span>
                </div>
                <div className={styles.quickInfoItem}>
                  <Calendar size={16} className={styles.quickInfoIcon} />
                  <span>{getDaysAgo(job.date)}</span>
                </div>
                {isHiring && job.experience && (
                  <div className={styles.quickInfoItem}>
                    <Briefcase size={16} className={styles.quickInfoIcon} />
                    <span>{job.experience}</span>
                  </div>
                )}
              </div>

              {/* ویژگی‌ها (فقط برای استخدام) */}
              {isHiring && (
                <div className={styles.featuresSection}>
                  <h3 className={styles.featuresTitle}>مزایا و امکانات</h3>
                  <div className={styles.featuresGrid}>
                    {features.map((feature) => {
                      const status = getFeatureStatus(feature.value)
                      return (
                        <div key={feature.key} className={`${styles.featureItem} ${status.class}`}>
                          <feature.icon size={18} />
                          <span className={styles.featureLabel}>{feature.label}</span>
                          {status.icon}
                          <span className={styles.featureStatus}>{status.text}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* اطلاعات تکمیلی */}
              <div className={styles.jobAdditionalInfo}>
                <div className={styles.infoGrid}>
                  {job.experience && (
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>سابقه کار</span>
                      <span className={styles.infoValue}>{job.experience}</span>
                    </div>
                  )}
                  {job.education && (
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>مدرک تحصیلی</span>
                      <span className={styles.infoValue}>{job.education}</span>
                    </div>
                  )}
                  {job.gender && (
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>جنسیت</span>
                      <span className={styles.infoValue}>{job.gender}</span>
                    </div>
                  )}
                  {job.ageRange && (
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>بازه سنی</span>
                      <span className={styles.infoValue}>{job.ageRange}</span>
                    </div>
                  )}
                  {job.date && (
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>تاریخ انتشار</span>
                      <span className={styles.infoValue}>{job.date}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* توضیحات کامل */}
              <div className={styles.jobDescription}>
                <h2 className={styles.sectionTitle}>توضیحات آگهی</h2>
                <p className={styles.descriptionText}>{job.description}</p>
              </div>

              {/* تگ‌ها */}
              <div className={styles.jobTagsSection}>
                <span className={styles.tagsLabel}>تخصص‌ها:</span>
                <div className={styles.jobTags}>
                  {job.tags.map((tag, index) => (
                    <span key={index} className={styles.tag}>{tag}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* آگهی‌های مشابه */}
            <div className={styles.similarJobs}>
              <h2 className={styles.sectionTitle}>آگهی‌های مشابه</h2>
              <div className={styles.similarJobsGrid}>
                {/* اینجا میتونید آگهی‌های مشابه رو نمایش بدید */}
                <p className={styles.similarPlaceholder}>آگهی‌های مشابه در حال بارگذاری...</p>
              </div>
            </div>
          </div>

          {/* ستون کناری */}
          <div className={styles.sideColumn}>
            {/* کارت اقدامات */}
            <div className={styles.actionCard}>
              <h3 className={styles.actionCardTitle}>ثبت درخواست</h3>
              
              {!isAuthenticated ? (
                <div className={styles.loginRequired}>
                  <p className={styles.loginMessage}>
                    برای ثبت درخواست و مشاهده اطلاعات تماس، لطفاً وارد حساب کاربری خود شوید.
                  </p>
                  <Link href={`/login?redirect=/jobs/${job.id}`} className={styles.loginBtn}>
                    ورود به حساب کاربری
                  </Link>
                </div>
              ) : (
                <>
                  {applicationStatus === 'success' ? (
                    <div className={styles.applicationSuccess}>
                      <CheckCircle size={48} className={styles.successIcon} />
                      <h4>درخواست شما با موفقیت ثبت شد!</h4>
                      <p>به زودی با شما تماس گرفته خواهد شد.</p>
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={handleApply}
                        disabled={isApplying}
                        className={styles.applyBtn}
                      >
                        {isApplying ? (
                          <>
                            <span className={styles.spinner}></span>
                            در حال ثبت...
                          </>
                        ) : (
                          <>
                            <Briefcase size={18} />
                            ثبت درخواست
                          </>
                        )}
                      </button>

                      <button
                        onClick={handleContact}
                        className={styles.contactBtn}
                      >
                        <Phone size={18} />
                        {showContact ? 'بستن اطلاعات تماس' : 'مشاهده اطلاعات تماس'}
                      </button>

                      {showContact && (
                        <div className={styles.contactInfo}>
                          <div className={styles.contactItem}>
                            <Phone size={14} />
                            <span>۰۹۱۲-۳۴۵-۶۷۸۹</span>
                          </div>
                          <div className={styles.contactItem}>
                            <Mail size={14} />
                            <span>info@ariastad.com</span>
                          </div>
                          <div className={styles.contactItem}>
                            <MessageCircle size={14} />
                            <span>@ariastad_company</span>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </>
              )}
            </div>

            {/* اطلاعات شرکت */}
            <div className={styles.companyCard}>
              <h3 className={styles.companyCardTitle}>درباره شرکت</h3>
              <div className={styles.companyInfo}>
                <div className={styles.companyLogoLarge}>
                  <Building2 size={32} />
                </div>
                <h4 className={styles.companyNameLarge}>{job.company}</h4>
                <p className={styles.companyDesc}>
                  شرکت {job.company} با سال‌ها تجربه در حوزه کاریابی و استخدام، 
                  محیطی پویا و حرفه‌ای برای رشد و پیشرفت فراهم کرده است.
                </p>
                <div className={styles.companySocials}>
                  <button className={styles.socialBtn} aria-label="اینستاگرام">
                    <Instagram size={18} />
                  </button>
                  <button className={styles.socialBtn} aria-label="لینکدین">
                    <Linkedin size={18} />
                  </button>
                  <button className={styles.socialBtn} aria-label="توییتر">
                    <Twitter size={18} />
                  </button>
                  <button className={styles.socialBtn} aria-label="وبسایت">
                    <Globe size={18} />
                  </button>
                </div>
              </div>
            </div>

            {/* آمار آگهی */}
            <div className={styles.statsCard}>
              <div className={styles.statItem}>
                <Eye size={16} />
                <span>۱۲۳ بازدید</span>
              </div>
              <div className={styles.statItem}>
                <Users size={16} />
                <span>۴۵ درخواست</span>
              </div>
              <div className={styles.statItem}>
                <Clock size={16} />
                <span>{getDaysAgo(job.date)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}