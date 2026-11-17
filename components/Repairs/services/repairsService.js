import axios from 'axios'
import Config from '@/config/config'

const authHeaders = () => {
  if (typeof window === 'undefined') return {}
  const token = localStorage.getItem('accessToken')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

const wrap = async (fn) => {
  try {
    const res = await fn()
    return { success: true, data: res.data?.data, message: res.data?.message }
  } catch (e) {
    return {
      success: false,
      error: e.response?.data?.message || 'خطا',
      code: e.response?.data?.code,
      errors: e.response?.data?.errors,
      httpStatus: e.response?.status,
    }
  }
}

const repairsService = {
  config: () => wrap(() => axios.get(Config.endpoints.repairs.config())),
  request: (payload) =>
    wrap(() =>
      axios.post(Config.endpoints.repairs.request(), payload, {
        headers: authHeaders(),
      })
    ),
  my: () =>
    wrap(() =>
      axios.get(Config.endpoints.repairs.my(), {
        headers: authHeaders(),
      })
    ),
  techMe: () =>
    wrap(() =>
      axios.get(Config.endpoints.repairs.techMe(), {
        headers: authHeaders(),
      })
    ),
  techJobs: (params = {}) =>
    wrap(() =>
      axios.get(Config.endpoints.repairs.techJobs(params), {
        headers: authHeaders(),
      })
    ),
  techJob: (id) =>
    wrap(() =>
      axios.get(Config.endpoints.repairs.techJob(id), {
        headers: authHeaders(),
      })
    ),
  techSubmitReport: (id, payload) =>
    wrap(() =>
      axios.post(Config.endpoints.repairs.techJob(id), payload, {
        headers: authHeaders(),
      })
    ),
  techArrive: (id) =>
    wrap(() =>
      axios.post(
        Config.endpoints.repairs.techJob(id),
        { action: 'arrive' },
        { headers: authHeaders() },
      )
    ),
  techStartWork: (id) =>
    wrap(() =>
      axios.post(
        Config.endpoints.repairs.techJob(id),
        { action: 'start_work' },
        { headers: authHeaders() },
      )
    ),
  techSyncTimer: (id) =>
    wrap(() =>
      axios.post(
        Config.endpoints.repairs.techJob(id),
        { action: 'sync_timer' },
        { headers: authHeaders() },
      )
    ),
  techFinishWork: (id) =>
    wrap(() =>
      axios.post(
        Config.endpoints.repairs.techJob(id),
        { action: 'finish_work' },
        { headers: authHeaders() },
      )
    ),
  techSearchShopProducts: (q = '') =>
    wrap(() =>
      axios.get(Config.endpoints.repairs.techShopProducts({ q }), {
        headers: authHeaders(),
      })
    ),
  techCreateProposal: (jobId, payload) =>
    wrap(() =>
      axios.post(Config.endpoints.repairs.techJobProposals(jobId), payload, {
        headers: authHeaders(),
      })
    ),
  lookup: (params) =>
    wrap(() => axios.get(Config.endpoints.repairs.lookup(params))),
  track: (token) =>
    wrap(() => axios.get(Config.endpoints.repairs.track(token))),
  trackRate: (token, payload) =>
    wrap(() =>
      axios.post(Config.endpoints.repairs.trackRate(token), payload),
    ),
  rateTechnician: (id, payload) =>
    wrap(() =>
      axios.patch(
        Config.endpoints.repairs.manageJob(id),
        { action: 'rate_technician', ...payload },
        { headers: authHeaders() },
      ),
    ),
  payGateway: (token, stage, extra = {}) =>
    wrap(() =>
      axios.post(
        Config.endpoints.repairs.pay(token),
        {
          stage,
          method: 'gateway',
          ...extra,
        },
        { headers: authHeaders() },
      )
    ),
  payWallet: (token, stage, extra = {}) =>
    wrap(() =>
      axios.post(
        Config.endpoints.repairs.pay(token),
        {
          stage,
          method: 'wallet',
          ...extra,
        },
        { headers: authHeaders() },
      )
    ),
  walletBalance: async () => {
    try {
      const res = await axios.get(Config.endpoints.order.wallet(), {
        headers: authHeaders(),
      })
      // این endpoint مستقیم { balance, ... } برمی‌گرداند (بدون data)
      const body = res.data?.data ?? res.data
      return { success: true, data: body }
    } catch (e) {
      return {
        success: false,
        error: e.response?.data?.message || 'خطا',
        code: e.response?.data?.code,
        httpStatus: e.response?.status,
      }
    }
  },
  payCard: (token, stage, formData) =>
    wrap(() =>
      axios.post(Config.endpoints.repairs.pay(token), formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          ...authHeaders(),
        },
      })
    ),
  proposalAction: (token, id, payload) =>
    wrap(() => axios.post(Config.endpoints.repairs.proposalAction(token, id), payload)),

  bundle: () =>
    wrap(() =>
      axios.get(Config.endpoints.repairs.manageBundle(), {
        headers: authHeaders(),
      })
    ),
  settings: () =>
    wrap(() =>
      axios.get(Config.endpoints.repairs.manageSettings(), {
        headers: authHeaders(),
      })
    ),
  updateSettings: (payload) =>
    wrap(() =>
      axios.patch(Config.endpoints.repairs.manageSettings(), payload, {
        headers: authHeaders(),
      })
    ),

  technicians: () =>
    wrap(() =>
      axios.get(Config.endpoints.repairs.manageTechnicians(), {
        headers: authHeaders(),
      })
    ),
  createTechnician: (payload) =>
    wrap(() =>
      axios.post(Config.endpoints.repairs.manageTechnicians(), payload, {
        headers: authHeaders(),
      })
    ),
  updateTechnician: (id, payload) =>
    wrap(() =>
      axios.patch(Config.endpoints.repairs.manageTechnician(id), payload, {
        headers: authHeaders(),
      })
    ),
  linkTechnicianByMobile: (id) =>
    wrap(() =>
      axios.patch(
        Config.endpoints.repairs.manageTechnician(id),
        { action: 'link_by_mobile' },
        { headers: authHeaders() },
      )
    ),
  unlinkTechnicianUser: (id) =>
    wrap(() =>
      axios.patch(
        Config.endpoints.repairs.manageTechnician(id),
        { action: 'unlink_user' },
        { headers: authHeaders() },
      )
    ),
  linkTechnicianUser: (id, userId) =>
    wrap(() =>
      axios.patch(
        Config.endpoints.repairs.manageTechnician(id),
        { user_id: userId },
        { headers: authHeaders() },
      )
    ),
  searchUsers: (q = '') =>
    wrap(() =>
      axios.get(Config.endpoints.repairs.manageUsers({ q }), {
        headers: authHeaders(),
      })
    ),
  deleteTechnician: (id) =>
    wrap(() =>
      axios.delete(Config.endpoints.repairs.manageTechnician(id), {
        headers: authHeaders(),
      })
    ),

  laborRates: () =>
    wrap(() =>
      axios.get(Config.endpoints.repairs.manageLaborRates(), {
        headers: authHeaders(),
      })
    ),
  createLaborRate: (payload) =>
    wrap(() =>
      axios.post(Config.endpoints.repairs.manageLaborRates(), payload, {
        headers: authHeaders(),
      })
    ),
  updateLaborRate: (id, payload) =>
    wrap(() =>
      axios.patch(Config.endpoints.repairs.manageLaborRate(id), payload, {
        headers: authHeaders(),
      })
    ),
  deleteLaborRate: (id) =>
    wrap(() =>
      axios.delete(Config.endpoints.repairs.manageLaborRate(id), {
        headers: authHeaders(),
      })
    ),

  parts: () =>
    wrap(() =>
      axios.get(Config.endpoints.repairs.manageParts(), {
        headers: authHeaders(),
      })
    ),
  createPart: (payload) =>
    wrap(() =>
      axios.post(Config.endpoints.repairs.manageParts(), payload, {
        headers: authHeaders(),
      })
    ),
  updatePart: (id, payload) =>
    wrap(() =>
      axios.patch(Config.endpoints.repairs.managePart(id), payload, {
        headers: authHeaders(),
      })
    ),
  deletePart: (id) =>
    wrap(() =>
      axios.delete(Config.endpoints.repairs.managePart(id), {
        headers: authHeaders(),
      })
    ),

  jobs: (params = {}) =>
    wrap(() =>
      axios.get(Config.endpoints.repairs.manageJobs(params), {
        headers: authHeaders(),
      })
    ),
  job: (id) =>
    wrap(() =>
      axios.get(Config.endpoints.repairs.manageJob(id), {
        headers: authHeaders(),
      })
    ),
  updateJob: (id, payload) =>
    wrap(() =>
      axios.patch(Config.endpoints.repairs.manageJob(id), payload, {
        headers: authHeaders(),
      })
    ),
  adjustPayable: (id, payableAmount, note = '') =>
    wrap(() =>
      axios.patch(
        Config.endpoints.repairs.manageJob(id),
        {
          action: 'adjust_payable',
          payable_amount: payableAmount,
          note: note || undefined,
        },
        { headers: authHeaders() },
      )
    ),
  approveComplete: (id, extra = {}) =>
    wrap(() =>
      axios.patch(
        Config.endpoints.repairs.manageJob(id),
        { action: 'approve_complete', ...extra },
        { headers: authHeaders() },
      )
    ),
  archiveJob: (id, extra = {}) =>
    wrap(() =>
      axios.patch(
        Config.endpoints.repairs.manageJob(id),
        { action: 'archive', ...extra },
        { headers: authHeaders() },
      )
    ),
  unarchiveJob: (id) =>
    wrap(() =>
      axios.patch(
        Config.endpoints.repairs.manageJob(id),
        { action: 'unarchive' },
        { headers: authHeaders() },
      )
    ),
  setWarranty: (id, warrantyUntil, clear = false) =>
    wrap(() =>
      axios.patch(
        Config.endpoints.repairs.manageJob(id),
        {
          action: 'set_warranty',
          warranty_until: warrantyUntil || undefined,
          clear_warranty: clear || undefined,
        },
        { headers: authHeaders() },
      )
    ),
  setServiceReminder: (id, payload = {}) =>
    wrap(() =>
      axios.patch(
        Config.endpoints.repairs.manageJob(id),
        { action: 'set_service_reminder', ...payload },
        { headers: authHeaders() },
      )
    ),
  archivedJobs: (params = {}) =>
    wrap(() =>
      axios.get(
        Config.endpoints.repairs.manageJobs({ archived: '1', ...params }),
        { headers: authHeaders() },
      )
    ),
  submitReport: (id, payload) =>
    wrap(() =>
      axios.post(Config.endpoints.repairs.manageJobReport(id), payload, {
        headers: authHeaders(),
      })
    ),
  createProposal: (jobId, payload) =>
    wrap(() =>
      axios.post(Config.endpoints.repairs.manageJobProposals(jobId), payload, {
        headers: authHeaders(),
      })
    ),
  updateProposal: (id, payload) =>
    wrap(() =>
      axios.patch(Config.endpoints.repairs.manageProposal(id), payload, {
        headers: authHeaders(),
      })
    ),
  searchShopProducts: (q = '') =>
    wrap(() =>
      axios.get(Config.endpoints.repairs.manageShopProducts({ q }), {
        headers: authHeaders(),
      })
    ),
  payments: (params = {}) =>
    wrap(() =>
      axios.get(Config.endpoints.repairs.managePayments(params), {
        headers: authHeaders(),
      })
    ),
  confirmPayment: (id, payload = {}) =>
    wrap(() =>
      axios.post(Config.endpoints.repairs.confirmPayment(id), payload, {
        headers: authHeaders(),
      })
    ),
  proposals: (params = {}) =>
    wrap(() =>
      axios.get(Config.endpoints.repairs.manageProposals(params), {
        headers: authHeaders(),
      })
    ),
  reminders: (params = {}) =>
    wrap(() =>
      axios.get(Config.endpoints.repairs.reminders(params), {
        headers: authHeaders(),
      })
    ),
  respondServiceReminder: (deviceId, payload = {}) =>
    wrap(() =>
      axios.post(
        Config.endpoints.repairs.myReminderRespond(deviceId),
        payload,
        { headers: authHeaders() },
      )
    ),
  accounting: (params = {}) =>
    wrap(() =>
      axios.get(Config.endpoints.repairs.accounting(params), {
        headers: authHeaders(),
      })
    ),
  expenses: (params = {}) =>
    wrap(() =>
      axios.get(Config.endpoints.repairs.manageExpenses(params), {
        headers: authHeaders(),
      })
    ),
  createExpense: (formData) =>
    wrap(() =>
      axios.post(Config.endpoints.repairs.manageExpenses(), formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          ...authHeaders(),
        },
      })
    ),
  updateExpense: (id, formData) =>
    wrap(() =>
      axios.patch(Config.endpoints.repairs.manageExpense(id), formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          ...authHeaders(),
        },
      })
    ),
  deleteExpense: (id) =>
    wrap(() =>
      axios.delete(Config.endpoints.repairs.manageExpense(id), {
        headers: authHeaders(),
      })
    ),
}

export default repairsService
