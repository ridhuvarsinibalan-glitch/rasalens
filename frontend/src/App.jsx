import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import AnalyzeStudioPage from './pages/AnalyzeStudioPage';
import RecipeAssistantPage from './pages/RecipeAssistantPage';
import RecipeExplorerPage from './pages/RecipeExplorerPage';
import ModelLabPage from './pages/ModelLabPage';
import InsightsDashboardPage from './pages/InsightsDashboardPage';
import AboutPage from './pages/AboutPage';
import RecipeDetailPage from './pages/RecipeDetailPage';
import { LanguageProvider } from './context/LanguageContext';
import { Sparkles, ArrowRight, X, CheckCircle2, ChevronRight, Play } from 'lucide-react';

function DemoModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);

  if (!isOpen) return null;

  const demoSteps = [
    {
      title: 'Welcome to RasaLens Demo Walkthrough',
      description: 'RasaLens is an academic AI platform for culinary natural language processing, Market Basket Analysis, and semantic retrieval over 13,296 recipes. Everything executes 100% locally on CPU without paid APIs.',
      actionText: 'Explore Data Insights',
      targetRoute: '/insights'
    },
    {
      title: 'Step 1: ETL & Data Quality Dashboard',
      description: 'Review the deduplicated 13,296 recipes, 99.1% data quality score, course & cuisine breakdowns, and live ETL pipeline triggering.',
      actionText: 'Inspect Academic Models in Model Lab',
      targetRoute: '/model-lab'
    },
    {
      title: 'Step 2: Model Lab Benchmarks',
      description: 'Examine genuine benchmark results: Rule-based & spaCy NER, LinearSVC Course Classifier (94.2% Accuracy), Apriori vs FP-Growth MBA, and FAISS Semantic Retrieval (92.3% Recall@5).',
      actionText: 'Open Interactive Recipe Assistant',
      targetRoute: '/assistant'
    },
    {
      title: 'Step 3: Semantic Recipe Assistant',
      description: 'Ask culinary questions powered by FAISS vector indexing with defensible out-of-domain refusals and transparent multilingual query translation.',
      actionText: 'Open Dynamic Analyze Studio',
      targetRoute: '/studio'
    },
    {
      title: 'Step 4: Multi-Modal Analyze Studio',
      description: 'Test typed sentences, ingredient chips, uploaded files, or Tamil queries (e.g. தக்காளி, வெங்காயம்) to see live entity extraction and semantic recipe recommendations.',
      actionText: 'Complete Tour & Return Home',
      targetRoute: '/'
    }
  ];

  const current = demoSteps[step];

  const handleNext = () => {
    navigate(current.targetRoute);
    if (step < demoSteps.length - 1) {
      setStep(step + 1);
    } else {
      onClose();
      setStep(0);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="glass-panel rounded-3xl max-w-xl w-full border border-slate-700 p-8 space-y-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center space-x-2 text-xs font-mono text-amber-400">
          <Play className="w-3.5 h-3.5 fill-amber-400" />
          <span>Interactive Guided Tour (Step {step + 1} of {demoSteps.length})</span>
        </div>

        <div>
          <h3 className="font-display font-bold text-2xl text-white">
            {current.title}
          </h3>
          <p className="text-sm text-slate-300 mt-2 leading-relaxed">
            {current.description}
          </p>
        </div>

        {/* Progress dots */}
        <div className="flex items-center space-x-1.5 pt-2">
          {demoSteps.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i === step ? 'w-8 bg-emerald-400' : 'w-2 bg-slate-800'
              }`}
            />
          ))}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <button
            onClick={() => {
              onClose();
              setStep(0);
            }}
            className="text-xs text-slate-400 hover:text-white font-medium"
          >
            Skip Walkthrough
          </button>

          <button
            onClick={handleNext}
            className="flex items-center space-x-1.5 px-5 py-2.5 rounded-xl text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20"
          >
            <span>{current.actionText}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}

function MainLayout() {
  const [demoOpen, setDemoOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans">
      <Navbar onStartDemo={() => setDemoOpen(true)} />
      
      <main className="flex-1 px-4 sm:px-6 lg:px-8">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/studio" element={<AnalyzeStudioPage />} />
          <Route path="/assistant" element={<RecipeAssistantPage />} />
          <Route path="/recipes" element={<RecipeExplorerPage />} />
          <Route path="/recipes/:recipeId" element={<RecipeDetailPage />} />
          <Route path="/model-lab" element={<ModelLabPage />} />
          <Route path="/insights" element={<InsightsDashboardPage />} />
          <Route path="/about" element={<AboutPage />} />
        </Routes>
      </main>

      <Footer />
      <DemoModal isOpen={demoOpen} onClose={() => setDemoOpen(false)} />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <MainLayout />
      </BrowserRouter>
    </LanguageProvider>
  );
}
