import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Clock,
  Utensils,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Video,
  ExternalLink,
  Sparkles,
  ChefHat,
  BookOpen,
  Tag,
  Search
} from 'lucide-react';
import { api } from '../services/api';

export default function RecipeDetailPage() {
  const { recipeId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [is404, setIs404] = useState(false);

  // Router state passed from AnalyzeStudioPage or RecipeExplorer
  const initialUserIngredients = location.state?.userIngredients || [];
  const [userIngredients, setUserIngredients] = useState(initialUserIngredients);
  const [customInput, setCustomInput] = useState('');

  const fetchRecipe = async () => {
    setLoading(true);
    setError(null);
    setIs404(false);
    try {
      const data = await api.getRecipeById(recipeId);
      setRecipe(data);
    } catch (err) {
      if (err.status === 404 || err.message?.toLowerCase().includes('not found')) {
        setIs404(true);
        setError(`Recipe '${recipeId}' was not found in the RasaLens database.`);
      } else {
        setError(err.message || 'Failed to load recipe details. Please ensure the backend is running.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (recipeId) {
      fetchRecipe();
    }
  }, [recipeId]);

  // Check if a recipe ingredient string matches any of the user's pantry ingredients
  const isIngredientMatched = (ingText) => {
    if (!userIngredients || userIngredients.length === 0) return false;
    const lowerIng = String(ingText).toLowerCase();
    return userIngredients.some((u) => {
      const cleanU = String(u).trim().toLowerCase();
      if (!cleanU) return false;
      return lowerIng.includes(cleanU) || cleanU.includes(lowerIng);
    });
  };

  const handleAddCustomIngredient = (e) => {
    e.preventDefault();
    const val = customInput.trim().toLowerCase();
    if (val && !userIngredients.includes(val)) {
      setUserIngredients([...userIngredients, val]);
    }
    setCustomInput('');
  };

  const handleRemoveIngredient = (item) => {
    setUserIngredients(userIngredients.filter((i) => i !== item));
  };

  // Split instructions into numbered steps if possible
  const formatInstructions = (rawInstructions) => {
    if (!rawInstructions) return [];
    // If already has periods or linebreaks
    const lines = rawInstructions
      .split(/(?:\r\n|\r|\n|\.\s+(?=[A-Z0-9]))/)
      .map((s) => s.trim())
      .filter((s) => s.length > 2);
    return lines.length > 0 ? lines : [rawInstructions];
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto py-12 px-4 space-y-6 animate-pulse">
        <div className="h-6 w-32 bg-slate-800 rounded-lg"></div>
        <div className="glass-panel p-8 rounded-3xl space-y-4">
          <div className="h-10 w-2/3 bg-slate-800 rounded-xl"></div>
          <div className="flex gap-2">
            <div className="h-6 w-20 bg-slate-800 rounded-full"></div>
            <div className="h-6 w-20 bg-slate-800 rounded-full"></div>
            <div className="h-6 w-20 bg-slate-800 rounded-full"></div>
          </div>
          <div className="h-32 bg-slate-800/60 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  if (is404) {
    return (
      <div className="max-w-3xl mx-auto py-16 px-4 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-amber-400 font-semibold">Error 404</span>
          <h1 className="text-3xl font-display font-bold text-white mt-1">Recipe not found</h1>
          <p className="text-sm text-slate-400 mt-2 max-w-md mx-auto">
            {error || `The recipe identifier "${recipeId}" could not be located in our 13,296 recipe collection.`}
          </p>
        </div>
        <div className="flex items-center justify-center gap-3 pt-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-slate-200 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go Back</span>
          </button>
          <Link
            to="/recipes"
            className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-semibold shadow-md shadow-emerald-500/20 transition-all"
          >
            <Search className="w-4 h-4" />
            <span>Browse All Recipes</span>
          </Link>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto py-16 px-4 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto">
          <XCircle className="w-8 h-8" />
        </div>
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-rose-400 font-semibold">Server Error</span>
          <h1 className="text-3xl font-display font-bold text-white mt-1">Failed to Load Recipe</h1>
          <p className="text-sm text-rose-300 mt-2 max-w-md mx-auto font-mono text-xs bg-rose-950/40 p-3 rounded-xl border border-rose-900/50">
            {error}
          </p>
        </div>
        <div className="flex items-center justify-center gap-3 pt-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-slate-200"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go Back</span>
          </button>
          <button
            onClick={fetchRecipe}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-semibold shadow-md shadow-emerald-500/20"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Retry</span>
          </button>
        </div>
      </div>
    );
  }

  if (!recipe) return null;

  const ingredientsList = recipe.ingredients || [];
  const matchedCount = ingredientsList.filter((ing) => isIngredientMatched(ing)).length;
  const missingCount = ingredientsList.length - matchedCount;
  const steps = formatInstructions(recipe.instructions);

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 space-y-8 animate-fadeIn">
      {/* Back button and navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 px-3.5 py-1.5 rounded-xl border border-slate-800 bg-slate-900/80 hover:bg-slate-800 text-xs font-medium text-slate-300 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back</span>
        </button>
        <div className="flex items-center space-x-2 text-xs font-mono text-slate-500">
          <span>Recipe ID:</span>
          <span className="text-emerald-400 font-semibold">{recipe.recipe_id}</span>
        </div>
      </div>

      {/* Main Recipe Header Panel */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-6">
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2 items-center">
            <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-medium" title="Origin rule-derived (weak supervision)">
              {recipe.cuisine || 'Global'}
            </span>
            <span className="px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs font-mono font-medium" title="Course rule-derived (weak supervision)">
              {recipe.course || 'Main Course'}
            </span>
            <span className="px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono font-medium" title="Diet rule-derived (weak supervision)">
              {recipe.diet || 'General'}
            </span>
            <span className="px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300 text-xs font-mono flex items-center" title="Estimated from instructions">
              <Clock className="w-3 h-3 mr-1 text-slate-400" />
              <span>{recipe.cooking_time_mins} mins</span>
              <span className="text-[10px] text-slate-500 ml-1.5 font-sans">(Estimated from instructions)</span>
            </span>
          </div>

          <h1 className="font-display font-extrabold text-2xl sm:text-4xl text-white tracking-tight">
            {recipe.title}
          </h1>
        </div>

        {/* Pantry Comparison Banner if user input is active */}
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center space-x-2 text-xs font-mono text-emerald-400">
              <Sparkles className="w-4 h-4" />
              <span>Ingredient Match Analysis vs Your Input</span>
            </div>
            {userIngredients.length > 0 && (
              <div className="flex items-center space-x-3 text-xs font-mono">
                <span className="text-emerald-400 font-semibold flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{matchedCount} Matched</span>
                </span>
                <span className="text-rose-400 font-semibold flex items-center space-x-1">
                  <XCircle className="w-3.5 h-3.5" />
                  <span>{missingCount} Missing</span>
                </span>
                <span className="text-slate-400">
                  ({Math.round((matchedCount / (ingredientsList.length || 1)) * 100)}% match)
                </span>
              </div>
            )}
          </div>

          {/* User's input tags */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-xs text-slate-400 font-mono">Your Pantry / Query:</span>
            {userIngredients.length === 0 ? (
              <span className="text-xs text-slate-500 italic">
                None specified (all recipe ingredients shown below; type ingredients to test match)
              </span>
            ) : (
              userIngredients.map((item, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-200"
                >
                  <span>{item}</span>
                  <button
                    onClick={() => handleRemoveIngredient(item)}
                    className="text-slate-500 hover:text-rose-400 text-xs ml-1"
                  >
                    ×
                  </button>
                </span>
              ))
            )}
          </div>

          {/* Add custom ingredient to check matching */}
          <form onSubmit={handleAddCustomIngredient} className="flex gap-2 pt-1">
            <input
              type="text"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              placeholder="Add ingredient to check pantry match (e.g. onion, tomato, garlic)..."
              className="flex-1 bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
            <button
              type="submit"
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700"
            >
              Check
            </button>
          </form>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Ingredients Column */}
        <div className="lg:col-span-1 space-y-4">
          <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2 text-sm font-semibold text-white">
                <Utensils className="w-4 h-4 text-emerald-400" />
                <span>Ingredients</span>
              </div>
              <span className="text-xs font-mono text-slate-400">
                {ingredientsList.length} items
              </span>
            </div>

            <ul className="space-y-2.5">
              {ingredientsList.map((ing, idx) => {
                const matched = isIngredientMatched(ing);
                const hasUserInput = userIngredients.length > 0;

                return (
                  <li
                    key={idx}
                    className={`p-2.5 rounded-xl border text-xs transition-all flex items-start justify-between gap-2 ${
                      hasUserInput
                        ? matched
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
                          : 'bg-slate-900/60 border-slate-800/80 text-slate-400'
                        : 'bg-slate-900/60 border-slate-800/80 text-slate-300'
                    }`}
                  >
                    <span className="leading-relaxed">{ing}</span>
                    {hasUserInput && (
                      <span
                        className={`text-[10px] font-mono px-1.5 py-0.5 rounded uppercase font-semibold shrink-0 ${
                          matched
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                        }`}
                      >
                        {matched ? 'Matched' : 'Missing'}
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>

            {/* Clean Tokens Preview */}
            {recipe.tokens && recipe.tokens.length > 0 && (
              <div className="pt-4 border-t border-slate-800/80 space-y-2">
                <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider block">
                  Normalized Tokens ({recipe.tokens.length}):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {recipe.tokens.map((tok, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-[10px] font-mono text-slate-400"
                    >
                      {tok}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Instructions & Video Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Instructions */}
          <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
            <div className="flex items-center space-x-2 text-sm font-semibold text-white border-b border-slate-800 pb-3">
              <BookOpen className="w-4 h-4 text-emerald-400" />
              <span>Step-by-Step Instructions</span>
            </div>

            <div className="space-y-4 pt-2">
              {steps.map((step, idx) => (
                <div key={idx} className="flex items-start space-x-3.5">
                  <div className="w-6 h-6 rounded-full bg-slate-900 border border-slate-700 text-emerald-400 text-xs font-mono font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed font-sans">
                    {step}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Matching Video Section */}
          {recipe.video ? (
            <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4 bg-gradient-to-br from-slate-900 to-amber-950/20">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center space-x-2 text-xs font-mono text-amber-400">
                  <Video className="w-4 h-4" />
                  <span>Aligned Master Chef Video</span>
                </div>
                {recipe.video.video_url && (
                  <a
                    href={recipe.video.video_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-amber-400 hover:text-amber-300 font-mono flex items-center space-x-1"
                  >
                    <span>YouTube</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-4 items-start">
                {recipe.video.thumbnail_url && (
                  <img
                    src={recipe.video.thumbnail_url}
                    alt={recipe.video.title}
                    className="w-full sm:w-48 aspect-video object-cover rounded-xl border border-slate-700 shadow-md"
                  />
                )}
                <div className="space-y-2 flex-1">
                  <h4 className="font-display font-semibold text-base text-white">
                    {recipe.video.title}
                  </h4>
                  <p className="text-xs text-slate-400 font-mono">
                    Channel: {recipe.video.channel} • Duration: {recipe.video.duration}
                  </p>
                  {recipe.video.video_url && (
                    <a
                      href={recipe.video.video_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-semibold transition-all mt-2"
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>Watch on YouTube</span>
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl border border-slate-800/80 bg-slate-900/40 text-xs font-mono text-slate-500 flex items-center space-x-2">
              <Video className="w-4 h-4 text-slate-600" />
              <span>No direct chef video match recorded for this recipe.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
