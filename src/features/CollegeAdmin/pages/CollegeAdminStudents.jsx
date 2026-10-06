import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Users,
  Mail,
  BookOpen,
  Trophy,
  Flame,
  Loader2,
} from "lucide-react";
import { api } from "@/services/api";

const getInitials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0))
    .slice(0, 2)
    .join("")
    .toUpperCase();

export default function CollegeAdminStudents() {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.collegeAdminStudents();

        console.log("COLLEGE ADMIN STUDENTS:", response);

        setStudents(
          Array.isArray(response?.students)
            ? response.students
            : []
        );
      } catch (error) {
        console.error(
          "Failed to fetch college students:",
          error?.response?.data || error
        );

        setError(
          error?.response?.data?.detail ||
            error?.response?.data?.message ||
            "Failed to load students."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  const filteredStudents = students.filter((student) => {
    const value = search.trim().toLowerCase();

    return (
      !value ||
      (student.name || "").toLowerCase().includes(value) ||
      (student.email || "").toLowerCase().includes(value) ||
      (student.student_code || "").toLowerCase().includes(value)
    );
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617]">
        <div className="flex min-h-screen items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
            <p className="text-sm text-slate-400">
              Loading students...
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

  return (
    <div className="min-h-screen bg-[#020617]">
      <div className="mx-auto max-w-[1400px] px-5 py-8 sm:px-6 lg:px-8">

        {/* HEADER */}
        <section>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-400">
            College Students
          </p>

          <h1 className="mt-2 text-3xl font-black tracking-tight text-white">
            Students
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            Manage and track students in your college.
          </p>
        </section>

        {/* SEARCH */}
        <div className="mt-6 max-w-2xl">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-600" />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search students by name, email or student code..."
              className="w-full rounded-xl border border-white/10 bg-[#080d1d] py-3.5 pl-12 pr-4 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-400/50"
            />
          </div>
        </div>

        {/* COUNT */}
        <div className="mt-5 flex items-center gap-3">
          <span className="rounded-full border border-cyan-400/10 bg-cyan-400/10 px-3 py-1.5 text-xs font-bold text-cyan-400">
            <Users className="mr-1 inline h-3.5 w-3.5" />
            {filteredStudents.length} Students
          </span>
        </div>

        {/* STUDENTS */}
        <div className="mt-7 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredStudents.map((student, index) => (
 <div
  key={student.id || student.user_id || student.email || index}
  onClick={() => {
    const studentId =
      student.student_id ||
      student.user_id ||
      student.id;

    console.log("Selected Student:", student);
    console.log("Selected Student ID:", studentId);

    if (!studentId) {
      console.error("Student ID not found:", student);
      return;
    }

    navigate(
      `/college-admin/students/${studentId}/dashboard`
    );
  }}
  className="group cursor-pointer rounded-2xl border border-white/5 bg-[#080d1d] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-cyan-400/30 hover:bg-[#0b1224] active:scale-[0.99]"
>
              {/* PROFILE */}
              <div className="flex items-center gap-4">
                <div className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-gradient-to-br from-cyan-400 to-violet-500 text-sm font-black text-white">
                  {getInitials(student.name || "Student")}
                </div>

                <div className="min-w-0">
                  <h2 className="truncate text-base font-bold text-white">
                    {student.name || "Unknown Student"}
                  </h2>

                  <p className="mt-1 flex items-center gap-1 truncate text-xs text-slate-500">
                    <Mail className="h-3.5 w-3.5 shrink-0" />
                    {student.email || "-"}
                  </p>

                  <p className="mt-1 text-xs font-semibold text-cyan-400">
                    Student Code: {student.student_code || "-"}
                  </p>
                </div>
              </div>

              {/* PROGRESS */}
              <div className="mt-6">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">
                    Learning Progress
                  </span>

                  <span className="font-bold text-cyan-400">
                    {student.progress_percentage ?? 0}%
                  </span>
                </div>

                <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/5">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-violet-500"
                    style={{
                      width: `${student.progress_percentage ?? 0}%`,
                    }}
                  />
                </div>
              </div>

              {/* STATS */}
              <div className="mt-6 grid grid-cols-4 gap-2 border-t border-white/5 pt-5">

                {/* XP */}
                <div>
                  <p className="text-[10px] uppercase text-slate-600">
                    XP
                  </p>

                  <p className="mt-1 text-sm font-bold text-cyan-400">
                    {student.xp ?? 0}
                  </p>
                </div>

                {/* STREAK */}
                <div>
                  <p className="text-[10px] uppercase text-slate-600">
                    Streak
                  </p>

                  <p className="mt-1 text-sm font-bold text-amber-400">
                    {student.streak ?? 0}
                    <Flame className="ml-0.5 inline h-3.5 w-3.5" />
                  </p>
                </div>

                {/* COURSES */}
                <div>
                  <p className="text-[10px] uppercase text-slate-600">
                    Courses
                  </p>

                  <p className="mt-1 flex items-center gap-1 text-sm font-bold text-violet-400">
                    <BookOpen className="h-3.5 w-3.5" />
                    {student.courses ?? 0}
                  </p>
                </div>

                {/* LEVELS */}
                <div>
                  <p className="text-[10px] uppercase text-slate-600">
                    Levels
                  </p>

                  <p className="mt-1 flex items-center gap-1 text-sm font-bold text-emerald-400">
                    <Trophy className="h-3.5 w-3.5" />
                    {student.levels ?? 0}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* EMPTY */}
        {filteredStudents.length === 0 && (
          <div className="mt-8 rounded-2xl border border-dashed border-white/10 p-12 text-center">
            <Users className="mx-auto h-10 w-10 text-slate-700" />

            <p className="mt-3 text-sm font-semibold text-slate-500">
              {search
                ? "No students match your search"
                : "No students found"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}