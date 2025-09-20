'use client';

import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

const Loader: React.FC = () => {
  const [progress, setProgress] = useState(0);
  const loaderRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Initial setup - hide everything
      gsap.set([loaderRef.current, textRef.current, progressBarRef.current], {
        opacity: 0,
        y: 50
      });

      // Animate loader entrance
      const tl = gsap.timeline();
      
      tl.to(loaderRef.current, {
        opacity: 1,
        duration: 0.8,
        ease: "power2.out"
      })
      .to(textRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: "power2.out"
      }, "-=0.4")
      .to(progressBarRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: "power2.out"
      }, "-=0.3");

      // Progress animation
      let currentProgress = 0;
      const progressInterval = setInterval(() => {
        currentProgress += Math.random() * 15 + 5; // Random increment between 5-20
        
        if (currentProgress >= 100) {
          currentProgress = 100;
          clearInterval(progressInterval);
          
          // Complete animation and redirect
          setTimeout(() => {
            gsap.to(overlayRef.current, {
              opacity: 1,
              duration: 0.8,
              ease: "power2.inOut",
              onComplete: () => {
                router.push('/register');
              }
            });
          }, 500);
        }
        
        setProgress(currentProgress);
      }, 150);

      // Animate progress bar width
      const progressFill = progressBarRef.current?.querySelector('.progress-fill');
      if (progressFill) {
        gsap.to(progressFill, {
          width: '100%',
          duration: 3.5,
          ease: "power2.out"
        });
      }

    }, loaderRef);

    return () => {
      ctx.revert();
    };
  }, [router]);

  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
      {/* Overlay for exit animation */}
      <div 
        ref={overlayRef}
        className="absolute inset-0 bg-white opacity-0"
      />
      
      <div ref={loaderRef} className="text-center px-4 sm:px-6 lg:px-8">
        {/* Logo and text */}
        <div ref={textRef} className="mb-8 sm:mb-12">
          <div className="mb-4 sm:mb-6 flex justify-center">
            <Image 
              src="/SGA.webp" 
              alt="SGA Logo" 
              className="h-16 sm:h-20 md:h-24 lg:h-28 xl:h-32 w-auto object-contain"
            />
          </div>
        </div>

        {/* Progress bar container */}
        <div ref={progressBarRef} className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg mx-auto">
          <div className="relative">
            {/* Background bar */}
            <div className="h-0.5 sm:h-1 bg-gray-800 rounded-full overflow-hidden">
              {/* Progress fill */}
              <div 
                className="progress-fill h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            
            {/* Progress percentage */}
            <div className="mt-3 sm:mt-4 text-center">
              <span className="text-lg sm:text-xl md:text-2xl font-bold text-white">
                {Math.round(progress)}%
              </span>
            </div>
          </div>
        </div>

        {/* Loading dots animation */}
        <div className="mt-6 sm:mt-8 flex justify-center space-x-1 sm:space-x-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full animate-pulse"
              style={{
                animationDelay: `${i * 0.2}s`,
                animationDuration: '1s'
              }}
            />
          ))}
        </div>

        {/* Additional mobile-friendly loading text */}
        <div className="mt-4 sm:mt-6">
          <p className="text-xs sm:text-sm text-gray-400 font-light">
            Loading your experience...
          </p>
        </div>
      </div>
    </div>
  );
};

export default Loader;
