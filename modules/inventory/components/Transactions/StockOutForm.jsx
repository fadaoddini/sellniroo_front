// modules/inventory/components/Transactions/StockOutForm.jsx

'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import styles from '@/styles/modules/InventoryCommon.module.css';
import { 
  Package, 
  Warehouse, 
  Ruler, 
  Hash, 
  FileText,
  Loader2,
  Layers,
  GitBranch,
  CheckCircle,
  AlertCircle,
  ArrowDown,
  ChevronDown,
  ChevronLeft,
  TrendingUp,
  Calculator,
  Zap,
  Info,
  User,
  Shield,
} from 'lucide-react';

const StockOutForm = ({
  onSubmit,
  onCancel,
  loading = false,
  products = [],
  warehouses = [],
  units = [],
  persons = [],
}) => {
  // ============================================
  // State
  // ============================================
  const [formData, setFormData] = useState({
    product_id: '',
    warehouse_id: '',
    unit_id: '',
    quantity: 1,
    authorized_person_id: '',
    description: '',
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [unitHierarchy, setUnitHierarchy] = useState([]);
  const [breakdown, setBreakdown] = useState(null);
  const [totalInBase, setTotalInBase] = useState(0);
  const [isLoadingBreakdown, setIsLoadingBreakdown] = useState(false);
  const [stockInfo, setStockInfo] = useState(null);
  const [isLoadingStock, setIsLoadingStock] = useState(false);

  // ============================================
  // Refs
  // ============================================
  const calculationTimeout = useRef(null);

  // ============================================
  // 🟢 تابع 1: ساخت درخت از لیست تخت units
  // ============================================
  const buildUnitTree = useCallback((flatUnits) => {
    if (!flatUnits || flatUnits.length === 0) return [];
    
    const map = {};
    const roots = [];

    flatUnits.forEach(unit => {
      map[unit.id] = { ...unit, children: [] };
    });

    flatUnits.forEach(unit => {
      let parentId = unit.parent;
      if (parentId && typeof parentId === 'object') {
        parentId = parentId.id;
      }
      if (parentId && map[parentId]) {
        map[parentId].children.push(map[unit.id]);
      } else {
        roots.push(map[unit.id]);
      }
    });

    roots.sort((a, b) => a.title.localeCompare(b.title));
    Object.values(map).forEach(item => {
      if (item.children && item.children.length > 0) {
        item.children.sort((a, b) => a.title.localeCompare(b.title));
      }
    });

    return roots;
  }, []);

  // ============================================
  // 🟢 تابع 2: پیدا کردن یک واحد در درخت
  // ============================================
  const findUnitInTree = useCallback((unitId, treeNodes) => {
    for (const node of treeNodes) {
      if (node.id === unitId) return node;
      if (node.children && node.children.length > 0) {
        const found = findUnitInTree(unitId, node.children);
        if (found) return found;
      }
    }
    return null;
  }, []);

  // ============================================
  // 🟢 تابع 3: جمع‌آوری مسیر از ریشه تا یک واحد خاص
  // ============================================
  const collectPath = useCallback((node, targetId, path = []) => {
    if (!node) return null;
    const currentPath = [...path, node];
    if (node.id === targetId) return currentPath;
    if (node.children) {
      for (const child of node.children) {
        const result = collectPath(child, targetId, currentPath);
        if (result) return result;
      }
    }
    return null;
  }, []);

  // ============================================
  // 🟢 تابع 4: جمع‌آوری تمام واحدهای یک محصول
  // ============================================
  const getAllUnitsForProduct = useCallback((product) => {
    if (!product || !product.base_unit) return [];

    const tree = buildUnitTree(units);
    if (tree.length === 0) return [];

    const baseUnitNode = findUnitInTree(product.base_unit, tree);
    if (!baseUnitNode) return [];

    const rootNode = tree[0];
    if (!rootNode) return [];

    const path = collectPath(rootNode, product.base_unit);
    if (!path || path.length === 0) return [];

    return path.map((node, index) => ({
      ...node,
      level: index,
      levelIndex: index,
      isBase: index === path.length - 1,
      isRoot: index === 0,
      path: path.slice(0, index + 1).map(u => u.title),
      hasChildren: node.children && node.children.length > 0,
      childrenCount: node.children?.length || 0,
      isLeaf: !node.children || node.children.length === 0,
      countInParent: node.count_in_parent || 1,
    }));
  }, [units, buildUnitTree, findUnitInTree, collectPath]);

  // ============================================
  // 🟢 تابع 5: محاسبه تعداد کل در واحد پایه - نسخه اصلاح شده ✅
  // ============================================
  const calculateTotalInBase = useCallback((unit, quantity) => {
    if (!unit) return quantity;
    
    let total = quantity;
    let currentUnit = unit;
    let depth = 0;
    const maxDepth = 10;
    
    console.log('🔍 محاسبه از واحد:', currentUnit?.title, 'با تعداد:', quantity);
    console.log('🔍 count_in_parent:', currentUnit?.count_in_parent);
    
    while (currentUnit && depth < maxDepth) {
      const hasChildren = currentUnit.children && 
                          Array.isArray(currentUnit.children) && 
                          currentUnit.children.length > 0;
      
      if (hasChildren) {
        const child = currentUnit.children[0];
        
        // ✅ اصلاح کلیدی: count_in_parent را از خود currentUnit بگیر
        // چون currentUnit همان واحد والد است و count_in_parent آن نشان می‌دهد
        // که هر 1 واحد از currentUnit چند واحد از child را شامل می‌شود
        const multiplier = currentUnit.count_in_parent || 1;
        console.log(`  📦 ${currentUnit.title} → ${child.title}: ×${multiplier}`);
        total = total * multiplier;
        currentUnit = child;
      } else {
        console.log('  📌 رسیدیم به پایین‌ترین سطح:', currentUnit.title);
        break;
      }
      depth++;
    }
    
    console.log('✅ نتیجه نهایی:', total);
    return total;
  }, []);

  // ============================================
  // 🟢 تابع 6: محاسبه تفکیک کامل
  // ============================================
  const calculateFullBreakdown = useCallback((unit, quantity) => {
    if (!unit || !selectedProduct) return null;

    const tree = buildUnitTree(units);
    if (tree.length === 0) return null;

    const rootNode = tree[0];
    if (!rootNode) return null;

    const baseUnitNode = findUnitInTree(selectedProduct.base_unit, tree);
    if (!baseUnitNode) return null;

    const fullPath = collectPath(rootNode, selectedProduct.base_unit);
    if (!fullPath || fullPath.length === 0) return null;

    const unitIndex = fullPath.findIndex(u => u.id === unit.id);
    if (unitIndex === -1) return null;

    const totalInBase = calculateTotalInBase(unit, quantity);

    const tempBreakdown = [];
    let remaining = totalInBase;
    
    for (let i = fullPath.length - 1; i >= 0; i--) {
      const currentUnit = fullPath[i];
      const isBase = i === fullPath.length - 1;
      const isSelected = i === unitIndex;
      const isRoot = i === 0;
      
      let displayQuantity = 0;
      let remainder = 0;
      
      if (isBase) {
        displayQuantity = remaining;
      } else {
        const countInParent = currentUnit.count_in_parent || 1;
        displayQuantity = Math.floor(remaining / countInParent);
        remainder = remaining % countInParent;
        remaining = displayQuantity;
      }
      
      tempBreakdown.push({
        id: currentUnit.id,
        title: currentUnit.title,
        abbreviation: currentUnit.abbreviation || '',
        quantity: displayQuantity,
        remainder: remainder,
        level: i,
        levelIndex: i,
        isBase: isBase,
        isSelected: isSelected,
        isRoot: isRoot,
        countInParent: currentUnit.count_in_parent || 1,
        description: currentUnit.description || '',
        path: fullPath.slice(0, i + 1).map(u => u.title),
        hasChildren: currentUnit.children && currentUnit.children.length > 0,
        childrenCount: currentUnit.children?.length || 0,
        hasRemainder: remainder > 0,
        hasValue: displayQuantity > 0 || remainder > 0,
      });
    }
    
    const breakdown = tempBreakdown.reverse();

    let lastLevelWithValue = -1;
    for (let i = breakdown.length - 1; i >= 0; i--) {
      if (breakdown[i].hasValue) {
        lastLevelWithValue = i;
        break;
      }
    }
    
    if (lastLevelWithValue >= 0) {
      breakdown[lastLevelWithValue].isLastLevelWithValue = true;
    }

    return {
      breakdown: breakdown,
      totalInBase: totalInBase,
      selectedUnit: unit,
      quantity: quantity,
      baseUnit: baseUnitNode,
      allUnits: fullPath,
      unitIndex: unitIndex,
    };
  }, [units, selectedProduct, buildUnitTree, findUnitInTree, collectPath, calculateTotalInBase]);

  // ============================================
  // 🟢 تابع 7: بررسی موجودی کافی در انبار خاص
  // ============================================
  const checkStockAvailability = useCallback(async (productId, warehouseId, unitId, quantity) => {
    if (!productId || !warehouseId || !unitId || !quantity) return null;
    
    setIsLoadingStock(true);
    try {
      const tree = buildUnitTree(units);
      const unitNode = findUnitInTree(parseInt(unitId), tree);
      if (!unitNode) return null;
      
      const totalInBase = calculateTotalInBase(unitNode, quantity);
      
      const product = products.find(p => p.id === parseInt(productId));
      const currentStock = product?.total_stock || 0;
      
      return {
        available: currentStock >= totalInBase,
        currentStock: currentStock,
        needed: totalInBase,
        difference: currentStock - totalInBase,
        totalInBase: totalInBase,
      };
    } catch (error) {
      console.error('Error checking stock:', error);
      return null;
    } finally {
      setIsLoadingStock(false);
    }
  }, [units, products, buildUnitTree, findUnitInTree, calculateTotalInBase]);

  // ============================================
  // Effects - محاسبه تفکیک لحظه‌ای
  // ============================================
  useEffect(() => {
    if (calculationTimeout.current) {
      clearTimeout(calculationTimeout.current);
    }

    if (!formData.unit_id || !formData.quantity || formData.quantity < 1 || !selectedProduct) {
      setBreakdown(null);
      setTotalInBase(0);
      setUnitHierarchy([]);
      setStockInfo(null);
      return;
    }

    calculationTimeout.current = setTimeout(async () => {
      setIsLoadingBreakdown(true);
      try {
        const tree = buildUnitTree(units);
        const unitNode = findUnitInTree(parseInt(formData.unit_id), tree);
        
        if (!unitNode) {
          setBreakdown(null);
          setTotalInBase(0);
          return;
        }

        setSelectedUnit(unitNode);

        const result = calculateFullBreakdown(unitNode, parseInt(formData.quantity));
        if (result) {
          setBreakdown(result.breakdown);
          setTotalInBase(result.totalInBase);
          setUnitHierarchy(result.allUnits);
          
          if (formData.product_id && formData.warehouse_id) {
            const stockCheck = await checkStockAvailability(
              formData.product_id,
              formData.warehouse_id,
              formData.unit_id,
              parseInt(formData.quantity)
            );
            setStockInfo(stockCheck);
          }
        }
      } catch (error) {
        console.error('Error calculating breakdown:', error);
        setBreakdown(null);
        setTotalInBase(0);
      } finally {
        setIsLoadingBreakdown(false);
      }
    }, 300);

    return () => {
      if (calculationTimeout.current) {
        clearTimeout(calculationTimeout.current);
      }
    };
  }, [formData.unit_id, formData.quantity, formData.product_id, formData.warehouse_id, selectedProduct, units, buildUnitTree, findUnitInTree, calculateFullBreakdown, checkStockAvailability]);

  // ============================================
  // وقتی محصول عوض می‌شود
  // ============================================
  useEffect(() => {
    if (formData.product_id) {
      const product = products.find(p => p.id === parseInt(formData.product_id));
      setSelectedProduct(product || null);
      
      if (product?.base_unit) {
        setFormData(prev => ({ ...prev, unit_id: product.base_unit.toString() }));
      }
    } else {
      setSelectedProduct(null);
      setFormData(prev => ({ ...prev, unit_id: '' }));
      setBreakdown(null);
      setTotalInBase(0);
      setUnitHierarchy([]);
      setStockInfo(null);
    }
  }, [formData.product_id, products]);

  // ============================================
  // Handlers
  // ============================================
  const handleChange = useCallback((e) => {
    const { name, value, type } = e.target;
    const newValue = type === 'number' ? (value === '' ? '' : parseInt(value)) : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue,
    }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  }, [errors]);

  // ============================================
  // Validation
  // ============================================
  const validate = useCallback(() => {
    const newErrors = {};
    
    if (!formData.product_id) {
      newErrors.product_id = 'انتخاب کالا الزامی است';
    }
    
    if (!formData.warehouse_id) {
      newErrors.warehouse_id = 'انتخاب انبار الزامی است';
    }
    
    if (!formData.unit_id) {
      newErrors.unit_id = 'انتخاب واحد الزامی است';
    }
    
    if (!formData.quantity || formData.quantity < 1) {
      newErrors.quantity = 'تعداد باید حداقل ۱ باشد';
    }
    
    if (formData.quantity > 999999999) {
      newErrors.quantity = 'تعداد بیش از حد مجاز است';
    }
    
    if (!formData.authorized_person_id) {
      newErrors.authorized_person_id = 'انتخاب فرد مجاز الزامی است';
    }
    
    if (stockInfo && !stockInfo.available) {
      newErrors.quantity = `موجودی کافی نیست. موجودی: ${stockInfo.currentStock.toLocaleString('fa-IR')}، نیاز: ${stockInfo.needed.toLocaleString('fa-IR')}`;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, stockInfo]);

  // ============================================
  // Submit
  // ============================================
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (isSubmitting || loading) return;
    
    if (validate()) {
      setIsSubmitting(true);
      try {
        const dataToSubmit = {
          product_id: parseInt(formData.product_id),
          warehouse_id: parseInt(formData.warehouse_id),
          unit_id: parseInt(formData.unit_id),
          quantity: parseInt(formData.quantity),
          authorized_person_id: parseInt(formData.authorized_person_id),
          description: formData.description?.trim() || '',
        };
        
        await onSubmit(dataToSubmit);
      } catch (error) {
        console.error('Submit error:', error);
        if (error.response?.data) {
          const serverErrors = error.response.data;
          const newErrors = {};
          Object.keys(serverErrors).forEach(key => {
            newErrors[key] = serverErrors[key].join(' ');
          });
          setErrors(newErrors);
        }
      } finally {
        setIsSubmitting(false);
      }
    }
  }, [isSubmitting, loading, validate, formData, onSubmit]);

  // ============================================
  // Get Available Units for Product
  // ============================================
  const availableUnits = useMemo(() => {
    if (!selectedProduct) return [];
    const allUnits = getAllUnitsForProduct(selectedProduct);
    return allUnits.sort((a, b) => a.level - b.level);
  }, [selectedProduct, getAllUnitsForProduct]);

  // ============================================
  // Format Number
  // ============================================
  const formatNumber = useCallback((num) => {
    if (num === undefined || num === null) return '0';
    return num.toLocaleString('fa-IR');
  }, []);

  // ============================================
  // Render Breakdown Item
  // ============================================
  const renderBreakdownItem = useCallback((item, index, breakdownArray) => {
    const isLast = index === breakdownArray.length - 1;
    const isBase = item.isBase;
    const isSelected = item.isSelected;
    const isRoot = item.isRoot;
    const hasRemainder = item.hasRemainder;
    const displayQuantity = item.quantity || 0;
    const remainder = item.remainder || 0;
    const isLastWithValue = item.isLastLevelWithValue;
    
    let levelIcon = '';
    let levelClass = '';
    let levelLabel = '';
    
    if (isRoot) {
      levelIcon = '🏁';
      levelClass = styles.levelRoot;
      levelLabel = 'بالاترین سطح';
    } else if (isBase) {
      levelIcon = '🏛️';
      levelClass = styles.levelBase;
      levelLabel = 'پایه (جزئی‌ترین)';
    } else {
      levelIcon = '📦';
      levelClass = styles.levelMiddle;
      levelLabel = `سطح ${item.level}`;
    }
    
    const hasValue = displayQuantity > 0 || hasRemainder;
    
    return (
      <div 
        key={item.id || index} 
        className={`${styles.breakdownItem} 
          ${isSelected ? styles.breakdownSelected : ''} 
          ${levelClass}
          ${!hasValue ? styles.noValue : ''}
          ${isLastWithValue ? styles.lastWithValue : ''}`}
        style={{ marginRight: `${(item.level || 0) * 24}px` }}
      >
        <div className={styles.breakdownLevelBadge}>
          {levelIcon}
          <span>{levelLabel}</span>
          {isSelected && <span className={styles.selectedBadge}>✅</span>}
        </div>
        
        <div className={styles.breakdownInfo}>
          <span className={styles.breakdownName}>
            {item.title}
            {item.abbreviation && (
              <span className={styles.breakdownAbbr}>({item.abbreviation})</span>
            )}
            {item.countInParent > 1 && !isBase && !isRoot && (
              <span className={styles.breakdownCountInfo}>
                هر ۱ = {item.countInParent} در {breakdownArray[index - 1]?.title || 'واحد بالاتر'}
              </span>
            )}
            {isLastWithValue && (
              <span className={styles.lastValueBadge}>🔽 آخرین سطح با مقدار</span>
            )}
          </span>
          {item.description && (
            <span className={styles.breakdownDesc}>{item.description}</span>
          )}
        </div>
        
        <div className={styles.breakdownQuantityGroup}>
          {hasValue ? (
            <>
              {displayQuantity > 0 && (
                <span className={styles.breakdownQuantity}>
                  {formatNumber(displayQuantity)}
                </span>
              )}
              {hasRemainder && (
                <span className={styles.breakdownRemainder}>
                  + {formatNumber(remainder)} باقیمانده
                </span>
              )}
              {displayQuantity === 0 && hasRemainder && (
                <span className={styles.breakdownOnlyRemainder}>
                  فقط {formatNumber(remainder)}
                </span>
              )}
            </>
          ) : (
            <span className={styles.breakdownEmptyQuantity}>—</span>
          )}
          <span className={styles.breakdownUnit}>
            {item.abbreviation || item.title}
          </span>
        </div>
        
        {!isLast && (
          <div className={styles.breakdownArrow}>
            <ChevronDown size={16} />
          </div>
        )}
      </div>
    );
  }, [formatNumber]);

  // ============================================
  // Render
  // ============================================
  const isDisabled = loading || isSubmitting;

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.formGrid}>
        
        {/* ===== کالا ===== */}
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>
            <Package size={16} />
            کالا <span className={styles.required}>*</span>
          </label>
          <select
            name="product_id"
            value={formData.product_id}
            onChange={handleChange}
            className={`${styles.formSelect} ${errors.product_id ? styles.error : ''}`}
            disabled={isDisabled}
          >
            <option value="">انتخاب کالا...</option>
            {products.map(product => (
              <option key={product.id} value={product.id}>
                {product.code} - {product.title}
              </option>
            ))}
          </select>
          {errors.product_id && <span className={styles.errorText}>⚠️ {errors.product_id}</span>}
          {selectedProduct && (
            <small className={styles.fieldHelp}>
              ✅ واحد پایه: {selectedProduct.base_unit_title || 'تعریف نشده'}
            </small>
          )}
        </div>

        {/* ===== انبار ===== */}
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>
            <Warehouse size={16} />
            انبار <span className={styles.required}>*</span>
          </label>
          <select
            name="warehouse_id"
            value={formData.warehouse_id}
            onChange={handleChange}
            className={`${styles.formSelect} ${errors.warehouse_id ? styles.error : ''}`}
            disabled={isDisabled}
          >
            <option value="">انتخاب انبار...</option>
            {warehouses.map(warehouse => (
              <option key={warehouse.id} value={warehouse.id}>
                {warehouse.title}
              </option>
            ))}
          </select>
          {errors.warehouse_id && <span className={styles.errorText}>⚠️ {errors.warehouse_id}</span>}
        </div>

        {/* ===== واحد ===== */}
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>
            <Ruler size={16} />
            واحد خروجی <span className={styles.required}>*</span>
          </label>
          <select
            name="unit_id"
            value={formData.unit_id}
            onChange={handleChange}
            className={`${styles.formSelect} ${errors.unit_id ? styles.error : ''}`}
            disabled={isDisabled || !selectedProduct}
          >
            <option value="">
              {selectedProduct ? 'انتخاب واحد خروجی...' : 'ابتدا کالا را انتخاب کنید'}
            </option>
            {availableUnits.map(unit => {
              const prefix = '— '.repeat(unit.level || 0);
              let levelLabel = '';
              if (unit.isRoot) {
                levelLabel = ' (🏁 بالاترین سطح)';
              } else if (unit.isBase) {
                levelLabel = ' (🏛️ پایه - جزئی‌ترین)';
              } else {
                levelLabel = ` (📦 سطح ${unit.level})`;
              }
              const hasChildren = unit.hasChildren ? ' 🔸' : ' 🔹';
              
              return (
                <option key={unit.id} value={unit.id}>
                  {prefix}{unit.title} {unit.abbreviation ? `(${unit.abbreviation})` : ''}{levelLabel}{hasChildren}
                </option>
              );
            })}
          </select>
          {errors.unit_id && <span className={styles.errorText}>⚠️ {errors.unit_id}</span>}
          {selectedUnit && (
            <small className={styles.fieldHelp}>
              <div>
                <span style={{ color: '#1976d2' }}>
                  📍 مسیر: {selectedUnit.path?.join(' → ')}
                </span>
              </div>
              <div>
                <span style={{ color: '#388e3c' }}>
                  ✅ {selectedUnit.isRoot ? 'بالاترین سطح' : 
                     selectedUnit.isBase ? 'واحد پایه (جزئی‌ترین)' : 
                     `سطح ${selectedUnit.level}`}
                  {selectedUnit.hasChildren && ` (${selectedUnit.childrenCount} زیرمجموعه)`}
                </span>
              </div>
            </small>
          )}
        </div>

        {/* ===== تعداد ===== */}
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>
            <Hash size={16} />
            تعداد خروجی <span className={styles.required}>*</span>
          </label>
          <input
            type="number"
            name="quantity"
            value={formData.quantity}
            onChange={handleChange}
            className={`${styles.formInput} ${errors.quantity ? styles.error : ''}`}
            placeholder="تعداد را وارد کنید"
            min="1"
            max="999999999"
            disabled={isDisabled || !formData.unit_id}
          />
          {errors.quantity && <span className={styles.errorText}>⚠️ {errors.quantity}</span>}
          {selectedUnit && formData.quantity > 0 && (
            <small className={styles.fieldHelp}>
              <Zap size={12} style={{ color: '#f57c00' }} />
              {formatNumber(formData.quantity)} {selectedUnit.abbreviation || selectedUnit.title}
              {totalInBase > 0 && (
                <> = <strong style={{ color: '#c62828' }}>{formatNumber(totalInBase)}</strong> {selectedProduct?.base_unit_title || 'واحد پایه'}</>
              )}
            </small>
          )}
          {stockInfo && (
            <small className={`${styles.fieldHelp} ${!stockInfo.available ? styles.errorText : ''}`}>
              {stockInfo.available ? (
                <span style={{ color: '#2e7d32' }}>
                  ✅ موجودی کافی: {formatNumber(stockInfo.currentStock)} {selectedProduct?.base_unit_title || 'واحد'}
                  {' '}(باقیمانده: {formatNumber(stockInfo.difference)})
                </span>
              ) : (
                <span style={{ color: '#c62828' }}>
                  ❌ موجودی کافی نیست. موجودی: {formatNumber(stockInfo.currentStock)}، نیاز: {formatNumber(stockInfo.needed)}
                </span>
              )}
            </small>
          )}
        </div>

        {/* ===== فرد مجاز ===== */}
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>
            <Shield size={16} />
            فرد مجاز <span className={styles.required}>*</span>
          </label>
          <select
            name="authorized_person_id"
            value={formData.authorized_person_id}
            onChange={handleChange}
            className={`${styles.formSelect} ${errors.authorized_person_id ? styles.error : ''}`}
            disabled={isDisabled}
          >
            <option value="">انتخاب فرد مجاز...</option>
            {persons.map(person => (
              <option key={person.id} value={person.id}>
                {person.full_name} - {person.position}
              </option>
            ))}
          </select>
          {errors.authorized_person_id && <span className={styles.errorText}>⚠️ {errors.authorized_person_id}</span>}
        </div>

        {/* ===== تفکیک کامل ===== */}
        {isLoadingBreakdown && (
          <div className={`${styles.formGroup} ${styles.fullWidth}`}>
            <div className={styles.breakdownLoading}>
              <Loader2 size={20} className={styles.spinning} />
              <span>در حال محاسبه تفکیک...</span>
            </div>
          </div>
        )}

        {breakdown && breakdown.length > 0 && !isLoadingBreakdown && (
          <div className={`${styles.formGroup} ${styles.fullWidth}`}>
            <div className={styles.breakdownBox}>
              <div className={styles.breakdownHeader}>
                <GitBranch size={18} />
                <span>تفکیک کامل خروجی</span>
                <span className={styles.breakdownBadge}>
                  <Calculator size={14} />
                  {breakdown.length} سطح
                </span>
                <span className={styles.breakdownBadge}>
                  <TrendingUp size={14} />
                  {formatNumber(totalInBase)} واحد پایه
                </span>
                <span className={styles.breakdownBadge} style={{ background: '#ffebee', color: '#c62828' }}>
                  <Info size={14} />
                  {selectedUnit?.title} × {formatNumber(formData.quantity)}
                </span>
              </div>
              
              <div className={styles.breakdownContent}>
                {/* نمایش مسیر کامل */}
                <div className={styles.breakdownPath}>
                  <span className={styles.pathLabel}>📍 مسیر کامل:</span>
                  <span className={styles.pathValue}>
                    {breakdown.map((item, index) => (
                      <React.Fragment key={item.id || index}>
                        <span className={item.isSelected ? styles.pathSelected : styles.pathItem}>
                          {item.title} 
                          {item.abbreviation && ` (${item.abbreviation})`}
                          {item.isRoot && ' 🏁'}
                          {item.isBase && ' 🏛️'}
                        </span>
                        {index < breakdown.length - 1 && (
                          <span className={styles.pathArrow}> → </span>
                        )}
                      </React.Fragment>
                    ))}
                  </span>
                </div>

                {/* آیتم‌های تفکیک */}
                {breakdown.map((item, index) => renderBreakdownItem(item, index, breakdown))}
                
                {/* جمع کل */}
                <div className={styles.breakdownTotal}>
                  <div className={styles.breakdownTotalIcon}>
                    <CheckCircle size={20} />
                  </div>
                  <div className={styles.breakdownTotalContent}>
                    <span className={styles.breakdownTotalLabel}>مجموع در واحد پایه:</span>
                    <span className={styles.breakdownTotalValue}>
                      {formatNumber(totalInBase)}
                    </span>
                    <span className={styles.breakdownTotalUnit}>
                      {selectedProduct?.base_unit_title || 'واحد'}
                    </span>
                    <span className={styles.breakdownTotalNote}>
                      ({breakdown.length} سطح)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===== توضیحات ===== */}
        <div className={`${styles.formGroup} ${styles.fullWidth}`}>
          <label className={styles.formLabel}>
            <FileText size={16} />
            توضیحات
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className={styles.formTextarea}
            placeholder="توضیحات اضافی (اختیاری)..."
            rows={2}
            disabled={isDisabled}
            maxLength={500}
          />
        </div>

        {/* ===== خلاصه خروج ===== */}
        {selectedProduct && selectedUnit && formData.quantity > 0 && totalInBase > 0 && (
          <div className={`${styles.formGroup} ${styles.fullWidth}`}>
            <div className={`${styles.summaryBox} ${stockInfo && !stockInfo.available ? styles.summaryError : ''}`}>
              <div className={styles.summaryHeader}>
                <Package size={16} />
                <span>خلاصه خروج از انبار</span>
                {stockInfo && (
                  <span className={stockInfo.available ? styles.summarySuccess : styles.summaryError}>
                    {stockInfo.available ? '✅ موجودی کافی' : '❌ موجودی ناکافی'}
                  </span>
                )}
              </div>
              <div className={styles.summaryGrid}>
                <div className={styles.summaryItem}>
                  <span className={styles.summaryLabel}>کالا:</span>
                  <span className={styles.summaryValue}>{selectedProduct.title}</span>
                  <span className={styles.summaryCode}>({selectedProduct.code})</span>
                </div>
                <div className={styles.summaryItem}>
                  <span className={styles.summaryLabel}>انبار:</span>
                  <span className={styles.summaryValue}>
                    {warehouses.find(w => w.id === parseInt(formData.warehouse_id))?.title || 'نامشخص'}
                  </span>
                </div>
                <div className={styles.summaryItem}>
                  <span className={styles.summaryLabel}>واحد خروجی:</span>
                  <span className={styles.summaryValue}>{selectedUnit.title}</span>
                  <span className={styles.summaryUnit}>({selectedUnit.abbreviation})</span>
                </div>
                <div className={styles.summaryItem}>
                  <span className={styles.summaryLabel}>تعداد خروجی:</span>
                  <span className={styles.summaryValue}>{formatNumber(formData.quantity)}</span>
                </div>
                <div className={styles.summaryItem}>
                  <span className={styles.summaryLabel}>فرد مجاز:</span>
                  <span className={styles.summaryValue}>
                    {persons.find(p => p.id === parseInt(formData.authorized_person_id))?.full_name || 'نامشخص'}
                  </span>
                </div>
                <div className={styles.summaryItem} style={{ gridColumn: '1 / -1' }}>
                  <span className={styles.summaryLabel}>معادل در واحد پایه:</span>
                  <span className={styles.summaryTotal}>{formatNumber(totalInBase)}</span>
                  <span className={styles.summaryUnit}>{selectedProduct.base_unit_title || 'واحد'}</span>
                  <span className={styles.summaryNote}>
                    (تعداد سطوح: {breakdown?.length || 0})
                  </span>
                </div>
                {stockInfo && (
                  <div className={styles.summaryItem} style={{ gridColumn: '1 / -1' }}>
                    <span className={styles.summaryLabel}>موجودی فعلی:</span>
                    <span className={`${styles.summaryValue} ${stockInfo.available ? styles.textSuccess : styles.textError}`}>
                      {formatNumber(stockInfo.currentStock)} {selectedProduct.base_unit_title || 'واحد'}
                      {stockInfo.available && ` (باقیمانده: ${formatNumber(stockInfo.difference)})`}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ===== دکمه‌های اقدام ===== */}
      <div className={styles.formActions}>
        <button
          type="button"
          onClick={onCancel}
          className={styles.secondaryBtn}
          disabled={isDisabled}
        >
          انصراف
        </button>
        <button 
          type="submit" 
          className={styles.dangerBtn}
          disabled={isDisabled || totalInBase === 0 || (stockInfo && !stockInfo.available)}
        >
          {isDisabled ? (
            <>
              <Loader2 size={18} className={styles.spinnerSmall} />
              در حال ثبت...
            </>
          ) : (
            <>
              <ArrowDown size={18} />
              ثبت خروج {formatNumber(totalInBase)} {selectedProduct?.base_unit_title || 'واحد'}
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default StockOutForm;