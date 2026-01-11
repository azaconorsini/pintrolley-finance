
import { GoogleGenAI } from "@google/genai";

/**
 * Función interna para obtener la instancia de AI de forma segura
 * Prioriza las variables de entorno de Vercel/Vite
 */
const getAI = () => {
  const apiKey = process.env.API_KEY || (window as any).process?.env?.API_KEY || "";
  if (!apiKey || apiKey.length < 10) return null;
  
  try {
    return new GoogleGenAI({ apiKey });
  } catch (e) {
    console.error("Error al inicializar Gemini:", e);
    return null;
  }
};

export const generateCollectionMessage = async (clientName: string, amount: number, dueDate: string) => {
  const ai = getAI();
  if (!ai) {
    return `Hola ${clientName}, te recordamos tu pago de $${amount.toLocaleString()} que vence el ${dueDate}. Por favor, realiza tu abono pronto.`;
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Escribe un recordatorio de pago profesional para ${clientName}. Monto: $${amount}. Vence: ${dueDate}. Máximo 60 palabras.`,
    });
    return response.text || "Recordatorio de pago generado.";
  } catch (error) {
    console.warn("Fallo en Gemini, usando respaldo.");
    return `Estimado ${clientName}, tienes un saldo pendiente de $${amount.toLocaleString()}. Agradecemos tu puntualidad.`;
  }
};

export const getFinancialInsights = async (totalLent: number, totalRecovered: number, arrearsRate: number) => {
  const ai = getAI();
  if (!ai) return "Conecta tu API Key de Gemini para obtener consejos financieros estratégicos.";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Analiza esta cartera: Prestado $${totalLent}, Recuperado $${totalRecovered}, Mora ${arrearsRate}%. Dame 3 consejos breves para mejorar la liquidez en formato Markdown.`,
    });
    return response.text || "Análisis financiero listo.";
  } catch (error) {
    return "El análisis con Inteligencia Artificial no está disponible en este momento.";
  }
};
