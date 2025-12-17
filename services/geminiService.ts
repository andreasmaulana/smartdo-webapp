import { GoogleGenAI, Type } from "@google/genai";

// Initialize Gemini Client
// In a real production app, ensure API_KEY is set in your environment
// The guidelines specify initializing directly with process.env.API_KEY
const getGenAIClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("Gemini API Key is missing. AI features will use mock data.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

const aiClient = getGenAIClient();

export const breakdownTask = async (taskDescription: string): Promise<string[]> => {
  if (!aiClient) {
    console.warn("No API Key found. Returning mock data.");
    return [
      `Plan details for: ${taskDescription}`,
      `Execute: ${taskDescription}`,
      `Review: ${taskDescription}`
    ];
  }

  try {
    const model = 'gemini-2.5-flash';

    const response = await aiClient.models.generateContent({
      model,
      contents: `Break down this task into 3-5 smaller, actionable subtasks: "${taskDescription}". Keep them concise.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.STRING
          }
        }
      }
    });

    const text = response.text;
    if (!text) return [];

    const subtasks = JSON.parse(text) as string[];
    return subtasks;
  } catch (error) {
    console.error("Error breaking down task with Gemini:", error);
    return [];
  }
};