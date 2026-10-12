import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, Star, BadgeCheck, Briefcase, ArrowLeft, Sparkles, Loader2, UserPlus } from "lucide-react";
import { api } from "@/services/api";
import { Logo } from "@/features/career/components/landing/primitives";
import MentorApplyModal from "@/features/mentors/components/MentorApplyModal";



const normalizeMentor = (m) => ({
  ...m,
  id: m.id ?? m._id,
  name: m.name ?? "",
  role: m.role ?? "",
  company: m.company ?? "",
  industry: m.industry ?? "",
  img: m.image_url ?? m.img ?? "",
  exp: Number(m.experience_years ?? m.experienceYears ?? m.exp ?? 0),
  skills: Array.isArray(m.skills)
    ? m.skills
    : typeof m.skills === "string"
      ? m.skills.split(",").map((s) => s.trim()).filter(Boolean)
      : [],
  rating: Number(m.rating ?? 0),
  price: Number(m.price ?? 0),
  availability: m.availability ?? "Not specified",
  verified: Boolean(m.verified),
});


export default function MentorsPage() {
  const navigate = useNavigate();
  const [mentors, setMentors] = useState(null);
  const [industries, setIndustries] = useState(["All"]);
  const [industry, setIndustry] = useState("All");
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("rating");
  const [applyOpen, setApplyOpen] = useState(false);

  const refreshMentors = async () => {
  try {
    const data = await api.mentorsList(industry);

    const list = Array.isArray(data)
      ? data
      : data?.mentors ?? data?.items ?? [];

    setMentors(list.map(normalizeMentor));
  } catch (error) {
    console.error("Failed to refresh mentors:", error);
  }
};

  useEffect(() => { api.mentorIndustries().then(setIndustries).catch(() => {}); }, []);

useEffect(() => {
  let active = true;

  setMentors(null);

  api.mentorsList(industry)
    .then((data) => {
      if (!active) return;

      const list = Array.isArray(data)
        ? data
        : data?.mentors ?? data?.items ?? [];

      setMentors(list.map(normalizeMentor));
    })
    .catch((error) => {
      console.error("Failed to load mentors:", error);
      if (active) setMentors([]);
    });

  return () => {
    active = false;
  };
}, [industry]);



const filtered = useMemo(() => {
  const query = q.toLowerCase();

  let list = (mentors || []).filter((m) => {
    const searchable = [
      m.name,
      m.role,
      m.company,
      ...(m.skills || []),
    ];

    return !query || searchable.some((value) =>
      String(value ?? "").toLowerCase().includes(query)
    );
  });

  list = [...list].sort((a, b) => {
    if (sort === "rating") return b.rating - a.rating;
    if (sort === "priceLow") return a.price - b.price;
    if (sort === "priceHigh") return b.price - a.price;
    return b.exp - a.exp;
  });

  return list;
}, [mentors, q, sort]);


  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="noise-overlay" />
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-slate-200/60 bg-white/70 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 lg:px-8">
          <Logo />
          <div className="flex items-center gap-3">
            <Link to="/" className="hidden items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900 sm:flex"><ArrowLeft className="h-4 w-4" /> Home</Link>
            <button onClick={() => setApplyOpen(true)} data-testid="join-as-mentor-header"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-2.5 text-sm font-semibold text-white shadow-soft transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-glow">
              <UserPlus className="h-4 w-4" /> Join as Mentor
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden py-16 lg:py-20">
        <div className="aurora-blob left-[5%] top-[0%] h-72 w-72 bg-blue-300/30" />
        <div className="aurora-blob right-[8%] top-[10%] h-72 w-72 bg-cyan-300/25" />
        <div className="relative mx-auto max-w-4xl px-5 text-center lg:px-8">
          <span className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-blue-600"><Sparkles className="h-3.5 w-3.5" /> Become a Mentor</span>
          <h1 className="mt-6 text-4xl font-black leading-tight tracking-tight text-slate-900 sm:text-5xl">
            Learn from experts. <span className="gradient-text">Or become one.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-[18px] text-slate-600">
            Connect with verified industry mentors, or share your own experience by joining our mentor community. Minimum 5 years of industry experience required.
          </p>
        </div>
      </section>

      {/* Filters */}
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="rounded-3xl border border-slate-100 bg-white p-4 shadow-soft">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative flex-1 lg:max-w-sm">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search mentors, skills, companies..." data-testid="mentor-search"
                className="w-full rounded-full border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-900 outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100" />
            </div>
            <select value={sort} onChange={(e) => setSort(e.target.value)} data-testid="mentor-sort"
              className="rounded-full border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none">
              <option value="rating">Top Rated</option>
              <option value="expHigh">Most Experienced</option>
              <option value="priceLow">Price: Low to High</option>
              <option value="priceHigh">Price: High to Low</option>
            </select>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {industries.map((ind) => (
              <button key={ind} onClick={() => setIndustry(ind)} data-testid={`filter-${ind.replace(/\s+/g, "-")}`}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${industry === ind ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-soft" : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"}`}>{ind}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="mx-auto max-w-7xl px-5 pb-24 pt-8 lg:px-8">
        {mentors === null ? (
          <div className="grid h-64 place-items-center"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>
        ) : filtered.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-200 py-20 text-center text-slate-500">No mentors match your filters.</div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((m, i) => (
              <motion.div key={m.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: (i % 6) * 0.05 }}
                whileHover={{ y: -6 }} className="group relative overflow-hidden rounded-3xl border border-slate-100 bg-white p-6 shadow-soft transition-shadow hover:shadow-large" data-testid={`mentor-card-${i}`}>
                <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-gradient-to-br from-blue-500/15 to-cyan-400/10 blur-2xl opacity-0 transition-opacity group-hover:opacity-100" />
                <div className="relative flex items-center gap-4">
                  
<div className="relative shrink-0">
  <div
    className="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 text-xl font-bold text-white shadow-sm"
    aria-label={`${m.name} initials`}
  >
    {m.name
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((part) => part[0].toUpperCase())
      .slice(0, 2)
      .join("")}
  </div>

  <span className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white bg-emerald-500" />
</div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5"><h3 className="truncate text-lg font-bold text-slate-900">{m.name}</h3>{m.verified && <BadgeCheck className="h-4 w-4 shrink-0 text-blue-500" />}</div>
                    <p className="text-[13px] text-slate-500">{m.role} · {m.company}</p>
                    <div className="mt-1 flex items-center gap-1 text-[12px] font-bold text-amber-500"><Star className="h-3.5 w-3.5 fill-current" /> {m.rating}</div>
                  </div>
                </div>
                <span className="mt-4 inline-block rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">{m.industry}</span>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {(m.skills || []).map((s) => <span key={s} className="rounded-lg bg-slate-50 px-2.5 py-1 text-[12px] font-medium text-slate-600">{s}</span>)}
                </div>
                <div className="mt-4 flex items-center gap-4 text-[13px] text-slate-500">
                  <span className="flex items-center gap-1.5"><Briefcase className="h-3.5 w-3.5" /> {m.exp} yrs</span>
                  <span className="text-emerald-600">● {m.availability}</span>
                </div>
                <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                  <div><span className="text-2xl font-black text-slate-900">₹{m.price}</span><span className="text-[13px] text-slate-400"> / session</span></div>
                  <button onClick={() => navigate(`/mentors/${m.id}`)} className="rounded-full bg-slate-900 px-5 py-2.5 text-[14px] font-semibold text-white transition-colors hover:bg-slate-800" data-testid={`book-${i}`}>Book Session</button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Join CTA banner */}
        <div className="mt-12 overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-cyan-500 to-green-500 p-8 text-center sm:p-12">
          <h2 className="text-2xl font-black text-white sm:text-3xl">Have 5+ years of industry experience?</h2>
          <p className="mx-auto mt-3 max-w-xl text-white/90">Join MyMentor as a mentor, guide ambitious learners, and earn on your own schedule.</p>
          <button onClick={() => setApplyOpen(true)} data-testid="join-as-mentor-cta"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 font-semibold text-slate-900 shadow-medium transition-transform hover:scale-105">
            <UserPlus className="h-4 w-4" /> Join as Mentor
          </button>
        </div>
      </div>

<MentorApplyModal
  open={applyOpen}
  onClose={() => setApplyOpen(false)}
  onApplicationSuccess={refreshMentors}
/>
    </div>
  );
}
