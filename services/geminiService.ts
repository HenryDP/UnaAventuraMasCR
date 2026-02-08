
import { GoogleGenAI, Type } from "@google/genai";
import { Language } from "../types";

const getAIClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateTourDescription = async (title: string, keywords: string) => {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Genera una descripción profesional y atractiva para un tour en Costa Rica llamado "${title}". 
    Usa estas palabras clave: ${keywords}. Enfócate en atraer turismo internacional. 
    Además, genera un "slug" (una cadena corta de 2-3 palabras separadas por guiones) que sea muy atractivo para un link de marketing (ej: arenal-extreme, coco-sunset).
    Responde en formato JSON con versiones para estos idiomas: es, en, de, fr, y el campo "slug".`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          es: { type: Type.STRING },
          en: { type: Type.STRING },
          de: { type: Type.STRING },
          fr: { type: Type.STRING },
          slug: { type: Type.STRING, description: "Un nombre de URL corto y atractivo" }
        },
        required: ["es", "en", "de", "fr", "slug"],
      },
    },
  });
  
  const jsonStr = response.text?.trim();
  return jsonStr ? JSON.parse(jsonStr) : { es: '', en: '', de: '', fr: '', slug: '' };
};

export const editTourImage = async (base64Image: string, prompt: string): Promise<string | null> => {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        {
          inlineData: {
            data: base64Image.split(',')[1],
            mimeType: 'image/png',
          },
        },
        {
          text: `Edita esta imagen siguiendo esta instrucción: ${prompt}. Mantén la esencia de Costa Rica y hazla lucir vibrante y profesional.`,
        },
      ],
    },
  });

  const parts = response.candidates?.[0]?.content?.parts || [];
  for (const part of parts) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  return null;
};
