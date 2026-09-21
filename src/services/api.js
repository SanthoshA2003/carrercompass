import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL;

if (!API_BASE_URL) {
  console.error("REACT_APP_BACKEND_URL is not configured");
}

const API = `${API_BASE_URL}/api`;

// Used by the Google OAuth redirect. Keep this on the same frontend origin.
const frontendUrl = window.location.origin;

// ==================================================
// AXIOS CLIENT
// ==================================================

const client = axios.create({
  baseURL: API,
  withCredentials: true,
});

// ==================================================
// JWT TOKEN INTERCEPTOR
// ==================================================

client.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("dp_token");

    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
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
// GOOGLE LOGIN
// ==================================================

export const googleLogin = () => {
  if (!API_BASE_URL) {
    console.error(
      "REACT_APP_BACKEND_URL is not configured"
    );
    return;
  }

  window.location.href =
    `${API_BASE_URL}/api/auth/google?frontend_url=${encodeURIComponent(
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
// API
// ==================================================

export const api = {
  base: API,

  // ==================================================
  // AUTHENTICATION
  // ==================================================

  register: (name, email, password) =>
    client
      .post("/auth/register", {
        name,
        email,
        password,
      })
      .then((r) => r.data),

  login: (email, password) =>
    client
      .post("/auth/login", {
        email,
        password,
      })
      .then((r) => r.data),

  adminLogin: (email, password) =>
    client
      .post("/auth/login", {
        email,
        password,
      })
      .then((r) => r.data),

  me: () =>
    client
      .get("/auth/me")
      .then((r) => r.data),


        // JOIN COLLEGE
  joinCollege: (college_code) =>
    client
      .post("/students/college-code", {
        college_code,
      })
      .then((r) => r.data),

  googleSession: (session_id) =>
    client
      .post("/auth/google/session", {
        session_id,
      })
      .then((r) => r.data),

  otpSend: (phone) =>
    client
      .post("/auth/otp/send", {
        phone,
      })
      .then((r) => r.data),

  otpVerify: (phone, otp) =>
    client
      .post("/auth/otp/verify", {
        phone,
        otp,
      })
      .then((r) => r.data),

  // ==================================================
  // COLLEGES
  // ==================================================

  collegesList: () =>
    client
      .get("/colleges")
      .then((response) => response.data),

  getCollegeById: (collegeId) =>
    client
      .get(`/colleges/${collegeId}`)
      .then((response) => response.data),

  createCollege: (collegeData) =>
    client
      .post("/colleges", collegeData)
      .then((response) => response.data),

  updateCollege: (collegeId, payload) =>
    client
      .put(`/colleges/${collegeId}`, payload)
      .then((response) => response.data),

  // ==================================================
  // PROFILE
  // ==================================================

  onboarding: (name, dob) =>
    client
      .post("/me/onboarding", {
        name,
        dob,
      })
      .then((r) => r.data),

  getProfile: () =>
    client
      .get("/profiles/me")
      .then((r) => r.data),

  createProfile: (body) =>
    client
      .post("/profiles/me", body)
      .then((r) => r.data),

  updateProfile: (body) =>
    client
      .put("/profiles/me", body)
      .then((r) => r.data),

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
    client
      .get("/journey")
      .then((r) => r.data),

  // ==================================================
  // CAREER
  // ==================================================

  careerGenerate: (payload) =>
    client
      .post("/career/generate", payload)
      .then((r) => r.data),

  // ==================================================
  // CAREER PERSONA
  // ==================================================

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
      .post("/career-personas", {
        goal,
        answers,
      })
      .then((r) => r.data),

  careerCourseSuggestions: () =>
    client
      .get("/career-persona/course-suggestions")
      .then((r) => r.data),

  // ==================================================
  // CAREER PERSONA HISTORY
  // ==================================================

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

  // ==================================================
  // MENTORS
  // ==================================================

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
    client
      .get("/mentors/industries")
      .then((r) => r.data),

  mentorApply: (body) =>
    client
      .post("/mentors/apply", body)
      .then((r) => r.data),

  mentorGet: (id) =>
    client
      .get(`/mentors/${id}`)
      .then((r) => r.data),

  mentorBook: (id, body) =>
    client
      .post(`/mentors/${id}/book`, body)
      .then((r) => r.data),

  myBookings: (mentorId) =>
    client
      .get("/me/bookings", {
        params: mentorId
          ? { mentorId }
          : {},
      })
      .then((r) => r.data),

  generateReport: (bookingId) =>
    client
      .post(`/bookings/${bookingId}/report/demo`)
      .then((r) => r.data),

  // ==================================================
  // ORGANISATIONS
  // ==================================================

  companiesList: () =>
    client
      .get("/companies")
      .then((r) => r.data),

  companyJoin: (body) =>
    client
      .post("/companies/onboard", body)
      .then((r) => r.data),

  // ==================================================
  // JOBS
  // ==================================================

  jobsList: (params = {}) =>
    client
      .get("/public/jobs", { params })
      .then((r) => r.data),

  jobGet: (id) =>
    client
      .get(`/public/jobs/${id}`)
      .then((r) => r.data),

  jobCreate: (body) =>
    client
      .post("/jobs", body)
      .then((r) => r.data),

  jobApplicationsList: (params = {}) =>
    client
      .get("/job-applications", { params })
      .then((r) => r.data),

  jobApply: (body) =>
    client
      .post("/job-applications", body)
      .then((r) => r.data),

  // ==================================================
  // COURSES / SKILLHUB
  // ==================================================

studentCourses: async () => {
  const response = await client.get("/students/courses");
  return response.data;
},

  courses: () =>
    client
      .get("/courses")
      .then((r) => r.data),

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

      getLevelByCourseAndNumber: async (
  courseId,
  levelNumber
) => {
  const response = await axios.get(
    `/api/levels/course/${courseId}/number/${levelNumber}`
  );

    return response.data;
  },

  // ==================================================
  // LEVELS
  // ==================================================

  // IMPORTANT:
  // Use "client", NOT "axios".
  // This automatically uses:
  // API_BASE_URL + /api
  // and also sends JWT token.

  levels: (params = {}) =>
    client
      .get("/levels", { params })
      .then((r) => r.data),

  level: (levelId) =>
    client
      .get(`/levels/${levelId}`)
      .then((r) => r.data),

  courseLevelsDropdown: (courseId) =>
    client
      .get(`/levels/course/${courseId}/dropdown`)
      .then((r) => r.data),

  courseLevels: (courseId) =>
    client
      .get(`/levels/course/${courseId}`)
      .then((r) => r.data),

  createLevel: (body) =>
    client
      .post("/levels", body)
      .then((r) => r.data),

  updateLevel: (levelId, body) =>
    client
      .put(`/levels/${levelId}`, body)
      .then((r) => r.data),

  // ==================================================
  // PROFILE PHOTO
  // ==================================================

  uploadProfilePhoto: async (file) => {
    if (!file) {
      throw new Error(
        "No profile photo selected."
      );
    }

    const fd = new FormData();
    fd.append("file", file);

    const response = await client.post(
      "/files/profile-photo",
      fd
    );

    console.log(
      "PROFILE PHOTO POST RESPONSE:",
      response.data
    );

    return response.data;
  },

  updateProfilePhoto: async (file) => {
    if (!file) {
      throw new Error(
        "No profile photo selected."
      );
    }

    const fd = new FormData();
    fd.append("file", file);

    const response = await client.put(
      "/files/profile-photo",
      fd
    );

    console.log(
      "PROFILE PHOTO PUT RESPONSE:",
      response.data
    );

    return response.data;
  },

  // ==================================================
  // WORK EXPERIENCES
  // ==================================================

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

  // ==================================================
  // CHECKPOINTS
  // ==================================================

  addCheckpoint: (body) =>
    client
      .post("/checkpoints", body)
      .then((r) => r.data),

  // ==================================================
  // CODE EXECUTION
  // ==================================================

  execute: (
    checkpointId,
    language,
    code,
    stdin
  ) =>
    client
      .post("/code/run", {
        checkpoint_id: checkpointId,
        language,
        code,
        stdin,
      })
      .then((r) => r.data),

  submit: (
    checkpointId,
    language,
    code
  ) =>
    client
      .post("/code/submit", {
        checkpoint_id: checkpointId,
        language,
        code,
      })
      .then((r) => r.data),

  // ==================================================
  // VIDEO COMPLETE
  // ==================================================

  videoComplete: (levelId) =>
    client
      .post(`/levels/${levelId}/video-complete`)
      .then((r) => r.data),

  // ==================================================
  // PROGRESS
  // ==================================================

  myProgress: () =>
    client
      .get("/me/progress")
      .then((r) => r.data),

  // Get progress for a specific level
  getLevelProgress: (levelId) =>
    client
      .get(`/progress/level/${levelId}`)
      .then((r) => r.data),

  // Create progress
  createProgress: (body) =>
    client
      .post("/progress", body)
      .then((r) => r.data),

  // Update existing progress
  updateProgress: (progressId, body) =>
    client
      .put(`/progress/${progressId}`, body)
      .then((r) => r.data),

  // ==================================================
  // STUDENT DASHBOARD
  // ==================================================

  studentSkillHubDashboard: () =>
    client
      .get("/dashboard/student/skillhub")
      .then((r) => r.data),

  getMyResumes: async () => {
    const response = await client.get(
      "/files/me/resumes"
    );

    console.log(
      "MY RESUMES API RESPONSE:",
      response.data
    );

    return response.data;
  },

  upload: async (file) => {
    if (!file) {
      throw new Error(
        "No resume file selected."
      );
    }

    const formData = new FormData();
    formData.append("file", file);

    const response = await client.post(
      "/files/upload",
      formData
    );

    console.log(
      "RESUME UPLOAD API RESPONSE:",
      response.data
    );

    return response.data;
  },

  // ==================================================
  // ADMIN
  // ==================================================

  skillHubDashboard: () =>
    client
      .get("/dashboard/admin/skillhub")
      .then((r) => r.data),

  analytics: () =>
    client
      .get("/admin/analytics")
      .then((r) => r.data),

  students: () =>
    client
      .get("/users/students")
      .then((r) => r.data),

  // ==================================================
  // STUDENT IMPORT
  // ==================================================

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

  generateStudentCodes: async (
    collegeId
  ) => {
    if (!collegeId) {
      throw new Error(
        "College ID is required."
      );
    }

    const response = await client.post(
      `/students/import/${collegeId}/generate-codes`
    );

    console.log(
      "GENERATE STUDENT CODES RESPONSE:",
      response.data
    );

    return response.data;
  },

  exportStudentsExcel: async (
    collegeId
  ) => {
    if (!collegeId) {
      throw new Error(
        "College ID is required."
      );
    }

    const response = await client.get(
      `/students/import/${collegeId}/export`,
      {
        responseType: "blob",
      }
    );

    return response.data;
  },

  // ==================================================
  // COURSES - ADMIN
  // ==================================================

  createCourse: (body) =>
    client
      .post("/courses", body)
      .then((r) => r.data),

  // ==================================================
  // COLLEGE PACKAGES
  // ==================================================

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

  updateCollegePackage: (
    packageId,
    data
  ) =>
    client
      .put(
        `/college-packages/${packageId}`,
        data
      )
      .then((r) => r.data),

  deleteCollegePackage: (
    packageId
  ) =>
    client
      .delete(
        `/college-packages/${packageId}`
      )
      .then((r) => r.data),

  // ==================================================
  // FILE UPLOAD
  // ==================================================

  upload: (file) => {
    const fd = new FormData();

    fd.append("file", file);

    return client
      .post("/files/upload", fd, {
        headers: {
          "Content-Type":
            "multipart/form-data",
        },
      })
      .then((r) => r.data);
  },
};

// ==================================================
// DEFAULT AXIOS CLIENT
// ==================================================

export default client;