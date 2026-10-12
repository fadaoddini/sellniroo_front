// app/(admin)/adminweb/AdminWebModules.jsx — سوییچ ماژول‌ها (مینیمال + کارت زیرمجموعه)
'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Boxes, RefreshCw, Layers } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import {
  SITE_MODULES_CATALOG,
  getCatalogMeta,
  groupModulesTree,
} from '@/config/siteModules'
import {
  fetchSiteModules,
  toggleSiteModule,
  clearSiteModulesCache,
} from '@/services/siteModules'
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
      is_active: api ? !!api.is_active : cat.defaultActive !== false,
      effective_active: api
        ? !!(api.effective_active ?? api.is_active)
        : cat.defaultActive !== false,
    }
  })

  ;(list || []).forEach((m) => {
    if (!merged.some((x) => x.key === m.key)) {
      merged.push({
        key: m.key,
        name: m.name,
        name_en: m.name_en,
        description: m.description,
        category: m.category,
        parent_key: m.parent_key || null,
        is_group: !!m.is_group,
        componentPath: getCatalogMeta(m.key)?.componentPath || '',
        is_active: !!m.is_active,
        effective_active: !!(m.effective_active ?? m.is_active),
      })
    }
  })

  return merged
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

/** ردیف ماژول تکی (بدون فرزند) */
function SoloModuleRow({ mod, busy, onToggle }) {
  const on = !!mod.is_active
  return (
    <div className={`${styles.soloRow} ${on ? styles.soloOn : styles.soloOff}`}>
      <div className={styles.soloMain}>
        <span className={`${styles.dot} ${on ? styles.dotOn : ''}`} aria-hidden />
        <div className={styles.soloText}>
          <strong>{mod.name}</strong>
          <code dir="ltr">{mod.key}</code>
        </div>
      </div>
      <MiniSwitch active={on} busy={busy} onClick={() => onToggle(mod)} />
    </div>
  )
}

/** کارت کوچک زیرمجموعه */
function ChildCard({ mod, busy, parentOff, onToggle }) {
  const on = !!mod.is_active
  return (
    <div
      className={[
        styles.childCard,
        on ? styles.childCardOn : styles.childCardOff,
        parentOff ? styles.childCardMuted : '',
      ]
        .filter(Boolean)
        .join(' ')}
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
      {parentOff && <span className={styles.parentOffPill}>والد خاموش</span>}
    </div>
  )
}

/** گروه با والد + کارت‌های فرزند کنار هم */
function ModuleGroupBlock({ root, busyKey, onToggle }) {
  const on = !!root.is_active
  const children = root.children || []
  const cols = Math.min(Math.max(children.length, 1), 4)

  return (
    <div className={`${styles.groupBlock} ${on ? styles.groupOn : styles.groupOff}`}>
      <div className={styles.groupHead}>
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
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default function AdminWebModules({ onStatsChange } = {}) {
  const { getAuthHeaders } = useAuth()
  const [modules, setModules] = useState([])
  const [loading, setLoading] = useState(true)
  const [busyKey, setBusyKey] = useState(null)
  const [error, setError] = useState('')

  const applyList = useCallback(
    (list) => {
      const merged = mergeCatalogWithApi(list)
      setModules(merged)
      onStatsChange?.(computeStats(merged))
    },
    [onStatsChange]
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
    setBusyKey(mod.key)
    setError('')
    try {
      const result = await toggleSiteModule(mod.key, getAuthHeaders())
      if (Array.isArray(result?.list)) {
        applyList(result.list)
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
    <section className={styles.section}>
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
        والد همهٔ اجزا را با هم کنترل می‌کند؛ هر کارت زیرمجموعه هم سوییچ جدا دارد.
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
              />
            ) : (
              <SoloModuleRow
                key={root.key}
                mod={root}
                busy={busyKey === root.key}
                onToggle={onToggle}
              />
            )
          )}
        </div>
      )}
    </section>
  )
}
