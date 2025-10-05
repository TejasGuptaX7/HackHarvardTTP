"use client";
import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";

const VideoHeroSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 150);
    const handleScroll = () => {
      if (videoRef.current && sectionRef.current) {
        const rect = sectionRef.current.getBoundingClientRect();
        const inView = rect.top < window.innerHeight && rect.bottom > 0;
        if (inView) videoRef.current.play();
        else videoRef.current.pause();
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative h-screen flex items-center justify-center overflow-hidden bg-[#0D3028]"
    >
      <div
        className={`absolute inset-0 transition-all duration-1000 ease-out ${isVisible ? "opacity-100 scale-100" : "opacity-0 scale-105"
          }`}
      >
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
          Your browser does not support the video tag.
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/70" />
      </div>

      <div
        className={`relative z-10 text-center px-6 transition-all duration-1000 delay-500 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
      >
        <div className="max-w-4xl mx-auto transform hover:scale-[1.03] transition-transform duration-700 ease-out">
          <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-3xl px-10 py-8 md:px-14 md:py-10 shadow-[0_0_25px_rgba(212,255,92,0.15)] transition-all duration-700 hover:bg-white/15 hover:border-[#D4FF5C]/40">
            <h2 className="text-white text-5xl md:text-6xl lg:text-7xl font-bold mb-6 drop-shadow-2xl">
              Visualize Your Impact
            </h2>
            <p className="text-white/90 text-xl md:text-2xl max-w-2xl mx-auto drop-shadow-lg leading-relaxed">
              See how your business fits into the sustainable urban landscape
            </p>
          </div>
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
            entry.target.querySelector("video")?.play();
          }
        });
      },
      { threshold: 0.5 }
    );
    const videoSection = document.querySelector(".video-section");
    if (videoSection) observer.observe(videoSection);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={videoRef}
      className="video-section relative h-screen flex items-center justify-center bg-[#0D3028] overflow-hidden"
    >
      <div
        className={`absolute inset-0 transition-all duration-1500 ${isVisible ? "scale-100 opacity-100" : "scale-95 opacity-0"
          }`}
      >
        <img
          src="/veo3 city.png"
          alt="City visualization"
          className="w-full h-full object-cover transform hover:scale-[1.05] transition-transform duration-[2000ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
        />
      </div>

      <div className="relative z-10 text-center px-6 transform hover:scale-[1.02] transition-transform duration-700 ease-out">
        <h2 className="text-[#D4FF5C] text-5xl md:text-6xl font-bold mb-4 drop-shadow-2xl">
          Visualize Your Impact
        </h2>
        <p className="text-white/80 text-xl max-w-2xl mx-auto">
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
      if (scrolled > 100) setVideoVisible(true);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <style jsx>{`
        @import url("https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,700&display=swap");
        .font-serif-italic {
          font-family: "Playfair Display", serif;
          font-style: italic;
        }
        .video-container {
          opacity: ${videoVisible ? 1 : 0};
          transform: translateY(${videoVisible ? "0" : "20px"});
          transition: all 1.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
      `}</style>

      <section
        id="hero"
        className="relative bg-[#0D3028] text-white flex flex-col items-center justify-center text-center min-h-screen lg:min-h-[110vh] px-6 py-[160px] md:py-[200px] overflow-hidden"
      >
        <div className="video-container absolute inset-0 z-0">
          <img
            src="/veo3 city.png"
            alt="City background"
            className="absolute top-0 left-0 w-full h-full object-cover opacity-30 transform hover:scale-[1.05] transition-transform duration-[3000ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0D3028]/70 to-[#0D3028]/90" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto flex flex-col items-center transform hover:scale-[1.02] transition-transform duration-700 ease-out">
          <h1 className="font-sans text-[48px] leading-[1.1] md:text-[68px] lg:text-[84px] text-white">
            See your footprint<br />
            <span className="font-serif-italic text-[#D4FF5C]">before</span> you leave it.
          </h1>
          <p className="mt-8 font-inter text-[22px] lg:text-[24px] text-[#c5e4a8] max-w-2xl">
            Find the perfect location. Balance profit with planet.
          </p>
          <div className="mt-10 md:mt-14 flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link
              href="/Mapbox"
              className="bg-[#D4FF5C] text-[#0D3028] font-inter text-lg py-4 px-10 rounded-full transition-all duration-500 hover:scale-[1.08] hover:shadow-[0_0_20px_rgba(212,255,92,0.5)] w-full sm:w-auto text-center"
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
