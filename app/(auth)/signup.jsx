import {
  Text,
  View,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useState } from "react";
import styles from "../../assets/styles/signUpStyles";
import COLORS from "../../constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuthStore } from "../../store/authStore";

export default function SignUp() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const isLoading = useAuthStore((state) => state.isLoading);
  const register = useAuthStore((state) => state.register);

  const handleSignUp = async () => {
    if (!username || !email || !password) {
      Alert.alert("Erro", "Por favor, preencha todos os campos");
      return;
    }

    const result = await register(username, email, password);

    if (result.success) {
      // Limpa os campos
      setUsername("");
      setEmail("");
      setPassword("");

      Alert.alert("Sucesso", "Bem vindo ao Mapinion!", [
        {
          text: "OK",
          onPress: () => router.replace("/(tabs)"), 
        },
      ]);
    } else {
      Alert.alert("Erro", result.message || "Ocorreu um erro no cadastro");
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={50}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={styles.container}>
          <View style={styles.card}>
            <View style={styles.header}>
              <Text style={styles.title}>
                Mapinion{" "}
                <Ionicons
                  name="location-sharp"
                  size={24}
                  color={COLORS.primary}
                />
              </Text>
              <Text style={styles.subtitle}>
                Descubra. Avalie. Compartilhe.
              </Text>
            </View>

            <View style={styles.formContainer}>
              {/* Nome de usuário */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Nome de usuário</Text>
                <View style={styles.inputContainer}>
                  <Ionicons
                    name="person-outline"
                    size={20}
                    color={COLORS.primary}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Digite seu nome de usuário"
                    placeholderTextColor={COLORS.placeholderText}
                    value={username}
                    onChangeText={setUsername}
                  />
                </View>
              </View>

              {/* Email */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email</Text>
                <View style={styles.inputContainer}>
                  <Ionicons
                    name="mail-outline"
                    size={20}
                    color={COLORS.primary}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Digite seu email"
                    placeholderTextColor={COLORS.placeholderText}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
              </View>

              {/* Senha */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Senha</Text>
                <View style={styles.inputContainer}>
                  <Ionicons
                    name="lock-closed-outline"
                    size={20}
                    color={COLORS.primary}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Digite sua senha"
                    placeholderTextColor={COLORS.placeholderText}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                  />
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color={COLORS.primary}
                    style={styles.inputIcon}
                    onPress={() => setShowPassword(!showPassword)}
                  />
                </View>
              </View>

              {/* Botão de cadastro */}
              <TouchableOpacity
                style={styles.button}
                onPress={handleSignUp}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Cadastrar</Text>
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Já tem uma conta?</Text>
            
                <TouchableOpacity onPress={() => router.replace("/(auth)")}>
                    <Text style={styles.link}>Entrar</Text>
                </TouchableOpacity>
              
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
