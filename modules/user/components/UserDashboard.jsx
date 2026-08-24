'use client'

import React, { useState, useEffect } from 'react'
import { 
  Users, User, Globe, Clock, Calendar, 
  Activity, TrendingUp, Eye, BarChart3,
  Monitor, Smartphone, Tablet, Chrome,
  Firefox, Safari, MapPin, Search,
  Filter, MoreVertical, Edit, Trash2,
  Download, RefreshCw, ChevronDown, ChevronUp
} from 'lucide-react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
} from 'chart.js'
import { Line, Bar, Doughnut } from 'react-chartjs-2'
import userService from '../../../services/userService'
import styles from '../../../styles/modules/UserDashboard.module.css'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
)

const UserDashboard = () => {
  const [users, setUsers] = useState([])
  const [stats, setStats] = useState(null)
  const [filterStatus, setFilterStatus] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedUser, setSelectedUser] = useState(null)
  const [showDetails, setShowDetails] = useState(false)

  const loadData = () => {
    const allUsers = userService.getUsers()
    setUsers(allUsers)
    const statsData = userService.getStats()
    setStats(statsData)
  }

  useEffect(() => {
    loadData()
    const interval = setInterval(loadData, 30000)
    return () => clearInterval(interval)
  }, [])

  const getFilteredUsers = () => {
    let filtered = users
    if (filterStatus !== 'all') {
      filtered = filtered.filter(user => user.status === filterStatus)
    }
    if (searchQuery) {
      filtered = filtered.filter(user =>
        user.name.includes(searchQuery) ||
        user.email.includes(searchQuery) ||
        user.country.includes(searchQuery) ||
        user.city.includes(searchQuery)
      )
    }
    return filtered
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleString('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    
    if (hours > 0) {
      return `${hours} ساعت ${minutes} دقیقه`
    } else if (minutes > 0) {
      return `${minutes} دقیقه ${secs} ثانیه`
    }
    return `${secs} ثانیه`
  }

  const getVisitChartData = () => {
    if (!stats) return null
    
    const dates = stats.visitsData.map(v => {
      const d = new Date(v.date)
      return `${d.getMonth() + 1}/${d.getDate()}`
    })
    const visits = stats.visitsData.map(v => v.visits)
    const unique = stats.visitsData.map(v => v.unique)
    
    return {
      labels: dates,
      datasets: [
        {
          label: 'بازدید کل',
          data: visits,
          borderColor: '#800020',
          backgroundColor: 'rgba(128, 0, 32, 0.1)',
          fill: true,
          tension: 0.4,
        },
        {
          label: 'بازدید یکتا',
          data: unique,
          borderColor: '#2d4a3e',
          backgroundColor: 'rgba(45, 74, 62, 0.1)',
          fill: true,
          tension: 0.4,
        },
      ],
    }
  }

  const getCountryChartData = () => {
    if (!stats) return null
    
    const colors = ['#800020', '#2d4a3e', '#007aff', '#34c759', '#ff9500', '#af52de', '#ff3b30']
    
    return {
      labels: stats.countries.map(c => c.name),
      datasets: [
        {
          data: stats.countries.map(c => c.count),
          backgroundColor: colors.slice(0, stats.countries.length),
          borderWidth: 0,
        },
      ],
    }
  }

  const getBrowserChartData = () => {
    if (!stats) return null
    
    const colors = ['#4285F4', '#FF6B6B', '#FFC107', '#00BCD4']
    
    return {
      labels: stats.browsers.map(b => b.name),
      datasets: [
        {
          data: stats.browsers.map(b => b.count),
          backgroundColor: colors.slice(0, stats.browsers.length),
          borderWidth: 0,
        },
      ],
    }
  }

  const getStatusBadge = (status) => {
    const badges = {
      online: { label: 'آنلاین', color: '#34c759' },
      offline: { label: 'آفلاین', color: '#8e8e93' },
      away: { label: 'دور از صفحه', color: '#ff9500' },
      busy: { label: 'مشغول', color: '#ff3b30' },
    }
    return badges[status] || badges.offline
  }

  const filteredUsers = getFilteredUsers()

  return (
    <div className={styles.dashboardContainer}>
      <div className={styles.dashboardHeader}>
        <div className={styles.headerLeft}>
          <h1 className={styles.pageTitle}>👥 مدیریت کاربران</h1>
          <p className={styles.pageDesc}>آنالیز کامل کاربران و بازدیدهای سایت</p>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.refreshBtn} onClick={loadData}>
            <RefreshCw size={18} />
            <span>به‌روزرسانی</span>
          </button>
          <button className={styles.exportBtn}>
            <Download size={18} />
            <span>خروجی</span>
          </button>
        </div>
      </div>

      {stats && (
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: 'rgba(128, 0, 32, 0.1)', color: '#800020' }}>
              <Users size={22} />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statValue}>{stats.totalUsers}</span>
              <span className={styles.statLabel}>کل کاربران</span>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: 'rgba(52, 199, 89, 0.1)', color: '#34c759' }}>
              <Activity size={22} />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statValue}>{stats.onlineUsers}</span>
              <span className={styles.statLabel}>کاربران آنلاین</span>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: 'rgba(0, 122, 255, 0.1)', color: '#007aff' }}>
              <Eye size={22} />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statValue}>{stats.todayVisits}</span>
              <span className={styles.statLabel}>بازدید امروز</span>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: 'rgba(255, 149, 0, 0.1)', color: '#ff9500' }}>
              <TrendingUp size={22} />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statValue}>{stats.totalVisits}</span>
              <span className={styles.statLabel}>کل بازدید</span>
            </div>
          </div>
        </div>
      )}

      {stats && (
        <div className={styles.chartsSection}>
          <div className={styles.chartCard}>
            <div className={styles.chartHeader}>
              <h3>📊 بازدید روزانه</h3>
              <div className={styles.chartLegend}>
                <span><span className={styles.legendDot} style={{ background: '#800020' }}></span> کل بازدید</span>
                <span><span className={styles.legendDot} style={{ background: '#2d4a3e' }}></span> بازدید یکتا</span>
              </div>
            </div>
            <div className={styles.chartContainer}>
              {getVisitChartData() && (
                <Line 
                  data={getVisitChartData()}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: false,
                      },
                      tooltip: {
                        rtl: true,
                      },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        grid: {
                          color: 'rgba(0, 0, 0, 0.05)',
                        },
                      },
                      x: {
                        grid: {
                          display: false,
                        },
                      },
                    },
                  }}
                />
              )}
            </div>
          </div>

          <div className={styles.chartsRow}>
            <div className={styles.chartCard}>
              <h3>🌍 توزیع کشورها</h3>
              <div className={styles.doughnutContainer}>
                {getCountryChartData() && (
                  <Doughnut 
                    data={getCountryChartData()}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'bottom',
                          rtl: true,
                          labels: {
                            font: {
                              family: 'iran',
                            },
                          },
                        },
                      },
                    }}
                  />
                )}
              </div>
            </div>
            <div className={styles.chartCard}>
              <h3>🖥️ مرورگرها</h3>
              <div className={styles.doughnutContainer}>
                {getBrowserChartData() && (
                  <Doughnut 
                    data={getBrowserChartData()}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'bottom',
                          rtl: true,
                          labels: {
                            font: {
                              family: 'iran',
                            },
                          },
                        },
                      },
                    }}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className={styles.controls}>
        <div className={styles.filterGroup}>
          <button 
            className={`${styles.filterBtn} ${filterStatus === 'all' ? styles.activeFilter : ''}`}
            onClick={() => setFilterStatus('all')}
          >
            همه
          </button>
          <button 
            className={`${styles.filterBtn} ${filterStatus === 'online' ? styles.activeFilter : ''}`}
            onClick={() => setFilterStatus('online')}
          >
            آنلاین
          </button>
          <button 
            className={`${styles.filterBtn} ${filterStatus === 'offline' ? styles.activeFilter : ''}`}
            onClick={() => setFilterStatus('offline')}
          >
            آفلاین
          </button>
          <button 
            className={`${styles.filterBtn} ${filterStatus === 'away' ? styles.activeFilter : ''}`}
            onClick={() => setFilterStatus('away')}
          >
            دور از صفحه
          </button>
          <button 
            className={`${styles.filterBtn} ${filterStatus === 'busy' ? styles.activeFilter : ''}`}
            onClick={() => setFilterStatus('busy')}
          >
            مشغول
          </button>
        </div>
        <div className={styles.searchBox}>
          <Search size={18} className={styles.searchIcon} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="جستجوی کاربران..."
            className={styles.searchInput}
          />
        </div>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.userTable}>
          <thead>
            <tr>
              <th>کاربر</th>
              <th>موقعیت</th>
              <th>IP</th>
              <th>وضعیت</th>
              <th>آخرین فعالیت</th>
              <th>مدت زمان</th>
              <th>دستگاه</th>
              <th>عملیات</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => {
              const statusBadge = getStatusBadge(user.status)
              return (
                <tr key={user.id} className={styles.userRow}>
                  <td>
                    <div className={styles.userCell}>
                      <div className={styles.userAvatar}>
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <div className={styles.userName}>{user.name}</div>
                        <div className={styles.userEmail}>{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className={styles.locationCell}>
                      <Globe size={14} />
                      <span>{user.country}</span>
                      <span className={styles.city}>{user.city}</span>
                    </div>
                  </td>
                  <td className={styles.ipCell}>{user.ip}</td>
                  <td>
                    <span 
                      className={styles.statusBadge}
                      style={{ backgroundColor: statusBadge.color + '15', color: statusBadge.color }}
                    >
                      <span className={styles.statusDot} style={{ background: statusBadge.color }} />
                      {statusBadge.label}
                    </span>
                  </td>
                  <td className={styles.dateCell}>
                    <Calendar size={14} />
                    <span>{formatDate(user.lastLogin)}</span>
                  </td>
                  <td className={styles.durationCell}>
                    <Clock size={14} />
                    <span>{formatDuration(user.sessionDuration)}</span>
                  </td>
                  <td>
                    <div className={styles.deviceCell}>
                      {user.device === 'Desktop' && <Monitor size={14} />}
                      {user.device === 'Mobile' && <Smartphone size={14} />}
                      {user.device === 'Tablet' && <Tablet size={14} />}
                      <span>{user.device}</span>
                    </div>
                  </td>
                  <td>
                    <button 
                      className={styles.actionBtn}
                      onClick={() => {
                        setSelectedUser(user)
                        setShowDetails(true)
                      }}
                    >
                      <MoreVertical size={16} />
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {showDetails && selectedUser && (
        <div className={styles.modalOverlay} onClick={() => setShowDetails(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>🔍 جزئیات کاربر</h2>
              <button className={styles.closeBtn} onClick={() => setShowDetails(false)}>
                ✕
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.profileSection}>
                <div className={styles.profileAvatar}>
                  {selectedUser.name.charAt(0)}
                </div>
                <div className={styles.profileInfo}>
                  <h3>{selectedUser.name}</h3>
                  <p>{selectedUser.email}</p>
                  <span className={styles.profileStatus}>
                    {getStatusBadge(selectedUser.status).label}
                  </span>
                </div>
              </div>
              <div className={styles.detailsGrid}>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>کشور</span>
                  <span className={styles.detailValue}>{selectedUser.country}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>شهر</span>
                  <span className={styles.detailValue}>{selectedUser.city}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>آدرس IP</span>
                  <span className={styles.detailValue}>{selectedUser.ip}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>مرورگر</span>
                  <span className={styles.detailValue}>{selectedUser.browser}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>سیستم‌عامل</span>
                  <span className={styles.detailValue}>{selectedUser.os}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>دستگاه</span>
                  <span className={styles.detailValue}>{selectedUser.device}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>آخرین فعالیت</span>
                  <span className={styles.detailValue}>{formatDate(selectedUser.lastLogin)}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>مدت زمان حضور</span>
                  <span className={styles.detailValue}>{formatDuration(selectedUser.sessionDuration)}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>تعداد صفحات</span>
                  <span className={styles.detailValue}>{selectedUser.pagesVisited}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>وضعیت</span>
                  <span className={styles.detailValue}>
                    <span 
                      className={styles.statusBadge}
                      style={{ 
                        backgroundColor: getStatusBadge(selectedUser.status).color + '15', 
                        color: getStatusBadge(selectedUser.status).color 
                      }}
                    >
                      <span 
                        className={styles.statusDot} 
                        style={{ background: getStatusBadge(selectedUser.status).color }} 
                      />
                      {getStatusBadge(selectedUser.status).label}
                    </span>
                  </span>
                </div>
              </div>
              <div className={styles.modalActions}>
                <button className={styles.editBtn}>
                  <Edit size={16} />
                  ویرایش
                </button>
                <button 
                  className={styles.deleteBtn}
                  onClick={() => {
                    if (window.confirm('آیا از حذف این کاربر اطمینان دارید؟')) {
                      userService.deleteUser(selectedUser.id)
                      loadData()
                      setShowDetails(false)
                    }
                  }}
                >
                  <Trash2 size={16} />
                  حذف
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default UserDashboard
