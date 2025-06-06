import React, { useState, useContext, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { logout } from '@/store/slices/authSlice';
import { SunIcon, MoonIcon, ChevronDown, ChevronUp } from 'lucide-react';
import { ThemeContext } from '@/components/context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';

interface NavItem {
  label: string;
  href?: string;
  subItems?: SubItem[];
}
interface SubItem {
  label: string;
  href: string;
}

const baseNavItems: NavItem[] = [
  { label: 'About', href: '/about' },
  {
    label: 'Properties',
    subItems: [
      { label: 'List Property', href: '/properties/list' },
      { label: 'Rent Property', href: '/properties' },
    ],
  },
];

export default function Header() {

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSubmenuOpen, setMobileSubmenuOpen] = useState<Record<string, boolean>>({});
  const [selectedLang, setSelectedLang] = useState('EN');

  const { user } = useAppSelector((state) => state.auth)!;
  const dispatch = useAppDispatch();
  const { theme, toggleTheme } = useContext(ThemeContext)!;

  const languages = ['EN', 'AM', 'OR'];

  const navItems = useMemo<NavItem[]>(() => {
    const items: NavItem[] = baseNavItems.map((item) => {
      if (item.subItems) {
        return {
          label: item.label,
          subItems: item.subItems.map((sub) => ({ ...sub })),
        };
      } else {
        return { ...item };
      }
    });

    let bookingsHref: string;
    if (!user) bookingsHref = `/properties`;
    else if (user.role === 'TENANT') bookingsHref = '/bookings';
    else bookingsHref = '/landlord/bookings';

    items.splice(2, 0, { label: 'Bookings', href: bookingsHref });

    const propertiesItem = items.find((i) => i.label === 'Properties');
    if (propertiesItem?.subItems) {
      propertiesItem.subItems = propertiesItem.subItems.map((sub) => {
        if (sub.label === 'List Property') {
          return {
            label: sub.label,
            href: user?.role === 'LANDLORD' ? '/properties/list' : '/become-landlord',
          };
        }
        return sub;
      });
    }

    return items;
  }, [user]);

  const toggleSubmenu = (label: string) => {
    setMobileSubmenuOpen((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  const initial = user?.name?.charAt(0).toUpperCase() ?? '';
  const avatarSrc = user?.profilePhoto ?? '';

  return (
    <header  
      className={`sticky top-0 z-50 border-b transition-colors duration-300 ${
        theme === 'light'
          ? 'bg-gray-50 border-gray-200 text-gray-800'
          : 'bg-gray-900 border-gray-700 text-gray-100'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between h-16 items-center">
        <Link href="/">
          <span className="text-2xl font-bold text-blue-600 dark:text-blue-400 cursor-pointer">
            Rentify
          </span>
        </Link>
        <nav className="hidden md:flex items-center space-x-6">
          {navItems.map((item) => (
            <div key={item.label} className="relative group">
              {item.subItems ? (
                <>
                  <button className="flex items-center text-md font-medium hover:text-blue-600 dark:hover:text-blue-400">
                    {item.label}
                    <ChevronDown className="w-4 h-4 ml-1" />
                  </button>
                  <div
                    className={`absolute left-0 mt-2 w-48 rounded-lg shadow-xl z-20 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 ${
                      theme === 'light' ? 'bg-white border border-gray-100' : 'bg-gray-800 border border-gray-700'
                    }`}
                  >
                    {item.subItems.map((sub) => (
                      <Link
                        key={sub.label}
                        href={sub.href}
                        className={`block px-4 py-3 text-sm ${
                          theme === 'light' ? 'text-gray-700 hover:bg-gray-50' : 'text-gray-100 hover:bg-gray-700'
                        }`}
                      >
                        {sub.label}
                      </Link>
                    ))}
                  </div>
                </>
              ) : (
                <Link
                  href={item.href!}
                  className="text-md font-medium hover:text-blue-600 dark:hover:text-blue-400"
                >
                  {item.label}
                </Link>
              )}
            </div>
          ))}
        </nav>
        <div className="hidden md:flex items-center space-x-4">
          <button
            onClick={toggleTheme}
            className="inline-flex items-center px-3 py-1 border rounded-full text-sm transition-colors"
          >
            {theme === 'dark' ? (
              <>
                <SunIcon className="w-5 h-5 mr-2" /> Light
              </>
            ) : (
              <>
                <MoonIcon className="w-5 h-5 mr-2" /> Dark
              </>
            )}
          </button>

          <div className="relative group">
            <button className="px-3 py-2 rounded-lg text-sm hover:bg-gray-100 dark:hover:bg-gray-800">
              {selectedLang}
            </button>
            <div className="absolute right-0 mt-2 w-28 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
              <div
                className={`${
                  theme === 'light' ? 'bg-white border border-gray-100' : 'bg-gray-800 border border-gray-700'
                } rounded-lg`}
              >
                {languages.map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setSelectedLang(lang)}
                    className="block w-full text-left px-4 py-3 text-sm hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {user ? (
            <div className="relative group">
              {avatarSrc ? (
                <div className="w-8 h-8 rounded-full overflow-hidden ring-2 ring-blue-500">
                  <Image
                    src={avatarSrc}
                    alt="User Avatar"
                    width={32}
                    height={32}
                    className="object-cover"
                    priority
                  />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold ring-2 ring-blue-500">
                  {initial}
                </div>
              )}

              <div
                className={`absolute right-0 mt-2 w-48 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 ${
                  theme === 'light' ? 'bg-white border border-gray-100' : 'bg-gray-800 border border-gray-700'
                }`}
              >
                <Link
                  href="/profile"
                  className="block px-4 py-3 text-sm hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Your Profile
                </Link>
                <button
                  onClick={() => dispatch(logout())}
                  className="block w-full text-left px-4 py-3 text-sm hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <Link href={`/auth/login`} className="px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700">
              Login
            </Link>
          )}
        </div>

        <div className="md:hidden flex items-center space-x-3">
          <button
            onClick={toggleTheme}
            className="inline-flex items-center px-2 py-1 border rounded-full text-sm"
          >
            {theme === 'dark' ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
          </button>

          {user && (
            <>
              {avatarSrc ? (
                <div className="w-8 h-8 rounded-full overflow-hidden ring-2 ring-blue-500">
                  <Image
                    src={avatarSrc}
                    alt="User Avatar"
                    width={32}
                    height={32}
                    className="object-cover"
                    priority
                  />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold ring-2 ring-blue-500">
                  {initial}
                </div>
              )}
            </>
          )}

          <button onClick={() => setMobileMenuOpen((o) => !o)} className="p-2 rounded-lg">
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Mobile submenu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className={`${
              theme === 'light' ? 'bg-white border-t border-gray-100' : 'bg-gray-900 border-t border-gray-700'
            } md:hidden overflow-hidden`}
          >
            <div className="px-4 py-4 space-y-4">
              {navItems.map((item) => (
                <div key={item.label}>
                  {item.subItems ? (
                    <>
                      <button
                        onClick={() => toggleSubmenu(item.label)}
                        className="w-full flex justify-between items-center px-2 py-2 font-medium hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                      >
                        {item.label}
                        {mobileSubmenuOpen[item.label] ? <ChevronUp /> : <ChevronDown />}
                      </button>
                      <AnimatePresence>
                        {mobileSubmenuOpen[item.label] && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="pl-6 mt-1 space-y-1"
                          >
                            {item.subItems!.map((sub) => (
                              <Link
                                key={sub.label}
                                href={sub.href}
                                className="block px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                              >
                                {sub.label}
                              </Link>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </>
                  ) : (
                    <Link
                      href={item.href!}
                      className="block px-2 py-2 font-medium hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                    >
                      {item.label}
                    </Link>
                  )}
                </div>
              ))}

              <div>
                <p className="text-sm font-medium mb-2">Language</p>
                <div className="flex space-x-2">
                  {languages.map((lang) => (
                    <button
                      key={lang}
                      onClick={() => setSelectedLang(lang)}
                      className={`flex-1 px-3 py-2 text-sm text-center rounded ${
                        selectedLang === lang
                          ? 'bg-blue-600 text-white'
                          : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                {user ? (
                  <>
                    <Link
                      href="/profile"
                      className="block px-2 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                    >
                      Your Profile
                    </Link>
                    <button
                      onClick={() => dispatch(logout())}
                      className="w-full text-left px-2 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <Link
                    href={`/auth/login?redirect=${encodeURIComponent('/')}`}
                    className="block px-2 py-2 bg-blue-600 text-white text-center rounded"
                  >
                    Login
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
