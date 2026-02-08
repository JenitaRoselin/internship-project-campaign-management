"use client"; // Required for interactive buttons
import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function Home() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <main className="min-h-screen bg-white flex flex-col md:flex-row items-center justify-center p-10 gap-16">
      
      {/* LEFT SIDE: TEXT AND BUTTONS */}
      <div className="max-w-md">
        <h1 className="text-7xl font-bold text-[#4B0082] mb-10 leading-[1.1]">
          Campaign<br />Manager
        </h1>

        <div className="flex flex-col gap-5">
          {/* Black Get Started Button */}
          <button className="bg-black text-white px-8 py-4 rounded-2xl text-xl font-semibold w-64 shadow-lg hover:opacity-90 transition-opacity">
            Get started
          </button>

          {/* Interactive Log In Button */}
          <Link href="/login">
          <button
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={`
              flex items-center justify-center gap-3 w-64 py-3 rounded-2xl text-xl font-semibold border-2 transition-all duration-300
              ${isHovered 
                ? 'bg-white border-[#5D00B1] text-[#5D00B1]' 
                : 'bg-[#5D00B1] border-[#5D00B1] text-white'}
            `}
          >
            Log in
            {isHovered && (
              <motion.span initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }}>
                👤
              </motion.span>
            )}
          </button>
          </Link>
        </div>
      </div>

      {/* RIGHT SIDE: THE ILLUSTRATION */}
      <div className="flex-1 flex justify-center items-center">
        <img 
        src="/dashboard.png" 
        alt="Campaign Analytics" 
        className="w-full max-w-[800px] h-auto object-contain drop-shadow-2xl"
        />
      </div>
      
    </main>
  );
}