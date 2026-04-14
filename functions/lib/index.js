"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendOrderConfirmationEmail = void 0;
const functions = __importStar(require("firebase-functions/v1"));
const admin = __importStar(require("firebase-admin"));
const nodemailer = __importStar(require("nodemailer"));
const params_1 = require("firebase-functions/params");
admin.initializeApp();
const gmailEmailParam = (0, params_1.defineString)("GMAIL_EMAIL");
const gmailPasswordParam = (0, params_1.defineString)("GMAIL_PASSWORD");
exports.sendOrderConfirmationEmail = functions.firestore
    .document("orders/{orderId}")
    .onCreate(async (snapshot, context) => {
    const order = snapshot.data();
    if (!order) {
        console.log("No order data found.");
        return null;
    }
    // Skip sending email if no email provided
    if (!order.email) {
        console.log("No email provided for order. Skipping confirmation email.");
        return null;
    }
    // IMPORTANT: You must set GMAIL_EMAIL and GMAIL_PASSWORD in Firebase secrets or env vars.
    // Use: firebase functions:secrets:set GMAIL_EMAIL
    // Use: firebase functions:secrets:set GMAIL_PASSWORD
    const gmailUser = gmailEmailParam.value() || process.env.GMAIL_EMAIL;
    const gmailPass = gmailPasswordParam.value() || process.env.GMAIL_PASSWORD;
    if (!gmailUser || !gmailPass) {
        console.warn("Gmail credentials missing. Email will not be sent (using jsonTransport). Check Firebase secrets GMAIL_EMAIL and GMAIL_PASSWORD.");
    }
    const transporter = (gmailUser && gmailPass)
        ? nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            auth: {
                user: gmailUser,
                pass: gmailPass,
            },
        })
        : nodemailer.createTransport({ jsonTransport: true });
    const isPT = order.language === 'pt';
    const subject = isPT
        ? `Confirmação de Encomenda - NEOKUDILONGA #${order.reference}`
        : `Order Confirmation - NEOKUDILONGA #${order.reference}`;
    const paymentMethodLabel = (method) => {
        if (method === 'transferencia')
            return isPT ? 'Transferência Bancária' : 'Bank Transfer';
        if (method === 'multicaixa')
            return isPT ? 'Multicaixa' : 'Multicaixa';
        if (method === 'numerario')
            return isPT ? 'Numerário' : 'Cash';
        return method;
    };
    const deliveryOptionLabel = (option) => {
        if (option === 'delivery')
            return isPT ? 'Entrega ao Domicílio' : 'Home Delivery';
        if (option === 'pickup')
            return isPT ? 'Levantamento no Local' : 'Local Pickup';
        if (option === 'levantamento')
            return isPT ? 'Levantamento na Escola' : 'Pickup at School';
        return option;
    };
    const mailOptions = {
        from: "NEOKUDILONGA <noreply@neokudilonga.com>",
        to: order.email,
        bcc: "neokudilonga@gmail.com",
        subject: subject,
        html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <h1 style="color: #2563eb; text-align: center;">NEOKUDILONGA</h1>
          <h2 style="color: #1e293b; border-bottom: 2px solid #2563eb; padding-bottom: 10px;">
            ${isPT ? `Obrigado pela sua encomenda, ${order.guardianName}!` : `Thank you for your order, ${order.guardianName}!`}
          </h2>
          
          <p style="font-size: 16px; line-height: 1.5; color: #475569;">
            ${isPT
            ? `A sua encomenda com a referência <strong>#${order.reference}</strong> foi registada com sucesso.`
            : `Your order with reference <strong>#${order.reference}</strong> has been successfully placed.`}
          </p>

          <div style="background-color: #f8fafc; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #1e293b;">${isPT ? 'Detalhes da Encomenda' : 'Order Details'}</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #64748b;"><strong>${isPT ? 'Aluno' : 'Student'}:</strong></td>
                <td style="padding: 8px 0; color: #1e293b;">${order.studentName || 'N/A'}</td>
              </tr>
              ${order.studentClass ? `
              <tr>
                <td style="padding: 8px 0; color: #64748b;"><strong>${isPT ? 'Turma/Classe' : 'Class/Grade'}:</strong></td>
                <td style="padding: 8px 0; color: #1e293b;">${order.studentClass}</td>
              </tr>` : ''}
              <tr>
                <td style="padding: 8px 0; color: #64748b;"><strong>${isPT ? 'Telefone' : 'Phone'}:</strong></td>
                <td style="padding: 8px 0; color: #1e293b;">${order.phone}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #64748b;"><strong>${isPT ? 'Opção de Entrega' : 'Delivery Option'}:</strong></td>
                <td style="padding: 8px 0; color: #1e293b;">${deliveryOptionLabel(order.deliveryOption)}</td>
              </tr>
              ${order.deliveryAddress ? `
              <tr>
                <td style="padding: 8px 0; color: #64748b;"><strong>${isPT ? 'Endereço' : 'Address'}:</strong></td>
                <td style="padding: 8px 0; color: #1e293b;">${order.deliveryAddress}</td>
              </tr>` : ''}
              <tr>
                <td style="padding: 8px 0; color: #64748b;"><strong>${isPT ? 'Método de Pagamento' : 'Payment Method'}:</strong></td>
                <td style="padding: 8px 0; color: #1e293b;">${paymentMethodLabel(order.paymentMethod)}</td>
              </tr>
            </table>
          </div>

          <h3 style="color: #1e293b;">${isPT ? 'Items Encomendados' : 'Ordered Items'}</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <thead>
              <tr style="border-bottom: 1px solid #e2e8f0; text-align: left;">
                <th style="padding: 10px 0;">${isPT ? 'Item' : 'Item'}</th>
                <th style="padding: 10px 0; text-align: center;">${isPT ? 'Qtd' : 'Qty'}</th>
                <th style="padding: 10px 0; text-align: right;">${isPT ? 'Preço' : 'Price'}</th>
              </tr>
            </thead>
            <tbody>
              ${order.items.map((item) => `
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 10px 0;">${typeof item.name === 'string'
            ? item.name
            : (item.name[order.language || 'pt'] || item.name.pt || item.name.en || 'Item')}</td>
                  <td style="padding: 10px 0; text-align: center;">${item.quantity}</td>
                  <td style="padding: 10px 0; text-align: right;">${item.price.toLocaleString('pt-PT')} Kz</td>
                </tr>
              `).join('')}
              ${order.deliveryFee > 0 ? `
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 10px 0;" colspan="2">${isPT ? 'Taxa de Entrega' : 'Delivery Fee'}</td>
                  <td style="padding: 10px 0; text-align: right;">${order.deliveryFee.toLocaleString('pt-PT')} Kz</td>
                </tr>` : ''}
              <tr>
                <td style="padding: 20px 0 10px; font-size: 18px; font-weight: bold;" colspan="2">Total</td>
                <td style="padding: 20px 0 10px; font-size: 18px; font-weight: bold; text-align: right; color: #2563eb;">${order.total.toLocaleString('pt-PT')} Kz</td>
              </tr>
            </tbody>
          </table>

          ${order.paymentMethod === 'transferencia' ? `
          <div style="background-color: #eff6ff; padding: 15px; border: 1px solid #bfdbfe; border-radius: 6px; margin: 20px 0;">
            <h4 style="margin-top: 0; color: #1e40af;">${isPT ? 'Instruções de Pagamento' : 'Payment Instructions'}</h4>
            <p style="font-size: 14px; color: #1e40af;">
              ${isPT
            ? 'Por favor, realize o pagamento por transferência bancária para o IBAN abaixo e envie o comprovativo por WhatsApp ou E-mail.'
            : 'Please make the payment by bank transfer to the IBAN below and send the proof via WhatsApp or E-mail.'}
            </p>
            <p style="font-size: 16px; font-weight: bold; color: #1e40af; margin-bottom: 5px;">IBAN: BIC AO06 0051 0000 8030 4996 1512 5</p>
            <p style="font-size: 14px; color: #1e40af;">Titular: NEOKUDILONGA</p>
          </div>
          ` : ''}

          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #64748b; font-size: 14px;">
            <p>${isPT ? 'Entraremos em contacto brevemente via WhatsApp para os próximos passos.' : 'We will contact you shortly via WhatsApp for the next steps.'}</p>
            <p><strong>NEOKUDILONGA</strong></p>
            <p>WhatsApp: +244 919 948 887 | Email: neokudilonga@gmail.com</p>
          </div>
        </div>
      `,
    };
    try {
        await transporter.sendMail(mailOptions);
        console.log("Order confirmation email sent to:", order.email);
        await snapshot.ref.update({
            emailSent: true,
            emailSentAt: admin.firestore.FieldValue.serverTimestamp()
        });
    }
    catch (error) {
        console.error("Error sending order confirmation email:", error);
        await snapshot.ref.update({
            emailSent: false,
            emailError: String(error)
        });
    }
    return null;
});
//# sourceMappingURL=index.js.map