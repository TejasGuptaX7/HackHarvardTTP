// MembershipBenefits.jsx
import React from 'react';
import { MapPin, Leaf, TrendingUp, Shield, BarChart3, Zap } from 'lucide-react';

const benefits = [
  {
    icon: MapPin,
    title: 'Smart Location Analysis',
    description: 'AI-powered recommendations for optimal business placement in any city',
    iconColor: '#0d2f2f',
  },
  {
    icon: Leaf,
    title: 'Sustainability Scoring',
    description: 'Real-time carbon footprint and waste impact metrics for every location',
    iconColor: '#0d2f2f',
  },
  {
    icon: TrendingUp,
    title: 'Profit Meets Planet',
    description: 'Balance business viability with environmental responsibility',
    iconColor: '#0d2f2f',
  },
  {
    icon: Shield,
    title: 'Zoning Risk Assessment',
    description: 'Avoid costly mistakes with comprehensive zoning and safety analysis',
    iconColor: '#0d2f2f',
  },
  {
    icon: BarChart3,
    title: 'Data-Driven Insights',
    description: 'Demographics, competition, and foot traffic analysis in one place',
    iconColor: '#0d2f2f',
  },
  {
    icon: Zap,
    title: '60-Second Reports',
    description: 'From idea to actionable location brief in under a minute',
    iconColor: '#0d2f2f',
  },
];

const MembershipBenefits = () => {
  return (
    <section id="benefits" className="bg-[#0d2f2f] text-white py-20 lg:py-[120px]">
      <div className="container mx-auto">
        <div className="flex flex-col items-center text-center gap-4 mb-16">
          <div className="bg-[#c5e4a8] text-[#0d2f2f] text-sm font-semibold px-5 py-3 rounded-full leading-none">
            Features
          </div>
          <h2 className="font-sans font-normal text-[40px] leading-tight lg:text-[56px] lg:leading-[1.1] tracking-tight">
            Everything you need.<br />
            <span className="font-serif italic"> Nothing you don't.</span>
          </h2>
          <p className="text-lg text-[#b3b3b3] max-w-3xl">
            Stop guessing. Start knowing. Our platform combines business intelligence with environmental impact for smarter location decisions.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <div key={index} className="flex flex-col items-center text-center gap-6">
                <div className="w-[120px] h-[120px] rounded-full bg-[#e5d9ff] flex items-center justify-center shrink-0">
                  <Icon className="w-12 h-12" style={{ color: benefit.iconColor }} />
                </div>
                <div className="flex flex-col gap-2">
                  <h3 className="text-2xl font-bold">{benefit.title}</h3>
                  <p className="text-base text-[#b3b3b3] max-w-xs">{benefit.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default MembershipBenefits;