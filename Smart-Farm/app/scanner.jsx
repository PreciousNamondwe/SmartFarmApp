import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { GoogleGenerativeAI } from '@google/generative-ai';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Icon from 'react-native-vector-icons/FontAwesome';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

const Scanner = () => {
  const [imageUri, setImageUri] = useState(null);
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [base64Image, setBase64Image] = useState(null);
  const [imageMimeType, setImageMimeType] = useState('image/jpeg');
  const [language, setLanguage] = useState('English');

  const genAI = new GoogleGenerativeAI("AIzaSyDzJVz9KhWc_VE0tWQelHEE8Kk4rbooyE4");
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  // Language translations for section titles
  const translations = {
    English: {
      title: 'PLANT DIAGNOSIS REPORT',
      disease: 'Disease',
      cause: 'Cause',
      effect: 'Effect',
      herbicide: 'Herbicide/Treatment',
      error: 'This image is invalid; it\'s not an agricultural plant.',
    },
    Chichewa: {
      title: 'LIPOTI LA KUZINDIKIRA ZOMERA',
      disease: 'Matenda',
      cause: 'Chifukwa',
      effect: 'Zotsatira',
      herbicide: 'Mankhwala/Treatment',
      error: 'Chithunzi ichi sicholondola; sichiri chomera chaulimi.',
    },
  };

  const fetchImageDescription = async () => {
    if (!base64Image) {
      Alert.alert('Error', translations[language].error);
      return;
    }

    setLoading(true);
    try {
      const prompt = `
        Analyze the provided image of an agricultural plant and return a JSON response in ${language} with the following structure:
        {
          "disease": {
            "main": "Main description of the disease",
            "subPoints": ["Sub-point 1", "Sub-point 2"]
          },
          "cause": {
            "main": "Main cause of the disease",
            "subPoints": ["Sub-point 1", "Sub-point 2"]
          },
          "effect": {
            "main": "Main effect of the disease",
            "subPoints": ["Sub-point 1", "Sub-point 2"]
          },
          "herbicide": {
            "main": "Recommended herbicide or treatment",
            "subPoints": ["Sub-point 1", "Sub-point 2"]
          }
        }
        If the image is not an agricultural plant, return:
        {
          "error": "${translations[language].error}"
        }
        Ensure the response is valid JSON without markdown code blocks or extra characters.
      `;

      const result = await model.generateContent([
        {
          inlineData: {
            data: base64Image,
            mimeType: imageMimeType,
          },
        },
        prompt,
      ]);

      let responseText = result.response.text().trim();
      if (responseText.startsWith('```json')) {
        responseText = responseText.replace(/^```json\n/, '').replace(/\n```$/, '');
      } else if (responseText.startsWith('```')) {
        responseText = responseText.replace(/^```\n/, '').replace(/\n```$/, '');
      }

      console.log('Raw response:', responseText);

      const jsonResponse = JSON.parse(responseText);
      setResponse({
        title: jsonResponse.error ? 'Error' : translations[language].title,
        body: jsonResponse,
        date: new Date().toLocaleDateString(),
      });
    } catch (error) {
      console.error('Error generating image description:', error);
      Alert.alert('Error', `Failed to generate description: ${error.message}`);
      setResponse({
        title: 'Error',
        body: { error: `Failed to generate description: ${error.message}` },
        date: new Date().toLocaleDateString(),
      });
    } finally {
      setLoading(false);
    }
  };

  const selectImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Error', 'Camera roll permissions are required.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      const mimeType = result.assets[0].mimeType || 'image/jpeg';
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      setImageUri(uri);
      setBase64Image(base64);
      setImageMimeType(mimeType);
      Alert.alert('Success', 'Image uploaded successfully.');
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Error', 'Camera permissions are required.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      const mimeType = result.assets[0].mimeType || 'image/jpeg';
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      setImageUri(uri);
      setBase64Image(base64);
      setImageMimeType(mimeType);
      Alert.alert('Success', 'Photo captured successfully.');
    }
  };

  const generatePDF = async () => {
    if (!response || !response.body) {
      Alert.alert('Error', 'No diagnosis report available to download.');
      return;
    }

    try {
      let htmlContent = `
        <html>
          <body style="font-family: Arial, sans-serif; padding: 20px;">
            <h1>${response.title}</h1>
            <p><strong>Date:</strong> ${response.date}</p>
      `;

      if (response.body.error) {
        htmlContent += `<p style="color: red;">${response.body.error}</p>`;
      } else {
        const sections = [
          { title: translations[language].disease, data: response.body.disease },
          { title: translations[language].cause, data: response.body.cause },
          { title: translations[language].effect, data: response.body.effect },
          { title: translations[language].herbicide, data: response.body.herbicide },
        ];

        sections.forEach((section) => {
          htmlContent += `
            <h2>${section.title}</h2>
            <p><strong>${section.data.main}</strong></p>
            <ul style="list-style-type: disc; margin-left: 20px;">
              ${section.data.subPoints.map((point) => `<li>${point}</li>`).join('')}
            </ul>
          `;
        });
      }

      htmlContent += `
          </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({
        html: htmlContent,
        fileName: 'Plant_Diagnosis_Report.pdf',
      });

      await Sharing.shareAsync(uri);
      Alert.alert('Success', 'PDF generated and shared.');
    } catch (error) {
      console.error('Error generating PDF:', error);
      Alert.alert('Error', `Failed to generate PDF: ${error.message}`);
    }
  };

  const renderResponseBody = () => {
    if (!response || !response.body) return null;

    if (response.body.error) {
      return <Text style={styles.errorText}>{response.body.error}</Text>;
    }

    const sections = [
      { title: translations[language].disease, data: response.body.disease },
      { title: translations[language].cause, data: response.body.cause },
      { title: translations[language].effect, data: response.body.effect },
      { title: translations[language].herbicide, data: response.body.herbicide },
    ];

    return sections.map((section, index) => (
      <View key={index} style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>{section.title}</Text>
        <Text style={styles.mainPoint}>{section.data.main}</Text>
        {section.data.subPoints.map((point, idx) => (
          <Text key={idx} style={styles.subPoint}>• {point}</Text>
        ))}
      </View>
    ));
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContainer} style={styles.scrollView}>
        <View style={styles.languageContainer}>
          <View style={styles.languageButtonsContainer}>
            <TouchableOpacity
              style={[styles.languageButton, language === 'English' && styles.selectedLanguage]}
              onPress={() => setLanguage('English')}
              accessibilityLabel="Select English language"
            >
              <Text style={[styles.languageText, language === 'English' && styles.selectedLanguageText]}>
                English
              </Text>
              {language === 'English' && <Icon name="check" size={20} color="#fff" style={styles.checkIcon} />}
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.languageButton, language === 'Chichewa' && styles.selectedLanguage]}
              onPress={() => setLanguage('Chichewa')}
              accessibilityLabel="Select Chichewa language"
            >
              <Text style={[styles.languageText, language === 'Chichewa' && styles.selectedLanguageText]}>
                Chichewa
              </Text>
              {language === 'Chichewa' && <Icon name="check" size={20} color="#fff" style={styles.checkIcon} />}
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.imageContainer}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.image} />
          ) : (
            <Text style={styles.placeholderText}>No Captured or Image Selected</Text>
          )}
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity onPress={takePhoto} style={styles.cameraButton}>
            <MaterialIcons name="camera-alt" size={24} color="#fff" />
            <Text style={styles.cameraButtonText}>Take Photo</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={selectImage} style={styles.uploadButton}>
            <MaterialIcons name="file-upload" size={24} color="#fff" />
            <Text style={styles.uploadButtonText}>Upload Image</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={fetchImageDescription}
          style={[styles.descriptionButton, { backgroundColor: base64Image ? '#28a745' : '#ccc' }]}
          disabled={!base64Image}
        >
          <MaterialIcons name="assignment" size={24} color="#fff" />
          <Text style={styles.descriptionButtonText}>DIAGNOSE</Text>
        </TouchableOpacity>

        {loading && <ActivityIndicator size="large" color="#00ff00" style={styles.loader} />}

        {response && (
          <View style={styles.responseContainer}>
            <Text style={styles.responseText}>
              <MaterialIcons name="assignment" size={24} color="#000" /> {response.title}
            </Text>
            {renderResponseBody()}
            <TouchableOpacity onPress={generatePDF} style={styles.downloadButton}>
              <MaterialIcons name="file-download" size={24} color="#fff" />
              <Text style={styles.downloadButtonText}>Download Report</Text>
            </TouchableOpacity>
          </View>
        )}
        <View style={{ height: 80 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f5f5f5' },
  scrollView: { flex: 1 },
  scrollContainer: { padding: 20, alignItems: 'center' },
  languageContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: 20,
    width: '100%',
  },
  languageLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  languageButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  languageButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginHorizontal: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedLanguage: {
    backgroundColor: 'green',
    borderColor: '#ccc',
  },
  languageText: {
    fontSize: 16,
    color: '#000',
  },
  selectedLanguageText: {
    color: '#fff',
  },
  checkIcon: {
    marginLeft: 5,
  },
  imageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 0,
    borderRadius: 20,
    height: 250,
    width: '100%',
  },
  placeholderText: { color: '#999', fontSize: 16 },
  image: { width: '100%', height: '100%', borderRadius: 20 },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '90%',
    marginBottom: 30,
  },
  cameraButton: {
    backgroundColor: '#6c757d',
    padding: 15,
    borderRadius: 20,
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  uploadButton: {
    backgroundColor: '#6c757d',
    padding: 15,
    borderRadius: 20,
    flex: 1,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  cameraButtonText: { color: '#fff', fontSize: 16, marginLeft: 8 },
  uploadButtonText: { color: '#fff', fontSize: 16, marginLeft: 8 },
  descriptionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    width: '80%',
  },
  descriptionButtonText: { color: '#fff', fontSize: 18, marginLeft: 8 },
  loader: { marginVertical: 20 },
  responseContainer: {
    backgroundColor: '#ddd',
    padding: 20,
    borderRadius: 10,
    width: '100%',
    marginTop: 20,
    elevation: 2,
  },
  responseText: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  sectionContainer: { marginBottom: 15 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 10 },
  mainPoint: { fontSize: 16, fontWeight: 'bold', marginVertical: 5 },
  subPoint: { fontSize: 16, color: '#333', marginLeft: 10, lineHeight: 24 },
  errorText: { fontSize: 16, color: 'red', lineHeight: 24 },
  downloadButton: {
    marginTop: 20,
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  downloadButtonText: { color: '#fff', fontSize: 18, marginLeft: 8 },
});

export default Scanner;