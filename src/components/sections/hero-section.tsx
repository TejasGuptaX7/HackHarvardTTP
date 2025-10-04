"use client";
import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';

const VideoHeroSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    // Start animation when page loads
    setTimeout(() => setIsVisible(true), 100);

    // Optional: Pause/play video based on scroll
    const handleScroll = () => {
      if (videoRef.current && sectionRef.current) {
        const rect = sectionRef.current.getBoundingClientRect();
        const isInView = rect.top < window.innerHeight && rect.bottom > 0;

        if (isInView) {
          videoRef.current.play();
        } else {
          videoRef.current.pause();
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative h-screen flex items-center justify-center overflow-hidden bg-[#f5f5f5]"
    >
      {/* Video Background */}
      <div className={`absolute inset-0 transition-all duration-1000 ease-out ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
        }`}>
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          className="absolute top-0 left-0 w-full h-full object-cover"
        >
          <source src="/city-animation.mp4" type="video/mp4" />
          <source src="/city-animation.webm" type="video/webm" />
          {/* Fallback image */}
          Your browser does not support the video tag.
        </video>

        {/* Gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/60" />
      </div>

      {/* Text Content */}
      <div className={`relative z-10 text-center px-6 transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
        <div className="max-w-4xl mx-auto">
          <h2 className="text-white text-4xl md:text-5xl lg:text-6xl font-bold mb-6 drop-shadow-2xl">
            Visualize Your Impact
          </h2>
          <p className="text-white/90 text-lg md:text-xl max-w-2xl mx-auto drop-shadow-lg leading-relaxed">
            See how your business fits into the sustainable urban landscape
          </p>
        </div>
      </div>
    </section>
  );
};

const VideoShowcase = () => {
  const [isVisible, setIsVisible] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            entry.target.querySelector('video')?.play();
          }
        });
      },
      { threshold: 0.5 }
    );

    const videoSection = document.querySelector('.video-section');
    if (videoSection) observer.observe(videoSection);

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={videoRef}
      className="video-section relative h-screen flex items-center justify-center bg-[#f5f5f5] overflow-hidden"
    >
      <div className={`absolute inset-0 transition-all duration-1500 ${isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
        <img
          src="/veo3 city.png"
          alt="City visualization"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="relative z-10 text-center px-6">
        <h2 className="text-[#0D3028] text-4xl md:text-5xl font-bold mb-4">
          Visualize Your Impact
        </h2>
        <p className="text-[#0D3028]/70 text-lg max-w-2xl mx-auto">
          See how your business fits into the sustainable urban landscape
        </p>
      </div>
    </section>
  );
};

const HeroSection = () => {
  const [videoVisible, setVideoVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY;
      if (scrolled > 100) {
        setVideoVisible(true);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400;1,700&display=swap');
        
        .font-serif-italic {
          font-family: 'Playfair Display', serif;
          font-style: italic;
        }
        
        .video-container {
          opacity: ${videoVisible ? 1 : 0};
          transform: translateY(${videoVisible ? '0' : '20px'});
          transition: all 1.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
      `}</style>

      <section
        id="hero"
        className="relative bg-[#0D3028] text-white flex flex-col items-center justify-center text-center min-h-screen lg:min-h-[110vh] px-6 py-[160px] md:py-[200px] overflow-hidden"
      >

        {/* Video Background Layer */}
        <div className="video-container absolute inset-0 z-0">
          <img
            src="/veo3 city.png"
            alt="City background"
            className="absolute top-0 left-0 w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0D3028]/70 to-[#0D3028]/90" />
        </div>

        {/* Content Layer */}
        <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
          <h1 className="font-sans font-normal text-[40px] leading-[1.1] md:text-[56px] lg:text-[72px] text-white">
            See your footprint<br />
            <span className="font-serif-italic">before</span> you leave it.
          </h1>
          <p className="mt-6 font-inter font-normal text-[18px] lg:text-[20px] text-[#c5e4a8] max-w-lg">
            Find the perfect location. Balance profit with planet.
          </p>
          <div className="mt-8 md:mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/Mapbox"
              className="bg-white text-[#0D3028] font-inter font-semibold text-base py-3 px-8 rounded-full transition-transform duration-300 ease-in-out hover:scale-[1.02] w-full sm:w-auto text-center"
            >
              View Demo
            </Link>
          </div>
        </div>
      </section>
    </>
  );
};

export { VideoShowcase, VideoHeroSection };
export default HeroSection;