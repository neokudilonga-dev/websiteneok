import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as nodemailer from "nodemailer";

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

export const sendOrderConfirmationEmail = functions.firestore
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
            .map(
              (item: any) =>
                `<li>${item.name} (x${item.quantity}) - ${item.price} Kz</li>`
            )
            .join("")}
        </ul>
        <p>We will contact you shortly via WhatsApp for the next steps.</p>
        <p>Thank you for choosing NEOKUDILONGA!</p>
      `,
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log("Order confirmation email sent to:", order.email);
    } catch (error) {
      console.error("Error sending order confirmation email:", error);
    }

    return null;
  });