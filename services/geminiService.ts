
import { GoogleGenAI, Type } from "@google/genai";
import { Category, Transaction, AIInsight } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function categorizeExpense(amount: number, userNote?: string): Promise<{ category: Category; subCategory: string; question: string }> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Categorize this expense for an Indian college student. 
    Amount: ₹${amount}
    User Input: "${userNote || 'None'}"

    STRICT CATEGORIZATION RULES:
    1. FOOD: Use for ANY meals, snacks, chai, coffee, Zomato/Swiggy, or mess bills.
    2. SHOPPING: Use for ANY apparel, footwear, electronics, or personal care.
    3. TRANSPORT: Use for auto, rickshaw, metro, bus, cab, petrol.
    4. HABITS: Use for cigarettes, alcohol, pan masala, or similar regular indulgences.
    5. ENTERTAINMENT: Use for movies, gaming, concert tickets, or outings.
    6. MISCELLANEOUS: ONLY use if the input is completely nonsensical.

    Available Categories: ${Object.values(Category).filter(c => c !== Category.INCOME).join(", ")}.

    INSTRUCTIONS FOR THE "INTELLIGENCE CHECK" QUESTION:
    - Language: Strictly English only.
    - Tone: Witty, lighthearted, and supportive "college buddy" vibe.
    - Style: Use clever wordplay or relatable student life references.
    - Safety: ABSOLUTELY NO shaming, judgmental, or offensive language. Do not make the user feel bad about their spending.
    - Examples: 
      - Food: "Brain fuel for the next lecture?" 
      - Shopping: "New drip for the campus walk?"
      - Transport: "Mission: Get to class on time?"
      - Entertainment: "Core memory in the making?"

    Return a JSON object with:
    - category: The selected category.
    - subCategory: A specific name (e.g., "Starbucks Coffee", "Metro Recharge").
    - question: The witty, friendly English follow-up.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          category: { type: Type.STRING, enum: Object.values(Category).filter(c => c !== Category.INCOME) },
          subCategory: { type: Type.STRING },
          question: { type: Type.STRING, description: "A witty, supportive English follow-up question" }
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
      {
        inlineData: {
          mimeType: "image/jpeg",
          data: base64Image
        }
      },
      {
        text: `Extract the total amount and items from this bill. 
        Categorize for an Indian student budget.
        Ensure the extracted data is accurate and the tone of any descriptive text is supportive.
        
        Categories: ${Object.values(Category).filter(c => c !== Category.INCOME).join(", ")}.`
      }
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
  const recentData = transactions.slice(-30).map(t => ({
    amount: t.amount,
    cat: t.category,
    sub: t.subCategory,
    type: t.type,
    isFriends: t.isForFriends,
    date: new Date(t.timestamp).toLocaleDateString()
  }));

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Analyze these Indian student expenses: ${JSON.stringify(recentData)}. Current balance: ₹${balance}. 
    
    TONE AND EMOTIONAL INTELLIGENCE RULES:
    1. Language: Strictly English.
    2. SOCIAL SPENDING: NEVER tell the user to stop spending time with friends. Frame it as "Social Investment" or "Shared Moments".
    3. Humor: Friendly, brotherly, and supportive. Use lighthearted "college life" analogies.
    4. Safety: No judgment, no shaming. Focus on helping the user navigate their month successfully.
    
    FOCUS AREAS:
    - Social Balance: Is the 'Shared Moment' spending sustainable?
    - Burn Rate: Is the allowance pacing well?
    - Wins: Praise them for good balance.
    
    Generate 3 supportive insights in English.`,
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
