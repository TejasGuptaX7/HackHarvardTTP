// ServicesDetailed.jsx (with research papers)
import React from "react";
import Link from "next/link";

const researchPapers = [
  {
    href: "/ResearchPaper1.pdf",
    title: "Evidence for Urban Sustainability Interventions",
    blurb:
      "A peer-reviewed analysis of green-roof and transit-oriented interventions and their quantified benefits in Northeastern US urban neighborhoods.",
  },
  {
    href: "/ResearchPaper2.pdf",
    title: "Carbon & Community: Measuring Local Impact",
    blurb:
      "A multi-year study demonstrating carbon reduction and community co-benefits from localized sustainability programs across major US cities.",
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
        <div className="max-w-6xl mx-auto flex flex-col items-center text-center">
          <div className="bg-[#0d2f2f] text-white text-sm font-medium rounded-full px-4 py-2 inline-block mb-6">
            Research
          </div>

          <h2 className="font-sans text-[#0d2f2f] text-[40px] md:text-5xl lg:text-[56px] leading-none font-normal mb-12">
            Don't believe us,
            <br />
            <span className="font-serif italic">believe them.</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
            {researchPapers.map((paper, idx) => (
              <article
                key={idx}
                className="bg-white rounded-2xl shadow-sm border border-[#e5e7eb] p-6 flex flex-col gap-4 transition-transform hover:-translate-y-1 hover:shadow-md"
              >
                {/* PDF Preview */}
                <div className="w-full overflow-hidden rounded-lg border border-[#e5e7eb]">
                  <iframe
                    src={`${paper.href}#toolbar=0&navpanes=0&scrollbar=0`}
                    title={paper.title}
                    className="w-full h-[180px] border-0"
                  />
                </div>

                {/* Text Content */}
                <div className="flex flex-col justify-between flex-grow text-left">
                  <h3 className="text-[20px] font-semibold text-[#0d2f2f]">
                    {paper.title}
                  </h3>
                  <p className="mt-2 text-sm text-[#374151] leading-relaxed">
                    {paper.blurb}
                  </p>
                </div>

                {/* Buttons */}
                <div className="flex items-center gap-3 mt-4">
                  <a
                    href={paper.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-md text-sm font-semibold bg-[#0d2f2f] text-white hover:opacity-90 transition"
                  >
                    Read full paper
                  </a>
                  <a
                    href={paper.href}
                    download
                    className="px-4 py-2 rounded-md text-sm font-medium border border-[#0d2f2f]/20 text-[#0d2f2f] hover:bg-[#0d2f2f]/5 transition"
                  >
                    Download
                  </a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Industry Filters (unchanged) */}
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
