'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  getEnabledPackages,
  getStandalonePricingItems,
  groupPricingItems,
  normalizeReboPricing,
} from '@/config/reboPricing'
import { fetchSiteSettings } from '@/services/siteSettings'

export default function useReboPricingState() {
  const [pricing, setPricing] = useState(() => normalizeReboPricing({}))

  useEffect(() => {
    let alive = true
    fetchSiteSettings()
      .then((data) => {
        if (!alive) return
        setPricing(normalizeReboPricing(data?.rebo_pricing))
      })
      .catch(() => {
        if (alive) setPricing(normalizeReboPricing({}))
      })
    const onChange = (e) => {
      setPricing(normalizeReboPricing(e?.detail || {}))
    }
    window.addEventListener('rebo-pricing-changed', onChange)
    return () => {
      alive = false
      window.removeEventListener('rebo-pricing-changed', onChange)
    }
  }, [])

  const packages = useMemo(() => getEnabledPackages(pricing), [pricing])
  const standalone = useMemo(
    () => getStandalonePricingItems(pricing),
    [pricing],
  )
  const groups = useMemo(() => groupPricingItems(standalone), [standalone])
  const currency = pricing.currency_label || 'ریال'
  const hasPricing = packages.length > 0 || groups.length > 0

  return { pricing, packages, standalone, groups, currency, hasPricing }
}
