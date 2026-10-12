
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  Play,
  Loader2,
  ArrowRight,
  CheckCircle2,
  Layers3,
  Clock3,
  GraduationCap,
} from "lucide-react";
import { motion } from "framer-motion";
import Shell from "@/features/skillhub/components/Shell";
import { api } from "@/services/api";

export default function CoursesPage() {
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const loadCourses = async () => {
      try {
        const response = await api.studentSkillHubDashboard();

        if (!active) return;

        const enrolled =
          response?.enrolled_courses ??
          response?.continue_courses ??
          response?.courses ??
          (response?.continue_course
            ? [response.continue_course]
            : []);

        const summary = response?.continue_course;
        const courseList = Array.isArray(enrolled) ? enrolled : [];

        const updatedCourses = courseList.map((course) => {
          const courseId = course.course_id || course.id;
          const summaryId = summary?.course_id || summary?.id;

          const matches =
            summary &&
            (courseId === summaryId ||
              course.title === summary.title ||
              course.name === summary.title);

          return matches ? { ...course, ...summary } : course;
        });

        setCourses(updatedCourses);
        setError("");
      } catch (err) {
        if (active) {
          setError(
            err?.response?.data?.detail ||
              "Unable to load your enrolled courses."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    loadCourses();

    return () => {
      active = false;
    };
  }, []);

  const getCourseStats = (course) => {
    const levels = Array.isArray(course.levels)
      ? course.levels
      : [];

    const totalLevels =
      Number(course.total_levels ?? course.level_count) ||
      levels.length ||
      4;

    const completedFromLevels = levels.filter(
      (level) =>
        level.completed === true ||
        level.status === "completed"
    ).length;

    const completed = Math.max(
      0,
      Number(
        course.completed_levels ??
          course.completedLevels ??
          completedFromLevels
      ) || 0
    );

    const rawProgress =
      course.progress_percentage ?? course.progressPct;

    const progress = Math.min(
      100,
      Math.max(
        0,
        rawProgress != null && rawProgress !== ""
          ? Number(rawProgress) || 0
          : Math.round((completed / totalLevels) * 100)
      )
    );

    return { levels, totalLevels, completed, progress };
  };

  const completedCourses = courses.filter(
    (course) => getCourseStats(course).progress >= 100
  ).length;

  return (
    <Shell>
      <div className="min-h-screen space-y-6 bg-[#020617] p-4 text-white md:p-2">

        {/* Compact page header */}
        <motion.header
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col justify-between gap-4 border-b border-white/10 pb-5 sm:flex-row sm:items-end"
        >
          <div>
            <div className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-cyan-400">
              <GraduationCap className="h-4 w-4" />
              My Learning
            </div>

            <h1 className="text-2xl font-black tracking-tight text-white md:text-3xl">
              My Courses
            </h1>

            <p className="mt-2 text-sm text-slate-400">
              Continue learning and track your course progress.
            </p>
          </div>

          {!loading && !error && (
            <div className="flex shrink-0 items-center gap-2">
              <div className="rounded-lg border border-white/10 bg-[#0b1120] px-3 py-2">
                <p className="text-lg font-bold text-white">
                  {courses.length}
                </p>
                <p className="text-[11px] text-slate-400">
                  Enrolled
                </p>
              </div>

              <div className="rounded-lg border border-emerald-400/15 bg-emerald-400/5 px-3 py-2">
                <p className="text-lg font-bold text-emerald-300">
                  {completedCourses}
                </p>
                <p className="text-[11px] text-slate-400">
                  Completed
                </p>
              </div>
            </div>
          )}
        </motion.header>

        {/* Section heading */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold text-white">
              Continue Learning
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              Pick up where you left off.
            </p>
          </div>

          {!loading && !error && courses.length > 0 && (
            <span className="text-xs text-slate-500">
              {courses.length}{" "}
              {courses.length === 1 ? "course" : "courses"} available
            </span>
          )}
        </div>

        {/* Loading state */}
        {loading ? (
          <div className="grid min-h-48 place-items-center">
            <div className="text-center">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-cyan-400" />
              <p className="mt-3 text-sm text-slate-400">
                Loading your courses...
              </p>
            </div>
          </div>
        ) : error ? (
          <div className="rounded-xl border border-red-400/20 bg-red-400/5 p-5">
            <h3 className="font-bold text-red-300">
              Unable to load courses
            </h3>
            <p className="mt-2 text-sm text-slate-400">{error}</p>

            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-3 rounded-lg border border-red-400/20 px-3 py-2 text-sm text-red-300 hover:bg-red-400/10"
            >
              Try Again
            </button>
          </div>
        ) : courses.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/15 px-5 py-12 text-center">
            <BookOpen className="mx-auto h-8 w-8 text-cyan-300" />
            <h3 className="mt-4 font-bold text-white">
              No courses yet
            </h3>
            <p className="mt-2 text-sm text-slate-400">
              Your enrolled courses will appear here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-2 2xl:grid-cols-3">
            {courses.map((course, index) => {
              const id =
                course.course_id || course.id || course.courseId;

              const title =
                course.title || course.name || "Untitled Course";

              const stage = course.stage || "BEGINNER";
              const difficulty = course.difficulty || "Beginner";

              const description =
                course.description ||
                "Build your skills with guided lessons and practical activities.";

              const {
                levels,
                totalLevels,
                completed,
                progress,
              } = getCourseStats(course);

              return (
                <motion.article
                  key={id || index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="group w-full overflow-hidden rounded-xl border border-white/10 bg-[#0b1120] transition duration-300 hover:border-cyan-400/30 hover:shadow-lg hover:shadow-cyan-950/20"
                >
                  {/* Compact course header */}
                  <div className="relative overflow-hidden border-b border-white/10 bg-gradient-to-br from-[#10243a] via-[#12172e] to-[#17132c] p-4">
                    <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-cyan-400/10 blur-2xl" />

                    <div className="relative flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <span className="inline-flex rounded-md border border-cyan-400/20 bg-cyan-400/10 px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-cyan-300">
                          {stage}
                        </span>

                        <h3 className="mt-3 break-words text-lg font-bold text-white">
                          {title}
                        </h3>

                        <p className="mt-1.5 line-clamp-2 text-xs leading-5 text-slate-400">
                          {description}
                        </p>
                      </div>

                      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-white/10 bg-white/5 text-cyan-300">
                        <BookOpen className="h-5 w-5" />
                      </div>
                    </div>

                    {/* Course details */}
                    <div className="relative mt-4 flex flex-wrap gap-2">
                      <span className="rounded-md border border-white/10 bg-black/10 px-2.5 py-1 text-[11px] text-slate-300">
                        {difficulty}
                      </span>

                      <span className="flex items-center gap-1 rounded-md border border-white/10 bg-black/10 px-2.5 py-1 text-[11px] text-slate-300">
                        <Layers3 className="h-3 w-3 text-violet-300" />
                        {totalLevels} levels
                      </span>

                      {course.duration && (
                        <span className="flex items-center gap-1 rounded-md border border-white/10 bg-black/10 px-2.5 py-1 text-[11px] text-slate-300">
                          <Clock3 className="h-3 w-3 text-cyan-300" />
                          {course.duration}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Compact progress section */}
                  <div className="p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold text-white">
                          Your Progress
                        </p>
                        <p className="mt-1 text-[11px] text-slate-500">
                          {completed}/{totalLevels} levels completed
                        </p>
                      </div>

                      <span className="text-xl font-black tabular-nums text-cyan-300">
                        {progress}%
                      </span>
                    </div>

                    <div
                      className="mt-3 h-2 overflow-hidden rounded-full bg-white/10"
                      role="progressbar"
                      aria-label={`${title} progress`}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={progress}
                    >
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-violet-500 transition-all duration-700"
                        style={{ width: `${progress}%` }}
                      />
                    </div>

                    {/* Compact levels */}
                    {levels.length > 0 && (
                      <div className="mt-5">
                        <div className="mb-2 flex items-center justify-between">
                          <h4 className="text-xs font-semibold text-white">
                            Course Levels
                          </h4>
                          <span className="text-[10px] text-slate-500">
                            {levels.length} available
                          </span>
                        </div>

                        <div className="space-y-1.5">
                          {levels.map((level, levelIndex) => {
                            const levelId =
                              level.id || level.level_id;

                            const isCompleted =
                              level.completed === true ||
                              level.status === "completed";

                            return (
                              <button
                                key={levelId || levelIndex}
                                type="button"
                                disabled={!levelId}
                                onClick={() =>
                                  navigate(`/skillhub/level/${levelId}`)
                                }
                                className="flex w-full items-center justify-between gap-2 rounded-lg border border-white/[0.07] bg-white/[0.02] px-2.5 py-2 text-left transition hover:border-cyan-400/20 hover:bg-white/[0.04] disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                <span className="flex min-w-0 items-center gap-2.5">
                                  <span
                                    className={`grid h-7 w-7 shrink-0 place-items-center rounded-md ${
                                      isCompleted
                                        ? "bg-emerald-400/10 text-emerald-300"
                                        : "bg-cyan-400/10 text-cyan-300"
                                    }`}
                                  >
                                    {isCompleted ? (
                                      <CheckCircle2 className="h-4 w-4" />
                                    ) : (
                                      <span className="text-xs font-bold">
                                        {levelIndex + 1}
                                      </span>
                                    )}
                                  </span>

                                  <span className="min-w-0">
                                    <span className="block truncate text-xs font-medium text-slate-200">
                                      {level.title ||
                                        level.name ||
                                        `Level ${levelIndex + 1}`}
                                    </span>
                                    <span
                                      className={`mt-0.5 block text-[10px] ${
                                        isCompleted
                                          ? "text-emerald-400"
                                          : "text-slate-500"
                                      }`}
                                    >
                                      {isCompleted
                                        ? "Completed"
                                        : "Not completed"}
                                    </span>
                                  </span>
                                </span>

                                <ArrowRight className="h-3.5 w-3.5 shrink-0 text-slate-500" />
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Compact action button */}
                    <div className="mt-4 border-t border-white/[0.07] pt-4">
                      <button
                        type="button"
                        disabled={!id}
                        onClick={() =>
                          navigate(`/skillhub/journey/${id}`)
                        }
                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-cyan-500 to-violet-600 px-4 py-2.5 text-xs font-bold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Play className="h-3.5 w-3.5" />
                        {progress >= 100
                          ? "Review Journey"
                          : progress > 0
                            ? "Continue Learning"
                            : "Start Learning"}
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>
        )}
      </div>
    </Shell>
  );
}
