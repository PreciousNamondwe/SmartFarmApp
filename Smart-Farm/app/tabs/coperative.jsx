import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  Modal,
  ScrollView,
  ImageBackground
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

const Coperative = () => {
  // State Management
  const [searchQuery, setSearchQuery] = useState('');
  const [cooperativeName, setCooperativeName] = useState('');
  const [cooperativeDesc, setCooperativeDesc] = useState('');
  const [cooperativeImage, setCooperativeImage] = useState(null);
  const [cooperatives, setCooperatives] = useState([]);
  const [userCooperatives, setUserCooperatives] = useState([]);
  const [joinRequests, setJoinRequests] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [chatModalVisible, setChatModalVisible] = useState(false);
  const [selectedCooperative, setSelectedCooperative] = useState(null);
  const [chatMessages, setChatMessages] = useState({});
  const [newMessage, setNewMessage] = useState('');
  const flatListRef = useRef(null);

  // Sample retailer data with background images
  const recommendedRetailers = [
    {
      id: '1',
      name: 'Shoprite',
      image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da',
      type: 'Supermarket'
    },
    {
      id: '2',
      name: 'Ekhaya',
      image: 'https://images.unsplash.com/photo-1556740738-b6a63e27c4df',
      type: 'Convenience Store'
    },
    {
      id: '3',
      name: 'Chipiku',
      image: 'https://images.unsplash.com/photo-1602488283247-29bf1f5b148a',
      type: 'Mini-mart'
    },
    {
      id: '4',
      name: 'Sana',
      image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da',
      type: 'Department Store'
    },
  ];

  // Load data from AsyncStorage
  useEffect(() => {
    const loadData = async () => {
      try {
        const storedData = await AsyncStorage.multiGet([
          'cooperatives',
          'userCooperatives',
          'joinRequests',
          'chatMessages'
        ]);
        
        if (storedData[0][1]) setCooperatives(JSON.parse(storedData[0][1]));
        if (storedData[1][1]) setUserCooperatives(JSON.parse(storedData[1][1]));
        if (storedData[2][1]) setJoinRequests(JSON.parse(storedData[2][1]));
        if (storedData[3][1]) setChatMessages(JSON.parse(storedData[3][1]));
      } catch (error) {
        Alert.alert('Error', 'Failed to load data.');
      }
    };
    loadData();
  }, []);

  // Save data to AsyncStorage
  useEffect(() => {
    AsyncStorage.multiSet([
      ['cooperatives', JSON.stringify(cooperatives)],
      ['userCooperatives', JSON.stringify(userCooperatives)],
      ['joinRequests', JSON.stringify(joinRequests)],
      ['chatMessages', JSON.stringify(chatMessages)]
    ]).catch(() => Alert.alert('Error', 'Failed to save data.'));
  }, [cooperatives, userCooperatives, joinRequests, chatMessages]);

  // Image Picker
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setCooperativeImage(result.assets[0].uri);
    }
  };

  // Cooperative Creation
  const createCooperative = async () => {
    if (!cooperativeName || !cooperativeDesc) {
      Alert.alert('Error', 'Name and description are required');
      return;
    }

    const newCooperative = {
      id: Date.now().toString(),
      name: cooperativeName,
      description: cooperativeDesc,
      image: cooperativeImage,
      createdAt: new Date().toISOString(),
      createdBy: 'You',
    };

    setCooperatives([...cooperatives, newCooperative]);
    setUserCooperatives([...userCooperatives, newCooperative]);
    resetCooperativeForm();
  };

  const resetCooperativeForm = () => {
    setCooperativeName('');
    setCooperativeDesc('');
    setCooperativeImage(null);
    setModalVisible(false);
  };

  // Cooperative Deletion
  const deleteCooperative = (id) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure?',
      [
        { text: 'Cancel' },
        {
          text: 'Delete',
          onPress: () => {
            setCooperatives(cooperatives.filter(c => c.id !== id));
            setUserCooperatives(userCooperatives.filter(c => c.id !== id));
          }
        }
      ]
    );
  };

  // Join Request Handling
  const requestJoin = (cooperative) => {
    if (userCooperatives.some(c => c.id === cooperative.id)) {
      Alert.alert('Already a member');
      return;
    }

    setJoinRequests([...joinRequests, {
      id: Date.now().toString(),
      cooperativeId: cooperative.id,
      cooperativeName: cooperative.name,
      status: 'pending',
    }]);
  };

  // Chat Functions
  const sendMessage = () => {
    if (!newMessage.trim()) return;

    const message = {
      id: Date.now().toString(),
      text: newMessage,
      sender: 'You',
      timestamp: new Date().toISOString(),
    };

    setChatMessages(prev => ({
      ...prev,
      [selectedCooperative.id]: [...(prev[selectedCooperative.id] || []), message]
    }));
    setNewMessage('');
  };

  // Render Components
  const renderRetailerCard = ({ item }) => (
    <TouchableOpacity style={styles.retailerCard}>
      <ImageBackground
        source={{ uri: item.image }}
        style={styles.retailerBackground}
        imageStyle={styles.retailerImageStyle}
      >
        <View style={styles.retailerOverlay} />
        <View style={styles.bagIconContainer}>
          <Ionicons name="bag-handle-outline" size={20} color="#fff" />
        </View>
        <View style={styles.retailerInfo}>
          <Text style={styles.retailerName}>{item.name}</Text>
          <Text style={styles.retailerType}>{item.type}</Text>
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );

  const renderCooperative = ({ item }) => {
    const isMember = userCooperatives.some(c => c.id === item.id);
    const hasPendingRequest = joinRequests.some(req => 
      req.cooperativeId === item.id && req.status === 'pending'
    );

    return (
      <TouchableOpacity
        style={styles.feedItem}
        onPress={() => isMember && setSelectedCooperative(item) && setChatModalVisible(true)}
        onLongPress={() => isMember && deleteCooperative(item.id)}
      >
        {item.image ? (
          <Image source={{ uri: item.image }} style={styles.avatarImage} />
        ) : (
          <View style={styles.avatar}>
            <Ionicons name="people" size={24} color="#fff" />
          </View>
        )}
        <View style={styles.feedInfo}>
          <Text style={styles.feedName}>{item.name}</Text>
          <Text numberOfLines={1} style={styles.feedDesc}>{item.description}</Text>
          {!isMember && !hasPendingRequest && (
            <TouchableOpacity 
              style={styles.joinButton} 
              onPress={() => requestJoin(item)}
            >
              <Text style={styles.joinText}>Join</Text>
            </TouchableOpacity>
          )}
          {hasPendingRequest && <Text style={styles.pendingText}>Pending</Text>}
        </View>
      </TouchableOpacity>
    );
  };

  const renderChatMessage = ({ item }) => (
    <View style={[
      styles.chatMessage, 
      item.sender === 'You' ? styles.userMessage : styles.otherMessage
    ]}>
      <Text style={styles.chatText}>{item.text}</Text>
      <Text style={styles.chatTime}>
        {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </Text>
    </View>
  );

  return (
    <ScrollView>
      <View style={styles.container}>
      {/* Main Screen */}
      {chatModalVisible ? (
        <View style={styles.chatContainer}>
          <View style={styles.chatHeader}>
            <TouchableOpacity onPress={() => setChatModalVisible(false)}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.chatTitle}>{selectedCooperative?.name}</Text>
          </View>

          <FlatList
            ref={flatListRef}
            data={chatMessages[selectedCooperative?.id] || []}
            keyExtractor={(item) => item.id}
            renderItem={renderChatMessage}
            contentContainerStyle={styles.chatContent}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
          />

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.chatInput}
              placeholder="Type a message..."
              value={newMessage}
              onChangeText={setNewMessage}
              onSubmitEditing={sendMessage}
            />
            <TouchableOpacity onPress={sendMessage}>
              <Ionicons name="send" size={24} color="green" />
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <>
          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Search Bar */}
            <View style={styles.searchBar}>
              <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search for community"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            {/* Recommended Retailers */}
            <Text style={styles.sectionTitle}>Recommended Retailers</Text>
            <FlatList
              horizontal
              data={recommendedRetailers}
              renderItem={renderRetailerCard}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.retailerList}
              showsHorizontalScrollIndicator={false}
            />

            {/* All Cooperatives */}
            <Text style={styles.sectionTitle}>All Cooperatives</Text>
            <FlatList
              data={cooperatives}
              renderItem={renderCooperative}
              keyExtractor={item => item.id}
              ListEmptyComponent={
                <Text style={styles.emptyText}>No cooperatives yet</Text>
              }
              scrollEnabled={false}
            />

            {/* Your Cooperatives */}
            <Text style={styles.sectionTitle}>Your Cooperatives</Text>
            <FlatList
              data={userCooperatives}
              renderItem={renderCooperative}
              keyExtractor={item => item.id}
              ListEmptyComponent={
                <Text style={styles.emptyText}>Join a cooperative to start</Text>
              }
              scrollEnabled={false}
            />
          </ScrollView>

          {/* Create Cooperative FAB */}
          <TouchableOpacity 
            style={styles.fab} 
            onPress={() => setModalVisible(true)}
          >
            <Ionicons name="add" size={30} color="#fff" />
          </TouchableOpacity>

          {/* Create Cooperative Modal */}
          <Modal
            visible={modalVisible}
            animationType="slide"
            transparent={true}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Create Cooperative</Text>
                
                <TextInput
                  placeholder="Name"
                  value={cooperativeName}
                  onChangeText={setCooperativeName}
                  style={styles.input}
                />

                <TextInput
                  placeholder="Description"
                  value={cooperativeDesc}
                  onChangeText={setCooperativeDesc}
                  style={styles.input}
                  multiline
                />

                <Button 
                  title="Add Image" 
                  onPress={pickImage} 
                  color="green"
                />

                <View style={styles.modalButtons}>
                  <Button 
                    title="Create" 
                    onPress={createCooperative} 
                    color="green"
                  />
                  <Button 
                    title="Cancel" 
                    onPress={resetCooperativeForm} 
                  />
                </View>
              </View>
            </View>
          </Modal>
        </>
      )}
    </View>
    </ScrollView>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 10,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 5,
    margin: 15,
    marginTop: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 40,
    color: '#333',
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 15,
    marginBottom: 10,
    color: '#333',
  },
  retailerList: {
    paddingHorizontal: 10,
    paddingBottom: 10,
  },
  retailerCard: {
    width: 160,
    height: 220,
    borderRadius: 15,
    marginRight: 15,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  retailerBackground: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  retailerImageStyle: {
    borderRadius: 15,
  },
  retailerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  bagIconContainer: {
    position: 'absolute',
    top: 15,
    left: 15,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  retailerInfo: {
    padding: 15,
  },
  retailerName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  retailerType: {
    color: '#fff',
    fontSize: 14,
    opacity: 0.9,
  },
  feedItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 15,
    marginHorizontal: 15,
    marginVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'green',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  avatarImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  feedInfo: {
    flex: 1,
  },
  feedName: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#333',
  },
  feedDesc: {
    color: '#666',
    marginTop: 4,
    fontSize: 14,
  },
  joinButton: {
    backgroundColor: 'green',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 15,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  joinText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  pendingText: {
    color: 'orange',
    marginTop: 8,
    fontSize: 12,
    fontWeight: 'bold',
  },
  fab: {
    position: 'absolute',
    right: 25,
    bottom: 25,
    backgroundColor: 'green',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    margin: 20,
    padding: 20,
    borderRadius: 15,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 15,
    marginBottom: 15,
    borderRadius: 10,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  chatContainer: {
    flex: 1,
    backgroundColor: '#ece5dd',
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: 'green',
    elevation: 3,
  },
  chatTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 15,
  },
  chatContent: {
    padding: 15,
  },
  chatMessage: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#dcf8c6',
    borderTopRightRadius: 0,
  },
  otherMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    borderTopLeftRadius: 0,
  },
  chatText: {
    fontSize: 16,
    color: '#333',
  },
  chatTime: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#fff',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  chatInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    fontSize: 16,
    maxHeight: 100,
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    margin: 30,
    fontSize: 16,
  },
});

export default Coperative;