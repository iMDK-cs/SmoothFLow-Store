// Moyasar API Integration Service
import { Buffer } from 'buffer';
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
        console.error('Moyasar API error response:', errorData);
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
        console.error('Moyasar API error response:', errorData);
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

  // Get payment URL for frontend (redirect to Moyasar checkout page)
  getPaymentUrl(paymentId: string): string {
    return `https://moyasar.com/pay/${paymentId}`;
  }

  // Create payment intent (for redirect to Moyasar checkout)
  async createPaymentIntent(paymentData: MoyasarPaymentRequest): Promise<MoyasarPaymentResponse> {
    try {
      console.log('Creating Moyasar payment intent with data:', paymentData);
      console.log('Using secret key:', this.config.secretKey ? 'Present' : 'Missing');
      
      // Create a payment intent with minimal source - Moyasar will handle the payment form
      const paymentRequest = {
        amount: paymentData.amount,
        currency: paymentData.currency,
        description: paymentData.description,
        callback_url: paymentData.callback_url,
        source: {
          type: 'creditcard',
          name: 'Customer Name', // Placeholder - Moyasar will collect real data
          number: '4111111111111111', // Test card number
          month: 12,
          year: 2025,
          cvc: '123'
        },
        metadata: paymentData.metadata,
      };
      
      const response = await fetch(`${this.config.baseUrl}/payments`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${Buffer.from(this.config.secretKey + ':').toString('base64')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentRequest),
      });

      console.log('Moyasar API response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Moyasar API error response:', errorData);
        throw new Error(`Moyasar API error: ${errorData.message || response.statusText}`);
      }

      const result = await response.json();
      console.log('Moyasar payment intent created successfully:', result);
      return result;
    } catch (error) {
      console.error('Moyasar payment intent creation error:', error);
      throw new Error('Failed to create Moyasar payment intent');
    }
  }
}

export const moyasarService = new MoyasarService();