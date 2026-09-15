import React from 'react';
import { BookOpen, MapPin, Phone, Mail, Clock, MessageSquare, Shield, ExternalLink } from 'lucide-react';
import { LibrarySettings } from '../../types';

interface FooterProps {
  settings: LibrarySettings;
  setActiveTab: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ settings, setActiveTab }) => {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white">
                <BookOpen className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">{settings.libraryName}</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              {settings.tagline}. Single Branch Premium Reading Center with AC, Silent Zones, High Speed WiFi & Visual Seat Allocation.
            </p>
            <div className="pt-2 flex items-center space-x-3">
              <a
                href={`https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-500 transition-colors shadow-sm"
              >
                <MessageSquare className="w-4 h-4 mr-1.5" />
                WhatsApp Us
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Navigation</h3>
            <ul className="space-y-2.5 text-sm">
              {['home', 'about', 'facilities', 'plans', 'gallery', 'rules', 'contact'].map((tab) => (
                <li key={tab}>
                  <button
                    onClick={() => setActiveTab(tab)}
                    className="capitalize hover:text-blue-400 transition-colors"
                  >
                    {tab === 'plans' ? 'Membership Plans' : tab}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Contact Info</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start space-x-3 text-slate-400">
                <MapPin className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                <span>{settings.address}, {settings.city}, {settings.state} - {settings.pincode}</span>
              </li>
              <li className="flex items-center space-x-3 text-slate-400">
                <Phone className="w-5 h-5 text-blue-400 shrink-0" />
                <span>{settings.phone}</span>
              </li>
              <li className="flex items-center space-x-3 text-slate-400">
                <Mail className="w-5 h-5 text-blue-400 shrink-0" />
                <span>{settings.email}</span>
              </li>
              <li className="flex items-center space-x-3 text-slate-400">
                <Clock className="w-5 h-5 text-blue-400 shrink-0" />
                <span>{settings.workingHours}</span>
              </li>
            </ul>
          </div>

          {/* Hostinger & Policy Badges */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">System Architecture</h3>
            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/60 space-y-3">
              <div className="flex items-center space-x-2 text-emerald-400 text-xs font-semibold">
                <Shield className="w-4 h-4" />
                <span>Hostinger Ready PHP 8+ & MySQL</span>
              </div>
              <p className="text-xs text-slate-400 leading-normal">
                Designed for single library deployment on shared hosting without cloud subscriptions.
              </p>
              <div className="pt-1 flex flex-wrap gap-2 text-[11px] text-slate-400">
                <button onClick={() => setActiveTab('terms')} className="hover:underline">Terms</button>
                <span>•</span>
                <button onClick={() => setActiveTab('privacy')} className="hover:underline">Privacy</button>
                <span>•</span>
                <button onClick={() => setActiveTab('refund')} className="hover:underline">Refund Policy</button>
              </div>
            </div>
          </div>

        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 space-y-4 sm:space-y-0">
          <p>© {new Date().getFullYear()} {settings.libraryName}. All rights reserved.</p>
          <p className="flex items-center space-x-1">
            <span>Powered by</span>
            <span className="font-semibold text-slate-300">StudyZone Engine</span>
          </p>
        </div>
      </div>
    </footer>
  );
};
