"use client";
import React, { Suspense, useEffect } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
import Model3D from "@/components/Model3D";

// Icons (feather)
import { FiThermometer, FiCamera, FiAlertCircle, FiWind, FiCheckCircle, FiX } from "react-icons/fi";

/** Reset camera position on mount */
const CameraReset = () => {
  const { camera } = useThree();

  useEffect(() => {
    camera.position.set(0, 0, 0);
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
  }, [camera]);

  return null;
};

const ResultPage = () => {
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const handleAnalyseClick = () => {
    setIsModalOpen(true);
  };

  return (
    <div className="w-full h-screen bg-[#07251F] relative font-sans">
      {/* 3D canvas */}
      <Canvas
        camera={{
          position: [0, 0, 0],
          fov: 50,
          near: 0.1,
          far: 1000,
        }}
        style={{ width: "100%", height: "100%" }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <pointLight position={[-10, -10, -5]} intensity={0.5} />
        <Environment preset="studio" />
        <CameraReset />
        <Suspense fallback={null}>
          <Model3D modelPath="/Untitled.glb" />
        </Suspense>
        <OrbitControls
          enablePan={false}
          enableZoom={true}
          enableRotate={true}
          minDistance={0.5}
          maxDistance={2}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI - Math.PI / 6}
          autoRotate={false}
        />
      </Canvas>

      {/* Analyze Button */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20">
        <button
          onClick={handleAnalyseClick}
          aria-label="Open analysis"
          className="inline-flex items-center gap-3 bg-[#1A4A2A] border border-white/10 text-[#D4FF5C] text-base py-3 px-7 rounded-full shadow-lg backdrop-blur-sm transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#D4FF5C]/30"
        >
          <FiCheckCircle className="w-5 h-5 text-[#D4FF5C]" />
          <span className="font-medium">Analyse</span>
        </button>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          {/* backdrop */}
          <div
            className="absolute inset-0 bg-black/55 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          />

          {/* Glass panel */}
          <div className="relative z-10 w-full max-w-6xl max-h-[95vh] overflow-y-auto rounded-3xl p-8">
            <div className="bg-[rgba(6,26,23,0.85)] border border-white/8 rounded-2xl p-6 backdrop-blur-[6px] shadow-[0_12px_40px_rgba(0,0,0,0.6)]">
              {/* Header */}
              <div className="flex items-start justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-white/6">
                    <FiThermometer className="w-6 h-6 text-[#D4FF5C]" />
                  </div>
                  <div>
                    <h2 className="text-white text-2xl font-semibold leading-tight">
                      Energy Leak Analysis
                    </h2>
                    <p className="text-white/70 text-sm">
                      Thermal scan & HVAC efficiency overview
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 rounded-md hover:bg-white/6 transition-colors"
                >
                  <FiX className="w-6 h-6 text-white/70" />
                </button>
              </div>

              {/* Main Content */}
              <div className="space-y-6">
                {/* Problem Statement */}
                <section className="bg-white/5 border border-white/10 rounded-xl p-5">
                  <h3 className="flex items-center gap-3 text-white text-lg font-medium mb-2">
                    <FiAlertCircle className="w-5 h-5 text-[#D4FF5C]" />
                    Thermal Findings
                  </h3>
                  <p className="text-white/80 text-sm leading-relaxed">
                    We analyzed the 3D model and thermal data. The room exhibits multiple significant
                    energy leak locations leading to increased HVAC runtime and energy waste.
                  </p>
                </section>

                {/* Thermal Image */}
                <section className="bg-white/5 border border-white/10 rounded-xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="flex items-center gap-2 text-white font-medium">
                      <FiCamera className="w-5 h-5 text-[#D4FF5C]" />
                      Thermal Imaging
                    </h4>
                    <div className="text-xs text-white/60">8 detected leak points</div>
                  </div>
                  <div className="flex justify-center mb-4">
                    <div className="w-64 h-48 rounded-lg overflow-hidden border border-white/10">
                      <img
                        src="/thermography-building-infratec-building-facade-04.png"
                        alt="Thermal imaging"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  <p className="text-white/70 text-sm text-center">
                    Hot zones indicate thermal leakage (windows, AC seals, corners). Use targeted
                    sealing and insulation to address the main points.
                  </p>
                </section>

                {/* Heat Leak & HVAC Impact */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-[#3b0f0f]/85 backdrop-blur-md border border-white/10 rounded-xl p-6 shadow-lg">
                    <h5 className="flex items-center gap-3 text-white font-bold mb-4 text-lg">
                      <FiWind className="w-6 h-6 text-[#D4FF5C]" />
                      Heat Leak Zones
                    </h5>
                    <ul className="space-y-3 text-white">
                      <li className="bg-white/5 border border-white/10 rounded-lg p-3">
                        Window frames:{" "}
                        <span className="text-[#D4FF5C] font-semibold">4 major leak points</span>
                      </li>
                      <li className="bg-white/5 border border-white/10 rounded-lg p-3">
                        AC unit seal:{" "}
                        <span className="text-[#D4FF5C] font-semibold">2 thermal bridges</span>
                      </li>
                      <li className="bg-white/5 border border-white/10 rounded-lg p-3">
                        Door threshold:{" "}
                        <span className="text-[#D4FF5C] font-semibold">1 air gap</span>
                      </li>
                      <li className="bg-white/5 border border-white/10 rounded-lg p-3">
                        Wall corners:{" "}
                        <span className="text-[#D4FF5C] font-semibold">3 weak points</span>
                      </li>
                      <li className="text-center font-bold mt-4">
                        Total leak area:{" "}
                        <span className="text-[#D4FF5C] font-semibold">2.3 m²</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-[#4a3a0a]/85 backdrop-blur-md border border-white/10 rounded-xl p-6 shadow-lg">
                    <h5 className="flex items-center gap-3 text-white font-bold mb-4 text-lg">
                      <FiAlertCircle className="w-6 h-6 text-[#D4FF5C]" />
                      HVAC System Impact
                    </h5>
                    <ul className="space-y-3 text-white">
                      <li className="bg-white/5 border border-white/10 rounded-lg p-3">
                        Compressor runtime:{" "}
                        <span className="text-[#D4FF5C] font-semibold">+35% overtime</span>
                      </li>
                      <li className="bg-white/5 border border-white/10 rounded-lg p-3">
                        Energy consumption:{" "}
                        <span className="text-[#D4FF5C] font-semibold">+420 kWh/month</span>
                      </li>
                      <li className="bg-white/5 border border-white/10 rounded-lg p-3">
                        System efficiency:{" "}
                        <span className="text-[#D4FF5C] font-semibold">58%</span> (vs 85% optimal)
                      </li>
                      <li className="bg-white/5 border border-white/10 rounded-lg p-3">
                        Maintenance cycles:{" "}
                        <span className="text-[#D4FF5C] font-semibold">2× more frequent</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Environmental Impact */}
                <section className="bg-white/5 border border-white/10 rounded-xl p-5">
                  <h4 className="flex items-center gap-3 text-white font-semibold text-lg mb-3">
                    <FiCheckCircle className="w-5 h-5 text-[#D4FF5C]" />
                    Environmental Impact
                  </h4>
                  <p className="text-white/80 text-sm mb-4">
                    Fixing these energy leaks would save{" "}
                    <span className="text-[#D4FF5C] font-semibold">2.6 tons CO₂</span> annually — equivalent to
                    planting <span className="text-[#D4FF5C] font-semibold">59 trees</span> or removing{" "}
                    <span className="text-[#D4FF5C] font-semibold">1 car</span> from the road for 1.3 years.
                  </p>

                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                      <div className="text-sm text-white/70">Energy Waste</div>
                      <div className="mt-2 text-2xl font-bold text-[#D4FF5C]">5,040 kWh</div>
                    </div>
                    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                      <div className="text-sm text-white/70">CO₂ Emissions</div>
                      <div className="mt-2 text-2xl font-bold text-[#D4FF5C]">2.6 t</div>
                    </div>
                    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                      <div className="text-sm text-white/70">Annual Cost</div>
                      <div className="mt-2 text-2xl font-bold text-[#D4FF5C]">$6050</div>
                    </div>
                  </div>

                  <div className="mt-4 bg-white/5 border border-white/10 rounded-md p-3">
                    <p className="text-white/80 text-sm">
                      <strong className="text-white">Compressor Overtime:</strong> Heat leaks increase compressor
                      runtime by <span className="text-[#D4FF5C] font-semibold">~35%</span> (≈
                      <span className="text-[#D4FF5C] font-semibold">420 kWh/mo</span>), increasing maintenance and
                      reducing lifespan.
                    </p>
                  </div>
                </section>

                {/* Recommendations */}
                <section className="bg-white/5 border border-white/10 rounded-xl p-5">
                  <h4 className="flex items-center gap-2 text-white font-semibold mb-3">
                    <FiCheckCircle className="w-5 h-5 text-[#D4FF5C]" />
                    Recommended Actions
                  </h4>
                  <ol className="space-y-4 text-white text-sm">
                    <li>
                      <strong className="text-[#D4FF5C]">1.</strong> Seal Window Frames —{" "}
                      <span className="text-[#D4FF5C]">Save 1,680 kWh/year ($202)</span>
                    </li>
                    <li>
                      <strong className="text-[#D4FF5C]">2.</strong> Fix AC Unit Seal —{" "}
                      <span className="text-[#D4FF5C]">Reduce compressor overtime by 25%</span>
                    </li>
                    <li>
                      <strong className="text-[#D4FF5C]">3.</strong> Insulate Wall Corners —{" "}
                      <span className="text-[#D4FF5C]">Cut energy loss by 45%</span>
                    </li>
                  </ol>
                </section>
              </div>

              {/* Close Button */}
              <div className="mt-8 text-center">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="inline-flex items-center gap-2 rounded-full px-6 py-2 bg-[#D4FF5C] text-[#052A1F] font-medium shadow-sm hover:scale-[1.02] transition-transform"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultPage;
