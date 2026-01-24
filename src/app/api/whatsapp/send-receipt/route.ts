import { NextRequest, NextResponse } from "next/server";

const WHATSAPP_API_URL = process.env.WHATSAPP_API_URL || "https://graph.facebook.com/v24.0";
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;

export async function POST(request: NextRequest) {
  try {
    const { phone, message, imageUrl } = await request.json();

    if (!WHATSAPP_PHONE_NUMBER_ID || !WHATSAPP_ACCESS_TOKEN) {
      return NextResponse.json(
        { error: "WhatsApp API no configurada. Configure WHATSAPP_PHONE_NUMBER_ID y WHATSAPP_ACCESS_TOKEN" },
        { status: 500 }
      );
    }

    const cleanPhone = phone.replace(/\D/g, "");
    const phoneWithCountry = cleanPhone.startsWith("57") ? cleanPhone : `57${cleanPhone}`;
    const recipientNumber = `${phoneWithCountry}@c.us`;

    let mediaId: string | null = null;

    if (imageUrl) {
      try {
        const uploadResponse = await fetch(
          `${WHATSAPP_API_URL}/${WHATSAPP_PHONE_NUMBER_ID}/media`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              messaging_product: "whatsapp",
              type: "image",
              url: imageUrl.startsWith("http") ? imageUrl : `${process.env.NEXT_PUBLIC_BASE_URL || ""}${imageUrl}`,
            }),
          }
        );

        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json();
          mediaId = uploadData.id;
        }
      } catch (error) {
        console.error("Error subiendo imagen:", error);
      }
    }

    const messagePayload: any = {
      messaging_product: "whatsapp",
      to: recipientNumber,
    };

    if (mediaId) {
      messagePayload.type = "image";
      messagePayload.image = {
        id: mediaId,
        caption: message,
      };
    } else {
      messagePayload.type = "text";
      messagePayload.text = {
        body: message,
      };
    }

    const response = await fetch(
      `${WHATSAPP_API_URL}/${WHATSAPP_PHONE_NUMBER_ID}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(messagePayload),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || "Error al enviar mensaje");
    }

    const data = await response.json();

    return NextResponse.json({
      success: true,
      messageId: data.messages?.[0]?.id,
    });
  } catch (error) {
    console.error("Error en WhatsApp API:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error desconocido" },
      { status: 500 }
    );
  }
}
