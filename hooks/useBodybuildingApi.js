// hooks/useBodybuildingApi.js
'use client';

import { useCallback, useMemo } from 'react';
import axios from 'axios';
import Config from '@/config/config';
import { useAuth } from '@/contexts/AuthContext';

export function useBodybuildingApi(businessSlug) {
  const { getAuthHeaders } = useAuth();

  // ✅ decode کردن slug فارسی
  const decodedSlug = useMemo(() => {
    if (!businessSlug) return businessSlug;
    try {
      if (businessSlug.includes('%')) {
        return decodeURIComponent(businessSlug);
      }
      return businessSlug;
    } catch (e) {
      console.error('Failed to decode businessSlug:', e);
      return businessSlug;
    }
  }, [businessSlug]);

  // ✅ request پایه
  const request = useCallback(async (method, url, data = null, config = {}) => {
    const headers = {
      ...getAuthHeaders(),
      ...(config.headers || {}),
    };
    const isFormData = data instanceof FormData;
    const methodUpper = String(method || 'GET').toUpperCase();
    const skipJsonBody = ['GET', 'DELETE', 'HEAD'].includes(methodUpper);

    try {
      const response = await axios({
        method,
        url,
        ...(skipJsonBody ? {} : { data }),
        ...config,
        headers: isFormData || skipJsonBody
          ? headers
          : { 'Content-Type': 'application/json', ...headers },
      });
      return response.data;
    } catch (error) {
      console.error(`API ${method} ${url} failed:`, error.response?.data || error.message);
      throw error;
    }
  }, [getAuthHeaders]);

  // ✅ همه چیز memoize شده - از لوپ جلوگیری می‌کنه
  return useMemo(() => {
    const api = {
      get: (url, config) => request('GET', url, null, config),
      post: (url, data, config) => request('POST', url, data, config),
      put: (url, data, config) => request('PUT', url, data, config),
      patch: (url, data, config) => request('PATCH', url, data, config),
      delete: (url, config) => request('DELETE', url, null, config),
    };

    return {
      // ============ Stats ============
      getStats: () => api.get(Config.endpoints.bodybuilding.dashboardStats(decodedSlug)),

      // ============ Members ============
      members: {
        list: (params) => api.get(Config.endpoints.bodybuilding.members.list(decodedSlug, params)),
        detail: (id) => api.get(Config.endpoints.bodybuilding.members.detail(decodedSlug, id)),
        create: (data) => api.post(Config.endpoints.bodybuilding.members.create(decodedSlug), data),
        update: (id, data) => api.put(Config.endpoints.bodybuilding.members.update(decodedSlug, id), data),
        partialUpdate: (id, data) => api.patch(Config.endpoints.bodybuilding.members.partialUpdate(decodedSlug, id), data),
        delete: (id) => api.delete(Config.endpoints.bodybuilding.members.delete(decodedSlug, id)),
        toggleStatus: (id) => api.post(Config.endpoints.bodybuilding.members.toggleStatus(decodedSlug, id)),
        alerts: () => api.get(Config.endpoints.bodybuilding.members.alerts(decodedSlug)),
        bodyProfile: (id) => api.get(Config.endpoints.bodybuilding.members.bodyProfile(decodedSlug, id)),
        saveBodyProfile: (id, data) => api.patch(
          Config.endpoints.bodybuilding.members.bodyProfile(decodedSlug, id),
          data,
        ),
        progressLogs: (id) => api.get(Config.endpoints.bodybuilding.members.progressLogs(decodedSlug, id)),
        addProgressLog: (id, data) => api.post(
          Config.endpoints.bodybuilding.members.progressLogs(decodedSlug, id),
          data,
        ),
        deleteProgressLog: (id, logId) => api.delete(
          Config.endpoints.bodybuilding.members.progressLogDetail(decodedSlug, id, logId),
        ),
        trackingSummary: (id) => api.get(
          Config.endpoints.bodybuilding.members.trackingSummary(decodedSlug, id),
        ),
      },

      // ============ Packages ============
      packages: {
        list: (params) => api.get(Config.endpoints.bodybuilding.packages.list(decodedSlug, params)),
        detail: (id) => api.get(Config.endpoints.bodybuilding.packages.detail(decodedSlug, id)),
        create: (data) => api.post(Config.endpoints.bodybuilding.packages.create(decodedSlug), data),
        update: (id, data) => api.put(Config.endpoints.bodybuilding.packages.update(decodedSlug, id), data),
        delete: (id) => api.delete(Config.endpoints.bodybuilding.packages.delete(decodedSlug, id)),
      },

      // ============ Sessions ============
      sessions: {
        list: (params) => api.get(Config.endpoints.bodybuilding.sessions.list(decodedSlug, params)),
        detail: (id) => api.get(Config.endpoints.bodybuilding.sessions.detail(decodedSlug, id)),
        create: (data) => api.post(Config.endpoints.bodybuilding.sessions.create(decodedSlug), data),
        update: (id, data) => api.put(Config.endpoints.bodybuilding.sessions.update(decodedSlug, id), data),
        delete: (id) => api.delete(Config.endpoints.bodybuilding.sessions.delete(decodedSlug, id)),
      },

      // ============ Trainers ============
      trainers: {
        list: (params) => api.get(Config.endpoints.bodybuilding.trainers.list(decodedSlug, params)),
        detail: (id) => api.get(Config.endpoints.bodybuilding.trainers.detail(decodedSlug, id)),
        create: (data) => api.post(Config.endpoints.bodybuilding.trainers.create(decodedSlug), data),
        update: (id, data) => api.put(Config.endpoints.bodybuilding.trainers.update(decodedSlug, id), data),
        delete: (id) => api.delete(Config.endpoints.bodybuilding.trainers.delete(decodedSlug, id)),
        toggleStatus: (id) => api.post(Config.endpoints.bodybuilding.trainers.toggleStatus(decodedSlug, id)),
      },

      // ============ Products ============
      products: {
        list: (params) => api.get(Config.endpoints.bodybuilding.products.list(decodedSlug, params)),
        detail: (id) => api.get(Config.endpoints.bodybuilding.products.detail(decodedSlug, id)),
        create: (data) => api.post(Config.endpoints.bodybuilding.products.create(decodedSlug), data),
        update: (id, data) => api.put(Config.endpoints.bodybuilding.products.update(decodedSlug, id), data),
        delete: (id) => api.delete(Config.endpoints.bodybuilding.products.delete(decodedSlug, id)),
      },

      // ============ Workout Programs ============
      workoutPrograms: {
        list: (params) => api.get(Config.endpoints.bodybuilding.workoutPrograms.list(decodedSlug, params)),
        detail: (id) => api.get(Config.endpoints.bodybuilding.workoutPrograms.detail(decodedSlug, id)),
        create: (data) => api.post(Config.endpoints.bodybuilding.workoutPrograms.create(decodedSlug), data),
        update: (id, data) => api.put(Config.endpoints.bodybuilding.workoutPrograms.update(decodedSlug, id), data),
        delete: (id) => api.delete(Config.endpoints.bodybuilding.workoutPrograms.delete(decodedSlug, id)),
        approve: (id) => api.post(Config.endpoints.bodybuilding.workoutPrograms.approve(decodedSlug, id)),
        unlock: (id) => api.post(Config.endpoints.bodybuilding.workoutPrograms.unlock(decodedSlug, id)),
        addExercise: (programId, data) => api.post(
          Config.endpoints.bodybuilding.workoutPrograms.addExercise(decodedSlug, programId), data
        ),
        updateExercise: (programId, exerciseId, data) => api.patch(
          Config.endpoints.bodybuilding.workoutPrograms.updateExercise(decodedSlug, programId, exerciseId), data
        ),
        deleteExercise: (programId, exerciseId) => api.delete(
          Config.endpoints.bodybuilding.workoutPrograms.deleteExercise(decodedSlug, programId, exerciseId)
        ),
        reorderExercises: (programId, orders) => api.post(
          Config.endpoints.bodybuilding.workoutPrograms.reorderExercises(decodedSlug, programId),
          { orders }
        ),
        toggleSuperSet: (programId, exerciseId, superSetWith) => api.post(
          Config.endpoints.bodybuilding.workoutPrograms.toggleSuperSet(decodedSlug, programId),
          { exercise_id: exerciseId, super_set_with: superSetWith }
        ),
        archive: (programId, data = {}) => api.post(
          Config.endpoints.bodybuilding.workoutPrograms.archive(decodedSlug, programId),
          data
        ),
      },

      // ============ Workout Program Archives (trainer library) ============
      workoutProgramArchives: {
        list: (params) => api.get(
          Config.endpoints.bodybuilding.workoutProgramArchives.list(decodedSlug, params)
        ),
        detail: (id) => api.get(
          Config.endpoints.bodybuilding.workoutProgramArchives.detail(decodedSlug, id)
        ),
        update: (id, data) => api.patch(
          Config.endpoints.bodybuilding.workoutProgramArchives.update(decodedSlug, id),
          data
        ),
        delete: (id) => api.delete(
          Config.endpoints.bodybuilding.workoutProgramArchives.delete(decodedSlug, id)
        ),
        apply: (id, data) => api.post(
          Config.endpoints.bodybuilding.workoutProgramArchives.apply(decodedSlug, id),
          data
        ),
      },

      // ============ Diet Programs ============
      dietPrograms: {
        list: (params) => api.get(Config.endpoints.bodybuilding.dietPrograms.list(decodedSlug, params)),
        detail: (id) => api.get(Config.endpoints.bodybuilding.dietPrograms.detail(decodedSlug, id)),
        create: (data) => api.post(Config.endpoints.bodybuilding.dietPrograms.create(decodedSlug), data),
        update: (id, data) => api.put(Config.endpoints.bodybuilding.dietPrograms.update(decodedSlug, id), data),
        delete: (id) => api.delete(Config.endpoints.bodybuilding.dietPrograms.delete(decodedSlug, id)),
        approve: (id) => api.post(Config.endpoints.bodybuilding.dietPrograms.approve(decodedSlug, id)),
        unlock: (id) => api.post(Config.endpoints.bodybuilding.dietPrograms.unlock(decodedSlug, id)),
        addMeal: (programId, data) => api.post(
          Config.endpoints.bodybuilding.dietPrograms.addMeal(decodedSlug, programId), data
        ),
        updateMeal: (programId, mealId, data) => api.patch(
          Config.endpoints.bodybuilding.dietPrograms.updateMeal(decodedSlug, programId, mealId), data
        ),
        deleteMeal: (programId, mealId) => api.delete(
          Config.endpoints.bodybuilding.dietPrograms.deleteMeal(decodedSlug, programId, mealId)
        ),
        addFood: (programId, mealId, data) => api.post(
          Config.endpoints.bodybuilding.dietPrograms.addFood(decodedSlug, programId, mealId), data
        ),
        updateFood: (programId, mealId, itemId, data) => api.patch(
          Config.endpoints.bodybuilding.dietPrograms.updateFood(decodedSlug, programId, mealId, itemId), data
        ),
        deleteFood: (programId, mealId, itemId) => api.delete(
          Config.endpoints.bodybuilding.dietPrograms.deleteFood(decodedSlug, programId, mealId, itemId)
        ),
        archive: (programId, data = {}) => api.post(
          Config.endpoints.bodybuilding.dietPrograms.archive(decodedSlug, programId),
          data
        ),
      },

      dietProgramArchives: {
        list: (params) => api.get(
          Config.endpoints.bodybuilding.dietProgramArchives.list(decodedSlug, params)
        ),
        detail: (id) => api.get(
          Config.endpoints.bodybuilding.dietProgramArchives.detail(decodedSlug, id)
        ),
        update: (id, data) => api.patch(
          Config.endpoints.bodybuilding.dietProgramArchives.update(decodedSlug, id),
          data
        ),
        delete: (id) => api.delete(
          Config.endpoints.bodybuilding.dietProgramArchives.delete(decodedSlug, id)
        ),
        apply: (id, data) => api.post(
          Config.endpoints.bodybuilding.dietProgramArchives.apply(decodedSlug, id),
          data
        ),
      },

      // ============ SMS ============
      sms: {
        panel: () => api.get(Config.endpoints.bodybuilding.sms.panel(decodedSlug)),
        charge: (amount) => api.post(
          Config.endpoints.bodybuilding.sms.charge(decodedSlug), { amount }
        ),
      },

      // ============ Alerts ============
      alerts: {
        list: (params) => api.get(Config.endpoints.bodybuilding.alerts.list(decodedSlug, params)),
        resolve: (id) => api.post(Config.endpoints.bodybuilding.alerts.resolve(decodedSlug, id)),
        generate: () => api.post(Config.endpoints.bodybuilding.alerts.generate(decodedSlug)),
      },

      // ============ اطلاعات کسب‌وکار ============
      getBusinessInfo: () =>
        api.get(Config.endpoints.bodybuilding.getBusinessInfo(decodedSlug)),

      
      // ============ Library (عمومی) ============
      library: {
        exercises: {
          list: (params) => api.get(Config.endpoints.bodybuilding.library.exercises.list(params)),
          detail: (slug) => api.get(Config.endpoints.bodybuilding.library.exercises.detail(slug)),
          create: (data) => api.post(Config.endpoints.bodybuilding.library.exercises.create(), data),
          update: (slug, data) => api.put(Config.endpoints.bodybuilding.library.exercises.update(slug), data),
          delete: (slug) => api.delete(Config.endpoints.bodybuilding.library.exercises.delete(slug)),
          grouped: () => api.get(Config.endpoints.bodybuilding.library.exercises.grouped()),
        },
        foods: {
          list: (params) => api.get(Config.endpoints.bodybuilding.library.foods.list(params)),
          detail: (slug) => api.get(Config.endpoints.bodybuilding.library.foods.detail(slug)),
          create: (data) => api.post(Config.endpoints.bodybuilding.library.foods.create(), data),
          update: (slug, data) => api.put(Config.endpoints.bodybuilding.library.foods.update(slug), data),
          delete: (slug) => api.delete(Config.endpoints.bodybuilding.library.foods.delete(slug)),
          grouped: () => api.get(Config.endpoints.bodybuilding.library.foods.grouped()),
        },
      },
    };
  }, [request, decodedSlug]);
}