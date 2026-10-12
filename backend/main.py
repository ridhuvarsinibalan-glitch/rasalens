import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.api import (
    health,
    etl,
    ner,
    classification,
    market_basket,
    qa,
    recipes,
    videos,
    evaluation,
    analyze,
    translation
)

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("rasalens.main")

app = FastAPI(
    title="RasaLens API",
    description="Intelligent Culinary NLP Engine & Academic Machine Learning Platform",
    version="1.0.0"
)

# Enable CORS for local React/Vite development and demo
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount all endpoint routers
app.include_router(health.router)
app.include_router(etl.router)
app.include_router(ner.router)
app.include_router(classification.router)
app.include_router(market_basket.router)
app.include_router(qa.router)
app.include_router(recipes.router)
app.include_router(videos.router)
app.include_router(evaluation.router)
app.include_router(analyze.router)
app.include_router(translation.router)

@app.get("/")
def root():
    return {
        "name": "RasaLens API",
        "description": "Culinary NLP, Market Basket Analysis, Semantic RAG & Video Intelligence Platform",
        "status": "online",
        "docs_url": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="127.0.0.1", port=8000, reload=True)
