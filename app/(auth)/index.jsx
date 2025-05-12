import {
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Alert,
} from "react-native";
import { Link, useRouter } from "expo-router";
import { Image } from "expo-image";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import styles from "../../assets/styles/loginStyles";
import COLORS from "../../constants/colors";
import { useAuthStore } from "../../store/authStore";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { isLoading, login } = useAuthStore();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Erro", "Por favor, preencha todos os campos");
      return;
    }

    const result = await login(email, password);

    if (result.success) {
      Alert.alert("Sucesso", "Login realizado com sucesso!", [
        { 
          text: "OK", 
          onPress: () => router.replace("/(tabs)") 
        }
      ]);
    } else {
      Alert.alert("Erro", result.message || "Erro ao fazer login");
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: COLORS.background }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={50}
    >
      <ScrollView
        style={{ flex: 1, backgroundColor: COLORS.background }}
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.container, { backgroundColor: COLORS.background }]}>

          {/* Ilustração no topo */}
          <View style={styles.topIllustration}>
            <Image
              source={require("../../assets/images/iw.png")}
              style={styles.illustrationImage}
            />
          </View>

          {/* Card do formulário */}
          <View style={styles.card}>
            <View style={styles.formContainer}>
              {/* Campo de email */}
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

              {/* Campo de senha */}
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

              {/* Botão de login */}
              <TouchableOpacity
                style={styles.button}
                onPress={handleLogin}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Entrar</Text>
                )}
              </TouchableOpacity>

              <View style={styles.footer}>
                <Text style={styles.footerText}>Ainda não tem uma conta?</Text>
                <Link href="/signup" asChild>
                  <TouchableOpacity>
                    <Text style={styles.link}>Cadastrar-se</Text>
                  </TouchableOpacity>
                </Link>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}