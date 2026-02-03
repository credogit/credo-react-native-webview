/**
 * Legacy Credo Component
 *
 *
 *
 *
 * @deprecated Use CredoPayment component instead for better features and support.
 *
 * This component is maintained for backwards compatibility only.
 */

import React, { FC, useState, useRef } from 'react';
import { Modal, View, StyleSheet, ActivityIndicator } from 'react-native';
import { WebView, WebViewNavigation } from 'react-native-webview';

/**
 * @deprecated Use CredoPaymentProps from './types' instead
 */
export interface LegacyCredoProps {
  amount: number | string;
  currency?: 'NGN' | 'USD' | 'GHS' | 'ZAR';
  customerEmail: string;
  customerName: string;
  customerPhoneNo: string;
  publicKey: string;
  referenceNo?: string;
  closeModal: () => void;
  onCancel?: (response: any) => void;
  onSuccess: (response: any) => void;
  showModal: boolean;
  handleWebViewMessage?: (data: string) => void;
}

const template = () => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Credo Payment</title>
  <style>
    body { margin: 0; padding: 0; background: transparent; }
  </style>
</head>
<body></body>
</html>
`;

/**
 * @deprecated Use CredoPayment component instead
 */
const Credo: FC<LegacyCredoProps> = ({
  amount,
  currency = 'NGN',
  customerEmail,
  customerName,
  customerPhoneNo,
  publicKey,
  referenceNo,
  closeModal,
  onCancel,
  onSuccess,
  showModal = false,
  handleWebViewMessage,
}) => {
  const [isLoading, setisLoading] = useState(true);
  const webView = useRef(null);

  const refString = referenceNo ? referenceNo : '';

  const runFirst = `
      function loadScript(scriptUrl) {
        const script = document.createElement('script');
        script.src = scriptUrl;
        script.async = true;
        document.body.appendChild(script);
        return new Promise((res, rej) => {
          script.onload = function() {
            res();
          }
          script.onerror = function () {
            rej();
          }
        });
      }

     window.onload = loadScript('https://pay.credocentral.com/inline.js')
        .then(() => {
              var widget = CredoWidget.setup({
                amount: '${amount}',
                reference: '${refString}',
                currency: '${currency}',
                email: '${customerEmail}',
                customerName: '${customerName}',
                customerPhone: '${customerPhoneNo}',
                key: '${publicKey}',
                channels: ["card"],
                callBack: function(response){
                      var resp = {event:'successful', transactionDetails:response};
                        window.ReactNativeWebView.postMessage(JSON.stringify(resp))
                },
                onClose: function(){
                    var resp = {event:'closed'};
                    window.ReactNativeWebView.postMessage(JSON.stringify(resp))
                }
              });
              widget.openIframe();
        })
        .catch(() => {
          console.error('Script loading failed! Handle this error');
        });

    `;

  const messageReceived = (data: string) => {
    const webResponse = JSON.parse(data);
    if (handleWebViewMessage) {
      handleWebViewMessage(data);
    }
    switch (webResponse.event) {
      case 'closed':
        closeModal();
        onCancel && onCancel(webResponse);
        break;

      case 'successful':
        closeModal();
        if (onSuccess) {
          onSuccess(webResponse);
        }
        break;

      default:
        if (handleWebViewMessage) {
          handleWebViewMessage(data);
        }
        break;
    }
  };

  const onNavigationStateChange = (state: WebViewNavigation) => {
    const { url } = state;
    console.log(url);
    console.log(state);
  };

  return (
    <View style={styles.wrapper}>
      <Modal
        style={{ flex: 1 }}
        visible={showModal}
        animationType="slide"
        transparent={true}
      >
        <WebView
          originWhitelist={['*']}
          style={styles.webview}
          source={{ html: template() }}
          onMessage={(e: any) => {
            messageReceived(e.nativeEvent?.data);
          }}
          onLoadStart={() => setisLoading(true)}
          onLoadEnd={() => setisLoading(false)}
          onNavigationStateChange={onNavigationStateChange}
          cacheEnabled={false}
          cacheMode={'LOAD_NO_CACHE'}
          javaScriptEnabled={true}
          injectedJavaScript={runFirst}
          ref={webView}
          containerStyle={styles.webviewContainer}
        />

        {isLoading && (
          <View style={styles.loader}>
            <ActivityIndicator size="large" color="#ffffff" />
          </View>
        )}
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
    zIndex: 5,
  },
  webviewContainer: {
    backgroundColor: 'transparent',
    zIndex: 5,
  },
  loader: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 1,
  },
});

export default Credo;