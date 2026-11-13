// modules/gym/components/WorkoutManager.jsx
'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import clsx from 'clsx';
import {
  Archive, Dumbbell, Plus, Edit, Trash2, Check, X, Search,
  ArrowLeft, Clock, Target, Calendar, GripVertical,
  Zap, Link, Unlink, ChevronDown,
  ChevronUp, Lock, Unlock, AlertCircle, Save, RotateCcw, Loader2,
} from 'lucide-react';
import styles from './WorkoutManager.module.css';
import { useBodybuildingApi } from '@/hooks/useBodybuildingApi';
import ExercisePickerModal from './modals/ExercisePickerModal';
import WorkoutArchivePickerModal from './modals/WorkoutArchivePickerModal';
import GymPersianCalendar from './GymPersianCalendar';
import AddWorkoutWizard from './AddWorkoutWizard';
import {
  toApiDate,
  formatJalaliDate,
  isSameApiDay,
} from '@/modules/gym/utils/jalaliCalendar';

// ============================================
// Helper ها برای map بین فارسی و API
// ============================================
const mapScheduleFromApi = (s) => ({
  daily: 'روزانه',
  even: 'یک روز در میان',
  odd: 'یک روز در میان',
  alternate: 'یک روز در میان',
}[s] || (s === 'زوج' || s === 'فرد' ? 'یک روز در میان' : s));

const SET_PRESETS = [2, 3, 4, 5];
const REP_PRESETS = ['8-10', '10-12', '12-15', '15-20'];
const REST_PRESETS = [30, 45, 60, 90];

const mapTypeFromApi = (t) => ({
  hypertrophy: 'حجمی',
  definition: 'تعریف',
  strength: 'قدرتی',
  endurance: 'استقامتی',
  fitness: 'فیتنس',
}[t] || t);

const mapProgramFromApi = (p) => ({
  id: p.id,
  name: p.name,
  userName: p.member_name,
  schedule: mapScheduleFromApi(p.schedule),
  type: mapTypeFromApi(p.workout_type),
  date: p.date,
  isApproved: p.status === 'approved',
  isEditing: p.status === 'draft',
  exercises: (p.exercises || []).map((e) => ({
    id: e.id,
    exercise_library: e.exercise_library,
    title: e.title,
    image: e.image_url || '',
    sets: e.sets,
    reps: e.reps,
    priority: e.order,
    isSuperSet: e.is_super_set,
    superSetWith: e.super_set_with,
    restTime: e.rest_time,
  })),
});

// ============================================
// کامپوننت مودال عمومی
// ============================================
const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;
  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div
        className={clsx(
          styles.modal,
          styles[`modal${size.charAt(0).toUpperCase() + size.slice(1)}`]
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.modalHeader}>
          <h3>{title}</h3>
          <button className={styles.modalClose} onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <div className={styles.modalBody}>{children}</div>
      </div>
    </div>
  );
};

// ============================================
// کامپوننت مودال تایید
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
    <div className={styles.modalOverlay} onClick={onClose}>
      <div
        className={clsx(styles.confirmModal, isNotice && styles.confirmModalNotice)}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={clsx(styles.confirmModalIcon, styles[`confirmModalIcon${variant.charAt(0).toUpperCase() + variant.slice(1)}`])}>
          {icon}
        </div>
        <h3 className={styles.confirmModalTitle}>{title}</h3>
        <p className={styles.confirmModalMessage}>{message}</p>
        <div className={styles.confirmModalActions}>
          {!isNotice && (
            <button type="button" className={styles.cancelButton} onClick={onClose}>
              {cancelLabel}
            </button>
          )}
          <button
            type="button"
            className={clsx(
              styles.confirmButton,
              variant === 'danger' && styles.confirmButtonDanger,
              variant === 'warning' && styles.confirmButtonWarning,
              variant === 'success' && styles.confirmButtonSuccess,
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
// گروه‌بندی سوپر ست‌ها
// ============================================
const groupSuperSets = (exercises) => {
  const grouped = [];
  const used = new Set();

  for (let i = 0; i < exercises.length; i++) {
    if (used.has(i)) continue;
    const current = exercises[i];

    if (!current.isSuperSet || !current.superSetWith) {
      grouped.push({ type: 'single', exercises: [current] });
      used.add(i);
      continue;
    }

    let pairIndex = -1;
    for (let j = 0; j < exercises.length; j++) {
      if (j === i) continue;
      if (exercises[j].id === current.superSetWith) {
        pairIndex = j;
        break;
      }
    }

    if (pairIndex !== -1 && !used.has(pairIndex)) {
      grouped.push({ type: 'superSet', exercises: [current, exercises[pairIndex]] });
      used.add(i);
      used.add(pairIndex);
    } else {
      grouped.push({ type: 'single', exercises: [current] });
      used.add(i);
    }
  }

  return grouped;
};

// ============================================
// کامپوننت اصلی
// ============================================
export default function WorkoutManager({ businessSlug, userId, userName, onClose, onSave }) {
  const api = useBodybuildingApi(businessSlug);

  // ===== States =====
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Composer + Modals
  const [composerOpen, setComposerOpen] = useState(false);
  const [showArchivePicker, setShowArchivePicker] = useState(false);
  const [archivingId, setArchivingId] = useState(null);
  const [showAddExerciseModal, setShowAddExerciseModal] = useState(false);
  const [showEditExerciseModal, setShowEditExerciseModal] = useState(false);
  const [showExercisePicker, setShowExercisePicker] = useState(false);

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
  const [draggingId, setDraggingId] = useState(null);
  const [dropTargetId, setDropTargetId] = useState(null);
  const [draggingWorkoutId, setDraggingWorkoutId] = useState(null);
  const dragSourceRef = useRef(null);

  // Forms
  const [newExercise, setNewExercise] = useState({
    exercise_library: null,
    title: '',
    image: '',
    sets: 3,
    reps: '12-15',
    priority: 1,
    isSuperSet: false,
    superSetWith: null,
    restTime: 60,
  });

  // ============================================
  // ✅ Fetch برنامه‌ها از API
  // ============================================
  useEffect(() => {
    const fetchPrograms = async () => {
      if (!businessSlug || !userId) return;
      try {
        setLoading(true);
        const data = await api.workoutPrograms.list({ member: userId });
        const list = Array.isArray(data) ? data : data.results || [];

        setWorkouts(list.map(mapProgramFromApi));
      } catch (err) {
        console.error('Fetch error:', err);
        alert('خطا در دریافت برنامه‌های تمرینی');
      } finally {
        setLoading(false);
      }
    };

    fetchPrograms();
  }, [businessSlug, userId]);

  // ============================================
  // ✅ Helper: گرفتن برنامه‌های روز انتخاب شده
  // ============================================
  const dayWorkouts = useMemo(() => {
    const selectedStr = toApiDate(selectedDate);
    if (!selectedStr) return [];
    return workouts.filter((w) => isSameApiDay(w.date, selectedStr));
  }, [workouts, selectedDate]);

  // ============================================
  // Confirm Modal
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
  const approveWorkout = (workoutId) => {
    openConfirmModal({
      title: 'تایید نهایی برنامه',
      message: 'آیا از تایید نهایی این برنامه مطمئن هستید؟ پس از تایید، امکان ویرایش فقط با فعال‌سازی مجدد امکان‌پذیر است.',
      icon: <Check size={32} />,
      variant: 'success',
      onConfirm: async () => {
        try {
          setSaving(true);
          await api.workoutPrograms.approve(workoutId);
          setWorkouts(workouts.map(w =>
            w.id === workoutId ? { ...w, isApproved: true, isEditing: false } : w
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
  const enableEditMode = (workoutId) => {
    openConfirmModal({
      title: 'فعال‌سازی حالت ویرایش',
      message: 'آیا مطمئن هستید که می‌خواهید حالت ویرایش را فعال کنید؟',
      icon: <Edit size={32} />,
      variant: 'warning',
      onConfirm: async () => {
        try {
          setSaving(true);
          await api.workoutPrograms.unlock(workoutId);
          setWorkouts(workouts.map(w =>
            w.id === workoutId ? { ...w, isEditing: true } : w
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
  // لغو ویرایش (reload از سرور)
  // ============================================
  const cancelEditMode = (workoutId) => {
    openConfirmModal({
      title: 'لغو ویرایش',
      message: 'تغییرات اعمال شده ذخیره نخواهد شد. آیا مطمئن هستید؟',
      icon: <RotateCcw size={32} />,
      variant: 'warning',
      onConfirm: async () => {
        try {
          setSaving(true);
          const fresh = await api.workoutPrograms.detail(workoutId);
          setWorkouts(workouts.map(w => w.id !== workoutId ? w : {
            ...w,
            isEditing: false,
            exercises: (fresh.exercises || []).map((e) => ({
              id: e.id,
              exercise_library: e.exercise_library,
              title: e.title,
              image: e.image_url || '',
              sets: e.sets,
              reps: e.reps,
              priority: e.order,
              isSuperSet: e.is_super_set,
              superSetWith: e.super_set_with,
              restTime: e.rest_time,
            })),
          }));
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
  // ذخیره ویرایش (پایان حالت ویرایش)
  // ============================================
  const saveEditMode = (workoutId) => {
    openConfirmModal({
      title: 'ذخیره تغییرات',
      message: 'آیا از ذخیره تغییرات مطمئن هستید؟',
      icon: <Save size={32} />,
      variant: 'success',
      onConfirm: () => {
        setWorkouts(workouts.map(w =>
          w.id === workoutId ? { ...w, isEditing: false } : w
        ));
        closeConfirmModal();
      },
    });
  };

  const handleWizardSuccess = (workout) => {
    if (!workout?.id) return;
    setWorkouts((prev) => {
      const exists = prev.some((w) => w.id === workout.id);
      if (exists) {
        return prev.map((w) => (w.id === workout.id ? { ...w, ...workout } : w));
      }
      return [...prev, workout];
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
          <span className={styles.confirmHighlight}>«{programName}»</span>
          {' '}قرار گرفت و آرشیو به‌روز شد.
        </>
      ) : (
        <>
          <span className={styles.confirmHighlight}>«{programName}»</span>
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

  const submitArchive = async (workout, { replace = false } = {}) => {
    const programName = workout.name || 'این برنامه';
    try {
      setArchivingId(workout.id);
      setSaving(true);
      await api.workoutPrograms.archive(workout.id, { name: programName, replace });
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
              <span className={styles.confirmHighlight}>«{existingName}»</span>
              {' '}از قبل در آرشیو شما هست.
              {' '}اگر تأیید کنید، اطلاعات جدید روی مورد قبلی قرار می‌گیرد و بروزرسانی انجام می‌شود.
            </>
          ),
          icon: <Archive size={32} />,
          variant: 'warning',
          mode: 'confirm',
          confirmLabel: 'بروزرسانی آرشیو',
          cancelLabel: 'انصراف',
          onConfirm: () => submitArchive(workout, { replace: true }),
        });
        return;
      }
      console.error('Archive workout error:', err);
      showArchiveError(err);
    } finally {
      setArchivingId(null);
      setSaving(false);
    }
  };

  const archiveWorkout = (workout) => {
    if (!workout?.id || archivingId) return;
    const programName = workout.name || 'این برنامه';
    openConfirmModal({
      title: 'افزودن به آرشیو',
      message: (
        <>
          برنامه{' '}
          <span className={styles.confirmHighlight}>«{programName}»</span>
          {' '}به آرشیو برنامه‌های شما اضافه شود؟
        </>
      ),
      icon: <Archive size={32} />,
      variant: 'success',
      confirmLabel: 'آرشیو کن',
      cancelLabel: 'انصراف',
      onConfirm: () => submitArchive(workout, { replace: false }),
    });
  };

  const applyArchiveToDay = async (archiveItem) => {
    const dateStr = toApiDate(selectedDate);
    if (!dateStr || !archiveItem?.id) return;
    try {
      setSaving(true);
      const created = await api.workoutProgramArchives.apply(archiveItem.id, {
        member: userId,
        date: dateStr,
      });
      const mapped = mapProgramFromApi(created);
      setWorkouts((prev) => {
        const exists = prev.some((w) => w.id === mapped.id);
        if (exists) {
          return prev.map((w) => (w.id === mapped.id ? mapped : w));
        }
        return [...prev, mapped];
      });
      setShowArchivePicker(false);
      setComposerOpen(false);
    } catch (err) {
      console.error('Apply archive error:', err);
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
  const deleteWorkout = (id) => {
    openConfirmModal({
      title: 'حذف برنامه',
      message: 'آیا از حذف این برنامه تمرینی مطمئن هستید؟ این عمل قابل بازگشت نیست.',
      icon: <Trash2 size={32} />,
      variant: 'danger',
      onConfirm: async () => {
        try {
          setSaving(true);
          await api.workoutPrograms.delete(id);
          setWorkouts(workouts.filter(w => w.id !== id));
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
  // انتخاب حرکت از کتابخانه
  // ============================================
  const handleSelectFromLibrary = (item) => {
    setNewExercise({
      ...newExercise,
      exercise_library: item.id,
      title: item.title,
      image: item.image_url || '',
      sets: item.default_sets || 3,
      reps: item.default_reps || '12-15',
      restTime: item.default_rest_time || 60,
    });
    setShowExercisePicker(false);
  };

  // ============================================
  // افزودن حرکت به برنامه
  // ============================================
  const addExercise = async (workoutId) => {
    if (!newExercise.title.trim()) {
      alert('عنوان حرکت را وارد کنید یا از کتابخانه انتخاب کنید.');
      return;
    }

    try {
      setSaving(true);

      const payload = {
        exercise_library: newExercise.exercise_library || null,
        title: newExercise.title,
        sets: newExercise.sets,
        reps: newExercise.reps,
        rest_time: newExercise.restTime,
      };

      const created = await api.workoutPrograms.addExercise(workoutId, payload);

      // اگه سوپرست درخواست شده
      if (newExercise.isSuperSet) {
        const workout = workouts.find(w => w.id === workoutId);
        const lastEx = workout?.exercises?.[workout.exercises.length - 1];
        if (lastEx) {
          await api.workoutPrograms.toggleSuperSet(workoutId, created.id, lastEx.id);
        }
      }

      // Refresh از سرور برای دقت
      const fresh = await api.workoutPrograms.detail(workoutId);
      setWorkouts(workouts.map(w => w.id !== workoutId ? w : {
        ...w,
        exercises: (fresh.exercises || []).map((e) => ({
          id: e.id,
          exercise_library: e.exercise_library,
          title: e.title,
          image: e.image_url || '',
          sets: e.sets,
          reps: e.reps,
          priority: e.order,
          isSuperSet: e.is_super_set,
          superSetWith: e.super_set_with,
          restTime: e.rest_time,
        })),
      }));

      setNewExercise({
        exercise_library: null,
        title: '',
        image: '',
        sets: 3,
        reps: '12-15',
        priority: 1,
        isSuperSet: false,
        superSetWith: null,
        restTime: 60,
      });
      setShowAddExerciseModal(false);
    } catch (err) {
      alert(err.response?.data?.detail || 'خطا در افزودن حرکت');
    } finally {
      setSaving(false);
    }
  };

  // ============================================
  // حذف حرکت
  // ============================================
  const deleteExercise = (workoutId, exerciseId) => {
    openConfirmModal({
      title: 'حذف حرکت',
      message: 'آیا از حذف این حرکت مطمئن هستید؟',
      icon: <Trash2 size={32} />,
      variant: 'danger',
      onConfirm: async () => {
        try {
          setSaving(true);
          await api.workoutPrograms.deleteExercise(workoutId, exerciseId);
          setWorkouts(workouts.map(w => {
            if (w.id !== workoutId) return w;
            let newEx = w.exercises.filter(e => e.id !== exerciseId);
            newEx = newEx.map(e =>
              e.superSetWith === exerciseId
                ? { ...e, isSuperSet: false, superSetWith: null }
                : e
            );
            newEx.forEach((e, i) => (e.priority = i + 1));
            return { ...w, exercises: newEx };
          }));
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
  // ویرایش حرکت
  // ============================================
  const updateExercise = async (workoutId, exerciseId, updatedData) => {
    try {
      setSaving(true);
      const payload = {
        title: updatedData.title,
        sets: updatedData.sets,
        reps: updatedData.reps,
        rest_time: updatedData.restTime,
      };
      const updated = await api.workoutPrograms.updateExercise(workoutId, exerciseId, payload);
      setWorkouts(workouts.map(w => w.id !== workoutId ? w : {
        ...w,
        exercises: w.exercises.map(e => e.id !== exerciseId ? e : {
          ...e,
          title: updated.title,
          sets: updated.sets,
          reps: updated.reps,
          restTime: updated.rest_time,
        }),
      }));
    } catch (err) {
      alert(err.response?.data?.detail || 'خطا در ویرایش');
    } finally {
      setSaving(false);
    }
  };

  // ============================================
  // تبدیل به سوپرست / جدا کردن
  // ============================================
  const toggleSuperSet = async (workoutId, exerciseId) => {
    const workout = workouts.find(w => w.id === workoutId);
    if (!workout || !workout.isEditing) return;

    const exercise = workout.exercises.find(e => e.id === exerciseId);
    if (!exercise) return;

    try {
      setSaving(true);

      if (exercise.isSuperSet) {
        // جدا کردن
        await api.workoutPrograms.toggleSuperSet(workoutId, exerciseId, null);
        setWorkouts(workouts.map(w => {
          if (w.id !== workoutId) return w;
          return {
            ...w,
            exercises: w.exercises.map(e =>
              e.id === exerciseId || e.superSetWith === exerciseId
                ? { ...e, isSuperSet: false, superSetWith: null }
                : e
            ),
          };
        }));
      } else {
        // تبدیل به سوپرست با حرکت بعدی
        const idx = workout.exercises.findIndex(e => e.id === exerciseId);
        if (idx === workout.exercises.length - 1) {
          alert('حرکت بعدی وجود ندارد!');
          return;
        }

        const nextEx = workout.exercises[idx + 1];
        if (nextEx.isSuperSet) {
          alert('حرکت بعدی قبلاً سوپرست شده است!');
          return;
        }

        await api.workoutPrograms.toggleSuperSet(workoutId, exerciseId, nextEx.id);

        setWorkouts(workouts.map(w => {
          if (w.id !== workoutId) return w;
          return {
            ...w,
            exercises: w.exercises.map(e => {
              if (e.id === exerciseId) return { ...e, isSuperSet: true, superSetWith: nextEx.id };
              if (e.id === nextEx.id) return { ...e, isSuperSet: true, superSetWith: exerciseId };
              return e;
            }),
          };
        }));
      }
    } catch (err) {
      alert('خطا در تغییر سوپرست');
    } finally {
      setSaving(false);
    }
  };

  // ============================================
  // جدا کردن سوپرست
  // ============================================
  const unlinkSuperSet = async (workoutId, exerciseId1, exerciseId2) => {
    try {
      setSaving(true);
      await api.workoutPrograms.toggleSuperSet(workoutId, exerciseId1, null);
      setWorkouts(workouts.map(w => {
        if (w.id !== workoutId) return w;
        return {
          ...w,
          exercises: w.exercises.map(e =>
            e.id === exerciseId1 || e.id === exerciseId2
              ? { ...e, isSuperSet: false, superSetWith: null }
              : e
          ),
        };
      }));
    } catch (err) {
      alert('خطا در جدا کردن');
    } finally {
      setSaving(false);
    }
  };

  // ============================================
  // Drag & Drop Handlers
  // ============================================
  const handleDragStart = (e, exerciseId, workoutId, isEditing) => {
    if (!isEditing) {
      e.preventDefault();
      return;
    }
    setDraggingId(exerciseId);
    setDraggingWorkoutId(workoutId);
    dragSourceRef.current = { exerciseId, workoutId };
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', exerciseId);
  };

  const handleDragOver = (e, exerciseId, isEditing) => {
    if (!isEditing) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (exerciseId !== draggingId) {
      setDropTargetId(exerciseId);
    }
  };

  const handleDragLeave = () => {
    setDropTargetId(null);
  };

  const handleDragEnd = () => {
    setDraggingId(null);
    setDropTargetId(null);
    setDraggingWorkoutId(null);
    dragSourceRef.current = null;
  };

  const handleDrop = async (e, targetExerciseId, targetWorkoutId) => {
    e.preventDefault();
    e.stopPropagation();

    const source = dragSourceRef.current;
    if (!source) {
      handleDragEnd();
      return;
    }

    const { exerciseId: sourceId, workoutId: sourceWorkoutId } = source;

    if (sourceId === targetExerciseId) {
      handleDragEnd();
      return;
    }

    const sourceWorkout = workouts.find(w => w.id === sourceWorkoutId);
    const targetWorkout = workouts.find(w => w.id === targetWorkoutId);

    if (!sourceWorkout?.isEditing || !targetWorkout?.isEditing) {
      handleDragEnd();
      return;
    }

    // فقط همان برنامه
    if (sourceWorkoutId === targetWorkoutId) {
      try {
        setSaving(true);

        // اول جدا کردن سوپرست‌های موجود
        const sourceEx = sourceWorkout.exercises.find(e => e.id === sourceId);
        const targetEx = sourceWorkout.exercises.find(e => e.id === targetExerciseId);

        if (sourceEx?.isSuperSet) {
          await api.workoutPrograms.toggleSuperSet(sourceWorkoutId, sourceId, null);
        }
        if (targetEx?.isSuperSet) {
          await api.workoutPrograms.toggleSuperSet(sourceWorkoutId, targetExerciseId, null);
        }

        // حالا سوپرست جدید
        await api.workoutPrograms.toggleSuperSet(sourceWorkoutId, sourceId, targetExerciseId);

        // Refresh
        const fresh = await api.workoutPrograms.detail(sourceWorkoutId);
        setWorkouts(workouts.map(w => w.id !== sourceWorkoutId ? w : {
          ...w,
          exercises: (fresh.exercises || []).map((e) => ({
            id: e.id,
            exercise_library: e.exercise_library,
            title: e.title,
            image: e.image_url || '',
            sets: e.sets,
            reps: e.reps,
            priority: e.order,
            isSuperSet: e.is_super_set,
            superSetWith: e.super_set_with,
            restTime: e.rest_time,
          })),
        }));
      } catch (err) {
        alert('خطا در سوپرست کردن');
      } finally {
        setSaving(false);
      }
    }

    handleDragEnd();
  };

  // ============================================
  // جابجایی حرکت (بالا/پایین)
  // ============================================
  const moveExercise = async (workoutId, exerciseId, direction) => {
    const workout = workouts.find(w => w.id === workoutId);
    if (!workout || !workout.isEditing) return;

    const exercises = [...workout.exercises];
    const currentIndex = exercises.findIndex(e => e.id === exerciseId);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= exercises.length) return;

    [exercises[currentIndex], exercises[newIndex]] = [
      exercises[newIndex],
      exercises[currentIndex],
    ];

    exercises.forEach((ex, idx) => (ex.priority = idx + 1));

    // Optimistic update
    setWorkouts(workouts.map(w => w.id === workoutId ? { ...w, exercises } : w));

    // ارسال به سرور
    try {
      const orders = exercises.map((ex, idx) => ({ id: ex.id, order: idx + 1 }));
      await api.workoutPrograms.reorderExercises(workoutId, orders);
    } catch (err) {
      alert('خطا در جابجایی');
      // اگه خطا شد، reload کن
      try {
        const fresh = await api.workoutPrograms.detail(workoutId);
        setWorkouts(workouts.map(w => w.id !== workoutId ? w : {
          ...w,
          exercises: (fresh.exercises || []).map((e) => ({
            id: e.id,
            title: e.title,
            image: e.image_url || '',
            sets: e.sets,
            reps: e.reps,
            priority: e.order,
            isSuperSet: e.is_super_set,
            superSetWith: e.super_set_with,
            restTime: e.rest_time,
          })),
        }));
      } catch (_) {}
    }
  };

  // ============================================
  // رندر لیبل‌های حرکت
  // ============================================
  const renderExerciseLabels = (exercises, workoutId, isEditing) => {
    const grouped = groupSuperSets(exercises);

    return (
      <div className={styles.exerciseContainer}>
        {grouped.map((group, index) => {
          if (group.type === 'superSet') {
            const [ex1, ex2] = group.exercises;
            return (
              <div key={`super-${ex1.id}-${ex2.id}`} className={styles.superSetGroup}>
                <div className={styles.superSetGroupHeader}>
                  <Zap size={14} className={styles.superSetIcon} />
                  <span className={styles.superSetLabel}>سوپر ست</span>
                  <span className={styles.superSetHint}>این دو حرکت را پشت‌سرهم و بدون استراحت انجام دهید</span>
                  {isEditing && (
                    <button
                      className={styles.superSetUnlink}
                      onClick={() => unlinkSuperSet(workoutId, ex1.id, ex2.id)}
                    >
                      <Unlink size={11} />
                      جدا کردن
                    </button>
                  )}
                </div>

                <div className={styles.superSetItems}>
                  <div
                    className={clsx(styles.superSetItem, isEditing && styles.superSetItemEditable)}
                    draggable={isEditing}
                    onDragStart={(e) => handleDragStart(e, ex1.id, workoutId, isEditing)}
                    onDragEnd={handleDragEnd}
                  >
                    <div className={styles.exerciseMain}>
                      {isEditing && <div className={styles.dragHandle}><GripVertical size={14} /></div>}
                      <div className={styles.exerciseThumbnail} aria-hidden>
                        {ex1.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={ex1.image} alt="" />
                        ) : (
                          <Dumbbell size={16} />
                        )}
                      </div>
                      <div className={styles.exerciseInfo}>
                        <div className={styles.exerciseTitleRow}>
                          <span className={styles.exerciseTitle}>{ex1.title}</span>
                        </div>
                        <div className={styles.exerciseMeta}>
                          <span><Target size={11} />{ex1.sets} ست × {ex1.reps}</span>
                          <span><Clock size={11} />{ex1.restTime} ثانیه</span>
                        </div>
                      </div>
                    </div>
                    {isEditing && (
                      <div className={styles.exerciseActions}>
                        <button
                          className={styles.iconButton}
                          onClick={() => {
                            setSelectedExercise({ ...ex1, workoutId });
                            setShowEditExerciseModal(true);
                          }}
                        >
                          <Edit size={12} />
                        </button>
                        <button
                          className={clsx(styles.iconButton, styles.iconButtonDanger)}
                          onClick={() => deleteExercise(workoutId, ex1.id)}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className={styles.superSetPlus}>
                    <Plus size={18} strokeWidth={3} />
                  </div>

                  <div
                    className={clsx(styles.superSetItem, isEditing && styles.superSetItemEditable)}
                    draggable={isEditing}
                    onDragStart={(e) => handleDragStart(e, ex2.id, workoutId, isEditing)}
                    onDragEnd={handleDragEnd}
                  >
                    <div className={styles.exerciseMain}>
                      {isEditing && <div className={styles.dragHandle}><GripVertical size={14} /></div>}
                      <div className={styles.exerciseThumbnail} aria-hidden>
                        {ex2.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={ex2.image} alt="" />
                        ) : (
                          <Dumbbell size={16} />
                        )}
                      </div>
                      <div className={styles.exerciseInfo}>
                        <div className={styles.exerciseTitleRow}>
                          <span className={styles.exerciseTitle}>{ex2.title}</span>
                        </div>
                        <div className={styles.exerciseMeta}>
                          <span><Target size={11} />{ex2.sets} ست × {ex2.reps}</span>
                          <span><Clock size={11} />{ex2.restTime} ثانیه</span>
                        </div>
                      </div>
                    </div>
                    {isEditing && (
                      <div className={styles.exerciseActions}>
                        <button
                          className={styles.iconButton}
                          onClick={() => {
                            setSelectedExercise({ ...ex2, workoutId });
                            setShowEditExerciseModal(true);
                          }}
                        >
                          <Edit size={12} />
                        </button>
                        <button
                          className={clsx(styles.iconButton, styles.iconButtonDanger)}
                          onClick={() => deleteExercise(workoutId, ex2.id)}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          }

          // حرکت تکی
          const exercise = group.exercises[0];
          const actualIndex = exercises.findIndex(e => e.id === exercise.id);
          const isLast = actualIndex === exercises.length - 1;
          const isFirst = actualIndex === 0;
          const nextExercise = exercises[actualIndex + 1];
          const isDropTarget = dropTargetId === exercise.id && draggingId !== exercise.id;
          const isDragging = draggingId === exercise.id;

          return (
            <div
              key={exercise.id}
              className={clsx(
                styles.exerciseRow,
                isEditing && styles.exerciseRowEditable,
                isDragging && styles.exerciseRowDragging,
                isDropTarget && styles.exerciseRowDropTarget
              )}
              draggable={isEditing}
              onDragStart={(e) => handleDragStart(e, exercise.id, workoutId, isEditing)}
              onDragOver={(e) => handleDragOver(e, exercise.id, isEditing)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, exercise.id, workoutId)}
              onDragEnd={handleDragEnd}
            >
              <div className={styles.exerciseMain}>
                {isEditing && <div className={styles.dragHandle}><GripVertical size={14} /></div>}
                <div className={styles.exerciseThumbnail} aria-hidden>
                  {exercise.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={exercise.image} alt="" />
                  ) : (
                    <Dumbbell size={16} />
                  )}
                </div>
                <div className={styles.exerciseInfo}>
                  <div className={styles.exerciseTitleRow}>
                    <span className={styles.exerciseTitle}>{exercise.title}</span>
                    <span className={styles.exercisePriority}>#{exercise.priority}</span>
                  </div>
                  <div className={styles.exerciseMeta}>
                    <span><Target size={11} />{exercise.sets} ست × {exercise.reps}</span>
                    <span><Clock size={11} />{exercise.restTime} ثانیه</span>
                  </div>
                </div>
              </div>

              {isDropTarget && (
                <div className={styles.dropIndicator}>
                  <Link size={12} />
                  برای سوپر ست اینجا رها کنید
                </div>
              )}

              {isEditing && (
                <div className={styles.exerciseActions}>
                  <div className={styles.moveButtons}>
                    <button
                      className={styles.moveButton}
                      onClick={() => moveExercise(workoutId, exercise.id, 'up')}
                      disabled={isFirst}
                      title="انتقال به بالا"
                    >
                      <ChevronUp size={14} />
                    </button>
                    <button
                      className={styles.moveButton}
                      onClick={() => moveExercise(workoutId, exercise.id, 'down')}
                      disabled={isLast}
                      title="انتقال به پایین"
                    >
                      <ChevronDown size={14} />
                    </button>
                  </div>

                  {!isLast && !nextExercise?.isSuperSet && (
                    <button
                      className={styles.superSetButton}
                      onClick={() => toggleSuperSet(workoutId, exercise.id)}
                      title="تبدیل به سوپر ست با حرکت بعدی"
                    >
                      <Link size={12} />
                      <span>سوپر ست</span>
                    </button>
                  )}

                  <button
                    className={styles.iconButton}
                    onClick={() => {
                      setSelectedExercise({ ...exercise, workoutId });
                      setShowEditExerciseModal(true);
                    }}
                  >
                    <Edit size={12} />
                  </button>

                  <button
                    className={clsx(styles.iconButton, styles.iconButtonDanger)}
                    onClick={() => deleteExercise(workoutId, exercise.id)}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              )}
            </div>
          );
        })}

        {isEditing && (
          <button
            className={styles.addExerciseButton}
            onClick={() => {
              setSelectedWorkout(workouts.find(w => w.id === workoutId));
              setShowAddExerciseModal(true);
            }}
          >
            <Plus size={14} />
            افزودن حرکت
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
        <div className={styles.emptyState}>
          <Loader2 className={styles.spinner} size={48} />
          <p>در حال دریافت برنامه‌ها...</p>
        </div>
      );
    }

    if (composerOpen) {
      return (
        <AddWorkoutWizard
          api={api}
          memberId={userId}
          selectedDate={selectedDate}
          onCancel={() => setComposerOpen(false)}
          onSuccess={handleWizardSuccess}
        />
      );
    }

    if (dayWorkouts.length === 0) {
      return (
        <div className={styles.emptyState}>
          <Dumbbell size={56} />
          <h4>هیچ برنامه تمرینی برای این روز ثبت نشده است</h4>
          <p>برنامه جدید بسازید یا از آرشیو برنامه‌های خودتان انتخاب کنید</p>
          <div className={styles.emptyActions}>
            <button
              type="button"
              className={styles.primaryButton}
              onClick={() => setComposerOpen(true)}
            >
              <Plus size={16} />
              افزودن برنامه جدید
            </button>
            <button
              type="button"
              className={styles.secondaryButton}
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
      <div className={styles.workoutList}>
        <div className={styles.dateBanner}>
          <Calendar size={16} />
          <span>{formatJalaliDate(selectedDate)}</span>
        </div>

        {dayWorkouts.map((workout) => (
          <div
            key={workout.id}
            className={clsx(
              styles.workoutCard,
              workout.isApproved && !workout.isEditing && styles.workoutCardLocked,
              workout.isEditing && styles.workoutCardEditing
            )}
          >
            <div className={styles.workoutCardHeader}>
              <div className={styles.workoutCardTitle}>
                <span>{workout.name}</span>
                <div className={styles.workoutCardBadges}>
                  {workout.type ? (
                    <span className={styles.badge}>
                      <Target size={11} />
                      {workout.type}
                    </span>
                  ) : null}
                  <span className={styles.badge}>
                    <Dumbbell size={11} />
                    {workout.exercises.length} حرکت
                  </span>
                  {workout.isApproved && !workout.isEditing && (
                    <span className={clsx(styles.badge, styles.badgeApproved)}>
                      <Lock size={11} />
                      تایید شده
                    </span>
                  )}
                  {workout.isEditing && (
                    <span className={clsx(styles.badge, styles.badgeEditing)}>
                      <Edit size={11} />
                      در حال ویرایش
                    </span>
                  )}
                </div>
              </div>

              <div className={styles.workoutCardActions}>
                {!workout.isApproved && !workout.isEditing && (
                  <button className={styles.actionButton} onClick={() => enableEditMode(workout.id)}>
                    <Edit size={14} />
                    ویرایش
                  </button>
                )}

                {workout.isEditing && !workout.isApproved && (
                  <>
                    <button className={styles.actionButton} onClick={() => cancelEditMode(workout.id)}>
                      <RotateCcw size={14} />
                      لغو
                    </button>
                    <button
                      className={clsx(styles.actionButton, styles.actionButtonSuccess)}
                      onClick={() => approveWorkout(workout.id)}
                    >
                      <Check size={14} />
                      تایید نهایی
                    </button>
                  </>
                )}

                {workout.isApproved && workout.isEditing && (
                  <>
                    <button className={styles.actionButton} onClick={() => cancelEditMode(workout.id)}>
                      <RotateCcw size={14} />
                      لغو
                    </button>
                    <button
                      className={clsx(styles.actionButton, styles.actionButtonSuccess)}
                      onClick={() => saveEditMode(workout.id)}
                    >
                      <Save size={14} />
                      ذخیره تغییرات
                    </button>
                  </>
                )}

                {workout.isApproved && !workout.isEditing && (
                  <button className={styles.actionButton} onClick={() => enableEditMode(workout.id)}>
                    <Unlock size={14} />
                    ویرایش
                  </button>
                )}

                <button
                  type="button"
                  className={styles.actionButton}
                  onClick={() => archiveWorkout(workout)}
                  disabled={archivingId === workout.id}
                  title="ذخیره در آرشیو برنامه‌های من"
                >
                  {archivingId === workout.id ? (
                    <Loader2 size={14} className={styles.spinner} />
                  ) : (
                    <Archive size={14} />
                  )}
                  آرشیو
                </button>

                <button
                  className={clsx(styles.iconButton, styles.iconButtonDanger)}
                  onClick={() => deleteWorkout(workout.id)}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            {workout.isApproved && !workout.isEditing && (
              <div className={styles.lockedBanner}>
                <Lock size={14} />
                <span>این برنامه تایید شده است. برای تغییر، روی دکمه ویرایش کلیک کنید.</span>
              </div>
            )}

            {workout.isEditing && (
              <div className={styles.editingBanner}>
                <AlertCircle size={14} />
                <span>
                  در حال ویرایش — حرکات را جابه‌جا کنید، حرکت جدید اضافه کنید، بعد «تایید نهایی» بزنید.
                </span>
              </div>
            )}

            <div className={styles.workoutCardBody}>
              {renderExerciseLabels(workout.exercises, workout.id, workout.isEditing)}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // ============================================
  // رندر اصلی
  // ============================================
  return (
    <div className={styles.workoutManager}>
      {/* هدر */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <button className={styles.backButton} onClick={onClose}>
            <ArrowLeft size={18} />
            بازگشت
          </button>
          <h2 className={styles.headerTitle}>
            <Dumbbell size={22} />
            مدیریت برنامه ورزشی
          </h2>
          {userName && <span className={styles.userBadge}>{userName}</span>}
        </div>
        <div className={styles.headerRight}>
          <div className={styles.searchBox}>
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
            className={styles.secondaryButton}
            onClick={() => setShowArchivePicker(true)}
            disabled={composerOpen}
          >
            <Archive size={16} />
            آرشیو برنامه‌ها
          </button>
          <button
            type="button"
            className={styles.primaryButton}
            onClick={() => setComposerOpen(true)}
            disabled={composerOpen}
          >
            <Plus size={16} />
            برنامه جدید
          </button>
        </div>
      </div>

      {/* بدنه */}
      <div className={styles.body}>
        <div className={styles.layout}>
          <div className={styles.calendarSidebar}>
            <GymPersianCalendar
              selectedDate={selectedDate}
              onDateSelect={(date) => {
                setSelectedDate(date);
                setComposerOpen(false);
              }}
              markedDates={workouts.map((w) => w.date)}
            />
          </div>
          <div className={styles.contentArea}>{renderDayContent()}</div>
        </div>
      </div>

      {/* ===== Confirm Modal ===== */}
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

      {/* ===== مودال افزودن حرکت (ساده) ===== */}
      <Modal
        isOpen={showAddExerciseModal}
        onClose={() => setShowAddExerciseModal(false)}
        title="افزودن حرکت"
      >
        <div className={styles.modalForm}>
          <p className={styles.fieldHint}>
            حرکت را از کتابخانه بردارید، ست و تکرار را بزنید و اضافه کنید.
          </p>

          <button
            type="button"
            className={styles.libraryPickerBtn}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowExercisePicker(true);
            }}
          >
            <Dumbbell size={16} />
            {newExercise.title
              ? `انتخاب‌شده: ${newExercise.title}`
              : 'انتخاب از کتابخانه'}
          </button>

          <div className={styles.formGroup}>
            <span className={styles.fieldLabel}>ست</span>
            <div className={styles.typeChipGrid}>
              {SET_PRESETS.map((n) => (
                <button
                  key={n}
                  type="button"
                  className={clsx(
                    styles.typeChip,
                    newExercise.sets === n && styles.typeChipActive,
                  )}
                  onClick={() => setNewExercise({ ...newExercise, sets: n })}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.formGroup}>
            <span className={styles.fieldLabel}>تکرار</span>
            <div className={styles.typeChipGrid}>
              {REP_PRESETS.map((n) => (
                <button
                  key={n}
                  type="button"
                  className={clsx(
                    styles.typeChip,
                    newExercise.reps === n && styles.typeChipActive,
                  )}
                  onClick={() => setNewExercise({ ...newExercise, reps: n })}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.formGroup}>
            <span className={styles.fieldLabel}>استراحت (ثانیه)</span>
            <div className={styles.typeChipGrid}>
              {REST_PRESETS.map((n) => (
                <button
                  key={n}
                  type="button"
                  className={clsx(
                    styles.typeChip,
                    newExercise.restTime === n && styles.typeChipActive,
                  )}
                  onClick={() => setNewExercise({ ...newExercise, restTime: n })}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.modalActions}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={() => setShowAddExerciseModal(false)}
            >
              انصراف
            </button>
            <button
              type="button"
              className={styles.confirmButton}
              onClick={() => addExercise(selectedWorkout?.id)}
              disabled={saving || !newExercise.title}
            >
              <Plus size={16} />
              {saving ? 'در حال ثبت...' : 'افزودن حرکت'}
            </button>
          </div>
        </div>
      </Modal>

      {/* ===== مودال ویرایش حرکت ===== */}
      <Modal
        isOpen={showEditExerciseModal}
        onClose={() => {
          setShowEditExerciseModal(false);
          setSelectedExercise(null);
        }}
        title="ویرایش حرکت"
        size="lg"
      >
        {selectedExercise && (
          <div className={styles.modalForm}>
            <div className={styles.formGroup}>
              <label>عنوان حرکت</label>
              <input
                type="text"
                value={selectedExercise.title}
                onChange={(e) =>
                  setSelectedExercise({ ...selectedExercise, title: e.target.value })
                }
              />
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>تعداد ست</label>
                <input
                  type="number"
                  value={selectedExercise.sets}
                  onChange={(e) =>
                    setSelectedExercise({
                      ...selectedExercise,
                      sets: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>
              <div className={styles.formGroup}>
                <label>تعداد تکرار</label>
                <input
                  type="text"
                  value={selectedExercise.reps}
                  onChange={(e) =>
                    setSelectedExercise({ ...selectedExercise, reps: e.target.value })
                  }
                />
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>اولویت</label>
                <select
                  value={selectedExercise.priority}
                  onChange={(e) =>
                    setSelectedExercise({
                      ...selectedExercise,
                      priority: parseInt(e.target.value),
                    })
                  }
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>زمان استراحت (ثانیه)</label>
                <input
                  type="number"
                  value={selectedExercise.restTime}
                  onChange={(e) =>
                    setSelectedExercise({
                      ...selectedExercise,
                      restTime: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>
            </div>

            <div className={styles.modalActions}>
              <button
                className={styles.cancelButton}
                onClick={() => {
                  setShowEditExerciseModal(false);
                  setSelectedExercise(null);
                }}
              >
                انصراف
              </button>
              <button
                className={styles.confirmButton}
                onClick={async () => {
                  if (selectedExercise.workoutId) {
                    await updateExercise(
                      selectedExercise.workoutId,
                      selectedExercise.id,
                      selectedExercise
                    );
                  }
                  setShowEditExerciseModal(false);
                  setSelectedExercise(null);
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

      {/* ===== Exercise Picker ===== */}
      <ExercisePickerModal
        isOpen={showExercisePicker}
        onClose={() => setShowExercisePicker(false)}
        onSelect={handleSelectFromLibrary}
      />

      <WorkoutArchivePickerModal
        isOpen={showArchivePicker}
        onClose={() => setShowArchivePicker(false)}
        api={api}
        onSelect={applyArchiveToDay}
      />
    </div>
  );
}