// app/(admin)/adminweb/AdminWebModules.jsx — سوییچ ماژول‌ها (مینیمال + کارت زیرمجموعه)
'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Boxes, RefreshCw, Layers } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import {
  SITE_MODULES_CATALOG,
  SITE_MODULE_KEYS,
  DATA_PACK_TOPIC_KEYS,
  EXCLUSIVE_SHOP_MODE_KEYS,
  HIDDEN_MODULE_KEYS,
  getCatalogMeta,
  groupModulesTree,
} from '@/config/siteModules'
import {
  fetchSiteModules,
  toggleSiteModule,
  clearSiteModulesCache,
} from '@/services/siteModules'
import TopicPackPanel from './TopicPackPanel'
import JobBoardDataPanel from './JobBoardDataPanel'
import styles from './AdminWeb.module.css'

function mergeCatalogWithApi(list) {
  const byKey = Object.fromEntries((list || []).map((m) => [m.key, m]))
  const merged = SITE_MODULES_CATALOG.map((cat) => {
    const api = byKey[cat.key]
    return {
      key: cat.key,
      name: api?.name || cat.name,
      name_en: api?.name_en || cat.name_en,
      description: api?.description || cat.description,
      category: api?.category || cat.category,
      parent_key: api?.parent_key ?? cat.parentKey ?? null,
      is_group: api?.is_group ?? !!cat.isGroup,
      componentPath: cat.componentPath || '',
      dashboardOnly: !!cat.dashboardOnly,
      topicPackKey: cat.topicPackKey || DATA_PACK_TOPIC_KEYS[cat.key] || null,
      is_active: api ? !!api.is_active : cat.defaultActive !== false,
      effective_active: api
        ? !!(api.effective_active ?? api.is_active)
        : cat.defaultActive !== false,
    }
  })

  ;(list || []).forEach((m) => {
    if (HIDDEN_MODULE_KEYS.has(m.key)) return
    if (!merged.some((x) => x.key === m.key)) {
      const cat = getCatalogMeta(m.key)
      merged.push({
        key: m.key,
        name: m.name,
        name_en: m.name_en,
        description: m.description,
        category: m.category,
        parent_key: m.parent_key || null,
        is_group: !!m.is_group,
        componentPath: cat?.componentPath || '',
        dashboardOnly: !!cat?.dashboardOnly,
        topicPackKey: cat?.topicPackKey || DATA_PACK_TOPIC_KEYS[m.key] || null,
        is_active: !!m.is_active,
        effective_active: !!(m.effective_active ?? m.is_active),
      })
    }
  })

  return merged.filter((m) => !HIDDEN_MODULE_KEYS.has(m.key))
}

function computeStats(list) {
  const total = list.length
  const active = list.filter((m) => m.effective_active ?? m.is_active).length
  const groups = list.filter(
    (m) => m.is_group || (!m.parent_key && list.some((c) => c.parent_key === m.key))
  ).length
  return { total, active, groups }
}

function MiniSwitch({ active, busy, onClick }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={active}
      aria-label={active ? 'فعال' : 'خاموش'}
      className={`${styles.miniSwitch} ${active ? styles.miniSwitchOn : ''} ${busy ? styles.switchBusy : ''}`}
      disabled={busy}
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
    >
      <span className={styles.miniKnob} />
    </button>
  )
}

function isDataPackModule(mod) {
  return (
    mod?.category === 'data_pack' ||
    String(mod?.key || '').startsWith('data_pack_') ||
    !!DATA_PACK_TOPIC_KEYS[mod?.key]
  )
}

/** ردیف ماژول تکی (بدون فرزند) */
function SoloModuleRow({ mod, busy, onToggle, selected, onSelect }) {
  const on = !!(mod.effective_active ?? mod.is_active)
  const packKey = mod.topicPackKey || DATA_PACK_TOPIC_KEYS[mod.key]
  const showPack = isDataPackModule(mod) && on && packKey
  const exclusive = EXCLUSIVE_SHOP_MODE_KEYS.includes(mod.key)

  return (
    <div className={styles.soloBlock}>
      <div
        role="button"
        tabIndex={0}
        className={`${styles.soloRow} ${on ? styles.soloOn : styles.soloOff} ${selected ? styles.modSelected : ''}`}
        onClick={() => onSelect?.(mod.key)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onSelect?.(mod.key)
          }
        }}
      >
        <div className={styles.soloMain}>
          <span className={`${styles.dot} ${on ? styles.dotOn : ''}`} aria-hidden />
          <div className={styles.soloTextCol}>
            <div className={styles.soloText}>
              <strong>{mod.name}</strong>
              <code dir="ltr">{mod.key}</code>
              {exclusive ? (
                <span className={styles.exclusivePill}>انحصاری</span>
              ) : null}
            </div>
            {mod.description ? (
              <span className={styles.soloHint}>{mod.description}</span>
            ) : null}
            {exclusive ? (
              <span className={styles.soloHint}>
                زیرمجموعهٔ ماژول فروشگاه — با سیاست مقابل همزمان فعال نمی‌شود.
              </span>
            ) : null}
          </div>
        </div>
        <MiniSwitch active={on} busy={busy} onClick={() => onToggle(mod)} />
      </div>
      {showPack ? (
        <TopicPackPanel
          embedded
          packKey={packKey}
          title={mod.name}
        />
      ) : null}
    </div>
  )
}

/** کارت کوچک زیرمجموعه */
function ChildCard({ mod, busy, parentOff, onToggle, selected, onSelect }) {
  const on = !!(mod.is_active)
  const exclusive = EXCLUSIVE_SHOP_MODE_KEYS.includes(mod.key)
  const meta = getCatalogMeta(mod.key)
  const shared = meta?.shopRole === 'shared'
  return (
    <div
      role="button"
      tabIndex={0}
      className={[
        styles.childCard,
        on ? styles.childCardOn : styles.childCardOff,
        parentOff ? styles.childCardMuted : '',
        selected ? styles.modSelected : '',
      ]
        .filter(Boolean)
        .join(' ')}
      onClick={() => onSelect?.(mod.key)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onSelect?.(mod.key)
        }
      }}
    >
      <div className={styles.childCardTop}>
        <span className={`${styles.dot} ${on && !parentOff ? styles.dotOn : ''}`} aria-hidden />
        <MiniSwitch
          active={on}
          busy={busy}
          onClick={() => onToggle(mod)}
        />
      </div>
      <strong className={styles.childCardTitle}>{mod.name}</strong>
      <code className={styles.childCardKey} dir="ltr">{mod.key}</code>
      {shared ? <span className={styles.sharedPill}>عمومی</span> : null}
      {exclusive ? <span className={styles.exclusivePill}>سیاست</span> : null}
      {parentOff && <span className={styles.parentOffPill}>والد خاموش</span>}
    </div>
  )
}

/** گروه با والد + کارت‌های فرزند کنار هم */
function ModuleGroupBlock({ root, busyKey, onToggle, selectedKey, onSelect }) {
  const on = !!(root.effective_active ?? root.is_active)
  const children = root.children || []
  const cols = Math.min(Math.max(children.length, 1), 4)
  const isJobBoard = root.key === SITE_MODULE_KEYS.JOB_BOARD
  const selected = selectedKey === root.key

  return (
    <div
      className={`${styles.groupBlock} ${on ? styles.groupOn : styles.groupOff} ${selected ? styles.modSelected : ''}`}
      id={isJobBoard ? 'job-board-modules' : undefined}
    >
      <div
        className={styles.groupHead}
        role="button"
        tabIndex={0}
        onClick={() => onSelect?.(root.key)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onSelect?.(root.key)
          }
        }}
      >
        <div className={styles.groupHeadMain}>
          <Layers size={14} className={styles.groupIcon} />
          <div>
            <div className={styles.groupTitleRow}>
              <strong>{root.name}</strong>
              <code dir="ltr">{root.key}</code>
              <span className={styles.childCount}>{children.length} جزء</span>
            </div>
            {root.description ? (
              <p className={styles.groupDesc}>{root.description}</p>
            ) : null}
          </div>
        </div>
        <MiniSwitch
          active={on}
          busy={busyKey === root.key}
          onClick={() => onToggle(root)}
        />
      </div>

      {children.length > 0 && (
        <div
          className={styles.childGrid}
          style={{ '--child-cols': cols }}
        >
          {children.map((child) => (
            <ChildCard
              key={child.key}
              mod={child}
              parentOff={!on}
              busy={busyKey === child.key || busyKey === root.key}
              onToggle={onToggle}
              selected={selectedKey === child.key}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}

      {isJobBoard ? <JobBoardDataPanel embedded active={on} /> : null}
    </div>
  )
}

export default function AdminWebModules({
  onStatsChange,
  selectedKey = null,
  onSelect,
  onModulesData,
  compact = false,
} = {}) {
  const { getAuthHeaders } = useAuth()
  const [modules, setModules] = useState([])
  const [loading, setLoading] = useState(true)
  const [busyKey, setBusyKey] = useState(null)
  const [error, setError] = useState('')

  const applyList = useCallback(
    (list, mapOverride = null) => {
      const merged = mergeCatalogWithApi(list)
      setModules(merged)
      onStatsChange?.(computeStats(merged))
      const fromList = Object.fromEntries(
        merged.map((m) => [m.key, !!(m.effective_active ?? m.is_active)])
      )
      const map =
        mapOverride && typeof mapOverride === 'object'
          ? { ...fromList, ...mapOverride }
          : fromList
      onModulesData?.({ list: merged, map })
    },
    [onStatsChange, onModulesData]
  )

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      clearSiteModulesCache()
      const { list } = await fetchSiteModules({ force: true })
      applyList(list)
    } catch (err) {
      setError(err?.message || 'خطا در دریافت ماژول‌ها')
      applyList([])
    } finally {
      setLoading(false)
    }
  }, [applyList])

  useEffect(() => {
    load()
  }, [load])

  const tree = useMemo(() => groupModulesTree(modules), [modules])

  const onToggle = async (mod) => {
    const turningOn = !(mod.effective_active ?? mod.is_active)
    if (EXCLUSIVE_SHOP_MODE_KEYS.includes(mod.key) && turningOn) {
      const siblingKey = EXCLUSIVE_SHOP_MODE_KEYS.find((k) => k !== mod.key)
      const sibling = modules.find((m) => m.key === siblingKey)
      if (sibling && (sibling.effective_active ?? sibling.is_active)) {
        const ok = window.confirm(
          `سیاست «${mod.name}» با «${sibling.name}» همزمان فعال نمی‌شود.\nبا ادامه، «${sibling.name}» خاموش می‌شود.`,
        )
        if (!ok) return
      }
    }
    setBusyKey(mod.key)
    setError('')
    try {
      const result = await toggleSiteModule(mod.key, getAuthHeaders())
      if (Array.isArray(result?.list) && result.list.length) {
        applyList(result.list, result.map)
      } else {
        await load()
      }
    } catch (err) {
      setError(err?.message || 'تغییر وضعیت ناموفق بود')
      await load()
    } finally {
      setBusyKey(null)
    }
  }

  return (
    <section className={`${styles.section} ${compact ? styles.sectionCompact : ''}`} id="modules">
      <div className={styles.sectionHeadRow}>
        <div className={styles.sectionHead}>
          <Boxes size={16} />
          <h2>ماژول‌ها</h2>
        </div>
        <button
          type="button"
          className={styles.refreshBtn}
          onClick={load}
          disabled={loading}
          aria-label="بروزرسانی"
        >
          <RefreshCw size={13} className={loading ? styles.spin : undefined} />
        </button>
      </div>
      <p className={styles.moduleIntro}>
        ماژول را انتخاب کنید تا ویجت‌هایش در اسکلت دیده شود؛ سوییچ برای روشن/خاموش است.
        بسته‌های داده فقط واریز محتوا دارند و در لیست ویجت نیستند.
      </p>

      {error && <p className={styles.moduleError}>{error}</p>}

      {loading && modules.length === 0 ? (
        <div className={styles.moduleLoading}>
          <RefreshCw size={18} className={styles.spin} />
        </div>
      ) : (
        <div className={styles.moduleList}>
          {tree.map((root) =>
            root.children?.length > 0 ? (
              <ModuleGroupBlock
                key={root.key}
                root={root}
                busyKey={busyKey}
                onToggle={onToggle}
                selectedKey={selectedKey}
                onSelect={onSelect}
              />
            ) : (
              <SoloModuleRow
                key={root.key}
                mod={root}
                busy={busyKey === root.key}
                onToggle={onToggle}
                selected={selectedKey === root.key}
                onSelect={onSelect}
              />
            )
          )}
        </div>
      )}
    </section>
  )
}
