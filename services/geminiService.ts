import { GoogleGenAI, Type } from "@google/genai";
import { RecipeResponse } from "../types";

export const generateLeftoverRecipes = async (leftovers: string[]): Promise<RecipeResponse> => {
  // Always initialize with the latest available key from process.env
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

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