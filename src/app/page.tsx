import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white font-sans">
      <h1 className="text-4xl mb-6">Welcome</h1>
      <p className="text-lg mb-10 text-gray-300">
        Discover how our demo works in one click.
      </p>
      <Link
        href="/Mapbox"
        className="border border-white rounded-lg text-white px-6 py-3 text-lg hover:bg-white hover:text-black transition"
      >
        Demo
      </Link>
    </div>
  );
}
