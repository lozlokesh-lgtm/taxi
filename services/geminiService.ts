import { GoogleGenAI, Type } from "@google/genai";
import { TripEstimate } from '../types';

const apiKey = process.env.API_KEY || '';

// Initialize client only when needed to avoid errors if key is missing during initial load
const getAiClient = () => {
  if (!apiKey) {
    console.warn("API Key is missing. AI features will be disabled.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const getTripEstimation = async (pickup: string, dropoff: string): Promise<TripEstimate | null> => {
  const ai = getAiClient();
  if (!ai) return null;

  try {
    const prompt = `Estimate the taxi ride details from "${pickup}" to "${dropoff}". 
    Assume a standard city traffic scenario. 
    Provide a realistic price range in USD, distance in km, and duration in minutes.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            priceRange: { type: Type.STRING, description: "Estimated price range e.g., $15-$20" },
            duration: { type: Type.STRING, description: "Estimated duration e.g., 15 mins" },
            distance: { type: Type.STRING, description: "Estimated distance e.g., 5.2 km" }
          },
          required: ["priceRange", "duration", "distance"]
        }
      }
    });

    const jsonText = response.text;
    if (!jsonText) return null;
    
    return JSON.parse(jsonText) as TripEstimate;

  } catch (error) {
    console.error("Error getting trip estimation:", error);
    return null;
  }
};

export const getSmartReplies = async (role: string, lastMessage: string, tripStatus: string): Promise<string[]> => {
  const ai = getAiClient();
  if (!ai) return [];

  try {
    const prompt = `You are an AI assistant for a taxi app. 
    The user is a ${role}. 
    The current trip status is ${tripStatus}.
    The last message received was: "${lastMessage}".
    
    Generate 3 short, professional, and relevant quick-reply options (max 5 words each) for the ${role} to send back.
    Return ONLY a JSON array of strings.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });

    const jsonText = response.text;
    if (!jsonText) return [];
    
    return JSON.parse(jsonText) as string[];
  } catch (error) {
    console.error("Error getting smart replies:", error);
    return [];
  }
};