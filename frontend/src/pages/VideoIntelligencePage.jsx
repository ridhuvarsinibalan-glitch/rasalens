import React, { useState, useEffect } from 'react';
import {
  Video,
  Play,
  Clock,
  Eye,
  UtensilsCrossed,
  Sparkles,
  CheckCircle2,
  ExternalLink,
  Tag
} from 'lucide-react';
import { api } from '../services/api';

export default function VideoIntelligencePage() {
  const [videos, setVideos] = useState([]);
  const [activeVideo, setActiveVideo] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [loadingVideos, setLoadingVideos] = useState(true);

  useEffect(() => {
    api.getVideos()
      .then((data) => {
        setVideos(data);
        if (data.length > 0) {
          setActiveVideo(data[0]);
        }
        setLoadingVideos(false);
      })
      .catch((err) => {
        console.error(err);
        setLoadingVideos(false);
      });
  }, []);

  const handleAnalyzeVideo = async (video) => {
    setActiveVideo(video);
    setLoadingAnalysis(true);
    setAnalysis(null);
    try {
      const res = await api.analyzeVideo(video.id);
      setAnalysis(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAnalysis(false);
    }
  };

  return (
    <div className="space-y-8 py-4 max-w-7xl mx-auto">
      
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2 text-xs font-mono text-amber-400 uppercase tracking-wider">
          <Video className="w-3.5 h-3.5" />
          <span>Recipe-Video Intelligence & Transcript Synchronization</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold font-display text-white mt-1">
          Video Intelligence
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Explore curated culinary demonstration videos with synchronized timestamped transcripts, ingredient extraction, and course classification.
        </p>
      </div>

      {loadingVideos ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-400 font-mono">Loading culinary video catalog...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Video List (Left Column) */}
          <div className="space-y-3 lg:col-span-1">
            <h3 className="font-display font-semibold text-sm text-slate-300 uppercase tracking-wider font-mono">
              Verified Video Catalog ({videos.length})
            </h3>

            <div className="space-y-3">
              {videos.map((vid) => {
                const isSelected = activeVideo?.id === vid.id;
                return (
                  <div
                    key={vid.id}
                    onClick={() => {
                      setActiveVideo(vid);
                      setAnalysis(null);
                    }}
                    className={`glass-card rounded-2xl p-3 border cursor-pointer transition-all flex items-center space-x-3 ${
                      isSelected
                        ? 'border-amber-500/50 bg-amber-500/10 shadow-lg shadow-amber-500/10'
                        : 'border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <img
                      src={vid.thumbnail_url}
                      alt={vid.title}
                      className="w-24 h-16 object-cover rounded-xl border border-slate-800 flex-shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <h4 className="font-display font-semibold text-xs text-white line-clamp-1">
                        {vid.title}
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">{vid.channel}</p>
                      <div className="flex items-center space-x-2 text-[10px] font-mono mt-1">
                        <span className="text-slate-500">{vid.duration}</span>
                        <span className="text-slate-700">•</span>
                        <span className={vid.transcript_status === 'available' ? 'text-emerald-400 font-semibold' : 'text-amber-400'}>
                          {vid.transcript_status === 'available' ? 'Captions Available' : 'Transcript unavailable'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active Video Player & Transcript Details (Right 2 Columns) */}
          <div className="lg:col-span-2 space-y-6">
            {activeVideo && (
              <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-6">
                
                {/* Media preview banner */}
                <div className="relative rounded-2xl overflow-hidden border border-slate-800 aspect-video max-h-80 w-full group">
                  <img
                    src={activeVideo.thumbnail_url}
                    alt={activeVideo.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-slate-950/40 group-hover:bg-slate-950/20 transition-all flex items-center justify-center">
                    <a
                      href={activeVideo.video_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-16 h-16 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center justify-center shadow-xl shadow-amber-500/30 hover:scale-110 transition-transform"
                    >
                      <Play className="w-7 h-7 fill-slate-950 ml-1" />
                    </a>
                  </div>
                  <div className="absolute bottom-3 right-3 px-2 py-1 rounded bg-slate-950/80 text-white font-mono text-xs">
                    {activeVideo.duration}
                  </div>
                </div>

                {/* Video Info */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="font-display font-bold text-xl text-white">
                      {activeVideo.title}
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Chef / Channel: <strong className="text-slate-200">{activeVideo.channel}</strong> • Recipe: <span className="text-amber-400">{activeVideo.recipe_match}</span>
                    </p>
                  </div>

                  {activeVideo.transcript_status === 'available' ? (
                    <button
                      onClick={() => handleAnalyzeVideo(activeVideo)}
                      disabled={loadingAnalysis}
                      className="flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all self-start sm:self-center shadow-md shadow-emerald-500/20"
                    >
                      <Sparkles className="w-3.5 h-3.5 fill-slate-950" />
                      <span>{loadingAnalysis ? 'Analyzing Transcript...' : 'Run NLP on Transcript'}</span>
                    </button>
                  ) : (
                    <span className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono self-start sm:self-center">
                      Transcript unavailable
                    </span>
                  )}
                </div>

                {/* Real-time NLP Analysis Result on Transcript (Only for real transcripts) */}
                {analysis && activeVideo.transcript_status === 'available' && (
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-3 animate-fadeIn text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-emerald-400 uppercase font-semibold">
                        Transcript NLP Analysis:
                      </span>
                      <span className="text-slate-300">
                        Course: <strong className="text-white font-display">{analysis.course_classification}</strong> ({(analysis.confidence * 100).toFixed(1)}%)
                      </span>
                    </div>

                    {analysis.extracted_ingredients && analysis.extracted_ingredients.length > 0 ? (
                      <div>
                        <span className="text-slate-400 font-mono text-[11px] block mb-1">
                          Ingredients Extracted from Video Transcript (spaCy NER):
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {analysis.extracted_ingredients.map((ing, i) => (
                            <span key={i} className="px-2 py-0.5 rounded-full bg-slate-900 border border-emerald-500/30 text-emerald-300 text-[11px] font-mono">
                              {ing}
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <span className="text-slate-500 font-mono text-[11px]">No ingredient entities found in video transcript.</span>
                    )}
                  </div>
                )}

                {/* Timestamped Transcript */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display font-semibold text-sm text-slate-200 uppercase tracking-wider font-mono">
                      Timestamped Transcript:
                    </h3>
                    <span className={`text-[11px] font-mono px-2 py-0.5 rounded ${
                      activeVideo.transcript_status === 'available'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                    }`}>
                      {activeVideo.transcript_status === 'available' ? 'Genuine YouTube Captions' : 'Transcript unavailable'}
                    </span>
                  </div>

                  {activeVideo.transcript_status === 'available' && activeVideo.transcript !== 'Transcript unavailable' ? (
                    <div className="space-y-2 bg-slate-950 p-4 rounded-2xl border border-slate-800 max-h-72 overflow-y-auto font-sans text-xs">
                      {activeVideo.transcript.split('\n').filter(Boolean).map((line, idx) => {
                        const match = line.match(/^(\d{2}:\d{2})\s*(.*)/);
                        const timestamp = match ? match[1] : '';
                        const content = match ? match[2] : line;

                        return (
                          <div key={idx} className="flex items-start space-x-3 p-2 rounded-lg hover:bg-slate-900/60 transition-colors">
                            <span className="font-mono text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 flex-shrink-0">
                              {timestamp}
                            </span>
                            <span className="text-slate-300 leading-relaxed">{content}</span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-8 bg-slate-950 rounded-2xl border border-slate-800 text-center space-y-2">
                      <span className="text-amber-400 font-mono text-xs uppercase font-semibold block">Transcript unavailable</span>
                      <p className="text-xs text-slate-400 max-w-sm mx-auto">
                        Captions are disabled or not published for this video on YouTube. NER extraction is only performed on authentic transcripts.
                      </p>
                    </div>
                  )}
                </div>

              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
}
