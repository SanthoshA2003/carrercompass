import React from "react";
import {
  BriefcaseBusiness,
  Clock3,
  GraduationCap,
} from "lucide-react";

const trainers = [
  {
    name: "Karthikeyan",
    experience: "18+ years Experience",
    role: "Cloud Engineer",
    course: "Cloud Engineering",
  },
  {
    name: "Rajesh Kumar",
    experience: "8+ years Experience",
    role: "Business Development",
    course: "Business Development",
  },
  {
    name: "Santhosh",
    experience: "5+ years Experience",
    role: "Frontend Developer",
    course: "React JS",
  },
  {
    name: "Kavinasri",
    experience: "5+ years Experience",
    role: "Backend Developer",
    course: "Python, C#",
  },
  {
    name: "Ambigavathy",
    experience: "5+ years Experience",
    role: "Frontend Developer",
    course: "React JS",
  },
  {
    name: "Madhan Kumar",
    experience: "5+ years Experience",
    role: "Backend Developer",
    course: "Python, C#",
  },
];

const getInitials = (name) => {
  const parts = name.trim().split(" ");

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return (
    parts[0].charAt(0) +
    parts[parts.length - 1].charAt(0)
  ).toUpperCase();
};

export default function Trainers() {
  return (
<section className="relative overflow-hidden pt-0 pb-20">

      {/* =========================================
          BACKGROUND GLOW
      ========================================= */}
      <div className="pointer-events-none absolute -left-40 top-10 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />

      <div className="pointer-events-none absolute -right-40 bottom-0 h-96 w-96 rounded-full bg-cyan-400/10 blur-3xl" />

      {/* =========================================
          SUBTLE GRID
      ========================================= */}
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            "linear-gradient(rgba(15,23,42,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,0.035) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">

        {/* =========================================
            SECTION HEADER
        ========================================= */}
        <div className="mx-auto max-w-3xl text-center">

          {/* Badge */}
          <div className="inline-flex items-center rounded-full border border-blue-100 bg-blue-50 px-4 py-2 shadow-sm">
            <span className="text-xs font-bold uppercase tracking-[0.22em] text-blue-600">
              Trainers
            </span>
          </div>

          {/* Heading */}
          <h2 className="mt-5 text-4xl font-black tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
            Learn From
            <span className="block bg-gradient-to-r from-blue-600 via-cyan-500 to-violet-500 bg-clip-text text-transparent">
              Experienced Trainers.
            </span>
          </h2>

          {/* Description */}
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-500 sm:text-lg">
            Learn directly from experienced professionals with
            real-world expertise across technology, cloud, business,
            frontend and backend development.
          </p>
        </div>

        {/* =========================================
            TRAINER CARDS
        ========================================= */}
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:mt-12 lg:grid-cols-3">

          {trainers.map((trainer) => (
            <div
              key={trainer.name}
              className="
                group
                relative
                overflow-hidden
                rounded-3xl
                border
                border-slate-200
                bg-white
                p-6
                shadow-[0_8px_30px_rgba(15,23,42,0.05)]
                transition-all
                duration-300
                hover:-translate-y-2
                hover:border-blue-200
                hover:shadow-[0_20px_50px_rgba(37,99,235,0.12)]
              "
            >

              {/* Top Gradient */}
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-600 via-cyan-500 to-violet-500" />

              {/* Hover Glow */}
              <div
                className="
                  pointer-events-none
                  absolute
                  -right-20
                  -top-20
                  h-40
                  w-40
                  rounded-full
                  bg-blue-500/10
                  blur-3xl
                  opacity-0
                  transition-opacity
                  duration-300
                  group-hover:opacity-100
                "
              />

              <div className="relative">

                {/* =====================================
                    TOP ROW
                ===================================== */}
                <div className="flex items-start gap-4">

                  {/* Initial Circle */}
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 via-cyan-500 to-violet-500 p-[2px] shadow-[0_8px_20px_rgba(37,99,235,0.18)]">

                    <div className="flex h-full w-full items-center justify-center rounded-full bg-white">
                      <span className="bg-gradient-to-r from-blue-600 via-cyan-500 to-violet-500 bg-clip-text text-lg font-black text-transparent">
                        {getInitials(trainer.name)}
                      </span>
                    </div>

                  </div>

                  {/* Name + Role */}
                  <div className="min-w-0 flex-1">

                    <div className="flex items-start justify-between gap-2">

                      <h3 className="truncate text-lg font-black tracking-tight text-slate-900">
                        {trainer.name}
                      </h3>

                      <span className="shrink-0 rounded-full bg-blue-50 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-blue-600">
                        Trainer
                      </span>

                    </div>

                    <p className="mt-1 text-sm font-semibold text-slate-600">
                      {trainer.role}
                    </p>

                  </div>
                </div>

                {/* =====================================
                    EXPERIENCE
                ===================================== */}
                <div className="mt-5 flex items-center gap-2 rounded-xl border border-cyan-100 bg-cyan-50/70 px-3 py-2.5">

                  <Clock3 className="h-4 w-4 shrink-0 text-cyan-600" />

                  <span className="text-xs font-bold text-cyan-700">
                    {trainer.experience}
                  </span>

                </div>

                {/* =====================================
                    COURSE
                ===================================== */}
                <div className="mt-3 flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50 px-3 py-3">

                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-violet-500 text-white shadow-sm">
                    <GraduationCap className="h-4 w-4" />
                  </div>

                  <div className="min-w-0">

                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                      Course
                    </p>

                    <p className="mt-1 text-sm font-bold text-slate-800">
                      {trainer.course}
                    </p>

                  </div>
                </div>

                {/* =====================================
                    BOTTOM
                ===================================== */}
                <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">

                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                    <BriefcaseBusiness className="h-3.5 w-3.5 text-blue-500" />
                    MyMentor Professional
                  </div>

                  {/* <div className="h-2 w-2 rounded-full bg-gradient-to-r from-cyan-400 to-violet-500" /> */}

                </div>

              </div>
            </div>
          ))}

        </div>
      </div>
    </section>
  );
}

