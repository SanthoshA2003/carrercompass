import { useEffect } from "react";
import "@/styles/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Lenis from "lenis";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/features/auth/components/AuthModal";
import Landing from "@/pages/LandingPage";
import SkillHubApp from "@/features/skillhub/SkillHubApp";
import CareerPath from "@/features/career/pages/CareerPath";
import MentorsPage from "@/features/mentors/pages/MentorsPage";
import MentorDetailPage from "@/features/mentors/pages/MentorDetailPage";
import OrganizationsPage from "@/features/organizations/pages/OrganizationsPage";
import JobsPage from "@/features/jobs/pages/JobsPage";
import GoogleCallback from "@/features/auth/pages/GoogleCallback";
import ProfilePage from "@/features/profile/pages/ProfilePage";
import CollegeAdminLogin from "@/features/CollegeAdmin/pages/CollegeAdminLogin";
import CollegeAdminDashboard from "@/features/CollegeAdmin/pages/CollegeAdminDashboard";
import CollegeAdminLayout from "@/features/CollegeAdmin/components/CollegeAdminLayout";
import CollegeAdminStudents from "@/features/CollegeAdmin/pages/CollegeAdminStudents";
import CollegeAdminCourses from "@/features/CollegeAdmin/pages/CollegeAdminCourses";

function LandingPage() {
  useEffect(() => {
    const lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
    let raf;
    const loop = (t) => { lenis.raf(t); raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop);
    const onClick = (e) => {
      const a = e.target.closest('a[href^="#"]');
      if (!a) return;
      const id = a.getAttribute("href");
      if (id && id.length > 1) {
        const el = document.querySelector(id);
        if (el) { e.preventDefault(); lenis.scrollTo(el, { offset: -90 }); }
      }
    };
    document.addEventListener("click", onClick);
    return () => { cancelAnimationFrame(raf); document.removeEventListener("click", onClick); lenis.destroy(); };
  }, []);
  return <Landing />;
}

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/skillhub/*" element={<SkillHubApp />} />
            <Route path="/career-path" element={<CareerPath />} />
            <Route path="/mentors" element={<MentorsPage />} />
            <Route path="/mentors/:id" element={<MentorDetailPage />} />
            <Route path="/organizations" element={<OrganizationsPage />} />
            <Route path="/jobs" element={<JobsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/auth/callback" element={<GoogleCallback />} />
            <Route
  path="/college-admin/login"
  element={<CollegeAdminLogin />}
/>
<Route path="/college-admin" element={<CollegeAdminLayout />}>
  <Route path="dashboard" element={<CollegeAdminDashboard />} />
  <Route path="students" element={<CollegeAdminStudents />} />
  <Route path="courses" element={<CollegeAdminCourses />} />
</Route>
            
          </Routes>
        </AuthProvider>
      </BrowserRouter>
      <Toaster position="top-center" richColors />
    </div>
  );
}

export default App;
