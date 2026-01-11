
import { GoogleGenAI } from "@google/genai";

// Fix: Use process.env.API_KEY directly for initialization
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateCollectionMessage = async (clientName: string, amount: number, dueDate: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Escribe un recordatorio de pago profesional y amable para un cliente de microcréditos. 
      Nombre: ${clientName}. 
      Monto pendiente: $${amount.toLocaleString()}. 
      Fecha de vencimiento: ${dueDate}. 
      El tono debe ser de apoyo pero firme. Máximo 100 palabras.`,
    });
    // Fix: access .text property directly instead of calling a method
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return `Hola ${clientName}, te recordamos que tu pago de $${amount.toLocaleString()} vence el ${dueDate}. Por favor, realiza tu abono pronto.`;
  }
};

export const getFinancialInsights = async (totalLent: number, totalRecovered: number, arrearsRate: number) => {
  try {
    const response = await ai.models.generateContent({
      // Fix: Using gemini-3-pro-preview for complex reasoning and strategic analysis
      model: 'gemini-3-pro-preview',
      contents: `Analiza estas métricas de una cooperativa de crédito y dame 3 consejos estratégicos cortos.
      Total prestado: $${totalLent.toLocaleString()}
      Total recuperado: $${totalRecovered.toLocaleString()}
      Tasa de mora: ${arrearsRate}%
      Responde en formato Markdown con viñetas.`,
    });
    // Fix: access .text property directly instead of calling a method
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "No se pudieron generar insights financieros en este momento.";
  }
};
