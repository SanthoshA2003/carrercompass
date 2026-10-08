import { useEffect, useState } from "react";

import { useNavigate, useParams, useLocation } from "react-router-dom";

import { motion } from "framer-motion";

import {
  Lock,
  Check,
  Play,
  Loader2,
  Zap,
  Sparkles,
  Star,
  Trophy,
  BookOpen,
} from "lucide-react";

import Shell from "@/features/skillhub/components/Shell";
import { api } from "@/services/api";

// ============================================================
// GAME MAP CONFIGURATION
// ============================================================

const NODE_X_POSITIONS = [50, 250, 450, 650, 850];

const TOP_Y = 60;
const BOTTOM_Y = 180;

const ROW_HEIGHT = 300;

const LEVELS_PER_ROW = 5;

// ============================================================
// GET LEVEL TITLE
// ============================================================

function getLevelTitle(node) {
  return (
    node.title || node.level_title || node.name || `Level ${node.level_number}`
  );
}

// ============================================================
// GET LEVEL POSITION
// ============================================================

function getGameMapPosition(index) {
  const row = Math.floor(index / LEVELS_PER_ROW);

  const positionInRow = index % LEVELS_PER_ROW;

  const reverseRow = row % 2 === 1;

  const visualColumn = reverseRow
    ? LEVELS_PER_ROW - 1 - positionInRow
    : positionInRow;

  const x = NODE_X_POSITIONS[visualColumn];

  const y = positionInRow % 2 === 0 ? TOP_Y : BOTTOM_Y;

  return {
    x,
    y: row * ROW_HEIGHT + y,
    row,
    column: visualColumn,
  };
}

// ============================================================
// CREATE STRAIGHT CONNECTED PATH
// ============================================================

function createStraightPath(levels) {
  if (!levels || levels.length < 2) {
    return "";
  }

  const points = levels.map((_, index) => getGameMapPosition(index));

  let path = "";

  points.forEach((point, index) => {
    if (index === 0) {
      path = `M ${point.x} ${point.y}`;
      return;
    }

    // Straight line directly from previous level
    // to current level.
    path += ` L ${point.x} ${point.y}`;
  });

  return path;
}

// ============================================================
// GAME LEVEL
// ============================================================

function GameLevel({ node, index, onClick }) {
  const locked = !node.unlocked;

  const completed = node.completed;

  const current = node.unlocked && !node.completed;

  const position = getGameMapPosition(index);

  const levelTitle = getLevelTitle(node);

  const completedCheckpoints = node.completed_checkpoints || 0;

  const totalCheckpoints = node.total_checkpoints || 0;

  const xp = node.xp || 0;

  const progress =
    totalCheckpoints > 0
      ? Math.round((completedCheckpoints / totalCheckpoints) * 100)
      : completed
        ? 100
        : 0;

  return (
    <motion.div
      initial={{
        opacity: 0,
        scale: 0.8,
      }}
      animate={{
        opacity: 1,
        scale: 1,
      }}
      transition={{
        duration: 0.45,
        delay: index * 0.04,
      }}
      className="
        absolute
        z-30
        flex
        w-[175px]
        -translate-x-1/2
        -translate-y-1/2
        flex-col
        items-center
      "
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    >
      {/* ====================================================
          CURRENT LEVEL GLOW
      ==================================================== */}

      {current && (
        <>
          <motion.div
            className="
              pointer-events-none
              absolute
              h-[125px]
              w-[125px]
              rounded-full
              border
              border-cyan-400/30
            "
            animate={{
              scale: [0.8, 1.25, 0.8],
              opacity: [0.7, 0, 0.7],
            }}
            transition={{
              duration: 2.2,
              repeat: Infinity,
              ease: "easeOut",
            }}
          />

          <motion.div
            className="
              pointer-events-none
              absolute
              h-[150px]
              w-[150px]
              rounded-full
              border
              border-violet-400/20
            "
            animate={{
              scale: [0.8, 1.3, 0.8],
              opacity: [0.5, 0, 0.5],
            }}
            transition={{
              duration: 2.8,
              repeat: Infinity,
              ease: "easeOut",
              delay: 0.3,
            }}
          />

          <motion.div
            className="
              pointer-events-none
              absolute
              h-[112px]
              w-[112px]
              rounded-full
              border
              border-dashed
              border-cyan-300/50
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

      {/* ====================================================
          COMPLETED GLOW
      ==================================================== */}

      {completed && (
        <>
          <motion.div
            className="
              pointer-events-none
              absolute
              h-[110px]
              w-[110px]
              rounded-full
              bg-orange-400/10
            "
            animate={{
              scale: [0.9, 1.25, 0.9],
              opacity: [0.5, 0, 0.5],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
            }}
          />

          <motion.div
            className="
              pointer-events-none
              absolute
              -top-8
              right-8
            "
            animate={{
              y: [0, -6, 0],
              rotate: [0, 8, -8, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
            }}
          >
            <Sparkles
              className="
                h-4
                w-4
                text-yellow-300
              "
            />
          </motion.div>
        </>
      )}

      {/* ====================================================
          LEVEL NUMBER
      ==================================================== */}

      <div
        className={`
          absolute
          -right-1
          top-[-5px]
          z-50
          flex
          h-8
          min-w-8
          items-center
          justify-center
          rounded-full
          border-2
          border-slate-950
          px-2
          text-[10px]
          font-black
          shadow-xl

          ${
            completed
              ? `
                bg-yellow-400
                text-slate-950
              `
              : current
                ? `
                  bg-cyan-300
                  text-slate-950
                `
                : `
                  bg-slate-700
                  text-slate-300
                `
          }
        `}
      >
        {String(node.level_number).padStart(2, "0")}
      </div>

      {/* ====================================================
          LEVEL BUTTON
      ==================================================== */}

      <motion.button
        type="button"
        disabled={locked}
        onClick={() => {
          if (!locked) {
            onClick(node);
          }
        }}
        whileHover={
          !locked
            ? {
                scale: 1.08,
                y: -5,
              }
            : {}
        }
        whileTap={
          !locked
            ? {
                scale: 0.94,
              }
            : {}
        }
        className={`
          relative
          z-30
          flex
          h-[92px]
          w-[92px]
          items-center
          justify-center
          rounded-full
          border-[4px]
          transition-all
          duration-300

          ${
            completed
              ? `
                border-yellow-300/90
                bg-gradient-to-br
                from-yellow-300
                via-orange-500
                to-red-600
                shadow-[0_0_45px_rgba(251,146,60,0.55)]
              `
              : current
                ? `
                  border-cyan-200/90
                  bg-gradient-to-br
                  from-cyan-300
                  via-blue-500
                  to-violet-600
                  shadow-[0_0_50px_rgba(34,211,238,0.7)]
                `
                : `
                  border-slate-700
                  bg-gradient-to-br
                  from-slate-700
                  via-slate-800
                  to-slate-950
                  shadow-[0_12px_35px_rgba(0,0,0,0.6)]
                `
          }

          ${
            locked
              ? `
                cursor-not-allowed
                opacity-60
              `
              : `
                cursor-pointer
              `
          }
        `}
      >
        {/* Inner circle */}

        <span
          className={`
            flex
            h-[72px]
            w-[72px]
            items-center
            justify-center
            rounded-full
            border
            border-white/10
            bg-slate-950/95
            text-white
            shadow-inner

            ${
              current
                ? `
                  shadow-[inset_0_0_30px_rgba(34,211,238,0.25)]
                `
                : ""
            }
          `}
        >
          {locked ? (
            <Lock
              className="
                h-6
                w-6
                text-slate-500
              "
            />
          ) : completed ? (
            <Check
              className="
                h-9
                w-9
                text-white
              "
              strokeWidth={3}
            />
          ) : (
            <Play
              className="
                ml-1
                h-8
                w-8
                fill-white
                text-white
              "
            />
          )}
        </span>

        {/* Shine */}

        {!locked && (
          <motion.span
            animate={{
              opacity: [0.1, 0.4, 0.1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
            }}
            className="
              pointer-events-none
              absolute
              left-[18px]
              top-[13px]
              h-3
              w-8
              rotate-[-35deg]
              rounded-full
              bg-white/50
              blur-[2px]
            "
          />
        )}
      </motion.button>

      {/* ====================================================
          LEVEL INFORMATION
      ==================================================== */}

      <div
        className="
          relative
          z-30
          mt-3
          w-[175px]
          text-center
        "
      >
        <h3
          title={levelTitle}
          className={`
            line-clamp-2
            min-h-[32px]
            text-[13px]
            font-black
            leading-[16px]

            ${
              locked
                ? "text-slate-600"
                : completed
                  ? "text-orange-300"
                  : "text-cyan-100"
            }
          `}
        >
          {levelTitle}
        </h3>

        {/* Checkpoints + XP */}

        <div
          className="
            mt-2
            flex
            items-center
            justify-center
            gap-1.5
            text-[9px]
            font-bold
          "
        >
          <span className={locked ? "text-slate-700" : "text-slate-500"}>
            {completedCheckpoints}/{totalCheckpoints}
          </span>

          <span
            className="
              text-slate-700
            "
          >
            •
          </span>

          <span
            className={
              locked
                ? "text-slate-700"
                : completed
                  ? "text-orange-400"
                  : "text-cyan-400"
            }
          >
            {xp} XP
          </span>
        </div>

        {/* Progress */}

        <div
          className="
            mx-auto
            mt-2
            h-1
            w-[100px]
            overflow-hidden
            rounded-full
            bg-slate-800
          "
        >
          <motion.div
            initial={{
              width: 0,
            }}
            animate={{
              width: `${progress}%`,
            }}
            transition={{
              duration: 0.7,
              delay: index * 0.03,
            }}
            className={`
              h-full
              rounded-full

              ${
                completed
                  ? `
                    bg-gradient-to-r
                    from-yellow-400
                    to-orange-500
                  `
                  : `
                    bg-gradient-to-r
                    from-cyan-400
                    to-violet-500
                  `
              }
            `}
          />
        </div>

        {/* Status */}

        <div
          className="
            mt-2
          "
        >
          {current && (
            <div
              className="
                flex
                items-center
                justify-center
                gap-1
              "
            >
              <Zap
                className="
                  h-2.5
                  w-2.5
                  fill-yellow-300
                  text-yellow-300
                "
              />

              <span
                className="
                  text-[8px]
                  font-black
                  uppercase
                  tracking-[0.2em]
                  text-yellow-300
                "
              >
                Ready
              </span>
            </div>
          )}

          {completed && (
            <span
              className="
                text-[8px]
                font-black
                uppercase
                tracking-[0.2em]
                text-orange-400
              "
            >
              Completed
            </span>
          )}

          {locked && (
            <span
              className="
                text-[8px]
                font-black
                uppercase
                tracking-[0.2em]
                text-slate-700
              "
            >
              Locked
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ============================================================
// JOURNEY
// ============================================================

export default function Journey() {
  const [data, setData] = useState(null);

  const [error, setError] = useState(null);

  const nav = useNavigate();

  const location = useLocation();

  const { studentId, courseId } = useParams();

  // ==========================================================
  // COLLEGE ADMIN VIEW
  // ==========================================================

  const isCollegeAdminView = location.pathname.startsWith("/college-admin/");

  // ==========================================================
  // PAGE WRAPPER
  // ==========================================================

  const PageWrapper = ({ children }) =>
    isCollegeAdminView ? (
      <div
        className="
          min-h-screen
          bg-slate-950
          text-white
        "
      >
        {children}
      </div>
    ) : (
      <Shell>{children}</Shell>
    );

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
      <PageWrapper>
        <div
          className="
            grid
            h-[60vh]
            place-items-center
          "
        >
          <p
            className="
              text-sm
              font-bold
              text-red-400
            "
          >
            {error}
          </p>
        </div>
      </PageWrapper>
    );
  }

  // ==========================================================
  // LOADING
  // ==========================================================

  if (!data) {
    return (
      <PageWrapper>
        <div
          className="
            grid
            h-[60vh]
            place-items-center
          "
        >
          <Loader2
            className="
              h-8
              w-8
              animate-spin
              text-cyan-400
            "
          />
        </div>
      </PageWrapper>
    );
  }

  // ==========================================================
  // MAIN PAGE
  // ==========================================================

  return (
    <PageWrapper>
      <div
        className="
          relative
          -m-8
          min-h-[calc(100vh-32px)]
          overflow-hidden
          bg-[#080b19]
        "
      >
        {/* ==================================================
            BACKGROUND
        ================================================== */}

        <div
          className="
            pointer-events-none
            absolute
            inset-0
          "
        >
          {/* Purple atmosphere */}

          <div
            className="
              absolute
              left-[25%]
              top-0
              h-[500px]
              w-[700px]
              rounded-full
              bg-violet-600/[0.06]
              blur-[140px]
            "
          />

          {/* Cyan atmosphere */}

          <div
            className="
              absolute
              right-[5%]
              top-[35%]
              h-[400px]
              w-[500px]
              rounded-full
              bg-cyan-500/[0.035]
              blur-[130px]
            "
          />

          {/* Background grid */}

          <div
            className="
              absolute
              inset-0
              opacity-[0.025]
              [background-image:linear-gradient(rgba(255,255,255,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.5)_1px,transparent_1px)]
              [background-size:50px_50px]
            "
          />
        </div>

        {/* ==================================================
            CONTENT
        ================================================== */}

        <div
          className="
            relative
            z-10
            mx-auto
            max-w-[1250px]
            px-5
            pb-24
            sm:px-7
            lg:px-10
          "
        >
          {/* =================================================
              COURSE HEADER
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
              duration: 0.6,
            }}
            className="
              pt-7
            "
          >
            {/* Quest */}

            <div
              className="
                flex
                items-center
                gap-2
              "
            >
              <motion.span
                animate={{
                  scale: [1, 1.4, 1],
                  opacity: [0.6, 1, 0.6],
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
                  shadow-[0_0_14px_rgba(34,211,238,1)]
                "
              />

              <span
                className="
                  text-[10px]
                  font-black
                  uppercase
                  tracking-[0.35em]
                  text-cyan-400
                "
              >
                Learning Quest
              </span>

              <Sparkles
                className="
                  h-4
                  w-4
                  text-violet-400
                "
              />
            </div>

            {/* Course title */}

            <h1
              className="
                mt-3
                bg-gradient-to-r
                from-white
                via-cyan-100
                to-violet-300
                bg-clip-text
                text-3xl
                font-black
                tracking-tight
                text-transparent
                sm:text-4xl
                md:text-5xl
              "
            >
              {data.course?.title}
            </h1>

            <p
              className="
                mt-3
                max-w-xl
                text-sm
                text-slate-500
              "
            >
              Complete each level, earn XP, and unlock your next challenge.
            </p>

            {/* Decorative line */}

            <motion.div
              initial={{
                width: 0,
              }}
              animate={{
                width: "190px",
              }}
              transition={{
                duration: 0.8,
                delay: 0.3,
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

          <div
            className="
              mt-12
              space-y-20
            "
          >
            {data.stages?.map((stage, stageIndex) => {
              const total = stage.total_levels || stage.levels?.length || 0;

              const done = stage.completed_levels || 0;

              const progress = total > 0 ? Math.round((done / total) * 100) : 0;

              const numberOfRows = Math.ceil(
                (stage.levels?.length || 0) / LEVELS_PER_ROW,
              );

              const mapHeight = Math.max(numberOfRows * ROW_HEIGHT, 330);

              return (
                <motion.section
                  key={stage.stage}
                  initial={{
                    opacity: 0,
                    y: 20,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    duration: 0.55,
                    delay: stageIndex * 0.08,
                  }}
                >
                  {/* =====================================
                        CHAPTER HEADER
                    ===================================== */}

                  <div
                    className="
                        mb-4
                        flex
                        flex-col
                        gap-4
                        sm:flex-row
                        sm:items-end
                        sm:justify-between
                      "
                  >
                    {/* Left */}

                    <div
                      className="
                          flex
                          items-center
                          gap-3
                        "
                    >
                      <div
                        className="
                            flex
                            h-11
                            w-11
                            shrink-0
                            items-center
                            justify-center
                            rounded-xl
                            border
                            border-cyan-400/20
                            bg-cyan-400/[0.07]
                          "
                      >
                        <BookOpen
                          className="
                              h-5
                              w-5
                              text-cyan-300
                            "
                        />
                      </div>

                      <div>
                        <div
                          className="
                              flex
                              items-center
                              gap-2
                            "
                        >
                          <span
                            className="
                                text-[9px]
                                font-black
                                uppercase
                                tracking-[0.3em]
                                text-cyan-400
                              "
                          >
                            Chapter {String(stageIndex + 1).padStart(2, "0")}
                          </span>

                          <span
                            className="
                                h-1
                                w-1
                                rounded-full
                                bg-slate-700
                              "
                          />

                          <span
                            className="
                                text-[9px]
                                font-bold
                                text-slate-600
                              "
                          >
                            {done}/{total}
                          </span>
                        </div>

                        <h2
                          className="
                              mt-0.5
                              text-xl
                              font-black
                              text-white
                            "
                        >
                          {stage.stage}
                        </h2>
                      </div>
                    </div>

                    {/* Right progress */}

                    <div
                      className="
                          flex
                          items-center
                          gap-3
                        "
                    >
                      <div
                        className="
                            hidden
                            h-1.5
                            w-32
                            overflow-hidden
                            rounded-full
                            bg-slate-800
                            sm:block
                          "
                      >
                        <motion.div
                          initial={{
                            width: 0,
                          }}
                          animate={{
                            width: `${progress}%`,
                          }}
                          transition={{
                            duration: 0.8,
                          }}
                          className="
                              h-full
                              rounded-full
                              bg-gradient-to-r
                              from-cyan-400
                              to-violet-500
                            "
                        />
                      </div>

                      <span
                        className="
                            text-[9px]
                            font-black
                            uppercase
                            tracking-[0.2em]
                            text-slate-600
                          "
                      >
                        {progress}% Complete
                      </span>
                    </div>
                  </div>

                  {/* =====================================
                        GAME MAP
                    ===================================== */}

                  <div
                    className="
                        relative
                        overflow-x-auto
                        overflow-y-hidden
                        rounded-3xl
                        border
                        border-white/[0.04]
                        bg-[#0b0f20]/50
                      "
                  >
                    {/* Background */}

                    <div
                      className="
                          pointer-events-none
                          absolute
                          inset-0
                        "
                    >
                      <div
                        className="
                            absolute
                            left-[15%]
                            top-[10%]
                            h-[200px]
                            w-[200px]
                            rounded-full
                            bg-cyan-400/[0.025]
                            blur-[80px]
                          "
                      />

                      <div
                        className="
                            absolute
                            right-[15%]
                            bottom-[10%]
                            h-[250px]
                            w-[250px]
                            rounded-full
                            bg-violet-500/[0.035]
                            blur-[90px]
                          "
                      />

                      <div
                        className="
                            absolute
                            inset-0
                            opacity-[0.025]
                            [background-image:linear-gradient(rgba(255,255,255,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.5)_1px,transparent_1px)]
                            [background-size:45px_45px]
                          "
                      />
                    </div>

                    {/* =================================
                          MAP CANVAS
                      ================================= */}

                    <div
                      className="
                          relative
                          mx-auto
                          min-w-[1000px]
                          px-0
                          py-10
                        "
                      style={{
                        height: mapHeight + 80,
                      }}
                    >
                      {/* =================================
                            LEVEL NODES
                        ================================= */}

                      {stage.levels?.map((node, index) => (
                        <GameLevel
                          key={node.id}
                          node={node}
                          index={index}
                          onClick={(selectedNode) =>
                            nav(`/skillhub/level/${selectedNode.id}`)
                          }
                        />
                      ))}
                    </div>
                  </div>
                </motion.section>
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
              flex
              flex-col
              items-center
              justify-center
              py-16
              text-center
            "
          >
            <motion.div
              animate={{
                y: [0, -6, 0],
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
              }}
              className="
                flex
                h-14
                w-14
                items-center
                justify-center
                rounded-2xl
                border
                border-violet-400/20
                bg-violet-500/[0.07]
              "
            >
              <Trophy
                className="
                  h-6
                  w-6
                  text-violet-300
                "
              />
            </motion.div>

            <p
              className="
                mt-4
                text-sm
                font-black
                text-slate-400
              "
            >
              Keep going, adventurer.
            </p>

            <p
              className="
                mt-1
                text-xs
                text-slate-600
              "
            >
              Your next level is waiting.
            </p>
          </motion.div>
        </div>
      </div>
    </PageWrapper>
  );
}
