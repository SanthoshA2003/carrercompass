import { useEffect, useState } from "react";
import {
  Users,
  BookOpen,
  TrendingUp,
  UserCheck,
  Activity,
  Trophy,
  Video,
  Code2,
  Loader2,
} from "lucide-react";
import { api } from "@/services/api";


const getInitials = (name) =>
  name
    .split(" ")
    .map((word) => word[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

const colorMap = {
  cyan: {
    box: "bg-cyan-400/10",
    icon: "text-cyan-400",
    value: "text-cyan-400",
  },
  emerald: {
    box: "bg-emerald-400/10",
    icon: "text-emerald-400",
    value: "text-emerald-400",
  },
  violet: {
    box: "bg-violet-400/10",
    icon: "text-violet-400",
    value: "text-violet-400",
  },
  blue: {
    box: "bg-blue-400/10",
    icon: "text-blue-400",
    value: "text-blue-400",
  },
  amber: {
    box: "bg-amber-400/10",
    icon: "text-amber-400",
    value: "text-amber-400",
  },
  pink: {
    box: "bg-pink-400/10",
    icon: "text-pink-400",
    value: "text-pink-400",
  },
  orange: {
    box: "bg-orange-400/10",
    icon: "text-orange-400",
    value: "text-orange-400",
  },
};

export default function CollegeAdminDashboard() {
const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  let user = {};

  try {
    user = JSON.parse(
      localStorage.getItem("college_admin_user") || "{}"
    );
  } catch {
    user = {};
  }

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.collegeAdminDashboard();

        console.log("COLLEGE ADMIN DASHBOARD:", response);

        setDashboard(response);
      } catch (error) {
        console.error(
          "Failed to fetch college admin dashboard:",
          error?.response?.data || error
        );

        setError(
          error?.response?.data?.detail ||
            error?.response?.data?.message ||
            "Failed to load dashboard"
        );
      } finally {
        setLoading(false);
      }
    };
     fetchDashboard();
  }, []);

  if (loading) {
  return (
    <div className="min-h-screen bg-[#020617]">
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
          <p className="text-sm text-slate-400">
            Loading dashboard...
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

  const stats = dashboard
    ? [
        {
          title: "Total Students",
          value: dashboard.total_students ?? 0,
          icon: Users,
          color: "cyan",
        },
        {
          title: "Active Students",
          value: dashboard.active_students ?? 0,
          icon: Activity,
          color: "emerald",
        },
        {
          title: "Assigned Courses",
          value: dashboard.assigned_courses ?? 0,
          icon: BookOpen,
          color: "violet",
        },
        {
          title: "Average Progress",
          value: `${dashboard.average_progress ?? 0}%`,
          icon: TrendingUp,
          color: "blue",
        },
        {
          title: "Completed Levels",
          value: dashboard.completed_levels ?? 0,
          icon: Trophy,
          color: "amber",
        },
        {
          title: "Learning Videos",
          value: dashboard.learning_videos ?? 0,
          icon: Video,
          color: "pink",
        },
        {
          title: "Coding Challenges",
          value: dashboard.coding_challenges ?? 0,
          icon: Code2,
          color: "orange",
        },
        {
          title: "Active This Week",
          value: dashboard.active_this_week ?? 0,
          icon: UserCheck,
          color: "cyan",
        },
      ]
    : [];

  const students = dashboard?.recently_active_students || [];
  const courses = dashboard?.course_performance || [];

  return (
    <div className="min-h-screen bg-[#020617]">
      <div className="mx-auto max-w-[1400px] px-5 py-8 sm:px-6 lg:px-8">
        {/* HEADER */}
        <section>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-400">
            College Overview
          </p>

          <h1 className="mt-2 text-3xl font-black tracking-tight text-white sm:text-4xl">
            Welcome back,{" "}
{dashboard?.college_name || user?.name || "College Admin"} 👋
          </h1>

          <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-slate-500"> COllege Code:{" "}
  {dashboard?.college_code || ""}
</p>

          <p className="mt-2 text-sm text-slate-400">
            Monitor students, courses and learning
            performance from one place.
          </p>
        </section>

        {/* STATS */}
        <section className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            const colors = colorMap[stat.color];

            return (
              <div
                key={stat.title}
                className="group rounded-2xl border border-white/5 bg-[#080d1d] p-5 transition-all duration-300 hover:-translate-y-1 hover:border-cyan-400/20"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      {stat.title}
                    </p>

                    <p
                      className={`mt-3 text-3xl font-black ${colors.value}`}
                    >
                      {stat.value}
                    </p>
                  </div>

                  <div
                    className={`grid h-11 w-11 place-items-center rounded-xl ${colors.box}`}
                  >
                    <Icon
                      className={`h-5 w-5 ${colors.icon}`}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </section>

        {/* CONTENT */}
        <section className="mt-8 grid gap-6 lg:grid-cols-2">
          {/* RECENT STUDENTS */}
          <div className="overflow-hidden rounded-2xl border border-white/5 bg-[#080d1d]">
            <div className="flex items-center justify-between border-b border-white/5 px-6 py-5">
              <div>
                <h2 className="text-lg font-black text-white">
                  Recently Active Students
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Latest student activity
                </p>
              </div>

              <a
                href="/college-admin/students"
                className="text-xs font-bold text-cyan-400 hover:text-cyan-300"
              >
                View All →
              </a>
            </div>

            <div className="divide-y divide-white/5">
              {students.map((student, index) => (
  <div
    key={student.email || student.user_id || index}
    className="flex items-center gap-4 px-6 py-4 transition hover:bg-white/[0.02]"
  >
    <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gradient-to-br from-cyan-400 to-violet-500 text-xs font-black text-white">
      {getInitials(student.name || "Student")}
    </div>

    <div className="min-w-0 flex-1">
      <p className="truncate text-sm font-bold text-white">
        {student.name || "Unknown Student"}
      </p>

      <p className="truncate text-xs text-slate-500">
        {student.email || "-"}
      </p>
    </div>

    <div className="hidden items-center gap-6 sm:flex">
      <div>
        <p className="text-[10px] uppercase text-slate-600">
          XP
        </p>

        <p className="mt-1 text-sm font-bold text-cyan-400">
          {student.xp ?? 0}
        </p>
      </div>

      <div>
        <p className="text-[10px] uppercase text-slate-600">
          Streak
        </p>

        <p className="mt-1 text-sm font-bold text-amber-400">
          {student.streak ?? 0} 🔥
        </p>
      </div>

      <div>
        <p className="text-[10px] uppercase text-slate-600">
          Levels
        </p>

        <p className="mt-1 text-sm font-bold text-emerald-400">
          {student.levels ?? 0}
        </p>
      </div>
    </div>
  </div>
))}
            </div>
          </div>

          {/* COURSE PERFORMANCE */}
          <div className="overflow-hidden rounded-2xl border border-white/5 bg-[#080d1d]">
            <div className="border-b border-white/5 px-6 py-5">
              <h2 className="text-lg font-black text-white">
                Course Performance
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Student participation and progress
              </p>
            </div>

            <div className="space-y-7 p-6">
              {courses.map((course, index) => (
  <div key={course.name || course.course_id || index}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-bold text-white">
          {course.name || course.course_name || "Course"}
        </p>

        <p className="mt-1 text-xs text-slate-500">
          {course.students ?? course.student_count ?? 0} students
        </p>
      </div>

      <span className="text-sm font-black text-cyan-400">
        {course.progress ?? course.average_progress ?? 0}%
      </span>
    </div>

    <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/5">
      <div
        className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-violet-500"
        style={{
          width: `${course.progress ?? course.average_progress ?? 0}%`,
        }}
      />
    </div>
  </div>
))}
            </div>
          </div>
        </section>

        {/* BOTTOM */}
        <section className="mt-6 grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-cyan-400/10 bg-gradient-to-br from-cyan-400/[0.08] to-transparent p-6">
            <Users className="h-6 w-6 text-cyan-400" />

            <h3 className="mt-4 text-base font-bold text-white">
              Student Engagement
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Track active learners and identify students
              who need additional support.
            </p>
          </div>

          <div className="rounded-2xl border border-violet-400/10 bg-gradient-to-br from-violet-400/[0.08] to-transparent p-6">
            <BookOpen className="h-6 w-6 text-violet-400" />

            <h3 className="mt-4 text-base font-bold text-white">
              Course Management
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              View assigned courses and monitor learning
              progress across your college.
            </p>
          </div>

          <div className="rounded-2xl border border-emerald-400/10 bg-gradient-to-br from-emerald-400/[0.08] to-transparent p-6">
            <TrendingUp className="h-6 w-6 text-emerald-400" />

            <h3 className="mt-4 text-base font-bold text-white">
              Performance
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Understand overall learning performance and
              improve student outcomes.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}