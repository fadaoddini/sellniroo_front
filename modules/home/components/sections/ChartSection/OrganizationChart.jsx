'use client'

import React, { useState, useMemo } from 'react'
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
  ChevronUp,
  Link as LinkIcon,
  ExternalLink
} from 'lucide-react'
import styles from './OrganizationChart.module.css'
import { chartData } from './chartData'

// ============================================
// نقشه آیکون‌ها
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
  
  const IconComponent = iconMap[node.id] || iconMap[node.type] || Building2
  return IconComponent
}

// ============================================
// کامپوننت گره درختی - اصلاح شده با SEO
// ============================================
const TreeNode = ({ 
  node, 
  level = 0,
  expandedNodes,
  onToggle,
  onSelect,
  isSelected
}) => {
  const hasChildren = node.children && node.children.length > 0
  const IconComponent = getIcon(node)
  const isNodeExpanded = expandedNodes.has(node.id)

  // رنگ‌های هر سطح
  const getLevelColor = (lvl) => {
    const colors = {
      0: '#000000ff',
      1: '#651e1eff',
      2: '#951414ff',
      3: '#c20000ff',
      4: '#d32e2eff',
      5: '#ff6060ff',
    }
    return colors[lvl] || '#6b7280'
  }

  const nodeColor = getLevelColor(level)

  // ساختار JSON-LD برای SEO (مخفی)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    'name': node.name,
    'description': node.description || '',
    'url': node.url || '',
    'parentOrganization': level > 0 ? {
      '@type': 'Organization',
      'name': 'هلدینگ آریا اِستاد'
    } : undefined,
    'subOrganization': hasChildren ? node.children.map(child => ({
      '@type': 'Organization',
      'name': child.name,
      'url': child.url || ''
    })) : undefined
  }

  return (
    <li className={styles.treeLi}>
      {/* JSON-LD برای SEO - مخفی در DOM */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      {/* لینک مخفی برای SEO (وزن لینک به صفحه اصلی) */}
      {node.url && (
        <link 
          rel="alternate" 
          href={node.url} 
          title={node.name}
        />
      )}

      <div 
        className={`${styles.treeLink} ${isSelected ? styles.active : ''}`}
        style={{
          borderColor: isSelected ? '#f97316' : nodeColor,
          backgroundColor: isSelected ? '#fef3c7' : 'white',
        }}
        onClick={() => onSelect(node)}
      >
        <span className={styles.linkIcon}>
          <IconComponent size={level === 0 ? 22 : 18} />
        </span>
        <span className={styles.linkName}>{node.name}</span>
        
        {hasChildren && (
          <button 
            className={styles.linkToggle}
            onClick={(e) => {
              e.stopPropagation()
              onToggle(node.id)
            }}
            style={{ 
              backgroundColor: nodeColor,
              color: 'white'
            }}
          >
            {isNodeExpanded ? (
              <ChevronUp size={14} />
            ) : (
              <ChevronDown size={14} />
            )}
          </button>
        )}
      </div>

      {hasChildren && isNodeExpanded && (
        <ul className={styles.treeUl}>
          {node.children.map((child) => (
            <TreeNode
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
// کامپوننت اصلی - اصلاح شده با SEO
// ============================================
const OrganizationChart = () => {
  const treeData = useMemo(() => chartData, [])

  // حالت اولیه: فقط ریشه باز باشد
  const [expandedNodes, setExpandedNodes] = useState(() => {
    const initialSet = new Set()
    initialSet.add(treeData.id)
    return initialSet
  })

  const [selectedNode, setSelectedNode] = useState(null)
  const [zoomLevel, setZoomLevel] = useState(1)

  // توگل کردن یک گره خاص
  const toggleNode = (nodeId) => {
    const newExpanded = new Set(expandedNodes)
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId)
    } else {
      newExpanded.add(nodeId)
    }
    setExpandedNodes(newExpanded)
  }

  const selectNode = (node) => {
    setSelectedNode(node)
  }

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.1, 1.5))
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.1, 0.5))
  const handleResetZoom = () => setZoomLevel(1)

  // باز کردن همه گره‌ها
  const expandAll = () => {
    const allIds = new Set()
    const traverse = (node) => {
      allIds.add(node.id)
      if (node.children) {
        node.children.forEach(traverse)
      }
    }
    traverse(treeData)
    setExpandedNodes(allIds)
  }

  // بستن همه گره‌ها به جز ریشه
  const collapseAll = () => {
    const newSet = new Set()
    newSet.add(treeData.id)
    setExpandedNodes(newSet)
  }

  const getModalIcon = (node) => {
    const IconComponent = getIcon(node)
    return <IconComponent size={32} />
  }

  const getTypeLabel = (node) => {
    const labels = {
      'holding': 'هلدینگ',
      'company': 'شرکت',
      'department': 'بخش'
    }
    return labels[node.type] || node.type
  }

  const getTypeIcon = (node) => {
    const icons = {
      'holding': <Building2 size={16} />,
      'company': <Factory size={16} />,
      'department': <Wrench size={16} />
    }
    return icons[node.type] || <Building2 size={16} />
  }

  // رنگ‌های هر سطح برای راهنما
  const levelColors = [
    { level: 0, label: 'سطح ۱', color: '#000000ff' },
    { level: 1, label: 'سطح ۲', color: '#651e1eff' },
    { level: 2, label: 'سطح ۳', color: '#951414ff' },
    { level: 3, label: 'سطح ۴', color: '#c20000ff' },
    { level: 4, label: 'سطح ۵', color: '#d32e2eff' },
    { level: 5, label: 'سطح ۶', color: '#ff6060ff' },
  ]

  const getTreeStats = () => {
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
  }

  const stats = getTreeStats()

  // JSON-LD برای کل ساختار
  const siteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    'name': 'هلدینگ آریا اِستاد',
    'description': 'هلدینگ پیشرو در صنعت ساخت و ساز',
    'url': 'https://aryagroup.com',
    'logo': 'https://aryagroup.com/logo.png',
    'foundingDate': '2010',
    'address': {
      '@type': 'PostalAddress',
      'addressCountry': 'IR'
    },
    'department': treeData.children.map(company => ({
      '@type': 'Organization',
      'name': company.name,
      'description': company.description,
      'url': company.url || ''
    }))
  }

  return (
    <section className={styles.chartSection}>
      {/* JSON-LD کلی برای SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(siteJsonLd) }}
      />

      {/* لینک‌های مخفی برای خزنده‌های موتور جستجو */}
      <div style={{ display: 'none' }} aria-hidden="true">
        <a href="https://aryagroup.com">هلدینگ آریا اِستاد</a>
        {treeData.children.map(company => (
          company.url && (
            <a key={company.id} href={company.url}>{company.name}</a>
          )
        ))}
      </div>

      <div className={styles.chartContainer}>
        {/* هدر */}
        <div className={styles.contentHeader}>
          <div className={styles.headerLeft}>
            <div className={styles.headerTitle}>
              <Building2 size={24} />
              <span>نمودار سازمانی</span>
            </div>
            <div className={styles.headerStats}>
              <span className={styles.statItem}>
                <span className={styles.statValue}>{stats.totalNodes}</span>
                <span className={styles.statLabel}>گره</span>
              </span>
              <span className={styles.statDivider}>|</span>
              <span className={styles.statItem}>
                <span className={styles.statValue}>{stats.maxDepth + 1}</span>
                <span className={styles.statLabel}>سطح</span>
              </span>
            </div>
          </div>
          <div className={styles.headerRight}>
            <button className={styles.controlBtn} onClick={expandAll}>
              <Eye size={16} />
              <span>همه</span>
            </button>
            <button className={styles.controlBtn} onClick={collapseAll}>
              <EyeOff size={16} />
              <span>ریشه</span>
            </button>
            <div className={styles.zoomControls}>
              <button className={styles.controlBtn} onClick={handleZoomOut}>
                <ZoomOut size={16} />
              </button>
              <span className={styles.zoomLevel}>{Math.round(zoomLevel * 100)}%</span>
              <button className={styles.controlBtn} onClick={handleZoomIn}>
                <ZoomIn size={16} />
              </button>
              <button className={styles.controlBtn} onClick={handleResetZoom}>
                <RotateCcw size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* درخت */}
        <div className={styles.treeViewport}>
          <div 
            className={styles.treeWrapper}
            style={{ transform: `scale(${zoomLevel})` }}
          >
            <div className={styles.tree}>
              <ul className={styles.treeRoot}>
                <TreeNode
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

        {/* راهنما */}
        <div className={styles.footerLegend}>
          <div className={styles.legendItems}>
            {levelColors.map((item) => (
              <div key={item.level} className={styles.legendItem}>
                <span 
                  className={styles.legendColor}
                  style={{ background: item.color }}
                />
                <span>{item.label}</span>
              </div>
            ))}
          </div>
          <div className={styles.legendDivider} />
          <span className={styles.legendHint}>
            <Info size={14} />
            <span>کلیک روی کارت برای جزئیات | دکمه ▼/▲ برای نمایش/مخفی کردن</span>
          </span>
        </div>
      </div>

      {/* مودال با لینک وب‌سایت */}
      {selectedNode && (
        <div 
          className={styles.modalOverlay}
          onClick={() => setSelectedNode(null)}
        >
          <div 
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className={styles.modalClose}
              onClick={() => setSelectedNode(null)}
            >
              <X size={24} />
            </button>

            <div className={styles.modalHeader}>
              <span className={styles.modalIcon}>
                {getModalIcon(selectedNode)}
              </span>
              <div className={styles.modalTitleGroup}>
                <h3 className={styles.modalTitle}>{selectedNode.name}</h3>
                <span className={styles.modalType}>
                  {getTypeIcon(selectedNode)}
                  <span>{getTypeLabel(selectedNode)}</span>
                </span>
              </div>
            </div>

            <div className={styles.modalBody}>
              {selectedNode.description && (
                <div className={styles.modalDescription}>
                  <h4>توضیحات</h4>
                  <p>{selectedNode.description}</p>
                </div>
              )}

              {/* لینک وب‌سایت در مودال */}
              {selectedNode.url && (
                <div className={styles.modalWebsite}>
                  <h4>وب‌سایت</h4>
                  <a 
                    href={selectedNode.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={styles.modalLink}
                  >
                    <LinkIcon size={16} />
                    <span>{selectedNode.url}</span>
                    <ExternalLink size={14} />
                  </a>
                </div>
              )}

              {selectedNode.activities && selectedNode.activities.length > 0 && (
                <div className={styles.modalActivities}>
                  <h4>فعالیت‌ها</h4>
                  <ul>
                    {selectedNode.activities.map((activity, index) => (
                      <li key={index}>
                        <span className={styles.activityDot} />
                        {activity}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedNode.children && selectedNode.children.length > 0 && (
                <div className={styles.modalChildren}>
                  <h4>زیرمجموعه‌ها</h4>
                  <div className={styles.modalChildrenGrid}>
                    {selectedNode.children.map((child, index) => {
                      const ChildIcon = getIcon(child)
                      return (
                        <div key={index} className={styles.modalChildItem}>
                          <span className={styles.modalChildIcon}>
                            <ChildIcon size={16} />
                          </span>
                          <span className={styles.modalChildName}>{child.name}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              <div className={styles.modalMeta}>
                <span className={styles.modalMetaItem}>
                  <span className={styles.metaLabel}>سطح:</span>
                  <span className={styles.metaValue}>
                    {getTypeLabel(selectedNode)}
                  </span>
                </span>
                <span className={styles.modalMetaItem}>
                  <span className={styles.metaLabel}>شناسه:</span>
                  <span className={styles.metaValue}>#{selectedNode.id}</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

export default OrganizationChart