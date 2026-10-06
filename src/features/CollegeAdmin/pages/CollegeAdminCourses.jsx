import { useEffect, useState } from "react";
import {
  BookOpen,
  Users,
  Layers,
  TrendingUp,
  Loader2,
} from "lucide-react";
import { api } from "@/services/api";

const gradients = {
  cyan: "from-cyan-400 to-blue-500",
  violet: "from-violet-400 to-fuchsia-500",
  emerald: "from-emerald-400 to-cyan-500",
  blue: "from-blue-400 to-indigo-500",
  pink: "from-pink-400 to-violet-500",
  orange: "from-orange-400 to-pink-500",
};

const getGradient = (index) => {
  const colors = Object.keys(gradients);
  return colors[index % colors.length];
};

export default function CollegeAdminCourses() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.collegeAdminCourses();

        console.log("COLLEGE ADMIN COURSES:", response);

        setDashboard(response);
      } catch (error) {
        console.error(
          "Failed to fetch college courses:",
          error?.response?.data || error
        );

        setError(
          error?.response?.data?.detail ||
            error?.response?.data?.message ||
            "Failed to load courses."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617]">
        <div className="flex min-h-screen items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />

            <p className="text-sm text-slate-400">
              Loading courses...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#020617] px-6 py-10">
        <div className="mx-auto max-w-2xl rounded-2xl border border-rose-400/20 bg-rose-400/10 p-6">
          <p className="text-sm font-semibold text-rose-300">
            {error}
          </p>
        </div>
      </div>
    );
  }

  const courses = Array.isArray(dashboard?.courses)
    ? dashboard.courses
    : [];

  return (
    <div className="min-h-screen bg-[#020617]">
      <div className="mx-auto max-w-[1400px] px-5 py-8 sm:px-6 lg:px-8">

        {/* HEADER */}
        <section>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-400">
            College Learning
          </p>

          <h1 className="mt-2 text-3xl font-black tracking-tight text-white">
            Courses
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            View courses assigned to your college students.
          </p>
        </section>

        {/* SUMMARY */}
        <section className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

          {/* TOTAL COURSES */}
          <div className="rounded-2xl border border-white/5 bg-[#080d1d] p-5 transition hover:border-cyan-400/20">
            <BookOpen className="h-5 w-5 text-cyan-400" />

            <p className="mt-4 text-3xl font-black text-white">
              {dashboard?.total_courses ?? 0}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Total Courses
            </p>
          </div>

          {/* ENROLLMENTS */}
          <div className="rounded-2xl border border-white/5 bg-[#080d1d] p-5 transition hover:border-violet-400/20">
            <Users className="h-5 w-5 text-violet-400" />

            <p className="mt-4 text-3xl font-black text-white">
              {dashboard?.total_enrollments ?? 0}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Course Enrollments
            </p>
          </div>

          {/* LEVELS */}
          <div className="rounded-2xl border border-white/5 bg-[#080d1d] p-5 transition hover:border-emerald-400/20">
            <Layers className="h-5 w-5 text-emerald-400" />

            <p className="mt-4 text-3xl font-black text-white">
              {dashboard?.total_levels ?? 0}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Total Levels
            </p>
          </div>

          {/* PROGRESS */}
          <div className="rounded-2xl border border-white/5 bg-[#080d1d] p-5 transition hover:border-amber-400/20">
            <TrendingUp className="h-5 w-5 text-amber-400" />

            <p className="mt-4 text-3xl font-black text-white">
              {dashboard?.average_progress ?? 0}%
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Average Progress
            </p>
          </div>
        </section>

        {/* COURSE CARDS */}
        <section className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">

          {courses.map((course, index) => {
            const gradient = getGradient(index);

            const progress = Number(
              course.progress_percentage ?? 0
            );

            return (
              <div
                key={course.course_id || index}
                className="group overflow-hidden rounded-2xl border border-white/5 bg-[#080d1d] transition-all duration-300 hover:-translate-y-1 hover:border-cyan-400/20"
              >

                {/* TOP GRADIENT */}
                <div className="relative h-2 overflow-hidden">
                  <div
                    className={`absolute inset-0 bg-gradient-to-r ${gradients[gradient]}`}
                  />
                </div>

                <div className="p-6">

                  {/* TITLE */}
                  <div className="flex items-start justify-between gap-4">

                    <div className="min-w-0">

                      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-400">
                        {course.category || "Course"}
                      </p>

                      <h2 className="mt-2 text-xl font-black text-white">
                        {course.title || "Untitled Course"}
                      </h2>

                    </div>

                    <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white/[0.04]">
                      <BookOpen className="h-5 w-5 text-cyan-400" />
                    </div>
                  </div>

                  {/* DESCRIPTION */}
                  {course.description && (
                    <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-500">
                      {course.description}
                    </p>
                  )}

                  {/* COURSE INFO */}
                  <div className="mt-4 flex flex-wrap gap-2">

                    {course.language && (
                      <span className="rounded-full bg-cyan-400/10 px-3 py-1 text-[11px] font-semibold text-cyan-400">
                        {course.language}
                      </span>
                    )}

                    {course.difficulty && (
                      <span className="rounded-full bg-violet-400/10 px-3 py-1 text-[11px] font-semibold text-violet-400">
                        {course.difficulty}
                      </span>
                    )}

                    {course.duration && (
                      <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-[11px] font-semibold text-emerald-400">
                        {course.duration}
                      </span>
                    )}

                  </div>

                  {/* PROGRESS */}
                  <div className="mt-7">

                    <div className="flex items-center justify-between">

                      <span className="text-xs text-slate-500">
                        Course Progress
                      </span>

                      <span className="text-sm font-black text-cyan-400">
                        {progress}%
                      </span>

                    </div>

                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/5">

                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${gradients[gradient]}`}
                        style={{
                          width: `${Math.min(
                            Math.max(progress, 0),
                            100
                          )}%`,
                        }}
                      />

                    </div>
                  </div>

                  {/* META */}
                  <div className="mt-6 grid grid-cols-2 gap-3">

                    <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
                      <p className="text-[10px] uppercase tracking-wider text-slate-600">
                        Students
                      </p>

                      <p className="mt-1 text-lg font-black text-white">
                        {course.students ?? 0}
                      </p>
                    </div>

                    <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
                      <p className="text-[10px] uppercase tracking-wider text-slate-600">
                        Levels
                      </p>

                      <p className="mt-1 text-lg font-black text-white">
                        {course.levels ?? 0}
                      </p>
                    </div>

                  </div>

                  {/* FOOTER */}
                  {/* <div className="mt-5 flex items-center justify-between border-t border-white/5 pt-5">

                    <span className="text-xs text-slate-500">
                      College Assigned
                    </span>

                    <span className="text-xs font-bold text-cyan-400">
                      View Details →
                    </span>

                  </div> */}

                </div>
              </div>
            );
          })}

        </section>

        {/* EMPTY STATE */}
        {courses.length === 0 && (
          <div className="mt-8 rounded-2xl border border-dashed border-white/10 p-12 text-center">
            <BookOpen className="mx-auto h-10 w-10 text-slate-700" />

            <p className="mt-3 text-sm font-semibold text-slate-500">
              No courses assigned to this college yet.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}