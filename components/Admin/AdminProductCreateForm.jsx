'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { Check, ImagePlus, Loader2, Plus, X } from 'lucide-react'
import CKEditorWrapper from '@/components/newsAdmin/CKEditorWrapper'
import ProductFormExtras from '@/app/(site)/shop-panel/ProductFormExtras'
import {
  buildCategoryIndex,
  filterAssignableCategories,
  isLeafCategory,
} from '@/app/(site)/shop-panel/categoryTree'
import platformShopApi from '@/services/platformShopApi'
import styles from '@/app/(site)/shop-panel/ShopPanel.module.css'

function emptyExtrasForm() {
  return {
    title: '',
    category: '',
    price_one: '',
    discount: '0',
    stock: '',
    lid: '',
    description: '',
    has_colors: false,
    has_sizes: false,
    is_virtual: false,
    has_warranty: false,
    warranty_until: '',
    is_featured: false,
    featured_until: '',
  }
}

/**
 * فرم افزودن محصول — همان تجربه /shop-panel برای adminproducts
 */
export default function AdminProductCreateForm({
  shops = [],
  categories = [],
  singleStore = false,
  lockedShopId = '',
  defaultShopId = '',
  onCancel,
  onCreated,
}) {
  const [form, setForm] = useState(emptyExtrasForm)
  const [shopId, setShopId] = useState(
    () => String(lockedShopId || defaultShopId || ''),
  )
  const [priceTiers, setPriceTiers] = useState([])
  const [imageFiles, setImageFiles] = useState([])
  const [selectedColors, setSelectedColors] = useState([])
  const [selectedSizes, setSelectedSizes] = useState([])
  const [videoFile, setVideoFile] = useState(null)
  const [posterFile, setPosterFile] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (lockedShopId) setShopId(String(lockedShopId))
  }, [lockedShopId])

  const previews = useMemo(
    () =>
      imageFiles.map((file) => ({
        name: file.name,
        url: URL.createObjectURL(file),
      })),
    [imageFiles],
  )

  useEffect(() => {
    return () => {
      previews.forEach((p) => URL.revokeObjectURL(p.url))
    }
  }, [previews])

  const shopOptions = singleStore
    ? shops.filter((s) => String(s.id) === String(lockedShopId || shopId))
    : shops

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      const sid = singleStore ? lockedShopId || shopId : shopId
      if (!sid) throw new Error('فروشگاه را انتخاب کنید')
      if (!form.title.trim()) throw new Error('عنوان محصول را وارد کنید')

      const stockNum = Number(form.stock)
      if (form.stock === '' || Number.isNaN(stockNum) || stockNum < 0) {
        throw new Error('موجودی محصول را وارد کنید')
      }
      if (!form.category) throw new Error('دسته‌بندی را انتخاب کنید')

      const assignable = filterAssignableCategories(categories)
      const { byId, childrenOf } = buildCategoryIndex(assignable)
      const cat = byId.get(String(form.category))
      if (!cat || !isLeafCategory(cat, childrenOf)) {
        throw new Error(
          'فقط زیرمجموعه نهایی فعال قابل انتخاب است — دسته والد یا غیرفعال مجاز نیست',
        )
      }
      if (form.has_colors && !selectedColors.length) {
        throw new Error('حداقل یک رنگ انتخاب کنید یا گزینه رنگ را خاموش کنید')
      }
      if (form.has_sizes && !selectedSizes.length) {
        throw new Error('حداقل یک سایز انتخاب کنید یا گزینه سایز را خاموش کنید')
      }
      if (form.has_warranty && !form.warranty_until) {
        throw new Error('تاریخ پایان ضمانت را مشخص کنید')
      }
      if (videoFile && videoFile.size > 50 * 1024 * 1024) {
        throw new Error('حجم ویدیو نباید بیشتر از ۵۰ مگابایت باشد')
      }

      const tiersPayload = priceTiers
        .map((t) => ({
          min_quantity: Number(t.min_quantity) || 0,
          unit_price: Number(t.unit_price) || 0,
        }))
        .filter((t) => t.min_quantity >= 1 && t.unit_price >= 0)

      const created = await platformShopApi.createProduct({
        shop: Number(sid),
        title: form.title.trim(),
        category: Number(form.category),
        price_one: Number(form.price_one) || 0,
        discount: Number(form.discount) || 0,
        stock: stockNum,
        stock_remaining: stockNum,
        stock_total: stockNum,
        number_max: Math.max(stockNum, 1),
        lid: form.lid,
        description: form.description,
        price_tiers: tiersPayload,
        has_colors: !!form.has_colors,
        colors: form.has_colors ? selectedColors : [],
        has_sizes: !!form.has_sizes,
        sizes: form.has_sizes ? selectedSizes : [],
        is_virtual: !!form.is_virtual,
        has_warranty: !!form.has_warranty,
        warranty_until: form.has_warranty ? form.warranty_until : null,
        is_featured: !!form.is_featured,
        featured_until: form.is_featured ? form.featured_until || null : null,
        status: 'active',
      })

      if (created?.id && imageFiles.length) {
        for (const file of imageFiles) {
          await platformShopApi.uploadProductImage(created.id, file)
        }
      }
      if (created?.id && (videoFile || posterFile)) {
        await platformShopApi.uploadProductMedia(created.id, {
          video: videoFile || undefined,
          poster: posterFile || undefined,
        })
      }

      onCreated?.(created)
    } catch (err) {
      setError(err?.message || err?.error || 'ثبت محصول ناموفق بود')
    } finally {
      setBusy(false)
    }
  }

  return (
    <form
      className={`${styles.formCard} ${styles.productForm}`}
      onSubmit={submit}
      dir="rtl"
    >
      <div className={styles.formHead}>
        <div>
          <h3>محصول جدید</h3>
          <p>عنوان، دسته، قیمت، تصویر و ویژگی‌ها — مثل پنل فروشگاه</p>
        </div>
        <button
          type="button"
          className={styles.iconRound}
          aria-label="بستن"
          onClick={onCancel}
        >
          <X size={15} />
        </button>
      </div>

      {error ? <div className={styles.err}>{error}</div> : null}

      <div className={styles.productFormCols} dir="rtl">
        <div className={`${styles.fieldGroup} ${styles.colMain}`}>
          <p className={styles.fieldGroupTitle}>محصول</p>
          <div className={styles.formStack}>
            {!singleStore ? (
              <label>
                فروشگاه
                <select
                  required
                  value={shopId}
                  onChange={(e) => setShopId(e.target.value)}
                >
                  <option value="">انتخاب فروشگاه…</option>
                  {shopOptions.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.title}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}
            <label>
              عنوان محصول
              <input
                required
                placeholder="مثلاً برنج طارم یک کیلو"
                value={form.title}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
              />
            </label>
          </div>
        </div>

        <div className={`${styles.fieldGroup} ${styles.colPrice}`}>
          <p className={styles.fieldGroupTitle}>قیمت و موجودی</p>
          <div className={styles.formStack}>
            <label>
              قیمت پایه هر عدد (تومان)
              <input
                required
                type="number"
                min="0"
                inputMode="numeric"
                placeholder="0"
                value={form.price_one}
                onChange={(e) =>
                  setForm((f) => ({ ...f, price_one: e.target.value }))
                }
              />
            </label>
            <div className={styles.priceRow}>
              <label>
                تخفیف ٪
                <input
                  type="number"
                  min="0"
                  max="100"
                  inputMode="numeric"
                  value={form.discount}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, discount: e.target.value }))
                  }
                />
              </label>
              <label>
                موجودی *
                <input
                  required
                  type="number"
                  min="0"
                  inputMode="numeric"
                  placeholder="مثلاً ۵۰"
                  value={form.stock}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, stock: e.target.value }))
                  }
                />
              </label>
            </div>
            <div className={styles.tierBlock}>
              <div className={styles.tierHead}>
                <span>قیمت تعدادی (اختیاری)</span>
                <button
                  type="button"
                  className={styles.tierAddBtn}
                  onClick={() =>
                    setPriceTiers((rows) => [
                      ...rows,
                      { min_quantity: '', unit_price: '' },
                    ])
                  }
                >
                  <Plus size={13} />
                  پله جدید
                </button>
              </div>
              <p className={styles.fileHint}>
                مثال: از ۳ عدد به بالا هر عدد قیمت جداگانه
              </p>
              {priceTiers.map((tier, idx) => (
                <div key={`tier-${idx}`} className={styles.tierRow}>
                  <label>
                    از تعداد
                    <input
                      type="number"
                      min="2"
                      inputMode="numeric"
                      placeholder="۳"
                      value={tier.min_quantity}
                      onChange={(e) =>
                        setPriceTiers((rows) =>
                          rows.map((r, i) =>
                            i === idx
                              ? { ...r, min_quantity: e.target.value }
                              : r,
                          ),
                        )
                      }
                    />
                  </label>
                  <label>
                    قیمت هر عدد
                    <input
                      type="number"
                      min="0"
                      inputMode="numeric"
                      placeholder="تومان"
                      value={tier.unit_price}
                      onChange={(e) =>
                        setPriceTiers((rows) =>
                          rows.map((r, i) =>
                            i === idx
                              ? { ...r, unit_price: e.target.value }
                              : r,
                          ),
                        )
                      }
                    />
                  </label>
                  <button
                    type="button"
                    className={styles.tierRemoveBtn}
                    title="حذف پله"
                    onClick={() =>
                      setPriceTiers((rows) =>
                        rows.filter((_, i) => i !== idx),
                      )
                    }
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className={`${styles.fieldGroup} ${styles.colMedia}`}>
          <p className={styles.fieldGroupTitle}>تصاویر</p>
          <label className={styles.dropZone}>
            <input
              className={styles.dropZoneInput}
              type="file"
              accept="image/*"
              multiple
              onChange={(e) =>
                setImageFiles(Array.from(e.target.files || []).slice(0, 8))
              }
            />
            <span className={styles.dropZoneIcon}>
              <ImagePlus size={20} strokeWidth={1.6} />
            </span>
            <strong>انتخاب تصویر</strong>
            <span>حداکثر ۸ تصویر</span>
          </label>
          {previews.length ? (
            <div className={styles.previewGrid}>
              {previews.map((item, idx) => (
                <div key={`${item.name}-${idx}`} className={styles.previewThumb}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.url} alt="" />
                  <button
                    type="button"
                    title="حذف"
                    onClick={() =>
                      setImageFiles((files) =>
                        files.filter((_, i) => i !== idx),
                      )
                    }
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className={styles.fileHint}>بعداً هم می‌توانید تصویر اضافه کنید.</p>
          )}
        </div>

        <div className={`${styles.fieldGroup} ${styles.colDesc}`}>
          <p className={styles.fieldGroupTitle}>توضیحات</p>
          <div className={styles.formStack}>
            <div className={styles.editorField}>
              <span className={styles.editorLabel}>توضیح کوتاه</span>
              <div className={styles.editorShell}>
                <CKEditorWrapper
                  key="admin-product-lid"
                  value={form.lid}
                  placeholder="خلاصه کوتاه برای کارت محصول…"
                  onChange={(html) => setForm((f) => ({ ...f, lid: html }))}
                />
              </div>
            </div>
            <div className={styles.editorField}>
              <span className={styles.editorLabel}>توضیحات کامل</span>
              <div className={styles.editorShell}>
                <CKEditorWrapper
                  key="admin-product-description"
                  value={form.description}
                  placeholder="جزئیات، ویژگی‌ها یا شرایط ارسال…"
                  onChange={(html) =>
                    setForm((f) => ({ ...f, description: html }))
                  }
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <ProductFormExtras
        form={form}
        setForm={setForm}
        categories={categories}
        selectedColors={selectedColors}
        setSelectedColors={setSelectedColors}
        selectedSizes={selectedSizes}
        setSelectedSizes={setSelectedSizes}
        videoFile={videoFile}
        setVideoFile={setVideoFile}
        posterFile={posterFile}
        setPosterFile={setPosterFile}
      />

      <div className={styles.formActions}>
        <button type="submit" className={styles.primaryBtn} disabled={busy}>
          {busy ? (
            <>
              <Loader2 size={15} className={styles.spin} />
              در حال ثبت…
            </>
          ) : (
            <>
              <Check size={15} />
              ثبت محصول
            </>
          )}
        </button>
        <button
          type="button"
          className={styles.ghostBtn}
          disabled={busy}
          onClick={onCancel}
        >
          انصراف
        </button>
      </div>
    </form>
  )
}
