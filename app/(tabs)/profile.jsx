import {
  Text,
  View,
  Alert,
  FlatList,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuthStore } from "../../store/authStore.js";
import { useState, useEffect } from "react";
import { API_URL } from "../../constants/api.js";
import styles from "../../assets/styles/profileStyles.js";
import { Ionicons } from "@expo/vector-icons";
import COLORS from "../../constants/colors.js";

import LogoutButton from "../../components/LogoutButton";
import ProfileHeader from "../../components/ProfileHeader";
import { Image } from "expo-image";

export default function Profile() {
  const { token } = useAuthStore();
  const [posts, setPosts] = useState([]);
  const [isloading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [editingPost, setEditingPost] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editCaption, setEditCaption] = useState("");
  const [editRating, setEditRating] = useState("");

  const startEditing = (post) => {
    setEditingPost(post);
    setEditTitle(post.title);
    setEditCaption(post.caption);
    setEditRating(String(post.rating));
  };

  const cancelEditing = () => {
    setEditingPost(null);
    setEditTitle("");
    setEditCaption("");
    setEditRating("");
  };

  const submitEdit = async () => {
    try {
      const response = await fetch(`${API_URL}/posts/${editingPost._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: editTitle,
          caption: editCaption,
          rating: Number(editRating),
          image: editingPost.image,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Erro ao atualizar");

      Alert.alert("Sucesso", "Recomendação atualizada!");
      cancelEditing();
      fetchPosts();
    } catch (error) {
      Alert.alert("Erro", error.message || "Erro ao atualizar post.");
    }
  };

  const router = useRouter();

  const fetchPosts = async () => {
    try {
      setIsLoading(true);

      const response = await fetch(`${API_URL}/posts/user`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch posts");
      }
      setPosts(data);
    } catch (error) {
      console.error("Error fetching posts:", error);
      Alert.alert(
        "Error",
        error.message || "Failed to fetch posts. Please try again later."
      );
    }
  };

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

  const confirmDelete = (postId) => {
    Alert.alert(
      "Excluir recomendação",
      "Você tem certeza que deseja excluir esta recomendação?",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Excluir",
          onPress: () => deletePost(postId),
          style: "destructive",
        },
      ],
      { cancelable: true }
    );
  };

  const deletePost = async (postId) => {
    try {
      const response = await fetch(`${API_URL}/posts/${postId}`, {
        method: "DELETE",
        headers: {
          authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to delete post");
      }
      setPosts(posts.filter((post) => post._id !== postId));
      Alert.alert("Sucesso", "Recomendação excluída com sucesso!");
    } catch (error) {
      Alert.alert(
        "Error",
        error.message || "Failed to delete post. Please try again later."
      );
      console.error("Error deleting post:", error);
    }
  };

  const renderPostItem = ({ item }) => (
    <View style={styles.postsItem}>
      <Image
        source={{ uri: item.image }}
        style={styles.postImage}
        contentFit="cover"
      />
      <View style={styles.postInfo}>
        <Text style={styles.postTitle}>{item.title}</Text>
        <View style={styles.ratingContainer}>
          {renderRatingStars(item.rating)}
        </View>
        <Text style={styles.postCaption}>{item.caption}</Text>
        <Text style={styles.postDate}>
          {new Date(item.createdAt).toLocaleDateString()}
        </Text>
      </View>

      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => confirmDelete(item._id)}
      >
        <Ionicons name="trash-outline" size={24} color={COLORS.primary} />
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => startEditing(item)}
      >
        <Ionicons name="create-outline" size={24} color={COLORS.primary} />
      </TouchableOpacity>
    </View>
  );

  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <View style={styles.container}>
      <ProfileHeader />
      <LogoutButton />

      {editingPost && (
        <View style={styles.editContainer}>
          <Text style={styles.editTitle}>Editando: {editingPost.title}</Text>

          <TextInput
            style={styles.input}
            value={editTitle}
            onChangeText={setEditTitle}
            placeholder="Título"
          />

          <TextInput
            style={styles.input}
            value={editCaption}
            onChangeText={setEditCaption}
            placeholder="Legenda"
            multiline
          />

          <View style={[styles.ratingContainer, { justifyContent: "center", marginBottom: 16 }]}>
  {[1, 2, 3, 4, 5].map((star) => (
    <TouchableOpacity key={star} onPress={() => setEditRating(star)}>
      <Ionicons
        name={star <= editRating ? "star" : "star-outline"}
        size={28}
        color={star <= editRating ? "#f4b400" : COLORS.textSecondary}
        style={{ marginHorizontal: 4 }}
      />
    </TouchableOpacity>
  ))}
</View>


          <TouchableOpacity style={styles.saveButton} onPress={submitEdit}>
            <Text style={styles.saveButtonText}>Salvar Alterações</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={cancelEditing}>
            <Text style={styles.cancelText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={posts}
        renderItem={renderPostItem}
        keyExtractor={(item) => item._id}
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        contentContainerStyle={styles.postsList}
        onRefresh={() => {
          setRefreshing(true);
          fetchPosts();
          setRefreshing(false);
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons
              name="sad-outline"
              size={50}
              color={COLORS.textSecondary}
            />

            <Text style={styles.emptyText}>
              Nenhuma recomendação feita ainda
            </Text>

            <TouchableOpacity
              style={styles.addButton}
              onPress={() => router.push("/create")}
            >
              <Text style={styles.addButtonText}>
                Criar minha primeira recomendação
              </Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
}
