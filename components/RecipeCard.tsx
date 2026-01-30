import React, { useState } from 'react';
import { Recipe } from '../types';

interface RecipeCardProps {
  recipe: Recipe;
}

const RecipeCard: React.FC<RecipeCardProps> = ({ recipe }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-white rounded-[2rem] shadow-xl overflow-hidden border border-orange-50 transition-all duration-300 hover:shadow-2xl flex flex-col group">
      {/* Header Accent Bar */}
      <div className="h-3 saffron-gradient w-full"></div>
      
      <div className="p-8 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-4">
          <div className="bg-orange-500 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">
            {recipe.difficulty}
          </div>
          <div className="flex items-center gap-3 text-orange-400 text-xs font-bold">
            <span className="flex items-center gap-1"><i className="fa-solid fa-clock"></i> {recipe.cookTime}</span>
            <span className="flex items-center gap-1"><i className="fa-solid fa-users"></i> {recipe.servings}</span>
          </div>
        </div>

        <h3 className="text-2xl font-black text-gray-800 leading-tight mb-2 group-hover:text-orange-600 transition-colors">
          {recipe.recipeName}
        </h3>
        
        <p className="text-gray-500 text-sm mb-6 leading-relaxed flex-1 italic border-l-4 border-orange-100 pl-4 py-1">
          "{recipe.description}"
        </p>

        <div className="flex flex-wrap gap-1.5 mb-6">
          {recipe.tags.slice(0, 3).map((tag, idx) => (
            <span key={idx} className="bg-orange-50 text-orange-600 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-tighter">
              #{tag}
            </span>
          ))}
        </div>

        {!isExpanded ? (
          <button 
            onClick={() => setIsExpanded(true)}
            className="w-full py-4 bg-gray-50 hover:bg-orange-500 hover:text-white text-orange-600 font-bold rounded-2xl transition-all flex items-center justify-center gap-2 group/btn active:scale-95"
          >
            Start Cooking <i className="fa-solid fa-arrow-right-long group-hover/btn:translate-x-1 transition-transform"></i>
          </button>
        ) : (
          <div className="space-y-8 animate-fadeIn pt-2">
            <div className="bg-orange-50/50 rounded-2xl p-5 border border-orange-100/50">
              <h4 className="font-black text-orange-800 text-sm mb-4 flex items-center gap-2 uppercase tracking-widest">
                <i className="fa-solid fa-basket-shopping text-orange-500"></i> Ingredients
              </h4>
              <ul className="space-y-3">
                {recipe.ingredients.map((ing, idx) => (
                  <li key={idx} className="flex justify-between text-sm text-gray-700 items-center">
                    <span className="font-medium">{ing.item}</span>
                    <span className="bg-white px-3 py-1 rounded-lg text-xs font-bold text-orange-600 shadow-sm border border-orange-100/50">
                      {ing.amount}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="px-1">
              <h4 className="font-black text-gray-800 text-sm mb-5 flex items-center gap-2 uppercase tracking-widest">
                <i className="fa-solid fa-fire-burner text-orange-500"></i> Instructions
              </h4>
              <ol className="space-y-6">
                {recipe.steps.map((step, idx) => (
                  <li key={idx} className="flex gap-4 group/step">
                    <span className="flex-shrink-0 w-8 h-8 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center font-black text-sm group-hover/step:bg-orange-500 group-hover/step:text-white transition-all">
                      {idx + 1}
                    </span>
                    <p className="text-sm text-gray-600 leading-relaxed pt-1.5 font-medium">{step}</p>
                  </li>
                ))}
              </ol>
            </div>

            <button 
              onClick={() => setIsExpanded(false)}
              className="w-full py-4 border-2 border-dashed border-gray-200 text-gray-400 font-bold rounded-2xl hover:border-orange-200 hover:text-orange-500 transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              Close Details <i className="fa-solid fa-chevron-up text-xs"></i>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecipeCard;