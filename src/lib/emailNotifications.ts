import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface OrderStatusEmailData {
  customerName: string;
  customerEmail: string;
  orderNumber: string;
  orderStatus: string;
  paymentStatus: string;
  bankTransferStatus?: string;
  adminNotes?: string;
  totalAmount: number;
  items: Array<{
    serviceTitle: string;
    optionTitle?: string;
    quantity: number;
    totalPrice: number;
  }>;
}

export async function sendOrderStatusEmail(data: OrderStatusEmailData) {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.warn('RESEND_API_KEY not configured, skipping email notification');
      return { success: false, error: 'Email service not configured' };
    }

    const { customerName, customerEmail, orderNumber, orderStatus, paymentStatus, bankTransferStatus, adminNotes, totalAmount, items } = data;

    // Determine email subject and content based on status
    let subject = '';
    let content = '';

    if (orderStatus === 'CONFIRMED' && paymentStatus === 'PAID') {
      subject = `تم تأكيد طلبك #${orderNumber}`;
      content = `
        <h2>مرحباً ${customerName}،</h2>
        <p>نود إعلامك بأن طلبك رقم <strong>${orderNumber}</strong> قد تم تأكيده بنجاح.</p>
        <p>سيتم البدء في تنفيذ طلبك قريباً.</p>
      `;
    } else if (orderStatus === 'CANCELLED') {
      subject = `تم إلغاء طلبك #${orderNumber}`;
      content = `
        <h2>مرحباً ${customerName}،</h2>
        <p>نأسف لإعلامك بأن طلبك رقم <strong>${orderNumber}</strong> قد تم إلغاؤه.</p>
        ${adminNotes ? `<p><strong>السبب:</strong> ${adminNotes}</p>` : ''}
      `;
    } else if (bankTransferStatus === 'APPROVED') {
      subject = `تم قبول التحويل البنكي لطلبك #${orderNumber}`;
      content = `
        <h2>مرحباً ${customerName}،</h2>
        <p>نود إعلامك بأن التحويل البنكي لطلبك رقم <strong>${orderNumber}</strong> قد تم قبوله.</p>
        <p>سيتم البدء في تنفيذ طلبك قريباً.</p>
      `;
    } else if (bankTransferStatus === 'REJECTED') {
      subject = `تم رفض التحويل البنكي لطلبك #${orderNumber}`;
      content = `
        <h2>مرحباً ${customerName}،</h2>
        <p>نأسف لإعلامك بأن التحويل البنكي لطلبك رقم <strong>${orderNumber}</strong> قد تم رفضه.</p>
        ${adminNotes ? `<p><strong>السبب:</strong> ${adminNotes}</p>` : ''}
        <p>يرجى التواصل معنا إذا كان لديك أي استفسارات.</p>
      `;
    } else {
      subject = `تحديث حالة طلبك #${orderNumber}`;
      content = `
        <h2>مرحباً ${customerName}،</h2>
        <p>تم تحديث حالة طلبك رقم <strong>${orderNumber}</strong>.</p>
        <p><strong>حالة الطلب:</strong> ${orderStatus}</p>
        <p><strong>حالة الدفع:</strong> ${paymentStatus}</p>
        ${bankTransferStatus ? `<p><strong>حالة التحويل البنكي:</strong> ${bankTransferStatus}</p>` : ''}
      `;
    }

    // Add order details
    content += `
      <h3>تفاصيل الطلب:</h3>
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <thead>
          <tr style="background-color: #f8f9fa;">
            <th style="border: 1px solid #dee2e6; padding: 12px; text-align: right;">الخدمة</th>
            <th style="border: 1px solid #dee2e6; padding: 12px; text-align: right;">الكمية</th>
            <th style="border: 1px solid #dee2e6; padding: 12px; text-align: right;">السعر</th>
          </tr>
        </thead>
        <tbody>
    `;

    items.forEach(item => {
      content += `
        <tr>
          <td style="border: 1px solid #dee2e6; padding: 12px; text-align: right;">
            ${item.serviceTitle}
            ${item.optionTitle ? `<br><small>${item.optionTitle}</small>` : ''}
          </td>
          <td style="border: 1px solid #dee2e6; padding: 12px; text-align: right;">${item.quantity}</td>
          <td style="border: 1px solid #dee2e6; padding: 12px; text-align: right;">${item.totalPrice.toFixed(2)} ريال</td>
        </tr>
      `;
    });

    content += `
        </tbody>
        <tfoot>
          <tr style="background-color: #f8f9fa; font-weight: bold;">
            <td colspan="2" style="border: 1px solid #dee2e6; padding: 12px; text-align: right;">المجموع</td>
            <td style="border: 1px solid #dee2e6; padding: 12px; text-align: right;">${totalAmount.toFixed(2)} ريال</td>
          </tr>
        </tfoot>
      </table>
      
      <p>يمكنك تتبع حالة طلبك من خلال <a href="${process.env.NEXT_PUBLIC_BASE_URL}/orders/${orderNumber}">هذا الرابط</a>.</p>
      
      <p>شكراً لاختيارك خدماتنا!</p>
      <p>فريق SmoothFlow</p>
    `;

    const { data: emailData, error } = await resend.emails.send({
      from: 'SmoothFlow <noreply@smoothflow-sa.com>',
      to: [customerEmail],
      subject: subject,
      html: content,
    });

    if (error) {
      console.error('Email sending error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data: emailData };
  } catch (error) {
    console.error('Email notification error:', error);
    return { success: false, error: 'Failed to send email notification' };
  }
}