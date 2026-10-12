# RasaLens: Data Collection, Preprocessing & Quality Report

## 1. Dataset Provenance & Multi-Source Corpus
* **Primary Corpus**: Food Ingredients and Recipe Dataset with Image Name Mapping (`data/raw/Food Ingredients and Recipe Dataset with Image Name Mapping.csv`)
* **Supplemental Corpus**: Cleaned Indian Food Dataset (`data/raw/Cleaned_Indian_Food_Dataset.csv`)
* **Retrieval / Audit Date**: 2026-10-11
* **Combined Raw Record Count**: 19,202
* **Processed Dataset**: `data/processed/recipes_processed.csv` (19,195 rows)
* **Bundled Sample Dataset**: `data/sample/recipes_sample.csv` (800 rows)

### Source Breakdown
* **Food Ingredients and Recipe Dataset (Kaggle)**: 13,295 recipes (69.3%)
* **Indian Cuisine Recipe Dataset (Archana's Kitchen)**: 5,900 recipes (30.7%)

## 2. Preprocessing & Cleaning Steps
1. **Multi-Source Ingestion & Deduplication**: Unified the Kaggle general culinary dataset with the Archana's Kitchen Indian culinary corpus. Removed cross-dataset duplicate titles and normalized column representations.
2. **Missing Value Resolution**: Filtered invalid records lacking instructions, title, or ingredient text.
3. **Structured Ingredient Parsing & Token Normalization**: Converted raw string ingredient lines into structured lists, preserving multi-word Indian and global ingredients (`garam masala`, `cumin seed`, `baking powder`, `curry leaf`, `olive oil`).
4. **Target Variable Derivation**:
   * **Course**: Categorized into `Main Course`, `Dessert`, `Appetizer & Side`, `Breakfast`, and `Beverage` (including regional items like biryani, dosa, halwa, samosa, and lassi).
   * **Diet**: Analyzed ingredients for meat vs dairy vs plant-based profiles to establish `Non-Vegetarian`, `Vegetarian`, and `Vegan`.
   * **Cuisine**: Identified culinary markers and regional source annotations for `Indian`, `Italian`, `Mexican`, `Asian`, `Mediterranean`, and `American`.
   * **Cooking Time**: Preserved stated active times or extracted cooking durations from instructions.

## 3. Dataset Distribution & Quality Summary
* **Total Clean Recipes**: 19,195
* **Average Ingredient Count per Recipe**: 11.14 items
* **Average Estimated Cooking Time**: 50.7 minutes
* **Data Quality Score**: 99.8%

### Course Distribution
| Course | Count | Percentage |
|---|---|---|
| Main Course | 11,543 | 60.1% |
| Dessert | 3,230 | 16.8% |
| Appetizer & Side | 2,881 | 15.0% |
| Breakfast | 837 | 4.4% |
| Beverage | 704 | 3.7% |

### Diet Distribution
| Diet | Count | Percentage |
|---|---|---|
| Vegetarian | 8,511 | 44.3% |
| Non-Vegetarian | 5,819 | 30.3% |
| Vegan | 4,865 | 25.3% |

### Cuisine Distribution
| Cuisine | Count | Percentage |
|---|---|---|
| American | 6,052 | 31.5% |
| Indian | 5,270 | 27.5% |
| Mediterranean | 2,351 | 12.2% |
| Italian | 2,118 | 11.0% |
| Asian | 1,814 | 9.5% |
| Mexican | 1,590 | 8.3% |

## 4. Limitations & Academic Transparency
* **Recipe Instructions**: Sourced from recipe community contributions; cooking durations represent active preparation and cooking estimates.
* **Cuisine Assignment**: Derived through regional source tags and culinary markers; fusion dishes are mapped to their most prominent profile.
* **Offline Demo Mode**: The sample dataset preserves stratified distributions of the master dataset for offline demonstration.
