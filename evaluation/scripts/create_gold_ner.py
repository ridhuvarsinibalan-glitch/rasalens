import os
import json

os.makedirs(os.path.join("data", "ner"), exist_ok=True)
GOLD_PATH = os.path.join("data", "ner", "gold_test.jsonl")

# 80 Ingredient Lines (Line Format) and 80 Conversational / Natural Pantry Sentences
DATA_SPEC = [
    # --- PART 1: 80 RECIPE INGREDIENT LINES ---
    ("2 tablespoons extra virgin olive oil", [("2", "QUANTITY"), ("tablespoons", "UNIT"), ("extra virgin olive oil", "FOOD_ITEM")]),
    ("1/2 cup finely diced yellow onion", [("1/2", "QUANTITY"), ("cup", "UNIT"), ("yellow onion", "FOOD_ITEM")]),
    ("3 cloves garlic, minced", [("3", "QUANTITY"), ("cloves", "UNIT"), ("garlic", "FOOD_ITEM")]),
    ("500 grams boneless skinless chicken breasts", [("500", "QUANTITY"), ("grams", "UNIT"), ("boneless skinless chicken breasts", "FOOD_ITEM")]),
    ("1 teaspoon ground cumin", [("1", "QUANTITY"), ("teaspoon", "UNIT"), ("ground cumin", "FOOD_ITEM")]),
    ("1/4 teaspoon cayenne pepper", [("1/4", "QUANTITY"), ("teaspoon", "UNIT"), ("cayenne pepper", "FOOD_ITEM")]),
    ("2 cups low-sodium chicken broth", [("2", "QUANTITY"), ("cups", "UNIT"), ("chicken broth", "FOOD_ITEM")]),
    ("1 can crushed San Marzano tomatoes", [("1", "QUANTITY"), ("can", "UNIT"), ("San Marzano tomatoes", "FOOD_ITEM")]),
    ("200 grams paneer, cubed", [("200", "QUANTITY"), ("grams", "UNIT"), ("paneer", "FOOD_ITEM")]),
    ("1 pinch kosher salt", [("1", "QUANTITY"), ("pinch", "UNIT"), ("kosher salt", "FOOD_ITEM")]),
    ("1/2 teaspoon freshly cracked black pepper", [("1/2", "QUANTITY"), ("teaspoon", "UNIT"), ("black pepper", "FOOD_ITEM")]),
    ("3 large eggs, beaten", [("3", "QUANTITY"), ("large", "UNIT"), ("eggs", "FOOD_ITEM")]),
    ("250 ml heavy whipping cream", [("250", "QUANTITY"), ("ml", "UNIT"), ("heavy whipping cream", "FOOD_ITEM")]),
    ("1 bunch fresh coriander leaves, chopped", [("1", "QUANTITY"), ("bunch", "UNIT"), ("coriander leaves", "FOOD_ITEM")]),
    ("4 slices thick-cut bacon", [("4", "QUANTITY"), ("slices", "UNIT"), ("bacon", "FOOD_ITEM")]),
    ("1 tablespoon unsalted butter", [("1", "QUANTITY"), ("tablespoon", "UNIT"), ("unsalted butter", "FOOD_ITEM")]),
    ("2 sprigs fresh rosemary", [("2", "QUANTITY"), ("sprigs", "UNIT"), ("rosemary", "FOOD_ITEM")]),
    ("1 stalk celery, finely sliced", [("1", "QUANTITY"), ("stalk", "UNIT"), ("celery", "FOOD_ITEM")]),
    ("100 grams grated parmesan cheese", [("100", "QUANTITY"), ("grams", "UNIT"), ("parmesan cheese", "FOOD_ITEM")]),
    ("2 cups basmati rice, rinsed", [("2", "QUANTITY"), ("cups", "UNIT"), ("basmati rice", "FOOD_ITEM")]),
    ("1 lb lean ground beef", [("1", "QUANTITY"), ("lb", "UNIT"), ("ground beef", "FOOD_ITEM")]),
    ("1/3 cup soy sauce", [("1/3", "QUANTITY"), ("cup", "UNIT"), ("soy sauce", "FOOD_ITEM")]),
    ("2 teaspoons toasted sesame oil", [("2", "QUANTITY"), ("teaspoons", "UNIT"), ("toasted sesame oil", "FOOD_ITEM")]),
    ("1 tablespoon fresh ginger, grated", [("1", "QUANTITY"), ("tablespoon", "UNIT"), ("ginger", "FOOD_ITEM")]),
    ("150 grams button mushrooms, sliced", [("150", "QUANTITY"), ("grams", "UNIT"), ("button mushrooms", "FOOD_ITEM")]),
    ("1/2 cup whole milk", [("1/2", "QUANTITY"), ("cup", "UNIT"), ("whole milk", "FOOD_ITEM")]),
    ("2 cups all-purpose flour", [("2", "QUANTITY"), ("cups", "UNIT"), ("all-purpose flour", "FOOD_ITEM")]),
    ("1 packet active dry yeast", [("1", "QUANTITY"), ("packet", "UNIT"), ("active dry yeast", "FOOD_ITEM")]),
    ("3/4 cup granulated sugar", [("3/4", "QUANTITY"), ("cup", "UNIT"), ("granulated sugar", "FOOD_ITEM")]),
    ("1 teaspoon pure vanilla extract", [("1", "QUANTITY"), ("teaspoon", "UNIT"), ("vanilla extract", "FOOD_ITEM")]),
    ("2 ripe avocados, pitted and mashed", [("2", "QUANTITY"), ("ripe", "UNIT"), ("avocados", "FOOD_ITEM")]),
    ("1 tablespoon freshly squeezed lime juice", [("1", "QUANTITY"), ("tablespoon", "UNIT"), ("lime juice", "FOOD_ITEM")]),
    ("1/4 cup chopped red onion", [("1/4", "QUANTITY"), ("cup", "UNIT"), ("red onion", "FOOD_ITEM")]),
    ("1 medium jalapeno pepper, seeded", [("1", "QUANTITY"), ("medium", "UNIT"), ("jalapeno pepper", "FOOD_ITEM")]),
    ("400 grams cooked chickpeas", [("400", "QUANTITY"), ("grams", "UNIT"), ("chickpeas", "FOOD_ITEM")]),
    ("3 tablespoons tahini paste", [("3", "QUANTITY"), ("tablespoons", "UNIT"), ("tahini paste", "FOOD_ITEM")]),
    ("2 cloves garlic, crushed", [("2", "QUANTITY"), ("cloves", "UNIT"), ("garlic", "FOOD_ITEM")]),
    ("1/4 cup cold water", [("1/4", "QUANTITY"), ("cup", "UNIT"), ("water", "FOOD_ITEM")]),
    ("1 teaspoon ground coriander", [("1", "QUANTITY"), ("teaspoon", "UNIT"), ("ground coriander", "FOOD_ITEM")]),
    ("1/2 teaspoon ground turmeric", [("1/2", "QUANTITY"), ("teaspoon", "UNIT"), ("turmeric", "FOOD_ITEM")]),
    ("2 medium carrots, peeled and sliced", [("2", "QUANTITY"), ("medium", "UNIT"), ("carrots", "FOOD_ITEM")]),
    ("1 large red bell pepper, diced", [("1", "QUANTITY"), ("large", "UNIT"), ("red bell pepper", "FOOD_ITEM")]),
    ("1 cup frozen green peas", [("1", "QUANTITY"), ("cup", "UNIT"), ("green peas", "FOOD_ITEM")]),
    ("300 grams penne pasta", [("300", "QUANTITY"), ("grams", "UNIT"), ("penne pasta", "FOOD_ITEM")]),
    ("1 cup marinara sauce", [("1", "QUANTITY"), ("cup", "UNIT"), ("marinara sauce", "FOOD_ITEM")]),
    ("1/2 cup shredded mozzarella cheese", [("1/2", "QUANTITY"), ("cup", "UNIT"), ("mozzarella cheese", "FOOD_ITEM")]),
    ("2 tablespoons balsamic vinegar", [("2", "QUANTITY"), ("tablespoons", "UNIT"), ("balsamic vinegar", "FOOD_ITEM")]),
    ("1 tablespoon Dijon mustard", [("1", "QUANTITY"), ("tablespoon", "UNIT"), ("Dijon mustard", "FOOD_ITEM")]),
    ("1 tablespoon pure honey", [("1", "QUANTITY"), ("tablespoon", "UNIT"), ("honey", "FOOD_ITEM")]),
    ("4 boneless pork chops", [("4", "QUANTITY"), ("pork chops", "FOOD_ITEM")]),
    ("1/2 teaspoon smoked paprika", [("1/2", "QUANTITY"), ("teaspoon", "UNIT"), ("smoked paprika", "FOOD_ITEM")]),
    ("1/4 teaspoon garlic powder", [("1/4", "QUANTITY"), ("teaspoon", "UNIT"), ("garlic powder", "FOOD_ITEM")]),
    ("1/4 teaspoon onion powder", [("1/4", "QUANTITY"), ("teaspoon", "UNIT"), ("onion powder", "FOOD_ITEM")]),
    ("2 tablespoons vegetable oil", [("2", "QUANTITY"), ("tablespoons", "UNIT"), ("vegetable oil", "FOOD_ITEM")]),
    ("1 can black beans, drained", [("1", "QUANTITY"), ("can", "UNIT"), ("black beans", "FOOD_ITEM")]),
    ("1 cup sweet corn kernels", [("1", "QUANTITY"), ("cup", "UNIT"), ("sweet corn kernels", "FOOD_ITEM")]),
    ("8 small corn tortillas", [("8", "QUANTITY"), ("small", "UNIT"), ("corn tortillas", "FOOD_ITEM")]),
    ("50 grams crumbled cotija cheese", [("50", "QUANTITY"), ("grams", "UNIT"), ("cotija cheese", "FOOD_ITEM")]),
    ("2 tablespoons sour cream", [("2", "QUANTITY"), ("tablespoons", "UNIT"), ("sour cream", "FOOD_ITEM")]),
    ("1 pinch dried oregano", [("1", "QUANTITY"), ("pinch", "UNIT"), ("dried oregano", "FOOD_ITEM")]),
    ("1 cup red lentils, washed", [("1", "QUANTITY"), ("cup", "UNIT"), ("red lentils", "FOOD_ITEM")]),
    ("1 can coconut milk", [("1", "QUANTITY"), ("can", "UNIT"), ("coconut milk", "FOOD_ITEM")]),
    ("1 tablespoon red curry paste", [("1", "QUANTITY"), ("tablespoon", "UNIT"), ("red curry paste", "FOOD_ITEM")]),
    ("200 grams firm tofu, pressed", [("200", "QUANTITY"), ("grams", "UNIT"), ("firm tofu", "FOOD_ITEM")]),
    ("1 cup broccoli florets", [("1", "QUANTITY"), ("cup", "UNIT"), ("broccoli florets", "FOOD_ITEM")]),
    ("1 medium zucchini, sliced", [("1", "QUANTITY"), ("medium", "UNIT"), ("zucchini", "FOOD_ITEM")]),
    ("2 green onions, thinly sliced", [("2", "QUANTITY"), ("green onions", "FOOD_ITEM")]),
    ("1 teaspoon toasted sesame seeds", [("1", "QUANTITY"), ("teaspoon", "UNIT"), ("sesame seeds", "FOOD_ITEM")]),
    ("3 tablespoons maple syrup", [("3", "QUANTITY"), ("tablespoons", "UNIT"), ("maple syrup", "FOOD_ITEM")]),
    ("1 cup rolled oats", [("1", "QUANTITY"), ("cup", "UNIT"), ("rolled oats", "FOOD_ITEM")]),
    ("1/2 cup almond milk", [("1/2", "QUANTITY"), ("cup", "UNIT"), ("almond milk", "FOOD_ITEM")]),
    ("1 tablespoon chia seeds", [("1", "QUANTITY"), ("tablespoon", "UNIT"), ("chia seeds", "FOOD_ITEM")]),
    ("1/2 cup fresh blueberries", [("1/2", "QUANTITY"), ("cup", "UNIT"), ("blueberries", "FOOD_ITEM")]),
    ("1 ripe banana, mashed", [("1", "QUANTITY"), ("ripe", "UNIT"), ("banana", "FOOD_ITEM")]),
    ("2 tablespoons creamy peanut butter", [("2", "QUANTITY"), ("tablespoons", "UNIT"), ("peanut butter", "FOOD_ITEM")]),
    ("100 grams dark chocolate chips", [("100", "QUANTITY"), ("grams", "UNIT"), ("dark chocolate chips", "FOOD_ITEM")]),
    ("1/2 teaspoon baking soda", [("1/2", "QUANTITY"), ("teaspoon", "UNIT"), ("baking soda", "FOOD_ITEM")]),
    ("1 teaspoon baking powder", [("1", "QUANTITY"), ("teaspoon", "UNIT"), ("baking powder", "FOOD_ITEM")]),
    ("1/4 cup unsweetened cocoa powder", [("1/4", "QUANTITY"), ("cup", "UNIT"), ("cocoa powder", "FOOD_ITEM")]),
    ("1 bay leaf", [("1", "QUANTITY"), ("bay leaf", "FOOD_ITEM")]),

    # --- PART 2: 80 NATURAL PANTRY & CONVERSATIONAL SENTENCES ---
    ("I have 2 tomatoes, a handful of coriander and some paneer in my fridge.", [("2", "QUANTITY"), ("tomatoes", "FOOD_ITEM"), ("a handful", "QUANTITY"), ("coriander", "FOOD_ITEM"), ("some", "QUANTITY"), ("paneer", "FOOD_ITEM")]),
    ("Can I cook dinner with 3 eggs, half a cup of milk and cheddar cheese?", [("3", "QUANTITY"), ("eggs", "FOOD_ITEM"), ("half a cup", "QUANTITY"), ("of", "UNIT"), ("milk", "FOOD_ITEM"), ("cheddar cheese", "FOOD_ITEM")]),
    ("We bought 4 bell peppers, two onions and a pack of tofu today.", [("4", "QUANTITY"), ("bell peppers", "FOOD_ITEM"), ("two", "QUANTITY"), ("onions", "FOOD_ITEM"), ("a pack", "QUANTITY"), ("of", "UNIT"), ("tofu", "FOOD_ITEM")]),
    ("There are 5 cloves of garlic and a pinch of saffron in my cupboard.", [("5", "QUANTITY"), ("cloves", "UNIT"), ("garlic", "FOOD_ITEM"), ("a pinch", "QUANTITY"), ("saffron", "FOOD_ITEM")]),
    ("I only have some pasta, a can of crushed tomatoes and dried oregano left.", [("some", "QUANTITY"), ("pasta", "FOOD_ITEM"), ("a can", "QUANTITY"), ("crushed tomatoes", "FOOD_ITEM"), ("dried oregano", "FOOD_ITEM")]),
    ("Please add 2 tablespoons of butter and 1 cup of white rice into the pot.", [("2", "QUANTITY"), ("tablespoons", "UNIT"), ("butter", "FOOD_ITEM"), ("1", "QUANTITY"), ("cup", "UNIT"), ("white rice", "FOOD_ITEM")]),
    ("All I found was a piece of ginger and two green chilies on the counter.", [("a piece", "QUANTITY"), ("ginger", "FOOD_ITEM"), ("two", "QUANTITY"), ("green chilies", "FOOD_ITEM")]),
    ("Do you have 500 grams of boneless chicken and some plain yogurt?", [("500", "QUANTITY"), ("grams", "UNIT"), ("boneless chicken", "FOOD_ITEM"), ("some", "QUANTITY"), ("plain yogurt", "FOOD_ITEM")]),
    ("I need 3 ripe bananas and a scoop of protein powder for my smoothie.", [("3", "QUANTITY"), ("ripe bananas", "FOOD_ITEM"), ("a scoop", "QUANTITY"), ("protein powder", "FOOD_ITEM")]),
    ("We have two slices of sourdough bread and a block of mozzarella.", [("two", "QUANTITY"), ("slices", "UNIT"), ("sourdough bread", "FOOD_ITEM"), ("a block", "QUANTITY"), ("mozzarella", "FOOD_ITEM")]),
    ("Let's toss 1 cup of cherry tomatoes with fresh basil and olive oil.", [("1", "QUANTITY"), ("cup", "UNIT"), ("cherry tomatoes", "FOOD_ITEM"), ("fresh basil", "FOOD_ITEM"), ("olive oil", "FOOD_ITEM")]),
    ("I kept 200 grams of mushrooms and a bottle of soy sauce in the bag.", [("200", "QUANTITY"), ("grams", "UNIT"), ("mushrooms", "FOOD_ITEM"), ("a bottle", "QUANTITY"), ("soy sauce", "FOOD_ITEM")]),
    ("Is 1 teaspoon of chili powder enough for this curry dish?", [("1", "QUANTITY"), ("teaspoon", "UNIT"), ("chili powder", "FOOD_ITEM")]),
    ("Take 2 cups of rolled oats, some chia seeds and honey for breakfast.", [("2", "QUANTITY"), ("cups", "UNIT"), ("rolled oats", "FOOD_ITEM"), ("some", "QUANTITY"), ("chia seeds", "FOOD_ITEM"), ("honey", "FOOD_ITEM")]),
    ("I have 4 potatoes, one big red onion and a dash of turmeric.", [("4", "QUANTITY"), ("potatoes", "FOOD_ITEM"), ("one", "QUANTITY"), ("red onion", "FOOD_ITEM"), ("a dash", "QUANTITY"), ("turmeric", "FOOD_ITEM")]),
    ("Can I substitute 1 cup of coconut milk for heavy cream?", [("1", "QUANTITY"), ("cup", "UNIT"), ("coconut milk", "FOOD_ITEM"), ("heavy cream", "FOOD_ITEM")]),
    ("There is a jar of peanut butter and 2 apples in my pantry.", [("a jar", "QUANTITY"), ("peanut butter", "FOOD_ITEM"), ("2", "QUANTITY"), ("apples", "FOOD_ITEM")]),
    ("We have some fresh spinach, 3 cloves of garlic and feta cheese.", [("some", "QUANTITY"), ("fresh spinach", "FOOD_ITEM"), ("3", "QUANTITY"), ("cloves", "UNIT"), ("garlic", "FOOD_ITEM"), ("feta cheese", "FOOD_ITEM")]),
    ("Just mix 2 scoops of flour with a cup of warm water.", [("2", "QUANTITY"), ("scoops", "UNIT"), ("flour", "FOOD_ITEM"), ("a cup", "QUANTITY"), ("warm water", "FOOD_ITEM")]),
    ("I bought 1 kilogram of basmati rice and a bag of black lentils.", [("1", "QUANTITY"), ("kilogram", "UNIT"), ("basmati rice", "FOOD_ITEM"), ("a bag", "QUANTITY"), ("black lentils", "FOOD_ITEM")]),
    ("Add half a teaspoon of cinnamon and two cloves into the tea.", [("half a teaspoon", "QUANTITY"), ("cinnamon", "FOOD_ITEM"), ("two", "QUANTITY"), ("cloves", "FOOD_ITEM")]),
    ("I have some shrimp, a bottle of fish sauce and rice noodles.", [("some", "QUANTITY"), ("shrimp", "FOOD_ITEM"), ("a bottle", "QUANTITY"), ("fish sauce", "FOOD_ITEM"), ("rice noodles", "FOOD_ITEM")]),
    ("What recipe uses 4 carrots, 2 stalks of celery and vegetable broth?", [("4", "QUANTITY"), ("carrots", "FOOD_ITEM"), ("2", "QUANTITY"), ("stalks", "UNIT"), ("celery", "FOOD_ITEM"), ("vegetable broth", "FOOD_ITEM")]),
    ("There are 6 fresh strawberries and a tub of greek yogurt in the fridge.", [("6", "QUANTITY"), ("strawberries", "FOOD_ITEM"), ("a tub", "QUANTITY"), ("greek yogurt", "FOOD_ITEM")]),
    ("I will cook 300 grams of salmon with lemon juice and dill.", [("300", "QUANTITY"), ("grams", "UNIT"), ("salmon", "FOOD_ITEM"), ("lemon juice", "FOOD_ITEM"), ("dill", "FOOD_ITEM")]),
    ("We need 2 cups of breadcrumbs and 1 beaten egg for the coating.", [("2", "QUANTITY"), ("cups", "UNIT"), ("breadcrumbs", "FOOD_ITEM"), ("1", "QUANTITY"), ("egg", "FOOD_ITEM")]),
    ("I have two cans of tuna, mayonnaise and some sweet pickle relish.", [("two", "QUANTITY"), ("cans", "UNIT"), ("tuna", "FOOD_ITEM"), ("mayonnaise", "FOOD_ITEM"), ("some", "QUANTITY"), ("sweet pickle relish", "FOOD_ITEM")]),
    ("Just throw in a handful of walnuts and a cup of diced apples.", [("a handful", "QUANTITY"), ("walnuts", "FOOD_ITEM"), ("a cup", "QUANTITY"), ("diced apples", "FOOD_ITEM")]),
    ("Is there any parmesan cheese and heavy cream left for pasta?", [("parmesan cheese", "FOOD_ITEM"), ("heavy cream", "FOOD_ITEM"), ("pasta", "FOOD_ITEM")]),
    ("Use 3 tablespoons of maple syrup instead of white sugar.", [("3", "QUANTITY"), ("tablespoons", "UNIT"), ("maple syrup", "FOOD_ITEM"), ("white sugar", "FOOD_ITEM")]),
    ("I have 1 package of bacon and four large brown eggs.", [("1", "QUANTITY"), ("package", "UNIT"), ("bacon", "FOOD_ITEM"), ("four", "QUANTITY"), ("brown eggs", "FOOD_ITEM")]),
    ("Can we make soup with 2 sweet potatoes, ginger and coconut milk?", [("2", "QUANTITY"), ("sweet potatoes", "FOOD_ITEM"), ("ginger", "FOOD_ITEM"), ("coconut milk", "FOOD_ITEM")]),
    ("I have half a block of cheddar cheese and a box of macaroni.", [("half a block", "QUANTITY"), ("cheddar cheese", "FOOD_ITEM"), ("a box", "QUANTITY"), ("macaroni", "FOOD_ITEM")]),
    ("Sprinkle a pinch of red chili flakes and grated parmesan over pizza.", [("a pinch", "QUANTITY"), ("red chili flakes", "FOOD_ITEM"), ("parmesan", "FOOD_ITEM"), ("pizza", "FOOD_ITEM")]),
    ("There are 5 ripe tomatoes and some fresh mint in my vegetable basket.", [("5", "QUANTITY"), ("ripe tomatoes", "FOOD_ITEM"), ("some", "QUANTITY"), ("fresh mint", "FOOD_ITEM")]),
    ("Can I sauté 2 diced onions in olive oil until caramelized?", [("2", "QUANTITY"), ("diced onions", "FOOD_ITEM"), ("olive oil", "FOOD_ITEM")]),
    ("I found 1 avocado, half a lime and a bunch of cilantro in the tray.", [("1", "QUANTITY"), ("avocado", "FOOD_ITEM"), ("half a lime", "QUANTITY"), ("a bunch", "QUANTITY"), ("cilantro", "FOOD_ITEM")]),
    ("Blend 1 cup of frozen mango chunks with coconut water.", [("1", "QUANTITY"), ("cup", "UNIT"), ("frozen mango chunks", "FOOD_ITEM"), ("coconut water", "FOOD_ITEM")]),
    ("I bought 250 grams of paneer and two packets of naan bread.", [("250", "QUANTITY"), ("grams", "UNIT"), ("paneer", "FOOD_ITEM"), ("two", "QUANTITY"), ("packets", "UNIT"), ("naan bread", "FOOD_ITEM")]),
    ("Add 3 drops of vanilla extract and a cup of powdered sugar.", [("3", "QUANTITY"), ("drops", "UNIT"), ("vanilla extract", "FOOD_ITEM"), ("a cup", "QUANTITY"), ("powdered sugar", "FOOD_ITEM")]),
    ("We have 1 can of kidney beans and 2 cups of cooked rice.", [("1", "QUANTITY"), ("can", "UNIT"), ("kidney beans", "FOOD_ITEM"), ("2", "QUANTITY"), ("cups", "UNIT"), ("cooked rice", "FOOD_ITEM")]),
    ("Please grind 2 teaspoons of cumin seeds and black peppercorns.", [("2", "QUANTITY"), ("teaspoons", "UNIT"), ("cumin seeds", "FOOD_ITEM"), ("black peppercorns", "FOOD_ITEM")]),
    ("I have 400 grams of ground turkey and some taco seasoning.", [("400", "QUANTITY"), ("grams", "UNIT"), ("ground turkey", "FOOD_ITEM"), ("some", "QUANTITY"), ("taco seasoning", "FOOD_ITEM")]),
    ("Mix two tablespoons of cocoa powder with warm milk.", [("two", "QUANTITY"), ("tablespoons", "UNIT"), ("cocoa powder", "FOOD_ITEM"), ("warm milk", "FOOD_ITEM")]),
    ("There are 3 oranges and a bunch of green grapes in the bowl.", [("3", "QUANTITY"), ("oranges", "FOOD_ITEM"), ("a bunch", "QUANTITY"), ("green grapes", "FOOD_ITEM")]),
    ("I have 2 cups of jasmine rice, sesame oil and green onions.", [("2", "QUANTITY"), ("cups", "UNIT"), ("jasmine rice", "FOOD_ITEM"), ("sesame oil", "FOOD_ITEM"), ("green onions", "FOOD_ITEM")]),
    ("Can I cook dinner using 3 chicken thighs, soy sauce and garlic?", [("3", "QUANTITY"), ("chicken thighs", "FOOD_ITEM"), ("soy sauce", "FOOD_ITEM"), ("garlic", "FOOD_ITEM")]),
    ("I have half a cup of quinoa and a head of cauliflower.", [("half a cup", "QUANTITY"), ("quinoa", "FOOD_ITEM"), ("a head", "QUANTITY"), ("cauliflower", "FOOD_ITEM")]),
    ("Drizzle 1 tablespoon of sesame oil over the steamed dumplings.", [("1", "QUANTITY"), ("tablespoon", "UNIT"), ("sesame oil", "FOOD_ITEM"), ("steamed dumplings", "FOOD_ITEM")]),
    ("We have some kalamata olives, cucumber and red wine vinegar.", [("some", "QUANTITY"), ("kalamata olives", "FOOD_ITEM"), ("cucumber", "FOOD_ITEM"), ("red wine vinegar", "FOOD_ITEM")]),
    ("Add 2 teaspoons of baking powder to 3 cups of flour.", [("2", "QUANTITY"), ("teaspoons", "UNIT"), ("baking powder", "FOOD_ITEM"), ("3", "QUANTITY"), ("cups", "UNIT"), ("flour", "FOOD_ITEM")]),
    ("I have 1 carton of almond milk and half a cup of chia seeds.", [("1", "QUANTITY"), ("carton", "UNIT"), ("almond milk", "FOOD_ITEM"), ("half a cup", "QUANTITY"), ("chia seeds", "FOOD_ITEM")]),
    ("Cook 500 grams of spaghetti in salted boiling water.", [("500", "QUANTITY"), ("grams", "UNIT"), ("spaghetti", "FOOD_ITEM"), ("water", "FOOD_ITEM")]),
    ("There is a can of chickpeas and some lemon tahini sauce in my kitchen.", [("a can", "QUANTITY"), ("chickpeas", "FOOD_ITEM"), ("some", "QUANTITY"), ("lemon tahini sauce", "FOOD_ITEM")]),
    ("Can you pass me 2 tablespoons of soy sauce and some chili paste?", [("2", "QUANTITY"), ("tablespoons", "UNIT"), ("soy sauce", "FOOD_ITEM"), ("some", "QUANTITY"), ("chili paste", "FOOD_ITEM")]),
    ("I have 3 heads of baby bok choy and garlic for a stir fry.", [("3", "QUANTITY"), ("heads", "UNIT"), ("baby bok choy", "FOOD_ITEM"), ("garlic", "FOOD_ITEM")]),
    ("Take 2 slices of sharp cheddar cheese and two pieces of ham.", [("2", "QUANTITY"), ("slices", "UNIT"), ("sharp cheddar cheese", "FOOD_ITEM"), ("two", "QUANTITY"), ("pieces", "UNIT"), ("ham", "FOOD_ITEM")]),
    ("I have 1 cup of plain yogurt, a cucumber and garlic for tzatziki.", [("1", "QUANTITY"), ("cup", "UNIT"), ("plain yogurt", "FOOD_ITEM"), ("a cucumber", "FOOD_ITEM"), ("garlic", "FOOD_ITEM")]),
    ("There are two frozen pie crusts and 4 granny smith apples.", [("two", "QUANTITY"), ("pie crusts", "FOOD_ITEM"), ("4", "QUANTITY"), ("granny smith apples", "FOOD_ITEM")]),
    ("I bought 1 packet of yeast and 500 grams of bread flour.", [("1", "QUANTITY"), ("packet", "UNIT"), ("yeast", "FOOD_ITEM"), ("500", "QUANTITY"), ("grams", "UNIT"), ("bread flour", "FOOD_ITEM")]),
    ("Add a pinch of nutmeg and two tablespoons of brown sugar.", [("a pinch", "QUANTITY"), ("nutmeg", "FOOD_ITEM"), ("two", "QUANTITY"), ("tablespoons", "UNIT"), ("brown sugar", "FOOD_ITEM")]),
    ("We have 3 zucchini, olive oil and garlic in our pantry.", [("3", "QUANTITY"), ("zucchini", "FOOD_ITEM"), ("olive oil", "FOOD_ITEM"), ("garlic", "FOOD_ITEM")]),
    ("I only have half an onion, two eggs and black pepper.", [("half an onion", "FOOD_ITEM"), ("two", "QUANTITY"), ("eggs", "FOOD_ITEM"), ("black pepper", "FOOD_ITEM")]),
    ("Can you chop 4 ripe plum tomatoes and a handful of parsley?", [("4", "QUANTITY"), ("plum tomatoes", "FOOD_ITEM"), ("a handful", "QUANTITY"), ("parsley", "FOOD_ITEM")]),
    ("I have 2 tablespoons of ghee and 1 cup of semolina for halwa.", [("2", "QUANTITY"), ("tablespoons", "UNIT"), ("ghee", "FOOD_ITEM"), ("1", "QUANTITY"), ("cup", "UNIT"), ("semolina", "FOOD_ITEM")]),
    ("Put 1 cup of frozen corn and 1 diced carrot into the pot.", [("1", "QUANTITY"), ("cup", "UNIT"), ("frozen corn", "FOOD_ITEM"), ("1", "QUANTITY"), ("diced carrot", "FOOD_ITEM")]),
    ("There is half a cup of salsa and a bag of tortilla chips.", [("half a cup", "QUANTITY"), ("salsa", "FOOD_ITEM"), ("a bag", "QUANTITY"), ("tortilla chips", "FOOD_ITEM")]),
    ("I bought 200 grams of green beans and some butter for dinner.", [("200", "QUANTITY"), ("grams", "UNIT"), ("green beans", "FOOD_ITEM"), ("some", "QUANTITY"), ("butter", "FOOD_ITEM")]),
    ("Can I substitute two tablespoons of lime juice for vinegar?", [("two", "QUANTITY"), ("tablespoons", "UNIT"), ("lime juice", "FOOD_ITEM"), ("vinegar", "FOOD_ITEM")]),
    ("I have 4 cloves of garlic, 1 lemon and some rosemary.", [("4", "QUANTITY"), ("cloves", "UNIT"), ("garlic", "FOOD_ITEM"), ("1", "QUANTITY"), ("lemon", "FOOD_ITEM"), ("some", "QUANTITY"), ("rosemary", "FOOD_ITEM")]),
    ("Mix 1 cup of warm water with a teaspoon of dry active yeast.", [("1", "QUANTITY"), ("cup", "UNIT"), ("warm water", "FOOD_ITEM"), ("a teaspoon", "QUANTITY"), ("dry active yeast", "FOOD_ITEM")]),
    ("I have some ground cumin, 2 cans of black beans and sour cream.", [("some", "QUANTITY"), ("ground cumin", "FOOD_ITEM"), ("2", "QUANTITY"), ("cans", "UNIT"), ("black beans", "FOOD_ITEM"), ("sour cream", "FOOD_ITEM")]),
    ("Add 3 tablespoons of olive oil into a heated cast iron skillet.", [("3", "QUANTITY"), ("tablespoons", "UNIT"), ("olive oil", "FOOD_ITEM")]),
    ("There are 2 ripe avocados and a small bunch of fresh cilantro.", [("2", "QUANTITY"), ("ripe avocados", "FOOD_ITEM"), ("a small bunch", "QUANTITY"), ("fresh cilantro", "FOOD_ITEM")]),
    ("We have some smoked paprika, garlic powder and chicken wings.", [("some", "QUANTITY"), ("smoked paprika", "FOOD_ITEM"), ("garlic powder", "FOOD_ITEM"), ("chicken wings", "FOOD_ITEM")]),
    ("I have 1 cup of basmati rice and a handful of roasted cashews.", [("1", "QUANTITY"), ("cup", "UNIT"), ("basmati rice", "FOOD_ITEM"), ("a handful", "QUANTITY"), ("roasted cashews", "FOOD_ITEM")]),
    ("Can I cook paneer with 3 onions, ginger and tomato puree?", [("paneer", "FOOD_ITEM"), ("3", "QUANTITY"), ("onions", "FOOD_ITEM"), ("ginger", "FOOD_ITEM"), ("tomato puree", "FOOD_ITEM")]),
    ("I have 500 grams of mutton and two tablespoons of ginger paste.", [("500", "QUANTITY"), ("grams", "UNIT"), ("mutton", "FOOD_ITEM"), ("two", "QUANTITY"), ("tablespoons", "UNIT"), ("ginger paste", "FOOD_ITEM")]),
    ("There are 2 cups of heavy cream and 100 grams of powdered sugar.", [("2", "QUANTITY"), ("cups", "UNIT"), ("heavy cream", "FOOD_ITEM"), ("100", "QUANTITY"), ("grams", "UNIT"), ("powdered sugar", "FOOD_ITEM")]),
    ("I will combine 1 cup of milk with two tablespoons of honey.", [("1", "QUANTITY"), ("cup", "UNIT"), ("milk", "FOOD_ITEM"), ("two", "QUANTITY"), ("tablespoons", "UNIT"), ("honey", "FOOD_ITEM")])
]

print(f"Total sentences to annotate: {len(DATA_SPEC)}")
written = 0

with open(GOLD_PATH, "w", encoding="utf-8") as f:
    for sentence, target_entities in DATA_SPEC:
        spans = []
        occupied_indices = set()
        
        for text_token, label in target_entities:
            # find exact non-overlapping occurrences
            start_search = 0
            found = False
            while start_search < len(sentence):
                idx = sentence.find(text_token, start_search)
                if idx == -1:
                    break
                end = idx + len(text_token)
                # check overlap
                token_range = set(range(idx, end))
                if not token_range.intersection(occupied_indices):
                    spans.append({
                        "start": idx,
                        "end": end,
                        "label": label,
                        "text": text_token
                    })
                    occupied_indices.update(token_range)
                    found = True
                    break
                start_search = idx + 1
                
            if not found:
                print(f"WARNING: '{text_token}' not matched in '{sentence}'")
                
        # Sort spans by start offset
        spans.sort(key=lambda s: s["start"])
        
        record = {
            "id": written + 1,
            "type": "ingredient_line" if written < 80 else "pantry_sentence",
            "text": sentence,
            "entities": [(s["start"], s["end"], s["label"]) for s in spans],
            "spans": spans,
            "status": "pending manual review"
        }
        f.write(json.dumps(record, ensure_ascii=False) + "\n")
        written += 1

print(f"Successfully wrote {written} gold test sentences to {GOLD_PATH} marked 'pending manual review'.")
