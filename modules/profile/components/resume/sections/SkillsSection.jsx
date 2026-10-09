// modules/profile/components/resume/sections/SkillsSection.jsx
"use client";

import { useState } from "react";
import axios from "axios";
import Config from "@/config/config";
import { useAuth } from "@/contexts/AuthContext";
import styles from "../ResumeForm.module.css";
import { Plus, Trash2, Edit2, Check, X, Loader2, Award } from "lucide-react";

const LEVELS = [
  { value: 1, label: "مبتدی" },
  { value: 2, label: "متوسط" },
  { value: 3, label: "خوب" },
  { value: 4, label: "پیشرفته" },
  { value: 5, label: "حرفه‌ای" },
];

const CATEGORIES = [
  { value: "technical", label: "فنی و تخصصی" },
  { value: "soft", label: "مهارت‌های نرم" },
  { value: "language", label: "زبان" },
  { value: "tool", label: "ابزار و نرم‌افزار" },
  { value: "other", label: "سایر" },
];

const emptyForm = {
  name: "",
  level: 3,
  category: "technical",
};

const SkillsSection = ({ resume, onRefresh }) => {
  const { getAuthHeaders } = useAuth();
  const [items, setItems] = useState(resume?.skills || []);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  if (!resume) {
    return (
      <div className={styles.infoBox}>
        ابتدا اطلاعات پایه رزومه را ذخیره کنید.
      </div>
    );
  }

  const handleSave = async () => {
    if (!formData.name.trim()) {
      setError("نام مهارت الزامی است");
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const url = editingId
        ? Config.endpoints.jobisell.resumeSections.skills.detail(editingId)
        : Config.endpoints.jobisell.resumeSections.skills.list();

      const method = editingId ? "patch" : "post";
      const res = await axios[method](url, formData, { headers: getAuthHeaders() });

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
      name: item.name,
      level: item.level,
      category: item.category,
    });
    setEditingId(item.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("آیا مطمئن هستید؟")) return;
    try {
      await axios.delete(
        Config.endpoints.jobisell.resumeSections.skills.detail(id),
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
        <h3>مهارت‌ها</h3>
        {!showForm && (
          <button type="button" className={styles.addBtn} onClick={() => setShowForm(true)}>
            <Plus size={14} />
            افزودن مهارت
          </button>
        )}
      </div>

      {items.length > 0 && (
        <div className={styles.itemsList}>
          {items.map((item) => (
            <div key={item.id} className={styles.listItem}>
              <div className={styles.listItemContent}>
                <h4>{item.name}</h4>
                <p>{item.category_display} • {item.level_display}</p>
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
              <label>نام مهارت *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="مثلاً: React، فروش تلفنی، مدیریت تیم"
              />
            </div>
            <div className={styles.formGroup}>
              <label>دسته‌بندی</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>سطح تسلط</label>
            <select
              value={formData.level}
              onChange={(e) => setFormData({ ...formData, level: Number(e.target.value) })}
            >
              {LEVELS.map((l) => (
                <option key={l.value} value={l.value}>{l.label}</option>
              ))}
            </select>
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
          <Award size={32} />
          <p>هنوز مهارتی اضافه نکرده‌اید</p>
        </div>
      )}
    </div>
  );
};

export default SkillsSection;