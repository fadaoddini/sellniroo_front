// HomeLayoutBridge — اعمال عرض صفحه (Container / Fluid) روی سایت زنده
'use client'

import { useEffect } from 'react'
import {
  fetchSiteSettings,
  DEFAULT_SITE_SETTINGS,
} from '@/services/siteSettings'
import { normalizeHomeLayout } from '@/config/homeLayout'

function applyLayout(layout) {
  if (typeof document === 'undefined') return
  const L = normalizeHomeLayout(layout)
  const root = document.documentElement
  root.dataset.homeWidth = L.page_width
  root.style.setProperty('--home-max-width', `${L.max_width}px`)
  root.style.setProperty('--home-gutter', `${L.gutter}px`)
}

export default function HomeLayoutBridge() {
  useEffect(() => {
    let cancelled = false
    fetchSiteSettings({ force: false })
      .then((s) => {
        if (!cancelled) applyLayout(s?.home_layout || DEFAULT_SITE_SETTINGS.home_layout)
      })
      .catch(() => {
        if (!cancelled) applyLayout(DEFAULT_SITE_SETTINGS.home_layout)
      })

    const onChange = (ev) => {
      if (ev?.detail) applyLayout(ev.detail)
      else {
        fetchSiteSettings({ force: true }).then((s) => {
          applyLayout(s?.home_layout)
        })
      }
    }
    window.addEventListener('home-layout-changed', onChange)
    return () => {
      cancelled = true
      window.removeEventListener('home-layout-changed', onChange)
    }
  }, [])

  return null
}
