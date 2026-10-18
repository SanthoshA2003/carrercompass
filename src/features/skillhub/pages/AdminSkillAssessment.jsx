import { useEffect, useMemo, useState } from "react";
import {
  Brain,
  Code2,
  Lightbulb,
  Plus,
  Pencil,
  Trash2,
  X,
  Save,
  Users,
  Briefcase,
} from "lucide-react";

import Shell from "@/features/skillhub/components/Shell";
import { api } from "../../../services/api";

const SECTIONS = [
  {
    id: "technical",
    name: "Technical Skills",
    description: "Technical and programming-based challenges.",
    icon: Code2,
  },
  {
    id: "problem-solving",
    name: "Problem Solving",
    description:
      "Logic, algorithms and practical problem-solving challenges.",
    icon: Lightbulb,
  },
  {
    id: "critical-thinking",
    name: "Critical Thinking",
    description:
      "Reasoning, analysis and decision-making challenges.",
    icon: Brain,
  },
  {
    id: "interview-readiness",
    name: "Interview Readiness",
    description:
      "Interview preparation, technical explanation and workplace scenarios.",
    icon: Briefcase,
  },
  {
    id: "soft-skills",
    name: "Soft Skills",
    description:
      "Communication, teamwork, leadership and professional situations.",
    icon: Users,
  },
];

const EMPTY_QUESTION = {
  title: "",
  question: "",
  instructions: "",
  language: "Java",
  starterCode: "",
  expectedOutput: "",
  evaluationCriteria: "",
  difficulty: "Beginner",
  points: 10,
};

const EMPTY_QUESTIONS = {
  technical: [],
  "problem-solving": [],
  "critical-thinking": [],
  "interview-readiness": [],
  "soft-skills": [],
};

function normalizeText(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ");
}

function getErrorMessage(error, fallback = "Something went wrong.") {
  const detail = error?.response?.data?.detail;

  if (typeof detail === "string") {
    return detail;
  }

  if (Array.isArray(detail)) {
    return detail
      .map((item) => {
        if (typeof item === "string") {
          return item;
        }

        return (
          item?.msg ||
          item?.message ||
          JSON.stringify(item)
        );
      })
      .join("\n");
  }

  if (detail && typeof detail === "object") {
    return (
      detail.message ||
      detail.msg ||
      JSON.stringify(detail)
    );
  }

  if (typeof error?.response?.data?.message === "string") {
    return error.response.data.message;
  }

  if (typeof error?.message === "string") {
    return error.message;
  }

  return fallback;
}

function mapBackendQuestion(question) {
  return {
    id: question?.id,

    title: question?.title || "",

    question: question?.problem || "",

    instructions: question?.instructions || "",

    language: question?.language || "Java",

    starterCode: question?.starter_code || "",

    expectedOutput: question?.expected_answer || "",

    evaluationCriteria:
      question?.evaluation_criteria || "",

    difficulty: question?.difficulty || "Beginner",

    points: question?.points ?? 10,
  };
}

export default function AdminSkillAssessment() {
  const [selectedSection, setSelectedSection] =
    useState("technical");

  /*
   * These are REAL categories returned by the backend.
   *
   * Example:
   * [
   *   {
   *     id: "real-uuid",
   *     name: "Technical Skills",
   *     ...
   *   }
   * ]
   */
  const [categories, setCategories] = useState([]);

  const [questions, setQuestions] =
    useState(EMPTY_QUESTIONS);

  const [showModal, setShowModal] =
    useState(false);

  /*
   * null = create mode
   * string = edit mode, containing backend question UUID
   */
  const [editingQuestion, setEditingQuestion] =
    useState(null);

  const [form, setForm] =
    useState(EMPTY_QUESTION);

  const [loadingCategories, setLoadingCategories] =
    useState(true);

  const [loadingQuestions, setLoadingQuestions] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [deletingId, setDeletingId] =
    useState(null);

  const currentSection = useMemo(
    () =>
      SECTIONS.find(
        (section) => section.id === selectedSection
      ),
    [selectedSection]
  );

  const currentQuestions =
    questions[selectedSection] || [];

  const isCodingSection =
    selectedSection === "technical";

  /*
   * ============================================================
   * FIND REAL BACKEND CATEGORY ID
   * ============================================================
   *
   * IMPORTANT:
   * DO NOT put Swagger example UUID here.
   */
  const getCategoryId = (sectionId) => {
    const section = SECTIONS.find(
      (item) => item.id === sectionId
    );

    if (!section) {
      return null;
    }

    const expectedName = normalizeText(section.name);

    const category = categories.find((item) => {
      const backendName = normalizeText(item?.name);

      return (
        backendName === expectedName ||
        backendName.includes(expectedName) ||
        expectedName.includes(backendName)
      );
    });

    return category?.id || null;
  };

  /*
   * ============================================================
   * LOAD CATEGORIES
   * ============================================================
   *
   * GET:
   * /api/skill-assessment/categories
   */
  useEffect(() => {
    let mounted = true;

    const loadCategories = async () => {
      try {
        setLoadingCategories(true);

        const response =
          await api.getSkillAssessmentCategories();

        const data = Array.isArray(response)
          ? response
          : Array.isArray(response?.data)
          ? response.data
          : [];

        if (!mounted) {
          return;
        }

        setCategories(data);
      } catch (error) {
        console.error(
          "Failed to load skill assessment categories:",
          error
        );

        if (mounted) {
          alert(
            getErrorMessage(
              error,
              "Failed to load assessment categories."
            )
          );
        }
      } finally {
        if (mounted) {
          setLoadingCategories(false);
        }
      }
    };

    loadCategories();

    return () => {
      mounted = false;
    };
  }, []);

  /*
   * ============================================================
   * LOAD QUESTIONS FOR SELECTED CATEGORY
   * ============================================================
   *
   * GET:
   * /api/skill-assessment/categories/{category_id}/questions
   */
  useEffect(() => {
    let mounted = true;

    const loadQuestions = async () => {
      const categoryId =
        getCategoryId(selectedSection);

      if (!categoryId) {
        setQuestions((previous) => ({
          ...previous,
          [selectedSection]: [],
        }));

        return;
      }

      try {
        setLoadingQuestions(true);

        const response =
          await api.getSkillAssessmentCategoryQuestions(
            categoryId
          );

        const data = Array.isArray(response)
          ? response
          : Array.isArray(response?.data)
          ? response.data
          : [];

        if (!mounted) {
          return;
        }

        setQuestions((previous) => ({
          ...previous,
          [selectedSection]: data.map(
            mapBackendQuestion
          ),
        }));
      } catch (error) {
        console.error(
          "Failed to load skill assessment questions:",
          error
        );

        if (mounted) {
          setQuestions((previous) => ({
            ...previous,
            [selectedSection]: [],
          }));

          alert(
            getErrorMessage(
              error,
              "Failed to load questions."
            )
          );
        }
      } finally {
        if (mounted) {
          setLoadingQuestions(false);
        }
      }
    };

    /*
     * Wait until categories have loaded.
     */
    if (!loadingCategories) {
      loadQuestions();
    }

    return () => {
      mounted = false;
    };
  }, [
    selectedSection,
    categories,
    loadingCategories,
  ]);

  /*
   * ============================================================
   * FORM HELPERS
   * ============================================================
   */

  const updateForm = (field, value) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingQuestion(null);
    setForm({ ...EMPTY_QUESTION });
  };

  /*
   * ============================================================
   * CREATE MODAL
   * ============================================================
   */

  const openCreateModal = () => {
    if (currentQuestions.length >= 5) {
      alert(
        "Each section can have maximum 5 questions."
      );
      return;
    }

    const categoryId =
      getCategoryId(selectedSection);

    if (!categoryId) {
      alert(
        "The backend category ID was not found. Please check the Skill Assessment Categories API."
      );
      return;
    }

    setEditingQuestion(null);

    setForm({
      ...EMPTY_QUESTION,

      /*
       * Technical questions use Java by default.
       */
      language: isCodingSection
        ? "Java"
        : "General",
    });

    setShowModal(true);
  };

  /*
   * ============================================================
   * EDIT MODAL
   * ============================================================
   *
   * GET:
   * /api/skill-assessment/questions/{question_id}
   */
  const openEditModal = async (question) => {
    if (!question?.id) {
      alert("Question ID is missing.");
      return;
    }

    try {
      const response =
        await api.getSkillAssessmentQuestion(
          question.id
        );

      const data =
        response?.data || response;

      setEditingQuestion(question.id);

      setForm({
        title: data?.title || "",

        question: data?.problem || "",

        instructions:
          data?.instructions || "",

        language:
          data?.language ||
          (isCodingSection
            ? "Java"
            : "General"),

        starterCode:
          data?.starter_code || "",

        expectedOutput:
          data?.expected_answer || "",

        evaluationCriteria:
          data?.evaluation_criteria || "",

        difficulty:
          data?.difficulty || "Beginner",

        points:
          data?.points ?? 10,
      });

      setShowModal(true);
    } catch (error) {
      console.error(
        "Failed to load question:",
        error
      );

      /*
       * Fallback to the question already displayed.
       */
      setEditingQuestion(question.id);

      setForm({
        title: question.title || "",
        question: question.question || "",
        instructions:
          question.instructions || "",
        language:
          question.language ||
          (isCodingSection
            ? "Java"
            : "General"),
        starterCode:
          question.starterCode || "",
        expectedOutput:
          question.expectedOutput || "",
        evaluationCriteria:
          question.evaluationCriteria || "",
        difficulty:
          question.difficulty || "Beginner",
        points:
          question.points ?? 10,
      });

      setShowModal(true);
    }
  };

  /*
   * ============================================================
   * BUILD BACKEND PAYLOAD
   * ============================================================
   */

  const buildPayload = () => {
    const categoryId =
      getCategoryId(selectedSection);

    if (!categoryId) {
      throw new Error(
        "Real backend category ID was not found."
      );
    }

    return {
      category_id: categoryId,

      title: form.title.trim(),

      problem: form.question.trim(),

      instructions:
        form.instructions.trim(),

      language:
        isCodingSection
          ? form.language
          : "General",

      difficulty:
        form.difficulty,

      points:
        Number(form.points),

      starter_code:
        isCodingSection
          ? form.starterCode
          : "",

      expected_answer:
        form.expectedOutput.trim(),

      evaluation_criteria:
        form.evaluationCriteria.trim(),
    };
  };

  /*
   * ============================================================
   * CREATE / UPDATE
   * ============================================================
   */

  const handleSaveQuestion = async () => {
    if (!form.title.trim()) {
      alert("Please enter question title.");
      return;
    }

    if (!form.question.trim()) {
      alert("Please enter the question.");
      return;
    }

    if (!form.instructions.trim()) {
      alert("Please enter instructions.");
      return;
    }

    if (
      !form.points ||
      Number(form.points) <= 0
    ) {
      alert("Points must be greater than 0.");
      return;
    }

    let payload;

    try {
      payload = buildPayload();
    } catch (error) {
      alert(
        error?.message ||
          "Category ID is missing."
      );
      return;
    }

    try {
      setSaving(true);

      /*
       * ========================================================
       * UPDATE
       * ========================================================
       *
       * PUT:
       * /api/skill-assessment/questions/{question_id}
       */
      if (editingQuestion) {
        const response =
          await api.updateSkillAssessmentQuestion(
            editingQuestion,
            payload
          );

        const updatedData =
          response?.data || response;

        const updatedQuestion =
          mapBackendQuestion({
            ...updatedData,

            /*
             * In case backend returns no body.
             */
            id:
              updatedData?.id ||
              editingQuestion,

            title:
              updatedData?.title ||
              payload.title,

            problem:
              updatedData?.problem ||
              payload.problem,

            instructions:
              updatedData?.instructions ||
              payload.instructions,

            language:
              updatedData?.language ||
              payload.language,

            difficulty:
              updatedData?.difficulty ||
              payload.difficulty,

            points:
              updatedData?.points ??
              payload.points,

            starter_code:
              updatedData?.starter_code ??
              payload.starter_code,

            expected_answer:
              updatedData?.expected_answer ??
              payload.expected_answer,

            evaluation_criteria:
              updatedData?.evaluation_criteria ??
              payload.evaluation_criteria,
          });

        setQuestions((previous) => ({
          ...previous,
          [selectedSection]:
            previous[selectedSection].map(
              (item) =>
                item.id === editingQuestion
                  ? updatedQuestion
                  : item
            ),
        }));

        closeModal();

        alert(
          "Question updated successfully."
        );

        return;
      }

      /*
       * ========================================================
       * CREATE
       * ========================================================
       *
       * POST:
       * /api/skill-assessment/questions
       *
       * BACKEND CREATES THE QUESTION ID.
       */
      const response =
        await api.createSkillAssessmentQuestion(
          payload
        );

      const createdData =
        response?.data || response;

      /*
       * IMPORTANT:
       * Do NOT generate category_id.
       * Do NOT use Swagger example UUID.
       *
       * The backend creates question.id.
       */
      const createdQuestion =
        mapBackendQuestion({
          ...createdData,

          id:
            createdData?.id,

          title:
            createdData?.title ||
            payload.title,

          problem:
            createdData?.problem ||
            payload.problem,

          instructions:
            createdData?.instructions ||
            payload.instructions,

          language:
            createdData?.language ||
            payload.language,

          difficulty:
            createdData?.difficulty ||
            payload.difficulty,

          points:
            createdData?.points ??
            payload.points,

          starter_code:
            createdData?.starter_code ??
            payload.starter_code,

          expected_answer:
            createdData?.expected_answer ??
            payload.expected_answer,

          evaluation_criteria:
            createdData?.evaluation_criteria ??
            payload.evaluation_criteria,
        });

      /*
       * If backend doesn't return the created question,
       * reload the category from backend.
       */
      if (!createdQuestion.id) {
        const categoryId =
          getCategoryId(selectedSection);

        if (categoryId) {
          const refreshed =
            await api.getSkillAssessmentCategoryQuestions(
              categoryId
            );

          const refreshedData =
            Array.isArray(refreshed)
              ? refreshed
              : Array.isArray(refreshed?.data)
              ? refreshed.data
              : [];

          setQuestions((previous) => ({
            ...previous,
            [selectedSection]:
              refreshedData.map(
                mapBackendQuestion
              ),
          }));
        }
      } else {
        setQuestions((previous) => ({
          ...previous,
          [selectedSection]: [
            ...previous[selectedSection],
            createdQuestion,
          ],
        }));
      }

      closeModal();

      alert(
        "Question created successfully."
      );
    } catch (error) {
      console.error(
        "Save question error:",
        error
      );

      alert(
        getErrorMessage(
          error,
          "Failed to save question."
        )
      );
    } finally {
      setSaving(false);
    }
  };

  /*
   * ============================================================
   * DELETE
   * ============================================================
   *
   * DELETE:
   * /api/skill-assessment/questions/{question_id}
   */
  const handleDeleteQuestion = async (
    question
  ) => {
    if (!question?.id) {
      alert("Question ID is missing.");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this question?")) {
  return;
}

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(question.id);

      await api.deleteSkillAssessmentQuestion(
        question.id
      );

      setQuestions((previous) => ({
        ...previous,
        [selectedSection]:
          previous[selectedSection].filter(
            (item) =>
              item.id !== question.id
          ),
      }));

      alert(
        "Question deleted successfully."
      );
    } catch (error) {
      console.error(
        "Delete question error:",
        error
      );

      alert(
        getErrorMessage(
          error,
          "Failed to delete question."
        )
      );
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Shell>
      <div className="mx-auto max-w-6xl space-y-8">
        {/* =====================================================
            HEADER
        ====================================================== */}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-300">
              Skill Assessment
            </p>

            <h1 className="mt-2 text-3xl font-black tracking-tight text-white">
              Assessment Questions
            </h1>

            <p className="mt-2 max-w-2xl text-sm text-slate-400">
              Create coding-style challenges to
              evaluate student skills. Each section
              can contain up to 5 questions.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreateModal}
            disabled={
              currentQuestions.length >= 5 ||
              loadingCategories
            }
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-violet-500 px-5 py-3 text-sm font-bold text-white shadow-lg transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Plus className="h-4 w-4" />
            Add Question
          </button>
        </div>

        {/* =====================================================
            CATEGORY LOADING ERROR
        ====================================================== */}

        {loadingCategories && (
          <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/5 p-4 text-sm text-cyan-300">
            Loading assessment categories...
          </div>
        )}

        {!loadingCategories &&
          categories.length === 0 && (
            <div className="rounded-2xl border border-red-400/20 bg-red-400/5 p-4 text-sm text-red-300">
              No Skill Assessment categories were
              returned by the backend.
            </div>
          )}

        {/* =====================================================
            SECTION TABS
        ====================================================== */}

        <div className="grid gap-4 lg:grid-cols-5">
          {SECTIONS.map((section) => {
            const Icon = section.icon;

            const count =
              questions[section.id]?.length || 0;

            const active =
              selectedSection === section.id;

            const categoryId =
              getCategoryId(section.id);

            return (
              <button
                key={section.id}
                type="button"
                onClick={() =>
                  setSelectedSection(section.id)
                }
                className={`rounded-2xl border p-5 text-left transition ${
                  active
                    ? "border-cyan-400/40 bg-gradient-to-br from-cyan-400/15 to-violet-500/10"
                    : "border-white/10 bg-white/[0.03] hover:border-white/20"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="grid h-11 w-11 place-items-center rounded-xl bg-cyan-400/10">
                    <Icon className="h-5 w-5 text-cyan-400" />
                  </div>

                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-slate-300">
                    {count}/5
                  </span>
                </div>

                <h2 className="mt-4 text-lg font-bold text-white">
                  {section.name}
                </h2>

                <p className="mt-1 text-xs leading-5 text-slate-400">
                  {section.description}
                </p>

                {categoryId && (
                  <p className="mt-3 truncate text-[9px] text-slate-600">
                    Category connected
                  </p>
                )}
              </button>
            );
          })}
        </div>

        {/* =====================================================
            CURRENT SECTION
        ====================================================== */}

        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-black text-white">
                {currentSection?.name}
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                {currentQuestions.length} of 5
                questions created
              </p>
            </div>

            <div className="h-2 w-full max-w-xs overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-violet-500"
                style={{
                  width: `${Math.min(
                    (currentQuestions.length / 5) *
                      100,
                    100
                  )}%`,
                }}
              />
            </div>
          </div>

          {/* =================================================
              QUESTIONS
          ================================================== */}

          {loadingQuestions ? (
            <div className="mt-8 rounded-2xl border border-white/10 p-12 text-center">
              <p className="text-sm text-slate-400">
                Loading questions...
              </p>
            </div>
          ) : currentQuestions.length === 0 ? (
            <div className="mt-8 rounded-2xl border border-dashed border-white/10 p-12 text-center">
              <Code2 className="mx-auto h-10 w-10 text-slate-600" />

              <h3 className="mt-4 text-lg font-bold text-white">
                No questions created
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Create the first challenge for this
                section.
              </p>

              <button
                type="button"
                onClick={openCreateModal}
                disabled={
                  loadingCategories ||
                  !getCategoryId(selectedSection)
                }
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-5 py-2.5 text-sm font-bold text-slate-950 disabled:opacity-40"
              >
                <Plus className="h-4 w-4" />
                Create Question
              </button>
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              {currentQuestions.map(
                (question, index) => (
                  <div
                    key={
                      question.id || index
                    }
                    className="rounded-2xl border border-white/10 bg-slate-900/60 p-5"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex min-w-0 gap-4">
                        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-cyan-400/10 text-sm font-black text-cyan-400">
                          {index + 1}
                        </div>

                        <div className="min-w-0">
                          <h3 className="font-bold text-white">
                            {question.title}
                          </h3>

                          <p className="mt-2 line-clamp-2 text-sm text-slate-400">
                            {question.question}
                          </p>

                          <div className="mt-3 flex flex-wrap gap-2">
                            <span className="rounded-full bg-violet-400/10 px-3 py-1 text-[11px] font-semibold text-violet-300">
                              {question.difficulty}
                            </span>

                            <span className="rounded-full bg-cyan-400/10 px-3 py-1 text-[11px] font-semibold text-cyan-300">
                              {question.language}
                            </span>

                            <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-[11px] font-semibold text-emerald-300">
                              {question.points} Points
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex shrink-0 gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            openEditModal(
                              question
                            )
                          }
                          className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 text-slate-300 hover:bg-white/10"
                          title="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleDeleteQuestion(
                              question
                            )
                          }
                          disabled={
                            deletingId ===
                            question.id
                          }
                          className="grid h-9 w-9 place-items-center rounded-lg border border-rose-400/20 text-rose-400 hover:bg-rose-400/10 disabled:opacity-40"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </div>
      </div>

      {/* =======================================================
          CREATE / EDIT MODAL
      ======================================================== */}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-white/10 bg-slate-900 shadow-2xl">
            {/* HEADER */}

            <div className="flex items-start justify-between border-b border-white/10 p-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-cyan-300">
                  {currentSection?.name}
                </p>

                <h2 className="mt-1 text-2xl font-black text-white">
                  {editingQuestion
                    ? "Edit Question"
                    : "Create Question"}
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                  Create a coding-style assessment
                  challenge.
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* FORM */}

            <div className="max-h-[65vh] space-y-5 overflow-y-auto p-6">
              {/* TITLE */}

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Question Title
                </label>

                <input
                  value={form.title}
                  onChange={(e) =>
                    updateForm(
                      "title",
                      e.target.value
                    )
                  }
                  placeholder={
                    isCodingSection
                      ? "Example: Reverse a String"
                      : "Enter question title"
                  }
                  className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-400"
                />
              </div>

              {/* QUESTION */}

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  {isCodingSection
                    ? "Problem / Question"
                    : "Scenario / Question"}
                </label>

                <textarea
                  rows={5}
                  value={form.question}
                  onChange={(e) =>
                    updateForm(
                      "question",
                      e.target.value
                    )
                  }
                  placeholder={
                    isCodingSection
                      ? "Write the complete coding problem..."
                      : "Describe the situation or question..."
                  }
                  className="mt-2 w-full resize-none rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-400"
                />
              </div>

              {/* INSTRUCTIONS */}

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Instructions
                </label>

                <textarea
                  rows={4}
                  value={form.instructions}
                  onChange={(e) =>
                    updateForm(
                      "instructions",
                      e.target.value
                    )
                  }
                  placeholder="Explain what the student needs to do..."
                  className="mt-2 w-full resize-none rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-400"
                />
              </div>

              {/* LANGUAGE / DIFFICULTY / POINTS */}

              <div
                className={`grid gap-4 ${
                  isCodingSection
                    ? "sm:grid-cols-3"
                    : "sm:grid-cols-2"
                }`}
              >
                {isCodingSection && (
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Language
                    </label>

                    <select
                      value={form.language}
                      onChange={(e) =>
                        updateForm(
                          "language",
                          e.target.value
                        )
                      }
                      className="mt-2 w-full rounded-xl border border-white/10 bg-slate-800 px-4 py-3 text-sm text-white outline-none"
                    >
                      <option>Java</option>
                      <option>Python</option>
                      <option>JavaScript</option>
                      <option>C</option>
                      <option>C++</option>
                      <option>SQL</option>
                    </select>
                  </div>
                )}

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Difficulty
                  </label>

                  <select
                    value={form.difficulty}
                    onChange={(e) =>
                      updateForm(
                        "difficulty",
                        e.target.value
                      )
                    }
                    className="mt-2 w-full rounded-xl border border-white/10 bg-slate-800 px-4 py-3 text-sm text-white outline-none"
                  >
                    <option>Beginner</option>
                    <option>
                      Intermediate
                    </option>
                    <option>Advanced</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Points
                  </label>

                  <input
                    type="number"
                    min="1"
                    value={form.points}
                    onChange={(e) =>
                      updateForm(
                        "points",
                        Number(e.target.value)
                      )
                    }
                    className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              {/* STARTER CODE */}

              {isCodingSection && (
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Starter Code
                  </label>

                  <textarea
                    rows={8}
                    value={form.starterCode}
                    onChange={(e) =>
                      updateForm(
                        "starterCode",
                        e.target.value
                      )
                    }
                    placeholder={`public class Main {
    public static void main(String[] args) {

    }
}`}
                    className="mt-2 w-full resize-none rounded-xl border border-white/10 bg-black/30 px-4 py-3 font-mono text-sm text-cyan-300 outline-none placeholder:text-slate-600 focus:border-cyan-400"
                  />
                </div>
              )}

              {/* EXPECTED ANSWER */}

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  {isCodingSection
                    ? "Expected Output / Answer"
                    : "Expected Answer"}
                </label>

                <textarea
                  rows={5}
                  value={form.expectedOutput}
                  onChange={(e) =>
                    updateForm(
                      "expectedOutput",
                      e.target.value
                    )
                  }
                  placeholder="Enter the expected answer..."
                  className="mt-2 w-full resize-none rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-emerald-300 outline-none placeholder:text-slate-600 focus:border-cyan-400"
                />
              </div>

              {/* EVALUATION CRITERIA */}

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Evaluation Criteria
                </label>

                <textarea
                  rows={4}
                  value={
                    form.evaluationCriteria
                  }
                  onChange={(e) =>
                    updateForm(
                      "evaluationCriteria",
                      e.target.value
                    )
                  }
                  placeholder="Explain how the student's answer should be evaluated..."
                  className="mt-2 w-full resize-none rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-400"
                />
              </div>
            </div>

            {/* FOOTER */}

            <div className="flex justify-end gap-3 border-t border-white/10 p-5">
              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                className="rounded-xl border border-white/10 bg-white/[0.04] px-5 py-2.5 text-sm font-bold text-slate-300 hover:bg-white/10 disabled:opacity-40"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSaveQuestion}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-violet-500 px-5 py-2.5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Save className="h-4 w-4" />

                {saving
                  ? "Saving..."
                  : editingQuestion
                  ? "Update Question"
                  : "Create Question"}
              </button>
            </div>
          </div>
        </div>
      )}
    </Shell>
  );
}