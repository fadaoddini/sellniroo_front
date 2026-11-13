'use client'

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import {
  Package,
  Warehouse,
  Layers,
  ArrowDownToLine,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Search,
  X,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Plus,
  Minus,
  Calculator,
  Check,
  Building2,
  MapPin,
  Phone,
  User,
  GitBranch,
} from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import { useInventory } from '@/modules/inventory/context/InventoryContext'
import ConfirmDialog from '../common/ConfirmDialog'
import InventoryToast, { getApiErrorMessage } from '../common/InventoryToast'
import styles from './StockIn.module.css'

const faNum = (n) => Number(n || 0).toLocaleString('fa-IR')

const StockIn = () => {
  const { language, dir } = useLanguage()
  const fa = language === 'fa'
  const {
    state,
    loadProducts,
    loadUnits,
    loadWarehouses,
    receiveWithUnit,
  } = useInventory()

  const [step, setStep] = useState(1)
  const [selectedWarehouse, setSelectedWarehouse] = useState(null)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [selectedUnit, setSelectedUnit] = useState(null)
  const [quantity, setQuantity] = useState('')
  const [description, setDescription] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [booting, setBooting] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedUnits, setExpandedUnits] = useState({})
  const [showConfirm, setShowConfirm] = useState(false)
  const [toast, setToast] = useState(null)
  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type })
  }, [])
  const clearToast = useCallback(() => setToast(null), [])

  const initialLoadDone = useRef(false)
  const searchRef = useRef(null)

  const t = useMemo(
    () => ({
      title: fa ? 'ورود کالا به انبار' : 'Stock In',
      subtitle: fa
        ? 'در سه مرحله انبار، کالا و تعداد را ثبت کنید'
        : 'Register stock in three steps',
      step1: fa ? 'انبار' : 'Warehouse',
      step2: fa ? 'کالا' : 'Product',
      step3: fa ? 'واحد و تعداد' : 'Unit & Qty',
      selectWarehouse: fa ? 'انبار مقصد را انتخاب کنید' : 'Select warehouse',
      selectProduct: fa ? 'کالا را انتخاب کنید' : 'Select product',
      searchProduct: fa ? 'جستجو با نام یا کد کالا...' : 'Search name or code...',
      browseProducts: fa ? 'همه کالاهای فعال' : 'All active products',
      noProductFound: fa ? 'کالایی پیدا نشد' : 'No product found',
      selectUnit: fa ? 'واحد ورود را انتخاب کنید' : 'Select unit',
      enterQuantity: fa ? 'تعداد ورودی' : 'Quantity',
      quantityPlaceholder: fa ? 'مثلاً ۱۰' : 'e.g. 10',
      description: fa ? 'توضیحات (اختیاری)' : 'Notes (optional)',
      next: fa ? 'ادامه' : 'Next',
      back: fa ? 'بازگشت' : 'Back',
      submit: fa ? 'ثبت ورود' : 'Submit',
      reset: fa ? 'شروع دوباره' : 'Reset',
      preview: fa ? 'پیش‌نمایش تبدیل واحد' : 'Unit preview',
      totalInRoot: fa ? 'جمع‌آوری به واحد ریشه (حداقل)' : 'Packs into root (min)',
      leftoverBuffer: fa ? 'باقیمانده در بافر' : 'Left in buffer',
      equivDown: fa ? 'معادل در واحدهای ریزتر' : 'Finer unit equivalents',
      packNote: fa
        ? 'اگر از قبل باقیمانده داشته باشید، ممکن است بسته‌های بیشتری جمع شود'
        : 'Existing leftovers may pack into more root units',
      successMessage: fa
        ? 'کالا با موفقیت وارد انبار شد'
        : 'Stock registered successfully',
      confirmTitle: fa ? 'تایید ثبت ورود' : 'Confirm stock in',
      confirmSubmit: fa
        ? 'آیا از ثبت این ورود اطمینان دارید؟'
        : 'Confirm this stock entry?',
      refresh: fa ? 'بروزرسانی' : 'Refresh',
      loading: fa ? 'در حال بارگذاری...' : 'Loading...',
      rootUnit: fa ? 'واحد اصلی' : 'Root unit',
      selected: fa ? 'انتخاب‌شده' : 'Selected',
      warehouse: fa ? 'انبار' : 'Warehouse',
      product: fa ? 'کالا' : 'Product',
      unit: fa ? 'واحد' : 'Unit',
      noWarehouse: fa ? 'هیچ انباری فعال نیست' : 'No active warehouse',
      selectUnitHint: fa
        ? 'واحدی را که کالا با آن وارد می‌شود مشخص کنید'
        : 'Choose the entry unit',
      change: fa ? 'تغییر' : 'Change',
      manager: fa ? 'مسئول' : 'Manager',
      remaining: fa ? 'باقیمانده' : 'Remainder',
      noUnits: fa
        ? 'برای این کالا واحدی تعریف نشده است'
        : 'No units defined for this product',
      submitting: fa ? 'در حال ثبت...' : 'Saving...',
      level: fa ? 'سطح' : 'Level',
      eachEquals: fa ? 'هر' : 'each',
      equalsOne: fa ? 'برابر ۱' : '= 1',
      children: fa ? 'زیرمجموعه' : 'children',
    }),
    [fa]
  )

  useEffect(() => {
    if (initialLoadDone.current) return
    initialLoadDone.current = true
    ;(async () => {
      setBooting(true)
      try {
        await Promise.all([loadWarehouses(), loadProducts(), loadUnits()])
      } catch (e) {
        setError(fa ? 'خطا در بارگذاری اطلاعات اولیه' : 'Failed to load data')
      } finally {
        setBooting(false)
      }
    })()
  }, [loadWarehouses, loadProducts, loadUnits, fa])

  const warehouses = useMemo(
    () => (state.warehouses || []).filter((w) => w.is_active !== false),
    [state.warehouses]
  )

  const filteredProducts = useMemo(() => {
    const list = (state.products || []).filter((p) => p.is_active !== false)
    const q = searchTerm.trim().toLowerCase()
    if (!q) return list.slice(0, 40)
    return list
      .filter(
        (p) =>
          p.title?.toLowerCase().includes(q) ||
          p.code?.toLowerCase().includes(q)
      )
      .slice(0, 40)
  }, [searchTerm, state.products])

  const getUnitChildren = useCallback(
    (unitId) =>
      (state.units || []).filter((u) => u.parent === unitId && u.is_active !== false),
    [state.units]
  )

  const getAllUnitsInHierarchy = useCallback(() => {
    if (!selectedProduct) return []
    const productRoot = state.units?.find((u) => u.id === selectedProduct.root_unit)
    if (!productRoot) return []
    const allUnits = []
    const visited = new Set()
    const traverse = (unit) => {
      if (!unit || visited.has(unit.id)) return
      visited.add(unit.id)
      allUnits.push(unit)
      getUnitChildren(unit.id).forEach(traverse)
    }
    traverse(productRoot)
    return allUnits
  }, [selectedProduct, state.units, getUnitChildren])

  const getUnitPath = useCallback(
    (unit) => {
      if (!unit) return []
      const path = []
      let current = unit
      while (current) {
        path.unshift(current)
        current = current.parent
          ? state.units?.find((u) => u.id === current.parent)
          : null
      }
      return path
    },
    [state.units]
  )

  const previewData = useMemo(() => {
    if (!selectedUnit || !quantity || !selectedProduct) return null
    const qty = parseInt(quantity, 10)
    if (isNaN(qty) || qty < 1) return null
    const productRoot = state.units?.find((u) => u.id === selectedProduct.root_unit)
    if (!productRoot) return null

    const factorToRoot = (unit) => {
      let f = 1
      let cur = unit
      while (cur && cur.id !== productRoot.id) {
        f *= cur.count_in_parent || 1
        cur = cur.parent
          ? state.units?.find((u) => u.id === cur.parent)
          : null
      }
      return f || 1
    }

    const selectedFactor = factorToRoot(selectedUnit)
    const packsFromThisQty =
      selectedUnit.id === productRoot.id
        ? qty
        : Math.floor(qty / selectedFactor)
    const leftoverAtSelected =
      selectedUnit.id === productRoot.id
        ? 0
        : qty % selectedFactor

    const breakdown = [
      {
        unit: selectedUnit,
        quantity: qty,
        remaining: 0,
        isRoot: selectedUnit.id === productRoot.id,
        isSelected: true,
      },
    ]
    let walkUnit = selectedUnit
    let walkQty = qty
    while (true) {
      const child = getUnitChildren(walkUnit.id)?.[0]
      if (!child) break
      const cip = child.count_in_parent || 1
      walkQty *= cip
      breakdown.push({
        unit: child,
        quantity: walkQty,
        remaining: 0,
        isRoot: false,
        isSelected: false,
      })
      walkUnit = child
    }

    return {
      breakdown,
      rootUnit: productRoot,
      rootQuantity: packsFromThisQty,
      leftoverAtSelected,
      isRootSelected: selectedUnit.id === productRoot.id,
    }
  }, [
    selectedUnit,
    quantity,
    selectedProduct,
    state.units,
    getUnitChildren,
  ])

  // هنگام ورود به مرحله ۳ همه واحدها را باز کن
  useEffect(() => {
    if (step !== 3 || !selectedProduct) return
    const all = getAllUnitsInHierarchy()
    const next = {}
    all.forEach((u) => {
      if (getUnitChildren(u.id).length) next[u.id] = true
    })
    setExpandedUnits(next)
  }, [step, selectedProduct, getAllUnitsInHierarchy, getUnitChildren])

  useEffect(() => {
    if (step === 2) {
      const id = setTimeout(() => searchRef.current?.focus(), 80)
      return () => clearTimeout(id)
    }
  }, [step])

  const handleWarehouseSelect = (warehouse) => {
    setSelectedWarehouse(warehouse)
    setError(null)
    setStep(2)
  }

  const handleProductSelect = (product) => {
    setSelectedProduct(product)
    setSelectedUnit(null)
    setQuantity('')
    setSearchTerm('')
    setError(null)
    setStep(3)
  }

  const handleUnitSelect = (unit) => {
    setSelectedUnit(unit)
    if (!quantity) setQuantity('1')
  }

  const toggleExpand = (unitId) => {
    setExpandedUnits((prev) => ({ ...prev, [unitId]: !prev[unitId] }))
  }

  const resetForm = () => {
    setSelectedProduct(null)
    setSelectedWarehouse(null)
    setSelectedUnit(null)
    setQuantity('')
    setDescription('')
    setSearchTerm('')
    setExpandedUnits({})
    setStep(1)
    setError(null)
    setSuccess(null)
    setShowConfirm(false)
  }

  const doSubmit = async () => {
    const qty = parseInt(quantity, 10)
    setIsLoading(true)
    setError(null)
    setSuccess(null)
    setShowConfirm(false)
    try {
      const result = await receiveWithUnit({
        product_id: selectedProduct.id,
        warehouse_id: selectedWarehouse.id,
        unit_id: selectedUnit.id,
        quantity: qty,
        description: description || '',
      })
      if (result?.status === 'success' || result?.success || result?.id) {
        const msg =
          result?.message ||
          t.successMessage
        setSuccess(msg)
        showToast(msg, 'success')
        setTimeout(resetForm, 1800)
      } else {
        const msg = result?.message || (fa ? 'خطا در ثبت ورود' : 'Submit failed')
        setError(msg)
        showToast(msg, 'error')
      }
    } catch (err) {
      const msg = getApiErrorMessage(
        err,
        fa ? 'خطا در ثبت ورود' : 'Submit failed'
      )
      setError(msg)
      showToast(msg, 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const requestSubmit = () => {
    if (!selectedProduct || !selectedWarehouse || !selectedUnit || !quantity) {
      const msg = fa ? 'لطفاً همه فیلدهای لازم را تکمیل کنید' : 'Complete required fields'
      setError(msg)
      showToast(msg, 'error')
      return
    }
    const qty = parseInt(quantity, 10)
    if (isNaN(qty) || qty < 1) {
      const msg = fa ? 'تعداد باید عدد صحیح مثبت باشد' : 'Quantity must be a positive integer'
      setError(msg)
      showToast(msg, 'error')
      return
    }
    setShowConfirm(true)
  }

  const BackIcon = fa ? ChevronRight : ChevronLeft
  const NextIcon = fa ? ChevronLeft : ChevronRight

  const renderSteps = () => {
    const steps = [
      { n: 1, label: t.step1, icon: Warehouse },
      { n: 2, label: t.step2, icon: Package },
      { n: 3, label: t.step3, icon: Layers },
    ]
    return (
      <ol className={styles.steps} aria-label={fa ? 'مراحل ورود کالا' : 'Steps'}>
        {steps.map((s, i) => {
          const Icon = s.icon
          const done = step > s.n
          const current = step === s.n
          return (
            <li
              key={s.n}
              className={`${styles.step} ${done ? styles.stepDone : ''} ${
                current ? styles.stepCurrent : ''
              }`}
            >
              <button
                type="button"
                className={styles.stepBtn}
                disabled={s.n > step}
                onClick={() => s.n < step && setStep(s.n)}
              >
                <span className={styles.stepCircle}>
                  {done ? <Check size={16} /> : <Icon size={16} />}
                </span>
                <span className={styles.stepLabel}>{s.label}</span>
              </button>
              {i < steps.length - 1 ? <span className={styles.stepLine} /> : null}
            </li>
          )
        })}
      </ol>
    )
  }

  const SelectionChip = ({ label, value, onChange }) => (
    <div className={styles.chip}>
      <span className={styles.chipLabel}>{label}</span>
      <strong className={styles.chipValue}>{value}</strong>
      <button type="button" className={styles.chipBtn} onClick={onChange}>
        {t.change}
      </button>
    </div>
  )

  const UnitTreeItem = ({ unit, level = 0, parentTitle = null }) => {
    const children = getUnitChildren(unit.id)
    const isExpanded = !!expandedUnits[unit.id]
    const isSelected = selectedUnit?.id === unit.id
    const hasChildren = children.length > 0

    return (
      <div className={styles.treeItem}>
        <button
          type="button"
          className={`${styles.treeRow} ${isSelected ? styles.treeRowActive : ''}`}
          style={{ paddingInlineStart: `${12 + level * 18}px` }}
          onClick={() => handleUnitSelect(unit)}
        >
          <span className={styles.radio} aria-hidden>
            {isSelected ? <span className={styles.radioDot} /> : null}
          </span>
          <span className={styles.treeBody}>
            <span className={styles.treeTitle}>
              {unit.title}
              {unit.abbreviation ? (
                <em className={styles.abbr}>({unit.abbreviation})</em>
              ) : null}
            </span>
            <span className={styles.treeMeta}>
              {level === 0
                ? t.rootUnit
                : `${t.level} ${faNum(level)}${
                    unit.count_in_parent > 1
                      ? ` · ${t.eachEquals} ${faNum(unit.count_in_parent)} ${t.equalsOne} ${
                          parentTitle || ''
                        }`
                      : ''
                  }`}
              {hasChildren
                ? ` · ${faNum(children.length)} ${t.children}`
                : ''}
            </span>
          </span>
          {hasChildren ? (
            <span
              className={styles.expand}
              onClick={(e) => {
                e.stopPropagation()
                toggleExpand(unit.id)
              }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  e.stopPropagation()
                  toggleExpand(unit.id)
                }
              }}
            >
              {isExpanded ? <ChevronDown size={18} /> : <NextIcon size={18} />}
            </span>
          ) : null}
        </button>
        {hasChildren && isExpanded ? (
          <div className={styles.treeChildren}>
            {children.map((child) => (
              <UnitTreeItem
                key={child.id}
                unit={child}
                level={level + 1}
                parentTitle={unit.title}
              />
            ))}
          </div>
        ) : null}
      </div>
    )
  }

  const renderWarehouseStep = () => (
    <section className={styles.panel}>
      <header className={styles.panelHead}>
        <Warehouse size={22} />
        <div>
          <h2>{t.selectWarehouse}</h2>
          <p>{t.step1}</p>
        </div>
      </header>

      {warehouses.length === 0 ? (
        <div className={styles.empty}>
          <Building2 size={40} />
          <p>{t.noWarehouse}</p>
        </div>
      ) : (
        <div className={styles.warehouseGrid}>
          {warehouses.map((w) => {
            const active = selectedWarehouse?.id === w.id
            return (
              <button
                key={w.id}
                type="button"
                className={`${styles.warehouseCard} ${
                  active ? styles.warehouseCardActive : ''
                }`}
                onClick={() => handleWarehouseSelect(w)}
              >
                <span className={styles.whIcon}>
                  <Building2 size={22} />
                </span>
                <span className={styles.whTitle}>{w.title}</span>
                {w.manager ? (
                  <span className={styles.whMeta}>
                    <User size={13} /> {w.manager}
                  </span>
                ) : null}
                {w.address ? (
                  <span className={styles.whMeta}>
                    <MapPin size={13} /> {w.address}
                  </span>
                ) : null}
                {w.phone ? (
                  <span className={styles.whMeta} dir="ltr">
                    <Phone size={13} /> {w.phone}
                  </span>
                ) : null}
                {active ? (
                  <span className={styles.whCheck}>
                    <CheckCircle size={20} />
                  </span>
                ) : null}
              </button>
            )
          })}
        </div>
      )}

      <div className={styles.actions}>
        <button
          type="button"
          className={styles.primaryBtn}
          disabled={!selectedWarehouse}
          onClick={() => setStep(2)}
        >
          {t.next}
          <NextIcon size={18} />
        </button>
      </div>
    </section>
  )

  const renderProductStep = () => (
    <section className={styles.panel}>
      <header className={styles.panelHead}>
        <Package size={22} />
        <div>
          <h2>{t.selectProduct}</h2>
          <p>{searchTerm ? t.searchProduct : t.browseProducts}</p>
        </div>
      </header>

      {selectedWarehouse ? (
        <SelectionChip
          label={t.warehouse}
          value={selectedWarehouse.title}
          onChange={() => setStep(1)}
        />
      ) : null}

      <div className={styles.searchBox}>
        <Search size={18} className={styles.searchIcon} />
        <input
          ref={searchRef}
          type="search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={t.searchProduct}
          className={styles.searchInput}
          autoComplete="off"
        />
        {searchTerm ? (
          <button
            type="button"
            className={styles.clearSearch}
            onClick={() => setSearchTerm('')}
            aria-label={fa ? 'پاک کردن' : 'Clear'}
          >
            <X size={16} />
          </button>
        ) : null}
      </div>

      <div className={styles.productList}>
        {filteredProducts.length === 0 ? (
          <div className={styles.empty}>
            <Package size={36} />
            <p>{t.noProductFound}</p>
          </div>
        ) : (
          filteredProducts.map((p) => {
            const root = state.units?.find((u) => u.id === p.root_unit)
            const active = selectedProduct?.id === p.id
            return (
              <button
                key={p.id}
                type="button"
                className={`${styles.productRow} ${
                  active ? styles.productRowActive : ''
                }`}
                onClick={() => handleProductSelect(p)}
              >
                <span className={styles.productIcon}>
                  <Package size={18} />
                </span>
                <span className={styles.productInfo}>
                  <strong>{p.title}</strong>
                  <span>
                    {p.code ? `${p.code}` : ''}
                    {root ? ` · ${root.title}` : ''}
                  </span>
                </span>
                {active ? <CheckCircle size={18} className={styles.ok} /> : null}
              </button>
            )
          })
        )}
      </div>

      <div className={styles.actions}>
        <button type="button" className={styles.ghostBtn} onClick={() => setStep(1)}>
          <BackIcon size={18} />
          {t.back}
        </button>
        <button
          type="button"
          className={styles.primaryBtn}
          disabled={!selectedProduct}
          onClick={() => setStep(3)}
        >
          {t.next}
          <NextIcon size={18} />
        </button>
      </div>
    </section>
  )

  const renderUnitStep = () => {
    const productRoot = state.units?.find(
      (u) => u.id === selectedProduct?.root_unit
    )
    const qty = parseInt(quantity, 10) || 0

    return (
      <section className={styles.panel}>
        <header className={styles.panelHead}>
          <Layers size={22} />
          <div>
            <h2>{t.selectUnit}</h2>
            <p>{t.selectUnitHint}</p>
          </div>
        </header>

        <div className={styles.chipRow}>
          {selectedWarehouse ? (
            <SelectionChip
              label={t.warehouse}
              value={selectedWarehouse.title}
              onChange={() => setStep(1)}
            />
          ) : null}
          {selectedProduct ? (
            <SelectionChip
              label={t.product}
              value={selectedProduct.title}
              onChange={() => setStep(2)}
            />
          ) : null}
        </div>

        <div className={styles.unitBox}>
          <div className={styles.unitBoxHead}>
            <GitBranch size={16} />
            <span>{t.unit}</span>
          </div>
          {!productRoot ? (
            <div className={styles.empty}>
              <AlertCircle size={32} />
              <p>{t.noUnits}</p>
            </div>
          ) : (
            <UnitTreeItem unit={productRoot} level={0} />
          )}
        </div>

        {selectedUnit ? (
          <div className={styles.qtyBlock}>
            <label className={styles.qtyLabel}>
              {t.enterQuantity}
              <span>
                {selectedUnit.abbreviation || selectedUnit.title}
              </span>
            </label>
            <div className={styles.qtyControls}>
              <button
                type="button"
                className={styles.qtyBtn}
                onClick={() =>
                  setQuantity(String(Math.max(1, (parseInt(quantity, 10) || 1) - 1)))
                }
                aria-label={fa ? 'کم کردن' : 'Decrease'}
              >
                <Minus size={18} />
              </button>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={quantity}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^\d]/g, '')
                  setQuantity(val)
                }}
                placeholder={t.quantityPlaceholder}
                className={styles.qtyInput}
                dir="ltr"
              />
              <button
                type="button"
                className={styles.qtyBtn}
                onClick={() =>
                  setQuantity(String((parseInt(quantity, 10) || 0) + 1))
                }
                aria-label={fa ? 'اضافه کردن' : 'Increase'}
              >
                <Plus size={18} />
              </button>
            </div>

            {previewData && qty > 0 ? (
              <div className={styles.preview}>
                <div className={styles.previewHead}>
                  <Calculator size={16} />
                  {t.preview}
                </div>
                {previewData.breakdown.length > 1 ? (
                  <>
                    <div className={styles.previewSubhead}>{t.equivDown}</div>
                    <ul className={styles.previewList}>
                      {previewData.breakdown.map((item) => (
                        <li
                          key={item.unit.id}
                          className={`${styles.previewItem} ${
                            item.isSelected ? styles.previewItemActive : ''
                          }`}
                        >
                          <span>
                            {item.unit.title}
                            {item.isSelected ? (
                              <em> · {t.selected}</em>
                            ) : null}
                          </span>
                          <strong dir="ltr">
                            {faNum(item.quantity)}
                            {item.unit.abbreviation
                              ? ` ${item.unit.abbreviation}`
                              : ''}
                          </strong>
                        </li>
                      ))}
                    </ul>
                  </>
                ) : null}
                <div className={styles.previewTotal}>
                  <span>{t.totalInRoot}</span>
                  <strong dir="ltr">
                    {faNum(previewData.rootQuantity)}{' '}
                    {previewData.rootUnit?.abbreviation ||
                      previewData.rootUnit?.title}
                  </strong>
                </div>
                {!previewData.isRootSelected &&
                previewData.leftoverAtSelected > 0 ? (
                  <div className={styles.previewTotal}>
                    <span>
                      {t.leftoverBuffer} ({selectedUnit?.title})
                    </span>
                    <strong dir="ltr">
                      {faNum(previewData.leftoverAtSelected)}
                    </strong>
                  </div>
                ) : null}
                {!previewData.isRootSelected ? (
                  <div className={styles.previewSubhead}>{t.packNote}</div>
                ) : null}
              </div>
            ) : null}

            <textarea
              className={styles.notes}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t.description}
              rows={3}
            />
          </div>
        ) : null}

        <div className={styles.actions}>
          <button type="button" className={styles.ghostBtn} onClick={() => setStep(2)}>
            <BackIcon size={18} />
            {t.back}
          </button>
          <button type="button" className={styles.mutedBtn} onClick={resetForm}>
            <RefreshCw size={16} />
            {t.reset}
          </button>
          <button
            type="button"
            className={styles.primaryBtn}
            onClick={requestSubmit}
            disabled={
              isLoading || !selectedUnit || !quantity || parseInt(quantity, 10) < 1
            }
          >
            {isLoading ? (
              <>
                <RefreshCw size={18} className={styles.spin} />
                {t.submitting}
              </>
            ) : (
              <>
                <Check size={18} />
                {t.submit}
              </>
            )}
          </button>
        </div>
      </section>
    )
  }

  if (booting) {
    return (
      <div className={styles.page} dir={dir}>
        <div className={styles.boot}>
          <RefreshCw size={28} className={styles.spin} />
          <p>{t.loading}</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page} dir={dir}>
      <InventoryToast toast={toast} onClose={clearToast} />
      <header className={styles.header}>
        <div>
          <h1>
            <ArrowDownToLine size={24} />
            {t.title}
          </h1>
          <p>{t.subtitle}</p>
        </div>
        <button
          type="button"
          className={styles.refreshBtn}
          onClick={async () => {
            setBooting(true)
            try {
              await Promise.all([loadWarehouses(), loadProducts(), loadUnits()])
            } finally {
              setBooting(false)
            }
          }}
        >
          <RefreshCw size={16} />
          {t.refresh}
        </button>
      </header>

      {error ? (
        <div className={styles.alertError} role="alert">
          <AlertCircle size={18} />
          <span>{error}</span>
          <button type="button" onClick={() => setError(null)} aria-label="close">
            <X size={16} />
          </button>
        </div>
      ) : null}
      {success ? (
        <div className={styles.alertOk} role="status">
          <CheckCircle size={18} />
          <span>{success}</span>
        </div>
      ) : null}

      {renderSteps()}

      <div className={styles.body}>
        {step === 1 && renderWarehouseStep()}
        {step === 2 && renderProductStep()}
        {step === 3 && renderUnitStep()}
      </div>

      <ConfirmDialog
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={doSubmit}
        title={t.confirmTitle}
        message={`${t.confirmSubmit}\n${t.warehouse}: ${selectedWarehouse?.title || ''} · ${t.product}: ${selectedProduct?.title || ''} · ${t.unit}: ${selectedUnit?.title || ''} · ${faNum(quantity)}`}
        confirmText={t.submit}
        loading={isLoading}
      />
    </div>
  )
}

export default StockIn
