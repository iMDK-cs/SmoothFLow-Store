// Paymob API Integration Service
export interface PaymobConfig {
  apiToken: string;
  secretKey: string;
  publicKey: string;
  baseUrl: string;
}

export interface PaymobOrderRequest {
  auth_token: string;
  delivery_needed: boolean;
  amount_cents: number;
  currency: string;
  merchant_order_id: string;
  items: Array<{
    name: string;
    amount_cents: number;
    description: string;
    quantity: number;
  }>;
  shipping_data?: {
    first_name: string;
    last_name: string;
    phone_number: string;
    email: string;
    street: string;
    city: string;
    country: string;
  };
}

export interface PaymobOrderResponse {
  id: number;
  created_at: string;
  delivery_needed: boolean;
  merchant: {
    id: number;
    created_at: string;
    phones: string[];
    company_emails: string[];
    company_name: string;
    state: string;
    country: string;
    city: string;
    postal_code: string;
    street: string;
  };
  collector: unknown;
  currency: string;
  is_payment_locked: boolean;
  is_return: boolean;
  is_cancel: boolean;
  is_returned: boolean;
  is_canceled: boolean;
  merchant_staff_tag: unknown;
  api_source: string;
  order_url: string;
  commission_fees: number;
  delivery_fees: number;
  delivery_vat_cents: number;
  payment_method: string;
  wallet_notify: string;
  paid_amount_cents: number;
  notify_merchant: boolean;
  shipping_data: unknown;
  shipping_details: unknown;
  pickup_data: unknown;
  delivery_status: string;
  delivery_time: number;
  data: unknown;
  token: string;
  url: string;
}

export interface PaymobPaymentKeyRequest {
  auth_token: string;
  amount_cents: number;
  expiration: number;
  order_id: number;
  billing_data: {
    first_name: string;
    last_name: string;
    phone_number: string;
    email: string;
    street: string;
    city: string;
    country: string;
    zip_code: string;
  };
  currency: string;
  integration_id: number;
  lock_order_when_paid: boolean;
}

export interface PaymobPaymentKeyResponse {
  token: string;
  iframe_url: string;
}

export interface PaymobTransaction {
  id: number;
  pending: boolean;
  amount_cents: number;
  currency: string;
  success: boolean;
  is_auth: boolean;
  is_capture: boolean;
  is_voided: boolean;
  is_refunded: boolean;
  is_3d_secure: boolean;
  integration_id: number;
  profile_id: number;
  has_parent_transaction: boolean;
  order: {
    id: number;
    created_at: string;
    delivery_needed: boolean;
    merchant: unknown;
    collector: unknown;
    amount_cents: number;
    currency: string;
    merchant_order_id: string;
    is_payment_locked: boolean;
    is_return: boolean;
    is_cancel: boolean;
    is_returned: boolean;
    is_canceled: boolean;
    wallet_notify: string;
    paid_amount_cents: number;
    notify_merchant: boolean;
    order_url: string;
    commission_fees: number;
    delivery_fees: number;
    delivery_vat_cents: number;
    payment_method: string;
    merchant_staff_tag: unknown;
    api_source: string;
    data: unknown;
    token: string;
    url: string;
  };
  created_at: string;
  transaction_processed_callback_responses: unknown[];
  amount: number;
  shipping_company: string;
  shipping_method: string;
  paid_amount: number;
  is_void: boolean;
  is_refund: boolean;
  data: unknown;
  error_occured: boolean;
  is_live: boolean;
  other_endpoint_reference: unknown;
  refunded_amount_cents: number;
  source_id: number;
  payment_key_claims: unknown;
}

class PaymobService {
  private config: PaymobConfig;
  private authToken: string | null = null;

  constructor() {
    this.config = {
      apiToken: process.env.PAYMOB_API_TOKEN || '',
      secretKey: process.env.PAYMOB_SECRET_KEY || '',
      publicKey: process.env.PAYMOB_PUBLIC_KEY || '',
      baseUrl: 'https://accept.paymob.com/api'
    };
  }

  // Step 1: Authentication
  async authenticate(): Promise<string> {
    try {
      const response = await fetch(`${this.config.baseUrl}/auth/tokens`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          api_key: this.config.apiToken
        })
      });

      if (!response.ok) {
        throw new Error(`Authentication failed: ${response.statusText}`);
      }

      const data = await response.json();
      this.authToken = data.token;
      return data.token;
    } catch (error) {
      console.error('Paymob authentication error:', error);
      throw new Error('Failed to authenticate with Paymob');
    }
  }

  // Step 2: Create Order
  async createOrder(orderData: PaymobOrderRequest): Promise<PaymobOrderResponse> {
    try {
      if (!this.authToken) {
        await this.authenticate();
      }

      const response = await fetch(`${this.config.baseUrl}/ecommerce/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...orderData,
          auth_token: this.authToken
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Order creation failed: ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Paymob order creation error:', error);
      throw new Error('Failed to create Paymob order');
    }
  }

  // Step 3: Generate Payment Key
  async generatePaymentKey(paymentData: PaymobPaymentKeyRequest): Promise<PaymobPaymentKeyResponse> {
    try {
      if (!this.authToken) {
        await this.authenticate();
      }

      const response = await fetch(`${this.config.baseUrl}/acceptance/payment_keys`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...paymentData,
          auth_token: this.authToken
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Payment key generation failed: ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Paymob payment key generation error:', error);
      throw new Error('Failed to generate payment key');
    }
  }

  // Get Transaction Details
  async getTransaction(transactionId: string): Promise<PaymobTransaction> {
    try {
      if (!this.authToken) {
        await this.authenticate();
      }

      const response = await fetch(`${this.config.baseUrl}/acceptance/transactions/${transactionId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.authToken}`
        }
      });

      if (!response.ok) {
        throw new Error(`Transaction fetch failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Paymob transaction fetch error:', error);
      throw new Error('Failed to fetch transaction details');
    }
  }

  // Verify Webhook Signature
  verifyWebhookSignature(payload: string, signature: string): boolean {
    try {
      // Use dynamic import for Node.js crypto module
      const crypto = eval('require')('crypto');
      const hmac = crypto.createHmac('sha512', this.config.secretKey);
      hmac.update(payload);
      const calculatedSignature = hmac.digest('hex');
      return calculatedSignature === signature;
    } catch (error) {
      console.error('Webhook signature verification error:', error);
      return false;
    }
  }

  // Get iframe URL for payment
  getIframeUrl(paymentKey: string): string {
    return `https://accept.paymob.com/api/acceptance/iframes/3?payment_token=${paymentKey}`;
  }
}

export const paymobService = new PaymobService();