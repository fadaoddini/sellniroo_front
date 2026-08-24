// سرویس مدیریت کاربران
class UserService {
  constructor() {
    this.users = []
    this.visits = []
    this.loadFromStorage()
  }

  // بارگذاری از localStorage
  loadFromStorage() {
    if (typeof window !== 'undefined') {
      const users = localStorage.getItem('users_data')
      const visits = localStorage.getItem('visits_data')
      
      if (users) {
        this.users = JSON.parse(users)
      } else {
        this.users = this.generateMockUsers()
        localStorage.setItem('users_data', JSON.stringify(this.users))
      }
      
      if (visits) {
        this.visits = JSON.parse(visits)
      } else {
        this.visits = this.generateMockVisits()
        localStorage.setItem('visits_data', JSON.stringify(this.visits))
      }
    }
  }

  // تولید کاربران نمونه
  generateMockUsers() {
    const countries = ['ایران', 'آمریکا', 'انگلیس', 'آلمان', 'فرانسه', 'کانادا', 'استرالیا', 'ترکیه']
    const cities = ['تهران', 'مشهد', 'اصفهان', 'شیراز', 'تبریز', 'کرج', 'قم', 'رشت']
    const statuses = ['online', 'offline', 'away', 'busy']
    
    const users = []
    const now = new Date()
    
    for (let i = 1; i <= 25; i++) {
      const status = statuses[Math.floor(Math.random() * statuses.length)]
      const hours = Math.floor(Math.random() * 24)
      const minutes = Math.floor(Math.random() * 60)
      const date = new Date(now)
      date.setDate(date.getDate() - Math.floor(Math.random() * 30))
      date.setHours(hours, minutes, Math.floor(Math.random() * 60))
      
      users.push({
        id: i,
        name: `کاربر ${i}`,
        email: `user${i}@example.com`,
        country: countries[Math.floor(Math.random() * countries.length)],
        city: cities[Math.floor(Math.random() * cities.length)],
        ip: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        status: status,
        lastLogin: date.toISOString(),
        sessionDuration: Math.floor(Math.random() * 3600) + 60,
        browser: ['Chrome', 'Firefox', 'Safari', 'Edge'][Math.floor(Math.random() * 4)],
        os: ['Windows', 'MacOS', 'Linux', 'iOS', 'Android'][Math.floor(Math.random() * 5)],
        device: ['Desktop', 'Mobile', 'Tablet'][Math.floor(Math.random() * 3)],
        pagesVisited: Math.floor(Math.random() * 15) + 1,
        isOnline: status === 'online',
      })
    }
    
    return users
  }

  // تولید بازدیدهای نمونه
  generateMockVisits() {
    const visits = []
    const now = new Date()
    
    for (let i = 30; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)
      const dayVisits = Math.floor(Math.random() * 100) + 20
      
      visits.push({
        date: date.toISOString().split('T')[0],
        visits: dayVisits,
        unique: Math.floor(dayVisits * 0.6),
        bounceRate: Math.floor(Math.random() * 30) + 10,
        avgDuration: Math.floor(Math.random() * 300) + 60,
      })
    }
    
    return visits
  }

  // دریافت تمام کاربران
  getUsers() {
    return this.users
  }

  // دریافت کاربران آنلاین
  getOnlineUsers() {
    return this.users.filter(user => user.isOnline)
  }

  // دریافت آمار کلی
  getStats() {
    const total = this.users.length
    const online = this.users.filter(u => u.isOnline).length
    const today = new Date().toISOString().split('T')[0]
    const todayVisits = this.visits.find(v => v.date === today)
    
    const countries = {}
    this.users.forEach(user => {
      countries[user.country] = (countries[user.country] || 0) + 1
    })
    
    const browsers = {}
    this.users.forEach(user => {
      browsers[user.browser] = (browsers[user.browser] || 0) + 1
    })
    
    const devices = {}
    this.users.forEach(user => {
      devices[user.device] = (devices[user.device] || 0) + 1
    })
    
    return {
      totalUsers: total,
      onlineUsers: online,
      todayVisits: todayVisits ? todayVisits.visits : 0,
      totalVisits: this.visits.reduce((sum, v) => sum + v.visits, 0),
      avgBounceRate: Math.round(this.visits.reduce((sum, v) => sum + v.bounceRate, 0) / this.visits.length),
      avgDuration: Math.round(this.visits.reduce((sum, v) => sum + v.avgDuration, 0) / this.visits.length),
      countries: Object.keys(countries).map(key => ({ name: key, count: countries[key] })),
      browsers: Object.keys(browsers).map(key => ({ name: key, count: browsers[key] })),
      devices: Object.keys(devices).map(key => ({ name: key, count: devices[key] })),
      visitsData: this.visits,
    }
  }

  // دریافت بازدیدهای روزانه
  getDailyVisits() {
    return this.visits
  }

  // افزودن بازدید جدید
  addVisit(visitData) {
    const today = new Date().toISOString().split('T')[0]
    const existing = this.visits.find(v => v.date === today)
    
    if (existing) {
      existing.visits += 1
    } else {
      this.visits.push({
        date: today,
        visits: 1,
        unique: 1,
        bounceRate: 0,
        avgDuration: 0,
      })
    }
    
    localStorage.setItem('visits_data', JSON.stringify(this.visits))
  }

  // افزودن کاربر جدید
  addUser(userData) {
    const newUser = {
      id: this.users.length + 1,
      ...userData,
      lastLogin: new Date().toISOString(),
      isOnline: true,
    }
    this.users.push(newUser)
    localStorage.setItem('users_data', JSON.stringify(this.users))
    return newUser
  }

  // بروزرسانی وضعیت کاربر
  updateUserStatus(userId, status) {
    const user = this.users.find(u => u.id === userId)
    if (user) {
      user.status = status
      user.isOnline = status === 'online'
      localStorage.setItem('users_data', JSON.stringify(this.users))
    }
  }

  // حذف کاربر
  deleteUser(userId) {
    this.users = this.users.filter(u => u.id !== userId)
    localStorage.setItem('users_data', JSON.stringify(this.users))
  }

  // جستجوی کاربران
  searchUsers(query) {
    return this.users.filter(user => 
      user.name.includes(query) || 
      user.email.includes(query) || 
      user.country.includes(query)
    )
  }

  // فیلتر کاربران بر اساس وضعیت
  filterByStatus(status) {
    if (status === 'all') return this.users
    return this.users.filter(user => user.status === status)
  }
}

// ایجاد نمونه سرویس
const userService = new UserService()
export default userService
