'use client'

import React from 'react'
import { Coffee, Palmtree, Plus, UserRound } from 'lucide-react'
import TimetableHoursSummary from '@/components/School/TimetableHoursSummary'
import { toFaDigits } from '@/components/School/schoolDate'
import styles from './School.module.css'

export default function WeeklyScheduleGrid({
  weekdays = [],
  periods = [],
  grid = {},
  todayWeekday = null,
  onCellClick = null,
  onDayClick = null,
  highlightTeacherId = null,
  selectedKey = null,
  compact = false,
  showHours = true,
}) {
  const days = weekdays.length
    ? weekdays
    : [
      { id: 0, label: 'شنبه' },
      { id: 1, label: 'یکشنبه' },
      { id: 2, label: 'دوشنبه' },
      { id: 3, label: 'سه‌شنبه' },
      { id: 4, label: 'چهارشنبه' },
      { id: 5, label: 'پنجشنبه' },
    ]

  return (
    <div className={styles.ttBlock}>
      <div className={`${styles.ttWrap} ${compact ? styles.ttWrapCompact : styles.ttWrapRich}`}>
        <div className={styles.ttGrid} style={{ '--tt-cols': days.length }}>
          <div className={`${styles.ttCell} ${styles.ttCorner}`}>زنگ</div>
          {days.map((d) => {
            const dayClickable = typeof onDayClick === 'function'
            const DayTag = dayClickable ? 'button' : 'div'
            return (
              <DayTag
                key={d.id}
                type={dayClickable ? 'button' : undefined}
                className={`${styles.ttCell} ${styles.ttDayHead} ${todayWeekday === d.id ? styles.ttTodayCol : ''} ${dayClickable ? styles.ttDayHeadClick : ''}`}
                onClick={dayClickable ? () => onDayClick(d) : undefined}
                title={dayClickable ? 'کلیک: تعطیل / عادی کردن روز' : undefined}
              >
                {d.label}
              </DayTag>
            )
          })}

          {periods.map((p) => (
            <React.Fragment key={p.id}>
              <div className={`${styles.ttCell} ${styles.ttPeriodHead} ${p.is_break ? styles.ttPeriodBreak : ''}`}>
                <strong>{p.is_break ? <><Coffee size={11} strokeWidth={2} /> {p.title}</> : p.title}</strong>
                {p.time_label ? <span>{toFaDigits(p.time_label)}</span> : null}
              </div>
              {days.map((d) => {
                const key = `${d.id}:${p.id}`
                if (p.is_break) {
                  return (
                    <div
                      key={key}
                      className={`${styles.ttCell} ${styles.ttSlot} ${styles.ttSlotBreak}`}
                      title={p.title || 'تفریح'}
                    >
                      <Coffee size={12} strokeWidth={2} />
                      <em className={styles.ttSub}>{p.title || 'تفریح'}</em>
                    </div>
                  )
                }

                const slot = grid[key]
                const isHoliday = slot?.kind === 'holiday'
                const mine = highlightTeacherId && slot?.teacher === highlightTeacherId
                const selected = selectedKey === key
                const clickable = typeof onCellClick === 'function'
                const Tag = clickable ? 'button' : 'div'
                return (
                  <Tag
                    key={key}
                    type={clickable ? 'button' : undefined}
                    className={[
                      styles.ttCell,
                      styles.ttSlot,
                      slot ? styles.ttSlotFilled : styles.ttSlotEmpty,
                      isHoliday ? styles.ttSlotHoliday : '',
                      todayWeekday === d.id ? styles.ttTodayCol : '',
                      mine ? styles.ttSlotMine : '',
                      selected ? styles.ttSlotSelected : '',
                      clickable ? styles.ttSlotClick : '',
                    ].filter(Boolean).join(' ')}
                    style={slot ? { '--slot-color': slot.display_color || slot.color || (isHoliday ? '#94a3b8' : '#2d5a45') } : undefined}
                    onClick={clickable ? () => onCellClick({ weekday: d.id, period: p, slot }) : undefined}
                    title={slot ? (slot.display_subject || slot.subject_title) : 'افزودن'}
                  >
                    {slot ? (
                      <span className={styles.ttSlotInner}>
                        {isHoliday ? <Palmtree size={12} strokeWidth={2} /> : null}
                        <em className={styles.ttSub}>{slot.display_subject || slot.subject_title}</em>
                        {!isHoliday && slot.teacher_name ? (
                          <span className={styles.ttMeta}>
                            <UserRound size={9} strokeWidth={2.2} />
                            {slot.teacher_name}
                          </span>
                        ) : null}
                        {slot.class_title && highlightTeacherId ? (
                          <span className={styles.ttClassTag}>{slot.class_title}</span>
                        ) : null}
                      </span>
                    ) : clickable ? (
                      <span className={styles.ttEmptyMark}><Plus size={13} strokeWidth={2.1} /></span>
                    ) : (
                      <span className={styles.ttEmptyMark}>—</span>
                    )}
                  </Tag>
                )
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
      {showHours ? (
        <TimetableHoursSummary periods={periods} grid={grid} />
      ) : null}
    </div>
  )
}
