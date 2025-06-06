'use client';
import { Home, Search, Shield, Smartphone, Handshake, MessageCircle, Map, BrainCircuit, Trophy } from 'lucide-react';
import { useContext } from 'react';
import { ThemeContext } from '@/components/context/ThemeContext';
import { motion } from 'framer-motion';
import UserLayout from '@/components/userLayout/Layout';
import Head from 'next/head';

type Theme = 'light' | 'dark';

interface FeatureCardProps {
  theme: Theme;
  icon: React.ReactNode;
  title: string;
  description: string;
}

export default function AboutPage() {
  const { theme } = useContext(ThemeContext)! as { theme: Theme };

  return (
    <UserLayout>
      <Head>
        <title> Rentify | About</title>
        <meta
          name="description"
          content="Learn more about Rentify, Ethiopia&apos;s premier digital rental marketplace."
        />
        <link rel="canonical" href="/about" />
      </Head>
      <div
        className={`min-h-screen transition-colors duration-300 ${
          theme === 'light' ? 'bg-gray-50' : 'bg-gray-900'
        }`}
      >
        <header
          className={`py-20 px-4 ${
            theme === 'light'
              ? 'bg-indigo-900 text-indigo-100'
              : 'bg-indigo-950 text-indigo-200'
          }`}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-6xl mx-auto text-center"
          >
            <h1
              className={`text-2xl md:text-4xl font-bold mb-6 ${
                theme === 'light' ? 'text-white' : 'text-indigo-100'
              }`}
            >
              Redefining Rental Experiences in Ethiopia
            </h1>
          </motion.div>
        </header>

        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <motion.h2
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`text-3xl md:text-4xl font-bold mb-6 ${
                  theme === 'light' ? 'text-gray-900' : 'text-gray-100'
                }`}
              >
                About Rentify
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className={`text-lg max-w-3xl mx-auto ${
                  theme === 'light' ? 'text-gray-600' : 'text-gray-300'
                }`}
              >
                Rentify is digital rental marketplace, built with cutting-edge
                technology to transform how properties are listed, discovered, and managed. 
                Our Progressive Web Application ensures seamless access across all devices 
                while maintaining enterprise-grade security.
              </motion.p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <FeatureCard
                theme={theme}
                icon={<Home className="w-8 h-8" />}
                title="Property Management"
                description="Comprehensive tools for landlords to manage listings, bookings, and payments"
              />
              <FeatureCard
                theme={theme}
                icon={<Search className="w-8 h-8" />}
                title="Smart Search"
                description="Advanced filters for location, price, amenities, and property type"
              />
              <FeatureCard
                theme={theme}
                icon={<Shield className="w-8 h-8" />}
                title="Secure Transactions"
                description="Chapa payment integration with end-to-end encryption"
              />
              <FeatureCard
                theme={theme}
                icon={<MessageCircle className="w-8 h-8" />}
                title="Instant Messaging"
                description="Direct in-app communication between tenants and landlords"
              />
              <FeatureCard
                theme={theme}
                icon={<Smartphone className="w-8 h-8" />}
                title="PWA Powered"
                description="Offline access, push notifications, and app-like experience"
              />
              <FeatureCard
                theme={theme}
                icon={<Handshake className="w-8 h-8" />}
                title="Trust Ecosystem"
                description="Verified profiles, transparent reviews, and rating systems"
              />
            </div>
          </div>
        </section>

        <section
          className={`py-16 px-4 ${
            theme === 'light' ? 'bg-indigo-50' : 'bg-gray-800'
          }`}
        >
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12">
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className={`p-8 rounded-xl shadow-lg ${
                theme === 'light' ? 'bg-white' : 'bg-gray-900'
              }`}
            >
              <h3
                className={`text-2xl font-bold mb-6 ${
                  theme === 'light' ? 'text-indigo-900' : 'text-indigo-400'
                }`}
              >
                Our Mission
              </h3>
              <p
                className={`mb-4 ${
                  theme === 'light' ? 'text-gray-600' : 'text-gray-300'
                }`}
              >
                To democratize access to quality housing through technology, creating a fair 
                and efficient marketplace that benefits both landlords and tenants.
              </p>
              <ul className="space-y-3">
                {[
                  'Simplify rental processes',
                  'Ensure secure transactions',
                  'Build trust through reviews',
                ].map((item) => (
                  <li
                    key={item}
                    className={`flex items-center ${
                      theme === 'light' ? 'text-gray-700' : 'text-gray-200'
                    }`}
                  >
                    <span
                      className={`mr-2 ${
                        theme === 'light' ? 'text-indigo-600' : 'text-indigo-400'
                      }`}
                    >
                      ✓
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className={`p-8 rounded-xl shadow-lg ${
                theme === 'light' ? 'bg-white' : 'bg-gray-900'
              }`}
            >
              <h3
                className={`text-2xl font-bold mb-6 ${
                  theme === 'light' ? 'text-indigo-900' : 'text-indigo-400'
                }`}
              >
                Our Vision
              </h3>
              <p
                className={`mb-4 ${
                  theme === 'light' ? 'text-gray-600' : 'text-gray-300'
                }`}
              >
                To become the most trusted real estate platform, leveraging AI and smart 
                technologies to revolutionize property management.
              </p>
              <div className="space-y-6">
                {[
                  {
                    icon: <Map className="w-6 h-6" />,
                    title: 'Nationwide Reach',
                    description: 'Expand to all major Ethiopian cities',
                  },
                  {
                    icon: <BrainCircuit className="w-6 h-6" />,
                    title: 'Smart Solutions',
                    description: 'Implement AI-powered recommendations and predictions',
                  },
                  {
                    icon: <Trophy className="w-6 h-6" />,
                    title: 'Industry Leadership',
                    description: 'Become proptech innovator',
                  },
                ].map((visionItem, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div
                      className={`p-3 rounded-lg ${
                        theme === 'light'
                          ? 'bg-indigo-100 text-indigo-600'
                          : 'bg-indigo-900 text-indigo-200'
                      }`}
                    >
                      {visionItem.icon}
                    </div>
                    <div>
                      <h4
                        className={`font-semibold mb-1 ${
                          theme === 'light' ? 'text-gray-800' : 'text-gray-100'
                        }`}
                      >
                        {visionItem.title}
                      </h4>
                      <p
                        className={`text-sm ${
                          theme === 'light' ? 'text-gray-600' : 'text-gray-300'
                        }`}
                      >
                        {visionItem.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        <section className="py-16 px-4 text-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="max-w-4xl mx-auto"
          >
            <h2
              className={`text-3xl font-bold mb-6 ${
                theme === 'light' ? 'text-gray-900' : 'text-gray-100'
              }`}
            >
              Join the Rental Revolution
            </h2>
            <p
              className={`mb-8 ${
                theme === 'light' ? 'text-gray-600' : 'text-gray-300'
              }`}
            >
              Whether you&apos;re listing a property or searching for your next home,&nbsp;
              Rentify makes the process simple, secure, and satisfying.
            </p>
            <div className="flex justify-center gap-4">
              <motion.a
                whileHover={{ scale: 1.05 }}
                href="/auth/register"
                className={`px-8 py-3 rounded-lg transition-colors ${
                  theme === 'light'
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                    : 'bg-indigo-700 text-gray-100 hover:bg-indigo-600'
                }`}
              >
                Get Started
              </motion.a>
              <motion.a
                whileHover={{ scale: 1.05 }}
                href="/properties"
                className={`border-2 px-8 py-3 rounded-lg transition-colors ${
                  theme === 'light'
                    ? 'border-indigo-600 text-indigo-600 hover:bg-indigo-50'
                    : 'border-indigo-400 text-indigo-300 hover:bg-gray-800'
                }`}
              >
                Browse Listings
              </motion.a>
            </div>
          </motion.div>
        </section>
      </div>
    </UserLayout>
  );
}

const FeatureCard = ({
  theme,
  icon,
  title,
  description,
}: FeatureCardProps) => {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className={`p-6 rounded-xl transition-all ${
        theme === 'light'
          ? 'bg-white shadow-md hover:shadow-lg'
          : 'bg-gray-800 shadow-lg hover:shadow-xl'
      }`}
    >
      <div
        className={`mb-4 ${
          theme === 'light' ? 'text-indigo-600' : 'text-indigo-400'
        }`}
      >
        {icon}
      </div>
      <h3
        className={`text-xl font-semibold mb-2 ${
          theme === 'light' ? 'text-gray-900' : 'text-gray-100'
        }`}
      >
        {title}
      </h3>
      <p className={theme === 'light' ? 'text-gray-600' : 'text-gray-300'}>
        {description}
      </p>
    </motion.div>
  );
};
