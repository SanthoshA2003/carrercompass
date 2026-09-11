import { useEffect, useState } from "react";
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

const field =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-[15px] text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100";

const Label = ({ children, req }) => (
  <label className="mb-1.5 block text-sm font-semibold text-slate-700">
    {children}
    {req && <span className="text-blue-600"> *</span>}
  </label>
);

export default function JobApplyModal({ open, onClose, job }) {
  // =========================================================
  // RESUME STATE
  // =========================================================

  const [resumeType, setResumeType] = useState("upload");

  const [profileResume, setProfileResume] = useState(null);

  const [profileResumeLoading, setProfileResumeLoading] =
    useState(false);

  const [useNewResume, setUseNewResume] = useState(false);

  // =========================================================
  // FORM STATE
  // =========================================================

  const [f, setF] = useState({
    name: "",
    email: "",
    phone: "",
    experience: "",
    coverNote: "",
    resumeLink: "",
    resumeFile: null,
  });

  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const set = (key) => (e) =>
    setF((prev) => ({
      ...prev,
      [key]: e.target.value,
    }));

  // =========================================================
  // FETCH PROFILE RESUME
  // =========================================================

  // =========================================================
// AUTOMATICALLY LOAD USER PROFILE DETAILS
// =========================================================

useEffect(() => {
  if (!open) return;

  const fetchProfileDetails = async () => {
    try {
      setProfileResumeLoading(true);

      // -----------------------------------------------------
      // 1. GET LOGIN USER DETAILS
      // Name / Email / Phone
      // -----------------------------------------------------

      const userResponse = await api.me();

      const user =
        userResponse?.user ||
        userResponse?.data ||
        userResponse ||
        {};

      console.log("CURRENT USER DATA:", user);

      // -----------------------------------------------------
      // 2. GET PROFILE DETAILS
      // Resume and other profile information
      // -----------------------------------------------------

      const profileResponse = await api.getProfile();

      const profile =
        profileResponse?.profile ||
        profileResponse?.data ||
        profileResponse ||
        {};

      console.log("PROFILE DATA:", profile);

      // -----------------------------------------------------
// 3. GET SAVED WORK EXPERIENCE
// -----------------------------------------------------

let workExperiences = [];

try {
  const experienceResponse =
    await api.getWorkExperiences();

  console.log(
    "================================="
  );
  console.log(
    "WORK EXPERIENCE API RESPONSE:",
    experienceResponse
  );
  console.log(
    "================================="
  );

  if (Array.isArray(experienceResponse)) {
    workExperiences = experienceResponse;
  } else if (
    Array.isArray(experienceResponse?.items)
  ) {
    workExperiences = experienceResponse.items;
  } else if (
    Array.isArray(
      experienceResponse?.experiences
    )
  ) {
    workExperiences =
      experienceResponse.experiences;
  } else if (
    Array.isArray(
      experienceResponse?.work_experiences
    )
  ) {
    workExperiences =
      experienceResponse.work_experiences;
  } else if (
    Array.isArray(
      experienceResponse?.workExperiences
    )
  ) {
    workExperiences =
      experienceResponse.workExperiences;
  } else if (
    Array.isArray(experienceResponse?.data)
  ) {
    workExperiences =
      experienceResponse.data;
  } else if (
    Array.isArray(
      experienceResponse?.data?.items
    )
  ) {
    workExperiences =
      experienceResponse.data.items;
  } else if (
    Array.isArray(
      experienceResponse?.data?.experiences
    )
  ) {
    workExperiences =
      experienceResponse.data.experiences;
  }

  console.log(
    "NORMALIZED WORK EXPERIENCES:",
    workExperiences
  );

} catch (experienceError) {
  console.warn(
    "WORK EXPERIENCE LOAD ERROR:",
    experienceError
  );
}

     // -----------------------------------------------------
// FIND EXPERIENCE
// -----------------------------------------------------

const firstExperience =
  workExperiences?.[0] || {};

console.log(
  "FIRST WORK EXPERIENCE:",
  firstExperience
);

const experience =
  firstExperience?.years_experience ??
  firstExperience?.experience_years ??
  firstExperience?.yearsExperience ??
  profile?.experience ??
  profile?.total_experience ??
  profile?.work_experience ??
  "";

      // -----------------------------------------------------
      // AUTOMATICALLY FILL FORM
      // -----------------------------------------------------

      setF((prev) => ({
        ...prev,

        name:
          user?.name ||
          user?.full_name ||
          user?.fullName ||
          "",

        email:
          user?.email ||
          "",

        phone:
          user?.phone ||
          user?.mobile ||
          user?.phone_number ||
          "",

        experience:
          experience !== null &&
          experience !== undefined
            ? String(experience)
            : "",
      }));

      // -----------------------------------------------------
      // PROFILE RESUME
      // -----------------------------------------------------

      const resumeUrl =
        profile?.resume_url ||
        profile?.resumeUrl ||
        "";

      const resumeFileId =
        profile?.resume_file_id ||
        profile?.resumeFileId ||
        null;

      if (resumeUrl) {
        setProfileResume({
          fileId: resumeFileId,
          url: resumeUrl,

          fileName:
            profile?.resume_file_name ||
            profile?.resumeFileName ||
            profile?.original_filename ||
            profile?.file_name ||
            "Profile Resume",
        });

        // Automatically use saved profile resume
        setResumeType("upload");
        setUseNewResume(false);
      } else {
        setProfileResume(null);
        setUseNewResume(true);
      }

    } catch (error) {
      console.error(
        "FETCH PROFILE DETAILS ERROR:",
        error
      );

      setProfileResume(null);
      setUseNewResume(true);

      toast.error(
        "Unable to load your profile details"
      );
    } finally {
      setProfileResumeLoading(false);
    }
  };

  fetchProfileDetails();
}, [open]);

  // =========================================================
  // SUBMIT APPLICATION
  // =========================================================

  const submit = async (e) => {
    e.preventDefault();

    if (!f.name || !f.email) {
      return toast.error(
        "Name and email are required"
      );
    }

    // ---------------------------------------------------------
    // RESUME VALIDATION
    // ---------------------------------------------------------

    if (
      resumeType === "upload" &&
      !profileResume &&
      !f.resumeFile
    ) {
      return toast.error(
        "Please upload your resume"
      );
    }

    if (
      resumeType === "link" &&
      !f.resumeLink
    ) {
      return toast.error(
        "Please provide your resume link"
      );
    }

    setLoading(true);

    try {
      let resumeLink = "";
      let resumeFileId = null;
      let resumeSource = "";

      // =======================================================
      // UPLOAD TYPE
      // =======================================================

      if (resumeType === "upload") {
        // -----------------------------------------------------
        // USE PROFILE RESUME
        // -----------------------------------------------------

        if (
          profileResume &&
          !useNewResume
        ) {
          resumeLink = profileResume.url;
          resumeFileId = profileResume.fileId;
          resumeSource = "profile";

          console.log(
            "USING PROFILE RESUME:",
            profileResume
          );
        }

        // -----------------------------------------------------
        // UPLOAD NEW RESUME
        // -----------------------------------------------------

        else if (f.resumeFile) {
          console.log(
            "UPLOADING NEW RESUME:",
            f.resumeFile.name
          );

          const uploadResponse =
            await api.upload(f.resumeFile);

          console.log(
            "NEW RESUME UPLOAD RESPONSE:",
            uploadResponse
          );

          resumeLink =
            uploadResponse?.file_url ||
            uploadResponse?.url ||
            uploadResponse?.fileUrl ||
            "";

          resumeFileId =
            uploadResponse?.id ||
            uploadResponse?.file_id ||
            null;

          resumeSource = "upload";
        }
      }

      // =======================================================
      // RESUME LINK
      // =======================================================

      if (resumeType === "link") {
        resumeLink = f.resumeLink;
        resumeSource = "link";
        resumeFileId = null;
      }

      // =======================================================
      // VALIDATE RESUME
      // =======================================================

      if (!resumeLink) {
        throw new Error(
          "Resume upload succeeded but no file URL was returned"
        );
      }

      // =======================================================
      // APPLICATION PAYLOAD
      // =======================================================

      const payload = {
        job_id: job.id,

        name: f.name,
        email: f.email,
        phone: f.phone,
        experience: f.experience,
        cover_note: f.coverNote,

        resume_file_id: resumeFileId,
        resume_source: resumeSource,
        resume_link: resumeLink,
      };

      console.log(
        "JOB APPLICATION PAYLOAD:",
        payload
      );

      const response =
        await api.jobApply(payload);

      console.log(
        "JOB APPLICATION RESPONSE:",
        response
      );

      setDone(true);
    } catch (err) {
      console.error(
        "APPLICATION ERROR:",
        err
      );

      console.error(
        "STATUS:",
        err.response?.status
      );

      console.error(
        "RESPONSE:",
        err.response?.data
      );

      const detail =
        err.response?.data?.detail;

      toast.error(
        typeof detail === "string"
          ? detail
          : err.message ||
              "Submission failed"
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // CLOSE
  // =========================================================

  const close = () => {
    setDone(false);

    setResumeType("upload");

    setProfileResume(null);
    setProfileResumeLoading(false);
    setUseNewResume(false);

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
        <motion.div
          className="fixed inset-0 z-[120] grid place-items-center overflow-y-auto p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          data-testid="job-apply-modal"
        >
          {/* BACKDROP */}

          <motion.div
            className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
            onClick={close}
          />

          {/* MODAL */}

          <motion.div
            initial={{
              opacity: 0,
              y: 30,
              scale: 0.97,
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              y: 20,
            }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 26,
            }}
            className="relative z-10 my-8 w-full max-w-lg rounded-3xl bg-white p-8 shadow-large"
          >
            {/* CLOSE */}

            <button
              onClick={close}
              className="absolute right-5 top-5 grid h-9 w-9 place-items-center rounded-full text-slate-500 hover:bg-slate-100"
              data-testid="job-apply-close"
            >
              <X className="h-5 w-5" />
            </button>

            {/* =================================================
                SUCCESS
            ================================================= */}

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
                  Application submitted!
                </h3>

                <p className="mx-auto mt-2 max-w-md text-slate-600">
                  Your application for{" "}
                  <strong>{job.title}</strong>{" "}
                  at {job.company} has been sent.
                </p>

                <button
                  onClick={close}
                  className="mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 px-6 py-3 font-semibold text-white shadow-medium"
                  data-testid="job-apply-done"
                >
                  Done
                </button>
              </div>
            ) : (
              <>
                <h3 className="text-2xl font-bold text-slate-900">
                  Apply for this role
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  <strong>{job.title}</strong> ·{" "}
                  {job.company}
                </p>

                <form
                  onSubmit={submit}
                  className="mt-6 grid gap-4 sm:grid-cols-2"
                >
                  {/* NAME */}

                  <div>
                    <Label req>
                      Full Name
                    </Label>

                    <input
                      className={field}
                      value={f.name}
                      onChange={set("name")}
                      data-testid="apply-job-name"
                    />
                  </div>

                  {/* EMAIL */}

                  <div>
                    <Label req>
                      Email
                    </Label>

                    <input
                      className={field}
                      type="email"
                      value={f.email}
                      onChange={set("email")}
                      data-testid="apply-job-email"
                    />
                  </div>

                  {/* PHONE */}

                  <div>
                    <Label>
                      Phone
                    </Label>

                    <input
                      className={field}
                      value={f.phone}
                      onChange={set("phone")}
                      data-testid="apply-job-phone"
                    />
                  </div>

                  {/* EXPERIENCE */}

                  <div>
                    <Label>
                      Experience
                    </Label>

                    <input
                      className={field}
                      value={f.experience}
                      onChange={set("experience")}
                      placeholder="e.g. 2 years"
                      data-testid="apply-job-exp"
                    />
                  </div>

                  {/* =================================================
                      RESUME
                  ================================================= */}

                  <div className="sm:col-span-2">
                    <Label>
                      Resume
                    </Label>

                    {/* Resume type buttons */}

                    <div className="mb-3 flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setResumeType(
                            "upload"
                          );

                          if (profileResume) {
                            setUseNewResume(
                              false
                            );
                          }
                        }}
                        className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
                          resumeType ===
                          "upload"
                            ? "bg-blue-600 text-white"
                            : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        <Upload className="h-4 w-4" />
                        Upload Resume
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setResumeType(
                            "link"
                          )
                        }
                        className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
                          resumeType ===
                          "link"
                            ? "bg-blue-600 text-white"
                            : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        <Link2 className="h-4 w-4" />
                        Resume Link
                      </button>
                    </div>

                    {/* =================================================
                        UPLOAD RESUME
                    ================================================= */}

                    {resumeType ===
                      "upload" && (
                      <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3">
                        {/* LOADING */}

                        {profileResumeLoading ? (
                          <div className="flex items-center gap-3">
                            <Loader2 className="h-5 w-5 animate-spin text-blue-600" />

                            <span className="text-sm text-slate-500">
                              Loading your resume...
                            </span>
                          </div>
                        ) : profileResume &&
                          !useNewResume ? (
                          /* =================================================
                             PROFILE RESUME
                          ================================================= */

                          <div className="flex items-center gap-3">
                            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-blue-50 text-blue-600">
                              <Upload className="h-4 w-4" />
                            </div>

                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-semibold text-slate-700">
                                {
                                  profileResume.fileName
                                }
                              </p>

                              <p className="text-xs text-emerald-600">
                                Resume from your profile
                              </p>
                            </div>

                            {/* VIEW */}

                            <a
                              href={
                                profileResume.url
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                              className="shrink-0 text-sm font-semibold text-blue-600 hover:text-blue-700"
                            >
                              View
                            </a>

                            {/* CHANGE */}

                            <button
                              type="button"
                              onClick={() => {
                                setUseNewResume(
                                  true
                                );

                                setF(
                                  (
                                    prev
                                  ) => ({
                                    ...prev,
                                    resumeFile:
                                      null,
                                  })
                                );
                              }}
                              className="shrink-0 rounded-full bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-600 hover:bg-blue-100"
                            >
                              Change
                            </button>
                          </div>
                        ) : (
                          /* =================================================
                             NEW RESUME
                          ================================================= */

                          <div className="flex items-center gap-3">
                            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-blue-50 text-blue-600">
                              <Upload className="h-4 w-4" />
                            </div>

                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-semibold text-slate-700">
                                {f.resumeFile
                                  ? f
                                      .resumeFile
                                      .name
                                  : "Choose a new resume"}
                              </p>

                              {!f.resumeFile && (
                                <p className="text-xs text-slate-400">
                                  PDF, DOC or DOCX
                                </p>
                              )}
                            </div>

                            {/* CHOOSE FILE */}

                            <label className="shrink-0 cursor-pointer rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-600 transition hover:bg-blue-100">
                              Choose File

                              <input
                                type="file"
                                accept=".pdf,.doc,.docx"
                                onChange={(
                                  e
                                ) => {
                                  const file =
                                    e.target
                                      .files?.[0] ||
                                    null;

                                  setF(
                                    (
                                      prev
                                    ) => ({
                                      ...prev,
                                      resumeFile:
                                        file,
                                    })
                                  );
                                }}
                                className="hidden"
                                data-testid="apply-job-resume-upload"
                              />
                            </label>

                            {/* USE PROFILE */}

                            {profileResume && (
                              <button
                                type="button"
                                onClick={() => {
                                  setUseNewResume(
                                    false
                                  );

                                  setF(
                                    (
                                      prev
                                    ) => ({
                                      ...prev,
                                      resumeFile:
                                        null,
                                    })
                                  );
                                }}
                                className="shrink-0 text-xs font-semibold text-slate-500 hover:text-slate-700"
                              >
                                Use Profile
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* =================================================
                        RESUME LINK
                    ================================================= */}

                    {resumeType ===
                      "link" && (
                      <input
                        className={field}
                        value={
                          f.resumeLink
                        }
                        onChange={set(
                          "resumeLink"
                        )}
                        placeholder="https://drive.google.com/... or LinkedIn..."
                        data-testid="apply-job-resume-link"
                      />
                    )}
                  </div>

                  {/* COVER NOTE */}

                  <div className="sm:col-span-2">
                    <Label>
                      Cover Note
                    </Label>

                    <textarea
                      className={field}
                      rows={3}
                      value={f.coverNote}
                      onChange={set(
                        "coverNote"
                      )}
                      placeholder="Why are you a great fit?"
                      data-testid="apply-job-cover"
                    />
                  </div>

                  {/* SUBMIT */}

                  <div className="sm:col-span-2 mt-1">
                    <button
                      type="submit"
                      disabled={loading}
                      data-testid="apply-job-submit"
                      className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 px-6 py-3.5 text-[16px] font-semibold text-white shadow-medium transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-glow disabled:opacity-60"
                    >
                      {loading ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <>
                          Submit Application
                          <Send className="h-4 w-4" />
                        </>
                      )}
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