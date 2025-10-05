"use client";
import React, { Suspense, useRef, useEffect } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
import Model3D from "@/components/Model3D";

// Component to reset camera position on mount
const CameraReset = () => {
  const { camera } = useThree();
  
  useEffect(() => {
    // Reset camera position to origin
    camera.position.set(0, 0, 0);
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
  }, [camera]);
  
  return null;
};

const ResultPage = () => {
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  useEffect(() => {
    // Only reload once - check if we've already reloaded
    if (!sessionStorage.getItem('hasReloaded')) {
      sessionStorage.setItem('hasReloaded', 'true');
      window.location.reload();
    }

    // Reset the flag when user navigates away from this page
    const handleBeforeUnload = () => {
      sessionStorage.removeItem('hasReloaded');
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    // Cleanup
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  const handleAnalyseClick = () => {
    setIsModalOpen(true);
  };

  return (
    <div className="w-full h-screen bg-[#0D3028] relative">
      <Canvas
        camera={{ 
          position: [0, 0, 0], 
          fov: 50,
          near: 0.1,
          far: 1000
        }}
        style={{ width: '100%', height: '100%' }}
      >
        {/* Lighting */}
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <pointLight position={[-10, -10, -5]} intensity={0.5} />
        
        {/* Environment for better reflections */}
        <Environment preset="studio" />
        
        {/* Reset camera position on mount */}
        <CameraReset />
        
        {/* 3D Model */}
        <Suspense fallback={null}>
          <Model3D modelPath="/Untitled.glb" />
        </Suspense>
        
        {/* Camera controls - zoomed in and restricted */}
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
      
      {/* Analyse Button - Bottom Center */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
        <button 
          onClick={handleAnalyseClick}
          className="bg-[#D4FF5C]/10 backdrop-blur-md border border-[#D4FF5C]/20 text-black font-inter text-lg py-4 px-8 rounded-full transition-all duration-500 hover:scale-[1.08] hover:bg-[#D4FF5C]/20 hover:shadow-[0_0_20px_rgba(212,255,92,0.5)] shadow-lg"
        >
          Analyse
        </button>
      </div>

      {/* Environmental Impact Analysis Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0D3028] border border-[#D4FF5C]/20 rounded-3xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-[0_0_25px_rgba(212,255,92,0.15)]">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-[#D4FF5C] text-3xl font-bold">🌡️ Energy Leak Analysis</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-white/60 hover:text-white text-2xl transition-colors"
              >
                ×
              </button>
            </div>

            {/* Analysis Results */}
            <div className="space-y-6">
              {/* Problem Statement */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <h3 className="text-white text-xl font-semibold mb-3">🏨 Hotel Room Thermal Analysis</h3>
                <p className="text-white/80 leading-relaxed">
                  We analyzed the 3D model and captured thermal imaging of the hotel room you stayed at. Our heat signature analysis reveals significant energy leaks causing HVAC system inefficiency.
                </p>
              </div>

              {/* Thermography Image */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <h4 className="text-white text-lg font-semibold mb-4">📸 Thermal Imaging Analysis</h4>
                <div className="relative">
                  <img 
                    src="/thermography-building-infratec-building-facade-04.png" 
                    alt="Thermal imaging of hotel room showing heat signatures"
                    className="w-full h-auto rounded-xl border border-white/20"
                  />
                  <div className="absolute top-4 left-4 bg-red-500/90 text-white px-3 py-1 rounded-full text-sm font-medium">
                    🔥 High Heat Signature
                  </div>
                  <div className="absolute bottom-4 right-4 bg-blue-500/90 text-white px-3 py-1 rounded-full text-sm font-medium">
                    ❄️ Cool Zones
                  </div>
                </div>
                <p className="text-white/70 text-sm mt-3">
                  Red zones indicate heat leaks, blue zones show proper insulation. Analysis reveals 8 major leak points.
                </p>
              </div>

              {/* Key Findings */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6">
                  <h4 className="text-red-400 text-lg font-semibold mb-3">🔥 Heat Leak Zones</h4>
                  <ul className="text-white/80 space-y-2">
                    <li>• Window frames: 4 major leak points</li>
                    <li>• AC unit seal: 2 thermal bridges</li>
                    <li>• Door threshold: 1 air gap</li>
                    <li>• Wall corners: 3 weak points</li>
                    <li>• Total leak area: 2.3 m²</li>
                  </ul>
                </div>

                <div className="bg-orange-500/10 border border-orange-500/20 rounded-2xl p-6">
                  <h4 className="text-orange-400 text-lg font-semibold mb-3">⚡ HVAC System Impact</h4>
                  <ul className="text-white/80 space-y-2">
                    <li>• Compressor runtime: +35% overtime</li>
                    <li>• Energy consumption: +420 kWh/month</li>
                    <li>• System efficiency: 58% (vs 85% optimal)</li>
                    <li>• Maintenance cycles: 2x more frequent</li>
                  </ul>
                </div>
              </div>

              {/* Environmental Impact */}
              <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-6">
                <h4 className="text-green-400 text-xl font-semibold mb-4">🌍 Climate Impact Analysis</h4>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-[#D4FF5C] mb-2">5,040 kWh</div>
                    <div className="text-white/70">Annual Energy Waste</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-[#D4FF5C] mb-2">2.6 tons</div>
                    <div className="text-white/70">CO₂ Emissions</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-[#D4FF5C] mb-2">$605</div>
                    <div className="text-white/70">Annual Cost</div>
                  </div>
                </div>
                <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                  <p className="text-red-300 text-sm">
                    <strong>Compressor Overtime Impact:</strong> Due to heat leaks, the AC compressor runs 35% longer, 
                    consuming 420 kWh extra per month and increasing wear by 2x, leading to higher maintenance costs and reduced lifespan.
                  </p>
                </div>
              </div>

              {/* Recommendations */}
              <div className="bg-[#D4FF5C]/10 border border-[#D4FF5C]/20 rounded-2xl p-6">
                <h4 className="text-[#D4FF5C] text-xl font-semibold mb-4">💡 Recommended Actions</h4>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <span className="text-[#D4FF5C] text-lg">1.</span>
                    <div>
                      <div className="text-white font-medium">Seal Window Frames</div>
                      <div className="text-white/70">Caulk and weatherstrip → Save 1,680 kWh/year ($202)</div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="text-[#D4FF5C] text-lg">2.</span>
                    <div>
                      <div className="text-white font-medium">Fix AC Unit Seal</div>
                      <div className="text-white/70">Proper installation → Reduce compressor overtime by 25%</div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="text-[#D4FF5C] text-lg">3.</span>
                    <div>
                      <div className="text-white font-medium">Insulate Wall Corners</div>
                      <div className="text-white/70">Spray foam insulation → Cut energy loss by 45%</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Impact Summary */}
              <div className="bg-gradient-to-r from-[#D4FF5C]/10 to-green-500/10 border border-[#D4FF5C]/20 rounded-2xl p-6 text-center">
                <h4 className="text-[#D4FF5C] text-2xl font-bold mb-3">🌱 Environmental Impact</h4>
                <p className="text-white/90 text-lg leading-relaxed">
                  Fixing these energy leaks would save <span className="text-[#D4FF5C] font-bold">2.6 tons of CO₂ annually</span> — 
                  equivalent to planting <span className="text-[#D4FF5C] font-bold">59 trees</span> or removing 
                  <span className="text-[#D4FF5C] font-bold"> 1 car from the road</span> for 1.3 years.
                </p>
                <div className="mt-4 grid grid-cols-2 gap-4 text-center">
                  <div className="bg-white/10 rounded-xl p-4">
                    <div className="text-2xl font-bold text-[#D4FF5C]">$605</div>
                    <div className="text-white/70 text-sm">Annual Savings</div>
                  </div>
                  <div className="bg-white/10 rounded-xl p-4">
                    <div className="text-2xl font-bold text-[#D4FF5C]">3,360 kWh</div>
                    <div className="text-white/70 text-sm">Energy Saved</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Close Button */}
            <div className="mt-8 text-center">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="bg-[#D4FF5C] text-[#0D3028] font-inter text-lg py-3 px-8 rounded-full transition-all duration-500 hover:scale-[1.05] hover:shadow-[0_0_20px_rgba(212,255,92,0.5)]"
              >
                Close Analysis
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultPage;
