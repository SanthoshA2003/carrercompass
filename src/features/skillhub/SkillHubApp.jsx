import { Routes, Route, Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

import {
  AcademyAuthProvider,
  useAcademyAuth,
} from "@/context/AuthContext";

import AdminCollegePackages from "@/features/skillhub/pages/AdminCollegePackages";
import Login from "@/features/skillhub/pages/Login";
import Dashboard from "@/features/skillhub/pages/Dashboard";
import Journey from "@/features/skillhub/pages/Journey";
import Workspace from "@/features/skillhub/pages/Workspace";
import SkillAssessment from "@/features/skillhub/pages/SkillAssessment";

import AdminDashboard from "@/features/skillhub/pages/AdminDashboard";
import AdminBuilder from "@/features/skillhub/pages/AdminBuilder";
import AdminCourses from "@/features/skillhub/pages/AdminCourses";
import AdminCourseLevels from "@/features/skillhub/pages/AdminCourseLevels";
import CollegeManagement from "@/features/skillhub/pages/CollegeManagement";
import AdminSkillAssessment from "@/features/skillhub/pages/AdminSkillAssessment";
import StudentImport from "./pages/StudentImport";
import {
  AdminStudents,
  Certificates,
} from "@/features/skillhub/pages/Misc";

// ==================================================
// AUTH GUARD
// ==================================================

function Guard({ children, admin = false }) {
  const { user, ready } = useAcademyAuth();

  // Loading authentication
  if (!ready) {
    return (
      <div className="grid h-screen place-items-center bg-slate-950">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return <Navigate to="/skillhub/login" replace />;
  }

  // Admin-only page
  if (admin && user.role !== "admin") {
    return <Navigate to="/skillhub" replace />;
  }

  return children;
}

// ==================================================
// SKILLHUB HOME
// ==================================================

function Home() {
  const { user } = useAcademyAuth();

  if (user?.role === "admin") {
    return <Navigate to="/skillhub/admin" replace />;
  }

  return <Dashboard />;
}

// ==================================================
// SKILLHUB APP
// ==================================================

export default function SkillHubApp() {
  return (
    <AcademyAuthProvider>
      <Routes>

        {/* ==============================
            LOGIN
        ============================== */}

        <Route
          path="login"
          element={<Login />}
        />

        {/* ==============================
            STUDENT HOME
        ============================== */}

        <Route
          path=""
          element={
            <Guard>
              <Home />
            </Guard>
          }
        />

        {/* ==============================
            JOURNEY
        ============================== */}

        <Route
          path="journey/:courseId"
          element={
            <Guard>
              <Journey />
            </Guard>
          }
        />

        {/* ==============================
            LEVEL WORKSPACE
        ============================== */}

        <Route
          path="level/:levelId"
          element={
            <Guard>
              <Workspace />
            </Guard>
          }
        />

        <Route
  path="skill-assessment"
  element={
    <Guard>
      <SkillAssessment />
    </Guard>
  }
/>

        {/* ==============================
            CERTIFICATES
        ============================== */}

        <Route
          path="certificates"
          element={
            <Guard>
              <Certificates />
            </Guard>
          }
        />

        {/* ==============================
            ADMIN DASHBOARD
        ============================== */}

        <Route
          path="admin"
          element={
            <Guard admin>
              <AdminDashboard />
            </Guard>
          }
        />

        {/* ==============================
            ADMIN BUILDER
        ============================== */}

        <Route
          path="admin/builder"
          element={
            <Guard admin>
              <AdminBuilder />
            </Guard>
          }
        />

        {/* ==============================
            ADMIN COURSES
        ============================== */}

        <Route
          path="admin/courses"
          element={
            <Guard admin>
              <AdminCourses />
            </Guard>
          }
        />

       {/* ==============================
    ADMIN SKILL ASSESSMENT
============================== */}

<Route
  path="admin/skill-assessment"
  element={
    <Guard admin>
      <AdminSkillAssessment />
    </Guard>
  }
/>

        {/* ==============================
            ADMIN COURSE LEVELS
        ============================== */}

        <Route
          path="admin/courses/:courseId"
          element={
            <Guard admin>
              <AdminCourseLevels />
            </Guard>
          }
        />

        {/* ==============================
            ADMIN COLLEGE PACKAGES
        ============================== */}

        <Route
          path="admin/college-packages"
          element={
            <Guard admin>
              <AdminCollegePackages />
            </Guard>
          }
        />
<Route
  path="admin/students/import"
  element={
    <Guard admin>
      <StudentImport />
    </Guard>
  }
/>
        {/* ==============================
            ADMIN STUDENTS
        ============================== */}

        <Route
          path="admin/students"
          element={
            <Guard admin>
              <AdminStudents />
            </Guard>
          }
        />

        {/* ==============================
    ADMIN VIEW STUDENT DASHBOARD
============================== */}

<Route
  path="admin/students/:studentId/dashboard"
  element={
    <Guard admin>
      <Dashboard />
    </Guard>
  }
/>

        {/* colleges */}

        <Route
  path="admin/colleges"
  element={
    <Guard admin>
      <CollegeManagement />
    </Guard>
  }
/>

        {/* ==============================
            UNKNOWN ROUTE
        ============================== */}

        <Route
          path="*"
          element={
            <Navigate
              to="/skillhub"
              replace
            />
          }
        />

      </Routes>
    </AcademyAuthProvider>
  );
}