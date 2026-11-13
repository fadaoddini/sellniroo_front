/**
 * محاسبات موجودی سلسله‌مراتبی — هم‌تراز با get_all_levels_quantity بک‌اند
 */

export function getFactorToRoot(unit, unitsList, rootId) {
  if (!unit || unit.id === rootId) return 1
  let factor = 1
  let current = unit
  let guard = 0
  while (current && current.id !== rootId && guard < 20) {
    factor *= current.count_in_parent || 1
    current = (unitsList || []).find((u) => u.id === current.parent)
    guard += 1
  }
  return factor || 1
}

/**
 * موجودی قابل‌نمایش در واحد هدف:
 * ریشهٔ بسته‌شده × ضریب + تبدیل همهٔ بافرها به همان واحد (کف عدد صحیح)
 */
export function quantityInUnit({
  targetUnit,
  rootId,
  rootStock,
  packagingBuffer,
  unitsList,
  factorsById,
}) {
  const targetFactor =
    factorsById?.[targetUnit.id] ??
    getFactorToRoot(targetUnit, unitsList, rootId)

  let total = Number(rootStock || 0) * targetFactor

  const buffer = packagingBuffer || {}
  for (const [key, raw] of Object.entries(buffer)) {
    const buf = Number(raw || 0)
    if (!buf) continue
    const otherId = Number(key)
    const otherUnit = (unitsList || []).find((u) => u.id === otherId)
    if (!otherUnit) continue
    const otherFactor =
      factorsById?.[otherId] ?? getFactorToRoot(otherUnit, unitsList, rootId)
    if (!otherFactor) continue
    total += (buf * targetFactor) / otherFactor
  }

  return Math.floor(total)
}

/**
 * معادل تعداد در واحد انتخاب‌شده برای همهٔ واحدهای درخت (ریشه تا ریزترین مسیر)
 */
export function buildTransactionEquivalents({
  selectedUnit,
  quantity,
  rootUnit,
  unitsList,
}) {
  if (!selectedUnit || !rootUnit || !quantity) return []

  const selectedFactor = getFactorToRoot(selectedUnit, unitsList, rootUnit.id)
  const qty = Number(quantity) || 0

  // مسیر ریشه → انتخاب‌شده
  const pathUp = []
  let cur = selectedUnit
  let guard = 0
  while (cur && guard < 20) {
    pathUp.unshift(cur)
    if (cur.id === rootUnit.id) break
    cur = cur.parent
      ? (unitsList || []).find((u) => u.id === cur.parent)
      : null
    guard += 1
  }

  // ادامه به سمت ریزترین فرزند اول
  const chain = [...pathUp]
  let walk = selectedUnit
  while (true) {
    const child = (unitsList || []).find(
      (u) => u.parent === walk.id && u.is_active !== false
    )
    if (!child) break
    chain.push(child)
    walk = child
  }

  // یکتا
  const seen = new Set()
  const unique = chain.filter((u) => {
    if (seen.has(u.id)) return false
    seen.add(u.id)
    return true
  })

  return unique.map((unit, index) => {
    const unitFactor = getFactorToRoot(unit, unitsList, rootUnit.id)
    const exact = (qty * unitFactor) / selectedFactor
    const isWhole = Number.isInteger(exact) || Math.abs(exact - Math.round(exact)) < 1e-9
    return {
      unit,
      quantity: isWhole ? Math.round(exact) : exact,
      exact,
      isWhole,
      isRoot: unit.id === rootUnit.id,
      isSelected: unit.id === selectedUnit.id,
      level: index,
      unitName: unit.title,
      unitAbbr: unit.abbreviation || '',
      countInParent: unit.count_in_parent || 1,
    }
  })
}
