import { useEffect, useState } from "react";
import { Plus, Loader2, Upload, Film, Layers, Flag, CheckCircle2, GraduationCap, Check } from "lucide-react";
import Shell from "@/features/skillhub/components/Shell";
import { api } from "@/services/api";
import { toast } from "sonner";

const Input = (p) => <input {...p} className={`w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-400 ${p.className || ""}`} />;
const Area = (p) => <textarea {...p} className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-400" />;
const Label = ({ children }) => <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-400">{children}</label>;
const Section = ({ title, icon: Icon, children }) => (
  <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-6">
    <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-white"><Icon className="h-5 w-5 text-cyan-400" /> {title}</h3>
    {children}
  </div>
);


export default function AdminBuilder() {
  const [courses, setCourses] = useState([]);
  const [courseId, setCourseId] = useState("");
  const [levels, setLevels] = useState([]);
  const [levelId, setLevelId] = useState("");
  const [thumbnailUploading, setThumbnailUploading] = useState(false);
  const [showThumbnailUrl, setShowThumbnailUrl] = useState(false);

const [course, setCourse] = useState({
  title: "",
  description: "",
  category: "Programming",
  language: "Python",
  difficulty: "Beginner",
  duration: "",
  thumbnail: "",
  status: "published",
  certificate_template: "",
});

const [level, setLevel] = useState({
  stage: "Beginner",
  levelNumber: 1,
  title: "",
  description: "",
  xp: 100,
  video: { url: "" },

  theory: {
    learningObjectives: "",
    bestPractices: "",
    commonMistakes: "",
  },
});

const [cp, setCp] = useState({ order: 1, atSeconds: 5, title: "", scenario: "", problemStatement: "", difficulty: "Easy", xp: 25, starter: "# write your code\n", vin: "", vout: "", hin: "", hout: "" });
  const [uploading, setUploading] = useState(false);
  const [busy, setBusy] = useState(false);

  // College Package
  const [packageName, setPackageName] = useState("");
  const [collegeName, setCollegeName] = useState("");
  const [packageDescription, setPackageDescription] = useState("");
  const [selectedPackageCourses, setSelectedPackageCourses] = useState([]);
  const [creatingPackage, setCreatingPackage] = useState(false);


  const loadCourses = () => api.courses().then((c) => { setCourses(c); if (!courseId && c[0]) setCourseId(c[0].id); });
  useEffect(() => { loadCourses(); /* eslint-disable-next-line */ }, []);
useEffect(() => {
  if (!courseId) return;

    const fetchLevels = async () => {
      try {
        const levelsData = await api.courseLevelsDropdown(courseId);

        console.log("Dropdown Levels:", levelsData);

        setLevels(levelsData);

        if (levelsData.length > 0) {
          setLevelId(levelsData[0].id);
        } else {
          setLevelId("");
        }
      } catch (error) {
        console.error(
          "Failed to fetch levels:",
          error.response?.data || error
        );

        setLevels([]);
        setLevelId("");
      }
    };

    fetchLevels();
  }, [courseId]);


  const uploadThumbnail = async (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setThumbnailUploading(true);

    try {
      const response = await api.upload(file);

      console.log("Thumbnail upload response:", response);

      setCourse((prev) => ({
        ...prev,
        thumbnail: response.file_url,
      }));

      toast.success("Thumbnail uploaded successfully");
    } catch (error) {
      console.error(
        "Thumbnail upload error:",
        error.response?.data || error
      );

      toast.error(
        error.response?.data?.message || "Thumbnail upload failed"
      );
    } finally {
      setThumbnailUploading(false);
    }
  };
  const createCourse = async () => {
    if (!course.title) return toast.error("Course title required");
    setBusy(true);
    try { const c = await api.createCourse(course); toast.success("Course created"); setCourse({ ...course, title: "", description: "" }); await loadCourses(); setCourseId(c.id); }
    catch { toast.error("Failed"); } finally { setBusy(false); }
  };

  const createLevel = async () => {
  if (!courseId) {
    return toast.error("Select a course");
  }

  if (!level.title.trim()) {
    return toast.error("Level title required");
  }

  setBusy(true);

  try {
    const l = await api.createLevel({
      course_id: courseId,
      stage: level.stage,
      stage_order: 1,
      level_number: Number(level.levelNumber),
      global_order: Number(level.levelNumber),
      title: level.title,
      description: level.description || "",
      objectives: [],
      xp: Number(level.xp),
      pass_percentage: 100,
      duration: "30 minutes",

     video: level.video.url
  ? {
      url: level.video.url,
    }
  : {},

theory: {
  learningObjectives: level.theory.learningObjectives
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean),

  bestPractices: level.theory.bestPractices
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean),

  commonMistakes: level.theory.commonMistakes
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean),
},
    });

    toast.success("Level created");

    // Fetch updated levels immediately
    const updatedLevels = await api.courseLevelsDropdown(courseId);

    setLevels(updatedLevels);

    // Select the newly created level
    setLevelId(l.id);

    // Reset level form
   setLevel({
  stage: "Beginner",
  levelNumber: Number(level.levelNumber) + 1,
  title: "",
  description: "",
  xp: 100,

  video: {
    url: "",
  },

  theory: {
    learningObjectives: "",
    bestPractices: "",
    commonMistakes: "",
  },
});

  } catch (error) {
    console.error(
      "Create level error:",
      error.response?.data || error
    );

    toast.error(
      error.response?.data?.message ||
      "Failed to create level"
    );
  } finally {
    setBusy(false);
  }
};

  const uploadVideo = async (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setUploading(true);

    try {
      const response = await api.upload(file);

      console.log("Upload response:", response);

      setLevel((prev) => ({
        ...prev,
        video: {
          url: response.file_url,
        },
      }));

      toast.success("Video uploaded successfully");

    } catch (error) {
      console.error(
        "Video upload error:",
        error.response?.data || error
      );

      toast.error(
        error.response?.data?.message || "Video upload failed"
      );

    } finally {
      setUploading(false);
    }
  };

  const addCheckpoint = async () => {
    if (!levelId) {
      return toast.error("Select a level");
    }

    if (!cp.title.trim()) {
      return toast.error("Challenge title required");
    }

    if (!cp.problemStatement.trim()) {
      return toast.error("Problem statement required");
    }

    setBusy(true);

    try {
      const newCheckpoint = await api.addCheckpoint({
        level_id: levelId,

        checkpoint_order: Number(cp.order),

        at_seconds: Number(cp.atSeconds),

        title: cp.title,

        scenario: cp.scenario || "",

        problem_statement: cp.problemStatement,

        objective: "",

        difficulty: cp.difficulty,

        marks: 25,

        xp: Number(cp.xp),

        retry_limit: 5,

        language: "python",

        starter_code: {
          code: cp.starter,
        },

        constraints: "",

        hints: [],

        solution: "",

        explanation: "",

        visible_test_cases:
          cp.vin || cp.vout
            ? [
              {
                input: cp.vin,
                expected_output: cp.vout,
              },
            ]
            : [],

        hidden_test_cases:
          cp.hin || cp.hout
            ? [
              {
                input: cp.hin,
                expected_output: cp.hout,
              },
            ]
            : [],
      });

  toast.success("Checkpoint added");

      // ADD THIS HERE
      const checkpointData = {
        id: newCheckpoint?.id || Date.now(),
        order: Number(cp.order),
        atSeconds: Number(cp.atSeconds),
        title: cp.title,
      };

      setLevels((prevLevels) =>
        prevLevels.map((level) =>
          level.id === levelId
            ? {
              ...level,
              checkpoints: [
                ...(level.checkpoints || []),
                checkpointData,
              ],
              checkpoint_count:
                (level.checkpoint_count || 0) + 1,
            }
            : level
        )
      );

      // Reset checkpoint form
      setCp((prev) => ({
        ...prev,
        order: Number(prev.order) + 1,
        atSeconds: Number(prev.atSeconds) + 5,
        title: "",
        scenario: "",
        problemStatement: "",
        starter: "# write your code\n",
        vin: "",
        vout: "",
        hin: "",
        hout: "",
      }));

    } catch (error) {
      console.error(
        "Checkpoint error:",
        error.response?.data || error
      );

      toast.error(
        error.response?.data?.message ||
        "Failed to add checkpoint"
      );
    } finally {
      setBusy(false);
    }
  };

  // College Package helpers
  const togglePackageCourse = (id) => {
    setSelectedPackageCourses((prev) =>
      prev.includes(id)
        ? prev.filter((courseId) => courseId !== id)
        : [...prev, id]
    );
  };

  const selectedPackageCourseList = courses.filter((c) =>
    selectedPackageCourses.includes(c.id)
  );

  const totalPackageLevels = selectedPackageCourseList.reduce(
    (total, c) => total + Number(c.level_count || 0),
    0
  );

  const createCollegePackage = async () => {
    if (!packageName.trim()) {
      return toast.error("Package name required");
    }

    if (!collegeName.trim()) {
      return toast.error("College name required");
    }

    if (selectedPackageCourses.length === 0) {
      return toast.error("Select at least one course");
    }

    const packageData = {
      package_name: packageName.trim(),
      college_name: collegeName.trim(),
      description: packageDescription.trim(),
      course_ids: selectedPackageCourses,
    };

    // The current api service does not expose a package endpoint yet.
    // Keep the payload ready for the backend integration.
    console.log("College Package:", packageData);

    if (typeof api.createCollegePackage !== "function") {
      toast.info("College Package UI is ready. Add the package API endpoint to save it.");
      return;
    }

    try {
      setCreatingPackage(true);
      await api.createCollegePackage(packageData);
      toast.success("College package created");
      setPackageName("");
      setCollegeName("");
      setPackageDescription("");
      setSelectedPackageCourses([]);
    } catch (error) {
      console.error(
        "Create college package error:",
        error.response?.data || error
      );
      toast.error(
        error.response?.data?.message ||
          "Failed to create college package"
      );
    } finally {
      setCreatingPackage(false);
    }
  };

  const selectedLevel = levels.find((l) => l.id === levelId);

const levelCheckpoints = selectedLevel?.checkpoints || [];

  return (
    <Shell>
      <div className="mx-auto max-w-5xl space-y-6">
        <h1 className="text-3xl font-black tracking-tight text-white">Course Builder</h1>

        {/* Create course */}
        <Section title="Create Course" icon={Plus}>
          <div className="grid gap-3 sm:grid-cols-2">

            {/* Course Name */}
            <div>
              <Label>Course Name</Label>

              <Input
                value={course.title}
                onChange={(e) =>
                  setCourse({
                    ...course,
                    title: e.target.value,
                  })
                }
                placeholder="Java Programming"
                data-testid="course-title"
              />
            </div>

            {/* Programming Language */}
            <div>
              <Label>Programming Language</Label>

              <Input
                value={course.language}
                onChange={(e) =>
                  setCourse({
                    ...course,
                    language: e.target.value,
                  })
                }
              />
            </div>

            {/* Description */}
            <div className="sm:col-span-2">
              <Label>Description</Label>

              <Area
                rows={2}
                value={course.description}
                onChange={(e) =>
                  setCourse({
                    ...course,
                    description: e.target.value,
                  })
                }
              />
            </div>

           {/* Difficulty */}
<div>
  <Label>Difficulty</Label>

  <Input
    value={course.difficulty}
    onChange={(e) =>
      setCourse({
        ...course,
        difficulty: e.target.value,
      })
    }
  />
</div>

{/* Category */}
<div>
  <Label>Category</Label>

  <select
    value={course.category}
    onChange={(e) =>
      setCourse({
        ...course,
        category: e.target.value,
      })
    }
    className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-400"
  >
    <option value="Programming">Programming</option>
    <option value="Artificial Intelligence">
      Artificial Intelligence
    </option>
    <option value="Communication">Communication</option>
    <option value="Leadership">Leadership</option>
    <option value="Interview Preparation">
      Interview Preparation
    </option>
    <option value="Cloud">Cloud</option>
    <option value="Cyber Security">Cyber Security</option>
    <option value="Data Science">Data Science</option>
  </select>
</div>

{/* Thumbnail Upload */}
<div>
  <Label>Thumbnail</Label>

  <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-white/15 px-3 py-2.5 text-sm text-slate-300 hover:bg-white/5">
    {thumbnailUploading ? (
      <Loader2 className="h-4 w-4 animate-spin" />
    ) : (
      <Upload className="h-4 w-4" />
    )}

    {thumbnailUploading
      ? "Uploading..."
      : course.thumbnail
      ? "Thumbnail Uploaded ✓"
      : "Upload Image"}

    <input
      type="file"
      accept="image/*"
      className="hidden"
      onChange={uploadThumbnail}
      disabled={thumbnailUploading}
    />
  </label>
</div>

{/* Thumbnail URL */}
<div>
  <Label>Thumbnail URL</Label>

  <Input
    value={course.thumbnail}
    readOnly
    placeholder=""
  />
</div>          
</div>

          {/* Create Course Button */}
          <button
            onClick={createCourse}
            disabled={busy || thumbnailUploading}
            data-testid="create-course-btn"
            className="mt-4 flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-500 px-5 py-2.5 text-sm font-bold text-white transition-transform hover:scale-105 disabled:opacity-60"
          >
            <Plus className="h-4 w-4" />
            Create Course
          </button>
        </Section>

        {/* Select course + add level */}
        <Section title="Add Stage & Level" icon={Layers}>
          <div className="mb-4"><Label>Course</Label>
            <select value={courseId} onChange={(e) => setCourseId(e.target.value)} className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2.5 text-sm text-white">
              {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div><Label>Stage</Label>
              <select value={level.stage} onChange={(e) => setLevel({ ...level, stage: e.target.value })} className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2.5 text-sm text-white">
                <option>Beginner</option><option>Intermediate</option><option>Expert</option>
              </select>
            </div>
            <div><Label>Level Number</Label><Input type="number" value={level.levelNumber} onChange={(e) => setLevel({ ...level, levelNumber: Number(e.target.value) })} /></div>
            <div><Label>XP Reward</Label><Input type="number" value={level.xp} onChange={(e) => setLevel({ ...level, xp: Number(e.target.value) })} /></div>
            <div className="sm:col-span-2"><Label>Level Title</Label><Input value={level.title} onChange={(e) => setLevel({ ...level, title: e.target.value })} data-testid="level-title" /></div>
            <div>
              <Label>Video</Label>
              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-white/15 px-3 py-2.5 text-sm text-slate-300 hover:bg-white/5">
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />} {level.video.url ? "Video set ✓" : "Upload"}
                <input type="file" accept="video/*" className="hidden" onChange={uploadVideo} data-testid="video-upload" />
              </label>
            </div>
            <div className="sm:col-span-3"><Label>Or Video URL</Label><Input value={level.video.url} onChange={(e) => setLevel({ ...level, video: { url: e.target.value } })} placeholder="https://..." /></div>

                    {/* Theory & Concepts */}
<div className="sm:col-span-3 mt-2">
  <Label>Learning Objectives</Label>

  <Area
    rows={3}
    value={level.theory.learningObjectives}
    onChange={(e) =>
      setLevel({
        ...level,
        theory: {
          ...level.theory,
          learningObjectives: e.target.value,
        },
      })
    }
    placeholder="What will the student learn in this level?"
  />
</div>

<div className="sm:col-span-3">
  <Label>Best Practices</Label>

  <Area
    rows={3}
    value={level.theory.bestPractices}
    onChange={(e) =>
      setLevel({
        ...level,
        theory: {
          ...level.theory,
          bestPractices: e.target.value,
        },
      })
    }
    placeholder="Enter best practices..."
  />
</div>

<div className="sm:col-span-3">
  <Label>Common Mistakes</Label>

  <Area
    rows={3}
    value={level.theory.commonMistakes}
    onChange={(e) =>
      setLevel({
        ...level,
        theory: {
          ...level.theory,
          commonMistakes: e.target.value,
        },
      })
    }
    placeholder="Enter common mistakes students should avoid..."
  />
</div>

          </div>
          <button onClick={createLevel} disabled={busy} data-testid="create-level-btn" className="mt-4 flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-500 px-5 py-2.5 text-sm font-bold text-white hover:scale-105 transition-transform disabled:opacity-60"><Plus className="h-4 w-4" /> Add Level</button>
        </Section>

        {/* Interactive timeline + challenge builder */}
        <Section title="Interactive Timeline & Challenge Builder" icon={Flag}>
          <div className="mb-4"><Label>Level</Label>
            <select
              value={levelId}
              onChange={(e) => setLevelId(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2.5 text-sm text-white"
            >
              <option value="">Select Level</option>

              {levels.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.stage} · Level {l.level_number} ({l.checkpoint_count} checkpoints)
                </option>
              ))}
            </select>
          </div>
          {/* timeline visual */}
          <div className="mb-5 rounded-xl border border-white/5 bg-slate-950 p-4">
            <div className="mb-2 flex items-center gap-2 text-xs text-slate-400"><Film className="h-4 w-4" /> Click positions represent checkpoints on the video</div>
            <div className="relative h-2 w-full rounded-full bg-white/10">
              {levelCheckpoints.map((c) => (
                <span key={c.id} title={`${c.atSeconds}s · ${c.title}`} className="absolute -top-1 grid h-4 w-4 -translate-x-1/2 place-items-center rounded-full bg-amber-400" style={{ left: `${Math.min(c.atSeconds / 20 * 100, 100)}%` }} />
              ))}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {levelCheckpoints.map((c) => (
                <span key={c.id} className="rounded-lg bg-white/5 px-2.5 py-1 text-xs text-slate-300"><CheckCircle2 className="mr-1 inline h-3 w-3 text-emerald-400" />{c.order}. {c.title} @ {c.atSeconds}s</span>
              ))}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-4">
            <div><Label>Order</Label><Input type="number" value={cp.order} onChange={(e) => setCp({ ...cp, order: e.target.value })} /></div>
            <div><Label>At Seconds</Label><Input type="number" value={cp.atSeconds} onChange={(e) => setCp({ ...cp, atSeconds: e.target.value })} /></div>
            <div><Label>Difficulty</Label>
              <select value={cp.difficulty} onChange={(e) => setCp({ ...cp, difficulty: e.target.value })} className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2.5 text-sm text-white"><option>Easy</option><option>Medium</option><option>Hard</option></select>
            </div>
            <div><Label>XP</Label><Input type="number" value={cp.xp} onChange={(e) => setCp({ ...cp, xp: e.target.value })} /></div>
            <div className="sm:col-span-4"><Label>Challenge Title</Label><Input value={cp.title} onChange={(e) => setCp({ ...cp, title: e.target.value })} data-testid="cp-title" /></div>
            <div className="sm:col-span-4"><Label>Business Scenario</Label><Input value={cp.scenario} onChange={(e) => setCp({ ...cp, scenario: e.target.value })} placeholder="You are building a billing system..." /></div>
            <div className="sm:col-span-4"><Label>Problem Statement</Label><Area rows={2} value={cp.problemStatement} onChange={(e) => setCp({ ...cp, problemStatement: e.target.value })} /></div>
            <div className="sm:col-span-4"><Label>Starter Code (Python)</Label><Area rows={2} value={cp.starter} onChange={(e) => setCp({ ...cp, starter: e.target.value })} className="font-mono" /></div>
            <div className="sm:col-span-2"><Label>Visible Test — Input</Label><Input value={cp.vin} onChange={(e) => setCp({ ...cp, vin: e.target.value })} placeholder="3 5" /></div>
            <div className="sm:col-span-2"><Label>Visible Test — Expected</Label><Input value={cp.vout} onChange={(e) => setCp({ ...cp, vout: e.target.value })} placeholder="8" /></div>
            <div className="sm:col-span-2"><Label>Hidden Test — Input</Label><Input value={cp.hin} onChange={(e) => setCp({ ...cp, hin: e.target.value })} /></div>
            <div className="sm:col-span-2"><Label>Hidden Test — Expected</Label><Input value={cp.hout} onChange={(e) => setCp({ ...cp, hout: e.target.value })} /></div>
          </div>
          <button onClick={addCheckpoint} disabled={busy} data-testid="add-checkpoint-btn" className="mt-4 flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-500 px-5 py-2.5 text-sm font-bold text-white hover:scale-105 transition-transform disabled:opacity-60"><Plus className="h-4 w-4" /> Add Checkpoint</button>
        </Section>

        {/* College Package */}
        <Section title="College Package" icon={GraduationCap}>
          <div className="mb-6 rounded-xl border border-violet-400/10 bg-violet-500/[0.03] p-4">
            <p className="text-sm text-slate-400">
              Create a package by combining existing courses. The selected courses keep their existing levels.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label>Package Name</Label>
              <Input
                value={packageName}
                onChange={(e) => setPackageName(e.target.value)}
                placeholder="e.g. AI & Data Science Package"
              />
            </div>

            <div>
              <Label>College Name</Label>
              <Input
                value={collegeName}
                onChange={(e) => setCollegeName(e.target.value)}
                placeholder="e.g. ABC Engineering College"
              />
            </div>

            <div className="sm:col-span-2">
              <Label>Description</Label>
              <Area
                rows={3}
                value={packageDescription}
                onChange={(e) => setPackageDescription(e.target.value)}
                placeholder="Enter package description..."
              />
            </div>
          </div>

          <div className="mt-6">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <div>
                <Label>Select Courses</Label>
                <p className="text-xs text-slate-500">
                  Select existing courses to include in this package.
                </p>
              </div>

              <div className="flex gap-2">
                <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1.5 text-xs font-semibold text-cyan-400">
                  Courses: {selectedPackageCourses.length}
                </span>
                <span className="rounded-full border border-violet-400/20 bg-violet-400/10 px-3 py-1.5 text-xs font-semibold text-violet-400">
                  Levels: {totalPackageLevels}
                </span>
              </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-white/10">
              {courses.length === 0 ? (
                <div className="p-6 text-center text-sm text-slate-500">
                  No courses available. Create a course first.
                </div>
              ) : (
                courses.map((c) => {
                  const selected = selectedPackageCourses.includes(c.id);

                  return (
                    <button
                      type="button"
                      key={c.id}
                      onClick={() => togglePackageCourse(c.id)}
                      className={`flex w-full items-center justify-between gap-4 border-b border-white/5 px-4 py-4 text-left transition last:border-b-0 ${
                        selected
                          ? "bg-cyan-400/[0.06]"
                          : "hover:bg-white/[0.03]"
                      }`}
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <span
                          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
                            selected
                              ? "border-cyan-400 bg-cyan-400"
                              : "border-white/20 bg-white/[0.03]"
                          }`}
                        >
                          {selected && (
                            <Check className="h-3.5 w-3.5 text-slate-950" />
                          )}
                        </span>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-white">
                            {c.title}
                          </p>
                          <p className="mt-0.5 truncate text-xs text-slate-500">
                            {c.category || "Course"}
                          </p>
                        </div>
                      </div>

                      <span className="shrink-0 rounded-full bg-violet-500/10 px-3 py-1.5 text-xs font-semibold text-violet-400">
                        {c.level_count ?? 0} {
                          Number(c.level_count) === 1 ? "Level" : "Levels"
                        }
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {selectedPackageCourseList.length > 0 && (
            <div className="mt-5 rounded-xl border border-white/10 bg-slate-950/40 p-4">
              <div className="mb-3 flex items-center gap-2">
                <Layers className="h-4 w-4 text-cyan-400" />
                <p className="text-sm font-semibold text-white">
                  Package Structure
                </p>
              </div>

              <div className="space-y-2">
                {selectedPackageCourseList.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between rounded-lg bg-white/[0.03] px-3 py-2.5"
                  >
                    <div className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                      <span className="text-sm text-slate-300">
                        {c.title}
                      </span>
                    </div>

                    <span className="text-xs text-slate-500">
                      {c.level_count ?? 0} Levels
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={createCollegePackage}
            disabled={creatingPackage}
            data-testid="create-college-package-btn"
            className="mt-6 flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-500 px-5 py-2.5 text-sm font-bold text-white transition-transform hover:scale-105 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {creatingPackage ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <GraduationCap className="h-4 w-4" />
            )}
            {creatingPackage ? "Creating..." : "Create College Package"}
          </button>
        </Section>
      </div>
    </Shell>
  );
}