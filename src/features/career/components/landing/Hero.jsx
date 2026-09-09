import { useRef } from "react";
import { motion, useMotionValue, useSpring, useScroll, useTransform } from "framer-motion";
import { Sparkles, Play, ArrowRight, TrendingUp, Star, Target, Map } from "lucide-react";
import { MaskedLine, PrimaryButton, SecondaryButton, Magnetic, CountUp, SectionTag } from "@/features/career/components/landing/primitives";
import { heroStats } from "@/features/career/services/landingData";
import { useAuth } from "@/features/auth/components/AuthModal";

function FloatCard({ children, className, depth = 1, mx, my, delay = 0 }) {
  const x = useTransform(mx, (v) => v * depth * -1);
  const y = useTransform(my, (v) => v * depth * -1);
  return (
    <motion.div
      style={{ x, y }}
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function Hero() {
  const { openAuth } = useAuth();
  const ref = useRef(null);

  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const mx = useSpring(rawX, { stiffness: 120, damping: 20 });
  const my = useSpring(rawY, { stiffness: 120, damping: 20 });

  const onMouse = (e) => {
    const r = ref.current.getBoundingClientRect();
    rawX.set(((e.clientX - (r.left + r.width / 2)) / r.width) * 40);
    rawY.set(((e.clientY - (r.top + r.height / 2)) / r.height) * 40);
  };

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const contentY = useTransform(scrollYProgress, [0, 1], [0, 120]);

  return (
    <section
      id="top"
      ref={ref}
      onMouseMove={onMouse}
      className="relative overflow-hidden pt-24 pb-20 lg:pt-28 lg:pb-28"
      data-testid="hero-section"
    >
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 grid-pattern opacity-60" />
      <div className="aurora-blob left-[-10%] top-[-5%] h-[420px] w-[420px] bg-blue-400/40" />
      <div className="aurora-blob right-[-8%] top-[10%] h-[460px] w-[460px] bg-cyan-400/30" />
      <div className="aurora-blob bottom-[-15%] left-[30%] h-[380px] w-[380px] bg-emerald-400/25" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-[#F8FAFC]" />

      <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-16 px-5 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
        {/* Left */}
        <motion.div style={{ y: contentY }} className="max-w-2xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <SectionTag>Your Career Doesn't End with Graduation.</SectionTag>
          </motion.div>

          <h1 className="mt-3 text-[42px] font-black leading-[1.1] tracking-tight text-slate-900 sm:text-5xl lg:text-[64px]">
            <MaskedLine delay={0.1}>Students don't fail for lack of talent.</MaskedLine>
            {/* <MaskedLine delay={0.2}>lack of talent.</MaskedLine> */}
            <span className="mt-3 block">
              <MaskedLine delay={0.35} className="gradient-text-premium">They fail for</MaskedLine>
              <MaskedLine delay={0.45} className="gradient-text-premium">lack of direction.</MaskedLine>
            </span>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.7 }}
            className="mt-7 max-w-xl text-[18px] leading-relaxed text-slate-600"
          >
            MyMentor is your lifelong career companion that helps students discover the right career,
            build industry-ready skills, complete real-world projects, connect with experienced mentors,
            measure career readiness, and confidently achieve their goals through personalized guidance and career intelligence.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.85, duration: 0.7 }}
            className="mt-9 flex flex-col gap-4 sm:flex-row"
          >
            <Magnetic strength={0.05}>
  <PrimaryButton
    onClick={openAuth}
    data-testid="hero-start-journey-button"
  >
    Start My Journey
    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
  </PrimaryButton>
</Magnetic>

<Magnetic strength={0.05}>
  <SecondaryButton
    onClick={openAuth}
    data-testid="hero-watch-demo-button"
  >
    <span className="grid h-6 w-6 place-items-center rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white">
      <Play className="h-3 w-3 fill-current" />
    </span>
    Watch Demo
  </SecondaryButton>
</Magnetic>
          </motion.div>

          {/* Floating stats */}
          <div className="mt-12 grid grid-cols-2 gap-x-8 gap-y-6 sm:grid-cols-3">
            {heroStats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 + i * 0.08 }}
                data-testid={`hero-stat-${i}`}
              >
                <div className="text-3xl font-black tracking-tight text-slate-900">
                  <CountUp value={s.value} suffix={s.suffix} />
                </div>
                <div className="mt-0.5 text-[13px] font-medium text-slate-500">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Right — floating dashboard composition */}
        <div className="relative mx-auto h-[520px] w-full max-w-[600px] lg:h-[600px]">
          {/* Main dashboard card */}
<FloatCard
  depth={0.4}
  mx={mx}
  my={my}
  delay={0.3}
className="absolute left-1/2 top-[15%] z-10 w-[300px] -translate-x-1/2 -translate-y-1/2 sm:w-[360px]">
              <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-large">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Career Dashboard</p>
                  <p className="mt-1 text-lg font-bold text-slate-900">Kavin's Journey</p>
                </div>
                <div className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-600">Level 4</div>
              </div>

              {/* CRI circle */}
              <div className="mt-6 flex items-center gap-5">
                <div className="relative h-24 w-24">
                  <svg viewBox="0 0 100 100" className="h-24 w-24 -rotate-90">
                    <circle cx="50" cy="50" r="42" fill="none" stroke="#E2E8F0" strokeWidth="9" />
                    <motion.circle
                      cx="50" cy="50" r="42" fill="none" stroke="url(#criGrad)" strokeWidth="9" strokeLinecap="round"
                      strokeDasharray={2 * Math.PI * 42}
                      initial={{ strokeDashoffset: 2 * Math.PI * 42 }}
                      whileInView={{ strokeDashoffset: 2 * Math.PI * 42 * (1 - 0.72) }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1], delay: 0.6 }}
                    />
                    <defs>
                      <linearGradient id="criGrad" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#2563EB" />
                        <stop offset="100%" stopColor="#22C55E" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 grid place-items-center">
                    <div className="text-center">
                      <div className="text-2xl font-black text-slate-900"><CountUp value={72} /></div>
                      <div className="text-[10px] font-semibold text-slate-400">CRI</div>
                    </div>
                  </div>
                </div>
                <div className="flex-1 space-y-2.5">
                  {[["Skills", 82, "#2563EB"], ["Projects", 68, "#06B6D4"], ["Readiness", 74, "#22C55E"]].map(([l, v, c]) => (
                    <div key={l}>
                      <div className="mb-1 flex justify-between text-[11px] font-medium text-slate-500"><span>{l}</span><span>{v}%</span></div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                        <motion.div className="h-full rounded-full" style={{ background: c }} initial={{ width: 0 }} whileInView={{ width: `${v}%` }} viewport={{ once: true }} transition={{ duration: 1.2, delay: 0.8 }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mini growth chart */}
              <div className="mt-5 rounded-2xl bg-slate-50 p-4">
                <div className="mb-2 flex items-center justify-between text-[11px] font-semibold text-slate-500">
                  <span>Career Growth</span>
                  <span className="flex items-center gap-1 text-emerald-600"><TrendingUp className="h-3 w-3" /> +38%</span>
                </div>
                <svg viewBox="0 0 240 70" className="h-16 w-full">
                  <motion.path
                    d="M0,60 C40,55 60,30 100,35 C140,40 160,10 240,8"
                    fill="none" stroke="url(#lineGrad)" strokeWidth="3" strokeLinecap="round"
                    initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }}
                    transition={{ duration: 1.8, delay: 0.9 }}
                  />
                  <defs>
                    <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#2563EB" />
                      <stop offset="100%" stopColor="#06B6D4" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>
          </FloatCard>

         {/* Floating mentor card - top left */}
<FloatCard
  depth={1.4}
  mx={mx}
  my={my}
  delay={0.6}
  className="absolute left-0 top-8 z-30"
>
  <div className="animate-float rounded-2xl border border-slate-100 bg-white/90 p-3.5 shadow-medium backdrop-blur">
    <div className="flex items-center gap-3">
      <img
        src="https://images.unsplash.com/photo-1737574994780-e31827afaed7?crop=entropy&cs=srgb&fm=jpg&q=85&w=120"
        alt="Mentor"
        className="h-10 w-10 rounded-full object-cover"
      />

      <div>
        <p className="text-sm font-bold text-slate-900">
          Arjun Menon
        </p>

        <p className="text-[11px] text-slate-500">
          Mentor · Google
        </p>
      </div>

      <div className="ml-2 flex items-center gap-0.5 rounded-full bg-amber-50 px-2 py-1 text-[11px] font-bold text-amber-600">
        <Star className="h-3 w-3 fill-current" />
        4.9
      </div>
    </div>
  </div>
</FloatCard>

          {/* Floating readiness chip */}
        <FloatCard
  depth={1.4}
  mx={mx}
  my={my}
  delay={0.6}
  className="absolute left-8 top-[40%] z-30 -translate-y-1/2"
>
  <div
    className="animate-float rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 p-4 text-white shadow-glow"
    style={{ animationDelay: "1s" }}
  >
    <Target className="h-5 w-5" />

    <p className="mt-2 text-2xl font-black leading-none">
      +250
    </p>

    <p className="text-[11px] opacity-90">
      Career Score
    </p>
  </div>
</FloatCard>

          {/* Floating roadmap chip */}
          <FloatCard
  depth={2}
  mx={mx}
  my={my}
  delay={0.85}
  className="absolute top-[70%] left-0 z-30"
>
  <div
    className="animate-float rounded-2xl border border-slate-100 bg-white/90 p-3.5 shadow-medium backdrop-blur"
    style={{ animationDelay: "0.5s" }}
  >
    <div className="flex items-center gap-2.5">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-violet-500 to-blue-600 text-white">
        <Map className="h-4 w-4" />
      </span>

      <div>
        <p className="text-sm font-bold text-slate-900">
          Roadmap
        </p>

        <p className="text-[11px] text-slate-500">
          11 milestones
        </p>
      </div>
    </div>
  </div>
</FloatCard>

          {/* Floating analytics chip */}
          <FloatCard
  depth={2}
  mx={mx}
  my={my}
  delay={0.95}
  className="absolute bottom-8 right-0 z-30"
>
  <div
    className="animate-float rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-medium"
    style={{ animationDelay: "1.4s" }}
  >
    <div className="flex items-end gap-1">
      {[10, 16, 12, 22, 18, 26].map((h, i) => (
        <motion.span
          key={i}
          className="w-1.5 rounded-full bg-gradient-to-t from-blue-600 to-cyan-400"
          initial={{ height: 0 }}
          whileInView={{ height: h }}
          viewport={{ once: true }}
          transition={{ delay: 1 + i * 0.06 }}
        />
      ))}
    </div>

    <p className="mt-1.5 text-[11px] font-semibold text-slate-500">
      Weekly XP
    </p>
  </div>
</FloatCard>
        </div>
      </div>
    </section>
  );
}
