"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";

interface NavLink {
  href: string;
  label: string;
}

const navLinks: NavLink[] = [
  { href: "/#work", label: "Map" },
  { href: "/#services", label: "Features" },
  { href: "/#benefits", label: "Solutions" },
];

export default function HeaderNavigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isExternal = (href: string) => href.startsWith("http") || href.startsWith("mailto");

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ease-out ${
          scrolled ? "py-1" : "py-2"
        }`}
      >
        <nav
          className={`transition-all duration-700 ease-out ${
            scrolled
              ? "mx-6 rounded-full border border-white/10 bg-gradient-to-r from-emerald-900/40 via-emerald-800/30 to-teal-900/40 backdrop-blur-md shadow-xl"
              : "w-full bg-transparent border-none"
          }`}
        >
          <div className="relative flex items-center justify-between px-8 py-2">
            <Link href="/" aria-label="Go to homepage" className="flex items-center gap-2">
              <Image
                src="/logo.png"
                alt="CarbonCompass Logo"
                width={52}
                height={52}
                className="rounded-full"
                priority
              />
              <span className="text-2xl font-bold font-poppins tracking-tight text-[#D4FF5C] transition-colors duration-700">
                CarbonCompass
              </span>
            </Link>

            <div className="hidden lg:flex items-center gap-10 absolute left-1/2 -translate-x-1/2">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`font-poppins text-[15px] transition-all duration-500 ${
                    scrolled
                      ? "text-[#D4FF5C] hover:text-white/90"
                      : "text-[#D4FF5C] hover:text-white"
                  }`}
                  target={isExternal(link.href) ? "_blank" : undefined}
                  rel={isExternal(link.href) ? "noopener noreferrer" : undefined}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="hidden lg:flex items-center gap-6">
              <Link
                href="/Mapbox"
                className={`rounded-full px-6 py-2.5 font-manrope text-[15px] font-medium transition-all duration-500 ${
                  scrolled
                    ? "bg-[#D4FF5C] text-[#0D3028] hover:bg-white hover:scale-105 hover:shadow-md"
                    : "border border-white text-white hover:bg-[#D4FF5C] hover:text-[#0D3028]"
                }`}
              >
                Try Demo
              </Link>
            </div>

            <div className="lg:hidden">
              <button
                onClick={() => setIsOpen(true)}
                className={`transition-colors duration-500 ${
                  scrolled
                    ? "text-white/80 hover:text-[#D4FF5C]"
                    : "text-white hover:text-[#D4FF5C]"
                }`}
                aria-label="Open menu"
              >
                <Menu size={24} />
              </button>
            </div>
          </div>
        </nav>
      </header>

      <div
        className={`fixed inset-0 z-50 transform transition-transform duration-300 ease-in-out lg:hidden ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
        <div className="absolute right-0 top-0 bottom-0 w-[85%] max-w-md bg-gradient-to-b from-[#0D3028]/95 to-[#164B3E]/95 backdrop-blur-md shadow-2xl">
          <div className="flex h-20 items-center justify-between px-6 border-b border-white/10">
            <span className="text-xl font-bold text-[#D4FF5C] font-poppins">
              CarbonCompass
            </span>
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
                className="font-poppins text-lg font-semibold text-[#D4FF5C] py-3 transition-all hover:text-white hover:translate-x-2"
                target={isExternal(link.href) ? "_blank" : undefined}
                rel={isExternal(link.href) ? "noopener noreferrer" : undefined}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/Mapbox"
              onClick={() => setIsOpen(false)}
              className="mt-6 w-full rounded-full bg-[#D4FF5C] text-[#0D3028] py-3 text-center font-manrope text-lg font-medium transition-all hover:bg-white hover:scale-[1.03]"
            >
              Try Demo
            </Link>
          </nav>
        </div>
      </div>
    </>
  );
}
