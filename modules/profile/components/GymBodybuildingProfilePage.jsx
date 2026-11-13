'use client'

import { useCallback, useEffect, useMemo, useState, Suspense, lazy } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import axios from 'axios'
import { Loader2, UserRound } from 'lucide-react'
import Config from '@/config/config'
import { useAuth } from '@/contexts/AuthContext'
import {
  buildGymProfileTabs,
  defaultGymProfileTab,
  gymRoleLabel,
  resolveGymRole,
  resolveGymProfileBasePath,
  GYM_PROFILE_PATH,
  GYM_MANAGE_SECTIONS,
} from '@/components/Gym/gymRoleNav'
import ProfileHeader from './ProfileHeader'
import ProfileTabs from './ProfileTabs'
import GymPreviewPicker from './GymPreviewPicker'
import styles from '../styles/ProfilePage.module.css'
import hubStyles from '../styles/GymBodybuildingProfileHub.module.css'
import '@/modules/gym/styles/bodybuilding-theme.css'

const ShopProfilePanel = lazy(() => import('./ShopProfilePanel'))
const BodybuildingDashboard = lazy(
  () => import('@/modules/gym/components/BodybuildingDashboard'),
)
const GymMemberPanel = lazy(() => import('./GymMemberPanel'))
const GymTrainerPanel = lazy(() => import('./GymTrainerPanel'))

function PanelFallback() {
  return (
    <div className={styles.loadingContainer} role="status">
      <Loader2 className={styles.spinner} size={24} />
    </div>
  )
}

function AccountPanel({ user }) {
  return (
    <section className={hubStyles.accountBlock}>
      <h3>
        <UserRound size={16} aria-hidden /> حساب کاربری
      </h3>
      <ul className={hubStyles.infoList}>
        <li>
          <span>موبایل</span>
          <strong dir="ltr">{user?.mobile || '—'}</strong>
        </li>
        <li>
          <span>ایمیل</span>
          <strong dir="ltr">{user?.email || '—'}</strong>
        </li>
        <li>
          <span>نام</span>
          <strong>
            {[user?.first_name, user?.last_name].filter(Boolean).join(' ') ||
              '—'}
          </strong>
        </li>
      </ul>
    </section>
  )
}

function GymBodybuildingProfileInner() {
  const { user, isAuthenticated, loading: authLoading, getAuthHeaders } =
    useAuth() || {}
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const basePath = resolveGymProfileBasePath(pathname || GYM_PROFILE_PATH)

  const [me, setMe] = useState(null)
  const [meLoading, setMeLoading] = useState(true)
  const [previewTrainerId, setPreviewTrainerId] = useState('')
  const [previewMemberId, setPreviewMemberId] = useState('')

  const tabs = useMemo(() => buildGymProfileTabs(me, user), [me, user])
  const tabKeys = useMemo(() => new Set(tabs.map((t) => t.key)), [tabs])
  const fallbackTab = useMemo(
    () => defaultGymProfileTab(me, user),
    [me, user],
  )

  const sectionKeys = useMemo(
    () => new Set(GYM_MANAGE_SECTIONS.map((s) => s.key)),
    [],
  )

  const initialTab = useMemo(() => {
    const q = searchParams.get('tab')
    if (q && tabKeys.has(q)) return q
    if (q && sectionKeys.has(q)) return 'manage'
    return fallbackTab
  }, [searchParams, tabKeys, fallbackTab, sectionKeys])

  const initialSection = useMemo(() => {
    const s = searchParams.get('section')
    if (s && sectionKeys.has(s)) return s
    const q = searchParams.get('tab')
    if (q && sectionKeys.has(q)) return q
    return 'overview'
  }, [searchParams, sectionKeys])

  const [activeTab, setActiveTab] = useState(initialTab)

  const loadMe = useCallback(async () => {
    if (!isAuthenticated) return
    setMeLoading(true)
    try {
      const headers =
        typeof getAuthHeaders === 'function' ? getAuthHeaders() : {}
      const res = await axios.get(Config.endpoints.bodybuilding.me(), {
        headers,
      })
      setMe(res.data)
    } catch {
      // fallback از فلگ‌های auth
      const canManage =
        !!user?.is_superuser || !!user?.is_staff || !!user?.is_staff_user
      setMe({
        role: canManage ? 'admin' : 'user',
        can_view_manage_panel: canManage,
        can_view_trainer_panel: canManage,
        can_view_member_panel: canManage,
        memberships: [],
        trainers: [],
        site_business_slug: 'site-bodybuilding',
      })
    } finally {
      setMeLoading(false)
    }
  }, [isAuthenticated, getAuthHeaders, user])

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      const qs = searchParams.toString()
      const next = qs ? `${basePath}?${qs}` : basePath
      router.replace(`/login?next=${encodeURIComponent(next)}`)
    }
  }, [authLoading, isAuthenticated, router, searchParams, basePath])

  useEffect(() => {
    if (isAuthenticated) loadMe()
  }, [isAuthenticated, loadMe])

  useEffect(() => {
    setActiveTab(initialTab)
  }, [initialTab])

  useEffect(() => {
    if (!meLoading && tabs.length && !tabKeys.has(activeTab)) {
      setActiveTab(fallbackTab)
    }
  }, [meLoading, tabs, tabKeys, activeTab, fallbackTab])

  useEffect(() => {
    if (!me?.preview_trainers?.length || previewTrainerId) return
    const first = me.preview_trainers[0]
    if (first?.id != null) setPreviewTrainerId(String(first.id))
  }, [me, previewTrainerId])

  useEffect(() => {
    if (!me?.preview_members?.length || previewMemberId) return
    const first = me.preview_members[0]
    if (first?.id != null) setPreviewMemberId(String(first.id))
  }, [me, previewMemberId])

  const handleTabChange = useCallback(
    (key) => {
      if (!tabKeys.has(key)) return
      setActiveTab(key)
      const params = new URLSearchParams(searchParams.toString())
      params.set('tab', key)
      if (key !== 'manage') params.delete('section')
      else if (!params.get('section')) params.set('section', 'overview')
      router.replace(`${basePath}?${params.toString()}`, { scroll: false })
    },
    [router, searchParams, tabKeys, basePath],
  )

  const handleSectionChange = useCallback(
    (section) => {
      const params = new URLSearchParams(searchParams.toString())
      params.set('tab', 'manage')
      params.set('section', section)
      router.replace(`${basePath}?${params.toString()}`, { scroll: false })
    },
    [router, searchParams, basePath],
  )

  if (authLoading || !isAuthenticated || meLoading) {
    return (
      <div className={styles.loadingContainer} role="status">
        <Loader2 className={styles.spinner} size={28} />
      </div>
    )
  }

  const role = resolveGymRole(me, user)
  const roleChip = (
    <span className={hubStyles.roleChip}>{gymRoleLabel(me, user)}</span>
  )
  const previewTrainers = me?.preview_trainers || []
  const previewMembers = me?.preview_members || []
  const canPreview =
    !!(me?.is_admin || me?.is_superuser || me?.can_view_manage_panel)
  const canPreviewTrainer = canPreview && previewTrainers.length > 0
  const canPreviewMember = canPreview && previewMembers.length > 0

  return (
    <div className={`gymBbTheme ${styles.profilePage} ${hubStyles.page}`}>
      <div className={`${styles.container} ${styles.containerBasic}`}>
        <ProfileHeader
          user={user}
          variant="gym_bodybuilding"
          showShortcuts={false}
          welcome="پروفایل باشگاه بدنسازی"
          roleChip={roleChip}
          actionsExtra={
            canPreviewTrainer && activeTab === 'trainer' ? (
              <GymPreviewPicker
                items={previewTrainers}
                value={previewTrainerId}
                onChange={setPreviewTrainerId}
                label="پیش‌نمایش مربی"
                title="پیش‌نمایش مربی"
                countNoun="مربی"
                triggerPlaceholder="انتخاب مربی"
                searchPlaceholder="جستجو با نام، تخصص یا موبایل…"
                emptyLabel="مربی‌ای یافت نشد"
                fallbackName={(t) => `مربی ${t.id}`}
                getSecondary={(t) =>
                  t.specialty || t.business_name || 'بدون تخصص ثبت‌شده'
                }
                getSearchText={(t) =>
                  `${t.display_name || t.full_name || ''} ${t.specialty || ''} ${t.phone || ''}`
                }
                initialFallback="م"
              />
            ) : canPreviewMember && activeTab === 'membership' ? (
              <GymPreviewPicker
                items={previewMembers}
                value={previewMemberId}
                onChange={setPreviewMemberId}
                label="پیش‌نمایش ورزشکار"
                title="پیش‌نمایش ورزشکار"
                countNoun="ورزشکار"
                triggerPlaceholder="انتخاب ورزشکار"
                searchPlaceholder="جستجو با نام، بسته یا موبایل…"
                emptyLabel="ورزشکاری یافت نشد"
                fallbackName={(m) => `ورزشکار ${m.id}`}
                getSecondary={(m) =>
                  m.package_title || m.trainer_name || m.membership_display || 'بدون بسته'
                }
                getSearchText={(m) =>
                  `${m.display_name || m.full_name || ''} ${m.package_title || ''} ${m.phone || ''}`
                }
                initialFallback="و"
              />
            ) : null
          }
          footer={
            <div className={hubStyles.headerTabs}>
              <ProfileTabs
                tabs={tabs}
                activeTab={activeTab}
                onChange={handleTabChange}
                tone="gym"
              />
            </div>
          }
        />

        <div className={styles.tabContent} role="tabpanel">
          {activeTab === 'manage' ? (
            me?.can_view_manage_panel ? (
              <div className={hubStyles.manageEmbed}>
                <Suspense fallback={<PanelFallback />}>
                  <BodybuildingDashboard
                    embedded
                    businessSlug={me?.site_business_slug || 'site-bodybuilding'}
                    initialSection={initialSection}
                    onSectionChange={handleSectionChange}
                  />
                </Suspense>
              </div>
            ) : (
              <p className={hubStyles.emptyNote}>
                مدیریت باشگاه فقط برای مدیر سایت فعال است.
              </p>
            )
          ) : null}

          {activeTab === 'trainer' ? (
            <Suspense fallback={<PanelFallback />}>
              <GymTrainerPanel
                me={me}
                previewTrainerId={previewTrainerId}
              />
            </Suspense>
          ) : null}

          {activeTab === 'membership' ? (
            <Suspense fallback={<PanelFallback />}>
              <GymMemberPanel
                memberships={previewMemberId ? null : me?.memberships || null}
                previewMemberId={previewMemberId}
              />
            </Suspense>
          ) : null}

          {activeTab === 'orders' ? (
            <Suspense fallback={<PanelFallback />}>
              <ShopProfilePanel showOwnerLinks={false} />
            </Suspense>
          ) : null}

          {activeTab === 'account' ? <AccountPanel user={user} /> : null}

          {!['manage', 'trainer', 'membership', 'orders', 'account'].includes(
            activeTab,
          ) ? (
            <p className={hubStyles.emptyNote}>
              نقش فعلی: {gymRoleLabel(me)} ({role})
            </p>
          ) : null}
        </div>
      </div>
    </div>
  )
}

export default function GymBodybuildingProfilePage() {
  return (
    <Suspense
      fallback={
        <div className={styles.loadingContainer}>
          <Loader2 className={styles.spinner} size={28} />
        </div>
      }
    >
      <GymBodybuildingProfileInner />
    </Suspense>
  )
}
