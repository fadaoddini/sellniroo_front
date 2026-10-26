// LayoutSection — پوشش ویجت برای عرض/فاصله اختصاصی بخش
'use client'

import React from 'react'

/**
 * @param {{ widgetId: string, className?: string, children: React.ReactNode }} props
 */
export default function LayoutSection({ widgetId, className = '', children }) {
  return (
    <div
      data-layout-widget={widgetId}
      data-section-width="inherit"
      data-section-pad="md"
      className={`layoutSection ${className}`.trim()}
    >
      {children}
    </div>
  )
}
