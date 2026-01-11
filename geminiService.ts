
import { GoogleGenAI } from "@google/genai";

/**
 * Obtiene la API KEY de forma segura desde múltiples fuentes posibles en el navegador
 */
const getApiKey = (): string => {
  const env = (window as any).process?.env?.API_KEY || (import.meta as any).env?.VITE_API_KEY || "";
  return env;
};

/**
 * Crea una instancia de Gemini solo cuando es necesario.
 * Esto evita que la app falle si la llave no está presente al inicio.
 */
const getAiInstance = () => {
  const apiKey = getApiKey();
  if (!apiKey) return null;
  try {
    return new GoogleGenAI({ apiKey });
  } catch (e) {
    console.error("Error inicializando Gemini SDK:", e);
    return null;
  }
};

export const generateCollectionMessage = async (clientName: string, amount: number, dueDate: string) => {
  try {
    const ai = getAiInstance();
    if (!ai) throw new Error("API Key de Gemini no detectada");
    
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
    console.warn("Usando mensaje de respaldo por falta de IA:", error);
    return `Hola ${clientName}, te recordamos que tu pago de $${amount.toLocaleString()} vence el ${dueDate}. Por favor, realiza tu abono pronto.`;
  }
};

export const getFinancialInsights = async (totalLent: number, totalRecovered: number, arrearsRate: number) => {
  try {
    const ai = getAiInstance();
    if (!ai) throw new Error("API Key de Gemini no detectada");

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
    return "💡 Conecta tu API de Google Gemini para obtener consejos estratégicos sobre tu cartera.";
  }
};
