import Navbar from "@/components/common/Header";
import Hero from "@/features/career/components/landing/Hero";
import ProblemSection from "@/features/career/components/landing/ProblemSection";
import CareerElevator from "@/features/career/components/landing/CareerElevator";
import TransformationTimeline from "@/features/career/components/landing/TransformationTimeline";
import CareerPersonas from "@/features/career/components/landing/CareerPersonas";
import CareerGraph from "@/features/career/components/landing/CareerGraph";
import CareerReadiness from "@/features/career/components/landing/CareerReadiness";
import LearningSection from "@/features/career/components/landing/LearningSection";
import ProjectsSection from "@/features/career/components/landing/ProjectsSection";
import CareerInspirations from "@/features/career/components/landing/CareerInspirations";
import SuccessStories from "@/features/career/components/landing/SuccessStories";
import WhyMyMentor from "@/features/career/components/landing/WhyMyMentor";
import PlatformAudience from "@/features/career/components/landing/PlatformAudience";
import CareerInsights from "@/features/career/components/landing/CareerInsights";
import MentorBooking from "@/features/career/components/landing/MentorBooking";
import Pricing from "@/features/career/components/landing/Pricing";
import FAQ from "@/features/career/components/landing/FAQ";
import CTA from "@/features/career/components/landing/CTA";
import Footer from "@/components/common/Footer";

export default function Landing() {
  return (
    <div className="relative min-h-screen bg-[#F8FAFC]">
      <div className="noise-overlay" />
      <Navbar />
      <main>
        <Hero />
        <ProblemSection />
        <CareerElevator />
        <WhyMyMentor />
        {/* <TransformationTimeline /> */}
        {/* <CareerPersonas /> */}
        <CareerGraph />
        <CareerReadiness />
        <LearningSection />
        <ProjectsSection />
        <CareerInspirations />
        <SuccessStories />
        <PlatformAudience />
        <CareerInsights />
        <MentorBooking />
        <Pricing />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
