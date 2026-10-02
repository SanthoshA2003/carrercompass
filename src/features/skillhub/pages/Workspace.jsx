import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import {
  ArrowLeft,
  Play,
  Pause,
  Lock,
  Loader2,
  CheckCircle2,
  XCircle,
  Terminal,
  Zap,
  Target,
  BookOpen,
  Lightbulb,
  AlertTriangle,
  ListChecks,
  ChevronRight,
  PartyPopper,
  Flag,
} from "lucide-react";

import CodeEditor from "@/features/skillhub/components/CodeEditor";
import { api } from "@/services/api";
import { useAcademyAuth } from "@/context/AuthContext";
import { toast } from "sonner";

/* =========================================================
   LANGUAGES
========================================================= */

const LANGS = [
  {
    id: "python",
    label: "Python",
  },
  {
    id: "javascript",
    label: "JavaScript",
  },
  {
    id: "sql",
    label: "SQL",
  },
  {
    id: "react",
    label: "React",
  },
  {
    id: "sql",
    label: "SQL",
  },
  // {
  //   id: "java",
  //   label: "Java ",
  // },
];

/* =========================================================
   CHECKPOINT API
========================================================= */

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  "https://mymentor-api.onrender.com/api"
).replace(/\/$/, "").endsWith("/api")
  ? (
    import.meta.env.VITE_API_BASE_URL ||
    "https://mymentor-api.onrender.com/api"
  ).replace(/\/$/, "")
  : `${(import.meta.env.VITE_API_BASE_URL || "https://mymentor-api.onrender.com").replace(/\/$/, "")}/api`;

const CHECKPOINTS_API_URL = `${API_BASE_URL}/checkpoints`;

const getAuthToken = () =>
  localStorage.getItem("token") ||
  localStorage.getItem("access_token") ||
  localStorage.getItem("accessToken") ||
  localStorage.getItem("dp_token");

const clearAuthTokens = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("access_token");
  localStorage.removeItem("accessToken");
  localStorage.removeItem("dp_token");
};

const createHttpError = (message, status) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

const normalizeProgress = (data) => {
  if (!data) return null;

  if (Array.isArray(data)) {
    return data[0] || null;
  }

  if (data?.progress && typeof data.progress === "object") {
    return data.progress;
  }

  if (data?.data && !Array.isArray(data.data) && typeof data.data === "object") {
    return data.data;
  }

  return data;
};

const getProgressId = (progress) =>
  progress?.id ??
  progress?.progress_id ??
  progress?.progressId ??
  null;

const getPassedCheckpointIds = (progress) => {
  const value =
    progress?.checkpointsPassed ??
    progress?.checkpoints_passed ??
    [];

  return Array.isArray(value)
    ? value.map((id) => String(id))
    : [];
};

const getVideoCompleted = (progress) =>
  Boolean(
    progress?.videoCompleted ??
    progress?.video_completed ??
    false
  );

const normalizeCheckpoint = (checkpoint, index) => ({
  ...checkpoint,
  id:
    checkpoint?.id ??
    checkpoint?.checkpointId ??
    checkpoint?.checkpoint_id,
  order: Number(
    checkpoint?.order ??
    checkpoint?.sequence ??
    checkpoint?.orderNumber ??
    index + 1
  ),
  atSeconds: Number(
    checkpoint?.atSeconds ??
    checkpoint?.at_seconds ??
    checkpoint?.time ??
    checkpoint?.timestamp ??
    0
  ),
  difficulty: checkpoint?.difficulty ?? "Easy",
  xp: Number(
    checkpoint?.xp ??
    checkpoint?.xpAwarded ??
    checkpoint?.xp_awarded ??
    0
  ),
  title:
    checkpoint?.title ??
    `Checkpoint ${index + 1}`,
  scenario: checkpoint?.scenario ?? "",
  problemStatement:
    checkpoint?.problemStatement ??
    checkpoint?.problem_statement ??
    "",
  hints: Array.isArray(checkpoint?.hints)
    ? checkpoint.hints
    : [],
  starterCode:
    checkpoint?.starterCode ??
    checkpoint?.starter_code ??
    {},
  visibleTestCases: (
  checkpoint?.visibleTestCases ??
  checkpoint?.visible_test_cases ??
  checkpoint?.testCases ??
  checkpoint?.test_cases ??
  []
).map((testCase) => ({
  input: testCase?.input ?? "",
  expectedOutput:
    testCase?.expectedOutput ??
    testCase?.expected_output ??
    "",
})),

  hiddenCount: Number(
    checkpoint?.hiddenCount ??
    checkpoint?.hidden_count ??
    0
  ),
});

const fetchCheckpoints = async ({
  levelId,
  language = "python",
  difficulty,
}) => {
  if (!levelId) {
    throw new Error("Level ID is required to load checkpoints");
  }

  const params = new URLSearchParams();
  params.set("level_id", levelId);
  params.set("language", language);
  params.set("skip", "0");
  params.set("limit", "100");

  if (difficulty) {
    params.set("difficulty", difficulty);
  }

  const token = getAuthToken();
  const headers = {
    Accept: "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const url = `${CHECKPOINTS_API_URL}?${params.toString()}`;

  console.log("CHECKPOINTS API URL:", url);

  const response = await fetch(url, {
    method: "GET",
    headers,
  });

  const text = await response.text();
  let data = {};

  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { message: text };
  }

  console.log("CHECKPOINTS API STATUS:", response.status);
  console.log("CHECKPOINTS API RESPONSE:", data);

  if (response.status === 401) {
    clearAuthTokens();
    throw createHttpError(
      "Your session has expired. Please login again.",
      401
    );
  }

  if (!response.ok) {
    throw createHttpError(
      data?.detail ||
      data?.message ||
      `Checkpoint API failed with status ${response.status}`,
      response.status
    );
  }

  const list = Array.isArray(data)
    ? data
    : Array.isArray(data?.checkpoints)
      ? data.checkpoints
      : Array.isArray(data?.items)
        ? data.items
        : Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data?.results)
            ? data.results
            : [];

  return list
    .map(normalizeCheckpoint)
    .filter((checkpoint) => checkpoint.id)
    .sort((a, b) => a.order - b.order);
};

/* =========================================================
   HELPERS
========================================================= */

const fmt = (seconds = 0) =>
  `${Math.floor(seconds / 60)}:${String(
    Math.floor(seconds % 60)
  ).padStart(2, "0")}`;

/*
  Decode JWT payload safely.

  We are NOT verifying the token here.
  We are only reading the payload in the browser to find
  the user ID if it exists there.
*/
const decodeJwtPayload = (token) => {
  try {
    if (!token || typeof token !== "string") return null;

    const parts = token.split(".");
    if (parts.length !== 3) return null;

    // JWT uses base64url. Add padding before decoding.
    const base64Url = parts[1]
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    const padded =
      base64Url + "=".repeat((4 - (base64Url.length % 4)) % 4);

    const jsonPayload = decodeURIComponent(
      atob(padded)
        .split("")
        .map(
          (char) =>
            `%${`00${char.charCodeAt(0).toString(16)}`.slice(-2)}`
        )
        .join("")
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("JWT decode failed:", error);
    return null;
  }
};

/* =========================================================
   USER ID RESOLUTION
   ========================================================= */
const getStoredUserId = () => {
  const directKeys = [
    "user_id",
    "userId",
    "userID",
    "id",
    "studentId",
    "student_id",
    "profileId",
    "profile_id",
  ];

  // 1. Direct localStorage values.
  for (const key of directKeys) {
    const value = localStorage.getItem(key);

    if (
      value &&
      value !== "null" &&
      value !== "undefined" &&
      value.trim() !== ""
    ) {
      return String(value);
    }
  }

  // 2. Stored user/profile objects.
  const objectKeys = [
    "user",
    "currentUser",
    "student",
    "profile",
    "academyUser",
    "authUser",
  ];

  for (const key of objectKeys) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) continue;

      const parsed = JSON.parse(raw);
      const id =
        parsed?.user_id ??
        parsed?.userId ??
        parsed?.userID ??
        parsed?.id ??
        parsed?.studentId ??
        parsed?.student_id ??
        parsed?.profileId ??
        parsed?.profile_id ??
        parsed?.user?.id ??
        parsed?.user?.user_id ??
        parsed?.user?.userId;

      if (id) {
        const resolvedId = String(id);
        localStorage.setItem("user_id", resolvedId);
        return resolvedId;
      }
    } catch {
      // Ignore non-JSON values.
    }
  }

  // 3. Resolve the user ID from the JWT.
  const token =
    localStorage.getItem("token") ||
    localStorage.getItem("access_token") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("dp_token");

  if (token) {
    const payload = decodeJwtPayload(token);

    console.log("JWT PAYLOAD:", payload);

    const jwtUserId =
      payload?.user_id ??
      payload?.userId ??
      payload?.userID ??
      payload?.id ??
      payload?.sub ??
      payload?.studentId ??
      payload?.student_id ??
      payload?.profileId ??
      payload?.profile_id ??
      payload?.["nameidentifier"] ??
      payload?.["nameIdentifier"] ??
      payload?.[
      "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
      ] ??
      payload?.[
      "http://schemas.microsoft.com/ws/2008/06/identity/claims/nameidentifier"
      ];

    if (jwtUserId) {
      const resolvedId = String(jwtUserId);

      // Cache the resolved ID so future calls do not need to decode JWT again.
      localStorage.setItem("user_id", resolvedId);

      console.log("Resolved User ID from JWT:", resolvedId);
      return resolvedId;
    }
  }

  console.error(
    "USER ID NOT FOUND. Available localStorage keys:",
    Object.keys(localStorage)
  );

  return null;
};

/* =========================================================
   PROGRESS API
========================================================= */

const fetchUserLevelProgress = async ({
  userId,
  levelId,
}) => {
  if (!userId) {
    throw new Error("User ID is required to load progress");
  }

  if (!levelId) {
    throw new Error("Level ID is required to load progress");
  }

  const url = `${API_BASE_URL}/progress/user/${encodeURIComponent(
    userId
  )}/level/${encodeURIComponent(levelId)}`;

  const token = getAuthToken();
  const headers = {
    Accept: "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  console.log("USER LEVEL PROGRESS API URL:", url);

  const response = await fetch(url, {
    method: "GET",
    headers,
  });

  const text = await response.text();
  let data = {};

  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { message: text };
  }

  console.log(
    "USER LEVEL PROGRESS API STATUS:",
    response.status
  );

  console.log(
    "USER LEVEL PROGRESS API RESPONSE:",
    data
  );

  if (response.status === 401) {
    clearAuthTokens();
    throw createHttpError(
      "Your session has expired. Please login again.",
      401
    );
  }

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw createHttpError(
      data?.detail ||
      data?.message ||
      `Progress API failed with status ${response.status}`,
      response.status
    );
  }

  return normalizeProgress(data);
};

const createProgressRecord = async ({
  userId,
  courseId,
  levelId,
  checkpointsPassed = [],
  videoCompleted = false,
  completed = false,
}) => {
  const token =
    localStorage.getItem("dp_token") ||
    localStorage.getItem("access_token") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("token");

  const url = `${API_BASE_URL}/progress`;

  const payload = {
    user_id: userId,
    course_id: courseId,
    level_id: levelId,
    checkpoints_passed: checkpointsPassed,
    video_completed: Boolean(videoCompleted),
    completed: Boolean(completed),
  };

  console.log("=================================");
  console.log("CREATE PROGRESS API");
  console.log("URL:", url);
  console.log("TOKEN EXISTS:", !!token);
  console.log("PAYLOAD:", payload);
  console.log("=================================");

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : {}),
      },
      body: JSON.stringify(payload),
    });

    const text = await response.text();

    let data = null;

    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = text;
    }

    console.log("CREATE PROGRESS STATUS:", response.status);
    console.log("CREATE PROGRESS RESPONSE:", data);

    if (response.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("access_token");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("dp_token");

      throw new Error(
        "Your session has expired. Please login again."
      );
    }

    if (!response.ok) {
      throw new Error(
        data?.detail ||
        data?.message ||
        `Progress API failed with status ${response.status}`
      );
    }

    return data;

  } catch (error) {
    console.error("CREATE PROGRESS ERROR:", error);

    if (error instanceof TypeError) {
      throw new Error(
        "Unable to connect to Progress API. Please check the backend URL/CORS configuration."
      );
    }

    throw error;
  }
};

const updateProgressRecord = async ({
  progressId,
  userId,
  courseId,
  levelId,
  checkpointsPassed = [],
  videoCompleted = false,
  completed = false,
}) => {
  if (!progressId) {
    throw new Error("Progress ID is required to update progress");
  }

  const url = `${API_BASE_URL}/progress/${encodeURIComponent(
    progressId
  )}`;

  const token = getAuthToken();

  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const payload = {
    user_id: userId,
    course_id: courseId,
    level_id: levelId,
    checkpoints_passed: checkpointsPassed,
    video_completed: Boolean(videoCompleted),
    completed: Boolean(completed),
  };

  console.log("=================================");
  console.log("UPDATE PROGRESS API");
  console.log("URL:", url);
  console.log("TOKEN EXISTS:", !!token);
  console.log("PAYLOAD:", payload);
  console.log("=================================");

  const response = await fetch(url, {
    method: "PUT",
    headers,
    body: JSON.stringify(payload),
  });

  const text = await response.text();

  let data = null;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  console.log("UPDATE PROGRESS STATUS:", response.status);
  console.log("UPDATE PROGRESS RESPONSE:", data);

  if (response.status === 401) {
    clearAuthTokens();

    throw createHttpError(
      "Your session has expired. Please login again.",
      401
    );
  }

  if (!response.ok) {
    const detail = Array.isArray(data?.detail)
      ? data.detail
          .map(
            (item) =>
              item?.msg ||
              item?.message ||
              JSON.stringify(item)
          )
          .join(", ")
      : data?.detail || data?.message;

    throw createHttpError(
      detail ||
        `Progress update failed with status ${response.status}`,
      response.status
    );
  }

  return normalizeProgress(data);
};

/* =========================================================
   COMPONENT
========================================================= */

export default function Workspace() {
  const { levelId } = useParams();
  const nav = useNavigate();
  const { refresh } = useAcademyAuth();

  /* =======================================================
     STATE
  ======================================================= */

  const [level, setLevel] = useState(null);

  const [nextLevelId, setNextLevelId] = useState(null);

  const [passed, setPassed] = useState(new Set());

  const [videoDone, setVideoDone] = useState(false);

  const [activeCp, setActiveCp] = useState(null);

  const [mcqAnswers, setMcqAnswers] = useState({});
const [mcqSubmitting, setMcqSubmitting] = useState(false);
const [mcqResult, setMcqResult] = useState(null); 

  const [language, setLanguage] = useState("python");

  const [codeByCp, setCodeByCp] = useState({});

  const [stdin, setStdin] = useState("");

  const [tab, setTab] = useState("tests");

  const [runOut, setRunOut] = useState(null);

  const [results, setResults] = useState(null);

  const [running, setRunning] = useState(false);

  const [submitting, setSubmitting] = useState(false);

  const [currentTime, setCurrentTime] = useState(0);

  const [duration, setDuration] = useState(0);

  const [completedModal, setCompletedModal] = useState(false);

  const [videoError, setVideoError] = useState(false);

  const [busy, setBusy] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [checkpointLoading, setCheckpointLoading] = useState(false);
  const [progressId, setProgressId] = useState(null);

  const videoRef = useRef(null);

  /* =======================================================
     COURSE ID
  ======================================================= */

  const courseId =
    localStorage.getItem("courseId") ||
    localStorage.getItem("course_id") ||
    null;

  /* =======================================================
     CHECKPOINTS
  ======================================================= */

  const handleVideoTimeUpdate = () => {
  const video = videoRef.current;

  if (!video || activeCp) return;

  const currentTime = video.currentTime;

  const checkpoint = checkpoints
    .filter((cp) => !passed.has(cp.id))
    .sort(
      (a, b) =>
        Number(a.at_seconds ?? a.atSeconds ?? 0) -
        Number(b.at_seconds ?? b.atSeconds ?? 0)
    )
    .find((cp) => {
      const checkpointTime = Number(
        cp.at_seconds ??
        cp.atSeconds ??
        0
      );

      return currentTime >= checkpointTime;
    });

  if (checkpoint) {
    video.pause();
    setActiveCp(checkpoint);
  }
};

  const checkpoints = useMemo(() => {
    return (level?.checkpoints || [])
      .slice()
      .sort(
        (a, b) =>
          Number(a.order || 0) - Number(b.order || 0)
      );
  }, [level]);

  const firstUnpassed = useMemo(() => {
    return checkpoints.find(
      (checkpoint) => !passed.has(checkpoint.id)
    );
  }, [checkpoints, passed]);

  const allPassed =
    checkpoints.length > 0 &&
    checkpoints.every((checkpoint) =>
      passed.has(checkpoint.id)
    );

  /* =======================================================
     LOAD LEVEL
  ======================================================= */

  useEffect(() => {
    let mounted = true;

    const loadLevel = async () => {
      try {
        setLevel(null);
        setActiveCp(null);
        setResults(null);
        setRunOut(null);
        setVideoError(false);
        setCurrentTime(0);
        setDuration(0);

        console.log("Loading level:", levelId);

        const d = await api.level(levelId);

        console.log("LEVEL API RESPONSE:", d);

        if (!mounted) return;

        setLevel(d);

        /* ---------------------------------------------------
           Next Level
        --------------------------------------------------- */

        setNextLevelId(
          d?.nextLevelId ||
          d?.next_level_id ||
          null
        );

        /* ---------------------------------------------------
           CHECKPOINTS FIRST
           GET /api/checkpoints
        --------------------------------------------------- */

        setCheckpointLoading(true);

        let checkpointList = [];

        try {
          checkpointList = await fetchCheckpoints({
            levelId,
            language,
          });

          if (!mounted) return;

          console.log(
            "CHECKPOINTS LOADED:",
            checkpointList
          );
        } catch (checkpointError) {
          console.error(
            "CHECKPOINTS API ERROR:",
            checkpointError
          );

          if (!mounted) return;

          // Do not continue to Progress API after an expired session.
          if (checkpointError?.status === 401) {
            toast.error(
              "Your session has expired. Please login again."
            );
            nav("/login", { replace: true });
            return;
          }

          // Keep level API checkpoints only as a non-auth fallback.
          checkpointList = Array.isArray(d?.checkpoints)
            ? d.checkpoints.map(normalizeCheckpoint)
            : [];

          toast.error(
            checkpointError?.message ||
            "Unable to load checkpoints"
          );
        } finally {
          if (mounted) {
            setCheckpointLoading(false);
          }
        }

        if (!mounted) return;

        const levelWithCheckpoints = {
          ...d,
          checkpoints: checkpointList,
        };

        setLevel(levelWithCheckpoints);

        /* ---------------------------------------------------
           PROGRESS SECOND
           GET /api/progress/user/{user_id}/level/{level_id}
        --------------------------------------------------- */

        const userId = getStoredUserId();

        if (!userId) {
          console.warn(
            "Progress API skipped: user ID not found"
          );

          setProgressId(null);
          setPassed(new Set());
          setVideoDone(false);
        } else {
          try {
            const progress =
              await fetchUserLevelProgress({
                userId,
                levelId,
              });

            if (!mounted) return;

            const loadedProgressId =
              getProgressId(progress);

            setProgressId(loadedProgressId);

            const passedIds =
              getPassedCheckpointIds(progress);

            setPassed(new Set(passedIds));
            setVideoDone(
              getVideoCompleted(progress)
            );

            console.log(
              "USER LEVEL PROGRESS LOADED:",
              progress
            );

            console.log(
              "PROGRESS ID:",
              loadedProgressId
            );
          } catch (progressError) {
            console.error(
              "USER LEVEL PROGRESS API ERROR:",
              progressError
            );

            if (!mounted) return;

            if (progressError?.status === 401) {
              toast.error(
                "Your session has expired. Please login again."
              );
              nav("/login", { replace: true });
              return;
            }

            // 404 means this user has no progress record yet.
            // Save Progress will create it with POST /api/progress.
            if (progressError?.status === 404) {
              setProgressId(null);
              setPassed(new Set());
              setVideoDone(false);
            } else {
              toast.error(
                progressError?.message ||
                "Unable to load your progress"
              );
            }
          }
        }

        console.log(
          "Level loaded successfully:",
          d
        );
      } catch (error) {
        console.error(
          "LEVEL API ERROR:",
          error
        );

        console.error(
          "LEVEL API RESPONSE:",
          error?.response?.data
        );

        if (!mounted) return;

        const detail = error?.response?.data?.detail;

        const errorMessage = Array.isArray(detail)
          ? detail
            .map(
              (item) =>
                item?.msg ||
                item?.message ||
                JSON.stringify(item)
            )
            .join(", ")
          : typeof detail === "string"
            ? detail
            : error?.response?.data?.message ||
            error?.message ||
            "Cannot open level";

        toast.error(errorMessage);

        nav("/skillhub", {
          replace: true,
        });
      }
    };

    if (levelId) {
      loadLevel();
    }

    return () => {
      mounted = false;
    };
  }, [levelId, nav]);

  /* =======================================================
     REFRESH CHECKPOINTS WHEN LANGUAGE CHANGES
  ======================================================= */

  useEffect(() => {
    if (!levelId || !level) return;

    let mounted = true;

    const reloadCheckpoints = async () => {
      setCheckpointLoading(true);

      try {
        const checkpointList = await fetchCheckpoints({
          levelId,
          language,
        });

        if (!mounted) return;

        setLevel((previous) =>
          previous
            ? {
              ...previous,
              checkpoints: checkpointList,
            }
            : previous
        );

        setActiveCp(null);
        setResults(null);
        setRunOut(null);

        console.log(
          "CHECKPOINTS RELOADED FOR LANGUAGE:",
          language,
          checkpointList
        );
      } catch (error) {
        console.error(
          "CHECKPOINT LANGUAGE API ERROR:",
          error
        );

        if (mounted) {
          if (error?.status === 401) {
            toast.error(
              "Your session has expired. Please login again."
            );
            nav("/login", { replace: true });
          } else {
            toast.error(
              error?.message ||
              "Unable to load checkpoints for this language"
            );
          }
        }
      } finally {
        if (mounted) {
          setCheckpointLoading(false);
        }
      }
    };

    // The initial level load already fetches Python checkpoints.
    // Fetch again only when the selected language changes.
    if (language !== "python") {
      reloadCheckpoints();
    }

    return () => {
      mounted = false;
    };
  }, [language, levelId, nav]);

  /* =======================================================
     ACTIVE CODE
  ======================================================= */

  const activeCode = activeCp
    ? codeByCp[activeCp.id] ??
    activeCp.starterCode?.[language] ??
    ""
    : codeByCp.__scratch ?? "";

  const setActiveCode = (code) => {
  const newCode =
    typeof code === "string"
      ? code
      : code?.target?.value ?? "";

  setCodeByCp((previous) => ({
    ...previous,
    [activeCp ? activeCp.id : "__scratch"]: newCode,
  }));
};

  /* =======================================================
     PROGRESS API
  ======================================================= */

  const saveProgressRecord = async ({
    userId,
    courseId,
    levelId,
    checkpointsPassed,
    videoCompleted,
    completed,
  }) => {
    if (progressId) {
  const updated = await updateProgressRecord({
    progressId,
    userId,
    courseId,
    levelId,
    checkpointsPassed,
    videoCompleted,
    completed,
  });

      const updatedId = getProgressId(updated);

      if (updatedId) {
        setProgressId(updatedId);
      }

      return updated;
    }

    const created = await createProgressRecord({
      userId,
      courseId,
      levelId,
      checkpointsPassed,
      videoCompleted,
      completed,
    });

    let createdId = getProgressId(created);

    // Some backends return 201 without the full progress object.
    // Fetch it once so the next Save uses PUT instead of POST.
    if (!createdId) {
      const loaded = await fetchUserLevelProgress({
        userId,
        levelId,
      });

      createdId = getProgressId(loaded);
    }

    if (createdId) {
      setProgressId(createdId);
    }

    return created || null;
  };

  /* =======================================================
     PAUSE + SAVE PROGRESS

     Pause does two things:
     1. Pauses the lesson video.
     2. Creates or updates the user's progress record.

     API flow:
     GET  /api/progress/user/{user_id}/level/{level_id}
     POST /api/progress              -> first pause / no record
     PUT  /api/progress/{progress_id} -> later pauses
  ======================================================= */

  const pauseProgress = async () => {
    const userId =
      getStoredUserId();

    const currentCourseId =
      courseId ||
      level?.courseId ||
      level?.course_id ||
      level?.course?.id ||
      localStorage.getItem("courseId") ||
      localStorage.getItem("course_id") ||
      null;

    console.log(
      "=============================="
    );

    console.log(
      "Progress Debug:"
    );

    console.log({
      userId,
      courseId: currentCourseId,
      levelId,
      checkpointsPassed:
        checkpoints.map((checkpoint) =>
          String(checkpoint.id)
        ),
      videoCompleted: videoDone,
    });

    console.log(
      "Available localStorage keys:",
      Object.keys(localStorage)
    );

    console.log(
      "=============================="
    );

    /* ---------------------------------------------------
       Validate User ID
    --------------------------------------------------- */

    if (!userId) {
      toast.error(
        "User ID not found. Please login again."
      );

      console.error(
        "User ID missing. Available localStorage:",
        Object.keys(localStorage)
      );

      return;
    }

    /* ---------------------------------------------------
       Validate Course ID
    --------------------------------------------------- */

    if (!currentCourseId) {
      toast.error(
        "Course ID not found."
      );

      return;
    }

    /* ---------------------------------------------------
       Validate Level ID
    --------------------------------------------------- */

    if (!levelId) {
      toast.error(
        "Level ID not found."
      );

      return;
    }

    try {
      setBusy(true);

     const passedCheckpointIds = checkpoints
  .filter((checkpoint) =>
    passed.has(String(checkpoint.id))
  )
  .map((checkpoint) =>
    String(checkpoint.id)
  );

      const data =
        await saveProgressRecord({
          userId,
          courseId: currentCourseId,
          levelId,
          checkpointsPassed: passedCheckpointIds,
          videoCompleted: videoDone,
          completed: videoDone && allPassed,
        });

      console.log(
        "Progress saved successfully:",
        data
      );

      // Keep the video paused after the progress request succeeds.
      videoRef.current?.pause();

      toast.success(
        progressId
          ? "Progress paused and updated successfully"
          : "Progress paused and created successfully"
      );
    } catch (error) {
      console.error(
        "Progress save failed:",
        error
      );

      toast.error(
        error?.message ||
        "Failed to pause and save progress"
      );
    } finally {
      setBusy(false);
    }
  };
  // video


  /* =======================================================
     INITIALIZE CODE
  ======================================================= */

  useEffect(() => {
    if (
      activeCp &&
      codeByCp[activeCp.id] ===
      undefined
    ) {
      setCodeByCp((previous) => ({
        ...previous,
        [activeCp.id]:
          activeCp.starterCode?.[
          language
          ] ?? "",
      }));
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCp, language]);

  /* =======================================================
     VIDEO TIME
  ======================================================= */

  const allowedTime = firstUnpassed
    ? Number(
      firstUnpassed.atSeconds || 0
    )
    : duration || Infinity;

  const onTimeUpdate = () => {
    const video =
      videoRef.current;

    if (!video) return;

    const time =
      video.currentTime;

    setCurrentTime(time);

    /* ---------------------------------------------------
       Unlock checkpoint
    --------------------------------------------------- */

    if (
      firstUnpassed &&
      time >=
      Number(
        firstUnpassed.atSeconds || 0
      ) - 0.15 &&
      !activeCp
    ) {
      video.pause();

      video.currentTime =
        Math.min(
          Number(
            firstUnpassed.atSeconds ||
            0
          ),
          video.duration ||
          Number(
            firstUnpassed.atSeconds ||
            0
          )
        );

      openCheckpoint(
        firstUnpassed
      );

      return;
    }

    /* ---------------------------------------------------
       Prevent skipping ahead
    --------------------------------------------------- */

    if (
      time >
      allowedTime + 0.4
    ) {
      video.currentTime =
        allowedTime;
    }
  };

  /* =======================================================
     OPEN CHECKPOINT
  ======================================================= */

  const openCheckpoint = (
    checkpoint
  ) => {
    setActiveCp(
      checkpoint
    );

    setResults(null);
    setRunOut(null);
    setTab("tests");

    setCodeByCp(
      (previous) => {
        if (
          previous[
          checkpoint.id
          ] !== undefined
        ) {
          return previous;
        }

        return {
          ...previous,
          [checkpoint.id]:
            checkpoint
              .starterCode?.[
            language
            ] ?? "",
        };
      }
    );

    toast.info(
      `Checkpoint ${checkpoint.order}: ${checkpoint.title} — solve to continue`
    );
  };

  /* =======================================================
     VIDEO COMPLETION
  ======================================================= */

  const onEnded = async () => {
  if (!allPassed || videoDone) {
    return;
  }

  try {
    const response = await api.videoComplete(levelId);

    console.log("VIDEO COMPLETE RESPONSE:", response);

    setVideoDone(true);

    /*
     * Save final progress
     */
    const userId = getStoredUserId();

    const currentCourseId =
      courseId ||
      level?.courseId ||
      level?.course_id ||
      level?.course?.id ||
      localStorage.getItem("courseId") ||
      localStorage.getItem("course_id");

    await saveProgressRecord({
      userId,
      courseId: currentCourseId,
      levelId,
      checkpointsPassed: checkpoints.map((checkpoint) =>
        String(checkpoint.id)
      ),
      videoCompleted: true,
      completed: true,
    });

    if (response?.levelCompleted === true) {
      setCompletedModal(true);
      refresh();
    }

  } catch (error) {
    console.error(
      "Video completion failed:",
      error
    );

    toast.error(
      "Unable to complete the level"
    );
  }
};

const finishVideoManually = async () => {
  try {
    const response =
      await api.videoComplete(levelId);

    console.log(
      "VIDEO COMPLETE RESPONSE:",
      response
    );

    const data =
      response?.data ?? response;

    const levelCompleted =
      data?.level_completed === true ||
      data?.levelCompleted === true;

    if (levelCompleted) {
      setVideoDone(true);
      setCompletedModal(true);

      refresh();
    } else {
      toast.error(
        "Level could not be completed"
      );
    }

  } catch (error) {
    console.error(
      "Manual video completion failed:",
      error
    );

   const detail = error?.response?.data?.detail;

const errorMessage =
  Array.isArray(detail)
    ? detail
        .map((item) => item?.msg || JSON.stringify(item))
        .join(", ")
    : typeof detail === "object"
      ? detail?.msg || JSON.stringify(detail)
      : detail ||
        error?.response?.data?.message ||
        error?.message ||
        "Could not complete level";

toast.error(errorMessage);
  }
};
  /* =======================================================
     MANUAL VIDEO COMPLETE
  ======================================================= */
 const toggleVideoPlayback = () => {
  const video = videoRef.current;

  if (!video) return;

  // Don't allow video to play when checkpoint is active
  if (activeCp) {
    toast.info(
      `Complete Checkpoint ${activeCp.order} to continue`
    );
    return;
  }

  if (video.paused) {
    video.play();
  } else {
    video.pause();
  }
};

  /* =======================================================
     RUN CODE
  ======================================================= */

  const runCode = async () => {
  if (!activeCp) {
    toast.error("Watch the video to unlock a challenge");
    return;
  }

  setRunning(true);
  setTab("output");
  setRunOut(null);

  try {
    const response = await api.execute(
      activeCp.id,
      language,
      activeCode,
      stdin
    );

    console.log("RUN RESPONSE:", response);

    const data = response?.data ?? response;

    // Get actual output from test results
    const results = data?.results || [];

    const actualOutput = results
      .map((result) => result.actual_output)
      .filter((output) => output !== null && output !== undefined)
      .join("\n");

    const errors = results
      .map((result) => result.error)
      .filter(Boolean)
      .join("\n");

    setRunOut({
      stdout: actualOutput,
      stderr: errors,
      exit_code: errors ? 1 : 0,
      time_ms: data?.time_ms || 0,
    });

  } catch (error) {
    console.error("Run failed:", error);

    setRunOut({
      stdout: "",
      stderr:
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        "Unable to execute the code.",
      exit_code: 1,
      time_ms: 0,
    });

  } finally {
    setRunning(false);
  }
};

  /* =======================================================
     SUBMIT
  ======================================================= */

const submit = async () => {
  if (!activeCp) {
    toast.error("Open a checkpoint before submitting");
    return;
  }

  setSubmitting(true);

  try {
    const response = await api.submit(
      activeCp.id,
      language,
      activeCode
    );

    console.log("FULL SUBMIT RESPONSE:", response);

    // Support both direct response and wrapped response
    const data = response?.data ?? response;

    console.log("ACTUAL SUBMIT DATA:", data);

    const passedTests = Number(
      data?.passed_tests ??
      data?.passedTests ??
      0
    );

    const totalTests = Number(
      data?.total_tests ??
      data?.totalTests ??
      0
    );

    const checkpointCompleted =
      data?.checkpoint_completed === true ||
      data?.checkpointCompleted === true;

    const levelCompleted =
      data?.level_completed === true ||
      data?.levelCompleted === true;

    const xpEarned = Number(
      data?.xp_earned ??
      data?.xpEarned ??
      0
    );

    // Show test result
    setResults(data);
    setTab("tests");

    // ==========================================
    // FAILED
    // ==========================================

    if (!checkpointCompleted) {
      toast.error(
        `${passedTests}/${totalTests} test cases passed. Keep trying!`
      );

      return;
    }

    // ==========================================
    // CHECKPOINT PASSED
    // ==========================================

    const completedCheckpointId =
      String(activeCp.id);

    const newPassed = new Set(
      Array.from(passed).map(String)
    );

    newPassed.add(completedCheckpointId);

    const doneAll = checkpoints.every(
      (checkpoint) =>
        newPassed.has(String(checkpoint.id))
    );

    // ==========================================
    // SAVE PROGRESS
    // ==========================================

    const userId = getStoredUserId();

    const currentCourseId =
      courseId ||
      level?.courseId ||
      level?.course_id ||
      level?.course?.id ||
      localStorage.getItem("courseId") ||
      localStorage.getItem("course_id");

    await saveProgressRecord({
      userId,
      courseId: currentCourseId,
      levelId,
      checkpointsPassed:
        Array.from(newPassed),
      videoCompleted: videoDone,
      completed:
        videoDone && doneAll,
    });

    // ==========================================
    // UPDATE UI
    // ==========================================

    setPassed(newPassed);

    toast.success(
      `Checkpoint solved! +${xpEarned} XP`
    );

    // Remove checkpoint lock
    setActiveCp(null);

    // Remove old output/result
    setRunOut(null);

    // ==========================================
    // LEVEL COMPLETED
    // ==========================================

    if (levelCompleted) {
      setVideoDone(true);
      setCompletedModal(true);

      refresh();

      return;
    }

    // ==========================================
    // ALL CHECKPOINTS COMPLETED
    // ==========================================

    if (doneAll) {
      toast.info(
        "All challenges solved! Finish the video to complete the level."
      );

      // Try to continue video
      setTimeout(() => {
        const video = videoRef.current;

        if (video) {
          video.play().catch((error) => {
            console.warn(
              "Video autoplay blocked:",
              error
            );
          });
        }
      }, 300);

      return;
    }

    // ==========================================
    // CONTINUE TO NEXT CHECKPOINT
    // ==========================================

    setTimeout(() => {
      const video = videoRef.current;

      if (video) {
        video.play().catch((error) => {
          console.warn(
            "Video autoplay blocked:",
            error
          );
        });
      }
    }, 300);

  } catch (error) {
    console.error(
      "Submission failed:",
      error
    );

    console.error(
      "Submission response:",
      error?.response?.data
    );

    toast.error(
      error?.response?.data?.detail ||
      error?.response?.data?.message ||
      error?.message ||
      "Submission failed"
    );

  } finally {
    setSubmitting(false);
  }
};
  /* =======================================================
     LOADING
  ======================================================= */

  if (!level) {
    return (
      <div className="grid h-screen place-items-center bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />

          <p className="text-sm text-slate-400">
            Loading level...
          </p>
        </div>
      </div>
    );
  }

  /* =======================================================
     THEORY
  ======================================================= */

  
const theory = level.theory || {};

const mcqs = theory.introduction_mcqs || [];

const learningObjectives = Array.isArray(
  theory.learning_objectives
)
  ? theory.learning_objectives
  : theory.learning_objectives
    ? [theory.learning_objectives]
    : [];

const bestPractices = Array.isArray(
  theory.best_practices
)
  ? theory.best_practices
  : theory.best_practices
    ? [theory.best_practices]
    : [];

const commonMistakes = Array.isArray(
  theory.common_mistakes
)
  ? theory.common_mistakes
  : theory.common_mistakes
    ? [theory.common_mistakes]
    : [];

  /* =======================================================
     VIDEO URL
  ======================================================= */

  const videoUrl =
    level.video?.url?.startsWith(
      "http"
    )
      ? level.video.url
      : `${import.meta.env
        .VITE_BACKEND_URL ||
      import.meta.env
        .VITE_API_BASE_URL ||
      ""
      }${level.video?.url ||
      ""
      }`;

      const hasVideo = Boolean(
  level.video?.url &&
  level.video.url.trim()
);


const submitMcqs = async () => {
  if (!mcqs.length) {
    toast.error("No questions available for this level.");
    return;
  }

  const unanswered = mcqs.some(
    (_, index) => !mcqAnswers[index]
  );

  if (unanswered) {
    toast.error("Please answer all questions.");
    return;
  }

  setMcqSubmitting(true);

  try {
    let correctCount = 0;
    const questionResults = [];

    for (let index = 0; index < mcqs.length; index++) {
      const mcq = mcqs[index];
      const selectedOption = mcqAnswers[index];

      const response = await api.introductionMcqSubmit({
        level_id: levelId,
        question_index: index,
        selected_option: selectedOption,
      });

      console.log(
        `MCQ ${index + 1} response:`,
        response
      );

      // Backend result if available
      const hasServerResult =
        typeof response?.correct === "boolean" ||
        typeof response?.is_correct === "boolean" ||
        typeof response?.correct_option === "string";

      const correctOption =
        response?.correct_option ||
        mcq.correct_option;

      const isCorrect = hasServerResult
        ? (
            response?.correct === true ||
            response?.is_correct === true ||
            response?.correct_option === selectedOption
          )
        : selectedOption === correctOption;

      if (isCorrect) {
        correctCount++;
      }

      questionResults.push({
        questionIndex: index,
        selectedOption,
        correctOption,
        isCorrect,
      });
    }

    const passed = correctCount === mcqs.length;

    setMcqResult({
      correct: correctCount,
      total: mcqs.length,
      passed,
      details: questionResults,
    });

    if (!passed) {
      toast.error(
        `${correctCount}/${mcqs.length} correct. Check the wrong answers below.`
      );
      return;
    }

    const userId = getStoredUserId();

    const currentCourseId =
      courseId ||
      level?.courseId ||
      level?.course_id ||
      level?.course?.id ||
      localStorage.getItem("courseId") ||
      localStorage.getItem("course_id");

    await saveProgressRecord({
      userId,
      courseId: currentCourseId,
      levelId,
      checkpointsPassed: [],
      videoCompleted: false,
      completed: true,
    });

    toast.success(
      `All questions correct! +${level.xp || 0} XP`
    );

    setCompletedModal(true);
    refresh();

  } catch (error) {
    console.error(
      "MCQ submission failed:",
      error
    );

    toast.error(
      error?.response?.data?.detail ||
      error?.response?.data?.message ||
      error?.message ||
      "Failed to submit MCQ"
    );
  } finally {
    setMcqSubmitting(false);
  }
};
  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">

      {/* ==================================================
          TOP BAR
      ================================================== */}

      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-white/5 bg-slate-950/90 px-5 py-3 backdrop-blur-xl">

        <button
          onClick={() =>
            nav(-1)
          }
          className="flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-white"
          data-testid="workspace-back"
        >
          <ArrowLeft className="h-4 w-4" />

          Journey
        </button>

        <div className="text-center">

          <p className="text-xs text-slate-500">
            {level.stage} · Level{" "}
            {level.levelNumber ??
              level.level_number}
          </p>

          <p className="text-sm font-bold text-white">
            {level.title}
          </p>

        </div>

        <div className="flex items-center gap-1.5">

          {checkpoints.map(
            (checkpoint) => (
              <span
                key={
                  checkpoint.id
                }
                title={
                  checkpoint.title
                }
                className={`
                  h-2.5 w-8 rounded-full
                  ${passed.has(
                  checkpoint.id
                )
                    ? "bg-emerald-400"
                    : activeCp?.id ===
                      checkpoint.id
                      ? "bg-cyan-400"
                      : "bg-white/10"
                  }
                `}
              />
            )
          )}

        </div>

      </header>

      {/* ==================================================
          MAIN
      ================================================== */}

      <div className="grid gap-4 p-4 lg:grid-cols-2">

       {/* ==================================================
    LEFT
================================================== */}

<div className="space-y-4">

  {/* ==================================================
      VIDEO / INTRODUCTION
  ================================================== */}

  {hasVideo ? (

    <div className="overflow-hidden rounded-2xl border border-white/5 bg-black">

      <div className="relative">

        <video
          ref={videoRef}
          src={videoUrl}
          poster={level.video?.thumbnail}
          controls
          onTimeUpdate={onTimeUpdate}
          onLoadedMetadata={(event) =>
            setDuration(event.target.duration || 0)
          }
          onSeeking={onTimeUpdate}
          onPlay={(event) => {
            setIsPlaying(true);

            if (activeCp) {
              event.target.pause();
            }
          }}
          onPause={() => {
            setIsPlaying(false);
          }}
          onEnded={(event) => {
            setIsPlaying(false);
            onEnded(event);
          }}
          onError={() => setVideoError(true)}
          className="aspect-video w-full bg-black"
          data-testid="lesson-video"
        />

        {/* VIDEO ERROR */}

        <AnimatePresence>
          {videoError && !activeCp && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 grid place-items-center bg-slate-900/95 p-6 text-center"
            >
              <div>

                <p className="text-sm text-slate-300">
                  Video couldn't load right now.
                </p>

                {firstUnpassed ? (

                  <button
                    onClick={() =>
                      openCheckpoint(firstUnpassed)
                    }
                    className="mt-4 rounded-full bg-gradient-to-r from-cyan-500 to-violet-500 px-5 py-2.5 text-sm font-bold text-white"
                  >
                    Start Checkpoint{" "}
                    {firstUnpassed.order}
                  </button>

                ) : !videoDone ? (

                  <button
                    onClick={finishVideoManually}
                    className="mt-4 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 px-5 py-2.5 text-sm font-bold text-white"
                  >
                    Complete Level
                  </button>

                ) : (

                  <p className="mt-3 text-emerald-400">
                    Level complete!
                  </p>

                )}

              </div>
            </motion.div>
          )}
        </AnimatePresence>


        {/* CHECKPOINT LOCK */}

        <AnimatePresence>
          {activeCp && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-20 grid place-items-center bg-slate-950/85 backdrop-blur-sm"
            >
              <div className="text-center">

                <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-cyan-400 to-violet-500 text-white shadow-lg">
                  <Lock className="h-8 w-8" />
                </span>

                <p className="mt-5 text-2xl font-bold text-white">
                  Checkpoint{" "}
                  {activeCp.checkpoint_order ??
                    activeCp.order ??
                    1}
                </p>

                <p className="mt-2 text-base text-slate-300">
                  Solve the challenge on the right to continue →
                </p>

              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>


      {/* VIDEO TIMELINE */}

      <div className="relative h-8 bg-slate-900 px-3">

        <div className="relative top-3 h-1.5 w-full rounded-full bg-white/10">

          <div
            className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-cyan-400 to-violet-500"
            style={{
              width: `${
                duration
                  ? Math.min(
                      100,
                      (currentTime / duration) * 100
                    )
                  : 0
              }%`,
            }}
          />

          {checkpoints.map((checkpoint) => (
            <span
              key={checkpoint.id}
              title={`${fmt(
                checkpoint.atSeconds
              )} · ${checkpoint.title}`}
              className={`
                absolute -top-1 grid h-3.5 w-3.5
                -translate-x-1/2 place-items-center
                rounded-full border-2 border-slate-900
                ${
                  passed.has(checkpoint.id)
                    ? "bg-emerald-400"
                    : "bg-amber-400"
                }
              `}
              style={{
                left: `${
                  duration
                    ? Math.min(
                        100,
                        (Number(
                          checkpoint.atSeconds || 0
                        ) / duration) * 100
                      )
                    : 0
                }%`,
              }}
            />
          ))}

        </div>

      </div>

    </div>

  ) : (

    /* ==================================================
       NO VIDEO - INTRODUCTION ONLY
    ================================================== */

    <div className="rounded-2xl border border-cyan-400/10 bg-gradient-to-br from-cyan-400/[0.06] to-violet-500/[0.06] p-6">

      <div className="flex items-center gap-3">

        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-cyan-400/10">
          <BookOpen className="h-6 w-6 text-cyan-400" />
        </div>

        <div>

          <p className="text-xs font-bold uppercase tracking-wider text-cyan-400">
            Introduction
          </p>

          <h2 className="mt-1 text-xl font-black text-white">
            {level.title}
          </h2>

        </div>

      </div>

      <p className="mt-5 text-sm leading-7 text-slate-300">
        {level.description ||
          "Read the concepts carefully before answering the questions."}
      </p>

    </div>

  )}


  {/* ==================================================
      THEORY & CONCEPTS
  ================================================== */}

  <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-6">

    <h3 className="flex items-center gap-2 text-lg font-bold text-white">

      <BookOpen className="h-5 w-5 text-cyan-400" />

      Theory & Concepts

    </h3>


    <div className="mt-4 space-y-5 text-sm leading-relaxed">


      {/* LEARNING OBJECTIVES */}

      {learningObjectives.length > 0 && (
        <div>

          <p className="mb-2 font-semibold text-slate-300">
            Learning Objectives
          </p>

          <ul className="space-y-1.5">

            {learningObjectives.map(
              (objective, index) => (
                <li
                  key={index}
                  className="flex items-start gap-2 text-slate-400"
                >

                  <Target className="mt-0.5 h-3.5 w-3.5 shrink-0 text-cyan-400" />

                  <span>
                    {objective}
                  </span>

                </li>
              )
            )}

          </ul>

        </div>
      )}


      {/* EXPLANATION */}

      {theory.explanation && (
        <p className="whitespace-pre-line text-slate-400">
          {theory.explanation}
        </p>
      )}


      {/* CODE EXAMPLES */}

      {(
        theory.codeExamples ||
        theory.code_examples ||
        []
      ).map((example, index) => (

        <div key={example.title || index}>

          {example.title && (
            <p className="mb-1.5 font-semibold text-slate-300">
              {example.title}
            </p>
          )}

          {example.code && (
            <pre className="overflow-x-auto rounded-xl border border-white/5 bg-slate-950 p-3 text-xs text-cyan-200">
              <code>
                {example.code}
              </code>
            </pre>
          )}

        </div>

      ))}


      {/* BEST PRACTICES + COMMON MISTAKES */}

      <div className="grid gap-4 sm:grid-cols-2">


        {/* BEST PRACTICES */}

        {bestPractices.length > 0 && (
          <div>

            <p className="mb-2 flex items-center gap-1.5 font-semibold text-emerald-400">

              <ListChecks className="h-4 w-4" />

              Best Practices

            </p>

            <ul className="space-y-1 text-slate-400">

              {bestPractices.map(
                (practice, index) => (
                  <li key={index}>
                    • {practice}
                  </li>
                )
              )}

            </ul>

          </div>
        )}


        {/* COMMON MISTAKES */}

        {commonMistakes.length > 0 && (
          <div>

            <p className="mb-2 flex items-center gap-1.5 font-semibold text-amber-400">

              <AlertTriangle className="h-4 w-4" />

              Common Mistakes

            </p>

            <ul className="space-y-1 text-slate-400">

              {commonMistakes.map(
                (mistake, index) => (
                  <li key={index}>
                    • {mistake}
                  </li>
                )
              )}

            </ul>

          </div>
        )}

      </div>

    </div>

  </div>

</div>

        {/* ==================================================
            RIGHT
        ================================================== */}

        <div className="space-y-4">

   {hasVideo ? (
    <>
      {/* ==================================================
          CHALLENGE
      ================================================== */}

      <div
        className={`
          rounded-2xl border p-6 transition-colors
          ${
            activeCp
              ? "border-cyan-400/40 bg-cyan-400/[0.06]"
              : "border-white/5 bg-white/[0.03]"
          }
        `}
        data-testid="challenge-panel"
      >

        {checkpointLoading ? (
          <div className="flex min-h-36 flex-col items-center justify-center gap-3 py-8 text-center">

            <Loader2 className="h-7 w-7 animate-spin text-cyan-400" />

            <p className="text-sm font-semibold text-white">
              Loading checkpoints...
            </p>

            <p className="text-xs text-slate-500">
              Fetching challenges for this level.
            </p>

          </div>
        ) : activeCp ? (

          <>
            <div className="flex items-center justify-between">

              <span className="rounded-full bg-gradient-to-r from-cyan-500 to-violet-500 px-3 py-1 text-xs font-bold text-white">
                Checkpoint{" "}
                {activeCp.order}{" "}
                ·{" "}
                {activeCp.difficulty}
              </span>

              <span className="flex items-center gap-1 text-xs font-bold text-cyan-400">

                <Zap className="h-3.5 w-3.5 fill-current" />

                {activeCp.xp} XP

              </span>

            </div>

            <h3 className="mt-3 text-lg font-bold text-white">
              {activeCp.title}
            </h3>

            <p className="mt-1 text-sm italic text-slate-400">
              {activeCp.scenario}
            </p>

            <p className="mt-3 whitespace-pre-line text-sm text-slate-300">
              {activeCp.problemStatement}
            </p>

            {activeCp.hints?.length > 0 && (
              <details className="mt-3">

                <summary className="cursor-pointer text-xs font-semibold text-amber-400">

                  <Lightbulb className="mr-1 inline h-3.5 w-3.5" />

                  Hints

                </summary>

                <ul className="mt-2 space-y-1 text-xs text-slate-400">

                  {activeCp.hints.map((hint) => (
                    <li key={hint}>
                      • {hint}
                    </li>
                  ))}

                </ul>

              </details>
            )}

          </>

        ) : (

          <div className="py-4 text-center">

            <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-white/5 text-slate-400">

              <Play className="h-6 w-6" />

            </span>

            <p className="mt-3 font-semibold text-white">

              {allPassed
                ? "All challenges solved 🎉"
                : "Watch the video to unlock challenges"}

            </p>

            <p className="mt-1 text-sm text-slate-400">

              {allPassed
                ? videoDone
                  ? "Level complete!"
                  : "Finish the video to complete this level."
                : `A coding challenge appears at each checkpoint (${checkpoints
                    .map((checkpoint) =>
                      fmt(checkpoint.atSeconds)
                    )
                    .join(", ")}). Use the editor below to experiment.`}

            </p>

          </div>

        )}

      </div>


      {/* ==================================================
          CODING WORKSPACE
      ================================================== */}

      <div className="overflow-hidden rounded-2xl border border-white/5 bg-slate-900">

        {/* HEADER */}

        <div className="flex items-center justify-between border-b border-white/5 px-4 py-2.5">

          <div className="flex items-center gap-2">

            <Terminal className="h-4 w-4 text-cyan-400" />

            <select
              value={language}
              onChange={(event) =>
                setLanguage(event.target.value)
              }
              data-testid="language-select"
              className="rounded-lg border border-white/10 bg-slate-950 px-2.5 py-1.5 text-xs font-semibold text-white outline-none"
            >

              {LANGS.map((lang) => (
                <option
                  key={lang.id}
                  value={lang.id}
                  disabled={lang.id === "java"}
                >
                  {lang.label}
                </option>
              ))}

            </select>

          </div>


          {/* RUN / SUBMIT */}

          <div className="flex items-center gap-2">

            <button
              onClick={runCode}
              disabled={running}
              data-testid="run-btn"
              className="flex items-center gap-1.5 rounded-lg border border-white/10 px-3.5 py-1.5 text-xs font-semibold text-slate-200 transition-colors hover:bg-white/10 disabled:opacity-60"
            >

              {running ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Play className="h-3.5 w-3.5" />
              )}

              Run

            </button>


            <button
              onClick={submit}
              disabled={
                submitting ||
                !activeCp
              }
              data-testid="submit-btn"
              className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-violet-500 px-4 py-1.5 text-xs font-bold text-white transition-transform hover:scale-105 disabled:opacity-50"
            >

              {submitting ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <CheckCircle2 className="h-3.5 w-3.5" />
              )}

              Submit

            </button>

          </div>

        </div>


        {/* CODE EDITOR */}

        <div className="h-[300px]">

          <CodeEditor
            language={language}
            value={activeCode}
            onChange={setActiveCode}
          />

        </div>


        {/* CONSOLE */}

        <div className="border-t border-white/5">

          <div className="flex items-center gap-1 px-3 pt-2">

            {[
              "tests",
              "output",
            ].map((type) => (

              <button
                key={type}
                onClick={() =>
                  setTab(type)
                }
                className={`
                  rounded-t-lg px-3 py-1.5
                  text-xs font-semibold capitalize
                  ${
                    tab === type
                      ? "bg-slate-950 text-white"
                      : "text-slate-400"
                  }
                `}
              >

                {type === "tests"
                  ? "Test Cases"
                  : "Output"}

              </button>

            ))}

          </div>


          <div className="max-h-52 overflow-auto bg-slate-950 p-4 text-xs">

            {tab === "output" ? (

              <div>

                <div className="mb-2">

                  <label className="text-slate-500">
                    Custom Input (stdin)
                  </label>

                  <textarea
                    value={stdin}
                    onChange={(event) =>
                      setStdin(event.target.value)
                    }
                    rows={2}
                    placeholder="Type input for Run..."
                    className="mt-1 w-full rounded-lg border border-white/10 bg-slate-900 p-2 font-mono text-slate-200 outline-none"
                  />

                </div>


                {runOut ? (

                  <>

                    {runOut.stdout && (
                      <pre className="whitespace-pre-wrap text-emerald-300">
                        {runOut.stdout}
                      </pre>
                    )}

                    {runOut.stderr && (
                      <pre className="whitespace-pre-wrap text-rose-400">
                        {runOut.stderr}
                      </pre>
                    )}

                    <p className="mt-1 text-slate-500">
                      Exit {runOut.exit_code} · {runOut.time_ms} ms
                    </p>

                  </>

                ) : (

                  <p className="text-slate-500">
                    Press Run to execute your code.
                  </p>

                )}

              </div>

            ) : (

              <div className="space-y-2">

                {activeCp?.visibleTestCases?.map(
                  (testCase, index) => {

                    const result =
                      results?.results?.find(
                        (item) =>
                          item.index === index
                      );

                    return (

                      <div
                        key={index}
                        className={`
                          rounded-lg border p-2.5
                          ${
                            result
                              ? result.passed
                                ? "border-emerald-500/40 bg-emerald-500/5"
                                : "border-rose-500/40 bg-rose-500/5"
                              : "border-white/5"
                          }
                        `}
                      >

                        <div className="flex items-center justify-between">

                          <span className="font-semibold text-slate-300">
                            Test {index + 1}
                          </span>

                          {result &&
                            (
                              result.passed ? (
                                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                              ) : (
                                <XCircle className="h-4 w-4 text-rose-400" />
                              )
                            )}

                        </div>


                        <p className="mt-1 text-slate-500">

                          Input:{" "}

                          <span className="text-slate-300">
                            {JSON.stringify(
                              testCase.input
                            )}
                          </span>

                        </p>


                        <p className="text-slate-500">

                          Expected:{" "}

                          <span className="text-slate-300">
                            {JSON.stringify(
                              testCase.expectedOutput
                            )}
                          </span>

                        </p>


                        {result &&
                          !result.passed &&
                          result.actual !== undefined && (

                            <p className="text-rose-400">

                              Got:{" "}

                              {JSON.stringify(
                                result.actual
                              )}

                            </p>

                          )}

                      </div>

                    );

                  }
                )}


                {activeCp && (

                  <p className="text-slate-500">

                    +{" "}
                    {activeCp.hiddenCount || 0}
                    {" "}
                    hidden test case(s) run on submit.

                  </p>

                )}


                {results && (

                  <div className="mt-1 flex flex-wrap gap-2">

                    {(results.results || [])
                      .filter(
                        (result) =>
                          result.hidden
                      )
                      .map((result) => (

                        <span
                          key={result.index}
                          className={`
                            rounded-md px-2 py-0.5
                            text-[11px] font-semibold
                            ${
                              result.passed
                                ? "bg-emerald-500/15 text-emerald-300"
                                : "bg-rose-500/15 text-rose-300"
                            }
                          `}
                        >

                          Hidden #{result.index + 1}{" "}
                          {result.passed
                            ? "✓"
                            : "✗"}

                        </span>

                      ))}

                  </div>

                )}


                {!activeCp && (

                  <p className="text-slate-500">

                    Test cases appear when a checkpoint challenge is active.

                  </p>

                )}

              </div>

            )}

          </div>

        </div>

      </div>

    </>
    ) : (

    <div className="rounded-2xl border border-cyan-400/10 bg-gradient-to-br from-cyan-400/[0.06] to-violet-500/[0.06] p-6">

      {/* ==================================================
          MCQ WORKSPACE
      ================================================== */}

      {/* MCQ HEADER */}

      <div className="flex items-center gap-3">

        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-cyan-400/10">

          <CheckCircle2 className="h-6 w-6 text-cyan-400" />

        </div>

        <div>

          <p className="text-xs font-bold uppercase tracking-wider text-cyan-400">
            Introduction Quiz
          </p>

          <h2 className="mt-1 text-xl font-black text-white">
            Test Your Understanding
          </h2>

        </div>

      </div>


      <p className="mt-3 text-sm text-slate-400">
        Answer all questions correctly to complete this level.
      </p>


      {/* ==================================================
          QUESTIONS
      ================================================== */}

      <div className="mt-6 space-y-6">

  {mcqs.map((mcq, questionIndex) => {
    const selectedOption = mcqAnswers[questionIndex];
    const submitted = Boolean(mcqResult);

    return (

          <div
            key={questionIndex}
            className="rounded-xl border border-white/10 bg-white/[0.03] p-5"
          >

            <p className="text-sm font-bold text-white">
              Question {questionIndex + 1}
            </p>

            <p className="mt-2 text-sm leading-6 text-slate-300">
              {mcq.question}
            </p>


            {/* OPTIONS */}

            <div className="mt-4 space-y-2">

              {Object.entries(mcq.options || {}).map(
  ([optionKey, optionText]) => {

    const selected =
      mcqAnswers[questionIndex] === optionKey;

    

    const isCorrect =
      submitted &&
      optionKey === mcq.correct_option;

    const isWrongSelected =
      submitted &&
      selected &&
      optionKey !== mcq.correct_option;

    return (
      <button
        key={optionKey}
        type="button"
        disabled={submitted && mcqResult?.passed}
      onClick={() => {
  setMcqAnswers((previous) => ({
    ...previous,
    [questionIndex]: optionKey,
  }));

  // Clear previous submission result when retrying
  if (mcqResult && !mcqResult.passed) {
    setMcqResult(null);
  }
}}
        className={`
          flex w-full items-center gap-3
          rounded-xl border p-3 text-left transition

          ${
            // AFTER SUBMIT
            submitted
              ? isCorrect
                ? "border-emerald-400 bg-emerald-400/10"
                : isWrongSelected
                  ? "border-rose-400 bg-rose-400/10"
                  : "border-white/10 bg-white/[0.02]"
              
              // BEFORE SUBMIT
              : selected
                ? "border-cyan-400 bg-cyan-400/10"
                : "border-white/10 bg-white/[0.02] hover:bg-white/[0.05]"
          }
        `}
      >

        {/* OPTION LETTER */}
        <span
          className={`
            grid h-8 w-8 shrink-0
            place-items-center rounded-lg
            text-sm font-bold

            ${
              submitted
                ? isCorrect
                  ? "bg-emerald-400 text-slate-950"
                  : isWrongSelected
                    ? "bg-rose-400 text-white"
                    : "bg-white/10 text-slate-300"

                : selected
                  ? "bg-cyan-400 text-slate-950"
                  : "bg-white/10 text-slate-300"
            }
          `}
        >
          {optionKey}
        </span>

        {/* OPTION TEXT */}
        <span
          className={`
            text-sm

            ${
              submitted
                ? isCorrect
                  ? "text-emerald-300"
                  : isWrongSelected
                    ? "text-rose-300"
                    : "text-slate-300"
                : "text-slate-300"
            }
          `}
        >
          {optionText}
        </span>

        {/* STATUS */}
        {submitted && isCorrect && (
          <CheckCircle2 className="ml-auto h-5 w-5 text-emerald-400" />
        )}

        {submitted && isWrongSelected && (
          <XCircle className="ml-auto h-5 w-5 text-rose-400" />
        )}

      </button>
    );
  }
)}

            </div>

  {submitted && mcqAnswers[questionIndex] !== mcq.correct_option && (
  <div className="mt-4 space-y-2">

    {/* WRONG ANSWER */}
    <div className="rounded-xl border border-rose-400/20 bg-rose-400/10 p-3">
      <p className="text-xs font-bold uppercase tracking-wide text-rose-400">
        Your Answer
      </p>

      <p className="mt-1 text-sm text-rose-200">
        {mcqAnswers[questionIndex]} ){" "}
        {mcq.options?.[mcqAnswers[questionIndex]]}
      </p>
    </div>

    {/* CORRECT ANSWER */}
    <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 p-3">
      <p className="text-xs font-bold uppercase tracking-wide text-emerald-400">
        Correct Answer
      </p>

      <p className="mt-1 text-sm text-emerald-200">
        {mcq.correct_option} ){" "}
        {mcq.options?.[mcq.correct_option]}
      </p>
    </div>

  </div>
)}

                    </div>
        );
      })}

      </div>


      {/* ==================================================
          RESULT
      ================================================== */}

      {mcqResult && (

        <div
          className={`
            mt-5 rounded-xl border p-4
            ${
              mcqResult.passed
                ? "border-emerald-400/20 bg-emerald-400/10"
                : "border-rose-400/20 bg-rose-400/10"
            }
          `}
        >

          <p className="text-sm font-bold text-white">
            {mcqResult.correct}/{mcqResult.total} correct
          </p>

          <p className="mt-1 text-xs text-slate-400">

            {mcqResult.passed
              ? "Great! You passed this level."
              : "Some answers are incorrect. Please try again."}

          </p>

        </div>

      )}


      {/* ==================================================
          SUBMIT
      ================================================== */}

      {/* ==================================================
    QUIZ ACTION
================================================== */}

<button
  type="button"
  onClick={submitMcqs}
  disabled={mcqSubmitting || mcqResult?.passed}
  className={`mt-6 flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold text-white transition-all ${
    mcqResult?.passed
      ? "cursor-not-allowed bg-emerald-500/20 text-emerald-300"
      : mcqResult
        ? "bg-gradient-to-r from-amber-500 to-orange-500 hover:scale-[1.02]"
        : "bg-gradient-to-r from-cyan-500 to-violet-500 hover:scale-[1.02]"
  } disabled:cursor-not-allowed disabled:opacity-70`}
>
  {mcqSubmitting ? (
    <>
      <Loader2 className="h-4 w-4 animate-spin" />
      Checking Answers...
    </>
  ) : mcqResult?.passed ? (
    <>
      <CheckCircle2 className="h-4 w-4" />
      Completed
    </>
  ) : mcqResult ? (
    <>
      <ArrowLeft className="h-4 w-4 rotate-180" />
      Retry Quiz
    </>
  ) : (
    <>
      <CheckCircle2 className="h-4 w-4" />
      Submit Answers
    </>
  )}
</button>

    </div>

  )}

</div>


{/* ==================================================
    COMPLETION MODAL
================================================== */}

<AnimatePresence>

  {completedModal && (

    <motion.div
      className="fixed inset-0 z-50 grid place-items-center bg-slate-950/70 p-4 backdrop-blur"
      initial={{
        opacity: 0,
      }}
      animate={{
        opacity: 1,
      }}
      exit={{
        opacity: 0,
      }}
    >

      <motion.div
        initial={{
          scale: 0.9,
          y: 20,
        }}
        animate={{
          scale: 1,
          y: 0,
        }}
        className="glass-dark w-full max-w-md rounded-3xl p-8 text-center"
        data-testid="level-complete-modal"
      >

        <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-glow">

          <PartyPopper className="h-8 w-8" />

        </span>


        <h3 className="mt-5 text-2xl font-black text-white">
          Level Complete!
        </h3>


        <p className="mt-2 text-slate-300">
          You solved all checkpoints and finished{" "}
          {level.title}.
          The next level is unlocked.
        </p>


        <div className="mt-6 flex flex-col gap-3">

          {nextLevelId ? (

            <button
              onClick={() => {
                setCompletedModal(false);

                nav(
                  `/skillhub/level/${nextLevelId}`
                );
              }}
              data-testid="next-level-btn"
              className="flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-cyan-500 to-violet-500 px-6 py-3 font-bold text-white"
            >

              Next Level

              <ChevronRight className="h-4 w-4" />

            </button>

          ) : (

            <p className="flex items-center justify-center gap-2 text-emerald-400">

              <Flag className="h-4 w-4" />

              You reached the end of the path!

            </p>

          )}


          <Link
            to="/skillhub"
            className="rounded-full border border-white/10 px-6 py-3 font-semibold text-slate-200 hover:bg-white/5"
          >
            Back to SkillHub
          </Link>

        </div>

      </motion.div>

    </motion.div>

  )}

      </AnimatePresence>

    </div>

  </div>
  );
}