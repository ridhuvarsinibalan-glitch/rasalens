import React, { useState, useEffect, useRef, useMemo } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { 
  Network, Filter, Sparkles, RefreshCw, ZoomIn, ZoomOut, Maximize2, 
  Layers, Info, Search, Sliders
} from 'lucide-react';
import { api } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

const CATEGORY_COLORS = {
  'Fats & Oils': '#f59e0b',        // Amber
  'Baking & Grains': '#ec4899',    // Pink
  'Aromatics & Produce': '#10b981',// Emerald
  'Spices & Seasonings': '#8b5cf6',// Purple
  'Dairy & Protein': '#3b82f6',    // Blue
  'Condiments & Sauces': '#06b6d4',// Cyan
  'Pantry & Seasonings': '#94a3b8' // Slate
};

export default function IngredientGraphPage() {
  const { t } = useLanguage();
  const graphRef = useRef();
  const containerRef = useRef();

  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [course, setCourse] = useState('All');
  const [cuisine, setCuisine] = useState('All');
  const [minLift, setMinLift] = useState(1.2);
  const [topN, setTopN] = useState(50);
  const [searchQuery, setSearchQuery] = useState('');

  // Hover state
  const [hoveredNode, setHoveredNode] = useState(null);
  const [hoveredLink, setHoveredLink] = useState(null);

  // Container dimensions
  const [dimensions, setDimensions] = useState({ width: 900, height: 600 });

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth || 900,
          height: Math.max(560, window.innerHeight - 340)
        });
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const fetchGraph = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getIngredientGraph({
        course: course === 'All' ? undefined : course,
        cuisine: cuisine === 'All' ? undefined : cuisine,
        top_n: topN,
        min_lift: minLift
      });
      setGraphData(data);
    } catch (err) {
      console.error('Failed to load ingredient graph:', err);
      setError(err.message || 'Failed to load graph data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGraph();
  }, [course, cuisine, minLift, topN]);

  // Highlight matching nodes
  const activeSearchSet = useMemo(() => {
    if (!searchQuery.trim()) return null;
    const q = searchQuery.toLowerCase().trim();
    return new Set(graphData.nodes.filter(n => n.id.toLowerCase().includes(q)).map(n => n.id));
  }, [searchQuery, graphData.nodes]);

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 space-y-6 animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-slate-800">
        <div className="space-y-1.5">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Network className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold font-display text-white">
                {t('graph.title', 'Interactive Ingredient Association Network')}
              </h1>
              <p className="text-xs text-slate-400">
                {t('graph.subtitle', 'Force-directed graph of ingredient co-occurrences sized by frequency, with edge thickness and tension weighted by association lift.')}
              </p>
            </div>
          </div>
        </div>

        {/* Status Pill */}
        <div className="flex items-center space-x-2 text-xs font-mono">
          <span className="px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300">
            {graphData.nodes.length} Nodes • {graphData.links.length} Links
          </span>
          <span className="px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-emerald-400">
            {graphData.total_recipes ? `${graphData.total_recipes.toLocaleString()} Recipes` : 'Loading...'}
          </span>
        </div>
      </div>

      {/* Controls / Filter Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Highlight ingredient..."
              className="bg-slate-900/90 text-slate-100 placeholder-slate-500 text-xs rounded-xl pl-8 pr-3 py-2 border border-slate-700/80 focus:outline-none focus:border-amber-500 w-44"
            />
          </div>

          {/* Course Filter */}
          <div className="flex items-center space-x-1.5 text-xs">
            <span className="text-slate-400 font-medium">Course:</span>
            <select
              value={course}
              onChange={(e) => setCourse(e.target.value)}
              className="bg-slate-900 text-slate-200 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-amber-500"
            >
              <option value="All">All Courses</option>
              <option value="Main Course">Main Course</option>
              <option value="Dessert">Dessert</option>
              <option value="Appetizer & Side">Appetizer & Side</option>
              <option value="Breakfast">Breakfast</option>
              <option value="Beverage">Beverage</option>
            </select>
          </div>

          {/* Cuisine Filter */}
          <div className="flex items-center space-x-1.5 text-xs">
            <span className="text-slate-400 font-medium">Cuisine:</span>
            <select
              value={cuisine}
              onChange={(e) => setCuisine(e.target.value)}
              className="bg-slate-900 text-slate-200 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-amber-500"
            >
              <option value="All">All Cuisines</option>
              <option value="American">American</option>
              <option value="Mediterranean">Mediterranean</option>
              <option value="Italian">Italian</option>
              <option value="Asian">Asian</option>
              <option value="Mexican">Mexican</option>
              <option value="Indian">Indian</option>
            </select>
          </div>

          {/* Min Lift Slider */}
          <div className="flex items-center space-x-2 text-xs">
            <span className="text-slate-400 font-medium">Min Lift:</span>
            <input
              type="range"
              min="1.0"
              max="3.0"
              step="0.1"
              value={minLift}
              onChange={(e) => setMinLift(parseFloat(e.target.value))}
              className="w-20 accent-amber-500"
            />
            <span className="font-mono text-amber-400 w-8">{minLift}x</span>
          </div>

          {/* Top N Nodes */}
          <div className="flex items-center space-x-2 text-xs">
            <span className="text-slate-400 font-medium">Nodes:</span>
            <input
              type="range"
              min="20"
              max="70"
              step="5"
              value={topN}
              onChange={(e) => setTopN(parseInt(e.target.value))}
              className="w-20 accent-amber-500"
            />
            <span className="font-mono text-amber-400 w-6">{topN}</span>
          </div>
        </div>

        {/* Reset / Zoom actions */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              setCourse('All');
              setCuisine('All');
              setMinLift(1.2);
              setTopN(50);
              setSearchQuery('');
              if (graphRef.current) graphRef.current.zoomToFit(400);
            }}
            className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs text-slate-300 flex items-center space-x-1"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Reset View</span>
          </button>
        </div>
      </div>

      {/* Graph Area */}
      <div 
        ref={containerRef}
        className="glass-panel rounded-2xl border border-slate-800 relative overflow-hidden shadow-2xl bg-slate-950/80 min-h-[560px]"
      >
        {loading && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-950/70 backdrop-blur-sm">
            <RefreshCw className="w-8 h-8 text-amber-400 animate-spin mb-3" />
            <span className="text-xs font-mono text-slate-300">Computing Co-Occurrences & Lift...</span>
          </div>
        )}

        {/* Hover Inspect Card (Floating overlay) */}
        {(hoveredNode || hoveredLink) && (
          <div className="absolute top-4 left-4 z-10 p-3 rounded-xl bg-slate-900/90 border border-slate-700/80 backdrop-blur-md text-xs shadow-xl max-w-xs animate-fadeIn">
            {hoveredNode && (
              <div className="space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-white text-sm">{hoveredNode.label}</span>
                  <span 
                    className="w-2.5 h-2.5 rounded-full shrink-0" 
                    style={{ backgroundColor: CATEGORY_COLORS[hoveredNode.category] || '#94a3b8' }}
                  />
                </div>
                <div className="text-[11px] text-slate-400 font-mono">
                  Category: <span className="text-slate-200">{hoveredNode.category}</span>
                </div>
                <div className="text-[11px] text-slate-400 font-mono">
                  Corpus Frequency: <span className="text-emerald-400 font-semibold">{hoveredNode.frequency}</span> ({((hoveredNode.support || 0) * 100).toFixed(1)}% of recipes)
                </div>
              </div>
            )}

            {hoveredLink && (
              <div className="space-y-1">
                <div className="font-bold text-white text-sm">
                  {typeof hoveredLink.source === 'object' ? hoveredLink.source.label : hoveredLink.source}
                  {' ↔ '}
                  {typeof hoveredLink.target === 'object' ? hoveredLink.target.label : hoveredLink.target}
                </div>
                <div className="grid grid-cols-3 gap-2 pt-1 font-mono text-[11px]">
                  <div>
                    <span className="text-slate-400 block text-[10px]">LIFT</span>
                    <span className="text-amber-400 font-bold">{hoveredLink.lift}x</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">CONF</span>
                    <span className="text-teal-400 font-bold">{((hoveredLink.confidence || 0) * 100).toFixed(0)}%</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">CO-OCCUR</span>
                    <span className="text-slate-200 font-bold">{hoveredLink.co_occurrence}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Category Legend in Bottom Right */}
        <div className="absolute bottom-4 right-4 z-10 p-3 rounded-xl bg-slate-900/90 border border-slate-800/80 backdrop-blur-md text-[10px] space-y-1.5 shadow-lg hidden sm:block">
          <div className="font-semibold text-slate-300 uppercase tracking-wider font-mono pb-1 border-b border-slate-800">
            Ingredient Clusters
          </div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1">
            {Object.entries(CATEGORY_COLORS).map(([cat, color]) => (
              <div key={cat} className="flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
                <span className="text-slate-300">{cat}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Hint Pill */}
        <div className="absolute bottom-4 left-4 z-10 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] text-slate-400 hidden md:flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-amber-400" />
          <span>{t('graph.hover_hint', 'Hover over nodes or links to inspect support, confidence, and lift metrics. Drag nodes to explore.')}</span>
        </div>

        {/* Force Directed Canvas */}
        {graphData.nodes.length > 0 && (
          <ForceGraph2D
            ref={graphRef}
            width={dimensions.width}
            height={dimensions.height}
            graphData={graphData}
            nodeId="id"
            nodeVal={node => Math.sqrt(node.val || 10) * 1.4}
            nodeColor={node => {
              if (activeSearchSet) {
                return activeSearchSet.has(node.id) ? '#38bdf8' : '#334155';
              }
              return CATEGORY_COLORS[node.category] || '#94a3b8';
            }}
            nodeLabel={node => `${node.label} (${node.frequency} recipes)`}
            linkWidth={link => Math.min(5, Math.max(1, (link.lift - 1) * 1.1))}
            linkColor={link => {
              if (hoveredLink === link) return '#f59e0b';
              const alpha = Math.min(0.8, Math.max(0.2, (link.lift - 1) / 4));
              return `rgba(245, 158, 11, ${alpha})`;
            }}
            linkDirectionalParticles={2}
            linkDirectionalParticleWidth={link => (link.lift > 2.5 ? 2 : 0)}
            linkDirectionalParticleSpeed={0.005}
            onNodeHover={node => setHoveredNode(node || null)}
            onLinkHover={link => setHoveredLink(link || null)}
            cooldownTicks={100}
            nodeCanvasObject={(node, ctx, globalScale) => {
              const label = node.label || node.id;
              const fontSize = 11 / globalScale;
              const radius = Math.sqrt(node.val || 10) * 0.7;

              // Node circle
              ctx.beginPath();
              ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI, false);
              ctx.fillStyle = activeSearchSet && !activeSearchSet.has(node.id)
                ? '#334155'
                : (CATEGORY_COLORS[node.category] || '#94a3b8');
              ctx.fill();

              // Ring if hovered or search matched
              if (hoveredNode?.id === node.id || (activeSearchSet && activeSearchSet.has(node.id))) {
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 2 / globalScale;
                ctx.stroke();
              }

              // Text label
              if (globalScale > 1.2 || node.frequency > 1000 || hoveredNode?.id === node.id) {
                ctx.font = `${fontSize}px Inter, sans-serif`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = '#ffffff';
                ctx.fillText(label, node.x, node.y + radius + fontSize + 1);
              }
            }}
          />
        )}
      </div>
    </div>
  );
}
