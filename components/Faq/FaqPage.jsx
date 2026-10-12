'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import faqService from '@/components/Faq/services/faqService'
import styles from './Faq.module.css'

export default function FaqPage() {
  const { language, dir } = useLanguage()
  const isEn = language === 'en'
  const [settings, setSettings] = useState({})
  const [categories, setCategories] = useState([])
  const [items, setItems] = useState([])
  const [activeCat, setActiveCat] = useState('all')
  const [openId, setOpenId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setError(null)
      const res = await faqService.getBundle()
      if (cancelled) return
      if (!res.success) {
        setError(res.error || 'خطا')
        setLoading(false)
        return
      }
      setSettings(res.data.settings || {})
      setCategories(res.data.categories || [])
      setItems(res.data.items || [])
      setLoading(false)
    })()
    return () => { cancelled = true }
  }, [])

  const filtered = useMemo(() => {
    if (activeCat === 'all') return items
    if (activeCat === 'none') return items.filter((i) => !i.category)
    return items.filter((i) => i.category_key === activeCat || String(i.category) === String(activeCat))
  }, [items, activeCat])

  const title = isEn
    ? (settings.title_en || settings.title_fa || 'FAQ')
    : (settings.title_fa || 'سوالات متداول')
  const subtitle = isEn
    ? (settings.subtitle_en || settings.subtitle_fa || '')
    : (settings.subtitle_fa || '')

  const toggle = (id) => {
    setOpenId((prev) => (prev === id ? null : id))
  }

  return (
    <div className={styles.page} dir={dir}>
      <div className={styles.atmosphere} aria-hidden />
      <div className={styles.inner}>
        <header className={styles.hero}>
          <p className={styles.brand}>سلنیرو</p>
          <h1 className={styles.title}>{title}</h1>
          {subtitle ? <p className={styles.subtitle}>{subtitle}</p> : null}
        </header>

        {categories.length > 0 ? (
          <div className={styles.filters} role="tablist" aria-label="دسته‌ها">
            <button
              type="button"
              role="tab"
              aria-selected={activeCat === 'all'}
              className={`${styles.chip} ${activeCat === 'all' ? styles.chipOn : ''}`}
              onClick={() => setActiveCat('all')}
            >
              {isEn ? 'All' : 'همه'}
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                role="tab"
                aria-selected={activeCat === cat.key}
                className={`${styles.chip} ${activeCat === cat.key ? styles.chipOn : ''}`}
                onClick={() => setActiveCat(cat.key)}
              >
                {isEn ? (cat.name_en || cat.name_fa) : cat.name_fa}
              </button>
            ))}
          </div>
        ) : null}

        {loading ? (
          <div className={styles.state}>{isEn ? 'Loading…' : 'در حال بارگذاری…'}</div>
        ) : error ? (
          <div className={styles.state}>{error}</div>
        ) : filtered.length === 0 ? (
          <div className={styles.state}>
            {isEn ? 'No questions yet.' : 'هنوز سوالی ثبت نشده است.'}
          </div>
        ) : (
          <ul className={styles.list}>
            {filtered.map((item, index) => {
              const open = openId === item.id
              const q = isEn
                ? (item.question_en || item.question_fa)
                : item.question_fa
              const a = isEn
                ? (item.answer_en || item.answer_fa)
                : item.answer_fa
              return (
                <li
                  key={item.id}
                  className={`${styles.item} ${open ? styles.itemOpen : ''}`}
                  style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}
                >
                  <button
                    type="button"
                    className={styles.question}
                    aria-expanded={open}
                    onClick={() => toggle(item.id)}
                  >
                    <span>{q}</span>
                    <ChevronDown size={18} className={styles.chevron} aria-hidden />
                  </button>
                  <div
                    className={styles.answerWrap}
                    style={{ gridTemplateRows: open ? '1fr' : '0fr' }}
                  >
                    <div className={styles.answerInner}>
                      <p className={styles.answer}>{a}</p>
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
