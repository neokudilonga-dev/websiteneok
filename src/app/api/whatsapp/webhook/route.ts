import { NextRequest, NextResponse } from "next/server";
import { processClientQuery } from "@/lib/ai-bot";
import { sendWhatsAppMessage, markAsRead } from "@/lib/whatsapp";

export const dynamic = "force-static";

/**
 * WhatsApp Webhook for receiving and responding to messages.
 */

// GET: Webhook verification (required by Meta)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 });
  }

  return new NextResponse("Forbidden", { status: 403 });
}

// POST: Handle incoming messages
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Check if it's a valid WhatsApp message
    if (body.object === "whatsapp_business_account") {
      const entry = body.entry?.[0];
      const changes = entry?.changes?.[0];
      const value = changes?.value;
      const message = value?.messages?.[0];

      // Ignore status updates, only process new messages
      if (message && message.type === "text") {
        const from = message.from; // User phone number
        const text = message.text.body;
        const messageId = message.id;

        console.log(`[WhatsApp Webhook] Received message from ${from}: ${text}`);

        // 1. Mark as read
        await markAsRead(messageId);

        // 2. Process with AI
        const aiResponse = await processClientQuery(text, from, messageId);

        // 3. Send back response
        await sendWhatsAppMessage(from, aiResponse);
      }

      return NextResponse.json({ status: "success" });
    }

    return NextResponse.json({ status: "ignored" });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
