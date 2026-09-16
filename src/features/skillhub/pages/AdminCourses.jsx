import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, Pencil, Loader2, Search } from "lucide-react";
import { api } from "@/services/api";
import Shell from "@/features/skillhub/components/Shell";

export default function AdminCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    const loadCourses = async () => {
      try {
        setLoading(true);

        const response = await api.courses();

        console.log("Courses:", response);

        // Supports both:
        // api.courses() -> []
        // api.courses() -> { data: [] }
        const courseList = Array.isArray(response)
          ? response
          : response?.data || [];

        setCourses(courseList);
      } catch (error) {
        console.error("Failed to load courses:", error);
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };

    loadCourses();
  }, []);

  const filteredCourses = courses.filter((course) => {
    const searchValue = search.trim().toLowerCase();

    const matchesSearch =
      searchValue === "" || course.title?.toLowerCase().includes(searchValue);

    const matchesCategory =
      selectedCategory === "All" || course.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <Shell>
      <div className="mx-auto max-w-6xl">
        {/* Page Header */}
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-400">
            Course Management
          </p>

          <h1 className="mt-2 text-4xl font-black tracking-tight text-white">
            Courses
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            Manage your courses and create learning levels.
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
          </div>
        )}

        {/* Empty State */}
        {!loading && courses.length === 0 && (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-12 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10">
              <BookOpen size={30} className="text-cyan-400" />
            </div>

            <h3 className="mt-5 text-lg font-bold text-white">
              No courses available
            </h3>

            <p className="mt-2 text-sm text-slate-400">
              Create a course from the Course Builder to get started.
            </p>

            <Link
              to="/skillhub/admin/builder"
              className="mt-5 inline-flex items-center rounded-xl bg-gradient-to-r from-cyan-500 to-violet-500 px-5 py-2.5 text-sm font-bold text-white transition hover:scale-105"
            >
              Go to Course Builder
            </Link>
          </div>
        )}

        {/* Search & Filter */}
        {!loading && courses.length > 0 && (
          <div className="mb-8 grid gap-4 md:grid-cols-[1fr_280px]">
            {/* Search Course */}
            <div className="relative">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
              />

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search course by name..."
                className="w-full rounded-xl border border-white/10 bg-white/[0.03] py-3 pl-11 pr-4 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-400"
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
            >
              <option value="All">Select Category</option>
              <option value="Programming">Programming</option>
              <option value="Artificial Intelligence">
                Artificial Intelligence
              </option>
              <option value="Communication">Communication</option>
              <option value="Leadership">Leadership</option>
              <option value="Interview Preparation">
                Interview Preparation
              </option>
              <option value="Cloud">Cloud</option>
              <option value="Cyber Security">Cyber Security</option>
              <option value="Data Science">Data Science</option>
            </select>
          </div>
        )}

        {/* Course Cards */}
        {!loading &&
          courses.length > 0 &&
          (filteredCourses.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.03] p-12 text-center">
              <BookOpen className="mx-auto h-10 w-10 text-slate-600" />

              <h3 className="mt-4 text-lg font-bold text-white">
                No courses found
              </h3>

              <p className="mt-2 text-sm text-slate-400">
                {search.trim() && selectedCategory !== "All"
                  ? `No courses found matching "${search}" in ${selectedCategory}.`
                  : search.trim()
                    ? `No courses found matching "${search}".`
                    : `No courses found in ${selectedCategory}.`}
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {filteredCourses.map((course) => (
                <div
                  key={course.id}
                  data-testid={`admin-course-${course.id}`}
                  className="
            flex
            min-h-[285px]
            flex-col
            rounded-2xl
            border
            border-white/10
            bg-white/[0.03]
            p-6
            transition-all
            duration-200
            hover:-translate-y-1
            hover:border-cyan-400/30
            hover:bg-white/[0.05]
          "
                >
                  {/* Your existing course card content */}

                  <div className="flex items-start justify-between">
                    <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl border border-blue-400/30 bg-blue-500/10">
                      {course.thumbnail || course.thumbnail_url ? (
                        <img
                          src={course.thumbnail || course.thumbnail_url}
                          alt={course.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <BookOpen size={25} className="text-blue-400" />
                      )}
                    </div>

                    <span className="rounded-full bg-white/[0.06] px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
                      {course.language || "Course"}
                    </span>
                  </div>

                  <div className="mt-6 flex-1">
                    <h3 className="text-xl font-bold text-white">
                      {course.title}
                    </h3>

                    <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-400">
                      {course.description || "No description available."}
                    </p>

                    <div className="mt-5 flex flex-wrap items-center gap-6">
                      <div>
                        <p className="text-xs uppercase tracking-wider text-slate-500">
                          Levels
                        </p>
                        <p className="mt-1 text-sm font-semibold text-white">
                          {course.level_count ?? 0}
                        </p>
                      </div>

                      {course.difficulty && (
                        <div>
                          <p className="text-xs uppercase tracking-wider text-slate-500">
                            Difficulty
                          </p>
                          <p className="mt-1 text-sm font-semibold text-white">
                            {course.difficulty}
                          </p>
                        </div>
                      )}

                      {course.category && (
                        <div>
                          <p className="text-xs uppercase tracking-wider text-slate-500">
                            Category
                          </p>
                          <p className="mt-1 text-sm font-semibold text-white">
                            {course.category}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <Link
                    to={`/skillhub/admin/courses/${course.id}`}
                    data-testid={`admin-manage-course-${course.id}`}
                    className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-cyan-400 transition hover:text-cyan-300"
                  >
                    <Pencil size={16} />
                    Manage Levels →
                  </Link>
                </div>
              ))}
            </div>
          ))}

          
      </div>
    </Shell>
  );
}
