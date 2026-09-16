import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import {
  Terminal,
  LayoutDashboard,
  Map,
  Award,
  BookOpen,
  Users,
  Hammer,
  LogOut,
  Flame,
  Zap,
  Home,
  ArrowLeft,
  GraduationCap,
} from "lucide-react";

import { api } from "@/services/api";
import { useAcademyAuth } from "@/context/AuthContext";
import { useAuth } from "@/features/auth/components/AuthModal";

/* =========================================================
   ADMIN NAVIGATION
========================================================= */

const adminNav = [
  {
    to: "/skillhub/admin",
    label: "Dashboard",
    icon: LayoutDashboard,
    end: true,
  },

  {
    to: "/skillhub/admin/builder",
    label: "Course Builder",
    icon: Hammer,
  },

  {
    to: "/skillhub/admin/courses",
    label: "Courses",
    icon: BookOpen,
  },

  // NEW
  {
    to: "/skillhub/admin/college-packages",
    label: "College Packages",
    icon: GraduationCap,
  },

  {
    to: "/skillhub/admin/students",
    label: "Students",
    icon: Users,
  },
];

/* =========================================================
   SHELL
========================================================= */

export default function Shell({
  children,
  showBackButton = false,
  onBack,
}) {
  const { user, logout } = useAcademyAuth();
  const { logout: mainLogout } = useAuth();

  const loc = useLocation();
  const nav = useNavigate();

  const [courseId, setCourseId] = useState(null);
  const [loadingCourse, setLoadingCourse] = useState(true);

  /* =======================================================
     GET STUDENT ENROLLED COURSE
  ======================================================= */

  useEffect(() => {
    const fetchEnrolledCourse = async () => {
      if (user?.role === "admin") {
        setLoadingCourse(false);
        return;
      }

      try {
        setLoadingCourse(true);

        const enrolledCourses = await api.enrolledCourses();

        console.log("Enrolled Courses:", enrolledCourses);

        if (enrolledCourses?.length > 0) {
          setCourseId(enrolledCourses[0].course_id);
        } else {
          setCourseId(null);
        }
      } catch (error) {
        console.error(
          "Failed to get enrolled course:",
          error
        );

        setCourseId(null);
      } finally {
        setLoadingCourse(false);
      }
    };

    fetchEnrolledCourse();
  }, [user?.role]);

  /* =======================================================
     STUDENT NAVIGATION
  ======================================================= */

  const studentNav = [
    {
      to: "/skillhub",
      label: "Dashboard",
      icon: LayoutDashboard,
      end: true,
    },

    {
      to: courseId
        ? `/skillhub/journey/${courseId}`
        : "#",
      label: "My Journey",
      icon: Map,
      disabled: !courseId,
    },

    {
      to: "/skillhub/certificates",
      label: "Certificates",
      icon: Award,
    },
  ];

  /* =======================================================
     SELECT NAVIGATION
  ======================================================= */

  const items =
    user?.role === "admin"
      ? adminNav
      : studentNav;

  /* =======================================================
     ACTIVE MENU
  ======================================================= */

  const isActive = (item) =>
    item.end
      ? loc.pathname === item.to
      : loc.pathname.startsWith(item.to);

  /* =======================================================
     HOME
  ======================================================= */

  const handleHome = () => {
    // ADMIN
    if (user?.role === "admin") {
      logout();
      mainLogout();

      window.location.href = "/";
      return;
    }

    // STUDENT
    nav("/");
  };

  /* =======================================================
     LOGOUT
  ======================================================= */

  const handleLogout = () => {
    logout();
    mainLogout();

    window.location.href = "/";
  };

  /* =======================================================
     UI
  ======================================================= */

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-200">

      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <aside
        className="
          fixed
          inset-y-0
          left-0
          hidden
          w-64
          flex-col
          border-r
          border-white/5
          bg-slate-900/50
          p-5
          backdrop-blur-xl
          lg:flex
        "
      >

        {/* Logo */}
        <Link
          to="/skillhub"
          className="mb-8 flex items-center gap-2.5"
        >
          <span
            className="
              grid
              h-10
              w-10
              place-items-center
              rounded-xl
              bg-gradient-to-br
              from-cyan-400
              to-violet-500
            "
          >
            <Terminal className="h-5 w-5 text-white" />
          </span>

          <span className="text-lg font-black tracking-tight text-white">
            Digipin<span className="text-cyan-400">.</span>
          </span>
        </Link>

        {/* =================================================
            NAVIGATION
        ================================================= */}

        <nav className="flex-1 space-y-1">

          {items.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              onClick={(e) => {
                if (item.loading || item.disabled) {
                  e.preventDefault();
                }
              }}
              data-testid={`nav-${item.label
                .toLowerCase()
                .replace(/\s+/g, "-")}`}
              className={`
                flex
                items-center
                gap-3
                rounded-xl
                px-4
                py-3
                text-sm
                font-semibold
                transition-colors

                ${
                  item.loading || item.disabled
                    ? "cursor-wait text-slate-500"
                    : isActive(item)
                    ? "bg-gradient-to-r from-cyan-500/20 to-violet-500/20 text-white ring-1 ring-cyan-400/30"
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                }
              `}
            >

              <item.icon className="h-5 w-5" />

              {item.label}

              {item.loading && (
                <span
                  className="
                    ml-auto
                    h-3
                    w-3
                    animate-spin
                    rounded-full
                    border-2
                    border-cyan-400
                    border-t-transparent
                  "
                />
              )}

            </Link>
          ))}

        </nav>

        {/* =================================================
            USER CARD
        ================================================= */}

        <div
          className="
            mt-auto
            rounded-2xl
            border
            border-white/5
            bg-white/5
            p-4
          "
        >

          {/* User */}
          <div className="flex items-center gap-3">

            <span
              className="
                grid
                h-9
                w-9
                place-items-center
                rounded-full
                bg-gradient-to-br
                from-cyan-400
                to-violet-500
                text-xs
                font-black
                text-white
              "
            >
              {user?.name?.[0]}
            </span>

            <div className="min-w-0">

              <p className="truncate text-sm font-semibold text-white">
                {user?.name}
              </p>

              <p className="truncate text-xs capitalize text-slate-400">
                {user?.role}
              </p>

            </div>

          </div>

          {/* Home */}
          <button
            onClick={handleHome}
            className="
              mt-3
              flex
              w-full
              items-center
              justify-center
              gap-2
              rounded-lg
              border
              border-white/10
              px-3
              py-2
              text-xs
              font-semibold
              text-slate-300
              transition-colors
              hover:bg-white/10
            "
          >
            <Home className="h-3.5 w-3.5" />
            Home
          </button>

          {/* Sign Out */}
          <button
            onClick={handleLogout}
            data-testid="logout-btn"
            className="
              mt-3
              flex
              w-full
              items-center
              justify-center
              gap-2
              rounded-lg
              border
              border-white/10
              px-3
              py-2
              text-xs
              font-semibold
              text-slate-300
              transition-colors
              hover:bg-white/10
            "
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign out
          </button>

        </div>

      </aside>

      {/* =====================================================
          MAIN
      ===================================================== */}

      <div className="flex-1 lg:ml-64">

        {/* =================================================
            TOPBAR
        ================================================= */}

        <header
          className="
            sticky
            top-0
            z-30
            flex
            items-center
            justify-between
            border-b
            border-white/5
            bg-slate-950/80
            px-5
            py-4
            backdrop-blur-xl
            lg:px-8
          "
        >

          {/* Mobile Logo */}
          <div className="flex items-center gap-2 lg:hidden">

            <span
              className="
                grid
                h-8
                w-8
                place-items-center
                rounded-lg
                bg-gradient-to-br
                from-cyan-400
                to-violet-500
              "
            >
              <Terminal className="h-4 w-4 text-white" />
            </span>

            <span className="font-black text-white">
              Digipin
            </span>

          </div>

          {/* Welcome */}
          <div className="hidden text-sm font-medium text-slate-400 lg:block">

            Welcome back,{" "}

            <span className="text-white">
              {user?.name?.split(" ")[0]}
            </span>{" "}

            👋

          </div>

          {/* Right Side */}
          <div className="flex items-center gap-3">

            {/* Back */}
            {showBackButton && (
              <button
                onClick={onBack}
                className="
                  flex
                  items-center
                  gap-2
                  rounded-xl
                  border
                  border-white/10
                  bg-white/[0.04]
                  px-3
                  py-1.5
                  text-sm
                  font-semibold
                  text-slate-300
                  transition-colors
                  hover:bg-white/10
                  hover:text-white
                "
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
            )}

            {/* Streak */}
            <span
              className="
                flex
                items-center
                gap-1.5
                rounded-full
                bg-amber-500/10
                px-3
                py-1.5
                text-sm
                font-bold
                text-amber-400
              "
            >
              <Flame className="h-4 w-4" />
              {user?.streak ?? 0}
            </span>

            {/* XP */}
            <span
              className="
                flex
                items-center
                gap-1.5
                rounded-full
                bg-cyan-500/10
                px-3
                py-1.5
                text-sm
                font-bold
                text-cyan-400
              "
            >
              <Zap className="h-4 w-4 fill-current" />
              {user?.xp ?? 0} XP
            </span>

          </div>

        </header>

        {/* =================================================
            PAGE CONTENT
        ================================================= */}

        <main className="px-5 py-8 lg:px-8">
          {children}
        </main>

      </div>

    </div>
  );
}