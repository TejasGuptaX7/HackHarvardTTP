"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

interface NavLink {
  href: string;
  label: string;
}

const navLinks: NavLink[] = [
  { href: "/#work", label: "Map" },
  { href: "/#services", label: "Features" },
  { href: "/#benefits", label: "Solutions" },
  { href: "/#pricing", label: "Pricing" },
  { href: "/blog", label: "Resources" },
  { href: "mailto:hi@greenpulse.ai", label: "Contact" },
];

export default function HeaderNavigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isExternal = (href: string) => href.startsWith('http') || href.startsWith('mailto');

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ease-out ${
        scrolled ? 'py-1' : 'py-2'
      }`}>
        <nav className={`
          transition-all duration-700 ease-out
          ${scrolled 
            ? 'mx-6 rounded-full backdrop-blur-md bg-gradient-to-r from-white/5 via-white/10 to-white/5 border border-white/10 shadow-2xl shadow-black/20' 
            : 'w-full bg-transparent border-none'
          }
        `}>
          <div className="relative">
            {/* Subtle gradient overlay for depth - only when scrolled */}
            {scrolled && (
              <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent rounded-full pointer-events-none" />
            )}
            
            <div className="relative flex items-center justify-between px-8 py-2">
              {/* Logo */}
              <Link href="/" aria-label="Go to homepage" className="flex items-center">
                <span className="text-2xl font-bold font-poppins tracking-tight text-[#D4FF5C] transition-colors duration-700">
                  GreenPulse
                </span>
              </Link>

              {/* Desktop Navigation - Center */}
              <div className="hidden items-center gap-10 lg:flex absolute left-1/2 transform -translate-x-1/2">
                {navLinks.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className={`font-poppins text-[15px] font-normal transition-all duration-700 ${
                      scrolled 
                        ? 'text-[#D4FF5C] hover:text-white' 
                        : 'text-[#D4FF5C] hover:text-white'
                    }`}
                    target={isExternal(link.href) ? "_blank" : undefined}
                    rel={isExternal(link.href) ? "noopener noreferrer" : undefined}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

              {/* Right Side - Login & CTA */}
              <div className="hidden items-center gap-6 lg:flex">
                <Link
                  href="/login"
                  className={`font-poppins text-[15px] font-bold transition-all duration-700 ${
                    scrolled 
                      ? 'text-[#D4FF5C] hover:text-white' 
                      : 'text-[#D4FF5C] hover:text-white'
                  }`}
                >
                  Login
                </Link>
                <Link
                  href="/get-started"
                  className={`rounded-full px-6 py-2.5 font-manrope text-[15px] font-medium transition-all duration-700 ${
                    scrolled 
                      ? 'bg-white text-[#0D3028] hover:bg-[#D4FF5C] hover:scale-105 hover:shadow-lg' 
                      : 'bg-transparent border border-white text-white hover:bg-white hover:text-[#0D3028]'
                  }`}
                >
                  Try Demo
                </Link>
              </div>

              {/* Mobile Menu Button */}
              <div className="lg:hidden">
                <button 
                  onClick={() => setIsOpen(true)} 
                  className={`transition-colors duration-700 ${
                    scrolled ? 'text-white/80 hover:text-[#D4FF5C]' : 'text-white hover:text-white/80'
                  }`}
                  aria-label="Open menu"
                >
                  <Menu size={24} />
                </button>
              </div>
            </div>
          </div>
        </nav>
      </header>

      {/* Mobile Menu Panel with Glass Effect */}
      <div
        className={`fixed inset-0 z-50 transform transition-transform duration-300 ease-in-out lg:hidden ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-black/60 backdrop-blur-md"
          onClick={() => setIsOpen(false)}
        />
        
        {/* Menu Panel */}
        <div className="absolute right-0 top-0 bottom-0 w-[85%] max-w-md bg-[#0D3028]/95 backdrop-blur-xl">
          <div className="flex h-20 items-center justify-between px-6 border-b border-white/10">
            <span className="text-xl font-bold text-[#D4FF5C] font-poppins">GreenPulse</span>
            <button 
              onClick={() => setIsOpen(false)} 
              className="text-white/80 hover:text-[#D4FF5C] transition-colors" 
              aria-label="Close menu"
            >
              <X size={24} />
            </button>
          </div>
          
          <nav className="mt-8 flex flex-col gap-2 px-6">
            {[...navLinks, { href: "/login", label: "Login" }].map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="font-poppins text-lg font-bold text-[#D4FF5C] py-3 transition-all hover:text-white hover:translate-x-2"
                target={isExternal(link.href) ? "_blank" : undefined}
                rel={isExternal(link.href) ? "noopener noreferrer" : undefined}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/get-started"
              onClick={() => setIsOpen(false)}
              className="mt-6 w-full rounded-full bg-[#D4FF5C] text-[#0D3028] py-3 text-center font-manrope text-lg font-medium transition-all hover:bg-white hover:scale-[1.02]"
            >
              Book a call
            </Link>
          </nav>
        </div>
      </div>
    </>
  );
}