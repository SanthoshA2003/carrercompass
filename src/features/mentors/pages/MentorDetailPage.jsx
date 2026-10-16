import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Loader2, Star, Briefcase, Languages, BadgeCheck, CalendarDays, Clock, Video, Phone, LinkIcon, FileText, LayoutDashboard, CheckCircle2, Target, TrendingUp, Sparkles, Award } from "lucide-react";
import { api } from "@/services/api";
import { Logo } from "@/features/career/components/landing/primitives";
import { useAuth } from "@/features/auth/components/AuthModal";
import { toast } from "sonner";

const TABS = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "booking", label: "Booking", icon: CalendarDays },
  { key: "report", label: "Report", icon: FileText },
];
const MODES = [
  { key: "Google Meet", icon: Video }, { key: "Zoom", icon: Video }, { key: "Phone", icon: Phone },
];

export default function MentorDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { ready, isAuthed, openAuth } = useAuth();
  const [mentor, setMentor] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [tab, setTab] = useState("dashboard");


useEffect(() => {
  api.mentorGet(id)
    .then((data) => {
      setMentor({
        ...data,
        id: data.id ?? data._id,
        exp: Number(
          data.experience_years ??
          data.experienceYears ??
          data.exp ??
          0
        ),
        price: Number(
          data.price_per_session ?? data.price ?? 0
        ),
        languages: data.languages ?? "",
        availability: [
          data.availability,
          data.start_time && data.end_time
            ? `${String(data.start_time).slice(0, 5)} - ${String(data.end_time).slice(0, 5)}`
            : "",
        ].filter(Boolean).join(", "),
        skills: Array.isArray(data.skills)
          ? data.skills
          : typeof data.skills === "string"
            ? data.skills.split(",").map((s) => s.trim()).filter(Boolean)
            : [],
      });
    })
    .catch((error) => {
      console.error("Failed to load mentor:", error);
      setMentor(false);
    });
}, [id]);


  const loadBookings = () => api.myBookings(id).then(setBookings).catch(() => {});

  useEffect(() => { if (ready && isAuthed) loadBookings(); else if (ready && !isAuthed) openAuth(loadBookings); }, [ready, isAuthed, id]);

  if (mentor === null) return <div className="grid h-screen place-items-center bg-[#F8FAFC]"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>;
  if (mentor === false) return <div className="grid h-screen place-items-center bg-[#F8FAFC] text-slate-500">Mentor not found. <Link to="/mentors" className="ml-2 text-blue-600">Back to mentors</Link></div>;

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="noise-overlay" />
      <header className="sticky top-0 z-40 border-b border-slate-200/60 bg-white/70 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-6xl items-center justify-between px-5 lg:px-8">
          <Logo />
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/mentors")} className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900" data-testid="mentor-back"><ArrowLeft className="h-4 w-4" /> Mentors</button>
            <Link to="/" className="hidden items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900 sm:flex">Home</Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 pb-24 pt-10 lg:px-8">
        {/* Mentor hero */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-100 bg-white p-6 shadow-soft sm:p-8" data-testid="mentor-hero">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
<div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 text-3xl font-bold text-white shadow-soft">
  {(mentor.name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join("")}
</div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-slate-900">{mentor.name}</h1>
                {mentor.verified && <BadgeCheck className="h-5 w-5 text-blue-500" />}
              </div>
              <p className="text-slate-600">{mentor.role} · {mentor.company}</p>
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-[13px] text-slate-500">
                <span className="flex items-center gap-1.5 font-semibold text-amber-500"><Star className="h-4 w-4 fill-current" /> {mentor.rating}</span>
                <span className="flex items-center gap-1.5"><Briefcase className="h-4 w-4" /> {mentor.exp} yrs exp</span>
                <span className="flex items-center gap-1.5"><Languages className="h-4 w-4" /> {mentor.languages}</span>
              </div>
            </div>
            <div className="rounded-2xl bg-slate-50 px-5 py-3 text-center">
              <p className="text-xs text-slate-400">Session</p>
              <p className="text-2xl font-black text-slate-900">₹{mentor.price}</p>
              <p className="text-xs font-medium text-emerald-600">{mentor.availability}</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-6 flex gap-2 border-t border-slate-100 pt-5">
            {TABS.map((t) => (
              <button key={t.key} onClick={() => setTab(t.key)} data-testid={`tab-${t.key}`}
                className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-colors ${tab === t.key ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-soft" : "text-slate-600 hover:bg-slate-100"}`}>
                <t.icon className="h-4 w-4" /> {t.label}
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }} className="mt-6">
            {tab === "dashboard" && <DashboardTab mentor={mentor} bookings={bookings} onBook={() => setTab("booking")} />}
            {tab === "booking" && <BookingTab mentor={mentor} bookings={bookings} isAuthed={isAuthed} openAuth={openAuth} onBooked={loadBookings} />}
            {tab === "report" && <ReportTab bookings={bookings} onChanged={loadBookings} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ---------- Dashboard ---------- */
function DashboardTab({ mentor, bookings, onBook }) {
  const upcoming = bookings.filter((b) => b.status === "upcoming");
  const completed = bookings.filter((b) => b.status === "completed");
  const stats = [
    { icon: CalendarDays, label: "Sessions Booked", value: bookings.length },
    { icon: Clock, label: "Upcoming", value: upcoming.length },
    { icon: CheckCircle2, label: "Completed", value: completed.length },
    { icon: Star, label: "Mentor Rating", value: mentor.rating },
  ];
  return (
    <div className="grid gap-6 lg:grid-cols-3" data-testid="dashboard-tab">
      <div className="lg:col-span-2 space-y-6">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-soft">
              <s.icon className="h-5 w-5 text-blue-600" />
              <p className="mt-3 text-2xl font-black text-slate-900">{s.value}</p>
              <p className="text-xs text-slate-400">{s.label}</p>
            </div>
          ))}
        </div>
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-soft">
          <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900"><Sparkles className="h-5 w-5 text-blue-600" /> About {mentor.name.split(" ")[0]}</h3>
          <p className="mt-2 text-slate-600">{mentor.name} is a {mentor.role} at {mentor.company} with {mentor.exp} years of experience. Book a 1:1 session to get personalised guidance.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {(mentor.skills || []).map((s) => <span key={s} className="rounded-lg bg-blue-50 px-3 py-1.5 text-[13px] font-semibold text-blue-600">{s}</span>)}
          </div>
        </div>
      </div>
      <div className="rounded-3xl border border-slate-100 bg-gradient-to-br from-blue-600 via-cyan-500 to-green-500 p-6 text-white">
        <h3 className="text-lg font-bold">Your Next Session</h3>
        {upcoming[0] ? (
          <div className="mt-3 rounded-2xl bg-white/15 p-4 backdrop-blur">
            <p className="flex items-center gap-2 text-sm"><CalendarDays className="h-4 w-4" /> {upcoming[0].date} at {upcoming[0].time}</p>
            <p className="mt-1 text-sm opacity-90">{upcoming[0].topic || "General mentorship"}</p>
            <a href={upcoming[0].meetingLink?.startsWith("http") ? upcoming[0].meetingLink : undefined} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900">
              <Video className="h-4 w-4" /> Join meeting
            </a>
          </div>
        ) : (
          <>
            <p className="mt-2 text-sm opacity-90">No upcoming sessions yet.</p>
            <button onClick={onBook} data-testid="dashboard-book-cta" className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-slate-900">Book a session</button>
          </>
        )}
      </div>
    </div>
  );
}

/* ---------- Booking ---------- */
const fld = "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-[15px] text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100";
function BookingTab({ mentor, bookings, isAuthed, openAuth, onBooked }) {
 const [f, setF] = useState({
  date: "",
  time: "",
  topic: "",
  mode: "Google Meet",
  meeting_link: "",
});
  const [loading, setLoading] = useState(false);
  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }));
  const today = new Date().toISOString().slice(0, 10);

  const submit = async () => {
   if (!f.date || !f.time) {
  return toast.error("Please pick a date and time");
}

if (
  f.mode !== "Phone" &&
  !/^https?:\/\/\S+$/i.test(f.meeting_link.trim())
) {
  return toast.error("Please enter a valid meeting URL");
}
    const doBook = async () => {
      setLoading(true);
      try {
        const payload = {
  scheduled_at: new Date(
    `${f.date}T${f.time}:00`
  ).toISOString(),
  topic: f.topic,
  mode: f.mode,
  meeting_link:
    f.mode === "Phone" ? null : f.meeting_link.trim(),
};

const r = await api.mentorBook(mentor.id, payload);

          toast.success("Booking successful!", {
  description: "Your mentor session has been booked successfully.",
  duration: 4000,
}); setF({ date: "", time: "", topic: "", mode: "Google Meet" }); onBooked(); }
      catch (e) { toast.error(e.response?.data?.detail || "Booking failed"); }
      finally { setLoading(false); }
    };
    if (isAuthed) doBook(); else openAuth(doBook);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2" data-testid="booking-tab">
      {/* form */}
      <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-soft sm:p-8">
        <h3 className="text-lg font-bold text-slate-900">Book a Session</h3>
        <p className="text-sm text-slate-500">Choose a slot and how you'd like to connect.</p>
        <div className="mt-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="mb-1 block text-xs font-semibold uppercase text-slate-400">Date</label><input type="date" min={today} className={fld} value={f.date} onChange={set("date")} data-testid="booking-date" /></div>
            <div><label className="mb-1 block text-xs font-semibold uppercase text-slate-400">Time</label><input type="time" className={fld} value={f.time} onChange={set("time")} data-testid="booking-time" /></div>
          </div>
          <div><label className="mb-1 block text-xs font-semibold uppercase text-slate-400">Topic</label><input className={fld} placeholder="e.g. NEET strategy, resume review" value={f.topic} onChange={set("topic")} data-testid="booking-topic" /></div>
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase text-slate-400">Meeting Connection</label>
            <div className="flex gap-2">
              {MODES.map((m) => (
                <button key={m.key} onClick={() => setF((s) => ({ ...s, mode: m.key }))} data-testid={`booking-mode-${m.key.replace(/\s+/g, "-")}`}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-semibold transition-colors ${f.mode === m.key ? "border-blue-500 bg-blue-50 text-blue-600" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
                  <m.icon className="h-4 w-4" /> {m.key}
                </button>
              ))}
            </div>
          </div>

              {f.mode !== "Phone" && (
  <div>
    <label className="mb-1 block text-xs font-semibold uppercase text-slate-400">
      {f.mode} Meeting Link
    </label>

    <input
      type="url"
      className={fld}
      placeholder={
        f.mode === "Zoom"
          ? "https://zoom.us/j/..."
          : "https://meet.google.com/..."
      }
      value={f.meeting_link}
      onChange={set("meeting_link")}
      required
    />

    <p className="mt-1 text-xs text-slate-400">
      Enter the meeting link participants will use to join.
    </p>
  </div>
)}

          <button onClick={submit} disabled={loading} data-testid="booking-submit"
            className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 px-6 py-3.5 text-[16px] font-semibold text-white shadow-medium transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-glow disabled:opacity-60">
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Confirm Booking · ₹{mentor.price}</>}
          </button>
        </div>
      </div>
      {/* your sessions */}
      <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-soft sm:p-8">
        <h3 className="text-lg font-bold text-slate-900">Your Sessions</h3>
        {bookings.length === 0 ? (
          <p className="mt-6 text-sm text-slate-400">No sessions booked yet. Your booked sessions and meeting links will appear here.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {bookings.map((b) => (
              <div key={b.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-4" data-testid={`session-${b.id}`}>
                <div className="flex items-center justify-between">
                  <p className="flex items-center gap-1.5 text-sm font-bold text-slate-900"><CalendarDays className="h-4 w-4 text-blue-600" /> {b.date} · {b.time}</p>
                  <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase ${b.status === "completed" ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700"}`}>{b.status}</span>
                </div>
                {b.topic && <p className="mt-1 text-sm text-slate-500">{b.topic}</p>}
                <div className="mt-2 flex items-center gap-2 text-sm">
                  <span className="flex items-center gap-1 text-slate-500"><Video className="h-3.5 w-3.5" /> {b.mode}</span>
               {b.meetingLink?.startsWith("http") ? (
  <a
    href={b.meetingLink}
    target="_blank"
    rel="noopener noreferrer"
    className="inline-flex items-center gap-1 font-semibold text-blue-600 hover:underline"
  >
    <Video className="h-3.5 w-3.5" />
    Join Meeting
  </a>
) : (
  <span className="text-slate-500">
    {b.mode === "Phone"
      ? "Phone call"
      : "Meeting link not available"}
  </span>
)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- Report ---------- */
function ReportTab({ bookings, onChanged }) {
  const [busy, setBusy] = useState(null);
  const completed = bookings.filter((b) => b.status === "completed" && b.report);
  const upcoming = bookings.filter((b) => b.status === "upcoming");

  const genReport = async (id) => {
    setBusy(id);
    try { await api.generateReport(id); toast.success("Session report generated"); onChanged(); }
    catch (e) { toast.error("Could not generate report"); }
    finally { setBusy(null); }
  };

  if (bookings.length === 0) return <div className="rounded-3xl border border-dashed border-slate-200 bg-white py-20 text-center text-slate-500" data-testid="report-tab">No sessions yet. Book a session to receive a report afterwards.</div>;

  return (
    <div className="space-y-6" data-testid="report-tab">
      {upcoming.length > 0 && (
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-soft">
          <h3 className="text-lg font-bold text-slate-900">Awaiting Reports</h3>
          <p className="text-sm text-slate-500">Reports are shared after a session completes.</p>
          <div className="mt-4 space-y-3">
            {upcoming.map((b) => (
              <div key={b.id} className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <span className="text-sm font-medium text-slate-700">{b.date} · {b.time} — {b.topic || "Session"}</span>
                <button onClick={() => genReport(b.id)} disabled={busy === b.id} data-testid={`gen-report-${b.id}`}
                  className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-60">
                  {busy === b.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Generate report (demo)"}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {completed.map((b) => (
        <div key={b.id} className="rounded-3xl border border-slate-100 bg-white p-6 shadow-soft sm:p-8" data-testid={`report-card-${b.id}`}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Session Report</h3>
              <p className="text-sm text-slate-500">{b.mentorName} · {b.date} at {b.time}</p>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1.5 text-sm font-bold text-amber-600"><Star className="h-4 w-4 fill-current" /> {b.report.rating}/5</span>
          </div>
          <p className="mt-4 rounded-2xl bg-slate-50 p-4 text-[15px] leading-relaxed text-slate-700">{b.report.summary}</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <ReportList icon={Award} color="emerald" title="Strengths" items={b.report.strengths} />
            <ReportList icon={TrendingUp} color="blue" title="Improve" items={b.report.improvements} />
            <ReportList icon={Target} color="violet" title="Action Items" items={b.report.actionItems} />
          </div>
        </div>
      ))}
    </div>
  );
}

const REPORT_COLORS = { emerald: "text-emerald-600", blue: "text-blue-600", violet: "text-violet-600" };
const ReportList = ({ icon: Icon, color, title, items }) => (
  <div>
    <p className={`flex items-center gap-1.5 text-sm font-bold ${REPORT_COLORS[color]}`}><Icon className="h-4 w-4" /> {title}</p>
    <ul className="mt-2 space-y-1.5">
      {items.map((it, i) => <li key={i} className="flex items-start gap-2 text-[13px] text-slate-600"><CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-300" /> {it}</li>)}
    </ul>
  </div>
);
