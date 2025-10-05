import HeaderNavigation from "@/components/sections/header-navigation";
import HeroSection, { VideoHeroSection } from "@/components/sections/hero-section";
import ServicesMarquee from "@/components/sections/services-marquee";
import MembershipBenefits from "@/components/sections/membership-benefits";
import ServicesDetailed from "@/components/sections/services-detailed";
import FinalCta from "@/components/sections/final-cta";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <HeaderNavigation />
      
      <main>
        <HeroSection />
        <VideoHeroSection />
        
        <ServicesMarquee />
        <ServicesDetailed />
        <MembershipBenefits />
        <FinalCta />
      </main>
    </div>
  );
}