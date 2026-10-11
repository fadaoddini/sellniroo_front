// modules/profile/components/resume/sections/AwardsSection.jsx
"use client";

import { useState } from "react";
import axios from "axios";
import Config from "@/config/config";
import { useAuth } from "@/contexts/AuthContext";
import styles from "../ResumeForm.module.css";
import PersianDatePicker from "@/components/common/PersianDatePicker";
import { Plus, Trash2, Edit2, Check, X, Loader2, Trophy } from "lucide-react";

const emptyForm = {
  title: "",
  issuer: "",
  date: "",
  description: "",
};

const AwardsSection = ({ resume, onRefresh }) => {
  const { getAuthHeaders } = useAuth();
  const [items, setItems] = useState(resume?.awards || []);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  if (!resume) {
    return <div className={styles.infoBox}>ابتدا اطلاعات پایه رزومه را ذخیره کنید.</div>;
  }

  const handleSave = async () => {
    if (!formData.title.trim()) {
      setError("عنوان الزامی است");
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const payload = { ...formData };
      if (!payload.issuer) delete payload.issuer;
      if (!payload.date) delete payload.date;
      if (!payload.description) delete payload.description;

      const url = editingId
        ? Config.endpoints.jobisell.resumeSections.awards.detail(editingId)
        : Config.endpoints.jobisell.resumeSections.awards.list();

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
      setError(err.response?.data?.detail || "خطا در ذخیره");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item) => {
    setFormData({
      title: item.title,
      issuer: item.issuer || "",
      date: item.date || "",
      description: item.description || "",
    });
    setEditingId(item.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("آیا مطمئن هستید؟")) return;
    try {
      await axios.delete(
        Config.endpoints.jobisell.resumeSections.awards.detail(id),
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
        <h3>افتخارات</h3>
        {!showForm && (
          <button type="button" className={styles.addBtn} onClick={() => setShowForm(true)}>
            <Plus size={14} /> افزودن
          </button>
        )}
      </div>

      {items.length > 0 && (
        <div className={styles.itemsList}>
          {items.map((item) => (
            <div key={item.id} className={styles.listItem}>
              <div className={styles.listItemContent}>
                <h4>{item.title}</h4>
                {item.issuer && <p>{item.issuer}</p>}
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
              <label>عنوان *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div className={styles.formGroup}>
              <label>صادرکننده</label>
              <input
                type="text"
                value={formData.issuer}
                onChange={(e) => setFormData({ ...formData, issuer: e.target.value })}
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>تاریخ</label>
            <PersianDatePicker
              value={formData.date}
              onChange={(date) =>
                setFormData({ ...formData, date: date || "" })
              }
              placeholder="انتخاب تاریخ"
            />
          </div>

          <div className={styles.formGroup}>
            <label>توضیحات</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={2}
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
          <Trophy size={32} />
          <p>هنوز افتخاری اضافه نکرده‌اید</p>
        </div>
      )}
    </div>
  );
};

export default AwardsSection;