import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Brain,
  CheckCircle2,
  Code2,
  Lightbulb,
  Play,
  Send,
  Users,
  Briefcase,
  RefreshCw,
  AlertCircle,
  X,
} from "lucide-react";

import Shell from "@/features/skillhub/components/Shell";
import { api } from "../../../services/api";

// ======================================================
// LANGUAGE OPTIONS
// ======================================================

const LANGUAGE_OPTIONS = [
  "Java",
  "Python",
  "JavaScript",
  "C",
  "C++",
  "SQL",
];

// ======================================================
// CATEGORY ICON
// ======================================================

const getCategoryIcon = (name = "") => {
  const value = name.toLowerCase();

  if (
    value.includes("technical") ||
    value.includes("programming") ||
    value.includes("coding")
  ) {
    return Code2;
  }

  if (value.includes("problem")) {
    return Lightbulb;
  }

  if (value.includes("critical")) {
    return Brain;
  }

  if (value.includes("interview")) {
    return Briefcase;
  }

  if (value.includes("soft")) {
    return Users;
  }

  return Brain;
};

// ======================================================
// NORMALIZE QUESTION
// ======================================================

const normalizeQuestion = (question) => ({
  id: question.id,
  categoryId: question.category_id,
  questionOrder: question.question_order ?? 0,

  title: question.title || "",
  problem: question.problem || "",
  instructions: question.instructions || "",

  language: question.language || "Java",
  difficulty: question.difficulty || "Beginner",
  points: question.points ?? 10,

  starterCode: question.starter_code || "",

  expectedOutput: question.expected_answer || "",
  evaluationCriteria: question.evaluation_criteria || "",

  isActive: question.is_active !== false,
});

// ======================================================
// NORMALIZE CATEGORY
// ======================================================

const normalizeCategory = (category) => {
  const name =
    category.name ||
    category.title ||
    category.category_name ||
    "Skill Assessment";

  return {
    id: category.id,
    name,

    description:
      category.description ||
      "Complete the questions in this assessment category.",

    icon: getCategoryIcon(name),

    questions: [],
  };
};

// ======================================================
// FORMAT API RESULT
// ======================================================

const formatApiResult = (result, fallbackMessage) => {
  if (result === null || result === undefined) {
    return fallbackMessage;
  }

  if (typeof result === "string") {
    return result;
  }

  if (typeof result === "number" || typeof result === "boolean") {
    return String(result);
  }

  const directMessage =
    result?.message ??
    result?.feedback ??
    result?.output ??
    result?.stdout ??
    result?.result ??
    result?.detail;

  if (directMessage !== undefined && directMessage !== null) {
    if (typeof directMessage === "string") {
      return directMessage;
    }

    return JSON.stringify(directMessage, null, 2);
  }

  return JSON.stringify(result, null, 2);
};

// ======================================================
// COMPONENT
// ======================================================

export default function SkillAssessment() {
  // ====================================================
  // API STATE
  // ====================================================

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retrying, setRetrying] = useState(false);

  // ====================================================
  // ASSESSMENT STATE
  // ====================================================

  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);

  const [code, setCode] = useState("");
  const [submitted, setSubmitted] = useState({});

  const [runMessage, setRunMessage] = useState("");
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [assessmentFinished, setAssessmentFinished] = useState(false);

  // ====================================================
  // LANGUAGE STATE
  // ====================================================

  const [selectedLanguage, setSelectedLanguage] = useState("Java");

  // ====================================================
  // NOTIFICATION STATE
  // ====================================================

  const [notification, setNotification] = useState({
    show: false,
    type: "success",
    message: "",
  });

  // ====================================================
  // SHOW NOTIFICATION
  // ====================================================

  const showNotification = (message, type = "success") => {
    setNotification({
      show: true,
      type,
      message,
    });

    setTimeout(() => {
      setNotification({
        show: false,
        type: "success",
        message: "",
      });
    }, 3000);
  };

  // ====================================================
  // CLOSE NOTIFICATION
  // ====================================================

  const closeNotification = () => {
    setNotification({
      show: false,
      type: "success",
      message: "",
    });
  };

  // ====================================================
  // LOAD ASSESSMENT
  // ====================================================

  const loadAssessment = async () => {
    try {
      setLoading(true);
      setError("");

      // ------------------------------------------------
      // GET CATEGORIES
      // ------------------------------------------------

      const categoryResponse =
        await api.getSkillAssessmentCategories();

      const rawCategories = Array.isArray(categoryResponse)
        ? categoryResponse
        : Array.isArray(categoryResponse?.data)
        ? categoryResponse.data
        : [];

      if (!rawCategories.length) {
        setCategories([]);
        return;
      }

      // ------------------------------------------------
      // NORMALIZE CATEGORIES
      // ------------------------------------------------

      const normalizedCategories =
        rawCategories.map(normalizeCategory);

      // ------------------------------------------------
      // GET QUESTIONS FOR EACH CATEGORY
      // ------------------------------------------------

      const categoriesWithQuestions = await Promise.all(
        normalizedCategories.map(async (category) => {
          try {
            const response =
              await api.getSkillAssessmentCategoryQuestions(
                category.id
              );

            const rawQuestions = Array.isArray(response)
              ? response
              : Array.isArray(response?.data)
              ? response.data
              : [];

            const questions = rawQuestions
              .filter(
                (question) =>
                  question.is_active !== false
              )
              .sort(
                (a, b) =>
                  (a.question_order ?? 0) -
                  (b.question_order ?? 0)
              )
              .map(normalizeQuestion);

            return {
              ...category,
              questions,
            };
          } catch (categoryError) {
            console.error(
              `Failed to load questions for category ${category.id}`,
              categoryError
            );

            return {
              ...category,
              questions: [],
              loadError:
                categoryError?.response?.data?.detail ||
                categoryError?.response?.data?.message ||
                categoryError?.message ||
                "Unable to load questions.",
            };
          }
        })
      );

      setCategories(categoriesWithQuestions);
    } catch (err) {
      console.error(
        "Failed to load skill assessment:",
        err
      );

      const status = err?.response?.status;

      if (status === 401) {
        setError(
          "Your login session has expired. Please sign in again."
        );
      } else if (status === 403) {
        setError(
          "Your account does not have permission to view skill assessment questions."
        );
      } else {
        setError(
          err?.response?.data?.detail ||
            err?.response?.data?.message ||
            err?.message ||
            "Unable to load assessment questions."
        );
      }
    } finally {
      setLoading(false);
      setRetrying(false);
    }
  };

  // ====================================================
  // INITIAL LOAD
  // ====================================================

  useEffect(() => {
    loadAssessment();
  }, []);

  // ====================================================
  // SELECTED CATEGORY
  // ====================================================

  const selectedCategory = useMemo(() => {
    return categories.find(
      (category) =>
        category.id === selectedCategoryId
    );
  }, [categories, selectedCategoryId]);

  // ====================================================
  // CURRENT QUESTION
  // ====================================================

  const question =
    selectedCategory?.questions?.[currentQuestion] ||
    null;

  // ====================================================
  // TOTAL QUESTIONS
  // ====================================================

  const totalQuestions = useMemo(() => {
    return categories.reduce(
      (total, category) =>
        total + (category.questions?.length || 0),
      0
    );
  }, [categories]);

  // ====================================================
  // COMPLETED QUESTIONS
  // ====================================================

  const completedQuestions =
    Object.values(submitted).filter(Boolean).length;

  // ====================================================
  // OPEN CATEGORY
  // ====================================================

  const handleCategoryChange = (categoryId) => {
    const category = categories.find(
      (item) => item.id === categoryId
    );

    if (!category) {
      return;
    }

    setSelectedCategoryId(categoryId);
    setCurrentQuestion(0);
    setAssessmentFinished(false);
    setRunMessage("");

    const firstQuestion = category.questions?.[0];

    setCode(firstQuestion?.starterCode || "");

    setSelectedLanguage(
      firstQuestion?.language || "Java"
    );
  };

  // ====================================================
  // CHANGE LANGUAGE
  // ====================================================

  const handleLanguageChange = (event) => {
    const language = event.target.value;

    setSelectedLanguage(language);
    setRunMessage("");
  };

  // ====================================================
  // CHANGE QUESTION
  // ====================================================

  const handleQuestionChange = (index) => {
    if (!selectedCategory) {
      return;
    }

    if (
      index < 0 ||
      index >= selectedCategory.questions.length
    ) {
      return;
    }

    const nextQuestion =
      selectedCategory.questions[index];

    setCurrentQuestion(index);

    setCode(nextQuestion?.starterCode || "");

    setSelectedLanguage(
      nextQuestion?.language || "Java"
    );

    setRunMessage("");
  };

  // ====================================================
  // NEXT
  // ====================================================

  const handleNext = () => {
    if (!selectedCategory || !question) {
      return;
    }

    const isLastQuestion =
      currentQuestion ===
      selectedCategory.questions.length - 1;

    if (!isLastQuestion) {
      handleQuestionChange(currentQuestion + 1);
      return;
    }

    const currentCategoryIndex =
      categories.findIndex(
        (category) =>
          category.id === selectedCategory.id
      );

    const nextCategory = categories
      .slice(currentCategoryIndex + 1)
      .find(
        (category) =>
          category.questions?.length > 0
      );

    if (nextCategory) {
      const nextQuestion =
        nextCategory.questions[0];

      setSelectedCategoryId(nextCategory.id);
      setCurrentQuestion(0);

      setCode(
        nextQuestion?.starterCode || ""
      );

      setSelectedLanguage(
        nextQuestion?.language || "Java"
      );

      setRunMessage("");

      return;
    }

    setAssessmentFinished(true);

    setRunMessage(
      "Assessment completed successfully."
    );

    showNotification(
      "Assessment completed successfully!",
      "success"
    );
  };

  // ====================================================
  // PREVIOUS
  // ====================================================

  const handlePrevious = () => {
    if (!selectedCategory || !question) {
      return;
    }

    if (currentQuestion > 0) {
      handleQuestionChange(currentQuestion - 1);
      return;
    }

    const currentCategoryIndex =
      categories.findIndex(
        (category) =>
          category.id === selectedCategory.id
      );

    const previousCategories = categories.slice(
      0,
      currentCategoryIndex
    );

    const previousCategory = [
      ...previousCategories,
    ]
      .reverse()
      .find(
        (category) =>
          category.questions?.length > 0
      );

    if (!previousCategory) {
      return;
    }

    const lastQuestionIndex =
      previousCategory.questions.length - 1;

    const previousQuestion =
      previousCategory.questions[
        lastQuestionIndex
      ];

    setSelectedCategoryId(previousCategory.id);

    setCurrentQuestion(lastQuestionIndex);

    setCode(
      previousQuestion?.starterCode || ""
    );

    setSelectedLanguage(
      previousQuestion?.language || "Java"
    );

    setRunMessage("");
  };

  // ====================================================
  // RUN CODE
  // ====================================================

  const handleRunCode = async () => {
    if (!question?.id) {
      setRunMessage("Question ID is missing.");

      showNotification(
        "Question ID is missing.",
        "error"
      );

      return;
    }

    if (!code.trim()) {
      setRunMessage("Please enter some code first.");

      showNotification(
        "Please enter some code first.",
        "error"
      );

      return;
    }

    try {
      setRunning(true);
      setRunMessage("Running code...");

      const result =
        await api.runSkillAssessmentQuestion(
          question.id,
          selectedLanguage,
          code
        );

      console.log(
        "SKILL ASSESSMENT RUN RESPONSE:",
        result
      );

      setRunMessage(
        formatApiResult(
          result,
          "Code executed successfully."
        )
      );
    } catch (error) {
      console.error(
        "Skill assessment run failed:",
        error
      );

      const message =
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        error?.message ||
        "Failed to run code.";

      setRunMessage(String(message));

      showNotification(
        String(message),
        "error"
      );
    } finally {
      setRunning(false);
    }
  };

  // ====================================================
  // SUBMIT CODE
  // ====================================================

  const handleSubmit = async () => {
    if (!question?.id) {
      setRunMessage("Question ID is missing.");

      showNotification(
        "Question ID is missing.",
        "error"
      );

      return;
    }

    if (!code.trim()) {
      setRunMessage("Please enter some code first.");

      showNotification(
        "Please enter some code first.",
        "error"
      );

      return;
    }

    try {
      setSubmitting(true);
      setRunMessage("Submitting solution...");

      // ==================================================
      // BACKEND API CALL
      // ==================================================

      const result =
        await api.submitSkillAssessmentQuestion(
          question.id,
          selectedLanguage,
          code
        );

      console.log(
        "SKILL ASSESSMENT SUBMIT RESPONSE:",
        result
      );

      // ==================================================
      // SHOW API RESULT
      // ==================================================

      setRunMessage(
        formatApiResult(
          result,
          "Solution submitted successfully."
        )
      );

      // ==================================================
      // MARK QUESTION AS SUBMITTED
      // ==================================================

      setSubmitted((previous) => ({
        ...previous,
        [question.id]: true,
      }));

      // ==================================================
      // SUCCESS NOTIFICATION
      // ==================================================

      showNotification(
        "Question submitted successfully!",
        "success"
      );
    } catch (error) {
      console.error(
        "Skill assessment submit failed:",
        error
      );

      const message =
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        error?.message ||
        "Failed to submit solution.";

      setRunMessage(String(message));

      showNotification(
        String(message),
        "error"
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ====================================================
  // RESET CODE
  // ====================================================

  const handleResetCode = () => {
    setCode(question?.starterCode || "");

    setSelectedLanguage(
      question?.language || "Java"
    );

    setRunMessage("");
  };

  // ====================================================
  // RETRY
  // ====================================================

  const handleRetry = async () => {
    setRetrying(true);
    await loadAssessment();
  };

  // ====================================================
  // BACK TO CATEGORIES
  // ====================================================

  const handleBackToCategories = () => {
    setSelectedCategoryId(null);
    setCurrentQuestion(0);
    setCode("");
    setSelectedLanguage("Java");
    setRunMessage("");
    setAssessmentFinished(false);
  };

  // ====================================================
  // LOADING
  // ====================================================

  if (loading) {
    return (
      <Shell>
        <div className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-[#020617]">
          <div className="text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-cyan-400/20 bg-cyan-400/10">
              <RefreshCw className="h-6 w-6 animate-spin text-cyan-400" />
            </div>

            <h2 className="mt-5 text-xl font-bold text-white">
              Loading Skill Assessment
            </h2>

            <p className="mt-2 text-sm text-slate-400">
              Loading questions created by your
              administrator...
            </p>
          </div>
        </div>
      </Shell>
    );
  }

  // ====================================================
  // ERROR
  // ====================================================

  if (error) {
    return (
      <Shell>
        <div className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-[#020617] p-6">
          <div className="w-full max-w-lg rounded-3xl border border-red-400/20 bg-red-400/[0.04] p-8 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-400/10">
              <AlertCircle className="h-7 w-7 text-red-400" />
            </div>

            <h2 className="mt-5 text-xl font-black text-white">
              Unable to load assessment
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-400">
              {error}
            </p>

            <button
              type="button"
              onClick={handleRetry}
              disabled={retrying}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-100 disabled:opacity-50"
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  retrying ? "animate-spin" : ""
                }`}
              />

              Try Again
            </button>
          </div>
        </div>
      </Shell>
    );
  }

  // ====================================================
  // NO QUESTIONS
  // ====================================================

  if (!totalQuestions) {
    return (
      <Shell>
        <div className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-[#020617] p-6">
          <div className="max-w-lg text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-cyan-400/10">
              <AlertCircle className="h-8 w-8 text-cyan-400" />
            </div>

            <h1 className="mt-6 text-2xl font-black text-white">
              No assessment questions available
            </h1>

            <p className="mt-3 text-sm leading-6 text-slate-400">
              Your administrator has not created any
              active skill assessment questions yet.
            </p>

            <button
              type="button"
              onClick={handleRetry}
              className="mt-6 rounded-xl bg-white px-5 py-3 text-sm font-bold text-slate-950 hover:bg-cyan-100"
            >
              Refresh
            </button>
          </div>
        </div>
      </Shell>
    );
  }

  // ====================================================
  // CATEGORY SCREEN
  // ====================================================

  if (!selectedCategoryId) {
    return (
      <Shell>
        <div className="min-h-[calc(100vh-80px)] bg-[#020617] p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-cyan-400">
              Test Your Skills
            </p>

            <h1 className="mt-3 text-3xl font-black text-white lg:text-4xl">
              Skill Assessment
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
              Choose a category to start your assessment.
            </p>

            <div className="mt-5 flex flex-wrap gap-3">
              <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-slate-400">
                {categories.length} Categories
              </div>

              <div className="rounded-xl border border-cyan-400/10 bg-cyan-400/[0.04] px-4 py-2 text-sm text-cyan-300">
                {totalQuestions} Questions
              </div>

              <div className="rounded-xl border border-emerald-400/10 bg-emerald-400/[0.04] px-4 py-2 text-sm text-emerald-300">
                {completedQuestions} Completed
              </div>
            </div>
          </div>

          <div className="mx-auto mt-10 grid max-w-7xl gap-5 md:grid-cols-2 xl:grid-cols-3">
            {categories.map((category, index) => {
              const Icon = category.icon;

              const questionCount =
                category.questions?.length || 0;

              const totalPoints =
                category.questions?.reduce(
                  (total, item) =>
                    total + Number(item.points || 0),
                  0
                ) || 0;

              return (
                <motion.div
                  key={category.id}
                  initial={{
                    opacity: 0,
                    y: 12,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    delay: index * 0.08,
                  }}
                  className="rounded-3xl border border-white/10 bg-gradient-to-br from-cyan-500/10 via-violet-500/10 to-slate-900 p-6"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-400">
                    <Icon className="h-6 w-6" />
                  </div>

                  <h2 className="mt-5 text-xl font-bold text-white">
                    {category.name}
                  </h2>

                  <p className="mt-3 min-h-[48px] text-sm leading-6 text-slate-400">
                    {category.description}
                  </p>

                  <div className="mt-5 flex items-center justify-between text-sm text-slate-400">
                    <span>
                      {questionCount} Questions
                    </span>

                    <span>
                      {totalPoints} Points
                    </span>
                  </div>

                  {category.loadError ? (
                    <div className="mt-5 rounded-xl border border-red-400/10 bg-red-400/[0.04] p-3 text-xs text-red-300">
                      Unable to load this category.
                    </div>
                  ) : questionCount === 0 ? (
                    <div className="mt-5 rounded-xl border border-white/10 bg-white/[0.03] p-3 text-xs text-slate-500">
                      No active questions available.
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() =>
                        handleCategoryChange(
                          category.id
                        )
                      }
                      className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-white px-5 py-3 font-bold text-slate-950 transition hover:bg-cyan-100"
                    >
                      <Play className="h-4 w-4" />

                      Start Assessment

                      <ArrowRight className="h-4 w-4" />
                    </button>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </Shell>
    );
  }

  // ====================================================
  // QUESTION SAFETY
  // ====================================================

  if (!selectedCategory || !question) {
    return (
      <Shell>
        <div className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-[#020617]">
          <div className="text-center">
            <AlertCircle className="mx-auto h-10 w-10 text-red-400" />

            <h2 className="mt-4 text-xl font-bold text-white">
              Question unavailable
            </h2>

            <button
              type="button"
              onClick={handleBackToCategories}
              className="mt-5 rounded-xl bg-white px-5 py-3 text-sm font-bold text-slate-950"
            >
              Back to Categories
            </button>
          </div>
        </div>
      </Shell>
    );
  }

  // ====================================================
  // WORKSPACE
  // ====================================================

  return (
    <Shell>
      <div className="relative flex h-[calc(100vh-80px)] min-h-0 flex-col overflow-hidden bg-[#020617]">

        {/* ==================================================
            SUCCESS / ERROR NOTIFICATION
        ================================================== */}

        {notification.show && (
          <motion.div
            initial={{
              opacity: 0,
              y: -20,
              x: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
              x: 0,
            }}
            exit={{
              opacity: 0,
              y: -20,
              x: 20,
            }}
            className={`fixed right-5 top-5 z-[9999] flex w-[360px] max-w-[calc(100vw-40px)] items-start gap-3 rounded-2xl border p-4 shadow-2xl backdrop-blur-xl ${
              notification.type === "success"
                ? "border-emerald-400/20 bg-[#071a14]/95"
                : "border-red-400/20 bg-[#1a0808]/95"
            }`}
          >
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                notification.type === "success"
                  ? "bg-emerald-400/10"
                  : "bg-red-400/10"
              }`}
            >
              {notification.type === "success" ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-400" />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <p
                className={`text-sm font-bold ${
                  notification.type === "success"
                    ? "text-emerald-300"
                    : "text-red-300"
                }`}
              >
                {notification.type === "success"
                  ? "Success"
                  : "Error"}
              </p>

              <p className="mt-1 text-sm leading-5 text-slate-300">
                {notification.message}
              </p>
            </div>

            <button
              type="button"
              onClick={closeNotification}
              className="rounded-lg p-1 text-slate-500 transition hover:bg-white/10 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        )}

        {/* ==================================================
            TOP NAV
        ================================================== */}

        <div className="flex shrink-0 items-center justify-between border-b border-white/10 bg-[#0b1120] px-5 py-3">
          <button
            type="button"
            onClick={handleBackToCategories}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Categories
          </button>

          <div className="hidden items-center gap-3 sm:flex">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Progress
            </span>

            <span className="text-sm font-bold text-cyan-300">
              {completedQuestions} / {totalQuestions}
            </span>
          </div>
        </div>

        {/* ==================================================
            ASSESSMENT HEADER
        ================================================== */}

        <div className="flex shrink-0 items-center justify-between border-b border-white/10 bg-[#0b1120] px-5 py-3">
          <div className="flex items-center gap-4">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-cyan-400/10 text-cyan-400 ring-1 ring-cyan-400/20">
              <Code2 className="h-5 w-5" />
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-cyan-400">
                Skill Assessment
              </p>

              <h1 className="text-lg font-black text-white">
                {selectedCategory.name}
              </h1>
            </div>
          </div>

          {/* QUESTION NUMBERS */}

          <div className="flex items-center gap-2">
            <span className="mr-2 hidden text-[10px] font-bold uppercase tracking-wider text-slate-500 sm:inline">
              Questions
            </span>

            {selectedCategory.questions.map(
              (questionItem, index) => (
                <button
                  key={questionItem.id}
                  type="button"
                  onClick={() =>
                    handleQuestionChange(index)
                  }
                  title={`Question ${index + 1}`}
                  className={`grid h-8 w-8 place-items-center rounded-lg text-xs font-bold transition ${
                    index === currentQuestion
                      ? "bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-400/20"
                      : submitted[
                          questionItem.id
                        ]
                      ? "bg-emerald-400/15 text-emerald-300 ring-1 ring-emerald-400/20"
                      : "border border-white/10 bg-white/[0.04] text-slate-400 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {submitted[
                    questionItem.id
                  ] ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    index + 1
                  )}
                </button>
              )
            )}
          </div>
        </div>

        {/* ==================================================
            QUESTION + CODE
        ================================================== */}

        <div className="grid min-h-0 flex-1 overflow-hidden lg:grid-cols-[42%_58%]">

          {/* LEFT */}

          <div className="min-h-0 overflow-y-auto border-r border-white/10 bg-[#070d1c]">
            <div className="p-6 lg:p-8">

              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                    Challenge {currentQuestion + 1}
                  </p>

                  <h2 className="mt-2 text-2xl font-black leading-tight text-white">
                    {question.title}
                  </h2>
                </div>

                <span className="shrink-0 rounded-full bg-violet-400/10 px-3 py-1.5 text-xs font-bold text-violet-300">
                  {question.difficulty}
                </span>
              </div>

              <div className="mt-8">
                <p className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                  Problem
                </p>

                <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-300">
                  {question.problem}
                </p>
              </div>

              {question.instructions && (
                <div className="mt-7 rounded-2xl border border-cyan-400/10 bg-cyan-400/[0.04] p-5">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-cyan-400" />

                    <p className="text-xs font-bold uppercase tracking-wider text-cyan-300">
                      Instructions
                    </p>
                  </div>

                  <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-400">
                    {question.instructions}
                  </p>
                </div>
              )}

              <div className="mt-6 flex flex-wrap gap-2">
                <span className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-slate-300">
                  {selectedLanguage}
                </span>

                <span className="rounded-lg border border-violet-400/10 bg-violet-400/[0.05] px-3 py-1.5 text-xs font-semibold text-violet-300">
                  {question.difficulty}
                </span>

                <span className="rounded-lg border border-emerald-400/10 bg-emerald-400/[0.05] px-3 py-1.5 text-xs font-semibold text-emerald-300">
                  {question.points} Points
                </span>
              </div>

              <div className="mt-8 rounded-2xl border border-white/5 bg-white/[0.02] p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Assessment
                </p>

                <p className="mt-2 text-xs leading-5 text-slate-500">
                  Submit your solution when you
                  are ready. Your answer will be
                  evaluated according to the
                  assessment criteria configured
                  by your administrator.
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT */}

          <div className="flex min-h-0 flex-col overflow-hidden bg-[#0b1120]">

            {/* ==================================================
                EDITOR HEADER
            ================================================== */}

            <div className="flex shrink-0 items-center justify-between border-b border-white/10 bg-[#0b1120] px-5 py-3">
              <div className="flex items-center gap-3">
                <Code2 className="h-4 w-4 text-cyan-400" />

                {/* LANGUAGE DROPDOWN */}

                <select
                  value={selectedLanguage}
                  onChange={handleLanguageChange}
                  disabled={
                    running ||
                    submitting ||
                    submitted[question.id]
                  }
                  className="cursor-pointer rounded-lg border border-white/10 bg-[#182235] px-3 py-1.5 text-xs font-bold text-slate-300 outline-none transition hover:border-cyan-400/40 focus:border-cyan-400/60 focus:ring-1 focus:ring-cyan-400/20 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {LANGUAGE_OPTIONS.map(
                    (language) => (
                      <option
                        key={language}
                        value={language}
                        className="bg-[#182235] text-white"
                      >
                        {language}
                      </option>
                    )
                  )}
                </select>
              </div>

              <span className="text-[11px] font-medium text-slate-600">
                Coding Workspace
              </span>
            </div>

            {/* ==================================================
                CODE EDITOR
            ================================================== */}

            <div className="min-h-0 flex-1 overflow-hidden">
              <textarea
                value={code}
                onChange={(event) => {
                  setCode(event.target.value);
                  setRunMessage("");
                }}
                spellCheck={false}
                disabled={
                  running || submitting
                }
                className="block h-full min-h-0 w-full resize-none border-0 bg-[#080d19] p-5 font-mono text-sm leading-7 text-slate-200 outline-none disabled:cursor-not-allowed disabled:opacity-70"
              />
            </div>

            {/* ==================================================
                OUTPUT
            ================================================== */}

            <div className="shrink-0 border-t border-white/10 bg-[#080d19]">
              <div className="flex items-center gap-6 border-b border-white/10 px-5 py-3">
                <span className="border-b-2 border-cyan-400 pb-2 text-xs font-bold text-cyan-400">
                  OUTPUT
                </span>
              </div>

              <div className="h-[105px] overflow-auto p-5">
                {runMessage ? (
                  <div className="rounded-xl border border-cyan-400/10 bg-cyan-400/[0.04] p-4">
                    <pre className="whitespace-pre-wrap text-xs leading-6 text-slate-400">
                      {runMessage}
                    </pre>
                  </div>
                ) : (
                  <div className="text-xs text-slate-600">
                    Run or submit your solution
                    to see the result.
                  </div>
                )}
              </div>
            </div>

            {/* ==================================================
                ACTIONS
            ================================================== */}

            <div className="flex shrink-0 items-center justify-between border-t border-white/10 bg-[#0b1120] px-5 py-4">

              <button
                type="button"
                onClick={handleResetCode}
                disabled={
                  running || submitting
                }
                className="text-xs font-semibold text-slate-500 transition hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                Reset Code
              </button>

              <div className="flex items-center gap-3">

                {/* RUN */}

                <button
                  type="button"
                  onClick={handleRunCode}
                  disabled={
                    running ||
                    submitting ||
                    submitted[question.id]
                  }
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-5 py-2.5 text-sm font-bold text-slate-200 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {running ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}

                  {running
                    ? "Running..."
                    : "Run Code"}
                </button>

                {/* SUBMIT */}

                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={
                    submitting ||
                    running ||
                    submitted[question.id]
                  }
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-violet-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-cyan-500/10 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitted[question.id] ? (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      Submitted
                    </>
                  ) : submitting ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Submit
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ==================================================
            BOTTOM NAVIGATION
        ================================================== */}

        <div className="flex shrink-0 items-center justify-between border-t border-white/10 bg-[#0b1120] px-5 py-3">

          <button
            type="button"
            disabled={
              currentQuestion === 0 &&
              categories.findIndex(
                (category) =>
                  category.id ===
                  selectedCategory.id
              ) === 0
            }
            onClick={handlePrevious}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm font-semibold text-slate-400 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
          >
            <ArrowLeft className="h-4 w-4" />
            Previous
          </button>

          <div className="hidden items-center gap-2 sm:flex">
            {selectedCategory.questions.map(
              (item, index) => (
                <span
                  key={item.id}
                  className={`h-1.5 rounded-full transition-all ${
                    index === currentQuestion
                      ? "w-8 bg-cyan-400"
                      : submitted[item.id]
                      ? "w-5 bg-emerald-400"
                      : "w-5 bg-white/10"
                  }`}
                />
              )
            )}
          </div>

          <button
            type="button"
            onClick={handleNext}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white"
          >
            {currentQuestion ===
            selectedCategory.questions.length - 1
              ? "Next Section"
              : "Next"}

            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        {/* ==================================================
            FINISHED
        ================================================== */}

        {assessmentFinished && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-[#020617]/90 p-6 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-3xl border border-emerald-400/20 bg-[#0b1120] p-8 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-400/10">
                <CheckCircle2 className="h-8 w-8 text-emerald-400" />
              </div>

              <h2 className="mt-5 text-2xl font-black text-white">
                Assessment Completed
              </h2>

              <p className="mt-3 text-sm leading-6 text-slate-400">
                You have completed all available
                skill assessment questions.
              </p>

              <button
                type="button"
                onClick={handleBackToCategories}
                className="mt-6 rounded-xl bg-white px-6 py-3 text-sm font-bold text-slate-950 hover:bg-cyan-100"
              >
                Back to Categories
              </button>
            </div>
          </div>
        )}
      </div>
    </Shell>
  );
}