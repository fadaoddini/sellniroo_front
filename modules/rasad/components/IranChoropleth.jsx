'use client'

import React, { useEffect, useMemo, useState } from 'react'
import styles from './rasad.module.css'

function projectFeatureCollection(geojson, width, height, pad = 12) {
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity

  const visit = (coords, depth = 0) => {
    if (!coords?.length) return
    if (typeof coords[0] === 'number') {
      const [x, y] = coords
      minX = Math.min(minX, x)
      maxX = Math.max(maxX, x)
      minY = Math.min(minY, y)
      maxY = Math.max(maxY, y)
      return
    }
    coords.forEach((c) => visit(c, depth + 1))
  }

  geojson.features.forEach((f) => visit(f.geometry?.coordinates))

  const bw = maxX - minX || 1
  const bh = maxY - minY || 1
  const scale = Math.min((width - pad * 2) / bw, (height - pad * 2) / bh)

  const sx = (lon) => pad + (lon - minX) * scale
  // lat grows north; SVG y grows down → flip
  const sy = (lat) => height - pad - (lat - minY) * scale

  const ringToPath = (ring) => {
    if (!ring?.length) return ''
    return (
      ring
        .map((p, i) => `${i === 0 ? 'M' : 'L'}${sx(p[0]).toFixed(2)} ${sy(p[1]).toFixed(2)}`)
        .join(' ') + ' Z'
    )
  }

  const geomToPath = (geom) => {
    if (!geom) return ''
    if (geom.type === 'Polygon') {
      return geom.coordinates.map(ringToPath).join(' ')
    }
    if (geom.type === 'MultiPolygon') {
      return geom.coordinates
        .map((poly) => poly.map(ringToPath).join(' '))
        .join(' ')
    }
    return ''
  }

  return geojson.features.map((f) => ({
    id: f.properties?.id,
    nameFa: f.properties?.nameFa,
    nameEn: f.properties?.nameEn,
    d: geomToPath(f.geometry),
  }))
}

function scoreColor(score) {
  const s = Math.max(0, Math.min(100, Number(score) || 0)) / 100
  // کم: خاکستری-آبی روشن → زیاد: زرشکی برند
  const r = Math.round(241 + (128 - 241) * s)
  const g = Math.round(245 + (0 - 245) * s)
  const b = Math.round(249 + (32 - 249) * s)
  return `rgb(${r}, ${g}, ${b})`
}

export default function IranChoropleth({
  provinces = [],
  selectedId,
  onSelect,
  width = 640,
  height = 520,
}) {
  const [paths, setPaths] = useState([])
  const [loadingMap, setLoadingMap] = useState(true)
  const [mapError, setMapError] = useState(null)

  const scoreById = useMemo(() => {
    const m = {}
    provinces.forEach((p) => {
      m[p.id] = p
    })
    return m
  }, [provinces])

  useEffect(() => {
    let alive = true
    setLoadingMap(true)
    fetch('/rasad/iran-provinces.geojson')
      .then((r) => {
        if (!r.ok) throw new Error('بارگذاری نقشه ناموفق بود')
        return r.json()
      })
      .then((geo) => {
        if (!alive) return
        setPaths(projectFeatureCollection(geo, width, height))
        setMapError(null)
      })
      .catch((e) => {
        if (!alive) return
        setMapError(e.message || 'خطا در نقشه')
      })
      .finally(() => {
        if (alive) setLoadingMap(false)
      })
    return () => {
      alive = false
    }
  }, [width, height])

  if (loadingMap) {
    return <div className={styles.mapLoading}>در حال آماده‌سازی نقشه...</div>
  }

  if (mapError) {
    return <div className={styles.mapError}>{mapError}</div>
  }

  return (
    <div className={styles.mapWrap}>
      <svg
        className={styles.mapSvg}
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label="نقشه استان‌های ایران"
      >
        {paths.map((p) => {
          const row = scoreById[p.id]
          const score = row?.score ?? 0
          const active = selectedId === p.id
          return (
            <path
              key={p.id}
              d={p.d}
              className={`${styles.province} ${active ? styles.provinceActive : ''}`}
              fill={scoreColor(score)}
              onClick={() => onSelect?.(row || { id: p.id, nameFa: p.nameFa, score: 0 })}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  onSelect?.(row || { id: p.id, nameFa: p.nameFa, score: 0 })
                }
              }}
              tabIndex={0}
              role="button"
              aria-label={`${p.nameFa} ${score}`}
            >
              <title>
                {p.nameFa}: {score}
              </title>
            </path>
          )
        })}
      </svg>
      <div className={styles.legend}>
        <span>کم</span>
        <div className={styles.legendBar} />
        <span>زیاد</span>
      </div>
    </div>
  )
}
