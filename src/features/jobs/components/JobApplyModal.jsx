import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  X,
  Loader2,
  CheckCircle2,
  Send,
  Upload,
  Link2,
} from "lucide-react";
import { api } from "@/services/api";
import { toast } from "sonner";

const field = "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-[15px] text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100";
const Label = ({ children, req }) => <label className="mb-1.5 block text-sm font-semibold text-slate-700">{children}{req && <span className="text-blue-600"> *</span>}</label>;

export default function JobApplyModal({ open, onClose, job }) {

  const [resumeType, setResumeType] = useState("upload");
  const [f, setF] = useState({ name: "", email: "", phone: "", experience: "", coverNote: "", resumeLink: "", resumeFile: null });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }));

 const submit = async (e) => {
  e.preventDefault();

  if (!f.name || !f.email) {
    return toast.error("Name and email are required");
  }

  if (resumeType === "upload" && !f.resumeFile) {
    return toast.error("Please upload your resume");
  }

  if (resumeType === "link" && !f.resumeLink) {
    return toast.error("Please provide your resume link");
  }

  setLoading(true);

  try {
    let resumeLink = "";

    // ================================
    // UPLOAD RESUME
    // ================================
    if (resumeType === "upload") {
      const uploadResponse = await api.upload(f.resumeFile);

      console.log("RESUME UPLOAD RESPONSE:", uploadResponse);

      resumeLink =
        uploadResponse?.url ||
        uploadResponse?.file_url ||
        uploadResponse?.link ||
        "";
    }

    // ================================
    // USE RESUME LINK
    // ================================
    if (resumeType === "link") {
      resumeLink = f.resumeLink;
    }

    if (!resumeLink) {
      throw new Error(
        "Resume upload succeeded but no file URL was returned"
      );
    }

    // ================================
    // APPLICATION PAYLOAD
    // ================================
    const payload = {
      job_id: job.id,
      name: f.name,
      email: f.email,
      phone: f.phone,
      experience: f.experience,
      cover_note: f.coverNote,
      resume_link: resumeLink,
    };

    console.log("JOB APPLICATION PAYLOAD:", payload);

    const response = await api.jobApply(payload);

    console.log("JOB APPLICATION RESPONSE:", response);

    setDone(true);
  } catch (err) {
    console.error("APPLICATION ERROR:", err);
    console.error("STATUS:", err.response?.status);
    console.error("RESPONSE:", err.response?.data);

    const detail = err.response?.data?.detail;

    toast.error(
      typeof detail === "string"
        ? detail
        : err.message || "Submission failed"
    );
  } finally {
    setLoading(false);
  }
};

const close = () => {
  setDone(false);

  setResumeType("upload");

  setF({
    name: "",
    email: "",
    phone: "",
    experience: "",
    coverNote: "",
    resumeLink: "",
    resumeFile: null,
  });

  onClose();
};
  if (!job) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[120] grid place-items-center overflow-y-auto p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} data-testid="job-apply-modal">
          <motion.div className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" onClick={close} />
          <motion.div initial={{ opacity: 0, y: 30, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 260, damping: 26 }} className="relative z-10 my-8 w-full max-w-lg rounded-3xl bg-white p-8 shadow-large">
            <button onClick={close} className="absolute right-5 top-5 grid h-9 w-9 place-items-center rounded-full text-slate-500 hover:bg-slate-100" data-testid="job-apply-close"><X className="h-5 w-5" /></button>

            {done ? (
              <div className="py-8 text-center">
                <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 220, damping: 14 }} className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 text-white shadow-glow"><CheckCircle2 className="h-9 w-9" /></motion.span>
                <h3 className="mt-5 text-2xl font-bold text-slate-900">Application submitted!</h3>
                <p className="mx-auto mt-2 max-w-md text-slate-600">Your application for <strong>{job.title}</strong> at {job.company} has been sent. A confirmation email is on its way to your inbox.</p>
                <button onClick={close} className="mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 px-6 py-3 font-semibold text-white shadow-medium" data-testid="job-apply-done">Done</button>
              </div>
            ) : (
              <>
                <h3 className="text-2xl font-bold text-slate-900">Apply for this role</h3>
                <p className="mt-1 text-sm text-slate-500"><strong>{job.title}</strong> · {job.company}</p>
                <form onSubmit={submit} className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div><Label req>Full Name</Label><input className={field} value={f.name} onChange={set("name")} data-testid="apply-job-name" /></div>
                  <div><Label req>Email</Label><input className={field} type="email" value={f.email} onChange={set("email")} data-testid="apply-job-email" /></div>
                  <div><Label>Phone</Label><input className={field} value={f.phone} onChange={set("phone")} data-testid="apply-job-phone" /></div>
                  <div><Label>Experience</Label><input className={field} value={f.experience} onChange={set("experience")} placeholder="e.g. 2 years" data-testid="apply-job-exp" /></div>
<div className="sm:col-span-2">
  <Label>Resume</Label>

  {/* Resume type buttons */}
  <div className="mb-3 flex gap-2">
    <button
      type="button"
      onClick={() => setResumeType("upload")}
      className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
        resumeType === "upload"
          ? "bg-blue-600 text-white"
          : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
      }`}
    >
      <Upload className="h-4 w-4" />
      Upload Resume
    </button>

    <button
      type="button"
      onClick={() => setResumeType("link")}
      className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
        resumeType === "link"
          ? "bg-blue-600 text-white"
          : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
      }`}
    >
      <Link2 className="h-4 w-4" />
      Resume Link
    </button>
  </div>

  {/* Upload Resume */}
{resumeType === "upload" && (
  <div className="flex items-center gap-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 hover:border-blue-400 transition-colors">
    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-blue-50 text-blue-600">
      <Upload className="h-4 w-4" />
    </div>

    <div className="min-w-0 flex-1">
      <p className="text-sm font-medium text-slate-700">
        {f.resumeFile
          ? f.resumeFile.name
          : "Upload your resume"}
      </p>

      {!f.resumeFile && (
        <p className="text-xs text-slate-400">
          PDF, DOC or DOCX
        </p>
      )}
    </div>

    <label className="shrink-0 cursor-pointer rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-600 transition hover:bg-blue-100">
      Choose File

      <input
        type="file"
        accept=".pdf,.doc,.docx"
        onChange={(e) =>
          setF((prev) => ({
            ...prev,
            resumeFile: e.target.files?.[0] || null,
          }))
        }
        className="hidden"
        data-testid="apply-job-resume-upload"
      />
    </label>
  </div>
)}

  {/* Resume Link */}
  {resumeType === "link" && (
    <input
      className={field}
      value={f.resumeLink}
      onChange={set("resumeLink")}
      placeholder="https://drive.google.com/... or LinkedIn..."
      data-testid="apply-job-resume-link"
    />
  )}
</div>
                  <div className="sm:col-span-2"><Label>Cover Note</Label><textarea className={field} rows={3} value={f.coverNote} onChange={set("coverNote")} placeholder="Why are you a great fit?" data-testid="apply-job-cover" /></div>
                  <div className="sm:col-span-2 mt-1">
                    <button type="submit" disabled={loading} data-testid="apply-job-submit" className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 px-6 py-3.5 text-[16px] font-semibold text-white shadow-medium transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-glow disabled:opacity-60">
                      {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Submit Application <Send className="h-4 w-4" /></>}
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
