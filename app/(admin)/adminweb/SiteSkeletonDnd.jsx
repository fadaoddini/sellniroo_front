'use client'

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  useDraggable,
  pointerWithin,
  rectIntersection,
  closestCenter,
  MeasuringStrategy,
} from '@dnd-kit/core'
import { GripVertical, Plus, Trash2, Columns3 } from 'lucide-react'
import { widgetMeta } from '@/config/pageBuilderWidgets'
import { findWidgetInLayout } from '@/config/homeLayout'
import WidgetLivePreview from './WidgetLivePreview'
import styles from './AdminWeb.module.css'

const COL_PREFIX = 'drop-col:'
const SLOT_PREFIX = 'slot:'

const DragActiveCtx = createContext(false)
const DropHighlightCtx = createContext(null)

export function makeColumnDropId(sectionId, columnId) {
  return `${COL_PREFIX}${sectionId}__${columnId}`
}

export function makeSlotId(sectionId, columnId, index) {
  return `${SLOT_PREFIX}${sectionId}__${columnId}__${index}`
}

export function parseColumnDropId(id) {
  const raw = String(id || '')
  if (!raw.startsWith(COL_PREFIX)) return null
  const rest = raw.slice(COL_PREFIX.length)
  const sep = rest.indexOf('__')
  if (sep < 0) return null
  return {
    sectionId: rest.slice(0, sep),
    columnId: rest.slice(sep + 2),
  }
}

export function parseSlotId(id) {
  const raw = String(id || '')
  if (!raw.startsWith(SLOT_PREFIX)) return null
  const rest = raw.slice(SLOT_PREFIX.length)
  const parts = rest.split('__')
  if (parts.length < 3) return null
  const index = Number(parts[parts.length - 1])
  if (!Number.isFinite(index)) return null
  const columnId = parts[parts.length - 2]
  const sectionId = parts.slice(0, -2).join('__')
  if (!sectionId || !columnId) return null
  return { sectionId, columnId, index }
}

function findWidgetLoc(layout, widgetId) {
  const hit = findWidgetInLayout(layout, widgetId)
  if (!hit?.widget) return null
  const index = (hit.column.widgets || []).findIndex((w) => w.id === widgetId)
  return {
    sectionId: hit.section.id,
    columnId: hit.column.id,
    index,
    widget: hit.widget,
  }
}

function resolveDropTarget(layout, overId) {
  if (!overId) return null
  const slot = parseSlotId(overId)
  if (slot) {
    return {
      sectionId: slot.sectionId,
      columnId: slot.columnId,
      index: slot.index,
      kind: 'slot',
    }
  }
  const col = parseColumnDropId(overId)
  if (col) {
    const row = (layout.rows || []).find((r) => r.id === col.sectionId)
    const column = row?.columns?.find((c) => c.id === col.columnId)
    return {
      sectionId: col.sectionId,
      columnId: col.columnId,
      index: (column?.widgets || []).length,
      kind: 'column',
    }
  }
  const overLoc = findWidgetLoc(layout, overId)
  if (!overLoc) return null
  return {
    sectionId: overLoc.sectionId,
    columnId: overLoc.columnId,
    index: overLoc.index,
    kind: 'widget',
  }
}

/** ایندکس نهایی بعد از حذف ویجت از مبدأ */
function computeInsertIndex(from, to) {
  if (!from || !to) return 0
  if (from.sectionId !== to.sectionId || from.columnId !== to.columnId) {
    return to.index
  }
  if (to.index > from.index) return to.index - 1
  return to.index
}

function isNoOpMove(from, to) {
  if (!from || !to) return true
  if (from.sectionId !== to.sectionId || from.columnId !== to.columnId) {
    return false
  }
  // اسلات قبل یا بلافاصله بعد از خودش = بدون تغییر
  return to.index === from.index || to.index === from.index + 1
}

function preciseCollision(args) {
  const pointerHits = pointerWithin(args)
  const slotPointer = pointerHits.filter((c) =>
    String(c.id).startsWith(SLOT_PREFIX)
  )
  if (slotPointer.length) return slotPointer

  const rectHits = rectIntersection(args)
  const slotRects = rectHits.filter((c) => String(c.id).startsWith(SLOT_PREFIX))
  if (slotRects.length) return slotRects

  const colPointer = pointerHits.filter((c) =>
    String(c.id).startsWith(COL_PREFIX)
  )
  if (colPointer.length) return colPointer

  const colRects = rectHits.filter((c) => String(c.id).startsWith(COL_PREFIX))
  if (colRects.length) return colRects

  return closestCenter(args)
}

function DropSlot({ sectionId, columnId, index }) {
  const dragging = useContext(DragActiveCtx)
  const highlightId = useContext(DropHighlightCtx)
  const id = makeSlotId(sectionId, columnId, index)
  const { setNodeRef, isOver } = useDroppable({
    id,
    data: {
      type: 'slot',
      sectionId,
      columnId,
      index,
    },
  })
  const active = isOver || highlightId === id

  return (
    <div
      ref={setNodeRef}
      className={[
        styles.pbDropSlot,
        dragging ? styles.pbDropSlotReady : '',
        active ? styles.pbDropSlotOver : '',
      ]
        .filter(Boolean)
        .join(' ')}
      data-slot-index={index}
      aria-hidden
    >
      <span className={styles.pbDropSlotLine} />
    </div>
  )
}

export function DraggableWidgetCard({
  widget,
  sectionId,
  columnId,
  index,
  selected,
  onSelect,
  onRemove,
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: widget.id,
    data: {
      type: 'widget',
      sectionId,
      columnId,
      widgetId: widget.id,
      index,
    },
  })

  return (
    <div
      ref={setNodeRef}
      className={[
        styles.pbWidget,
        styles.pbWidgetLive,
        selected ? styles.pbWidgetOn : '',
        isDragging ? styles.pbWidgetDragging : '',
      ]
        .filter(Boolean)
        .join(' ')}
      role="button"
      tabIndex={0}
      onClick={(e) => {
        e.stopPropagation()
        onSelect()
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.stopPropagation()
          onSelect()
        }
      }}
    >
      <button
        type="button"
        className={styles.pbWidgetDrag}
        title="کشیدن و رها کردن روی خط طلایی"
        aria-label="کشیدن ویجت"
        onClick={(e) => e.stopPropagation()}
        {...attributes}
        {...listeners}
      >
        <GripVertical size={14} />
      </button>
      <div className={styles.pbWidgetLiveBody}>
        <WidgetLivePreview
          type={widget.type}
          settings={widget.settings}
          selected={selected}
        />
      </div>
      <button
        type="button"
        className={styles.pbWidgetDel}
        aria-label="حذف ویجت"
        onClick={(e) => {
          e.stopPropagation()
          onRemove()
        }}
      >
        <Trash2 size={12} />
      </button>
    </div>
  )
}

export function DroppableColumn({
  sectionId,
  column,
  selectedWidgetId,
  onSelectWidget,
  onRemoveWidget,
  onAddWidget,
}) {
  const dragging = useContext(DragActiveCtx)
  const highlightId = useContext(DropHighlightCtx)
  const dropId = makeColumnDropId(sectionId, column.id)
  const { setNodeRef, isOver } = useDroppable({
    id: dropId,
    data: {
      type: 'column',
      sectionId,
      columnId: column.id,
    },
  })
  const widgets = column.widgets || []
  const colHighlighted =
    isOver ||
    (highlightId && String(highlightId).startsWith(`${COL_PREFIX}${sectionId}__${column.id}`)) ||
    (highlightId &&
      parseSlotId(highlightId)?.sectionId === sectionId &&
      parseSlotId(highlightId)?.columnId === column.id)

  return (
    <div
      ref={setNodeRef}
      className={[
        styles.pbColumn,
        dragging && colHighlighted ? styles.pbColumnDropOver : '',
      ]
        .filter(Boolean)
        .join(' ')}
      onClick={(e) => e.stopPropagation()}
    >
      <div className={styles.pbColMeta}>
        <Columns3 size={11} />
        {column.span}%
      </div>

      <DropSlot sectionId={sectionId} columnId={column.id} index={0} />

      {widgets.map((w, index) => (
        <React.Fragment key={w.id}>
          <DraggableWidgetCard
            widget={w}
            sectionId={sectionId}
            columnId={column.id}
            index={index}
            selected={selectedWidgetId === w.id}
            onSelect={() =>
              onSelectWidget({
                sectionId,
                columnId: column.id,
                widgetId: w.id,
              })
            }
            onRemove={() => onRemoveWidget(sectionId, column.id, w.id)}
          />
          <DropSlot
            sectionId={sectionId}
            columnId={column.id}
            index={index + 1}
          />
        </React.Fragment>
      ))}

      {widgets.length === 0 ? (
        <div
          className={`${styles.pbColumnDropHint} ${dragging ? styles.pbColumnDropHintActive : ''}`}
        >
          اینجا رها کنید
        </div>
      ) : null}

      <button
        type="button"
        className={styles.pbPlus}
        onClick={() => onAddWidget(sectionId, column.id)}
        title="افزودن ویجت"
      >
        <Plus size={22} />
        <span>افزودن ویجت</span>
      </button>
    </div>
  )
}

export function WidgetDragOverlay({ widget }) {
  if (!widget) return null
  const meta = widgetMeta(widget.type)
  return (
    <div className={`${styles.pbWidget} ${styles.pbWidgetOverlay}`}>
      <GripVertical size={14} />
      <strong>{meta?.label || widget.type}</strong>
    </div>
  )
}

/**
 * Context درگ‌اند‌دراپ — اسلات دقیق + نگه داشتن آخرین هدف رها کردن
 */
export function LayoutDndProvider({ layout, onMoveWidget, children }) {
  const [activeId, setActiveId] = useState(null)
  const [highlightId, setHighlightId] = useState(null)
  const layoutRef = useRef(layout)
  const lastOverIdRef = useRef(null)

  useEffect(() => {
    layoutRef.current = layout
  }, [layout])

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  )

  const activeWidget = useMemo(() => {
    if (!activeId) return null
    return findWidgetLoc(layout, activeId)?.widget || null
  }, [activeId, layout])

  const commitMove = useCallback(
    (dragId, overId) => {
      if (!dragId || !overId) return false
      const current = layoutRef.current
      const from = findWidgetLoc(current, dragId)
      if (!from) return false
      const to = resolveDropTarget(current, overId)
      if (!to) return false
      if (isNoOpMove(from, to)) return false

      const insertIndex = computeInsertIndex(from, to)
      if (
        from.sectionId === to.sectionId &&
        from.columnId === to.columnId &&
        insertIndex === from.index
      ) {
        return false
      }

      onMoveWidget({
        fromSectionId: from.sectionId,
        fromColumnId: from.columnId,
        widgetId: from.widget.id,
        toSectionId: to.sectionId,
        toColumnId: to.columnId,
        toIndex: insertIndex,
      })
      return true
    },
    [onMoveWidget]
  )

  const handleDragStart = (event) => {
    const id = event.active?.id || null
    setActiveId(id)
    lastOverIdRef.current = null
    setHighlightId(null)
  }

  const handleDragOver = (event) => {
    const overId = event.over?.id || null
    if (overId) {
      lastOverIdRef.current = overId
      setHighlightId(String(overId))
    }
  }

  const handleDragCancel = () => {
    setActiveId(null)
    setHighlightId(null)
    lastOverIdRef.current = null
  }

  const handleDragEnd = (event) => {
    const dragId = event.active?.id
    const overId = event.over?.id || lastOverIdRef.current
    commitMove(dragId, overId)
    setActiveId(null)
    setHighlightId(null)
    lastOverIdRef.current = null
  }

  return (
    <DragActiveCtx.Provider value={!!activeId}>
      <DropHighlightCtx.Provider value={highlightId}>
        <DndContext
          sensors={sensors}
          collisionDetection={preciseCollision}
          measuring={{
            droppable: { strategy: MeasuringStrategy.Always },
          }}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
          {children}
          <DragOverlay dropAnimation={null} adjustScale={false}>
            <WidgetDragOverlay widget={activeWidget} />
          </DragOverlay>
        </DndContext>
      </DropHighlightCtx.Provider>
    </DragActiveCtx.Provider>
  )
}
