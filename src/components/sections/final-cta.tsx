// FinalCta.jsx
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

const FinalCta: React.FC = () => {
  return (
    <section
      id="cta"
      className="bg-[#0d2f2f] text-white"
    >
      <div className="mx-auto flex max-w-[800px] flex-col items-center py-[100px] px-6 text-center lg:py-[140px]">
        <div className="mb-10">
          <Image
            src="https://framerusercontent.com/images/OzGgYvRDYBzShjWxFi4oNnqf2I.png"
            alt="Location finder icon"
            width={56}
            height={56}
            className="h-14 w-14"
          />
        </div>
        <h2 className="font-display text-[36px] font-normal leading-tight md:text-[48px] lg:text-[64px] lg:leading-[1.1]">
          Your perfect location is{' '}
          <span className="font-serif italic">waiting.</span>
        </h2>
        <p className="mt-8 max-w-lg text-[18px] text-[#b3b3b3] lg:text-[20px]">
          Join hundreds of entrepreneurs making smarter, sustainable location decisions.
        </p>
        <Link
          href="/Mapbox"
          className="bg-[#D4FF5C] text-[#0D3028] font-inter text-lg py-4 px-10 rounded-full transition-all duration-500 hover:scale-[1.08] hover:shadow-[0_0_20px_rgba(212,255,92,0.5)] w-full sm:w-auto text-center"
        >
          View Demo
        </Link>
      </div>
    </section>
  );
};

export default FinalCta;
