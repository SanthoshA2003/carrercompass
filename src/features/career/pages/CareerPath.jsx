import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowUp,
  ArrowLeft,
  Menu,
  Check,
  CheckCircle2,
  GraduationCap,
  Target,
  BookOpen,
  Award,
  Building2,
  ChevronRight,
  Clock,
  Loader2,
  Plus,
  Sparkles,
  PanelLeftClose,
  PanelLeftOpen,
  History,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Background from "@/features/career/components/Background";
import TypeRotator from "@/features/career/components/TypeRotator";
import { api } from "@/services/api";


// ============================================================
// LOGO
// ============================================================

const LOGO =
  "https://customer-assets-v7afamib.emergentagent.net/job_9aefb62e-7f57-4728-958f-65a239b06a22/artifacts/16k7ho7s_MY%20MENOTR%20LOGO.png";

// ============================================================
// ROTATING PLACEHOLDER TEXT
// ============================================================

const ROTATE = [
  "I want to become a Doctor",
  "I want to become an IAS Officer",
  "I want to become an AI Engineer",
  "I want to become a Product Manager",
  "I want to become a Pilot",
  "I want to become a Chartered Accountant",
  "I want to become a Scientist",
  "I want to become an Entrepreneur",
  "I want to study in IIT",
  "I want to work at Google",
  "I want to become a UI UX Designer",
];

// ============================================================
// CAREER CHIPS
// ============================================================

const CHIPS = [
  ["🩺", "Become a Doctor", "I want to become a Doctor"],
  ["🤖", "AI Engineer", "I want to become an AI Engineer"],
  ["⚖️", "Lawyer", "I want to become a Lawyer"],
  ["🎨", "UI UX Designer", "I want to become a UI UX Designer"],
  ["🚀", "Startup Founder", "I want to become a Startup Founder"],
  ["✈️", "Pilot", "I want to become a Pilot"],
  [
    "📈",
    "Chartered Accountant",
    "I want to become a Chartered Accountant",
  ],
  ["🏛", "IAS Officer", "I want to become an IAS Officer"],
];

// ============================================================
// COURSE DATA
// ============================================================


// ============================================================
// API BASE URL
// ============================================================

const API_BASE_URL =
  process.env.REACT_APP_BACKEND_URL ||
  "https://mymentor-api.onrender.com";

// ============================================================
// TOKEN
// ============================================================

const getToken = () => {
  return (
    localStorage.getItem("dp_token") ||
    localStorage.getItem("access_token") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("token")
  );
};

// ============================================================
// CAREER PATH PAGE
// ============================================================
export default function CareerPath() {
  const [goal, setGoal] = useState("");
const [loading, setLoading] = useState(false);

const [careerPersona, setCareerPersona] = useState(null);
const [error, setError] = useState("");

// ==========================================================
// CAREER HISTORY
// ==========================================================

const [careerHistory, setCareerHistory] = useState([]);
const [historyLoading, setHistoryLoading] = useState(false);

// Selected history item
const [selectedHistoryId, setSelectedHistoryId] = useState(null);

// Sidebar open/close
const [historyOpen, setHistoryOpen] = useState(false);

  const [enrolledCourseIds, setEnrolledCourseIds] = useState([]);
  const [enrollingCourseId, setEnrollingCourseId] = useState(null);

  // COURSE STATE
  const [showCourses, setShowCourses] = useState(false);
  const [courseLoading, setCourseLoading] = useState(false);
  const [courseError, setCourseError] = useState("");
  const [courses, setCourses] = useState([]);
  // ==========================================================
  // GET TOKEN
  // ==========================================================

  const token = getToken();
  const navigate = useNavigate();

  useEffect(() => {
  if (token) {
    loadCareerHistory();
  }
}, [token]);


  const loadMyEnrollments = async () => {
    if (!token) return;

    try {
      const url = `${API_BASE_URL}/api/courses/my-enrollments`;

      console.log("MY ENROLLMENTS API:", url);

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json().catch(() => null);

      console.log("MY ENROLLMENTS RESPONSE:", data);

      if (!response.ok) {
        console.error("Failed to load enrollments:", data);
        return;
      }

      // API may return an array directly
      const enrollments = Array.isArray(data)
        ? data
        : data?.enrollments || data?.data || [];

      const ids = enrollments
        .map((item) => {
          return (
            item.course_id ||
            item.courseId ||
            item.course?.id ||
            item.id
          );
        })
        .filter(Boolean);

      console.log("ENROLLED COURSE IDS:", ids);

      setEnrolledCourseIds(ids);
    } catch (err) {
      console.error("MY ENROLLMENTS ERROR:", err);
    }
  };

  // ==========================================================
// OPEN SAVED CAREER HISTORY
// ==========================================================

const openCareerHistory = (item) => {
  if (!item?.result) {
    return;
  }

  console.log("Opening saved career:", item);

  setSelectedHistoryId(item.id);

  // Put previous search back into input
  setGoal(item.goal || "");

  // Show saved result
  setCareerPersona({
    result: item.result,
    history_id: item.id,
    from_history: true,
  });

  // Reset course section
  setShowCourses(false);
  setCourses([]);
  setCourseError("");
  setError("");

  // Scroll to result
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
};

  const enroll = async (courseId) => {
    if (!token) {
      setCourseError("Please login first to enroll in a course.");
      return;
    }

    try {
      setEnrollingCourseId(courseId);
      setCourseError("");

      const url = `${API_BASE_URL}/api/courses/${courseId}/enroll`;

      console.log("ENROLL API:", url);

      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json().catch(() => null);

      console.log("ENROLLMENT RESPONSE:", data);

      // =====================================================
      // ALREADY ENROLLED
      // =====================================================

      if (
        response.status === 409 &&
        data?.detail === "You are already enrolled in this course."
      ) {
        console.log("Already enrolled. Opening course...");

        setEnrolledCourseIds((prev) =>
          prev.includes(courseId)
            ? prev
            : [...prev, courseId]
        );

        navigate(`/skillhub/journey/${courseId}`);

        return;
      }

      // =====================================================
      // OTHER ERRORS
      // =====================================================

      if (!response.ok) {
        throw new Error(
          data?.detail ||
          data?.message ||
          data?.error ||
          "Unable to enroll in course."
        );
      }

      // =====================================================
      // NEW ENROLLMENT SUCCESS
      // =====================================================

      setEnrolledCourseIds((prev) =>
        prev.includes(courseId)
          ? prev
          : [...prev, courseId]
      );

      navigate(`/skillhub/journey/${courseId}`);

    } catch (err) {
      console.error("ENROLL ERROR:", err);

      setCourseError(
        err?.message || "Unable to enroll in this course."
      );
    } finally {
      setEnrollingCourseId(null);
    }
  };
  // ==========================================================
  // COURSE YES / NO + GET COURSE SUGGESTIONS
  // IMPORTANT: This function must stay INSIDE CareerPath().
  // ==========================================================
const updateCoursePreference = async (wantCourses) => {
  if (!token) {
    setCourseError("Please login first.");
    return;
  }

  // =====================================================
  // NO → HIDE COURSES
  // =====================================================

  if (!wantCourses) {
    setShowCourses(false);
    setCourses([]);
    setCourseError("");
    return;
  }

  try {
    setCourseLoading(true);
    setCourseError("");

    // =====================================================
    // YES → GET ONLY CAREER RELATED COURSE SUGGESTIONS
    // GET /api/career-persona/course-suggestions
    // =====================================================

    console.log(
      "Getting career-related course suggestions..."
    );

    const data = await api.careerCourseSuggestions();

    console.log(
      "CAREER COURSE SUGGESTIONS:",
      data
    );

    // =====================================================
    // HANDLE DIFFERENT API RESPONSE STRUCTURES
    // =====================================================

    const suggestedCourses =
      Array.isArray(data)
        ? data
        : data?.courses ||
          data?.suggestions ||
          data?.data ||
          [];

    setCourses(suggestedCourses);

    // =====================================================
    // LOAD USER ENROLLMENTS
    // =====================================================

    await loadMyEnrollments();

    // =====================================================
    // SHOW COURSE SECTION
    // =====================================================

    setShowCourses(true);

  } catch (err) {
    console.error(
      "COURSE SUGGESTIONS ERROR:",
      err
    );

    setCourseError(
      err?.response?.data?.detail ||
      err?.message ||
      "Unable to load recommended courses."
    );

    setShowCourses(false);
    setCourses([]);

  } finally {
    setCourseLoading(false);
  }
};

  const createCareerPersona = async (careerGoal) => {
    if (!token) {
      throw new Error(
        "Authentication token not found. Please login first."
      );
    }

    const url = `${API_BASE_URL}/api/career-personas/me`;

    console.log("POST:", url);

    const response = await fetch(url, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },

      body: JSON.stringify({
        goal: careerGoal.trim(),
      }),
    });

    const data = await response.json().catch(() => null);

    console.log("Career Persona Response:", data);

    if (!response.ok) {
      const message =
        data?.detail ||
        data?.message ||
        data?.error ||
        `Career persona API failed with status ${response.status}`;

      throw new Error(message);
    }

    return data;
  };

  // ==========================================================
  // GET CAREER PERSONA
  // GET /api/career-personas/{persona_id}
  // ==========================================================

  const getCareerPersona = async (personaId) => {
    if (!token) {
      throw new Error(
        "Authentication token not found. Please login first."
      );
    }

    const url = `${API_BASE_URL}/api/career-personas/${personaId}`;

    console.log("GET:", url);

    const response = await fetch(url, {
      method: "GET",

      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json().catch(() => null);

    console.log("Career Persona Details:", data);

    if (!response.ok) {
      const message =
        data?.detail ||
        data?.message ||
        data?.error ||
        `Career persona details API failed with status ${response.status}`;

      throw new Error(message);
    }

    return data;
  };


  // ==========================================================
// NORMALIZE CAREER GOAL
// Used to compare current search with previous searches.
// ==========================================================

const normalizeCareerGoal = (value) => {
  if (!value) return "";

  return value
    .toLowerCase()
    .trim()
    .replace(/[?.!,]/g, "")
    .replace(/\s+/g, " ")
    .replace(/^i want to become an?\s+/i, "")
    .replace(/^i want to become\s+/i, "")
    .replace(/^i want to be an?\s+/i, "")
    .replace(/^i want to be\s+/i, "")
    .replace(/^i want an?\s+/i, "")
    .replace(/^i want\s+/i, "")
    .replace(/^become an?\s+/i, "")
    .replace(/^become\s+/i, "")
    .replace(/^became an?\s+/i, "")
    .replace(/^became\s+/i, "")
    .replace(/^to become an?\s+/i, "")
    .replace(/^to become\s+/i, "")
    .trim();
};

// ==========================================================
// LOAD CAREER HISTORY
// ==========================================================

const loadCareerHistory = async () => {
  if (!token) return;

  try {
    setHistoryLoading(true);

    const data = await api.careerPersonaHistory();

    console.log(
      "CAREER PERSONA HISTORY:",
      data
    );

    const items = Array.isArray(data)
      ? data
      : data?.items || [];

    setCareerHistory(items);

  } catch (err) {
    console.error(
      "CAREER HISTORY ERROR:",
      err
    );

    setCareerHistory([]);
  } finally {
    setHistoryLoading(false);
  }
};

  // ==========================================================
  // SEND CAREER GOAL
  // ==========================================================

  const send = async () => {
  setError("");
  setCourseError("");
  setShowCourses(false);

  // New search = remove selected history highlight
  setSelectedHistoryId(null);

  if (!goal.trim()) {
      setError("Please enter your career goal.");
      return;
    }

    if (!token) {
      setError(
        "Please login first to create your career path."
      );
      return;
    }

   try {
  setLoading(true);

  const searchGoal = goal.trim();

  // ======================================================
  // STEP 1
  // CHECK DATABASE HISTORY FIRST
  // ======================================================

  console.log(
    "Checking career history before calling AI..."
  );

  let history = careerHistory;

  try {
    const historyResponse =
      await api.careerPersonaHistory();

    history = Array.isArray(historyResponse)
      ? historyResponse
      : historyResponse?.items || [];

    setCareerHistory(history);

  } catch (historyError) {
    console.error(
      "Unable to load career history:",
      historyError
    );
  }

  // ======================================================
  // STEP 2
  // FIND EXISTING CAREER
  // ======================================================

  const normalizedSearch =
    normalizeCareerGoal(searchGoal);

  console.log(
    "NORMALIZED SEARCH:",
    normalizedSearch
  );

  const existingHistory =
    history.find((item) => {
      const historyGoal =
        normalizeCareerGoal(item.goal);

      const historyCareer =
        normalizeCareerGoal(
          item.result?.career
        );

      return (
        historyGoal === normalizedSearch ||
        historyCareer === normalizedSearch
      );
    });

  // ======================================================
  // STEP 3
  // HISTORY FOUND → DON'T CALL AI
  // ======================================================

  if (existingHistory?.result) {

    console.log(
      "✅ EXISTING CAREER FOUND IN DATABASE"
    );

    console.log(
      "Using saved career result:",
      existingHistory
    );

    setCareerPersona({
      result: existingHistory.result,
      history_id: existingHistory.id,
      from_history: true,
    });

    return;
  }

  // ======================================================
  // STEP 4
  // NO HISTORY → CALL AI
  // ======================================================

  console.log(
    "❌ Career not found in history."
  );

  console.log(
    "🤖 Calling AI to generate new career persona..."
  );

  const postResponse =
    await createCareerPersona(
      searchGoal
    );

      console.log(
        "CAREER PERSONA CREATED:",
        postResponse
      );

      // ======================================================
      // STEP 2
      // GET PERSONA ID
      // ======================================================

      const personaId =
        postResponse?.career_persona?.id ||
        postResponse?.id ||
        postResponse?.persona_id;

      if (!personaId) {
        console.error(
          "Persona ID missing:",
          postResponse
        );

        throw new Error(
          "Career persona ID was not returned by the API."
        );
      }

      console.log(
        "CAREER PERSONA ID:",
        personaId
      );

      // ======================================================
      // STEP 3
      // GET COMPLETE CAREER PERSONA
      // ======================================================

      const getResponse =
        await getCareerPersona(
          personaId
        );

      console.log(
        "COMPLETE CAREER PERSONA:",
        getResponse
      );

      // ======================================================
      // STEP 4
      // SHOW RESULT
      // ======================================================

      setCareerPersona(getResponse);

// Refresh career history
await loadCareerHistory();
    } catch (err) {
      console.error("CAREER PERSONA ERROR:", err);

      const message = err?.message || "";

      if (message.includes("503") || message.includes("high demand")) {
        setError(
          "The AI service is currently experiencing high demand. Please try again in a few moments."
        );
      } else {
        setError(
          message || "Unable to generate your career path. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // ==========================================================
  // EXTRACT RESULT
  // ==========================================================

  const persona =
    careerPersona?.career_persona ||
    careerPersona;

  const result = persona?.result;

  const roadmap =
    result?.roadmap || [];

  const targetExams =
    result?.target_exams || [];

  const recommendedColleges =
    result?.recommended_colleges || [];

  // ==========================================================
  // UI
  // ==========================================================

 return (
  <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-200">

    <Background />

{/* ======================================================
    CAREER JOURNEYS SIDEBAR (REDESIGNED)
====================================================== */}
<aside
  className={`
    fixed left-0 top-0 z-50 h-screen
    w-[320px] 
    border-r border-white/[0.08]
    bg-[#050816]/95
    backdrop-blur-2xl
    shadow-[20px_0_70px_rgba(0,0,0,0.5)]
    transition-transform duration-300 ease-out
    ${historyOpen ? "translate-x-0" : "-translate-x-full"}
  `}
>
  {/* HEADER SECTION */}
  <div className="border-b border-white/[0.07] px-6 py-6">
    <Link
      to="/"
      className="group mb-6 inline-flex items-center gap-2 text-[13px] font-medium text-slate-400 transition-colors hover:text-white"
    >
      <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
      <span>Back to Dashboard</span>
    </Link>

    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-cyan-400/30 bg-cyan-400/10 text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.1)]">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-bold tracking-tight text-white">
            History
          </h2>
          <p className="text-xs font-medium text-slate-500">
            Saved career paths
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setHistoryOpen(false)}
        className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.03] text-slate-400 transition-all hover:bg-white/[0.08] hover:text-white"
      >
        <PanelLeftClose className="h-5 w-5" />
      </button>
    </div>
  </div>

  {/* NEW SEARCH ACTION */}
  <div className="px-4 py-6">
    <button
      type="button"
      onClick={() => {
        setGoal("");
        setCareerPersona(null);
        setSelectedHistoryId(null);
        setShowCourses(false);
        setCourses([]);
        setError("");
        setCourseError("");
      }}
      className="group relative flex w-full items-center gap-4 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] p-4 transition-all hover:border-cyan-400/40 hover:bg-white/[0.05]"
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-lg group-hover:scale-105 transition-transform">
        <Plus className="h-6 w-6" />
      </div>
      <div className="text-left">
        <p className="text-[15px] font-bold text-white">New Search</p>
        <p className="text-xs text-slate-500">Explore another path</p>
      </div>
      <ChevronRight className="ml-auto h-5 w-5 text-slate-600 group-hover:text-cyan-400 transition-colors" />
    </button>
  </div>

  {/* RECENT JOURNEYS LABEL */}
  <div className="flex items-center justify-between px-6 pb-4">
    <div className="flex items-center gap-2">
      <History className="h-4 w-4 text-slate-500" />
      <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
        Recent Journeys
      </span>
    </div>
    {careerHistory.length > 0 && (
      <span className="rounded-full bg-white/[0.05] px-2.5 py-0.5 text-[10px] font-bold text-slate-400 border border-white/[0.05]">
        {careerHistory.length}
      </span>
    )}
  </div>

  {/* LIST SECTION */}
<div className="career-history-scroll h-[calc(100vh-320px)] overflow-y-auto px-4 pb-10">
      {historyLoading ? (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 w-full animate-pulse rounded-2xl bg-white/[0.03]" />
        ))}
      </div>
    ) : careerHistory.length === 0 ? (
      <div className="mt-10 text-center px-6">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/[0.02] text-slate-600">
          <BookOpen className="h-6 w-6" />
        </div>
        <p className="text-sm font-medium text-slate-500 leading-relaxed">
          Your AI-generated career paths will appear here.
        </p>
      </div>
    ) : (
      <div className="space-y-3">
        {careerHistory.map((item) => {
          const selected = selectedHistoryId === item.id;
          return (
            <button
              key={item.id}
              onClick={() => openCareerHistory(item)}
              className={`
                group relative flex w-full flex-col gap-1 rounded-2xl border p-4 transition-all duration-200
                ${selected 
                  ? "border-cyan-400/40 bg-cyan-400/[0.08] shadow-[0_8px_20px_rgba(0,0,0,0.2)]" 
                  : "border-transparent bg-white/[0.03] hover:border-white/10 hover:bg-white/[0.06]"
                }
              `}
            >
              <div className="flex items-center justify-between">
                <span className={`text-[14px] font-bold truncate pr-2 ${selected ? "text-white" : "text-slate-200 group-hover:text-white"}`}>
                  {item.goal || "Career Search"}
                </span>
                <ChevronRight className={`h-4 w-4 shrink-0 transition-transform ${selected ? "text-cyan-400 translate-x-0.5" : "text-slate-600 group-hover:text-slate-400"}`} />
              </div>
              
              <div className="flex items-center gap-2 mt-1">
                <div className={`h-1.5 w-1.5 rounded-full ${selected ? "bg-cyan-400" : "bg-slate-600"}`} />
                <span className="truncate text-xs font-medium text-slate-500 group-hover:text-slate-400">
                  {item.result?.career || "Generating..."}
                </span>
              </div>

              {selected && (
                <motion.div 
                  layoutId="active-pill"
                  className="absolute left-0 top-4 h-8 w-1 rounded-r-full bg-cyan-400" 
                />
              )}
            </button>
          );
        })}
      </div>
    )}
  </div>
</aside>


    {/* ======================================================
    COLLAPSED CAREER JOURNEYS CONTROL
====================================================== */}

{!historyOpen && (
  <div className="fixed left-5 top-5 z-50">

    <div
      className="
        flex items-center gap-2
        rounded-2xl
        border border-white/[0.08]
        bg-[#070c1d]/90
        p-1.5
        shadow-[0_10px_40px_rgba(0,0,0,0.35)]
        backdrop-blur-2xl
      "
    >

      {/* MYMENTOR */}

      <Link
        to="/"
        className="
          flex items-center gap-2
          rounded-xl
          px-3 py-2
          text-xs font-semibold
          text-slate-400
          transition-all duration-200
          hover:bg-white/[0.05]
          hover:text-white
        "
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        <span>MyMentor</span>
      </Link>


      {/* DIVIDER */}

      <div className="h-5 w-px bg-white/[0.08]" />


      {/* OPEN CAREER JOURNEYS */}

      <button
        type="button"
        onClick={() => setHistoryOpen(true)}
        aria-label="Open Career Journeys"
        className="
          group
          flex items-center gap-2.5
          rounded-xl
          px-2.5 py-2
          text-xs font-semibold
          text-slate-300
          transition-all duration-200
          hover:bg-white/[0.06]
          hover:text-white
        "
      >

        <span
          className="
            flex h-7 w-7
            items-center justify-center
            rounded-lg
            border border-cyan-400/20
            bg-gradient-to-br
            from-cyan-400/10
            to-violet-500/10
            text-cyan-300
            transition-transform duration-200
            group-hover:scale-105
          "
        >
          <PanelLeftOpen className="h-4 w-4" />
        </span>

        <span>Career Journeys</span>

      </button>

    </div>

  </div>
)}
  

      {/* ======================================================
          MAIN
      ====================================================== */}

      <div
  className={`
    relative z-10 min-h-screen max-w-6xl px-4 py-24
    transition-all duration-300
    ${
     historyOpen
  ? "lg:ml-[290px] lg:mr-auto"
  : "mx-auto"
    }
  `}
>

        {/* ====================================================
            HERO
        ==================================================== */}

        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">

          {/* LOGO */}

          <motion.div
            initial={{
              opacity: 0,
              y: -10,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
          >
            <div className="absolute inset-0 -z-10 rounded-full bg-white/10 blur-2xl" />

            <img
              src={LOGO}
              alt="MyMentor"
              className="mx-auto h-24 w-auto drop-shadow-[0_4px_24px_rgba(56,189,248,0.35)]"
            />
          </motion.div>

          {/* HEADING */}

          <motion.h1
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.1,
            }}
            className="mt-8 text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl"
          >
            Your{" "}
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-violet-400 bg-clip-text text-transparent">
              AI Career Intelligence
            </span>{" "}
            Platform
          </motion.h1>

          <motion.p
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.2,
            }}
            className="mt-4 text-lg text-slate-400"
          >
            One conversation can shape your entire future.
          </motion.p>

          {/* ==================================================
              INPUT
          ================================================== */}

          <motion.div
            initial={{
              opacity: 0,
              y: 24,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.3,
            }}
            className="group relative mt-10 w-full"
          >

            <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-cyan-500/40 to-violet-500/40 opacity-60 blur transition-opacity group-focus-within:opacity-100" />

            <div className="relative flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-900/80 p-2.5 backdrop-blur-xl">

              <div className="relative flex-1">

                <input
                  value={goal}
                  onChange={(e) => {
                    setGoal(e.target.value);
                    setError("");
                  }}
                  onKeyDown={(e) => {
                    if (
                      e.key === "Enter" &&
                      !loading
                    ) {
                      send();
                    }
                  }}
                  disabled={loading}
                  className="w-full bg-transparent px-4 py-3 text-[17px] text-white outline-none disabled:cursor-not-allowed disabled:opacity-60"
                  data-testid="career-prompt-input"
                  aria-label="Career goal"
                />

                {!goal && !loading && (
                  <div className="pointer-events-none absolute inset-0 flex items-center px-4 text-[17px] text-slate-500">
                    <TypeRotator
                      phrases={ROTATE}
                    />
                  </div>
                )}

              </div>

              <button
                type="button"
                onClick={send}
                disabled={loading}
                className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-cyan-500 to-violet-500 text-white transition-transform hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <ArrowUp className="h-5 w-5" />
                )}
              </button>

            </div>
          </motion.div>

          {/* ERROR */}

          {error && (
            <motion.div
              initial={{
                opacity: 0,
                y: -5,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              className="mt-4 w-full rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-left text-sm text-red-300"
            >
              {error}
            </motion.div>
          )}

          {/* CHIPS */}

          <motion.div
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            transition={{
              delay: 0.5,
            }}
            className="mt-6 flex flex-wrap justify-center gap-2"
          >
            {CHIPS.map(
              ([emoji, label, value]) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => {
                    setGoal(value);
                    setError("");
                  }}
                  disabled={loading}
                  className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-300 transition-colors hover:border-cyan-400/50 hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <span className="mr-1.5">
                    {emoji}
                  </span>

                  {label}
                </button>
              )
            )}
          </motion.div>

        </div>

        {/* ====================================================
            CAREER RESULT
        ==================================================== */}

        {result && (
          <motion.div
            initial={{
              opacity: 0,
              y: 30,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.5,
            }}
            className="mx-auto mt-16 max-w-5xl"
          >

            {/* ==================================================
                CAREER HEADER
            ================================================== */}

            <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-2xl backdrop-blur-xl sm:p-8">

              <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">

                <div>

                  <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-cyan-300">
                    <CheckCircle2 className="h-4 w-4" />
                    Career Path Generated
                  </div>

                  <h2 className="text-3xl font-bold text-white sm:text-4xl">
                    {result.career}
                  </h2>

                  {result.career_overview && (
                    <p className="mt-3 max-w-3xl leading-7 text-slate-400">
                      {result.career_overview}
                    </p>
                  )}

                </div>

                {result.confidence_score !== undefined && (
                  <div className="shrink-0 rounded-2xl border border-white/10 bg-white/5 p-5 text-center">

                    <div className="text-3xl font-bold text-cyan-400">
                      {result.confidence_score}%
                    </div>

                    <div className="mt-1 text-xs text-slate-400">
                      Confidence Score
                    </div>

                  </div>
                )}

              </div>

            </div>

            {/* ==================================================
                QUICK DETAILS
            ================================================== */}

            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

              {/* CURRENT STAGE */}

              <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-5">

                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                  <GraduationCap className="h-5 w-5" />
                </div>

                <p className="text-xs text-slate-500">
                  Current Stage
                </p>

                <p className="mt-1 font-semibold text-white">
                  {result.current_stage || "-"}
                </p>

              </div>

              {/* PRIMARY SKILL */}

              <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-5">

                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400">
                  <Target className="h-5 w-5" />
                </div>

                <p className="text-xs text-slate-500">
                  Primary Skill
                </p>

                <p className="mt-1 font-semibold text-white">
                  {result.primary_skill || "-"}
                </p>

              </div>

              {/* RECOMMENDED STREAM */}

              <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-5">

                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400">
                  <BookOpen className="h-5 w-5" />
                </div>

                <p className="text-xs text-slate-500">
                  Recommended Stream
                </p>

                <p className="mt-1 font-semibold text-white">
                  {result.recommended_stream || "-"}
                </p>

              </div>

              {/* TARGET EXAMS */}

              <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-5">

                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400">
                  <Award className="h-5 w-5" />
                </div>

                <p className="text-xs text-slate-500">
                  Target Exams
                </p>

                <p className="mt-1 font-semibold text-white">
                  {targetExams.length
                    ? targetExams.join(", ")
                    : "-"}
                </p>

              </div>

            </div>

            {/* ==================================================
                ROADMAP
            ================================================== */}

            {roadmap.length > 0 && (
              <div className="mt-8 rounded-3xl border border-white/10 bg-slate-900/70 p-6 sm:p-8">

                <div className="mb-8">

                  <h3 className="text-2xl font-bold text-white">
                    Your Career Roadmap
                  </h3>

                  <p className="mt-2 text-sm text-slate-400">
                    Follow these steps to reach your career goal.
                  </p>

                </div>

                <div className="space-y-6">

                  {roadmap.map(
                    (item, index) => (
                      <div
                        key={
                          item.step ||
                          index
                        }
                        className="relative flex gap-5"
                      >

                        {index <
                          roadmap.length - 1 && (
                            <div className="absolute left-5 top-12 h-full w-px bg-gradient-to-b from-cyan-400/40 to-violet-500/10" />
                          )}

                        <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-violet-500 text-sm font-bold text-white shadow-lg shadow-cyan-500/10">
                          {item.step ||
                            index + 1}
                        </div>

                        <div className="flex-1 rounded-2xl border border-white/10 bg-white/[0.03] p-5">

                          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

                            <h4 className="text-lg font-semibold text-white">
                              {item.title}
                            </h4>

                            <span className="w-fit rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-medium text-cyan-300">
                              {item.stage}
                            </span>

                          </div>

                          {item.description && (
                            <p className="mt-3 leading-7 text-slate-400">
                              {item.description}
                            </p>
                          )}

                        </div>

                      </div>
                    )
                  )}

                </div>

              </div>
            )}

            {/* ==================================================
                RECOMMENDED COLLEGES
            ================================================== */}

            {recommendedColleges.length > 0 && (
              <div className="mt-8 rounded-3xl border border-white/10 bg-slate-900/70 p-6 sm:p-8">

                <div className="mb-6">

                  <h3 className="text-2xl font-bold text-white">
                    Recommended Colleges
                  </h3>

                  <p className="mt-2 text-sm text-slate-400">
                    Institutions recommended for your career path.
                  </p>

                </div>

                <div className="grid gap-4 md:grid-cols-2">

                  {recommendedColleges.map(
                    (college, index) => (
                      <div
                        key={
                          college.name ||
                          index
                        }
                        className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-cyan-400/30 hover:bg-white/[0.05]"
                      >

                        <div className="flex gap-4">

                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                            <Building2 className="h-5 w-5" />
                          </div>

                          <div className="min-w-0 flex-1">

                            <h4 className="font-semibold text-white">
                              {college.name}
                            </h4>

                            <div className="mt-2 space-y-1 text-sm text-slate-400">

                              <p>
                                <span className="text-slate-500">
                                  Type:
                                </span>{" "}
                                {college.type || "-"}
                              </p>

                              <p>
                                <span className="text-slate-500">
                                  Location:
                                </span>{" "}
                                {college.location || "-"}
                              </p>

                              <p>
                                <span className="text-slate-500">
                                  Admission:
                                </span>{" "}
                                {college.admission || "-"}
                              </p>

                            </div>

                          </div>

                          <ChevronRight className="mt-1 h-5 w-5 shrink-0 text-slate-600" />

                        </div>

                      </div>
                    )
                  )}

                </div>

              </div>
            )}

            {/* ==================================================
                NEXT STEP
            ================================================== */}

            {result.recommended_next_step && (
              <div className="mt-8 rounded-3xl border border-cyan-400/20 bg-gradient-to-r from-cyan-500/10 to-violet-500/10 p-6 sm:p-8">

                <div className="flex gap-4">

                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300">
                    <Target className="h-5 w-5" />
                  </div>

                  <div>

                    <h3 className="text-lg font-bold text-white">
                      Recommended Next Step
                    </h3>

                    <p className="mt-2 leading-7 text-slate-300">
                      {result.recommended_next_step}
                    </p>

                  </div>

                </div>

              </div>
            )}

            {/* ==================================================
                COURSE QUESTION
            ================================================== */}

            <motion.div
              initial={{
                opacity: 0,
                y: 20,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: 0.2,
              }}
              className="mt-8 rounded-3xl border border-white/10 bg-slate-900/70 p-6 shadow-xl backdrop-blur-xl sm:p-8"
            >

              <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">

                <div className="flex gap-4">

                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400">
                    <BookOpen className="h-6 w-6" />
                  </div>

                  <div>

                    <h3 className="text-xl font-bold text-white">
                      Want to improve your skills?
                    </h3>

                    <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                      Would you like to explore courses
                      recommended specifically for your
                      career path?
                    </p>

                  </div>

                </div>

                {/* YES / NO */}

                <div className="flex shrink-0 gap-3">

                  <button
                    type="button"
                    disabled={courseLoading}
                    onClick={() =>
                      updateCoursePreference(true)
                    }
                    className="rounded-xl bg-gradient-to-r from-cyan-500 to-violet-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-500/10 transition hover:scale-105 hover:shadow-cyan-500/20 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {courseLoading ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Saving...
                      </span>
                    ) : (
                      "Yes, Show Courses"
                    )}
                  </button>

                  <button
                    type="button"
                    disabled={courseLoading}
                    onClick={() =>
                      updateCoursePreference(false)
                    }
                    className="rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    No
                  </button>

                </div>

              </div>

              {/* COURSE API ERROR */}

              {courseError && (
                <div className="mt-5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                  {courseError}
                </div>
              )}

            </motion.div>

            {/* ==================================================
                RECOMMENDED COURSES
            ================================================== */}

            {/* ==================================================
    RECOMMENDED COURSES
================================================== */}

            {showCourses && (
              <motion.div
                initial={{
                  opacity: 0,
                  y: 25,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  duration: 0.4,
                }}
                className="mt-8 rounded-3xl border border-white/10 bg-slate-900/70 p-6 shadow-2xl backdrop-blur-xl sm:p-8"
              >
                {/* COURSE HEADER */}
                <div className="mb-7">
                  <div className="inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-400/10 px-3 py-1 text-xs font-semibold text-violet-300">
                    <BookOpen className="h-4 w-4" />
                    Recommended Courses
                  </div>

                  <h3 className="mt-4 text-2xl font-bold text-white">
                    Courses for Your Career
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    Build the skills you need to move closer to your career goal with
                    these recommended courses.
                  </p>
                </div>

                {/* COURSE CARDS */}

                {courses.length > 0 ? (
                  <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                    {courses.map((course, i) => {
                      /*
                       * Check enrollment from both:
                       * 1. enrolledCourseIds state
                       * 2. course.enrolled returned by API
                       */
                      const isEnrolled =
                        enrolledCourseIds.includes(course.id) ||
                        course.enrolled === true;

                      return (
                        <motion.div
                          key={course.id}
                          initial={{
                            opacity: 0,
                            y: 20,
                          }}
                          animate={{
                            opacity: 1,
                            y: 0,
                          }}
                          transition={{
                            delay: i * 0.06,
                          }}
                          whileHover={{
                            y: -6,
                          }}
                          className="group flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] shadow-xl transition hover:border-cyan-400/30 hover:bg-white/[0.05]"
                        >
                          {/* ==================================================
                  IMAGE
              ================================================== */}

                          <div className="relative h-44 overflow-hidden bg-slate-800">
                            {course.thumbnail ? (
                              <img
                                src={course.thumbnail}
                                alt={course.title || "Course"}
                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                onError={(e) => {
                                  e.currentTarget.style.display = "none";
                                }}
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-cyan-500/20 to-violet-500/20">
                                <BookOpen className="h-12 w-12 text-cyan-400/70" />
                              </div>
                            )}

                            {/* CATEGORY */}

                            <span className="absolute left-4 top-4 rounded-full border border-white/20 bg-slate-950/80 px-3 py-1 text-xs font-bold text-slate-200 backdrop-blur">
                              {course.category?.name ||
                                course.category_name ||
                                course.category ||
                                "Course"}
                            </span>

                            {/* ENROLLED BADGE */}

                            {isEnrolled && (
                              <span className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full border border-emerald-400/30 bg-emerald-500/90 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                Enrolled
                              </span>
                            )}
                          </div>

                          {/* ==================================================
                  CONTENT
              ================================================== */}

                          <div className="flex flex-1 flex-col p-6">
                            {/* TITLE */}

                            <h4 className="text-[17px] font-bold text-white">
                              {course.title || "Course"}
                            </h4>

                            {/* DESCRIPTION */}

                            <p className="mt-2 line-clamp-2 text-[13px] leading-relaxed text-slate-400">
                              {course.description ||
                                "Recommended course for your career path."}
                            </p>

                            {/* DETAILS */}

                            <div className="mt-4 flex items-center justify-between text-[13px] text-slate-400">
                              {/* DURATION */}

                              <span className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />

                                {course.duration || "Self paced"}
                              </span>

                              {/* DIFFICULTY */}

                              <span className="flex items-center gap-1">
                                <BookOpen className="h-4 w-4" />

                                {course.difficulty || "Beginner"}
                              </span>
                            </div>

                            {/* LANGUAGE */}

                            {course.language && (
                              <div className="mt-3 text-xs text-slate-500">
                                Language:{" "}
                                <span className="text-slate-400">
                                  {course.language}
                                </span>
                              </div>
                            )}

                            {/* ==================================================
                    BUTTON
                ================================================== */}

                            <button
                              type="button"
                              disabled={enrollingCourseId === course.id}
                              onClick={() => {
                                if (isEnrolled) {
                                  navigate(`/skillhub/journey/${course.id}`);
                                } else {
                                  enroll(course.id);
                                }
                              }}
                              className={`mt-5 inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-white transition ${isEnrolled
                                ? "bg-emerald-500 hover:bg-emerald-600"
                                : "bg-gradient-to-r from-blue-600 to-cyan-500"
                                } disabled:cursor-not-allowed disabled:opacity-60`}
                            >
                              {enrollingCourseId === course.id ? (
                                <>
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                  Enrolling...
                                </>
                              ) : isEnrolled ? (
                                <>
                                  Continue
                                  <ArrowRight className="h-4 w-4" />
                                </>
                              ) : (
                                <>
                                  Enroll Now
                                  <ChevronRight className="h-4 w-4" />
                                </>
                              )}
                            </button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center text-sm text-slate-400">
                    No recommended courses found for your career path.
                  </div>
                )}
              </motion.div>
            )}




          </motion.div>
        )}

      </div>
    </div>
  );
}