// components/newsAdmin/NewsForm.jsx
'use client'

import React, { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { useLanguage } from '@/contexts/LanguageContext'
import {
  X, Save, FileText, Tag, User,
  Star, Zap, Globe, Calendar, MessageSquare
} from 'lucide-react'
import styles from '@/styles/modules/NewsManagement.module.css'

const CKEditorWrapper = dynamic(
  () => import('./CKEditorWrapper'),
  {
    ssr: false,
    loading: () => (
      <div className={styles.editorLoading}>
        در حال بارگذاری ادیتور...
      </div>
    ),
  }
)

// ✅ تابع ساخت state اولیه
const buildFormData = (news) => ({
  title: news?.title || '',
  subtitle: news?.subtitle || '',
  lid: news?.lid || '',
  description: news?.description || '',  // ✅ حالا با detail endpoint درست میاد
  excerpt: news?.excerpt || '',
  category: news?.category || '',
  status: news?.status || 'draft',
  language: news?.language || 'fa',
  is_featured: news?.is_featured ?? false,
  is_breaking: news?.is_breaking ?? false,
  is_exclusive: news?.is_exclusive ?? false,
  is_hot: news?.is_hot ?? false,
  allow_comments: news?.allow_comments ?? true,
  show_author: news?.show_author ?? true,
  writer_name: news?.writer_name || '',
  writer_bio: news?.writer_bio || '',
  seo_title: news?.seo_title || '',
  seo_description: news?.seo_description || '',
  seo_keywords: news?.seo_keywords || '',
  source_name: news?.source_name || '',
  source_link: news?.source_link || '',
  source_author: news?.source_author || '',
  keywords: Array.isArray(news?.keywords) ? news.keywords.join(', ') : (news?.keywords || ''),
})

const NewsForm = ({ news, categories = [], onClose, onSubmit }) => {
  const { language, dir } = useLanguage()
  const isEdit = !!news

  const [formData, setFormData] = useState(() => buildFormData(news))
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [editorKey, setEditorKey] = useState(0)  // ✅ برای force remount ادیتور

  // ============================================
  // ✅ مهم: هر بار news تغییر کرد، formData رو آپدیت کن
  // ============================================
  useEffect(() => {
    if (!news) return
    console.log('📝 NewsForm received news:', {
      slug: news.slug,
      title: news.title,
      description_length: news.description?.length || 0,
      description_preview: news.description?.substring(0, 100),
    })

    const newFormData = buildFormData(news)
    setFormData(newFormData)

    // ✅ ادیتور رو force remount کن تا data جدید رو بخونه
    setEditorKey((k) => k + 1)
  }, [news])

  const texts = {
    fa: {
      addTitle: 'افزودن خبر جدید',
      editTitle: 'ویرایش خبر',
      basicInfo: 'اطلاعات اصلی',
      settings: 'تنظیمات',
      seo: 'سئو',
      source: 'منبع',
      title: 'عنوان',
      subtitle: 'روتیر (زیر عنوان)',
      lid: 'لید (تیزر کوتاه)',
      description: 'متن کامل خبر',
      excerpt: 'خلاصه خبر',
      category: 'دسته‌بندی',
      status: 'وضعیت',
      language: 'زبان',
      keywords: 'کلمات کلیدی',
      keywordsHint: 'با کاما جدا کنید',
      writerName: 'نام نویسنده',
      writerBio: 'بیوگرافی نویسنده',
      isFeatured: 'خبر ویژه (اسلایدر)',
      isBreaking: 'خبر فوری',
      isExclusive: 'اختصاصی',
      isHot: 'داغ‌ترین خبر',
      allowComments: 'مجاز بودن کامنت',
      showAuthor: 'نمایش نویسنده',
      seoTitle: 'عنوان سئو',
      seoDescription: 'توضیحات سئو',
      seoKeywords: 'کلمات کلیدی سئو',
      sourceName: 'نام منبع',
      sourceLink: 'لینک منبع',
      sourceAuthor: 'نویسنده منبع',
      save: 'ذخیره',
      saving: 'در حال ذخیره...',
      cancel: 'انصراف',
      required: 'این فیلد الزامی است',
      selectCategory: 'انتخاب دسته',
      noCategory: 'بدون دسته',
      statusDraft: 'پیش‌نویس',
      statusPending: 'در انتظار بررسی',
      statusPublished: 'منتشر شده',
      statusScheduled: 'زمان‌بندی شده',
      statusArchived: 'بایگانی شده',
      langFa: 'فارسی',
      langEn: 'انگلیسی',
      langAr: 'عربی',
      langTr: 'ترکی',
      editorPlaceholder: 'متن کامل خبر را اینجا بنویسید...',
    },
    en: {
      addTitle: 'Add News',
      editTitle: 'Edit News',
      basicInfo: 'Basic Info',
      settings: 'Settings',
      seo: 'SEO',
      source: 'Source',
      title: 'Title',
      subtitle: 'Subtitle',
      lid: 'Lead',
      description: 'Full Description',
      excerpt: 'Excerpt',
      category: 'Category',
      status: 'Status',
      language: 'Language',
      keywords: 'Keywords',
      keywordsHint: 'Separate with comma',
      writerName: 'Writer Name',
      writerBio: 'Writer Bio',
      isFeatured: 'Featured',
      isBreaking: 'Breaking',
      isExclusive: 'Exclusive',
      isHot: 'Hot',
      allowComments: 'Allow Comments',
      showAuthor: 'Show Author',
      seoTitle: 'SEO Title',
      seoDescription: 'SEO Description',
      seoKeywords: 'SEO Keywords',
      sourceName: 'Source Name',
      sourceLink: 'Source Link',
      sourceAuthor: 'Source Author',
      save: 'Save',
      saving: 'Saving...',
      cancel: 'Cancel',
      required: 'Required',
      selectCategory: 'Select Category',
      noCategory: 'No Category',
      statusDraft: 'Draft',
      statusPending: 'Pending',
      statusPublished: 'Published',
      statusScheduled: 'Scheduled',
      statusArchived: 'Archived',
      langFa: 'Persian',
      langEn: 'English',
      langAr: 'Arabic',
      langTr: 'Turkish',
      editorPlaceholder: 'Write the full news content here...',
    },
  }

  const t = texts[language] || texts.fa

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: null }))
  }

  const validate = () => {
    const newErrors = {}
    if (!formData.title?.trim()) newErrors.title = t.required

    const strippedDescription = (formData.description || '')
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, '')
      .trim()
    if (!strippedDescription) newErrors.description = t.required

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setSubmitting(true)

    const payload = {
      ...formData,
      keywords: formData.keywords
        ? formData.keywords.split(',').map((k) => k.trim()).filter(Boolean)
        : [],
    }

    if (!payload.category) delete payload.category
    if (!payload.subtitle) delete payload.subtitle
    if (!payload.lid) delete payload.lid
    if (!payload.excerpt) delete payload.excerpt

    try {
      await onSubmit(payload, news?.slug)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div
        className={styles.modal}
        dir={dir}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.modalHeader}>
          <h2>{isEdit ? t.editTitle : t.addTitle}</h2>
          <button className={styles.modalClose} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formSection}>
            <h3 className={styles.formSectionTitle}>
              <FileText size={16} /> {t.basicInfo}
            </h3>

            <div className={styles.formGroup}>
              <label>
                <FileText size={14} /> {t.title}
                <span className={styles.required}>*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                className={errors.title ? styles.inputError : ''}
              />
              {errors.title && <span className={styles.errorText}>{errors.title}</span>}
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>{t.subtitle}</label>
                <input
                  type="text"
                  value={formData.subtitle}
                  onChange={(e) => handleChange('subtitle', e.target.value)}
                />
              </div>
              <div className={styles.formGroup}>
                <label>{t.lid}</label>
                <input
                  type="text"
                  value={formData.lid}
                  onChange={(e) => handleChange('lid', e.target.value)}
                />
              </div>
            </div>

            {/* ✅ CKEditor با key برای force remount */}
            <div className={styles.formGroup}>
              <label>
                <FileText size={14} /> {t.description}
                <span className={styles.required}>*</span>
              </label>
              <div className={errors.description ? styles.editorError : ''}>
                <CKEditorWrapper
                  key={editorKey}                            // ✅ force remount
                  value={formData.description}
                  onChange={(data) => handleChange('description', data)}
                  placeholder={t.editorPlaceholder}
                />
              </div>
              {errors.description && (
                <span className={styles.errorText}>{errors.description}</span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label>{t.excerpt}</label>
              <textarea
                rows={2}
                value={formData.excerpt}
                onChange={(e) => handleChange('excerpt', e.target.value)}
              />
            </div>

            <div className={styles.formGroup}>
              <label><Tag size={14} /> {t.keywords}</label>
              <input
                type="text"
                value={formData.keywords}
                onChange={(e) => handleChange('keywords', e.target.value)}
                placeholder={t.keywordsHint}
              />
            </div>
          </div>

          <div className={styles.formSection}>
            <h3 className={styles.formSectionTitle}>
              <Star size={16} /> {t.settings}
            </h3>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>{t.category}</label>
                <select
                  value={formData.category}
                  onChange={(e) => handleChange('category', e.target.value)}
                >
                  <option value="">{t.selectCategory}</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>{t.status}</label>
                <select
                  value={formData.status}
                  onChange={(e) => handleChange('status', e.target.value)}
                >
                  <option value="draft">{t.statusDraft}</option>
                  <option value="pending">{t.statusPending}</option>
                  <option value="published">{t.statusPublished}</option>
                  <option value="scheduled">{t.statusScheduled}</option>
                  <option value="archived">{t.statusArchived}</option>
                </select>
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label><Globe size={14} /> {t.language}</label>
                <select
                  value={formData.language}
                  onChange={(e) => handleChange('language', e.target.value)}
                >
                  <option value="fa">{t.langFa}</option>
                  <option value="en">{t.langEn}</option>
                  <option value="ar">{t.langAr}</option>
                  <option value="tr">{t.langTr}</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label><User size={14} /> {t.writerName}</label>
                <input
                  type="text"
                  value={formData.writer_name}
                  onChange={(e) => handleChange('writer_name', e.target.value)}
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label>{t.writerBio}</label>
              <textarea
                rows={2}
                value={formData.writer_bio}
                onChange={(e) => handleChange('writer_bio', e.target.value)}
              />
            </div>

            <div className={styles.permissionsGrid}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={formData.is_featured}
                  onChange={(e) => handleChange('is_featured', e.target.checked)}
                />
                <span><Star size={12} /> {t.isFeatured}</span>
              </label>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={formData.is_breaking}
                  onChange={(e) => handleChange('is_breaking', e.target.checked)}
                />
                <span><Zap size={12} /> {t.isBreaking}</span>
              </label>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={formData.is_exclusive}
                  onChange={(e) => handleChange('is_exclusive', e.target.checked)}
                />
                <span>{t.isExclusive}</span>
              </label>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={formData.is_hot}
                  onChange={(e) => handleChange('is_hot', e.target.checked)}
                />
                <span>{t.isHot}</span>
              </label>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={formData.allow_comments}
                  onChange={(e) => handleChange('allow_comments', e.target.checked)}
                />
                <span><MessageSquare size={12} /> {t.allowComments}</span>
              </label>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={formData.show_author}
                  onChange={(e) => handleChange('show_author', e.target.checked)}
                />
                <span>{t.showAuthor}</span>
              </label>
            </div>
          </div>

          <div className={styles.formSection}>
            <h3 className={styles.formSectionTitle}>
              <Globe size={16} /> {t.seo}
            </h3>
            <div className={styles.formGroup}>
              <label>{t.seoTitle}</label>
              <input
                type="text"
                value={formData.seo_title}
                onChange={(e) => handleChange('seo_title', e.target.value)}
              />
            </div>
            <div className={styles.formGroup}>
              <label>{t.seoDescription}</label>
              <textarea
                rows={2}
                value={formData.seo_description}
                onChange={(e) => handleChange('seo_description', e.target.value)}
              />
            </div>
            <div className={styles.formGroup}>
              <label>{t.seoKeywords}</label>
              <input
                type="text"
                value={formData.seo_keywords}
                onChange={(e) => handleChange('seo_keywords', e.target.value)}
              />
            </div>
          </div>

          <div className={styles.formSection}>
            <h3 className={styles.formSectionTitle}>
              <Calendar size={16} /> {t.source}
            </h3>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>{t.sourceName}</label>
                <input
                  type="text"
                  value={formData.source_name}
                  onChange={(e) => handleChange('source_name', e.target.value)}
                />
              </div>
              <div className={styles.formGroup}>
                <label>{t.sourceAuthor}</label>
                <input
                  type="text"
                  value={formData.source_author}
                  onChange={(e) => handleChange('source_author', e.target.value)}
                />
              </div>
            </div>
            <div className={styles.formGroup}>
              <label>{t.sourceLink}</label>
              <input
                type="url"
                value={formData.source_link}
                onChange={(e) => handleChange('source_link', e.target.value)}
                dir="ltr"
              />
            </div>
          </div>

          <div className={styles.formActions}>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={onClose}
              disabled={submitting}
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              className={styles.submitBtn}
              disabled={submitting}
            >
              <Save size={16} />
              {submitting ? t.saving : t.save}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default NewsForm