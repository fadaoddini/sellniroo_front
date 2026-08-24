// modules/home/components/section/ChartSection/OrganizationChartHexa.jsx

'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Building2, 
  Factory, 
  Wrench, 
  Home, 
  Zap, 
  Lightbulb,
  X,
  Settings,
  Package,
  Truck,
  Hammer,
  Ruler,
  ClipboardList,
  Building,
  Cpu,
  Eye,
  EyeOff,
  Info,
  ChevronDown,
  Link as LinkIcon,
  ExternalLink,
  Loader2,
  AlertCircle
} from 'lucide-react'
import styles from './OrganizationChartHexa.module.css'
import treeChartService from '@/services/treeChartService'

// ============================================
// نقشه آیکون‌ها با رنگ‌های شش‌ضلعی
// ============================================
const getIcon = (node) => {
  const iconMap = {
    'holding': Building2,
    'company': Factory,
    'department': Wrench,
    'company1': Building,
    'company2': Home,
    'company3': Building2,
    'company4': Factory,
    'company5': Zap,
    'dept1-1': Settings,
    'dept1-2': Hammer,
    'dept1-3': Ruler,
    'dept2-1': Package,
    'dept2-2': Wrench,
    'dept3-1': Home,
    'dept3-2': Building,
    'dept3-3': ClipboardList,
    'dept4-1': Package,
    'dept4-2': Truck,
    'dept5-1': Lightbulb,
    'dept5-2': Cpu,
  }
  
  const IconComponent = iconMap[node?.id] || iconMap[node?.type] || Building2
  return IconComponent
}

// ============================================
// کامپوننت گره شش‌ضلعی
// ============================================
const HexTreeNode = ({ 
  node, 
  level = 0,
  expandedNodes,
  onToggle,
  onSelect,
  isSelected
}) => {
  const hasChildren = node?.children && node.children.length > 0
  const IconComponent = getIcon(node)
  const isNodeExpanded = expandedNodes.has(node?.id)

  // رنگ‌های هر سطح - هماهنگ با تم شش‌ضلعی
  const getLevelColor = (lvl) => {
    const colors = {
      0: '#8b9aff',
      1: '#6c5ce7',
      2: '#a29bfe',
      3: '#fd79a8',
      4: '#fdcb6e',
      5: '#00b894',
    }
    return colors[lvl] || '#6b7280'
  }

  const getLevelBg = (lvl) => {
    const colors = {
      0: 'rgba(139, 154, 255, 0.15)',
      1: 'rgba(108, 92, 231, 0.15)',
      2: 'rgba(162, 155, 254, 0.15)',
      3: 'rgba(253, 121, 168, 0.15)',
      4: 'rgba(253, 203, 110, 0.15)',
      5: 'rgba(0, 184, 148, 0.15)',
    }
    return colors[lvl] || 'rgba(107, 114, 128, 0.1)'
  }

  const nodeColor = getLevelColor(level)
  const nodeBg = getLevelBg(level)

  if (!node) return null

  return (
    <li className={styles.hexTreeLi}>
      <div 
        className={`${styles.hexTreeNode} ${isSelected ? styles.active : ''}`}
        style={{
          borderColor: isSelected ? '#8b9aff' : nodeColor,
          background: isSelected 
            ? 'linear-gradient(135deg, rgba(139, 154, 255, 0.3), rgba(108, 92, 231, 0.2))'
            : `linear-gradient(135deg, ${nodeBg}, rgba(0,0,0,0.2))`,
          transform: isSelected ? 'scale(1.05)' : 'scale(1)',
        }}
        onClick={() => onSelect(node)}
      >
        {/* هدر شش‌ضلعی */}
        <div className={styles.hexNodeHeader}>
          <div 
            className={styles.hexNodeIcon}
            style={{ background: `linear-gradient(135deg, ${nodeColor}, ${nodeColor}dd)` }}
          >
            <IconComponent size={level === 0 ? 22 : 16} />
          </div>
          <span className={styles.hexNodeName}>{node.name}</span>
          {hasChildren && (
            <button 
              className={styles.hexNodeToggle}
              onClick={(e) => {
                e.stopPropagation()
                onToggle(node.id)
              }}
              style={{ 
                background: nodeColor,
                transform: isNodeExpanded ? 'rotate(180deg)' : 'rotate(0deg)'
              }}
            >
              <ChevronDown size={12} />
            </button>
          )}
        </div>

        {/* بدنه شش‌ضلعی */}
        {node.description && (
          <div className={styles.hexNodeBody}>
            <p className={styles.hexNodeDesc}>{node.description}</p>
          </div>
        )}

        {/* سطح */}
        <div className={styles.hexNodeLevel}>
          <span 
            className={styles.levelBadge}
            style={{ background: nodeColor }}
          >
            {level + 1}
          </span>
        </div>

        {/* لینک مخفی برای SEO */}
        {node.url && (
          <link 
            rel="alternate" 
            href={node.url} 
            title={node.name}
          />
        )}
      </div>

      {hasChildren && isNodeExpanded && (
        <ul className={styles.hexTreeUl}>
          {node.children.map((child) => (
            <HexTreeNode
              key={child.id}
              node={child}
              level={level + 1}
              expandedNodes={expandedNodes}
              onToggle={onToggle}
              onSelect={onSelect}
              isSelected={isSelected?.id === child.id}
            />
          ))}
        </ul>
      )}
    </li>
  )
}

// ============================================
// کامپوننت اصلی با تم شش‌ضلعی
// ============================================
const OrganizationChartHexa = () => {
  const [treeData, setTreeData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [expandedNodes, setExpandedNodes] = useState(new Set())
  const [selectedNode, setSelectedNode] = useState(null)
  const [zoomLevel, setZoomLevel] = useState(1)

  // ============================================
  // بارگذاری داده‌ها از سرور
  // ============================================
  const loadTreeData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      // دریافت داده‌های درخت از سرویس
      const data = await treeChartService.getTree()
      console.log('Tree data loaded:', data)
      
      // اگر داده آرایه‌ای بود و ریشه داشت، از اولین استفاده کن
      let tree = data
      if (Array.isArray(data) && data.length > 0) {
        tree = data[0]
      }
      
      setTreeData(tree)
      
      // باز کردن ریشه به صورت پیش‌فرض
      if (tree && tree.id) {
        setExpandedNodes(new Set([tree.id]))
      }
      
    } catch (err) {
      console.error('Error loading tree data:', err)
      setError(err.error || 'خطا در بارگذاری داده‌های درخت')
    } finally {
      setLoading(false)
    }
  }, [])

  // بارگذاری اولیه
  useEffect(() => {
    loadTreeData()
  }, [loadTreeData])

  // ============================================
  // توگل کردن یک گره خاص
  // ============================================
  const toggleNode = useCallback((nodeId) => {
    setExpandedNodes(prev => {
      const newExpanded = new Set(prev)
      if (newExpanded.has(nodeId)) {
        newExpanded.delete(nodeId)
      } else {
        newExpanded.add(nodeId)
      }
      return newExpanded
    })
  }, [])

  const selectNode = useCallback((node) => {
    setSelectedNode(node)
  }, [])

  const handleZoomIn = useCallback(() => {
    setZoomLevel(prev => Math.min(prev + 0.1, 1.5))
  }, [])

  const handleZoomOut = useCallback(() => {
    setZoomLevel(prev => Math.max(prev - 0.1, 0.5))
  }, [])

  const handleResetZoom = useCallback(() => {
    setZoomLevel(1)
  }, [])

  // ============================================
  // باز کردن همه گره‌ها
  // ============================================
  const expandAll = useCallback(() => {
    if (!treeData) return
    const allIds = new Set()
    const traverse = (node) => {
      allIds.add(node.id)
      if (node.children) {
        node.children.forEach(traverse)
      }
    }
    traverse(treeData)
    setExpandedNodes(allIds)
  }, [treeData])

  // ============================================
  // بستن همه گره‌ها به جز ریشه
  // ============================================
  const collapseAll = useCallback(() => {
    if (!treeData) return
    const newSet = new Set()
    newSet.add(treeData.id)
    setExpandedNodes(newSet)
  }, [treeData])

  // ============================================
  // دریافت آیکون برای مودال
  // ============================================
  const getModalIcon = useCallback((node) => {
    const IconComponent = getIcon(node)
    return <IconComponent size={32} />
  }, [])

  const getTypeLabel = useCallback((node) => {
    const labels = {
      'holding': 'هلدینگ',
      'company': 'شرکت',
      'department': 'بخش'
    }
    return labels[node?.type] || node?.type || 'نامشخص'
  }, [])

  const getTypeIcon = useCallback((node) => {
    const icons = {
      'holding': <Building2 size={16} />,
      'company': <Factory size={16} />,
      'department': <Wrench size={16} />
    }
    return icons[node?.type] || <Building2 size={16} />
  }, [])

  // ============================================
  // رنگ‌های هر سطح برای راهنما
  // ============================================
  const levelColors = [
    { level: 0, label: 'سطح ۱', color: '#8b9aff' },
    { level: 1, label: 'سطح ۲', color: '#6c5ce7' },
    { level: 2, label: 'سطح ۳', color: '#a29bfe' },
    { level: 3, label: 'سطح ۴', color: '#fd79a8' },
    { level: 4, label: 'سطح ۵', color: '#fdcb6e' },
    { level: 5, label: 'سطح ۶', color: '#00b894' },
  ]

  // ============================================
  // آمار درخت
  // ============================================
  const getTreeStats = useCallback(() => {
    if (!treeData) return { totalNodes: 0, maxDepth: 0 }
    
    let totalNodes = 0
    let maxDepth = 0
    const traverse = (node, depth) => {
      totalNodes++
      maxDepth = Math.max(maxDepth, depth)
      if (node.children) {
        node.children.forEach(child => traverse(child, depth + 1))
      }
    }
    traverse(treeData, 0)
    return { totalNodes, maxDepth }
  }, [treeData])

  const stats = getTreeStats()

  // ============================================
  // JSON-LD برای کل ساختار
  // ============================================
  const siteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    'name': treeData?.name || 'هلدینگ آریا اِستاد',
    'description': treeData?.description || 'هلدینگ پیشرو در صنعت ساخت و ساز',
    'url': treeData?.url || 'https://aryagroup.com',
    'department': treeData?.children?.map(company => ({
      '@type': 'Organization',
      'name': company.name,
      'description': company.description,
      'url': company.url || ''
    })) || []
  }

  // ============================================
  // نمایش بارگذاری
  // ============================================
  if (loading) {
    return (
      <section className={styles.hexChartSection}>
        <div className={styles.loadingContainer}>
          <Loader2 className={styles.spinner} size={40} />
          <p>در حال بارگذاری نمودار سازمانی...</p>
        </div>
      </section>
    )
  }

  // ============================================
  // نمایش خطا
  // ============================================
  if (error) {
    return (
      <section className={styles.hexChartSection}>
        <div className={styles.errorContainer}>
          <AlertCircle size={48} className={styles.errorIcon} />
          <h3>خطا در بارگذاری</h3>
          <p>{error}</p>
          <button 
            className={styles.retryBtn}
            onClick={loadTreeData}
          >
            تلاش مجدد
          </button>
        </div>
      </section>
    )
  }

  // ============================================
  // اگر داده‌ای وجود نداشت
  // ============================================
  if (!treeData) {
    return (
      <section className={styles.hexChartSection}>
        <div className={styles.emptyContainer}>
          <div className={styles.emptyIcon}>🏗️</div>
          <h3>هیچ داده‌ای یافت نشد</h3>
          <p>لطفاً ابتدا داده‌های درخت سازمانی را بارگذاری کنید.</p>
          <button 
            className={styles.retryBtn}
            onClick={loadTreeData}
          >
            بارگذاری مجدد
          </button>
        </div>
      </section>
    )
  }

  return (
    <section className={styles.hexChartSection}>
      {/* JSON-LD کلی برای SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(siteJsonLd) }}
      />

      <div className={styles.hexChartContainer}>
        {/* هدر با تم شش‌ضلعی */}
        <div className={styles.hexContentHeader}>
          <div className={styles.hexHeaderLeft}>
            <div className={styles.hexHeaderTitle}>
              <div className={styles.hexHeaderIcon}>
                <Building2 size={24} />
              </div>
              <span>نمودار سازمانی</span>
              <span className={styles.hexBadge}>HEX</span>
            </div>
            <div className={styles.hexHeaderStats}>
              <span className={styles.hexStatItem}>
                <span className={styles.hexStatValue}>{stats.totalNodes}</span>
                <span className={styles.hexStatLabel}>گره</span>
              </span>
              <span className={styles.hexStatDivider}>|</span>
              <span className={styles.hexStatItem}>
                <span className={styles.hexStatValue}>{stats.maxDepth + 1}</span>
                <span className={styles.hexStatLabel}>سطح</span>
              </span>
            </div>
          </div>
          <div className={styles.hexHeaderRight}>
            <button className={styles.hexControlBtn} onClick={expandAll}>
              <Eye size={16} />
              <span>همه</span>
            </button>
            <button className={styles.hexControlBtn} onClick={collapseAll}>
              <EyeOff size={16} />
              <span>ریشه</span>
            </button>
            <div className={styles.hexZoomControls}>
              <button className={styles.hexControlBtn} onClick={handleZoomOut}>
                <ZoomOut size={16} />
              </button>
              <span className={styles.hexZoomLevel}>{Math.round(zoomLevel * 100)}%</span>
              <button className={styles.hexControlBtn} onClick={handleZoomIn}>
                <ZoomIn size={16} />
              </button>
              <button className={styles.hexControlBtn} onClick={handleResetZoom}>
                <RotateCcw size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* درخت شش‌ضلعی */}
        <div className={styles.hexTreeViewport}>
          <div 
            className={styles.hexTreeWrapper}
            style={{ transform: `scale(${zoomLevel})` }}
          >
            <div className={styles.hexTree}>
              <ul className={styles.hexTreeRoot}>
                <HexTreeNode
                  node={treeData}
                  level={0}
                  expandedNodes={expandedNodes}
                  onToggle={toggleNode}
                  onSelect={selectNode}
                  isSelected={selectedNode?.id === treeData.id}
                />
              </ul>
            </div>
          </div>
        </div>

        {/* راهنما با تم شش‌ضلعی */}
        <div className={styles.hexFooterLegend}>
          <div className={styles.hexLegendItems}>
            {levelColors.map((item) => (
              <div key={item.level} className={styles.hexLegendItem}>
                <span 
                  className={styles.hexLegendColor}
                  style={{ background: item.color }}
                />
                <span>{item.label}</span>
              </div>
            ))}
          </div>
          <div className={styles.hexLegendDivider} />
          <span className={styles.hexLegendHint}>
            <Info size={14} />
            <span>کلیک روی کارت برای جزئیات | دکمه ▼/▲ برای نمایش/مخفی کردن</span>
          </span>
        </div>
      </div>

      {/* مودال با تم شش‌ضلعی */}
      {selectedNode && (
        <div 
          className={styles.hexModalOverlay}
          onClick={() => setSelectedNode(null)}
        >
          <div 
            className={styles.hexModalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className={styles.hexModalClose}
              onClick={() => setSelectedNode(null)}
            >
              <X size={24} />
            </button>

            <div className={styles.hexModalHeader}>
              <div className={styles.hexModalIconWrapper}>
                {getModalIcon(selectedNode)}
              </div>
              <div className={styles.hexModalTitleGroup}>
                <h3 className={styles.hexModalTitle}>{selectedNode.name}</h3>
                <span className={styles.hexModalType}>
                  {getTypeIcon(selectedNode)}
                  <span>{getTypeLabel(selectedNode)}</span>
                </span>
              </div>
            </div>

            <div className={styles.hexModalBody}>
              {selectedNode.description && (
                <div className={styles.hexModalDescription}>
                  <h4>توضیحات</h4>
                  <p>{selectedNode.description}</p>
                </div>
              )}

              {selectedNode.url && (
                <div className={styles.hexModalWebsite}>
                  <h4>وب‌سایت</h4>
                  <a 
                    href={selectedNode.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={styles.hexModalLink}
                  >
                    <LinkIcon size={16} />
                    <span>{selectedNode.url}</span>
                    <ExternalLink size={14} />
                  </a>
                </div>
              )}

              {selectedNode.activities && selectedNode.activities.length > 0 && (
                <div className={styles.hexModalActivities}>
                  <h4>فعالیت‌ها</h4>
                  <ul>
                    {selectedNode.activities.map((activity, index) => (
                      <li key={index}>
                        <span className={styles.hexActivityDot} />
                        {activity.title || activity}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedNode.children && selectedNode.children.length > 0 && (
                <div className={styles.hexModalChildren}>
                  <h4>زیرمجموعه‌ها</h4>
                  <div className={styles.hexModalChildrenGrid}>
                    {selectedNode.children.map((child, index) => {
                      const ChildIcon = getIcon(child)
                      return (
                        <div key={index} className={styles.hexModalChildItem}>
                          <span className={styles.hexModalChildIcon}>
                            <ChildIcon size={16} />
                          </span>
                          <span className={styles.hexModalChildName}>{child.name}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              <div className={styles.hexModalMeta}>
                <span className={styles.hexModalMetaItem}>
                  <span className={styles.hexMetaLabel}>سطح:</span>
                  <span className={styles.hexMetaValue}>
                    {getTypeLabel(selectedNode)}
                  </span>
                </span>
                <span className={styles.hexModalMetaItem}>
                  <span className={styles.hexMetaLabel}>شناسه:</span>
                  <span className={styles.hexMetaValue}>#{selectedNode.id}</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

export default OrganizationChartHexa