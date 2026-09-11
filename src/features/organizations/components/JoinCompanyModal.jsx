import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  X,
  Loader2,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Building2,
  UserRound,
  ShieldCheck,
  Eye,
  EyeOff,
  Upload,
} from "lucide-react";
import { api } from "@/services/api";
import { toast } from "sonner";

const INDUSTRIES = [
  "Technology",
  "E-commerce",
  "Finance",
  "Healthcare",
  "Consulting",
  "Manufacturing",
  "Education",
  "Media",
  "Other",
];

const SIZES = [
  "1-10",
  "11-50",
  "51-200",
  "201-1000",
  "1000-5000",
  "5000+",
];

const field =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-[15px] text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100";

const Label = ({ children, req }) => (
  <label className="mb-1.5 block text-sm font-semibold text-slate-700">
    {children}
    {req && <span className="text-blue-600"> *</span>}
  </label>
);

const STEPS = [
  {
    number: 1,
    title: "Company Profile",
    description: "Tell us about your company",
    icon: Building2,
  },
  {
    number: 2,
    title: "Contact Person",
    description: "Add your primary contact",
    icon: UserRound,
  },
  {
    number: 3,
    title: "Admin Credential",
    description: "Create your admin account",
    icon: ShieldCheck,
  },
];

export default function JoinCompanyModal({ open, onClose }) {

  const [currentUser, setCurrentUser] = useState(null);
  const [userLoading, setUserLoading] = useState(false);

  useEffect(() => {
  if (!open) return;

  const loadCurrentUser = async () => {
    try {
      const user = await api.me();

      console.log("LOGGED IN USER:", user);

      const email = user?.email || "";

      setF((prev) => ({
        ...prev,
        contactEmail: email,
        adminEmail: email,
      }));
    } catch (error) {
      console.error("Failed to fetch current user:", error);
      toast.error("Unable to fetch logged-in email");
    }
  };

  loadCurrentUser();
}, [open]);


  const [step, setStep] = useState(1);

  const [f, setF] = useState({
    // Step 1
    companyName: "",
    logo: null,
    website: "",
    industry: "",
    size: "",
    location: "",
    about: "",

    // Step 2
    contactEmail: "",
    contactPhone: "",
    contactName: "",
    contactRole: "",

    // Step 3
    adminEmail: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const set = (key) => (e) => {
    const value =
      e.target.type === "file" ? e.target.files?.[0] || null : e.target.value;

    setF((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const validateStep = () => {
    // STEP 1
    if (step === 1) {
      if (!f.companyName.trim()) {
        toast.error("Please enter the company name");
        return false;
      }

      if (!f.industry) {
        toast.error("Please select an industry");
        return false;
      }

      return true;
    }

    // STEP 2
    if (step === 2) {
      if (!f.contactEmail.trim()) {
        toast.error("Please enter the contact email");
        return false;
      }

      if (!isValidEmail(f.contactEmail)) {
        toast.error("Please enter a valid contact email");
        return false;
      }

      if (!f.contactPhone.trim()) {
        toast.error("Please enter the contact phone number");
        return false;
      }

      if (!f.contactName.trim()) {
        toast.error("Please enter the contact person's name");
        return false;
      }

      if (!f.contactRole.trim()) {
        toast.error("Please enter the contact person's role");
        return false;
      }

      return true;
    }

    // STEP 3
    if (step === 3) {
      if (!f.adminEmail.trim()) {
        toast.error("Please enter the admin official email");
        return false;
      }

      if (!isValidEmail(f.adminEmail)) {
        toast.error("Please enter a valid admin email");
        return false;
      }

      if (!f.password) {
        toast.error("Please enter a password");
        return false;
      }

      if (f.password.length < 8) {
        toast.error("Password must be at least 8 characters");
        return false;
      }

      if (f.password !== f.confirmPassword) {
        toast.error("Passwords do not match");
        return false;
      }

      return true;
    }

    return true;
  };

  const nextStep = () => {
    if (!validateStep()) return;

    if (step < 3) {
      setStep((prev) => prev + 1);
    }
  };

  const previousStep = () => {
    if (step > 1) {
      setStep((prev) => prev - 1);
    }
  };

  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const submit = async (e) => {
    e.preventDefault();

    if (!validateStep()) return;

    setLoading(true);

    try {
      const payload = {
        name: f.companyName.trim(),
        industry: f.industry,
        logo: f.logo ? f.logo.name : "",
        website: f.website.trim(),
        location: f.location.trim(),
        size: f.size,

        open_roles: 0,
        about: f.about.trim(),

        contact_person_name: f.contactName.trim(),
        contact_email: f.contactEmail.trim(),
        contact_phone: f.contactPhone.trim(),
        contact_role: f.contactRole.trim(),

        // Admin account
       admin_official_email: f.adminEmail.trim(),
       password: f.password,

        status: "pending",
        verified: false,
      };
      console.log("COMPANY JOIN REQUEST:", payload);

      const response = await api.companyJoin(payload);

      console.log("COMPANY JOIN RESPONSE:", response);

      setDone(true);
    } catch (err) {
      console.error("COMPANY JOIN ERROR:", err);

      toast.error(
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        "Submission failed"
      );
    } finally {
      setLoading(false);
    }
  };

  const close = () => {
  setDone(false);
  setStep(1);

  setShowPassword(false);
  setShowConfirmPassword(false);

  setF({
    companyName: "",
    logo: null,
    website: "",
    industry: "",
    size: "",
    location: "",
    about: "",
    contactEmail: "",
    contactPhone: "",
    contactName: "",
    contactRole: "",
    adminEmail: "",
    password: "",
    confirmPassword: "",
  });

  onClose();
};

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] grid place-items-center overflow-y-auto p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          data-testid="join-company-modal"
        >
          {/* Overlay */}
          <motion.div
            className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
            onClick={close}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 26,
            }}
            className="relative z-10 my-8 w-full max-w-2xl rounded-3xl bg-white p-6 shadow-large sm:p-8"
          >
            {/* Close */}
            <button
              type="button"
              onClick={close}
              className="absolute right-5 top-5 grid h-9 w-9 place-items-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
              data-testid="join-company-close"
            >
              <X className="h-5 w-5" />
            </button>

            {/* SUCCESS */}
            {done ? (
              <div className="py-8 text-center">
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 220,
                    damping: 14,
                  }}
                  className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 text-white shadow-glow"
                >
                  <CheckCircle2 className="h-9 w-9" />
                </motion.span>

                <h3 className="mt-5 text-2xl font-bold text-slate-900">
                  Request received!
                </h3>

                <p className="mx-auto mt-2 max-w-md text-slate-600">
                  Thanks for your interest in partnering with MyMentor. Our
                  partnerships team will review and reach out within 3-5
                  business days. A confirmation email is on its way.
                </p>

                <button
                  type="button"
                  onClick={close}
                  className="mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 px-6 py-3 font-semibold text-white shadow-medium transition hover:-translate-y-0.5 hover:shadow-glow"
                  data-testid="join-company-done"
                >
                  Done
                </button>
              </div>
            ) : (
              <>
                {/* HEADER */}
                <div className="flex items-center gap-3 pr-8">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white">
                    <Building2 className="h-5 w-5" />
                  </span>

                  <div>
                    <h3 className="text-2xl font-bold text-slate-900">
                      Join as a Company
                    </h3>

                    <p className="text-sm text-slate-500">
                      Partner with MyMentor to hire top vetted talent.
                    </p>
                  </div>
                </div>

                {/* STEP INDICATOR */}
                <div className="mt-8">
                  <div className="flex items-center">
                    {STEPS.map((item, index) => {
                      const Icon = item.icon;
                      const active = step === item.number;
                      const completed = step > item.number;

                      return (
                        <div
                          key={item.number}
                          className="flex flex-1 items-center"
                        >
                          <div className="flex items-center">
                            <div
                              className={`grid h-10 w-10 shrink-0 place-items-center rounded-full transition-all duration-300 ${active || completed
                                  ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md"
                                  : "bg-slate-100 text-slate-400"
                                }`}
                            >
                              {completed ? (
                                <CheckCircle2 className="h-5 w-5" />
                              ) : (
                                <Icon className="h-5 w-5" />
                              )}
                            </div>
                          </div>

                          {index < STEPS.length - 1 && (
                            <div
                              className={`mx-2 h-1 flex-1 rounded-full transition-all duration-300 ${step > item.number
                                  ? "bg-gradient-to-r from-blue-600 to-cyan-500"
                                  : "bg-slate-100"
                                }`}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-3 flex justify-between">
                    {STEPS.map((item) => (
                      <div
                        key={item.number}
                        className={`text-xs font-semibold ${step === item.number
                            ? "text-blue-600"
                            : "text-slate-400"
                          }`}
                      >
                        {item.title}
                      </div>
                    ))}
                  </div>
                </div>

                {/* FORM */}
                <form onSubmit={submit} className="mt-7">
                  <AnimatePresence mode="wait">
                    {/* ================= STEP 1 ================= */}
                    {step === 1 && (
                      <motion.div
                        key="step-1"
                        initial={{ opacity: 0, x: 25 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -25 }}
                        transition={{ duration: 0.2 }}
                        className="grid gap-4 sm:grid-cols-2"
                      >
                        <div>
                          <Label req>Company Name</Label>

                          <input
                            className={field}
                            value={f.companyName}
                            onChange={set("companyName")}
                            placeholder="Acme Technologies"
                            data-testid="company-name"
                          />
                        </div>

                        <div>
                          <Label>Company Logo</Label>

                          <div className="relative">
                            <input
                              type="file"
                              accept="image/png,image/jpeg,image/webp"
                              onChange={set("logo")}
                              className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
                              data-testid="company-logo"
                            />

                            <div className={field + " flex items-center gap-3"}>
                              <Upload className="h-5 w-5 text-slate-400" />

                              <span className="truncate text-slate-500">
                                {f.logo
                                  ? f.logo.name
                                  : "Choose company logo"}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <Label>Website URL</Label>

                          <input
                            type="url"
                            className={field}
                            value={f.website}
                            onChange={set("website")}
                            placeholder="https://company.com"
                            data-testid="company-website"
                          />
                        </div>

                        <div>
                          <Label req>Industry</Label>

                          <select
                            className={field}
                            value={f.industry}
                            onChange={set("industry")}
                            data-testid="company-industry"
                          >
                            <option value="">Select industry</option>

                            {INDUSTRIES.map((industry) => (
                              <option key={industry} value={industry}>
                                {industry}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <Label>Company Size</Label>

                          <select
                            className={field}
                            value={f.size}
                            onChange={set("size")}
                            data-testid="company-size"
                          >
                            <option value="">Select size</option>

                            {SIZES.map((size) => (
                              <option key={size} value={size}>
                                {size}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <Label>Location</Label>

                          <input
                            className={field}
                            value={f.location}
                            onChange={set("location")}
                            placeholder="Bengaluru, Remote"
                            data-testid="company-location"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <Label>About the Company</Label>

                          <textarea
                            className={field}
                            rows={4}
                            value={f.about}
                            onChange={set("about")}
                            placeholder="Tell us briefly about your company..."
                            data-testid="company-about"
                          />
                        </div>
                      </motion.div>
                    )}

                    {/* ================= STEP 2 ================= */}
                    {step === 2 && (
                      <motion.div
                        key="step-2"
                        initial={{ opacity: 0, x: 25 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -25 }}
                        transition={{ duration: 0.2 }}
                        className="grid gap-4 sm:grid-cols-2"
                      >
                        <div className="sm:col-span-2 rounded-2xl bg-blue-50 p-4">
                          <div className="flex gap-3">
                            <UserRound className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />

                            <div>
                              <p className="font-semibold text-blue-900">
                                Request Contact Person
                              </p>

                              <p className="mt-1 text-sm text-blue-700">
                                Provide the details of the person we should
                                contact regarding your partnership request.
                              </p>
                            </div>
                          </div>
                        </div>

                        <div>
                          <Label req>Contact Email</Label>

                          <input
                            type="email"
                            className={field}
                            value={f.contactEmail}
                            readOnly
                            disabled
                            placeholder="Loading email..."
                            data-testid="admin-email"
                          />
                        </div>

                        <div>
                          <Label req>Contact Phone No.</Label>

                          <input
                            type="tel"
                            className={field}
                            value={f.contactPhone}
                            onChange={set("contactPhone")}
                            placeholder="+91 98765 43210"
                            data-testid="contact-phone"
                          />
                        </div>

                        <div>
                          <Label req>Contact Person Name</Label>

                          <input
                            className={field}
                            value={f.contactName}
                            onChange={set("contactName")}
                            placeholder="John Doe"
                            data-testid="contact-name"
                          />
                        </div>

                        <div>
                          <Label req>Role</Label>

                          <input
                            className={field}
                            value={f.contactRole}
                            onChange={set("contactRole")}
                            placeholder="HR Manager"
                            data-testid="contact-role"
                          />
                        </div>
                      </motion.div>
                    )}

                    {/* ================= STEP 3 ================= */}
                    {step === 3 && (
                      <motion.div
                        key="step-3"
                        initial={{ opacity: 0, x: 25 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -25 }}
                        transition={{ duration: 0.2 }}
                        className="grid gap-4"
                      >
                        <div className="rounded-2xl bg-emerald-50 p-4">
                          <div className="flex gap-3">
                            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />

                            <div>
                              <p className="font-semibold text-emerald-900">
                                Create Admin Account
                              </p>

                              <p className="mt-1 text-sm text-emerald-700">
                                These credentials will be used by your company
                                administrator to access MyMentor.
                              </p>
                            </div>
                          </div>
                        </div>

                        <div>
                          <Label req>Admin Official Email</Label>

                          <input
                            type="email"
                            className={field}
                            value={f.adminEmail}
                            onChange={set("adminEmail")}
                            placeholder="admin@company.com"
                            data-testid="admin-email"
                          />
                        </div>

                        <div>
  <Label req>Password</Label>

  <div className="relative">
    <input
      type={showPassword ? "text" : "password"}
      className={`${field} pr-12`}
      value={f.password}
      onChange={set("password")}
      placeholder="Enter password"
      data-testid="admin-password"
    />

    <button
      type="button"
      onClick={() => setShowPassword((prev) => !prev)}
      className="
        absolute right-3 top-1/2
        -translate-y-1/2
        rounded-lg p-1.5
        text-slate-400
        transition-colors
        hover:bg-slate-100
        hover:text-slate-700
      "
      aria-label={showPassword ? "Hide password" : "Show password"}
    >
      {showPassword ? (
        <EyeOff className="h-5 w-5" />
      ) : (
        <Eye className="h-5 w-5" />
      )}
    </button>
  </div>

  <p className="mt-1.5 text-xs text-slate-500">
    Password must contain at least 8 characters.
  </p>
</div>

                        <div>
  <Label req>Confirm Password</Label>

  <div className="relative">
    <input
      type={showConfirmPassword ? "text" : "password"}
      className={`${field} pr-12`}
      value={f.confirmPassword}
      onChange={set("confirmPassword")}
      placeholder="Re-enter password"
      data-testid="admin-confirm-password"
    />

    <button
      type="button"
      onClick={() =>
        setShowConfirmPassword((prev) => !prev)
      }
      className="
        absolute right-3 top-1/2
        -translate-y-1/2
        rounded-lg p-1.5
        text-slate-400
        transition-colors
        hover:bg-slate-100
        hover:text-slate-700
      "
      aria-label={
        showConfirmPassword
          ? "Hide confirm password"
          : "Show confirm password"
      }
    >
      {showConfirmPassword ? (
        <EyeOff className="h-5 w-5" />
      ) : (
        <Eye className="h-5 w-5" />
      )}
    </button>
  </div>

  {f.confirmPassword &&
    f.password !== f.confirmPassword && (
      <p className="mt-1.5 text-xs text-red-500">
        Passwords do not match.
      </p>
    )}
</div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* NAVIGATION BUTTONS */}
                  <div className="mt-8 flex items-center justify-between gap-3 border-t border-slate-100 pt-6">
                    {/* BACK */}
                    {step > 1 ? (
                      <button
                        type="button"
                        onClick={previousStep}
                        disabled={loading}
                        className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-6 py-3 font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                        data-testid="company-back"
                      >
                        <ArrowLeft className="h-4 w-4" />
                        Back
                      </button>
                    ) : (
                      <div />
                    )}

                    {/* NEXT */}
                    {step < 3 ? (
                      <button
                        type="button"
                        onClick={nextStep}
                        className="ml-auto inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 px-7 py-3.5 font-semibold text-white shadow-medium transition hover:-translate-y-0.5 hover:shadow-glow"
                        data-testid="company-next"
                      >
                        Next
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    ) : (
                      /* SUBMIT */
                      <button
                        type="submit"
                        disabled={loading}
                        className="ml-auto inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 px-7 py-3.5 font-semibold text-white shadow-medium transition hover:-translate-y-0.5 hover:shadow-glow disabled:cursor-not-allowed disabled:opacity-60"
                        data-testid="company-submit"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="h-5 w-5 animate-spin" />
                            Submitting...
                          </>
                        ) : (
                          <>
                            Submit Request
                            <CheckCircle2 className="h-4 w-4" />
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </form>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}