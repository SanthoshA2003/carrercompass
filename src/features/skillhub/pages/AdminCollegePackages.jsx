import { useEffect, useState } from "react";
import {
  GraduationCap,
  BookOpen,
  Layers,
  ChevronDown,
  ChevronUp,
  Search,
} from "lucide-react";

import Shell from "@/features/skillhub/components/Shell";
import { api } from "@/services/api";

export default function AdminCollegePackages() {
  const [packages, setPackages] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [openCollege, setOpenCollege] = useState(null);

  // ==================================================
  // LOAD DATA
  // ==================================================

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // ------------------------------------------
      // Load existing courses
      // ------------------------------------------

      const coursesResponse = await api.courses();

      const courseList = Array.isArray(coursesResponse)
        ? coursesResponse
        : coursesResponse?.data || [];

      setCourses(courseList);

      // ------------------------------------------
      // Load college packages from backend
      // GET /api/college-packages
      // ------------------------------------------

      const packagesResponse = await api.getCollegePackages();

      const packageList = Array.isArray(packagesResponse)
        ? packagesResponse
        : packagesResponse?.data || [];

      setPackages(packageList);

      console.log("College packages:", packageList);
    } catch (error) {
      console.error(
        "Failed to load college packages:",
        error?.response?.data || error
      );

      setPackages([]);
    } finally {
      setLoading(false);
    }
  };

  // ==================================================
  // GET COURSES FOR A PACKAGE
  // ==================================================

  const getPackageCourses = (collegePackage) => {
    return (collegePackage.course_ids || [])
      .map((courseId) =>
        courses.find(
          (course) => String(course.id) === String(courseId)
        )
      )
      .filter(Boolean);
  };

  // ==================================================
  // GROUP PACKAGES BY COLLEGE
  // ==================================================

  const collegeGroups = {};

  packages.forEach((collegePackage) => {
    const collegeName =
      collegePackage.college_name || "Unknown College";

    if (!collegeGroups[collegeName]) {
      collegeGroups[collegeName] = [];
    }

    collegeGroups[collegeName].push(collegePackage);
  });

  // ==================================================
  // SEARCH COLLEGES
  // ==================================================

  const filteredCollegeGroups = Object.entries(
    collegeGroups
  ).filter(([collegeName]) =>
    collegeName
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  // ==================================================
  // TOGGLE COLLEGE
  // ==================================================

  const toggleCollege = (collegeName) => {
    setOpenCollege((previous) =>
      previous === collegeName ? null : collegeName
    );
  };

  // ==================================================
  // RENDER
  // ==================================================

  return (
    <Shell>
      <div className="mx-auto max-w-6xl pb-12">

        {/* ==========================================
            HEADER
        ========================================== */}

        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-400">
            College Learning
          </p>

          <h1 className="mt-2 flex items-center gap-3 text-4xl font-black tracking-tight text-white">
            <GraduationCap className="h-9 w-9 text-cyan-400" />
            College Packages
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            View courses assigned to each college.
          </p>
        </div>

        {/* ==========================================
            SEARCH
        ========================================== */}

        {packages.length > 0 && (
          <div className="mb-8">
            <div className="relative max-w-xl">

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
                placeholder="Search college..."
                className="
                  w-full
                  rounded-xl
                  border
                  border-white/10
                  bg-white/[0.03]
                  py-3
                  pl-11
                  pr-4
                  text-sm
                  text-white
                  outline-none
                  placeholder:text-slate-500
                  focus:border-cyan-400
                "
              />

            </div>
          </div>
        )}

        {/* ==========================================
            LOADING
        ========================================== */}

        {loading && (
          <div className="flex justify-center py-20">
            <div className="flex items-center gap-3 text-sm text-slate-400">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
              Loading college packages...
            </div>
          </div>
        )}

        {/* ==========================================
            EMPTY
        ========================================== */}

        {!loading && packages.length === 0 && (
          <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.03] p-12 text-center">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10">
              <GraduationCap
                size={30}
                className="text-cyan-400"
              />
            </div>

            <h3 className="mt-5 text-lg font-bold text-white">
              No college packages
            </h3>

            <p className="mt-2 text-sm text-slate-400">
              Create a college package from the Course Builder.
            </p>

          </div>
        )}

        {/* ==========================================
            NO SEARCH RESULT
        ========================================== */}

        {!loading &&
          packages.length > 0 &&
          filteredCollegeGroups.length === 0 && (
            <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.03] p-12 text-center">

              <GraduationCap
                className="mx-auto h-10 w-10 text-slate-600"
              />

              <h3 className="mt-4 text-lg font-bold text-white">
                No college found
              </h3>

              <p className="mt-2 text-sm text-slate-400">
                Try searching for another college.
              </p>

            </div>
          )}

        {/* ==========================================
            COLLEGE LIST
        ========================================== */}

        {!loading &&
          filteredCollegeGroups.length > 0 && (
            <div className="space-y-6">

              {filteredCollegeGroups.map(
                ([collegeName, collegePackages]) => {

                  // ------------------------------------------
                  // Combine all courses from all packages
                  // belonging to this college
                  // ------------------------------------------

                  const collegeCourses = [];

                  collegePackages.forEach(
                    (collegePackage) => {
                      const packageCourses =
                        getPackageCourses(
                          collegePackage
                        );

                      packageCourses.forEach((course) => {

                        const alreadyExists =
                          collegeCourses.some(
                            (existingCourse) =>
                              String(existingCourse.id) ===
                              String(course.id)
                          );

                        if (!alreadyExists) {
                          collegeCourses.push(course);
                        }
                      });
                    }
                  );

                  const isOpen =
                    openCollege === collegeName;

                  return (
                    <div
                      key={collegeName}
                      className="
                        overflow-hidden
                        rounded-2xl
                        border
                        border-white/10
                        bg-white/[0.03]
                      "
                    >

                      {/* ==================================
                          COLLEGE HEADER
                      ================================== */}

                      <button
                        type="button"
                        onClick={() =>
                          toggleCollege(collegeName)
                        }
                        className="
                          flex
                          w-full
                          items-center
                          justify-between
                          px-6
                          py-5
                          text-left
                          transition
                          hover:bg-white/[0.04]
                        "
                      >

                        <div className="flex items-center gap-4">

                          <div
                            className="
                              flex
                              h-12
                              w-12
                              items-center
                              justify-center
                              rounded-xl
                              border
                              border-violet-400/20
                              bg-violet-500/10
                            "
                          >
                            <GraduationCap
                              size={24}
                              className="text-violet-400"
                            />
                          </div>

                          <div>
                            <h2 className="text-lg font-bold text-white">
                              {collegeName}
                            </h2>

                            <p className="mt-1 text-sm text-slate-500">
                              {collegeCourses.length}{" "}
                              {collegeCourses.length === 1
                                ? "Course"
                                : "Courses"}
                            </p>
                          </div>

                        </div>

                        <div
                          className="
                            flex
                            h-9
                            w-9
                            items-center
                            justify-center
                            rounded-lg
                            bg-white/[0.05]
                          "
                        >
                          {isOpen ? (
                            <ChevronUp
                              size={18}
                              className="text-cyan-400"
                            />
                          ) : (
                            <ChevronDown
                              size={18}
                              className="text-slate-400"
                            />
                          )}
                        </div>

                      </button>

                      {/* ==================================
                          COURSES
                      ================================== */}

                      {isOpen && (
                        <div className="border-t border-white/10 p-6">

                          {collegeCourses.length === 0 ? (
                            <div className="py-8 text-center">

                              <BookOpen
                                className="mx-auto h-8 w-8 text-slate-600"
                              />

                              <p className="mt-3 text-sm text-slate-500">
                                No courses found for this college.
                              </p>

                            </div>
                          ) : (
                            <div
                              className="
                                grid
                                gap-4
                                sm:grid-cols-2
                                lg:grid-cols-3
                              "
                            >

                              {collegeCourses.map(
                                (course) => (
                                  <div
                                    key={course.id}
                                    className="
                                      rounded-xl
                                      border
                                      border-white/10
                                      bg-slate-950/40
                                      p-4
                                      transition
                                      hover:border-cyan-400/30
                                      hover:bg-white/[0.04]
                                    "
                                  >

                                    {/* Course thumbnail/icon */}

                                    <div className="flex items-center gap-3">

                                      <div
                                        className="
                                          flex
                                          h-11
                                          w-11
                                          shrink-0
                                          items-center
                                          justify-center
                                          overflow-hidden
                                          rounded-xl
                                          border
                                          border-cyan-400/20
                                          bg-cyan-400/10
                                        "
                                      >

                                        {course.thumbnail ||
                                        course.thumbnail_url ? (
                                          <img
                                            src={
                                              course.thumbnail ||
                                              course.thumbnail_url
                                            }
                                            alt={course.title}
                                            className="
                                              h-full
                                              w-full
                                              object-cover
                                            "
                                          />
                                        ) : (
                                          <BookOpen
                                            size={20}
                                            className="text-cyan-400"
                                          />
                                        )}

                                      </div>

                                      <div className="min-w-0">

                                        <h3
                                          className="
                                            truncate
                                            text-sm
                                            font-bold
                                            text-white
                                          "
                                        >
                                          {course.title}
                                        </h3>

                                        <p
                                          className="
                                            mt-1
                                            truncate
                                            text-xs
                                            text-slate-500
                                          "
                                        >
                                          {course.category ||
                                            "Course"}
                                        </p>

                                      </div>

                                    </div>

                                    {/* Level count */}

                                    <div
                                      className="
                                        mt-4
                                        flex
                                        items-center
                                        justify-between
                                      "
                                    >

                                      <div
                                        className="
                                          flex
                                          items-center
                                          gap-2
                                          text-xs
                                          text-slate-500
                                        "
                                      >
                                        <Layers size={14} />

                                        {course.level_count ?? 0}{" "}
                                        {Number(
                                          course.level_count
                                        ) === 1
                                          ? "Level"
                                          : "Levels"}
                                      </div>

                                      <span
                                        className="
                                          rounded-full
                                          bg-cyan-400/10
                                          px-2.5
                                          py-1
                                          text-[11px]
                                          font-semibold
                                          text-cyan-400
                                        "
                                      >
                                        Course
                                      </span>

                                    </div>

                                  </div>
                                )
                              )}

                            </div>
                          )}

                        </div>
                      )}

                    </div>
                  );
                }
              )}

            </div>
          )}

      </div>
    </Shell>
  );
}