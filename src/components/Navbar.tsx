import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, User } from 'lucide-react';
import { cn } from '../lib/utils';

const navLinks = [
  { name: 'Home', path: '/' },
  { name: 'About', path: '/about' },
  { name: 'Staff', path: '/staff' },
  { name: 'Documents', path: '/documents' },
  { name: 'Achievements', path: '/achievements' },
  { name: 'Sport', path: '/sport' },
  { name: 'Activities', path: '/activities' },
  { name: 'General Application', path: '/admissions' },
  { name: 'Boarding Application', path: '/boarding' },
  { name: 'Contact', path: '/contact' },
];

export const Navbar = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const location = useLocation();

  return (
    <nav className="glass-nav">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-white flex items-center justify-center border border-gray-200 shadow-lg overflow-hidden">
                <img
                  src="./assets/Copilot_20260418_114207.png"
                  alt="My Hargreaves SSS logo"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="hidden md:block">
                <span className="text-xl font-bold text-school-green block leading-none">My Hargreaves SSS</span>
                <span className="text-sm font-semibold text-gray-500">SENIOR SECONDARY SCHOOL</span>
              </div>
            </Link>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-3 lg:space-x-4">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  'px-3 py-2 rounded-md text-sm font-medium transition-colors',
                  location.pathname === link.path
                    ? 'text-school-green bg-blue-50'
                    : 'text-gray-600 hover:text-school-green hover:bg-gray-50'
                )}
              >
                {link.name}
              </Link>
            ))}

            <Link
              to="/student/login"
              className={cn(
                'px-3 py-2 rounded-md text-sm font-bold transition-colors inline-flex items-center gap-2',
                location.pathname.startsWith('/student')
                  ? 'text-white bg-school-green'
                  : 'text-school-green bg-green-50 hover:bg-green-100'
              )}
            >
              <User size={16} /> Student Portal
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-600 hover:text-school-green p-2"
              aria-label="Open menu"
            >
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      {isOpen && (
        <div className="md:hidden bg-white border-b border-gray-200">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={cn(
                  'block px-3 py-2 rounded-md text-base font-medium',
                  location.pathname === link.path
                    ? 'text-school-green bg-blue-50'
                    : 'text-gray-600 hover:text-school-green hover:bg-gray-50'
                )}
              >
                {link.name}
              </Link>
            ))}

            <Link
              to="/student/login"
              onClick={() => setIsOpen(false)}
              className={cn(
                'block px-3 py-2 rounded-md text-base font-bold',
                location.pathname.startsWith('/student')
                  ? 'text-white bg-school-green'
                  : 'text-school-green bg-green-50'
              )}
            >
              Student Portal
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};
