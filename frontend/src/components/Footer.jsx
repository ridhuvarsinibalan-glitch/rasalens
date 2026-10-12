import React from 'react';
import { ShieldCheck, Terminal, Cpu } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="border-t border-slate-800/80 bg-slate-950/80 py-8 px-4 sm:px-6 lg:px-8 mt-16 text-xs text-slate-400">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        <div className="flex items-center space-x-2">
          <span className="font-display font-semibold text-slate-200">RasaLens</span>
          <span>•</span>
          <span>{t('footer.brand_desc', 'Academic Machine Learning & Multi-Modal Culinary NLP Platform')}</span>
        </div>

        <div className="flex items-center space-x-4 text-slate-400">
          <span className="flex items-center space-x-1">
            <Cpu className="w-3.5 h-3.5 text-teal-400" />
            <span>{t('footer.cpu_arch', 'CPU-First Architecture')}</span>
          </span>
          <span>•</span>
          <span className="flex items-center space-x-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>{t('footer.free_api', '100% Free / No Paid API Dependent')}</span>
          </span>
          <span>•</span>
          <span className="flex items-center space-x-1">
            <Terminal className="w-3.5 h-3.5 text-amber-400" />
            <span>{t('footer.tech', 'FastAPI + Vite React')}</span>
          </span>
        </div>

        <div className="text-slate-500 font-mono text-[11px]">
          {t('footer.year', '2026 Academic Research Project')}
        </div>
      </div>
    </footer>
  );
}
