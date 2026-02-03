# react-native-credo-payment

A React Native SDK for integrating [Credo](https://credocentral.com) payment gateway into your mobile applications.

## Installation

```bash
npm install react-native-credo-payment react-native-webview
# or
yarn add react-native-credo-payment react-native-webview
```

### iOS Setup

```bash
cd ios && pod install
```

## Usage

### Basic Example

```tsx
import React, { useState } from 'react';
import { View, Button, Alert } from 'react-native';
import { CredoPayment } from 'react-native-credo-payment';

const PaymentScreen = () => {
  const [showPayment, setShowPayment] = useState(false);

  const handleSuccess = (response) => {
    console.log('Payment successful:', response);
    Alert.alert('Success', 'Payment completed!');
    setShowPayment(false);
  };

  const handleClose = () => {
    console.log('Payment closed');
    setShowPayment(false);
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 20 }}>
      <Button title="Pay ₦5,000" onPress={() => setShowPayment(true)} />

      <CredoPayment
        publicKey="0PUBxxxxxxxxxxxxxxxxxxxxxxxx"
        amount={500000} // Amount in kobo (₦5,000)
        email="customer@example.com"
        currency="NGN"
        callbackUrl="https://your-website.com/payment/callback"
        visible={showPayment}
        onSuccess={handleSuccess}
        onClose={handleClose}
      />
    </View>
  );
};

export default PaymentScreen;
```

### Using the Hook

```tsx
import React from 'react';
import { View, Button } from 'react-native';
import { CredoPayment, useCredoPayment } from 'react-native-credo-payment';

const PaymentScreen = () => {
  const {
    visible,
    openPaymentModal,
    handleSuccess,
    handleClose,
  } = useCredoPayment({
    onSuccess: (response) => {
      console.log('Payment successful:', response);
    },
    onClose: () => {
      console.log('Payment modal closed');
    },
  });

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 20 }}>
      <Button title="Pay Now" onPress={openPaymentModal} />

      <CredoPayment
        publicKey="0PUBxxxxxxxxxxxxxxxxxxxxxxxx"
        amount={500000}
        email="customer@example.com"
        callbackUrl="https://your-website.com/payment/callback"
        visible={visible}
        onSuccess={handleSuccess}
        onClose={handleClose}
      />
    </View>
  );
};
```

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `publicKey` | `string` | Yes | Your Credo public key (starts with `0PUB` for test, `1PUB` for live) |
| `amount` | `number` | Yes | Amount in the smallest currency unit (e.g., kobo for NGN) |
| `email` | `string` | Yes | Customer's email address |
| `visible` | `boolean` | Yes | Controls the visibility of the payment modal |
| `onSuccess` | `(response) => void` | Yes | Callback when payment is successful |
| `onClose` | `() => void` | Yes | Callback when the payment modal is closed |
| `currency` | `string` | No | Currency code (default: `'NGN'`). Supported: `NGN`, `USD`, `GHS`, `ZAR` |
| `reference` | `string` | No | Unique transaction reference (auto-generated if not provided) |
| `customerName` | `string` | No | Customer's full name |
| `customerPhone` | `string` | No | Customer's phone number |
| `channels` | `string[]` | No | Payment channels to enable: `['card', 'bank', 'ussd', 'qr']` |
| `metadata` | `object` | No | Additional data to attach to the transaction |
| `onError` | `(error) => void` | No | Callback when an error occurs |
| `paymentLink` | `string` | No | Direct payment link (bypasses initialization) |
| `callbackUrl` | `string` | Yes* | URL where Credo redirects after payment. The SDK detects this redirect to close the modal and trigger `onSuccess`. *Required for payment completion detection. |

## Response Object

The `onSuccess` callback receives a response object:

```typescript
{
  transRef: string;    // Transaction reference
  status: string;      // Status will be 'pending' - verify on your server
  amount: number;      // Amount charged
  currency: string;    // Currency code
}
```

## Payment Flow

1. User initiates payment
2. SDK opens modal and loads Credo payment page
3. User completes payment on the Credo page
4. Credo redirects to your `callbackUrl`
5. SDK detects the redirect, closes modal, and calls `onSuccess` with `transRef`
6. **Important**: Your app should verify the transaction status on your backend using the `transRef`

### Verify Transaction API

**Endpoint:** `GET https://api.credocentral.com/transaction/{transRef}/verify`

> For test mode, use: `https://api.credodemo.com/transaction/{transRef}/verify`

```typescript
// Example: Verify transaction on your backend
const handleSuccess = async (response) => {
  const { transRef } = response;

  // Call your backend to verify the transaction
  const result = await fetch(`https://your-api.com/verify-payment/${transRef}`);
  const data = await result.json();

  if (data.status === 'successful') {
    // Payment confirmed - grant access, show success screen, etc.
  }
};
```

Your backend should call the Credo verify endpoint with your **private/secret key** (not the public key) in the `Authorization` header:

```javascript
// Backend example (Node.js)
const verifyTransaction = async (transRef) => {
  const response = await fetch(
    `https://api.credocentral.com/transaction/${transRef}/verify`,
    {
      headers: {
        'Authorization': 'YOUR_SECRET_KEY', // e.g., 0SEC... (test) or 1SEC... (live)
      },
    }
  );
  return response.json();
};
```

## Test vs Live Mode

- **Test Mode**: Use public keys starting with `0PUB` (uses `api.credodemo.com`)
- **Live Mode**: Use public keys starting with `1PUB` (uses `api.credocentral.com`)

Get your API keys from [credocentral.com](https://credocentral.com)

## Requirements

- React Native >= 0.65.0
- react-native-webview >= 11.0.0

## License

MIT

## Support

For issues and feature requests, please [open an issue](https://github.com/credogit/credo-react-native-webview/issues) on GitHub.

For Credo-specific questions, contact [hello@credocentral.com](mailto:hello@credocentral.com)