import { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X, ArrowRight, Loader2, Phone, ShieldCheck, ChevronLeft, CalendarDays, User } from "lucide-react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Logo } from "@/features/career/components/landing/primitives";
import { api } from "@/services/api";
import { toast } from "sonner";

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);


const handleGoogleLogin = () => {
  const backendUrl = process.env.REACT_APP_BACKEND_URL;

  if (!backendUrl) {
    toast.error("Backend URL is not configured");
    console.error("REACT_APP_BACKEND_URL is undefined");
    return;
  }

  // Automatically detect where the frontend is running
  const frontendUrl = window.location.origin;

  // Allow only localhost and deployed frontend
  const allowedFrontends = [
    "http://localhost:3000",
    "https://careercampus-bd89.onrender.com",
    "https://carrercompass-n2ms.onrender.com",
  ];

  if (!allowedFrontends.includes(frontendUrl)) {
    toast.error("Invalid frontend URL");
    console.error("Invalid frontend URL:", frontendUrl);
    return;
  }

  window.location.href =
    `${backendUrl}/api/auth/google?frontend_url=${encodeURIComponent(frontendUrl)}`;
};



const GoogleIcon = (props) => (
  <svg viewBox="0 0 24 24" width="20" height="20" {...props}>
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z" />
    <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38Z" />
  </svg>
);

const field = "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-[15px] text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100";

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [user, setUser] = useState(null); // null = loading, false = guest, object = authenticated
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState("phone"); // phone | otp | onboarding
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [ob, setOb] = useState({ name: "", dob: "" });
  const [loading, setLoading] = useState(false);
  const onSuccessRef = useRef(null);

  // Hydrate session on load. If returning from Google OAuth, process the session_id first.
  useEffect(() => {
    const hash = window.location.hash || "";
   
    const token = localStorage.getItem("dp_token");
    if (!token) { setUser(false); setReady(true); return; }
    api.me().then((u) => setUser(u)).catch(() => { localStorage.removeItem("dp_token"); setUser(false); }).finally(() => setReady(true));
  }, []);

 const openAuth = useCallback((onSuccess, adminLogin = false) => {
  onSuccessRef.current =
    typeof onSuccess === "function" ? onSuccess : null;

  setShowAdminLogin(adminLogin);

  setStep("phone");
  setPhone("");
  setOtp("");
  setOb({ name: "", dob: "" });
  setOpen(true);
}, []);
  const closeAuth = useCallback(() => setOpen(false), []);
  const logout = useCallback(() => { localStorage.removeItem("dp_token"); setUser(false); }, []);
  const refresh = useCallback(async () => { try { setUser(await api.me()); } catch { /* ignore */ } }, []);

  const runSuccess = (u) => {
    const cb = onSuccessRef.current; onSuccessRef.current = null;
    if (cb) cb(u);
  };

  const afterAuth = (res) => {
    localStorage.setItem("dp_token", res.token);
    setUser(res.user);
    if (res.isNewUser) {
      setOb({ name: res.user?.name || "", dob: "" });
      setStep("onboarding");
    } else {
      setOpen(false);
      runSuccess(res.user);
    }
  };

  const sendOtp = async () => {
    if (phone.replace(/\D/g, "").length < 10) return toast.error("Enter a valid 10-digit phone number");
    setLoading(true);
    try { const r = await api.otpSend(phone); setStep("otp"); toast.success(r.demoHint || "OTP sent"); }
    catch (e) { toast.error(e.response?.data?.detail || "Could not send OTP"); }
    finally { setLoading(false); }
  };

  const verifyOtp = async () => {
    if (otp.length < 6) return toast.error("Enter the 6-digit OTP");
    setLoading(true);
    try { afterAuth(await api.otpVerify(phone, otp)); }
    catch (e) { toast.error(e.response?.data?.detail || "Invalid OTP"); }
    finally { setLoading(false); }
  };



  const completeOnboarding = async () => {
    if (!ob.name.trim()) return toast.error("Please enter your name");
    if (!ob.dob) return toast.error("Please enter your date of birth");
    setLoading(true);
    try {
      const r = await api.onboarding(ob.name.trim(), ob.dob);
      setUser(r.user);
      toast.success(`Welcome, ${r.user.name.split(" ")[0]}!`);
      setOpen(false);
      runSuccess(r.user);
    } catch (e) { toast.error(e.response?.data?.detail || "Could not save your details"); }
    finally { setLoading(false); }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthed: !!user, ready, openAuth, closeAuth, logout, refresh, setUser }}>
      {children}
      <AnimatePresence>
        {open && (
          <motion.div className="fixed inset-0 z-[100] flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} data-testid="auth-modal-overlay">
            <motion.div className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm" onClick={step === "onboarding" ? undefined : closeAuth} />
            <motion.div className="glass relative z-10 w-full max-w-md rounded-3xl p-8 shadow-large"
              initial={{ opacity: 0, y: 30, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.97 }}
              transition={{ type: "spring", stiffness: 260, damping: 24 }} data-testid="auth-modal">
              <div className="pointer-events-none absolute -top-24 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-blue-400/30 blur-3xl" />
              {step !== "onboarding" && (
                <button onClick={closeAuth} className="absolute right-5 top-5 grid h-9 w-9 place-items-center rounded-full text-slate-500 transition-colors hover:bg-slate-100" data-testid="auth-close-button" aria-label="Close"><X className="h-5 w-5" /></button>
              )}

              <div className="relative flex flex-col items-center text-center">
                <Logo />

                <AnimatePresence mode="wait">
                  {step === "phone" && (
                    <motion.div key="phone" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} className="mt-6 w-full">
                      <h3 className="text-2xl font-bold text-slate-900">Start your journey</h3>
                      <p className="mt-2 text-sm text-slate-500">One login for your entire Career Operating System.</p>

     <button
  type="button"
  onClick={handleGoogleLogin}
  className="w-full flex items-center justify-center gap-3 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-100 transition"
>
  <GoogleIcon />
  <span>Continue with Google</span>
</button>
{showAdminLogin && (
  <button
    type="button"
    onClick={() => {
      closeAuth();
      navigate("/skillhub/login");
    }}
    className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
  >
    <ShieldCheck className="h-5 w-5 text-violet-600" />
    Login as Admin
  </button>
)}

                      <div className="my-5 flex items-center gap-3 text-xs font-medium text-slate-400"><span className="h-px flex-1 bg-slate-200" /> OR <span className="h-px flex-1 bg-slate-200" /></div>

                      <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3.5 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100">
                        <span className="text-[15px] font-semibold text-slate-700">+91</span>
                        <input autoFocus type="tel" inputMode="numeric" placeholder="98765 43210" value={phone}
                          onChange={(e) => setPhone(e.target.value.replace(/[^\d ]/g, "").slice(0, 11))}
                          onKeyDown={(e) => e.key === "Enter" && sendOtp()}
                          className="w-full bg-transparent text-[15px] font-medium text-slate-900 outline-none placeholder:text-slate-300" data-testid="auth-phone-input" />
                      </div>
                      <button onClick={sendOtp} disabled={loading} data-testid="auth-send-otp-button"
                        className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-3.5 text-[16px] font-semibold text-white shadow-medium transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-glow disabled:opacity-60">
                        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <><Phone className="h-4 w-4" /> Send OTP</>}
                      </button>
                      <p className="mt-4 text-xs text-slate-400">By continuing you agree to our Terms & Privacy Policy.</p>
                    </motion.div>
                  )}

                  {step === "otp" && (
                    <motion.div key="otp" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} className="mt-6 w-full">
                      <button onClick={() => setStep("phone")} className="mb-3 inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-800"><ChevronLeft className="h-4 w-4" /> Back</button>
                      <h3 className="text-2xl font-bold text-slate-900">Verify OTP</h3>
                      <p className="mt-2 text-sm text-slate-500">Enter the 6-digit code sent to +91 {phone}</p>
                      <div className="mt-6 flex justify-center" data-testid="auth-otp-input">
                        <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                          <InputOTPGroup>
                            {[0, 1, 2, 3, 4, 5].map((i) => <InputOTPSlot key={i} index={i} className="h-12 w-12 text-lg" />)}
                          </InputOTPGroup>
                        </InputOTP>
                      </div>
                      <button onClick={verifyOtp} disabled={loading} data-testid="auth-verify-otp-button"
                        className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-3.5 text-[16px] font-semibold text-white shadow-medium transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-glow disabled:opacity-60">
                        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <><ShieldCheck className="h-5 w-5" /> Verify & Continue</>}
                      </button>
                      <button onClick={sendOtp} className="mt-4 w-full text-center text-sm font-medium text-blue-600 hover:underline" data-testid="auth-resend-otp">Resend OTP</button>
                    </motion.div>
                  )}

                  {step === "onboarding" && (
                    <motion.div key="onboarding" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} className="mt-6 w-full text-left">
                      <div className="text-center">
                        <h3 className="text-2xl font-bold text-slate-900">Welcome to MyMentor!</h3>
                        <p className="mx-auto mt-2 max-w-xs text-sm text-slate-500">Just two quick things to personalise your journey.</p>
                      </div>
                      <div className="mt-6 space-y-4">
                        <div>
                          <label className="mb-1.5 block text-sm font-semibold text-slate-700">What is your name?</label>
                          <div className="relative">
                            <User className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <input className={`${field} pl-11`} placeholder="Your full name" value={ob.name} onChange={(e) => setOb((s) => ({ ...s, name: e.target.value }))} data-testid="onboarding-name" autoFocus />
                          </div>
                        </div>
                        <div>
                          <label className="mb-1.5 block text-sm font-semibold text-slate-700">What is your date of birth?</label>
                          <div className="relative">
                            <CalendarDays className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <input type="date" className={`${field} pl-11`} value={ob.dob} onChange={(e) => setOb((s) => ({ ...s, dob: e.target.value }))} data-testid="onboarding-dob" max={new Date().toISOString().slice(0, 10)} />
                          </div>
                          <p className="mt-1.5 text-xs text-slate-400">We use this only to tailor your career recommendations.</p>
                        </div>
                      </div>
                      <button onClick={completeOnboarding} disabled={loading} data-testid="onboarding-submit"
                        className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-3.5 text-[16px] font-semibold text-white shadow-medium transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-glow disabled:opacity-60">
                        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Continue <ArrowRight className="h-4 w-4" /></>}
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AuthContext.Provider>
  );
};
