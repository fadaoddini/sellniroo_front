// modules/profile/components/resume/sections/LanguagesSection.jsx
"use client";

import { useState } from "react";
import axios from "axios";
import Config from "@/config/config";
import { useAuth } from "@/contexts/AuthContext";
import styles from "../ResumeForm.module.css";
import { Plus, Trash2, Edit2, Check, X, Loader2, Globe } from "lucide-react";

const LEVELS = [
  { value: "a1", label: "A1 - مبتدی" },
  { value: "a2", label: "A2 - پایه" },
  { value: "b1", label: "B1 - متوسط" },
  { value: "b2", label: "B2 - متوسط بالا" },
  { value: "c1", label: "C1 - پیشرفته" },
  { value: "c2", label: "C2 - تسلط کامل" },
  { value: "native", label: "زبان مادری" },
];

const emptyForm = {
  name: "",
  level: "b2",
  certificate: "",
};

const LanguagesSection = ({ resume, onRefresh }) => {
  const { getAuthHeaders } = useAuth();
  const [items, setItems] = useState(resume?.languages || []);
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
      setError("نام زبان الزامی است");
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const url = editingId
        ? Config.endpoints.jobisell.resumeSections.languages.detail(editingId)
        : Config.endpoints.jobisell.resumeSections.languages.list();

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
      setError(err.response?.data?.detail || "خطا در ذخیره");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item) => {
    setFormData({
      name: item.name,
      level: item.level,
      certificate: item.certificate || "",
    });
    setEditingId(item.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("آیا مطمئن هستید؟")) return;
    try {
      await axios.delete(
        Config.endpoints.jobisell.resumeSections.languages.detail(id),
        { headers: getAuthHeaders() }
      );
      setItems((prev) => prev.filter((it) => it.id !== id));
      onRefresh?.();
    } catch (err) {}
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
        <h3>زبان‌ها</h3>
        {!showForm && (
          <button type="button" className={styles.addBtn} onClick={() => setShowForm(true)}>
            <Plus size={14} /> افزودن زبان
          </button>
        )}
      </div>

      {items.length > 0 && (
        <div className={styles.itemsList}>
          {items.map((item) => (
            <div key={item.id} className={styles.listItem}>
              <div className={styles.listItemContent}>
                <h4>{item.name}</h4>
                <p>{item.level_display}{item.certificate && ` • ${item.certificate}`}</p>
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
              <label>نام زبان *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="انگلیسی، عربی، ..."
              />
            </div>
            <div className={styles.formGroup}>
              <label>سطح</label>
              <select
                value={formData.level}
                onChange={(e) => setFormData({ ...formData, level: e.target.value })}
              >
                {LEVELS.map((l) => (
                  <option key={l.value} value={l.value}>{l.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>مدرک (اختیاری)</label>
            <input
              type="text"
              value={formData.certificate}
              onChange={(e) => setFormData({ ...formData, certificate: e.target.value })}
              placeholder="مثلاً: IELTS 7.0"
            />
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
          <Globe size={32} />
          <p>هنوز زبانی اضافه نکرده‌اید</p>
        </div>
      )}
    </div>
  );
};

export default LanguagesSection;