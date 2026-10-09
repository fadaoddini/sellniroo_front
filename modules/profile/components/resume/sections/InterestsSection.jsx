// modules/profile/components/resume/sections/InterestsSection.jsx
"use client";

import { useState } from "react";
import axios from "axios";
import Config from "@/config/config";
import { useAuth } from "@/contexts/AuthContext";
import styles from "../ResumeForm.module.css";
import { Plus, Trash2, Loader2, Heart } from "lucide-react";

const InterestsSection = ({ resume, onRefresh }) => {
  const { getAuthHeaders } = useAuth();
  const [items, setItems] = useState(resume?.interests || []);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  if (!resume) {
    return <div className={styles.infoBox}>ابتدا اطلاعات پایه رزومه را ذخیره کنید.</div>;
  }

  const handleAdd = async () => {
    if (!name.trim()) return;
    try {
      setSaving(true);
      const res = await axios.post(
        Config.endpoints.jobisell.resumeSections.interests.list(),
        { name },
        { headers: getAuthHeaders() }
      );
      setItems((prev) => [...prev, res.data]);
      setName("");
      onRefresh?.();
    } catch (err) {
      alert("خطا در افزودن");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(
        Config.endpoints.jobisell.resumeSections.interests.detail(id),
        { headers: getAuthHeaders() }
      );
      setItems((prev) => prev.filter((it) => it.id !== id));
      onRefresh?.();
    } catch (err) {}
  };

  return (
    <div className={styles.sectionWrapper}>
      <div className={styles.sectionHeader}>
        <h3>علاقه‌مندی‌ها</h3>
      </div>

      <div className={styles.addInlineForm}>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="مثلاً: مطالعه، ورزش، سفر"
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
        />
        <button type="button" onClick={handleAdd} disabled={saving || !name.trim()}>
          {saving ? <Loader2 size={14} className={styles.spin} /> : <Plus size={14} />}
          افزودن
        </button>
      </div>

      {items.length > 0 && (
        <div className={styles.tagsList}>
          {items.map((item) => (
            <div key={item.id} className={styles.tag}>
              {item.name}
              <button type="button" onClick={() => handleDelete(item.id)}>
                <Trash2 size={11} />
              </button>
            </div>
          ))}
        </div>
      )}

      {items.length === 0 && (
        <div className={styles.emptyBox}>
          <Heart size={32} />
          <p>هنوز علاقه‌مندی اضافه نکرده‌اید</p>
        </div>
      )}
    </div>
  );
};

export default InterestsSection;