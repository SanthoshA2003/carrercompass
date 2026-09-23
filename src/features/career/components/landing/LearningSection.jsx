  import { useEffect, useState } from "react";
  import { motion } from "framer-motion";
  import { useNavigate } from "react-router-dom";
  import { BookOpen, Clock, ArrowRight, Check } from "lucide-react";
  import { Reveal, SectionTag } from "@/features/career/components/landing/primitives";
  import { skillCategories } from "@/features/career/services/landingData";
  import { useAuth } from "@/features/auth/components/AuthModal";
  import { api } from "@/services/api";
  import { toast } from "sonner";

  const THUMBS = {
    "Programming": "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?crop=entropy&cs=srgb&fm=jpg&q=80&w=600",
    "Artificial Intelligence": "https://images.pexels.com/photos/14314636/pexels-photo-14314636.jpeg?auto=compress&w=600",
    "Communication": "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?crop=entropy&cs=srgb&fm=jpg&q=80&w=600",
    "Leadership": "https://images.unsplash.com/photo-1517048676732-d65bc937f952?crop=entropy&cs=srgb&fm=jpg&q=80&w=600",
    "Interview Preparation": "https://images.unsplash.com/photo-1686771416282-3888ddaf249b?auto=format&fit=crop&w=600&q=80",
    "Cloud": "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?crop=entropy&cs=srgb&fm=jpg&q=80&w=600",
    "Cyber Security": "https://images.pexels.com/photos/36750789/pexels-photo-36750789.jpeg?auto=compress&w=600",
    "Data Science": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?crop=entropy&cs=srgb&fm=jpg&q=80&w=600",
  };

  const coursesByCat = {
    "Programming": [["Full-Stack Web Development", "42 lessons", 4.9, "Build and deploy real web apps end-to-end."], ["Data Structures & Algorithms", "36 lessons", 4.8, "Ace coding interviews with strong fundamentals."], ["Python for Everyone", "28 lessons", 4.9, "Start coding from zero with hands-on projects."]],
    "Artificial Intelligence": [["Machine Learning Foundations", "34 lessons", 4.9, "Learn ML from theory to real models."], ["Deep Learning with PyTorch", "30 lessons", 4.8, "Train neural networks the practical way."], ["Generative AI & LLMs", "22 lessons", 4.9, "Build with the latest LLM and GenAI tools."]],
    "Communication": [["Public Speaking Mastery", "18 lessons", 4.8, "Speak with confidence on any stage."], ["Business Communication", "20 lessons", 4.7, "Write and present like a professional."], ["Storytelling for Impact", "16 lessons", 4.8, "Make your ideas stick and inspire."]],
    "Leadership": [["People Management 101", "24 lessons", 4.8, "Lead teams and grow talent effectively."], ["Decision Making", "18 lessons", 4.7, "Make sharper decisions under pressure."], ["Building High Trust Teams", "20 lessons", 4.9, "Create teams that deliver together."]],
    "Interview Preparation": [["Cracking Tech Interviews", "40 lessons", 4.9, "Master DSA, system design and rounds."], ["Behavioral Rounds", "16 lessons", 4.8, "Tell your story and stand out."], ["Aptitude & Reasoning", "26 lessons", 4.7, "Clear aptitude tests with ease."]],
    "Cloud": [["AWS Cloud Practitioner", "32 lessons", 4.8, "Get cloud-ready and certified."], ["Docker & Kubernetes", "28 lessons", 4.9, "Ship and scale apps with containers."], ["Cloud Architecture", "24 lessons", 4.8, "Design reliable cloud systems."]],
    "Cyber Security": [["Ethical Hacking Basics", "30 lessons", 4.9, "Think like an attacker to defend better."], ["Network Security", "26 lessons", 4.8, "Secure networks end-to-end."], ["Security Analyst Path", "34 lessons", 4.7, "Launch your cybersecurity career."]],
    "Data Science": [["Data Science Bootcamp", "44 lessons", 4.9, "Go from data to decisions."], ["SQL & Analytics", "24 lessons", 4.8, "Query and analyse data confidently."], ["Data Visualization", "20 lessons", 4.8, "Turn data into clear stories."]],
  };

  export default function LearningSection() {
    const [active, setActive] = useState(skillCategories[0].label);

    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [enrolledCourseIds, setEnrolledCourseIds] = useState([]);

    const { isAuthed, openAuth } = useAuth();
    const navigate = useNavigate();

 useEffect(() => {
  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch courses for everyone - before or after login
      const coursesResponse = await api.courses();

      console.log("All Courses:", coursesResponse);

      setCourses(coursesResponse || []);

      // Fetch enrollment only for logged-in users
      if (isAuthed) {
        const enrolledResponse = await api.enrolledCourses();

        console.log("Enrolled Courses:", enrolledResponse);

        const enrolledIds = (enrolledResponse || []).map(
          (course) => course.course_id
        );

        setEnrolledCourseIds(enrolledIds);
      } else {
        setEnrolledCourseIds([]);
      }
    } catch (error) {
      console.error(
        "Failed to fetch courses:",
        error?.response?.data || error
      );
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, [isAuthed]);

  const enroll = async (course) => {
    if (!isAuthed) {
      openAuth(() => navigate("/skillhub"));
      return;
    }

    const courseId = course.id;

    if (!courseId) {
      toast.error("Course ID not found");
      return;
    }

    try {
      await api.enrollCourse(courseId);

      setEnrolledCourseIds((prev) =>
        prev.includes(courseId)
          ? prev
          : [...prev, courseId]
      );

      toast.success("Successfully enrolled!");

      // Navigate to enrolled course
      navigate(`/skillhub/journey/${courseId}`);

    } catch (error) {
      console.error(
        "Enrollment failed:",
        error?.response?.data || error
      );

      toast.error(
        error?.response?.data?.detail ||
        "Enrollment failed"
      );
    }
  };

  const filteredCourses = courses.filter((course) => {
    const courseCategory =
    course.category?.name ||
    course.category_name ||
    course.category ||
    course.skill_category ||
    "Programming";

    return courseCategory.trim().toLowerCase() === active.trim().toLowerCase();
  });

    return (
     <section
  id="skillhub"
  className="relative pt-2 pb-24 lg:pt-3 lg:pb-32"
  data-testid="learning-section"
>
  <div className="mx-auto max-w-7xl px-5 lg:px-8">
    <Reveal className="mx-auto max-w-3xl text-center">
      <SectionTag icon={BookOpen}>SkillHub · LMS</SectionTag>

     <h2 className="mt-6 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl lg:text-[52px]">
  <span className="block leading-[1.15]">
    Learning Becomes Just
  </span>

  <span className="mt-2 block leading-[1.15]">
    <span className="gradient-text">One Part</span> Of MyMentor.
  </span>
</h2>

      <p className="mx-auto mt-6 max-w-2xl text-[18px] leading-relaxed text-slate-600">
        Learning alone doesn't build careers. Projects, Roadmaps, Mentorship,
        Career Readiness and Career Graph together create career success.
      </p>
    </Reveal>

          <div className="mt-16 grid gap-8 lg:grid-cols-[280px_1fr]">
            {/* Sidebar */}
            <Reveal>
              <div className="rounded-3xl border border-slate-100 bg-white p-3 shadow-soft">
                {skillCategories.map((cat) => {
                  const on = active === cat.label;
                  return (
                    <button
                      key={cat.label}
                      onClick={() => setActive(cat.label)}
                      className={`mb-1 flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-[15px] font-semibold transition-colors ${on ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-soft" : "text-slate-600 hover:bg-slate-100"}`}
                      data-testid={`skill-cat-${cat.label.toLowerCase().replace(/\s+/g, "-")}`}
                    >
                      <cat.icon className="h-5 w-5" /> {cat.label}
                    </button>
                  );
                })}
              </div>
            </Reveal>

          {/* Course cards */}
  <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">

    {loading ? (
      <p className="text-slate-500">Login to View Courses.</p>
    ) : filteredCourses.length === 0 ? (
      <p className="text-slate-500">
        No courses available in this category.
      </p>
    ) : (
      filteredCourses.map((course, i) => {
        const isEnrolled = enrolledCourseIds.includes(course.id);

        return (
          <motion.div
            key={course.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            whileHover={{ y: -6 }}
            className="group flex flex-col overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-soft"
          >
            {/* Image */}
            <div className="relative h-36 overflow-hidden">

      <img
    src={
      course.thumbnail ||
      course.thumbnail_url ||
      THUMBS[active]
    }
    alt={course.title}
    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
    onError={(e) => {
      e.currentTarget.onerror = null;
      e.currentTarget.src = THUMBS[active];
    }}
  />

            <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-slate-700 backdrop-blur">
    {course.category?.name ||
      course.category_name ||
      course.category ||
      active}
  </span>

            </div>

            {/* Content */}
            <div className="flex flex-1 flex-col p-6">

              <h3 className="text-[17px] font-bold text-slate-900">
                {course.title}
              </h3>

              <p className="mt-2 line-clamp-2 text-[13px] leading-relaxed text-slate-500">
                {course.description}
              </p>

              <div className="mt-4 flex items-center justify-between text-[13px] text-slate-500">

               <span className="flex items-center gap-1">
  <Clock className="h-4 w-4" />
  {course.level_count || 0}{" "}
  {course.level_count === 1 ? "lesson" : "lessons"}
</span>

                <span className="flex items-center gap-1">
                  <BookOpen className="h-4 w-4" />
                  {course.difficulty || "Beginner"}
                </span>

              </div>

      {isAuthed && (
  <button
    onClick={() => {
      if (isEnrolled) {
        navigate(`/skillhub/journey/${course.id}`);
      } else {
        enroll(course);
      }
    }}
    className={`mt-5 inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-white transition ${
      isEnrolled
        ? "bg-emerald-500 hover:bg-emerald-600"
        : "bg-gradient-to-r from-blue-600 to-cyan-500 hover:opacity-90"
    }`}
  >
    {isEnrolled ? "Continue" : "Enroll Now"}

    <ArrowRight className="h-4 w-4" />
  </button>
)}

            </div>
          </motion.div>
        );
      })
    )}

  </div>
          </div>
        </div>
      </section>
    );
  }
