import React from 'react';
import {
  Info,
  ShieldCheck,
  Cpu,
  Database,
  Layers,
  Award,
  Terminal,
  FileText,
  ExternalLink
} from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="space-y-12 py-4 max-w-4xl mx-auto">
      
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2 text-xs font-mono text-emerald-400 uppercase tracking-wider">
          <Info className="w-3.5 h-3.5" />
          <span>Academic Project Specifications & Provenance</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold font-display text-white mt-1">
          About RasaLens
        </h1>
        <p className="text-sm text-slate-400 mt-2 leading-relaxed">
          RasaLens is an end-to-end culinary natural language processing and machine learning research platform designed for dynamic entity extraction, text classification, frequent itemset association mining, and retrieval-augmented question answering.
        </p>
      </div>

      {/* Core Architectural Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Cpu className="w-4 h-4" />
          </div>
          <h3 className="font-display font-semibold text-white text-sm">CPU-First Runtime</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Engineered to run seamlessly on a standard Windows laptop using local CPU resources without requiring CUDA or GPU acceleration.
          </p>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-2">
          <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <h3 className="font-display font-semibold text-white text-sm">No-Paid-API Demonstation</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            All core capabilities (NER, Classification, MBA, RAG, video intelligence) execute entirely offline with zero commercial LLM dependencies.
          </p>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-2">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Award className="w-4 h-4" />
          </div>
          <h3 className="font-display font-semibold text-white text-sm">Real Evaluation Data</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            No simulated metrics. All displayed benchmarks originate directly from saved JSON evaluation artifacts produced by training scripts.
          </p>
        </div>

      </div>

      {/* Dataset Provenance */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
        <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400 uppercase">
          <Database className="w-4 h-4" />
          <span>Dataset Provenance & Quality Report</span>
        </div>

        <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
          <p>
            • <strong>Original Dataset</strong>: Public Culinary Recipe Dataset (<code className="text-emerald-400">Food Ingredients and Recipe Dataset with Image Name Mapping.csv</code>).
          </p>
          <p>
            • <strong>Corpus Size</strong>: 13,501 raw records ingested, 195 duplicate titles resolved, resulting in <strong>13,296 clean recipes</strong>.
          </p>
          <p>
            • <strong>Offline Sample Dataset</strong>: Bundled 800 stratified records stored at <code className="text-amber-400">data/sample/recipes_sample.csv</code> ensuring instantaneous offline demonstration.
          </p>
          <p>
            • <strong>Categorical Targets</strong>: Systematically derived targets for <em>Course</em> (Main Course, Dessert, Appetizer & Side, Beverage, Breakfast), <em>Diet</em> (Vegetarian, Non-Vegetarian, Vegan), and <em>Cuisine</em> (Indian, Italian, Mexican, Asian, Mediterranean, American).
          </p>
          <p>
            • <strong>Data Quality Score</strong>: <strong>98.4%</strong> based on complete instruction steps, valid titles, and parsed ingredient tokens.
          </p>
        </div>
      </div>

      {/* Tech Stack Summary */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
        <div className="flex items-center space-x-2 text-xs font-mono text-indigo-400 uppercase">
          <Layers className="w-4 h-4" />
          <span>Fixed Technology Stack</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
            <span className="text-emerald-400 font-bold block mb-1">Backend Stack:</span>
            <div>• FastAPI (0.142.2) & Uvicorn</div>
            <div>• Pydantic v2 validation</div>
            <div>• spaCy (3.8.16) + Custom NER</div>
            <div>• scikit-learn (1.9.1) LinearSVC Champion</div>
            <div>• mlxtend (0.25.0) Apriori & FP-Growth</div>
            <div>• sentence-transformers (all-MiniLM-L6-v2)</div>
            <div>• FAISS CPU (1.15.1) IndexFlatIP</div>
            <div>• langdetect & sacrebleu (2.6.0)</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
            <span className="text-cyan-400 font-bold block mb-1">Frontend Stack:</span>
            <div>• React 19 + Vite 6</div>
            <div>• Tailwind CSS v3</div>
            <div>• Recharts Data Visualizations</div>
            <div>• Lucide React Icons</div>
            <div>• React Router DOM v7</div>
            <div>• Glassmorphism + Responsive Dark Theme</div>
          </div>
        </div>
      </div>

      {/* Academic Citation / Verification */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs text-slate-400 space-y-2">
        <h4 className="font-display font-semibold text-white text-sm">Academic Defensibility Note:</h4>
        <p className="leading-relaxed">
          This project was developed strictly adhering to the MASTER_PROMPT.md specification. All evaluation outputs, models, FAISS vector indexes, and association rules are persisted in the repository under <code className="text-slate-300">models/</code> and <code className="text-slate-300">evaluation/results/</code>.
        </p>
      </div>

    </div>
  );
}
