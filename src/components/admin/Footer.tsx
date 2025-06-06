import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="p-10 h-16 flex items-center justify-center bg-white border-t border-gray-300 text-blue-600">
      © {new Date().getFullYear()} Rentify Admin. All rights reserved.
    </footer>
  );
};

export default Footer;
