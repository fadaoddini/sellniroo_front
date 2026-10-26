'use client'

import { useEffect, useId, useRef, useState } from 'react'
import styles from './NeshanMapPicker.module.css'

/** EPSG:4326 ↔ Web Mercator — بدون import از ol/proj (تداخل resolve در Next) */
const R = 6378137
function fromLonLat([lon, lat]) {
  const x = ((Number(lon) * Math.PI) / 180) * R
  const y =
    Math.log(Math.tan(Math.PI / 4 + (Number(lat) * Math.PI) / 360)) * R
  return [x, y]
}
function toLonLat([x, y]) {
  const lon = ((Number(x) / R) * 180) / Math.PI
  const lat =
    ((2 * Math.atan(Math.exp(Number(y) / R)) - Math.PI / 2) * 180) / Math.PI
  return [lon, lat]
}

/**
 * نقشه نشان با SDK خام OpenLayers (سازگار با React 18)
 * رپر react-openlayers فقط React 19 را پشتیبانی می‌کند.
 */
export default function NeshanMapPicker({
  onLocationSelect,
  onAddressDetected,
  initialLat,
  initialLng,
  height = 320,
}) {
  const reactId = useId().replace(/:/g, '')
  const targetId = `neshan-map-${reactId}`
  const mapRef = useRef(null)
  const [ready, setReady] = useState(false)
  const [error, setError] = useState('')

  const mapKey =
    process.env.NEXT_PUBLIC_NESHAN_WEB_KEY ||
    'web.db72e108cedb43cab16798816a47b71a'
  const defaultLat = Number(initialLat) || 35.6892
  const defaultLng = Number(initialLng) || 51.389

  const onSelectRef = useRef(onLocationSelect)
  const onAddrRef = useRef(onAddressDetected)
  useEffect(() => {
    onSelectRef.current = onLocationSelect
    onAddrRef.current = onAddressDetected
  }, [onLocationSelect, onAddressDetected])

  const fetchAddress = async (lat, lng) => {
    try {
      const res = await fetch(`/api/neshan/reverse?lat=${lat}&lng=${lng}`)
      if (!res.ok) return
      const data = await res.json()
      const text =
        data.formatted_address ||
        data.address ||
        [data.neighbourhood, data.municipality_zone, data.city, data.state]
          .filter(Boolean)
          .join('، ')
      if (text && onAddrRef.current) onAddrRef.current(text)
    } catch {
      /* ignore */
    }
  }

  useEffect(() => {
    let cancelled = false
    let map

    ;(async () => {
      try {
        await import('@neshan-maps-platform/ol/ol.css')
        const [{ default: Map }, { default: View }] = await Promise.all([
          import('@neshan-maps-platform/ol/Map.js'),
          import('@neshan-maps-platform/ol/View.js'),
        ])
        if (cancelled) return

        const el = document.getElementById(targetId)
        if (!el) return

        map = new Map({
          mapType: 'neshan',
          target: targetId,
          key: mapKey,
          poi: true,
          traffic: false,
          view: new View({
            center: fromLonLat([defaultLng, defaultLat]),
            zoom: 16,
          }),
        })
        mapRef.current = map

        const emitCenter = () => {
          const center = map.getView().getCenter()
          if (!center) return
          const [lng, lat] = toLonLat(center)
          onSelectRef.current?.(lat, lng)
          fetchAddress(lat, lng)
        }

        emitCenter()
        map.on('moveend', emitCenter)
        if (!cancelled) setReady(true)
      } catch (e) {
        console.error(e)
        if (!cancelled) {
          setError('بارگذاری نقشه نشان ناموفق بود')
        }
      }
    })()

    return () => {
      cancelled = true
      if (map) {
        map.setTarget(undefined)
        mapRef.current = null
      }
    }
    // فقط یک‌بار روی mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetId, mapKey])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !ready) return
    map.getView().setCenter(fromLonLat([defaultLng, defaultLat]))
  }, [defaultLat, defaultLng, ready])

  const goCurrent = () => {
    if (!navigator.geolocation || !mapRef.current) return
    navigator.geolocation.getCurrentPosition((pos) => {
      const lat = pos.coords.latitude
      const lng = pos.coords.longitude
      mapRef.current.getView().setCenter(fromLonLat([lng, lat]))
      mapRef.current.getView().setZoom(16)
    })
  }

  return (
    <div className={styles.wrap} style={{ height }}>
      <div id={targetId} className={styles.mapEl} />
      {!ready && !error ? (
        <div className={styles.loading}>در حال بارگذاری نقشه نشان…</div>
      ) : null}
      {error ? <div className={styles.loading}>{error}</div> : null}
      <div className={styles.pin} aria-hidden />
      <button type="button" className={styles.locBtn} onClick={goCurrent}>
        موقعیت من
      </button>
      <div className={styles.hint}>
        نقشه را حرکت دهید؛ موقعیت از مرکز پین ثبت می‌شود.
      </div>
    </div>
  )
}
