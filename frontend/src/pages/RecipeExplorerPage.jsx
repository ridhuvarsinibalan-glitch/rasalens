import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Search,
  Filter,
  Clock,
  UtensilsCrossed,
  Video,
  X,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  BookOpen,
  Globe,
  RotateCcw,
  AlertCircle,
  CheckCircle,
  Languages,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { api } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

const COURSES = ['All', 'Main Course', 'Dessert', 'Appetizer & Side', 'Beverage', 'Breakfast'];
const DIETS = ['All', 'Vegetarian', 'Non-Vegetarian', 'Vegan'];
const CUISINES = ['All', 'Indian', 'Italian', 'Mexican', 'Asian', 'Mediterranean', 'American'];

const TOP_INGREDIENT_SUGGESTIONS = ['Tomato', 'Onion', 'Garlic', 'Paneer', 'Rice', 'Chicken', 'Potato', 'Ginger', 'Mushroom'];
const TOP_CUISINE_SUGGESTIONS = ['Italian', 'Indian', 'Asian', 'Mexican', 'Mediterranean', 'American'];

export default function RecipeExplorerPage() {
  const { t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();

  // Read URL params
  const initialQ = searchParams.get('q') || '';
  const initialCourse = searchParams.get('course') || 'All';
  const initialDiet = searchParams.get('diet') || 'All';
  const initialCuisine = searchParams.get('cuisine') || 'All';
  const initialId = searchParams.get('id') || searchParams.get('recipeId') || null;

  const [recipes, setRecipes] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [searchMode, setSearchMode] = useState('keyword');
  const [translatedQuery, setTranslatedQuery] = useState(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState(initialQ);
  const [selectedCourse, setSelectedCourse] = useState(initialCourse);
  const [selectedDiet, setSelectedDiet] = useState(initialDiet);
  const [selectedCuisine, setSelectedCuisine] = useState(initialCuisine);

  // Modal detail view
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [translationTarget, setTranslationTarget] = useState('tam_Taml');
  const [translatedRecipe, setTranslatedRecipe] = useState(null);
  const [translating, setTranslating] = useState(false);
  const [translationError, setTranslationError] = useState(null);

  const handleTranslateRecipe = async () => {
    if (!selectedRecipe) return;
    setTranslating(true);
    setTranslationError(null);
    try {
      // Translate instructions
      const res = await api.translateText(selectedRecipe.instructions, null, translationTarget);
      // Also translate title
      let titleRes = null;
      try {
        titleRes = await api.translateText(selectedRecipe.title, null, translationTarget);
      } catch (e) {
        console.warn('Title translation optional failure:', e);
      }

      setTranslatedRecipe({
        title: titleRes?.translated_text || selectedRecipe.title,
        instructions: res.translated_text,
        detected_lang: res.detected_lang,
        target_lang: res.target_lang,
        latency_ms: res.latency_ms + (titleRes?.latency_ms || 0)
      });
    } catch (err) {
      console.error('Translation error:', err);
      setTranslationError(err.message || 'Translation failed');
    } finally {
      setTranslating(false);
    }
  };

  const handleSelectRecipe = (r) => {
    setSelectedRecipe(r);
    setTranslatedRecipe(null);
    setTranslationError(null);
  };

  const fetchRecipes = async (pageNum = page, queryOverride = null) => {
    setLoading(true);
    setFetchError(null);
    const activeQuery = queryOverride !== null ? queryOverride : searchQuery;
    try {
      const params = {
        page: pageNum,
        page_size: 12,
        q: activeQuery?.trim() || undefined,
        course: selectedCourse !== 'All' ? selectedCourse : undefined,
        diet: selectedDiet !== 'All' ? selectedDiet : undefined,
        cuisine: selectedCuisine !== 'All' ? selectedCuisine : undefined,
      };
      const res = await api.getRecipes(params);
      setRecipes(res.recipes || []);
      setTotal(res.total || 0);
      setPage(res.page || 1);
      setTotalPages(res.total_pages || 1);
      setSearchMode(res.search_mode || 'keyword');
      setTranslatedQuery(res.translated_query || null);
    } catch (err) {
      console.error('Failed to load recipes:', err);
      setFetchError(err.message || 'Failed to connect to recipe server');
      setRecipes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecipes(1);
  }, [selectedCourse, selectedDiet, selectedCuisine]);

  useEffect(() => {
    if (initialId) {
      api.getRecipeById(initialId).then((rec) => {
        if (rec) setSelectedRecipe(rec);
      }).catch((e) => console.warn('Could not auto-open recipe from URL param:', e));
    }
  }, [initialId]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchRecipes(1);
  };

  const handleChipSearch = (term) => {
    setSearchQuery(term);
    fetchRecipes(1, term);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setTranslatedQuery(null);
    setSelectedCourse('All');
    setSelectedDiet('All');
    setSelectedCuisine('All');
    fetchRecipes(1, '');
  };

  return (
    <div className="space-y-8 py-4 max-w-7xl mx-auto">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl sm:text-4xl font-extrabold font-display text-white">
          {t('recipes_page.title', 'Recipe Explorer')}
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          {t('recipes_page.subtitle', 'Explore and filter 13,296 curated recipes across courses, dietary types, and regional cuisines with cooking steps and aligned chef videos.')}
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-4 shadow-lg">
        
        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              id="recipe-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('recipes_page.search_placeholder', "Search recipes by title or ingredients (e.g., 'biryani', 'miso', 'pasta', 'paneer')...")}
              className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>
          <button
            type="submit"
            id="recipe-filter-btn"
            className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all shadow-md shadow-emerald-500/20"
          >
            {t('common.search', 'Search')}
          </button>
        </form>

        {/* Dropdowns / Pills */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          
          <div>
            <label className="text-[11px] font-mono text-slate-400 block mb-1">{t('common.course', 'Course')} {t('common.filter', 'Filter')}:</label>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
            >
              {COURSES.map((c) => (
                <option key={c} value={c}>{c === 'All' ? t('common.all', 'All') : c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-mono text-slate-400 block mb-1">{t('common.diet', 'Diet')} {t('common.filter', 'Filter')}:</label>
            <select
              value={selectedDiet}
              onChange={(e) => setSelectedDiet(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
            >
              {DIETS.map((d) => (
                <option key={d} value={d}>{d === 'All' ? t('common.all', 'All') : d}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-mono text-slate-400 block mb-1">{t('common.cuisine', 'Cuisine')} {t('common.filter', 'Filter')}:</label>
            <select
              value={selectedCuisine}
              onChange={(e) => setSelectedCuisine(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
            >
              {CUISINES.map((cu) => (
                <option key={cu} value={cu}>{cu === 'All' ? t('common.all', 'All') : cu}</option>
              ))}
            </select>
          </div>

        </div>

        {/* Stats count */}
        <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
          <span>Found <strong className="text-white">{total.toLocaleString()}</strong> recipes matching criteria</span>
          <span className="font-mono text-[11px]">Page {page} of {totalPages}</span>
        </div>

        {/* Multilingual Translation Feedback */}
        {translatedQuery && (
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs animate-fadeIn">
            <Languages className="w-4 h-4 text-teal-400 shrink-0" />
            <span>
              Multilingual match: Searching for <strong className="text-white font-medium">"{translatedQuery}"</strong>
              <span className="text-slate-400 ml-1.5 font-mono text-[11px]">(detected: "{searchQuery}")</span>
            </span>
          </div>
        )}

      </div>

      {/* Recipes Grid */}
      {fetchError ? (
        <div className="py-12 px-6 text-center space-y-4 glass-panel rounded-2xl border border-rose-500/30 bg-rose-500/5 max-w-xl mx-auto animate-fadeIn">
          <AlertCircle className="w-10 h-10 text-rose-400 mx-auto" />
          <div className="space-y-1">
            <h3 className="font-display font-semibold text-lg text-white">Failed to Retrieve Recipes</h3>
            <p className="text-xs text-rose-300 font-mono">{fetchError}</p>
          </div>
          <button
            onClick={() => fetchRecipes(page)}
            className="px-5 py-2 rounded-xl text-xs font-semibold bg-rose-500 hover:bg-rose-400 text-slate-950 transition-all inline-flex items-center space-x-1.5 shadow-md shadow-rose-500/20 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry Search</span>
          </button>
        </div>
      ) : loading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-400 font-mono">Retrieving recipes from database...</p>
        </div>
      ) : recipes.length === 0 ? (
        <div className="py-12 px-6 text-center space-y-5 glass-panel rounded-2xl border border-slate-800 max-w-2xl mx-auto animate-fadeIn">
          <UtensilsCrossed className="w-10 h-10 text-slate-500 mx-auto" />
          <div className="space-y-1">
            <h3 className="font-display font-semibold text-lg text-white">
              {searchQuery ? `No recipes match '${searchQuery}' in this dataset` : 'No recipes found matching these filters'}
            </h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              {searchQuery
                ? `We couldn't find any recipe containing '${searchQuery}'. Try one of the popular culinary searches or regional cuisines below:`
                : 'Try adjusting your course, diet, or cuisine filters to view recipes.'}
            </p>
          </div>

          {/* Suggested searches */}
          <div className="space-y-3 pt-2 border-t border-slate-800/80">
            <div>
              <div className="text-[10px] font-mono text-slate-500 uppercase mb-2">Suggested Ingredients:</div>
              <div className="flex flex-wrap justify-center gap-1.5">
                {TOP_INGREDIENT_SUGGESTIONS.map((ing) => (
                  <button
                    key={ing}
                    onClick={() => handleChipSearch(ing)}
                    className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-300 hover:text-white hover:border-emerald-500 hover:bg-emerald-500/10 transition-colors cursor-pointer"
                  >
                    {ing}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="text-[10px] font-mono text-slate-500 uppercase mb-2">Popular Cuisines:</div>
              <div className="flex flex-wrap justify-center gap-1.5">
                {TOP_CUISINE_SUGGESTIONS.map((c) => (
                  <button
                    key={c}
                    onClick={() => handleChipSearch(c)}
                    className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-300 hover:text-white hover:border-teal-500 hover:bg-teal-500/10 transition-colors cursor-pointer"
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={handleClearFilters}
              className="text-xs text-emerald-400 hover:text-emerald-300 underline font-mono cursor-pointer"
            >
              Clear all filters & search query
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {searchMode === 'semantic' && searchQuery && (
            <div className="p-3.5 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-between gap-3 text-xs text-teal-300 animate-fadeIn">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-teal-400 flex-shrink-0" />
                <span>
                  No exact keyword match found for <strong>"{searchQuery}"</strong>. Showing <strong>{total} AI Semantic Matches</strong> retrieved using FAISS vector embeddings.
                </span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-500/20 text-teal-200">
                FAISS RAG Fallback
              </span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recipes.map((rec) => (
              <div
                key={rec.recipe_id}
                onClick={() => handleSelectRecipe(rec)}
                className="glass-card rounded-2xl p-5 border border-slate-800 flex flex-col justify-between cursor-pointer group"
              >
                <div className="space-y-3">
                  
                  {/* Header Meta */}
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                    <span className="text-emerald-400">{rec.recipe_id}</span>
                    <span className="flex items-center text-slate-300" title="Estimated from instructions">
                      <Clock className="w-3 h-3 mr-1 text-teal-400" />
                      {rec.cooking_time_mins}m <span className="text-[9px] text-slate-500 ml-1">(est.)</span>
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="font-display font-semibold text-lg text-white group-hover:text-emerald-300 transition-colors line-clamp-2">
                    {rec.title}
                  </h3>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-1.5">
                    {rec.match_type === 'semantic' && (
                      <span className="px-2 py-0.5 rounded-md bg-teal-500/20 border border-teal-500/40 text-teal-300 text-[10px] font-mono flex items-center gap-1">
                        <Sparkles className="w-2.5 h-2.5 text-teal-300" />
                        Semantic Match {rec.similarity_score ? `(${(rec.similarity_score * 100).toFixed(0)}%)` : ''}
                      </span>
                    )}
                    <span className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-[10px] font-mono text-slate-300">
                      {rec.course}
                    </span>
                  <span className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-[10px] font-mono text-slate-300">
                    {rec.cuisine}
                  </span>
                  <span className={`px-2 py-0.5 rounded-md border text-[10px] font-mono ${
                    rec.diet === 'Vegetarian' ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30' :
                    rec.diet === 'Vegan' ? 'bg-teal-500/10 text-teal-300 border-teal-500/30' :
                    'bg-amber-500/10 text-amber-300 border-amber-500/30'
                  }`}>
                    {rec.diet}
                  </span>
                </div>

                {/* Ingredient preview */}
                <div className="pt-2">
                  <div className="text-[10px] font-mono text-slate-500 uppercase mb-1">Key Ingredients:</div>
                  <div className="flex flex-wrap gap-1">
                    {rec.tokens?.slice(0, 5).map((t, idx) => (
                      <span key={idx} className="px-1.5 py-0.5 rounded bg-slate-900 text-[11px] text-slate-300 border border-slate-800/80">
                        {t}
                      </span>
                    ))}
                    {rec.tokens?.length > 5 && (
                      <span className="text-[10px] text-slate-500 self-center">+{rec.tokens.length - 5} more</span>
                    )}
                  </div>
                </div>

              </div>

              {/* Card Footer */}
              <div className="pt-4 border-t border-slate-800/80 mt-4 flex items-center justify-between text-xs">
                {rec.video ? (
                  <span className="flex items-center space-x-1 text-amber-400 font-medium text-[11px]">
                    <Video className="w-3.5 h-3.5" />
                    <span>Chef Video Aligned</span>
                  </span>
                ) : (
                  <span className="text-[11px] text-slate-500 font-mono">100% Text Instructions</span>
                )}
                <div className="flex items-center space-x-3">
                  <span className="text-slate-400 hover:text-white font-medium">Quick Preview</span>
                  <Link
                    to={`/recipes/${rec.recipe_id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="text-emerald-400 hover:text-emerald-300 font-medium flex items-center space-x-0.5 group-hover:translate-x-0.5 transition-transform"
                  >
                    <span>Page</span>
                    <ExternalLink className="w-3 h-3 ml-0.5" />
                  </Link>
                </div>
              </div>

            </div>
          ))}
        </div>
      </div>
    )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-4 pt-4">
          <button
            onClick={() => fetchRecipes(page - 1)}
            disabled={page <= 1}
            className="flex items-center space-x-1 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>
          
          <span className="text-xs font-mono text-slate-400">
            Page {page} of {totalPages}
          </span>

          <button
            onClick={() => fetchRecipes(page + 1)}
            disabled={page >= totalPages}
            className="flex items-center space-x-1 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Recipe Detail Modal */}
      {selectedRecipe && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="glass-panel rounded-3xl max-w-3xl w-full max-h-[85vh] overflow-y-auto border border-slate-700/80 p-6 sm:p-8 space-y-6 shadow-2xl relative">
            
            <button
              onClick={() => setSelectedRecipe(null)}
              className="absolute top-6 right-6 p-2 rounded-full bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-emerald-400">
                <span>{selectedRecipe.recipe_id}</span>
                <span>•</span>
                <span title="Origin rule-derived (weak supervision)">{selectedRecipe.cuisine} Cuisine</span>
                <span>•</span>
                <span title="Course rule-derived (weak supervision)">{selectedRecipe.course}</span>
                <span>•</span>
                <span className="text-amber-400" title="Estimated from instructions">{selectedRecipe.cooking_time_mins} mins (Estimated from instructions)</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mt-1">
                <h2 className="font-display font-bold text-2xl sm:text-3xl text-white">
                  {translatedRecipe ? translatedRecipe.title : selectedRecipe.title}
                </h2>
                <div className="flex items-center gap-2">
                  <Link
                    to={`/recipes/${selectedRecipe.recipe_id}`}
                    className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/25 text-xs font-mono font-medium transition-colors"
                  >
                    <span>Dedicated Page</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                  {translatedRecipe && (
                    <span className="px-2.5 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-mono">
                      Translated to {translatedRecipe.target_lang}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Multilingual Translation Action Bar */}
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center space-x-2">
                  <Languages className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-semibold text-white">Recipe Translation (NLLB-200):</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <select
                    value={translationTarget}
                    onChange={(e) => setTranslationTarget(e.target.value)}
                    disabled={translating}
                    className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
                  >
                    <option value="tam_Taml">Tamil (தமிழ் - tam_Taml)</option>
                    <option value="hin_Deva">Hindi (हिन्दी - hin_Deva)</option>
                    <option value="eng_Latn">English (eng_Latn)</option>
                  </select>

                  <button
                    onClick={handleTranslateRecipe}
                    disabled={translating}
                    id="btn-translate-recipe"
                    className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all flex items-center space-x-1.5 disabled:opacity-50 shadow-md shadow-emerald-500/20 cursor-pointer"
                  >
                    {translating ? (
                      <>
                        <div className="w-3 h-3 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                        <span>Translating...</span>
                      </>
                    ) : (
                      <>
                        <Globe className="w-3.5 h-3.5" />
                        <span>Translate Recipe</span>
                      </>
                    )}
                  </button>

                  {translatedRecipe && (
                    <button
                      onClick={() => setTranslatedRecipe(null)}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all flex items-center space-x-1 cursor-pointer"
                      title="Reset to Original English"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Original</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Translation Metrics & Status */}
              {translatedRecipe && (
                <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-800/80 text-[11px] font-mono text-slate-400">
                  <span className="flex items-center text-emerald-400">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Model: NLLB-200-distilled-600M
                  </span>
                  <span>•</span>
                  <span>Latency: <strong className="text-white">{translatedRecipe.latency_ms} ms</strong></span>
                  <span>•</span>
                  <span>Direction: <strong className="text-slate-200">{translatedRecipe.detected_lang} → {translatedRecipe.target_lang}</strong></span>
                </div>
              )}

              {/* Explicit Translation Error Banner */}
              {translationError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start space-x-2 text-xs text-rose-300">
                  <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-semibold block text-rose-200">Translation Service Error:</strong>
                    <span>{translationError}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Ingredients List */}
            <div className="space-y-2">
              <h3 className="font-display font-semibold text-sm text-slate-200 uppercase tracking-wider font-mono">
                Ingredients Required:
              </h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
                {selectedRecipe.ingredients?.map((ing, idx) => (
                  <li key={idx} className="p-2 rounded-lg bg-slate-900/80 border border-slate-800 flex items-start space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
                    <span>{ing}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Instructions */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-semibold text-sm text-slate-200 uppercase tracking-wider font-mono">
                  Cooking Instructions {translatedRecipe ? `(${translatedRecipe.target_lang})` : '(Original)'}:
                </h3>
                {translatedRecipe && (
                  <span className="text-[11px] font-mono text-emerald-400">
                    Neural NLLB Translation Active
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-300 leading-relaxed font-sans bg-slate-950 p-4 rounded-xl border border-slate-800 whitespace-pre-wrap">
                {translatedRecipe ? translatedRecipe.instructions : selectedRecipe.instructions}
              </div>
            </div>

            {/* Matched Video Banner if available */}
            {selectedRecipe.video && (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Video className="w-5 h-5 text-amber-400" />
                  <div>
                    <h4 className="text-xs font-semibold text-white">Watch Master Chef Video</h4>
                    <p className="text-[11px] text-slate-400">{selectedRecipe.video.title} ({selectedRecipe.video.duration})</p>
                  </div>
                </div>
                {selectedRecipe.video.video_url ? (
                  <a
                    href={selectedRecipe.video.video_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all shadow"
                  >
                    Watch Video
                  </a>
                ) : null}
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
