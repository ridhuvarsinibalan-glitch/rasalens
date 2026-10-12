import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  UtensilsCrossed,
  Layers,
  BarChart3,
  Video,
  ArrowRight,
  Database,
  Cpu,
  Search,
  CheckCircle2,
  TrendingUp,
  Globe2,
  Mic,
  Award,
  Bot,
  Network
} from 'lucide-react';
import { api } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

export default function HomePage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [metrics, setMetrics] = useState(null);
  const [quickSearch, setQuickSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getEvaluationMetrics()
      .then((data) => {
        setMetrics(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (quickSearch.trim()) {
      navigate(`/studio?q=${encodeURIComponent(quickSearch.trim())}`);
    }
  };

  const capabilities = [
    {
      title: t('nav.studio', 'Analyze Studio'),
      subtitle: 'Multi-Modal Culinary NLP',
      desc: 'Process natural text, ingredient chips, and uploaded recipe files with automated entity extraction and cuisine inference.',
      icon: UtensilsCrossed,
      link: '/studio',
      tag: 'Live Studio'
    },
    {
      title: t('nav.assistant', 'Recipe Assistant'),
      subtitle: 'Semantic Grounded QA',
      desc: 'Grounded question answering across 13,296 recipes with defensible out-of-domain refusal and transparent multilingual translation.',
      icon: Bot,
      link: '/assistant',
      tag: 'Vector RAG'
    },
    {
      title: t('nav.recipes', 'Recipe Explorer'),
      subtitle: '13,296 Recipe Corpus',
      desc: 'Full-text faceted search across culinary traditions with dietary filters (Vegetarian, Vegan, Non-Veg), prep times, and linked master chef videos.',
      icon: Database,
      link: '/recipes',
      tag: 'Corpus Search'
    },
    {
      title: t('nav.model_lab', 'Model Lab'),
      subtitle: 'Reproducible Benchmarks',
      desc: 'Transparent evaluation of Rule-based vs Custom spaCy NER, LinearSVC Course Classifier, Apriori vs FP-Growth MBA, and FAISS vector retrieval.',
      icon: Layers,
      link: '/model-lab',
      tag: 'Benchmarks'
    },
    {
      title: t('nav.insights', 'Insights & ETL'),
      subtitle: 'Data Quality & Provenance',
      desc: 'Comprehensive data engineering distributions, duplicate audits, missing-value resolutions, and live pipeline monitoring.',
      icon: BarChart3,
      link: '/insights',
      tag: 'Quality: 99.1%'
    },
    {
      title: t('nav.graph', 'Ingredient Graph'),
      subtitle: 'Association Network & Lift',
      desc: 'Interactive 2D force-directed knowledge graph of ingredient pairings, co-occurrences, and market basket affinities.',
      icon: Network,
      link: '/graph',
      tag: 'Interactive Graph'
    }
  ];

  return (
    <div className="space-y-16 py-6 animate-fadeIn">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl glass-panel p-8 sm:p-12 lg:p-16 border border-slate-800 shadow-2xl">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-700/60 text-slate-300 text-xs font-mono">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>{t('home.hero_badge', 'Culinary NLP & Semantic RAG Platform')}</span>
          </div>

          <h1 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl tracking-tight text-white leading-tight">
            {t('home.hero_title_prefix', 'Intelligent Culinary NLP &')}{' '}
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300 bg-clip-text text-transparent">
              {t('home.hero_title_suffix', 'Semantic RAG')}
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-sans">
            {t('home.hero_desc', 'Explore recipes, extract culinary entities, discover ingredient pairings, and interact with grounded recipe AI across 13,296 recipes.')}
          </p>

          {/* Quick Search / Query Bar */}
          <form onSubmit={handleSearchSubmit} className="pt-2">
            <div className="relative flex items-center max-w-xl">
              <Search className="absolute left-4 w-5 h-5 text-slate-400" />
              <input
                type="text"
                id="hero-quick-search"
                value={quickSearch}
                onChange={(e) => setQuickSearch(e.target.value)}
                placeholder={t('home.quick_search_placeholder', "Try: '2 cups tomato, onion and garlic' or 'creamy paneer curry'...")}
                className="w-full pl-12 pr-28 py-3.5 rounded-2xl bg-slate-900/90 border border-slate-700/80 text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 shadow-inner"
              />
              <button
                type="submit"
                id="hero-analyze-btn"
                className="absolute right-2 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all shadow-md shadow-emerald-500/20"
              >
                {t('home.analyze_btn', 'Analyze')}
              </button>
            </div>
          </form>

          {/* Quick Suggestions Chips */}
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-slate-400">
            <span className="font-mono text-slate-500">{t('home.quick_tests_label', 'Quick tests:')}</span>
            {[
              'I have tomatoes, paneer and kasuri methi',
              'Chocolate fudge brownie dessert',
              'தக்காளி வெங்காயம் குழம்பு',
              'Quick vegetarian avocado salad'
            ].map((chip) => (
              <button
                key={chip}
                onClick={() => {
                  setQuickSearch(chip);
                  navigate(`/studio?q=${encodeURIComponent(chip)}`);
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-900/60 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-emerald-300 transition-colors"
              >
                {chip}
              </button>
            ))}
          </div>

        </div>
      </section>

      {/* Key Metric Highlights */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="glass-card rounded-2xl p-5 border border-slate-800/80 bg-slate-900/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-slate-400">{t('home.stat_ner', 'Rule-Based NER')}</span>
            <Award className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-bold font-display text-white">84.8% F1</div>
            <p className="text-xs text-slate-400 mt-1 flex items-center">
              <TrendingUp className="w-3.5 h-3.5 mr-1 text-emerald-400" /> Span-exact evaluated
            </p>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-slate-800/80 bg-slate-900/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-slate-400">{t('home.stat_classifier', 'LinearSVC Classifier')}</span>
            <Award className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-bold font-display text-white">94.2% Acc</div>
            <p className="text-xs text-slate-400 mt-1">
              88.1% Macro F1 via 5-Fold CV
            </p>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-slate-800/80 bg-slate-900/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-slate-400">{t('home.stat_rag', 'FAISS RAG Retrieval')}</span>
            <Award className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-bold font-display text-white">92.3% R@5</div>
            <p className="text-xs text-slate-400 mt-1">
              0.7853 MRR • 25.5ms CPU latency
            </p>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-slate-800/80 bg-slate-900/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-slate-400">{t('home.stat_mba', 'Market Basket Rules')}</span>
            <Award className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-bold font-display text-white">870 Rules</div>
            <p className="text-xs text-slate-400 mt-1">
              13,271 recipes • Lift up to 8.3x
            </p>
          </div>
        </div>

      </section>

      {/* Capabilities Navigation Grid */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <h2 className="text-2xl font-bold font-display text-white">{t('home.capabilities_title', 'System Capabilities')}</h2>
            <p className="text-xs text-slate-400">
              {t('home.capabilities_desc', 'Explore the core natural language processing modules built into RasaLens.')}
            </p>
          </div>
          <Link
            to="/about"
            className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center font-medium"
          >
            <span>{t('home.spec_link', 'Read Academic Specification')}</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {capabilities.map((cap) => {
            const Icon = cap.icon;
            return (
              <Link
                key={cap.title}
                to={cap.link}
                className="glass-card rounded-2xl p-6 border border-slate-800 hover:border-emerald-500/40 bg-slate-900/60 hover:bg-slate-900/90 flex flex-col justify-between group transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800/60 border border-slate-700/50 text-slate-300">
                      {cap.tag}
                    </span>
                  </div>
                  <h3 className="font-display font-semibold text-base text-white group-hover:text-emerald-300 transition-colors">
                    {cap.title}
                  </h3>
                  <p className="text-xs font-mono text-slate-400 mb-2">{cap.subtitle}</p>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans">{cap.desc}</p>
                </div>

                <div className="pt-5 flex items-center text-xs font-medium text-emerald-400 group-hover:translate-x-1 transition-transform">
                  <span>{t('home.open_module', 'Open Module')}</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

    </div>
  );
}
