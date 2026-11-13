'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { Activity, Loader2, Salad, Dumbbell } from 'lucide-react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
} from 'chart.js'
import { Line } from 'react-chartjs-2'
import Config from '@/config/config'
import { useAuth } from '@/contexts/AuthContext'
import { formatJalaliDate } from '@/modules/gym/utils/jalaliCalendar'
import hubStyles from '../styles/GymBodybuildingProfileHub.module.css'
import styles from '../styles/ProfilePage.module.css'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip)

const faNum = (n) => Number(n || 0).toLocaleString('fa-IR')

function membershipTone(m) {
  if (m?.is_expired) return hubStyles.toneDanger
  if (m?.is_expiring_soon) return hubStyles.toneWarn
  return hubStyles.toneOk
}

function MembershipDetail({ membership, getAuthHeaders, previewMemberId = '' }) {
  const slug = membership?.business_slug
  const [workouts, setWorkouts] = useState([])
  const [diets, setDiets] = useState([])
  const [tracking, setTracking] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!slug) return
    let cancelled = false
    const load = async () => {
      setLoading(true)
      try {
        const headers =
          typeof getAuthHeaders === 'function' ? getAuthHeaders() : {}
        const params = previewMemberId ? { member: previewMemberId } : {}
        const [wRes, dRes, tRes] = await Promise.allSettled([
          axios.get(Config.endpoints.bodybuilding.myMemberships.workouts(slug), {
            headers,
            params,
          }),
          axios.get(Config.endpoints.bodybuilding.myMemberships.diets(slug), {
            headers,
            params,
          }),
          axios.get(Config.endpoints.bodybuilding.myMemberships.tracking(slug), {
            headers,
            params,
          }),
        ])
        if (cancelled) return
        setWorkouts(
          wRes.status === 'fulfilled'
            ? Array.isArray(wRes.value.data)
              ? wRes.value.data
              : wRes.value.data?.results || []
            : [],
        )
        setDiets(
          dRes.status === 'fulfilled'
            ? Array.isArray(dRes.value.data)
              ? dRes.value.data
              : dRes.value.data?.results || []
            : [],
        )
        setTracking(tRes.status === 'fulfilled' ? tRes.value.data : null)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [slug, getAuthHeaders, previewMemberId])

  const days = Number(membership?.days_remaining ?? 0)
  const daysLabel =
    days < 0 ? `${faNum(Math.abs(days))} روز گذشته` : `${faNum(days)} روز مانده`

  const kpis = tracking?.kpis || {}
  const logs = tracking?.logs || []
  const chartData = useMemo(() => ({
    labels: logs.map((l) => formatJalaliDate(l.recorded_at, { withWeekday: false })),
    datasets: [
      {
        label: 'وزن',
        data: logs.map((l) => (l.weight_kg == null ? null : Number(l.weight_kg))),
        borderColor: '#046c4e',
        backgroundColor: 'rgba(4,108,78,0.12)',
        tension: 0.35,
        fill: true,
        spanGaps: true,
      },
    ],
  }), [logs])

  return (
    <article className={`${hubStyles.memberCard} ${membershipTone(membership)}`}>
      <header>
        <strong>{membership.business_name || 'باشگاه'}</strong>
        <span>{membership.membership_display || membership.membership || '—'}</span>
      </header>
      <ul className={hubStyles.metaList}>
        <li>
          <span>بسته</span>
          <strong>{membership.package_title || '—'}</strong>
        </li>
        <li>
          <span>سانس</span>
          <strong>{membership.session_name || '—'}</strong>
        </li>
        <li>
          <span>مربی</span>
          <strong>{membership.trainer_name || '—'}</strong>
        </li>
        <li>
          <span>اعتبار</span>
          <strong>{daysLabel}</strong>
        </li>
      </ul>

      {loading ? (
        <div className={hubStyles.loadingInline}>
          <Loader2 className={styles.spinner} size={18} />
        </div>
      ) : (
        <div className={hubStyles.athleteBoard}>
          <section className={`${hubStyles.athleteCol} ${hubStyles.athleteColTrain}`}>
            <h4>
              <Dumbbell size={14} /> برنامه تمرینی
            </h4>
            {workouts.length ? (
              <ul className={hubStyles.programList}>
                {workouts.slice(0, 8).map((w) => (
                  <li key={w.id}>
                    <strong>{w.title || w.name || `برنامه ${w.id}`}</strong>
                    <span>
                      {w.date
                        ? formatJalaliDate(w.date, { withWeekday: false })
                        : w.status || '—'}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className={hubStyles.emptyNote}>برنامه تمرینی تاییدشده‌ای نیست.</p>
            )}
          </section>

          <section className={`${hubStyles.athleteCol} ${hubStyles.athleteColDiet}`}>
            <h4>
              <Salad size={14} /> برنامه غذایی
            </h4>
            {diets.length ? (
              <ul className={hubStyles.programList}>
                {diets.slice(0, 8).map((d) => (
                  <li key={d.id}>
                    <strong>{d.title || d.name || `رژیم ${d.id}`}</strong>
                    <span>
                      {d.date
                        ? formatJalaliDate(d.date, { withWeekday: false })
                        : d.status || '—'}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className={hubStyles.emptyNote}>برنامه غذایی تاییدشده‌ای نیست.</p>
            )}
          </section>

          <section className={`${hubStyles.athleteCol} ${hubStyles.athleteColPerf}`}>
            <h4>
              <Activity size={14} /> عملکرد من
            </h4>
            <div className={hubStyles.perfKpis}>
              <div>
                <span>وزن</span>
                <strong>{kpis.latest_weight != null ? faNum(kpis.latest_weight) : '—'}</strong>
              </div>
              <div>
                <span>BMI</span>
                <strong>{kpis.bmi != null ? faNum(kpis.bmi) : '—'}</strong>
              </div>
              <div>
                <span>مسیر</span>
                <strong>{kpis.on_track_label || 'هنوز ثبت نشده'}</strong>
              </div>
            </div>
            {logs.some((l) => l.weight_kg != null) ? (
              <div className={hubStyles.perfChart}>
                <Line
                  data={chartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                      x: { ticks: { font: { size: 9, family: 'inherit' } } },
                      y: { ticks: { font: { size: 9, family: 'inherit' } } },
                    },
                  }}
                />
              </div>
            ) : (
              <p className={hubStyles.emptyNote}>مربی هنوز دوره عملکرد ثبت نکرده است.</p>
            )}
            {kpis.latest_verdict_label ? (
              <p className={hubStyles.perfVerdict}>{kpis.latest_verdict_label}</p>
            ) : null}
          </section>
        </div>
      )}
    </article>
  )
}

export default function GymMemberPanel({
  memberships: propMemberships = null,
  previewMemberId = '',
}) {
  const { getAuthHeaders } = useAuth() || {}
  const [memberships, setMemberships] = useState(
    previewMemberId ? [] : propMemberships || [],
  )
  const [loading, setLoading] = useState(
    !!previewMemberId || !Array.isArray(propMemberships),
  )
  const [error, setError] = useState(null)

  useEffect(() => {
    if (previewMemberId) return
    if (Array.isArray(propMemberships)) {
      setMemberships(propMemberships)
      setLoading(false)
    }
  }, [propMemberships, previewMemberId])

  const load = useCallback(async () => {
    if (!previewMemberId && Array.isArray(propMemberships)) return
    setLoading(true)
    setError(null)
    try {
      const headers =
        typeof getAuthHeaders === 'function' ? getAuthHeaders() : {}
      const res = await axios.get(Config.endpoints.bodybuilding.myMemberships.list(), {
        headers,
        params: previewMemberId ? { member: previewMemberId } : {},
      })
      setMemberships(Array.isArray(res.data) ? res.data : res.data?.results || [])
    } catch (e) {
      setError(e?.response?.data?.detail || e.message || 'خطا در دریافت عضویت')
    } finally {
      setLoading(false)
    }
  }, [propMemberships, getAuthHeaders, previewMemberId])

  useEffect(() => {
    load()
  }, [load])

  if (loading) {
    return (
      <div className={hubStyles.loadingInline} role="status">
        <Loader2 className={styles.spinner} size={22} />
      </div>
    )
  }
  if (error) return <p className={hubStyles.emptyNote}>{error}</p>
  if (!memberships?.length) {
    return (
      <p className={hubStyles.emptyNote}>
        عضویت فعالی یافت نشد. پس از ثبت عضو با شماره موبایل شما، اینجا نمایش داده
        می‌شود.
      </p>
    )
  }

  return (
    <div className={hubStyles.hub}>
      <div className={hubStyles.intro}>
        <h2>ورزشکار</h2>
        <p>برنامه تمرین، غذا و عملکرد شما در سه ستون.</p>
      </div>
      {memberships.map((m) => (
        <MembershipDetail
          key={`${m.business_slug}-${m.id}`}
          membership={m}
          getAuthHeaders={getAuthHeaders}
          previewMemberId={previewMemberId}
        />
      ))}
    </div>
  )
}
