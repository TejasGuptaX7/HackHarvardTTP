"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const ProcessingPage = () => {
  const [progress, setProgress] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prevProgress) => {
        if (prevProgress >= 100) {
          clearInterval(interval);
          // Redirect to result page after 5 seconds
          setTimeout(() => {
            router.push("/result");
          }, 500);
          return 100;
        }
        return prevProgress + 2; // Increment by 2% every 100ms for 5 seconds total
      });
    }, 100);

    return () => clearInterval(interval);
  }, [router]);

  return (
    <div className="min-h-screen bg-[#0D3028] flex items-center justify-center">
      <div className="text-center px-6">
        <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-3xl px-10 py-8 md:px-14 md:py-10 shadow-[0_0_25px_rgba(212,255,92,0.15)] max-w-md mx-auto">
          <h1 className="text-white text-3xl md:text-4xl font-bold mb-6 drop-shadow-2xl">
            Processing Your Files
          </h1>
          <p className="text-white/90 text-lg mb-8 drop-shadow-lg">
            Please wait while we process your uploaded assets...
          </p>
          
          {/* Loading Bar */}
          <div className="w-full bg-white/20 rounded-full h-3 mb-4">
            <div
              className="bg-[#D4FF5C] h-3 rounded-full transition-all duration-100 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          
          <p className="text-[#D4FF5C] text-sm font-medium">
            {progress}% Complete
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProcessingPage;
