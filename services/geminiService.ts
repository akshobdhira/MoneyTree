
import { GoogleGenAI, Type } from "@google/genai";
import { Category, Transaction, AIInsight } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function categorizeExpense(amount: number, userNote?: string): Promise<{ category: Category; subCategory: string; question: string }> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Categorize ₹${amount} for a student. Note: "${userNote || 'None'}". 
    Rules: FOOD (meals/snacks), SHOPPING (clothes/tech), TRANSPORT (auto/metro), HABITS (vape/smoke/drinks), ENTERTAINMENT (movies/games).
    Return JSON: category, subCategory, and a witty English buddy-style follow-up (No shaming).`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          category: { type: Type.STRING, enum: Object.values(Category).filter(c => c !== Category.INCOME) },
          subCategory: { type: Type.STRING },
          question: { type: Type.STRING }
        },
        required: ["category", "subCategory", "question"]
      }
    }
  });

  return JSON.parse(response.text);
}

export async function processBillImage(base64Image: string): Promise<{ amount: number; category: Category; subCategory: string; items: string[] }> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      { inlineData: { mimeType: "image/jpeg", data: base64Image } },
      { text: `Extract amount, items, and student category. Categories: ${Object.values(Category).join(", ")}.` }
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          amount: { type: Type.NUMBER },
          items: { type: Type.ARRAY, items: { type: Type.STRING } },
          category: { type: Type.STRING, enum: Object.values(Category).filter(c => c !== Category.INCOME) },
          subCategory: { type: Type.STRING }
        },
        required: ["amount", "category", "subCategory"]
      }
    }
  });

  return JSON.parse(response.text);
}

export async function generateInsights(transactions: Transaction[], balance: number): Promise<AIInsight[]> {
  const recentData = transactions.slice(-20).map(t => ({
    a: t.amount,
    c: t.category,
    s: t.subCategory,
    f: t.isForFriends
  }));

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Analyze: ${JSON.stringify(recentData)}. Bal: ₹${balance}. 
    Provide 3 witty, supportive student-life insights in English.
    Focus on social balance and budget pacing. No shaming.
    Return JSON array of {title, message, type: warning|info|success}.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            message: { type: Type.STRING },
            type: { type: Type.STRING, enum: ["warning", "info", "success"] }
          },
          required: ["title", "message", "type"]
        }
      }
    }
  });

  return JSON.parse(response.text);
}
