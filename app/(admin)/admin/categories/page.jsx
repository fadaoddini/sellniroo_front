// src/app/admin/categories/page.jsx
'use client'

import React, { useState } from 'react'
import DataTable from '@/components/Admin/DataTable/DataTable'
import AdminModal from '@/components/Admin/AdminModal/AdminModal'
import AdminForm, { FormGroup } from '@/components/Admin/AdminForm/AdminForm'
import styles from './page.module.css'

const categoriesData = [
  { id: 1, name: 'فروش', parent: 'اصلی', status: 'فعال', count: 45 },
  { id: 2, name: 'بازاریابی', parent: 'اصلی', status: 'فعال', count: 32 },
  { id: 3, name: 'مدیریت', parent: 'اصلی', status: 'فعال', count: 18 },
  { id: 4, name: 'فروش تلفنی', parent: 'فروش', status: 'غیرفعال', count: 12 },
]

const columns = [
  { key: 'name', label: 'نام دسته' },
  { key: 'parent', label: 'دسته والد' },
  { key: 'status', label: 'وضعیت' },
  { key: 'count', label: 'تعداد آگهی' },
]

export default function CategoriesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)

  const handleAdd = () => {
    setEditingCategory(null)
    setIsModalOpen(true)
  }

  const handleEdit = (item) => {
    setEditingCategory(item)
    setIsModalOpen(true)
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>دسته بندی‌ها</h1>
          <p className={styles.pageDesc}>مدیریت دسته بندی‌های آگهی‌ها</p>
        </div>
        <button className={styles.addBtn} onClick={handleAdd}>
          + افزودن دسته
        </button>
      </div>

      <DataTable 
        data={categoriesData} 
        columns={columns}
        onEdit={handleEdit}
        onDelete={() => {}}
      />

      <AdminModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title={editingCategory ? 'ویرایش دسته' : 'افزودن دسته جدید'}
      >
        <AdminForm onSubmit={() => {}} onCancel={() => setIsModalOpen(false)}>
          <FormGroup label="نام دسته" required>
            <input type="text" placeholder="نام دسته را وارد کنید" />
          </FormGroup>
          <FormGroup label="دسته والد">
            <select>
              <option value="">بدون والد</option>
              <option value="فروش">فروش</option>
              <option value="بازاریابی">بازاریابی</option>
            </select>
          </FormGroup>
          <FormGroup label="وضعیت">
            <select>
              <option value="active">فعال</option>
              <option value="inactive">غیرفعال</option>
            </select>
          </FormGroup>
        </AdminForm>
      </AdminModal>
    </div>
  )
}