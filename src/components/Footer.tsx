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
    <footer className="bg-school-green text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-3 mb-5">
              <div className="h-12 w-12 rounded-xl bg-white/95 overflow-hidden border border-white/20 shadow-lg">
                <img
                  src="/assets/Copilot_20260418_114207.png"
                  alt="My Hargreaves SSS logo"
                  className="h-full w-full object-cover"
                />
              </div>
              <h3 className="text-2xl font-bold">My Hargreaves SSS</h3>
            </div>
            <p className="text-white/80 mb-6 italic">"we can"</p>
            <div className="flex gap-4">
              <a
                href="https://www.facebook.com/MT.Hargreaves/"
                target="_blank"
                rel="noreferrer"
                className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
                aria-label="Facebook"
              >
                <Facebook size={20} />
              </a>
              <a
                href="https://www.tiktok.com/@mt.hargreavessss"
                target="_blank"
                rel="noreferrer"
                className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
                aria-label="TikTok"
              >
                <TikTokIcon size={20} />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-bold mb-6 border-b border-white/20 pb-2">Contact Us</h4>
            <ul className="space-y-4 text-white/80">
              <li className="flex items-start gap-3">
                <MapPin className="shrink-0 mt-1" size={18} />
                <span>Sigoga Location, Mgubo A/A, Matatiele, 4730 (Eastern Cape)</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={18} />
                <span>+27 76 707 3212</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={18} />
                <span>office@mounthargreavesss.co.za</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-bold mb-6 border-b border-white/20 pb-2">Quick Links</h4>
            <ul className="space-y-3 text-white/80">
              <li>
                <a href="/about" className="hover:text-white transition-colors">About Our School</a>
              </li>
              <li>
                <a href="/documents" className="hover:text-white transition-colors">Documents</a>
              </li>
              <li>
                <a href="/achievements" className="hover:text-white transition-colors">Achievements</a>
              </li>
              <li>
                <a href="/admissions" className="hover:text-white transition-colors">General Application</a>
              </li>
              <li>
                <a href="/boarding" className="hover:text-white transition-colors">Boarding Application</a>
              </li>
              <li>
                <a href="/student/login" className="hover:text-white transition-colors">Student Portal</a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-bold mb-6 border-b border-white/20 pb-2">School Hours</h4>
            <ul className="space-y-3 text-white/80">
              <li className="flex justify-between">
                <span>Mon - Thu:</span> <span>07:30 - 15:30</span>
              </li>
              <li className="flex justify-between">
                <span>Friday:</span> <span>07:30 - 13:30</span>
              </li>
              <li className="flex justify-between">
                <span>Sat - Sun:</span> <span>Closed</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 text-center text-white/70 text-sm">
          <p>© {new Date().getFullYear()} My Hargreaves Senior Secondary School. All Rights Reserved.</p>
          <Link
            to="/admin/login"
            className="text-white/40 hover:text-white/70 text-xs mt-2 inline-block transition-colors"
          >
            Staff Portal
          </Link>
        </div>
      </div>
    </footer>
  );
};
