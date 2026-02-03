import React, {
  forwardRef,
  useImperativeHandle,
  useState,
  useCallback,
  useEffect,
} from 'react';
import {
  Modal,
  View,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  TouchableOpacity,
  Text,
  StatusBar,
} from 'react-native';
import { WebView, WebViewNavigation } from 'react-native-webview';
import type { CredoPaymentProps, CredoPaymentRef, TransactionResponse } from './types';

// Credo API endpoints
const DEMO_API_URL = 'https://api.credodemo.com/';
const LIVE_API_URL = 'https://api.credocentral.com/';

/**
 * Generate a unique transaction reference
 */
const generateReference = (): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  return `TXN_${timestamp}_${random}`;
};

/**
 * CredoPayment Component
 */
const CredoPayment = forwardRef<CredoPaymentRef, CredoPaymentProps>(
  (
    {
      publicKey,
      amount,
      email,
      currency = 'NGN',
      reference,
      customerName,
      customerPhone,
      callbackUrl,
      channels,
      metadata,
      paymentLink,
      visible,
      onSuccess,
      onClose,
      onError,
    },
    ref
  ) => {
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [transRef, setTransRef] = useState<string>('');

    // Determine if test or live mode
    const isTestMode = publicKey?.startsWith('0PUB');
    const apiBaseUrl = isTestMode ? DEMO_API_URL : LIVE_API_URL;

    // Initialize payment when visible changes to true
    useEffect(() => {
      if (visible && !showModal) {
        initializePayment();
      } else if (!visible && showModal) {
        setShowModal(false);
        setPaymentUrl(null);
        setError(null);
      }
    }, [visible]);

    useImperativeHandle(ref, () => ({
      open: () => initializePayment(),
      close: () => handleClose(),
    }));

    const initializePayment = async () => {
      setIsLoading(true);
      setError(null);
      setShowModal(true);

      // If paymentLink is provided, use it directly
      if (paymentLink) {
        setPaymentUrl(paymentLink);
        setIsLoading(false);
        return;
      }

      // Validate inputs
      if (!publicKey || publicKey.length < 20) {
        setError('Invalid public key. Get your key from credocentral.com');
        setIsLoading(false);
        return;
      }

      if (!email || !email.includes('@')) {
        setError('Valid email address is required');
        setIsLoading(false);
        return;
      }

      if (!amount || amount <= 0) {
        setError('Valid amount is required');
        setIsLoading(false);
        return;
      }

      const txnRef = reference || generateReference();
      setTransRef(txnRef);

      try {
        const payload: any = {
          amount,
          currency,
          email,
          reference: txnRef,
        };

        if (customerName) payload.customerName = customerName;
        if (customerPhone) payload.customerPhone = customerPhone;
        // Always set a callback URL so we can detect payment completion
        payload.callbackUrl = callbackUrl || 'https://credo-payment-callback.app/verify';
        if (channels && channels.length > 0) payload.channels = channels;
        if (metadata) payload.metadata = metadata;

        console.log('Initializing Credo payment:', payload);

        const apiUrl = `${apiBaseUrl}transaction/initialize`;
        console.log('Calling Credo API:', apiUrl);

        // Add timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);

        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': publicKey,
          },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        const responseText = await response.text();
        console.log('Credo API raw response:', responseText);

        let data;
        try {
          data = JSON.parse(responseText);
        } catch (parseErr) {
          console.error('Failed to parse response:', responseText.substring(0, 200));
          throw new Error('Invalid response from payment server');
        }

        console.log('Credo API response:', data);

        if (data.status === 200 && data.data?.authorizationUrl) {
          setPaymentUrl(data.data.authorizationUrl);
          setTransRef(data.data.transRef || txnRef);
        } else {
          const errorMsg = data.message || data.error || 'Failed to initialize payment';
          setError(errorMsg);
          if (onError) onError(new Error(errorMsg));
        }
      } catch (err: any) {
        console.error('Credo API error:', err);
        const errorMsg = err.message || 'Network error. Please try again.';
        setError(errorMsg);
        if (onError) onError(new Error(errorMsg));
      } finally {
        setIsLoading(false);
      }
    };

    const handleClose = useCallback(() => {
      setShowModal(false);
      setPaymentUrl(null);
      setError(null);
      onClose();
    }, [onClose]);

    const handleNavigationChange = useCallback(
      (navState: WebViewNavigation) => {
        const { url } = navState;
        console.log('Navigation:', url);

        // Default callback URL we set
        const defaultCallback = 'https://credo-payment-callback.app/verify';

        // Check if redirected to callback URL (payment flow completed)
        if (
          url.startsWith(defaultCallback) ||
          (callbackUrl && url.startsWith(callbackUrl))
        ) {
          // Extract transRef from URL if present
          let urlTransRef = transRef;
          try {
            const urlParams = new URL(url).searchParams;
            urlTransRef = urlParams.get('transRef') || urlParams.get('reference') || transRef;
          } catch (e) {
            console.log('Could not parse URL params:', e);
          }

          // Close modal and call onSuccess - verification happens on app side
          setShowModal(false);
          setPaymentUrl(null);

          onSuccess({
            transRef: urlTransRef,
            status: 'pending', // App should verify actual status
            amount: amount,
            currency: currency,
          } as TransactionResponse);
        }
        // Check for close/cancel
        else if (url.toLowerCase().includes('cancel') || url.toLowerCase().includes('close')) {
          handleClose();
        }
      },
      [transRef, amount, currency, callbackUrl, onSuccess, handleClose]
    );

    if (!showModal) {
      return null;
    }

    return (
      <Modal
        visible={showModal}
        animationType="slide"
        transparent={false}
        onRequestClose={handleClose}
      >
        <SafeAreaView style={styles.container}>
          <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" />

          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Secure Payment</Text>
            <View style={styles.placeholder} />
          </View>

          {/* Content */}
          {error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorIcon}>⚠️</Text>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={initializePayment}>
                <Text style={styles.retryText}>Try Again</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          ) : paymentUrl ? (
            <>
              <WebView
                source={{ uri: paymentUrl }}
                style={styles.webview}
                onNavigationStateChange={handleNavigationChange}
                onLoadEnd={() => setIsLoading(false)}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                sharedCookiesEnabled={true}
                thirdPartyCookiesEnabled={true}
              />
              {isLoading && (
                <View style={styles.webviewLoading}>
                  <ActivityIndicator size="large" color="#fff" />
                  <Text style={styles.loadingText}>Loading payment page...</Text>
                </View>
              )}
            </>
          ) : (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#fff" />
              <Text style={styles.loadingText}>Initializing payment...</Text>
            </View>
          )}
        </SafeAreaView>
      </Modal>
    );
  }
);

CredoPayment.displayName = 'CredoPayment';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#1a1a2e',
    borderBottomWidth: 1,
    borderBottomColor: '#2d2d44',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#fff',
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    fontSize: 22,
    color: '#fff',
  },
  placeholder: {
    width: 40,
  },
  webview: {
    flex: 1,
    backgroundColor: '#fff',
  },
  webviewLoading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#1a1a2e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#fff',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#ff6b6b',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 8,
    marginBottom: 12,
  },
  retryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    paddingVertical: 14,
    paddingHorizontal: 32,
  },
  cancelText: {
    color: '#888',
    fontSize: 16,
  },
});

export default CredoPayment;