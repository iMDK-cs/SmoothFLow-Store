import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

interface AdminNotificationData {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  totalAmount: number;
  items: Array<{
    serviceTitle: string;
    optionTitle?: string;
    quantity: number;
    totalPrice: number;
  }>;
  receiptPath: string;
  orderDate: string;
}

export async function sendAdminBankTransferNotification(data: AdminNotificationData) {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.warn('RESEND_API_KEY not configured, skipping admin email notification');
      return { success: true, error: 'Email service not configured - notification skipped' };
    }

    const { orderNumber, customerName, customerEmail, customerPhone, totalAmount, items, receiptPath, orderDate } = data;

    const subject = `🔔 إيصال تحويل بنكي جديد - طلب #${orderNumber}`;
    
    const content = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8f9fa; padding: 20px;">
        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <div style="text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #007bff;">
            <h1 style="color: #007bff; margin: 0; font-size: 24px;">🏦 إيصال تحويل بنكي جديد</h1>
            <p style="color: #666; margin: 10px 0 0 0; font-size: 16px;">طلب رقم: <strong>${orderNumber}</strong></p>
          </div>

          <!-- Customer Info -->
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #333; margin-top: 0; margin-bottom: 15px;">👤 معلومات العميل</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #555;">الاسم:</td>
                <td style="padding: 8px 0; color: #333;">${customerName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #555;">البريد الإلكتروني:</td>
                <td style="padding: 8px 0; color: #333;">${customerEmail}</td>
              </tr>
              ${customerPhone ? `
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #555;">الهاتف:</td>
                  <td style="padding: 8px 0; color: #333;">${customerPhone}</td>
                </tr>
              ` : ''}
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #555;">تاريخ الطلب:</td>
                <td style="padding: 8px 0; color: #333;">${orderDate}</td>
              </tr>
            </table>
          </div>

          <!-- Order Details -->
          <div style="margin-bottom: 20px;">
            <h3 style="color: #333; margin-top: 0; margin-bottom: 15px;">📦 تفاصيل الطلب</h3>
            <table style="width: 100%; border-collapse: collapse; border: 1px solid #ddd;">
              <thead>
                <tr style="background-color: #007bff; color: white;">
                  <th style="padding: 12px; text-align: right; border: 1px solid #ddd;">الخدمة</th>
                  <th style="padding: 12px; text-align: right; border: 1px solid #ddd;">الكمية</th>
                  <th style="padding: 12px; text-align: right; border: 1px solid #ddd;">السعر</th>
                </tr>
              </thead>
              <tbody>
                ${items.map(item => `
                  <tr>
                    <td style="padding: 12px; border: 1px solid #ddd; color: #333;">
                      ${item.serviceTitle}
                      ${item.optionTitle ? `<br><small style="color: #666;">${item.optionTitle}</small>` : ''}
                    </td>
                    <td style="padding: 12px; border: 1px solid #ddd; text-align: center; color: #333;">${item.quantity}</td>
                    <td style="padding: 12px; border: 1px solid #ddd; text-align: right; color: #333;">${item.totalPrice.toFixed(2)} ريال</td>
                  </tr>
                `).join('')}
              </tbody>
              <tfoot>
                <tr style="background-color: #f8f9fa; font-weight: bold;">
                  <td colspan="2" style="padding: 12px; border: 1px solid #ddd; text-align: right; color: #333;">المجموع</td>
                  <td style="padding: 12px; border: 1px solid #ddd; text-align: right; color: #333; font-size: 18px;">${totalAmount.toFixed(2)} ريال</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <!-- Receipt Link -->
          <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; border: 1px solid #ffeaa7; margin-bottom: 20px;">
            <h3 style="color: #856404; margin-top: 0; margin-bottom: 15px;">📄 إيصال التحويل</h3>
            <p style="color: #856404; margin-bottom: 15px;">تم رفع إيصال التحويل البنكي من قبل العميل:</p>
            <a href="${process.env.NEXT_PUBLIC_BASE_URL}${receiptPath}" 
               style="display: inline-block; background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              📎 عرض الإيصال
            </a>
          </div>

          <!-- Action Required -->
          <div style="background-color: #d4edda; padding: 20px; border-radius: 8px; border: 1px solid #c3e6cb;">
            <h3 style="color: #155724; margin-top: 0; margin-bottom: 15px;">⚡ إجراء مطلوب</h3>
            <p style="color: #155724; margin-bottom: 15px;">يرجى مراجعة إيصال التحويل والموافقة على الطلب أو رفضه:</p>
            <a href="${process.env.NEXT_PUBLIC_BASE_URL}/admin-bank-transfers" 
               style="display: inline-block; background-color: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-right: 10px;">
              🔍 مراجعة الطلبات
            </a>
          </div>

          <!-- Footer -->
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 14px;">
            <p>هذا إشعار تلقائي من نظام إدارة طلبات SmoothFlow</p>
            <p>تم إرساله في: ${new Date().toLocaleString('ar-SA')}</p>
          </div>

        </div>
      </div>
    `;

    if (!resend) {
      console.warn('Resend not initialized, skipping admin email');
      return { success: true, error: 'Email service not configured' };
    }

    const { data: emailData, error } = await resend.emails.send({
      from: 'SmoothFlow Admin <admin@smoothflow-sa.com>',
      to: [process.env.ADMIN_EMAIL || 'admin@smoothflow-sa.com'],
      subject: subject,
      html: content,
    });

    if (error) {
      console.error('Admin email sending error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data: emailData };
  } catch (error) {
    console.error('Admin email notification error:', error);
    return { success: false, error: 'Failed to send admin email notification' };
  }
}