import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Bot, Send, Sparkles, Clock, AlertTriangle, CheckCircle2,
  ExternalLink, Layers, Search, RefreshCw, ChefHat, Info, ArrowRight
} from 'lucide-react';
import { api } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

export default function RecipeAssistantPage() {
  const { t, language, translateToEnglish } = useLanguage();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);

  const sampleQueries = [
    { text: t('assistant.sample_1', 'How do I make authentic vegetable biryani?'), tag: 'Indian' },
    { text: t('assistant.sample_2', 'Quick high-protein breakfast with eggs and spinach'), tag: 'Breakfast' },
    { text: t('assistant.sample_3', 'Creamy garlic parmesan pasta in under 25 minutes'), tag: 'Italian' },
    { text: t('assistant.sample_4', 'What is the capital of France?'), tag: 'Out-of-Domain' }
  ];

  const handleAsk = async (queryText) => {
    const q = (queryText || query).trim();
    if (!q) return;

    setLoading(true);
    setError(null);

    try {
      // If UI is in Tamil/Hindi, translate query to English for FAISS retrieval
      let searchEmbeddingQuery = q;
      if (language !== 'en') {
        searchEmbeddingQuery = await translateToEnglish(q);
      }

      const res = await api.queryQA(searchEmbeddingQuery, 5);

      const newEntry = {
        originalQuery: q,
        translatedQuery: searchEmbeddingQuery !== q ? searchEmbeddingQuery : null,
        result: res,
        timestamp: new Date().toLocaleTimeString()
      };

      setResult(newEntry);
      setHistory(prev => [newEntry, ...prev.slice(0, 4)]);
      setQuery('');
    } catch (err) {
      console.error('QA query error:', err);
      setError(err.message || 'Failed to retrieve grounded recipes.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleAsk();
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 space-y-8 animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-slate-800">
        <div className="space-y-1.5">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold font-display text-white">
                {t('assistant.title', 'Culinary Recipe Assistant')}
              </h1>
              <p className="text-xs text-slate-400">
                {t('assistant.subtitle', 'Interactive semantic question answering powered by local FAISS vector search across 13,296 recipes.')}
              </p>
            </div>
          </div>
        </div>

        {/* Status Indicators */}
        <div className="flex items-center space-x-2 text-xs font-mono">
          <span className="px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            FAISS Index (13,296 vectors)
          </span>
          <span className="px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-teal-400">
            all-MiniLM-L6-v2 • CPU
          </span>
        </div>
      </div>

      {/* Query Input Section */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4 shadow-xl">
        <form onSubmit={handleSubmit} className="relative flex items-center">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('assistant.input_placeholder', 'Ask a recipe question (e.g. "Quick vegetarian pasta with spinach")...')}
            className="w-full bg-slate-900/90 text-slate-100 placeholder-slate-500 text-sm rounded-xl pl-4 pr-32 py-3.5 border border-slate-700/80 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all shadow-inner"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="absolute right-2 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-semibold text-xs flex items-center space-x-1.5 transition-all shadow-md shadow-emerald-500/20"
          >
            {loading ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Searching...</span>
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>{t('assistant.ask_button', 'Ask Assistant')}</span>
              </>
            )}
          </button>
        </form>

        {/* Suggested Queries Chips */}
        <div className="space-y-2">
          <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
            {t('assistant.sample_queries', 'Suggested Questions:')}
          </span>
          <div className="flex flex-wrap gap-2">
            {sampleQueries.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setQuery(item.text);
                  handleAsk(item.text);
                }}
                disabled={loading}
                className="group text-left px-3 py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/50 text-xs text-slate-300 transition-all flex items-center space-x-2"
              >
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 group-hover:text-emerald-400">
                  {item.tag}
                </span>
                <span className="truncate max-w-xs">{item.text}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800 text-rose-200 text-sm flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => handleAsk()}
            className="text-xs underline hover:text-white"
          >
            {t('common.retry', 'Retry')}
          </button>
        </div>
      )}

      {/* Active Result View */}
      {result && (
        <div className="space-y-6 animate-fadeIn">
          {/* Answer Card */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4 shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <ChefHat className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-semibold text-white">Assistant Response</span>
                {result.translatedQuery && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-900/50 text-teal-300 border border-teal-700/50">
                    Translated: "{result.translatedQuery}"
                  </span>
                )}
              </div>

              {/* Latency and Status */}
              <div className="flex items-center space-x-3 text-xs font-mono">
                <span className="text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-500" />
                  {result.result.latency_ms} ms
                </span>
                {result.result.is_grounded ? (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Grounded Answer
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    Unanswerable / Out of Domain
                  </span>
                )}
              </div>
            </div>

            {/* Response Text */}
            <div className="text-sm text-slate-200 leading-relaxed whitespace-pre-line bg-slate-900/50 p-4 rounded-xl border border-slate-800/80">
              {result.result.grounded_answer}
            </div>

            {/* Out-of-Domain Notice if below threshold */}
            {!result.result.is_grounded && (
              <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-800/60 text-xs text-amber-200/90 space-y-1">
                <div className="font-semibold flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-amber-400" />
                  <span>{t('assistant.no_answer_title', 'No Defensible Culinary Answer Found')}</span>
                </div>
                <p>
                  {t('assistant.no_answer_desc', 'The highest similarity score for this query is below our confidence threshold (0.40). The RasaLens corpus is specialized in culinary recipes and cannot answer out-of-domain queries.')}
                </p>
              </div>
            )}
          </div>

          {/* Retrieved Grounding Sources */}
          {result.result.retrieved_recipes && result.result.retrieved_recipes.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold font-display text-slate-200 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-400" />
                  <span>{t('assistant.sources_title', 'Retrieved Grounding Sources')} ({result.result.retrieved_recipes.length})</span>
                </h3>
                <span className="text-xs text-slate-400 font-mono">
                  Ranked by cosine similarity
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {result.result.retrieved_recipes.map((recipe, index) => {
                  const scorePct = Math.round(recipe.similarity_score * 100);
                  const isHighConf = recipe.similarity_score >= 0.40;

                  return (
                    <div
                      key={recipe.recipe_id || index}
                      className="glass-panel p-5 rounded-xl border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-3 shadow-md"
                    >
                      <div className="space-y-2">
                        {/* Header: Title + Similarity Score */}
                        <div className="flex items-start justify-between gap-2">
                          <Link
                            to={`/recipes/${recipe.recipe_id}`}
                            className="text-sm font-bold text-white hover:text-emerald-400 transition-colors line-clamp-1"
                          >
                            #{index + 1}. {recipe.title}
                          </Link>
                          <span
                            className={`shrink-0 text-[10px] font-mono px-2 py-0.5 rounded-full border ${isHighConf
                              ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                              : 'bg-slate-800 text-slate-400 border-slate-700'
                              }`}
                          >
                            Score: {recipe.similarity_score.toFixed(3)}
                          </span>
                        </div>

                        {/* Metadata Tags */}
                        <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                          <span className="px-2 py-0.5 rounded bg-slate-800/80 text-slate-300 border border-slate-700/50">
                            {recipe.cuisine}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-slate-800/80 text-slate-300 border border-slate-700/50">
                            {recipe.course}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-emerald-950/50 text-emerald-300 border border-emerald-800/50">
                            {recipe.diet}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-amber-950/40 text-amber-300 border border-amber-800/40" title="Estimated from cooking instructions">
                            ~{recipe.cooking_time_mins}m (Estimated)
                          </span>
                        </div>

                        {/* Ingredients */}
                        {recipe.ingredients && recipe.ingredients.length > 0 && (
                          <div className="pt-1">
                            <span className="text-[10px] uppercase font-mono text-slate-400 block mb-1">
                              Key Ingredients:
                            </span>
                            <div className="flex flex-wrap gap-1">
                              {recipe.ingredients.slice(0, 6).map((ing, i) => (
                                <span
                                  key={i}
                                  className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800"
                                >
                                  {ing}
                                </span>
                              ))}
                              {recipe.ingredients.length > 6 && (
                                <span className="text-[10px] text-slate-500">
                                  +{recipe.ingredients.length - 6} more
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Instructions snippet */}
                        {recipe.instructions_snippet && (
                          <p className="text-xs text-slate-400 line-clamp-2 italic pt-1">
                            "{recipe.instructions_snippet}"
                          </p>
                        )}
                      </div>

                      {/* Footer Action */}
                      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                        <span className="text-[10px] font-mono text-slate-500">
                          ID: {recipe.recipe_id}
                        </span>
                        <Link
                          to={`/recipes/${recipe.recipe_id}`}
                          className="text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1 transition-colors"
                        >
                          <span>{t('assistant.view_recipe', 'View Full Recipe')}</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Initial Empty State if no result yet */}
      {!result && !loading && (
        <div className="glass-panel p-12 rounded-2xl border border-slate-800 text-center space-y-3">
          <ChefHat className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-semibold text-slate-300">
            Ask any cooking question or search for recipes by ingredient
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            The local FAISS vector search retrieves relevant culinary recipes in ~25 milliseconds. All inference runs 100% locally on CPU without paid APIs.
          </p>
        </div>
      )}
    </div>
  );
}
