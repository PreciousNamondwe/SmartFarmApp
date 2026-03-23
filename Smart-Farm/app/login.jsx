import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import * as Crypto from 'expo-crypto';

const Login = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [country, setCountry] = useState('');
  const [otp, setOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  // Auto-detect country using location
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is needed to detect your country.');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      let geocode = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (geocode.length > 0) {
        setCountry(geocode[0].country || 'Unknown');
      }
    })();
  }, []);

  // Simulate sending OTP (in a real app, this would use an SMS API over HTTPS)
  const sendOtp = async () => {
    if (!phoneNumber) {
      Alert.alert('Error', 'Please enter a phone number.');
      return;
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
    setGeneratedOtp(otpCode);
    setOtpSent(true);

    // Simulate sending OTP via a secure HTTPS request
    console.log(`Sending OTP ${otpCode} to ${phoneNumber} via secure HTTPS...`);
    Alert.alert('OTP Sent', `Your OTP is ${otpCode} (for demo purposes).`);
  };

  // Verify OTP and log in
  const verifyOtp = async () => {
    if (otp !== generatedOtp) {
      Alert.alert('Error', 'Invalid OTP.');
      return;
    }

    try {
      // Fetch user data from AsyncStorage
      const storedData = await AsyncStorage.getItem('userData');
      if (!storedData) {
        Alert.alert('Error', 'No user found. Please sign up first.');
        return;
      }

      const userData = JSON.parse(storedData);
      // Securely hash the phone number for comparison
      const hashedPhone = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        phoneNumber
      );

      if (userData.hashedPhone !== hashedPhone) {
        Alert.alert('Error', 'Phone number does not match any user.');
        return;
      }

      // Navigate to tabs/index after successful login
      router.replace('/tabs');
    } catch (error) {
      Alert.alert('Error', 'Failed to log in.');
      console.error(error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <Text style={styles.label}>Country: {country || 'Detecting...'}</Text>
      <TextInput
        style={styles.input}
        placeholder="Phone Number"
        keyboardType="phone-pad"
        value={phoneNumber}
        onChangeText={setPhoneNumber}
      />
      {!otpSent ? (
        <Button title="Send OTP" onPress={sendOtp} color="green" />
      ) : (
        <>
          <TextInput
            style={styles.input}
            placeholder="Enter OTP"
            keyboardType="numeric"
            value={otp}
            onChangeText={setOtp}
          />
          <Button title="Verify OTP" onPress={verifyOtp} color="green" />
        </>
      )}
      <Button title="Go to Signup" onPress={() => router.push('/signup')} color="#888" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#f5f5f5' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  label: { fontSize: 16, marginBottom: 10 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, marginBottom: 10, borderRadius: 5, backgroundColor: '#fff' },
});

export default Login;