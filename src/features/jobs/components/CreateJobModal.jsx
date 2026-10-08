import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Loader2, CheckCircle2, ArrowRight, PlusCircle } from "lucide-react";
import { api } from "@/services/api";
import { toast } from "sonner";

const TYPES = ["Full-time", "Part-time", "Internship", "Contract", "Remote"];
const field = "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-[15px] text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100";
const Label = ({ children, req }) => <label className="mb-1.5 block text-sm font-semibold text-slate-700">{children}{req && <span className="text-blue-600"> *</span>}</label>;

export default function CreateJobModal({ open, onClose, onCreated }) {
  const [f, setF] = useState({ title: "", company: "", location: "", type: "Full-time", experience: "", salary: "", skills: "", description: "", applyEmail: "" });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }));

  const submit = async (e) => {
  e.preventDefault();

  if (!f.title || !f.company || !f.description) {
    return toast.error("Title, company and description are required");
  }

  setLoading(true);

  try {
    const payload = {
      title: f.title,
      company_name: f.company,
      location: f.location,
      type: f.type,
      experience: f.experience,
      salary: f.salary,
      skills: f.skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      description: f.description,
      applyEmail: f.applyEmail,
    };

    const res = await api.jobCreate(payload);

    setDone(true);
    onCreated?.(res.job);
  } catch (err) {
    console.error("Create Job Error:", err?.response?.data || err);

    const detail = err?.response?.data?.detail;

    const message = Array.isArray(detail)
      ? detail.map((item) => item.msg).join(", ")
      : detail || "Failed to post job";

    toast.error(message);
  } finally {
    setLoading(false);
  }
};

  const close = () => { setDone(false); setF({ title: "", company: "", location: "", type: "Full-time", experience: "", salary: "", skills: "", description: "", applyEmail: "" }); onClose(); };

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[120] grid place-items-center overflow-y-auto p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} data-testid="create-job-modal">
          <motion.div className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" onClick={close} />
          <motion.div initial={{ opacity: 0, y: 30, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 260, damping: 26 }} className="relative z-10 my-8 w-full max-w-2xl rounded-3xl bg-white p-8 shadow-large">
            <button onClick={close} className="absolute right-5 top-5 grid h-9 w-9 place-items-center rounded-full text-slate-500 hover:bg-slate-100" data-testid="create-job-close"><X className="h-5 w-5" /></button>

            {done ? (
              <div className="py-8 text-center">
                <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 220, damping: 14 }} className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 text-white shadow-glow"><CheckCircle2 className="h-9 w-9" /></motion.span>
                <h3 className="mt-5 text-2xl font-bold text-slate-900">Job posted!</h3>
                <p className="mx-auto mt-2 max-w-md text-slate-600">Your role <strong>{f.title}</strong> is now live on the job board. A confirmation email has been sent to you.</p>
                <button onClick={close} className="mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 px-6 py-3 font-semibold text-white shadow-medium" data-testid="create-job-done">Done</button>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3">
                  <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white"><PlusCircle className="h-5 w-5" /></span>
                  <div><h3 className="text-2xl font-bold text-slate-900">Post a New Job</h3><p className="text-sm text-slate-500">Reach thousands of career-ready candidates.</p></div>
                </div>
                <form onSubmit={submit} className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div><Label req>Job Title</Label><input className={field} value={f.title} onChange={set("title")} placeholder="Software Engineer" data-testid="job-title" /></div>
                  <div><Label req>Company</Label><input className={field} value={f.company} onChange={set("company")} data-testid="job-company" /></div>
                  <div><Label>Location</Label><input className={field} value={f.location} onChange={set("location")} placeholder="Bengaluru / Remote" data-testid="job-location" /></div>
                  <div><Label>Type</Label><select className={field} value={f.type} onChange={set("type")} data-testid="job-type">{TYPES.map((t) => <option key={t}>{t}</option>)}</select></div>
                  <div><Label>Experience</Label><input className={field} value={f.experience} onChange={set("experience")} placeholder="2-4 years" data-testid="job-experience" /></div>
                  <div><Label>Salary</Label><input className={field} value={f.salary} onChange={set("salary")} placeholder="₹20-30 LPA" data-testid="job-salary" /></div>
                  <div className="sm:col-span-2"><Label>Skills (comma separated)</Label><input className={field} value={f.skills} onChange={set("skills")} placeholder="React, Node, SQL" data-testid="job-skills" /></div>
                  <div className="sm:col-span-2"><Label>Applications Email</Label><input className={field} type="email" value={f.applyEmail} onChange={set("applyEmail")} placeholder="Where to receive applicants" data-testid="job-apply-email" /></div>
                  <div className="sm:col-span-2"><Label req>Job Description</Label><textarea className={field} rows={6} value={f.description} onChange={set("description")} placeholder="Responsibilities, requirements, perks..." data-testid="job-description" /></div>
                  <div className="sm:col-span-2 mt-1">
                    <button type="submit" disabled={loading} data-testid="job-create-submit" className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 px-6 py-3.5 text-[16px] font-semibold text-white shadow-medium transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-glow disabled:opacity-60">
                      {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Post Job <ArrowRight className="h-4 w-4" /></>}
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
