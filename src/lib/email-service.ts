import { Resend } from 'resend';
import type { Order } from '@/lib/types';

// Initialize Resend with API key from environment
const resend = new Resend(process.env.RESEND_API_KEY);

// From email address - must be a verified domain in Resend
const FROM_EMAIL = process.env.FROM_EMAIL || 'neokudilonga@gmail.com';

/**
 * Send order confirmation email to customer
 */
export async function sendOrderConfirmationEmail(order: Order) {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.warn('RESEND_API_KEY not set, skipping email notification');
      return { success: false, error: 'Email service not configured' };
    }

    if (!order.email) {
      console.log('No email provided for order, skipping email notification');
      return { success: false, error: 'No email address' };
    }

    const orderItems = order.items?.map((item: any) => {
      const itemName = typeof item.name === 'string' ? item.name : (item.name?.pt || item.name?.en || 'Item');
      return `<li>${itemName} - ${item.price?.toLocaleString('pt-PT')} Kz</li>`;
    }).join('') || '';

    const deliveryFeeText = order.deliveryFee === 0 
      ? 'Entrega Gratuita' 
      : `${order.deliveryFee?.toLocaleString('pt-PT')} Kz`;

    const paymentMethodText = order.paymentMethod === 'transferencia' 
      ? 'Transferência Bancária'
      : order.paymentMethod === 'numerario'
      ? 'Numerário'
      : 'Multicaixa/Terminal';

    const deliveryOptionText = order.deliveryOption === 'delivery'
      ? 'Entrega em Talatona/Morro Bento'
      : order.deliveryOption === 'pickup'
      ? 'Entrega fora de Talatona'
      : order.deliveryOption === 'outside-zones'
      ? 'Entrega em Viana/Kilamba'
      : order.deliveryOption === 'levantamento'
      ? 'Levantamento no Colégio'
      : 'Levantamento no Local';

    const subject = `Confirmação de Encomenda ${order.reference} - Neokudilonga`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1e40af;">Confirmação de Encomenda</h2>
        <p>Olá ${order.guardianName || 'Cliente'},</p>
        <p>Obrigado pela sua encomenda! Recebemos a sua solicitação com sucesso.</p>
        
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #374151;">Detalhes da Encomenda</h3>
          <p><strong>Referência:</strong> ${order.reference}</p>
          <p><strong>Data:</strong> ${new Date(order.date).toLocaleDateString('pt-PT')}</p>
          <p><strong>Método de Pagamento:</strong> ${paymentMethodText}</p>
          <p><strong>Opção de Entrega:</strong> ${deliveryOptionText}</p>
          ${order.deliveryAddress ? `<p><strong>Morada:</strong> ${order.deliveryAddress}</p>` : ''}
          ${order.studentName ? `<p><strong>Aluno:</strong> ${order.studentName}</p>` : ''}
          ${order.studentClass ? `<p><strong>Turma:</strong> ${order.studentClass}</p>` : ''}
        </div>

        <h3 style="color: #374151;">Items Encomendados</h3>
        <ul style="line-height: 1.8;">
          ${orderItems}
        </ul>

        <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>Subtotal:</strong> ${(order.total - (order.deliveryFee || 0)).toLocaleString('pt-PT')} Kz</p>
          <p style="margin: 5px 0;"><strong>Taxa de Entrega:</strong> ${deliveryFeeText}</p>
          <p style="margin: 5px 0; font-size: 1.1em; color: #1e40af;"><strong>Total:</strong> ${order.total?.toLocaleString('pt-PT')} Kz</p>
        </div>

        ${order.paymentMethod === 'transferencia' ? `
        <div style="background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #92400e; margin-top: 0;">Informações de Pagamento</h3>
          <p style="color: #92400e;">Por favor, efetue a transferência para:</p>
          <ul style="color: #92400e;">
            <li><strong>IBAN:</strong> BIC AO06 0051 0000 8030 4996 1512 5</li>
            <li><strong>Email:</strong> neokudilonga@gmail.com</li>
            <li><strong>WhatsApp:</strong> +244 919 948 887</li>
          </ul>
          <p style="color: #92400e; font-weight: bold;">Envie o comprovativo de pagamento para o nosso WhatsApp ou email.</p>
        </div>
        ` : ''}

        <p>Se tiver alguma dúvida, não hesite em contactar-nos:</p>
        <ul>
          <li>WhatsApp: +244 919 948 887</li>
          <li>Email: neokudilonga@gmail.com</li>
        </ul>

        <p style="margin-top: 30px; color: #6b7280; font-size: 0.9em;">
          Obrigado por escolher a Neokudilonga!<br>
          <a href="https://biblioangola.web.app" style="color: #1e40af;">www.neokudilonga.com</a>
        </p>
      </div>
    `;

    const { data, error } = await resend.emails.send({
      from: `Neokudilonga <${FROM_EMAIL}>`,
      to: [order.email],
      subject: subject,
      html: html,
    });

    if (error) {
      console.error('Error sending email:', error);
      return { success: false, error: error.message };
    }

    console.log('Order confirmation email sent:', data?.id);
    return { success: true, id: data?.id };

  } catch (error) {
    console.error('Error in sendOrderConfirmationEmail:', error);
    return { success: false, error: (error as Error).message };
  }
}

/**
 * Send order notification to admin
 */
export async function sendAdminOrderNotification(order: Order) {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.warn('RESEND_API_KEY not set, skipping admin notification');
      return { success: false, error: 'Email service not configured' };
    }

    const adminEmail = process.env.ADMIN_EMAIL || 'neokudilonga@gmail.com';

    const orderItems = order.items?.map((item: any) => {
      const itemName = typeof item.name === 'string' ? item.name : (item.name?.pt || item.name?.en || 'Item');
      return `<li>${itemName} - ${item.price?.toLocaleString('pt-PT')} Kz</li>`;
    }).join('') || '';

    const subject = `Nova Encomenda ${order.reference} - Neokudilonga`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1e40af;">Nova Encomenda Recebida</h2>
        
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #374151;">Detalhes da Encomenda</h3>
          <p><strong>Referência:</strong> ${order.reference}</p>
          <p><strong>Data:</strong> ${new Date(order.date).toLocaleDateString('pt-PT')}</p>
          <p><strong>Cliente:</strong> ${order.guardianName || 'N/A'}</p>
          <p><strong>Email:</strong> ${order.email || 'N/A'}</p>
          <p><strong>Telefone:</strong> ${order.phone || 'N/A'}</p>
          <p><strong>Total:</strong> ${order.total?.toLocaleString('pt-PT')} Kz</p>
        </div>

        <h3 style="color: #374151;">Items</h3>
        <ul style="line-height: 1.8;">
          ${orderItems}
        </ul>

        <p style="margin-top: 30px;">
          <a href="https://biblioangola.web.app/admin/orders" style="background: #1e40af; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Ver Encomenda no Admin</a>
        </p>
      </div>
    `;

    const { data, error } = await resend.emails.send({
      from: `Neokudilonga <${FROM_EMAIL}>`,
      to: [adminEmail],
      subject: subject,
      html: html,
    });

    if (error) {
      console.error('Error sending admin notification:', error);
      return { success: false, error: error.message };
    }

    console.log('Admin notification email sent:', data?.id);
    return { success: true, id: data?.id };

  } catch (error) {
    console.error('Error in sendAdminOrderNotification:', error);
    return { success: false, error: (error as Error).message };
  }
}
