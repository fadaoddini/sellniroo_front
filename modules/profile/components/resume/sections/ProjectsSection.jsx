// modules/profile/components/resume/sections/ProjectsSection.jsx
"use client";

import { useState } from "react";
import axios from "axios";
import Config from "@/config/config";
import { useAuth } from "@/contexts/AuthContext";
import styles from "../ResumeForm.module.css";
import PersianDatePicker from "@/components/common/PersianDatePicker";
import {
  Plus, Trash2, Edit2, Check, X, Loader2, FolderKanban,
} from "lucide-react";

const emptyForm = {
  title: "",
  role: "",
  description: "",
  link: "",
  start_date: "",
  end_date: "",
};

const ProjectsSection = ({ resume, onRefresh }) => {
  const { getAuthHeaders } = useAuth();
  const [items, setItems] = useState(resume?.projects || []);
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
    if (!formData.title.trim()) {
      setError("عنوان پروژه الزامی است");
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const payload = { ...formData };
      if (!payload.role) delete payload.role;
      if (!payload.description) delete payload.description;
      if (!payload.link) delete payload.link;
      if (!payload.start_date) delete payload.start_date;
      if (!payload.end_date) delete payload.end_date;

      const url = editingId
        ? Config.endpoints.jobisell.resumeSections.projects.detail(editingId)
        : Config.endpoints.jobisell.resumeSections.projects.list();

      const method = editingId ? "patch" : "post";
      const res = await axios[method](url, payload, {
        headers: getAuthHeaders(),
      });

      if (editingId) {
        setItems((prev) =>
          prev.map((it) => (it.id === editingId ? res.data : it))
        );
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
      role: item.role || "",
      description: item.description || "",
      link: item.link || "",
      start_date: item.start_date || "",
      end_date: item.end_date || "",
    });
    setEditingId(item.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("آیا مطمئن هستید؟")) return;
    try {
      await axios.delete(
        Config.endpoints.jobisell.resumeSections.projects.detail(id),
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
    <div className={`${styles.sectionWrapper} ${styles.miniPanel}`}>
      <div className={styles.sectionHeader}>
        <h3>پروژه‌ها</h3>
        {!showForm && (
          <button
            type="button"
            className={styles.addBtn}
            onClick={() => setShowForm(true)}
          >
            <Plus size={13} strokeWidth={2.4} />
            افزودن
          </button>
        )}
      </div>

      {items.length > 0 && (
        <div className={styles.itemsList}>
          {items.map((item) => (
            <div key={item.id} className={styles.listItem}>
              <div className={styles.listItemContent}>
                <div className={styles.miniItemMain}>
                  <h4>{item.title}</h4>
                  {item.role ? (
                    <>
                      <span className={styles.miniDot} aria-hidden>
                        ·
                      </span>
                      <p>{item.role}</p>
                    </>
                  ) : null}
                </div>
              </div>
              <div className={styles.listItemActions}>
                <button
                  type="button"
                  onClick={() => handleEdit(item)}
                  aria-label="ویرایش"
                >
                  <Edit2 size={12} strokeWidth={2.2} />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(item.id)}
                  className={styles.deleteBtn}
                  aria-label="حذف"
                >
                  <Trash2 size={12} strokeWidth={2.2} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className={styles.subForm}>
          <div className={styles.grid3}>
            <div className={styles.formGroup}>
              <label>عنوان پروژه *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="عنوان"
              />
            </div>
            <div className={styles.formGroup}>
              <label>نقش</label>
              <input
                type="text"
                value={formData.role}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value })
                }
                placeholder="توسعه‌دهنده اصلی"
              />
            </div>
            <div className={styles.formGroup}>
              <label>لینک</label>
              <input
                type="url"
                value={formData.link}
                onChange={(e) =>
                  setFormData({ ...formData, link: e.target.value })
                }
                placeholder="https://..."
                dir="ltr"
              />
            </div>
            <div className={styles.formGroup}>
              <label>تاریخ شروع</label>
              <PersianDatePicker
                value={formData.start_date}
                onChange={(date) =>
                  setFormData({ ...formData, start_date: date || "" })
                }
                placeholder="شروع"
              />
            </div>
            <div className={styles.formGroup}>
              <label>تاریخ پایان</label>
              <PersianDatePicker
                value={formData.end_date}
                onChange={(date) =>
                  setFormData({ ...formData, end_date: date || "" })
                }
                placeholder="پایان"
              />
            </div>
            <div className={`${styles.formGroup} ${styles.spanFull}`}>
              <label>توضیحات</label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={2}
                placeholder="خلاصه پروژه"
              />
            </div>
          </div>

          {error && <div className={styles.errorBox}>{error}</div>}

          <div className={styles.subFormActions}>
            <button type="button" onClick={handleCancel} disabled={saving}>
              <X size={13} /> لغو
            </button>
            <button
              type="button"
              className={styles.saveBtn}
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? (
                <Loader2 size={13} className={styles.spin} />
              ) : (
                <Check size={13} />
              )}
              {editingId ? "بروزرسانی" : "افزودن"}
            </button>
          </div>
        </div>
      )}

      {items.length === 0 && !showForm && (
        <div className={styles.emptyBox}>
          <FolderKanban size={22} strokeWidth={1.6} />
          <p>پروژه‌ای ثبت نشده</p>
        </div>
      )}
    </div>
  );
};

export default ProjectsSection;
