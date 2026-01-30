import React, { useState, useRef } from 'react';
import { generateLeftoverRecipes, generateRecipeImage } from './services/geminiService';
import { Recipe } from './types';
import RecipeCard from './components/RecipeCard';

const App: React.FC = () => {
  const [inputValue, setInputValue] = useState('');
  const [leftovers, setLeftovers] = useState<string[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const handleAddLeftover = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      setLeftovers([...leftovers, inputValue.trim()]);
      setInputValue('');
    }
  };

  const removeLeftover = (index: number) => {
    setLeftovers(leftovers.filter((_, i) => i !== index));
  };

  const clearAll = () => {
    setLeftovers([]);
    setRecipes([]);
    setError(null);
  };

  const handleGenerate = async () => {
    if (leftovers.length === 0) {
      setError("Add at least one item first!");
      return;
    }

    setIsLoading(true);
    setError(null);
    setRecipes([]); // Clear old recipes
    
    try {
      const result = await generateLeftoverRecipes(leftovers);
      setRecipes(result.recipes);
      
      // Smooth scroll to results immediately after recipes appear
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 150);

      // Trigger relevant image generation sequentially to avoid rate limits
      for (const recipe of result.recipes) {
        try {
          const imageUrl = await generateRecipeImage(recipe.recipeName, recipe.description);
          setRecipes(prev => prev.map(r => r.id === recipe.id ? { ...r, imageUrl } : r));
        } catch (imgErr) {
          console.error(`Failed to generate image for ${recipe.recipeName}:`, imgErr);
        }
      }

    } catch (err: any) {
      setError(err.message || "The chef is busy. Try again!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fffaf0] selection:bg-orange-200">
      {/* Hero Header */}
      <header className="saffron-gradient text-white pt-10 pb-20 px-6 text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="inline-block bg-white/20 backdrop-blur-md px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-4 animate-bounce">
            🇮🇳 Authentic Flavors
          </div>
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold mb-3 drop-shadow-lg tracking-tight">
            Rasoi Revive
          </h1>
          <p className="text-base sm:text-xl opacity-90 max-w-md mx-auto font-medium leading-snug">
            Transform your fridge leftovers into gourmet Indian meals.
          </p>
        </div>
        
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-10 -right-10 w-60 h-60 bg-orange-300/20 rounded-full blur-3xl"></div>

        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0]">
          <svg className="relative block w-full h-[40px] md:h-[60px]" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C57.86,76.5,135.08,94.3,204.42,95.28A311.64,311.64,0,0,0,321.39,56.44Z" fill="#fffaf0"></path>
          </svg>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 -mt-10 relative z-20">
        <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-10 border border-orange-50/50">
          <div className="flex flex-col gap-8">
            <div className="space-y-4 text-center sm:text-left">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center justify-center sm:justify-start gap-3">
                <span className="bg-orange-500 text-white w-8 h-8 rounded-lg flex items-center justify-center text-sm italic">R</span>
                What's in your Rasoi?
              </h2>
              <p className="text-gray-500 text-sm sm:text-base leading-relaxed">
                Add your leftover items below. We'll find the perfect spices to bring them back to life.
              </p>
              
              <form onSubmit={handleAddLeftover} className="flex flex-col sm:flex-row gap-3">
                <input 
                  type="text" 
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="e.g. Leftover Dal, Chapati, Rice..."
                  className="flex-1 px-5 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-orange-400 focus:bg-white focus:outline-none transition-all text-lg shadow-inner text-gray-800 placeholder:text-gray-400"
                />
                <button 
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  <i className="fa-solid fa-plus"></i> Add
                </button>
              </form>

              <div className="space-y-3">
                <div className="flex justify-between items-center px-1">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-tighter">Your Ingredients</span>
                  {leftovers.length > 0 && (
                    <button onClick={clearAll} className="text-xs font-bold text-orange-500 hover:text-orange-700 transition-colors">
                      Clear All
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 min-h-[50px] p-1">
                  {leftovers.map((item, index) => (
                    <span 
                      key={index} 
                      className="flex items-center gap-3 bg-white border border-orange-100 text-gray-700 pl-4 pr-2 py-2.5 rounded-xl text-sm font-semibold shadow-sm animate-fadeIn"
                    >
                      {item}
                      <button 
                        onClick={() => removeLeftover(index)} 
                        className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-500 transition-all"
                        aria-label="Remove"
                      >
                        <i className="fa-solid fa-xmark"></i>
                      </button>
                    </span>
                  ))}
                  {leftovers.length === 0 && (
                    <div className="flex flex-col items-center justify-center w-full py-4 border-2 border-dashed border-gray-100 rounded-2xl opacity-50">
                      <i className="fa-solid fa-mortar-pestle text-gray-300 text-2xl mb-1"></i>
                      <span className="text-gray-400 text-xs font-medium">No ingredients added yet</span>
                    </div>
                  )}
                </div>
              </div>

              <button 
                onClick={handleGenerate}
                disabled={isLoading || leftovers.length === 0}
                className={`w-full py-5 rounded-2xl font-black text-xl transition-all shadow-xl flex items-center justify-center gap-3 ${
                  isLoading || leftovers.length === 0 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed scale-100 shadow-none' 
                  : 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white active:scale-95'
                }`}
              >
                {isLoading ? (
                  <>
                    <i className="fa-solid fa-circle-notch fa-spin"></i> 
                    <span>Warming up the Tawa...</span>
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-wand-magic-sparkles"></i>
                    <span>Magic Recipes</span>
                  </>
                )}
              </button>

              {error && (
                <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-bold border border-red-100 text-center animate-shake">
                  <i className="fa-solid fa-circle-exclamation mr-2"></i> {error}
                </div>
              )}
            </div>
          </div>
        </div>

        <div ref={resultsRef} className="mt-12 sm:mt-16 pb-12">
          {recipes.length > 0 && (
            <div className="space-y-8 animate-fadeIn">
              <div className="text-center px-4">
                <h2 className="text-3xl sm:text-4xl font-black text-gray-800 mb-2">Chef's Special Selection</h2>
                <p className="text-gray-500 text-sm">3 custom Indian recipes curated for your leftovers</p>
                <div className="w-16 h-1.5 bg-orange-500 mx-auto rounded-full mt-4"></div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {recipes.map((recipe) => (
                  <RecipeCard key={recipe.id} recipe={recipe} />
                ))}
              </div>
            </div>
          )}

          {isLoading && !recipes.length && (
            <div className="text-center py-20 px-6">
              <div className="relative inline-block mb-6">
                <i className="fa-solid fa-kitchen-set text-7xl text-orange-100"></i>
                <div className="absolute inset-0 flex items-center justify-center">
                  <i className="fa-solid fa-utensils text-2xl text-orange-400 animate-bounce"></i>
                </div>
              </div>
              <p className="text-xl text-gray-600 font-bold">Creating Indian Magic...</p>
              <p className="text-gray-400 text-sm mt-2">Our AI Chef is grinding fresh spices just for you.</p>
            </div>
          )}
        </div>
      </main>

      <footer className="mt-auto py-5 text-center px-6">
        <div className="flex justify-center gap-4 mb-4 text-orange-200 text-xl">
          <i className="fa-solid fa-pepper-hot"></i>
          <i className="fa-solid fa-bowl-food"></i>
          <i className="fa-solid fa-leaf"></i>
        </div>
        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">
          Made for the modern Indian Kitchen
        </p>
        <p className="text-gray-300 text-[10px]">&copy; 2024 Rasoi Revive • Sustainable Tasty Living</p>
      </footer>
    </div>
  );
};

export default App;