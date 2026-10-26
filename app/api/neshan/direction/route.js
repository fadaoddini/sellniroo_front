import { NextResponse } from 'next/server'

const DEFAULT_NESHAN_SERVICE_KEY = 'service.7498a758f53a449fb4e23f807232f669'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const originLat = searchParams.get('originLat')
    const originLng = searchParams.get('originLng')
    const destLat = searchParams.get('destLat')
    const destLng = searchParams.get('destLng')

    if (!originLat || !originLng || !destLat || !destLng) {
      return NextResponse.json(
        { error: 'origin and destination coords required' },
        { status: 400 },
      )
    }

    const apiKey =
      process.env.NESHAN_SERVICE_KEY || DEFAULT_NESHAN_SERVICE_KEY
    const url =
      `https://api.neshan.org/v4/direction?type=car` +
      `&origin=${originLat},${originLng}` +
      `&destination=${destLat},${destLng}`

    const upstream = await fetch(url, {
      headers: { 'Api-Key': apiKey },
      cache: 'no-store',
    })

    if (!upstream.ok) {
      const text = await upstream.text()
      return NextResponse.json(
        { error: 'Failed to fetch direction', detail: text },
        { status: upstream.status },
      )
    }

    const data = await upstream.json()
    let distanceMeters = 0
    const routes = data?.routes || []
    if (routes.length && routes[0]?.legs?.length) {
      distanceMeters = Number(routes[0].legs[0]?.distance?.value) || 0
    }

    return NextResponse.json({
      distance_m: distanceMeters,
      distance_km: distanceMeters / 1000,
      routes: data?.routes || [],
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Direction proxy failed', detail: String(error) },
      { status: 500 },
    )
  }
}
