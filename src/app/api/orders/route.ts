import { firestore } from '@/lib/firebase-admin';
import { NextRequest, NextResponse } from 'next/server';
import { Order } from '@/lib/types';
import { revalidateTag } from 'next/cache';
import { getCachedOrders } from '@/lib/admin-cache';
import { orderSchema } from '@/lib/validation/orders';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input data
    const validationResult = orderSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json({ 
        message: 'Invalid order data', 
        errors: validationResult.error.errors 
      }, { status: 400 });
    }
    
    const order = validationResult.data;
    console.log("[API Orders] POST - Creating order:", order.reference);
    
    const orderRef = firestore.collection('orders').doc(order.reference);
    await orderRef.set({
      ...order,
      createdAt: order.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    console.log("[API Orders] POST - Order saved to Firestore:", order.reference);
    
    // Add document to 'mail' collection to trigger 'Trigger Email from Firestore' extension
    try {
      console.log("[API Orders] POST - Triggering email via 'mail' collection");
      const language = order.language === 'en' ? 'en' : 'pt';
      const isPT = language === 'pt';
      
      const emailContent = {
        to: `${order.guardianName} <${order.email}>`,
        bcc: 'neokudilonga@gmail.com', // Send a blind copy to admin
        message: {
          subject: isPT ? `Confirmação de Encomenda - ${order.reference}` : `Order Confirmation - ${order.reference}`,
          text: `Olá ${order.guardianName}, recebemos o seu pedido ${order.reference}. Total: ${order.total.toLocaleString('pt-PT', { style: 'currency', currency: 'AOA' })}.`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
              <h2 style="color: #184f3f; text-align: center;">${isPT ? 'Obrigado pela sua encomenda!' : 'Thank you for your order!'}</h2>
              <p>${isPT ? 'Olá' : 'Hello'} <strong>${order.guardianName}</strong>,</p>
              <p>${isPT 
                ? `A sua encomenda com a referência <strong>${order.reference}</strong> foi registada com sucesso.` 
                : `Your order with reference <strong>${order.reference}</strong> has been successfully registered.`}</p>
              
              <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <h3 style="margin-top: 0;">${isPT ? 'Detalhes do Pedido' : 'Order Details'}</h3>
                <p><strong>${isPT ? 'Escola' : 'School'}:</strong> ${order.schoolName}</p>
                <p><strong>${isPT ? 'Aluno' : 'Student'}:</strong> ${order.studentName}</p>
                <p><strong>${isPT ? 'Total' : 'Total'}:</strong> ${order.total.toLocaleString('pt-PT', { style: 'currency', currency: 'AOA' })}</p>
                <p><strong>${isPT ? 'Método de Pagamento' : 'Payment Method'}:</strong> ${order.paymentMethod}</p>
              </div>

              <div style="margin-top: 20px;">
                <h3 style="margin-top: 0;">${isPT ? 'Produtos' : 'Products'}</h3>
                <ul style="list-style: none; padding: 0;">
                  ${order.items.map(item => {
                    const itemName = typeof item.name === 'string' 
                      ? item.name 
                      : (item.name?.[language] || item.name?.pt || item.name?.en || 'Item');
                    return `
                      <li style="padding: 10px 0; border-bottom: 1px solid #eee;">
                        <strong>${itemName}</strong><br>
                        ${item.quantity} x ${item.price.toLocaleString('pt-PT', { style: 'currency', currency: 'AOA' })}
                      </li>
                    `;
                  }).join('')}
                </ul>
              </div>

              ${order.paymentMethod === 'transferencia' ? `
                <div style="background-color: #fff9e6; border-left: 4px solid #ffcc00; padding: 15px; margin: 20px 0;">
                  <h4 style="margin-top: 0;">${isPT ? 'Instruções de Pagamento' : 'Payment Instructions'}</h4>
                  <p>${isPT 
                    ? 'Por favor, realize a transferência para o IBAN abaixo e envie o comprovativo.' 
                    : 'Please make the transfer to the IBAN below and send the proof.'}</p>
                  <p><strong>IBAN:</strong> BIC AO06 0051 0000 8030 4996 1512 5</p>
                  <p><strong>Titular:</strong> NEOKUDILONGA</p>
                </div>
              ` : ''}

              <div style="text-align: center; margin-top: 30px; font-size: 12px; color: #888;">
                <p>NEOKUDILONGA - Livraria Escolar & Jogos Educativos</p>
                <p>WhatsApp: +244 919 948 887 | Email: neokudilonga@gmail.com</p>
              </div>
            </div>
          `
        },
      };

      await firestore.collection('mail').add(emailContent);
      console.log("[API Orders] POST - Email trigger added to 'mail' collection");
    } catch (emailError) {
      console.error("[API Orders] POST - Error triggering email extension:", emailError);
    }

    try {
      console.log("[API Orders] POST - Triggering revalidateTag('orders')");
      revalidateTag('orders');
      console.log("[API Orders] POST - revalidateTag('orders') success");
    } catch (revalidateError) {
      console.warn("[API Orders] POST - Error revalidating tag 'orders':", revalidateError);
    }

    return NextResponse.json({ message: 'Order created successfully', reference: order.reference }, { status: 201 });
  } catch (error) {
    console.error('[API Orders] POST - Error creating order:', error);
    return NextResponse.json({ message: 'Error creating order', error: String(error) }, { status: 500 });
  }
}

export async function GET() {
  try {
    console.log("[API Orders] GET - Fetching orders");
    const orders = await getCachedOrders();
    console.log(`[API Orders] GET - Successfully fetched ${orders.length} orders`);
    return NextResponse.json(orders, { status: 200 });
  } catch (error) {
    console.error('[API Orders] GET - Error fetching orders:', error);
    return NextResponse.json({ message: 'Error fetching orders', error: String(error) }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
