'use client'

import React from 'react'
import ReboCloudOrder from '@/components/widgets/ReboCloudOrder'
import useReboNormalized from './useReboNormalized'
import useReboPricingState from './useReboPricingState'

export default function ReboCloudOrderSection({ settings: raw = {} }) {
  const { settings: s, style, visible } = useReboNormalized(
    raw,
    'rebo_cloud_order',
  )
  const { pricing } = useReboPricingState()
  if (!visible) return null

  return (
    <ReboCloudOrder
      pricing={pricing}
      style={style}
      heading={{
        kicker: s.show_kicker !== false ? s.kicker : '',
        title: s.title,
        subtitle: s.show_subtitle !== false ? s.subtitle : '',
      }}
    />
  )
}
