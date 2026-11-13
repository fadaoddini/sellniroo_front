'use client'

import { useEffect, useState } from 'react'
import { reboVisible } from './reboData'

export default function useReboMedia(settings = {}) {
  const [isMobile, setIsMobile] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return undefined
    const mq = window.matchMedia('(max-width: 768px)')
    const apply = () => {
      setIsMobile(!!mq.matches)
      setReady(true)
    }
    apply()
    mq.addEventListener?.('change', apply)
    return () => mq.removeEventListener?.('change', apply)
  }, [])

  return {
    isMobile,
    ready,
    visible: ready ? reboVisible(settings, isMobile) : true,
  }
}
