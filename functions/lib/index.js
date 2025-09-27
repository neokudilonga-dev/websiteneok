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
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const nodemailer = __importStar(require("nodemailer"));
admin.initializeApp();
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: functions.config().gmail.email,
        pass: functions.config().gmail.password,
    },
});
exports.sendOrderConfirmationEmail = functions.firestore
    .document("orders/{orderId}")
    .onCreate(async (snapshot, context) => {
    const order = snapshot.data();
    if (!order) {
        console.log("No order data found.");
        return null;
    }
    const mailOptions = {
        from: "NEOKUDILONGA <noreply@neokudilonga.com>",
        to: order.email, // Assuming the order object has an email field
        subject: `Order Confirmation - NEOKUDILONGA #${order.reference}`,
        html: `
        <h1>Thank you for your order, ${order.guardianName}!</h1>
        <p>Your order with reference <strong>#${order.reference}</strong> has been successfully placed.</p>
        <h2>Order Details:</h2>
        <ul>
          <li><strong>Student Name:</strong> ${order.studentName}</li>
          <li><strong>Class and Grade:</strong> ${order.classAndGrade}</li>
          <li><strong>Phone:</strong> ${order.phone}</li>
          <li><strong>Delivery Option:</strong> ${order.deliveryOption}</li>
          ${order.deliveryAddress ? `<li><strong>Delivery Address:</strong> ${order.deliveryAddress}</li>` : ""}
          <li><strong>Payment Method:</strong> ${order.paymentMethod}</li>
          <li><strong>Total:</strong> ${order.total} Kz</li>
        </ul>
        <h3>Items:</h3>
        <ul>
          ${order.items
            .map((item) => `<li>${item.name} (x${item.quantity}) - ${item.price} Kz</li>`)
            .join("")}
        </ul>
        <p>We will contact you shortly via WhatsApp for the next steps.</p>
        <p>Thank you for choosing NEOKUDILONGA!</p>
      `,
    };
    try {
        await transporter.sendMail(mailOptions);
        console.log("Order confirmation email sent to:", order.email);
    }
    catch (error) {
        console.error("Error sending order confirmation email:", error);
    }
    return null;
});
//# sourceMappingURL=index.js.map