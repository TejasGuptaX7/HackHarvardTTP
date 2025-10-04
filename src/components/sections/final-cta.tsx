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
          href="/get-started"
          className="mt-10 inline-block rounded-full bg-primary py-[18px] px-12 text-lg font-bold text-primary-foreground transition-all duration-300 ease-in-out hover:scale-[1.03] hover:brightness-105"
        >
          Find Your Spot
        </Link>
      </div>
    </section>
  );
};

export default FinalCta;
