import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  SafeAreaView,
} from 'react-native';

const { width } = Dimensions.get('window');

// Sample data for banner images
const banners = [
  { id: '1', image: 'https://cdn.pixabay.com/photo/2017/08/14/17/12/cows-2641195_640.jpg', text: 'Discover Quality Livestock' },
  { id: '2', image: 'https://cdn.pixabay.com/photo/2016/09/23/20/36/corn-1690387_640.jpg', text: 'Fresh Farm Produce for You' },
  { id: '3', image: 'https://cdn.pixabay.com/photo/2014/07/06/17/20/tractor-385681_1280.jpg', text: 'Modern Farming Equipment' },
];

// Sample data for products
const products = [
  { id: '1', category: 'Farm Produce', name: 'Tomatoes', price: 'K2,000/kg', image: 'https://cdn.pixabay.com/photo/2022/09/17/13/54/cocktail-tomatoes-7461032_640.jpg' },
  { id: '2', category: 'Farm Produce', name: 'Corn', price: 'K1,500/kg', image: 'https://cdn.pixabay.com/photo/2020/09/23/19/55/corn-5596907_640.jpg' },
  { id: '3', category: 'Farm Produce', name: 'Potatoes', price: 'K1,000/kg', image: 'https://cdn.pixabay.com/photo/2015/10/07/13/02/vegetables-976165_640.jpg' },
  { id: '4', category: 'Machinery Lending', name: 'Tractor', price: 'K50,000/day', image: 'https://cdn.pixabay.com/photo/2018/05/02/20/36/fendt-3369617_640.jpg' },
  { id: '5', category: 'Machinery Lending', name: 'Harvester', price: 'K70,000/day', image: 'https://cdn.pixabay.com/photo/2023/01/24/17/36/combine-harvester-7741710_640.jpg' },
  { id: '6', category: 'Machinery Lending', name: 'Plough', price: 'K150,000/day', image: 'https://cdn.pixabay.com/photo/2018/11/23/13/19/tractor-3833885_640.jpg' },

  { id: '7', category: 'Fertilizers', name: 'Urea Fertilizer', price: 'K80,000/bag', image: 'https://cdn.shopify.com/s/files/1/0334/6835/0595/products/81NZGluvgXL_1024x1024@2x.jpg?v=1582119687' },
  { id: '8', category: 'Fertilizers', name: 'Compost', price: 'K100,000/bag', image: 'https://th.bing.com/th/id/OIP.1-QKTlJC40zgI-80ZHEuBAHaJu?pid=ImgDet&w=191&h=250&c=7' },
  { id: '9', category: 'Fertilizers', name: 'Phosphate Fertilizer', price: 'K94,000/bag', image: 'https://th.bing.com/th?q=Fertilizer+with+Nitrate+and+Phosphate&w=120&h=120&c=1&rs=1&qlt=90&cb=1&pid=InlineBlock&mkt=en-WW&cc=MW&setlang=en&adlt=moderate&t=1&mw=247' },
];

const FarmPage = () => {
  const scrollRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-scroll logic for the banners
  useEffect(() => {
    const interval = setInterval(() => {
      const nextIndex = (currentIndex + 1) % banners.length;
      scrollRef.current?.scrollTo({ x: nextIndex * width, animated: true });
      setCurrentIndex(nextIndex);
    }, 6000); // Change every 3 seconds
    return () => clearInterval(interval);
  }, [currentIndex]);

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.productContainer}>
      <Image source={{ uri: item.image }} style={styles.productImage} />
      <Text style={styles.productName}>{item.name}</Text>
      <Text style={styles.productPrice}>{item.price}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Auto-scrolling banner */}
        <View style={styles.bannerContainer}>
           <ScrollView
            ref={scrollRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            style={styles.bannerScrollView}
          >
            {banners.map((banner) => (
              <View key={banner.id} style={styles.bannerSlide}>
                <Image source={{ uri: banner.image }} style={styles.bannerImage} />
                {/* Overlay with specific text */}
                <View style={styles.overlay}>
                  <Text style={styles.overlayText}>{banner.text}</Text>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>


        {/* Categories and FlatList */}
        <View style={styles.listContainer}>
          {/* Farm Produce */}
          <Text style={styles.categoryTitle}>Farm Produce</Text>
          <FlatList
            data={products.filter((item) => item.category === 'Farm Produce')}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
          />

          {/* Machinery Lending */}
          <Text style={styles.categoryTitle}>Machinery</Text>
          <FlatList
            data={products.filter((item) => item.category === 'Machinery Lending')}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
          />
          <Text style={styles.categoryTitle}>Fertilizer</Text>
          <FlatList
            data={products.filter((item) => item.category === 'Fertilizers')}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
          />

        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default FarmPage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    marginBottom:66,
  },
  bannerContainer: {
    width: '100%',
    height: 200,
  },
  bannerScrollView: {
    width: '100%',
    height: '100%',
  },
  bannerImage: {
    width: width,
    height: '100%',
    resizeMode: 'cover',
  },
  listContainer: {
    flex: 1,
    padding: 8,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
    color: '#333',
  },
  productContainer: {
    backgroundColor: '#f9f9f9',
    padding: 10,
    marginRight: 15,
    alignItems: 'center',
    width: 105,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
  },
  productImage: {
    width: 105,
    height: 120,
    marginBottom: 5,
    borderRadius: 5,
  },
  productName: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
  },
  productPrice: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
    textAlign: 'center',
  },
  overlay: {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: 'rgba(0, 0, 0, 0.4)', // Semi-transparent black overlay
},
overlayText: {
  color: '#fff',
  fontSize: 20,
  fontWeight: 'bold',
  textAlign: 'center',
},
bannerSlide: {
  width: width,
  height: '100%',
  position: 'relative', // Required for absolute positioning of overlay
},

});
