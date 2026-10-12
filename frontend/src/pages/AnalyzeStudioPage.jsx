import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  UtensilsCrossed,
  Type,
  Plus,
  X,
  Upload,
  Globe2,
  Sparkles,
  Layers,
  TrendingUp,
  Clock,
  Video,
  CheckCircle2,
  FileText,
  RefreshCw,
  Search,
  ExternalLink,
  AlertTriangle
} from 'lucide-react';
import { api } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

const POPULAR_INGREDIENTS = [
  'tomato', 'onion', 'garlic', 'ginger', 'paneer', 'chicken', 'basmati rice',
  'pasta', 'parmesan', 'mozzarella', 'olive oil', 'tortilla', 'avocado', 'lime',
  'soy sauce', 'tofu', 'ramen noodles', 'chocolate', 'butter', 'sugar', 'flour'
];

const PRESET_COMBOS = [
  { name: 'Makhani Trio', chips: ['paneer', 'tomato', 'butter', 'cashew', 'garam masala'] },
  { name: 'Italian Classic', chips: ['pasta', 'parmesan', 'garlic', 'olive oil', 'basil'] },
  { name: 'Zesty Taco', chips: ['tortilla', 'avocado', 'lime', 'cilantro', 'salsa'] },
  { name: 'Fudge Baker', chips: ['cocoa powder', 'sugar', 'butter', 'flour', 'chocolate'] },
];

export default function AnalyzeStudioPage() {
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState('text'); // 'text', 'chips', 'file'

  // Input states
  const [inputText, setInputText] = useState(
    searchParams.get('q') || 'I have 2 ripe tomatoes, 1 medium onion, 200g paneer and garlic.'
  );
  const [chips, setChips] = useState(['tomato', 'onion', 'paneer', 'garlic']);
  const [customChip, setCustomChip] = useState('');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [fileContent, setFileContent] = useState('');

  // Analysis Result states
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [resultTab, setResultTab] = useState('recipes'); // 'recipes', 'ner', 'mba'

  // Initial trigger if URL param passed
  useEffect(() => {
    const query = searchParams.get('q');
    if (query) {
      setInputText(query);
      handleAnalyze({ input_mode: 'text', text: query });
    }
  }, [searchParams]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadedFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target.result;
      setFileContent(content);
      setInputText(content.slice(0, 300));
    };
    reader.readAsText(file);
  };

  const addChip = (item) => {
    const clean = item.toLowerCase().trim();
    if (clean && !chips.includes(clean)) {
      setChips([...chips, clean]);
    }
    setCustomChip('');
  };

  const removeChip = (item) => {
    setChips(chips.filter((c) => c !== item));
  };

  const handleAnalyze = async (overridePayload = null) => {
    setLoading(true);
    setError(null);

    let payload = overridePayload;
    if (!payload) {
      if (mode === 'chips') {
        payload = { input_mode: 'chips', chips };
      } else if (mode === 'file') {
        payload = { input_mode: 'file', file_content: fileContent || inputText };
      } else {
        payload = { input_mode: 'text', text: inputText };
      }
    }

    try {
      const res = await api.analyzeStudio(payload);
      setResult(res);
    } catch (err) {
      setError(err.message || 'Analysis failed. Please ensure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'text', label: t('studio.tab_text', 'Natural Text'), icon: Type },
    { id: 'chips', label: t('studio.tab_chips', 'Ingredient Chips'), icon: UtensilsCrossed },
    { id: 'file', label: t('studio.tab_file', 'File Upload'), icon: Upload },
  ];

  return (
    <div className="space-y-8 py-4 max-w-7xl mx-auto animate-fadeIn">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold font-display text-white">
          {t('studio.title', 'Analyze Studio')}
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl font-sans">
          Analyze ingredients and culinary queries with automated entity extraction, course inference, and recipe recommendations.
        </p>
      </div>

      {/* Input Mode Selector & Card */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-6 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-2 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setMode(tab.id)}
                  id={`tab-${tab.id}`}
                  className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${mode === tab.id
                      ? 'bg-emerald-500 text-slate-950 font-semibold shadow-md shadow-emerald-500/20'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                    }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center space-x-2 text-xs text-slate-400">
            <Globe2 className="w-3.5 h-3.5 text-teal-400" />
            <span>{t('studio.bilingual_hint', 'Tamil & English cross-lingual auto-detected')}</span>
          </div>
        </div>

        {/* 1. Natural Text Mode */}
        {mode === 'text' && (
          <div className="space-y-3">
            <textarea
              id="studio-text-input"
              rows={4}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={t('studio.textarea_placeholder', 'e.g., I have two ripe tomatoes, 1 cup basmati rice, some paneer and chopped onions. What can I cook?')}
              className="w-full px-4 py-3 rounded-xl bg-slate-900/90 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all font-sans"
            />
            <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
              <span>{t('studio.text_hint', 'Supports natural quantities, units, and bilingual Tamil queries.')}</span>
              <button
                type="button"
                onClick={() => setInputText('சுவையான தக்காளி வெங்காயம் மற்றும் பன்னீர் மசாலா')}
                className="text-emerald-400 hover:text-emerald-300 font-mono text-[11px]"
              >
                {t('studio.try_tamil', '+ Try Tamil example: தக்காளி, வெங்காயம், பன்னீர்')}
              </button>
            </div>
          </div>
        )}

        {/* 2. Ingredient Chips Mode */}
        {mode === 'chips' && (
          <div className="space-y-4">
            {/* Active Chips */}
            <div className="min-h-16 p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-wrap items-center gap-2">
              {chips.length === 0 && (
                <span className="text-xs text-slate-500 font-mono">{t('studio.chips_empty', 'No chips selected. Click presets or add ingredients below.')}</span>
              )}
              {chips.map((chip) => (
                <span
                  key={chip}
                  className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-medium"
                >
                  <span>{chip}</span>
                  <button onClick={() => removeChip(chip)} className="hover:text-emerald-100">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>

            {/* Custom Chip Input */}
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={customChip}
                onChange={(e) => setCustomChip(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addChip(customChip)}
                placeholder={t('studio.chips_input_placeholder', 'Add ingredient (e.g. ginger, coconut, mushrooms)...')}
                className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
              />
              <button
                onClick={() => addChip(customChip)}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{t('studio.chips_add_btn', 'Add')}</span>
              </button>
            </div>

            {/* Curated Presets */}
            <div className="space-y-2 pt-2">
              <div className="text-xs font-mono text-slate-400">{t('studio.chips_combos', 'Curated Culinary Combos:')}</div>
              <div className="flex flex-wrap gap-2">
                {PRESET_COMBOS.map((combo) => (
                  <button
                    key={combo.name}
                    onClick={() => setChips(combo.chips)}
                    className="px-3 py-1 rounded-lg bg-slate-900/80 border border-slate-800 hover:border-emerald-500/50 text-slate-300 hover:text-white text-xs font-medium transition-all"
                  >
                    {combo.name} ({combo.chips.length})
                  </button>
                ))}
              </div>
            </div>

            {/* Popular Ingredient Quick Add */}
            <div className="space-y-2">
              <div className="text-xs font-mono text-slate-400">{t('studio.chips_quick_add', 'Quick Add:')}</div>
              <div className="flex flex-wrap gap-1.5">
                {POPULAR_INGREDIENTS.map((ing) => (
                  <button
                    key={ing}
                    onClick={() => addChip(ing)}
                    className="px-2 py-0.5 rounded-md bg-slate-900/60 border border-slate-800/80 text-slate-400 hover:text-emerald-300 hover:border-slate-700 text-[11px] transition-colors"
                  >
                    + {ing}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 3. File Upload Mode */}
        {mode === 'file' && (
          <div className="space-y-4">
            <div className="p-8 border-2 border-dashed border-slate-800 hover:border-emerald-500/50 rounded-2xl text-center space-y-3 bg-slate-900/40 transition-colors">
              <Upload className="w-8 h-8 text-emerald-400 mx-auto" />
              <div>
                <p className="text-sm font-medium text-white">{t('studio.file_drag', 'Upload a recipe or ingredient list text file')}</p>
                <p className="text-xs text-slate-400">{t('studio.file_formats', 'Supported formats: .txt, .json')}</p>
              </div>
              <input
                type="file"
                id="file-upload-input"
                accept=".txt,.json"
                onChange={handleFileUpload}
                className="hidden"
              />
              <label
                htmlFor="file-upload-input"
                className="inline-block px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white cursor-pointer transition-all"
              >
                {t('studio.file_browse', 'Browse Files')}
              </label>
              {uploadedFile && (
                <div className="flex items-center justify-center space-x-2 text-xs text-emerald-300 font-mono pt-2">
                  <FileText className="w-3.5 h-3.5" />
                  <span>{uploadedFile.name} ({(uploadedFile.size / 1024).toFixed(1)} KB)</span>
                </div>
              )}
            </div>

            {fileContent && (
              <div className="space-y-1">
                <div className="text-xs font-mono text-slate-400">{t('studio.file_preview', 'Preview Extracted Text:')}</div>
                <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 max-h-36 overflow-y-auto font-mono whitespace-pre-wrap">
                  {fileContent}
                </pre>
              </div>
            )}
          </div>
        )}

        {/* Submit Execution Action */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          <div className="text-xs text-slate-400 font-mono">
            {t('studio.target_pipeline', 'Target pipeline: spaCy NER + LinearSVC + mlxtend + FAISS')}
          </div>

          <button
            onClick={() => handleAnalyze()}
            disabled={loading}
            id="run-analysis-btn"
            className="flex items-center space-x-2 px-6 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 shadow-lg shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                <span>{t('studio.btn_processing', 'Processing Pipeline...')}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 fill-slate-950" />
                <span>{t('studio.btn_execute', 'Execute Unified Analysis')}</span>
              </>
            )}
          </button>
        </div>

      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-rose-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Analysis Results View */}
      {result && (
        <div className="space-y-6 animate-fadeIn">

          {/* Compact Inference & View Switcher Bar */}
          <div className="glass-panel rounded-2xl p-4 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg">
            <div className="flex flex-wrap items-center gap-4 text-xs font-sans">
              <div className="flex items-center space-x-1.5">
                <span className="text-slate-400 font-mono text-[11px]">Course:</span>
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-semibold">
                  {result.inferred_course}
                </span>
              </div>
              <div className="h-3 w-px bg-slate-800 hidden sm:block" />
              <div className="flex items-center space-x-1.5">
                <span className="text-slate-400 font-mono text-[11px]">Cuisine:</span>
                <span className="px-2 py-0.5 rounded-md bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 font-semibold">
                  {result.inferred_cuisine}
                </span>
              </div>
              <div className="h-3 w-px bg-slate-800 hidden sm:block" />
              <div className="flex items-center space-x-1.5">
                <span className="text-slate-400 font-mono text-[11px]">Diet:</span>
                <span className="px-2 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-300 font-semibold">
                  {result.dietary_classification}
                </span>
              </div>
              <div className="h-3 w-px bg-slate-800 hidden sm:block" />
              <div className="flex items-center space-x-1.5">
                <span className="text-slate-400 font-mono text-[11px]">Language:</span>
                <span className="px-2 py-0.5 rounded-md bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 font-semibold">
                  {result.detected_language === 'ta' ? 'Tamil' : (result.detected_language === 'hi' ? 'Hindi' : 'English')}
                </span>
              </div>
            </div>

            {/* Organized Result View Tabs */}
            <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs shrink-0">
              <button
                type="button"
                onClick={() => setResultTab('recipes')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${resultTab === 'recipes'
                    ? 'bg-emerald-500 text-slate-950 font-semibold shadow-md shadow-emerald-500/20'
                    : 'text-slate-400 hover:text-white'
                  }`}
              >
                Recipes & Method ({result.recommended_recipes?.length || 0})
              </button>
              <button
                type="button"
                onClick={() => setResultTab('ner')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${resultTab === 'ner'
                    ? 'bg-emerald-500 text-slate-950 font-semibold shadow-md shadow-emerald-500/20'
                    : 'text-slate-400 hover:text-white'
                  }`}
              >
                Entities ({result.extracted_entities?.length || 0})
              </button>
              <button
                type="button"
                onClick={() => setResultTab('mba')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${resultTab === 'mba'
                    ? 'bg-emerald-500 text-slate-950 font-semibold shadow-md shadow-emerald-500/20'
                    : 'text-slate-400 hover:text-white'
                  }`}
              >
                Associations ({result.associated_ingredients?.length || 0})
              </button>
            </div>
          </div>

          {/* Tab 1: Recommended Recipes & Grounded Guide */}
          {resultTab === 'recipes' && (
            <div className="space-y-6">

              {/* Synthesized Grounded Method */}
              {result.grounded_answer && (
                <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-3 bg-gradient-to-br from-slate-900/90 to-emerald-950/20">
                  <div className="flex items-center space-x-2 text-xs font-mono text-emerald-400">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span className="font-semibold">{t('studio.grounded_title', 'Synthesized Grounded Culinary Method')}</span>
                  </div>
                  <div className="text-sm text-slate-200 leading-relaxed font-sans whitespace-pre-wrap bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
                    {result.grounded_answer}
                  </div>
                </div>
              )}

              {/* Recipe Cards Grid */}
              <div className="space-y-3">
                <div className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                  {t('studio.rec_title', 'Top Retrieved Recipes (FAISS Vector Index)')}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {result.recommended_recipes?.length === 0 && (
                    <div className="col-span-full p-8 rounded-xl bg-slate-900 text-center text-slate-500 text-xs font-mono">
                      {t('studio.rec_empty', 'No semantic recipe matches found for this ingredient set.')}
                    </div>
                  )}
                  {result.recommended_recipes?.map((rec) => (
                    <div
                      key={rec.recipe_id}
                      className="glass-card rounded-2xl p-5 border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition-all shadow-md"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                          <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800">{rec.recipe_id}</span>
                          <span className="text-emerald-400 font-semibold">
                            {(rec.similarity_score * 100).toFixed(1)}% {t('studio.rec_similarity', 'Match')}
                          </span>
                        </div>

                        <h4 className="font-display font-semibold text-base text-white">
                          {rec.title}
                        </h4>

                        <div className="flex flex-wrap gap-1.5 pt-1">
                          <span className="px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-[10px] font-mono text-slate-300">
                            {rec.cuisine}
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-[10px] font-mono text-slate-300">
                            {rec.course}
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-[10px] font-mono text-slate-300 flex items-center">
                            <Clock className="w-2.5 h-2.5 mr-1" /> {rec.cooking_time_mins}m
                          </span>
                        </div>

                        <p className="text-xs text-slate-400 line-clamp-3 pt-1 leading-relaxed">
                          {rec.instructions_snippet}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-slate-800/80 mt-3 flex items-center justify-between text-xs">
                        <span className="text-[11px] text-slate-500 font-mono truncate max-w-[160px]">
                          {rec.ingredients?.slice(0, 3).join(', ')}...
                        </span>
                        <Link
                          to={`/recipes/${rec.recipe_id}`}
                          state={{
                            userIngredients: Array.from(
                              new Set([
                                ...(chips || []),
                                ...(result.extracted_entities?.filter((e) => e.label === 'FOOD_ITEM').map((e) => e.text.toLowerCase()) || [])
                              ])
                            )
                          }}
                          className="text-emerald-400 hover:text-emerald-300 font-medium flex items-center space-x-1"
                        >
                          <span>{t('common.view_recipe', 'Details')}</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Matched Video Banner */}
              {result.matched_video && (
                <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-3">
                  <div className="flex items-center space-x-2 text-xs font-mono text-amber-400">
                    <Video className="w-3.5 h-3.5" />
                    <span>{t('studio.matched_video', 'Aligned Chef Cooking Video')}</span>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-5 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                    <img
                      src={result.matched_video.thumbnail_url}
                      alt={result.matched_video.title}
                      className="w-full sm:w-44 aspect-video object-cover rounded-xl border border-slate-700"
                    />
                    <div className="space-y-1.5 flex-1">
                      <h4 className="font-display font-semibold text-base text-white">
                        {result.matched_video.title}
                      </h4>
                      <p className="text-xs text-slate-400">
                        Channel: <span className="text-slate-200 font-medium">{result.matched_video.channel}</span> • Duration: {result.matched_video.duration}
                      </p>
                      {result.matched_video.video_url && (
                        <a
                          href={result.matched_video.video_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all mt-1"
                        >
                          <span>{t('studio.watch_video', 'Watch on YouTube')}</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* Tab 2: Named Entity Recognition */}
          {resultTab === 'ner' && (
            <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h3 className="font-display font-semibold text-base text-white">
                    {t('studio.ner_title', 'Named Entity Recognition (Custom spaCy)')}
                  </h3>
                  <p className="text-xs text-slate-400">{t('studio.ner_desc', 'Entities extracted with token boundaries from working query')}</p>
                </div>
                <div className="flex items-center space-x-2 text-[10px] font-mono">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">FOOD_ITEM</span>
                  <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">QUANTITY</span>
                  <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">UNIT</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                {result.extracted_entities?.length === 0 && (
                  <span className="text-xs text-slate-500 font-mono">{t('studio.ner_empty', 'No structured entities extracted from input.')}</span>
                )}
                {result.extracted_entities?.map((ent, idx) => {
                  const colorMap = {
                    FOOD_ITEM: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
                    QUANTITY: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
                    UNIT: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
                  };
                  const cls = colorMap[ent.label] || 'bg-slate-800 text-slate-300 border-slate-700';

                  return (
                    <span
                      key={idx}
                      className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono ${cls}`}
                    >
                      <span className="font-sans font-medium">{ent.text}</span>
                      <span className="text-[10px] opacity-70">({ent.label})</span>
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tab 3: Market Basket Analysis */}
          {resultTab === 'mba' && (
            <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
              <div>
                <h3 className="font-display font-semibold text-base text-white">
                  {t('studio.mba_title', 'Market Basket Analysis (Ingredient Complements)')}
                </h3>
                <p className="text-xs text-slate-400">
                  {t('studio.mba_desc', 'Recommended associations derived from 13,269 recipe baskets using FP-Growth association rules')}
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {result.associated_ingredients?.length === 0 && (
                  <div className="col-span-full text-xs text-slate-500 font-mono p-4">
                    {t('studio.mba_empty', 'No association rules matched for the provided ingredient seeds.')}
                  </div>
                )}
                {result.associated_ingredients?.map((assoc, idx) => (
                  <div key={idx} className="glass-card rounded-xl p-3 border border-slate-800 space-y-1">
                    <div className="font-display font-semibold text-sm text-amber-300 capitalize">
                      {assoc.ingredient}
                    </div>
                    <div className="text-[10px] font-mono text-slate-400">
                      {t('studio.mba_lift', 'Lift:')} <span className="text-emerald-400 font-bold">{assoc.lift}x</span>
                    </div>
                    <div className="text-[10px] font-mono text-slate-500">
                      {t('studio.mba_affinity', 'Confidence:')} {assoc.affinity_score}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
