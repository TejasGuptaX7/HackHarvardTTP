"use client"

import dynamic from "next/dynamic";
import { MapProvider } from "../../contexts/MapContext";

const MapView = dynamic(() => import("../../components/MapView"), { ssr: false });
const ChatBot = dynamic(() => import("../../components/ChatBot"), { ssr: false });

export default function HomePage() {
  return (
    <MapProvider>
      <main className="h-full w-full relative">
        <MapView />
        <ChatBot />
      </main>
    </MapProvider>
  );
}
