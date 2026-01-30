
import { GoogleGenAI, Type } from "@google/genai";
import { RecipeResponse } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateLeftoverRecipes = async (leftovers: string[]): Promise<RecipeResponse> => {
  const prompt = `I have the following leftover food items: ${leftovers.join(", ")}. 
  Please suggest 3 authentic and creative Indian recipes that primarily use these leftovers. 
  You can assume standard Indian pantry staples (spices, oil, salt, onions, ginger, garlic, flour, rice, lentils) are available.
  Provide detailed instructions, preparation time, and tags for each recipe.
  ONLY provide Indian recipes.`;

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

  try {
    const data = JSON.parse(response.text.trim());
    return data as RecipeResponse;
  } catch (error) {
    console.error("Failed to parse Gemini response:", error);
    throw new Error("The chef had trouble with the recipe. Please try again.");
  }
};

export const generateRecipeImage = async (recipeName: string, description: string): Promise<string> => {
  const prompt = `A high-quality, professional food photography shot of an authentic Indian dish called "${recipeName}". ${description}. The dish should be beautifully plated on traditional Indian tableware, warm lighting, appetizing textures.`;
  
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

  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
  }
  
  throw new Error("Failed to generate image");
};
