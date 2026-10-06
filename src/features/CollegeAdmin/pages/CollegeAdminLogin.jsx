import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/services/api";
import {
  LogIn,
  Lock,
  Mail,
  Eye,
  EyeOff,
  GraduationCap,
  ArrowLeft,
} from "lucide-react";
import myMentorIcon from "@/assets/images/mymentor-icon.png";

export default function CollegeAdminLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Please enter email and password.");
      return;
    }

    setLoading(true);

    try {
      const response = await api.collegeAdminLogin({
        email: email.trim(),
        password,
      });

      console.log("College admin login response:", response);

      localStorage.setItem("college_admin_token", response.access_token);

      localStorage.setItem(
        "college_admin_user",
        JSON.stringify({
          user_id: response.user_id,
          role: response.role,
          college_id: response.college_id,
          college_name: response.college_name,
          college_code: response.college_code,
          email: email.trim(),
        }),
      );

      localStorage.setItem("college_admin_auth", "true");

      navigate("/college-admin/dashboard");
    } catch (error) {
      console.error(
        "College admin login failed:",
        error?.response?.data || error,
      );

      setError(
        error?.response?.data?.detail ||
          error?.response?.data?.message ||
          "Invalid email or password.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#020617] via-[#0b1738] to-[#071426] text-white">
      {/* BACK BUTTON */}
      <div className="absolute left-6 top-6 z-20">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="group inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-semibold text-slate-300 backdrop-blur transition-all duration-200 hover:border-cyan-400/30 hover:bg-white/[0.08] hover:text-white"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          Back to MyMentor
        </button>
      </div>

      {/* BACKGROUND GLOW */}

      <div className="pointer-events-none absolute left-0 top-0 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />

      <div className="pointer-events-none absolute bottom-0 right-0 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />

      <div className="pointer-events-none absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-500/10 blur-3xl" />

      <div className="relative mx-auto flex min-h-screen max-w-7xl items-center justify-center px-6 py-12">
        <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-cyan-400/10 bg-[#0b1224]/95 shadow-[0_30px_90px_rgba(2,6,23,0.55)] backdrop-blur-xl lg:grid-cols-2">
          {/* ==================================================
              LEFT
          ================================================== */}

          <div className="relative hidden overflow-hidden bg-gradient-to-br from-[#0b1738] via-[#0b2342] to-[#11163d] p-10 lg:block">
            <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-cyan-400/15 blur-3xl" />

            <div className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-violet-500/15 blur-3xl" />

            <div className="relative z-10 flex h-full flex-col justify-between">
              <div>
                {/* BRAND */}

                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center">
                    <img
                      src={myMentorIcon}
                      alt="MyMentor"
                      className="h-12 w-12 object-contain"
                    />
                  </div>

                  <div>
                    <p className="text-xl font-black text-white">MyMentor</p>

                    <p className="text-sm text-blue-100/80">
                      College Admin Portal
                    </p>
                  </div>
                </div>

                {/* TITLE */}

                <h1 className="mt-20 text-4xl font-black leading-tight text-white">
                  Manage your college
                  <span className="block bg-gradient-to-r from-white to-cyan-100 bg-clip-text text-transparent">
                    learning ecosystem.
                  </span>
                </h1>

                <p className="mt-6 max-w-md text-sm leading-7 text-blue-50/80">
                  Monitor students, courses and learning progress through one
                  centralized college administration portal.
                </p>
              </div>
            </div>
          </div>

          {/* ==================================================
              RIGHT
          ================================================== */}

          <div className="bg-gradient-to-br from-[#0f1830] via-[#0b1428] to-[#0a1122] p-8 sm:p-10 lg:p-14">
            <div className="mx-auto max-w-md">
              {/* HEADER */}

              <div className="mb-8">
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-cyan-400">
                  College Administration
                </p>

                <h2 className="mt-3 text-3xl font-black tracking-tight text-white">
                  Welcome back
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Sign in to access your college admin portal.
                </p>
              </div>

              {/* FORM */}

              <form
                onSubmit={handleLogin}
                className="space-y-5"
                autoComplete="off"
              >
                {/* EMAIL */}

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-300">
                    Email Address
                  </label>

                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />

                    <input
                      type="email"
                      name="college-admin-email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setError("");
                      }}
                      placeholder="Enter email"
                      autoComplete="off"
                      className="w-full rounded-xl border border-slate-700/70 bg-slate-800/70 py-3.5 pl-12 pr-4 text-sm text-white outline-none transition placeholder:text-slate-500 hover:border-slate-600 focus:border-cyan-400/70 focus:bg-slate-800 focus:ring-4 focus:ring-cyan-400/10"
                    />
                  </div>
                </div>

                {/* PASSWORD */}

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-300">
                    Password
                  </label>

                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />

                    <input
                      type={showPassword ? "text" : "password"}
                      name="college-admin-password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setError("");
                      }}
                      placeholder="Enter password"
                      autoComplete="new-password"
                      className="w-full rounded-xl border border-slate-700/70 bg-slate-800/70 py-3.5 pl-12 pr-12 text-sm text-white outline-none transition placeholder:text-slate-500 hover:border-slate-600 focus:border-cyan-400/70 focus:bg-slate-800 focus:ring-4 focus:ring-cyan-400/10"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-cyan-400"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* ERROR */}

                {error && (
                  <div className="rounded-xl border border-rose-400/20 bg-rose-400/[0.08] px-4 py-3 text-sm font-medium text-rose-300">
                    {error}
                  </div>
                )}

                {/* LOGIN */}

                <button
                  type="submit"
                  disabled={loading}
                  className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-500 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-indigo-500/30 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Logging in...
                    </>
                  ) : (
                    <>
                      <LogIn className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                      Login to College Portal
                    </>
                  )}
                </button>
              </form>

              {/* SECURITY */}

              <div className="mt-6 flex items-center justify-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.7)]" />

                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Secure MyMentor Administration Portal
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
