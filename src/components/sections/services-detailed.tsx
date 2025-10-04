// ServicesDetailed.jsx (Updated version)
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface ServiceCard {
  title: string;
  image: string;
  isGif?: boolean;
  services: string[];
  link: string;
  bgColor: string;
  textColor: string;
  listColor: string;
}

const serviceCards: ServiceCard[] = [
  {
    title: "Location Intelligence",
    image: "https://framerusercontent.com/images/1xX3xW5goqn2AoyZTtsBwXveZw.png",
    services: ["Foot Traffic Analysis", "Demographics", "Competition Mapping", "Market Saturation", "Customer Profiles", "Revenue Projections"],
    link: "/location-intelligence",
    bgColor: "bg-[#0d2f2f]",
    textColor: "text-white",
    listColor: "text-[rgb(255,255,255,0.7)]",
  },
  {
    title: "Sustainability Metrics",
    image: "https://framerusercontent.com/images/YpCUooQAmKKJCOLZQXUGm0Ur08.png?scale-down-to=512",
    services: ["Carbon Footprint", "Waste Management", "Energy Efficiency", "Public Transit Access", "Green Building Score", "Solar Potential", "Tree Coverage"],
    link: "/sustainability",
    bgColor: "bg-[#2a2a2a]",
    textColor: "text-white",
    listColor: "text-[rgb(255,255,255,0.7)]",
  },
  {
    title: "Risk Assessment",
    image: "https://framerusercontent.com/images/OMIsUG3uPCnuEaIwbP5fhrQz8W4.png",
    services: ["Zoning Compliance", "Safety Scores", "Natural Hazards", "Insurance Costs", "Permit Requirements", "Future Development"],
    link: "/risk-assessment",
    bgColor: "bg-[#0d2f2f]",
    textColor: "text-white",
    listColor: "text-[rgb(255,255,255,0.7)]",
  },
  {
    title: "3D Visualization",
    image: "https://framerusercontent.com/images/xyeA2TNLVXIwqYkDNQqV3qaFc.png",
    services: ["Interactive Maps", "Building Models", "Neighborhood Views", "Traffic Patterns", "Environmental Impact Zones"],
    link: "/visualization",
    bgColor: "bg-[#2a2a2a]",
    textColor: "text-white",
    listColor: "text-[rgb(255,255,255,0.7)]",
  },
  {
    title: "AI Recommendations",
    image: "https://framerusercontent.com/images/vj11kWb4zSBN5hTooZVf2xjfA.gif?scale-down-to=512",
    isGif: true,
    services: ["Smart Matching", "Predictive Analytics", "Custom Scoring", "Opportunity Alerts", "Market Trends", "Growth Projections"],
    link: "/ai-recommendations",
    bgColor: "bg-[#d4f6a8]",
    textColor: "text-[#0d2f2f]",
    listColor: "text-[#0d2f2f]/80",
  },
  {
    title: "Export & Reports",
    image: "https://framerusercontent.com/images/4quMGe6lShMNTIF9hXw1NknHYQ.png",
    services: ["One-Page Briefs", "Investment Decks", "Sustainability Reports", "ROI Analysis", "Comparison Charts"],
    link: "/reports",
    bgColor: "bg-[#0d2f2f]",
    textColor: "text-white",
    listColor: "text-[rgb(255,255,255,0.7)]",
  },
];

const serviceFilters = [
  { name: "Retail", href: "/retail" },
  { name: "Restaurant", href: "/restaurant" },
  { name: "Office", href: "/office" },
  { name: "Healthcare", href: "/healthcare" },
  { name: "Education", href: "/education" },
  { name: "Manufacturing", href: "/manufacturing" },
];

const ServicesDetailed = () => {
  return (
    <>
      <section id="services" className="bg-[#f5e8dd] py-16 md:py-24 px-6">
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
          <div className="bg-[#0d2f2f] text-white text-sm font-medium rounded-full px-4 py-2 inline-block mb-6">
            Platform
          </div>
          <h2 className="font-sans text-[#0d2f2f] text-[40px] md:text-5xl lg:text-[56px] leading-none font-normal">
            Everything you need to<br />
            <span className="font-serif italic">make the right choice</span>
          </h2>

          <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12 md:mt-16">
            {serviceCards.map((card, index) => (
              <Link href={card.link} key={index} className="block group">
                <div className={`h-full flex flex-col rounded-3xl p-10 text-left transition-transform duration-300 ease-in-out group-hover:-translate-y-1 group-hover:shadow-xl ${card.bgColor}`}>
                  <div className="mb-8 overflow-hidden rounded-lg">
                    <Image
                      src={card.image}
                      alt={`${card.title} preview`}
                      width={500}
                      height={230}
                      className="w-full h-[230px] object-cover"
                      unoptimized={card.isGif}
                    />
                  </div>
                  <h3 className={`font-display text-[32px] font-bold ${card.textColor}`}>
                    {card.title}
                  </h3>
                  <p className={`mt-4 text-base font-normal leading-relaxed ${card.listColor}`}>
                    {card.services.join(" • ")}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-brand-primary-bg py-16 px-6">
        <div className="max-w-7xl mx-auto bg-white rounded-[40px] p-8 md:p-12">
          <div className="text-center mb-8">
            <h4 className="font-display text-[#0d2f2f] text-2xl font-semibold">
              Explore by industry
            </h4>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {serviceFilters.map((filter) => (
              <Link
                href={filter.href}
                key={filter.name}
                className="block text-[#0d2f2f] text-sm font-medium border border-[#0d2f2f]/20 rounded-full px-5 py-2 transition-colors hover:bg-black/5"
              >
                {filter.name}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default ServicesDetailed;