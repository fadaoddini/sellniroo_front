// modules/profile/components/resume/sections/EducationSection.jsx
"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Config from "@/config/config";
import { useAuth } from "@/contexts/AuthContext";
import styles from "../ResumeForm.module.css";
import PersianDatePicker from "@/components/common/PersianDatePicker";
import {
  Plus, Trash2, Edit2, Check, X, Loader2, GraduationCap,
} from "lucide-react";
import moment from "moment-jalaali";

moment.loadPersian({ dialect: "persian-modern" });

const DEGREES = [
  { value: "diploma", label: "دیپلم" },
  { value: "associate", label: "کاردانی" },
  { value: "bachelor", label: "کارشناسی" },
  { value: "master", label: "کارشناسی ارشد" },
  { value: "phd", label: "دکتری" },
  { value: "postdoc", label: "فوق دکتری" },
];

const emptyForm = {
  degree: "bachelor",
  field_of_study: "",
  institution: "",
  city: "",
  start_date: "",
  end_date: "",
  is_current: false,
  gpa: "",
  description: "",
};

const EducationSection = ({ resume, onRefresh }) => {
  const { getAuthHeaders } = useAuth();
  const [items, setItems] = useState(resume?.educations || []);
  const [cities, setCities] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const res = await axios.get(Config.endpoints.jobisell.cities(), {
          headers: getAuthHeaders(),
        });
        setCities(res.data?.results || res.data || []);
      } catch (e) {}
    };
    fetchCities();
  }, []);

  if (!resume) {
    return (
      <div className={styles.infoBox}>
        ابتدا اطلاعات پایه رزومه را ذخیره کنید.
      </div>
    );
  }

  const handleSave = async () => {
    if (!formData.field_of_study || !formData.institution || !formData.start_date) {
      setError("رشته، نام دانشگاه و تاریخ شروع الزامی است");
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const payload = { ...formData };
      if (payload.is_current) payload.end_date = null;
      if (payload.city === "") delete payload.city;
      if (payload.gpa === "") delete payload.gpa;

      const url = editingId
        ? Config.endpoints.jobisell.resumeSections.educations.detail(editingId)
        : Config.endpoints.jobisell.resumeSections.educations.list();

      const method = editingId ? "patch" : "post";
      const res = await axios[method](url, payload, { headers: getAuthHeaders() });

      if (editingId) {
        setItems((prev) => prev.map((it) => (it.id === editingId ? res.data : it)));
      } else {
        setItems((prev) => [...prev, res.data]);
      }

      setFormData(emptyForm);
      setEditingId(null);
      setShowForm(false);
      onRefresh?.();
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        err.response?.data?.message ||
        "خطا در ذخیره"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item) => {
    setFormData({
      degree: item.degree,
      field_of_study: item.field_of_study,
      institution: item.institution,
      city: item.city || "",
      start_date: item.start_date,
      end_date: item.end_date || "",
      is_current: item.is_current,
      gpa: item.gpa || "",
      description: item.description || "",
    });
    setEditingId(item.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("آیا مطمئن هستید؟")) return;
    try {
      await axios.delete(
        Config.endpoints.jobisell.resumeSections.educations.detail(id),
        { headers: getAuthHeaders() }
      );
      setItems((prev) => prev.filter((it) => it.id !== id));
      onRefresh?.();
    } catch (err) {
      alert("خطا در حذف");
    }
  };

  const handleCancel = () => {
    setFormData(emptyForm);
    setEditingId(null);
    setShowForm(false);
    setError(null);
  };

  return (
    <div className={styles.sectionWrapper}>
      <div className={styles.sectionHeader}>
        <h3>تحصیلات</h3>
        {!showForm && (
          <button type="button" className={styles.addBtn} onClick={() => setShowForm(true)}>
            <Plus size={14} />
            افزودن تحصیلات
          </button>
        )}
      </div>

      {items.length > 0 && (
        <div className={styles.itemsList}>
          {items.map((item) => (
            <div key={item.id} className={styles.listItem}>
              <div className={styles.listItemContent}>
                <h4>{item.degree_display} {item.field_of_study}</h4>
                <p>{item.institution}</p>
                <span className={styles.listItemDate}>
                  {moment(item.start_date).format("jYYYY/jMM")} -{" "}
                  {item.is_current ? "در حال تحصیل" : moment(item.end_date).format("jYYYY/jMM")}
                </span>
              </div>
              <div className={styles.listItemActions}>
                <button type="button" onClick={() => handleEdit(item)}>
                  <Edit2 size={14} />
                </button>
                <button type="button" onClick={() => handleDelete(item.id)} className={styles.deleteBtn}>
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className={styles.subForm}>
          <div className={styles.row}>
            <div className={styles.formGroup}>
              <label>مقطع *</label>
              <select
                value={formData.degree}
                onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
              >
                {DEGREES.map((d) => (
                  <option key={d.value} value={d.value}>{d.label}</option>
                ))}
              </select>
            </div>
            <div className={styles.formGroup}>
              <label>رشته تحصیلی *</label>
              <input
                type="text"
                value={formData.field_of_study}
                onChange={(e) => setFormData({ ...formData, field_of_study: e.target.value })}
              />
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.formGroup}>
              <label>دانشگاه/موسسه *</label>
              <input
                type="text"
                value={formData.institution}
                onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
              />
            </div>
            <div className={styles.formGroup}>
              <label>شهر</label>
              <select
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              >
                <option value="">انتخاب کنید</option>
                {cities.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.formGroup}>
              <label>تاریخ شروع *</label>
              <PersianDatePicker
                value={formData.start_date}
                onChange={(date) =>
                  setFormData({ ...formData, start_date: date || "" })
                }
                placeholder="تاریخ شروع"
              />
            </div>
            <div className={styles.formGroup}>
              <label>تاریخ پایان</label>
              <PersianDatePicker
                value={formData.end_date}
                onChange={(date) =>
                  setFormData({ ...formData, end_date: date || "" })
                }
                disabled={formData.is_current}
                placeholder="تاریخ پایان"
              />
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.formGroup}>
              <label>
                <input
                  type="checkbox"
                  checked={formData.is_current}
                  onChange={(e) => setFormData({ ...formData, is_current: e.target.checked })}
                />
                {" "}در حال تحصیل
              </label>
            </div>
            <div className={styles.formGroup}>
              <label>معدل</label>
              <input
                type="text"
                value={formData.gpa}
                onChange={(e) => setFormData({ ...formData, gpa: e.target.value })}
                placeholder="مثلاً: 17.5"
                dir="ltr"
              />
            </div>
          </div>

          {error && <div className={styles.errorBox}>{error}</div>}

          <div className={styles.subFormActions}>
            <button type="button" onClick={handleCancel} disabled={saving}>
              <X size={14} /> لغو
            </button>
            <button type="button" className={styles.saveBtn} onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 size={14} className={styles.spin} /> : <Check size={14} />}
              {editingId ? "بروزرسانی" : "افزودن"}
            </button>
          </div>
        </div>
      )}

      {items.length === 0 && !showForm && (
        <div className={styles.emptyBox}>
          <GraduationCap size={32} />
          <p>هنوز تحصیلاتی اضافه نکرده‌اید</p>
        </div>
      )}
    </div>
  );
};

export default EducationSection;