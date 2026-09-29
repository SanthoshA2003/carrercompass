import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock, Check, Play, Loader2, Zap, Sparkles } from "lucide-react";

import Shell from "@/features/skillhub/components/Shell";
import { api } from "@/services/api";

// ============================================================
// ZIG-ZAG CONFIG
// ============================================================

const ZIG_ZAG_POSITIONS = [0, 1, -1, 1, -1, 1, -1, 1, -1, 1];


// ============================================================
// LEVEL NODE
// ============================================================

function Node({ node, index, onClick }) {
  const locked = !node.unlocked;
  const completed = node.completed;
  const current = node.unlocked && !node.completed;

  const position = ZIG_ZAG_POSITIONS[index % ZIG_ZAG_POSITIONS.length];

  const isCenter = position === 0;

  const ring = completed
    ? "from-amber-400 via-orange-500 to-red-500"
    : current
      ? "from-cyan-300 via-blue-500 to-violet-600"
      : "from-slate-700 via-slate-800 to-slate-900";

  return (
    <div className="relative z-20 flex w-full flex-col items-center">
      {/* =====================================================
          ZIG-ZAG NODE WRAPPER
      ===================================================== */}

      <div
        className="relative flex w-full justify-center"
      style={{
  transform:
    position === 0
      ? "translateX(0)"
      : position > 0
        ? "translateX(90px)"
        : "translateX(-90px)",
}}
      >
        {/* =================================================
            CURRENT LEVEL PULSE
        ================================================= */}

        {current && (
          <>
            <motion.div
              className="absolute h-32 w-32 rounded-full border border-cyan-400/30"
              animate={{
                scale: [0.8, 1.4, 0.8],
                opacity: [0.7, 0, 0.7],
              }}
              transition={{
                duration: 2.2,
                repeat: Infinity,
                ease: "easeOut",
              }}
            />

            <motion.div
              className="absolute h-40 w-40 rounded-full border border-violet-400/10"
              animate={{
                scale: [0.8, 1.45, 0.8],
                opacity: [0.5, 0, 0.5],
              }}
              transition={{
                duration: 2.8,
                repeat: Infinity,
                ease: "easeOut",
                delay: 0.3,
              }}
            />

            {/* Rotating energy ring */}
            <motion.div
              className="
                absolute
                h-[104px]
                w-[104px]
                rounded-full
                border
                border-dashed
                border-cyan-300/40
              "
              animate={{
                rotate: 360,
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "linear",
              }}
            />
          </>
        )}

        {/* =================================================
            COMPLETED EFFECT
        ================================================= */}

        {completed && (
          <>
            <motion.div
              className="absolute h-28 w-28 rounded-full bg-orange-400/10"
              animate={{
                scale: [0.9, 1.35, 0.9],
                opacity: [0.4, 0, 0.4],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
              }}
            />

            <motion.div
              className="absolute -top-4"
              animate={{
                y: [0, -8, 0],
                rotate: [0, 8, -8, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
            >
              <Sparkles className="h-5 w-5 text-amber-300" />
            </motion.div>
          </>
        )}

        {/* =================================================
            NODE BUTTON
        ================================================= */}

       <button
  onClick={() => !locked && onClick(node)}
  disabled={locked}
  className={`
    relative
    grid
    h-20
    w-20
    place-items-center
    rounded-full
    bg-gradient-to-br
    ${ring}

    transition-transform
    duration-200

    ${
      current
        ? "shadow-[0_0_45px_rgba(34,211,238,0.65)] ring-4 ring-cyan-400/30"
        : completed
          ? "shadow-[0_0_35px_rgba(251,146,60,0.4)]"
          : "shadow-[0_15px_35px_rgba(0,0,0,0.55)]"
    }

    ${
      locked
        ? "cursor-not-allowed opacity-60"
        : "cursor-pointer hover:scale-105 active:scale-95"
    }
  `}
        >
          {/* Outer shine */}
          <span className="absolute inset-[3px] rounded-full border border-white/20" />

          {/* Inner node */}
          <span
            className={`
              grid
              h-[64px]
              w-[64px]
              place-items-center
              rounded-full
              border
              border-white/10
              bg-slate-950/80
              text-white
              backdrop-blur-xl

              ${current ? "shadow-[inset_0_0_25px_rgba(34,211,238,0.2)]" : ""}
            `}
          >
            {locked ? (
  <Lock className="h-6 w-6 text-slate-400" />
) : completed ? (
  <Check className="h-7 w-7 text-white" />
) : (
  <Play className="h-6 w-6 fill-current" />
)}
          </span>

          {/* =================================================
              LEVEL NUMBER
          ================================================= */}

          <span
            className={`
              absolute
              -right-2
              -top-2
              grid
              h-7
              w-7
              place-items-center
              rounded-full
              border-2
              border-slate-950
              text-xs
              font-black
              shadow-lg

              ${
                completed
                  ? "bg-amber-400 text-slate-950"
                  : current
                    ? "bg-cyan-300 text-slate-950"
                    : "bg-slate-700 text-white"
              }
            `}
          >
            {node.level_number}
          </span>
        </button>

        {/* =================================================
            NODE LABEL
        ================================================= */}

        <motion.div
          className="
            absolute
            top-[108px]
            min-w-[130px]
            text-center
          "
          animate={
            current
              ? {
                  y: [0, -3, 0],
                }
              : {}
          }
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
        >
          <p
            className={`
              text-xs
              font-bold

              ${
                locked
                  ? "text-slate-600"
                  : completed
                    ? "text-amber-300"
                    : "text-cyan-300"
              }
            `}
          >
            {node.completed_checkpoints}/{node.total_checkpoints}
            <span className="mx-1 text-slate-600">·</span>
            {node.xp} XP
          </p>

          {current && (
            <div className="mt-1 flex items-center justify-center gap-1">
              <Zap className="h-3 w-3 fill-current text-yellow-300" />

              <span className="text-[10px] font-bold uppercase tracking-wider text-yellow-300">
                Ready
              </span>
            </div>
          )}

          {completed && (
            <div className="mt-1 text-[10px] font-bold uppercase tracking-wider text-amber-400">
              Completed
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

// ============================================================
// JOURNEY
// ============================================================

export default function Journey() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const nav = useNavigate();
  const { courseId } = useParams();

  // ==========================================================
  // FETCH JOURNEY
  // ==========================================================

  useEffect(() => {
    const fetchJourney = async () => {
      try {
        setError(null);
        setData(null);

        if (!courseId) {
          throw new Error("Course ID not found");
        }

        console.log("Journey Course ID:", courseId);

        const journeyData = await api.journey(courseId);

        console.log("Journey Data:", journeyData);

        setData(journeyData);
      } catch (err) {
        console.error("Journey API Error:", err);

        setError(
          err?.response?.data?.detail ||
            err?.message ||
            "Failed to load journey",
        );
      }
    };

    fetchJourney();
  }, [courseId]);

  // ==========================================================
  // ERROR
  // ==========================================================

  if (error) {
    return (
      <Shell>
        <div className="grid h-[60vh] place-items-center">
          <p className="text-red-400">{error}</p>
        </div>
      </Shell>
    );
  }

  // ==========================================================
  // LOADING
  // ==========================================================

  if (!data) {
    return (
      <Shell>
        <div className="grid h-[60vh] place-items-center">
          <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
        </div>
      </Shell>
    );
  }

  // ==========================================================
  // PAGE
  // ==========================================================

  return (
    <Shell>
      <div className="relative -m-8 min-h-[calc(100vh-32px)] overflow-hidden">
      

{/* SIMPLE BACKGROUND */}
<div className="pointer-events-none absolute inset-0 bg-slate-950">
  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.06),transparent_35%)]" />
</div>

        {/* ==================================================
            CONTENT
        ================================================== */}

        <div className="relative z-10 mx-auto max-w-4xl px-4 pb-32 sm:px-6">
          {/* =================================================
              HEADER
          ================================================= */}

          <motion.div
            initial={{
              opacity: 0,
              y: -20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.7,
            }}
            className="relative pt-6"
          >
            {/* Quest label */}

            <div className="mb-3 flex items-center gap-2">
              <motion.span
                animate={{
                  scale: [1, 1.4, 1],
                  opacity: [0.7, 1, 0.7],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                }}
                className="
                  h-2
                  w-2
                  rounded-full
                  bg-cyan-400
                  shadow-[0_0_15px_rgba(34,211,238,1)]
                "
              />

              <span
                className="
                  text-xs
                  font-black
                  uppercase
                  tracking-[0.3em]
                  text-cyan-400
                "
              >
                Learning Quest
              </span>

              <Sparkles className="h-4 w-4 text-violet-400" />
            </div>

            {/* Course title */}

            <h1
              className="
                bg-gradient-to-r
                from-white
                via-cyan-100
                to-violet-300
                bg-clip-text
                text-4xl
                font-black
                tracking-tight
                text-transparent
                md:text-5xl
              "
            >
              {data.course?.title}
            </h1>

            <p className="mt-3 text-sm text-slate-400">
              Complete every level and unlock your next challenge.
            </p>

            {/* Decorative line */}

            <motion.div
              initial={{
                width: 0,
              }}
              animate={{
                width: "180px",
              }}
              transition={{
                duration: 1,
                delay: 0.5,
              }}
              className="
                mt-5
                h-[2px]
                rounded-full
                bg-gradient-to-r
                from-cyan-400
                via-violet-500
                to-transparent
              "
            />
          </motion.div>

          {/* =================================================
              STAGES
          ================================================= */}

          <div className="mt-12 space-y-28">
            {data.stages?.map((stage, stageIndex) => {
              const total = stage.total_levels;
              const done = stage.completed_levels;

              return (
                <div
  key={stage.stage}
  className="relative"
>
                  {/* =================================================
                      STAGE HEADER
                  ================================================= */}

                  <div className="mb-12 flex items-center justify-center gap-3">
                    <motion.div
                      whileHover={{
                        scale: 1.05,
                      }}
                      className="
                        flex
                        items-center
                        gap-2
                        rounded-xl
                        border
                        border-cyan-400/20
                        bg-slate-950/80
                        px-4
                        py-2
                        shadow-[0_0_25px_rgba(34,211,238,0.08)]
                        backdrop-blur-xl
                      "
                    >
                      <Zap className="h-4 w-4 fill-current text-yellow-300" />

                      <span className="text-sm font-black text-cyan-300">
                        {stage.stage}
                      </span>
                    </motion.div>

                    <span
                      className="
                        rounded-full
                        border
                        border-white/5
                        bg-slate-900/80
                        px-3
                        py-1.5
                        text-xs
                        font-bold
                        text-slate-400
                        backdrop-blur-xl
                      "
                    >
                      {done}/{total} completed
                    </span>
                  </div>

                  {/* =================================================
                      ZIG-ZAG JOURNEY AREA
                  ================================================= */}

                  <div className="relative mx-auto w-full max-w-2xl">
               

{/* =================================================
    SINGLE ZIG-ZAG PATH
================================================= */}

<div className="pointer-events-none absolute inset-0 z-0">
  <svg
    className="absolute inset-0 h-full w-full"
    viewBox={`0 0 600 ${stage.levels.length * 160 - 80}`}
    preserveAspectRatio="none"
  >
    <defs>
      <linearGradient
        id={`path-gradient-${stageIndex}`}
        x1="0%"
        y1="0%"
        x2="100%"
        y2="100%"
      >
        <stop offset="0%" stopColor="#22d3ee" />
        <stop offset="50%" stopColor="#6366f1" />
        <stop offset="100%" stopColor="#a855f7" />
      </linearGradient>
    </defs>

   {stage.levels.slice(0, -1).map((_, index) => {
  const startX =
    index === 0
      ? 300
      : index % 2 === 1
        ? 390
        : 210;

  const startY = 40 + index * 160;

  const endX =
    (index + 1) % 2 === 1
      ? 390
      : 210;

  const endY = 40 + (index + 1) * 160;

  const dx = endX - startX;
  const dy = endY - startY;

  const distance = Math.sqrt(dx * dx + dy * dy);

  // Circle radius = 40px
  const radius = 40;

  const startXOffset = (dx / distance) * radius;
  const startYOffset = (dy / distance) * radius;

  const endXOffset = (dx / distance) * radius;
  const endYOffset = (dy / distance) * radius;

  return (
    <line
      key={index}
      x1={startX + startXOffset}
      y1={startY + startYOffset}
      x2={endX - endXOffset}
      y2={endY - endYOffset}
      stroke={`url(#path-gradient-${stageIndex})`}
      strokeWidth="2.5"
      strokeLinecap="round"
      opacity="0.7"
    />
  );
})}
  </svg>
</div>

                    {/* =================================================
                        LEVEL NODES
                    ================================================= */}

                    <div className="relative z-10 flex flex-col gap-[80px]">
                      {stage.levels?.map((node, i) => (
                        <Node
                          key={node.id}
                          node={node}
                          index={i}
                          onClick={(n) => nav(`/skillhub/level/${n.id}`)}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* =================================================
              END OF JOURNEY
          ================================================= */}

          <motion.div
            initial={{
              opacity: 0,
              scale: 0.9,
            }}
            whileInView={{
              opacity: 1,
              scale: 1,
            }}
            viewport={{
              once: true,
            }}
            className="
              mt-24
              flex
              flex-col
              items-center
              justify-center
              pb-20
              text-center
            "
          >
            <motion.div
              animate={{
                rotate: [0, 5, -5, 0],
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
              }}
              className="
                grid
                h-16
                w-16
                place-items-center
                rounded-2xl
                border
                border-violet-400/20
                bg-violet-500/10
                shadow-[0_0_30px_rgba(124,58,237,0.2)]
              "
            >
              <Sparkles className="h-7 w-7 text-violet-300" />
            </motion.div>

            <p className="mt-4 text-sm font-bold text-slate-400">
              Keep learning. Your next level awaits.
            </p>
          </motion.div>
        </div>
      </div>
    </Shell>
  );
}
