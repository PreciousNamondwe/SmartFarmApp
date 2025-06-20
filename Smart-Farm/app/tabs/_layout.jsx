import React, { useState, useEffect } from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View, TouchableOpacity, Modal, StyleSheet, Text, Pressable, Image, TextInput, Button, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';

const Layout = () => {
  const [menuVisible, setMenuVisible] = useState(false);
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [userData, setUserData] = useState(null);
  const [updatedUsername, setUpdatedUsername] = useState('');
  const [updatedPhoneNumber, setUpdatedPhoneNumber] = useState('');
  const [updatedProfilePhoto, setUpdatedProfilePhoto] = useState(null);

  // Fetch user data from AsyncStorage on mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const storedData = await AsyncStorage.getItem('userData');
        if (storedData) {
          const parsedData = JSON.parse(storedData);
          setUserData(parsedData);
          setUpdatedUsername(parsedData.username);
          setUpdatedPhoneNumber(''); // Phone number not stored in plain text, so leave blank
          setUpdatedProfilePhoto(parsedData.profilePhoto);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };
    fetchUserData();
  }, []);

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

  const toggleMenu = () => {
    setMenuVisible(!menuVisible);
  };

  const toggleProfileModal = () => {
    setProfileModalVisible(!profileModalVisible);
  };

  // Pick new profile photo
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setUpdatedProfilePhoto(result.assets[0].uri);
    }
  };

  // Update profile data
  const updateProfile = async () => {
    if (!updatedUsername || !updatedProfilePhoto) {
      Alert.alert('Error', 'Username and profile photo are required.');
      return;
    }

    try {
      const newUserData = {
        ...userData,
        username: updatedUsername,
        profilePhoto: updatedProfilePhoto,
      };

      await AsyncStorage.setItem('userData', JSON.stringify(newUserData));
      setUserData(newUserData);
      setProfileModalVisible(false);
      Alert.alert('Success', 'Profile updated successfully.');
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile.');
      console.error(error);
    }
  };

  // Logout and break session
  const logout = async () => {
    try {
      await AsyncStorage.removeItem('userData');
      router.replace('/login');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return (
    <>
      <Tabs
        screenOptions={{
          headerStyle: {
            backgroundColor: 'green',
          },
          headerTitleAlign: 'left',
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontSize: 20,
            fontWeight: 'bold',
          },
          headerTopInsetEnabled: true,
          tabBarStyle: {
            backgroundColor: 'green',
            position: 'absolute',
            marginHorizontal: 0,
            marginBottom: 0,
            height: 70,
            shadowColor: '#000',
            shadowOpacity: 0.1,
            shadowOffset: { width: 0, height: 4 },
            elevation: 4,
          },
          tabBarShowLabel: true,
          tabBarActiveTintColor: 'yellow',
          tabBarInactiveTintColor: '#fff',
          tabBarIconStyle: {
            justifyContent: 'center',
            alignItems: 'center',
            height: 40,
            marginBottom: 1,
            fontWeight: 'bold',
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            headerShown: true,
            title: '',
            tabBarLabel: 'Home',
            headerLeft: () => (
              <TouchableOpacity style={{ marginLeft: 15 }} onPress={toggleMenu}>
                <Ionicons name="menu-outline" size={30} color="#fff" />
              </TouchableOpacity>
            ),
            headerRight: () => (
              <TouchableOpacity style={{ marginRight: 20 }} onPress={() => console.log('Notification button pressed')}>
                <Ionicons name="notifications-outline" size={25} color="#fff" />
              </TouchableOpacity>
            ),
            tabBarIcon: ({ color }) => (
              <Ionicons name="home-outline" color={color} size={25} />
            ),
          }}
        />

        <Tabs.Screen
          name="coperative"
          options={{
            title: 'Cooperative',
            tabBarIcon: ({ color }) => (
              <Ionicons name="person-add-outline" color={color} size={25} />
            ),
            headerShown: true,
          }}
        />

        <Tabs.Screen
          name="digonise"
          options={{
            title: 'AI Assistant',
            tabBarIcon: ({ color }) => (
              <Ionicons name="scan-outline" color={color} size={25} />
            ),
            headerShown: true,
          }}
        />
      </Tabs>

      {/* Slide-in Menu Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={menuVisible}
        onRequestClose={toggleMenu}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.menuContainer}>
            {/* Profile Photo and Name */}
            <TouchableOpacity style={styles.profileSection} onPress={toggleProfileModal}>
              {userData?.profilePhoto ? (
                <Image source={{ uri: userData.profilePhoto }} style={styles.profilePhoto} />
              ) : (
                <Ionicons name="person-circle-outline" size={60} color="#075E54" />
              )}
              <Text style={styles.profileName}>{userData?.username || 'User'}</Text>
            </TouchableOpacity>

            {/* Menu Items */}
            <TouchableOpacity style={styles.menuItem} onPress={() => console.log('Settings pressed')}>
              <Ionicons name="settings-outline" size={24} color="#075E54" />
              <Text style={styles.menuItemText}>Settings</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={() => console.log('Privacy pressed')}>
              <Ionicons name="lock-closed-outline" size={24} color="#075E54" />
              <Text style={styles.menuItemText}>Privacy</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={logout}>
              <Ionicons name="log-out-outline" size={24} color="#075E54" />
              <Text style={styles.menuItemText}>Logout</Text>
            </TouchableOpacity>
          </View>
          <Pressable style={styles.modalBackdrop} onPress={toggleMenu} />
        </View>
      </Modal>

      {/* Profile Edit Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={profileModalVisible}
        onRequestClose={toggleProfileModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.profileModalContainer}>
            <Text style={styles.modalTitle}>Edit Profile</Text>
            <TextInput
              style={styles.input}
              placeholder="Username"
              value={updatedUsername}
              onChangeText={setUpdatedUsername}
            />
            <TextInput
              style={styles.input}
              placeholder="Phone Number (cannot change)"
              value={updatedPhoneNumber}
              editable={false}
            />
            <Button title="Pick Profile Photo" onPress={pickImage} color="green" />
            {updatedProfilePhoto && <Image source={{ uri: updatedProfilePhoto }} style={styles.profilePhotoPreview} />}
            <View style={styles.modalButtons}>
              <Button title="Update" onPress={updateProfile} color="green" />
              <Button title="Cancel" onPress={toggleProfileModal} color="#888" />
            </View>
          </View>
          <Pressable style={styles.modalBackdrop} onPress={toggleProfileModal} />
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    flexDirection: 'row',
  },
  menuContainer: {
    width: '70%',
    backgroundColor: '#fff',
    paddingTop: 40,
    paddingHorizontal: 20,
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 2, height: 0 },
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  profilePhoto: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
  },
  profileName: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#333',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  menuItemText: {
    fontSize: 18,
    marginLeft: 15,
    color: '#333',
  },
  modalBackdrop: {
    flex: 1,
  },
  profileModalContainer: {
    width: '80%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#075E54',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
    backgroundColor: '#fff',
  },
  profilePhotoPreview: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignSelf: 'center',
    marginVertical: 10,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
});

export default Layout;