import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { logout } from '@/store/slices/authSlice';
import Link from 'next/link';


interface TopbarProps {
  onToggleSidebar: () => void;
}

const Topbar: React.FC<TopbarProps> = ({ onToggleSidebar }) => {

  const dispatch = useAppDispatch();
  const router = useRouter();
  const { user } = useAppSelector((state) => state.auth)!;
  const [menuOpen, setMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    dispatch(logout());
    router.push('/auth/login');
  };

  const initial = user?.name?.charAt(0).toUpperCase() ?? '';

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen]);

  return (
    <header
      className="
        sticky top-0 z-50 h-16 flex items-center justify-between
        px-4 md:px-6
        border-b border-blue-500
        bg-white
        text-gray-800
      "
    >
      <button
        onClick={onToggleSidebar}
        className="md:hidden text-gray-600 hover:text-gray-900"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>
      <h1 className="flex-1 text-lg font-semibold text-blue-600 text-center md:text-left">
        Admin Dashboard
      </h1>
      <div className="flex items-center space-x-4">
        {user ? (
          <div ref={dropdownRef} className="relative">
            <button
              onClick={() => setMenuOpen((prev) => !prev)}
              className="focus:outline-none"
            >
              {user.profilePhoto ? (
                <Image
                  src={user.profilePhoto}
                  alt="Profile"
                  width={35}
                  height={35}
                  className="rounded-full object-cover cursor-pointer"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-semibold cursor-pointer">
                  {initial}
                </div>
              )}
            </button>
            <div
              className={`
                absolute right-0 mt-2 w-40 rounded-lg shadow-xl
                bg-white border border-gray-200
                transition-all duration-150
                ${menuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}
                z-50
              `}
            >
              <Link
                href="/admin/profile"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => setMenuOpen(false)}
              >
                Your Profile
              </Link>
              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Logout
              </button>
            </div>
          </div>
        ) : (
          <Link
            href="/auth/login"
            className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors"
          >
            Login
          </Link>
        )}
      </div>
    </header>
  );
};

export default Topbar;
