import Link from 'next/link';
import React from 'react';
import {LayoutDashboard,Users,Home,CalendarCheck,Star,} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navLinks: {
  href: string;
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}[] = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/properties', label: 'Properties', icon: Home },
  { href: '/admin/bookings', label: 'Bookings', icon: CalendarCheck },
  { href: '/admin/reviews', label: 'Reviews', icon: Star },
];

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  return (
    <>
      <aside
        className={`
          fixed inset-y-0 left-0 z-30 w-64
          bg-blue-600 border-r border-gray-200
          transform transition-transform duration-200 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0
        `}
      >
        <div className="p-6 text-lg font-bold text-white">
          Rentify Admin
        </div>
        <nav className="mt-6 space-y-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link key={link.href} href={link.href}>
                <span
                  className="
                    flex items-center px-6 py-3 cursor-pointer
                    text-white hover:bg-blue-700 rounded-lg
                  "
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {link.label}
                </span>
              </Link>
            );
          })}
        </nav>
      </aside>
      <div
        className={`
          fixed inset-0 z-20 transition-opacity duration-200
          ${isOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'}
          md:hidden
        `}
        onClick={onClose}
      />
    </>
  );
};

export default Sidebar;
