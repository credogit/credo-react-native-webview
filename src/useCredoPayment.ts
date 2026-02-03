import { useState, useCallback, useRef } from 'react';
import type { TransactionResponse, CredoPaymentRef } from './types';

export interface UseCredoPaymentOptions {
  /**
   * Called when payment is successful
   */
  onSuccess?: (response: TransactionResponse) => void;

  /**
   * Called when user closes the payment modal
   */
  onClose?: () => void;

  /**
   * Called when an error occurs
   */
  onError?: (error: Error) => void;
}

export interface UseCredoPaymentReturn {
  /**
   * Whether the payment modal is visible
   */
  visible: boolean;

  /**
   * Open the payment modal
   */
  openPaymentModal: () => void;

  /**
   * Close the payment modal
   */
  closePaymentModal: () => void;

  /**
   * Handle successful payment
   */
  handleSuccess: (response: TransactionResponse) => void;

  /**
   * Handle modal close
   */
  handleClose: () => void;

  /**
   * Handle payment error
   */
  handleError: (error: Error) => void;

  /**
   * Ref to attach to CredoPayment component
   */
  ref: React.RefObject<CredoPaymentRef>;
}

/**
 * Hook for managing Credo payment state
 *
 * @example
 * ```tsx
 * const { visible, openPaymentModal, handleSuccess, handleClose } = useCredoPayment({
 *   onSuccess: (response) => console.log('Payment successful:', response),
 *   onClose: () => console.log('Payment closed'),
 * });
 *
 * return (
 *   <>
 *     <Button onPress={openPaymentModal} title="Pay Now" />
 *     <CredoPayment
 *       visible={visible}
 *       onSuccess={handleSuccess}
 *       onClose={handleClose}
 *       {...otherProps}
 *     />
 *   </>
 * );
 * ```
 */
export function useCredoPayment(
  options: UseCredoPaymentOptions = {}
): UseCredoPaymentReturn {
  const { onSuccess, onClose, onError } = options;
  const [visible, setVisible] = useState(false);
  const ref = useRef<CredoPaymentRef>(null);

  const openPaymentModal = useCallback(() => {
    setVisible(true);
  }, []);

  const closePaymentModal = useCallback(() => {
    setVisible(false);
  }, []);

  const handleSuccess = useCallback(
    (response: TransactionResponse) => {
      setVisible(false);
      onSuccess?.(response);
    },
    [onSuccess]
  );

  const handleClose = useCallback(() => {
    setVisible(false);
    onClose?.();
  }, [onClose]);

  const handleError = useCallback(
    (error: Error) => {
      onError?.(error);
    },
    [onError]
  );

  return {
    visible,
    openPaymentModal,
    closePaymentModal,
    handleSuccess,
    handleClose,
    handleError,
    ref,
  };
}

export default useCredoPayment;