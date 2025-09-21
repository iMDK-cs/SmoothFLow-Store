// Moyasar API Integration Service
export interface MoyasarConfig {
  secretKey: string;
  publishableKey: string;
  baseUrl: string;
}

export interface MoyasarPaymentRequest {
  amount: number;
  currency: string;
  description: string;
  callback_url: string;
  metadata: {
    order_id: string;
  };
}

export interface MoyasarPaymentResponse {
  id: string;
  status: string;
  amount: number;
  currency: string;
  description: string;
  callback_url: string;
  created_at: string;
  updated_at: string;
  metadata: {
    order_id: string;
    customer_name: string;
    customer_email: string;
  };
  source: {
    type: string;
    company: string;
    name: string;
    number: string;
    gateway_id: string;
    reference_number: string;
    token: string;
    message: string;
    transaction_url: string;
  };
}

export interface MoyasarWebhookData {
  id: string;
  status: string;
  amount: number;
  currency: string;
  description: string;
  created_at: string;
  updated_at: string;
  metadata: {
    order_id: string;
    customer_name: string;
    customer_email: string;
  };
  source: {
    type: string;
    company: string;
    name: string;
    number: string;
    gateway_id: string;
    reference_number: string;
    token: string;
    message: string;
    transaction_url: string;
  };
}

class MoyasarService {
  private config: MoyasarConfig;

  constructor() {
    this.config = {
      secretKey: process.env.MOYASAR_SECRET_KEY || '',
      publishableKey: process.env.MOYASAR_PUBLISHABLE_KEY || '',
      baseUrl: 'https://api.moyasar.com/v1'
    };
  }

  // Create payment
  async createPayment(paymentData: MoyasarPaymentRequest): Promise<MoyasarPaymentResponse> {
    try {
      const response = await fetch(`${this.config.baseUrl}/payments`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${Buffer.from(this.config.secretKey + ':').toString('base64')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Moyasar API error: ${errorData.message || response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Moyasar payment creation error:', error);
      throw new Error('Failed to create Moyasar payment');
    }
  }

  // Get payment by ID
  async getPayment(paymentId: string): Promise<MoyasarPaymentResponse> {
    try {
      const response = await fetch(`${this.config.baseUrl}/payments/${paymentId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${Buffer.from(this.config.secretKey + ':').toString('base64')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Moyasar API error: ${errorData.message || response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Moyasar payment fetch error:', error);
      throw new Error('Failed to fetch Moyasar payment');
    }
  }

  // Verify webhook signature
  verifyWebhookSignature(payload: string, signature: string): boolean {
    try {
      const crypto = eval('require')('crypto');
      const expectedSignature = crypto
        .createHmac('sha256', this.config.secretKey)
        .update(payload)
        .digest('hex');
      
      return crypto.timingSafeEqual(
        Buffer.from(signature, 'hex'),
        Buffer.from(expectedSignature, 'hex')
      );
    } catch (error) {
      console.error('Moyasar webhook verification error:', error);
      return false;
    }
  }

  // Get payment URL for frontend
  getPaymentUrl(paymentId: string): string {
    return `https://moyasar.com/pay/${paymentId}`;
  }

  // Create payment session (secure - no card data stored on our server)
  async createPaymentSession(paymentData: MoyasarPaymentRequest): Promise<MoyasarPaymentResponse> {
    try {
      const response = await fetch(`${this.config.baseUrl}/payments`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${Buffer.from(this.config.secretKey + ':').toString('base64')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Moyasar API error: ${errorData.message || response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Moyasar payment session creation error:', error);
      throw new Error('Failed to create Moyasar payment session');
    }
  }
}

export const moyasarService = new MoyasarService();