import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, ArrowLeft, Sparkles, Loader2, Building2, MapPin, Users, BadgeCheck, Briefcase, ExternalLink } from "lucide-react";
import { api } from "@/services/api";
import { Logo } from "@/features/career/components/landing/primitives";
import { useAuth } from "@/features/auth/components/AuthModal";
import JoinCompanyModal from "@/features/organizations/components/JoinCompanyModal";

export default function OrganizationsPage() {
  const [companies, setCompanies] = useState(null);
  const [q, setQ] = useState("");
  const [joinOpen, setJoinOpen] = useState(false);
  const { isAuthed, openAuth } = useAuth();

  useEffect(() => { api.companiesList().then(setCompanies).catch(() => setCompanies([])); }, []);

  const filtered = useMemo(() => (companies || []).filter((c) =>
    !q || c.name.toLowerCase().includes(q.toLowerCase()) || (c.industry || "").toLowerCase().includes(q.toLowerCase())), [companies, q]);

  const openJoin = () => { isAuthed ? setJoinOpen(true) : openAuth(() => setJoinOpen(true)); };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="noise-overlay" />
      <header className="sticky top-0 z-40 border-b border-slate-200/60 bg-white/70 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 lg:px-8">
          <Logo />
          <div className="flex items-center gap-3">
            <Link to="/jobs" className="hidden items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900 sm:flex"><Briefcase className="h-4 w-4" /> Jobs</Link>
            <Link to="/" className="hidden items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900 sm:flex"><ArrowLeft className="h-4 w-4" /> Home</Link>
            <button onClick={openJoin} data-testid="join-as-company-header" className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-2.5 text-sm font-semibold text-white shadow-soft transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-glow">
              <Building2 className="h-4 w-4" /> Join as Company
            </button>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden py-16 lg:py-20">
        <div className="aurora-blob left-[5%] top-[0%] h-72 w-72 bg-blue-300/30" />
        <div className="aurora-blob right-[8%] top-[10%] h-72 w-72 bg-cyan-300/25" />
        <div className="relative mx-auto max-w-4xl px-5 text-center lg:px-8">
          <span className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-blue-600"><Sparkles className="h-3.5 w-3.5" /> Organisations</span>
          <h1 className="mt-6 text-4xl font-black leading-tight tracking-tight text-slate-900 sm:text-5xl">Companies hiring through <span className="gradient-text">MyMentor.</span></h1>
          <p className="mx-auto mt-5 max-w-2xl text-[18px] text-slate-600">Explore our tied-up partner companies. They post roles, and vetted MyMentor talent applies directly — hiring made human.</p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="rounded-3xl border border-slate-100 bg-white p-4 shadow-soft">
          <div className="relative lg:max-w-sm">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search companies, industries..." data-testid="company-search"
              className="w-full rounded-full border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-900 outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100" />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-5 pb-24 pt-8 lg:px-8">
        {companies === null ? (
          <div className="grid h-64 place-items-center"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>
        ) : filtered.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-200 py-20 text-center text-slate-500">No companies match your search.</div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((c, i) => (
              <motion.div key={c.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: (i % 6) * 0.05 }} whileHover={{ y: -6 }}
                className="group relative overflow-hidden rounded-3xl border border-slate-100 bg-white p-6 shadow-soft transition-shadow hover:shadow-large" data-testid={`company-card-${i}`}>
                <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-gradient-to-br from-blue-500/15 to-cyan-400/10 blur-2xl opacity-0 transition-opacity group-hover:opacity-100" />
                <div className="relative flex items-center gap-4">
                  <img src={c.logo} alt={c.name} loading="lazy" onError={(e) => { e.target.style.visibility = "hidden"; }} className="h-14 w-14 rounded-2xl border border-slate-100 bg-white object-contain p-1.5" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5"><h3 className="truncate text-lg font-bold text-slate-900">{c.name}</h3>{c.verified && <BadgeCheck className="h-4 w-4 shrink-0 text-blue-500" />}</div>
                    <span className="mt-0.5 inline-block rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-600">{c.industry}</span>
                  </div>
                </div>
                <p className="mt-4 line-clamp-2 text-sm text-slate-600">{c.about}</p>
                <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-[13px] text-slate-500">
                  <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> {c.location}</span>
                  <span className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5" /> {c.size}</span>
                </div>
                <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                 <span className="inline-flex items-center gap-1.5 text-sm font-bold text-emerald-600">
  <Briefcase className="h-4 w-4" /> {c.open_roles} open roles
</span>

                  {c.website && <a href={c.website} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-blue-600" data-testid={`company-website-${i}`}>Visit <ExternalLink className="h-3.5 w-3.5" /></a>}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        <div className="mt-12 overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-cyan-500 to-green-500 p-8 text-center sm:p-12">
          <h2 className="text-2xl font-black text-white sm:text-3xl">Want to hire through MyMentor?</h2>
          <p className="mx-auto mt-3 max-w-xl text-white/90">Partner with us to reach vetted, career-ready talent and post your open roles to thousands of ambitious candidates.</p>
          <button onClick={openJoin} data-testid="join-as-company-cta" className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 font-semibold text-slate-900 shadow-medium transition-transform hover:scale-105">
            <Building2 className="h-4 w-4" /> Join as Company
          </button>
        </div>
      </div>

<JoinCompanyModal
  open={joinOpen}
  onClose={() => setJoinOpen(false)}
  onCreated={(newCompany) => {
    setCompanies((prev) => [
      ...(prev || []),
      newCompany,
    ]);
  }}
/>
    </div>
  );
}
