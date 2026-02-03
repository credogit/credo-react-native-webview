/**
 * Credo React Native SDK
 *
 * A React Native SDK for integrating Credo payments into your mobile app.
 *
 * @example
 * ```tsx
 * import { CredoPayment, useCredoPayment } from 'credo-react-native-webview';
 *
 * function PaymentScreen() {
 *   const { visible, openPaymentModal, handleSuccess, handleClose } = useCredoPayment({
 *     onSuccess: (response) => {
 *       console.log('Payment successful:', response);
 *       Alert.alert('Success', 'Payment completed!');
 *     },
 *     onClose: () => {
 *       console.log('Payment modal closed');
 *     },
 *   });
 *
 *   return (
 *     <View>
 *       <Button onPress={openPaymentModal} title="Pay ₦5,000" />
 *
 *       <CredoPayment
 *         publicKey="0PUBxxx-xxx" // Your Credo public key
 *         amount={500000} // Amount in kobo
 *         email="customer@example.com"
 *         visible={visible}
 *         onSuccess={handleSuccess}
 *         onClose={handleClose}
 *       />
 *     </View>
 *   );
 * }
 * ```
 */

// Main component
export { default as CredoPayment } from './CredoPayment';

// Hook
export { default as useCredoPayment } from './useCredoPayment';

// Types
export type {
  CredoPaymentProps,
  CredoPaymentRef,
  TransactionResponse,
  ApiResponse,
  Currency,
  PaymentChannel,
  CustomerMetadata,
} from './types';

// Legacy export for backwards compatibility
export { default as Credo } from './Credo';