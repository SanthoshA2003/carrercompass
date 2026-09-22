import { useEffect, useState } from "react";
import { Loader2, Award, Search, ChevronDown } from "lucide-react";
import Shell from "@/features/skillhub/components/Shell";
import { api } from "@/services/api";

export function AdminStudents() {
 const [students, setStudents] = useState(null);
const [search, setSearch] = useState("");
const [selectedCollege, setSelectedCollege] = useState("");

const colleges = Array.from(
  new Map(
    (students || [])
      .filter(
        (student) =>
          student.college_id &&
          student.college_name
      )
      .map((student) => [
        student.college_id,
        {
          id: student.college_id,
          name: student.college_name,
          code: student.college_code,
        },
      ])
  ).values()
);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const data = await api.students();

        console.log("Students:", data);

        setStudents(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error(
          "Failed to fetch students:",
          error.response?.data || error
        );

        setStudents([]);
      }
    };

    fetchStudents();
  }, []);

const filteredStudents =
  students?.filter((student) => {
    const searchValue = search.trim().toLowerCase();

    const matchesSearch =
      !searchValue ||
      student.name?.toLowerCase().includes(searchValue) ||
      student.email?.toLowerCase().includes(searchValue) ||
      student.student_code?.toLowerCase().includes(searchValue) ||
      student.college_code?.toLowerCase().includes(searchValue);

    const matchesCollege =
      !selectedCollege ||
      student.college_id === selectedCollege;

    return matchesSearch && matchesCollege;
  }) || [];

  if (students === null) {
    return (
      <Shell>
        <div className="grid h-[60vh] place-items-center">
          <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="mx-auto max-w-6xl px-6 py-8">
        <h1 className="text-3xl font-black tracking-tight text-white">
          Students
        </h1>

        <p className="mt-2 text-slate-400">
          Manage and track every enrolled student.
        </p>

{/* SEARCH + COLLEGE FILTER */}

{students.length > 0 && (
  <div className="mt-6 flex flex-col gap-3 sm:flex-row">

    {/* SEARCH */}

    <div className="relative w-full sm:max-w-xl">
      <Search
        size={18}
        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
      />

      <input
        type="text"
        value={search}
        onChange={(e) =>
          setSearch(e.target.value)
        }
        placeholder="Search by name, email, student code or college code..."
        className="w-full rounded-xl border border-white/10 bg-white/[0.03] py-3 pl-11 pr-4 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-400"
      />
    </div>

    {/* COLLEGE FILTER */}

    <div className="relative w-full sm:w-80">

      <select
        value={selectedCollege}
        onChange={(e) =>
          setSelectedCollege(e.target.value)
        }
        className="w-full appearance-none rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 pr-10 text-sm text-white outline-none focus:border-cyan-400"
      >

        <option
          value=""
          className="bg-slate-900"
        >
          All Colleges
        </option>

        {colleges.map((college) => (
          <option
            key={college.id}
            value={college.id}
            className="bg-slate-900"
          >
            {college.name}
            {college.code
              ? ` (${college.code})`
              : ""}
          </option>
        ))}

      </select>

      <ChevronDown
        size={18}
        className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-500"
      />

    </div>

  </div>
)}

        {students.length === 0 ? (
  <div className="mt-8 rounded-2xl border border-dashed border-white/10 p-10 text-center text-slate-500">
    No students found.
  </div>
) : filteredStudents.length === 0 ? (
  <div className="mt-8 rounded-2xl border border-dashed border-white/10 p-10 text-center text-slate-500">
    No students found matching "{search}".
  </div>
) : (
  <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
    {filteredStudents.map((student) => (
      <div
        key={student.id}
        className="rounded-2xl border border-slate-700/60 bg-slate-900/60 p-6 transition hover:border-slate-600"
      >
        {/* Student Details */}
        <div className="flex items-center gap-4">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-gradient-to-br from-cyan-400 to-violet-500 text-lg font-bold text-white">
            {student.name?.charAt(0)?.toUpperCase() || "S"}
          </div>

          <div className="min-w-0">
            <h3 className="truncate text-lg font-bold text-white">
              {student.name || "Student"}
            </h3>

            <p className="truncate text-sm text-slate-400">
              {student.email || "-"}
            </p>

            {/* STUDENT ID */}

{student.student_code && (
  <p className="mt-1 truncate text-xs font-mono font-bold text-cyan-400">
    Student Code: {student.student_code}
  </p>
)}

{/* COLLEGE */}

<p className="mt-2 truncate text-xs font-semibold text-cyan-400">
  {student.college_name || "No College"}
</p>

{/* COLLEGE CODE */}

{student.college_code && (
  <p className="mt-1 text-[11px] font-medium text-slate-500">
    College Code: {student.college_code}
  </p>
)}
          </div>
        </div>

        {/* Statistics */}
        <div className="mt-6 grid grid-cols-4 gap-2 text-sm">
          <div>
            <p className="font-bold text-cyan-400">
              {student.xp ?? 0} XP
            </p>
          </div>

          <div className="text-center">
            <p className="font-bold text-amber-400">
              {student.streak ?? 0} 🔥
            </p>
          </div>

          <div className="text-center">
            <p className="font-bold text-violet-400">
              {student.courses ?? 0}{" "}
              {student.courses === 1 ? "course" : "courses"}
            </p>
          </div>

          <div className="text-right">
            <p className="font-bold text-emerald-400">
              {student.levels ?? 0}{" "}
              {student.levels === 1 ? "level" : "levels"}
            </p>
          </div>
        </div>
      </div>
    ))}
  </div>
)}
      </div>
    </Shell>
  );
}

export function Certificates() {
  const [data, setData] = useState(null);

useEffect(() => {
  const fetchCertificates = async () => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      const mockData = {
        certificates: [],
      };

      setData(mockData);

    } catch (error) {
      console.error("Failed to fetch certificates:", error);

      setData({
        certificates: [],
      });
    }
  };

  fetchCertificates();
}, []);

  if (!data) {
    return (
      <Shell>
        <div className="grid h-[60vh] place-items-center">
          <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="mx-auto max-w-4xl px-6 py-8">

        <h1 className="text-3xl font-black tracking-tight text-white">
          Certificates
        </h1>

        <p className="mt-2 text-slate-400">
          Earn a certificate by completing every level in a stage.
        </p>

        {data.certificates.length === 0 ? (

          <div className="mt-8 rounded-2xl border border-dashed border-white/10 p-12 text-center text-slate-500">

            <Award className="mx-auto h-10 w-10 text-slate-600" />

            <p className="mt-3">
              No certificates yet. Complete a full stage to unlock one.
            </p>

          </div>

        ) : (

          <div className="mt-8 grid gap-6 sm:grid-cols-2">

            {data.certificates.map((c) => (

              <div
                key={c.id}
                className="relative overflow-hidden rounded-3xl border border-violet-400/30 bg-gradient-to-br from-violet-500/15 via-slate-900 to-cyan-500/15 p-8 text-center"
              >

                <Award className="mx-auto h-12 w-12 text-violet-300" />

                <p className="mt-4 text-xs uppercase tracking-widest text-slate-400">
                  Certificate of Completion
                </p>

                <p className="mt-2 text-2xl font-black text-white">
                  {c.stage} Stage
                </p>

                <p className="text-slate-300">
                  {c.course}
                </p>

                <p className="mt-4 text-xs text-slate-500">
                  Digipin Academy · 2026
                </p>

              </div>

            ))}

          </div>

        )}

      </div>
    </Shell>
  );
}
