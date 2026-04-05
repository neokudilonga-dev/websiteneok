
import { GoogleGenerativeAI } from "@google/generative-ai";
import { 
  getCachedProducts, 
  getCachedSchools, 
  getCachedOrders
} from "./admin-cache";
import { getDisplayName } from "./utils";
import { firestore } from "./firebase-admin";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

/**
 * Log chat interaction to Firestore for admin monitoring.
 */
async function logChat(userPhone: string, query: string, response: string, messageId?: string) {
  try {
    if (!firestore) {
      console.error("Firestore not initialized, cannot log chat");
      return;
    }
    await firestore.collection('chatLogs').add({
      userPhone,
      query,
      response,
      messageId,
      timestamp: new Date().toISOString(),
      source: 'whatsapp'
    });
  } catch (error) {
    console.error("Error logging chat:", error);
  }
}

/**
 * Core AI Bot logic to handle client questions via WhatsApp.
 */
export async function processClientQuery(query: string, userPhone: string, messageId?: string) {
  try {
    // 1. Fetch website data for context
    const [products, schools, orders] = await Promise.all([
      getCachedProducts(),
      getCachedSchools(),
      getCachedOrders()
    ]);

    // 2. Filter orders for this specific user if applicable (by phone)
    // We try to match the last 9 digits to be more flexible with country codes
    const cleanPhone = userPhone.replace(/\D/g, '').slice(-9);
    const userOrders = orders.filter(o => o.phone.replace(/\D/g, '').includes(cleanPhone));

    // 3. Build context for the AI
    const context = `
      You are the official assistant for Neokudilonga, an Angolan bookstore specializing in school books and educational games.
      
      COMPANY INFO:
      - Name: Neokudilonga
      - Location: Condomínio BCI 6 Casas, Casa 6, Morro Bento, Luanda (behind Kero, in front of the lagoon).
      - Contacts: +244 919 948 887, neokudilonga@gmail.com
      - Website: https://neokudilonga.com
      
      AVAILABLE PRODUCTS:
      ${products.slice(0, 50).map(p => `- ${getDisplayName(p.name, 'pt')}: ${p.price} AOA (${p.stockStatus || 'in stock'})`).join('\n')}
      
      PARTNER SCHOOLS:
      ${schools.map(s => `- ${getDisplayName(s.name, 'pt')}`).join('\n')}
      
      USER CONTEXT:
      - Phone: ${userPhone}
      - Previous Orders Found: ${userOrders.length > 0 ? userOrders.map(o => `Ref: ${o.reference}, Status: ${o.paymentStatus}/${o.deliveryStatus}, Date: ${o.date}`).join(', ') : 'No orders found for this number.'}
      
      INSTRUCTIONS:
      - Answer in Portuguese.
      - Be polite, professional, and helpful.
      - If asked about an order status, use the context above. If they provide an order reference not in context, tell them you'll check with a human.
      - If asked about stock, refer to the product list.
      - If you don't know something or it requires manual action (like a refund), ask the user to wait for a human agent or contact +244 919 948 887.
      - Do not invent information not provided in the context.
      - Keep responses concise for WhatsApp.
    `;

    // 4. Generate response using Gemini
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent([context, `Client Query: ${query}`]);
    const responseText = result.response.text();

    // 5. Log the interaction
    await logChat(userPhone, query, responseText, messageId);

    return responseText;
  } catch (error) {
    console.error("AI processing error:", error);
    return "Desculpe, ocorreu um erro ao processar sua solicitação. Por favor, tente novamente mais tarde ou contacte-nos diretamente pelo +244 919 948 887.";
  }
}
