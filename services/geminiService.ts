
import { GoogleGenAI } from "@google/genai";

/**
 * Obtiene la API KEY de forma segura evitando ReferenceErrors de process.env
 */
const getSafeApiKey = (): string => {
  try {
    // Intenta obtenerla de process.env (Vercel) o del shim global
    return (typeof process !== 'undefined' && process.env?.API_KEY) || 
           (window as any).process?.env?.API_KEY || 
           "";
  } catch (e) {
    return "";
  }
};

export const generateCollectionMessage = async (clientName: string, amount: number, dueDate: string) => {
  const apiKey = getSafeApiKey();
  
  if (!apiKey || apiKey.length < 10) {
    return `Hola ${clientName}, te recordamos tu pago de $${amount.toLocaleString()} que vence el ${dueDate}. Por favor, realiza tu abono pronto.`;
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Escribe un recordatorio de pago profesional para ${clientName}. Monto: $${amount}. Vence: ${dueDate}. Máximo 60 palabras.`,
    });
    return response.text || "Recordatorio de pago generado.";
  } catch (error) {
    console.warn("Fallo en Gemini:", error);
    return `Estimado ${clientName}, tienes un saldo pendiente de $${amount.toLocaleString()}. Agradecemos tu puntualidad.`;
  }
};

export const getFinancialInsights = async (totalLent: number, totalRecovered: number, arrearsRate: number) => {
  const apiKey = getSafeApiKey();
  
  if (!apiKey || apiKey.length < 10) {
    return "💡 Conecta tu API Key de Gemini en las variables de entorno de Vercel para recibir análisis estratégicos automáticos.";
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Analiza esta cartera financiera: Prestado $${totalLent}, Recuperado $${totalRecovered}, Tasa de Mora ${arrearsRate}%. Proporciona 3 consejos estratégicos breves en formato Markdown.`,
    });
    return response.text || "Análisis financiero completado.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "El análisis estratégico no está disponible temporalmente.";
  }
};
