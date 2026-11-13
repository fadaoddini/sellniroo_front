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
  payGateway: (token, stage, extra = {}) =>
    wrap(() =>
      axios.post(Config.endpoints.repairs.pay(token), {
        stage,
        method: 'gateway',
        ...extra,
      })
    ),
  payCard: (token, stage, formData) =>
    wrap(() =>
      axios.post(Config.endpoints.repairs.pay(token), formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
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
  approveComplete: (id) =>
    wrap(() =>
      axios.patch(
        Config.endpoints.repairs.manageJob(id),
        { action: 'approve_complete' },
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
  accounting: () =>
    wrap(() =>
      axios.get(Config.endpoints.repairs.accounting(), {
        headers: authHeaders(),
      })
    ),
}

export default repairsService
