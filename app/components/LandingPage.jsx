import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaFacebook, FaGithub, FaInstagram, FaLinkedin } from 'react-icons/fa6';

const LandingPage = () => {
   // Animation Variants
   const fadeUp = {
      hidden: { opacity: 0, y: 30 },
      visible: {
         opacity: 1,
         y: 0,
         transition: { duration: 0.8, ease: 'easeOut' },
      },
   };

   const imageRevealLeft = {
      hidden: { opacity: 0, x: -50 },
      visible: {
         opacity: 1,
         x: 0,
         transition: { duration: 1, ease: 'easeOut' },
      },
   };

   const imageRevealRight = {
      hidden: { opacity: 0, x: 50 },
      visible: {
         opacity: 1,
         x: 0,
         transition: { duration: 1, ease: 'easeOut', delay: 0.2 },
      },
   };

   const frameDraw = {
      hidden: { opacity: 0, scale: 0.95 },
      visible: {
         opacity: 1,
         scale: 1,
         transition: { duration: 1.2, ease: 'easeInOut', delay: 0.4 },
      },
   };

   const staggerContainer = {
      hidden: { opacity: 0 },
      visible: {
         opacity: 1,
         transition: {
            staggerChildren: 0.2,
            delayChildren: 0.8,
         },
      },
   };

   const useIsLargeScreen = () => {
      const [isLarge, setIsLarge] = useState(false);

      useEffect(() => {
         const media = window.matchMedia('(min-width: 1024px)');

         const handleChange = () => setIsLarge(media.matches);
         handleChange();

         media.addEventListener('change', handleChange);
         return () => media.removeEventListener('change', handleChange);
      }, []);

      return isLarge;
   };

   const isLarge = useIsLargeScreen();

   return (
      // 1. Changed to h-[100dvh] to lock height, added flex flex-col to manage vertical space
      <div className="h-[100dvh] w-full bg-[#fdfdfd] text-black overflow-hidden font-sans flex flex-col">
         {/* Header Navigation - Added shrink-0 so it doesn't squish */}
         <motion.header
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="w-full flex items-center justify-between px-6 py-4 lg:px-16 lg:py-8 relative z-50 shrink-0">
            <div className="flex-1" />
            {/* <h1
               className="text-3xl md:text-4xl lg:text-5xl tracking-wide text-[#c09a74]"
               style={{
                  fontFamily: "'Playfair Display', serif",
                  fontStyle: 'italic',
               }}>
               Do Immigration
            </h1> */}
            <motion.div
               initial={{ opacity: 0, y: isLarge ? -100 : 100 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{
                  type: 'spring',
                  stiffness: 260,
                  damping: 20,
                  delay: 1.2,
               }}
               className="fixed bottom-2 lg:top-8 left-1/2 z-50 -translate-x-1/2 ">
               <div
                  className={`flex items-center gap-6 rounded-full border px-8 py-4 backdrop-blur-2xl transition-all duration-500 hover:scale-105 border-[#505050] bg-white/50 text-gray-800 shadow-[0_8px_32px_0_rgba(31,38,135,0.15)]`}>
                  <div className="flex items-center gap-8 sm:gap-10">
                     <FaInstagram
                        className={`h-5 w-5 cursor-pointer transition-all hover:scale-125 hover:text-[#c09a74]
                        }`}
                     />
                     <FaGithub
                        className={`h-5 w-5 cursor-pointer transition-all hover:scale-125 
                           hover:text-[#c09a74]
                        `}
                     />
                     <FaLinkedin
                        className={`h-5 w-5 cursor-pointer transition-all hover:scale-125
                          hover:text-[#c09a74]
                        `}
                     />
                     <FaFacebook
                        className={`h-5 w-5 cursor-pointer transition-all hover:scale-125
                          hover:text-[#c09a74]
                        `}
                     />
                  </div>
               </div>
            </motion.div>
            <div className="flex-1 flex justify-end">
               <button className="flex flex-col items-end space-y-1 lg:space-y-2 group">
                  <span className="w-6 lg:w-10 h-[2px] bg-black block transition-all duration-300 group-hover:w-10 lg:group-hover:w-12"></span>
                  <span className="w-4 lg:w-7 h-[2px] bg-black block transition-all duration-300 group-hover:w-10 lg:group-hover:w-12"></span>
                  <span className="w-5 lg:w-9 h-[2px] bg-black block transition-all duration-300 group-hover:w-10 lg:group-hover:w-12"></span>
               </button>
            </div>
         </motion.header>

         {/* 2. Main Content - flex-1 takes exact remaining height, min-h-0 prevents overflow */}
         <main className="flex-1 min-h-0 w-full max-w-[1400px] mx-auto flex flex-col lg:flex-row relative px-4 lg:px-8 pb-4 lg:pb-12">
            {/* Left Side: Images (Takes top half on mobile, left 65% on desktop) */}
            <div className="w-full h-1/2 lg:w-[65%] lg:h-full relative flex items-center justify-center z-10">
               {/* Decorative Outline Frame - using percentages for boundaries */}
               <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={frameDraw}
                  className="absolute left-[30%] lg:left-[47%] top-[5%] bottom-[5%] w-[50%] lg:w-[60%] border-2 border-[#505050] z-10"
               />

               {/* Background Watch Image */}
               <motion.img
                  initial="hidden"
                  animate="visible"
                  variants={imageRevealLeft}
                  src="https://images.unsplash.com/photo-1524592094714-0f0654e20314?q=80&w=1200&auto=format&fit=crop"
                  alt="Premium Silver Watch"
                  className="absolute left-0 top-[10%] w-[65%] lg:w-[60%] h-[80%] object-cover z-0 shadow-sm rounded-sm"
               />

               {/* Foreground Detail Watch Image */}
               <motion.img
                  initial="hidden"
                  animate="visible"
                  variants={imageRevealRight}
                  src="https://images.unsplash.com/photo-1547996160-81dfa63595aa?q=80&w=800&auto=format&fit=crop"
                  alt="Luxury Gold Watch Detail"
                  className="absolute left-[50%] lg:left-[56%] top-[20%] w-[45%] lg:w-[40%] h-[60%] object-cover z-20 shadow-2xl rounded-sm"
               />
            </div>

            {/* Right Side: Typography (Takes bottom half on mobile, right 35% on desktop) */}
            <motion.div
               initial="hidden"
               animate="visible"
               variants={staggerContainer}
               className="w-full h-1/2 lg:w-[35%] lg:h-full flex items-center justify-center lg:justify-start relative z-30 mt-4 lg:mt-0">
               {/* Vertical Black Button */}
                <motion.button
                   variants={fadeUp}
                   whileHover={{ scale: 1.05 }}
                   whileTap={{ scale: 0.95 }}
                   className="absolute left-4 lg:left-5 bg-[#505050] text-[#c09a74] px-1.5 py-4 lg:px-3 lg:py-7 uppercase tracking-[0.6em] md:tracking-[0.9em] text-[8px] md:text-sm z-40 hover:bg-[#c09a74] hover:text-[#505050] transition-all duration-300 font-extrabold"
                   style={{
                      writingMode: 'vertical-rl',
                      transform: 'rotate(180deg)',
                      textOrientation: 'upright',
                   }}>
                   BeWatch
                </motion.button>

               {/* Text Content - Scaled down for mobile fit */}
                <div className="absolute right-8 md:right-20 ">
                   <motion.h2
                      variants={fadeUp}
                      className="text-2xl md:text-2xl lg:text-3xl font-bold uppercase tracking-[0.2em] leading-snug text-[#c09a74] mb-3 lg:mb-6">
                      Images
                      <br />
                      Gallery
                   </motion.h2>

                  <motion.p
                     variants={fadeUp}
                     className="text-neutral-600 text-xs md:text-sm lg:text-base leading-loose lg:leading-loose max-w-[180px] lg:max-w-[220px]">
                     <Link
                        to="/gallery"
                        className="hover:text-[#c09a74] transition-colors duration-300">
                        View Gallery
                        <svg
                           width="130"
                           height="15"
                           viewBox="0 0 130 15"
                           fill="none"
                           xmlns="http://www.w3.org/2000/svg">
                           <path
                              d="M0 7H127"
                              stroke="#505050"
                              stroke-width="0.5"
                           />
                           <path
                              d="M124.5 14.5L130 7.5L124.5 0.5"
                              fill="#505050"
                           />
                        </svg>
                     </Link>
                  </motion.p>
               </div>
            </motion.div>
         </main>
      </div>
   );
};

export default LandingPage;
