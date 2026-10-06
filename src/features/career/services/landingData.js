import {
  Sparkles, Compass, Map, GraduationCap, Hammer, Trophy, TrendingUp,
  Award, Target, Rocket, Crown, Users, Lightbulb, HeartHandshake,
  Code2, Brain, MessageSquare, ShieldCheck, Cloud, Database, Presentation,
  FileText, Briefcase, BadgeCheck, LineChart, Building2, School, UserCheck,
  Stethoscope, Landmark, Music, Medal, Cpu,
} from "lucide-react";

/* Navigation */
export const navItems = [
  { label: "SkillHub", href: "/skillhub" },
  { label: "Career Path", href: "/career-path" },
  { label: "Become Mentor", href: "/mentors" },
  { label: "Organisations", href: "/organizations" },
  { label: "Jobs", href: "/jobs" },
  { label: "College", href: "/college-admin/login" },
];

/* Hero floating stats */
export const heroStats = [
  { value: 10000, suffix: "+", label: "Career Plans" },
  { value: 500, suffix: "+", label: "Mentors" },
  { value: 100, suffix: "+", label: "Career Paths" },
  { value: 50, suffix: "+", label: "Skill Programs" },
  { value: 95, suffix: "%", label: "Career Readiness Success" },
];

/* Career Elevator levels */
export const levels = [
  { n: 1, title: "Dream", xp: 100, desc: "Discover your dream career.", icon: Sparkles, state: "completed" },
  { n: 2, title: "Discover", xp: 200, desc: "Unlock careers.", icon: Compass, state: "completed" },
  { n: 3, title: "Plan", xp: 350, desc: "Generate Career Roadmap.", icon: Map, state: "completed" },
  { n: 4, title: "Learn", xp: 500, desc: "Complete SkillHub courses.", icon: GraduationCap, state: "current" },
  { n: 5, title: "Projects", xp: 700, desc: "Build portfolio.", icon: Hammer, state: "locked" },
  { n: 6, title: "Career Graph", xp: 900, desc: "Track achievements.", icon: LineChart, state: "locked" },
  { n: 7, title: "Career Readiness", xp: 1200, desc: "Measure employability.", icon: Target, state: "locked" },
  { n: 8, title: "Placement", xp: 1600, desc: "Prepare interviews.", icon: Briefcase, state: "locked" },
  { n: 9, title: "Career Growth", xp: 2200, desc: "Upskill continuously.", icon: TrendingUp, state: "locked" },
  { n: 10, title: "Leadership", xp: 3000, desc: "Lead teams.", icon: Crown, state: "locked" },
  { n: 11, title: "Mentor", xp: 5000, desc: "Guide others.", icon: HeartHandshake, state: "locked" },
];

/* Transformation timeline */
export const transformationSteps = [
  "Class 9 Student", "Discovers Interests", "Career Assessment", "Chooses Stream",
  "Entrance Preparation", "College", "SkillHub Learning", "Projects", "Career Graph",
  "Career Readiness", "Internship", "Placement", "Career Growth", "Leadership", "Mentor",
];

/* Personas */
export const personas = [
  { name: "Dreamer", icon: Lightbulb, gradient: "from-amber-400 to-orange-500", quote: "I know I want to become something great, but I don't know where to begin.", cta: "Explore Careers" },
  { name: "Explorer", icon: Compass, gradient: "from-blue-500 to-cyan-500", quote: "I'm exploring different career options.", cta: "Discover Career Paths" },
  { name: "Builder", icon: Hammer, gradient: "from-violet-500 to-blue-600", quote: "I've selected my path. Now I want industry skills.", cta: "Build Skills" },
  { name: "Achiever", icon: Trophy, gradient: "from-emerald-500 to-teal-500", quote: "I'm preparing for placements.", cta: "Track Progress" },
  { name: "Climber", icon: TrendingUp, gradient: "from-cyan-500 to-green-500", quote: "I want promotions and career growth.", cta: "Grow Career" },
  { name: "Mentor", icon: HeartHandshake, gradient: "from-purple-500 to-fuchsia-500", quote: "I want to guide the next generation.", cta: "Become Mentor" },
];

/* Career Graph left cards */
export const careerGraphCards = [
  { label: "Resume", icon: FileText, value: "Strong" },
  { label: "Skills", icon: Code2, value: "14 verified" },
  { label: "Projects", icon: Hammer, value: "8 built" },
  { label: "Internships", icon: Briefcase, value: "2 done" },
  { label: "Achievements", icon: Award, value: "23 unlocked" },
  { label: "Career Readiness", icon: Target, value: "72%" },
  { label: "Certificates", icon: BadgeCheck, value: "11" },
  { label: "Mentorship", icon: HeartHandshake, value: "6 sessions" },
];

export const careerGraphTimeline = ["2026", "2027", "2028", "Placement", "Promotion", "Leadership"];

/* Career Readiness */
export const criSkills = [
  { label: "Communication", value: 80 },
  { label: "Technical Skills", value: 65 },
  { label: "Problem Solving", value: 74 },
  { label: "Critical Thinking", value: 69 },
  { label: "Interview Readiness", value: 60 },
  { label: "Soft Skills", value: 76 },
];
export const criBenefits = [
  "Identifies your strengths",
  "Reveals skill gaps",
  "Improves interview preparation",
  "Tracks career growth",
  "Increases employability",
  "Provides personalized recommendations",
  "Helps recruiters understand your profile",
];
export const criImprovements = [
  "Improve Problem Solving",
  "Complete Industry Project",
  "Attend Mock Interview",
  "Improve Communication",
  "Practice Aptitude",
];

/* SkillHub */
export const skillCategories = [
  { label: "Programming", icon: Code2 },
  { label: "Artificial Intelligence", icon: Brain },
  { label: "Communication", icon: MessageSquare },
  { label: "Leadership", icon: Crown },
  { label: "Interview Preparation", icon: Presentation },
  { label: "Cloud", icon: Cloud },
  { label: "Cyber Security", icon: ShieldCheck },
  { label: "Data Science", icon: Database },
];

/* Projects */
export const projects = [
  { title: "Hospital Management", difficulty: "Advanced", duration: "3 weeks", skills: ["React", "Node", "SQL"], score: 250, readiness: 15 },
  { title: "AI Resume Analyzer", difficulty: "Intermediate", duration: "2 weeks", skills: ["Python", "NLP"], score: 220, readiness: 14 },
  { title: "Portfolio Website", difficulty: "Beginner", duration: "1 week", skills: ["HTML", "CSS", "JS"], score: 120, readiness: 8 },
  { title: "Weather Dashboard", difficulty: "Beginner", duration: "1 week", skills: ["React", "APIs"], score: 140, readiness: 9 },
  { title: "Career Recommendation System", difficulty: "Advanced", duration: "4 weeks", skills: ["Python", "ML"], score: 300, readiness: 18 },
  { title: "Expense Tracker", difficulty: "Intermediate", duration: "2 weeks", skills: ["React", "Mongo"], score: 180, readiness: 11 },
  { title: "Student Management System", difficulty: "Intermediate", duration: "3 weeks", skills: ["Java", "SQL"], score: 210, readiness: 13 },
  { title: "Chat Application", difficulty: "Advanced", duration: "3 weeks", skills: ["Sockets", "Node"], score: 260, readiness: 16 },
];

/* Career Inspirations (no photos — tasteful monogram cards) */
export const inspirations = [
  { name: "Sundar Pichai", field: "Technology", role: "CEO, Google", quote: "Keep pushing yourself beyond your comfort zone.", icon: Cpu, gradient: "from-blue-500 to-cyan-500" },
  { name: "Satya Nadella", field: "Technology", role: "CEO, Microsoft", quote: "Don't be a know-it-all. Be a learn-it-all.", icon: Cpu, gradient: "from-blue-600 to-indigo-500" },
  { name: "Dr. A. P. J. Abdul Kalam", field: "Science", role: "Former President · Scientist", quote: "Dream is not what you see in sleep, it is the thing that doesn't let you sleep.", icon: Rocket, gradient: "from-orange-500 to-amber-500" },
  { name: "Ratan Tata", field: "Business", role: "Industrialist", quote: "I don't believe in taking right decisions. I take decisions and make them right.", icon: Building2, gradient: "from-slate-600 to-slate-800" },
  { name: "Indra Nooyi", field: "Business", role: "Former CEO, PepsiCo", quote: "Leadership is hard to define and good leadership even harder.", icon: Briefcase, gradient: "from-rose-500 to-pink-500" },
  { name: "Sridhar Vembu", field: "Entrepreneurship", role: "Founder, Zoho", quote: "Talent is everywhere, opportunity is not. We build opportunity.", icon: Rocket, gradient: "from-emerald-500 to-teal-500" },
  { name: "A. R. Rahman", field: "Music", role: "Composer", quote: "I found my identity in music, and it gave me everything.", icon: Music, gradient: "from-purple-500 to-fuchsia-500" },
  { name: "P. V. Sindhu", field: "Sports", role: "Olympian", quote: "Hard work always pays off, no matter how long it takes.", icon: Medal, gradient: "from-cyan-500 to-blue-500" },
  { name: "Viswanathan Anand", field: "Chess", role: "World Champion", quote: "Chess taught me to think many moves ahead in life.", icon: Crown, gradient: "from-amber-500 to-yellow-500" },
];

/* Success Stories */
export const successStories = [
  { name: "Kavin Kumar", city: "Chennai", role: "Software Engineer", img: "https://images.unsplash.com/photo-1752952952773-80378cefc23d?crop=entropy&cs=srgb&fm=jpg&q=85&w=600", journey: ["Class 11", "Career Discovery", "Engineering Roadmap", "Projects", "Placement"] },
  { name: "Harini Raj", city: "Coimbatore", role: "Doctor", img: "https://images.unsplash.com/photo-1753120879121-678c3d42542e?crop=entropy&cs=srgb&fm=jpg&q=85&w=600", journey: ["NEET", "Medical College", "Clinical Skills", "Doctor"] },
  { name: "Praveen Kumar", city: "Madurai", role: "Data Scientist", img: "https://images.unsplash.com/photo-1737660213008-f5ae44b492da?crop=entropy&cs=srgb&fm=jpg&q=85&w=600", journey: ["Degree", "Python", "AI Projects", "Placement"] },
  { name: "Nivetha S", city: "Salem", role: "UI UX Designer", img: "https://images.unsplash.com/photo-1609371497456-3a55a205d5eb?crop=entropy&cs=srgb&fm=jpg&q=85&w=600", journey: ["Design", "Portfolio", "Internship", "Designer"] },
  { name: "Ashwin R", city: "Tiruchirappalli", role: "IAS Officer", img: "https://images.unsplash.com/photo-1659353220482-554773c2f7fa?crop=entropy&cs=srgb&fm=jpg&q=85&w=600", journey: ["UPSC", "Preparation", "Interview", "IAS"] },
];

/* Comparison */
export const comparisonColumns = ["ChatGPT", "YouTube", "Coursera", "LinkedIn Learning", "College Career Cell", "MyMentor"];
export const comparisonRows = [
  { feature: "Career Discovery",       cells: [true, false, false, false, true, true] },
  { feature: "Career Roadmaps",        cells: [true, false, false, false, false, true] },
  { feature: "Skill Learning",         cells: [false, true, true, true, false, true] },
  { feature: "Career Graph",           cells: [false, false, false, false, false, true] },
  { feature: "Career Readiness Index", cells: [false, false, false, false, false, true] },
  { feature: "Projects",               cells: [false, false, true, false, false, true] },
  { feature: "Internships",            cells: [false, false, false, false, true, true] },
  { feature: "Mentorship",             cells: [false, false, false, false, true, true] },
  { feature: "Career Analytics",       cells: [false, false, false, false, false, true] },
  { feature: "Placement Preparation",  cells: [false, false, false, false, true, true] },
  { feature: "Career Growth",          cells: [false, false, false, true, false, true] },
  { feature: "Progress Tracking",      cells: [false, false, true, true, false, true] },
  { feature: "Industry Readiness",     cells: [false, false, false, false, false, true] },
];

/* Built for everyone */
export const audiences = [
  { title: "Students", icon: GraduationCap, gradient: "from-blue-500 to-cyan-500", img: "https://images.unsplash.com/photo-1758518729685-f88df7890776?crop=entropy&cs=srgb&fm=jpg&q=85&w=700", features: ["Career Discovery", "Career Roadmaps", "Learning", "Projects", "Career Score", "Career Readiness"] },
  { title: "Parents", icon: Users, gradient: "from-emerald-500 to-teal-500", img: "https://images.unsplash.com/photo-1630487656049-6db93a53a7e9?crop=entropy&cs=srgb&fm=jpg&q=85&w=700", features: ["Monitor Progress", "Career Reports", "Recommendations", "Career Planning", "Performance Dashboard"] },
  { title: "Schools", icon: School, gradient: "from-violet-500 to-blue-600", img: "https://images.unsplash.com/photo-1557804506-669a67965ba0?crop=entropy&cs=srgb&fm=jpg&q=85&w=700", features: ["Student Analytics", "Career Programs", "Career Guidance", "Performance Reports"] },
  { title: "Colleges", icon: Building2, gradient: "from-cyan-500 to-green-500", img: "https://images.unsplash.com/photo-1758518731706-be5d5230e5a5?crop=entropy&cs=srgb&fm=jpg&q=85&w=700", features: ["Placement Dashboard", "Career Readiness Reports", "Industry Readiness", "Student Analytics"] },
  { title: "Recruiters", icon: UserCheck, gradient: "from-amber-500 to-orange-500", img: "https://images.unsplash.com/photo-1737574994780-e31827afaed7?crop=entropy&cs=srgb&fm=jpg&q=85&w=700", features: ["Verified Profiles", "Career Scores", "Skill Verification", "Project Portfolio", "Industry Ready Candidates"] },
  { title: "Mentors", icon: HeartHandshake, gradient: "from-purple-500 to-fuchsia-500", img: "https://images.unsplash.com/photo-1589386417686-0d34b5903d23?crop=entropy&cs=srgb&fm=jpg&q=85&w=700", features: ["Share Knowledge", "Earn Income", "Book Sessions", "Guide Students", "Mentor Dashboard"] },
];

/* Career Insights */
export const insightCards = [
  { label: "Career Score", value: 812, suffix: "", kind: "counter", accent: "#2563EB" },
  { label: "Career Readiness", value: 72, suffix: "%", kind: "ring", accent: "#06B6D4" },
  { label: "Resume Strength", value: 88, suffix: "%", kind: "bar", accent: "#22C55E" },
  { label: "Interview Readiness", value: 64, suffix: "%", kind: "bar", accent: "#7C3AED" },
  { label: "Skill Growth", value: 41, suffix: "%", kind: "line", accent: "#2563EB" },
  { label: "Placement Probability", value: 79, suffix: "%", kind: "ring", accent: "#22C55E" },
  { label: "Industry Match", value: 83, suffix: "%", kind: "bar", accent: "#06B6D4" },
  { label: "Learning Progress", value: 67, suffix: "%", kind: "line", accent: "#F59E0B" },
  { label: "Projects Completed", value: 8, suffix: "", kind: "counter", accent: "#7C3AED" },
  { label: "Career Momentum", value: 92, suffix: "%", kind: "ring", accent: "#2563EB" },
];

/* Mentors */
export const mentors = [
  { name: "Arjun Menon", role: "Software Engineer", company: "Google", img: "https://images.unsplash.com/photo-1737574994780-e31827afaed7?crop=entropy&cs=srgb&fm=jpg&q=85&w=500", exp: "8 yrs", languages: ["English", "Tamil"], skills: ["System Design", "DSA", "Backend"], rating: 4.9, availability: "Available today", duration: "45 min", price: 799 },
  { name: "Divya Krishnan", role: "Product Manager", company: "Microsoft", img: "https://images.unsplash.com/photo-1581322929625-f4aab333778a?crop=entropy&cs=srgb&fm=jpg&q=85&w=500", exp: "10 yrs", languages: ["English", "Hindi"], skills: ["Roadmapping", "Strategy", "UX"], rating: 4.8, availability: "Available today", duration: "45 min", price: 999 },
  { name: "Dr. Karthik R", role: "Doctor", company: "Apollo Hospitals", img: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?crop=entropy&cs=srgb&fm=jpg&q=85&w=500", exp: "12 yrs", languages: ["English", "Tamil"], skills: ["NEET Guidance", "Clinical", "Residency"], rating: 4.9, availability: "Available tomorrow", duration: "30 min", price: 699 },
  { name: "Sanjay Iyer", role: "Data Scientist", company: "Amazon", img: "https://images.unsplash.com/photo-1784483323534-3460c079d0c1?crop=entropy&cs=srgb&fm=jpg&q=85&w=500", exp: "7 yrs", languages: ["English", "Telugu"], skills: ["ML", "Python", "Analytics"], rating: 4.8, availability: "Available today", duration: "45 min", price: 899 },
  { name: "Meera Nair", role: "Chartered Accountant", company: "Deloitte", img: "https://images.unsplash.com/photo-1739785248579-cd43cdaac06b?crop=entropy&cs=srgb&fm=jpg&q=85&w=500", exp: "9 yrs", languages: ["English", "Malayalam"], skills: ["Audit", "Taxation", "Finance"], rating: 4.7, availability: "Available today", duration: "40 min", price: 799 },
  { name: "Rahul Verma", role: "IAS Officer", company: "Government of India", img: "https://images.unsplash.com/photo-1659353220482-554773c2f7fa?crop=entropy&cs=srgb&fm=jpg&q=85&w=500", exp: "11 yrs", languages: ["English", "Hindi"], skills: ["UPSC", "Interview", "Essay"], rating: 5.0, availability: "Available this week", duration: "60 min", price: 999 },
];

/* Pricing */
export const pricingTiers = [
  {
    name: "Starter", price: 199, badge: null, cta: "Start Now", highlight: false,
    features: ["Career Discovery", "Basic Career Roadmaps", "Career Dashboard", "Career Search", "Community Access", "Basic SkillHub Access"],
  },
  {
    name: "Pro", price: 499, badge: "Most Popular", cta: "Go Pro", highlight: true,
    features: ["Everything in Starter", "Career Readiness Index", "Career Graph", "Unlimited Career Roadmaps", "Projects", "Mock Interviews", "Advanced SkillHub", "Priority Support"],
  },
  {
    name: "Premium", price: 999, badge: "Recommended", cta: "Become Career Ready", highlight: false,
    features: ["Everything in Pro", "Unlimited Mentor Sessions", "Placement Preparation", "Resume Review", "Career Coach", "Interview Practice", "Exclusive Workshops", "Premium Support", "Career Analytics"],
  },
];

/* FAQ */
export const faqs = [
  { q: "What is MyMentor?", a: "MyMentor is India's first Career Operating System — a lifelong platform that guides you from career discovery to placement and beyond, combining Career Intelligence, Roadmaps, SkillHub, Projects, Mentorship and a live Career Readiness Index." },
  { q: "Who can use MyMentor?", a: "Students, professionals, parents, schools, colleges, recruiters and mentors. Everyone in the career ecosystem gets a tailored experience." },
  { q: "Is MyMentor only for students?", a: "No. While students form our core, professionals use MyMentor for upskilling and growth, and mentors use it to guide the next generation and earn income." },
  { q: "How does the Career Readiness Index work?", a: "Your CRI is a live score (0–100) that measures employability across communication, technical skills, problem solving and more. It updates automatically as you learn, build projects, take assessments and attend mentorship." },
  { q: "How is MyMentor different from ChatGPT?", a: "ChatGPT answers questions. MyMentor connects your entire career — discovery, roadmaps, learning, projects, readiness, mentorship, analytics and placement — into one structured operating system." },
  { q: "Can parents monitor progress?", a: "Yes. Parents get a dedicated dashboard with career reports, recommendations and performance tracking for their child." },
  { q: "Can colleges use MyMentor?", a: "Absolutely. Colleges get placement dashboards, career readiness reports, industry-readiness scoring and student analytics." },
  { q: "How do mentor sessions work?", a: "Browse verified mentors, view their expertise, rating and availability, then book a one-on-one session. Sessions are conducted online at your chosen time." },
  { q: "Will MyMentor help with placements?", a: "Yes. Premium includes placement preparation, resume review, mock interviews and interview practice to make you fully industry-ready." },
  { q: "Can professionals use MyMentor?", a: "Yes. Professionals use MyMentor to plan promotions, upskill continuously, track their Career Graph and grow into leadership roles." },
];

/* Footer */
export const footerColumns = [
  { title: "Company", links: ["About", "Careers", "Blog", "Press"] },
  { title: "Platform", links: ["SkillHub", "Career Path", "Career Score", "Career Graph", "Career Readiness"] },
  { title: "Resources", links: ["Help Center", "Documentation", "Privacy Policy", "Terms"] },
];
