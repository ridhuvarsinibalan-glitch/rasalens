import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Sparkles, UtensilsCrossed, Layers, BarChart3, Info, 
  Database, Cpu, Play, Globe, Bot 
} from 'lucide-react';
import { api } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

export default function Navbar({ onStartDemo }) {
  const [health, setHealth] = useState(null);
  const { t, language, setLanguage } = useLanguage();

  useEffect(() => {
    api.getHealth()
      .then(setHealth)
      .catch(() => setHealth({ status: 'offline', dataset_records: 0, is_sample_mode: false }));
  }, []);

  const navLinks = [
    { to: '/', label: t('nav.overview', 'Overview'), icon: Sparkles },
    { to: '/studio', label: t('nav.studio', 'Analyze Studio'), icon: UtensilsCrossed, highlight: true },
    { to: '/assistant', label: t('nav.assistant', 'Assistant'), icon: Bot },
    { to: '/recipes', label: t('nav.recipes', 'Recipes'), icon: Database },
    { to: '/model-lab', label: t('nav.model_lab', 'Model Lab'), icon: Layers },
    { to: '/insights', label: t('nav.insights', 'Insights'), icon: BarChart3 },
    { to: '/about', label: t('nav.about', 'About'), icon: Info },
  ];

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <NavLink to="/" className="flex items-center space-x-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <UtensilsCrossed className="w-4 h-4 text-slate-950 font-bold" />
            </div>
            <span className="font-display font-bold text-lg tracking-tight text-white group-hover:text-emerald-300 transition-colors">
              RasaLens
            </span>
          </NavLink>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                    }`
                  }
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{link.label}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* Right Action Bar: Compact Language + Status + Tour */}
          <div className="flex items-center space-x-2.5">
            
            {/* Compact Language Toggle */}
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-[11px] font-mono">
              {[
                { code: 'en', label: 'EN' },
                { code: 'ta', label: 'தமிழ்' },
                { code: 'hi', label: 'हिन्दी' }
              ].map(({ code, label }) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => setLanguage(code)}
                  className={`px-2 py-0.5 rounded text-[10px] font-medium transition-all ${
                    language === code
                      ? 'bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Clean Status Pill */}
            <div className="hidden xl:flex items-center space-x-1.5 text-xs text-slate-400 px-2.5 py-1 rounded-full bg-slate-900/80 border border-slate-800">
              <span className={`w-1.5 h-1.5 rounded-full ${health?.status === 'healthy' ? 'bg-emerald-400' : 'bg-rose-400'}`} />
              <span className="text-[11px] font-mono text-slate-300">
                {health?.dataset_records ? `${(health.dataset_records / 1000).toFixed(1)}k recipes` : 'Ready'}
              </span>
            </div>

            {/* Tour Button */}
            <button
              onClick={onStartDemo}
              id="demo-mode-button"
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700/60 transition-all shadow-sm"
            >
              <Play className="w-3 h-3 fill-slate-300" />
              <span className="hidden sm:inline">Tour</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
}
