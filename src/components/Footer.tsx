import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Facebook, Twitter, Instagram } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-school-green text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-1">
            <h3 className="text-2xl font-bold mb-6">[SCHOOL NAME]</h3>
            <p className="text-green-100 mb-6 italic">
              "[SCHOOL MOTTO]"
            </p>
            <div className="flex gap-4">
              <a href="#" className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"><Facebook size={20} /></a>
              <a href="#" className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"><Twitter size={20} /></a>
              <a href="#" className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"><Instagram size={20} /></a>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-bold mb-6 border-b border-white/20 pb-2">Contact Us</h4>
            <ul className="space-y-4 text-green-100">
              <li className="flex items-start gap-3">
                <MapPin className="shrink-0 mt-1" size={18} />
                <span>[SCHOOL ADDRESS]</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={18} />
                <span>[PHONE NUMBER]</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={18} />
                <span>office@[school-domain].edu.za</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-bold mb-6 border-b border-white/20 pb-2">Quick Links</h4>
            <ul className="space-y-3 text-green-100">
              <li><a href="/about" className="hover:text-white transition-colors">About Our School</a></li>
              <li><a href="/documents" className="hover:text-white transition-colors">Student Portal</a></li>
              <li><a href="/achievements" className="hover:text-white transition-colors">Hall of Fame</a></li>
              <li><a href="/admissions" className="hover:text-white transition-colors">Apply Online</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-bold mb-6 border-b border-white/20 pb-2">School Hours</h4>
            <ul className="space-y-3 text-green-100">
              <li className="flex justify-between"><span>Mon - Thu:</span> <span>07:30 - 15:30</span></li>
              <li className="flex justify-between"><span>Friday:</span> <span>07:30 - 13:30</span></li>
              <li className="flex justify-between"><span>Sat - Sun:</span> <span>Closed</span></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-white/10 pt-8 text-center text-green-200 text-sm">
          <p>© {new Date().getFullYear()} [SCHOOL NAME]. All Rights Reserved. | [MOTTO]</p>
          <Link to="/admin/login" className="text-green-200/30 hover:text-green-200/60 text-xs mt-2 inline-block transition-colors">Staff Portal</Link>
        </div>
      </div>
    </footer>
  );
};
