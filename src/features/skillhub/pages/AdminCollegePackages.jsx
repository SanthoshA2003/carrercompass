import { useEffect, useState } from "react";
import {
  GraduationCap,
  BookOpen,
  Layers,
  ChevronDown,
  ChevronUp,
  Search,
   Eye,
  Pencil,
  Trash2,
  X,
  AlertTriangle,
} from "lucide-react";

import Shell from "@/features/skillhub/components/Shell";
import { api } from "@/services/api";
import { toast } from "sonner";
import { useSearchParams } from "react-router-dom";

export default function AdminCollegePackages() {
  const [packages, setPackages] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [viewLoading, setViewLoading] = useState(false);
const [openCollege, setOpenCollege] = useState(null);
const [selectedPackage, setSelectedPackage] = useState(null);
const [showDeleteModal, setShowDeleteModal] = useState(false);
const [deleting, setDeleting] = useState(false);
const [searchParams] = useSearchParams();
const packageId = searchParams.get("packageId");

useEffect(() => {
  if (!packageId) return;

  loadExistingPackage(packageId);
}, [packageId]);

const loadExistingPackage = async (id) => {
  try {
    setLoading(true);

    const response = await api.getCollegePackage(id);

    const packageData = response?.data || response;

    console.log("Existing package:", packageData);

    // Set package information
    setPackageName(packageData.package_name || "");
    setDescription(packageData.description || "");

    // Set selected courses
    setSelectedCourses(packageData.course_ids || []);

  } catch (error) {
    console.error(
      "Failed to load package:",
      error?.response?.data || error
    );

    toast.error(
      error?.response?.data?.detail ||
        "Failed to load package"
    );
  } finally {
    setLoading(false);
  }
};

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
).filter(([collegeName, collegePackages]) => {
  const searchValue = search.toLowerCase().trim();

  if (!searchValue) return true;

  // Search college name
  if (collegeName.toLowerCase().includes(searchValue)) {
    return true;
  }

  // Search package name and course name
  return collegePackages.some((collegePackage) => {
    const packageName = (
      collegePackage.package_name ||
      collegePackage.name ||
      collegePackage.title ||
      ""
    ).toLowerCase();

    if (packageName.includes(searchValue)) {
      return true;
    }

    const packageCourses =
      getPackageCourses(collegePackage);

    return packageCourses.some((course) => {
      const courseName = (
        course.title ||
        course.name ||
        ""
      ).toLowerCase();

      return courseName.includes(searchValue);
    });
  });
});

  // ==================================================
  // TOGGLE COLLEGE
  // ==================================================

  const toggleCollege = (collegeName) => {
    setOpenCollege((previous) =>
      previous === collegeName ? null : collegeName
    );
  };

  // ==================================================
// VIEW PACKAGE
// ==================================================

const handleViewPackage = async (collegePackage) => {
  const packageId =
    collegePackage.id ||
    collegePackage.package_id;

  if (!packageId) {
    toast.error("Package ID not found");
    return;
  }

  // Open immediately using existing package data
  setSelectedPackage(collegePackage);

  try {
    const response = await api.getCollegePackage(packageId);

    // Replace with complete API response
    setSelectedPackage(response);
  } catch (error) {
    console.error(
      "Failed to load package details:",
      error?.response?.data || error
    );

    toast.error("Failed to load package details");
  }
};

// ==================================================
// EDIT PACKAGE
// ==================================================

const handleEditPackage = (collegePackage) => {
  // Navigate to Course Builder with package ID
  const packageId =
    collegePackage.id ||
    collegePackage.package_id;

  if (!packageId) {
    toast.error("Package ID not found");
    return;
  }

  // Change this route if your builder uses another edit route
  window.location.href =
    `/skillhub/admin/builder?packageId=${packageId}`;
};

// ==================================================
// DELETE PACKAGE
// ==================================================

const handleDeletePackage = (collegePackage) => {
  setSelectedPackage(collegePackage);
  setShowDeleteModal(true);
};

const confirmDeletePackage = async () => {
  if (!selectedPackage) return;

  const packageId =
    selectedPackage.id ||
    selectedPackage.package_id;

  if (!packageId) {
    toast.error("Package ID not found");
    return;
  }

  try {
    setDeleting(true);

    await api.deleteCollegePackage(packageId);

    toast.success("College package deleted successfully");

    setShowDeleteModal(false);
    setSelectedPackage(null);

    await loadData();
  } catch (error) {
    console.error(
      "Failed to delete college package:",
      error?.response?.data || error
    );

    toast.error(
      error?.response?.data?.detail ||
        "Failed to delete college package"
    );
  } finally {
    setDeleting(false);
  }
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
                placeholder="Search college, package or course..."
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
    COLLEGE PACKAGE CARDS
========================================== */}

{!loading && filteredCollegeGroups.length > 0 && (
  <div className="space-y-10">
    {filteredCollegeGroups.map(
      ([collegeName, collegePackages]) => (
        <section key={collegeName} className="space-y-5">

          {/* College Header */}
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-cyan-400/10 ring-1 ring-cyan-400/20">
              <GraduationCap className="h-5 w-5 text-cyan-400" />
            </div>

            <div>
              <h2 className="text-xl font-black text-white">
                {collegeName}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {collegePackages.length}{" "}
                {collegePackages.length === 1
                  ? "Course Package"
                  : "Course Packages"}
              </p>
            </div>
          </div>

          {/* Package Cards */}
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {collegePackages.map((collegePackage, index) => {
  const packageCourses =
    getPackageCourses(collegePackage);

  const packageName =
    collegePackage.package_name ||
    collegePackage.name ||
    collegePackage.title ||
    "College Package";

  const packageDescription =
    collegePackage.description ||
    collegePackage.package_description ||
    "Courses provided by your college.";

  return (
    <div
      key={
        collegePackage.id ||
        collegePackage.package_id ||
        index
      }
      className="
        group
        relative
        overflow-hidden
        rounded-3xl
        border
        border-white/10
        bg-gradient-to-br
        from-violet-500/20
        via-cyan-500/10
        to-slate-950
        p-5
        transition
        duration-300
        hover:-translate-y-1
        hover:border-cyan-400/30
        hover:shadow-xl
        hover:shadow-cyan-500/5
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

        {/* Package Header */}
        <div className="flex items-start justify-between gap-4">

          <div className="min-w-0">

            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-violet-300">
              Course Package
            </p>

            <h3 className="mt-2 text-xl font-black text-white">
              {packageName}
            </h3>

            <p className="mt-2 line-clamp-2 text-sm leading-5 text-slate-400">
              {packageDescription}
            </p>

          </div>

          {/* Package Icon */}
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-cyan-400/10 ring-1 ring-cyan-400/10">
            <BookOpen className="h-5 w-5 text-cyan-400" />
          </div>

        </div>

        {/* Course Count */}
        <div className="mt-5 flex items-center gap-2">

          <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-slate-300">
            {packageCourses.length}{" "}
            {packageCourses.length === 1
              ? "Course"
              : "Courses"}
          </span>

        </div>

        {/* Actions */}
        <div className="mt-5 flex items-center gap-2">

          {/* View */}
          <button
            type="button"
            onClick={() =>
              handleViewPackage(collegePackage)
            }
            className="
              inline-flex
              flex-1
              items-center
              justify-center
              gap-2
              rounded-xl
              border
              border-cyan-400/20
              bg-cyan-400/10
              px-3
              py-2.5
              text-xs
              font-bold
              text-cyan-300
              transition
              hover:bg-cyan-400/20
              hover:text-cyan-200
            "
          >
            <Eye className="h-4 w-4" />
            View
          </button>

          {/* Edit
          <button
            type="button"
            onClick={() =>
              handleEditPackage(collegePackage)
            }
            className="
              inline-flex
              items-center
              justify-center
              gap-2
              rounded-xl
              border
              border-white/10
              bg-white/[0.04]
              px-3
              py-2.5
              text-xs
              font-bold
              text-slate-300
              transition
              hover:bg-white/10
              hover:text-white
            "
          >
            <Pencil className="h-4 w-4" />
            Edit
          </button> */}

          {/* Delete */}
          <button
            type="button"
            onClick={() =>
              handleDeletePackage(collegePackage)
            }
            className="
              inline-flex
              items-center
              justify-center
              rounded-xl
              border
              border-rose-400/20
              bg-rose-400/10
              px-3
              py-2.5
              text-rose-300
              transition
              hover:bg-rose-400/20
              hover:text-rose-200
            "
            aria-label="Delete package"
          >
            <Trash2 className="h-4 w-4" />
          </button>

        </div>

      </div>
    </div>
  );
})}
          </div>

        </section>
      )
    )}
  </div>
)}


{/* ==========================================
    VIEW PACKAGE MODAL
========================================== */}

{selectedPackage && !showDeleteModal && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">

    <div className="max-h-[85vh] w-full max-w-2xl overflow-hidden rounded-3xl border border-white/10 bg-slate-900 shadow-2xl">

      {/* Modal Header */}
      <div className="flex items-start justify-between border-b border-white/10 p-6">

        <div className="flex items-start gap-4">

          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-cyan-400/10 ring-1 ring-cyan-400/20">
            <BookOpen className="h-6 w-6 text-cyan-400" />
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-violet-300">
              Course Package
            </p>

            <h2 className="mt-1 text-2xl font-black text-white">
              {selectedPackage.package_name ||
                selectedPackage.name ||
                selectedPackage.title ||
                "College Package"}
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              {selectedPackage.college_name ||
                "College"}
            </p>
          </div>

        </div>

        <button
          type="button"
          onClick={() => setSelectedPackage(null)}
          className="rounded-xl p-2 text-slate-400 transition hover:bg-white/10 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

      </div>

      {/* Modal Content */}
      <div className="max-h-[60vh] overflow-y-auto p-6">

        <div className="mb-5 rounded-2xl border border-white/10 bg-white/[0.03] p-4">

          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Description
          </p>

          <p className="mt-2 text-sm leading-6 text-slate-300">
            {selectedPackage.description ||
              selectedPackage.package_description ||
              "No description available"}
          </p>

        </div>

        <div className="mb-4 flex items-center justify-between">

          <h3 className="text-lg font-bold text-white">
            Courses
          </h3>

          <span className="rounded-full bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-cyan-300">
            {getPackageCourses(selectedPackage).length}{" "}
            Courses
          </span>

        </div>

        <div className="space-y-3">

          {getPackageCourses(selectedPackage).length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center">
              <BookOpen className="mx-auto h-8 w-8 text-slate-600" />

              <p className="mt-3 text-sm text-slate-500">
                No courses assigned to this package.
              </p>
            </div>
          ) : (
            getPackageCourses(selectedPackage).map(
              (course) => (
                <div
                  key={course.id}
                  className="
                    rounded-2xl
                    border
                    border-white/10
                    bg-white/[0.04]
                    p-4
                  "
                >
                  <div className="flex items-start gap-3">

                    <div className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-xl bg-cyan-400/10 ring-1 ring-cyan-400/20">

                      {course.thumbnail ||
                      course.thumbnail_url ? (
                        <img
                          src={
                            course.thumbnail ||
                            course.thumbnail_url
                          }
                          alt={course.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <BookOpen className="h-5 w-5 text-cyan-400" />
                      )}

                    </div>

                    <div className="min-w-0 flex-1">

                      <h4 className="text-sm font-bold text-white">
                        {course.title ||
                          course.name ||
                          "Untitled Course"}
                      </h4>

                      <p className="mt-1 text-sm leading-5 text-slate-400">
                        {course.description ||
                          "No description available"}
                      </p>

                      <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">

                        <Layers className="h-3.5 w-3.5" />

                        {course.level_count ?? 0}{" "}
                        {Number(course.level_count) === 1
                          ? "Level"
                          : "Levels"}

                      </div>

                    </div>

                  </div>
                </div>
              )
            )
          )}

        </div>

      </div>

      {/* Modal Footer */}
      <div className="flex justify-end border-t border-white/10 p-5">

        <button
          type="button"
          onClick={() => setSelectedPackage(null)}
          className="
            rounded-xl
            border
            border-white/10
            bg-white/[0.05]
            px-5
            py-2.5
            text-sm
            font-bold
            text-slate-300
            transition
            hover:bg-white/10
            hover:text-white
          "
        >
          Close
        </button>

      </div>

    </div>
  </div>
)}


{/* ==========================================
    DELETE PACKAGE MODAL
========================================== */}

{showDeleteModal && selectedPackage && (
  <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">

    <div className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-900 p-6 shadow-2xl">

      <div className="flex items-start gap-4">

        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-rose-400/10 ring-1 ring-rose-400/20">
          <AlertTriangle className="h-6 w-6 text-rose-400" />
        </div>

        <div>
          <h2 className="text-xl font-bold text-white">
            Delete Package?
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-400">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-white">
              {selectedPackage.package_name ||
                selectedPackage.name ||
                selectedPackage.title ||
                "this package"}
            </span>
            ? This action cannot be undone.
          </p>
        </div>

      </div>

      <div className="mt-6 flex justify-end gap-3">

        <button
          type="button"
          disabled={deleting}
          onClick={() => {
            setShowDeleteModal(false);
            setSelectedPackage(null);
          }}
          className="
            rounded-xl
            border
            border-white/10
            bg-white/[0.04]
            px-5
            py-2.5
            text-sm
            font-bold
            text-slate-300
            hover:bg-white/10
          "
        >
          Cancel
        </button>

        <button
          type="button"
          disabled={deleting}
          onClick={confirmDeletePackage}
          className="
            inline-flex
            items-center
            gap-2
            rounded-xl
            bg-rose-500
            px-5
            py-2.5
            text-sm
            font-bold
            text-white
            transition
            hover:bg-rose-600
            disabled:cursor-not-allowed
            disabled:opacity-60
          "
        >
          <Trash2 className="h-4 w-4" />

          {deleting ? "Deleting..." : "Delete"}
        </button>

      </div>

    </div>
  </div>
)}

      </div>
    </Shell>

    
  );
}