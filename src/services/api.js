
import axios from "axios";

// ==================================================
// BACKEND URLS
// ==================================================

const MYMENTOR_API_URL = process.env.REACT_APP_BACKEND_URL;
const CAREERCOMPASS_API_URL =
  process.env.REACT_APP_CAREERCOMPASS_BACKEND_URL;

const MYMENTOR_API = `${MYMENTOR_API_URL}/api`;
const CAREERCOMPASS_API = `${CAREERCOMPASS_API_URL}/api`;
const API = MYMENTOR_API;

// ==================================================
// AXIOS CLIENTS
// ==================================================

// Render: MyMentor APIs
const client = axios.create({
  baseURL: MYMENTOR_API,
  withCredentials: true,
});

// VPS: CareerCompass APIs
export const careerCompassClient = axios.create({
  baseURL: CAREERCOMPASS_API,
  withCredentials: true,
});

// Render: College Admin APIs
const collegeAdminClient = axios.create({
  baseURL: MYMENTOR_API,
  withCredentials: true,
});

// ==================================================
// JWT INTERCEPTORS
// ==================================================

const addToken = (tokenKey) => (config) => {
  const token = localStorage.getItem(tokenKey);

  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
};

const handleRequestError = (error) => Promise.reject(error);

client.interceptors.request.use(
  addToken("dp_token"),
  handleRequestError
);

careerCompassClient.interceptors.request.use(
  addToken("dp_token"),
  handleRequestError
);

collegeAdminClient.interceptors.request.use(
  addToken("college_admin_token"),
  handleRequestError
);

// ==================================================
// RESPONSE INTERCEPTOR
// ==================================================

client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      console.error(
        "401 Unauthorized:",
        error?.response?.data
      );
    }

    return Promise.reject(error);
  }
);

// ==================================================
// GOOGLE LOGIN: VPS
// ==================================================


export const googleLogin = () => {
  const frontendUrl = window.location.origin;

  // Select the backend based on the current frontend URL
  const isLocalhost =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1";

  const backendUrl = isLocalhost
    ? MYMENTOR_API_URL
    : CAREERCOMPASS_API_URL;

  if (!backendUrl) {
    console.error("Google login backend URL is not configured");
    return;
  }

  window.location.href =
    `${backendUrl}/api/auth/google?frontend_url=${encodeURIComponent(
      frontendUrl
    )}`;
};


// ==================================================
// CURRENT USER
// ==================================================

export const getCurrentUser = async () => {
  const response = await client.get("/auth/me");
  return response.data;
};

// ==================================================
// API METHODS
// ==================================================

export const api = {
  base: API,

  // AUTHENTICATION

  register: (name, email, password) =>
    client
      .post("/auth/register", { name, email, password })
      .then((r) => r.data),

  login: (email, password) =>
    client
      .post("/auth/login", { email, password })
      .then((r) => r.data),

  adminLogin: (email, password) =>
    client
      .post("/auth/login", { email, password })
      .then((r) => r.data),

  me: () =>
    client.get("/auth/me").then((r) => r.data),

  joinCollege: (college_code) =>
    client
      .post("/students/college-code", { college_code })
      .then((r) => r.data),

  linkCollegeByStudentCode: (student_code) =>
    client
      .post("/students/student-code", { student_code })
      .then((r) => r.data),

  googleSession: (session_id) =>
    client
      .post("/auth/google/session", { session_id })
      .then((r) => r.data),

  // OTP AUTHENTICATION

  otpSend: (phone) =>
    client
      .post("/auth/otp/send", { phone })
      .then((r) => r.data),

  otpVerify: (phone, otp, verificationId) =>
    client
      .post("/auth/otp/verify", {
        phone,
        otp,
        verification_id: verificationId,
      })
      .then((r) => r.data),

  // COLLEGES

  collegesList: () =>
    client.get("/colleges").then((r) => r.data),

  getCollegeById: (collegeId) =>
    client
      .get(`/colleges/${collegeId}`)
      .then((r) => r.data),

  createCollege: (collegeData) =>
    client
      .post("/colleges", collegeData)
      .then((r) => r.data),

  updateCollege: (collegeId, payload) =>
    client
      .put(`/colleges/${collegeId}`, payload)
      .then((r) => r.data),

  // PROFILE

  onboarding: (name, dob) =>
    client
      .post("/me/onboarding", { name, dob })
      .then((r) => r.data),

  getProfile: () =>
    client.get("/profiles/me").then((r) => r.data),

  createProfile: (body) =>
    client.post("/profiles/me", body).then((r) => r.data),

  updateProfile: (body) =>
    client.put("/profiles/me", body).then((r) => r.data),

  getProfileById: (profileId) =>
    client
      .get(`/profiles/${profileId}`)
      .then((r) => r.data),

  profileScore: () =>
    client
      .get("/profiles/me/summary")
      .then((r) => r.data),

  scoreBreakdown: () =>
    client
      .get("/profiles/me/score-breakdown")
      .then((r) => r.data),

  journeyWithMyMentor: () =>
    client.get("/journey").then((r) => r.data),

  // CAREER

  careerGenerate: (payload) =>
    client
      .post("/career/generate", payload)
      .then((r) => r.data),

  // CAREER PERSONA

  careerPersonaMe: () =>
    client
      .get("/career-personas/me")
      .then((r) => r.data),

  careerPersonaById: (personaId) =>
    client
      .get(`/career-personas/${personaId}`)
      .then((r) => r.data),

  careerPersonaCreate: ({ goal, answers }) =>
    client
      .post("/career-personas", { goal, answers })
      .then((r) => r.data),

  careerCourseSuggestions: () =>
    client
      .get("/career-persona/course-suggestions")
      .then((r) => r.data),

  // CAREER PERSONA HISTORY

  careerPersonaHistory: () =>
    client
      .get("/career-persona-history/me")
      .then((r) => r.data),

  careerPersonaHistoryById: (historyId) =>
    client
      .get(`/career-persona-history/me/${historyId}`)
      .then((r) => r.data),

  careerPersonaHistoryLatest: () =>
    client
      .get("/career-persona-history/me/latest")
      .then((r) => r.data),

  // MENTORS

  mentorsList: (industry) =>
    client
      .get("/mentors", {
        params:
          industry && industry !== "All"
            ? { industry }
            : {},
      })
      .then((r) => r.data),

  mentorIndustries: () =>
    client.get("/mentors/industries").then((r) => r.data),

  mentorApply: (body) =>
    client.post("/mentors", body).then((r) => r.data),

  mentorGet: (id) =>
    client.get(`/mentors/${id}`).then((r) => r.data),

  mentorBook: (id, body) =>
    client
      .post(`/mentors/${id}/book`, body)
      .then((r) => r.data),

  myBookings: (mentorId) =>
    client
      .get("/me/bookings", {
        params: mentorId ? { mentorId } : {},
      })
      .then((r) => r.data),

  generateReport: (bookingId) =>
    client
      .post(`/bookings/${bookingId}/report/demo`)
      .then((r) => r.data),

  // ORGANISATIONS

  companiesList: () =>
    client.get("/companies").then((r) => r.data),

  companyJoin: (body) =>
    client
      .post("/companies/onboard", body)
      .then((r) => r.data),

  // JOBS

  jobsList: (params = {}) =>
    client.get("/public/jobs", { params }).then((r) => r.data),

  jobGet: (id) =>
    client.get(`/public/jobs/${id}`).then((r) => r.data),

  jobCreate: (body) =>
    client.post("/jobs", body).then((r) => r.data),

  jobApplicationsList: (params = {}) =>
    client
      .get("/job-applications", { params })
      .then((r) => r.data),

  jobApply: (body) =>
    client
      .post("/job-applications", body)
      .then((r) => r.data),

  // COURSES / SKILLHUB

  studentCourses: async () => {
    const response = await client.get("/students/courses");
    return response.data;
  },

  courses: () =>
    client.get("/courses").then((r) => r.data),

  enrolledCourses: () =>
    client
      .get("/courses/my-enrollments")
      .then((r) => r.data),

  enrollCourse: (courseId) =>
    client
      .post(`/courses/${courseId}/enroll`)
      .then((r) => r.data),

  journey: (courseId) =>
    client
      .get(`/courses/${courseId}/journey`)
      .then((r) => r.data),

  getLevelByCourseAndNumber: async (courseId, levelNumber) => {
    const response = await client.get(
      `/levels/course/${courseId}/number/${levelNumber}`
    );

    return response.data;
  },

  // LEVELS

  levels: (params = {}) =>
    client.get("/levels", { params }).then((r) => r.data),

  level: (levelId) =>
    client.get(`/levels/${levelId}`).then((r) => r.data),

  courseLevelsDropdown: (courseId) =>
    client
      .get(`/levels/course/${courseId}/dropdown`)
      .then((r) => r.data),

  courseLevels: (courseId) =>
    client
      .get(`/levels/course/${courseId}`)
      .then((r) => r.data),

  createLevel: (body) =>
    client.post("/levels", body).then((r) => r.data),

  updateLevel: (levelId, body) =>
    client
      .put(`/levels/${levelId}`, body)
      .then((r) => r.data),

  // PROFILE PHOTO

  uploadProfilePhoto: async (file) => {
    if (!file) {
      throw new Error("No profile photo selected.");
    }

    const fd = new FormData();
    fd.append("file", file);

    const response = await client.post(
      "/files/profile-photo",
      fd
    );

    console.log("PROFILE PHOTO POST RESPONSE:", response.data);
    return response.data;
  },

  updateProfilePhoto: async (file) => {
    if (!file) {
      throw new Error("No profile photo selected.");
    }

    const fd = new FormData();
    fd.append("file", file);

    const response = await client.put(
      "/files/profile-photo",
      fd
    );

    console.log("PROFILE PHOTO PUT RESPONSE:", response.data);
    return response.data;
  },

  // WORK EXPERIENCES

  getWorkExperiences: () =>
    client
      .get("/work-experiences/me")
      .then((r) => r.data),

  createWorkExperience: (body) =>
    client
      .post("/work-experiences/me", body)
      .then((r) => r.data),

  updateWorkExperience: (id, body) =>
    client
      .put(`/work-experiences/${id}`, body)
      .then((r) => r.data),

  // CHECKPOINTS
  // Uses VPS

  addCheckpoint: (body) =>
    careerCompassClient
      .post("/checkpoints", body)
      .then((r) => r.data),

  // CODE EXECUTION

  execute: (checkpointId, language, code, stdin) =>
    client
      .post("/code/run", {
        checkpoint_id: checkpointId,
        language,
        code,
        stdin,
      })
      .then((r) => r.data),

  submit: (checkpointId, language, code) =>
    client
      .post("/code/submit", {
        checkpoint_id: checkpointId,
        language,
        code,
      })
      .then((r) => r.data),

  // VIDEO COMPLETE

  videoComplete: (levelId) =>
    client
      .post(`/levels/${levelId}/video-complete`)
      .then((r) => r.data),

  // PROGRESS

  myProgress: () =>
    client.get("/me/progress").then((r) => r.data),

  getLevelProgress: (levelId) =>
    client
      .get(`/progress/level/${levelId}`)
      .then((r) => r.data),

  createProgress: async (body) => {
    if (!body?.level_id) {
      throw new Error("level_id is required to create progress");
    }

    const levelResponse = await client.get(
      `/levels/${body.level_id}`
    );

    const level = levelResponse.data;

    if (!level?.course_id) {
      throw new Error(
        `course_id not found for level ${body.level_id}`
      );
    }

    const progressPayload = {
      ...body,
      course_id: level.course_id,
    };

    console.log("CREATE PROGRESS PAYLOAD:", progressPayload);

    const response = await client.post(
      "/progress",
      progressPayload
    );

    return response.data;
  },

  updateProgress: (progressId, body) =>
    client
      .put(`/progress/${progressId}`, body)
      .then((r) => r.data),

  // STUDENT DASHBOARD

  studentSkillHubDashboard: () =>
    client
      .get("/dashboard/student/skillhub")
      .then((r) => r.data),

  getMyResumes: async () => {
    const response = await client.get("/files/me/resumes");
    console.log("MY RESUMES API RESPONSE:", response.data);
    return response.data;
  },

  // RESUME UPLOAD

  upload: async (file) => {
    if (!file) {
      throw new Error("No file selected.");
    }

    const formData = new FormData();
    formData.append("file", file);

    const response = await client.post(
      "/files/upload",
      formData
    );

    console.log("FILE UPLOAD API RESPONSE:", response.data);
    return response.data;
  },

  // ADMIN

  skillHubDashboard: () =>
    client
      .get("/dashboard/admin/skillhub")
      .then((r) => r.data),

  analytics: () =>
    client.get("/admin/analytics").then((r) => r.data),

  students: () =>
    client.get("/users/students").then((r) => r.data),

  introductionMcqSubmit: (body) =>
    client
      .post("/introduction-mcqs/submit", body)
      .then((r) => r.data),

  // COLLEGE ADMIN PORTAL

  collegeAdminLogin: (body) =>
    collegeAdminClient
      .post("/college-admin/login", body)
      .then((r) => r.data),

  collegeAdminDashboard: () =>
    collegeAdminClient
      .get("/college-admin/dashboard")
      .then((r) => r.data),

  collegeAdminStudents: () =>
    collegeAdminClient
      .get("/college-admin/students")
      .then((r) => r.data),

  collegeAdminCourses: () =>
    collegeAdminClient
      .get("/college-admin/courses")
      .then((r) => r.data),

  // ADMIN - STUDENT DASHBOARD

  adminStudentSkillHubDashboard: (studentId) =>
    client
      .get(`/dashboard/student/skillhub/${studentId}`)
      .then((r) => r.data),

  adminStudentCourses: (studentId) =>
    client
      .get(`/admin/students/${studentId}/courses`)
      .then((r) => r.data),

  // COLLEGE ADMIN - STUDENT DASHBOARD

  collegeAdminStudentSkillHubDashboard: (studentId) =>
    collegeAdminClient
      .get(`/dashboard/student/skillhub/${studentId}`)
      .then((r) => r.data),

  collegeAdminStudentCourses: (studentId) =>
    collegeAdminClient
      .get(`/admin/students/${studentId}/courses`)
      .then((r) => r.data),

  // STUDENT IMPORT

  importStudentsExcel: async (file, collegeId) => {
    if (!file) throw new Error("No Excel file selected.");
    if (!collegeId) throw new Error("College ID is required.");

    const formData = new FormData();
    formData.append("file", file);

    const response = await client.post(
      `/students/import?college_id=${encodeURIComponent(collegeId)}`,
      formData
    );

    console.log("STUDENT IMPORT RESPONSE:", response.data);
    return response.data;
  },

  generateStudentCodes: async (collegeId) => {
    if (!collegeId) {
      throw new Error("College ID is required.");
    }

    const response = await client.post(
      `/students/import/${collegeId}/generate-codes`
    );

    console.log("GENERATE STUDENT CODES RESPONSE:", response.data);
    return response.data;
  },

  exportStudentsExcel: async (collegeId) => {
    if (!collegeId) {
      throw new Error("College ID is required.");
    }

    const response = await client.get(
      `/students/import/${collegeId}/export`,
      { responseType: "blob" }
    );

    return response.data;
  },

  // COURSES - ADMIN

  createCourse: (body) =>
    client.post("/courses", body).then((r) => r.data),

  // COLLEGE PACKAGES

  createCollegePackage: (data) =>
    client
      .post("/college-packages", data)
      .then((r) => r.data),

  getCollegePackages: () =>
    client
      .get("/college-packages")
      .then((r) => r.data),

  getCollegePackage: (packageId) =>
    client
      .get(`/college-packages/${packageId}`)
      .then((r) => r.data),

  updateCollegePackage: (packageId, data) =>
    client
      .put(`/college-packages/${packageId}`, data)
      .then((r) => r.data),

  deleteCollegePackage: (packageId) =>
    client
      .delete(`/college-packages/${packageId}`)
      .then((r) => r.data),
};

// ==================================================
// DEFAULT AXIOS CLIENT
// ==================================================

export default client;
