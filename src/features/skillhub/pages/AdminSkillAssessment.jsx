import { useState } from "react";
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
    description: "Logic, algorithms and practical problem-solving challenges.",
    icon: Lightbulb,
  },
  {
    id: "critical-thinking",
    name: "Critical Thinking",
    description: "Reasoning, analysis and decision-making challenges.",
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

const emptyQuestion = {
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

export default function AdminSkillAssessment() {
  const [selectedSection, setSelectedSection] = useState("technical");

  const [questions, setQuestions] = useState({
    technical: [],
    "problem-solving": [],
    "critical-thinking": [],
    "interview-readiness": [],
    "soft-skills": [],
  });

  const [showModal, setShowModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);

  const [form, setForm] = useState(emptyQuestion);

  const currentSection = SECTIONS.find(
    (section) => section.id === selectedSection,
  );

  const currentQuestions = questions[selectedSection] || [];

  const isTechnical = selectedSection === "technical";
  const isProblemSolving = selectedSection === "problem-solving";
  const isCriticalThinking = selectedSection === "critical-thinking";
  const isInterviewReadiness = selectedSection === "interview-readiness";
  const isSoftSkills = selectedSection === "soft-skills";

  const isCodingSection = isTechnical;

  const openCreateModal = () => {
    if (currentQuestions.length >= 5) {
      alert("Each section can have maximum 5 questions.");
      return;
    }

    setEditingQuestion(null);

    setForm({
      ...emptyQuestion,
    });

    setShowModal(true);
  };

  const openEditModal = (question, index) => {
    setEditingQuestion(index);

    setForm({
      ...question,
    });

    setShowModal(true);
  };

  const handleSaveQuestion = () => {
    if (!form.title.trim()) {
      alert("Please enter question title.");
      return;
    }

    if (!form.question.trim()) {
      alert("Please enter the question.");
      return;
    }

    if (editingQuestion !== null) {
      setQuestions((previous) => ({
        ...previous,
        [selectedSection]: previous[selectedSection].map((question, index) =>
          index === editingQuestion
            ? {
                ...form,
              }
            : question,
        ),
      }));
    } else {
      setQuestions((previous) => ({
        ...previous,
        [selectedSection]: [
          ...previous[selectedSection],
          {
            ...form,
            id: crypto.randomUUID(),
          },
        ],
      }));
    }

    setShowModal(false);
    setEditingQuestion(null);
    setForm(emptyQuestion);
  };

  const handleDeleteQuestion = (index) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this question?",
    );

    if (!confirmed) return;

    setQuestions((previous) => ({
      ...previous,
      [selectedSection]: previous[selectedSection].filter(
        (_, questionIndex) => questionIndex !== index,
      ),
    }));
  };

  return (
    <Shell>
      <div className="mx-auto max-w-6xl space-y-8">
        {/* HEADER */}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-300">
              Skill Assessment
            </p>

            <h1 className="mt-2 text-3xl font-black tracking-tight text-white">
              Assessment Questions
            </h1>

            <p className="mt-2 max-w-2xl text-sm text-slate-400">
              Create coding-style challenges to evaluate student skills. Each
              section can contain up to 5 questions.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreateModal}
            disabled={currentQuestions.length >= 5}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-violet-500 px-5 py-3 text-sm font-bold text-white shadow-lg transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Plus className="h-4 w-4" />
            Add Question
          </button>
        </div>

        {/* SECTION TABS */}

        <div className="grid gap-4 lg:grid-cols-5">
          {SECTIONS.map((section) => {
            const Icon = section.icon;

            const count = questions[section.id]?.length || 0;

            const active = selectedSection === section.id;

            return (
              <button
                key={section.id}
                type="button"
                onClick={() => setSelectedSection(section.id)}
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
              </button>
            );
          })}
        </div>

        {/* CURRENT SECTION */}

        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-black text-white">
                {currentSection?.name}
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                {currentQuestions.length} of 5 questions created
              </p>
            </div>

            <div className="h-2 w-full max-w-xs overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-violet-500"
                style={{
                  width: `${(currentQuestions.length / 5) * 100}%`,
                }}
              />
            </div>
          </div>

          {/* QUESTIONS */}

          {currentQuestions.length === 0 ? (
            <div className="mt-8 rounded-2xl border border-dashed border-white/10 p-12 text-center">
              <Code2 className="mx-auto h-10 w-10 text-slate-600" />

              <h3 className="mt-4 text-lg font-bold text-white">
                No questions created
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Create the first challenge for this section.
              </p>

              <button
                type="button"
                onClick={openCreateModal}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-5 py-2.5 text-sm font-bold text-slate-950"
              >
                <Plus className="h-4 w-4" />
                Create Question
              </button>
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              {currentQuestions.map((question, index) => (
                <div
                  key={question.id || index}
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
                        onClick={() => openEditModal(question, index)}
                        className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 text-slate-300 hover:bg-white/10"
                        title="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteQuestion(index)}
                        className="grid h-9 w-9 place-items-center rounded-lg border border-rose-400/20 text-rose-400 hover:bg-rose-400/10"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* CREATE / EDIT MODAL */}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
<div className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-white/10 bg-slate-900 shadow-2xl">
            {/* MODAL HEADER */}

            <div className="flex items-start justify-between border-b border-white/10 p-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-cyan-300">
                  {currentSection?.name}
                </p>

                <h2 className="mt-1 text-2xl font-black text-white">
                  {editingQuestion !== null
                    ? "Edit Question"
                    : "Create Question"}
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                  Create a coding-style assessment challenge.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* FORM */}

<div className="modal-scrollbar max-h-[65vh] space-y-5 overflow-y-auto p-6">

  {/* QUESTION TITLE */}

  <div>
    <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
      Question Title
    </label>

    <input
      value={form.title}
      onChange={(e) =>
        setForm({
          ...form,
          title: e.target.value,
        })
      }
      placeholder={
        isTechnical
          ? "Example: Reverse a String"
          : isProblemSolving
          ? "Example: Find the Missing Number"
          : isCriticalThinking
          ? "Example: Analyze a Business Decision"
          : isInterviewReadiness
          ? "Example: Explain Your Project"
          : "Example: Handling Team Conflict"
      }
      className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-400"
    />
  </div>


  {/* QUESTION / SCENARIO */}

  <div>
    <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
      {isTechnical
        ? "Problem / Question"
        : isProblemSolving
        ? "Problem / Question"
        : isCriticalThinking
        ? "Scenario / Question"
        : isInterviewReadiness
        ? "Interview Scenario / Question"
        : "Situation / Question"}
    </label>

    <textarea
      rows={5}
      value={form.question}
      onChange={(e) =>
        setForm({
          ...form,
          question: e.target.value,
        })
      }
      placeholder={
        isTechnical
          ? "Write the complete coding problem..."
          : isProblemSolving
          ? "Describe the problem that the student needs to solve..."
          : isCriticalThinking
          ? "Describe the situation and ask the student to analyze it..."
          : isInterviewReadiness
          ? "Describe the interview situation or question..."
          : "Describe a workplace or social situation..."
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
        setForm({
          ...form,
          instructions: e.target.value,
        })
      }
      placeholder={
        isTechnical
          ? "Explain what the student needs to implement..."
          : isProblemSolving
          ? "Explain how the student should approach the problem..."
          : isCriticalThinking
          ? "Explain what the student should analyze..."
          : isInterviewReadiness
          ? "Explain how the student should answer..."
          : "Explain what the student should consider in their response..."
      }
      className="mt-2 w-full resize-none rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-400"
    />
  </div>


  {/* TECHNICAL ONLY */}

  {isCodingSection && (
    <>
      {/* LANGUAGE */}

      <div className="grid gap-4 sm:grid-cols-3">

        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Language
          </label>

          <select
            value={form.language}
            onChange={(e) =>
              setForm({
                ...form,
                language: e.target.value,
              })
            }
            className="mt-2 w-full rounded-xl border border-white/10 bg-slate-800 px-4 py-3 text-sm text-white outline-none"
          >
            <option>Java</option>
            <option>Python</option>
            <option>JavaScript</option>
            <option>C</option>
            <option>C++</option>
            <option>SQL</option>
            <option>General</option>
          </select>
        </div>


        {/* DIFFICULTY */}

        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Difficulty
          </label>

          <select
            value={form.difficulty}
            onChange={(e) =>
              setForm({
                ...form,
                difficulty: e.target.value,
              })
            }
            className="mt-2 w-full rounded-xl border border-white/10 bg-slate-800 px-4 py-3 text-sm text-white outline-none"
          >
            <option>Beginner</option>
            <option>Intermediate</option>
            <option>Advanced</option>
          </select>
        </div>


        {/* POINTS */}

        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Points
          </label>

          <input
            type="number"
            min="1"
            value={form.points}
            onChange={(e) =>
              setForm({
                ...form,
                points: Number(e.target.value),
              })
            }
            className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
          />
        </div>

      </div>


      {/* STARTER CODE */}

      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Starter Code
        </label>

        <textarea
          rows={8}
          value={form.starterCode}
          onChange={(e) =>
            setForm({
              ...form,
              starterCode: e.target.value,
            })
          }
          placeholder={`public class Main {
    public static void main(String[] args) {

    }
}`}
          className="mt-2 w-full resize-none rounded-xl border border-white/10 bg-black/30 px-4 py-3 font-mono text-sm text-cyan-300 outline-none placeholder:text-slate-600 focus:border-cyan-400"
        />
      </div>


      {/* EXPECTED OUTPUT */}

      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Expected Output / Answer
        </label>

        <textarea
          rows={5}
          value={form.expectedOutput}
          onChange={(e) =>
            setForm({
              ...form,
              expectedOutput: e.target.value,
            })
          }
          placeholder="Enter expected output..."
          className="mt-2 w-full resize-none rounded-xl border border-white/10 bg-black/30 px-4 py-3 font-mono text-sm text-emerald-300 outline-none placeholder:text-slate-600 focus:border-cyan-400"
        />
      </div>
    </>
  )}


  {/* NON-CODING SECTIONS */}

  {!isCodingSection && (
    <>
      {/* DIFFICULTY + POINTS */}

      <div className="grid gap-4 sm:grid-cols-2">

        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Difficulty
          </label>

          <select
            value={form.difficulty}
            onChange={(e) =>
              setForm({
                ...form,
                difficulty: e.target.value,
              })
            }
            className="mt-2 w-full rounded-xl border border-white/10 bg-slate-800 px-4 py-3 text-sm text-white outline-none"
          >
            <option>Beginner</option>
            <option>Intermediate</option>
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
              setForm({
                ...form,
                points: Number(e.target.value),
              })
            }
            className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
          />
        </div>

      </div>


      {/* EXPECTED ANSWER */}

      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Expected Answer
        </label>

        <textarea
          rows={5}
          value={form.expectedOutput}
          onChange={(e) =>
            setForm({
              ...form,
              expectedOutput: e.target.value,
            })
          }
          placeholder={
            isProblemSolving
              ? "Describe the expected solution or approach..."
              : isCriticalThinking
              ? "Describe the key points expected in the answer..."
              : isInterviewReadiness
              ? "Describe what a strong interview answer should contain..."
              : "Describe the expected response..."
          }
          className="mt-2 w-full resize-none rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-emerald-300 outline-none placeholder:text-slate-600 focus:border-cyan-400"
        />
      </div>
    </>
  )}


  {/* EVALUATION CRITERIA */}

  <div>
    <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
      Evaluation Criteria
    </label>

    <textarea
      rows={4}
      value={form.evaluationCriteria}
      onChange={(e) =>
        setForm({
          ...form,
          evaluationCriteria: e.target.value,
        })
      }
      placeholder={
        isTechnical
          ? "Explain how the coding solution should be evaluated..."
          : isProblemSolving
          ? "Explain how the student's problem-solving approach should be evaluated..."
          : isCriticalThinking
          ? "Explain how the student's reasoning should be evaluated..."
          : isInterviewReadiness
          ? "Explain how the student's interview response should be evaluated..."
          : "Explain how the student's communication and professional response should be evaluated..."
      }
      className="mt-2 w-full resize-none rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-400"
    />
  </div>

</div>

            {/* FOOTER */}

            <div className="flex justify-end gap-3 border-t border-white/10 p-5">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="rounded-xl border border-white/10 bg-white/[0.04] px-5 py-2.5 text-sm font-bold text-slate-300 hover:bg-white/10"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSaveQuestion}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-violet-500 px-5 py-2.5 text-sm font-bold text-white"
              >
                <Save className="h-4 w-4" />

                {editingQuestion !== null
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
