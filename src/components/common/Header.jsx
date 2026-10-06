import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, LogIn, CircleUserRound, LogOut } from "lucide-react";
import { Logo, Magnetic } from "@/features/career/components/landing/primitives";
import { navItems } from "@/features/career/services/landingData";
import { useAuth } from "@/features/auth/components/AuthModal";


export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { openAuth, isAuthed, user, logout } = useAuth();
  const navigate = useNavigate();

 const goProtected = (to) => (e) => {
  e.preventDefault();
  setMobileOpen(false);

  if (isAuthed) {
    navigate(to);
  } else {
    openAuth(
      () => navigate(to),
      to === "/skillhub"
    );
  }
};

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed inset-x-0 top-0 z-50 transition-[background,box-shadow,border] duration-300 ${scrolled ? "border-b border-slate-200/60 bg-white/70 backdrop-blur-xl shadow-soft" : "bg-white/40 backdrop-blur-md"
        }`}
      data-testid="navbar"
    >
      <nav className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 lg:px-8">
        <Logo />

        <div className="hidden items-center gap-1 lg:flex">
          {navItems.map((item) =>
            item.href.startsWith("/") ? (
              <a
                key={item.label}
                href={item.href}
                onClick={goProtected(item.href)}
                className="cursor-pointer rounded-full px-4 py-2 text-[15px] font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
                data-testid={`nav-link-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
              >
                {item.label}
              </a>
            ) : (
              <a
                key={item.label}
                href={item.href}
                className="rounded-full px-4 py-2 text-[15px] font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
                data-testid={`nav-link-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
              >
                {item.label}
              </a>
            )
          )}
        </div>

       

        <div className="hidden items-center gap-3 lg:flex">

          {!isAuthed && (
  <Link
    to="/college-admin/login"
    className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-[15px] font-semibold text-blue-600 transition-all hover:bg-blue-100 hover:text-blue-700"
    data-testid="nav-college-login-button"
  >
    <LogIn className="h-4 w-4" />
    Login as College
  </Link>
)}
          <Link
            to="/profile"
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-[15px] font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
            data-testid="nav-profile-button"
          >
            <CircleUserRound className="h-4 w-4" /> My Score
          </Link>
          {isAuthed ? (
            <div className="flex items-center gap-2">
              <span className="max-w-[140px] truncate rounded-full bg-slate-100 px-4 py-2 text-[15px] font-semibold text-slate-800" data-testid="nav-user-name">
                {user?.name?.split(" ")[0] || "Account"}
              </span>
              <button
                onClick={logout}
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-[15px] font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
                data-testid="nav-logout-button"
              >
                <LogOut className="h-4 w-4" /> Logout
              </button>
            </div>
      ) : (
  <div className="flex items-center gap-2">


    {/* Login */}
    <Magnetic strength={0.25}>
      <button
        onClick={() => openAuth()}
        className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 px-6 py-2.5 text-[15px] font-semibold text-white shadow-soft transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-glow"
        data-testid="nav-login-button"
      >
        <LogIn className="h-4 w-4" />
        Login
      </button>
    </Magnetic>

  </div>
)}
        </div>

        <button
          onClick={() => setMobileOpen((v) => !v)}
          className="grid h-10 w-10 place-items-center rounded-full text-slate-800 transition-colors hover:bg-slate-100 lg:hidden"
          data-testid="nav-mobile-toggle"
          aria-label="Menu"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-slate-200/60 bg-white/95 backdrop-blur-xl lg:hidden"
          >
            <div className="space-y-1 px-5 py-4">
              {navItems.map((item) =>
                item.href.startsWith("/") ? (
                  <a
                    key={item.label}
                    href={item.href}
                    onClick={goProtected(item.href)}
                    className="block cursor-pointer rounded-xl px-4 py-3 text-[16px] font-medium text-slate-700 transition-colors hover:bg-slate-100"
                  >
                    {item.label}
                  </a>
                ) : (
                  <a
                    key={item.label}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className="block rounded-xl px-4 py-3 text-[16px] font-medium text-slate-700 transition-colors hover:bg-slate-100"
                  >
                    {item.label}
                  </a>
                )
              )}
              <Link
                to="/profile"
                onClick={() => setMobileOpen(false)}
                className="mt-1 flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-[16px] font-medium text-slate-700 transition-colors hover:bg-slate-100"
                data-testid="nav-mobile-profile-button"
              >
                <CircleUserRound className="h-4 w-4" /> My Score
              </Link>

             {!isAuthed && (
  <Link
    to="/college-admin/login"
    className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2.5 text-[15px] font-semibold text-blue-600 transition-all hover:border-blue-300 hover:bg-blue-100"
    data-testid="nav-college-login-button"
  >
    <LogIn className="h-4 w-4" />
    Login as College
  </Link>
)}


              {!isAuthed && (
                <Link
                  to="/register"
                  onClick={() => setMobileOpen(false)}
                  className="mt-2 flex w-full items-center justify-center rounded-full border border-slate-200 bg-white px-6 py-3.5 text-[16px] font-semibold text-slate-700 transition-colors hover:bg-slate-100"
                  data-testid="nav-mobile-register-button"
                >
                  Register
                </Link>
              )}

              {isAuthed ? (
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    logout();
                  }}
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-full border border-slate-200 px-6 py-3.5 text-[16px] font-semibold text-slate-700"
                  data-testid="nav-mobile-logout-button"
                >
                  <LogOut className="h-4 w-4" />
                  Logout ({user?.name?.split(" ")[0] || "Account"})
                </button>
              ) : (
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    openAuth();
                  }}
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 px-6 py-3.5 text-[16px] font-semibold text-white shadow-soft"
                  data-testid="nav-mobile-login-button"
                >
                  <LogIn className="h-4 w-4" /> Login
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
