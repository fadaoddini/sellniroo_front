'use client'

import React, { useState, useCallback, useMemo } from 'react'
import {
  LAYOUT_PRESETS,
  WIDGET_TYPES,
  createSection,
  createEmptyBlock,
  legacyPageToBuilder,
  getLayoutPreset,
  uid,
} from './layouts'
import catalogService from '../services/catalogService'
import styles from './PageBuilder.module.css'

function blockPreview(block, isFa) {
  const d = block.data || {}
  if (block.type === 'heading' || block.type === 'text') {
    return isFa ? d.text_fa : d.text_en
  }
  if (block.type === 'button') return isFa ? d.label_fa : d.label_en
  if (block.type === 'image') return d.url ? '🖼' : (isFa ? 'بدون تصویر' : 'No image')
  if (block.type === 'list') {
    const raw = isFa ? d.items_fa : d.items_en
    return String(raw || '').split('\n')[0] || ''
  }
  if (block.type === 'spacer') return `${d.size || 24}px`
  return block.type
}

export default function PageBuilder({
  page,
  isFa,
  onCancel,
  onSaved,
}) {
  const [titleFa, setTitleFa] = useState(page?.title_fa || '')
  const [titleEn, setTitleEn] = useState(page?.title_en || '')
  const [builder, setBuilder] = useState(() => legacyPageToBuilder(page || {}))
  const [selected, setSelected] = useState(null) // { sectionId, columnId, blockId }
  const [dragPayload, setDragPayload] = useState(null)
  const [dragOverCol, setDragOverCol] = useState(null)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)

  const selectedBlock = useMemo(() => {
    if (!selected) return null
    const sec = builder.sections.find((s) => s.id === selected.sectionId)
    const col = sec?.columns?.find((c) => c.id === selected.columnId)
    return col?.blocks?.find((b) => b.id === selected.blockId) || null
  }, [builder, selected])

  const addSection = (layoutId) => {
    setBuilder((prev) => ({
      ...prev,
      sections: [...(prev.sections || []), createSection(layoutId)],
    }))
  }

  const removeSection = (sectionId) => {
    setBuilder((prev) => ({
      ...prev,
      sections: (prev.sections || []).filter((s) => s.id !== sectionId),
    }))
    if (selected?.sectionId === sectionId) setSelected(null)
  }

  const moveSection = (index, dir) => {
    setBuilder((prev) => {
      const sections = [...(prev.sections || [])]
      const j = index + dir
      if (j < 0 || j >= sections.length) return prev
      ;[sections[index], sections[j]] = [sections[j], sections[index]]
      return { ...prev, sections }
    })
  }

  const changeSectionLayout = (sectionId, layoutId) => {
    const preset = getLayoutPreset(layoutId)
    setBuilder((prev) => ({
      ...prev,
      sections: (prev.sections || []).map((sec) => {
        if (sec.id !== sectionId) return sec
        const oldCols = sec.columns || []
        const newCols = preset.columns.map((_, i) => {
          if (oldCols[i]) return oldCols[i]
          return { id: uid('col'), blocks: [] }
        })
        // merge leftover blocks into last column
        if (oldCols.length > newCols.length) {
          const leftovers = oldCols.slice(newCols.length).flatMap((c) => c.blocks || [])
          newCols[newCols.length - 1].blocks = [
            ...(newCols[newCols.length - 1].blocks || []),
            ...leftovers,
          ]
        }
        return {
          ...sec,
          layout: layoutId,
          background: preset.isCover ? sec.background || '#1a0a12' : sec.background,
          columns: newCols,
        }
      }),
    }))
  }

  const patchSection = (sectionId, partial) => {
    setBuilder((prev) => ({
      ...prev,
      sections: (prev.sections || []).map((s) =>
        s.id === sectionId ? { ...s, ...partial } : s
      ),
    }))
  }

  const findAndUpdateBlock = (sectionId, columnId, blockId, updater) => {
    setBuilder((prev) => ({
      ...prev,
      sections: (prev.sections || []).map((sec) => {
        if (sec.id !== sectionId) return sec
        return {
          ...sec,
          columns: (sec.columns || []).map((col) => {
            if (col.id !== columnId) return col
            return {
              ...col,
              blocks: (col.blocks || []).map((b) =>
                b.id === blockId ? updater(b) : b
              ),
            }
          }),
        }
      }),
    }))
  }

  const removeBlock = (sectionId, columnId, blockId) => {
    setBuilder((prev) => ({
      ...prev,
      sections: (prev.sections || []).map((sec) => {
        if (sec.id !== sectionId) return sec
        return {
          ...sec,
          columns: (sec.columns || []).map((col) => {
            if (col.id !== columnId) return col
            return {
              ...col,
              blocks: (col.blocks || []).filter((b) => b.id !== blockId),
            }
          }),
        }
      }),
    }))
    setSelected(null)
  }

  const onDragStartWidget = (type) => {
    setDragPayload({ kind: 'new', type })
  }

  const onDragStartBlock = (sectionId, columnId, blockId, index) => {
    setDragPayload({ kind: 'move', sectionId, columnId, blockId, index })
  }

  const onDropOnColumn = (targetSectionId, targetColumnId) => {
    if (!dragPayload) return
    setBuilder((prev) => {
      let sections = JSON.parse(JSON.stringify(prev.sections || []))
      let block = null

      if (dragPayload.kind === 'new') {
        block = createEmptyBlock(dragPayload.type)
      } else if (dragPayload.kind === 'move') {
        const fromSec = sections.find((s) => s.id === dragPayload.sectionId)
        const fromCol = fromSec?.columns?.find((c) => c.id === dragPayload.columnId)
        if (!fromCol) return prev
        const idx = fromCol.blocks.findIndex((b) => b.id === dragPayload.blockId)
        if (idx < 0) return prev
        ;[block] = fromCol.blocks.splice(idx, 1)
      }

      if (!block) return prev

      const toSec = sections.find((s) => s.id === targetSectionId)
      const toCol = toSec?.columns?.find((c) => c.id === targetColumnId)
      if (!toCol) return prev
      toCol.blocks = toCol.blocks || []
      toCol.blocks.push(block)

      setSelected({
        sectionId: targetSectionId,
        columnId: targetColumnId,
        blockId: block.id,
      })
      return { ...prev, sections }
    })
    setDragPayload(null)
    setDragOverCol(null)
  }

  const patchBlockData = (partial) => {
    if (!selected || !selectedBlock) return
    findAndUpdateBlock(
      selected.sectionId,
      selected.columnId,
      selected.blockId,
      (b) => ({ ...b, data: { ...b.data, ...partial } })
    )
  }

  const uploadImage = async (file) => {
    if (!file || !selected) return
    setUploading(true)
    const res = await catalogService.uploadMedia(file)
    setUploading(false)
    if (res.success && res.data?.url) {
      patchBlockData({ url: res.data.url })
    } else {
      setError(res.error || 'upload failed')
    }
  }

  const save = async () => {
    setSaving(true)
    setError(null)
    const fd = new FormData()
    fd.append('title_fa', titleFa)
    fd.append('title_en', titleEn)
    fd.append('page_type', 'text')
    fd.append('builder', JSON.stringify(builder))
    fd.append('is_active', 'true')
    fd.append('order', String(page?.order ?? 0))

    // derive a label from first heading if titles empty
    if (!titleFa && !titleEn) {
      const firstHeading = builder.sections
        ?.flatMap((s) => s.columns || [])
        .flatMap((c) => c.blocks || [])
        .find((b) => b.type === 'heading')
      if (firstHeading) {
        fd.set('title_fa', firstHeading.data?.text_fa || '')
        fd.set('title_en', firstHeading.data?.text_en || '')
      }
    }

    const res = page?.id
      ? await catalogService.updatePage(page.id, fd)
      : await catalogService.createPage(fd)

    setSaving(false)
    if (res.success) onSaved?.(res.data)
    else setError(res.error || 'error')
  }

  const widgetLabel = (w) => (isFa ? w.labelFa : w.labelEn)

  return (
    <div>
      <div className={styles.builder}>
        {/* Left: layouts + widgets */}
        <aside className={styles.panel}>
          <p className={styles.panelTitle}>{isFa ? 'شبکه بخش' : 'Section layouts'}</p>
          <div className={styles.layoutGrid}>
            {LAYOUT_PRESETS.map((layout) => (
              <button
                key={layout.id}
                type="button"
                className={styles.layoutBtn}
                onClick={() => addSection(layout.id)}
                title={isFa ? layout.labelFa : layout.labelEn}
              >
                <span className={styles.layoutIcon}>{layout.icon}</span>
                <span className={styles.layoutLabel}>
                  {isFa ? layout.labelFa : layout.labelEn}
                </span>
              </button>
            ))}
          </div>

          <p className={styles.panelTitle}>{isFa ? 'ویجت‌ها' : 'Widgets'}</p>
          <div className={styles.widgetList}>
            {WIDGET_TYPES.map((w) => (
              <div
                key={w.type}
                className={styles.widgetChip}
                draggable
                onDragStart={() => onDragStartWidget(w.type)}
                onDragEnd={() => setDragPayload(null)}
              >
                <span className={styles.widgetIcon}>{w.icon}</span>
                {widgetLabel(w)}
              </div>
            ))}
          </div>
          <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 12, lineHeight: 1.5 }}>
            {isFa
              ? 'شبکه را اضافه کنید، سپس ویجت را داخل ستون بکشید.'
              : 'Add a grid, then drag widgets into columns.'}
          </p>
        </aside>

        {/* Center canvas */}
        <main className={styles.canvas}>
          <div className={styles.pageMeta}>
            <input
              value={titleFa}
              onChange={(e) => setTitleFa(e.target.value)}
              placeholder={isFa ? 'نام صفحه (فارسی)' : 'Page name FA'}
              dir="rtl"
            />
            <input
              value={titleEn}
              onChange={(e) => setTitleEn(e.target.value)}
              placeholder={isFa ? 'نام صفحه (انگلیسی)' : 'Page name EN'}
              dir="ltr"
            />
          </div>

          {(builder.sections || []).map((section, sIndex) => {
            const preset = getLayoutPreset(section.layout)
            return (
              <div key={section.id} className={styles.sectionCard}>
                <div className={styles.sectionToolbar}>
                  <span>
                    {isFa ? 'بخش' : 'Section'} {sIndex + 1} ·{' '}
                    {isFa ? preset.labelFa : preset.labelEn}
                  </span>
                  <div className={styles.toolBtns}>
                    <select
                      value={section.layout}
                      onChange={(e) => changeSectionLayout(section.id, e.target.value)}
                      style={{ fontSize: 12, borderRadius: 8, padding: '2px 6px' }}
                    >
                      {LAYOUT_PRESETS.map((l) => (
                        <option key={l.id} value={l.id}>
                          {isFa ? l.labelFa : l.labelEn}
                        </option>
                      ))}
                    </select>
                    <input
                      type="color"
                      title={isFa ? 'پس‌زمینه' : 'Background'}
                      value={
                        /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(section.background || '')
                          ? section.background
                          : '#ffffff'
                      }
                      onChange={(e) => patchSection(section.id, { background: e.target.value })}
                    />
                    <button type="button" onClick={() => moveSection(sIndex, -1)}>↑</button>
                    <button type="button" onClick={() => moveSection(sIndex, 1)}>↓</button>
                    <button type="button" onClick={() => removeSection(section.id)}>
                      {isFa ? 'حذف' : 'Del'}
                    </button>
                  </div>
                </div>
                <div className={styles.sectionBody}>
                  <div
                    className={styles.columns}
                    style={{
                      gridTemplateColumns: preset.columns.map((w) => `${w}fr`).join(' '),
                    }}
                  >
                    {(section.columns || []).map((col, cIndex) => {
                      const overKey = `${section.id}:${col.id}`
                      return (
                        <div
                          key={col.id}
                          className={`${styles.column} ${
                            dragOverCol === overKey ? styles.columnDragOver : ''
                          }`}
                          onDragOver={(e) => {
                            e.preventDefault()
                            setDragOverCol(overKey)
                          }}
                          onDragLeave={() => setDragOverCol(null)}
                          onDrop={(e) => {
                            e.preventDefault()
                            onDropOnColumn(section.id, col.id)
                          }}
                        >
                          <div className={styles.columnLabel}>
                            {isFa ? `ستون ${cIndex + 1}` : `Col ${cIndex + 1}`}
                          </div>
                          {(col.blocks || []).length === 0 ? (
                            <div className={styles.emptyCol}>
                              {isFa ? 'اینجا رها کنید' : 'Drop here'}
                            </div>
                          ) : (
                            (col.blocks || []).map((block, bIndex) => {
                              const isSel =
                                selected?.blockId === block.id &&
                                selected?.columnId === col.id
                              const wMeta = WIDGET_TYPES.find((w) => w.type === block.type)
                              return (
                                <div
                                  key={block.id}
                                  className={`${styles.blockItem} ${
                                    isSel ? styles.blockSelected : ''
                                  }`}
                                  draggable
                                  onDragStart={() =>
                                    onDragStartBlock(section.id, col.id, block.id, bIndex)
                                  }
                                  onDragEnd={() => setDragPayload(null)}
                                  onClick={() =>
                                    setSelected({
                                      sectionId: section.id,
                                      columnId: col.id,
                                      blockId: block.id,
                                    })
                                  }
                                >
                                  <span className={styles.blockHandle}>⠿</span>
                                  <div className={styles.blockBody}>
                                    <div className={styles.blockType}>
                                      {wMeta ? widgetLabel(wMeta) : block.type}
                                    </div>
                                    <div className={styles.blockPreview}>
                                      {blockPreview(block, isFa)}
                                    </div>
                                  </div>
                                </div>
                              )
                            })
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            )
          })}

          {(builder.sections || []).length === 0 && (
            <div className={styles.emptyCol} style={{ padding: 40 }}>
              {isFa
                ? 'یک شبکه از سمت چپ اضافه کنید'
                : 'Add a layout from the left panel'}
            </div>
          )}
        </main>

        {/* Right inspector */}
        <aside className={`${styles.panel} ${styles.panelRight}`}>
          <p className={styles.panelTitle}>{isFa ? 'ویرایش ویجت' : 'Edit widget'}</p>
          {!selectedBlock ? (
            <div className={styles.inspectorEmpty}>
              {isFa ? 'یک ویجت را انتخاب کنید' : 'Select a widget'}
            </div>
          ) : (
            <BlockInspector
              block={selectedBlock}
              isFa={isFa}
              uploading={uploading}
              onChange={patchBlockData}
              onUpload={uploadImage}
              onDelete={() =>
                removeBlock(selected.sectionId, selected.columnId, selected.blockId)
              }
            />
          )}
        </aside>
      </div>

      {error ? (
        <p style={{ color: '#b91c1c', fontSize: 13, marginTop: 8 }}>{error}</p>
      ) : null}

      <div className={styles.footer}>
        <button type="button" className={styles.cancelBtn} onClick={onCancel}>
          {isFa ? 'انصراف' : 'Cancel'}
        </button>
        <button type="button" className={styles.saveBtn} onClick={save} disabled={saving}>
          {saving ? '...' : isFa ? 'ذخیره صفحه' : 'Save page'}
        </button>
      </div>
    </div>
  )
}

function BlockInspector({ block, isFa, onChange, onUpload, onDelete, uploading }) {
  const d = block.data || {}

  if (block.type === 'heading' || block.type === 'text') {
    return (
      <>
        <div className={styles.formGroup}>
          <label>{isFa ? 'متن فارسی' : 'Text FA'}</label>
          <textarea
            value={d.text_fa || ''}
            onChange={(e) => onChange({ text_fa: e.target.value })}
            dir="rtl"
          />
        </div>
        <div className={styles.formGroup}>
          <label>{isFa ? 'متن انگلیسی' : 'Text EN'}</label>
          <textarea
            value={d.text_en || ''}
            onChange={(e) => onChange({ text_en: e.target.value })}
            dir="ltr"
          />
        </div>
        {block.type === 'heading' && (
          <div className={styles.formGroup}>
            <label>{isFa ? 'اندازه' : 'Size'}</label>
            <select
              value={d.size || 'lg'}
              onChange={(e) => onChange({ size: e.target.value })}
            >
              <option value="xl">XL</option>
              <option value="lg">LG</option>
              <option value="md">MD</option>
              <option value="sm">SM</option>
            </select>
          </div>
        )}
        <div className={styles.formGroup}>
          <label>{isFa ? 'تراز' : 'Align'}</label>
          <select
            value={d.align || 'right'}
            onChange={(e) => onChange({ align: e.target.value })}
          >
            <option value="right">{isFa ? 'راست' : 'Right'}</option>
            <option value="center">{isFa ? 'وسط' : 'Center'}</option>
            <option value="left">{isFa ? 'چپ' : 'Left'}</option>
          </select>
        </div>
        <div className={styles.formGroup}>
          <label>{isFa ? 'رنگ' : 'Color'}</label>
          <input
            type="color"
            value={/^#/.test(d.color || '') ? d.color : '#1c1410'}
            onChange={(e) => onChange({ color: e.target.value })}
          />
        </div>
        <div className={styles.inspectorActions}>
          <button type="button" className={styles.dangerBtn} onClick={onDelete}>
            {isFa ? 'حذف ویجت' : 'Delete'}
          </button>
        </div>
      </>
    )
  }

  if (block.type === 'image') {
    return (
      <>
        <div className={styles.formGroup}>
          <label>{isFa ? 'آدرس تصویر' : 'Image URL'}</label>
          <input
            value={d.url || ''}
            onChange={(e) => onChange({ url: e.target.value })}
            dir="ltr"
          />
        </div>
        <div className={styles.formGroup}>
          <label>{isFa ? 'آپلود' : 'Upload'}</label>
          <input
            className={styles.fileInput}
            id="builder-img"
            type="file"
            accept="image/*"
            onChange={(e) => onUpload(e.target.files?.[0])}
          />
          <label htmlFor="builder-img" className={styles.fileBtn}>
            {uploading ? '...' : isFa ? 'انتخاب فایل' : 'Choose file'}
          </label>
        </div>
        <div className={styles.formGroup}>
          <label>Alt</label>
          <input value={d.alt || ''} onChange={(e) => onChange({ alt: e.target.value })} />
        </div>
        <div className={styles.inspectorActions}>
          <button type="button" className={styles.dangerBtn} onClick={onDelete}>
            {isFa ? 'حذف ویجت' : 'Delete'}
          </button>
        </div>
      </>
    )
  }

  if (block.type === 'button') {
    return (
      <>
        <div className={styles.formGroup}>
          <label>{isFa ? 'برچسب فارسی' : 'Label FA'}</label>
          <input value={d.label_fa || ''} onChange={(e) => onChange({ label_fa: e.target.value })} dir="rtl" />
        </div>
        <div className={styles.formGroup}>
          <label>{isFa ? 'برچسب انگلیسی' : 'Label EN'}</label>
          <input value={d.label_en || ''} onChange={(e) => onChange({ label_en: e.target.value })} dir="ltr" />
        </div>
        <div className={styles.formGroup}>
          <label>URL</label>
          <input value={d.url || ''} onChange={(e) => onChange({ url: e.target.value })} dir="ltr" />
        </div>
        <div className={styles.formGroup}>
          <label>{isFa ? 'استایل' : 'Style'}</label>
          <select value={d.style || 'primary'} onChange={(e) => onChange({ style: e.target.value })}>
            <option value="primary">Primary</option>
            <option value="outline">Outline</option>
          </select>
        </div>
        <div className={styles.inspectorActions}>
          <button type="button" className={styles.dangerBtn} onClick={onDelete}>
            {isFa ? 'حذف ویجت' : 'Delete'}
          </button>
        </div>
      </>
    )
  }

  if (block.type === 'spacer') {
    return (
      <>
        <div className={styles.formGroup}>
          <label>{isFa ? 'ارتفاع (px)' : 'Height (px)'}</label>
          <input
            type="number"
            value={d.size || 24}
            onChange={(e) => onChange({ size: Number(e.target.value) || 24 })}
          />
        </div>
        <div className={styles.inspectorActions}>
          <button type="button" className={styles.dangerBtn} onClick={onDelete}>
            {isFa ? 'حذف ویجت' : 'Delete'}
          </button>
        </div>
      </>
    )
  }

  if (block.type === 'list') {
    return (
      <>
        <div className={styles.formGroup}>
          <label>{isFa ? 'موارد فارسی (هر خط یکی)' : 'FA items (one per line)'}</label>
          <textarea value={d.items_fa || ''} onChange={(e) => onChange({ items_fa: e.target.value })} dir="rtl" />
        </div>
        <div className={styles.formGroup}>
          <label>{isFa ? 'موارد انگلیسی' : 'EN items'}</label>
          <textarea value={d.items_en || ''} onChange={(e) => onChange({ items_en: e.target.value })} dir="ltr" />
        </div>
        <div className={styles.inspectorActions}>
          <button type="button" className={styles.dangerBtn} onClick={onDelete}>
            {isFa ? 'حذف ویجت' : 'Delete'}
          </button>
        </div>
      </>
    )
  }

  // divider / default
  return (
    <div className={styles.inspectorActions}>
      <button type="button" className={styles.dangerBtn} onClick={onDelete}>
        {isFa ? 'حذف ویجت' : 'Delete'}
      </button>
    </div>
  )
}
