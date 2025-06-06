import { FC } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

const HeroSection: FC = () => {
  return (
    <section
      className="
        relative flex items-center justify-center
        w-full 
        h-64 sm:h-80 md:h-96 lg:h-[500px]
        overflow-hidden
        bg-gray-900
      "
    >
      <div className="absolute inset-0 bg-blue-700" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 text-center px-4"
      >
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-white">
          Find Your Dream Home
        </h1>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="text-base sm:text-lg md:text-xl mb-6 text-white/90"
        >
          Browse hundreds of listings across Addis Ababa and beyond.
        </motion.p>
        <Link href="/properties">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="
              px-6 py-3 rounded-full font-medium 
              bg-white text-blue-600 hover:bg-gray-100
              transition
            "
          >
            Browse Listings
          </motion.button>
        </Link>
      </motion.div>
    </section>
  );
};

export default HeroSection;
