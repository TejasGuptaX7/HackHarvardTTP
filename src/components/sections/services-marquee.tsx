// ServicesMarquee.jsx
"use client";
import React from 'react';

const services = [
  { name: 'Retail Analysis', href: '/retail' },
  { name: 'Restaurant Siting', href: '/restaurant' },
  { name: 'Office Placement', href: '/office' },
  { name: 'Green Score Mapping', href: '/sustainability' },
  { name: 'Demographics', href: '/demographics' },
  { name: 'Competition Analysis', href: '/competition' },
];

const ServicesMarquee = () => {
  return (
    <>
      <style>
        {`
          @keyframes marquee {
            from { transform: translateX(0); }
            to { transform: translateX(-100%); }
          }
          .animate-marquee {
            animation: marquee 40s linear infinite;
          }
        `}
      </style>
      <section className="bg-[#f5e8dd] py-[60px] overflow-hidden">
        <div className="group flex flex-nowrap gap-3">
          <div className="flex shrink-0 animate-marquee items-center gap-3 [animation-play-state:running] group-hover:[animation-play-state:paused]">
            {services.map((service, index) => (
              <a
                key={`marquee-1-${index}`}
                href={service.href}
                className="shrink-0 rounded-full bg-white px-6 py-3 text-base font-medium text-[#0d2f2f] transition-transform duration-300 ease-in-out hover:scale-105"
              >
                {service.name}
              </a>
            ))}
          </div>
          <div aria-hidden="true" className="flex shrink-0 animate-marquee items-center gap-3 [animation-play-state:running] group-hover:[animation-play-state:paused]">
            {services.map((service, index) => (
              <a
                key={`marquee-2-${index}`}
                href={service.href}
                className="shrink-0 rounded-full bg-white px-6 py-3 text-base font-medium text-[#0d2f2f] transition-transform duration-300 ease-in-out hover:scale-105"
              >
                {service.name}
              </a>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default ServicesMarquee;