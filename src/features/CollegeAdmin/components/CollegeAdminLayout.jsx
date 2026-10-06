import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  LogOut,
  GraduationCap,
} from "lucide-react";
import myMentorIcon from "@/assets/images/mymentor-icon.png";

const menuItems = [
  {
    label: "Dashboard",
    path: "/college-admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Students",
    path: "/college-admin/students",
    icon: Users,
  },
  {
    label: "Courses",
    path: "/college-admin/courses",
    icon: BookOpen,
  },
];

export default function CollegeAdminLayout() {
  const navigate = useNavigate();

  const storedUser = JSON.parse(
    localStorage.getItem("college_admin_user") || "{}",
  );

  const handleLogout = () => {
    // Remove only College Admin authentication
    localStorage.removeItem("college_admin_token");
    localStorage.removeItem("college_admin_auth");
    localStorage.removeItem("college_admin_user");

    navigate("/college-admin/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      {/* SIDEBAR */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-white/5 bg-[#081124] lg:flex lg:flex-col">
        {/* LOGO */}
        <div className="flex h-20 items-center gap-3 border-b border-white/5 px-6">
          <div className="flex h-12 w-9 items-center justify-center">
            <img
              src={myMentorIcon}
              alt="MyMentor"
              className="h-12 w-12 object-contain"
            />
          </div>

          <div>
            <p className="text-sm font-black text-white">MyMentor</p>

            <p className="text-[11px] font-semibold uppercase tracking-wider text-cyan-400">
              College Admin
            </p>
          </div>
        </div>

        {/* NAVIGATION */}
        <nav className="flex-1 space-y-2 px-4 py-6">
          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                    isActive
                      ? "border border-cyan-400/20 bg-gradient-to-r from-cyan-500/20 via-blue-500/10 to-violet-500/20 text-white shadow-lg shadow-cyan-500/5"
                      : "text-slate-400 hover:bg-white/[0.04] hover:text-white"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className={`h-5 w-5 ${
                        isActive
                          ? "text-cyan-400"
                          : "text-slate-500 group-hover:text-slate-300"
                      }`}
                    />

                    <span>{item.label}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* ADMIN PROFILE */}
        <div className="border-t border-white/5 p-4">
          <div className="mb-3 rounded-2xl border border-white/5 bg-white/[0.03] p-3">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-cyan-400 to-violet-500 text-sm font-black">
                {(storedUser?.name || "CA").charAt(0).toUpperCase()}
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-white">
                  {storedUser?.name || "College Admin"}
                </p>

                <p className="truncate text-xs text-slate-500">
                  {storedUser?.college_name || "College"}
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-3 text-sm font-semibold text-slate-400 transition hover:bg-white/[0.04] hover:text-white"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </aside>

      {/* MAIN AREA */}
      <div className="lg:pl-64">
        {/* TOP HEADER */}
        <header className="sticky top-0 z-30 border-b border-white/5 bg-[#020617]/90 backdrop-blur-xl">
          <div className="flex h-20 items-center justify-between px-5 lg:px-8">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-400">
                College Admin Portal
              </p>

              <p className="mt-1 text-sm font-semibold text-slate-500">
                Manage students and learning
              </p>
            </div>

            <div className="hidden items-center gap-3 sm:flex">
              <div className="text-right">
                <p className="text-sm font-bold text-white">
                  {storedUser?.name || "College Admin"}
                </p>

                <p className="text-xs text-slate-500">
                  {storedUser?.college_name || "College"}
                </p>
              </div>

              <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-cyan-400 to-violet-500 text-sm font-black">
                {(storedUser?.name || "CA").charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="min-h-[calc(100vh-80px)] bg-[#020617] px-5 py-8 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
