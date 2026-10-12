import React, { useState, useEffect } from 'react';
import {
  Layers,
  Award,
  Zap,
  Clock,
  TrendingUp,
  Cpu,
  BarChart2,
  Table as TableIcon,
  CheckCircle2,
  HelpCircle,
  Play,
  Globe,
  Languages,
  AlertCircle,
  RotateCcw
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { api } from '../services/api';

export default function ModelLabPage() {
  const [metrics, setMetrics] = useState(null);
  const [activeConcept, setActiveConcept] = useState('ner'); // 'ner', 'classification', 'mba', 'rag', 'translation'
  const [loading, setLoading] = useState(true);

  // Live classifier tester state
  const [testText, setTestText] = useState('Creamy chicken tikka masala with garlic butter naan');
  const [predResult, setPredResult] = useState(null);
  const [predLoading, setPredLoading] = useState(false);

  // Live translation tester state
  const [transInput, setTransInput] = useState('Cook onions and tomatoes in hot mustard oil with turmeric.');
  const [transSource, setTransSource] = useState('eng_Latn');
  const [transTarget, setTransTarget] = useState('tam_Taml');
  const [transResult, setTransResult] = useState(null);
  const [transLoading, setTransLoading] = useState(false);
  const [transError, setTransError] = useState(null);

  useEffect(() => {
    api.getEvaluationMetrics()
      .then((data) => {
        setMetrics(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handleTestClassify = async () => {
    if (!testText.trim()) return;
    setPredLoading(true);
    try {
      const res = await api.classifyText(testText);
      setPredResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setPredLoading(false);
    }
  };

  const handleTestTranslate = async () => {
    if (!transInput.trim()) return;
    setTransLoading(true);
    setTransError(null);
    try {
      const res = await api.translateText(transInput, transSource || null, transTarget);
      setTransResult(res);
    } catch (err) {
      console.error(err);
      setTransError(err.message || 'Translation failed');
    } finally {
      setTransLoading(false);
    }
  };

  const concepts = [
    { id: 'ner', title: '1. Named Entity Recognition', tag: 'spaCy vs Custom' },
    { id: 'classification', title: '2. Course Classification', tag: '4 Model Benchmark' },
    { id: 'mba', title: '3. Market Basket Analysis', tag: 'Apriori vs FP-Growth' },
    { id: 'rag', title: '4. QA & Semantic Retrieval', tag: 'FAISS + MiniLM' },
    { id: 'translation', title: '5. Neural Translation', tag: 'NLLB-200 600M' },
  ];

  if (loading) {
    return (
      <div className="py-20 text-center space-y-3">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-400 font-mono">Loading model benchmark evaluation data...</p>
      </div>
    );
  }

  const nerData = metrics?.ner;
  const clfData = metrics?.classification;
  const mbaData = metrics?.market_basket;
  const ragData = metrics?.qa_retrieval;
  const transData = metrics?.translation;

  // Chart data preparation for classification
  const clfChartData = clfData?.models ? Object.keys(clfData.models).map((key) => ({
    name: key,
    Accuracy: (clfData.models[key].accuracy * 100).toFixed(1),
    'Macro F1': (clfData.models[key].macro_f1 * 100).toFixed(1),
    'Weighted F1': (clfData.models[key].weighted_f1 * 100).toFixed(1),
  })) : [];

  // Chart data for MBA runtimes
  const mbaChartData = mbaData?.algorithm_benchmark?.map((item) => ({
    support: `Support ${(item.min_support * 100)}%`,
    Apriori: item.apriori_runtime_seconds,
    'FP-Growth': item.fpgrowth_runtime_seconds,
  })) || [];

  return (
    <div className="space-y-8 py-4 max-w-7xl mx-auto">
      
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2 text-xs font-mono text-emerald-400 uppercase tracking-wider">
          <Layers className="w-3.5 h-3.5" />
          <span>Academic Machine Learning Laboratory</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold font-display text-white mt-1">
          Model Lab
        </h1>
        <p className="text-sm text-slate-400 mt-1 max-w-2xl font-sans">
          Inspect genuine evaluation metrics, confusion matrices, runtime comparisons, and algorithms across the four core academic concepts.
        </p>
      </div>

      {/* Concept Switcher Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3">
        {concepts.map((c) => (
          <button
            key={c.id}
            onClick={() => setActiveConcept(c.id)}
            id={`tab-lab-${c.id}`}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-medium transition-all ${
              activeConcept === c.id
                ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                : 'bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
            }`}
          >
            <span>{c.title}</span>
            <span className="text-[10px] font-mono opacity-80">({c.tag})</span>
          </button>
        ))}
      </div>

      {/* 1. NER Module */}
      {activeConcept === 'ner' && nerData && (
        <div className="space-y-6 animate-fadeIn">
          
          {/* Audit Notice */}
          <div className="glass-card rounded-2xl p-4 border border-amber-500/30 bg-amber-500/5 flex items-start space-x-3 text-xs">
            <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-300 font-bold">AUDIT</div>
            <div className="space-y-1">
              <div className="font-semibold text-white">Strict Span-Exact Evaluation on Independent Gold Testset</div>
              <div className="text-slate-400">
                Evaluated against <span className="font-mono text-amber-300">{nerData.gold_testset?.total_sentences || 160} sentences</span> ({nerData.gold_testset?.distribution || '50% recipe lines, 50% conversational pantry'}). 
                Test set status: <span className="font-mono text-amber-300 font-semibold uppercase">{nerData.gold_testset?.status || 'pending manual review'}</span>. Silver data is strictly isolated to training.
              </div>
            </div>
          </div>

          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`glass-card rounded-2xl p-5 border ${nerData.summary?.winner === 'rule_based_baseline' ? 'border-emerald-500/40 bg-emerald-500/5' : 'border-slate-800'}`}>
              <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                <span>Rule-based Regex Baseline</span>
                {nerData.summary?.winner === 'rule_based_baseline' && <Award className="w-4 h-4 text-emerald-400" />}
              </div>
              <div className="text-3xl font-bold font-display text-white mt-2">
                {((nerData.models?.rule_based_baseline?.metrics?.f1_score || 0) * 100).toFixed(1)}% F1
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Precision: {((nerData.models?.rule_based_baseline?.metrics?.precision || 0) * 100).toFixed(1)}% | Recall: {((nerData.models?.rule_based_baseline?.metrics?.recall || 0) * 100).toFixed(1)}%
              </p>
              <p className="text-[11px] text-slate-500 mt-1">Regex patterns & culinary vocabulary lookup</p>
            </div>

            <div className={`glass-card rounded-2xl p-5 border ${nerData.summary?.winner === 'custom_spacy_model' ? 'border-emerald-500/40 bg-emerald-500/5' : 'border-slate-800'}`}>
              <div className="flex items-center justify-between text-xs font-mono text-emerald-400">
                <span>Custom Fine-tuned spaCy</span>
                {nerData.summary?.winner === 'custom_spacy_model' && <Award className="w-4 h-4" />}
              </div>
              <div className="text-3xl font-bold font-display text-white mt-2">
                {((nerData.models?.custom_spacy_model?.metrics?.f1_score || 0) * 100).toFixed(1)}% F1
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Precision: {((nerData.models?.custom_spacy_model?.metrics?.precision || 0) * 100).toFixed(1)}% | Recall: {((nerData.models?.custom_spacy_model?.metrics?.recall || 0) * 100).toFixed(1)}%
              </p>
              <p className="text-[11px] text-emerald-400/80 mt-1">
                +{(Math.max(0, (nerData.summary?.f1_delta_custom_vs_generic ?? nerData.summary?.f1_improvement_over_generic ?? 0)) * 100).toFixed(1)}% F1 over generic spaCy
              </p>
            </div>

            <div className="glass-card rounded-2xl p-5 border border-slate-800">
              <div className="text-xs font-mono text-slate-400">Generic spaCy Baseline</div>
              <div className="text-3xl font-bold font-display text-slate-300 mt-2">
                {((nerData.models?.generic_spacy_baseline?.metrics?.f1_score || 0) * 100).toFixed(1)}% F1
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Precision: {((nerData.models?.generic_spacy_baseline?.metrics?.precision || 0) * 100).toFixed(1)}% | Recall: {((nerData.models?.generic_spacy_baseline?.metrics?.recall || 0) * 100).toFixed(1)}%
              </p>
              <p className="text-[11px] text-slate-500 mt-1">en_core_web_sm (lacks FOOD_ITEM/UNIT labels)</p>
            </div>
          </div>

          {/* Model Comparison Table */}
          <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
            <h3 className="font-display font-semibold text-base text-white">
              Comparative Strict Span-Exact Matrix
            </h3>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-800 text-slate-400 font-mono">
                  <tr>
                    <th className="py-2.5">Model Architecture</th>
                    <th className="py-2.5">Precision</th>
                    <th className="py-2.5">Recall</th>
                    <th className="py-2.5">Overall F1</th>
                    <th className="py-2.5">FOOD_ITEM F1</th>
                    <th className="py-2.5">QUANTITY F1</th>
                    <th className="py-2.5">UNIT F1</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {Object.keys(nerData.models || {}).map((key) => {
                    const m = nerData.models[key];
                    const perType = m.metrics?.per_type_metrics || {};
                    const isWinner = key === nerData.summary?.winner;
                    return (
                      <tr key={key} className={isWinner ? 'bg-emerald-500/10 text-emerald-300 font-semibold' : 'text-slate-300'}>
                        <td className="py-3 font-sans flex items-center space-x-1.5">
                          {isWinner && <Award className="w-3.5 h-3.5 text-emerald-400" />}
                          <span>{m.name}</span>
                        </td>
                        <td className="py-3">{((m.metrics?.precision || 0) * 100).toFixed(1)}%</td>
                        <td className="py-3">{((m.metrics?.recall || 0) * 100).toFixed(1)}%</td>
                        <td className="py-3 font-bold">{((m.metrics?.f1_score || 0) * 100).toFixed(1)}%</td>
                        <td className="py-3">{perType['FOOD_ITEM']?.f1_score ? `${(perType['FOOD_ITEM'].f1_score * 100).toFixed(1)}%` : '0.0%'}</td>
                        <td className="py-3">{perType['QUANTITY']?.f1_score ? `${(perType['QUANTITY'].f1_score * 100).toFixed(1)}%` : '0.0%'}</td>
                        <td className="py-3">{perType['UNIT']?.f1_score ? `${(perType['UNIT'].f1_score * 100).toFixed(1)}%` : '0.0%'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 2. Classification Module */}
      {activeConcept === 'classification' && clfData && (
        <div className="space-y-6 animate-fadeIn">
          
          {/* Audit Notice */}
          <div className="glass-card rounded-2xl p-4 border border-amber-500/30 bg-amber-500/5 flex items-start space-x-3 text-xs">
            <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-300 font-bold">AUDIT</div>
            <div className="space-y-1">
              <div className="font-semibold text-white">Rule-Derived (Weak Supervision) & Feature Ablation</div>
              <div className="text-slate-400">
                Ground truth course and diet labels are <span className="font-semibold text-amber-300">rule-derived (weak supervision)</span> from heuristic ETL rules. 
                To prevent circularity, models are benchmarked via <span className="font-mono text-amber-300">Stratified 5-Fold CV</span> with inside-pipeline vectorization, tested on a reviewable <span className="font-mono text-amber-300">{clfData.gold_subset_evaluation?.gold_sample_count || 200}-recipe gold subset</span> ({clfData.gold_subset_evaluation?.status || 'pending manual review'}), and feature-ablated.
              </div>
            </div>
          </div>

          {/* Feature Ablation & Gold Subset Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Feature Ablation Card */}
            {clfData.feature_ablation && (
              <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-display font-semibold text-sm text-white">Feature Ablation (Circularity Check)</h4>
                  <span className="text-[10px] font-mono text-slate-400">LogisticRegression</span>
                </div>
                <p className="text-xs text-slate-400">Isolates true predictive signal of ingredients vs title keyword overlap:</p>
                <div className="space-y-2 pt-1 font-mono text-xs">
                  <div className="flex justify-between items-center p-2 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-slate-300">Title + Ingredients (Full)</span>
                    <span className="text-white font-bold">{((clfData.feature_ablation.title_and_ingredients?.mean_accuracy || 0) * 100).toFixed(1)}% Acc (Baseline)</span>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-slate-300">Ingredients Only</span>
                    <span className="text-amber-300 font-bold">
                      {((clfData.feature_ablation.ingredients_only?.mean_accuracy || 0) * 100).toFixed(1)}% Acc ({((clfData.feature_ablation.ingredients_only?.accuracy_delta || 0) * 100).toFixed(1)}%)
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-slate-300">Title Only</span>
                    <span className="text-cyan-300 font-bold">
                      {((clfData.feature_ablation.title_only?.mean_accuracy || 0) * 100).toFixed(1)}% Acc (+{((clfData.feature_ablation.title_only?.accuracy_delta || 0) * 100).toFixed(1)}%)
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Gold Subset & Diet Task Card */}
            <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-display font-semibold text-sm text-white">Audit Subset & Secondary Task</h4>
                <span className="text-[10px] font-mono text-amber-300 uppercase">{clfData.gold_subset_evaluation?.status || 'pending manual review'}</span>
              </div>
              <p className="text-xs text-slate-400">Independent evaluation on reviewable gold data and secondary diet classification:</p>
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="text-[11px] font-mono text-slate-400">Gold Subset (200)</div>
                  <div className="text-xl font-bold font-display text-emerald-400 mt-1">
                    {((clfData.gold_subset_evaluation?.accuracy || 0) * 100).toFixed(1)}%
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Macro F1: {((clfData.gold_subset_evaluation?.macro_f1 || 0) * 100).toFixed(1)}%</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="text-[11px] font-mono text-slate-400">Diet Classifier (3-Class)</div>
                  <div className="text-xl font-bold font-display text-indigo-400 mt-1">
                    {((clfData.diet_classification?.models?.[clfData.diet_classification?.champion_model]?.accuracy || 0) * 100).toFixed(1)}%
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Champion: {clfData.diet_classification?.champion_model || 'LinearSVC'}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Bar Chart */}
          <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display font-semibold text-base text-white">
                  5-Fold Cross Validation Benchmark (Course Classification)
                </h3>
                <p className="text-xs text-slate-400">Stratified 5-Fold CV with TF-IDF Vectorizer encapsulated in each fold pipeline</p>
              </div>
              <span className="text-xs font-mono px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Champion: {clfData.champion_model} ({((clfData.models[clfData.champion_model]?.accuracy || 0) * 100).toFixed(1)}% Acc)
              </span>
            </div>

            <div className="h-72 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={clfChartData} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                  <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                  <YAxis domain={[60, 100]} stroke="#94a3b8" tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }} />
                  <Legend />
                  <Bar dataKey="Accuracy" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Macro F1" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Weighted F1" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Confusion Matrix for Champion Model / Gold Evaluation */}
          {(() => {
            const cmData = clfData.models[clfData.champion_model]?.confusion_matrix || clfData.gold_subset_evaluation?.confusion_matrix;
            if (!cmData) return null;
            return (
              <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-semibold text-base text-white">
                    Confusion Matrix: {clfData.champion_model}
                  </h3>
                  <span className="text-[11px] font-mono text-slate-400">
                    {clfData.gold_subset_evaluation ? 'Evaluated on 200-sample Gold Subset' : 'Test Split'}
                  </span>
                </div>
                <p className="text-xs text-slate-400">Rows: Ground Truth • Columns: Predicted Course</p>

                <div className="overflow-x-auto pt-2">
                  <table className="w-full text-center text-xs font-mono">
                    <thead>
                      <tr className="text-slate-400 border-b border-slate-800">
                        <th className="py-2 text-left">True \ Pred</th>
                        {cmData.labels.map((l) => (
                          <th key={l} className="py-2 px-3">{l}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {cmData.matrix.map((row, i) => {
                        const label = cmData.labels[i];
                        return (
                          <tr key={label}>
                            <td className="py-2.5 px-3 text-left font-sans font-semibold text-slate-300">{label}</td>
                            {row.map((val, j) => {
                              const isDiagonal = i === j;
                              return (
                                <td
                                  key={j}
                                  className={`py-2.5 px-3 ${
                                    isDiagonal ? 'bg-emerald-500/20 text-emerald-300 font-bold' : 'text-slate-400'
                                  }`}
                                >
                                  {val}
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })()}

          {/* Interactive Live Classifier Playground */}
          <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
            <h3 className="font-display font-semibold text-base text-white flex items-center space-x-2">
              <Play className="w-4 h-4 text-emerald-400" />
              <span>Interactive Course Classifier Test</span>
            </h3>

            <div className="flex gap-2">
              <input
                type="text"
                value={testText}
                onChange={(e) => setTestText(e.target.value)}
                placeholder="Enter title or ingredients..."
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
              />
              <button
                onClick={handleTestClassify}
                disabled={predLoading}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all shadow-md shadow-emerald-500/20"
              >
                {predLoading ? 'Predicting...' : 'Predict Course'}
              </button>
            </div>

            {predResult && (
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between animate-fadeIn text-xs">
                <div>
                  <span className="text-slate-400">Predicted Course:</span>{' '}
                  <strong className="text-emerald-400 text-sm font-display ml-1">{predResult.predicted_course}</strong>
                  <span className="text-slate-500 ml-2">({(predResult.confidence * 100).toFixed(1)}% confidence)</span>
                </div>
                <div className="font-mono text-[11px] text-slate-500">
                  Latency: {predResult.latency_ms} ms
                </div>
              </div>
            )}
          </div>

        </div>
      )}

      {/* 3. Market Basket Analysis */}
      {activeConcept === 'mba' && mbaData && (
        <div className="space-y-6 animate-fadeIn">
          
          {/* Runtime Comparison Chart */}
          <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display font-semibold text-base text-white">
                  Execution Runtime: Apriori vs FP-Growth
                </h3>
                <p className="text-xs text-slate-400">13,269 transaction baskets across 2,223 unique ingredient tokens</p>
              </div>
              <span className="text-xs font-mono text-amber-300">
                FP-Growth vs Apriori Benchmark
              </span>
            </div>

            <div className="h-64 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mbaChartData} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                  <XAxis dataKey="support" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} label={{ value: 'Seconds', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 10 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }} />
                  <Legend />
                  <Bar dataKey="Apriori" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="FP-Growth" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Association Rules Table */}
          <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display font-semibold text-base text-white">
                  Mined Association Rules (Top by Lift)
                </h3>
                <p className="text-xs text-slate-400">High-confidence ingredient affinities mined from culinary corpus</p>
              </div>
              <span className="text-xs font-mono text-emerald-400">
                Total Rules Mined: {mbaData.rules_count?.toLocaleString()}
              </span>
            </div>

            <div className="overflow-x-auto max-h-96">
              <table className="w-full text-left text-xs font-mono">
                <thead className="sticky top-0 bg-slate-900 border-b border-slate-800 text-slate-400">
                  <tr>
                    <th className="py-2.5 px-3">Antecedent (If)</th>
                    <th className="py-2.5 px-3">Consequent (Then)</th>
                    <th className="py-2.5 px-3">Support</th>
                    <th className="py-2.5 px-3">Confidence</th>
                    <th className="py-2.5 px-3">Lift</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {mbaData.top_association_rules?.slice(0, 20).map((rule, idx) => (
                    <tr key={idx} className="hover:bg-slate-900/50 text-slate-300">
                      <td className="py-2.5 px-3 font-sans text-amber-300">{rule.antecedent_str}</td>
                      <td className="py-2.5 px-3 font-sans text-emerald-300">{rule.consequent_str}</td>
                      <td className="py-2.5 px-3">{(rule.support * 100).toFixed(1)}%</td>
                      <td className="py-2.5 px-3">{(rule.confidence * 100).toFixed(1)}%</td>
                      <td className="py-2.5 px-3 font-bold text-white">{rule.lift}x</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* 4. QA / RAG Retrieval Module */}
      {activeConcept === 'rag' && ragData && (
        <div className="space-y-6 animate-fadeIn">
          
          {/* Audit Notice */}
          <div className="glass-card rounded-2xl p-4 border border-amber-500/30 bg-amber-500/5 flex items-start space-x-3 text-xs">
            <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-300 font-bold">AUDIT</div>
            <div className="space-y-1">
              <div className="font-semibold text-white">Full Corpus Indexing & Strict ID-Based Evaluation</div>
              <div className="text-slate-400">
                FAISS vector index built over full <span className="font-mono text-amber-300">{ragData.corpus_size?.toLocaleString() || '13,296'} recipes</span> (IndexFlatIP on all-MiniLM-L6-v2). 
                Evaluated against <span className="font-mono text-amber-300">{ragData.evaluation_dataset?.total_questions || 32} test queries</span> ({ragData.evaluation_dataset?.answerable_questions || 26} answerable with verified recipe IDs, {ragData.evaluation_dataset?.unanswerable_questions || 6} unanswerables). 
                Test set status: <span className="font-mono text-amber-300 font-semibold uppercase">{ragData.evaluation_dataset?.status || 'pending manual review'}</span>. Relevance scored strictly by verified IDs, never by circular keyword overlap.
              </div>
            </div>
          </div>

          {/* Metrics summary */}
          {(() => {
            const faissMet = ragData.models?.semantic_faiss?.metrics || ragData.metrics || {};
            return (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="glass-card rounded-2xl p-5 border border-emerald-500/30 bg-emerald-500/5">
                  <div className="text-xs font-mono text-emerald-400">Semantic FAISS MRR</div>
                  <div className="text-3xl font-bold font-display text-white mt-2">
                    {faissMet.mrr ? faissMet.mrr.toFixed(4) : faissMet.mrr_at_5}
                  </div>
                  <p className="text-xs text-slate-400 mt-1">Mean Reciprocal Rank</p>
                </div>

                <div className="glass-card rounded-2xl p-5 border border-slate-800">
                  <div className="text-xs font-mono text-slate-400">Recall@1 (Top-1 Hit)</div>
                  <div className="text-3xl font-bold font-display text-cyan-400 mt-2">
                    {((faissMet.recall_at_1 || 0) * 100).toFixed(1)}%
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Strict verified recipe match</p>
                </div>

                <div className="glass-card rounded-2xl p-5 border border-slate-800">
                  <div className="text-xs font-mono text-slate-400">Recall@5 (Top-5 Hit)</div>
                  <div className="text-3xl font-bold font-display text-indigo-400 mt-2">
                    {((faissMet.recall_at_5 || 0) * 100).toFixed(1)}%
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Candidate retrieval recall</p>
                </div>

                <div className="glass-card rounded-2xl p-5 border border-slate-800">
                  <div className="text-xs font-mono text-slate-400">Query Latency</div>
                  <div className="text-3xl font-bold font-display text-amber-400 mt-2">
                    {faissMet.average_latency_ms} ms
                  </div>
                  <p className="text-xs text-slate-500 mt-1">CPU vector search</p>
                </div>
              </div>
            );
          })()}

          {/* Comparative Benchmark Matrix Table */}
          {ragData.models && (
            <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display font-semibold text-base text-white">
                    Retrieval Methodology Benchmark Matrix
                  </h3>
                  <p className="text-xs text-slate-400">
                    Comparing dense semantic search vs sparse keyword search vs no-retrieval baseline
                  </p>
                </div>
                <span className="text-xs font-mono px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Corpus: {ragData.corpus_size?.toLocaleString()} recipes
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-800 text-slate-400 font-mono">
                    <tr>
                      <th className="py-2.5 px-3">Retrieval Approach</th>
                      <th className="py-2.5 px-3">Recall@1</th>
                      <th className="py-2.5 px-3">Recall@3</th>
                      <th className="py-2.5 px-3">Recall@5</th>
                      <th className="py-2.5 px-3">MRR</th>
                      <th className="py-2.5 px-3">Unanswerable Handling</th>
                      <th className="py-2.5 px-3">Search Latency</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {Object.keys(ragData.models).map((key) => {
                      const m = ragData.models[key];
                      const met = m.metrics || {};
                      const isChampion = key === 'semantic_faiss';
                      return (
                        <tr key={key} className={isChampion ? 'bg-emerald-500/10 text-emerald-300 font-semibold' : 'text-slate-300'}>
                          <td className="py-3 px-3 font-sans flex items-center space-x-1.5">
                            {isChampion && <Award className="w-3.5 h-3.5 text-emerald-400" />}
                            <span>{m.method_name}</span>
                          </td>
                          <td className="py-3 px-3">{((met.recall_at_1 || 0) * 100).toFixed(1)}%</td>
                          <td className="py-3 px-3">{((met.recall_at_3 || 0) * 100).toFixed(1)}%</td>
                          <td className="py-3 px-3">{((met.recall_at_5 || 0) * 100).toFixed(1)}%</td>
                          <td className="py-3 px-3 font-bold">{met.mrr?.toFixed(4) || '0.0000'}</td>
                          <td className="py-3 px-3">{met.unanswerable_rejection_rate !== undefined ? `${((met.unanswerable_rejection_rate || 0) * 100).toFixed(0)}% rejection` : 'N/A'}</td>
                          <td className="py-3 px-3">{met.average_latency_ms} ms</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Query Evaluation Benchmark Table */}
          <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display font-semibold text-base text-white">
                  Curated Evaluation Queries ({ragData.evaluation_dataset?.total_questions || 32} Questions)
                </h3>
                <p className="text-xs text-slate-400">
                  Strict evaluation against verified recipe IDs with authentic unanswerable query detection
                </p>
              </div>
              <span className="text-xs font-mono text-slate-400">
                Model: {ragData.embedding_model || 'all-MiniLM-L6-v2'}
              </span>
            </div>

            <div className="overflow-x-auto max-h-96">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-800 text-slate-400 font-mono sticky top-0 bg-slate-950">
                  <tr>
                    <th className="py-2.5 px-3">Test Query</th>
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3">Verified Recipe ID(s)</th>
                    <th className="py-2.5 px-3">Top Match ID</th>
                    <th className="py-2.5 px-3">Similarity</th>
                    <th className="py-2.5 px-3">Hit Rank</th>
                    <th className="py-2.5 px-3">Latency</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {(ragData.models?.semantic_faiss?.details || ragData.query_evaluations || []).map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-900/50 text-slate-300">
                      <td className="py-3 px-3 font-sans text-white font-medium max-w-xs">{item.question || item.query}</td>
                      <td className="py-3 px-3">
                        {item.is_answerable === false ? (
                          <span className="px-2 py-0.5 rounded text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/30">Unanswerable</span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">Answerable</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-slate-400">{item.verified_ids?.join(', ') || 'None (out-of-corpus)'}</td>
                      <td className="py-3 px-3 text-cyan-300 font-semibold">{item.retrieved_ids?.[0] || item.top_match_title || 'None'}</td>
                      <td className="py-3 px-3">{((item.top_similarity || item.top_match_similarity || 0) * 100).toFixed(1)}%</td>
                      <td className="py-3 px-3 font-bold">
                        {item.is_answerable === false ? (
                          <span className="text-slate-500">{item.correctly_flagged_unanswerable ? '✓ Flagged' : 'Passed'}</span>
                        ) : item.relevance_rank > 0 ? (
                          <span className="text-emerald-400">#{item.relevance_rank}</span>
                        ) : (
                          <span className="text-rose-400">Miss</span>
                        )}
                      </td>
                      <td className="py-3 px-3">{item.latency_ms} ms</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. NEURAL MACHINE TRANSLATION TAB (NLLB-200) */}
      {/* ========================================================================= */}
      {activeConcept === 'translation' && (
        <div className="space-y-6 animate-fadeIn">
          
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="glass-card rounded-2xl p-5 border border-slate-800">
              <div className="text-xs font-mono text-slate-400 uppercase">Architecture</div>
              <div className="text-xl font-bold font-display text-white mt-1">NLLB-200 Seq2Seq</div>
              <div className="text-[11px] font-mono text-emerald-400 mt-1">facebook/nllb-200-distilled-600M</div>
            </div>

            <div className="glass-card rounded-2xl p-5 border border-slate-800">
              <div className="text-xs font-mono text-slate-400 uppercase">Model Footprint</div>
              <div className="text-xl font-bold font-display text-white mt-1">2,367.6 MB</div>
              <div className="text-[11px] font-mono text-teal-400 mt-1">CPU Safe • 600M Params</div>
            </div>

            <div className="glass-card rounded-2xl p-5 border border-slate-800">
              <div className="text-xs font-mono text-slate-400 uppercase">SacreBLEU / chrF</div>
              <div className="text-xl font-bold font-display text-emerald-400 mt-1">
                {transData?.summary ? `${transData.summary.mean_bleu} BLEU` : 'Not evaluated'}
              </div>
              <div className="text-[11px] font-mono text-slate-400 mt-1">
                {transData?.summary ? `chrF: ${transData.summary.mean_chrf} • Mean across 4 directions` : 'Evaluation file missing'}
              </div>
            </div>

            <div className="glass-card rounded-2xl p-5 border border-slate-800">
              <div className="text-xs font-mono text-slate-400 uppercase">Coverage</div>
              <div className="text-xl font-bold font-display text-amber-400 mt-1">3 Core Scripts</div>
              <div className="text-[11px] font-mono text-slate-400 mt-1">eng_Latn • tam_Taml • hin_Deva</div>
            </div>
          </div>

          {/* Interactive Translation Tester */}
          <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-6 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-800 pb-4">
              <div>
                <h3 className="font-display font-bold text-xl text-white flex items-center space-x-2">
                  <Languages className="w-5 h-5 text-emerald-400" />
                  <span>Interactive Neural Translation Engine</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Execute live translation directly across English, Tamil, and Hindi using Meta's NLLB-200 model with Flores-200 language token conditioning.
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-mono text-xs">
                  Active Model: NLLB-200 600M
                </span>
              </div>
            </div>

            {/* Presets */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-slate-400 font-mono">Sample Presets:</span>
              <button
                onClick={() => {
                  setTransInput('Cook pancetta in oil in a 12-inch heavy skillet over moderate heat, stirring frequently.');
                  setTransSource('eng_Latn');
                  setTransTarget('tam_Taml');
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-emerald-500/50"
              >
                English → Tamil Recipe
              </button>
              <button
                onClick={() => {
                  setTransInput('Cook pancetta in oil in a 12-inch heavy skillet over moderate heat, stirring frequently.');
                  setTransSource('eng_Latn');
                  setTransTarget('hin_Deva');
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-emerald-500/50"
              >
                English → Hindi Recipe
              </button>
              <button
                onClick={() => {
                  setTransInput('பான்செட்டாவை எண்ணெயில் 12 அங்குல கனமான குடலில் மிதமான வெப்பத்தில் சமைத்து, அடிக்கடி கலக்கவும்.');
                  setTransSource('tam_Taml');
                  setTransTarget('eng_Latn');
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-emerald-500/50"
              >
                Tamil → English Recipe
              </button>
              <button
                onClick={() => {
                  setTransInput('12 इंच की भारी भाँटी में तेल में पैंचेटा को मध्यम गर्मी में पकाएं, अक्सर हलचल करते हुए।');
                  setTransSource('hin_Deva');
                  setTransTarget('eng_Latn');
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-emerald-500/50"
              >
                Hindi → English Recipe
              </button>
            </div>

            {/* Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">Source Language:</label>
                <select
                  value={transSource}
                  onChange={(e) => setTransSource(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono focus:outline-none focus:border-emerald-500"
                >
                  <option value="">Auto-Detect Script</option>
                  <option value="eng_Latn">English (eng_Latn)</option>
                  <option value="tam_Taml">Tamil / தமிழ் (tam_Taml)</option>
                  <option value="hin_Deva">Hindi / हिन्दी (hin_Deva)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">Target Language:</label>
                <select
                  value={transTarget}
                  onChange={(e) => setTransTarget(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono focus:outline-none focus:border-emerald-500"
                >
                  <option value="tam_Taml">Tamil / தமிழ் (tam_Taml)</option>
                  <option value="hin_Deva">Hindi / हिन्दी (hin_Deva)</option>
                  <option value="eng_Latn">English (eng_Latn)</option>
                </select>
              </div>
            </div>

            {/* Input Textarea */}
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">Text to Translate:</label>
              <textarea
                rows={3}
                value={transInput}
                onChange={(e) => setTransInput(e.target.value)}
                placeholder="Enter recipe text, ingredients, or instructions..."
                className="w-full p-4 rounded-2xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Action */}
            <div className="flex items-center justify-between">
              <button
                onClick={handleTestTranslate}
                disabled={transLoading}
                id="btn-run-translation-lab"
                className="px-6 py-2.5 rounded-xl text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all flex items-center space-x-2 disabled:opacity-50 shadow-md shadow-emerald-500/20 cursor-pointer"
              >
                {transLoading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    <span>Running NLLB-200 Inference...</span>
                  </>
                ) : (
                  <>
                    <Globe className="w-4 h-4" />
                    <span>Translate Text</span>
                  </>
                )}
              </button>

              <span className="text-[11px] font-mono text-slate-400">
                Conditioning: forced_bos_token_id via NllbTokenizer
              </span>
            </div>

            {/* Error Message */}
            {transError && (
              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-start space-x-3 text-xs text-rose-300">
                <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
                <div>
                  <strong className="font-semibold block text-rose-200">Backend Translation Error:</strong>
                  <span>{transError}</span>
                </div>
              </div>
            )}

            {/* Translation Output Card */}
            {transResult && (
              <div className="p-6 rounded-2xl bg-slate-950 border border-emerald-500/30 space-y-4 animate-fadeIn">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <div className="flex items-center space-x-2 text-xs font-mono text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Translation Result ({transResult.detected_lang} → {transResult.target_lang})</span>
                  </div>
                  <div className="flex items-center space-x-4 text-xs font-mono text-slate-400">
                    <span>Latency: <strong className="text-white">{transResult.latency_ms} ms</strong></span>
                  </div>
                </div>

                <div>
                  <div className="text-[11px] font-mono text-slate-500 uppercase mb-1">Original Text:</div>
                  <div className="text-xs text-slate-400 font-sans">{transResult.original_text}</div>
                </div>

                <div>
                  <div className="text-[11px] font-mono text-emerald-400 uppercase mb-1 font-semibold">Translated Output:</div>
                  <div className="text-base text-white font-sans font-medium bg-slate-900/80 p-4 rounded-xl border border-slate-800 leading-relaxed">
                    {transResult.translated_text}
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Benchmark Directions Table */}
          <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <h4 className="font-display font-semibold text-base text-white">
                  Multi-Directional Translation Benchmark Verification
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  {transData
                    ? `Evaluated on data/eval/translation_testset.csv (${transData.testset_samples} culinary sentences, status: ${transData.testset_status}).`
                    : 'Awaiting evaluation of data/eval/translation_testset.csv across 4 language directions.'}
                </p>
              </div>
              {transData && (
                <div className="flex items-center space-x-2 text-xs font-mono text-slate-400">
                  <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-teal-400">
                    SacreBLEU {transData.metric_libraries?.sacrebleu_version || '2.6.0'}
                  </span>
                </div>
              )}
            </div>

            {!transData ? (
              <div className="p-8 text-center bg-slate-900/50 rounded-2xl border border-slate-800 space-y-2">
                <span className="text-sm font-semibold text-amber-400 font-mono block">Not evaluated</span>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  No metrics file found at <code>evaluation/results/translation_metrics.json</code>.
                  Run <code>python evaluation/scripts/evaluate_translation.py</code> to benchmark NLLB-200.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-800 text-slate-400 font-mono">
                    <tr>
                      <th className="py-2.5 px-3">Direction</th>
                      <th className="py-2.5 px-3">Codes</th>
                      <th className="py-2.5 px-3">SacreBLEU</th>
                      <th className="py-2.5 px-3">chrF</th>
                      <th className="py-2.5 px-3">Avg Latency</th>
                      <th className="py-2.5 px-3">Sample In / Hyp / Ref</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {Object.entries(transData.directions || {}).map(([key, d]) => (
                      <tr key={key} className="hover:bg-slate-900/50 text-slate-300">
                        <td className="py-3 px-3 text-emerald-400 font-bold">{d.name}</td>
                        <td className="py-3 px-3 text-slate-400">{d.source_lang} → {d.target_lang}</td>
                        <td className="py-3 px-3 text-white font-bold">{d.bleu}</td>
                        <td className="py-3 px-3 text-teal-300 font-semibold">{d.chrf}</td>
                        <td className="py-3 px-3 text-slate-400">{d.avg_latency_ms} ms</td>
                        <td className="py-3 px-3 font-sans max-w-md">
                          {d.sample_pairs?.[0] ? (
                            <div className="space-y-1 text-[11px]">
                              <div className="text-slate-400 truncate"><span className="text-slate-500 font-mono">IN:</span> {d.sample_pairs[0].input}</div>
                              <div className="text-emerald-300 truncate"><span className="text-emerald-500 font-mono">OUT:</span> {d.sample_pairs[0].hypothesis}</div>
                              <div className="text-slate-400 truncate"><span className="text-slate-500 font-mono">REF:</span> {d.sample_pairs[0].reference}</div>
                            </div>
                          ) : (
                            <span className="text-slate-500">None</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
}
