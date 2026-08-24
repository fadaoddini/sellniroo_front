'use client'
import React, { useState, useEffect } from 'react'
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight,
  Eye, 
  Edit, 
  Save, 
  X, 
  Trash2, 
  Plus,
  MapPin,
  Building,
  Users
} from 'lucide-react'
import { useLanguage } from '../../../../contexts/LanguageContext'
import { useAuth } from '../../../../contexts/AuthContext'
import styles from '../../styles/ProjectsSection.module.css'

const ProjectSection = () => {
  const { language } = useLanguage()
  const { user } = useAuth()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState(null)
  const [isAdding, setIsAdding] = useState(false)
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 8

  // State for new project
  const [newProjectData, setNewProjectData] = useState({
    title_fa: '',
    title_en: '',
    excerpt_fa: '',
    excerpt_en: '',
    content_fa: '',
    content_en: '',
    image: null,
    location_fa: '',
    location_en: '',
    project_type: '',
    area: '',
    status: 'completed', // completed, ongoing, planned
    date: new Date().toISOString().split('T')[0],
  })

  const isAdmin = user?.is_staff || user?.is_superuser || false

  // Sample Data
  const sampleProjects = [
    {
      id: 1,
      title_fa: 'مجتمع مسکونی پارس',
      title_en: 'Pars Residential Complex',
      excerpt_fa: 'مجموعه ۴ برج ۲۰ طبقه با سازه LSF در منطقه ۵ تهران',
      excerpt_en: 'A complex of 4 towers with 20 floors using LSF structure in District 5 of Tehran',
      content_fa: 'متن کامل پروژه...',
      content_en: 'Full project content...',
      image: 'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&h=750&w=1260',
      location_fa: 'تهران، منطقه ۵',
      location_en: 'Tehran, District 5',
      project_type: 'مسکونی',
      area: '۱۲,۵۰۰ مترمربع',
      status: 'completed',
      date: '2026-03-15',
      views: 456
    },
    {
      id: 2,
      title_fa: 'مرکز تجاری الماس',
      title_en: 'Almas Commercial Center',
      excerpt_fa: 'بزرگترین مرکز خرید شمال غرب کشور با سازه LSF',
      excerpt_en: 'The largest shopping center in the northwest of the country with LSF structure',
      content_fa: 'متن کامل پروژه...',
      content_en: 'Full project content...',
      image: 'https://images.pexels.com/photos/280221/pexels-photo-280221.jpeg?auto=compress&cs=tinysrgb&h=750&w=1260',
      location_fa: 'تبریز، خیابان ولیعصر',
      location_en: 'Tabriz, Valiasr Street',
      project_type: 'تجاری',
      area: '۲۵,۰۰۰ مترمربع',
      status: 'ongoing',
      date: '2026-04-20',
      views: 389
    },
    {
      id: 3,
      title_fa: 'پروژه ملی ورزشگاه آزادی',
      title_en: 'Azadi National Stadium Project',
      excerpt_fa: 'بازسازی و نوسازی ورزشگاه با تکنولوژی LSF',
      excerpt_en: 'Renovation and modernization of the stadium with LSF technology',
      content_fa: 'متن کامل پروژه...',
      content_en: 'Full project content...',
      image: 'https://images.pexels.com/photos/2570139/pexels-photo-2570139.jpeg?auto=compress&cs=tinysrgb&h=750&w=1260',
      location_fa: 'تهران، بزرگراه شیخ فضل‌الله',
      location_en: 'Tehran, Sheikh Fazlollah Highway',
      project_type: 'ورزشی',
      area: '۴۵,۰۰۰ مترمربع',
      status: 'planned',
      date: '2026-05-10',
      views: 567
    },
    {
      id: 4,
      title_fa: 'مجتمع آموزشی نور',
      title_en: 'Noor Educational Complex',
      excerpt_fa: 'مجموعه ۳ مدرسه با امکانات پیشرفته و سازه LSF',
      excerpt_en: 'A complex of 3 schools with advanced facilities and LSF structure',
      content_fa: 'متن کامل پروژه...',
      content_en: 'Full project content...',
      image: 'https://images.pexels.com/photos/256395/pexels-photo-256395.jpeg?auto=compress&cs=tinysrgb&h=750&w=1260',
      location_fa: 'اصفهان، شهرک صنعتی',
      location_en: 'Isfahan, Industrial Town',
      project_type: 'آموزشی',
      area: '۸,۵۰۰ مترمربع',
      status: 'completed',
      date: '2026-02-28',
      views: 234
    },
    {
      id: 5,
      title_fa: 'ساختمان اداری هرمزان',
      title_en: 'Hermzan Office Building',
      excerpt_fa: 'ساختمان ۱۲ طبقه اداری با نمای مدرن LSF',
      excerpt_en: '12-story office building with modern LSF facade',
      content_fa: 'متن کامل پروژه...',
      content_en: 'Full project content...',
      image: 'https://images.pexels.com/photos/236637/pexels-photo-236637.jpeg?auto=compress&cs=tinysrgb&h=750&w=1260',
      location_fa: 'شیراز، خیابان زند',
      location_en: 'Shiraz, Zand Street',
      project_type: 'اداری',
      area: '۱۶,۰۰۰ مترمربع',
      status: 'ongoing',
      date: '2026-04-05',
      views: 312
    },
    {
      id: 6,
      title_fa: 'پل عابر پیاده مکانیزه',
      title_en: 'Mechanized Pedestrian Bridge',
      excerpt_fa: 'پل عابر پیاده با سازه سبک LSF و آسانسور',
      excerpt_en: 'Pedestrian bridge with light LSF structure and elevator',
      content_fa: 'متن کامل پروژه...',
      content_en: 'Full project content...',
      image: 'https://images.pexels.com/photos/1826884/pexels-photo-1826884.jpeg?auto=compress&cs=tinysrgb&h=750&w=1260',
      location_fa: 'مشهد، میدان آزادی',
      location_en: 'Mashhad, Azadi Square',
      project_type: 'زیرساختی',
      area: '۱,۲۰۰ مترمربع',
      status: 'completed',
      date: '2026-03-01',
      views: 178
    },
    {
      id: 7,
      title_fa: 'مرکز تحقیقاتی انرژی',
      title_en: 'Energy Research Center',
      excerpt_fa: 'مرکز تحقیقات انرژی‌های تجدیدپذیر با سازه LSF',
      excerpt_en: 'Renewable energy research center with LSF structure',
      content_fa: '...',
      content_en: '...',
      image: 'https://images.pexels.com/photos/1780133/pexels-photo-1780133.jpeg?auto=compress&cs=tinysrgb&h=750&w=1260',
      location_fa: 'کرج، پارک علم و فناوری',
      location_en: 'Karaj, Science and Technology Park',
      project_type: 'پژوهشی',
      area: '۶,۰۰۰ مترمربع',
      status: 'planned',
      date: '2026-06-01',
      views: 145
    },
    {
      id: 8,
      title_fa: 'مجتمع تفریحی آبی',
      title_en: 'Aquatic Entertainment Complex',
      excerpt_fa: 'مجموعه ورزش‌های آبی با پوشش LSF',
      excerpt_en: 'Water sports complex with LSF covering',
      content_fa: '...',
      content_en: '...',
      image: 'https://images.pexels.com/photos/1687845/pexels-photo-1687845.jpeg?auto=compress&cs=tinysrgb&h=750&w=1260',
      location_fa: 'کیش، ساحل مرجانی',
      location_en: 'Kish, Coral Beach',
      project_type: 'گردشگری',
      area: '۲۰,۰۰۰ مترمربع',
      status: 'ongoing',
      date: '2026-05-15',
      views: 267
    },
    {
      id: 9,
      title_fa: 'کارخانه تولید پیشرفته',
      title_en: 'Advanced Manufacturing Plant',
      excerpt_fa: 'کارخانه تولید قطعات LSF با تکنولوژی روز',
      excerpt_en: 'LSF parts manufacturing plant with modern technology',
      content_fa: '...',
      content_en: '...',
      image: 'https://images.pexels.com/photos/159213/pexels-photo-159213.jpeg?auto=compress&cs=tinysrgb&h=750&w=1260',
      location_fa: 'اراک، شهرک صنعتی',
      location_en: 'Arak, Industrial Town',
      project_type: 'صنعتی',
      area: '۳۰,۰۰۰ مترمربع',
      status: 'completed',
      date: '2026-02-10',
      views: 423
    }
  ]

  useEffect(() => {
    setProjects(sampleProjects)
    setLoading(false)
  }, [])

  // Pagination Logic
  const totalPages = Math.ceil(projects.length / itemsPerPage)
  const currentProjects = projects.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    if (language === 'fa') {
      return new Intl.DateTimeFormat('fa-IR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }).format(date)
    }
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date)
  }

  const getStatusLabel = (status) => {
    if (language === 'fa') {
      const statusMap = {
        'completed': 'تکمیل شده',
        'ongoing': 'در حال اجرا',
        'planned': 'برنامه‌ریزی شده'
      }
      return statusMap[status] || status
    }
    const statusMap = {
      'completed': 'Completed',
      'ongoing': 'In Progress',
      'planned': 'Planned'
    }
    return statusMap[status] || status
  }

  const getStatusColor = (status) => {
    const colorMap = {
      'completed': 'var(--macos-green)',
      'ongoing': 'var(--primary)',
      'planned': 'var(--macos-orange)'
    }
    return colorMap[status] || 'var(--macos-text-secondary)'
  }

  const startEditing = (item) => {
    setIsEditing(true)
    setEditData({
      id: item.id,
      title_fa: item.title_fa,
      title_en: item.title_en,
      excerpt_fa: item.excerpt_fa,
      excerpt_en: item.excerpt_en,
      content_fa: item.content_fa,
      content_en: item.content_en,
      image: item.image,
      location_fa: item.location_fa,
      location_en: item.location_en,
      project_type: item.project_type,
      area: item.area,
      status: item.status,
      date: item.date,
    })
  }

  const saveEditing = () => {
    if (!editData) return
    setProjects(prev => prev.map(item =>
      item.id === editData.id ? { ...item, ...editData } : item
    ))
    setIsEditing(false)
    setEditData(null)
  }

  const deleteProject = (id) => {
    if (!confirm('آیا از حذف این پروژه اطمینان دارید؟')) return
    setProjects(prev => prev.filter(item => item.id !== id))
  }

  const addProject = () => {
    const newItem = {
      id: Date.now(),
      ...newProjectData,
      views: 0
    }
    setProjects(prev => [newItem, ...prev])
    setIsAdding(false)
    setNewProjectData({
      title_fa: '',
      title_en: '',
      excerpt_fa: '',
      excerpt_en: '',
      content_fa: '',
      content_en: '',
      image: null,
      location_fa: '',
      location_en: '',
      project_type: '',
      area: '',
      status: 'completed',
      date: new Date().toISOString().split('T')[0],
    })
  }

  if (loading) {
    return (
      <section className={styles.projectSection}>
        <div className="container">
          <div className={styles.loading}>در حال بارگذاری...</div>
        </div>
      </section>
    )
  }

  const title = language === 'fa' ? 'پروژه‌های اجرایی' : 'Our Projects'
  const viewAll = language === 'fa' ? 'مشاهده همه' : 'View All'

  return (
    <section className={styles.projectSection}>
      <div className="container">
        <div className={styles.projectHeader}>
          <div className={styles.projectHeaderLeft}>
            <span className={styles.projectBadge}>
              {language === 'fa' ? '🏗️ پروژه‌های شاخص' : '🏗️ Featured Projects'}
            </span>
            <h2 className={styles.projectTitle}>{title}</h2>
            <p className={styles.projectSubtitle}>
              {language === 'fa'
                ? 'مروری بر پروژه‌های موفق و اجرا شده با سازه‌های LSF'
                : 'An overview of successful projects implemented with LSF structures'}
            </p>
          </div>
          <div className={styles.projectHeaderRight}>
            {isAdmin && (
              <button
                className={styles.addProjectBtn}
                onClick={() => setIsAdding(true)}
              >
                <Plus size={16} />
                {language === 'fa' ? 'پروژه جدید' : 'New Project'}
              </button>
            )}
            <a href="/projects" className={styles.viewAllBtn}>
              {viewAll}
              <ChevronLeft size={16} />
            </a>
          </div>
        </div>

        {isAdding && isAdmin && (
          <div className={styles.addProjectForm}>
            <h4>{language === 'fa' ? 'افزودن پروژه جدید' : 'Add New Project'}</h4>
            <div className={styles.formGrid}>
              <div className={styles.formField}>
                <label>{language === 'fa' ? 'عنوان (فارسی)' : 'Title (Persian)'}</label>
                <input
                  type="text"
                  value={newProjectData.title_fa}
                  onChange={(e) => setNewProjectData({...newProjectData, title_fa: e.target.value})}
                />
              </div>
              <div className={styles.formField}>
                <label>{language === 'fa' ? 'عنوان (انگلیسی)' : 'Title (English)'}</label>
                <input
                  type="text"
                  value={newProjectData.title_en}
                  onChange={(e) => setNewProjectData({...newProjectData, title_en: e.target.value})}
                />
              </div>
              <div className={styles.formField}>
                <label>{language === 'fa' ? 'خلاصه (فارسی)' : 'Excerpt (Persian)'}</label>
                <textarea
                  value={newProjectData.excerpt_fa}
                  onChange={(e) => setNewProjectData({...newProjectData, excerpt_fa: e.target.value})}
                  rows="2"
                />
              </div>
              <div className={styles.formField}>
                <label>{language === 'fa' ? 'خلاصه (انگلیسی)' : 'Excerpt (English)'}</label>
                <textarea
                  value={newProjectData.excerpt_en}
                  onChange={(e) => setNewProjectData({...newProjectData, excerpt_en: e.target.value})}
                  rows="2"
                />
              </div>
              <div className={styles.formField}>
                <label>{language === 'fa' ? 'موقعیت (فارسی)' : 'Location (Persian)'}</label>
                <input
                  type="text"
                  value={newProjectData.location_fa}
                  onChange={(e) => setNewProjectData({...newProjectData, location_fa: e.target.value})}
                />
              </div>
              <div className={styles.formField}>
                <label>{language === 'fa' ? 'موقعیت (انگلیسی)' : 'Location (English)'}</label>
                <input
                  type="text"
                  value={newProjectData.location_en}
                  onChange={(e) => setNewProjectData({...newProjectData, location_en: e.target.value})}
                />
              </div>
              <div className={styles.formField}>
                <label>{language === 'fa' ? 'نوع پروژه' : 'Project Type'}</label>
                <input
                  type="text"
                  value={newProjectData.project_type}
                  onChange={(e) => setNewProjectData({...newProjectData, project_type: e.target.value})}
                  placeholder={language === 'fa' ? 'مثال: مسکونی، تجاری' : 'Example: Residential, Commercial'}
                />
              </div>
              <div className={styles.formField}>
                <label>{language === 'fa' ? 'مساحت' : 'Area'}</label>
                <input
                  type="text"
                  value={newProjectData.area}
                  onChange={(e) => setNewProjectData({...newProjectData, area: e.target.value})}
                  placeholder={language === 'fa' ? 'مثال: ۱۲,۵۰۰ مترمربع' : 'Example: 12,500 sqm'}
                />
              </div>
              <div className={styles.formField}>
                <label>{language === 'fa' ? 'وضعیت' : 'Status'}</label>
                <select
                  value={newProjectData.status}
                  onChange={(e) => setNewProjectData({...newProjectData, status: e.target.value})}
                >
                  <option value="completed">{language === 'fa' ? 'تکمیل شده' : 'Completed'}</option>
                  <option value="ongoing">{language === 'fa' ? 'در حال اجرا' : 'In Progress'}</option>
                  <option value="planned">{language === 'fa' ? 'برنامه‌ریزی شده' : 'Planned'}</option>
                </select>
              </div>
              <div className={styles.formField}>
                <label>{language === 'fa' ? 'تاریخ' : 'Date'}</label>
                <input
                  type="date"
                  value={newProjectData.date}
                  onChange={(e) => setNewProjectData({...newProjectData, date: e.target.value})}
                />
              </div>
              <div className={styles.formField}>
                <label>{language === 'fa' ? 'تصویر' : 'Image'}</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setNewProjectData({...newProjectData, image: e.target.files[0]})}
                />
              </div>
            </div>
            <div className={styles.formActions}>
              <button className={styles.saveBtn} onClick={addProject}>
                <Save size={16} /> {language === 'fa' ? 'ذخیره' : 'Save'}
              </button>
              <button className={styles.cancelBtn} onClick={() => setIsAdding(false)}>
                <X size={16} /> {language === 'fa' ? 'لغو' : 'Cancel'}
              </button>
            </div>
          </div>
        )}

        <div className={styles.projectGrid}>
          {currentProjects.map((item) => (
            <a 
              href={`/projects/${item.id}`} 
              key={item.id} 
              className={styles.projectCardLink}
            >
              <div className={styles.projectCard}>
                {isAdmin && !isEditing && (
                  <div className={styles.projectActions}>
                    <button
                      className={styles.editProjectBtn}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        startEditing(item)
                      }}
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      className={styles.deleteProjectBtn}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        deleteProject(item.id)
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
                
                {isEditing && editData?.id === item.id ? (
                  <div className={styles.editProjectForm} onClick={(e) => e.stopPropagation()}>
                    <div className={styles.formField}>
                      <input
                        type="text"
                        value={editData.title_fa}
                        onChange={(e) => setEditData({...editData, title_fa: e.target.value})}
                        placeholder="عنوان فارسی"
                      />
                    </div>
                    <div className={styles.formField}>
                      <input
                        type="text"
                        value={editData.title_en}
                        onChange={(e) => setEditData({...editData, title_en: e.target.value})}
                        placeholder="عنوان انگلیسی"
                      />
                    </div>
                    <div className={styles.formField}>
                      <textarea
                        value={editData.excerpt_fa}
                        onChange={(e) => setEditData({...editData, excerpt_fa: e.target.value})}
                        placeholder="خلاصه فارسی"
                        rows="2"
                      />
                    </div>
                    <div className={styles.formField}>
                      <textarea
                        value={editData.excerpt_en}
                        onChange={(e) => setEditData({...editData, excerpt_en: e.target.value})}
                        placeholder="خلاصه انگلیسی"
                        rows="2"
                      />
                    </div>
                    <div className={styles.formField}>
                      <input
                        type="text"
                        value={editData.location_fa}
                        onChange={(e) => setEditData({...editData, location_fa: e.target.value})}
                        placeholder="موقعیت فارسی"
                      />
                    </div>
                    <div className={styles.formField}>
                      <input
                        type="text"
                        value={editData.location_en}
                        onChange={(e) => setEditData({...editData, location_en: e.target.value})}
                        placeholder="موقعیت انگلیسی"
                      />
                    </div>
                    <div className={styles.editActions}>
                      <button className={styles.saveBtn} onClick={saveEditing}>
                        <Save size={14} /> {language === 'fa' ? 'ذخیره' : 'Save'}
                      </button>
                      <button className={styles.cancelBtn} onClick={() => {
                        setIsEditing(false)
                        setEditData(null)
                      }}>
                        <X size={14} /> {language === 'fa' ? 'لغو' : 'Cancel'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className={styles.projectImageWrapper}>
                      <img
                        src={item.image}
                        alt={language === 'fa' ? item.title_fa : item.title_en}
                        className={styles.projectImage}
                      />
                      <div className={styles.projectOverlay}></div>
                      
                      <div className={styles.projectOverlayContent}>
                        {/* Status Badge */}
                        <div className={styles.projectStatusBadge}>
                          <span 
                            className={styles.statusDot} 
                            style={{ backgroundColor: getStatusColor(item.status) }}
                          />
                          {getStatusLabel(item.status)}
                        </div>

                        <h3 className={styles.projectCardTitle}>
                          {language === 'fa' ? item.title_fa : item.title_en}
                        </h3>

                        <div className={styles.projectExcerptWrapper}>
                          <p className={styles.projectExcerpt}>
                            {language === 'fa' ? item.excerpt_fa : item.excerpt_en}
                          </p>
                        </div>

                        <div className={styles.projectBadges}>
                          <span className={styles.badge}>
                            <MapPin size={12} />
                            {language === 'fa' ? item.location_fa : item.location_en}
                          </span>
                          <span className={styles.badge}>
                            <Building size={12} />
                            {item.project_type}
                          </span>
                          <span className={styles.badge}>
                            <Calendar size={12} />
                            {formatDate(item.date)}
                          </span>
                          <span className={styles.badge}>
                            <Eye size={12} />
                            {item.views}
                          </span>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </a>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className={styles.pagination}>
            <button 
              className={styles.pageBtn} 
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft size={20} />
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
              <button
                key={number}
                className={`${styles.pageBtn} ${currentPage === number ? styles.active : ''}`}
                onClick={() => handlePageChange(number)}
              >
                {number}
              </button>
            ))}

            <button 
              className={styles.pageBtn} 
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}

        <div className={styles.projectFooter}>
          <a href="/projects" className={styles.projectFooterBtn}>
            {language === 'fa' ? 'مشاهده تمام پروژه‌ها' : 'View All Projects'}
            <ChevronLeft size={20} />
          </a>
        </div>
      </div>
    </section>
  )
}

export default ProjectSection