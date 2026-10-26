// components/widgets/PostJobButtonWidget.jsx — دکمه ثبت آگهی
'use client'

import React, { useEffect, useState, memo } from 'react'
import Link from 'next/link'
import { PlusCircle } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import { resolveLucideIcon } from '@/utils/lucideIcons'
import {
  DEFAULT_POST_JOB_SETTINGS,
  getPostJobVisibilityFlags,
  normalizePostJobButtonSettings,
  postJobButtonCssVars,
} from '@/config/postJobButtonWidgetSettings'
import styles from './PostJobButtonWidget.module.css'

function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint - 1}px)`)
    const apply = () => setIsMobile(mq.matches)
    apply()
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [breakpoint])
  return isMobile
}

const PostJobButtonWidget = memo(function PostJobButtonWidget({
  settings: rawSettings,
}) {
  const raw = rawSettings || DEFAULT_POST_JOB_SETTINGS
  const isMobile = useIsMobile(768)
  const viewport = isMobile ? 'mobile' : 'desktop'
  const settings = normalizePostJobButtonSettings(raw, { viewport })
  const visibility = getPostJobVisibilityFlags(raw)
  const cssVars = postJobButtonCssVars(raw, { viewport })
  const { language } = useLanguage()

  if (!settings.visible) return null

  const label =
    language === 'en' && settings.label_en
      ? settings.label_en
      : settings.label

  const Icon = resolveLucideIcon(settings.icon, PlusCircle)
  const fixed = settings.position !== 'inline'
  const posClass =
    settings.position === 'fixed_br'
      ? styles.posBr
      : settings.position === 'fixed_bl'
        ? styles.posBl
        : settings.position === 'fixed_bc'
          ? styles.posBc
          : ''

  const wrapClass = [
    styles.wrap,
    settings.full_width ? styles.wrapFull : '',
    fixed ? styles.wrapFixed : '',
    posClass,
    visibility.show_on_mobile === false ? styles.hideOnMobile : '',
    visibility.show_on_desktop === false ? styles.hideOnDesktop : '',
  ]
    .filter(Boolean)
    .join(' ')

  const linkProps = {
    href: settings.href || '/post-job',
    className: styles.btn,
    ...(settings.open_new_tab
      ? { target: '_blank', rel: 'noopener noreferrer' }
      : {}),
  }

  return (
    <div className={wrapClass} style={cssVars}>
      <Link {...linkProps}>
        {settings.show_icon ? <Icon size={16} aria-hidden /> : null}
        <span>{label}</span>
      </Link>
    </div>
  )
})

export default PostJobButtonWidget
