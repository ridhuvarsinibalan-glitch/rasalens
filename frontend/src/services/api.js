// RasaLens API Client Service

const BASE_URL = ''; // Proxied via Vite to http://127.0.0.1:8000

export const api = {
  async getHealth() {
    const res = await fetch(`${BASE_URL}/api/health`);
    if (!res.ok) throw new Error('Failed to fetch system health');
    return res.json();
  },

  async getETLStatus() {
    const res = await fetch(`${BASE_URL}/api/etl/status`);
    if (!res.ok) throw new Error('Failed to fetch ETL status');
    return res.json();
  },

  async triggerETL() {
    const res = await fetch(`${BASE_URL}/api/etl/run`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to run ETL pipeline');
    return res.json();
  },

  async analyzeNER(text, modelChoice = 'all') {
    const res = await fetch(`${BASE_URL}/api/ner`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, model_choice: modelChoice })
    });
    if (!res.ok) throw new Error('NER analysis failed');
    return res.json();
  },

  async classifyText(text) {
    const res = await fetch(`${BASE_URL}/api/classify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });
    if (!res.ok) throw new Error('Classification failed');
    return res.json();
  },

  async getMarketBasket(ingredients, topN = 6) {
    const res = await fetch(`${BASE_URL}/api/market-basket`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ingredients, top_n: topN })
    });
    if (!res.ok) throw new Error('Market Basket Analysis failed');
    return res.json();
  },

  async getIngredientGraph(params = {}) {
    const cleanParams = {};
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '' && v !== 'All') {
        cleanParams[k] = v;
      }
    });
    const query = new URLSearchParams(cleanParams).toString();
    const res = await fetch(`${BASE_URL}/api/market-basket/graph${query ? `?${query}` : ''}`);
    if (!res.ok) throw new Error('Failed to fetch ingredient association graph');
    return res.json();
  },

  async queryQA(query, topK = 5) {
    const res = await fetch(`${BASE_URL}/api/qa`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, top_k: topK })
    });
    if (!res.ok) throw new Error('QA retrieval failed');
    return res.json();
  },

  async getRecipes(params = {}) {
    const cleanParams = {};
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '' && v !== 'All' && v !== 'undefined') {
        cleanParams[k] = v;
      }
    });
    const query = new URLSearchParams(cleanParams).toString();
    const res = await fetch(`${BASE_URL}/api/recipes${query ? `?${query}` : ''}`);
    if (!res.ok) {
      let errMsg = `Failed to fetch recipes (${res.status})`;
      try {
        const errJson = await res.json();
        errMsg = errJson.detail || errJson.message || errMsg;
      } catch {
        const text = await res.text();
        if (text) errMsg = `${errMsg}: ${text}`;
      }
      throw new Error(errMsg);
    }
    return res.json();
  },

  async getRecipeById(id) {
    const res = await fetch(`${BASE_URL}/api/recipes/${id}`);
    if (!res.ok) {
      const err = new Error(res.status === 404 ? `Recipe '${id}' not found` : `Failed to fetch recipe ${id}`);
      err.status = res.status;
      throw err;
    }
    return res.json();
  },

  async getVideos() {
    const res = await fetch(`${BASE_URL}/api/videos`);
    if (!res.ok) throw new Error('Failed to fetch video catalog');
    return res.json();
  },

  async analyzeVideo(id) {
    const res = await fetch(`${BASE_URL}/api/videos/${id}/analyze`);
    if (!res.ok) throw new Error(`Failed to analyze video ${id}`);
    return res.json();
  },

  async getEvaluationMetrics() {
    const res = await fetch(`${BASE_URL}/api/evaluation`);
    if (!res.ok) throw new Error('Failed to fetch evaluation metrics');
    return res.json();
  },

  async translateText(text, sourceLang = null, targetLang = null) {
    const res = await fetch(`${BASE_URL}/api/translation/translate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, source_lang: sourceLang, target_lang: targetLang })
    });
    if (!res.ok) {
      let errorMsg = `Translation request failed (${res.status})`;
      try {
        const errJson = await res.json();
        errorMsg = errJson.detail || errJson.message || errorMsg;
      } catch {
        const errText = await res.text();
        if (errText) errorMsg = `${errorMsg}: ${errText}`;
      }
      throw new Error(errorMsg);
    }
    return res.json();
  },

  async analyzeStudio(payload) {
    const res = await fetch(`${BASE_URL}/api/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Studio analysis failed');
    return res.json();
  }
};
