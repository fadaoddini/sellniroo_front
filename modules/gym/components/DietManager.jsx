// modules/gym/components/DietManager.jsx
'use client';

import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import clsx from 'clsx';
import {
  Archive, Utensils, Plus, Edit, Trash2, Check, X, Search,
  ArrowLeft, Clock, Calendar, GripVertical,
  ChevronDown, ChevronUp,
  Lock, Unlock, AlertCircle, Save, RotateCcw, Apple,
  Coffee, Flame, Sun, Moon, Cookie, Loader2,
} from 'lucide-react';
import styles from './DietManager.module.css';
import { useBodybuildingApi } from '@/hooks/useBodybuildingApi';
import FoodPickerModal from './modals/FoodPickerModal';
import DietArchivePickerModal from './modals/DietArchivePickerModal';
import AddDietWizard from './AddDietWizard';
import GymPersianCalendar from './GymPersianCalendar';
import {
  toApiDate,
  formatJalaliDate,
  isSameApiDay,
} from '@/modules/gym/utils/jalaliCalendar';

// ============================================
// ثابت‌ها
// ============================================
const MEAL_TYPES = [
  { value: 'breakfast', label: 'صبحانه', icon: Sun },
  { value: 'morning_snack', label: 'میان‌وعده صبح', icon: Cookie },
  { value: 'lunch', label: 'ناهار', icon: Utensils },
  { value: 'afternoon_snack', label: 'میان‌وعده عصر', icon: Cookie },
  { value: 'dinner', label: 'شام', icon: Moon },
  { value: 'night_snack', label: 'میان‌وعده شب', icon: Cookie },
  { value: 'pre_workout', label: 'قبل از تمرین', icon: Flame },
  { value: 'post_workout', label: 'بعد از تمرین', icon: Flame },
];

const MEAL_BOARD_COLUMNS = [
  {
    id: 'morning',
    title: 'صبح',
    hint: 'صبحانه تا قبل از ناهار',
    types: ['breakfast', 'morning_snack'],
  },
  {
    id: 'mid',
    title: 'میانه روز',
    hint: 'ناهار تا شام',
    types: ['lunch', 'afternoon_snack', 'pre_workout'],
  },
  {
    id: 'night',
    title: 'شب',
    hint: 'شام و وعده‌های شب',
    types: ['dinner', 'night_snack', 'post_workout'],
  },
];

// ============================================
// Helper ها
// ============================================
const mapMealTypeToApi = (label) => {
  const found = MEAL_TYPES.find((m) => m.label === label);
  return found ? found.value : 'breakfast';
};

const mapMealTypeFromApi = (value) => {
  const found = MEAL_TYPES.find((m) => m.value === value);
  return found ? found.label : value;
};

const getMealTypeIcon = (type) => {
  const found = MEAL_TYPES.find((m) => m.value === type || m.label === type);
  return found ? found.icon : Coffee;
};

// ============================================
// کامپوننت مودال عمومی
// ============================================
const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;
  return (
    <div className={styles.dietModalOverlay} onClick={onClose}>
      <div
        className={clsx(
          styles.dietModal,
          styles[`dietModal${size.charAt(0).toUpperCase() + size.slice(1)}`]
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.dietModalHeader}>
          <h3>{title}</h3>
          <button className={styles.dietModalClose} onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <div className={styles.dietModalBody}>{children}</div>
      </div>
    </div>
  );
};

// ============================================
// مودال تایید
// ============================================
const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  icon,
  variant = 'default',
  mode = 'confirm',
  confirmLabel = 'تایید',
  cancelLabel = 'انصراف',
}) => {
  if (!isOpen) return null;
  const isNotice = mode === 'notice';
  return (
    <div className={styles.dietModalOverlay} onClick={onClose}>
      <div
        className={clsx(styles.dietConfirmModal, isNotice && styles.dietConfirmModalNotice)}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className={clsx(
            styles.dietConfirmModalIcon,
            styles[`dietConfirmModalIcon${variant.charAt(0).toUpperCase() + variant.slice(1)}`]
          )}
        >
          {icon}
        </div>
        <h3 className={styles.dietConfirmModalTitle}>{title}</h3>
        <p className={styles.dietConfirmModalMessage}>{message}</p>
        <div className={styles.dietConfirmModalActions}>
          {!isNotice && (
            <button type="button" className={styles.dietCancelButton} onClick={onClose}>
              {cancelLabel}
            </button>
          )}
          <button
            type="button"
            className={clsx(
              styles.dietConfirmButton,
              variant === 'danger' && styles.dietConfirmButtonDanger,
              variant === 'warning' && styles.dietConfirmButtonWarning,
              variant === 'success' && styles.dietConfirmButtonSuccess,
            )}
            onClick={onConfirm || onClose}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================
// تقویم شمسی
// ============================================
// کامپوننت اصلی
// ============================================
export default function DietManager({ businessSlug, userId, userName, onClose, onSave }) {
  const api = useBodybuildingApi(businessSlug);

  // ===== States =====
  const [diets, setDiets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedDiet, setSelectedDiet] = useState(null);
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [selectedFood, setSelectedFood] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [composerOpen, setComposerOpen] = useState(false);
  const [showArchivePicker, setShowArchivePicker] = useState(false);
  const [archivingId, setArchivingId] = useState(null);
  const [showAddMealModal, setShowAddMealModal] = useState(false);
  const [showEditMealModal, setShowEditMealModal] = useState(false);
  const [showEditFoodModal, setShowEditFoodModal] = useState(false);
  const [showFoodPicker, setShowFoodPicker] = useState(false);

  // Confirm
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    icon: null,
    variant: 'default',
    mode: 'confirm',
    confirmLabel: 'تایید',
    cancelLabel: 'انصراف',
    onConfirm: null,
  });

  // Drag & Drop
  const [draggingMealId, setDraggingMealId] = useState(null);
  const [draggingFoodId, setDraggingFoodId] = useState(null);
  const dragRef = useRef(null);

  // Forms
  const [newMeal, setNewMeal] = useState({
    type: 'breakfast',
    time: '08:00',
    calories: 500,
  });

  const [newFood, setNewFood] = useState({
    name: '',
    amount: '',
    amount_value: 0,
    amount_unit: 'gram',
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
  });

  // ============================================
  // Fetch از API
  // ============================================
  useEffect(() => {
    const fetchPrograms = async () => {
      if (!businessSlug || !userId) return;
      try {
        setLoading(true);
        const data = await api.dietPrograms.list({ member: userId });
        const list = Array.isArray(data) ? data : data.results || [];
        setDiets(list);
      } catch (err) {
        console.error('Fetch error:', err);
        alert('خطا در دریافت برنامه‌های غذایی');
      } finally {
        setLoading(false);
      }
    };

    fetchPrograms();
  }, [businessSlug, userId]);

  // ============================================
  // برنامه‌های روز انتخاب شده
  // ============================================
  const dayDiets = useMemo(() => {
    const selectedStr = toApiDate(selectedDate);
    if (!selectedStr) return [];
    return diets.filter((d) => isSameApiDay(d.date, selectedStr));
  }, [diets, selectedDate]);

  // ============================================
  // Confirm Modal helpers
  // ============================================
  const openConfirmModal = (config) => {
    setConfirmModal({ isOpen: true, ...config });
  };

  const closeConfirmModal = () => {
    setConfirmModal({
      isOpen: false,
      title: '',
      message: '',
      icon: null,
      variant: 'default',
      mode: 'confirm',
      confirmLabel: 'تایید',
      cancelLabel: 'انصراف',
      onConfirm: null,
    });
  };

  // ============================================
  // تایید نهایی برنامه
  // ============================================
  const approveDiet = (dietId) => {
    openConfirmModal({
      title: 'تایید نهایی برنامه غذایی',
      message: 'پس از تایید، کاربر می‌تواند برنامه را ببیند. ادامه می‌دهید؟',
      icon: <Check size={32} />,
      variant: 'success',
      onConfirm: async () => {
        try {
          setSaving(true);
          await api.dietPrograms.approve(dietId);
          setDiets(diets.map((d) =>
            d.id === dietId ? { ...d, status: 'approved' } : d
          ));
          closeConfirmModal();
        } catch (err) {
          alert(err.response?.data?.detail || 'خطا در تایید');
        } finally {
          setSaving(false);
        }
      },
    });
  };

  // ============================================
  // فعال‌سازی ویرایش
  // ============================================
  const enableEditMode = (dietId) => {
    openConfirmModal({
      title: 'فعال‌سازی حالت ویرایش',
      message: 'آیا می‌خواهید حالت ویرایش را فعال کنید؟',
      icon: <Edit size={32} />,
      variant: 'warning',
      onConfirm: async () => {
        try {
          setSaving(true);
          await api.dietPrograms.unlock(dietId);
          setDiets(diets.map((d) =>
            d.id === dietId ? { ...d, status: 'draft' } : d
          ));
          closeConfirmModal();
        } catch (err) {
          alert('خطا در فعال‌سازی ویرایش');
        } finally {
          setSaving(false);
        }
      },
    });
  };

  // ============================================
  // لغو ویرایش
  // ============================================
  const cancelEditMode = (dietId) => {
    openConfirmModal({
      title: 'لغو ویرایش',
      message: 'تغییرات اعمال شده ذخیره نخواهد شد. آیا مطمئن هستید؟',
      icon: <RotateCcw size={32} />,
      variant: 'warning',
      onConfirm: async () => {
        try {
          setSaving(true);
          const fresh = await api.dietPrograms.detail(dietId);
          setDiets(diets.map((d) => (d.id === dietId ? fresh : d)));
          closeConfirmModal();
        } catch (err) {
          alert('خطا در لغو');
        } finally {
          setSaving(false);
        }
      },
    });
  };

  // ============================================
  // ذخیره ویرایش (تایید مجدد)
  // ============================================
  const saveEditMode = (dietId) => {
    openConfirmModal({
      title: 'ذخیره تغییرات',
      message: 'آیا از ذخیره تغییرات مطمئن هستید؟',
      icon: <Save size={32} />,
      variant: 'success',
      onConfirm: async () => {
        try {
          setSaving(true);
          await api.dietPrograms.approve(dietId);
          setDiets(diets.map((d) =>
            d.id === dietId ? { ...d, status: 'approved' } : d
          ));
          closeConfirmModal();
        } catch (err) {
          alert('خطا در ذخیره');
        } finally {
          setSaving(false);
        }
      },
    });
  };

  const handleWizardSuccess = (diet) => {
    if (!diet?.id) return;
    setDiets((prev) => {
      const exists = prev.some((d) => d.id === diet.id);
      if (exists) {
        return prev.map((d) => (d.id === diet.id ? { ...d, ...diet } : d));
      }
      return [...prev, diet];
    });
    setComposerOpen(false);
  };

  const showArchiveSuccess = (programName, replaced) => {
    setConfirmModal({
      isOpen: true,
      title: replaced ? 'آرشیو به‌روز شد' : 'آرشیو شد',
      message: replaced ? (
        <>
          اطلاعات جدید روی{' '}
          <span className={styles.dietConfirmHighlight}>«{programName}»</span>
          {' '}قرار گرفت و آرشیو به‌روز شد.
        </>
      ) : (
        <>
          <span className={styles.dietConfirmHighlight}>«{programName}»</span>
          {' '}به آرشیو برنامه‌های شما اضافه شد.
        </>
      ),
      icon: <Check size={32} />,
      variant: 'success',
      mode: 'notice',
      confirmLabel: 'باشه',
      onConfirm: closeConfirmModal,
    });
  };

  const showArchiveError = (err) => {
    setConfirmModal({
      isOpen: true,
      title: 'آرشیو نشد',
      message: err?.response?.data?.detail || 'خطا در آرشیو کردن برنامه',
      icon: <AlertCircle size={32} />,
      variant: 'danger',
      mode: 'notice',
      confirmLabel: 'باشه',
      onConfirm: closeConfirmModal,
    });
  };

  const submitArchive = async (diet, { replace = false } = {}) => {
    const programName = diet.name || 'این برنامه';
    try {
      setArchivingId(diet.id);
      setSaving(true);
      await api.dietPrograms.archive(diet.id, { name: programName, replace });
      showArchiveSuccess(programName, replace);
    } catch (err) {
      const data = err?.response?.data || {};
      if (err?.response?.status === 409 || data.code === 'already_archived') {
        const existingName = data.archive_name || programName;
        setConfirmModal({
          isOpen: true,
          title: 'این برنامه قبلاً آرشیو شده',
          message: (
            <>
              <span className={styles.dietConfirmHighlight}>«{existingName}»</span>
              {' '}از قبل در آرشیو شما هست.
              {' '}اگر تأیید کنید، اطلاعات جدید روی مورد قبلی قرار می‌گیرد و بروزرسانی انجام می‌شود.
            </>
          ),
          icon: <Archive size={32} />,
          variant: 'warning',
          mode: 'confirm',
          confirmLabel: 'بروزرسانی آرشیو',
          cancelLabel: 'انصراف',
          onConfirm: () => submitArchive(diet, { replace: true }),
        });
        return;
      }
      console.error('Archive diet error:', err);
      showArchiveError(err);
    } finally {
      setArchivingId(null);
      setSaving(false);
    }
  };

  const archiveDiet = (diet) => {
    if (!diet?.id || archivingId) return;
    const programName = diet.name || 'این برنامه';
    openConfirmModal({
      title: 'افزودن به آرشیو',
      message: (
        <>
          برنامه{' '}
          <span className={styles.dietConfirmHighlight}>«{programName}»</span>
          {' '}به آرشیو برنامه‌های شما اضافه شود؟
        </>
      ),
      icon: <Archive size={32} />,
      variant: 'success',
      confirmLabel: 'آرشیو کن',
      cancelLabel: 'انصراف',
      onConfirm: () => submitArchive(diet, { replace: false }),
    });
  };

  const applyArchiveToDay = async (archiveItem) => {
    const dateStr = toApiDate(selectedDate);
    if (!dateStr || !archiveItem?.id) return;
    try {
      setSaving(true);
      const created = await api.dietProgramArchives.apply(archiveItem.id, {
        member: userId,
        date: dateStr,
      });
      setDiets((prev) => {
        const exists = prev.some((d) => d.id === created.id);
        if (exists) {
          return prev.map((d) => (d.id === created.id ? created : d));
        }
        return [...prev, created];
      });
      setShowArchivePicker(false);
      setComposerOpen(false);
    } catch (err) {
      console.error('Apply diet archive error:', err);
      alert(
        err?.response?.data?.detail ||
          err?.response?.data?.member?.[0] ||
          'خطا در اعمال برنامه از آرشیو',
      );
      throw err;
    } finally {
      setSaving(false);
    }
  };

  // ============================================
  // حذف برنامه
  // ============================================
  const deleteDiet = (dietId) => {
    openConfirmModal({
      title: 'حذف برنامه',
      message: 'آیا از حذف این برنامه غذایی مطمئن هستید؟',
      icon: <Trash2 size={32} />,
      variant: 'danger',
      confirmLabel: 'حذف برنامه',
      onConfirm: async () => {
        try {
          setSaving(true);
          await api.dietPrograms.delete(dietId);
          setDiets((prev) => prev.filter((d) => d.id !== dietId));
          closeConfirmModal();
        } catch (err) {
          console.error('Delete diet error:', err);
          setConfirmModal({
            isOpen: true,
            title: 'حذف نشد',
            message:
              err?.response?.data?.detail ||
              err?.response?.data?.message ||
              'حذف برنامه غذایی ممکن نشد. دوباره تلاش کنید.',
            icon: <AlertCircle size={32} />,
            variant: 'danger',
            mode: 'notice',
            confirmLabel: 'باشه',
            onConfirm: closeConfirmModal,
          });
        } finally {
          setSaving(false);
        }
      },
    });
  };

  // ============================================
  // افزودن وعده
  // ============================================
  const addMeal = async (dietId) => {
    try {
      setSaving(true);

      const lastMeal = diets
        .find((d) => d.id === dietId)
        ?.meals?.slice(-1)[0];
      const nextOrder = lastMeal ? (lastMeal.order || 1) + 1 : 1;

      const created = await api.dietPrograms.addMeal(dietId, {
        meal_type: newMeal.type,
        time: newMeal.time,
        calories: newMeal.calories,
        order: nextOrder,
      });

      // Refresh
      const fresh = await api.dietPrograms.detail(dietId);
      setDiets(diets.map((d) => (d.id === dietId ? fresh : d)));

      setNewMeal({ type: 'breakfast', time: '08:00', calories: 500 });
      setShowAddMealModal(false);
    } catch (err) {
      alert(err.response?.data?.detail || 'خطا در افزودن وعده');
    } finally {
      setSaving(false);
    }
  };

  // ============================================
  // حذف وعده
  // ============================================
  const deleteMeal = (dietId, mealId) => {
    openConfirmModal({
      title: 'حذف وعده',
      message: 'آیا از حذف این وعده مطمئن هستید؟',
      icon: <Trash2 size={32} />,
      variant: 'danger',
      onConfirm: async () => {
        try {
          setSaving(true);
          await api.dietPrograms.deleteMeal(dietId, mealId);
          const fresh = await api.dietPrograms.detail(dietId);
          setDiets(diets.map((d) => (d.id === dietId ? fresh : d)));
          closeConfirmModal();
        } catch (err) {
          alert('خطا در حذف');
        } finally {
          setSaving(false);
        }
      },
    });
  };

  // ============================================
  // ویرایش وعده
  // ============================================
  const updateMeal = async (dietId, mealId, data) => {
    try {
      setSaving(true);
      await api.dietPrograms.updateMeal(dietId, mealId, {
        meal_type: data.type,
        time: data.time,
        calories: data.calories,
      });
      const fresh = await api.dietPrograms.detail(dietId);
      setDiets(diets.map((d) => (d.id === dietId ? fresh : d)));
    } catch (err) {
      alert('خطا در ویرایش وعده');
    } finally {
      setSaving(false);
    }
  };

  // ============================================
  // انتخاب غذا از کتابخانه
  // ============================================
  const handleSelectFromLibrary = (food) => {
    setNewFood({
      name: food.name,
      amount: `${food.selected_amount} ${food.selected_unit}`,
      amount_value: food.selected_amount,
      amount_unit: food.selected_unit,
      calories: food.calculated_calories,
      protein: food.calculated_protein,
      carbs: food.calculated_carbs,
      fat: food.calculated_fat,
      food_library: food.id,
    });
    setShowFoodPicker(false);
  };

  // ============================================
  // افزودن غذا به وعده
  // ============================================
  const addFood = async (dietId, mealId) => {
    if (!newFood.name.trim()) {
      alert('لطفاً نام غذا را وارد کنید یا از کتابخانه انتخاب کنید.');
      return;
    }

    try {
      setSaving(true);

      const fresh = await api.dietPrograms.addFood(dietId, mealId, {
        name: newFood.name,
        amount: newFood.amount,
        amount_value: newFood.amount_value,
        amount_unit: newFood.amount_unit,
        calories: newFood.calories,
        protein: newFood.protein,
        carbs: newFood.carbs,
        fat: newFood.fat,
        food_library: newFood.food_library || null,
      });

      const updated = await api.dietPrograms.detail(dietId);
      setDiets(diets.map((d) => (d.id === dietId ? updated : d)));

      setNewFood({
        name: '',
        amount: '',
        amount_value: 0,
        amount_unit: 'gram',
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
      });
      setShowEditFoodModal(false);
    } catch (err) {
      alert(err.response?.data?.detail || 'خطا در افزودن غذا');
    } finally {
      setSaving(false);
    }
  };

  // ============================================
  // حذف غذا
  // ============================================
  const deleteFood = async (dietId, mealId, foodId) => {
    try {
      setSaving(true);
      await api.dietPrograms.deleteFood(dietId, mealId, foodId);
      const fresh = await api.dietPrograms.detail(dietId);
      setDiets(diets.map((d) => (d.id === dietId ? fresh : d)));
    } catch (err) {
      alert('خطا در حذف غذا');
    } finally {
      setSaving(false);
    }
  };

  // ============================================
  // جابجایی وعده (بالا/پایین)
  // ============================================
  const moveMeal = async (dietId, mealId, direction) => {
    const diet = diets.find((d) => d.id === dietId);
    if (!diet || diet.status === 'approved') return;

    const meals = [...(diet.meals || [])];
    const idx = meals.findIndex((m) => m.id === mealId);
    if (idx === -1) return;

    const newIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (newIdx < 0 || newIdx >= meals.length) return;

    [meals[idx], meals[newIdx]] = [meals[newIdx], meals[idx]];
    meals.forEach((m, i) => (m.order = i + 1));

    // Optimistic
    setDiets(
      diets.map((d) => (d.id === dietId ? { ...d, meals } : d))
    );

    try {
      const orders = meals.map((m, i) => ({ id: m.id, order: i + 1 }));
      await api.dietPrograms.reorderMeals?.(dietId, orders);
    } catch (err) {
      // در صورت نبود API، از سرور reload می‌کنیم
      try {
        const fresh = await api.dietPrograms.detail(dietId);
        setDiets(diets.map((d) => (d.id === dietId ? fresh : d)));
      } catch (_) {}
    }
  };

  // ============================================
  // Drag & Drop وعده
  // ============================================
  const handleMealDragStart = (e, mealId, dietId, isEditing) => {
    if (!isEditing) {
      e.preventDefault();
      return;
    }
    setDraggingMealId(mealId);
    dragRef.current = { type: 'meal', mealId, dietId };
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleMealDrop = async (e, targetMealId, dietId) => {
    e.preventDefault();
    e.stopPropagation();

    const source = dragRef.current;
    if (!source || source.type !== 'meal' || source.mealId === targetMealId) {
      handleDragEnd();
      return;
    }
    if (source.dietId !== dietId) {
      handleDragEnd();
      return;
    }

    const diet = diets.find((d) => d.id === dietId);
    if (!diet || diet.status === 'approved') {
      handleDragEnd();
      return;
    }

    const meals = [...(diet.meals || [])];
    const sourceIdx = meals.findIndex((m) => m.id === source.mealId);
    const targetIdx = meals.findIndex((m) => m.id === targetMealId);

    if (sourceIdx === -1 || targetIdx === -1) {
      handleDragEnd();
      return;
    }

    const [moved] = meals.splice(sourceIdx, 1);
    meals.splice(targetIdx, 0, moved);
    meals.forEach((m, i) => (m.order = i + 1));

    setDiets(diets.map((d) => (d.id === dietId ? { ...d, meals } : d)));

    try {
      const orders = meals.map((m, i) => ({ id: m.id, order: i + 1 }));
      await api.dietPrograms.reorderMeals?.(dietId, orders);
    } catch (_) {}

    handleDragEnd();
  };

  // ============================================
  // Drag & Drop غذا
  // ============================================
  const handleFoodDragStart = (e, foodId, mealId, dietId, isEditing) => {
    if (!isEditing) {
      e.preventDefault();
      return;
    }
    setDraggingFoodId(foodId);
    dragRef.current = { type: 'food', foodId, mealId, dietId };
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleFoodDrop = async (e, targetFoodId, mealId, dietId) => {
    e.preventDefault();
    e.stopPropagation();

    const source = dragRef.current;
    if (!source || source.type !== 'food' || source.foodId === targetFoodId) {
      handleDragEnd();
      return;
    }
    if (source.mealId !== mealId) {
      handleDragEnd();
      return;
    }

    const diet = diets.find((d) => d.id === dietId);
    if (!diet || diet.status === 'approved') {
      handleDragEnd();
      return;
    }

    const meal = diet.meals?.find((m) => m.id === mealId);
    if (!meal) {
      handleDragEnd();
      return;
    }

    const items = [...(meal.items || [])];
    const sourceIdx = items.findIndex((i) => i.id === source.foodId);
    const targetIdx = items.findIndex((i) => i.id === targetFoodId);

    if (sourceIdx === -1 || targetIdx === -1) {
      handleDragEnd();
      return;
    }

    const [moved] = items.splice(sourceIdx, 1);
    items.splice(targetIdx, 0, moved);
    items.forEach((item, i) => (item.order = i + 1));

    setDiets(
      diets.map((d) => {
        if (d.id !== dietId) return d;
        return {
          ...d,
          meals: d.meals.map((m) => (m.id === mealId ? { ...m, items } : m)),
        };
      })
    );

    try {
      const orders = items.map((i, idx) => ({ id: i.id, order: idx + 1 }));
      await api.dietPrograms.reorderFoods?.(dietId, mealId, orders);
    } catch (_) {}

    handleDragEnd();
  };

  const handleDragEnd = () => {
    setDraggingMealId(null);
    setDraggingFoodId(null);
    dragRef.current = null;
  };

  // ============================================
  // محاسبه کالری کل
  // ============================================
  const getTotalCalories = (diet) => {
    return (diet.meals || []).reduce((sum, meal) => {
      const items = meal.items || [];
      if (items.length) {
        return (
          sum +
          items.reduce((s, item) => s + Number(item.calories || 0), 0)
        );
      }
      return sum + Number(meal.calories || 0);
    }, 0);
  };

  // ============================================
  // رندر وعده‌ها
  // ============================================
  const renderMeals = (meals, dietId, isEditing) => {
    if (!meals || meals.length === 0) {
      return (
        <div className={styles.dietEmptyMeals}>
          <Utensils size={32} />
          <p>هیچ وعده‌ای ثبت نشده است</p>
          {isEditing && (
            <button
              className={styles.dietAddButton}
              onClick={() => {
                setSelectedDiet({ id: dietId });
                setShowAddMealModal(true);
              }}
            >
              <Plus size={14} />
              افزودن اولین وعده
            </button>
          )}
        </div>
      );
    }

    const mealCalories = (meal) => {
      const items = meal.items || [];
      if (items.length) {
        return items.reduce((s, item) => s + Number(item.calories || 0), 0);
      }
      return Number(meal.calories || 0);
    };

    const columnOf = (type) => {
      const found = MEAL_BOARD_COLUMNS.find((col) => col.types.includes(type));
      return found?.id || 'mid';
    };

    const renderMeal = (meal, mealIndex) => {
      const isFirst = mealIndex === 0;
      const isLast = mealIndex === meals.length - 1;
      const isDraggingMeal = draggingMealId === meal.id;
      const MealIcon = getMealTypeIcon(meal.meal_type);

      return (
        <div
          key={meal.id}
          className={clsx(
            styles.dietMealCard,
            isEditing && styles.dietMealCardEditable,
            isDraggingMeal && styles.dietMealCardDragging
          )}
          draggable={isEditing}
          onDragStart={(e) => handleMealDragStart(e, meal.id, dietId, isEditing)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => handleMealDrop(e, meal.id, dietId)}
          onDragEnd={handleDragEnd}
        >
          <div className={styles.dietMealHeader}>
            <div className={styles.dietMealTitle}>
              {isEditing && (
                <div className={styles.dietDragHandle}>
                  <GripVertical size={14} />
                </div>
              )}
              <div className={styles.dietMealIcon}>
                <MealIcon size={14} />
              </div>
              <span className={styles.dietMealType}>
                {meal.meal_type_display || mapMealTypeFromApi(meal.meal_type)}
              </span>
              {meal.time && (
                <span className={styles.dietMealTime}>
                  <Clock size={10} />
                  {meal.time}
                </span>
              )}
              <span className={styles.dietMealCalories}>
                <Flame size={10} />
                {Math.round(mealCalories(meal))}
              </span>
            </div>

            {isEditing && (
              <div className={styles.dietMealActions}>
                <div className={styles.dietMoveButtons}>
                  <button
                    className={styles.dietMoveButton}
                    onClick={() => moveMeal(dietId, meal.id, 'up')}
                    disabled={isFirst}
                  >
                    <ChevronUp size={14} />
                  </button>
                  <button
                    className={styles.dietMoveButton}
                    onClick={() => moveMeal(dietId, meal.id, 'down')}
                    disabled={isLast}
                  >
                    <ChevronDown size={14} />
                  </button>
                </div>
                <button
                  className={styles.dietIconButton}
                  onClick={() => {
                    setSelectedDiet({ id: dietId });
                    setSelectedMeal(meal);
                    setShowEditMealModal(true);
                  }}
                >
                  <Edit size={12} />
                </button>
                <button
                  className={clsx(styles.dietIconButton, styles.dietIconButtonDanger)}
                  onClick={() => deleteMeal(dietId, meal.id)}
                >
                  <Trash2 size={12} />
                </button>
              </div>
            )}
          </div>

          <div className={styles.dietFoodList}>
            {(meal.items || []).map((food) => {
              const isDraggingFood = draggingFoodId === food.id;

              return (
                <div
                  key={food.id}
                  className={clsx(
                    styles.dietFoodItem,
                    isEditing && styles.dietFoodItemEditable,
                    isDraggingFood && styles.dietFoodItemDragging
                  )}
                  draggable={isEditing}
                  onDragStart={(e) =>
                    handleFoodDragStart(e, food.id, meal.id, dietId, isEditing)
                  }
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => handleFoodDrop(e, food.id, meal.id, dietId)}
                  onDragEnd={handleDragEnd}
                >
                  <div className={styles.dietFoodMain}>
                    {isEditing && (
                      <div className={styles.dietDragHandleSmall}>
                        <GripVertical size={12} />
                      </div>
                    )}
                    <div className={styles.dietFoodDot} />
                    <span className={styles.dietFoodName}>{food.name}</span>
                    <span className={styles.dietFoodAmount}>{food.amount}</span>
                    <span className={styles.dietFoodCalories}>
                      {Math.round(Number(food.calories) || 0)}
                    </span>
                  </div>

                  {isEditing && (
                    <div className={styles.dietFoodActions}>
                      <button
                        className={styles.dietIconButtonSmall}
                        onClick={() => {
                          setSelectedDiet({ id: dietId });
                          setSelectedMeal(meal);
                          setSelectedFood(food);
                          setShowEditFoodModal(true);
                        }}
                      >
                        <Edit size={11} />
                      </button>
                      <button
                        className={clsx(
                          styles.dietIconButtonSmall,
                          styles.dietIconButtonDanger
                        )}
                        onClick={() => deleteFood(dietId, meal.id, food.id)}
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}

            {isEditing && (
              <button
                className={styles.dietAddFoodButton}
                onClick={() => {
                  setSelectedDiet({ id: dietId });
                  setSelectedMeal(meal);
                  setShowEditFoodModal(true);
                  setNewFood({
                    name: '',
                    amount: '',
                    amount_value: 0,
                    amount_unit: 'gram',
                    calories: 0,
                    protein: 0,
                    carbs: 0,
                    fat: 0,
                  });
                }}
              >
                <Plus size={12} />
                افزودن غذا
              </button>
            )}
          </div>
        </div>
      );
    };

    const ColIcon = { morning: Sun, mid: Utensils, night: Moon };

    return (
      <div className={styles.dietBoardWrap}>
        <div className={styles.dietBoard}>
          {MEAL_BOARD_COLUMNS.map((col) => {
            const colMeals = meals.filter((meal) => columnOf(meal.meal_type) === col.id);
            const colKcal = colMeals.reduce((s, meal) => s + mealCalories(meal), 0);
            const Icon = ColIcon[col.id];

            return (
              <section
                key={col.id}
                className={clsx(styles.dietBoardCol, styles[`dietBoardCol_${col.id}`])}
              >
                <header className={styles.dietBoardHead}>
                  <div className={styles.dietBoardHeadTitle}>
                    <span className={styles.dietBoardHeadIcon}>
                      <Icon size={14} />
                    </span>
                    <div>
                      <strong>{col.title}</strong>
                      <p>{col.hint}</p>
                    </div>
                  </div>
                  <span className={styles.dietBoardKcal}>
                    {Math.round(colKcal).toLocaleString('fa-IR')}
                  </span>
                </header>

                {colMeals.length ? (
                  colMeals.map((meal) =>
                    renderMeal(meal, meals.findIndex((m) => m.id === meal.id)),
                  )
                ) : (
                  <p className={styles.dietBoardEmpty}>وعده‌ای در این بازه نیست</p>
                )}
              </section>
            );
          })}
        </div>

        {isEditing && (
          <button
            className={styles.dietAddMealButton}
            onClick={() => {
              setSelectedDiet({ id: dietId });
              setShowAddMealModal(true);
            }}
          >
            <Plus size={14} />
            افزودن وعده
          </button>
        )}
      </div>
    );
  };

  // ============================================
  // رندر محتوای روز
  // ============================================
  const renderDayContent = () => {
    if (loading) {
      return (
        <div className={styles.dietEmptyState}>
          <Loader2 className={styles.spinner} size={48} />
          <p>در حال بارگذاری...</p>
        </div>
      );
    }

    if (composerOpen) {
      return (
        <AddDietWizard
          api={api}
          memberId={userId}
          selectedDate={selectedDate}
          onCancel={() => setComposerOpen(false)}
          onSuccess={handleWizardSuccess}
        />
      );
    }

    if (dayDiets.length === 0) {
      return (
        <div className={styles.dietEmptyState}>
          <Apple size={56} />
          <h4>هیچ برنامه غذایی برای این روز ثبت نشده است</h4>
          <p>برنامه جدید بسازید یا از آرشیو برنامه‌های خودتان انتخاب کنید</p>
          <div className={styles.dietEmptyActions}>
            <button
              type="button"
              className={styles.dietPrimaryButton}
              onClick={() => setComposerOpen(true)}
            >
              <Plus size={16} />
              افزودن برنامه جدید
            </button>
            <button
              type="button"
              className={styles.dietSecondaryButton}
              onClick={() => setShowArchivePicker(true)}
            >
              <Archive size={16} />
              انتخاب از آرشیو برنامه‌ها
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className={styles.dietList}>
        <div className={styles.dietDateBanner}>
          <Calendar size={16} />
          <span>{formatJalaliDate(selectedDate)}</span>
        </div>

        {dayDiets.map((diet) => {
          const isApproved = diet.status === 'approved';
          const isEditing = !isApproved;
          const totalCalories = getTotalCalories(diet);

          return (
            <div
              key={diet.id}
              className={clsx(
                styles.dietCard,
                isApproved && styles.dietCardLocked,
                isEditing && styles.dietCardEditing
              )}
            >
              <div className={styles.dietCardHeader}>
                <div className={styles.dietCardTitle}>
                  <span>{diet.name}</span>
                  <div className={styles.dietCardBadges}>
                    <span className={styles.dietBadge}>
                      <Utensils size={11} />
                      {diet.diet_type_display}
                    </span>
                    <span className={styles.dietBadge}>
                      <Flame size={11} />
                      {totalCalories} کالری
                    </span>
                    <span className={styles.dietBadge}>
                      <Apple size={11} />
                      {diet.meals_count || diet.meals?.length || 0} وعده
                    </span>
                    {isApproved && (
                      <span className={clsx(styles.dietBadge, styles.dietBadgeApproved)}>
                        <Lock size={11} />
                        تایید شده
                      </span>
                    )}
                    {isEditing && (
                      <span className={clsx(styles.dietBadge, styles.dietBadgeEditing)}>
                        <Edit size={11} />
                        در حال ویرایش
                      </span>
                    )}
                  </div>
                </div>

                <div className={styles.dietCardActions}>
                  {!isApproved && (
                    <button
                      className={clsx(
                        styles.dietActionButton,
                        styles.dietActionButtonSuccess
                      )}
                      onClick={() => approveDiet(diet.id)}
                    >
                      <Check size={14} />
                      تایید نهایی
                    </button>
                  )}

                  {isApproved && (
                    <button
                      className={styles.dietActionButton}
                      onClick={() => enableEditMode(diet.id)}
                    >
                      <Unlock size={14} />
                      ویرایش
                    </button>
                  )}

                  <button
                    type="button"
                    className={styles.dietActionButton}
                    onClick={() => archiveDiet(diet)}
                    disabled={archivingId === diet.id}
                    title="ذخیره در آرشیو برنامه‌های من"
                  >
                    {archivingId === diet.id ? (
                      <Loader2 size={14} className={styles.spinner} />
                    ) : (
                      <Archive size={14} />
                    )}
                    آرشیو
                  </button>

                  <button
                    className={clsx(styles.dietIconButton, styles.dietIconButtonDanger)}
                    onClick={() => deleteDiet(diet.id)}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {isApproved && (
                <div className={styles.dietLockedBanner}>
                  <Lock size={14} />
                  <span>این برنامه تایید شده است. برای تغییر، روی ویرایش بزنید.</span>
                </div>
              )}

              {isEditing && (
                <div className={styles.dietEditingBanner}>
                  <AlertCircle size={14} />
                  <span>حالت ویرایش فعال است. می‌توانید وعده‌ها و غذاها را جابجا کنید.</span>
                </div>
              )}

              <div className={styles.dietCardBody}>
                {renderMeals(diet.meals, diet.id, isEditing)}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // ============================================
  // رندر اصلی
  // ============================================
  return (
    <div className={styles.dietManager}>
      {/* هدر */}
      <div className={styles.dietHeader}>
        <div className={styles.dietHeaderLeft}>
          <button className={styles.dietBackButton} onClick={onClose}>
            <ArrowLeft size={18} />
            بازگشت
          </button>
          <h2 className={styles.dietHeaderTitle}>
            <Utensils size={22} />
            مدیریت برنامه غذایی
          </h2>
          {userName && <span className={styles.dietUserBadge}>{userName}</span>}
        </div>
        <div className={styles.dietHeaderRight}>
          <div className={styles.dietSearchBox}>
            <Search size={14} />
            <input
              type="text"
              placeholder="جستجو..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button
            type="button"
            className={styles.dietSecondaryButton}
            onClick={() => setShowArchivePicker(true)}
            disabled={composerOpen}
          >
            <Archive size={16} />
            آرشیو برنامه‌ها
          </button>
          <button
            type="button"
            className={styles.dietPrimaryButton}
            onClick={() => setComposerOpen(true)}
            disabled={composerOpen}
          >
            <Plus size={16} />
            برنامه جدید
          </button>
        </div>
      </div>

      {/* بدنه */}
      <div className={styles.dietBody}>
        <div className={styles.dietLayout}>
          <div className={styles.dietCalendarSidebar}>
            <GymPersianCalendar
              selectedDate={selectedDate}
              onDateSelect={(date) => {
                setSelectedDate(date);
                setComposerOpen(false);
              }}
              markedDates={diets.map((d) => d.date)}
            />
          </div>
          <div className={styles.dietContentArea}>{renderDayContent()}</div>
        </div>
      </div>

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={closeConfirmModal}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        icon={confirmModal.icon}
        variant={confirmModal.variant}
        mode={confirmModal.mode}
        confirmLabel={confirmModal.confirmLabel}
        cancelLabel={confirmModal.cancelLabel}
      />

      {/* مودال افزودن وعده */}
      <Modal
        isOpen={showAddMealModal}
        onClose={() => setShowAddMealModal(false)}
        title="افزودن وعده جدید"
      >
        <div className={styles.dietModalForm}>
          <div className={styles.dietFormGroup}>
            <label>نوع وعده</label>
            <select
              value={newMeal.type}
              onChange={(e) => setNewMeal({ ...newMeal, type: e.target.value })}
            >
              {MEAL_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.dietFormRow}>
            <div className={styles.dietFormGroup}>
              <label>ساعت</label>
              <input
                type="time"
                value={newMeal.time}
                onChange={(e) => setNewMeal({ ...newMeal, time: e.target.value })}
              />
            </div>
            <div className={styles.dietFormGroup}>
              <label>کالری (تخمینی)</label>
              <input
                type="number"
                value={newMeal.calories}
                onChange={(e) =>
                  setNewMeal({
                    ...newMeal,
                    calories: parseInt(e.target.value) || 0,
                  })
                }
              />
            </div>
          </div>
          <div className={styles.dietModalActions}>
            <button
              className={styles.dietCancelButton}
              onClick={() => setShowAddMealModal(false)}
            >
              انصراف
            </button>
            <button
              className={styles.dietConfirmButton}
              onClick={() => addMeal(selectedDiet?.id)}
              disabled={saving}
            >
              <Plus size={16} />
              {saving ? 'در حال ثبت...' : 'افزودن وعده'}
            </button>
          </div>
        </div>
      </Modal>

      {/* مودال ویرایش وعده */}
      <Modal
        isOpen={showEditMealModal}
        onClose={() => {
          setShowEditMealModal(false);
          setSelectedMeal(null);
        }}
        title="ویرایش وعده"
      >
        {selectedMeal && (
          <div className={styles.dietModalForm}>
            <div className={styles.dietFormGroup}>
              <label>نوع وعده</label>
              <select
                value={selectedMeal.meal_type}
                onChange={(e) =>
                  setSelectedMeal({ ...selectedMeal, meal_type: e.target.value })
                }
              >
                {MEAL_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.dietFormRow}>
              <div className={styles.dietFormGroup}>
                <label>ساعت</label>
                <input
                  type="time"
                  value={selectedMeal.time || ''}
                  onChange={(e) =>
                    setSelectedMeal({ ...selectedMeal, time: e.target.value })
                  }
                />
              </div>
              <div className={styles.dietFormGroup}>
                <label>کالری</label>
                <input
                  type="number"
                  value={selectedMeal.calories || 0}
                  onChange={(e) =>
                    setSelectedMeal({
                      ...selectedMeal,
                      calories: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>
            </div>
            <div className={styles.dietModalActions}>
              <button
                className={styles.dietCancelButton}
                onClick={() => {
                  setShowEditMealModal(false);
                  setSelectedMeal(null);
                }}
              >
                انصراف
              </button>
              <button
                className={styles.dietConfirmButton}
                onClick={async () => {
                  if (selectedDiet?.id && selectedMeal?.id) {
                    await updateMeal(selectedDiet.id, selectedMeal.id, {
                      type: selectedMeal.meal_type,
                      time: selectedMeal.time,
                      calories: selectedMeal.calories,
                    });
                  }
                  setShowEditMealModal(false);
                  setSelectedMeal(null);
                }}
                disabled={saving}
              >
                <Check size={16} />
                {saving ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* مودال افزودن/ویرایش غذا */}
      <Modal
        isOpen={showEditFoodModal}
        onClose={() => {
          setShowEditFoodModal(false);
        }}
        title={selectedFood ? 'ویرایش غذا' : 'افزودن غذا'}
        size="lg"
      >
        <div className={styles.dietModalForm}>
          {/* انتخاب از کتابخانه */}
          <div className={styles.dietFormGroup}>
            <label>انتخاب از کتابخانه (توصیه می‌شود)</label>
            <button
              type="button"
              className={styles.dietLibraryBtn}
              onClick={() => setShowFoodPicker(true)}
            >
              <Apple size={16} />
              انتخاب از کتابخانه غذا
            </button>
            {newFood.food_library && (
              <div className={styles.dietSelectedLibraryInfo}>
                ✅ انتخاب شده از کتابخانه
              </div>
            )}
          </div>

          <div className={styles.dietFormGroup}>
            <label>نام غذا *</label>
            <input
              type="text"
              placeholder="مثلاً: سینه مرغ"
              value={newFood.name}
              onChange={(e) => setNewFood({ ...newFood, name: e.target.value })}
            />
          </div>

          <div className={styles.dietFormRow}>
            <div className={styles.dietFormGroup}>
              <label>مقدار</label>
              <input
                type="text"
                placeholder="مثلاً: 200 گرم"
                value={newFood.amount}
                onChange={(e) =>
                  setNewFood({ ...newFood, amount: e.target.value })
                }
              />
            </div>
            <div className={styles.dietFormGroup}>
              <label>کالری</label>
              <input
                type="number"
                value={newFood.calories}
                onChange={(e) =>
                  setNewFood({
                    ...newFood,
                    calories: parseFloat(e.target.value) || 0,
                  })
                }
              />
            </div>
          </div>

          <div className={styles.dietFormRow}>
            <div className={styles.dietFormGroup}>
              <label>پروتئین (گرم)</label>
              <input
                type="number"
                value={newFood.protein}
                onChange={(e) =>
                  setNewFood({
                    ...newFood,
                    protein: parseFloat(e.target.value) || 0,
                  })
                }
              />
            </div>
            <div className={styles.dietFormGroup}>
              <label>کربوهیدرات (گرم)</label>
              <input
                type="number"
                value={newFood.carbs}
                onChange={(e) =>
                  setNewFood({
                    ...newFood,
                    carbs: parseFloat(e.target.value) || 0,
                  })
                }
              />
            </div>
            <div className={styles.dietFormGroup}>
              <label>چربی (گرم)</label>
              <input
                type="number"
                value={newFood.fat}
                onChange={(e) =>
                  setNewFood({
                    ...newFood,
                    fat: parseFloat(e.target.value) || 0,
                  })
                }
              />
            </div>
          </div>

          <div className={styles.dietModalActions}>
            <button
              className={styles.dietCancelButton}
              onClick={() => setShowEditFoodModal(false)}
            >
              انصراف
            </button>
            <button
              className={styles.dietConfirmButton}
              onClick={() => addFood(selectedDiet?.id, selectedMeal?.id)}
              disabled={saving}
            >
              <Plus size={16} />
              {saving ? 'در حال ثبت...' : 'افزودن غذا'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Food Picker */}
      <FoodPickerModal
        isOpen={showFoodPicker}
        onClose={() => setShowFoodPicker(false)}
        onSelect={handleSelectFromLibrary}
        mealName={selectedMeal?.meal_type_display}
      />

      <DietArchivePickerModal
        isOpen={showArchivePicker}
        onClose={() => setShowArchivePicker(false)}
        api={api}
        onSelect={applyArchiveToDay}
      />
    </div>
  );
}