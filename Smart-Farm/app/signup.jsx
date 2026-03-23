import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import * as Crypto from 'expo-crypto';
import { router } from 'expo-router';

const Signup = () => {
  const [username, setUsername] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [country, setCountry] = useState('');
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [otp, setOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  // Request permissions for image picker
  useEffect(() => {
    (async () => {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Denied', 'We need camera roll permissions to select a profile photo.');
        }
      }
    })();
  }, []);

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

  // Pick profile photo
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setProfilePhoto(result.assets[0].uri);
    }
  };

  // Simulate sending OTP
  const sendOtp = async () => {
    if (!username || !phoneNumber || !profilePhoto) {
      Alert.alert('Error', 'Please fill in all fields and select a profile photo.');
      return;
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
    setGeneratedOtp(otpCode);
    setOtpSent(true);

    // Simulate sending OTP via a secure HTTPS request
    console.log(`Sending OTP ${otpCode} to ${phoneNumber} via secure HTTPS...`);
    Alert.alert('OTP Sent', `Your OTP is ${otpCode} (for demo purposes).`);
  };

  // Verify OTP and sign up
  const verifyOtp = async () => {
    if (otp !== generatedOtp) {
      Alert.alert('Error', 'Invalid OTP.');
      return;
    }

    try {
      // Securely hash the phone number before storing
      const hashedPhone = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        phoneNumber
      );

      const userData = {
        username,
        hashedPhone,
        country,
        profilePhoto,
      };

      // Store user data in AsyncStorage
      await AsyncStorage.setItem('userData', JSON.stringify(userData));

      // Navigate to tabs/index after successful signup
      router.replace('/tabs');
    } catch (error) {
      Alert.alert('Error', 'Failed to sign up.');
      console.error(error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Signup</Text>
      <Text style={styles.label}>Country: {country || 'Detecting...'}</Text>
      <TextInput
        style={styles.input}
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        style={styles.input}
        placeholder="Phone Number"
        keyboardType="phone-pad"
        value={phoneNumber}
        onChangeText={setPhoneNumber}
      />
      <Button title="Pick Profile Photo" onPress={pickImage} color="green" />
      {profilePhoto && <Image source={{ uri: profilePhoto }} style={styles.profilePhoto} />}
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
      <Button title="Go to Login" onPress={() => router.push('/login')} color="#888" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#f5f5f5' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  label: { fontSize: 16, marginBottom: 10 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, marginBottom: 10, borderRadius: 5, backgroundColor: '#fff' },
  profilePhoto: { width: 100, height: 100, borderRadius: 50, alignSelf: 'center', marginVertical: 10 },
});

export default Signup;