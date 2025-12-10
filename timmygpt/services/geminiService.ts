import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { GEMINI_MODEL, INITIAL_SYSTEM_INSTRUCTION } from "../constants";
import { ImageAttachment } from "../types";

let chatSession: Chat | null = null;
let genAI: GoogleGenAI | null = null;

// Initialize the API client
const getClient = (): GoogleGenAI => {
  if (!genAI) {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      throw new Error("API_KEY environment variable is not set.");
    }
    genAI = new GoogleGenAI({ apiKey });
  }
  return genAI;
};

export const initializeChat = () => {
  const client = getClient();
  chatSession = client.chats.create({
    model: GEMINI_MODEL,
    config: {
      systemInstruction: INITIAL_SYSTEM_INSTRUCTION,
    },
  });
  return chatSession;
};

export const getChatSession = () => {
  if (!chatSession) {
    return initializeChat();
  }
  return chatSession;
};

export const resetChat = () => {
  initializeChat();
};

export const sendMessageStream = async (
  text: string,
  images: ImageAttachment[] = []
): Promise<AsyncIterable<GenerateContentResponse>> => {
  const chat = getChatSession();

  let messageContent: any = text;

  // Handle multimodal input
  if (images.length > 0) {
    const parts: any[] = [];
    
    // Add images
    images.forEach((img) => {
      parts.push({
        inlineData: {
          data: img.data,
          mimeType: img.mimeType,
        },
      });
    });

    // Add text prompt
    if (text.trim()) {
      parts.push({ text: text });
    }
    
    messageContent = { parts };
  }

  try {
    const result = await chat.sendMessageStream({ message: messageContent });
    return result;
  } catch (error) {
    console.error("Error sending message to Gemini:", error);
    throw error;
  }
};
