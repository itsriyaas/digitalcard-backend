// src/utils/emailService.js
import nodemailer from 'nodemailer';

// Create transporter
const createTransporter = () => {
  const port = parseInt(process.env.EMAIL_PORT) || 587;
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: port,
    secure: port === 465, // true for 465 (SSL), false for 587 (TLS)
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
};

// Order confirmation email
export const sendOrderConfirmationEmail = async (order, catalogue) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.log('Email credentials not configured. Skipping email send.');
      return;
    }

    const transporter = createTransporter();

    const itemsHtml = order.items.map(item => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">
          ${item.title}
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">
          ${item.quantity}
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">
          ₹${item.price.toFixed(2)}
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">
          ₹${item.total.toFixed(2)}
        </td>
      </tr>
    `).join('');

    const mailOptions = {
      from: `"${catalogue.title}" <${process.env.EMAIL_USER}>`,
      to: order.customer.email,
      subject: `Order Confirmation - ${order.orderNumber}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
            <h1 style="color: #2563eb; margin: 0;">Order Confirmed!</h1>
          </div>

          <div style="background-color: #fff; padding: 20px; border: 1px solid #e5e7eb; border-radius: 10px; margin-bottom: 20px;">
            <p>Dear ${order.customer.name},</p>
            <p>Thank you for your order from <strong>${catalogue.title}</strong>!</p>
            <p>Your order has been confirmed and will be processed shortly.</p>

            <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="margin: 5px 0;"><strong>Order Number:</strong> ${order.orderNumber}</p>
              <p style="margin: 5px 0;"><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
              <p style="margin: 5px 0;"><strong>Payment Method:</strong> ${order.paymentMethod.toUpperCase()}</p>
              <p style="margin: 5px 0;"><strong>Order Status:</strong> <span style="color: #2563eb;">${order.orderStatus.toUpperCase()}</span></p>
            </div>

            <h2 style="color: #1f2937; font-size: 18px; margin-top: 30px;">Order Items</h2>
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
              <thead>
                <tr style="background-color: #f3f4f6;">
                  <th style="padding: 10px; text-align: left; border-bottom: 2px solid #e5e7eb;">Item</th>
                  <th style="padding: 10px; text-align: center; border-bottom: 2px solid #e5e7eb;">Qty</th>
                  <th style="padding: 10px; text-align: right; border-bottom: 2px solid #e5e7eb;">Price</th>
                  <th style="padding: 10px; text-align: right; border-bottom: 2px solid #e5e7eb;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>

            <div style="background-color: #f9fafb; padding: 15px; border-radius: 5px; margin-top: 20px;">
              <table style="width: 100%; font-size: 14px;">
                <tr>
                  <td style="padding: 5px;">Subtotal:</td>
                  <td style="padding: 5px; text-align: right;">₹${order.subtotal.toFixed(2)}</td>
                </tr>
                ${order.discount > 0 ? `
                <tr style="color: #10b981;">
                  <td style="padding: 5px;">Discount:</td>
                  <td style="padding: 5px; text-align: right;">-₹${order.discount.toFixed(2)}</td>
                </tr>
                ` : ''}
                <tr style="font-size: 16px; font-weight: bold; border-top: 2px solid #e5e7eb;">
                  <td style="padding: 10px 5px 5px 5px;">Total:</td>
                  <td style="padding: 10px 5px 5px 5px; text-align: right; color: #2563eb;">₹${order.total.toFixed(2)}</td>
                </tr>
              </table>
            </div>

            <h2 style="color: #1f2937; font-size: 18px; margin-top: 30px;">Shipping Address</h2>
            <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px;">
              <p style="margin: 5px 0;">${order.customer.name}</p>
              <p style="margin: 5px 0;">${order.customer.address.street}</p>
              <p style="margin: 5px 0;">${order.customer.address.city}, ${order.customer.address.state} ${order.customer.address.zipCode}</p>
              <p style="margin: 5px 0;">${order.customer.address.country}</p>
              <p style="margin: 5px 0;"><strong>Phone:</strong> ${order.customer.phone}</p>
            </div>
          </div>

          <div style="text-align: center; color: #6b7280; font-size: 12px; margin-top: 20px;">
            <p>Thank you for shopping with ${catalogue.title}!</p>
            <p>If you have any questions, please contact us.</p>
          </div>
        </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`Order confirmation email sent to ${order.customer.email}`);
  } catch (error) {
    console.error('Error sending order confirmation email:', error);
    // Don't throw error - email failure shouldn't break order creation
  }
};

// Order status update email
export const sendOrderStatusUpdateEmail = async (order, catalogue, oldStatus, newStatus) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.log('Email credentials not configured. Skipping email send.');
      return;
    }

    const transporter = createTransporter();

    const statusMessages = {
      pending: {
        title: 'Order Pending',
        message: 'Your order is awaiting confirmation.',
        color: '#f59e0b'
      },
      confirmed: {
        title: 'Order Confirmed',
        message: 'Your order has been confirmed and will be processed soon.',
        color: '#3b82f6'
      },
      processing: {
        title: 'Order Processing',
        message: 'Your order is currently being prepared for shipment.',
        color: '#3b82f6'
      },
      shipped: {
        title: 'Order Shipped',
        message: 'Great news! Your order has been shipped and is on its way to you.',
        color: '#8b5cf6'
      },
      delivered: {
        title: 'Order Delivered',
        message: 'Your order has been successfully delivered. We hope you enjoy your purchase!',
        color: '#10b981'
      },
      cancelled: {
        title: 'Order Cancelled',
        message: 'Your order has been cancelled. If you have any questions, please contact us.',
        color: '#ef4444'
      }
    };

    const statusInfo = statusMessages[newStatus] || statusMessages.pending;

    const mailOptions = {
      from: `"${catalogue.title}" <${process.env.EMAIL_USER}>`,
      to: order.customer.email,
      subject: `${statusInfo.title} - ${order.orderNumber}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: ${statusInfo.color}; padding: 20px; border-radius: 10px; margin-bottom: 20px; color: white;">
            <h1 style="margin: 0;">${statusInfo.title}</h1>
          </div>

          <div style="background-color: #fff; padding: 20px; border: 1px solid #e5e7eb; border-radius: 10px; margin-bottom: 20px;">
            <p>Dear ${order.customer.name},</p>
            <p>${statusInfo.message}</p>

            <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="margin: 5px 0;"><strong>Order Number:</strong> ${order.orderNumber}</p>
              <p style="margin: 5px 0;"><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
              <p style="margin: 5px 0;"><strong>Total Amount:</strong> ₹${order.total.toFixed(2)}</p>
              <p style="margin: 5px 0;"><strong>Status:</strong> <span style="color: ${statusInfo.color}; font-weight: bold;">${newStatus.toUpperCase()}</span></p>
            </div>

            ${newStatus === 'shipped' ? `
            <div style="background-color: #fef3c7; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #f59e0b;">
              <p style="margin: 0;"><strong>📦 Track Your Package</strong></p>
              <p style="margin: 10px 0 0 0; font-size: 14px;">Your order is on its way! You can expect delivery within 3-5 business days.</p>
            </div>
            ` : ''}

            ${newStatus === 'delivered' ? `
            <div style="background-color: #d1fae5; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #10b981;">
              <p style="margin: 0;"><strong>✅ Delivery Confirmed</strong></p>
              <p style="margin: 10px 0 0 0; font-size: 14px;">We hope you're satisfied with your purchase! If you have any issues, please contact us.</p>
            </div>
            ` : ''}

            <h2 style="color: #1f2937; font-size: 16px; margin-top: 30px;">Order Summary</h2>
            <table style="width: 100%; font-size: 14px; margin-top: 10px;">
              ${order.items.map(item => `
                <tr>
                  <td style="padding: 8px 0;">${item.title} × ${item.quantity}</td>
                  <td style="padding: 8px 0; text-align: right;">₹${item.total.toFixed(2)}</td>
                </tr>
              `).join('')}
              <tr style="border-top: 1px solid #e5e7eb; font-weight: bold;">
                <td style="padding: 10px 0;">Total</td>
                <td style="padding: 10px 0; text-align: right; color: #2563eb;">₹${order.total.toFixed(2)}</td>
              </tr>
            </table>
          </div>

          <div style="text-align: center; color: #6b7280; font-size: 12px; margin-top: 20px;">
            <p>Thank you for shopping with ${catalogue.title}!</p>
            <p>If you have any questions, please contact us.</p>
          </div>
        </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`Order status update email sent to ${order.customer.email}`);
  } catch (error) {
    console.error('Error sending order status update email:', error);
    // Don't throw error - email failure shouldn't break status update
  }
};
