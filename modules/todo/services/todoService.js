import axios from 'axios'
import Config from '@/config/config'

axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

const unwrap = (res) => res?.data?.data ?? res?.data

const apiError = (err, fallback) => {
  const data = err?.response?.data
  const msg =
    data?.message ||
    data?.error ||
    (typeof data?.detail === 'string' ? data.detail : null) ||
    err?.message ||
    fallback
  const e = new Error(msg)
  e.response = err?.response
  e.data = data
  throw e
}

const todoService = {
  getBoard: async (params) => {
    const res = await axios.get(Config.endpoints.todo.board(params))
    return unwrap(res)
  },
  getTasks: async (params) => {
    const res = await axios.get(Config.endpoints.todo.tasks(params))
    return unwrap(res)
  },
  getStats: async () => {
    const res = await axios.get(Config.endpoints.todo.stats())
    return unwrap(res)
  },
  getAssignees: async () => {
    const res = await axios.get(Config.endpoints.todo.assignees())
    return unwrap(res)
  },
  getArchived: async () => {
    const res = await axios.get(Config.endpoints.todo.archived())
    return unwrap(res)
  },
  createTask: async (payload) => {
    const res = await axios.post(Config.endpoints.todo.tasks(), payload)
    return unwrap(res)
  },
  updateTask: async (id, payload) => {
    const res = await axios.patch(Config.endpoints.todo.task(id), payload)
    return unwrap(res)
  },
  deleteTask: async (id) => {
    const res = await axios.delete(Config.endpoints.todo.task(id))
    return res.data
  },
  moveTask: async (id, payload) => {
    const res = await axios.post(Config.endpoints.todo.move(id), payload)
    return unwrap(res)
  },
  assignTask: async (id, { assignee, note = '' }) => {
    try {
      const res = await axios.post(Config.endpoints.todo.assign(id), {
        assignee,
        note,
      })
      return unwrap(res)
    } catch (err) {
      apiError(err, 'ارجاع ناموفق بود')
    }
  },
  archiveTask: async (id) => {
    const res = await axios.post(Config.endpoints.todo.archive(id))
    return unwrap(res)
  },
  unarchiveTask: async (id) => {
    const res = await axios.post(Config.endpoints.todo.unarchive(id))
    return unwrap(res)
  },
  getComments: async (id) => {
    const res = await axios.get(Config.endpoints.todo.comments(id))
    return unwrap(res)
  },
  addComment: async (id, text) => {
    const res = await axios.post(Config.endpoints.todo.comments(id), { text })
    return unwrap(res)
  },
  getReports: async (id) => {
    const res = await axios.get(Config.endpoints.todo.reports(id))
    return unwrap(res)
  },
  addReport: async (id, { description, activity_status, files = [] }) => {
    const form = new FormData()
    if (description) form.append('description', description)
    if (activity_status) form.append('activity_status', activity_status)
    ;(files || []).forEach((file) => {
      if (file) form.append('attachments', file, file.name || 'file')
    })
    try {
      const res = await axios.post(Config.endpoints.todo.reports(id), form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      return unwrap(res)
    } catch (err) {
      apiError(err, 'ثبت گزارش ناموفق بود')
    }
  },
  reviewReport: async (taskId, reportId, { decision, review_note, files = [] }) => {
    const form = new FormData()
    form.append('decision', decision)
    if (review_note) form.append('review_note', review_note)
    ;(files || []).forEach((file) => {
      if (file) form.append('attachments', file, file.name || 'file')
    })
    try {
      const res = await axios.post(
        Config.endpoints.todo.reviewReport(taskId, reportId),
        form,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      )
      return unwrap(res)
    } catch (err) {
      apiError(err, 'ثبت بررسی ناموفق بود')
    }
  },
}

export default todoService
