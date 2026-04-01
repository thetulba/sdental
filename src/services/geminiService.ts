import { GoogleGenAI } from "@google/genai";

const MODEL_NAME = "gemini-3-flash-preview";

export const getDentalAssistantChat = (systemInstruction: string) => {
  let apiKey: string | undefined;
  
  try {
    apiKey = process.env.GEMINI_API_KEY;
  } catch (e) {
    console.warn("Could not access process.env.GEMINI_API_KEY directly.");
  }

  if (!apiKey) {
    console.warn("GEMINI_API_KEY is not defined in the environment.");
    return null;
  }
  
  try {
    const ai = new GoogleGenAI({ apiKey });
    return ai.chats.create({
      model: MODEL_NAME,
      config: {
        systemInstruction,
      },
    });
  } catch (error) {
    console.error("Failed to initialize Gemini Chat:", error);
    return null;
  }
};

export const getDentalAssistantInstruction = (clinicName: string, services: string[]) => `
You are an AI Dental Assistant for ${clinicName}. 
Your goal is to guide patients, answer their questions about dental procedures, clinic services, and help them navigate the website.

Clinic Services:
${services.map(s => `- ${s}`).join('\n')}

Guidelines:
1. Be professional, empathetic, and helpful.
2. If a patient asks about a specific dental problem, provide general information but always recommend booking a consultation for a professional diagnosis.
3. Help patients understand how to use the website (e.g., "You can book an appointment by clicking the 'Book Now' button in the navigation bar").
4. If you don't know the answer, suggest they contact the clinic directly via phone or WhatsApp.
5. Keep responses concise and easy to read.
6. You can speak multiple languages (English, Arabic, Malay, Indonesian, Thai) based on the user's input.
`;
