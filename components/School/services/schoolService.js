import axios from 'axios'
import Config from '@/config/config'

const authHeaders = (multipart = false) => {
  if (typeof window === 'undefined') return {}
  const token = localStorage.getItem('accessToken')
  // Do NOT set Content-Type for FormData — axios must add the boundary.
  return token ? { Authorization: `Bearer ${token}` } : {}
}

const wrap = async (fn) => {
  try {
    const res = await fn()
    return { success: true, data: res.data?.data ?? res.data, message: res.data?.message }
  } catch (e) {
    return {
      success: false,
      error: e.response?.data?.message || e.message || 'خطا',
      errors: e.response?.data?.errors,
    }
  }
}

const schoolService = {
  me: () => wrap(() => axios.get(Config.endpoints.school.me(), { headers: authHeaders() })),
  settings: () => wrap(() => axios.get(Config.endpoints.school.settings(), { headers: authHeaders() })),
  updateSettings: (payload) => wrap(() => axios.patch(Config.endpoints.school.settings(), payload, { headers: authHeaders() })),
  overview: () => wrap(() => axios.get(Config.endpoints.school.overview(), { headers: authHeaders() })),
  tree: (params) => wrap(() => axios.get(Config.endpoints.school.tree(params), { headers: authHeaders() })),

  upload: (file) => {
    const fd = new FormData()
    fd.append('file', file)
    return wrap(() => axios.post(Config.endpoints.school.upload(), fd, { headers: authHeaders(true) }))
  },

  listTeachers: (params) => wrap(() => axios.get(Config.endpoints.school.teachers(params), { headers: authHeaders() })),
  createTeacher: (payload) => wrap(() => axios.post(Config.endpoints.school.teachers(), payload, { headers: authHeaders() })),
  getTeacher: (id) => wrap(() => axios.get(Config.endpoints.school.teacher(id), { headers: authHeaders() })),
  updateTeacher: (id, payload) => {
    const isFd = typeof FormData !== 'undefined' && payload instanceof FormData
    return wrap(() => axios.patch(
      Config.endpoints.school.teacher(id),
      payload,
      { headers: authHeaders(isFd) },
    ))
  },
  deleteTeacher: (id) => wrap(() => axios.delete(Config.endpoints.school.teacher(id), { headers: authHeaders() })),
  getMyTeacherProfile: (params = {}) => wrap(() => axios.get(
    Config.endpoints.school.teacherMe(params),
    { headers: authHeaders() },
  )),
  updateMyTeacherProfile: (payload, params = {}) => {
    const isFd = typeof FormData !== 'undefined' && payload instanceof FormData
    return wrap(() => axios.patch(
      Config.endpoints.school.teacherMe(params),
      payload,
      { headers: authHeaders(isFd) },
    ))
  },
  getPublicTeacherProfile: (slug) => wrap(() => axios.get(Config.endpoints.school.teacherPublic(slug))),

  listStudents: (params) => wrap(() => axios.get(Config.endpoints.school.students(params), { headers: authHeaders() })),
  lookupStudents: (params) => wrap(() => axios.get(Config.endpoints.school.studentsLookup(params), { headers: authHeaders() })),
  createStudent: (payload) => wrap(() => axios.post(Config.endpoints.school.students(), payload, { headers: authHeaders() })),
  updateStudent: (id, payload) => wrap(() => axios.patch(Config.endpoints.school.student(id), payload, { headers: authHeaders() })),
  getStudent: (id) => wrap(() => axios.get(Config.endpoints.school.student(id), { headers: authHeaders() })),
  studentSnapshot: (id, params = {}) => wrap(() => axios.get(Config.endpoints.school.studentSnapshot(id, params), { headers: authHeaders() })),

  listSubjects: (params) => wrap(() => axios.get(Config.endpoints.school.subjects(params), { headers: authHeaders() })),
  createSubject: (payload) => wrap(() => axios.post(Config.endpoints.school.subjects(), payload, { headers: authHeaders() })),
  updateSubject: (id, payload) => wrap(() => axios.patch(Config.endpoints.school.subject(id), payload, { headers: authHeaders() })),
  deleteSubject: (id) => wrap(() => axios.delete(Config.endpoints.school.subject(id), { headers: authHeaders() })),

  listChapters: (params) => wrap(() => axios.get(Config.endpoints.school.chapters(params), { headers: authHeaders() })),
  createChapter: (payload) => wrap(() => axios.post(Config.endpoints.school.chapters(), payload, { headers: authHeaders() })),
  updateChapter: (id, payload) => wrap(() => axios.patch(Config.endpoints.school.chapter(id), payload, { headers: authHeaders() })),
  deleteChapter: (id) => wrap(() => axios.delete(Config.endpoints.school.chapter(id), { headers: authHeaders() })),

  listLessons: (params) => wrap(() => axios.get(Config.endpoints.school.lessons(params), { headers: authHeaders() })),
  getLesson: (id) => wrap(() => axios.get(Config.endpoints.school.lesson(id), { headers: authHeaders() })),
  createLesson: (formData) => wrap(() => axios.post(Config.endpoints.school.lessons(), formData, { headers: authHeaders(true) })),
  updateLesson: (id, formData) => wrap(() => axios.patch(Config.endpoints.school.lesson(id), formData, { headers: authHeaders(true) })),
  deleteLesson: (id) => wrap(() => axios.delete(Config.endpoints.school.lesson(id), { headers: authHeaders() })),

  addAttachment: (formData) => wrap(() => axios.post(Config.endpoints.school.attachments(), formData, { headers: authHeaders(true) })),
  deleteAttachment: (id) => wrap(() => axios.delete(Config.endpoints.school.attachment(id), { headers: authHeaders() })),

  listExercises: (params) => wrap(() => axios.get(Config.endpoints.school.exercises(params), { headers: authHeaders() })),
  createExercise: (payload) => wrap(() => axios.post(Config.endpoints.school.exercises(), payload, { headers: authHeaders() })),
  updateExercise: (id, payload) => wrap(() => axios.patch(Config.endpoints.school.exercise(id), payload, { headers: authHeaders() })),
  deleteExercise: (id) => wrap(() => axios.delete(Config.endpoints.school.exercise(id), { headers: authHeaders() })),
  submitExercise: (id, payload) => {
    const isFd = typeof FormData !== 'undefined' && payload instanceof FormData
    return wrap(() => axios.post(
      Config.endpoints.school.exerciseSubmit(id),
      payload,
      { headers: authHeaders(isFd) },
    ))
  },
  listSubmissions: (params) => wrap(() => axios.get(Config.endpoints.school.submissions(params), { headers: authHeaders() })),
  reviewSubmission: (id, payload) => wrap(() => axios.post(Config.endpoints.school.submissionReview(id), payload, { headers: authHeaders() })),
  archiveSubmission: (id, payload = { archived: true }) => wrap(() => axios.post(Config.endpoints.school.submissionArchive(id), payload, { headers: authHeaders() })),

  listQuizzes: (params) => wrap(() => axios.get(Config.endpoints.school.quizzes(params), { headers: authHeaders() })),
  createQuiz: (payload) => wrap(() => axios.post(Config.endpoints.school.quizzes(), payload, { headers: authHeaders() })),
  updateQuiz: (id, payload) => wrap(() => axios.patch(Config.endpoints.school.quiz(id), payload, { headers: authHeaders() })),
  deleteQuiz: (id) => wrap(() => axios.delete(Config.endpoints.school.quiz(id), { headers: authHeaders() })),
  createQuizQuestion: (formData) => wrap(() => axios.post(Config.endpoints.school.quizQuestions(), formData, { headers: authHeaders(true) })),
  updateQuizQuestion: (id, formData) => wrap(() => axios.patch(Config.endpoints.school.quizQuestion(id), formData, { headers: authHeaders(true) })),
  deleteQuizQuestion: (id) => wrap(() => axios.delete(Config.endpoints.school.quizQuestion(id), { headers: authHeaders() })),
  startQuiz: (quizId, extra = {}) => wrap(() => axios.post(
    Config.endpoints.school.quizStart(),
    { quiz_id: quizId, ...extra },
    { headers: authHeaders() },
  )),
  submitQuiz: (payload) => wrap(() => axios.post(Config.endpoints.school.quizSubmit(), payload, { headers: authHeaders() })),
  listAttempts: (params) => wrap(() => axios.get(Config.endpoints.school.quizAttempts(params), { headers: authHeaders() })),

  listBankQuestions: (params) => wrap(() => axios.get(Config.endpoints.school.bankQuestions(params), { headers: authHeaders() })),
  createBankQuestion: (payload) => {
    const isFd = typeof FormData !== 'undefined' && payload instanceof FormData
    return wrap(() => axios.post(
      Config.endpoints.school.bankQuestions(),
      payload,
      { headers: authHeaders(isFd) },
    ))
  },
  updateBankQuestion: (id, payload) => {
    const isFd = typeof FormData !== 'undefined' && payload instanceof FormData
    return wrap(() => axios.patch(
      Config.endpoints.school.bankQuestion(id),
      payload,
      { headers: authHeaders(isFd) },
    ))
  },
  deleteBankQuestion: (id) => wrap(() => axios.delete(Config.endpoints.school.bankQuestion(id), { headers: authHeaders() })),
  bankAvailability: (params) => wrap(() => axios.get(Config.endpoints.school.bankAvailability(params), { headers: authHeaders() })),

  listExams: (params) => wrap(() => axios.get(Config.endpoints.school.exams(params), { headers: authHeaders() })),
  createExam: (payload) => wrap(() => axios.post(Config.endpoints.school.exams(), payload, { headers: authHeaders() })),
  getExam: (id) => wrap(() => axios.get(Config.endpoints.school.exam(id), { headers: authHeaders() })),
  deleteExam: (id) => wrap(() => axios.delete(Config.endpoints.school.exam(id), { headers: authHeaders() })),
  startExamPaper: (paperId, extra = {}) => wrap(() => axios.post(
    Config.endpoints.school.examStart(),
    { paper_id: paperId, ...extra },
    { headers: authHeaders() },
  )),
  submitExamPaper: (payload) => wrap(() => axios.post(Config.endpoints.school.examSubmit(), payload, { headers: authHeaders() })),
  listExamPapers: (params) => wrap(() => axios.get(Config.endpoints.school.examPapers(params), { headers: authHeaders() })),
  getExamPaper: (id, params = {}) => wrap(() => axios.get(
    Config.endpoints.school.examPaper(id),
    { headers: authHeaders(), params },
  )),
  updateExamPaperFeedback: (id, teacher_feedback, extra = {}) => wrap(() => axios.patch(
    Config.endpoints.school.examPaper(id),
    { teacher_feedback, ...extra },
    { headers: authHeaders() },
  )),
  archiveExamPaper: (id, payload = { archived: true }) => wrap(() => axios.post(
    Config.endpoints.school.examPaperArchive(id),
    payload,
    { headers: authHeaders() },
  )),

  teacherDashboard: (params = {}) => wrap(() => axios.get(Config.endpoints.school.teacherDashboard(params), { headers: authHeaders() })),
  studentDashboard: (params = {}) => wrap(() => axios.get(Config.endpoints.school.studentDashboard(params), { headers: authHeaders() })),

  attendanceToday: (params = {}) => wrap(() => axios.get(Config.endpoints.school.attendanceToday(params), { headers: authHeaders() })),
  attendanceSessions: (params = {}) => wrap(() => axios.get(Config.endpoints.school.attendanceSessions(params), { headers: authHeaders() })),
  createAttendanceSession: (payload, params = {}) => wrap(() => axios.post(
    Config.endpoints.school.attendanceSessions(params),
    payload,
    { headers: authHeaders() },
  )),
  getAttendanceSession: (id, params = {}) => wrap(() => axios.get(
    Config.endpoints.school.attendanceSession(id),
    { headers: authHeaders(), params },
  )),
  updateAttendanceSession: (id, payload, params = {}) => wrap(() => axios.patch(
    Config.endpoints.school.attendanceSession(id),
    payload,
    { headers: authHeaders(), params },
  )),
  deleteAttendanceSession: (id, params = {}) => wrap(() => axios.delete(
    Config.endpoints.school.attendanceSession(id),
    { headers: authHeaders(), params },
  )),
  markAttendance: (id, payload, params = {}) => wrap(() => axios.post(
    Config.endpoints.school.attendanceMark(id),
    payload,
    { headers: authHeaders(), params },
  )),
  attendanceStats: (params = {}) => wrap(() => axios.get(Config.endpoints.school.attendanceStats(params), { headers: authHeaders() })),
  attendanceStudent: (params = {}) => wrap(() => axios.get(Config.endpoints.school.attendanceStudent(params), { headers: authHeaders() })),
  attendanceOverview: (params = {}) => wrap(() => axios.get(Config.endpoints.school.attendanceOverview(params), { headers: authHeaders() })),

  classes: (params = {}) => wrap(() => axios.get(Config.endpoints.school.classes(params), { headers: authHeaders() })),
  createClass: (payload) => wrap(() => axios.post(Config.endpoints.school.classes(), payload, { headers: authHeaders() })),
  getClass: (id) => wrap(() => axios.get(Config.endpoints.school.schoolClass(id), { headers: authHeaders() })),
  updateClass: (id, payload) => wrap(() => axios.patch(Config.endpoints.school.schoolClass(id), payload, { headers: authHeaders() })),
  deleteClass: (id) => wrap(() => axios.delete(Config.endpoints.school.schoolClass(id), { headers: authHeaders() })),
  setClassStudents: (id, student_ids) => wrap(() => axios.post(
    Config.endpoints.school.classStudents(id),
    { student_ids },
    { headers: authHeaders() },
  )),
  classTimetable: (id) => wrap(() => axios.get(Config.endpoints.school.classTimetable(id), { headers: authHeaders() })),
  saveClassTimetable: (id, slots) => wrap(() => axios.put(
    Config.endpoints.school.classTimetable(id),
    { slots },
    { headers: authHeaders() },
  )),
  periods: () => wrap(() => axios.get(Config.endpoints.school.periods(), { headers: authHeaders() })),
  createPeriod: (payload) => wrap(() => axios.post(Config.endpoints.school.periods(), payload, { headers: authHeaders() })),
  updatePeriod: (id, payload) => wrap(() => axios.patch(Config.endpoints.school.period(id), payload, { headers: authHeaders() })),
  deletePeriod: (id) => wrap(() => axios.delete(Config.endpoints.school.period(id), { headers: authHeaders() })),
  savePeriods: (periods) => wrap(() => axios.put(
    Config.endpoints.school.periods(),
    { periods },
    { headers: authHeaders() },
  )),
  myTimetable: (params = {}) => wrap(() => axios.get(Config.endpoints.school.myTimetable(params), { headers: authHeaders() })),

  listCounselors: (params) => wrap(() => axios.get(Config.endpoints.school.counselors(params), { headers: authHeaders() })),
  createCounselor: (payload) => wrap(() => axios.post(Config.endpoints.school.counselors(), payload, { headers: authHeaders() })),
  getCounselor: (id) => wrap(() => axios.get(Config.endpoints.school.counselor(id), { headers: authHeaders() })),
  updateCounselor: (id, payload) => {
    const isFd = typeof FormData !== 'undefined' && payload instanceof FormData
    return wrap(() => axios.patch(Config.endpoints.school.counselor(id), payload, { headers: authHeaders(isFd) }))
  },
  getMyCounselorProfile: (params = {}) => wrap(() => axios.get(Config.endpoints.school.counselorMe(params), { headers: authHeaders() })),
  updateMyCounselorProfile: (payload, params = {}) => {
    const isFd = typeof FormData !== 'undefined' && payload instanceof FormData
    return wrap(() => axios.patch(Config.endpoints.school.counselorMe(params), payload, { headers: authHeaders(isFd) }))
  },
  getPublicCounselorProfile: (slug) => wrap(() => axios.get(Config.endpoints.school.counselorPublic(slug))),
  counselorDashboard: (params = {}) => wrap(() => axios.get(Config.endpoints.school.counselorDashboard(params), { headers: authHeaders() })),
  listCounselingTests: (params) => wrap(() => axios.get(Config.endpoints.school.counselingTests(params), { headers: authHeaders() })),
  getCounselingTest: (id) => wrap(() => axios.get(Config.endpoints.school.counselingTest(id), { headers: authHeaders() })),
  createCounselingTest: (payload) => wrap(() => axios.post(Config.endpoints.school.counselingTests(), payload, { headers: authHeaders() })),
  updateCounselingTest: (id, payload) => wrap(() => axios.patch(Config.endpoints.school.counselingTest(id), payload, { headers: authHeaders() })),
  deleteCounselingTest: (id) => wrap(() => axios.delete(Config.endpoints.school.counselingTest(id), { headers: authHeaders() })),
  startCounselingTest: (payload) => wrap(() => axios.post(Config.endpoints.school.counselingTestStart(), payload, { headers: authHeaders() })),
  submitCounselingTest: (payload) => wrap(() => axios.post(Config.endpoints.school.counselingTestSubmit(), payload, { headers: authHeaders() })),
  listCounselingAttempts: (params) => wrap(() => axios.get(Config.endpoints.school.counselingAttempts(params), { headers: authHeaders() })),
  counselingAvailableTests: () => wrap(() => axios.get(Config.endpoints.school.counselingAvailableTests(), { headers: authHeaders() })),
  listCounselingFiles: (params) => wrap(() => axios.get(Config.endpoints.school.counselingFiles(params), { headers: authHeaders() })),
  createCounselingFile: (payload) => wrap(() => axios.post(Config.endpoints.school.counselingFiles(), payload, { headers: authHeaders() })),
  getCounselingFile: (id) => wrap(() => axios.get(Config.endpoints.school.counselingFile(id), { headers: authHeaders() })),
  updateCounselingFile: (id, payload) => wrap(() => axios.patch(Config.endpoints.school.counselingFile(id), payload, { headers: authHeaders() })),
  getCounselingFileByStudent: (studentId) => wrap(() => axios.get(Config.endpoints.school.counselingFileByStudent(studentId), { headers: authHeaders() })),
  createCounselingNote: (payload) => wrap(() => axios.post(Config.endpoints.school.counselingNotes(), payload, { headers: authHeaders() })),
  listTeacherCounselingFiles: (params) => wrap(() => axios.get(Config.endpoints.school.counselingTeacherFiles(params), { headers: authHeaders() })),
  createTeacherCounselingFile: (payload) => wrap(() => axios.post(Config.endpoints.school.counselingTeacherFiles(), payload, { headers: authHeaders() })),
  getTeacherCounselingFile: (id) => wrap(() => axios.get(Config.endpoints.school.counselingTeacherFile(id), { headers: authHeaders() })),
  updateTeacherCounselingFile: (id, payload) => wrap(() => axios.patch(Config.endpoints.school.counselingTeacherFile(id), payload, { headers: authHeaders() })),
  getCounselingFileByTeacher: (teacherId) => wrap(() => axios.get(Config.endpoints.school.counselingFileByTeacher(teacherId), { headers: authHeaders() })),
  createTeacherCounselingNote: (payload) => wrap(() => axios.post(Config.endpoints.school.counselingTeacherNotes(), payload, { headers: authHeaders() })),

  reportCardSheet: (params = {}) => wrap(() => axios.get(Config.endpoints.school.reportCardSheet(params), { headers: authHeaders() })),
  reportCardBulk: (payload, params = {}) => wrap(() => axios.post(Config.endpoints.school.reportCardBulk(), payload, {
    headers: authHeaders(),
    params,
  })),
  reportCardMine: (params = {}) => wrap(() => axios.get(Config.endpoints.school.reportCardMine(params), { headers: authHeaders() })),
}

export default schoolService
