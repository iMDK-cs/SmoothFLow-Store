import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

interface OrderStatusEmailData {
  customerName: string;
  customerEmail: string;
  orderNumber: string;
  orderStatus: string;
  paymentStatus: string;
  paymentMethod?: string;
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

interface SupportTicketEmailData {
  customerName: string;
  customerEmail: string;
  ticketId: string;
  subject: string;
  message: string;
  priority: string;
  adminEmail?: string;
}

export async function sendSupportTicketEmail(data: SupportTicketEmailData) {
  try {
    if (!process.env.RESEND_API_KEY || !resend) {
      console.log('RESEND_API_KEY not configured, skipping support email notification');
      return { success: true, error: 'Email service not configured - notification skipped' };
    }

    const { customerName, customerEmail, ticketId, subject, message, priority, adminEmail } = data;

    // Email to customer
    const customerSubject = `تم استلام طلب الدعم الفني #${ticketId}`;
    const customerContent = `
      <h2>مرحباً ${customerName}،</h2>
      <p>شكراً لك! تم استلام طلب الدعم الفني رقم <strong>${ticketId}</strong> بنجاح.</p>
      <p>نحن نعمل على مراجعة طلبك وسنتواصل معك قريباً.</p>
      
      <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #007bff; margin-top: 0;">تفاصيل الطلب:</h3>
        <p><strong>رقم الطلب:</strong> ${ticketId}</p>
        <p><strong>الموضوع:</strong> ${subject}</p>
        <p><strong>الأولوية:</strong> ${priority}</p>
        <p><strong>الرسالة:</strong></p>
        <div style="background-color: white; padding: 10px; border-radius: 4px; border-right: 4px solid #007bff;">
          ${message.replace(/\n/g, '<br>')}
        </div>
      </div>
      
      <p>سيتم الرد على طلبك خلال 24 ساعة.</p>
      <p>شكراً لاختيارك خدماتنا!</p>
      <p>فريق SmoothFlow</p>
    `;

    // Email to admin
    const adminSubject = `طلب دعم فني جديد #${ticketId} - ${subject}`;
    const adminContent = `
      <h2>طلب دعم فني جديد</h2>
      <p>تم استلام طلب دعم فني جديد من العميل.</p>
      
      <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #dc3545; margin-top: 0;">تفاصيل الطلب:</h3>
        <p><strong>رقم الطلب:</strong> ${ticketId}</p>
        <p><strong>اسم العميل:</strong> ${customerName}</p>
        <p><strong>إيميل العميل:</strong> ${customerEmail}</p>
        <p><strong>الموضوع:</strong> ${subject}</p>
        <p><strong>الأولوية:</strong> ${priority}</p>
        <p><strong>الرسالة:</strong></p>
        <div style="background-color: white; padding: 10px; border-radius: 4px; border-right: 4px solid #dc3545;">
          ${message.replace(/\n/g, '<br>')}
        </div>
      </div>
      
      <p>يرجى الرد على طلب الدعم من خلال لوحة الإدارة.</p>
      <p>فريق SmoothFlow</p>
    `;

    const results = [];

    // Send email to customer
    if (resend) {
      const { data: customerEmailData, error: customerError } = await resend.emails.send({
        from: 'SmoothFlow Support <support@smoothflow-sa.com>',
        to: [customerEmail],
        subject: customerSubject,
        html: customerContent,
      });

      if (customerError) {
        console.error('Customer email sending error:', customerError);
        results.push({ success: false, type: 'customer', error: customerError.message });
      } else {
        results.push({ success: true, type: 'customer', data: customerEmailData });
      }
    }

    // Send email to admin
    if (resend && adminEmail) {
      const { data: adminEmailData, error: adminError } = await resend.emails.send({
        from: 'SmoothFlow Support <support@smoothflow-sa.com>',
        to: [adminEmail],
        subject: adminSubject,
        html: adminContent,
      });

      if (adminError) {
        console.error('Admin email sending error:', adminError);
        results.push({ success: false, type: 'admin', error: adminError.message });
      } else {
        results.push({ success: true, type: 'admin', data: adminEmailData });
      }
    }

    return { success: true, results };
  } catch (error) {
    console.error('Support email notification error:', error);
    return { success: false, error: 'Failed to send support email notification' };
  }
}

export async function sendOrderStatusEmail(data: OrderStatusEmailData) {
  try {
    if (!process.env.RESEND_API_KEY || !resend) {
      console.log('RESEND_API_KEY not configured, skipping email notification');
      return { success: true, error: 'Email service not configured - notification skipped' };
    }

    const { customerName, customerEmail, orderNumber, orderStatus, paymentStatus, paymentMethod, bankTransferStatus, adminNotes, totalAmount, items } = data;

    // Determine email subject and content based on status
    let subject = '';
    let content = '';

    if (orderStatus === 'PENDING' && paymentStatus === 'PENDING') {
      subject = `تم استلام طلبك #${orderNumber}`;
      content = `
        <h2>مرحباً ${customerName}،</h2>
        <p>شكراً لك! تم استلام طلبك رقم <strong>${orderNumber}</strong> بنجاح.</p>
        <p>نحن نعمل على مراجعة طلبك وسنتواصل معك قريباً لتأكيد التفاصيل.</p>
        ${paymentMethod === 'bank_transfer' ? `
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #007bff; margin-top: 0;">معلومات التحويل البنكي:</h3>
            <p><strong>اسم صاحب الحساب:</strong> محمد عبدالله صالح الدخيلي</p>
            <p><strong>IBAN:</strong> SA23 8000 0499 6080 1600 4598</p>
            <p><strong>رقم الحساب:</strong> 499000010006086004598</p>
            <p><strong>المبلغ:</strong> ${totalAmount.toFixed(2)} ريال</p>
            <p style="color: #dc3545; font-weight: bold;">يرجى تحويل المبلغ ورفع إيصال التحويل من خلال رابط تتبع الطلب أدناه.</p>
          </div>
        ` : ''}
      `;
    } else if (orderStatus === 'PENDING_ADMIN_APPROVAL' && bankTransferStatus === 'PENDING_ADMIN_APPROVAL') {
      subject = `طلبك #${orderNumber} في انتظار موافقة الإدارة`;
      content = `
        <h2>مرحباً ${customerName}،</h2>
        <p>تم استلام إيصال التحويل البنكي لطلبك رقم <strong>${orderNumber}</strong>.</p>
        <p>نحن نراجع إيصال التحويل حالياً وسنتواصل معك خلال 24 ساعة لتأكيد أو رفض الطلب.</p>
        <p>يمكنك تتبع حالة طلبك من خلال الرابط أدناه.</p>
      `;
    } else if (orderStatus === 'CONFIRMED' && paymentStatus === 'PAID') {
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

    if (!resend) {
      console.warn('Resend not initialized, skipping email');
      return { success: true, error: 'Email service not configured' };
    }

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