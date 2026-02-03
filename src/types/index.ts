/**
 * Credo Payment SDK Type Definitions
 */

/**
 * Supported currencies
 */
export type Currency = 'NGN' | 'USD' | 'GHS' | 'ZAR';

/**
 * Supported payment channels
 */
export type PaymentChannel = 'card' | 'bank' | 'ussd' | 'qr' | 'mobile_money';

/**
 * Transaction response from Credo
 */
export interface TransactionResponse {
  transRef: string;
  status: string;
  amount: number;
  currency: string;
  [key: string]: any;
}

/**
 * API response structure
 */
export interface ApiResponse {
  error: boolean;
  message: string;
  data: {
    authorizationUrl: string;
    transRef: string;
    [key: string]: any;
  };
}

/**
 * Customer metadata
 */
export interface CustomerMetadata {
  [key: string]: string | number | boolean;
}

/**
 * Props for the Credo payment component
 */
export interface CredoPaymentProps {
  /**
   * Your Credo public key (starts with 0PUB for test, 1PUB for live)
   */
  publicKey: string;

  /**
   * Amount to charge (in the smallest currency unit, e.g., kobo for NGN)
   */
  amount: number;

  /**
   * Customer's email address
   */
  email: string;

  /**
   * Currency code (default: NGN)
   */
  currency?: Currency;

  /**
   * Unique transaction reference (auto-generated if not provided)
   */
  reference?: string;

  /**
   * Customer's full name
   */
  customerName?: string;

  /**
   * Customer's phone number
   */
  customerPhone?: string;

  /**
   * URL to redirect to after payment (for redirect flow)
   */
  callbackUrl?: string;

  /**
   * Payment channels to enable
   */
  channels?: PaymentChannel[];

  /**
   * Additional metadata to attach to the transaction
   */
  metadata?: CustomerMetadata;

  /**
   * Direct payment link (if you have one)
   */
  paymentLink?: string;

  /**
   * Whether to show the payment modal
   */
  visible: boolean;

  /**
   * Called when payment is successful
   */
  onSuccess: (response: TransactionResponse) => void;

  /**
   * Called when user closes the payment modal
   */
  onClose: () => void;

  /**
   * Called when an error occurs
   */
  onError?: (error: Error) => void;

  /**
   * Custom loading component
   */
  renderLoading?: () => React.ReactNode;
}

/**
 * Ref methods for imperative control
 */
export interface CredoPaymentRef {
  /**
   * Programmatically open the payment modal
   */
  open: () => void;

  /**
   * Programmatically close the payment modal
   */
  close: () => void;
}