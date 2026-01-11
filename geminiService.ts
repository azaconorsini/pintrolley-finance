
import { GoogleGenAI } from "@google/genai";

// Función segura para obtener API KEY
const getApiKey = (): string => {
  try {
    return (window as any).process?.env?.API_KEY || (import.meta as any).env?.VITE_API_KEY || "";
  } catch {
    return "";
  }
};

const apiKey = getApiKey();
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const generateCollectionMessage = async (clientName: string, amount: number, dueDate: string) => {
  try {
    if (!ai) throw new Error("API Key de Gemini no configurada");
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Escribe un recordatorio de pago profesional y amable para un cliente de microcréditos. 
      Nombre: ${clientName}. 
      Monto pendiente: $${amount.toLocaleString()}. 
      Fecha de vencimiento: ${dueDate}. 
      El tono debe ser de apoyo pero firme. Máximo 100 palabras.`,
    });
    return response.text || "";
  } catch (error) {
    console.error("Gemini Error:", error);
    return `Hola ${clientName}, te recordamos que tu pago de $${amount.toLocaleString()} vence el ${dueDate}. Por favor, realiza tu abono pronto.`;
  }
};

export const getFinancialInsights = async (totalLent: number, totalRecovered: number, arrearsRate: number) => {
  try {
    if (!ai) throw new Error("API Key de Gemini no configurada");

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Analiza estas métricas de una cooperativa de crédito y dame 3 consejos estratégicos cortos.
      Total prestado: $${totalLent.toLocaleString()}
      Total recuperado: $${totalRecovered.toLocaleString()}
      Tasa de mora: ${arrearsRate}%
      Responde en formato Markdown con viñetas.`,
    });
    return response.text || "Insights no disponibles.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "No se pudieron generar insights financieros en este momento.";
  }
};
