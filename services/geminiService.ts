import { GoogleGenAI, Type } from "@google/genai";
import { RecipeResponse } from "../types";

export const generateLeftoverRecipes = async (leftovers: string[]): Promise<RecipeResponse> => {
  // Always initialize with the latest available key from process.env
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });

  const prompt = `I have the following leftover food items: ${leftovers.join(", ")}. 
  Please suggest 3 authentic and creative Indian recipes that primarily use these leftovers. 
  You can assume standard Indian pantry staples (spices, oil, salt, onions, ginger, garlic, flour, rice, lentils) are available.
  Provide detailed instructions, preparation time, and tags for each recipe.
  ONLY provide Indian recipes.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: "You are a world-class Indian Chef and 'Zero Waste' cooking expert. Your specialty is creating delicious, traditional, and modern Indian dishes using leftovers while maintaining authentic flavors.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            recipes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  recipeName: { type: Type.STRING },
                  description: { type: Type.STRING },
                  prepTime: { type: Type.STRING },
                  cookTime: { type: Type.STRING },
                  difficulty: { 
                    type: Type.STRING,
                    enum: ['Easy', 'Medium', 'Hard']
                  },
                  ingredients: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        item: { type: Type.STRING },
                        amount: { type: Type.STRING }
                      },
                      required: ["item", "amount"]
                    }
                  },
                  steps: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  },
                  servings: { type: Type.NUMBER },
                  tags: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  }
                },
                required: ["id", "recipeName", "description", "prepTime", "cookTime", "difficulty", "ingredients", "steps", "servings", "tags"]
              }
            }
          },
          required: ["recipes"]
        }
      },
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error("Empty response from AI Chef.");
    }

    return JSON.parse(responseText.trim()) as RecipeResponse;
  } catch (error) {
    console.error("Recipe generation failed:", error);
    throw new Error("The Rasoi Revive chef is busy. Please try again in a moment.");
  }
};

export const generateRecipeImage = async (recipeName: string, description: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });

  // Safety-optimized, highly descriptive food photography prompt
  const prompt = `Gourmet food photography of the Indian dish "${recipeName}". ${description}. Beautifully plated on a rustic Indian plate, natural soft window lighting, cinematic depth of field, vibrant colors, 4k resolution.`;
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: prompt }],
      },
      config: {
        imageConfig: {
          aspectRatio: "4:3"
        }
      }
    });

    if (!response.candidates || response.candidates.length === 0) {
      throw new Error("No candidates returned from image model.");
    }

    const candidate = response.candidates[0];
    
    // Check for safety blocks which are common in production environments
    if (candidate.finishReason === 'SAFETY') {
      console.warn(`Safety block triggered for recipe: ${recipeName}`);
      throw new Error("Safety filters blocked the image.");
    }

    if (candidate.content && candidate.content.parts) {
      for (const part of candidate.content.parts) {
        if (part.inlineData && part.inlineData.data) {
          const mimeType = part.inlineData.mimeType || 'image/png';
          return `data:${mimeType};base64,${part.inlineData.data}`;
        }
      }
    }
    
    throw new Error("No image data found in candidate parts.");
  } catch (err) {
    console.error(`Image generation error for ${recipeName}:`, err);
    throw err;
  }
};