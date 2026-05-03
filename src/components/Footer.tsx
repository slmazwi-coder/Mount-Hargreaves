import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Facebook } from 'lucide-react';

const TikTokIcon = (props: { size?: number; className?: string }) => {
  const size = props.size ?? 20;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={props.className}
      aria-hidden="true"
    >
      <path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.372V2h-3.58v13.2a2.988 2.988 0 0 1-2.99 2.99 2.988 2.988 0 0 1-2.99-2.99 2.988 2.988 0 0 1 2.99-2.99c.304 0 .598.047.875.133V8.69a6.58 6.58 0 0 0-.875-.06A6.57 6.57 0 0 0 2.68 15.2a6.57 6.57 0 0 0 6.57 6.57 6.57 6.57 0 0 0 6.57-6.57V9.207a8.318 8.318 0 0 0 3.77.92V6.686Z" />
    </svg>
  );
};

export const Footer = () => {
  return (
    <footer className="bg-school-green text-white pt-12 pb-8 w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Grid: stacks on mobile, 4 cols on desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">

          {/* Col 1 — Logo + Name + Socials */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-12 w-12 shrink-0 rounded-xl bg-white/95 overflow-hidden border border-white/20 shadow-lg">
                <img
                  src="./assets/Copilot_20260418_114207.png"
                  alt="Mt Hargreaves SSS logo"
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <h3 className="text-base font-bold leading-tight">
                  Mt Hargreaves Senior Secondary School
                </h3>
                <p className="text-white/70 text-sm italic mt-0.5">"We Can"</p>
              </div>
            </div>

            {/* Social icons */}
            <div className="flex gap-3 mt-4">
              <a
                href="https://www.facebook.com/MT.Hargreaves/"
                target="_blank"
                rel="noreferrer"
                className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
                aria-label="Facebook"
              >
                <Facebook size={18} />
              </Link>
              <a
                href="https://www.tiktok.com/@mt.hargreavessss"
                target="_blank"
                rel="noreferrer"
                className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
                aria-label="TikTok"
              >
                <TikTokIcon size={18} />
              </Link>
            </div>
          </div>

          {/* Col 2 — Contact */}
          <div>
            <h4 className="text-sm font-bold mb-4 border-b border-white/20 pb-2 uppercase tracking-wide">
              Contact Us
            </h4>
            <ul className="space-y-3 text-white/80 text-sm">
              <li className="flex items-start gap-2">
                <MapPin className="shrink-0 mt-0.5" size={16} />
                <span>Sigoga Location, Mgubo A/A, Matatiele, 4730 (Eastern Cape)</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={16} className="shrink-0" />
                <span>+27 76 707 3212</span>
              </li>
              <li className="flex items-start gap-2">
                <Mail size={16} className="shrink-0 mt-0.5" />
                <span className="break-all">office@mounthargreavesss.co.za</span>
              </li>
            </ul>
          </div>

          {/* Col 3 — Quick Links */}
          <div>
            <h4 className="text-sm font-bold mb-4 border-b border-white/20 pb-2 uppercase tracking-wide">
              Quick Links
            </h4>
            <ul className="space-y-2 text-white/80 text-sm">
              {[
                { label: 'About Our School', href: '/about' },
                { label: 'Staff', href: '/staff' },
                { label: 'Documents', href: '/documents' },
                { label: 'Achievements', href: '/achievements' },
                { label: 'General Application', href: '/admissions' },
                { label: 'Boarding Application', href: '/boarding' },
                { label: 'Student Portal', href: '/student/login' },
              ].map(link => (
                <li key={link.href}>
                  <Link to={link.href} className="hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4 — School Hours */}
          <div>
            <h4 className="text-sm font-bold mb-4 border-b border-white/20 pb-2 uppercase tracking-wide">
              School Hours
            </h4>
            <ul className="space-y-2 text-white/80 text-sm">
              <li className="flex justify-between gap-4">
                <span>Mon – Thu</span>
                <span className="font-medium">07:30 – 15:30</span>
              </li>
              <li className="flex justify-between gap-4">
                <span>Friday</span>
                <span className="font-medium">07:30 – 13:30</span>
              </li>
              <li className="flex justify-between gap-4">
                <span>Sat – Sun</span>
                <span className="font-medium">Closed</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 pt-6 text-center text-white/60 text-xs">
          <p>© {new Date().getFullYear()} Mt Hargreaves Senior Secondary School. All Rights Reserved.</p>
          <Link
            to="/admin/login"
            className="text-white/30 hover:text-white/60 text-xs mt-2 inline-block transition-colors"
          >
            Staff Portal
          </Link>
        </div>

      </div>
    </footer>
  );
};
