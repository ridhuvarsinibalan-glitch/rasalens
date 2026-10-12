"""
Create QA Testset with 32 Questions and Verified Recipe IDs
Marked 'pending manual review' for audit compliance.
"""

import os
import json
import pandas as pd

PROCESSED_PATH = os.path.join("data", "processed", "recipes_processed.csv")
OUT_PATH = os.path.join("evaluation", "data", "qa_testset.json")

testset = [
    {
        "id": "qa_01",
        "question": "How can I bake chewy chocolate chip cookies?",
        "category": "dessert_baking",
        "is_answerable": True,
        "relevant_recipe_ids": ["rec_01740", "rec_01351"],
        "notes": "Verified matches: Chewy Chocolate Chip Cookies and Salted-Butter Oatmeal Chocolate Chip Cookies"
    },
    {
        "id": "qa_02",
        "question": "What is a quick recipe for homemade tomatillo guacamole?",
        "category": "appetizer_dip",
        "is_answerable": True,
        "relevant_recipe_ids": ["rec_01841"],
        "notes": "Verified match: 3-Ingredient Tomatillo Guacamole"
    },
    {
        "id": "qa_03",
        "question": "How do I make classic baked chicken parmesan with tomato sauce and mozzarella?",
        "category": "main_italian",
        "is_answerable": True,
        "relevant_recipe_ids": ["rec_02586", "rec_05604"],
        "notes": "Verified matches: Quick Baked Chicken Parmesan, Chicken Parmesan"
    },
    {
        "id": "qa_04",
        "question": "How to make a hearty beef and sweet potato chili in an Instant Pot?",
        "category": "main_american",
        "is_answerable": True,
        "relevant_recipe_ids": ["rec_00961"],
        "notes": "Verified match: Instant Pot Beef and Sweet Potato Chili"
    },
    {
        "id": "qa_05",
        "question": "What is the recipe for classic moist banana bread?",
        "category": "breakfast_baking",
        "is_answerable": True,
        "relevant_recipe_ids": ["rec_02464", "rec_03945"],
        "notes": "Verified matches: Banana Bread, Our Favorite Banana Bread"
    },
    {
        "id": "qa_06",
        "question": "How can I make coconut milk French toast with pineapple syrup?",
        "category": "breakfast",
        "is_answerable": True,
        "relevant_recipe_ids": ["rec_01328"],
        "notes": "Verified match: Coconut Milk French Toast with Pineapple Syrup"
    },
    {
        "id": "qa_07",
        "question": "How do I make a crispy grilled pizza with fresh summer zucchini and tomatoes?",
        "category": "main_italian",
        "is_answerable": True,
        "relevant_recipe_ids": ["rec_01122", "rec_00202"],
        "notes": "Verified matches: Summer Pizza with Salami, Zucchini, and Tomatoes, Grilled Pizza"
    },
    {
        "id": "qa_08",
        "question": "What ingredients go into Caesar salad roast chicken?",
        "category": "main_course",
        "is_answerable": True,
        "relevant_recipe_ids": ["rec_00014"],
        "notes": "Verified match: Caesar Salad Roast Chicken"
    },
    {
        "id": "qa_09",
        "question": "How to make traditional American homemade apple pie?",
        "category": "dessert_pie",
        "is_answerable": True,
        "relevant_recipe_ids": ["rec_01583"],
        "notes": "Verified match: Our Favorite Apple Pie"
    },
    {
        "id": "qa_10",
        "question": "How to cook creamy risotto with mushrooms and fresh thyme?",
        "category": "main_italian",
        "is_answerable": True,
        "relevant_recipe_ids": ["rec_00332"],
        "notes": "Verified match: Risotto With Mushrooms and Thyme"
    },
    {
        "id": "qa_11",
        "question": "How do I cook shrimp scampi with garlic, butter and lemon?",
        "category": "main_seafood",
        "is_answerable": True,
        "relevant_recipe_ids": ["rec_04053", "rec_01439"],
        "notes": "Verified matches: Shrimp Scampi, Instant Pot Shrimp Scampi"
    },
    {
        "id": "qa_12",
        "question": "How to make butternut squash soup with pumpkin butter?",
        "category": "soup",
        "is_answerable": True,
        "relevant_recipe_ids": ["rec_05942"],
        "notes": "Verified match: Butternut Squash Soup with Pumpkin Butter"
    },
    {
        "id": "qa_13",
        "question": "What is the recipe for classic bakery style blueberry muffins?",
        "category": "breakfast_muffins",
        "is_answerable": True,
        "relevant_recipe_ids": ["rec_01843"],
        "notes": "Verified match: Epi Classic Blueberry Muffins"
    },
    {
        "id": "qa_14",
        "question": "How to prepare pork carnitas in a pressure cooker or Instant Pot?",
        "category": "main_mexican",
        "is_answerable": True,
        "relevant_recipe_ids": ["rec_02289", "rec_00441"],
        "notes": "Verified matches: Instant-Pot Carnitas, Instant Pot Tequila Lime Carnitas"
    },
    {
        "id": "qa_15",
        "question": "How to make a quick chilled summer tomato gazpacho soup?",
        "category": "soup_chilled",
        "is_answerable": True,
        "relevant_recipe_ids": ["rec_00134"],
        "notes": "Verified match: Speedy Summer Gazpacho"
    },
    {
        "id": "qa_16",
        "question": "How to make creamy homemade hummus served with spiced summer squash?",
        "category": "appetizer_mediterranean",
        "is_answerable": True,
        "relevant_recipe_ids": ["rec_00607"],
        "notes": "Verified match: Hummus with Spiced Summer Squash and Lamb"
    },
    {
        "id": "qa_17",
        "question": "What are the steps to make traditional New England clam chowder?",
        "category": "soup_seafood",
        "is_answerable": True,
        "relevant_recipe_ids": ["rec_05946"],
        "notes": "Verified match: New England Clam Chowder"
    },
    {
        "id": "qa_18",
        "question": "How to prepare a smooth and decadent dark chocolate mousse?",
        "category": "dessert_mousse",
        "is_answerable": True,
        "relevant_recipe_ids": ["rec_01347", "rec_03509"],
        "notes": "Verified matches: Chocolate Mousse, Dark-Chocolate Mousse"
    },
    {
        "id": "qa_19",
        "question": "How to make crispy Baja style fish tacos with shredded cabbage and lime?",
        "category": "main_mexican",
        "is_answerable": True,
        "relevant_recipe_ids": ["rec_01963", "rec_03497"],
        "notes": "Verified matches: Baja Fish Tacos, Sheet-Pan Crispy Fish Tacos with Chili-Roasted Corn"
    },
    {
        "id": "qa_20",
        "question": "How to make slow cooker or crock pot beef stew with potatoes and carrots?",
        "category": "main_stew",
        "is_answerable": True,
        "relevant_recipe_ids": ["rec_04054"],
        "notes": "Verified match: Beef Stew in the Crock Pot"
    },
    {
        "id": "qa_21",
        "question": "How to roast Brussels sprouts with a sweet honey glaze?",
        "category": "side_dish",
        "is_answerable": True,
        "relevant_recipe_ids": ["rec_00774"],
        "notes": "Verified match: Roasted Brussels Sprouts with Warm Honey Glaze"
    },
    {
        "id": "qa_22",
        "question": "What is the recipe for classic oven baked beef lasagna with ricotta?",
        "category": "main_italian",
        "is_answerable": True,
        "relevant_recipe_ids": ["rec_01544"],
        "notes": "Verified match: Mueller's Classic Lasagna"
    },
    {
        "id": "qa_23",
        "question": "How to make rich cheddar potato soup with crispy bacon topping?",
        "category": "soup",
        "is_answerable": True,
        "relevant_recipe_ids": ["rec_00586"],
        "notes": "Verified match: Cheddar Potato Soup with Bacon"
    },
    {
        "id": "qa_24",
        "question": "How to prepare the simplest holiday whole roast turkey?",
        "category": "main_holiday",
        "is_answerable": True,
        "relevant_recipe_ids": ["rec_01004", "rec_00935"],
        "notes": "Verified matches: The Simplest Roast Turkey, Dry-Rubbed Roast Turkey"
    },
    {
        "id": "qa_25",
        "question": "How do I bake tender sweet cornbread muffins with whipped corn butter?",
        "category": "side_baking",
        "is_answerable": True,
        "relevant_recipe_ids": ["rec_00179"],
        "notes": "Verified match: Cornbread Muffins With Whipped Sweet Corn"
    },
    {
        "id": "qa_26",
        "question": "How to prepare Thai rice noodles with chili oil and pomodoro sauce?",
        "category": "main_asian",
        "is_answerable": True,
        "relevant_recipe_ids": ["rec_01088"],
        "notes": "Verified match: Rice Noodles al Pomodoro with Chili Oil"
    },
    # Unanswerable queries (not present in Western corpus)
    {
        "id": "qa_27",
        "question": "How do I make authentic South Indian fermented idli and medu vada with coconut chutney?",
        "category": "unanswerable_indian",
        "is_answerable": False,
        "relevant_recipe_ids": [],
        "notes": "Not answerable: South Indian fermented batter idli dishes do not exist in this Western corpus."
    },
    {
        "id": "qa_28",
        "question": "What is the recipe for Japanese takoyaki octopus balls with bonito flakes and kewpie mayo?",
        "category": "unanswerable_japanese",
        "is_answerable": False,
        "relevant_recipe_ids": [],
        "notes": "Not answerable: Japanese takoyaki street food is not present in the dataset."
    },
    {
        "id": "qa_29",
        "question": "How to cook traditional Kashmiri mutton rogan josh with whole spices and ratan jot?",
        "category": "unanswerable_indian",
        "is_answerable": False,
        "relevant_recipe_ids": [],
        "notes": "Not answerable: Kashmiri rogan josh with ratan jot is not present in the dataset."
    },
    {
        "id": "qa_30",
        "question": "How to make Ethiopian doro wat chicken stew with injera sourdough flatbread?",
        "category": "unanswerable_ethiopian",
        "is_answerable": False,
        "relevant_recipe_ids": [],
        "notes": "Not answerable: Ethiopian injera and doro wat are absent from this corpus."
    },
    {
        "id": "qa_31",
        "question": "What is the traditional Nigerian jollof rice recipe cooked with smoked turkey and fried plantains?",
        "category": "unanswerable_west_african",
        "is_answerable": False,
        "relevant_recipe_ids": [],
        "notes": "Not answerable: Nigerian jollof rice is not present in the dataset."
    },
    {
        "id": "qa_32",
        "question": "How to make authentic Vietnamese Pho Bo 24-hour beef bone broth with star anise and rice noodles?",
        "category": "unanswerable_vietnamese",
        "is_answerable": False,
        "relevant_recipe_ids": [],
        "notes": "Not answerable: Authentic Vietnamese 24-hour Pho Bo beef bone broth is absent from this corpus."
    }
]

def main():
    os.makedirs(os.path.dirname(OUT_PATH), exist_ok=True)
    meta = {
        "version": "1.0",
        "status": "pending manual review",
        "total_questions": len(testset),
        "answerable_questions": sum(1 for q in testset if q["is_answerable"]),
        "unanswerable_questions": sum(1 for q in testset if not q["is_answerable"]),
        "test_cases": testset
    }
    with open(OUT_PATH, "w", encoding="utf-8") as f:
        json.dump(meta, f, indent=2, ensure_ascii=False)
    print(f"Generated {OUT_PATH} with {len(testset)} queries.")

if __name__ == "__main__":
    main()
