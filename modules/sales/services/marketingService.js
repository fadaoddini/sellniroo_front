// app/sales/services/marketingService.js
class MarketingService {
  constructor() {
    this.items = []
    this.followups = []
    this.loadFromStorage()
  }

  loadFromStorage() {
    if (typeof window !== 'undefined') {
      const items = localStorage.getItem('marketing_items')
      const followups = localStorage.getItem('marketing_followups')
      
      this.items = items ? JSON.parse(items) : []
      this.followups = followups ? JSON.parse(followups) : []
      
      if (this.items.length === 0) {
        this.addMockData()
      }
    }
  }

  addMockData() {
    const now = new Date()
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)
    const threeDaysLater = new Date(now)
    threeDaysLater.setDate(threeDaysLater.getDate() + 3)

    this.items = [
      {
        id: 1,
        title: 'سازه LSF - پروژه ویلای لوکس',
        phone: '09123456789',
        status: 'in_progress',
        description: 'مشتری برای ساخت ویلای لوکس با سیستم LSF ابراز علاقه کرده. نیاز به بازدید از پروژه و ارائه برآورد هزینه دارد.',
        createdAt: now.toISOString(),
        nextFollowUp: threeDaysLater.toISOString(),
        nextFollowUpTime: '10:00',
      },
      {
        id: 2,
        title: 'کناف - ساختمان اداری',
        phone: '09129876543',
        status: 'new',
        description: 'شرکت پیمانکاری برای پروژه ساختمان اداری به دنبال اجرای کناف با کیفیت بالا است.',
        createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        nextFollowUp: null,
        nextFollowUpTime: null,
      },
      {
        id: 3,
        title: 'طراحی معماری - ویلا',
        phone: '09123456788',
        status: 'confirmed',
        description: 'پروژه طراحی ویلا در شمال تهران. مشتری طرح اولیه را تایید کرده است.',
        createdAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        nextFollowUp: null,
        nextFollowUpTime: null,
      },
    ]

    this.followups = [
      {
        id: 1,
        itemId: 1,
        status: 'in_progress',
        description: 'تماس اولیه با مشتری. مشتری بسیار خوشحال بود.',
        createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        nextFollowUp: threeDaysLater.toISOString(),
        nextFollowUpTime: '10:00',
        changeReason: '',
      },
    ]

    this.saveToStorage()
  }

  getItems() {
    return this.items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }

  getItemsByFollowUpDate() {
    const today = new Date().toISOString().split('T')[0]
    const threeDaysLater = new Date()
    threeDaysLater.setDate(threeDaysLater.getDate() + 3)
    const threeDaysLaterStr = threeDaysLater.toISOString().split('T')[0]

    const all = this.items.filter(item => item.status === 'in_progress' || item.status === 'new')
    
    const todayItems = all.filter(item => item.nextFollowUp === today)
    const nearItems = all.filter(item => 
      item.nextFollowUp && 
      item.nextFollowUp > today && 
      item.nextFollowUp <= threeDaysLaterStr
    )
    const normalItems = all.filter(item => 
      !item.nextFollowUp || 
      item.nextFollowUp > threeDaysLaterStr
    )

    return { todayItems, nearItems, normalItems }
  }

  addItem(data) {
    const newItem = {
      id: this.items.length > 0 ? Math.max(...this.items.map(i => i.id)) + 1 : 1,
      ...data,
      status: 'new',
      createdAt: new Date().toISOString(),
      nextFollowUp: null,
      nextFollowUpTime: null,
    }
    this.items.push(newItem)
    this.saveToStorage()
    return newItem
  }

  // تغییر وضعیت با دلیل
  updateItemStatus(id, status, data = {}) {
    const item = this.items.find(i => i.id === id)
    if (!item) return null

    const { nextFollowUp, nextFollowUpTime, changeReason, description } = data

    const followup = {
      id: this.followups.length > 0 ? Math.max(...this.followups.map(f => f.id)) + 1 : 1,
      itemId: id,
      status: status,
      description: description || `وضعیت به "${status}" تغییر یافت`,
      changeReason: changeReason || '',
      createdAt: new Date().toISOString(),
      nextFollowUp: nextFollowUp || null,
      nextFollowUpTime: nextFollowUpTime || null,
    }
    this.followups.push(followup)

    item.status = status
    if (nextFollowUp) {
      item.nextFollowUp = nextFollowUp
      item.nextFollowUpTime = nextFollowUpTime
    } else {
      item.nextFollowUp = null
      item.nextFollowUpTime = null
    }

    this.saveToStorage()
    return { item, followup }
  }

  getFollowups(itemId) {
    return this.followups
      .filter(f => f.itemId === itemId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }

  deleteItem(id) {
    this.items = this.items.filter(i => i.id !== id)
    this.followups = this.followups.filter(f => f.itemId !== id)
    this.saveToStorage()
  }

  saveToStorage() {
    if (typeof window !== 'undefined') {
      localStorage.setItem('marketing_items', JSON.stringify(this.items))
      localStorage.setItem('marketing_followups', JSON.stringify(this.followups))
    }
  }
}

const marketingService = new MarketingService()
export default marketingService