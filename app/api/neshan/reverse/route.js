import { NextResponse } from 'next/server'

const DEFAULT_NESHAN_SERVICE_KEY = 'service.7498a758f53a449fb4e23f807232f669'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const lat = searchParams.get('lat')
    const lng = searchParams.get('lng')
    if (!lat || !lng) {
      return NextResponse.json(
        { error: 'lat and lng are required' },
        { status: 400 },
      )
    }
    const apiKey =
      process.env.NESHAN_SERVICE_KEY || DEFAULT_NESHAN_SERVICE_KEY
    const upstream = await fetch(
      `https://api.neshan.org/v5/reverse?lat=${lat}&lng=${lng}`,
      {
        headers: { 'Api-Key': apiKey },
        cache: 'no-store',
      },
    )
    if (!upstream.ok) {
      const text = await upstream.text()
      return NextResponse.json(
        { error: 'Failed to fetch reverse geocode', detail: text },
        { status: upstream.status },
      )
    }
    const data = await upstream.json()
    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Reverse geocode proxy failed', detail: String(error) },
      { status: 500 },
    )
  }
}
