import nodemailer from 'nodemailer'

// Email configuration
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_SERVER_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
})

export interface EmailTemplate {
  to: string
  subject: string
  html: string
  text?: string
}

export interface OrderConfirmationData {
  orderId: string
  customerName: string
  customerEmail: string
  items: Array<{
    serviceName: string
    quantity: number
    unitPrice: number
    totalPrice: number
  }>
  totalAmount: number
  orderDate: string
  status: string
}

export interface PaymentConfirmationData {
  orderId: string
  customerName: string
  customerEmail: string
  amount: number
  paymentMethod: string
  transactionId: string
  paymentDate: string
}

export interface SupportTicketData {
  ticketId: string
  customerName: string
  customerEmail: string
  subject: string
  message: string
  priority: 'low' | 'medium' | 'high'
  createdAt: string
}

// Email templates
export const emailTemplates = {
  orderConfirmation: (data: OrderConfirmationData): EmailTemplate => ({
    to: data.customerEmail,
    subject: `تأكيد الطلب #${data.orderId} - SmoothFlow`,
    html: `
      <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background: linear-gradient(135deg, #0ea5e9, #3b82f6); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">تأكيد الطلب</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">شكراً لاختيارك SmoothFlow</p>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <div style="margin-bottom: 25px;">
            <h2 style="color: #1f2937; margin-bottom: 15px;">مرحباً ${data.customerName}!</h2>
            <p style="color: #6b7280; line-height: 1.6;">تم استلام طلبك بنجاح وسيتم معالجته في أقرب وقت ممكن.</p>
          </div>
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
            <h3 style="color: #1f2937; margin-bottom: 15px;">تفاصيل الطلب</h3>
            <p><strong>رقم الطلب:</strong> #${data.orderId}</p>
            <p><strong>تاريخ الطلب:</strong> ${data.orderDate}</p>
            <p><strong>الحالة:</strong> ${data.status}</p>
          </div>
          
          <div style="margin-bottom: 25px;">
            <h3 style="color: #1f2937; margin-bottom: 15px;">الخدمات المطلوبة</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="background: #f9fafb;">
                  <th style="padding: 12px; text-align: right; border: 1px solid #e5e7eb;">الخدمة</th>
                  <th style="padding: 12px; text-align: center; border: 1px solid #e5e7eb;">الكمية</th>
                  <th style="padding: 12px; text-align: center; border: 1px solid #e5e7eb;">السعر</th>
                  <th style="padding: 12px; text-align: center; border: 1px solid #e5e7eb;">المجموع</th>
                </tr>
              </thead>
              <tbody>
                ${data.items.map(item => `
                  <tr>
                    <td style="padding: 12px; border: 1px solid #e5e7eb;">${item.serviceName}</td>
                    <td style="padding: 12px; text-align: center; border: 1px solid #e5e7eb;">${item.quantity}</td>
                    <td style="padding: 12px; text-align: center; border: 1px solid #e5e7eb;">${item.unitPrice} ريال</td>
                    <td style="padding: 12px; text-align: center; border: 1px solid #e5e7eb;">${item.totalPrice} ريال</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          
          <div style="background: #0ea5e9; color: white; padding: 20px; border-radius: 8px; text-align: center;">
            <h3 style="margin: 0 0 10px 0;">المبلغ الإجمالي</h3>
            <p style="margin: 0; font-size: 24px; font-weight: bold;">${data.totalAmount} ريال سعودي</p>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
            <p style="color: #6b7280; margin-bottom: 15px;">لأي استفسارات، يرجى التواصل معنا:</p>
            <p style="margin: 5px 0;"><strong>البريد الإلكتروني:</strong> m7md.dk7@gmail.com</p>
            <p style="margin: 5px 0;"><strong>واتساب:</strong> 966543156466</p>
            <p style="margin: 5px 0;"><strong>الموقع:</strong> الرس، المملكة العربية السعودية</p>
          </div>
        </div>
      </div>
    `,
    text: `تأكيد الطلب #${data.orderId}\n\nمرحباً ${data.customerName}!\n\nتم استلام طلبك بنجاح.\n\nتفاصيل الطلب:\nرقم الطلب: #${data.orderId}\nتاريخ الطلب: ${data.orderDate}\nالحالة: ${data.status}\n\nالخدمات:\n${data.items.map(item => `- ${item.serviceName} (${item.quantity}x) = ${item.totalPrice} ريال`).join('\n')}\n\nالمبلغ الإجمالي: ${data.totalAmount} ريال سعودي\n\nشكراً لاختيارك SmoothFlow!`
  }),

  paymentConfirmation: (data: PaymentConfirmationData): EmailTemplate => ({
    to: data.customerEmail,
    subject: `تأكيد الدفع #${data.orderId} - SmoothFlow`,
    html: `
      <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">✅ تم تأكيد الدفع</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">تم استلام دفعتك بنجاح</p>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <div style="margin-bottom: 25px;">
            <h2 style="color: #1f2937; margin-bottom: 15px;">مرحباً ${data.customerName}!</h2>
            <p style="color: #6b7280; line-height: 1.6;">تم تأكيد دفعتك وسيتم البدء في تنفيذ طلبك قريباً.</p>
          </div>
          
          <div style="background: #f0fdf4; border: 1px solid #bbf7d0; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
            <h3 style="color: #166534; margin-bottom: 15px;">تفاصيل الدفع</h3>
            <p><strong>رقم الطلب:</strong> #${data.orderId}</p>
            <p><strong>المبلغ:</strong> ${data.amount} ريال سعودي</p>
            <p><strong>طريقة الدفع:</strong> ${data.paymentMethod}</p>
            <p><strong>رقم المعاملة:</strong> ${data.transactionId}</p>
            <p><strong>تاريخ الدفع:</strong> ${data.paymentDate}</p>
          </div>
          
          <div style="background: #10b981; color: white; padding: 20px; border-radius: 8px; text-align: center;">
            <h3 style="margin: 0 0 10px 0;">🎉 شكراً لك!</h3>
            <p style="margin: 0;">سيتم التواصل معك قريباً لتحديد موعد تنفيذ الخدمة</p>
          </div>
        </div>
      </div>
    `,
    text: `تأكيد الدفع #${data.orderId}\n\nمرحباً ${data.customerName}!\n\nتم تأكيد دفعتك بنجاح.\n\nتفاصيل الدفع:\nرقم الطلب: #${data.orderId}\nالمبلغ: ${data.amount} ريال سعودي\nطريقة الدفع: ${data.paymentMethod}\nرقم المعاملة: ${data.transactionId}\nتاريخ الدفع: ${data.paymentDate}\n\nشكراً لاختيارك SmoothFlow!`
  }),

  supportTicket: (data: SupportTicketData): EmailTemplate => ({
    to: data.customerEmail,
    subject: `تذكرة الدعم #${data.ticketId} - SmoothFlow`,
    html: `
      <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background: linear-gradient(135deg, #8b5cf6, #7c3aed); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">🎫 تذكرة الدعم الفني</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">تم استلام طلبك وسيتم الرد عليك قريباً</p>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <div style="margin-bottom: 25px;">
            <h2 style="color: #1f2937; margin-bottom: 15px;">مرحباً ${data.customerName}!</h2>
            <p style="color: #6b7280; line-height: 1.6;">تم استلام تذكرتك وسيتم الرد عليك في أقرب وقت ممكن.</p>
          </div>
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
            <h3 style="color: #1f2937; margin-bottom: 15px;">تفاصيل التذكرة</h3>
            <p><strong>رقم التذكرة:</strong> #${data.ticketId}</p>
            <p><strong>الموضوع:</strong> ${data.subject}</p>
            <p><strong>الأولوية:</strong> ${data.priority === 'high' ? 'عالية' : data.priority === 'medium' ? 'متوسطة' : 'منخفضة'}</p>
            <p><strong>تاريخ الإنشاء:</strong> ${data.createdAt}</p>
          </div>
          
          <div style="margin-bottom: 25px;">
            <h3 style="color: #1f2937; margin-bottom: 15px;">رسالتك</h3>
            <div style="background: #f9fafb; padding: 15px; border-radius: 8px; border-right: 4px solid #8b5cf6;">
              <p style="margin: 0; color: #374151; line-height: 1.6;">${data.message}</p>
            </div>
          </div>
          
          <div style="background: #8b5cf6; color: white; padding: 20px; border-radius: 8px; text-align: center;">
            <h3 style="margin: 0 0 10px 0;">📞 سنتواصل معك قريباً</h3>
            <p style="margin: 0;">فريق الدعم الفني سيقوم بالرد على تذكرتك في غضون 24 ساعة</p>
          </div>
        </div>
      </div>
    `,
    text: `تذكرة الدعم #${data.ticketId}\n\nمرحباً ${data.customerName}!\n\nتم استلام تذكرتك بنجاح.\n\nتفاصيل التذكرة:\nرقم التذكرة: #${data.ticketId}\nالموضوع: ${data.subject}\nالأولوية: ${data.priority}\nتاريخ الإنشاء: ${data.createdAt}\n\nرسالتك:\n${data.message}\n\nشكراً لاختيارك SmoothFlow!`
  })
}

// Send email function
export async function sendEmail(template: EmailTemplate): Promise<boolean> {
  try {
    if (!process.env.EMAIL_SERVER_USER || !process.env.EMAIL_SERVER_PASSWORD) {
      console.warn('Email configuration not found. Email not sent.')
      return false
    }

    await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_SERVER_USER,
      to: template.to,
      subject: template.subject,
      html: template.html,
      text: template.text,
    })

    console.log(`Email sent successfully to ${template.to}`)
    return true
  } catch (error) {
    console.error('Failed to send email:', error)
    return false
  }
}

// Helper functions for common email types
export async function sendOrderConfirmation(data: OrderConfirmationData): Promise<boolean> {
  const template = emailTemplates.orderConfirmation(data)
  return await sendEmail(template)
}

export async function sendPaymentConfirmation(data: PaymentConfirmationData): Promise<boolean> {
  const template = emailTemplates.paymentConfirmation(data)
  return await sendEmail(template)
}

export async function sendSupportTicket(data: SupportTicketData): Promise<boolean> {
  const template = emailTemplates.supportTicket(data)
  return await sendEmail(template)
}