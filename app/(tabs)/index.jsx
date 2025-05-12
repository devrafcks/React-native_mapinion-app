import { FlatList, Text, View, Alert, ActivityIndicator } from 'react-native'
import { useAuthStore } from '../../store/authStore.js'
import { useState, useEffect } from 'react'
import styles from '../../assets/styles/homeStyles'
import { API_URL } from '../../constants/api.js';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '../../constants/colors.js';


export default function Home () {
  const { token } = useAuthStore();  
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchPosts = async (pageNumb = 1, refresh = false) => {
    try {
      if (refresh) {
        setRefreshing(true);
      } else if (pageNumb === 1) {
        setLoading(true);
      }
      
      const response = await fetch(`${API_URL}/posts?page=${pageNumb}&limit=3`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch posts');
      }
      
      const receivedPosts = data.posts || data;
      
      setPosts(prevPosts => 
        pageNumb === 1 ? receivedPosts : [...prevPosts, ...receivedPosts]
      );
      
      setHasMore(data.totalPages ? pageNumb < data.totalPages : receivedPosts.length > 0);
      setPage(pageNumb);

    } catch (error) {
      console.error('Error fetching posts:', error);
      Alert.alert('Error', error.message || 'Failed to fetch posts. Please try again later.');
    } finally {
      if (refresh) {
        setRefreshing(false);
      } else {
        setLoading(false);
      }
    }
  }

  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleLoadMore = async () => {
    if (hasMore && !loading ) {
      await sleep(1000); 
      await fetchPosts(page + 1);
    }
  }

  const renderItem = ({ item }) => {
    
    if (!item.user) {
      console.warn('Post without user:', item);
      return null; 
    }
    
    

    return (
      <View style={styles.postCard}>
        <View style={styles.postHeader}>
          <View style={styles.userInfo}>
            <Image 
              source={{ uri: item.user.profilePicture || 'https://via.placeholder.com/150' }} 
              style={styles.avatar} 
            />
            <Text style={styles.username}>
              {item.user.username || 'Usuário desconhecido'}
            </Text>
          </View>
        </View>

        <View style={styles.postImageContainer}>
          <Image 
            source={{ uri: item.image }} 
            style={styles.postImage} 
            contentFit="cover"
          />
        </View>

        <View style={styles.postDetails}>
          <Text style={styles.postTitle}>{item.title}</Text>
          <View style={styles.ratingContainer}>
            {renderRatingStars(item.rating)}
            <Text style={styles.headerSubtitle}>{item.rating}</Text>
          </View>
          <Text style={styles.caption}>{item.caption}</Text>
          <Text style={styles.date}>Publicado em: {new Date(item.createdAt).toLocaleDateString()}</Text>
        </View>
      </View>
    )
  }

  const renderRatingStars = (rating) => {
  const stars = [];
  
  for (let i = 1; i <= 5; i++) {
      stars.push(
        <Ionicons
          key={i}
          name={i <= rating ? "star" : "star-outline"}
          size={16}
          color={i <= rating ? "#f4b400" : COLORS.textSecondary}
          style={{ marginRight: 2 }}
        />
      );
    }

    return stars;
  };

  return (
    <View style={styles.container}>
      <FlatList 
        data={posts}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        refreshing={refreshing}
        onRefresh={() => fetchPosts(1, true)}

        ListHeaderComponent={() => (
          <View style={styles.header}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
            <View style={styles.headerIcon}>
              <Ionicons name="navigate-outline" size={23} color="#4CAF50" />
            </View>
            <Text style={styles.headerTitle}>MAPINION</Text>
          </View>
          <Text style={styles.headerSubtitle}>Explore as recomendações</Text>
        </View>
        )}
        ListEmptyComponent ={ () => (
            <View style={styles.emptyContainer}>
              <Ionicons 
                name="map-outline" 
                size={60} 
                color={COLORS.textSecondary} 
                style={{ marginBottom: 12 }} 
              />
              <Text style={styles.emptyText}>Nenhuma recomendação ainda</Text>
              <Text style={styles.emptySubtext}>Seja o primeiro a compartilhar!</Text>
            </View>
          )}
            ListFooterComponent={
              hasMore && posts.length > 0 ? (
                <ActivityIndicator 
                  style={styles.footerLoader} 
                  size="small" 
                  color={COLORS.primary} 
                />
              ) : null
            }
          />
      </View>
  )
}