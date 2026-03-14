import { NextRequest, NextResponse } from "next/server";
import { withLavaderoAuth } from "@/lib/api-auth";
import { getOrderById } from "@/modules/lavadero/services/lavadero-order.service";

export const POST = withLavaderoAuth(
  ["LAVADERO_ADMIN", "LAVADERO_SUPERVISOR"],
  async (request, _user, tenantId) => {
    const { orderId } = await request.json();
    if (!orderId) {
      return NextResponse.json({ success: false, error: "orderId requerido" }, { status: 400 });
    }

    const order = await getOrderById(orderId, tenantId);
    if (!order) {
      return NextResponse.json({ success: false, error: "Orden no encontrada" }, { status: 404 });
    }

    const phone = order.customer.phone.replace(/\D/g, "");
    const phoneWithCountry = phone.startsWith("57") ? phone : `57${phone}`;
    const plate = order.vehicle.plate;
    const services = order.orderServices.map((os) => os.service.name).join(", ");
    const total = Number(order.total).toLocaleString("es-CO");

    const message = encodeURIComponent(
      `Hola ${order.customer.name}, su vehículo ${plate} ya está listo.\n\n` +
      `Servicios: ${services}\n` +
      `Total: $${total} COP\n\n` +
      `¡Lo esperamos!`
    );

    const whatsappUrl = `https://wa.me/${phoneWithCountry}?text=${message}`;

    return NextResponse.json({
      success: true,
      data: { whatsappUrl, phone: phoneWithCountry },
      message: "Enlace de WhatsApp generado",
    });
  }
);
