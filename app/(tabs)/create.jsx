import {
  KeyboardAvoidingView,
  Text,
  View,
  Platform,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";
import styles from "../../assets/styles/createStyles";
import { Ionicons } from "@expo/vector-icons";
import COLORS from "../../constants/colors";
import { useAuthStore } from "../../store/authStore";

import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { API_URL } from "../../constants/api";

export default function Create() {
  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");
  const [rating, setRating] = useState(3);
  const [image, setImage] = useState(null);
  const [imagebase64, setImageBase64] = useState(null);
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const { token } = useAuthStore();

  const pickImage = async () => {
    try {
      if (Platform.OS !== "web") {
        const { status } =
          await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
          Alert.alert(
            "Permissão negada",
            "Precisamos de acesso à galeria para continuar."
          );
          return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.5,
          base64: true,
        });

        if (!result.canceled) {
          const pickedImage = result.assets[0];
          const fileInfo = await FileSystem.getInfoAsync(pickedImage.uri);

          // Verifica se a imagem é maior que 1MB (1MB = 1 * 1024 * 1024 bytes)
          if (fileInfo.size && fileInfo.size > 1 * 1024 * 1024) {
            Alert.alert(
              "Imagem muito grande",
              "Por favor, selecione uma imagem com menos de 1MB para melhor performance."
            );
            return;
          }

          setImage(pickedImage.uri);
          if (pickedImage.base64) {
            setImageBase64(pickedImage.base64);
          } else {
            const base64 = await FileSystem.readAsStringAsync(pickedImage.uri, {
              encoding: FileSystem.EncodingType.Base64,
            });
            setImageBase64(base64);
          }
        }
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Erro", "Erro ao selecionar a imagem. Tente novamente.");
    }
  };

  const handleSubmit = async () => {
    if (!title || !caption || !imagebase64 || !rating) {
      Alert.alert("Preencha todos os campos");
      return;
    }

    try {
      setLoading(true);

      // Extrai o tipo da imagem de forma segura
      let imageType = "image/jpeg";
      if (image) {
        const match = image.match(/\.(\w+)$/);
        if (match) {
          const ext = match[1].toLowerCase();
          imageType = `image/${ext === "jpg" ? "jpeg" : ext}`;
        }
      }

      const imageDataurl = `data:${imageType};base64,${imagebase64}`;

      // Garante que a URL tenha o formato correto
      const apiUrl = `${API_URL}${API_URL.endsWith("/") ? "" : "/"}posts`;

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          caption,
          rating: rating.toString(),
          image: imageDataurl,
        }),
      });

      if (!response.ok) {
        let errorMessage = "Erro ao enviar a recomendação";
        try {
          const errorData = await response.text();
          if (errorData.startsWith("<")) {
            errorMessage = "Erro no servidor (resposta em HTML)";
          } else {
            const jsonError = JSON.parse(errorData);
            errorMessage = jsonError.message || errorMessage;
          }
        } catch (e) {
          console.error("Error parsing error response:", e);
        }
        throw new Error(`${errorMessage} (Status: ${response.status})`);
      }

      const data = await response.json();
      console.log("Response data:", data);

      Alert.alert("Recomendação enviada com sucesso!");
      setTitle("");
      setCaption("");
      setRating(3);
      setImage(null);
      setImageBase64(null);
      router.push("/(tabs)");
    } catch (error) {
      console.error("Error submitting recommendation:", error);
      Alert.alert(
        "Erro ao enviar",
        error.message ||
          "Ocorreu um erro ao enviar. Verifique sua conexão e tente novamente."
      );
    } finally {
      setLoading(false);
    }
  };

  const renderRatingPicker = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <TouchableOpacity
          key={i}
          onPress={() => setRating(i)}
          style={styles.starButton}
        >
          <Ionicons
            name={i <= rating ? "star" : "star-outline"}
            size={32}
            color={i <= rating ? "#f4b400" : COLORS.textSecondary}
          />
        </TouchableOpacity>
      );
    }
    return <View style={styles.ratingContainer}>{stars}</View>;
  };
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        style={styles.scrollViewStyle}
      >
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.title}>Nova Recomendação</Text>
            <Text style={styles.subtitle}>
              Compartilhe sua experiência com o mundo
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Nome do local</Text>
              <View style={styles.inputContainer}>
                <Ionicons
                  name="location-outline"
                  size={24}
                  color={COLORS.placeholderText}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Ex: mais burguinho"
                  placeholderTextColor={COLORS.placeholderText}
                  value={title}
                  onChangeText={setTitle}
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Avaliação</Text>
              {renderRatingPicker()}
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Imagem do local</Text>
              <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
                {image ? (
                  <Image source={{ uri: image }} style={styles.previewImage} />
                ) : (
                  <View style={styles.placeholderContainer}>
                    <Ionicons
                      name="image-outline"
                      size={40}
                      color={COLORS.textSecondary}
                    />
                    <Text style={styles.placeholderText}>Adicionar Imagem</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Comentário</Text>
              <TextInput
                style={[styles.textArea]}
                placeholder="Ex: O lugar é incrível, a comida é maravilhosa e o atendimento é excelente!"
                placeholderTextColor={COLORS.placeholderText}
                value={caption}
                onChangeText={setCaption}
                multiline
              />
            </View>

            <TouchableOpacity
              style={styles.button}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <>
                  <Ionicons
                    name="cloud-upload-outline"
                    size={20}
                    color={COLORS.white}
                    style={styles.buttonIcon}
                  />
                  <Text style={styles.buttonText}>Enviar</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
