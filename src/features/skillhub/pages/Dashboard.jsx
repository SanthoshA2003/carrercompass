import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import {
  Play,
  Trophy,
  Award,
  CheckCircle2,
  ArrowRight,
  Loader2,
  BookOpen,
  Target,
  AlertCircle,
  Package,
} from "lucide-react";

import Shell from "@/features/skillhub/components/Shell";
import { api } from "@/services/api";

const Card = ({ children, className = "" }) => {
  return (
    <div
      className={`rounded-3xl border border-white/5 bg-white/[0.03] p-6 backdrop-blur ${className}`}
    >
      {children}
    </div>
  );
};

export default function Dashboard() {
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [collegeCourses, setCollegeCourses] = useState(null);

  const [loading, setLoading] = useState(true);
  const [coursesLoading, setCoursesLoading] = useState(false);

  const [dashboardError, setDashboardError] = useState("");
  const [collegeCoursesError, setCollegeCoursesError] = useState("");

  const [expandedPackage, setExpandedPackage] = useState(null);

  /*
   * --------------------------------------------------
   * Fetch SkillHub Dashboard
   * --------------------------------------------------
   */

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setDashboardError("");

        const response = await api.studentSkillHubDashboard();

        console.log("SkillHub Dashboard:", response);

        setData(response);
      } catch (error) {
        console.error("Dashboard error:", error?.response?.data || error);

        setDashboardError(
          error?.response?.data?.detail || "Unable to load dashboard",
        );

        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  /*
   * --------------------------------------------------
   * Fetch College Packages
   * --------------------------------------------------
   */

  useEffect(() => {
    const collegeConnected =
      localStorage.getItem("college_connected") === "true";

    const collegeCode = localStorage.getItem("college_code");

    console.log("College Connected:", collegeConnected);
    console.log("College Code:", collegeCode);

    if (!collegeConnected || !collegeCode) {
      setCollegeCourses(null);
      setCoursesLoading(false);
      return;
    }

    const fetchCollegeCourses = async () => {
      try {
        setCoursesLoading(true);
        setCollegeCoursesError("");

        /*
         * The API uses the logged-in user's token
         * to identify the connected college.
         *
         * GET /api/students/courses
         */

        const response = await api.studentCourses();

        console.log("Student Courses Response:", response);

        setCollegeCourses(response);
      } catch (error) {
        console.error("Student courses error:", error?.response?.data || error);

        setCollegeCoursesError(
          error?.response?.data?.detail || "Unable to load college packages",
        );

        setCollegeCourses(null);
      } finally {
        setCoursesLoading(false);
      }
    };

    fetchCollegeCourses();
  }, []);

  /*
   * --------------------------------------------------
   * Loading Screen
   * --------------------------------------------------
   */

  if (loading) {
    return (
      <Shell>
        <div className="grid h-[60vh] place-items-center">
          <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
        </div>
      </Shell>
    );
  }

  /*
   * --------------------------------------------------
   * Dashboard Data
   * --------------------------------------------------
   */

  const courses = data?.continue_courses || [];

  const achievements = data?.achievements || [];

  const recentlyCompleted = data?.recently_completed || [];

  const certificates = data?.certificates || [];

  const collegeConnected = localStorage.getItem("college_connected") === "true";

  const collegeCode = localStorage.getItem("college_code") || "";

  /*
   * API Response:
   *
   * {
   *   college_id: "...",
   *   college_name: "...",
   *   college_code: "...",
   *   package_courses: [],
   *   enrolled_courses: [],
   *   courses: []
   * }
   */

  const packageCourses = collegeCourses?.package_courses || [];

  const enrolledCourses = collegeCourses?.enrolled_courses || [];

  const studentCourses = collegeCourses?.courses || [];

  /*
   * --------------------------------------------------
   * Start Course
   * --------------------------------------------------
   */

  const handleStartCourse = (course) => {
    const courseId = course.course_id || course.id || course.courseId;

    if (!courseId) {
      console.error("Course ID not found:", course);
      return;
    }

    navigate(`/skillhub/journey/${courseId}`);
  };

  return (
    <Shell>
      <div className="mx-auto max-w-6xl space-y-10">
        {/* --------------------------------------------------
            COLLEGE PACKAGES
        -------------------------------------------------- */}

        {collegeConnected && (
          <section className="space-y-6">
            {/* Section Header */}

            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-cyan-300">
                College Learning
              </p>

              <h1 className="mt-2 text-3xl font-black tracking-tight text-white">
                College Packages
              </h1>

              <p className="mt-2 text-sm text-slate-400">
                Courses and packages provided by your college.
              </p>

              {collegeCourses?.college_name && (
                <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-xs font-semibold text-cyan-300">
                  <Package className="h-4 w-4" />

                  {collegeCourses.college_name}
                </div>
              )}

              {collegeCourses?.college_code && (
                <p className="mt-2 text-xs text-slate-500">
                  College Code:{" "}
                  <span className="font-semibold text-slate-300">
                    {collegeCourses.college_code}
                  </span>
                </p>
              )}

              {!collegeCourses?.college_code && collegeCode && (
                <p className="mt-2 text-xs text-slate-500">
                  College Code:{" "}
                  <span className="font-semibold text-slate-300">
                    {collegeCode}
                  </span>
                </p>
              )}
            </div>

            {/* Loading */}

            {coursesLoading && (
              <div className="flex min-h-[220px] items-center justify-center rounded-3xl border border-white/5 bg-white/[0.03]">
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />

                  <p className="text-sm text-slate-400">
                    Loading college packages...
                  </p>
                </div>
              </div>
            )}

            {/* Error */}

            {!coursesLoading && collegeCoursesError && (
              <div className="rounded-3xl border border-red-400/20 bg-red-400/10 p-6">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-6 w-6 text-red-400" />

                  <div>
                    <h2 className="font-bold text-red-300">
                      Unable to load college packages
                    </h2>

                    <p className="mt-1 text-sm text-red-200/70">
                      {collegeCoursesError}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* No Packages */}

            {!coursesLoading &&
              !collegeCoursesError &&
              packageCourses.length === 0 && (
                <div className="rounded-3xl border border-white/5 bg-white/[0.03] p-10 text-center">
                  <BookOpen className="mx-auto h-10 w-10 text-cyan-400" />

                  <h2 className="mt-4 text-xl font-bold text-white">
                    No college packages available
                  </h2>

                  <p className="mt-2 text-sm text-slate-400">
                    Your college has not assigned any packages yet.
                  </p>
                </div>
              )}

            {/* ==========================================
    COLLEGE PACKAGE CARDS
========================================== */}

{!coursesLoading &&
  !collegeCoursesError &&
  packageCourses.length > 0 && (
    <div className="grid gap-5 lg:grid-cols-2">

      {Object.entries(
        packageCourses.reduce((packages, course) => {
          const packageName =
            course.package_name || "College Package";

          if (!packages[packageName]) {
            packages[packageName] = [];
          }

          packages[packageName].push(course);

          return packages;
        }, {})
      ).map(
        ([packageName, packageCourses], packageIndex) => {

          const isExpanded =
            expandedPackage === packageName;

          const packageDescription =
            packageCourses[0]?.package_description ||
            "Courses provided by your college.";

          return (
            <motion.div
              key={packageName}
              initial={{
                opacity: 0,
                y: 15,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: packageIndex * 0.08,
              }}
              className="
                group
                relative
                overflow-hidden
                rounded-2xl
                border
                border-white/10
                bg-gradient-to-br
                from-violet-500/20
                via-cyan-500/10
                to-slate-900
                p-5
                transition
                hover:border-cyan-400/30
              "
            >

              {/* Decorative Glow */}

              <div
                className="
                  pointer-events-none
                  absolute
                  -right-16
                  -top-16
                  h-40
                  w-40
                  rounded-full
                  bg-cyan-400/10
                  blur-3xl
                  transition
                  group-hover:bg-cyan-400/20
                "
              />

              <div className="relative">

                {/* ======================================
                    PACKAGE HEADER
                ====================================== */}

                <div className="flex items-start justify-between gap-4">

                  <div className="min-w-0">

                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-violet-300">
                      Course Package
                    </p>

                    <h2 className="mt-1 text-xl font-black text-white">
                      {packageName}
                    </h2>

                    <p className="mt-2 line-clamp-2 text-sm leading-5 text-slate-400">
                      {packageDescription}
                    </p>

                  </div>

                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-cyan-400/10 ring-1 ring-cyan-400/10">
                    <Package className="h-5 w-5 text-cyan-400" />
                  </div>

                </div>


                {/* ======================================
                    PACKAGE FOOTER
                ====================================== */}

                <div className="mt-5 flex items-center justify-between">

                  {/* Course Count */}

                  <span className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-slate-300">
                    {packageCourses.length}{" "}
                    {packageCourses.length === 1
                      ? "Course"
                      : "Courses"}
                  </span>


                  {/* View Button */}

                  <button
                    type="button"
                    onClick={() =>
                      setExpandedPackage(
                        isExpanded
                          ? null
                          : packageName
                      )
                    }
                    className="
                      inline-flex
                      items-center
                      gap-2
                      rounded-full
                      bg-white
                      px-4
                      py-2
                      text-xs
                      font-bold
                      text-slate-900
                      transition
                      hover:scale-105
                    "
                  >

                    {isExpanded
                      ? "Hide Courses"
                      : "View Courses"}

                    <ArrowRight
                      className={`h-4 w-4 transition-transform ${
                        isExpanded
                          ? "rotate-90"
                          : ""
                      }`}
                    />

                  </button>

                </div>


                {/* ======================================
                    COURSES - ONLY WHEN VIEW IS CLICKED
                ====================================== */}

                {isExpanded && (
                  <motion.div
                    initial={{
                      opacity: 0,
                      height: 0,
                    }}
                    animate={{
                      opacity: 1,
                      height: "auto",
                    }}
                    transition={{
                      duration: 0.25,
                    }}
                    className="mt-5 space-y-3"
                  >

                    {packageCourses.map((course) => {

                      const courseId =
                        course.course_id ||
                        course.id ||
                        course.courseId;

                      const courseTitle =
                        course.title ||
                        course.name ||
                        course.course_name ||
                        "Untitled Course";

                      const courseDescription =
                        course.description ||
                        "College assigned course";


                      return (
                        <div
                          key={courseId}
                          className="
                            rounded-xl
                            border
                            border-white/10
                            bg-white/[0.04]
                            p-4
                            transition
                            hover:bg-white/[0.06]
                          "
                        >

                          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                            {/* Course Information */}

                            <div className="min-w-0">

                              <h3 className="text-sm font-bold text-white">
                                {courseTitle}
                              </h3>

                              <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-400">
                                {courseDescription}
                              </p>


                              {/* Course Meta */}

                              <div className="mt-2 flex flex-wrap gap-2">

                                {course.difficulty && (
                                  <span className="rounded-full bg-violet-400/10 px-2.5 py-1 text-[10px] font-semibold text-violet-300">
                                    {course.difficulty}
                                  </span>
                                )}

                                {course.stage && (
                                  <span className="rounded-full bg-cyan-400/10 px-2.5 py-1 text-[10px] font-semibold text-cyan-300">
                                    {course.stage}
                                  </span>
                                )}

                                {course.level && (
                                  <span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-semibold text-slate-300">
                                    {course.level}
                                  </span>
                                )}

                              </div>

                            </div>


                            {/* Start Course */}

                            <button
                              type="button"
                              disabled={!courseId}
                              onClick={() =>
                                handleStartCourse(course)
                              }
                              className="
                                inline-flex
                                shrink-0
                                items-center
                                justify-center
                                gap-2
                                rounded-full
                                bg-white
                                px-4
                                py-2
                                text-xs
                                font-bold
                                text-slate-900
                                transition
                                hover:scale-105
                                disabled:cursor-not-allowed
                                disabled:opacity-50
                              "
                            >
                              Start Course

                              <ArrowRight className="h-4 w-4" />
                            </button>

                          </div>

                        </div>
                      );
                    })}

                  </motion.div>
                )}

              </div>

            </motion.div>
          );
        }
      )}

    </div>
  )}
          </section>
        )}

        {/* --------------------------------------------------
            CONTINUE LEARNING
        -------------------------------------------------- */}

        <section className="space-y-6">
          {/* Section Header */}

          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-cyan-300">
              Continue Learning
            </p>

            <h1 className="mt-2 text-3xl font-black tracking-tight text-white">
              Your Courses
            </h1>
          </div>

          {/* No Courses */}

          {courses.length === 0 && (
            <div className="rounded-3xl border border-white/5 bg-white/[0.03] p-10 text-center">
              <BookOpen className="mx-auto h-10 w-10 text-cyan-400" />

              <h2 className="mt-4 text-xl font-bold text-white">
                No enrolled courses
              </h2>

              <p className="mt-2 text-sm text-slate-400">
                Start a course to begin your learning journey.
              </p>
            </div>
          )}

          {/* Enrolled Courses */}

          <div className="grid gap-6 lg:grid-cols-2">
            {courses.map((course, index) => {
              const courseId = course.course_id || course.id || course.courseId;

              const progress = Number(course.progress_percentage) || 0;

              return (
                <motion.div
                  key={courseId || index}
                  initial={{
                    opacity: 0,
                    y: 20,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    delay: index * 0.1,
                  }}
                  className="relative overflow-hidden rounded-3xl border border-white/5 bg-gradient-to-br from-cyan-500/15 via-violet-500/10 to-slate-900 p-7"
                >
                  <div className="relative">
                    {/* Course Header */}

                    <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-start">
                      <div className="min-w-0">
                        <p className="text-xs font-semibold uppercase tracking-widest text-cyan-300">
                          {course.stage || "Learning Course"}
                        </p>

                        <h2 className="mt-2 text-2xl font-black tracking-tight text-white">
                          {course.title || course.name || "Untitled Course"}
                        </h2>

                        <p className="mt-2 text-sm text-slate-300">
                          {course.difficulty || "Beginner"} ·{" "}
                          {course.stage || "Learning"}
                        </p>

                        {/* Course Stats */}

                        <div className="mt-5 flex flex-wrap items-center gap-4 text-sm text-slate-300">
                          <span className="flex items-center gap-1.5">
                            <Target className="h-4 w-4 text-emerald-400" />
                            {course.completed_levels ?? 0}/
                            {course.total_levels ?? 0} levels
                          </span>

                          <span className="flex items-center gap-1.5">
                            <CheckCircle2 className="h-4 w-4 text-cyan-400" />
                            {progress}% completed
                          </span>
                        </div>
                      </div>

                      {/* Continue Button */}

                      <button
                        type="button"
                        disabled={!courseId}
                        onClick={() => handleStartCourse(course)}
                        className="group inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-slate-900 shadow-lg transition-transform hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Play className="h-4 w-4 fill-current" />

                        {progress === 100 ? "View Course" : "Continue"}

                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </button>
                    </div>

                    {/* Progress Bar */}

                    <div className="mt-7">
                      <div className="mb-2 flex justify-between text-xs font-semibold text-slate-400">
                        <span>Course Progress</span>

                        <span>{progress}%</span>
                      </div>

                      <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/10">
                        <motion.div
                          className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-violet-500"
                          initial={{
                            width: 0,
                          }}
                          animate={{
                            width: `${Math.min(Math.max(progress, 0), 100)}%`,
                          }}
                          transition={{
                            duration: 1,
                            delay: index * 0.1,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* --------------------------------------------------
            ACHIEVEMENTS, RECENTLY COMPLETED AND CERTIFICATES
        -------------------------------------------------- */}

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Achievements */}

          <Card>
            <h3 className="flex items-center gap-2 text-lg font-bold text-white">
              <Trophy className="h-5 w-5 text-amber-400" />
              Achievements
            </h3>

            <div className="mt-4 space-y-3">
              {achievements.length === 0 && (
                <p className="text-sm text-slate-500">
                  Complete learning milestones to earn achievements.
                </p>
              )}

              {achievements.map((achievement, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 rounded-xl border border-amber-400/30 bg-amber-400/10 p-3"
                >
                  <span className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 text-white">
                    <Trophy className="h-4 w-4" />
                  </span>

                  <span className="text-sm font-semibold text-white">
                    {achievement.label || achievement.name || "Achievement"}
                  </span>

                  <CheckCircle2 className="ml-auto h-4 w-4 text-amber-400" />
                </div>
              ))}
            </div>
          </Card>

          {/* Recently Completed */}

          <Card>
            <h3 className="flex items-center gap-2 text-lg font-bold text-white">
              <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              Recently Completed
            </h3>

            <div className="mt-4 space-y-3">
              {recentlyCompleted.length === 0 && (
                <p className="text-sm text-slate-500">
                  Complete a course to see it here.
                </p>
              )}

              {recentlyCompleted.map((courseName, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-3"
                >
                  <span className="grid h-9 w-9 place-items-center rounded-lg bg-emerald-500/15 text-emerald-400">
                    <BookOpen className="h-4 w-4" />
                  </span>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-white">
                      {courseName}
                    </p>

                    <p className="text-xs text-slate-400">Completed</p>
                  </div>

                  <CheckCircle2 className="ml-auto h-4 w-4 text-emerald-400" />
                </div>
              ))}
            </div>
          </Card>

          {/* Certificates */}

          <Card>
            <h3 className="flex items-center gap-2 text-lg font-bold text-white">
              <Award className="h-5 w-5 text-violet-400" />
              Certificates
            </h3>

            <div className="mt-4 space-y-3">
              {certificates.length === 0 && (
                <p className="text-sm text-slate-500">
                  Complete a full stage to earn a certificate.
                </p>
              )}

              {certificates.map((certificate, index) => (
                <div
                  key={index}
                  className="rounded-xl border border-violet-400/30 bg-gradient-to-br from-violet-500/15 to-cyan-500/10 p-4"
                >
                  <Award className="h-5 w-5 text-violet-300" />

                  <p className="mt-2 text-sm font-bold text-white">
                    {certificate.stage || "Course"} Certificate
                  </p>

                  <p className="text-xs text-slate-400">
                    {certificate.course || ""}
                  </p>
                </div>
              ))}

              {courses.length > 0 && (
                <Link
                  to={`/skillhub/journey/${
                    courses[0].course_id || courses[0].id || courses[0].courseId
                  }`}
                  className="mt-2 flex items-center justify-center gap-2 rounded-xl border border-white/10 py-2.5 text-sm font-semibold text-cyan-400 transition-colors hover:bg-white/5"
                >
                  View Full Journey
                  <ArrowRight className="h-4 w-4" />
                </Link>
              )}
            </div>
          </Card>
        </div>
      </div>
    </Shell>
  );
}
