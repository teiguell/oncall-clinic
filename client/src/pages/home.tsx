import HeroSection from "@/components/home/hero-section";
import SearchSection from "@/components/home/search-section";
import DoctorList from "@/components/home/doctor-list";
import HowItWorks from "@/components/home/how-it-works";
import Testimonials from "@/components/home/testimonials";
import FAQSection from "@/components/home/faq-section";
import CallToAction from "@/components/home/call-to-action";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow">
        <HeroSection />
        <SearchSection />
        <DoctorList />
        <HowItWorks />
        <Testimonials />
        <FAQSection />
        <CallToAction />
      </main>
    </div>
  );
}
