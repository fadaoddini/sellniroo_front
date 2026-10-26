/** ابزار درخت دسته‌بندی — فقط برگ‌ها برای محصول قابل انتخاب‌اند */

export function normalizeSearch(text) {
  return String(text || '')
    .trim()
    .toLowerCase()
    .replace(/ي/g, 'ی')
    .replace(/ك/g, 'ک')
    .replace(/\s+/g, ' ')
}

export function buildCategoryIndex(categories = []) {
  const byId = new Map()
  const childrenOf = new Map()

  for (const cat of categories) {
    const id = String(cat.id)
    byId.set(id, cat)
    const parentKey =
      cat.parent == null || cat.parent === '' ? 'root' : String(cat.parent)
    if (!childrenOf.has(parentKey)) childrenOf.set(parentKey, [])
    childrenOf.get(parentKey).push(cat)
  }

  for (const [, list] of childrenOf) {
    list.sort((a, b) =>
      String(a.title || '').localeCompare(String(b.title || ''), 'fa'),
    )
  }

  return { byId, childrenOf }
}

export function getChildren(childrenOf, parentId = null) {
  const key =
    parentId == null || parentId === '' || parentId === 'root'
      ? 'root'
      : String(parentId)
  return childrenOf.get(key) || []
}

export function isLeafCategory(cat, childrenOf) {
  if (!cat) return false
  if (typeof cat.is_leaf === 'boolean') return cat.is_leaf
  if (typeof cat.children_count === 'number') return cat.children_count === 0
  return getChildren(childrenOf, cat.id).length === 0
}

/** دسته‌هایی که خود یا یکی از اجدادشان غیرفعال است از انتخاب محصول حذف می‌شوند */
export function filterAssignableCategories(categories = []) {
  const { byId } = buildCategoryIndex(categories)
  return categories.filter((cat) => {
    if (cat.is_effectively_active === false) return false
    let cur = cat
    const seen = new Set()
    while (cur && !seen.has(String(cur.id))) {
      seen.add(String(cur.id))
      if (cur.status === 'inactive') return false
      if (cur.parent == null || cur.parent === '') break
      cur = byId.get(String(cur.parent))
    }
    return true
  })
}

export function getCategoryPath(categoryId, byId) {
  const path = []
  let cur = byId.get(String(categoryId))
  const seen = new Set()
  while (cur && !seen.has(String(cur.id))) {
    seen.add(String(cur.id))
    path.unshift(cur)
    if (cur.parent == null || cur.parent === '') break
    cur = byId.get(String(cur.parent))
  }
  return path
}

export function formatCategoryPath(path, sep = ' › ') {
  return (path || []).map((c) => c.title).join(sep)
}

/** جستجو فقط روی برگ‌ها؛ مسیر کامل هم در تطبیق لحاظ می‌شود */
export function searchLeafCategories(categories, childrenOf, byId, query) {
  const q = normalizeSearch(query)
  if (!q) return []

  const leaves = categories.filter((c) => isLeafCategory(c, childrenOf))
  const scored = []

  for (const leaf of leaves) {
    const path = getCategoryPath(leaf.id, byId)
    const title = normalizeSearch(leaf.title)
    const pathText = normalizeSearch(formatCategoryPath(path, ' '))
    let score = 0
    if (title === q) score = 100
    else if (title.startsWith(q)) score = 80
    else if (title.includes(q)) score = 60
    else if (pathText.includes(q)) score = 40
    else continue
    scored.push({ leaf, path, score })
  }

  scored.sort(
    (a, b) =>
      b.score - a.score ||
      String(a.leaf.title).localeCompare(String(b.leaf.title), 'fa'),
  )
  return scored
}
