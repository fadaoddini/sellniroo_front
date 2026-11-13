'use client'

import { useMemo } from 'react'
import {
  normalizeReboWidgetSettings,
  reboWidgetSectionStyle,
} from '@/config/reboWidgetSettings'
import useReboMedia from './useReboMedia'

export default function useReboNormalized(rawSettings, type) {
  const raw = rawSettings && typeof rawSettings === 'object' ? rawSettings : {}
  const { isMobile, visible } = useReboMedia(raw)
  const settings = useMemo(
    () =>
      normalizeReboWidgetSettings(raw, type, {
        viewport: isMobile ? 'mobile' : 'desktop',
      }),
    [raw, type, isMobile],
  )
  const style = useMemo(() => reboWidgetSectionStyle(settings), [settings])
  return { settings, style, visible, isMobile }
}
