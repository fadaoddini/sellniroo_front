// components/News/MagazineNewsCard.jsx — سبک‌های کارت مجله + اشتراک/لایک/ادامه مطلب
'use client'

import React, { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCalendar,
  faHeart,
  faImage,
  faShareNodes,
  faLink,
  faCheck,
} from '@fortawesome/free-solid-svg-icons'
import Config from '@/config/config'
import { iranShareTargets as buildIranShareTargets } from '@/utils/iranShare'
import styles from './News.module.css'

function getFullImageUrl(imagePath) {
  if (!imagePath) return null
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath
  }
  const baseUrl = Config.baseUrl || 'http://localhost:8000'
  if (imagePath.startsWith('/media/')) return `${baseUrl}${imagePath}`
  if (imagePath.startsWith('media/')) return `${baseUrl}/${imagePath}`
  return `${baseUrl}/media/${imagePath.replace(/^\/+/, '')}`
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  try {
    return new Date(dateStr).toLocaleDateString('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  } catch {
    return dateStr
  }
}

function iranShareTargets(pageUrl, title, flags) {
  return buildIranShareTargets(pageUrl, title, flags).map((s) => ({
    ...s,
    className:
      s.id === 'rubika'
        ? styles.magShareRubika
        : s.id === 'eitaa'
          ? styles.magShareEitaa
          : s.id === 'bale'
            ? styles.magShareBale
            : styles.magShareSoroush,
  }))
}

function absoluteNewsUrl(slug) {
  const href = `/news/${slug}`
  if (typeof window === 'undefined') return href
  return `${window.location.origin}${href}`
}

const PLACE_CLASS = {
  bottom_right: styles.magRmBottomRight,
  bottom_left: styles.magRmBottomLeft,
  bottom_center: styles.magRmBottomCenter,
  top_right: styles.magRmTopRight,
  top_left: styles.magRmTopLeft,
  top_center: styles.magRmTopCenter,
}

export default function MagazineNewsCard({
  news,
  index = 0,
  variant = 'classic',
  options = {},
}) {
  const [shareOpen, setShareOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const shareRef = useRef(null)

  useEffect(() => {
    if (!shareOpen) return undefined
    const onDoc = (e) => {
      if (shareRef.current && !shareRef.current.contains(e.target)) {
        setShareOpen(false)
      }
    }
    document.addEventListener('pointerdown', onDoc)
    return () => document.removeEventListener('pointerdown', onDoc)
  }, [shareOpen])

  if (!news) return null

  const {
    slug,
    id,
    title,
    excerpt,
    featured_image_display,
    featured_image,
    publish_date,
    source_name,
    images = [],
    like_count,
    likes,
  } = news

  const newsSlug = slug || id || `news-${index}`
  const href = `/news/${newsSlug}`
  const imageUrl = getFullImageUrl(
    featured_image_display || featured_image || images?.[0]?.image_display
  )
  const hasImage = !!(imageUrl && imageUrl.length)
  const dateLabel = formatDate(publish_date) || 'تاریخ نامشخص'
  const likeNum = like_count ?? likes ?? 0

  const showImage = options.show_card_image !== false
  const showTitle = options.show_card_title !== false
  const showExcerpt = options.show_card_excerpt !== false
  const showDate = options.show_card_date !== false
  const showSource = options.show_card_source !== false
  const showReadMore = options.show_read_more !== false
  const showLikes = !!options.show_likes
  const showShare = !!options.show_share
  const rmPlace = options.read_more_place || 'flow'
  const rmText = options.read_more_text || 'ادامه مطلب…'
  const rmAsBtn = !!options.read_more_as_button

  const shellClass = [
    styles.magCardShell,
    styles[`magV_${variant}`] || styles.magV_classic,
    styles.cardHover,
  ]
    .filter(Boolean)
    .join(' ')

  const imageBlock =
    showImage ? (
      <div className={styles.magMedia}>
        {hasImage ? (
          <Image
            src={imageUrl}
            alt={title || 'خبر'}
            fill
            className={styles.cardImageInner}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            loading={index < 3 ? 'eager' : 'lazy'}
            onError={(e) => {
              e.target.style.display = 'none'
            }}
          />
        ) : (
          <div className={styles.cardImagePlaceholder}>
            <FontAwesomeIcon icon={faImage} className={styles.cardImageIcon} />
          </div>
        )}
        {images?.length > 0 ? (
          <div className={styles.imageCount}>
            <FontAwesomeIcon icon={faImage} size="xs" />
            <span>{images.length}</span>
          </div>
        ) : null}
      </div>
    ) : null

  const metaRow =
    showDate || showSource ? (
      <div className={styles.cardMeta}>
        {showDate ? (
          <span className={styles.cardDate}>
            <FontAwesomeIcon icon={faCalendar} />
            {dateLabel}
          </span>
        ) : null}
        {showSource && source_name ? (
          <span className={styles.cardSource}>{source_name}</span>
        ) : null}
      </div>
    ) : null

  const socials = iranShareTargets(
    absoluteNewsUrl(newsSlug),
    title,
    options
  )

  const actionsRow =
    showLikes || showShare ? (
      <div className={styles.magActions}>
        {showLikes ? (
          <span className={styles.magLike}>
            <FontAwesomeIcon icon={faHeart} />
            <span>{likeNum}</span>
          </span>
        ) : null}
        {showShare ? (
          <div className={styles.magShareWrap} ref={shareRef}>
            <button
              type="button"
              className={`${styles.magShareBtn} ${
                shareOpen ? styles.magShareBtnOn : ''
              }`}
              aria-label="اشتراک‌گذاری"
              aria-expanded={shareOpen}
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setShareOpen((v) => !v)
              }}
            >
              <FontAwesomeIcon icon={faShareNodes} />
            </button>
            {shareOpen ? (
              <div
                className={styles.magShareMenu}
                role="menu"
                onClick={(e) => e.stopPropagation()}
              >
                <p className={styles.magShareMenuLabel}>اشتراک در شبکه‌ها</p>
                <div className={styles.magShareGrid}>
                  {socials.map((s) => (
                    <a
                      key={s.id}
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${styles.magShareItem} ${s.className}`}
                      role="menuitem"
                      onClick={() => setShareOpen(false)}
                    >
                      {s.label}
                    </a>
                  ))}
                </div>
                <button
                  type="button"
                  className={styles.magShareCopy}
                  onClick={async (e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    try {
                      await navigator.clipboard.writeText(
                        absoluteNewsUrl(newsSlug)
                      )
                      setCopied(true)
                      window.setTimeout(() => setCopied(false), 1600)
                    } catch {
                      /* ignore */
                    }
                  }}
                >
                  <FontAwesomeIcon icon={copied ? faCheck : faLink} />
                  {copied ? 'لینک کپی شد' : 'کپی لینک'}
                </button>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    ) : null

  const readMoreFlow =
    showReadMore && rmPlace === 'flow' ? (
      <div className={styles.magRmFlow}>
        <span className={`${styles.magRm} ${rmAsBtn ? styles.magRmBtn : ''}`}>
          {rmText}
        </span>
      </div>
    ) : null

  const readMoreAbs =
    showReadMore && rmPlace !== 'flow' ? (
      <span
        className={`${styles.magRmAbs} ${PLACE_CLASS[rmPlace] || ''} ${
          rmAsBtn ? styles.magRmBtn : ''
        }`}
      >
        {rmText}
      </span>
    ) : null

  const titleNode = showTitle ? (
    <h3 className={styles.magTitle}>{title || 'بدون عنوان'}</h3>
  ) : null

  const excerptNode =
    showExcerpt && excerpt ? (
      <p className={styles.magExcerpt}>{excerpt}</p>
    ) : null

  /* بدنه محتوا بر اساس واریانت */
  let body
  if (variant === 'overlay' || variant === 'glass') {
    body = (
      <>
        {imageBlock}
        <div className={styles.magOverlayScrim} aria-hidden />
        <div className={styles.magOverlayBody}>
          {titleNode}
          {excerptNode}
          {metaRow}
          {actionsRow}
          {readMoreFlow}
        </div>
      </>
    )
  } else if (variant === 'cover') {
    body = (
      <>
        {imageBlock}
        <div className={styles.magCoverGradient} aria-hidden />
        <div className={styles.magCoverBody}>
          {showSource && source_name ? (
            <span className={styles.magCoverBadge}>{source_name}</span>
          ) : null}
          {titleNode}
          {showDate ? (
            <span className={styles.magCoverDate}>
              <FontAwesomeIcon icon={faCalendar} />
              {dateLabel}
            </span>
          ) : null}
          {actionsRow}
          {readMoreFlow}
        </div>
      </>
    )
  } else if (variant === 'split') {
    body = (
      <>
        {imageBlock}
        <div className={styles.magSplitBody}>
          {titleNode}
          {excerptNode}
          {metaRow}
          {actionsRow}
          {readMoreFlow}
        </div>
      </>
    )
  } else if (variant === 'editorial') {
    body = (
      <>
        <div className={styles.magEditorialBar} aria-hidden />
        {imageBlock}
        <div className={styles.magBodyPad}>
          {titleNode}
          {excerptNode}
          {metaRow}
          {actionsRow}
          {readMoreFlow}
        </div>
      </>
    )
  } else if (variant === 'framed') {
    body = (
      <>
        <div className={styles.magFramePad}>
          {imageBlock}
          <div className={styles.magBodyPad}>
            {titleNode}
            {excerptNode}
            {metaRow}
            {actionsRow}
            {readMoreFlow}
          </div>
        </div>
      </>
    )
  } else {
    /* classic */
    body = (
      <>
        {imageBlock}
        <div className={styles.magBodyPad}>
          {titleNode}
          {excerptNode}
          {metaRow}
          {actionsRow}
          {readMoreFlow}
        </div>
      </>
    )
  }

  return (
    <article className={shellClass}>
      <Link
        href={href}
        className={styles.magCardHit}
        aria-label={title || 'مشاهده خبر'}
      />
      {body}
      {readMoreAbs}
    </article>
  )
}
