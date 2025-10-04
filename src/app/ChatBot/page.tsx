"use client"

import dynamic from "next/dynamic";

const ChatBot = dynamic(() => import("../../components/ChatBot"), { ssr: false });

export default function HomePage() {
  return (
    <main className="relative bg-white h-screen w-screen">
      <ChatBot />
    </main>
  );
}
