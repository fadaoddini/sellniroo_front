'use client'

import { useEffect, useId, useRef, useState } from 'react'
import styles from './NeshanMapPicker.module.css'

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

function zoneToOlCoords(zone) {
  if (!zone) return null
  let rings = null
  if (zone?.type === 'Polygon' && Array.isArray(zone.coordinates)) {
    rings = zone.coordinates
  } else if (zone?.type === 'Feature' && zone.geometry?.coordinates) {
    rings = zone.geometry.coordinates
  } else if (Array.isArray(zone?.coordinates)) {
    rings = zone.coordinates
  } else if (Array.isArray(zone)) {
    rings =
      Array.isArray(zone[0]?.[0]) && typeof zone[0][0][0] === 'number'
        ? zone
        : [zone]
  }
  if (!rings?.[0]?.length) return null
  return rings.map((ring) =>
    ring.map((p) => fromLonLat([Number(p[0]), Number(p[1])])),
  )
}

function olPolygonToZone(geometry) {
  const coords = geometry.getCoordinates()
  const rings = coords.map((ring) =>
    ring.map((c) => {
      const [lng, lat] = toLonLat(c)
      return [
        Number(Number(lng).toFixed(6)),
        Number(Number(lat).toFixed(6)),
      ]
    }),
  )
  return { type: 'Polygon', coordinates: rings }
}

/**
 * نقشه نشان برای رسم محدوده ارسال (چندضلعی).
 * دابل‌کلیک / بستن شکل = پایان رسم.
 */
export default function NeshanDeliveryZoneMap({
  initialLat,
  initialLng,
  zone,
  onZoneChange,
  height = 320,
  drawEnabled = true,
}) {
  const reactId = useId().replace(/:/g, '')
  const targetId = `neshan-zone-${reactId}`
  const mapRef = useRef(null)
  const sourceRef = useRef(null)
  const drawRef = useRef(null)
  const onZoneRef = useRef(onZoneChange)
  const [ready, setReady] = useState(false)
  const [error, setError] = useState('')
  const [drawing, setDrawing] = useState(false)

  const mapKey =
    process.env.NEXT_PUBLIC_NESHAN_WEB_KEY ||
    'web.db72e108cedb43cab16798816a47b71a'
  const defaultLat = Number(initialLat) || 35.6892
  const defaultLng = Number(initialLng) || 51.389

  useEffect(() => {
    onZoneRef.current = onZoneChange
  }, [onZoneChange])

  useEffect(() => {
    let cancelled = false
    let map

    ;(async () => {
      try {
        await import('@neshan-maps-platform/ol/ol.css')
        const [
          { default: Map },
          { default: View },
          { default: VectorLayer },
          { default: VectorSource },
          { default: Feature },
          { default: Polygon },
          { default: Draw },
          { default: Style },
          { default: Fill },
          { default: Stroke },
        ] = await Promise.all([
          import('@neshan-maps-platform/ol/Map.js'),
          import('@neshan-maps-platform/ol/View.js'),
          import('@neshan-maps-platform/ol/layer/Vector.js'),
          import('@neshan-maps-platform/ol/source/Vector.js'),
          import('@neshan-maps-platform/ol/Feature.js'),
          import('@neshan-maps-platform/ol/geom/Polygon.js'),
          import('@neshan-maps-platform/ol/interaction/Draw.js'),
          import('@neshan-maps-platform/ol/style/Style.js'),
          import('@neshan-maps-platform/ol/style/Fill.js'),
          import('@neshan-maps-platform/ol/style/Stroke.js'),
        ])
        if (cancelled) return

        const el = document.getElementById(targetId)
        if (!el) return

        const source = new VectorSource()
        sourceRef.current = source
        const layer = new VectorLayer({
          source,
          style: new Style({
            fill: new Fill({ color: 'rgba(200, 180, 138, 0.32)' }),
            stroke: new Stroke({ color: '#1E3B2F', width: 2.5 }),
          }),
        })

        map = new Map({
          mapType: 'neshan',
          target: targetId,
          key: mapKey,
          poi: true,
          traffic: false,
          view: new View({
            center: fromLonLat([defaultLng, defaultLat]),
            zoom: 12,
          }),
        })
        map.addLayer(layer)
        mapRef.current = map

        const olCoords = zoneToOlCoords(zone)
        if (olCoords) {
          const feature = new Feature({ geometry: new Polygon(olCoords) })
          source.addFeature(feature)
          const extent = feature.getGeometry().getExtent()
          map.getView().fit(extent, { padding: [40, 40, 40, 40], maxZoom: 14 })
        }

        if (drawEnabled) {
          const draw = new Draw({ source, type: 'Polygon' })
          drawRef.current = draw
          draw.on('drawstart', () => {
            source.clear()
            setDrawing(true)
          })
          draw.on('drawend', (evt) => {
            setDrawing(false)
            const geom = evt.feature.getGeometry()
            onZoneRef.current?.(olPolygonToZone(geom))
          })
          map.addInteraction(draw)
        }

        if (!cancelled) setReady(true)
      } catch (e) {
        console.error(e)
        if (!cancelled) setError('بارگذاری نقشه محدوده ناموفق بود')
      }
    })()

    return () => {
      cancelled = true
      if (map) {
        map.setTarget(undefined)
        mapRef.current = null
      }
      sourceRef.current = null
      drawRef.current = null
    }
    // فقط بارگذاری اولیه — همگام‌سازی zone جداگانه
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetId, mapKey, defaultLat, defaultLng, drawEnabled])

  const clearZone = () => {
    sourceRef.current?.clear()
    onZoneRef.current?.(null)
  }

  return (
    <div className={styles.wrap} style={{ height }}>
      <div id={targetId} className={styles.mapEl} style={{ height }} />
      {!ready && !error ? (
        <div className={styles.loading}>در حال بارگذاری نقشه…</div>
      ) : null}
      {error ? <div className={styles.loading}>{error}</div> : null}
      <div className={styles.hint}>
        {drawing
          ? 'نقاط را بزنید؛ دابل‌کلیک برای بستن شکل'
          : 'روی نقشه کلیک کنید و محدوده ارسال را رسم کنید'}
      </div>
      {drawEnabled ? (
        <button type="button" className={styles.locBtn} onClick={clearZone}>
          پاک کردن محدوده
        </button>
      ) : null}
    </div>
  )
}
