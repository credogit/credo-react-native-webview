import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';

// Import from library
import { CredoPayment } from 'credo-react-native-webview';

const App = () => {
  const [count, setCount] = useState(0);
  const [showPayment, setShowPayment] = useState(false);

  const handleSuccess = (response: any) => {
    console.log('Payment Success:', response);
    Alert.alert('Success!', `Transaction completed`);
    setShowPayment(false);
  };

  const handleClose = () => {
    console.log('Payment closed');
    setShowPayment(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.content}>
        <Text style={styles.title}>Credo SDK Demo</Text>

        {/* Test counter */}
        <Text style={styles.counter}>Count: {count}</Text>
        <Pressable
          style={styles.testButton}
          onPress={() => setCount(c => c + 1)}
        >
          <Text style={styles.buttonText}>Test +1</Text>
        </Pressable>

        <View style={styles.divider} />

        {/* Payment button */}
        <Pressable
          style={styles.payButton}
          onPress={() => setShowPayment(true)}
        >
          <Text style={styles.buttonText}>Pay ₦3,500</Text>
        </Pressable>

        {/* Credo Payment Component */}
        <CredoPayment
          publicKey="0PUB0123v80AzP7kLEP2EQUGjG82Fz17"
          amount={350000}
          email="test@example.com"
          currency="NGN"
          visible={showPayment}
          onSuccess={handleSuccess}
          onClose={handleClose}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  counter: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  testButton: {
    backgroundColor: '#666',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  divider: {
    height: 1,
    width: '80%',
    backgroundColor: '#ddd',
    marginVertical: 40,
  },
  payButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default App;