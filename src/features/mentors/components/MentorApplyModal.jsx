import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Loader2, CheckCircle2, ArrowRight, Briefcase, AlertCircle } from "lucide-react";
import { api } from "@/services/api";
import { PrimaryButton } from "@/features/career/components/landing/primitives";
import { toast } from "sonner";

const INDUSTRIES = ["Technology", "Healthcare", "Finance", "Government", "Design", "Data Science", "Business", "Law", "Engineering", "Science", "Arts", "Other"];
const field = "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-[15px] text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100";
const Label = ({ children, req }) => <label className="mb-1.5 block text-sm font-semibold text-slate-700">{children}{req && <span className="text-blue-600"> *</span>}</label>;

const initialForm = {
  name: "",
  email: "",
  phone: "",
  role: "",
  company: "",
  industry: "",
  experienceYears: "",
  skills: "",
  languages: "",
  linkedin: "",
  bio: "",
  motivation: "",
};

export default function MentorApplyModal({
  open,
  onClose,
  onApplicationSuccess,
}) {
const [f, setF] = useState({ ...initialForm });

useEffect(() => {
  if (!open) {
    setF({ ...initialForm });
    setDone(false);
  }
}, [open]);

  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }));

  const yrs = parseInt(f.experienceYears || "0", 10);
  const yearsInvalid = f.experienceYears !== "" && yrs < 5;

  const submit = async (e) => {
    e.preventDefault();
    if (!f.name || !f.email || !f.role || !f.industry) return toast.error("Please fill all required fields");
    if (yrs < 5) return toast.error("Mentors need a minimum of 5 years of experience in one industry.");
    setLoading(true);
    try {

const payload = {
  name: f.name,
  email: f.email,
  phone: f.phone,
  role: f.role,
  company: f.company,
  industry: f.industry,
  experience_years: yrs,
  skills: f.skills
    .split(",")
    .map((skill) => skill.trim())
    .filter(Boolean),
  languages: f.languages,
  linkedin: f.linkedin,
  bio: f.bio,
  motivation: f.motivation,
};

await api.mentorApply(payload);

toast.success("Mentor application submitted successfully!");

await onApplicationSuccess?.();

setDone(true);
    
} catch (err) {
  const detail = err.response?.data?.detail;

  let message = "Submission failed. Please try again.";

  if (typeof detail === "string") {
    message = detail;
  } else if (Array.isArray(detail)) {
    message = detail
      .map((item) =>
        typeof item === "string"
          ? item
          : item?.msg || "Invalid input"
      )
      .join(", ");
  } else if (detail && typeof detail === "object") {
    message = detail.msg || detail.message || message;
  }

  toast.error(message);
  console.error("Mentor application error:", err.response?.data || err);
} finally {
  setLoading(false);
}

  };

  

const close = () => {
  setF({ ...initialForm });
  setDone(false);
  onClose();
};

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[100] grid place-items-center overflow-y-auto p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} data-testid="mentor-apply-modal">
          <motion.div className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" onClick={close} />
          <motion.div initial={{ opacity: 0, y: 30, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 260, damping: 26 }}
            className="relative z-10 my-8 w-full max-w-2xl rounded-3xl bg-white p-8 shadow-large">
            <button onClick={close} className="absolute right-5 top-5 grid h-9 w-9 place-items-center rounded-full text-slate-500 hover:bg-slate-100" data-testid="mentor-apply-close"><X className="h-5 w-5" /></button>

            {done ? (
              <div className="py-8 text-center">
                <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 220, damping: 14 }} className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 text-white shadow-glow"><CheckCircle2 className="h-9 w-9" /></motion.span>
                <h3 className="mt-5 text-2xl font-bold text-slate-900">Application received!</h3>
                <p className="mx-auto mt-2 max-w-md text-slate-600">Thank you for applying to mentor with MyMentor. Our team will review your profile and get back to you within 3-5 business days.</p>
                <PrimaryButton onClick={close} className="mt-6" data-testid="mentor-apply-done">Done</PrimaryButton>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3">
                  <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white"><Briefcase className="h-5 w-5" /></span>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900">Join as a Mentor</h3>
                    <p className="text-sm text-slate-500">Share your expertise and guide the next generation.</p>
                  </div>
                </div>

                <form onSubmit={submit} className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div><Label req>Full Name</Label><input className={field} value={f.name} onChange={set("name")} data-testid="apply-name" /></div>
                  <div><Label req>Email</Label><input className={field} type="email" value={f.email} onChange={set("email")} data-testid="apply-email" /></div>
                  <div><Label>Phone</Label><input className={field} value={f.phone} onChange={set("phone")} data-testid="apply-phone" /></div>
                  <div><Label req>Current Role</Label><input className={field} value={f.role} onChange={set("role")} placeholder="e.g. Senior Software Engineer" data-testid="apply-role" /></div>
                  <div><Label>Company</Label><input className={field} value={f.company} onChange={set("company")} data-testid="apply-company" /></div>
                  <div>
                    <Label req>Industry</Label>
                    <select className={field} value={f.industry} onChange={set("industry")} data-testid="apply-industry">
                      <option value="">Select industry</option>
                      {INDUSTRIES.map((i) => <option key={i} value={i}>{i}</option>)}
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <Label req>Years of Experience (in this industry)</Label>
                    <input className={`${field} ${yearsInvalid ? "border-red-400 focus:border-red-500 focus:ring-red-100" : ""}`} type="number" min="0" value={f.experienceYears} onChange={set("experienceYears")} placeholder="Minimum 5 years required" data-testid="apply-years" />
                    {yearsInvalid && <p className="mt-1.5 flex items-center gap-1.5 text-sm font-medium text-red-500" data-testid="apply-years-error"><AlertCircle className="h-4 w-4" /> A minimum of 5 years in one industry is required to mentor.</p>}
                  </div>
                  <div><Label>Skills / Expertise</Label><input className={field} value={f.skills} onChange={set("skills")} placeholder="System Design, Career Coaching..." data-testid="apply-skills" /></div>
                  <div><Label>Languages</Label><input className={field} value={f.languages} onChange={set("languages")} placeholder="English, Tamil" data-testid="apply-languages" /></div>
                  <div className="sm:col-span-2"><Label>LinkedIn</Label><input className={field} value={f.linkedin} onChange={set("linkedin")} placeholder="https://linkedin.com/in/..." data-testid="apply-linkedin" /></div>
                  <div className="sm:col-span-2"><Label>Why do you want to mentor?</Label><textarea className={field} rows={3} value={f.motivation} onChange={set("motivation")} data-testid="apply-motivation" /></div>

                  <div className="sm:col-span-2 mt-2">
                    <button type="submit" disabled={loading} data-testid="apply-submit"
                      className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 px-6 py-3.5 text-[16px] font-semibold text-white shadow-medium transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-glow disabled:opacity-60">
                      {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Submit Application <ArrowRight className="h-4 w-4" /></>}
                    </button>
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
