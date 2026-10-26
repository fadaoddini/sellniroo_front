'use client'

import React, { useEffect, useMemo, useState } from 'react'
import newsService from '@/services/newsService'
import Config from '@/config/config'
import HeroSlider from '@/components/slider/HeroSlider'
import { fillNewsWithDemo } from './newsDemoData'
import { DEFAULT_SLIDER_WIDGET_SETTINGS } from '@/config/sliderWidgetSettings'

function getFullImageUrl(imagePath) {
  if (!imagePath) return null
  if (
    imagePath.startsWith('http://') ||
    imagePath.startsWith('https://') ||
    imagePath.startsWith('data:')
  ) {
    return imagePath
  }
  const baseUrl = Config.baseUrl || ''
  if (imagePath.startsWith('/media/')) return `${baseUrl}${imagePath}`
  if (imagePath.startsWith('media/')) return `${baseUrl}/${imagePath}`
  return `${baseUrl}/media/${String(imagePath).replace(/^\/+/, '')}`
}

function getBestImage(item) {
  if (!item) return null
  const candidates = [
    item.featured_image_display,
    item.featured_image,
    item.featured_image_url,
    item.images?.[0]?.image_display,
    item.images?.[0]?.image,
    item.images?.[0]?.image_url,
  ]
  for (const c of candidates) {
    const url = getFullImageUrl(c)
    if (url) return url
  }
  return null
}

function mapFeaturedToSlides(items) {
  return (items || []).map((item) => ({
    id: item.id || item.slug,
    title: item.title || '',
    description: String(item.lid || item.excerpt || item.subtitle || '').trim(),
    link: `/news/${item.slug || item.id}`,
    image: getBestImage(item),
  }))
}

/**
 * اسلایدر اخبار ویژه — داده از API featured، ظاهر کامل مثل HeroSlider
 */
export default function FeaturedNewsSliderWidget({ settings: rawSettings } = {}) {
  const sliderSettings = {
    ...DEFAULT_SLIDER_WIDGET_SETTINGS,
    ...(rawSettings && typeof rawSettings === 'object' ? rawSettings : {}),
  }
  const count = Math.max(1, Math.min(20, Number(sliderSettings.count) || 5))
  const offset = Math.max(0, Math.min(40, Number(sliderSettings.offset) || 0))

  const [slides, setSlides] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      const fetchLimit = Math.min(20, offset + count)
      const res = await newsService.getFeaturedNews(fetchLimit)
      if (cancelled) return
      const list = Array.isArray(res?.data) ? res.data : []
      const filled = fillNewsWithDemo(list.slice(offset, offset + count), count)
      setSlides(mapFeaturedToSlides(filled))
      setLoading(false)
    })()
    return () => {
      cancelled = true
    }
  }, [count, offset])

  const content = useMemo(() => {
    if (loading) {
      return (
        <div style={{ padding: '1.5rem', textAlign: 'center', color: '#6f675c' }}>
          در حال بارگذاری اخبار ویژه…
        </div>
      )
    }
    if (!slides.length) {
      return (
        <div style={{ padding: '1.5rem', textAlign: 'center', color: '#6f675c' }}>
          خبر ویژه‌ای برای نمایش نیست
        </div>
      )
    }
    /* HeroSlider خودش normalize + دسکتاپ/موبایل را اعمال می‌کند */
    return <HeroSlider slides={slides} settings={sliderSettings} />
  }, [loading, slides, sliderSettings])

  return content
}
